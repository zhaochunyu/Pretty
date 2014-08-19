var Connection = require('ssh2');
var iconv = require('iconv-lite');
var logger = require('../log4js').logger;
var spawn = require('child_process').spawn;
function Readlog() {
}
module.exports = Readlog;

//查看各服务器启动日志
Readlog.read = function(logname,callback) {
	var datar='';
	logger.info("开始读取日志:"+'nl /root/shng/qalog/'+logname);
	ready = spawn('nl', ['/root/shng/qalog/'+logname]);
	ready.stdout.on('data', function (data) {
		  datar = datar+iconv.decode(data, 'GBK');//return GBK encoded bytes from unicode string
			 datar= datar.toString();		 
			});		
	ready.stderr.on('data', function (data) {
		logger.error('执行失败：'+data);
	return callback('null');
});
	ready.stdout.on('end', function (data) {
		return callback(null, datar);
}
	);
	ready.on('close', function (code) {
		logger.info('child process exited with code ' + code);
		});	
	
}


// 查看各服务器启动日志
Readlog.readold = function(logname,callback) {
	var datar='';
	var c = new Connection();
	c.connect({
		host : '172.17.103.6',
		port : 22,
		username : 'root',
		password : '****',
		publicKey: require('fs').readFileSync('/root/.ssh/id_dsa.pub')
	});
	c.on('ready', function() {		
		logger.info("开始读取日志:"+logname);
		// 执行编译过程
		c.exec('nl /root/shng/qalog/'+logname,{pty:true}, function(err, stream) {
			if (err) {
				socket.emit('nohup', {
					host : host.host,
					log : err
				});
				return callback(err,null);
			}
			stream.on('data', function(data, extended) {
				datar =datar+ iconv.decode(data, 'GBK');	
				
			});
			stream.on('end', function() {
				return callback(null, datar);
			});
			stream.on('close', function() {
			});
			stream.on('exit', function(code, signal) {
				c.end();
			});
	});
});
}	
