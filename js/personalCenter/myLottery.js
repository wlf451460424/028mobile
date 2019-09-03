/**
 *页面初始化
 */
function myLotteryLoadedPanel() {
    catchErrorFun("myLottery_init();");
}
//离开页面时
function myLotteryUnloadedPanel() {
    flag = 6;
    $("#testAccount").remove();
}

var hms00=" 00:00:00";
var hms59=" 23:59:59";
var page = 1;
var hasMorePage = true;//默认还有分页
//用户名
var userName="";
//彩票余额
var lotteryMoney = '0';
//钱包中心余额
var walletMoney = '0';
var temp = "0";
var flag = 6;
var isAgent=false;
var userRechargeTypeList=new Array();
var IsTestAccount;
var IsTranAccount;
//三个月前+1天
var DayRange_3month = parseInt((new Date(initDefaultDate(-1,'day')) - new Date(initDefaultDate(-3,'month'))+1)/(24*60*60*1000));
var DayRange_1month3day = parseInt((new Date(initDefaultDate(3,'day')) - new Date(initDefaultDate(-1,'month')))/(24*60*60*1000)); //zhuiHao
var DayRange_3month3day = parseInt((new Date(initDefaultDate(3,'day')) - new Date(initDefaultDate(-3,'month'))+1)/(24*60*60*1000));
var DayRange_3month_systemReport = parseInt((new Date(initDefaultDate(0,'day')) - new Date(initDefaultDate(-3,'month'))+1)/(24*60*60*1000));

var isHaveBankCard = false;
var securityState;

