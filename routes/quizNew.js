var staticObj = require('../config.js').merge_output;
var httpservreq = require('../httpseverreq.js');
var couchdb = require('nano')(staticObj.couchdb);
var req_db = couchdb.use(staticObj.db_request);
var users = couchdb.use(staticObj.db_authors);
var req_url = staticObj.req_url;

var request = require("request");
var graphics_url = staticObj.graphics_url;
var chart_url = staticObj.chart_url;
var ytvideo_url = staticObj.ytvideo_url;
var plotIframeLink =  staticObj.plotIframeLink;

// to create a new quiz, when clicking on create button
//simple quiz not in use from 19/09/2019
exports.createQuizConfirm = function (req, res) {
  var commit_data = JSON.parse(req.body.commdata);
 
  var type = req.body.type;
  var author = req.body.username;
  var log_Id = req.body.log_Id;
  var log_Token = req.body.log_Token;
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  var randomId = randID();
  //============== from http server request =============================
  httpservreq.httpReq(randomId, type, commit_data, author, function (err, body) {
    if (!err && body.success) {
      var timer = setTimeout(function () {
        res.render('quiz/viewCommNewQuiz', { all_data: body.result, userMeta: userMeta, short: author, copyright: globaldata });
      }, 5000); //10000
      req.once('timeout', function () {
        clearTimeout(timer);
      });
    } else {
      res.redirect('/author_create_quiz?status=serverror');
      generateLogs("error", author + " commited new quiz. Error =" + JSON.stringify(err));
      // console.log(err);
    }
  });
  //============== from http server request ends=============================
};




exports.createQuiz = function (req, res) {
  var type = req.body.type;
  var data = JSON.parse(req.body.data);
  var author = req.body.authorname;
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  var log_Token = req.body.log_Token;
  var log_id = req.body.log_Id;
  var randomId = randID();

  httpservreq.httpReq(randomId, type, data, author, function (err, body) {
    if (!err) {
      // console.log(JSON.stringify(body));
      // console.log(body.result);
      var timer = setTimeout(function () {
        res.render('quiz/verifyNewQuiz', { result: body.result,success:body.success, userMeta: userMeta,short: author, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
      }, 2000); //5000
      req.once('timeout', function () {
        clearTimeout(timer);
      });
      generateLogs("info", author + " gave info to create new quiz");
    } else {
      // generateLogs("info", author + "Verify new quiz error"+err.message);
      // console.log(JSON.stringify(body));
      res.render('error_ajax', { error:err.message, status:500, message:'Internal server error !!' });
      // res.redirect('/author_create_quiz?status=serverror');
    }
  });
};


//verify new section quiz , when clicking 'verify' button at the end of the wizard 
exports.verifyNewSecQuiz = function (req, res) {
  var type = req.body.type;
  var data = JSON.parse(req.body.data);
  var author = req.body.authorname;
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  var randomId = randID();

  httpservreq.httpReq(randomId, type, data, author, function (err, body) {
    if (!err) {
      // console.log(body.result);
      var timer = setTimeout(function () {
        res.render('quiz/section_quiz/verifyNewSecQuiz', { result: body.result,success:body.success, userMeta: userMeta, short: author, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url,plotIframeLink:plotIframeLink });
      }, 2000); //5000
      req.once('timeout', function () {
        clearTimeout(timer);
      });
      generateLogs("info", author + " gave info to create new quiz");
    } else {
      // generateLogs("info", author + "Verify new quiz error"+err.message);
      // console.log(JSON.stringify(body));
      res.render('error_ajax', { error:err.message, status:500, message:'Internal server error !!' });
      // res.redirect('/author_create_quiz?status=serverror');
    }
  });
};

// to create a new sectioned quiz, when clicking on create button
exports.createSecQuizConfirm = function (req, res) {
  var commit_data = JSON.parse(req.body.commdata);
 
  var type = req.body.type;
  var author = req.body.username;
  // var fullName = req.headers.x_myapp_fullName;
  // var wbAccess = req.headers.x_myapp_wbAccess;
  var userMeta = req.userMeta;
  var randomId = randID();
  //============== from http server request =============================
  httpservreq.httpReq(randomId, type, commit_data, author, function (err, body) {
    if (!err && body.success) {
      var timer = setTimeout(function () {
        res.render('quiz/viewCommNewQuiz', { all_data: body.result, userMeta: userMeta,short: author, copyright: globaldata });
      }, 5000); //10000
      req.once('timeout', function () {
        clearTimeout(timer);
      });
    } else {
      res.redirect('/author_create_quiz?status=serverror');
      generateLogs("error", author + " commited new quiz. Error =" + JSON.stringify(err));
      // console.log(err);
    }
  });
  //============== from http server request ends=============================
};