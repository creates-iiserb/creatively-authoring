var fs = require('fs');
var path = require('path');
var mergeJSON = require("merge-json");
var staticObj = require('../config.js').merge_output;
var httpservreq = require('../httpseverreq.js');
var couchdb = require('nano')(staticObj.couchdb);
var playlist_db = couchdb.use(staticObj.db_playlist);
var db_examineer_metadata = couchdb.use(staticObj.db_examineer_metadata);
var db_examineer_exam = couchdb.use(staticObj.db_examineer_exam);
var db_examineer_res = couchdb.use(staticObj.db_examineer_response);
var req_db = couchdb.use(staticObj.db_request);
var users = couchdb.use(staticObj.db_authors);
var res_db = couchdb.use(staticObj.db_response);
var req_url = staticObj.req_url;
var request = require("request");
var quiz_url = staticObj.quiz_url;
var graphics_url = staticObj.graphics_url;
var chart_url = staticObj.chart_url;
var ytvideo_url = staticObj.ytvideo_url;
var plotIframeLink = staticObj.plotIframeLink;

let generateToken = () => {
    var text = "";
    var length = 125;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$%*-";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

//redirect to quiz control board page
exports.getQuizControlData = function (req, res) {
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var id = req.body.quizid;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    db_examineer_metadata.get(id, { revs_info: true }, function (err, body) {
        if (err) {
            alldoc += err.message + " : " + id + ", Please Contact Administrator !!";
            res.redirect('/author_create_quiz');

        } else {
            for (i = 0; i < body.tags.length; i++) {
                var tags = [];
                var array_string = '';
                for (v = 0; v < body.tags.length; v++) {
                    var array_string = ' ' + body.tags[v];
                    tags.push(array_string);
                }
                body.tags = tags;
            }

            var isSection = false;
            if (body.sections) {
                if (body.sections[0].hasOwnProperty('displayInstruction'))
                    isSection = true;
            }

            // console.log(isSection);

            if (body.author == req.headers.x_myapp_whoami) {
                res.render('quiz/quiz_control_board', { data: body, token: id, author: author, short: short, userMeta: userMeta, tooltip: tooltip, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url, plotIframeLink: plotIframeLink, isSection: isSection });
            } else {
                generateLogs("error", author + "  is not authorized to view quiz board  with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "", studentUrl: staticObj.studentUrl, docUrl: staticObj.docUrl, copyright: globaldata, userMeta: userMeta }); return;
            }
        }
    });
};

//redirect to edit quiz control page
exports.editQuizControlBoard = function (req, res) {
    var author = req.body.author;
    var short = req.body.author;
    // var fullName = req.headers.x_myapp_fullName;
    //var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var id = req.body.quiz_id;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    db_examineer_metadata.get(id, { revs_info: true }, function (err, body) {
        // console.log(err);
        if (err) {
            alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
            res.redirect('/author_create_quiz');
        } else {
            if (body.author == req.headers.x_myapp_whoami) {

                var quizTy = 'plain';
                var isSection = false;
                if (body.sections) {
                    if (body.sections[0].hasOwnProperty('displayInstruction')) {
                        isSection = true;
                        quizTy = 'sectioned';
                    }

                }


                if (body.quizType) {
                    if (body.quizType == 'sectioned') {
                        isSection = true;
                        quizTy = 'sectioned';
                    } else
                        if (body.quizType == 'live') {
                            quizTy = 'live';
                        }
                }

                if (!body.calculator) {
                    body.calculator = 'none';
                }

                if (isSection) {
                    // sectional quiz -- 
                    res.render('quiz/quizSecEdit', { data: body, token: id, author: author, short: short, userMeta: userMeta, tooltip: tooltip, copyright: globaldata, isSection: isSection, quizTy: quizTy });
                } else {
                    // plain quiz --
                    res.render('quiz/quizEdit', { data: body, token: id, author: author, short: short, userMeta: userMeta, tooltip: tooltip, copyright: globaldata, isSection: isSection, quizTy: quizTy });
                }

            } else {
                generateLogs("error", author + "  is not authorized to view edit quiz board  with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "", studentUrl: staticObj.studentUrl, docUrl: staticObj.docUrl, copyright: globaldata, userMeta: userMeta }); return;
            }
        }
    });
};

//to verify edit quiz 
exports.updateQuizControlBoard = function (req, res) {
    var type = req.body.type;
    var data = JSON.parse(req.body.data);
    
    var userMeta = req.userMeta;
    var author = req.body.author;
    var short = req.body.author;
    var quizid = req.body.quiz_id;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var all_data = "";
    var randomId = randID();

    //============== from http server request =============================
    httpservreq.httpReq(randomId, type, data, short, function (err, body) {
        if (!err && body.success) {
            var timer = setTimeout(function () {
                res.render('quiz/verifyEditQuiz', { all_data: body.result, quizid: quizid, userMeta: userMeta, short: short, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url, plotIframeLink: plotIframeLink });
            }, 1000);
            req.once('timeout', function () {
                clearTimeout(timer);
            });
        } else {
            res.redirect('/author_create_quiz?status=serverror');
        }
    });
    //============== from http server request ends=============================
};


//to verify edit sectional quiz 
exports.updateSecQuizControlBoard = function (req, res) {
    var type = req.body.type;
    // console.log(req.body.data)
    var data = JSON.parse(req.body.data);
    
    var userMeta = req.userMeta;
    var author = req.body.author;
    var short = req.body.author;
    var quizid = req.body.quiz_id;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var all_data = "";
    var randomId = randID();

    //request pending at server side --
    //============== from http server request =============================
    httpservreq.httpReq(randomId, type, data, short, function (err, body) {
        if (!err && body.success) {
            var timer = setTimeout(function () {
                
                res.render('quiz/verifyEditSecQuiz', { all_data: body.result, quizid: quizid, userMeta: userMeta, short: short, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url, plotIframeLink: plotIframeLink });
            }, 1000);
            req.once('timeout', function () {
                clearTimeout(timer);
            });
        } else {
            res.redirect('/author_create_quiz?status=serverror');
        }
    });
    // ============== from http server request ends=============================
};

//redirect to quiz inherit page
exports.quizItemsToInherit = function (req, res) {
    var author = req.body.author;
    var short = req.body.author;
    var id = req.body.quiz_id;
   
    var userMeta = req.userMeta;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    db_examineer_metadata.get(id, { revs_info: true }, function (err, body) {
        if (err) {
            alldoc += err.message + " : " + req.param("id") + ", Please Contact Administrator !!";
            res.redirect('/author_create_quiz');
        } else {
            for (i = 0; i < body.tags.length; i++) {
                var tags = [];
                var array_string = '';
                for (v = 0; v < body.tags.length; v++) {
                    var array_string = ' ' + body.tags[v];
                    tags.push(array_string);
                }
                body.tags = tags;
            }

            var isSection = false;
            let quizType = '';
            if (body.hasOwnProperty('quizType')) {
                quizType = body.quizType;
            } else {
                if (body.sections) {
                    if (body.sections[0].hasOwnProperty('displayInstruction')) {
                        quizType = 'sectioned';
                    }
                }
            }

            if (quizType === 'sectioned') {
                isSection = true;
            }

            if (!body.calculator) {
                body.calculator = 'none';
            }


            if (body.author == req.headers.x_myapp_whoami) {
                if (quizType == 'live') {
                    res.render('quiz/liveQuiz/liveQuizItemsToInherit', { data: body, token: id, author: author, short: short, userMeta: userMeta, tooltip: tooltip, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url, plotIframeLink: plotIframeLink });
                } else {
                    res.render('quiz/quizItemsToInherit', { data: body, token: id, author: author, short: short, userMeta: userMeta, tooltip: tooltip, copyright: globaldata, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url, plotIframeLink: plotIframeLink, isSection: isSection });
                }

            } else {
                generateLogs("error", author + "  is not authorized to inherit quiz id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "", studentUrl: staticObj.studentUrl, docUrl: staticObj.docUrl, copyright: globaldata, userMeta: userMeta }); return;
            }
        }
    });
};



let getPlaylistData = async (playlistName,sectionName) =>{
    let dbData = await  playlist_db.view("playlistView","playlistNametoSection",{key:playlistName})
    
    if(dbData.rows.length>0){
        if(dbData.rows[0]['value']['sections']){
            let sectnArry=[];
            let sectnName = dbData.rows[0]['value']['sections'].map(itm1=>{
            return itm1["secName"]
            })
           
            let findSect = dbData.rows[0]['value']['sections'].find(itm=>{return itm["secName"]==sectionName})
            
            let plItm = [];
            if(findSect)
                findSect["content"].map(itm=>{plItm.push(itm["item"])});
                
                var ajson ={};
                ajson["items"]=plItm;
                ajson["sectnList"]=sectnName;
            
        }else{
            let sectnArry=[];
            let sectnName = ["Unsectioned List"]
            
            let findSect = dbData.rows[0]['value']['content']
            //console.log(findSect)
            let plItm = [];
            if(findSect)
                findSect.map(itm=>{plItm.push(itm["item"])});
                // console.log(plItm)
                var ajson ={};
                ajson["items"]=plItm;
                ajson["sectnList"]=sectnName;
        }
    }else{
        var ajson ={};
        ajson["items"]=[];
        ajson["sectnList"]=[];
    }
     
    return ajson 
}





//redirecr to  create new quiz page from template
exports.createNewQuizTemplate = function (req, res) {
    var username = req.body.author;
    var quiz_id = req.body.quiz_id;
    
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    var items = req.body.items;
    var playlistdata = new Array();
    var examineerData = new Array();
    var items_ary = new Array();
    items_ary = items.split(",");

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    playlist_db.view("playlistView", "getPlaylistData", { key: username }, function (err, body3) {
        if (!err) {
            body3.rows.forEach(function (doc) {
                playlistdata.push(doc.value);
            });
        }
        var zone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];

        var collb1 = new Array();
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        playlist_db.view("playlistView", "getPlaylistCollb1Data", { key: authorEmail }, function (err, body1) {
            // console.log(err);   
            if (!err) {
                body1.rows.forEach(function (doc) {
                    collb1.push(doc.value);
                });
                
                var collb2 = new Array();
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                playlist_db.view("playlistView", "getPlaylistCollb2Data", { key: authorEmail }, function (err, body2) {
                    // console.log(err);   
                    if (!err) {
                        body2.rows.forEach(function (doc) {
                            collb2.push(doc.value);
                        });
                       
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        db_examineer_metadata.get(quiz_id, { revs_info: true }, async function (err, body) {
                            if (err) {
                                alldoc += err.message + " : " + req.param("quiz_id") + ", Please Contact Administrator !!";
                                res.redirect('/author_create_quiz');
                            }
                            else {

                                var isSection = false;
                                if (body.sections) {
                                    if (body.sections[0].hasOwnProperty('displayInstruction'))
                                        isSection = true;
                                }

                                if (!body.calculator) {
                                    body.calculator = 'none';
                                }

                                if (body.author == req.headers.x_myapp_whoami) {

                                    if (isSection) {

                                        for (let index = 0; index < body.sections.length; index++) {
                                            // const element = array[index];
                                            let updItems = await  getPlaylistData(body.sections[index].playlist,body.sections[index].sectionName)
                                           
                                            body.sections[index].pool = updItems.items;
                                            body.sections[index].choose=   updItems.items.length;         
                                            if(updItems.items.length==0){
                                                body.sections[index].sectionName= '';
                                                body.sections[index].playlist= '';
                                            }
                                                                            
                                        }
                                        
                                        users.view("ByShortName", "authorToAllEmails", { key: username }, function (err, body2) {
                                            if (!err) {
                                                var quizEmail = removeDuplicates(body2.rows[0].value);
                                                
                                                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                                db_examineer_metadata.view("ByAuthor", "essentials", { key: username }, function (err, doc) {
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
                                                        res.render('quiz/new_secquiz_template', { quizList: exam_data,data: body, playlistdata: playlistdata, collb1: collb1, collb2: collb2, user: username, userMeta: userMeta, short: username, zone: zone, items: items_ary, tooltip: tooltip, copyright: globaldata, isSection: isSection, quizEmail: quizEmail, quizLang: quizLang });

                                                } else {
                                                        res.redirect('/author_dashboard?msg=dberror');
                                                    }
                                                })


                                            } else {
                                                res.redirect("/author_create_quiz?msg=apierror");
                                            }

                                        });
                                    } else {
                                        }

                                } else {
                                    generateLogs("error", author + "  is not authorized to  crete new quiz with template  with quiz id =  " + id);
                                    res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "", studentUrl: staticObj.studentUrl, docUrl: staticObj.docUrl, copyright: globaldata, userMeta: userMeta }); return;
                                }
                            }
                        })

                    } else {
                        generateLogs("error", username + "  error from get playlist collaborator 2 content  ");
                        
                    }
                })
            } else {
                generateLogs("error", username + "  error from get playlist collaborator 1 content  ");
                
            }
        })
    });
};

