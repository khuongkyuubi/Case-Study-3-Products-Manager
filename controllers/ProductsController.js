const fs = require("fs");
// const ProductsModule = require("../models/ProductsModel");
const ProductsModule = require("../config/db");
const mysql = require("mysql");
const util = require("util");
const connectionDB = new ProductsModule();
const connection = connectionDB.connect();
const query = util.promisify(connection.query).bind(connection);
const qs = require("qs");
const url = require("url");

class Handler {
    constructor() {
    }

    static getLayout() {
        return fs.readFileSync("./views/layouts/main.html", "utf-8");
    }


    async products(req, res) {
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
                data = fs.readFileSync('./views/products.html', 'utf-8');
            } catch (err) {
                console.log(err.message);
                data = err.message;
            }

            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{list-products}', html);
            let display = Handler.getLayout().replace('{content}', data)
            res.write(display);
            return res.end();
        } else {
            // If method === "POST"
        }
    }

    // /create
    async create(req, res) {

        if (req.method === "GET") {
            fs.readFile('./views/create.html', 'utf-8', function (err, data) {
                if (err) {
                    console.log(err);
                }
                let html = "";
                res.writeHead(200, {'Content-Type': 'text/html'});
                html = Handler.getLayout().replace('{content}', data);
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
                data = fs.readFileSync('./views/delete.html', 'utf-8')
            } catch (err) {
                data = err.message;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{delete-user}', html);
            let display = Handler.getLayout().replace('{content}', data)
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

                fs.readFile('./views/update.html', 'utf-8', function (err, data) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    data = data.replace(/{product-index}/gim, parseInt(index));
                    data = data.replace(/{product-id}/gim, parseInt(id));
                    data = data.replace('{product-name}', product.productName);
                    data = data.replace('{product-detail}', product.productDetail);
                    // xử lý selected
                    data = data.replace(`{type-${product.productType}}`, "selected");
                    data = data.replace('{product-price}', product.productPrice);
                    html = Handler.getLayout().replace('{content}', data);
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


    notfound(req, res) {
        res.end("404 Not Found");
    }


}

module.exports = Handler;