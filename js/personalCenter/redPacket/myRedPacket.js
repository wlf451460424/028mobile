//@ Load
function myRedPacketLoadedPanel() {
	catchErrorFun("myRedPacket_init()");
}

//@ Unload
function myRedPacketUnloadedPanel() {

}

//@ Init
function myRedPacket_init() {
	var sendRedPak_show = jsonUtils.toObject(localStorageUtils.getParam("sendRedPak_show"));
	var isOpen = sendRedPak_show.isOpen,
		proxyLevel = sendRedPak_show.proxyLevel,
		rebate = sendRedPak_show.rebate;

	var myRebate = localStorageUtils.getParam("MYRebate"),
		myLevel = localStorageUtils.getParam("UserLevel");

	//会员隐藏发红包和发红包记录项
	if(myLevel == -1){
		$("#is_show_redPak").hide();
		$("#is_show_sendRed_record").hide();

	}else {  //代理判断逻辑
		$("#is_show_sendRed_record").show();
		if (isOpen){
			if(proxyLevel && !rebate  && (myLevel <= proxyLevel) ){
				$("#is_show_redPak").show();
			}else if(rebate && !proxyLevel && (myRebate >= rebate) ){
				$("#is_show_redPak").show();
			}else if( proxyLevel && rebate && (myLevel <= proxyLevel) && (myRebate >= rebate) ){
				$("#is_show_redPak").show();
			}else if(!rebate && !proxyLevel){
				$("#is_show_redPak").show();
			}else {
				$("#is_show_redPak").hide();
			}
		}else {
			$("#is_show_redPak").hide();
		}
	}
}

function click_send_red_packet() {
	var userName = localStorageUtils.getParam("username");
	var param = '{"ProjectPublic_PlatformCode":2,"UserName":"' + userName + '","InterfaceName":"/api/v1/netweb/CheckPayOutPwdAndTransferPwd"}';
	ajaxUtil.ajaxByAsyncPost1(null, param, function (cb) {
		if (cb.Code == 200) {
			var payOutPassWord = cb.Data.Context[0].PayOutPassWord;  //是否有资金密码：1代表有
			if(payOutPassWord == 1){
				createInitPanel_Fun('sendRedPacket');
			}else {
				toastUtils.showToast("请设置资金密码");
				createInitPanel_Fun("personalInfo");
			}
		} else if ($.inArray(cb.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	},null);
}
