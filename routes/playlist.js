var fs = require('fs');
var path = require('path');
var objectMerge = require('object-merge');
var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var playlist_db = couchdb.use(staticObj.db_playlist);
var users = couchdb.use(staticObj.db_authors);
var metadata_db = couchdb.use(staticObj.db_elements_metadata);
var working_db = couchdb.use(staticObj.db_working);
var db_examineer_metadata = couchdb.use(staticObj.db_examineer_metadata);
var graphics_url = staticObj.graphics_url;
var chart_url = staticObj.chart_url;
var ytvideo_url = staticObj.ytvideo_url;
var plotIframeLink =  staticObj.plotIframeLink;
var httpservreq = require('../httpseverreq.js');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var jade = require('jade');

// to add a new playlist 
exports.addPlaylist = function (req, res) {
    var author = req.body.author;
    var playlist_name = req.body.playlist_name.trim();
    playlist_name = playlist_name.replace(/\s\s+/g, ' ');
    var ques_ids = [];
    var max_id_ar = [];
    var currentUTCDate = getCurrentUTCDate();
    var sections = [{"secName": "Section 1","content": []},{"secName": "Section 2","content": []},{"secName": "Section 3","content": []},{"secName": "Section 4","content": []},{"secName": "Section 5","content": []}];
    
    var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;

    var createdOn = currentUTCDate;
    
    var userMeta = req.userMeta;
    if (playlist_name != "") {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        playlist_db.view("getMaxId", "getavailableId", function (er, result) {
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
                playlist_db.view("playlistView", "findPlaylistName", { key: [author, playlist_name] }, function (err, body, headers) {
                    if (!err) {
                        if (body.rows.length != 0) {
                            res.redirect('/author_playlist_dash?msg=check_msg');
                        }
                        else if (body.rows.length == 0) {
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            playlist_db.get(availableId, function (err, doc) {
                                if (!err) {
                                    if (doc) {
                                        rev_no = doc._rev;
                                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                        playlist_db.insert({ author: author, name: playlist_name,description:"", content: [],collaborator:[],sections:sections, updatedAt:updateAt,createdOn:createdOn, _rev: rev_no }, availableId, function (error, body) {
                                            if (!error) {
                                                generateLogs("info", author + " added a new playlist with free id = " + availableId);
                                                res.redirect('/author_playlist_dash');
                                            } else {
                                                generateLogs("error", "Unable to add playlist . Error - " + error.message);
                                                res.redirect('/author_playlist_dash?msg=dberror');
                                            }
                                        })
                                    }
                                } else {
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                    playlist_db.insert({ author: author, name: playlist_name,description:"", content: [],collaborator:[],sections:sections, updatedAt:updateAt,createdOn:createdOn, }, availableId, function (error, body) {
                                        if (!error) {
                                            generateLogs("info", author + " added a new playlist with new id = " + availableId);
                                            res.redirect('/author_playlist_dash');
                                        } else {
                                            generateLogs("error", "Unable to add playlist . Error - " + error.message);
                                            res.redirect('/author_playlist_dash?msg=dberror');
                                        }
                                    })
                                }
                            });
                        }
                        else {

                            generateLogs("error", "Unable to add playlist  . Error - " + err.message);
                            res.redirect('/author_playlist_dash?msg=error_msg');
                        }
                    }
                })
            } else {
                generateLogs("error", "Unable to fetch playlist  . Error - " + er.message);
                res.redirect('/author_playlist_dash?msg=dberror');
            }
        })
    }
    else {
        res.redirect('/author_playlist_dash?msg=nameBlank');
    }
};

