
/*进入panel时调用*/
function proxyLimitDetailsLoadedPanel(){
	catchErrorFun("proxyLimitDetailsInit();");
}
/*离开panel时调用*/
function proxyLimitDetailsUnloadedPanel(){
	$("#proxyLimitDetailsList").empty();
}
function proxyLimitDetailsInit(){
    getGetSingleAgentsRenbate();
}

function getGetSingleAgentsRenbate(){
    $("#proxyLimitDetailsList").empty();
    var roxyLimit = JSON.parse(localStorageUtils.getParam("proxyLimit"));
   ajaxUtil.ajaxByAsyncPost(null,'{"Rebate":"'+roxyLimit.rebate+'","InterfaceName":"/api/v1/netweb/GetSingleAgentsRenbate","ProjectPublic_PlatformCode":2}', GetSingleAgentsRenbateSuccessCallBack, '正在加载数据...');
}

function GetSingleAgentsRenbateSuccessCallBack(data){
    if (data.Code == 200) {
        var userName = data.Data.UserName;
        var $itemLi = $('<li></li>');
        for(var i = 0; i < userName.length; i++) {
            $itemLi.append('<a><dl class="orderList"><dd>序号:' + (i+1) + '</dd><dd>会员名:<span class="red">' + userName[i] +'</span></dd></dl></a>');                    
        }
        $("#proxyLimitDetailsList").append($itemLi);   
    } else {
        toastUtils.showToast(data.Msg);
        return;
    }
}