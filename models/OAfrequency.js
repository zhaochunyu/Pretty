var Online = require('./online.js');
var fs = require('fs');
var Cvs = require('./opercvs.js');
var iconv = require('iconv-lite');
var exec = require('child_process').exec;
var logger = require('../log4js').logger;
function OAfrequency() {
}
module.exports = OAfrequency;

OAfrequency.SeleOnline = function(oa_id, serverIP, callback) {
	var text = '', dev, srclist = '暂时不显示了', updatesrclist = '', oaid = '', updateInfo = '',srclistname='',alldev='';
	var filepath = new Array();
	var filepath = serverIP.data_1011.split('&&');
	var newfilepath = '/export/home/qarelease/antbuild/' + oa_id + '.txt';// 新生成的文件清单
	var newfilepathutf = '/export/home/qarelease/antbuild/' + oa_id + '.t';// 新生成的文件清单
	var j=0;
	
	if(filepath.length!=oa_id.length){
		logger.error('上线单中存在非法流水号');
		return callback(
				null,
				null,
				null);
	}
	else{
		//rm -f newfilepath
		if( fs.existsSync(newfilepath) ) {
		fs.unlinkSync(newfilepath);	
		fs.unlinkSync(newfilepathutf);	
		 }
			
	oa_id.forEach(function(id_oa) {
		j++;
		oaid = oaid+ "_"+ id_oa;//为构造oaid
		if(j==oa_id.length)
			{logger.info('oaid：' +oaid);
		
	var i = 0;
	oa_id.forEach(function(id) {
				logger.info('流程：' + id + ' 文件路径: ' + filepath[i]);
				var oaname = (filepath[i]).substring(((filepath[i])
						.lastIndexOf('/')) + 1);
				i++;
				var operateFile = oaname.substring(0, oaname.lastIndexOf('-'))
						+ '文件清单/';// cvs预期操作文件夹
				var fileFather= oaname.substring(0, oaname.indexOf('-'));
				var cvspath = "#!/bin/sh \n java -jar ./readtxt.jar /home/zhaowj/cvscommit/trunk/YeePay2G/1.doc/14.test/QA文件发布清单/上线工作单"+fileFather+"文件清单/"
						+ operateFile + oaname+" "+newfilepath +" "+newfilepathutf;
				
				logger.info('更新文件路径 :' + cvspath);
				var buf = iconv.encode(cvspath, 'GBK');// return GBK encoded
														// bytes from unicode
														// string
				dev = oaname.split('_')[1];
				logger.info('上线单名称:' + oaname + '\n 开发人员:' + dev);
				srclistname=srclistname+oaname;
				alldev=alldev+dev;
				// 将文件写入文本
				fs.writeFileSync('/export/home/qarelease/antbuild/' + id
						+ '_name.sh', buf);
				exec('cd /export/home/qarelease/antbuild/ && chmod 755 '+ id + '_name.sh && sh ./' + id + '_name.sh ',
						function(err, stdout, stderr) {
							if (err) {
								logger.error('exec出现异常：' + err);
								return callback(
										null,
										null,
										null);
							}
							if(stdout.indexOf('error')>-1)
							{
								logger.error('readtxt出现异常error：' + err);
								return callback(
										null,
										null,
										null);
							}
							if (stdout.indexOf('writeisok')>-1) {	
								if (i == oa_id.length) {
													exec('cp -f /export/home/qarelease/antbuild/'
																	+ oa_id
																	+ '.txt  /export/home/qarelease/antbuild/chunyu.txt && sed /^[[:space:]]*$/d /export/home/qarelease/antbuild/chunyu.txt >| /export/home/qarelease/antbuild/'
																	+ oa_id
																	+ '.txt',
															function(err,stdout,stderr) {
																if (err)throw err;
																logger.info('去掉空行完成');												
																fs.readFile(newfilepathutf,
																				'utf-8',
																				function(err,data) {
																					if (err)throw err;
																					updatesrclist =data;
																					logger.info('本次更新:'+updatesrclist);
																						// 写入数据库
																						Online.get(oaid,function(
																												err,
																												online) {
																											var confServer = {
																												'data_603' : serverIP.data_603,
																												'data_604' : serverIP.data_604,
																												'data_605' : serverIP.data_605,
																												'data_606' : serverIP.data_606,
																												'data_607' : serverIP.data_607,
																												'data_608' : serverIP.data_608,
																												'data_609' : serverIP.data_609,
																												'data_610' : serverIP.data_610,
																												'data_611' : serverIP.data_611,
																												'data_612' : serverIP.data_612,
																												'data_613' : serverIP.data_613,
																												'data_614' : serverIP.data_614,
																												'data_615' : serverIP.data_615,
																												'data_616' : serverIP.data_616,
																												'data_618' : serverIP.data_618,
																												'data_619' : serverIP.data_619,
																												'data_620' : serverIP.data_620,
																												'data_621' : serverIP.data_621,
																												'data_622' : serverIP.data_622,
																												'data_623' : serverIP.data_623,
																												'data_624' : serverIP.data_624,
																												'data_625' : serverIP.data_625
																											};
																											if (online) {// 上线单号在pretty中查询到二次更新
																												logger
																														.info('不是第一次更新,修改数据库pretty');
																												Online
																														.update(
																																oaid,
																																alldev,
																																updatesrclist,
																																confServer,
																																function(
																																		err,
																																		online) {
																																	if (err) {
																																		logger
																																				.error('保存上线单时出现异常：'
																																						+ err);
																																		return callback(
																																				'over',
																																				srclist,
																																				updatesrclist);
																																	}
																																	if (online) {
																																		logger
																																				.info('保存上线单成功');
																																		return callback(
																																				'over',
																																				srclist,
																																				updatesrclist);
																																	}
																																});
																											} else { // 没查询到第一次更新
																											// 将读取到的上线单信息写入online表
																												logger.info('第一次更新,写入pretty：'+oaid);
																												var datainfo = {
																													'filename' : srclistname,
																													'date' : new Date(),
																													'dev' : alldev,
																													'text' : updatesrclist,
																													'goback' : 0,
																													'update' : 0,
																													'confServer' : confServer,
																													'department':serverIP.data_1040,
																													'special':serverIP.data_673,
																													'auto':serverIP.data_1039,
																													'project':serverIP.data_599,
																													'tester':serverIP.data_691,
																													'own':serverIP.data_699.split("20")[0],
																													'sql':serverIP.data_631,
																													'sqlfile':serverIP.data_636,
																													'core':serverIP.data_1037,
																													'incidence':serverIP.data_1036,
																													'ifback':serverIP.data_633,
																													'db':serverIP.data_683,
																													'ispretty':'pretty'																													
																												};
																												var newline = new Online(
																														{
																															oa_id : oaid,
																															finish : false,
																															info : datainfo,
																															online:'否',
																															onliedate:"",
																															onlinecount:0																												
																															
																														});
																												newline
																														.save(function(
																																err,
																																online) {
																															if (err) {
																																logger
																																		.error('保存上线单出现异常：'
																																				+ err);
																																return callback(
																																		'over',
																																		srclist,
																																		updatesrclist);
																															}
																															;
																															if (online) {
																																logger
																																		.info('保存上线单成功');
																																return callback(
																																		'over',
																																		srclist,
																																		updatesrclist);
																															}
																															;
																														});
																											}

																										}); // Online.get
																				
																				});// fs.readFile(
															});// exec

								}// i==oa_id.length
							}//if
						
						});// exec
			});// forEach
	
			}//if
	})//oa_id.forEach(function(id_oa) {
	
	}//else
	
}

