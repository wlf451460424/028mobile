
/*进入panel时调用*/
function proxyLimitLoadedPanel(){
	catchErrorFun("proxyLimitInit();");
}
/*离开panel时调用*/
function proxyLimitUnloadedPanel(){
	$("#proxyLimitList").empty();
}
function proxyLimitInit(){
    getGetAgentsRenbate();
}

function getGetAgentsRenbate(){
    myRebate = localStorageUtils.getParam("MYRebate");
    ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAgentsRenbate"}', GetAgentsRenbateSuccessCallBack, '正在加载数据...');
}

function GetAgentsRenbateSuccessCallBack(data){
    var UserLevel = Number(localStorageUtils.getParam("UserLevel"));
    var maxShowRebate = 1958;
    if (UserLevel){
        maxShowRebate = (UserLevel == 1 || UserLevel == 2) ? 1958 : 1956;
    }

    if (data.Code == 200) {
    	var getRm = data.Data.GetRm;
        for(var i = 0; i < getRm.length; i++) {
            var dataSet = {};
            //用户返点
            dataSet.rebate = getRm[i].Rebate;
            //已注册人数
            dataSet.regisNum = getRm[i].RegisNum;
            //人数限制
            dataSet.capacity = getRm[i].Capacity;
            //只显示大于等于1950的列表
            if (dataSet.rebate > 1949 && dataSet.rebate <= maxShowRebate){
                var $itemLi = $('<li></li>').data('proxyLimit',dataSet);

                if(dataSet.regisNum < 1){
                    $itemLi.append('<a><dl class="orderList"><dd>序号 :&nbsp;' + i + '</dd><dd>返点 :&nbsp;<span class="red">' + dataSet.rebate +'</span></dd><dd>已注册人数 :&nbsp;'+dataSet.regisNum+'</dd><dd>人数限制 :&nbsp;'+ showLimitInfo(dataSet.capacity) +'</dd></dl></a>');
                    $("#proxyLimitList").append($itemLi);
                }else{
                    $itemLi.append('<a class="recordList"><dl class="orderList"><dd>序号 :&nbsp;' + i + '</dd><dd>返点 :&nbsp;<span class="red">' + dataSet.rebate +'</span></dd><dd>已注册人数 :&nbsp;'+dataSet.regisNum+'</dd><dd>人数限制 :&nbsp;'+ showLimitInfo(dataSet.capacity) +'</dd></dl></a>');
                    $("#proxyLimitList").append($itemLi);
                }
                //点击进入子页面
                $itemLi.on('click',function() {
                    if ($(this).data('proxyLimit').regisNum > 0) {
                        localStorageUtils.setParam("proxyLimit",JSON.stringify($(this).data('proxyLimit')));
                        setPanelBackPage_Fun('proxyLimitDetails');
                    }
                });
            }
        }
    } else {
        toastUtils.showToast(data.Msg);
    }
}
//@ 将返回数据转换为页面显示信息
function showLimitInfo(capacity) {
    if (capacity == -1){
        return '无限制';
    }else{
        return capacity;
    }
}