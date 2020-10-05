var staticObj = require('./config.js').merge_output;
var req_url = staticObj.req_url;
var couchdb = require('nano')(staticObj.couchdb);
var req_db = couchdb.use(staticObj.db_request);
var request = require("request");
var working_db = couchdb.use(staticObj.db_working);
var metadata_db = couchdb.use(staticObj.db_elements_metadata);
var playlist_db = couchdb.use(staticObj.db_playlist);
var users = couchdb.use(staticObj.db_authors);
var ticketRaise_db = couchdb.use(staticObj.db_ticketRaise);

exports.httpReq = function (ramdomId, type, data, user, callback) {
  var myrequest = { "type": type, "data": data }; // data- json
  generateLogs('trace', user + " made HTTPRequest of type = " + type + " (Random id -" + ramdomId + " )");
  var post_options = {
    url: req_url,
    timeout: 25000,
    method: "POST",
    body: '**jsonBegin' + JSON.stringify(myrequest) + 'jsonEnd*****11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
  };

  request(post_options, function (error, response, body) {
    if (error) {
      generateLogs('error', "Error in request made by = " + user + " and type = " + type + ". Error = " + JSON.stringify(error));
      callback(error, null);
    } else {
      // console.log(body);
      var json_res = JSON.parse(body);
      if (json_res.error) {
        generateLogs('error', "Error in response body in response to request by user =" + user + ", type = " + type + ". Error - " + json_res.error);
        callback(null, { success: false, result: json_res.error });
      } else {
        var resErr = json_res.result;
        if (resErr.error) {
          generateLogs('warn', "Error in successful response for user = " + user + " ,type=  " + type + " and Error=" + resErr.error);
        }
        generateLogs('info', "Response successful for user = " + user + " and type=" + type);
        callback(null, { success: true, result: json_res.result });
      }
    }
  });
}

exports.dbServerReq = function (ramdomId, type, data, callback) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  req_db.insert({ 'type': type, 'data': JSON.stringify(data) }, ramdomId,
    function (err, body) {
      if (!err) {
        callback(null, { success: true });
      }
    });
}

let getCurrentDate = function () {
  let dt = new Date();
  let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let cdate = month[dt.getUTCMonth()] + " " + dt.getUTCDate() + " " + dt.getUTCFullYear() + " " + dt.getUTCHours() + ":" + dt.getUTCMinutes() + ":" + dt.getUTCSeconds() + " UTC"
  return cdate;
}

exports.getCurrentDate = getCurrentDate;

// to update question data
// meta data stored in element_metadata and que content stored in working
exports.updateQues = function (id, author, reqType, data, metaData, callback) {
  var meta = metaData;
  let nDate = getCurrentDate();
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  working_db.get(id, function (err, doc) {
    updaterev = doc._rev;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    working_db.insert({ type: reqType, author: author, object: data, _rev: updaterev }, id, function (err, body, header) {
      if (!err) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        metadata_db.get(id, function (err, doc) {
          updatemetarev = doc._rev;
          var user_data = new Object;
          user_data = doc;
          user_data.tags = meta.tags;
          user_data.comments = meta.comments;
          user_data.concepts = meta.concepts;
          user_data.skills = meta.skills;
          user_data.updatedAt = nDate;
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          metadata_db.insert(user_data, function (err, body) {
            if (!err) {
              generateLogs("info", author + " successfully updated ques id =" + id);
              callback(null, { success: true });
            }
            else {
              generateLogs("error", author + " cannot updated ques id =" + id + "Error " + err.message);
              callback(null, { success: false, result: err.message });
            }
          })
        });
      } else {
        generateLogs("error", author + " cannot updated ques id =" + id + "Error " + err.message);
        callback(null, { success: false, result: err.message });
      }
    });
  });
}


