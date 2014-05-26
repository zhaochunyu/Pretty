/*
 * GET home page.
 */
var Login = require('../models/login.js');
var Online = require('./online.js');
var Build = require('../models/build.js');
var Updata = require('../models/updata.js');
var crypto = require('crypto');
var User = require('../models/user.js');
var Online = require('../models/online.js');
var MyConn = require('../models/mysql.js');
var SelectOAinfo = require('../models/selectOAinfo.js');
var OAfrequency = require('../models/OAfrequency.js');
var opercvs = require('../models/opercvs.js');
var logger = require('../log4js').logger;
var Bigtable = require('../models/bigtable.js');
var Goback = require('../models/goback.js');
var Readlog = require('../models/readlog.js');
var Moment = require('moment');
var nodeExcel = require('excel-export');

module.exports = function(app) {

	// 查询上线单号
	app.post('/updataid', checkLogin);
	app
			.post(
					'/updataid',
					function(req, res) {
						var dataInfo = {
							'message' : '未定义',
							'name' : '未定义'
						};

						var oaid = req.body.updataId;
						// 拆分订单号：
						if (oaid.match('^[0-9]*[0-9;]+$')) {
							var myID = new Array();
							oaid = oaid.replace(/;/g, ' ');
							oaid = oaid.trim();
							logger.info("本次更新清单号为：" + oaid)
							myID = oaid.split(' ');

							SelectOAinfo
									.SeleEndTime(
											myID,
											function(err, end_time, run_name) { // 判断有无上线单
												if (err) { // 增加run_name为空时处理
													logger.info('查询上线单故障!');
													dataInfo = {
														'message' : err,
														'name' : err
													}
													res.json(dataInfo);
												} else {
													// 进行cvs更新
													opercvs
															.upCVS(function(
																	state,
																	massage) {

																if (massage) {// 有返回则执行

																	// 判断流程是否结束
																	SelectOAinfo
																			.SeleData708(
																					myID,
																					function(
																							err,
																							serverIP) {
																						if (serverIP) {
																							logger
																									.info('data_708:'
																											+ serverIP.data_708);
																							logger
																									.info('data_608:'
																											+ serverIP.data_608);
																							logger
																									.info('oa清单路径:'
																											+ serverIP.data_1011);

																							if (serverIP.data_708 == ''
																									|| serverIP.data_708 == null) {// 未结束
																								// 服务器信息存储online
																								OAfrequency
																										.SeleOnline(
																												myID,
																												serverIP,
																												function(
																														over,
																														srclist,
																														updatesrclist) {
																													if (over) {
																														var nameList = serverIP.data_1011
																																.split('&&');

																														var name = '本次更新文件：';
																														for ( var i in nameList) {
																															name = name
																																	+ '\n'
																																	+ (nameList[i])
																																			.substring(((nameList[i])
																																					.lastIndexOf('/')) + 1);
																															if (i == nameList.length - 1) {
																																dataInfo = {
																																	'message' : '亲，已经准备好编译！',
																																	'name' : name,
																																	'srclist' : srclist,
																																	'updatesrclist' : updatesrclist
																																};
																																res
																																		.json(dataInfo);
																															}
																														}
																													}
																													else{																														
																														logger
																														.info('亲！应该有文件为空或者找不到编译文件，请确认格式是否合法!');
																														dataInfo = {
																																'message' : '亲，有文件为空或找不到文件，请确认路径是否合法!',
																																'name' : 'no body！'
																															};
																															res
																																	.json(dataInfo);
																														}
																												

																												});// //
																								// 判断是不是pretty内第一次更新

																							} else {
																								dataInfo = {
																									'message' : '亲！本次上线单对应上线流程状态已结束，不允许发起!',
																									// 'name':(serverIP.data_1011).substring(((serverIP.data_1011).lastIndexOf('/'))+1)
																									'name' : 'no body！'
																								};
																								logger
																										.info('亲！本次上线单对应上线流程状态已结束不允许发起!');
																								res
																										.json(dataInfo);
																							}

																						} else {
																							dataInfo = {
																								'message' : '该上线单类型不正确（无此流程）',
																								'name' : 'no body！'
																							}
																							logger
																									.info('***该上线单类型不正确（flow_data_790无此流程）');
																							res
																									.json(dataInfo);
																						}
																					});
																}
															});

												}
											}// 判断有无上线单
									);

						} // if
						else {
							logger.info('oaid非法');
							dataInfo = {
								'message' : '孩子！oaid非法',
								'name' : 'no body！'
							}
							res.json(dataInfo);
						}
					});

	// 编译文件和判断
	app.post('/build', checkLogin);
	app.post('/build', function(req, res) {
		var oaid = req.body.updataId;

		if (oaid.match('^[0-9]*[0-9;]+$')) {
			var myID = new Array();
			oaid = oaid.replace(/;/g, ' ');
			oaid = oaid.trim();
			logger.info("本次更新清单号为：" + oaid)
			myID = oaid.split(' ');

			logger.info("编译oa流水号：" + myID)
			var filepath = myID + '.txt';
			Build.run(filepath, function(err, state, message, nohave, filetxt,
					goal) {
				if (message) {

					var datainfo = {
						'state' : state,
						'bulidresult' : goal,
						'nohave' : nohave,
						'updatainfo' : filepath,
						'updatalist' : filetxt,
						'message' : message
					}
					logger.info(datainfo);
					res.json(datainfo);
				}
			});

		}// if

	});

	// 撤销本次编译，将编译备份还原
	app.post('/cancelbulid', checkLogin);
	app.post('/cancelbulid', function(req, res) {
		logger.info('将撤销该次编译');
		var file// 为要回滚的文件夹目录，默认最新的
		Build.cancel(file, function(err, state) {
			logger.info(state);
			if (state) {
				logger.info('撤销编译完成');
				res.end("撤销编译完成");
			} else {
				logger.info('撤销编译失败');
				res.end('撤销编译失败');
			}
		});

	});

	// 发布文件，重启，重启校验，自动化，对外
	app.post('/updata', checkLogin);
	app
			.post(
					'/updata',
					function(req, res) {
						logger.info('更新进行中……');
						var oaid = req.body.updataId;// 更新对应上线单id
						if (oaid.match('^[0-9]*[0-9;]+$')) {
							var myID = new Array();
							oaid = oaid.replace(/;/g, ' ');
							oaid = oaid.trim();
							logger.info("本次更新清单号为：" + oaid)
							myID = oaid.split(' ');

							Updata
									.run(
											myID,
											function(err, data) {
												if ((data
														.indexOf('Replace war in jboss-4.0.3SP1 End') > -1)) {
													Updata
															.restjboss(
																	myID,
																	function(
																			err,
																			data) {
																		if (data) {
																			// 更新成功后修改更新次数

																			var i = 0;
																			myID
																					.forEach(function(
																							id) {

																						var oaid = '_'
																								+ id;
																						Online
																								.get(
																										oaid,
																										function(
																												err,
																												online) {
																											if (online) {
																												var info = online.info;
																												var update = info.update;
																												logger
																														.info(oaid
																																+ '更新次数当前：'
																																+ online.info.update);
																												update = parseInt(update) + 1;
																												logger
																														.info(oaid
																																+ '更新次数修改：'
																																+ update);
																												var goback = online.info.goback;
																												var datainfo = {
																													'oa_id' : oaid,
																													'update' : update,
																													'goback' : goback
																												}
																												Online
																														.update_up(
																																datainfo,
																																function(
																																		err,
																																		online) {
																																	if (err) {
																																		logger
																																				.error('保存更新次数失败：：'
																																						+ err);
																																	}
																																	if (online) {
																																		logger
																																				.info('保存更新次数成功');
																																	}
																																});
																											}// if
																											else {
																												// 去查询
																												SelectOAinfo
																														.SeleData708(
																																id,
																																function(
																																		err,
																																		serverIP) {

																																	var confServer = {
																																		'data_603' : serverIP.data_603,
																																		'data_604' : serverIP.data_604,
																																		'data_605' : serverIP.data_605,
																																		'data_606' : serverIP.data_606,
																																		'data_607' : serverIP.data_607,
																																		'data_608' : serverIP.data_608,
																																		'data_609' : serverIP.data_609,
																																		'data_610' : serverIP.data_610,
																																		'data_611' : serverIP.data_611,
																																		'data_612' : serverIP.data_612,
																																		'data_613' : serverIP.data_613,
																																		'data_614' : serverIP.data_614,
																																		'data_615' : serverIP.data_615,
																																		'data_616' : serverIP.data_616,
																																		'data_617' : serverIP.data_617,
																																		'data_618' : serverIP.data_618,
																																		'data_619' : serverIP.data_619,
																																		'data_620' : serverIP.data_620,
																																		'data_621' : serverIP.data_621,
																																		'data_622' : serverIP.data_622,
																																		'data_623' : serverIP.data_623,
																																		'data_624' : serverIP.data_624,
																																		'data_625' : serverIP.data_625
																																	};
																																	var filepath = serverIP.data_1011;
																																	var oaname = (filepath)
																																			.substring(((filepath)
																																					.lastIndexOf('/')) + 1);
																																	var dev = oaname
																																			.split('_')[1];
																																	logger
																																			.info('第一次写入');
																																	var datainfo = {
																																		'filename' : oaname,
																																		'date' : new Date(),
																																		'dev' : dev,
																																		'text' : '',
																																		'goback' : 0,
																																		'update' : 1,
																																		'confServer' : confServer,
																																		'special' : serverIP.data_673,
																																		'auto' : serverIP.data_1039,
																																		'project' : serverIP.data_599,
																																		'tester' : serverIP.data_691,
																																		'own' : serverIP.data_699.split("20")[0],
																																		'core' : serverIP.data_1037,
																																		'incidence':serverIP.data_1036,
																																		'ifback' : serverIP.data_633,
																																		'db' : serverIP.data_683
																																	}
																																	var newline = new Online(
																																			{
																																				oa_id : oaid,
																																				finish : false,
																																				info : datainfo,
																																				online : '否',
																																				onliedate : '',
																																				onlinecount : 0
																																			});
																																	newline
																																			.save(function(
																																					err,
																																					online) {
																																				if (err) {
																																					logger
																																							.error('保存更新次数失败：'
																																									+ err);
																																				}
																																				if (online) {
																																					logger
																																							.info('保存更新次数成功');
																																				}
																																			});

																																});

																											}// else
																										});// Online.get
																						i++;
																						if (i == myID.length) {
																							logger
																									.info('恭喜你：更新完成');
																							res
																									.end('恭喜你：更新完成');
																						}

																					});// myID.forEach

																		} else {
																			logger
																					.error('亲，更新失败，麻烦大了！快看日志吧！');
																			res
																					.end('亲，更新失败，麻烦大了！快看日志吧！');
																		}
																	});
												} else {
													logger.error('亲：替换失败');
													res.end('亲：替换失败');
												}
											});
						}
					});
	// 回滚本次更新，并撤销验证
	app.post('/cancelupdata', checkLogin);
	app.post('/cancelupdata', function(req, res) {
		logger.info('回滚本次更新');
		/*
		 * res.render('online', { pheader : '回滚本次更新进行中……' });
		 */
		res.end('回滚本次更新');

	});
	// 登录操作，验证是否成功
	// app.post('/sigin', checkNotLogin);
	app.post('/sigin', function(req, res) {
		var i = 0;
		var user=req.body.user;
		User.get_all(function(items) {
			var massage = '', userName = 'Pretty';
			var state = false;
			items.forEach(function(item) {		
				
				if (item.state) {					
					if(item.name==user){
						//可以登录
						var datainfo = {
								'name' : req.body.user,
								'state' : true,
								'logindate' : new Date()
							}
							Login.sign(req.body.user, req.body.pass, function(str,
									user) {
								if (str == 'nouser') {
									logger.info('str' + str);
									res.render('login', {
										massage : '',
										user : '亲！我不认识你。'
									});
								}
								;
								if (str == 'fiedpass') {
									logger.info('str ' + str);
									res.render('login', {
										massage : '密码错！',
										user : ''
									});
								}
								;
								if (str == 'success') {
									User.update(datainfo,
											function(err, updateUser) {
												if (updateUser) {
													logger.info('更新状态成功：'
															+ updateUser);
													req.session.user = user;
													req.flash('success', '登入成功');
													res.render('online', {
														massage : massage,
														user : req.session.user
													});
												}
												if (updateUser == 0) {
													logger.info('updateUser：'
															+ updateUser);
													res.render('login', {
														massage : '',
														user : '亲！我不认识你。'
													});
												}
												;
											});
								}// if (str == 'success')
							})// Login.sign
					}
					else{
						i++;
						massage = '正在使用，请稍等！', userName = item.name, state = true;
					}
				}
				else{
					i++;
				}
				if (i == items.length) {
					if (state) {
						res.render('login', {
							massage : massage,
							user : userName
						});
					} else {
						// 进行登录操作
						var datainfo = {
							'name' : req.body.user,
							'state' : true,
							'logindate' : new Date()
						}
						Login.sign(req.body.user, req.body.pass, function(str,
								user) {

							if (str == 'nouser') {
								logger.info('str' + str);
								res.render('login', {
									massage : '',
									user : '亲！我不认识你。'
								});
							}
							;

							if (str == 'fiedpass') {
								logger.info('str ' + str);
								res.render('login', {
									massage : '密码错！',
									user : ''
								});
							}
							;
							if (str == 'success') {
								User.update(datainfo,
										function(err, updateUser) {
											if (updateUser) {
												logger.info('更新状态成功：'
														+ updateUser);
												req.session.user = user;
												req.flash('success', '登入成功');
												res.render('online', {
													massage : massage,
													user : req.session.user
												});
											}
											if (updateUser == 0) {
												logger.info('updateUser：'
														+ updateUser);
												res.render('login', {
													massage : '',
													user : '亲！我不认识你。'
												});
											}
											;
										});

							}// if (str == 'success')

						})// Login.sign

					}// else

				}// if (i == items.length)

			});// items.forEach
		})// User.get_all

	});
	// 注册
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title : 'Pretty'
		});
	});

	// 注册操作
	app.post('/reg', checkNotLogin);
	app
			.post(
					'/reg',
					function(req, res) {
						req.session.user = null;
						var name = req.body.user, password = req.body.pass, repassword = req.body.repass
						Login.reg(name, password, repassword, function(str,
								user) {
							if (str == '/login') {
								logger.info('注册成功');
								res.redirect('/login');
							} else {
								res.redirect('/reg');
							}
						})

					});
	// 退出
	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res) {
		logger.info('用户' + req.session.user.name);
		var datainfo = {
			'name' : req.session.user.name,
			'state' : false,
			'logindate' : new Date()
		};
		User.update(datainfo, function(err, updateUser) {
			if (updateUser) {
				req.session.user = null;
				logger.info('用户推出成功！');
				req.flash('success', '登出成功');
				res.redirect('/login');
			}
		});
	});
	// 主页

	app.get('/', function(req, res) {
		res.redirect('/login');
	});
	// 上线
	app.get('/online', checkLogin);
	app.get('/online', function(req, res) {// 映射到
		res.render('online', {// 调用模板解析引擎,翻译名为 online
			// 的模板,并传入一个对象作为参数,这个对象有两个属性,即 pheader :
			// 'Pretty',updatainfo : null
			pheader : 'Pretty',
			user : req.session.user
		});
	});
	// 登录页面
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		// 查询全部，是否有人登录。
		var i = 0;
		User.get_all(function(items) {
			var massage = '', userName = 'Pretty';
			items.forEach(function(item) {
				i++;
				if (item.state) {
					massage = '正在使用，请稍等！', userName = item.name
				}
				if (i == items.length) {
					res.render('login', {
						massage : massage,
						user : userName
					});
				}

			});
		}

		)
	});
	// 终端页面
	app.get('/terminal', checkLogin);
	app.get('/terminal', function(req, res) {
		res.render('terminal', {
			pheader : '终端控制台',
			user : req.session.user
		});
	});
	app.get('/goback', checkLogin);
	app.get('/goback', function(req, res) {
		Goback.file(function(gobackfile) {
			res.render('goback', {
				pheader : '回滚',
				gobackfile : gobackfile,
				user : req.session.user
			});

		})

	});
	app.post('/goback', checkLogin);
	app
			.post(
					'/goback',
					function(req, res) {
						var gobackId = req.body.gobackId;
						var backId = gobackId.split('&&')[0];
						var textID = gobackId.split('&&')[1].split('.txt')[0]
								.trim();
						logger.info('backId：' + backId);
						logger.info('text：' + textID);
						Goback
								.goback(
										backId,
										function(err, state) {
											logger.info('回滚结束，状态：' + state);
											if (state) {
												logger.info('回滚成功，准备重启服务器');
												// ************************************
												logger.info('更新进行中……');
												var oaid = textID;// 更新对应上线单id405423,234333
												var myID = new Array();
												oaid = oaid.replace(/,/g, ' ');
												oaid = oaid.trim();
												logger.info("本次更新清单号为：" + oaid)
												myID = oaid.split(' ');
												Updata
														.run(
																myID,
																function(err,
																		data) {
																	if ((data
																			.indexOf('Replace war in jboss-4.0.3SP1 End') > -1)) {
																		Updata
																				.restjboss(
																						myID,
																						function(
																								err,
																								data) {
																							if (data) {
																								// 更新成功后修改更新次数
																								var i = 0;
																								myID
																										.forEach(function(
																												id) {
																											var oaid = '_'
																													+ id;
																											Online
																													.get(
																															oaid,
																															function(
																																	err,
																																	online) {
																																if (online) {
																																	var info = online.info;
																																	var update = info.update;
																																	logger
																																			.info(oaid
																																					+ '更新次数当前：'
																																					+ online.info.update);
																																	update = parseInt(update) + 1;
																																	logger
																																			.info(oaid
																																					+ '更新次数修改：'
																																					+ update);
																																	var goback = online.info.goback;
																																	var datainfo = {
																																		'oa_id' : oaid,
																																		'update' : update,
																																		'goback' : goback
																																	}
																																	Online
																																			.update_up(
																																					datainfo,
																																					function(
																																							err,
																																							online) {
																																						if (err) {
																																							logger
																																									.error('保存更新次数失败：：'
																																											+ err);
																																						}
																																						if (online) {
																																							logger
																																									.info('保存更新次数成功');
																																						}
																																					});
																																}// if
																																else {
																																	// 去查询
																																	SelectOAinfo
																																			.SeleData708(
																																					id,
																																					function(
																																							err,
																																							serverIP) {

																																						var confServer = {
																																							'data_603' : serverIP.data_603,
																																							'data_604' : serverIP.data_604,
																																							'data_605' : serverIP.data_605,
																																							'data_606' : serverIP.data_606,
																																							'data_607' : serverIP.data_607,
																																							'data_608' : serverIP.data_608,
																																							'data_609' : serverIP.data_609,
																																							'data_610' : serverIP.data_610,
																																							'data_611' : serverIP.data_611,
																																							'data_612' : serverIP.data_612,
																																							'data_613' : serverIP.data_613,
																																							'data_614' : serverIP.data_614,
																																							'data_615' : serverIP.data_615,
																																							'data_616' : serverIP.data_616,
																																							'data_617' : serverIP.data_617,
																																							'data_618' : serverIP.data_618,
																																							'data_619' : serverIP.data_619,
																																							'data_620' : serverIP.data_620,
																																							'data_621' : serverIP.data_621,
																																							'data_622' : serverIP.data_622,
																																							'data_623' : serverIP.data_623,
																																							'data_624' : serverIP.data_624,
																																							'data_625' : serverIP.data_625
																																						};
																																						var filepath = serverIP.data_1011;
																																						var oaname = (filepath)
																																								.substring(((filepath)
																																										.lastIndexOf('/')) + 1);
																																						var dev = oaname
																																								.split('_')[1];
																																						logger
																																								.info('第一次写入');
																																						var datainfo = {
																																							'filename' : oaname,
																																							'date' : new Date(),
																																							'dev' : dev,
																																							'text' : '',
																																							'goback' : 0,
																																							'update' : 1,
																																							'confServer' : confServer,
																																							'department':serverIP.data_1040,
																																							'special' : serverIP.data_673,
																																							'auto' : serverIP.data_1039,
																																							'project' : serverIP.data_599,
																																							'tester' : serverIP.data_691,
																																							'own' : serverIP.data_699.split("20")[0],
																																							'core' : serverIP.data_1037,
																																							'incidence':serverIP.data_1036,
																																							'ifback' : serverIP.data_633,
																																							'db' : serverIP.data_683,
																																							'ispretty':'pretty'
																																						}
																																						var newline = new Online(
																																								{
																																									oa_id : oaid,
																																									finish : false,
																																									info : datainfo,
																																									online : '否',
																																									onliedate : '',
																																									onlinecount : 0

																																								});
																																						newline
																																								.save(function(
																																										err,
																																										online) {
																																									if (err) {
																																										logger
																																												.error('保存更新次数失败：'
																																														+ err);
																																									}
																																									if (online) {
																																										logger
																																												.info('保存更新次数成功');
																																									}
																																								});

																																					});

																																}// else
																															});// Online.get
																											i++;
																											if (i == myID.length) {
																												logger
																														.info('恭喜你：回滚完成');
																												res
																														.end('恭喜你：回滚完成');
																											}

																										});// myID.forEach

																							} else {
																								logger
																										.error('亲，回滚失败，麻烦大了！快看日志吧！');
																								res
																										.end('亲，回滚失败，麻烦大了！快看日志吧！');
																							}
																						});
																	} else {
																		logger
																				.error('亲：替换失败');
																		res
																				.end('亲：替换包失败');
																	}
																});

												// ********************************
											}// if 回滚文件替换成功
											if (!state) {
												res.end('回滚文件替换异常!');
											}
										})

					});

	// 清单大表
	 app.get('/bigtable', checkLogin);
	app.get('/bigtable', function(req, res) {
		var scm='xin.zhao-1&meili.wu&lihong.wei&chunyu.zhao';
		if( scm.indexOf(req.session.user.name)+1){	
			Bigtable.oalist(function(items) {
				console.info('' + items);
				items.forEach(function(it,index){
					it.onliedate= Moment(it.onliedate).format('YYYY-MM-DD');
					it.info.date= Moment(it.info.date).format('YYYY-MM-DD');
					items[index]=it;
					if(index==items.length-1){
						res.render('bigtable', {
							pheader : '清单大表',
							items : items,
							itemsStr : JSON.stringify(items),
							user : req.session.user
						});
					}
				})
			});
		}
		else{
			res.render('logtxt', {
				pheader : '亲！你无权访问大表 ',
				data:'椿椿提示：只有配置管理员有权访问，请与管理员联系。'
			});
		}
	});

	// 清单大表
	 app.get('/bigtable2', checkLogin);
	app.get('/bigtable2', function(req, res) {
			Bigtable.oalist(function(items) {
				console.info('' + items);
				items.forEach(function(it,index){
					it.onliedate= Moment(it.onliedate).format('YYYY-MM-DD');
					it.info.date= Moment(it.info.date).format('YYYY-MM-DD');
					items[index]=it;
					if(index==items.length-1){
						res.render('bigtable2', {
							pheader : '清单大表',
							items : items,
							itemsStr : JSON.stringify(items),
							user : req.session.user
						});
					}
				})
			});
	});

	// 清单登录状态
	app.get('/bigboss', function(req, res) {

		res.render('killall')
	});

	app.post('/killall', function(req, res) {
		var datainfo = {
			'logindate' : new Date()
		};
		User.kill_all(datainfo, function(err, updateUser) {
			req.session.user = null;
			logger.info('清理用户成功：');
			if (updateUser) {
				res.redirect('/login');
			} else {
				res.render('killall')
			}
		})

	});

	// 权限控制
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			res.redirect('/login');
		} else {
			User.get(req.session.user.name, function(err, user) {
				if (user) {
					if (!user.state) {
						res.redirect('/login');
					} else {
						next();
					}
				}
			})
		}
	}
	;

	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			User.get(req.session.user.name, function(err, user) {
				if (user) {
					if (user.state) {
						res.redirect('/online');
					} else {
						next();
					}
				}
			});
		} else {
			next();
		}

	}
	// *************************************************
	//查询按条件
	app.post('/bigtableSelect', function(req, res) {
		var updataId = req.body.updataId;
		var updataIdr = req.body.updataId;
		var isonline = req.body.isonline;
		var begindataQA = req.body.begindataQA;
		var enddataQA = req.body.enddataQA;
		var begindata = req.body.begindata;
		var enddata = req.body.enddata;
		
		logger.info('updataId: ' + updataId);
		logger.info('online' + isonline);
		var selectInfo={
				'begindataQA' :begindataQA,
				'enddataQA':enddataQA,
				'begindata':begindata,
				'enddata':enddata,
				'isonline':isonline
		};
		logger.info('begindataQA: ' + begindataQA+" enddataQA: "+enddataQA+" begindata: "+begindata+" enddata: "+enddata);
		var myID = new Array();
		updataId = updataId.replace(/;/g, ' ');
		updataId = updataId.trim();
		myID = updataId.split(' ');
		myID.forEach(function(id_oa, index, array1) {
			var oaid = '_' + id_oa;
			myID[index] = oaid;
		})
		logger.info('updataIdr ' + updataIdr);		
		//每次在oa数据库查询，并存入pretty数据库
		Bigtable.save(myID, function(err,state) {
if(state){
	//在pretty中查询	
	Bigtable.oalistSelect(myID, selectInfo, function(err,items) {
		
		if(items.length>0){	
		items.forEach(function(it,index){				
			it.onliedate=Moment(it.onliedate).format('YYYY-MM-DD');
			 it.info.date= Moment(it.info.date).format('YYYY-MM-DD');
			items[index]=it;
			if(index==items.length-1){
				res.render('bigtable', {
					pheader : '清单大表',
					updataId : updataIdr.trim(),
					items : items,
					itemsStr : JSON.stringify(items),
					user : req.session.user
				});
					}
		})
		
		}
		else{
			res.render('bigtable', {
				pheader : '出错了！',
				updataId : updataIdr.trim(),
				items : 0,
				user : req.session.user
			});			
		}	
	});
	
}
else{
	res.render('bigtable', {
		pheader : '出错了！',
		updataId : updataIdr.trim(),
		items : 0,
		user : req.session.user
	});
}
		})
	});
