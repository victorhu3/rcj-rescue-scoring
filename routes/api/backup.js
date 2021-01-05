//= =======================================================================
//                          Libraries
//= =======================================================================

const express = require('express');

const adminRouter = express.Router();
const validator = require('validator');
const async = require('async');
const multer = require('multer');
const fs = require('fs-extra');
const archiver = require('archiver');
const extract = require('extract-zip');
const rimraf = require('rimraf');
const chmodr = require('chmodr');
const competitiondb = require('../../models/competition');
const lineMapDb = require('../../models/lineMap');
const lineRunDb = require('../../models/lineRun');
const mazeMapDb = require('../../models/mazeMap');
const mazeRunDb = require('../../models/mazeRun');
const documentDb = require('../../models/document');
const mailDb = require('../../models/mail');

const query = require('../../helper/query-helper');
const logger = require('../../config/logger').mainLogger;
const auth = require('../../helper/authLevels');

const { LINE_LEAGUES } = competitiondb;
const { MAZE_LEAGUES } = competitiondb;
const { LEAGUES } = competitiondb;

const { ACCESSLEVELS } = require('../../models/user');

const base_tmp_path = `${__dirname}/../../tmp/`;

adminRouter.get('/:competition', function (req, res) {
  const id = req.params.competition;
  const folder = Math.random().toString(32).substring(2);
  fs.mkdirsSync(base_tmp_path + folder);

  if (!auth.authCompetition(req.user, id, ACCESSLEVELS.ADMIN)) {
    return res.status(401).send({
      msg: 'You have no authority to access this api',
    });
  }

  fs.writeFileSync(
    `${base_tmp_path + folder}/version.json`,
    JSON.stringify({ version: 21 })
  );

  let outputCount = 0;
  let compName = '';

  // Copy Document Folder
  fs.copySync(
    `${__dirname}/../../documents/${id}`,
    `${base_tmp_path}${folder}/documents/${id}`
  );

  // Competition
  competitiondb.competition
    .find({
      _id: id,
    })
    .lean()
    .exec(function (err, data) {
      if (err) {
        logger.error(err);
        res.status(400).send({
          msg: 'Could not get competitions',
          err: err.message,
        });
      } else {
        compName = data[0].name;
        fs.writeFileSync(
          `${base_tmp_path + folder}/competition.json`,
          JSON.stringify(data)
        );
        outputCount++;

        // Team
        competitiondb.team
          .find({
            competition: id,
          })
          .select(
            'competition name league inspected docPublic country checkin teamCode email document'
          )
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get a competition',
                err: err.message,
              });
            } else {
              fs.writeFileSync(
                `${base_tmp_path + folder}/team.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });

        // Round
        competitiondb.round
          .find({
            competition: id,
          })
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get rounds',
                err: err.message,
              });
            } else {
              fs.writeFileSync(
                `${base_tmp_path + folder}/round.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });

        // Field
        competitiondb.field
          .find({
            competition: id,
          })
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get fields',
                err: err.message,
              });
            } else {
              fs.writeFileSync(
                `${base_tmp_path + folder}/field.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });

        // LineMap
        lineMapDb.lineMap
          .find({
            competition: id,
          })
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get fields',
                err: err.message,
              });
            } else {
              fs.writeFileSync(
                `${base_tmp_path + folder}/lineMap.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });

        // MazeMap
        mazeMapDb.mazeMap
          .find({
            competition: id,
          })
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get fields',
                err: err.message,
              });
            } else {
              fs.writeFileSync(
                `${base_tmp_path + folder}/mazeMap.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });

        // LineRuns
        lineRunDb.lineRun
          .find({
            competition: id,
          })
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get fields',
                err: err.message,
              });
            } else {
              fs.writeFileSync(
                `${base_tmp_path + folder}/lineRun.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });

        // MazeRuns
        mazeRunDb.mazeRun
          .find({
            competition: id,
          })
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get fields',
                err: err.message,
              });
            } else {
              fs.writeFileSync(
                `${base_tmp_path + folder}/mazeRun.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });

        // Reviews
        documentDb.review
          .find({
            competition: id,
          })
          .populate('reviewer', 'username')
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get fields',
                err: err.message,
              });
            } else {
              for (const r of data) {
                (r.name = r.reviewer.username), (r.reviewer = r.reviewer._id);
              }
              fs.writeFileSync(
                `${base_tmp_path + folder}/document.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });

        // Mails
        mailDb.mail
          .find({
            competition: id,
          })
          .select(
            'competition team mailId messageId time to subject html plain status events replacedURL'
          )
          .lean()
          .exec(function (err, data) {
            if (err) {
              logger.error(err);
              res.status(400).send({
                msg: 'Could not get fields',
                err: err.message,
              });
            } else {
              fs.writeFileSync(
                `${base_tmp_path + folder}/mail.json`,
                JSON.stringify(data)
              );
              outputCount++;
              if (outputCount == 10) makeZip(res, folder, compName);
            }
          });
      }
    });
});

