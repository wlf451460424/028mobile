/**
 *彩票界面点击提交按钮，传递给 checkOutPage.html界面的参数对象
 */
var hcp_checkoutResult=[];
function hcp_LotterySubmitParams() {
	this.lotteryType;//彩票ID
    this.playType;//玩法名称
    this.playMethod;//玩法投注类型，如组合
    this.playTypeIndex;//玩法下标
    this.playMethodIndex;//玩法类型下标
    this.nums;//选的号码        Type:String
	this.rebates;//返点
	this.money;//金额
	this.award;//奖金
	this.maxAward;// 最大奖金
    //设置参数后，调用此方法，自动将该对象转化成json字串
    this.toString = function() {
        return JSON.stringify(this);
    };
    //设置参数，调用此方法传递参数，并自动跳转到checkOutTicket.html界面
    this.submit = function() {
    	var arr = new Array();
    	for (var i=0;i<this.nums.length;i++){
			if(this.nums[i].length != 0){
				for (var j=0;j<this.nums[i].length;j++){
					if(this.nums[i][j].length != 0){
						arr.push(this.nums[i][j]);
					}
				}
				
			}
		}
    	
//  	if(hcp_checkoutResult.length == 0){
//  		hcp_checkoutResult.splice(0,0, this);
//  	}else{
//  		var arr = new Array();
//  		for (var i=0;i<this.nums.length;i++){
//				if(this.nums[i].length != 0){
//					for (var j=0;j<this.nums[i].length;j++){
//						if(this.nums[i][j].length != 0){
//							arr.push(this.nums[i][j]);
//						}
//					}
//					
//				}
//			}
//  		this.nums = new Array();
//			this.nums.push(arr);
//			hcp_checkoutResult.unshift(this);
//  	}
    	
    	this.nums = new Array();
		this.nums.push(arr);
		hcp_checkoutResult.unshift(this);
			
    	createInitPanel_Fun("hcp_checkOutPage", true);
    }
}

/**
 * [hcp_clickForRandom 出票页面随机]
 * @param  {Function} fn   [description]
 * @param  {[type]}   args [description]
 * @return {[type]}        [description]
 */
function hcp_clickForRandom(fn,args){
	return fn.apply(this, args);  
}

var timerId;
/**
 * @param:teryName 彩种名称
 */
function hcp_getQihao(lotteryName,value){
	lotteryId = value;
	localStorageUtils.setParam("lotteryName",lotteryName);
	localStorageUtils.setParam("lotteryType",value);
	var params='{"LotteryCodeEnum": ' + value + ',"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetCurrLotteryIssue"}';
	ajaxUtil.ajaxByAsyncPost1(null,params,function(data){
		if(data.Code == 200) {
			$("#" + lotteryName + "_qihao").html("第&nbsp;"+data.Data.IssueNumber+"&nbsp;期&nbsp;&nbsp;&nbsp;&nbsp;倒计时：");
			if(timerId != null){
				clearInterval(timerId);
			}
			
			//判断倒计时 为0或小于0 的临界点
			if(Number(data.Data.SS) > 0){
				hcp_startTimer(lotteryName,data.Data.SS);
				hcp_refreshLastPeriodNumber(lotteryName);
			}else{
				hcp_getQihao(lotteryName,value);
			}
			
			//生成倒计时
			//countDownTime(lotteryName + "_timer",data.EndTime,data.SS,data.IssueNumber,localStorageUtils.getParam("lotteryName"));
		}else{//如果查询期号失败则提示并返回购彩大厅
			toastUtils.showToast(data.Msg);
			$("#" + lotteryName + "_timer").html("");
			$("#" + lotteryName + "_qihao").html("");
		}
	},null);
}
//开奖时间
function hcp_startTimer(lottery,remainTime){
	timerId = setInterval(function () {
		var countTime = remainTime--;
		h = Math.floor(countTime/3600),
			m = Math.floor(((countTime-h*3600))/60),
			s = Math.floor(countTime-h*3600-m*60),
			h = (h > 9 ? h : "0" + h),
			m = (m > 9 ? m : "0" + m),
			s = (s > 9 ? s : "0" + s);
		$("#" + lottery + "_timer").html((format("hh:mm:ss",{h: h, m: m, s: s})));
		if(countTime == 0){
			clearInterval(timerId);
			hcp_getQihao(localStorageUtils.getParam("lotteryName"),localStorageUtils.getParam("lotteryType"));
			hcp_queryLastPrize(lottery);
		}
	}, 1000);
}

this.format = function (formatter,time) {
	return formatter.replace(/hh/ig, time.h).replace(/mm/ig, time.m).replace(/ss/ig, time.s);
};

//定时刷开奖号码
var periodTimer;
function hcp_refreshLastPeriodNumber(lottery){
//	var lotteryId = hcp_LotteryInfo.getLotteryIdByTag(lottery);
	if(typeof(periodTimer) != "undefined" && periodTimer ){
		clearInterval(periodTimer);
	}
	periodTimer = setInterval(function () {
		ajaxUtil.ajaxByAsyncPost_mute(null,'{"IsSelf":false,"ProjectPublic_PlatformCode":2,"Size":10,"Page":0,"reType":1,"InterfaceName":"/api/v1/netweb/GetHisNumber","CZID":"'+lotteryId+'"}',function(data){
			if(data.Code == 200){
			    var _resultS = data.Data[0].CzNum;
				var currentPeriod = data.Data[0].CzPeriod;
				var period_different = Number(localStorageUtils.getParam("periodNumber")) - Number(currentPeriod); //最新一期期号和历史最近一期期号差值
				if(period_different <= 1){
					clearInterval(periodTimer);
					return;
				}
				if (LotteryInfo.getLotteryTypeById(data.Data[0].CzType)=='kl8') {
					var arr =_resultS.split(',');
					arr = arr.slice(0,20);
					_resultS = arr.join(',');
				}
				_resultS = _resultS.replace(new RegExp(/,/g), " ");

				//显示最新一期开奖号码；
				if($(".show-result")){
					$(".show-result").remove();
				}
				if(lotteryId == '509' || lotteryId == '579' || lotteryId == '580'){
					var str1 = _resultS.slice(0,35);
					var str2 = _resultS.slice(36,59);
					$("div.timeFC").append('<p class="show-result">最新开奖：<span>'+str1+'</span><br/><span>'+str2+'</span></p>');
				}else{
					var lotteryNewResultNumber = "最新开奖：" + _resultS ;
					$("div.timeFC").append('<p class="show-result">'+ lotteryNewResultNumber +'</p>');
				}
			} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
				toastUtils.showToast("请重新登录");
				loginAgain();
			}else{
			    toastUtils.showToast(data.Msg);
			}
		},null,function () {  //Error Function
			if(typeof(periodTimer) != "undefined" && periodTimer ){
				clearInterval(periodTimer);
			}
		});
	},6000);  //6S 刷新一次
}

