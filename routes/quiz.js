
var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var examineer_md = couchdb.use(staticObj.db_examineer_metadata);
var playlist_db = couchdb.use(staticObj.db_playlist);
var users = couchdb.use(staticObj.db_authors);
var httpservreq = require('../httpseverreq.js');



//redirect to quiz dashboard
exports.quiz = function (req, res) {
    var username = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var exam_data = [];
    var msg = "";
    msg = req.param("msg");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    examineer_md.view("ByAuthor", "essentials", { key: username }, function (err, doc) {
        if (!err) {
            doc.rows.forEach(function (data) {
                exam_data.push(data.value);
            });

            for (i = 0; i < exam_data.length; i++) {
                var tags = [];
                var array_string = '';
                for (v = 0; v < exam_data[i][6].length; v++) {
                    var array_string = ' ' + exam_data[i][6][v];
                    tags.push(array_string);
                }
                exam_data[i][6] = tags;
            }
            res.render('quiz/quizdash', { data: exam_data, short: username, userMeta: userMeta,msg:msg, tooltip: tooltip, copyright: globaldata });
        } else {
            res.redirect('/author_dashboard?msg=dberror');
        }
    })
};


//redirect to create new quiz page
//simple quiz not in use from 19/09/2019
exports.createQuiz = function (req, res) {
    var username = req.body.shortn;
    
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    var playlistdata = new Array();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "getPlaylistData", { key: username }, function (err, body) {
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
                            
                            var zone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
                            res.render('quiz/quizNew', { playlistdata: playlistdata,collb1:collb1,collb2:collb2, user: username, userMeta: userMeta,wbAccess:wbAccess, short: username, zone: zone, tooltip: tooltip, copyright: globaldata });
                           }else {
                            generateLogs("error", username + "  error from get playlist collaborator 2 content  ");
                        }
                    })
                }else {
                    generateLogs("error", username + "  error from get playlist collaborator 1 content  ");
                   
                }
            })
        }
         })
};


///to make new sectional quiz
exports.createSectionQuiz = function (req, res) {
    var username = req.body.shortn;
    
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    var playlistdata = new Array();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "getPlaylistData", { key: username }, function (err, body) {
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
                            
                            var zone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            users.view("ByShortName", "authorToAllEmails", {key:username}, function(err, body1){
                                if(!err)
                                {  
                                    var quizEmail = removeDuplicates(body1.rows[0].value);
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                    examineer_md.view("ByAuthor", "essentials", { key: username }, function (err, doc) {
                                        if (!err) {
                                            var exam_data=[]
                                            doc.rows.forEach(function (data) {
                                                exam_data.push(data.value);
                                            });
                                
                                            for (i = 0; i < exam_data.length; i++) {
                                                var tags = [];
                                                var array_string = '';
                                                for (v = 0; v < exam_data[i][6].length; v++) {
                                                    var array_string = ' ' + exam_data[i][6][v];
                                                    tags.push(array_string);
                                                }
                                                exam_data[i][6] = tags;
                                            }
                                       
                                            res.render('quiz/section_quiz/newSectionQuiz', {quizList: exam_data, playlistdata: playlistdata,collb1:collb1,collb2:collb2,quizEmail:quizEmail, user: username, userMeta: userMeta, short: username, zone: zone, tooltip: tooltip, copyright: globaldata,quizLang:quizLang });
                                            } else {
                                            res.redirect('/author_dashboard?msg=dberror');
                                        }
                                    })
                                    
                                }else{
                                    res.redirect("/author_create_quiz?msg=apierror");
                                }
                            
                            });
                            }else {
                            generateLogs("error", username + "  error from get playlist collaborator 2 content  ");
                            
                        }
                    })
                }else {
                    generateLogs("error", username + "  error from get playlist collaborator 1 content  ");
                    
                }
            })
        }
        })
}

//get section name according to playlist
exports.getSectionsList = function (req, res) {
    
    var userMeta = req.userMeta;
    var playlistName = req.body.name;
    var playlistId = req.body.playlistId;
    
    var sectionName = new Array();
    var sectionCon = new Array();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "idToSections", { key: playlistId }, function (err, body) {
        if (!err) {
            
            if (body.rows.length != 0) {
                var dt = body.rows[0].value;
                var fdata={};
                
                if(dt.sections){
                    dt.sections.forEach(function (doc) {
                        sectionName.push(doc.secName);
                       
                    });

                    var data = dt.sections; 
               
                    data.forEach((item1,index1) =>{
                       
                        var aa=[];
                        item1.content.forEach((itm2,index)=>{
                       
                        aa.push(itm2.item);
                        
                        fdata[sectionName[index1]] = aa;
                          
                        }) 
                    })
                }else{
                    sectionName.push("Unsectioned List");

                    for(var k=0; k<dt.content.length;k++){
                        sectionCon.push(dt.content[k].item);
                    }
                    
                    fdata["Unsectioned List"]= sectionCon;
                    
                }
               
                res.json({ status: "success", msg: "Sections List", link: "", sectionName: sectionName, sectionCon: fdata});
            }
            else {
              res.json({ status: "error", msg: "Invaild request1 !", link: "" });
            }
        }else {
            res.json({ status: "error", msg: "Invaild request2 !", link: "" });
        }
    })
};


