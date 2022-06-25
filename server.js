const http = require("http");
require("dotenv").config(); // using .env file
const PORT = process.env.PORT || 4000;
const util = require("util");
const url = require("url");
const router = require("./router/router")
const fs = require("fs");
const cookie = require("cookie");

const server = http.createServer((req, res) => {
    // check login
    // lay token tu cookie
    let loginRoute = url.parse(req.url).pathname === "/login";

    let cookies = cookie.parse(req.headers.cookie || '');
    let token = cookies.sessionId;
    let now = Date.now();
    const filesDefences = req.url.match(/\.js|\.css|\.html|\.jpg/);
    let tokenName = __dirname + "/token/" + token;
    let checkStatus = fs.existsSync(tokenName);

    // clear token if experied
    if (checkStatus) {
        let userInfo = fs.readFileSync(tokenName)
        userInfo = JSON.parse(String(userInfo));
        if (userInfo.expires < now) {
            fs.unlink(tokenName, () => {
                console.log("Delete expried token session")
            })
        }
    }

    // if you not login or login expried

    if (!loginRoute && !filesDefences) {
        if ((!token || !checkStatus)) {
            res.writeHead(301, {
                Location: "/login"
            })
            return res.end();
        }
    }
    if (loginRoute && token && checkStatus) {
        res.writeHead(301, {
            Location: "/"
        })
        return res.end();
    }


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

