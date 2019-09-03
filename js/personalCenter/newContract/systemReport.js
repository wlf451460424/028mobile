//页大小
var PAGESIZE_systemReport = 10;
var page = 0;
//查询开始时间
var startDateTime = "";

var IsSelf = 0;

var myUserName;
var myUserID;

var selectDateNS;
var selectDateNE;

var info;
var type_reload_data = 0;

var daohang_Arr=[];

//彩种类型
var type = 0;

//保存数据源类型数组
var save_shujuyuan_Arr=[];

//@ 进入panel时调用
function systemReportLoadedPanel(){
    catchErrorFun("systemReportInit();");
}

//@ 离开panel时调用
function systemReportUnloadedPanel(){
    $("#systemReportScroller").scroller().scrollToTop();
    $("#systemReportScroller").scroller().clearInfinite();
    
    $("#systemReportList").empty();
    $("#systemReportMy").empty();
    $("#systemReportTotal").empty();
    $("#systemReport_navigationLabel").empty();
    daohang_Arr = [];
    IsSelf = 0;
    type = 0;
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";

	if(selectDateNS){
        selectDateNS.dismiss();
    }
    if(selectDateNE){
        selectDateNE.dismiss();
    }
}

//@ 初始化
var _myScroller;
var systemReport_nav_horScroller; //横向滑动

