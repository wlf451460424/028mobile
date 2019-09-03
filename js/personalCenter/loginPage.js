/**
 *页面初始化
 */
var VerifyKey = ""; //GA 验证
function loginPageLoadedPanel() {
    //验证码
	showCode();

	//读取存储的用户名和密码，在表单自动填写
    showLoginUsername();

	inputLoginInfo();

	//记住密码勾选项
	var isRememberPwd_label = $("#isRememberPwd").next("label");
	isRememberPwd_label.off("click");
    isRememberPwd_label.on("click",function () {
        var browserType = get_browser_type();
        if(browserType != "safari"){
	        click_check_box("isRememberPwd");
        }
	});
	
    $("#username").blur(function(){
	    showGoogleCode();
  	});
    	
	// Google验证
	showGoogleCode();
    $("#loginInput input[id=validateCode]").off('click');
    $("#loginInput input[id=validateCode]").on('click', function() {
       showGoogleCode();
    });

	//客服
	$("#kefuID_login").off('click');
    $("#kefuID_login").on('click',function (event) {
    	//var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetOnLineServiceUrl"}';
    	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/merchant/online_service_user/get"}';
	    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
	    	if(data.Code == 200){
	            window.open(data.Data.ServiceUrl,"_self");
	        }else{
	            toastUtils.showToast(data.Msg);
	        }
	    },null);
    });

    var _urlHistory = $.ui.urlHistory;
    if(_urlHistory == "#lotteryHallPage" || _urlHistory == "#loginPage" || _urlHistory == "" || _urlHistory =="#zhuce")
    {
        _urlHistory = "myLottery";
    }

	//清空定时器
	if(typeof(setIntervalMoney) != "undefined" && setIntervalMoney ){
		clearInterval(setIntervalMoney);
	}

	
	$("#imgscode").show();
    $("#validateCode").parent().show();
    $("#validateCode").val("点击完成验证");
	$("#_valid_code_result").text("");
    $("#loginbtn").off('click');
    $("#loginbtn").on('click', function() {
        var userNameVal = $("#username").val().trim();
        var pwdVal = $("#passwd").val().trim();
//      var secCodeVal = $("#validateCode").val().trim();
        var gCodeVal = $("#GoogleCode").val().trim();

        if ($("#IsShowGoogleCode").css("display") != "none" && gCodeVal == ""){
            toastUtils.showToast("请输入GA动态密码");
            return;
        }
		
		var secCodeVal = $("#_valid_code_result").text();
        if(userNameVal != "" && pwdVal != "" && secCodeVal != ""){
	        pwdVal = md5(pwdVal);
	        var params = '{"SecCode":"'+ secCodeVal +'","UserLoginName":"' + userNameVal + '","InterfaceName":"/api/v1/netweb/AddUserLoginLogNew","UserPassWord":"' + pwdVal + '","MerchantCode":"027","PlatformCode":2,"gCode":"' + gCodeVal + '","VerifyKey":"' + VerifyKey + '"}';
            ajaxUtil.ajaxByAsyncPost(null,params,function(data){
	            if (data.Code == 200) {
                    $("#validateCode").val("");
		            localStorageUtils.setParam("isLogin","true");
		            localStorageUtils.setParam("username",data.Data.UserName);
		            localStorageUtils.setParam("myUserID",data.Data.UserID);
		            var myRebate = data.Data.Rebate; //当前用户返点
		            localStorageUtils.setParam("MYRebate",myRebate);
		            localStorageUtils.setParam("IsContract",data.Data.IsContract);  //是否已签约分红
		            localStorageUtils.setParam("IsDayWages",data.Data.IsDayWages);  //是否已签约日结
		            localStorageUtils.setParam("IsAgent",data.Data.IsAgent);  //是否代理
		            localStorageUtils.setParam("IsTestAccount",data.Data.UserType);  //是否测试账号:1=测试，0=正式.
					localStorageUtils.setParam("Level",data.Data.UserDetail.Level);  //用户等级

		            //获取彩种
                    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAllMerchantInfo"}';
                    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
                    	if (data.Code == 200) {
                    		maxRebate=data.Data.MaxRebate;
	                        minRebate=data.Data.MinRebate;
	                        isCloseFandian = false;//data.Data.CanRebate == true ?false:true;
		                    var MyRebateDifference = Number(maxRebate - myRebate);
	
		                    // 控制是否显示发红包页面
		                    var sendRedPak_show = {};
		                    sendRedPak_show.isOpen = data.Data.Red_Envelopes_IsOpen;
		                    sendRedPak_show.rebate = data.Data.Rebate;
		                    sendRedPak_show.proxyLevel = data.Data.Proxy_Level;
		                    localStorageUtils.setParam("sendRedPak_show",jsonUtils.toString(sendRedPak_show));
	
		                    //是否显示追号；
		                    localStorageUtils.setParam("IsChaseNumber",data.Data.IsChaseNumber);
		                    //最小投注额；
		                    localStorageUtils.setParam("MinBetMoney",data.Data.MinBetMoney);
		                    //最大投注倍数；
		                    localStorageUtils.setParam("MaxBetMultiple",data.Data.MaxBetMultiple);
		                    //是否允许投注
		                    localStorageUtils.setParam("CommonFlag",data.Data.CommonFlag);
		                    
		                    
		                    //是否允许给下级转账日工资  1=允许(默认)  ，0 =不允许
		                    localStorageUtils.setParam("IsSubTranDailyWage",data.Data.IsSubTranDailyWage);
		                    //代理等级
		                    localStorageUtils.setParam("IsSubTranLevel",data.Data.IsSubTranLevel);
		                    //代理返点
		                    localStorageUtils.setParam("IsSubTranRebate",data.Data.IsSubTranRebate);
		                    
	
	                        if(((Number(data.Data.Mode))&8)==8){
	                            isLiModeClosed = false;
	                        }else{
	                            isLiModeClosed = true;
	                        }
	
	                        if(((Number(data.Data.Mode))&2)==2){
	                            isJiaoModeClosed = false;
	                        }else{
	                            isJiaoModeClosed = true;
	                        }
	
	                        if(((Number(data.Data.Mode))&1)==1){
	                            isFenModeClosed = false;
	                        }else{
	                            isFenModeClosed = true;
	                        }
	                        isCloseFandian = false;
	                        localStorageUtils.setParam("XRebate", data.Data.XRebate);
	                        localStorageUtils.setParam("MerchantCode", data.Data.MerchantCode);
	                        localStorageUtils.setParam("Mode", data.Data.Mode);
	
	                        // 注册返点
		                    localStorageUtils.setParam("QARebate", data.Data.QARebate); //代理（链接）
		                    localStorageUtils.setParam("QRebate", data.Data.QRebate); //会员（链接）
		                    localStorageUtils.setParam("HandRebate", data.Data.HandRebate); //代理（手动）
		                    localStorageUtils.setParam("HandQRebate", data.Data.HandQRebate); //会员 （手动）
	
	                        var arr = new Array();
	                        var prizeArr = new Array();
	                        var FCArr = new Array();
	                        var result = data.Data.LotteryList || [];
	                        var haltSaleId = [];
	                        $.each(result, function(index, item) {
	                            localStorageUtils.removeParam("lotteryID_");
	                            // localStorageUtils.setParam(item.LotteryCode + "SaleState", item.SaleState);
	                            if(item.LotteryCode!='99'){
	                                if('50'==item.LotteryCode){
	                                    localStorageUtils.setParam("MmcLottery","50");
	                                }
	                                if('51'!=item.LotteryCode || '53'!=item.LotteryCode || '55' != item.LotteryCode || '61'!=item.LotteryCode || '63' != item.LotteryCode){
	                                    prizeArr.push(item.LotteryCode);
	                                }
	                                if('51'==item.LotteryCode || '53'==item.LotteryCode || '55' == item.LotteryCode || '61'==item.LotteryCode || '63' == item.LotteryCode){
	                                    FCArr.push(item.LotteryCode);
	                                }
	                                arr.push(item.LotteryCode);
	                                if(data.Data.MinRebate > (item.MaxRebate - MyRebateDifference)){
	                                    localStorageUtils.setParam(item.LotteryCode + "", data.Data.MinRebate);
	                                }else{
	                                    localStorageUtils.setParam(item.LotteryCode + "", (item.MaxRebate - MyRebateDifference));
	                                }
	                                localStorageUtils.setParam("MinRebate", data.Data.MinRebate);
	                                localStorageUtils.setParam("MaxRebate", data.Data.MaxRebate);
	                                //判断某彩种是否停售，并保存
	                                if (item.SaleState == 0){
	                                    haltSaleId.push(item.LotteryCode);
	                                }
	                            }
	                        });
	                        var saleLottery = arr.join(",");
	                        var prizeLottery = prizeArr.join(",");
	                        localStorageUtils.setParam("lotteryID_", arr);
	                        localStorageUtils.setParam("saleLottery", saleLottery.substring(0,saleLottery.length));
	                        localStorageUtils.setParam("prizeLottery", prizeLottery.substring(0,prizeLottery.length));
	                        localStorageUtils.setParam("FCLottery", FCArr);
	                        localStorageUtils.setParam("HaltSale_ID",haltSaleId);  //是否停售
	
	                        //强制修改密码
	                        if ($("#passwd").val() == 'a123456'){
	                            localStorageUtils.setParam('LoginPwdForced',true);
	                            createInitPanel_Fun('modifyPassword');
	                        }else {
	                            localStorageUtils.setParam('LoginPwdForced',false);
//	                            getPanelBackPage_Fun();  //正常登录
	                            createInitPanel_Fun("agreementPage");
	                        }
                    	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
							toastUtils.showToast("请重新登录");
							loginAgain();
						} else {
							toastUtils.showToast(data.Msg);
						}
                    },'正在加载数据');

                    // 记住密码
                    var isRememberPwd = $("#isRememberPwd").prop("checked");
                    if(isRememberPwd){
                        saveLoginInfo();
                    }else {
                        localStorageUtils.removeParam("LoginUsername");
                        localStorageUtils.removeParam("LoginPasswd");
                    }
	            } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
					toastUtils.showToast("请重新登录");
					loginAgain();
				} else {
					//验证码
					showCode();
					toastUtils.showToast(data.Msg);
				}
            },'正在登录...');
        } else if($.trim($("#username").val()) == ""){
            toastUtils.showToast("用户名不能为空!");
        } else if($.trim($("#passwd").val()) == ""){
            toastUtils.showToast("密码不能为空!");
        } else if($.trim($("#validateCode").val()) == ""){
            toastUtils.showToast("验证码不能为空!");
        }else if($.trim($("#_valid_code_result").val()) == ""){
        	toastUtils.showToast("请滑动图案进行验证");
        	openSlideCode();
        }
    });
}

