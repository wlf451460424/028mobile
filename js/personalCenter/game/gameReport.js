/*进入panel时调用*/
function gameReportLoadedPanel(){
    var userLevel = localStorageUtils.getParam("userLevel");
	if(userLevel == -1){  //会员
		$("#gameReportTeam").hide();
		$("#gameReportTeam").prev('div').hide();
	}else{  //代理
		$("#gameReportTeam").show();
		$("#gameReportTeam").prev('div').show();
	}
}

/*离开panel时调用*/
function gameReportUnloadedPanel(){}
