// const fs = require("fs");
// // const ProductsModule = require("../models/ProductsModel");
// const ProductsModel = require("../config/db");
// const mysql = require("mysql");
// const util = require("util");
// const connectionDB = new ProductsModel();
// const connection = connectionDB.connect();
// const query = util.promisify(connection.query).bind(connection);
// const qs = require("qs");
// const url = require("url");

const {fs, mysql, query, qs, url, path, getLayout} = require("../config/controller")

class ProductsController {
    constructor() {
    }

    static getLayout(req, res) {
        return getLayout.getLayout(req, res);
    }


    async products(req, res) {
        let valueSearch = url.parse(req.url, true).query.value;
        if (req.method === "GET") {
            let html = '';
            let products = [];
            try {
                // safe from unescaped input
                const sql = `SELECT * FROM ??`;
                const selectSql = mysql.format(sql, ["products"]);
                products = await query(selectSql);
            } catch (err) {
                console.log(err.message);
            } finally {
                // connection.end();
            }

            products = JSON.parse(JSON.stringify(products));
            products.forEach((product, index) => {
                try {
                    if (product) {
                        html += '<tr>';
                        html += `<td>${index + 1}</td>`
                        html += `<td>${product["productName"]}</td>`
                        html += `<td>${product["productDetail"]}</td>`
                        html += `<td>${product["productType"]}</td>`
                        html += `<td>${product["productPrice"]}</td>`
                        html += `<td><a href="/delete?id=${product["productId"]}&index=${index}"><button class="btn btn-danger">Delete</button></a></td>`
                        html += `<td><a href="/update?id=${product["productId"]}&index=${index}"><button class="btn btn-primary">Update</button></a></td>`
                        html += '</tr>';
                    }
                } catch (err) {
                    console.log(err.message);
                }
            });
            let data = "";
            try {
                data = fs.readFileSync('./views/products/products.html', 'utf-8');
            } catch (err) {
                console.log(err.message);
                data = err.message;
            }

            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{list-products}', html);
            let display = ProductsController.getLayout(req, res).replace('{content}', data)
            // replace search value
            if (valueSearch) {
                display = display.replace("{search-value}", valueSearch[0])
            } else {
                display = display.replace("{search-value}", "")
            }

            res.write(display);
            return res.end();
        } else {
            // If method === "POST"
        }
    }

    // /create
    async create(req, res) {

        if (req.method === "GET") {
            fs.readFile('./views/products/create.html', 'utf-8', function (err, data) {
                if (err) {
                    console.log(err);
                }
                let html = "";
                res.writeHead(200, {'Content-Type': 'text/html'});
                html = ProductsController.getLayout(req, res).replace('{content}', data);
                res.write(html);
                return res.end();
            });
            // when method === "POST"
        } else {
            let data = "";
            req.on('data', chunk => {
                data += chunk;
            })
            req.on('end', async () => {
                let product = qs.parse(data);

                try {
                    const sql = `INSERT INTO ?? (productName, productDetail, productType, productPrice) VALUES (?, ?, ?, ?)`;
                    const insertSql = mysql.format(sql, ["products", product["product-name"], product["product-detail"], product["product-type"], parseInt(product["product-price"])]);
                    await query(insertSql);

                } catch (err) {
                    console.log(err.message);
                }
                // -- end
                res.writeHead(302, {
                    location: "/products"
                });
                return res.end();
            })

            req.on('error', () => {
                console.log('error')
            })
        }
    }

    // /delete
    async delete(req, res) {
        let index = url.parse(req.url, true).query.index;
        let id = url.parse(req.url, true).query.id;
        if (req.method === "GET") {
            let html = '';
            const sql = `SELECT * FROM ?? WHERE ?? = ? LIMIT 1;`;
            // const selectProductSql = `SELECT * FROM products WHERE id = ${id} LIMIT 1;`;
            const selectProductSql = mysql.format(sql, ["products", "productId", parseInt(id)]);
            const product = (await query(selectProductSql))[0];
            if (!product) {
                res.writeHead(302, {
                    location: "/products"
                });
                return res.end();
            }
            try {
                html += '<tr>';
                html += `<td>${parseInt(index) + 1}</td>`
                html += `<td>${product["productName"]}</td>`
                html += `<td>${product["productDetail"]}</td>`
                html += `<td>${product["productType"]}</td>`
                html += `<td>${product["productPrice"]}</td>`
                html += `<td>
                                     <form  method="POST">
                                       <button type="submit" class="btn btn-danger">Delete</button>
                                     </form>
                              </td>`
                html += `<td><a href="/update?id=${product["productId"]}&index=${index}"><button class="btn btn-primary">Update</button></a></td>`
                html += '</tr>';

            } catch (err) {
                html = "Load data fail!";
                console.log(err.message);
            }
            let data = "";
            try {
                data = fs.readFileSync('./views/products/delete.html', 'utf-8')
            } catch (err) {
                data = err.message;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{delete-user}', html);
            let display = ProductsController.getLayout(req, res).replace('{content}', data)
            res.write(display);
            return res.end();

        } else {
            const sql = `DELETE FROM ?? WHERE ?? = ?; `;
            // const selectProductSql = `DELETE FROM products WHERE id = ${id} ; `;
            const selectProductSql = mysql.format(sql, ["products", "productId", parseInt(id)]);
            try {
                await query(selectProductSql);
            } catch (err) {
                return res.end(err.message);
            }
            res.writeHead(302, {
                location: "/products"
            });
            return res.end();
        }
    }

    // /update
    async update(req, res) {
        let index = url.parse(req.url, true).query.index;
        let id = url.parse(req.url, true).query.id;
        if (req.method === "GET") {
            let html = '';
            let product = {};
            try {
                const sql = `SELECT * FROM ?? WHERE ?? = ? LIMIT 1`;
                // const selectProductSql = `SELECT * FROM products WHERE id = ${id} LIMIT 1`;
                const selectProductSql = mysql.format(sql, ["products", "productId", parseInt(id)]);
                try {
                    product = (await query(selectProductSql))[0];
                } catch (err) {
                    console.log(err.message);
                }

                fs.readFile('./views/products/update.html', 'utf-8', function (err, data) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    data = data.replace(/{product-index}/gim, parseInt(index));
                    data = data.replace(/{product-id}/gim, parseInt(id));
                    data = data.replace('{product-name}', product.productName);
                    data = data.replace('{product-detail}', product.productDetail);
                    // xử lý selected
                    data = data.replace(`{type-${product.productType}}`, "selected");
                    data = data.replace('{product-price}', product.productPrice);
                    html = ProductsController.getLayout(req, res).replace('{content}', data);
                    res.write(html);
                    return res.end();
                });

            } catch (err) {
                html = "Load data fail!";
                console.log(err.message);
                res.write(html);
                return res.end();
            }
        } else {
            let data = "";
            req.on('data', chunk => {
                data += chunk;
            })
            req.on('end', async () => {
                let product = qs.parse(data);
                try {

                    const sql = `UPDATE ?? 
                                           SET ?? = ? ,?? = ?, ?? = ?, ?? = ?
                                           WHERE ?? = ? `;
                    const updateSql = mysql.format(sql, ["products", "productName", product["product-name"], "productDetail", product["product-detail"], "productType", product["product-type"], "productPrice", product["product-price"], "productId", parseInt(id)]);
                    await query(updateSql);

                } catch (err) {
                    res.end(err.message);
                }
                res.writeHead(302, {
                    location: "/products"
                });
                return res.end();
            })

            req.on('error', () => {
                console.log('error')
            })
        }
    }

