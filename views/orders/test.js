const {mysql} = require("../../config/controller");
function getDetailOrder(id) {

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
    console.log(getDetailOrderSql)


}
getDetailOrder(17)