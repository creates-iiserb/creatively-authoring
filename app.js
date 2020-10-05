var fs = require('fs');
var staticObj = require('./config.js').merge_output;
var express = require('express');
var https = require('https');
var app = express();
var http = require('http');
var path = require('path');
var router = express.Router();
var couchdb = require('nano')(staticObj.couchdb);
var author_db = couchdb.use(staticObj.db_authors);
var global_db = couchdb.use(staticObj.global_db);
var ticketRais_db = couchdb.use(staticObj.db_ticketRaise);
var wbpublished_db = couchdb.use(staticObj.db_wbpublished);


allRoutes = [];
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
global_db.get('author_access', function (err, body) {
  if (!err) {
    allRoutes = body.access;
  } else {
    allRoutes = "";
  }
});



log4js = require('log4js');

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: staticObj.logPath, category: 'AuthorModule' }
  ]
});

log4js.addAppender(log4js.appenders.file(staticObj.logPath), 'AuthorModule');

var authorLog = log4js.getLogger('AuthorModule');
authorLog.setLevel(staticObj.logPath);//TRACE

generateLogs = function (error, msg) {
  switch (error) {
    case "trace":
      authorLog.trace(msg);
      break;
    case "debug":
      authorLog.debug(msg);
      break;
    case "info":
      authorLog.info(msg);
      break;
    case "warn":
      authorLog.warn(msg);
      break;
    case "error":
      authorLog.error(msg);
      break;
    case "fatal":
      authorLog.fatal(msg);
      break;
  }
}

let checkAuth = (route, method, userAccess) => {
  
  let findRoute = itm => {
    return itm.method == method && itm.route == route
  }
  
  let routeExists = allRoutes.find(findRoute);
  //console.log(routeExists)
  
  let allowed = false;

  if (routeExists) {
    console.log("does  exists")
    // console.log(routeExists.group)
    if (userAccess.indexOf(routeExists.group) > -1) {
      allowed = true
    } 
    else {
      console.log("not allowed")
    }

  } 
  else {
    console.log("does not exists")
  }

  // console.log(routeExists)
  return allowed
}


