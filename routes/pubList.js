var staticObj = require('../config.js').merge_output;
var userinfo = '';
var couchdb = require('nano')(staticObj.couchdb);
var publist_db = couchdb.use(staticObj.db_publist);
var users = couchdb.use(staticObj.db_authors);
var metadata_db = couchdb.use(staticObj.db_elements_metadata);
var playlist_db = couchdb.use(staticObj.db_playlist);
var httpservreq = require('../httpseverreq.js');

// to display public list dashboard
exports.getPubListDash = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var subject = [];
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    publist_db.view("byName", "getSubject",  function (err, body) {
        if (!err) {
            var arr_json = body.rows;

            let list = {};
            arr_json.forEach((elem) => {
              //console.log(elem);
              if (list[elem.value.subject]) {
                //console.log("already exists");
              } else {
                list[elem.value.subject] = []
              }
              list[elem.value.subject].push({
                name: elem.value.name,
                id: elem.value.id
              })
            });            

            var playlistdata = new Array();
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            playlist_db.view("playlistView", "getPlaylistData", { key: shortName }, function (err, body) {
                
                if (!err) {
                    body.rows.forEach(function (doc) {
                        playlistdata.push(doc.value);
                    });
                   res.render('pubList/pubListDash', { subject:list, playlistdata: JSON.stringify(playlistdata),short: shortName, userMeta: userMeta,tooltip: tooltip, copyright: globaldata});

                 } else {
                    generateLogs("error", short + " is  unable to find playlist data from the view");
                }
            })
            
            } else {
            console.log(err);
        }
    })   
};


//get subject category (tpoics)
exports.getSubCategory = function (req, res) {

var userMeta = req.userMeta;
  var userdata_db = new Array();

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  publist_db.view("byName", "nameToData",{ key: req.body.subject },  function (err, body) {
    if (!err) {
      if (body.rows.length != 0) {

        body.rows.forEach(function (doc) {
                userdata_db.push(doc.value);
        });
        

         userdata_db.forEach(function (doc) {
            delete doc.subject;
         })
        res.json({ status: "success", msg: "Save", link: "", data: JSON.stringify(userdata_db) });
      }
      else {
        console.log('Invaild request no data !');
        res.json({ status: "error", msg: " Invaild request !", link: "" });
      }
    }
    else {
      console.log('Invaild request !');
      res.json({ status: "error", msg: " Invaild request !", link: "" });
    }
  });
}


//get subject in view committed page(dropdown)
exports.getPubListSub = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
   
    var userMeta = req.userMeta;
    var sub = [];
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    publist_db.view("byName", "getSubject",  function (err, body) {
        
        if (!err) {
            var arr_json = body.rows;

            arr_json.forEach(function (doc) {
                var result = doc.value;
                if(sub.indexOf(result.subject) == "-1"){
                    sub.push(result.subject);
                }
            });

          res.json({ status: "success", msg: "list", link: "", subject: sub });
        }else{
            res.json({ status: "error", msg: "Invalid Request!", link: "" });
        }
    });
}


