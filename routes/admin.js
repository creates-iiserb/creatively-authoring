var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var users = couchdb.use(staticObj.db_authors);
var jade = require('jade');
var httpservreq = require('../httpseverreq.js');
var wbpublished_db = couchdb.use(staticObj.db_wbpublished);

// admin dashboard
exports.getAdminDash = async (req, res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    try {
        let msg = req.param("msg");
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let authorCounter = 0;
        let authorData = await users.view('getUserData', 'getAuthorData');
        authorData.rows.forEach((doc) => {
            if(doc.value.accStatus=="active" || doc.value.accStatus=="blocked"){
                authorCounter++;
            }
        });


        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let wbPublishCounter = 0;
        let wbData = await wbpublished_db.view('author', 'publishedDocForAdmin');
        wbData.rows.forEach((doc) => {
            if(doc.value.status){
                if(doc.value.status=="accepted" && doc.value.published==true){
                    wbPublishCounter++;
                }
            }
        });
        
        res.render('admin/adminDashboard', {authorCounter:authorCounter,wbPublishCounter:wbPublishCounter,msg:msg,short: shortName, userMeta: userMeta, tooltip: tooltip, copyright: globaldata,author:author });
        
    } catch (error) {
        console.log(object);
        generateLogs("error", author + "  error from update account status ");
    }
    
};

//get all author list
exports.getAuthorList =  (req,res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    res.render('admin/authorsList', {short: shortName, userMeta: userMeta, tooltip: tooltip, copyright: globaldata,author:author , msg:''  });
}

//update account status
exports.adminChangeAccStatus = async (req,res) => {
    var author = req.headers.x_myapp_whoami;
    
    try {
        let id = req.body.id;
        let status = req.body.status;
        
        if(id !=author){
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            let authorData = await users.get(id);
            let preStatus = authorData.accStatus;
            authorData.accStatus = status;
            if(!authorData.hasOwnProperty('history')){
                authorData['history'] = [];
            }

            let hist = {};
            if(status == "active"){
                if(preStatus == "blocked"){
                    hist.action="accUnblocked";
                    hist.msg = "Account unblocked";
                }else
                if(preStatus == "pending" || preStatus=="rejected"){
                    hist.action="accReqAccepted";
                    hist.msg = "Account request accepted";
                }
             
            }else 
            if(status == "rejected"){
                hist.action="accReqReject";
                hist.msg = "Account request rejected";
            }else
            if(status == "blocked"){
                hist.action="accBlocked";
                hist.msg = "Account blocked";
            }
            hist.when = getCurrentUTCDate();
            authorData.history.push(hist);
            
            await users.insert(authorData);
            if((status=="active" || status=="rejected") && (preStatus=="pending" || preStatus=="rejected")){
                    //set the mail_temp with extra parameters
                    var user_mail_info_02 = new Object;
                    let jadeFormat = null;
                    let mail_temp = null;
                    if(status=="active"){
                        jadeFormat = jade.compileFile(staticObj.mail_approved_request);
                        mail_temp = jadeFormat({ serverUrl: staticObj.main_server_url });
                        user_mail_info_02.sub = 'Examineer author account request is approved';
                    }else{
                        //rejected
                        jadeFormat = jade.compileFile(staticObj.mail_request_rejected);
                        mail_temp = jadeFormat({ note: authorData.note });
                        user_mail_info_02.sub = 'Examineer author account request is rejected';
                    }
                    
                    
                    var req_type = "send_mail";
                    user_mail_info_02.to = authorData.email;
                    user_mail_info_02.body = mail_temp;
                    var randomId = randID();
            
                    //============== from http server request =============================
                    httpservreq.httpReq(randomId, req_type,user_mail_info_02, "Approved user " + authorData["email"], function (err, body) {
                        if (!err && body.success) {
                       
                        if (body.result.length != 0) {
                            res.status(200).json({status:true});
                        }else{
                            res.status(400).json({status:false,msg:'Account approved but mail is not send'});
                        }
                        
                        } else {
                            res.status(400).json({status:false,msg:'Account approved but mail is not send'});
                        }
                    });
                    //============== from http server request ends=============================
              
            }else{
                res.status(200).json({status:true});
            }
            
        }else{
            res.status(400).json({status:false,msg:'Something goes wrong, please try again later.'});
        }
        
    } catch (error) {
        console.log(error);
        res.status(400).json({status:false,msg:'Something goes wrong, please try again later.'});
        generateLogs("error", author + "  error from update account status ");
    }
    
}

