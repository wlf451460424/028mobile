//页大小
var PAGESIZE_myWin = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//彩种ID
var lotteryType =12;
//IsHistory 默认false  是否是历史记录
var IsHistory=false;
var selectDateCC;
var selectDateCD;

/*进入panel时调用*/
function myWinRecordLoadedPanel(){
	catchErrorFun("myWinRecordInit();");
}
/*离开panel时调用*/
function myWinRecordUnloadedPanel(){
	$("#myWinRecordList").empty();
	$("#searchLottery_winrecord").val("");
	//清除本地存储的查询条件
	clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    userName = "";
    lotteryType =12;	
	//清除本地存储的查询条件
	 clearSearchTerm();
	if(selectDateCC){
		selectDateCC.dismiss();
	}
	if(selectDateCD){
		selectDateCD.dismiss();
	}
}
function myWinRecordInit(){
	$("#selectID_myWinRecord").empty();
	$('#selectType_win').empty();
	var $select_win=$('<select name="searchLottery" id="searchLottery_winrecord" onchange="lotteryChange_myWinRecord()"></select>');
	$('#selectType_win').append($select_win);

	var $select=$('<table><tr><td><select name="searchDate_winrecord" id="searchDate_winrecord" onchange="dateChange_myWinRecord()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectDateWin_Stt"  readonly/></td><td><input type="text" id="selectDateWin_End" readonly/></td></tr></table>');
	$("#selectID_myWinRecord").append($select);

	selectDateCC = new MobileSelectDate();
	selectDateCC.init({trigger:'#selectDateWin_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
	selectDateCD = new MobileSelectDate();
	selectDateCD.init({trigger:'#selectDateWin_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

	userName = localStorageUtils.getParam("username");
	page = 0;
	hasMorePage = true;//默认还有分页
    var _myScroller =  $("#myWinRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
	_myScroller.clearInfinite();
    addUseScroller(_myScroller,'myWinRecordList','getmyWinRecord()');
    //进入时加载
    getLotteryType_myWinRecord();
}

/********** 查询投注记录  **********/
function getmyWinRecord(){
	startDateTime = $("#selectDateWin_Stt").val()+hms00;
	endDateTime = $("#selectDateWin_End").val()+hms59;
    searchBetting_WinRecord(startDateTime, endDateTime, lotteryType);
}

/********** 创建投注记录列表  **********/
function createmyWinRecordList(data){
	$("#myWinRecord_noData_tips").hide();
	if (page == 0) {
		$("#myWinRecordList").empty();
		$("#myWinRecordScroller").scroller().scrollToTop();
        $("#myWinRecordScroller").scroller().clearInfinite();
	}
	
	if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#myWinRecord_noData_tips").show();
	    	//toastUtils.showToast("没有数据");
	    	return;
	    }
		if (data.Data.DataCount !=0) {
			var btInfo = data.Data.BtInfo;
			isHasMorePage(btInfo,PAGESIZE_myWin);
			localStorageUtils.setParam("sourceFlag", "1");
		 	for (var i = 0; i < btInfo.length; i++) {
				var dataSet = btInfo[i];
				var scheme = {};
	                scheme.lotteryType=dataSet.BetTb;
	                scheme.orderId=dataSet.ChaseOrderID;
	                scheme.bettingorderID=dataSet.OrderID;
	                scheme.qiHao=dataSet.IssueNumber;
	                scheme.tzTime=dataSet.InsertTime;
	                scheme.spmoney=dataSet.AwardMoney;
	                scheme.state=dataSet.OrderState;
	                scheme.tzMoney=parseFloat(dataSet.BetMoney);
	                
	            var str = dataSet.BetTb.toString();
                if(str.length >= 3 && str.split("")[0] == "5"){
                	//彩种名称 盘口
                	scheme.lotteryName=hcp_LotteryInfo.getLotteryNameById(dataSet.BetTb.toString());
                }else{
                	scheme.lotteryName=LotteryInfo.getLotteryNameById(dataSet.BetTb.toString());
                }
                
                var str = dataSet.BetTb.toString();
                if(str.length >= 3 && str.split("")[0] == "5"){
                	//玩法名称 盘口
//	                	scheme.PlayName=hcp_LotteryInfo.getPlayMethodName(dataSet.BetTb + "", dataSet.PlayCode + "",dataSet.BetMode);
                	
                	var a = dataSet.BetTb.toString();
                	var b = dataSet.PlayCode.toString();
                	var playId = b.replace(a,"");
                	var tagArr = hcp_LotteryInfo.getLotteryTypeById(a).split("_")[1];
                	var PlayCodeArr = eval('hcp_playCode_' + tagArr);
                	for (var i = 0; i < PlayCodeArr.length; i++) {
                		if(($.inArray(playId,PlayCodeArr[i]["play_code"]) != -1 )){
                			scheme.PlayName = PlayCodeArr[i]["name"].split(" ")[0];
                		}
                	}
                }else{
                	scheme.PlayName=LotteryInfo.getPlayMethodName(dataSet.BetTb + "", dataSet.PlayCode + "",dataSet.BetMode);
                }
	                
				var $itemLi = $('<li></li>').data('scheme',scheme);
					$itemLi.on('click',function() {
						onItemClickListener();				
						localStorageUtils.setParam("scheme",JSON.stringify($(this).data('scheme')));
						setPanelBackPage_Fun('bettingOrderDetails');
					});
					$itemLi.append('<a class="recordList"><dl class="orderList"><dd>期号:&nbsp;' + dataSet.IssueNumber + '</dd><dd>中奖金额:&nbsp;<span class="red">' + dataSet.AwardMoney +'</span></dd><dd>彩种:&nbsp;'+scheme.lotteryName+'</dd><dd>时间:&nbsp;' + dataSet.InsertTime +'</dd></dl></a>');
	
				$("#myWinRecordList").append($itemLi);
			}
		}
	}else{
	    toastUtils.showToast(data.Msg);
	}
}


/**
*获取彩种
*/
function getLotteryType_myWinRecord(){
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAllMerchantInfo"}';
    ajaxUtil.ajaxByAsyncPost(null, params, searchAllSuccessCallBack_myWinRecord, '正在加载数据...');
}

/**
 *查询所售彩种回调函数
 */
function searchAllSuccessCallBack_myWinRecord(data) {
	if(data.Code == 200){
	    var Info = data.Data.LotteryList;
		if (data.Data.ErrorState == "0") {
			$("#searchLottery_winrecord").append('<option selected="selected" value="\'\'">全部彩种</option>');
			for (var i = 0; i < Info.length; i++) {
				if(1==Info[i].SaleState && Info[i].LotteryCode!=99 && LotteryId.hasOwnProperty(Info[i].LotteryCode)){
				/*if(Info[i].LotteryCode==12){
				$("#searchLottery_winrecord").append('<option value=' + Info[i].LotteryCode + ' selected="selected">' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode)+ '</option>');
				}else{*/
				$("#searchLottery_winrecord").append('<option value=' + Info[i].LotteryCode + '>' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode)+ '</option>');
				// }
			  }
			}
			lotteryType = $("#searchLottery_winrecord").val();
			//根据查询条件，查询数据
			loadBySearchItems_myWinRecord();
		}
	}else{
	    toastUtils.showToast(data.Msg);
	}

}
/**
 * 查询历史投注记录信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param lotteryType 彩种ID
 */
function searchBetting_myWinRecord(startDateTime, endDateTime, lotteryType) {
	  page=0;            
    var params = '{"InterfaceName":"/api/v1/netweb/GetWindList","ProjectPublic_PlatformCode":2,"LotteryCode":' + lotteryType + ',"IsHistory":' + IsHistory + ',"OrderState":16777216,"insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myWin + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createmyWinRecordList,null);
}

/**
 * 查询历史投注记录信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param lotteryType 彩种ID
 */
function searchBetting_WinRecord(startDateTime, endDateTime, lotteryType) {           
    var params = '{"InterfaceName":"/api/v1/netweb/GetWindList","ProjectPublic_PlatformCode":2,"LotteryCode":' + lotteryType + ',"IsHistory":' + IsHistory + ',"OrderState":16777216,"insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myWin + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createmyWinRecordList,null);
}
/**
 * 日期改变事件
 * [dateChange_myWinRecord description]
 * @return {[type]} [description]
 */
function dateChange_myWinRecord() {
	var selectedIndex = $("#searchDate_winrecord").val();
	switch(selectedIndex) {
		case "0":
			//当前记录
			$("#selectDateWin_Stt").val(initDefaultDate(0,'day'));  //View
			$("#selectDateWin_End").val(initDefaultDate(0,'day'));
			startDateTime = $("#selectDateWin_Stt").val()+hms00;
			endDateTime = $("#selectDateWin_End").val()+hms59;
			lotteryType = $("#searchLottery_winrecord").val();
			IsHistory=false;
			localStorageUtils.setParam("IsHistory",IsHistory);
			searchBetting_myWinRecord(startDateTime, endDateTime, lotteryType);
			changeDateRange_win(-3,"day",0,"day");   //Controller
			break;
		case "1":
			//历史记录
			$("#selectDateWin_Stt").val(initDefaultDate(-4,'day'));  //View
			$("#selectDateWin_End").val(initDefaultDate(-4,'day'));
			startDateTime = $("#selectDateWin_Stt").val()+hms00;
			endDateTime = $("#selectDateWin_End").val()+hms59;
			lotteryType = $("#searchLottery_winrecord").val();
			IsHistory=true;
			localStorageUtils.setParam("IsHistory",IsHistory);
			searchBetting_myWinRecord(startDateTime, endDateTime, lotteryType);
			changeDateRange_win(-33,"day",-4,"day");   //Controller
			break;
	}
}
/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_win(minNum,minType,maxNum,maxType){
	selectDateCC.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
	selectDateCD.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 * 彩种改变事件
 * [lotteryChange_myWinRecord description]
 * @return {[type]} [description]
 */
function lotteryChange_myWinRecord() {
	lotteryType = $("#searchLottery_winrecord").val();
	startDateTime = $("#selectDateWin_Stt").val()+hms00;
	endDateTime = $("#selectDateWin_End").val()+hms59;
	searchBetting_myWinRecord(startDateTime, endDateTime, lotteryType);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchItems_myWinRecord() {
	var conditionsWin = getSearchTerm();
	if (null != conditionsWin) {
		if(unloadAtBettingDetail == true){
			initWinRecordPage();
		}else{
		var dataOptions = document.getElementById('searchDate_winrecord').options;
		for (var i = 0; i < dataOptions.length; i++) {
			dataOptions[i].selected = false;
			if (dataOptions[i].value == conditionsWin.time) {
				dataOptions[i].selected = true;
			}
		}

		var typeOptions = document.getElementById('searchLottery_winrecord').options;
		for (var i = 0; i < typeOptions.length; i++) {
			typeOptions[i].selected = false;
			if (typeOptions[i].value == conditionsWin.type) {
				typeOptions[i].selected = true;
			}
		}
//		lotteryType = conditionsWin.type;
		if(!conditionsWin.type)lotteryType = 0;
		
		startDateTime = conditionsWin.dateStt+hms00;
		endDateTime = conditionsWin.dateEnd+hms59;
		$("#selectDateWin_Stt").val(conditionsWin.dateStt);
		$("#selectDateWin_End").val(conditionsWin.dateEnd);

		// 时间选择器
		var dateChange = conditionsWin.time;
		switch (dateChange){
			case "0":
				IsHistory=false;
				localStorageUtils.setParam("IsHistory",IsHistory);
				changeDateRange_win(-3,"day",0,"day");   //Controller
				break;
			case "1":
				IsHistory=true;
				localStorageUtils.setParam("IsHistory",IsHistory);
				changeDateRange_win(-33,"day",-4,"day");   //Controller
				break;
		}
		//根据查询条件查询数据
		searchBetting_myWinRecord(startDateTime, endDateTime, lotteryType);
		//重置isDetail标记，表示从记录界面返回
		var searchconditionsWin = getSearchTerm();
		searchconditionsWin.isDetail = false;
		saveSearchTerm(searchconditionsWin);
		}
	} else {
		initWinRecordPage();
	}
}

function initWinRecordPage(){
	IsHistory=false;
	localStorageUtils.setParam("IsHistory",IsHistory);
	$("#selectDateWin_Stt").val(initDefaultDate(0,"day"));
	$("#selectDateWin_End").val(initDefaultDate(0,"day"));
	//查询开始时间
	startDateTime = $("#selectDateWin_Stt").val()+hms00;
	//查询结束时间
	endDateTime = $("#selectDateWin_End").val()+hms59;

	searchBetting_myWinRecord(startDateTime, endDateTime, lotteryType);
}
/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener() {
	var searchconditionsWin = {};
	searchconditionsWin.time = $("#searchDate_winrecord").val();
	searchconditionsWin.type = $("#searchLottery_winrecord").val();
	searchconditionsWin.dateStt = $("#selectDateWin_Stt").val();
	searchconditionsWin.dateEnd = $("#selectDateWin_End").val();
	searchconditionsWin.isDetail = true;
	saveSearchTerm(searchconditionsWin);
}