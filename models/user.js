var pool = require('./db');
var logger = require('../log4js').logger;
function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.state=false;
  this.info = user.info; 
  this.info.logindate='';
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var user = {
      name: this.name,
      password: this.password,
      state :false,
      info:{ logindate : new Date() + 8}
  };
  //打开数据库
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);//错误，返回 err 信息
      }
      
      //将用户数据插入 users 集合
      collection.insert(user, {
        safe: true
      }, function (err, user) {
        pool.release(db);
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, user[0]);//成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

//读取用户信息
User.get = function(name,callback) {
  //打开数据库
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);//错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function (err, user) {
        pool.release(db);
        if (err) {
          return callback(err);//失败！返回 err 信息
        }
        callback(null, user);//成功！返回查询的用户信息
      });
    });
  });
};
//读取用户信息登录信息
User.get_all = function(callback) {
  //打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		
//		online=	db.online.find();
		// 读取 online 集合
		db.collection('users', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			collection.find(function(err, users) {
				pool.release(db);
				if (err) {
					return callback(err);// 失败！返回 err 信息
				}
				users.toArray(function(err, items) { 
				      callback(items);
				})
				// 成功！返回查询信息
			});
		});
	});
};

//修改数据库
User.update= function(datainfo, callback) {
	// 打开数据库
		pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		// 读取 online 集合
		db.collection('users', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			logger.info('datainfo.state  '+datainfo.logindate);
			collection.update({
				name : datainfo.name
			}, {
				$set : {
					'state': datainfo.state,
					'info.logindate' : datainfo.logindate
				}
			}, function(err, user) {
				pool.release(db);
				if (err) {
					logger.info(err);
					return callback(err);// 错误，返回 err 信息
				}
				callback(null, user);// 成功！err 为 null
			});
		});
	});
};

//修改数据库
User.kill_all= function(datainfo, callback) {
	// 打开数据库
		pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		// 读取 online 集合
		db.collection('users', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			collection.update({
				state : true
			}, {
				$set : {
					'state': false,
					'info.logindate' : datainfo.logindate
				}
			}, function(err, user) {
				pool.release(db);
				if (err) {
					logger.info(err);
					return callback(err);// 错误，返回 err 信息
				}
				callback(null, user);// 成功！err 为 null
			});
		});
	});
};

