var JSON = require('JSON');
var connection = require('../connection');
var controller = require('../controller');

function Leaves() {

    var prepareQueryNewLeave = function (args, employee) {
        var dm_accepted = "null";
        if (!employee.employee_rank == "employee")
            dm_accepted = "true";
        var gm_accepted = "null";
        if (employee.employee_rank == "gm")
            gm_accepterd = "true";
        var leave_reason = "null";
        if (args.leave_type != "business")
            leave_reason = "\'" + args.leave_reason + "\'";
        var comment = "null";
        if (leave_reason == "\'other\'")
            comment = "\'" + args.leave_comment + "\'";
        console.log(employee);
        console.log(employee.employee_rank);
        var query = "INSERT INTO leaves (applicant_rank, applicant_id, dm_id, dm_accepted, gm_id, gm_accepted, date_leave_start, date_leave_end, leave_type, leave_reason, leave_comment) " + 
                    " VALUES ( \'" + employee.employee_rank + "\'," + employee.employee_id + "," + employee.dm_id + "," + dm_accepted + "," + employee.gm_id + "," + gm_accepted + ",\'"
                    + args.date_leave_start + "\',\'" + args.date_leave_end + "\',\'" + args.leave_type + "\'," + leave_reason + "," + comment + ");";
        console.log(query);
        return query;
    }

    var createNewLeave = function (con, res, args, employee, callback) {
        var query = prepareQueryNewLeave(args, employee);
        con.query(query,
            function (err, result) {
                console.log(result)
                if (err) {
                    callback(err, con, res);
                } else {
                    callback(null, con, res, true);
                }
            });
    }
        
    this.create = function (args, res) {
        connection.acquire(function (err, con) {
            controller.checkToken(con, res, args, function (err, con, res, args, is_token_valid) {
                if (err) {
                    con.release();
                    res.send(JSON.stringify({ status: 1, message: 'TOKEN internal error' }));
                } else if (!is_token_valid) {
                    con.release();
                    res.send(JSON.stringify({ status: 2, message: 'TOKEN token not valid' }));
                } else {
                    controller.getEmployee(con, res, args, function (err, con, res, args, employee) {
                        if (err) {
                            con.release();
                            res.send(JSON.stringify({ status: 1, message: 'EMPLOYEE internal error' }));
                        } else if (employee == null) {
                            con.release();
                            res.send(JSON.stringify({ status: 3, message: 'EMPLOYEE employee not found' }));
                        } else {
                            var valid = controller.checkLeaveValid(args);
                            if (valid == 1) {
                                con.release();
                                res.send(JSON.stringify({ status: 4, message: 'LEAVES leave invalid format' }));
                            } else {
                                createNewLeave(con, res, args, employee,
                                    function (err, con, res, is_created) {
                                        con.release();
                                        if (err) {
                                            console.log(err);
                                            res.send(JSON.stringify({ status: 1, message: 'NEW_LEAVE internal error'}));
                                        } else {
                                            res.send(JSON.stringify({ status: 0, message: 'NEW_LEAVE creation succeed' }));
                                        }
                                    });
                            }
                        }
                    });
                }
            });
        });
    }

    this.getAll = function (args, res) {
        connection.acquire(function (err, con) {
            controller.checkToken(con, res, args, function (err, con, res, args, is_token_valid) {
            if (err) {
                con.release();
                res.send(JSON.stringify({ status: 1, message: 'TOKEN internal error' }));
            } else if (!is_token_valid) {
                con.release();
                res.send(JSON.stringify({ status: 2, message: 'TOKEN token not valid' }));
            } else {
                    con.query('SELECT * FROM leaves',
                    function (err, result) {
                        leavesList = result;
                        console.log(result)
                        con.release();
                        if (err) {
                            res.send(JSON.stringify({ status: 1, message: 'LEAVES internal error' }));
                        } else {
                            res.send(JSON.stringify({ status: 0, message: 'LEAVES get succeed', result: leavesList }));
                        }
                    });
                }
            });
        });
    };

    var patch_leave_dm_validation = function (con, res, args, employee, callback) {
       con.query('UPDATE leaves SET dm_accepted = ' + args.dm_validation + ' WHERE leave_id = ' + args.leave_id,
       function (err, result) {
           if (err) {
               callback(err, con, res);
           } else {
               callback(null, con, res, args, true);
           }
       });
    }

    this.validate_dm = function (args, res) {
        connection.acquire(function (err, con) {
            controller.checkToken(con, res, args, function (err, con, res, args, is_token_valid) {
                if (err) {
                    con.release();
                    res.send(JSON.stringify({ status: 1, message: 'TOKEN internal error' }));
                } else if (!is_token_valid) {
                    con.release();
                    res.send(JSON.stringify({ status: 2, message: 'TOKEN token not valid' }));
                } else {
                    controller.getEmployee(con, res, args, function (err, con, res, args, employee) {
                        if (err) {
                            con.release();
                            res.send(JSON.stringify({ status: 1, message: 'EMPLOYEE internal error' }));
                        } else if (employee == null) {
                            con.release();
                            res.send(JSON.stringify({ status: 3, message: 'EMPLOYEE employee not found' }));
                        } else {
                            patch_leave_dm_validation(con, res, args, employee, function (err, con, res, args) {
                                con.release();
                                if (err) {
                           
                                    res.send(JSON.stringify({ status: 1, message: 'LEAVE dm validation internal error' }));
                                } else {
                                    res.send(JSON.stringify({ status: 0, message: 'LEAVE dm validation succeed' }));
                                }

                            });
                        }
                    });

                }
            });
        });
    }

    var patch_leave_gm_validation = function (con, res, args, employee, callback) {
        con.query('UPDATE leaves SET gm_accepted = ' + args.gm_validation + ' WHERE leave_id = ' + args.leave_id,
        function (err, result) {
            if (err) {
                callback(err, con, res);
            } else {
                callback(null, con, res, args, true);
            }
        });
    }

    this.validate_gm = function (args, res) {
        connection.acquire(function (err, con) {
            controller.checkToken(con, res, args, function (err, con, res, args, is_token_valid) {
                if (err) {
                    con.release();
                    res.send(JSON.stringify({ status: 1, message: 'TOKEN internal error' }));
                } else if (!is_token_valid) {
                    con.release();
                    res.send(JSON.stringify({ status: 2, message: 'TOKEN token not valid' }));
                } else {
                    controller.getEmployee(con, res, args, function (err, con, res, args, employee) {
                        if (err) {
                            con.release();
                            res.send(JSON.stringify({ status: 1, message: 'EMPLOYEE internal error' }));
                        } else if (employee == null) {
                            con.release();
                            res.send(JSON.stringify({ status: 3, message: 'EMPLOYEE employee not found' }));
                        } else {
                            patch_leave_gm_validation(con, res, args, employee, function (err, con, res, args) {
                                con.release();
                                if (err) {

                                    res.send(JSON.stringify({ status: 1, message: 'LEAVE gm validation internal error' }));
                                } else {
                                    res.send(JSON.stringify({ status: 0, message: 'LEAVE dm validation succeed' }));
                                }

                            });
                        }
                    });

                }
            });
        });
    }
}
module.exports = new Leaves();