//========================================================================
//                          Libraries
//========================================================================

var express = require('express')
var publicRouter = express.Router()
var privateRouter = express.Router()
var adminRouter = express.Router()
var competitiondb = require('../../models/competition')
var query = require('../../helper/query-helper')
var validator = require('validator')
var async = require('async')
var ObjectId = require('mongoose').Types.ObjectId
var logger = require('../../config/logger').mainLogger
const multer = require('multer');
const path = require('path')
const mkdirp = require('mkdirp');
const jsonfile = require('jsonfile');
const auth = require('../../helper/authLevels')
const fs = require('fs')
const mime = require('mime')
const filetype = require('file-type')
const ACCESSLEVELS = require('../../models/user').ACCESSLEVELS
var crypto = require('crypto');
const glob = require("glob");
const ffmpeg = require('fluent-ffmpeg');
const { time } = require('console')
const LEAGUES_JSON = competitiondb.LEAGUES_JSON;

const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const N=32

publicRouter.get('/answer/:teamId/:token', function (req, res, next) {
    const teamId = req.params.teamId;
    const token = req.params.token;
    
    if (!ObjectId.isValid(teamId)) {
        return next()
    }

    competitiondb.team.findById(teamId)
    .populate("competition")
    .select("competition document.answers document.token document.enabled")
    .exec(function (err, dbTeam) {
            if (err || dbTeam == null) {
                if(!err) err = {message: 'No team found'};
                res.status(400).send({
                    msg: "Could not get team",
                    err: err.message
                })
            } else if (dbTeam) {
                if(dbTeam.document.token == token){
                    if(dbTeam.competition.documents.enable && dbTeam.document.enabled){
                        res.send(dbTeam.document.answers);
                    }else{
                        res.status(401).send({
                            msg: "Operation not permited"
                        })
                    }
                }
                else {
                    res.status(401).send({
                        msg: "Auth error"
                    })
                }
            }
        }
    )
})

publicRouter.put('/answer/:teamId/:token', function (req, res, next) {
    const teamId = req.params.teamId;
    const token = req.params.token;
    const answer = req.body;
    
    if (!ObjectId.isValid(teamId)) {
        return next()
    }

    competitiondb.team.findById(teamId)
    .populate('competition')
    .select("competition document.answers document.token document.deadline document.enabled")
    .exec(function (err, dbTeam) {
            if (err || dbTeam == null) {
                if(!err) err = {message: 'No team found'};
                res.status(400).send({
                    msg: "Could not get team",
                    err: err.message
                })
            } else if (dbTeam) {
                if(dbTeam.document.token == token){
                    if(dbTeam.competition.documents.enable && dbTeam.document.enabled){
                        let teamDeadline = dbTeam.document.deadline;
                        let deadline = dbTeam.competition.documents.deadline;
                        if(teamDeadline != null) deadline = teamDeadline;

                        let now = new Date();
                        let timestamp = Math.floor(now.getTime()/1000);

                        if(deadline >= timestamp){
                            dbTeam.document.answers = answer;
                            dbTeam.save(function (err) {
                                if (err) {
                                    logger.error(err)
                                    return res.status(400).send({
                                        err: err.message,
                                        msg: "Could not save changes"
                                    })
                                } else {
                                    return res.status(200).send({
                                        msg: "Saved changes"
                                    })
                                }
                            })
                        }else{
                            res.status(400).send({
                                msg: "The deadline has passed."
                            })
                        }
                    }else{
                        res.status(401).send({
                            msg: "Operation not permited"
                        })
                    }
                    
                }
                else {
                    res.status(401).send({
                        msg: "Auth error"
                    })
                }
            }
        }
    )
})

