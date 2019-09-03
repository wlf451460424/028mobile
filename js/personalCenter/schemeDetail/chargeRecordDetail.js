/********** 进入panel时调用  **********/
function chargeRecordDetailLoadedPanel(){
	catchErrorFun("chargeRecordDetailInit();");
}

/********** 离开panel时调用  **********/
function chargeRecordDetailUnloadedPanel(){
	unloadAtBettingDetail = false;
	$("#chargeRecordDetailList").empty();
}
/********** init  **********/
function chargeRecordDetailInit(){
	$("#chargeRecordDetailList").empty();
	var chargeItem = JSON.parse(localStorageUtils.getParam("charge"));
	var $account=$('<li>订单号：<span>'+chargeItem.orderId+'</span></li>' +
		// '<li>账户：<span>'+chargeItem.accountnum+'</span></li>' +
		'<li>充值金额：<span>'+chargeItem.tmoney+' 元</span></li>' +
		'<li>手续费：<span>'+chargeItem.feeMoney+' 元</span></li>' +
		'<li>充值方式：<span>'+chargeItem.payType+'</span></li>' +
		'<li>充值状态：<span>'+chargeItem.state+'</span></li>' +
		'<li>交易时间：<span>'+chargeItem.optime+'</span></li>' +
		'<li>备注：<span>'+chargeItem.details+'</span></li>');
	$("#chargeRecordDetailList").append($account);
	
	var items=$('#chargeRecordDetailList li:eq(4) span');
	if(items[0].innerHTML != "交易成功"){
		items.css('color','red');
	}else{
		items.css('color','green');
	}
}