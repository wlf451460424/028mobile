
//页大小
var PAGESIZE_dailyWagesRecord = 10;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var setStartDate_dailyWages;
var setEndDate_dailyWages;
var IsSelf = 0;
//@ 进入panel时调用
function dailyWagesRecordsLoadedPanel(){
    catchErrorFun("dailyWagesRecordInit();");
}

//@ 离开panel时调用
function dailyWagesRecordsUnloadedPanel(){
    $("#dailyWagesRecordList").empty();
    IsSelf = 0;
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";

    if(setStartDate_dailyWages){
        setStartDate_dailyWages.dismiss();
    }
    if(setEndDate_dailyWages){
        setEndDate_dailyWages.dismiss();
    }
}

//@ 初始化
function dailyWagesRecordInit() {
    $("#dailyWages_selectDate").empty();
    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td><select name="dailyWagesRecordType" id="dailyWagesRecordType" data-theme="a" data-mini="true" onchange="changedailyWagesType()"><option value="0" selected="selected">自身日工资</option><option value="1">直属下级日工资</option></select></td><td><input type="text" id="selectDatedailyWages_Stt" readonly/></td>'+'<td><input type="text" id="selectDatedailyWages_End" readonly/></td></tr></table>');
    $("#dailyWages_selectDate").append($select);

    setStartDate_dailyWages = new MobileSelectDate();
    setStartDate_dailyWages.init({trigger:'#selectDatedailyWages_Stt',min:initDefaultDate(-89,"day"),max:initDefaultDate(0,"day")});
    setEndDate_dailyWages = new MobileSelectDate();
    setEndDate_dailyWages.init({trigger:'#selectDatedailyWages_End',min:initDefaultDate(-89,"day"),max:initDefaultDate(0,"day")});
    myUserID = localStorageUtils.getParam("myUserID");

    var _myScroller =  $("#dailyWagesRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'dailyWagesRecordList','getdailyWagesRecordsByScroll()');
    //进入时加载
    loadBySearchItemsdailyWages();

    //Search Username
    $("#dailyWagesRecordSearch").unbind('click');
    $("#dailyWagesRecordSearch").bind('click', function(event) {
        searchdailyWagesRecordUser();
    });
}

//@ 下拉加载下一页
function getdailyWagesRecordsByScroll(){
    startDateTime = $("#selectDatedailyWages_Stt").val() + hms00;
    endDateTime = $("#selectDatedailyWages_End").val() + hms59;
    IsSelf = $("#dailyWagesRecordType").val();
    getdailyWagesRecords_scroll(startDateTime, endDateTime, IsSelf);
}

//@ 改变查询类型 - 自身 或 下级
function changedailyWagesType() {
    page = 0;
    IsSelf = $("#dailyWagesRecordType").val();
    startDateTime = $("#selectDatedailyWages_Stt").val() + hms00;
    endDateTime = $("#selectDatedailyWages_End").val() + hms59;
    getdailyWagesRecord(startDateTime, endDateTime, IsSelf)
}

//@ 发送请求 First Page.
function getdailyWagesRecord(startDateTime, endDateTime, IsSelf) {
    page = 0;
    getdailyWagesRecords_scroll(startDateTime, endDateTime, IsSelf);
}
//@ Next Page
function getdailyWagesRecords_scroll(startDateTime, endDateTime, IsSelf) {
    var param = '{"InterfaceName":"/api/v1/netweb/GetDayWagesRecordsList","ProjectPublic_PlatformCode":2,"IsSelf":'+IsSelf+',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","UserID":"'+ myUserID +'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_dailyWagesRecord + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getdailyWagesRecord_callBack, null);
}

//@ 返回数据
function getdailyWagesRecord_callBack(data){
    if (page == 0) {
        $("#dailyWagesRecordList").empty();
        $("#dailyWagesRecordScroller").scroller().scrollToTop();
        $("#dailyWagesRecordScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    var info = data.Data.GetWayWagesList;
        isHasMorePage(info,PAGESIZE_dailyWagesRecord);
        for (var i = 0; i < info.length; i++) {
            var dataSet = new Object();
            dataSet.UserName = info[i].User_Name;  //用户名
            dataSet.BettingAmount = info[i].BettingAmount;  //投注总额
            dataSet.LossAmount = info[i].LossAmount;  //盈利额
            dataSet.ActivePersonNum = info[i].ActivePersonNum;  //活跃人数
            dataSet.DayWagesRatio = bigNumberUtil.multiply(info[i].DayWagesRatio,100);  //日工资比例

            dataSet.CreateTime = info[i].CreateTime;  //时间
            dataSet.DetailSource = info[i].DetailSource;  //发放类型
            if(dataSet.DetailSource == "264" || dataSet.DetailSource == "266"){
                dataSet.DayWagesAmount = "-"+info[i].DayWagesAmount;  //日工资金额
            }else{
                dataSet.DayWagesAmount = info[i].DayWagesAmount;  //日工资金额
            }
            var $itemLi = $('<li></li>').data('dailyWagesRecords',dataSet);
            $itemLi.on('click',function() {
                onItemClickListenerdailyWages();
                localStorageUtils.setParam("dailyWagesRecords",JSON.stringify($(this).data('dailyWagesRecords')));
                setPanelBackPage_Fun('dailyWagesRecordsDetail');
            });
            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;<span class="red">' + dataSet.UserName + '</span></dd><dd>盈利总额:&nbsp;' + dataSet.LossAmount +'</dd><dd>日工资金额:&nbsp;'+dataSet.DayWagesAmount+'</dd><dd>时间:&nbsp;' + dataSet.CreateTime +'</dd></dl></a>');

            $("#dailyWagesRecordList").append($itemLi);
        }
	}else{
	    toastUtils.showToast(data.Msg);
	}

     else if(data.SystemState == -1){
        loginAgain();
    } else if (data.DataCount == 0) {
        toastUtils.showToast("没有数据");
        return;
    } else {
        toastUtils.showToast("当前网络不给力，请稍后再试");
        return;
    }
}

//@ 搜索用户名
function searchdailyWagesRecordUser(){
    $.ui.popup({
        title:"查询用户名",
        message:'<input type="text" id="searchdailyWagesRcdUser" maxLength="25" placeholder="请输入要查找的用户名" />',
        cancelText:"关闭",
        cancelCallback:
            function(){
            },
        doneText:"确定",
        doneCallback:
            function() {
                var searchUser = $("#searchdailyWagesRcdUser").val();
                if (searchUser == "") {
                    toastUtils.showToast("请输入要查找的用户名");
                    return;
                }
                page = 0;
                IsSelf = $("#dailyWagesRecordType").val();
                var param = '{"InterfaceName":"/api/v1/netweb/GetDayWagesRecordsList","ProjectPublic_PlatformCode":2,"User_Name":"' + searchUser + '","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","IsSelf":' + IsSelf + ',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_dailyWagesRecord + '}';
                ajaxUtil.ajaxByAsyncPost1(null, param, getdailyWagesRecord_callBack, null);
            },
        cancelOnly:false
    });
}

//@ 页面数据加载入口
function loadBySearchItemsdailyWages() {
    var conditionsdailyWages = getSearchTerm();
    if (null != conditionsdailyWages) {
        if(unloadAtBettingDetail == false){
            initdailyWagesRecordsPage();
        }else {
            var typeOptions = document.getElementById('dailyWagesRecordType').options;
            for (var i = 0; i < typeOptions.length; i++) {
                typeOptions[i].selected = false;
                if (typeOptions[i].value == conditionsdailyWages.IsSelf) {
                    typeOptions[i].selected = true;
                }
            }
            IsSelf = conditionsdailyWages.IsSelf;
            startDateTime = conditionsdailyWages.dateStt + hms00;
            endDateTime = conditionsdailyWages.dateEnd + hms59;
            $("#selectDatedailyWages_Stt").val(conditionsdailyWages.dateStt);
            $("#selectDatedailyWages_End").val(conditionsdailyWages.dateEnd);

            //根据条件查询数据
            getdailyWagesRecord(startDateTime, endDateTime, IsSelf);
            //重置isDetail标记，表示从记录界面返回
            var searchconditionsdailyWages = getSearchTerm();
            searchconditionsdailyWages.isDetail = false;
            saveSearchTerm(searchconditionsdailyWages);
        }
    } else {
        initdailyWagesRecordsPage();
    }
}
//@ 非详情页进入页面时初始化查询条件
function initdailyWagesRecordsPage() {
    IsSelf = 0;
    $("#selectDatedailyWages_Stt").val(initDefaultDate(0,"day"));
    $("#selectDatedailyWages_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDatedailyWages_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDatedailyWages_End").val()+hms59;
    getdailyWagesRecord(startDateTime, endDateTime, IsSelf);
}

//@ 每个item点击时，触发该方法，保存当前的查询条件
function onItemClickListenerdailyWages() {
    var searchconditionsdailyWages = {};
    searchconditionsdailyWages.IsSelf =  $("#dailyWagesRecordType").val();
    searchconditionsdailyWages.dateStt = $("#selectDatedailyWages_Stt").val();
    searchconditionsdailyWages.dateEnd = $("#selectDatedailyWages_End").val();
    searchconditionsdailyWages.isDetail = true;
    saveSearchTerm(searchconditionsdailyWages);
}