exports.createNewLiveQuizTemplate = async function (req, res) {

    var username = req.body.author;
    var quiz_id = req.body.quiz_id;
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var authorEmail = req.headers.x_myapp_email;
    let author = req.body.author;
    var items = req.body.items;
    var playlistdata = new Array();
    var items_ary = new Array();

    items_ary = items.split(",");

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
        let playlistRes = await playlist_db.view("playlistView", "getPlaylistData", { key: username });
        playlistRes.rows.forEach(function (doc) {
            playlistdata.push(doc.value);
        });

        var zone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];

        var collb1 = new Array();
        let coll1Res = await playlist_db.view("playlistView", "getPlaylistCollb1Data", { key: authorEmail });
        coll1Res.rows.forEach(function (doc) {
            collb1.push(doc.value);
        });

        var collb2 = new Array();
        let coll2Res = await playlist_db.view("playlistView", "getPlaylistCollb2Data", { key: authorEmail });

        coll2Res.rows.forEach(function (doc) {
            collb2.push(doc.value);
        });

        let body = await db_examineer_metadata.get(quiz_id, { revs_info: true });



        if (!body.calculator) {
            body.calculator = 'none';
        }



        if (body.author == req.headers.x_myapp_whoami) {


           
                for (let index = 0; index < body.sections.length; index++) {
                    // const element = array[index];
                    let updItems = await  getPlaylistData(body.sections[index].playlist,body.sections[index].sectionName)
                    console.log(updItems)

                    body.sections[index].pool = updItems.items;
                    body.sections[index].choose=   updItems.items.length;      
                    if(updItems.items.length==0){
                        body.sections[index].sectionName= '';
                        body.sections[index].playlist= '';
                    }
                                                    
                } 
           

            let body2 = await users.view("ByShortName", "authorToAllEmails", { key: username });
            var quizEmail = removeDuplicates(body2.rows[0].value);

            let quizListEx = await db_examineer_metadata.view("ByAuthor", "essentials", { key: username });

            var exam_data=[]
            quizListEx.rows.forEach(function (data) {
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

            res.render('quiz/liveQuiz/new_livequiz_template', { quizList: exam_data,data: body, playlistdata: playlistdata, collb1: collb1, collb2: collb2, user: username, userMeta: userMeta, short: username, zone: zone, items: items_ary, tooltip: tooltip, copyright: globaldata, quizEmail:quizEmail , quizLang: quizLang });
        } else {
            generateLogs("error", author + "  is not authorized to  crete new quiz with template  with quiz id =  " + quiz_id);
            res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "", studentUrl: staticObj.studentUrl, docUrl: staticObj.docUrl, copyright: globaldata, userMeta: userMeta }); return;
        }


    } catch (error) {
        console.log(error);
        generateLogs("error", username + "  error from get playlist collaborator 1 content  ");
    }

}


