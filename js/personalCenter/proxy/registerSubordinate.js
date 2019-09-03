//用户名
var userName = "";
var IsAgentType = "true";
//用户ID
var myUserID = "";
var fandian_Register = 0;

/*进入panel时调用*/
function registerSubordinateLoadedPanel(){
	catchErrorFun("registerSubordinateInit();");
}

/*离开panel时调用*/
function registerSubordinateUnloadedPanel(){
 	$("#DfanDianID").empty();
    $("#HYfanDianID").empty();
    $("#usernameid").val("");
    document.getElementById('daiLiID').style.display = "";
    document.getElementById('huiyuanID').style.display = "none";   
    $('#dailiId').removeClass('checkBoxA');
    $('#dailiId').removeClass('checkBox');
    $('#huiyuanId').removeClass('checkBoxA');
    $('#huiyuanId').removeClass('checkBox');  
    $('#huiyuanId').addClass('checkBox');
    $('#dailiId').addClass('checkBoxA');
    IsAgentType = "true";
}

function registerSubordinateInit(){
// ajaxUtil.ajaxByAsyncPost1(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"GetUserDetailNew"}', getUserDetail_proxy);
  
  getUserDetail_proxy();
  
  $("#registerSubmit").off('click');
  $("#registerSubmit").on("click", function() {
            userName = $("#usernameid").val().trim();

            if(IsAgentType == "true"){
               fandian_Register = $("#DfanDianID").val();
            }else{
               fandian_Register = $("#HYfanDianID").val();
            }
            if(!fandian_Register){
                toastUtils.showToast("无可选返点");
                return;
            }

            if (userName == "") {
                toastUtils.showToast("用户名不能为空");
                return;
            }else if(/[\':;*?~`!@#$%^&+={}\[\]\<\>\(\),\.]/.test(userName)){
                toastUtils.showToast("用户名只能由字母、数字中的任意一种或多种组成");
                return;
            } else if (userName.replace(/[^\x00-\xFF]/g, '**').length < 6 || userName.replace(/[^\x00-\xFF]/g, '**').length > 16) {
                toastUtils.showToast("用户名在6-16个字符之间");
                return;
            }else if(!funcChina(userName)){
                toastUtils.showToast("用户名不能包含中文");
                return;
            }

            var passwd = "a123456"; //手动注册默认密码为:a123456
            
            //验证用户是否已存在
            var params='{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/CheckUserName","Username":"'+userName+'"}';
            ajaxUtil.ajaxByAsyncPost(null,params,function(data){
                if ( data.Code == 200) {
	               	if(data.Data.MoneyCenterResult.Result == 1){//  0-用户名不存在             1-存在
	               		toastUtils.showToast('用户名已存在');
	               		return;
	               	}else{
	               		//开户
	               		ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/UserRegist","UserName":"' + userName + '","IsAgent":' + IsAgentType + ',"RegistChild":true,"Password":"' + passwd + '","Rebate":' + fandian_Register + '}', successCallBack_proxy, '正在提交数据中...');
	               	}
                }else{
                	toastUtils.showToast(data.Msg);
                }
            },'正在加载数据...');
  });
}

////@ 我的用户详情返回数据
//function getUserDetail_proxy(data){
//  if (data.SystemState == 64) {
//
//      myUserID = data.MyUserID;  //用户ID
//      var HRebate = data.HRebate;  //会员返点区间
//      var QRebate = data.QRebate;   //前台开户允许范围
//      var XRebate = data.XRebate;  //相邻返点差值
//      var QARebate = data.QARebate; //前台代理返点
//      var UserLevel = data.UserLevel; //当前登录人的代理级别，1:一级；2：二级，依次类推
//      var MyRebate = data.MyRebate;  //我的返点
//
//      var Dfandian = "";   //代理返点
//      var Hfandian = "";  //会员返点
//
//      var rebate = smallest(QRebate, MyRebate, HRebate); // 取三者最小值，用于前台显示的会员返点的最大值，
//
//      var pingJi = true; //true:可平级; false:不可平级
//      if (pingJi){
//          Hfandian = rebate; //@ 会员返点限制
//          Dfandian = Math.min(parseInt(MyRebate), parseInt(QARebate)); //代理返点限制
//      }else{
//          Hfandian = (rebate == MyRebate) ? rebate - XRebate : rebate; //@ 会员返点限制
//          Dfandian = parseInt(MyRebate) > parseInt(QARebate) ? QARebate : MyRebate - XRebate; //代理返点限制
//      }
//
//      $("#DfanDianID").empty();
//      $("#HYfanDianID").empty();
//      $("#HfanDianID").empty();
//
//      var min_Rebate_merchant = parseInt(localStorageUtils.getParam("MinRebate"));  //商户最小返点
//
//      for (var i = Dfandian; min_Rebate_merchant <= i; i--) {
//          $("#DfanDianID").append('<option value=' + i + '>' + i + '/' + ((i-min_Rebate_merchant)/20).toFixed(1) + '</option>');
//          $("#HfanDianID").append('<option value=' + i + '>' + i + '/' + ((i-min_Rebate_merchant)/20).toFixed(1) + '</option>');
//          i = i - 1;
//      }
//      for (var j = Hfandian; min_Rebate_merchant <= j; j--) {
//          $("#HYfanDianID").append('<option value=' + j + '>' + j + '/' + ((j-min_Rebate_merchant)/20).toFixed(1) + '</option>');
//          j = j - 1;
//      }
//  } else if (data.SystemState == -1) {
//      loginAgain();
//  } else {
//      toastUtils.showToast("当前网络不给力，请稍后再试");
//  }
//}


function getUserDetail_proxy(){
    myUserID = localStorageUtils.getParam("myUserID");  //用户ID
    var HandQRebate = localStorageUtils.getParam("HandQRebate"); //会员返点
    var HandRebate = localStorageUtils.getParam("HandRebate"); //代理返点
    var MyRebate = localStorageUtils.getParam("MYRebate");  //我的返点
    var XRebate = parseInt(localStorageUtils.getParam("XRebate")); //相邻返点差值
    
    var Dfandian = "";   //代理返点
    var Hfandian = "";  //会员返点

    var pingJi = true; //true:可平级; false:不可平级
    if (pingJi){
        Hfandian = Math.min(parseInt(MyRebate), parseInt(HandQRebate)); //@ 会员返点限制
        Dfandian = Math.min(parseInt(MyRebate), parseInt(HandRebate)); //代理返点限制

    }else{
        Hfandian = (HandQRebate == MyRebate) ? HandQRebate - XRebate : HandQRebate; //@ 会员返点限制
        Dfandian = parseInt(MyRebate) > parseInt(HandRebate) ? HandRebate : MyRebate - HandRebate; //代理返点限制
    }

    $("#DfanDianID").empty();
    $("#HYfanDianID").empty();
    $("#HfanDianID").empty();
    var min_Rebate = parseInt(localStorageUtils.getParam("MinRebate"));  //商户最小返点
    for (var i = Dfandian; min_Rebate <= i; i--) {
        $("#DfanDianID").append('<option value=' + i + '>' + i + '</option>');
        $("#HfanDianID").append('<option value=' + i + '>' + i + '</option>');
        i = i - 1;
    }
    for (var j = Hfandian; min_Rebate <= j; j--) {
        $("#HYfanDianID").append('<option value=' + j + '>' + j + '</option>');
        j = j - 1;
    }
}


/**
 * Description 注册方法回调函数
 * @param
 * @return data 服务端返数据
 */
function successCallBack_proxy(data) {
    if (data.Code == 200) {
        if (data.Data.RegisterComplete) {
            $("#usernameid").val("");
            document.getElementById('daiLiID').style.display = "";
            document.getElementById('huiyuanID').style.display = "none";
            $('#dailiId').removeClass('checkBoxA');
            $('#dailiId').removeClass('checkBox');
            $('#huiyuanId').removeClass('checkBoxA');
            $('#huiyuanId').removeClass('checkBox');  
            $('#huiyuanId').addClass('checkBox');
            $('#dailiId').addClass('checkBoxA');
            IsAgentType="true";
            var msg = '用户名称: '+ userName +'\n用户返点: '+ fandian_Register +'\n初始密码: a123456 '+'\n平台网址: '+ platform_url +'\n测速网址: '+ testLine_url + '';
            //弹框提示--遮罩层
            setTimeout(function () {
                $.ui.popup(
                    {
                        title:"注册成功",
                        message:'<p style="text-align: center;color:#fe1e52;margin:0;">长按以下内容可复制</p><textarea readonly="readonly" style="line-height: 25px;text-align:left;height:150px;resize:none;">'+ msg +'</textarea>',
                        cancelText:"关闭",
                        cancelCallback:
                            function(){
                            },
                        doneText:"确定",
                        doneCallback:
                            function(){
                            },
                        cancelOnly:false
                    })
            },500);

        }else{
	        if (data.Data.ErrorCode == "4") {
	            toastUtils.showToast("该账号已存在");
	        }else if(data.Data.ErrorCode == "2"){
	            toastUtils.showToast("注册人数已满");
	        }else if(data.Data.ErrorCode == "1"){
	            toastUtils.showToast("此用户不能创建下级");
	        }else if(data.Data.ErrorCode == "-3"){
	            toastUtils.showToast("下级返点不能大于上级返点");
	        }else if(data.Data.ErrorCode == "3"){
		        toastUtils.showToast("注册失败");
	        }else{
	            toastUtils.showToast("请输入正确的用户名");
	        }
	    }
    } else {
        toastUtils.showToast(data.Msg);
    }
}

function SubordinateType(id){
        $('#dailiId').removeClass('checkBoxA');
        $('#dailiId').removeClass('checkBox');
        $('#huiyuanId').removeClass('checkBoxA');
        $('#huiyuanId').removeClass('checkBox');        
      if(id == 1){    
        $('#dailiId').addClass('checkBox');
        $('#huiyuanId').addClass('checkBoxA');
        document.getElementById('daiLiID').style.display = "none";
        document.getElementById('huiyuanID').style.display = "";        
        IsAgentType="false";
      }else{
        $('#huiyuanId').addClass('checkBox');
        $('#dailiId').addClass('checkBoxA');
        document.getElementById('daiLiID').style.display = "";
        document.getElementById('huiyuanID').style.display = "none";        
        IsAgentType="true";
      }
}

//比较三个数的大小
function smallest(a, b, c) {
    var min = function(a, b) {
        return b + ((a - b ) & ((a - b ) >> 31 ) );
    };
    return min(a, min(b, c));
}