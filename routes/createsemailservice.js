
var staticObj     = require('../config.js').merge_output;

var couchdb = require('nano')(staticObj.couchdb);
var request_db    = couchdb.use(staticObj.db_request);
var response_db   = couchdb.use(staticObj.db_response);

//Generate Random ID
var randID = function(){
       var text = "";
       var length = 5;
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   for(var i = 0; i < length; i++) {
       text += possible.charAt(Math.floor(Math.random() * possible.length));
   }
       var today = new Date();
       
       var ss = today.getSeconds();
       var mm = today.getMinutes();
       var hh = today.getHours();

       var dd = today.getDate(); 
       var mon = today.getMonth()+1; 
       var yy = (today.getFullYear().toString()).substr(2); 
       if(dd<10){dd='0'+dd} 
       if(mon<10){mon='0'+mon}
        if(hh<10){hh='0'+hh} 
       if(mm<10){mm='0'+mm}
       if(ss<10){ss='0'+ss} 

       var randomId = yy+''+mon+''+dd+"-"+hh+''+mm+''+ss+""+text;
       return randomId;
}

exports.createsemailservice = function(req,res){
  var subject = req.body.subject;
  var msg = req.body.message;
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var url = req.body.url;
  var origin = req.get('origin');
  //set the mail_temp with extra parameters
  mail_temp = '<!DOCTYPE html><html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css"> </head><body><p style="text-align: center; align: center;"><table cellpadding="0" style="width: 90%;border: none;background-color: #fff;margin-left: auto;margin-right: auto;padding: 5%;border-spacing: 0px;"><tr><td><h1 style="text-align: center; align: left;">CREATES</h1></td></tr><tr><td><h1 style="position: relative;font-family: Arial;font-size: 1.5em;color: #003264;border-left: 3px solid #fac8fa;padding-left: 20px;margin: 0; padding: 20px;">Dear Sir,</h1></td></tr><tr><td><p style="position: relative;font-family: Arial;color: #003264;padding-bottom: 20px;padding-top: 20px;border-left: 3px solid #00affa;padding-left: 20px;margin: 0;font-size: 1.3em;">Subject : '+subject+'</p></td></tr><tr><tr><td><p style="position: relative;font-family: Arial;color: #003264;padding-bottom: 20px;padding-top: 20px;border-left: 3px solid #00affa;padding-left: 20px; margin: 0;font-size: 1.3em">'+msg+'</p></td></tr><tr><td><h2 style="position: relative;font-family: Arial;color: #003264;font-size: 1.3em;border-left: 3px solid #32e1e1;padding: 20px;margin: 0; ">Yours sincerely,<br>'+name+'<br>Email Id: '+email+'<br>Phone No: '+phone+'</h2></td></tr></table></body></html>';
      
  var req_type        = "send_mail";
  var user_mail_info  = new Object;
  user_mail_info.to   = "ambarj@iiserb.ac.in";
  user_mail_info.sub  = subject;
  user_mail_info.body = mail_temp;

  var randomId = randID();
  if(origin == ""){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  request_db.insert({type: req_type,data: JSON.stringify(user_mail_info)},randomId,function(err, body, header) {
    if (!err){
       var count = 0;
      var myVar = setInterval(function(){ myTimer() }, 1500);
      function myTimer() {
        count = count + 1;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        response_db.get(body.id, function(err, body, headers){
          if(!err){
            if(body.result.length != 0){
              var status = JSON.parse(body.result);
              if(status.success){ 
                res.redirect(url+'?status=done');
                // res.end('done');
                console.log('mail sent');  
                myStopFunction()
              }
              else{
                res.redirect(url+'?status=fail');
                console.log('error in sending mail'); 
                // res.end('fail');
                myStopFunction()
              }
              if(count >= 60){
                myStopFunction()
              }
            }
            else{
              res.redirect(url+'?status=fail');
              console.log('mail not found');
              if(count >= 60){
                myStopFunction();
              }
            }
          }
          else{
            res.redirect(url+'?status=fail');
            console.log('in response error');
            if(count >= 60){
              myStopFunction();
            }
          }
        })
      }
      function myStopFunction() {
        clearInterval(myVar);
      }
    }
    else{
      res.redirect(url+'?status=fail');
      console.log('some error here');  
    }
  })
}
};
