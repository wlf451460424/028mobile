//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var page=0;
var PAGESIZE_gamePersonalReport = 20;

var selDateGPRStart;
var selDateGPREnd;
var gameId;

/*进入panel时调用*/
function gamePersonalReportLoadedPanel(){
    catchErrorFun("gamePersonalReportInit();");
}
/*离开panel时调用*/
function gamePersonalReportUnloadedPanel(){
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    $("#gamePersonalReportDate").empty();
    $("#gamePersonalReportContent").empty();
    if(selDateGPRStart){
        selDateGPRStart.dismiss();
    }
    if(selDateGPREnd){
        selDateGPREnd.dismiss();
    }
}

function gamePersonalReportInit(){
    $("#selectType_gamePersonalReport").empty();

    var $selectType_gamePersonalReport = $('<select name="gamePersonalReportSearchType" id="gamePersonalReportSearchType" data-theme="a" data-mini="true" onchange="gamePersonalReportTypeChange()"><option value="0" selected="selected">类型：每日统计</option><option value="1">类型：汇总统计</option></select>');
    $("#selectType_gamePersonalReport").append($selectType_gamePersonalReport);

    $("#gamePersonalReportContent").empty();

    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td>' +
        '<select name="gamePersonalReportSearchDate" id="gamePersonalReportSearchDate" data-theme="a" data-mini="true" onchange="dateChangeGamePersonalReport()">' +
//      '<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>'+
		'</select></td>' +
        '<td><input type="text" id="selectDateGamePersonalReport_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateGamePersonalReport_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="gamePersonalReport_type" onchange="personalReport_changeGame()" id="gamePersonalReport_type"></select></td></tr></table>');
	$("#gamePersonalReportDate").append($select);

	//第三方游戏平台类型
	var Arr_ThirdPartyInfo = jsonUtils.toObject(localStorageUtils.getParam("Arr_ThirdPartyInfo"));
    $.each(Arr_ThirdPartyInfo,function (key,val) {
        if(key == 0){
	        gameId = val.ThirdpartyValue;
	        $("#gamePersonalReportSearchDate").empty();
	        if(gameId == 2){
	        	$("#gamePersonalReportSearchDate").append('<option value="1" selected="selected">历史记录</option>');
	        }else{
	        	$("#gamePersonalReportSearchDate").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	        }

        }
       $("#gamePersonalReport_type").append('<option value="'+ val.ThirdpartyValue +'">报表类型：'+ val.ThirdpartyText +'</option>');
    	
    });

    //查询开始时间
    selDateGPRStart = new MobileSelectDate();
    selDateGPRStart.init({trigger:'#selectDateGamePersonalReport_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateGPREnd = new MobileSelectDate();
    selDateGPREnd.init({trigger:'#selectDateGamePersonalReport_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#selectDateGamePersonalReport_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateGamePersonalReport_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateGamePersonalReport_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateGamePersonalReport_End").val()+hms59;

    page = 0;
    hasMorePage = true;//默认还有分页
    var myScroller_report = $("#gamePersonalReportScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    myScroller_report.scrollToTop();
    myScroller_report.clearInfinite();
    UseScrollerRefresh(myScroller_report,'gamePersonalReportContent','getGamePersonalReport()');
    //进入时加载
	dateChangeGamePersonalReport();
    // searchTotal_gamePersonalReport(startDateTime,endDateTime);
}

//切换"每日统计"与"汇总统计"
function gamePersonalReportTypeChange() {
	gameId = $("#gamePersonalReport_type").val();
    startDateTime = $("#selectDateGamePersonalReport_Stt").val()+hms00;
    endDateTime = $("#selectDateGamePersonalReport_End").val()+hms59;
    searchTotal_gamePersonalReport(startDateTime, endDateTime);
}

//切换第三方游戏类型
function personalReport_changeGame() {
    gameId = $("#gamePersonalReport_type").val();
	$("#gamePersonalReportSearchDate").empty();
	if(gameId == 2){
		$("#gamePersonalReportSearchDate").append('<option value="1" selected="selected">历史记录</option>');
	}else{
    	$("#gamePersonalReportSearchDate").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
    }
	dateChangeGamePersonalReport();
}

//切换时间范围
function dateChangeGamePersonalReport() {
    var type = $("#gamePersonalReportSearchDate").val();
	gameId = $("#gamePersonalReport_type").val();
    switch(type) {
        case "0":
            //当天记录
            $("#selectDateGamePersonalReport_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateGamePersonalReport_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateGamePersonalReport_Stt").val()+hms00;
            endDateTime = $("#selectDateGamePersonalReport_End").val()+hms59;
            searchTotal_gamePersonalReport(startDateTime, endDateTime);
            changeDateRange_GamePersonalReport(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateGamePersonalReport_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateGamePersonalReport_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateGamePersonalReport_Stt").val()+hms00;
            endDateTime = $("#selectDateGamePersonalReport_End").val()+hms59;
            searchTotal_gamePersonalReport(startDateTime, endDateTime);
            changeDateRange_GamePersonalReport(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

//切换当前记录或者历史记录时
function changeDateRange_GamePersonalReport(minNum,minType,maxNum,maxType){
    selDateGPRStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateGPREnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//下拉页面刷新我的报表记录
function getGamePersonalReport() {
    ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyMyRePort","ID":"'+ gameId +'","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_gamePersonalReport +'}', gamePersonalReportSuccessCallBack, '正在加载数据...');
}

function searchTotal_gamePersonalReport(startDateTime,endDateTime) {
    page=0;
    ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyMyRePort","ID":"'+ gameId +'","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_gamePersonalReport +'}', gamePersonalReportSuccessCallBack, '正在加载数据...');
}

/**
 * 查询个人报表方法回调函数
 */
function gamePersonalReportSuccessCallBack(data) {
	$("#gamePersonalReport_noData_tips").hide();
	$("#gamePersonalReportContent").empty();
    if (data.Code == 200) {
        if(gameId == 1){  // 1:大雄棋牌（美天棋牌）
	        gamePersonalReport_QiPai_DX(data.Data);
	    }else if(gameId == 2){ // 2:开元棋牌
	        gamePersonalReport_QiPai_KY(data.Data);
        }else if(gameId == 3){  // VR真人
	        gamePersonalReport_Vr(data.Data);
        }else if(gameId == 4){  // AG平台
	        gamePersonalReport_Ag(data.Data);
	    }else if(gameId == 6){  // 幸运棋牌
	        gamePersonalReport_Xy(data.Data);
        }else if(gameId == 7){  // 乐游棋牌
	        gamePersonalReport_Ly(data.Data);
        }
    } else {
    	$("#gamePersonalReport_noData_tips").show();
        toastUtils.showToast(data.Msg);
    }
}

//@ 显示 大雄棋牌（美天棋牌）
function gamePersonalReport_QiPai_DX(data) {
    var selectedShow = $("#gamePersonalReportSearchType").val();
    if(data.ReportComm.length && selectedShow == "1") {
		//Total  
        $("#gamePersonalReportContent").empty();
        var $totalInfo = $('<ul class="recordDetail">' +
	        '<li>合 计：<span>- - -</span></li>' +
			'<li>投注：<span>'+ Number(data.ReportComm[0].GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
			'<li>有效投注：<span>'+ Number(data.ReportComm[0].ValidBetAmount?data.ReportComm[0].ValidBetAmount.toFixed(3).slice(0,-1):0) +'</span></li>' +
	        '<li>中奖：<span>'+ Number(data.ReportComm[0].GameGet ? (data.ReportComm[0].GameGet.toFixed(3).slice(0,-1)) : 0) +'</span></li>' +
	        '<li>房 费：<span>'+ Number(data.ReportComm[0].RoomFee.toFixed(3).slice(0,-1)) +'</span></li>' +
	        '<li>其他收入：<span>'+ Number(data.ReportComm[0].OtherMoney?data.ReportComm[0].OtherMoney:0) +'</span></li>' +
	        '<li>对战类盈亏：<span>'+ Number(data.ReportComm[0].PlayIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
			'<li>电子类盈亏：<span>'+ Number(data.ReportComm[0].SystemIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
	        '<li>盈 亏：<span>'+ Number(data.ReportComm[0].PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
        $("#gamePersonalReportContent").append($totalInfo);
        
		var colorShow = [8,6,7];
		$.each(colorShow,function (key,val) {
			var items=$('#gamePersonalReportContent ul li:eq('+ val +') span');
			if(items[0].innerHTML < 0){
				items.css('color','red');
			}else if(items[0].innerHTML > 0){
				items.css('color','green');
			}else{
				items.css('color','#FE5D39');
			}
		});
    }

    if(data.ReportComm.length==0 && selectedShow=="1"){
    	$("#gamePersonalReport_noData_tips").show();
//      toastUtils.showToast("未查询到数据");
    }

    //List  
    if(data.Reportlst && selectedShow == "0") {
        $("#gamePersonalReportContent").empty();

        for(var j=0;j<data.Reportlst.length;j++){
            var $liContent=$('<li></li>');
            var reportList=data.Reportlst;
            $liContent.append('<ul class="recordDetail">' +
	            '<li>日 期：<span>'+ reportList[j].HisDate.split(" ")[0] +'</span></li>' +
				'<li>投注：<span>'+ Number(reportList[j].GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>有效投注：<span>'+ Number(reportList[j].ValidBetAmount?reportList[j].ValidBetAmount.toFixed(3).slice(0,-1):0) +'</span></li>' +
	            '<li>中奖：<span >'+ Number(reportList[j].GameGet.toFixed(3).slice(0,-1)) +'</span></li>' +
	            '<li>房 费：<span>'+ Number(reportList[j].RoomFee.toFixed(3).slice(0,-1)) +'</span></li>' +
	            '<li>其他收入：<span>'+ Number(reportList[j].OtherMoney?reportList[j].OtherMoney:0) +'</span></li>' +
	            '<li>对战类盈亏：<span>'+ Number(reportList[j].PlayIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>电子类盈亏：<span>'+ Number(reportList[j].SystemIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
	            '<li class="'+checkValue(Number(reportList[j].PL.toFixed(3).slice(0,-1)))+'">盈 亏：<span>'+ Number(reportList[j].PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');

            $("#gamePersonalReportContent").append($liContent);
            
			var colorShow = [8,6,7];
			$.each(colorShow,function (key,val) {
				var items=$('#gamePersonalReportContent ul li:eq('+ val +') span');
				if(items[0].innerHTML < 0){
					items.css('color','red');
				}else if(items[0].innerHTML > 0){
					items.css('color','green');
				}else{
					items.css('color','#FE5D39');
				}
			});
        }
    }
    if(data.Reportlst.length==0 && selectedShow =="0" ){
    	$("#gamePersonalReport_noData_tips").show();
//      toastUtils.showToast("未查询到数据");
    }
}

//@ 显示 开元棋牌
function gamePersonalReport_QiPai_KY(data) {
    var selectedShow = $("#gamePersonalReportSearchType").val();
    if(data.ReportComm.length && selectedShow == "1") {
        //Total
        $("#gamePersonalReportContent").empty();
        var $totalInfo = $('<ul class="recordDetail">' +
	        '<li>合 计：<span>- - -</span></li>' +
	        '<li>投注：<span>'+ Number(data.ReportComm[0].GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
	        '<li>其他收入：<span>'+ Number(data.ReportComm[0].OtherMoney?data.ReportComm[0].OtherMoney:0) +'</span></li>' +
	        '<li>总盈亏：<span>'+ Number(data.ReportComm[0].PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
        $("#gamePersonalReportContent").append($totalInfo);
        
        var items=$('#gamePersonalReportContent ul li:eq(3) span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
    }

    if(data.ReportComm.length==0 && selectedShow=="1"){
    	$("#gamePersonalReport_noData_tips").show();
//      toastUtils.showToast("未查询到数据");
    }

    //List
    if(data.Reportlst && selectedShow == "0") {
        $("#gamePersonalReportContent").empty();

        for(var j=0;j<data.Reportlst.length;j++){
            var $liContent=$('<li></li>');
            var reportList=data.Reportlst;
            $liContent.append('<ul class="recordDetail">' +
	            '<li>日 期：<span>'+ reportList[j].HisDate.split(" ")[0] +'</span></li>' +
	            '<li>投注：<span>'+ Number(reportList[j].GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
	            '<li>其他收入：<span>'+ Number(reportList[j].OtherMoney?reportList[j].OtherMoney:0) +'</span></li>' +
	            '<li class="'+checkValue(Number(reportList[j].PL.toFixed(3).slice(0,-1)))+'">盈 亏：<span>'+ Number(reportList[j].PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
            $("#gamePersonalReportContent").append($liContent);
            
            var items=$('#gamePersonalReportContent ul li:eq(3) span');
			if(items[0].innerHTML < 0){
				items.css('color','red');
			}else if(items[0].innerHTML > 0){
				items.css('color','green');
			}else{
				items.css('color','#FE5D39');
			}
        }
    }
    if(data.Reportlst.length==0 && selectedShow =="0" ){
    	$("#gamePersonalReport_noData_tips").show();
//      toastUtils.showToast("未查询到数据");
    }
}

//@ 显示 VR 类列表或者统计数据
function gamePersonalReport_Vr(data) {
	var selectedShow = $("#gamePersonalReportSearchType").val();
	if(data.TotalMyRpt && selectedShow == "1") {
		//Total
		$("#gamePersonalReportContent").empty();
		var $totalInfo = $('<ul class="recordDetail">' +
			'<li>合 计：<span>- - -</span></li>' +
			'<li>投注：<span>'+ Number(data.TotalMyRpt.BetMoney) +'</span></li>' +
			'<li>打赏：<span>'+ Number(data.TotalMyRpt.Rewards) +'</span></li>' +
			'<li>中奖：<span>'+ Number(data.TotalMyRpt.WinMoney) +'</span></li>' +
			'<li>其他收入：<span>'+ (data.TotalMyRpt.Dailywage ? Number(data.TotalMyRpt.Dailywage) : 0) +'</span></li>' +
			'<li>盈 亏：<span id="totalPL">'+ Number(data.TotalMyRpt.WinLoss) +'</span></li></ul>');
		$("#gamePersonalReportContent").append($totalInfo);
		
		var items=$('#gamePersonalReportContent ul li:eq(5) span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	}
	if(data.TotalMyRpt.length==0 && selectedShow=="1"){
		$("#gamePersonalReport_noData_tips").show();
//		toastUtils.showToast("未查询到数据");
	}

	//List
	if(data.MyReportList && selectedShow == "0") {
		$("#gamePersonalReportContent").empty();

		for(var j=0;j<data.MyReportList.length;j++){
			var $liContent=$('<li></li>');
			var reportList=data.MyReportList;
			$liContent.append('<ul class="recordDetail"><li>日 期：<span>'+ reportList[j].HisTime.split(" ")[0]
				+'</span></li><li>投注：<span>'+ Number(reportList[j].BetMoney)
				+'</span></li><li>打赏：<span>'+ Number(reportList[j].Rewards)
				+'</span></li><li>中奖：<span >'+ Number(reportList[j].WinMoney)
				+'</span></li><li>其他收入：<span >'+ (reportList[j].Dailywage ? Number(reportList[j].Dailywage) : 0)
				+'</span></li><li class="'+checkValue(Number(reportList[j].WinLoss))+'">盈 亏：<span>'+ Number(reportList[j].WinLoss)
				+'</span></li></ul>');
			$("#gamePersonalReportContent").append($liContent);
			
			var items=$('#gamePersonalReportContent ul li:eq(5) span');
			if(items[0].innerHTML < 0){
				items.css('color','red');
			}else if(items[0].innerHTML > 0){
				items.css('color','green');
			}else{
				items.css('color','#FE5D39');
			}
		}
	}
	if(data.MyReportList.length==0 && selectedShow =="0" ){
		$("#gamePersonalReport_noData_tips").show();
//		toastUtils.showToast("未查询到数据");
	}
}

//@ 显示 AG
function gamePersonalReport_Ag(data) {
	var selectedShow = $("#gamePersonalReportSearchType").val();
	if(data.ReportComm.length && selectedShow == "1") {
		//Total
		$("#gamePersonalReportContent").empty();
		var $totalInfo = $('<ul class="recordDetail">' +
			'<li>合 计：<span>- - -</span></li>' +
			'<li>投注 ：<span>'+ Number(data.ReportComm[0].BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
			'<li>有效投注：<span>'+ Number(data.ReportComm[0].ValidBetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
			'<li>中奖：<span>'+ Number(data.ReportComm[0].AwardAmount.toFixed(3).slice(0,-1))+'</span></li>' +
			'<li>视讯盈亏：<span>'+ Number(data.ReportComm[0].SXNetAmount.toFixed(3).slice(0,-1))+'</span></li>' +
			'<li>电子盈亏：<span>'+ Number(data.ReportComm[0].DZNetAmount.toFixed(3).slice(0,-1))+'</span></li>' +
			'<li>桌面盈亏：<span>'+ Number(data.ReportComm[0].ZYNetAmount.toFixed(3).slice(0,-1))+'</span></li>' +
			'<li>捕鱼王盈亏：<span>'+ Number(data.ReportComm[0].BYNetAmount.toFixed(3).slice(0,-1))+'</span></li>' +
			'<li>其他收入：<span>'+ Number(data.ReportComm[0].OtherMoney?data.ReportComm[0].OtherMoney:0) +'</span></li>' +
			'<li>盈 亏 ：<span>'+ Number(data.ReportComm[0].TotalNetAmount.toFixed(3).slice(0,-1)) +'</span></li></ul>');
		$("#gamePersonalReportContent").append($totalInfo);

		var colorShow = [4,5,6,7,9];
		$.each(colorShow,function (key,val) {
			var items=$('#gamePersonalReportContent ul li:eq('+ val +') span');
			if(items[0].innerHTML < 0){
				items.css('color','red');
			}else if(items[0].innerHTML > 0){
				items.css('color','green');
			}else{
				items.css('color','#FE5D39');
			}
		});
	}

	if(data.ReportComm.length==0 && selectedShow=="1"){
		$("#gamePersonalReport_noData_tips").show();
//		toastUtils.showToast("未查询到数据");
	}

	//List
	if(data.ReportList.length && selectedShow == "0") {
		$("#gamePersonalReportContent").empty();

		for(var j=0;j<data.ReportList.length;j++){
			var $liContent=$('<li></li>');
			var reportList=data.ReportList;
			$liContent.append('<ul class="recordDetail">' +
				'<li>日 期 ：<span>'+ reportList[j].HisDate.split(" ")[0] +'</span></li>' +
				'<li>投 注：<span>'+ Number(reportList[j].BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>有效投注：<span>'+ Number(reportList[j].ValidBetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>中奖：<span>'+ Number(reportList[j].AwardAmount.toFixed(3).slice(0,-1))+'</span></li>' +
				'<li>视讯盈亏：<span>'+ Number(reportList[j].SXNetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>电子盈亏：<span>'+ Number(reportList[j].DZNetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>桌面盈亏：<span>'+ Number(reportList[j].ZYNetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>捕鱼王盈亏：<span>'+ Number(reportList[j].BYNetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>其他收入：<span>'+ Number(reportList[j].OtherMoney?reportList[j].OtherMoney:0) +'</span></li>' +
				'<li>盈 亏 ：<span>'+ Number(reportList[j].TotalNetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'</ul>');
			$("#gamePersonalReportContent").append($liContent);

			var colorShow = [4,5,6,7,9];
			$.each(colorShow,function (key,val) {
				var items=$('#gamePersonalReportContent ul li:eq('+ val +') span');
				if(items[0].innerHTML < 0){
					items.css('color','red');
				}else if(items[0].innerHTML > 0){
					items.css('color','green');
				}else{
					items.css('color','#FE5D39');
				}
			});
		}
	}
	if(data.ReportList.length==0 && selectedShow =="0"){
		$("#gamePersonalReport_noData_tips").show();
//		toastUtils.showToast("未查询到数据");
	}
}


//@ 显示 幸运棋牌
function gamePersonalReport_Xy(data) {
	var selectedShow = $("#gamePersonalReportSearchType").val();
	if(data.ReportComm.length && selectedShow == "1") {
		//Total
		$("#gamePersonalReportContent").empty();
		var $totalInfo = $('<ul class="recordDetail">' +
			'<li>合 计：<span>- - -</span></li>' +
			'<li>投注 ：<span>'+ Number(data.ReportComm[0].BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
			'<li>有效投注：<span>'+ Number(data.ReportComm[0].ValidBetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
			'<li>其他收入：<span>'+ Number(data.ReportComm[0].Dailywage?data.ReportComm[0].Dailywage:0) +'</span></li>' +
			'<li>盈 亏 ：<span>'+ Number(data.ReportComm[0].PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
		$("#gamePersonalReportContent").append($totalInfo);

		var colorShow = [4];
		$.each(colorShow,function (key,val) {
			var items=$('#gamePersonalReportContent ul li:eq('+ val +') span');
			if(items[0].innerHTML < 0){
				items.css('color','red');
			}else if(items[0].innerHTML > 0){
				items.css('color','green');
			}else{
				items.css('color','#FE5D39');
			}
		});
	}

	if(data.ReportComm.length==0 && selectedShow=="1"){
		$("#gamePersonalReport_noData_tips").show();
//		toastUtils.showToast("未查询到数据");
	}

	//List
	if(data.ReportList.length && selectedShow == "0") {
		$("#gamePersonalReportContent").empty();

		for(var j=0;j<data.ReportList.length;j++){
			var $liContent=$('<li></li>');
			var reportList=data.ReportList;
			$liContent.append('<ul class="recordDetail">' +
				'<li>日 期 ：<span>'+ reportList[j].HisDate.split(" ")[0] +'</span></li>' +
				'<li>投 注：<span>'+ Number(reportList[j].BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>有效投注：<span>'+ Number(reportList[j].ValidBetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>其他收入：<span>'+ Number(reportList[j].Dailywage?reportList[j].Dailywage:0) +'</span></li>' +
				'<li>盈 亏 ：<span>'+ Number(reportList[j].PL.toFixed(3).slice(0,-1)) +'</span></li>' +
				'</ul>');
			$("#gamePersonalReportContent").append($liContent);

			var colorShow = [4];
			$.each(colorShow,function (key,val) {
				var items=$('#gamePersonalReportContent ul li:eq('+ val +') span');
				if(items[0].innerHTML < 0){
					items.css('color','red');
				}else if(items[0].innerHTML > 0){
					items.css('color','green');
				}else{
					items.css('color','#FE5D39');
				}
			});
		}
	}
	if(data.ReportList.length==0 && selectedShow =="0"){
		$("#gamePersonalReport_noData_tips").show();
//		toastUtils.showToast("未查询到数据");
	}
}

//@ 显示 乐游棋牌
function gamePersonalReport_Ly(data) {
	var selectedShow = $("#gamePersonalReportSearchType").val();
	if(data.ReportComm.length && selectedShow == "1") {
		//Total
		$("#gamePersonalReportContent").empty();
		var $totalInfo = $('<ul class="recordDetail">' +
			'<li>合 计：<span>- - -</span></li>' +
//			'<li>投注 ：<span>'+ Number(data.ReportComm[0].BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
			'<li>有效投注：<span>'+ Number(data.ReportComm[0].ValidBetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
			'<li>其他收入：<span>'+ Number(data.ReportComm[0].Dailywage?data.ReportComm[0].Dailywage:0) +'</span></li>' +
			'<li>盈 亏 ：<span>'+ Number(data.ReportComm[0].PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
		$("#gamePersonalReportContent").append($totalInfo);

		var colorShow = [3];
		$.each(colorShow,function (key,val) {
			var items=$('#gamePersonalReportContent ul li:eq('+ val +') span');
			if(items[0].innerHTML < 0){
				items.css('color','red');
			}else if(items[0].innerHTML > 0){
				items.css('color','green');
			}else{
				items.css('color','#FE5D39');
			}
		});
	}

	if(data.ReportComm.length==0 && selectedShow=="1"){
		$("#gamePersonalReport_noData_tips").show();
	}

	//List
	if(data.ReportList.length && selectedShow == "0") {
		$("#gamePersonalReportContent").empty();

		for(var j=0;j<data.ReportList.length;j++){
			var $liContent=$('<li></li>');
			var reportList=data.ReportList;
			$liContent.append('<ul class="recordDetail">' +
				'<li>日 期 ：<span>'+ reportList[j].HisDate.split(" ")[0] +'</span></li>' +
//				'<li>投 注：<span>'+ Number(reportList[j].BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>有效投注：<span>'+ Number(reportList[j].ValidBetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
				'<li>其他收入：<span>'+ Number(reportList[j].Dailywage?reportList[j].Dailywage:0) +'</span></li>' +
				'<li>盈 亏 ：<span>'+ Number(reportList[j].PL.toFixed(3).slice(0,-1)) +'</span></li>' +
				'</ul>');
			$("#gamePersonalReportContent").append($liContent);

			var colorShow = [3];
			$.each(colorShow,function (key,val) {
				var items=$('#gamePersonalReportContent ul li:eq('+ val +') span');
				if(items[0].innerHTML < 0){
					items.css('color','red');
				}else if(items[0].innerHTML > 0){
					items.css('color','green');
				}else{
					items.css('color','#FE5D39');
				}
			});
		}
	}
	if(data.ReportList.length==0 && selectedShow =="0"){
		$("#gamePersonalReport_noData_tips").show();
	}
}