// add ques to playlist
exports.addQuesToPlaylist = function (author, playlistId, idString, options,sectionId, callback) {
  var currentUTCDate = getCurrentUTCDate();
  var updateAt = {};
  updateAt["updateAt"] = currentUTCDate;
  updateAt["updateBy"] = author;

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  playlist_db.get(playlistId, function (err, doc) {
    if (!err) {
      var playlist = JSON.parse(JSON.stringify(doc.content));
      var sections = [];


      if (doc.sections) {
        sections = JSON.parse(JSON.stringify(doc.sections));
        // console.log(JSON.stringify(sections));
      } else {
        sections = [{ "secName": "Unsectioned List", "content": doc.content }, { "secName": "Section 1", "content": [] }, { "secName": "Section 2", "content": [] }, { "secName": "Section 3", "content": [] }, { "secName": "Section 4", "content": [] }, { "secName": "Section 5", "content": [] }];
        // console.log(JSON.stringify(sections));
      }

      let duplicateId = [];
      if (idString) {
        let idArr = idString.split(",");
        if (idArr) {
          // console.log(idString+"=============="+idArr);
          idArr.forEach((item) => {
            // console.log(item)
            let findQue = (qid) => { return qid.item == item };
            let isFound = playlist.find(findQue);
            // console.log(isFound)
            if (isFound) {
              // item found 
              duplicateId.push(item);
            } else {
              let optn = {};
              optn['item'] = item;
              optn["weight"] = 5;
              optn["properties"] = "none";
              optn['public'] = options.public ? true : false
              playlist.push(optn);
              sections[sectionId].content.push(optn);
            }
          })
          if (playlist.length <= 500) {
            var rev_id = doc._rev;
            var userData = doc;
            userData.content = playlist;
            userData.sections = sections;
            userData.updatedAt = updateAt;
            // console.log(JSON.stringify(userData)); 
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            playlist_db.insert(userData, function (err, body) {
              if (!err) {
                // console.log("items added");
                generateLogs("info", author + " successfully added ques to playlist id =" + playlistId);
                callback(null, { success: true, duplicateId: duplicateId });
              }
              else {
                generateLogs("error", author + " cannot added ques to playlist id =" + playlistId + "Error " + err.message);
                callback(null, { success: false, result: err.message });
              }
            })



          } else {
            var er_msg = "Maximum number of items allowed in a playlist is 500 !";
            // res.redirect('/author_dashboard_comm?msg=maxlist');
            callback(null, { success: false, result: er_msg, maxLen: true });
          }
          // }
        }
      } else {
        // throw new Error("No id defined");
        generateLogs("error", author + " cannot find questions arry. Error " + err.message);
        callback(null, { success: false, result: err.message });
      }
    } else {
      generateLogs("error", author + " cannot find playlist =" + playlistId + "Error " + err.message);
      callback(null, { success: false, result: err.message });
    }
  })
}


// add ques to PUBLIC LIST
exports.chkAuthorPublicList = function (author, quesArry, callback) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  metadata_db.view("authorToDocCommitted", "idToAuthorPublic", { keys: quesArry }, function (err, body) {
    if (!err) {
      var flagAuth = true;
      body.rows.map(itm => {
        var dta = itm.value;
        // console.log("dta==="+JSON.stringify(dta));
        if (dta.author == author) {
          // console.log("authorized");

          // callback(null, { success: true, msg:"authorized" });
        } else {
          // console.log("unauthorized")
          flagAuth = false;
          // callback(null, { success: true, msg:"unauthorized"});
        }
      })

      if (flagAuth) {
        callback(null, { success: true, msg: "authorized" });
      } else {
        callback(null, { success: true, msg: "unauthorized" });
      }

    } else {
      // console.log('errrr')
      console.log(err);
      callback(null, { success: false, msg: "error", result: err.message });
    }
  })
}

