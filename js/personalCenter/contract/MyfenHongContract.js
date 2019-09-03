
var myUserName;
var myUserID;

/*进入panel时调用*/
function MyfenHongContractLoadedPanel(){
    catchErrorFun("MyfenHongContractInit();");
}

/*离开panel时调用*/
function MyfenHongContractUnloadedPanel(){
    $("#myFenHong_notModify").empty();
    $("#myFenHong_Modified").empty();
}

//@ Init
function MyfenHongContractInit() {
    var modifyCttInfo = jsonUtils.toObject(localStorageUtils.getParam("modifyCttInfo"));
    myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
    var myState;

    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetContract","ProjectPublic_PlatformCode":2,"UserName":""}', function (data) {
        if(data.Code == 200){
		    myState = data.Data.State;
        	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetContractDetails","ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'","IsState":' + myState +'}', getMyfenHongInfo, '正在加载数据...');
		}
    }, '正在加载数据...');
}

//@ 获取我的分红契约数据并显示
function getMyfenHongInfo(data) {
	if(data.Code == 200){
	    var list = data.Data.ContractContentModels;
        if (list.length == 0){
            $("#myFenHong_notModify").append('<ul class="recordDetail"><p style="text-align: center;">无记录</p></ul>');
            $("#myFenHong_Modified").parent('div').hide();
        }else{
            for (var i = 0;i< list.length; i++){
                var $panel = $('<ul class="recordDetail my-fenhong-ctt"><li><span>消费额：</span><span>亏损额：</span></li>'+
                    '<li><span class="redtext">'+ list[i].BetMoneyMin +'</span><span class="redtext">' + list[i].LossMoneyMin +
                    '</span></li><li><span>活跃人数：</span><span>分红比例：</span></li><li><span class="redtext">'+ list[i].ActivePersonNum +
                    '</span><span class="redtext">' + bigNumberUtil.multiply(100,list[i].DividendRatio) +' %</span></li></ul>');

                list[i].IsHistoryData ? $("#myFenHong_Modified").append($panel) : $("#myFenHong_notModify").append($panel);
            }

           /* if (!$("#myFenHong_notModify").children('ul').length){
                $("#myFenHong_notModify").append('<ul class="recordDetail"><p style="text-align: center;">无记录</p></ul>');
            }*/

            if ($("#myFenHong_Modified").children('ul').length){
                $("#myFenHong_Modified").parent('div').show();
                $("#myFenHong_Modified").append('<a class="loginBtn" style="margin-top:40px;" onclick="AgreeMyFenHong(1)">同意</a>');
            }else {
                $("#myFenHong_Modified").parent('div').hide();
                // $("#myFenHong_Modified").append('<ul class="recordDetail"><p style="text-align: center;">无记录</p></ul>');
            }
        }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 同意按钮
function AgreeMyFenHong(IsAgree) {
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/AgreeContract","ProjectPublic_PlatformCode":2,"IsAgree":'+ IsAgree +',"UserName":"'+ myUserName +'","UserID":'+ myUserID +'}', function (data) {
        if(data.Code == 200){
		    if (data.Data.Result){
                toastUtils.showToast("您已同意分红契约");
                $("#myFenHong_Modified a").css('display',"none");
                setPanelBackPage_Fun("contractManage");
            }else {
                toastUtils.showToast("同意失败，请稍后再试");
            }
		}else{
		    toastUtils.showToast(data.Msg);
		}
    }, '正在加载数据...');
}