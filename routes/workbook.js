var staticObj = require('../config.js').merge_output;
var userinfo = '';
var couchdb = require('nano')(staticObj.couchdb);
var users = couchdb.use(staticObj.db_authors);
var metadata_db = couchdb.use(staticObj.db_elements_metadata);
var playlist_db = couchdb.use(staticObj.db_playlist);
var httpservreq = require('../httpseverreq.js');

var workbooks_db = couchdb.use(staticObj.db_workbooks);
var wbpublished_db = couchdb.use(staticObj.db_wbpublished);
var worksheet_db = couchdb.use(staticObj.db_worksheets);
var global_db = couchdb.use(staticObj.global_db);
var foDb =  couchdb.use(staticObj.db_wbforum);

var util = require('util');
var graphics_url = staticObj.graphics_url;
var chart_url = staticObj.chart_url;
var ytvideo_url = staticObj.ytvideo_url;
var plotIframeLink =  staticObj.plotIframeLink;


let generateRatingDoc = (entries) => {
    let value = entries;
    let s1 = value.length == 0 ? 0 : value.filter(item => item.rating == 1).length,
        s2 = value.length == 0 ? 0 : value.filter(item => item.rating == 2).length,
        s3 = value.length == 0 ? 0 : value.filter(item => item.rating == 3).length,
        s4 = value.length == 0 ? 0 : value.filter(item => item.rating == 4).length,
        s5 = value.length == 0 ? 0 : value.filter(item => item.rating == 5).length
    let ratingsData = {
        "5star": s5,
        "4star": s4,
        "3star": s3,
        "2star": s2,
        "1star": s1,
        "totalRatings": parseFloat( value.length == 0 ? 0 : ((5 * s5 + 4 * s4 + 3 * s3 + 2 * s2 + 1 * s1) / (s1 + s2 + s3 + s4 + s5)).toFixed(1)),
        "count":entries.length
    };
    return ratingsData
}

let getWbRatings = async (wbId) => {
   
    try {
        let wsDoc = await foDb.view('web', 'wbIdToRatingDoc', { key: wbId });
        if (wsDoc.rows.length > 0) {
            let value = wsDoc.rows[0].value['entries'];
          
            let ratingsData = await generateRatingDoc(value);
            let rdta={};
            rdta["rate"]=ratingsData;
            rdta["reviewlength"]=value.length;
            return rdta
        } else {
            return false
        }
    } catch (error) {
        throw error
    }
}


// redirect to workbook dashboard
exports.wbDashboard = function (req, res) {
    var shortName = req.headers.x_myapp_whoami;
    
    var userMeta = req.userMeta;
    var userdata_db = new Array();
    // if(wbAccess==true){
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        workbooks_db.view("author", "authorToWbDashData",{ key: shortName },  function (err, body) {
            if (!err) {
                body.rows.forEach(function (doc) {
                    userdata_db.push(doc.value);
                });


                httpservreq.basketData(shortName,function (err, body1) {
                    
                var countries = [];
                    res.render('workbook/wbdashboard', { userdata: userdata_db,isAngular:true,short: shortName, userMeta: userMeta,tooltip: tooltip, copyright: globaldata,basketCount:body1.bquestions,countries:countries});
                    
                }); 

                
                
            } else {
                //generateLogs("error", shortName + " is  unable to find content under dev data from the view");
                res.redirect("/author_dashboard?msg=dberror");
            }
        }) 
    
};

// to add a new workbook 
exports.addNewWorkbook = function (req, res) {
    var author = req.body.author;
    var wb_name = req.body.wb_name.trim();
    wb_name = wb_name.replace(/\s\s+/g, ' ');

    var max_id_ar = [];
    var currentUTCDate = getCurrentUTCDate();
    
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var workbookGbl = "";
   
        if (wb_name != "") {
            
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            global_db.get('workbook', function (err, body1) {
                if (!err) {
                    workbookGbl = body1; 
                    var defaultLogo =  workbookGbl.defaultLogo;
                    // console.log(JSON.stringify())
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    workbooks_db.view("author", "getavailableId", function (er, result) {
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
                            
                            var dbWBName = wb_name.toLowerCase();
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            workbooks_db.view("author", "authorNameToName", { key: [author, dbWBName] }, function (err, body, headers) {
                                if (!err) {
                                    
                                    if (body.rows.length != 0) {                                    
                                        res.json({status:'already'});
                                    }
                                    else if (body.rows.length == 0) {
                                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                        workbooks_db.get(availableId, function (err, doc) {
                                            if (!err) {
                                                if (doc) {
                                                    rev_no = doc._rev;
                                                    var user_data = new Object;
                                                    var angWb = new object;
                                                    user_data = doc.value;
                                                    user_data.author = author;
                                                    user_data.category = {"country": [],"language": "","relevance": [],"subject": [],"level": ""};
                                                    user_data.createdOn = currentUTCDate;
                                                    user_data.dev = {"lastUpdate": currentUTCDate,"sheets": [],"pricing":{"price": 0,"currency": "", "period": 0,"discount": 0},"description":"","logo":defaultLogo};
                                                    user_data.email = "";
                                                    user_data.title = wb_name;
                                                    user_data.publisher = {"name": "","organization": "","designation":"","aboutPublisher":"","areaOfExp":[]};
                                                    user_data.version="0.1";
                                                    user_data.meta = {};

                                                ////////////
                                                var angWb = {
                                                    id:availableId,
                                                    title:user_data.title,
                                                    logo:defaultLogo,
                                                    author:user_data.author,
                                                    status:user_data.approval.status,
                                                    lastUpdate:user_data.dev.lastUpdate,
                                                    currentVersion:{
                                                        versionNo:user_data.dev.version,
                                                        date:user_data.dev.lastUpdate
                                                    }
                                                };
                                                ////////////
                                                
                                                    // console.log(JSON.stringify(user_data));
                                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                                    workbooks_db.insert(user_data, availableId, function (error, body) {
                                                        if (!error) {
                                                            generateLogs("info", author + " added a new workbook with free id = " + availableId);
                                                            //res.redirect('/author_workbook_dash');
                                                            res.json({status:'success',wb:angWb});

                                                        } else {
                                                            generateLogs("error", "Unable to add workbook . Error - " + error.message);
                                                            res.json({status:'error'});
                                                        }
                                                    })
                                                }
                                            } else {
                                                var user_data = new Object;
                                                
                                                user_data.author = author;
                                                user_data.category = {"country": [],"language": "","relevance": [],"subject": [],"level": ""};
                                                user_data.createdOn = currentUTCDate;
                                                user_data.dev = {"lastUpdate": currentUTCDate,"sheets": [],"pricing":{"price": 0,"currency": "", "period": 0,"discount": 0},"description":"","logo":defaultLogo};
                                                user_data.email = "";
                                                user_data.title = wb_name;
                                                user_data.publisher = {"name": "","organization": "","designation":"","aboutPublisher":"","areaOfExp":[]};
                                                user_data.version="0.1";
                                                user_data.meta = {};
                                                ////////////
                                                var angWb = {
                                                    id:availableId,
                                                    title:user_data.title,
                                                    logo:defaultLogo,
                                                    author:user_data.author,
                                                    lastUpdate:user_data.dev.lastUpdate,
                                                    publishVersion:{},
                                                    currentVersion:{
                                                        versionNo:user_data.version,
                                                        date:user_data.dev.lastUpdate
                                                        }
                                                    }; 
                                                ////////////

                                                // console.log(JSON.stringify(user_data));
                                                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                                workbooks_db.insert(user_data, availableId, function (error, body) {
                                                    if (!error) {
                                                        generateLogs("info", author + " added a new workbook with new id = " + availableId);
                                                        res.json({status:'success',wb:angWb});

                                                    } else {
                                                        generateLogs("error", "Unable to add workbook . Error - " + error.message);
                                                        res.json({status:'error'});
                                                    }
                                                })
                                            }
                                        });
                                    }
                                    else {

                                        generateLogs("error", "Unable to add workbook  . Error - " + err.message);
                                        res.json({status:'error'});
                                    }
                                }
                            })
                        } else {
                            generateLogs("error", "Unable to fetch workbook  . Error - " + er.message);
                            //res.redirect('/author_workbook_dash?msg=dberror');
                            res.json({status:'error'});
                        }
                    })
                } else {
                    console.log("Error global: "+err);
                }   
            });
        }
        else {
            res.json({status:"blank",msg:"Please enter workbook name"});
        }
   
};