// var test_shubh = couchdb.use('test_shubh');
// add ques to playlist after check
exports.chkItmsPlaylist = function (author, playlistId, callback) {
  var unauthData = new Array();
  var itmData = {};
  var quesArry = new Array();
  var validAuthor = [];
  var collbData = new Array();


  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  playlist_db.get(playlistId, { revs_info: true }, function (err, body) {
    if (err) {
      callback(err, { success: false, msg: "error", result: err.message });
    } else {
      if (body.sections) {
        var contentItm = body.sections;
        contentItm.forEach(item1 => {
          item1.content.forEach(itm2 => {
            quesArry.push(itm2.item);

          })
        })
      } else {
        var contentItm = body.content;
        contentItm.forEach(itm2 => {
          quesArry.push(itm2.item);
        })
      }
      validAuthor.push(body.author);
      users.view("getUserData", "findshortName", { keys: body.collaborator }, function (err, body1, headers) {
        if (!err) {
          body1.rows.map(itm => {
            var list = {};
            // console.log(itm.value);

            validAuthor.push(itm.value.shortName);

            list["fullName"] = itm.value.fullName;
            list["email"] = itm.value.email;
            list["shortName"] = itm.value.shortName;
            // console.log("list------="+JSON.stringify(list));
            collbData.push(list);
          })
          // console.log(validAuthor)

          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
          metadata_db.view("authorToDocCommitted", "idToAuthorPublic", { keys: quesArry }, function (err, body2) {
            if (!err) {
              body2.rows.map(itm => {
                var dta = itm.value;
                // console.log(JSON.stringify(dta))
                if (dta.committed == true) {
                  if (validAuthor.indexOf(dta.author) > -1 || dta.public == true) {
                  } else {
                    unauthData.push(itm.id);
                  }
                } else {
                  unauthData.push(itm.id);
                }

                itmData[itm.id] = itm.value;
              })
              callback(null, { success: true, msg: "authorized", unauthData: unauthData, itmData: itmData, collbData: collbData, validAuthor: validAuthor });
            } else {
              console.log(err);
              callback(err, { success: false, msg: "error", result: err.message });
            }
          })
        } else {
          callback(err, { success: false, msg: "error", result: err.message });
        }
      })
    }
  })
}

exports.chkItmsBasket = function (author, quesId, callback) {
  var unauthData = new Array();
  var itmData = [];
  var quesArry = [];

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  metadata_db.view("authorToDocCommitted", "idToAuthorPublic", { keys: quesId }, function (err, body2) {
    if (!err) {
      body2.rows.map(itm => {
        var dta = itm.value;
        // console.log(JSON.stringify(dta))
        if (dta.committed == true) {
          if (dta.author == author || dta.public == true) {

          } else {
            unauthData.push(itm.id);
          }
        } else {
          unauthData.push(itm.id);
        }

        var tagArr = itm.value.tags;

        if (Array.isArray(tagArr)) {
          tagArr = tagArr.reduce(function (a, b) {
            return a.concat(b);
          }, []);
        } else {
          tagArr = []
        }
        itm.value.tags = tagArr;
        // itmData[itm.id] = itm.value;
        itmData.push(itm.value);
        quesArry.push(itm.value.id);
        // itmData[itm.id] = itm.value;
      })
      // console.log(itmData);
      callback(null, { success: true, msg: "authorized", unauthData: unauthData, itmData: itmData, quesArry: quesArry });
    } else {
      console.log(err);
      callback(err, { success: false, msg: "error", result: err.message });
    }
  })
}

//get author data
exports.getAuthorFullnameEmail = function (authors, callback) {
  var authordata = new Array();
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.view("ByShortName", "getFullnameEmail", { keys: authors }, function (err, body2) {
    if (!err) {
      callback(null, { success: true, userdata: body2.rows });
    } else {
      console.log(err);
      callback(err, { success: false, result: err.message });
    }
  })
}

//
exports.getQuestTickets = function (quesIds, callback) {
  var authordata = new Array();
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  ticketRaise_db.view("byAdmin", "questionIdToDoc", { keys: quesIds }, function (err, body2) {
    if (!err) {
      callback(null, { success: true, ticketdata: body2.rows });
    } else {
      callback(err, { success: false, result: err.message });
    }
  })
}

