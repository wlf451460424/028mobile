var Pagesize_getRedPak = 20; //页大小
var startDateTime = "";  //查询开始时间
var endDateTime = "";  //查询结束时间
var IsHistory = false;  //IsHistory 默认false  是否是历史记录
var page = 1;
var selectDateStart_getRedPak;
var selectDateEnd_getRedPak;

//@ Load
function getRedPacketRecordLoadedPanel() {
	catchErrorFun("getRedPacketRecord_init()");
}

//@ Unload
function getRedPacketRecordUnloadedPanel() {
	$("#getRedPacketRecordList").empty();
	startDateTime = "";
	endDateTime = "";   
	//清除本地存储的查询条件
	clearSearchTerm();
	if(selectDateStart_getRedPak){
		selectDateStart_getRedPak.dismiss();
	}
	if(selectDateEnd_getRedPak){
		selectDateEnd_getRedPak.dismiss();
	}
}

//@ Init
function getRedPacketRecord_init() {
	$("#selectDate_getRedPacket").empty();
	
	$("#total_Money").html("0");//总金额;
	$("#total_Num").html("0");//红包个数;
	$("#BestOfluck").html("0");//手气最佳;
	$("#Unreceived_Num").html("0");//待领红包个数;

	//不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
	var $selectDate=$('<table><tr><td><select id="get_redPak_date" data-theme="a" data-mini="true" onchange="selectGetPacketDate()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectGetPacket_Stt" readonly/></td><td><input type="text" id="selectGetPacket_End" readonly/></td></tr></table>');
	$("#selectDate_getRedPacket").append($selectDate);

	selectDateStart_getRedPak = new MobileSelectDate();
	selectDateStart_getRedPak.init({trigger:'#selectGetPacket_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
	selectDateEnd_getRedPak = new MobileSelectDate();
	selectDateEnd_getRedPak.init({trigger:'#selectGetPacket_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

	page = 1;
	hasMorePage = true;//默认还有分页
	var myScroller = $("#getRedPacketRecordScroller").scroller({
		verticalScroll : true,
		horizontalScroll : false,
		vScrollCSS: "afScrollbar",
		autoEnable : true
	});
	myScroller.scrollToTop();
	myScroller.clearInfinite();
	addUseScroller_new(myScroller,'getRedPacketRecordList','getPacketRecordByScroll()');

	//进入时加载
	loadItems_getPacket();
}

//@ 下拉滚动-刷新列表数据
function getPacketRecordByScroll(){
	startDateTime = $("#selectGetPacket_Stt").val()+hms00;
	endDateTime = $("#selectGetPacket_End").val()+hms59;
	getPacketRecord_scroll(startDateTime, endDateTime);
}

/**
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 */
function searchGetRedPacket(startDateTime, endDateTime) {
	page=1;
	var param = '{"InterfaceName":"/api/v1/netweb/redPacket_getRecordList","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + Pagesize_getRedPak + ',"IsHistory":'+ $("#get_redPak_date").val()+'}';
	ajaxUtil.ajaxByAsyncPost1(null, param, getRedPacketRecordCB,null);
	
	var param = '{"InterfaceName":"/api/v1/netweb/redPacket_getRecordTotal","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + Pagesize_getRedPak + ',"IsHistory":'+ $("#get_redPak_date").val()+'}';
	ajaxUtil.ajaxByAsyncPost1(null, param, getRedPacketRecordCB_total,null);
	
}

//@ 下拉列表，刷新充值数据
function getPacketRecord_scroll(startDateTime, endDateTime){
	var paramssearch_scroll = '{"InterfaceName":"/api/v1/netweb/redPacket_getRecordList","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + Pagesize_getRedPak + ',"IsHistory":'+ $("#get_redPak_date").val()+'}';
	ajaxUtil.ajaxByAsyncPost1(null, paramssearch_scroll, getRedPacketRecordCB,null);
	
	var paramssearch_scroll = '{"InterfaceName":"/api/v1/netweb/redPacket_getRecordTotal","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + Pagesize_getRedPak + ',"IsHistory":'+ $("#get_redPak_date").val()+'}';
	ajaxUtil.ajaxByAsyncPost1(null, paramssearch_scroll, getRedPacketRecordCB_total,null);
}

//@ CallBack
function getRedPacketRecordCB(data) {
	if (data.Code == 200) {
		if (page == 1) {
			$("#getRedPacketRecordList").empty();
			$("#getRedPacketRecordScroller").scroller().scrollToTop();
			$("#getRedPacketRecordScroller").scroller().clearInfinite();
		}
		
		var info=data.Data.ReceivedRecords.Records;
        isHasMorePage(info,Pagesize_getRedPak);
        for (var i = 0; i < info.length; i++) {
            var dataSet = new Object();
            //订单号
            dataSet.SysId = info[i].SysId;
            dataSet.IsHistory = $("#get_redPak_date").val();

            var $itemLi = $('<li></li>').data('getRedPacket',dataSet);
            $itemLi.on('click',function() {
                onItemClickListener_getPacket();
                localStorageUtils.setParam("getRedPacket",JSON.stringify($(this).data('getRedPacket')));
                setPanelBackPage_Fun('getRedPacketRecordDetail');
            });
            
            var redpacket_type = info[i].Mode == 1 ? '普通红包':'拼手气红包';
            
            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>发送人:&nbsp;' + info[i].UserName + '</dd><dd>红包类型:&nbsp;<span class="red">' + redpacket_type +'</span></dd><dd>金额:&nbsp;'+ info[i].Amount +'元</dd><dd>抢红包时间:&nbsp;' + info[i].OpenTime +'</dd></dl></a>');
            $("#getRedPacketRecordList").append($itemLi);
        }
	}else if(data.Code == 401 || data.Code == 402 || data.Code == 403 || data.Code == 404 || data.Code == 405|| data.Code == 423){
		toastUtils.showToast("请重新登录");
		loginAgain();
	}else{
		var message = data.Msg || "未获取到数据";
        toastUtils.showToast(message);
	}
}