function makeZip(res, folder, compName) {
  const output = fs.createWriteStream(`${base_tmp_path + folder}.zip`);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });

  output.on('close', function () {
    res.download(
      `${base_tmp_path + folder}.zip`,
      `${compName}.rcjs`,
      function (err) {
        if (err) {
          logger.error(err.status);
          return;
        }
        rimraf(base_tmp_path + folder, function (err) {});
        fs.unlink(`${base_tmp_path + folder}.zip`, function (err) {});
      }
    );
  });

  archive.pipe(output);
  archive.directory(base_tmp_path + folder, false);
  archive.finalize();
}

adminRouter.post('/restore', function (req, res) {
  const folder = Math.random().toString(32).substring(2);
  fs.mkdirsSync(`${base_tmp_path}uploads/`);

  const filePath = `${base_tmp_path}uploads/${folder}.zip`;

  const storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, `${base_tmp_path}uploads/`);
    },
    filename(req, file, callback) {
      callback(null, `${folder}.zip`);
    },
  });

  const upload = multer({
    storage,
  }).single('rcjs');

  upload(req, res, function (err) {
    extract(
      filePath,
      { dir: `${base_tmp_path}uploads/${folder}` },
      function (err) {
        try {
          const version = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/version.json`,
              'utf8'
            )
          );
          if (version.version != 21) {
            rimraf(`${base_tmp_path}uploads/${folder}`, function (err) {});
            fs.unlink(filePath, function (err) {});
            res.status(500).send({ msg: 'Version not match' });
            return;
          }
          const updated = 0;
          // Competition
          const competition = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/competition.json`,
              'utf8'
            )
          );
          competitiondb.competition.updateOne(
            { _id: competition[0]._id },
            competition[0],
            { upsert: true },
            function (err) {
              if (err) {
                logger.error(err);
              } else {
              }
            }
          );

          // Team
          const team = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/team.json`,
              'utf8'
            )
          );
          for (const i in team) {
            competitiondb.team.updateOne(
              { _id: team[i]._id },
              team[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // Round
          const round = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/round.json`,
              'utf8'
            )
          );
          for (const i in round) {
            competitiondb.round.updateOne(
              { _id: round[i]._id },
              round[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // Field
          const field = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/field.json`,
              'utf8'
            )
          );
          for (const i in field) {
            competitiondb.field.updateOne(
              { _id: field[i]._id },
              field[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // LineMap
          const lineMap = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/lineMap.json`,
              'utf8'
            )
          );
          for (const i in lineMap) {
            lineMapDb.lineMap.updateOne(
              { _id: lineMap[i]._id },
              lineMap[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // LineRun
          const lineRun = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/lineRun.json`,
              'utf8'
            )
          );
          for (const i in lineRun) {
            lineRunDb.lineRun.updateOne(
              { _id: lineRun[i]._id },
              lineRun[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // MazeMap
          const mazeMap = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/mazeMap.json`,
              'utf8'
            )
          );
          for (const i in mazeMap) {
            mazeMapDb.mazeMap.updateOne(
              { _id: mazeMap[i]._id },
              mazeMap[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // MazeRun
          const mazeRun = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/mazeRun.json`,
              'utf8'
            )
          );
          for (const i in mazeRun) {
            mazeRunDb.mazeRun.updateOne(
              { _id: mazeRun[i]._id },
              mazeRun[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // Document
          const document = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/document.json`,
              'utf8'
            )
          );
          for (const i in document) {
            documentDb.review.updateOne(
              { _id: document[i]._id },
              document[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // MailDb
          const mail = JSON.parse(
            fs.readFileSync(
              `${base_tmp_path}uploads/${folder}/mail.json`,
              'utf8'
            )
          );
          for (const i in mail) {
            mailDb.mail.updateOne(
              { _id: mail[i]._id },
              mail[i],
              { upsert: true },
              function (err) {
                if (err) {
                  logger.error(err);
                } else {
                }
              }
            );
          }

          // Copy Document Folder
          fs.copySync(
            `${base_tmp_path}uploads/${folder}/documents/${competition[0]._id}`,
            `${__dirname}/../../documents/${competition[0]._id}`
          );
          chmodr(
            `${__dirname}/../../documents/${competition[0]._id}`,
            0o777,
            (err) => {
              if (err) {
                logger.error('Failed to execute chmod', err);
              }
            }
          );

          rimraf(`${base_tmp_path}uploads/${folder}`, function (err) {});
          fs.unlink(filePath, function (err) {});

          res.redirect(`/admin/${competition[0]._id}`);
        } catch (e) {
          logger.error(e);
          res.status(500).send({ msg: 'Illegal file' });
        }
      }
    );
  });
});

adminRouter.all('*', function (req, res, next) {
  next();
});

module.exports.admin = adminRouter;
