
//页大小
var PAGESIZE_lossDailyWagesRecord = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var setStartDate_lossDailyWages;
var setEndDate_lossDailyWages;
var IsHistory = false;

//@ 进入panel时调用
function lossDailyWagesRecordsLoadedPanel(){
    catchErrorFun("lossDailyWagesRecordInit();");
}

//@ 离开panel时调用
function lossDailyWagesRecordsUnloadedPanel(){
    $("#lossDailyWagesRecordList").empty();
    IsHistory = false;
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";

    if(setStartDate_lossDailyWages){
        setStartDate_lossDailyWages.dismiss();
    }
    if(setEndDate_lossDailyWages){
        setEndDate_lossDailyWages.dismiss();
    }
}

//@ 初始化
function lossDailyWagesRecordInit() {
    $("#lossDailyWages_selectDate").empty();
    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td><select name="searchDate_lossDwReds" id="searchDate_lossDwReds" data-theme="a" data-mini="true" onchange="changeLossDailyWagesDate()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectDatelossDailyWages_Stt" readonly/></td>'+'<td><input type="text" id="selectDatelossDailyWages_End" readonly/></td></tr></table>');
    $("#lossDailyWages_selectDate").append($select);

    setStartDate_lossDailyWages = new MobileSelectDate();
    setStartDate_lossDailyWages.init({trigger:'#selectDatelossDailyWages_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    setEndDate_lossDailyWages = new MobileSelectDate();
    setEndDate_lossDailyWages.init({trigger:'#selectDatelossDailyWages_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    myUserID = localStorageUtils.getParam("myUserID");

    hasMorePage = true; //默认还有分页

    var _myScroller =  $("#lossDailyWagesRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'lossDailyWagesRecordList','getlossDailyWagesRecordsByScroll()');
    //进入时加载
    loadBySearchItemslossDailyWages();

    //Search Username
   /* $("#lossDailyWagesRecordSearch").unbind('click');
    $("#lossDailyWagesRecordSearch").bind('click', function(event) {
        searchlossDailyWagesRecordUser();
    });*/
}

//@ 下拉加载下一页
function getlossDailyWagesRecordsByScroll(){
    startDateTime = $("#selectDatelossDailyWages_Stt").val() + hms00;
    endDateTime = $("#selectDatelossDailyWages_End").val() + hms59;
    getlossDailyWagesRecords_scroll(startDateTime, endDateTime);
}

//@ 改变查询类型 - now or history
function changeLossDailyWagesDate() {
    var timeType = $("#searchDate_lossDwReds").val();
    switch(timeType) {
        case "0":
            //当前记录
            $("#selectDatelossDailyWages_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDatelossDailyWages_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDatelossDailyWages_Stt").val()+hms00;
            endDateTime = $("#selectDatelossDailyWages_End").val()+hms59;
            IsHistory = false;
            getlossDailyWagesRecord(startDateTime, endDateTime);
            changeDateRange_lossDW(-3,"day",0,"day");   //Controller
            break;

        case "1":
            //历史记录
            $("#selectDatelossDailyWages_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDatelossDailyWages_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDatelossDailyWages_Stt").val()+hms00;
            endDateTime = $("#selectDatelossDailyWages_End").val()+hms59;
            IsHistory = true;
            getlossDailyWagesRecord(startDateTime, endDateTime);
            changeDateRange_lossDW(-33,"day",-4,"day");  //Controller
            break;
    }
}

//@ 切换当前记录或者历史记录时。
function changeDateRange_lossDW(minNum,minType,maxNum,maxType){
    setStartDate_lossDailyWages.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    setEndDate_lossDailyWages.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//@ 发送请求 First Page.
function getlossDailyWagesRecord(startDateTime, endDateTime) {
    page = 0;
    getlossDailyWagesRecords_scroll(startDateTime, endDateTime);
}
//@ Next Page
function getlossDailyWagesRecords_scroll(startDateTime, endDateTime) {
    var param = '{"InterfaceName":"/api/v1/netweb/GetDayWagesRecord","ProjectPublic_PlatformCode":2,"IsSelf":"0","ProvideTyp":"302","IsHistory":'+IsHistory+',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_lossDailyWagesRecord + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getlossDailyWagesRecord_callBack, null);
}

//@ 返回数据
function getlossDailyWagesRecord_callBack(data){
    if (page == 0) {
        $("#lossDailyWagesRecordList").empty();
        $("#lossDailyWagesRecordScroller").scroller().scrollToTop();
        $("#lossDailyWagesRecordScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    var info = data.Data.GetWayWagesList;
	    if (info.length >0){
	        isHasMorePage(info,PAGESIZE_lossDailyWagesRecord);
	
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = {};
	            dataSet.UserName = info[i].User_Name;  //用户名
	            dataSet.LossAmount = info[i].LossAmount;  //盈利总额
	            dataSet.ActivePersonNum = info[i].ActivePersonNum;  //活跃人数
	            dataSet.DayWagesRatio = bigNumberUtil.multiply(info[i].DayWagesRatio,100);  //日工资比例
	            dataSet.SalesVolume = info[i].SalesVolume; //投注量
	            dataSet.CreateTime = info[i].CreateTime;  //时间
	            dataSet.DetailSource = info[i].DetailSource;  //发放类型
	            dataSet.Remark = info[i].Remark;  //备注
	
	            if(dataSet.DetailSource == "264" || dataSet.DetailSource == "266"){
	                dataSet.DayWagesAmount = "-"+info[i].DayWagesAmount;  //亏损工资
	            }else{
	                dataSet.DayWagesAmount = info[i].DayWagesAmount;  //亏损工资
	            }
	            var $itemLi = $('<li></li>').data('lossDailyWagesRecords',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListenerlossDailyWages();
	                localStorageUtils.setParam("lossDailyWagesRecords",JSON.stringify($(this).data('lossDailyWagesRecords')));
	                setPanelBackPage_Fun('lossDailyWagesRecordsDetail');
	            });
	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;<span class="red">' + dataSet.UserName + '</span></dd><dd>当日亏损:&nbsp;' + dataSet.LossAmount +'</dd><dd>亏损工资比例:&nbsp;'+dataSet.DayWagesRatio+'% </dd><dd>时间:&nbsp;' + dataSet.CreateTime +'</dd></dl></a>');
	
	            $("#lossDailyWagesRecordList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}


//@ 页面数据加载入口
function loadBySearchItemslossDailyWages() {
    var conditionsLossDW = getSearchTerm();

    if (null != conditionsLossDW) {
        var dataOptions = document.getElementById('searchDate_lossDwReds').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditionsLossDW.time) {
                dataOptions[i].selected = true;
            }
        }

        startDateTime = conditionsLossDW.dateStt + hms00;
        endDateTime = conditionsLossDW.dateEnd + hms59;
        $("#selectDatelossDailyWages_Stt").val(conditionsLossDW.dateStt);
        $("#selectDatelossDailyWages_End").val(conditionsLossDW.dateEnd);
        // 时间选择器
        var dateChange = conditionsLossDW.time;
        switch (dateChange){
            case "0":
                changeDateRange_lossDW(-3,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_lossDW(-33,"day",-4,"day");     //Controller
                break;
        }
        //根据查询条件查询数据
        getlossDailyWagesRecord(startDateTime, endDateTime);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
    } else {
        initlossDailyWagesRecordsPage();
    }
}
//@ 非详情页进入页面时初始化查询条件
function initlossDailyWagesRecordsPage() {
    IsHistory = false;
    $("#selectDatelossDailyWages_Stt").val(initDefaultDate(0,"day"));
    $("#selectDatelossDailyWages_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDatelossDailyWages_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDatelossDailyWages_End").val()+hms59;
    getlossDailyWagesRecord(startDateTime, endDateTime);
}

//@ 每个item点击时，触发该方法，保存当前的查询条件
function onItemClickListenerlossDailyWages() {
    var searchConditionsLossDW = {};
    searchConditionsLossDW.time =  $("#searchDate_lossDwReds").val();
    searchConditionsLossDW.dateStt = $("#selectDatelossDailyWages_Stt").val();
    searchConditionsLossDW.dateEnd = $("#selectDatelossDailyWages_End").val();
    searchConditionsLossDW.isDetail = true;
    saveSearchTerm(searchConditionsLossDW);
}
