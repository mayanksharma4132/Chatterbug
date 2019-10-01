var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	sender: String,
	recevier: String
});
module.exports = mongoose.model('uid', userSchema);