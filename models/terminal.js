var Connection = require('ssh2');
var io = require('socket.io');
var exec = require('child_process').exec;
var Tail=require('tail').Tail;
var format = require('date-format');
var iconv = require('iconv-lite');
var logger = require('../log4js').logger;
function Terminal() {
}

module.exports = Terminal;

Terminal.connect = function(host, socket) {
	if(host.host=='106'){
  var logFile = '/export/home/qarelease/antbuild/log/report'+ format.asString('yyyyMMdd', new Date())+'.log';
tail=new Tail(logFile);
tail.on("line", function(data) {
socket.emit('nohup', {host : host.host, log : " "+iconv.decode(data, 'GBK').toString()}); 
	});
	}
	
	if(host.host=='151'){
		  var logFile = './log.log';
		  tail=new Tail(logFile);
		  tail.on("line", function(data) {
		  socket.emit('nohup', {host : host.host, log : data}); 
		  	});	
	}
	
	


}
 

Terminal.close = function(host) {
  var c = SSHSession.getSession(host.host);
  if (c) {
    c.end();
  }
  SSHSession.closeSession(host.host);
};

