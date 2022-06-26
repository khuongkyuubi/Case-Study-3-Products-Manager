const {mysql, query} = require("../config/controller");

class UsersModel {
    constructor() {

    }


    async getUser(userName, passWord) {
        try {
            let checkUserSql = `SELECT * FROM ?? WHERE ?? = ? AND ?? = ? LIMIT 1;`;
            checkUserSql = mysql.format(checkUserSql, ["users", "userName", userName, "userPassword", passWord]);
            return (await query(checkUserSql));
        } catch (err) {
            console.log(err.message);
        }
    }

    async getByUserName(userName) {
        try {
            let checkUserSql = `SELECT * FROM ?? WHERE ?? = ? ;`;
            checkUserSql = mysql.format(checkUserSql, ["users", "userName", userName]);
            return (await query(checkUserSql));
        } catch (err) {
            console.log(err.message);
        }
    }

    // create user heere
    async createUser(user) {
        let userRole = 2;
        if (user["is-admin"]) {
            userRole = 1;
        }

        try {
            let createUserSql = `INSERT INTO ??(??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?);`;
            createUserSql = mysql.format(createUserSql, ["users", "userName", "userPassword", "email", "fullname", "role", user["username"], user["passWord"], user["email"], user["full-name"], userRole]);
            console.log(createUserSql)
            await query(createUserSql);
        } catch (err) {
            console.log(err.message);
        }
    }
}

module.exports = new UsersModel();