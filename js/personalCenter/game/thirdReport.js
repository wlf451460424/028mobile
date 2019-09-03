//页大小
var PAGESIZE_thirdReport = 20;
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

var daohang_Arr=[];

var selDateThirdReportStart;
var selDateThirdReportEnd;

/*进入panel时调用*/
function thirdReportLoadedPanel(){
    catchErrorFun("thirdReportInit();");
}

/*离开panel时调用*/
function thirdReportUnloadedPanel(){
	daohang_Arr = [];
	$("#thirdReport_navigationLabel").empty();
    $("#thirdReportList").empty();
    $("#thirdReportTotal").empty();
	$("#thirdReportMy").empty();
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    type = 0;
    page = 0;
    uid = "";
    queryName = "";
    userName = "";
    if(selDateThirdReportStart){
        selDateThirdReportStart.dismiss();
    }
    if(selDateThirdReportEnd){
        selDateThirdReportEnd.dismiss();
    }
}

var _myScroller;
var thirdReport_nav_horScroller; //横向滑动

function thirdReportInit(){
	$("#xiaji_div").hide();
    $("#selectthirdReportID").empty();
    var $select=$('<table><tr>' +
    	'<td><select id="changeGameType_thirdReport" onchange="typeChange_thirdReport();"></select></td>'+
        '<td><select name="searchType_thirdReport" id="searchType_thirdReport" data-theme="a" data-mini="true" onchange="typeChange_thirdReport()"><option value="0" selected="selected">下级类型：全部</option><option value="1">下级类型：会员</option><option value="2">下级类型：代理</option></select></td>' +
        '</tr></table>' +
        '<table><tr>'+
        '<td><select name="searchDate_thirdReport" id="searchDate_thirdReport" data-theme="a" data-mini="true" onchange="dateChange_thirdReport()">'+
//      '<option value="0" selected="selected">当天时间</option><option value="1">历史时间</option>'+
        '</select></td>' +
        '<td><input type="text" id="selectDateThirdReport_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateThirdReport_End" readonly/></td>' +
        '</tr></table>');
    $("#selectthirdReportID").append($select);

	//第三方游戏平台类型
	var Arr_ThirdPartyInfo = jsonUtils.toObject(localStorageUtils.getParam("Arr_ThirdPartyInfo"));
	$.each(Arr_ThirdPartyInfo,function (key,val) {
		if(key == 0){
			gameId = val.ThirdpartyValue;
			$("#searchDate_thirdReport").empty();
	        if(gameId == 2){
	        	$("#searchDate_thirdReport").append('<option value="1" selected="selected">历史记录</option>');
	        }else{
	        	$("#searchDate_thirdReport").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	        }
		}
		$("#changeGameType_thirdReport").append('<option value="'+ val.ThirdpartyValue +'">报表类型：'+ val.ThirdpartyText +'</option>');
	});

    selDateThirdReportStart = new MobileSelectDate();
    selDateThirdReportStart.init({trigger:'#selectDateThirdReport_Stt',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});
    selDateThirdReportEnd = new MobileSelectDate();
    selDateThirdReportEnd.init({trigger:'#selectDateThirdReport_End',min:initDefaultDate(0,"day"),max:initDefaultDate(0,"day")});

    uid = localStorageUtils.getParam("myUserID");
    userName = localStorageUtils.getParam("username");
    
    type = 0;
    page = 0;
    hasMorePage = true;//默认还有分页
    _myScroller =  $("#thirdReportScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'thirdReportList','getSearchthirdReport()');

	//导航条横向滑动
	//【iScroll】参考文档：http://wiki.jikexueyuan.com/project/iscroll-5/
	thirdReport_nav_horScroller =  $("#thirdReport_nav_scroller").scroller({
		verticalScroll : false,
		horizontalScroll : true,
		vScrollCSS: "afScrollbar",
		autoEnable : true,
		click:true
	});
	thirdReport_nav_horScroller.scrollToTop();
	thirdReport_nav_horScroller.clearInfinite();

    //进入时加载
    loadBySearchthirdReport();

    //返回
    $("#thirdReportBackId").unbind('click');
    $("#thirdReportBackId").bind('click', function(event) {
        onBackKeyDown();
        setPanelBackPage_Fun('gameReport');
    });

    /**
     * 团队充值查询
     */
    $("#querythirdReportButtonID").unbind('click');
    $("#querythirdReportButtonID").bind('click', function(event) {
        $.ui.popup({
            title:"下级统计查询",
            message:'<input type="text" id="thirdReportUserNameId" maxLength="25"  placeholder="请输入要查找的用户名" />',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var searchUser = $("#thirdReportUserNameId").val();
                    var temp = localStorageUtils.getParam("myUserID");
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                        return;
                    }
                    if(uid != temp){
                        toastUtils.showToast("下级代理不支持用户名搜索");
                        return;
                    }
                    querythirdReportUserNameIdUserName(searchUser);
                },
            cancelOnly:false
        });
    });
    
    //导航
	var $navigationLabel_Li = $('<span id='+uid+'>'+ userName +'</span>');
	$("#thirdReport_navigationLabel").append($navigationLabel_Li);
	daohang_Arr.push(userName+'_'+uid);
}

