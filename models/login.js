var JSON = require('JSON');
var token_generator = require('../token_generator');
var connection = require('../connection');
var controller = require('../controller');

function Login() {

    this.proceed = function(args, res) {
        connection.acquire(function (err, con) {
            console.log("Login " + args.loggin);
            con.query('SELECT EXISTS(SELECT 1 FROM employees WHERE employee_login = \'' + args.login + '\') AS result',
            function (err, result) {
                console.log(result)
                if (err) {
                    con.release();
                    res.send({ status: 1, message: 'LOGIN internal error' });
                } else if (result[0].result == 0) {
                    con.release();
                    res.send({ status: 2, message: 'LOGIN login doesnt exist' });
                }
                else {
                        con.query('SELECT * FROM employees WHERE employee_login = \'' + args.login + '\' AND password = \'' + args.password + '\'',
                        function (err, result) {
                            console.log(result)
                            if (err) {
                                con.release();
                                res.send({ status: 1, message: 'LOGIN internal error' });
                            } else if (result.length == 0) {
                                con.release();
                                res.send({ status: 3, message: 'LOGIN wrong password' });
                            } else {
                                console.log(result.length);
                                const token_new = token_generator.new(14);
                                const curr_employee = result[0];
                                con.query('INSERT INTO connexion_token (applicant_login, applicant_id, token) VALUES ( \'' + result[0].employee_login + '\',' + result[0].employee_id + ',\'' + token_new + '\')',
                                     function (err, result) {
                                         con.release();
                                         console.log(result)
                                         if (err) {
                                             res.send({ status: 1, message: 'LOGIN internal error' });
                                         }
                                         else {
                                             res.send({ status: 0, message: 'LOGIN succeed', employee_object: result[0], token: token_new });
                                         }
                                });
                        }
                    });
            }});
        });
    };

    this.logout = function (args, res) {
        connection.acquire(function (err, con) {
            con.query('UPDATE connexion_token SET active = false WHERE token = \'' + args.token + '\' AND applicant_login = \'' + args.login + '\'',
            function (err, result) {
                console.log(result)
                if (err) {
                    res.send({ status: 1, message: 'LOGOUT internal error' });
                } else if (result[0].result == 0) {
                    res.send({ status: 2, message: 'LOGOUT token doesnt exist' });
                }
                else {
                    res.send({ status: 0, message: 'LOGOUT logout succeed' });
                }
            });
        });
    };

    var checkCreateEmployeeParams = function(args) {
        if (!args.hasOwnProperty("employee_login") ||
            !args.hasOwnProperty("employee_rank") ||
            !args.hasOwnProperty("password") ||
            !args.hasOwnProperty("first_name") ||
            !args.hasOwnProperty("last_name")) {
            return 1;
        }
        if (args.employee_rank == "gm") { return 0; }
        if (!args.hasOwnProperty("employee_department")) { return 1; }
        return 0;
    }

    var prepareCreateLoginQuery = function (con, res, args, callback) {
        controller.getDepartmentManager(con, res, args, function (err, con, res, args, dm) {
            if (err) {
                con.release();
                res.send({ status: 1, message: 'GET DM internal error' });
            } else if (dm == null && args.employee_rank == "employee") {
                con.release();
                res.send({ status: 2, message: 'GET DM no DM found for department ' + args.employee_department });
            } else {
                if (args.employee_rank != "employee") { args.dm_id = null;}
                else {args.dm_id = dm.dm_id;}
                controller.getGeneralManager(con, res, args, function (err, con, res, args, gm) {
                    if (err) {
                        con.release();
                        res.send({ status: 1, message: 'GET GM internal error' });
                    } else if (gm == null && args.employee_rank != "gm") {
                        con.release();
                        res.send({ status: 2, message: 'GET GM no GM found' });
                    } else {
                        if (args.employee_rank == "gm") { args.gm_id = null; args.employee_department = null;}
                        else { args.gm_id = gm.employee_id; }
 
                        var query = "INSERT INTO employees (employee_login, employee_rank, first_name, last_name, employee_department, dm_id, gm_id, password) " +
                                    " VALUES ( \'" + args.employee_login + "\',\'" + args.employee_rank+ "\',\'" + args.first_name + "\',\'" + args.last_name + "\',\'"
                                    + args.employee_department + "\'," + args.dm_id + "," + args.gm_id + ",\'" + args.password + "\');";;
                        console.log(query);
                        callback(err, con, res, args, query);
                    }
                });
            }
        });
    }

    this.create = function (args, res) {
        connection.acquire(function (err, con) {
            if (checkCreateEmployeeParams(args) == 1) {
                con.release();
                res.send({ status: 2, message: 'CREATE LOGIN invalid arguments' });
            } else {
                args.login = args.employee_login;
                controller.getEmployee(con, res, args, function (err, con, res, args, employee) {
                    if (err) {
                        con.release();
                        res.send({ status: 1, message: 'CREATE LOGIN internal error' });
                    } else if (employee != null) {
                        con.release();
                        res.send({ status: 3, message: 'CREATE LOGIN login already exist' });
                    } else {
                        prepareCreateLoginQuery(con, res, args, function (err, con, res, args, query) {
                            con.query(query, function (err, result) {
                                con.release();
                                if (err) {
                                    res.send({ status: 1, message: 'CREATE LOGIN internal error' });
                                } else {
                                    res.send({ status: 0, message: 'CREATE LOGIN succeed' });
                                }
                            });
                        });
                    }
                });
            }
        });
    };
}
module.exports = new Login();