//change authors permissions
exports.adminChangePermissions = async (req,res) => {
    var author = req.headers.x_myapp_whoami;
    try {
        let id = req.body.id;
        let permissions = req.body.permissions;
        permissions.push('basic');
        
        if(id !=author){
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            let authorData = await users.get(id);
            if(!authorData.hasOwnProperty('auth')){
                authorData['auth'] = {}
            }

            if(!authorData['auth'].hasOwnProperty('access')){
                authorData.auth['access'] = [];
            }

            authorData.auth['access'] = permissions;
           
            if(!authorData.hasOwnProperty('history')){
                authorData['history'] = [];
            }

            let hist = {};
            hist.action="changePermission";
            hist.msg = "Changed permission";
            hist.when = getCurrentUTCDate();
            authorData.history.push(hist);
            
            await users.insert(authorData);
            res.status(200).json({status:true});
            
        }else{
            res.status(400).json({status:false,msg:'Something goes wrong, please try again later.1'});
        }
        
    } catch (error) {
        console.log(error);
        res.status(400).json({status:false,msg:'Something goes wrong, please try again later.2'});
        generateLogs("error", author + "  error from update account status ");
    }
    
}

exports.adminEditAuthorNote = async (req,res) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let authorData = await users.get(req.body.id);
        if(!authorData.hasOwnProperty('note')){
            authorData['note'] = '';
        }
        authorData['note'] = req.body.note;
        await users.insert(authorData);
        res.status(200).json({status:true});
    } catch (error) {
        console.log(error);
        res.status(400).json({status:false,msg:'Something goes wrong, please try again later.'});
    }
    
}


//get ajax all author list
exports.adminFetchAuthorList = async (req,res) => {
    let shortName = req.headers.x_myapp_whoami;
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let authorData = await users.view('getUserData', 'getAuthorData');
        let data = {
            active:[],
            rejected:[],
            pending:[],
            blocked:[]
        }
        
        authorData.rows.forEach((doc) => {
            if(doc.value.shortname !=shortName){
                if(!doc.value.hasOwnProperty('history')){
                    doc.value['history'] = [];
                }

                if(!doc.value.hasOwnProperty('name')){
                    doc.value['name'] = 'N/A';
                }else
                if(doc.value['name'] == ''){
                    doc.value['name'] = 'N/A';
                }

                if(!doc.value.hasOwnProperty('auth')){
                    doc.value['auth'] = {
                        'access':['basic']
                    };
                }

                if(!doc.value.hasOwnProperty('note')){
                    doc.value['note'] = '';
                }
               
                if(doc.value.accStatus=="active"){
                    data.active.push(doc.value);
                }else
                if(doc.value.accStatus=="rejected"){
                    data.rejected.push(doc.value);
                }else
                if(doc.value.accStatus=="pending"){
                    data.pending.push(doc.value);
                }else
                if(doc.value.accStatus=="blocked"){
                    data.blocked.push(doc.value);
                }
            }
        });
        res.status(200).json({status:true,data:data});
        
    } catch (error) {
        console.log(error);
        res.status(400).json({status:false});
        generateLogs("error", shortName + "  error from get author list ");
    }
}

//get all publish wb list
exports.adminWbList =  (req,res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    res.render('admin/wbPublishReqList', {short: shortName, userMeta: userMeta, tooltip: tooltip, copyright: globaldata,author:author , msg:''  });
}