// to get playlist data page
exports.getPlaylistData = function (req, res) {
    
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var id = req.param("id");
    var userdata_db = '';
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.get(req.param("id"), { revs_info: true }, function (err, body) {
        if (err) {
            alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
            res.redirect('author_playlist_dash?msg=' + alldoc);
        } else {
            var collb = body.collaborator;
            if (body.author == req.headers.x_myapp_whoami || collb.indexOf(authorEmail) >-1) {

                var quesArry = new Array();
                if(body.sections){
                    var contentItm = body.sections;
                    // console.log(contentItm); 
                    contentItm.forEach(item1 =>{
                        item1.content.forEach(itm2=>{
                            quesArry.push(itm2.item);
                            
                        })
                    })
                }else{
                    var contentItm = body.content;
                    // console.log(contentItm); 
                    contentItm.forEach(itm2=>{
                        quesArry.push(itm2.item);
                        // 
                    })
                }

                

                httpservreq.getAuthorFullnameEmail([body.author], function (err, ownerBody) {
                   
                    if (!err && ownerBody.success) {

                        var ownerName = body.author;
                        if(ownerBody.userdata.length>0){
                           let  ownerFullName = ownerBody.userdata[0].value.fullName.trim();
                            if(ownerFullName!=""){
                                ownerName = ownerFullName;
                            }else{
                                ownerName = ownerBody.userdata[0].value.email.trim();
                            }
                        }
                        

                        httpservreq.chkItmsPlaylist(author,id, function (err, body1) {
                            // console.log(body.success);
                            if (!err && body1.success) {
        
                                if(body.collaborator && body.collaborator.length>0 ){
                                   
                                    res.render('quiz/playlistEdit', { data: body,collbData:body1.collbData,quesArry:quesArry,itmData:body1.itmData,unauthData:body1.unauthData,validAuthor:body1.validAuthor, token: id, author: author, short: short, userMeta: userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink,ownerName:ownerName });
                                }else{
                                    
                                    res.render('quiz/playlistEdit', { data: body,collbData:[],quesArry:quesArry,itmData:body1.itmData,unauthData:body1.unauthData,validAuthor:body1.validAuthor, token: id, author: author, short: short, userMeta: userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink,ownerName,ownerName });
                                }
        
                            }else {
                                // console.log("----error11----");
                                console.log(err);
                                }
                        })
                        
                    }else{
                        // console.log("----ownerbody error----");
                        console.log(err);
                    }
                });

                
            } else {
                generateLogs("error", author + "  is not authorized to view playlist  with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
            }
        }
    })
};

// to update a playlist name
exports.updatePlaylist = function (req, res) {
    var playlist_name = req.body.playlist_name.trim();
    playlist_name = playlist_name.replace(/\s\s+/g, ' ');
    
    var userMeta = req.userMeta;
    var author = req.body.author;
    var short = req.body.author;
    var id = req.body.token;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var currentUTCDate = getCurrentUTCDate();

    var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "findPlaylistName", { key: [author, playlist_name] }, function (err, body, headers) {
        if (!err) {
            if (body.rows.length != 0) {
                res.redirect('/author_getPlaylistData?id=' + id + '&msg=nameerror');
            }
            else if (body.rows.length == 0) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                playlist_db.get(id, function (err, doc) {
                    updaterev = doc._rev;
                    content = doc.content;
                    sections = doc.sections;
                    createdOn=doc.createdOn;
                    var collab = doc.collaborator;
                    if(doc.description){
                        var description = doc.description;
                    }else{
                        var description = "";
                    }
                    
                    if (doc.author == req.headers.x_myapp_whoami) {
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        playlist_db.insert({ author: author, name: playlist_name,description:description, content: content,collaborator:collab,sections:sections, updatedAt:updateAt,createdOn:createdOn, _rev: updaterev }, id, function (err, body, header) {
                            if (!err) {
                                generateLogs("info", author + "  updated playlist name with id =  " + id);
                                res.redirect('/author_getPlaylistData?id=' + id + '&body=' + body.ok);
                            } else {
                                generateLogs("error", author + "  unable to  updated playlist name with id =  " + id);
                                res.redirect('/author_getPlaylistData?id=' + id + '&msg=dberror');
                            }
                        });
                    } else {
                        generateLogs("error", author + "  is not authorized to view playlist  with id =  " + id);
                        res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata , userMeta: userMeta}); return;
                    }
                });
            }
            else {
                console.log(staticObj.some_error_here);
                res.redirect('/author_getPlaylistData?id=' + id + '&msg=error');
            }
        } else {
            generateLogs("error", "Error  updating playlist name . Error - " + err.message);
            res.redirect('/author_getPlaylistData?id=' + id + '&msg=dberror');
        }
    })
};


