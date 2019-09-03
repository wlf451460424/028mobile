//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";

var selDateGRSStart;
var selDateGRSEnd;

/*进入panel时调用*/
function teamPersonalReportSelfLoadedPanel(){
    catchErrorFun("teamPersonalReportSelfInit();");
}

/*离开panel时调用*/
function teamPersonalReportSelfUnloadedPanel(){
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    $("#teamPersonalReportSelfDataId").empty();
    $("#teamPersonalReportSelfULId").empty();
    if(selDateGRSStart){
        selDateGRSStart.dismiss();
    }
    if(selDateGRSEnd){
        selDateGRSEnd.dismiss();
    }
}

//@ 初始化
function teamPersonalReportSelfInit(){
    $("#teamPersonalReportSelfDataId").empty();
    $("#teamPersonalReportSelfULId").empty();

    var $ReportSelfLData=$('<table><tr>' +
        '<td><select name="myGRSSearchDate" id="myGRSSearchDate" data-theme="a" data-mini="true" onchange="typeChange_teamPersonalReportSelf()">' +
        '<option value="0" selected="selected">当天时间</option><option value="1">历史时间</option></select></td>' +
        '<td><input type="text" id="vr_selectDateGRS_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateGRS_End" readonly/></td></tr></table>');
    $("#teamPersonalReportSelfDataId").append($ReportSelfLData);

    var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="personal_UserName"></span></li>' +
        '<li>投注金额：<span id="personal_BetMoney_self"></span></li>' +
        '<li>中奖金额：<span id="personal_WinMoney_self"></span></li>' +
        '<li>其他收入：<span id="personal_dailyWage_self"></span></li>' +
        '<li>打赏金额：<span id="personal_Rewards_self"></span></li>' +
        '<li>盈	   亏：<span id="personal_WinLoss_self"></span></li>');
    $("#teamPersonalReportSelfULId").append($SelfUL);

    selDateGRSStart = new MobileSelectDate();
    selDateGRSStart.init({trigger:'#vr_selectDateGRS_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateGRSEnd = new MobileSelectDate();
    selDateGRSEnd.init({trigger:'#selectDateGRS_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#vr_selectDateGRS_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateGRS_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#vr_selectDateGRS_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateGRS_End").val()+hms59;
    searchTotal_teamPersonalReportSel(startDateTime,endDateTime);
}

//@ 切换当前和历史记录
function typeChange_teamPersonalReportSelf() {
    var type = $("#myGRSSearchDate").val();
    switch(type) {
        case "0":
            //当天记录
            $("#vr_selectDateGRS_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateGRS_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#vr_selectDateGRS_Stt").val()+hms00;
            endDateTime = $("#selectDateGRS_End").val()+hms59;
            searchTotal_teamPersonalReportSel(startDateTime, endDateTime);
            changeDateRange_GRS(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#vr_selectDateGRS_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateGRS_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#vr_selectDateGRS_Stt").val()+hms00;
            endDateTime = $("#selectDateGRS_End").val()+hms59;
            searchTotal_teamPersonalReportSel(startDateTime, endDateTime);
            changeDateRange_GRS(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

function searchTotal_teamPersonalReportSel(startDateTime,endDateTime) {
    var myUserID = localStorageUtils.getParam("myUserID");

    ajaxUtil.ajaxByAsyncPost(null, '{"UserID":"'+ myUserID +'","ProjectPublic_PlatformCode":2,"ISself":"1","InterfaceName":"/api/v1/netweb/VRGetTeamRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamPersonalReportSelfSuccessCallBack, '正在加载数据...');
}

//@  切换当前记录或者历史记录时。
function changeDateRange_GRS(minNum,minType,maxNum,maxType){
    selDateGRSStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateGRSEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//@ 查询下级统计方法回调函数
function teamPersonalReportSelfSuccessCallBack(data) {
	if (data.Code == 200) {
		$("#personal_UserName").html(data.Data.UserName);
        $("#personal_BetMoney_self").html(Number(data.Data.BetMoney.toFixed(3).slice(0,-1)));
        $("#personal_WinMoney_self").html(Number(data.Data.WinMoney.toFixed(3).slice(0,-1)));
        $("#personal_dailyWage_self").html(data.Data.Dailywage ? Number(data.Data.Dailywage.toFixed(3).slice(0,-1)) : 0);
        $("#personal_WinLoss_self").html(Number(data.Data.WinLoss.toFixed(3).slice(0,-1)));
        $("#personal_Rewards_self").html(Number(data.Data.Rewards.toFixed(3).slice(0,-1)));
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}