//get all wb publish list from database
exports.adminFetchWbPublishList = async (req,res) => {
    let shortName = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let authorData = await wbpublished_db.view('author', 'publishedDocForAdmin');
        let data = {
            pending:[],
            accepted:[],
            blocked:[],
            rejected:[]
        }
        // console.log(authorData.rows)
        authorData.rows.forEach((doc) => {
            if(doc.value.status){
                if(doc.value.status=="pending" && doc.value.published==false ){
                    data.pending.push(doc.value);
                }else if(doc.value.status=="accepted" && doc.value.published==true){
                    data.accepted.push(doc.value);
                }else if(doc.value.status=="blocked" && doc.value.published==false){
                    data.blocked.push(doc.value);
                }else if(doc.value.status=="rejected" && doc.value.published==false){
                    data.rejected.push(doc.value);
                }
            }else{
                // data.pending.push(doc.value);
            }
                
        });
// console.log(JSON.stringify(data))
        res.status(200).json({status:true,data:data,authorEmail:authorEmail});
        
    } catch (error) {
        console.log(error);
        res.status(400).json({status:false});
        generateLogs("error", shortName + "  error from get author list ");
    }
}

exports.adminAddAsBetauser =  (req,res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var betaId = req.body.betaId;
    var pubId = req.body.pubId;
    var wbauthor = req.body.wbauthor;
    var authorEmail = req.headers.x_myapp_email;
// console.log(authorEmail)

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
           
           if(body.meta.betaUserAdmin){
               var betauserpub = body.meta.betaUserAdmin;
           }else{
            var betauserpub=[];
           }
             
            if(betauserpub.indexOf(authorEmail)===-1){
                betauserpub.push(authorEmail);

                body.meta.betaUserAdmin = betauserpub;

                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                wbpublished_db.insert(body, pubId, function (err, body) {
                    if (!err) {
                       
                        generateLogs("info", authorEmail + " user added in pubid as admin " );
                    }
                    else {
                        generateLogs("info", authorEmail + " user not added in pubid as admin");
                       
                    }
                });

            }else{
                generateLogs("info", authorEmail + " user already exist in pubid as admin");
               
            }
        }
    });


    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(betaId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
            //find sheetname already exist in the same workbook;
            var allWbPubData =  body;  
            var betauser = body.betaUsers
            if(betauser.indexOf(authorEmail)===-1){
                betauser.push(authorEmail)
            }else{
                res.json({ status: "error", msg: "User already exits !!"});
            }
           
            body.betaUsers = betauser; 

            // console.log(JSON.stringify(body))
            // console.log(body.betaUsers)
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            wbpublished_db.insert(body, betaId, function (err, body) {
                if (!err) {
                    res.json({ status: "success", msg: "added successfully"});
                }
                else {
                    res.json({ status: "error", msg: "Unable to process !"});
                }
            });   
        }
    });
}


exports.adminRemoveAsBetauser =  (req,res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var betaId = req.body.betaId;
    var wbauthor = req.body.wbauthor;
    var authorEmail = req.headers.x_myapp_email;
    var pubId = req.body.pubId;


    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
            var betauseradmin = body.meta.betaUserAdmin
            var i =  betauseradmin.indexOf(authorEmail);
            betauseradmin.splice(i, 1);
            
            body.meta.betaUserAdmin = betauseradmin;
               

                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                wbpublished_db.insert(body, pubId, function (err, body) {
                    if (!err) {
                        generateLogs("info", authorEmail + " user removed in pubid as admin " );
                    }
                    else {
                        generateLogs("info", authorEmail + " user not removed  exist in pubid as admin");
                        // res.json({ status: "error", msg: "Unable to process request !"});
                    }
                });
        }
    });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(betaId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
            //find sheetname already exist in the same workbook;
            var allWbPubData =  body;  
            var betauser = body.betaUsers

           var i =  betauser.indexOf(authorEmail);
            betauser.splice(i, 1);
           
            body.betaUsers = betauser; 
           
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            wbpublished_db.insert(body, betaId, function (err, body) {
                if (!err) {
                    res.json({ status: "success", msg: "Removed successfully"});
                }
                else {
                    res.json({ status: "error", msg: "Unable to process !"});
                }
            });   
        }
    });
}

