//========================================================================
//                          Libraries
//========================================================================

const express = require('express')
const publicRouter = express.Router()
const privateRouter = express.Router()
const adminRouter = express.Router()
const query = require('../../helper/query-helper')
const validator = require('validator')
const ObjectId = require('mongoose').Types.ObjectId
const logger = require('../../config/logger').mainLogger
const pathL = require('path')
const auth = require('../../helper/authLevels')
const fs = require('fs')
const mime = require('mime')
const ACCESSLEVELS = require('../../models/user').ACCESSLEVELS
const nodemailer = require("nodemailer");
const { htmlToText } = require('html-to-text');

adminRouter.get('/templates', function (req, res, next) {
    let path = __dirname + "/../../mailTemplates/";
    fs.readdir(path, {withFileTypes: true}, (err, dirents) => {
        if (err) {
            console.error(err);
            return;
        }

        let d = [];
        for (const dirent of dirents) {
            if (!dirent.isDirectory()) {
                let tmp = {
                    "name": pathL.basename(dirent.name, '.html'),
                    "path": dirent.name
                };
                d.push(tmp);
            }
        }
        res.send(d);
    });
});

adminRouter.get('/templates/:fileName', function (req, res, next) {
    const fileName = req.params.fileName;
    
    let path = __dirname + "/../../mailTemplates/" + fileName;
    fs.stat(path, (err, stat) => {

        // Handle file not found
        if (err !== null && err.code === 'ENOENT') {
            res.status(404).send({
                msg: "File not found"
            })
            return;
        }

        fs.readFile(path, function (err, data) {
            res.writeHead(200, {
                'Content-Type': mime.getType(path)
            });
            res.end(data);
        });
    });
})

adminRouter.post('/send', function (req, res, next) {
    let teams = req.body;
    var smtp;
    if(process.env.MAIL_SMTP && process.env.MAIL_PORT && process.env.MAIL_USER && process.env.MAIL_PASS && process.env.MAIL_FROM){
        smtp = nodemailer.createTransport({
            host: process.env.MAIL_SMTP,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_PORT == 465,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
    }else{
        res.status(500).send({
            msg: "Please check smtp parameters"
        })
        return;
    }
    
    let count = 0;
    for(let team of teams){
        count += team.email.length;
    }
    let sent = false;

    for(let team of teams){
        const html = team.mailData.content.replace(/\r?\n/g,"").replace(/<p><br><\/p>/g,"<br>").replace(/<\/p><p>/g,"<br>");
        const text = htmlToText(html,{
            tags: { 'a': {options: {hideLinkHrefIfSameAsText: true}}}
        });
        for(let email of team.email){
            const message = {
                from: {
                    name: process.env.MAIL_SENDER || "RoboCupJunior CMS",
                    address: process.env.MAIL_FROM
                },
                to: email,
                subject: team.mailData.title,
                html: html,
                text: text
            };

            try{
                smtp.sendMail(message, function(error, info){
                    if(error){
                        logger.error(error.message);
                        if(!sent){
                            sent = true;
                            res.status(500).send({
                                msg: error.message
                            })
                        }
                    }else{
                        count--;
                        if(count <= 0 && !sent){
                            sent = true;
                            res.status(200).send({
                                msg: "Emails sent"
                            })
                        }
                        logger.info(info.messageId);
                    }
                                        
                });
            }catch(e) {
                if(!sent){
                    sent = true;
                    res.status(500).send({
                        msg: e
                    })
                }
                logger.error(e);
            }
        }
        
    }
    
})


publicRouter.all('*', function (req, res, next) {
    next()
})
privateRouter.all('*', function (req, res, next) {
    next()
})

module.exports.admin = adminRouter