//redirect to manage quiz page --new in angularjs --
exports.getTakersData = async function (req, res) {

    try{
        var author = req.body.author;
        var userMeta = req.userMeta;
        var short = req.body.author;
        var quizid = req.body.quiz_id;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let bodyExamMeta =  await db_examineer_metadata.get(quizid, { revs_info: true });
        if (bodyExamMeta.author == req.headers.x_myapp_whoami) {
            var isSection = false;
            let secWiseWht = [];
            if (bodyExamMeta.sections) {
                bodyExamMeta.sections.forEach(s=>{
                    if(s.hasOwnProperty('displayInstruction')){
                        //old compatibility
                        isSection = true;
                    }
                    secWiseWht.push(s.gradingMatrix[0][0]);
                });
            }else{
                //old compatibility
                secWiseWht.push(bodyExamMeta.gradingMatrix[0][0]);
            }
            var credentials = bodyExamMeta.credentials;
            var userNames = Object.keys(credentials);
            var userData = new Array();
            let bodyExam = await db_examineer_exam.view("ByQuizId", "quizIdToAttemptedMeta", { key: quizid });

            if (bodyExam.rows.length == 0) {
                generateLogs("error", " quiz with " + quizid + " of " + author + " not generated successfully(in examineer_exam)");

                res.redirect('/author_create_quiz?status=examdberror');
            } else {
                
                let lastSaveData = [];
                let lastSaveBody = await db_examineer_res.view('responseView', 'quizIdToLastSaved', { key: quizid }); 
                if(lastSaveBody.rows.length>0){
                    lastSaveData = lastSaveBody.rows.map(x =>x.value);
                }
                

                var examData = bodyExam.rows;
                userNames.forEach((user) => {
                    let lastSaveIndex = lastSaveData.findIndex(std => std.userId == user);
                    var groupedExam = examData.filter(function (row) {
                        return row.value.userid == user;
                    });
                    if (groupedExam.length > 0) {
                        var startedOn = [];
                        var startedOnUtc = [];
                        var submitted = false;
                        var submittedOn = null;
                        var totalScore = 0;
                        var totalMaxScore = 0;
                        var date = new Date(1970, 0, 1);
                        var allSec = 0;
                        var isSummGen = false;
                        groupedExam.forEach( (doc,secIndex) => {
                            let partialGrading = false;
                            if( 'partialGrading' in  bodyExamMeta.sections[secIndex]){
                                partialGrading = bodyExamMeta.sections[secIndex].partialGrading;
                            }
                            var value = doc.value;
                            //started on
                            if (value.startedOn){
                                startedOn.push(new Date(value.startedOn));
                                startedOnUtc.push(value.startedOn);
                            }

                            // submitted on
                            if (value.submittedOn){ 
                                submittedOn = value.submittedOn;
                                submitted = true;
                                if('time' in value){
                                    isSummGen = true;
                                    var score = isNaN(value.score) ? 0 : value.score;
                                    var max = isNaN(value.max) ? 0 : value.max;
                                    /////////
                                    if(partialGrading){
                                        if('partialScores' in value){
                                            totalScore = totalScore + (+score) + value.partialScores;
                                        }else{
                                            totalScore = totalScore + (+score);
                                        }
                                    }else{
                                        totalScore = totalScore + (+score);
                                    }
                                    ////////
                                    totalMaxScore = totalMaxScore + (+max);
                                    var dArr = value.time.split(":");
                                    allSec = allSec + (+dArr[0]) * 60 * 60 + (+dArr[1]) * 60 + (+dArr[2]);

                                }
                                
                                
                            }

                        });

                        var obj = {};
                        obj.userid = user;
                        obj.userInfo = bodyExamMeta.users.userData[user];
                       
                        obj.userFields = 0;
                        if(obj.userInfo){
                            obj.userFields = Object.keys(obj.userInfo).length;
                        }

                        obj.status = 'Not started';
                       
                        obj.logStatus = 0;
                        
                         // started on get minimum started on
                        if (startedOn.length > 0){
                            obj.status = 'not submitted';
                            var minDate = new Date(Math.min.apply(null, startedOn));
                            var idx = startedOn.map(Number).indexOf(+minDate);
                            obj.startedOn = startedOnUtc[idx];
                            obj.startedOnTS = new Date(obj.startedOn).getTime(); // started on timestamp
                        }
                        
                        obj.stdScore = 0;
                        obj.score = '';
                        //submitted on
                        if (submitted){
                            obj.status = 'submitted';
                            obj.submittedOn = submittedOn;
                            obj.submittedOnTS = new Date(obj.submittedOn).getTime(); // submitted on timestamp
                            if(isSummGen){
                                date.setSeconds(allSec);
                                obj.timeTaken = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                                obj.timeTakenTS = date.getTime();
                                obj.score = totalScore + ' out of ' + totalMaxScore;
                                obj.stdScore = totalScore;
                            }
                        }

                        obj.password = credentials[user];
                        obj.passwordOld = credentials[user];
                        obj.reset = false;
                        obj.passChange = false;
                        obj.lastLog = 0;
                        obj.show = 0;
                        obj.logs = [];
                       

                        ///////
                        obj.progress = 0;
                        obj.weightage = 0;
                        if(!('timeTaken' in obj)){
                            obj.timeTaken = '00:00:00';
                            obj.timeTakenTS = 0;
                        }

                        let date1 = new Date(1970, 0, 1);
                        if(lastSaveIndex > -1){
                            
                            //start
                            obj.stdSecSummary = [];
                            
                            let secProgress = lastSaveData[lastSaveIndex].secProgress;
                            let percent = 0;
                            let weightage = 0;
                            obj.totalWt = 0;
                            obj.weightage = 0;
                            let wi=0;
                            for(const section in secProgress){
                                percent += (secProgress[section].locked/secProgress[section].gradable);
                                weightage += (secProgress[section].locked*secWiseWht[wi]);
                                obj.stdSecSummary.push(secProgress[section]);
                                obj.totalWt += secProgress[section].gradable*secWiseWht[wi];
                                wi++;
                            }
 
                            obj.totalGQuest = lastSaveData[lastSaveIndex].totalGQs;
                            if(!isNaN(percent) && obj.stdSecSummary.length>0){
                                obj.progress = Math.round(percent*100/obj.stdSecSummary.length);
                                obj.weightage = Math.round(weightage*100/obj.totalWt);
                            }
                            
                            date1.setSeconds(lastSaveData[lastSaveIndex].timeTaken);
                            obj.timeTakenTS = date1.getTime();
                            obj.timeTaken = date1.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                            //end
                            
                            if('lastSaveAt' in lastSaveData[lastSaveIndex]){
                                obj.lastSaveAt = lastSaveData[lastSaveIndex].lastSaveAt;
                            }
                        }

                        userData.push(obj);
                        ///////////////
                    }
                });
                       
                var data = {
                    quizData: bodyExamMeta,
                    userData: userData,
                    secWiseWht:secWiseWht,
                    socketUrl: staticObj.socketUrl
                }
                res.render('quiz/quizManageNew', { data: data, userMeta: userMeta,
                    token: quizid, author: author, short: short, tooltip: tooltip,
                    copyright: globaldata,isSection: isSection });
            }

        } else {
            generateLogs("error", author + "  is not authorized to view quiz takers details for quiz id =  " + quizid);
            res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "", studentUrl: staticObj.studentUrl, docUrl: staticObj.docUrl, copyright: globaldata, userMeta: userMeta }); return;
        }

    }catch(err){
        console.log(err);
        const msg = "Something went wrong. Please contact administrator";
        res.redirect(`/author_create_quiz?msg=${msg}`);
    } 

};


