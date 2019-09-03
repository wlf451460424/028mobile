//页大小
var PAGESIZE_ZH = 20;
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
var selectDateDD;
var selectDateDE;

/*进入panel时调用*/
function myZhuihaoRecordsLoadedPanel(){
	catchErrorFun("myZhuihaoRecordsInit();");
}
/*离开panel时调用*/
function myZhuihaoRecordsUnloadedPanel(){
	$("#myZhuihaoRecordsList").empty();
	$("#searchLottery_zhuihaoId").val("");
	//清除本地存储的查询条件
	clearSearchTerm();  
	 startDateTime = "";
	 endDateTime = "";
	 userName = "";
	 lotteryType =12;
	 IsHistory=false;	
	//清除本地存储的查询条件
	 clearSearchTerm();
	if(selectDateDD){
		selectDateDD.dismiss();
	}
	if(selectDateDE){
		selectDateDE.dismiss();
	}
}
function myZhuihaoRecordsInit(){
	$("#selectType_zhuiHao").empty();
	$("#myZhuihaoselectID").empty();
	var $select_zhuiHao=$('<select name="searchLottery" id="searchLottery_zhuihaoId" onchange="lotteryChange_zhuihao()"></select>');
	$("#selectType_zhuiHao").append($select_zhuiHao);

	var $select=$('<table><tr><td><select name="searchDate_zhuihaoId" id="searchDate_zhuihaoId" onchange="dateChange_zhuihao()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectDatezhuiHao_Stt"   readonly/></td><td><input type="text" id="selectDatezhuiHao_End" readonly/></td></tr></table>');
	$("#myZhuihaoselectID").append($select);

	selectDateDD = new MobileSelectDate();
	selectDateDD.init({trigger:'#selectDatezhuiHao_Stt',min:initDefaultDate(-368,"day"),max:initDefaultDate(0,"day")});
	selectDateDE = new MobileSelectDate();
	selectDateDE.init({trigger:'#selectDatezhuiHao_End',min:initDefaultDate(-368,"day"),max:initDefaultDate(0,"day")});

	userName = localStorageUtils.getParam("username");
    getLotteryType_zhuihao();  //获取彩种
	page = 0;
	hasMorePage = true;//默认还有分页
    var _myScroller =  $("#myZhuihaoRecordsScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
	_myScroller.clearInfinite();
    addUseScroller(_myScroller,'myZhuihaoRecordsList','getZhuihaoRecords()');
    //进入时加载
    // loadBySearchItems_zhuihao();

}


/********** 创建投注记录列表  **********/
function createZhuihaoRecordsList(data){
	$("#myZhuihaoRecords_noData_tips").hide();
	if (page == 0) {
		$("#myZhuihaoRecordsList").empty();
        $("#myZhuihaoRecordsScroller").scroller().scrollToTop();
        $("#myZhuihaoRecordsScroller").scroller().clearInfinite();		
	}
	
	if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#myZhuihaoRecords_noData_tips").show();
	    	//toastUtils.showToast("没有数据");
	    	return;
	    }
		if (data.Data.DataCount !=0) {
			var btInfo = data.Data.BtnInfo;
			isHasMorePage(btInfo,PAGESIZE_ZH);
			for (var i = 0; i < btInfo.length; i++) {		
				var dataSet = new Object();
				//订单号
				dataSet.orderId = btInfo[i].OrderID;
				//彩种ID
				dataSet.lotteryType = btInfo[i].BetTb;
				//期号
				dataSet.qiHao = btInfo[i].CountQS;
				//剩余期数
				dataSet.countSY = btInfo[i].CountSY;
				//交易时间
				dataSet.tzTime = btInfo[i].InsertTime;
				//中奖金额
				dataSet.spmoney =parseFloat(btInfo[i].SumAwardMoney);
				//中奖状态
				dataSet.state = btInfo[i].OrderState;
				//投注金额
				dataSet.tzMoney =btInfo[i].SumBetMoney;//changeTwoDecimal_f(info[i].SumBetMoney);
				//总中奖金额
				dataSet.sumAwardMoney =btInfo[i].SumAwardMoney;//changeTwoDecimal_f(info[i].SumAwardMoney);
	
				var $itemLi = $('<li></li>').data('zhuihao',dataSet);
					$itemLi.on('click',function() {
						onItemClickListener_zhuihao();				
						localStorageUtils.setParam("zhuihao",JSON.stringify($(this).data('zhuihao')));
						setPanelBackPage_Fun('zhuiHaoBettingOrderDetails');
					});
					$itemLi.append('<a class="recordList"><dl class="orderList"><dd>总期数:&nbsp;' + dataSet.qiHao + '</dd><dd>投注金额:&nbsp;<span class="red">' + dataSet.tzMoney +'元</span></dd><dd>彩种:&nbsp;'+LotteryInfo.getLotteryNameById(dataSet.lotteryType)+'</dd><dd>时间:&nbsp;' + dataSet.tzTime +'</dd></dl></a>');
	
				$("#myZhuihaoRecordsList").append($itemLi);
			}
		}
	}else{
	    toastUtils.showToast(data.Msg);
	}
}


