var fs= require('fs');
function Fs() {
}
module.exports = Fs;


//1、直接使用nodejs的方法
Fs.readANDwrite=function(){
	
	var datatxt = fs.readFileSync("/home/chunchun/opt/Auto1/1.txt",'utf-8');
//	text=text.replace(/\t/g,"");
//		console.log(text);
		

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
		
			console.info('提交文件个数count.length-count1.length: ' + len);
//		fs.writeFile('/home/chunchun/opt/Auto1/cp1.txt', text+'\n'+text, "utf-8", function(err){
/*		fs.appendFile('/home/chunchun/opt/Auto1/cp1.txt', ' \n 添加到后边了', "utf-8", function(err){
			if(err) throw err;
		});*/
		
}


//Fs.readANDwrite();
var datatxt='&xin.zhao&meili.wu&lihong.wei';
var count1 = datatxt.indexOf('&xin.zhao'); //match则匹配返回的字符串,这是很正规的做法
console.info('提交文件个数count.length-count1.length: ' + count1);

if(count1+1){
	console.info('提交文件个数count.length-count1.length: ');

}

