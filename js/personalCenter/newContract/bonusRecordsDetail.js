//@ 进入Panel
function bonusRecordsDetailLoadedPanel(){
	catchErrorFun("bonusRecordsDetailInit();");
}

//@ 离开Panel
function bonusRecordsDetailUnloadedPanel(){
	unloadAtBettingDetail = true;
	$("#bonusRecordsDetailList").empty();
}

//@ Init
function bonusRecordsDetailInit(){
	$("#bonusRecordsDetailList").empty();
	var bonusItem = JSON.parse(localStorageUtils.getParam("bonusRecords"));
	var Item=$('<li>用户名：<span>'+ bonusItem.UserName +
		'</span></li><li>分红类型：<span>'+ bonusItem.TypeName +
		'</span></li><li>销 量 ：<span>'+ bonusItem.TotalBatMoney +' 元' +
		'</span></li><li>盈 亏 ：<span>'+ bonusItem.TotalProfitLossMoney +' 元' +
		'</span></li><li>活跃人数：<span>'+ bonusItem.ActivePersonNum +
		'</span></li><li>分红比例：<span>'+ bonusItem.DividendRatio + '%' +
		'</span></li><li>分红金额：<span>'+ bonusItem.DividentMoney +' 元' +
		'</span></li><li>时间：<span>'+ bonusItem.CreateTime +'</span></li>');
	$("#bonusRecordsDetailList").append(Item);
}