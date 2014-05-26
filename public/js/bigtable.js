$(document).ready(function() {
	

// 查询
	$("#bigtableSelect").click(function() {		
		alert("当前  正在使用 ，请稍后……");
		var updataId = $("#updataId").val();
		var online= $("#online").val();
		var special= $("#special").val();			
		$.post("/bigtableSelect", 
				{	updataId:updataId,
				online:online,
				special:special		},		
				function(data, status) {
			var items=data;					
			alert("当前 " + data+' 正在使用 ，请稍后……');
		});
	});
	
	// 确定上线
	$("#setOnile").click(function() {			
		var updataId = $("#updataId").val();
		$.post("/setOnile", 
				{	updataId:updataId
				},		
				function(data, status) {
			var items=data;					
			alert("当前 " + data+' 正在使用 ，请稍后……');
		});
	});
// 确定回滚
	$("#setGoback").click(function() {
		var updataId = $("#updataId").val();
		$.post("/setGoback", 
				{	updataId:updataId
				},		
				function(data, status) {
			var items=data;					
			alert("当前 " + data+' 正在使用 ，请稍后……');
		});
	});
	
// 重复上线
	$("#setSecond").click(function() {		
		var updataId = $("#updataId").val();
	$.post("/setSecond", 
			{	updataId:updataId
			},		
			function(data, status) {
		var items=data;					
		alert("当前 " + data+' 正在使用 ，请稍后……');
	});
	});

// 撤销
	$("#setCancel").click(function() {
		var updataId = $("#updataId").val();
		$.post("/setCancel", 
				{	updataId:updataId
				},		
				function(data, status) {
			var items=data;					
			alert("当前 " + data+' 正在使用 ，请稍后……');
		});
	});

// 备注
$("#setTxt").click(function() {
	var updataId = $("#updataId").val();
	var notes = $("#notes").val();
	$.post("/setTxt", 
			{	updataId:updataId,
	          notes:notes
			},		
			function(data, status) {
		var items=data;					
		alert("当前 " + data+' 正在使用 ，请稍后……');
	});
	});
});
// 导出
$("#doExport").click(function() {
	$("#pheader").html('取消更新进行中……');
	$.post("/doExport",function(data, status) {
		$("#bulidresult").val(data);
		alert("提示: " + data);
		$("#pheader").html('取消更新结束');
	});
});
});