//最新一期历史开奖码（彩种页面的 近期开奖）
var ResultNumber="";
function hcp_queryLastPrize(lottery,lotteryId){
	$("#"+lottery+"_prizelist div").first().empty();
	var lotteryId = lotteryId;
	var merchantCode = localStorageUtils.getParam("MerchantCode");

	if(lotteryId == 50){
		var datetime = new Date();
		var endTime = new Date();
		datetime.setHours(0, 0, 0);
		endTime.setHours(23, 59, 59);
		datetime.setDate(datetime.getDate() - 3);
		var  startDateTime = datetime.Format("yyyy/MM/dd hh:mm:ss");
		var  endDateTime = endTime.Format("yyyy/MM/dd hh:mm:ss");
		ajaxUtil.ajaxByAsyncPost(null,'{"InterfaceName":"/api/v1/netweb/GetLotteryDrawPageFlx","CurrentPageSize":10,"LotteryCode":"50","BeginTime":"' + startDateTime + '","ProjectPublic_PlatformCode":2,"EndTime":"' + endDateTime + '","CurrentPageIndex":0}',function(data){
			$("#"+lottery+"_prizelist div").first().empty();
			if(data.Code == 200){
				var $p = $('<p style="width:100%"><span> 期号</span><span style="color:#FE5D39"> 开奖结果</span><img src="./././images/reload.png" style="width: 24px;height:24px;margin:0 20px 0 -46px;" id="'+lottery+'reloadRst"></p>');
				var $div = $('<div id="'+ lottery +'_prizeScroll" style="position:absolute;top:70px;bottom:16px;overflow: hidden; width:100%;"></div>');
				var $table = $('<table id="'+ lottery +'_prizeContent"></table>');
				$.each(data.Data.IssueModlst, function(key, val) {
					var _resultS = val.DrawResult1;
					_resultS = _resultS.replace(new RegExp(/,/g)," ");
					$table.append('<tr ><td>'+val.IssueNumber1+'</td><td style="color:#FE5D39;">'+_resultS+'</td></tr>');
					ResultNumber = _resultS;
					//显示最新一期开奖号码；
					if(key == 0){
						if($(".show-result")){
							$(".show-result").remove();
						}
						var lotteryNewResultNumber = "最新开奖：" + ResultNumber ;
						$("div.timeFC").append('<p class="show-result">'+ lotteryNewResultNumber +'</p>');
					}
				});
				
				$("#"+lottery+"_prizelist div").first().append($p);
				$("#"+lottery+"_prizelist div").first().append($div.append($table));

				hcp_addPrizeScroll(lottery);

				//点击刷新图标重新载入最新开奖结果
				$("#"+lottery+"reloadRst").on('click',function(event) {
					hcp_queryLastPrize(lottery,lotteryId);
					event.preventDefault();
					event.stopPropagation();
				});
			} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
				toastUtils.showToast("请重新登录");
				loginAgain();
			}else{
				$("#"+lottery+"_prizelist div").first().append("暂无最新开奖").css("textAlign","center");
			    toastUtils.showToast(data.Msg);
			}
		}, '正在加载数据...');
	}else{
		// 为屏蔽腾讯分分彩重复开奖号，而请求15期，其他彩种均请求10期。  -- Start --
		var prizeNum = 10;
		if (lotteryId == '57'){ prizeNum = 15; }
		// -- End of prizeNum --

		ajaxUtil.ajaxByAsyncPost1(null, '{"IsSelf":false,"ProjectPublic_PlatformCode":2,"Size":'+ prizeNum +',"Page":0,"reType":1,"InterfaceName":"/api/v1/netweb/GetHisNumber","CZID":"' +  lotteryId + '"}',function(data){
			$("#"+lottery+"_prizelist div").first().empty();
			if(data.Code == 200){
				var $p = $('<p style="width:100%"><span> 期号</span><span style="color:#FE5D39"> 开奖结果</span><img src="./././images/reload.png" style="width: 24px;height:24px;margin:0 20px 0 -46px;" id="'+lottery+'reloadRst"></p>');
				var $div = $('<div id="'+ lottery +'_prizeScroll" style="position:absolute;top:70px;bottom:16px;overflow: hidden; width:100%;"></div>');
				var $table = $('<table id="'+ lottery +'_prizeContent"></table>');

				$.each(data.Data, function(key, val) {
					if(key < 10) {
						var _resultS = val.CzNum;
						if (hcp_LotteryInfo.getLotteryTagById(val.CzType)=='hcpKlb') {
							var arr = _resultS.split(',');
							arr = arr.slice(0,20);
							_resultS = arr.join(',');
						}
						_resultS = _resultS.replace(new RegExp(/,/g), " ");
						$table.append('<tr><td>' + val.CzPeriod + '</td><td style="color:#dc0a20;">' + _resultS + '</td></tr>');
						ResultNumber = _resultS;
						//显示最新一期开奖号码；
						if(key == 0){
							//显示最新一期开奖号码；
							if($(".show-result")){
								$(".show-result").remove();
							}
							if(lotteryId == '509' || lotteryId == '579' || lotteryId == '580'){
								var str1 = ResultNumber.slice(0,35);
								var str2 = ResultNumber.slice(36,59);
								$("div.timeFC").append('<p class="show-result">最新开奖：<span>'+str1+'</span><br/><span>'+str2+'</span></p>');
							}else{
								var lotteryNewResultNumber = "最新开奖：" + ResultNumber ;
								$("div.timeFC").append('<p class="show-result">'+ lotteryNewResultNumber +'</p>');
							}
						}
						
					}
				});
				$("#"+lottery+"_prizelist div").first().append($p);
				$("#"+lottery+"_prizelist div").first().append($div.append($table));

				hcp_addPrizeScroll(lottery);

				//点击刷新图标重新载入最新开奖结果
				$("#"+lottery+"reloadRst").on('click',function(event) {
					hcp_queryLastPrize(lottery,lotteryId);
					event.preventDefault();
					event.stopPropagation();
				});
			} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
				toastUtils.showToast("请重新登录");
				loginAgain();
			}else{
				$("#"+lottery+"_prizelist div").first().append("暂无最新开奖").css("textAlign","center");
			    toastUtils.showToast(data.Msg);
			}
		}, '正在加载数据...');
	}
}

// 最近开奖添加滑动条
function hcp_addPrizeScroll(lottery) {
	var prizelistScroll = new IScroll("#"+lottery+"_prizeScroll",{
		scrollbars: true,
		mouseWheel: true,
		interactiveScrollbars: true,
		shrinkScrollbars: 'scale',
		fadeScrollbars: true
	});

	$("#"+lottery+"_prizelist").on('show', function(event, dropdownData) {
		if(prizelistScroll){
			prizelistScroll.refresh();
		}
	});
}

/**
 * @Description: 清空所有有选球
 */
function hcp_qingKong(lotteryName, fun){
	$('#'+ lotteryName +'_qingkong').unbind('click');
	$('#'+ lotteryName +'_qingkong').click(function() {
		//清空
		eval(fun + '_qingkongAll' + '()');
	});
}