publicRouter.post('/files/:teamId/:token/:fileName', function (req, res, next) {
    const teamId = req.params.teamId;
    const token = req.params.token;
    const fileName = req.params.fileName;
    
    if (!ObjectId.isValid(teamId)) {
        return next()
    }

    competitiondb.team.findById(teamId)
    .populate('competition')
    .select("competition document.token document.deadline document.enabled")
    .exec(function (err, dbTeam) {
            if (err || dbTeam == null) {
                if(!err) err = {message: 'No team found'};
                res.status(400).send({
                    msg: "Could not get team",
                    err: err.message
                })
            } else if (dbTeam) {
                if(dbTeam.document.token == token){
                    if(dbTeam.competition.documents.enable && dbTeam.document.enabled){
                        let teamDeadline = dbTeam.document.deadline;
                        let deadline = dbTeam.competition.documents.deadline;
                        if(teamDeadline != null) deadline = teamDeadline;

                        let now = new Date();
                        let timestamp = Math.floor(now.getTime()/1000);

                        if(deadline >= timestamp){
                            glob.glob(__dirname + "/../../documents/" + dbTeam.competition._id + "/" + teamId + "/" + fileName + '.*', function (er, files) {
                                let i = files.length;
                                if(i == 0){
                                    upload_process();
                                    return;
                                }
                                fs.mkdir(__dirname + "/../../documents/" + dbTeam.competition._id + "/" + teamId + "/trash", (err) => {
                                    files.forEach(function(file){
                                        fs.rename(file, path.dirname(file) + '/trash/' + (new Date().getTime())/1000  + path.extname(file), function (err) {
                                            if(err) logger.error(err.message);
                                            i--;
                                            if(i <= 0){
                                                upload_process();
                                                return;
                                            }
                                        });
                                    });
                                });
                                

                                function upload_process(){
                                    let originalname = '';
                                    var storage = multer.diskStorage({
                                        destination: function (req, file, callback) {
                                            callback(null, __dirname + "/../../documents/" + dbTeam.competition._id + "/" + teamId)
                                        },
                                        filename: function (req, file, callback) {
                                            originalname = file.originalname;
                                            callback(null, fileName + path.extname(originalname))
                                            
                                        }
                                    })
                
                                    var upload = multer({
                                        storage: storage
                                    }).single('file')
                
                                    upload(req, res, function (err) {
                                        res.status(200).send({
                                            msg: 'File is uploaded'
                                        })
                                        const ft = mime.getType(originalname);
                                        
                                        if(ft.includes('video')){
                                            const filepath = __dirname + "/../../documents/" + dbTeam.competition._id + "/" + teamId + "/" + fileName;
                                            fs.unlink(filepath + '-thumbnail.png', function(err){
                                                try{
                                                    const original = ffmpeg(filepath + path.extname(originalname));
                                                
                                                    original.screenshots({
                                                        count: 1,
                                                        folder: __dirname + "/../../documents/" + dbTeam.competition._id + "/" + teamId,
                                                        filename: fileName + '-thumbnail.png',
                                                        size: '640x?'
                                                    }).on('error', function(err) {
                                                        console.log('an error happened: ' + err.message);
                                                    });
                                                    
                                                    if(ft != "video/mp4"){
                                                        original.output(filepath + '.mp4').on('error', function(err) {
                                                            console.log('an error happened: ' + err.message);
                                                        });
                                                    }
                                                }catch(err){

                                                }
                                                
                                            });
                                        }

                                        fs.rmdir(__dirname + "/../../documents/" + dbTeam.competition._id + "/" + teamId + "/trash", { recursive: true },(err) => {
                                            if(err) logger.error(err.message);
                                        });
                                    })
                                }

                            });

                            
                        }else{
                            res.status(400).send({
                                msg: "The deadline has passed."
                            })
                        }
                    }else{
                        res.status(401).send({
                            msg: "Operation not permited"
                        })
                    }
                    
                    
                }
                else {
                    res.status(401).send({
                        msg: "Auth error"
                    })
                }
            }
        }
    )
})

