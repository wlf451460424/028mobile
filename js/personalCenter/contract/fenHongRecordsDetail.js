//@ 进入Panel
function fenHongRecordsDetailLoadedPanel(){
	catchErrorFun("fenHongRecordsDetailInit();");
}

//@ 离开Panel
function fenHongRecordsDetailUnloadedPanel(){
	unloadAtBettingDetail = true;
	$("#fenHongRecordsDetailList").empty();
}

//@ Init
function fenHongRecordsDetailInit(){
	$("#fenHongRecordsDetailList").empty();
	var fenHongItem = JSON.parse(localStorageUtils.getParam("fenHongRecords"));
	var Item=$('<li>用户名：<span>'+ fenHongItem.UserName +
		'</span></li><li>投注总额：<span>'+ fenHongItem.TotalBatMoney +' 元</span></li>' +
		'<li>盈利总额：<span>'+ fenHongItem.TotalProfitLossMoney +
		' 元</span></li><li>活跃人数：<span>'+ fenHongItem.ActivePersonNum +
		'</span></li><li>分红比例：<span>'+ fenHongItem.DividendRatio +
		' %</span></li><li>分红金额：<span>'+ fenHongItem.DividentMoney +
		' 元</span></li><li>时间：<span>'+ fenHongItem.CreateTime +'</span></li>');
	$("#fenHongRecordsDetailList").append(Item);
}