// to get workbook  page
exports.getWorkbookPage = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var id = req.param("id");
   
    // if(wbAccess==true){ 
        // console.log("===="+id);
        res.render('workbook/workbookEdit', {isAngular:true,token: id, author: author, short: short, userMeta: userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink }); 
    // }else{
    //     res.redirect("/author_dashboard?msg=wbAccessError");
    // }   
};

// to get workbook data using http
exports.getWorkbookData =  function (req, res) {
   
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var id = req.body.id;
    var userdata_db = '';
    // if(wbAccess==true){
        // console.log("====id"+id)
        var workbookGbl = "";
        // var imgArry = "";
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        global_db.get('workbook', function (err, body1) {
            if (!err) {
                workbookGbl = body1; ///level ... relevance
                
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        workbooks_db.get(id, { revs_info: true }, function (err, body) {
                            if (err) {
                                alldoc += err.message + " : " + id + ", Please Contact Administrator !!";
                                res.redirect('author_workbook_dash?msg=' + alldoc);
                            } else {
                                // console.log(JSON.stringify(body))
                                // var collb = body.collaborator;
                                if (body.author == req.headers.x_myapp_whoami) {   // || collb.indexOf(authorEmail) >-1
                                
                                        //country api
                                        httpservreq.basketData(author,function (err, body1) {
                                            // console.log("basket======"+JSON.stringify(body1));

                                            httpservreq.countryname(async function (err, body2) {
                                                if(!err){
                                                    var countries = body2.data;
                                                    var currency = body2.currency;
                                                    var language = body2.language;
                                                    // console.log(currency)
                                                    var myLangArray = language.filter(function(elem, index, self) {
                                                        return index === self.indexOf(elem);
                                                    });

                                                    // reviewsData['totalRatings']
                                                    var  ratingData = await  getWbRatings(id );

                                                    // console.log(ratingData);
                                                    //requiring path and fs modules
                                                    var path = require('path');
                                                    var fs = require('fs');
                                                    var logoImgName=[];
                                                    //joining path of directory 
                                                    var directoryPath = path.join(__dirname, '../public/author_public/images/subjectLogo');
                                                    //passsing directoryPath and callback function
                                                    fs.readdir(directoryPath, function (err, files) {
                                                        //handling error
                                                        if (err) {
                                                            return console.log('Unable to scan directory: ' + err);
                                                        }  
                                                        //listing all files using forEach
                                                        files.forEach(function (file) {
                                                            // Do whatever you want to do with the file
                                                            logoImgName.push(file);
                                                        });
                                                        // console.log(staticObj.wbLogoImagesPath); 
                                                        res.json({ data: body,status:"success",workbookGbl:workbookGbl,imgArry:logoImgName,basketCount:body1.bquestions,ratingData:ratingData,countries:countries,currency:currency,language:myLangArray,isAngular:true,token: id, author: author, short: short, userMeta: userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink ,wbLogoImagesPath:staticObj.wbLogoImagesPath}); 
                                                    });
                                                
                                                    // res.json({ data: body,status:"success",workbookGbl:workbookGbl,imgArry:logoImgName,basketCount:body1.bquestions,countries:countries,currency:currency,language:myLangArray,isAngular:true,token: id, author: author, short: short, userMeta: userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink }); 
                                                
                                                }else{
                                                    res.json({status:false,msg:"apierror"})
                                                // res.redirect("/author_dashboard?msg=apierror");
                                                }
                                            });
                
                                        
                                        }); 
                                }else {
                                    generateLogs("error", author + "  is not authorized to view playlist  with id =  " + id);
                                    res.json({status:"authorError",msg:"authorError"})
                                    }
                            }
                        })
                    // }
                // })
            } else {
                res.redirect("/author_dashboard?msg=dberror");
            }   
        });
    // }else{
    //     res.redirect("/author_dashboard?msg=wbAccessError");
    // }
};