async function gateway(req, res, next) {
  var whoami = '';
  var token = '';
  req.userMeta= {"loginVideoName":staticObj.loginVideoName,"loginVideoPath":staticObj.loginVideoPath};
  var userMeta = req.userMeta;
  if (req.originalUrl.includes('/author_')) {
    //console.log("Entering secure route");
    if (req.body.email && req.body.password) {
     
      next();
    } else if (req.cookies.userToken) {
      // User already logged in , check token validity and continue
      oAuthB = req.headers.cookie.split('=');
      //resolve the oauth token from the header and decode to ascii
      var oAuthAS = Buffer.from(req.cookies.userToken, 'base64').toString('ascii'); /// if error convert to UTF-8
      oauthArray = oAuthAS.split(':');
      if (oauthArray.length != 2) {
        res.render('user_pages/login', { status: "error", msg: "Unauthorized Access", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata ,userMeta: userMeta }); return;
      } else {

        try {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          let body = await author_db.view("getUserData", "oauth_token", { key: [oauthArray[0], oauthArray[1]] });
          if (body.rows.length < 1) {
            res.render('user_pages/login', { status: "error", msg: "Unauthorized Login", link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata, userMeta: userMeta }); return;
          }
          else {

            let udata =  body.rows[0].value;
            whoami = oauthArray[0];
            token = oauthArray[1];
            req.headers.x_myapp_whoami = whoami;
            req.headers.x_myapp_token = token;

            if(udata.accStatus == "active"){
              req.headers.x_myapp_email = udata.email;
              if(!udata["auth"]){
                udata['auth'] = {
                  access :staticObj.author_access
                }
              }
  
              let access = udata['auth'].access;
              if(!udata.hasOwnProperty('basket')){
                udata.basket = [];
              }
              
  
              let counterData = {
                tickets: 0,
                basket: udata.basket.length,
                newAuthorReq:0,
                newWbPublishReq:0
              }
              
              //get ticket counter
              if(access.includes('publicWrite')){
                let ticketBody = await ticketRais_db.view("byAdmin", "authorResolvedToDoc", { key: udata['_id'] });
                let counter = 0;
                if(ticketBody.rows.length>0){
                  ticketBody.rows.forEach(function (resdata) {
                       if (resdata.value.resolved == false){
                         counter++;
                       }
                  });
                }
                counterData.tickets = counter;
              }
             
              //admin counters
              if(access.includes('admin')){
                let counterBody = await author_db.view('byAdmin', 'newAccountReqCounter', {reduce: true});
                if(counterBody.rows.length>0){
                  counterData.newAuthorReq = counterBody.rows[0].value;
                }

                let wbPublishCounter = 0;
                let wbPubBody = await wbpublished_db.view('author', 'publishedDocForAdmin');
                if(wbPubBody.rows.length>0){
                  wbPubBody.rows.forEach((doc) => {
                    if(doc.value.status){
                        if(doc.value.status=="pending" && doc.value.published==false){
                            wbPublishCounter++;
                        }
                    }
                });

                counterData.newWbPublishReq = wbPublishCounter;

                }

              }
  
             
              var pattern = new RegExp(/\?.+=.*/g);
              let a =  JSON.parse(JSON.stringify(req.originalUrl))
              if(pattern.test(a)==true){
                 a = a.split("?")[0];
              }
            
              let checkAuth111= checkAuth(a,req.method.toString().toLowerCase(),udata.auth.access);
              if(checkAuth111==true){
                // console.log("checkAuth111===="+checkAuth111);
                req.userMeta= {"fullName":body.rows[0].value.fullName, "access":udata.auth.access,"lastLogin":body.rows[0].value.lastLogin,"counter":counterData,"loginVideoName":staticObj.loginVideoName,"loginVideoPath":staticObj.loginVideoPath,"pdf_url":staticObj.pdf_url};
                next();
              }else{
                res.render('noAccess', {});
                // console.log("checkAuth111 err===="+checkAuth111);
              }
            }else 
            if(udata.accStatus == "blocked"){
              res.render('user_pages/login', { status: "error", msg: staticObj.Account_block, link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata,userMeta: userMeta }); return;
            }else 
            if(udata.accStatus == "pending" || udata.accStatus == "rejected"){
              res.render('user_pages/login', { status: "error", msg: staticObj.Account_request_pending, link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata ,userMeta: userMeta}); return;
            }else 
            if(udata.accStatus == "unverified"){
              res.render('user_pages/login', { status: "error", msg: staticObj.Account_active, link: "" ,studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata ,userMeta: userMeta}); return;
            }
            
            
          }

        } catch (error) {
          console.log("===Error===");
          console.log(error);
        }
       
        
        
      }
    } else if (!req.cookies.userToken) {
     
       console.log("unauthorized 1 ,will redirect to login page");
      res.render('user_pages/login', { status: "error", msg: "Session Expired", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata ,userMeta: userMeta});
    }
    else {
     
      console.log('no Authorization received');
      res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "",studentUrl:staticObj.studentUrl,docUrl:staticObj.docUrl,copyright: globaldata,userMeta: userMeta }); return;
       }
  } else {
    console.log('no Auth required');
    next();
  }
}





globaldata = "";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
global_db.get('copyright', function (err, body) {
  if (!err) {
    globaldata = body.copyFull;
  } else {
    globaldata = "";
  }
});

tooltip = "";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
global_db.get('authoring_tooltips', function (err, body) {
  if (!err) {
    tooltip = body;
  } else {
    tooltip = "";
  }
});

quizLang = "";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
global_db.get('languages', function (err, body) {
  if (!err) {   
    quizLang = body.language_list;
  } 
});

