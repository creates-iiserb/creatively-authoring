var staticObj = require('../config.js').merge_output;
var httpservreq = require('../httpseverreq.js');
var SHA256 = require("crypto-js/sha256");
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var jade = require('jade');
var path = require('path');
var nano = require('nano')(staticObj.couchdb);
var alphadb = require('nano')(staticObj.couchdb);
var users = nano.use(staticObj.db_authors);
var metadata_db = alphadb.use(staticObj.db_elements_metadata);
var request_db = alphadb.use(staticObj.db_request);
var response_db = alphadb.use(staticObj.db_response); 
var playlist_db = alphadb.use(staticObj.db_playlist);
var examineer_md = alphadb.use(staticObj.db_examineer_metadata);
var graphic_db = alphadb.use(staticObj.db_graphics);
var objectMerge = require('object-merge');
var author_access =  staticObj.author_access;
var global_db = alphadb.use(staticObj.global_db);

function randomString(length, chars) {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
  return result;
}

function timestamp() {
  var now = new Date();
  var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
  var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
  var suffix = (time[0] < 12) ? "AM" : "PM";
  time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
  time[0] = time[0] || 12;
  for (var i = 1; i < 3; i++) { 
    if (time[i] < 10) {
      time[i] = "0" + time[i];
    }
  }
  // Return the formatted string
  return date.join("/") + " " + time.join(":") + " " + suffix;
}

//check weather email exit in db
exports.checkEmail = function (req, res) {
  
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "findEmail", { key: [req.body.email] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        res.end(staticObj.email_already_exist);
      }
      else if (body.rows.length == 0) {
        res.end(staticObj.email_free);
      }
    }
    else {
      res.end(staticObj.some_error_here);
    }
  })
};

//check the short name in db
exports.checkShortName = function (req, res) {
  
  var userMeta = req.userMeta;  
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "find_username", { key: req.body.shortname }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        res.end(staticObj.email_already_exist);
      }
      else if (body.rows.length == 0) {
        res.end(staticObj.email_free);
      }
    }
    else {
      res.end(staticObj.some_error_here);
    }
  })
};