function systemReportInit(){
	$("#xiaji_div").hide();
	type_reload_data = 0;
	page = 0;
	myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
    
    _myScroller =  $("#systemReportScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'systemReportList','systemReportByScroll()');

	//导航条横向滑动
	//【iScroll】参考文档：http://wiki.jikexueyuan.com/project/iscroll-5/
	systemReport_nav_horScroller =  $("#systemReport_nav_scroller").scroller({
		verticalScroll : false,
		horizontalScroll : true,
		vScrollCSS: "afScrollbar",
		autoEnable : true,
		click:true
	});
	systemReport_nav_horScroller.scrollToTop();
	systemReport_nav_horScroller.clearInfinite();
    
	$("#systemReport_selectDate").empty();
	var $select_1=$('<table><tr>'+
    	'<td id="div_1" style="width:60%"><select name="lottreyType" id="lottreyType" data-theme="a" data-mini="true" onchange="lottreyTypeChange()"></select></td>'+
    	'<td id="div_2" style="width:40%"><input type="text" id="selectDatesystemReport_Stt" readonly/></td>'+
  	  	'<td style="display:none"><input type="text" id="selectDatesystemReport_End" readonly/></td>'+
    	'<td id="div_3" style="width:10%"><select name="hourType" id="hourType" data-theme="a" data-mini="true" onchange="hourTypeChange()"></select></td>'+
    	'</tr></table>');
    $("#systemReport_selectDate").append($select_1);
////  var $select_2=$('<table><tr>'+
//  	'<td style="display:none"><input type="text" id="selectDatesystemReport_End" readonly/></td>'+
//////  	'<td style="width:20%"><select name="hourType" id="hourType" data-theme="a" data-mini="true" onchange="hourTypeChange()"></select></td>'+
////  	'</tr></table>');
////  $("#systemReport_selectDate").append($select_2);
    
    
    $("#lottreyType").empty();
    $("#hourType").hide();
     
    //当前记录
    selectDateNS = new MobileSelectDate();
    selectDateNS.init({trigger:'#selectDatesystemReport_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(-1,"day")});
    $("#selectDatesystemReport_Stt").val(initDefaultDate(-1,'day'));  //View
    startDateTime = $("#selectDatesystemReport_Stt").val()+hms00;
    selectDateNS.setMinAndMax(initDefaultDate(-DayRange_3month,"day"),initDefaultDate(-1,"day"));
    
    //GetDataParameterInfo【制度报表获取彩种类型】
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetDataParameterInfo","ProjectPublic_PlatformCode":2,"isShow":"1"}', function (data) {
    	if(data.Code == 200){
    		save_shujuyuan_Arr = data.Data.Lists;
    		if(save_shujuyuan_Arr.length>0){
    			for(var i=0;i<save_shujuyuan_Arr.length;i++){
					if(save_shujuyuan_Arr[i].Id != "14" && save_shujuyuan_Arr[i].Id != "15"){//2019.8.30 去掉小时日工资 分钟日工资
						var $option = $('<option value="'+ save_shujuyuan_Arr[i].Id +'">'+'数据源：'+ save_shujuyuan_Arr[i].WebName +'</option>');
						$("#lottreyType").append($option);
					}
    			}
    			type = $("#lottreyType").val();
    			//进入时加载
    			loadBySearchsystemReport();
    		}else{
    			toastUtils.showToast("获取制度类型列表为空");
    		}
	    } else {
	    	toastUtils.showToast(data.Msg);
	        return;
	    }
    }, '正在加载数据...');
    
    //导航
	var $navigationLabel_Li = $('<span id='+myUserID+'>'+ myUserName +'</span>');
	$("#systemReport_navigationLabel").append($navigationLabel_Li);
	daohang_Arr.push(myUserName+'_'+myUserID);
}

//@ 下拉加载下一页
function systemReportByScroll(){
    startDateTime = $("#selectDatesystemReport_Stt").val()+hms59;
    get_info(lotteryId,0)
}

//@ 改变查询类型 - 小时改变
function hourTypeChange(){
	page == 0;
	get_info(lotteryId,0);
}

//@ 改变查询类型 - 彩种类型
function lottreyTypeChange(){
	page == 0
	$("#hourType").empty();
	if($("#lottreyType").val() == 14){ //小时日工资
		
		$("#selectDatesystemReport_Stt").val(initDefaultDate(0,'day'));  //View
    	startDateTime = $("#selectDatesystemReport_Stt").val()+hms00;
    	selectDateNS.setMinAndMax(initDefaultDate(-DayRange_3month,"day"),initDefaultDate(0,"day"));
    	
		$("#hourType").show();
		var today = new Date();
		var hour = today.getHours();
		
		if(hour == 0){
			hour = 24;
		}
		
		var today = new Date();
		var day = today.getDate();
	    var daytime = $("#selectDatesystemReport_Stt").val();
	    if(Number(day) != Number(daytime.split("/")[2])){//不是当天
	    	//小时选择列表
			$("#hourType").empty();
		    for(var i=0;i<24;i++){
				var $option = $('<option value="'+ i +'">'+ i +'</option>');
				$("#hourType").append($option);
			}
		 	var options = document.getElementById('hourType').children;
        	options[hour-1].selected=true;
	    }else{//是当天
			//小时选择列表
			$("#hourType").empty();
		    for(var i=0;i<hour;i++){
				var $option = $('<option value="'+ i +'">'+ i +'</option>');
				$("#hourType").append($option);
			}
		    $('#hourType option:last').attr('selected','selected');
	    }
		
	    $("#div_1").css("width","58%");
	    $("#div_2").css("width","27%");
	    $("#div_3").css("width","15%");
	    
	}else{
		$("#hourType").hide();
		
		$("#div_1").css("width","60%");
	    $("#div_2").css("width","40%");
	    
	    $("#selectDatesystemReport_Stt").val(initDefaultDate(-1,'day'));  //View
    	startDateTime = $("#selectDatesystemReport_Stt").val()+hms00;
    	selectDateNS.setMinAndMax(initDefaultDate(-DayRange_3month,"day"),initDefaultDate(-1,"day"));
	}
	    
	get_info($("#lottreyType").val(),0);
}

function get_info(lotteryId,index){
	startDateTime = $("#selectDatesystemReport_Stt").val()+hms00;
	
	//小时日工资
	if($("#lottreyType").val() == 14){ 
		if(index == 1){//时间控件进来
		    var today = new Date();
			var day = today.getDate();
		    var daytime = $("#selectDatesystemReport_Stt").val();
		    if(Number(day) != Number(daytime.split("/")[2])){
		    	//小时选择列表
				$("#hourType").empty();
			    for(var i=0;i<24;i++){
					var $option = $('<option value="'+ i +'">'+ i +'</option>');
					$("#hourType").append($option);
				}
		    }else{//是当天
				//小时选择列表
				var today = new Date();
				var hour = today.getHours();
				$("#hourType").empty();
			    for(var i=0;i<hour;i++){
					var $option = $('<option value="'+ i +'">'+ i +'</option>');
					$("#hourType").append($option);
				}
			    $('#hourType option:last').attr('selected','selected');
		    }
		}
	    
	    //统计
		var param = '{"InterfaceName":"/api/v1/netweb/SysMgr_GetTotalReportList","ProjectPublic_PlatformCode":2,"UserID":"'+myUserID+'","LotteryId":"'+$("#lottreyType").val()+'","Hour":"'+$("#hourType").val()+'","Datetime":"'+startDateTime+'"}';
			ajaxUtil.ajaxByAsyncPost1(null, param, getReportList_Total, null);
		//自身
		var param = '{"InterfaceName":"/api/v1/netweb/SysMgr_GetReportList","ProjectPublic_PlatformCode":2,"UserID":"'+myUserID+'","LotteryId":"'+$("#lottreyType").val()+'","Hour":"'+$("#hourType").val()+'","IsSelf":"0","Datetime":"'+startDateTime+'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_bonusRecord + '}';
			ajaxUtil.ajaxByAsyncPost1(null, param, getReportList_Self, null);
		//下级
		var param = '{"InterfaceName":"/api/v1/netweb/SysMgr_GetReportList","ProjectPublic_PlatformCode":2,"UserID":"'+myUserID+'","LotteryId":"'+$("#lottreyType").val()+'","Hour":"'+$("#hourType").val()+'","IsSelf":"1","Datetime":"'+startDateTime+'","CurrentPageIndex":' + page + ',"CurrentPageSize":999999999}';
			ajaxUtil.ajaxByAsyncPost1(null, param, getReportList_Subordinate, null);
	}else{
		//统计
		var param = '{"InterfaceName":"/api/v1/netweb/SysMgr_GetTotalReportList","ProjectPublic_PlatformCode":2,"UserID":"'+myUserID+'","LotteryId":"'+$("#lottreyType").val()+'","Datetime":"'+startDateTime+'"}';
			ajaxUtil.ajaxByAsyncPost1(null, param, getReportList_Total, null);
		//自身
		var param = '{"InterfaceName":"/api/v1/netweb/SysMgr_GetReportList","ProjectPublic_PlatformCode":2,"UserID":"'+myUserID+'","LotteryId":"'+$("#lottreyType").val()+'","IsSelf":"0","Datetime":"'+startDateTime+'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_bonusRecord + '}';
			ajaxUtil.ajaxByAsyncPost1(null, param, getReportList_Self, null);
		//下级
		var param = '{"InterfaceName":"/api/v1/netweb/SysMgr_GetReportList","ProjectPublic_PlatformCode":2,"UserID":"'+myUserID+'","LotteryId":"'+$("#lottreyType").val()+'","IsSelf":"1","Datetime":"'+startDateTime+'","CurrentPageIndex":' + page + ',"CurrentPageSize":999999999}';
			ajaxUtil.ajaxByAsyncPost1(null, param, getReportList_Subordinate, null);
	}
	
}

