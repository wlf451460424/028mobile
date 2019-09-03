/*
 * @ 充值页面
 */
var userName = "";  //用户名
var isHasName = false;  //是否注册真实姓名
var payMoney = "";  //充值金额
var payName = "";  //充值银行名称
var bank = "";  //充值银行
var chargeTypeList = [];
var bankID;
var chargeIdObj;
var chargeType_payTypeId;
var	chargeType_payTypeName;

var feeType_onw;
var feeMoney_onw;
var cappingMoney_onw;
var IsTran_onw;
var now_maxRecMoney;

var PayRemark_onw;//备注

var RecConditionRemark_onw;//充值条件配置信息;

//@ Loaded
function chargeLoadedPanel() {
	catchErrorFun("chargeInit();");
}

//@ Unload
function chargeUnloadedPanel() {
	flag=6;
	$("#showPayList").empty();
	$("#chargePayMoney").val("");
}

//@ Init
function chargeInit(){
	$("#charge_type_list ul").empty();  // 大类

	var chargeTypeInfo_arr = localStorageUtils.getParam("chargeTypeInfo_arr").split(",");   // 排序_名称_ID

	if(chargeTypeInfo_arr.length){
		$.each(chargeTypeInfo_arr,function (k,v) {
			var chargeId = v.split("_")[2],
				chargeName = v.split("_")[1];
			var $li = $('<li onclick="get_charge_pay_info('+ chargeId +',this);">'+ chargeName +'</li>');
			$("#charge_type_list ul").append($li);
		});
	}
	//默认展示第一个
	get_charge_pay_info(chargeTypeInfo_arr[0].split("_")[2]);
	$("#charge_type_list ul li:first-of-type").css({"color":"#FE5D39","borderColor":"#FE5D39"});
	chargeType_payTypeId = chargeTypeInfo_arr[0].split("_")[2];  //大类ID
	chargeType_payTypeName = chargeTypeInfo_arr[0].split("_")[1];  //大类名称
	//默认第一个的手续费处理；
	var chargeType_obj = jsonUtils.toObject(localStorageUtils.getParam("chargeType_obj"));
	chargeTypeList=[];
	chargeTypeList = chargeType_obj[chargeTypeInfo_arr[0].split("_")[2]]["payType"];
	feeType_onw = chargeTypeList[0].FeeType;
	feeMoney_onw = chargeTypeList[0].FeeMoney;
	cappingMoney_onw = chargeTypeList[0].CappingMoney ==""?"0.0000":chargeTypeList[0].CappingMoney;
	IsTran_onw = chargeTypeList[0].IsTran;
	PayCardNumber_now = chargeTypeList[0].PayCardNumber;
	PayRemark_onw = chargeTypeList[0].PayRemark;
	RecConditionRemark_onw = chargeTypeList[0].RecConditionRemark;
	shouxufeichuli(feeType_onw,feeMoney_onw,cappingMoney_onw);

	// 获取余额
	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', GetUserAllMoney_charge, null);
	userName = localStorageUtils.getParam("username");

	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"UserName":"' + userName + '","InterfaceName":"/api/v1/netweb/GetUserDetailNew"}', successCallBack_GetUserDetail, null);

	//提交按钮
	$("#chargePaySubmit").off('click');
	$("#chargePaySubmit").on("click", function() {
		postSubmit();
	});

	$('#textID').show();
}

