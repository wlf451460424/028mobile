//页大小
var PAGESIZE_myCharge = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//收支类型
var type =1;
//条目计数
var sum = 0;
//IsHistory 默认false  是否是历史记录
var IsHistory=false;
var page=0;

var selectDateAA;
var selectDateAB;

/*进入panel时调用*/
function myChargeRecordLoadedPanel(){
    catchErrorFun("myChargeRecordInit();");
}
/*离开panel时调用*/
function myChargeRecordUnloadedPanel(){
    $("#myChargeRecordList").empty();
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    userName = "";
    type =1;
    //清除本地存储的查询条件
    clearSearchTerm();
    if(selectDateAA){
        selectDateAA.dismiss();
    }
    if(selectDateAB){
        selectDateAB.dismiss();
    }
}

function myChargeRecordInit(){
    $("#selectType_charge").empty();
    $("#selectChargeID").empty();

    var $selectType_charge = $('<select name="myChargeRecordsearchType" id="myChargeRecordsearchType" data-theme="a" data-mini="true" onchange="myChargeRecordtypeChange()"><option value="\'\'"  selected="selected">状态：全部</option><option value="1">状态：交易成功</option><option value="2">状态：交易失败</option><option value="0">状态：未处理</option></select>');
    $("#selectType_charge").append($selectType_charge);

    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td><select name="myChargeRecordsearchDate" id="myChargeRecordsearchDate" data-theme="a" data-mini="true" onchange="dateChangeCharge()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectDateCharge_Stt" readonly/></td><td><input type="text" id="selectDateCharge_End" readonly/></td></tr></table>');
    $("#selectChargeID").append($select);

    selectDateAA = new MobileSelectDate();
    selectDateAA.init({trigger:'#selectDateCharge_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selectDateAB = new MobileSelectDate();
    selectDateAB.init({trigger:'#selectDateCharge_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

    userName = localStorageUtils.getParam("username");
    page = 0;
    hasMorePage = true;//默认还有分页
    var _myScroller =  $("#myChargeRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'myChargeRecordList','getMyChargeRecordsByScroll()');
    //进入时加载
    loadBySearchItemsCharge();
}

/*
 * 下拉滚动-刷新列表数据
 * */
function getMyChargeRecordsByScroll(){
    startDateTime = $("#selectDateCharge_Stt").val()+hms00;
    endDateTime = $("#selectDateCharge_End").val()+hms59;
    getMyChargeRecords_scroll(startDateTime, endDateTime, type);
}

/**
 * Description 查询账户历史记录回调函数
 * @param data 服务端返数据
 */
function searchSuccessCallBackmyCharge(data) {
	$("#myChargeRecord_noData_tips").hide();
    if (page == 0) {
        $("#myChargeRecordList").empty();
    }
  
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#myChargeRecord_noData_tips").show();
	        //toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount !=0) {
	        var info=data.Data.ModelList;
	        isHasMorePage(info,PAGESIZE_myCharge);
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = new Object();
	            //订单号
	            dataSet.orderId = info[i].RechargeOrder;
	            //账户
	            dataSet.accountnum = info[i].UserName;
	            //交易时间
	            dataSet.optime = info[i].CreateTime;
	            //交易备注
	            /*if(rechargeTypesObj['online_type_' + info[i].RechargeType]){
	                dataSet.details ="用户充值";
	            }else if(info[i].RechargeType == 4){
	                dataSet.details ="";
	            }else{
	                dataSet.details =info[i].RechargeMark;
	            }*/
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
	
	
	            var $itemLi = $('<li></li>').data('charge',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListenerCharge();
	                localStorageUtils.setParam("charge",JSON.stringify($(this).data('charge')));
	                setPanelBackPage_Fun('chargeRecordDetail');
	            });
	            
//	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.payType+'</dd><dd>金额:' + dataSet.tmoney +'元</dd><dd>时间:&nbsp;' + dataSet.optime +'</dd></dl></a>');
	            
	          	if(info[i].RechargeState == 2){//失败
	          		$itemLi.append('<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.payType+'</dd><dd>金额: <span style="color:red">-' + dataSet.tmoney +'元</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico_refuse.png"></dl></a>');
	          	}else{//成功  未处理
	          		$itemLi.append('<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.payType+'</dd><dd>金额: <span style="color:#4bdc03">' + dataSet.tmoney +'元</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>');
	          	}
	
	            $("#myChargeRecordList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

/**
 * 查询账户信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param type 查询收支类型
 */
function searchCharge(startDateTime, endDateTime, type) {
    page=0;
    var paramssearch = '{"InterfaceName":"/api/v1/netweb/GetUserRechargeInfoByPage","ProjectPublic_PlatformCode":2,"RechargeState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myCharge + '}';
    ajaxUtil.ajaxByAsyncPost1(null, paramssearch, searchSuccessCallBackmyCharge,null);
}

//@ 下拉列表，刷新充值数据
function getMyChargeRecords_scroll(startDateTime, endDateTime, type){
    var paramssearch_scroll = '{"InterfaceName":"/api/v1/netweb/GetUserRechargeInfoByPage","ProjectPublic_PlatformCode":2,"RechargeState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myCharge + '}';
    ajaxUtil.ajaxByAsyncPost1(null, paramssearch_scroll, searchSuccessCallBackmyCharge,null);
}

//日期改变事件
function dateChangeCharge() {
    page = 0;
    var selectedIndex = $("#myChargeRecordsearchDate").val();
    switch(selectedIndex) {
        case "0":
            //当前记录
            $("#selectDateCharge_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateCharge_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateCharge_Stt").val()+hms00;
            endDateTime = $("#selectDateCharge_End").val()+hms59;
            type = $("#myChargeRecordsearchType").val();
            IsHistory=false;
            localStorageUtils.setParam("IsHistory",IsHistory);
            searchCharge(startDateTime, endDateTime, type);
            changeDateRange(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateCharge_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDateCharge_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDateCharge_Stt").val()+hms00;
            endDateTime = $("#selectDateCharge_End").val()+hms59;
            type = $("#myChargeRecordsearchType").val();
            IsHistory=true;
            localStorageUtils.setParam("IsHistory",IsHistory);
            searchCharge(startDateTime, endDateTime, type);
            changeDateRange(-33,"day",-4,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange(minNum,minType,maxNum,maxType){
    selectDateAA.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selectDateAB.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//玩法类型改变事件
function myChargeRecordtypeChange() {
    page = 0;
    type = $("#myChargeRecordsearchType").val();
    startDateTime = $("#selectDateCharge_Stt").val()+hms00;
    endDateTime = $("#selectDateCharge_End").val()+hms59;
    searchCharge(startDateTime, endDateTime, type);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchItemsCharge() {
    var conditionsCharge = getSearchTerm();
    if (null != conditionsCharge) {
        if(unloadAtBettingDetail == true){
            initChargeRecordsPage();
        }else{
        var dataOptions = document.getElementById('myChargeRecordsearchDate').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditionsCharge.time) {
                dataOptions[i].selected = true;
            }
        }
        var typeOptions = document.getElementById('myChargeRecordsearchType').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditionsCharge.type) {
                typeOptions[i].selected = true;
            }
        }
        type = conditionsCharge.type;
		if(!conditionsCharge.type)type = "";
		
        startDateTime = conditionsCharge.dateStt+hms00;
        endDateTime = conditionsCharge.dateEnd+hms59;
        $("#selectDateCharge_Stt").val(conditionsCharge.dateStt);
        $("#selectDateCharge_End").val(conditionsCharge.dateEnd);

        // 时间选择器
        var dateChange = conditionsCharge.time;
        switch (dateChange){
            case "0":
                IsHistory=false;
                localStorageUtils.setParam("IsHistory",IsHistory);
                changeDateRange(-3,"day",0,"day");   //Controller
                break;
            case "1":
                IsHistory=true;
                localStorageUtils.setParam("IsHistory",IsHistory);
                changeDateRange(-33,"day",-4,"day");   //Controller
                break;
        }
        //根据日期查询条件查询数据
        searchCharge(startDateTime, endDateTime, type);
        //重置isDetail标记，表示从记录界面返回
        var searchconditionsCharge = getSearchTerm();
        searchconditionsCharge.isDetail =  false;
        saveSearchTerm(searchconditionsCharge);
        }
    } else {
        initChargeRecordsPage();
    }
}
function initChargeRecordsPage() {
    IsHistory = false;
    localStorageUtils.setParam("IsHistory",IsHistory);
    type="''";
    $("#selectDateCharge_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateCharge_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateCharge_Stt").val() + hms00;
    //查询结束时间
    endDateTime = $("#selectDateCharge_End").val() + hms59;
    searchCharge(startDateTime, endDateTime, type);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListenerCharge() {
    var searchconditionsCharge = {};
    searchconditionsCharge.time =  $("#myChargeRecordsearchDate").val();
    searchconditionsCharge.type =  $("#myChargeRecordsearchType").val();
    searchconditionsCharge.dateStt = $("#selectDateCharge_Stt").val();
    searchconditionsCharge.dateEnd = $("#selectDateCharge_End").val();
    searchconditionsCharge.isDetail = true;
    saveSearchTerm(searchconditionsCharge);
}