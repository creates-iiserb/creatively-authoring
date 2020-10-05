var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var Q = require('q');
var metadata_db = couchdb.use(staticObj.db_elements_metadata);
var playlist_db = couchdb.use(staticObj.db_playlist);
var graphics_url = staticObj.graphics_url;
var chart_url = staticObj.chart_url;
var ytvideo_url = staticObj.ytvideo_url;
var plotIframeLink =  staticObj.plotIframeLink;
var working_db = couchdb.use(staticObj.db_working);
var users = couchdb.use(staticObj.db_authors);
var publist_db = couchdb.use(staticObj.db_publist);

exports.getCommitted1 = function (req, res) {
    var refid = req.param("id");
    var short = req.headers.x_myapp_whoami;
    var user = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var pipe = req.param("pipe");
    var data_doc = new Array();
    var publistdata = new Array();
    var playlistdata = new Array();

    // get metadata 
    var getmetadata_db = function() {
        var deferred = Q.defer();
        metadata_db.view('authorToDocCommitted', 'idToSample', { key: refid }, function (err, body) {
            if (err) {
                generateLogs('error', short + " viewed commited question with id = " + refid + ", error = " + err.message);
                deferred.reject(new Error(err));
            } else {
                if (!body.rows.length) {
                deferred.resolve(0);
                } else {
                    body.rows.forEach(function (doc) {
                        data_doc.push(doc.value);
                    });
                deferred.resolve(data_doc);
                }
            }
        });
        return deferred.promise;
      };

    // get playlist 
    var getplaylist_db = function() {
        var deferred = Q.defer();
        playlist_db.view("playlistView", "getPlaylistData", { key: short }, function (err, body) {
            if (err) {
                generateLogs("error", short + " is  unable to find playlist data from the view");
                deferred.reject(new Error(err));
            } else {
                if (!body.rows.length) {
                deferred.resolve(0);
                } else {
                    body.rows.forEach(function (doc) {
                        playlistdata.push(doc.value);
                    });
                deferred.resolve(playlistdata);
                }
            }
        });
        return deferred.promise;
      };


    // get public list 
    var getpublist_db = function() {
        var deferred = Q.defer();
        for(var i=0;i<publist.length;i++){
            publist_db.view("byName", "idToData", { key: publist[i] }, function (err, body) {
                if (err) {
                    generateLogs("error", short + " is  unable to find public list name data from the view");
                    deferred.reject(new Error(err));
                } else {
                    if (!body.rows.length) {
                    deferred.resolve(0);
                    } else {
                        body.rows.forEach(function (doc) {
                            publistdata.push(doc.value);
                        });
                    deferred.resolve(publistdata);
                    }
                }
            });
        }
        return deferred.promise;
      };

};

