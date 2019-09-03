//页大小
var PAGESIZE_teamReport = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var UserName = "";
//用户id
var UserId = "";

//下级类型
var type = 0;

var queryName="";

var selDateTRStart;
var selDateTREnd;

var daohang_Arr=[];

/*进入panel时调用*/
function teamReportLoadedPanel(){
	catchErrorFun("teamReportInit();");
}
/*离开panel时调用*/
function teamReportUnloadedPanel(){
	daohang_Arr = [];
	$("#teamReport_navigationLabel").empty();
	$("#teamReportList").empty();
	$("#teamReportTotal").empty();
	$("#teamReportMy").empty();
    localStorageUtils.removeParam("Id");
    clearSearchTerm();      
    startDateTime = "";
    endDateTime = ""; 
    type = 0;
    page = 0;
    UserId = "";
    queryName="";
    UserName = "";
    if(selDateTRStart){
        selDateTRStart.dismiss();
    }
    if(selDateTREnd){
        selDateTREnd.dismiss();
    }
}

var _myScroller; //纵向滑动
var teamReport_nav_horScroller; //横向滑动
function teamReportInit(){
	$("#xiaji_div").hide();
    $("#selectteamReportID").empty();
    var $select=$('<table><tr>' +
        '<td><select name="searchDate_teamReport" id="searchDate_teamReport" data-theme="a" data-mini="true" onchange="dateChange_teamReport()"><option value="0" selected="selected">当天记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDateteamReport_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateteamReport_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="type_teamReport" id="type_teamReport" data-theme="a" data-mini="true" onchange="typeChange_teamReport()"><option value="0" selected="selected">下级类型：全部</option><option value="1">下级类型：会员</option><option value="2">下级类型：代理</option></select></td></tr></table>');
    $("#selectteamReportID").append($select);

    selDateTRStart = new MobileSelectDate();
    selDateTRStart.init({trigger:'#selectDateteamReport_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateTREnd = new MobileSelectDate();
    selDateTREnd.init({trigger:'#selectDateteamReport_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    UserId = localStorageUtils.getParam("myUserID");
    UserName = localStorageUtils.getParam("username");
    
    type = 0;
    page = 0;
    hasMorePage = true;//默认还有分页
    _myScroller =  $("#teamReportScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'teamReportList','getSearchteamReport()');

    //导航条横向滑动
	//【iScroll】参考文档：http://wiki.jikexueyuan.com/project/iscroll-5/
	teamReport_nav_horScroller =  $("#teamReport_nav_scroller").scroller({
		verticalScroll : false,
		horizontalScroll : true,
		vScrollCSS: "afScrollbar",
		autoEnable : true,
		click:true
	});
	teamReport_nav_horScroller.scrollToTop();
	teamReport_nav_horScroller.clearInfinite();

    //进入时加载
    loadBySearchteamReport();
    //返回
    $("#teamReportBackId").unbind('click');
    $("#teamReportBackId").bind('click', function(event) {
        onBackKeyDown();
        setPanelBackPage_Fun('proxyManage');
    });

    /**
     * 团队充值查询
     */
    $("#queryteamReportButtonID").unbind('click');
    $("#queryteamReportButtonID").bind('click', function(event) {
             $.ui.popup({
                title:"下级统计查询",
                message:'<input type="text" id="teamReportUserNameId" maxLength="25"  placeholder="请输入要查找的用户名" />',
                cancelText:"关闭",
                cancelCallback:
                function(){
                },
                doneText:"确定",
                doneCallback:
                function(){
                    var searchUser = $("#teamReportUserNameId").val();
                    var temp = localStorageUtils.getParam("myUserID");
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                     return;
                    }
                    if(UserId != temp){
                         toastUtils.showToast("下级代理不支持用户名搜索");
                        return;
                    }
                   queryteamReportUserNameIdUserName(searchUser);
                   
//                 var str = searchUser + "_" + UserId;
//					if(str == "")return;
//					daohang_Arr.push(str);
//				    onItemClickListener_teamReport(str);     
//				    UserName = str.split("_")[0];
//				    loadBySearchteamReport();
//				    $("#xiaji_div").hide();
				    
                },
                cancelOnly:false
            });
    });
    
    //导航
	var $navigationLabel_Li = $('<span id='+UserId+'>'+ UserName +'</span>');
	$("#teamReport_navigationLabel").append($navigationLabel_Li);
	daohang_Arr.push(UserName+'_'+UserId);
	
//	$("#teamReportTotal").empty();
//	var $ReportAllLUL=$('<ul class="recordDetail"><li>充值总额：<span id="charge_all">0</span></li><li>提款总额：<span id="withdrawal_all">0</span></li><li>购彩总额：<span id="buyLottery_all">0</span></li><li>返点总额：<span id="point_all">0</span></li><li>中奖总额：<span id="prize_all">0</span></li><li style="display: none;">日结：<span id="dailywage_all">0</span></li><li>其他收入：<span id="others_all">0</span></li><li>盈利总额：<span id="winTotal_all">0</span></li></ul>');
//	$("#teamReportTotal").append($ReportAllLUL);
//	$("#teamReportMy").empty();
//	var $SelfUL=$('<ul class="recordDetail"><li>充值总额：<span id="charge_Self">0</span></li><li>提款总额：<span id="withdrawal_Self">0</span></li><li>购彩总额：<span id="buyLottery_Self">0</span></li><li>返点总额：<span id="point_Self">0</span></li><li>中奖总额：<span id="prize_Self">0</span></li><li style="display: none;">日结：<span id="dailywage_Self">0</span></li><li>其他收入：<span id="others_Self">0</span></li><li>盈利总额：<span id="winTotal_Self">0</span></li></ul>');
//  $("#teamReportMy").append($SelfUL);

}

function getSearchteamReport(){
    searchteamReport_Record(startDateTime, endDateTime, type)
}

/**
 *记录 
 */
function searchteamReport_Record(startDateTime, endDateTime, type) {
    var temp = localStorageUtils.getParam("myUserID");
    if(UserId != temp){//下级
        ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+UserId+'","RebateType":1,"InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReport + '}', teamReport_searchSuccessCallBack, '正在加载数据...');
    	//团队
    	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"'+UserName+'","RebateType":1,"ISself":0,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportTotalSuccessCallBack, '正在加载数据...');
    	//自身
    	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"'+UserName+'","RebateType":1,"ISself":1,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportMySuccessCallBack, '正在加载数据...');
    }else{
        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"","User_ID":"'+UserId+'","RebateType":1,"InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReport + '}', teamReport_searchSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"'+UserName+'","RebateType":1,"ISself":0,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportTotalSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"'+UserName+'","RebateType":1,"ISself":1,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportMySuccessCallBack, '正在加载数据...');
    }
}
/**
 *记录 
 */
function searchteamReport(startDateTime, endDateTime, type) {
    page=0;
    var temp = localStorageUtils.getParam("myUserID");
    if(UserId != temp){//下级
        ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+UserId+'","RebateType":1,"InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReport + '}', teamReport_searchSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"'+UserName+'","RebateType":1,"ISself":0,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportTotalSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"'+UserName+'","RebateType":1,"ISself":1,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportMySuccessCallBack, '正在加载数据...');
    }else{
        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"","User_ID":"'+UserId+'","RebateType":1,"InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReport + '}', teamReport_searchSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"'+UserName+'","RebateType":1,"ISself":0,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportTotalSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"'+UserName+'","RebateType":1,"ISself":1,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportMySuccessCallBack, '正在加载数据...');
    }
}

