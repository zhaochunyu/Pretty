var iconv = require('iconv-lite');
var fs= require('fs');
var exec = require('child_process').exec;
var logger = require('../log4js').logger;
 
var upCVS  = function(callback){
	var cvspath ="#!/bin/sh \n cd /home/zhaowj/cvscommit/trunk/YeePay2G/1.doc/14.test/QA文件发布清单/上线工作单2014文件清单/; cvs update ;cd /home/zhaowj/cvscommit/trunk/YeePay2G/1.doc/14.test/QA文件发布清单/上线工作单2014文件清单/; cvs update;";
	logger.info('更新cvs: '+cvspath);
	var buf = iconv.encode(cvspath, 'GBK')
	fs.writeFileSync('/export/home/qarelease/antbuild/upcvs.sh', buf);
	exec('cd /export/home/qarelease/antbuild/ && ./upcvs.sh', function(err, stdout, stderr){
		 if(err){
				        logger.error('exec出现异常：'+stderr);
				    }	
		 logger.info('upcvs： '+stdout);
		 if(!stdout){
			 logger.warn('文件无变化……');		
			 return callback(false,'文件无变化……,请确认更新源！')
		 }
		 return callback(true,'cvs更新完成')
			});
}

exports.upCVS = upCVS;
 























