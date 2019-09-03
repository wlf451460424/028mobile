/*
 * 追号记录，三级页面
 * */
//此变量与追号记录一二级页面相关，当从此页面直接跳到index，再次进入追号记录应初始化其所有数据。
var unloadAtBettingDetail = false;

/********** 进入这个页面时调用  **********/
function bettingDetilLoadedPanel() {
    unloadAtBettingDetail = false;
    catchErrorFun(" bettingDetilInit();");
}
/********** 离开这个页面时调用  **********/
function selfDetilUnloadedPanel(){
    unloadAtBettingDetail = true;
}

/********** 页面init **********/
function bettingDetilInit(){
    var orderItem = JSON.parse(localStorageUtils.getParam("orderIndex"));
    var lotteryId = orderItem.lotteryType, //彩种ID
        liuShuiId = orderItem.liushuiorderID; //流水号

    var param ='{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetBetDetailNew","LotteryCode":"' + lotteryId + '","IsHistory":' + IsHistory + ',"OrderID":"' + liuShuiId + '"}';
    ajaxUtil.ajaxByAsyncPost(null, param, function(data){
    	if (data.Code == 200) {
			var betDetailInfo = data.Data.UserBetInfo.Bet[0];
	        $("#orderId").html(betDetailInfo.ChaseOrderID);
	        $("#liushuiID").html(betDetailInfo.OrderID);
	        $("#qiHao").html(betDetailInfo.IssueNumber);
	        $("#tzmoney").html(betDetailInfo.BetMoney +" 元");  //购彩金额
	        $("#zhuShu").html(betDetailInfo.BetCount +" 注");  //投注注数
	        $("#beiShu").html(betDetailInfo.BetMultiple+" 倍");  //投注倍数
	        $("#lotteryCodeID").html(LotteryInfo.getLotteryNameById(lotteryId));
	        $("#playCodeID").html(LotteryInfo.getPlayMethodName(lotteryId, betDetailInfo.PlayCode, betDetailInfo.BetMode));
	        $("#orderState").html(getOrderState(betDetailInfo.BetOrderState));
	
	        if (betDetailInfo.AwContent == "") {
	            $("#prizeNums").html(0 + " 注");
	        } else {
	            $("#prizeNums").html(betDetailInfo.AwContent + " 注");
	        }
	        $("#prizeMoney").html(betDetailInfo.AwMoney +" 元");
	        $("#prizeResult").html(getPrizeResults(betDetailInfo,lotteryId));
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
    }, '正在加载数据...');
}
/**
 *获取订单状态
 * @param allOrderState 订单状态ID
 * @return 返回订单状态中文 显示
 */
function getOrderState(allOrderState) {
    if ((Number(allOrderState) & 1) == 1) {
        return "购买成功";
    } else if ((Number(allOrderState) & 33554432) == 33554432) {
        return "未中奖";
    } else if ((Number(allOrderState) & 64) == 64) {
        return "已出票";
    } else if ((Number(allOrderState) & 16777216) == 16777216) {
        return "已派奖";
    } else if ((Number(allOrderState) & 32768) == 32768) {
        return "已撤奖";
    } else if ((Number(allOrderState) & 4096) == 4096) {
        return "已结算";
    } else if ((Number(allOrderState) & 512) == 512) {
        return "强制结算";
    } else if ((Number(allOrderState) & 4) == 4) {
        return "已撤单";
    } else {
        return "订单异常";
    }
}

/**
 * 开奖内容显示处理
 * @return 返回处理好的开奖内容以显示
 */
function getPrizeResults(betDetailInfo,lotteryId) {
    var prize = betDetailInfo.DrawContent;
    if (prize == "") {
        return "等待开奖";
    } else {
        if(LotteryInfo.getLotteryTypeById(lotteryId) == 'kl8'){ //去掉kl8飞盘号
            var arr = prize.split(",");
            arr = arr.slice(0,20);
            prize = arr.join(",");
            return prize;
        }
        return prize;
    }
}