    // /product/search
    async search(req, res) {

        let valueSearch = url.parse(req.url, true).query.value;
        let value = `%${valueSearch}%`;
        // let id = url.parse(req.url, true).query.id;
        if (!valueSearch) {
            res.writeHead(301, {
                Location: "/products"
            })
            return res.end();
        }

        if (req.method === "GET") {
            let html = '';
            let products = [];
            try {
                const sql = `SELECT * FROM ?? WHERE ?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ?? LIKE ?;`;
                // const selectProductSql = `SELECT * FROM products WHERE id = ${id} LIMIT 1;`;
                const searchProductSql = mysql.format(sql, ["products", "productName", value, "productDetail", value, "productType", value, "productPrice", value]);

                products = await query(searchProductSql);
                // return res.end("findProduct")
            } catch (err) {
                console.log(err.message)
            }
            products = JSON.parse(JSON.stringify(products));

            // color search key word
            const replacer = (match) => {
                return `<strong style="color: orangered">${match}</strong>`;
            }

            let regExp = new RegExp(valueSearch, 'gim');
            //html = html.replace(regExp, replacer);


            if (products.length !== 0) {
                products.forEach((product, index) => {
                    try {
                        if (product) {
                            html += '<tr>';
                            html += `<td>${index + 1}</td>`
                            html += `<td>${product["productName"].replace(regExp, replacer)}</td>`
                            html += `<td>${product["productDetail"].replace(regExp, replacer)}</td>`
                            html += `<td>${product["productType"].replace(regExp, replacer)}</td>`
                            html += `<td>${product["productPrice"].toString().replace(regExp, replacer)}</td>`
                            // html = html.replace(regExp, replacer);

                            html += `<td><a href="/delete?id=${product["productId"]}&index=${index}"><button class="btn btn-danger">Delete</button></a></td>`
                            html += `<td><a href="/update?id=${product["productId"]}&index=${index}"><button class="btn btn-primary">Update</button></a></td>`
                            html += '</tr>';
                        }
                    } catch (err) {
                        console.log(err.message);
                    }
                });
            } else {
                html = "<tr><td colspan='6'>No data found</td></tr>"
            }


            let data = "";
            try {
                data = fs.readFileSync('./views/products/products.html', 'utf-8');
            } catch (err) {
                console.log(err.message);
                data = err.message;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{list-products}', html);
            let display = ProductsController.getLayout(req, res).replace('{content}', data);
            // replace search value
            if (valueSearch) {
                display = display.replace("{search-value}", valueSearch)
            } else {
                display = display.replace("{search-value}", "")
            }
            res.write(display);
            return res.end();
        } else {
        }
    }


    notfound(req, res) {
        // create new mime
        const mimeTypes = {
            "html": "text/html",
            "js": "text/javascript",
            "css": "text/css",
            "jpg": "image/jpeg"

        };

        /* đọc file css/js */ // tạo static file for js file, css file
        const filesDefences = req.url.match(/\.js|\.css|\.html|\.jpg/);
        // console.log(filesDefences)
        if (filesDefences) {
            let type = filesDefences[0].toString().split('.')[1]
            const extension = mimeTypes[type];
            res.writeHead(200, {'Content-Type': extension});
            let filename = path.basename(req.url);

            let pathName = path.join("./", "public", type, filename);
            const readStream = fs.createReadStream(pathName);
            readStream.pipe(res);
            readStream.on('error', function (err) {
                console.log(err.message);
                return res.end("404 File not found");
            });
        } else {
            res.writeHead(404, {'Content-Type': "text/html"});
            let data = fs.readFileSync("./public/html/404.html");
            res.write(data);
            return res.end();
        }
    }


}

module.exports = ProductsController;