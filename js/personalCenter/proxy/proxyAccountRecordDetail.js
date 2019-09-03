/********** 进入panel时调用  **********/
function proxyAccountRecordDetailLoadedPanel(){
	catchErrorFun("proxyAccountRecordDetailInit();");
}

/********** 离开panel时调用  **********/
function proxyAccountRecordDetailUnloadedPanel(){
	$("#proxyAccountDetailList").empty();
}

/********** init  **********/
function proxyAccountRecordDetailInit(){
	var accountItem = JSON.parse(localStorageUtils.getParam("proxyAaccount"));
	var DetailsSource = accountItem.DetailsSource;

    var $account = $('<li>流水号：<span>'+accountItem.orderId+'</span></li>' +
	    '<li>交易金额：<span>'+accountItem.ufmoney+'</span></li>' +
	    '<li>剩余余额：<span>'+accountItem.cbalaces+'元</span></li>' +
	    '<li>交易类型：<span>'+accountItem.tranType+'</span></li>' +
	    '<li>交易时间：<span>'+accountItem.optime+'</span></li>' +
	    '<li>备注：<span>'+accountItem.details+'</span></li>');

	//流水号点击可查看订单详情。可点击的类型包括：投注，来自下级的返点，自身返点。撤单，中奖，撤奖。
	if( $.inArray(Number(DetailsSource) ,[1,10,11,12,13,30,40,50,60]) > -1 ){
		var orderId = $account[0];  // 流水号Li
		$(orderId).children("span")
			.css({"color":"#1ea6fc","borderBottom":"1px solid #1ea6fc"})
			.off("click").on("click",function () {
			var searchData = {};
			searchData.lotteryType = 0; //彩种默认为0
			searchData.bettingorderID = accountItem.orderId;  //流水号
//			searchData.lotteryType = accountItem.lotteryType;  //彩种id
			localStorageUtils.setParam("scheme",jsonUtils.toString(searchData));  //传到 bettingOrderDetails 的数据，用于接口传参
			setPanelBackPage_Fun('bettingOrderDetails');
		});
	}

	$("#proxyAccountDetailList").empty().append($account);
}