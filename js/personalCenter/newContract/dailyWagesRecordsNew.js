/* 查询我的或下级的日结记录 */
//页大小
var PAGESIZE_DwRecordNew = 10;
var startDateTime = "",  //查询开始时间
    endDateTime = "";  //查询结束时间
var StartDate_dailyWagesNew,
    EndDate_dailyWagesNew;
var IsSelf = 0,
    IsHistory=false,
	DWTypeID;

//@ 进入panel时调用
function dailyWagesRecordsNewLoadedPanel(){
    catchErrorFun("dailyWagesRecordNewInit();");
}

//@ 离开panel时调用
function dailyWagesRecordsNewUnloadedPanel(){
    $("#dailyWagesRecordNewList").empty();
    IsSelf = 0;
	IsHistory=false;
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";

    if(StartDate_dailyWagesNew){
        StartDate_dailyWagesNew.dismiss();
    }
    if(EndDate_dailyWagesNew){
        EndDate_dailyWagesNew.dismiss();
    }
}

//@ 初始化
function dailyWagesRecordNewInit() {
    $("#dailyWagesNew_selectDate").empty();
    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td><select name="DwRecordsNew_searchDate" id="DwRecordsNew_searchDate" onchange="dateChange_DwRecordNew()">' +
        '<option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDwDateNew_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDwDateNew_End" readonly/></td></tr></table>' +
        '<table><tr><td style="width: 50%"><select name="DwRecordsNew_IsSelf" id="DwRecordsNew_IsSelf" data-theme="a" data-mini="true" onchange="changeDwNewType()">' +
        '<option value="0" selected="selected">自身日结</option><option value="1">下级日结</option></select></td>' +
        '<td style="width: 50%"><select name="DwRecordsNew_DwType" id="DwRecordsNew_DwType" onchange="changeDwNewType()">' +
        '<option value="-1">全部</option></select></td></tr></table>');
    $("#dailyWagesNew_selectDate").append($select);

    StartDate_dailyWagesNew = new MobileSelectDate();
    StartDate_dailyWagesNew.init({trigger:'#selectDwDateNew_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    EndDate_dailyWagesNew = new MobileSelectDate();
    EndDate_dailyWagesNew.init({trigger:'#selectDwDateNew_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");

	//填充日结类型的option
	var queryType = 1;  //类型【1=日结，2=分红、3=私返】
	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetSystemMgrType","ProjectPublic_PlatformCode":2,"TypeID":'+ queryType +'}', function (data) {
		if (data.Code == 200){
			var myType = data.Data.SysMgrTypeModel || [];
			for(var i=0; i < myType.length; i++){
				DWTypeID = myType[0].Id;
				var $option = $('<option value="'+ myType[i].Id +'">'+ myType[i].Name +'</optionv>');
				$("#DwRecordsNew_DwType").append($option);
			}
			//进入时加载
			loadDailyWagesItemNew();
		}else {
			toastUtils.showToast(data.Msg);
		}
	}, null);

    var _myScroller =  $("#dailyWagesRecordNewScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'dailyWagesRecordNewList','getdailyWagesRecordsByScroll()');

    //Search Username
    $("#dailyWagesRecordNewSearch").unbind('click');
    $("#dailyWagesRecordNewSearch").bind('click', function(event) {
        searchDwRecordNewUser();
    });
}

//@ 下拉加载下一页
function getdailyWagesRecordsByScroll(){
    startDateTime = $("#selectDwDateNew_Stt").val() + hms00;
    endDateTime = $("#selectDwDateNew_End").val() + hms59;
    IsSelf = $("#DwRecordsNew_IsSelf").val();
	DWTypeID = $("#DwRecordsNew_DwType").val() || DWTypeID;
    getDailyWagesRecordNew_scroll(startDateTime, endDateTime, IsSelf, DWTypeID);
}

//@ 改变查询类型 - 自身/下级 - 日结类型
function changeDwNewType() {
    page = 0;
    IsSelf = $("#DwRecordsNew_IsSelf").val();
	DWTypeID = $("#DwRecordsNew_DwType").val() || DWTypeID;
    startDateTime = $("#selectDwDateNew_Stt").val() + hms00;
    endDateTime = $("#selectDwDateNew_End").val() + hms59;
    getDailyWagesRecordNew(startDateTime, endDateTime);
}

//@ 日期改变事件
function dateChange_DwRecordNew() {
	var selectedIndex = $("#DwRecordsNew_searchDate").val();
	IsSelf = $("#DwRecordsNew_IsSelf").val();
	DWTypeID = $("#DwRecordsNew_DwType").val() || DWTypeID;
	switch(selectedIndex) {
		//当前记录
	    case "0":
			$("#selectDwDateNew_Stt").val(initDefaultDate(0,'day'));  //View
			$("#selectDwDateNew_End").val(initDefaultDate(0,'day'));
			startDateTime = $("#selectDwDateNew_Stt").val()+hms00;
			endDateTime = $("#selectDwDateNew_End").val()+hms59;
			IsHistory=false;
			localStorageUtils.setParam("IsHistory",IsHistory);
			getDailyWagesRecordNew(startDateTime, endDateTime);
			changeDateRange_DwNew(-3,"day",0,"day");   //Controller
			break;
		case "1":
			//历史记录
			$("#selectDwDateNew_Stt").val(initDefaultDate(-4,'day'));  //view
			$("#selectDwDateNew_End").val(initDefaultDate(-4,'day'));
			startDateTime = $("#selectDwDateNew_Stt").val()+hms00;
			endDateTime = $("#selectDwDateNew_End").val()+hms59;
			IsHistory=true;
			localStorageUtils.setParam("IsHistory",IsHistory);
			getDailyWagesRecordNew(startDateTime, endDateTime);
			changeDateRange_DwNew(-DayRange_3month3day,"day",-4,"day");     //Controller
			break;
	}
}

//@ 切换当前记录或者历史记录时
function changeDateRange_DwNew(minNum,minType,maxNum,maxType){
	StartDate_dailyWagesNew.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
	EndDate_dailyWagesNew.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}


//@ 发送请求 First Page.
function getDailyWagesRecordNew(startDateTime, endDateTime) {
    page = 0;
    getDailyWagesRecordNew_scroll(startDateTime, endDateTime);
}

//@ Next Page
function getDailyWagesRecordNew_scroll(startDateTime, endDateTime) {
	IsSelf = $("#DwRecordsNew_IsSelf").val();
	DWTypeID = $("#DwRecordsNew_DwType").val() || DWTypeID;
    var param = '{"InterfaceName":"/api/v1/netweb/DailyWages_GetDataList","ProjectPublic_PlatformCode":2,"UserName":"","IsSelf":'+IsSelf+',"ProvideTyp":'+ DWTypeID +',"IsHistory":'+ IsHistory +',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_DwRecordNew + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getdailyWagesRecord_callBack, null);
}

//@ 返回数据
function getdailyWagesRecord_callBack(data){
	$("#dailyWagesRecordNew_noData_tips").hide();
    if (page == 0) {
        $("#dailyWagesRecordNewList").empty();
        $("#dailyWagesRecordNewScroller").scroller().scrollToTop();
        $("#dailyWagesRecordNewScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#dailyWagesRecordNew_noData_tips").show();
	        //toastUtils.showToast("没有数据");
	        return;
	    }
	    var info = data.Data.DaiyWagesList;
	    if (info.length >0){
	        isHasMorePage(info,PAGESIZE_DwRecordNew);
	
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = {};
	            dataSet.UserName = info[i].User_Name;  //用户名
	            dataSet.SalesVolume = info[i].SalesVolume;  //销量
	            dataSet.ActivePersonNum = info[i].ActivePersonNum;  //活跃人数
	            dataSet.CreateTime = info[i].CreateTime;  //时间
	            dataSet.DetailSource = info[i].DetailSource;  //发放类型
	            dataSet.LossAmount = info[i].LossAmount;  //盈亏
	
		        //日结金额显示
	            if(dataSet.DetailSource == "264" || dataSet.DetailSource == "266"){
	                dataSet.DayWagesAmount = "-"+info[i].DayWagesAmount;
	            }else{
	                dataSet.DayWagesAmount = info[i].DayWagesAmount;
	            }
	
	            //日结标准
	            if(info[i].Reserve1 != "" && info[i].Reserve1 != null){
	                dataSet.DayWagesRatio = info[i].Reserve1;
	            }else{
	                dataSet.DayWagesRatio = bigNumberUtil.multiply(info[i].DayWagesRatio,100)+"%";
	            }
	
	            //日结类型
		        dataSet.DayWagesType = (info[i].Reserve2) ? (info[i].Reserve2) : (dailyWages(info[i].DetailSource,info[i].Remark));
	
	            var $itemLi = $('<li></li>').data('dailyWagesRecordsNew',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListenerDwNew();
	                localStorageUtils.setParam("dailyWagesRecordsNew",JSON.stringify($(this).data('dailyWagesRecordsNew')));
	                setPanelBackPage_Fun('dailyWagesRecordsNewDetail');
	            });
	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;<span class="red">' + dataSet.UserName + '</span></dd><dd>日结类型:&nbsp;' + dataSet.DayWagesType +'</dd><dd>日结金额:&nbsp;'+dataSet.DayWagesAmount+'</dd><dd>时间:&nbsp;' + dataSet.CreateTime +'</dd></dl></a>');
	
	            $("#dailyWagesRecordNewList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 搜索用户名
function searchDwRecordNewUser(){
    $.ui.popup({
        title:"查询用户名",
        message:'<input type="text" id="searchDwRecordNewUser" maxLength="25" placeholder="请输入要查找的用户名" />',
        cancelText:"关闭",
        cancelCallback:
            function(){
            },
        doneText:"确定",
        doneCallback:
            function() {
                var searchUser = $("#searchDwRecordNewUser").val();
                if (searchUser == "") {
                    toastUtils.showToast("请输入要查找的用户名");
                    return;
                }
                page = 0;
                IsSelf = $("#DwRecordsNew_IsSelf").val();
	            DWTypeID = $("#DwRecordsNew_DwType").val() || DWTypeID;
	            var param = '{"InterfaceName":"/api/v1/netweb/DailyWages_GetDataList","ProjectPublic_PlatformCode":2,"UserName":"'+ searchUser +'","IsSelf":'+IsSelf+',"ProvideTyp":'+ DWTypeID +',"IsHistory":'+ IsHistory +',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_DwRecordNew + '}';
                ajaxUtil.ajaxByAsyncPost1(null, param, getdailyWagesRecord_callBack, null);
            },
        cancelOnly:false
    });
}

//@ 页面数据加载入口
function loadDailyWagesItemNew() {
    var conditionsDailyWages = getSearchTerm();
    if (null != conditionsDailyWages) {
        if(unloadAtBettingDetail == false){
            initDailyWagesRecordNewPage();
        }else {
            //当前或历史
	        var dataOptions = document.getElementById('DwRecordsNew_searchDate').options;
	        for (var i = 0; i < dataOptions.length; i++) {
		        dataOptions[i].selected = false;
		        if (dataOptions[i].value == conditionsDailyWages.time) {
			        dataOptions[i].selected = true;
		        }
	        }
	        //自身或下级
	        var selfOptions = document.getElementById('DwRecordsNew_IsSelf').options;
	        for (var j = 0; j < selfOptions.length; j++) {
		        selfOptions[j].selected = false;
		        if (selfOptions[j].value == conditionsDailyWages.IsSelf) {
			        selfOptions[j].selected = true;
		        }
	        }
	        //日结类型
	        var DwTypeOptions = document.getElementById('DwRecordsNew_DwType').options;
	        for (var k = 0; k < DwTypeOptions.length; k++) {
		        DwTypeOptions[k].selected = false;
		        if (DwTypeOptions[k].value == conditionsDailyWages.DwType) {
			        DwTypeOptions[k].selected = true;
		        }
	        }
	        
            IsSelf = conditionsDailyWages.IsSelf;
            startDateTime = conditionsDailyWages.dateStt + hms00;
            endDateTime = conditionsDailyWages.dateEnd + hms59;
            $("#selectDwDateNew_Stt").val(conditionsDailyWages.dateStt);
            $("#selectDwDateNew_End").val(conditionsDailyWages.dateEnd);

	        // 时间选择器
	        var dateChange = conditionsDailyWages.time;
	        switch (dateChange){
		        case "0":
			        IsHistory=false;
			        localStorageUtils.setParam("IsHistory",IsHistory);
			        changeDateRange_DwNew(-3,"day",0,"day");   //Controller
			        break;
		        case "1":
			        IsHistory=true;
			        localStorageUtils.setParam("IsHistory",IsHistory);
			        changeDateRange_DwNew(-DayRange_3month3day,"day",-4,"day");   //Controller
			        break;
	        }

            //根据条件查询数据
            getDailyWagesRecordNew(startDateTime, endDateTime);
            //重置isDetail标记，表示从记录界面返回
            var searchConditionDailyWagesNew = getSearchTerm();
            searchConditionDailyWagesNew.isDetail = false;
            saveSearchTerm(searchConditionDailyWagesNew);
        }
    } else {
        initDailyWagesRecordNewPage();
    }
}
//@ 非详情页进入页面时初始化查询条件
function initDailyWagesRecordNewPage() {
    IsSelf = 0;
	IsHistory = false;
	DWTypeID = $("#DwRecordsNew_DwType").val() || DWTypeID;

	$("#selectDwDateNew_Stt").val(initDefaultDate(0,"day"));
    $("#selectDwDateNew_End").val(initDefaultDate(0,"day"));
    startDateTime = $("#selectDwDateNew_Stt").val()+hms00;  //查询开始时间
    endDateTime = $("#selectDwDateNew_End").val()+hms59;  //查询结束时间
    getDailyWagesRecordNew(startDateTime, endDateTime);
}

//@ 每个item点击时，触发该方法，保存当前的查询条件
function onItemClickListenerDwNew() {
    var searchConditionDailyWagesNew = {};
	searchConditionDailyWagesNew.time = $("#DwRecordsNew_searchDate").val();
    searchConditionDailyWagesNew.dateStt = $("#selectDwDateNew_Stt").val();
    searchConditionDailyWagesNew.dateEnd = $("#selectDwDateNew_End").val();
	searchConditionDailyWagesNew.IsSelf =  $("#DwRecordsNew_IsSelf").val();
    searchConditionDailyWagesNew.DwType = $("#DwRecordsNew_DwType").val();
    searchConditionDailyWagesNew.isDetail = true;
    saveSearchTerm(searchConditionDailyWagesNew);
}
