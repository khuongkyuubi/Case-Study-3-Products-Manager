const {mysql, query} = require("../config/controller");

class OrdersModel {
    constructor() {

    }

    // get all Customers
    async getOrders() {
        let orders = [];
        try {
            // safe from unescaped input
            const sql = `SELECT ?? , ?? , ??, ??
                         FROM ??
                         INNER JOIN ??
                         ON ?? = ??`;
            const selectSql = mysql.format(sql, ["customers.customerName", "orders.orderID", "orders.orderDate", "orders.orderTotalPrice", "orders", "customers", "orders.customerId", "customers.customerId"]);
            orders = await query(selectSql);

        } catch (err) {
            console.log(err.message);
        }
        return JSON.parse(JSON.stringify(orders));
    }

    // get All Customer Name
    async getCustomerName() {
        let customersName = [];
        try {
            // safe from unescaped input
            const sql = `SELECT ?? , ??
                         FROM ??`;
            const selectSql = mysql.format(sql, ["customerName", "customerID", "customers"]);
            customersName = await query(selectSql);

        } catch (err) {
            console.log(err.message);
        }
        return JSON.parse(JSON.stringify(customersName));
    }

    // get All Product
    async getAllProducts() {
        let productsList = [];
        try {
            // safe from unescaped input
            const sql = `SELECT ?? 
                         FROM ??`;
            const selectSql = mysql.format(sql, ["productName", "products"]);
            productsList = await query(selectSql);

        } catch (err) {
            console.log(err.message);
        }
        return JSON.stringify(productsList);
    }


    // add new Customers
    async addOrder(customerId, orderDate, productList) {
        try {
            // insert new order
            let createOrderSQL = `INSERT INTO ?? (??, ??) VALUES (?, ?)`;
            createOrderSQL = mysql.format(createOrderSQL, ["orders", "customerID", "orderDate", customerId, orderDate]);
            await query(createOrderSQL);

            // get orderId of newest Order
            let getNewOrderSQL = `SELECT MAX(??) AS ??  FROM ??`;
            getNewOrderSQL = mysql.format(getNewOrderSQL, ["orderID", "newOrderId", "orders"]);
            const newOrderId = (await query(getNewOrderSQL))[0]["newOrderId"];


            // create orders Detail
            let insertODetailSQL = `INSERT INTO ?? VALUES (?, ?, ?)`;
            for (const product of productList) {
                let createODetailSQL = mysql.format(insertODetailSQL, ["orderdetail", newOrderId, product[0], product[1]])
                await query(createODetailSQL);
            }

            // get total price
            let getTotalPriceSQL = `SELECT SUM(?? * ??) AS ??
                                    FROM ?? 
                                    INNER JOIN ??
                                    ON ?? = ??
                                    GROUP BY ??
                                    HAVING ?? = ?;`
            getTotalPriceSQL = mysql.format(getTotalPriceSQL, ["orderdetail.orderQuantity", "products.productPrice", "TotalPrice", "orderdetail", "products", "orderdetail.productId", "products.productId", "orderdetail.orderID", "orderdetail.orderID", newOrderId])

            let totalPrice = (await query(getTotalPriceSQL))[0]["TotalPrice"];
            // insert total price to orders

            let addTotalPriceSql = `UPDATE ?? SET ?? = ? WHERE ?? = ?`;
            addTotalPriceSql = mysql.format(addTotalPriceSql, ["orders", "orderTotalPrice", totalPrice, "orderID", newOrderId])

            await query(addTotalPriceSql)

        } catch (err) {
            console.log(err.message);
        }
    }


    // get customerID from Name
    async getOrderId(name) {
        try {
            const sql = `SELECT ?? FROM ?? WHERE ?? = ?`;
            const selectSql = mysql.format(sql, ["customerID", "customers", "customerName", name]);
            let productsList = await query(selectSql);
            return JSON.parse(JSON.stringify(productsList))[0];
        } catch (err) {
            console.log(err.message);
        }
    }


    // getDetailOrder
    async getDetailOrder(id, res) {
        try {
            let getDetailOrderSql = `SELECT ??, ??, ??, ??, 
                                    (?? * ??) AS ??, 
                                    ??, ??, ??, ??
                                    FROM ?? 
                                    INNER JOIN ?? 
                                    ON ?? = ??
                                    INNER JOIN ?? 
                                    ON  ?? = ??
                                    INNER JOIN ?? 
                                    ON ?? = ??
                                    WHERE ?? = ? ;`
            getDetailOrderSql = mysql.format(getDetailOrderSql, ["orderdetail.orderID", "products.productName", "orderdetail.orderQuantity", "products.productPrice", "orderdetail.orderQuantity", "products.productPrice", "price", "orders.customerID", "orders.orderDate", "orders.orderTotalPrice", "customers.customerName", "orderdetail", "products", "orderdetail.productId", "products.productId", "orders", "orderdetail.orderID", "orders.orderID", "customers", "customers.customerID", "orders.customerID", "orderdetail.orderID", id])
            let orderDetail = await query(getDetailOrderSql);
            return JSON.parse(JSON.stringify(orderDetail));
        } catch (err) {
            console.log(err.message);
        }


    }


