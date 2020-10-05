var fs = require('fs');
var util = require('util');
var path = require('path');
var uuidV4 = require('uuid/v4');
var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var graphic_db = couchdb.use(staticObj.db_graphics);
var graphic_md_db = couchdb.use(staticObj.db_graphics_metadata);
var graphics_url = staticObj.graphics_url;

// to add a new simple chart 
exports.plotNewGraph = function (req, res) {
    var user = req.body.shortn;
    var ctype = req.body.ctype;
    var max_id_ar = [];
    var token = "";
    token = uuidV4();
    var currentUTCDate = getCurrentUTCDate();
    var secret = secretIdMedia();
    var updatedAt = currentUTCDate;
    var createdOn = currentUTCDate;
    
    var userMeta = req.userMeta;
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
                if (doc) {
                    rev_no = doc._rev;
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    graphic_db.insert({ author: user, caption: "", description: "", tags: "", ctype: ctype, token: token, layout: "", plotdata: "", _rev: rev_no ,updatedAt:updatedAt,createdOn:createdOn,secret:secret}, availableId, function (error, body) {
                        if (!error) {
                            generateLogs("info", user + " inserted a chart with free id = " + availableId);
                            res.render('media/plotChart', { author: user, short: user, id: availableId, token: token, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
                        } else {
                            res.send(error);
                        }
                    })
                } else {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    graphic_db.insert({ author: user, caption: "", description: "", tags: "", ctype: ctype, token: token, layout: "", plotdata: "" ,updatedAt:updatedAt,createdOn:createdOn,secret:secret}, availableId, function (error, body) {
                        if (!error) {
                            generateLogs("info", user + " inserted a chart with new id = " + availableId);
                            res.render('media/plotChart', { author: user, short: user, id: availableId, token: token, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
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
};

// to create an advanced plot from simple plot chart
exports.advancedPlot = function (req, res) {
    var author = req.body.shortn;
    var ctype = req.body.ctype;
    var layout = req.body.layout1;
    var plotdata = req.body.plotdata1;
    var caption = req.body.caption_edit;
    var description = req.body.description_edit;
    
    var userMeta = req.userMeta;
    var max_id_ar = [];
    var tags = req.body.tags_edit;
    var tags_ary = new Array();
    tags_ary = tags.split(",");
    var token = "";
    token = uuidV4();
    var currentUTCDate = getCurrentUTCDate();
    var secret = secretIdMedia();
    var updatedAt = currentUTCDate;
    var createdOn = currentUTCDate;
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
                if (doc) {
                    rev_no = doc._rev;
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    graphic_db.insert({ author: author, caption: caption, description: description, tags: tags_ary, ctype: ctype, token: token, layout: JSON.parse(layout), plotdata: JSON.parse(plotdata), _rev: rev_no ,updatedAt:updatedAt,createdOn:createdOn,secret:secret}, availableId, function (error, body) {
                        if (!error) {
                            generateLogs("info", author + " inserted an adv chart with free id = " + availableId);
                            res.render('media/advChart', {isNew:true , data:{}, author: author, short: author, userMeta: userMeta, layout: layout, plotdata: plotdata, caption: caption, description: description, tags: tags_ary, id: availableId, token: token, tooltip: tooltip, copyright: globaldata });
                        } else {
                            res.send(error);
                        }
                    })
                } else {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    graphic_db.insert({ author: author, caption: caption, description: description, tags: tags_ary, ctype: ctype, token: token, layout: JSON.parse(layout), plotdata: JSON.parse(plotdata) ,updatedAt:updatedAt,createdOn:createdOn,secret:secret}, availableId, function (error, body) {
                        if (!error) {
                            generateLogs("info", author + " inserted an adv chart with new id = " + availableId);
                            res.render('media/advChart', { isNew:true , data:{},author: author, short: author, userMeta: userMeta, layout: layout, plotdata: plotdata, caption: caption, description: description, tags: tags_ary, id: availableId, token: token, tooltip: tooltip, copyright: globaldata });
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
};

// to update a simple chart
exports.updatePlotGraph = function (req, res) {
    var caption = req.body.caption;
    var descr = req.body.description;
    var author = req.body.author;
    var ctype = req.body.ctype;
    var layout = req.body.layout_update;
    var plotdata = req.body.plotdata_update;
    var token = req.body.token;
    var tags = req.body.tags;
    var tags_ary = new Array();
    tags_ary = tags.split(",");
    var max_id_ar = [];
   
    var currentUTCDate = getCurrentUTCDate();

    var userMeta = req.userMeta;
    var id = req.body.id;
    if (tags_ary.length < 3) {
        res.redirect('/author_editplotgraph?id=' + id + '&msg=tagerr');
    }
    else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        graphic_db.get(id, function (err, doc) {
            updaterev = doc._rev;
            secret = doc.secret;
            if (doc.author == req.headers.x_myapp_whoami) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                graphic_db.insert({ tags: tags_ary, caption: caption, description: descr, author: author, ctype: ctype, layout: JSON.parse(layout), plotdata: JSON.parse(plotdata), token: token, _rev: updaterev,updatedAt:currentUTCDate,createdOn:doc.createdOn,secret:secret }, id, function (err, body, header) {
                    if (!err) {
                        generateLogs("info", author + "  updated chart successfully id = " + id);
                        res.redirect('/author_editplotgraph?id=' + id + '&body=' + body.ok);
                    } else {
                        generateLogs("error", "Unable to update data in DB in graphic_db - " + err.message);
                        res.redirect('/author_editplotgraph?id=' + id + '&msg=dberror');
                    }
                });
            } else {
                generateLogs("error", author + "  is not authorized to view plot with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
            }
        });
    }
};

// to update advance chart
exports.updateAdvPlotGraph = function (req, res) {
    var caption = req.body.caption;
    var descr = req.body.description;
    var author = req.body.author;
    var ctype = req.body.ctype;
    var layout = req.body.layout_update;
    var plotdata = req.body.plotdata_update;
    var token = req.body.token;
    var tags = req.body.tags;
    var tags_ary = new Array();
    tags_ary = tags.split(",");
   
    var currentUTCDate = getCurrentUTCDate();
    var userMeta = req.userMeta;
    var id = req.body.id;
    if (tags_ary.length < 3) {
        res.redirect('/author_editadvanceplot?id=' + id + '&msg=tagerr');
    }
    else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        graphic_db.get(id, function (err, doc) {
            updaterev = doc._rev;
            secret = doc.secret;
            if (doc.author == req.headers.x_myapp_whoami) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                graphic_db.insert({ tags: tags_ary, caption: caption, description: descr, author: author, ctype: ctype, layout: JSON.parse(layout), plotdata: JSON.parse(plotdata), token: token, _rev: updaterev,updatedAt:currentUTCDate,createdOn:doc.createdOn ,secret:secret}, id, function (err, body, header) {
                    if (!err) {
                        generateLogs("info", author + "  updated  adv chart successfully id = " + id);
                        res.redirect('/author_editadvanceplot?id=' + id + '&body=' + body.ok);
                    } else {
                        generateLogs("error", "Unable to update data in DB in graphic_db -(id = "+id+") " + err.message);
                        res.redirect('/author_editadvanceplot?id=' + id + '&msg=dberror');
                    }
                });
            } else {
                generateLogs("error", author + "  is not authorized to view plot with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata , userMeta: userMeta}); return;
            }
        });
    }
};

// to edit advanced chart, just redirection to edit page
exports.editadvancePlot = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var id = req.param("id");
   
    var userMeta = req.userMeta;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    graphic_db.get(req.param("id"), { revs_info: true }, function (err, body) {
        if (err) {
            alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
            res.redirect('author_mediaGallery');

        } else {
            if (body.author == req.headers.x_myapp_whoami) {
                res.render('media/advChart', {isNew:false, data: body, short: short, userMeta: userMeta, author: short, id: id, tooltip: tooltip, copyright: globaldata });
            } else {
                generateLogs("error", short + "  is not authorized to view plot with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl, userMeta: userMeta }); return;
            }
        }
    });
};


// to edit  chart, just redirection to edit page
exports.editPlotGraph = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var id = req.param("id");
    
    var userMeta = req.userMeta;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    graphic_db.get(req.param("id"), { revs_info: true }, function (err, body) {
        if (err) {
            alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
            res.redirect('author_mediaGallery');

        } else {
            if (body.author == req.headers.x_myapp_whoami) {
                res.render('media/edit_plotChart', { data: body, userMeta: userMeta, short: short, author: short, token: id, tooltip: tooltip, copyright: globaldata });
            } else {
                generateLogs("error", short + "  is not authorized to view plot with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
            }
        }
    });
};

// to insert a new advance chart
exports.newAdvPlot = function (req, res) {
    var user = req.body.shortn;
    var ctype = req.body.ctype;
    var max_id_ar = [];
    var token = "";
    token = uuidV4();
    var currentUTCDate = getCurrentUTCDate();
    var secret = secretIdMedia();
    var updatedAt = currentUTCDate;
    var createdOn = currentUTCDate;
    
    var userMeta = req.userMeta;
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
                if (doc) {
                    rev_no = doc._rev;
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    graphic_db.insert({ author: user, caption: "", description: "", tags: "", ctype: ctype, token: token, layout: "", plotdata: "", _rev: rev_no,updatedAt:updatedAt,createdOn:createdOn,secret:secret }, availableId, function (error, body) {
                        if (!error) {
                            generateLogs("info", user + " inserted a new adv chart with free id = " + availableId);
                            res.render('media/advChart', { isNew:true , data:{}, author: user, short: user, userMeta: userMeta, id: availableId, token: token, tooltip: tooltip, copyright: globaldata, layout: '', plotdata: '', caption: '', description: '', tags: '' });
                        } else {
                            res.send(error);
                        }
                    })
                } else {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    graphic_db.insert({ author: user, caption: "", description: "", tags: "", ctype: ctype, token: token, layout: "", plotdata: "" ,updatedAt:updatedAt,createdOn:createdOn,secret:secret}, availableId, function (error, body) {
                        if (!error) {
                            generateLogs("info", user + " inserted a new adv chart with new id = " + availableId);
                            res.render('media/advChart', { isNew:true , data:{}, author: user, short: user, userMeta: userMeta, id: availableId, token: token, tooltip: tooltip, copyright: globaldata, layout: '', plotdata: '', caption: '', description: '', tags: '' });
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
};

// to delete a simple chart and advanced chart
exports.removeChart = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    var metaId = req.param('chartid');
    var meta_rev = req.param('rev');
   
    var userMeta = req.userMeta;
    var rev_no = "";
    var currentUTCDate = getCurrentUTCDate();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    graphic_db.get(metaId, { rev_info: true }, function (er, doc) {
        if (!er) {
            rev_no = doc._rev;
            if (doc.author == req.headers.x_myapp_whoami) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                graphic_db.insert({ author: "unknown", tags: "", caption: "", description: "", ctype: "", token: "", layout: "", plotdata: "", _rev: rev_no ,updatedAt:currentUTCDate,createdOn:doc.createdOn,secret:""}, metaId, function (error, body) {
                    if (!error) {
                        generateLogs("info", author + " successfully deleted a chart with id =  " + metaId);
                        var timer = setTimeout(function () {
                            res.redirect('/author_mediaGallery');
                        }, 500);
                        req.once('timeout', function () {
                            clearTimeout(timer);
                        });
                    } else {
                        generateLogs("error", "Error deleting chart. Error - " + error.message);
                        res.redirect('/author_mediaGallery?msg=dberror');
                    }
                })
            } else {
                generateLogs("error", author + "  is not authorized to view plot with id =  " + metaId);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata , userMeta: userMeta}); return;
            }
        } else {
            generateLogs("error", "Error fetching data from view. Error - " + er.message);
            res.redirect('/author_mediaGallery?msg=dberror');
        }

    })
};