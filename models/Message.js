const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String },
  text: { type: String, required: true },
  topicId : {type: String},
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