//@ 通过充值大类 ID 获取其下边小类支付方式
function get_charge_pay_info(chargeId,ele) {
	$("#showPayList").empty();  // 小类
	$(ele).css({"color":"#FE5D39","borderColor":"#FE5D39"}).siblings("li").css({"color":"#666666","borderColor":"#c1c1c1"});

	chargeType_payTypeId = chargeId;  //大类ID
	chargeType_payTypeName = $(ele).text();  //大类名称

	var chargeType_obj = jsonUtils.toObject(localStorageUtils.getParam("chargeType_obj"));
	chargeTypeList=[];
	chargeTypeList = chargeType_obj[chargeId]["payType"];

	var testDIV = "";
	for (var i = 0; i < chargeTypeList.length; i++) {
		var choosedID = chargeTypeList[i].PayInType,  //小类充值方式ID
			payName = chargeTypeList[i].PayName;  //小类充值方式展示名称
		var minMoney = chargeTypeList[i].MinRecMoney,
			maxMoney = chargeTypeList[i].MaxRecMoney;
		var FeeType = chargeTypeList[i].FeeType;
		var FeeMoney = chargeTypeList[i].FeeMoney;
		var CappingMoney = chargeTypeList[i].CappingMoney ==""?"0.0000":chargeTypeList[i].CappingMoney;
		var IsTran = chargeTypeList[i].IsTran;  //0：无；1：随机小数且个位不为0；2：整数 ; 3：整百; 
		var PayCardNumber = chargeTypeList[i].PayCardNumber;  
		var PayRemark = chargeTypeList[i].PayRemark;  //备注后台自动配置；
		var RecConditionRemark = chargeTypeList[i].RecConditionRemark;  //充值条件配置信息;
		
		if(i == 0){
			testDIV += '<a onclick="to_change('+ FeeType +','+ FeeMoney +','+ CappingMoney +','+ choosedID +','+ minMoney +','+ maxMoney +','+IsTran+',this);"><dd><div class="userName">' + payName + '</div><div id="chongzhi' + bankID + '" class="checkBoxA"></div><p style="display:none">' + PayCardNumber + '</p><span style="display:none">'+ PayRemark +'</span><span style="display:none">'+ RecConditionRemark +'</span></dd></a>';
			bankID = choosedID;
			setValidDate(minMoney, maxMoney,chargeTypeList[i].IsTran,chargeTypeList[i].PayRemark,chargeTypeList[i].RecConditionRemark);
			feeType_onw = FeeType;
			feeMoney_onw = FeeMoney;
			cappingMoney_onw = CappingMoney;
			IsTran_onw = IsTran;
			PayCardNumber_now = PayCardNumber;
			PayRemark_onw = PayRemark;
			RecConditionRemark_onw = RecConditionRemark;
			shouxufeichuli(feeType_onw,feeMoney_onw,cappingMoney_onw);
			
//			if (IsTran == 1){
//				$('#change_tips').html('注：该支付充值金额个位不能为0且必须是小数，请按照生成的最新金额进行支付，以免影响到帐。');
//			}else if(IsTran == 2){
//				$('#change_tips').html('注：该支付充值金额只支持整数。');			
//			}else{
//				$('#change_tips').html('');
//			}
			
			//0：无；1：随机小数且个位不为0；2：整数 ; 3：整百;    2019.4.23
	        $('#change_tips').html(PayRemark_onw);
	    	if(PayRemark_onw){
	    		$('#change_tips').html('（'+ PayRemark_onw + '）');
	    	}else{
	    		$('#change_tips').html("");
	    	}

		}else{
			testDIV += '<a onclick="to_change('+ FeeType +','+ FeeMoney +','+ CappingMoney +','+ choosedID +','+ minMoney +','+ maxMoney +','+IsTran+',this);"><dd><div class="userName">' + payName + '</div><div id="chongzhi' + bankID + '" class="checkBox"></div><p style="display:none">' + PayCardNumber + '</p><span style="display:none">'+ PayRemark +'</span><span style="display:none">'+ RecConditionRemark +'</span></dd></a>';
		}
	}
	// 判断大类下是否有小类充值方式
	if(testDIV){
		$("#showPayList").append(testDIV);
		$("#tonghangID").show();
	}else {
		$("#showPayList").html("<dd><div class='userName'> 无可选充值方式 </div></dd>");
		$("#tonghangID").hide();
	}
}

var PayCardNumber_now="";
//选择银行，当前银行(子类)被选中
function to_change(feeType,feeMoney,cappingMoney,choosedID,minMoney,maxMoney,IsTran,element){
	bankID = choosedID;
	$(element).children('dd').children('div:last-of-type').removeClass('checkBox').addClass('checkBoxA');
	$(element).siblings('a').children('dd').children('div:last-of-type').removeClass('checkBoxA').addClass('checkBox');
	
	//钱包配置   备注信息；
	var RechargeRemark = $(element).children('dd').children('span')[0].innerHTML;
	//钱包配置   充值条件；
	var RechargeConditionRemark = $(element).children('dd').children('span')[1].innerHTML;
    setValidDate(minMoney,maxMoney,IsTran,RechargeRemark,RechargeConditionRemark);
    
	//新加卡号编号  
	PayCardNumber_now = $(element).children('dd').children('p')[0].innerHTML;

	//手续费处理
	feeType_onw = feeType;
	feeMoney_onw = feeMoney;
	cappingMoney_onw = cappingMoney;
	IsTran_onw = IsTran;
	shouxufeichuli(feeType_onw,feeMoney_onw,cappingMoney_onw);
}

//输入框金额变化,改变下边提示
function shuruOnchange(){
	shouxufeichuli(feeType_onw,feeMoney_onw,cappingMoney_onw);
}

