//页大小
var PAGESIZE_teamWithdrawal = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//收支类型
var type = 3;
var queryName="";

var selDateWithdrawalStart;
var selDateWithdrawalEnd;

/*进入panel时调用*/
function teamWithdrawalLoadedPanel(){
	catchErrorFun("teamWithdrawalInit();");
}
/*离开panel时调用*/
function teamWithdrawalUnloadedPanel(){
	$("#teamWithdrawalList").empty();
    clearSearchTerm();      
    startDateTime = "";
    endDateTime = ""; 
    type = 3;
    queryName="";
    userName = "";
    if(selDateWithdrawalStart){
        selDateWithdrawalStart.dismiss();
    }
    if(selDateWithdrawalEnd){
        selDateWithdrawalEnd.dismiss();
    }
}
function teamWithdrawalInit(){
    $("#selectteamWithdrawalID").empty();
    //状态 - null:全部; 1:交易中; 3:交易成功; 4:交易失败; 2:拒绝; 0:未处理(暂时去掉).
    var $select=$('<table><tr>' +
        '<td><select name="searchDate_teamWithdrawal" id="searchDate_teamWithdrawal" data-theme="a" data-mini="true" onchange="dateChange_teamWithdrawal()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDateTW_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateTW_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="searchType_teamWithdrawal" id="searchType_teamWithdrawal" data-theme="a" data-mini="true" onchange="typeChange_teamWithdrawal()"><option value="null">状态：全部</option><option value="1">状态：交易中</option><option selected="selected" value="3">状态：交易成功</option><option value="4">状态：交易失败</option><option value="0">状态：未处理</option><option value="2">状态：拒绝</option></select></td></tr></table>');

    $("#selectteamWithdrawalID").append($select);
    //查询开始时间
    selDateWithdrawalStart = new MobileSelectDate();
    selDateWithdrawalStart.init({trigger:'#selectDateTW_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selDateWithdrawalEnd = new MobileSelectDate();
    selDateWithdrawalEnd.init({trigger:'#selectDateTW_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    userName = localStorageUtils.getParam("username");
    type = 3;
    page = 0;
    hasMorePage = true;//默认还有分页
    var _myScroller =  $("#teamWithdrawalScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'teamWithdrawalList','getchteamWithdrawal_Record()');
    //进入时加载
    loadBySearchteamWithdrawal();  

    /**
     * 团队充值查询
     */
    $("#queryTeamWithdrawalButtonID").unbind('click');
    $("#queryTeamWithdrawalButtonID").bind('click', function(event) {
             $.ui.popup({
                title:"团队提款查询",
                message:'<input type="text" id="teamWithdrawalUserNameId" maxLength="25"  placeholder="请输入要查找的用户名" />',
                cancelText:"关闭",
                cancelCallback:
                function(){ 
                },
                doneText:"确定",
                doneCallback:
                function(){
                    var searchUser = $("#teamWithdrawalUserNameId").val();
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                     return;
                    }                    
                   queryteamWithdrawalUserName(searchUser);
                },
                cancelOnly:false
            });
    });  
}

function getchteamWithdrawal_Record(){
    searchteamWithdrawal_Record(startDateTime, endDateTime, type);
}

/**
 * 通过查询条件加载数据 
 */
function loadBySearchteamWithdrawal() {
    var conditions = getSearchTerm();
    if (null != conditions) {
        var dataOptions = document.getElementById('searchDate_teamWithdrawal').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }      
        var typeOptions = document.getElementById('searchType_teamWithdrawal').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }
        type = $("#searchType_teamWithdrawal").val();
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#selectDateTW_Stt").val(conditions.dateStt);
        $("#selectDateTW_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_TW(-3,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_TW(-33,"day",-4,"day");     //Controller
                break;
        }
        //根据查询条件查询数据
        searchteamWithdrawal(startDateTime, endDateTime, type);
         //重置isDetail标记，表示从记录界面返回
         var searchConditions = getSearchTerm();
         searchConditions.isDetail =  false;
         saveSearchTerm(searchConditions);
 
     } else {
        initTeamWithdrawal();
     }
}

function initTeamWithdrawal() {
    type = 3;
    $("#selectDateTW_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateTW_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateTW_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateTW_End").val()+hms59;
    searchteamWithdrawal(startDateTime, endDateTime, type);
}

//日期改变事件
function dateChange_teamWithdrawal() {
    var timeType = $("#searchDate_teamWithdrawal").val();
    type = $("#searchType_teamWithdrawal").val();
    switch(timeType) {
        case "0":
            //当前记录
            $("#selectDateTW_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateTW_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateTW_Stt").val()+hms00;
            endDateTime = $("#selectDateTW_End").val()+hms59;
            searchteamWithdrawal(startDateTime, endDateTime,type);
            changeDateRange_TW(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateTW_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDateTW_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDateTW_Stt").val()+hms00;
            endDateTime = $("#selectDateTW_End").val()+hms59;
            searchteamWithdrawal(startDateTime, endDateTime,type);
            changeDateRange_TW(-33,"day",-4,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_TW(minNum,minType,maxNum,maxType){
    selDateWithdrawalStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateWithdrawalEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 *查询团队充值记录 
 */
function searchteamWithdrawal(startDateTime, endDateTime, type) {
    page=0;
    ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/GetUserDrawingsInfoByPage","SearchMyTeam":true,"ProjectPublic_PlatformCode":3,"DrawingsState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamWithdrawal + '}', 
    teamWithdrawal_searchSuccessCallBack, '正在加载数据...');
}
/**
 *查询团队充值记录 
 */
function searchteamWithdrawal_Record(startDateTime, endDateTime, type) {
    ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/GetUserDrawingsInfoByPage","SearchMyTeam":true,"ProjectPublic_PlatformCode":3,"DrawingsState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamWithdrawal + '}', 
    teamWithdrawal_searchSuccessCallBack, '正在加载数据...');
}
//类型改变事件
function typeChange_teamWithdrawal() {
    type = $("#searchType_teamWithdrawal").val();
    startDateTime = $("#selectDateTW_Stt").val()+hms00;
    endDateTime = $("#selectDateTW_End").val()+hms59;
    searchteamWithdrawal(startDateTime, endDateTime, type);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件 
 */
function onItemClickListener_teamWithdrawal() {
     var searchConditions = {};
     searchConditions.time =  $("#searchDate_teamWithdrawal").val();
     searchConditions.type =  $("#searchType_teamWithdrawal").val();
     searchConditions.dateStt =  $("#selectDateTW_Stt").val();
     searchConditions.dateEnd =  $("#selectDateTW_End").val();
     searchConditions.isDetail =  true;
     saveSearchTerm(searchConditions);
}

function teamWithdrawal_searchSuccessCallBack(data){
	$("#teamWithdrawal_noData_tips").hide();
    if (page == 0) {
        $("#teamWithdrawalList").empty();
        $("#teamWithdrawalScroller").scroller().scrollToTop();
        $("#teamWithdrawalScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#teamWithdrawal_noData_tips").show();
	       //toastUtils.showToast("没有数据");
	         return;
	    }
	    if (data.Data.DataCount ==0) {
	    	$("#teamWithdrawal_noData_tips").show();
	        //toastUtils.showToast("没有数据");
	        return;
	    }
	    var info=data.Data.ModelList;    
	    if (data.Data.DataCount !=0) {
	        isHasMorePage(info,PAGESIZE_teamWithdrawal);
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = new Object();
	            //订单号
	            dataSet.orderId = info[i].DrawingsOrder;
	            //账户
	            dataSet.accountnum = info[i].UserName;
	            //交易时间
	            dataSet.optime = info[i].CreateTime;
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
	            dataSet.shouXuFei = "--";
	
	            dataSet.tradeway = info[i].tradeway;
	            var $itemLi = $('<li></li>').data('teamWithdrawal',dataSet);
	                $itemLi.on('click',function() {
	                    onItemClickListener_teamWithdrawal();             
	                    localStorageUtils.setParam("teamWithdrawal",JSON.stringify($(this).data('teamWithdrawal')));
	                    setPanelBackPage_Fun('teamWithdrawalDetail');
	                });
	                $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;' + dataSet.accountnum + '</dd><dd>金额:&nbsp;<span class="red">' + dataSet.tmoney +'元</span></dd><dd>状态:&nbsp;'+dataSet.state+'</dd><dd>时间:&nbsp;' + dataSet.optime +'</dd></dl></a>');
	            $("#teamWithdrawalList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//根据用户名查找
function queryteamWithdrawalUserName(searchUser){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"LikeUserName":"'+searchUser+'","InterfaceName":"/api/v1/netweb/GetUserDrawingsInfoByPage","SearchMyTeam":true,"ProjectPublic_PlatformCode":3,"DrawingsState":' + type + ',"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamWithdrawal + '}', 
    teamWithdrawal_searchSuccessCallBack, '正在加载数据...');
}