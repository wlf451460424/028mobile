//页大小
var PAGESIZE_teamCharge = 30;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//收支类型
var type = 1;
var queryName="";
var selDateTCStart;
var selDateTCEnd;
/*进入panel时调用*/
function teamChargeLoadedPanel(){
    catchErrorFun("teamChargeInit();");
}
/*离开panel时调用*/
function teamChargeUnloadedPanel(){
    $("#teamChargeList").empty();
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    type = 1;
    queryName="";
    userName = "";
    if(selDateTCStart){
        selDateTCStart.dismiss();
    }
    if(selDateTCEnd){
        selDateTCEnd.dismiss();
    }
}
function teamChargeInit(){
    $("#selectteamChargeID").empty();
    //状态 - null:全部; 1:交易成功; 2:交易失败; 0:未处理(暂时去掉).
    var $select=$('<table><tr>' +
        '<td><select name="searchDate_teamCharge" id="searchDate_teamCharge" data-theme="a" data-mini="true" onchange="dateChange_teamCharge()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDateTC_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateTC_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="searchType_teamCharge" id="searchType_teamCharge" data-theme="a" data-mini="true" onchange="typeChange_teamCharge()"><option value="null">状态：全部</option>'+
        '<option selected="selected" value="1">状态：交易成功</option>'+
        '<option value="2">状态：交易失败</option>'+
        '</select></td></tr></table>');

    $("#selectteamChargeID").append($select);
    //查询开始时间
    selDateTCStart = new MobileSelectDate();
    selDateTCStart.init({trigger:'#selectDateTC_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selDateTCEnd = new MobileSelectDate();
    selDateTCEnd.init({trigger:'#selectDateTC_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    userName = localStorageUtils.getParam("username");
    type = 1;
    page = 0;
    hasMorePage = true;//默认还有分页
    var _myScroller =  $("#teamChargeScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'teamChargeList','getteamCharge()');
    //进入时加载
    loadBySearchIteamCharge();

    /**
     * 团队充值查询（右上角搜索）
     */
    $("#queryTeamChargeButtonID").unbind('click');
    $("#queryTeamChargeButtonID").bind('click', function(event) {
        $.ui.popup({
            title:"团队充值查询",
            message:'<input type="text" id="teamChargeUserNameId" maxLength="25"  placeholder="请输入要查找的用户名" />',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var searchUser = $("#teamChargeUserNameId").val();
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                        return;
                    }
                    queryTeamChargeUserName(searchUser);
                },
            cancelOnly:false
        });
    });
}

function getteamCharge(){
    searchTeamCharge_Record(startDateTime, endDateTime, type);
}
/**
 * 通过查询条件加载数据
 */
function loadBySearchIteamCharge() {
    var conditions = getSearchTerm();
    if (null != conditions) {
        var dataOptions = document.getElementById('searchDate_teamCharge').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }
        var typeOptions = document.getElementById('searchType_teamCharge').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }
        type = $("#searchType_teamCharge").val();
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#selectDateTC_Stt").val(conditions.dateStt);
        $("#selectDateTC_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_TC(-3,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_TC(-33,"day",-4,"day");     //Controller
                break;
        }

        //根据查询条件查询数据
        searchTeamCharge(startDateTime, endDateTime, type);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
    } else {
        initTeamCharge();
    }
}

function initTeamCharge() {
    type = 1;
    $("#selectDateTC_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateTC_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateTC_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateTC_End").val()+hms59;
    searchTeamCharge(startDateTime, endDateTime, type);
}


//日期改变事件
function dateChange_teamCharge() {
    var timeType = $("#searchDate_teamCharge").val();
    type = $("#searchType_teamCharge").val();
    switch(timeType) {
        case "0":
            //当前记录
            $("#selectDateTC_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateTC_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateTC_Stt").val()+hms00;
            endDateTime = $("#selectDateTC_End").val()+hms59;
            searchTeamCharge(startDateTime, endDateTime,type);
            changeDateRange_TC(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateTC_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDateTC_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDateTC_Stt").val()+hms00;
            endDateTime = $("#selectDateTC_End").val()+hms59;
            searchTeamCharge(startDateTime, endDateTime,type);
            changeDateRange_TC(-33,"day",-4,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_TC(minNum,minType,maxNum,maxType){
    selDateTCStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateTCEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}


//@ 查询团队充值记录
function searchTeamCharge(startDateTime, endDateTime, type) {
    page=0;
    searchTeamCharge_Record(startDateTime, endDateTime, type)
}

//@ 查询团队充值记录
function searchTeamCharge_Record(startDateTime, endDateTime, type) {
    ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/GetUserRechargeInfoByPage","SearchMyTeam":true,"ProjectPublic_PlatformCode":2,"RechargeState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamCharge + '}',
    TeamCharge_searchSuccessCallBack, '正在加载数据...');
}

//@ 类型改变事件
function typeChange_teamCharge() {
    type = $("#searchType_teamCharge").val();
    startDateTime = $("#selectDateTC_Stt").val()+hms00;
    endDateTime = $("#selectDateTC_End").val()+hms59;
    searchTeamCharge(startDateTime, endDateTime, type);
}

//@ 每个item点击时，触发该方法，保存当前的查询条件
function onItemClickListener_teamCharge() {
    var searchConditions = {};
    searchConditions.time =  $("#searchDate_teamCharge").val();
    searchConditions.type =  $("#searchType_teamCharge").val();
    searchConditions.dateStt =  $("#selectDateTC_Stt").val();
    searchConditions.dateEnd =  $("#selectDateTC_End").val();
    searchConditions.isDetail =  true;
    saveSearchTerm(searchConditions);
}

//@ Ajax返回数据
function TeamCharge_searchSuccessCallBack(data){
	$("#teamCharge_noData_tips").hide();
    if (page == 0) {
        $("#teamChargeList").empty();
        $("#teamChargeScroller").scroller().scrollToTop();
        $("#teamChargeScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#teamCharge_noData_tips").show();
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount ==0) {
	    	$("#teamCharge_noData_tips").show();
	      //toastUtils.showToast("没有数据");
	    }
	    var info=data.Data.ModelList;
	    if (data.Data.DataCount !=0) {
	        isHasMorePage(info,PAGESIZE_teamCharge);
	        for (var i = 0; i < info.length; i++) {
	            var text = "";
	            var dataSet = new Object();
	            //订单号
	            dataSet.orderId = info[i].RechargeOrder;
	            //账户
	            dataSet.accountnum = info[i].UserName;
	            //交易时间
	            dataSet.optime = info[i].CreateTime;
	            //交易备注
		        dataSet.details =info[i].RechargeMark;
		        if(info[i].RechargeType != "2" && info[i].RechargeType != "3" && info[i].RechargeType != "4"){
			        if(!info[i].RechargeMark){
				        dataSet.details="用户充值";
			        }
		        }
	            //交易状态
	            dataSet.state = getChargeState1(info[i].RechargeState+"");
	            //金额
	            dataSet.tmoney =parseFloat(info[i].RechargeMoney);
	            //手续费
	            dataSet.feeMoney =parseFloat(info[i].FeeMoney);
		        //充值类型
		        dataSet.payType = info[i].PayTypeName || "";
	
	            var $itemLi = $('<li></li>').data('teamCharge',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListener_teamCharge();
	                localStorageUtils.setParam("teamCharge",JSON.stringify($(this).data('teamCharge')));
	                setPanelBackPage_Fun('teamChargeDetail');
	            });
	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;' + dataSet.accountnum + '</dd><dd>金额:&nbsp;<span class="red">' + dataSet.tmoney +'元</span></dd><dd>方式:&nbsp;'+dataSet.payType+'</dd><dd>时间:&nbsp;' + dataSet.optime +'</dd></dl></a>');
	            $("#teamChargeList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 根据用户名查找
function queryTeamChargeUserName(searchUser){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"LikeUserName":"'+searchUser+'","InterfaceName":"/api/v1/netweb/GetUserRechargeInfoByPage","SearchMyTeam":true,"ProjectPublic_PlatformCode":2,"RechargeState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamCharge + '}',
        TeamCharge_searchSuccessCallBack, '正在加载数据...');
}