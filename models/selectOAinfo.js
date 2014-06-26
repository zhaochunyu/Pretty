/**
 * 查询oa系统是否有该上线单
 */
var logger = require('../log4js').logger;
// 查询flow_run--end_time字段
var mypool = require('./mysql');
exports.SeleEndTime = function(runid, callback) {
	var end_time='';
	var run_name='';
	logger.info('上线单号:' + runid);
	logger.info("SELECT end_time ");
	var selectSQL = 'select end_time,run_name from flow_run  where flow_id = 790 and run_id  in ('
		+ runid+ ')';
	mypool.getConnection(function(err, conn) {
				if (err) {
					logger.error("SQL连接失败 " + err);
					conn.destroy();
					return callback('SQL连接失败',null,null);
				}
				logger.info("selectSQL: "+selectSQL)
				conn.query(selectSQL, function(err, rows) {
					if (err) {
						logger.error('SQL执行失败:'+err);
						conn.destroy();
						return	callback('SQL执行失败', null,null);
					} 
						
						if(rows.length==0){
							logger.info("无此上线单: "+rows.length)
							return	callback('无此上线单', null,null);	
						}
						else{
						var i = 0;
						rows.forEach(function(id)
						{
							end_time =end_time+id.end_time;
							run_name =run_name+id.run_name;
							i++;
							if(i==rows.length){
							logger.info("end_time: "+end_time+" run_name: "+run_name);
							conn.release();
							return	callback(null, end_time, run_name);
							}
						});
						}
				});
			});
	
	
};

// 查询data_708,serverIP from flow_data_790
exports.SeleData708 = function(runid, callback) {
	var serverIP;
	mypool.getConnection(function(err, conn) {
		if (err) {
			logger.error("MYPOOL ==> " + err);
			conn.destroy();
			return callback(err);
		}
		var selectSQL = 'select * from flow_data_790 where run_id in (' + runid+')';
		conn.query(selectSQL, function(err, rows) {
			if (err) {
				logger.error(err);
				conn.destroy();
				return callback(err, null);
			} else {
				logger.info("flow_data_790 ");
				var data_708='',data_603='',data_604='',data_605='',data_606='',data_607='',data_608='',data_609='',data_610='',data_611='',data_612='',data_613='',data_614='',data_615='',data_616='',data_617='',data_618='',data_619='',data_620='',data_621='',data_622='',data_623='',data_624='',data_625='',data_1011=''
					data_631='',data_1039='',data_673='',data_599='',data_691='',data_699='',data_1036='',data_1037='',data_633='',data_683='',data_1040='';
					for ( var i in rows) {
						data_631=data_631+rows[i].data_631,
						data_1040=data_1040+rows[i].data_1040,
						data_1039=data_1039+rows[i].data_1039,
						data_673=data_673+rows[i].data_673,
						data_599=data_599+rows[i].data_599,
						data_691=data_691+rows[i].data_691,
						data_699=data_699+rows[i].data_699,
						data_1036=data_1036+rows[i].data_1036,
						data_1037=data_1037+rows[i].data_1037,
						data_633=data_633+rows[i].data_633,
						data_683=data_683+rows[i].data_683,
					data_708=data_708 +rows[i].data_708,// 产品经理是否签字
					data_603=data_603 +rows[i].data_603,
					data_604=data_604 +rows[i].data_604,
					data_605=data_605 +rows[i].data_605,
					data_606=data_606 +rows[i].data_606,
					data_607=data_607 +rows[i].data_607,
					data_608=data_608 +rows[i].data_608,
					data_609=data_609 +rows[i].data_609,
					data_610=data_610 +rows[i].data_610,
					data_611=data_611 +rows[i].data_611,
					data_612=data_612 +rows[i].data_612,
					data_613=data_613 +rows[i].data_613,
					data_614=data_614 +rows[i].data_614,
					data_615=data_615 +rows[i].data_615,
					data_616=data_616 +rows[i].data_616,
					data_617=data_617 +rows[i].data_617,
					data_618=data_618 +rows[i].data_618,
					data_619=data_619 +rows[i].data_619,
					data_620=data_620 +rows[i].data_620,
					data_621=data_621 +rows[i].data_621,
					data_622=data_622 +rows[i].data_622,
					data_623=data_623 +rows[i].data_623,
					data_624=data_624 +rows[i].data_624,
					data_625=data_625 +rows[i].data_625
					if(i==0){
						data_1011=rows[i].data_1011;// 上线单路径
					}
					else{data_1011=data_1011 +"&&"+rows[i].data_1011};// 上线单路径
					if(i==rows.length-1){
						serverIP = {
								data_631:data_631,
								data_1040:data_1040,
								data_1039:data_1039,
								data_673:data_673,
								data_599:data_599,
								data_691:data_691,
								data_699:data_699,
								data_1036:data_1036,
								data_1037:data_1037,
								data_633:data_633,
								data_683:data_683,
								data_708 : data_708,// 产品经理是否签字
								data_603 : data_603,
								data_604 : data_604,
								data_605 : data_605,
								data_606 : data_606,
								data_607 : data_607,
								data_608 : data_608,
								data_609 : data_609,
								data_610 : data_610,
								data_611 : data_611,
								data_612 : data_612,
								data_613 : data_613,
								data_614 : data_614,
								data_615 : data_615,
								data_616 : data_616,
								data_617 : data_617,
								data_618 : data_618,
								data_619 : data_619,
								data_620 : data_620,
								data_621 : data_621,
								data_622 : data_622,
								data_623 : data_623,
								data_624 : data_624,
								data_625 : data_625,
								data_1011 : data_1011// 上线单路径
						};	
						conn.release();
						callback(null, serverIP);
					}
				};
				
			}
		});
	});
}




