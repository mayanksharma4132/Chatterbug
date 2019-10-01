var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	uid: String,
	sender: String,
	recevier: String,
	message: String
}, { timestamps: { createdAt: 'created_at' } });
module.exports = mongoose.model('chat', userSchema);