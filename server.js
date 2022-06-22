const http = require("http");
require("dotenv").config(); // using .env file
const PORT = process.env.PORT || 4000;
const util = require("util");
const Handler = require("./router/Handler");
const url = require("url");

// create new handler
const handlers = new Handler();

const server = http.createServer((req, res) => {


    let parseUrl = url.parse(req.url, true);
    let path = parseUrl.pathname;
    let trimPath = path.replace(/^\/+|\/+$/g, '');
    let chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
    chosenHandler(req, res);

// res.end("everything ok")
});







const router = {
    "products" : handlers.products,
    "create" : handlers.create,
    "delete" : handlers.delete,
    "update" : handlers.update

    //
    // "login" : handlers.login,


}


// server listening on port
server.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
})

