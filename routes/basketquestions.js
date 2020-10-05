var staticObj = require('../config.js').merge_output;
var httpservreq = require('../httpseverreq.js');
var couchdb = require('nano')(staticObj.couchdb);
var users = couchdb.use(staticObj.db_authors);
var playlist_db = couchdb.use(staticObj.db_playlist);
var metadata_db = couchdb.use(staticObj.db_elements_metadata);

//; to get all basket questions of user
exports.getBaseketQuestions = function(req, res){
    var author = req.headers.x_myapp_whoami;
     httpservreq.basketData(author,function (err, body) {
         
            res.json(body);        
    });   
};


//; add questions to basket
exports.addToBaseketQuestion = function(req, res){

    var author = req.headers.x_myapp_whoami;
    users.get(author,function(err,body){
       if(!err)
       { 
           body.basket =  (Array.isArray(body.basket))?body.basket:[];   
           var pqid = req.body.question;
           
            if(body.basket.length<20){

                    var questionstatus = 'Already';
                    if(body.basket.indexOf(pqid)===-1)
                    {
                        questionstatus = 'New';   
                        body.basket.push(pqid);
                    }

                    var bquestions = body.basket;
                    var basketlenght = body.basket.length;
                    
                    if(questionstatus == 'New')
                    {
                        users.insert(body, function(err, body) 
                        {

                            if(!err)
                            {   
                                res.json({ "status": "ok" , "numberofquestions" : basketlenght,"questionstatus":questionstatus,"bquestions":bquestions });
                            }
                            else
                            {
                                res.json({ "status": "error" });  
                            }

                        });
                }else 
                {
                    res.json({ "status": "ok" , "numberofquestions" : basketlenght,"questionstatus":questionstatus,"bquestions":bquestions });
                }
                
            }else{
                res.json({ "status": "maxlimit","numberofquestions":20});
            }
            
       }else{
        res.json({ "status": "error" }); 
       }
    });
};


//; all basket questions
exports.allBasketQuestions = function (req, res) {
    
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var user = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    users.get(author,function(err,body){     
        if(!err)
        {  
           body.basket =  (Array.isArray(body.basket))?body.basket:[]; 
           var basketquestions = body.basket;

           httpservreq.chkItmsBasket(author,basketquestions, function (err, body1) {
            // console.log(body.success);
            if (!err && body1.success) {
                
                        var questionstrids = body1.quesArry;
                       
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
                                    // console.log(err);   
                                    if(!err){
                                        body.rows.forEach(function(doc) {
                                            collb1.push(doc.value);
                                        });
                                        // console.log("collb1=========="+collb1);

                                        var collb2 = new Array();
                                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                        playlist_db.view("playlistView", "getPlaylistCollb2Data", {key:authorEmail}, function(err, body){
                                            // console.log(err);   
                                            if(!err){
                                                body.rows.forEach(function(doc) {
                                                    collb2.push(doc.value);
                                                });
                                                
                                                var allData = new Object;
                                                
                                                allData["qdata"]=body1.itmData;
                                                allData["unauthData"]= body1.unauthData;
                                                allData["author"] = author; 
                                                
                                                res.render('question/basketquestions',{data:allData,isAngular:true,userMeta:userMeta,msg:'',copyright: globaldata,tooltip: tooltip,playlistdata: playlistdata,collb1:collb1,collb2:collb2,short: user,questionstrids:questionstrids});
                                                }else {
                                                generateLogs("error", shortName + "  error from get playlist collaborator 2 content  ");
                                                
                                            }
                                        })
                                    }else {
                                        generateLogs("error", shortName + "  error from get playlist collaborator 1 content  ");
                                       
                                    }
                                })
                            }else{
                            res.redirect('/author_dashboard_comm?msg=dberror');
                            }
        
                        });
        
            }else {
                console.log("----error11----");
                console.log(err);
                }
        })

           
        }else{
            res.redirect('/author_dashboard?mod=com&msg=Error');
        }
                 
    });
    
};

