//页大小
var PAGESIZE_myWith = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//收支类型
var type =null;
//条目计数
var sum = 0;
//IsHistory 默认false  是否是历史记录
var IsHistory=false;
var selectDateFF;
var selectDateFG;

/*进入panel时调用*/
function myWithdrawalRecordLoadedPanel(){
	catchErrorFun("myWithdrawalRecorInit();");
}
/*离开panel时调用*/
function myWithdrawalRecordUnloadedPanel(){
	$("#myWithdrawalRecordList").empty();
	//清除本地存储的查询条件
	clearSearchTerm();   
    startDateTime = "";
    endDateTime = "";
    userName = "";
    type =null;    	
    //清除本地存储的查询条件
     clearSearchTerm();
    if(selectDateFF){
        selectDateFF.dismiss();
    }
    if(selectDateFG){
        selectDateFG.dismiss();
    }
}
function myWithdrawalRecorInit(){
    $("#selectType_withdrawal").empty();
    $("#selectWithdrawalID").empty();
    var $selectType_withdrawal = $('<select name="searchTypeWit" id="searchTypeWit"  onchange="typeChangeWit()"><option value="null" selected="selected">状态：全部</option><option value="3">状态：交易成功</option><option value="4">状态：交易失败</option><option value="0">状态：未处理</option><option value="1">状态：交易中</option><option value="2">状态：拒绝</option></select>');
    $("#selectType_withdrawal").append($selectType_withdrawal);

    var $select=$('<table><tr><td><select name="searchDateWit" id="searchDateWit" onchange="dateChangeWit()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectDateWithdrawal_Stt" readonly/></td><td><input type="text" id="selectDateWithdrawal_End" readonly/></td></tr></table>');
    $("#selectWithdrawalID").append($select);

    selectDateFF = new MobileSelectDate();
    selectDateFF.init({trigger:'#selectDateWithdrawal_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selectDateFG = new MobileSelectDate();
    selectDateFG.init({trigger:'#selectDateWithdrawal_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

	userName = localStorageUtils.getParam("username");
	page = 0;
	hasMorePage = true;//默认还有分页
    var _myScroller =  $("#myWithdrawalRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
	_myScroller.clearInfinite();
    addUseScroller(_myScroller,'myWithdrawalRecordList','searchCharge_withdrawalRecord()');
    //进入时加载
    loadBySearchItemsWith();
}

function searchCharge_withdrawalRecord(){
    startDateTime = $("#selectDateWithdrawal_Stt").val()+hms00;
    endDateTime = $("#selectDateWithdrawal_End").val()+hms59;
    searchCharge_withdrawal(startDateTime, endDateTime, type);
}
/**
 * Description 查询账户历史记录回调函数
 * @param
 * @return data 服务端返数据
 */
function searchSuccessCallBackWit(data) {
	$("#myWithdrawalRecord_noData_tips").hide();
    if (page == 0) {
        $("#myWithdrawalRecordList").empty();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#myWithdrawalRecord_noData_tips").show();
	    	//toastUtils.showToast("没有数据");
	    	return;
	    }   
	    if (data.Data.DataCount !=0) {
	        var info=data.Data.ModelList;
	        isHasMorePage(info,PAGESIZE_myWith);
	        for (var i = 0; i < info.length; i++) {
	            var text = "";
	            var dataSet = new Object();
	            //订单号
	            dataSet.orderId = info[i].DrawingsOrder;
	            //账户
	            dataSet.accountnum = info[i].UserName;
	            //交易时间
	            dataSet.optime = info[i].CreateTime;
	            //交易备注
	            if(info[i].DrawingsState == "2"){
	                dataSet.details = info[i].DrawingsMark;
	            }else{
	                dataSet.details = getDrawingsMark(info[i].DrawingsType,info[i].DrawingsMark);
	            }
	            //交易状态
	            dataSet.state = getChargeState(info[i].DrawingsState+"");
	            //金额
	            dataSet.tmoney = parseFloat(info[i].DrawingsMoney);
	            //提款方式
	            dataSet.withdrawalType = getTradeWay(info[i].DrawingsType+"");
	            //手续费
	            dataSet.feeMoney = parseFloat(info[i].FeeMoney);
	
	            dataSet.tradeway = info[i].tradeway;
	
				var $itemLi = $('<li></li>').data('withdrawal',dataSet);
				$itemLi.on('click',function() {
					onItemClickListenerChargeWit();				
					localStorageUtils.setParam("withdrawal",JSON.stringify($(this).data('withdrawal')));
					setPanelBackPage_Fun('withdrawalRecordDetail');
				});
				
//				$itemLi.append('<a class="recordList"><dl class="orderList"><dd>金额:&nbsp;'+ dataSet.tmoney +'元</dd><dd>状态:&nbsp;'+dataSet.state+'</dd><dd>时间:&nbsp;' + dataSet.optime +'</dd></dl></a>');
				
				if(info[i].DrawingsState == 2 || info[i].DrawingsState ==4){//拒绝  交易失败
					$itemLi.append('<a class="recordList"><dl class="orderList"><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tmoney +'元</span></dd><dd>状态:&nbsp;'+dataSet.state+'</dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico_refuse.png"></dl></a>');
				}else{
					$itemLi.append('<a class="recordList"><dl class="orderList"><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tmoney +'元</span></dd><dd>状态:&nbsp;'+dataSet.state+'</dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico.png"></dl></a>');
				}
	
				$("#myWithdrawalRecordList").append($itemLi);
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
function searchChargeWit(startDateTime, endDateTime, type) {
    page=0;
    var paramssearch = '{"InterfaceName":"/api/v1/netweb/GetUserDrawingsInfoByPage","ProjectPublic_PlatformCode":2,"DrawingsState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myWith + '}';
    ajaxUtil.ajaxByAsyncPost1(null, paramssearch, searchSuccessCallBackWit,null);    
}
/**
 * 查询账户信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param type 查询收支类型
 */
function searchCharge_withdrawal(startDateTime, endDateTime, type) {
    var paramssearch = '{"InterfaceName":"/api/v1/netweb/GetUserDrawingsInfoByPage","ProjectPublic_PlatformCode":2,"DrawingsState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myWith + '}';
    ajaxUtil.ajaxByAsyncPost1(null, paramssearch, searchSuccessCallBackWit,null);    
}
//日期改变事件
function dateChangeWit() {
    var selectedIndex = $("#searchDateWit").val();
    switch(selectedIndex) {
        case "0":
            //当前记录
            $("#selectDateWithdrawal_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateWithdrawal_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateWithdrawal_Stt").val()+hms00;
            endDateTime = $("#selectDateWithdrawal_End").val()+hms59;
            type = $("#searchTypeWit").val();
            IsHistory=false;
            localStorageUtils.setParam("IsHistory",IsHistory);
            searchChargeWit(startDateTime, endDateTime, type);
            changeDateRange_withdrawal(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateWithdrawal_Stt").val(initDefaultDate(-4,'day'));  //View
            $("#selectDateWithdrawal_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDateWithdrawal_Stt").val()+hms00;
            endDateTime = $("#selectDateWithdrawal_End").val()+hms59;
            type = $("#searchTypeWit").val();
            IsHistory=true;
            localStorageUtils.setParam("IsHistory",IsHistory);
            searchChargeWit(startDateTime, endDateTime, type);
            changeDateRange_withdrawal(-33,"day",-4,"day");   //Controller
            break;
    }
}
/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_withdrawal(minNum,minType,maxNum,maxType){
    selectDateFF.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selectDateFG.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//玩法类型改变事件
function typeChangeWit() {
    type = $("#searchTypeWit").val();
    startDateTime = $("#selectDateWithdrawal_Stt").val()+hms00;
    endDateTime = $("#selectDateWithdrawal_End").val()+hms59;
    searchChargeWit(startDateTime, endDateTime, type);
}              
/**
 * 通过查询条件加载数据 
 */
function loadBySearchItemsWith() {
	var conditionsWithdrawal = getSearchTerm();
	if (null != conditionsWithdrawal) {
        if(unloadAtBettingDetail == true){
            initWithdrawalRecordsPage();
        }else {
            var dataOptions = document.getElementById('searchDateWit').options;
            for (var i = 0; i < dataOptions.length; i++) {
                dataOptions[i].selected = false;
                if (dataOptions[i].value == conditionsWithdrawal.time) {
                    dataOptions[i].selected = true;
                }
            }
            var typeOptions = document.getElementById('searchTypeWit').options;
            for (var i = 0; i < typeOptions.length; i++) {
                typeOptions[i].selected = false;
                if (typeOptions[i].value == conditionsWithdrawal.type) {
                    typeOptions[i].selected = true;
                }
            }
//          type = conditionsWithdrawal.type;
            if(!conditionsWithdrawal.type)type = 0;
            
            startDateTime = conditionsWithdrawal.dateStt + hms00;
            endDateTime = conditionsWithdrawal.dateEnd + hms59;
            $("#selectDateWithdrawal_Stt").val(conditionsWithdrawal.dateStt);
            $("#selectDateWithdrawal_End").val(conditionsWithdrawal.dateEnd);

            // 时间选择器
            var dateChange = conditionsWithdrawal.time;
            switch (dateChange) {
                case "0":
                    IsHistory = false;
                    localStorageUtils.setParam("IsHistory", IsHistory);
                    changeDateRange_withdrawal(-3, "day", 0, "day");   //Controller
                    break;
                case "1":
                    IsHistory = true;
                    localStorageUtils.setParam("IsHistory", IsHistory);
                    changeDateRange_withdrawal(-33, "day", -4, "day");   //Controller
                    break;
            }
            //根据日期查询条件查询数据
            searchChargeWit(startDateTime, endDateTime, type);
            //重置isDetail标记，表示从记录界面返回
            var searchconditionsWithdrawal = getSearchTerm();
            searchconditionsWithdrawal.isDetail = false;
            saveSearchTerm(searchconditionsWithdrawal);
        }
	} else {
        initWithdrawalRecordsPage();
	}
}
function initWithdrawalRecordsPage(){
    IsHistory=false;
    localStorageUtils.setParam("IsHistory",IsHistory);
    type = "null";
    $("#selectDateWithdrawal_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateWithdrawal_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateWithdrawal_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateWithdrawal_End").val()+hms59;
    searchChargeWit(startDateTime, endDateTime, type);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件 
 */
function onItemClickListenerChargeWit() {
	var searchconditionsWithdrawal = {};
	searchconditionsWithdrawal.time =  $("#searchDateWit").val();
	searchconditionsWithdrawal.type =  $("#searchTypeWit").val();
    searchconditionsWithdrawal.dateStt = $("#selectDateWithdrawal_Stt").val();
    searchconditionsWithdrawal.dateEnd = $("#selectDateWithdrawal_End").val();
	searchconditionsWithdrawal.isDetail =  true;
	saveSearchTerm(searchconditionsWithdrawal);
}