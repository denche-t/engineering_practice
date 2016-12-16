var login = require('./models/login');
var leaves = require('./models/leaves');

module.exports = {
    configure: function (app) {

        app.post('/login/', function (req, res) {
            login.proceed(req.body, res);
        });

        app.post('/login/create/', function (req, res) {
            login.create(req.body, res);
        });

        app.post('/logout/', function (req, res) {
            login.logout(req.body, res);
        });

        app.get('/leaves/', function (req, res) {
            leaves.getAll(res);
        });

        app.post('/leaves/create/', function (req, res) {
            leaves.create(req.body, res);
        });

        app.patch('/leaves/validate/gm/', function (req, res) {
            leaves.validate_gm(req.body, res);
        });

        app.patch('/leaves/validate/dm/', function (req, res) {
            leaves.validate_dm(req.body, res);
        });
    }
};