exports.resetLoginCounter = async function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;  
    // var wbAccess = req.headers.x_myapp_wbAccess; 
    var userMeta = req.userMeta;
    var quizid = req.body.quiz_id;
    var userid = req.body.user_id;
    var author = req.body.author;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
        let bodyExamMeta = await db_examineer_metadata.get(quizid, { revs_info: true });

        if (bodyExamMeta.author == req.headers.x_myapp_whoami) {
            let exresBody = await db_examineer_res.view('forTokenDoc', 'quizIdUserIdToDoc', {
                'key': userid,
                'include_docs': true
            });

            if (exresBody.rows.length > 0) {
                let resDoc = exresBody.rows[0].value;
                //console.log(resDoc);
                if (resDoc.failedLogin < 10) {
                    return res.json({ status: "error", msg: "Student is not reached the maximum limit of login failed!!" });
                }
                resDoc.failedLogin = 0;
                resDoc.token = generateToken();
                if (resDoc.hasOwnProperty('resetEmailToken'))
                    delete resDoc.resetEmailToken;

                if (resDoc.hasOwnProperty('resetEmailDate'))
                    delete resDoc.resetEmailDate;

                let result = await db_examineer_res.insert(resDoc);

                res.json({ status: "success", msg: "User unlock successfully!!" });
            } else {
                res.json({ status: "error", msg: "Invaild request !" });
            }


        } else {
            res.json({ status: "error", msg: author + "  is not authorized to reset login counter takers details for quiz id =  " + quizid });
        }

    } catch (error) {

        res.json({ status: "error", msg: "Invaild request !" });
    }

};

//new desing
exports.getTakersData1 = function (req, res) {
    var author = req.body.author;
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var short = req.body.author;
    var quizid = req.body.quiz_id;
    var alldoc = '';

    res.render('quiz/quizManageNew1', { token: 'AAIO', userMeta: userMeta, author: author, short: short, tooltip: tooltip, copyright: globaldata, isAngular: true });

};


// change password and reset quiz
exports.changePwdAndResetQuiz = function (req, res) {
    var type = req.body.type;
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var data = JSON.parse(req.body.takers_data);
    var author = req.body.author;
    var short = req.body.author;
    var id = req.body.quiz_id;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var alldoc = "";
    var all_data = "";
    var result = "";
    var quizdata = new Array();
    var randomId = randID();

    
    //============== from http server request =============================
    httpservreq.httpReq(randomId, type, data, author, function (err, body) {

        // console.log('Body ' + body);
        // console.log('Error ' + err);
        if (!err && body.success) {
            // console.log('Body Result-----');
            // console.log(body.result);
            var timer = setTimeout(function () {
                res.render('quiz/viewManageQuizResult', { all_data: body.result, quizid: id, userMeta: userMeta, short: short, copyright: globaldata });
            }, 1000); //10000 
            req.once('timeout', function () {
                clearTimeout(timer);
            });
        } else {
            res.render('quiz/viewManageQuizResult', { all_data: 'Server Error', quizid: id, userMeta: userMeta, short: short, copyright: globaldata });
            // res.redirect('/author_create_quiz?status=serverror');
        }

    });
    //============== from http server request ends=============================
};


//to commit edit quiz changes
exports.commitQuizChanges = function (req, res) {
    var commit_data = JSON.parse(req.body.data);
    var type = req.body.type;
    var author = req.body.username;
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    var quizid = req.body.token;
    var randomId = randID();
    //============== from http server request =============================
    httpservreq.httpReq(randomId, type, commit_data, author, function (err, body) {
        if (!err && body.success) {
            var timer = setTimeout(function () {
                res.render('quiz/viewCommEditQuiz', { data: body.result, quizid: quizid, userMeta: userMeta, short: author, copyright: globaldata });
            }, 1000); //10000
            req.once('timeout', function () {
                clearTimeout(timer);
            });
        } else {
            res.redirect('/author_create_quiz?msg=timeout');
        }
    });
    //============== from http server request ends=============================
};

// to toggle quiz status
exports.toggleQuizStatus = function (req, res) {
    var data = JSON.parse(req.body.data);
    var type = req.body.type;
    var author = req.body.author;
    var log_Id = req.body.log_Id;
    var log_Token = req.body.log_Token;
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var quizid = req.body.quiz_id;
    var randomId = randID();
    //============== from http server request =============================
    httpservreq.httpReq(randomId, type, data, author, function (err, body) {
        if (!err && body.success) {
            var timer = setTimeout(function () {
                // console.log("result-----"+body.result);
                // console.log("body==="+JSON.stringify(body));
                res.render('quiz/viewToggleResult', { data: body.result, quizid: quizid, userMeta: userMeta, short: author, copyright: globaldata });
            }, 1000); //10000
            req.once('timeout', function () {
                clearTimeout(timer);
            });
        } else {
            res.redirect('/author_create_quiz?status=serverror');
        }
    });
    //============== from http server request ends=============================
};


// to delete quiz
exports.delQuiz = function (req, res) {
    var type = "delete_quiz";
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var quizid = req.param("id");
    var fdata = {};
    fdata['quizid'] = quizid;
    var randomId = randID();
    //============== from http server request =============================
    var short = req.headers.x_myapp_whoami;
    httpservreq.httpReq(randomId, type, fdata, short, function (err, body) {
        if (!err && body.success) {
            var timer = setTimeout(function () {
                res.redirect('/author_create_quiz');
            }, 1000); //10000
            req.once('timeout', function () {
                clearTimeout(timer);
            });
        } else {
            res.redirect('/author_create_quiz?status=serverror');
        }
    });
    //============== from http server request ends=============================
};

//-------------downloadPwd-------------//
exports.downloadPwdList = function (req, res) {
    var quizid = req.param("quizid");
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var alldoc = "";
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    db_examineer_metadata.view("exam_meta", "passwordCSV", { key: quizid }, function (err, body) {
        if (!err) {
            generateLogs('info', userMeta.fullName + " downloaded password for quiz = " + quizid);
            res.setHeader('Content-disposition', 'attachment; filename=PasswordsForQuiz' + quizid + '.csv');
            res.set('Content-Type', 'text/csv');
            res.send(body.rows[0].value);

        } else {
            alldoc += "Error, Please Contact Administrator !!";
            res.redirect('/author_create_quiz?status=dwnloaderror');
        }
    })
};

//-------------summaryCSV-------------//

