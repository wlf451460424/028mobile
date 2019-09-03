//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";

var selDateTRSStart;
var selDateTRSEnd;

/*进入panel时调用*/
function teamReportSelfLoadedPanel(){
	catchErrorFun("teamReportSelfInit();");
}

/*离开panel时调用*/
function teamReportSelfUnloadedPanel(){
    clearSearchTerm();      
    startDateTime = "";
    endDateTime = ""; 
    $("#teamReportSelfDataId").empty();
    $("#teamReportSelfULId").empty();
    if(selDateTRSStart){
        selDateTRSStart.dismiss();
    }
    if(selDateTRSEnd){
        selDateTRSEnd.dismiss();
    }
}

//@ 初始化
function teamReportSelfInit(){
    $("#teamReportSelfDataId").empty();
    $("#teamReportSelfULId").empty();

    var $ReportSelfLData=$('<table><tr>' +
        '<td><select name="myTRSSearchDate" id="myTRSSearchDate" data-theme="a" data-mini="true" onchange="typeChange_teamReportSelf()">' +
        '<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDateTRS_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateTRS_End" readonly/></td></tr></table>');
    $("#teamReportSelfDataId").append($ReportSelfLData);

    var $SelfUL=$('<ul class="recordDetail"><li>自 身：<span id="selfUser_Self"></span></li><li>直 属：<span id="child_Self"></span></li><li>团 队：<span id="team_Self"></span></li><li>充值总额：<span id="charge_Self"></span></li><li>提款总额：<span id="withdrawal_Self"></span></li><li>购彩总额：<span id="buyLottery_Self"></span></li><li>返点总额：<span id="point_Self"></span></li><li>中奖总额：<span id="prize_Self"></span></li><li style="display: none;">日结：<span id="dailywage_Self"></span></li><li>其他收入：<span id="others_Self"></span></li><li>盈利总额：<span id="winTotal_Self"></span></li></ul>');
    $("#teamReportSelfULId").append($SelfUL);

    selDateTRSStart = new MobileSelectDate();
    selDateTRSStart.init({trigger:'#selectDateTRS_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateTRSEnd = new MobileSelectDate();
    selDateTRSEnd.init({trigger:'#selectDateTRS_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#selectDateTRS_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateTRS_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateTRS_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateTRS_End").val()+hms59;

	var user = localStorageUtils.getParam("username");
	var childCount = localStorageUtils.getParam("childCount");
	var teamChildCount = localStorageUtils.getParam("teamMemberCount");

	$("#child_Self").html(childCount);
	$("#team_Self").html(teamChildCount);
	$("#selfUser_Self").html(user);	
    searchTotal_teamReportSel(startDateTime,endDateTime);
}

//@ 切换当前和历史记录
function typeChange_teamReportSelf() {
    var type = $("#myTRSSearchDate").val();
    switch(type) {
        case "0":
            //当天记录
            $("#selectDateTRS_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateTRS_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateTRS_Stt").val()+hms00;
            endDateTime = $("#selectDateTRS_End").val()+hms59;
            searchTotal_teamReportSel(startDateTime, endDateTime);
            changeDateRange_TRS(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateTRS_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateTRS_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateTRS_Stt").val()+hms00;
            endDateTime = $("#selectDateTRS_End").val()+hms59;
            searchTotal_teamReportSel(startDateTime, endDateTime);
            changeDateRange_TRS(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

function searchTotal_teamReportSel(startDateTime,endDateTime) {
	ajaxUtil.ajaxByAsyncPost(null, '{"UserID":-1,"ProjectPublic_PlatformCode":2,"RebateType":1,"ISself":1,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportSelfSuccessCallBack, '正在加载数据...');
}

//@  切换当前记录或者历史记录时。
function changeDateRange_TRS(minNum,minType,maxNum,maxType){
    selDateTRSStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateTRSEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//@ 查询下级统计方法回调函数
function teamReportSelfSuccessCallBack(data) {
	if (data.Code == 200) {
		$("#charge_Self").html(data.Data.ReportComm[0].RechargeTotal);
		$("#withdrawal_Self").html(data.Data.ReportComm[0].DrawingsTotal);
		$("#buyLottery_Self").html(data.Data.ReportComm[0].BuyTotal);
		$("#point_Self").html(data.Data.ReportComm[0].RebateTotal);
		$("#prize_Self").html(data.Data.ReportComm[0].WinningTotal);
		//其他，显示为其他+日结的和。
		var othersTotal = bigNumberUtil.add(data.Data.ReportComm[0].OtherTotal,data.Data.ReportComm[0].DailywageTotal).toString();
		$("#others_Self").html(othersTotal);
		$("#winTotal_Self").html(data.Data.ReportComm[0].GainTotal);
		
		if(data.Data.ReportComm[0].GainTotal < 0){
			$("#winTotal_Self").css('color','red');
		}else if(data.Data.ReportComm[0].GainTotal > 0){
			$("#winTotal_Self").css('color','green');
		}else{
			$("#winTotal_Self").css('color','#FE5D39');
		}
		// $("#dailywage_Self").html(data.ReportComm[0].DailywageTotal);
	} else {
		toastUtils.showToast(data.Msg);
	}
}