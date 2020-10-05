var staticObj = require('../config.js').merge_output;
var httpservreq = require('../httpseverreq.js');
var couchdb = require('nano')(staticObj.couchdb);
var users = couchdb.use(staticObj.db_authors);
var playlist_db = couchdb.use(staticObj.db_playlist);//
var metadata_db = couchdb.use(staticObj.db_elements_metadata);


//; to get all recent view questions of user
exports.getAllRecentViewQuestions = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    users.get(author, function (err, body) {
        if (!err) {
            recentView = (Array.isArray(body.recentView)) ? body.recentView : [];
            res.json({ "status": "ok", "recentViewQuestions": recentView });
        }
    });
};


//; add questions to recent view
exports.addToRecenteViewQuestion = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    users.get(author, function (err, body) {
        if (!err) {             
           
            body.recentView = req.body.recentView;
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            users.insert(body, function (err, body) {
                if (!err) {
                    res.json({ "status": "ok" });
                }
                else {
                    res.json({ "status": "fail" });
                }
            });
        } else {
            res.json({ "status": "fail" });
        }
    });
};


//; 
exports.allRecentViewQuestions = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var user = req.headers.x_myapp_whoami;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    users.get(author, function (err, body) {
        if (!err) {
            body.basket = (Array.isArray(body.basket)) ? body.basket : [];
            var basketquestions = body.basket;
            body.recentView = (Array.isArray(body.recentView)) ? body.recentView : [];
            var recentView = body.recentView;
            var recentViewQids = recentView.map(function (obj) {
                return obj.qid;
            });

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            metadata_db.view('authorToDocCommitted', 'idToSample', { 'keys': recentViewQids }, function (err, body) {
                if (!err) {
                    var questiondata = new Array();
                    var questionstrids = '';
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    body.rows.forEach(function (doc) {
                        var indexnumber = recentView.findIndex(function (obj) {
                            return doc.id === obj.qid;
                        });
                        var lastViewdatetime = recentView[indexnumber].datetime;
                        doc.value.lastView = lastViewdatetime;

                        var tagArr = doc.value.tags
                        tagArr = tagArr.reduce(function (a, b) {
                            return a.concat(b);
                        }, []);

                        doc.value.tags = tagArr;
                        questiondata.push(doc.value);
                        questionstrids = questionstrids + doc.value.id + ',';
                    });

                    questionstrids = questionstrids.slice(0, -1);
                    var playlistdata = new Array();
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    playlist_db.view("playlistView", "getPlaylistData", { key: short }, function (err, body) {
                        if (!err) {
                            body.rows.forEach(function (doc) {
                                playlistdata.push(doc.value);
                            });

                            var data = {
                                questiondata: questiondata,
                                basket: basketquestions
                            }
                            res.render('question/recentView', { data: data, isAngular: true, userMeta: userMeta, msg: '', copyright: globaldata, tooltip: tooltip, playlistdata: playlistdata, short: user, questionstrids: questionstrids, basketquestions: basketquestions });
                        } else {
                            res.redirect('/author_dashboard_comm?msg=dberror');
                        }
                    });
                } else {
                    res.redirect('/author_dashboard_comm?msg=dberror');
                }
            });
        } else {
            res.redirect('/author_dashboard?mod=com&msg=Error');
        }
    });
};