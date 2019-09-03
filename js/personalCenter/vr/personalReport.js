/*进入panel时调用*/
function personalReportLoadedPanel(){
    var userLevel = localStorageUtils.getParam("userLevel");
	if(userLevel == -1){  //会员
		$("#personalReportTeam").hide();
		$("#personalReportTeam").prev('div').hide();
	}else{  //代理
		$("#personalReportTeam").show();
		$("#personalReportTeam").prev('div').show();
	}
}

/*离开panel时调用*/
function personalReportUnloadedPanel(){}
