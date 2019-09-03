
//付款模式
var payMode = "";
//返点模式
var fanDianMode = "";
//购买方式： 正常投注/追号投注
var buyMode = "";
//中奖后是否追号
var winIsStop = "";
//判断来源是哪个页面：投注/中奖
var sourceFlag = "";
//订单ID计数
var sum = 0;
//彩种名称
var lotteryType = "";
//订单ID
var orderId = "";
//投注时间
var insertTime = "";
//IsHistory 默认false  是否是历史记录
var IsHistory=false;

/**
 * 进入页面调用
 * [zhuiHaoBettingOrderDetailsLoadedPanel description]
 * @return {[type]} [description]
 */
function zhuiHaoBettingOrderDetailsLoadedPanel(){
   catchErrorFun("zhuiHaoBettingOrderDetailsInit();");
}

/**
 * 离开页面调用
 * [zhuiHaoBettingOrderDetailsUnloadedPanel description]
 * @return {[type]} [description]
 */
function zhuiHaoBettingOrderDetailsUnloadedPanel(){
	unloadAtBettingDetail = false;
}

/**
 * 初始化
 * [bettingOrderDetails description]
 * @return {[type]} [description]
 */
function zhuiHaoBettingOrderDetailsInit(){
	IsHistory = localStorageUtils.getParam("IsHistory");
	moneyType = localStorageUtils.getParam("moneyType");
	userName = localStorageUtils.getParam("username");
	var bettingIndex = JSON.parse(localStorageUtils.getParam("zhuihao"));
	lotteryType = bettingIndex.lotteryType;
	insertTime = bettingIndex.tzTime;
	orderId = bettingIndex.orderId;
	$("#orderDetails_Id_zh").html(orderId);
	$("#orderDetails_money_zh").html(bettingIndex.tzMoney + "元");
	$("#datetime_zh").html(bettingIndex.tzTime);
	$("#orderDetails_qiHao_zh").html(bettingIndex.qiHao);
	$("#allAwMoneyID_zh").html(bettingIndex.sumAwardMoney);
	$("#shengyuqishuID_zh").html(bettingIndex.countSY);
	if(bettingIndex.countSY == 0){
		$("#orderDetails_orderState_zh").html("已完成");
		$('#cancelOrderOneTime').hide();
	}else{
		$("#orderDetails_orderState_zh").html("进行中");
		$('#cancelOrderOneTime').hide();
	}
    searchOrder_zh(bettingIndex.lotteryType, orderId);

	$('#cancelOrderOneTime').off('click');
	$('#cancelOrderOneTime').on('click',function (event) {
		$.ui.popup(
			{
				title:"提 示",
				message:'您确定一键撤销所有订单吗？',
				cancelText:"关闭",
				cancelCallback:function(){},

				doneText:"确定",
				doneCallback:
					function(){
						cancelOrderOneTime(orderId);
					},
				cancelOnly:false
			});
	});
}

/**
 * 查询订单详情信息
 * @param lotteryId 彩种ID
 * @param orderId 订单ID号
 */
function searchOrder_zh(lotteryId, orderId) {
	params='{"InsertTime":"'+insertTime+'","ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetBetOrderDetil","LotteryCode":"' + lotteryId + '","IsHistory":' + IsHistory + ',"ChaseOrderID":"' + orderId + '"}';
	ajaxUtil.ajaxByAsyncPost(null, params, searchSuccessCallBack_zh, '正在加载数据...');
}

