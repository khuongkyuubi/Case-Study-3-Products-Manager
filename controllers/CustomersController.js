const {fs, mysql, query, qs, url, path, getLayout} = require("../config/controller")
const customersModel = require("../models/CustomersModel")

class CustomersController {
    constructor() {
    }

    static getLayout() {
        return fs.readFileSync("./views/layouts/main.html", "utf-8");
    }


    async customers(req, res) {
        let valueSearch = url.parse(req.url, true).query.value;
        if (req.method === "GET") {
            let html = '';
            const customers = await customersModel.getCustomers()
            customers.forEach((customer, index) => {
                try {
                    if (customer) {
                        html += '<tr>';
                        html += `<td>${index + 1}</td>`
                        html += `<td>${customer["customerName"]}</td>`
                        html += `<td>${customer["customerAge"]}</td>`
                        html += `<td><a href="/customers/delete?id=${customer["customerID"]}&index=${index}"><button class="btn btn-danger">Delete</button></a></td>`
                        html += `<td><a href="/customers/update?id=${customer["customerID"]}&index=${index}"><button class="btn btn-primary">Update</button></a></td>`
                        html += '</tr>';
                    }
                } catch (err) {
                    console.log(err.message);
                }
            });
            let data = "";
            try {
                data = fs.readFileSync('./views/customers/customers.html', 'utf-8');
            } catch (err) {
                console.log(err.message);
                data = err.message;
            }

            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{list-customers}', html);
            let display = getLayout.getLayout().replace('{content}', data)
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
            fs.readFile('./views/customers/create.html', 'utf-8', function (err, data) {
                if (err) {
                    console.log(err);
                }
                let html = "";
                res.writeHead(200, {'Content-Type': 'text/html'});
                html = CustomersController.getLayout().replace('{content}', data);
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
                let customer = qs.parse(data);

                await customersModel.addCustomer(customer);
                // -- end
                res.writeHead(302, {
                    location: "/customers"
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
            const customer = await customersModel.getOneCustomer(id)
            if (!customer) {
                res.writeHead(302, {
                    location: "/customers"
                });
                return res.end();
            }
            try {
                html += '<tr>';
                html += `<td>${parseInt(index) + 1}</td>`
                html += `<td>${customer["customerName"]}</td>`
                html += `<td>${customer["customerAge"]}</td>`
                html += `<td>
                                     <form  method="POST">
                                       <button type="submit" class="btn btn-danger">Delete</button>
                                     </form>
                              </td>`
                html += `<td><a href="/customers/update?id=${customer["customerID"]}&index=${index}"><button class="btn btn-primary">Update</button></a></td>`
                html += '</tr>';

            } catch (err) {
                html = "Load data fail!";
                console.log(err.message);
            }
            let data = "";
            try {
                data = fs.readFileSync('./views/customers/delete.html', 'utf-8')
            } catch (err) {
                data = err.message;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{delete-customer}', html);
            let display = CustomersController.getLayout().replace('{content}', data)
            res.write(display);
            return res.end();

        } else {

            await customersModel.deleteCustomer(id, res)

            res.writeHead(302, {
                location: "/customers"
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
            let customer = (await customersModel.getOneCustomer(id));
            // return res.end("sdf")
            fs.readFile('./views/customers/update.html', 'utf-8', function (err, data) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                data = data.replace(/{customer-index}/gim, parseInt(index));
                data = data.replace(/{customer-id}/gim, parseInt(id));
                data = data.replace('{customer-name}', customer['customerName']);
                data = data.replace('{customer-age}', customer['customerAge']);
                // xử lý selected
                html = CustomersController.getLayout().replace('{content}', data);
                res.write(html);
                return res.end();
            });

            // } catch (err) {
            //     html = "Load data fail!";
            //     console.log(err.message);
            //     res.write(html);
            //     return res.end();
            // }
        } else {
            let data = "";
            req.on('data', chunk => {
                data += chunk;
            })
            req.on('end', async () => {
                let customer = qs.parse(data);

                await customersModel.updateCustomer(id, res, customer);

                res.writeHead(302, {
                    location: "/customers"
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
                Location: "/customers"
            })
            return res.end();
        }

        if (req.method === "GET") {
            let html = '';
            let customers = await customersModel.searchCustomers(value);
            // color search key word
            const replacer = (match) => {
                return `<strong style="color: orangered">${match}</strong>`;
            }

            let regExp = new RegExp(valueSearch, 'gim');
            //html = html.replace(regExp, replacer);

            if (customers.length !== 0) {
                customers.forEach((customer, index) => {
                    try {
                        if (customer) {
                            html += '<tr>';
                            html += `<td>${index + 1}</td>`
                            html += `<td>${customer["customerName"].replace(regExp, replacer)}</td>`
                            html += `<td>${customer["customerAge"].toString().replace(regExp, replacer)}</td>`


                            html += `<td><a href="/customers/delete?id=${customer["customerID"]}&index=${index}"><button class="btn btn-danger">Delete</button></a></td>`
                            html += `<td><a href="/customers/update?id=${customer["customerID"]}&index=${index}"><button class="btn btn-primary">Update</button></a></td>`
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
                data = fs.readFileSync('./views/customers/customers.html', 'utf-8');
            } catch (err) {
                console.log(err.message);
                data = err.message;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.replace('{list-customers}', html);
            let display = getLayout.getLayout().replace('{content}', data);
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


}

module.exports = CustomersController;