// to update a playlist desp
exports.updatePlaylistDesp = function (req, res) {
    var playlist_desp = req.body.playlist_desp
    
    var userMeta = req.userMeta;
    var author = req.body.author;
    var short = req.body.author;
    var id = req.body.token;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var currentUTCDate = getCurrentUTCDate();

    var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.get(id, function (err, doc) {
        updaterev = doc._rev;
        content = doc.content;
        sections = doc.sections;
        var collab = doc.collaborator;
        createdOn=doc.createdOn;
        var name = doc.name;
        if (doc.author == req.headers.x_myapp_whoami) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            playlist_db.insert({ author: author, name: name, content: content,collaborator:collab,sections:sections,description:playlist_desp, updatedAt:updateAt,createdOn:createdOn, _rev: updaterev }, id, function (err, body, header) {
                if (!err) {
                    generateLogs("info", author + "  updated playlist name with id =  " + id);
                    res.redirect('/author_getPlaylistData?id=' + id + '&body=' + body.ok);
                } else {
                    generateLogs("error", author + "  unable to  updated playlist name with id =  " + id);
                    res.redirect('/author_getPlaylistData?id=' + id + '&msg=dberror');
                }
            });
        } else {
            generateLogs("error", author + "  is not authorized to view playlist  with id =  " + id);
            res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl ,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta}); return;
        }
    });
};

// to delete a playlist
exports.removePlaylist = function (req, res) {
    var author = req.body.short;
    var playlistId = req.body.id;
    var playlist_rev = req.body.rev;
    
    var userMeta = req.userMeta;
    var currentUTCDate = getCurrentUTCDate();

    var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;

    var rev_no = "";
    var sections = [{"secName": "Section 1","content": []},{"secName": "Section 2","content": []},{"secName": "Section 3","content": []},{"secName": "Section 4","content": []},{"secName": "Section 5","content": []}];
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.get(playlistId, { rev_info: true }, function (er, doc) {
        if (!er) {
            rev_no = doc._rev;
            if (doc.author == req.headers.x_myapp_whoami) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                playlist_db.insert({ author: "unknown", name: "", content: "",description:"",collaborator:[],sections:sections, updatedAt:updateAt,createdOn:"", _rev: rev_no }, playlistId, function (error, body) {
                    if (!error) {
                        generateLogs("info", author + " successfully deleted playlist id  =  " + playlistId);
                        var timer = setTimeout(function () {
                            res.redirect('/author_playlist_dash');
                        }, 500);
                        req.once('timeout', function () {
                            clearTimeout(timer);
                        });
                    } else {
                        generateLogs("error", author + "  is not able to delete playlist id  =  " + playlistId);
                        res.redirect('/author_getPlaylistData?id=' + playlistId + '&msg=dberror');
                    }
                })
            } else {
                generateLogs("error", author + "  is not authorized to remove playlist  with id =  " + playlistId);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata , userMeta: userMeta}); return;
            }
        } else {
            generateLogs("error", "Error  deleting playlist . Error - " + er.message);
            res.redirect('/author_getPlaylistData?id=' + playlistId + '&msg=dberror');
        }

    })
};

// to delete an item and update the playlist
exports.deleteAndUpdateItem = function (req, res) {
    var playlist_name = req.body.playlist_name_del;
    var ques_ids = req.body.ques_ids1;
    
    var userMeta = req.userMeta;
    var author = req.body.author;
    var short = req.body.author;
    var id = req.body.token;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var takers_data = req.body.takers_data;
    var currentUTCDate = getCurrentUTCDate();
    var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.get(id, function (err, doc) {
        updaterev = doc._rev;
        var collab = doc.collaborator;
        var playlistAuthor = doc.author;
         var createdOn=doc.createdOn;

        if(doc.description){
            var description = doc.description;
        }else{
            var description = "";
        }

       
        if(playlistAuthor  == author){
        
            if (doc.author == req.headers.x_myapp_whoami) {
                
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                playlist_db.insert({ author: playlistAuthor, name: playlist_name,description:description, content: JSON.parse(ques_ids),collaborator:collab,sections:JSON.parse(takers_data), updatedAt:updateAt,createdOn:createdOn, _rev: updaterev }, id, function (err, body, header) {
                    if (!err) {
                        generateLogs("info", author + " successfully deleted item  from playlist name  =  " + playlist_name);
                       res.json({ status: "success", msg: "Item deleted !", link: "" });
                        
                    } else {
                      
                        res.json({ status: "error", msg: "Error: Please Contact Administrator", link: "" });
                    }
                });
            } else {
                generateLogs("error", author + "  is not authorized to remove items in playlist  with id =  " + id);
                res.json({ status: "error", msg: "Unauthorized User", link: "" });
                // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" ,studentUrl:staticObj.studentUrl }); return;
            }
        }else{
            res.json({ status: "error", msg: "Only author is authorized to remove this item from Playlist", link: "" });
           
        }
    });
};

