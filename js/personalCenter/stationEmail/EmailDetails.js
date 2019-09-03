//** Created by LY on 2016/12/27. 站内信详细信息（STATION_EMAIL_DETAILS）
'use strict';
//@ 进入页面时
function EmailDetailsLoadedPanel() {
    catchErrorFun("EmailDetails_init();");
}
//@ 离开页面时
function EmailDetailsUnloadedPanel() {
    $("#EmailDeta_time").empty();
    $("#EmailDeta_info").empty();
    $("#EmailDeta_displayCont").empty();
    localStorageUtils.setParam("emailSource",receiveOrSend);
}
//@全局变量
var receiveOrSend = 0;  //判断为收件箱还是发件箱。0：收件箱；1：发件箱；
var messageID;

//@ 入口函数
function EmailDetails_init() {
    var emailInfo = jsonUtils.toObject(localStorageUtils.getParam("emailDetailInfo"));
    // console.log(emailInfo);
    messageID = emailInfo.id;
    receiveOrSend = emailInfo.IsSend;

    if (receiveOrSend == 0){
        var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/inbox_detail","stationEmailId":"'+ messageID +'"}';
        ajaxUtil.ajaxByAsyncPost1(null, param, emailDetailCallback_Rec,'正在加载数据...');
    }else{
        var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/sendbox_detail","StationEmailId":"'+ messageID +'"}';
        ajaxUtil.ajaxByAsyncPost1(null, param, emailDetailCallback_Send,'正在加载数据...');
    }
}

//@ 收件箱详情-返回数据
function emailDetailCallback_Rec(cb) {
    if (cb.Code == 200){
        var receiveDetail = cb["Data"];
        var time = receiveDetail["SendTime"];
        var title = receiveDetail["Title"];
        var content = receiveDetail["Content"];
        var sendPerLevel = receiveDetail["SenderNameLevel"];
        var sendPerson = receiveDetail["SenderName"];
        var SendUserID = receiveDetail["SenderId"];
        displayEmailContent(time, sendPerson, title, content,sendPerLevel,SendUserID);
    } else if(($.inArray(cb.Code,[401,402,403,404,405,406,423]) > -1)){
        loginAgain();
    } else{
       toastUtils.showToast(data.Msg);
    }
}

//@ 发件箱详情-返回数据
function emailDetailCallback_Send(cb) {
    if (cb.Code == 200){
        var sendDetail = cb["Data"];
        var time = sendDetail["SendTime"];
        var title = sendDetail["Title"];
        var content = sendDetail["Content"];
        var sendRange = sendDetail["SendRange"];
        var sendPerson = sendDetail["SenderName"];
        var SendUserID = sendDetail["SenderId"];
        var SendPersonLevel = sendDetail["SenderNameLevel"];
        if (SendPersonLevel == 1){
            var whoReceive = "上级";
        }else if (SendPersonLevel == 2){
            whoReceive = "下级 <span style='margin-left:5%;' onclick='setPanelBackPage_Fun(\"viewReceiver\")' class='redtext'> 查看所有收件人</span>";
        }
        displayEmailContent(time,whoReceive,title,content,sendPerson);
    }else if( ($.inArray(cb.Code,[401,402,403,404,405,406,423]) > -1) ){
        loginAgain();
    } else{
        toastUtils.showToast(data.Msg);
    }
}

//@ 页面显示
function displayEmailContent(time,person,title,content,level,sendUserID) {
    $("#EmailDeta_time").html(time);
    //处理空格和换行
    content = content.replace(/[\n|\r|\n\r|\r\n]+/g, '<br/>').replace(/\s/g,"&nbsp;");
    $("#EmailDeta_displayCont").html(content);

    if (receiveOrSend == 0){  //收件箱
        var $RecDetailInfo = $('<p><b>发送人</b>：<span>'+ showMsgSource(level, person,true) +
            '</span></p><p><b>消息来源</b>：<span>来自'+ showMsgSource(level, person,false) +
            '</span></p><p><b style="word-break: keep-all;">主题</b>：<span>'+ title +'</span></p>');
        $("#EmailDeta_info").append($RecDetailInfo);

        //Button
        if (level == 3){
            $("#replyEmail").hide();
        }else{
	        // msgControl 与运算(&)后的值 = 1:发消息，2：发件箱，4：收件箱。后台关闭发消息，前台则隐藏回复按钮
	        var msgControl = Number(localStorageUtils.getParam("messageControl"));
	        if( (msgControl&1) == 1){
		        $("#replyEmail").show();
	        }else {
		        $("#replyEmail").hide();
	        }
	        $("#replyEmail").off('click');
	        $("#replyEmail").on('click',function () {
		        var checkedArr = [];
		        if (level == 2){
			        checkedArr.push({name:'上级',id:'-1',theme:title});
		        }else if (level == 1){
			        checkedArr.push({name:person,id:sendUserID,theme:title});
		        }
		        localStorageUtils.setParam("checkedPerson",jsonUtils.toString(checkedArr));
		        setPanelBackPage_Fun('sendEmail');
	        });
        }
    }else {  //发件箱
        var $SendDetailInfo = $('<p><b>收件人</b>：<span>'+ person +
            '</span></p><p><b>发件人</b>：<span>'+ level +
            '</span></p><p><b style="word-break: keep-all;">主题</b>：<span>'+ title +'</span></p>');
        $("#EmailDeta_info").append($SendDetailInfo);
        //Button
        $("#replyEmail").hide();
    }
}

//@ 收件箱-消息来源显示
function showMsgSource(level,person,IsShow) {
    if (level == 3){
        return IsShow ? "系统消息" : "平台";
    } else if (level == 2){
        return "上级";
    } else{
        return IsShow ? person : "下级";
    }
}