//remove one question from basket
exports.removeQuestionFromBasket = function(req,res){

    var questionid = req.body.question;
    var fullName = req.headers.x_myapp_fullName;
    var author = req.headers.x_myapp_whoami;
    users.get(author,function(err,body){ 
        
        if(!err)
        {  
            
            body.basket =  (Array.isArray(body.basket))?body.basket:[];  
            var removeindex = body.basket.indexOf(questionid);
            if (removeindex > -1) {
                body.basket.splice(removeindex, 1);
            }

            
            users.insert(body, function(err, body) 
            {

                if(!err)
                { 
                  res.json({status:"ok",msg:"Question delete successfully"});
                }
                else
                {
                    res.json({ status: "error" });  
                }

            });
           
        }else 
        {
            res.json({ status: "error" });
        }


    });    

    

    
}

//clear all basket questions
exports.clearAllBasketQuestions = function(req,res){
    
    var fullName = req.headers.x_myapp_fullName;
    var author = req.headers.x_myapp_whoami;
    users.get(author,function(err,body){ 
   
        if(!err)
        {             
            body.basket =  [];
            users.insert(body, function(err, body) 
            {
            
                if(!err)
                { 
                    res.json({status:"ok",msg:""});
                }
                else
                {
                    res.json({ status: "error" });  
                }

            });           
        }else{
            res.json({ status: "error" }); 
        }
                 
    });

}


// add to playlist from basket;clear basket
exports.addBasketToPlayList = function(req,res){
    var author = req.headers.x_myapp_whoami;
    var ques_ids = req.body.ques_ids1;
    var id = req.body.playlist_name1;
    var author = req.body.author;
    var short = req.body.author;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var unauthData = req.body.unauthData.trim();

    let idArr = new Array();

    if(unauthData!="") 
    {
      idArr=unauthData.split(",");  
    }
    
    var fullName = req.headers.x_myapp_fullName;
    if (ques_ids != "" && id != "") {
        if(idArr.length==0){
            httpservreq.addQuesToPlaylist(author,id,ques_ids,{public:false}, function (err, body) {
                if (!err && body.success) {
                    generateLogs("info", author + " successfully added item id=(" + ques_ids + ") in playlist id =  " + id);
                    res.redirect('/author_allbasketquestions?msg=itemAdded');
                       
                } else {
                    if(body.success==false && body.maxLen == true){
                        generateLogs("error", author + "  Maximum number of items allowed in a playlist is 50");
                        res.redirect('/author_allbasketquestions?msg=maxlist');
                    }else{
                        generateLogs("error", author + "  was not able to add item id=(" + ques_ids + ") in playlist id =  " + id);
                        res.redirect('/author_allbasketquestions?msg=dberror');
                    }
                }
            });
        }else{
            res.redirect('/author_allbasketquestions?msg=unauthData');
        }
    }
    else if (id == "") {
        res.redirect('/author_allbasketquestions?msg=noPlaylist');
    }
    else {
        res.redirect('/author_allbasketquestions?msg=noItem');
    }
}


//update tags and comments in db for public list (element metadata)
exports.updateTagsComments = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
    var fullName = req.headers.x_myapp_fullName;
    var quesId = req.body.quesId;
    var quesAuthor = req.body.quesAuthor;
    var tags_ary = req.body.tags;
    var comment = req.body.comment;
   
    

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
                    
                    var user_data = new Object;
                    user_data = doc;
                    user_data.tags = tags_ary;
                    user_data.comments = comment;
                      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    metadata_db.insert(user_data, function (err, body) {
                        if (!err) {
                       res.json({ status: "success", msg: "update successfully !", link: "" });
                        
                        }
                        else {
                        res.json({ status: "error", msg: "Unable to process !", link: "" });
                        
                        }
                    })
                
                }
                else {
                   res.json({ status: "error", msg: " Invaild request !", link: "" });
                }
                }
                else {
                res.json({ status: "error", msg: " Invaild request !", link: "" });
                }
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


exports.addBasketToPublicList = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
    var fullName = req.headers.x_myapp_fullName;
    var quesId = req.body.quesId;
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