//根据用户名查找
function queryteamReportUserNameIdUserName(searchUser){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+UserId+'","UserName":"' + searchUser + '","InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReport + '}', 
    teamReport_searchSuccessCallBack, '正在加载数据...');
    ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"' + searchUser + '","RebateType":1,"ISself":0,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportTotalSuccessCallBack, '正在加载数据...');
	ajaxUtil.ajaxByAsyncPost(null, '{"UserID":-1,"UserName":"' + searchUser + '","ProjectPublic_PlatformCode":2,"RebateType":1,"ISself":1,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportMySuccessCallBack, '正在加载数据...');
}

//下级列表
function teamReport_searchSuccessCallBack(data){
    if (page == 0) {
        $("#teamReportList").empty();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	         toastUtils.showToast("直属下级无数据");
	         return;
	    }
	    if (data.Data.DataCount ==0) {
	        //toastUtils.showToast("当前用户无直属下级");
	        $("#xiaji_div").hide();
	    }
	    if (data.Data.DataCount !=0) {
	        var info = data.Data.ReportComm;
	        isHasMorePage(info,PAGESIZE_teamReport);
	        $("#xiaji_div").show();
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = new Object();
	            //用户名
	            dataSet.userName = info[i].UserName;
	            //团队人数
	            dataSet.teamCount = info[i].TeamNum;
	            //直属下级人数
	            dataSet.childNum = info[i].ChildNum;
	            //用户类型
	            if ((parseInt(info[i].Category) & 64) == 64) {
	                dataSet.category = "会员";
	            } else {
	                dataSet.category = "代理";
	            }
	            //充值
	            dataSet.rechargeTotal = info[i].RechargeTotal;
	            //提款
	            dataSet.drawingsTotal = info[i].DrawingsTotal;
	            //购彩
	            dataSet.buyTotal = info[i].BuyTotal;
	            //返点
	            dataSet.rebateTotal = info[i].RebateTotal;
	            //中奖
	            dataSet.winningTotal = info[i].WinningTotal;
	            //其它
	            dataSet.otherTotal = info[i].OtherTotal;
	            //盈亏
	            dataSet.gainTotal = info[i].GainTotal;
	            //用户ID
	            dataSet.userId = info[i].UserID;
	            //日结
	            dataSet.TS_dailyWage = info[i].DailywageTotal;
	            //充值手续费
	            dataSet.rFeeMoney = info[i].RFeeMoney;
	            //提款手续费
	            dataSet.dFeeMoney = info[i].DFeeMoney;
	            //开始时间
	            dataSet.beginDate = startDateTime;
	            //结束时间
	            dataSet.endDate = endDateTime;
	            //其它合计
	            dataSet.otherAll = info[i].OtherTotal + info[i].DailywageTotal;
	            var $itemLi;
	            if(info[i].ChildNum > 0 ){
	            	$itemLi = $('<li onclick="teamReport_Subordinates(this)" id="'+dataSet.userName+'_'+dataSet.userId +'"><a class="recordList"><dl class="orderList"><dd><span style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39;">' + dataSet.userName + '</span>&nbsp;&nbsp;&nbsp;&nbsp; 直属:&nbsp;' + dataSet.childNum +'&nbsp;&nbsp;&nbsp;&nbsp;团队:&nbsp;' + dataSet.teamCount +'</dd><dd>类型:&nbsp;'+dataSet.category+'</dd><dd>充值:&nbsp;' + dataSet.rechargeTotal +'</dd><dd>提款:&nbsp;' + dataSet.drawingsTotal +'</dd><dd>购彩:&nbsp;' + dataSet.buyTotal +'</dd><dd>返点:&nbsp;' + dataSet.rebateTotal +'</dd><dd>中奖:&nbsp;' + dataSet.winningTotal +'</dd><dd>其它:&nbsp;' + dataSet.otherAll +'</dd><dd>充值手续费:&nbsp;' + dataSet.rFeeMoney +'</dd><dd>提款手续费:&nbsp;' + dataSet.dFeeMoney +'</dd><dd>盈亏:&nbsp;<span id="gainTotal'+i+'">' + dataSet.gainTotal +'</span></dd></dl></a></li>');
	            }else{
	            	$itemLi = $('<li><a><dl class="orderList"><dd><span style="font-weight: bold; color:#666666">用户名：' + dataSet.userName + '&nbsp;&nbsp;&nbsp;&nbsp; 直属:&nbsp;' + dataSet.childNum +'&nbsp;&nbsp;&nbsp;&nbsp;团队:&nbsp;' + dataSet.teamCount +'</span></dd><dd>类型:&nbsp;'+dataSet.category+'</dd><dd>充值:&nbsp;' + dataSet.rechargeTotal +'</dd><dd>提款:&nbsp;' + dataSet.drawingsTotal +'</dd><dd>购彩:&nbsp;' + dataSet.buyTotal +'</dd><dd>返点:&nbsp;' + dataSet.rebateTotal +'</dd><dd>中奖:&nbsp;' + dataSet.winningTotal +'</dd><dd>其它:&nbsp;' + dataSet.otherAll +'</dd><dd>充值手续费:&nbsp;' + dataSet.rFeeMoney +'</dd><dd>提款手续费:&nbsp;' + dataSet.dFeeMoney +'</dd><dd>盈亏:&nbsp;<span id="gainTotal'+i+'">' + dataSet.gainTotal +'</span></dd></dl></a></li>');
	            }
	            $("#teamReportList").append($itemLi);
	        }
	        for (var j = 0; j < info.length; j++) {
	            if(info[j].GainTotal < 0){
					$("#gainTotal"+ j).css('color','red');
				}else if(info[j].GainTotal > 0){
					$("#gainTotal"+ j).css('color', 'green');
				}else{
					$("#gainTotal"+ j).css('color','#666');
				}
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

function setColor(value){
	if(value < 0){
		return "red";
	}else if(value > 0){
		return "green";
	}else{
		return "#FE5D39";
	}
}

//@ 查询下级列表
function teamReport_Subordinates(element) {
	//alert($(this).context.id);
	//导航
	var str = element.id;
	if(str == "")return;
	daohang_Arr.push(str);
    onItemClickListener_teamReport(str);     
    UserName = str.split("_")[0];
    loadBySearchteamReport();
    $("#xiaji_div").hide();
}

/**
 * 团队统计方法回调函数
 */
function teamReportTotalSuccessCallBack(data) {
	if (data.Code == 200) {
		$("#teamReportTotal").empty();
		var $ReportAllLUL=$('<ul class="recordDetail"><li>充值总额：<span id="charge_all">0</span></li><li>提款总额：<span id="withdrawal_all">0</span></li><li>购彩总额：<span id="buyLottery_all">0</span></li><li>返点总额：<span id="point_all">0</span></li><li>中奖总额：<span id="prize_all">0</span></li><li style="display: none;">日结：<span id="dailywage_all">0</span></li><li>其他收入：<span id="others_all">0</span></li><li>充值手续费：<span id="others_rFeeMoney_all">0</span></li><li>提款手续费：<span id="others_dFeeMoney_all">0</span></li><li>盈利总额：<span id="winTotal_all">0</span></li></ul>');
		$("#teamReportTotal").append($ReportAllLUL);

		$("#teamReportTotal_tip").html('&nbsp&nbsp&nbsp&nbsp直属：'+data.Data.ReportComm[0].ChildNum+ '&nbsp&nbsp&nbsp&nbsp团队：'+data.Data.ReportComm[0].TeamNum );
		$("#charge_all").html(data.Data.ReportComm[0].RechargeTotal);
		$("#withdrawal_all").html(data.Data.ReportComm[0].DrawingsTotal);
		$("#buyLottery_all").html(data.Data.ReportComm[0].BuyTotal);
		$("#point_all").html(data.Data.ReportComm[0].RebateTotal);
		$("#prize_all").html(data.Data.ReportComm[0].WinningTotal);
		$("#winTotal_all").html(data.Data.ReportComm[0].GainTotal);
		$("#others_rFeeMoney_all").html(data.Data.ReportComm[0].RFeeMoney);
		$("#others_dFeeMoney_all").html(data.Data.ReportComm[0].DFeeMoney);
		
		
		if(data.Data.ReportComm[0].GainTotal < 0){
			$("#winTotal_all").css('color','red');
		}else if(data.Data.ReportComm[0].GainTotal > 0){
			$("#winTotal_all").css('color','green');
		}else{
			$("#winTotal_all").css('color','#FE5D39');
		}
		
		// $("#dailywage_all").html(data.ReportComm[0].DailywageTotal);
		$("#others_all").html(bigNumberUtil.add(data.Data.ReportComm[0].OtherTotal,data.Data.ReportComm[0].DailywageTotal).toString());
	} else {
		toastUtils.showToast(data.Msg);
	}
}
//@ 查询自身方法回调函数
function teamReportMySuccessCallBack(data) {
	if (data.Code == 200) {
		$("#teamReportMy").empty();
		var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="name_Self">0</span></li><li>充值总额：<span id="charge_Self">0</span></li><li>提款总额：<span id="withdrawal_Self">0</span></li><li>购彩总额：<span id="buyLottery_Self">0</span></li><li>返点总额：<span id="point_Self">0</span></li><li>中奖总额：<span id="prize_Self">0</span></li><li style="display: none;">日结：<span id="dailywage_Self">0</span></li><li>其他收入：<span id="others_Self">0</span></li><li>充值手续费：<span id="others_rFeeMoney_Self">0</span></li><li>提款手续费：<span id="others_dFeeMoney_Self">0</span></li><li>盈利总额：<span id="winTotal_Self">0</span></li></ul>');
	    $("#teamReportMy").append($SelfUL);

		$("#teamReportMy_tip").html('&nbsp&nbsp&nbsp&nbsp直属：'+data.Data.ReportComm[0].ChildNum+ '&nbsp&nbsp&nbsp&nbsp团队：'+data.Data.ReportComm[0].TeamNum );
		$("#name_Self").html(data.Data.ReportComm[0].UserName);
		$("#charge_Self").html(data.Data.ReportComm[0].RechargeTotal);
		$("#withdrawal_Self").html(data.Data.ReportComm[0].DrawingsTotal);
		$("#buyLottery_Self").html(data.Data.ReportComm[0].BuyTotal);
		$("#point_Self").html(data.Data.ReportComm[0].RebateTotal);
		$("#prize_Self").html(data.Data.ReportComm[0].WinningTotal);
		$("#others_rFeeMoney_Self").html(data.Data.ReportComm[0].RFeeMoney);
		$("#others_dFeeMoney_Self").html(data.Data.ReportComm[0].DFeeMoney);
		
		//其他，显示为其他+日结的和。
		var othersTotal = bigNumberUtil.add(data.Data.ReportComm[0].OtherTotal,data.Data.ReportComm[0].DailywageTotal).toString();
		$("#others_Self").html(othersTotal);
		$("#winTotal_Self").html(data.Data.ReportComm[0].GainTotal);
		
		if(data.Data.ReportComm[0].GainTotal < 0){
			$("#winTotal_Self").css('color','red');
		}else if(data.Data.ReportComm[0].GainTotal > 0){
			$("#winTotal_Self").css('color','green');
		}else{
			$("#winTotal_Self").css('color','#FE5D39');
		}
	} else {
		toastUtils.showToast(data.Msg);
	}
}

/**
 * 通过查询条件加载数据 
 */
function loadBySearchteamReport() {
	//纵向滑动
	_myScroller.scrollToTop();
    _myScroller.clearInfinite();
	//横向滑动
	teamReport_nav_horScroller.adjustScroll();
	teamReport_nav_horScroller.clearInfinite();

    var conditions = getSearchTerm();
    if (null != conditions) {
        var dataOptions = document.getElementById('searchDate_teamReport').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }      
        var typeOptions = document.getElementById('type_teamReport').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }
        type = $("#type_teamReport").val();
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#selectDateteamReport_Stt").val(conditions.dateStt);
        $("#selectDateteamReport_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_TR(0,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_TR(-89,"day",-1,"day");     //Controller
                break;
        }
        
        UserId = conditions.id;
    	UserName = conditions.name;
    	
    	$("#teamReport_navigationLabel").empty();
		for(var i=0;i<daohang_Arr.length;i++){
			var str = daohang_Arr[i];
			if(i==0){
				var $navigationLabel_Li = $('<span id='+ str.split("_")[0]+ '_' + str.split("_")[1]+'>'+ str.split("_")[0] +'</span>');
			}else{
				var $navigationLabel_Li = $('<span id='+ str.split("_")[0]+ '_'  + str.split("_")[1]+'>'+ '&nbsp&nbsp>&nbsp&nbsp' + str.split("_")[0] +'</span>');
			}
			$("#teamReport_navigationLabel").append($navigationLabel_Li);
		}
		
        $("#teamReport_navigationLabel span").click(function (e) {
        	var nn = 0;
			for(var i = $("#teamReport_navigationLabel span").length -1 ;i >0 ; i--){
				if($("#teamReport_navigationLabel span")[i].innerHTML != $(this).context.innerHTML){
					nn++;
				}else{
					break;
				}
			}
			for(var j=0;j<nn ;j++){
				$("#teamReport_navigationLabel span:last").remove();
				daohang_Arr.pop();
			}
			
			onItemClickListener_teamReport($(this).context.id);     
            loadBySearchteamReport();
        });	
        

        //根据查询条件查询数据
        searchteamReport(startDateTime, endDateTime, type);
         //重置isDetail标记，表示从记录界面返回
         var searchConditions = getSearchTerm();
         searchConditions.isDetail =  false;
         saveSearchTerm(searchConditions);
     } else {
        initTeamReportPage();
     }
}

