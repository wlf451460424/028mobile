/* 新制度-日结契约列表 */
var PageSize_dailyWagesList = 10,
    QueryState = -1,
	DWTypeID,
    myUserID,
    myUserName,
	hasMorePage;

//@ Loaded
function dailyWagesNewListLoadedPanel(){
    catchErrorFun("dailyWagesNewListInit();");
}

//@ Unloaded
function dailyWagesNewListUnloadedPanel(){
    $("#DwNewDataList").empty();
    $("#dailyWagesNewScroller").scroller().scrollToTop();
    $("#dailyWagesNewScroller").scroller().clearInfinite();
    QueryState = -1;
}

//@ Init
function dailyWagesNewListInit() {
	$("#dailyWagesNew_Query").empty();
	var $select=$('<table><tr><td>' +
		'<select name="dailyWagesQueryStateNew" id="dailyWagesQueryStateNew" data-theme="a" data-mini="true" onchange="changeDailyWagesStateNew()"><option value="-1" selected="selected">状态：全部</option><option value="1">状态：已签约</option><option value="0">状态：未签约</option></select></td><td>' +
		'<select name="dailyWagesQueryType" id="dailyWagesQueryType" data-theme="a" onchange="changeDailyWagesStateNew()"></select></td>' +
		'</tr></table>');
	$("#dailyWagesNew_Query").append($select);

	myUserID = localStorageUtils.getParam("myUserID");
	myUserName = localStorageUtils.getParam("username");
	page = 0;
	hasMorePage = true;
	//changeDailyWagesStateNew: setParam
	var selectedDwType = localStorageUtils.getParam("Selected_Dw_Type");

    //填充日结类型的option
	var queryType = 1;  //类型【1=日结，2=分红、3=私返】
	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetSystemMgrType","ProjectPublic_PlatformCode":2,"TypeID":'+ queryType +'}', function (data) {
		if (data.Code == 200){
			var myType = data.Data.SysMgrTypeModel || [];
			localStorageUtils.setParam("DailyWagesSysType",jsonUtils.toString(myType));

			DWTypeID = myType.length ? myType[0].Id : 0;
			for (var i=0; i < myType.length; i++) {
				// 记住当前选中的日结类型
				if(selectedDwType && selectedDwType == myType[i].Id){
					var $option = $('<option selected="selected" value="'+ myType[i].Id +'">日结类型：'+ myType[i].Name +'</optionv>');
					DWTypeID = myType[i].Id;
				}else {
					var $option = $('<option value="'+ myType[i].Id +'">日结类型：'+ myType[i].Name +'</optionv>');
				}
				$("#dailyWagesQueryType").append($option);
			}

			//Load Data
			loadDailyWagesNew(QueryState,DWTypeID);
		}else {
			toastUtils.showToast(data.Msg);
		}
	}, null);

    var _myScroller =  $("#dailyWagesNewScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'DwNewDataList','dailyWagesNewByScroll()');

    //Search Username
    $("#dailyWagesNewSearch").off('click');
    $("#dailyWagesNewSearch").on('click', function() {
        searchDailyWagesUserNew();
    });
}

//@ 改变查询状态 或者 类型
function changeDailyWagesStateNew() {
    page = 0;
    QueryState = $("#dailyWagesQueryStateNew").val() || -1;
    DWTypeID = $("#dailyWagesQueryType").val() || DWTypeID;
	localStorageUtils.setParam("Selected_Dw_Type",DWTypeID);
    loadDailyWagesNew(QueryState,DWTypeID);
}

//@ First Page
function loadDailyWagesNew(QueryState,DWTypeID) {
    page = 0;
    dailyWagesNew_scroll(QueryState,DWTypeID);
}

//@ NextPage
function dailyWagesNewByScroll(){
	QueryState = $("#dailyWagesQueryStateNew").val() || -1;
	DWTypeID = $("#dailyWagesQueryType").val() || DWTypeID;
    dailyWagesNew_scroll(QueryState,DWTypeID);
}

