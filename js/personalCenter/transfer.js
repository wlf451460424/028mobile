'use strict';
var userName = "";
var thirdPartyTransfer_Arr = [];

var thirdPartID = "";
var transeferType = "";

//@ 进入页面加载
function transferLoadedPanel() {
	catchErrorFun("transferLoadedinit();");
}

//@ 页面离开时加载
function transferUnloadedPanel() {
	flag = 6;
	$("#transferMoney").val("");
	$("#fundPassword").val("");
	$("#transfer_out_balance").text("--");
	$("#transfer_in_balance").text("--");
	thirdPartID = "";
	transeferType = "";
	$("#fundTransfer_select_out").empty();
	$("#fundTransfer_select_in").empty();
}

//@ 初始化
function transferLoadedinit() {
	//获取第三方可展示的平台
	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyTransferDirection"}', function (data) {
		if ( data.Code == 200 ) {
			thirdPartyTransfer_Arr = data.Data.TransferDirection || [];
			init_transfer_view(thirdPartyTransfer_Arr);
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	}, '正在加载数据');

	//提交按钮
	$("#transferSubmit").off('click');
	$("#transferSubmit").on("click", function () {
		postTransferSubmit();
	});
}

//@ 初始化转账显示信息
function init_transfer_view(thirdPartyTransfer_Arr) {
	//转出账户
	var $select_out = $('<select  id="transferType_out" data-theme="a" onchange="top_TransferTypeChange()">' +
		'<option value="-2" selected="selected">请选择</option>' +
		'<option value="-1">彩票账户</option>' +
		'</select>');
	$("#fundTransfer_select_out").empty().append($select_out);

	if(thirdPartyTransfer_Arr.length){
		$.each(thirdPartyTransfer_Arr,function (key,val) {
			var $option = $('<option id='+ val.ThirdPartyToLottery +' value='+ val.ThirdpartyValue +'>'+ val.ThirdpartyText +'</option>');
			$("#transferType_out").append($option);
		});
	}

	//转入账户
	var $select_in = $('<select  id="transferType_in" data-theme="a" onchange="sec_TransferTypeChange()">' +
		'<option value="-2" selected="selected">请选择</option></select>');
	$("#fundTransfer_select_in").empty().append($select_in);
}

//@ 改变第三方类型  顶级菜单
function top_TransferTypeChange() {
	var sec_item = $('<option selected="selected" value="-2">请选择</option>');
	$("#transferType_in").empty().append(sec_item);

	var val = $("#transferType_out").val();
	$("#transfer_out_balance").text("--");
	$("#transfer_in_balance").text("--");

	//二级下拉框
	if ( val == -2 ) {//请选择
		transeferType = "";
	}else if ( val == -1 ) { //彩票
		for (var i = 0; i < thirdPartyTransfer_Arr.length; i++) {
			var opton_id_str = thirdPartyTransfer_Arr[i].ThirdpartyValue;
			var from_value = thirdPartyTransfer_Arr[i].LotteryToThirdParty;
			var from_name = thirdPartyTransfer_Arr[i].ThirdpartyText;
			var sec_item = $('<option id=' + opton_id_str + ' value=' + from_value + '>' + from_name + '</option>');
			$("#transferType_in").append(sec_item);
		}
		var lotteryBalance = localStorageUtils.getParam("lotteryMoney");
		$("#transfer_out_balance").text(lotteryBalance);
	}else {  //第三方
		var sec_item = $('<option value="-1">彩票账户</option>');
		$("#transferType_in").append(sec_item);

		getThirdPartyBalance(val,"transfer_out_balance");
	}
}

//@ 次级菜单
function sec_TransferTypeChange() {
	var val = $("#transferType_out").val();
	$("#transfer_in_balance").text("--");

	if ( val == -2 ) {//请选择
		transeferType = "";
	}else if ( val == -1 ) { //彩票
		if ( $("#transferType_in").val() == -1 ) {
			transeferType = "";
		} else {
			//第三方  转向value
			transeferType = $("#transferType_in").val();
			//第三方id
			var options = $("#transferType_in option:selected");
			thirdPartID = options[0].id;

			getThirdPartyBalance(thirdPartID,"transfer_in_balance");
		}
	}else {
		var options = $("#transferType_out option:selected");
		//第三方  转向value
		transeferType = options[0].id;
		//第三方id
		thirdPartID = $("#transferType_out").val();
		if($("#transferType_in").val() == -1){
			$("#transfer_in_balance").text(localStorageUtils.getParam("lotteryMoney"));
		}
	}
}