//get baseket data
exports.basketData = function (author, callback) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  users.get(author, function (err, body) {
    if (!err) {
      var basketquestions = (Array.isArray(body.basket)) ? body.basket : [];
      callback(null, { status: "ok", msg: "", bquestions: basketquestions });
    } else {
      callback(err, { status: "fail", msg: "", bquestions: [] });
    }
  });
}

//only country name and currency
exports.countryname = function (callback) {
  var url = 'https://restcountries.eu/rest/v2/all?fields=name;currencies;languages';
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      var apires = JSON.parse(body);
      var returndata = [];
      var returnCurrencies = [];
      var returnLanguages = [];
      var lang =[];

      apires.forEach(item => {
        returndata.push(item.name);
      });

      //country currency
      apires.forEach(item => {
        returnCurrencies.push(item.currencies[0].code);
      });

      // //country language
      apires.forEach(item => {
        returnLanguages.push(item.languages);
      });

      returnLanguages.forEach(item => {
        lang.push(item[0].name);
      });

      callback(null, { status: "success", data: returndata,currency:returnCurrencies,language:lang });
    } else {
      callback(error, { status: "fail", data: [] });
    }
  });
}

// to check all elements of worksheet before publish
exports.checkItmsBeforePublish = function (author, publishArr, callback) {
  // console.log("tetr----"+JSON.stringify(publishArr));
  var unauthSheet = new Array();
  var unauthData = new Array();
  var itemsProcessed = 0;
  publishArr.forEach(function (doc) {
    if (doc.elements.length > 0) {
      // console.log(doc.elements)

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      metadata_db.view("authorToDocCommitted", "idToAuthorPublic", { keys: doc.elements }, function (err, body2) {
        if (!err) {
          body2.rows.map(itm => {
            var dta = itm.value;
            // console.log(JSON.stringify(dta))
            if (dta.committed == true) {
              if (dta.author == author) {

              } else {
                unauthData.push(itm.id);
              }
            } else {
              unauthData.push(itm.id);
            }
          })

          if (unauthData.length > 0) {
            unauthSheet.push(doc.wsTitle);
          }
          
          itemsProcessed++;
          // console.log("itemsProcessed----"+itemsProcessed)
          if (itemsProcessed === publishArr.length) {
            callback(null, { success: true, msg: "authorized", unauthData: unauthData, unauthSheet: unauthSheet });
          }
        } else {
          console.log(err);
          // callback(err, { success: false, msg:"error", result: err.message});
        }
      })
      // 

      // publishArr.push(doc);   
    } else { }
  });
}

exports.basketQuesByAuthor = function (author, bskQues, callback) {
  // var itmData = {};
  var unauthData = new Array();
  var itmData = [];
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  metadata_db.view("authorToDocCommitted", "idToAuthorPublic", { keys: bskQues }, function (err, body2) {
    if (!err) {
      body2.rows.map(itm => {
        var dta = itm.value;
        // console.log(JSON.stringify(dta))
        if (dta.committed == true) {
          if (dta.author == author) {

          } else {
            unauthData.push(itm.id);
          }
        } else {
          unauthData.push(itm.id);
        }

        var tagArr = itm.value.tags;

        if (Array.isArray(tagArr)) {
          tagArr = tagArr.reduce(function (a, b) {
            return a.concat(b);
          }, []);
        } else {
          tagArr = []
        }
        itm.value.tags = tagArr;
        itmData.push(itm.value);
      })

      callback(null, { success: true, msg: "authorized", unauthData: unauthData, itmData: itmData });
    } else {
      console.log(err);
      callback(err, { success: false, msg: "error", result: err.message });
    }
  })
}


//get unique ids --
exports.autoGenerateDBId = function (initial,len,arrList) {
  var randomId;
  var length = len;
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  do {
    randomId="";
    for (var i = 0; i < length; i++) {
      randomId += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    randomId = initial+randomId;
  }
  while(arrList.indexOf(randomId)>-1);  
  return randomId;
}


