const {fs, mysql, query, qs, url, path, getLayout} = require("../config/controller")
const ordersModel = require("../models/OrdersModel")
const apiModel = require("../models/ApiModel")

class OrdersController {
    constructor() {
    }

    static getLayout(req, res) {
        return getLayout.getLayout(req, res);
    }


    static getProductListInfo(order) {
        // get new order list (customerId, orderDate, productList)
        let {customer_id: customerId, order_date: orderDate, ...products} = order;

        let keys = Object.keys(products);

        let productList = []
        for (let i = 0; i < keys.length; i += 2) {
            let temObj = [];
            for (let j = i; j < i + 2; j++) {
                let key = keys[j]
                temObj.push(products[key]);
            }
            productList.push(temObj)
        }
        // console.log("list ", productList)

        // group duplicate id (using Map)
        const listID = new Map();

        productList.forEach(product => {
            if (listID.has(product[0])) {
                let value = listID.get(product[0]);
                value = +value + +product[1];
                listID.set(product[0], value)
            } else {
                listID.set(product[0], +product[1])
            }
        })

        // console.log(listID)

        // convert listID map to Array

        productList = Array.from(listID, ([name, value]) => ([name, value]));
        return {productList, customerId, orderDate}
    }


    async orders(req, res) {
        let valueSearch = url.parse(req.url, true).query.value;
        if (req.method === "GET") {
            let html = '';
            const orders = await ordersModel.getOrders()
            orders.forEach((order, index) => {
                try {
                    if (order) {
                        order["orderDate"] = (new Date(order["orderDate"])).toLocaleDateString("vi");
                        html += '<tr>';
                        html += `<td>${index + 1}</td>`
                        html += `<td>${order["orderID"]}</td>`
                        html += `<td>${order["customerName"]}</td>`
                        html += `<td>${order["orderDate"]}</td>`
                        html += `<td>${order["orderTotalPrice"]}</td>`
                        html += `<td><a href="/orders/detail?id=${order["orderID"]}&index=${index}"><button class="btn btn-warning text-light">Detail</button></a></td>`
                        html += `<td><a href="/orders/delete?id=${order["orderID"]}&index=${index}"><button class="btn btn-danger">Delete</button></a></td>`
                        html += `<td><a href="/orders/update?id=${order["orderID"]}&index=${index}"><button class="btn btn-primary">Update</button></a></td>`
                        html += '</tr>';
                    }
                } catch (err) {
                    console.log(err.message);
                }
            });
            let data = "";
            try {
                data = fs.readFileSync('./views/orders/orders.html', 'utf-8');
            } catch (err) {
                console.log(err.message);
                data = err.message;
            }

            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{list-orders}', html);
            let display = getLayout.getLayout(req, res).replace('{content}', data)
            res.write(display);
            return res.end();
        } else {
            // If method === "POST"
        }
    }

    // /create
    async create(req, res) {

        if (req.method === "GET") {
            let customersName = [];
            fs.readFile('./views/orders/create.html', 'utf-8', async function (err, data) {
                if (err) {
                    console.log(err);
                }
                let html = "";
                let cNameOption = "";
                res.writeHead(200, {'Content-Type': 'text/html'});
                // add Customers Name to option

                customersName = await ordersModel.getCustomerName();
                customersName.forEach((customer) => {
                    cNameOption += `<option value="${customer["customerID"]}">${customer["customerName"]}</option>`
                })
                data = data.replace('{customer-name}', cNameOption)
                html = OrdersController.getLayout(req, res).replace('{content}', data);
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
                let order = qs.parse(data);

                let {productList, customerId, orderDate} = OrdersController.getProductListInfo(order);

                await ordersModel.addOrder(customerId, orderDate, productList);
                // -- end
                res.writeHead(302, {
                    location: "/orders"
                });
                return res.end();
            })

            req.on('error', () => {
                console.log('error')
            })
        }
    }

    // get detail orders
    async detail(req, res) {
        let index = url.parse(req.url, true).query.index;
        let id = url.parse(req.url, true).query.id;
        if (req.method === "GET") {
            let html = '';
            const orderDetail = await ordersModel.getDetailOrder(id)
            // console.log(orderDetail)
            // return res.end(`${id}`);
            html += `Order ID: <b>${orderDetail[0]["orderID"]}</b>`
            html += `<tr><td colspan="3">Customer: <b>${orderDetail[0]["customerName"]}</b></td></tr>`
            html += `<tr><td colspan="5">Date order: <b>${orderDetail[0]["orderDate"] = (new Date(orderDetail[0]["orderDate"])).toLocaleDateString("vi")}</b></td></tr>`
            html += `<tr>
                        <th>#</th>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Price</th>
                      </tr>`
            orderDetail.forEach((orderDetail, index) => {
                try {
                    if (orderDetail) {
                        // orderDetail["orderDate"] = (new Date(orderDetail["orderDate"])).toLocaleDateString("vi");
                        html += '<tr>';
                        html += `<td>${index + 1}</td>`
                        html += `<td>${orderDetail["productName"]}</td>`
                        html += `<td>${orderDetail["orderQuantity"]}</td>`
                        html += `<td>${orderDetail["productPrice"]}</td>`
                        html += `<td>${orderDetail["price"]}</td>`;
                        html += '</tr>';
                    }
                } catch (err) {
                    console.log(err.message);
                }
            });
            html += `<tr><td colspan="3"></td><td>Total Price:</td> <td><b>${orderDetail[0]["orderTotalPrice"]}</b></td></tr>`

            let data = "";
            try {
                data = fs.readFileSync('./views/orders/order-detail.html', 'utf-8');
            } catch (err) {
                console.log(err.message);
                data = err.message;
            }

            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{order-detail}', html);
            data = data.replace(/{order-ID}/gim, id);
            data = data.replace(/{order-index}/gim, index);
            let display = getLayout.getLayout(req, res).replace('{content}', data)
            res.write(display);
            return res.end();
        } else {
            // If method === "POST"
        }
    }