let genPerfSumm = async (quizid) => {
    // _design/byQuizUser/_view/quizIdToPerfSummary
    try {
        let summary = {};
        let quizMeta = await db_examineer_metadata.get(quizid)


        // TODO modify , look for isSection flag 
        let isSections = false;

        let today = new Date();
        let validDate = new Date(quizMeta.validUpto)
        let genPerf = false;
        if (today > validDate) {
            // console.log('val over')
            if (quizMeta.hasOwnProperty('performance') == false) {
                throw new Error("validtyOver")
              //  genPerf = true;
            }
        }else{
            genPerf = true;
        }


        if (genPerf) {
            let examRecords = await db_examineer_exam.view('byQuizUser', 'quizIdToPerfSummary', { key: quizid })

            // if (quizMeta.sections) { if (quizMeta.sections[0].displayInstruction) { isSections = true; } }
            if (quizMeta.hasOwnProperty("quizType")) {
                if (quizMeta.quizType == "live" || quizMeta.quizType == "sectioned") {
                    isSections = true;
                    // console.log("qt exits "+quizMeta.quizType)
                }

            } else {
                if (quizMeta.sections) { if (quizMeta.sections[0].displayInstruction) { isSections = true; } }
            }
            if (isSections) {
                // iterating through sections
                // generates : summary = {"1":[],...,"5":[]}
            
                let sectionalPartial = {}
            quizMeta['sections'].map((sec,index)=>{
                if(sec.hasOwnProperty("partialGrading")){
                    sectionalPartial[index+1] = sec['partialGrading']
                }else{
                    sectionalPartial[index+1] = false
                }
            })
                quizMeta.sections.map((itm, idx) => { summary[idx + 1] = [] })
                summary['overview'] = [];
                // now : summary = {"1":[],...,"5":[],"overview":[]}

                // function to fetch records of a student from exam records
                let findObj = (qid) => {
                    return examRecords.rows.find((item) => {
                        return item.id == qid
                    }).value
                }

                // iterate through all students listed in exammeta.credential
                Object.keys(quizMeta.credentials).map(userid => {
                    let studentSections = []

                    quizMeta.sections.map((secContent, sectId) => {
                        // looking for summary of individual sections
                        let sec = quizMeta._id + "-" + userid + "-" + (sectId + 1);
                        let secDetails = findObj(sec)
                        secDetails["sectionIdIndex"] = sectId
                        summary[sectId + 1].push(secDetails)
                        studentSections.push(secDetails)
                    })

                    let genOverview = (overviews) => {
                        let overview = {}
                        let sectionStartDates = [];
                        overview.isAttempted = false;
                        overview.summary = {
                            "graded": 0,
                            "ungraded": 0,
                            "total": 0,
                            "attempted": 0,
                            "skipped": 0,
                            "correct": 0,
                            "incorrect": 0
                            , "score": 0,
                            "max": 0,
                            "time": " ",
                            "help": 0,
                            "partialScores":0
                        }
                        overview.userid = userid;
                        overviews.map((itm, idx) => {
                            //console.log(JSON.stringify(itm,null,2))
                            if (itm.submittedOn) {
                                overview['submittedOn'] = itm.submittedOn
                            }
                            if (itm.startedOn) {
                                sectionStartDates.push(new Date(itm.startedOn))
                            }
                            overview.isAttempted = overview.isAttempted || itm.attempted;
                            if (itm.summary) {
                                 overview.summary["graded"] += itm.summary.graded
                                overview.summary["ungraded"] += itm.summary.ungraded
                                overview.summary["total"] += itm.summary.total
                                overview.summary["attempted"] += itm.summary.attempted
                                if (itm.summary.skipped != "All") {
                                    //.out("not na")
                                    overview.summary["skipped"] += itm.summary.skipped;
                                }
                                //out(itm.summary.correct)


                                overview.summary["correct"] += isNaN(itm.summary.correct) ? 0 : itm.summary.correct;
                                overview.summary["incorrect"] += isNaN(itm.summary.incorrect) ? 0 : itm.summary.incorrect;
                                overview.summary["help"] += isNaN(itm.summary.help) ? 0 : itm.summary.help;

                                overview.summary["score"] += itm.summary.score;
                                overview.summary["max"] += itm.summary.max;
                                // overview.summary["time"] 
                                if(itm["summary"].hasOwnProperty("partialScores")){
                                    // add partial score to overview only if partital is set
                                    if(sectionalPartial[itm['sectionIdIndex']+1]==true){
                                        overview.summary["partialScores"] += itm['summary']['partialScores'];
                                    }
                                }
                            }
                        })
                        let minStartDate;
                        if (sectionStartDates.length > 0) {
                            minStartDate = sectionStartDates.reduce(function (a, b) { return a < b ? a : b; });
                        }
                        overview['startedOn'] = minStartDate;
                        var allSec = 0;
                        var date = new Date(1970, 0, 1);
                        overviews.map((itm) => {
                            if (itm.summary) {
                                var dArr = itm.summary.time.split(":");
                                allSec = allSec + (+dArr[0]) * 60 * 60 + (+dArr[1]) * 60 + (+dArr[2]);
                            }
                        });
                        date.setSeconds(allSec);
                        overview['time'] = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                        return overview
                    }
                    let over = genOverview(studentSections)
                    summary["overview"].push(over);
                })
            } else {
                return { 'isSection': false }
            }



          

            

            

            let getNewRespDBid = () => {
                return new Promise((resolve, reject) => {
                   // out("Searching for a new id in response db")
                    db_examineer_res.view('byAdmin', 'getAvailableId')
                        .then(data => {
                            // out(data)
                            let id = data.rows[0].value;
                            let num = (id < 0) ? -id : id + 1;
                            let availableId = "0000".concat(num.toString(36)).slice(-5);
                           // out("available id =" + availableId)
                            if (id < 0) {
                                // resuing old doucment , rev id required
                                return db_examineer_res.get(availableId)
                            } else {
                                // fresh id
                                resolve({ _id: availableId })
                            }
                        })
                        .then((data) => {
                            resolve({
                                _id: data._id,
                                _rev: data._rev
                            })
                        })
                        .catch(err => {
                            reject(err)
                        })
                })
            }
            let savePerf =async () => {
                // byQuizId/_view/quizidToPerformanceDoc
                let data = {};
                data['quizid'] = quizMeta._id;
                data['performance'] = summary;
                let perfDB = await db_examineer_res.view('byQuizId','quizidToPerformanceDoc',{key:data['quizid']}) 
                if(perfDB.rows.length>0){
                    // doc already exists
                    // update doc
                    let perfDoc = perfDB.rows[0];
                    data['_id'] = perfDoc.value['_id'];
                    data['_rev'] = perfDoc.value['_rev'];
                }else{
                    // new doc to create
                    // insert new doc 
                    let newIdDets = await getNewRespDBid()
                    data["_id"] = newIdDets['_id']
                    if(newIdDets['_rev']){
                        data["_rev"]  = newIdDets['_rev']
                    }
                }
                data['date'] = new Date().toUTCString()
                await db_examineer_res.insert(data)
                return 
            }

            await savePerf()

            return summary

        } else {
            console.log("reding perf from db")
            return quizMeta.performance
        }
    } catch (err) {
        throw err
    }
}

var xl = require('excel4node');

