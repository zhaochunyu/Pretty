var log4js = require('log4js');
log4js.configure({
	appenders : [ {
		type : 'console'
	},// 控制台输出
	{
		type : "file",
		maxLogSize : 902400,
		filename : './log/log.log',
		alwaysIncludePattern : false,
		category : 'datelog',
		backups: 4
	} // 日期文件格式
	],
	replaceConsole : true, // 替换console.log
	levels : {
		dateFileLog : 'INFO'
	}
});

var log = log4js.getLogger('datelog');

exports.logger = log;

exports.use = function(app) {
	app.use(log4js.connectLogger(log, {
		level : 'auto',
		format : ':method :url'
	}));
}