//@ Load
function getRedPacketRecordDetailLoadedPanel() {
	catchErrorFun("getRedPacketRecordDetail_init()");
}

//@ Unload
function getRedPacketRecordDetailUnloadedPanel() {
	$("#getRedPacketRecordDetailList").empty();
}

//@ Init
function getRedPacketRecordDetail_init() {
	$("#getRedPacketRecordDetailList").empty();

	var getRedPacket = jsonUtils.toObject(localStorageUtils.getParam("getRedPacket"));
	var sysId = getRedPacket.SysId;  // 红包 ID
	var IsHistory = getRedPacket.IsHistory==0?false:true;
	var flag = 0;  // 0：收到,1发出
	var param = '{"InterfaceName":"/api/v1/netweb/redPacket_recordDetail","ProjectPublic_PlatformCode":2,"IsHistory":"'+IsHistory+'","Sysid":"'+ sysId +'","Flag":'+ flag +'}';

	ajaxUtil.ajaxByAsyncPost1(null, param, function (callBack) {
		if(callBack.Code == 200){
			var list = callBack.Data.DetailList;
			var total = callBack.Data.DetailTotal;
			if(total){
				var redPakName = total.Name || "恭喜发财，大吉大利";
				var redPakCount = "共 "+ total.Qty +" 个红包，已抢 "+ total.ReceivedNum +"/"+ total.Qty;
				$("#get_redPak_detail_userName").text(total.UserName);
				$("#get_redPak_detail_name").text(redPakName);
				$("#get_redPak_detail_count").text(redPakCount);
				$("#my_get_redPak_money").text(total.GrabAmount);
				// 头像
				var headPortrait = total.HeadPortrait || 1;
				var images = "images/headIcons/show_"+ headPortrait +".png";
				$("#get_redPak_detail_img").attr("src",images);
			}else {
				$("#get_redPak_detail_img").attr("src","images/headIcons/show_1.png");
				$("#get_redPak_detail_count").text("未查到数据");
			}

			if(list.length){
				$.each(list,function (key,val) {
					var $li;
					if(val.Best){
						$li = $('<li><dl><span>'+ val.UserName +'</span><dt>'+ val.GrabMoney +'元</dt></dl><p>'+ val.GrabTime +'<span>手气最佳</span></p></li>');
					}else{
						$li = $('<li><dl><span>'+ val.UserName +'</span><dt>'+ val.GrabMoney +'元</dt></dl><p>'+ val.GrabTime +'</p></li>');
					}

					$("#getRedPacketRecordDetailList").append($li);
				});
			}

		}else {
			toastUtils.showToast(callBack.Msg);
		}
	},"加载中...");

}