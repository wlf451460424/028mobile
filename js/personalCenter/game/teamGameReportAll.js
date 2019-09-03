//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//第三方游戏平台ID
var gameId;

var selDateGRAStart;
var selDateGRAEnd;

/*进入panel时调用*/
function teamGameReportAllLoadedPanel(){
    catchErrorFun("teamGameReportAllInit();");
}

/*离开panel时调用*/
function teamGameReportAllUnloadedPanel(){
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    $("#teamGameReportAllDataId").empty();
    $("#teamGameReportAllUlId").empty();
    if(selDateGRAStart){
        selDateGRAStart.dismiss();
    }
    if(selDateGRAEnd){
        selDateGRAEnd.dismiss();
    }
}

function teamGameReportAllInit(){
	$("#teamGameReportAllUlId").empty();
    $("#teamGameReportAllDataId").empty();
    var $ReportAllLData=$('<table><tr>' +
        '<td><select name="myGRASearchDate" id="myGRASearchDate" data-theme="a" data-mini="true" onchange="typeChange_teamGameReportAll()">' +
//      '<option value="0" selected="selected">当天时间</option><option value="1">历史时间</option>'+
        '</select></td>' +
        '<td><input type="text" id="selectDateGRA_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateGRA_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="changeGameType_GRA" id="changeGameType_GRA" onchange="changeGameType_GRA();"></select></td></tr></table>');
    $("#teamGameReportAllDataId").append($ReportAllLData);

	//第三方游戏平台类型
	var Arr_ThirdPartyInfo = jsonUtils.toObject(localStorageUtils.getParam("Arr_ThirdPartyInfo"));
	$.each(Arr_ThirdPartyInfo,function (key,val) {
		if(key == 0){
			gameId = val.ThirdpartyValue;
			$("#myGRASearchDate").empty();
	        if(gameId == 2){
	        	$("#myGRASearchDate").append('<option value="1" selected="selected">历史记录</option>');
	        }else{
	        	$("#myGRASearchDate").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	        }
		}
		$("#changeGameType_GRA").append('<option value="'+ val.ThirdpartyValue +'">报表类型：'+ val.ThirdpartyText +'</option>');
	});


    selDateGRAStart = new MobileSelectDate();
    selDateGRAStart.init({trigger:'#selectDateGRA_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateGRAEnd = new MobileSelectDate();
    selDateGRAEnd.init({trigger:'#selectDateGRA_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#selectDateGRA_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateGRA_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateGRA_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateGRA_End").val()+hms59;

	typeChange_teamGameReportAll();
    // searchTotal_teamGameReportAll(startDateTime,endDateTime);
}

///@ 切换游戏类型
function changeGameType_GRA() {
    gameId = $("#changeGameType_GRA").val();
	$("#myGRASearchDate").empty();
    if(gameId == 2){
    	$("#myGRASearchDate").append('<option value="1" selected="selected">历史记录</option>');
    }else{
    	$("#myGRASearchDate").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
    }
    typeChange_teamGameReportAll();
}

function typeChange_teamGameReportAll() {
	gameId = $("#changeGameType_GRA").val();
    var type = $("#myGRASearchDate").val();
    switch(type) {
        case "0":
            //当天记录
            $("#selectDateGRA_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateGRA_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateGRA_Stt").val()+hms00;
            endDateTime = $("#selectDateGRA_End").val()+hms59;
            searchTotal_teamGameReportAll(startDateTime, endDateTime);
            changeDateRange_GRA(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateGRA_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateGRA_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateGRA_Stt").val()+hms00;
            endDateTime = $("#selectDateGRA_End").val()+hms59;
            searchTotal_teamGameReportAll(startDateTime, endDateTime);
            changeDateRange_GRA(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

function searchTotal_teamGameReportAll(startDateTime,endDateTime) {
    var userName = localStorageUtils.getParam("username");
	var myUserID = localStorageUtils.getParam("myUserID");
    ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+ myUserID +'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":0,"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamGameReportAllSuccessCallBack, '正在加载数据...');
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
function teamGameReportAllSuccessCallBack(data) {
    if (data.Code == 200) {
        if(gameId == 1){
	        gameTeamReportAll_QiPai_DX(data.Data);
	    }else if(gameId == 2){
	        gameTeamReportAll_QiPai_KY(data.Data);
        }else if(gameId == 3){
            gameTeamReportAll_Vr(data.Data);
        }else if(gameId == 4){
	        gameTeamReportAll_Ag(data.Data);
        }
    } else {
	    $("#teamGameReportAllUlId").empty();
       	toastUtils.showToast(data.Msg);
    }
}

//@ 大雄 棋牌
function gameTeamReportAll_QiPai_DX(data) {
	$("#teamGameReportAllUlId").empty();
	var $ReportAllLUL=$('<ul class="recordDetail"><li>合 计：<span>- - -</span></li>' +
		'<li>投注金额：<span>'+ Number(data.GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>中奖金额：<span>'+ Number(data.GameGet.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>房 费：<span>'+ Number(data.RoomFee.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>对战类盈亏：<span>'+ Number(data.PlayIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>电子类盈亏：<span>'+ Number(data.SystemIncome.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#teamGameReportAllUlId").append($ReportAllLUL);

	var colorShow = [5,6];
	$.each(colorShow,function (key,val) {
		var items=$('#teamGameReportAllUlId ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}
//@ 开元 棋牌
function gameTeamReportAll_QiPai_KY(data) {
	$("#teamGameReportAllUlId").empty();
	var $ReportAllLUL=$('<ul class="recordDetail"><li>合 计：<span>- - -</span></li>' +
		'<li>游戏消费：<span>'+ Number(data.GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#teamGameReportAllUlId").append($ReportAllLUL);
	
	var items=$('#teamGameReportAllUlId ul li:eq(3) span');
	if(items[0].innerHTML < 0){
		items.css('color','red');
	}else if(items[0].innerHTML > 0){
		items.css('color','green');
	}else{
		items.css('color','#FE5D39');
	}
}

//@ vr 类
function gameTeamReportAll_Vr(data) {
	$("#teamGameReportAllUlId").empty();
	var $ReportAllLUL=$('<ul class="recordDetail"><li>合 计：<span>- - -</span></li>' +
		'<li>投注金额：<span>'+ Number(data.BetMoney) +'</span></li>' +
		'<li>中奖金额：<span>'+ Number(data.WinMoney) +'</span></li>' +
		'<li>其他收入：<span>'+ (data.Dailywage ? Number(data.Dailywage) : 0) +'</span></li>' +
		'<li>打赏金额：<span>'+ Number(data.Rewards) +'</span></li>' +
		'<li>盈	   亏：<span>'+ Number(data.WinLoss) +'</span></li></ul>');
	$("#teamGameReportAllUlId").append($ReportAllLUL);
	
	var items=$('#teamGameReportAllUlId ul li:eq(5) span');
	if(items[0].innerHTML < 0){
		items.css('color','red');
	}else if(items[0].innerHTML > 0){
		items.css('color','green');
	}else{
		items.css('color','#FE5D39');
	}
}

//@ AG
function gameTeamReportAll_Ag(data) {
	$("#teamGameReportAllUlId").empty();
	var $ReportAllLUL=$('<ul class="recordDetail"><li>合 计 ：<span>- - -</span></li>' +
		'<li>总 投 注：<span>'+ Number(data.BetAmount) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount) +'</span></li>' +
		'<li>中奖金额：<span>'+ Number(data.AwardAmount) +'</span></li>' +
		'<li>视讯盈亏：<span>'+ Number(data.SXNetAmount) +'</span></li>' +
		'<li>电子盈亏：<span>'+ Number(data.DZNetAmount) +'</span></li>' +
		'<li>桌面盈亏：<span>'+ Number(data.ZYNetAmount) +'</span></li>' +
		'<li>捕鱼王盈亏：<span>'+ Number(data.BYNetAmount) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>总 盈 亏：<span>'+ Number(data.TotalNetAmount) +'</span></li></ul>');
	$("#teamGameReportAllUlId").append($ReportAllLUL);

	var colorShow = [4,5,6,7,9];
	$.each(colorShow,function (key,val) {
		var items=$('#teamGameReportAllUlId ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}