    // get one Customer
    async getOneOrder(id) {
        try {
            // let order = [];
            // safe from unescaped input
            const sql = `SELECT ?? , ?? , ??, ??
                         FROM ??
                         INNER JOIN ??
                         ON ?? = ??
                         WHERE ?? =?`;
            const selectSql = mysql.format(sql, ["customers.customerName", "orders.orderID", "orders.orderDate", "orders.orderTotalPrice", "orders", "customers", "orders.customerId", "customers.customerId", "orders.orderID", id]);
            return await query(selectSql);

        } catch (err) {
            console.log(err.message);
        }
    }


    // delete Order
    async deleteOrder(id, orderID, res) {
        try {
            // delete all order detail with orderID
            let deleteOrdDetailSql = `DELETE FROM ?? WHERE ?? = ?; `;
            deleteOrdDetailSql = mysql.format(deleteOrdDetailSql, ["orderdetail", "orderID", orderID]);
            await query(deleteOrdDetailSql);

            // delete order
            let deleteOrderSql = `DELETE FROM ?? WHERE ?? = ?;`;
            deleteOrderSql = mysql.format(deleteOrderSql, ["orders", "orderID", orderID])
            await query(deleteOrderSql);
        } catch (err) {
            return res.end(err.message);
        }
    }

    // get product list by orderID

    async getProductList(orderID) {
        try {
            let getProductListSql = `SELECT ??, ?? , ??, ??
                                     FROM ?? 
                                     INNER JOIN ??
                                     ON ?? = ??
                                     WHERE ?? = ?;`;

            getProductListSql = mysql.format(getProductListSql, ["orderdetail.orderID","orderdetail.productId", "orderdetail.orderQuantity","products.productName", "orderdetail","products","orderdetail.productId","products.productId","orderdetail.orderID", orderID]);
            let ProductList = await query(getProductListSql)
            return JSON.parse(JSON.stringify(ProductList));

        } catch (err) {
            console.log(err.message);
        }




    }


    // update Customer
    async updateOrder(orderID, customerId, orderDate, productList, res) {
        try {
            // update customerID and orderDate in order table
            const sqlUpdate = `UPDATE ?? 
                         SET ?? = ? ,?? = ?
                         WHERE ?? = ?; `;
            const updateSql = mysql.format(sqlUpdate, ["orders", "customerID", customerId, "orderDate",orderDate, "orderID", orderID]);
            await query(updateSql);

            // delete all old orderdetail
            let sqlDelete = `DELETE FROM ?? WHERE ?? =?;`;
            sqlDelete = mysql.format(sqlDelete, ["orderdetail", "orderID", orderID]);
            await query(sqlDelete);

            // add new orderdetail
            let newOrderId = orderID
            // create orders Detail
            let insertODetailSQL = `INSERT INTO ?? VALUES (?, ?, ?)`;
            for (const product of productList) {
                let createODetailSQL = mysql.format(insertODetailSQL, ["orderdetail", newOrderId, product[0], product[1]])
                await query(createODetailSQL);
            }

            // get total price
            let getTotalPriceSQL = `SELECT SUM(?? * ??) AS ??
                                    FROM ?? 
                                    INNER JOIN ??
                                    ON ?? = ??
                                    GROUP BY ??
                                    HAVING ?? = ?;`
            getTotalPriceSQL = mysql.format(getTotalPriceSQL, ["orderdetail.orderQuantity", "products.productPrice", "TotalPrice", "orderdetail", "products", "orderdetail.productId", "products.productId", "orderdetail.orderID", "orderdetail.orderID", newOrderId])

            let totalPrice = (await query(getTotalPriceSQL))[0]["TotalPrice"];
            // insert total price to orders

            let addTotalPriceSql = `UPDATE ?? SET ?? = ? WHERE ?? = ?`;
            addTotalPriceSql = mysql.format(addTotalPriceSql, ["orders", "orderTotalPrice", totalPrice, "orderID", newOrderId])

            await query(addTotalPriceSql)



        } catch (err) {
            res.end(err.message);
        }
    }

}

module.exports = new OrdersModel();