function getSearchthirdReport(){
    searchthirdReport_Record(startDateTime, endDateTime, type)
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_thirdReport(str) {
	var searchConditions = {};
	searchConditions.time =  $("#searchDate_thirdReport").val();
	searchConditions.type =  $("#searchType_thirdReport").val();
	searchConditions.thirdPartyType =  $("#changeGameType_thirdReport").val();
	searchConditions.dateStt =  $("#selectDateThirdReport_Stt").val();
	searchConditions.dateEnd =  $("#selectDateThirdReport_End").val();
	searchConditions.name = str.split("_")[0];
    searchConditions.id = str.split("_")[1];
	searchConditions.isDetail =  true;
	saveSearchTerm(searchConditions);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchthirdReport() {
	//纵向滑动
	_myScroller.scrollToTop();
    _myScroller.clearInfinite();

	//横向滑动
	thirdReport_nav_horScroller.adjustScroll();
	thirdReport_nav_horScroller.clearInfinite();
	
    var conditions = getSearchTerm();
    if (null != conditions) {

	    $("#searchDate_thirdReport").empty();
	    if(gameId == 2){
		    $("#searchDate_thirdReport").append('<option value="1" selected="selected">历史记录</option>');
	    }else{
		    $("#searchDate_thirdReport").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	    }

        var dataOptions = document.getElementById('searchDate_thirdReport').options;
        for (var i = 0; i < dataOptions.length; i++) {
            dataOptions[i].selected = false;
            if (dataOptions[i].value == conditions.time) {
                dataOptions[i].selected = true;
            }
        }
        var typeOptions = document.getElementById('searchType_thirdReport').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }
        
        var gameOptions = document.getElementById('changeGameType_thirdReport').options;
        for (var i = 0; i < gameOptions.length; i++) {
	        gameOptions[i].selected = false;
            if (gameOptions[i].value == conditions.thirdPartyType) {
	            gameOptions[i].selected = true;
                gameId = conditions.thirdPartyType;
            }
        }

        type = $("#searchType_thirdReport").val();
        startDateTime = conditions.dateStt+hms00;
        endDateTime = conditions.dateEnd+hms59;
        $("#selectDateThirdReport_Stt").val(conditions.dateStt);
        $("#selectDateThirdReport_End").val(conditions.dateEnd);
        // 时间选择器
        var dateChange = conditions.time;
        switch (dateChange){
            case "0":
                changeDateRange_thirdReport(0,"day",0,"day");   //Controller
                break;
            case "1":
                changeDateRange_thirdReport(-DayRange_3month,"day",-1,"day");     //Controller
                break;
        }
        
        uid = conditions.id;
    	userName = conditions.name;
    	
    	$("#thirdReport_navigationLabel").empty();
		for(var i=0;i<daohang_Arr.length;i++){
			var str = daohang_Arr[i];
			if(i==0){
				var $navigationLabel_Li = $('<span id='+ str.split("_")[0]+ '_' + str.split("_")[1]+'>'+ str.split("_")[0] +'</span>');
			}else{
				var $navigationLabel_Li = $('<span id='+ str.split("_")[0]+ '_'  + str.split("_")[1]+'>'+ '&nbsp&nbsp>&nbsp&nbsp' + str.split("_")[0] +'</span>');
			}
			$("#thirdReport_navigationLabel").append($navigationLabel_Li);	
		}
	    //导航条换行，动态展示UI
	    var daoHangHeight = parseInt(parseInt($("#thirdReport_navigationLabel").css("height")) / 35);
	    var scrollerTop = 130;
	    if( daoHangHeight > 1){
		    var scorollerTop =  scrollerTop + 35*(daoHangHeight-1);
		    $("#thirdReportScroller").css("top",scorollerTop + "px");
	    }else {
		    $("#thirdReportScroller").css("top",scrollerTop + "px");
	    }

	    $("#thirdReport_navigationLabel span").click(function (e) {
        	var nn = 0;
			for(var i = $("#thirdReport_navigationLabel span").length -1 ;i >0 ; i--){
				if($("#thirdReport_navigationLabel span")[i].innerHTML != $(this).context.innerHTML){
					nn++;
				}else{
					break;
				}
			}
			for(var j=0;j<nn ;j++){
				$("#thirdReport_navigationLabel span:last").remove();
				daohang_Arr.pop();
			}
			
			onItemClickListener_thirdReport($(this).context.id);     
            loadBySearchthirdReport();
        });	

        //根据查询条件查询数据
        searchthirdReport(startDateTime, endDateTime, type);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
    } else {
        initthirdReportSubPage();
    }
}

function initthirdReportSubPage() {
    type = 0;
    $("#selectDateThirdReport_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateThirdReport_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateThirdReport_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateThirdReport_End").val()+hms59;
    searchthirdReport(startDateTime, endDateTime, type);
}

//第三方游戏类型改变事件
function typeChange_thirdReport() {
	type = $("#searchType_thirdReport").val();
	gameId = $("#changeGameType_thirdReport").val();
	var selectedOptions = $("#searchDate_thirdReport").val();

    $("#searchDate_thirdReport").empty();
    if(gameId == 2){
    	$("#searchDate_thirdReport").append('<option value="1" selected="selected">历史记录</option>');
    }else{
    	if(selectedOptions == "0"){
		    $("#searchDate_thirdReport").append('<option value="0" selected="selected">当天记录</option><option value="1">历史记录</option>');
	    }else {
		    $("#searchDate_thirdReport").append('<option value="0">当天记录</option><option selected="selected" value="1">历史记录</option>');
	    }
    }
    dateChange_thirdReport();
}

//日期改变事件
function dateChange_thirdReport() {
    var timeType = $("#searchDate_thirdReport").val();
    type = $("#searchType_thirdReport").val();
    switch(timeType) {
        case "0":
            //当天记录
            $("#selectDateThirdReport_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateThirdReport_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateThirdReport_Stt").val()+hms00;
            endDateTime = $("#selectDateThirdReport_End").val()+hms59;
            searchthirdReport(startDateTime, endDateTime,type);
            changeDateRange_thirdReport(0,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateThirdReport_Stt").val(initDefaultDate(-1,'day'));  //view
            $("#selectDateThirdReport_End").val(initDefaultDate(-1,'day'));
            startDateTime = $("#selectDateThirdReport_Stt").val()+hms00;
            endDateTime = $("#selectDateThirdReport_End").val()+hms59;
            searchthirdReport(startDateTime, endDateTime,type);
            changeDateRange_thirdReport(-DayRange_3month,"day",-1,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_thirdReport(minNum,minType,maxNum,maxType){
    selDateThirdReportStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateThirdReportEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

/**
 *查询团队下级记录 下一页
 */
function searchthirdReport_Record(startDateTime, endDateTime, type) {
    var temp = localStorageUtils.getParam("myUserID");
    if(uid != temp){
    	//下级
        ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","GetUserType":'+type+',"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_thirdReport + '}', thirdReport_searchSuccessCallBack, '正在加载数据...');
    	//团队
    	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":0,"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportAllSuccessCallBack, '正在加载数据...');
    	//自身
    	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":"1","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportSelfSuccessCallBack, '正在加载数据...');
    }else{
        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"","User_ID":"'+uid+'","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_thirdReport + '}', thirdReport_searchSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":0,"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportAllSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":"1","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportSelfSuccessCallBack, '正在加载数据...');
    }
}

/**
 *查询团队下级记录
 */
function searchthirdReport(startDateTime, endDateTime, type) {
    page=0;
    var temp = localStorageUtils.getParam("myUserID");
    if(uid != temp){
    	//下级
        ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","GetUserType":"'+type+'","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_thirdReport + '}', thirdReport_searchSuccessCallBack, '正在加载数据...');
    	//团队
    	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":0,"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportAllSuccessCallBack, '正在加载数据...');
    	//自身
    	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":"1","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportSelfSuccessCallBack, '正在加载数据...');
    }else{
        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"","User_ID":"'+uid+'","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_thirdReport + '}', thirdReport_searchSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":0,"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportAllSuccessCallBack, '正在加载数据...');
    	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":"1","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportSelfSuccessCallBack, '正在加载数据...');
    }
}

