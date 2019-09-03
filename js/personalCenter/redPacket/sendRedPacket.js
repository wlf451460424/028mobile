//@ Load
function sendRedPacketLoadedPanel() {
	catchErrorFun("sendRedPacket_init()");
}
//@ Unload
function sendRedPacketUnloadedPanel() {
	//清空记录；
	redPacket_ObjectArr = [];
}

//@ 全局变量
var redpacket_Mode = "2";  //1:普通红包 2:拼手气红包
var redPakType = {
	"1":{name:"普通红包", min:1, max:50000},
	"2":{name:"拼手气红包", min:1, max:50000}
};
var redPakCountLimit = 999999999999999999999999999999999999999999999999999999999;
var redPacket_ObjectArr = [];

//@ Init
function sendRedPacket_init() {
	// 添加发送对象
	add_redPak_receiver();
	// 获取分支人数
	get_branch_num();
	// 改变红包类型
	change_redPak_type();
	// 点击发送按钮
	send_redPak_submit();
	// 获取用户当前余额
	getMyMoney();
	// 获取每人每天可发送最大红包数
	get_daily_max_send_num();
}

//@ 添加发送对象
function add_redPak_receiver() {
	// redPacket_ObjectArr[selectTypeId,selectUserId,selectUserName]
	redPacket_ObjectArr = jsonUtils.toObject(localStorageUtils.getParam("redPacket_ObjectArr")) || [];
    if( redPacket_ObjectArr.length > 0){
    	var person;
    	$("#redPak_money_title").html("红包总金额 (元)：");
    	if(redPacket_ObjectArr[0] == 1 ){
			person = "<span class='red-text'>"+ redPacket_ObjectArr[2] +"</span> 的整个团队";
			$("#redPak_qiehuan").show();
	    }else if (redPacket_ObjectArr[0] == 2 ){
		    person = "<span class='red-text'>"+ redPacket_ObjectArr[2] +"</span> 的直属下级";
		    $("#redPak_qiehuan").show();
	    }else{
		    person = "<span class='red-text'>"+ redPacket_ObjectArr[2] +"</span>";
		    //单个对象时操作按 普通红包处理 隐藏切换按钮  类型写死为普通红包
		    $("#redPak_qiehuan").hide();
		    redpacket_Mode = "1";
		    $("#redPak_money_title").html("单个金额 (元)：");
	    }
    	$("#redPak_receiver").html(person);
	    $("#redPak_branchPerson").parent("p").show();   //分支
    }else{
    	$("#redPak_receiver").html("点击添加发送对象");
	    $("#redPak_branchPerson").parent("p").hide();   //分支
    }

    // 单个人默认发送红包个数为 1,并隐藏输入框
	if(redPacket_ObjectArr.length && redPacket_ObjectArr[0] == 3){
	    $("#redPak_count").val("1").hide();
	    $("#redPak_count").prev("b").hide();
	    $("#redPak_branchPerson").parent("p").hide();
		$("#redPak_money").attr("placeholder","可输入 1~"+ redPakType['1']['max'] +" 元").val("");
		$("#redPak_qiehuan var").html(redPakType['1']['name']);  //当前为普通红包
		$("#redPak_type").html(redPakType['2']['name']);  //可切换为拼手气红包
		$("#redPak_total_money").text("0");  //底部金额总数
	}else{
		$("#redPak_count").val("").show();
		$("#redPak_count").prev("b").show();
	}

	$("#redPak_receiver").off("click");
	$("#redPak_receiver").on("click",function () {
		//清空记录；
		redPacket_ObjectArr = [];
		setPanelBackPage_Fun("chooseSendPerson");
	});
}

//@ 获取某分支下人数
function get_branch_num() {
	if(redPacket_ObjectArr.length){
		var teamType = redPacket_ObjectArr[0];
		var userId = redPacket_ObjectArr[1];

		var parameters = '{"InterfaceName":"/api/v1/netweb/redPacket_branchNum","ProjectPublic_PlatformCode":2,"UserId":"' + userId + '","ObjectId":'+ teamType +'}';
		ajaxUtil.ajaxByAsyncPost1(null, parameters,function (cb) {
			if(cb.Code == 200){
				var num = cb.Data || 0;
				$("#redPak_branchPerson").text(num);
			}else {
				$("#redPak_branchPerson").text(0);
			}
		} ,null);
	}
}