// global fun to generATE random id
 randID = function () {
  var text = "";
  var length = 5;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  var today = new Date();
  var ss = today.getSeconds();
  var mm = today.getMinutes();
  var hh = today.getHours();
  var dd = today.getDate();
  var mon = today.getMonth() + 1;
  var yy = (today.getFullYear().toString()).substr(2);
  if (dd < 10) { dd = '0' + dd }
  if (mon < 10) { mon = '0' + mon }
  if (hh < 10) { hh = '0' + hh }
  if (mm < 10) { mm = '0' + mm }
  if (ss < 10) { ss = '0' + ss }
  var randomId = yy + '' + mon + '' + dd + "-" + hh + '' + mm + '' + ss + "" + text;
  return randomId;
}


// remove duplicate value from array
removeDuplicates = function (data) {
  return data.filter((value,index)=> data.indexOf(value)===index);
}

// secret key for media 
secretIdMedia = function () {
  var text = "";
  var length = 4;
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  var randomId =text;
  return randomId;
}

// global func to generATE new worksheet random id
randSheetID = function () {
  var text = "";
  var length = 3;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  var randomId =text;
  return randomId;
}


// global func to generATE new worksheet random id
randUniqueSheetID = function (wbId,sheetIds) {
  var randomId;
  var length = 3;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  do {
    randomId="";
    for (var i = 0; i < length; i++) {
      randomId += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    randomId = wbId+'-'+randomId;
  }
  while(sheetIds.indexOf(randomId)>-1);  
  return randomId;
}


 getCurrentUTCDate = function () {
  let dt = new Date();
  let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let cdate = month[dt.getUTCMonth()] + " " + dt.getUTCDate() + " " + dt.getUTCFullYear() + " " + dt.getUTCHours() + ":" + dt.getUTCMinutes() + ":" + dt.getUTCSeconds() + " UTC"
  return cdate;
}

/*
Configuration
*/
app.configure(function () {
  app.set('port', process.env.PORT || 3030);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.methodOverride());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({ keepExtensions: true }));
  app.use(require('serve-static')(__dirname + '/public'));
  app.use(require('cookie-parser')());
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('body-parser').json());
  app.use(gateway); 
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.errorHandler());
  app.use(express.static(path.join(__dirname, 'views/page_temp/css')));
  app.use(express.static(path.join(__dirname, 'views/page_temp/js')));
});

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}




//=====================================================================Login (users)============================================================================
var login = require('./routes/login.js');
app.get('/', login.loginPage);

app.get('/privacydoc/:id',login.privacydoc);

app.get('/authorsignup/:id/:token', login.signupPage); 
app.post('/authorsignupByEmail',login.authorsignupByEmail) 
app.get('/authorforgot', login.forgotPage); 
app.get('/authorlogin', login.loginPage); 
app.get('/request', login.accReqForm); 
app.post('/author_login', login.Auth);
app.post('/author_checkEmail', login.checkEmail);  
app.post('/author_checkShortName', login.checkShortName);  
//sign up page
app.post('/authoruserregister', login.signup); 
app.post('/authorcheckallowemail', login.check_email_and_permission);
app.get('/authorcheckUsername/:username', login.find_username); 
app.get('/authoractiveAccount/:id/:token', login.activeaccountuser); 
app.post('/authorcheckEmailID', login.checkEmailID); 
//forget password 
app.post('/authorforgotrequest', login.forgot); 
app.post('/authoraccountrequest', login.accountRequest); 
app.get('/authorpasswordresttemp/:id/:token', login.password_reset_request); 
app.post('/authorpasswordreset', login.password_reset);  
app.get('/author_logout', login.logout);
app.get('/author_login', login.loginPage);
app.get('/author_profile', login.profilePage);
app.get('/author_signup', login.signupPage);
app.get('/author_forgot', login.forgotPage);
app.get('/author_author', login.loginPage);
app.post('/author_check_oauth', login.check_oauth);
app.post('/author_set_full_name', login.set_full_name);
app.post('/author_set_language', login.set_language);
app.post('/author_alterEmail', login.save_alterEmail);
app.post('/author_save_concept', login.save_concept);
app.post('/author_delete_concept', login.delete_concept);
app.post('/author_save_skill', login.save_skill);
app.post('/author_delete_skill', login.delete_skill);
app.post('/author_save_password', login.save_password);
app.post('/author_save_graders', login.save_graders);
app.post('/author_delete_graders', login.delete_graders);

