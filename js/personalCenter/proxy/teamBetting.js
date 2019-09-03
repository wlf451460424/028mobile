/*
 * TeamBetting
 */

//页大小
var PAGESIZE_teamBetting = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//彩种ID
var lotteryType ='""';
//IsHistory 默认false  是否是历史记录
var IsHistory=false;
var selDateTBStart;
var selDateTBEnd;
var orderStatus="-1"; //状态默认全部

/*进入panel时调用*/
function teamBettingLoadedPanel(){
    catchErrorFun("teamBettingRecordsInit();");
}
/*离开panel时调用*/
function teamBettingUnloadedPanel(){
    $("#teamBettingList").empty();
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    IsHistory=false;
    lotteryType ='""';
    orderStatus = "-1";
    if(selDateTBStart){
        selDateTBStart.dismiss();
    }
    if(selDateTBEnd){
        selDateTBEnd.dismiss();
    }
}

function teamBettingRecordsInit(){
    $("#teamBettingSelect").empty();

// <select name="searchDate_teamBetting" id="searchDate_teamBetting" data-theme="a" data-mini="true" onchange="dateChange_teamBetting()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select>

    var $select=$('<table><tr>' +
        '<td><select name="searchType_teamBetting" id="searchType_teamBetting" data-theme="a" data-mini="true" onchange="lotteryChange_teamBetting()"></select></td>' +
        '<td><input type="text" id="selectDateTB_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateTB_End" readonly/></td></tr>' +
        '<tr style="display: none;"><td colspan="3"><select name="searchStatus_teamBetting" id="searchStatus_teamBetting" data-theme="a" data-mini="true" onchange="statusChange_teamBetting()"><option  selected="selected" value="-1">状态：全部</option>'+
        // '<option value="1">状态：购买成功</option>'+
        '<option value="64">状态：购买成功</option>'+
        '<option value="33554432">状态：未中奖</option>'+
        '<option value="16777216">状态：已派奖</option>'+
        '<option value="4">状态：已撤单</option>'+
        '<option value="32768">状态：已撤奖</option>'+
        '</select></td></tr></table>');

    $("#teamBettingSelect").append($select);

    //查询开始时间
    selDateTBStart = new MobileSelectDate();
    selDateTBStart.init({trigger:'#selectDateTB_Stt',min:initDefaultDate(-DayRange_3month,"day"),max:initDefaultDate(0,"day")});
    selDateTBEnd = new MobileSelectDate();
    selDateTBEnd.init({trigger:'#selectDateTB_End',min:initDefaultDate(-DayRange_3month,"day"),max:initDefaultDate(0,"day")});
    userName = localStorageUtils.getParam("username");
    getLotteryType_team();
    page = 0;
    hasMorePage = true; //默认还有分页

    var _teamScroller =  $("#teamBettingScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _teamScroller.scrollToTop();
    _teamScroller.clearInfinite();
    addUseScroller(_teamScroller,'teamBettingList','getTeamBettingRecords()');

    /**
     * 团队投注查询（右上角搜索）
     */
    $("#teamBettingSearchBtn").unbind('click');
    $("#teamBettingSearchBtn").bind('click', function(event) {
        $.ui.popup({
            title:"团队投注查询",
            message:'<input type="text" id="teamBetting_searchByName" maxLength="25"  placeholder="请输入要查找的用户名" />',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var searchUser = $("#teamBetting_searchByName").val();
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                        return;
                    }
                    queryTeamBettingUserName(searchUser);
                },
            cancelOnly:false
        });
    });
}

/********** 查询投注记录 **********/
function getTeamBettingRecords(){
    nextPage_teamBetting(startDateTime, endDateTime, lotteryType);
}

