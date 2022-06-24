const {mysql, query} = require("../config/controller");

class ApiModel {
    // get All Product
    async getAllProducts() {
        let productsList = [];
        try {
            // safe from unescaped input
            const sql = `SELECT ?? , ??
                         FROM ??`;
            const selectSql = mysql.format(sql, ["productName", "productId", "products"]);
            productsList = await query(selectSql);

        } catch (err) {
            console.log(err.message);
        }
        return JSON.stringify(productsList);
    }

}

module.exports = new ApiModel();