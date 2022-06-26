const {url, mysql, query, fs, getLayout} = require("../config/controller");

class DashboardController {
    constructor() {
    }
    dashboard(req, res) {
        if (req.method === "GET") {
            let html = '';
            let data = "";
            try {
                data = fs.readFileSync('./views/dashboard/index.html', 'utf-8');
            } catch (err) {
                console.log(err.message);
                data = err.message;
            }

            res.writeHead(200, {'Content-Type': 'text/html'});
            let display = getLayout.getLayout(req, res).replace('{content}', data)
            res.write(display);
            return res.end();
        } else {
            // If method === "POST"
        }


    }

}
module.exports = new DashboardController();