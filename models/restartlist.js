var online = require('./online.js');
var logger = require('../log4js').logger;

function Restart() {
}
module.exports = Restart;

var dlist={"data_603" : "yptxp", "data_604" : "portal", "data_605" : "ypboss",
		 "data_606" : "3g-ypboss", "data_607" : "ypepos", "data_608" : "ypcheckaccount",
		 "data_609" : "bear", "data_610" : "hunter", "data_611" : "wolf","data_612" : "daemon01",
		 "data_613" : "dorado", "data_614" : "mctnotify", "data_615" : "yypbps01",
		 "data_616" : "racoon", "data_617" : "anole", "data_618" : "cfb", "data_619" : "icc_txp",
		 "data_620" : "icc_web", "data_621" : "icc_bps01", "data_622" : "无线 93、94",
		 "data_623" : "无线 91、92", "data_624" : "bizfor3g", "data_625" : "txp-service"};
var slist={"yptxp":"4,5","txp-service":"4,5", "portal": "6,7","ypboss":"8,9","3g-ypboss":"8,9","ypepos":"10,11","ypcheckaccount":"10,11",
		"bear":"17","hunter":"17", "wolf":"17","dorado":"17","daemon01":"18","mctnotify":"18","ypbps":"18"
		,"racoon" :"13","anole":"13","cfb":"13","bizfor3g":"13","icc_txp":"14","icc_web":"14","icc_bps01":"14"
};


function filterRepeatStr(str){ 
	str=str.replace(","," ");
	logger.info('去掉重复……'+str);	
	var ar2 = str.split(" "); 
	var array = new Array(); 
	var j=0 
	for(var i=0;i<ar2.length;i++){ 
	if((array == "" || array.toString().match(new RegExp(ar2[i],"g")) == null)&&ar2[i]!=""){ 
	array[j] =ar2[i]; 
	array.sort(); 
	j++; 	} 	} 
	str='';
	for(var key in array) {
		str=str+" "+array[key]	;
	}
	logger.info('去掉重复完成……'+str.trim());	
	return str.trim(); 
	}

Restart.get= function(oaid,callback){
	var restart = '',selectOAid='';
		var i=0;
		oaid.forEach(function(id)
				{
			selectOAid=selectOAid+"_"+id;
			i++;
			if(i==oaid.length){
	online.get(selectOAid,function(err,online){
	var resut=online.info.confServer;
	for(var j=603;j<626;j++ ){
		if(resut['data_'+j]){
				 restart=restart+" "+slist[dlist['data_'+j]]
	}
	}
	logger.info('restart:'+restart);
	return callback(restart);
	});
				}
});
}




Restart.restartS = function(data,oaid,callback) {
	if(data.indexOf('现对外情况...')&&data.indexOf('QA测试服务器JBOSS平台系统:')){
	a = data.split('现对外情况...')[1];
	a=a.split('QA测试服务器JBOSS平台系统:')[0];
	a=a.split('-')[0].trim();
	b = a.split('\n');
   restartS='';
   var c=new Array();;
   var i=0
	for (var i in b) {
		c[i] = b[i].split('60.1.1.')[1];
		c[i]=parseInt(c[i]);
//		c[i]=c[i]-100
		restartS=restartS+' '+c[i];
		restartS=restartS.replace("NaN","");
		restartS=restartS.trim();
	}
 //获取单击服务器值
	Restart.get(oaid,function(restart){
		//从restart去掉对外的机器（restartS里面有的）。
		
		restart=filterRepeatStr(restart);	
		restart=restart_restartS(restart,restartS)
		logger.info('测试重启服务器: '+restart);
		callback(restart);
	});	
	 
	}
	
};

function restart_restartS(restart,restartS){
	restart=restart.replace(/,/g,' ');
	arr0=restart.split(" ");
	arr1=restartS.split(" "); 
	logger.info(' 预计需要重启的机器: '+restart+' 对外双机: '+restartS);
	var str='';
	for(var ite  in arr0){
		for(var it in arr1){
			if(arr0[ite]==arr1[it])
				{
				arr0[ite]=' ';
				}
		}
			}
			for(var bb in arr0){
				str=str+" "+arr0[bb];
				str=str.trim();

			}
			logger.info('需要重启的机器: '+str.trim());
			return str.trim();
}