//@ 创建赔率选项框
function hcp_createLossPercent(lotteryName) {
	var $lossPercentSel = $('<div style="position: relative;clear:both;border-top: 1px dashed #c1c1c1; height:40px;padding-top:6px;margin-top:8px;"><table style="width: 100%;height: 38px;"><tr><td style="width: 80px;"><b>返点选择：</b></td>' +
		'<td style="width:calc(100% - 80px);"><select onchange="'+lotteryName+'_calcRate(this)" id="'+lotteryName+'_lossPercent" style="padding:6px;height:30px;line-height:20px;">' + '</select></td></tr></table></div>');

	$("#"+lotteryName+"_ballView").append($lossPercentSel);
}
/******  定义变量 ******/
var maxRebate = "";  		  // 商户最大返点
var minRebate = "";  		  // 商户最小返点
var xRebate = 2;      		  // 返点差值
var hcp_defaultBetRebate;         // 人为设置的返点
var fandianshu = '1940';      // 声明并初始化返点
var isCloseFandian = false;   // true：返点关闭；false：返点开启；
var isJiaoModeClosed = false; // true 表示角模式关闭
var isFenModeClosed = false;  // true 表示分模式关闭
var isLiModeClosed = false;  // true 表示厘模式关闭
var yuanjiaofen="1";          // 园角分模式初始化
var lotteryId;

// 获取每个玩法下的返点列表；
function hcp_getLotteryInfo(lotteryID,callback){
	maxRebate = localStorageUtils.getParam("MaxRebate");
	minRebate = localStorageUtils.getParam("MinRebate");
	MYRebate = localStorageUtils.getParam("MYRebate");
	xRebate = localStorageUtils.getParam("XRebate");

	var params='{"ProjectPublic_PlatformCode":2,"LotteryCodeEnum": "' + lotteryID + '","InterfaceName":"/api/v1/netweb/GetLotteryInfo"}';
	ajaxUtil.ajaxByAsyncPost1(null, params, function(data) {
		if(data.Code == 200){
		    if(data.Data != null){
				if(data.Data.state){
					hcp_lottery_rebate = data.Data.LotteryInfo.PlayInfo;
					//自身投注返点
					var userRebate = bigNumberUtil.minus(Number(maxRebate),Number(MYRebate));
					var temp = data.Data.LotteryRebate - userRebate;
					//商户投注返点
					var BetRebat = data.Data.BetRebate;
					if(temp < minRebate){
						hcp_defaultBetRebate = minRebate;
					}else{
						hcp_defaultBetRebate = temp ;
					}
					if(BetRebat < hcp_defaultBetRebate){
						hcp_defaultBetRebate = BetRebat;
					}
				}
			}
			callback();
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		}else{
		    toastUtils.showToast(data.Msg);
		}
	},null);
	
	//@独立需求，在投注页显示余额，与单挑单期无关，为了统一调用和修改而放置于此
	//定时刷新投注页，（秒秒彩）出票页，追号页余额。
	hcp_showBalance();
	setIntervalMoney = setInterval(function () {
		hcp_showBalance();
	},10000);
}

//@ 给赔率列表赋值
function initLossPercent(lotteryName) {
	if (!hcp_defaultBetRebate){
		hcp_defaultBetRebate = Number(maxRebate);
	}
	for(var i = Number(minRebate); i <= Number(hcp_defaultBetRebate); i += Number(xRebate)){
//		var value = bigNumberUtil.divided(i,1000);
		var value = i;
		if (i == Number(hcp_defaultBetRebate)) {
			$("#"+lotteryName+"_lossPercent").append('<option value=' + value + ' selected="selected">' + value + '</option>');
		}else{
			$("#"+lotteryName+"_lossPercent").append('<option value=' + value + '>' + value + '</option>');
		}
	}
	
	//记住投注返点
	var playFanDian = localStorageUtils.getParam("playFanDian");
	if (playFanDian){
		$("#"+lotteryName+"_lossPercent").val(playFanDian);
	}
}

