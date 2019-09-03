//@ Load
function sendRedPacketRecordDetailLoadedPanel() {
	catchErrorFun("sendRedPacketRecordDetail_init()");
}

//@ Unload
function sendRedPacketRecordDetailUnloadedPanel() {
	$("#sendRedPacketRecordDetailList").empty();
}

//@ Init
function sendRedPacketRecordDetail_init() {
	$("#sendRedPacketRecordDetailList").empty();

	var sendRedPacket = jsonUtils.toObject(localStorageUtils.getParam("sendRedPacket"));
	var sysId = sendRedPacket.SysId;  // 红包ID
	var IsHistory = sendRedPacket.IsHistory==0?false:true;
	var flag = 1;  // 0：收到,1发出

	var param = '{"InterfaceName":"/api/v1/netweb/redPacket_recordDetail","ProjectPublic_PlatformCode":2,"IsHistory":"'+IsHistory+'","Sysid":"'+ sysId +'","Flag":'+ flag +'}';

	ajaxUtil.ajaxByAsyncPost1(null, param, function (callBack) {
		if(callBack.Code == 200){
			var list = callBack.Data.DetailList;
			var total = callBack.Data.DetailTotal;

			if(total){
				var redPakName = total.Name || "恭喜发财，大吉大利";
				var redPakCount = "共 "+ total.Qty +" 个红包"+ total.Amount +" 元，已抢 "+ total.ReceivedNum +"/"+ total.Qty;

				var redPakCondition = "";
				if(total.PersonConsumption > 0 && total.PersonRechargeMoney == 0){
					redPakCondition = "（消费≥" + total.PersonConsumption + "元，方可领取）";
				}else if(total.PersonConsumption == 0 && total.PersonRechargeMoney > 0){
					redPakCondition = "（充值≥" + total.PersonRechargeMoney + "元，方可领取）";
				}else if(total.PersonConsumption > 0 && total.PersonRechargeMoney > 0){
					redPakCondition = "（消费≥"+ total.PersonConsumption +"元且充值≥"+ total.PersonRechargeMoney +"元，方可领取）";
				}

				$("#send_redPak_detail_userName").text(total.UserName);
				$("#send_redPak_detail_name").text(redPakName);
				$("#send_redPak_detail_count").text(redPakCount + redPakCondition);

				// 头像
				var headPortrait = total.HeadPortrait || 1;
				var images = "images/headIcons/show_"+ headPortrait +".png";
				$("#send_redPak_detail_img").attr("src",images);
			}else {
				$("#send_redPak_detail_img").attr("src","images/headIcons/show_1.png");
				$("#send_redPak_detail_count").text("未查到数据");
			}

			if(list.length){
				$.each(list,function (key,val) {
					var $li;
					if(val.Best){
						$li = $('<li><dl><span>'+ val.UserName +'</span><dt>'+ val.GrabMoney +'元</dt></dl><p>'+ val.GrabTime +'<span>手气最佳</span></p></li>');
					}else{
						$li = $('<li><dl><span>'+ val.UserName +'</span><dt>'+ val.GrabMoney +'元</dt></dl><p>'+ val.GrabTime +'</p></li>');
					}
					$("#sendRedPacketRecordDetailList").append($li);
				});
			}
		}else {
			toastUtils.showToast(callBack.Msg);
		}
	},null);

}