// to add item to playlist
exports.addToPlaylist = function (req, res) {
    var ques_ids = req.body.ques_ids1;
    var id = req.body.playlist_name1;
    var sectionId = req.body.section_name1;
    var author = req.body.author;
    var short = req.body.author;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
   
    var userMeta = req.userMeta;
    if (ques_ids != "" && id != "") {

        httpservreq.addQuesToPlaylist(author,id,ques_ids,{public:false},sectionId, function (err, body) {
            if (!err && body.success) {
                generateLogs("info", author + " successfully added item id=(" + ques_ids + ") in playlist id =  " + id);
                res.redirect('/author_dashboard_comm?msg=itemAdded');
            } else {
                if(body.success==false && body.maxLen == true){
                    generateLogs("error", author + "  Maximum number of items allowed in a playlist is 50");
                    res.redirect('/author_dashboard_comm?msg=maxlist');
                }else{
                    generateLogs("error", author + "  was not able to add item id=(" + ques_ids + ") in playlist id =  " + id);
                    res.redirect('/author_dashboard_comm?msg=dberror');
                }
            }
        });


    }
    else if (id == "") {
        res.redirect('/author_dashboard_comm?msg=noPlaylist');
         }
    else {
        res.redirect('/author_dashboard_comm?msg=noItem');
         }
};

// to update order of playlist items
exports.arrAndUpdateItems = function (req, res) {
    var playlist_name = req.body.playlist_name_arr;
    
    var author = req.body.author;
    var short = req.body.author;
    var id = req.body.token;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var takers_data = req.body.takers_data;
    
    var userMeta = req.userMeta;
    var collbData11 = req.body.collbData11;
    var currentUTCDate = getCurrentUTCDate();
    var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;
    
    var collb_arry = new Array();
    collb_arry = collbData11.split(",");

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.get(id, function (err, doc) {
        if (!err) {
            updaterev = doc._rev;
            var collab = doc.collaborator;
            var content =  doc.content;
            var playlistAuthor = doc.author;
            var createdOn=doc.createdOn;
            if(doc.description){
                var description = doc.description;
            }else{
                var description = "";
            }
            
            if (collb_arry.indexOf(doc.author)>-1) { 
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                playlist_db.insert({ author: playlistAuthor, name: playlist_name,description:description, content:content,collaborator:collab,sections:JSON.parse(takers_data), updatedAt:updateAt,createdOn:createdOn, _rev: updaterev }, id, function (err, body, header) {
                    if (!err) {
                        generateLogs("info", author + " successfully updated item order in playlist id =  " + id);
                        res.redirect('/author_getPlaylistData?id=' + id + '&body=' + body.ok);
                    } else {
                        res.redirect('/author_getPlaylistData?id=' + id + '&msg=dberror');
                    }
                });
            } else {
                generateLogs("error", author + "  is not authorized to arrange playlist items with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
            }
        }
    });
};


/// to redirect on playlist dashboard
exports.playlistDash = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    var msg = "";
    msg = req.param("msg");
    var playlistdata = new Array();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "getPlaylistData", { key: shortName }, function (err, body) {
        if (!err) {
            body.rows.forEach(function (doc) {
                playlistdata.push(doc.value);
            });
          
            var playlistCon = new Array();
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            playlist_db.view("playlistView", "getPlaylistContent", { key: shortName }, function (err, body) {
                if (!err) {
                    body.rows.forEach(function (cont) {
                        playlistCon.push(cont.value);
                    })

                    var collb1 = new Array();
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    playlist_db.view("playlistView", "getPlaylistCollb1Data", {key:authorEmail}, function(err, body){
                        //console.log(err);   
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
                              
                                    res.render('quiz/playlistDash', { playlistdata: playlistdata,collb1:collb1,collb2:collb2, playlistCon: playlistCon, msg: msg, short: shortName, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
                                }else {
                                    generateLogs("error", author + "  error from get playlist collaborator 2 content  ");
                                    res.redirect('/author_dashboard?msg=dberror');
                                }
                            })
                        }else {
                            generateLogs("error", author + "  error from get playlist collaborator 1 content  ");
                            res.redirect('/author_dashboard?msg=dberror');
                        }
                    })
                    // res.render('quiz/playlistDash', { playlistdata: playlistdata, playlistCon: playlistCon, msg: msg, short: shortName, fullName: fullName, tooltip: tooltip, copyright: globaldata });
                } else {
                    generateLogs("error", author + "  error from get playlist content  ");
                    res.redirect('/author_dashboard?msg=dberror');
                }
            })
        } else {
            res.redirect('/author_dashboard?msg=dberror');
        }
    });
};