/********** 创建投注记录列表  *********/
function createTeamBettingRecordsList(data){
	$("#teamBetting_noData_tips").hide();
    if (page == 0) {
        $("#teamBettingList").empty();
        $("#teamBettingScroller").scroller().scrollToTop();
        $("#teamBettingScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#teamBetting_noData_tips").show();
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount ==0) {
	    	$("#teamBetting_noData_tips").show();
	      //toastUtils.showToast("没有数据");
	    }
	    if (data.Data.DataCount !=0) {
	        var btInfo = data.Data.BtInfo;
	        localStorageUtils.setParam("sourceFlag", "1");
	        isHasMorePage(btInfo,PAGESIZE_teamBetting);
	        for (var i = 0; i < btInfo.length; i++) {
	            var dataSet = btInfo[i];
	            var scheme = {};
	
	            scheme.userName=dataSet.UserName;  //用户名
	            scheme.tzMoney= parseFloat(dataSet.BetMoney); //投注金额
	            scheme.lotteryType=dataSet.BetTb;  //彩种
	            scheme.tzTime=dataSet.InsertTime; //投注时间
	            scheme.spmoney=dataSet.AwardMoney; //中奖金额
	            scheme.qiHao=dataSet.IssueNumber;  //期号
	            scheme.orderId=dataSet.ChaseOrderID; //追号订单号
	            scheme.bettingorderID=dataSet.OrderID; //订单号
	            scheme.state=dataSet.OrderState;
	            scheme.playType=dataSet.PlayCode;  //玩法
	            scheme.betMode=dataSet.BetMode;  // 投注模式
	            
	            var str = dataSet.BetTb.toString();
                if(str.length >= 3 && str.split("")[0] == "5"){
                	//彩种名称 盘口
                	scheme.lotteryName=hcp_LotteryInfo.getLotteryNameById(dataSet.BetTb.toString());
                }else{
                	scheme.lotteryName=LotteryInfo.getLotteryNameById(dataSet.BetTb.toString());
                }
                
                var str = dataSet.BetTb.toString();
                if(str.length >= 3 && str.split("")[0] == "5"){
                	//玩法名称 盘口
//	                	scheme.PlayName=hcp_LotteryInfo.getPlayMethodName(dataSet.BetTb + "", dataSet.PlayCode + "",dataSet.BetMode);
                	
                	var a = dataSet.BetTb.toString();
                	var b = dataSet.PlayCode.toString();
                	var playId = b.replace(a,"");
                	var tagArr = hcp_LotteryInfo.getLotteryTypeById(a).split("_")[1];
                	var PlayCodeArr = eval('hcp_playCode_' + tagArr);
                	for (var k = 0; k < PlayCodeArr.length; k++) {
                		if(($.inArray(playId,PlayCodeArr[k]["play_code"]) != -1 )){
                			scheme.PlayName = PlayCodeArr[k]["name"].split(" ")[0];
                		}
                	}
                }else{
                	scheme.PlayName=LotteryInfo.getPlayMethodName(dataSet.BetTb + "", dataSet.PlayCode + "",dataSet.BetMode);
                }
	                
	            //点击进入查看投注详情页面
	            var $itemLi = $('<li></li>').data('scheme',scheme);
	            $itemLi.on('click',function() {
	                onItemClickListener_teambetting();
	                localStorageUtils.setParam("scheme",JSON.stringify($(this).data('scheme')));
	                setPanelBackPage_Fun('teamBettingOrderDetails');
	            });
	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;' + dataSet.UserName + '</dd><dd>投注金额:&nbsp;<span class="red">' + scheme.tzMoney +'元</span></dd><dd>彩种:&nbsp;'+scheme.lotteryName+'</dd><dd>时间:&nbsp;' + dataSet.InsertTime +'</dd></dl></a>');
	
	            $("#teamBettingList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

/**
 *获取彩种
 */
function getLotteryType_team(){
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAllMerchantInfo"}';
    ajaxUtil.ajaxByAsyncPost(null, params, searchAllSuccessCallBack_team, '正在加载数据...');
}

/**
 *查询所售彩种回调函数
 */
function searchAllSuccessCallBack_team(data) {
	if(data.Code == 200){
	    if (data.Data.ErrorState == "0") {
	    	var Info = data.Data.LotteryList;
	        $("#searchType_teamBetting").append('<option selected="selected" value="\'\'">全部彩种</option>');
	        for (var i = 0; i < Info.length; i++) {
	        	
	        	var str = Info[i].LotteryCode.toString();
                if(str.length >= 3 && str.split("")[0] == "5"){
                	// 盘口
                	if(1==Info[i].SaleState && Info[i].LotteryCode!=99 && hcp_LotteryId.hasOwnProperty(Info[i].LotteryCode)){
		                $("#searchType_teamBetting").append('<option id='+i+' value=' + Info[i].LotteryCode + '>' + hcp_LotteryInfo.getLotteryNameById(Info[i].LotteryCode) + '</option>');
		            }
                }else{
                	if(1==Info[i].SaleState && Info[i].LotteryCode!=99 && LotteryId.hasOwnProperty(Info[i].LotteryCode)){
		                $("#searchType_teamBetting").append('<option id='+i+' value=' + Info[i].LotteryCode + '>' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode) + '</option>');
		            }
                }
//	            if(1==Info[i].SaleState && Info[i].LotteryCode!=99 && LotteryId.hasOwnProperty(Info[i].LotteryCode)){
//	                $("#searchType_teamBetting").append('<option id='+i+' value=' + Info[i].LotteryCode + '>' + LotteryInfo.getLotteryNameById(Info[i].LotteryCode) + '</option>');
//	            }
	        }
	    } else {
	        toastUtils.showToast("网速不给力,请稍候重试");
	    }
	    //根据查询条件，查询数据
	    loadBySearchItems_team();
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

/**
 * 查询历史投注记录信息（滚动刷新后的列表）
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param lotteryType 彩种ID
 */
function nextPage_teamBetting(startDateTime, endDateTime, lotteryType) {
    var params = '{"InterfaceName":"/api/v1/netweb/GetTeamBetDataListNew","SourceCode":1,"ProjectPublic_PlatformCode":2,"LotteryCode":' + lotteryType + ',"IsHistory":' + IsHistory + ',"OrderState":"'+ orderStatus +'","insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamBetting + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createTeamBettingRecordsList,null);
}

/**
 * 查询历史投注记录信息（通过改变彩种，时间等查询条件时刷新的结果）
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param lotteryType 彩种ID
 */
function searchTeamBetting(startDateTime, endDateTime, lotteryType) {
    page=0;
    var params = '{"InterfaceName":"/api/v1/netweb/GetTeamBetDataListNew","SourceCode":1,"ProjectPublic_PlatformCode":2,"LotteryCode":' + lotteryType + ',"IsHistory":' + IsHistory + ',"OrderState":"'+ orderStatus +'","insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamBetting + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createTeamBettingRecordsList,null);
}

/**
 * 日期改变事件
 * @return {[type]} [description]
 */
function dateChange_teamBetting() {
    var timeType = $("#searchDate_teamBetting").val();
    type = $("#searchType_teamBetting").val();
    switch(timeType) {
        case "0":
            //当前记录
            $("#selectDateTB_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateTB_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateTB_Stt").val()+hms00;
            endDateTime = $("#selectDateTB_End").val()+hms59;
            IsHistory = false;
            searchTeamBetting(startDateTime, endDateTime,type);
            changeDateRange_TB(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateTB_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDateTB_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDateTB_Stt").val()+hms00;
            endDateTime = $("#selectDateTB_End").val()+hms59;
            IsHistory = true;
            searchTeamBetting(startDateTime, endDateTime,type);
            changeDateRange_TB(-33,"day",-4,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_TB(minNum,minType,maxNum,maxType){
    selDateTBStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateTBEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 * 彩种改变事件
 * [lotteryChange_teamBetting description]
 * @return {[type]} [description]
 */
function lotteryChange_teamBetting() {
    lotteryType = $("#searchType_teamBetting").val();
    startDateTime = $("#selectDateTB_Stt").val()+hms00;
    endDateTime = $("#selectDateTB_End").val()+hms59;
    searchTeamBetting(startDateTime, endDateTime, lotteryType);
}

//@ 查询状态改变
function statusChange_teamBetting() {
    orderStatus = $("#searchStatus_teamBetting").val();
    searchTeamBetting(startDateTime, endDateTime, lotteryType);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchItems_team() {
    var conditions = getSearchTerm();
    if (null != conditions) {
        /* var dataOptions = document.getElementById('searchDate_teamBetting').options;
         for (var i = 0; i < dataOptions.length; i++) {
         dataOptions[i].selected = false;
         if (dataOptions[i].value == conditions.time) {
         dataOptions[i].selected = true;
         }
         }*/

        var typeOptions = document.getElementById('searchType_teamBetting').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }
        var statusOptions = document.getElementById('searchStatus_teamBetting').options;
        for (var j = 0; j < statusOptions.length; j++) {
            statusOptions[j].selected = false;
            if (statusOptions[j].value == conditions.status) {
                statusOptions[j].selected = true;
            }
        }

        lotteryType = $("#searchType_teamBetting").val();
        orderStatus = $("#searchStatus_teamBetting").val();
        startDateTime = conditions.dateStt + hms00;
        endDateTime = conditions.dateEnd + hms59;
        $("#selectDateTB_Stt").val(conditions.dateStt);
        $("#selectDateTB_End").val(conditions.dateEnd);
        // 时间选择器
        // var dateChange = conditions.time;
        var dateChange = 0; //只有当前记录 2017-07-03
        switch (dateChange){
            case "0":
                IsHistory=false;
                localStorageUtils.setParam("IsHistory",IsHistory);
                changeDateRange_TB(-DayRange_3month,"day",0,"day");   //Controller
                break;
            case "1":
                IsHistory=true;
                localStorageUtils.setParam("IsHistory",IsHistory);
                changeDateRange_TB(-33,"day",-4,"day");     //Controller
                break;
        }

        //根据查询条件查询数据
        searchTeamBetting(startDateTime, endDateTime, lotteryType);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail = false;
        saveSearchTerm(searchConditions);
    } else {
        initTeamBettingRecordsPage();
    }
}

function initTeamBettingRecordsPage() {
    IsHistory = false;
    localStorageUtils.setParam("IsHistory",IsHistory);
    $("#selectDateTB_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateTB_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = initDefaultDate(0,"day") + hms00;
    //查询结束时间
    endDateTime = initDefaultDate(0,"day") + hms59;
    lotteryType = '""';
    orderStatus = "-1";
    searchTeamBetting(startDateTime, endDateTime, lotteryType);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_teambetting() {
    var searchConditions = {};
    // searchConditions.time = $("#searchDate_teamBetting").val();
    searchConditions.type = $("#searchType_teamBetting").val();
    searchConditions.dateStt = $("#selectDateTB_Stt").val();
    searchConditions.dateEnd = $("#selectDateTB_End").val();
    searchConditions.status = $("#searchStatus_teamBetting").val();
    searchConditions.isDetail = true;
    saveSearchTerm(searchConditions);
}

//根据用户名模糊查找
function queryTeamBettingUserName(searchUser){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"LikeUserName":"'+searchUser+'","InterfaceName":"/api/v1/netweb/GetTeamBetDataListNew","LotteryCode":' + lotteryType + ',"SourceCode":1,"ProjectPublic_PlatformCode":2,"IsHistory":' + IsHistory + ',"OrderState":"'+ orderStatus +'","insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamBetting + '}',
        createTeamBettingRecordsList, '正在加载数据...');
}
