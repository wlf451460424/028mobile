//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var page=0;
var PAGESIZE_myPeport=30;

var selDateMRStart;
var selDateMREnd;

/*进入panel时调用*/
function myReportRecordsLoadedPanel(){
	catchErrorFun("myReportRecordsInit();");
}
/*离开panel时调用*/
function myReportRecordsUnloadedPanel(){
    clearSearchTerm();      
    startDateTime = "";
    endDateTime = ""; 
    $("#myReportDate").empty();
    $("#myReportContent").empty();
    if(selDateMRStart){
        selDateMRStart.dismiss();
    }
    if(selDateMREnd){
        selDateMREnd.dismiss();
    }
}

function myReportRecordsInit(){
    $("#selectType_myReport").empty();

    var $selectType_myReport = $('<select name="myReportSearchType" id="myReportSearchType" data-theme="a" data-mini="true" onchange="myReportTypeChange()"><option value="0" selected="selected">类型：每日统计</option><option value="1">类型：汇总统计</option></select>');
    $("#selectType_myReport").append($selectType_myReport);

    $("#myReportContent").empty();

    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td><select name="myReportSearchDate" id="myReportSearchDate" data-theme="a" data-mini="true" onchange="dateChangeMyReport()"><option value="0" selected="selected">当天记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectDateMyReport_Stt" readonly/></td><td><input type="text" id="selectDateMyReport_End" readonly/></td></tr></table>');
    $("#myReportDate").append($select);

	//查询开始时间
    selDateMRStart = new MobileSelectDate();
    selDateMRStart.init({trigger:'#selectDateMyReport_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateMREnd = new MobileSelectDate();
    selDateMREnd.init({trigger:'#selectDateMyReport_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#selectDateMyReport_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateMyReport_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateMyReport_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateMyReport_End").val()+hms59;

	page = 0;
	hasMorePage = true;//默认还有分页
	var myScroller_report = $("#myReportScroller").scroller({
		verticalScroll : true,
		horizontalScroll : false,
		vScrollCSS: "afScrollbar",
		autoEnable : true
	});
	myScroller_report.scrollToTop();
	myScroller_report.clearInfinite();
	UseScrollerRefresh(myScroller_report,'myReportContent','getMyReportRecords()');
	//进入时加载
	searchTotal_myReport(startDateTime,endDateTime);
}

function myReportTypeChange() {
    startDateTime = $("#selectDateMyReport_Stt").val()+hms00;
    endDateTime = $("#selectDateMyReport_End").val()+hms59;
    searchTotal_myReport(startDateTime, endDateTime);
}

function dateChangeMyReport() {
    var type = $("#myReportSearchDate").val();
    switch(type) {
        case "0":
            //当天记录
            $("#selectDateMyReport_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateMyReport_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateMyReport_Stt").val()+hms00;
            endDateTime = $("#selectDateMyReport_End").val()+hms59;
            searchTotal_myReport(startDateTime, endDateTime);
            changeDateRange_MyReport(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
			$("#selectDateMyReport_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateMyReport_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateMyReport_Stt").val()+hms00;
            endDateTime = $("#selectDateMyReport_End").val()+hms59;
            searchTotal_myReport(startDateTime, endDateTime);
            changeDateRange_MyReport(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_MyReport(minNum,minType,maxNum,maxType){
    selDateMRStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateMREnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/*
* 下拉页面刷新我的报表记录
* */
function getMyReportRecords() {
	if(startDateTime == "" || endDateTime == ""){
		startDateTime = $("#selectDateMyReport_Stt").val()+hms00;
		endDateTime = $("#selectDateMyReport_End").val()+hms59;
	}
	ajaxUtil.ajaxByAsyncPost(null, '{"UserID":-1,"ProjectPublic_PlatformCode":2,"Type":1,"InterfaceName":"/api/v1/netweb/Getmyreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myPeport +'}', myReportSuccessCallBack, '正在加载数据...');
}

function searchTotal_myReport(startDateTime,endDateTime) {
	page=0;
	ajaxUtil.ajaxByAsyncPost(null, '{"UserID":-1,"ProjectPublic_PlatformCode":2,"Type":1,"InterfaceName":"/api/v1/netweb/Getmyreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myPeport +'}', myReportSuccessCallBack, '正在加载数据...');
}

/**
 * 查询个人报表方法回调函数
 */
function myReportSuccessCallBack(data) {
	$("#myReportRecord_noData_tips").hide();
	if (page == 0) {
		$("#myReportContent").empty();
		$("#myReportScroller").scroller().scrollToTop();
		$("#myReportScroller").scroller().clearInfinite();
	}
	
	if(data.Code == 200){
	    if(data.Data == null){
			$("#myReportRecord_noData_tips").show();
			//toastUtils.showToast("没有数据");
			return;
		}
	    myReportChangeShow(data.Data);
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

/*
* 显示列表或者统计数据
*/
function myReportChangeShow(data) {
	var selectedShow=0;
	selectedShow = $("#myReportSearchType").val();

	  if(data.ReportComm && selectedShow==1) {
		//Total
		$("#myReportContent").empty();
		var $totalInfo = $('<ul class="recordDetail"><li>充值总金额：<span id="totalCharge"></span></li><li>提款总金额：<span id="totalWithdrawal"></span></li><li>购彩总金额：<span id="totalCost"></span></li><li>总奖金：<span id="myWinAwards"></span></li><li>自身返点：<span id="myRebate_self"></span></li><li>下级返点：<span id="subordinateRebate_sub"></span></li><li>其他收入：<span id="getFromOthers"></span></li><li class="'+checkValue(data.ReportComm[0].GainTotal)+'">盈利总金额：<span id="totalPrize"></span></li></ul>');
		$("#myReportContent").append($totalInfo);

		$("#totalCharge").html(data.ReportComm[0].RechargeTotal);
		$("#totalWithdrawal").html(data.ReportComm[0].DrawingsTotal);
		$("#totalCost").html(data.ReportComm[0].BuyTotal);
		$("#myWinAwards").html(data.ReportComm[0].WinningTotal);
		$("#myRebate_self").html(data.ReportComm[0].SelfRebateTotal);
		$("#subordinateRebate_sub").html(data.ReportComm[0].SubRebateTotal);
		$("#getFromOthers").html(bigNumberUtil.add(data.ReportComm[0].OtherTotal,data.ReportComm[0].DailywageTotal));
		$("#totalPrize").html(data.ReportComm[0].GainTotal);
		
		if(data.ReportComm[0].GainTotal < 0){
			$("#totalPrize").css('color','red');
		}else if(data.ReportComm[0].GainTotal > 0){
			$("#totalPrize").css('color','green');
		}else{
			$("#totalPrize").css('color','#FE5D39');
		}
	  }
	  if(data.ReportComm.length==0 && selectedShow==1){
	  	$("#myReportRecord_noData_tips").show();
//		toastUtils.showToast("没有数据");
	  }

	  //List
	  if(data.Reportlst && selectedShow==0) {
		$("#myReportContent").empty();

		for(var j=0;j<data.Reportlst.length;j++){
			var reportList=data.Reportlst;
			var $liContent = $('<ul id="listId" class="recordDetail"><li>时间：<span>'+reportList[j].HisTime.split(" ")[0]
				+'</span></li><li>充值总金额：<span>'+reportList[j].RechargeMoney
				+'</span></li><li>提款总金额：<span >'+reportList[j].DrawingsMoney
				+'</span></li><li>购彩总金额：<span>'+reportList[j].BetMoney
				+'</span></li><li>奖金 ：<span>'+reportList[j].WinMoney
				+'</span></li><li>自身返点：<span>'+reportList[j].SelfRebateMoney
				+'</span></li><li>下级返点：<span >'+reportList[j].SubRebateMoney
				+'</span></li><li>其他收入：<span>'+ bigNumberUtil.add(reportList[j].OtherMoney,reportList[j].Dailywage)
				+'</span></li><li class="'+checkValue(reportList[j].GainMoney)+'">盈利总金额：<span>'+reportList[j].GainMoney+'</span></li></ul>');
			$("#myReportContent").append($liContent);

			var items=$('#myReportContent li:eq(8) span');
			if(items[0].innerHTML < 0){
				items.css('color','red');
			}else if(items[0].innerHTML > 0){
				items.css('color','green');
			}else{
				items.css('color','#FE5D39');
			}
		}
	  }
	  if(data.Reportlst.length==0 && selectedShow==0 ){
	  	$("#myReportRecord_noData_tips").show();
//		toastUtils.showToast("没有数据");
	  }
}


