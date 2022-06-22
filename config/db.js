const mysql = require("mysql");
const util = require("util");

class Database {
    constructor() {
    }
    connect() {
        return mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "mysql123456",
            database: "products_manager",
            charset: "utf8_general_ci"
        });

    }
    // query() {
    //     // node native promisify
    //     const connection = this.connect();
    //     return util.promisify(connection.query).bind(connection);
    // }

}

module.exports = Database;



