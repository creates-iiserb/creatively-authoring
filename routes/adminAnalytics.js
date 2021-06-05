var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var global_db = couchdb.use(staticObj.global_db);
var author_db = couchdb.use(staticObj.db_authors);
var quizmeta_db = couchdb.use(staticObj.db_examineer_metadata);
var resp_db = couchdb.use(staticObj.db_examineer_response);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//get analytics page
exports.adminAnalyticsPage = async (req, res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;

    res.render('admin/adminAnalytics', { short: shortName, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
}

exports.adminAnalyticsPageData = async (req, res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;

    let adminGlobal = await global_db.get("author_admin");
    res.json({ status: "success", adminGlobal: adminGlobal })

}

exports.adminAnalyticsDomain = async (req, res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;

    let domians = await getAuthorsByDomain()
    // return {domians:Object.keys(domians.count)}

    res.json({ status: "success" })
}

let getAuthorsByDomain = async (domain = []) => {

    let dbdata = await author_db.view("getUserData", "getAuthorData")
    let count = {}
    let details = {}
    dbdata.rows.map(itm => {
        if (!count[itm.value["domain"]]) {
            count[itm.value["domain"]] = 1
        } else { count[itm.value["domain"]]++ }

        if (!details[itm.value["domain"]]) { details[itm.value["domain"]] = [] }
        details[itm.value["domain"]].push(itm.value["id"])
    })
    if (domain.length == 0) {
        return { count: count, details: details }
    } else {
        let users = []
        domain.map(itm => {
            if (details[itm]) {
                let domainAuthors = details[itm]
                users = users.concat(domainAuthors)
            }
        })
        return users
    }
}
// getAuthorsByDomain(["gmail.com"]).then(data=>{console.log(data)})

exports.adminAnalyticsDomain = async (req, res) => {

    let domians = await getAuthorsByDomain()
    // return {domians:Object.keys(domians.count)}

    res.json({ status: "success", domians: Object.keys(domians.count) })
}

//get analytics data
exports.adminAnalyticsData = async (req, res) => {
    let input = {
        module: req.body.module,
        features: req.body.features,
        data: req.body.data
    }

    let data = await fetchData(input)
    res.json({ data: data, generatedOn: new Date(), heading: input.module, status: "success" })
}


let calEvents = {
    currentMonth: () => {
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return { start: firstDay, end: lastDay }
    },
    last6Months: () => {

    }
}

let convertToDate = (utcDateString) => {
    //console.log("db = ", utcDateString)
    var d = new Date(utcDateString);
    let mst = (d.getUTCMonth() + 1) <= 9 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1);
    let dst = d.getUTCDate() <= 9 ? "0" + d.getUTCDate() : d.getUTCDate()
    let dayR = d.getUTCFullYear() + "-" + mst + "-" + dst
    var n = d.toUTCString();
    return dayR
    
}

let convertToUNIXDate = (utcDateString) => {
    var d = new Date(utcDateString);
    return Math.round(d.getTime() / 1000)
}

let getDateMulitFormat = (utcDateString) => {
    var d = new Date(utcDateString);
    let mst = (d.getUTCMonth() + 1) <= 9 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1);
    let dst = d.getUTCDate() <= 9 ? "0" + d.getUTCDate() : d.getUTCDate()
    let dayR = d.getUTCFullYear() + "-" + mst + "-" + dst
    var n = Math.round(d.getTime() / 1000)
    //console.log(dayR)
    return { "utc": dayR, "ts": n }
}

let getDateinFormat = (utcTS) => {
    var d = new Date(utcTS);
    let mst = (d.getUTCMonth() + 1) <= 9 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1);
    let dst = d.getUTCDate() <= 9 ? "0" + d.getUTCDate() : d.getUTCDate()
    let dayR = d.getUTCFullYear() + "-" + mst + "-" + dst
    return dayR
}

