
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var path = require('path');
var db = require('./db/db.js');
var MongoStore = require('connect-mongo')(express);

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server,{log: false});

io.sockets.on('connection',function(socket){
	socket.on('new',function(data){
		socket.broadcast.emit('pull',{'status':'new'});
	});
	socket.on('pullRequest',function(data){
		routes.new(socket);
	});
	socket.emit('hello', { hello: 'world' });
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.bodyParser({
//	limit: 10000000,
//	defer: true //enable event
//}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: 'image',
	key: 'image',
	store: new MongoStore({
			db:'imgdb'
	}),
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}//30 days
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'html')));

var whitelist = ['http://127.0.0.1:63342', 'http://example2.com'];

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.all('*', function(req, res, next) {
	if(whitelist.indexOf(req.headers.origin) != -1) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	}
	next();
});

app.get('/', routes.index);
app.get('/hello',checkHasInviteCode,routes.list);
app.get('/checkSameImg/:name', checkSameNameImg);
app.post('/imgtime', routes.upload);
app.post('/checkInviteCode',routes.checkInviteCode);
app.get('/page/:pagenum/last/:lastid',routes.page);
app.get('/admin',routes.admin);
app.post('/admin',routes.addUser);

//如果有同名的图片，就提醒修改图片名字
function checkSameNameImg(req,res){
	db.findSameImg(req.param('name'),res);
}

//检测是否通过了 邀请码
function checkHasInviteCode(req,res,next){
	console.log('------>'+req.session);
	if(!req.session.hasInviteCode) {
		res.redirect('/');
	} else {
		next();
	}
}
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});