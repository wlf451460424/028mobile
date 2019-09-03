var bonusItem;
//@ 进入Panel
function bonusSettleLoadedPanel(){
	catchErrorFun("bonusSettleInit();");
}

//@ 离开Panel
function bonusSettleUnloadedPanel(){
	$("#bonusSettleList ul").remove();
	$("#bonusSettlePreview").children().not("p:first-child").remove();
}

var bonusItem;
//@ Init
function bonusSettleInit(){
	bonusItem = jsonUtils.toObject(localStorageUtils.getParam("fenHongCttInfo"));
	var UserID = bonusItem.userID;
	var UserName = bonusItem.userName;
	var TypeParameterId = bonusItem.TypeParameterId;
	$("#bonusSettleListName").html(UserName);
	$("#bonusSettlePreviewName").html(UserName);
	
	//NewGetBonusSettlement（获取用户分红结算展示数据）
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/NewGetBonusSettlement","ProjectPublic_PlatformCode":2,"UserID":'+UserID+',"TypeParameterId":'+TypeParameterId+'}',getbonusSettle_callBack, '正在加载数据...');

	$("#settleMySubBtn").hide();
	$("#settleMySubBtn").off('click');
	$("#settleMySubBtn").on('click',function () {
		//NewBonusSettlement(分红结算)
		ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/NewBonusSettlement","ProjectPublic_PlatformCode":2,"DownUserId":' + UserID + ',"DownUserName":"'+ UserName +'","TypeParameterId":'+TypeParameterId+',"TypeName":"'+ bonusItem.TypeName +'"}', settleMySubordinate_callBack , '正在加载数据...');
	});
}

//@ 获取分红结算数据
function getbonusSettle_callBack(data) {
	if(data.Code == 200){
	    $("#bonusName").html(bonusItem.TypeName);
		$("#bonusCycle").html(data.Data.DividendCycle);
		var list = data.Data.GetDividendContractList;
		var preview = data.Data.GetBonusPreviewModels;
		$("#settleMySubBtn").show();  //结算按钮
		
		if(data.Data.DataCount == 0){
			$("#bonusSettleList").append('<ul class="recordDetail"><p style="text-align: center;">无数据</p></ul>');
			$("#bonusSettlePreview").append('<ul class="recordDetail"><p style="text-align: center;">无数据</p></ul>');
			return;
		}
		
		//分红契约显示
		if (list.length > 0){
			for(var i =0; i< list.length; i++){
				var $listItem = $('<ul class="recordDetail"><li>销量：<span>'+ list[i].Expenditure +
					'</span></li><li>亏损：<span>'+ list[i].LossAmount +'</span></li>' +
					'<li>活跃人数：<span>'+ list[i].ActivePeopleNum +
					'</span></li><li>分红比例：<span>'+ bigNumberUtil.multiply(100,list[i].DividendRatio) + '%</span></li></ul>');
				$("#bonusSettleList").append($listItem);
			}
		}else{
			$("#bonusSettleList").append('<ul class="recordDetail"><p style="text-align: center;">无数据</p></ul>');
		}

		//分红预览显示
		var $previewItem = $('<ul class="recordDetail"><li>销量：<span>'+ preview.TotalBets +
			'</span></li><li>盈亏：<span>'+ preview.GrossProfit +'</span></li>' +
			'<li>活跃人数：<span>'+ preview.ActivePeopleNum +
			'</span></li><li>分红比例：<span>'+ bigNumberUtil.multiply(100,preview.DividendRatio) + '%</span></li></ul>');

		$("#bonusSettlePreview").append($previewItem);
		$("#bonusSettlePreview").append('<p style="text-align:center;">应得分红：<span class="red">'+ Math.abs(preview.DeservedDividend) +'</span></p>');

	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 点击分红结算按钮返回数据
function settleMySubordinate_callBack(data) {
	if(data.Code == 200){
	    if (data.Data.Result > 0){
			toastUtils.showToast("分红结算成功");
			$("#settleMySubBtn").hide();
			setPanelBackPage_Fun("bonusList");
		}else {
			switch (data.Data.Result){
				case -1:
					toastUtils.showToast("分红周期已分过分红");
					break;
				case -2:
					toastUtils.showToast("自己不能给自己分红");
					break;
				case -3:
					toastUtils.showToast("余额不足,不能分红");
					break;
				case -4:
					toastUtils.showToast("该用户已结算");
					break;
				default:
					toastUtils.showToast("分红结算失败");
					break;
			}
		}
	}else{
	    toastUtils.showToast(data.Msg);
	}
}