//sign up  new users
exports.signup = function (req, res) {
 
  var userMeta = req.userMeta;
  var authorEmail = req.headers.x_myapp_email;
  var user = req.headers.x_myapp_whoami;
  var ownGrade ={};
  var allgraders=[];
  ownGrade['email']=authorEmail;
  ownGrade['nickname']=user;
  allgraders.push(ownGrade);

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "not_allowed_keyword", { key: staticObj.allow_emails_for_signup }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var notAllowed_array = data.value;
          if (notAllowed_array.indexOf(req.body.shortName.toLowerCase()) > -1) {
            res.render('user_pages/signup', { status: "error", msg: staticObj.short_name_not_allowed,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
          }
          else {
            users.view("getUserData", "find_allow_email", { key: staticObj.allow_emails_for_signup }, function (err, body, headers) {
              if (!err) {
                if (body.rows.length != 0) {
                  body.rows.forEach(function (data) {
                    var allowed_array = data.value;
                    var output = allowed_array.indexOf(req.body.email);
                    if (output >= 1) {
                      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                      users.view("getUserData", "findEmail", { key: [req.body.email] }, function (err, body, headers) {
                        if (!err) {
                          if (body.rows.length != 0) {
                            res.render('user_pages/signup', { status: "error", msg: staticObj.User_already_exist,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
                          }
                          else if (body.rows.length == 0) {
                            if (req.body.password == req.body.password2) {
                              var userEmail = req.body.email.split('@')[0];
                              var shortName = req.body.shortName;
                              var user_data = new Object;
                              user_data.shortName = shortName.slice(0, 20);
                              user_data.email = req.body.email;
                              var enc_sha256 = SHA256(req.body.password);
                              user_data.password = enc_sha256.words[0] + "-" + enc_sha256.words[1] + "-" + enc_sha256.words[2];
                              user_data.verified = false;
                              user_data.createdOn = timestamp();
                              user_data.status = 1;
                              user_data.token = randomString(128, 'aA#');
                              user_data.fullName = userEmail;
                              user_data.concepts = [];
                              user_data.basket = [];
                              user_data.recentView = [];
                              user_data.skills = [];
                              user_data.graders = allgraders;
                              user_data.lastLogin = timestamp();
                              user_data.auth = {"access":author_access };
                              process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                              if (req.body.email != '' && req.body.shortName != '' && req.body.password != '') {
                                users.insert(user_data, user_data.shortName, function (err, body) {
                                  if (!err) {
                                    generateLogs('info', "New member added with short name = " + shortName + " , and email = " + user_data.email);
                                    var jadeFormat = jade.compileFile(staticObj.activation_email);
                                    mail_temp = jadeFormat({ name: user_data.shortName, userId: body.id, tokken: user_data.token, serverUrl: staticObj.main_server_url, apiPrefix: staticObj.activeAccount });
                                    var req_type = "send_mail";
                                    var user_mail_info = new Object;
                                    user_mail_info.to = user_data.email;
                                    user_mail_info.sub = staticObj.mail_subject;
                                    user_mail_info.body = mail_temp;
                                    var randomId = randID();
                                    httpservreq.httpReq(randomId, req_type, user_mail_info, shortName, function (err, body) {
                                      if (!err && body.success) {
                                        var count = 0;
                                        var myVar = setInterval(function () { myTimer() }, 1500);
                                        function myTimer() {
                                          count = count + 1;
                                          if (body.result.length != 0) {
                                            var status = JSON.parse(body.result)
                                            if (status.success) {
                                              res.render('user_pages/signup', { status: "success", msg: staticObj.Account_created, email: '',copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
                                              myStopFunction()
                                            }
                                            else {
                                              res.render('user_pages/signup', { status: "error", msg: staticObj.mail_send_fail,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
                                              myStopFunction()
                                            }
                                            if (count >= 60) {
                                              myStopFunction()
                                            }
                                          }
                                          else {
                                            if (count >= 60) {
                                              myStopFunction()
                                            }
                                          }
                                        }
                                        function myStopFunction() {
                                          clearInterval(myVar);
                                        }
                                      } else {
                                        generateLogs('error', ' ' + err.message);
                                        res.render('user_pages/signup', { status: "error", msg: staticObj.Unable_to_process,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
                                      }
                                    });
                                  }
                                  else {
                                   // console.log(staticObj.some_error_here);
                                    res.render('user_pages/signup', { status: "error", msg: staticObj.some_error_here,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
                                  }
                                });
                              }
                              else {
                                res.render('user_pages/signup', { status: "error", msg: staticObj.feild_empty ,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta});
                              }
                            }
                            else {
                              res.render('user_pages/signup', { status: "error", msg: staticObj.password_not_match,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
                            }
                          }
                        }
                        else {
                          res.render('user_pages/signup', { status: "error", msg: staticObj.some_error_here,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
                        }
                      })
                    }
                    else {
                      res.render('user_pages/signup', { status: "error", msg: "email_not_allow",copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
                    }
                  })
                }
              }
              else {
                logError(" " + err.message);
                res.end("Some error occured !");
              }
            })
          }
        })
      }
    }
  })
};

//function for forgot password mail function
exports.forgot = function (req, res) {
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "findEmail", { key: [req.body.email] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        var user_data = body.rows[0].value;
        if (user_data.token == '') {
          user_data.token = randomString(128, 'aA#');
        }
        var userId = user_data._id;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        users.insert(user_data, function (err, body) {
          if (!err) {
            
            var jadeFormat = jade.compileFile(staticObj.mail_temp_path_forgotpassword);
            mail_temp = jadeFormat({ name: user_data.shortName, userId: body.id, tokken: user_data.token, serverUrl: staticObj.main_server_url, apiPrefix: staticObj.password_rest_temp });

            var req_type = "send_mail";
            var user_mail_info_02 = new Object;
            user_mail_info_02.to = user_data.email;
            user_mail_info_02.sub = staticObj.mail_subject1;
            user_mail_info_02.body = mail_temp;

            var randomId = randID();

            //============== from http server request =============================
            httpservreq.httpReq(randomId, req_type,user_mail_info_02, "Some_user", function (err, body) {
              if (!err && body.success) {
                var count = 0;
                var myVar = setInterval(function () { myTimer() }, 1500);
                function myTimer() {
                  count = count + 1;
                  if (body.result.length != 0) {
                    var status = JSON.parse(body.result)
                    if (status.success) {
                      console.log('Mail sent');
                      var message = staticObj.mail_sent1 + req.body.email;
                      res.render('user_pages/forgot', { status: "success", msg: message,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
                      myStopFunction()
                    }
                    else {
                      console.log('unable to send mail sent');
                      res.render('user_pages/forgot', { status: "error", msg: staticObj.mail_send_fail,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
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
                res.render('user_pages/forgot', { status: "error", msg: staticObj.Unable_to_process,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
                // res.send("Error creating data, Please go back and submit again!!");
              }
            });
          }
          else {
            console.log('some error here ');
          }
        })
      }
      else if (body.rows.length == 0) {
        res.render('user_pages/forgot', { status: "error", msg: staticObj.email_not_found,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
      }
    }
    else {
      res.render('user_pages/forgot', { status: "error", msg: staticObj.some_error_here,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
    }
  })
}

//function for request for account password mail function --
exports.accountRequest = async function (req, res) {
  
  var fdata = {};
  fdata["name"] = req.body.name;
  fdata["affiliation"] = req.body.affiliation;
  fdata["department"] = req.body.dept;
  fdata["email"] = req.body.email;
  fdata["webpage"] = req.body.personalPage; 
  fdata["phone"] = req.body.phoneNo;
  fdata["hearAboutUs"] = req.body.howToKnow;
  fdata["courseTaught"] = req.body.coursesYouTeach;

  var isValid = true;
  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  if (reg.test(req.body.email) == false) 
  {
    isValid = false;
  }
  
  var isValid = true;
  ['name','affiliation','department','email','hearAboutUs','courseTaught'].forEach(x=>{  
  if(fdata[x].trim()=="")
    isValid = false;
  });
 

  if(!isValid){
   res.render('user_pages/accountReqForm', { status: "error", msg: "Enter all required fields" });    
  }else{
    
    try {

    let emailData = await users.view('ByEmail', 'getStatus',{key:req.body.email});
    if(emailData.rows.length>0){     
      res.render('user_pages/accountReqForm', { status: "error", msg: "This email is already exist" });
    }else{
        let alreadyUsername = [];
        let usersRes =  await users.view('getUserData','getAuthorData');
        if(usersRes.rows.length>0){
          alreadyUsername = usersRes.rows.map( x =>{
                return x.value.shortname; 
          });
            
        }

        let notAllowedBody = await users.get('00allowed');
        notAllowedBody.notAllowed.forEach(x=>{
          if(alreadyUsername.indexOf(x)==-1){
            alreadyUsername.push(x);
          }
        });

        console.log(alreadyUsername);
        
        let firstChars = req.body.email.slice(0,4);
        let id = httpservreq.autoGenerateDBId(firstChars,3,alreadyUsername);    
        let token = randomString(128,'aA#');
        var data =  {
          _id: id,      
          shortName: id,
          email: fdata["email"],
          fullName: fdata["name"],
          accStatus:"unverified",
          request: {
              webpage: fdata["webpage"],
              phone: fdata["phone"],
              affiliation: fdata["affiliation"],
              department: fdata["department"],
              hearAboutUs: fdata["hearAboutUs"],
              courseTaught: fdata["courseTaught"]
          },
          token: token,      
          createdOn:getCurrentUTCDate(),
          history: [
            {
              action:"newAccRequest",
              msg:"Request for an account.",
              when:getCurrentUTCDate()
            }
          ]
        }

        let newuser = await users.insert(data);
        //set the mail_temp with extra parameters
        var jadeFormat = jade.compileFile(staticObj.mail_temp_path_accountReq);
        mail_temp = jadeFormat({ token:token,id:id,serverUrl: staticObj.main_server_url });

        var req_type = "send_mail";
        var user_mail_info_02 = new Object;
      
        user_mail_info_02.to = fdata["email"];
        user_mail_info_02.sub = 'Verify your email address for examineer.in';
        user_mail_info_02.body = mail_temp;
        var randomId = randID();

        //============== from http server request =============================
        httpservreq.httpReq(randomId, req_type,user_mail_info_02, "Unregistered user " + fdata["email"], function (err, body) {
          if (!err && body.success) {
            var count = 0;
            var myVar = setInterval(function () { myTimer() }, 1500);
            function myTimer() {
              count = count + 1;
              if (body.result.length != 0) {
                var status = JSON.parse(body.result)
                if (status.success) {
                  console.log('Mail sent');
                  var message = staticObj.mail_sentAccountReq;
                  res.redirect('/request?status=success&msg='+message);
                  myStopFunction()
                }
                else {
                  console.log('unable to send mail sent');
                  res.redirect('/request?status=success&msg='+staticObj.mail_send_fail);
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
          // console.log("error===========" + err);
            res.render('user_pages/accountReqForm', { status: "error", msg: staticObj.Unable_to_process });
          }
        });
        //============== from http server request ends=============================

      }      
    } catch (error) {
      console.log(error);
      res.redirect('/request?status=error&msg=Something goes wrong.Please try again');
    }
  }    
}





//function for reset password
exports.password_reset = function (req, res) {
  
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (req.body.password == req.body.password2) {
        if (body.rows.length != 0) {
          body.rows.forEach(function (data) {
            var rev_id = data.value._rev;
            var user_data = new Object;
            user_data = data.value;
            var enc_sha256 = SHA256(req.body.password);
            user_data.password = enc_sha256.words[0] + "-" + enc_sha256.words[1] + "-" + enc_sha256.words[2];
            if (data.value.verified == true) {
              user_data.token = '';
            }
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            users.insert(user_data, function (err, body) {
              if (!err) {
                console.log(staticObj.password_change);
                res.json({ status: "success", msg: staticObj.password_change, link: "" });
              }
              else {
                console.log(staticObj.Unable_to_process);
                res.json({ status: "error", msg: staticObj.Unable_to_process, link: "" });
              }
            })
          })
        }
        else {
          console.log("2===" + staticObj.invaild_request);
          res.json({ status: "error", msg: staticObj.invaild_request, link: "" });
        }
      }
      else {
        console.log(staticObj.password_mismatch);
        res.json({ status: "error", msg: staticObj.password_mismatch, link: "" });
      }
    }
    else {
      console.log("1===" + staticObj.invaild_request);
      res.json({ status: "error", msg: staticObj.invaild_request, link: "" });
    }
  });
}


//function for account activation
exports.activeaccountuser = function (req, res, next) {
 
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "activeAccount", { key: [req.params.id, req.params.token] }, function (err, body, headers) {
    // console.log(err);
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var ac_status = data.value.verified;
          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data = data.value;
          user_data.token = '';
          user_data.verified = true;
          if (ac_status == false) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            users.insert(user_data, function (err, body) {
              if (!err) {
                var msg1 = staticObj.account_active_msg;
                var signin_link = staticObj.main_server_url + '/authorlogin';
                res.render(staticObj.custome_error_page_jade, { title: staticObj.custome_error_page_string, msg1: msg1, redirect_link: signin_link, userMeta: userMeta, copyright: globaldata });
              }
              else {
                var msg1 = staticObj.something_bad_happened_string;
                var signin_link = staticObj.main_server_url + '/authorlogin';
                res.render(staticObj.custome_error_page_jade, { title: staticObj.custome_error_page_string, msg1: msg1, redirect_link: signin_link, userMeta: userMeta, copyright: globaldata });
              }
            })
          }
          else if (ac_status == true) {
            var msg1 = staticObj.account_already_active_string;
            var signin_link = staticObj.main_server_url + '/authorlogin';
            res.render(staticObj.custome_error_page_jade, { title: staticObj.custome_error_page_string, msg1: msg1, redirect_link: signin_link, userMeta: userMeta, copyright: globaldata });
          }
        })
        //res.end("email already exist");
      }
      else if (body.rows.length == 0) {
        var msg1 = staticObj.invaild_activation_request_string;
        var signin_link = staticObj.main_server_url + '/authorlogin';
        res.render(staticObj.custome_error_page_jade, { title: staticObj.custome_error_page_string, msg1: msg1, redirect_link: signin_link, userMeta: userMeta, copyright: globaldata });
      }
    }
    else {
      var msg1 = staticObj.something_bad_happened_string;
      var signin_link = staticObj.main_server_url + '/authorlogin';
      res.render(staticObj.custome_error_page_jade, { title: staticObj.custome_error_page_string, msg1: msg1, redirect_link: signin_link, userMeta: userMeta, copyright: globaldata });
    }
  })
}

//password reset user request move to password reset form
exports.password_reset_request = function (req, res) {
 
  var userMeta = req.userMeta;
  res.render(staticObj.pass_reset_jade, { title: staticObj.password_reset, userId: req.params.id, userMeta: userMeta,token: req.params.token, copyright: globaldata, post_linke: staticObj.main_server_url + '/authorpasswordreset' });
}


//check user is valid & nor
exports.check_oauth = function (req, res) {
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        res.json({ status: "success", msg: "", link: "" });
      }
      else {
        res.json({ status: "error", msg: "", link: "" });
      }
    }
    else {
      res.json({ status: "error", msg: "", link: "" });
    }
  });
}

//check email is vaild or nor
exports.check_email = function (req, res) {
  
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "findEmail", { key: [req.body.email] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        res.end("email already exist");
      }
      else if (body.rows.length == 0) {
        res.end("email free");
      }
    }
    else {
      logError(err.message);
      res.end("some error here !");
    }
  })
}


//check email is vaild or nor
exports.check_email_and_permission = function (req, res) {
  
  var userMeta = req.userMeta;;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "find_allow_email", { key: staticObj.allow_emails_for_signup }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var allowed_array = data.value;
          var output = allowed_array.indexOf(req.body.email);
          if (output >= 1) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            users.view("getUserData", "findEmail", { key: [req.body.email] }, function (err, body, headers) {
              if (!err) {
                if (body.rows.length != 0) {
                  res.end("email already exist");
                }
                else if (body.rows.length == 0) {
                  res.end("email free");
                }
              }
              else {
                res.end("some error here !");
              }
            })
          }
          else {
            res.end("email_not_allow");
          }
        })
      }
    }
    else {
      logError(err.message);
      res.end("some error here !");
    }
  })
}

//save alter email
exports.save_alterEmail = function (req, res) {
  
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.alternate_email = req.body.email;
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            if (!err) {
              user_data.id = user_data._id;
              user_data.name = user_data.shortName;
              user_data.create_on = user_data.createdOn;
              generateLogs('info', user_data.name + " changed alternative email");
              delete user_data.password;
              delete user_data._id;
              delete user_data.shortName;
              delete user_data.createdOn;
              delete user_data._rev;
              delete user_data.verified;
              res.json({ status: "success", msg: "Alternate email changed", link: "", userBlock: user_data });
            }
            else {
              logError(" " + err.message);
              res.json({ status: "error", msg: "Unable to process", link: "" });
            }
          })
        })
      }
      else {
        logError("Invalid request");
        res.json({ status: "error", msg: " Invaild request !", link: "" });
      }
    }
    else {
      logError(err.message);
      res.json({ status: "error", msg: " Invaild request !", link: "" });
    }
  });
}

