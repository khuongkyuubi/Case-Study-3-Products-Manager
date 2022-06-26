const cookie = require("cookie");
const fs = require("fs");
module.exports = function getSession(req, res) {
    let cookies = cookie.parse(req.headers.cookie || '');
    let token = cookies.sessionId || "notfound";
    let tokenName = "token/" + token;
    let checkStatus = fs.existsSync(tokenName);
    // clear token if experied
    if (checkStatus) {
        try {
            return JSON.parse(String(fs.readFileSync(tokenName)));
        } catch (err) {
            console.log("loi doc session")
            console.log(err.message)
        }
    }
    return  {}
}