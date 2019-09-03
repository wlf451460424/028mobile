//页大小
var PAGESIZE_proxy = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//条目计数
var sum = 0;
var typeProMem = 2; //1:全部下级 2:直属下级
var selDateProxyMemStart;
var selDateProxyMemEnd;

/*进入panel时调用*/
function proxyMemberLoadedPanel(){
	catchErrorFun("proxyMemberInit();");
}
/*离开panel时调用*/
function proxyMemberUnloadedPanel(){
	$("#teamproxyMemberList").empty();
	//清除本地存储的查询条件
	clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    userName = "";
    if(selDateProxyMemStart){
        selDateProxyMemStart.dismiss();
    }
    if(selDateProxyMemEnd){
        selDateProxyMemEnd.dismiss();
    }
}

function proxyMemberInit(){
    $("#proxyMemberDataSelectID").empty();
   /* var $select=$('<table><tr>' +
        '<td><select name="searchType_proxyMember" id="searchType_proxyMember" onchange="typeProxyMember()"><option value="1">全部下级</option><option value="2" selected="selected">直属下级</option></select></td>' +
        '<td><input type="text" id="selectDateProxyMem_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateProxyMem_End" readonly/></td></tr></table>');*/

   // 不展示 全部下级，直属下级 选择项 (2018-06-21)
	var $select=$('<table><tr>' +
		'<td style="background: #FFFFFF;">注册时间:</td>' +
		'<td><input type="text" id="selectDateProxyMem_Stt" readonly placeholder="请选择"/></td>' +
		'<td><input type="text" id="selectDateProxyMem_End" readonly placeholder="请选择"/></td></tr></table>');
    $("#proxyMemberDataSelectID").append($select);

    selDateProxyMemStart = new MobileSelectDate();
    selDateProxyMemStart.init({trigger:'#selectDateProxyMem_Stt',min:initDefaultDate(-10,"year"),max:initDefaultDate(0,"day")});
    selDateProxyMemEnd = new MobileSelectDate();
    selDateProxyMemEnd.init({trigger:'#selectDateProxyMem_End',min:initDefaultDate(-10,"year"),max:initDefaultDate(0,"day")});

    //进入时加载
    userName = localStorageUtils.getParam("username");
    typeProMem = 2;
    page = 0;
    hasMorePage = true;//默认还有分页

    // 进入时加载
    loadproxyManage();

    var _myScroller =  $("#proxyManageScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'teamproxyMemberList','loadProxyManageNextPage()');

    //@ 代理会员查询
    $("#queryproxyMemberButtonID").unbind('click');
    $("#queryproxyMemberButtonID").bind('click', function(event) {
             $.ui.popup({
                title:"代理会员查询",
                message:'<input type="text" id="proxyMemberUserNameId" maxLength="25"  placeholder="请输入要查找的用户名" />',
                cancelText:"关闭",
                cancelCallback:
                function(){
                },
                doneText:"确定",
                doneCallback:
                function(){
                    var searchUser = $("#proxyMemberUserNameId").val().trim();
                    if(!searchUser){
                        toastUtils.showToast("请输入要查找的用户名");
                    }else {
	                    queryproxyMemberUserName(searchUser);
                    }
                },
                cancelOnly:false
            });
    });
}

/**
 * 通过查询条件加载数据
 */
function loadproxyManage() {
    var conditions = getSearchTerm();
    if (null != conditions) {
        /*var typeOptions = document.getElementById('searchType_proxyMember').options;
        for (var i = 0; i < typeOptions.length; i++) {
            typeOptions[i].selected = false;
            if (typeOptions[i].value == conditions.type) {
                typeOptions[i].selected = true;
            }
        }*/
        // typeProMem = $("#searchType_proxyMember").val();
        typeProMem = 2;  //默认查直属

        if(conditions.dateStt){
	        startDateTime = conditions.dateStt + hms00;
        }else{
            startDateTime = "";
        }

        if(conditions.dateEnd){
	        endDateTime = conditions.dateEnd + hms59;
        }else{
            endDateTime = "";
        }

        $("#selectDateProxyMem_Stt").val(conditions.dateStt);
        $("#selectDateProxyMem_End").val(conditions.dateEnd);

        //根据查询条件查询数据
        searchTeamproxyMember(startDateTime, endDateTime,typeProMem);
        //重置isDetail标记，表示从记录界面返回
        var searchConditions = getSearchTerm();
        searchConditions.isDetail =  false;
        saveSearchTerm(searchConditions);
     } else {
        initProxyMemberPage();
     }
}

//2018-06-21:第一次进入页面，时间显示为空，时间参数为空串。
function initProxyMemberPage() {
    // $("#selectDateProxyMem_Stt").val(initDefaultDate(-1,"year"));
    // $("#selectDateProxyMem_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    // startDateTime = $("#selectDateProxyMem_Stt").val()+hms00;
    if($("#selectDateProxyMem_Stt").val()){
	    startDateTime = $("#selectDateProxyMem_Stt").val() + hms00;
    }else {
	    startDateTime = "";
    }
    //查询结束时间
    // endDateTime = $("#selectDateProxyMem_End").val()+hms59;
    if($("#selectDateProxyMem_End").val()){
        endDateTime = $("#selectDateProxyMem_End").val() + hms59;
    }else {
	    endDateTime = "";
    }

	typeProMem = 2;
    searchTeamproxyMember(startDateTime, endDateTime, typeProMem);
}

function loadProxyManageNextPage() {
	if($("#selectDateProxyMem_Stt").val()){
		startDateTime = $("#selectDateProxyMem_Stt").val() + hms00;
	}else {
		startDateTime = "";
	}

	if($("#selectDateProxyMem_End").val()){
		endDateTime = $("#selectDateProxyMem_End").val() + hms59;
	}else {
		endDateTime = "";
	}
	typeProMem = 2;
	searchTeamproxyMemberNextPage(startDateTime, endDateTime, typeProMem);
}

/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickProxyMemberListener() {
    var searchConditions = {};
    // searchConditions.type = $("#searchType_proxyMember").val();
    searchConditions.dateStt =  $("#selectDateProxyMem_Stt").val();
    searchConditions.dateEnd =  $("#selectDateProxyMem_End").val();
    searchConditions.isDetail = true;
    searchConditions.fromPage = "proxyMember";
    saveSearchTerm(searchConditions);
}

//类型改变事件
function typeProxyMember() {
    // typeProMem = $("#searchType_proxyMember").val();
    typeProMem = 2;
    startDateTime = $("#selectDateProxyMem_Stt").val()+hms00;
    endDateTime = $("#selectDateProxyMem_End").val()+hms59;
    searchTeamproxyMember(startDateTime,endDateTime,typeProMem);
}

/**
 *查询团队充值记录 
 */
function searchTeamproxyMember(startDateTime, endDateTime,typeProMem) {
    page = 0;
    searchTeamproxyMemberNextPage(startDateTime, endDateTime,typeProMem);
}
// next page
function searchTeamproxyMemberNextPage(startDateTime, endDateTime,typeProMem) {
	ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/Getmyteam","ProjectPublic_PlatformCode":2,"BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","TreeType":'+ typeProMem +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_proxy + '}',
		searchSuccessCallBack_proxyManage, '正在加载数据...');
}

