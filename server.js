const http = require("http");
require("dotenv").config(); // using .env file
const PORT = process.env.PORT || 4000;
const util = require("util");
const url = require("url");
const router = require("./router/router")
const fs = require("fs");


const server = http.createServer((req, res) => {

    // chia router
    let parseUrl = url.parse(req.url, true);
    let path = parseUrl.pathname;
    // const pathArr = path.split("/");
    // console.log(pathArr)
    // let route = "";
    // if (pathArr.length > 2) {
    //     let route = path.split("/")[1];
    // }
    //
    // console.log(route)
    let trimPath = path.replace(/^\/+|\/+$/g, '');
    // trimPath = trimPath.substring(0, route.length);
    // console.log(trimPath)
    // return res.end(trimPath)
    // switch (route) {
    //     case "" :
    let chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : router["notfound"];
    chosenHandler(req, res);
    // break;
    // }

});

// server listening on port
server.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
})