//Function for sending mail from creates website
var emailservice = require('./routes/createsemailservice.js');
app.post('/creates_email_service', emailservice.createsemailservice);


//===================================================================== question ============================================================================
//Get Committed Data 
var committed = require('./routes/questionPreview');
app.get('/author_getCommitted', committed.getCommitted);
app.get('/author_getCommittedSampleQue', committed.getCommittedSampleQue);

//Edit Committed Data
var editcommit = require('./routes/questionAction');
app.post('/author_editCommitted', editcommit.editCommitted)

//Get Token for New Question 
var gettoken = require('./routes/questionAction');
app.post('/author_getToken', gettoken.getNewToken);

//Get New Token to copy working data
var gettokencopy = require('./routes/questionAction');
app.get('/author_getTokenCopy', gettokencopy.getCopyToken);

//Get Token for remove data
var getremovetoken = require('./routes/questionAction');
app.get('/author_getRemToken', getremovetoken.getRemToken);

var updQue = require('./routes/questionAction');


//Update Question
app.post('/author_updatedata', updQue.updateQuestion);

//Update Question
app.post('/author_updateInfoData', updQue.updateInfoData);

//get Author
var getauthor = require('./routes/questionPreview.js');
app.get('/author_getauthorid', getauthor.getAuthorId);

//Dashboard after login
var dashboard = require('./routes/dashboard.js');
app.get('/author_dashboard', dashboard.dashBoard);
app.get('/author_dashboard_prog', dashboard.dashBoard_prog);
app.get('/author_dashboard_comm', dashboard.dashBoard_comm);


//===================================================================== playlist ============================================================================

var playlist = require('./routes/playlist.js');
app.get('/author_playlist_dash', playlist.playlistDash);
app.post('/author_addPlaylist', playlist.addPlaylist); 
app.get('/author_getPlaylistData', playlist.getPlaylistData);
app.post('/author_updatePlaylist', playlist.updatePlaylist);
app.post('/author_updatePlaylistDesp', playlist.updatePlaylistDesp);
app.post('/author_deleteAndUpdateItems', playlist.deleteAndUpdateItem);
app.post('/author_arrAndUpdateItems', playlist.arrAndUpdateItems);
app.post('/author_removePlaylist', playlist.removePlaylist);
app.post('/author_addToPlaylist', playlist.addToPlaylist);
app.post('/author_addCollab', playlist.addCollab); ///playlistCollb
app.post('/author_delete_collab', playlist.deleteCollab);///playlistCollb
app.post('/author_check_allowed_email', playlist.check_allowed_email); //playlistCollb
app.post('/author_emptyPlaylist', playlist.emptyPlaylist);//empty playlist
app.post('/author_fetchFromBasket', playlist.fetchFromBasket);//empty playlist

// =====================================================================basket questions=====================================================================
var basketquestion = require('./routes/basketquestions');
app.post('/author_getBaseketQuestions', basketquestion.getBaseketQuestions);//counter
app.post('/author_addToBaseketQuestion', basketquestion.addToBaseketQuestion);//add to basket
app.get('/author_allbasketquestions', basketquestion.allBasketQuestions);//basket page
app.post('/author_removequestionfrombasket', basketquestion.removeQuestionFromBasket); //single question remove
app.post('/author_clearallbasketquestions',basketquestion.clearAllBasketQuestions);//clear all quesions
app.post('/author_addbaskettoplaylist',basketquestion.addBasketToPlayList);//basket to playlist and remove all from basket
app.post('/author_addBasketToPublicList',basketquestion.addBasketToPublicList);//add public list in meta db
app.post('/author_updateTagsComments',basketquestion.updateTagsComments);//update tags


