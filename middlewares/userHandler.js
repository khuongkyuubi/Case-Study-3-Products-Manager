const view = require("../config/getView");
const userHandler = {};
const escape = require('escape-html');
const fs = require("fs");
const path = require("path");
const cookie = require("cookie");
module.exports = userHandler;
userHandler.createTokenSession = function (req, res, data, strLength, isRememberPass) {
    // tạo 1 random string làm token
    let possibleCharacter = 'abcdefghiklmnopqwerszx1234567890';
    let token = '';
    strLength = typeof (strLength) === 'number' && strLength > 0 ? strLength : 10;
    for (let i = 0; i < strLength; i++) {
        let randomCharacter = possibleCharacter.charAt(Math.floor(Math.random() * possibleCharacter.length));
        token += randomCharacter;
    }


    // tạo 1 session lưu vào folder token với token là tên file (key)
    let fileName = './token/' + token;
    if (typeof data !== "string") {
        data = JSON.stringify(data);
    }
    try {
        fs.writeFileSync(fileName, data, err => {
        })
    } catch (err) {
        console.log(err.message)
    }

    //- Tạo thời gian hết hạn cho sessionId
    let sessionLifeTime = 60 * 60 * 24 // 1 day
    data.expires = Date.now() + sessionLifeTime * 1000;
    data.maxAge = sessionLifeTime;
    // seting set Cookie
    let cookieSetting = {}
    if (isRememberPass) {
        cookieSetting = {
            httpOnly: true,
            maxAge: sessionLifeTime // 1 week
        }
    } else {
        cookieSetting = {
            httpOnly: true
        }
    }
    console.log(isRememberPass)
    console.log(cookieSetting)

    // response header with cookie
    console.log(JSON.parse(data)["role"].toString())
    console.log(token)


    try {
        // res.setHeader('Set-Cookie', cookie.serialize([
        //     `sessionId = ${String(token)}`,
        //     `userRole = ${JSON.parse(data)["role"].toString()}`
        // ], cookieSetting));
        res.setHeader('Set-Cookie', cookie.serialize('sessionId', String(token), cookieSetting));

    } catch (err) {
        console.log(err.message)
    }
}


userHandler.admin = function (req, res, user, isRememberPass) {
    this.createTokenSession(req, res, user, 10, isRememberPass);
    // Redirect back after setting cookie
    res.statusCode = 302;
    // res.setHeader('Location', req.headers.referer || '/');
    res.setHeader('Location', '/');
    return res.end();

}
userHandler.user = function (req, res, user) {
    return res.end(user.userName + " is user");


}

userHandler.banned = function (req, res, user) {
    res.writeHead(301, {Location: "/403.html"})
    return res.end();
}

userHandler.wrongPassword = function (req, res, user) {
    console.log(user)
    let password = user.rawPass;
    console.log(password)
    let display = view.getView("users", "login.html");
    display = display.replace("{hidden}", "");
    display = display.replace("{user-name}", `${user.userName}`);
    display = display.replace("{user-name}", `${user.userName}`);
    display = display.replace("{password}", escape(password));
    if (user.showPass === "on") {
        display = display.replace("{showPass-checked}", "checked");
        display = display.replace("{inputPasswordType}", "text");
    } else {
        display = display.replace("{showPass-checked}", "");
        display = display.replace("{inputPasswordType}", "password");
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(display);
    return res.end();

}