function initTeamReportPage() {
    type = 0;
    $("#selectDateteamReport_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateteamReport_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateteamReport_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateteamReport_End").val()+hms59;
    searchteamReport(startDateTime, endDateTime, type);
}

//日期改变事件
function dateChange_teamReport() {
    var timeType = $("#searchDate_teamReport").val();
    type = $("#type_teamReport").val();
    switch(timeType) {
        case "0":
            //当天记录
            $("#selectDateteamReport_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateteamReport_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateteamReport_Stt").val()+hms00;
            endDateTime = $("#selectDateteamReport_End").val()+hms59;
            searchteamReport(startDateTime, endDateTime,type);
            changeDateRange_TR(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateteamReport_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateteamReport_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateteamReport_Stt").val()+hms00;
            endDateTime = $("#selectDateteamReport_End").val()+hms59;
            searchteamReport(startDateTime, endDateTime,type);
            changeDateRange_TR(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_TR(minNum,minType,maxNum,maxType){
    selDateTRStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateTREnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//类型改变事件
function typeChange_teamReport() {
    type = $("#type_teamReport").val();
    startDateTime = $("#selectDateteamReport_Stt").val()+hms00;
    endDateTime = $("#selectDateteamReport_End").val()+hms59;
    searchteamReport(startDateTime, endDateTime, type);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */

function onItemClickListener_teamReport(str) {
	var searchConditions = {};
    searchConditions.time =  $("#searchDate_teamReport").val();
    searchConditions.type =  $("#type_teamReport").val();
    searchConditions.dateStt =  $("#selectDateteamReport_Stt").val();
    searchConditions.dateEnd =  $("#selectDateteamReport_End").val();
    searchConditions.name = str.split("_")[0];
    searchConditions.id = str.split("_")[1];
    searchConditions.isDetail =  true;
    saveSearchTerm(searchConditions);
}

function onBackKeyDown(){
    clearSearchTerm();
    var temp = localStorageUtils.getParam("myUserID");
    localStorageUtils.setParam("Id", temp);
}


