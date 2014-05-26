var $p = require('procstreams');
 var logger = require('../log4js').logger
 var format = require('date-format');
 var exec = require('child_process').exec;
function Goback() {
}
module.exports = Goback;
//读文件并返回到页面
Goback.file = function( callback) {
	var filename= format.asString('yyyyMMdd', new Date());
	exec('ls -R '+filename+'*',{cwd : '/export/home/qaback/'},function(err, stdout, stderr) {
		var filenamelist=stdout.split(filename);
	
		var gobackfile=new Array();
	var i=0;
		filenamelist.forEach(function(onefilelist) {		
			var fileNlist={
					'name':'',
					'text':''
			}
			fileNlist.name=filename+onefilelist.split(':')[0];
			fileNlist.text=onefilelist.split(':')[1];
		gobackfile[i]=fileNlist;
		i++;
		})
		return callback(gobackfile);
});
	
};

/*Goback.file(function(gobackfile){
	gobackfile.forEach(function(item){
		console.log("**********");
		console.log(item.name);
		console.log(item.text);
	})
	
});*/


//回滚操作，接受页面返回的文件，将备份的文件再次覆盖，保障编译环境干净，file 为备份的文件夹名称
Goback.goback = function(file, callback) {
	logger.info('file：'+file);
 	exec('./Rollback.sh ../../qaback/'
			+ file + '/*.jar',{cwd : '/export/home/qarelease/bin/'},function(err, stdout, stderr) {
				if (err) {
					logger.error(err);
					logger.error('覆盖文件失败，撤销编译失败')
			return	callback(err, false);
				}
				if (stdout.indexOf('copy fail!!!') > -1) {
					logger.error('覆盖文件失败，撤销编译失败')
					return callback(null, false);
			}
				//判断是否替换成功
				if(stdout.indexOf('copy complete!!!') > -1){
					return callback(null, true);
				}
			}			
	) 
			 
}

/*Goback.goback('201301230',function(err,gobackfile){
	if(!gobackfile){
	console.log(gobackfile);	
	}
	
})*/
