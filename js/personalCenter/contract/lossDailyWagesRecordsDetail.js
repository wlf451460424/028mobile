//@ 进入Panel
function lossDailyWagesRecordsDetailLoadedPanel(){
	catchErrorFun("lossDailyWagesRecordsDetailInit();");
}

//@ 离开Panel
function lossDailyWagesRecordsDetailUnloadedPanel(){
	unloadAtBettingDetail = true;
	$("#lossDailyWagesRecordsDetailList").empty();
}

//@ Init
function lossDailyWagesRecordsDetailInit(){
	$("#lossDailyWagesRecordsDetailList").empty();
	var lossDailyWagesItem = JSON.parse(localStorageUtils.getParam("lossDailyWagesRecords"));
	var Item=$('<li>用户名：<span>'+ lossDailyWagesItem.UserName +'</span></li>' +
		'<li>当日亏损：<span>'+ lossDailyWagesItem.LossAmount +'</span></li>' +
		'<li>亏损工资比例：<span>'+ lossDailyWagesItem.DayWagesRatio +' %</span></li>' +
		'<li>投注量：<span>'+ lossDailyWagesItem.SalesVolume +
		' 元</span></li><li>亏损工资：<span>'+ lossDailyWagesItem.DayWagesAmount +
		'</span></li><li>时 间：<span>'+ lossDailyWagesItem.CreateTime +'</span></li>');
	$("#lossDailyWagesRecordsDetailList").append(Item);
}