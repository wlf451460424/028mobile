/*进入panel时调用*/
function contractManageNewLoadedPanel(){
    // 日结
    if (localStorageUtils.getParam("IsDayWages") == "true"){
        $("#showMyDailywages").show();
    }else{
        $("#showMyDailywages").hide();
    }

    // 分红
    if (localStorageUtils.getParam("IsContract") == "true"){
        $("#showMyContract").show();
	    getSystemtType(2);
    }else{
        $("#showMyContract").hide();
    }
}

/*离开panel时调用*/
function contractManageNewUnloadedPanel(){
}

//@ 获取日结或者分红的类型
//类型【1=日结，2=分红、3=私返】
function getSystemtType(queryType) {
	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetSystemMgrType","ProjectPublic_PlatformCode":2,"TypeID":'+ queryType +'}', function (data) {
		if (data.Code == 200){
			var myType = data.Data.SysMgrTypeModel;
			var paramType = myType[0]["Id"];

            ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetBonusContent","ProjectPublic_PlatformCode":2,"UserName":"","ContractState":"-1","TypeParameterId":'+ paramType +',"CurrentPageIndex":0,"CurrentPageSize":10'+'}', newBonusMessage, null);
		}else {
			toastUtils.showToast(data.Msg);
		}
	}, null);
}

//@ 分红数据
function newBonusMessage(data) {
	if(data.Code == 200){
	    if (data.Data.State == 0 && data.Data.IsSubContract == 1){
	        $("#showMyContract").find("a.contractManageBtn").html("我的契约（有契约哦！）");
	    }else{
	        $("#showMyContract").find("a.contractManageBtn").html("我的契约");
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}