//@ 点击切换红包类型
function change_redPak_type() {
	$("#redPak_type").off("click");
	$("#redPak_type").on("click",function () {
		var type = $("#redPak_type").text().trim();
		if(type == redPakType["1"]["name"]){  //点击后拼手气改为普通红包
			$("#redPak_type").text(redPakType["2"]["name"]).prev("var").text(redPakType["1"]["name"]);
			$("#redPak_money_title").html("单个金额 (元)：").next("input").attr({
				"placeholder":"可输入 1~"+ redPakType[1]['max'] +" 元"
			}).val("");
			redpacket_Mode = "1";
			$("#isShow_can_get_money").hide();
		}else{  //点击后普通红包改为拼手气红包
			$("#redPak_type").text(redPakType["1"]["name"]).prev("var").text(redPakType["2"]["name"]);
			$("#redPak_money_title").html("红包总金额 (元)：").next("input").attr({
				"placeholder":"可输入 1~"+ redPakType[2]['max'] +" 元"
			}).val("");
			redpacket_Mode = "2";
			$("#isShow_can_get_money").hide();
		}
		// 单个对象时
		if(redPacket_ObjectArr.length && redPacket_ObjectArr[0] == 3){
			$("#redPak_count").val("1");
			$("#redPak_total_money").text("0");
		}else{
			$("#redPak_count").val("");
			$("#redPak_total_money").text("0");
		}
	});
}

//@ 通过金额输入框，动态显示底部总金额
function show_redPak_money(ele) {
	if(ele.value && ele.value != 0){
		ele.value = Number(ele.value);
	}
	
	var money = Number(ele.value);
	if(money){
		if( $("#redPak_type").text().trim() == redPakType["2"]["name"] ){  //当前为普通红包
			if(money > redPakType[1]['max'] ){
				money = redPakType[1]['max'] ;
				ele.value = redPakType[1]['max'] ;
			}else if(money < redPakType[1]['min']){
				money = redPakType[1]['min'] ;
				ele.value = redPakType[1]['min'] ;
			}
			var redParCount = $("#redPak_count").val() ? $("#redPak_count").val() : 0 ;
			var totalMoney = bigNumberUtil.multiply(money,redParCount);
			$("#redPak_total_money").text(totalMoney);
		}else{
			if(money > redPakType[2]['max']){
				money = redPakType[2]['max'];
				ele.value = redPakType[2]['max'];
			}else if(money < redPakType[2]['min']){
				money = redPakType[2]['min'];
				ele.value = redPakType[2]['min'];
			}
			$("#redPak_total_money").text(money);
		}
	}else{
		$("#redPak_total_money").text("0");
	}
}

//@ 通过红包数量输入框，动态显示底部总金额
function show_redPak_money_count(ele) {
	ele.value=ele.value.replace(/\D/g,'');  //只可输入数字
	if(ele.value && ele.value != 0){
		ele.value = Number(ele.value);
	}
	var count = ele.value ? ele.value : 0;
	var perMoney = $("#redPak_money").val() ? $("#redPak_money").val() : 0;

//	if(count && count > redPakCountLimit){
//		count = redPakCountLimit;
//		ele.value = redPakCountLimit;
//	}else if(count && count < 1){
//		count = 1;
//		ele.value = 1;
//	}
	
	if(count && count < 1){
		count = 1;
		ele.value = 1;
	}
	
	if($("#redPak_type").text().trim() == redPakType["2"]["name"]){  //当前为普通红包
		var totalMoney = bigNumberUtil.multiply(count,perMoney);
		$("#redPak_total_money").text(totalMoney);
	}
}

//@ 返回上一页
function back_to_my_redPak() {
	goBack.myRedPacket();
	clear_redPak();
}

function clear_redPak() {
	$("#redPak_receiver").text("点击添加发送对象");
	$(".send-redPak-panel input").val("");
	$("#redPak_total_money").text("0");
	$("#redPak_branchPerson").text(0);
	$("#redPak_expense").val("0");
	$("#redPak_charge").val("0");
	$("#isShow_can_get_money").hide();
	localStorageUtils.removeParam("redPacket_ObjectArr");
	//默认为拼手气红包
	$("#redPak_type").text(redPakType["1"]["name"]).prev("var").text(redPakType["2"]["name"]);
	$("#redPak_money_title").html("红包总金额 (元)：").next("input").attr({
		"placeholder":"可输入 1~"+ redPakType[2]['max'] +" 元"
	}).val("");
	redpacket_Mode = "2";
}

