const fs = require("fs");
const isLogined = require("../util/isLogined");
const getSession = require("../util/getSession");
module.exports = {


    getLayout(req, res) {
        let html = fs.readFileSync("./views/layouts/main.html", "utf-8");
        let userLogin = ` <div id="user-manager">
                    <li><a class="dropdown-item" href="/login">Login</a></li>
<!--                    <li><a class="dropdown-item" href="/register">Register</a></li>-->
                    <li><a class="dropdown-item" href="./forgot-password">Forgot Password</a></li>
                    </div>`
        let userSetting = `<li><a class="dropdown-item" href="#!">Settings</a></li>
                      <li><a class="dropdown-item" href="#!">Activity Log</a></li>
                      <li>
                      <hr class="dropdown-divider"/>
                      </li>
                      <li><a class="dropdown-item" href="/logout">Logout</a></li>`
        let regButton = `<a class="btn btn-primary" href="/register">Register</a>`;
        let avatarIcon = `<i class="fas fa-user fa-fw"></i>`;

        // Set user role display
        let userRole = "Guest"


        // console.log(isLogined(req, res))
        if (isLogined(req, res)) {
            let user = getSession(req, res);
            let userName = user["userName"];
            let role = user["role"];
            switch (role) {
                case 1:
                    userRole = "Admin";
                    break;
                case 2:
                    userRole = "User";
                    break;
            }

            html = html.replace("{user-login}", "")
            html = html.replace("{avatar-icon}", avatarIcon);
            html = html.replace("{register-btn}", "");
            html = html.replace("{user-name}", `${userName}`);
            html = html.replace("{user-role}", `${userRole}`);
            return html.replace("{user-setting}", userSetting);

        } else {
            html = html.replace("{register-btn}", regButton);
            html = html.replace("{user-login}", userLogin);
            html = html.replace("{avatar-icon}", avatarIcon);
            html = html.replace("{user-name}", "");
            html = html.replace("{user-role}", `${userRole}`);
            return html.replace("{user-setting}", "");
        }

    }

}