//add the question is public list (element metadata)
exports.addToPubList = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
   
    var userMeta = req.userMeta;
    var quesId = req.body.quesId;
    var author = req.body.author;
    var pipe = req.body.pipe;
    var tags = req.body.tag;
    var comment = req.body.comment;
    var pubListTopic = req.body.pubListTopic;

    var tags_ary  = new Array();
    tags_ary  = tags.split(",");

    var pubArry= new Array();
    pubArry.push(pubListTopic);


    var pubquesArry = new Array();
    pubquesArry.push(quesId);
    httpservreq.chkAuthorPublicList(shortName,pubquesArry, function (err, body) {
        if (!err && body.success) {
            if(body.msg == "authorized"){
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                 metadata_db.get(quesId, function (err, doc) {
                if (!err) {
                
                if (doc) {
                    var rev_id = doc._rev;
                    var pubList = doc.pubList;
    
                    if(pubList){
                        if(pubList == ''){
                        updated_pubList = pubArry;
                        }
                        else{
                            updated_pubList = pubList.concat(pubArry.filter(function (item) {
                                return pubList.indexOf(item) < 0;
                            }));
                        }
                    }else{
                        updated_pubList = pubArry;
                    }
    
                    var user_data = new Object;
                    user_data = doc;
                    user_data.tags = tags_ary;
                    user_data.comments = comment;
                    user_data.pubList = updated_pubList;
                    
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    metadata_db.insert(user_data, function (err, body) {
                        if (!err) {
                        generateLogs("info", author + " successfully added item id=(" + quesId + ") in public list id =  " + pubListTopic);
                        res.redirect('/author_getCommitted?id='+quesId+'&pipe='+pipe+'&msg=success');
                        }
                        else {
                        generateLogs("error", author + "  was not able to add item id=(" + quesId + ") in public list id =  " + pubListTopic);
                        res.redirect('/author_getCommitted?id='+quesId+'&pipe='+pipe+'&msg=dberror');
                        }
                    })
                
                }
                else {
                    generateLogs("error", author + "  was not able to find document of id=(" + quesId + ") in element metadata " );
                    res.redirect('/author_getCommitted?id='+quesId+'&pipe='+pipe+'&msg=dberror');
                }
                }
                else {
                generateLogs("error", author + "  was not able to find document of id=(" + quesId + ") in db with err " +  err);
                res.redirect('/author_getCommitted?id='+quesId+'&pipe='+pipe+'&msg=dberror');
                }
            });
            }else if(body.msg == "unauthorized"){
                generateLogs("error", author + " is not authorize to add this question id= " + item + "to public list ");
                res.redirect('/author_getCommitted?id='+quesId+'&pipe='+pipe+'&msg=unauthorize');
            }else{
                res.redirect('/author_getCommitted?id='+quesId+'&pipe='+pipe+'&msg=dberror');
            }

        }else {
            // console.log("----error11----");
            generateLogs("error", author + "  err in adding question id=(" + quesId + ") in public list err " +  err);
            res.redirect('/author_getCommitted?id='+quesId+'&pipe='+pipe+'&msg=dberror');
        }
    })
}



//get question a/c to public list  category
exports.getpubListQuestion = function (req, res) {

var userMeta = req.userMeta;
var author = req.headers.x_myapp_whoami;
  var refid = req.param("id");
  var userdata_db = new Array();
  var basketItm = new Array();
  users.get(author,function(err,body){ 
    if(!err){             
    //    console.log(typeof body.basket)
       basketItm=body.basket;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  metadata_db.view("publist", "publistToDocMeta",{ key: refid },  function (err, body) {
    if (!err) {
      if (body.rows.length != 0) {
        var quesIds = [];  
        body.rows.forEach(function (doc) {
            var tag22 = doc.value.tags.join(", ");
            doc.value.tags = tag22;
            userdata_db.push(doc.value);
            quesIds.push(doc.value.id);
        });
 
       httpservreq.getQuestTickets(quesIds,function(err,result){
        if(!err)
        {
            
            userdata_db.map(function(usrdt){               
                var index = result.ticketdata.findIndex(function(obj){
                    return usrdt.id==obj.value.contentId;
                 });

                if(index>-1)
                {                    
                    usrdt.resolved = false;
                    usrdt.issueId = result.ticketdata[index].value._id;
                }else{                   
                    usrdt.resolved = true;
                    usrdt.issueId = '';
                }

            });    
            
                   res.json({ status: "success", msg: "Save", link: "", data: JSON.stringify(userdata_db),basketItm:basketItm });
               
               
            
        }else{
            res.json({ status: "error", msg: "Please contact to adminstrator !", link: "" });           
        } 
        
       });

       ////////////////////////
         
      }
      else {
        console.log('Invaild request no data !');

        res.json({ status: "noData", msg: " No data found!", link: "",basketItm:basketItm });
      }
    }
    else {
      console.log('Invaild request !');
      res.json({ status: "error", msg: " Invaild request !", link: "" });
    }
  });

}
               
});  

}