//根据用户名查找
function querythirdReportUserNameIdUserName(searchUser){
    page = 0;
    ajaxUtil.ajaxByAsyncPost(null, '{"User_ID":"'+uid+'","UserName":"' + searchUser + '","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePortChild","ProjectPublic_PlatformCode":2,"GetUserType":' + type + ',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '","ID":'+ gameId +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_thirdReport + '}',
    thirdReport_searchSuccessCallBack, '正在加载数据...');
    //团队
	ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":0,"InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportAllSuccessCallBack, '正在加载数据...');
    //自身
    ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+ userName +'","UserID":"'+uid+'","ID":'+ gameId +',"ProjectPublic_PlatformCode":2,"ISself":"1","InterfaceName":"/api/v1/netweb/ThirdPartyGetRePort","BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', thirdReportReportSelfSuccessCallBack, '正在加载数据...');
}

function thirdReport_searchSuccessCallBack(data){
    if (page == 0) {
        $("#thirdReportList").empty();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount ==0) {
	        // toastUtils.showToast("当前用户无下级数据");
		    $("#xiaji_div").hide();
	    }
	    if (data.Data.DataCount !=0) {
	    	$("#xiaji_div").show();
	        if(gameId == 1 ){
	            thirdReportSub_QiPai_DX(data.Data)
	        }else if(gameId == 2){
	            thirdReportSub_QiPai_KY(data.Data)
	        }else if(gameId == 3){
	            thirdReportSub_Vr(data.Data);
	        }else if(gameId == 4){
		        thirdReportSub_Ag(data.Data);
		    }else if(gameId == 6){
		        thirdReportSub_QiPai_Xy(data.Data);
	        }else if(gameId == 7){
		        thirdReportSub_QiPai_Ly(data.Data);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

// 团队报表-下级-大雄
function thirdReportSub_QiPai_DX(data) {
	var info = data.ReportComm;
	isHasMorePage(info,PAGESIZE_thirdReport);
	
	 $("#xiaji_div").show();
	for (var i = 0; i < info.length; i++) {
		var dataSet = {};
		//用户名
		dataSet.userName = info[i].UserName;
		//投注金额
		dataSet.GamePay = info[i].GamePay.toFixed(3).slice(0,-1);
		//有效投注
		dataSet.ValidBetAmount = info[i].ValidBetAmount?(info[i].ValidBetAmount.toFixed(3).slice(0,-1)):0;
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

		var $itemLi;
        if(info[i].ChildNum > 0 ){
        	$itemLi = $('<li onclick="thirdReport_Subordinates(this)" id="'+dataSet.userName+'_'+dataSet.userId +'" ><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39;">' + dataSet.userName + '<span style="color:#666666">&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</span></span></dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.GamePay) +'</dd><dd>有效投注：'+ Number(dataSet.ValidBetAmount) +'</dd><dd>中奖：'+ Number(dataSet.GameGet) +'</dd><dd>房费：'+ Number(dataSet.RoomFee) +'</dd><dd>其他收入：'+ Number(dataSet.OtherMoney) +'</dd><dd>对战类盈亏：<span id="PlayIncome'+i+'">' + Number(dataSet.PlayIncome) +'</span></dd><dd>电子类盈亏：<span id="SystemIncome'+i+'">' + Number(dataSet.SystemIncome) +'</span></dd><dd>总盈亏：<span id="PL'+i+'">' + Number(dataSet.PL) +'</span></dd></dl></a></li>');
        }else{
        	$itemLi = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + dataSet.userName + '&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.GamePay) +'</dd><dd>有效投注：'+ Number(dataSet.ValidBetAmount) +'</dd><dd>中奖：'+ Number(dataSet.GameGet) +'</dd><dd>房费：'+ Number(dataSet.RoomFee) +'</dd><dd>其他收入：'+ Number(dataSet.OtherMoney) +'</dd><dd>对战类盈亏：<span id="PlayIncome'+i+'">' + Number(dataSet.PlayIncome) +'</span></dd><dd>电子类盈亏：<span id="SystemIncome'+i+'">' + Number(dataSet.SystemIncome) +'</span></dd><dd>总盈亏：<span id="PL'+i+'">' + Number(dataSet.PL) +'</span></dd></dl></a></li>');
        }
        $("#thirdReportList").append($itemLi);
	}
	
	for (var j = 0; j < info.length; j++) {
        if(info[j].PlayIncome < 0){
			$("#PlayIncome"+ j).css('color','red');
		}else if(info[j].PlayIncome > 0){
			$("#PlayIncome"+ j).css('color', 'green');
		}else{
			$("#PlayIncome"+ j).css('color','#666');
		}
    }
	for (var j = 0; j < info.length; j++) {
        if(info[j].SystemIncome < 0){
			$("#SystemIncome"+ j).css('color','red');
		}else if(info[j].SystemIncome > 0){
			$("#SystemIncome"+ j).css('color', 'green');
		}else{
			$("#SystemIncome"+ j).css('color','#666');
		}
    }
	for (var j = 0; j < info.length; j++) {
        if(info[j].PL < 0){
			$("#PL"+ j).css('color','red');
		}else if(info[j].PL > 0){
			$("#PL"+ j).css('color', 'green');
		}else{
			$("#PL"+ j).css('color','#666');
		}
    }
}

//@ 查询下级列表
function thirdReport_Subordinates(element) {
	//导航
	var str = element.id;
	if(str == "")return;
	daohang_Arr.push(str);
    onItemClickListener_thirdReport(str);     
    UserName = str.split("_")[0];
    loadBySearchthirdReport();
    $("#xiaji_div").hide();
}

// 团队报表-下级-开元棋牌
function thirdReportSub_QiPai_KY(data) {
	var info = data.ReportComm;
	isHasMorePage(info,PAGESIZE_thirdReport);
	
	 $("#xiaji_div").show();
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

		var $itemLi;
        if(info[i].ChildNum > 0 ){
        	$itemLi = $('<li onclick="thirdReport_Subordinates(this)" id="'+dataSet.userName+'_'+dataSet.userId +'" ><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39;">' + dataSet.userName + '<span style="color:#666666">&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</span></span></dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.GamePay) +'</dd><dd>其他收入：'+ Number(dataSet.OtherMoney) +'</dd><dd>盈亏：<span id="gainTotal'+i+'">' + Number(dataSet.PL) +'</span></dd></dl></a></li>');
        }else{
        	$itemLi = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + dataSet.userName + '&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.GamePay) +'</dd><dd>其他收入：'+ Number(dataSet.OtherMoney) +'</dd><dd>盈亏：<span id="gainTotal'+i+'">' + Number(dataSet.PL) +'</span></dd></dl></a></li>');
        }
        $("#thirdReportList").append($itemLi);
	}
	for (var j = 0; j < info.length; j++) {
        if(info[j].PL < 0){
			$("#gainTotal"+ j).css('color','red');
		}else if(info[j].PL > 0){
			$("#gainTotal"+ j).css('color', 'green');
		}else{
			$("#gainTotal"+ j).css('color','#666');
		}
    }
}

//团队报表-下级-VR
function thirdReportSub_Vr(data) {
	var info = data.VRRPtlist;
	isHasMorePage(info,PAGESIZE_thirdReport);
	
	 $("#xiaji_div").show();
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

		var $itemLi;
        if(info[i].ChildNum > 0 ){
        	$itemLi = $('<li onclick="thirdReport_Subordinates(this)" id="'+dataSet.userName+'_'+dataSet.userId +'" ><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39;">' + dataSet.userName + '<span style="color:#666666">&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</span></span></dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.PersonalPay) +'</dd><dd>中奖：'+ Number(dataSet.PersonalGet) +'</dd><dd>其他收入：'+ Number(dataSet.Dailywage) +'</dd><dd>打赏：'+ Number(dataSet.Rewards) +'</dd><dd>盈亏：<span id="gainTotal'+i+'">' + dataSet.winloss +'</span></dd></dl></a></li>');
        }else{
        	$itemLi = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + dataSet.userName + '&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.PersonalPay) +'</dd><dd>中奖：'+ Number(dataSet.PersonalGet) +'</dd><dd>其他收入：'+ Number(dataSet.Dailywage) +'</dd><dd>打赏：'+ Number(dataSet.Rewards) +'</dd><dd>盈亏：<span id="gainTotal'+i+'">' + dataSet.winloss +'</span></dd></dl></a></li>');
        }
        $("#thirdReportList").append($itemLi);
	}
	
	for (var j = 0; j < info.length; j++) {
        if(info[j].winloss < 0){
			$("#gainTotal"+ j).css('color','red');
		}else if(info[j].winloss > 0){
			$("#gainTotal"+ j).css('color', 'green');
		}else{
			$("#gainTotal"+ j).css('color','#666');
		}
    }
}

// 团队报表-下级-AG
function thirdReportSub_Ag(data) {
	var info = data.ReportComm;
	isHasMorePage(info,PAGESIZE_thirdReport);
	
	 $("#xiaji_div").show();
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

		var $itemLi;
        if(info[i].ChildNum > 0 ){
        	$itemLi = $('<li onclick="thirdReport_Subordinates(this)" id="'+dataSet.userName+'_'+dataSet.userId +'" ><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39;">' + dataSet.userName + '<span style="color:#666666">&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</span></span></dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.GamePay) +'</dd><dd>有效投注：'+ Number(dataSet.ValidBetAmount) +'</dd><dd>中奖：'+ Number(dataSet.GameGet) +'</dd><dd>视讯盈亏：<span id="SXNetAmount'+i+'">' + Number(dataSet.SXNetAmount) +'</span></dd><dd>电子盈亏：<span id="DZNetAmount'+i+'">' + Number(dataSet.DZNetAmount) +'</span></dd><dd>桌面盈亏：<span id="ZYNetAmount'+i+'">' + Number(dataSet.ZYNetAmount) +'</span></dd><dd>捕鱼王盈亏：<span id="BYNetAmount'+i+'">' + Number(dataSet.BYNetAmount) +'</span></dd><dd>其他收入：'+ Number(dataSet.OtherMoney) +'</dd><dd>总盈亏：<span id="TotalNetAmount'+i+'">' + Number(dataSet.TotalNetAmount) +'</span></dd></dl></a></li>');
        }else{
        	$itemLi = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + dataSet.userName + '&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.GamePay) +'</dd><dd>有效投注：'+ Number(dataSet.ValidBetAmount) +'</dd><dd>中奖：'+ Number(dataSet.GameGet) +'</dd><dd>视讯盈亏：<span id="SXNetAmount'+i+'">' + Number(dataSet.SXNetAmount) +'</span></dd><dd>电子盈亏：<span id="DZNetAmount'+i+'">' + Number(dataSet.DZNetAmount) +'</span></dd><dd>桌面盈亏：<span id="ZYNetAmount'+i+'">' + Number(dataSet.ZYNetAmount) +'</span></dd><dd>捕鱼王盈亏：<span id="BYNetAmount'+i+'">' + Number(dataSet.BYNetAmount) +'</span></dd><dd>其他收入：'+ Number(dataSet.OtherMoney) +'</dd><dd>总盈亏：<span id="TotalNetAmount'+i+'">' + Number(dataSet.TotalNetAmount) +'</span></dd></dl></a></li>');
        }
        $("#thirdReportList").append($itemLi);
	}
	for (var j = 0; j < info.length; j++) {
        if(info[j].SXNetAmount < 0){
			$("#SXNetAmount"+ j).css('color','red');
		}else if(info[j].SXNetAmount > 0){
			$("#SXNetAmount"+ j).css('color', 'green');
		}else{
			$("#SXNetAmount"+ j).css('color','#666');
		}
    }
	for (var j = 0; j < info.length; j++) {
        if(info[j].DZNetAmount < 0){
			$("#DZNetAmount"+ j).css('color','red');
		}else if(info[j].DZNetAmount > 0){
			$("#DZNetAmount"+ j).css('color', 'green');
		}else{
			$("#DZNetAmount"+ j).css('color','#666');
		}
    }
	for (var j = 0; j < info.length; j++) {
        if(info[j].ZYNetAmount < 0){
			$("#ZYNetAmount"+ j).css('color','red');
		}else if(info[j].ZYNetAmount > 0){
			$("#ZYNetAmount"+ j).css('color', 'green');
		}else{
			$("#ZYNetAmount"+ j).css('color','#666');
		}
    }
	for (var j = 0; j < info.length; j++) {
        if(info[j].BYNetAmount < 0){
			$("#BYNetAmount"+ j).css('color','red');
		}else if(info[j].BYNetAmount > 0){
			$("#BYNetAmount"+ j).css('color', 'green');
		}else{
			$("#BYNetAmount"+ j).css('color','#666');
		}
    }
	for (var j = 0; j < info.length; j++) {
        if(info[j].TotalNetAmount < 0){
			$("#TotalNetAmount"+ j).css('color','red');
		}else if(info[j].TotalNetAmount > 0){
			$("#TotalNetAmount"+ j).css('color', 'green');
		}else{
			$("#TotalNetAmount"+ j).css('color','#666');
		}
    }
}

// 团队报表-下级-幸运棋牌
function thirdReportSub_QiPai_Xy(data) {
	var info = data.ReportComm;
	isHasMorePage(info,PAGESIZE_thirdReport);
	
	 $("#xiaji_div").show();
	for (var i = 0; i < info.length; i++) {
		var dataSet = {};
		//用户名
		dataSet.userName = info[i].UserName;
		//投注金额
		dataSet.GamePay = info[i].BetAmount.toFixed(3).slice(0,-1);
		//有效投注
		dataSet.ValidBetAmount = info[i].ValidBetAmount?(info[i].ValidBetAmount.toFixed(3).slice(0,-1)):0;
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
		//其他收入
		dataSet.Dailywage = info[i].Dailywage.toFixed(3).slice(0,-1);
		//盈亏
		dataSet.PL = info[i].PL.toFixed(3).slice(0,-1);

		var $itemLi;
        if(info[i].ChildNum > 0 ){
        	$itemLi = $('<li onclick="thirdReport_Subordinates(this)" id="'+dataSet.userName+'_'+dataSet.userId +'" ><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39;">' + dataSet.userName + '<span style="color:#666666">&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</span></span></dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.GamePay) +'</dd><dd>有效投注：'+ Number(dataSet.ValidBetAmount) +'</dd><dd>盈亏：<span id="PL'+i+'">' + Number(dataSet.PL) +'</span></dd><dd>其他收入：'+ Number(dataSet.Dailywage) +'</dd><dd></dd></dl></a></li>');
        }else{
        	$itemLi = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + dataSet.userName + '&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</dd><dd>类型：'+dataSet.category+'</dd><dd>投注：'+ Number(dataSet.GamePay) +'</dd><dd>有效投注：'+ Number(dataSet.ValidBetAmount) +'</dd><dd>盈亏：<span id="PL'+i+'">' + Number(dataSet.PL) +'</span></dd><dd>其他收入：'+ Number(dataSet.Dailywage) +'</dd><dd></dd></dl></a></li>');
        }
        $("#thirdReportList").append($itemLi);
	}
	
	for (var j = 0; j < info.length; j++) {
        if(info[j].PL < 0){
			$("#PL"+ j).css('color','red');
		}else if(info[j].PL > 0){
			$("#PL"+ j).css('color', 'green');
		}else{
			$("#PL"+ j).css('color','#666');
		}
    }
}

// 团队报表-下级-乐游棋牌
function thirdReportSub_QiPai_Ly(data) {
	var info = data.ReportComm;
	isHasMorePage(info,PAGESIZE_thirdReport);
	
	 $("#xiaji_div").show();
	for (var i = 0; i < info.length; i++) {
		var dataSet = {};
		//用户名
		dataSet.userName = info[i].UserName;
		//投注金额
		dataSet.GamePay = info[i].BetAmount.toFixed(3).slice(0,-1);
		//有效投注
		dataSet.ValidBetAmount = info[i].ValidBetAmount?(info[i].ValidBetAmount.toFixed(3).slice(0,-1)):0;
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
		//其他收入
		dataSet.Dailywage = info[i].Dailywage.toFixed(3).slice(0,-1);
		//盈亏
		dataSet.PL = info[i].PL.toFixed(3).slice(0,-1);

		var $itemLi;
        if(info[i].ChildNum > 0 ){
        	$itemLi = $('<li onclick="thirdReport_Subordinates(this)" id="'+dataSet.userName+'_'+dataSet.userId +'" ><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39;">' + dataSet.userName + '<span style="color:#666666">&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</span></span></dd><dd>类型：'+dataSet.category+'</dd><dd>有效投注：'+ Number(dataSet.ValidBetAmount) +'</dd><dd>其他收入：'+ Number(dataSet.Dailywage) +'</dd><dd>盈亏：<span id="PL'+i+'">' + Number(dataSet.PL) +'</span></dd><dd></dd></dl></a></li>');
        }else{
        	$itemLi = $('<li><a><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：' + dataSet.userName + '&nbsp&nbsp&nbsp&nbsp 直属:&nbsp;' + dataSet.ChildNum +'</dd><dd>类型：'+dataSet.category+'</dd><dd>有效投注：'+ Number(dataSet.ValidBetAmount) +'</dd><dd>其他收入：'+ Number(dataSet.Dailywage) +'</dd><dd>盈亏：<span id="PL'+i+'">' + Number(dataSet.PL) +'</span></dd><dd></dd></dl></a></li>');
        }
        $("#thirdReportList").append($itemLi);
	}
	
	for (var j = 0; j < info.length; j++) {
        if(info[j].PL < 0){
			$("#PL"+ j).css('color','red');
		}else if(info[j].PL > 0){
			$("#PL"+ j).css('color', 'green');
		}else{
			$("#PL"+ j).css('color','#666');
		}
    }
}

function onBackKeyDown(){
    clearSearchTerm();
    var temp = localStorageUtils.getParam("myUserID");
    localStorageUtils.setParam("gameId", temp);
}


/**
 * 查询下级统计方法回调函数
 */
function thirdReportReportAllSuccessCallBack(data) {
    if (data.Code == 200) {
        if(gameId == 1){
	        thirdReportAll_QiPai_DX(data.Data);
	    }else if(gameId == 2){
	        thirdReportAll_QiPai_KY(data.Data);
        }else if(gameId == 3){
            thirdReportAll_Vr(data.Data);
        }else if(gameId == 4){
	        thirdReportAll_Ag(data.Data);
	    }else if(gameId == 6){
	        thirdReportAll_QiPai_Xy(data.Data);
        }else if(gameId == 7){
	        thirdReportAll_QiPai_Ly(data.Data);
        }
    } else {
	    $("#thirdReportTotal").empty();
        toastUtils.showToast(data.Msg);
    }
}

//@ 大雄 棋牌
function thirdReportAll_QiPai_DX(data) {
	$("#thirdReportTotal").empty();
	var $ReportAllLUL=$('<ul class="recordDetail">' +
		'<li>投注：<span>'+ Number(data.GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount?data.ValidBetAmount.toFixed(3).slice(0,-1):0) +'</span></li>' +
		'<li>中奖：<span>'+ Number(data.GameGet.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>房 费：<span>'+ Number(data.RoomFee.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>对战类盈亏：<span>'+ Number(data.PlayIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>电子类盈亏：<span>'+ Number(data.SystemIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>总盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#thirdReportTotal").append($ReportAllLUL);

	var colorShow = [7,5,6];
	$.each(colorShow,function (key,val) {
		var items=$('#thirdReportTotal ul li:eq('+ val +') span');
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
function thirdReportAll_QiPai_KY(data) {
	$("#thirdReportTotal").empty();
	var $ReportAllLUL=$('<ul class="recordDetail">' +
		'<li>投注：<span>'+ Number(data.GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#thirdReportTotal").append($ReportAllLUL);
	
	var items=$('#thirdReportTotal ul li:eq(2) span');
	if(items[0].innerHTML < 0){
		items.css('color','red');
	}else if(items[0].innerHTML > 0){
		items.css('color','green');
	}else{
		items.css('color','#FE5D39');
	}
}

//@ vr 类
function thirdReportAll_Vr(data) {
	$("#thirdReportTotal").empty();
	var $ReportAllLUL=$('<ul class="recordDetail">' +
		'<li>投注：<span>'+ Number(data.BetMoney) +'</span></li>' +
		'<li>中奖：<span>'+ Number(data.WinMoney) +'</span></li>' +
		'<li>其他收入：<span>'+ (data.Dailywage ? Number(data.Dailywage) : 0) +'</span></li>' +
		'<li>打赏：<span>'+ Number(data.Rewards) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.WinLoss) +'</span></li></ul>');
	$("#thirdReportTotal").append($ReportAllLUL);
	
	var items=$('#thirdReportTotal ul li:eq(4) span');
	if(items[0].innerHTML < 0){
		items.css('color','red');
	}else if(items[0].innerHTML > 0){
		items.css('color','green');
	}else{
		items.css('color','#FE5D39');
	}
}

//@ AG
function thirdReportAll_Ag(data) {
	$("#thirdReportTotal").empty();
	var $ReportAllLUL=$('<ul class="recordDetail">' +
		'<li>投注：<span>'+ Number(data.BetAmount) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount) +'</span></li>' +
		'<li>中奖：<span>'+ Number(data.AwardAmount) +'</span></li>' +
		'<li>视讯盈亏：<span>'+ Number(data.SXNetAmount) +'</span></li>' +
		'<li>电子盈亏：<span>'+ Number(data.DZNetAmount) +'</span></li>' +
		'<li>桌面盈亏：<span>'+ Number(data.ZYNetAmount) +'</span></li>' +
		'<li>捕鱼王盈亏：<span>'+ Number(data.BYNetAmount) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>总 盈 亏：<span>'+ Number(data.TotalNetAmount) +'</span></li></ul>');
	$("#thirdReportTotal").append($ReportAllLUL);

	var colorShow = [4,5,6,3,8];
	$.each(colorShow,function (key,val) {
		var items=$('#thirdReportTotal ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}

//@ 幸运 棋牌
function thirdReportAll_QiPai_Xy(data) {
	$("#thirdReportTotal").empty();
	var $ReportAllLUL=$('<ul class="recordDetail">' +
		'<li>投注：<span>'+ Number(data.BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount?data.ValidBetAmount.toFixed(3).slice(0,-1):0) +'</span></li>' +
		'<li>其它收入：<span>'+ Number(data.Dailywage.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#thirdReportTotal").append($ReportAllLUL);

	var colorShow = [3];
	$.each(colorShow,function (key,val) {
		var items=$('#thirdReportTotal ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}

//@ 乐游 棋牌
function thirdReportAll_QiPai_Ly(data) {
	$("#thirdReportTotal").empty();
	var $ReportAllLUL=$('<ul class="recordDetail">' +
//		'<li>投注：<span>'+ Number(data.BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount?data.ValidBetAmount.toFixed(3).slice(0,-1):0) +'</span></li>' +
		'<li>其它收入：<span>'+ Number(data.Dailywage.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#thirdReportTotal").append($ReportAllLUL);

	var colorShow = [2];
	$.each(colorShow,function (key,val) {
		var items=$('#thirdReportTotal ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}

//@ 查询下级统计方法回调函数
function thirdReportReportSelfSuccessCallBack(data) {
    if (data.Code == 200) {
        if(gameId == 1){
            thirdReportSelf_QiPai_DX(data.Data);
        }else if(gameId == 2){
        	thirdReportSelf_QiPai_KY(data.Data);
        }else if(gameId == 3){
            thirdReportSelf_Vr(data.Data);
        }else if(gameId == 4){
	        thirdReportSelf_Ag(data.Data);
	    }else if(gameId == 6){
	        thirdReportSelf_QiPai_Xy(data.Data);
        }else if(gameId == 7){
	        thirdReportSelf_QiPai_Ly(data.Data);
        }
    } else {
	    $("#thirdReportMy").empty();
        toastUtils.showToast(data.Msg);
    }
}

//@ 大雄 棋牌
function thirdReportSelf_QiPai_DX(data) {
	$("#thirdReportMy").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="game_username">'+ data.UserName +'</span></li>' +
		'<li>投注：<span>'+ Number(data.GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount?data.ValidBetAmount.toFixed(3).slice(0,-1):0) +'</span></li>' +
		'<li>中奖：<span>'+ Number(data.GameGet.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>房费：<span>'+ Number(data.RoomFee.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>对战类盈亏：<span>'+ Number(data.PlayIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>电子类盈亏：<span>'+ Number(data.SystemIncome.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>总盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#thirdReportMy").append($SelfUL);

	var colorShow = [8,6,7];
	$.each(colorShow,function (key,val) {
		var items=$('#thirdReportMy ul li:eq('+ val +') span');
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
function thirdReportSelf_QiPai_KY(data) {
	$("#thirdReportMy").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="game_username">'+ data.UserName +'</span></li>' +
		'<li>投注：<span>'+ Number(data.GamePay.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#thirdReportMy").append($SelfUL);
	
	var items=$('#thirdReportMy ul li:eq(3) span');
	if(items[0].innerHTML < 0){
		items.css('color','red');
	}else if(items[0].innerHTML > 0){
		items.css('color','green');
	}else{
		items.css('color','#FE5D39');
	}
}

//@ VR 类
function thirdReportSelf_Vr(data) {
	$("#thirdReportMy").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="personal_UserName">'+ data.UserName +'</span></li>' +
		'<li>投注：<span>'+ Number(data.BetMoney) +'</span></li>' +
		'<li>中奖：<span>'+ Number(data.WinMoney) +'</span></li>' +
		'<li>其他收入：<span>'+ (data.Dailywage ? Number(data.Dailywage) : 0) +'</span></li>' +
		'<li>打赏：<span>'+ Number(data.Rewards) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.WinLoss) +'</span></li></ul>');
	$("#thirdReportMy").append($SelfUL);
	
	var items=$('#thirdReportMy ul li:eq(5) span');
	if(items[0].innerHTML < 0){
		items.css('color','red');
	}else if(items[0].innerHTML > 0){
		items.css('color','green');
	}else{
		items.css('color','#FE5D39');
	}
}

//@ AG
function thirdReportSelf_Ag(data) {
	$("#thirdReportMy").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="personal_UserName">'+ data.UserName +'</span></li>' +
		'<li>投注：<span>'+ Number(data.BetAmount) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount) +'</span></li>' +
		'<li>中奖：<span>'+ Number(data.AwardAmount) +'</span></li>' +
		'<li>视讯盈亏：<span>'+ Number(data.SXNetAmount) +'</span></li>' +
		'<li>电子盈亏：<span>'+ Number(data.DZNetAmount) +'</span></li>' +
		'<li>桌面盈亏：<span>'+ Number(data.ZYNetAmount) +'</span></li>' +
		'<li>捕鱼王盈亏：<span>'+ Number(data.BYNetAmount) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.OtherMoney?data.OtherMoney:0) +'</span></li>' +
		'<li>总 盈 亏：<span>'+ Number(data.TotalNetAmount) +'</span></li></ul>');
	$("#thirdReportMy").append($SelfUL);

	var colorShow = [4,5,6,7,9];
	$.each(colorShow,function (key,val) {
		var items=$('#thirdReportMy ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}

//@ 幸运棋牌
function thirdReportSelf_QiPai_Xy(data) {
	$("#thirdReportMy").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="game_username">'+ data.UserName +'</span></li>' +
		'<li>投注：<span>'+ Number(data.BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount?data.ValidBetAmount.toFixed(3).slice(0,-1):0) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.Dailywage.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#thirdReportMy").append($SelfUL);

	var colorShow = [4];
	$.each(colorShow,function (key,val) {
		var items=$('#thirdReportMy ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}

//@ 乐游棋牌
function thirdReportSelf_QiPai_Ly(data) {
	$("#thirdReportMy").empty();
	var $SelfUL=$('<ul class="recordDetail"><li>用户名：<span id="game_username">'+ data.UserName +'</span></li>' +
//		'<li>投注：<span>'+ Number(data.BetAmount.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>有效投注：<span>'+ Number(data.ValidBetAmount?data.ValidBetAmount.toFixed(3).slice(0,-1):0) +'</span></li>' +
		'<li>其他收入：<span>'+ Number(data.Dailywage.toFixed(3).slice(0,-1)) +'</span></li>' +
		'<li>盈亏：<span>'+ Number(data.PL.toFixed(3).slice(0,-1)) +'</span></li></ul>');
	$("#thirdReportMy").append($SelfUL);

	var colorShow = [3];
	$.each(colorShow,function (key,val) {
		var items=$('#thirdReportMy ul li:eq('+ val +') span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	});
}