//=====================================================================recent view questions=====================================================================
var recentView = require('./routes/recentView');
app.get('/author_getAllRecentViewQuestions', recentView.getAllRecentViewQuestions);//all recent view
app.get('/author_allrecentviewquestions', recentView.allRecentViewQuestions);//all recent view page
app.post('/author_addrecentviewquestion', recentView.addToRecenteViewQuestion);//add recent view

//=====================================================================Question Ticket Raised =====================================================================
var ticketRaise = require('./routes/ticketRaise.js');
app.post('/author_addTicket', ticketRaise.addTicket);
app.get('/author_questionTickets', ticketRaise.questionTickets);
app.post('/author_getTicketDetail',ticketRaise.getTicketDetail);
app.post('/author_replyToTicket',ticketRaise.replyToTicket);
app.post('/author_counterTickets',ticketRaise.counterTickets);
app.post('/author_isIssueTicket',ticketRaise.isIssueTicket);



// =====================================================================Media Upload=====================================================================
var upload = require('./routes/mediaUpload.js');
app.post('/author_media_upload', upload.mediaUploads);
app.post('/author_uploadmedia', upload.postMedia);
app.post('/author_updateMediaUpload', upload.updateMediaUpload); 
app.get('/author_edituploadmedia', upload.editMediaUpload); 
app.get('/author_mediaGallery', upload.mediaGallery);
app.get('/author_removeImage', upload.removeImage);

//=============graph Upload===================
var plotGraph = require('./routes/graphUpload.js');
app.post('/author_plot_new_graph', plotGraph.plotNewGraph);
app.post('/author_updategraph', plotGraph.updatePlotGraph);
app.post('/author_updateadvgraph', plotGraph.updateAdvPlotGraph);
app.post('/author_advanced_plot_graph', plotGraph.advancedPlot);
app.get('/author_editadvanceplot', plotGraph.editadvancePlot); 
app.get('/author_editplotgraph', plotGraph.editPlotGraph);
app.post('/author_plot_new_advChart', plotGraph.newAdvPlot);
app.get('/author_removechart', plotGraph.removeChart);

//=============ytvideo Upload===================// 
var ytvideo = require('./routes/ytvideo.js');
app.post('/author_new_ytvideo', ytvideo.newYtvideo);
app.post('/author_uploadytvideo', ytvideo.postYtvideo);
app.post('/author_updateYtvideo', ytvideo.updateYtvideo);
app.get('/author_edituploadvideo', ytvideo.editYtvideo);
app.get('/author_removevideo', ytvideo.removeVideo);


//=============pdf doc Upload===================
var pdfdoc = require('./routes/pdfDocument.js');
app.post('/author_new_pdfDoc', pdfdoc.newPdfDoc);
app.post('/author_uploadPdfDoc', pdfdoc.postPdfDoc);
app.post('/author_updatePdfDoc', pdfdoc.updatePdfDoc); 
app.get('/author_edituploadPdfDoc', pdfdoc.editPdfDoc); 
app.get('/author_removepdfDoc', pdfdoc.removepdfDoc);

// =====================================================================Quiz routes=====================================================================
var quiz = require('./routes/quiz.js');
app.get('/author_create_quiz', quiz.quiz);
app.post('/author_createNewSectionQuiz', quiz.createSectionQuiz);
app.post('/author_getSectionsList', quiz.getSectionsList);
app.post('/author_playlistAuthCheck', quiz.playlistAuthCheck);
app.post('/author_createNewLiveQuiz', quiz.createLiveQuiz);
app.post('/author_getquizTakerList', quiz.getquizTakerList);


//=============verify Quiz===============
var postquiz = require('./routes/quizNew');
app.post('/author_verifyNewSecQuiz', postquiz.verifyNewSecQuiz);//verify section quiz

//============Create Quiz===================
var createquiz = require('./routes/quizNew');
app.post('/author_createSectionquiz', createquiz.createSecQuizConfirm);//create section quiz


