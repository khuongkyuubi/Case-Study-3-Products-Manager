const {mysql, query} = require("../config/controller");

class CustomersModel {
    constructor() {

    }

    // get all Customers
    async getCustomers() {
        let customers = [];
        try {
            // safe from unescaped input
            const sql = `SELECT ??, ??, ?? , COUNT(??) AS ??, SUM(??) AS ??
                            FROM ??
                            INNER JOIN ??
                            ON ?? = ??
                            GROUP BY ??;`;
            const selectSql = mysql.format(sql, ["customers.customerName", "customers.customerID", "customers.customerAge", "orders.customerID", "orderQuantity", "orders.orderTotalPrice", "totalPrice", "customers", "orders", "customers.customerID", "orders.customerID", "customers.customerID"]);
            customers = await query(selectSql);
        } catch (err) {
            console.log(err.message);
        }
        return customers = JSON.parse(JSON.stringify(customers));
    }


    // get Detail
    async getDetailCustomer(customerId) {
        try {

            let getDetailSql = `SELECT ??, ??, ??, ??, ??, ??
                                 FROM ??
                                 INNER JOIN ??
                                 ON ??= ??
                                 WHERE ?? = ?`;
            getDetailSql = mysql.format(getDetailSql, ["customers.customerName", "customers.customerID", "customers.customerAge", "orders.orderID", "orders.orderTotalPrice", "orders.orderDate", "customers", "orders", "customers.customerID", "orders.customerID", "customers.customerID", customerId]);
            return JSON.parse(JSON.stringify(await query(getDetailSql)));
        } catch (err) {
            console.log(err.message);
        }
    }

    // get total Price
    async getTotalPricePerCustomer(customerId) {
        let totalPriceSql = `SELECT customers.customerName, customers.customerID, SUM(orders.orderTotalPrice) AS totalPrice
FROM customers
INNER JOIN orders
ON customers.customerID = orders.customerID
GROUP BY customers.customerID
HAVING  customers.customerID  = ${customerId};`

        let totalPrice = await query(totalPriceSql);
        return JSON.parse(JSON.stringify(totalPrice))[0];


    }

    // add new Customers
    async addCustomer(customer) {
        try {
            const sql = `INSERT INTO ?? (customerName, customerAge) VALUES (?, ?)`;
            const insertSql = mysql.format(sql, ["customers", customer["customer-name"], customer["customer-age"]]);
            await query(insertSql);

        } catch (err) {
            console.log(err.message);
        }
    }

    // get one Customer
    async getOneCustomer(id) {
        const sql = `SELECT * FROM ?? WHERE ?? = ? LIMIT 1;`;
        // const selectProductSql = `SELECT * FROM products WHERE id = ${id} LIMIT 1;`;
        const selectCustomerSql = mysql.format(sql, ["customers", "customerID", parseInt(id)]);
        return (await query(selectCustomerSql))[0];
    }

    // delete Customer
    async deleteCustomer(id, res) {
        const sql = `DELETE FROM ?? WHERE ?? = ?; `;
        // const selectProductSql = `DELETE FROM products WHERE id = ${id} ; `;
        const deleteCustomerSql = mysql.format(sql, ["customers", "customerID", parseInt(id)]);
        try {
            await query(deleteCustomerSql);
        } catch (err) {
            return res.end(err.message);
        }
    }

    // update Customer
    async updateCustomer(id, res, customer) {
        try {

            const sql = `UPDATE ?? 
                                           SET ?? = ? ,?? = ?
                                           WHERE ?? = ? `;
            const updateSql = mysql.format(sql, ["customers", "customerName", customer["customer-name"], "customerAge", customer["customer-age"], "customerID", parseInt(id)]);
            await query(updateSql);

        } catch (err) {
            res.end(err.message);
        }


    }

    async searchCustomers(value) {
        let customers = [];
        try {
            const sql = `SELECT * FROM ?? WHERE ?? LIKE ? OR ?? LIKE ?;`;
            const searchProductSql = mysql.format(sql, ["customers", "customerName", value, "customerAge", value]);

            customers = await query(searchProductSql);
            // return res.end("findProduct")
        } catch (err) {
            console.log(err.message)
        }
        return JSON.parse(JSON.stringify(customers));
    }


}

module.exports = new CustomersModel();