var myUserName;
var myUserID;

/*进入panel时调用*/
function sharingPrizePoolLoadedPanel(){
	catchErrorFun("sharingPrizePoolInit();");
}

/*离开panel时调用*/
function sharingPrizePoolUnloadedPanel(){
    
}

//@ 初始化
function sharingPrizePoolInit(){
	myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
    
	$("#poolTotal").html("0");
	$("#totalTime").html("0");
	$("#totalPersonal").html("0");
	$("#predictReceive").html("0");
	
	//获取共享奖池的数据
	var param = '{"ProjectPublic_PlatformCode":2,"UserID":'+ myUserID +',"InterfaceName":"/api/v1/netweb/shared_getRewardInfo"}';
    ajaxUtil.ajaxByAsyncPost1(null, param, successCallBack_sharingPrizePool,null);   
    
    $("#ReceivePrizeBtn").off('click');
	$("#ReceivePrizeBtn").on('click',function () {
		//领取奖池奖金
		var param = '{"ProjectPublic_PlatformCode":2,"UserID":'+myUserID+',"InterfaceName":"/api/v1/netweb/shared_receive"}';
    	ajaxUtil.ajaxByAsyncPost1(null, param, successCallBack_ReceivePrize,null);
	});
}

//@return data 共享奖池服务端返数据
function successCallBack_sharingPrizePool(data) {
	if (data.Code == 200){
		$("#poolTotal").html(data.Data.SumMoney);
		$("#totalTime").html(data.Data.BeginTime + "&nbsp&nbsp至&nbsp&nbsp" + data.Data.EndTime);
		$("#totalPersonal").html(data.Data.UserCount);
		$("#predictReceive").html(data.Data.OriginalReward);

		// 是否显示领取按钮
		if(data.Data.IsEnable){
			$("#ReceivePrizeBtn").show();
		}else {
			$("#ReceivePrizeBtn").hide();
		}
	}else{
		var message = data.Msg;
        toastUtils.showToast(message);
	}
}

//@ 点击分红领取按钮返回数据
function successCallBack_ReceivePrize(data) {
	if ( data.Code == 200 ){
		var statusCode = data.Data.StatusCode;
		var message = "";
		switch (statusCode){
			case 1:
				message = "同一IP只能领取一次";
				break;
			case 2:
				message = "您已领取奖金";
				break;
			case 3:
				message = "现在无法领取，请查看具体领取时间";
				break;
			case 4:
				message = "没有查询到用户，请重试";
				break;
			case 5:
				message =  "领取成功";
				$("#ReceivePrizeBtn").hide();
				//获取共享奖池的数据
				var param = '{"ProjectPublic_PlatformCode":2,"UserID":'+ myUserID +',"InterfaceName":"/api/v1/netweb/shared_getRewardInfo"}';
				ajaxUtil.ajaxByAsyncPost1(null, param, successCallBack_sharingPrizePool,null);
				break;
			case 6:
				message = "领取失败";
				break;
		}
		toastUtils.showToast(message);
	}else{
		var message = data.Msg;
		toastUtils.showToast(message);
	}
}