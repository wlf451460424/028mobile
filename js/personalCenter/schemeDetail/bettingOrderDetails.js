/* 
* 注：此页面可从多个链接跳转过来，包括：
* 投注记录列表，中奖记录列表，我的账变记录详情/下级账变记录详情/团队账变记录详情中的流水号，均可跳转到此页。
*/

//投注模式
var payMode = "";
//返点模式
var fanDianMode = "";
//购买方式： 正常投注/追号投注
// var buyMode = "";
//中奖后是否追号
var winIsStop = "";
//判断来源是哪个页面：投注/中奖
var sourceFlag = "";
//订单ID计数
var sum = 0;
//彩种ID
var lotteryType = "";
//订单ID
var orderId = "";
//期号
var bettingqiHao="";
//流水号
var bettingorderID="";
//投注时间
var insertTime = "";
//IsHistory 默认false  是否是历史记录
var IsHistory=false;
//彩种名称
var lotteryName = "";
//玩法名称
var PlayName = "";

/**
 * 进入页面调用
 * [bettingOrderDetailsLoadedPanel description]
 * @return {[type]} [description]
 */
function bettingOrderDetailsLoadedPanel(){
   catchErrorFun("bettingOrderDetailsInit();");
}

/**
 * 离开页面调用
 * [bettingOrderDetailsUnloadedPanel description]
 * @return {[type]} [description]
 */
function bettingOrderDetailsUnloadedPanel(){
	$("#cardContent").empty();
	unloadAtBettingDetail = false;
}

/**
 * 初始化
 * [bettingOrderDetails description]
 * @return {[type]} [description]
 */
function bettingOrderDetailsInit(){
	sourceFlag = localStorageUtils.getParam("sourceFlag");
	if(!(IsHistory=localStorageUtils.getParam("IsHistory"))){
		IsHistory=false;
	}
	var bettingItem = JSON.parse(localStorageUtils.getParam("scheme"));
	lotteryType = bettingItem.lotteryType; //彩种ID
	insertTime = bettingItem.tzTime;  //投注时间
	orderId = bettingItem.orderId;   //订单ID
	bettingorderID = bettingItem.bettingorderID;  //流水号
	bettingqiHao = bettingItem.qiHao;	  //期号
	lotteryName= bettingItem.lotteryName//彩种名称
	PlayName= bettingItem.PlayName//玩法名称

	searchOrderbettingOrderDetails(lotteryType, bettingorderID);

	//添加滚动条
	 $("#bettingOrderDetailsPage").scroller({
		verticalScroll : true,
		horizontalScroll : false,
		vScrollCSS: "afScrollbar",
		autoEnable : true
	});
}
/**
 * 查询订单详情信息
 * @param lotteryId 彩种ID
 * @param orderId 订单流水号
 */
function searchOrderbettingOrderDetails(lotteryId, orderId) {
	var params='{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetBetDetailNew","LotteryCode":"' + lotteryId + '","IsHistory":' + IsHistory + ',"OrderID":"' + orderId + '"}';
	ajaxUtil.ajaxByAsyncPost(null, params, searchSuccessbettingOrderDetailsCallBack, '正在加载数据...');
}

/**
 * Description 查询订单记录回调函数
 * @return data 服务端返数据
 */
