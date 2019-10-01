var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	userid : {type: String},
	socketid : {type: Object},
	friends : { type: [mongoose.Schema.Types.ObjectId]}
});
module.exports = mongoose.model('info', userSchema);