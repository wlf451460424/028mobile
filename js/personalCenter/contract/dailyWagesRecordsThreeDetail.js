//@ 进入Panel
function dailyWagesRecordsDetailLoadedPanel(){
    catchErrorFun("dailyWagesRecordsDetailInit();");
}

//@ 离开Panel
function dailyWagesRecordsDetailUnloadedPanel(){
    unloadAtBettingDetail = true;
    $("#dailyWagesRecordsDetailList").empty();
}

//@ Init
function dailyWagesRecordsDetailInit(){
    $("#dailyWagesRecordsDetailList").empty();
    var dailyWagesItem = JSON.parse(localStorageUtils.getParam("dailyWagesRecords"));
    var Item=$('<li>用户名：<span>'+ dailyWagesItem.UserName +
        '</span></li><li>发放类型：<span>'+ dailyWages(dailyWagesItem.DetailSource) +'</span></li><li>销量：<span>'+ dailyWagesItem.SalesVolume +'</span></li>' +
        '<li>活跃人数：<span>'+ dailyWagesItem.ActivePersonNum +
        '</span></li><li>日工资标准：<span>'+ dailyWagesItem.DayWagesRatio +
        '</span></li><li>日工资金额：<span>'+ dailyWagesItem.DayWagesAmount +
        ' 元</span></li><li>时 间：<span>'+ dailyWagesItem.CreateTime +'</span></li>');
    $("#dailyWagesRecordsDetailList").append(Item);
}