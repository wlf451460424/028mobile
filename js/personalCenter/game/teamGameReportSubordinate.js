//页大小
var PAGESIZE_teamGameReportSubordinate = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//下级类型
var type = 0;
//用户id
var uid = "";
var queryName="";
//第三方游戏平台ID
var gameId;

var selDateGRSubStart;
var selDateGRSubEnd;

/*进入panel时调用*/
function teamGameReportSubordinateLoadedPanel(){
    catchErrorFun("teamGameReportSubordinateInit();");
}

/*离开panel时调用*/
function teamGameReportSubordinateUnloadedPanel(){
    $("#teamGameReportSubordinateList").empty();
    localStorageUtils.removeParam("gameSubordinateId");
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    type = 0;
    page = 0;
    uid = "";
    queryName = "";
    userName = "";
    if(selDateGRSubStart){
        selDateGRSubStart.dismiss();
    }
    if(selDateGRSubEnd){
        selDateGRSubEnd.dismiss();
    }
}

function teamGameReportSubordinateInit(){
    $("#selectteamGameReportSubordinateID").empty();
    var $select=$('<table><tr>' +
        '<td><select name="searchDate_teamGameReportSub" id="searchDate_teamGameReportSub" data-theme="a" data-mini="true" onchange="dateChange_teamGameReportSubordinate()">'+
//      '<option value="0" selected="selected">当天时间</option><option value="1">历史时间</option>'+
        '</select></td>' +
        '<td><input type="text" id="selectDateGRSub_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateGRSub_End" readonly/></td></tr></table>' +
        '<table><tr><td><select name="searchType_teamGameReportSub" id="searchType_teamGameReportSub" data-theme="a" data-mini="true" onchange="typeChange_teamGameReportSubordinate()"><option value="0" selected="selected">下级类型：全部</option><option value="1">下级类型：会员</option><option value="2">下级类型：代理</option></select></td>' +
        '<td><select id="changeGameType_GRSub" onchange="typeChange_teamGameReportSubordinate();"></select></td></tr></table>');
    $("#selectteamGameReportSubordinateID").append($select);

	//第三方游戏平台类型
	var Arr_ThirdPartyInfo = jsonUtils.toObject(localStorageUtils.getParam("Arr_ThirdPartyInfo"));
	$.each(Arr_ThirdPartyInfo,function (key,val) {
		if(key == 0){
			gameId = val.ThirdpartyValue;
			$("#searchDate_teamGameReportSub").empty();
	        if(gameId == 2){
	        	$("#searchDate_teamGameReportSub").append('<option value="1" selected="selected">历史记录</option>');
	        }else{
	        	$("#searchDate_teamGameReportSub").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	        }
		}
		$("#changeGameType_GRSub").append('<option value="'+ val.ThirdpartyValue +'">报表类型：'+ val.ThirdpartyText +'</option>');
	});

    selDateGRSubStart = new MobileSelectDate();
    selDateGRSubStart.init({trigger:'#selectDateGRSub_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateGRSubEnd = new MobileSelectDate();
    selDateGRSubEnd.init({trigger:'#selectDateGRSub_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    uid = localStorageUtils.getParam("gameSubordinateId");
    if(uid == null){
        uid = localStorageUtils.getParam("myUserID");
    }
    type = 0;
    page = 0;
    hasMorePage = true;//默认还有分页
    var _myScroller =  $("#teamGameReportSubordinateScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'teamGameReportSubordinateList','getSearchteamGameReportSubordinate()');

    //进入时加载
    loadBySearchteamGameReportSubordinate();
	// dateChange_teamGameReportSubordinate();

    //返回
    $("#teamGameReportSubordinateBackId").unbind('click');
    $("#teamGameReportSubordinateBackId").bind('click', function(event) {
        onBackKeyDown();
        setPanelBackPage_Fun('gameReport');
    });

    /**
     * 团队充值查询
     */
    $("#queryteamGameReportSubordinateButtonID").unbind('click');
    $("#queryteamGameReportSubordinateButtonID").bind('click', function(event) {
        $.ui.popup({
            title:"下级统计查询",
            message:'<input type="text" id="teamGameReportSubordinateUserNameId" maxLength="25"  placeholder="请输入要查找的用户名" />',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var searchUser = $("#teamGameReportSubordinateUserNameId").val();
                    var temp = localStorageUtils.getParam("myUserID");
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                        return;
                    }
                    if(uid != temp){
                        toastUtils.showToast("下级代理不支持用户名搜索");
                        return;
                    }
                    queryteamGameReportSubordinateUserNameIdUserName(searchUser);
                },
            cancelOnly:false
        });
    });
}

function getSearchteamGameReportSubordinate(){
    searchteamGameReportSubordinate_Record(startDateTime, endDateTime, type)
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_teamGameReportSubordinate() {
	var searchConditions = {};
	searchConditions.time =  $("#searchDate_teamGameReportSub").val();
	searchConditions.type =  $("#searchType_teamGameReportSub").val();
	searchConditions.thirdPartyType =  $("#changeGameType_GRSub").val();
	searchConditions.dateStt =  $("#selectDateGRSub_Stt").val();
	searchConditions.dateEnd =  $("#selectDateGRSub_End").val();
	searchConditions.isDetail =  true;
	saveSearchTerm(searchConditions);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchteamGameReportSubordinate() {
    var conditions = getSearchTerm();
    if (null != conditions) {

	    $("#searchDate_teamGameReportSub").empty();
	    if(gameId == 2){
		    $("#searchDate_teamGameReportSub").append('<option value="1" selected="selected">历史记录</option>');
	    }else{
		    $("#searchDate_teamGameReportSub").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	    }

        var dataOptions = document.getElementById('searchDate_teamGameReportSub').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }
        var typeOptions = document.getElementById('searchType_teamGameReportSub').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }
        
        var gameOptions = document.getElementById('changeGameType_GRSub').options;
        for (var i = 0; i < gameOptions.length; i++) {
	        gameOptions[i].selected = false;
            if (gameOptions[i].value == conditions.thirdPartyType) {
	            gameOptions[i].selected = true;
                gameId = conditions.thirdPartyType;
            }
        }

        type = $("#searchType_teamGameReportSub").val();
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#selectDateGRSub_Stt").val(conditions.dateStt);
        $("#selectDateGRSub_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_GRSub(0,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_GRSub(-DayRange_3month,"day",-1,"day");     //Controller
                break;
        }

        //根据查询条件查询数据
        searchteamGameReportSubordinate(startDateTime, endDateTime, type);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
    } else {
        initTeamGameReportSubPage();
    }
}

function initTeamGameReportSubPage() {
    type = 0;
    $("#selectDateGRSub_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateGRSub_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateGRSub_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateGRSub_End").val()+hms59;
    searchteamGameReportSubordinate(startDateTime, endDateTime, type);
}

//类型改变事件,第三方游戏类型改变事件
function typeChange_teamGameReportSubordinate() {
	gameId = $("#changeGameType_GRSub").val();
	var selectedOptions = $("#searchDate_teamGameReportSub").val();

    $("#searchDate_teamGameReportSub").empty();
    if(gameId == 2){
    	$("#searchDate_teamGameReportSub").append('<option value="1" selected="selected">历史记录</option>');
    }else{
    	if(selectedOptions == "0"){
		    $("#searchDate_teamGameReportSub").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	    }else {
		    $("#searchDate_teamGameReportSub").append('<option value="0">当天记录</option><option selected="selected" value="1">历史记录</option>');
	    }
    }
    dateChange_teamGameReportSubordinate();
}

//日期改变事件
function dateChange_teamGameReportSubordinate() {
    var timeType = $("#searchDate_teamGameReportSub").val();
    type = $("#searchType_teamGameReportSub").val();
    switch(timeType) {
        case "0":
            //当天记录
            $("#selectDateGRSub_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateGRSub_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateGRSub_Stt").val()+hms00;
            endDateTime = $("#selectDateGRSub_End").val()+hms59;
            searchteamGameReportSubordinate(startDateTime, endDateTime,type);
            changeDateRange_GRSub(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateGRSub_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateGRSub_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateGRSub_Stt").val()+hms00;
            endDateTime = $("#selectDateGRSub_End").val()+hms59;
            searchteamGameReportSubordinate(startDateTime, endDateTime,type);
            changeDateRange_GRSub(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_GRSub(minNum,minType,maxNum,maxType){
    selDateGRSubStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateGRSubEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 *查询团队下级记录 下一页
 */
function searchteamGameReportSubordinate_Record(startDateTime, endDateTime, type) {
    var temp = localStorageUtils.getParam("myUserID");
    if(uid != temp){//下级
        ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","GetUserType":0,"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamGameReportSubordinate + '}', teamGameReportSubordinate_searchSuccessCallBack, '正在加载数据...');
    }else{
        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"","User_ID":"'+uid+'","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamGameReportSubordinate + '}', teamGameReportSubordinate_searchSuccessCallBack, '正在加载数据...');
    }
}

/**
 *查询团队下级记录
 */
function searchteamGameReportSubordinate(startDateTime, endDateTime, type) {
    page=0;
    var temp = localStorageUtils.getParam("myUserID");
    if(uid != temp){//下级
        ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","GetUserType":0,"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamGameReportSubordinate + '}', teamGameReportSubordinate_searchSuccessCallBack, '正在加载数据...');
    }else{
        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"","User_ID":"'+uid+'","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamGameReportSubordinate + '}', teamGameReportSubordinate_searchSuccessCallBack, '正在加载数据...');
    }
}

function teamGameReportSubordinate_searchSuccessCallBack(data){
    if (page == 0) {
        $("#teamGameReportSubordinateList").empty();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount !=0) {
	        if(gameId == 1 ){
	            teamGameReportSub_QiPai_DX(data.Data)
	        }else if(gameId == 2){
	            teamGameReportSub_QiPai_KY(data.Data)
	        }else if(gameId == 3){
	            teamGameReportSub_Vr(data.Data);
	        }else if(gameId == 4){
		        teamGameReportSub_Ag(data.Data);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

// 团队报表-下级-大雄
function teamGameReportSub_QiPai_DX(data) {
	var info = data.ReportComm;
	isHasMorePage(info,PAGESIZE_teamGameReportSubordinate);
	for (var i = 0; i < info.length; i++) {
		var dataSet = {};
		//用户名
		dataSet.userName = info[i].UserName;
		//投注金额
		dataSet.GamePay = info[i].GamePay.toFixed(3).slice(0,-1);
		//中奖金额
		dataSet.GameGet = info[i].GameGet.toFixed(3).slice(0,-1);
		//uid
		dataSet.userId = info[i].UserID;
		//ChildNum
		dataSet.ChildNum = info[i].ChildNum;
		//用户类型
		if ((parseInt(info[i].Category) & 64) == 64) {
			dataSet.category = "会员";
		} else {
			dataSet.category = "代理";
		}
		//房费
		dataSet.RoomFee = info[i].RoomFee.toFixed(3).slice(0,-1);
		//盈亏
		dataSet.PL = info[i].PL.toFixed(3).slice(0,-1);
		//对战类盈亏
		dataSet.PlayIncome = info[i].PlayIncome.toFixed(3).slice(0,-1);
		//电子类盈亏
		dataSet.SystemIncome = info[i].SystemIncome.toFixed(3).slice(0,-1);
		//其他收入
		dataSet.OtherMoney = info[i].OtherMoney?info[i].OtherMoney:0;

		var $itemLi = $('<li></li>').data('teamGameReportSubordinate',dataSet);
		$itemLi.on('click',function() {
			onItemClickListener_teamGameReportSubordinate();
			localStorageUtils.setParam("teamGameReportSubordinate",JSON.stringify($(this).data('teamGameReportSubordinate')));
			setPanelBackPage_Fun('teamGameReportSubordinateDetail');
		});
		$itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名：' + dataSet.userName + '</dd><dd>类型：'+dataSet.category+'</dd><dd>投注金额：'+ Number(dataSet.GamePay) +'</dd><dd>中奖金额：'+ Number(dataSet.GameGet) +'</dd></dl></a>');
		$("#teamGameReportSubordinateList").append($itemLi);
	}
}

// 团队报表-下级-开元棋牌
function teamGameReportSub_QiPai_KY(data) {
	var info = data.ReportComm;
	isHasMorePage(info,PAGESIZE_teamGameReportSubordinate);
	for (var i = 0; i < info.length; i++) {
		var dataSet = {};
		//用户名
		dataSet.userName = info[i].UserName;
		//投注金额
		dataSet.GamePay = info[i].GamePay.toFixed(3).slice(0,-1);
		//中奖金额
		dataSet.GameGet = info[i].GameGet.toFixed(3).slice(0,-1);
		//uid
		dataSet.userId = info[i].UserID;
		//ChildNum
		dataSet.ChildNum = info[i].ChildNum;
		//用户类型
		if ((parseInt(info[i].Category) & 64) == 64) {
			dataSet.category = "会员";
		} else {
			dataSet.category = "代理";
		}
		//房费
		dataSet.RoomFee = info[i].RoomFee.toFixed(3).slice(0,-1);
		//盈亏
		dataSet.PL = info[i].PL.toFixed(3).slice(0,-1);
		//其他收入
		dataSet.OtherMoney = info[i].OtherMoney?info[i].OtherMoney:0;

		var $itemLi = $('<li></li>').data('teamGameReportSubordinate',dataSet);
		$itemLi.on('click',function() {
			onItemClickListener_teamGameReportSubordinate();
			localStorageUtils.setParam("teamGameReportSubordinate",JSON.stringify($(this).data('teamGameReportSubordinate')));
			setPanelBackPage_Fun('teamGameReportSubordinateDetail');
		});
		$itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名：' + dataSet.userName + '</dd><dd>类型：'+dataSet.category+'</dd><dd>游戏消费：'+ Number(dataSet.GamePay) +'</dd><dd>盈亏：'+ Number(dataSet.PL) +'</dd></dl></a>');
		$("#teamGameReportSubordinateList").append($itemLi);
	}
}

//团队报表-下级-VR
function teamGameReportSub_Vr(data) {
	var info = data.VRRPtlist;
	isHasMorePage(info,PAGESIZE_teamGameReportSubordinate);
	for (var i = 0; i < info.length; i++) {
		var dataSet = {};
		//用户名
		dataSet.userName = info[i].UserName;
		//投注金额
		dataSet.PersonalPay = info[i].betmoney;
		//中奖金额
		dataSet.PersonalGet = info[i].winmoney;
		//uid
		dataSet.userId = info[i].UserID;
		//ChildNum
		dataSet.ChildNum = info[i].ChildNum;
		//用户类型
		if ((parseInt(info[i].Category) & 64) == 64) {
			dataSet.category = "会员";
		} else {
			dataSet.category = "代理";
		}
		//打赏金额
		dataSet.Rewards = info[i].Rewards;
		//盈亏
		dataSet.winloss = info[i].winloss;
		//其他收入
		dataSet.Dailywage = info[i].Dailywage;

		var $itemLi = $('<li></li>').data('teamGameReportSubordinate',dataSet);
		$itemLi.on('click',function() {
			onItemClickListener_teamGameReportSubordinate();
			localStorageUtils.setParam("teamGameReportSubordinate",JSON.stringify($(this).data('teamGameReportSubordinate')));
			setPanelBackPage_Fun('teamGameReportSubordinateDetail');
		});
		$itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名：' + dataSet.userName + '</dd><dd>类型：'+dataSet.category+'</dd><dd>投注金额：' + dataSet.PersonalPay +'</dd><dd>中奖金额：' + dataSet.PersonalGet +'</dd></dl></a>');
		$("#teamGameReportSubordinateList").append($itemLi);
	}
}

// 团队报表-下级-AG
function teamGameReportSub_Ag(data) {
	var info = data.ReportComm;
	isHasMorePage(info,PAGESIZE_teamGameReportSubordinate);
	for (var i = 0; i < info.length; i++) {
		var dataSet = {};
		//用户名
		dataSet.userName = info[i].UserName;
		//uid
		dataSet.userId = info[i].UserID;
		//用户类型
		if ((parseInt(info[i].Category) & 64) == 64) {
			dataSet.category = "会员";
		} else {
			dataSet.category = "代理";
		}

		dataSet.ChildNum = info[i].ChildNum;  	//ChildNum
		dataSet.GamePay = info[i].BetAmount.toFixed(3).slice(0,-1);  //总投注
		dataSet.GameGet = info[i].AwardAmount.toFixed(3).slice(0,-1);  //中奖金额
		dataSet.ValidBetAmount = info[i].ValidBetAmount.toFixed(3).slice(0,-1);  //有效投注
		dataSet.SXNetAmount = info[i].SXNetAmount.toFixed(3).slice(0,-1);  //视讯盈亏
		dataSet.DZNetAmount = info[i].DZNetAmount.toFixed(3).slice(0,-1);  //电子盈亏
		dataSet.ZYNetAmount = info[i].ZYNetAmount.toFixed(3).slice(0,-1);  //桌面盈亏
		dataSet.BYNetAmount = info[i].BYNetAmount.toFixed(3).slice(0,-1);  //捕鱼王盈亏
		dataSet.TotalNetAmount = info[i].TotalNetAmount.toFixed(3).slice(0,-1);  //	总盈亏
		//其他收入
		dataSet.OtherMoney = info[i].OtherMoney?info[i].OtherMoney:0;

		var $itemLi = $('<li></li>').data('teamGameReportSubordinate',dataSet);
		$itemLi.on('click',function() {
			onItemClickListener_teamGameReportSubordinate();
			localStorageUtils.setParam("teamGameReportSubordinate",JSON.stringify($(this).data('teamGameReportSubordinate')));
			setPanelBackPage_Fun('teamGameReportSubordinateDetail');
		});
		$itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名：' + dataSet.userName + '</dd><dd>类型：'+dataSet.category+'</dd><dd>总投注：'+ Number(dataSet.GamePay) +'</dd><dd>总盈亏：'+ Number(dataSet.TotalNetAmount) +'</dd></dl></a>');
		$("#teamGameReportSubordinateList").append($itemLi);
	}
}

//根据用户名查找
function queryteamGameReportSubordinateUserNameIdUserName(searchUser){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","UserName":"' + searchUser + '","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamGameReportSubordinate + '}',
    teamGameReportSubordinate_searchSuccessCallBack, '正在加载数据...');
}

function onBackKeyDown(){
    clearSearchTerm();
    var temp = localStorageUtils.getParam("myUserID");
    localStorageUtils.setParam("gameSubordinateId", temp);
}