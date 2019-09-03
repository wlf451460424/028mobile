/*
 * @Author: Administrator
 * @Date:   2016-02-22 15:04:48
 * @Last Modified by:   Administrator
 * @Last Modified time: 2016-02-22 15:06:17
 */

'use strict';
//用户名
var userName = "";
//钱包余额
var walletMoney = "0.0000";
//冻结金额
var walletLockMoney = "0.0000";
//真实姓名
var realUserNameWithdraw = "";
//提款金额
var withdrawalMoneyWithdraw = "";
//提款银行
var userBankWithdraw = "";
//银行卡号
var userBankNoWithdraw = "";
//提款密码
var withdrawalPasswd = "";
var drawMinMoney,drawMaxMoney;

var drawBeginTime,drawEndTime;

//提款参数
var tikuan_canshu;
//默认卡的注册时间；
var bankCardTime = "";

//是否有真实姓名
var isHasPay = false;

var start_feeMoney = "";

/**
 * 进入页面加载
 * [withdrawalLoadedPanel description]
 * @return {[type]} [description]
 */
function withdrawalLoadedPanel(){
	catchErrorFun("withdrawalLoadedinit();");
}
/**
 * 页面离开时加载
 * [withdrawalUnloadedPanel description]
 * @return {[type]} [description]
 */
function withdrawalUnloadedPanel(){
	flag=6;
	// $("#realUserNameWithdrawId").val("");
	$("#withdrawalMoneyWithdrawId").val("");
	$("#withdrawalPasswdId").val("");
	$("#withdrawal_validateCode").val("");
	$("#tikuan_free").html("0");
	$("#tikuan_free_tip").html("0");
}
/**
 * 初始化
 * [withdrawalLoadedinit description]
 * @return {[type]} [description]
 */
function withdrawalLoadedinit(){
	
	//验证码
	withdrawal_showCode();
	
	$("#withdrawalMoneyWithdrawId").val("");
	$("#withdrawalPasswdId").val("");
	$("#withdrawal_validateCode").val("");
	$("#tikuan_free").html("0");
	$("#tikuan_free_tip").html("0");
	
	userName = localStorageUtils.getParam("username");
	walletMoney = localStorageUtils.getParam("lotteryMoney");
	realUserNameWithdraw = localStorageUtils.getParam("realName");
	userBankWithdraw = localStorageUtils.getParam("userBank");
	userBankNoWithdraw = localStorageUtils.getParam("userBankNo");
	drawMinMoney = localStorageUtils.getParam("drawMinMoney");
	drawMaxMoney = localStorageUtils.getParam("drawMaxMoney");

	drawBeginTime = localStorageUtils.getParam("drawBeginTime");
	drawEndTime = localStorageUtils.getParam("drawEndTime");
	
	$("#withdrawalUser").html(userName);
	$("#walletMoneyId").html(walletMoney + " 元");
	$("#userBankWithdraw").html(bankValue[userBankWithdraw]["name"]);
	$("#userBankNoWithdraw").html(replaceStr(userBankNoWithdraw, 0, userBankNoWithdraw.length - 4, "*"));
	$("#drawMinMoney").html(drawMinMoney);
	$("#drawMaxMoney").html(drawMaxMoney);

	if(drawEndTime==drawBeginTime){
		$("#drawBeginTime").html("24小时可提款");
		$("#drawEndTime").html("");
	}else{
		$("#drawBeginTime").html(time2Str(drawEndTime));
		$("#drawEndTime").html(" - "+time2Str(drawBeginTime));
	}
	
	//接口调用，根据用户ID获取该用户的提款配置参数列表
	var params='{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserGroupDrawConfig"}';
	ajaxUtil.ajaxByAsyncPost1(null, params,function (data) {
		if (data.Code == 200){
			$("#J_TbData").empty();
			//提款手续费类型（0：无手续费，1：比例，2：固定金额）
			if(data.Data.FeeMoenyType != 0 && data.Data.CollectMoneyList.length >0){
				start_feeMoney = data.Data.CollectMoneyList[0].CollectMoney;
				$("#DrawFeeMoenyType_list").show();
				var CollectMoneyList = data.Data.CollectMoneyList;
				var html = "";
			    for( var i = 0; i < CollectMoneyList.length; i++ ) {
			        html += "<tr>";
			        if(i == CollectMoneyList.length-1){
			        	html += "<td>第≥" + CollectMoneyList[i].DrawCount + "次</td>"
			        	if(data.Data.FeeMoenyType == 1){
			        		html += "<td>每笔" + CollectMoneyList[i].CollectMoney + "%</td>"
			        	}else{
			        		html += "<td>每笔" + CollectMoneyList[i].CollectMoney + "元</td>"
			        	}
			        	
			        }else{
			        	html += "<td>第" + CollectMoneyList[i].DrawCount + "次</td>"
			        	if(data.Data.FeeMoenyType == 1){
			        		html += "<td>" + CollectMoneyList[i].CollectMoney + "%</td>"
			        	}else{
			        		html += "<td>" + CollectMoneyList[i].CollectMoney + "元</td>"
			        	}
			        }
			        html += "</tr>";
			    }
			    $("#J_TbData").html(html);
			}else{
				$("#DrawFeeMoenyType_list").hide();
				$("#tikuan_free_p").hide();
			}
		}
		//接口调用，获取提款手续费相关信息；
		getUserGroupConfig();
	});

	//提交按钮
	$("#withdrawalSubmitId").off('click');
	$("#withdrawalSubmitId").on("click", function() {
		postwithdrawalSubmit();
	});
}

