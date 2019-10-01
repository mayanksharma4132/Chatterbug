// make connection
var socket = io();


//Query DOM  
var message = document.getElementById('message'),
	handle = document.getElementById('handle'),
	btn =document.getElementById('send'),
	output = document.getElementById('output'),
	feedback = document.getElementById('feedback'),
	useridsender = document.getElementById('userid'),
	useridrecev = document.getElementById('userid1'),
	username = document.getElementById('username'),
	chatwindow = document.getElementById('chat-window');



chatwindow.scrollTop = chatwindow.scrollHeight;

// Emit events
socket.emit('login',{sender: useridsender.innerHTML,recev: useridrecev.innerHTML});

console.log(userid.innerHTML);
message.addEventListener('keyup', function(event){
	if(event.key == "Enter"){
		socket.emit('chat',{
		message: message.value,
		username: username.innerHTML,
		recev: useridrecev.innerHTML,
		sender: useridsender.innerHTML
	});
		message.value="";
	}
});
btn.addEventListener('click',function(){
	socket.emit('chat',{
		message: message.value,
		username: username.innerHTML,
		recev: useridrecev.innerHTML,
		sender: useridsender.innerHTML
	});
	message.value="";
	chatwindow.scrollTop = chatwindow.scrollHeight;
});
message.addEventListener('keypress',function(){
	socket.emit('typing', {username: username.innerHTML, 
		recev: useridrecev.innerHTML, 
		sender: useridsender.innerHTML
	});
});

	
//Listen for events
socket.on('chat',function(data){
	feedback.innerHTML="";
	if(((data.recev == useridsender.innerHTML)&&(data.sender == useridrecev.innerHTML))||((data.sender == useridsender.innerHTML)&&(data.recev == useridrecev.innerHTML))){
		if(data.username == username.innerHTML){
			output.innerHTML += '<p><strong>' +"You: " + '</strong>' + data.message + '</p>'	
		}else{
			output.innerHTML += '<p><strong>' + data.username+ ": " + '</strong>' + data.message + '</p>'
		}
	}
	chatwindow.scrollTop = chatwindow.scrollHeight;
});

socket.on('typing', function(data){
	feedback.innerHTML = '<p><em>'+data.username+ ' is typing a message.. '+ '</em></p>'
});