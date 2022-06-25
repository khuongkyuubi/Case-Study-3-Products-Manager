const fs = require("fs");

module.exports = {
    getView(fileFolder, filePath) {
        return fs.readFileSync(`./views/${fileFolder}/${filePath}`, "utf-8");
    }

}