    // /delete
    async delete(req, res) {
        let index = url.parse(req.url, true).query.index;
        let id = url.parse(req.url, true).query.id;
        let order = (await ordersModel.getOneOrder(id))[0];
        if (req.method === "GET") {
            let html = '';
            order["orderDate"] = new Date(order["orderDate"]).toLocaleDateString("vi");
            // return res.end("")
            if (!order) {
                res.writeHead(302, {
                    location: "/orders"
                });
                return res.end();
            }
            try {
                html += '<tr>';
                html += `<td>${parseInt(index) + 1}</td>`
                html += `<td>${order["orderID"]}</td>`
                html += `<td>${order["customerName"]}</td>`
                html += `<td>${order["orderDate"]}</td>`
                html += `<td>${order["orderTotalPrice"]}</td>`
                html += `<td><a href="/orders/detail?id=${order["orderID"]}&index=${index}"><button class="btn btn-warning text-light">Detail</button></a></td>`
                html += `<td>
                                     <form  method="POST">
                                       <button type="submit" class="btn btn-danger">Delete</button>
                                     </form>
                              </td>`
                html += `<td><a href="/orders/update?id=${order["orderID"]}&index=${index}"><button class="btn btn-primary">Update</button></a></td>`
                html += '</tr>';

            } catch (err) {
                html = "Load data fail!";
                console.log(err.message);
            }
            let data = "";
            try {
                data = fs.readFileSync('./views/orders/delete.html', 'utf-8')
            } catch (err) {
                data = err.message;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{delete-order}', html);
            let display = OrdersController.getLayout(req, res).replace('{content}', data)
            res.write(display);
            return res.end();

        } else {
            // console.log(order, id)
            // return res.end("")
            await ordersModel.deleteOrder(id, order["orderID"], res);

            res.writeHead(302, {
                location: "/orders"
            });
            return res.end();
        }
    }

    // /update a record
    async update(req, res) {
        let index = url.parse(req.url, true).query.index;
        let id = url.parse(req.url, true).query.id;
        if (req.method === "GET") {
            let html = '';
            let cNameOption = "";
            let productsList = "";
            try {
                // get order
                let order = (await ordersModel.getOneOrder(id))[0];
                // convert date format to show
                let date = new Date(order["orderDate"]).toJSON()
                date = date.slice(0, date.length - 14)
                let customersName = await ordersModel.getCustomerName();
                // get {customer-name}
                customersName.forEach((customer) => {
                    if (customer["customerName"] === order["customerName"]) {
                        cNameOption += `<option value="${customer["customerID"]}" selected>
                                ${customer["customerName"]}
                                </option>`
                    } else {
                        cNameOption += `<option value="${customer["customerID"]}">
                                ${customer["customerName"]}
                                </option>`
                    }
                })

                // get product list
                let ProductList = await ordersModel.getProductList(order["orderID"]);

                // get all product list
                let allProductList = await apiModel.getAllProducts();
                allProductList = JSON.parse(allProductList)

                function getProductListOptions(allProductList, productName) {
                    let html = "";
                    allProductList.forEach(product => {
                        if (product["productName"] === productName) {
                            html += `<option value="${product["productId"]}" selected>${product["productName"]}</option>`
                        } else {
                            html += `<option value="${product["productId"]}">${product["productName"]}</option>`
                        }
                    })
                    return html;
                }

                ProductList.forEach((product, index) => {

                    productsList += `<div class="row">
                    <div class="col">
                    <label for="products-list" class="form-label">Choose product ${index + 1}</label>
                    <span class="products-list text-danger"><i class="fa fa-times-circle" aria-hidden="true"></i></span>
                    <select name="product-id-${index}" class="form-select" id="products-list" required>
                        ${getProductListOptions(allProductList, product["productName"])}
                    </select>
                </div>
                <div class="col">
                        <label for="quantity-${index}" class="form-label">Quantity product  ${index + 1}</label>
                    <input type="number" class="form-control" id="quantity-${index}" name="quantity-${index}" placeholder="Quantity"  value = ${product["orderQuantity"]} required>
                </div>
                </div>`
                })

                fs.readFile('./views/orders/update.html', 'utf-8', function (err, data) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    data = data.replace(/{order-date}/gim, date);
                    data = data.replace(/{customer-name}/gim, cNameOption);
                    data = data.replace('{product-list}', productsList);
                    data = data.replace(/{order-id}/gim, id);
                    data = data.replace(/{order-index}/gim, index);
                    // xử lý selected
                    html = OrdersController.getLayout(req, res).replace('{content}', data);
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
                let order = qs.parse(data);
                let orderID = id;
                let {productList, customerId, orderDate} = OrdersController.getProductListInfo(order);

                await ordersModel.updateOrder(orderID, customerId, orderDate, productList,res);

                res.writeHead(302, {
                    location: "/orders"
                });
                return res.end();
            })

            req.on('error', () => {
                console.log('error')
            })
        }
    }

}

module.exports = new OrdersController();