exports.summaryCSV = async function (req, res) {
    try {
        var quizid = req.param("quizid");
        let quizData = await db_examineer_metadata.get(quizid)
        let isSectional = false;
        if (quizData.hasOwnProperty("quizType")) {
            if (quizData.quizType == "live" || quizData.quizType == "sectioned") {
                isSectional = true;
                // console.log("qt exits "+quizData.quizType)
            }

        } else {
            if (quizData.sections) { if (quizData.sections[0].displayInstruction) { isSectional = true; } }
        }
       if (isSectional) {
            // console.log("inside")
            let data = await genPerfSumm(quizid)
           
            var wb = new xl.Workbook();
            // Add Worksheets to the workbook
            var ws = wb.addWorksheet('Overview');
            // var ws2 = wb.addWorksheet('Sheet 2');
            ws.cell(1, 1).string('User')
            ws.cell(1, 2).string('Attempted')
            ws.cell(1, 3).string('Total Content')
            ws.cell(1, 4).string('Graded Questions')
            ws.cell(1, 5).string('Ungraded Content')
            ws.cell(1, 6).string('Attempted Questions')
            ws.cell(1, 7).string('Skipped Questions')
            ws.cell(1, 8).string('Correct')
            ws.cell(1, 9).string('Incorrect')
            ws.cell(1, 10).string('Score')
            ws.cell(1, 11).string('Maximum')
            ws.cell(1, 12).string('Time Taken')
            ws.cell(1, 13).string('Help Used')
            ws.cell(1, 14).string('Started On')
            ws.cell(1, 15).string('Submitted On')
            row = 2;
            let firstuser = quizData.users.userData[Object.keys(quizData.users.userData)[0]]
            let userCols = Object.keys(firstuser);
            let cl = 16
            userCols.map(ucol => {
                // console.log(ucol)
                ws.cell(1, cl).string(ucol);
                cl++;
            })

            let showPartialOverview = false;
            let sectionalPartial = {}
            quizData['sections'].map((sec,index)=>{
                if(sec.hasOwnProperty("partialGrading")){
                    sectionalPartial[index+1] = sec['partialGrading']
                    if(sec['partialGrading']==true){
                        showPartialOverview =true;
                    }
                }
            })

            data.overview.forEach(itm => {
                // out(itm)
                let sum = itm.summary;
                ws.cell(row, 1).string(String(itm.userid))
                if (itm.isAttempted) {
                    ws.cell(row, 2).string("Yes")
                } else {
                    ws.cell(row, 2).string("No")
                }
                ws.cell(row, 3).number(sum.total)
                ws.cell(row, 4).number(sum.graded)
                ws.cell(row, 5).number(sum.ungraded)
                ws.cell(row, 6).number(sum.attempted)
                ws.cell(row, 7).number(sum.skipped)
                ws.cell(row, 8).number(sum.correct)
                ws.cell(row, 9).number(sum.incorrect)
                let totScore = sum.score
                if(sum.hasOwnProperty("partialScores")){
                    if(showPartialOverview==true){
                        totScore += sum["partialScores"]
                    }
                }
                ws.cell(row, 10).number(totScore)
                ws.cell(row, 11).number(sum.max)
                ws.cell(row, 12).string(String(itm.time))
                ws.cell(row, 13).string(String(sum.help))
                if (itm.startedOn) {
                    ws.cell(row, 14).string(String(itm.startedOn))
                } else {
                    ws.cell(row, 14).string("Not started")
                }
                if (itm.submittedOn) {
                    ws.cell(row, 15).string(String(itm.submittedOn))
                } else {
                    ws.cell(row, 15).string("Not submitted")
                }

                let cl = 16
                if (quizData.users.userData[itm.userid]) {
                    Object.keys(quizData.users.userData[itm.userid]).map(ucol => {
                        ws.cell(row, cl).string(quizData.users.userData[itm.userid][ucol]);
                        cl++;
                    })
                }


                row++;
            })
            Object.keys(data).forEach(itm1 => {
                if (itm1 != "overview") {
                    let sheetData = data[itm1];
                    
                    var ws = wb.addWorksheet('Section ' + itm1);
                    // var ws2 = wb.addWorksheet('Sheet 2');
                    ws.cell(1, 1).string('User')
                    ws.cell(1, 2).string('Attempted')
                    ws.cell(1, 3).string('Total Content')
                    ws.cell(1, 4).string('Graded Questions')
                    ws.cell(1, 5).string('Ungraded Content')
                    ws.cell(1, 6).string('Attempted Questions')
                    ws.cell(1, 7).string('Skipped Questions')
                    ws.cell(1, 8).string('Correct')
                    ws.cell(1, 9).string('Incorrect')
                    ws.cell(1, 10).string('Score')
                    ws.cell(1, 11).string('Maximum')
                    ws.cell(1, 12).string('Time Taken')
                    ws.cell(1, 13).string('Help Used')
                    ws.cell(1, 14).string('Started on')
                    let col12 = 15
                    userCols.map(ucol => {
                        // console.log(ucol)
                        ws.cell(1, col12).string(ucol);
                        col12++;
                    })

                    row = 2;
                    sheetData.forEach(itm => {
                        // out(itm)
                        let sum = itm.summary;
                        ws.cell(row, 1).string(String(itm.userid))
                        if (itm.attempted) {
                            ws.cell(row, 2).string("Yes")
                        } else {
                            ws.cell(row, 2).string("No")
                        }
                        if (itm.summary) {


                            sum["correct"] =  sum['correct']=="NA" ? 0 : sum['correct'];
                            sum['incorrect'] = sum['incorrect']=="NA" ? 0:sum['incorrect']
                            sum['help'] = sum['help']=="NA" ? 0 : sum['help']
        
                            ws.cell(row, 3).number(sum.total)
                            ws.cell(row, 4).number(sum.graded)
                            ws.cell(row, 5).number(sum.ungraded)
                            ws.cell(row, 6).number(sum.attempted)
                            ws.cell(row, 7).number(sum.skipped)
                            ws.cell(row, 8).number(sum.correct)
                            ws.cell(row, 9).number(sum.incorrect)
                            let totScore = sum.score
                            if(sum.hasOwnProperty("partialScores")){
                                if(sectionalPartial[itm1]==true){
                                    
                                    totScore += sum["partialScores"]
                                }
                            }
                            ws.cell(row, 10).number(totScore)
                            ws.cell(row, 11).number(sum.max)
                            ws.cell(row, 12).string(String(sum.time))
                            ws.cell(row, 13).string(String(sum.help))
                            ws.cell(row, 14).string(String(itm.startedOn?itm.startedOn:"NA"))
                            
                        }


                        let col13 = 15
                        if (quizData.users.userData[itm.userid]) {
                            Object.keys(quizData.users.userData[itm.userid]).map(ucol => {
                                ws.cell(row, col13).string(quizData.users.userData[itm.userid][ucol]);
                                col13++;
                            })
                        }

                        row++;
                    })
                }
            })
            // wb.write('sample' + Math.random() + '.xlsx');
            wb.writeToBuffer().then(function (buffer) {
                // Do something with buffer
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-disposition': 'attachment; filename=SummaryForQuiz' + quizid + '.xlsx',
                    'Content-Length': buffer.length
                });
                res.end(buffer);
            });

        } else {
            
            var userMeta = req.userMeta;
            var err_msg = "";
            var alldoc = "";
            var fdata = {};
            fdata['quizId'] = quizid;
            var type = "generate_quiz_summary";
            var randomId = randID();
            //============== from http server request =============================
            var short = req.headers.x_myapp_whoami;
            httpservreq.httpReq(randomId, type, fdata, short, function (err, body) {
                if (!err && body.success) {
                    var data = JSON.parse(body.result);
                    // console.log(data);
                    if (data.success) {
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        db_examineer_metadata.view("exam_meta", "summaryCSV", { key: quizid }, function (err, body) {
                            if (!err) {
                                res.setHeader('Content-disposition', 'attachment; filename=SummaryForQuiz' + quizid + '.csv');
                                res.set('Content-Type', 'text/csv');
                                res.send(body.rows[0].value);
                            } else {
                                alldoc += "Either user doesnot attempt the quiz or quiz was deleted !!";
                                res.redirect('/author_create_quiz?status=summaryerror');
                            }
                        })
                    } else if (data.error) {
                        // generateLogs("error",  short + " downloaded performance summary - " +data.error + " For quiz id- "+ quizid);
                        err_msg += data.error;
                        // console.log("summary-==" + data.error);
                        res.redirect('/author_create_quiz?msg=' + err_msg);
                    } else {
                        // generateLogs("error", "Error fetching data from view. Error - " + err.message);
                        res.redirect('/author_create_quiz?status=error');
                    }
                } else {
                    res.redirect('/author_create_quiz?status=serverror');
                }
            });
        }
    } catch (error) {
        console.log(error)
        
        if(error.message=="validtyOver"){
            res.redirect('/author_create_quiz?status=validtyOver');
        }else{
res.redirect('/author_create_quiz?status=serverror');
        }
    }

    //============== from http server request ends=============================
};


