var staticObj = require('../config.js').merge_output;
var userinfo = '';
var couchdb = require('nano')(staticObj.couchdb);
var metadata_db = couchdb.use(staticObj.db_elements_metadata);
var playlist_db = couchdb.use(staticObj.db_playlist);
var users = couchdb.use(staticObj.db_authors);
var examineer_md = couchdb.use(staticObj.db_examineer_metadata);
var graphic_db = couchdb.use(staticObj.db_graphics);
var global_db = couchdb.use(staticObj.global_db);
var workbooks_db = couchdb.use(staticObj.db_workbooks);

// to display main dashboard
exports.dashBoard = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var msg = "";
    msg = req.param("msg");
    var userdata_db_prog = new Array();
    var userdata_db_comm = new Array();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    metadata_db.view("authorToDocCommitted", "authorToDocCommitted", { key: [shortName, false] }, function (err, body) {
        if (!err) {
            body.rows.forEach(function (doc) {
                userdata_db_prog.push(doc.value);
            });
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            metadata_db.view("authorToDocCommitted", "authorToDocCommitted", { key: [shortName, true] }, function (err, body) {
                if (!err) {
                    body.rows.forEach(function (doc) {
                        userdata_db_comm.push(doc.value);
                    });
                    var playlistdata = new Array();
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    playlist_db.view("playlistView", "getPlaylistData", { key: shortName }, function (err, body) {
                        if (!err) {
                            body.rows.forEach(function (doc) {
                                playlistdata.push(doc.value);
                            });
                            var quiz_data = new Array();
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            examineer_md.view("ByAuthor", "essentials", { key: shortName }, function (err, doc) {
                                if (!err) {
                                    doc.rows.forEach(function (data) {
                                        quiz_data.push(data.value);
                                    });
                                    var mediaData = new Array();
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                    graphic_db.view('graphicsView', 'getGraphicsDataNoBase64', { key: shortName }, function (err, doc) {
                                        // console.log(err);
                                        if (!err) {
                                            doc.rows.forEach(function (img) {
                                                mediaData.push(img.value);
                                            })
                                            var workbookData = new Array();
                                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                            workbooks_db.view('author', 'authorToWbDashData', { key: shortName }, function (err, doc) {
                                                // console.log(err);
                                                if (!err) {
                                                    doc.rows.forEach(function (wb) {
                                                        workbookData.push(wb.value);
                                                    })
                                                    res.render('question/dashboard', { workbookData:workbookData.length,mediaData: mediaData.length, quizdata: quiz_data.length, userdata_prog: userdata_db_prog.length, userdata_comm: userdata_db_comm.length, playlistdata: playlistdata.length, msg: msg, short: shortName, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
                                                } else {
                                                    // console.log("error from media ");
                                                    generateLogs("error", shortName + " is  unable to find media from the view");
                                                }
                                            })
                                             } else {
                                            // console.log("error from media ");
                                            generateLogs("error", shortName + " is  unable to find media from the view");
                                        }
                                    })
                                } else {
                                    // console.log("error from quiz");
                                    generateLogs("error", shortName + " is  unable to find quiz data from the view");
                                }
                            })
                        } else {
                            // console.log("error from playlist");
                            generateLogs("error", shortName + " is  unable to find playlist data from the view");
                        }
                    })
                } else {
                    // console.log("error from committed content");
                    generateLogs("error", shortName + " is  unable to find commited content  data from the view");
                }
            });
        } else {
            generateLogs("error", shortName + " is  unable to find content under dev data from the view");
        }
    })
};

// to display content under dev dashboard
exports.dashBoard_prog = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var msg = "";
    msg = req.param("msg");
    var userdata_db =[];
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    metadata_db.view("authorToDocCommitted", "authorToDocCommitted", { key: [shortName, false] }, function (err, body) {
        if (!err) {
            body.rows.forEach(function (doc) {
                userdata_db.push(doc.value);
            });
           
            for (i = 0; i < userdata_db.length; i++) {
                var tags = [];
                var array_string = '';
                if(userdata_db[i][1].length>0){
                    for (v = 0; v < userdata_db[i][1].length; v++) {
                        var array_string = ' ' + userdata_db[i][1][v];
                        tags.push(array_string);
                    }
                }
                
                userdata_db[i][1] = tags;
            }
            res.render('question/dashboard_prog', { userdata: userdata_db, mod: "prog", msg: msg, short: shortName, user_info: userinfo, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
        } else {
            generateLogs("error", shortName + " is  unable to find content under dev data from the view");
        }
    })
};

// to display commited content dashboard
exports.dashBoard_comm = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
  
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    var msg = "";
    msg = req.param("msg");
    var userdata_db = new Array();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    metadata_db.view("authorToDocCommitted", "authorToDocCommitted", { key: [shortName, true] }, function (err, body) {
        if (!err) {
            body.rows.forEach(function (doc) {
                userdata_db.push(doc.value);
            });
            for (i = 0; i < userdata_db.length; i++) {
                var tags = [];
                var array_string = '';
                for (v = 0; v < userdata_db[i][1].length; v++) {
                    var array_string = ' ' + userdata_db[i][1][v];
                    tags.push(array_string);
                }
                userdata_db[i][1] = tags;
            }
            var playlistdata = new Array();
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            playlist_db.view("playlistView", "getPlaylistData", { key: shortName }, function (err, body) {
                // console.log(err);  
                if (!err) {
                    body.rows.forEach(function (doc) {
                        playlistdata.push(doc.value);
                    });

                    var collb1 = new Array();
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    playlist_db.view("playlistView", "getPlaylistCollb1Data", {key:authorEmail}, function(err, body){
                        // console.log(err);   
                        if(!err){
                            body.rows.forEach(function(doc) {
                                collb1.push(doc.value);
                            });
                            
                            var collb2 = new Array();
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            playlist_db.view("playlistView", "getPlaylistCollb2Data", {key:authorEmail}, function(err, body){
                                // console.log(err);   
                                if(!err){
                                    body.rows.forEach(function(doc) {
                                        collb2.push(doc.value);
                                    });
                                    // console.log("collb2=========="+collb2);
                                    res.render('question/dashboard_comm', { userdata: userdata_db, playlistdata: playlistdata,collb1:collb1,collb2:collb2,userMeta:userMeta, mod: "com", msg: msg, short: shortName, user_info: userinfo, tooltip: tooltip, copyright: globaldata });
                                     }else {
                                    generateLogs("error", shortName + "  error from get playlist collaborator 2 content  ");
                                    }
                            })
                        }else {
                            generateLogs("error", shortName + "  error from get playlist collaborator 1 content  ");
                            }
                    })
                    } else {
                    // console.log("getplylist error");
                    generateLogs("error", shortName + " is  unable to find playlist data from the view");
                }
            })
        } else {
            generateLogs("error", shortName + " is  unable to find commited content  data from the view");
        }
    });
};