//@ 创建红球布局模型
function hcp_createLayoutHtml(){
	/**
	 * [layoutParams description]
	 * isBlueBall 是否是蓝球
	 * text 文字描述
	 * divId div内容ID标识
	 * ball_start 选球起始号码
	 * ball_end 选球结束位置
	 * isAddZero 是否补0
	 * maxBallsNum 所能选择最大球个数
	 * selectBallsArray 存放所选择的球数组
	 * @type {Object}
	 */
	var layoutParams = {
		"shortcut":true,
		"divId":"",
		"isBlueBall":false,
		"text":"",
		"ball_start":0,
		"ball_end":0,
		"isAddZero":false,
		"maxBallsNum":0,
		"lottery_playType":"",
		"playCode":""
	}

	function setLayoutParams(params){
		$.each(params,function(k,v){
			layoutParams[k] = v;
		});
	}

	function getLayoutParams(){
		return layoutParams;
	}

	function setLayoutParam(key,value){
		layoutParams[key] = value;
	}

	function getLayoutParam(key){
		return layoutParams[key];
	}

	function create(params,clickBallCallBack){
		setLayoutParams(params);
		var lottery_play = getLayoutParam("lottery_playType").split("_");
		var ballColor = getLayoutParam("isBlueBall") ? "hcp_redBalls" : "hcp_redBalls";
		var $betContent = $('<div class="hcp_ballView ' + ballColor + '"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		//0~9选号
		var $ballUl = $('<ul id="'+getLayoutParam("lottery_playType")+'"></ul>');
		for (var i = getLayoutParam("ball_start"); i <= getLayoutParam("ball_end"); i++) {
			var $ballLi = $('<li></li>');
			var realNumber;
			if (i < 10) {
				realNumber = getLayoutParam("isAddZero") ? "0"+i : i ;
			}else{
				realNumber = i;
			}
			
			if(lottery_play[0] == "hcpEsf" || lottery_play[0] == "hcpKlb" || lottery_play[0] == "hcpXync"){//11选5  快乐8   快乐十分 特殊处理；
				var index = i;
				index -=1;
				var $ballSpan = $('<span id="'+ current_LottreyId + getLayoutParam("playCode")[index]+ '" class="'+ballColor+'">'+ realNumber +'</span>');
				var rebate = hcp_lottery_rebate[Number(getLayoutParam("playCode")[index])-1].AwardLevelInfo[0].AwardAmount;
				var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
				var $ballRebate = $('<p><span id="'+ 'Odds_' + getLayoutParam("playCode")[index]+'" title="'+rebate+'">'+ show_value +'</span></p>');
			}else if(lottery_play[0] == "hcpPks"){  //pk10  特殊处理
				if(getLayoutParam("playCode").length > 10){//冠亚和值 3~19
					var index = i;
					index -=3;
					var $ballSpan = $('<span id="'+ current_LottreyId + getLayoutParam("playCode")[index]+ '" class="'+ballColor+'">'+ realNumber +'</span>');
					var rebate = hcp_lottery_rebate[Number(getLayoutParam("playCode")[index])-1].AwardLevelInfo[0].AwardAmount;
					var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
					//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
					var $ballRebate = $('<p><span id="'+ 'Odds_' + getLayoutParam("playCode")[index]+'" title="'+rebate+'">'+ show_value +'</span></p>');
				}else{//第一到第十名  1~10
					var index = i;
					index -=1;
					var $ballSpan = $('<span id="'+ current_LottreyId + getLayoutParam("playCode")[index]+ '" class="'+ballColor+'">'+ realNumber +'</span>');
					var rebate = hcp_lottery_rebate[Number(getLayoutParam("playCode")[index])-1].AwardLevelInfo[0].AwardAmount;
					var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
					//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
					var $ballRebate = $('<p><span id="'+ 'Odds_' + getLayoutParam("playCode")[index]+'" title="'+rebate+'">'+ show_value +'</span></p>');
				}
				
			}else{
				var $ballSpan = $('<span id="'+ current_LottreyId + getLayoutParam("playCode")[i]+ '" class="'+ballColor+'">'+ realNumber +'</span>');
				var rebate = hcp_lottery_rebate[Number(getLayoutParam("playCode")[i])-1].AwardLevelInfo[0].AwardAmount;
				var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				var $ballRebate = $('<p><span id="'+ 'Odds_' + getLayoutParam("playCode")[i]+'" title="'+rebate+'">'+ show_value +'</span></p>');
			}
			$ballLi.append($ballSpan);
			$ballLi.append($ballRebate);
			$ballUl.append($ballLi);
			$ballSpan.on('click',function(event){
				var array = hcp_LotteryStorage[lottery_play[0]][lottery_play[1]];
				$(this).toggleClass(ballColor + "_active");
				if ($(this).hasClass(ballColor + "_active")) {
					var str = $(this).html() + "_" + $(this).context.id +'_'+ this.nextSibling.textContent;
					array.push(str);
				}else{
					var str = $(this).html() + "_" + $(this).context.id +'_'+ this.nextSibling.textContent;
					array.splice($.inArray(str,array),1);
				}
				hcp_LotteryStorage[lottery_play[0]][lottery_play[1]] = array;
				clickBallCallBack($(this));
			});
		}
		$betContent.append($ballUl);
		//大小单双
		if(getLayoutParam("shortcut")){
			var arr = ["大","小","单","双"];
			var $propertyUl = $('<ul class="hcp_rectangle_num4"></ul>');
			for (var i = 0; i < arr.length; i++) {
				var $propertyLi = $('<li></li>');
				realNumber = arr[i];
				var ballColor_a = "hcp_redBalls_property";
				var $propertySpan = $('<span id="'+ current_LottreyId + getLayoutParam("playCode")[i+10]+'" class="'+ballColor_a+'">'+ realNumber +'</span>');
				var rebate = hcp_lottery_rebate[Number(getLayoutParam("playCode")[i+10])-1].AwardLevelInfo[0].AwardAmount;
				var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				var $ballRebate = $('<p><span id="'+ 'Odds_' + getLayoutParam("playCode")[i+10]+'" title="'+rebate+'">'+ show_value +'</span></p>');
				$propertyLi.append($propertySpan);
				$propertyLi.append($ballRebate);
				$propertyUl.append($propertyLi);
				$propertySpan.on('click',function(event){
					var array = hcp_LotteryStorage[lottery_play[0]][lottery_play[1]];
					$(this).toggleClass(ballColor_a + "_active");
					if ($(this).hasClass(ballColor_a + "_active")) {
					    var str = $(this).html() + "_" + $(this).context.id +'_'+ this.nextSibling.textContent;
						array.push(str);
					}else{
						var str = $(this).html() + "_" + $(this).context.id +'_'+ this.nextSibling.textContent;
						array.splice($.inArray(str,array),1);
					}
					hcp_LotteryStorage[lottery_play[0]][lottery_play[1]] = array;
					clickBallCallBack($(this));
				});
			}
			$betContent.append($propertyUl);
		}
		$("#" + getLayoutParam("divId")).append($betContent);
	}

	return {setLayoutParams:setLayoutParams,
			getLayoutParams:getLayoutParams,
			setLayoutParam:setLayoutParam,
			getLayoutParam:getLayoutParam,
			create:create
	};
}


//@ 创建非数字类布局模型
function hcp_createNonNumHtml(){
	var layoutParams = {
		"divId":"",
		"text":"",
		"num":[],
		"lottery_playType":"",
		"playType":"",
		"playCode":"",
		"ulClass":""
	};

	function setLayoutParams(params){
		$.each(params,function(k,v){
			layoutParams[k] = v;
		});
	}

	function getLayoutParams(){
		return layoutParams;
	}

	function setLayoutParam(key,value){
		layoutParams[key] = value;
	}

	function getLayoutParam(key){
		return layoutParams[key];
	}

	function create(params,clickBallCallBack){
		setLayoutParams(params);
		var lottery_play = getLayoutParam("lottery_playType").split("_");
		var ballColor = "hcp_redBalls_property";
		var $betContent = $('<div class="hcp_ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul class="'+ params.ulClass +'"></ul>');
		for (var i = 0; i < getLayoutParam("num").length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = $('<span id="'+ current_LottreyId + getLayoutParam("playCode")[i]+ '" class="'+ballColor+'">'+ getLayoutParam("num")[i] +'</span>');
			var rebate = hcp_lottery_rebate[Number(getLayoutParam("playCode")[i])-1].AwardLevelInfo[0].AwardAmount;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var $ballRebate = $('<p><span id="'+ 'Odds_' + getLayoutParam("playCode")[i]+'" title="'+rebate+'">'+ show_value +'</span></p>');
			$ballLi.append($ballSpan);
			$ballLi.append($ballRebate);
			$ballUl.append($ballLi);
			$ballSpan.on('click',function(event){
				var array = hcp_LotteryStorage[lottery_play[0]][lottery_play[1]];
				$(this).toggleClass(ballColor + "_active");
				if ($(this).hasClass(ballColor + "_active")) {
				    var str = $(this).html() + "_" + $(this).context.id +'_'+ this.nextSibling.textContent;
					array.push(str);
				}else{
					var str = $(this).html() + "_" + $(this).context.id +'_'+ this.nextSibling.textContent;
					array.splice($.inArray(str,array),1);
				}
				hcp_LotteryStorage[lottery_play[0]][lottery_play[1]] = array;
				clickBallCallBack($(this));
			});
		}
		$betContent.append($ballUl);
		$("#" + getLayoutParam("divId")).append($betContent);
	}

	return {setLayoutParams:setLayoutParams,
		getLayoutParams:getLayoutParams,
		setLayoutParam:setLayoutParam,
		getLayoutParam:getLayoutParam,
		create:create
	};
}

//@ 创建龙虎斗布局模型(龙虎和)
var hcp_createLongHuModel = {
	create :function(params,clickBallCallBack){
		var lottery_play = params.lottery_playType.split("_");
		var ballColor = "hcp_redBalls_property";
		var $betContent = $('<div class="hcp_ballView"></div>');
		$betContent.addClass(params.divClass);
		$betContent.append('<h3 class="orange">' + params.text + '</h3>');
		var $ballUl = $('<ul class="'+ params.ulClass +'"></ul>');
		for (var i = 0; i < params.num.length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = $('<span id="'+ current_LottreyId + params.play_code[i]+ '" class="'+ballColor+'">'+ params.num[i] +'</span>');
			var rebate = hcp_lottery_rebate[Number(params.play_code[i])-1].AwardLevelInfo[0].AwardAmount;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var $ballRebate = $('<p><span id="'+ 'Odds_' + params.play_code[i]+'" title="'+rebate+'">'+ show_value +'</span></p>');
			$ballLi.append($ballSpan);
			$ballLi.append($ballRebate);
			$ballUl.append($ballLi);
			$ballSpan.on('click',function(event){
				var array = hcp_LotteryStorage[lottery_play[0]][lottery_play[1]];
				$(this).toggleClass(ballColor + "_active");
				if ($(this).hasClass(ballColor + "_active")) {
				    var str = $(this).html() + "_" + $(this).context.id +'_'+ this.nextSibling.textContent;
					array.push(str);
				}else{
					var str = $(this).html() + "_" + $(this).context.id +'_'+ this.nextSibling.textContent;
					array.splice($.inArray(str,array),1);
				}
				hcp_LotteryStorage[lottery_play[0]][lottery_play[1]] = array;
				clickBallCallBack($(this));
			});
		}
		$betContent.append($ballUl);
		$("#" + params.divId).append($betContent);
	}
};

/**
 * 创建   时时彩--整合玩法  布局]
 */
function hcp_createFiveLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	if(current_LottreyId == 557){  //腾讯分分彩-557（ 去掉  "第一球）
		//创建第2~5球
		for(var i= 2;i<6;i++){
			var play_code = hcp_playCode_ssc[i].play_code;
			var wanRedBallLayout = new hcp_createLayoutHtml();
			var playType_line = lotteryName+ "_line" + i;
			var nameArr = ["第一球","第二球","第三球","第四球","第五球"];
			var wanParams = {
				"shortcut":true,
				"divId":lotteryName+"_ballView",
				"isBlueBall":false,
				"text":nameArr[i-1],
				"ball_start":0,
				"ball_end":9,
				"isAddZero":false,
				"maxBallsNum":10,
				"lottery_playType":playType_line,
				"playCode":play_code
			};
		
			wanRedBallLayout.create(wanParams,function(clickedBall){
				localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
				//计算注数
				calcNotes();
			});
		}
	}else{
		//创建第1~5球
		for(var i= 1;i<6;i++){
			var play_code = hcp_playCode_ssc[i].play_code;
			var wanRedBallLayout = new hcp_createLayoutHtml();
			var playType_line = lotteryName+ "_line" + i;
			var nameArr = ["第一球","第二球","第三球","第四球","第五球"];
			var wanParams = {
				"shortcut":true,
				"divId":lotteryName+"_ballView",
				"isBlueBall":false,
				"text":nameArr[i-1],
				"ball_start":0,
				"ball_end":9,
				"isAddZero":false,
				"maxBallsNum":10,
				"lottery_playType":playType_line,
				"playCode":play_code
			};
		
			wanRedBallLayout.create(wanParams,function(clickedBall){
				localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
				//计算注数
				calcNotes();
			});
		}
	}
	
	if(current_LottreyId != 557){  //腾讯分分彩-557（ 去掉    总和-大小单双）
		//创建 总和
		var play_code = hcp_playCode_ssc[6].play_code;
		var geRedBallLayout = new hcp_createNonNumHtml();
		var playType_line6 = lotteryName+"_line6";
		var numArray = ["大","小","单","双"];
		var geParams = {
			"divId":lotteryName+"_ballView",
			"text":"总和",
			"num":numArray,
			"lottery_playType":playType_line6,
			"playType":0,
			"playCode":play_code,
			"ulClass":"hcp_rectangle_num4"
		};
		geRedBallLayout.create(geParams,function(clickedBall){
			localStorageUtils.setParam(playType_line6, hcp_LotteryStorage[lotteryName]["line6"]);
			//计算注数
			calcNotes();
		});
	}
	
	
	if(current_LottreyId == 557){  //腾讯分分彩-557（ 去掉   前三）
		//创建  特殊玩法
		for(var i= 8;i<10;i++){
			var play_code = hcp_playCode_ssc[i].play_code;
			var geRedBallLayout = new hcp_createNonNumHtml();
			var playType_line = lotteryName+ "_line" + i;
			var nameArr = ["前三","中三","后三"];
			var numArray = ["豹子","顺子","对子","杂六","半顺"];
			var geParams = {
				"divId":lotteryName+"_ballView",
				"text":nameArr[i-7],
				"num":numArray,
				"lottery_playType":playType_line,
				"playType":0,
				"playCode":play_code,
				"ulClass":"hcp_rectangle_num5"
			}
			geRedBallLayout.create(geParams,function(clickedBall){
				localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
				//计算注数
				calcNotes();
			});
		}
	}else{
		//创建  特殊玩法
		for(var i= 7;i<10;i++){
			var play_code = hcp_playCode_ssc[i].play_code;
			var geRedBallLayout = new hcp_createNonNumHtml();
			var playType_line = lotteryName+ "_line" + i;
			var nameArr = ["前三","中三","后三"];
			var numArray = ["豹子","顺子","对子","杂六","半顺"];
			var geParams = {
				"divId":lotteryName+"_ballView",
				"text":nameArr[i-7],
				"num":numArray,
				"lottery_playType":playType_line,
				"playType":0,
				"playCode":play_code,
				"ulClass":"hcp_rectangle_num5"
			}
			geRedBallLayout.create(geParams,function(clickedBall){
				localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
				//计算注数
				calcNotes();
			});
		}
	}
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 *  创建   时时彩--全5中1玩法    布局
 */
function hcp_createOneLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建第一球
	var play_code = hcp_playCode_ssc[11].play_code;
	var wanRedBallLayout = new hcp_createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"",
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line1,
		"playCode":play_code
	};
	wanRedBallLayout.create(wanParams,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	//创建倍率
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建   时时彩--龙虎斗    布局]
 */