var qa = require("./quizAnalytics")



// to downloa quiz log
exports.quizLogCSV = async function (req, res) {
    try {
        var quizId = req.param('quizid');
       
        // let dt = await getLogJSON(quizId)
        let excelFile = await qa.quizLogAnalysis(quizId)
        excelFile.writeToBuffer().then(function (buffer) {
            // Do something with buffer
            res.writeHead(200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-disposition': 'attachment; filename=LogAnalysisForQuiz' + quizId + '.xlsx',
                'Content-Length': buffer.length
            });
            res.end(buffer);
        });
       
    } catch (error) {
        console.log(error)
        res.redirect('/author_create_quiz?status=serverror');
    }
};

// to view submitted quiz response
exports.quizResponse = function (req, res) {
    var fdata = {};
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var token = req.headers.x_myapp_token;
    fdata['quizId'] = req.body.quiz_id;
    fdata['uname'] = req.body.uname;
    fdata['pwd'] = req.body.quizPwd;
    fdata['reqByAuthor'] = [true, author, token];
    var str = JSON.stringify(fdata);
    var encode = Buffer.from(str).toString('base64');
          
    res.render("quiz/viewQuizResponse", { data: quiz_url + encode });
}

// to download login credentials pdf
exports.dwnLoginCredential = function (req, res) {
    
    var userMeta = req.userMeta;
    var token = req.headers.x_myapp_token;
    var author = req.headers.x_myapp_whoami;
    var quizId = req.body.quiz_id;
    // console.log("quizId=="+quizId);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    db_examineer_metadata.get(quizId, function (err, body) {
        if (err) {
            res.json({ status: "error", msg: "Invaild request !", link: "" });
            
        } else {
            if (body.author == req.headers.x_myapp_whoami) {
                // console.log("body==="+JSON.stringify(body));
                res.json({ status: "success", msg: "Downloaded Credentials successfully !!", link: "", "quizTitle": body.title, "quizId": body._id, "inst": '', "credentials": body.credentials });
            } else {
                generateLogs("error", author + "  is not authorized to download pdf of login credentials  with id =  " + id);
                res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "", studentUrl: staticObj.studentUrl, docUrl: staticObj.docUrl, copyright: globaldata, userMeta: userMeta }); return;
            }
        }
    });

}




// get user log
exports.getUserLogs = function (req, res) {
    
    var userMeta = req.userMeta;
    var token = req.headers.x_myapp_token;
    var author = req.headers.x_myapp_whoami;
    var quizId = req.body.quizId;
    var userId = req.body.userId;
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    db_examineer_res.view("forTokenDoc", "quizIdUserIdToLog", { key: quizId + '-' + userId }, function (err, body) {
        if (!err) {
            
            if (body.rows.length > 0) {
                var data = body.rows[0].value;
                res.json({ status: 'ok', logs: data });
            } else {
                res.json({ status: 'fail', msg: 'Unable to get logs of this user' });
            }

        } else {
            res.json({ status: 'fail', msg: 'Unable to get logs of this user' });
        }
    })

}

//all logs
exports.allQuizLogs = async function (req, res) {
    let quizId = req.body.quizId;
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let body = await db_examineer_res.view("forTokenDoc", "quizIdToLog", { key: quizId });
        if (body.rows.length > 0) {
            //console.log(JSON.stringify(body,null,2));
            let userLogs = [];
            body.rows.forEach((usrlogs) => {
                userLogs.push(usrlogs.value);
            });
            res.status(200).json({ status: true, logs: userLogs });
        }else {
            res.status(200).json({ status: false, msg: 'Unable to get logs of this user' });
        }
    }catch (error) {
        console.log(error)
        res.status(400).json({ status: false, msg: 'Unable to get logs of this user' });
    }
}

//redirect to manage live quiz page --new in angularjs --
exports.getLiveQuizManagePage = function (req, res) {
    var author = req.body.author;
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var short = req.body.author;
    var quizid = req.body.quiz_id;
    var alldoc = '';
    res.render('quiz/liveQuiz/liveQuizManage', { userMeta: userMeta, token: quizid, author: author, short: short, tooltip: tooltip, copyright: globaldata, isAngular: true, chart_url: chart_url, ytvideo_url: ytvideo_url, socketUrl: staticObj.liveUrl, graphics_url: graphics_url, plotIframeLink: plotIframeLink });
};


//get live data
exports.getLiveQuizData = function (req, res) {
    var author = req.body.author;
    var quizid = req.body.quiz_id;
    var alldoc = '';

   
    let socketToken =  req.headers.x_myapp_token.slice(-20);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    db_examineer_exam.view("byAuthor", "quizIdToLiveData", { key: quizid }, function (err, bodyExamMeta) {
        if (err) {
            alldoc += err.message + " : " + quizid + ", Please Contact Administrator !!";
            res.json({ status: false });
        } else {
            if (author == req.headers.x_myapp_whoami) {
                users.get(author, function (err, bodyUser) {
                    if (!err) {
                        bodyUser.basket = (Array.isArray(bodyUser.basket)) ? bodyUser.basket : [];
                        var data = {
                            quizData: bodyExamMeta,
                            basket: bodyUser.basket,
                            socketUrl: staticObj.liveUrl,
                            lqWbSenderUrl: staticObj.lqWhiteboardSenderUrl
                        }
                        
                        db_examineer_metadata.view("ByAuthor", "idToSectionData", { key: quizid }, function (err, exMeta) {
                            if (!err) {
                                db_examineer_res.view("forLiveQuiz", "quizIdToDoc", { key: quizid }, function (err,resBody ) {
                                     if(!err){
                                        let liveQuiz = {
                                            questQueue : [],
                                            ytId:'',
                                            playedQuest:[]
                                        }

                                        if (resBody.rows.length > 0) {
                                            let resData = resBody.rows[0].value;
                                            if (resData.liveQuiz.hasOwnProperty('questQueue')) {
                                                liveQuiz.questQueue = resData.liveQuiz['questQueue'];
                                            }

                                            if (resData.liveQuiz.hasOwnProperty('playedQuest')) {
                                                liveQuiz['playedQuest'] = resData.liveQuiz['playedQuest'];
                                            }

                                            if (resData.liveQuiz.hasOwnProperty('lastPlayed')) {
                                                liveQuiz['lastPlayed'] = resData.liveQuiz['lastPlayed'];
                                            }

                                            if (resData.liveQuiz.hasOwnProperty('ytId')) {
                                                liveQuiz['ytId'] = resData.liveQuiz.ytId;
                                                //liveQuiz['ytId'] = '';
                                            }


                                        }

                                        let authorUrl = staticObj.authorUrl;
                                        let pdfDocUrl = staticObj.pdf_url;
                                        res.json({ status: true, data, exMeta: exMeta, chart_url: chart_url, ytvideo_url: ytvideo_url, graphics_url: graphics_url, plotIframeLink: plotIframeLink, liveQuiz: liveQuiz, authorUrl: authorUrl, pdfDocUrl: pdfDocUrl,socketToken:socketToken });
                                    } else {
                                        res.json({ status: false, msg: 'Something goes wrong' })
                                    }


                                });
                               
                            }
                        })
                    } else {
                        res.json({ status: false, msg: 'Something goes wrong' })
                        //res.redirect('/author_dashboard?mod=com&msg=Error');
                    }
                });
                //end of addition -- 
            } else {
                console.log("Invalid Author")
                res.json({ status: false });
            }
        }
    })
};


