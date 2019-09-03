//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";

var selDateTRAStart;
var selDateTRAEnd;

/*进入panel时调用*/
function teamReportAllLoadedPanel(){
	catchErrorFun("teamReportAllInit();");
}
/*离开panel时调用*/
function teamReportAllUnloadedPanel(){
    clearSearchTerm();      
    startDateTime = "";
    endDateTime = ""; 
	$("#teamReportAllDataId").empty();
	$("#teamReportAllUlId").empty();
    if(selDateTRAStart){
        selDateTRAStart.dismiss();
    }
    if(selDateTRAEnd){
        selDateTRAEnd.dismiss();
    }
}

function teamReportAllInit(){
    $("#teamReportAllDataId").empty();
    var $ReportAllLData=$('<table><tr>' +
		'<td><select name="myTRASearchDate" id="myTRASearchDate" data-theme="a" data-mini="true" onchange="typeChange_teamReportAll()">' +
		'<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option></select></td>' +
		'<td><input type="text" id="selectDateTRA_Stt" readonly/></td>' +
		'<td><input type="text" id="selectDateTRA_End" readonly/></td></tr></table>');
    $("#teamReportAllDataId").append($ReportAllLData);

    $("#teamReportAllUlId").empty();
    var $ReportAllLUL=$('<ul class="recordDetail"><li>直 属：<span id="child_all"></span></li><li>团 队：<span id="team_all"></span></li><li>充值总额：<span id="charge_all"></span></li><li>提款总额：<span id="withdrawal_all"></span></li><li>购彩总额：<span id="buyLottery_all"></span></li><li>返点总额：<span id="point_all"></span></li><li>中奖总额：<span id="prize_all"></span></li><li style="display: none;">日结：<span id="dailywage_all"></span></li><li>其他收入：<span id="others_all"></span></li><li>盈利总额：<span id="winTotal_all"></span></li></ul>');
    $("#teamReportAllUlId").append($ReportAllLUL);

    selDateTRAStart = new MobileSelectDate();
    selDateTRAStart.init({trigger:'#selectDateTRA_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateTRAEnd = new MobileSelectDate();
    selDateTRAEnd.init({trigger:'#selectDateTRA_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#selectDateTRA_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateTRA_End").val(initDefaultDate(0,"day"));
    //查询开始时间
	startDateTime = $("#selectDateTRA_Stt").val()+hms00;
	//查询结束时间
	endDateTime = $("#selectDateTRA_End").val()+hms59;
	var childCount = localStorageUtils.getParam("childCount");
	var teamChildCount = localStorageUtils.getParam("teamMemberCount");
	$("#child_all").html(childCount);
	$("#team_all").html(teamChildCount);
    searchTotal_teamReportAll(startDateTime,endDateTime);
}

function typeChange_teamReportAll() {
    var type = $("#myTRASearchDate").val();
    switch(type) {
        case "0":
            //当天记录
            $("#selectDateTRA_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateTRA_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateTRA_Stt").val()+hms00;
            endDateTime = $("#selectDateTRA_End").val()+hms59;
            searchTotal_teamReportAll(startDateTime, endDateTime);
            changeDateRange_TRA(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateTRA_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateTRA_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateTRA_Stt").val()+hms00;
            endDateTime = $("#selectDateTRA_End").val()+hms59;
            searchTotal_teamReportAll(startDateTime, endDateTime);
            changeDateRange_TRA(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

function searchTotal_teamReportAll(startDateTime,endDateTime) {
	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"RebateType":1,"ISself":0,"InterfaceName":"/api/v1/netweb/Gettotalreport","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamReportAllSuccessCallBack, '正在加载数据...');
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_TRA(minNum,minType,maxNum,maxType){
    selDateTRAStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateTRAEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 * 查询下级统计方法回调函数
 */
function teamReportAllSuccessCallBack(data) {
	if (data.Code == 200) {
		$("#charge_all").html(data.Data.ReportComm[0].RechargeTotal);
		$("#withdrawal_all").html(data.Data.ReportComm[0].DrawingsTotal);
		$("#buyLottery_all").html(data.Data.ReportComm[0].BuyTotal);
		$("#point_all").html(data.Data.ReportComm[0].RebateTotal);
		$("#prize_all").html(data.Data.ReportComm[0].WinningTotal);
		$("#winTotal_all").html(data.Data.ReportComm[0].GainTotal);
		
		if(data.Data.ReportComm[0].GainTotal < 0){
			$("#winTotal_all").css('color','red');
		}else if(data.Data.ReportComm[0].GainTotal > 0){
			$("#winTotal_all").css('color','green');
		}else{
			$("#winTotal_all").css('color','#FE5D39');
		}
		
		// $("#dailywage_all").html(data.ReportComm[0].DailywageTotal);
		$("#others_all").html(bigNumberUtil.add(data.Data.ReportComm[0].OtherTotal,data.Data.ReportComm[0].DailywageTotal).toString());
	} else {
		toastUtils.showToast(data.Msg);
	}
}