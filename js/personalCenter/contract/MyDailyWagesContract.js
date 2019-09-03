
var myUserName;
var myUserID;

/*进入panel时调用*/
function MyDailyWagesContractLoadedPanel(){
    catchErrorFun("MyDailyWagesContractInit();");
}

/*离开panel时调用*/
function MyDailyWagesContractUnloadedPanel(){
    $("#myDailyWages_notModify").empty();
    $("#myDailyWages_Modified").empty();
}

function MyDailyWagesContractInit() {
    myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetDayWagesDetails","ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'"}', function (data) {
        if (data.Code == 200){
            var oldActive = data.Data.OldActivePersonNum;  //活跃人数
            var oldStandard = data.Data.OldStandardMoney;  //达标流水
            var myOldData = data.Data.RewardProportion_OldDataModels;  //列表数据

            var newActive = data.Data.NewActivePersonNum;
            var newStandard = data.Data.NewStandardMoney;
            var myNewData = data.Data.RewardProportion_NewDataModels;

            //@ 修改前
            $("#myDailyWages_notModify").append('<p style="text-align: center;">活跃人数：<span class="red">'+ oldActive +'</span>； 达标流水：<span class="red">'+ oldStandard +'</span></p>');
            $("#myDailyWages_notModify").append('<ul class="recordDetail my-daywage-ctt"><li><span>消费额</span><span>消费奖励比例</span></li></ul>');

            if (myOldData.length > 0){
                $.each(myOldData,function (key,val) {
                    var $oldItem = $('<li><span>'+val.BetMoneyMin +' ≤消费额≤ '+ val.BetMoneyMax+
                        ' </span><span>'+bigNumberUtil.multiply(val.RewardProportion,100)+' %</span></li>');

                    if (val.RewardType == 1){  //只显示消费额
                        $("#myDailyWages_notModify ul").append($oldItem);
                    }
                });
            }else {
                var noOldItem = $('<li><span>无数据</span><span>无数据</span></li>');
                $("#myDailyWages_notModify ul").append(noOldItem);
            }

            //@ 修改后
            $("#myDailyWages_Modified").append('<p style="text-align: center;">活跃人数：<span class="red">'+ newActive +'</span>； 达标流水：<span class="red">'+ newStandard +'</span></p>');
            $("#myDailyWages_Modified").append('<ul class="recordDetail my-daywage-ctt"><li><span>消费额</span><span>消费奖励比例</span></li></ul>');
            $("#myDailyWages_Modified").parent('div').show();

            if (myNewData.length > 0){
                $.each(myNewData,function (key,val) {
                    var $newItem = $('<li><span>'+val.BetMoneyMin +' ≤消费额≤ '+ val.BetMoneyMax+
                        ' </span><span>'+bigNumberUtil.multiply(val.RewardProportion,100)+' %</span></li>');

                    if(val.RewardType == 1){  //只显示消费额
                        $("#myDailyWages_Modified ul").append($newItem);
                    }
                });
                $("#myDailyWages_Modified").append('<a class="loginBtn" style="margin-top:40px;" onclick="AgreeMyDailyWages(1)">同意</a>');

            }else {
                $("#myDailyWages_Modified").parent('div').hide();
                /*var noNewItem = $('<li><span>无数据</span><span>无数据</span></li>');
                $("#myDailyWages_Modified ul").append(noNewItem);*/
            }

        }else {
            toastUtils.showToast(data.Msg);
            return;
        }
    }, '正在加载数据...');
}

//@ 日工资 同意 按钮
function AgreeMyDailyWages(IsAgree) {
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/AgreeDayWages","ProjectPublic_PlatformCode":2,"IsAgree":'+ IsAgree +',"UserName":"'+ myUserName +'","UserID":'+ myUserID +'}', function (data) {
        if(data.Code == 200){
		    if (data.Data.Result){
                toastUtils.showToast("您已同意日工资契约");
                $("#myDailyWages_Modified a").css('display',"none");
                setPanelBackPage_Fun("contractManage");
            }else {
                toastUtils.showToast("同意失败，请稍后再试");
            }
		}else{
		    toastUtils.showToast(data.Msg);
		}
    }, '正在加载数据...');
}