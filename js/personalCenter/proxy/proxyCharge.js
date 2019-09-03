var lotteryMoney = "0.00";
//代理用户名
var proxyUserName = "";
//代理用户ID
var thisUserID = "";
var money = 0;
//备注信息
var beizhu = "";
var MYRebate;

//代理用户等级
var thisUserLevel = "";

/*进入panel时调用*/
function proxyChargeLoadedPanel(){
	catchErrorFun("proxyChargeInit();");
}
/*离开panel时调用*/
function proxyChargeUnloadedPanel(){
  $("#proxyLimitDetailsList").empty();
  $("#payMoneyID").val("");
  $("#passwordID").val("");
  $("#beizhuId_").val("");
  $("#baizhuID").empty();
  $("#leixingID").empty();
}

function proxyChargeInit(){
    proxyUserName = localStorageUtils.getParam("proxyUserName");
    thisUserID = localStorageUtils.getParam("proxyUserId");
    MYRebate=localStorageUtils.getParam("MYRebate");
    thisUserLevel = localStorageUtils.getParam("UserLevel");
    $("#welcomeUser_dl").html(proxyUserName);
    
    $("#leixingID").append('<option value="0">普通转账</option>');
    
    //时实获取用户给下级转账配置信息
    ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserRebateContractInfo"}',function(data){
	    if (data.Code == 200) {
	         //"IsSubTranAccount":true,    --是不允许给下级转账
	        localStorageUtils.setParam("IsSubTranAccount",data.Data.IsSubTranAccount);
	        //"IsSubTranDailywages":false,  --是否允许给下级转账日工资
	        localStorageUtils.setParam("IsSubTranDailywages", data.Data.IsSubTranDailywages);
	        
	        //商户信息返回的条件；
	        //是否允许给下级转账日工资  1=允许(默认)  ，0 =不允许
            var MerchantInfo_rigongzi_allow = localStorageUtils.getParam("IsSubTranDailyWage");
            //代理等级
            var MerchantInfo_rigongzi_level = localStorageUtils.getParam("IsSubTranLevel");
            //代理返点
            var MerchantInfo_rigongzi_rebate = localStorageUtils.getParam("IsSubTranRebate");
            
            if(data.Data.IsSubTranDailywages == true && MerchantInfo_rigongzi_allow ==1){//商户信息 个人信息 同时开启 才会显示日工资转账。
            	
        		if(thisUserLevel >= MerchantInfo_rigongzi_level && Number(MYRebate) >= MerchantInfo_rigongzi_rebate){//满足条件才会显示显示
        			$("#leixingID").append('<option value="1">日工资</option>');
        		}
            }
	    } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	},'正在加载数据');
        
        
    $("#baizhuID").append('<option selected="selected" value="转账">转账</option>'+
    	'<option value="分红">分红</option>'+
    	'<option value="奖励">奖励</option>'+
    	'<option value="others">其他</option>');
        
//	//修改为：只有 三级代理，1980 的用户才有给下级转账-日工资。2018.12.10
//  if (thisUserLevel == 3 && Number(MYRebate) == 1980){
//      $("#baizhuID").append('<option selected="selected" value="转账">转账</option>'+
//          '<option value="分红">分红</option>'+
//          '<option value="奖励">奖励</option>'+
//          '<option value="dailyWages">日结（计入报表）</option>'+
//          '<option value="others">其他</option>');
//  }else{
//      $("#baizhuID").append('<option selected="selected" value="转账">转账</option>'+
//          '<option value="分红">分红</option>'+
//          '<option value="奖励">奖励</option>'+
//	        // '<option value="dailyWages">日结</option>'+
//          '<option value="others">其他</option>');
//  }

    getUserMoney();
    beizhuType();

    $("#proxyChargesubmit").off('click');
    $("#proxyChargesubmit").on("click", function() {
      setSubmitPost();
    });
}