//=============quiz control board ===================
var quiz_control = require('./routes/quizControl');
app.post('/author_getQuizControlData', quiz_control.getQuizControlData);
app.post('/author_editQuizControlBoard', quiz_control.editQuizControlBoard);
app.post('/author_updateQuizControlBoard', quiz_control.updateQuizControlBoard);
app.post('/author_updateSecQuizControlBoard', quiz_control.updateSecQuizControlBoard);

app.post('/author_quizItemsToInherit', quiz_control.quizItemsToInherit);
app.post('/author_createNewQuizTemplate', quiz_control.createNewQuizTemplate);
app.post('/author_getTakersData', quiz_control.getTakersData);
app.get('/author_getTakersData1', quiz_control.getTakersData1); 
app.post('/author_getLiveQuizManagePage', quiz_control.getLiveQuizManagePage);//live quiz manage page
app.post('/author_getLiveQuizData', quiz_control.getLiveQuizData);//live quiz data
app.post('/author_liveQuizAddToQuea', quiz_control.liveQuizAddToQuea); //live quiz add to queue
app.post('/author_liveQuizRemoveFromQuea',quiz_control.liveQuizRemoveFromQuea);//remove from queue
app.post('/author_liveQuizPlayedItem' , quiz_control.liveQuizPlayedItem);
app.post('/author_createNewLiveQuizTemplate', quiz_control.createNewLiveQuizTemplate);
app.post('/author_finalizeLiveQuiz', quiz_control.finalizeLiveQuiz);
app.post('/author_liveQuizSaveYoutubeId',quiz_control.liveQuizSaveYoutubeId);
app.post('/author_showWhiteboard',quiz_control.showWhiteboard);


app.post('/author_changePwdAndResetQuiz', quiz_control.changePwdAndResetQuiz);

app.post('/author_getUserLogs',quiz_control.getUserLogs);
app.post('/author_allQuizLogs',quiz_control.allQuizLogs);
app.post('/author_resetLoginCounter', quiz_control.resetLoginCounter);

app.post('/author_commitQuizChanges', quiz_control.commitQuizChanges);
app.post('/author_toggle_quiz_status', quiz_control.toggleQuizStatus);
app.get('/author_delQuiz', quiz_control.delQuiz);
app.get('/author_downloadPwd', quiz_control.downloadPwdList);
app.get('/author_summaryCSV', quiz_control.summaryCSV);
app.post('/author_quizResponse', quiz_control.quizResponse); 
app.post('/author_dwnLoginCredential', quiz_control.dwnLoginCredential);
app.get('/author_quizLogCSV', quiz_control.quizLogCSV);
app.post('/author_quizStdSubmitData',quiz_control.quizStdSubmitData);


//==========================================================public list ====================================================================
var publist = require('./routes/pubList.js');
app.get('/author_pubList_dash', publist.getPubListDash);
app.post('/author_getSubCategory', publist.getSubCategory);
app.post('/author_getPubListSub', publist.getPubListSub);
app.post('/author_addToPubList', publist.addToPubList);
app.get('/author_getpubListQuestion', publist.getpubListQuestion);
app.post('/author_addQuesToPlaylist', publist.addQuesToPlaylist);
app.post('/author_delete_pubList', publist.delete_pubList);
app.post('/author_addBasketItmToPublicList',publist.addBasketItmToPublicList);

app.post('/author_updateFillData', updQue.updateFillData);

//================Creation Question arrange================ 
var questionEdit = require('./routes/questionAction.js');
app.post('/author_postArrg', questionEdit.checkQuestion);
app.post('/author_postFillIn', questionEdit.checkQuestion);
app.post('/author_postdata', questionEdit.checkQuestion);
app.post('/author_postInfo', questionEdit.checkQuestion);

app.post('/author_updateArrgData', updQue.updateArrg);


