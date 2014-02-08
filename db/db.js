/**
 * Created by QETHAN on 14-2-4.
 */
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/imgdb');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('yeah---------->');
});

//图片schema
var imgSchema = mongoose.Schema({
	_id: {type:Number},
	name: {type: String},
	path: {type: String},
	year: {type: String},
	month: {type: String},
	date: {type: String},
	time: {type: String},
  createAt: {type: Date}
});
var imgModel = exports.imgModel = mongoose.model('imgModel',imgSchema);

//用户schema
var userSchema = mongoose.Schema({
	name: {type: String},
	code: {type: String},
	createAt: {type: Date}
});
var userModel = exports.userModel = mongoose.model('userModel',userSchema);

//id自增器
var CounterSchema = mongoose.Schema({
	_id: {type: String},
	seq: {type: Number}
});
CounterSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
	return this.collection.findAndModify(query, sort, doc, options, callback);
};
var CounterModel = mongoose.model('CounterModel',CounterSchema);

exports.getNextSequence = function getNextSequence(name,cb) {
	CounterModel.findAndModify({ _id: 'imgid' }, [], { $inc: { seq: 1 } }, {upsert:true,new:true}, function (err,doc) {
		if (err) throw err;
		cb(doc.seq);
	});
}


//查找同名图片
exports.findSameImg = function(name,res,next) {
	imgModel.find({'name':name},function(err,imgs){
		if(err) {
			console.log(err);
		}
		if(imgs.length) {
			res.json({code:201});
			return;
		}
		res.json({code:200});
	});
}

//获取列表数据，进入图片时间轴时
exports.list = function(pagenum,size,cb) {
	imgModel.find({},{},{skip:(pagenum-1)*size,limit:size,sort:{'createAt':-1}}, function(err,results){
		if(err) throw err;
		if(results.length) {
			cb(results);
		} else {
			cb(null);
		}
	});
}

//分页，下拉滚动加载数据
exports.page = function(pagenum,lastid,size,cb) {
	imgModel.find({'_id':{$lt:lastid}},{},{limit:size,sort:{'createAt':-1}}, function(err,results){
		if(err) throw err;
		if(results.length) {
			console.log(results);
			cb(results);
		} else {
			cb(null);
		}
	});
}

//照片墙，每次取最新的图片
exports.wall = function(cb) {
	imgModel.find({},{},{limit:12,sort:{'createAt':-1}},function(err,results){
		if(err) throw err;
		if(results.length) {
			console.log(results);
			cb(results);
		} else {
			cb(null);
		}
	});
}
//获取最新上传的图片
exports.new = function(cb) {
	imgModel.find({},{},{limit:1,sort:{'createAt':-1}},function(err,results){
		if(err) throw err;
		if(results.length) {
			console.log(results);
			cb(results);
		} else {
			cb(null);
		}
	});
}