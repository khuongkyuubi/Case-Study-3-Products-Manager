const ProductsController = require("../controllers/ProductsController");
const productController = new ProductsController();
// const router = {}

module.exports = {
    "products" : productController.products,
    "create": productController.create,
    "delete": productController.delete,
    "update": productController.update,
    "notfound" : productController.notfound,
    "products/search" : productController.search


};



// module.exports = router;
// router["products"] = handlers.products;
// router["create"] = handlers.create;
// router["delete"] = handlers.delete;
// router["update"] = handlers.update;
