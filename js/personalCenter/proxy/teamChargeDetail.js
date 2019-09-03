
/*进入panel时调用*/
function teamChargeDetailLoadedPanel(){
	catchErrorFun("teamChargeDetailInit();");
}
/*离开panel时调用*/
function teamChargeDetailUnloadedPanel(){
	 
}
function teamChargeDetailInit(){
    var teamChargeItem = JSON.parse(localStorageUtils.getParam("teamCharge"));
    $("#orderId_cz").html(teamChargeItem.orderId);
    $("#account_cz").html(teamChargeItem.accountnum);
    $("#money_cz").html(teamChargeItem.tmoney + " 元");
    $("#feeMoney_cz").html(teamChargeItem.feeMoney + " 元");
    $("#paytype_cz").html(teamChargeItem.payType);
    $("#state_cz").html(teamChargeItem.state);
    $("#details_cz").html(teamChargeItem.details);
    $("#datetime_cz").html(teamChargeItem.optime);
}