/**
*获取彩种
*/
function getLotteryType_zhuihao(){
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAllMerchantInfo"}';
    ajaxUtil.ajaxByAsyncPost(null, params, searchAllSuccessCallBack_zhuihao, '正在加载数据...');
}
function getZhuihaoRecords(){
	startDateTime = $("#selectDatezhuiHao_Stt").val()+hms00;
	endDateTime = $("#selectDatezhuiHao_End").val()+hms59;
   searchZhuihao_zhuihao(startDateTime, endDateTime, lotteryType);
}
/**
 *查询所售彩种回调函数
 */
function searchAllSuccessCallBack_zhuihao(data) {
	if(data.Code == 200){
	    var Info = data.Data.LotteryList;
		if (data.Data.ErrorState == "0") {
			$("#searchLottery_zhuihaoId").append('<option selected="selected" value="\'\'">全部彩种</option>');
			for (var i = 0; i < Info.length; i++) {
				if(1==Info[i].SaleState && Info[i].LotteryCode!=99 && LotteryId.hasOwnProperty(Info[i].LotteryCode)){
				/*if(Info[i].LotteryCode==12){
				$("#searchLottery_zhuihaoId").append('<option value=' + Info[i].LotteryCode + ' selected="selected">' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode)+ '</option>');
				}else{*/
				$("#searchLottery_zhuihaoId").append('<option value=' + Info[i].LotteryCode + '>' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode)+ '</option>');
				// }
			  }
			}
			lotteryType = $("#searchLottery_zhuihaoId").val();
			//根据查询条件，查询数据
			loadBySearchItems_zhuihao();
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
function searchZhuihao(startDateTime, endDateTime, lotteryType) {
	page=0;
    var params = '{"InterfaceName":"/api/v1/netweb/GetChaseList","ProjectPublic_PlatformCode":2,"LotteryCode":' + lotteryType + ',"IsHistory":' + IsHistory + ',"statTime":"' + startDateTime + '","endTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_ZH + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createZhuihaoRecordsList,null);
}
/**
 * 查询历史投注记录信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param lotteryType 彩种ID
 */
function searchZhuihao_zhuihao(startDateTime, endDateTime, lotteryType) {
    var params = '{"InterfaceName":"/api/v1/netweb/GetChaseList","ProjectPublic_PlatformCode":2,"LotteryCode":' + lotteryType + ',"IsHistory":' + IsHistory + ',"statTime":"' + startDateTime + '","endTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_ZH + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createZhuihaoRecordsList,null);
}
/**
 * 日期改变事件
 * [dateChange description]
 * @return {[type]} [description]
 */
function dateChange_zhuihao() {
	var selectedIndex = $("#searchDate_zhuihaoId").val();
	switch(selectedIndex) {
		case "0":
			//当前记录
			$("#selectDatezhuiHao_Stt").val(initDefaultDate(0,'day'));  //View
			$("#selectDatezhuiHao_End").val(initDefaultDate(0,'day'));
			startDateTime = $("#selectDatezhuiHao_Stt").val()+hms00;
			endDateTime = $("#selectDatezhuiHao_End").val()+hms59;
			lotteryType = $("#searchLottery_zhuihaoId").val();
			IsHistory=false;
			localStorageUtils.setParam("IsHistory",IsHistory);
			searchZhuihao(startDateTime, endDateTime, lotteryType);
			changeDateRange_zhuiHao(-368,"day",0,"day");   //Controller
			break;
		case "1":
			//历史记录
			$("#selectDatezhuiHao_Stt").val(initDefaultDate(-4,'day'));  //View
			$("#selectDatezhuiHao_End").val(initDefaultDate(-4,'day'));
			startDateTime = $("#selectDatezhuiHao_Stt").val()+hms00;
			endDateTime = $("#selectDatezhuiHao_End").val()+hms59;
			lotteryType = $("#searchLottery_zhuihaoId").val();
			IsHistory=true;
			localStorageUtils.setParam("IsHistory",IsHistory);
			searchZhuihao(startDateTime, endDateTime, lotteryType);
			changeDateRange_zhuiHao(-DayRange_1month3day,"day",-4,"day");   //Controller
			break;
	}
}
/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_zhuiHao(minNum,minType,maxNum,maxType){
	selectDateDD.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
	selectDateDE.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 * 彩种改变事件
 * [lotteryChange_zhuihao description]
 * @return {[type]} [description]
 */
function lotteryChange_zhuihao() {
	lotteryType = $("#searchLottery_zhuihaoId").val();
	startDateTime = $("#selectDatezhuiHao_Stt").val()+hms00;
	endDateTime = $("#selectDatezhuiHao_End").val()+hms59;
	searchZhuihao(startDateTime, endDateTime, lotteryType);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchItems_zhuihao() {
	var conditionsZhuihao = getSearchTerm();
	if (null != conditionsZhuihao) {
		if(unloadAtBettingDetail == true){
				initZhuihaoPage();
		}else {
			var dataOptions = document.getElementById('searchDate_zhuihaoId').options;
			for (var i = 0; i < dataOptions.length; i++) {
				dataOptions[i].selected = false;
				if (dataOptions[i].value == conditionsZhuihao.time) {
					dataOptions[i].selected = true;
				}
			}
			var typeOptions = document.getElementById('searchLottery_zhuihaoId').options;
			for (var i = 0; i < typeOptions.length; i++) {
				typeOptions[i].selected = false;
				if (typeOptions[i].value == conditionsZhuihao.type) {
					typeOptions[i].selected = true;
				}
				}
			lotteryType = conditionsZhuihao.type;
			if(!conditionsZhuihao.type)lotteryType = 0;
			
			startDateTime = conditionsZhuihao.dateStt+hms00;
			endDateTime = conditionsZhuihao.dateEnd+hms59;
			$("#selectDatezhuiHao_Stt").val(conditionsZhuihao.dateStt);
			$("#selectDatezhuiHao_End").val(conditionsZhuihao.dateEnd);

			// 时间选择器
			var dateChange = conditionsZhuihao.time;
			switch (dateChange){
				case "0":
					IsHistory=false;
					localStorageUtils.setParam("IsHistory",IsHistory);
					changeDateRange_zhuiHao(-368,"day",0,"day");   //Controller
					break;
				case "1":
					IsHistory=true;
					localStorageUtils.setParam("IsHistory",IsHistory);
					changeDateRange_zhuiHao(-DayRange_1month3day,"day",-4,"day");   //Controller
					break;
			}
			//根据查询条件查询数据
			searchZhuihao(startDateTime, endDateTime, lotteryType);
			//重置isDetail标记，表示从记录界面返回
			var searchconditionsZhuihao = getSearchTerm();
			searchconditionsZhuihao.isDetail = false;
			saveSearchTerm(searchconditionsZhuihao);
		}
	}else{
		initZhuihaoPage();
	}
}

/*
** 当从个人中心进入或者追号详单页直接跳到首页再进入时要初始化数据
* */
function initZhuihaoPage(){
	IsHistory=false;
	localStorageUtils.setParam("IsHistory",IsHistory);
	$("#selectDatezhuiHao_Stt").val(initDefaultDate(0,"day"));
	$("#selectDatezhuiHao_End").val(initDefaultDate(0,"day"));
	//查询开始时间
	startDateTime = $("#selectDatezhuiHao_Stt").val() + hms00;
	//查询结束时间
	endDateTime = $("#selectDatezhuiHao_End").val() + hms59;
	// lotteryType =12;
	searchZhuihao(startDateTime, endDateTime, lotteryType);
}
/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_zhuihao() {
	var searchconditionsZhuihao = {};
	searchconditionsZhuihao.time = $("#searchDate_zhuihaoId").val();
	searchconditionsZhuihao.type = $("#searchLottery_zhuihaoId").val();
	searchconditionsZhuihao.dateStt = $("#selectDatezhuiHao_Stt").val();
	searchconditionsZhuihao.dateEnd = $("#selectDatezhuiHao_End").val();
	searchconditionsZhuihao.isDetail = true;
	saveSearchTerm(searchconditionsZhuihao);
}