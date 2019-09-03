//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//第三方游戏平台ID
var gameId;

var selDateGRSStart;
var selDateGRSEnd;

/*进入panel时调用*/
function teamGameReportSelfLoadedPanel(){
    catchErrorFun("teamGameReportSelfInit();");
}

/*离开panel时调用*/
function teamGameReportSelfUnloadedPanel(){
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    $("#teamGameReportSelfDataId").empty();
    $("#teamGameReportSelfULId").empty();
    if(selDateGRSStart){
        selDateGRSStart.dismiss();
    }
    if(selDateGRSEnd){
        selDateGRSEnd.dismiss();
    }
}

//@ 初始化
function teamGameReportSelfInit(){
    $("#teamGameReportSelfDataId").empty();

    var $ReportSelfLData=$('<table><tr>' +
        '<td><select name="myGRSSearchDate" id="myGRSSearchDate" data-theme="a" data-mini="true" onchange="typeChange_teamGameReportSelf()">' +
//      '<option value="0" selected="selected">当天时间</option><option value="1">历史时间</option>'+
        '</select></td>' +
        '<td><input type="text" id="selectDateGRS_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateGRS_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="changeGameType_GRS" id="changeGameType_GRS" onchange="changeGameType_GRS();"></select></td></tr></table>');
    $("#teamGameReportSelfDataId").append($ReportSelfLData);

    //第三方游戏平台类型
    var Arr_ThirdPartyInfo = jsonUtils.toObject(localStorageUtils.getParam("Arr_ThirdPartyInfo"));
	$.each(Arr_ThirdPartyInfo,function (key,val) {
		if(key == 0){
			gameId = val.ThirdpartyValue;
			$("#myGRSSearchDate").empty();
	        if(gameId == 2){
	        	$("#myGRSSearchDate").append('<option value="1" selected="selected">历史记录</option>');
	        }else{
	        	$("#myGRSSearchDate").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	        }
		}
		$("#changeGameType_GRS").append('<option value="'+ val.ThirdpartyValue +'">报表类型：'+ val.ThirdpartyText +'</option>');
	});
    
    selDateGRSStart = new MobileSelectDate();
    selDateGRSStart.init({trigger:'#selectDateGRS_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateGRSEnd = new MobileSelectDate();
    selDateGRSEnd.init({trigger:'#selectDateGRS_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    $("#selectDateGRS_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateGRS_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateGRS_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateGRS_End").val()+hms59;

	typeChange_teamGameReportSelf();
    // searchTotal_teamGameReportSelf(startDateTime,endDateTime);
}

///@ 切换游戏类型
function changeGameType_GRS() {
    gameId = $("#changeGameType_GRS").val();
	$("#myGRSSearchDate").empty();
    if(gameId == 2){
    	$("#myGRSSearchDate").append('<option value="1" selected="selected">历史记录</option>');
    }else{
    	$("#myGRSSearchDate").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
    }
    typeChange_teamGameReportSelf();
}

//@ 切换当前和历史记录
function typeChange_teamGameReportSelf() {
    var type = $("#myGRSSearchDate").val();
	gameId = $("#changeGameType_GRS").val();
    switch(type) {
        case "0":
            //当天记录
            $("#selectDateGRS_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateGRS_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateGRS_Stt").val()+hms00;
            endDateTime = $("#selectDateGRS_End").val()+hms59;
            searchTotal_teamGameReportSelf(startDateTime, endDateTime);
            changeDateRange_GRS(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateGRS_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateGRS_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateGRS_Stt").val()+hms00;
            endDateTime = $("#selectDateGRS_End").val()+hms59;
            searchTotal_teamGameReportSelf(startDateTime, endDateTime);
            changeDateRange_GRS(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

function searchTotal_teamGameReportSelf(startDateTime,endDateTime) {
    var userName = localStorageUtils.getParam("username");
    var myUserID = localStorageUtils.getParam("myUserID");
    ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+ myUserID +'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":"1","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamGameReportSelfSuccessCallBack, '正在加载数据...');
}

//@  切换当前记录或者历史记录时。
function changeDateRange_GRS(minNum,minType,maxNum,maxType){
    selDateGRSStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateGRSEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//@ 查询下级统计方法回调函数
function teamGameReportSelfSuccessCallBack(data) {
    if (data.Code == 200) {
        if(gameId == 1){
            teamGameReportSelf_QiPai_DX(data.Data);
        }else if(gameId == 2){
        	teamGameReportSelf_QiPai_KY(data.Data);
        }else if(gameId == 3){
            teamGameReportSelf_Vr(data.Data);
        }else if(gameId == 4){
	        teamGameReportSelf_Ag(data.Data);
        }
    } else {
	    $("#teamGameReportSelfULId").empty();
        toastUtils.showToast(data.Msg);
    }
}

//@ 大雄 棋牌
function teamGameReportSelf_QiPai_DX(data) {
	$("#teamGameReportSelfULId").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="game_username">'+ data.UserName +'</span></li>' +
		'<li>投注金额：<span>'+ Number(data.GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>中奖金额：<span>'+ Number(data.GameGet.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>房费：<span>'+ Number(data.RoomFee.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>对战类盈亏：<span>'+ Number(data.PlayIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>电子类盈亏：<span>'+ Number(data.SystemIncome.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#teamGameReportSelfULId").append($SelfUL);

	var colorShow = [5,6];
	$.each(colorShow,function (key,val) {
		var items=$('#teamGameReportSelfULId ul li:eq('+ val +') span');
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
function teamGameReportSelf_QiPai_KY(data) {
	$("#teamGameReportSelfULId").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="game_username">'+ data.UserName +'</span></li>' +
		'<li>投注金额：<span>'+ Number(data.GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#teamGameReportSelfULId").append($SelfUL);
	
	var items=$('#teamGameReportSelfULId ul li:eq(3) span');
	if(items[0].innerHTML < 0){
		items.css('color','red');
	}else if(items[0].innerHTML > 0){
		items.css('color','green');
	}else{
		items.css('color','#FE5D39');
	}
}

//@ VR 类
function teamGameReportSelf_Vr(data) {
	$("#teamGameReportSelfULId").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="personal_UserName">'+ data.UserName +'</span></li>' +
		'<li>投注金额：<span>'+ Number(data.BetMoney) +'</span></li>' +
		'<li>中奖金额：<span>'+ Number(data.WinMoney) +'</span></li>' +
		'<li>其他收入：<span>'+ (data.Dailywage ? Number(data.Dailywage) : 0) +'</span></li>' +
		'<li>打赏金额：<span>'+ Number(data.Rewards) +'</span></li>' +
		'<li>盈	   亏：<span>'+ Number(data.WinLoss) +'</span></li></ul>');
	$("#teamGameReportSelfULId").append($SelfUL);
	
	var items=$('#teamGameReportSelfULId ul li:eq(5) span');
	if(items[0].innerHTML < 0){
		items.css('color','red');
	}else if(items[0].innerHTML > 0){
		items.css('color','green');
	}else{
		items.css('color','#FE5D39');
	}
}

//@ AG
function teamGameReportSelf_Ag(data) {
	$("#teamGameReportSelfULId").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="personal_UserName">'+ data.UserName +'</span></li>' +
		'<li>总 投 注：<span>'+ Number(data.BetAmount) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount) +'</span></li>' +
		'<li>中奖金额：<span>'+ Number(data.AwardAmount) +'</span></li>' +
		'<li>视讯盈亏：<span>'+ Number(data.SXNetAmount) +'</span></li>' +
		'<li>电子盈亏：<span>'+ Number(data.DZNetAmount) +'</span></li>' +
		'<li>桌面盈亏：<span>'+ Number(data.ZYNetAmount) +'</span></li>' +
		'<li>捕鱼王盈亏：<span>'+ Number(data.BYNetAmount) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>总 盈 亏：<span>'+ Number(data.TotalNetAmount) +'</span></li></ul>');
	$("#teamGameReportSelfULId").append($SelfUL);

	var colorShow = [4,5,6,7,9];
	$.each(colorShow,function (key,val) {
		var items=$('#teamGameReportSelfULId ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}