function getUserGroupConfig() {
	//接口调用，获取提款手续费相关信息；
	var params='{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserGroupConfig"}';
	ajaxUtil.ajaxByAsyncPost1(null, params,function (data) {
		if (data.Code == 200){
			var tikuan_SaveParameter={};
		    tikuan_SaveParameter["DrawFeeMoenyType"] = data.Data.UserConfigInfo.DrawFeeMoenyType;//提款手续费方式 (0无手续费1比例2固定金额
		    tikuan_SaveParameter["VerificationCardType"] = data.Data.UserConfigInfo.VerificationCardType;//新绑卡验证方式新绑卡验证方式(0不验证1验证)
		    tikuan_SaveParameter["TimeSpanse"] = data.Data.UserConfigInfo.TimeSpanse == ""?0:data.Data.UserConfigInfo.TimeSpanse;//新绑定卡多久后可提款
		    tikuan_SaveParameter["UserDrawCountDay"] = data.Data.UserConfigInfo.UserDrawCountDay;//用户当天提款次数
		    tikuan_SaveParameter["ExemptFeeMoneyCount"] = data.Data.UserConfigInfo.ExemptFeeMoneyCount;//提款免手续费次数 
		    tikuan_SaveParameter["CollectMoney"] = data.Data.UserConfigInfo.CollectMoney;//提款收取金额或比例
		    tikuan_SaveParameter["CappingMoney"] = data.Data.UserConfigInfo.CappingMoney;//提款封顶金额
		    tikuan_SaveParameter["DrawMinMoney"] = localStorageUtils.getParam("drawMinMoney");//最小提款金额
		    tikuan_SaveParameter["DrawMaxMoney"] = localStorageUtils.getParam("drawMaxMoney");//最大提款金额
		    tikuan_SaveParameter["DrawCount"] = localStorageUtils.getParam("DrawCount");//提款次数
		    
		    var tikuan_obj = {};
		    var tikuan_obj = tikuan_SaveParameter;
			localStorageUtils.setParam("tikuan_SaveParameter",jsonUtils.toString(tikuan_obj));  //提款参数
			
			
			//提款处理
			tikuan_canshu = localStorageUtils.getParam("tikuan_SaveParameter");
			tikuan_canshu = jsonUtils.toObject(tikuan_canshu);
			if (tikuan_canshu.DrawFeeMoenyType!=undefined) {
		        //提示信息
                getWithDrowRealMoneyTip(tikuan_canshu.DrawFeeMoenyType,tikuan_canshu);
		        
		    }else{
		        $("#DrawFeeMoenyType_div").hide();
		        $("#tikuan_free_p").hide();
		    }
		}
	});
}

function withdrawal_showCode() {
//  $("#withdrawal_Code").attr("src","/checkimage.jpg?"+Math.random());
//  if($("#withdrawal_Code")[0].src == ""){
//  	withdrawal_showCode();
//  }
    
    $.post("/checkimage?" + Math.random(), function(d){
        if (d.Code != 200){
            return;
        }
        $("#withdrawal_Code").attr("src", "data:image/png;base64," + d.Data);
    },"json");
}