exports.adminAcceptPublishReq =  (req,res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    var pubId = req.body.pubId;
    var wbauthor = req.body.wbauthor;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
            var historyDta ={};
            historyDta["action"]="accepted";
            historyDta["time"]=getCurrentUTCDate();
            historyDta["adminUser"]=shortName;
            
            if(body.meta.history){
                var history = body.meta.history;
            }else{
                var history = [];
            }
            history.push(historyDta);

            body.published= true; 
            body.meta.status= "accepted"; 
            body.meta.history = history;

            // console.log(JSON.stringify(body))
            console.log(JSON.stringify(body.meta))
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            wbpublished_db.insert(body, pubId, function (err, body1) {
                if (!err) {
                   
            wbpublished_db.view("author", "idToDocForAdmin", { key: pubId}, function (err, bodyCol, headers) {
    if (!err) {
        var data = bodyCol.rows[0].value;
        // console.log(data.supportEmail)
            //////////////////////////////////////////////

            var jadeFormat = jade.compileFile(staticObj.wbPublish_accept);
            mail_temp = jadeFormat({ adminName: author,reqAuthorName:data.author,wbTitle:data.title,betaVerNo:data.meta.betaVersion, adminFullName:userMeta.fullName, serverUrl: staticObj.main_server_url });
            // console.log()
            var req_type = "send_mail";
            var user_mail_info_02 = new Object;
            user_mail_info_02.to = data.supportEmail;
            user_mail_info_02.sub = "Workbook Accepted";
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
                        
                        res.json({ status: "success", msg: "workbook published successfully"});
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
        }
        else {
            res.json({ status: "error", msg: "Error: Please Contact Administration", link: "" });
        }
      })
                    
                }
                else {
                    res.json({ status: "error", msg: "Unable to process !"});
                }
            });   
        }
    });
}

exports.adminRejectPublishReq =  (req,res) => {
    // console.log("reject")
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    var pubId = req.body.pubId;
    var wbauthor = req.body.wbauthor;
    var rejectMsg= req.body.rejectMsg;
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
            
            var historyDta ={};
            historyDta["action"]="rejected";
            historyDta["time"]=getCurrentUTCDate();
            historyDta["adminUser"]=shortName;
            historyDta["msg"]=rejectMsg;
            
            if(body.meta.history){
                var history = body.meta.history;
            }else{
                var history = [];
            }
            history.push(historyDta);

            body.published= false;
            body.meta.status= "rejected"; 
            body.meta.history = history;

            console.log(JSON.stringify(body.meta))
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            wbpublished_db.insert(body, pubId, function (err, body) {
                if (!err) {
                    
                    wbpublished_db.view("author", "idToDocForAdmin", { key: pubId}, function (err, bodyCol, headers) {
                        if (!err) {
                            var data = bodyCol.rows[0].value;
                            var jadeFormat = jade.compileFile(staticObj.wbPublish_reject);
                                mail_temp = jadeFormat({ adminName: author,reqAuthorName:data.author,wbTitle:data.title,betaVerNo:data.meta.betaVersion, adminFullName:userMeta.fullName,rejectReason:rejectMsg, serverUrl: staticObj.main_server_url });
                                // console.log()
                                var req_type = "send_mail";
                                var user_mail_info_02 = new Object;
                                user_mail_info_02.to = data.supportEmail;
                                user_mail_info_02.sub = "Workbook rejected";
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
                                            
                                            res.json({ status: "success", msg: "workbook publish request rejected"});
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
                            }
                            else {
                                res.json({ status: "error", msg: "Error: Please Contact Administration", link: "" });
                            }
                          })
                }
                else {
                    res.json({ status: "error", msg: "Unable to process !"});
                }
            });   
        }
    });
}