//function hcp_createLongHuLayout(lotteryName, playType, title, num, calcNotes) {
function hcp_createLongHuLayout(lotteryName,calcNotes) {
	$("#"+lotteryName+"_ballView").empty();
	
	if(current_LottreyId == 557){  //腾讯分分彩-557（ 去掉   "万千 1vs2","万百 1vs3","万十 1vs4","万个 1vs5",）
		//创建布局
		var title = ["万千 1vs2","万百 1vs3","万十 1vs4","万个 1vs5","千百 2vs3","千十 2vs4","千个 2vs5","百十 3vs4","百个 3vs5","十个 4vs5"];
		var num = ["龙","虎","和"];
		var play_code = hcp_playCode_ssc[10].play_code;
		var playType_line = lotteryName+ "_line" + i;
		for (var i = 4; i< title.length; i++){
			var playType_line = lotteryName +"_line"+ (i+1);
			var geRedBallLayout = new hcp_createNonNumHtml();
			var _playcode = play_code.slice(i*num.length,(i*num.length+num.length));
			var params = {
				"divId":lotteryName+"_ballView",
				"text":title[i],
				"num":num,
				"lottery_playType":playType_line,
	//			"playType":playType,
				"ulClass":"hcp_longHu",
				"divClass":"longHu_group",
				"play_code":_playcode
			};
			hcp_createLongHuModel.create(params,function(clickedBall){
				localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+(i+1)]);
				//计算注数
				calcNotes();
			});
		}
	}else{
		//创建布局
		var title = ["万千 1vs2","万百 1vs3","万十 1vs4","万个 1vs5","千百 2vs3","千十 2vs4","千个 2vs5","百十 3vs4","百个 3vs5","十个 4vs5"];
		var num = ["龙","虎","和"];
		var play_code = hcp_playCode_ssc[10].play_code;
		var playType_line = lotteryName+ "_line" + i;
		for (var i = 0; i< title.length; i++){
			var playType_line = lotteryName +"_line"+ (i+1);
			var geRedBallLayout = new hcp_createNonNumHtml();
			var _playcode = play_code.slice(i*num.length,(i*num.length+num.length));
			var params = {
				"divId":lotteryName+"_ballView",
				"text":title[i],
				"num":num,
				"lottery_playType":playType_line,
	//			"playType":playType,
				"ulClass":"hcp_longHu",
				"divClass":"longHu_group",
				"play_code":_playcode
			};
			hcp_createLongHuModel.create(params,function(clickedBall){
				localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+(i+1)]);
				//计算注数
				calcNotes();
			});
		}
	}
	
	//创建赔率
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  11选5--两面盘 玩法  布局]
 */