app.post('/author_updateSubData', updQue.dateSubData);
app.post('/author_postSub', questionEdit.checkQuestion); 
// =================================== workbook ========================================== 
var workbook = require('./routes/workbook.js');
app.get('/author_workbook_dash', workbook.wbDashboard);
app.post('/author_addNewWorkbook', workbook.addNewWorkbook);
app.get('/author_getWorkbookPage', workbook.getWorkbookPage);
app.post('/author_getWorkbookData', workbook.getWorkbookData);//get workbook data 
app.post('/author_updateWorkbookData', workbook.updateWorkbookData);
app.post('/author_deleteWorkbookData', workbook.deleteWorkbookData);
app.post('/author_saveLogoWB', workbook.saveLogoWB);
app.post('/author_betaVersionWorkbookData', workbook.betaVersionWorkbookData);
app.get('/author_getWorkSheets', workbook.getWorkSheets);
app.post('/author_getWorkSheetsData', workbook.getWorkSheetsData);//get worksheet data 
app.post('/author_addNewWorksheet', workbook.addNewWorksheet);
app.post('/author_updateSheetData', workbook.updateSheetData);
app.post('/author_getAllBasketQues', workbook.getAllBasketQues);
app.post('/author_updateWsOrder', workbook.updateWsOrder);
app.post('/author_checkWorksheetName', workbook.sheetNameExist);
app.post('/author_getSheetData', workbook.getSheetData);
app.post('/author_getWorksheetPlaylistQuest',workbook.getWorksheetPlaylistQuest);
app.get('/author_getWorkbookVersionManagePage', workbook.getWorkbookVersionManagePage);
app.post('/author_getWorkbookVersionManageData', workbook.getWorkbookVersionManageData);//get worksheet version manage data 
app.post('/author_updateVersionDetails',workbook.updateVersionDetails);
app.post('/author_deleteWbBetaVersion',workbook.deleteWbBetaVersion);
app.post('/author_publishVersionWorkbookData', workbook.publishVersionWorkbookData);

//new   
app.get('/author_getBetaFeedbackPage', workbook.getBetaFeedbackPage);
app.post('/author_getBetaFeedbackData', workbook.getBetaFeedbackData);//get beta feedback data
app.post('/author_getWbReviewDetails', workbook.getWbReviewDetails);




var emailService = require('./routes/emailServer')
app.post('/author_email/:emailtype',emailService.reqHandlerAuthor);
app.post('/authorEmail/:emailtype',emailService.reqHandler);



//admin routes
let adminCtrl = require('./routes/admin.js');
app.get('/author_adminDash',adminCtrl.getAdminDash);
app.get('/author_adminAuthorList',adminCtrl.getAuthorList);
app.post('/author_adminChangeAccStatus',adminCtrl.adminChangeAccStatus);
app.post('/author_adminChangePermissions',adminCtrl.adminChangePermissions);
app.post('/author_adminEditAuthorNote',adminCtrl.adminEditAuthorNote);
app.post('/author_adminFetchAuthorList',adminCtrl.adminFetchAuthorList);

//admin wb routes
app.get('/author_adminWbList',adminCtrl.adminWbList);
app.post('/author_adminFetchWbPublishList',adminCtrl.adminFetchWbPublishList);
app.post('/author_adminAddAsBetauser',adminCtrl.adminAddAsBetauser);
app.post('/author_adminRemoveAsBetauser',adminCtrl.adminRemoveAsBetauser);
app.post('/author_adminAcceptPublishReq',adminCtrl.adminAcceptPublishReq);
app.post('/author_adminRejectPublishReq',adminCtrl.adminRejectPublishReq);
app.post('/author_adminBlockPublishReq',adminCtrl.adminBlockPublishReq);
app.post('/author_adminUnblockPublishReq',adminCtrl.adminUnblockPublishReq);
app.post('/author_adminWbRequestDetails',adminCtrl.adminWbRequestDetails);

//admin analylics 
let adminAny = require('./routes/adminAnalytics.js');
app.get('/author_adminAnalyticsPage',adminAny.adminAnalyticsPage);
app.post('/author_adminAnalyticsData',adminAny.adminAnalyticsData);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      status:err.status
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    status:err.status
  });
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port') + " ,Time:"+getCurrentUTCDate() );
});