$(document).ready(function() {	
	//重启
	$("#restart").click(function() {
		$("#pheader").html('重启进行中，大概10分钟内完成，请稍等！');
		var host = $("input[name='host']:checked").val();
		if (!host || host==null) {
			alert("请选择重启服务器！");
			$("#pheader").html('请选择重启服务器！');		
			return;
		}
		if(confirm("重启: "+host+" 大概10分钟内完成，请确认是否重启？")){
		MessageBox.popup("tipblock",{title:"重启进行中……",width:"350px"});
		$("#restart").attr("disabled", "disabled");
		$.post("/restart",
				{
			 host : host
		},
		function(data, status) {
			//加载图片消失
			MessageBox.unpopup("tipblock");
			$("#restart").removeAttr("disabled");
			alert("提示： " + data);
			$("#pheader").html('操作完成: '+data);
		});
		}
		else{
			alert("重启取消！");
			$("#pheader").html('服务器列表：');
			return;	
	}
	
	});	
	
	//回滚
	$("#goback").click(function() {		
		var gobackId = $("input[name='gobackId']:checked").val();
		if (!gobackId || gobackId==null) {
			alert("请选择回滚版本！");
			$("#pheader").html('请选择回滚版本！');		
			return;
		}
		if(confirm("请确认是否回滚[ "+gobackId+"  ]版本?")){
			$("#pheader").html('回滚时间大概持续6分钟，请耐心等待……');
			$("#goback").attr("disabled", "disabled");
		$.post("/goback",
				{
			gobackId : gobackId
		},
				function(data, status) {
			$("#goback").removeAttr("disabled");
			alert("提示： " + data);
			$("#pheader").html('回滚完成: '+data);
		});
		}
		else{
			alert("回滚取消！");
			$("#pheader").html('回 滚');
			return;	
	}
	
	});
// 接收查询页面返回
	$("#updataid").click(function() {
		var updataId = $("#updataId").val();
		$("#pheader").html('查询进行中……');
		$("#updataid").attr("disabled", "disabled");		
		$("#updatainfo").html('');
		$("#srclist").html('');
		$("#updatesrclist").html('');			
          $.post("/updataid", {
  			updataId : updataId
  		}, function(data, status) {
  			$("#updatainfo").html(data.name);
  			$("#srclist").html(data.srclist);
  			$("#updatesrclist").html(data.updatesrclist);
  			alert("" + data.message);
  			$("#pheader").html('查询结束:  '+data.message);  			
  			$("#updataid").removeAttr("disabled");
  			$("#build").removeAttr("disabled");
  			if (!updataId || $("#updatainfo").val()=='no body！') {
  				$("#build").attr("disabled", "disabled");
  				$("#updata").attr("disabled", "disabled");
  			}
  		});

	});
	
	 
	
// 接收编译页面返回
	$("#build").click(function() {
		var updataId = $("#updataId").val();
		if (!updataId || $("#build").attr("disabled")) {
			alert("oa流水号哪里去了呀！");
			return;
		}
		$("#bulidresult").html('');
		$("#updatalist").html('');
		$("#nohave").html('');
		$("#pheader").html('编译进行中……');
		$("#build").attr("disabled", "disabled");
		$.post("/build", {
			updataId : updataId
		}, function(data, status) {
			$("#state").val(data.state);
			$("#bulidresult").html(data.bulidresult);
			$("#nohave").html(data.nohave);
			$("#updatalist").html(data.updatalist);
			alert("嗨：" + data.message);
			$("#pheader").html('编译结束:   '+data.message);
			$("#build").removeAttr("disabled");
			$("#updata").removeAttr("disabled");
		});
	});

//接更新译页面返回
	$("#updata").click(function() {
		var updataId = $("#updataId").val();
		if (!updataId || $("#updata").attr("disabled")) {
			alert("oa流水号哪里去了呀！");
			return;
		}
		
		if(confirm("更新时间大约6分钟，请确认是否更新?")){
			$("#state").html('');
			 sme="<span style='color:#5bc0de'>即将开始倒计时！</span>";
			document.getElementById('endtime').innerHTML = sme;
	          if($("#endtime").text() != null)
	          {
	        	  RemainTime();        	
	          }		
			$("#pheader").html('分发,重启进行中……');
		$("#updata").attr("disabled", "disabled");
		MessageBox.popup("tipblock",{title:"更新进行中……",width:"350px"});
		$.post("/updata", {
			updataId : updataId
		}, function(data, status) {
			alert("" + data);
			$("#pheader").html(data);
			$("#updata").removeAttr("disabled");
			MessageBox.unpopup("tipblock");
			$("#state").html(true);
			if(confirm("亲，更新完了，是否退出？"))
{
				$.get('/logout',function(data, status) {
					window.location.href="/";
				});
}				
			else{
				alert("亲，记得退出哦！别让我等太久哈！");				
			}
		});
	}
		else{
			alert("更新取消！");
			return;	
		}
	});

//接收取消更新页面返回
$("#cancelupdata").click(function() {
	$("#pheader").html('取消更新进行中……');
	$.post("/cancelupdata",function(data, status) {
		$("#bulidresult").val(data);
		alert("提示: " + data);
		$("#pheader").html('取消更新结束');
	});
});
});