function searchSuccessbettingOrderDetailsCallBack(data) {
	$("#orderList").empty();
	$("#orderListCard").empty();
	$("#cardContent").empty();

//**** 标题 ****
	$("#orderListCard").append('<li id="cardTitle" style="text-align: left;font-size:15px;font-weight:500;color:#fff;background:#FE5D39;background: linear-gradient(#FE5D39,#ef8871); padding:6px 14px;border-radius: 4px;margin:8px 7px 0;">投 注 详 单</li>');

	if (data.Code == 200) {
		var info = data.Data.UserBetInfo;
	    var bet = info.Bet;
		if(bet == ""){
			return;
		}	    
		fanDianMode = info.BetRebate;
		payMode = bet[0].BetMode;
		// buyMode = bet[0].BetMode;
		winIsStop = bet[0].BetMode;
		lotteryType = info.LotteryCode || lotteryType;

//		$("#payMode").html(IsLongHuDou(lotteryType,bet[0].PlayCode) ? "元模式" : getPayMode(payMode));
		var str = lotteryType.toString();
		if(str.length >= 3 && str.split("")[0] == "5"){
        	// 盘口
        	$("#payMode").html("--");
        }else{
        	$("#payMode").html(IsLongHuDou(lotteryType,bet[0].PlayCode) ? "元模式" : getPayMode(payMode));
        }
                
//      $("#fanDian").html(IsLongHuDou(lotteryType,bet[0].PlayCode) ? "1800" : fanDianMode);
		if(str.length >= 3 && str.split("")[0] == "5"){
        	// 盘口      盘口订单详情显示赔率
        	$("#fanDian_title").html("投注赔率：");
        	var $span = $('<span id="fanDian">'+bet[0].Odds+'</span>');
        	$("#fanDian_title").append($span);
        	
//      	$("#fanDian").html(bet[0].Odds);
        }else{
        	$("#fanDian").html(IsLongHuDou(lotteryType,bet[0].PlayCode) ? "1800" : fanDianMode);
        }
        
		if ((Number(winIsStop) & 2) == 2) {
			$("#winIsStop").html("是");
		} else if ((Number(winIsStop) & 4) == 4) {
			$("#winIsStop").html("否");
		} else {
			$("#winIsStop").html("---");
		}

		for (var i = 0; i < bet.length; i++) {
			var dataSet = {};
			dataSet.lotteryType = info.LotteryCode;
			dataSet.betId = bet[i].ChaseOrderID; //订单号
			dataSet.orderId = bet[i].ChaseOrderID; //订单号
			dataSet.liushuiorderID = bet[i].OrderID; //流水号
			dataSet.qiHao = bet[i].IssueNumber;
			dataSet.money = bet[i].BetMoney;
			dataSet.operateType = bet[i].BetOrderState;
			dataSet.betState = bet[i].BetOrderState;  //订单状态
			dataSet.DrawContent = bet[i].DrawContent;  //开奖号码
//			dataSet.prizeNum = bet[i].AwContent; //中奖注数
//			dataSet.tzZhuShu = bet[i].BetCount; //投注注数
//			dataSet.beiShu = bet[i].BetMultiple;  //倍数
			
			var str = lotteryType.toString();
			if(str.length >= 3 && str.split("")[0] == "5"){
	        	// 盘口
	        	dataSet.prizeNum = "--"; //中奖注数
				dataSet.tzZhuShu = "--"; //投注注数
				dataSet.beiShu = "--";  //倍数
	        }else{
	        	dataSet.prizeNum = bet[i].AwContent; //中奖注数
				dataSet.tzZhuShu = bet[i].BetCount; //投注注数
				dataSet.beiShu = bet[i].BetMultiple;  //倍数
	        }

			dataSet.prizeMoney = bet[i].AwMoney;//changeTwoDecimal_f(bet[i].AwMoney); //奖金
			dataSet.tzcontent = bet[i].BetContent; //投注号码
			dataSet.ticketType = bet[i].PlayCode; //玩法ID
			dataSet.isDT = bet[i].BetMode;
			dataSet.BetCount = bet[i].BetCount;
			dataSet.InsertTime = bet[i].InsertTime;
			
			var str = dataSet.lotteryType.toString();
            if(str.length >= 3 && str.split("")[0] == "5"){
            	//彩种名称 盘口
            	lotteryName=hcp_LotteryInfo.getLotteryNameById(str);
            }else{
            	lotteryName=LotteryInfo.getLotteryNameById(str);
            }
            var str = dataSet.lotteryType.toString();
            if(str.length >= 3 && str.split("")[0] == "5"){
            	//玩法名称 盘口
            	var a = str;
            	var b = dataSet.ticketType.toString();
            	var playId = b.replace(a,"");
            	var tagArr = hcp_LotteryInfo.getLotteryTypeById(a).split("_")[1];
            	var PlayCodeArr = eval('hcp_playCode_' + tagArr);
            	for (var k = 0; k < PlayCodeArr.length; k++) {
            		if(($.inArray(playId,PlayCodeArr[k]["play_code"]) != -1 )){
            			PlayName = PlayCodeArr[k]["name"].split(" ")[0];
            		}
            	}
            	
            	//此处先写死  读取投注内容显示玩法；后续手机显示盘口的话  按照自己的玩法走。
            	PlayName = dataSet.tzcontent;
            }else{
            	PlayName=LotteryInfo.getPlayMethodName(dataSet.lotteryType + "", dataSet.ticketType + "",dataSet.isDT);
            }

			var listitem = JSON.stringify(dataSet);

			$("#orderDetails_Id").html(dataSet.betId);  //订单号
			$("#bettingorderID").html(dataSet.liushuiorderID); //流水号
			$("#datetime").html(dataSet.InsertTime); //时间

			sum++;
			localStorageUtils.setParam("order" + sum, listitem);
			var liId = "order" + sum;
			var $itemdetailLi = $('<li id='+liId+'></li>').data('itemdetailLi',dataSet);
			$itemdetailLi.on('click',function() {
				localStorageUtils.setParam("orderIndex",JSON.stringify($(this).data('itemdetailLi')));
				setPanelBackPage_Fun('bettingDetil');
			});

		   	var $delete_;
		  	 var operateType_='';
		   	if((Number(dataSet.betState) & 1048577) == 1048577){
               	$delete_=$('<div  class="loginBtn" style="border-radius:3px; margin-top:20px; margin-bottom:20px;" id='+dataSet.liushuiorderID+' onclick="createInitPanel(this);">撤单</div>');
               	operateType_='<span class="perOrderState">购买成功</span>';
		   	}else{
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
		   	
			//*******  contentDetails Start ***********
			var $contentDetails=$('<ul class="mylist"><li>投注期号 : <span id="qiHao">'+ dataSet.qiHao +
//			'</span></li><li>彩&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 种：<span id="lotteryCodeID">'+LotteryInfo.getLotteryNameById(lotteryType + "")+
			'</span></li><li>彩&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 种：<span class="redtext" id="lotteryCodeID">'+lotteryName+
//			'</span></li><li>玩&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 法：<span id="playCodeID">'+LotteryInfo.getPlayMethodName(lotteryType + "", dataSet.ticketType + "",dataSet.isDT)+
			
			'</span></li><li >玩&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 法：<span class="redtext" id="playCodeID">'+PlayName+
			'</span></li><li>购彩金额：<span id="tzmoney">'+dataSet.money+' 元'+
			'</span></li><li>投注倍数：<span id="beiShu">'+ (IsLongHuDou(lotteryType,dataSet.ticketType)?1:dataSet.beiShu) +
			' 倍</span></li><li>投注注数：<span id="betCount">'+dataSet.tzZhuShu+
			' 注</span></li><li>订单状态：<span id="orderState">'+getOrderState(dataSet.betState)+
			'</span></li><li>中奖注数：<span id="prizeNums" style="white-space:pre-wrap;table-layout:fixed; word-break : break-all; word-wrap : break-word ;">'+prizeNum(dataSet.prizeNum)+
			' 注</span></li><li>奖&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;金：<span id="prizeMoney">'+dataSet.prizeMoney+' 元'+
			'</span></li><li style="display: inline-block;word-break: break-all;word-wrap:break-word;white-space:normal;">开奖号码：<span id="prizeResult" >'+hcp_getPrizeResults(dataSet,lotteryType)+
			'</span></li><li style="word-break: break-all;word-wrap:break-word;white-space:normal;">投注号码：<span id="betContent">'+tzContentToChinese(lotteryType,dataSet.ticketType+"", dataSet.tzcontent+"")+'</span></li></ul>');

			//*******  contentDetails End ********
			$("#cardContent").append($contentDetails); // Now
			
			$("#orderList").append($delete_);//撤单
			var str = lotteryType.toString();
			if(str.length >= 3 && str.split("")[0] == "5"){
	        	// 盘口
	        	//暂时没有撤单功能；
	        }else{
	        	$("#orderList").append($delete_);//撤单
	        }
	  	}
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//调用--撤掉单条记录回调函数
function createInitPanel(id){
	deleteOrderByOrderId(id);
	event.stopPropagation();
}

/**
 * Description 撤掉单条记录回调函数
 * @return data 服务端返数据
 */
function deleteOrderByOrderId(id) {
  	 var params = '{"InterfaceName":"/api/v1/netweb/CancelOrder","ProjectPublic_PlatformCode":2,"Code":"' + lotteryType + '","OrderID":"' + id.id + '"}';
	ajaxUtil.ajaxByAsyncPost(null, params, function(data){
		if (data.Code == 200) {
			if (data.Data.CarryStateResult) {
				toastUtils.showToast("撤单成功");
				searchOrderbettingOrderDetails(lotteryType, bettingorderID);
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
	}, '正在加载数据...');   
}

/***** Function for contentDetails *****
** 中奖注数
*/
function prizeNum(num){
	if (num=="") {
		return '0';
	} else {
		return num;
	}
}

// 时时彩的龙虎斗,骰宝，只显示1倍，只显示元模式,返点1800；其他玩法倍数、模式正常显示。
function IsLongHuDou(lotteryId, playId) {
	lotteryId = lotteryId.toString();
	playId = playId.toString();
	var methodId = playId.replace(lotteryId,'');
	var longHuDou = ['109','110','111','112','113','114','115','116','117','118'];
	if ((LotteryInfo.getLotteryTypeById(lotteryId) == "ssc" && $.inArray(methodId,longHuDou) != -1) || LotteryInfo.getLotteryTypeById(lotteryId) == 'tb'){
		return true;
	}else{
		return false;
	}
}


/**
 * 开奖内容显示处理
 * @return 返回处理好的开奖内容以显示
 */
function hcp_getPrizeResults(betDetailInfo,lotteryId) {
    var prize = betDetailInfo.DrawContent;
    if (prize == "") {
        return "等待开奖";
    } else {
//      if(hcp_LotteryInfo.getLotteryTypeById(lotteryId) == 'hcp_klb'){ //去掉kl8飞盘号
//          var arr = prize.split(",");
//          arr = arr.slice(0,20);
//          prize = arr.join(",");
//          return prize;
//      }
//      return prize;
        
        
        var str = betDetailInfo.lotteryType.toString();
        if(str.length >= 3 && str.split("")[0] == "5"){
        	// 盘口
        	if(hcp_LotteryInfo.getLotteryTypeById(lotteryId) == 'hcp_klb'){ //去掉kl8飞盘号
	            var arr = prize.split(",");
	            arr = arr.slice(0,20);
	            prize = arr.join(",");
	            return prize;
	        }
	        return prize;
        }else{
        	if(LotteryInfo.getLotteryTypeById(lotteryId) == 'klb'){ //去掉kl8飞盘号
	            var arr = prize.split(",");
	            arr = arr.slice(0,20);
	            prize = arr.join(",");
	            return prize;
	        }
	        return prize;
        }
    }
}