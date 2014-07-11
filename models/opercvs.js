var iconv = require('iconv-lite');
var fs= require('fs');
var exec = require('child_process').exec;
var logger = require('../log4js').logger;
var upCVS  = function(callback){
	exec('cd /export/home/qarelease/antbuild/ && ./upcvs.sh', function(err, stdout, stderr){
		 if(err){
				        logger.error('exec出现异常：'+stderr);
				        return callback(false,'cvs更新失败')
     
				    }	
		 logger.info('upcvs： '+stdout);
		 return callback(true,'cvs更新完成')
			});
}

exports.upCVS = upCVS;
 