//提示信息
function getWithDrowRealMoneyTip(n,tikuan_canshu){
	//提款时间
	if(drawEndTime==drawBeginTime){
		$("#tikuan_time").html("24小时可提款");
	}else{
		$("#tikuan_time").html(time2Str(drawEndTime)+"~"+time2Str(drawBeginTime));
	}
	//单笔限额
	if ("" == tikuan_canshu.DrawMaxMoney && "" == tikuan_canshu.DrawMinMoney){
		$("#tikuan_xiane").html("<span>不限制</span>");
	} else {
		$("#tikuan_xiane").html(tikuan_canshu.DrawMinMoney + "~" + tikuan_canshu.DrawMaxMoney + "元");
	}
	//提款限制
	if (tikuan_canshu.DrawCount == '0'){
		$("#tikuan_xianzhi").html("无限制");
	} else {
		$("#tikuan_xianzhi").html(tikuan_canshu.DrawCount + "次/日");
	}
	
	//重要提示   规则说明
	$("#tikuan_guize").show();
	$("#tikuan_guize_head").show();
	$("#tikuan_tip").show();
	$("#tikuan_tip_head").show();
	var UserDrawCountDay = 0;
    var _UserDrawCountDauy = 0
	if ( parseInt(tikuan_canshu.UserDrawCountDay)< parseInt(tikuan_canshu.ExemptFeeMoneyCount)){
        _UserDrawCountDauy = tikuan_canshu.ExemptFeeMoneyCount-parseInt(tikuan_canshu.UserDrawCountDay);
	}
	UserDrawCountDay = parseInt(tikuan_canshu.ExemptFeeMoneyCount)+1;
     if (n == 2) {
        $("#tikuan_tip").html('绑定银行卡<span>'+tikuan_canshu.TimeSpanse+'</span>小时后才能进行提款<br>');
        $("#tikuan_guize").html('每天提款前<span>'+tikuan_canshu.ExemptFeeMoneyCount+'次</span>免费，第<span>'+UserDrawCountDay+'</span>次开始收取手续费');
    }else if (n == 1) {
        $("#tikuan_tip").html('绑定银行卡<span>'+tikuan_canshu.TimeSpanse+'</span>小时后才能进行提款<br>');
        if(tikuan_canshu.CappingMoney == 0){
        	$("#tikuan_guize").html('每天提款前<span>'+tikuan_canshu.ExemptFeeMoneyCount+'次</span>免费，第<span>'+UserDrawCountDay+'</span>次开始收取手续费');//，单次手续费<span>'+tikuan_canshu.CappingMoney+'</span>元封顶
        }else{
        	$("#tikuan_guize").html('每天提款前<span>'+tikuan_canshu.ExemptFeeMoneyCount+'次</span>免费，第<span>'+UserDrawCountDay+'</span>次开始收取手续费，单次手续费<span>'+tikuan_canshu.CappingMoney+'</span>元封顶');//
        }
	}else if (n == 0) {
		$("#tikuan_tip").html('绑定银行卡<span>'+tikuan_canshu.TimeSpanse+'</span>小时后才能进行提款<br>');
//      $("#tikuan_guize").html('每天提款前<span>'+tikuan_canshu.ExemptFeeMoneyCount+'次</span>免费，第<span>'+UserDrawCountDay+'</span>次开始每笔收取<span>'+ tikuan_canshu.CollectMoney +'%</span>的比例手续费，单次手续费<span>'+tikuan_canshu.CappingMoney+'</span>元封顶');
    	$("#tikuan_guize").hide();
    	$("#tikuan_guize_head").hide();
	}
	
	if(Number(tikuan_canshu.TimeSpanse) == 0){
		$("#tikuan_tip").hide();
		$("#tikuan_tip_head").hide();
	}

	
	//提款免费次数；
	if (tikuan_canshu.DrawFeeMoenyType != 0) {
		if (parseInt(tikuan_canshu.UserDrawCountDay)+1>tikuan_canshu.ExemptFeeMoneyCount||tikuan_canshu.ExemptFeeMoneyCount==0){
			if (tikuan_canshu.DrawFeeMoenyType == 2) {
				$("#tikuan_free_tip").html(0);
			}else if(tikuan_canshu.DrawFeeMoenyType == 1){
                $("#tikuan_free_tip").html(0);
            }
		}else {
            FreeMoney = 0;
            $("#tikuan_free_tip").html(tikuan_canshu.ExemptFeeMoneyCount - tikuan_canshu.UserDrawCountDay);
        }
	}else{
		$("#tikuan_free_tip").html(0);
	}
}

