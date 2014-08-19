var pool = require('./db');
var logger = require('../log4js').logger;
function Online(online) {
 
	var tdata = {
		'tname' : 'online.tname',
		'operate_time' : new Date(),
		'tgoback' : 0,
		'tupdate' : 0
	};
	this.oa_id = online.oa_id; // 上线单号
	this.finish = online.finish;// 上线单结束标识
	this.info = online.info; // 上线单信息（取cvs上文件名称/内容等）
	this.tester = tdata;
    this.online=online.online;
	 this.onliedate=online.onliedate;
	 this.onlinecount=online.onlinecount;
};

module.exports = Online;
// 存储上线单信息
Online.prototype.save = function(callback) {
	// 要存入数据库的文档
	var online = {
		_id : this.oa_id,
		finish : this.finish,
		info : this.info,
		tester : this.tester,
		online:this.online,
		onliedate:this.onliedate,
		onlinecount:this.onlinecount
	};
	// 打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		
		// 读取 online 集合
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			// 将数据插入 online 集合
			collection.insert(online, {
				safe : true
			}, function(err, online) {
				pool.release(db);
				if (err) {
					return callback(err);// 错误，返回 err 信息
				}
				callback(null, online[0]);// 成功！err 为 null，并返回存储后的文档
			});
		});
	});
};

// 读取信息
Online.get = function(oa_id, callback) {
	// 打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		// 读取 online 集合
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			collection.findOne({
				_id : oa_id
			}, function(err, online) {
				pool.release(db);
				if (err) {
					return callback(err);// 失败！返回 err 信息
				}
					logger.info("Online.get: " + online);		
				callback(null, online);// 成功！返回查询信息
			});
		});
	});
};
//读取信息
Online.get_all = function(page,callback) {
	// 打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			collection.find({ _id:{$regex :/^_[0-9]+$/},online: '否'}
					,{skip:(page-1)*10,limit:10}).toArray(function(err, items) { 
					pool.release(db);
					logger.info("count: " + items.length);
				      callback(null, items);
				})
				// 成功！返回查询信息
			});
		});
};


//读取信息
Online.get_bigtableS= function(page,updataId,selectInfo ,callback) {
	// 打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			logger.info("get_bigtable: " + !(updataId[0]=="_"));
			if(!(updataId[0]=="_")){	
				
				collection.find( {_id:{"$in":updataId}}
						,{skip:(page-1)*10,limit:10}).toArray(function(err, items) {     
						pool.release(db);
						logger.info("itemscount: " + items.length);
						return      callback(null, items);
					})
					// 成功！返回查询信息
			}
			else{
//				时间为空，按状态查询
				if( selectInfo.begindata=="" && selectInfo.begindataQA=="") 
				{
					if(selectInfo.isonline.match("all")){
						collection.find({ _id:{$regex :/^_[0-9]+$/}}
						,{skip:(page-1)*10,limit:10}).toArray(function(err, items) {   
								pool.release(db);
								logger.info("online: " + items.length);
								return      callback(null, items);
							})
							// 成功！返回查询信息
					}
					else{
						collection.find(
								{online:selectInfo.isonline, _id:{$regex :/^_[0-9]+$/}},
								{skip:(page-1)*10,limit:10}).toArray(function(err, items) {  
								pool.release(db);
								logger.info("online: " + items.length);
								return      callback(null, items);
							})
							// 成功！返回查询信息
					}
				
				}
				else{
					//按时间查询
					if(!selectInfo.begindata=="" ){
						logger.info('find( { _id:{$regex :/^_[0-9]+$/},online: '+selectInfo.isonline+',  onliedate: { $gt: '+ Date(selectInfo.begindata)+', $lt: '+ Date(selectInfo.enddata) +'}	}');
						if(selectInfo.isonline.match("all")){
							collection.find(
									{_id:{$regex :/^_[0-9]+$/},
				 					onliedate: { "$gte": new Date(selectInfo.begindata), "$lte": new Date(selectInfo.enddata) }},
				 					{skip:(page-1)*10,limit:10}).toArray(function(err, items) {    
				 						pool.release(db);	
									return      callback(null, items);
								})
								// 成功！返回查询信息
						}
						else{
							collection.find(
									{
									_id:{$regex :/^_[0-9]+$/},	
									online: selectInfo.isonline,  
				 					onliedate: { "$gte": new Date(selectInfo.begindata), "$lte": new Date(selectInfo.enddata) }},
				 					{skip:(page-1)*10,limit:10}).toArray(function(err, items) {  
				 						pool.release(db);	
									return      callback(null, items);
								})
								// 成功！返回查询信息
						}
						
						
					}
					if(!selectInfo.begindataQA==""){
						logger.info('find( {online: '+selectInfo.isonline+',  info.date: { $gt: '+new Date(selectInfo.begindataQA)+', $lt: '+new Date(selectInfo.enddataQA) +'}	}');
						if(selectInfo.isonline.match("all")){
							collection.find(	{
								_id:{$regex :/^_[0-9]+$/},
								'info.date': { "$gte": new Date(selectInfo.begindataQA), "$lte": new Date(selectInfo.enddataQA) }},
								{skip:(page-1)*10,limit:10}).toArray(function(err, items) {   
									pool.release(db);	
								return      callback(null, items);
							})
							// 成功！返回查询信息
							
						}
						else{
							collection.find(	{
								_id:{$regex :/^_[0-9]+$/},
								online: selectInfo.isonline,  
								'info.date': { "$gte": new Date(selectInfo.begindataQA), "$lte": new Date(selectInfo.enddataQA) }},
								{skip:(page-1)*10,limit:10}).toArray(function(err, items) {  
									pool.release(db);	
								return      callback(null, items);
							})
							// 成功！返回查询信息
						}
			
					}
				}
			}
	
		});
	});
};

