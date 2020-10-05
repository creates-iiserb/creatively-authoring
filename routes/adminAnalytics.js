var staticObj = require('../config.js').merge_output;
var couchdb = require('nano')(staticObj.couchdb);
var global_db = couchdb.use(staticObj.global_db);
var author_db = couchdb.use(staticObj.db_authors);
var quizmeta_db = couchdb.use(staticObj.db_examineer_metadata);
//get analytics page
exports.adminAnalyticsPage = async (req, res) => {
    var shortName = req.headers.x_myapp_whoami;
    var userMeta = req.userMeta;
    let adminGlobal = await global_db.get("author_admin");
    res.render('admin/adminAnalytics', { adminGlobal: adminGlobal , short: shortName, userMeta: userMeta, tooltip: tooltip, copyright: globaldata });
}

//get analytics data
exports.adminAnalyticsData = async (req, res) => {
    let input = {
        module: req.body.module,
        features: req.body.features,
        data: req.body.data
    }
    
    let data = await fetchData(input)
    res.json({ data: data, generatedOn: new Date() ,heading : input.module, status:"success"})
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
    let mst = (d.getUTCMonth() + 1) <= 9 ? "0"+(d.getUTCMonth() + 1):(d.getUTCMonth() + 1);
    let dst = d.getUTCDate() <= 9 ? "0"+d.getUTCDate():d.getUTCDate()
    let dayR = d.getUTCFullYear() + "-" + mst + "-" + dst
    var n = d.toUTCString();
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

let fetchData = (input) => {
    let modules = {
        "author": async (features, input) => {
            try {
                let data = await author_db.view("getUserData", "getAuthorData")
                // console.log(data)
                let customRange = calEvents.currentMonth()
                let allFeatures = []
                let summary = {}
                let loginDates = {}
                let signUpDate = {}
                data.rows.map(itm => {
                    let record = itm["value"]

                    // feature - summary
                    if (!summary[record['accStatus']]) {
                        summary[record['accStatus']] = 1
                    } else { summary[record['accStatus']]++; }

                    // feature - last login count 
                    if (record['lastLogin']) {
                        let lastLoginDate = convertToDate(record['lastLogin'])
                        if (!loginDates[lastLoginDate]) {
                            loginDates[lastLoginDate] = 1
                        } else { loginDates[lastLoginDate]++; }
                    }

                    // feature - createdOn
                    let createdLoginDate = convertToDate(record['createdOn'])
                    if (!signUpDate[createdLoginDate]) {
                        signUpDate[createdLoginDate] = 1
                    } else { signUpDate[createdLoginDate]++; }
                })

                allFeatures.push({
                    plotType: "pie",
                    feature: "summary",
                    module: "author",
                    data: catValObj(summary),
                    title: "Author status summary"
                })
                allFeatures.push({
                    plotType: "heatmap",
                    feature: "lastLogin",
                    module: "author",
                    data: loginDates,
                    title: "Author activity (last login count)"
                })
                allFeatures.push({
                    title: "Author sign up ",
                    plotType: "heatmap",
                    feature: "signUp",
                    module: "author",
                    data: signUpDate,
                })

                return allFeatures 
            } catch (error) {
                throw error
            }
        },
        "quiz": async (features, input) => {
            try {
                
                let data = await quizmeta_db.view("byQuiz", "quizIdToMetaData")

                let allFeatures = []
                let summary = {}
                let secSummary = {}
                let createdOnDateObj = {}
                let validityDateObj = {}
                // let takerCountObj = {}
                let takerCount = []
                let duraArray = []
                let queCount = []
                data.rows.map(itm => {
                    let record = itm["value"]

                    // feature - summary
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

                    // feature - validity
                    let validOnDate = convertToDate(record['validUpto'])
                    if (!validityDateObj[validOnDate]) {
                        validityDateObj[validOnDate] = 1
                    } else { validityDateObj[validOnDate]++; }

                    // feature - takers
                    takerCount.push(record['takers'])
                   
                    if (record['duration'] != "Not Applicable") {
                        duraArray.push(record['duration'])
                    }
                    queCount.push(record["nQue"])
                })

                allFeatures.push({
                    plotType: "pie",
                    feature: "quizType",
                    module: "quiz",
                    data: catValObj(summary),
                    title: "Quiz type summary"
                })

                allFeatures.push({
                    plotType: "barchart",
                    feature: "sectionCount",
                    module: "quiz",
                    data: catValObj(secSummary),
                    title: "No. of sections in a quiz"
                })

                allFeatures.push({
                    plotType: "histogram",
                    feature: "takersCount",
                    module: "quiz",
                    data: takerCount,
                    title: "No. of takers in a quiz"
                })

                allFeatures.push({
                    plotType: "histogram",
                    feature: "durationCount",
                    module: "quiz",
                    data: duraArray,
                    title: "Quiz duration (in minutes,when set)"
                })


                allFeatures.push({
                    plotType: "histogram",
                    feature: "questionCount",
                    module: "quiz",
                    data: duraArray,
                    title: "Quiz wise question count"
                })

                allFeatures.push({
                    plotType: "heatmap",
                    feature: "quizCreation",
                    module: "quiz",
                    data: createdOnDateObj,
                    title: "Quiz creation"
                })

                allFeatures.push({
                    plotType: "heatmap",
                    feature: "quizValidity",
                    module: "quiz",
                    data: validityDateObj,
                    title: "Quiz validity"
                })

                return  allFeatures 
            } catch (error) {
                throw error
            }
        }
    }
    try {
        return modules[input['module']](input['features'], input['data'])
    } catch (error) {
        return error
    }

}