function loginPageUnloadedPanel() {
    $("#GoogleCode").val("");
}

function showCode() {
//	$("#myCode").attr("src","/checkimage.jpg?"+Math.random());//原始验证码获取。
//  if($("#myCode")[0].src == ""){
//  	showCode();
//  }

	$.post("/checkimage?" + Math.random(), function(d){
        if (d.Code != 200){
            return;
        }
        $("#myCode").attr("src", "data:image/png;base64," + d.Data);
    },"json");
}

//@ 获取用户名和密码并保存
function saveLoginInfo(){
    var userName = $("#username").val(),
        userPwd = $("#passwd").val();
    if(userName){
        localStorageUtils.setParam("LoginUsername", userName);
    }
    if(userPwd){
        localStorageUtils.setParam("LoginPasswd", userPwd);
    }
}

//@ 自动填充用户名到表单
function showLoginUsername(){
    var loginUsername=localStorageUtils.getParam("LoginUsername");
    if(!loginUsername || loginUsername == "null"){
        $("#username").val('');
        $("#passwd").val('');
    }else{
        $("#username").val(loginUsername);
	    showLoginPasswd();
    }
}

//@ 自动填充密码到表单
function showLoginPasswd(){
    var userName = localStorageUtils.getParam("LoginUsername");
    var loginPasswd=localStorageUtils.getParam("LoginPasswd");
    if(!loginPasswd || loginPasswd == "null"){
        $("#passwd").val('');
    }else{
        if($("#username").val() && $("#username").val().trim() == userName){
            $("#passwd").val(loginPasswd);
        }else{
            $("#passwd").val("");
        }
    }
}