//@ 入口函数
function myLottery_init(){
    userName = localStorageUtils.getParam("username");

	//发红包动态显示
	var sendRedPak_show = jsonUtils.toObject(localStorageUtils.getParam("sendRedPak_show"));
	var isOpen = Number(sendRedPak_show.isOpen);  // 0 or 1
	isOpen ? $("#my_redPacketId").show() : $("#my_redPacketId").hide();

	//消息中心 控制权限
	message_control();

	//清空定时器
	if(typeof(setIntervalMoney) != "undefined" && setIntervalMoney ){
		clearInterval(setIntervalMoney);
	}

    //获取金额
    ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}',function(data){
            if (data.Code == 200) {
                var info = data.Data.Context;
                lotteryMoney = data.Data.lotteryMoney;
                walletLockMoney = data.Data.freezeMoney;
                localStorageUtils.setParam("lotteryMoney",parseFloat(lotteryMoney));
                localStorageUtils.setParam("walletLockMoney", parseFloat(walletLockMoney));

                // $("#username_top").html(userName);
                $("#lotteryMoney_top").html(parseFloat(lotteryMoney));
                $("#walletLockMoney").html(parseFloat(walletLockMoney));
            } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
				toastUtils.showToast("请重新登录");
				loginAgain();
			} else {
				toastUtils.showToast(data.Msg);
			}
        },'正在加载数据');

       //获取用户信息
    ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"UserName":"' + userName + '","InterfaceName":"/api/v1/netweb/GetUserDetailNew"}',function(data){
        if (data.Code == 200) {
            var realName = data.Data.UserRealName;
            var userEmail = data.Data.EMail;
            var userQQ = data.Data.QQ;
            var userPhone = data.Data.Mobile;
            var userBank = data.Data.BankCode;
            var userBankNo = data.Data.CardNumber;
            var userFandian = data.Data.QARebate;
            var userProv = data.Data.Province;
            var userCity = data.Data.City;
            var userLevel = data.Data.UserLevel;
            var childCount = data.Data.ChildCount;
            var teamMemberCount = data.Data.TeamMemberCount;
            var myUserID = data.Data.MyUserID;
            var headPortrait = data.Data.HeadPortrait;  //头像
            var NickName = data.Data.NickName;
            isAgent = data.Data.IsAgent;
            IsTestAccount = data.Data.UserType;  //0为正式账户，1为试玩账户
            IsTranAccount = data.Data.IsTranAccount;//转账是否开启, true开启false关闭

            // 显示用户名
            // $("#username_top").html(NickName==''?userName:NickName);

            // 显示昵称
            if (NickName){
                $("#username_top").html(NickName);
            }else{
                $("#username_top").html(userName);  //用户名
            }
            $("#modifyNickName").off('click');
            $("#modifyNickName").on('click',function () {
                if($("#username_top").html()){NickName = $("#username_top").html();}
                modifyNickName(NickName);
            });

            //试玩账户
            /*var NickWidth = $("#username_top").css("width");
            if (IsTestAccount) {
                if ($("#testAccount")){ $("#testAccount").remove(); }
                $("#username_top").parent('p').append('<span id="testAccount" style="position: relative;left:'+NickWidth+';color: #eb1d35;">(试玩)</span>');
            }*/
           	
            // 获取第三方对接配置信息；
			myLottrey_GetThirdPartyInfo();

            //头像
            $("#headPortrait").empty();
            if (!headPortrait){
                headPortrait = 1;
            }
            $("#headPortrait").append('<img src="././images/headIcons/show_'+headPortrait+'.png" style="width: 72px;height: 72px;border-radius:14%;border:2px solid rgba(225,222,222,0.7)"/>');

            localStorageUtils.setParam("MYRebate", data.Data.MyRebate);
            localStorageUtils.setParam("IsShowTran", data.Data.IsShowTran);
            localStorageUtils.setParam("username", data.Data.UserName);
            localStorageUtils.setParam("realName", realName);
            localStorageUtils.setParam("myUserID", myUserID);
            localStorageUtils.setParam("userEmail", userEmail);
            localStorageUtils.setParam("userQQ", userQQ);
            localStorageUtils.setParam("userPhone", userPhone);
            localStorageUtils.setParam("userBank", userBank);
            localStorageUtils.setParam("userBankNo", userBankNo);
            localStorageUtils.setParam("userFandian", userFandian);
            localStorageUtils.setParam("userProv", userProv);
            localStorageUtils.setParam("userCity", userCity);
            localStorageUtils.setParam("userLevel", userLevel);
            localStorageUtils.setParam("childCount", childCount);
            localStorageUtils.setParam("teamMemberCount", teamMemberCount);
            localStorageUtils.setParam("headPorNow",headPortrait);
            localStorageUtils.setParam("drawMinMoney",data.Data.DrawMinMoney);
            localStorageUtils.setParam("drawMaxMoney",data.Data.DrawMaxMoney);
            localStorageUtils.setParam("drawBeginTime",data.Data.DrawBeginTime);
            localStorageUtils.setParam("drawEndTime",data.Data.DrawEndTime);
            localStorageUtils.setParam("UserLevel",data.Data.UserLevel);
            localStorageUtils.setParam("IsContract",data.Data.IsContract);  //是否已签约分红
            localStorageUtils.setParam("IsDayWages",data.Data.IsDayWages);  //是否已签约日结
            localStorageUtils.setParam("DrawCount",data.Data.DrawCount);
            localStorageUtils.setParam("IsTranAccount",data.Data.IsTranAccount);//转账是否开启, true开启false关闭
            	//契约分红 和 契约日结
		    var IsDaywages = data.Data.IsDayWages;
		    var IsContract = data.Data.IsContract;
		    if ((IsDaywages == false && IsContract == false)||(IsContract == null && IsDaywages == null)){
		        $("#showContractManage").hide();
		    }else {
		        $("#showContractManage").show();
		    }
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
    },'正在加载数据');

    //获取充值银行信息
    ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserGroupPaymentNew"}',getUserPayment_callBack,'正在加载数据');

	//充值
    $("#my_rechargeId").off('click');
    $("#my_rechargeId").on('click', function() {
        flag = 1;

		/**    2019.05.17 流程修改;
		*1.验证密保
		*2.验证资金密码
		*3.银行卡
		*4.充值页面
		*/
		
		localStorageUtils.setParam("intoType","myPersonalCenter_chongzhi");
		
		if(IsTestAccount == 1){//0为正式账户，1为试玩账户
			toastUtils.showToast("您无此权限，请联系客服！");
			return;
		}else{
			//检测用户  密保设置   是否填写完毕
			CheckGetSecurityPromptingState();
		}
    });

    //提款
    $("#my_withdrawId").off('click');
    $("#my_withdrawId").on('click', function() {        
        flag = 2;
        
        /**    2019.05.17 流程修改;
		*1.验证密保
		*2.验证资金密码
		*3.银行卡
		*4.充值页面
		*/
        
        localStorageUtils.setParam("intoType","myPersonalCenter_tikuan");
		
		if(IsTestAccount == 1){//0为正式账户，1为试玩账户
			toastUtils.showToast("您无此权限，请联系客服！");
			return;
		}else{
			//检测用户  密保设置   是否填写完毕
			CheckGetSecurityPromptingState();
		}
    });

    //转账
    $("#my_transferId").off('click');
    $("#my_transferId").on('click', function() {
    	var IsTranAccount = localStorageUtils.getParam("IsTranAccount");//转账是否开启, true开启false关闭
		if(IsTranAccount == "false"){
			toastUtils.showToast("您无法转账，请联系客服！");
			return;
		}
        flag = 4;
        
        /**    2019.05.17 流程修改;
		*1.验证密保
		*2.验证资金密码
		*/
		
		Check_mibao();
    });
    
    //红包入口
    $("#my_redPacketId").off('click');
    $("#my_redPacketId").on('click', function() {
        flag = 7;
        
        /**    2019.05.17 流程修改;
		*1.验证密保
		*2.验证资金密码
		*/
		
        Check_mibao();
        
    });
    
    //代理管理
    $("#proxyId").off('click');
    $("#proxyId").on('click', function() {       
        flag = 3;
        
		//检测用户  密保设置   是否填写完毕
		createInitPanel_Fun('proxyManage');
    });

    //第三方游戏平台
    $("#thirdParty_report").off('click');
    $("#thirdParty_report").on('click', function() {
        flag = 5;
        createInitPanel_Fun('gameReport');
    });

    //@ 退出登录
    $("#destroyLogin").off('click');
    $("#destroyLogin").on('click', function() {
        $.ui.actionsheet(
            [{
                text: '您确定要退出吗?',
                cssClasses: '',
                handler: function () {
                }
            }, {
                text: '确定',
                cssClasses: 'themeColor',
                handler: function () {
                    destroyLogin()
                }
            }]
        );
    });

    //@ 站内信 stationEmail
    getStationEmailCount();
    $("#stationEmail").off('click');
    $("#stationEmail").on('click', function() {
        createInitPanel_Fun("EmailLists");
    });

}

