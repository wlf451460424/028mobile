/********** 进入panel时调用  **********/
function teamAccountDetailsLoadedPanel(){
	catchErrorFun("teamAccountDetailsInit();");
}

/********** 离开panel时调用  **********/
function teamAccountDetailsUnloadedPanel(){
	$("#teamAccountDetailsList").empty();
	unloadAtBettingDetail = false;
}

function teamAccountDetailsInit(){
	var teamAcctItem = JSON.parse(localStorageUtils.getParam("teamAccount"));
	var DetailsSource = teamAcctItem.DetailsSource;
    var $account = $('<li>用户名：<span>'+ teamAcctItem.userName +
		'</span></li><li>流水号：<span>'+ teamAcctItem.orderId +
	    '</span></li><li>交易金额：<span>'+ teamAcctItem.tradeMoney +
	    '</span></li><li>剩余金额：<span>'+ teamAcctItem.thenBalance +
		'</span></li><li>交易类型：<span>'+ teamAcctItem.tradeType +
		'</span></li><li>交易时间：<span>'+ teamAcctItem.insertTime +
		'</span></li><li>备注：<span>'+ teamAcctItem.details +'</span></li>');

	//流水号点击可查看订单详情。可点击的类型包括：投注，来自下级的返点，自身返点。撤单，中奖，撤奖。
	if( $.inArray(Number(DetailsSource) ,[1,10,11,12,13,30,40,50,60]) > -1 ){
		var orderId = $account[1];  // 流水号Li
		$(orderId).children("span")
			.css({"color":"#1ea6fc","borderBottom":"1px solid #1ea6fc"})
			.off("click").on("click",function () {
			var searchData = {};
			searchData.lotteryType = 0; //彩种默认为0
			searchData.bettingorderID = teamAcctItem.orderId;  //流水号
//			searchData.lotteryType = teamAcctItem.lotteryType;  //彩种id
			localStorageUtils.setParam("scheme",jsonUtils.toString(searchData));  //传到 bettingOrderDetails 的数据，用于接口传参
			setPanelBackPage_Fun('bettingOrderDetails');
		});
	}

	$("#teamAccountDetailsList").empty().append($account);
}