//@ 修改用户名输入框的值时，密码清空或回填
function inputUserName(ele){
    var inputName = $(ele).val().trim();
	var userName = localStorageUtils.getParam("LoginUsername");
	var loginPasswd=localStorageUtils.getParam("LoginPasswd");

	if(userName && loginPasswd && userName!=="null" && loginPasswd!=="null" && (inputName == userName)){
		$("#passwd").val(loginPasswd);
    }else {
		$("#passwd").val("");
    }
}

//@ GA验证
var loginNameArr = [];
function showGoogleCode() {
    var username = $('#username').val().trim();
    //相同名字不可重复请求接口
    loginNameArr.push(username);
    if (loginNameArr.length > 2){
        loginNameArr.shift();
    }
    if (loginNameArr.length > 1 && loginNameArr[0] == loginNameArr[1]){
        return;
    }
    if (username != ''){
        var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetVerificationMode","UserName":"' + username + '"}';

        $.ajax({
            type : "post",
            url : "/manager/service",
            dataType : "json",
            data :{ "message" : param },
            async : true,  //异步获取数据
            success : function(data){
                if (data.Code == 200){
                    if ($.inArray('1',data.Data.VerificationModes.split(',')) != -1){
                        $('#IsShowGoogleCode').show();
                    }else{
                        $('#IsShowGoogleCode').hide();
                    }
                    $("#GoogleCode").val("");
                    VerifyKey = data.Data.VerificationKeys;
                }
            }
        });
    }
}

//@ check box 点击切换状态
function click_check_box(checkboxID) {
	var isCheckedID = $("#"+ checkboxID +"");

    if (isCheckedID.prop('checked')){
        isCheckedID.prop("checked",false);
    }else{
        isCheckedID.prop("checked",true);
    }
}

//@ 动态效果：当输入框输入内容时，图标变亮.
function inputLoginInfo() {
	var currentInput = $("#loginInput input");
	$.each(currentInput,function (key,val) {
		if( val.id != "isRememberPwd" && val.value ){
			$(val).addClass("lighting");
		}else {
			$(val).removeClass("lighting");
		}
		//input event
		$(val).off("input").on("input",function () {
			if( val.value ){
				$(val).addClass("lighting");
			}else {
				$(val).removeClass("lighting");
			}
		});
	});
}
