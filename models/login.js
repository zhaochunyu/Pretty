var User = require('../models/user.js');
var logger = require('../log4js').logger;
var crypto = require('crypto');
/*
 * GET home page.
 */
function Login() {
}
module.exports = Login;
//登录
Login.sign = function(name,password,callback) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(password).digest('hex');
	User.get(name, function(err, user) {
		if (!user) {
			return callback('nouser');
		};
		if (user.password != password) {
			return callback('fiedpass');
		};
		if(user.password == password){	
		return callback('success',user);
		};
	});
	  };
	//注册  
	  Login.reg = function(name,password,repassword,callback) {
		  
		  if (repassword != password) {
				return callback('/reg');
			};
			var md5 = crypto.createHash('md5'),
			password = md5.update(password).digest('hex');
			var newUser = new User({
				name : name,
				password : password,
				state :false,
				info:{ logindate : new Date() + 8}
			});
			logger.info('查询:' + newUser.name);
			User.get(newUser.name, function(err, user) {
				if (user) {
					logger.info('用户已存在');
					return callback('/reg');
				}
				newUser.save(function(err, user) {
					logger.info('开始保存用户');
					if (err) {
						return callback('/reg');
					}
					else{
						return callback('/login',user);
					}
				});
			});
			     
			  };	  
	  
	  
	