exports.addCollab = function (req, res) {
    
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    var collbName = req.body.collbName;
    var author = req.body.author;
    var short = req.body.author;
    var id = req.body.token;
   collbName = collbName.trim();

   var currentUTCDate = getCurrentUTCDate();
   var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;

    if(collbName !=''){
        if(collbName != authorEmail ){
            var playlistdata = new Array();
            
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            playlist_db.get(id, function (err, doc) {
                if (!err) {
                    if (doc) {
                        var rev_id = doc._rev;
                        var collaborator = doc.collaborator;

                            if(collaborator){
                                if(collaborator.length == 0){
                                    collaborator = [collbName];
                                }
                                else{
                                    if(collaborator.length<2){
                                        let searchCollab = collaborator.indexOf(collbName);
                                        if(searchCollab > -1){
                                            return res.json({ status: "error", msg: "Collaborator already exist!", link: "" });
                                        }else{
                                            collaborator.push(collbName);
                                        }
                                    }else{
                                        // console.log('max collab added is 2');
                                        return res.json({ status: "error", msg: "Maximum 2 Collaborator can be added !", link: "" });
                                        
                                    }
                                }
                            }else{
                                collaborator = [collbName];
                            }

                            var userData = doc;
                            userData.collaborator = collaborator;
                            userData.updatedAt = updateAt;
                           
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            playlist_db.insert(userData, function (err, body) {
                                if (!err) {

                                    // send email to collab
                                    var jadeFormat = jade.compileFile(staticObj.verify_collabs);
                                    if(userMeta.fullName.trim()=='')
                                    {
                                        userMeta.fullName = authorEmail;
                                    }
                                    users.view("getUserData", "findEmail", { key: [collbName]}, function (err, bodyCol, headers) {
                                        if (!err) {
                                          if (bodyCol.rows.length != 0) {
                                              var data = bodyCol.rows[0].value;
                                              var collabFullName = data.fullName;
                                              if(collabFullName.trim()=='')
                                              {
                                                collabFullName = data.email;
                                              }

                                                        mail_temp = jadeFormat({ authorName: userData.author, authorFullName:userMeta.fullName, playlistId: userData._id, playlistName: userData.name,collbName:collbName, serverUrl: staticObj.main_server_url,collabFullName:collabFullName });
                                                        // console.log()
                                                        var req_type = "send_mail";
                                                        var user_mail_info_02 = new Object;
                                                        user_mail_info_02.to = collbName;
                                                        user_mail_info_02.sub = "Collaborator Added";
                                                        user_mail_info_02.body = mail_temp;

                                                        var randomId = randID();

                                                       
                                                        //============== from http server request =============================
                                                        httpservreq.httpReq(randomId, req_type,user_mail_info_02, author, function (err, body) {
                                                            if (!err && body.success) {
                                                            var count = 0;
                                                            var myVar = setInterval(function () { myTimer() }, 1500);
                                                            function myTimer() {
                                                                count = count + 1;
                                                                if (body.result.length != 0) {
                                                                var status = JSON.parse(body.result)
                                                                if (status.success) {
                                                                    console.log('Mail sent');
                                                                  
                                                                    res.json({ status: "success", msg: " Collaborator added !", link: "" });
                                                                    myStopFunction()
                                                                }
                                                                else {
                                                                    console.log('unable to send mail sent');
                                                                    res.json({ status: "error", msg: staticObj.mail_send_fail, link: "" });
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
                                                       

                                          }else{
                                            return res.json({ status: "error", msg: "Collaborator is not exist", link: "" });
                                          }
                                        }
                                        else {
                                            res.json({ status: "error", msg: "Error: Please Contact Administration", link: "" });
                                        }
                                      })
}
                                else {
                                    console.log('Unable to process !');
                                    res.json({ status: "error", msg: " Unable to process !", link: "" });
                                }
                            })
                        
                    }else {
                        generateLogs("error", author + "  was not able to find document of id=(" + id + ") in playlist " );
                        // res.redirect('/author_getPlaylistData?id=' + id + '&msg=dberror');
                        res.json({ status: "error", msg: "Error: Please Contact Administration", link: "" });
                    }
                } else {
                    generateLogs("error", author + "  was not able to find document of id=(" + id + ") in db with err " +  err);
                    // res.redirect('/author_getPlaylistData?id=' + id + '&msg=dberror');
                    res.json({ status: "error", msg: "Error: Please Contact Administration", link: "" });
                }
            })
        }else{
            return res.json({ status: "error", msg: "Playlist author cannot be a collaborator", link: "" });
        }
    }else{
        return res.json({ status: "error", msg: "Input field cannot be empty ", link: "" });
    }
};


// deletecollab from playlist 
exports.deleteCollab = function (req, res) {
    
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    var author = req.body.author;
    var playlistId = req.body.playlistId;
    var currentUTCDate = getCurrentUTCDate();
    var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "getPlaylistDataByID", { key: [req.body.playlistId, req.body.author] }, function (err, body, headers) {
      if (!err) {
        if (body.rows.length != 0) {
          body.rows.forEach(function (data) {
            var collb = req.body.collab;
            var allcollb = data.value.collaborator;
  
            var i = allcollb.indexOf(collb);
            allcollb.splice(i, 1);
            
            var rev_id = data.value._rev;
            var user_data = new Object;
            user_data = data.value;
            user_data.collaborator = allcollb;
            user_data.updatedAt = updateAt;
           
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            playlist_db.insert(user_data, function (err, body) {
            //   console.log(err);
              if (!err) {
                 
                 if(userMeta.fullName.trim()=='')
                 {
                    userMeta.fullName = authorEmail;
                 }

                users.view("getUserData", "findEmail", { key: [collb]}, function (err, bodyCol, headers) {
                    if (!err) {
                      
                          var data = bodyCol.rows[0].value;
                          var collabFullName = data.fullName;
                          if(collabFullName.trim()=='')
                          {
                            collabFullName = data.email;
                          }
                            
                            // send email to collab
                            var jadeFormat = jade.compileFile(staticObj.remove_collabs);
                            mail_temp = jadeFormat({ authorName: user_data.author, authorFullName:userMeta.fullName, playlistId: user_data._id, playlistName: user_data.name,collbName:collb, serverUrl: staticObj.main_server_url,collabFullName:collabFullName });
                            //  console.log()
                            var req_type = "send_mail";
                            var user_mail_info_02 = new Object;
                            user_mail_info_02.to = collb;
                            user_mail_info_02.sub = "Collaborator Removed";
                            user_mail_info_02.body = mail_temp;

                            var randomId = randID();

                           //============== from http server request =============================
                            httpservreq.httpReq(randomId, req_type,user_mail_info_02, author, function (err, body) {
                                if (!err && body.success) {
                                var count = 0;
                                var myVar = setInterval(function () { myTimer() }, 1500);
                                function myTimer() {
                                    count = count + 1;
                                    if (body.result.length != 0) {
                                    var status = JSON.parse(body.result)
                                    if (status.success) {
                                        console.log('Mail sent');
                                       
                                        res.json({ status: "success", msg: " collaborator deleted !", link: "" });
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
                                //console.log("error===========" + err);
                                res.json({ status: "error", msg: staticObj.Unable_to_process, link: "" });
                               
                                }
                            });
                            
                            ////////////////////////////////////////////////  
                        }
                        else {
                            res.json({ status: "error", msg: "Error: Please Contact Administration", link: "" });
                        }
                      })
              }
              else {
                console.log('Unable to process !');
                // console.log(err);
                res.json({ status: "error", msg: " Unable to process !", link: "" });
              }
            })
          })
        }
        else {
          console.log('Invaild request !');
          res.json({ status: "error", msg: " Invaild request !", link: "" });
        }
      }
      else {
        console.log('Invaild request !');
        res.json({ status: "error", msg: " Invaild request !", link: "" });
      }
    });
  }


  //check email is vaild or nor
  exports.check_allowed_email = function (req, res) {
   
    var userMeta = req.userMeta;
    var collbemail = req.body.email;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    users.view("getUserData", "findEmail", { key: [collbemail]}, function (err, body, headers) {
      if (!err) {
        if (body.rows.length != 0) {
            var data = body.rows[0].value;

            if(data.verified== true) {
                res.end("email allowed");  
            }else{
                res.end("email_not_active");
            }
        
        }else{
            res.end("email_not_allow");
        }
      }
      else {
        logError(err.message);
        res.end("some error here !");
      }
    })
  }
  
// to empty playlist items
exports.emptyPlaylist = function (req, res) {
    var playlistId = req.body.playlistId;
    var author = req.body.author;
    
    var userMeta = req.userMeta;
    var currentUTCDate = getCurrentUTCDate();
    var updateAt = {};
    updateAt["updateAt"]=currentUTCDate;
    updateAt["updateBy"]=author;

    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.get(playlistId, function (err, doc) {
        if (!err) {
            updaterev = doc._rev;
            var playlistAuthor = doc.author;
            var sections = [{"secName": "Section 1","content": []},{"secName": "Section 2","content": []},{"secName": "Section 3","content": []},{"secName": "Section 4","content": []},{"secName": "Section 5","content": []}];
            
            var user_data = new Object;
            user_data = doc;
            user_data.sections = sections;
            user_data.content = [];
            user_data.updatedAt = updateAt;
           
            if(playlistAuthor  == author){
                if (doc.author == req.headers.x_myapp_whoami ) { 
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    playlist_db.insert(user_data, playlistId, function (err, body, header) {
                        if (!err) {
                            generateLogs("info", author + " successfully empty all items from playlist id =  " + playlistId);
                            res.json({ status: "success", msg: "All items removed successfully from playlist !!", link: "" });
                            // res.redirect('/author_getPlaylistData?id=' + playlistId + '&body=' + body.ok);
                        } else {
                            es.json({ status: "error", msg: "Error: Please Contact Administrator", link: "" });
                            // res.redirect('/author_getPlaylistData?id=' + playlistId + '&msg=dberror');
                        }
                    });
                } else {
                    generateLogs("error", author + "  is not authorized to arrange playlist items with id =  " + playlistId);
                    res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "", studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata , userMeta: userMeta}); return;
                }
            }else{
                res.json({ status: "error", msg: "Only author is authorized to delete this item from Playlist", link: "" });
                 // res.redirect('/author_getPlaylistData?id=' + id + '&msg=unauth');
            }
        }
    });
};

// to empty playlist items
exports.fetchFromBasket = function (req, res) {
    var author = req.body.author;
    var sectionId= req.body.sectionId;
    var authorHead = req.headers.x_myapp_whoami;
    
    var id = req.body.playlistId;
    var short = req.body.author;
   
    if(authorHead == author){
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        users.view("ByShortName", "shortNameToBasket", { key: author }, function (err, body, headers) {
            if (!err) {
                if (body.rows.length != 0) {
                    var dta = body.rows[0].value;
                    if(dta.basket){
                        if(dta.basket.length>0){
                            var basketQues = dta.basket.toString();

                            httpservreq.addQuesToPlaylist(author,id,basketQues,{public:false},sectionId, function (err, body) {
                                if (!err && body.success) {
                                   
                                    generateLogs("info", author + " successfully added item  in playlist id =  " + id);
                                    res.json({ status: "success", msg: "All items added successfully from basket!!", link: "",basketQues:basketQues ,duplicateId:body.duplicateId});
                                } else { 
                                    if(body.success==false && body.maxLen == true){
                                        generateLogs("error", author + "  Maximum number of items allowed in a playlist is 50");
                                        res.json({ status: "maxlist", msg: "Maximum number of items allowed in a playlist is 50 !!", link: "" });
                                    }else{
                                        generateLogs("error", author + "  was not able to add item in playlist id =  " + id);
                                         res.json({ status: "error", msg: "Error occurs during fetching your data, Please Contact Administrator !!", link: "" });
                                    }
                                }
                            });
                            
                        }else{
                            res.json({ status: "empty basket", msg: "Basket is Empty !"});
                        }
                    }else{
                        res.json({ status: "empty basket", msg: "Basket is Empty !"});
                    }
                }else {
                    res.json({ status: "error", msg: "Error: Plase contact administrator"});
                }
            }
        });
    }else{
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " + wb_data._id);
            // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
};