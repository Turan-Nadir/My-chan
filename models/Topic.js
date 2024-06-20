const mongoose = require('mongoose');

const Topic = new mongoose.Schema({
  topic: String,
  created_at : {type: Date, default : Date.now}
});

module.exports= mongoose.model('Topic', Topic);
