/**
 * Created by QETHAN on 14-2-7.
 */
document.ready(function(){

	var imgs = document.querySelectorAll('img');
	var content = document.querySelector('.wall .content');

	var srcData = [];
	for(var i=0;i<imgs.length;i++) {
		srcData.push(imgs[i].src);
	}

	var socket = io.connect('http://localhost:3000');
	socket.on('hello',function(data){
		console.log('socket connect');
	});
	socket.on('pull', function (data) {
		socket.emit('pullRequest',{'status':'pullRequest'});
	});

	socket.on('pushnew',function(data){
		console.log('-------->new'+data[0].path);
		if(srcData.length<12){
			srcData.unshift(data[0].path);
			content.insertBefore(parseDom('<div class="img"><img src="'+data[0].path+'"></div>'),content.firstChild);
		} else {
			srcData.unshift(data[0].path);
			srcData.pop();
			for(var i=0;i<imgs.length;i++) {
				console.log(srcData[i]);
				imgs[i].src = srcData[i];
			}
		}
	});

	var code = document.getElementById('invite');
	code.onkeypress = function(e){
		var e = e||event;
		var key = e.which || e.keyCode;
		if(key == 13){
			var formData = new FormData();
			formData.append('code',code.value);
			var xhr = new XMLHttpRequest();
			xhr.open('POST','http://127.0.0.1:3000/checkInviteCode',true);
			xhr.onload = function(){
				var data = JSON.parse(this.responseText);
				window.location.href = data.redirect;
			}
			xhr.send(formData);
		}
	}
});
