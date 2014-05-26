var Connection = require('ssh2');
var c = new Connection();
var restartlist = require('./restartlist.js');
function Updata() {
}
module.exports = Updata;
// 更新替换文件，包括文件替换，重启服务器，报错校验，自动化测试验证，对外校验。

Updata.run = function(callback) {
	var c = new Connection();
	c.connect({
		host : '172.17.103.132',
		port : 22,
		username : 'root',
		password : 'yeepay132'
	});
	c.on('ready', function() {
		console.log('Updata.run');
		// 执行编译过程
		c.exec('cd /export/home/qarelease/bin/ && ls', function(err,
				stream) {
			if (err) {
				console.log('ssh exec error :: ' + err);
				socket.emit('nohup', {
					host : host.host,
					log : err
				});
				return callback(err);
			}
			stream.on('data', function(data, extended) {
				console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ')
						+ data);
				// 结束终端
				return callback(null, data);
			});
			stream.on('end', function() {
			});
			stream.on('close', function() {
			});
			stream.on('exit', function(code, signal) {
				c.end();
			});
		});

	});
	c.on('error', function(err) {
		console.error(err);
	});
	c.on('end', function() {
	});
	c.on('close', function(had_error) {
	});

};
// 重启jboss和执行切换
Updata.restjboss = function(oaid,callback) {
	var datastring='';
	var c = new Connection();
	c.connect({
		host : '172.17.103.132',
		port : 22,
		username : 'root',
		password : 'yeepay132'
	});
	c.on('ready', function() {		
		// 执行编译过程
		c.exec('cd /root/shng/2gjboss && ./restjboss.sh',{pty:true}, function(err, stream) {
			if (err) {
				socket.emit('nohup', {
					host : host.host,
					log : err
				});
				return callback(err);
			}
			stream.on('data', function(data, extended) {
				
		/*		console.log((extended === 'stderr' ? 'STDERR:' : 'STDOUT: ')
						+ data);*/
				datastring=datastring+data;
				var server='IP Server ID: ';
//				console.log('data.toString().lastIndexOf(\'IP Server ID: \')'+data.toString().slice(-server.length));
				if (data.toString().slice(-server.length)==server) {
					restartlist.restartS(datastring.toString(),oaid,function(restartS) {
						console.error("重启服务器："+restartS);
				  	stream.write(restartS+'\n');
					});
				};//IP Server ID:
				
				var yes='是否继续运行(y/n): ';
//				console.log('data.toString().lastIndexOf(\'是否继续运行(y/n): \')'+data.toString().slice(-yes.length)+"***"+data.toString());
				if (data.toString().slice(-yes.length)==yes) {
						stream.write('yes\n');
						datastring=data.toString();
					};//是否继续运行(y/n)
					if(datastring.indexOf('请稍等，测试接口中')>-1){
						Updata.test(datastring.toString(), function(test) {
							if (test){
								console.info("自动化测试验证正常");
								if (data.toString().indexOf('You have new mail in /var/mail/root')>0) {
									console.info("更新发布完成");
									stream.emit('end');// 结束终端
									return callback(null, true);
								};
							}
							else {
								console.error("自动化测试验证异常………………………………");
								if (data.toString().indexOf('You have new mail in /var/mail/root')>0) {
									console.info("更新发布完成");
									stream.emit('end');// 结束终端
									return callback(null, false);
								};
							}
						}) ;
					};//请稍等，测试接口中
					
					 if(data.toString().indexOf('接口不正常，脚本退出！！')>-1) {
						console.error("更新异常，请联系管理员……");
						return callback(null, false);
					};
				
				
			});
			stream.on('end', function() {
			});
			stream.on('close', function() {
			});
			stream.on('exit', function(code, signal) {
				c.end();
			});
	});
});
}	
/*var fs = require('fs');
fs.readFile('/home/chunchun/opt/Auto/pretty_dev/doc/6.log', 'utf-8', function(
		err, filetxt) {
	if (err) {
		console.error(err);
	} else {
		this.filetxt = filetxt
		Updata.restartS(filetxt, function(restartS) {
		})
		if (!Updata.test(filetxt, function(test) {
		})) {
			console.error("/n");
		}
	}
})*/
/*Updata.run(function (err,data) {
	if(data.toString().indexOf('Replace war in jboss-4.0.3SP1 End')>-1){
		Updata.restjboss(function (err, data) {
			console.error("/n"+data);
		});
	}
});
*/




Updata.test = function(data, callback) {
//	console.error('datatest******'+data+"**********");
	a = data.split('请稍等，测试接口中')[1].split('重启nginx服务......')[0]
	var test = true
	if (a.indexOf('支付成功') < 0) {
		console.error('交易1分钱会员支付检查异常');
		test = false
	}
	;
	if (a.indexOf('退款成功') < 0) {
		console.error('交易1分钱会员退款异常');
		test = false
	}
	;
	if (a.indexOf('商户后台登录正常') < 0) {
		console.error('商户后台登录异常');
		test = false
	}
	;
	if (a.indexOf('tp登录正常') < 0) {
		console.error('tp登录异常');
		test = false
	}
	;
	if (a.indexOf('ap登录正常') < 0) {
		console.error('ap登录异常');
		test = false
	}
	;
	if (a.indexOf('Boss_epos登录正常') < 0) {
		console.error('Boss_epos登录异常');
		test = false
	}
	;
	if (a.indexOf('boss_checkaccount登录正常') < 0) {
		console.error('boss_checkaccount登录异常');
		test = false
	}
	;
	console.info('接口测试校验结果: ' + test);
	return callback(test);
};




 
