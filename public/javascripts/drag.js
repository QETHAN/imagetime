/**
 * Created by QETHAN on 14-2-4.
 */

document.ready(function(){
	var socket = io.connect('http://127.0.0.1:3000/');

	var holder = document.getElementById('holder'),
			error = document.getElementById('error'),
			failFlag = true,
			tests = {
				filereader: typeof FileReader != 'undefined',
				dnd: 'draggable' in document.createElement('span'),
				formdata: !!window.FormData,
				progress: "upload" in new XMLHttpRequest
			},
			support = {
				filereader: document.getElementById('filereader'),
				formdata: document.getElementById('formdata'),
				progress: document.getElementById('progress')
			},
			acceptedTypes = {
				'image/png': true,
				'image/jpeg': true,
				'image/gif': true
			},
			progress = document.getElementById('uploadprogress'),
			progressNum = document.getElementById('uploadNum'),
			fileupload = document.getElementById('upload');

	"filereader formdata progress".split(' ').forEach(function(api){
		if(tests[api] === false) {
			support[api].className = 'fail';
		} else {
			support[api].className = 'hidden';
		}
	});

	function checkSameImg(file,formData) {
		console.log(file.name);
		var xhr = new XMLHttpRequest();
		xhr.open('GET','http://127.0.0.1:3000/checkSameImg/'+file.name,true);
		xhr.onload = function(){
			var data = JSON.parse(this.responseText);
			if(data.code == 201) {
				error.style.display = 'block';
				failFlag = true;
				progress.value = progressNum.textContent = 0;
				if(holder.childNodes[0]) holder.removeChild(holder.childNodes[0]);
			} else {
				error.style.display = 'none';
				failFlag = false;
				previewfile(file);
				//上传图片
				if(tests.formdata) {
					var xhr = new XMLHttpRequest();
					xhr.open('POST','http://127.0.0.1:3000/imgtime',true);
					xhr.onload = function() {
						progress.value = progressNum.textContent = 100;
					}

					if(tests.progress) {
						xhr.upload.onprogress = function(event) {
							if(event.lengthComputable) {
								var complete = (event.loaded / event.total * 100 | 0);
								progress.value = progressNum.textContent = complete;
								if(complete == 100) {
									if(holder.childNodes[0]) holder.removeChild(holder.childNodes[0]);
									console.log('------------emit new');
									socket.emit('new',{'status':'ok'});
								}
							}
						}
					}

					xhr.send(formData);
				}
			}

		};
		xhr.send(null);
	}
	function previewfile(file) {
		if(tests.filereader === true && acceptedTypes[file.type] === true) {
			var reader = new FileReader();
			reader.onload = function(event) {
				var image = new Image();
				image.src = event.target.result;
				image.width = 250;
				holder.appendChild(image);
			}
			reader.readAsDataURL(file);
		} else {
			hodler.innerHTML += '<p>Uploaded '+file.name+' ' + (file.size ? (file.size/1024|0) + 'K' : '')+'</p>';
		}
	}


	function readfiles(files) {
		var formData = tests.formdata ? new FormData() : null;
		for(var i=0; i<files.length; i++) {
			if(tests.formdata) {
				//TODO 对于 input file 验证文件大小
				formData.append('file',files[i]);
			}
			checkSameImg(files[i],formData);
		}
	}

	if (tests.dnd) {
		holder.ondragover = function () { this.className = 'hover'; return false; };
		holder.ondragend = function () { this.className = ''; return false; };
		holder.ondrop = function (e) {
			this.className = '';
			e.preventDefault();
			if(e.dataTransfer.files[0].size > 2*1024*1024) {
				console.log("文件太大了");
				return;
			}
			readfiles(e.dataTransfer.files);
		}
	} else {
		fileupload.className = 'hidden';
		fileupload.querySelector('input').onchange = function () {
			readfiles(this.files);
		};
	}
});

