const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require('express-ejs-layouts');
const session = require("express-session");
const bodyParser = require('body-parser');
const socket = require('socket.io');
const path = require("path");



//models
const User = require('./model/Login');
const Info = require('./model/info');
const Uid  = require('./model/uid');
const Chat = require('./model/chat');
mongoose.set('useFindAndModify', false);
/*********************************************************/
const app = express();
const server = app.listen(5000, console.log('Server started on port 5000'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(session({
	secret: 'keyborad cat',
	resave: false,
	saveUninitialized: true,
}));
var io = socket(server);

//data base connection
mongoose.connect('mongodb://localhost:27017/admin',{useNewUrlParser: true});
mongoose.connection.on('open', function (ref) {
        console.log('Connected to mongo server.');
});

 

//routes

//for index page 
app.get('/',function(req,res,error){	
	res.render('index.ejs');
});


//after index page
//on registering
app.post('/register',function(req,res,error){
	User.find({email: req.body.email}).then((err,myuser) => {
		if(err){
			console.log(err.message);
		}
		if(myuser){
			res.send("Email already exists");
		}
		else{
			res.send("Account Created Please Go to Home Page");
		}
	});
	var newUser = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	});
	newUser.save(function(err){
		if(err){
			console.log(err);
		}
	});	
});

var id;
//onloging in
app.post('/home', function(req,res){
	User.find({email: req.body.email}, function(err, myuser){
		Info.findOneAndUpdate({userid: myuser[0].id},{
			userid: myuser[0].id},
			{upsert: true},
			function(err, info){
			if (err){
				console.log(err);
			}
		});
		id = myuser[0].id;
		req.session.user = myuser[0];
		User.find({email: { $ne: myuser[0].email }},function(err, obj){
			var allother = obj;
			res.render('home.ejs',{user: myuser[0],allother: allother});
		});
	});	
});

//for online status
let onl = new Map();
let a = [];
const online = io.of('/online');
online.on('connection', function(socket){
	socket.on('new', function(data){
		for(var i=0;i<a.length;i++){
			if(!sockets.has(a[i])&&(!onl.has(a[i]))){
				a.splice(i,1);
			}
		}
		onl.set(data.senderid, socket);
		a.push(data.senderid);
		socket.broadcast.emit('online',{list: a});
		socket.emit('online',{list: a});
	});
	socket.on('disconnect',function(){
		onl.forEach(function(value, key, map){
			if(value==socket){
				setTimeout(function(){
					if(!sockets.has(key)){
					onl.delete(key);
					a.splice(a.indexOf(key),1);
					io.of('/online').emit('online',{list: a});
					}
					else{
						onl.delete(key);
					}
				},5000);
			}
		});
	});
});	




 
//after logining in, from  home page selecting someone's id
var sockets = new Map();
io.on('connection',function(socket){
	socket.on('login',function(data){
		sockets.set(data.sender ,socket);
	});
	socket.on('chat', function(data){
		if(sockets.get(data.recev)&&data.message){
			sockets.get(data.recev).emit('chat',data);
			sockets.get(data.sender).emit('chat',data);
		}
		else if((data.message)&&(data.sender)){
			sockets.get(data.sender).emit('chat',data);
		}
		Uid.find({sender: data.sender, recevier: data.recev},function(err, obj){
			if(obj.length>0){
				var newChat = new Chat({
					uid: obj[0]._id,
					sender: data.sender,
					recevier: data.recev,
					message: data.message
				});
				newChat.save(function(err){
					console.log(err);
				});
			}
			else{		
				Uid.find({sender: data.recev, recevier: data.sender}, function(err,obj){
					if(obj.length>0){
							var newChat = new Chat({
								uid: obj[0]._id,
								sender: data.sender,
								recevier: data.recev,
								message: data.message
							});
							newChat.save(function(err){
								console.log(err);
							});
					}
				});
			}
		});
	});

	socket.on('typing',function(data){
		if(sockets.get(data.recev)){
			sockets.get(data.recev).emit('typing',data);	
		}
	});
	socket.on('disconnect',function(){
		sockets.forEach(function(value,key,map){
			if(value==socket){
				sockets.delete(key);
				console.log(sockets);
			}
		});
	});
});
app.get('/home/chat/:id',function(req,res,error){
	User.findById(req.params.id,function(err, user){
		if(err){
			console.log(err);
		}
		Uid.find({sender: req.session.user._id, recevier: req.params.id}).then(obj =>{
			Chat.find({uid: obj[0]._id}).then(obj1=>{
				res.render('chat.ejs',{user1: user, 
							sender: req.session.user._id,
		 					sendername: req.session.user.name,
		 					chats: obj1
		 				});
			}).catch(err=> {
				res.render('chat.ejs',{user1: user, 
							sender: req.session.user._id,
		 					sendername: req.session.user.name,
		 					chats: []
		 				});
			})
		}).catch(err => {
			Uid.find({sender: req.params.id, recevier: req.session.user._id}).then(obj =>{
				Chat.find({uid: obj[0]._id}).then(obj1=>{
				res.render('chat.ejs',{user1: user, 
							sender: req.session.user._id,
		 					sendername: req.session.user.name,
		 					chats: obj1
		 				});
			}).catch(err=> {
				res.render('chat.ejs',{user1: user, 
							sender: req.session.user._id,
		 					sendername: req.session.user.name,
		 					chats: []
		 				});
			})
			}).catch(err =>{
				var newUid = new Uid({
					sender: req.session.user._id,
					recevier: req.params.id
				});
				newUid.save(function(err){
					console.log(err);
				});
				res.render('chat.ejs',{user1: user, 
							sender: req.session.user._id,
		 					sendername: req.session.user.name,
		 					chats: []
		 				});
			});
		});
	});
});
app.use(express.static(path.join(__dirname, 'views')));