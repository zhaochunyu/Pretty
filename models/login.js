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
			  //忘记密码
			  Login.forget = function(name,password,repassword,superkey,callback) {
				  
				  if(superkey==='W4+E6%@T'){	
				  if (repassword != password) {
						return callback('密码不对','密码不一致');
					};
					var md5 = crypto.createHash('md5'),
					password = md5.update(password).digest('hex');
					var newUser = new User({
						name : name,
						password : password,
						state :false,
						info:{ logindate : new Date()}
					});
					logger.info('查询:' + newUser.name);
					User.get(newUser.name, function(err, user) {
						if (user) {
							User.updatepassword(newUser,function(err, user) {
								if (err) {
									return callback(err,'修改密码失败!');
								}
								else{
									return callback(null,'/login');
								}
							}
									)
						}
						else{
						newUser.save(function(err, user) {
							logger.info('开始保存用户');
							if (err) {
								return callback(err,'注册失败！');
							}
							else{
								return callback(null,'/login');
							}
						});
						}
						
					
					});
				  }    
				  else{
					  return callback('重置码不对','重置码错误,请Pretty系统管理员输入！'); 
				  }
					  };	  
	  
	

