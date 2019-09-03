//页大小
var PAGESIZE_teamReportSubordinate = 20;
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

var selDateTRSubStart;
var selDateTRSubEnd;

/*进入panel时调用*/
function teamReportSubordinateLoadedPanel(){
	catchErrorFun("teamReportSubordinateInit();");
}
/*离开panel时调用*/
function teamReportSubordinateUnloadedPanel(){
	$("#teamReportSubordinateList").empty();
    localStorageUtils.removeParam("subordinateId");
    clearSearchTerm();      
    startDateTime = "";
    endDateTime = ""; 
    type = 0;
    page = 0;
    uid = "";
    queryName="";
    userName = "";
    if(selDateTRSubStart){
        selDateTRSubStart.dismiss();
    }
    if(selDateTRSubEnd){
        selDateTRSubEnd.dismiss();
    }
}
function teamReportSubordinateInit(){
    $("#selectteamReportSubordinateID").empty();
    var $select=$('<table><tr>' +
        '<td><select name="searchDate_teamReportSub" id="searchDate_teamReportSub" data-theme="a" data-mini="true" onchange="dateChange_teamReportSubordinate()"><option value="0" selected="selected">当天记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDateTRSub_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateTRSub_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="searchType_teamReportSub" id="searchType_teamReportSub" data-theme="a" data-mini="true" onchange="typeChange_teamReportSubordinate()"><option value="0" selected="selected">下级类型：全部</option><option value="1">下级类型：会员</option><option value="2">下级类型：代理</option></select></td></tr></table>');
    $("#selectteamReportSubordinateID").append($select);

    selDateTRSubStart = new MobileSelectDate();
    selDateTRSubStart.init({trigger:'#selectDateTRSub_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateTRSubEnd = new MobileSelectDate();
    selDateTRSubEnd.init({trigger:'#selectDateTRSub_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    uid = localStorageUtils.getParam("subordinateId");
    if(uid == null){
        uid = localStorageUtils.getParam("myUserID");
    }
    type = 0;
    page = 0;
    hasMorePage = true;//默认还有分页
    var _myScroller =  $("#teamReportSubordinateScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'teamReportSubordinateList','getSearchteamReportSubordinate()');
    //进入时加载
    loadBySearchteamReportSubordinate();
    //返回
    $("#teamReportSubordinateBackId").unbind('click');
    $("#teamReportSubordinateBackId").bind('click', function(event) {
        onBackKeyDown();
        setPanelBackPage_Fun('proxyManage');
    });

    /**
     * 团队充值查询
     */
    $("#queryteamReportSubordinateButtonID").unbind('click');
    $("#queryteamReportSubordinateButtonID").bind('click', function(event) {
             $.ui.popup({
                title:"下级统计查询",
                message:'<input type="text" id="teamReportSubordinateUserNameId" maxLength="25"  placeholder="请输入要查找的用户名" />',
                cancelText:"关闭",
                cancelCallback:
                function(){
                },
                doneText:"确定",
                doneCallback:
                function(){
                    var searchUser = $("#teamReportSubordinateUserNameId").val();
                    var temp = localStorageUtils.getParam("myUserID");
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                     return;
                    }
                    if(uid != temp){
                         toastUtils.showToast("下级代理不支持用户名搜索");
                        return;
                    }
                   queryteamReportSubordinateUserNameIdUserName(searchUser);
                },
                cancelOnly:false
            });
    });
}

function getSearchteamReportSubordinate(){
    searchteamReportSubordinate_Record(startDateTime, endDateTime, type)
}

/**
 * 通过查询条件加载数据 
 */
function loadBySearchteamReportSubordinate() {
    var conditions = getSearchTerm();
    if (null != conditions) {
        var dataOptions = document.getElementById('searchDate_teamReportSub').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }      
        var typeOptions = document.getElementById('searchType_teamReportSub').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }
        type = $("#searchType_teamReportSub").val();
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#selectDateTRSub_Stt").val(conditions.dateStt);
        $("#selectDateTRSub_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_TRSub(0,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_TRSub(-89,"day",-1,"day");     //Controller
                break;
        }

        //根据查询条件查询数据
        searchteamReportSubordinate(startDateTime, endDateTime, type);
         //重置isDetail标记，表示从记录界面返回
         var searchConditions = getSearchTerm();
         searchConditions.isDetail =  false;
         saveSearchTerm(searchConditions);
     } else {
        initTeamReportSubPage();
     }
}

function initTeamReportSubPage() {
    type = 0;
    $("#selectDateTRSub_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateTRSub_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateTRSub_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateTRSub_End").val()+hms59;
    searchteamReportSubordinate(startDateTime, endDateTime, type);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_teamReportSubordinate() {
    var searchConditions = {};
    searchConditions.time =  $("#searchDate_teamReportSub").val();
    searchConditions.type =  $("#searchType_teamReportSub").val();
    searchConditions.dateStt =  $("#selectDateTRSub_Stt").val();
    searchConditions.dateEnd =  $("#selectDateTRSub_End").val();
    searchConditions.isDetail =  true;
    saveSearchTerm(searchConditions);
}

//日期改变事件
function dateChange_teamReportSubordinate() {
    var timeType = $("#searchDate_teamReportSub").val();
    type = $("#searchType_teamReportSub").val();
    switch(timeType) {
        case "0":
            //当天记录
            $("#selectDateTRSub_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateTRSub_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateTRSub_Stt").val()+hms00;
            endDateTime = $("#selectDateTRSub_End").val()+hms59;
            searchteamReportSubordinate(startDateTime, endDateTime,type);
            changeDateRange_TRSub(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateTRSub_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateTRSub_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateTRSub_Stt").val()+hms00;
            endDateTime = $("#selectDateTRSub_End").val()+hms59;
            searchteamReportSubordinate(startDateTime, endDateTime,type);
            changeDateRange_TRSub(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_TRSub(minNum,minType,maxNum,maxType){
    selDateTRSubStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateTRSubEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 *查询团队充值记录 
 */
function searchteamReportSubordinate_Record(startDateTime, endDateTime, type) {
    var temp = localStorageUtils.getParam("myUserID");
    if(uid != temp){//下级
        ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","RebateType":1,"InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReportSubordinate + '}', teamReportSubordinate_searchSuccessCallBack, '正在加载数据...');
    }else{
        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"","User_ID":"'+uid+'","RebateType":1,"InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReportSubordinate + '}', teamReportSubordinate_searchSuccessCallBack, '正在加载数据...');
    }
}
/**
 *查询团队充值记录 
 */
function searchteamReportSubordinate(startDateTime, endDateTime, type) {
    page=0;
    var temp = localStorageUtils.getParam("myUserID");
    if(uid != temp){//下级
        ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","RebateType":1,"InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReportSubordinate + '}', teamReportSubordinate_searchSuccessCallBack, '正在加载数据...');
    }else{
        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"","User_ID":"'+uid+'","RebateType":1,"InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReportSubordinate + '}', teamReportSubordinate_searchSuccessCallBack, '正在加载数据...');
    }
}

//类型改变事件
function typeChange_teamReportSubordinate() {
    type = $("#searchType_teamReportSub").val();
    startDateTime = $("#selectDateTRSub_Stt").val()+hms00;
    endDateTime = $("#selectDateTRSub_End").val()+hms59;
    searchteamReportSubordinate(startDateTime, endDateTime, type);
}

function teamReportSubordinate_searchSuccessCallBack(data){
    if (page == 0) {
        $("#teamReportSubordinateList").empty();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	         toastUtils.showToast("没有数据");
	         return;
	    }
	    if (data.Data.DataCount ==0) {
            toastUtils.showToast("没有数据");
            return;
        }
	    if (data.Data.DataCount !=0) {
            var info = data.Data.ReportComm;
            isHasMorePage(info,PAGESIZE_teamReportSubordinate);
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
                //手续费
                dataSet.FeeMoneyTotal = info[i].FeeMoneyTotal;
                //开始时间
                dataSet.beginDate = startDateTime;
                //结束时间
                dataSet.endDate = endDateTime;
                var $itemLi = $('<li></li>').data('teamReportSubordinate',dataSet);
                    $itemLi.on('click',function() {
                        onItemClickListener_teamReportSubordinate();             
                        localStorageUtils.setParam("teamReportSubordinate",JSON.stringify($(this).data('teamReportSubordinate')));
                        setPanelBackPage_Fun('teamReportSubordinateDetail');
                    });
                    $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;' + dataSet.userName + '</dd><dd>直属:&nbsp;<span class="red">' + dataSet.childNum +'</span></dd><dd>类型:&nbsp;'+dataSet.category+'</dd><dd>团队:&nbsp;' + dataSet.teamCount +'</dd></dl></a>');
                $("#teamReportSubordinateList").append($itemLi);
            }
        }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//根据用户名查找
function queryteamReportSubordinateUserNameIdUserName(searchUser){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","UserName":"' + searchUser + '","InterfaceName":"/api/v1/netweb/GetTotalChildReport","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamReportSubordinate + '}', 
    teamReportSubordinate_searchSuccessCallBack, '正在加载数据...');
}

function onBackKeyDown(){
    clearSearchTerm();
    var temp = localStorageUtils.getParam("myUserID");
    localStorageUtils.setParam("subordinateId", temp);
}