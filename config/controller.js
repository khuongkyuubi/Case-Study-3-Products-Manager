const fs = require("fs");
// const ProductsModule = require("../models/ProductsModel");
const ProductsModel = require("./db");
const mysql = require("mysql");
const util = require("util");
const connectionDB = new ProductsModel();
const connection = connectionDB.connect();
const query = util.promisify(connection.query).bind(connection);
const qs = require("qs");
const url = require("url");
const path = require("path");
const getLayout = require("./getLayout")

module.exports = {fs,ProductsModel, mysql,util, connectionDB,
    connection, query,  qs, url, path, getLayout }