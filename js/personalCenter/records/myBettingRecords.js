
//页大小
var PAGESIZE_myBetting = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//彩种ID
var lotteryType ='""';
//IsHistory 默认false  是否是历史记录
var IsHistory=false;
var selectDateBB;
var selectDateBC;
/*进入panel时调用*/
function myBettingRecordsLoadedPanel(){
	catchErrorFun("myBettingRecordsInit();");
}
/*离开panel时调用*/
function myBettingRecordsUnloadedPanel(){
	$("#myBettingRecordsList").empty();
	$("#searchLottery_bettId").val("");
	//清除本地存储的查询条件
	clearSearchTerm(); 
    startDateTime = "";
    endDateTime = "";
    IsHistory=false;
	lotteryType ='""';
	//清除本地存储的查询条件
	 clearSearchTerm();
	if(selectDateBB){
		selectDateBB.dismiss();
	}
	if(selectDateBC){
		selectDateBC.dismiss();
	}
}

function myBettingRecordsInit(){
	$("#selectType_myBetting").empty();
	$("#selectID").empty();
	var $selectType_myBetting=('<select name="searchLottery" id="searchLottery_bettId" onchange="lotteryChange_mybetting()"></select>');
	$("#selectType_myBetting").append($selectType_myBetting);

	var $select=$('<table><tr><td><select name="searchDate" id="searchDate" onchange="dateChange_mybetting()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectDateMyBetting_Stt" readonly/></td><td><input type="text" id="selectDateMyBetting_End" readonly/></td></tr></table>');
	$("#selectID").append($select);

	selectDateBB = new MobileSelectDate();
	selectDateBB.init({trigger:'#selectDateMyBetting_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
	selectDateBC = new MobileSelectDate();
	selectDateBC.init({trigger:'#selectDateMyBetting_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

	userName = localStorageUtils.getParam("username");
	//进入时加载
    getLotteryType();
	page = 0;
	hasMorePage = true;//默认还有分页
    var _myScroller =  $("#myBettingRecordsScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
	_myScroller.clearInfinite();
    addUseScroller(_myScroller,'myBettingRecordsList','getBettingRecords()');
}

/********** 查询投注记录  **********/
function getBettingRecords(){
	startDateTime = $("#selectDateMyBetting_Stt").val()+hms00;
	endDateTime = $("#selectDateMyBetting_End").val()+hms59;
  	nextPage_Betting(startDateTime, endDateTime, lotteryType);
}

/********** 创建投注记录列表  **********/
function createBettingRecordsList(data){
	$("#myBettingRecords_noData_tips").hide();
	if (page == 0) {
		$("#myBettingRecordsList").empty();
        $("#myBettingRecordsScroller").scroller().scrollToTop();
        $("#myBettingRecordsScroller").scroller().clearInfinite();		
	}
	if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#myBettingRecords_noData_tips").show();
	    	//toastUtils.showToast("没有数据");
	    	return;
	    }
		if (data.Data.DataCount !=0) {
			var btInfo = data.Data.BtInfo;
			localStorageUtils.setParam("sourceFlag", "1");
			isHasMorePage(btInfo,PAGESIZE_myBetting);
		 	for (var i = 0; i < btInfo.length; i++) {
				var dataSet = btInfo[i];
				var scheme = {};
	                scheme.lotteryType=dataSet.BetTb;
	                scheme.playType=dataSet.PlayCode;
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
						onItemClickListener_betting();				
						localStorageUtils.setParam("scheme",JSON.stringify($(this).data('scheme')));
						setPanelBackPage_Fun('bettingOrderDetails');
					});
					$itemLi.append('<a class="recordList"><dl class="orderList"><dd>期号:&nbsp;' + dataSet.IssueNumber + '</dd><dd>投注金额:&nbsp;<span class="red">' + dataSet.BetMoney +'元</span></dd><dd>彩种:&nbsp;'+scheme.lotteryName+'</dd><dd>时间:&nbsp;' + dataSet.InsertTime +'</dd></dl></a>');
	
				$("#myBettingRecordsList").append($itemLi);
			}
		}
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

/**
*获取彩种
*/
function getLotteryType(){
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAllMerchantInfo"}';
    ajaxUtil.ajaxByAsyncPost(null, params, searchAllSuccessCallBack, '正在加载数据...');
}

/**
 *查询所售彩种回调函数
 */
function searchAllSuccessCallBack(data) {
	if(data.Code == 200){
	    var Info = data.Data.LotteryList;
		if (data.Data.ErrorState == "0") {
			$("#searchLottery_bettId").append('<option selected="selected" value="\'\'">全部彩种</option>');
			for (var i = 0; i < Info.length; i++) {
				if(1==Info[i].SaleState && Info[i].LotteryCode!=99 && LotteryId.hasOwnProperty(Info[i].LotteryCode)){
				// if(Info[i].LotteryCode==12){
				$("#searchLottery_bettId").append('<option id='+i+' value=' + Info[i].LotteryCode + '>' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode) + '</option>');
				/*}else{
				$("#searchLottery_bettId").append('<option id='+i+' value=' + Info[i].LotteryCode + '>' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode) + '</option>');
				}*/
			  }
			}
			lotteryType = $("#searchLottery_bettId").val();
			//根据查询条件，查询数据
			loadBySearchItems();
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
function nextPage_Betting(startDateTime, endDateTime, lotteryType) {
    var params = '{"InterfaceName":"/api/v1/netweb/GetBetDataListFlex","SourceCode":1,"ProjectPublic_PlatformCode":2,"LotteryCode":' + lotteryType + ',"IsHistory":' + IsHistory + ',"insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myBetting + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createBettingRecordsList,null);
}

/**
 * 查询历史投注记录信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param lotteryType 彩种ID
 */
function searchBetting(startDateTime, endDateTime, lotteryType) {
	page=0;
    var params = '{"InterfaceName":"/api/v1/netweb/GetBetDataListFlex","SourceCode":1,"ProjectPublic_PlatformCode":2,"LotteryCode":' + lotteryType + ',"IsHistory":' + IsHistory + ',"insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myBetting + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createBettingRecordsList,null);
}
/**
 * 日期改变事件
 * [dateChange_mybetting description]
 * @return {[type]} [description]
 */
function dateChange_mybetting() {
	var selectedIndex = $("#searchDate").val();
	switch(selectedIndex) {
		case "0":
			//当前记录
			$("#selectDateMyBetting_Stt").val(initDefaultDate(0,'day'));  //View
			$("#selectDateMyBetting_End").val(initDefaultDate(0,'day'));
			startDateTime = $("#selectDateMyBetting_Stt").val()+hms00;
			endDateTime = $("#selectDateMyBetting_End").val()+hms59;
			type = $("#searchLottery_bettId").val();
			IsHistory=false;
			localStorageUtils.setParam("IsHistory",IsHistory);
			searchBetting(startDateTime, endDateTime, type);
			changeDateRange_Betting(-3,"day",0,"day");   //Controller
			break;
		case "1":
			//历史记录
			$("#selectDateMyBetting_Stt").val(initDefaultDate(-4,'day'));  //view
			$("#selectDateMyBetting_End").val(initDefaultDate(-4,'day'));
			startDateTime = $("#selectDateMyBetting_Stt").val()+hms00;
			endDateTime = $("#selectDateMyBetting_End").val()+hms59;
			type = $("#searchLottery_bettId").val();
			IsHistory=true;
			localStorageUtils.setParam("IsHistory",IsHistory);
			searchBetting(startDateTime, endDateTime, type);
			changeDateRange_Betting(-33,"day",-4,"day");     //Controller
			break;
	}
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_Betting(minNum,minType,maxNum,maxType){
	selectDateBB.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
	selectDateBC.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 * 彩种改变事件
 * [lotteryChange_mybetting description]
 * @return {[type]} [description]
 */
function lotteryChange_mybetting() {
	lotteryType = $("#searchLottery_bettId").val();
	startDateTime = $("#selectDateMyBetting_Stt").val()+hms00;
	endDateTime = $("#selectDateMyBetting_End").val()+hms59;
	searchBetting(startDateTime, endDateTime, lotteryType);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchItems() {
	var conditionsBetting = getSearchTerm();
	if (null != conditionsBetting) {
		if(unloadAtBettingDetail==true){
				initBettingRecordsPage();
		}else{
			var dataOptions = document.getElementById('searchDate').options;
			for (var i = 0; i < dataOptions.length; i++) {
				dataOptions[i].selected = false;
				if (dataOptions[i].value == conditionsBetting.time) {
					dataOptions[i].selected = true;
				}
			}

			var typeOptions = document.getElementById('searchLottery_bettId').options;
			for (var i = 0; i < typeOptions.length; i++) {
				typeOptions[i].selected = false;
				if (typeOptions[i].value == conditionsBetting.type) {
					typeOptions[i].selected = true;
				}
			}
			lotteryType = conditionsBetting.type;
			if(!conditionsBetting.type)lotteryType = "";
			
			startDateTime = conditionsBetting.dateStt+hms00;
			endDateTime = conditionsBetting.dateEnd+hms59;
			$("#selectDateMyBetting_Stt").val(conditionsBetting.dateStt);
			$("#selectDateMyBetting_End").val(conditionsBetting.dateEnd);

			// 时间选择器
			var dateChange = conditionsBetting.time;
			switch (dateChange){
				case "0":
					IsHistory=false;
					localStorageUtils.setParam("IsHistory",IsHistory);
					changeDateRange_Betting(-3,"day",0,"day");   //Controller
					break;
				case "1":
					IsHistory=true;
					localStorageUtils.setParam("IsHistory",IsHistory);
					changeDateRange_Betting(-33,"day",-4,"day");   //Controller
					break;
			}
			//根据日期查询条件查询数据
			searchBetting(startDateTime, endDateTime, lotteryType);
			//重置isDetail标记，表示从记录界面返回
			var searchconditionsBetting = getSearchTerm();
			searchconditionsBetting.isDetail = false;
			saveSearchTerm(searchconditionsBetting);
		}
	} else {
		initBettingRecordsPage();
	}
}

function initBettingRecordsPage() {
	IsHistory=false;
	localStorageUtils.setParam("IsHistory",IsHistory);
	$("#selectDateMyBetting_Stt").val(initDefaultDate(0,"day"));
	$("#selectDateMyBetting_End").val(initDefaultDate(0,"day"));
	//查询开始时间
	startDateTime = $("#selectDateMyBetting_Stt").val()+hms00;
	//查询结束时间
	endDateTime = $("#selectDateMyBetting_End").val()+hms59;
	lotteryType = '""';
	searchBetting(startDateTime, endDateTime, lotteryType);
}

/**
 * 列表里每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_betting() {
	var searchconditionsBetting = {};
	searchconditionsBetting.time = $("#searchDate").val();
	searchconditionsBetting.type = $("#searchLottery_bettId").val();
	searchconditionsBetting.dateStt = $("#selectDateMyBetting_Stt").val();
	searchconditionsBetting.dateEnd = $("#selectDateMyBetting_End").val();
	searchconditionsBetting.isDetail = true;
	saveSearchTerm(searchconditionsBetting);
}