// to add question to playlist
exports.addQuesToPlaylist = function (req, res) {
    var ques_ids = req.body.ques_ids;
    var id = req.body.playlist_name;
    var author = req.body.author;
    var short = req.body.author;
    
    var userMeta = req.userMeta;
    if (ques_ids != "" && id != "") {



        httpservreq.addQuesToPlaylist(author,id,ques_ids,{public:true}, function (err, body) {
            if (!err && body.success) {
                if(body.duplicateId.length==0){
                    generateLogs("info", author + " successfully added item id=(" + ques_ids + ") from public list to playlist id =  " + id);
                    res.json({ status: "success", msg: "itemAdded", link: "" });
                }else{
                    generateLogs("info", author + " duplicate id found  id=(" + body.duplicateId + ") from public list to playlist id =  " + id);
                    res.json({ status: "duplicate", msg: "duplicateId", link: "" });
                }
            }else {
                if(body.success==false && body.maxLen == true){
                    generateLogs("error", author + "  Maximum number of items allowed in a playlist is 500");
                    res.json({ status: "error",msg:"maxlen", dataLen: "max", link: "" });
                }else{
                    generateLogs("error", author + "  was not able to add item id=(" + ques_ids + ")  from public list to playlist id =  " + id);
                    res.json({ status: "error", msg: "dberror", link: "" });
                }
                
            }
        });

    }
    else if (id == "") {
        res.redirect('/author_pubList_dash?msg=noPlaylist');
        }
    else {
        res.redirect('/author_pubList_dash?msg=noItem');
        }
};



// to delete question from public list
exports.delete_pubList = function (req, res) {
   
    var userMeta = req.userMeta;
    var quesId = req.body.quesId;
    var author = req.body.author;
    var pubList = req.body.pubList;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    metadata_db.get(quesId, function (err, doc) {
        if (!err) {
            if (doc) {
                
                var rev_id = doc._rev;
                var allpubList = doc.pubList;

                var i = allpubList.indexOf(pubList);
                allpubList.splice(i, 1);

                // console.log(allpubList);
                var user_data = new Object;
                user_data = doc;
                user_data.pubList = allpubList;
               
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                metadata_db.insert(user_data, function (err, body) {
                    if (!err) {
                    generateLogs("info", author + " successfully deleted public list id=(" + pubList + ") from question id =  " + quesId);
                    res.json({ status: "success", msg: "Public List deleted !", link: "", userBlock: user_data });
                    }
                    else {
                    generateLogs("error", author + "  was not able to deleted public list id=(" + pubList + ") from questiont id =  " + quesId);
                    res.json({ status: "error", msg: "Unable to process !", link: "" });
                    }
                })
            }else {
                generateLogs("error", author + "  was not able to find document of id=(" + quesId + ") in element metadata " );
                res.json({ status: "error", msg: " Invaild request !", link: "" });
            }
        }else {
            generateLogs("error", author + "  was not able to find document of id=(" + quesId + ") in db with err " +  err);
            res.json({ status: "error", msg: " Invaild request !", link: "" });
        }
    });
}

exports.addBasketItmToPublicList = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
    var fullName = req.headers.x_myapp_fullName;
    var quesId = req.body.quesId;
    quesId= quesId.split(',');
    var quesAuthor = req.body.quesAuthor;
    var newPubList = req.body.pubListTopic;

    
    httpservreq.chkAuthorPublicList(shortName,quesId, function (err, body) {
        if (!err && body.success) {
           
            if(body.msg == "authorized"){

                metadata_db.fetch({keys:quesId}, function (err, doc) {
                   
                    let allData = []
                    doc.rows.map(itm=>{
                        let currItm = itm.doc;
                        if(currItm.pubList){
                            if(currItm.pubList.indexOf(newPubList)==-1){
                                currItm.pubList.push(newPubList)
                            }
                        }else{
                            currItm.pubList = [newPubList];
                        }
                        allData.push(currItm);            
                    })
                    
                    metadata_db.bulk({docs:allData},(err,body) => {
                        
                        res.json({ status: "success", msg: "update successfully !", link: "" });

                      });
                });
               
            }else if(body.msg == "unauthorized"){
               res.json({ status: "unauthorized", msg: "You are authorized to update content that is authored by you.", link: "" });
                
            }else{
                res.json({ status: "error", msg: " Invaild request !", link: "" });
            
            }

        }else {
            res.json({ status: "error", msg: " Invaild request !", link: "" });
            
        }
    });
}