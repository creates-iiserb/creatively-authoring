var fs = require('fs');
var util = require('util');
var path = require('path');
var uuidV4 = require('uuid/v4');
var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var graphic_db = couchdb.use(staticObj.db_graphics);
var graphic_md_db = couchdb.use(staticObj.db_graphics_metadata);
var graphics_url = staticObj.graphics_url;
var chart_url = staticObj.chart_url;
var ytvideo_url = staticObj.ytvideo_url;
var plotIframeLink =  staticObj.plotIframeLink;

// to redirect to add new drawing doc page
exports.newdrawingDoc = function (req, res) {
    var user = req.body.shortn;
    // var fullName = req.headers.x_myapp_fullName;
    var userMeta = req.userMeta;
    // console.log(JSON.stringify(tooltip));
    res.render('media/drawingUpload', { isNew:true, data:{},token: '', short: user,  tooltip: tooltip, copyright: globaldata , userMeta: userMeta});
};

 // to add new draw doc 
exports.postDrawDoc = function (req, res) {
    var caption = req.body.caption;
    var descr = req.body.descr;
    var author = req.body.author;
    var ctype = req.body.ctype;
    var base64 = req.body.base64textarea;
    var drawOutput = JSON.parse(req.body.drawOutput);
    var currentUTCDate = getCurrentUTCDate();
    var secret = secretIdMedia();
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var tags = req.body.tags;
    var tags_ary = new Array();
    tags_ary = tags.split(",");
    var max_id_ar = [];
    var token = "";
    token = uuidV4();
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
                            graphic_db.insert({ tags: tags_ary, caption: caption, description: descr, author: author, base64: base64, ctype: ctype,drawOutput:drawOutput, token: token,updatedAt:updatedAt,createdOn:createdOn,secret:secret, _rev: rev_no }, availableId, function (error, body) {
                                if (!error) {
                                    generateLogs("info", author + " inserted a new drawing Document with free id = " + availableId);
                                    // res.redirect('/author_mediaGallery');
                                    res.redirect('/author_edituploadDrawDoc?id=' + availableId + '&body=' + body.ok);
                                } else {
                                    generateLogs("error", "Unable to update data in DB in graphic_db -(id = " + id + ") " + error.message);
                                    res.redirect('/author_edituploadDrawDoc?id=' + availableId + '&msg=dberror');
                                }
                            })
                        }
                    } else {
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        graphic_db.insert({ tags: tags_ary, caption: caption, description: descr, author: author, base64: base64, ctype: ctype,drawOutput:drawOutput, token: token ,updatedAt:updatedAt,createdOn:createdOn,secret:secret}, availableId, function (error, body) {
                            if (!error) {
                                generateLogs("info", author + " inserted a new drawing Document with new id = " + availableId);
                                res.redirect('/author_edituploadDrawDoc?id=' + availableId + '&body=' + body.ok);
                            } else {
                                generateLogs("error", "Unable to update data in DB in graphic_db -(id = " + id + ") " + error.message);
                                res.redirect('/author_edituploadDrawDoc?id=' + availableId + '&msg=dberror');
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


// to update an drawing doc
exports.updateDrawDoc = function (req, res) {
    var author = req.body.author;
    var id = req.body.id;
    var userMeta = req.userMeta;
    var caption = req.body.caption;
    var descr = req.body.descr;
    var ctype = req.body.ctype;
    var drawOutput = JSON.parse(req.body.drawOutput);
    var base64 = req.body.base64textarea;
    var token = req.body.token;
    var tags = req.body.tags;
    var tags_ary = new Array();
    tags_ary = tags.split(",");

    var currentUTCDate = getCurrentUTCDate();
    // console.log("base64===="+req.body.base64)

    
    
    if (tags_ary.length < 3) {
        res.redirect('/author_edituploadDrawDoc?id=' + id + '&msg=tagerror');
    }
    else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        graphic_db.get(id, { revs_info: false }, function (err, body) {
            if (!err) {
                // console.log(body._rev+"----"+id)
                // console.log("tag==  "+tags_ary+"==caption=="+caption+"==description=="+descr);
                if (body.author == req.headers.x_myapp_whoami) {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    graphic_db.insert({ tags: tags_ary, caption: caption, description: descr,drawOutput:drawOutput, base64: base64, author: author, ctype: ctype, token: token, _rev: body._rev ,updatedAt:currentUTCDate,createdOn:body.createdOn,secret:body.secret}, id ,function (err, body1) {
                        if (!err) {
                            generateLogs("info", author + " successfully updated drawing with id =  " + id);
                            res.redirect('/author_edituploadDrawDoc?id=' + id + '&body=' + body1.ok);
                           
                        } else {
                            generateLogs("error", "Unable to update data in DB in graphic_db -(id = " + id + ") " + err.message);
                            res.redirect('/author_edituploadDrawDoc?id=' + id + '&msg=dberror');
                        }
                    });
                } else {
                    generateLogs("error", author + "  is not authorized to update drawing Document with id =  " + id);
                    // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
                    res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
                }
            } else {
                res.json({ status: 'error', data: null });
            }
        })
    }
};


//to redirect to edit drawing doc page
exports.editDrawingDoc = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    // var fullName = req.headers.x_myapp_fullName;
    var userMeta = req.userMeta;
    var id = req.param("id");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    graphic_db.get(req.param("id"), { revs_info: true }, function (err, body) {
        if (err) {
            alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
            res.redirect('/author_mediaGallery');

        } else {
            if (body.author == req.headers.x_myapp_whoami) {
                res.render('media/drawingUpload', { isNew:false, data: body, short: short, token: id,  tooltip: tooltip, copyright: globaldata , userMeta: userMeta});
            } else {
                generateLogs("error", author + "  is not authorized to view drawing Document with id =  " + id);
                // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
            }
        }

    });
};

// to delete an drawing doc
exports.removeDrawDoc = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var metaId = req.param('metaid');
    var meta_rev = req.param('rev');
    var rev_no = "";
    var currentUTCDate = getCurrentUTCDate();
    
    // console.log(metaId)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    graphic_db.get(metaId, { rev_info: true }, function (er, doc) {
        if (!er) {
            rev_no = doc._rev;
            if (doc.author == req.headers.x_myapp_whoami) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                graphic_db.insert({ author: "unknown", tags: "", caption: "", description: "",drawOutput:"", ctype: "", token: "", _rev: rev_no,updatedAt:currentUTCDate,createdOn:doc.createdOn,secret:"" }, metaId, function (error, body) {
                    if (!error) {
                        generateLogs("info",author+ " successfully deleted drawing Document(id = " + metaId + ")  ");
                        var timer = setTimeout(function () {
                            res.redirect('/author_mediaGallery');
                        }, 500);
                        req.once('timeout', function () {
                            clearTimeout(timer);
                        });
                    } else {
                        generateLogs("error", "drawing Document (id = " + metaId + ") not deleted. Error - " + error.message);
                        res.redirect('/author_mediaGallery?msg=dberror');
                    }
                })
            } else {
                generateLogs("error", author + "  is not authorized to delete drawing Document with id =  " + metaId);
                // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
            }
        } else {
            generateLogs("error", "Error  removing drawing Document (id = " + metaId + "). Error - " + er.message);
            res.redirect('/author_edituploadPdfDoc?id=' + id + '&msg=dberror');
        }
    })
};