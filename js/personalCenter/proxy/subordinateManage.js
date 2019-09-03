
/*离开panel时调用*/
function subordinateManageUnloadedPanel(){
	$("#chargeForProxy").show();
}

/*进入panel时调用*/
function subordinateManageLoadedPanel(){
    catchErrorFun("subordinateManageInit();");
}

/*入口函数*/
function subordinateManageInit() {
    clearSearchTerm("sub");
    var proxyMemberInfo = jsonUtils.toObject(localStorageUtils.getParam("proxyMember"));
    var proxyUsername = proxyMemberInfo.username;
    localStorageUtils.setParam("subordinateName",proxyUsername);// 日结
    localStorageUtils.setParam("proxyUserName", proxyMemberInfo.username); //下级充值
    localStorageUtils.setParam("proxyUserId", proxyMemberInfo.userId);
    localStorageUtils.setParam("proxyparentID", proxyMemberInfo.parentID);
    ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+proxyUsername+'","InterfaceName":"/api/v1/netweb/ShowDailyWagesSetting","ProjectPublic_PlatformCode":2}', getDailywages, '正在提交数据中...');
	
	
	var IsShowTran=localStorageUtils.getParam("IsShowTran");
    if(IsShowTran != "1"){//没有权限给下级充值!
        $("#chargeForProxy").hide();
    }
    
    // 没有资金密码时，无法给下级充值
    $("#chargeForProxy").off('click');
    $("#chargeForProxy").on('click', function(){
//      if(localStorageUtils.getParam("isHasPayPwd") == "0"){
//          toastUtils.showToast("请设置资金密码");
//      } else {
//          createInitPanel_Fun('proxyCharge');
//      }
        
        flag = "41";
        //检测用户  密保设置   是否填写完毕
		Check_mibao();
			
    });
}

/*获取日结信息，并返回数据*/
function getDailywages(data) {
    if (data.Code == 200) {
        if (data.Data.ShowDailyWages){
            // $("#IsShowDailywages").show();
            var MySettlementRatio = data.Data.MySettlementRatio;  //自身日结比例
            var LowerLevelSettlementRatio = data.Data.LowerLevelSettlementRatio;  //直属下级日结比例
            var LowerLevelState = data.Data.LowerLevelState;  //直属下级日结状态 1开启 0关闭
            localStorageUtils.setParam("myDailywages",MySettlementRatio);
            localStorageUtils.setParam("subordinateBili",LowerLevelSettlementRatio);
            localStorageUtils.setParam("dailywagesState",LowerLevelState);
        }else{
            $("#IsShowDailywages").hide();
        }
    } else {
        $("#IsShowDailywages").hide();
        toastUtils.showToast(data.Msg);
    }
}