var FreeMoney;
//输入框金额变化,改变下边提示
function withdrawal_shuruOnchange(){
	if(tikuan_canshu == "")return;
	//提款输入的金额
	var v = $("#withdrawalMoneyWithdrawId").val();
	if(v=="")v=0;
    if (tikuan_canshu.DrawFeeMoenyType!=undefined) {
	    if (tikuan_canshu.DrawFeeMoenyType != 0) {
	        if (parseInt(tikuan_canshu.UserDrawCountDay)+1>tikuan_canshu.ExemptFeeMoneyCount||tikuan_canshu.ExemptFeeMoneyCount==0){
				if (tikuan_canshu.DrawFeeMoenyType == 2) {
//	                if (v < tikuan_canshu.CollectMoney) {
//	                    FreeMoney = v;
//	                    $("#tikuan_free_tip").html(v);
//	                } else {
						FreeMoney = tikuan_canshu.CollectMoney;
//						$("#tikuan_free_tip").html(tikuan_canshu.ExemptFeeMoneyCount);
						$("#tikuan_free_tip").html(0);
//	            	}
				}else if(tikuan_canshu.DrawFeeMoenyType == 1){
					var  CollectMoney =parseFloat(v)*(parseFloat(tikuan_canshu.CollectMoney)/100);
					if (CollectMoney>parseFloat(tikuan_canshu.CappingMoney)) {
						if(parseFloat(tikuan_canshu.CappingMoney)==0){
							FreeMoney = CollectMoney.toFixed(4);
	                    	$("#tikuan_free_tip").html(0);
						}else{
							FreeMoney = Number(tikuan_canshu.CappingMoney).toFixed(4);
	                    	$("#tikuan_free_tip").html(0);
						}
					}else{
	                    FreeMoney = Number(CollectMoney).toFixed(4);
	                    $("#tikuan_free_tip").html(0);
					}
	            }
	        }else {
	            FreeMoney = 0;
	            $("#tikuan_free_tip").html(tikuan_canshu.ExemptFeeMoneyCount - tikuan_canshu.UserDrawCountDay);
	        }
	    }
	}
   $("#tikuan_free").html( FreeMoney);
}


function ValidateNumber_withdrawal(e, pnumber) {
	var temp=e.value.replace(/\D/g,'');
	$("#withdrawalMoneyWithdrawId").val(temp);
	//输入框金额变化,改变下边提示
	withdrawal_shuruOnchange();
	return false;
}

function time2Str(drawTime){
	if(parseInt(drawTime)>=0 && parseInt(drawTime) < 6){
		return "凌晨"+drawTime+":00";
	}else if(parseInt(drawTime)>=6 && parseInt(drawTime) < 12){
		return "上午"+drawTime+":00";
	}else if(parseInt(drawTime)>=12 && parseInt(drawTime) < 18){
		return "下午"+drawTime+":00";
	}else if(parseInt(drawTime)>=18 && parseInt(drawTime) <= 24){
		return "晚上"+drawTime+":00";
	}
}

/**
 * 提交按钮
 * [chargeInit description]
 * @return {[type]} [description]
 */
function postwithdrawalSubmit(){
	var currentTime = new Date();
	var hour = currentTime.getHours();
	if(hour < parseInt(drawEndTime) && hour >=  parseInt(drawBeginTime)){
		toastUtils.showToast("当前时间不支持提款");
		return;
	}

	// var userTemp = $("#realUserNameWithdrawId").val();
	withdrawalMoneyWithdraw = $("#withdrawalMoneyWithdrawId").val();
	withdrawalPasswd = $("#withdrawalPasswdId").val();

	/*if (userTemp == "") {
		toastUtils.showToast("请输入真实姓名！");
		return;
	}else if(/\s/.exec(userTemp)!=null){
		toastUtils.showToast("真实姓名中不可包含空格");
		return;
	}*/

	if (withdrawalMoneyWithdraw == "") {
		toastUtils.showToast("请输入提款金额");
		return;
	}
	if (withdrawalPasswd == "") {
		toastUtils.showToast("请输入资金密码");
		return;
	}
	/*if (userTemp != realUserNameWithdraw) {
		toastUtils.showToast("提款姓名不正确");
		return;
	}*/
	
	if($.trim($("#withdrawal_validateCode").val()) == ""){
        toastUtils.showToast("验证码不能为空!");
        return;
    }
	
	if (realUserNameWithdraw != "" && userBankWithdraw != "" && userBankNoWithdraw != "") {
		var floatMoney = parseFloat(withdrawalMoneyWithdraw);
		if (floatMoney > parseFloat(drawMaxMoney) || floatMoney < parseFloat(drawMinMoney)) {
			toastUtils.showToast("金额范围不正确");
			return;
		}
		
		if (floatMoney > parseFloat(walletMoney)) {
			toastUtils.showToast("可提款金额不足");
			return;
		}

//		if (floatMoney + FreeMoney > parseFloat(walletMoney)) {
////			toastUtils.showToast("可提款金额不足");
//			toastUtils.showToast("余额小于提款金额+手续费 不能提款！");
//			return;
//		}
		var param='{"InterfaceName":"/api/v1/netweb/AddDrawingsInfo","ProjectPublic_PlatformCode":2,"SecCode":"'+ $("#withdrawal_validateCode").val().trim() +'","FeeMoney ":"'+FreeMoney+'","UserRealName":"' + realUserNameWithdraw + '","DrawingsMoney":"' + Number(withdrawalMoneyWithdraw) + '","PayPassWord":"' + withdrawalPasswd + '","gCode":"","VerifyKey":""}';
		ajaxUtil.ajaxByAsyncPost(null,param,saveSuccessCallBackAddDrawingsInfo,"数据提交中...",null);
	} else {
		toastUtils.showToast("请先完善银行卡资料并设置提款密码");
		createInitPanel_Fun('personalInfo');
	}
}

