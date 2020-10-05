var fs = require('fs');
var path = require('path');
var mergeJSON = require("merge-json");
var staticObj = require('../config.js').merge_output;
var httpservreq = require('../httpseverreq.js');
var couchdb = require('nano')(staticObj.couchdb);
var db_examineer_metadata = couchdb.use(staticObj.db_examineer_metadata);
var db_examineer_exam = couchdb.use(staticObj.db_examineer_exam);
var db_examineer_res = couchdb.use(staticObj.db_examineer_response);
var users = couchdb.use(staticObj.db_authors);
var request = require("request");
var xl = require('excel4node');

let generateToken = () => {
    var text = "";
    var length = 125;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$%*-";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

let getLogJSON = async (quizId) => {
    // return raw log files 
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    let qlogs = await db_examineer_res.view('forTokenDoc', 'quizIdToLog', { key: quizId });
    let qMeta = await db_examineer_metadata.get(quizId)

    let replaceAll = (str, find, replace) => {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    let defNoUagent = "NA"

    let genPlatform = (data) => {
        let a = defNoUagent;
        if (data.useragent) {
            a = data.useragent['platform']
        }
        return a
    }

    let genBrowser = (data) => {
        //console.log(data.useragent)
        let a = defNoUagent;
        if (data.useragent) {
            a = data.useragent['examApp'] ? "Examineer App v" + data.useragent['examApp'] : data.useragent['browser'] + " (" + data.useragent['version'] + ")"

        }
        return a
    }

    let genBrowserObj = (data) => {
        let res = { name: defNoUagent, ver: defNoUagent } 
        if (data.useragent) {
            res.name = data.useragent['examApp'] ? "Examineer App" : data.useragent['browser']
            res.ver = data.useragent['examApp'] ? data.useragent['examApp'] : data.useragent['version']
        }
        return res
    }

    let genDevice = (data) => {
        let device = defNoUagent;
        if (data.useragent) {
            if (data.useragent['examApp']) {
                device = replaceAll(data.useragent['model'] ? data.useragent['model'] : " ", ',', ' ')
            } else {
                if (data.useragent.isMobile) {
                    device = "Mobile"
                }
                if (data.useragent.isTablet) {
                    device = "Tablet"
                }
                if (data.useragent.isDesktop) {
                    device = "Desktop"
                }
            }
        }
        return device
    }

    let genIPAddr = (data) => {
        let a = defNoUagent;
        if (data.useragent) {
            a = data.useragent['ipAddress'] ? data.useragent['ipAddress'] : "NA"
        }
        return a
    }

    let genLocalDate = (date, timeZone) => {
        
        var targetTime = new Date(date);
        var timeZoneFromDB = timeZone;
        //get the timezone offset from local time in minutes 
        var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset();
        //convert the offset to milliseconds, add to targetTime, and make a new Date 
        var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
        var convrtString = offsetTime.toString();
        var showDate = convrtString.slice(4, 25);
       
        return showDate
    }

    let genLocalDate1 = (date, timeZone) => {
       
        var targetTime = new Date(date);
        var timeZoneFromDB = timeZone;
        //get the timezone offset from local time in minutes 
        var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset();
        //convert the offset to milliseconds, add to targetTime, and make a new Date 
        var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);

        var month = '' + (offsetTime.getMonth() + 1),
            day = '' + offsetTime.getDate(),
            year = offsetTime.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
        
    }

    let genUserFields = (uname) => {
        let str = ""
        if (qMeta.users.userData[uname]) {
            Object.keys(qMeta.users.userData[uname]).map(ucol => {
                str += qMeta.users.userData[uname][ucol] + ","
            })
        } else {
            let firstUser = Object.keys(qMeta.users.userData)[0];
            Object.keys(qMeta.users.userData[firstUser]).map(ucol => {
                if (ucol != qMeta.users['userCol']) {
                    str += " ,"
                } else {
                    str += `${uname},`
                }
            })
        }
        return str
    }

    let genUserHeaders = () => {
        let str = ""
        let firstUser = Object.keys(qMeta.users.userData)[0];
        Object.keys(qMeta.users.userData[firstUser]).map(ucol => {
            if (ucol != qMeta.users['userCol']) {
                str += ucol + " ,"
            } else {
                str += `${ucol} (username) ,`
            }
        })
        return str
    }

    let genUserHeadersArray = () => {
        let str = []
        let firstUser = Object.keys(qMeta.users.userData)[0];
        Object.keys(qMeta.users.userData[firstUser]).map(ucol => {
            str.push(ucol)
        })
        return str
    }
    let logsArr = []

    qlogs.rows.map(aDoc => {
        aDoc.value.log.map(aLog => {
            let pfm, bwr
            bwr = genBrowser(aLog)
            pfm = genPlatform(aLog)
            
            let logObj = {
                userId: aDoc.value.user,
                userDetails: qMeta.users.userData[aDoc.value.user] ? qMeta.users.userData[aDoc.value.user] : {},
                userString: genUserFields(aDoc.value.user),

                timeStampUTC: aLog.timeStamp,
                timeStampLocal: genLocalDate(aLog.timeStamp, qMeta['timeZone']),
                date: genLocalDate1(aLog.timeStamp, qMeta['timeZone']),

                action: aLog.action,
                message: aLog.message,
            }

            logObj['ipAddress'] = genIPAddr(aLog);
            logObj['device'] = genDevice(aLog);
            logObj['platform'] = genPlatform(aLog);
            logObj['device'] = genDevice(aLog);
            logObj['browserString'] = genBrowser(aLog)
            let br = genBrowserObj(aLog)
            logObj['browserName'] = br.name;
            logObj['browserVersion'] = br.ver;


            if (aLog.useragent) {
                logObj['appLogin'] = aLog.useragent['examApp'] ? true : false;
            }
            if (aLog.authorLogin) {
                logObj['authorLogin'] = true
            }
            logsArr.push(logObj)
        })
    })
   
    return { data: logsArr, userHeaderArray: genUserHeadersArray(), csvUserHeader: genUserHeaders(), timeZone: qMeta['timeZone'], students: Object.keys(qMeta['credentials']) }
}
module.exports.getLogJSON = getLogJSON



class Stack extends Array {
    constructor(...elems) {
        super(...elems)
    }
    pop() {
        if (this.length === 0) throw new Error('Nothing to Pop!')
        super.pop()
    }

    peek() {
        if (this.length === 0) throw new Error('Stack is Empty')
        return this[this.length - 1]
    }
    clear() {
        this.length = 0;
    }
}


let analyzeLogs = (student) => {
    
    let uniqueidset = new Set();
    student.data.forEach((item) => {
      uniqueidset.add(item.userId);
    });
    //sorting unique days
    let UniqueIds = [...uniqueidset];
    UniqueID = UniqueIds.sort((a, b) => a - b);
    // console.log(Uniquedays)
    let failed_login = [
      "logged_in_failure",
      "reset_email_sent",
      "logged_in_blocked1",
      "account_unlocked",
      "logged_in_blocked2",
      "logged_in_blocked3",
    ];
    let FinalData = [];
  
    UniqueID.map((itm) => {
      let studentData = {};
      //creating 'recs' record for each userid
      recs = student.data.filter((it) => it["userId"] == itm);
  
      recs.map((ud) => {
        ud["sdate"] = new Date(ud["timeStampLocal"]);
      });
      if (!studentData[itm]) {
        studentData[itm] = [];
      }
  
      let out = (a) => {
        let m = true;
        if (m) {
          console.log(a);
        }
      };
  
      userRecordSorted = recs.sort((a, b) => a.sdate - b.sdate);
  
      let actStack = new Stack();
      let sobj = {
        device: [],
        ipAddress: [],
        browserName: [],
        date: [],
        platform: [],
        Notes: [],
      };
      let devicename;
      let IpAddress;
      let Browsername;
      let platform;
      let date;
      let name;
      let length = 0;
      let actToPush = "";
      let timestamp = "";
      let authorlogin = "";
      
      userRecordSorted.map((urs) => {
        out("userid = " + urs["userId"]);
        out("current stack = " + actStack);
        // to push the "logged_in" when two consecutive logins occur
        if ((length > 1) & (actToPush == "logged_in")) {
          actStack.push(actToPush);
          sobj = {
            device: [],
            ipAddress: [],
            browserName: [],
            platform: [],
            Notes: [],
            date: [],
          };
          sobj["device"].push(devicename);
          sobj["ipAddress"].push(IpAddress);
          sobj["browserName"].push(Browsername);
          sobj["platform"].push(platform);
          sobj["date"].push(date);
          if (authorlogin == true) {
            sobj["Notes"].push("By admin");
            if (!sobj["byAdmin"]) sobj["byAdmin"] = true;
            else sobj["byAdmin"] = true;
          }
  
          sobj["logged_in"] = timestamp;
        }
        devicename = urs.device;
        IpAddress = urs.ipAddress;
        authorlogin = urs.authorLogin;
        Browsername = urs.browserString;
        platform = urs.platform;
        date = urs.date;
        timestamp = urs.timeStampLocal;
        actToPush = urs.action;
  
        out("will add action:  " + actToPush);
  
        actStack.push(actToPush);
        out("After adding:  " + actStack);
        length = actStack.length; //1
        out("current stack = " + length);
        let topStack = actStack.peek();
  
        let pushFlag = false;
  
        name = urs.userId;
  
        //When action is other than logged in
        if (topStack != "logged_in") {
          if (
            (topStack.substring(0, 10) == "logged_out") &
            (actStack.length == 1)
          ) {
            console.log("When loggedout alone happens,Clear stack");
            actStack.clear();
            console.log("Actstack length is " + actStack.length);
          }
          //push the device,ip address ,browser names into the arrays
          sobj["device"].push(urs.device);
          sobj["ipAddress"].push(urs.ipAddress);
          sobj["browserName"].push(urs.browserString);
          sobj["platform"].push(urs.platform);
          sobj["date"].push(urs.date);
          //when actions are submitted or account is blocked or unblocked add a message in  note section
          if (
            (topStack == "submitted") |
            (topStack == "logged_in_blocked1") |
            (topStack == "account_unlocked")
          ) {
            sobj["Notes"].push(urs.message);
            //Make the cell green and flag "isSubmitted" to true when quiz is submitted
            if (topStack == "submitted") {
              sobj["isSubmitted"] = true;
              sobj["cellColor"] = "green";
            }
          }
        }
  
        if ((topStack == "logged_in") | failed_login.includes(topStack)) {
          out("loggedin pushed");
          //when failed login happens
          if (failed_login.includes(topStack) & (actStack.length == 1)) {
            actStack.clear();
          }
          //when multiple entries occur
          if (actStack.length > 1) {
            out("something in the stack ");
  
            pushFlag = true;
            //session expired
            sobj["logged_out"] = "Session Expired";
            out("session expired");
          }
          //first entry
          else {
            out("first time loggedin");
            sobj = {
              device: [],
              ipAddress: [],
              browserName: [],
              platform: [],
              Notes: [],
              date: [],
            };
            sobj["device"].push(urs.device);
            sobj["ipAddress"].push(urs.ipAddress);
            sobj["browserName"].push(urs.browserString);
            sobj["platform"].push(urs.platform);
            sobj["date"].push(urs.date);
            sobj["logged_in"] = urs.timeStampLocal;
  
            //when the account is unlocked by the user or when the account is blocked by the user
            if (
              (urs.action == "account_unlocked") |
              (urs.action == "logged_in_blocked1") |
              (urs.action == "logged_in_blocked2") |
              (urs.action == "logged_in_blocked3")
            ) {
              pushFlag = true;
              sobj["Notes"].push(urs.message);
              urs.action == "logged_in_blocked1"
                ? (sobj["cellColor"] = "red")
                : null;
              sobj["logged_out"] = "Not Applicable";
            }
  
            //when admin has logged in
            if (urs.authorLogin == true) {
              // console.log("admin loggedin");
              sobj["Notes"].push("By admin");
              if (!sobj["byAdmin"]) sobj["byAdmin"] = true;
              else sobj["byAdmin"] = true;
            }
          }
          //when logout is done properly
        } else if (
          (topStack.substring(0, 11) === "logged_out") &
          (actStack.length != 0)
        ) {
          console.log("enter");
          pushFlag = true;
  
          sobj["logged_out"] = urs.timeStampLocal;
        }
        //pushing object in to uname array
        if (pushFlag) {
          out("pushflag true");
          actStack.clear();
          out("stack cleared");
          studentData[urs.userId].push(sobj);
          out("array value");
          //out(JSON.stringify(studentData[itm][urs.userId], null, 2));
          sobj = {
            device: [],
            ipAddress: [],
            browserName: [],
            platform: [],
            Notes: [],
            date: [],
          };
        }
        out("========done========");
      });
      //when logout is not done properly for only one entry
      if (actStack.length != 0) {
        if (actStack.peek().substring(0, 11) !== "logged_out") {
          sobj["logged_out"] = "Session Expired";
          actStack.clear();
          studentData[name].push(sobj);
        }
      }
      FinalData.push(studentData);
    });
  
    //console.log(JSON.stringify(FinalData, null, 2));
    return FinalData;
  };
module.exports.analyzeLogs = analyzeLogs


let generateUniqueEntry = (data) => {
    // TODO modify later
    // console.log(data)
    return data[0]
}

let formattedTime = (str1, str2 = "", date = "") => {
    //Formatted time for both logged_in and logged_out
    let allowedStr = ["Session Expired", "Not Applicable"];
    //When str2 and date  are not provided(For loggedin cases)
    if ((str2 == "") | (date == "")) {
      if (!str1) {
        return "Some error";
      }
  
      if (allowedStr.indexOf(str1) == -1) {
        let parts = str1.split(" ");
        return parts[3];
      } else {
        return str1;
      }
    } else {
      //when str2 and date  are provided (For loggedout cases)
      if (allowedStr.indexOf(str1) == -1) {
        temp_1 = str1.slice(0, 12);
  
        temp_2 = str2.slice(0, 12);
  
        if (temp_1.split(" ")[1] != temp_2.split(" ")[1]) {
          return str1.split(" ")[3] + "(" + date + ")";
        } else {
          return str1.split(" ")[3];
        }
      } else {
        return str1;
      }
    }
  };

let timeBetween = (date1, date2) => {
    //Get 1 day in milliseconds
    let strVal = ['Session Expired', 'Not Applicable']
    if (strVal.indexOf(date2) > -1) {
        return 'Not Applicable'
    }

    var one_minutes = 1000 * 60;
    // Convert both dates to milliseconds
    var date1_ms = new Date(date1).getTime();
    var date2_ms = new Date(date2).getTime();
    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
    let given_seconds = difference_ms / 1000
    hours = Math.floor(given_seconds / 3600);
    minutes = Math.floor((given_seconds - (hours * 3600)) / 60);
    seconds = given_seconds - (hours * 3600) - (minutes * 60);

    timeString = hours.toString().padStart(2, '0') + ':' +
        minutes.toString().padStart(2, '0') + ':' +
        seconds.toString().padStart(2, '0');
    return timeString
}

let AttendanceSheet = (studentData, student) =>
  //to generate the attendance sheet from json
  {
    let Uniquedaysset = new Set();
    let attrec = {};
    let attendancedata = [];
    // to get unique date
    student.data.forEach((item) => {
      Uniquedaysset.add(item.date);
    });
    //sorting unique days
    let Uniquedates = [...Uniquedaysset];
    Uniquedays = Uniquedates.sort((a, b) => new Date(a) - new Date(b));
    //storing the attendance
    console.log(Uniquedays);

    //looping through each student name
    student.students.forEach((i) => {
      attrec = {
        username: "",
        attendance: [],
      };

      attrec.username = i;
      //Checking for each quiz date
      Uniquedays.map((it) => {
        let isPresent = false;
        it = new Date(it);

        studentData.forEach((usr, index) => {
          uname = Object.keys(usr)[0];

          for (
            dictindex = 0;
            dictindex < studentData[index][uname].length;
            dictindex++
          ) {
            dict = studentData[index][uname][dictindex];
            if (
              (uname == i) &
              (dict["logged_in"].substring(0, 12) ==
                it.toString().substring(4, 16))
            ) {
              attrec.attendance.push("Yes");
              isPresent = true;
              break;
            }
          }
        });
        if (isPresent == false) attrec.attendance.push("-");
      });
      attendancedata.push(attrec);
    });

    attendancedata.push(Uniquedates);
    console.log(attendancedata);
    return attendancedata;
  };
module.exports.AttendanceSheet = AttendanceSheet


let generateExcelLog = (data, attendancedata, rawData) => {
    // to generate excel from json
    var wb = new xl.Workbook();
  
    var ws1 = wb.addWorksheet("Attendance");
    ws1.cell(1, 1).string("Username");
    let j = 2;
    attendancedata[attendancedata.length - 1].map((i) => {
      ws1.cell(1, j).string(i);
      j++;
    });
    attendancedata.pop();
    row = 2;
    attendancedata.forEach((item) => {
      Object.keys(item).map((ele, eleindex) => {
        // console.log(eleindex)
        if (eleindex == 0) {
          ws1.cell(row, 1).string(String(item[ele]));
          //console.log(item[ele])
        } else {
          j = 2;
          let len = item[ele].length;
          for (i = 0; i < len; i++) {
            ws1.cell(row, j).string(String(item[ele][i]));
            // console.log(item[ele][i])
            j++;
            // console.log(j)
          }
        }
      });
      row++;
    });
  
    var ws2 = wb.addWorksheet("Date wise analysis");
    ws2.cell(1, 1).string("Date");
    ws2.cell(1, 2).string("Username");
    ws2.cell(1, 3).string("Session no");
    ws2.cell(1, 4).string("Login time");
    ws2.cell(1, 5).string("IP address");
    ws2.cell(1, 6).string("Device");
    ws2.cell(1, 7).string("Browser");
    ws2.cell(1, 8).string("Platform");
    ws2.cell(1, 9).string("Logout time");
    ws2.cell(1, 10).string("Session time");
    ws2.cell(1, 11).string("Notes");
  
    row = 2;
    sno = 1;
    data.forEach((ele) => {
      Object.keys(ele).map((usr, uindex) => {
        ele[usr].map((itm, recIndex) => {
          itm["user"] = usr;
          Logoutdate = itm["date"][itm["date"].length - 1];
          let date = generateUniqueEntry(itm["date"]);
          itm["date"] = date;
          let userStr = " ";
          let dateStr = " ";
          dateStr = itm.date;
         
          userStr = itm["user"];
          
          // date and username
  
          ws2.cell(row, 1).string(String(dateStr));
          ws2.cell(row, 2).string(String(userStr));
          ws2.cell(row, 3).number(sno);
          sno++;
          ws2.cell(row, 4).string(String(formattedTime(itm["logged_in"])));
          // console.log(itm)
          ws2.cell(row, 5).string(String(generateUniqueEntry(itm["ipAddress"])));
          ws2.cell(row, 6).string(String(generateUniqueEntry(itm["device"])));
          ws2
            .cell(row, 7)
            .string(String(generateUniqueEntry(itm["browserName"])));
          ws2.cell(row, 8).string(String(generateUniqueEntry(itm["platform"])));
  
          ws2
            .cell(row, 9)
            .string(
              String(
                formattedTime(itm["logged_out"], itm["logged_in"], Logoutdate)
              )
            );
          //  genLogOut(logintime, logout time) ""
          ws2
            .cell(row, 10)
            .string(String(timeBetween(itm["logged_in"], itm["logged_out"])));
  
          var styleNote = wb.createStyle({
            font: { color: itm["cellColor"] ? itm["cellColor"] : "black" },
          });
          ws2.cell(row, 11).string(String(itm["Notes"])).style(styleNote);
          row++;
        });
      });
    });
  
    // ws2.row(1).freeze();
  
    var ws3 = wb.addWorksheet("Logs (raw)");
    ws3.cell(1, 1).string("Username");
    ws3.cell(1, 2).string(`Timestamp(GMT+${rawData["timeZone"]})`);
    ws3.cell(1, 3).string("Action");
    ws3.cell(1, 4).string("Device");
    ws3.cell(1, 5).string("Platform");
    ws3.cell(1, 6).string("Browser");
    ws3.cell(1, 7).string("IP Address");
  
    let uheaders = rawData["userHeaderArray"];
    
    let cl = 8;
    uheaders.map((ucol) => {
      ws3.cell(1, cl).string(ucol);
      cl++;
    });
    let row3 = 2;
    rawData["data"].map((itm) => {
      ws3.cell(row3, 1).string(String(itm.userId));
      ws3.cell(row3, 2).string(String(itm.timeStampLocal));
      ws3.cell(row3, 3).string(String(itm.message));
      ws3.cell(row3, 4).string(String(itm.device));
      ws3.cell(row3, 5).string(String(itm.platform));
      ws3.cell(row3, 6).string(String(itm.browserString));
      ws3.cell(row3, 7).string(String(itm.ipAddress));
  
      let cl2 = 8;
      uheaders.map((ucol) => {
        ws3
          .cell(row3, cl2)
          .string(itm["userDetails"][ucol] ? itm["userDetails"][ucol] : " ");
        cl2++;
      });
      row3++;
    });
  
    return wb;
  };
module.exports.generateExcelLog = generateExcelLog;

let quizLogAnalysis = async (quizId) => {
    let data = await getLogJSON(quizId);
    let studentData = analyzeLogs(data);
    let attendancedata = AttendanceSheet(studentData, data);
    let exrec = generateExcelLog(studentData, attendancedata, data);
    // console.log(exrec)
    return exrec
    // console.log(JSON.stringify(exrec,null,2))
}
module.exports.quizLogAnalysis = quizLogAnalysis;