// 退出账户
function destroyLogin() {
    var params='{"ProjectPublic_PlatformCode":2,"LoginType":1,"InterfaceName":"/api/v1/netweb/AddUserLoginLog"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
        if ( data.Code == 200) {
            toastUtils.showToast('退出成功');
            var username = localStorageUtils.getParam("LoginUsername");
            var password = localStorageUtils.getParam("LoginPasswd");
            window.localStorage.clear();
            localStorageUtils.setParam("LoginUsername",username);
            localStorageUtils.setParam("LoginPasswd",password);
            localStorageUtils.setParam("isLogin","false");
            //createInitPanel_Fun("lotteryHallPage");
            
            createInitPanel_Fun("loginPage");
            $("#_valid_code_result").val("");
//          loginAgain();

            //清空定时器
            if(typeof(setIntervalMoney) != "undefined" && setIntervalMoney ){
                clearInterval(setIntervalMoney);
            }
        }else{
        	toastUtils.showToast(data.Msg);
        }
    },'正在登出...');
}

// 获取第三方对接配置信息；
function myLottrey_GetThirdPartyInfo(){
	ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyTransferDirection"}',function (data) {
		if (data.Code == 200) {
			Arr_ThirdPartyInfo = [];
			Arr_ThirdPartyInfo = data.Data.TransferDirection;

			if( (Arr_ThirdPartyInfo.length > 0) && (IsTestAccount == 0)){ //有第三方配置   正式账号
				$("#my_transferId").show();
				//2019.4.8  转账记录一直可以查看,转账功能受后台第三方开启关闭限制.(IsShowTransferRecord  记录)
				$("#IsShowTransferRecord").show();
				
				$("#thirdParty_report").show();
			}else {
				$("#my_transferId").hide();
				$("#IsShowTransferRecord").hide();
				
				$("#thirdParty_report").hide();
			}
			
			localStorageUtils.setParam("Arr_ThirdPartyInfo",jsonUtils.toString(Arr_ThirdPartyInfo));  //现只用于：第三方报表展示
		}else {  //返回异常时
			$("#my_transferId").hide();
			$("#IsShowTransferRecord").hide();
			$("#thirdParty_report").hide();
		}

		// 个人中心首页充值，提款，转账，红包，li 宽度自适应
		var li_num = $("#myLotteryTop ul li").size();
		var li_hidden = $("#myLotteryTop ul li:hidden").length;
		$(".myLottery > ul > li").css("width","calc(100% / "+ (li_num-li_hidden) +")");
	},'正在加载数据');
}