OAfrequency.dbSeleOnline = function(oa_id, online, callback) {
	var sqlfilePath = online.info.sqlfile;
//	/dbscript/2013/dbscript2013-09/2013-09-09_谢正华_招行团体退款邮件通知方式修改.txt
	if(!sqlfilePath||sqlfilePath==''){
		logger.info(oa_id+'无数据库清单路径');
		return callback(
				'无数据库清单路径',
				null,
				null);	
	}
	else{
	logger.info('sqlfilePath'+sqlfilePath);
	
//	/home/zhaowj/cvscommit/trunk/YeePay2G/3.code/dbscript/2014
	var sqlfile = sqlfilePath.substring((sqlfilePath.lastIndexOf('/')) + 1);
	//拼装文件路径
	var operateFile = '/home/zhaowj/cvscommit/trunk/YeePay2G/3.code/dbscript/'+
	sqlfile.substring(0, sqlfile.indexOf('-'))+
	  '/dbscript'+sqlfile.substring(0, sqlfile.lastIndexOf('-'))+
	  '/'+sqlfile;	
		
	var newfilepath = '/export/home/qarelease/antbuild/' + oa_id + 'db.txt';// 新生成的文件清单
	var newfilepathutf = '/export/home/qarelease/antbuild/' + oa_id + 'db.t';// 新生成的文件清单

		//rm -f newfilepath
		if( fs.existsSync(newfilepath) ) {
		fs.unlinkSync(newfilepath);	
		fs.unlinkSync(newfilepathutf);	
		 }

				logger.info('流程：' + oa_id + ' 数据库文件路径: ' + sqlfile);
		
				var cvspath = "#!/bin/sh \n java -jar ./readtxt.jar "
						+ operateFile +" "+newfilepath +" "+newfilepathutf;
				
				var buf = iconv.encode(cvspath, 'GBK');// return GBK encoded

				// 将文件写入文本
				fs.writeFileSync('/export/home/qarelease/antbuild/' + oa_id
						+ '_name.sh', buf);
				exec('cd /export/home/qarelease/antbuild/ && chmod 755 '+ oa_id + '_name.sh && sh ./' + oa_id + '_name.sh ',
						function(err, stdout, stderr) {
							if (err) {
								logger.error('exec出现异常：' + err);
								return callback(
										err,
										null,
										null);
							}
							if(stdout.indexOf('error')>-1)
							{
								logger.error('readtxt出现异常error：' + err);
								return callback(
										err,
										null,
										null);
							}
							if (stdout.indexOf('writeisok')>-1) {
																fs.readFile(newfilepathutf,
																				'utf-8',
																				function(err,data) {
																					if (err){
																						return callback(
																								err,
																								null,
																								null);
																					};
																					dbsql =data;
																					logger.info('本次更新:'+dbsql);
																						// 写入数据库
																					return callback(null,operateFile,dbsql);
																				
																				});// fs.readFile(
							}//if
						
						});// exec
				
	}
	
}




