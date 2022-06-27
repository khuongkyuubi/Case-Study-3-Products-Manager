// const fs = require("fs");
// // const ProductsModule = require("../models/ProductsModel");
// const ProductsModel = require("../config/db");
// const mysql = require("mysql");
// const util = require("util");
// const connectionDB = new ProductsModel();
// const connection = connectionDB.connect();
// const query = util.promisify(connection.query).bind(connection);
// const qs = require("qs");
// const url = require("url");

const {fs, mysql, query, qs, url, path, getLayout} = require("../config/controller");
const view = require("../config/getView");
const md5 = require("md5");
const userModel = require("../models/UsersModel");
const userHandler = require("../middlewares/userHandler");
const cookie = require("cookie");

class UsersController {
    constructor() {
    }

    static getLayout(req, res) {
        return getLayout.getLayout(req, res);
    }


    async login(req, res) {
        if (req.method === "GET") {
            let display = view.getView("users", "login.html");
            display = display.replace("{hidden}", "hidden");
            display = display.replace("{user-name}", ``);
            display = display.replace("{password}", ``);
            display = display.replace("{showPass-checked}", ``);
            display = display.replace("{inputPasswordType}", `password`);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(display);
            return res.end();
        } else {
            // If method === "POST"
            let data = "";
            req.on('data', chunk => {
                data += chunk;
            })
            req.on('end', async () => {
                // get user from form and hash password with md5
                let user = qs.parse(data);
                user.userName = user["user-name"];
                delete user["user-name"];
                delete user["user-name"];
                user.rawPass = user.password;
                user.password = md5(user.password);
                user.remember = !!user.remember || false;
                // check user in DB
                let userLoginArr = (await userModel.getUser(user.userName, user.password));
                let userLogin = userLoginArr[0]

                // authen
                if (!userLoginArr.length) {
                    userHandler.wrongPassword(req, res, user);
                    return res.end();
                } else if (!userLogin.status) {
                    userHandler.banned(req, res, userLogin);
                    return res.end();
                }

                userHandler.admin(req, res, userLogin, user.remember);


                // switch (userLogin["role"]) {
                //     case 1:
                //         userHandler.admin(req, res, userLogin, user.remember);
                //         break;
                //     case 2:
                //         userHandler.user(req, res, userLogin);
                //         break;
                //     default:
                //         userHandler.banned(req, res, userLogin);
                //         return res.end();
                // }
                return res.end();

            })

            req.on('error', () => {
                console.log('error')
            })
        }


    }

    async register(req, res) {

        if (req.method === "GET") {
            let display = view.getView("users", "register.html");
            display = display.replace("{hidden}", "hidden");
            display = display.replace("{user-full-name}", ``);
            display = display.replace("{user-name}", ``);
            display = display.replace("{user-email}", ``);
            display = display.replace("{password}", ``);
            display = display.replace("{confirm-password}", ``);
            display = display.replace("{confirm-check}", `hidden`);
            display = display.replace("{isAdmin-checked}", ``);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(display);
            return res.end();
            // else method == Post
        } else {
            let data = "";
            req.on("data", chunk => {
                data += chunk;
            });

            req.on("end", async () => {
                let user = qs.parse(data);
                user["is-admin"] = !!user["is-admin"] || false;
                user["passWord"] = md5(user["password"]);

                // check if user is exists

                function displayRegister(userExists, pwNotMatch) {
                    let display = view.getView("users", "register.html");
                    display = display.replace("{hidden}", `${userExists}`);
                    display = display.replace("{user-full-name}", `${user["full-name"]}`);
                    display = display.replace("{user-name}", `${user["username"]}`);
                    display = display.replace("{user-email}", `${user["email"]}`);
                    display = display.replace("{password}", `${user["password"]}`);
                    display = display.replace("{confirm-password}", `${user["password-confirm"]}`);
                    display = display.replace("{confirm-check}", `${pwNotMatch}`);
                    if (user["isAmin"]) {
                        display = display.replace("{isAdmin-checked}", `checked`);
                    } else {
                        display = display.replace("{isAdmin-checked}", ``);

                    }
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(display);
                    return res.end();
                }

                let userName = user["username"];
                let findUser = (await userModel.getByUserName(userName));

                // console.log(findUser);
                if (findUser.length) {
                    displayRegister("", "hidden");
                    return res.end();
                } else {

                    if (user["password"] === user["password-confirm"]) {
                        await userModel.createUser(user);
                        res.writeHead(301, {
                            Location: "/login"
                        })
                    } else {
                        displayRegister("hidden", "");
                    }
                    return res.end();
                }
            })


        }
    }

    async logout(req, res) {
        console.log("da tung vao duoc logout")
        let cookies = cookie.parse(req.headers.cookie || '');
        let token = cookies.sessionId || "";
        // Delete cookies and token session
        let tokenName = __dirname + "/token/" + token;
        let checkStatus = fs.existsSync(tokenName);

        // clear token
        if (checkStatus) {
            fs.unlink(tokenName, () => {
                console.log("Delete expried token session")
            })
        }
        // response header with cookie
        try {
            res.setHeader('Set-Cookie', cookie.serialize('sessionId', "", {
                httpOnly: true,
                maxAge: 0 // delete
            }));
            res.writeHead(301, {
                Location: "/login"
            })
            return res.end();

        } catch (err) {
            console.log(err.message)
        }
    }

}

module.exports = new UsersController();