exports.adminBlockPublishReq =  (req,res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    var pubId = req.body.pubId;
    var wbauthor = req.body.wbauthor;

    var blockMsg = req.body.blockMsg;

    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
            
            var historyDta ={};
            historyDta["action"]="blocked";
            historyDta["time"]=getCurrentUTCDate();
            historyDta["adminUser"]=shortName;
            historyDta["msg"]=blockMsg;
            
            if(body.meta.history){
                var history = body.meta.history;
            }else{
                var history = [];
            }
            history.push(historyDta);

            body.published= false;
            body.meta.status= "blocked"; 
            body.meta.history = history;

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            wbpublished_db.insert(body, pubId, function (err, body) {
                if (!err) {
                    
                    wbpublished_db.view("author", "idToDocForAdmin", { key: pubId}, function (err, bodyCol, headers) {
                    if (!err) {
                        var data = bodyCol.rows[0].value;
                        
                            var jadeFormat = jade.compileFile(staticObj.wbPublish_blocked);
                            mail_temp = jadeFormat({ adminName: author,reqAuthorName:data.author,wbTitle:data.title,betaVerNo:data.meta.betaVersion, adminFullName:userMeta.fullName,blockReason:blockMsg, serverUrl: staticObj.main_server_url });
                            // console.log()
                            var req_type = "send_mail";
                            var user_mail_info_02 = new Object;
                            user_mail_info_02.to = data.supportEmail;
                            user_mail_info_02.sub = "Workbook Blocked";
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
                                        
                                        res.json({ status: "success", msg: "workbook blocked successfully"});
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
                        }
                        else {
                            res.json({ status: "error", msg: "Error: Please Contact Administration", link: "" });
                        }
                      })

                }
                else {
                    res.json({ status: "error", msg: "Unable to process !"});
                }
            });   
        }
    });
}

exports.adminUnblockPublishReq =  (req,res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    var pubId = req.body.pubId;
    var wbauthor = req.body.wbauthor;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
            
            var historyDta ={};
            historyDta["action"]="unblocked";
            historyDta["time"]=getCurrentUTCDate();
            historyDta["adminUser"]=shortName;
           
            if(body.meta.history){
                var history = body.meta.history;
            }else{
                var history = [];
            }
            history.push(historyDta);

            body.published= true;
            body.meta.status= "accepted"; 
            body.meta.history = history;

            console.log(JSON.stringify(body.meta))
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            wbpublished_db.insert(body, pubId, function (err, body) {
                if (!err) {
                    
                    wbpublished_db.view("author", "idToDocForAdmin", { key: pubId}, function (err, bodyCol, headers) {
                        if (!err) {
                            var data = bodyCol.rows[0].value;
                           var jadeFormat = jade.compileFile(staticObj.wbPublish_unblock);
                                mail_temp = jadeFormat({ adminName: author,reqAuthorName:data.author,wbTitle:data.title,betaVerNo:data.meta.betaVersion, adminFullName:userMeta.fullName, serverUrl: staticObj.main_server_url });
                                // console.log()
                                var req_type = "send_mail";
                                var user_mail_info_02 = new Object;
                                user_mail_info_02.to = data.supportEmail;
                                user_mail_info_02.sub = "Workbook Unblocked";
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
                                            
                                            res.json({ status: "success", msg: "workbook unblocked successfully"});
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
                            
                            }
                            else {
                                res.json({ status: "error", msg: "Error: Please Contact Administration", link: "" });
                            }
                          })
                }
                else {
                    res.json({ status: "error", msg: "Unable to process !"});
                }
            });   
        }
    });
}

exports.adminWbRequestDetails =  (req,res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    var pubId = req.body.pubId;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
        if (err) {
            res.json({ status: "error", msg: "Unable to process !"});
        } else {
            
            res.json({ status: "success",dataBody:body});
        }
    });
}