/**
 * Created by QETHAN on 14-2-5.
 */
document.ready(function() {
	var nyr = document.getElementById('nyr'),
	    year = document.getElementById('year'),
			month = document.getElementById('month'),
			date = document.getElementById('date'),
			now = new Date();

	var lis = Array.prototype.slice.apply(document.querySelectorAll('ul.img-content li')),
			lisLen = lis.length;

	var loading = document.getElementById('loading'),
			finish = true,
			over = false,
			pagenum = document.getElementById('pagenum'),
	    source = document.getElementById("img-item-tpl").innerHTML,
	    template = Handlebars.compile(source),
			imgContent = document.getElementById('img-content'),
			lastid = document.getElementById('lastid');

	var nodata = document.getElementById('nodata'),
			nothing = document.getElementById('nothing');

	var data = {
		"name" : "yao.jpg",
		"path" : "yao.jpg",
		"year" : "2014",
		"month" : "2",
		"date" : "4",
		"time" : "16:39"
	};
	var html = template(data);
	window.onscroll = function(){
		if(nyr.getBoundingClientRect().top<=0) {
			nyr.style.position = 'fixed';
			nyr.style.left = (document.documentElement.clientWidth-700)/2 + 'px';
			nyr.style.top = '0';
			nyr.style.zIndex = 100;
		} else {
			nyr.style.position = 'static';
			nyr.style.left = '0';
			nyr.style.top = '0';
			nyr.style.zIndex = 0;
			year.textContent = now.getFullYear()+'年';
			month.textContent = (now.getMonth()+1)+'月';
			console.log(now.getDate());
			date.textContent = now.getDate()+'日';
		}

		for(var i=0;i<lis.length;i++) {
			if(lis[i].getBoundingClientRect().top <= 300) {
				year.textContent = lis[i].getAttribute('data-year')+'年';
				month.textContent = lis[i].getAttribute('data-month')+'月';
				date.textContent = lis[i].getAttribute('data-date')+'日';
			}
		};

		if(document.documentElement.scrollHeight - document.documentElement.scrollTop <= document.documentElement.clientHeight && finish && !nothing &&!over) {
				finish = false;
				nodata.style.display = 'none';
				loading.style.display = 'block';
				var xhr = new XMLHttpRequest();
				xhr.open('GET','http://127.0.0.1:3000/page/'+(parseInt(pagenum.value,10)+1)+'/last/'+lastid.value,true);
				xhr.onload = function() {
					var data = JSON.parse(xhr.responseText);
					if(!data) {
						loading.style.display = 'none';
						nodata.style.display = 'block';
						over = true;
						return;
					}
					data.forEach(function(item,index){
						var dom = parseDom(template(item));
						imgContent.appendChild(dom);
						lis.push(dom);
					});
					loading.style.display = 'none';
					finish = true;
					pagenum.value = parseInt(pagenum.value)+1;
					lastid.value = data[data.length-1]._id;
				}
				xhr.send(null);
		}
	};
});