// to get workbook  review details
exports.getWbReviewDetails = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var id = req.body.wbId;
    // console.log(id)
    // await foDb.view('web', 'wbIdToRatingDoc', { key: wbId });
    foDb.view("web", "wbIdToRatingDoc", { key: id }, function (err, body2) {
        if (!err) {

            // console.log(body2)

            if (body2.rows.length > 0) {
                let value = body2.rows[0].value['entries'];
             
                res.json({ status: "success",reviewDta:value, msg: " successfully"});

            } else {
                res.json({ status: "error", msg: "No data found !"});
            }



            // res.json({ status: "success", msg: "added successfully"});
        } else {
            res.json({ status: "error", msg: "Unable to process !"});
        }

    });
    
};



// to update workbook data 
exports.updateWorkbookData = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    var currentUTCDate = getCurrentUTCDate();

   
        var wb_data = req.body.data;
        var subject = req.body.subject;

        var areaOfExp = req.body.areaOfExp;
        // var country = req.body.country;

        wb_data.category.subject= subject;

        wb_data.publisher.areaOfExp= areaOfExp;
        
        // wb_data.category.country= country;
        wb_data.dev.lastUpdate= currentUTCDate;
        
        if(!wb_data.meta){
            wb_data.meta={}
        }
    
        if(wb_data.publisher['designation']==undefined){
            wb_data.publisher['designation'] = "";
        }

        if(wb_data.publisher['aboutPublisher']==undefined){
            wb_data.publisher['aboutPublisher'] = "";
        }

        if(wb_data.publisher['areaOfExp']==undefined){
            wb_data.publisher['areaOfExp'] = [];
        }


        // console.log(wb_data.meta.pubProfile.aboutPublisher)

        if (wb_data.author == req.headers.x_myapp_whoami) { 
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            workbooks_db.view("author", "authorNameToName", { key: [author, wb_data.title.toLowerCase()] }, function (err, body, headers) {
                if (!err) {
                    // console.log(JSON.stringify(body.rows[0] ))
                    if (body.rows.length != 0 && wb_data._id!=body.rows[0].id ) {
                        // console.log(1)
                        res.json({ status: "already", msg: "Unable to process !"});
                    }
                    else if (body.rows.length != 0 && wb_data._id==body.rows[0].id ) {
                        // console.log(2)
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        workbooks_db.insert(wb_data, function (error, body) {
                            if (!error) {
                                console.log(JSON.stringify(body))
                                // generateLogs("info", author + " successfully added item id=(" + quesId + ") in public list id =  " + pubListTopic);
                                res.json({ status: "success", msg: "update successfully !",rev:body.rev,lastUpdate:currentUTCDate});
                            }
                            else {
                                // generateLogs("error", author + "  was not able to add item id=(" + quesId + ") in public list id =  " + pubListTopic);
                                res.json({ status: "error", msg: "Unable to process !"});
                            }
                        })
                    }
                    else if (body.rows.length == 0) {
                        // console.log(3)
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        workbooks_db.insert(wb_data, function (error, body) {
                            if (!error) {
                                // generateLogs("info", author + " successfully added item id=(" + quesId + ") in public list id =  " + pubListTopic);
                                res.json({ status: "success", msg: "update successfully !"});
                            }
                            else {
                                // generateLogs("error", author + "  was not able to add item id=(" + quesId + ") in public list id =  " + pubListTopic);
                                res.json({ status: "error", msg: "Unable to process !"});
                            }
                        })
                    }else{
                        // generateLogs("error", "Unable to add workbook  . Error - " + err.message);
                        res.json({ status: "error", msg: "Unable to process !"});
                    }
                }
            })
        } else {
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " + wb_data._id);
            // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
    // }else{
    //     res.redirect("/author_dashboard?msg=wbAccessError");
    // }    
};


// to save workbook logo
exports.saveLogoWB = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var currentUTCDate = getCurrentUTCDate();
    // if(wbAccess==true){
        var wbId = req.body.wbId;
        var logo = req.body.logo;

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        workbooks_db.get(wbId, { revs_info: false }, function (err, body) {
            if (err) {
                res.json({ status: "error", msg: "Unable to process !"});
            } else {
                var wb_data = new Object;
                wb_data = body;
                wb_data.dev.logo = logo;
                wb_data.dev.lastUpdate= currentUTCDate;

                if (body.author == req.headers.x_myapp_whoami) {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    workbooks_db.insert(wb_data, function (error, body1) {
                        if (!error) {
                            // console.log(JSON.stringify(body1))
                            generateLogs("info", author + " logo updated successfully for workbook id=(" + wbId + ") ");
                            res.json({ status: "success", msg: "update successfully !",rev:body1.rev});
                        }
                        else {
                            generateLogs("error", author + "  was not able to updtae logo for workbook id=(" + wbId + ")");
                            res.json({ status: "error", msg: "Unable to process !"});
                        }
                    })
                } else {
                    generateLogs("error", author + "  is not authorized to update logo in workbook with id =  " + wbId);
                    res.json({ status: "Unauthorized", msg: "Unauthorized User"});
                }
            }
        })
    // }else{
    //     res.redirect("/author_dashboard?msg=wbAccessError");
    // }
}

// to delete workbook  
exports.deleteWorkbookData = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var currentUTCDate = getCurrentUTCDate();
    // if(wbAccess==true){
        var wb_data = req.body.data;
        var subject = req.body.subject;
        // var country = req.body.country;

        wb_data.category.subject= subject;
        // wb_data.category.country= country;
        wb_data.dev.lastUpdate= currentUTCDate;

};