function hcpEsf_createFiveLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	for(var i= 1;i<6;i++){
		//创建第一球
		var play_code = hcp_playCode_esf[i].play_code;
		var geRedBallLayout = new hcp_createNonNumHtml();
		var playType_line = lotteryName+"_line"+i;
		var numArray = ["大","小","单","双"];
		var nameArr = ["第一球","第二球","第三球","第四球","第五球"];
		var geParams = {
			"divId":lotteryName+"_ballView",
			"text":nameArr[i-1],
			"num":numArray,
			"lottery_playType":playType_line,
			"playType":0,
			"playCode":play_code,
			"ulClass":"hcp_rectangle_num4"
		};
		geRedBallLayout.create(geParams,function(clickedBall){
			localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
			//计算注数
			calcNotes();
		});
	}
	
	//创建 总和
	var play_code = hcp_playCode_esf[0].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line6 = lotteryName+"_line6";
	var numArray = ["大","小","单","双","尾大","尾小"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"总和",
		"num":numArray,
		"lottery_playType":playType_line6,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num6"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line6, hcp_LotteryStorage[lotteryName]["line6"]);
		//计算注数
		calcNotes();
	});
	
	//创建 上下盘
	var play_code = hcp_playCode_esf[13].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line7 = lotteryName+"_line7";
	var numArray = ["上","下","和"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"上下盘",
		"num":numArray,
		"lottery_playType":playType_line7,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num7"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line7, hcp_LotteryStorage[lotteryName]["line7"]);
		//计算注数
		calcNotes();
	});
	
	//创建 奇偶盘
	var play_code = hcp_playCode_esf[14].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line8 = lotteryName+"_line8";
	var numArray = ["奇","偶","和"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"奇偶盘",
		"num":numArray,
		"lottery_playType":playType_line8,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num8"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line8, hcp_LotteryStorage[lotteryName]["line8"]);
		//计算注数
		calcNotes();
	});

	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}
/**
 * 创建  11选5--单号 玩法  布局]
 */
function hcpEsf_createFiveLineSingleNumLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	//创建第1~5球
	for(var i=1;i<6;i++){
		var play_code = hcp_playCode_esf[i+5].play_code;
		var wanRedBallLayout = new hcp_createLayoutHtml();
		var playType_line = lotteryName+"_line"+i;
		var nameArr = ["第一球","第二球","第三球","第四球","第五球"];
		var wanParams = {
			"shortcut":false,
			"divId":lotteryName+"_ballView",
			"isBlueBall":false,
			"text":nameArr[i-1],
			"ball_start":1,
			"ball_end":11,
			"isAddZero":false,
			"maxBallsNum":11,
			"lottery_playType":playType_line,
			"playCode":play_code
		};
		wanRedBallLayout.create(wanParams,function(clickedBall){
			localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
			//计算注数
			calcNotes();
		});
	}
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}
/**
 * 创建  11选5--龙虎斗  玩法  布局]
 */
function hcpEsf_LonghudouLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建布局
	var title = ["1vs2","1vs3","1vs4","1vs5","2vs3","2vs4","2vs5","3vs4","3vs5","4vs5"];
	var num = ["龙","虎"];
	var play_code = hcp_playCode_esf[11].play_code;
	for (var i = 0; i< title.length; i++){
		var playType_line = lotteryName +"_line"+ (i+1);
		var _playcode = play_code.slice(i*num.length,(i*num.length+num.length));
		var params = {
			"divId":lotteryName+"_ballView",
			"text":title[i],
			"num":num,
			"lottery_playType":playType_line,
			"ulClass":"hcpesf_longHu",
			"divClass":"esf_longHu_group",
			"play_code":_playcode
		};
		hcp_createLongHuModel.create(params,function(clickedBall){
			localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+(i+1)]);
			//计算注数
			calcNotes();
		});
	}
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  11选5--全5中1  玩法  布局]
 */
function hcpEsf_OneLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建 第一球VS第二球
	var play_code = hcp_playCode_esf[12].play_code;
	var wanRedBallLayout = new hcp_createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
//		"text":"第一球VS第二球",
		"text":"",
		"ball_start":1,
		"ball_end":11,
		"isAddZero":false,
		"maxBallsNum":11,
		"lottery_playType":playType_line1,
		"playCode":play_code
	};
	wanRedBallLayout.create(wanParams,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  快乐8--总和比数五行  玩法  布局]
 */
