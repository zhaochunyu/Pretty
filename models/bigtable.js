
var Online = require('./online.js');
var logger = require('../log4js').logger
var pool = require('./db');
var SelectOAinfo = require('../models/selectOAinfo.js');

function Bigtable() {
}
module.exports = Bigtable;

Bigtable.oalist = function(callback) {
	Online.get_all(function(err, online) {
		if (err) {
			console.log(err)
		}
		;
		for ( var i in online) {
			console.log('提交文件个数: ' + online[i].info.update);
		}
		return callback(online);
	});

};

Bigtable.oalistSelect = function(updataId,selectInfo ,callback) {
	Online.get_bigtable(updataId,selectInfo,function(err, online) {
		if (err) {
			console.log(err)
			return callback(err);
		}
		;
		return callback(null,online);
	});
}
// 查询保存数据

Bigtable.save =  function(myIDs ,callback){
	var j=0;
	myIDs.forEach(function(myID,index) {		
		if(myID=="_"){
			logger.info('无须查询oa数据库!');
			j++;
			if(j== myIDs.length)
			{
			 logger.info(myIDs+'查询结束!');
			return	callback(null,true);
			}
		}
		else{
			myID = myID.replace('_', '');		
		SelectOAinfo.SeleEndTime(myID,function(err, end_time, run_name) { 
			if (err) { // 增加run_name为空时处理
				logger.info('查询上线单故障!');					
			}
			else {
				SelectOAinfo.SeleData708(myID,function(err,serverIP) {
					if (serverIP) { 
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
						 if (serverIP.data_708 == '' || serverIP.data_708 == null) {
						logger.info((serverIP.data_1011).substring(((serverIP.data_1011).lastIndexOf('/')) + 1));
							 var datainfo = {
								    	 'filename' :  (serverIP.data_1011).substring(((serverIP.data_1011).lastIndexOf('/')) + 1),
										'confServer' : confServer,
										'special':serverIP.data_673,
										'department':serverIP.data_1040,
										'auto':serverIP.data_1039,
										'project':serverIP.data_599,
										'tester':serverIP.data_691,
										'own':serverIP.data_699.split("20")[0],
										'core':serverIP.data_1037,
										'ifback':serverIP.data_633,
										'db':serverIP.data_683
									};

							 pool.acquire(function(err, db) {
								 
								 if (err) {
									 logger.error(err);
									}
								 db.collection('online', function(err, collection) {
									 if (err) {
											pool.release(db);
											 logger.error(err);
										}
									 else{
//										 collection.save({_id :  "_"+myID ,finish : false,info : datainfo }
										 collection.update({_id:"_"+myID}, 
													{
											    	$set :	{'info.auto' :datainfo.auto,
											    		'info.special' :datainfo.special,
											    		'info.tester' :datainfo.tester,
											    		'info.confServer' :datainfo.confServer,
											    		'info.filename' :datainfo.filename,
											    		'info.department' :datainfo.department,
											    		'info.project' :datainfo.project,
											    		'info.own' :datainfo.own,
											    		'info.core' :datainfo.core,
											    		'info.ifback' :datainfo.ifback,
											    		'info.db' :datainfo.db							    	
											    	}
													},{upsert: true, multi: true ,w : 1}
										 , function(err, dbonline) {
											 pool.release(db);
												if (err) {
													 logger.error(err);
												}
												j++;
													if(j== myIDs.length)
													{
													 logger.info(myIDs+'查询结束!');
													return	callback(null,true);
													}
										 })
									 }
									 
								 })
								 
							 })
							 
						 }
						 //已经结束
						 else{
							 logger.info(myID+'流程已经结束!');
						logger.info((serverIP.data_1011).substring(((serverIP.data_1011).lastIndexOf('/')) + 1));
							 var datainfo = {
								    	 'filename' :  (serverIP.data_1011).substring(((serverIP.data_1011).lastIndexOf('/')) + 1),
										'confServer' : confServer,
										'special':serverIP.data_673,
										'department':serverIP.data_1040,
										'auto':serverIP.data_1039,
										'project':serverIP.data_599,
										'tester':serverIP.data_691,
										'own':serverIP.data_699.split("20")[0],
										'core':serverIP.data_1037,
										'ifback':serverIP.data_633,
										'db':serverIP.data_683
									};
									 pool.acquire(function(err, db) {
								 if (err) {
									 logger.error(err);
									}
								 db.collection('online', function(err, collection) {
									 if (err) {
											pool.release(db);
											 logger.error(err);
										}
									 else{
//										 collection.save({_id :  "_"+myID ,finish : false,info : datainfo }
										 collection.update({_id:"_"+myID}, 
													{
											    	$set :	{'info.auto' :datainfo.auto,
											    		'info.special' :datainfo.special,
											    		'info.tester' :datainfo.tester,
											    		'info.confServer' :datainfo.confServer,
											    		'info.filename' :datainfo.filename,
											    		'info.department' :datainfo.department,
											    		'info.project' :datainfo.project,
											    		'info.own' :datainfo.own,
											    		'info.core' :datainfo.core,
											    		'info.ifback' :datainfo.ifback,
											    		'info.db' :datainfo.db,
											    		'ispretty':'非法'											    		
											    	}
													},{upsert: true, multi: true ,w : 1}
										 , function(err, dbonline) {
											 pool.release(db);
												if (err) {
													 logger.error(err);
												}
												j++;
													if(j== myIDs.length)
													{
													 logger.info(myIDs+'查询结束!');
													return	callback(null,true);
													}
										 })
									 }
									 
								 })
								 
							 })
							 
								if(j== myIDs.length)
								{
								 logger.info(myIDs+'查询结束!');
								return	callback(null,true);
								}
						 }
					
					}
				})
			}
			
			
			
		});
		
	}  //else	
		
	});
	
	
};















