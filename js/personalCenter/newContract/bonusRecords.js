//页大小
var PAGESIZE_bonusRecord = 10;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var IsSelf = 0;
var IsHistory;

var myUserName;
var myUserID;
var searchUserName="";

var selectDateQS;
var selectDateQE;

//@ 进入panel时调用
function bonusRecordsLoadedPanel(){
    catchErrorFun("bonusRecordInit();");
}

//@ 离开panel时调用
function bonusRecordsUnloadedPanel(){
    $("#bonusRecordList").empty();
    IsSelf = 0;
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";

    if(selectDateQS){
	    selectDateQS.dismiss();
    }
    if(selectDateQE){
	    selectDateQE.dismiss();
    }
}

//@ 初始化
function bonusRecordInit(){
	page = 0;
	myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
    
	$("#bonus_selectDate").empty();
    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select_1=$('<table><tr>'+
    	'<td><select name="timeType" id="timeType" data-theme="a" data-mini="true" onchange="timeTypeChange()">'+
    	'<option value="0" selected="selected">当前记录</option>'+
    	'<option value="1">历史记录</option></select></td>'+
    	'<td><input type="text" id="selectDatebonus_Stt" readonly/></td>'+
    	'<td><input type="text" id="selectDatebonus_End" readonly/></td>'+
    	'</tr></table>');
    $("#bonus_selectDate").append($select_1);
    var $select_2=$('<table><tr>'+
    	'<td><select name="isSelfType" id="isSelfType" data-theme="a" data-mini="true" onchange="isSelfTypeChange()">'+
    	'<option value="0" selected="selected">自身分红</option>'+
    	'<option value="1">直属下级分红</option></select></td>'+
    	'<td><select name="TypeLottrey" id="TypeLottrey" data-theme="a" data-mini="true" onchange="TypeLotteryChange()"></select></td>'+
    	'</tr></table>');
    $("#bonus_selectDate").append($select_2);
     $("#TypeLottrey").empty();
    
	//当前记录
    selectDateQS = new MobileSelectDate();
    selectDateQS.init({trigger:'#selectDatebonus_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selectDateQE = new MobileSelectDate();
    selectDateQE.init({trigger:'#selectDatebonus_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    $("#selectDatebonus_Stt").val(initDefaultDate(0,'day'));  //View
    $("#selectDatebonus_End").val(initDefaultDate(0,'day'));
    startDateTime = $("#selectDatebonus_Stt").val()+hms00;
    endDateTime = $("#selectDatebonus_End").val()+hms59;
    
    //GetSystemMgrType(获取制度类型列表)1=日结，2=分红、3=私返
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetSystemMgrType","ProjectPublic_PlatformCode":2,"TypeID":"2"}', function (data) {
    	if(data.Code == 200){
    		if(data.Data.SysMgrTypeModel.length>0){
    			var $option = $('<option value="-1">分红类型：全部</option>');
				$("#TypeLottrey").append($option);
    			for(var i=0;i<data.Data.SysMgrTypeModel.length;i++){
    				var $option = $('<option value="'+ data.Data.SysMgrTypeModel[i].Id +'">'+'分红类型：'+ data.Data.SysMgrTypeModel[i].Name +'</option>');
    				$("#TypeLottrey").append($option);
    			}
			    //进入时加载
			    loadBonusRecord();
    		}else{
    			toastUtils.showToast("获取制度类型列表为空");
    		}
	    } else {
	    	toastUtils.showToast(data.Msg);
	        return;
	    }
    }, '正在加载数据...');

    var _myScroller =  $("#bonusRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'bonusRecordList','getbonusRecordsByScroll()');

    //Search Username
    $("#bonusRecordSearch").unbind('click');
    $("#bonusRecordSearch").bind('click', function(event) {
        searchbonusRecordUser();
    });
}

//@ 下拉加载下一页
function getbonusRecordsByScroll(){
    startDateTime = $("#selectDatebonus_Stt").val()+hms00;
    endDateTime = $("#selectDatebonus_End").val()+hms59;
    IsSelf = $("#isSelfType").val();
    getbonusRecord(searchUserName,$("#TypeLottrey").val(),$("#isSelfType").val(),$("#timeType").val(),startDateTime, endDateTime);
}
//@ 改变查询类型 - 时间类型
function timeTypeChange() {
	var selectedIndex = $("#timeType").val();
    switch(selectedIndex) {
        case "0":
            //当前记录
            $("#selectDatebonus_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDatebonus_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDatebonus_Stt").val()+hms00;
            endDateTime = $("#selectDatebonus_End").val()+hms59;
            changeDateRange_bounsRecord(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDatebonus_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDatebonus_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDatebonus_Stt").val()+hms00;
            endDateTime = $("#selectDatebonus_End").val()+hms59;
            changeDateRange_bounsRecord(-DayRange_3month3day,"day",-4,"day");     //Controller
            break;
    }
    getbonusRecord(searchUserName,$("#TypeLottrey").val(),$("#isSelfType").val(),$("#timeType").val(),startDateTime, endDateTime);
}

//切换当前记录或者历史记录时。
function changeDateRange_bounsRecord(minNum,minType,maxNum,maxType){
    selectDateQS.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selectDateQE.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//@ 改变查询类型 - 分红类型
function TypeLotteryChange(){
	page = 0;
	getbonusRecord(searchUserName,$("#TypeLottrey").val(),$("#isSelfType").val(),$("#timeType").val(),startDateTime, endDateTime);
}
//@ 改变查询类型 - 自身 或 下级
function isSelfTypeChange() {
	page = 0;
    getbonusRecord(searchUserName,$("#TypeLottrey").val(),$("#isSelfType").val(),$("#timeType").val(),startDateTime, endDateTime);
}

//@ 发送请求
function getbonusRecord(userName,typeId,isSelf,isHistory,startDateTime, endDateTime) {
	startDateTime = $("#selectDatebonus_Stt").val()+hms00;
    endDateTime = $("#selectDatebonus_End").val()+hms59;
	isHistory = (isHistory==1?true:false);
	if(userName == ""){
		var param = '{"InterfaceName":"/api/v1/netweb/GetDividentsList_New","ProjectPublic_PlatformCode":2,"UserID":"'+myUserID+'","UserName":"","TypeId":"'+typeId+'","IsSelf":"'+isSelf+'","IsHistory":"'+isHistory+'","BeginTime":"'+startDateTime+'","EndTime":"'+endDateTime+'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_bonusRecord + '}';
	}else{
		var param = '{"InterfaceName":"/api/v1/netweb/GetDividentsList_New","ProjectPublic_PlatformCode":2,"UserID":"'+myUserID+'","UserName":"'+userName+'","TypeId":"'+typeId+'","IsSelf":"'+isSelf+'","IsHistory":"'+isHistory+'","BeginTime":"'+startDateTime+'","EndTime":"'+endDateTime+'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_bonusRecord + '}';
	}
    ajaxUtil.ajaxByAsyncPost1(null, param, getbonusRecord_callBack, null);
}

//@ 返回数据
function getbonusRecord_callBack(data){
	$("#bonusRecord_noData_tips").hide();
	if (page == 0) {
        $("#bonusRecordList").empty();
    }
	
	if(data.Code == 200){
	    if(data.Data ==null){
	      //toastUtils.showToast("没有数据");
	        $("#bonusRecord_noData_tips").show();
	        return;
	    }
	    var info = data.Data.DividentsDetailAllList;
	    if (info.length >0){
	        isHasMorePage(info,PAGESIZE_bonusRecord);
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = new Object();
	            dataSet.UserName = info[i].UserName;  //用户名
	            dataSet.TotalBatMoney = info[i].TotalBatMoney;  //销量
	            dataSet.TotalProfitLossMoney = info[i].TotalProfitLossMoney;  //盈亏
	            dataSet.ActivePersonNum = info[i].ActivePersonNum;  //活跃人数
	            dataSet.DividendRatio = bigNumberUtil.multiply(info[i].DividendRatio,100);  //分红比例
	            dataSet.DividentMoney = info[i].DividentMoney;  //分红金额
	            dataSet.CreateTime = info[i].CreateTime;  //时间
	            dataSet.TypeName = info[i].TypeName;  //分红类型
	
	            var $itemLi = $('<li></li>').data('bonusRecords',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListenerBonus();
	                localStorageUtils.setParam("bonusRecords",JSON.stringify($(this).data('bonusRecords')));
	                setPanelBackPage_Fun('bonusRecordsDetail');
	            });
	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;<span class="red">' + dataSet.UserName + '</span></dd><dd>盈 亏:&nbsp;' + dataSet.TotalProfitLossMoney +'</dd><dd>分红金额:&nbsp;'+dataSet.DividentMoney+'</dd><dd>时 间:&nbsp;' + dataSet.CreateTime +'</dd></dl></a>');
	
	            $("#bonusRecordList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 搜索用户名
function searchbonusRecordUser(){
    $.ui.popup({
        title:"查询用户名",
        message:'<input type="text" id="searchbonusRcdUser" maxLength="25" placeholder="请输入要查找的用户名" />',
        cancelText:"关闭",
        cancelCallback:
            function(){
            },
        doneText:"确定",
        doneCallback:
            function() {
                searchUserName = $("#searchbonusRcdUser").val();
                if (searchUser == "") {
                    toastUtils.showToast("请输入要查找的用户名");
                    return;
                }
                getbonusRecord(searchUserName,$("#TypeLottrey").val(),$("#isSelfType").val(),$("#timeType").val(),startDateTime, endDateTime);
                searchUserName = "";//搜索一次，立即置空；
            },
        cancelOnly:false
    });
}

//@ 页面数据加载入口
function loadBonusRecord() {
	var conditionsBonusRecord = getSearchTerm();
	if (null != conditionsBonusRecord) {
		//当前或历史
		var dataOptions = document.getElementById('timeType').options;
		for (var i = 0; i < dataOptions.length; i++) {
			dataOptions[i].selected = false;
			if (dataOptions[i].value == conditionsBonusRecord.time) {
				dataOptions[i].selected = true;
			}
		}
		//自身或下级
		var selfOptions = document.getElementById('isSelfType').options;
		for (var j = 0; j < selfOptions.length; j++) {
			selfOptions[j].selected = false;
			if (selfOptions[j].value == conditionsBonusRecord.IsSelf) {
				selfOptions[j].selected = true;
			}
		}
		//分红类型
		var BonusTypeOptions = document.getElementById('TypeLottrey').options;
		for (var k = 0; k < BonusTypeOptions.length; k++) {
			BonusTypeOptions[k].selected = false;
			if (BonusTypeOptions[k].value == conditionsBonusRecord.BonusType) {
				BonusTypeOptions[k].selected = true;
			}
		}

		IsSelf = conditionsBonusRecord.IsSelf;
		startDateTime = conditionsBonusRecord.dateStt + hms00;
		endDateTime = conditionsBonusRecord.dateEnd + hms59;
		$("#selectDatebonus_Stt").val(conditionsBonusRecord.dateStt);
		$("#selectDatebonus_End").val(conditionsBonusRecord.dateEnd);

		// 时间选择器
		var dateChange = conditionsBonusRecord.time;
		switch (dateChange){
			case "0":
				IsHistory=false;
				changeDateRange_bounsRecord(-3,"day",0,"day");   //Controller
				break;
			case "1":
				IsHistory=true;
				changeDateRange_bounsRecord(-DayRange_3month3day,"day",-4,"day");   //Controller
				break;
		}

		//根据条件查询数据
		var bonusType = $("#TypeLottrey").val() || '-1';  // '-1' means All type
		var timeType = $("#timeType").val() || 0;  // 0 means current time
		getbonusRecord(searchUserName, bonusType, IsSelf, timeType, startDateTime, endDateTime);
		//重置isDetail标记，表示从记录界面返回
		var searchConditionsBonusRecord = getSearchTerm();
		searchConditionsBonusRecord.isDetail = false;
		saveSearchTerm(searchConditionsBonusRecord);
	} else {
		initBonusRecordPage();
	}
}

//@ 非详情页进入页面时初始化查询条件
function initBonusRecordPage() {
	IsSelf = 0;
	IsHistory = false;
	var bonusType = $("#TypeLottrey").val() || '-1';  // '-1' means All type
	var timeType = $("#timeType").val() || 0;

	$("#selectDatebonus_Stt").val(initDefaultDate(0,"day"));
	$("#selectDatebonus_End").val(initDefaultDate(0,"day"));
	startDateTime = $("#selectDatebonus_Stt").val() + hms00;  //查询开始时间
	endDateTime = $("#selectDatebonus_End").val() + hms59;  //查询结束时间

	getbonusRecord(searchUserName, bonusType, IsSelf, timeType, startDateTime, endDateTime);
}

//@ 每个item点击时，触发该方法，保存当前的查询条件
function onItemClickListenerBonus() {
	var searchConditionsBonusRecord = {};
	searchConditionsBonusRecord.time = $("#timeType").val();
	searchConditionsBonusRecord.dateStt = $("#selectDatebonus_Stt").val();
	searchConditionsBonusRecord.dateEnd = $("#selectDatebonus_End").val();
	searchConditionsBonusRecord.IsSelf =  $("#isSelfType").val();
	searchConditionsBonusRecord.BonusType = $("#TypeLottrey").val();
	searchConditionsBonusRecord.isDetail = true;
	saveSearchTerm(searchConditionsBonusRecord);
}