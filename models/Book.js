var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
  userId: String,
  volumeId: String,
  rating: Number
});

module.exports = mongoose.model('Books', BookSchema);

