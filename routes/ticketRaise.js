var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var users = couchdb.use(staticObj.db_authors);
var ticketRais_db = couchdb.use(staticObj.db_ticketRaise);
var httpservreq = require('../httpseverreq.js');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var jade = require('jade');

// to add new ticket
exports.addTicket = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var data = {};
    data.contentId = req.body.quesId;
    data.author = req.body.author;
    data.issue = req.body.description;
    data.raisedAt = getCurrentUTCDate();
    data.raisedBy = author;
    data.resolved = false;

    data.explaination = "";
    data.isIssue = "";
    data.resolvedAt = "";

    var max_id_ar = [];
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    users.get(data.author, function (err, body) {
        if (!err) {
            /////////use for send  mail to question author////////////            
            var quesAutorEmail = body.email;
            var quesAuthorName = body.fullName;
            var questId = req.body.quesId;
            var issuedesc = req.body.description;
            /////////end of mail///////////

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            ticketRais_db.view("byAdmin", "getavailableId", function (er, result) {
                if (!er) {
                    result.rows.forEach(function (resdata) {
                        max_id_ar.push(resdata.value);
                    })
                    var maxIntId = max_id_ar[0];
                    var reducedVal = maxIntId;
                    if (reducedVal < 0) {
                        num = -reducedVal;
                    } else {
                        num = reducedVal + 1
                    }
                    var availableId = "0000".concat(num.toString(36)).slice(-5);
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    ticketRais_db.insert(data, availableId, function (error, body) {
                        if (!error) {
                            //////send mail////// 
                            var jadeFormat = jade.compileFile(staticObj.ticket_raised);
                            mail_temp = jadeFormat({ authorFullName: quesAuthorName, raisedbyFullName: userMeta.fullName, quesId: questId, issuedesc: issuedesc, serverUrl: staticObj.main_server_url });

                            var req_type = "send_mail";
                            var user_mail_info_02 = new Object;
                            user_mail_info_02.to = quesAutorEmail; 
                            user_mail_info_02.sub = "Ticket Raised On Your Question (Ques Id: " + questId + ")";
                            user_mail_info_02.body = mail_temp;
                            var randomId = randID();

                            //============== from http server request =============================                       
                            httpservreq.httpReq(randomId, req_type, user_mail_info_02, author, function (err, body) {
                                if (!err && body.success) {
                                    var count = 0;
                                    var myVar = setInterval(function () { myTimer() }, 1500);
                                    function myTimer() {
                                        count = count + 1;
                                        if (body.result.length != 0) {
                                            var status = JSON.parse(body.result)
                                            if (status.success) {
                                                console.log('Mail sent');
                                                res.json({ status: "success", lastTickId: availableId });
                                                myStopFunction()
                                            } else {
                                                console.log('unable to send mail sent');
                                                res.json({ status: "error", msg: staticObj.mail_send_fail, link: "" });
                                                // res.render('user_pages/forgot', { status: "error", msg: staticObj.mail_send_fail });
                                                myStopFunction()
                                            }
                                            if (count >= 60) {
                                                myStopFunction()
                                            }
                                        }
                                        else {
                                            console.log('mail not found');
                                            if (count >= 60) {
                                                myStopFunction()
                                            }
                                        }
                                    }
                                    function myStopFunction() {
                                        clearInterval(myVar);
                                    }
                                } else {
                                    //console.log("error===========" + err);
                                    res.json({ status: "error", msg: staticObj.Unable_to_process, link: "" });
                                    
                                }
                            });
                            ////end of mail//////
                        } else {
                            res.json({ status: "error" });
                        }
                    });
                } else {
                    res.json({ status: "error" });
                }
            });
        } else {
            res.json({ "status": "error" });
        }
    });
};



// to get all author ticket
exports.questionTickets = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    ticketRais_db.view("byAdmin", "authorResolvedToDoc", { key: author }, function (er, result) {
        if (!er) {
            var openTickets = [];
            var closeTickets = [];
            var raiseByArray = [];
            result.rows.forEach(function (resdata) {
                raiseByArray.push(resdata.value.raisedBy);

                if (resdata.value.resolved == true)
                    closeTickets.push(resdata.value);

                if (resdata.value.resolved == false)
                    openTickets.push(resdata.value);
            });

            httpservreq.getAuthorFullnameEmail(raiseByArray, function (err, body) {
                if (!err && body.success) {
                    // console.log(body.userdata);
                    closeTickets.map(function (ct) {
                        var index = body.userdata.findIndex(function (obj) {
                            return ct.raisedBy == obj.value.id;
                        });
                        ct.raiseByfullName = (body.userdata[index].value.fullName) ? body.userdata[index].value.fullName : 'Someone';
                    });
                    openTickets.map(function (ot) {
                        var index = body.userdata.findIndex(function (obj) {
                            return ot.raisedBy == obj.value.id;
                        });
                        ot.raiseByfullName = (body.userdata[index].value.fullName) ? body.userdata[index].value.fullName : 'Someone';
                    });
                    ////////////////////////
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    ticketRais_db.view("byAdmin", "raisedByToDoc", { key: author }, function (er, result) {
                        if (!er) {
                            var raiseByMe = [];
                            var authorArray = [];
                            result.rows.forEach(function (resdata) {
                                authorArray.push(resdata.value.author);
                                raiseByMe.push(resdata.value);

                            });
                            httpservreq.getAuthorFullnameEmail(authorArray, function (err, body) {
                                if (!err && body.success) {
                                    raiseByMe.map(function (rbm) {
                                        var index = body.userdata.findIndex(function (obj) {
                                            return rbm.author == obj.value.id;
                                        });
                                        rbm.authorfullName = (body.userdata[index].value.fullName) ? body.userdata[index].value.fullName : 'Someone';
                                    });
                                    res.render('question/question_tickets', { openTickets: openTickets, closeTickets: closeTickets, raiseByMe: raiseByMe, userMeta: userMeta, msg: '', copyright: globaldata, short: short });
                                } else {
                                    res.redirect('/author_dashboard?msg=dberror');
                                }
                            });
                        } else {
                            res.redirect('/author_dashboard?msg=dberror');
                        }
                    });
                    // res.render('question/question_tickets',{ticektNotResolve:ticektNotResolve,fullName:fullName,msg:'',copyright: globaldata ,short: short }); 
                } else {
                    res.redirect('/author_dashboard?msg=dberror');
                }
            });
        } else {
            res.redirect('/author_dashboard?msg=dberror');
        }
    });
};

