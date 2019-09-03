'use strict';
/* 加载收件箱和发件箱列表 */

//@ 全局变量
var Email_pageSize = 20;
var emailSource;

//@ 进入页面时
function EmailListsLoadedPanel() {
    catchErrorFun("EmailLists_init();");
}
//@ 离开页面时
function EmailListsUnloadedPanel() {
    $("#messageLists").empty();
    localStorageUtils.setParam("emailSource",0);
    localStorageUtils.removeParam("receiverId");//use for sendEmail
}

//@ 入口函数
function EmailLists_init() {
    myUserID = localStorageUtils.getParam("myUserID");
    emailSource = localStorageUtils.getParam("emailSource");
    if (!emailSource){
        emailSource = 0;  //0-收件箱; 1-发件箱.
    }

	// msgControl 与运算(&)后的值 = 1:发消息，2：发件箱，4：收件箱
	var msgControl = Number(localStorageUtils.getParam("messageControl"));

	if( (msgControl&1) == 1){
		$("#EmailListsHeader a:last-of-type").show();
	}else {
		$("#EmailListsHeader a:last-of-type").hide();
	}

	$("#EmailStyle").hide();
	$("#EmailContentScroller").css("top","0");
	if( (msgControl&2) != 2 && (msgControl&4) != 4 ){  //only 发消息
		$("#EmailListsHeader").children("h1").text("站内信");
		return;
	}else if( (msgControl&2) == 2 && (msgControl&4) != 4 ){  //only 发件箱
		$("#EmailListsHeader").children("h1").text("发件箱");
		emailSource = 1;
	}else if( (msgControl&2) != 2 && (msgControl&4) == 4 ){  //only 收件箱
		$("#EmailListsHeader").children("h1").text("收件箱");
		emailSource = 0;
	}else {  //收件箱和发件箱同同时显示，默认查询收件箱数据
		$("#EmailStyle").show();
		$("#EmailListsHeader").children("h1").text("站内信");
		$("#EmailContentScroller").css("top","45px");
		emailSource = emailSource || 0;
	}

    changeStationEmailStyle();
    page = 0;
    hasMorePage = true;
    getNextPage(emailSource);
}

