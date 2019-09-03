 //代理用户名
var proxyUserName = "";
 //代理用户ID
var thisUserID = "";
 //用户ID
var userID = "";
var proxyparentID = "";
var fandian=0;
var MYRebate;

/*进入panel时调用*/
function proxyUpgradeLoadedPanel(){
	catchErrorFun("proxyUpgradeInit();");
}
/*离开panel时调用*/
function proxyUpgradeUnloadedPanel(){
   $("#proxyUpgradeId").empty();
   document.getElementById('submitUpgradeID').style.display = "none";
   $("#submitUpgradeID").css("background", "linear-gradient(45deg,#702dfe,#FE5D39)").css("color", "#FFFFFF");
}
function proxyUpgradeInit(){
    // $("#proxyUpgradeId").empty();
    proxyUserName = localStorageUtils.getParam("proxyUserName");
    thisUserID = localStorageUtils.getParam("proxyUserId");
    proxyparentID = localStorageUtils.getParam("proxyparentID");
    userID = localStorageUtils.getParam("myUserID");
    MYRebate = localStorageUtils.getParam("MYRebate");
    //如果是直属关系，则可以设置返点，否则不能
    if(proxyparentID == userID){
        $("#proxyUpgradeId").removeAttr("disabled");
        document.getElementById('submitUpgradeID').style.display = "";
        Getmyteam();
    }else{
        $("#proxyUpgradeId").attr("disabled","disabled");
    }

 //提交返点
  $("#submitUpgradeID").off('click');
  $("#submitUpgradeID").on("click", function() {
    //返点数
    fandian = $("#proxyUpgradeId").val();
    if(fandian == null || fandian == "" || fandian =="null"){
        return;
    }
    ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/SetUserRebate","ThisUserID":' + thisUserID + ',"Rebate":' + fandian + '}', SetUserRebate, '正在提交数据中...');
    });    
}
//给下级充值回调函数
function SetUserRebate(data) {
	if(data.Code == 200){
	    if (data.Data.OrderState==0) {
          	toastUtils.showToast("返点设置成功");
          	$("#proxyUpgradeId").empty();
           	proxyUpgradeInit();
       	}else if(data.Data.OrderState== -1){
         	toastUtils.showToast("该用户没有在上级中");
       	}else if(data.Data.OrderState== -2){
         	toastUtils.showToast("逻辑错误");
       	}else if(data.Data.OrderState== -3){
         	toastUtils.showToast("该返点注册人数已满");
       	}else{
         	toastUtils.showToast("当前网络不给力，请稍后再试");
       	}
	}else{
	    toastUtils.showToast(data.Msg);
	}
}
//获取返点
function Getmyteam(){
    //查询返点  IsP:1 = 可平级  IsP:0 = 不可平级
    ajaxUtil.ajaxByAsyncPost(null, '{"LikeUserName":"'+proxyUserName+'","InterfaceName":"/api/v1/netweb/Getmyteam","IsP":1,"ProjectPublic_PlatformCode":2}',
        searchSuccessCallBack_proxyUpgrade, '正在加载数据...');    
}

function searchSuccessCallBack_proxyUpgrade(data){
    if (data.Code==200) {
     	var myteamList=data.Data.MyteamList[0];
     	localStorageUtils.setParam("myrebate", myteamList.Rebate);
     	var info=myteamList.Parentrebate;
        //如果为空选项，则禁用select。
        if(info.length > 0){
            $("#proxyUpgradeId").removeAttr("disabled");
              //可平级
              for (var i = 0; i < info.length; i++) {
                  $("#proxyUpgradeId").append('<option value=' + info[i] + '>' + info[i]+ '</option>');
              }
       	}else{
           	$("#proxyUpgradeId").attr("disabled","disabled");
           	$("#submitUpgradeID").css("background", "#535353").css("color", "#FFFFFF");
       	}
    }else{
        toastUtils.showToast(data.Msg);
    }
}