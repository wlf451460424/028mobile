
/*进入panel时调用*/
function teamReportSubordinateDetailLoadedPanel(){
	catchErrorFun("teamReportSubordinateDetailInit();");
}
/*离开panel时调用*/
function teamReportSubordinateDetailUnloadedPanel(){
	  $("#teamReportSubordinateDetailUlId").empty();
}
function teamReportSubordinateDetailInit(){
    $("#teamReportSubordinateDetailUlId").empty();
    var $SubordinateDetailUl=$('<ul class="recordDetail"><li>充 值：<span id="charge_sd"></span></li><li>提 款：<span id="withdrawal_sd"></span></li><li>购 彩：<span id="buyLottery_sd"></span></li> <li>返 点：<span id="point_sd"></span></li><li>中 奖：<span id="prize_sd"></span></li><li style="display: none;">日结：<span id="dailywage_sd"></span></li><li>其 他：<span id="others_sd"></span></li><li>盈 亏：<span id="loss_sd"></span></li></ul>');
    $("#teamReportSubordinateDetailUlId").append($SubordinateDetailUl);       
    var teamReportSubordinate = JSON.parse(localStorageUtils.getParam("teamReportSubordinate"));
    var childNumber = teamReportSubordinate.childNum;
        //用户ID
    var subordinateId = teamReportSubordinate.userId;
    if(parseInt(childNumber) > 0){
    	$("#searchSubordinateID").show();
    }else{
    	$("#searchSubordinateID").hide();
    }
    $("#charge_sd").html(teamReportSubordinate.rechargeTotal);
    $("#withdrawal_sd").html(teamReportSubordinate.drawingsTotal);
    $("#buyLottery_sd").html(teamReportSubordinate.buyTotal);
    $("#point_sd").html(teamReportSubordinate.rebateTotal);
    $("#prize_sd").html(teamReportSubordinate.winningTotal);
    $("#loss_sd").html(teamReportSubordinate.gainTotal);
    
    if(teamReportSubordinate.gainTotal < 0){
		$("#loss_sd").css('color','red');
	}else if(teamReportSubordinate.gainTotal > 0){
		$("#loss_sd").css('color','green');
	}else{
		$("#loss_sd").css('color','#FE5D39');
	}

    $("#userId_sd").html(teamReportSubordinate.userName);
    // $("#dailywage_sd").html(teamReportSubordinate.TS_dailyWage);
    $("#others_sd").html(bigNumberUtil.add(teamReportSubordinate.otherTotal,teamReportSubordinate.TS_dailyWage).toString());  //其他+日结

    $("#teamReportSubordinateDetail_back").unbind('click');
    $("#teamReportSubordinateDetail_back").bind('click', function(event) {
    	localStorageUtils.setParam("subordinateId", subordinateId);
    	setPanelBackPage_Fun('teamReportSubordinate');
    });
                    
}