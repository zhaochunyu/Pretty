/**
 * Module dependencies.
 */

var express = require('express.io');
var routes = require('./routes');
var http = require('http');
var path = require('path');

// 2014-02-17 addby lwj use:connect db
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var domain = require('domain');
var proc = require('procstreams');
var Terminal = require('./models/terminal.js');
var moment = require('moment');
moment().format();
var app = express();
var log = require('./log4js');


log.use(app);

app.http().io();
app.io.route("tail", function(req) {
	Terminal.connect(req.data, req.io);

});

// all environments
app.set('port', process.env.PORT || 1331);
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

// 2014-02-17 add by lwj use:会话信息存储到数据库中
app.use(express.cookieParser());
app.use(express.session({
	secret : settings.cookieSecret,
	key : settings.db,// cookie name
	cookie : {
		maxAge : 1000 * 60 * 60
	},// 15分钟
	store : new MongoStore({
		host : settings.host,
		db : settings.db,
		port : 27017,
	   username:settings.username,
       password:settings.password
	})
}));

app.use(flash());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/log', express.static(__dirname + '/log'))
var logger = require('./log4js').logger;
// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}
routes(app);

process.on('uncaughtException', function(err) {
	logger.info('uncaughtException', err);
});

// 由于node使用异步传输，对于多cpu无法直接提高利用率。如下代码服务器多cpu进行工作。
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		logger.info('worker ' + worker.process.pid + ' died');
	});
} else {

	var server = app.listen(app.get('port'), function() {
		logger.info('Express.io server listening on port ' + app.get('port'));
	});
	server.setTimeout(0);
}