let objToArray = (obj, field = "blankObj") => {
    let blankarr = []
    Object.keys(obj).map(ky => {
        let obj = {}
        if (field == "blankObj") {
            obj["value"] = obj[ky]
            blankarr.push(obj)
        } else if (field == "blank") {
            blankarr.push(obj[ky])
        } else {
            obj[field] = obj[ky]
            blankarr.push(obj)
        }
    })
    return blankarr
}

let catValObj = (obj) => {
    let blankarr = []
    Object.keys(obj).map(ky => {
        let obj1 = {}
        obj1["category"] = ky;
        obj1["value"] = obj[ky]
        blankarr.push(obj1)
    })
    return blankarr
}

let dateValObj = (obj) => {
    let blankarr = []
    Object.keys(obj).map(ky => {
        let obj1 = {}
        obj1["date"] = ky;
        obj1["value"] = obj[ky]
        blankarr.push(obj1)
    })
    return blankarr
}

let generateStats = (data) => {
    Results = {}
    Min = arr.reduce((min, i) => (min < i) ? min : i, arr[0])
    Max = arr.reduce((max, i) => (max > i) ? max : i, arr[0])
    Avg = parseFloat(((arr.reduce((sum, i) => sum + i, 0)) / arr.length).toFixed(2))
    Results["Min"] = Min
    Results["Max"] = Max
    Results["Avg"] = Avg
    return Results
}

let getDatesBetween = (start, end) => {
    // start , end - unix ts
    let dates = []
    //to avoid modifying the original date
    const theDate = new Date(start * 1000)
    let endDate = new Date(end * 1000)

    while (theDate < endDate) {
        dates = [...dates, getDateinFormat(new Date(theDate))]
        theDate.setDate(theDate.getDate() + 1)
    }
    dates = [...dates, getDateinFormat(endDate)]
    return dates
}


let getDiffinDays = (start,end) =>{
    const date1 = new Date(start*1000);
    const date2 = new Date(end*1000);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays
}

let  toDateKey = (dt)=>{
    // Mar 16 2020 4:34:58 UTC
    let parts  = dt.split(":")
    // return [parts[0],":",parts[1],":","00"].join("")
    return [parts[0],":00:00 UTC"].join("")
}