//读取信息
Online.get_bigtable = function(updataId,selectInfo ,callback) {
	// 打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			if(!(updataId[0]=="_")){
				collection.find( {_id:{"$in":updataId}},
						function(err, online) {
					pool.release(db);
					if (err) {
						return callback(err);// 失败！返回 err 信息
					}
//					logger.info("online: " + online);
					online.toArray(function(err, items) {          
						logger.info("itemscount: " + items.length);
						return      callback(null, items);
					})
					// 成功！返回查询信息
				});
			}
			else{
//				时间为空，按状态查询
				if( selectInfo.begindata=="" && selectInfo.begindataQA=="") 
				{
					if(selectInfo.isonline.match("all")){
						collection.find({_id:{$regex :/^_[0-9]+$/}},function(err, online) {
							pool.release(db);
							if (err) {
								return callback(err);// 失败！返回 err 信息
							}
							online.toArray(function(err, items) {          
								logger.info("online: " + items.length);
								return      callback(null, items);
							})
							// 成功！返回查询信息
						});	
					}
					else{
						collection.find(
								{_id:{$regex :/^_[0-9]+$/},online:selectInfo.isonline},
								function(err, online) {
							pool.release(db);
							if (err) {
								return callback(err);// 失败！返回 err 信息
							}
							online.toArray(function(err, items) {          
								logger.info("online: " + items.length);
								return      callback(null, items);
							})
							// 成功！返回查询信息
						});	
					}
				
				}
				else{
					//按时间查询
					if(!selectInfo.begindata=="" ){
						logger.info('find( {online: '+selectInfo.isonline+',  onliedate: { $gt: '+ Date(selectInfo.begindata)+', $lt: '+ Date(selectInfo.enddata) +'}	}');
						if(selectInfo.isonline.match("all")){
							collection.find(
									{_id:{$regex :/^_[0-9]+$/},
				 					onliedate: { "$gte": new Date(selectInfo.begindata), "$lte": new Date(selectInfo.enddata) }},
									function(err, online) {
								pool.release(db);
								if (err) {
									logger.error(err);
									return callback(err);// 失败！返回 err 信息
								}
								online.toArray(function(err, items) {          
									return      callback(null, items);
								})
								// 成功！返回查询信息
							});
						}
						else{
							collection.find(
									{_id:{$regex :/^_[0-9]+$/},
									online: selectInfo.isonline,  
				 					onliedate: { "$gte": new Date(selectInfo.begindata), "$lte": new Date(selectInfo.enddata) }},
									function(err, online) {
								pool.release(db);
								if (err) {
									logger.error(err);
									return callback(err);// 失败！返回 err 信息
								}
								online.toArray(function(err, items) {          
									return      callback(null, items);
								})
								// 成功！返回查询信息
							});
						}
						
						
					}
					if(!selectInfo.begindataQA==""){
						logger.info('find( {online: '+selectInfo.isonline+',  info.date: { $gt: '+new Date(selectInfo.begindataQA)+', $lt: '+new Date(selectInfo.enddataQA) +'}	}');
						if(selectInfo.isonline.match("all")){
							collection.find(	{_id:{$regex :/^_[0-9]+$/},
								'info.date': { "$gte": new Date(selectInfo.begindataQA), "$lte": new Date(selectInfo.enddataQA) }},
								function(err, online) {
							pool.release(db);
							if (err) {
								return callback(err);// 失败！返回 err 信息
							}
							online.toArray(function(err, items) {          
								return      callback(null, items);
							})
							// 成功！返回查询信息
						});
							
						}
						else{
							collection.find(	{_id:{$regex :/^_[0-9]+$/},
								online: selectInfo.isonline,  
								'info.date': { "$gte": new Date(selectInfo.begindataQA), "$lte": new Date(selectInfo.enddataQA) }},
								function(err, online) {
							pool.release(db);
							if (err) {
								return callback(err);// 失败！返回 err 信息
							}
							online.toArray(function(err, items) {          
								return      callback(null, items);
							})
							// 成功！返回查询信息
						});
						}
			
					}
				}
			}
	
		});
	});
};

