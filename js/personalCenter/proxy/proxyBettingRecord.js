//页大小
var PAGESIZE_proxyBetting = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
  //代理用户名
var thisUserName = "";
  //代理用户ID
var thisUserID = "";
//彩种ID
var lotteryType ='""';
//IsHistory 默认false  是否是历史记录
var IsHistory=false;

var selDatePBRStart;
var selDatePBREnd;

/*进入panel时调用*/
function proxyBettingRecordLoadedPanel(){
	catchErrorFun("proxyBettingRecordInit();");
}
/*离开panel时调用*/
function proxyBettingRecordUnloadedPanel(){
	$("#proxyBettingRecordList").empty();
	//清除本地存储的查询条件
	// clearSearchTerm("sub");
    startDateTime = "";
    endDateTime = "";
    if(selDatePBRStart){
        selDatePBRStart.dismiss();
    }
    if(selDatePBREnd){
        selDatePBREnd.dismiss();
    }
}
function proxyBettingRecordInit(){
    $("#selectType_proxyBetting").empty();

    var $selectType_proxyBetting = $('<select name="proxyBettingSearchType" id="proxyBettingSearchType" data-theme="a" data-mini="true" onchange="lotteryChange_proxy()"></select>');
    $("#selectType_proxyBetting").append($selectType_proxyBetting);

	$("#selectproxyBettingRecordID").empty();

    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td><select name="proxyBettingSearchDate" id="proxyBettingSearchDate" data-theme="a" data-mini="true" onchange="dateChangeProxyBetting()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selDateProxyBetting_Stt" readonly/></td><td><input type="text" id="selDateProxyBetting_End" readonly/></td></tr></table>');
    $("#selectproxyBettingRecordID").append($select);
	//查询开始时间
    selDatePBRStart = new MobileSelectDate();
    selDatePBRStart.init({trigger:'#selDateProxyBetting_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selDatePBREnd = new MobileSelectDate();
    selDatePBREnd.init({trigger:'#selDateProxyBetting_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

    userName = localStorageUtils.getParam("username");
	thisUserName = localStorageUtils.getParam("proxyUserName");
	thisUserID = localStorageUtils.getParam("proxyUserId");
	page = 0;
	lotteryType ='""';
    //进入时加载
    getLotteryType_proxy();	
	hasMorePage = true;//默认还有分页
    var _myScroller =  $("#proxyBettingRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
	_myScroller.clearInfinite();
    addUseScroller(_myScroller,'proxyBettingRecordList','getBettingRecords_proxy()');
}
/********** 查询投注记录  **********/
function getBettingRecords_proxy(){
    startDateTime = $("#selDateProxyBetting_Stt").val()+hms00;
    endDateTime = $("#selDateProxyBetting_End").val()+hms59;
  	nextPage_searchBetting_proxy(startDateTime, endDateTime, lotteryType);
}
/********** 创建投注记录列表  **********/
function createBettingRecordsList_proxy(data){
	if (page == 0) {
		$("#proxyBettingRecordList").empty();
        $("#proxyBettingRecordScroller").scroller().scrollToTop();
        $("#proxyBettingRecordScroller").scroller().clearInfinite();				
	}
	
	if(data.Code == 200){
	    if(data.Data ==null){
	    	toastUtils.showToast("没有数据");
	    	return;
	    }
		if (data.Data.DataCount !=0) {
			var btInfo = data.Data.BtInfo;
			localStorageUtils.setParam("sourceFlag", "1");
			isHasMorePage(btInfo,PAGESIZE_proxyBetting);
		 	for (var i = 0; i < btInfo.length; i++) {
		 		var dataSet = new Object();
					//彩种ID
					dataSet.lotteryType = btInfo[i].BetTb;
					//玩法id
					dataSet.PlayCode = btInfo[i].PlayCode;
					//订单号
					dataSet.orderId = btInfo[i].ChaseOrderID;
					//流水号
					dataSet.bettingorderID = btInfo[i].OrderID;
					//期号
					dataSet.qiHao = btInfo[i].IssueNumber;
					//交易时间
					dataSet.tzTime = btInfo[i].InsertTime;
					//中奖金额
					dataSet.spmoney = btInfo[i].AwardMoney;
					//中奖状态
					dataSet.state = btInfo[i].OrderState;
					//投注金额
					dataSet.tzMoney = parseFloat(btInfo[i].BetMoney);
					//模式
					dataSet.BetMode = btInfo[i].BetMode;
					
					var str = dataSet.lotteryType.toString();
	        if(str.length >= 3 && str.split("")[0] == "5"){
	        	//彩种名称 盘口
	        	dataSet.lotteryName=hcp_LotteryInfo.getLotteryNameById(dataSet.lotteryType.toString());
	        }else{
	        	dataSet.lotteryName=LotteryInfo.getLotteryNameById(dataSet.lotteryType.toString());
	        }
	        
	        var str = dataSet.lotteryType.toString();
	        if(str.length >= 3 && str.split("")[0] == "5"){
	        	//玩法名称 盘口
	//	                	scheme.PlayName=hcp_LotteryInfo.getPlayMethodName(dataSet.BetTb + "", dataSet.PlayCode + "",dataSet.BetMode);
	        	
	        	var a = dataSet.lotteryType.toString();
	        	var b = dataSet.PlayCode.toString();
	        	var playId = b.replace(a,"");
	        	var tagArr = hcp_LotteryInfo.getLotteryTypeById(a).split("_")[1];
	        	var PlayCodeArr = eval('hcp_playCode_' + tagArr);
	        	for (var K = 0; K < PlayCodeArr.length; K++) {
	        		if(($.inArray(playId,PlayCodeArr[K]["play_code"]) != -1 )){
	        			dataSet.PlayName = PlayCodeArr[K]["name"].split(" ")[0];
	        		}
	        	}
	        }else{
	        	dataSet.PlayName=LotteryInfo.getPlayMethodName(dataSet.lotteryType + "", dataSet.PlayCode + "",dataSet.BetMode);
	        }
                
				var $itemLi = $('<li></li>').data('proxyscheme',dataSet);
					$itemLi.on('click',function() {
						onItemClickListener_proxybetting();				
						localStorageUtils.setParam("proxyscheme",JSON.stringify($(this).data('proxyscheme')));
						setPanelBackPage_Fun('proxyBettingDetails');
					});
					$itemLi.append('<a class="recordList"><dl class="orderList"><dd>期号:&nbsp;' + dataSet.qiHao + '</dd><dd>投注金额:&nbsp;<span class="red">' + dataSet.tzMoney +'元</span></dd><dd>彩种:&nbsp;'+dataSet.lotteryName+'</dd><dd>时间:&nbsp;' + dataSet.tzTime +'</dd></dl></a>');
	
				$("#proxyBettingRecordList").append($itemLi);
			}
		}
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

/**
*获取彩种
*/
function getLotteryType_proxy(){
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAllMerchantInfo"}';
    ajaxUtil.ajaxByAsyncPost(null, params, searchAllSuccessCallBack_proxy, '正在加载数据...');
}

/**
 *查询所售彩种回调函数
 */
function searchAllSuccessCallBack_proxy(data) {
	if(data.Code == 200){
	    var Info = data.Data.LotteryList;
		$("#proxyBettingSearchType").empty();
		if (data.Data.ErrorState == "0") {
			$("#proxyBettingSearchType").append('<option selected="selected" value="\'\'">全部彩种</option>');
			for (var i = 0; i < Info.length; i++) {
				
				var str = Info[i].LotteryCode.toString();
//      if(str.length >= 3 && str.split("")[0] == "5"){
//      	// 盘口
//      	if(1==Info[i].SaleState && Info[i].LotteryCode!=99 && hcp_LotteryId.hasOwnProperty(Info[i].LotteryCode)){
//              $("#proxyBettingSearchType").append('<option id='+i+' value=' + Info[i].LotteryCode + '>' + hcp_LotteryInfo.getLotteryNameById(Info[i].LotteryCode) + '</option>');
//          }
//      }else{
        	if(1==Info[i].SaleState && Info[i].LotteryCode!=99 && LotteryId.hasOwnProperty(Info[i].LotteryCode)){
                $("#proxyBettingSearchType").append('<option id='+i+' value=' + Info[i].LotteryCode + '>' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode) + '</option>');
            }
//      }
			}
			lotteryType =  $("#proxyBettingSearchType").val();
			//根据查询条件，查询数据
			loadBySearchItems_proxy();
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
function nextPage_searchBetting_proxy(startDateTime, endDateTime, lotteryType) {
    var params = '{"InterfaceName":"/api/v1/netweb/GetBetDataListFlex","SourceCode":1,"ProjectPublic_PlatformCode":2,"IsHistory":' + IsHistory + ',"ThisUserName":"' + thisUserName + '","UserID":' + thisUserID + ',"LotteryCode":' + lotteryType + ',"insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_proxyBetting + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createBettingRecordsList_proxy,null);
}

/**
 * 查询历史投注记录信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param lotteryType 彩种ID
 */
function searchBetting_proxy(startDateTime, endDateTime, lotteryType) {
	page=0;
    var params = '{"InterfaceName":"/api/v1/netweb/GetBetDataListFlex","SourceCode":1,"ProjectPublic_PlatformCode":2,"IsHistory":' + IsHistory + ',"ThisUserName":"' + thisUserName + '","UserID":' + thisUserID + ',"LotteryCode":' + lotteryType + ',"insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_proxyBetting + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createBettingRecordsList_proxy,null);
}
/**
 * 日期改变事件
 * [dateChangeProxyBetting description]
 * @return {[type]} [description]
 */
function dateChangeProxyBetting() {
    page = 0;
    var selectedIndex = $("#proxyBettingSearchDate").val();
    switch(selectedIndex) {
        case "0":
            //当前记录
            $("#selDateProxyBetting_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selDateProxyBetting_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selDateProxyBetting_Stt").val()+hms00;
            endDateTime = $("#selDateProxyBetting_End").val()+hms59;
            lotteryType = $("#proxyBettingSearchType").val();
            IsHistory=false;
            localStorageUtils.setParam("IsHistory",IsHistory);
            searchBetting_proxy(startDateTime, endDateTime, lotteryType);
            changeDateRange_proxyBetting(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selDateProxyBetting_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selDateProxyBetting_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selDateProxyBetting_Stt").val()+hms00;
            endDateTime = $("#selDateProxyBetting_End").val()+hms59;
            lotteryType = $("#proxyBettingSearchType").val();
            IsHistory=true;
            localStorageUtils.setParam("IsHistory",IsHistory);
            searchBetting_proxy(startDateTime, endDateTime, lotteryType);
            changeDateRange_proxyBetting(-33,"day",-4,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_proxyBetting(minNum,minType,maxNum,maxType){
    selDatePBRStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDatePBREnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 * 彩种改变事件
 * [lotteryChange_proxy description]
 * @return {[type]} [description]
 */
function lotteryChange_proxy() {
    page = 0;
    lotteryType = $("#proxyBettingSearchType").val();
    startDateTime = $("#selDateProxyBetting_Stt").val()+hms00;
    endDateTime = $("#selDateProxyBetting_End").val()+hms59;
    searchBetting_proxy(startDateTime, endDateTime, lotteryType);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchItems_proxy() {
	var conditions = getSearchTerm("sub");
	if (null != conditions) {
		var dataOptions = document.getElementById('proxyBettingSearchDate').options;
		for (var i = 0; i < dataOptions.length; i++) {
			dataOptions[i].selected = false;
			if (dataOptions[i].value == conditions.time) {
				dataOptions[i].selected = true;
			}
		}

		var typeOptions = document.getElementById('proxyBettingSearchType').options;
		for (var i = 0; i < typeOptions.length; i++) {
			typeOptions[i].selected = false;
			if (typeOptions[i].value == conditions.type) {
				typeOptions[i].selected = true;
			}
		}
		lotteryType = $("#proxyBettingSearchType").val();
		//根据查询条件查询数据
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#selDateProxyBetting_Stt").val(conditions.dateStt);
        $("#selDateProxyBetting_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                IsHistory=false;
                localStorageUtils.setParam("IsHistory",IsHistory);
                changeDateRange_proxyBetting(-3,"day",0,"day");   //Controller
                break;
            case "1":
                IsHistory=true;
                localStorageUtils.setParam("IsHistory",IsHistory);
                changeDateRange_proxyBetting(-33,"day",-4,"day");   //Controller
                break;
        }
        searchBetting_proxy(startDateTime, endDateTime, lotteryType);
		//重置isDetail标记，表示从记录界面返回
		var searchConditions = getSearchTerm("sub");
		searchConditions.isDetail = false;
		saveSearchTerm(searchConditions,"sub");
	} else {
        initProxyBettingRecordsPage();
	}
}
//初始化页面
function initProxyBettingRecordsPage() {
    IsHistory=false;
    localStorageUtils.setParam("IsHistory",IsHistory);
    lotteryType='""';
    $("#selDateProxyBetting_Stt").val(initDefaultDate(0,"day"));
    $("#selDateProxyBetting_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selDateProxyBetting_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selDateProxyBetting_End").val()+hms59;
    searchBetting_proxy(startDateTime, endDateTime, lotteryType);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_proxybetting() {
	var searchConditions = {};
	searchConditions.time = $("#proxyBettingSearchDate").val();
	searchConditions.type = $("#proxyBettingSearchType").val();
	searchConditions.dateStt = $("#selDateProxyBetting_Stt").val();
	searchConditions.dateEnd = $("#selDateProxyBetting_End").val();
	searchConditions.isDetail = true;
	saveSearchTerm(searchConditions,"sub");
}