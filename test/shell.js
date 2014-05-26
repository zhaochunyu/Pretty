var fs= require('fs');
var $p = require('procstreams');
var iconv = require('iconv-lite');
var exec = require('child_process').exec;
var Connection = require('ssh2');
var c = new Connection();
function Shell() {
}
module.exports = Shell;


//1、直接使用nodejs的方法
Shell.exec=function(file){
//	exec('cp -f '+ file + ' /home/chunchun/opt/Auto1/chunyu.txt && grep -v \'^$\' /home/chunchun/opt/Auto1/chunyu.txt >| '+file, function(err, stdout, stderr){
		exec('/home/chunchun/opt/a.sh', function(err, stdout, stderr){
	        if(err){
	        console.error(' 出现异常：'+err);
	    }
		console.log(stdout);
	});
}


Shell.exec('/home/chunchun/opt/Auto1/1.txt');

//2、使用procstreams提供的方法
Shell.procstreams = function(file) {
		// 执行编译过程和目标
/*	$p('cd /home/chunchun/opt/Auto1 && ls').data(function(err,data, stderr) {
		
		var datau = iconv.decode(data, 'GBK');
	    datau = datau.toString();
      console.log('编译执行返回结果： '+datau); 
	})*/
	$p('cp -f '+file+' ./chunyu.txt ; grep -v \'^$\' ./chunyu.txt >| ./a.txt',{cwd : '/home/chunchun/opt/Auto1'}).data(function(err,data, stderr) {
		//转换为gbk编码为utf-8
//		var data = iconv.decode(data, 'GBK');
//		data = data.toString();
		 console.info('编译执行返回结果： '+ 'cp -f '+file + ' ./chunyu.txt && grep -v \'^$\' ./chunyu.txt >| '+file); 
      console.info('编译执行返回结果： '+stderr); 
      
	})
}
//Shell.procstreams('./1.txt');				


//3、使用ssh2
Shell.ssh2 = function() {
var c = new Connection()
start=false
c.connect({
host : '172.17.103.132',
port : 22,
username : 'root',
password : 'yeepay132'
	
});
c.on('ready', function() {
//1、 执行编译过程和目标
//    c.exec('ls',
//2、	有目录的执行
//	c.exec('cd /etc && ls',	
//		3、	有交互的执行
    c.exec('cd /root/shng/2gjboss && ./restjboss.sh',{pty:true},
    		
		function(err, stream) {
	if (err) {
		console.error('ssh exec error :: ' + err);
		socket.emit('nohup', {
			host : host.host,
			log : err
		});
	}
	stream.on('data',function(data) {
		
		console.info('执行结果： ' + data);
		//是否继续运行(y/n)	3、有交互的执行	
		var yes='IP Server ID: ';
		if (data.toString().slice(-yes.length)==yes) {
				stream.write('12\n');
				console.error('yes');
				datastring=data.toString();
			};
		
	})
	console.info('执行结果： ' + data);
	stream.on('end', function() {
	});
	stream.on('close', function() {
	});
	stream.on('exit', function(code, signal) {
		c.end();
	});
})
})
c.on('error', function(err) {
});
c.on('end', function() {
});
c.on('close', function(had_error) {
});
}

//Shell.ssh2();	