//@ 充值信息返回数据
function getUserPayment_callBack(data) {
	if (data.Code == 200) {
		if(!data.Data.MoneyCenterUserInfo.Context){
			toastUtils.showToast("未查询到数据");
			return;
		}
		var allRecMethod = data.Data.MoneyCenterUserInfo.Context[0].AllRecMethod;
		var chargeType_obj = {};
		var chargeTypeInfo_arr = [];
		var chargeID = {};

		if( allRecMethod.length ){
			$.each(allRecMethod,function (key,val) {
				var chargeTypeInfo = val.Order +"_"+ val.ClientPayTypeName +"_"+ val.ID;  //排序_名称_ID
				chargeTypeInfo_arr.push(chargeTypeInfo);
//				chargeTypeInfo_arr.splice(key, 0, chargeTypeInfo);
				chargeType_obj[val.ID] = val;

				if(val.payType.length){
					$.each(val.payType, function (k,v) {
						var chargeID_obj = {};
						//key = payId
						chargeID_obj["bankList"] = v.BankList;
						chargeID_obj["bankCode"] = v.BankCode;
						chargeID_obj["payName"] = v.PayName;
						chargeID_obj["RealPayName"] = v.RealPayName;
						chargeID_obj["MinRecMoney"] = v.MinRecMoney;
						chargeID_obj["MaxRecMoney"] = v.MaxRecMoney;
						chargeID_obj["payTypeId"] = val.ID;          //充值大类ID
						chargeID_obj["payTypeName"] = val.ClientPayTypeName;  //充值大类名称
						
						chargeID_obj["CappingMoney"] = v.CappingMoney;//封顶金额;
						chargeID_obj["FeeMoney"] = v.FeeMoney;//手续费范围;
						chargeID_obj["FeeType"] = v.FeeType; //充值手续费类型: 0-无手续费  1-比例  2-固定金额;
						chargeID_obj["RecConditionRemark"] = v.RecConditionRemark;//充值条件配置信息;

						chargeID[v.PayInType] = chargeID_obj;
					});
				}
			});
		}

		localStorageUtils.setParam("chargeTypeInfo_arr",chargeTypeInfo_arr);  //大类名称，ID和排序
		localStorageUtils.setParam("chargeType_obj",jsonUtils.toString(chargeType_obj));  //大类下所有子类信息
		localStorageUtils.setParam("chargeIdObj",jsonUtils.toString(chargeID));  //key 为 小类ID

		// 返回来的银行大类列表
		userRechargeTypeList = chargeTypeInfo_arr;
	}
}

//@ 检测用户  密保设置   是否填写完毕
function Check_mibao() {
    // FlagType 类型（1：密保 2：提示语）
	var paramSecurity = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetSecurityPromptingState","UserID":"' + localStorageUtils.getParam("myUserID") + '","FlagType":1}';
	ajaxUtil.ajaxByAsyncPost1(null, paramSecurity, Check_mibao_CallBack,null);
}

// 密保设置  Result ( 1：已设置; 0：未设置 )
function Check_mibao_CallBack(data) {
	if(data.Code == 200 ){
		securityState = data.Data.Result;
		if(securityState == 1){
			//检测用户支付密码是否填写完毕
		    Check_mima();
		}else{
			//设置密保;
			toastUtils.showToast("为了确保您的账户安全，请您先对账户进行安全设置");
			createInitPanel_Fun('setSecurity');
		}
	}else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//@ 检测用户支付密码是否填写完毕
function Check_mima() {
    var param = '{"ProjectPublic_PlatformCode":2,"UserName":"' + localStorageUtils.getParam("username") + '","InterfaceName":"/api/v1/netweb/CheckPayOutPwdAndTransferPwd"}';
    ajaxUtil.ajaxByAsyncPost1(null, param, Check_mima_CallBack,null);
}

//@ 查询是否有提款密码
function Check_mima_CallBack(data) {
	if(data.Code == 200 ){
		if (data.Data.Context[0].PayOutPassWord == "1") {//1:有资金密码; 0:无资金密码
			if (4 == flag) { //转账
                createInitPanel_Fun('transfer');
            } else if (7 == flag) {  //红包
            	createInitPanel_Fun('myRedPacket');
        	} else if (41 == flag) {  //给下级转账
            	createInitPanel_Fun('proxyCharge');
            } else if (42 == flag) {  //绑定银行卡
            	createInitPanel_Fun('showBankInfo');
            }
		}else{
			//有密保  没有资金密码   要设置资金密码先回答密保
			toastUtils.showToast("为了确保您的账户安全，请您先对账户进行安全设置");
			SetBankPassword();
		}
	}else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}


//@ 读取站内信 未读的数量
function getStationEmailCount() {
    myUserID = localStorageUtils.getParam("myUserID");
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/unread_count"}';
    ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
       if (data.Code == 200){
           var count = data.Data.Count;
           if (count > 0){
               $("#EmailUnreadCount").attr('class','showUnreadCount');
           }else{
               $("#EmailUnreadCount").removeAttr('class');
           }
        } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
    },null);
}

