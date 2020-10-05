var staticObj = require('../config.js').merge_output;
var httpservreq = require('../httpseverreq.js');
var couchdb = require('nano')(staticObj.couchdb);
var req_db = couchdb.use(staticObj.db_request)
var working_db = couchdb.use(staticObj.db_working);
var users = couchdb.use(staticObj.db_authors);
var req_url = staticObj.req_url;
var plotIframeLink =  staticObj.plotIframeLink;
var graphics_url = staticObj.graphics_url;
var chart_url = staticObj.chart_url;
var ytvideo_url = staticObj.ytvideo_url;
var request = require("request");

var res_db = couchdb.use(staticObj.db_response);

var metadata_db = couchdb.use(staticObj.db_elements_metadata);

exports.checkQuestion = function (req, res) {
    var type = req.body.type;
    var data = JSON.parse(req.body.data);
 
    var author = req.body.authorname;
    var update_rev_no = "";
    var token = req.body.token;
   
    var userMeta = req.userMeta;
    var pipe = req.body.pipe;
    var data_req = JSON.parse(req.body.data_req1 || req.body.data_req2 || req.body.data_req3);
    var randomId = randID();
    
    httpservreq.updateQues(token, author, type, data, data_req, function (err1, body1) {
        if (!err1 && body1.success) {
            httpservreq.httpReq(randomId, type, data, author, function (err, body) {
                if (err) {
                    if (type == "verify_arrange" || type == "give5_arrange" || type == "verify_fillin" || type == "give5_fillin" || type == "give5_mcq" || type == "verify_mcq" || type == "give5_info" || type == "verify_info" || type == "verify_sub" || type == "give5_sub") {
                        res.render('question/view_question_data_old', { data: 'Server Error', userMeta: userMeta, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                    }else{
                        res.redirect('/author_getauthorid?id=' + token + '&pipe=' + pipe + '&body=serverr');
                    }

                    
                } else {
                    if (body) {
                        if (!err && body.success) {
                            if (type == "verify_arrange" || type == "give5_arrange") {
                                res.render('question/view_question_data_old', { data: body.result, userMeta: userMeta, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                            }
                            else if (type == "verify_fillin" || type == "give5_fillin") {
                                res.render('question/view_question_data_old', { data: body.result, userMeta: userMeta, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                            }
                            else if (type == "give5_mcq" || type == "verify_mcq") {
                                res.render('question/view_question_data_old', { data: body.result, userMeta: userMeta, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                            }else if (type == "give5_info" || type == "verify_info") {
                                res.render('question/view_question_data_old', { data: body.result, userMeta: userMeta, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                            }else if (type == "give5_sub" || type == "verify_sub") {
                                // console.log(body.result)
                                res.render('question/view_question_data_old', { data: body.result, userMeta: userMeta, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                            }
                            else {
                                // to commit a question 
                                var timer = setTimeout(function () {
                                    res.render('question/view_question_data', { data: JSON.parse(body.result), token: token, userMeta: userMeta,author: author, short: author, pipe: pipe, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                                }, 1000);
                                req.once('timeout', function () {
                                    clearTimeout(timer);
                                });
                            }
                        } else {
                            res.render('question/view_question_data_old', { data: body.result, userMeta: userMeta, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                        }
                    }
                }
            });
        } else {
            res.redirect('/author_getauthorid?id=' + token + '&pipe='+pipe+'&body=serverr');
        }
    });

}

// to clone question (commited as well as under development)
exports.getCopyToken = function (req, res) {
    var user = req.headers.x_myapp_whoami;
    var mode = req.param("mode");
    var pipe = req.param("pipe");
    
    var userMeta = req.userMeta;
    var type = "duplicate_element";
    var orgid = req.param("orgid");
    let serReq = {
        author: user,
        ref: orgid
    }
    var author = "{\"author\"\ : ";
    var jsonObjAu = [];
    jsonObjAu.push(JSON.stringify(user));

    var jsonObjorg = [];
    jsonObjorg.push(JSON.stringify(orgid));
    author += jsonObjAu + ",\"ref\"\ : " + jsonObjorg + "}";
   
    author = req.headers.x_myapp_whoami;

    var randomId = randID();
    
    httpservreq.httpReq(randomId, type, serReq, user, function (err, body) {
        if (!err && body.success) {
           
            var token = "";
            var org_type = "", org_comm = "", org_object = ""
            var resdata = JSON.parse(body.result);
           
            let clonedQue = {
                author: user,
                object: resdata.object,
                type: resdata.type
            }
            token = resdata.ref;
            org_type = resdata.type;
            org_object = resdata.object;
            var timer = setTimeout(function () {
                var userdata_db = new Array();
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                users.view("getUserData", "find_username", { key: user }, function (err, body) {
                    if (!err) {
                        body.rows.forEach(function (doc) {
                            userdata_db.push(doc.value);
                        });
                        var concepts = [];
                        concepts = userdata_db[0].concepts;
                        var skills = [];
                        skills = userdata_db[0].skills;
                    }
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    working_db.get(token, { revs_info: true }, function (error, docs) {
                        if (docs) {
                            var update = docs._rev;
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            working_db.insert({ type: pipe, comments: "", tags: "", author: user, object: org_object, _rev: update }, token, function (error, body) {
                                if (!error) {
                                    var data_to_send = { isNew: false, concepts: concepts, skills: skills, pipe: pipe, userMeta: userMeta, data: resdata.object, metaData: resdata.object, dataid: token, com: org_comm, token: token, author: author, short: user, tooltip: tooltip, copyright: globaldata };
                                    if (pipe == "mcq" || "fillIn" || "arrange" || "info" || "sub") {
                                        res.render('question/questionDataNew', data_to_send);
                                    }
                                } else {
                                    res.send(error);
                                }
                            })
                        } else {
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            working_db.insert({ type: pipe, comments: "", tags: "", author: user, object: "" }, token, function (error, body) {
                                if (!error) {
                                    var data_send = { isNew: false, concepts: concepts, skills: skills, pipe: pipe, userMeta: userMeta,data: resdata.object, metaData: resdata.object, dataid: token, com: org_comm, token: token, author: author, short: user, tooltip: tooltip, copyright: globaldata };
                                    if (pipe == "mcq" || "fillIn" || "arrange" || "info" || "sub") {
                                        res.render('question/questionDataNew', data_send);
                                    }
                                } else {
                                    res.send(error);
                                }
                            })
                        }
                        generateLogs("info", user + " cloned question (id= " + orgid + ") with new  id  = " + token);
                    })
                })
            }, 2000);
            req.once('timeout', function () {
                clearTimeout(timer);
            });
        } else {
            res.redirect('/author_dashboard_prog?msg="serverror"');
        } 
    });
    //============== from http server request ends=============================  
};

//to  delete a question
exports.getRemToken = function (req, res) {
    var user = req.headers.x_myapp_whoami;
   
    var userMeta = req.userMeta;
    var mode = req.param("mode");
    var type = "delete_element";
    var author = "{\"author\"\ : ";
    var jsonObjAu = [];
    jsonObjAu.push(JSON.stringify(user));
    var orgid = req.param("orgid");
    var jsonObjorg = [];
    jsonObjorg.push(JSON.stringify(orgid));
    author += jsonObjAu + ",\"ref\"\ : " + jsonObjorg + "}";
    var randomId = randID();
   
    httpservreq.httpReq(randomId, type, JSON.parse(author), user, function (err, body) {
        if (!err && body.success) {
            generateLogs("info", user + " successfully deleted question with id = " + orgid);
            res.redirect('/author_dashboard_prog');
        } else {
           // console.log(err); 
            generateLogs("error", user + "deleted question with id = " + orgid + ". Error = " + err.message);
            res.redirect('/author_dashboard_prog?msg="timeout"');
        }
    }); 
};

exports.updateArrg = function (req, res) {
    var type = req.body.type;
    var tags = req.body.tagss;
    var data = JSON.parse(req.body.data);
    var author = req.body.shortName;
    var short = req.body.shortName;
    var id = req.body.token;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var pipe1 = req.param("pipe");
    var data_req = JSON.parse(req.body.data_req);
    var randomId = randID();
    
    httpservreq.updateQues(id, author, type, data, data_req, function (err, body) {
        if (!err && body.success) {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=arrange&body=success');
        } else {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=arrange&body=serverr');
        }
    });
};

exports.updateFillData = function (req, res) {
    var type = req.body.type;
    var tags = req.body.tagss;
    var data = JSON.parse(req.body.data);
    var author = req.body.shortName;
    var id = req.body.token;
    var data_req = JSON.parse(req.body.data_req);
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var randomId = randID();
    httpservreq.updateQues(id, author, type, data, data_req, function (err, body) {
        if (!err && body.success) {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=fillIn&body=success');
        } else {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=fillIn&body=serverr');
        }
    });
};

exports.dateSubData = function (req, res) {
    var type = req.body.type;
    var tags = req.body.tagss;
    var data = JSON.parse(req.body.data);
    var author = req.body.shortName;
    var id = req.body.token;
    var data_req = JSON.parse(req.body.data_req);
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var randomId = randID();
    
    httpservreq.updateQues(id, author, type, data, data_req, function (err, body) {
        if (!err && body.success) {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=sub&body=success');
        } else {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=sub&body=serverr');
        }
    });
};

exports.updateQuestion = function (req, res) {
    var type = req.body.type;
    var tags = req.body.tagss;
    var data = JSON.parse(req.body.data);
    var author = req.body.shortName;
    var short = req.body.shortName;
    var id = req.body.token;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var short1 = req.param("short");
    var pipe1 = req.param("pipe");
    var author1 = req.param("short");
    var data_req = JSON.parse(req.body.data_req);
    var randomId = randID();
    httpservreq.updateQues(id, author, type, data, data_req, function (err, body) {
        if (!err && body.success) {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=mcq&body=success');
        } else {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=mcq&body=serverr');
        }
    });
};


exports.updateInfoData = function (req, res) {
    var type = req.body.type;
    var tags = req.body.tagss;
    var data = JSON.parse(req.body.data);
    var author = req.body.shortName;
    var id = req.body.token;
    var data_req = JSON.parse(req.body.data_req);
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var randomId = randID();
    httpservreq.updateQues(id, author, type, data, data_req, function (err, body) {
        if (!err && body.success) {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=info&body=success');
        } else {
            res.redirect('/author_getauthorid?id=' + id + '&pipe=info&body=serverr');
        }
    });
};

// to create a new question 
exports.getNewToken = function (req, res) {
    var type = "new_token";
    var shortName = req.body.shortn;
    
    var userMeta = req.userMeta;
    var author = "{\"author\"\ : ";
    var author1 = "{\"author\"\ : ";
    var jsonObjAu = [];
    jsonObjAu.push(JSON.stringify(shortName));
    var pipe = req.body.pipe;
    var jsonObjet = [];
    jsonObjet.push(JSON.stringify(pipe));
    author += jsonObjAu + ",\"element_type\"\ : " + jsonObjet + "}";
    author1 += jsonObjAu + ",\"element_type\"\ : " + jsonObjet + "}";
    var short = req.headers.x_myapp_whoami;
    var author = req.headers.x_myapp_whoami;
    var metaDb = {};
    var randomId = randID();
    
    //============== from http server request =============================
    httpservreq.httpReq(randomId, type, JSON.parse(author1), shortName, function (err, body) {
        if (!err && body.success) {
            result = JSON.parse(body.result);
           
            token = result.ref;
            var json_result = JSON.parse(body.result);
            if (json_result.error) {
                generateLogs("error", shortName + "created new question. Error = " + json_result.error);
                res.redirect('/author_dashboard_prog?msg=error');
            } else {
                var userdata_db = new Array();
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                users.view("getUserData", "find_username", { key: short }, function (err, body) {
                    if (!err) {
                        body.rows.forEach(function (doc) {
                            userdata_db.push(doc.value);
                        });
                        var concepts = [];
                        concepts = userdata_db[0].concepts;
                        var skills = [];
                        skills = userdata_db[0].skills;
                    }
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    working_db.get(token, function (err, doc) {
                        if (doc) {
                            rev_no = doc._rev;
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            working_db.insert({ type: pipe, comments: "", tags: "", author: author, object: "", _rev: rev_no }, token, function (err, body, header) {
                                if (!err) {
                                    var data = {};
                                    res.render('question/questionDataNew', { isNew: true, data: data, metaData: {}, concepts: concepts, skills: skills, userMeta: userMeta, pipe: pipe, token: token, author: author, short: short, tooltip: tooltip, copyright: globaldata });
                                }
                            })
                        } else {
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            working_db.insert({ type: pipe, comments: "", tags: "", author: author, object: "" }, token, function (err, body, header) {
                                if (!err) {
                                    var data = {};
                                    res.render('question/questionDataNew', { isNew: true, data: data, metaData: {}, concepts: concepts, skills: skills, pipe: pipe, userMeta: userMeta,token: token, author: author, short: short, tooltip: tooltip, copyright: globaldata });
                                }
                            })
                        }
                        generateLogs("info", author + " created new question  with id  = " + token);
                    })
                })
            }
        } else {
            res.redirect('/author_dashboard_prog?msg=serverror');
        }
    });
};




// to edit a commited question
exports.editCommitted = function (req, res) {
    var token = req.body.token;
    var type = "retrieve_element";
   
    var userMeta = req.userMeta;
    var short = req.body.short;
    var author = req.headers.x_myapp_whoami;
    var user = req.body.short;
    var pipe = req.body.pipe;
    var reqdata = {};
    reqdata["ref"] = req.body.token;
    reqdata["author"] = short;
    var data = "";
    var update_rev_no = "";
    var randomId = randID();
    var data_id = "", data_type = "", data_comm = "", data_tags = "", data_author = ""; data_object = "";
    httpservreq.httpReq(randomId, type, reqdata, short, function (err, body) {
        if (!err && body.success) {
            var jsondata = JSON.parse(body.result);
            data_id = jsondata._id;
            data_tags = jsondata.tags;
            data_author = jsondata.author;
            data_object = jsondata;
            generateLogs("info", short + " edited a committed question with id = " + token + " and type = " + pipe);
            var userdata_db = new Array();
            var metaDb = {};
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            users.view("getUserData", "find_username", { key: short }, function (err, body) {
                if (!err) {
                    body.rows.forEach(function (doc) {
                        userdata_db.push(doc.value);
                    });
                    var concepts = [];
                    concepts = userdata_db[0].concepts;
                    var skills = [];
                    skills = userdata_db[0].skills;

                    var userUpdateFlag = false;
                    var recentView = (Array.isArray(userdata_db[0].recentView)) ? userdata_db[0].recentView : [];
                    var recentIndex = recentView.findIndex(obj => token == obj.qid);

                    if (recentIndex > -1) {
                        recentView = recentView.filter(obj =>
                            obj.qid != token
                        );
                        userdata_db[0].recentView = recentView;
                        userUpdateFlag = true;
                    }

                    if (userUpdateFlag) {
                        users.insert(userdata_db[0], function (err, body) {
                            if (!err) {
                                console.log("User update successfully");
                            }
                            else {
                                console.log("User update error");
                            }
                        });
                    }
                } else {
                    generateLogs("error", short + " cannot fetch data from author DB while editing a committed question.");
                }

                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                metadata_db.get(data_id, { revs_info: false }, function (err, body) {
                    if (!err) {
                        metaDb = body;
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        working_db.get(data_id, { revs_info: true }, function (error, body) {
                            if (body) {
                                update_rev_no = body._rev;
                                if (body.author == req.headers.x_myapp_whoami) {
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                    working_db.insert({ type: pipe, comments: data_comm, tags: data_tags, author: author, object: data_object, _rev: update_rev_no }, data_id, function (err, body) {
                                        if (!err) {
                                            res.render('question/questionDataNew', { isNew: false, data: jsondata, metaData: metaDb, concepts: concepts, skills: skills, pipe: pipe, userMeta: userMeta, dataid: data_id, com: data_comm, token: data_id, author: user, short: short, tooltip: tooltip, copyright: globaldata });
                                        } else {
                                            generateLogs("error", short + " error in inserting data in working db with id = " + token + " Error = " + JSON.stringify(err));
                                            res.redirect('/author_dashboard_comm?msg=dberror');
                                        }
                                    })
                                } else {
                                    res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
                                }
                            } else {
                                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                working_db.insert({ type: pipe, comments: data_comm, tags: data_tags, author: author, object: data_object }, data_id, function (err, body) {
                                    if (!err) {
                                        // res.send(body);
                                        res.render('question/questionDataNew', { isNew: false, data: jsondata, metaData: metaDb, concepts: concepts, skills: skills, pipe: pipe, userMeta: userMeta, dataid: data_id, com: data_comm, token: data_id, author: user, short: short, tooltip: tooltip, copyright: globaldata });
                                    } else {
                                        generateLogs("error", short + " error in inserting data in working db with id = " + token + " Error = " + JSON.stringify(err));
                                        res.redirect('/author_dashboard_comm?msg=dberror');
                                    }
                                })
                            }
                        })
                    } else {
                        generateLogs("error", short + " error in  opening question to edit with id = " + id + " Error = " + err.message);
                        alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
                        res.redirect('author_dashboard?mod=prog' + '&msg=' + alldoc);
                    }
                })
            });
        } else {
            res.redirect('/author_dashboard_comm?msg=reqerror');
        }
    });
}; 
