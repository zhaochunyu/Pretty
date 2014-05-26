var fs = require('fs');
var $p = require('procstreams');
var iconv = require('iconv-lite');
var exec = require('child_process').exec;
var logger = require('../log4js').logger;
var filetxt = '';
function Build() {
}
module.exports = Build;

Build.run = function(file, callback) {
	var start = true;
	// 执行编译过程和目标
	$p('./build_linux_branch ' + file + '  jar', {
		cwd : '/export/home/qarelease/antbuild'
	}).data(
			function(err, data, stderr) {

				var datau = iconv.decode(data, 'GBK');
				datau = datau.toString();
				logger.info('编译执行返回结果： ' + datau);
				// 验证编译是否成功
				file = '/export/home/qarelease/antbuild/' + file;
				data = datau;
				if (data.indexOf('BUILD SUCCESSFUL') > -1) {
					logger.info("编译成功");
					// 提交文件个数
					var len = 0, filetxtlist, goallist, nofile
					fs.readFile(file, 'utf-8', function(err, datatxt) {
						if (err) {
							logger.error("fs.readFile" + err);
						} else {
							filetxt = datatxt;
							logger.info(datatxt);
							
							filetxtlist = datatxt.toString().split('\n')
					/*		len = datatxt.toString().split('\n').length - 1;
							logger.info('提交文件个数: ' + len)
					*/
			var find = "/YP2G_";
			var reg = new RegExp(find,"g");//建立了一个正则表达式，也可以写为var reg=/is/g;
			var count = datatxt.match(reg); //match则匹配返回的字符串,这是很正规的做法
			var nofind= "#/YP2G_";
			var noreg = new RegExp(nofind,"g");//建立了一个正则表达式，也可以写为var reg=/is/g;
			var count1 = datatxt.match(noreg); //match则匹配返回的字符串,这是很正规的做法
			if(count){
			if(count1){
				len=count.length-count1.length;
			}
			else{
				len=count.length;
			}		
			}
			else{
				len=0;
			}
			logger.info('提交文件个数count.length-count1.length: ' + len);
							
					// 编译文件返回
					var begin = '[处理成功的文件]:', end = '[无变化的文件]:';
					goal = data.split(begin)[1].split(end)[0];
					// 更新文件个数number
					number = goal.substring(1, 3);
					logger.info('更新文件个数: ' + number);
					// 更新文件清单
					goal = goal.substring(3);
					goallist = goal.split('\n')
					
					// 失败文件：
					
					var beginf = '[无变化的文件]:', endf = '[失败的文件]';
					nofile = data.split(beginf)[1].split(endf)[0];
					// 未更新文件
					nofile = nofile.substring(3);		
					
					if (number == len) {
						// 判断个数相等
						if (!filetxt==goal) {// 判断内容是否一直
							for (var i = 0; i < len; i++) {
								// 判断是否存在，存在就修改
								for (var j = 0; j < number; j++) {
									if (goallist[j].indexOf(filetxtlist[i])) {
										filetxtlist[i] = 'ok'
									}
								}
							}
							// 返回未编译的代码清单
							for (var i = 0; i < len; i++) {
								if (filetxtlist[i] = 'ok') {
									continue;
								}
								nofile = nofile + filetxtlist[i]
							}
							return callback(null, start, '编译完成,文件可能不一致,提交：'+len+'个 ，更新：'+number+'个 ', nofile,
									filetxt,goal)
						}
						return callback(null, start, '编译成功,全部一致', '无', filetxt,goal)
					} else {
						start = false;
						return callback(null, start, '编译完成,文件可能不一致,提交：'+len+'个 ，更新：'+number+'个', nofile, filetxt,goal)
					}
					
						}//else
					});	//fs
					
				}// if
				else {
					if (data.indexOf('[处理成功的文件]: 0') > -1) {
						start = false;
						logger.warn("无文件进行编译");
						return callback(null, start, '无文件编译', nofile, filetxt,'无')
					} else {
						start = false;
						logger.warn("编译失败");
						var beg = '[失败的文件]:', en = 'TaskEnd';
						nofile = data.split(beg)[1].split(en)[0];
						nofile = nofile.substring(3);								
						return callback(null, start, '编译失败了'+nofile, nofile, filetxt,'无')
					}
				}

	
			});//$p

};