// to publish beta version for workbook data 
exports.betaVersionWorkbookData = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var randomId = randID();
    var currentUTCDate = getCurrentUTCDate();
    // if (wbAccess == true) {
        var wb_data = req.body.data;
        var subject = req.body.subject;
        var areaOfExp = req.body.areaOfExp;
        var wbId = req.body.id;
        var betaUsers = req.body.betaUsers;
        var updateRequired = req.body.updateRequired;

        if (updateRequired === undefined) {
            updateRequired = false;
        }

        wb_data.category.subject = subject;
        wb_data.publisher.areaOfExp= areaOfExp;
        wb_data.betaUsers = betaUsers;
        wb_data.meta.updateRequired = updateRequired;

        var type = "publish_workbook_in_beta";
        var data = { "wbId": wbId };

        var publishArr = new Array();
        var unpubArr = new Array();
        wb_data.dev.sheets.forEach(function (doc) {
            if (doc.publish == true) {
                publishArr.push(doc);
                // console.log("matched  " + itm);
            }
            else {
                unpubArr.push(doc);
                // console.log("not matched  " + eArr);
            }
        });
        //    console.log(updateRequired)
        var betaData = {};
        betaData = wb_data.dev;
        betaData.lastUpdate = currentUTCDate;
        // betaData.sheets = publishArr;
        // ;
        if (publishArr.length <= 0) {
            // console.log("no publish sheets" + publishArr.length);
            res.json({ status: "No Publish Sheets", msg: "Their are no published worksheet in this workbook.Kindly publish atleast one worksheet." });
        } else {
            if (wb_data.author == req.headers.x_myapp_whoami) {
                httpservreq.checkItmsBeforePublish(author, publishArr, function (err, body1) {
                    // console.log("publish11======"+JSON.stringify(body1));
                    if (body1.unauthData.length > 0) {
                        res.json({ status: "Invalid Data", msg: "Unauthorized  data", unauthSheet: body1.unauthSheet });
                    } else {
                        // console.log(JSON.stringify(wb_data));
                        var betaArry = [];
                        var pubIdArry = new Array();
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                        wbpublished_db.view("author", "wbIdToVersionDoc", { key: wbId }, function (err, body2) {
                            if (!err) {
                                body2.rows.forEach(function (doc) {
                                    pubIdArry.push(doc.value);
                                });

                                pubIdArry.forEach(function (doc) {
                                    if (doc.beta || doc.beta == false) {
                                        betaArry.push(doc);
                                    } else { }
                                });
                                // console.log(betaArry.length)
                                if(betaArry.length<10){
                                    // console.log("beta publish")
                                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                workbooks_db.insert(wb_data, function (error, body2) {
                                    if (!error) {
                                        // console.log(JSON.stringify(body1))
                                        generateLogs("info", author + " sheet update successfully in wb db for id=(" + wbId + ") ");
                                        // res.json({ status: "success", msg: "update successfully !",rev:body2.rev});
                                        //send http request
                                        //============== from http server request =============================
                                        httpservreq.httpReq(randomId, type, data, short, function (err, body) {
                                            // console.log(JSON.stringify(body))
                                            if (!err && body.success) {
                                                var result = JSON.parse(body.result);
                                                if(result.error){
                                                    var timer = setTimeout(function () {
                                                        res.json({ status: "Error", msg:result.error });
                                                    }, 1000);
                                                    req.once('timeout', function () {
                                                        clearTimeout(timer);
                                                    });
                                                }else if(result.success){
                                                    var timer = setTimeout(function () {
                                                        res.json({ status: "success", msg: result.success});
                                                    }, 1000);
                                                    req.once('timeout', function () {
                                                        clearTimeout(timer);
                                                    });
                                                }else{
                                
                                                }
                                                // res.json({ status: "Valid Data", msg: "authorized data" });

                                            } else {
                                                res.json({ status: "error", msg: "Error:Please contact administrator" });
                                            }
                                        });
                                        //============== from http server request ends=============================
                                    }
                                    else {
                                        // console.log(error)
                                        generateLogs("error", author + "  was not able to update sheet in wb db for id=(" + wbId + ")");
                                        res.json({ status: "error", msg: "Unable to process !" });
                                    }
                                })
                                }else{
                                    res.json({ status: "beta limit exceed", msg: "beta version limit ecxceed" });
                                }
                            } else {
                                //generateLogs("error", shortName + " is  unable to find content under dev data from the view");
                                res.redirect("/author_dashboard?msg=dberror");
                            }
                        })

                    }
                });
            } else {
                generateLogs("error", author + "  is not authorized to publish beta version workbook  for id =  " + wb_data._id);
                // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
                res.json({ status: "Unauthorized", msg: "Unauthorized User" });
            }
        }
   
};

///////////////////----------------------------------------- worksheets -----------------------------------------------------------//////////////////////

exports.getWorkSheets= function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
        var id = req.param("id");
        var playlistdata = new Array();
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        playlist_db.view("playlistView", "getPlaylistData", { key: short }, function (err, body) {
            if (!err) {
                body.rows.forEach(function (doc) {
                    playlistdata.push(doc.value);
                });  
                res.render('workbook/worksheetEdit', { playlistdata:playlistdata,isAngular:true,token: id, author: author, short: short, userMeta: userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink });
            }else{
                alldoc += err.message + " : " + id + ", Please Contact Administrator !!";
                res.redirect('author_workbook_dash?msg=' + alldoc);
            } 
        });
    
};

