
/*进入panel时调用*/
function teamPersonalReportSubordinateDetailLoadedPanel(){
    catchErrorFun("teamPersonalReportSubordinateDetailInit();");
}
/*离开panel时调用*/
function teamPersonalReportSubordinateDetailUnloadedPanel(){
    $("#teamPersonalReportSubordinateDetailUlId").empty();
}
function teamPersonalReportSubordinateDetailInit(){
    $("#teamPersonalReportSubordinateDetailUlId").empty();
    var $SubordinateDetailUl=$('<ul class="recordDetail">' +
        '<li>用户名：<span id="grd_username"></span></li>' +
        '<li>类 型：<span id="grd_type"></span></li>' +
        '<li>投注金额：<span id="grd_cost"></span></li>' +
        '<li>中奖金额：<span id="grd_get"></span></li>' +
        '<li>其他收入：<span id="grd_dailywage"></span></li>' +
        '<li>打赏金额：<span id="grd_Rewards"></span></li>' +
        '<li>盈	  亏：<span id="grd_winloss"></span></li></ul>');
    $("#teamPersonalReportSubordinateDetailUlId").append($SubordinateDetailUl);
    var teamPersonalReportSubordinate = JSON.parse(localStorageUtils.getParam("teamPersonalReportSubordinate"));

    if(parseInt(teamPersonalReportSubordinate.ChildNum) > 0){
        $("#teamPersonalReportSubordinateDetail_back").show();
    }else{
        $("#teamPersonalReportSubordinateDetail_back").hide();
    }

    var subordinateId = teamPersonalReportSubordinate.userId;
    $("#grd_username").html(teamPersonalReportSubordinate.userName);
    $("#grd_type").html(teamPersonalReportSubordinate.category);

    $("#grd_cost").html(Number(teamPersonalReportSubordinate.PersonalPay));//投注金额
    $("#grd_get").html(Number(teamPersonalReportSubordinate.PersonalGet));//中奖金额
    $("#grd_dailywage").html(Number((teamPersonalReportSubordinate.Dailywage || 0) ));//其他收入
    $("#grd_Rewards").html(Number(teamPersonalReportSubordinate.Rewards));//打赏金额
    $("#grd_winloss").html(Number(teamPersonalReportSubordinate.winloss));//盈亏

    $("#teamPersonalReportSubordinateDetail_back").unbind('click');
    $("#teamPersonalReportSubordinateDetail_back").bind('click', function(event) {
        localStorageUtils.setParam("personalSubordinateId", subordinateId);
        setPanelBackPage_Fun('teamPersonalReportSubordinate');
    });

}