exports.getCommitted = function (req, res) {
    // to view comitted question from dashboard_committed 
    var refid = req.param("id");
    var short = req.headers.x_myapp_whoami;
    var user = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    var pipe = req.param("pipe");
    var data_doc = new Array();
    var publistdata = [];
     var publist =[];
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    metadata_db.view('authorToDocCommitted', 'idToSample', { key: refid }, function (err, body) {
        if (!err) {
            if (body) {
                body.rows.forEach(function (doc) {
                    data_doc.push(doc.value);
                });

                 publist = data_doc[0].pubList?data_doc[0].pubList:undefined;
                 
                var playlistdata = new Array();
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                playlist_db.view("playlistView", "getPlaylistData", { key: short }, function (err, body) {
                    if (!err) {
                        body.rows.forEach(function (doc) {
                            playlistdata.push(doc.value);
                        });

                        var collb1 = new Array();
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        playlist_db.view("playlistView", "getPlaylistCollb1Data", {key:authorEmail}, function(err, body){
                            if(!err){
                                body.rows.forEach(function(doc) {
                                    collb1.push(doc.value);
                                });
                                var collb2 = new Array();
                                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                playlist_db.view("playlistView", "getPlaylistCollb2Data", {key:authorEmail}, function(err, body){
                                    if(!err){
                                        body.rows.forEach(function(doc) {
                                            collb2.push(doc.value);
                                        });
                                        if(publist==undefined || publist.length==0 ){
                                           
                                            res.render('question/view_committed', { alldoc: data_doc, playlistdata: playlistdata,collb1:collb1,collb2:collb2, publistdata:publistdata, token: refid, author: user, pipe: pipe, short: user, userMeta: userMeta, short: short, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                                        }else{
                
                                        
                                        for(var i=0;i<publist.length;i++){
                                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                            publist_db.view("byName", "idToData", { key: publist[i] }, function (err, body) {
                                                if (!err) {
                                                    body.rows.forEach(function (doc) {
                                                        publistdata.push(doc.value);
                                                    });
                
                                                    if(publist.length==publistdata.length){
                                                        res.render('question/view_committed', { alldoc: data_doc, playlistdata: playlistdata,collb1:collb1,collb2:collb2,publistdata:publistdata, token: refid, author: user, pipe: pipe, short: user, userMeta: userMeta, short: short, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink,plotIframeLink });
                                                    }
                                                } else { 
                                                    generateLogs("error", short + " is  unable to find public list name data from the view");
                                                }
                                            });
                                            
                                         }
                                       }
                                    }else {
                                        generateLogs("error", short + "  error from get playlist collaborator 2 content  ");
                                    }
                                })
                            }else {
                                generateLogs("error", short + "  error from get playlist collaborator 1 content  ");
                            }
                        })
                    } else {
                        generateLogs("error", short + " is  unable to find playlist data from the view");
                    }
                })
            } else {
                res.redirect('/author_dashboard?mod=com&msg=Error');
            }
        } else {
            generateLogs('error', short + " viewed commited question with id = " + refid + ", error = " + err.message);
            res.redirect('/author_dashboard_comm?msg=dberror');
        }
    });
};




exports.getCommittedSampleQue = function (req, res) {
    // to view sample of question from playlist
    var short = req.headers.x_myapp_whoami;
    var user = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var refid = req.param("id");
    var authList = [short];
    if(req.param("authList")){        
        authList = JSON.parse(req.param("authList"));
    }

    
        
    var data_doc = new Array();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    metadata_db.view('authorToDocCommitted', 'idToSample', { key: refid }, function (err, body) {
        if (!err) {
            if (body) {                
                body.rows.forEach(function (doc) {
                    data_doc.push(doc.value);
                });
                
                if(data_doc.length>0)   
                {

                    if(  authList.indexOf(data_doc[0].author) > -1 || data_doc[0].public == true)
                    {
                        res.render('quiz/playlistViewSample', { alldoc: data_doc, token: refid, author: user, short: user, userMeta: userMeta,short: short, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
                    }else{
                        res.render('quiz/playlistViewSampleError', { contentid: refid });
                    }
                    
                     
                }else{
                    res.render('quiz/playlistViewSampleError', { contentid: refid });

                }
                

                
            } else {
                res.redirect('/author_dashboard?mod=com&msg=Error');
            }
        } else {
            generateLogs('error', short + " viewed commited question with id= " + refid + " from playlist, error = " + err.message);
            res.redirect('/author_dashboard_comm?msg=dberror');
        }
    });
};

// render page to edit a question under development (all types) 
exports.getAuthorId = function (req, res) {
    var alldoc = "";
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var pipe = req.param("pipe");
    
    var id = req.param("id");
    var userdata_db = new Array();
    var metaDb = {};
    var err_msg = "Error occurs during fetching your data, Please Contact Administrator !!!";
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
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            metadata_db.get(id, { revs_info: false }, function (err1, bodym) {
                if (!err1) {
                    metaDb = bodym;
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    working_db.get(id, { revs_info: true }, function (err, body) {
                       if (err) {
                            generateLogs("error", short + " error in  opening question to edit with id = " + id + " Error = " + err.message);
                            alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
                            res.redirect('author_dashboard?mod=prog' + '&msg=' + alldoc);
                        } else if (body.object == "") {
                            // to create a new question 
                            var data_to_send = { data: {}, metaData: {}, isNew: true, concepts: concepts, skills: skills, pipe: pipe, userMeta: userMeta, token: id, author: author, short: short, tooltip: tooltip, copyright: globaldata }
                            res.render('question/questionDataNew', data_to_send);
                        } else {
                            // to edit a question 
                            if (metaDb.author == req.headers.x_myapp_whoami) {
                                var data_send = { isNew: false, data: body.object, metaData: metaDb, concepts: concepts, skills: skills, pipe: pipe, userMeta: userMeta, token: id, author: author, short: short, tooltip: tooltip, copyright: globaldata }
                                res.render('question/questionDataNew', data_send);
                            } else {
                                generateLogs("error", short + "  is not authozized to view question with id =  " + id);
                                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
                            }
                        }
                    });
                } else {
                    generateLogs("error", short + " error in  opening question to edit with id = " + id + " Error = " + err.message);
                    alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
                    res.redirect('author_dashboard?mod=prog' + '&msg=' + alldoc);
                }
            })
        } else {
            res.redirect('/author_dashboard?mod=prog&msg=Error');
        }
    });
};