// to get worksheets
exports.getWorkSheetsData = function (req, res) {
    
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
        var id = req.body.id;
        var userdata_db = '';
        // console.log(id)
        var playlistdata = new Array();
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        playlist_db.view("playlistView", "getPlaylistData", { key: short }, function (err, body) {
            if (!err) {
                body.rows.forEach(function (doc) {
                    playlistdata.push(doc.value);
                });   
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                workbooks_db.get(id, { revs_info: true }, function (err, body) {
                    if (err) {
                        alldoc += err.message + " : " + id + ", Please Contact Administrator !!";
                        res.redirect('author_workbook_dash?msg=' + alldoc);
                    } else {
                            if (body.author == req.headers.x_myapp_whoami) {   
                                
                                var devDataSheets = body.dev.sheets;
                            
                                if(Array.isArray(devDataSheets))
                                {
                                // console.log(devDataSheets);
            
                                    devDataSheets.map(function(x){
                                        x.wsDescp = "";
                                        x.wsInstr = "";
                                    });
            
                                    body.dev.sheets = devDataSheets;
                                // console.log(body.dev.sheets);
            
                                }

                                if(body.dev.description){
                                    body.dev.description = body.dev.description.replace(/["'\\\%]/g, function (char) {
                                        switch (char) {
                                            case "\0":
                                                return "\\0";
                                            case "\x08":
                                                return "\\b";
                                            case "\x09":
                                                return "\\t";
                                            case "\x1a":
                                                return "\\z";
                                            case "\n":
                                                return "\\n";
                                            case "\r":
                                                return "\\r";
                                            case "\"":
                                            case "'":
                                            case "\\":
                                            case "%":
                                                return "\\"+char;
                                        }
                                    });
                                }
            
                                httpservreq.basketData(author,function (err, body1) {
                                    // console.log("basket======"+JSON.stringify(body));
                                    if(!err){
                                        res.json({ data: body,status:"success",basketCount:body1.bquestions,isAngular:true,playlistdata: playlistdata,token: id, author: author, short: short, userMeta: userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink });      
                                    }else{
                                        res.json({status:false,msg:"apierror"})
                                    // res.redirect("/author_dashboard?msg=apierror");
                                    }
                                });  
                            
                            } else {
                                generateLogs("error", author + "  is not authorized to view playlist  with id =  " + id);
                                res.json({status:"authorError",msg:"authorError"})
                                // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
                            }

                        

                    }
                })
            }else{
                alldoc += err.message + " : " + id + ", Please Contact Administrator !!";
                res.redirect('author_workbook_dash?msg=' + alldoc);
            }
        });
    
};

// to add a new worksheet 
exports.addNewWorksheet = function (req, res) {
    
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
 
    // if(wbAccess==true){
        var wbAuthor = req.body.wbAuthor;
        var currentUTCDate = getCurrentUTCDate();
        var ws_name = req.body.ws_name.trim();
        ws_name = ws_name.replace(/\s\s+/g, ' ');
        var wbId = req.body.wbId;

        workbooks_db.get(wbId, { revs_info: true }, function (err, body) {
            if (err) {
                alldoc += err.message + " : " + id + ", Please Contact Administrator !!";
                res.json({ status: "error", msg: "Unable to process !"});
            }else
            {
                
                if(body.author == wbAuthor)
                { 
                    var sheets = Array.isArray(body.dev.sheets)?body.dev.sheets:[];
                    var sheetsIds = [];
                    sheets.forEach(x=>{
                        sheetsIds.push(x.wsId);
                    });
                    var wsSheetId = randUniqueSheetID(wbId,sheetsIds);

                    var sheetsDta = new Object;                                 
                    sheetsDta.wsTitle = ws_name;
                    sheetsDta.wsDescp = "";
                    sheetsDta.wsInstr = "";
                    sheetsDta.wshelpAllowed = 2;
                    sheetsDta.helpLevelSelAtReview = 2;
                    sheetsDta.wsGradingMatrix =[[4,4,4],[0,0,0],[-1,-1,-1]];
                    sheetsDta.mode = ""
                    sheetsDta.time = 5;
                    sheetsDta.tags = [];
                    sheetsDta.publish = false;
                    sheetsDta.wsId = wsSheetId;
                    sheetsDta.free = {"items": 0,"hints": 0,"explanations": 0};
                    sheetsDta.elements = [];

                    // console.log(sheetsDta);

                    body.dev.lastUpdate= currentUTCDate;
                    body.dev.sheets.push(sheetsDta);
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    workbooks_db.insert(body, function (error, body1) {
                        if (!error) {
                            res.json({ status: "success", msg: "new workbook added successfully !",newWS:sheetsDta});
                        }
                        else {
                        // generateLogs("error", author + "  was not able to add item id=(" + quesId + ") in public list id =  " + pubListTopic);
                        res.json({ status: "error", msg: "Unable to process !"});
                        }
                    });
                
                }else{
                    generateLogs("error", wbAuthor + "  is not authorized to edit workbook  with id =  " + wbId);        
                    res.json({ status: "Unauthorized", msg: "Unauthorized User"});
                }

            }
        });
    
};


//find sheetname exist or not in the workbook
exports.sheetNameExist = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
       
        var sheetID = req.body.wsId;
        var wbID = req.body.wbId; 
        var shtName = req.body.wsTitle;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        
        workbooks_db.view("author", "authorNameWBIdToWSNameArry",{ key: [author,wbID] },  function (err, body) {
            if (!err) {
                if (body.rows.length != 0) {
                    var wrSheets = body.rows[0].value;
                    if(sheetID===undefined)
                    {
                        var existIndex = wrSheets.findIndex(function(x){ 
                            return (x.wsName.toLowerCase().trim()==shtName.toLowerCase().trim());                  
                        });
                    }else{
                        var existIndex = wrSheets.findIndex(function(x){ 
                            return (x.wsId!=sheetID && x.wsName.toLowerCase().trim()==shtName.toLowerCase().trim());                  
                            });                          
                    }
                    

                        if(existIndex>-1)                       
                        res.json(false);            
                        else
                        res.json(true);
                }else{
                    res.json(true);
                }
                }else{
                res.json(true);
                } 
        });
    
};