// to get ticket detail
exports.getTicketDetail = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var id = req.body.id;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    ticketRais_db.get(id, function (err, body1) {
        if (!err) {
            httpservreq.getAuthorFullnameEmail([body1.raisedBy], function (err, body) {
                if (!err && body.success) {
                    body1.raiseByfullName = (body.userdata[0].value.fullName) ? body.userdata[0].value.fullName : 'Someone';
                    res.json({ status: 'success', data: body1 });
                } else {
                    res.json({ status: 'error' });
                }
            });
        } else {
            res.json({ status: 'error' });
        }
    });
}

//to reply to ticket raiser
exports.replyToTicket = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var id = req.body.ticketid;
    var message = req.body.message;
    var isIssue = (req.body.isIssue == "true") ? true : false;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    ticketRais_db.get(id, function (err, body1) {
        if (!err) {
            var questId = body1.contentId;

            httpservreq.getAuthorFullnameEmail([body1.raisedBy], function (err, body) {
                if (!err && body.success) {
                    var raiseByfullName = (body.userdata[0].value.fullName) ? body.userdata[0].value.fullName : 'User';
                    var raiseByEmail = body.userdata[0].value.email;

                    body1.explaination = message;
                    body1.isIssue = isIssue;
                    body1.resolved = true;
                    body1.resolvedAt = getCurrentUTCDate();
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    ticketRais_db.insert(body1, function (error, body) {
                        if (!error) {
                            //////send mail//////                        
                            var jadeFormat = jade.compileFile(staticObj.ticket_resolved);
                            mail_temp = jadeFormat({ authorFullName: fullName, raisedbyFullName: raiseByfullName, quesId: questId, explantion: message, serverUrl: staticObj.main_server_url });

                            var req_type = "send_mail";
                            var user_mail_info_02 = new Object;
                            user_mail_info_02.to = raiseByEmail; 
                            user_mail_info_02.sub = "Ticket has been Resolved On Question (Ques Id: " + questId + ")";
                            user_mail_info_02.body = mail_temp;
                            var randomId = randID();

                            //============== from http server request =============================                       
                            httpservreq.httpReq(randomId, req_type, user_mail_info_02, author, function (err, body) {
                                if (!err && body.success) {
                                    var count = 0;
                                    var myVar = setInterval(function () { myTimer() }, 1500);
                                    function myTimer() {
                                        count = count + 1;
                                        if (body.result.length != 0) {
                                            var status = JSON.parse(body.result)
                                            if (status.success) {
                                                console.log('Mail sent');
                                                res.json({ status: 'success' });
                                                myStopFunction()
                                            }
                                            else {
                                                console.log('unable to send mail sent');
                                                res.json({ status: "error", msg: staticObj.mail_send_fail, link: "" });
                                                // res.render('user_pages/forgot', { status: "error", msg: staticObj.mail_send_fail });
                                                myStopFunction()
                                            }
                                            if (count >= 60) {
                                                myStopFunction()
                                            }
                                        }
                                        else {
                                            console.log('mail not found');
                                            if (count >= 60) {
                                                myStopFunction()
                                            }
                                        }
                                    }
                                    function myStopFunction() {
                                        clearInterval(myVar);
                                    }
                                } else {
                                    
                                    res.json({ status: "error", msg: staticObj.Unable_to_process, link: "" });
                                    // res.render('user_pages/forgot', { status: "error", msg: staticObj.Unable_to_process });
                                    // res.send("Error creating data, Please go back and submit again!!");
                                }
                            });
                            ////end of mail//////     
                        } else {
                            res.json({ status: "error" });
                        }
                    });
                } else {
                    res.json({ status: 'error' });
                }
            });
        } else {
            res.json({ status: 'error' });
        }
    });
}


//; to get counter of new tickets
exports.counterTickets = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var ticektNotResolve = [];
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    ticketRais_db.view("byAdmin", "authorResolvedToDoc", { key: author }, function (er, result) {
        if (!er) {
            result.rows.forEach(function (resdata) {
                if (resdata.value.resolved == false)
                    ticektNotResolve.push(resdata.value);
            });
            res.json({ status: 'success', ticektNotResolve: ticektNotResolve });
        } else {
            res.json({ status: 'error' });
        }
    });
};

exports.isIssueTicket = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var id = req.body.id;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    ticketRais_db.get(id, function (err, body1) {
        if (!err) {
            body1.isIssue = (req.body.isIssue == 'true') ? true : false;
            body1.explaination = req.body.explaination;

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            ticketRais_db.insert(body1, function (error, body2) {
                if (!error) {
                    res.json({ status: 'success' });
                } else {
                    res.json({ status: 'error' });
                }
            });
        } else {
            res.json({ status: 'error' });
        }
    });
}