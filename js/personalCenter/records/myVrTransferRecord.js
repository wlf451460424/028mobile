//页大小
var PAGESIZE_myVrTransfer = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var DateVrTransferStart;
var DateVrTransferEnd;
var userID;
var userName;
//IsHistory 默认false  是否是历史记录
var IsHistory = false;
var stateType = "0";

/*进入panel时调用*/
function myVrTransferRecordLoadedPanel(){
    catchErrorFun("myVrTransferRecordInit();");
}
/*离开panel时调用*/
function myVrTransferRecordUnloadedPanel(){
    $("#myVrTransferList").empty();
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    stateType = "0";
    if(DateVrTransferStart){
        DateVrTransferStart.dismiss();
    }
    if(DateVrTransferEnd){
        DateVrTransferEnd.dismiss();
    }
}

//@ 初始化
function myVrTransferRecordInit(){
    $("#selectMyVrTransferID").empty();
    var $select=$('<table><tr>' +
        '<td><select name="searchDate_myVrTransfer" id="searchDate_myVrTransfer" data-theme="a" data-mini="true" onchange="dateChange_myVrTransfer()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDateVrTransfer_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateVrTransfer_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="searchType_myVrTransfer" id="searchType_myVrTransfer" data-theme="a" data-mini="true" onchange="typeChange_myVrTransfer()">' +
        '<option value="0" selected="selected">状态：全部</option>'+
        '<option value="2">状态：成功</option>'+
        '<option value="3">状态：处理中</option>'+
        '<option value="4">状态：失败</option></select></td></tr></table>');
    $("#selectMyVrTransferID").append($select);

    //查询开始时间
    DateVrTransferStart = new MobileSelectDate();
    DateVrTransferStart.init({trigger:'#selectDateVrTransfer_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    DateVrTransferEnd = new MobileSelectDate();
    DateVrTransferEnd.init({trigger:'#selectDateVrTransfer_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

    userID = localStorageUtils.getParam("myUserID");
    userName = localStorageUtils.getParam("username");
    page = 0;
    hasMorePage = true;//默认还有分页
    var _myScroller =  $("#myVrTransferScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'myVrTransferList','getMyVrTransferNext()');
    //进入时加载
    loadMyVrTransferRecord();

    // 转账记录查询（右上角搜索）
    $("#queryMyVrTransferButton").unbind('click');
    $("#queryMyVrTransferButton").bind('click', function(event) {
        $.ui.popup({
            title:"订单号查询",
            message:'<input type="text" id="myVrTransferOrderId" maxLength="25"  placeholder="请输入要查找的订单号" />',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var searchOrder = $("#myVrTransferOrderId").val();
                    if(searchOrder ==""){
                        toastUtils.showToast("请输入要查找的订单号");
                        return;
                    }
                    queryMyVrTransferOrder(searchOrder);
                },
            cancelOnly:false
        });
    });
}

//@ 日期改变事件
function dateChange_myVrTransfer() {
    var timeType = $("#searchDate_myVrTransfer").val();
    switch(timeType) {
        case "0":
            //当前记录
            $("#selectDateVrTransfer_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateVrTransfer_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateVrTransfer_Stt").val()+hms00;
            endDateTime = $("#selectDateVrTransfer_End").val()+hms59;
            searchMyVrTransfer(startDateTime, endDateTime);
            changeDateRange_VrTransfer(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateVrTransfer_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDateVrTransfer_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDateVrTransfer_Stt").val()+hms00;
            endDateTime = $("#selectDateVrTransfer_End").val()+hms59;
            searchMyVrTransfer(startDateTime, endDateTime);
            changeDateRange_VrTransfer(-33,"day",-4,"day");     //Controller
            break;
    }
}

//@ 类型改变事件
function typeChange_myVrTransfer() {
    stateType = $("#searchType_myVrTransfer").val();
    searchMyVrTransfer(startDateTime, endDateTime);
}

//@ 切换当前记录或者历史记录时。
function changeDateRange_VrTransfer(minNum,minType,maxNum,maxType){
    DateVrTransferStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    DateVrTransferEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//@ 查询转账记录 - First Page
function searchMyVrTransfer(startDateTime, endDateTime) {
    page=0;
    searchMyVrTransfer_Record(startDateTime, endDateTime)
}

//@ next Page
function getMyVrTransferNext(){
    startDateTime = $("#selectDateVrTransfer_Stt").val()+hms00;
    endDateTime = $("#selectDateVrTransfer_End").val()+hms59;
    searchMyVrTransfer_Record(startDateTime, endDateTime);
}

//@ 查询转账记录
function searchMyVrTransfer_Record(startDateTime, endDateTime) {
    ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/VRGetUserTransfer","ProjectPublic_PlatformCode":2,"OrderID":"","UserID":'+ userID +',"UserName":"'+ userName +'","Source":0,"TransferType":'+ stateType +',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myVrTransfer + '}',
    myVrTransfer_searchSuccessCallBack, '正在加载数据...');
}

//@ 根据订单号查找
function queryMyVrTransferOrder(searchOrder){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/VRGetUserTransfer","ProjectPublic_PlatformCode":2,"OrderID":"'+ searchOrder +'","UserID":'+ userID +',"Source":0,"TransferType":'+ stateType +',"UserName":"'+ userName +'","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myVrTransfer + '}',
    myVrTransfer_searchSuccessCallBack, '正在加载数据...');
}

//@ Ajax返回数据
function myVrTransfer_searchSuccessCallBack(data){
	$("#myVrTransfer_noData_tips").hide();
    if (page == 0) {
        $("#myVrTransferList").empty();
        $("#myVrTransferScroller").scroller().scrollToTop();
        $("#myVrTransferScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#myVrTransfer_noData_tips").show();
	        //toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount ==0) {
	    	$("#myVrTransfer_noData_tips").show();
	      	//toastUtils.showToast("没有数据");
	    }
	    var info = data.Data.VRUserTransfer;
	    if (data.Data.DataCount !=0) {
	        isHasMorePage(info,PAGESIZE_myVrTransfer);
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = {};
	
	            dataSet.orderId = info[i].OrderId;  //订单号
	            dataSet.DetailsSource = info[i].DetailsSource;  //资金去向
	            dataSet.TransferMoney = info[i].TransferMoney;  //转账金额
	            dataSet.InsertTime = info[i].InsertTime;  //转账时间
	            dataSet.Marks = info[i].Marks;  //备注
	            dataSet.TransferType =  VrtransferState[info[i].TransferType];  //状态
	
	            var $itemLi = $('<li></li>').data('myVrTransferRecord',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListener_myVrTransfer();
	                localStorageUtils.setParam("myVrTransferRecord",JSON.stringify($(this).data('myVrTransferRecord')));
	                setPanelBackPage_Fun('VrTransferRecordDetail');
	            });
	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>资金去向:&nbsp;<span class="red">' + VrtransferDetail(dataSet.DetailsSource) +'</span></dd><dd>转账金额:&nbsp;'+dataSet.TransferMoney+'</dd><dd>转账状态:&nbsp;' + dataSet.TransferType + '</dd><dd>转账时间:&nbsp;' + dataSet.InsertTime +'</dd></dl></a>');
	            $("#myVrTransferList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 通过查询条件加载数据
function loadMyVrTransferRecord() {
    var conditions = getSearchTerm();
    if (null != conditions) {
        var dataOptions = document.getElementById('searchDate_myVrTransfer').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }

        var typeOptions = document.getElementById('searchType_myVrTransfer').options;
        for (var j = 0; j < typeOptions.length; j++) {
            typeOptions[j].selected = false;
            if (typeOptions[j].value == conditions.type) {
                typeOptions[j].selected = true;
            }
        }

        stateType = $("#searchType_myVrTransfer").val();
        startDateTime = conditions.dateStt + hms00;
        endDateTime = conditions.dateEnd + hms59;
        $("#selectDateVrTransfer_Stt").val(conditions.dateStt);
        $("#selectDateVrTransfer_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_VrTransfer(-3,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_VrTransfer(-33,"day",-4,"day");     //Controller
                break;
        }

        //根据查询条件查询数据
        searchMyVrTransfer(startDateTime, endDateTime);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
    } else {
        initMyVrTransfer();
    }
}

//@ Init
function initMyVrTransfer() {
    $("#selectDateVrTransfer_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateVrTransfer_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateVrTransfer_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateVrTransfer_End").val()+hms59;
    stateType = "0";
    searchMyVrTransfer(startDateTime, endDateTime);
}

//@ 每个item点击时，触发该方法，保存当前的查询条件
function onItemClickListener_myVrTransfer() {
    var searchConditions = {};
    searchConditions.time =  $("#searchDate_myVrTransfer").val();
    searchConditions.type =  $("#searchType_myVrTransfer").val();
    searchConditions.dateStt =  $("#selectDateVrTransfer_Stt").val();
    searchConditions.dateEnd =  $("#selectDateVrTransfer_End").val();
    searchConditions.isDetail =  true;
    saveSearchTerm(searchConditions);
}

function VrtransferDetail(source) {
    if (source == '400'){
        return "真人-->彩票";
    }else if (source == "390"){
        return "彩票--真人";
    }else {
        return "返款";
    }
}

var VrtransferState = {
   "2":"成功",
   "3":"处理中",
   "4":"失败"
};