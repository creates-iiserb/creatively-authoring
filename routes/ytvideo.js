var fs = require('fs');
var util = require('util');
var path = require('path');
var uuidV4 = require('uuid/v4');
var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var graphic_db = couchdb.use(staticObj.db_graphics);
var graphic_md_db = couchdb.use(staticObj.db_graphics_metadata);
var graphics_url = staticObj.graphics_url;

//to redicret to add new yt page
exports.newYtvideo = function (req, res) {
    var user = req.body.shortn;
   
    var userMeta = req.userMeta;
    res.render('media/ytvideoUpload', { isNew:true, data:{},token: '', short: user, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
};

// to add new yt video
exports.postYtvideo = function (req, res) {
    var caption = req.body.caption;
    var descr = req.body.descr;
    var ytvideoid = req.body.vid;
    var author = req.body.author;
    var ctype = req.body.ctype;
    
    var secret = secretIdMedia();
    var userMeta = req.userMeta;
    var tags = req.body.tags;
    var tags_ary = new Array();
    tags_ary = tags.split(",");
    var max_id_ar = [];
    var token = "";
    token = uuidV4();

    var currentUTCDate = getCurrentUTCDate();
    var updatedAt = currentUTCDate;
    var createdOn = currentUTCDate;
    if (tags_ary.length < 3) {
        res.redirect('/author_mediaGallery?msg=tagerror');
    }
    else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        graphic_db.view("graphics_admin", "getAvailableId", function (er, result) {
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
                graphic_db.get(availableId, function (err, doc) {
                    if (!err) {
                        if (doc) {
                            rev_no = doc._rev;
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            graphic_db.insert({ tags: tags_ary, caption: caption, description: descr, ytvideo: ytvideoid, author: author, ctype: ctype, token: token,updatedAt:updatedAt,createdOn:createdOn,secret:secret, _rev: rev_no }, availableId, function (error, body) {
                                if (!error) {
                                    generateLogs("info", author + " inserted a new ytvideo  with free id = " + availableId);
                                    // res.redirect('/author_mediaGallery');
                                    res.redirect('/author_edituploadvideo?id=' + availableId + '&body=' + body.ok);
                                } else {
                                    res.send(error);
                                }
                            })
                        }
                    } else {
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        graphic_db.insert({ tags: tags_ary, caption: caption, description: descr, ytvideo: ytvideoid, author: author, ctype: ctype, token: token,updatedAt:updatedAt,createdOn:createdOn ,secret:secret}, availableId, function (error, body) {
                            if (!error) {
                                generateLogs("info", author + " inserted a new ytvideo  with new id = " + availableId);
                                res.redirect('/author_mediaGallery');
                            } else {
                                res.send(error);
                            }
                        })
                    }
                });
            } else {
                generateLogs("error", "Error fetching data from view. Error - " + er.message);
                res.redirect('/author_mediaGallery?msg=dberror');
            }
        })
    }
};


// to delete a yt video
exports.removeVideo = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    var metaId = req.param('metaid');
    var meta_rev = req.param('rev');
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var rev_no = "";
    var currentUTCDate = getCurrentUTCDate();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    graphic_db.get(metaId, { rev_info: true }, function (er, doc) {
        if (!er) {
            rev_no = doc._rev;
            if (doc.author == req.headers.x_myapp_whoami) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                graphic_db.insert({ author: "unknown", tags: "", caption: "", description: "", ytvideo: "", ctype: "", token: "", _rev: rev_no,updatedAt:currentUTCDate,createdOn:doc.createdOn,secret:"" }, metaId, function (error, body) {
                    if (!error) {
                        generateLogs("info", author + " successfully deleted yt video(id = " + metaId + ")  ");
                        var timer = setTimeout(function () {
                            res.redirect('/author_mediaGallery');
                        }, 500);
                        req.once('timeout', function () {
                            clearTimeout(timer);
                        });
                    } else {
                        generateLogs("error", "image(id = " + metaId + ") not deleted. Error - " + error.message);
                        res.redirect('/author_mediaGallery?msg=dberror');
                    }
                })
            } else {
                generateLogs("error", author + "  is not authorized to delete yt video with id =  " + metaId);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata , userMeta: userMeta}); return;
            }
        } else {
            generateLogs("error", "Error  removing ytvideo (id = " + metaId + "). Error - " + er.message);
            res.redirect('/author_edituploadvideo?id=' + id + '&msg=dberror');
        }

    })
};

// to redicrect to edit video page 
exports.editYtvideo = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var id = req.param("id");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    graphic_db.get(req.param("id"), { revs_info: true }, function (err, body) {
        if (err) {
            alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
            res.redirect('author_mediaGallery');
        } else {
            if (body.author == req.headers.x_myapp_whoami) {
                res.render('media/ytvideoUpload', { isNew:false, data: body, short: short, token: id, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
            } else {
                generateLogs("error", author + "  is not authorized to view yt video with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata , userMeta: userMeta}); return;
            }
        }

    });
};

// to update a yt video
exports.updateYtvideo = function (req, res) {
    var author = req.body.author;
    var id = req.body.id;
    var caption = req.body.caption;
    var descr = req.body.descr;
    var ytvideoid = req.body.vid;
    var ctype = req.body.ctype;
    var token = req.body.token;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var tags = req.body.tags;
    var tags_ary = new Array();
    tags_ary = tags.split(",");
    var currentUTCDate = getCurrentUTCDate();

    if (tags_ary.length < 3) {
        res.redirect('/author_edituploadvideo?msg=tagerror');
    }
    else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        graphic_db.get(id, function (err, doc) {
            if (!err) {
                updaterev = doc._rev;
                secret = doc.secret;
                if (doc.author == req.headers.x_myapp_whoami) {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    graphic_db.insert({ tags: tags_ary, caption: caption, description: descr, author: author, ytvideo: ytvideoid, ctype: ctype, token: token,updatedAt:currentUTCDate,createdOn:doc.createdOn,secret:secret, _rev: updaterev }, id, function (err, body, header) {
                        if (!err) {
                            generateLogs("info", author + " successfully updated yt video with id =  " + id);
                            res.redirect('/author_edituploadvideo?id=' + id + '&body=' + body.ok);
                        } else {
                            generateLogs("error", "Unable to update data in DB in graphic_db -(id = " + id + ") " + err.message);
                            res.redirect('/author_edituploadvideo?id=' + id + '&msg=dberror');
                        }
                    });
                } else {
                    generateLogs("error", author + "  is not authorized to update yt video with id =  " + id);
                    res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
                }
            }
        });
    }
};