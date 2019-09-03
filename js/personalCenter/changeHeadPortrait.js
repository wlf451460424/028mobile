/*进入panel时调用*/
function changeHeadPortraitLoadedPanel(){
	catchErrorFun("changeHeadPortraitInit();");
}
/*离开panel时调用*/
function changeHeadPortraitUnloadedPanel(){
	$("#headPorShow td span").remove();
}
function changeHeadPortraitInit(){
	var headPorNow = localStorageUtils.getParam("headPorNow");
	var tdWidth = $("#headIcon"+headPorNow+"").parent('td').css('width');
	var leftDistance = parseInt(parseInt(tdWidth)/2 + 8);
	var $selectedBack = $('<span style="position: absolute;left:'+leftDistance+'px;top:59%;"><img src="././images/headIcons/selectedIcon.png" style="width:30px;height:30px;z-index: 10"></span>');
	$("#headIcon"+headPorNow+"").parent('td').append($selectedBack);
	//点击设置
	$("#headPorShow td img").off('click');
    $("#headPorShow td img").on('click',function () {
		var selected = $(this).context.id;
		$("#"+selected+"").parent('td').append($selectedBack);
		var iconId = selected.replace("headIcon","");
			$.ajax({
				type : "post",
				url : "/accountInfo/setHeadIcon",
				data : {"headIcon":iconId},
				async : false,  //同步获取数据
				success : function(data){
					data = jsonUtils.toObject(data);
					if (data.Code == 200) {
						if (data.Data.SetState == 1){
							toastUtils.showToast('设置成功');
							setPanelBackPage_Fun('myLottery');
						}
					}else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
						toastUtils.showToast("请重新登录");
						loginAgain();
					} else {
						toastUtils.showToast(data.Msg);
					}
				}
			});
	});
}