//更新次数信息
Online.update_bigtable= function(updataId,datainfo, callback) {
	// 打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		// 读取 online 集合
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			logger.info("datainfo.nocount: " +datainfo.nocount);
if(datainfo.nocount)	{	
	if(datainfo.infoupdate)	{
		logger.info("update_bigtableelse: " + updataId);		
		collection.update({_id:{"$in":updataId}}, 
				{
				$inc:{'info.update':1}				
				},{upsert: true, multi: true ,w : 1},
				function(err,online) {				
				pool.release(db);
				if (err) {
					logger.info("err: " + err);
					return callback(err);// 错误，返回 err 信息
				}
				logger.info("online: " + online);
				return	callback(null, online);// 成功！err 为 null
			}
			);
	}	

	else{
		collection.update({_id:{"$in":updataId}}, 
				{
		    	$set :	datainfo
				},{upsert: true, multi: true ,w : 1},
				function(err,online) {				
				pool.release(db);
				if (err) {
					logger.info("err: " + err);
					return callback(err);// 错误，返回 err 信息
				}
				logger.info("online: " + online);
				return	callback(null, online);// 成功！err 为 null
			}
			);
	}
	}	
if(!datainfo.nocount)	{
//		db.online.update(    { oa_id: {"$in":["_403370","_403316","_404827"]} },    {       $set: { online: "是" },       $inc: { onlinecount: 1 }    } ,{ upsert: true, multi: true });
		logger.info("update_bigtableelse: " + updataId);		
		collection.update({_id:{"$in":updataId}}, 
				{
		    	$set :	datainfo,
				$inc:{'onlinecount':1}				
				},{upsert: true, multi: true ,w : 1},
				function(err,online) {				
				pool.release(db);
				if (err) {
					logger.info("err: " + err);
					return callback(err);// 错误，返回 err 信息
				}
				logger.info("online: " + online);
				return	callback(null, online);// 成功！err 为 null
			}
			);
	}		


		});
	});
};



// 更新信息
Online.update = function(oa_id, dev, text,confServer, callback) {
	// 打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		// 读取 online 集合
		
		
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			collection.update({
				_id : oa_id
			}, {
				$set : {
					'info.dev' : dev,
					'info.text' : text,
					'info.confServer':confServer
				}
			}, function(err, online) {
				pool.release(db);
				if (err) {
					return callback(err);// 错误，返回 err 信息
				}
				callback(null, online);// 成功！err 为 null
			});
		});
	});
};


//更新次数信息
Online.update_up = function(datainfo, callback) {
	// 打开数据库
	
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		// 读取 online 集合
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			collection.update({
				_id : datainfo.oa_id
			}, {
				$set : {
					'info.update' : datainfo.update,
					'info.goback' : datainfo.goback
				}
			}, function(err, online) {
				pool.release(db);
				if (err) {
					return callback(err);// 错误，返回 err 信息
				}
				callback(null, online);// 成功！err 为 null
			});
		});
	});
};
Online.saveIP = function(oa_id, dev, text, callback) {
	// 打开数据库
	pool.acquire(function(err, db) {
		if (err) {
			return callback(err);// 错误，返回 err 信息
		}
		// 读取 online 集合
		db.collection('online', function(err, collection) {
			if (err) {
				pool.release(db);
				return callback(err);// 错误，返回 err 信息
			}
			collection.update({
				_id : oa_id
			}, {
				$set : {
					'info.dev' : dev,
					'info.text' : text
				}
			}, function(err, online) {
				pool.release(db);
				if (err) {
					return callback(err);// 错误，返回 err 信息
				}
				callback(null, online);// 成功！err 为 null
			});
		});
	});
};