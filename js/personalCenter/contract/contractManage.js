/*进入panel时调用*/
function contractManageLoadedPanel(){
    // 日工资
    if (localStorageUtils.getParam("IsDayWages") == "true"){
        $("#showMyDailywages").show();
        ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetDayWagesThreeList","ProjectPublic_PlatformCode":2,"UserName":"","DayWagesState":-1,"UserType":0,"AgentLevel":0,"CurrentPageIndex":0,"CurrentPageSize":10}', newDaywageMsg, '正在加载数据...');
    }else{
        $("#showMyDailywages").hide();
    }

    //亏损日工资
    var myRebate = localStorageUtils.getParam("MYRebate"),
        userLevel = localStorageUtils.getParam("UserLevel");
    if (myRebate == "1956" && userLevel == "3"){
        $("#IsShowLossDwReds").show();
    }else{
        $("#IsShowLossDwReds").hide();
    }

    // 分红
    if (localStorageUtils.getParam("IsContract") == "true"){
        $("#showMyContract").show();
        ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetContract","ProjectPublic_PlatformCode":2,"UserName":"","CurrentPageIndex":0,"CurrentPageSize":10}', newFenHongMsg, '正在加载数据...');
    }else{
        $("#showMyContract").hide();
    }
}

/*离开panel时调用*/
function contractManageUnloadedPanel(){
}

//@ 日工资数据
function newDaywageMsg(data) {
	if(data.Code == 200){
	    localStorageUtils.setParam("newDaywageMsg",data.Data.State);
	    if (data.Data.State == 0){
	        $("#showMyDailywages").find("a.contractManageBtn").css('background',"#e36286").html("我的契约（有契约哦！）");
	    }else{
	        $("#showMyDailywages").find("a.contractManageBtn").css('background',"#fe1e52").html("我的契约");
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
    
}

//@ 分红数据
function newFenHongMsg(data) {
	if(data.Code == 200){
	    localStorageUtils.setParam("newFenHongMsg",data.Data.State);
	    if (data.Data.State == 0){
	        $("#showMyContract").find("a.contractManageBtn").css('background',"#e36286").html("我的契约（有契约哦！）");
	    }else{
	        $("#showMyContract").find("a.contractManageBtn").css('background',"#fe1e52").html("我的契约");
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}