//@ 请求列表数据
function dailyWagesNew_scroll(QueryState,DWTypeID) {
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/Contract_GetList","ProjectPublic_PlatformCode":2,"UserName":"","DayWagesState":'+ QueryState +',"DwTypeID":'+ DWTypeID +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PageSize_dailyWagesList + '}', loadDailyWagesNew_Back, '正在加载数据...');
}

//@ 数据返回
function loadDailyWagesNew_Back(data){
    if (page == 0) {
        $("#DwNewDataList").empty();
        $("#dailyWagesNewScroller").scroller().scrollToTop();
        $("#dailyWagesNewScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data == null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    
	    var info = data.Data.ContractList || [];
	    if (info.length == 0) {
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    
        isHasMorePage(info,PageSize_dailyWagesList);
        $.each(info,function (key,val) {
            var DwNewListData = {};
            DwNewListData.userID = val.UserID;
            DwNewListData.userName = val.UserName;
            DwNewListData.State = val.State;  // 未签约=0，已签约=1
	        DwNewListData.Rebate = val.Rebate;
	        DwNewListData.DayWageStandard = val.DayWageStandard || " 暂未签约";  //日结标准
	        DwNewListData.DayWagesProportion = val.DayWagesProportion;  //日结比例
	        DwNewListData.DayWagesTypeSelected = {
	        	"value": $("#dailyWagesQueryType").val(),
	            "name": $("#dailyWagesQueryType").find("option:selected").text().replace(new RegExp(/:+|：+/g),':').split(":")[1]
	        };

            var li = $('<li><a><dl class="orderList"><dd>用户名:&nbsp;' + val.UserName +
                '</dd><dd>返点:&nbsp;' + val.Rebate +
                '</dd><dd>日结标准:' +(val.DayWageStandard || " 暂未签约") +
                '</dd><dd>签约状态:&nbsp;'+ getDailyWagesStateNew(val.State)[0] +
                '</dd><dd><button id="modifyDWBtn" onclick="dailyWages_ModifyNew(this)" class="modifyCttBtn">'+ getDailyWagesStateNew(val.State)[1] +'</button></dd></dl></a></li>').data('DwNewListData',DwNewListData);

            if( !data.Data.isAllowSign ){
	            var currentLi = li[0].children[0].children[0].lastChild;
	            $(currentLi).hide();
            }
            $("#DwNewDataList").append(li);
        });
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 显示下级日结状态
function getDailyWagesStateNew(state) {
    switch (state){
        case 0:
	        return ['未签约','签订契约'];
        case 1:
            return ['已签约','修改契约'];
    }
}

//@ 修改或签订契约
function dailyWages_ModifyNew(element) {
    var info = jsonUtils.toString($(element).parents("li").data('DwNewListData'));
    localStorageUtils.setParam("DwNewListData",info);
    setPanelBackPage_Fun("modifyDailyWagesNew");
}

//@ 查找用户名
function searchDailyWagesUserNew(){
    $.ui.popup({
        title:"查询用户名",
        message:'<input type="text" id="searchDwUserNew" maxLength="25" placeholder="请输入要查找的用户名" />',
        cancelText:"关闭",
        cancelCallback:
            function(){
            },
        doneText:"确定",
        doneCallback:
            function(){
                var searchUser = $("#searchDwUserNew").val();
                if(searchUser.trim() == ""){
                    toastUtils.showToast("请输入要查找的用户名");
                    return;
                }
                var page = 0;
                QueryState = $("#dailyWagesQueryStateNew").val() || -1;
                DWTypeID = $("#dailyWagesQueryType").val() || DWTypeID;
                ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/Contract_GetList","ProjectPublic_PlatformCode":2,"UserName":"'+ searchUser +'","DayWagesState":'+ QueryState +',"DwTypeID":'+ DWTypeID +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PageSize_dailyWagesList + '}', loadDailyWagesNew_Back, '正在加载数据...');
            },
        cancelOnly:false
    });
}
