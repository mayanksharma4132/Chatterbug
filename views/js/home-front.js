const socket = io('/online');
let senderID = document.getElementById('userid');
let online = document.getElementsByClassName('online');
let onlineid = document.getElementsByClassName('id');

socket.emit('new',{senderid: senderID.innerHTML});

for(var i=0;i<online.length;i++){
	online[i].style.display = 'none';
}
socket.on('online', function(data){
	var flag=0;
	for(var i=0;i<data.list.length;i++){
		for(var j=0;j<onlineid.length;j++){
			if(onlineid[j].innerHTML == data.list[i]){
				online[j].style.display = 'unset';
				flag=1;
				break;
				console.log(onlineid[j].innerHTML+" "+data.list[i]);
			}
			else{
				online[j].style.display = 'none';
			}
		}
		if(flag==1){
			break;
		}
	}
	console.log('change');
});