// save_concept 
exports.save_concept = function (req, res) {
  
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var concepts = req.body.concepts;
          var allconcepts = [];

          if (data.value.concepts) {
            allconcepts = data.value.concepts;
            if (allconcepts == "") {
              allconcepts[0] = concepts;
            } else {
              if (allconcepts.indexOf(concepts) == -1) {
                allconcepts.push(concepts);
              } else {
                res.json({ status: "error", msg: "Concept already exist!", link: "" });
              }
            }
          } else {
            allconcepts[0] = concepts;
          }
          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.concepts = allconcepts;

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            if (!err) {
              user_data.id = user_data._id;
              user_data.name = user_data.shortName;
              user_data.create_on = user_data.createdOn;
              // console.log('Concepts added');
              delete user_data.password;
              delete user_data._id;
              delete user_data.shortName;
              delete user_data.createdOn;
              delete user_data._rev;
              delete user_data.verified;
              res.json({ status: "success", msg: " Concepts added !", link: "", userBlock: user_data });
            }
            else {
              console.log('Unable to process !');
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

// delete_concept 
exports.delete_concept = function (req, res) {
  
  var userMeta = req.userMeta;;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var concepts = req.body.concepts;
          var allconcepts = data.value.concepts;

          var i = allconcepts.indexOf(concepts);
          allconcepts.splice(i, 1);

          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.concepts = allconcepts;

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            // console.log(err);
            if (!err) {
              user_data.id = user_data._id;
              user_data.name = user_data.shortName;
              user_data.create_on = user_data.createdOn;
              // console.log('Concepts added');
              delete user_data.password;
              delete user_data._id;
              delete user_data.shortName;
              delete user_data.createdOn;
              delete user_data._rev;
              delete user_data.verified;
              res.json({ status: "success", msg: " Concepts added !", link: "", userBlock: user_data });
            }
            else {
              console.log('Unable to process !');
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

//save save_skill email
exports.save_skill = function (req, res) {
  
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {

          var skills = req.body.skills;
          var allskills = [];

          if (data.value.skills) {
            allskills = data.value.skills;
            if (allskills == "") {
              allskills[0] = skills;
            } else {
              if (allskills.indexOf(skills) == -1) {
                allskills.push(skills);
              } else {
                res.json({ status: "error", msg: "Skill already exist!", link: "" });
              }
            }
          } else {
            allskills[0] = skills;
          }

          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.skills = allskills;

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            if (!err) {
              user_data.id = user_data._id;
              user_data.name = user_data.shortName;
              user_data.create_on = user_data.createdOn;
              // console.log('Skills added');
              delete user_data.password;
              delete user_data._id;
              delete user_data.shortName;
              delete user_data.createdOn;
              delete user_data._rev;
              delete user_data.verified;
              res.json({ status: "success", msg: " Skills added !", link: "", userBlock: user_data });
            }
            else {
              console.log('Unable to process !');
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

//save delete_skill email
exports.delete_skill = function (req, res) {
 
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {

          var skills = req.body.skills;

          var allskills = data.value.skills;
          var i = allskills.indexOf(skills);
          allskills.splice(i, 1);

          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.skills = allskills;

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {

            if (!err) {
              user_data.id = user_data._id;
              user_data.name = user_data.shortName;
              user_data.create_on = user_data.createdOn;
              // console.log('Skills added');
              delete user_data.password;
              delete user_data._id;
              delete user_data.shortName;
              delete user_data.createdOn;
              delete user_data._rev;
              delete user_data.verified;
              res.json({ status: "success", msg: " Skills added !", link: "", userBlock: user_data });
            }
            else {
              console.log('Unable to process !');
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

//save save grader
exports.save_graders = function (req, res) {
 
  var userMeta = req.userMeta;
  var authorEmail = req.headers.x_myapp_email;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {

          var gradeEmail = req.body.gradeEmail;
          var gradeNickname = req.body.gradeNickname;
          var gradeJson = {};
          gradeJson['email']=gradeEmail;
          gradeJson['nickname']=gradeNickname;
          var allgraders = [];

          var ownGrade ={};
          ownGrade['email']=authorEmail;
          ownGrade['nickname']=req.body.userId;
          
          // console.log(data.value.graders)
          if (data.value.graders) {
            allgraders = data.value.graders;

            

            if (allgraders == "") {
              
              allgraders.push(ownGrade)

              let gexist = allgraders.findIndex(itm=>{
                return itm.email==gradeEmail
              })
  
              let gexist1 = allgraders.findIndex(itm=>{
                return itm.nickname==gradeNickname
              })
              if (gexist> -1) {
                res.json({ status: "error", msg: "grader's email already exist!", link: "" });
              } else {
                  if (gexist1> -1) {
                    res.json({ status: "error", msg: "grader's nickname already exist!", link: "" });
                  }else{
                    allgraders[1] = gradeJson;
                  }
              }
            } else {
              let gexist = allgraders.findIndex(itm=>{
                return itm.email==gradeEmail
              })
  
              let gexist1 = allgraders.findIndex(itm=>{
                return itm.nickname==gradeNickname
              })
              if (gexist> -1) {
                res.json({ status: "error", msg: "grader's email already exist!", link: "" });
              } else {
                  if (gexist1> -1) {
                    res.json({ status: "error", msg: "grader's nickname already exist!", link: "" });
                  }else{
                    allgraders.push(gradeJson);
                  }
              }
            }
          } else {
            allgraders.push(ownGrade);
            let gexist = allgraders.findIndex(itm=>{
              return itm.email==gradeEmail
            })

            let gexist1 = allgraders.findIndex(itm=>{
              return itm.nickname==gradeNickname
            })

            if (gexist> -1) {
              res.json({ status: "error", msg: "grader's email already exist!", link: "" });
            } else {
                if (gexist1> -1) {
                  res.json({ status: "error", msg: "grader's nickname already exist!", link: "" });
                }else{
                  allgraders[1] = gradeJson;
                }
            }
            // allgraders[1] = gradeJson;
          }

          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.graders = allgraders;

          // console.log(JSON.stringify(user_data))
          if(allgraders.length<12){
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            if (!err) {
              user_data.id = user_data._id;
              user_data.name = user_data.shortName;
              user_data.create_on = user_data.createdOn;
              // console.log('Skills added');
              delete user_data.password;
              delete user_data._id;
              delete user_data.shortName;
              delete user_data.createdOn;
              delete user_data._rev;
              delete user_data.verified;
              res.json({ status: "success", msg: " Grader added !", link: "", userBlock: user_data });
            }
            else {
              console.log('Unable to process !');
              res.json({ status: "error", msg: " Unable to process !", link: "" });
            }
          })
          }else{
            res.json({ status: "error", msg: "Only 10 graders are allowed", link: "" });
          }

          
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

// delete_concept 
exports.delete_graders = function (req, res) {
  
  var userMeta = req.userMeta;;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var graders = req.body.graders;
          var allgraders = data.value.graders;

          allgraders.splice(graders, 1);

          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.graders = allgraders;
        
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            users.insert(user_data, function (err, body) {
              // console.log(err);
              if (!err) {
                user_data.id = user_data._id;
                user_data.name = user_data.shortName;
                user_data.create_on = user_data.createdOn;
                // console.log('graders removed');
                delete user_data.password;
                delete user_data._id;
                delete user_data.shortName;
                delete user_data.createdOn;
                delete user_data._rev;
                delete user_data.verified;
                res.json({ status: "success", msg: " grader deleted !", link: "", userBlock: user_data });
              }
              else {
                console.log('Unable to process !');
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


//save the password
exports.save_password = function (req, res) {
  
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (req.body.password == req.body.password2) {
        if (body.rows.length != 0) {
          body.rows.forEach(function (data) {
            var rev_id = data.value._rev;
            var user_data = new Object;
            user_data = data.value;
            var enc_sha256 = SHA256(req.body.password);
            user_data.password = enc_sha256.words[0] + "-" + enc_sha256.words[1] + "-" + enc_sha256.words[2];
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            users.insert(user_data, function (err, body) {
              if (!err) {
                console.log('password change');
                res.json({ status: "success", msg: " Password Change !", link: "" });
              }
              else {
                console.log('Unable to process !');
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
        console.log('Password mismatch !');
        res.json({ status: "error", msg: " Password mismatch !", link: "" });
      }
    }
    else {
      console.log('Invaild request !');
      res.json({ status: "error", msg: " Invaild request !", link: "" });
    }
  });
}


//set the user  full name
exports.set_full_name = function (req, res) {
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.fullName = req.body.full_name;

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            if (!err) {
              user_data.id = user_data._id;
              user_data.name = user_data.shortName;
              user_data.create_on = user_data.createdOn;
              delete user_data.password;
              delete user_data._rev;
              delete user_data.verified;
              delete user_data._id;
              delete user_data.shortName;
              delete user_data.createdOn;
              res.json({ status: "success", msg: " Save", link: "", userBlock: user_data });
            }
            else {
              console.log('Unable to process !');
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

//set the user  full name
exports.set_language = function (req, res) {
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [req.body.userId, req.body.token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.language = req.body.language;

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            if (!err) {
              user_data.id = user_data._id;
              user_data.name = user_data.shortName;
              user_data.create_on = user_data.createdOn;
              delete user_data.password;
              delete user_data._rev;
              delete user_data.verified;
              delete user_data._id;
              delete user_data.shortName;
              delete user_data.createdOn;
              res.json({ status: "success", msg: " Save", link: "", userBlock: user_data });
            }
            else {
              console.log('Unable to process !');
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


//function for oauth users
exports.Auth = function (req, res) {
  //login code block start here
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  var httpFlag = staticObj.httpFlag;
  var secureFlag = staticObj.secureFlag;
  var enc_sha256 = SHA256(req.body.password);
  var enc_sha_password = enc_sha256.words[0] + "-" + enc_sha256.words[1] + "-" + enc_sha256.words[2];
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth", { key: [req.body.email, enc_sha_password] }, function (err, body) {
    if (body.rows.length >= 1) {
      var userId = body.rows[0].id;
      body.rows.forEach(function (data) {
        var user_data = new Object;
        user_data = data.value;

        if(user_data.accStatus=="active"){
          user_data.token = randomString(128, 'aA#');
          user_data.lastLogin = getCurrentUTCDate();
          generateLogs('info', 'Successfully login for ' + req.body.email);
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            // console.log(err);
            if (!err) {
              delete user_data.password;
              delete user_data._rev;
              delete user_data.verified;
              var msg = "";
              var buffer =  Buffer.from([user_data.shortName, ':', user_data.token].join('')).toString('base64');
              tokenBase64 = buffer.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
              res.cookie('userToken', tokenBase64, { maxAge: 3.1536e+10, httpOnly: httpFlag, secure: secureFlag }); // 1 yrs
              res.redirect("/author_dashboard");
            }
            else {
              res.render('user_pages/login', { status: "error", msg: staticObj.Unable_to_process,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
            }
          })

        }else 
        if(user_data.accStatus == "blocked"){
          res.render('user_pages/login', { status: "error", msg: staticObj.Account_block,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
        }else 
        if(user_data.accStatus == "pending" || user_data.accStatus == "rejected"){
          res.render('user_pages/login', { status: "error", msg: staticObj.Account_request_pending,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
        }else 
        if(user_data.accStatus == "rejected"){
          res.render('user_pages/login', { status: "error", msg: staticObj.Account_request_rejected,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata ,studentUrl:staticObj.studentUrl, userMeta: userMeta});
        }else 
        if(user_data.accStatus == "unverified"){
          generateLogs('info', 'Account is not active for ' + req.body.email);
          res.render('user_pages/login', { status: "error", msg: staticObj.Account_active,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
        }
        
      })
    }
    else {
      generateLogs('warn', 'Invalid credentials for ' + req.body.email);
      console.log(staticObj.Email_Password_Invaild);
      res.render('user_pages/login', { status: "error", msg: staticObj.Email_Password_Invaild ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
    }
  })
}



//logout function start here
exports.logout = function (req, res) {
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  var author = req.headers.x_myapp_whoami;
  var token = req.headers.x_myapp_token;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "oauth_token", { key: [author, token] }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var rev_id = data.value._rev;
          var user_data = new Object;
          user_data = data.value;
          user_data.token = '';
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          users.insert(user_data, function (err, body) {
            if (!err) {
              generateLogs('info', 'successfully logout from account ' + author);
              res.clearCookie("userToken");
              res.redirect('/authorlogin');
            }
            else {
              logError(" " + err.message);
              res.clearCookie("userToken");
              res.redirect('/authorlogin');
            }
          })
        })
      }
      else {
        res.clearCookie("userToken");
        res.redirect('/authorlogin');
      }
    }
    else {
      res.clearCookie("userToken");
      res.redirect('/authorlogin');
    }
  });
}



//check user_name free or nor
exports.find_username = function (req, res) {
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("getUserData", "not_allowed_keyword", { key: staticObj.allow_emails_for_signup }, function (err, body, headers) {
    if (!err) {
      if (body.rows.length != 0) {
        body.rows.forEach(function (data) {
          var notAllowed_array = data.value;
          if (notAllowed_array.indexOf(req.params.username.toLowerCase()) > -1) {
            res.json({ status: "success", msg: "Username not allowed", link: "" });
          }
          else {
            users.view("getUserData", "find_username", { key: req.params.username }, function (err, body, headers) {
              if (!err) {
                if (body.rows.length != 0) {
                  res.json({ status: "success", msg: "username used", link: "" });
                }
                else {
                  res.json({ status: "success", msg: "username free", link: "" });
                }
              }
              else {
                logError(err.message)
                res.json({ status: "error", msg: " Invaild request !", link: "" });
              }
            });
          }
        })
      }
    }
  })
}

exports.profilePage = function (req, res) {
  var userinfo = '';
  var token = req.headers.x_myapp_token;
  var author = req.headers.x_myapp_whoami;
  var authorEmail = req.headers.x_myapp_email;
  // var fullName = req.headers.x_myapp_fullName;
  var userMeta = req.userMeta;
  // var fullName = req.headers.x_myapp_fullName;
  var wbAccess = req.headers.x_myapp_wbAccess;
  var msg = "";
  var userdata_db = new Array();

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.get(author, function (err, doc) {
    if (!doc["concepts"]) {
      // console.log("Concepts not defined");
      doc.concepts = [];
    }
    if (!doc["skills"]) {
      // console.log("skills not defined");
      doc.skills = [];
    }
    if (!doc["fullName"]) {
      // console.log("fname not defined");
      doc.fullName = " ";
    }

    httpservreq.countryname(function (err, body2) {
      if(!err){
          var countries = body2.data;
          var currency = body2.currency;
          var language = body2.language;
          
          var myLangArray = language.filter(function(elem, index, self) {
              return index === self.indexOf(elem);
          });

          res.render('user_pages/profile', { user_data: doc, msg: msg, short: author, token: token,authorEmail:authorEmail, userMeta: userMeta,language:myLangArray,user_info: userinfo, tooltip: tooltip, copyright: globaldata});
      }else{
          res.json({status:false,msg:"apierror"})
      // res.redirect("/author_dashboard?msg=apierror");
      }
    })
  })
}

exports.loginPage = function (req, res) {    
  // console.log(staticObj.docUrl)
  var userMeta = req.userMeta;
  res.render('user_pages/login', { title: 'Auth', msg: "", status: "" , studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta});
}

exports.signupPage = async function (req, res) {
  try {
    let id = req.params.id?req.params.id:false;
    let token = req.params.token?req.params.token:false;
    if(id && token){
      let authRes =  await users.view("getUserData", "oauth_token", { key: [id,token] });
      if(authRes.rows.length>0){
        let data = authRes.rows[0].value;
        if(data.accStatus == "unverified"){
          res.render('user_pages/userSignup', { title: 'Auth', status: '', msg: '',pageStatus:true,data:data });
        }else{
          res.render('user_pages/userSignup', { title: 'Auth', status: '', msg: '',pageStatus:false });
        }
      }else{
        res.render('user_pages/userSignup', { title: 'Auth', status: '', msg: '',pageStatus:false });
      }
    }else{
       res.render('user_pages/userSignup', { title: 'Auth', status: '', msg: '',pageStatus:false });
    }
    
  } catch (error) {
    res.render('user_pages/userSignup', { title: 'Auth', status: '', msg: '',pageStatus:false });
  }
  
}

exports.forgotPage = function (req, res) {
  var userMeta = req.userMeta;
  res.render('user_pages/forgot', { title: 'Auth', msg: "", status: "",copyright: globaldata,studentUrl:staticObj.studentUrl, userMeta: userMeta });
}

exports.logoutPage = function (req, res) {
  res.clearCookie("userToken");
  res.redirect('/authorlogin');
}

exports.accReqForm = function (req, res) {
  let status = '';
  let msg = '';
  if(req.query.status){
    status = req.query.status;
  }

  if(req.query.msg){
    msg = req.query.msg;
  }

  res.render('user_pages/accountReqForm', { title: 'Auth', status: status, msg: msg });
}

function logError(msg) {
  generateLogs('error', msg);
}

//check email id already exist while using ajax request --
exports.checkEmailID = async function(req,res){
  let email = req.body.email;
  try {
    let emailData = await users.view('ByEmail', 'getStatus',{key:email});
    if(emailData.rows.length>0){     
     res.json(false);     
    }else{
     res.json(true);
    }
    
  } catch (error) {
    console.log("check email id error :"+ error );
    res.json(false);
  }
}

exports.authorsignupByEmail = async function(req,res){
  console.log(req.body);
  try {
    
    if(req.body.password=='' || req.body.docid == '' || req.body.token == ''){
      return res.json({status:false, msg:'Please enter all required fields'});
    }
  
    let authRes =  await users.view("getUserData", "oauth_token", { key: [req.body.docid,req.body.token] });
    if(authRes.rows.length>0){
      console.log(authRes);
    
      let data = authRes.rows[0].value;
      if(data.accStatus=="unverified"){

        if(data.token){
          data.token = '';
        }
       
        var enc_sha256 = SHA256(req.body.password);
        data['password'] = enc_sha256.words[0] + "-" + enc_sha256.words[1] + "-" + enc_sha256.words[2];
        data['concepts'] = [];
        data['basket'] = [];
        data['recentView'] = [];
        data['skills'] = []; 
        data['createdOn'] = getCurrentUTCDate();
        data['auth'] = {
          "access": staticObj.author_access
        };

        if(!data.hasOwnProperty('history')){
           data['history'] = [];
        }

        data["history"].push({
          action:"verifiedAndSetPass",
          msg:"Email verified and password set",
          when:getCurrentUTCDate()
        });
  
        data['accStatus'] = "pending";
  
        await users.insert(data);
        
  
        ///////////
          //set the mail_temp with extra parameters
          var jadeFormat = jade.compileFile(staticObj.mail_temp_path_newReq);
          mail_temp = jadeFormat({ data:data,serverUrl: staticObj.main_server_url });
  
          var req_type = "send_mail";
          var user_mail_info_02 = new Object;
          
          user_mail_info_02.to = staticObj.webEmail;
          user_mail_info_02.sub = 'New account request of examineer';
          user_mail_info_02.body = mail_temp;
          var randomId = randID();
  
          //============== from http server request =============================
          httpservreq.httpReq(randomId, req_type,user_mail_info_02, "Unregistered user " + data["email"], function (err, body) {
            if (!err && body.success) {
              ///////////
              if (body.result.length != 0) {
                return res.json({status:true,msg:'Your email id is verified successfully.To access examineer, Please wait for admin approval. You will be notified on your email address.'});
              }else{
                return res.json({status:false,msg:'Your email id is verified successfully.Mail is not sent to admin.To access examineer, Please wait for admin approval. You will be notified on your email address.'});
              }
              //////////
              
            } else {
            // console.log("error===========" + err);
            return res.json({status:false,msg:'Your email id is verified successfully.Mail is not sent to admin.To access examineer, Please wait for admin approval. You will be notified on your email address.'});
            }
          });
          //============== from http server request ends=============================
  
  
        //////////


      }else{
        return res.json({status:"invalidLink",msg:'Either this verify link has been used or this is a invalid link'});
      }
      
    }else{
        return res.json({status:"invalidLink",msg:'Either this verify link has been used or this is a invalid link'});
    }
    
  } catch (error) {
    return res.json({status:"error", msg:'Something goes wrong, Please try again later.'});
  }
}

//

exports.privacydoc = function (req, res) {    
  // console.log(staticObj.docUrl)
  var userMeta = req.userMeta;
  var id1 = req.params.id;
 
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  global_db.get('legal_docs', function (err, body) {
    if (!err) {
      // console.log(body[id1])
      if(body[id1]){
        res.json({status:"success", data:body[id1]})
      }else{
        res.json({status:"error", msg:"Not Found"})
      }
    } else {
      res.json({status:"error", msg:"Not Found"})
    }
  });

}