publicRouter.get('/files/:teamId/:token', function (req, res, next) {
    const teamId = req.params.teamId;
    const token = req.params.token;
    
    if (!ObjectId.isValid(teamId)) {
        return next()
    }

    competitiondb.team.findById(teamId)
    .populate("competition")
    .select("competition document.token document.enabled")
    .exec(function (err, dbTeam) {
            if (err || dbTeam == null) {
                if(!err) err = {message: 'No team found'};
                res.status(400).send({
                    msg: "Could not get team",
                    err: err.message
                })
            } else if (dbTeam) {
                if(dbTeam.document.token == token){
                    if(dbTeam.competition.documents.enable && dbTeam.document.enabled){
                        let path = __dirname + "/../../documents/" + dbTeam.competition._id + "/" + teamId;
                        fs.readdir(path, {withFileTypes: true}, (err, dirents) => {
                            if (err) {
                                console.error(err);
                                return;
                            }

                            let d = [];
                            for (const dirent of dirents) {
                                if (!dirent.isDirectory()) {
                                    d.push(dirent.name);
                                }
                            }
                            res.send(d);
                        });
                    }else{
                        res.status(401).send({
                            msg: "Operation not permited"
                        })
                    }
                }
                else {
                    res.status(401).send({
                        msg: "Auth error"
                    })
                }
            }
        }
    )
})

publicRouter.get('/files/:teamId/:token/:fileName', function (req, res, next) {
    const teamId = req.params.teamId;
    const token = req.params.token;
    const fileName = req.params.fileName;
    
    if (!ObjectId.isValid(teamId)) {
        return next()
    }

    competitiondb.team.findById(teamId)
    .populate("competition")
    .select("competition document.token document.enabled")
    .exec(function (err, dbTeam) {
            if (err || dbTeam == null) {
                if(!err) err = {message: 'No team found'};
                res.status(400).send({
                    msg: "Could not get team",
                    err: err.message
                })
            } else if (dbTeam) {
                if(dbTeam.document.token == token){
                    if(dbTeam.competition.documents.enable && dbTeam.document.enabled){
                        let path = __dirname + "/../../documents/" + dbTeam.competition._id + "/" + teamId + '/' + fileName;
                        fs.stat(path, (err, stat) => {

                            // Handle file not found
                            if (err !== null && err.code === 'ENOENT') {
                                res.status(404).send({
                                    msg: "File not found"
                                })
                                return;
                            }

                            // Streaming Video
                            if(mime.getType(path).includes('video')){
                                try{
                                    const fileSize = stat.size
                                    const range = req.headers.range
                                
                                    if (range) {
                                
                                        const parts = range.replace(/bytes=/, "").split("-");
                                
                                        const start = parseInt(parts[0], 10);
                                        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                                        
                                        const chunksize = (end-start)+1;
                                        const file = fs.createReadStream(path, {start, end});
                                        file.on('error', function(err) {
                                            logger.error(err.message);
                                        });
                                        const head = {
                                            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                                            'Accept-Ranges': 'bytes',
                                            'Content-Length': chunksize,
                                            'Content-Type': mime.getType(path),
                                        }
                                        
                                        res.writeHead(206, head);
                                        file.pipe(res);
                                        return;
                                    } else {
                                        const head = {
                                            'Content-Length': fileSize,
                                            'Content-Type': mime.getType(path),
                                        }
                                
                                        res.writeHead(200, head);
                                        fs.createReadStream(path).pipe(res);
                                        return;
                                    }
                                }catch(err){
                                    logger.error(err.message);
                                }
                                
                            }else{
                                fs.readFile(path, function (err, data) {
                                    res.writeHead(200, {
                                        'Content-Type': mime.getType(path)
                                    });
                                    res.end(data);
                                });
                            }
                        });
                    }else{
                        res.status(401).send({
                            msg: "Operation not permited"
                        })
                    }
                    
                }
                else {
                    res.status(401).send({
                        msg: "Auth error"
                    })
                }
            }
        }
    )
})


publicRouter.all('*', function (req, res, next) {
    next()
})
privateRouter.all('*', function (req, res, next) {
    next()
})

module.exports.public = publicRouter
module.exports.private = privateRouter
module.exports.admin = adminRouter