let fetchData = (input1) => {
    let modules = {
        "author": async (features, input) => {
            try {
                let data = await author_db.view("getUserData", "getAuthorData")
                let dt
                if (input.domain.length != 0) {
                    // filter data for selected domains
                    dt = data.rows.filter(it => { return input.domain.indexOf(it.value["domain"]) != -1 })
                } else {
                    dt = data.rows
                }
                // console.log(data)
                let customRange = calEvents.currentMonth()
                let allFeatures = []
                let summary = {}
                let loginDates = {}
                let signUpDate = {}
                let activity = {
                    active: 0,
                    inactive: 0,
                }
                let inactiveUsers = []

                if (!input.startDate) {
                    //  1 January 2018 00:00:00 GMT by default
                    input.startDate = 1451606400
                }

                if (!input.endDate) {
                    // current date by default
                    input.endDate = Math.floor(new Date().getTime() / 1000.0)
                }

                // console.log(JSON.stringify(dt,null,2))
                //console.log(input.startDate, input.endDate)
                dt.map(itm => {
                    let record = itm["value"]

                    let createddt = getDateMulitFormat(record['createdOn'])
                    //console.log(createddt)
                    if (input.startDate <= createddt.ts && createddt.ts <= input.endDate) {
                        //console.log("here")
                        if (!signUpDate[createddt.utc]) {
                            signUpDate[createddt.utc] = 1
                        } else { signUpDate[createddt.utc]++; }

                         // feature - summary
                        if (!summary[record['accStatus']]) {
                            summary[record['accStatus']] = 1
                        } else { summary[record['accStatus']]++; }

                    }

                    if (record['accStatus'] == "active") {
                        // feature - active count
                        // an author is active if the lastlogin timestamp is within the specified data range
                        if (record['lastLogin']) {
                            //console.log("login exists")
                            // let lastLoginDate = convertToDate(record['lastLogin'])
                            // if (!loginDates[lastLoginDate]) {
                            //     loginDates[lastLoginDate] = 1
                            // } else { loginDates[lastLoginDate]++; }
                            let unixLastLogin = convertToUNIXDate(record['lastLogin'])
                            //console.log(unixLastLogin)
                            if (input.startDate <= unixLastLogin && unixLastLogin <= input.endDate) {
                                // login date is in between the selected dates so the user was active withing this period
                                activity.active++
                                //console.log("activepp")
                            } else {
                                activity.inactive++
                                inactiveUsers.push({
                                    id: record["id"],
                                    email: record["email"],
                                    name: record["name"]?record["name"]:"NA",
                                    lastLogin : record["lastLogin"]
                                })
                                //console.log("inactive pp")
                            }
                        } else {
                            // if lastlogin filed does not exists , it means the author has not logged in since a very long time
                            activity.inactive++
                            inactiveUsers.push({
                                id: record["id"],
                                email: record["email"],
                                name: record["name"]?record["name"]:"NA",
                                lastLogin : "NA"
                            })
                        }
                    }
                })
                // allFeatures.push({
                //     plotType: "displayNumber",
                //     feature: "count",
                //     class: "col-lg-2",
                //     module: "author",
                //     data: dt.length,
                //     title: "Authors"
                // })

                let activeSumm = summary["active"]
                delete summary["active"]
                summary["approved"] = activeSumm

                allFeatures.push({
                    plotType: "pie",
                    feature: "summary",
                    module: "author",
                    data: catValObj(summary),
                    class: "col-lg-5",
                    classInner:" ht150",
                    title: "Total Registration",
                    help: " <b>unverified</b>:Users who have not verified their emails <br> <b>approved</b> : Users whose account were approved by admin  <br> <b>blocked</b> : users who were blocked by the admin  <br><b>pending</b> : users who have not been approved by the admin  "
                })

                allFeatures.push({
                    plotType: "pie",
                    feature: "activeSummary",
                    module: "author",
                    data: catValObj(activity),
                    class: "col-lg-5",
                    classInner:" ht150",
                    title: "Activity status",
                    help: "<b>active</b> indicates the number of users who logged in into their account within the selected duration "
                })

                allFeatures.push({
                    plotType: "modalTable",
                    feature: "inactiveUsers",
                    module: "author",
                    data: inactiveUsers,
                    class: " col-lg-2  ",
                    classInner:" ht150",
                    title: "Inactive users",
                    help: "List of inactive users"
                })

                allFeatures.push({
                    title: "Sign ups",
                    plotType: "barChartDate",
                    class: "col-lg-12 ",
                    classInner:" ht400",
                    feature: "signUp",
                    module: "author",
                    data: dateValObj(signUpDate),
                    help: "Date wise signup requests"
                })
                return allFeatures  // {  summary:summary,  , customRange: customRange }
            } catch (error) {
                throw error
            }
        },
        "quiz": async (features, input) => {
            try {
                // byQuiz/_view/quizIdToMetaData
                let data = await quizmeta_db.view("byQuiz", "quizIdToMetaData")

                // let data = await author_db.view("getUserData", "getAuthorData")
                let dt
                if (input.domain.length != 0) {
                    // filter data for selected domains
                    let domianAuthors = await getAuthorsByDomain(input.domain)
                    dt = data.rows.filter(it => { return domianAuthors.indexOf(it.value["author"]) != -1 })
                } else { dt = data.rows }
                // console.log(dt.length, data.rows.length)

                if (!input.startDate) {
                    //  1 January 2018 00:00:00 GMT by default
                    input.startDate = 1451606400
                }

                if (!input.endDate) {
                    // current date by default
                    input.endDate = Math.floor(new Date().getTime() / 1000.0)
                }

                let diffDuration = getDiffinDays(input.startDate,input.endDate)
                let maxDur = 120
                // console.log(diffDuration)
                let allFeatures = []
                let summary = {}
                let secSummary = {}
                let createdOnDateObj = {}
                // let takerCountObj = {}
                let takerCount = []
                let duraArray = []
                let queCount = []

                let quizCount = 0
                let quizStarting = {}
                let trafficEstimate = []
                //console.log(input.startDate)

                dt.map(itm => {
                    let record = itm["value"]
                    let createddt = getDateMulitFormat(record['createdOn'])
                    if ((input.startDate <= createddt.ts) && (createddt.ts <= input.endDate)) {
                        //  console.log("yes", input.startDate, createddt.ts, input.endDate)
                        quizCount++

                        if (!summary[record['quizType']]) {
                            summary[record['quizType']] = 1
                        } else { summary[record['quizType']]++; }

                        // feature - section count
                        if (record["quizType"] != "simple") {
                            if (!secSummary[record['nSections']]) {
                                secSummary[record['nSections']] = 1
                            } else { secSummary[record['nSections']]++; }
                        }

                        // feature - createdOn
                        let createdOnDate = convertToDate(record['createdOn'])
                        if (!createdOnDateObj[createdOnDate]) {
                            createdOnDateObj[createdOnDate] = 1
                        } else { createdOnDateObj[createdOnDate]++; }

                        // feature - takers
                        takerCount.push(record['takers'])
                        // if (!takerCountObj[record['takers']]) {
                        //     takerCountObj[record['takers']] = 1
                        // } else { takerCountObj[record['takers']]++; }

                        if (record['duration'] != "Not Applicable") {
                            duraArray.push(record['duration'])
                        }
                        queCount.push(record["nQue"])
                    }

                    if(diffDuration <= maxDur){

                        let quizStart = getDateMulitFormat(record['beginTime']).ts
                        let quizEnd = getDateMulitFormat(record['endTime']).ts
    
                        let activity = { from: "", to: "", quiz: itm["id"], takers: record["takers"] }
                        let toPush = false
    
                        // console.log(record)

                        if (input.endDate < quizStart) {
                            // do nothing as the quiz will start after the selected duration
                            //console.log("quiz yet to start  ") 
                        }
                        if (quizStart < input.startDate) {
                            //console.log("already started before startdate")
                            if (quizEnd <= input.startDate) {
                                // do nothing as the quiz has already ended 
                                //console.log("already ended")
                            } else if (quizEnd < input.endDate) {
                                // quiz is active only till the end date which is within the selected duration 
                                activity.from = input.startDate
                                activity.to = quizEnd
                                toPush = true
                            } else {
                                // the quiz will continue throughout the selected duration (or even after that)
                                // console.log("contine throught out")
                                activity.from = input.startDate
                                activity.to = input.endDate
                                toPush = true
                            }
                        } else if (input.startDate < quizStart) {
    
                            //console.log(record['beginTime']," - ",record['endTime'])
                            //console.log(quizStart,quizEnd)
    
                            //console.log("quiz start after start")
                            // the quiz will start someting withing the selected duration 
                            if (quizEnd < input.endDate) {
                                // quiz will end sometime in the selected duration 
                                activity.from = quizStart
                                activity.to = quizEnd
                                toPush = true
                            } else {
                                // quiz will end after the selected duration 
                                activity.from = quizStart
                                activity.to = input.endDate
                                toPush = true
                            }
                        }
                        if (toPush) { trafficEstimate.push(activity) }
                        // else{console.log("no push")}
                    }
                    
                })

                //console.log(trafficEstimate)
                let dateEstimates = {}
                trafficEstimate.map(est => {
                    let days = getDatesBetween(est.from, est.to)
                    days.map(day => {
                        if (!dateEstimates[day]) { dateEstimates[day] = { quiz: [], count: 0 } }
                        dateEstimates[day].quiz.push(est.quiz)
                        dateEstimates[day].count += est.takers
                    })
                })
                let de = []
                Object.keys(dateEstimates).map(itm=>{
                    de.push({date:itm,value:dateEstimates[itm]["count"], label:dateEstimates[itm]["quiz"].join(",")})
                })
                //console.log(dateEstimates)

                

                allFeatures.push({
                    plotType: "displayNumber",
                    feature: "count",
                    class: "col-lg-3",
                    classInner:" ht150",
                    module: "quiz",
                    data: quizCount,
                    title: "New Quizzes",
                    help: "This is the total number of quizzes that were created during the selected duration by authors from the selected domian"
                })


                let qType = {
                    "Async": summary["sectioned"],
                    "Sync": summary["live"]
                }
                if (summary["simple"]) {
                    qType["Async"] += summary["simple"]
                }

                allFeatures.push({
                    plotType: "pie",
                    class: "col-lg-5 ",
                    classInner:" ht150",
                    feature: "quizType",
                    module: "quiz",
                    help:"  ",
                    data: catValObj(qType),
                    title: "Quiz type",

                })

                allFeatures.push({
                    plotType: "pie",
                    class: "col-lg-4 ",
                    classInner:" ht150",
                    feature: "sectionCount",
                    module: "quiz",
                    data: catValObj(secSummary),
                    help:" Distribution of the total sections in the quizzes created within the selected duration",
                    title: "Sections"
                })

                allFeatures.push({
                    title: "Estimated traffic",
                    plotType: "lineChart",
                    class: "col-lg-12 ",
                    classInner:" ht400",
                    feature: "signUp",
                    module: "quiz",
                    data: de,
                    help: "Estimated incoming traffic on the quiz server is calculated by adding the total number of quiz takers in all active quizzes within the selected duration. For performance reasons , traffic estimate will be computed only if the selected duration is less than 120 days"
                })


                let logCounts = {}
                let logCountsDate = {}
                if(diffDuration <= maxDur){
                    let allQuiz = []
                    trafficEstimate.map(itm=>{allQuiz.push(itm["quiz"])})
                    let allLogs = await resp_db.view("forTokenDoc","quizIdToLog",{keys:allQuiz})
                    // let qlogs = await db_examineer_res.view('forTokenDoc', 'quizIdToLog', { key: quizId });
                    // console.log(allLogs)
                    allLogs.rows.map(itm=>{ 
                        itm["value"]["log"].map(lg=>{
                            let createddt = getDateMulitFormat(lg["timeStamp"])
                            if ((input.startDate <= createddt.ts) && (createddt.ts <= input.endDate)) {
                                // logCounts.push({date:lg["timeStamp"],value:1})
                                let dateKey = toDateKey(lg["timeStamp"])
                                if(!logCounts[dateKey]){logCounts[dateKey]=1}
                                else{logCounts[dateKey]++}

                                let dateKey1 = convertToDate(lg["timeStamp"])
                                if(!logCountsDate[dateKey1]){logCountsDate[dateKey1]=1}
                                else{logCountsDate[dateKey1]++}
                                


                            }
                        })
                    })

                    allFeatures.push({
                        title: "Student activity log (hour wise)",
                        plotType: "barChartDate",
                        class: "col-lg-12",
                        classInner:" ht400",
                        feature: "signUp",
                        module: "quiz",
                        data: dateValObj(logCounts),
                        help: "Incoming traffic on the quiz server is calculated by adding the total number of quiz activity logs of students in all active quizzes within the selected duration. For performance reasons , it will be computed only if the selected duration is less than 120 days"
                    })

                    allFeatures.push({
                        title: "Student activity log (date wise)",
                        plotType: "barChartDate",
                        class: "col-lg-12",
                        classInner:" ht400",
                        feature: "signUp",
                        module: "quiz",
                        data: dateValObj(logCountsDate),
                        help: "Incoming traffic on the quiz server is calculated by adding the total number of quiz activity logs of students in all active quizzes within the selected duration. For performance reasons , it will be computed only if the selected duration is less than 120 days"
                    })
            
                }
                return allFeatures
            } catch (error) {
                throw error
            }
        }
    }
    try {
        return modules[input1['module']](input1['features'], input1['data'])
    } catch (error) {
        return error
    }

}