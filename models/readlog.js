var Connection = require('ssh2');
var iconv = require('iconv-lite');
var logger = require('../log4js').logger;
function Readlog() {
}
module.exports = Readlog;

// 查看各服务器启动日志
Readlog.read = function(logname,callback) {
	var datar='';
	var c = new Connection();
	c.connect({
		host : '172.17.103.6',
		port : 22,
		username : 'root',
		password : '9o3kzlQA',
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
