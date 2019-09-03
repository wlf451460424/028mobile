//@ 进入Panel
function dailyWagesRecordsNewDetailLoadedPanel(){
    catchErrorFun("dailyWagesRecordsNewDetailInit();");
}

//@ 离开Panel
function dailyWagesRecordsNewDetailUnloadedPanel(){
    unloadAtBettingDetail = true;
    $("#dailyWagesRecordsNewDetailData").empty();
}

//@ Init
function dailyWagesRecordsNewDetailInit(){
    $("#dailyWagesRecordsNewDetailData").empty();
    var dailyWagesItem = JSON.parse(localStorageUtils.getParam("dailyWagesRecordsNew"));
    var Item=$('<li>用户名：<span>'+ dailyWagesItem.UserName +
        '</span></li><li>日结类型：<span>'+ dailyWagesItem.DayWagesType +
        '</span></li><li>销量：<span>'+ dailyWagesItem.SalesVolume +'</span></li>' +
        '</span></li><li>盈亏：<span>'+ dailyWagesItem.LossAmount +
        '</span></li><li>活跃人数：<span>'+ dailyWagesItem.ActivePersonNum +
        '</span></li><li>日结标准：<span>'+ dailyWagesItem.DayWagesRatio +
        '</span></li><li>日结金额：<span>'+ dailyWagesItem.DayWagesAmount + ' 元' +
        '</span></li><li>时 间：<span>'+ dailyWagesItem.CreateTime +'</span></li>');
    $("#dailyWagesRecordsNewDetailData").append(Item);
}