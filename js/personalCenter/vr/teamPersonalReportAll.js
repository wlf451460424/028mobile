//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";

var selDateGRAStart;
var selDateGRAEnd;

/*进入panel时调用*/
function teamPersonalReportAllLoadedPanel(){
    catchErrorFun("teamPersonalReportAllInit();");
}
/*离开panel时调用*/
function teamPersonalReportAllUnloadedPanel(){
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    $("#teamPersonalReportAllDataId").empty();
    $("#teamPersonalReportAllUlId").empty();
    if(selDateGRAStart){
        selDateGRAStart.dismiss();
    }
    if(selDateGRAEnd){
        selDateGRAEnd.dismiss();
    }
}

function teamPersonalReportAllInit(){
    $("#teamPersonalReportAllDataId").empty();
    var $ReportAllLData=$('<table><tr>' +
        '<td><select name="myGRASearchDate" id="myGRASearchDate" data-theme="a" data-mini="true" onchange="typeChange_teamPersonalReportAll()">' +
        '<option value="0" selected="selected">当天时间</option><option value="1">历史时间</option></select></td>' +
        '<td><input type="text" id="vr_selectDateGRA_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateGRA_End" readonly/></td></tr></table>');
    $("#teamPersonalReportAllDataId").append($ReportAllLData);

    $("#teamPersonalReportAllUlId").empty();
    var $ReportAllLUL=$('<ul class="recordDetail"><li>合 计：<span>- - -</span></li>' +
        '<li>投注金额：<span id="personal_BetMoney_all"></span></li>' +
        '<li>中奖金额：<span id="personal_WinMoney_all"></span></li>' +
        '<li>其他收入：<span id="personal_dailyWage_all"></span></li>' +
        '<li>打赏金额：<span id="personal_Rewards_all"></span></li>' +
        '<li>盈	   亏：<span id="personal_WinLoss_all"></span></li>');
    $("#teamPersonalReportAllUlId").append($ReportAllLUL);

    selDateGRAStart = new MobileSelectDate();
    selDateGRAStart.init({trigger:'#vr_selectDateGRA_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateGRAEnd = new MobileSelectDate();
    selDateGRAEnd.init({trigger:'#selectDateGRA_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#vr_selectDateGRA_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateGRA_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#vr_selectDateGRA_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateGRA_End").val()+hms59;

    searchTotal_teamPersonalReportAll(startDateTime,endDateTime);
}

function typeChange_teamPersonalReportAll() {
    var type = $("#myGRASearchDate").val();
    switch(type) {
        case "0":
            //当天记录
            $("#vr_selectDateGRA_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateGRA_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#vr_selectDateGRA_Stt").val()+hms00;
            endDateTime = $("#selectDateGRA_End").val()+hms59;
            searchTotal_teamPersonalReportAll(startDateTime, endDateTime);
            changeDateRange_GRA(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#vr_selectDateGRA_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateGRA_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#vr_selectDateGRA_Stt").val()+hms00;
            endDateTime = $("#selectDateGRA_End").val()+hms59;
            searchTotal_teamPersonalReportAll(startDateTime, endDateTime);
            changeDateRange_GRA(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

function searchTotal_teamPersonalReportAll(startDateTime,endDateTime) {
//  var myUserID = localStorageUtils.getParam("myUserID");
    var myUserID = -1;

    ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'","ISself":0,"InterfaceName":"/api/v1/netweb/VRGetTeamRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamPersonalReportAllSuccessCallBack, '正在加载数据...');
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_GRA(minNum,minType,maxNum,maxType){
    selDateGRAStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateGRAEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 * 查询下级统计方法回调函数
 */
function teamPersonalReportAllSuccessCallBack(data) {
	if (data.Code == 200) {
		$("#personal_BetMoney_all").html(Number(data.Data.BetMoney.toFixed(3).slice(0,-1)));
        $("#personal_WinMoney_all").html(Number(data.Data.WinMoney.toFixed(3).slice(0,-1)));
        $("#personal_dailyWage_all").html(data.Data.Dailywage ? Number(data.Data.Dailywage.toFixed(3).slice(0,-1)) : 0);
        $("#personal_WinLoss_all").html(Number(data.Data.WinLoss.toFixed(3).slice(0,-1)));
        $("#personal_Rewards_all").html(Number(data.Data.Rewards.toFixed(3).slice(0,-1)));
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}