// to update worksheets data 
exports.updateSheetData = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    var currentUTCDate = getCurrentUTCDate();  
    // if(wbAccess==true){
        var wbAutor = req.body.author;
        var sheetID = req.body.sheetID;
        var wbID = req.body.wbID; 
        var shtData = req.body.sheetData;
        var tags = req.body.tags;
        shtData.tags= tags;
            
        if (wbAutor == req.headers.x_myapp_whoami) { 
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

            ///////////////
            
            workbooks_db.get(wbID,{ revs_info: true },function (err, body){
                if (err) {
                    res.json({ status: "error", msg: "Unable to process !"});
                } else {
                    
                    //find sheetname already exist in the same workbook;
                    var allWsData =  body.dev.sheets;                
                    var existIndex = allWsData.findIndex(function(x){ 
                    return (x.wsId!=sheetID && x.wsTitle.toLowerCase().trim()==shtData.wsTitle.toLowerCase().trim());                  
                    });
    

                    if(existIndex>-1)
                    {
                        res.json({ status: "already", msg: "This sheet name already exist!"});                    
                    }else{
                        body.dev.lastUpdate= currentUTCDate;
                        var sheetIndex = body.dev.sheets.findIndex(x=> x.wsId==sheetID);  

                        shtData.wsTitle = shtData.wsTitle.trim();
                        shtData.wsTitle = shtData.wsTitle.replace(/\s\s+/g, ' ');

                        var sheetElement = [];
                        shtData.elements.forEach(x=>{
                            sheetElement.push(x.id);
                        });

                        shtData.elements = sheetElement;
                        body.dev.sheets[sheetIndex] = shtData;

                        workbooks_db.insert(body, function (error, body1) {
                            if (!error) {
                            // generateLogs("info", author + " successfully added item id=(" + quesId + ") in public list id =  " + pubListTopic);
                            res.json({ status: "success", msg: "update successfully !"});
                            }
                            else {
                            // generateLogs("error", author + "  was not able to add item id=(" + quesId + ") in public list id =  " + pubListTopic);
                            res.json({ status: "error", msg: "Unable to process !"});
                            }
                        });
                        
                    }
                }
            });

        } else {
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " + wbID);
            // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
   
};