//get section name according to playlist
exports.playlistAuthCheck = function (req, res) {
    
    var userMeta = req.userMeta;
    var playlistName = req.body.name;
    var author = req.body.author;
    var playlistId = req.body.playlistId;
      
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "idToSections", { key: playlistId }, function (err, body) {
        if (!err) {
            
            if (body.rows.length != 0) {
                var dt = body.rows[0].value;
                var playlistId = dt.id;

                httpservreq.chkItmsPlaylist(author,playlistId, function (err, body1) {
                    
                    if (!err && body1.success) {
                       
                        if(body1.unauthData.length>0){
                            res.json({ status: "error", msg: "Unauthorized Data", link: "", unauthData: body1.unauthData});
                        }else{
                            res.json({ status: "success", msg: "authorized Data", link: ""});
                        }                       
                    }else {
                        
                        console.log(err);
                        res.json({ status: "error", msg: "Invaild request !", link: "" });
                    }
                })
            }
            else {
              res.json({ status: "error", msg: "Invaild request1 !", link: "" });
            }
        }else {
            res.json({ status: "error", msg: "Invaild request2 !", link: "" });
        }
    })
};



///to make new live quiz
exports.createLiveQuiz = function (req, res) { 
    var username = req.body.shortn;
    
    var authorEmail = req.headers.x_myapp_email;
    var userMeta = req.userMeta;
    var wbAccess = req.headers.x_myapp_wbAccess;
    var playlistdata = new Array();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "getPlaylistData", { key: username }, function (err, body) {
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
                            var zone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            users.view("ByShortName", "authorToAllEmails", {key:username}, function(err, body1){
                                if(!err)
                                {  
                                    var quizEmail = removeDuplicates(body1.rows[0].value);
                                    
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                    examineer_md.view("ByAuthor", "essentials", { key: username }, function (err, doc) {
                                        if (!err) {
                                            var exam_data=[]
                                            doc.rows.forEach(function (data) {
                                                exam_data.push(data.value);
                                            });
                                
                                            for (i = 0; i < exam_data.length; i++) {
                                                var tags = [];
                                                var array_string = '';
                                                for (v = 0; v < exam_data[i][6].length; v++) {
                                                    var array_string = ' ' + exam_data[i][6][v];
                                                    tags.push(array_string);
                                                }
                                                exam_data[i][6] = tags;
                                            }
                                    // console.log(exam_data)
                                    res.render('quiz/liveQuiz/newLiveQuiz', { quizList: exam_data,playlistdata: playlistdata,collb1:collb1,collb2:collb2,quizEmail:quizEmail, user: username,userMeta: userMeta, short: username, zone: zone, tooltip: tooltip, copyright: globaldata,quizLang:quizLang }); 
                                            } else {
                                            res.redirect('/author_dashboard?msg=dberror');
                                        }
                                    })
                                }else{
                                    res.redirect("/author_create_quiz?msg=apierror");
                                }
                            
                            });
                            }else {
                            generateLogs("error", username + "  error from get playlist collaborator 2 content  ");
                            // res.redirect('/author_dashboard?msg=dberror');
                        }
                    })
                }else {
                    generateLogs("error", username + "  error from get playlist collaborator 1 content  ");
                    // res.redirect('/author_dashboard?msg=dberror');
                }
            })
        }
        })
}


//getquizTakerList
exports.getquizTakerList = function (req, res) {
    
    var userMeta = req.userMeta;
    var authorname = req.body.authorname;
    var quizId = req.body.quizId;
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    examineer_md.view("ByAuthor", "idToTakerData", { key: quizId+"-"+authorname }, function (err, body) {
        if (!err) {
           
            if (body.rows.length != 0) {
                var dta = body.rows[0].value;

                var takers = Object.values(dta.userData);

                var takArry =[];

                takers.forEach(itm =>{
                    var arr = Object.values(itm);
                    takArry.push(arr);
                })


              res.json({ status: "success", msg: "authorized Data",takerdata:takArry, link: ""});
            }
            else {
              res.json({ status: "error", msg: "Invaild request1 !", link: "" });
            }
        }else {
            console.log(err)
            res.json({ status: "error", msg: "Invaild request2 !", link: "" });
        }
    })
};