function setSubmitPost(){
    var IsShowTran=localStorageUtils.getParam("IsShowTran");


    if(IsShowTran != "1"){
        toastUtils.showToast("您没有权限给下级充值!");
        return;
    }
     /*if(MYRebate < 1956){
        toastUtils.showToast("您没有权限给下级充值!");
        return;
     }*/

    money = $("#payMoneyID").val();
    var passwd = $("#passwordID").val();
    if (money == "") {
         toastUtils.showToast("金额不能为空!");
        return;
    }else if(parseInt(lotteryMoney)=='0'){
        toastUtils.showToast("您当前彩票余额为零,不可以充值!");
        return;
    }else if (50000 < money || money < 1 ) {
         toastUtils.showToast("金额只能在1-50000!");
        return;
    }else if(parseInt(lotteryMoney) < money){
        toastUtils.showToast("充值金额大于当前账户可用金额，请重新输入!");
        return;
    }
    if (passwd == "") {
        toastUtils.showToast("密码不能为空!");
        return;
    }
    if($("#leixingID").val() == 0){  //0：普通转账；1：日工资；
	    if($("#baizhuID").val() == "others"){
	        if($("#beizhuId_").val() ==""){
	          toastUtils.showToast("请输入备注信息!");
	          return;
	        }
	        if(getBeizhuLen($("#beizhuId_").val())  > 10){
	            toastUtils.showToast("备注信息长度不得超过10个字符!");
	          return;
	        }else{
	          beizhu=$("#beizhuId_").val();
	        }
	    }else{
            beizhu=$("#baizhuID").val();
	    }
	    ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/AddTransferInfo_LotteryTransfer","TransferMoney":"' + money + '","TargetUserID":' + thisUserID + ',"TargetUserName":"' + proxyUserName + '","Password":"' + passwd + '","Mark":"' + beizhu + '"}', AddTransferInfoLotteryTransfer, '正在提交数据中...');

    }else{  //日工资；
    	var myUserId = localStorageUtils.getParam("myUserID");
        var userName = jsonUtils.toString(localStorageUtils.getParam("username"));
        var paramDWage = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/DailyWagesTransefer","DailyWages":"' + money + '","UserName":' + userName + ',"UserID":"' + myUserId + '","Password":"' + passwd + '","ToUserName":"' + proxyUserName + '","ToUserID":"' + thisUserID + '"}';
        ajaxUtil.ajaxByAsyncPost(null, paramDWage, AddTransferInfoLotteryTransfer, '正在提交数据中...');
        return;
    }
    
    
    
    $("#proxyChargesubmit").hide();
    
}


//给下级充值回调函数
function AddTransferInfoLotteryTransfer(data) {
	if(data.Code == 200){
	    if(data.Data.StateResult){
        	getUserMoney();
            $("#payMoneyID").val("");
            $("#passwordID").val("");
            $("#beizhuId_").val("");
            toastUtils.showToast("充值成功!");
        }else if(data.Data.ErrorState == "-4"){
	        toastUtils.showToast("当前用户已被冻结无法进行转账操作!");
	    }else if(data.Data.ErrorState == "-5"){
	        toastUtils.showToast("资金密码输错次数过多，用户已被冻结!");
	    }else if(data.Data.ErrorState == "-6"){
	        toastUtils.showToast("您还没有完成与下级的分红契约，无法给下级转账!");
	    }else if(data.Data.ErrorState){
            toastUtils.showToast("资金密码错误!");
        }else{
         	toastUtils.showToast("充值失败!");
        }
	}else{
	    toastUtils.showToast(data.Msg);
	}

    $("#proxyChargesubmit").show();
}

function getUserMoney(){
   ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', GetUserAllMoney_proxy, '正在加载数据...');
}
//金额回调函数
function GetUserAllMoney_proxy(data) {
    if (data.Code == 200) {
        var info = data.Data.Context;
        lotteryMoney = data.Data.lotteryMoney;
        localStorageUtils.setParam("lotteryMoney", lotteryMoney);
        if (lotteryMoney != null || typeof (lotteryMoney) != "undefined") {
            $("#lotteryMoney_dl").html(lotteryMoney + "元");
        } else {
            $("#lotteryMoney_dl").html("0.00" + "元");
        }
    }
}

//当备注为其他时显示输入框
function leixingType(){
    if($("#leixingID").val() == 1){
      document.getElementById('baizhuID_div').style.display = "none";  
    }else{
      document.getElementById('baizhuID_div').style.display = "inline";  
    }
}

//当备注为其他时显示输入框
function beizhuType(){
    if($("#baizhuID").val() =="others"){
      document.getElementById('beizhuxinxiID').style.display = "";  
      $("#beizhuId_").val("");
    }else{
      document.getElementById('beizhuxinxiID').style.display = "none";  
    }
}
function  getBeizhuLen(str) {  
   var len = 0;
    for (var i=0; i<str.length; i++) { 
     var c = str.charCodeAt(i); 
    //单字节加1 
     if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) { 
       len++; 
     } 
     else { 
      len+=2; 
     } 
    } 
    return len;
}
//充值输入框验证
function ValidateNumberSub(e, pnumber) {
    if (!/^\d+[.]?\d*$/.test(pnumber)){
        //检测正则是否匹配
        e.value = /^\d+[.]?\d*/.exec(e.value);
    }
    var payMoney = $("#payMoneyID").val();
    var temp=payMoney.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
    $("#payMoneyID").val(temp);
    return false;
}