// to fetch basket question in worksheets
exports.getAllBasketQues = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
        var wsAuthor = req.body.wsAuthor;   
        if(wsAuthor == author)
        {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            users.view("ByShortName", "shortNameToBasket", { key: wsAuthor }, function (err, body, headers) {
                if (!err) {
                    if (body.rows.length != 0) {
                        var dta = body.rows[0].value;
                        if(dta.basket){
                            if(dta.basket.length>0){
                                var basketQues = dta.basket;
                                httpservreq.basketQuesByAuthor(wsAuthor,basketQues, function (err, body1) {
                                    //console.log(body1);
                                    if (!err && body1.success) {
                                        //console.log(body1);
                                        var unauthData = body1.unauthData;
                                        var basketQues = body1.itmData;     
                                        res.json({ status: "success",basketQues:basketQues,unauthData:unauthData});
                                    }else{
                                        res.json({ status: "error", msg: "Unable to process !"});
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
    // }else{
    //     res.redirect("/author_dashboard?msg=wbAccessError");
    // }
};

// to fetch basket question in worksheets
exports.updateWsOrder = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
        var wbAuthor = req.body.wbAuthor;
        var sortOrder = req.body.sortOrder;
        var wbid = req.body.wbid;

        if(wbAuthor == author)
        {

            workbooks_db.get(wbid,{ revs_info: true },function (err, body){
                if (err) {
                    res.json({ status: "error", msg: "Unable to process !"});
                } else {
                    
                    //find sheetname already exist in the same workbook;
                    var allWsData =  body.dev.sheets;                
                    var sortArray = [];
                    sortOrder.forEach(sheetId=>{
                        var sheetIndex = allWsData.findIndex(x=> x.wsId == sheetId);
                        sortArray.push(allWsData[sheetIndex]);   
                    });

                    body.dev.sheets = sortArray;

                        workbooks_db.insert(body, function (error, body1) {
                            if (!error) {
                            res.json({ status: "success", msg: "update successfully !"});
                            }
                            else {
                            res.json({ status: "error", msg: "Unable to process !"});
                            }
                        });
                }
            });

        }else{
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " + wb_data._id);        
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
    
};


exports.getSheetData = function(req,res){

    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
        
        var wbAutor = req.body.author;
        var sheetID = req.body.wsid;
        var wbID = req.body.wbid; 
        if (wbAutor == req.headers.x_myapp_whoami) { 
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            workbooks_db.get(wbID,{ revs_info: true },function (err, body){
                if (err) {
                    res.json({ status: "error", msg: "Unable to process !"});
                } else {
                    
                        var sheetIndex = body.dev.sheets.findIndex(x=> x.wsId==sheetID);  
                        if(sheetIndex>-1)
                        {   var sheetData = body.dev.sheets[sheetIndex];


   


                            httpservreq.basketQuesByAuthor(wbAutor,sheetData.elements, function (err, body1) {
                                // console.log(body.success);
                                if (!err && body1.success) {

                                // console.log(body1);
                                    var unauthData = body1.unauthData;
                                    sheetData.elements = body1.itmData;                                
                                    res.json({ status: "success", sheetData:sheetData,unauthData: body1.unauthData});
                                }else{
                                    res.json({ status: "error", msg: "Unable to process !"});
                                }
                                
                            });
                        }else{
                            res.json({ status: "error", msg: "Unable to process !"});
                        }
                        
                }
            });

        } else {
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " + wbID);
            // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
    
};


exports.getWorksheetPlaylistQuest = function(req,res){

    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
        var wsAuthor = req.body.wsAuthor;
        var plylistItms = req.body.plylistItms;
        //console.log(plylistItms);
        if(wsAuthor == author)
        {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            httpservreq.basketQuesByAuthor(wsAuthor,plylistItms, function (err, body1) {
                
                if (!err && body1.success) {
                    //console.log(body1);
                    var unauthData = body1.unauthData;
                    var plylistData = body1.itmData;     
                    res.json({ status: "success",plylistData:plylistData,unauthData:unauthData});
                }else{
                    res.json({ status: "error", msg: "Unable to process !"});
                }
            });         
        }else{
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " + wb_data._id);
            // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
   
};

exports.getWorkbookVersionManagePage= function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var id = req.param("id");
    // if(wbAccess==true){
        res.render('workbook/wbVersionManagePage', {isAngular:true,token: id, author: author, short: short,userMeta:userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink }); 
   
};

exports.getWorkbookVersionManageData= function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
        var id = req.body.id;
        var wbauthor = req.body.author;
        var pubIdArry = new Array();
        var versionDocMeta = new Array();
        var betaLatestVer;
       
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        wbpublished_db.view("author", "wbIdToVersionDoc",{ key: id},  function (err, body2) {
            if (!err) {
                body2.rows.forEach(function (doc) {
                    pubIdArry.push(doc.value.pubId);
                });
                
                if(pubIdArry.length==0||pubIdArry==undefined){
                //    console.log("pubIdArry-----"+pubIdArry.length);
                    // res.redirect("/author_getWorkbookPage?id="+id+"&msg=noData");
                    generateLogs("trace", author + "  no beta version found  with id =  " + id);
                    res.json({status:"nodata"})
                }else{
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    wbpublished_db.view("web", "pubIdToMeta",{ keys: pubIdArry },  function (err, body3) {
                        if (!err) {
                            body3.rows.forEach(function (doc) {
                                versionDocMeta.push(doc.value);
                            });

                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                            wbpublished_db.view("author", "latestBetaVersionList",{ key: id },  function (err, body4) {
                                if (!err) {
                                    // console.log(body4.rows)
                                    if(body4.rows.length==0){

                                        betaLatestVer="";
                                    }else{
                                        betaLatestVer=body4.rows[0].value;
                                    }
                                    
                                    
                                    // var wbauthor = body4.rows[0].value.author;
                                    httpservreq.basketData(short,function (err, body5) {
                                        if (wbauthor == req.headers.x_myapp_whoami) {     
                                            res.json({isAngular:true,status:"success",token: id,basketCount:body5.bquestions,versionDocMeta:versionDocMeta,betaLatestVer:betaLatestVer,author: author, short: short,userMeta:userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata });
                                            // res.render('workbook/wbVersionManagePage', {isAngular:true,token: id,basketCount:body5.bquestions,versionDocMeta:versionDocMeta,betaLatestVer:betaLatestVer,author: author, short: short, fullName: fullName,wbAccess:wbAccess,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata });
                                        }else {
                                            generateLogs("error", author + "  is not authorized to view wb manage page  with id =  " + id);
                                            res.json({status:"authorError",msg:"authorError"})
                                            // res.redirect("/author_workbook_dash?msg=authorError");
                                        }
                                    }); 
                                } else {
                                    //generateLogs("error", shortName + " is  unable to find content under dev data from the view");
                                    res.redirect("/author_dashboard?msg=dberror");
                                }
                            })
                        } else {
                            //generateLogs("error", shortName + " is  unable to find content under dev data from the view");
                            res.redirect("/author_dashboard?msg=dberror");
                        }
                    })
                }
            } else {
                //generateLogs("error", shortName + " is  unable to find content under dev data from the view");
                res.redirect("/author_dashboard?msg=dberror");
            }
        }) 

};

// to update worksheets data 
exports.updateVersionDetails = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    var currentUTCDate = getCurrentUTCDate();  
    // if(wbAccess==true){
        var wbAutor = req.body.author;
        var betaUsers = req.body.betaUsers;
        var meta = req.body.meta;
        var pubId = req.body.pubId;
        var flag = req.body.flag; 
        var statusFlag = req.body.statusFlag;

        if (wbAutor == req.headers.x_myapp_whoami) { 
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
                if (err) {
                    res.json({ status: "error", msg: "Unable to process !"});
                } else {
                    //find sheetname already exist in the same workbook;
                    var allWbPubData =  body;  
                    if(flag=='beta'){
                        body.isBeta = req.body.statusFlag; 
                    }else if(flag=='published'){
                        body.published = req.body.statusFlag; 
                    }else{}
                    
                    body.betaUsers = req.body.betaUsers; 
                    body.meta = req.body.meta; 
                      
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    wbpublished_db.insert(body, pubId, function (err, body) {
                        if (!err) {
                            res.json({ status: "success", msg: "update successfully !"});
                        }
                        else {
                            res.json({ status: "error", msg: "Unable to process !"});
                        }
                    });   
                }
            });

        } else {
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " );
            // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
    // }else{
    //     res.redirect("/author_dashboard?msg=wbAccessError");
    // }
};

// to delete beta wb data 
exports.deleteWbBetaVersion = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;

    // if(wbAccess==true){
        var wbAutor = req.body.author;
        var pubId = req.body.pubId;
       
        if (wbAutor == req.headers.x_myapp_whoami) { 
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            wbpublished_db.get(pubId,{ revs_info: false },function (err, body){
                if (err) {
                    res.json({ status: "error", msg: "Unable to process !"});
                } else {
                    //find sheetname already exist in the same workbook;
                    var allWbPubData =  body;  
                    var randomId = randID();
                    var type = 'delete_workbook_in_beta';
                    var data = {"pubId":pubId};
                   

                    //============== from http server request =============================
                    httpservreq.httpReq(randomId, type, data, short, function (err, body) {
                        if (!err && body.success) {
                            // console.log(JSON.stringify(body))
                            var result = JSON.parse(body.result)
                            // console.log(result.error)
                            if(result.error){
                                var timer = setTimeout(function () {
                                    res.json({ status: "Error", msg:result.error });
                                }, 1000);
                                req.once('timeout', function () {
                                    clearTimeout(timer);
                                });
                            }else if(result.success){
                                var timer = setTimeout(function () {
                                    res.json({ status: "success", msg: result.success});
                                }, 1000);
                                req.once('timeout', function () {
                                    clearTimeout(timer);
                                });
                            }else{}
                        } else {
                            res.json({ status: "error", msg: "Unable to process !"});
                        }
                    });
                    //============== from http server request ends=============================
                }
            });

        } else {
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " + wbID);
            // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
    
};

// to delete beta wb data 
exports.publishVersionWorkbookData = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var randomId = randID();
    
    // if(wbAccess==true){
        var wbAutor = req.body.author;
        var pubId = req.body.pubId;
        var wbId = req.body.wbId;
        var updateRequired = req.body.updateRequired;
        var betaVersion = req.body.betaVersion;

        if (updateRequired === undefined) {
            updateRequired = false;
        }
        var whatsNew = req.body.whatsNew;
        var type = 'publish_workbook';
        var meta={};
        meta["updateRequired"]=updateRequired;
        meta["updateMsg"]=whatsNew;
        meta["betaId"]= pubId;
        meta["betaVersion"]= betaVersion;
        meta["status"]="pending";
        meta["history"]=[];
        var data = {"pubId":pubId, "meta":meta};
// console.log(data)
        if (wbAutor == req.headers.x_myapp_whoami) { 
          //============== from http server request =============================
          httpservreq.httpReq(randomId, type, data, short, function (err, body) {
            //    console.log(JSON.stringify(body))
            if (!err && body.success ==true) {
                var result = JSON.parse(body.result)
                // console.log(result.error)
                if(result.error){
                    var timer = setTimeout(function () {
                        res.json({ status: "Error", msg:result.error });
                    }, 1000);
                    req.once('timeout', function () {
                        clearTimeout(timer);
                    });
                }else if(result.success){
                    var timer = setTimeout(function () {
                        res.json({ status: "success", msg: result.success});
                    }, 1000);
                    req.once('timeout', function () {
                        clearTimeout(timer);
                    });
                }else{

                }
               
                
            } else {
                res.json({ status: "error", msg: "Unable to process !"});
            }
        });
        
        } else {
            generateLogs("error", author + "  is not authorized to edit workbook  with id =  " + wbId);
            // res.render('user_pages/login', { status: "error", msg: "Unauthorized User", link: "" }); return;
            res.json({ status: "Unauthorized", msg: "Unauthorized User"});
        }
   
};


exports.getBetaFeedbackPage= function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // var pubid = req.param("pubid");
    var wbId = req.param("wbId");
    // if(wbAccess==true){
        
        res.render('workbook/wbBetaFeedbackPage', {wbId:wbId, author: author, short: short,userMeta:userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata ,chart_url: chart_url, ytvideo_url: ytvideo_url,graphics_url: graphics_url,plotIframeLink:plotIframeLink }); 
    
};


exports.getBetaFeedbackData= function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    // if(wbAccess==true){
        // var pubid = req.body.pubid;
        var wbId = req.body.wbId;
        var wbauthor = req.body.author;
        var betaFeedbackAry = new Array();
        var feedbackWithQues={};
        var quesAry =new Array();
        
        // console.log(wbId)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        worksheet_db.view("author", "pubIdToFeedback",{ key: wbId},  function (err, body) {
            if (!err) {
                
                body.rows.forEach(function (doc) {
                    betaFeedbackAry.push(doc.value);
                });

                body.rows.forEach(function (doc){
                    if(!feedbackWithQues[doc.value.ref]){
                        feedbackWithQues[doc.value.ref]=[];
                    }
                    feedbackWithQues[doc.value.ref].push(doc.value)
                })

                quesAry = Object.keys(feedbackWithQues);

                httpservreq.basketData(short,function (err, body5) {
                    if (wbauthor == req.headers.x_myapp_whoami) {     
                        res.json({status:"success",wbId:wbId,basketCount:body5.bquestions,quesAry:quesAry,feedbackWithQues:feedbackWithQues,author: author, short: short,userMeta:userMeta,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata });
                        // res.render('workbook/wbVersionManagePage', {isAngular:true,token: id,basketCount:body5.bquestions,versionDocMeta:versionDocMeta,betaLatestVer:betaLatestVer,author: author, short: short, fullName: fullName,wbAccess:wbAccess,authorEmail:authorEmail, tooltip: tooltip, copyright: globaldata });
                    }else {
                        generateLogs("error", author + "  is not authorized to view wb manage page  with wbId =  " + wbId);
                        res.json({status:"authorError",msg:"authorError"})
                        // res.redirect("/author_workbook_dash?msg=authorError");
                    }
                }); 
            } else {
               
                //generateLogs("error", shortName + " is  unable to find content under dev data from the view");
                res.redirect("/author_dashboard?msg=dberror");
            }
        }) 

};

// to delete beta wb data 
exports.changeBetaFeedbackStatus = function (req, res) {
    // var fullName = req.headers.x_myapp_fullName;
    // var wbAccess = req.headers.x_myapp_wbAccess;
    var userMeta = req.userMeta;
    var author = req.headers.x_myapp_whoami;
    var short = req.headers.x_myapp_whoami;
    var authorEmail = req.headers.x_myapp_email;
    var randomId = randID();
    
    var wbAutor = req.body.author;
    var docId = req.body.docId;
    var feedIndex = req.body.feedIndex;
    var status = req.body.status;

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        worksheet_db.get(docId, { revs_info: false }, function (err, body) {
            if (err) {
                res.json({ status: "error", msg: "Unable to process !"});
            } else {
                var wb_data = new Object;
                wb_data = body;
                wb_data.userdata.feedback[feedIndex].status = status;
               
                if (wbAutor == req.headers.x_myapp_whoami) {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                    worksheet_db.insert(wb_data, function (error, body1) {
                        if (!error) {
                            // console.log(JSON.stringify(body1))
                            generateLogs("info", author + " logo updated successfully for workbook id=(" + docId + ") ");
                            res.json({ status: "success", msg: "update successfully !",rev:body1.rev});
                        }
                        else {
                            generateLogs("error", author + "  was not able to updtae logo for workbook id=(" + docId + ")");
                            res.json({ status: "error", msg: "Unable to process !"});
                        }
                    })
                } else {
                    generateLogs("error", author + "  is not authorized to edit feedback  for id =  " + docId);
                    res.json({ status: "Unauthorized", msg: "Unauthorized User"});
                }
            }
        })
        
    
};