function hcpKlb_createFourLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建 总和
	var play_code = hcp_playCode_klb[0].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line1 = lotteryName+"_line1";
	var numArray = ["大","小","单","双"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"总和",
		"num":numArray,
		"lottery_playType":playType_line1,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num4"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	
	//创建 总和
	var play_code = hcp_playCode_klb[1].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line2 = lotteryName+"_line2";
	var numArray = ["810","大单","大双","小单","小双"];
	var geParams = {
		"divId":lotteryName+"_ballView",
//		"text":"总和",
		"num":numArray,
		"lottery_playType":playType_line2,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num5"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line2, hcp_LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});
	
	//创建  前后和
	var play_code = hcp_playCode_klb[2].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line3 = lotteryName+"_line3";
	var numArray = ["前多","后多","前后和"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"前后和",
		"num":numArray,
		"lottery_playType":playType_line3,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num3"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line3, hcp_LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});
	
	//创建  单双和
	var play_code = hcp_playCode_klb[3].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line4 = lotteryName+"_line4";
	var numArray = ["单多","双多","单双和"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"单双和",
		"num":numArray,
		"lottery_playType":playType_line4,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num3"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line4, hcp_LotteryStorage[lotteryName]["line4"]);
		//计算注数
		calcNotes();
	});
	
	//创建 五行
	var play_code = hcp_playCode_klb[4].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line5 = lotteryName+"_line5";
	var numArray = ["金","木","水","火","土"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"五行",
		"num":numArray,
		"lottery_playType":playType_line5,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num5"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line5, hcp_LotteryStorage[lotteryName]["line5"]);
		//计算注数
		calcNotes();
	});
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}
/**
 * 创建  快乐8--正码  玩法  布局
 */
function hcpKlb_createOneLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建第一球
	var play_code = hcp_playCode_klb[5].play_code;
	var wanRedBallLayout = new hcp_createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
//		"text":"第一球",
		"text":"",
		"ball_start":1,
		"ball_end":80,
		"isAddZero":false,
		"maxBallsNum":80,
		"lottery_playType":playType_line1,
		"playCode":play_code
	};
	wanRedBallLayout.create(wanParams,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建 快三 - 大小骰宝  玩法布局
 */
function hcpKs_createFiveLineLayout(lotteryName,calcNotes) {
	$("#"+lotteryName+"_ballView").empty();
	//创建第一行  三军、大小
	var play_code = hcp_playCode_ks[0].play_code;
	var playType_line1 = lotteryName+"_line1";
	var geRedBallLayout = new hcp_createNonNumHtml();
	var numArray1 = ["1","2","3","4","5","6","大","小"];
	var params = {
		"divId":lotteryName+"_ballView",
		"text":"三军、大小",
		"num":numArray1,
		"lottery_playType":playType_line1,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num4"
	};
	geRedBallLayout.create(params,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	//创建第二行    围骰、全骰 
	var play_code = hcp_playCode_ks[1].play_code;
	var playType_line2 = lotteryName+"_line2";
	var geRedBallLayout = new hcp_createNonNumHtml();
	var numArray2 = ["1","2","3","4","5","6","全骰"];
	var params = {
		"divId":lotteryName+"_ballView",
		"text":"围骰、全骰",
		"num":numArray2,
		"lottery_playType":playType_line2,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num4"
	};
	geRedBallLayout.create(params,function(clickedBall){
		localStorageUtils.setParam(playType_line2, hcp_LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});
	//创建第三行   点数
	var play_code = hcp_playCode_ks[2].play_code;
	var playType_line3 = lotteryName+"_line3";
	var geRedBallLayout = new hcp_createNonNumHtml();
	var numArray3 = ["4点","5点","6点","7点","8点","9点","10点","11点","12点","13点","14点","15点","16点","17点"];
	var params = {
		"divId":lotteryName+"_ballView",
		"text":"点数",
		"num":numArray3,
		"lottery_playType":playType_line3,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num5"
	};
	geRedBallLayout.create(params,function(clickedBall){
		localStorageUtils.setParam(playType_line3, hcp_LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});
	//创建第四行  长牌
	var play_code = hcp_playCode_ks[3].play_code;
	var playType_line4 = lotteryName+"_line4";
	var geRedBallLayout = new hcp_createNonNumHtml();
	var numArray4 = ["1-2","1-3","1-4","1-5","1-6",
					 "2-3","2-4","2-5","2-6",
					 "3-4","3-5","3-6",
					 "4-5","4-6",
					 "5-6"];
	var params = {
		"divId":lotteryName+"_ballView",
		"text":"长牌",
		"num":numArray4,
		"lottery_playType":playType_line4,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num5"
	};
	geRedBallLayout.create(params,function(clickedBall){
		localStorageUtils.setParam(playType_line4, hcp_LotteryStorage[lotteryName]["line4"]);
		//计算注数
		calcNotes();
	});
	//创建第五行  短牌
	var play_code = hcp_playCode_ks[4].play_code;
	var playType_line5 = lotteryName+"_line5";
	var geRedBallLayout = new hcp_createNonNumHtml();
	var numArray5 = ["1-1","2-2","3-3","4-4","5-5","6-6"];
	var params = {
		"divId":lotteryName+"_ballView",
		"text":"短牌",
		"num":numArray5,
		"lottery_playType":playType_line5,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num6"
	};
	geRedBallLayout.create(params,function(clickedBall){
		localStorageUtils.setParam(playType_line5, hcp_LotteryStorage[lotteryName]["line5"]);
		//计算注数
		calcNotes();
	});

	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  PK10--整合  玩法  布局]
 */
function hcpPks_createTwelveLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	for(var i=1;i<12;i++){
		var play_code = hcp_playCode_pks[i-1].play_code;
		var geRedBallLayout = new hcp_createNonNumHtml();
		var playType_line = lotteryName+"_line"+i;
		var numArray = ["大","小","单","双"];
		var nameArr = ["冠亚和值","冠军","亚军","第三名","第四名","第五名","第六名","第七名","第八名","第九名","第十名"];
		var geParams = {
			"divId":lotteryName+"_ballView",
			"text":nameArr[i-1],
			"num":numArray,
			"lottery_playType":playType_line,
			"playType":0,
			"playCode":play_code,
			"ulClass":"hcp_rectangle_num4"
		};
		geRedBallLayout.create(geParams,function(clickedBall){
			localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
			//计算注数
			calcNotes();
		});
	}
	
	//创建 VS
	var play_code = hcp_playCode_pks[11].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line12 = lotteryName+"_line12";
	var numArray = ["1V10龙","2V9龙","3V8龙","4V7龙","5V6龙","1V10虎","2V9虎","3V8虎","4V7虎","5V6虎"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"VS",
		"num":numArray,
		"lottery_playType":playType_line12,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num4"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line12, hcp_LotteryStorage[lotteryName]["line12"]);
		//计算注数
		calcNotes();
	});
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  PK10--第1~10名   玩法  布局]
 */
function hcpPks_createTenLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	for(var i=1;i<11;i++){
		var play_code = hcp_playCode_pks[i+11].play_code;
		var wanRedBallLayout = new hcp_createLayoutHtml();
		var playType_line = lotteryName+"_line"+i;
		var nameArr = ["冠军","亚军","第三名","第四名","第五名","第六名","第七名","第八名","第九名","第十名"];
		var wanParams = {
			"shortcut":false,
			"divId":lotteryName+"_ballView",
			"isBlueBall":false,
			"text":nameArr[i-1],
			"ball_start":1,
			"ball_end":10,
			"isAddZero":false,
			"maxBallsNum":10,
			"lottery_playType":playType_line,
			"playCode":play_code
		};
		wanRedBallLayout.create(wanParams,function(clickedBall){
			localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
			//计算注数
			calcNotes();
		});
	}
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  PK10--冠亚和值   玩法  布局]
 */
function hcpPks_createCrownValueLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	//创建 总和
	var play_code = hcp_playCode_pks[22].play_code;
	var wanRedBallLayout = new hcp_createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"和值",
		"ball_start":3,
		"ball_end":19,
		"isAddZero":false,
		"maxBallsNum":17,
		"lottery_playType":playType_line1,
		"playCode":play_code
	};
	wanRedBallLayout.create(wanParams,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  PK10--冠亚和值   玩法  布局]
 */