//手续费处理
function shouxufeichuli(feeType,feeMoney,cappingMoney){
	if(IsTran_onw == 2){//只支持整数；
		var now_money = $("#chargePayMoney").val();
		now_money = now_money.split(".")[0];
		$("#chargePayMoney").val(now_money);
	}
	
	
	$("#real_jine_tip").show();
	$("#real_guize").show();
	$("#shouxufei").show();
	var rechargeMoney = $("#chargePayMoney").val();
	 if (feeType==1) {
        var feeMoney1 =  (Number(rechargeMoney).toFixed(4) * Number(feeMoney/100).toFixed(4)).toFixed(4);
        var realMoney;
        if (Number(Number(feeMoney1).toFixed(4))>Number(Number(cappingMoney).toFixed(4))) {
        	if(Number(cappingMoney) == 0){
        		realMoney = Number(rechargeMoney).toFixed(4) - Number(feeMoney1).toFixed(4);
           	 	$("#real_jine").html( Number(realMoney)==0?0:Number(realMoney).toFixed(4));
        	}else{
        		realMoney =Number(rechargeMoney).toFixed(4) - Number(cappingMoney).toFixed(4);
        		$("#real_jine").html( Number(realMoney)==0?0:Number(realMoney).toFixed(4));
        	}
        }else {
            realMoney = Number(rechargeMoney).toFixed(4) - Number(feeMoney1).toFixed(4);
            $("#real_jine").html( Number(realMoney)==0?0:Number(realMoney).toFixed(4));
        }
        
        if(Number(cappingMoney) == 0){
        	$("#shouxufei").html("单笔收取<span style='color:red'>"+ Number(feeMoney) +"</span>%手续费。");
        }else{
        	$("#shouxufei").html("单笔收取<span style='color:red'>"+ Number(feeMoney) +"</span>%手续费，单笔封顶金额<span style='color:red'>"+Number(cappingMoney)+"</span>元。");
        }
    }else if(feeType==2){
        var feeMoney1 = Number(feeMoney).toFixed(4);
        var realMoney;
        if (Number(rechargeMoney)<feeMoney1) {
            $("#real_jine").html(0);
		}else{
            realMoney = Number(rechargeMoney) - Number(feeMoney1);
            $("#real_jine").html(Number(realMoney).toFixed(4));
		}
		$("#shouxufei").html("单笔收取<span style='color:red'>"+ Number(feeMoney1) +"</span>元手续费。");
    }else{
    	$("#real_jine_tip").hide();
    	$("#real_guize").hide();
    	$("#shouxufei").hide();
    }
}

// 显示金额范围
function setValidDate(minRecMoney,maxRecMoney,IsTran,RechargeMoneyRemark,ConditionRemark){
	now_maxRecMoney = maxRecMoney;
	$("#textID").html("提示：充值金额范围为 <span id='charge_min_money'>"+ minRecMoney +"</span>-<span id='charge_max_money'>"+ maxRecMoney +"</span> 元。");
	
	//0：无；1：随机小数且个位不为0；2：整数 ; 3：整百;    2019.4.23
    $('#change_tips').html(RechargeMoneyRemark);
	if(RechargeMoneyRemark){
		$('#change_tips').html('（'+ RechargeMoneyRemark + '）');
	}else{
		$('#change_tips').html("");
	}
	
	if(ConditionRemark){
		$('#show_charge_tip').html(ConditionRemark );
	}else{
		$('#show_charge_tip').html("");
	}
}

//判读输入框金额是否在范围内
function getValidDate(payMoney){
	var temp=true;
	var minMoney = parseFloat($("#charge_min_money").text()),
		maxMoney = parseFloat($("#charge_max_money").text());
	payMoney = parseFloat(payMoney);
	if ( payMoney > maxMoney || payMoney < minMoney ) {
		toastUtils.showToast('充值金额范围：'+ minMoney +"-"+ maxMoney);
		temp = false;
	}
	return temp;
}

