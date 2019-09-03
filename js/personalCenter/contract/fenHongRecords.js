//页大小
var PAGESIZE_FenHongRecord = 10;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var setStartDate_fenHong;
var setEndDate_fenHong;
var IsSelf = 0;

//@ 进入panel时调用
function fenHongRecordsLoadedPanel(){
    catchErrorFun("fenHongRecordInit();");
}

//@ 离开panel时调用
function fenHongRecordsUnloadedPanel(){
    $("#fenHongRecordList").empty();
    IsSelf = 0;
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";

    if(setStartDate_fenHong){
        setStartDate_fenHong.dismiss();
    }
    if(setEndDate_fenHong){
        setEndDate_fenHong.dismiss();
    }
}

//@ 初始化
function fenHongRecordInit() {
    $("#fenHong_selectDate").empty();
    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td><select name="fenHongRecordType" id="fenHongRecordType" data-theme="a" data-mini="true" onchange="changeFenHongType()"><option value="0" selected="selected">自身分红</option><option value="1">直属下级分红</option></select></td><td><input type="text" id="selectDateFenHong_Stt" readonly/></td>'+'<td><input type="text" id="selectDateFenHong_End" readonly/></td></tr></table>');
    $("#fenHong_selectDate").append($select);

    setStartDate_fenHong = new MobileSelectDate();
    setStartDate_fenHong.init({trigger:'#selectDateFenHong_Stt',min:initDefaultDate(-DayRange_3month,"day"),max:initDefaultDate(0,"day")});
    setEndDate_fenHong = new MobileSelectDate();
    setEndDate_fenHong.init({trigger:'#selectDateFenHong_End',min:initDefaultDate(-DayRange_3month,"day"),max:initDefaultDate(0,"day")});
    myUserID = localStorageUtils.getParam("myUserID");

    var _myScroller =  $("#fenHongRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'fenHongRecordList','getFenHongRecordsByScroll()');
    //进入时加载
    loadBySearchItemsFenHong();

    //Search Username
    $("#fenHongRecordSearch").unbind('click');
    $("#fenHongRecordSearch").bind('click', function(event) {
        searchFenHongRecordUser();
    });
}

//@ 下拉加载下一页
function getFenHongRecordsByScroll(){
    startDateTime = $("#selectDateFenHong_Stt").val()+hms00;
    endDateTime = $("#selectDateFenHong_End").val()+hms59;
    IsSelf = $("#fenHongRecordType").val();
    getFenHongRecords_scroll(startDateTime, endDateTime, IsSelf);
}

//@ 改变查询类型 - 自身 或 下级
function changeFenHongType() {
    page = 0;
    IsSelf = $("#fenHongRecordType").val();
    switch (IsSelf){
        case "0":
            getfenHongRecord(startDateTime, endDateTime, 0);    break;
        case "1":
            getfenHongRecord(startDateTime, endDateTime, 1);    break;
    }
}

//@ 发送请求
function getfenHongRecord(startDateTime, endDateTime, IsSelf) {
    page = 0;
    getFenHongRecords_scroll(startDateTime, endDateTime, IsSelf);
}

function getFenHongRecords_scroll(startDateTime, endDateTime, IsSelf) {
    var param = '{"InterfaceName":"/api/v1/netweb/GetDividentsList","ProjectPublic_PlatformCode":2,"IsSelf":'+IsSelf+',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","UserID":"'+myUserID+'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_FenHongRecord + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getfenHongRecord_callBack, null);
}

//@ 返回数据
function getfenHongRecord_callBack(data){
    if (page == 0) {
        $("#fenHongRecordList").empty();
        $("#fenHongRecordScroller").scroller().scrollToTop();
        $("#fenHongRecordScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    var info = data.Data.DividentsDetailAllList;
	    if (info.length >0){
	        isHasMorePage(info,PAGESIZE_FenHongRecord);
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = new Object();
	            dataSet.UserName = info[i].UserName;  //用户名
	            dataSet.TotalBatMoney = info[i].TotalBatMoney;  //投注总额
	            dataSet.TotalProfitLossMoney = info[i].TotalProfitLossMoney;  //盈利总额
	            dataSet.ActivePersonNum = info[i].ActivePersonNum;  //活跃人数
	            dataSet.DividendRatio = bigNumberUtil.multiply(info[i].DividendRatio,100);  //分红比例
	            dataSet.DividentMoney = info[i].DividentMoney;  //分红金额
	            dataSet.CreateTime = info[i].CreateTime;  //时间
	
	            var $itemLi = $('<li></li>').data('fenHongRecords',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListenerfenHong();
	                localStorageUtils.setParam("fenHongRecords",JSON.stringify($(this).data('fenHongRecords')));
	                setPanelBackPage_Fun('fenHongRecordsDetail');
	            });
	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;<span class="red">' + dataSet.UserName + '</span></dd><dd>盈利总额:&nbsp;' + dataSet.TotalProfitLossMoney +'</dd><dd>分红金额:&nbsp;'+dataSet.DividentMoney+'</dd><dd>时间:&nbsp;' + dataSet.CreateTime +'</dd></dl></a>');
	
	            $("#fenHongRecordList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 搜索用户名
function searchFenHongRecordUser(){
    $.ui.popup({
        title:"查询用户名",
        message:'<input type="text" id="searchFenHongRcdUser" maxLength="25" placeholder="请输入要查找的用户名" />',
        cancelText:"关闭",
        cancelCallback:
            function(){
            },
        doneText:"确定",
        doneCallback:
            function() {
                var searchUser = $("#searchFenHongRcdUser").val();
                if (searchUser == "") {
                    toastUtils.showToast("请输入要查找的用户名");
                    return;
                }
                page = 0;
                IsSelf = $("#fenHongRecordType").val();
                var param = '{"InterfaceName":"/api/v1/netweb/GetDividentsList","ProjectPublic_PlatformCode":2,"UserName":"' + searchUser + '","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","IsSelf":' + IsSelf + ',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_FenHongRecord + '}';
                ajaxUtil.ajaxByAsyncPost1(null, param, getfenHongRecord_callBack, null);
            },
        cancelOnly:false
    });
}

//@ 页面数据加载入口
function loadBySearchItemsFenHong() {
    var conditionsFenHong = getSearchTerm();
    if (null != conditionsFenHong) {
        if(unloadAtBettingDetail == false){
            initFenHongRecordsPage();
        }else {
            var typeOptions = document.getElementById('fenHongRecordType').options;
            for (var i = 0; i < typeOptions.length; i++) {
                typeOptions[i].selected = false;
                if (typeOptions[i].value == conditionsFenHong.IsSelf) {
                    typeOptions[i].selected = true;
                }
            }
            IsSelf = conditionsFenHong.IsSelf;
            startDateTime = conditionsFenHong.dateStt + hms00;
            endDateTime = conditionsFenHong.dateEnd + hms59;
            $("#selectDateFenHong_Stt").val(conditionsFenHong.dateStt);
            $("#selectDateFenHong_End").val(conditionsFenHong.dateEnd);

            //根据条件查询数据
            getfenHongRecord(startDateTime, endDateTime, IsSelf);
            //重置isDetail标记，表示从记录界面返回
            var searchconditionsFenHong = getSearchTerm();
            searchconditionsFenHong.isDetail = false;
            saveSearchTerm(searchconditionsFenHong);
        }
    } else {
        initFenHongRecordsPage();
    }
}
//@ 非详情页进入页面时初始化查询条件
function initFenHongRecordsPage() {
    IsSelf = 0;
    var todayOfMonth = new Date().getDate()-1;
    $("#selectDateFenHong_Stt").val(initDefaultDate(-todayOfMonth,"day"));
    $("#selectDateFenHong_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateFenHong_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateFenHong_End").val()+hms59;
    getfenHongRecord(startDateTime, endDateTime, IsSelf);
}

//@ 每个item点击时，触发该方法，保存当前的查询条件
function onItemClickListenerfenHong() {
    var searchconditionsFenHong = {};
    searchconditionsFenHong.IsSelf =  $("#fenHongRecordType").val();
    searchconditionsFenHong.dateStt = $("#selectDateFenHong_Stt").val();
    searchconditionsFenHong.dateEnd = $("#selectDateFenHong_End").val();
    searchconditionsFenHong.isDetail = true;
    saveSearchTerm(searchconditionsFenHong);
}