//@ 修改昵称
function modifyNickName(NickName) {
    NickName = NickName ? NickName : userName;

    setTimeout(function () {
        $.ui.popup({
            title:"修改昵称",
            message:'<p style="text-align: left;padding-left: 16px;">用户名：<span>'+userName+'</span></p><p>昵称：<input style="width:76%;" type="text" id="modifyNick" maxLength="8" minlength="2" onkeyup="this.value=limitLength(this,8)" onblur="this.value=limitLength(this,8)" placeholder="'+ NickName +'" /></p>',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var Nick = $("#modifyNick").val();
                    if(Nick == ""){
                        toastUtils.showToast("请输入昵称");
                        return;
                    }else{
                        if(getStrLength_EnCn(Nick) < 2 || getStrLength_EnCn(Nick) > 8){
                            toastUtils.showToast("请输入2 - 8个字符");
                            return;
                        }else if(/[\':;*?~`!@#$%^&+={}\[\]\<\>\(\),\.]/.test(Nick)){
                            toastUtils.showToast("只能由汉字、字母、数字中的任意一种或多种组成");
                            return;
                        }
                    }
                    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ModifyUserInfo","IsShow":0,"NickName":"'+Nick+'","Type":1}';
                    ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
                        if (data.Code == 200) {
                            if (data.Data.ModifyComplete) {
                                toastUtils.showToast("修改成功");
                                $("#username_top").html(Nick);
                            }else {
                            	if(data.Data.RepeatResult ==-1){
                            		toastUtils.showToast("昵称已存在");
                            	}
                            }
                        } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
							toastUtils.showToast("请重新登录");
							loginAgain();
						} else {
							toastUtils.showToast(data.Msg);
						}
                    },null);
                },
            cancelOnly:false
        });
    },350);
}

//消息中心 控制权限
function message_control() {
	ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/message_control"}',function(data){
		if(data.Code == 200 ){
			var state = data.Data.MsgSigin;
			localStorageUtils.setParam("messageControl",state);
			// msgControl 与运算后的值 = 1:发消息，2：发件箱，4：收件箱
			if( (state&1) != 1 && (state&2) != 2 && (state&4) != 4 ){
				$("#stationEmail").hide();
			}else {
				$("#stationEmail").show();
			}
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	},null);
}

//@ 检测用户  密保设置   是否填写完毕
function CheckGetSecurityPromptingState() {
    // FlagType 类型（1：密保 2：提示语）
	var paramSecurity = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetSecurityPromptingState","UserID":"' + localStorageUtils.getParam("myUserID") + '","FlagType":1}';
	ajaxUtil.ajaxByAsyncPost1(null, paramSecurity, securityCallBack,null);
}

