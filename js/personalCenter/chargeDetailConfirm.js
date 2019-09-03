var bankURL = "";  //返回银行链接地址
var payBank = "";  //充值银行
var payBankName = "";  //充值银行名称
var payBankAccount = "";  //充值银行账户
var payMoney = "";  //充值金额
var fuyan="";  //附言
var pType="";  //PType
var erweimaImg="";  //二维码
var OrderID="";  //订单号

//@ Loaded
function chargeDetailConfirmLoadedPanel() {
    catchErrorFun("chargeDetailConfirmInit();");
}

//@ Unload
function chargeDetailConfirmUnloadedPanel() {
    $('#changeSubmit').html('立即付款');
    $('#changeSubmit').show();
    $('#shuomingID').hide();
    $('#shuomingID_erweima').hide();
    $('#remitSubmit').show();
    
    $('#remitOrderID').val('');
    $('#remitOrderID_div').hide();
     

    $('#remitName').val('');
    $('#remitTime').val('');
    $('#remitTime_div').hide();
	localStorageUtils.removeParam("AwakenUrl");
}

/**
 * 初始化
 * [chargeDetailConfirmInit description]
 */
function chargeDetailConfirmInit(){
	var bankCode=localStorageUtils.getParam("bankCode");
	bankURL = localStorageUtils.getParam("bankURL");
	payBank = localStorageUtils.getParam("payBank");

    if(payBank){
        if(payBank.indexOf(",")>0){
            payBankVal=payBank.split(",");
        }else{
            payBankVal=payBank;
        }
    }
    payBankName = localStorageUtils.getParam("payBankName");
    payBankAccount = localStorageUtils.getParam("payBankAccount");
    payMoney = localStorageUtils.getParam("payBankMoney");
    fuyan = localStorageUtils.getParam("fuyan");
    pType=localStorageUtils.getParam("pType"); //pType
    mValue=localStorageUtils.getParam("mValue"); //mValue值区分银联或者在线支付方式
    erweimaImg=localStorageUtils.getParam("erweima"); //二维码 
    OrderID=localStorageUtils.getParam("OrderID"); //订单号


	//按钮依据是否被点击，背景色显示不同
	var clickChargeBtn = localStorageUtils.getParam("clickChargeBtn");
	if(clickChargeBtn == false || clickChargeBtn == "false"){
		$("#changeSubmit").css("background","#999999");
	}else{
		$("#changeSubmit").css("background","linear-gradient(45deg,#702dfe,#FE5D39)");
	}

	$("#zhifu_personalInfo").hide();
    $("#jieshou_personalInfo").hide();
    $("#chargeInfo3").hide();
    
    //转账时间是否显示
    $('#remitTime_div').hide();
    //订单号
    $('#remitOrderID_div').hide();
    
	//************* 银联支付方式 **************
    if(pType=="15"){
    	//非二维码支付方式，以前老的方式。
    	if(erweimaImg == "" && bankURL != ""){
    		$("#chargeInfo2").hide();  //隐藏chargeInfo2
	        $("#chargeInfo1").show();  //显示chargeInfo1
	        
	        $('#remitTime_div').show();
	        $('#shuomingID_erweima').hide();
	        $("#shuomingID").show();
	        $("#remitInfo").show();
	        $("#changeSubmit").hide();
	        $("#remitSubmit").show();
	
	        //招商银行
		    if(bankCode.toLowerCase() == "cmb"){
			    $('#changeSubmit').html('支付宝转账');
			    $('#changeSubmit').show();
			    $("#remitSubmit").show();
	
			    $('#changeSubmit').off('click');
			    $('#changeSubmit').on('click',function () {
				    window.open("https://shenghuo.alipay.com/send/payment/fill.htm", "_self");
			    });
		    }
	
	        $("#cashUser").val(payBankName);
	        $("#cashBank").val(payBankVal[0]);
	
		    // 开户地址动态展示
	        if(payBankVal[1]){
	            $("#showKaiHuBank").show();
	            $("#kaiHuBank").val(payBankVal[1]);
	        }else{
	            $("#showKaiHuBank").hide();
	        }
	
	        $("#cashBankNo").val(payBankAccount);
	        $("#cash").val(payMoney);
	        //附言
	        if(fuyan){
		        $("#fuyan").val(fuyan);
		        $("#fuyanID").show();
	        }else {
		        $("#fuyanID").hide();
	        }
	
	        //打款信息
	        $('#remitMoney').val(payMoney);
	
	        $("#remitSubmit").off('click');
	        $("#remitSubmit").on("click", function() {
	            var remitName = $('#remitName').val().trim();
	            var remitTime = $('#remitTime').val().trim();
	            var OrderID= localStorageUtils.getParam("OrderID");
	            if (!remitName || remitName == ''){
	                toastUtils.showToast('请填写真实姓名');
	                return;
	            }
	            if (!remitTime || remitTime == ''){
	                toastUtils.showToast('请填写转账时间');
	                return;
	            }else if (!(/^([0-1][0-9]|2[0-3])([0-5][0-9])$/.test(remitTime))){
	                toastUtils.showToast('转账时间格式不正确');
	                return;
	            }
	
	            var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/AddOrderReminder","PayRealName":"'+remitName+'","TransferAmount":"' +payMoney+ '","TransferTime":"'+remitTime+'","ReceiveName":"' + payBankName + '","ReceiveBank":"' + payBankVal[0] + '","ReceiveCardNumber":"' + payBankAccount + '","OrderNumber":"' + OrderID + '","PayCarNumber":""}';
	            ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
	            	if(data.Code == 200){
					    if (data.Data.Result == 1){
		                    toastUtils.showToast("提交审核成功");
		                    $('#remitSubmit').hide();
		                }else{
		                    toastUtils.showToast("提交审核失败");
		                }
					}else{
					    toastUtils.showToast(data.Msg);
					}
	            },null);
	        });
    	}else{//二维码方式
    		$("#chargeInfo2").hide();  //隐藏chargeInfo2
	        $("#chargeInfo1").hide();  //显示chargeInfo1
	        $("#chargeInfo3").show();  //显示chargeInfo1
	        
	        $('#remitOrderID_div').show();
	        $('#remitOrderID').val();
	        $('#shuomingID_erweima').show();
	        $("#shuomingID").hide();
	        $("#remitInfo").show();
	        $("#changeSubmit").hide();
	        $("#remitSubmit").show();
	        
	        //二维码支付  处理信息
	        $("#zhifu_personalInfo").show();
	        $("#jieshou_personalInfo").show();
	        $("#erweima_payValue").html(payMoney);
	        $("#erweima").attr("src", "data:image/png;base64," + erweimaImg);
	        
	        //打款信息
	        $('#remitMoney').val(payMoney);
	
	        $("#remitSubmit").off('click');
	        $("#remitSubmit").on("click", function() {
	            var remitName = $('#remitName').val().trim();
	            var remitTime = $('#remitTime').val().trim();
	            var OrderID= localStorageUtils.getParam("OrderID");
	            var remitOrderID = $('#remitOrderID').val().trim();
	            if (!remitName || remitName == ''){
	                toastUtils.showToast('请填写真实姓名');
	                return;
	            }
//	            if (!remitTime || remitTime == ''){
//	                toastUtils.showToast('请填写转账时间');
//	                return;
//	            }else if (!(/^([0-1][0-9]|2[0-3])([0-5][0-9])$/.test(remitTime))){
//	                toastUtils.showToast('转账时间格式不正确');
//	                return;
//	            }
				
				//二维码方式的时候  用非二维码时候的参数TransferTime
	            if (!remitOrderID || remitOrderID == ''){
	                toastUtils.showToast('请填写转账单号后六位');
	                return;
	            }else if(remitOrderID.toString().length != 6){
	            	toastUtils.showToast('转账单号格式不正确');
	                return;
	            }
	
	            var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/AddOrderReminder","PayRealName":"'+remitName+'","TransferAmount":"' +payMoney+ '","TransferTime":"'+remitOrderID+'","ReceiveName":"' + payBankName + '","ReceiveBank":"二维码","ReceiveCardNumber":"' + payBankAccount + '","OrderNumber":"' + OrderID + '","PayCarNumber":""}';
	            ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
	            	if(data.Code == 200){
					    if (data.Data.Result == 1){
		                    toastUtils.showToast("提交审核成功");
		                    $('#remitSubmit').hide();
		                }else{
		                    toastUtils.showToast("提交审核失败");
		                }
					}else{
					    toastUtils.showToast(data.Msg);
					}
	            },null);
	        });
    	}
    	
        //2018.11.22   网银转账   前台去掉 "立即转账" 或其他可以跳转出去的按钮，由玩家根据收款信息自己去汇款；
		$("#changeSubmit").hide();

        //************  在线支付方式（区别于my18类的银行充值） ***************
    }else {
        $("#chargeInfo1").hide();  //隐藏chargeInfo1
        $("#chargeInfo2").show();  //显示chargeInfo2
        $("#remitInfo").hide();

	    //微信反扫
	    if($.inArray(Number(pType),[118]) !== -1){
		    $("#isShowWechatPayNum").show();
	    }else {
		    $("#isShowWechatPayNum").hide();
	    }

	    if(pType){
		    $("#chargeInfo2 #payMethod").html(localStorageUtils.getParam("onlinePayName"));
		    $("#chargeInfo2 #payValue").html(payMoney + "元");
	    }

        //点击-立即付款
        $("#changeSubmit").off('click');
        $("#changeSubmit").on("click", function() {
	        // 判断是否可以再次点击按钮
	        var clickChargeBtn = localStorageUtils.getParam("clickChargeBtn");
	        if(clickChargeBtn == "false" || clickChargeBtn == false){
		        toastUtils.showToast("不可重复提交订单，请重新充值");
		        return;
	        }else{
		        clickChargeBtn = false;
		        localStorageUtils.setParam("clickChargeBtn",clickChargeBtn);
		        $("#changeSubmit").css("background","#999999");
	        }

	        var awakenUrl = localStorageUtils.getParam("AwakenUrl");  //QQ 或 Alipay 等唤醒功能
	        if(awakenUrl != null){
		        if( awakenUrl.indexOf("http") != -1){
			        window.open(awakenUrl, "_self");
		        }else {
			        toastUtils.showToast("请求支付异常，请稍后再试");
			        setTimeout(function () {
				        createInitPanel_Fun("charge");
			        },2000);
		        }
	        }else {
		        var param = {};
		        var mvalue2 = mValue.split("$");
		        for(var i= 0;i<mvalue2.length;i+=2){
			        param[mvalue2[i]] = mvalue2[i+1];
		        }

		        //微信反扫添加字段及输入框的值
		        if($.inArray(Number(pType),[118]) !== -1){
			        var wechatPayNum = parseInt($("#wechatPayNum").val().trim()).toString();
			        if (!wechatPayNum){
				        toastUtils.showToast("请输入付款码数字");
				        return;
			        }else if (wechatPayNum.length!==18){
				        toastUtils.showToast("付款码长度需满足18位");
				        return;
			        }else {
				        param.auth_code = wechatPayNum;
			        }
		        }
		        post(bankURL,param);
	        }
        });
    }
}

//@ 支付请求
function post(URL, PARAMS) {
	var temp_form = document.createElement("form");
	temp_form .action = URL;
	temp_form .target = "_self";
	temp_form .method = "get";
	temp_form .style.display = "none";
	for (var x in PARAMS) {
		var opt = document.createElement("textarea");
		opt.name = x;
		opt.value = PARAMS[x];
		temp_form .appendChild(opt);
	}
	//添加到body中，解决Firefox中无法打开新窗口的问题
	document.body.appendChild(temp_form);
	temp_form .submit();
}

/*
 *  弹窗再次确认用户是否完成充值。(暂不用)
 * */
function IsChargeSucceed(){
    $.ui.popup(
        {
            title:"提示",
            message:'请您在新打开的网上银行页面完成充值',
            cancelText:"已完成充值",
            cancelCallback:
                function(){
                    createInitPanel_Fun("myChargeRecord",true);
                },
            doneText:"充值遇到问题",
            doneCallback:
                function(){
                    createInitPanel_Fun("charge",true);
                },
            cancelOnly:false
        });
}
