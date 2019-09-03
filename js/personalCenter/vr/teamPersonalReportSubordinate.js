//页大小
var PAGESIZE_teamPersonalReportSub = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//下级类型
var type = 0;
//用户id
var uid = "";
var queryName="";

var selDateGRSubStart;
var selDateGRSubEnd;

/*进入panel时调用*/
function teamPersonalReportSubordinateLoadedPanel(){
    catchErrorFun("teamPersonalReportSubordinateInit();");
}
/*离开panel时调用*/
function teamPersonalReportSubordinateUnloadedPanel(){
    $("#teamPersonalReportSubordinateList").empty();
    localStorageUtils.removeParam("personalSubordinateId");
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    type = 0;
    page = 0;
    uid = "";
    queryName="";
    userName = "";
    if(selDateGRSubStart){
        selDateGRSubStart.dismiss();
    }
    if(selDateGRSubEnd){
        selDateGRSubEnd.dismiss();
    }
}
function teamPersonalReportSubordinateInit(){
    $("#selectteamPersonalReportSubordinateID").empty();
    var $select=$('<table><tr>' +
        '<td><select name="searchDate_teamPersonalReportSub" id="searchDate_teamPersonalReportSub" data-theme="a" data-mini="true" onchange="dateChange_teamPersonalReportSubordinate()"><option value="0" selected="selected">当天时间</option><option value="1">历史时间</option></select></td>' +
        '<td><input type="text" id="vr_selectDateGRSub_Stt" readonly/></td>' +
        '<td><input type="text" id="vr_selectDateGRSub_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="searchType_teamPersonalReportSub" id="searchType_teamPersonalReportSub" data-theme="a" data-mini="true" onchange="typeChange_teamPersonalReportSub()"><option value="0" selected="selected">下级类型：全部</option><option value="1">下级类型：会员</option><option value="2">下级类型：代理</option></select></td></tr></table>');
    $("#selectteamPersonalReportSubordinateID").append($select);

    selDateGRSubStart = new MobileSelectDate();
    selDateGRSubStart.init({trigger:'#vr_selectDateGRSub_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateGRSubEnd = new MobileSelectDate();
    selDateGRSubEnd.init({trigger:'#vr_selectDateGRSub_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    uid = localStorageUtils.getParam("personalSubordinateId");
    if(uid == null){
        uid = localStorageUtils.getParam("myUserID");
    }
    type = 0;
    page = 0;
    hasMorePage = true;//默认还有分页
    var _myScroller =  $("#teamPersonalReportSubordinateScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'teamPersonalReportSubordinateList','getSearchteamPersonalReportSubordinate()');
    //进入时加载
    loadBySearchteamPersonalReportSubordinate();
    //返回
    $("#teamPersonalReportSubordinateBackId").unbind('click');
    $("#teamPersonalReportSubordinateBackId").bind('click', function(event) {
        onBackKeyDown();
        setPanelBackPage_Fun('personalReport');
    });

    /**
     * VR 真人团队报表查询
     */
    $("#queryteamPersonalReportSubordinateButtonID").unbind('click');
    $("#queryteamPersonalReportSubordinateButtonID").bind('click', function(event) {
        $.ui.popup({
            title:"下级统计查询",
            message:'<input type="text" id="teamPersonalReportSubordinateUserNameId" maxLength="25"  placeholder="请输入要查找的用户名" />',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var searchUser = $("#teamPersonalReportSubordinateUserNameId").val();
                    var temp = localStorageUtils.getParam("myUserID");
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                        return;
                    }
                    if(uid != temp){
                        toastUtils.showToast("下级代理不支持用户名搜索");
                        return;
                    }
                    queryteamPersonalReportSubordinateUserNameIdUserName(searchUser);
                },
            cancelOnly:false
        });
    });
}

function getSearchteamPersonalReportSubordinate(){
    searchTeamPersonalReportSub_Record(startDateTime, endDateTime, type)
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchteamPersonalReportSubordinate() {
    var conditions = getSearchTerm();
    if (null != conditions) {
        var dataOptions = document.getElementById('searchDate_teamPersonalReportSub').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }
        var typeOptions = document.getElementById('searchType_teamPersonalReportSub').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }
        type = $("#searchType_teamPersonalReportSub").val();
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#vr_selectDateGRSub_Stt").val(conditions.dateStt);
        $("#vr_selectDateGRSub_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_GRSub(0,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_GRSub(-DayRange_3month,"day",-1,"day");     //Controller
                break;
        }

        //根据查询条件查询数据
        searchteamPersonalReportSubordinate(startDateTime, endDateTime, type);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
    } else {
        initTeamPersonalReportSubPage();
    }
}

function initTeamPersonalReportSubPage() {
    type = 0;
    $("#vr_selectDateGRSub_Stt").val(initDefaultDate(0,"day"));
    $("#vr_selectDateGRSub_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#vr_selectDateGRSub_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#vr_selectDateGRSub_End").val()+hms59;
    searchteamPersonalReportSubordinate(startDateTime, endDateTime, type);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_teamPersonalReportSubordinate() {
    var searchConditions = {};
    searchConditions.time =  $("#searchDate_teamPersonalReportSub").val();
    searchConditions.type =  $("#searchType_teamPersonalReportSub").val();
    searchConditions.dateStt =  $("#vr_selectDateGRSub_Stt").val();
    searchConditions.dateEnd =  $("#vr_selectDateGRSub_End").val();
    searchConditions.isDetail =  true;
    saveSearchTerm(searchConditions);
}

//日期改变事件
function dateChange_teamPersonalReportSubordinate() {
    var timeType = $("#searchDate_teamPersonalReportSub").val();
    type = $("#searchType_teamPersonalReportSub").val();
    switch(timeType) {
        case "0":
            //当天记录
            $("#vr_selectDateGRSub_Stt").val(initDefaultDate(0,'day'));  //View
            $("#vr_selectDateGRSub_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#vr_selectDateGRSub_Stt").val()+hms00;
            endDateTime = $("#vr_selectDateGRSub_End").val()+hms59;
            searchteamPersonalReportSubordinate(startDateTime, endDateTime,type);
            changeDateRange_GRSub(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#vr_selectDateGRSub_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#vr_selectDateGRSub_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#vr_selectDateGRSub_Stt").val()+hms00;
            endDateTime = $("#vr_selectDateGRSub_End").val()+hms59;
            searchteamPersonalReportSubordinate(startDateTime, endDateTime,type);
            changeDateRange_GRSub(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_GRSub(minNum,minType,maxNum,maxType){
    selDateGRSubStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateGRSubEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 *查询团队下级记录 nextPage
 */
function searchTeamPersonalReportSub_Record(startDateTime, endDateTime, type) {
    var temp = localStorageUtils.getParam("myUserID");
    if(uid != temp){//查询下级后代列表数据
        ajaxUtil.ajaxByAsyncPost(null, '{"UserID":"'+uid+'","GetUserType":0,"InterfaceName":"/api/v1/netweb/VRGetRePortChild","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamPersonalReportSub + '}', teamPersonalReportSub_SuccessCallBack, '正在加载数据...');
    }else{ //我的下级列表数据
        ajaxUtil.ajaxByAsyncPost(null, '{"UserID":"'+uid+'","InterfaceName":"/api/v1/netweb/VRGetRePortChild","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamPersonalReportSub + '}', teamPersonalReportSub_SuccessCallBack, '正在加载数据...');
    }
}
/**
 *查询团队下级记录Init
 */
function searchteamPersonalReportSubordinate(startDateTime, endDateTime, type) {
    page=0;
    searchTeamPersonalReportSub_Record(startDateTime, endDateTime, type);
}

//类型改变事件
function typeChange_teamPersonalReportSub() {
    type = $("#searchType_teamPersonalReportSub").val();
    startDateTime = $("#vr_selectDateGRSub_Stt").val()+hms00;
    endDateTime = $("#vr_selectDateGRSub_End").val()+hms59;
    searchteamPersonalReportSubordinate(startDateTime, endDateTime, type);
}

function teamPersonalReportSub_SuccessCallBack(data){
    if (page == 0) {
        $("#teamPersonalReportSubordinateList").empty();
    }
    
    if (data.Code == 200) {
		if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount !=0) {
	        var info = data.Data.VRRPtlist;
	        isHasMorePage(info,PAGESIZE_teamPersonalReportSub);
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = {};
	            //用户名
	            dataSet.userName = info[i].UserName;
	            //投注金额
	            dataSet.PersonalPay = info[i].betmoney;
	            //中奖金额
	            dataSet.PersonalGet = info[i].winmoney;
	            //uid
	            dataSet.userId = info[i].UserID;
	            //ChildNum
	            dataSet.ChildNum = info[i].ChildNum;
	            //用户类型
	            if ((parseInt(info[i].Category) & 64) == 64) {
	                dataSet.category = "会员";
	            } else {
	                dataSet.category = "代理";
	            }
	             //打赏金额
	            dataSet.Rewards = info[i].Rewards;
	            //盈亏
	            dataSet.winloss = info[i].winloss;
	            //其他收入
	            dataSet.Dailywage = info[i].Dailywage;
	
	            var $itemLi = $('<li></li>').data('teamPersonalReportSubordinate',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListener_teamPersonalReportSubordinate();
	                localStorageUtils.setParam("teamPersonalReportSubordinate",JSON.stringify($(this).data('teamPersonalReportSubordinate')));
	                setPanelBackPage_Fun('teamPersonalReportSubordinateDetail');
	            });
	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名：' + dataSet.userName + '</dd><dd>类型：'+dataSet.category+'</dd><dd>投注金额：' + dataSet.PersonalPay +'</dd><dd>中奖金额：' + dataSet.PersonalGet +'</dd></dl></a>');
	            $("#teamPersonalReportSubordinateList").append($itemLi);
	        }
	    }
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//根据用户名查找
function queryteamPersonalReportSubordinateUserNameIdUserName(searchUser){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"UserID":"'+uid+'","UserName":"' + searchUser + '","InterfaceName":"/api/v1/netweb/VRGetRePortChild","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamPersonalReportSub + '}',
        teamPersonalReportSub_SuccessCallBack, '正在加载数据...');
}

function onBackKeyDown(){
    clearSearchTerm();
    var temp = localStorageUtils.getParam("myUserID");
    localStorageUtils.setParam("personalSubordinateId", temp);
}