// 密保设置  Result ( 1：已设置; 0：未设置 )
function securityCallBack(data) {
	if(data.Code == 200 ){
		securityState = data.Data.Result;
		localStorageUtils.setParam("securityState",securityState);
		
		if(securityState == 1){
//			//检测用户支付密码是否填写完毕
		    CheckPayOutPwd();
		}else{
			//设置密保;
			toastUtils.showToast("为了确保您的账户安全，请您先对账户进行安全设置");
			createInitPanel_Fun('setSecurity');
		}
	}else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//@ 检测用户支付密码是否填写完毕
function CheckPayOutPwd() {
    var param = '{"ProjectPublic_PlatformCode":2,"UserName":"' + localStorageUtils.getParam("username") + '","InterfaceName":"/api/v1/netweb/CheckPayOutPwdAndTransferPwd"}';
    ajaxUtil.ajaxByAsyncPost1(null, param, successCallBack_CheckPayOutPwd,null);
}

//@ 查询是否有提款密码
function successCallBack_CheckPayOutPwd(data) {
	if(data.Code == 200 ){
		localStorageUtils.setParam("isHasPayPwd", data.Data.Context[0].PayOutPassWord);
		
		if (data.Data.Context[0].PayOutPassWord == "1") {//1:有资金密码; 0:无资金密码
			//查询银行卡
			CheckBankCardNumber();
		}else{
			//有密保  没有资金密码   要设置资金密码先回答密保
			SetBankPassword();
		}
	}else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//接口调用，判断用户有几张卡已绑定
function CheckBankCardNumber() {
	ajaxUtil.ajaxByAsyncPost1(null, '{"ProjectPublic_PlatformCode":2,"UserID":'+localStorageUtils.getParam("myUserID")+',"InterfaceName":"/api/v1/netweb/GetBankCardList"}',function (data) {
	    //生成银行卡列表
		var bankCardList = data.Data["BankCardList"];
		if (bankCardList.length > 0){
			isHaveBankCard = true;
			
			if(flag == 1){
				//跳转充值;
				createInitPanel_Fun('charge');
			}else if(flag == 2){
				//跳转提款;
				createInitPanel_Fun('withdrawal');
			}else if(flag == 41){
				//跳转 下级转账;
				createInitPanel_Fun('proxyCharge');
			}else if(flag == 42){
				//跳转 绑定银行卡;
				createInitPanel_Fun('showBankInfo');
			}
		}else{
			//添加银行卡
			toastUtils.showToast("为了确保您的账户安全，请您先对账户进行安全设置");
			createInitPanel_Fun('modifyBankInfo');
		}
	});
}






//设置资金密码;
function SetBankPassword(){
	if (securityState){
		loadSetSecurityPage_mylotrrey('modifyBankPassword');
	}else{
		createInitPanel_Fun('setSecurity');
	}
}

function loadSetSecurityPage_mylotrrey(nextPage) {
	if (securityState){
		var Security = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetRandomSecurity","UserID":' + localStorageUtils.getParam("myUserID") + ',"FlagType":1,"SecurityCount":1}';
		ajaxUtil.ajaxByAsyncPost1(null, Security, function(data){
			if(data.Code == 200 ){
				var info = data.Data.SecurityQuestionAnswerModels[0];
				var message = '<p>'+ info.Question +'</p><input type="text" minlength="4" maxlength="20" id="security_randomAnswer"/>';
				setTimeout(function () {
					$.ui.popup(
						{
							title:"验证密保问题",
							message:message,
							cancelText:"关闭",
							cancelCallback:
								function(){
								},
							doneText:"确定",
							doneCallback:
								function(){
									var randomAnswer = $("#security_randomAnswer").val();
									//验证答案是否正确
									if (randomAnswer.trim() == ""){
										toastUtils.showToast("请输入验证答案");
//										createInitPanel_Fun('myLottrey');
										//跳转验证资金密码
										CheckGetSecurityPromptingState();
									}else{
										// RecoveryMode -- 找回方式（1：按资金密码 2：通过密保答案找回）
										var paramAnwser = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/RetrievePassword","UserName":"' + localStorageUtils.getParam("username") + '","RecoveryMode":2,"SecurityID":'+ info.ID +',"Answer":"'+ randomAnswer +'"}';
										ajaxUtil.ajaxByAsyncPost1(null, paramAnwser, function (dataAnswer) {
											if (dataAnswer.Data.SystemState == 64){
												if (dataAnswer.Data.Result == 1){
													toastUtils.showToast('验证通过,请先完善资金密码');
													createInitPanel_Fun(nextPage);

												}else if (dataAnswer.Data.Result == -1){
													toastUtils.showToast('资金密码错误');
												}else if (dataAnswer.Data.Result == -2){
													toastUtils.showToast('用户不存在');
												}else if (dataAnswer.Data.Result == -3){
													toastUtils.showToast('密保问题回答错误');
												}else if (dataAnswer.Data.Result == -4){
													toastUtils.showToast('该用户没有设置密保');
												}else if (dataAnswer.Data.Result == -5){
													toastUtils.showToast('该用户没有设置资金密码');
												}else {
													toastUtils.showToast('验证失败');
												}
											} else {
												toastUtils.showToast("当前网络不给力，请稍后再试");
											}
										},null);
									}
								},
							cancelOnly:false
						});
				},300);
			}else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
				toastUtils.showToast("请重新登录");
				loginAgain();
			} else {
				toastUtils.showToast(data.Msg);
			}
		},null);
	}else {
		createInitPanel_Fun(nextPage);
	}
}