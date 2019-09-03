var Pagesize_sendRedPak = 20; //页大小
var startDateTime = "";  //查询开始时间
var endDateTime = "";  //查询结束时间
var sendState = -1;  //红包领取状态
var IsHistory = false;  //IsHistory 默认false  是否是历史记录
var page = 1;
var selectDateStart_sendRedPak;
var selectDateEnd_sendRedPak;

//@ Load
function sendRedPacketRecordLoadedPanel() {
	catchErrorFun("sendRedPacketRecord_init()");
}

//@ Unload
function sendRedPacketRecordUnloadedPanel() {
	$("#sendRedPacketRecordList").empty();
	startDateTime = "";
	endDateTime = "";
	sendState = -1;
	//清除本地存储的查询条件
	clearSearchTerm();
	if(selectDateStart_sendRedPak){
		selectDateStart_sendRedPak.dismiss();
	}
	if(selectDateEnd_sendRedPak){
		selectDateEnd_sendRedPak.dismiss();
	}
}


//@ Init
function sendRedPacketRecord_init() {
	$("#selectState_redPacket").empty();
	$("#selectDate_sendRedPacket").empty();
	
	$("#total_Money").html("0");//总金额;
	$("#total_Num").html("0");//红包个数;

	var $selectState = $('<select id="send_redPak_state" data-theme="a" data-mini="true" onchange="selectSendPacketState()"><option value="-1" selected="selected">全部</option><option value="1">已领完</option><option value="0">未领完</option></select>');
	$("#selectState_redPacket").append($selectState);

	//不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
	var $selectDate=$('<table><tr><td><select id="send_redPak_date" data-theme="a" data-mini="true" onchange="selectSendPacketDate()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectSendPacket_Stt" readonly/></td><td><input type="text" id="selectSendPacket_End" readonly/></td></tr></table>');
	$("#selectDate_sendRedPacket").append($selectDate);

	selectDateStart_sendRedPak = new MobileSelectDate();
	selectDateStart_sendRedPak.init({trigger:'#selectSendPacket_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
	selectDateEnd_sendRedPak = new MobileSelectDate();
	selectDateEnd_sendRedPak.init({trigger:'#selectSendPacket_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

	page = 1;
	hasMorePage = true;//默认还有分页
	var myScroller = $("#sendRedPacketRecordScroller").scroller({
		verticalScroll : true,
		horizontalScroll : false,
		vScrollCSS: "afScrollbar",
		autoEnable : true
	});
	myScroller.scrollToTop();
	myScroller.clearInfinite();
	addUseScroller_new(myScroller,'sendRedPacketRecordList','getSendPacketByScroll()');

	//进入时加载
	loadItems_sendPacket();
}

//@ 下拉滚动-刷新列表数据
function getSendPacketByScroll(){
	startDateTime = $("#selectSendPacket_Stt").val()+hms00;
	endDateTime = $("#selectSendPacket_End").val()+hms59;
	sendPacketRecord_scroll(startDateTime, endDateTime, sendState);
}

/**
 * 发红包记录
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param sendState 查询类型
 */
function searchSendRedPacket(startDateTime, endDateTime, sendState) {
	page=1;
	var param = '{"InterfaceName":"/api/v1/netweb/redPacket_sendRecord","ProjectPublic_PlatformCode":2,"state":"'+ $("#send_redPak_state").val() +'","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","IsHistory":' + IsHistory + ',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + Pagesize_sendRedPak + '}';
	ajaxUtil.ajaxByAsyncPost1(null, param, sendRedPacketRecordCB,null);
}

//@ 下拉列表，刷新充值数据
function sendPacketRecord_scroll(startDateTime, endDateTime, sendState){
	var paramssearch_scroll = '{"InterfaceName":"/api/v1/netweb/redPacket_sendRecord","ProjectPublic_PlatformCode":2,"state":'+ $("#send_redPak_state").val() +',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","IsHistory":' + IsHistory + ',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + Pagesize_sendRedPak + '}';
	ajaxUtil.ajaxByAsyncPost1(null, paramssearch_scroll, sendRedPacketRecordCB,null);
}

//@ CallBack
function sendRedPacketRecordCB(data) {
	if (data.Code == 200) {
		if (page == 1) {
			$("#sendRedPacketRecordList").empty();
			$("#sendRedPacketRecordScroller").scroller().scrollToTop();
			$("#sendRedPacketRecordScroller").scroller().clearInfinite();
		}

		//SendRecordTotal: {TotalAmount:0, TotalQty:0}
		$("#send_total_Money").html(data.Data.SendRecordTotal.TotalAmount);//总金额;
		$("#send_total_Num").html(data.Data.SendRecordTotal.TotalQty);//红包个数;
		
		var info=data.Data.SendRecords.Records;
        isHasMorePage(info,PAGESIZE_myCharge);
        for (var i = 0; i < info.length; i++) {
            var dataSet = new Object();
            //发红包标识
            dataSet.SysId = info[i].SysId;
            dataSet.IsHistory = IsHistory;

            var $itemLi = $('<li></li>').data('sendRedPacket',dataSet);
            $itemLi.on('click',function() {
                onItemClickListener_sendPacket();
                localStorageUtils.setParam("sendRedPacket",JSON.stringify($(this).data('sendRedPacket')));
                setPanelBackPage_Fun('sendRedPacketRecordDetail');
            });
            
            var redpacket_type = info[i].Mode==1?'普通红包':'拼手气红包';
            var redpacket_status ;
            redpacket_status = '已领完&nbsp&nbsp' + info[i].OpendedQty + '/' + info[i].Qty;
            
            if(parseInt(info[i].Qty)-parseInt(info[i].OpendedQty) > 0 ){// 没领完；
            	redpacket_status = '未领完&nbsp&nbsp' + info[i].OpendedQty + '/' + info[i].Qty;
            }else{
            	redpacket_status = '已领完&nbsp&nbsp' + info[i].OpendedQty + '/' + info[i].Qty;
            }
            
            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>红包类型:&nbsp;' + redpacket_type + '</dd><dd>总金额:&nbsp;<span class="red">' + info[i].Amount +'元</span></dd><dd>领取状态:&nbsp;'+ redpacket_status +'</dd><dd>发出时间:&nbsp;' + info[i].SendTime +'</dd></dl></a>');
            $("#sendRedPacketRecordList").append($itemLi);
        }
		
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else{
		var message = data.Msg || "未获取到数据";
        toastUtils.showToast(message);
	}
}

//日期改变事件
function selectSendPacketDate() {
	page = 1;
	var selected = $("#send_redPak_date").val();
	switch(selected) {
		case "0":
			//当前记录
			$("#selectSendPacket_Stt").val(initDefaultDate(0,'day'));  //View
			$("#selectSendPacket_End").val(initDefaultDate(0,'day'));
			startDateTime = $("#selectSendPacket_Stt").val()+hms00;
			endDateTime = $("#selectSendPacket_End").val()+hms59;
			sendState = $("#send_redPak_state").val();
			IsHistory = false;
			localStorageUtils.setParam("IsHistory",IsHistory);
			searchSendRedPacket(startDateTime, endDateTime, sendState);
			changeDateRange_sendPacket(-3,"day",0,"day");   //Controller
			break;
		case "1":
			//历史记录
			$("#selectSendPacket_Stt").val(initDefaultDate(-4,'day'));  //view
			$("#selectSendPacket_End").val(initDefaultDate(-4,'day'));
			startDateTime = $("#selectSendPacket_Stt").val()+hms00;
			endDateTime = $("#selectSendPacket_End").val()+hms59;
			sendState = $("#send_redPak_state").val();
			IsHistory = true;
			localStorageUtils.setParam("IsHistory",IsHistory);
			searchSendRedPacket(startDateTime, endDateTime, sendState);
			changeDateRange_sendPacket(-33,"day",-4,"day");     //Controller
			break;
	}
}

//@ 切换当前记录或者历史记录时
function changeDateRange_sendPacket(minNum,minType,maxNum,maxType){
	selectDateStart_sendRedPak.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
	selectDateEnd_sendRedPak.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//@ 类型改变事件
function selectSendPacketState() {
	page = 1;
	sendState = $("#send_redPak_state").val();
	startDateTime = $("#selectSendPacket_Stt").val()+hms00;
	endDateTime = $("#selectSendPacket_End").val()+hms59;
	searchSendRedPacket(startDateTime, endDateTime, sendState);
}

/**
 * 通过查询条件加载数据
 */
function loadItems_sendPacket() {
	var conditions_sendPacket = getSearchTerm();
	if (null != conditions_sendPacket) {
			var dataOptions = document.getElementById('send_redPak_date').options;
			for (var i = 0; i < dataOptions.length; i++) {
				dataOptions[i].selected = false;
				if (dataOptions[i].value == conditions_sendPacket.time) {
					dataOptions[i].selected = true;
				}
			}
			var typeOptions = document.getElementById('send_redPak_state').options;
			for (var i = 0; i < typeOptions.length; i++) {
				typeOptions[i].selected = false;
				if (typeOptions[i].value == conditions_sendPacket.sendState) {
					typeOptions[i].selected = true;
				}
			}
			sendState = conditions_sendPacket.sendState;
			startDateTime = conditions_sendPacket.dateStt + hms00;
			endDateTime = conditions_sendPacket.dateEnd + hms59;
			$("#selectSendPacket_Stt").val(conditions_sendPacket.dateStt);
			$("#selectSendPacket_End").val(conditions_sendPacket.dateEnd);

			// 时间选择器
			var dateChange = conditions_sendPacket.time;
			switch (dateChange){
				case "0":
					IsHistory=false;
					localStorageUtils.setParam("IsHistory",IsHistory);
					changeDateRange_sendPacket(-3,"day",0,"day");   //Controller
					break;
				case "1":
					IsHistory=true;
					localStorageUtils.setParam("IsHistory",IsHistory);
					changeDateRange_sendPacket(-33,"day",-4,"day");   //Controller
					break;
			}
			//根据日期查询条件查询数据
			searchSendRedPacket(startDateTime, endDateTime, sendState);
			//重置isDetail标记，表示从记录界面返回
			var searchConditions_sendPacket = getSearchTerm();
			searchConditions_sendPacket.isDetail =  false;
			saveSearchTerm(searchConditions_sendPacket);
	} else {
		initSendRedPacketPage();
	}
}
function initSendRedPacketPage() {
	IsHistory = false;
	localStorageUtils.setParam("IsHistory",IsHistory);
	sendState="-1";
	$("#selectSendPacket_Stt").val(initDefaultDate(0,"day"));
	$("#selectSendPacket_End").val(initDefaultDate(0,"day"));
	//查询开始时间
	startDateTime = $("#selectSendPacket_Stt").val()+hms00;
	//查询结束时间
	endDateTime = $("#selectSendPacket_End").val()+hms59;
	searchSendRedPacket(startDateTime, endDateTime, sendState);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_sendPacket() {
	var searchConditions_sendPacket = {};
	searchConditions_sendPacket.time =  $("#send_redPak_date").val();
	searchConditions_sendPacket.dateStt = $("#selectSendPacket_Stt").val();
	searchConditions_sendPacket.dateEnd = $("#selectSendPacket_End").val();
	searchConditions_sendPacket.isDetail = true;
	saveSearchTerm(searchConditions_sendPacket);
}