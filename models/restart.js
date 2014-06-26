var Connection = require('ssh2');
var iconv = require('iconv-lite');
var logger = require('../log4js').logger;

function ReStart() {
}
module.exports = ReStart;

// 查看各服务器启动日志
ReStart.host = function(rhost,callback) {
	var datastring='';
	var c = new Connection();
	c.connect({
		host : '172.17.103.6',
		port : 22,
		username : 'root',
		password : '9o3kzlQA',
		publicKey: require('fs').readFileSync('/root/.ssh/id_dsa.pub')
	});
	c.on('ready', function() {		
		// 执行编译过程
		c.exec('cd /root/shng/2gjboss && ./restjboss.sh',{pty:true,evn:{PATH:'/export/home/apache2/bin:/opt/jdk1.5.0_14/bin:/export/home/apache-ant-1.7.0/bin:/sbin:/usr/sbin:/usr/local/sbin:/root/bin:/usr/local/bin:/usr/bin:/usr/X11R6/bin:/bin:/usr/games:/opt/kde3/bin:/usr/lib/mit/bin:/usr/lib/mit/sbin'}}, function(err, stream) {
			if (err) {
				socket.emit('nohup', {
					host : host.host,
					log : err
				});
				return callback(err,"执行重启脚本异常");
			}
			stream.on('data', function(data, extended) {
				
				datar = iconv.decode(data, 'GBK');
				logger.info(datar);
				datastring=datastring+datar.toString();
				datastring=datastring.toString();
				
		//判断双机	
				var server='IP Server ID: ';
				if (datar.toString().slice(-server.length)==server) {					
			    use = datastring.split('现对外情况...')[1];
				use=use.split('QA测试服务器JBOSS平台系统:')[0];
				use=use.split('-')[0].trim();	
				//判断双机
			if(parseInt(rhost)<12){					
				logger.info("重启服务器为双机："+rhost);	
				b='60.1.1.'+rhost.trim();
			if(use.indexOf(b)>-1){
				logger.warn("重启服务器异常………………………………");	
				logger.info(b+"已经对外，不允许重启");		
				stream.emit('end');
				return callback(null,"双机对外服务器，不允许重启！");
			    }
			else{
							logger.info("独立双机重启："+rhost);
						  	stream.write(rhost.trim()+'\n');
			}
			}
			else{
				logger.info("重启单机服务器： "+rhost);
			  	stream.write(rhost.trim()+'\n');
			}
				}//		if (datar.toString().slice(-server.length)==server)	
				
				var yes='是否继续运行(y/n): ';
					if (datar.toString().slice(-yes.length)==yes) {
						//判断是否重启成功
						var isok=restIsOk(datastring);
						if(isok){
							stream.write('yes\n');
							datastring=datar.toString();
						}
						else{
							stream.write('n\n');
							logger.info("是否继续运行(y/n): N");		
							logger.warn("重启服务器异常………………………………");		
							stream.emit('end');// 结束终端
							return callback(null, "重启失败，服务器启动有报错！");
						}
							
					};//是否继续运行(y/n)	
						if((datastring.indexOf('monitor:over')>-1)&&(datastring.indexOf('重启NGINX完成')>-1)){
							var state=test(datastring);
							if(state) {
									logger.info("重启NGINX完成,发布完成");
									stream.emit('end');// 结束终端
									return callback(null, "重启对外成功！");
							}
									
								if(!state) {
									   logger.warn("自动化测试验证异常………………………………");
										logger.info("更新发布异常");
										stream.emit('end');// 结束终端
										return callback(null, "重启导致冒烟测试异常。请看日志！");
									}
						};//==============
					
						 if(datar.toString().indexOf('接口不正常，脚本退出！！')>-1) {
							logger.warn("更新异常，请联系管理员……");
							stream.emit('end');// 结束终端
							return callback(null, "重启导致冒烟测试异常。请看日志！未对外");
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
});//c.on
}


//判断重启结果
function restIsOk(data){
	logger.info('判断启动是否有异常！');
	isOk = data.split('IP Server ID:')[1].split('是否继续运行(y/n):')[0];
	var isOkstate=true; 
	if ((isOk.indexOf('ERROR') >-1)&&(isOk.indexOf('.war') >-1)) {
		logger.info('启动有错误，请查看日志！');
		isOkstate = false;
		return isOkstate
	}
	else{
		logger.info('启动正常！');	
	return isOkstate
	}
}




//判断自动化结果

function test(data) {
	a = data.split('请稍等，测试接口中')[1].split('重启nginx服务......')[0];
	var test=new Array();
	var teststate=true;
	for(var i=1;i<8;i++){
		test[i]=false;
	};
	if (a.indexOf('trading successful') >-1) {
		logger.info('交易1分钱会员支付检查ok');
		test[1] = true
	}
	;
	if (a.indexOf('check member ===== successful') >-1) {
		logger.info('交易1分钱会员退款ok');
		test[2] = true
	}
	;
	if (a.indexOf('selfservice :Login successful') >-1) {
		logger.info('商户后台登录ok');
		test[3] = true
	}
	;
	if (a.indexOf('oltp :Login successful') >-1) {
		logger.info('tp登录ok');
		test[4] = true
	}
	;
	if (a.indexOf('olap :Login successful') >-1) {
		logger.info('ap登录ok');
		test[5] = true
	}
	;
	if (a.indexOf('Boss_epos :Login successful') >-1) {
		logger.info('Boss_epos登录ok');
		test[6] = true
	}
	;
	if (a.indexOf('boss_checkaccount :Login successful') >-1) {
		logger.info('boss_checkaccount登录ok');
		test[7] = true
	}
	;
	if(a.indexOf('Exception') >-1){
		logger.info('自动化异常，有Exception');
		teststate = false
	}
	for(var i in test){
		teststate=teststate&&test[i];
	}
	
	logger.info('接口测试校验结果: ' + teststate);
	return teststate;
};


