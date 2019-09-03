
/*进入panel时调用*/
function teamWithdrawalDetailLoadedPanel(){
	catchErrorFun("teamWithdrawalDetailInit();");
}
/*离开panel时调用*/
function teamWithdrawalDetailUnloadedPanel(){
	 
}
function teamWithdrawalDetailInit(){
    var teamWithdrawal = JSON.parse(localStorageUtils.getParam("teamWithdrawal"));
        $("#orderId_tk").html(teamWithdrawal.orderId);
        $("#account_tk").html(teamWithdrawal.accountnum);
        $("#money_tk").html(teamWithdrawal.tmoney + "元");
        // $("#type_tk").html(teamWithdrawal.withdrawalType);
        $("#state_tk").html(teamWithdrawal.state);
        $("#details_tk").html(teamWithdrawal.details);
        $("#datetime_tk").html(teamWithdrawal.optime);
}