//@ 返回数据   统计
function getReportList_Total(data){
	if (page == 0) {
        $("#systemReportTotal").empty();
        $("#systemReportScroller").scroller().scrollToTop();
        $("#systemReportScroller").scroller().clearInfinite();
    }
	
	if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    
	    if($("#lottreyType").val() != 14){ // 正常显示   
			var info = data.Data.SysMgrList;
			if (info.length >0){
				isHasMorePage(info,PAGESIZE_systemReport);
				$("#systemReportTotal").empty();
				$("#systemReportTotal_tip").html('&nbsp&nbsp&nbsp&nbsp直属：'+info[0].ChildNum);
				$.each(info,function (key,val) {
					
					if($("#lottreyType").val() == 10){//提款手续费(BetMoney)
						var $li = $('<ul class="recordDetail"><li>活跃人数:&nbsp;<span>'+ val.ActiveNumber +'</span></li><li>提款手续费:&nbsp;<span>' + val.BetMoney + '</span></li></ul>');
			            $("#systemReportTotal").append($li);
					}else{
						var $li = $('<ul class="recordDetail"><li>活跃人数:&nbsp;<span>'+ val.ActiveNumber +'</span></li><li>购彩:&nbsp;<span>' + val.BetMoney + '</span></li><li>返点:&nbsp;<span>' + val.RebateMoney +'</span></li><li>中奖:&nbsp;<span>'+ val.WinnMoney +'</span></li><li>盈亏:&nbsp;<span id="lossID_all">'+ val.LossMoney +'</span></li><li>亏损（不平账）:&nbsp;<span>'+ val.NoLossAccountMoney +'</span></li><li>其他收入:&nbsp;<span>'+ val.OtherMoney +'</span></li></ul>');
			            $("#systemReportTotal").append($li);
			            
			            if($("#lossID_all").val() < 0){
			            	$("#lossID_all").css('color','red');
			            }else if($("lossID_all").val() > 0){
			            	$("#lossID_all").css('color','green');
			            }else{
			            	$("#lossID_all").css('color','#FE5D39');
			            }
					}
		        });
			}
	    }else{ //小时日工资
	    	var info = data.Data.SysMgrList;
			if (info.length >0){
				isHasMorePage(info,PAGESIZE_systemReport);
				$("#systemReportTotal").empty();
				$("#systemReportTotal_tip").html('&nbsp&nbsp&nbsp&nbsp直属：'+info[0].ChildNum);
				$.each(info,function (key,val) {
					
					if($("#lottreyType").val() == 10){//提款手续费(BetMoney)
						var $li = $('<ul class="recordDetail"><li>活跃人数:&nbsp;<span>'+ val.ActiveNumber +'</span></li><li>提款手续费:&nbsp;<span>' + val.BetMoney + '</span></li></ul>');
			            $("#systemReportTotal").append($li);
					}else{
						var $li = $('<ul class="recordDetail"><li>用户名:&nbsp;<span>'+ myUserName +'</span></li><li>购彩:&nbsp;<span>' + val.BetMoney + '</span></li><li>盈亏:&nbsp;<span id="lossID_all">'+ val.LossMoney +'</span></li><li>备注:&nbsp;<span id="lossID_all">--</span></li></ul>');
			            $("#systemReportTotal").append($li);
			            
			            if($("#lossID_all").val() < 0){
			            	$("#lossID_all").css('color','red');
			            }else if($("lossID_all").val() > 0){
			            	$("#lossID_all").css('color','green');
			            }else{
			            	$("#lossID_all").css('color','#FE5D39');
			            }
					}
		        });
			}
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 返回数据    自身 
function getReportList_Self(data){
	if (page == 0) {
        $("#systemReportMy").empty();
        $("#systemReportScroller").scroller().scrollToTop();
        $("#systemReportScroller").scroller().clearInfinite();
    }
	
	if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    
	    if($("#lottreyType").val() != 14){ // 正常显示   
			var info = data.Data.SysMgrList;
			if (info.length >0){
				isHasMorePage(info,PAGESIZE_systemReport);
				$("#systemReportMy").empty();
				$("#systemReportMy_tip").html('&nbsp&nbsp&nbsp&nbsp直属：'+info[0].ChildNum);
				$.each(info,function (key,val) {
					if($("#lottreyType").val() == 10){//提款手续费(BetMoney)
						var $li = $('<ul class="recordDetail"><li>用户名:&nbsp;<span>' + val.UserName + '</span></li><li>活跃人数:&nbsp;<span>'+ val.ActiveNumber +'</span></li><li>提款手续费:&nbsp;<span>' + val.BetMoney + '</span></li></ul>');
			            $("#systemReportMy").append($li);
					}else{
						var $li = $('<ul class="recordDetail"><li>用户名:&nbsp;<span>' + val.UserName + '</span></li><li>活跃人数:&nbsp;<span>'+ val.ActiveNumber +'</span></li><li>购彩:&nbsp;<span>' + val.BetMoney + '</span></li><li>返点:&nbsp;<span>' + val.RebateMoney +'</span></li><li>中奖:&nbsp;<span>'+ val.WinnMoney +'</span></li><li>盈亏:&nbsp;<span id="lossID_self">'+ val.LossMoney +'</span></li><li>亏损（不平账）:&nbsp;<span>'+ val.NoLossAccountMoney+'</span></li><li>其他收入:&nbsp;<span>'+ val.OtherMoney +'</span></li></ul>');
						$("#systemReportMy").append($li);
		            
						if($("#lossID_self").val() < 0){
							$("#lossID_self").css('color','red');
						}else if($("lossID_self").val() > 0){
							$("#lossID_self").css('color','green');
						}else{
							$("#lossID_self").css('color','#FE5D39');
						}
					}
		        });
			}
	    }else{//按天小时查询
	    	var info = data.Data.SysMgrList;
			if (info.length >0){
				isHasMorePage(info,PAGESIZE_systemReport);
				$("#systemReportMy").empty();
				$("#systemReportMy_tip").html('&nbsp&nbsp&nbsp&nbsp直属：'+info[0].ChildNum);
				$.each(info,function (key,val) {
					if($("#lottreyType").val() == 10){//提款手续费(BetMoney)
						var $li = $('<ul class="recordDetail"><li>用户名:&nbsp;<span>' + val.UserName + '</span></li><li>活跃人数:&nbsp;<span>'+ val.ActiveNumber +'</span></li><li>提款手续费:&nbsp;<span>' + val.BetMoney + '</span></li></ul>');
			            $("#systemReportMy").append($li);
					}else{
						var $li = $('<ul class="recordDetail"><li>用户名:&nbsp;<span>' + val.UserName + '</span></li><li>购彩:&nbsp;<span>' + val.BetMoney + '</span></li><li>盈亏:&nbsp;<span id="lossID_self">'+ val.LossMoney +'</span></li><li>备注:&nbsp;<span id="lossID_self">'+ val.Mark +'</span></li></ul>');
						$("#systemReportMy").append($li);
		            
						if($("#lossID_self").val() < 0){
							$("#lossID_self").css('color','red');
						}else if($("lossID_self").val() > 0){
							$("#lossID_self").css('color','green');
						}else{
							$("#lossID_self").css('color','#FE5D39');
						}
					}
		        });
			}
	    }
	    
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 返回数据     下级 
function getReportList_Subordinate(data){
	if (page == 0) {
        $("#systemReportList").empty();
        $("#systemReportScroller").scroller().scrollToTop();
        $("#systemReportScroller").scroller().clearInfinite();
    }
	
	if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    
	    if($("#lottreyType").val() != 14){ // 正常显示   
			var info = data.Data.SysMgrList;
			if (info.length >0){
				isHasMorePage(info,PAGESIZE_systemReport);
				$("#xiaji_div").show();
				$.each(info,function (key,val) {
		            var findSubordinates = {};
		            findSubordinates.userID = val.UserID;
		            findSubordinates.userName = val.UserName;
		            findSubordinates.LotteryId = $("#lottreyType").val();
		
		            if (val.ChildNum > 0){
		            	if($("#lottreyType").val() == 10){//提款手续费(BetMoney)
							var $li = $('<li onclick="systemReport_Subordinates(this)" id="'+val.UserName+'_'+val.UserID +'"><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39">' + val.UserName + '</span>&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + val.ChildNum +'</dd><dd>活跃人数:&nbsp;'+ val.ActiveNumber +'</dd><dd>提款手续费:&nbsp;' + val.BetMoney + '</dd></dl></a></li>').data('systemReportCttInfo',findSubordinates);
						}else{
							var $li = $('<li onclick="systemReport_Subordinates(this)" id="'+val.UserName+'_'+val.UserID +'"><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39">' + val.UserName + '</span>&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + val.ChildNum +'</dd><dd>活跃人数:&nbsp;'+ val.ActiveNumber +'</dd><dd>购彩:&nbsp;' + val.BetMoney + '</dd><dd>返点:&nbsp;' + val.RebateMoney +'</dd><dd>中奖:&nbsp;'+ val.WinnMoney +'</dd><dd>盈亏:&nbsp;<span id="lossID_Subordinate'+key+'">'+ val.LossMoney +'</span></dd><dd>亏损（不平账）:&nbsp;'+ val.NoLossAccountMoney +'</dd><dd>其他收入:&nbsp;'+ val.OtherMoney +'</dd></dl></a></li>').data('systemReportCttInfo',findSubordinates);
						}
		            }else{
		            	if($("#lottreyType").val() == 10){//提款手续费(BetMoney)
							var $li = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + val.UserName + '&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + val.ChildNum +'</dd><dd>活跃人数:&nbsp;'+ val.ActiveNumber +'</dd><dd>提款手续费:&nbsp;' + val.BetMoney + '</dd></dl></a></li>').data('systemReportCttInfo',findSubordinates);
						}else{
							var $li = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + val.UserName + '&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + val.ChildNum +'</dd><dd>活跃人数:&nbsp;'+ val.ActiveNumber +'</dd><dd>购彩:&nbsp;' + val.BetMoney + '</dd><dd>返点:&nbsp;' + val.RebateMoney +'</dd><dd>中奖:&nbsp;'+ val.WinnMoney +'</dd><dd>盈亏:&nbsp;<span id="lossID_Subordinate'+key+'">'+ val.LossMoney +'</span></dd><dd>亏损（不平账）:&nbsp;'+ val.NoLossAccountMoney +'</dd><dd>其他收入:&nbsp;'+ val.OtherMoney +'</dd></dl></a></li>').data('systemReportCttInfo',findSubordinates);
		            	}
		            }
		            $("#systemReportList").append($li);
		            
		        });
		        
		        for (var j = 0; j < info.length; j++) {
		            if(info[j].LossMoney < 0){
						$("#lossID_Subordinate"+ j).css('color','red');
					}else if(info[j].LossMoney > 0){
						$("#lossID_Subordinate"+ j).css('color', 'green');
					}else{
						$("#lossID_Subordinate"+ j).css('color','#666666');
					}
		        }
			}
	    }else{//按小时查询
			var info = data.Data.SysMgrList;
			if (info.length >0){
				isHasMorePage(info,PAGESIZE_systemReport);
				$("#xiaji_div").show();
				$.each(info,function (key,val) {
		            var findSubordinates = {};
		            findSubordinates.userID = val.UserID;
		            findSubordinates.userName = val.UserName;
		            findSubordinates.LotteryId = $("#lottreyType").val();
		
		            if (val.ChildNum > 0){
		            	if($("#lottreyType").val() == 10){//提款手续费(BetMoney)
							var $li = $('<li onclick="systemReport_Subordinates(this)" id="'+val.UserName+'_'+val.UserID +'"><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39">' + val.UserName + '</dd><dd>活跃人数:&nbsp;'+ val.ActiveNumber +'</dd><dd>提款手续费:&nbsp;' + val.BetMoney + '</dd></dl></a></li>').data('systemReportCttInfo',findSubordinates);
						}else{
							var $li = $('<li onclick="systemReport_Subordinates(this)" id="'+val.UserName+'_'+val.UserID +'"><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39">' + val.UserName + '</dd><dd>购彩:&nbsp;' + val.BetMoney + '</dd><dd>盈亏:&nbsp;<span id="lossID_Subordinate'+key+'">'+ val.LossMoney +'</span></dd><dd>备注:&nbsp;'+ val.Mark +'</dd></dl></a></li>').data('systemReportCttInfo',findSubordinates);
						}
		            }else{
		            	if($("#lottreyType").val() == 10){//提款手续费(BetMoney)
							var $li = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + val.UserName + '</dd><dd>活跃人数:&nbsp;'+ val.ActiveNumber +'</dd><dd>提款手续费:&nbsp;' + val.BetMoney + '</dd></dl></a></li>').data('systemReportCttInfo',findSubordinates);
						}else{
							var $li = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + val.UserName + '</dd><dd>购彩:&nbsp;' + val.BetMoney + '</dd><dd>盈亏:&nbsp;<span id="lossID_Subordinate'+key+'">'+ val.LossMoney +'</span></dd><dd>备注:&nbsp;'+ val.Mark +'</dd></dl></a></li>').data('systemReportCttInfo',findSubordinates);
		            	}
		            }
		            $("#systemReportList").append($li);
		            
		        });
		        
		        for (var j = 0; j < info.length; j++) {
		            if(info[j].LossMoney < 0){
						$("#lossID_Subordinate"+ j).css('color','red');
					}else if(info[j].LossMoney > 0){
						$("#lossID_Subordinate"+ j).css('color', 'green');
					}else{
						$("#lossID_Subordinate"+ j).css('color','#666666');
					}
		        }
			}
	    }
	    
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 查询下级列表
function systemReport_Subordinates(element) {
	//导航
	var str = element.id;
	if(str == "")return;
	daohang_Arr.push(str);
    onItemClickListener_systemReport(str);     
    myUserName = str.split("_")[0];
    loadBySearchsystemReport();
    $("#xiaji_div").hide();
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_systemReport(str) {
	var searchConditions = {};
	searchConditions.type =  $("#lottreyType").val();
	searchConditions.dateStt =  $("#selectDatesystemReport_Stt").val();
//	searchConditions.dateEnd =  $("#selectDatesystemReport_End").val();
	searchConditions.name = str.split("_")[0];
    searchConditions.id = str.split("_")[1];
	searchConditions.isDetail =  true;
	saveSearchTerm(searchConditions);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchsystemReport() {
	//纵向滑动
	_myScroller.scrollToTop();
    _myScroller.clearInfinite();

	//横向滑动
	systemReport_nav_horScroller.adjustScroll();
	systemReport_nav_horScroller.clearInfinite();
	
	$("#systemReportScroller").scroller().scrollToTop();
    $("#systemReportScroller").scroller().clearInfinite();
    var conditions = getSearchTerm();
    if (null != conditions) {

        var typeOptions = document.getElementById('lottreyType').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }

        type = $("#lottreyType").val();
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#selectDatesystemReport_Stt").val(conditions.dateStt);
//      $("#selectDatesystemReport_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_systemReport(0,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_systemReport(-DayRange_3month,"day",-1,"day");     //Controller
                break;
        }
        
        myUserID= conditions.id;
    	myUserName = conditions.name;
    	
    	$("#systemReport_navigationLabel").empty();
		for(var i=0;i<daohang_Arr.length;i++){
			var str = daohang_Arr[i];
			if(i==0){
				var $navigationLabel_Li = $('<span id='+ str.split("_")[0]+ '_' + str.split("_")[1]+'>'+ str.split("_")[0] +'</span>');
			}else{
				var $navigationLabel_Li = $('<span id='+ str.split("_")[0]+ '_'  + str.split("_")[1]+'>'+ '&nbsp&nbsp>&nbsp&nbsp' + str.split("_")[0] +'</span>');
			}
			$("#systemReport_navigationLabel").append($navigationLabel_Li);	
		}
	    //导航条换行，动态展示UI
	    var daoHangHeight = parseInt(parseInt($("#systemReport_navigationLabel").css("height")) / 35);
	    var scrollerTop = 90;
	    if( daoHangHeight > 1){
		    var scorollerTop =  scrollerTop + 35*(daoHangHeight-1);
		    $("#systemReportScroller").css("top",scorollerTop + "px");
	    }else {
		    $("#systemReportScroller").css("top",scrollerTop + "px");
	    }

        $("#systemReport_navigationLabel span").click(function (e) {
        	var nn = 0;
			for(var i = $("#systemReport_navigationLabel span").length -1 ;i >0 ; i--){
				if($("#systemReport_navigationLabel span")[i].innerHTML != $(this).context.innerHTML){
					nn++;
				}else{
					break;
				}
			}
			for(var j=0;j<nn ;j++){
				$("#systemReport_navigationLabel span:last").remove();
				daohang_Arr.pop();
			}
			
			onItemClickListener_systemReport($(this).context.id);     
            loadBySearchsystemReport();
        });	

        //根据查询条件查询数据
        get_info(type,0);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
    } else {
        get_info(type,0);
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_systemReport(minNum,minType,maxNum,maxType){
    selectDateNS.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selectDateNE.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}