function searchSuccessCallBack_proxyManage(data){
	$("#teamproxyMember_noData_tips").hide();
    if (page == 0) {
        $("#teamproxyMemberList").empty();
        $("#proxyManageScroller").scroller().scrollToTop();
        $("#proxyManageScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#teamproxyMember_noData_tips").show();
	        //toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount ==0) {
	    	$("#teamproxyMember_noData_tips").show();
	      //toastUtils.showToast("没有数据");
	       return;
	    }
	    var info=data.Data.MyteamList;
	    if (data.Data.DataCount !=0) {
	        isHasMorePage(info,PAGESIZE_proxy);
	        for (var i = 0; i < info.length; i++) {
	            var text = "";
	            var dataSet = new Object();
	            //用户ID
	            dataSet.userId = info[i].UserID;
	            //用户名
	            dataSet.username = info[i].UserName;
	            //用户类型
	            dataSet.category = info[i].Category;
	            //所属
	            dataSet.parentName = info[i].ParentName;
	            //彩票余额
	            dataSet.lotteryMoney = info[i].LotteryMoney;
	            //注册时间
	            dataSet.createTime = info[i].CreateTime;
	            //我的最大返点
	            dataSet.myrebate = info[i].Rebate;
	            //下级升级ID
	            dataSet.parentID = info[i].ParentID;
	            localStorageUtils.setParam("myrebate", info[i].Rebate);
	            var $itemLi = $('<li></li>').data('proxyMember',dataSet);
	                $itemLi.on('click',function() {
	                    onItemClickProxyMemberListener();              
	                    localStorageUtils.setParam("proxyMember",JSON.stringify($(this).data('proxyMember')));
	                    setPanelBackPage_Fun('subordinateManage');
	                });
	                $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;<span>' + dataSet.username + '</span></dd><dd>类型:&nbsp;' + IsAgentOrHui(dataSet.category) + '</dd><dd>余额:&nbsp;' + dataSet.lotteryMoney +'</dd><dd>注册时间:&nbsp;' + dataSet.createTime +'</dd></dl></a>');
	
	            $("#teamproxyMemberList").append($itemLi);            
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

function queryproxyMemberUserName(searchUser){
    page = 0;
	$("#selectDateProxyMem_Stt").val("");
	$("#selectDateProxyMem_End").val("");

    ajaxUtil.ajaxByAsyncPost(null, '{"LikeUserName":"'+searchUser+'","InterfaceName":"/api/v1/netweb/Getmyteam","ProjectPublic_PlatformCode":2,"BeginDate":"","EndDate":"","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_proxy + ',"TreeType":1}',
    searchSuccessCallBack_proxyManage, '正在加载数据...');
}

function IsAgentOrHui(category) {
   return (category & 64)==64 ? "会员" : "代理";
}