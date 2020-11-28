const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const logger = require('../config/logger').mainLogger


const mailSchema = new Schema({
  competition: {type: ObjectId, ref: 'Competition'},
  team: {type: ObjectId, ref: 'Team'},
  mailId: {type: String},
  messageId: {type: String},
  time: {type: Number},
  to: [{type: String}],
  subject: {type: String},
  html: {type: String, select: false},
  plain: {type: String, select: false},
  status: {type: Number},
  events: {
    type: new Schema([{
      time: {type: Number},
      event: {type: String},
      user: {type: String}
    }]),
    default: [],
    select: false
  },
  replacedURL: {
    type: new Schema([{
      token: {type: String},
      url: {type: String}
    }]),
    default: [],
    select: false
  }
})


const mail = mongoose.model('mail', mailSchema)


/** Mongoose model {@link http://mongoosejs.com/docs/models.html} */
module.exports.mail = mail