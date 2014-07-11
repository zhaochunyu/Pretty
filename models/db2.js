var Online = require('./online.js');
var fs = require('fs');
var Cvs = require('./opercvs.js');
var iconv = require('iconv-lite');
var exec = require('child_process').exec;
var logger = require('../log4js').logger;
function Condb2() {
}
module.exports = Condb2;

Condb2.exsql = function(aoid,path,callback) {
	var filepath = path;
	var shname=aoid + '_name.sh';
	if(fs.existsSync(shname) ) {
		fs.unlinkSync(shname);	
		 }
	
				var sqlpath = "#!/bin/sh \n java -jar ./ExSQL.jar "+filepath;
				
				logger.info('执行数据库文件路径 :' + sqlpath);
				var buf = iconv.encode(sqlpath, 'GBK');// return GBK encoded
			
				// 将文件写入文本
				fs.writeFileSync('/export/home/qarelease/antbuild/' + aoid
						+ '_name.sh', buf);
				exec('cd /export/home/qarelease/antbuild/ && chmod 755 '+ aoid + '_name.sh && sh ./' + aoid + '_name.sh ',
						function(err, stdout, stderr) {
					
					 var datar = iconv.decode(stdout, 'GBK');//return GBK encoded bytes from unicode string
					 datar= datar.toString();
				     logger.info(datar); 					
							if (err) {
								logger.error('exec出现异常：' + err);
								return callback(
										err,
										"执行ssh异常");
							}
							if(datar.indexOf('error')>-1)
							{
								logger.error('readtxt出现异常error：' + err);
								return callback(
										err,
										"执行jar包异常");
							}
							if (datar.indexOf('db2result')>-1) {
								logger.info('执行完成：');
								if((datar.split("db2result")[1]).indexOf("db2ok")>-1){								
								reulst=datar.split("------results------")[1];
								reulst=reulst.split("-----over------")[0];
								return callback(
										null,
										reulst);
								}
								if((datar.split("db2result")[1]).indexOf("db2goback")>-1){
									logger.info('执行完成：执行异常全部回滚，请看日志');
									return callback(
											'db2goback',
											'执行错误，已经全部回滚');
									}
								if((datar.split("db2result")[1]).indexOf("db2failed")>-1){
									logger.info('执行完成：异常失败，请看日志');
									return callback(
											'db2failed',
											'执行过程异常失败，请看日志');
									}	
								if((datar.split("db2result")[1]).indexOf("sqlrule")>-1){
										logger.info('执行完成：sql语句非法');
										return callback(
												'sql',
												'执行完成：sql语句非法');
										}
								
													}
						
						});// exec
			}