//设置为上线
	app.post('/setOnile', function(req, res) {
		var updataId = req.body.updataId;
		var updataIdr = req.body.updataId;
		var selectInfo;
		updataId=	updataId.trim();
		if(!updataId.match('^[0-9]*[0-9;]+$')){
			res.render('bigtable', {
				pheader : '出错了！',
				updataId :  updataIdr.trim(),
				items : 0,
				user : req.session.user
			});
		}
		else{
		var myID =[];
		updataId = updataId.replace(/;/g, ' ');
		updataId = updataId.trim();
		logger.info("setOnile：" + updataId);
		myID = updataId.split(' ');
		myID.forEach(function(id_oa, index, array1) {
			var oaid = '_' + id_oa;
			myID[index] = oaid;
		});
		var datainfo = {
			"onliedate" : new Date(),
			"online" : '是',
			"nocount" : false
		};
		Online.update_bigtable(myID, datainfo, function(err, online) {
			if (online) {
				Bigtable.oalistSelect(myID, selectInfo, function(err,items) {
					if (items) {
						items.forEach(function(it,index){
							it.onliedate=Moment(it.onliedate).format('YYYY-MM-DD');
							 it.info.date= Moment(it.info.date).format('YYYY-MM-DD');
							items[index]=it;
							if(index===items.length-1){
								res.render('bigtable', {
									pheader : '清单大表',
									updataId : updataIdr.trim(),
									items : items,
									itemsStr : JSON.stringify(items),
									user : req.session.user
								});
							}
						});
					} else {
						res.render('bigtable', {
							pheader : '出错了！',
							updataId : updataIdr.trim(),
							user : req.session.user
						});
					}
				});
			}//if
		});
		}
	});

	app.post('/setGoback', function(req, res) {
		var updataId = req.body.updataId;
		var updataIdr = req.body.updataId;
		var selectInfo;
		logger.info('setGoback: ' + updataId);
		updataId=	updataId.trim();
		logger.info('setGoback ' + updataIdr);
		if(!(updataId.match('^[0-9]*[0-9;]+$'))){
			res.render('bigtable', {
				pheader : '出错了！',
				updataId : updataIdr.trim(),
				items : 0,
				user : req.session.user
			});
		}
		else{
		var myID = new Array();
		updataId = updataId.replace(/;/g, ' ');
		updataId = updataId.trim();
		myID = updataId.split(' ');
		myID.forEach(function(id_oa, index, array1) {
			var oaid = '_' + id_oa;
			myID[index] = oaid;
		});
		var datainfo = {
			'online' : '否',
			'nocount' : true
		};
		Online.update_bigtable(myID, datainfo, function(err, online) {
				if (online) {
					Bigtable.oalistSelect(myID, selectInfo, 
							function(err,items) {
						if (items) {
							items.forEach(function(it,index){				
								it.onliedate=Moment(it.onliedate).format('YYYY-MM-DD');
								 it.info.date= Moment(it.info.date).format('YYYY-MM-DD');
								items[index]=it;
								if(index==items.length-1){
									res.render('bigtable', {
										pheader : '清单大表',
										updataId : updataIdr.trim(),
										items : items,
										itemsStr : JSON.stringify(items),
										user : req.session.user
									});
								}
							});
				} else {
					res.render('bigtable', {
						pheader : '出错了！',
						updataId : updataIdr.trim(),
						items : 0,
						user : req.session.user
					});
				}
					});
				}//if
			});}
		});

	app.post('/setSecond', function(req, res) {
		var updataId = req.body.updataId;
		var updataIdr = req.body.updataId;
		var selectInfo;
		updataId=	updataId.trim();
		logger.info('setSecond: ' + updataIdr);
			if(!updataId.match('^[0-9]*[0-9;]+$')){
			res.render('bigtable', {
				pheader : '出错了！',
				updataId : updataIdr.trim(),
				items : 0,
				user : req.session.user
			});
		}
		else{
		var myID ;
		updataId = updataId.replace(/;/g, ' ');
		updataId = updataId.trim();
		myID = updataId.split(' ');
		myID.forEach(function(id_oa, index, array1) {
			var oaid = '_' + id_oa;
			myID[index] = oaid;
		});
		var datainfo = {
			'onliedate' : new Date(),
			'online' : '是',
			'nocount' : false
		};
		Online.update_bigtable(myID, datainfo, function(err, online) {
			if (online) {
						Bigtable.oalistSelect(myID, selectInfo, function(
								err,items) {
							if (items) {
								items.forEach(function(it,index){
									it.onliedate= Moment(it.onliedate).format('YYYY-MM-DD');
				                    it.info.date= Moment(it.info.date).format('YYYY-MM-DD');
									items[index]=it;
									if(index==items.length-1){
										res.render('bigtable', {
											pheader : '清单大表',
											updataId : updataIdr.trim(),
											items : items,
											itemsStr : JSON.stringify(items),
											user : req.session.user
										});
									}
								})
					} else {
						res.render('bigtable', {
							pheader : '出错了！',
							updataId : updataIdr.trim(),
							items : 0,
							user : req.session.user
						});
					}
				});
			}//if
		});
		}
	});

	app.post('/setCancel', function(req, res) {
		var updataId = req.body.updataId;
		var updataIdr = req.body.updataId;
		var selectInfo;
		updataId=	updataId.trim();
		logger.info('setCancel: ' + updataId);
		if(!updataId.match('^[0-9]*[0-9;]+$')){
			res.render('bigtable', {
				pheader : '出错了！',
				updataId : updataIdr.trim(),
				items : 0,
				user : req.session.user
			});
		}
		else{
		var myID = new Array();
		updataId = updataId.replace(/;/g, ' ');
		updataId = updataId.trim();
		myID = updataId.split(' ');
		myID.forEach(function(id_oa, index, array1) {
			var oaid = '_' + id_oa;
			myID[index] = oaid;
		});
		var datainfo = {
			'onliedate' : new Date(),
			'online' : '撤销',
			'nocount' : true
		};
		Online.update_bigtable(myID, datainfo, function(err, online) {
			if (online) {
					
						Bigtable.oalistSelect(myID, selectInfo, function(
							err,	items) {
							if (items) {
								items.forEach(function(it,index){				
									it.onliedate= Moment(it.onliedate).format('YYYY-MM-DD');
			                    	it.info.date= Moment(it.info.date).format('YYYY-MM-DD');
									items[index]=it;
									if(index==items.length-1){
										res.render('bigtable', {
											pheader : '清单大表',
											updataId : updataIdr.trim(),
											items : items,
											itemsStr : JSON.stringify(items),
											user : req.session.user
										});
									}
								})
					} else {
						res.render('bigtable', {
							pheader : '出错了！',
							updataId : updataIdr.trim(),
							items : 0,
							user : req.session.user
						});
					}
				});
			}
		});}
	});

	
	app.post('/setTxt', function(req, res) {
		var updataId = req.body.updataId;
		var updataIdr = req.body.updataId;
		var selectInfo;
		var notes=req.body.notes;
		updataId=	updataId.trim();
		logger.info('setTxt: ' + updataId);
		logger.info('notes: ' + notes);
		if(!updataId.match('^[0-9]*[0-9;]+$')){
			res.render('bigtable', {
				pheader : '出错了！',
				updataId : updataIdr.trim(),
				items : 0,
				user : req.session.user
			});
		}
		else{
		var myID = new Array();
		updataId = updataId.replace(/;/g, ' ');
		updataId = updataId.trim();
		myID = updataId.split(' ');
		myID.forEach(function(id_oa, index, array1) {
			var oaid = '_' + id_oa;
			myID[index] = oaid;
		});
		var datainfo = {
			'onliedate' : new Date(),
			'notes':notes,
			'nocount' : true
		};
		Online.update_bigtable(myID, datainfo, function(err, online) {
			if (online) {
						Bigtable.oalistSelect(myID, selectInfo,  function(
							err,	items) {
							if (items) {
								items.forEach(function(it,index){				
									it.onliedate=Moment(it.onliedate).format('YYYY-MM-DD');
									 it.info.date= Moment(it.info.date).format('YYYY-MM-DD');
									items[index]=it;
									if(index==items.length-1){
										res.render('bigtable', {
											pheader : '清单大表',
											updataId : updataIdr.trim(),
											items : items,
											itemsStr : JSON.stringify(items),
											user : req.session.user
										});
									}
								})
					} else {
						res.render('bigtable', {
							pheader : '出错了！',
							updataId : updataIdr.trim(),
							items : 0,
							user : req.session.user
						});
					}
				});
			}
		});}
	});
	
	app.post('/doExport', function(req, res) {
		var items = JSON.parse(req.body.items);
		var conf ={};					
	      conf.cols = [
	                   {caption:'序号', type:'string'},
	                   {caption:'流水号', type:'string'  },
	                   { caption:'部门',  type:'string'  }, 
	                   { caption:'所属项目',  type:'string'  },
	                   { caption:'上线内容',  type:'string'  },
	                   { caption:'是否有核心代码',  type:'string'  },
	                   { caption:'是否有数据库',  type:'string'  },
	                   { caption:'影响范围',  type:'string'  },
	                   { caption:'项目负责人',  type:'string'  },
	                   { caption:'测试人',  type:'string'  },
	                   { caption:'是否使用自动化',  type:'string'  },
	                   { caption:'QA更新次数',  type:'string'  },
	                   { caption:'上QA日期',  type:'string'  },
	                   { caption:'上线状态',  type:'string'  },
	                   { caption:'上线时间',  type:'string'  },
	                   { caption:'生产上线次数',  type:'string'  },
	                   { caption:'是否支持回滚',  type:'string'  },
	                   { caption:'备注',  type:'string'  }
	                   ];
	      var m_data = [];
	      var i=0;
	  	items.forEach(function(it,index){	
	  		 if ((it._id.split(/\_/)).length<3){
	  			 i++;
	  			  var arry = [i,
	  			              it._id.replace(/\_/,''), 
	  			              it.info.department, 
	  			              it.info.project, 
	  			              it.info.filename, 
	  			              it.info.core, 
	  			              it.info.db, 
	  			            it.info.incidence, 
	  		            	  it.info.own, 
	  		                 it.info.tester, 
	  			              it.info.auto, 
	  			it.info.update, 
	  			it.info.date, 
	  			it.online, 
	  			it.onliedate, 
	  			it.onlinecount, 
	  			it.info.ifback, 	  			
	  			it.notes 
	  			              ];
	  		  	  m_data[i-1] = arry;
	  		 } 		
	  	});
	      conf.rows = m_data;
	      var result = nodeExcel.execute(conf);
	      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
	      res.setHeader("Content-Disposition", "attachment; filename=" + "bigtable.xlsx");
	      res.end(result, 'binary');
	});

	// 清单登录状态
	app.get('/readlog', function(req, res) {
		res.render('readlog',{
			pheader : '各服务器日志:',
				user :'你好'
		})
	});
	app.post('/readlog', function(req, res) {
		var loghost = req.body.loghost;		
		loghost=loghost+'log.txt';
		Readlog.read(loghost,function(err,data){
			res.render('logtxt', {
				pheader : loghost+'日志如下:',
				data : data
			});
		})

	});
	
	// **************************************************************************************&&&&&&&&&&&&&&&&&&&&&&&&

};
