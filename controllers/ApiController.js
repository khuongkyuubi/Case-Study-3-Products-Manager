const {fs, mysql, query, qs, url, path, getLayout} = require("../config/controller")
const apiModel = require("../models/ApiModel")

class AplController {
    constructor() {
    }

    async getProductsList(req, res) {
        if (req.method === "GET") {
            const productsList = await apiModel.getAllProducts();
            res.writeHead(200, "utf-8", "Content-Type", "application/json");
            res.write(productsList);
            return res.end();

        } else {
            // If method === "POST"
        }
    }


}

module.exports = new AplController();