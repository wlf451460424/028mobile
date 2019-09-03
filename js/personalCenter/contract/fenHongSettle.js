//@ 进入Panel
function fenHongSettleLoadedPanel(){
	catchErrorFun("fenHongSettleInit();");
}

//@ 离开Panel
function fenHongSettleUnloadedPanel(){
	$("#fenHongSettleList ul").remove();
	$("#fenHongSettlePreview").children().not("p:first-child").remove();
}

//@ Init
function fenHongSettleInit(){
	var fenHongItem = jsonUtils.toObject(localStorageUtils.getParam("fenHongCttInfo"));
	var UserID = fenHongItem.userID;
	var UserName = fenHongItem.userName;
	$("#fenHongSettleListName").html(UserName);
	$("#fenHongSettlePreviewName").html(UserName);

	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetDividendSettlement","ProjectPublic_PlatformCode":2,"UserID":' + UserID + '}',getfenHongSettle_callBack , '正在加载数据...');

	$("#settleMySubBtn").hide();
	$("#settleMySubBtn").off('click');
	$("#settleMySubBtn").on('click',function () {
		ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/BonusSettlement","ProjectPublic_PlatformCode":2,"DownUserId":' + UserID + ',"DownUserName":"'+ UserName +'"}', settleMySubordinate_callBack , '正在加载数据...');
	});
}

//@ 获取分红结算数据
function getfenHongSettle_callBack(data) {
	if (data.Code == 200){
		$("#fenHongCycle").html(data.Data.DividendCycle);
		var list = data.Data.GetDividendContractList;
		var preview = data.Data.GetBonusPreviewModels;
		$("#settleMySubBtn").show();  //结算按钮

		//分红契约显示
		if (list.length > 0){
			for(var i =0; i< list.length; i++){
				var $listItem = $('<ul class="recordDetail"><li>消费额：<span>'+ list[i].Expenditure +
					'</span></li><li>亏损额：<span>'+ list[i].LossAmount +'</span></li>' +
					'<li>活跃人数：<span>'+ list[i].ActivePeopleNum +
					'</span></li><li>分红比例：<span>'+ bigNumberUtil.multiply(100,list[i].DividendRatio) + '%</span></li></ul>');
				$("#fenHongSettleList").append($listItem);
			}
		}else{
			$("#fenHongSettleList").append('<ul class="recordDetail"><p style="text-align: center;">无数据</p></ul>');
		}

		//分红预览显示
		var $previewItem = $('<ul class="recordDetail"><li>投注总额：<span>'+ preview.TotalBets +
			'</span></li><li>盈利总额：<span>'+ preview.GrossProfit +'</span></li>' +
			'<li>活跃人数：<span>'+ preview.ActivePeopleNum +
			'</span></li><li>分红比例：<span>'+ bigNumberUtil.multiply(100,preview.DividendRatio) + '%</span></li></ul>');

		$("#fenHongSettlePreview").append($previewItem);
		$("#fenHongSettlePreview").append('<p style="text-align:center;">应得分红：<span class="red">'+ Math.abs(preview.DeservedDividend) +'</span></p>');

	}else if(data.Data.DataCount == 0){
		$("#fenHongSettleList").append('<ul class="recordDetail"><p style="text-align: center;">无数据</p></ul>');
		$("#fenHongSettlePreview").append('<ul class="recordDetail"><p style="text-align: center;">无数据</p></ul>');
	}else {
		toastUtils.showToast(data.Msg);
		return;
	}
}

//@ 点击分红结算按钮返回数据
function settleMySubordinate_callBack(data) {
	if (data.Code == 64){
		if (data.Data.Result > 0){
			toastUtils.showToast("分红结算成功");
			$("#settleMySubBtn").hide();
			setPanelBackPage_Fun("fenHongContract");
		}else {
			switch (data.Data.Result){
				case -1:
					toastUtils.showToast("分红周期已过");
					break;
				case -2:
					toastUtils.showToast("不能给自己分红");
					break;
				case -3:
					toastUtils.showToast("余额不足,不能分红");
					break;
				case -4:
					toastUtils.showToast("该用户已结算");
					break;
				default:
					break;
			}
		}
	}else {
		toastUtils.showToast(data.Msg);
		return;
	}
}
