//页大小
var PAGESIZE_myTransfer = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var selDateTransferStart;
var selDateTransferEnd;
var userID;
var userName;
//IsHistory 默认false  是否是历史记录
var IsHistory = false;
var stateType = "0";
var thirdType = "";

/*进入panel时调用*/
function myTransferRecordLoadedPanel(){
    catchErrorFun("myTransferRecordInit();");
}
/*离开panel时调用*/
function myTransferRecordUnloadedPanel(){
    $("#myTransferList").empty();
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    stateType = "0";
    thirdType = "";
    if(selDateTransferStart){
        selDateTransferStart.dismiss();
    }
    if(selDateTransferEnd){
        selDateTransferEnd.dismiss();
    }
}

//@ 初始化
function myTransferRecordInit(){
    $("#selectMyTransferID").empty();
    var $select=$('<table><tr>' +
        '<td><select name="searchDate_myTransfer" id="searchDate_myTransfer" data-theme="a" data-mini="true" onchange="dateChange_myTransfer()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDateTransfer_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateTransfer_End" readonly/></td></tr>' +
        '<tr style="display: none;"><td colspan="3"><select name="searchType_myTransfer" id="searchType_myTransfer" data-theme="a" data-mini="true" onchange="typeChange_myTransfer()">' +
        '<option value="0" selected="selected">状态：全部</option>'+
        '<option value="2">状态：成功</option>'+
        '<option value="3">状态：处理中</option>'+
        '<option value="4">状态：失败</option></select></td></tr>'+
        '<tr><td colspan="3"><select name="TransferType" id="TransferType" data-theme="a" data-mini="true" onchange="TransferTypeChange()">'+
    	'</select></td></tr>'+
        '</table>');
    $("#selectMyTransferID").append($select);
    
    //获取第三方可展示的平台
    thirdPartyTransferType();

    //查询开始时间
    selDateTransferStart = new MobileSelectDate();
    selDateTransferStart.init({trigger:'#selectDateTransfer_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selDateTransferEnd = new MobileSelectDate();
    selDateTransferEnd.init({trigger:'#selectDateTransfer_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

    userID = localStorageUtils.getParam("myUserID");
    userName = localStorageUtils.getParam("username");
    page = 0;
    hasMorePage = true;//默认还有分页
    var _myScroller =  $("#myTransferScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'myTransferList','getMyTransferNext()');
//  //进入时加载
//  loadMyTransferRecord();

    // 转账记录查询（右上角搜索）
    $("#queryMyTransferButton").unbind('click');
    $("#queryMyTransferButton").bind('click', function(event) {
        $.ui.popup({
            title:"订单号查询",
            message:'<input type="text" id="myTransferOrderId" maxLength="25"  placeholder="请输入要查找的订单号" />',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var searchOrder = $("#myTransferOrderId").val();
                    if(searchOrder ==""){
                        toastUtils.showToast("请输入要查找的订单号");
                        return;
                    }
                    queryMyTransferOrder(searchOrder);
                },
            cancelOnly:false
        });
    });
}

//获取第三方可展示的平台
function thirdPartyTransferType(){
	ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyTransferDirection"}',function (data) {
		if (data.Code == 200) {
			var type_Arr = data.Data.TransferDirection;
			var top_item = $('<option value="0" selected="selected">全部</option>');
			$("#TransferType").append(top_item);
			for(var i=0;i<type_Arr.length;i++){
				var top_item = $('<option value='+type_Arr[i].ThirdpartyValue+'>'+type_Arr[i].ThirdpartyText+'</option>');
				$("#TransferType").append(top_item);
			}
			thirdType = $("#TransferType").val();
			//进入时加载
    		loadMyTransferRecord();
		} else {
			toastUtils.showToast(data.Msg);
		}
	},'正在加载数据');
}

//@ 日期改变事件
function dateChange_myTransfer() {
    var timeType = $("#searchDate_myTransfer").val();
    switch(timeType) {
        case "0":
            //当前记录
            $("#selectDateTransfer_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateTransfer_End").val(initDefaultDate(0,'day'));
            IsHistory = false;
            startDateTime = $("#selectDateTransfer_Stt").val()+hms00;
            endDateTime = $("#selectDateTransfer_End").val()+hms59;
            searchMyTransfer(startDateTime, endDateTime);
            changeDateRange_Transfer(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateTransfer_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDateTransfer_End").val(initDefaultDate(-4,'day'));
            IsHistory = true;
            startDateTime = $("#selectDateTransfer_Stt").val()+hms00;
            endDateTime = $("#selectDateTransfer_End").val()+hms59;
            searchMyTransfer(startDateTime, endDateTime);
            changeDateRange_Transfer(-33,"day",-4,"day");     //Controller
            break;
    }
}

//@ 类型改变事件
function TransferTypeChange() {
    thirdType = $("#TransferType").val();
    searchMyTransfer(startDateTime, endDateTime);
}
//@ 类型改变事件
function typeChange_myTransfer() {
    stateType = $("#searchType_myTransfer").val();
    searchMyTransfer(startDateTime, endDateTime);
}

//@ 切换当前记录或者历史记录时。
function changeDateRange_Transfer(minNum,minType,maxNum,maxType){
    selDateTransferStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateTransferEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//@ 查询转账记录 - First Page
function searchMyTransfer(startDateTime, endDateTime) {
    page=0;
    searchmyTransfer_Record(startDateTime, endDateTime)
}

//@ next Page
function getMyTransferNext(){
    startDateTime = $("#selectDateTransfer_Stt").val()+hms00;
    endDateTime = $("#selectDateTransfer_End").val()+hms59;
    searchmyTransfer_Record(startDateTime, endDateTime);
}

//@ 查询转账记录
function searchmyTransfer_Record(startDateTime, endDateTime) {
    ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/ThirdPartyGetUserTransfer","ProjectPublic_PlatformCode":2,"OrderID":"","Source":"0","TransferType":"0","UserName":"'+ userName +'","ID":"'+thirdType+'","IsHistory":' + IsHistory + ',"InsertTimeMin":"' + startDateTime + '","InsertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myTransfer + '}',
        myTransfer_searchSuccessCallBack, '正在加载数据...');
}

//@ 根据订单号查找
function queryMyTransferOrder(searchOrder){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/ThirdPartyGetUserTransfer","ProjectPublic_PlatformCode":2,"OrderID":"","Source":"0","TransferType":"0","UserName":"'+ userName +'","ID":"'+thirdType+'","IsHistory":' + IsHistory + ',"InsertTimeMin":"' + startDateTime + '","InsertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myTransfer + '}',
        myTransfer_searchSuccessCallBack, '正在加载数据...');
}

//@ 通过查询条件加载数据
function loadMyTransferRecord() {
    var conditions = getSearchTerm();
    if (null != conditions) {
        var dataOptions = document.getElementById('searchDate_myTransfer').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }

        var typeOptions = document.getElementById('searchType_myTransfer').options;
        for (var j = 0; j < typeOptions.length; j++) {
            typeOptions[j].selected = false;
            if (typeOptions[j].value == conditions.type) {
                typeOptions[j].selected = true;
            }
        }
        
        var thirdtypeOptions = document.getElementById('TransferType').options;
        for (var j = 0; j < thirdtypeOptions.length; j++) {
            thirdtypeOptions[j].selected = false;
            if (thirdtypeOptions[j].value == conditions.thirdType) {
                thirdtypeOptions[j].selected = true;
            }
        }

        stateType = $("#searchType_myTransfer").val();
        thirdType = $("#TransferType").val();
        startDateTime = conditions.dateStt + hms00;
        endDateTime = conditions.dateEnd + hms59;
        $("#selectDateTransfer_Stt").val(conditions.dateStt);
        $("#selectDateTransfer_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
            	IsHistory = false;
                changeDateRange_Transfer(-3,"day",0,"day");   //Controller
                break;
            case "1":
            	IsHistory = true;
                changeDateRange_Transfer(-33,"day",-4,"day");     //Controller
                break;
        }

        //根据查询条件查询数据
        searchMyTransfer(startDateTime, endDateTime);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
    } else {
        initmyTransfer();
    }
}

//@ Init
function initmyTransfer() {
    $("#selectDateTransfer_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateTransfer_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateTransfer_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateTransfer_End").val()+hms59;
    stateType = "0";
    thirdType = $("#TransferType").val();
    IsHistory = false;
    searchMyTransfer(startDateTime, endDateTime);
}

//@ 每个item点击时，触发该方法，保存当前的查询条件
function onItemClickListener_myTransfer() {
    var searchConditions = {};
    searchConditions.time =  $("#searchDate_myTransfer").val();
    searchConditions.type =  $("#searchType_myTransfer").val();
    searchConditions.thirdType =  $("#TransferType").val();
    searchConditions.dateStt =  $("#selectDateTransfer_Stt").val();
    searchConditions.dateEnd =  $("#selectDateTransfer_End").val();
    searchConditions.isDetail =  true;
    saveSearchTerm(searchConditions);
}

//@ Ajax返回数据
function myTransfer_searchSuccessCallBack(data){
	$("#myTransfer_noData_tips").hide();
    if (page == 0) {
        $("#myTransferList").empty();
        $("#myTransferScroller").scroller().scrollToTop();
        $("#myTransferScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#myTransfer_noData_tips").show();
	        //toastUtils.showToast("没有数据");
	        return;
	    }
	    var info=data.Data.DsUserTransfer;
	    if (data.Data.DataCount !=0) {
	        isHasMorePage(info,PAGESIZE_myTransfer);
	        for (var i = 0; i < info.length; i++) {
	            var dataSet = {};
	
	            dataSet.orderId = info[i].OrderId;  //订单号
	            dataSet.DetailsSource = info[i].DetailsSource;  //资金去向
	            dataSet.TransferMoney = info[i].TransferMoney;  //转账金额
	            dataSet.InsertTime = info[i].InsertTime;  //转账时间
	            dataSet.Marks = info[i].Marks;  //备注
	            dataSet.TransferType =  transferState[info[i].TransferType];  //状态
	
	            var $itemLi = $('<li></li>').data('myTransferRecord',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListener_myTransfer();
	                localStorageUtils.setParam("myTransferRecord",JSON.stringify($(this).data('myTransferRecord')));
	                setPanelBackPage_Fun('transferRecordDetail');
	            });
	            
//	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>资金去向:&nbsp;<span style="color:##FE5D39;">' + transferDetail(dataSet.DetailsSource) +'</span></dd><dd>转账金额:&nbsp;'+dataSet.TransferMoney+'</dd><dd>转账状态:&nbsp;' + dataSet.TransferType + '</dd><dd>转账时间:&nbsp;' + dataSet.InsertTime +'</dd></dl></a>');
	            
	          	if(info[i].TransferType == 4){//失败
	          		if($.inArray(Number(info[i].DetailsSource),[300,400,500,600,700,800,900]) != -1 ) {
	          			$itemLi.append('<a class="recordList"><dl class="orderList"><dd>资金去向:&nbsp;<span >' + transferDetail(dataSet.DetailsSource) +'</span></dd><dd>转账金额:&nbsp;<span style="color:#4bdc03">'+dataSet.TransferMoney+'</span></dd><dd>转账状态:&nbsp;' + dataSet.TransferType + '</dd><dd>转账时间:&nbsp;' + dataSet.InsertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico_refuse.png"></dl></a>');
	          		}else{
	          			$itemLi.append('<a class="recordList"><dl class="orderList"><dd>资金去向:&nbsp;<span >' + transferDetail(dataSet.DetailsSource) +'</span></dd><dd>转账金额:&nbsp;<span style="color:red">-'+dataSet.TransferMoney+'</span></dd><dd>转账状态:&nbsp;' + dataSet.TransferType + '</dd><dd>转账时间:&nbsp;' + dataSet.InsertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico_refuse.png"></dl></a>');
	          		}
	          	}else{// 成功 未处理
	          		if($.inArray(Number(info[i].DetailsSource),[300,400,500,600,700,800,900]) != -1 ) {
	          			$itemLi.append('<a class="recordList"><dl class="orderList"><dd>资金去向:&nbsp;<span >' + transferDetail(dataSet.DetailsSource) +'</span></dd><dd>转账金额:&nbsp;<span style="color:#4bdc03">'+dataSet.TransferMoney+'</span></dd><dd>转账状态:&nbsp;' + dataSet.TransferType + '</dd><dd>转账时间:&nbsp;' + dataSet.InsertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico.png"></dl></a>');
	          		}else{
	          			$itemLi.append('<a class="recordList"><dl class="orderList"><dd>资金去向:&nbsp;<span >' + transferDetail(dataSet.DetailsSource) +'</span></dd><dd>转账金额:&nbsp;<span style="color:red">-'+dataSet.TransferMoney+'</span></dd><dd>转账状态:&nbsp;' + dataSet.TransferType + '</dd><dd>转账时间:&nbsp;' + dataSet.InsertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico.png"></dl></a>');
	          		}
	          	}
	            $("#myTransferList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

function transferDetail(detailsSource) {
	if(detailsSource==290){
        return "彩票-->美天棋牌";
    } else if(detailsSource==300){
        return "美天棋牌-->彩票";
    }else if(detailsSource==490){
        return "彩票-->开元棋牌";
    } else if(detailsSource==500){
        return "开元棋牌-->彩票";
	}else if(detailsSource==790){
        return "彩票-->幸运棋牌";
    } else if(detailsSource==800){
        return "幸运棋牌-->彩票";
    }else if(detailsSource==890){
        return "彩票-->乐游棋牌";
    } else if(detailsSource==900){
        return "乐游棋牌-->彩票";   
	}else if(detailsSource==390){
        return "彩票-->VR";
    } else if(detailsSource==400){
        return "VR-->彩票";
    }else if(detailsSource==590){
        return "彩票-->AG";
    } else if(detailsSource==600){
        return "AG-->彩票";
    } else {
        return "转账失败退款";
    }
}

var transferState = {
    "2":"交易成功",
    "3":"处理中",
    "4":"交易失败"
};