//获取用户名和账户余额
function GetUserAllMoney_charge(data) {
	if (data.Code == 200) {
		var lotteryMoney = data.Data.lotteryMoney;
		$("#welcomeUser").html(data.Data.userName);
		localStorageUtils.setParam("lotteryMoney", parseFloat(lotteryMoney));
		if (lotteryMoney != null || typeof (lotteryMoney) != "undefined") {
			$("#lotteryMoney").html(parseFloat(lotteryMoney) + "元");
		} else {
			$("#lotteryMoney").html("0.0000" + "元");
		}
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//@ 查询用户信息回调函数
function successCallBack_GetUserDetail(data) {
	if (data.Code == 200) {
		if (data.UserRealName != "") {
			isHasName = true;
		} else {
			isHasName = false;
		}
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//@ 提交按钮
function postSubmit(){
	payMoney = $("#chargePayMoney").val().trim();
	if (!payMoney) {
		toastUtils.showToast("请输入充值金额");
		return;
	}else if (!getValidDate(payMoney)){
		return;
	}
	
	
	if(IsTran_onw == 3){//只支持100的整倍数。自动 向下 将数值处理为 100的倍数
    	//输入框时
	    payMoney = Number($("#chargePayMoney").val().trim());
	     if(payMoney<100){
	    	toastUtils.showToast("请输入正确的充值金额");
	    	return;
	    }
	    if(payMoney%100 != 0){
	    	payMoney = payMoney - (payMoney%100);
	    	$("#chargePayMoney").val(payMoney.toString());
	    }
    }
	
	
	//key = payId，value = charge info;
	chargeIdObj =  jsonUtils.toObject(localStorageUtils.getParam("chargeIdObj"));
	var bankList = chargeIdObj[bankID]["bankList"];
	var bankCode = chargeIdObj[bankID]["bankCode"];

	if ( bankList.length ){
		var message = $('<select></select>');
		$.each(bankList, function (key, val) {
			message.append('<option value="'+ val.BankCode +'">'+ val.BankName +'</option>');
		});
		setTimeout(function () {
			$.ui.popup({
				title:"请选择银行",
				message: message,
				cancelText:"关闭",
				cancelCallback:
					function(){
					},
				doneText:"确定",
				doneCallback:
					function(){
						var bankValue = message.val();
						submitPaymentInfo(bankValue, bankID);
					},
				cancelOnly:false
			});
		},300);
	}else{
		bank = (bankCode+"");
		submitPaymentInfo(bank, bankID);
	}
}

//@ 提交充值信息
function submitPaymentInfo(bank, RechargeType) {
	payMoney = $("#chargePayMoney").val();
	payMoney = Number(payMoney);
	localStorageUtils.setParam("bankCode", bank);

	if (payMoney == "") {
		toastUtils.showToast("请输入充值金额");
		return;
	}else if(!getValidDate(payMoney)){
		return;
	}
	
	if(IsTran_onw == 1){//  IsTran=1:增加随机小数位；  IsTran=0:没有小数
		//因为随机了两位小数，所以当输入最大金额的时候要减掉1；
		if(Number(now_maxRecMoney) <= Number(payMoney)){
			payMoney = Number(now_maxRecMoney) -1;
		}
		
		if((payMoney.toString().split(".")[0]).split("")[(payMoney.toString().split(".")[0]).split("").length-1] == 0){
			payMoney = Number(payMoney) - 1;
		}
	
		var regu = "^([0-9]*[.0-9])$"; // 小数测试
		var re = new RegExp(regu);
		if(payMoney.toString().search(re) != -1){
			payMoney = Number(payMoney) + Number(Math.random(1).toFixed(2));
		}
    }

	// MY18 类充值ID 转换
	if(rechargeID.hasOwnProperty(RechargeType)){
		RechargeType = rechargeID[RechargeType]["typeID"];
	}

	var payName = chargeIdObj[bankID].RealPayName;
	
	if(!getValidDate(payMoney)){
	    return;
    }
	
//	feeType_onw = "2";
//	feeMoney_onw = "1.0000";
//	cappingMoney_onw = "0.0000";
	// PayTypeId :充值大类ID， PayTypeName: 充值大类名称， PayName:充值小类名称 ，RechargeType：支付方式ID，BankCode：银行标识
	var param='{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/AddRechargeInfo","PayCardNumber":"'+PayCardNumber_now+'","FeeType":"'+feeType_onw+'","FeeRange":"'+feeMoney_onw+'","CappingMoney":"'+cappingMoney_onw+'","RechargeMoney":"' + payMoney + '","BankCode":"' + bank + '","RechargeType":"' + RechargeType + '","PayTypeId":"'+ chargeType_payTypeId +'","PayTypeName":"'+ chargeType_payTypeName +'","PayName":"'+ payName +'"}';

	ajaxUtil.ajaxByAsyncPost(null,param,saveSuccessCallBackAddRechargeInfo,"数据提交中...",null);
}

/**网银支付
 * Description 充值回调函数
 * @return data 服务端返数据
 */
function saveSuccessCallBackAddRechargeInfo(data) {
	if(data.Code == 200){
	    if (data.Data.Result == "1") {
			var clickChargeBtn = true;
			localStorageUtils.setParam("clickChargeBtn",clickChargeBtn);
			var info = data.Data.Context;
			for (var i = 0; i < info.length; i++) {
				var bankURL = info[i].BankUrl;
				var payBank = info[i].PayBank;  //充值银行
				var payBankName = info[i].PayBankName;
				var payBankAccount = info[i].PayBankAccount;
				var payMoney = info[i].PayMoney;
				var fuyan=info[i].PayFuYan;
				var payName=info[i].PayName;  //从后台获取银行名称
				var pType=info[i].PType;  //获取PType值
				var mValue=info[i].MValue;
				var OrderID = info[i].OrderID;
				var QrImgBase64 = info[i].QrImgBase64;
	
				if(pType == "15") {   //***** start
					if ( payBank == "") {//bankURL == "" ||
						toastUtils.showToast("系统繁忙,请稍后再试!");
					} else {
						localStorageUtils.setParam("bankURL", bankURL);
						localStorageUtils.setParam("payBank", payBank);
						localStorageUtils.setParam("payBankName", payBankName);
						localStorageUtils.setParam("payName", payName);
						localStorageUtils.setParam("payBankAccount", payBankAccount);
						localStorageUtils.setParam("payBankMoney", payMoney);
						localStorageUtils.setParam("fuyan", fuyan);
						localStorageUtils.setParam("pType", pType); //充值类型
						localStorageUtils.setParam("OrderID", OrderID);
						localStorageUtils.setParam("erweima", QrImgBase64);
	
						createInitPanel_Fun("chargeDetailConfirm");
					}
				}else {   //在线支付方式
					if (mValue == "" && bankURL == "") {
						toastUtils.showToast("系统繁忙,请稍后再试!");
					}else{
						localStorageUtils.setParam("payBankMoney", payMoney); //充值金额
						localStorageUtils.setParam("pType", pType); //充值类型
						localStorageUtils.setParam("bankURL", bankURL); //URL
						localStorageUtils.setParam("mValue", mValue); //URL
						localStorageUtils.setParam("onlinePayName",chargeIdObj[bankID]["payName"]);
						// 有的支付方式会返回QQ/Alipay 等唤醒链接
						localStorageUtils.removeParam("AwakenUrl");
						if(info[i].AwakenUrl != null ){
							localStorageUtils.setParam("AwakenUrl", info[i].AwakenUrl); //唤醒Url
						}
						createInitPanel_Fun("chargeDetailConfirm");
					}
				}  //**** end
			}
		}else if(data.Data.Result==10){//充值条件不符合
//			toastUtils.showToast("您还没有满足条件，无法使用该支付！" + data.Data.Context[0].remark);
			setTimeout(function () {
				$.ui.popup(
			    {
			        title:"提示：",
			        message:'您还没有满足条件，无法使用该支付！<br/>' + data.Data.Context[0].remark,
			        cancelText:"我知道了",
			        cancelCallback:
			        function(){
			        },
			        cancelOnly:true
			    });
			},300);
	    }else if(data.Data.Result==2){
			toastUtils.showToast("银行卡不能为空");
		}else if(data.Data.Result==5){
			toastUtils.showToast("卡号不存在");
		}else if(data.Data.Result==-6){
			toastUtils.showToast("充值金额有误");
		}else if(data.Data.Result==-7){
	        toastUtils.showToast("充值金额不能小于等于手续费！");
		} else if (data.Data.Result == "-5"||data.Data.Result == "-1") {
			toastUtils.showToast("系统繁忙,请稍后再试!");
		} else {
			toastUtils.showToast("充值申请失败，稍候请重试");
		}
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

function ValidateNumber12(e, pnumber) {
	if (!/^\d+[.]?\d*$/.test(pnumber))
	{
		//检测正则是否匹配
		e.value = /^\d+[.]?\d*/.exec(e.value);
	}
	var payMoney = $("#chargePayMoney").val();
	var temp=payMoney.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
	$("#chargePayMoney").val(temp);
	
	//输入框金额变化,改变下边提示
	shuruOnchange();
	
	return false;
}



//支付宝、微信充值限额 (020 单独需求，同步为和023一样后，暂时不用限额，后期待看，函数需修改)
function alipay_wechat_charge_limit(id) {
	//判断某充值方式是否限额
	if(rechargeID[id]["limitMoney"]){
		$("#chargePayMoney").hide();
		$("#select_charge_money").empty();
		$("#select_charge_money").append("<option value='0'>请选择充值金额</option>");
		for(var i=0; i< chargeLimitMoney.length; i++){
			$("#select_charge_money").append("<option value='"+ chargeLimitMoney[i] +"'>"+ chargeLimitMoney[i] +" 元</option>")
		}
		$("#select_charge_money").show();
	}else{
		$("#chargePayMoney").show();
		$("#select_charge_money").hide();
	}
}