var OperandUserId;
//@ The button of submit
function send_redPak_submit() {
	$("#redPak_submit").off("click");
	$("#redPak_submit").on("click",function () {
		var redPak_type = $("#redPak_type").text().trim(),
			money = Number($("#redPak_money").val()),
			count = Number($("#redPak_count").val()),
			expense = Number($("#redPak_expense").val()),
			charge = Number($("#redPak_charge").val()),
			name = $("#redPak_name").val().trim();
		var	cate = redPacket_ObjectArr[0];
		OperandUserId = redPacket_ObjectArr[1];

		if(!cate || !OperandUserId){
			toastUtils.showToast("请选择发送对象");
			return;
		}

		if(redPak_type == redPakType["2"]["name"]) {  //当前为普通红包
			if(money > redPakType[1]['max']){
				toastUtils.showToast("单个红包不可超过"+ redPakType[1]['max'] +"元");
				return;
			}else if(money < redPakType[1]['min']){
				toastUtils.showToast("单个红包不可低于"+ redPakType[1]['min'] +"元");
				return;
			}
			money = money*count;
		}else if(redPak_type == redPakType["1"]["name"]) {  //当前为拼手气红包
			if(money > redPakType[2]['max']){
				toastUtils.showToast("总金额不可超过"+ redPakType[2]['max'] +"元");
				return;
			}else if(money < redPakType[2]['min']){
				toastUtils.showToast("总金额不可低于"+ redPakType[2]['min'] +"元");
				return;
			}
		}else if(!money){
			toastUtils.showToast("请输入金额");
			return;
		}

		if(!count){
			toastUtils.showToast("最少发送一个红包");
			return;
		}
//		else if(count > redPakCountLimit){
//			toastUtils.showToast("红包个数不大于"+ redPakCountLimit +"个");
//			return;
//		}

		var myBalance = parseFloat(localStorageUtils.getParam("lotteryMoney")) || 0;
	 	if(money > myBalance){
			toastUtils.showToast("您的余额不足，请充值");
			return;
	    }

		expense = expense || 0;  //消费要求
		charge = charge || 0;    //充值要求
		name = name || "恭喜发财，大吉大利！";  //红包名称

		$.ui.popup(
			{
				title:"输入资金密码",
				message:'<input type="password" placeholder="请输入资金密码" id="redPak_sendPwd"/>',
				cancelText:"关闭",
				cancelCallback:
					function(){
					},
				doneText:"确定",
				doneCallback:
					function(){
						var redPak_sendPwd = $("#redPak_sendPwd").val().trim();
						if(!redPak_sendPwd){
							toastUtils.showToast("请输入资金密码");
							return;
						}

						var parameters = '{"InterfaceName":"/api/v1/netweb/redPacket_send","ProjectPublic_PlatformCode":2,"Name":"' + name + '","ReceiveUserCategory":' + cate + ',"OperandUserId":"' + OperandUserId + '","Mode":"' + redpacket_Mode + '","Amount":' + money + ',"Qty":' + count + ',"ReceiverLimitation":{"Person_Consumption":'+ expense +',"Person_Recharge_Money":'+ charge +'},"PayPassWord":"'+ redPak_sendPwd +'"}';
						ajaxUtil.ajaxByAsyncPost1(null, parameters, function (callBack) {
							if (callBack.Code == 200) {
								var message = "红包发送成功";
								toastUtils.showToast(message);
								//清除红包信息；
								clear_redPak();
							}else{
								var message = callBack.Msg || "红包发送失败";
								toastUtils.showToast(message);
							}
						},null);
					},
				cancelOnly:false
			});
	});
}

//@ 每人每天最多可发送红包数
function get_daily_max_send_num() {
	var parameters = '{"InterfaceName":"/api/v1/netweb/redPacket_dailySendMaxNum","ProjectPublic_PlatformCode":2}';
	ajaxUtil.ajaxByAsyncPost1(null, parameters,function (cb) {
		if(cb.Code == 200){
			var num = cb.Data.DailyMaxRedEnvelopSendQty || 10;  //无数据时默认10个
			$("#redPak_daily_max_send").text(num);
		}else {
			$("#redPak_daily_max_send").text(10);
		}
	} ,null);
}