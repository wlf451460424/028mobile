//页大小
var PAGESIZE_proxy = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
var uid;
//条目计数
var sum = 0;
var typeProMem = 2; //1:全部下级 2:直属下级
var selDateProxyMemStart;
var selDateProxyMemEnd;

var proxyMember_nav_horScroller; //横向滑动
var daohang_Arr=[];

/*进入panel时调用*/
function proxyMemberLoadedPanel(){
	catchErrorFun("proxyMemberInit();");
}
/*离开panel时调用*/
function proxyMemberUnloadedPanel(){
	daohang_Arr = [];
	$("#proxyMember_navigationLabel").empty();
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
    uid = localStorageUtils.getParam("myUserID");
    userName = localStorageUtils.getParam("username");
    typeProMem = 2;
    page = 0;
    hasMorePage = true;//默认还有分页

    var _myScroller =  $("#proxyManageScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'teamproxyMemberList','loadProxyManageNextPage()');
	
	//导航条横向滑动
	//【iScroll】参考文档：http://wiki.jikexueyuan.com/project/iscroll-5/
	proxyMember_nav_horScroller =  $("#proxyMember_nav_scroller").scroller({
		verticalScroll : false,
		horizontalScroll : true,
		vScrollCSS: "afScrollbar",
		autoEnable : true,
		click:true
	});
//	proxyMember_nav_horScroller.scrollToTop();
//	proxyMember_nav_horScroller.clearInfinite();
	
	
	// 进入时加载
    loadproxyManage();
	
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
    
    //导航
	var $navigationLabel_Li = $('<span id='+uid+'>'+ userName +'</span>');
	$("#proxyMember_navigationLabel").append($navigationLabel_Li);
	daohang_Arr.push(userName+'_'+uid);
}

/**
 * 通过查询条件加载数据
 */
function loadproxyManage() {
	
	//横向滑动
	proxyMember_nav_horScroller.adjustScroll();
	proxyMember_nav_horScroller.clearInfinite();
	
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

		
		uid = conditions.id;
    	userName = conditions.name;
    	
    	//修复手机物理返回键    bug:LOL-6687   2019.06.13
    	if(!uid) uid = localStorageUtils.getParam("myUserID");
    	if(!userName) userName = localStorageUtils.getParam("username");
    	startDateTime = "";
    	endDateTime = "";
    	
        $("#proxyMemberDataSelectID").empty();
		var $select=$('<table><tr>' +
			'<td style="background: #FFFFFF;">注册时间:</td>' +
			'<td><input type="text" id="selectDateProxyMem_Stt" readonly placeholder="请选择"/></td>' +
			'<td><input type="text" id="selectDateProxyMem_End" readonly placeholder="请选择"/></td></tr></table>');
		$("#proxyMemberDataSelectID").append($select);
		
		selDateProxyMemStart = new MobileSelectDate();
		selDateProxyMemStart.init({trigger:'#selectDateProxyMem_Stt',min:initDefaultDate(-10,"year"),max:initDefaultDate(0,"day")});
		selDateProxyMemEnd = new MobileSelectDate();
		selDateProxyMemEnd.init({trigger:'#selectDateProxyMem_End',min:initDefaultDate(-10,"year"),max:initDefaultDate(0,"day")});
    	

    	
    	$("#proxyMember_navigationLabel").empty();
		for(var i=0;i<daohang_Arr.length;i++){
			var str = daohang_Arr[i];
			if(i==0){
				var $navigationLabel_Li = $('<span id='+ str.split("_")[0]+ '_' + str.split("_")[1]+'>'+ str.split("_")[0] +'</span>');
			}else{
				var $navigationLabel_Li = $('<span id='+ str.split("_")[0]+ '_'  + str.split("_")[1]+'>'+ '&nbsp&nbsp>&nbsp&nbsp' + str.split("_")[0] +'</span>');
			}
			$("#proxyMember_navigationLabel").append($navigationLabel_Li);	
		}
	    //导航条换行，动态展示UI
	    var daoHangHeight = parseInt(parseInt($("#proxyMember_navigationLabel").css("height")) / 35);
	    var scrollerTop = 130;
	    if( daoHangHeight > 1){
		    var scorollerTop =  scrollerTop + 35*(daoHangHeight-1);
		    $("#proxyMemberScroller").css("top",scorollerTop + "px");
	    }else {
		    $("#proxyMemberScroller").css("top",scrollerTop + "px");
	    }

	    $("#proxyMember_navigationLabel span").click(function (e) {
        	var nn = 0;
			for(var i = $("#proxyMember_navigationLabel span").length -1 ;i >0 ; i--){
				if($("#proxyMember_navigationLabel span")[i].innerHTML != $(this).context.innerHTML){
					nn++;
				}else{
					break;
				}
			}
			for(var j=0;j<nn ;j++){
				$("#proxyMember_navigationLabel span:last").remove();
				daohang_Arr.pop();
			}
			
			onItemClickProxyMemberListener($(this).context.id);     
            loadproxyManage();
        });	
        
        
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
function onItemClickProxyMemberListener(str) {
    var searchConditions = {};
    // searchConditions.type = $("#searchType_proxyMember").val();
    searchConditions.dateStt =  $("#selectDateProxyMem_Stt").val();
    searchConditions.dateEnd =  $("#selectDateProxyMem_End").val();
    searchConditions.isDetail = true;
    searchConditions.fromPage = "proxyMember";
    searchConditions.name = str.split("_")[0];
    searchConditions.id = str.split("_")[1];
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
	ajaxUtil.ajaxByAsyncPost(null, '{"InterfaceName":"/api/v1/netweb/Getmyteam","ProjectPublic_PlatformCode":2,"UserID":"'+uid+'","BeginDate":"' + startDateTime + '","EndDate":"' + endDateTime + '","TreeType":'+ typeProMem +',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_proxy + '}',
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
	            
	            
	            var $itemLi = $('<li></li>');
//	            $itemLi.append('<a>用户名:&nbsp;<span>' + dataSet.username + '</span></a>');
//	            $itemLi = $('<li id="'+dataSet.username+'_'+dataSet.userId +'" ><a class="recordList"><dl class="orderList"><dd style="font-weight: bold; color:#666666">用户名：<span style="color:#FE5D39;">' + dataSet.username +'_'+dataSet.userId + '</span></dd></dl></a></li>');
	            $itemLi.append('<span onclick="chaxun_Subordinates(this)" id="'+dataSet.username+'_'+dataSet.userId +'" style="padding: 10px 10px 7px 13px;color:#666666;line-height: 30px;">用户名:&nbsp;<span style="font-weight: bold;color:#FE5D39;">' + dataSet.username + '</span></span>');
	            $("#teamproxyMemberList").append($itemLi);
	            
	            var $itemLi = $('<li></li>').data('proxyMember',dataSet);
	                $itemLi.on('click',function() {
//	                    onItemClickProxyMemberListener();              
	                    localStorageUtils.setParam("proxyMember",JSON.stringify($(this).data('proxyMember')));
	                    setPanelBackPage_Fun('subordinateManage');
	                });
	                //<dd>用户名:&nbsp;<span>' + dataSet.username + '</span></dd>
	                $itemLi.append('<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;' + IsAgentOrHui(dataSet.category) + '</dd><dd>余额:&nbsp;' + dataSet.lotteryMoney +'</dd><dd>注册时间:&nbsp;' + dataSet.createTime +'</dd></dl></a>');
	
	            $("#teamproxyMemberList").append($itemLi);            
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 查询下级列表
function chaxun_Subordinates(element) {
	//导航
	var str = element.id;
	if(str == "")return;
	daohang_Arr.push(str);
    onItemClickProxyMemberListener(str);     
    UserName = str.split("_")[0];
    loadproxyManage();
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