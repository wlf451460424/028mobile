//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var page=0;
var PAGESIZE_personalReport=30;

var selDateGPRStart;
var selDateGPREnd;

/*进入panel时调用*/
function personalPersonalReportLoadedPanel(){
    catchErrorFun("personalPersonalReportInit();");
}
/*离开panel时调用*/
function personalPersonalReportUnloadedPanel(){
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    $("#personalPersonalReportDate").empty();
    $("#personalPersonalReportContent").empty();
    if(selDateGPRStart){
        selDateGPRStart.dismiss();
    }
    if(selDateGPREnd){
        selDateGPREnd.dismiss();
    }
}

function personalPersonalReportInit(){
    $("#selectType_personalPersonalReport").empty();

    var $selectType_personalPersonalReport = $('<select name="personalPersonalReportSearchType" id="personalPersonalReportSearchType" data-theme="a" data-mini="true" onchange="personalPersonalReportTypeChange()"><option value="0" selected="selected">类型：每日统计</option><option value="1">类型：汇总统计</option></select>');
    $("#selectType_personalPersonalReport").append($selectType_personalPersonalReport);

    $("#personalPersonalReportContent").empty();

    //不要轻易修改时间控件input的ID值！若修改，和mobile-select-data.js中的方法中的字符串要一一对应才可。
    var $select=$('<table><tr><td><select name="personalPersonalReportSearchDate" id="personalPersonalReportSearchDate" data-theme="a" data-mini="true" onchange="dateChangepersonalPersonalReport()"><option value="0" selected="selected">当天记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="vr_selectDatePersonalPersonalReport_Stt" readonly/></td><td><input type="text" id="selectDatePersonalPersonalReport_End" readonly/></td></tr></table>');
    $("#personalPersonalReportDate").append($select);

    //查询开始时间
    selDateGPRStart = new MobileSelectDate();
    selDateGPRStart.init({trigger:'#vr_selectDatePersonalPersonalReport_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateGPREnd = new MobileSelectDate();
    selDateGPREnd.init({trigger:'#selectDatePersonalPersonalReport_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#vr_selectDatePersonalPersonalReport_Stt").val(initDefaultDate(0,"day"));
    $("#selectDatePersonalPersonalReport_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#vr_selectDatePersonalPersonalReport_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDatePersonalPersonalReport_End").val()+hms59;

    page = 0;
    hasMorePage = true;//默认还有分页
    var myScroller_report = $("#personalPersonalReportScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    myScroller_report.scrollToTop();
    myScroller_report.clearInfinite();
    UseScrollerRefresh(myScroller_report,'personalPersonalReportContent','getpersonalPersonalReport()');
    //进入时加载
    searchTotal_personalPersonalReport(startDateTime,endDateTime);
}

function personalPersonalReportTypeChange() {
    startDateTime = $("#vr_selectDatePersonalPersonalReport_Stt").val()+hms00;
    endDateTime = $("#selectDatePersonalPersonalReport_End").val()+hms59;
    searchTotal_personalPersonalReport(startDateTime, endDateTime);
}

function dateChangepersonalPersonalReport() {
    var type = $("#personalPersonalReportSearchDate").val();
    switch(type) {
        case "0":
            //当天记录
            $("#vr_selectDatePersonalPersonalReport_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDatePersonalPersonalReport_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#vr_selectDatePersonalPersonalReport_Stt").val()+hms00;
            endDateTime = $("#selectDatePersonalPersonalReport_End").val()+hms59;
            searchTotal_personalPersonalReport(startDateTime, endDateTime);
            changeDateRange_personalPersonalReport(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#vr_selectDatePersonalPersonalReport_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDatePersonalPersonalReport_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#vr_selectDatePersonalPersonalReport_Stt").val()+hms00;
            endDateTime = $("#selectDatePersonalPersonalReport_End").val()+hms59;
            searchTotal_personalPersonalReport(startDateTime, endDateTime);
            changeDateRange_personalPersonalReport(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_personalPersonalReport(minNum,minType,maxNum,maxType){
    selDateGPRStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateGPREnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/*
 * 下拉页面刷新我的报表记录
 * */
function getpersonalPersonalReport() {
    ajaxUtil.ajaxByAsyncPost(null, '{"UserID":-1,"ProjectPublic_PlatformCode":2,"Type":1,"InterfaceName":"/api/v1/netweb/VRMyRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_personalReport +'}', personalPersonalReportSuccessCallBack, '正在加载数据...');
}

function searchTotal_personalPersonalReport(startDateTime,endDateTime) {
    page=0;
    ajaxUtil.ajaxByAsyncPost(null, '{"UserID":-1,"ProjectPublic_PlatformCode":2,"Type":1,"InterfaceName":"/api/v1/netweb/VRMyRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_personalReport +'}', personalPersonalReportSuccessCallBack, '正在加载数据...');
}

/**
 * 查询个人报表方法回调函数
 */
function personalPersonalReportSuccessCallBack(data) {
	if (data.Code == 200) {
		personalPersonalReportChangeShow(data.Data);
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

/*
 * 显示列表或者统计数据
 */
function personalPersonalReportChangeShow(data) {
	signLoginTips(data);
    var selectedShow = $("#personalPersonalReportSearchType").val();

    if(data.TotalMyRpt && selectedShow == "1") {
        //Total
        $("#personalPersonalReportContent").empty();
        var $totalInfo = $('<ul class="recordDetail"><li>合 计：<span id="personalDate"></span></li><li>投注金额：<span id="personalConsume"></span></li><li>中奖金额：<span id="personalGet"></span></li><li>其他收入：<span id="personalDaily"></span></li><li>打赏金额：<span id="personalHouseFee"></span></li><li>盈 亏：<span id="totalPL"></span></li></ul>');
        $("#personalPersonalReportContent").append($totalInfo);

        // $("#personalDate").html(data.TotalMyRpt[0].HisDate);
        $("#personalDate").html("- - -");
        $("#personalConsume").html(Number(data.TotalMyRpt.BetMoney.toFixed(3).slice(0,-1)));
        $("#personalGet").html(Number(data.TotalMyRpt.WinMoney.toFixed(3).slice(0,-1)));
	    $("#personalDaily").html(data.TotalMyRpt.Dailywage ? Number(data.TotalMyRpt.Dailywage.toFixed(3).slice(0,-1)) : 0);
        $("#personalHouseFee").html(Number(data.TotalMyRpt.Rewards.toFixed(3).slice(0,-1)));
        $("#totalPL").html(Number(data.TotalMyRpt.WinLoss.toFixed(3).slice(0,-1)));
    }
    if(data.TotalMyRpt.length==0 && selectedShow=="1"){
        toastUtils.showToast("没有数据");
    }

    //List
    if(data.MyReportList && selectedShow == "0") {
        $("#personalPersonalReportContent").empty();

        for(var j=0;j<data.MyReportList.length;j++){
            var $liContent=$('<li></li>');
            var reportList=data.MyReportList;
            $liContent.append('<ul class="recordDetail"><li>日 期：<span>'+ reportList[j].HisTime.split(" ")[0]
                +'</span></li><li>投注金额：<span>'+ Number(reportList[j].BetMoney.toFixed(3).slice(0,-1))
                +'</span></li><li>中奖金额：<span >'+ Number(reportList[j].WinMoney.toFixed(3).slice(0,-1))
                +'</span></li><li>其他收入：<span >'+ (reportList[j].Dailywage ? Number(reportList[j].Dailywage.toFixed(3).slice(0,-1)) : 0)
                +'</span></li><li>打赏金额：<span>'+ Number(reportList[j].Rewards.toFixed(3).slice(0,-1))
                +'</span></li><li>盈 亏：<span>'+ Number(reportList[j].WinLoss.toFixed(3).slice(0,-1))
                +'</span></li></ul>');

            $("#personalPersonalReportContent").append($liContent);
        }
    }
    if(data.MyReportList.length==0 && selectedShow =="0" ){
        toastUtils.showToast("没有数据");
    }
}