function hcpPks_createCrownCombinationLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();

	//创建 冠亚组合  
	var play_code = hcp_playCode_pks[23].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line1 = lotteryName+"_line1";
	var numArray = ["1-2","1-3","1-4","1-5","1-6","1-7","1-8","1-9","1-10",
					"2-3","2-4","2-5","2-6","2-7","2-8","2-9","2-10",
					"3-4","3-5","3-6","3-7","3-8","3-9","3-10",
					"4-5","4-6","4-7","4-8","4-9","4-10",
					"5-6","5-7","5-8","5-9","5-10",
					"6-7","6-8","6-9","6-10",
					"7-8","7-9","7-10",
					"8-9","8-10",
					"9-10",
	];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"组合",
		"num":numArray,
		"lottery_playType":playType_line1,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num5"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  快乐十分 --两面盘 玩法  布局]
 */
function hcpXync_createFiveLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建 总和
	var play_code = hcp_playCode_xync[0].play_code;
	var geRedBallLayout = new hcp_createNonNumHtml();
	var playType_line1 = lotteryName+"_line1";
	var numArray = ["大","小","单","双","尾大","尾小"];
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"总和",
		"num":numArray,
		"lottery_playType":playType_line1,
		"playType":0,
		"playCode":play_code,
		"ulClass":"hcp_rectangle_num6"
	};
	geRedBallLayout.create(geParams,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	
	for(var i=1;i<9;i++){
		var play_code = hcp_playCode_xync[i].play_code;
		var geRedBallLayout = new hcp_createNonNumHtml();
		var playType_line = lotteryName+"_line" +(i+1);
		var numArray = ["大","小","单","双","尾大","尾小","合单","合双"];
		var nameArr = ["第一球","第二球","第三球","第四球","第五球","第六球","第七球","第八球",];
		var geParams = {
			"divId":lotteryName+"_ballView",
			"text":nameArr[i-1],
			"num":numArray,
			"lottery_playType":playType_line,
			"playType":0,
			"playCode":play_code,
			"ulClass":"hcp_rectangle_num4"
		};
		geRedBallLayout.create(geParams,function(clickedBall){
			localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line" +(i+1)]);
			//计算注数
			calcNotes();
		});
	}
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  快乐十分--单号 玩法  布局]
 */
function hcpXync_createFiveLineSingleNumLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	//创建第1~8球
	for(var i=1;i<9;i++){
		//创建第一球
		var play_code = hcp_playCode_xync[i+8].play_code;
		var wanRedBallLayout = new hcp_createLayoutHtml();
		var playType_line = lotteryName+"_line"+i;
		var nameArr = ["第一球","第二球","第三球","第四球","第五球","第六球","第七球","第八球",];
		var wanParams = {
			"shortcut":false,
			"divId":lotteryName+"_ballView",
			"isBlueBall":false,
			"text":nameArr[i-1],
			"ball_start":1,
			"ball_end":20,
			"isAddZero":false,
			"maxBallsNum":20,
			"lottery_playType":playType_line,
			"playCode":play_code
		};
		wanRedBallLayout.create(wanParams,function(clickedBall){
			localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+i]);
			//计算注数
			calcNotes();
		});
	}
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  快乐十分--龙虎斗  玩法  布局]
 */
function hcpXync_LonghudouLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建布局
	var title = ["1vs2","1vs3","1vs4","1vs5","1vs6","1vs7","1vs8","2vs3","2vs4","2vs5","2vs6","2vs7","2vs8","3vs4","3vs5","3vs6","3vs7","3vs8","4vs5","4vs6","4vs7","4vs8","5vs6","5vs7","5vs8","6vs7","6vs8","7vs8"];
	var num = ["龙","虎"];
	var play_code = hcp_playCode_xync[17].play_code;
	for (var i = 0; i< title.length; i++){
		var playType_line = lotteryName +"_line"+ (i+1);
		var _playcode = play_code.slice(i*num.length,(i*num.length+num.length));
		var params = {
			"divId":lotteryName+"_ballView",
			"text":title[i],
			"num":num,
			"lottery_playType":playType_line,
			"ulClass":"hcpesf_longHu",
			"divClass":"esf_longHu_group",
			"play_code":_playcode
		};
		hcp_createLongHuModel.create(params,function(clickedBall){
			localStorageUtils.setParam(playType_line, hcp_LotteryStorage[lotteryName]["line"+(i+1)]);
			//计算注数
			calcNotes();
		});
	}
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}

/**
 * 创建  快乐十分--全8中1  玩法  布局]
 */
function hcpXync_OneLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建 第一球VS第二球
	var play_code = hcp_playCode_xync[18].play_code;
	var wanRedBallLayout = new hcp_createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"",
//		"text":"第一球VS第二球",
		"ball_start":1,
		"ball_end":20,
		"isAddZero":false,
		"maxBallsNum":20,
		"lottery_playType":playType_line1,
		"playCode":play_code
	};
	wanRedBallLayout.create(wanParams,function(clickedBall){
		localStorageUtils.setParam(playType_line1, hcp_LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	
	//创建赔率下拉选项框
	hcp_createLossPercent(lotteryName);
}


//在投注页显示彩种余额
function hcp_showBalance(){
	var lotteryMoney = 0;
	ajaxUtil.ajaxByAsyncPost_mute(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}',function(data){
		if(data.Code == 200){
		    lotteryMoney = data.Data.lotteryMoney;
		}else{
			lotteryMoney = 0;
		    toastUtils.showToast(data.Msg);
		}
		var lotteryBalance = "余额：" + lotteryMoney + " 元";
		if($(".show-balance")){
			$(".show-balance").remove();
		}
		$("div.timeFC").after('<p class="show-balance">'+ lotteryBalance +'</p>');

		localStorageUtils.setParam("lotteryMoney",lotteryMoney);
	},null);
}