const url = require("url");
const cookie = require("cookie");
const fs = require("fs");
module.exports = function isLogined(req, res) {

    let loginRoute = url.parse(req.url).pathname === "/login";
    let adminRoute = url.parse(req.url).pathname === "/";
    let route = url.parse(req.url).pathname;
    let trimPath = route.replace(/^\/+|\/+$/g, '');


    let cookies = cookie.parse(req.headers.cookie || '');
    let token = cookies.sessionId;
    let now = Date.now();
    const filesDefences = (/\.js|\.css|\.html|\.jpg/).test(req.url);
    let tokenName = "token/" + token;
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
    return !!(token && checkStatus);
}