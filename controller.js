function Controller() {

    this.getEmployee = function (con, res, args, callback) {
        con.query('SELECT * FROM employees WHERE employee_login = \'' + args.login + '\'',
            function (err, result) {
                if (err) {
                    callback(err, con, res);
                } else if (result.length == 0) {
                    callback(null, con, res, args, null);
                } else {
                    callback(null, con, res, args, result[0]);
                }
            });
    };

    this.getDepartmentManager = function (con, res, args, callback) {
        if (!args.hasOwnProperty("employee_department") ||
            args.employee_rank == "gm") {
            callback(null, con, res, args, null);
        }
        else {
            con.query('SELECT * FROM employees WHERE employee_department = \'' + args.employee_department + '\' AND employee_rank = \'dm\' AND active = true',
                function (err, result) {
                    if (err) {
                        callback(err, con, res);
                    } else if (result.length == 0) {
                        callback(null, con, res, args, null);
                    } else {
                        callback(null, con, res, args, result[0]);
                    }
                });
        }
    };

    this.getGeneralManager = function (con, res, args, callback) {
        con.query('SELECT * FROM employees WHERE employee_rank = \'gm\' AND active = true',
            function (err, result) {
                if (err) {
                    callback(err, con, res);
                } else if (result.length == 0) {
                    callback(null, con, res, args, null);
                } else {
                    callback(null, con, res, args, result[0]);
                }
            });
    };

    this.checkToken = function (con, res, args, callback) {
        con.query('SELECT * FROM connexion_token WHERE active=true AND applicant_login = \'' + args.login + '\' AND token = \'' + args.token + '\' AND date_creation_token > NOW() - INTERVAL 8 HOUR',
            function (err, result) {
                if (err) {
                    callback(err, con, res);
                } else if (result.length == 0) {
                    callback(null, con, res, args, false);
                } else {
                    callback(null, con, res, args, true);
                }
            });
    };

    this.checkLeaveValid = function (args) {
        if (!args.hasOwnProperty("leave_type")) { return 1; }
        if (args.leave_type == "business") { return 0; }
        if (!args.hasOwnProperty("leave_reason")) { return 1; }
        if (!(args.leave_reason== "other")) { return 0; }
        if (!args.hasOwnProperty("leave_comment")) { return 1; }
    }

}
module.exports = new Controller();