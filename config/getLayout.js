const fs = require("fs");
module.exports = {
    getLayout() {
        return fs.readFileSync("./views/layouts/main.html", "utf-8");
    }

}