/**
 * Description 提款回调函数
 * @param
 * @return data 服务端返数据
 */
function saveSuccessCallBackAddDrawingsInfo(data) {
	if(data.Code == 200){
	    var state = data.Data.Result;
		if (state == "-2") {
			toastUtils.showToast("资金密码错误");
		} else if (state == "-1") {
			toastUtils.showToast("不是真实姓名");
		} else if (state == "9") {
			toastUtils.showToast("该用户不允许提款");
		} else if (state == "-5") {
			//弹框提示--遮罩层
			setTimeout(function () {
				$.ui.popup({
					title:"提款成功",
					message:'<span>前方' + data.Data.WaitingNumber + '人取款中……</span>',
					cancelText:"关闭",
					cancelCallback:
						function(){
						},
					doneText:"确定",
					doneCallback:
						function(){
						},
					cancelOnly:false
				});
			},350);
			// $("#realUserNameWithdrawId").val("");
			$("#withdrawalMoneyWithdrawId").val("");
			$("#withdrawalPasswdId").val("");
			$("#withdrawal_validateCode").val("");
			searchYuE();
			withdrawalLoadedinit();
		}else if(state == "5"){
			toastUtils.showToast("新绑定银行卡"+tikuan_canshu.TimeSpanse+"小时后才能进行提款！");
		}else if(state == "6"){
			toastUtils.showToast("余额小于提款金额+手续费 不能提款！");
		}else if(state == "-6"){
			toastUtils.showToast("提款金额有误");
		}else if(state == "-7"){
			toastUtils.showToast("当前用户已被冻结暂时不允许提款操作");
		}else if(state == "-8"){
			toastUtils.showToast("超过提款次数,暂时不能提款!");
		}else if(state == "-9"){
			toastUtils.showToast("提款超出上限!");
		}else if(state == "10"){
			toastUtils.showToast("您还没有完成与下级的分红契约，无法提款!");
		}else if(state == "-20"){
			toastUtils.showToast("您投注流水未达标，请继续游戏！");
		}else if(state == "9001"){
			toastUtils.showToast("验证码错误");
		}else {
			toastUtils.showToast("提款失败，稍候请重试");
		}
		withdrawal_showCode();
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		withdrawal_showCode();
		toastUtils.showToast(data.Msg);
	}
}

/**
 * Description 查询用户余额回调函数
 * @param
 * @return data 服务端返数据
 */
function searchSuccessCallBack_withdrawal(data) {
	if (data.Code == 200) {
		walletMoney = data.Data.lotteryMoney;
		walletLockMoney = data.Data.freezeMoney;
		localStorageUtils.setParam("walletMoney", parseFloat(walletMoney));
		localStorageUtils.setParam("walletLockMoney", parseFloat(walletLockMoney));
		$("#walletMoneyId").html(parseFloat(walletMoney) + "元");
	}
}

//查询余额
function searchYuE() {
	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', searchSuccessCallBack_withdrawal, '正在加载数据...', null);
}

//@ 限制只能输入2位小数点（业务改变，暂不用）
function ValidateNumber(e, pnumber) {
	if (!/^\d+[.]?\d*$/.test(pnumber))
	{
		e.value = /^\d+[.]?\d*/.exec(e.value);
	}
	var withdrawalMoneyWithdraw = $("#withdrawalMoneyWithdrawId").val();
	var temp=withdrawalMoneyWithdraw.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
	$("#withdrawalMoneyWithdrawId").val(temp);
	return false;
}

/*验证真实姓名中不可输入空格*/
function realNameNoSpaceWdraw(e,realNameText) {
	var reg = /\s/;
	if(reg.exec(realNameText)!=null){
		$("#realUserNameWithdrawId").val(realNameText.replace(/(^\s*)|(\s*$)/g,""));
	}
}