//add question in  queue
exports.liveQuizAddToQuea = async (req, res) => {

    try {
        let { quizId, secIndex, questIndex } = req.body;
        let insertData = {
            secIndex,
            questIndex
        }
        let resBody = await db_examineer_res.view('forLiveQuiz', 'quizIdToDoc', { key: quizId });
        if (resBody.rows.length > 0) {
            let resData = resBody.rows[0].value;
            let insertD = false;
            if (resData.liveQuiz.hasOwnProperty('questQueue')) {

                if (resData.liveQuiz['questQueue'].length >= 10) {
                    return res.json({ status: false, type: 'warning', msg: 'Maximum 10 questions can be added in the queue' });
                }
                let index = resData.liveQuiz['questQueue'].findIndex(x => x.secIndex == secIndex && x.questIndex == questIndex);
                if (index > -1) {
                    insertD = false;
                } else {
                    resData.liveQuiz['questQueue'].push(insertData);
                    insertD = true;
                }
            } else {
                resData.liveQuiz['questQueue'] = [];
                resData.liveQuiz['questQueue'].push(insertData);
                insertD = true;
            }

            if (insertD) {
                await db_examineer_res.insert(resData);
                return res.json({ status: true, type: 'success', msg: 'Question add successfully !!' })
            } else {
                res.json({ status: false, type: 'info', msg: 'Already added in queue' });
            }


        } else {
            res.json({ status: false, type: 'warning', msg: 'Please start the quiz atleast one time' });
        }
    } catch (error) {
        res.json({ status: false, type: 'danger', msg: 'Something goes wrong.Please try after some time' })
    }



}


//remove from the question queue
exports.liveQuizRemoveFromQuea = async (req, res) => {
    try {
        let { quizId, secIndex, questIndex } = req.body;

        let resBody = await db_examineer_res.view('forLiveQuiz', 'quizIdToDoc', { key: quizId });
        if (resBody.rows.length > 0) {
            let resData = resBody.rows[0].value;
            let notFoundMsg = 'Question not found in the queue !!';

            if (resData.liveQuiz.hasOwnProperty('questQueue')) {
                let index = resData.liveQuiz['questQueue'].findIndex(x => x.secIndex == secIndex && x.questIndex == questIndex);
                if (index > -1) {
                    resData.liveQuiz.questQueue.splice(index, 1);
                    await db_examineer_res.insert(resData);
                    res.json({ status: true, type: 'success', msg: 'Question delete successfully !!' });
                } else {
                    res.json({ status: false, type: 'warning', msg: notFoundMsg });
                }
            } else {
                res.json({ status: false, type: 'warning', msg: notFoundMsg });
            }

        } else {
            res.json({ status: false, type: 'warning', msg: notFoundMsg });
        }
    } catch (error) {
        res.json({ status: false, type: 'danger', msg: 'Something goes wrong.Please try after some time' })
    }
}



//add question in  played items
exports.liveQuizPlayedItem = async (req,res)=>{
    try {        
        let { quizId,questIndex,secIndex,quesId ,section,qtype } = req.body;  
        let insertData = {
            questIndex, secIndex, quesId,
            section,
            qtype,
            playAt:httpservreq.getCurrentDate()
        }     
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let resBody = await db_examineer_res.view('forLiveQuiz','quizIdToDoc',{key:quizId}) ;
        if(resBody.rows.length>0){
          let resData = resBody.rows[0].value;          
          if(resData.liveQuiz.hasOwnProperty('playedQuest')){
            
            resData.liveQuiz['playedQuest'].push(insertData);
          }else{
            resData.liveQuiz['playedQuest'] = [];
            resData.liveQuiz['playedQuest'].push(insertData);
          }

         //console.log(resData.liveQuiz['playedQuest']);

         resData.liveQuiz['lastPlayed'] = insertData;
         await db_examineer_res.insert(resData);
         return res.json({status:true,insertData})
          


        } else {
            res.json({ status: false });
        }
    } catch (error) {
        res.json({ status: false })
    }



}

// finalize live quiz
exports.finalizeLiveQuiz = async (req,res) =>{
    var finalizeData = JSON.parse(req.body.finalizeData);
    console.log(JSON.stringify(finalizeData,null,2));

    var type= 'finalize_live_quiz';
    var randomId = randID();   
    var short = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    //============== from http server request =============================
    httpservreq.httpReq(randomId, type, finalizeData, short, function (err, body) {
        if (!err && body.success) {
            var timer = setTimeout(function () {
                
                let resData = {
                    serverRes:body.result.success,
                    quizId : finalizeData.quizid
                }
                
               res.render('quiz/liveQuiz/viewAfterFinalize', { resData:resData, userMeta: userMeta,short: short, copyright: globaldata });
            }, 1000);
            req.once('timeout', function () {
                clearTimeout(timer);
            });
        } else {
            console.log(err);
            res.redirect('/author_create_quiz?status=serverror');
            generateLogs("error", short + " commited live quiz finalize. Error =" + JSON.stringify(err));
        }
    });
}

//save youtube id
exports.liveQuizSaveYoutubeId = async (req, res) => {

    try {
        let { quizId, ytId } = req.body;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        let resBody = await db_examineer_res.view('forLiveQuiz', 'quizIdToDoc', { key: quizId });
        if (resBody.rows.length > 0) {
            let resData = resBody.rows[0].value;
            resData.liveQuiz['ytId'] = ytId;
            await db_examineer_res.insert(resData);
            res.json({ status: true, type: 'success', msg: 'Youtube id save successfully' });
        } else {
            res.json({ status: false, type: 'warning', msg: 'Please start the quiz atleast one time' });
        }

    } catch (error) {
        res.json({ status: false, type: 'danger', msg: 'Something goes wrong.Please try after some time' })
    }

}

//open whiteboard
exports.showWhiteboard =  (req, res) => {
    let quizid = req.body.wbQuizId;
    let url = staticObj.lqWhiteboardReceiverUrl+quizid;
    res.render("quiz/liveQuiz/showBoard.ejs", { url: url });
}

exports.quizStdSubmitData = async (req,res) =>{
    let quizId = req.body.quizId;
    try {
       process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
       let lastSave = [];
       let summData = [];
       
       let lastSaveBody = await db_examineer_res.view('responseView', 'quizIdToLastSaved', { key: quizId }); 
       if(lastSaveBody.rows.length>0){
         lastSave = lastSaveBody.rows.map(x =>x.value);
       }

       let resBody = await db_examineer_exam.view('ByQuizId', 'summaryPlus', { key: quizId });
       if (resBody.rows.length > 0) {
         summData = resBody.rows.map(x =>x.value);
       } 
       res.json({ status: true, summData,lastSave});
    } catch (error) {
        res.status(400).json({status:false,msg:'Something went wrong'});
    }

}