//@ 查询订单记录回调函数
function searchSuccessCallBack_zh(data) {
	$("#orderList_zh").empty();
	$("#orderList_zh").append('<li id="list_divider_id" style="background:#FE5D39; background:linear-gradient(#FE5D39,#FE5D39); color:#FFFFFF;padding:6px 16px;font-size: 16px;margin:10px 0 0;">购 买 号 码</li>');
	
	if (data.Code == 200) {
		var info = data.Data.UserBetInfo;
		var bet = info.Bet;
		fanDianMode = info.BetRebate;
		payMode = bet[0].BetMode;
		buyMode = bet[0].BetMode;
		winIsStop = bet[0].BetMode;
		$("#payMode_zh").html(getPayMode(payMode));
		$("#fanDian_zh").html(fanDianMode);

		if ((Number(winIsStop) & 2) == 2) {
			$("#winIsStop_zh").html("是");
		} else if ((Number(winIsStop) & 4) == 4) {
			$("#winIsStop_zh").html("否");
		} else {
			$("#winIsStop_zh").html("---");
		}

		for (var i = 0; i < bet.length; i++) {
			var text = "";
			var dataSet = new Object();
			dataSet.betId = bet[i].ChaseOrderID;
			dataSet.orderId = bet[i].ChaseOrderID;
			dataSet.liushuiorderID = bet[i].OrderID;
			dataSet.qiHao = bet[i].IssueNumber;
			dataSet.beiShu = bet[i].BetMultiple;
			dataSet.money = bet[i].BetMoney;
			dataSet.operateType = bet[i].BetOrderState;
			dataSet.betState = bet[i].BetOrderState;
			dataSet.prizeResult = bet[i].DrawContent;
			dataSet.prizeNum = bet[i].AwContent;
			dataSet.prizeMoney = bet[i].AwMoney;  //changeTwoDecimal_f(bet[i].AwMoney);
			dataSet.tzcontent = bet[i].BetContent;
			dataSet.lotteryType = info.LotteryCode;
			dataSet.ticketType = bet[i].PlayCode;
			dataSet.isDT = bet[i].BetMode;
			dataSet.BetCount = bet[i].BetCount;

			var $itemdetailLi = $('<li></li>').data('itemdetailLi',dataSet);
				$itemdetailLi.on('click',function() {
					localStorageUtils.setParam("orderIndex",JSON.stringify($(this).data('itemdetailLi')));
					setPanelBackPage_Fun('bettingDetil');
				});

			   var $delete_;
			   var operateType_='';
			   if((Number(dataSet.betState) & 1048577) == 1048577){
                   $delete_=$('<div  class="loginBtn" id='+dataSet.liushuiorderID+' onclick="createInitPanel_zh(this);">撤单</div>');
                   operateType_='<span class="perOrderState">购买成功</span>';
			   }else{
			   	    $delete_=$('');
				   	if ((Number(dataSet.operateType) & 1) == 1) {
						operateType_='<span class="perOrderState">购买成功</span>';
					} else if ((Number(dataSet.operateType) & 32768) == 32768) {
						operateType_='<span class="perOrderState">已撤奖</span>';
					} else if ((Number(dataSet.operateType) & 64) == 64) {
						operateType_='<span class="perOrderState">已出票</span>';
					} else if ((Number(dataSet.operateType) & 16777216) == 16777216) {
						operateType_='<span class="perOrderState">已派奖</span>';
					} else if ((Number(dataSet.operateType) & 33554432) == 33554432) {
						operateType_='<span class="perOrderState">未中奖</span>';
					} else if ((Number(dataSet.operateType) & 4096) == 4096) {
						operateType_='<span class="perOrderState">已结算</span>';
					} else if ((Number(dataSet.operateType) & 512) == 512) {
						operateType_='<span class="perOrderState">强制结算</span>';
					} else if ((Number(dataSet.operateType) & 4) == 4) {
						operateType_='<span class="perOrderState">已撤单</span>';
					} else {
						operateType_='<span class="perOrderState">订单异常</span>';
					}
			   }
               $itemdetailLi.append('<a href="#" class="recordList"><table><tbody><tr><td><h3 class="whitetext"><span>'
				   +LotteryInfo.getPlayMethodName(dataSet.lotteryType,dataSet.ticketType,dataSet.isDT)
				   +'</span> &nbsp;&nbsp;&nbsp; <span></span></h3><p class="bettingOrderDetailP">'
				   +tzContentToChinese(lotteryType,dataSet.ticketType+"", dataSet.tzcontent+"")
				   +'</p><p style="color: #DEB04A">'+operateType_+'&nbsp;&nbsp;&nbsp;<span>'+dataSet.qiHao
				   +'</span></p></td></tr></tbody></table></a>');
               $("#orderList_zh").append($delete_);
               $("#orderList_zh").append($itemdetailLi);
	  	}
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

function createInitPanel_zh(id){
	deleteOrderByOrderId_zhjl(id);
}

//@ 撤掉单条记录回调函数
function deleteOrderByOrderId_zhjl(id) {
  	 var params = '{"InterfaceName":"/api/v1/netweb/CancelOrder","ProjectPublic_PlatformCode":2,"Code":"' + lotteryType + '","OrderID":"' + id.id + '"}';
	ajaxUtil.ajaxByAsyncPost(null, params, function(data){
		if (data.Code == 200) {
			if (data.Data.CarryStateResult) {
				toastUtils.showToast("撤单成功");
				 searchOrder_zh(lotteryType, orderId);
			} else if(data.Data.OrderState == -1){
				toastUtils.showToast("该期已封单，不能撤单！");
			} else {
				toastUtils.showToast("撤单失败");
			}
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	}, '撤单中...');   
}

//@ 一键撤单
function cancelOrderOneTime(orderID) {
	var params = '{"InterfaceName":"/api/v1/netweb/OneKeyCancelOrder","ProjectPublic_PlatformCode":2,"Code":"' + lotteryType + '","OrderID":"' + orderID + '"}';
	ajaxUtil.ajaxByAsyncPost(null, params, function(data){
		if (data.Code == 200) {
			if (data.Data.UpdateCompleteNum > 0) {
				toastUtils.showToast("成功撤销 <b>"+ data.Data.UpdateCompleteNum +"</b> 单");
				setPanelBackPage_Fun('myZhuihaoRecords');
			} else {
				toastUtils.showToast("撤单失败");
			}
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	}, '撤单中...');
}