//@ 切换收件箱或者发件箱
function changeStationEmailStyle() {
    //初始化
    if (emailSource == 0){    //收件箱
        var Source = "get";
        getRecEmail();
    }else if (emailSource == 1){  //发件箱
        Source = "send";
        getSendEmail();
    }
    $("#"+Source+"EmailBtn").css({"color":"#FE5D39","borderBottom":"1px solid #FE5D39"});
    $("#"+Source+"EmailBtn").siblings("li").css({"color":"#666666","borderBottom":"1px solid #fff"});

    //Click to change(Receive or Send)
    $("#EmailStyle > li").off('click');
    $("#EmailStyle > li").on('click',function () {
        $(this).css({"color":"#FE5D39","borderBottom":"1px solid #FE5D39"});
        $(this).siblings("li").css({"color":"#666666","borderBottom":"1px solid #fff"});
        $("#messageLists").empty();
        var clickedID = $(this).context.id;
        if (clickedID == "getEmailBtn"){
            emailSource = 0;
            getRecEmail();
        }else if (clickedID == "sendEmailBtn"){
            emailSource = 1;
            getSendEmail();
        }
        getNextPage(emailSource);
    });

}
//@ 加载下一页
function getNextPage(source){

	// msgControl 与运算(&)后的值 = 1:发消息，2：发件箱，4：收件箱
	var msgControl = Number(localStorageUtils.getParam("messageControl"));
	if( (msgControl&2) != 2 && (msgControl&4) != 4 ){  //only 发消息
		return;
	}

    var _myScroller =  $("#EmailContentScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();

    if (source == 0){
        addUseScroller(_myScroller,'messageLists','getRecEmail_next()');
    }else if (source == 1){
        addUseScroller(_myScroller,'messageLists','getSendEmail_next()');
    }
}

//@ 初次获取收件箱列表
function getRecEmail() {
    page = 0;
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/inbox_search","CurrentPageIndex":' + page + ',"CurrentPageSize":' + Email_pageSize + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getRecEmailCallback,'正在加载数据...');
}
//收件箱-nextPage
function getRecEmail_next(){
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/inbox_search","CurrentPageIndex":' + page + ',"CurrentPageSize":' + Email_pageSize + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getRecEmailCallback,'正在加载数据...');
}

//@ 收件箱CallBack
function getRecEmailCallback(cb) {
    if (page == 0) {
        $("#messageLists").empty();
        $("#EmailContentScroller").scroller().scrollToTop();
        $("#EmailContentScroller").scroller().clearInfinite();
    }
    if (cb.Code == 200){
        var recEmailLists = cb.Data.Records || [];
        isHasMorePage(recEmailLists,Email_pageSize);
        //有站内信时
        if (recEmailLists.length > 0){
            $("#hasEmails").show();
            $("#noEmails").hide();
	        $.each(recEmailLists,function (key,val) {
	            var emailDetailInfo = {};
	            emailDetailInfo.id = val['Sysid'];
	            emailDetailInfo.IsSend = 0;  // 0：收件箱；1：发件箱；
	            //未读
	            if (val.EmailState == 2){
	                var $receiveLi = $('<li>发送人：<span>'+ showSendPerson(val.SenderNameLevel,val.SenderName) +'</span><small>'+ val.SendTime +'</small><p><i class="showUnreadList"></i><span>'+ val.Title +'</span></p><span class="emailBtnRight"></span></li>');
	            }else{    //已读,Others
	                $receiveLi = $('<li>发送人：<span>'+ showSendPerson(val.SenderNameLevel,val.SenderName) +'</span><small>'+ val.SendTime +'</small><p><i></i><span>'+ val.Title +'</span></p><span class="emailBtnRight"></span></li>');
	            }
	            //点击进入详情页
	            $receiveLi.on('click',function () {
	                localStorageUtils.setParam("emailDetailInfo",jsonUtils.toString(emailDetailInfo));
	                setPanelBackPage_Fun('EmailDetails');
	            });
	
	            $("#messageLists").append($receiveLi);
	        });
        }
    }else if (($.inArray(cb.Code,[401,402,403,404,405,406,423]) > -1)){
	    toastUtils.showToast("请重新登录");
	    loginAgain();
    }else{
        toastUtils.showToast(data.Msg);
    }
}

//@ 收件箱-发送人显示
function showSendPerson(level,person) {
    if (level == 3){
        return "系统消息";
    } else if (level == 2){
        return "上级";
    } else{
        return person;
    }
}

//@ 初次获取发件箱列表
function getSendEmail() {
    page = 0;
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/sendbox_search","CurrentPageIndex":' + page + ',"CurrentPageSize":' + Email_pageSize + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getSendEmailCallback,'正在加载数据...');
}

//@ 发件箱-nextPage
function getSendEmail_next(){
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/sendbox_search","CurrentPageIndex":' + page + ',"CurrentPageSize":' + Email_pageSize + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getSendEmailCallback,'正在加载数据...');
}

//@ 发件箱CallBack
function getSendEmailCallback(cb) {
    if (page == 0) {
        $("#messageLists").empty();
        $("#EmailContentScroller").scroller().scrollToTop();
        $("#EmailContentScroller").scroller().clearInfinite();
    }
    if (cb.Code == 200){
        var sendEmailLists = cb.Data.Records;
        isHasMorePage(sendEmailLists,Email_pageSize);
        if ( sendEmailLists.length > 0){
            $("#hasEmails").show();
            $("#noEmails").hide();
            $.each(sendEmailLists,function (key,val) {
                var emailDetailInfo = {};
                emailDetailInfo.id = val['Sysid'];
                emailDetailInfo.IsSend = 1;  //发件箱
                //发送成功
                if (val.Sign == 0){
                    var $sendLi = $('<li>收件人：<span>'+ showRecPerson(val.SenderNameLevel) +'</span><small>'+ val.SendTime +'</small><p><span>'+ val.Title +'</span></p><span class="emailBtnRight"></span></li>');
                }
                //点击进入详情页
                $sendLi.on('click',function (){
                    localStorageUtils.setParam("emailDetailInfo",jsonUtils.toString(emailDetailInfo));
                    setPanelBackPage_Fun('EmailDetails');
                });
                $("#messageLists").append($sendLi);
            });
        }
    } else if(($.inArray(cb.Code,[401,402,403,404,405,406,423]) > -1)){
    	toastUtils.showToast("请重新登录");
        loginAgain();
    } else{
        toastUtils.showToast(data.Msg);
    }
}

//@ 发件箱-收件人显示
function showRecPerson(level) {
    if (level == 1){
        return "上级";
    }else{
        return "下级";
    }
}