//@ CallBack
function getRedPacketRecordCB_total(data) {
	signLoginTips(data);
	if(!data){
		toastUtils.showToast("当前网络不给力，请稍后再试");
		return;
	}
	
	if (data.Code == 200) {
		$("#get_total_Money").html(data.Data.TotalMoney);//总金额;
		$("#get_total_Num").html(data.Data.SumNum);//红包个数;
		$("#get_BestOfluck").html(data.Data.BestLuckNum);//手气最佳;
		$("#get_Unreceived_Num").html(data.Data.UnreceivedNum);//待领红包个数;
	}else{
		var message = data.Msg || "未获取到数据";
        toastUtils.showToast(message);
	}
}

//日期改变事件
function selectGetPacketDate() {
	page = 1;
	var selected = $("#get_redPak_date").val();
	switch(selected) {
		case "0":
			//当前记录
			$("#selectGetPacket_Stt").val(initDefaultDate(0,'day'));  //View
			$("#selectGetPacket_End").val(initDefaultDate(0,'day'));
			startDateTime = $("#selectGetPacket_Stt").val()+hms00;
			endDateTime = $("#selectGetPacket_End").val()+hms59;
			IsHistory = false;
			searchGetRedPacket(startDateTime, endDateTime);
			changeDateRange_getPacket(-3,"day",0,"day");   //Controller
			break;
		case "1":
			//历史记录
			$("#selectGetPacket_Stt").val(initDefaultDate(-4,'day'));  //view
			$("#selectGetPacket_End").val(initDefaultDate(-4,'day'));
			startDateTime = $("#selectGetPacket_Stt").val()+hms00;
			endDateTime = $("#selectGetPacket_End").val()+hms59;
			IsHistory = true;
			searchGetRedPacket(startDateTime, endDateTime);
			changeDateRange_getPacket(-33,"day",-4,"day");     //Controller
			break;
	}
}

//@ 切换当前记录或者历史记录时
function changeDateRange_getPacket(minNum,minType,maxNum,maxType){
	selectDateStart_getRedPak.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
	selectDateEnd_getRedPak.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 * 通过查询条件加载数据
 */
function loadItems_getPacket() {
	var conditions_getPacket = getSearchTerm();
	if (null != conditions_getPacket) {
		var dataOptions = document.getElementById('get_redPak_date').options;
		for (var i = 0; i < dataOptions.length; i++) {
			dataOptions[i].selected = false;
			if (dataOptions[i].value == conditions_getPacket.time) {
				dataOptions[i].selected = true;
			}
		}
		
		startDateTime = conditions_getPacket.dateStt + hms00;
		endDateTime = conditions_getPacket.dateEnd + hms59;
		$("#selectGetPacket_Stt").val(conditions_getPacket.dateStt);
		$("#selectGetPacket_End").val(conditions_getPacket.dateEnd);

		// 时间选择器
		var dateChange = conditions_getPacket.time;
		switch (dateChange){
			case "0":
				IsHistory=false;
				changeDateRange_getPacket(-3,"day",0,"day");   //Controller
				break;
			case "1":
				IsHistory=true;
				changeDateRange_getPacket(-33,"day",-4,"day");   //Controller
				break;
		}
		//根据日期查询条件查询数据
		searchGetRedPacket(startDateTime, endDateTime);
		//重置isDetail标记，表示从记录界面返回
		var searchConditions_getPacket = getSearchTerm();
		searchConditions_getPacket.isDetail =  false;
		saveSearchTerm(searchConditions_getPacket);
	} else {
		initGetRedPacketPage();
	}
}

function initGetRedPacketPage() {
	IsHistory = false;
	$("#selectGetPacket_Stt").val(initDefaultDate(0,"day"));
	$("#selectGetPacket_End").val(initDefaultDate(0,"day"));
	//查询开始时间
	startDateTime = $("#selectGetPacket_Stt").val()+hms00;
	//查询结束时间
	endDateTime = $("#selectGetPacket_End").val()+hms59;
	searchGetRedPacket(startDateTime, endDateTime);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_getPacket() {
	var searchConditions_getPacket = {};
	searchConditions_getPacket.time =  $("#get_redPak_date").val();
	searchConditions_getPacket.dateStt = $("#selectGetPacket_Stt").val();
	searchConditions_getPacket.dateEnd = $("#selectGetPacket_End").val();
	searchConditions_getPacket.isDetail = true;
	saveSearchTerm(searchConditions_getPacket);
}