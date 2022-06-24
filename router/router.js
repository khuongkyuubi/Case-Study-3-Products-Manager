const ProductsController = require("../controllers/ProductsController");
const productController = new ProductsController();
const CustomersController = require("../controllers/CustomersController");
const customerController = new CustomersController();
const dashboardController = require("../controllers/DashboardController");
const orderController = require("../controllers/OrdersController")
const apiController = require("../controllers/ApiController")
// const router = {}

module.exports = {
    "": dashboardController.dashboard,
    "products": productController.products,
    "create": productController.create,
    "delete": productController.delete,
    "update": productController.update,
    "notfound": productController.notfound,
    "products/search": productController.search,
    "customers": customerController.customers,
    "customers/detail": customerController.detail,
    "customers/create": customerController.create,
    "customers/delete": customerController.delete,
    "customers/update": customerController.update,
    "customers/search": customerController.search,
    "orders": orderController.orders,
    "orders/create": orderController.create,
    "orders/delete": orderController.delete,
    "orders/update": orderController.update,
    "orders/detail": orderController.detail,
    "api/get-products-list": apiController.getProductsList


};


// module.exports = router;
// router["products"] = handlers.products;
// router["create"] = handlers.create;
// router["delete"] = handlers.delete;
// router["update"] = handlers.update;