//获取第三方游戏余额
function getThirdPartyBalance(ThirdpartyValue,showID) {
	//GameBalance
	userName = localStorageUtils.getParam("username");
	ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyGetGamerBalance","ID":"'+ ThirdpartyValue +'","UserName":"'+userName+'"}',function (data) {
		if(data.Code == 200){
		    if(data.Data.Balance && Number(data.Data.Balance) >=0){
				var balance = data.Data.Balance || 0;
				$("#"+ showID).text(balance);
			}else{
				ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyLogin","ID":"'+ ThirdpartyValue +'","UserName":"'+userName+'"}',function (data) {
					if(data.Code == 200){
						//判断第三方登录URL是否有。有的话余额显示为0 没有余额显示--
						if(data.Data.LoginUrl){
							$("#"+ showID).text("0");
						}else{
							$("#"+ showID).text("--");
						}
					}
				},null);
			}
		}else{
		    toastUtils.showToast(data.Msg);
		}
	},"余额查询中...");
}

//@ Submit Button
function postTransferSubmit() {
	if($("#transferType_out").val() == -2){
		toastUtils.showToast("请选择转出账户");
		return;
	}
	if($("#transferType_in").val() == -2){
		toastUtils.showToast("请选择转入账户");
		return;
	}
	if($("#transfer_out_balance").text() == "--"){
		toastUtils.showToast("当前转出账户无余额可用");
		return;
	}

	var type = transeferType;
	var transferMoney = Number($("#transferMoney").val());
	var fundPassword = $("#fundPassword").val();
	var partyId = thirdPartID;

	if ( transferMoney == '' ) {
		toastUtils.showToast("请输入转账金额");
		return;
	} else if ( transferMoney > 50000 ) {
		toastUtils.showToast("转账金额不能大于 50000");
		return;
	} else if ( transferMoney <= 0 ) {
		toastUtils.showToast("转账金额需大于等于0");
		return;
	} else if ( transferMoney > Number($("#transfer_out_balance").text()) ) {
		toastUtils.showToast("转出账户余额不足");
		return;
	}

	if ( fundPassword == '' ) {
		toastUtils.showToast("请输入资金密码");
		return;
	}

	submitTransferInfo(userName, type, transferMoney, fundPassword, partyId);
}

//@ 第三方与彩票余额互转
function submitTransferInfo(userName, type, transferMoney, fundPassword, partyId) {
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyTransefer","UserName":"' + userName + '","TranseferType":"' + type + '","TranseferMoney":' + transferMoney + ',"PayPassWord":"' + fundPassword + '","ID":' + partyId + '}';
	ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
		if ( data.Code == 200 ) {
			if ( data.Data.ResultCode == "1" ) {
				toastUtils.showToast("转账成功");
				$("#transferMoney").val("");
				$("#fundPassword").val("");
				setPanelBackPage_Fun("myLottery");
			} else if ( data.Data.OrderState == -1 || data.Data.OrderState == 3 ) {
				toastUtils.showToast("转账金额不足");
			} else if ( data.Data.OrderState == -3 ) {
				toastUtils.showToast("支付密码错误");
				$("#fundPassword").val("");
			} else if ( data.Data.OrderState == -8 ) {
				toastUtils.showToast("当前用户已被冻结 无法进行转账操作");
			} else if ( data.Data.OrderState == -9 ) {
				toastUtils.showToast("转账金额不合法");
			} else if ( data.Data.OrderState == -10 ) {
				toastUtils.showToast("测试用户不能转账");
			} else if ( data.Data.OrderState == 0 ) {
				toastUtils.showToast("系统异常");
			} else if ( data.Data.OrderState == 1 ) {
				toastUtils.showToast("账号被禁用");
			} else if ( data.Data.OrderState == 2 ) {
				toastUtils.showToast("账号不存在");
			} else if ( data.Data.OrderState == 4 ) {
				toastUtils.showToast("密码错误");
			} else if ( data.Data.OrderState == 5 ) {
				toastUtils.showToast("无效的转账金额");
			} else if ( data.Data.OrderState == 6 ) {
				toastUtils.showToast("未创建游戏");
			}
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	}, null);
}