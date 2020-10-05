const staticObj = require('../config.js').merge_output;
const emeta =  staticObj.emailServerMeta;
const emailConfig = staticObj.emailServer;
emailConfig['meta'] = JSON.parse(JSON.stringify(emeta))

const mailgun = require('mailgun-js')({ apiKey: emailConfig.apiKey, domain: emailConfig.domain });
const nano = require('nano')(staticObj.couchdb);

const exdb = nano.db.use('examineer_metadata');
const authordb = nano.db.use('authors');

const fs = require('fs');
const ejs = require('ejs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

let sendEmailAsync = (data) => {
    data['from'] = emailConfig.from
    mailgun.messages().send(data)
        .then(msg => console.log(msg)) 
        .catch(err => console.log(err)); 
}

let checkAuthentication = (token) => {
    return new Promise((resolve, reject) => {
        if (token == emailConfig.authToken) {
            resolve()
        } else {
            reject(new Error("Forbidden"))
        }
    })
}

let composeEmail = async (template, data) => {
    return new Promise(function (resolve, reject) {
        let indexTemplate;
        data['meta'] = emailConfig.meta
        fs.readFile("./views/emailTemplates/index.ejs", 'utf8', function (error, indexcontent) {
            if (error) {
                reject(error);
            } else {
                indexTemplate = indexcontent;
                fs.readFile("./views/emailTemplates/" + template + ".ejs", 'utf8', function (error, response) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        var html = indexTemplate.replace('####content####', response)
                        var html_content = ejs.render(html, data);
                        resolve(html_content);
                        // now include the common styling
                    }
                });
            }
        });
    });
}

generateQuizTakersEmail = (options) => {
    return new Promise((resolve, reject) => {
        exdb.get(options.quizId)
            .then(async doc => {
                if (doc.users.sendEmail) {
                    console.log(doc.author)
                    let authoremail;
                    let authoremaildb = await authordb.view("ByShortName", "authorToAllEmails", { key: doc.author })
                    if (authoremaildb.rows[0].value) {
                        let a = authoremaildb.rows[0].value
                        authoremail = a[1];
                        if (authoremaildb.length > 2) {
                            if (a[2] != null) {
                                authoremail = authoremaildb[2];
                            }
                        }
                    }

                    let authorname;
                    let authornamedb = await authordb.view("ByShortName", "fullName", { key: doc.author })
                    authorname = authornamedb.rows[0].value;

                    let quizData = {
                        id: doc._id,
                        instruction: doc.instruction,
                        beginTime: doc.beginTime,
                        endTime: doc.endTime,
                        duration: doc.duration,
                        title: doc.title,
                        authorName: authorname,
                        authorEmail: authoremail
                    }
                    if (options.addInstr) {
                        quizData.addInstr = options.addInstr
                    }

                    if (options.users) {
                        // send only to specific users , array must be validated
                    } else {
                        //send to all the users
                        let allUsers = Object.keys(doc.credentials);
                        let emailCol = doc.users.emailCol;
                        let resolvedFinalArray = await Promise.all(allUsers.map(async (itm) => { // map instead of forEach
                            let userData = {
                                password: doc.credentials[itm],
                                username: itm
                            }
                            if (doc.users.userData[itm]) {
                                let email = doc.users.userData[itm][emailCol]
                                let html = await composeEmail("takerEmail", { user: userData, quiz: quizData })
                                let emailObj = {
                                    to: [email],
                                    subject: "Quiz credentials",
                                    html: html
                                }
                                return emailObj;
                            }
                        }));
                        resolve(resolvedFinalArray)
                    }
                } else {
                    reject(new Error("user.sendEmail option not set"))
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}

generateSingleQuizSummaryEmail = (options) => {
    return new Promise(async (resolve, reject) => {
        let html = await composeEmail("summaryAttached", { quizId: options.quizId });
        var buf =  Buffer.from(options.summary_file, 'base64');
        let attachmentA = new mailgun.Attachment({ data: buf, filename: `${options.quizId}.pdf`, contentType: "application/pdf", knownLength: buf.length });
        let envelope = {
            to: [options.email],
            subject: "Performance Summary of the quiz " + options.quizId,
            html: html,
            attachment: [attachmentA]
        }
        resolve([envelope])
    })
}

let generatePerformanceSummaryEmail = (options) => {
    // to generate performance summary email 
}

mailSender = async (options) => {
    let envelopes;
    if (options.type == 'quizTaker') {
        envelopes = await generateQuizTakersEmail(options)
    } else if (options.type == 'summaryToTaker') {
        envelopes = await generateSingleQuizSummaryEmail(options)
    } else if (options.type == 'performance') {
        envelopes = await generatePerformanceSummaryEmail(options)
    }
    envelopes.map(itm => {
        if (itm) {
            sendEmailAsync(itm)
        }
    })
}



let reqHandler = function (req, res, next) {
    let type = req.params.emailtype;
    checkAuthentication(req.body.token)
        .then(() => {
            req.body.type = type;
            return mailSender(req.body)
        })
        .then(() => {
            res.json({ "message": "Mails will be sent" })
        })
        .catch(err => {
            res.send(err)
        })
}
module.exports.reqHandler = reqHandler

let reqHandlerAuthor = function (req, res, next) {
    let type = req.params.emailtype;
    req.body.type = type;
    return mailSender(req.body)

        .then(() => {
            res.json({ "message": "Mails will be sent" })
        })
        .catch(err => {
            res.send(err)
        })
}
module.exports.reqHandlerAuthor = reqHandlerAuthor