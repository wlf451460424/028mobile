/* 
* @Author: Administrator
* @Date:   2015-01-12 16:13:07
* @Last Modified by:   liuxin
* @Last Modified time: 2016-02-27 12:24:32
* @Last Modified time: 2015-01-27 19:39:23
* @Last Modified time: 2015-01-22 14:12:50
*/
//出票界面的记录数据以符号分隔
var SEPARATOR = "@";
var checkoutResult=[];
//记录最近一次的投注信息
var currentTouzhuInfo=[];
/**
 *彩票界面点击提交按钮，传递给 checkOutTicket.html界面的参数对象
 */
function LotterySubmitParams() {
    this.lotteryType;//彩票ID
    this.playType;//玩法名称
    this.playMethod;//玩法投注类型，如组合
    this.playTypeIndex;//玩法下标
    this.playMethodIndex;//玩法类型下标
    this.nums;//选的号码        Type:String
    this.notes;//注数     Type:Number
	this.sntuo;//0：复式  1：胆拖   2：组合  3：单式
    this.content;
	this.multiple;//倍数
	this.rebates;//返点
	this.playMode;//返点模式
	this.money;//金额
	this.award;//奖金
	this.maxAward;// 最大奖金
    //设置参数后，调用此方法，自动将该对象转化成json字串
    this.toString = function() {
        return JSON.stringify(this);
    };
    //设置参数，调用此方法传递参数，并自动跳转到checkOutTicket.html界面
    this.submit = function() {
		//负责存储投注记录
        var resultList = [];
		/**将彩种界面的提交数据存储在本地**/
      if(localStorageUtils.getParam("resultList_checkout") == null){
	            //清空投注列表的数据
	             localStorageUtils.removeParam("resultList_checkout");
	     } else {
		     if(this.lotteryType != currentTouzhuInfo.lotteryType) {
		       	  localStorageUtils.removeParam("resultList_checkout");
		       	  checkOut_clearData();
		       }	       
		 }
		 	  // resultList.splice(0,0, this.toString());
	         //  localStorageUtils.setParam("resultList_checkout", resultList.join(SEPARATOR));
		    // var strList = localStorageUtils.getParam("resultList_checkout").split(SEPARATOR);    
		    //     $.each(strList, function(index, item) {
		    //         checkoutResult.push(JSON.parse(item));
		    //     });   
		 	  checkoutResult.splice(0,0, this);
		 	  refreshLocalResultList(checkoutResult);		 
		 	  currentTouzhuInfo = checkoutResult[0];      	     
	          if (this.lotteryType =="mmc") {
	            setPanelBackPage_Fun("mmccheckOutPage", true);
	          }else{
	          	setPanelBackPage_Fun("checkOutPage", true);
	          }	
    }
}

/**
 *刷新本地存储的选号信息记录
 *@param checkoutResultList 存储选择的号码信息的数组。 Type:Number
 */
function refreshLocalResultList(list) {
	var temp = [];
	$.each(list, function(index, item) {
		temp.push(JSON.stringify(item));
	});
	localStorageUtils.setParam("resultList_checkout", temp.join(SEPARATOR));
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 11:37:23
 * @Description: 随机创建删除按钮id
 */
function getLotteryConid(){
    return "conID" + parseInt(Math.random() * 100000000000);
}

/**
 * [clickForRandom 出票页面随机]
 * @param  {Function} fn   [description]
 * @param  {[type]}   args [description]
 * @return {[type]}        [description]
 */
function clickForRandom(fn,args){
	return fn.apply(this, args);  
}
/**
 * [createBallsHtml 创建红球布局]
 * @return {[type]}              [null]
 */
function createLayoutHtml(){
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
		"lottery_playType":""
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
		var ballColor = getLayoutParam("isBlueBall") ? "blueBalls" : "redBalls";
		var $betContent = $('<div class="ballView ' + ballColor + '"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		if(getLayoutParam("shortcut")){
			var $buttonGroup = $('<div class="button-grouped flex" style="width:80%;margin:0 0 0 2rem"></div>');
			var $buttonAll = $('<a id="'+getLayoutParam("lottery_playType")+'_all" class="button">全</a>');
			var $buttonOdd = $('<a id="'+getLayoutParam("lottery_playType")+'_odd" class="button">奇</a>');
			var $buttonEven = $('<a id="'+getLayoutParam("lottery_playType")+'_even" class="button">偶</a>');
			var $buttonClear = $('<a id="'+getLayoutParam("lottery_playType")+'_clear" class="button">清</a>');
			if(LotteryInfo.getLotteryTypeByTag(lottery_play[0]) == "kl8"){
				var $buttonLarge = $('<a id="'+getLayoutParam("lottery_playType")+'_large" class="button">下</a>');
				var $buttonSmall = $('<a id="'+getLayoutParam("lottery_playType")+'_small" class="button">上</a>');
				$buttonGroup.append($buttonAll).append($buttonSmall).append($buttonLarge).append($buttonOdd).append($buttonEven).append($buttonClear);
			}else{
				var $buttonLarge = $('<a id="'+getLayoutParam("lottery_playType")+'_large" class="button">大</a>');
				var $buttonSmall = $('<a id="'+getLayoutParam("lottery_playType")+'_small" class="button">小</a>');
				$buttonGroup.append($buttonAll).append($buttonLarge).append($buttonSmall).append($buttonOdd).append($buttonEven).append($buttonClear);
			}
			$betContent.append($buttonGroup);

			var start = getLayoutParam("ball_start");
			var end = getLayoutParam("ball_end");
			var middle = (end - start - 1) / 2;

			$buttonAll.on('click',function(){
				$("#"+getLayoutParam("lottery_playType")+" li span").removeClass(ballColor + "_active");
				LotteryStorage[lottery_play[0]][lottery_play[1]] = [];

				if(getLayoutParam("maxBallsNum") == 8){ //北京快乐8 任性二至任选七
					var redBallArray = mathUtil.getInts(1,80);
					var array = mathUtil.getDifferentNums(8,redBallArray);
					$.each(array,function(index,value){
						$("#"+lottery_play[0]+"_line1"+array[index]).addClass(ballColor + "_active");
					});
				}else{
					$("#"+getLayoutParam("lottery_playType")+" li span").addClass(ballColor + "_active");
				}
				$("#"+getLayoutParam("lottery_playType")).find("span.redBalls_active").each(function(){
					LotteryStorage[lottery_play[0]][lottery_play[1]].push($(this).text());
				});

				clickBallCallBack($(this));
			});

			$buttonLarge.on('click',function(){
				$("#"+getLayoutParam("lottery_playType")+" li span").removeClass(ballColor + "_active");
				LotteryStorage[lottery_play[0]][lottery_play[1]] = [];

				if(getLayoutParam("maxBallsNum") == 8) { //北京快乐8 任性二至任选七
					var redBallArray = mathUtil.getInts(41,80);
					var array = mathUtil.getDifferentNums(8,redBallArray);
					$.each(array,function(index,value){
						$("#"+lottery_play[0]+"_line1"+array[index]).addClass(ballColor + "_active");
					});
				}else{
					$("#"+getLayoutParam("lottery_playType")+" li span").filter(function(index){
						return index > middle;
					}).addClass(ballColor + "_active");
				}
				$("#"+getLayoutParam("lottery_playType")).find("span.redBalls_active").each(function(){
					LotteryStorage[lottery_play[0]][lottery_play[1]].push($(this).text());
				});
				clickBallCallBack($(this));
			});

			$buttonSmall.on('click',function(){
				$("#"+getLayoutParam("lottery_playType")+" li span").removeClass(ballColor + "_active");
				LotteryStorage[lottery_play[0]][lottery_play[1]] = [];
				if(getLayoutParam("maxBallsNum") == 8) { //北京快乐8 任性二至任选七
					var redBallArray = mathUtil.getInts(1,40);
					var array = mathUtil.getDifferentNums(8,redBallArray);
					$.each(array,function(index,value){
						$("#"+lottery_play[0]+"_line1"+array[index]).addClass(ballColor + "_active");
					});
				}else{
					$("#"+getLayoutParam("lottery_playType")+" li span").filter(function(index){
						return index <= middle;
					}).addClass(ballColor + "_active");
				}
				$("#"+getLayoutParam("lottery_playType")).find("span.redBalls_active").each(function(){
					LotteryStorage[lottery_play[0]][lottery_play[1]].push($(this).text());
				});
				clickBallCallBack($(this));
			});

			$buttonOdd.on('click',function(){
				$("#"+getLayoutParam("lottery_playType")+" li span").removeClass(ballColor + "_active");
				LotteryStorage[lottery_play[0]][lottery_play[1]] = [];

				if(getLayoutParam("maxBallsNum") == 8) { //北京快乐8 任性二至任选七 最多选8个号
					var oddArray = [];
					for (var i = 1;i <= 80; i+=2){
						oddArray.push(i);
					}
					var array = mathUtil.getDifferentNums(8,oddArray);
					$.each(array,function(index,value){
						$("#"+lottery_play[0]+"_line1"+array[index]).addClass(ballColor + "_active");
					});
				}else{
					var lotteryType = LotteryInfo.getLotteryTypeByTag(lottery_play[0]);
					if(lotteryType == "esf" || lotteryType == "pks" || lotteryType == "k3" || lotteryType == "kl8" || lotteryType == "klsf"){
						$("#"+getLayoutParam("lottery_playType")+" li span").filter(':even').addClass(ballColor + "_active");
					}else{
						$("#"+getLayoutParam("lottery_playType")+" li span").filter(':odd').addClass(ballColor + "_active");
					}
				}

				$("#"+getLayoutParam("lottery_playType")).find("span.redBalls_active").each(function(){
					LotteryStorage[lottery_play[0]][lottery_play[1]].push($(this).text());
				});
				clickBallCallBack($(this));
			});

			$buttonEven.on('click',function(){
				$("#"+getLayoutParam("lottery_playType")+" li span").removeClass(ballColor + "_active");
				LotteryStorage[lottery_play[0]][lottery_play[1]] = [];

				if(getLayoutParam("maxBallsNum") == 8) { //北京快乐8 任性二至任选七
					var evenArray = [];
					for (var i = 2;i <= 80; i+=2){
						evenArray.push(i);
					}
					var array = mathUtil.getDifferentNums(8,evenArray);
					$.each(array,function(index,value){
						$("#"+lottery_play[0]+"_line1"+array[index]).addClass(ballColor + "_active");
					});
				}else{
					var lotteryType = LotteryInfo.getLotteryTypeByTag(lottery_play[0]);
					if(lotteryType == "esf" || lotteryType == "pks" || lotteryType == "k3" || lotteryType == "kl8" || lotteryType == "klsf"){
						$("#"+getLayoutParam("lottery_playType")+" li span").filter(':odd').addClass(ballColor + "_active");
					}else{
						$("#"+getLayoutParam("lottery_playType")+" li span").filter(':even').addClass(ballColor + "_active");
					}
				}

				$("#"+getLayoutParam("lottery_playType")).find("span.redBalls_active").each(function(){
					LotteryStorage[lottery_play[0]][lottery_play[1]].push($(this).text());
				});
				clickBallCallBack($(this));
			});

			$buttonClear.on('click',function(){
				$("#"+getLayoutParam("lottery_playType")+" li span").removeClass(ballColor + "_active");
				LotteryStorage[lottery_play[0]][lottery_play[1]] = [];
				clickBallCallBack($(this));
			});
		}
		var $ballUl = $('<ul id="'+getLayoutParam("lottery_playType")+'"></ul>');
		for (var i = getLayoutParam("ball_start"); i <= getLayoutParam("ball_end"); i++) {
			var $ballLi = $('<li></li>');
			var realNumber;
			if (i < 10) {
				realNumber = getLayoutParam("isAddZero") ? "0"+i : i ;
			}else{
				realNumber = i;
			}
			var $ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="'+ballColor+'">'+ realNumber +'</span>');
			$ballSpan.on('click',function(event){
				var array = LotteryStorage[lottery_play[0]][lottery_play[1]];
				$(this).toggleClass(ballColor + "_active");
				if ($(this).hasClass(ballColor + "_active")) {
					if (array.length == getLayoutParam("maxBallsNum")) {
						toastUtils.showToast("最多选择" + getLayoutParam("maxBallsNum") + "个！");
						$(this).toggleClass(ballColor + "_active");
						return ;
					}else{
						array.push($(this).html());
					}
				}else{
					array.splice($.inArray($(this).html(),array),1);
				}
				LotteryStorage[lottery_play[0]][lottery_play[1]] = array;
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
		};
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

/**
 * 创建互斥界面
 */
function createMutexBallHtml(text) {
	var layoutParams = {
		"divId":"",
		"text":"",
		"lottery_playType":""
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
		var ballColor = getLayoutParam("isBlueBall") ? "blueBalls" : "redBalls";
		var $betContent = $('<div class="ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		for (var i = 0; i < text.length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="redBalls">'+ text[i] +'</span>');
			$ballSpan.on('click',{index:i},function(event){
				$(".ballView span").removeClass(ballColor + "_active");
				var array = LotteryStorage[lottery_play[0]][lottery_play[1]];
				array.splice(0,array.length);
				$(this).toggleClass(ballColor + "_active");
				if ($(this).hasClass(ballColor + "_active")) {
					array.push(event.data.index);
				}else{
					array.splice($.inArray(event.data.index,array),1);
				}
				LotteryStorage[lottery_play[0]][lottery_play[1]] = array;
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
		};
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

function createMutexBallLayout(lotteryName,text,tips,calcNotes) {
	$("#"+lotteryName+"_ballView").empty();
	var firstRedBallLayout = new createMutexBallHtml(text);
	var first_param = lotteryName+"_line1";
	var firstParams = {
		"divId":lotteryName+"_ballView",
		"text":tips[0],
		"lottery_playType":first_param
	}
	firstRedBallLayout.create(firstParams,function(clcikedBall){
		localStorageUtils.setParam(first_param, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * [createDXDSHtml 创建大小单双]
 * @return {[type]} [description]
 */
function createTextBallHtml(text){
	var layoutParams = {
		"divId":"",
		"text":"",
		"lottery_playType":""
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
		var ballColor = getLayoutParam("isBlueBall") ? "blueBalls" : "redBalls";
		var $betContent = $('<div class="ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		for (var i = 0; i < text.length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="redBalls">'+ text[i] +'</span>');
			$ballSpan.on('click',{index:i},function(event){
				var array = LotteryStorage[lottery_play[0]][lottery_play[1]];
				
				//-----混合投注验证   腾讯分分彩（57）、的大小单双玩法：只能混合买 --------
                var lotteryName = lottery_play[0];  //彩种标识
                if (lotteryName == "txffc") {
                    if ($(this).hasClass(ballColor + "_active")) {  //选中
                        $(this).toggleClass(ballColor + "_active");
                        array.splice($.inArray(event.data.index + "", array), 1);
					} else {  //非选中
                        var lotterLine = LotteryStorage[lotteryName];
                        var selected = event.data.index + "";
                        var parentsNum = ($(this).parent("li")).parent("ul").parent("div").siblings("div.ballView").size();
                        // 前后三
                        if ((parentsNum == 2) && ($.inArray(selected, lotterLine["line1"]) != -1 && $.inArray(selected, lotterLine["line2"]) != -1) || ($.inArray(selected, lotterLine["line3"]) != -1 && $.inArray(selected, lotterLine["line1"]) != -1) || ($.inArray(selected, lotterLine["line2"]) != -1 && $.inArray(selected, lotterLine["line3"]) != -1)) {
                            toastUtils.showToast("该玩法只能混合购买");
                            return;
						// 前后二
                        } else if ((parentsNum == 1) && ($.inArray(selected, lotterLine["line1"]) != -1 || $.inArray(selected, lotterLine["line2"]) != -1 )) {
                            toastUtils.showToast("该玩法只能混合购买");
                            return;
                        } else {
                            $(this).toggleClass(ballColor + "_active");
                            array.push(event.data.index + "");
                        }
					}
				}else{  //其他彩种
					$(this).toggleClass(ballColor + "_active");
					if ($(this).hasClass(ballColor + "_active")) {
						array.push(event.data.index);
					}else{
						array.splice($.inArray(event.data.index,array),1);
					}
				}
				LotteryStorage[lottery_play[0]][lottery_play[1]] = array;
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
		};
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


function createTongXuanHtml(){
	var layoutParams = {
		"divId":"",
		"text":"",
		"num":[],
		"lottery_playType":""
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
		var $betContent = $('<div class="ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		for (var i = 0; i < getLayoutParam("num").length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="redBalls" style="font-size:1.0rem">'+ getLayoutParam("num")[i] +'</span>');

			$ballSpan.on('click',function(event){
				$(this).parent().parent().find("span").toggleClass("redBalls_active");
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
		};
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

/**
 * 创建非数字类布局
 * @returns {{setLayoutParams: setLayoutParams, getLayoutParams: getLayoutParams, setLayoutParam: setLayoutParam, getLayoutParam: getLayoutParam, create: create}}
 */
function createNonNumHtml(){
	var layoutParams = {
		"divId":"",
		"text":"",
		"num":[],
		"lottery_playType":"",
		"playType":""
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
		var $betContent = $('<div class="ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		for (var i = 0; i < getLayoutParam("num").length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = "";
			var lotteryType = LotteryInfo.getLotteryTypeByTag(getLayoutParam("lottery_playType").split("_")[0]);
			if( (lotteryType =="kl8" && getLayoutParam("playType") == "11")) {  //小球样式-宽度增加
				$ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="redBalls" style="margin:0.5rem 0.3rem;width:3.6rem;font-size: 1rem;">'+ getLayoutParam("num")[i] +'</span>');
			}else{
				$ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="redBalls">'+ getLayoutParam("num")[i] +'</span>');
			}
			$ballSpan.on('click',function(event){
				$(this).toggleClass("redBalls_active");
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
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

function siblings(elm) {
	var a = [];
	var p = elm.parentNode.children;
	for(var i =0,pl= p.length;i<pl;i++) {
		if(p[i] !== elm) a.push(p[i]);
	}
	return a;
}

/**
 * [createDXDSHtml 创建button]
 * @return {[type]} [description]
 */
function createButtonHtml(playName){
	var layoutParams = {
		"divId":"",
		"text":"",
		"lottery_playType":""
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
		var text = [playName];
		var lottery_play = getLayoutParam("lottery_playType").split("_");
		var $betContent = $('<div class="buttonView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		for (var i = 0; i < 1; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="redButton">'+ text[i] +'</span>');
			$ballSpan.on('click',function(event){
				var array = LotteryStorage[lottery_play[0]][lottery_play[1]][lottery_play[2]];
				$(this).toggleClass("redButton_active");
				if ($(this).hasClass("redButton_active")) {
					array.push($(this).html());
				} else {
					array.splice($.inArray($(this).html(),array),1);
				}
				LotteryStorage[lottery_play[0]][lottery_play[1]][lottery_play[2]] = array;
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
		};
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
/**
 * [createDXDSHtml 创建三同号]
 * @return {[type]} [description]
 */
function createTongHtml(playNum){
	var layoutParams = {
		"divId":"",
		"text":"",
		"lottery_playType":""
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
		var text = playNum;
		var lottery_play = getLayoutParam("lottery_playType").split("_");
		var $betContent = $('<div class="ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		for (var i = 0; i < text.length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="redBalls">'+ text[i] +'</span>');
			$ballSpan.on('click',function(){
				var array = LotteryStorage[lottery_play[0]][lottery_play[1]][lottery_play[2]];
				$(this).toggleClass("redBalls_active");
				if ($(this).hasClass("redBalls_active")) {
					if (array.length == getLayoutParam("maxBallsNum")) {
						toastUtils.showToast("最多选择" + getLayoutParam("maxBallsNum") + "个！");
						$(this).toggleClass("redBalls_active");
						return ;
					}else{
						array.push($(this).html());
					}
				}else{
					array.splice($.inArray($(this).html(),array),1);
				}
				LotteryStorage[lottery_play[0]][lottery_play[1]][lottery_play[2]] = array;
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
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

var timerId;
/**
 * @Author:      admin
 * @DateTime:    2014-12-03 16:19:09
 * @Description: 获取期号
 * @param: 		 lotteryName 彩种名称
 */
function getQihao(lotteryName,value){
	localStorageUtils.setParam("lotteryName",lotteryName);
	localStorageUtils.setParam("lotteryType",value);
	var params='{"LotteryCodeEnum": ' + value + ',"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetCurrLotteryIssue"}';
	ajaxUtil.ajaxByAsyncPost1(null,params,function(data){
		if(data.Code == 200) {
			//生成期号
			localStorageUtils.setParam("periodNumber",data.Data.IssueNumber);
			$("#" + lotteryName + "_qihao").html("第&nbsp;"+data.Data.IssueNumber+"&nbsp;期&nbsp;&nbsp;&nbsp;&nbsp;倒计时：");
			if(timerId != null){
				clearInterval(timerId);
			}

			//判断倒计时 为0或小于0 的临界点
			if(Number(data.Data.SS) > 0){
				startTimer(lotteryName,data.Data.SS);
				refreshLastPeriodNumber(lotteryName);
			}else{
				getQihao(lotteryName,value);
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
function startTimer(lottery,remainTime){
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
			if(localStorageUtils.getParam("lotteryType")){
				getQihao(localStorageUtils.getParam("lotteryName"),localStorageUtils.getParam("lotteryType"));
				queryLastPrize(lottery);
			}
		}
	}, 1000);
}

this.format = function (formatter,time) {
	return formatter.replace(/hh/ig, time.h).replace(/mm/ig, time.m).replace(/ss/ig, time.s);
};

//定时刷开奖号码
var periodTimer;
function refreshLastPeriodNumber(lottery){
	var lotteryId = LotteryInfo.getLotteryIdByTag(lottery);
	if(typeof(periodTimer) != "undefined" && periodTimer ){
		clearInterval(periodTimer);
	}
	if(lotteryId != 50){ // !mmc
		 periodTimer = setInterval(function () {
			ajaxUtil.ajaxByAsyncPost_mute(null,'{"IsSelf":false,"ProjectPublic_PlatformCode":2,"Size":10,"Page":0,"reType":1,"InterfaceName":"/api/v1/netweb/GetHisNumber","CZID":"'+lotteryId+'"}',function(data){
				if(data.Code == 200){
					if(data.Data.length == 0)return;
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
					if(lotteryId == '9' || lotteryId == '79' || lotteryId == '80'){
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
}

//最新一期历史开奖码
var ResultNumber="";
function queryLastPrize(lottery){
	$("#"+lottery+"_prizelist div").first().empty();
	var lotteryId = LotteryInfo.getLotteryIdByTag(lottery);
	var merchantCode = localStorageUtils.getParam("MerchantCode");
	//4,5,12,14,15,16,17,18,19,50,51,53,55,61,63,71
	//51013   53013   55013  61013  63013

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

				addPrizeScroll(lottery);

				//点击刷新图标重新载入最新开奖结果
				$("#"+lottery+"reloadRst").on('click',function(event) {
					queryLastPrize(lottery);
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
				var $div = $('<div id="'+ lottery +'_prizeScroll" style="position:absolute;top:66px;bottom:16px;overflow: hidden; width:100%;"></div>');
				var $table = $('<table id="'+ lottery +'_prizeContent"></table>');

				$.each(data.Data, function(key, val) {
					if(key < 10) {
						var _resultS = val.CzNum;
						if (LotteryInfo.getLotteryTypeById(val.CzType)=='kl8') {
							var arr = _resultS.split(',');
							arr = arr.slice(0,20);
							_resultS = arr.join(',');
						}
						_resultS = _resultS.replace(new RegExp(/,/g), " ");
						$table.append('<tr><td>' + val.CzPeriod + '</td><td style="color:#FE5D39;">' + _resultS + '</td></tr>');
						ResultNumber = _resultS;
						//显示最新一期开奖号码；
						if(key == 0){
							//显示最新一期开奖号码；
							if($(".show-result")){
								$(".show-result").remove();
							}
							if(lotteryId == '9' || lotteryId == '79' || lotteryId == '80'){
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

				addPrizeScroll(lottery);
				
				//点击刷新图标重新载入最新开奖结果
				$("#"+lottery+"reloadRst").on('click',function(event) {
					queryLastPrize(lottery);
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
function addPrizeScroll(lottery) {
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
 * @Author:      admin
 * @DateTime:    2014-12-13 14:25:41
 * @Description: 清空所有有选球
 * @param:       lotteryName 彩种名如ssq , dlt
 */
function qingKong(lotteryName, message){
	$('#'+ lotteryName +'_qingkong').unbind('click');
	$('#'+ lotteryName +'_qingkong').click(function() {
		//清空
		eval(lotteryName + '_qingkongAll' + '()');
		/*
		$.ui.popup( {
		   title:"提示",
		   message: message || "确定要清空选号？",
		   cancelText:"取消",
		   doneText:"确定",
		   addCssClass : "msg",
		   doneCallback: function(){
		   		//清空
		   		eval(lotteryName + '_qingkongAll' + '()');
			},
		   cancelOnly:false
		 });
		 return false;
		 */
	});
}

/**
 * [createFiveLineLayout 创建5行布局]
 * @param  {[type]} lotteryName [description]
 * @param  {[type]} calcNotes   [description]
 * @return {[type]}             [description]
 */
function createFiveLineLayout(lotteryName,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建万位
	var wanRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"万位:可选1-10个",
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line1
	}
	wanRedBallLayout.create(wanParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	
	//创建千位
	var qianRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var qianParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"千位:可选1-10个",
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line2
	}
	qianRedBallLayout.create(qianParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});

	//创建百位
	var baiRedBallLayout = new createLayoutHtml();
	var playType_line3 = lotteryName+"_line3";
	var baiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"百位:可选1-10个",
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line3
	}
	baiRedBallLayout.create(baiParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line3, LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});

	//创建十位
	var shiRedBallLayout = new createLayoutHtml();
	var playType_line4 = lotteryName+"_line4";
	var shiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"十位:可选1-10个",
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line4
	}
	shiRedBallLayout.create(shiParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line4, LotteryStorage[lotteryName]["line4"]);
		//计算注数
		calcNotes();
	});

	//创建个位
	var geRedBallLayout = new createLayoutHtml();
	var playType_line5 = lotteryName+"_line5";
	var geParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"个位:可选1-10个",
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line5
	}
	geRedBallLayout.create(geParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line5, LotteryStorage[lotteryName]["line5"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * [createFourLineLayout 创建四行布局]
 * @param  {[type]} lotteryName [description]
 * @param  {[type]} tips        [description]
 * @param  {[type]} calcNotes   [description]
 * @return {[type]}             [description]
 */
function createFourLineLayout(lotteryName,tips,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	var wanRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[0],
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line1
	}
	wanRedBallLayout.create(wanParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	
	var qianRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var qianParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[1],
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line2
	}
	qianRedBallLayout.create(qianParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});

	var baiRedBallLayout = new createLayoutHtml();
	var playType_line3 = lotteryName+"_line3";
	var baiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[2],
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line3
	}
	baiRedBallLayout.create(baiParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line3, LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});

	var shiRedBallLayout = new createLayoutHtml();
	var playType_line4 = lotteryName+"_line4";
	var shiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[3],
		"ball_start":0,
		"ball_end":9,
		"isAddZero":false,
		"maxBallsNum":10,
		"lottery_playType":playType_line4
	}
	shiRedBallLayout.create(shiParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line4, LotteryStorage[lotteryName]["line4"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * [createOneLineLayout 创建1行布局]
 * @param  {[type]} lotteryName [description]
 * @param  {[type]} calcNotes   [description]
 * @return {[type]}             [description]
 */
function createOneLineLayout(lotteryName,tip,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	var line1Layout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var shortcut = LotteryInfo.getLotteryTypeByTag(lotteryName)=="k3" ? false : true; //是否有大小奇偶全清
	var wanParams = {
		"shortcut":shortcut,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tip,
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":end - start + 1,
		"lottery_playType":playType_line1
	}
	line1Layout.create(wanParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}


function createOneLineMaxLayout(lotteryName,minSelectedNums,maxSelectedNums,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	var playType_note = "可选"+minSelectedNums+"-"+maxSelectedNums+"个";
	var line1Layout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":playType_note,
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":maxSelectedNums,
		"lottery_playType":playType_line1
	}
	line1Layout.create(wanParams,function(clickedBall){

		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createDanTuoLayout(lotteryName,maxSelectedNums,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建胆码
	var playType_note = "胆码：至多可选"+maxSelectedNums+"个";
	var shiRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var shiParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":playType_note,
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":maxSelectedNums,
		"lottery_playType":playType_line1
	}

	//创建拖码
	var geRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var geParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"拖码：可选2-"+(end - 1)+"个",
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":end,
		"lottery_playType":playType_line2
	}

	shiRedBallLayout.create(shiParams,function(clickedBall){

		var array = LotteryStorage[lotteryName]["line2"];
		$.each(array, function(index, val) {
			var temp = val;
			if (clickedBall.html() == temp) {
				$("#"+lotteryName+"_line2"+parseInt(val)).toggleClass('redBalls_active');
				array.splice(index,1);
				localStorageUtils.setParam(playType_line2,LotteryStorage[lotteryName]["line2"]);
			}
		});
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});


	geRedBallLayout.create(geParams,function(clickedBall){
		var array = LotteryStorage[lotteryName]["line1"];
		$.each(array, function(index, val) {
			var temp = val;
			if (clickedBall.html() == temp) {
				$("#"+lotteryName+"_line1"+parseInt(val)).toggleClass('redBalls_active');
				array.splice(index,1);
				localStorageUtils.setParam(playType_line1,LotteryStorage[lotteryName]["line1"]);
			}
		});

		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createThreeWinner(lotteryName,tips,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();

	var baiRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var baiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[0],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line1
	}

	var shiRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var shiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[1],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line2
	}

	var geRedBallLayout = new createLayoutHtml();
	var playType_line3 = lotteryName+"_line3";
	var geParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[2],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line3
	}

	baiRedBallLayout.create(baiParams,function(clickedBall){

		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	shiRedBallLayout.create(shiParams,function(clickedBall){

		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);

		//计算注数
		calcNotes();
	});


	geRedBallLayout.create(geParams,function(clickedBall){

		localStorageUtils.setParam(playType_line3, LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}
function createFourWinner(lotteryName,tips,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();

	//创建千位
	var qianRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var qianParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[0],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line1
	}
	qianRedBallLayout.create(qianParams,function(clickedBall){

		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	//创建百位
	var baiRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var baiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[1],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line2
	}
	baiRedBallLayout.create(baiParams,function(clickedBall){

		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});

	//创建十位
	var shiRedBallLayout = new createLayoutHtml();
	var playType_line3 = lotteryName+"_line3";
	var shiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[2],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line3
	}
	shiRedBallLayout.create(shiParams,function(clickedBall){

		localStorageUtils.setParam(playType_line3, LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});

	//创建个位
	var geRedBallLayout = new createLayoutHtml();
	var playType_line4 = lotteryName+"_line4";
	var geParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[3],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line4
	}
	geRedBallLayout.create(geParams,function(clickedBall){

		localStorageUtils.setParam(playType_line4, LotteryStorage[lotteryName]["line4"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}
function createFiveWinner(lotteryName,tips,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建万位
	var wanRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[0],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line1
	}
	wanRedBallLayout.create(wanParams,function(clickedBall){

		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	//创建千位
	var qianRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var qianParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[1],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line2
	}
	qianRedBallLayout.create(qianParams,function(clickedBall){

		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});

	//创建百位
	var baiRedBallLayout = new createLayoutHtml();
	var playType_line3 = lotteryName+"_line3";
	var baiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[2],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line3
	}
	baiRedBallLayout.create(baiParams,function(clickedBall){

		localStorageUtils.setParam(playType_line3, LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});

	//创建十位
	var shiRedBallLayout = new createLayoutHtml();
	var playType_line4 = lotteryName+"_line4";
	var shiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[3],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line4
	}
	shiRedBallLayout.create(shiParams,function(clickedBall){

		localStorageUtils.setParam(playType_line4, LotteryStorage[lotteryName]["line4"]);
		//计算注数
		calcNotes();
	});

	//创建个位
	var geRedBallLayout = new createLayoutHtml();
	var playType_line5 = lotteryName+"_line5";
	var geParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[4],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line5
	}
	geRedBallLayout.create(geParams,function(clickedBall){

		localStorageUtils.setParam(playType_line5, LotteryStorage[lotteryName]["line5"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createTwoWinner(lotteryName,tips,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	var shiRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var shiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[0],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line1
	}

	var geRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var geParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[1],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":10,
		"lottery_playType":playType_line2
	}

	shiRedBallLayout.create(shiParams,function(clickedBall){

		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});


	geRedBallLayout.create(geParams,function(clickedBall){

		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createErTongHaoHtml(){
	var layoutParams = {
		"divId":"",
		"isBlueBall":false,
		"text":"",
		"balls":[],
		"isAddZero":false,
		"maxBallsNum":0,
		"lottery_playType":""
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
		var ballColor = getLayoutParam("isBlueBall") ? "blueBalls" : "redBalls";
		var $betContent = $('<div class="ballView ' + ballColor + '"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		for (var i = 0; i < getLayoutParam("balls").length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="'+ballColor+'" style="font-size:1.0rem">'+ getLayoutParam("balls")[i] +'</span>');
			$ballSpan.on('click',function(event){
				var array = LotteryStorage[lottery_play[0]][lottery_play[1]];
				$(this).toggleClass(ballColor + "_active");
				if ($(this).hasClass(ballColor + "_active")) {
					if (array.length == getLayoutParam("maxBallsNum")) {
						toastUtils.showToast("最多选择" + getLayoutParam("maxBallsNum") + "个！");
						$(this).toggleClass(ballColor + "_active");
						return ;
					}else{
						array.push($(this).html());
					}
				}else{
					array.splice($.inArray($(this).html(),array),1);
				}
				LotteryStorage[lottery_play[0]][lottery_play[1]] = array;
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
		};
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

function createErTongHaoLayout(lotteryName ,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建胆码
	var playType_note = "同号：至多可选5个";
	var shiRedBallLayout = new createErTongHaoHtml();
	var playType_line1 = lotteryName+"_line1";
	var shiParams = {
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":playType_note,
		"balls":["11","22","33","44","55","66"],
		"isAddZero":false,
		"maxBallsNum":5,
		"lottery_playType":playType_line1
	}

	//创建拖码
	var geRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var geParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"不同号：可选1-5个",
		"ball_start":1,
		"ball_end":6,
		"isAddZero":false,
		"maxBallsNum":5,
		"lottery_playType":playType_line2
	}

	shiRedBallLayout.create(shiParams,function(clickedBall){

		var array = LotteryStorage[lotteryName]["line2"];
		$.each(array, function(index, val) {
			var value = val + "";
			if (clickedBall.html().indexOf(value) >=0) {
				var temp = val%10;
				$("#"+lotteryName+"_line2"+temp).toggleClass('redBalls_active');
				array.splice(index,1);
				localStorageUtils.setParam(playType_line2,LotteryStorage[lotteryName]["line2"]);
			}
		});
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});


	geRedBallLayout.create(geParams,function(clickedBall){
		var array = LotteryStorage[lotteryName]["line1"];
		$.each(array, function(index, val) {
			var value = val + "";
			if (value.indexOf(clickedBall.html()) >= 0) {
				var temp = val%10 - 1;
				$("#"+lotteryName+"_line1"+temp).toggleClass('redBalls_active');
				array.splice(index,1);
				localStorageUtils.setParam(playType_line1,LotteryStorage[lotteryName]["line1"]);
			}
		});

		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createDanTuoSpecLayout(lotteryName,maxSelectedNums,minTuo,maxTuo,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建胆码
	var playType_note = "胆码：至多可选"+maxSelectedNums+"个";
	var shiRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var shiParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":playType_note,
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":maxSelectedNums,
		"lottery_playType":playType_line1
	}

	//创建拖码
	var geRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var geParams = {
		"shortcut":false,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"拖码：可选"+minTuo+"-"+maxTuo+"个",
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":11,
		"lottery_playType":playType_line2
	}

	shiRedBallLayout.create(shiParams,function(clickedBall){

		var array = LotteryStorage[lotteryName]["line2"];
		$.each(array, function(index, val) {
			var temp = val;
			if (clickedBall.html() == temp) {
				$("#"+lotteryName+"_line2"+parseInt(val)).toggleClass('redBalls_active');
				array.splice(index,1);
				localStorageUtils.setParam(playType_line2,LotteryStorage[lotteryName]["line2"]);
			}
		});
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});


	geRedBallLayout.create(geParams,function(clickedBall){
		var array = LotteryStorage[lotteryName]["line1"];
		$.each(array, function(index, val) {
			var temp = val;
			if (clickedBall.html() == temp) {
				$("#"+lotteryName+"_line1"+parseInt(val)).toggleClass('redBalls_active');
				array.splice(index,1);
				localStorageUtils.setParam(playType_line1,LotteryStorage[lotteryName]["line1"]);
			}
		});

		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createTwoLineLayout(lotteryName,tips,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建十位
	var shiRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var shiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[0],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":end - start + 1,
		"lottery_playType":playType_line1
	}
	shiRedBallLayout.create(shiParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	//创建个位
	var geRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var geParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[1],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":end - start + 1,
		"lottery_playType":playType_line2
	}
	geRedBallLayout.create(geParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createTextBallLayout(lotteryName,tips,text,calcNotes){
    $("#"+lotteryName+"_ballView").empty();
	for (var i = 1; i <= tips.length;i++){
		var textBallLayout = new createTextBallHtml(text);
        textBallLayout.create({
            "divId":lotteryName+"_ballView",
            "text":tips[i-1],
            "lottery_playType":lotteryName+"_line"+i
		},function (clickedBall) {
            localStorageUtils.setParam(lotteryName+"_line"+i, LotteryStorage[lotteryName]["line1"]);
            //计算注数
            calcNotes();
        })
	}
    createRebateLayout(lotteryName);
}

/**
 * [createThreeLineLayout 三行布局]
 * @param  {[type]} lotteryName [description]
 * @param  {[type]} tips        [description]
 * @param  {[type]} calcNotes   [description]
 * @return {[type]}             [description]
 */
function createThreeLineLayout(lotteryName,tips,start,end,isAddZero,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建百位
	var baiRedBallLayout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var baiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[0],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":end - start + 1,
		"lottery_playType":playType_line1
	}
	baiRedBallLayout.create(baiParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	//创建十位
	var shiRedBallLayout = new createLayoutHtml();
	var playType_line2 = lotteryName+"_line2";
	var shiParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[1],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":end - start + 1,
		"lottery_playType":playType_line2
	}
	shiRedBallLayout.create(shiParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line2, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});

	//创建个位
	var geRedBallLayout = new createLayoutHtml();
	var playType_line3 = lotteryName+"_line3";
	var geParams = {
		"shortcut":true,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":tips[2],
		"ball_start":start,
		"ball_end":end,
		"isAddZero":isAddZero,
		"maxBallsNum":end - start + 1,
		"lottery_playType":playType_line3
	}
	geRedBallLayout.create(geParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line3, LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * [createSumLayout 和值]
 * @param  {[type]} lotteryName [description]
 * @param  {[type]} start       [description]
 * @param  {[type]} end         [description]
 * @param  {[type]} calcNotes   [description]
 * @return {[type]}             [description]
 */
function createSumLayout(lotteryName,start,end,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	var line1Layout = new createLayoutHtml();
	var playType_line1 = lotteryName+"_line1";
	var shortcut = LotteryInfo.getLotteryTypeByTag(lotteryName)=="k3" ? true : false;
	var wanParams = {
		"shortcut":shortcut,
		"divId":lotteryName+"_ballView",
		"isBlueBall":false,
		"text":"请至少选择1个",
		"ball_start":start,
		"ball_end":end,
		"isAddZero":false,
		"maxBallsNum":end - start + 1,
		"lottery_playType":playType_line1
	};
	line1Layout.create(wanParams,function(clickedBall){
		
		localStorageUtils.setParam(playType_line1, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createTextBallOneLayout(lotteryName,text,tips,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	var firstRedBallLayout = new createTextBallHtml(text);
	var first_param = lotteryName+"_line1";
	var firstParams = {
		"divId":lotteryName+"_ballView",
		"text":tips[0],
		"lottery_playType":first_param
	}
	firstRedBallLayout.create(firstParams,function(clcikedBall){
		localStorageUtils.setParam(first_param, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * [createTextBallTwoLayout 创建大小单双]
 * @param  {[type]} lotteryName [description]
 * @param  {[type]} calcNotes   [description]
 * @return {[type]}             [description]
 */
function createTextBallTwoLayout(lotteryName,text,tips,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	var firstRedBallLayout = new createTextBallHtml(text);
	var first_param = lotteryName+"_line1";
	var firstParams = {
		"divId":lotteryName+"_ballView",
		"text":tips[0],
		"lottery_playType":first_param
	}
	firstRedBallLayout.create(firstParams,function(clcikedBall){
		localStorageUtils.setParam(first_param, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	var secondRedBallLayout = new createTextBallHtml(text);
	var second_param = lotteryName+"_line2";
	var secondParams = {
		"divId":lotteryName+"_ballView",
		"text":tips[1],
		"lottery_playType":second_param
	}
	secondRedBallLayout.create(secondParams,function(clcikedBall){
		localStorageUtils.setParam(second_param, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * [createTextThreeLayout 创建大小单双]
 * @param  {[type]} lotteryName [description]
 * @param  {[type]} calcNotes   [description]
 * @return {[type]}             [description]
 */
function createTextBallThreeLayout(lotteryName,text,tips,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	var firstRedBallLayout = new createTextBallHtml(text);
	var first_param = lotteryName+"_line1";
	var firstParams = {
		"divId":lotteryName+"_ballView",
		"text":tips[0],
		"lottery_playType":first_param
	}
	firstRedBallLayout.create(firstParams,function(clcikedBall){
		localStorageUtils.setParam(first_param, LotteryStorage[lotteryName]["line1"]);
		//计算注数
		calcNotes();
	});

	var secondRedBallLayout = new createTextBallHtml(text);
	var second_param = lotteryName+"_line2";
	var secondParams = {
		"divId":lotteryName+"_ballView",
		"text":tips[1],
		"lottery_playType":second_param
	}
	secondRedBallLayout.create(secondParams,function(clcikedBall){
		localStorageUtils.setParam(second_param, LotteryStorage[lotteryName]["line2"]);
		//计算注数
		calcNotes();
	});

	var thirdRedBallLayout = new createTextBallHtml(text);
	var third_param = lotteryName+"_line3";
	var thirdParams = {
		"divId":lotteryName+"_ballView",
		"text":tips[2],
		"lottery_playType":third_param
	};
	thirdRedBallLayout.create(thirdParams,function(clcikedBall){
		localStorageUtils.setParam(third_param, LotteryStorage[lotteryName]["line3"]);
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * 创建非数字类布局
 */
function createNonNumLayout(lotteryName,playType,numArray,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建布局
	var geRedBallLayout = new createNonNumHtml();
	var ge_param = lotteryName+"_line1";
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"至少选择1个",
		"num":numArray,
		"lottery_playType":ge_param,
		"playType":playType
	}
	geRedBallLayout.create(geParams,function(clickedBall){
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line1"].push(clickedBall.text());
		}else{
			LotteryStorage[lotteryName]["line1"].pop(clickedBall.text());
		}
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}
/**
 * 创建非数字类布局   pks  新龙虎玩法  龙虎不能同时选择
 */
function createNonNumLayout_pks_lh(lotteryName,playType,numArray,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建布局
	var geRedBallLayout = new createNonNumHtml_pks_lh();
	var ge_param = lotteryName+"_line1";
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"至少选择1个",
		"num":numArray,
		"lottery_playType":ge_param,
		"playType":playType
	}
	geRedBallLayout.create(geParams,function(clickedBall){
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line1"]=[];
			LotteryStorage[lotteryName]["line1"].push(clickedBall.text());
		}else{
			LotteryStorage[lotteryName]["line1"].pop(clickedBall.text());
		}
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * 创建非数字类布局
 * @returns {{setLayoutParams: setLayoutParams, getLayoutParams: getLayoutParams, setLayoutParam: setLayoutParam, getLayoutParam: getLayoutParam, create: create}}
 */
function createNonNumHtml_pks_lh(){
	var layoutParams = {
		"divId":"",
		"text":"",
		"num":[],
		"lottery_playType":"",
		"playType":""
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
		var $betContent = $('<div class="ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		
		//龙
		var $ballLi = $('<li></li>');
		var $ballSpan = "";
		var lotteryType = LotteryInfo.getLotteryTypeByTag(getLayoutParam("lottery_playType").split("_")[0]);
		$ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + "0"+ '" class="redBalls">'+ getLayoutParam("num")[0] +'</span>');
		$ballSpan.on('click',function(event){
			$(this).toggleClass("redBalls_active");
			clickBallCallBack($(this));
			
			if($ballSpan_2.hasClass("redBalls_active")){
				$ballSpan_2.removeClass("redBalls_active");
			}
		});
		$ballLi.append($ballSpan);
		$ballUl.append($ballLi);
		//虎
		var $ballLi_2 = $('<li></li>');
		var $ballSpan_2 = "";
		var lotteryType = LotteryInfo.getLotteryTypeByTag(getLayoutParam("lottery_playType").split("_")[0]);
		$ballSpan_2 = $('<span id="'+ getLayoutParam("lottery_playType") + "1"+ '" class="redBalls">'+ getLayoutParam("num")[1] +'</span>');
		$ballSpan_2.on('click',function(event){
			$(this).toggleClass("redBalls_active");
			clickBallCallBack($(this));
			
			if($ballSpan.hasClass("redBalls_active")){
				$ballSpan.removeClass("redBalls_active");
			}
		});
		$ballLi_2.append($ballSpan_2);
		$ballUl.append($ballLi_2);
		
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

/**
 * 通选
 * @param lotteryName
 * @param numArray
 * @param calcNotes
 */
function createTongXuanLayout(lotteryName,numArray,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建布局
	var geRedBallLayout = new createTongXuanHtml();
	var ge_param = lotteryName+"_line1";
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"至少选择1个",
		"num":numArray,
		"lottery_playType":ge_param
	}
	geRedBallLayout.create(geParams,function(clickedBall){
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line1"].push(numArray.join(","));
		}else{
			LotteryStorage[lotteryName]["line1"] = [];
		}
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/************* 厘模式 start **************/

/* 创建彩种玩法的倍数，返点和模式 requirement
 * */
function createRebateLayout(lotteryName) {
//	var $rebateHtml = $('<div class="bottomBox" style="position: relative;"><table style="width: 100%;"><tbody><tr class="tableTDClass"><td><label>倍投</label><input type="tel" value="1" maxlength="4" min="1" id="'+lotteryName+'_beiNum" style="text-align:center;width: 40%;height: 35px;" onblur="'+lotteryName+'_calcNotes()" onkeyup="Number(this.value=this.value.replace(/\\D/g,\'\'))>=Number(localStorageUtils.getParam("MaxBetMultiple"))?this.value=localStorageUtils.getParam("MaxBetMultiple"):this.value=this.value.replace(/\\D/g,\'\')"></td><td><select name="modeId" id="'+lotteryName+'_modeId" onchange="'+lotteryName+'_calcNotes()" style="padding:10px 0px 10px 10px;"><option value="4" selected="selected">元模式</option><option value="2">角模式</option>	<option value="1">分模式</option><option value="8">厘模式</option></select></td><td><select name="fandian" onchange="'+lotteryName+'_calcNotes()" id="'+lotteryName+'_fandian" style="padding:10px 0px 10px 10px;"></select></td></tr></tbody></table></div>');
	var $rebateHtml = $('<div class="bottomBox" style="position: relative;"><table style="width: 100%;"><tbody><tr class="tableTDClass"><td><label>倍投</label><input type="tel" value="1" maxlength="4" min="1" id="'+lotteryName+'_beiNum" style="text-align:center;width: 40%;height: 35px;" onblur="'+lotteryName+'_calcNotes()" onkeyup="this.value=this.value.replace(/\\D/g,\'\')"></td><td><select name="modeId" id="'+lotteryName+'_modeId" onchange="'+lotteryName+'_calcNotes()" style="padding:10px 0px 10px 10px;"><option value="4" selected="selected">元模式</option><option value="2">角模式</option>	<option value="1">分模式</option><option value="8">厘模式</option></select></td><td><select name="fandian" onchange="'+lotteryName+'_calcNotes()" id="'+lotteryName+'_fandian" style="padding:10px 0px 10px 10px;"></select></td></tr></tbody></table></div>');

	$("#"+lotteryName+"_ballView").append($rebateHtml);
}

/******  定义变量 ******/
var maxRebate = "";  		  // 商户最大返点
var minRebate = "";  		  // 商户最小返点
var xRebate = 2;      		  // 返点差值
var defaultBetRebate;         // 人为设置的返点
var fandianshu = '1940';      // 声明并初始化返点
var isCloseFandian = false;   // true：返点关闭；false：返点开启；
var isJiaoModeClosed = false; // true 表示角模式关闭
var isFenModeClosed = false;  // true 表示分模式关闭
var isLiModeClosed = false;  // true 表示厘模式关闭
var yuanjiaofen="1";          // 园角分模式初始化
var lotteryId;


/**
 *获取彩票返点值
 *@param  lotteryId 彩种Id 类型：字串
 */
function getLotteryFandian(lotteryId) {
	var params='{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAllMerchantInfo"}';
	ajaxUtil.ajaxByAsyncPost1(null, params, function(data) {
		if(data.Code == 200){
		    if (null != data.Data) {
				maxRebate=data.Data.MaxRebate;
				minRebate=data.Data.MinRebate;
				isCloseFandian = false;//data.Data.CanRebate == true ?false:true;
	
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
				GetLotteryInfo(lotteryId);
			}
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		}else{
		    toastUtils.showToast(data.Msg);
		}
	},null);
}

// 获取每个玩法下的返点列表；
function GetLotteryInfo(lotteryName,callback){
	var MYRebate = localStorageUtils.getParam("MYRebate");
	maxRebate = localStorageUtils.getParam("MaxRebate");
	minRebate = localStorageUtils.getParam("MinRebate");
	xRebate = localStorageUtils.getParam("XRebate");
	lotteryId = LotteryInfo.getLotteryIdByTag(lotteryName);
	var params='{"ProjectPublic_PlatformCode":2,"LotteryCodeEnum": "' + lotteryId + '","InterfaceName":"/api/v1/netweb/GetLotteryInfo"}';
	ajaxUtil.ajaxByAsyncPost1(null, params, function(data) {
		if(data.Code == 200){
		    if(data.Data != null){
				if(data.Data.state){
					//自身投注返点
					var userRebate = bigNumberUtil.minus(Number(maxRebate),Number(MYRebate));
					var temp = data.Data.LotteryRebate - userRebate;
					//商户投注返点
					var BetRebat = data.Data.BetRebate;
					if(temp < minRebate){
						defaultBetRebate = minRebate;
					}else{
						defaultBetRebate = temp ;
					}
					if(BetRebat < defaultBetRebate){
						defaultBetRebate = BetRebat;
					}
				}
			}
			localStorageUtils.setParam(lotteryName+"_playInfo",jsonUtils.toString(data.Data.LotteryInfo.PlayInfo));
			callback();
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		}else{
		    toastUtils.showToast(data.Msg);
		}
	},null);
}

//初始化界面底部的数据，如倍数、模式、返点、追号等
function initFooterData(lotteryName,playMethod) {
	// getCheckOutNotesAndMoney();  //计算组数和金额****
	fandianshu = defaultBetRebate;
	var Default_ = localStorageUtils.getParam(lotteryId) ? localStorageUtils.getParam(lotteryId) : defaultBetRebate;
	var startRebate = 0.0;
	if (isCloseFandian) {
		fandianshu = 1000;
		$("#"+lotteryName+"_fandian").html("1000," + 0.0);
		startRebate = 0.0;
	} else if (Default_ == minRebate) {
		$("#fandian").html("" + Default_ + ",0.0");
		startRebate = 0.0;
	} else {
		if(defaultBetRebate == null || typeof(defaultBetRebate) == "undefined"){
			var t = (parseInt(Default_) - parseInt(fandianshu)) / 20.0;
			$("#fandian").html(fandianshu+ ","+t.toFixed(1));
			startRebate = t.toFixed(1);
		}else{
			var t = (parseInt(Default_) - parseInt(defaultBetRebate)) / 20.0;
			$("#fandian").html(defaultBetRebate+ ","+t.toFixed(1));
			fandianshu = defaultBetRebate;
			startRebate = t.toFixed(1);
		}
	}
	setDefault(lotteryName,playMethod,startRebate);
}

// 设置默认返点和模式，显示返点列表
function  setDefault(lotteryName,playMethod,startRebate){
	var playMode_shou = localStorageUtils.getParam("playMode"); //记住元角分厘模式
	var MYRebate = parseInt(localStorageUtils.getParam("MYRebate"));  //当前登录用户自身返点
	minRebate = Number(minRebate);
	xRebate = Number(xRebate);

	var lotteryRebate = localStorageUtils.getParam(lotteryId) ? localStorageUtils.getParam(lotteryId) : defaultBetRebate;

	// var tempFandian = parseFloat(startRebate); //Before 最低返奖率-从小到大排序
	// var tempFandian = parseFloat(bigNumberUtil.divided((parseInt(defaultBetRebate) - parseInt(minRebate)),20));  // 最高返奖率-从大到小排序，虚拟返点
	var tempFandian = parseFloat(bigNumberUtil.divided((parseInt(lotteryRebate) - parseInt(minRebate)),20));  // 最高返奖率-从大到小排序，如实返点

	for (var k = minRebate; k <= defaultBetRebate; k +=xRebate, tempFandian -= 0.1) {
		tempFandian= tempFandian.toFixed(1);
		var fandiantemp = k +","+ tempFandian;

		//2018-06-01 以前的需求
		if (k == defaultBetRebate) {
			$("#"+lotteryName+"_fandian").append('<option value=' + fandiantemp + ' selected="selected">' + fandiantemp+ '</option>');
		}else{
			$("#"+lotteryName+"_fandian").append('<option value=' + fandiantemp + '>' + fandiantemp+ '</option>');
		}

		/*  2018-06-01 需求为:
		* 投注返点选择：
		*	如果投注返点＜1970，可选2挡 自身返点和商户最低点.
		*	如果投注返点≥ 1970，可选2挡 自身返点和1970.
		* */
		/*if( defaultBetRebate < 1970){
			if(k == defaultBetRebate){
				$("#"+lotteryName+"_fandian").append('<option selected="selected" value=' + fandiantemp + '>' + fandiantemp+ '</option>');
			}else if(k == minRebate){
				$("#"+lotteryName+"_fandian").append('<option value=' + fandiantemp + '>' + fandiantemp+ '</option>');
			}
		}else {
			if(k == defaultBetRebate){
				$("#"+lotteryName+"_fandian").append('<option selected="selected" value=' + fandiantemp + '>' + fandiantemp+ '</option>');
			}else if(k == 1970){
				$("#"+lotteryName+"_fandian").append('<option value=' + fandiantemp + '>' + fandiantemp+ '</option>');
			}
		}*/
	}

	//记住投注倍数
	var playBeiNum = Number(localStorageUtils.getParam("playBeiNum"));
	$("#"+lotteryName+"_beiNum").val(playBeiNum);

	//记住投注返点
	var playFanDian = localStorageUtils.getParam("playFanDian");
	if (playFanDian){
		$("#"+lotteryName+"_fandian").val(playFanDian);
	}

	//fandianshu为当前选项里的值
	fandianshu= $("#"+lotteryName+"_fandian").val();
	if (isCloseFandian) {//返点关闭
		fandianshu = 1000;
		$("#fandian").html("1000,0.00");
		toastUtils.showToast("返点已关闭");
	} else if (maxRebate == minRebate) {
		toastUtils.showToast("当前彩种不能设置返点");
	}
	$("#"+lotteryName+"_modeId").empty();

	//元模式
	if (isJiaoModeClosed && isFenModeClosed && isLiModeClosed) {
		$("#"+lotteryName+"_modeId").empty();
		toastUtils.showToast("不能选择付款模式");
		yuanjiaofen = "1";
		$("#"+lotteryName+"_modeId").append('<option value="4" selected="selected">元模式</option>');
	} else {
		//Default when others closed.
		if (playMode_shou && playMode_shou=="4"){
			$("#" + lotteryName + "_modeId").append('<option value="4" selected="selected">元模式</option>');
		}else{
			$("#" + lotteryName + "_modeId").append('<option value="4">元模式</option>');
		}

		if(!isJiaoModeClosed){
			if (playMode_shou && playMode_shou=="2"){
				$("#" + lotteryName + "_modeId").append('<option selected="selected" value="2">角模式</option>');
			}else{
				$("#" + lotteryName + "_modeId").append('<option value="2">角模式</option>');
			}
		}
		if(!isFenModeClosed){
			if (playMode_shou && playMode_shou=="1"){
				$("#" + lotteryName + "_modeId").append('<option value="1" selected="selected">分模式</option>');
			}else{
				$("#" + lotteryName + "_modeId").append('<option value="1">分模式</option>');
			}
		}
		if (!isLiModeClosed){
            if (playMode_shou && playMode_shou=="8"){
                $("#"+lotteryName+"_modeId").append('<option value="8" selected="selected">厘模式</option>');
            }else{
                $("#"+lotteryName+"_modeId").append('<option value="8">厘模式</option>');
            }
		}
	}
}

//彩种页面加载时，厘模式隐藏机选
function hideRandomWhenLi(lotteryTag,sntuo,playMethod) {
	var type = LotteryInfo.getLotteryTypeByTag(lotteryTag);
	if(sntuo == 3 || sntuo == 1 || getplayid(LotteryInfo.getId(type,lotteryTag),LotteryInfo.getMethodId(type,playMethod))){
	}else{
		if(parseInt($('#'+lotteryTag+'_modeId').val()) == 8){
			$("#"+lotteryTag+"_random").hide();
		}else{
			$("#"+lotteryTag+"_random").show();
		}
	}
}

/*********** 厘模式 end *****************/

function createRenXuanLayout(lotteryName,playMethod,calcNotes){
	var temp = '<div id="'+lotteryName+'_tab" class="button-grouped flex"><a class="button" id="'+lotteryName+'_tab1"'+playMethod+'>万位</a><a class="button" id="'+lotteryName+'_tab2"'+playMethod+'>千位</a><a class="button" id="'+lotteryName+'_tab3"'+playMethod+'>百位</a><a class="button red" id="'+lotteryName+'_tab4"'+playMethod+'>十位</a><a class="button red" id="'+lotteryName+'_tab5"'+playMethod+'>个位</a></div>';
    $("#"+lotteryName+"_ballView").append(temp);
    bind_checkbox_checked(lotteryName,calcNotes);
}

function createRenXuanSanLayout(lotteryName,playMethod,calcNotes){
	var temp = '<div id="'+lotteryName+'_tab" class="button-grouped flex"><a class="button" id="'+lotteryName+'_tab1"'+playMethod+'>万位</a><a class="button" id="'+lotteryName+'_tab2"'+playMethod+'>千位</a><a class="button red" id="'+lotteryName+'_tab3"'+playMethod+'>百位</a><a class="button red" id="'+lotteryName+'_tab4"'+playMethod+'>十位</a><a class="button red" id="'+lotteryName+'_tab5"'+playMethod+'>个位</a></div>';
    $("#"+lotteryName+"_ballView").append(temp);
    bind_checkbox_checked(lotteryName,calcNotes);
}

function createRenXuanSiLayout(lotteryName,playMethod,calcNotes){
	var temp = '<div id="'+lotteryName+'_tab" class="button-grouped flex"><a class="button" id="'+lotteryName+'_tab1"'+playMethod+'>万位</a><a class="button red" id="'+lotteryName+'_tab2"'+playMethod+'>千位</a><a class="button red" id="'+lotteryName+'_tab3"'+playMethod+'>百位</a><a class="button red" id="'+lotteryName+'_tab4"'+playMethod+'>十位</a><a class="button red" id="'+lotteryName+'_tab5"'+playMethod+'>个位</a></div>';
    $("#"+lotteryName+"_ballView").append(temp);
    bind_checkbox_checked(lotteryName,calcNotes);
}

/**
 * [createQuWeiLayout 趣味]
 * @param  {[type]} lotteryName [description]
 * @return {[type]}             [description]
 */
function createQuWeiLayout(lotteryName){
	$("#"+lotteryName+"_ballView").empty();
	var temp = '<div id="'+lotteryName+'_tab" class="button-grouped flex"><a class="button red" id="'+lotteryName+'_tab1">一帆风顺</a><a class="button" id="'+lotteryName+'_tab2">好事成双</a><a class="button" id="'+lotteryName+'_tab3">三星报喜</a><a class="button" id="'+lotteryName+'_tab4">四季发财</a></div>';
    $("#"+lotteryName+"_ballView").append(temp);
}

//任选绑定点击事件
function bind_checkbox_checked(lotteryType,calcNotes){
	$("#"+lotteryType+"_tab1").on('click', function(event) {
		if ($(this).hasClass("red")) {
			$(this).removeClass('red');
		}else{
			$(this).addClass('red');
		}
		calcNotes();
	});
	$("#"+lotteryType+"_tab2").on('click', function(event) {
		if ($(this).hasClass("red")) {
			$(this).removeClass('red');
		}else{
			$(this).addClass('red');
		}
		calcNotes();
	});
	$("#"+lotteryType+"_tab3").on('click', function(event) {
		if ($(this).hasClass("red")) {
			$(this).removeClass('red');
		}else{
			$(this).addClass('red');
		}
		calcNotes();
	});
	$("#"+lotteryType+"_tab4").on('click', function(event) {
		if ($(this).hasClass("red")) {
			$(this).removeClass('red');
		}else{
			$(this).addClass('red');
		}
		calcNotes();
	});
	$("#"+lotteryType+"_tab5").on('click', function(event) {
		if ($(this).hasClass("red")) {
			$(this).removeClass('red');
		}else{
			$(this).addClass('red');
		}
		calcNotes();
	});
}

/**
 * 创建单式上传
 */
function createSingleLayout(lotteryName,tips){
	$("#"+lotteryName+"_ballView").empty();
	var onkeyup="this.value=this.value.replace(/[^0-9\\s]\D/,\"\")";
	var onblur = "\'onblur\'", click = "\'click\'";
	// var temp = "<textarea style=\"overflow-x:hidden; height:130px \" id=\""+lotteryName+"_single\" onkeyup=\""+onkeyup+"\" onblur=\""+lotteryName+"ValidateData("+onblur+")\"  />";

	var temp = "<textarea style=\"overflow-x:hidden; height:130px\"  id=\""+lotteryName+"_single\"  onblur=\""+lotteryName+"ValidateData("+onblur+")\" oninput=\""+lotteryName+"ValidateData('oninput')\"  />";

	temp += "<p style='position: relative;margin:2px 0 0;height: 35px;'><span id='"+ lotteryName +"_delRepeat' class='smallBtn'>去重复号</span>" +
		"<span class='smallBtn' style='left:50%; margin-left:-40px;' onclick='clearAllContent_single(\""+ lotteryName +"\")'>清空号码</span>" +
		"<span class='smallBtn' onclick=\""+ lotteryName +"ValidateData("+ click +")\" style='right:0'>去错误号</span></p>";

	$("#"+lotteryName+"_ballView").append(temp).append(tips);
	createRebateLayout(lotteryName);
}

//@ 清空单式框内所有内容，并初始化底部注数/金额等信息
function clearAllContent_single(lotteryName) {
	var content = $("#"+ lotteryName +"_single").val();
	if(content){
		$("#"+ lotteryName +"_single").val("");
		eval(lotteryName + 'ValidateData' + '("onblur")'); //初始化底部注数、金额等信息.
	}
}

/**
 * [focusCursorEnd 光标是停在文本框文字的最后]
 * @return {[type]} [description]
 */
function cursorEnd(){
	var e = event.srcElement;
	var r =e.createTextRange();
	r.moveStart("character",e.value.length);
	r.collapse(true);
	r.select();
}

/**
 * [isValid 判断每组数的个数]
 * @param  {[type]}  n     [description]
 * @param  {[type]}  array [description]
 * @return {Boolean}       [description]
 */
function isValid(n,array){
	var isValidData = true;
	for (var i = 0; i < array.length; i++) {
		var temp = array[i];
		if(temp.length != n){
			isValidData = false;
		}
	}
	return isValidData;
}

/**
 * [isZeroValid 判断是否带0]
 * @return {Boolean}       [description]
 */
function isZeroValid(str){
	var isValidData = true;
	if(str > 11){
		isValidData = false;
	}
	return isValidData;
}

/**
 * [isNumRepeat 判断数组每个元素是否有重复数据]
 * @return {Boolean}       [description]
 */
function isNumRepeat(str){
	var isValidData = false;
	if (isNumRepeated(str)) {
		isValidData = true;
	}
	return isValidData;
}

/** [isNumRepeated 判断是否有重复的数据] */
function isNumRepeated(str){
	var isNumRepeat = false;
	for (var i = 0; i < str.length; i++) {
		if(str.indexOf(str.charAt(i),i+1) > 0){
			isNumRepeat = true;
			break;
		}
	}
	return isNumRepeat;
}

/** [isBaoZiHao 判断是否是豹子号] */
function isBaoZiHao(str){
	var isBaoZi = false;
	if(str.charAt(0) == str.charAt(1) && str.charAt(1) == str.charAt(2)){
		isBaoZi = true;
	}
	return isBaoZi;
}

/**
 * [isDuiZiHao 判断是否是对子号]
 * @param  {[type]}  array [description]
 * @return {Boolean}       [description]
 */
function isDuiZiHao(str){
	var isDuiZi = false;
	if(str.charAt(0) == str.charAt(1)){
		isDuiZi = true;
	}
	return isDuiZi;
}

/**
 * [isZuSanHao 判断是否是满足组三]
 * @param  {[type]}  array [description]
 * @return {Boolean}       [description]
 */
function isZuSanHao(str){
	var isZuSan = true;
	if(str.charAt(0) == str.charAt(1) && str.charAt(1) == str.charAt(2) && str.charAt(0) == str.charAt(2)){
		isZuSan = false;
	}
	if(str.charAt(0) != str.charAt(1) && str.charAt(1) != str.charAt(2) && str.charAt(0) != str.charAt(2)){
		isZuSan = false;
	}
	return isZuSan;
}

/**
 * [isZuLiuHao 是否是组六号]
 * @param  {[type]}  array [description]
 * @return {Boolean}       [description]
 */
function isZuLiuHao(str){
	var isZuLiu = true;
	if(str.charAt(0) == str.charAt(1) || str.charAt(1) == str.charAt(2) || str.charAt(0) == str.charAt(2)){
		isZuLiu = false;
	}
	return isZuLiu;
}

/**
 *付款界面，向服务器提交数据
 * @param {Object} paramList 参数列表，每个元素是CheckoutParam对象
 */
function postParams(paramList, succCallback, errcallback,lotteryId,tempIssueNumber,issueJsonList) {
    // console.log("出票界面发送的数据=====：" + '[' + paramList.join(",") +']');
    var params = '{"IssueList":'+ issueJsonList +',"UserBetInfo":{"LotteryCode":'+ lotteryId +',"Bet":[' + paramList.join(",") +'],"IssueNumber":'+ tempIssueNumber + '},"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/UserBet20160412"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data) {
       // console.log("出票界面--提交投注数据，成功后返回的数据：" + JSON.stringify(data));
        if(data.Code == 200){
		    succCallback(data.Data);
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
    }, '正在生成订单');
}
/**
 *秒秒彩付款界面，向服务器提交数据
 * @param {Object} paramList 参数列表，每个元素是CheckoutParam对象
 */
function postParamsMmc(paramList, succCallback, errcallback,lotteryId,maxRebate) {
    // console.log("出票界面发送的数据=====：" + '[' + paramList.join(",") +']');
    var params = '{"UserBetInfo":{"LotteryCode":'+ lotteryId +',"Bet":[' + paramList.join(",") +']},"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/UserBet_mmc"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data) {
       // console.log("出票界面--提交投注数据，成功后返回的数据：" + JSON.stringify(data));
        if (data.Code == 200) {
            succCallback(data.Data);
        } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
    }, '正在开奖中...');
}
/**
 * 去除左边的空格
 * @returns {string}
 * @constructor
 */
String.prototype.LTrim = function() {
	return this.replace(/(^\s*)/g, "");
}


/**
 * 去除右边的空格
 * @returns {string}
 * @constructor
 */
String.prototype.Rtrim = function() {
	return this.replace(/(\s*$)/g, "");
}

/**
 * 判断一个数组包含另一个数组
 * @param a
 * @param b
 */
function isContained(a, b){
	if(!(a instanceof Array) || !(b instanceof Array)) return false;
	if(a.length < b.length) return false;
	var aStr = a.toString();
	for(var i = 0, len = b.length; i < len; i++){
		if(aStr.indexOf(b[i]) == -1) return false;
	}
	return true;
}

/**
 * 处理单式字符串
 * @param str
 */
function handleSingleStr(content){
	var array = [];
	var arr = content.split(/\D/).join("\n").split("\n");
	for(var i = 0;i < arr.length;i++){
		if(arr[i] != ""){
			array.push(arr[i]);
		}
	}
	return array;
}

//@ 原始 - 单式筛选出错误和重复数组 --- Start ---
// baozi: 豹子号; duizi: 对子号; zusan: 组三; zuliu: 组六; numRepeat: 重复数; isZero: 是否带0; zhiXuan: 直选; renXuan: 任选;
function handleSingleStrNew(content) {
	var correctArr = [],
		errorArr = [],
		repetitiveArr = [],
		tempArr = [];
	content.str = content.str.replace(new RegExp(/\s+/g),' ');

	if (content && content.str != ''){
		//pks 直选 和 11选5 任选、前三、前二
		if (content.zhiXuan || content.renXuan){
			var arr = content.str.split(',');
			for(var j = 0;j < arr.length;j++){
				arr[j] = arr[j].trim();
				if (content.zhiXuan && content.weishu == 5 && content.maxNum == 10 && /^((0[1-9])|10)(\s((0[1-9])|10)){1}$/.test(arr[j])){
				    //pks 猜冠亚军单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.zhiXuan && content.weishu == 8 && content.maxNum == 10 && /^((0[1-9])|10)(\s((0[1-9])|10)){2}$/.test(arr[j])){
					//pks 猜前三名单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.zhiXuan && content.weishu == 8 && content.maxNum == 11 && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){2}$/.test(arr[j])){
					//esf 前三直选单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.zhiXuan && content.weishu == 5 && content.maxNum == 11 && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){1}$/.test(arr[j])){
					//esf 前二直选单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 8 && content.maxNum == 11 && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){2}$/.test(arr[j])){
					//esf 前三组选单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 5 && content.maxNum == 11 && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){1}$/.test(arr[j])){
				    //esf 前二组选单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 2 && content.select && /^((0[1-9])|1[01]){1}$/.test(arr[j])){
					tempArr.push(arr[j]);  //esf 任选单式：一中一
				}else if (content.renXuan && content.weishu == 5 && content.select && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){1}$/.test(arr[j])){
					//esf 任选单式：二中二
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 8 && content.select && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){2}$/.test(arr[j])){
					//esf 任选单式：三中三
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 11 && content.select && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){3}$/.test(arr[j])){
					//esf 任选单式：四中四
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 14 && content.select && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){4}$/.test(arr[j])){
					//esf 任选单式：五中五
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 17 && content.select && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){5}$/.test(arr[j])){
					//esf 任选单式：六中五
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 20 && content.select && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){6}$/.test(arr[j])){
					//esf 任选单式：七中五
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 23 && content.select && /^((0[1-9])|1[01])(\s((0[1-9])|1[01])){7}$/.test(arr[j])){
					//esf 任选单式：八中五
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else{
					errorArr.push(arr[j]);
				}
			}
			//重复号
			if (content.renXuan){
				for (var m = 0; m<tempArr.length; m++){
					tempArr[m] = tempArr[m].split(' ').sort().join(' ');
				}
				repetitiveArr = RepeatArr(tempArr);
			}else{
				repetitiveArr = RepeatArr(tempArr);
			}
		//Others - ssc; ssl; 3D; pls; plw.
		}else {
			var arr = content.str.split(' ');
			for(var i = 0;i < arr.length;i++){
				if (arr[i].length != content.weishu || /\D/.test(arr[i]) ){
					errorArr.push(arr[i]);
				}else{
					if (content.baozi && isBaoZiHao(arr[i])){
						errorArr.push(arr[i]);
					}else if (content.duizi && isDuiZiHao(arr[i])){
						errorArr.push(arr[i]);
					}else if (content.zusan && !isZuSanHao(arr[i])){
						errorArr.push(arr[i]);
					}else if (content.zuliu && !isZuLiuHao(arr[i])) {
						errorArr.push(arr[i]);
					}else if (content.numRepeat && isNumRepeat(arr[i])) {
						errorArr.push(arr[i]);
					}else if (content.isZero && !isZeroValid(arr[i])) {
						errorArr.push(arr[i]);
					}else {
						tempArr.push(arr[i]);
					}
				}
			}
			//重复号
			if (content.zusan || content.zuliu || content.numRepeat || content.baozi || content.duizi){
				for (var k = 0; k<tempArr.length; k++){
					tempArr[k] = tempArr[k].split('').sort().join('');
				}
				repetitiveArr = RepeatArr(tempArr);
			}else {
				repetitiveArr = RepeatArr(tempArr);
			}
		}
	}
	showWrongSingleMsg(errorArr, repetitiveArr);

	if (repetitiveArr.length > 0) {
		correctArr = uniqueArr(tempArr);
	}else{
		correctArr = tempArr;
	}
	return correctArr;
}

//@ 筛选出重复的号码
function RepeatArr(array){
	var obj = {}, rep=[], val, type;

	if(array.length == 1){  //010203; 010101
		var tempArr = [];
		for(var i = 0; i < array[0].length/2; i++){
			tempArr.push(array[0].substr(i*2,i*2+2));
		}
		for (var i = 0; i < tempArr.length; i++) {
			val = tempArr[i];
			type = typeof val;
			if (!obj[val]) {
				obj[val] = [type];
			}else{
				rep.push(val);  //重复的号
			}
		}
		return rep;
	}else {  //01 02 03; 01 01 01
		for (var i = 0; i < array.length; i++) {
			val = array[i];
			type = typeof val;
			if (!obj[val]) {
				obj[val] = [type];
			}else{
				rep.push(val);  //重复的号
			}
		}
		return rep;
	}
}

//@ 数组去重
function uniqueArr(arr){
	var uniqueArr = [];
	$.each(arr, function(i, el){
		if($.inArray(el, uniqueArr) === -1) {
			uniqueArr.push(el);
		}
	});
	return uniqueArr;
}

//@ 显示错误和重复号码
function showWrongSingleMsg(errorArr, repetitiveArr) {
	if ((errorArr.length > 0 && errorArr.join('') != "") || repetitiveArr.length > 0){
		var message = "";
		if(repetitiveArr.length == 0){
			message = "<span style='color:#e12048'>错误的号码,已自动帮您过滤: </span>"+ errorArr.join(', ') +"";
		}else if (errorArr.length == 0 || errorArr.join('')==""){
			message = "<span style='color:#e12048'>重复的号码,已自动帮您过滤: </span>"+ repetitiveArr.join(', ') +"";
		}else {
			message = "<span style='color:#e12048'>错误的号码,已自动帮您过滤: </span>"+errorArr.join(', ')+"<br/><br/><span style='color:#e12048'>重复的号码,已自动帮您过滤: </span>"+repetitiveArr.join(', ')+"";
		}

		$.ui.popup(
			{
				title:"提示：",
				message: message,
				cancelText:"确 定",
				cancelCallback:
					function(){
					},
				cancelOnly:true
			});

		$("#afui .afPopup").css('top','30px');
		$("#afui .afPopup > div").css({'max-height':'300px','text-align':'justify','word-break':'break-all','padding':'2px 10px','letter-spacing':'1px'});
		var myScroller =  $("#afui .afPopup > div").scroller({
			verticalScroll : true,
			horizontalScroll : false,
			vScrollCSS: "afScrollbar",
			autoEnable : true
		});
	}
}
// 原始单式 --- End ---

/* 新单式 ------- 去重与错误分离 Start ------- */

/* 单独去错误号 */
function handleSingleStr_deleteErr(content,type) {
	var	errorArr = [],
		tempArr = [];

	if(type == "oninput"){
		content.str = content.str.replace(new RegExp(/\s+/g),' ');
	}else{
		content.str = content.str.replace(new RegExp(/\s+/g),' ').trim();
	}

	if (content && content.str != ' '){
		//pks 直选 和 11选5 任选、前三、前二
		if (content.zhiXuan || content.renXuan){
			var arr = content.str.split(',');
			for(var j = 0;j < arr.length;j++){
				// if(type != 'oninput'){
					arr[j] = arr[j].trim();
				// }
				if (content.zhiXuan && content.weishu == 5 && content.maxNum == 10 && /^((0[1-9])|10)((\s)*((0[1-9])|10)){1}$/.test(arr[j])){
					//pks 猜冠亚军单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.zhiXuan && content.weishu == 8 && content.maxNum == 10 && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){3}$/.test(arr[j])){
					//pks 猜前三名单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.zhiXuan && content.weishu == 11 && content.maxNum == 11 && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){4}$/.test(arr[j])){
					//pks 猜前四名单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.zhiXuan && content.weishu == 14 && content.maxNum == 14 && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){5}$/.test(arr[j])){
					//pks 猜前五名单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
//				}else if (content.zhiXuan && content.weishu == 8 && content.maxNum == 11 && /^((0[1-9])|1[01])((\s)*((0[1-9])|1[01])){2}$/.test(arr[j])){
				}else if (content.zhiXuan && content.weishu == 8 && content.maxNum == 11 && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){3}$/.test(arr[j])){
					//esf 前三直选单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.zhiXuan && content.weishu == 5 && content.maxNum == 11 && /^((0[1-9])|1[01])((\s)*((0[1-9])|1[01])){1}$/.test(arr[j])){
					//esf 前二直选单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 8 && content.maxNum == 11 && /^((0[1-9])|1[01])((\s)*((0[1-9])|1[01])){2}$/.test(arr[j])){
					//esf 前三组选单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 5 && content.maxNum == 11 && /^((0[1-9])|1[01])((\s)*((0[1-9])|1[01])){1}$/.test(arr[j])){
					//esf 前二组选单式
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 2 && content.select && /^((0[1-9])|1[01]){1}$/.test(arr[j])){
					tempArr.push(arr[j]);  //esf 任选单式：一中一
				}else if (content.renXuan && content.weishu == 5 && content.select && /^((0[1-9])|1[01])((\s)*((0[1-9])|1[01])){1}$/.test(arr[j])){
					//esf 任选单式：二中二
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 8 && content.select && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){3}$/.test(arr[j])){
					//esf 任选单式：三中三
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 11 && content.select && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){4}$/.test(arr[j])){
					//esf 任选单式：四中四
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 14 && content.select && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){5}$/.test(arr[j])){
					//esf 任选单式：五中五
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 17 && content.select && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){6}$/.test(arr[j])){
					//esf 任选单式：六中五
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 20 && content.select && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){7}$/.test(arr[j])){
					//esf 任选单式：七中五
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else if (content.renXuan && content.weishu == 23 && content.select && /^(?:((\s)*(0[1-9])|10)(?!.*?\1)){8}$/.test(arr[j])){
					//esf 任选单式：八中五
					RepeatArr(arr[j].split(" ")).length == 0 ? tempArr.push(arr[j]) : errorArr.push(arr[j]);
				}else{
					errorArr.push(arr[j]);
				}
			}
			//Others - ssc; ssl; 3D; pls; plw.
		}else {
			var arr = content.str.split(' ');
			for(var i = 0;i < arr.length;i++){
				if (arr[i].length != content.weishu || /\D/.test(arr[i]) ){
					errorArr.push(arr[i]);
				}else{
					if (content.baozi && isBaoZiHao(arr[i])){
						errorArr.push(arr[i]);
					}else if (content.duizi && isDuiZiHao(arr[i])){
						errorArr.push(arr[i]);
					}else if (content.zusan && !isZuSanHao(arr[i])){
						errorArr.push(arr[i]);
					}else if (content.zuliu && !isZuLiuHao(arr[i])) {
						errorArr.push(arr[i]);
					}else if (content.numRepeat && isNumRepeat(arr[i])) {
						errorArr.push(arr[i]);
					}else if (content.isZero && !isZeroValid(arr[i])) {
						errorArr.push(arr[i]);
					}else {
						tempArr.push(arr[i]);
					}
				}
			}
		}
	}
	
//	for (var k = 0; k<tempArr.length; k++){
//		tempArr[k] = tempArr[k].replace(" ","");
//	}
	

	if (type == 'click'){  //点击"去错误号"按钮时
		showWrongSingleErrMsg(errorArr);
		//去除错误号，保留正确号和重复号
		return {length:tempArr.length, num:tempArr};
	}else if (type == 'onblur' && (errorArr.length == 0 || errorArr.join('') == "")){  //单式框失去焦点，无错误号时
		return {length:tempArr.length, num:tempArr, errorNum:errorArr};
	}else if(type == 'onblur' && errorArr.length > 0 && errorArr.join('') != "") {  //单式框失去焦点，有错误号时
		toastUtils.showToast('您有错误号码,请先去除错误号');
		return {length:tempArr.length, num:arr, errorNum:errorArr};
	}else if(type == 'oninput' && content.str != " "){  //框内实时输入数据时
		return {length:tempArr.length, num:content.str.split(',')};
	}else if(type == 'submit'){  //点击各个彩种页的"选号"按钮时
		//去除错误号，保留正确号和重复号
		return {length:tempArr.length, num:tempArr};
	}else{
		return {length:0, num:[]};
	}
}

/* 单独去重复号 */
function handleSingleStr_deleteRepeat(content) {
	//先执行失去焦点并检查错误号，再执行去重复
	var IsErr = handleSingleStr_deleteErr(content,'onblur');
	if (IsErr.errorNum.length){
		return {num:IsErr.num, length:IsErr.length}; //返回所有数据（框内展示），正确号码的长度（注数）
	}
	//去重Start
	var correctArr = [],
		tempArr = [],
		repetitiveArr = [];
	content.str = content.str.replace(new RegExp(/\s+/g),' ').trim();

	if (content && content.str != ' '){

		//pks 直选 和 11选5 任选、前三、前二
		if (content.renXuan){
			tempArr = content.str.replace(/\s/g,'').split(',');  //去注与注之间的重复号（包含或不包含空格）
			for (var m = 0; m<tempArr.length; m++){
				tempArr[m] = tempArr[m].split(' ').sort().join(' ');
			}
			repetitiveArr = RepeatArr(tempArr);
		}else if (content.zhiXuan){
			tempArr = content.str.replace(/\s/g,'').split(','); //去注与注之间的重复号（包含或不包含空格）
			repetitiveArr = RepeatArr(tempArr);
		}else{  //Others - ssc; ssl; 3D; pls; plw.
			tempArr = content.str.split(' ');
			if (content.zusan || content.zuliu || content.numRepeat || content.baozi || content.duizi){
				for (var k = 0; k<tempArr.length; k++){
					tempArr[k] = tempArr[k].split('').sort().join('');
				}
				repetitiveArr = RepeatArr(tempArr);
			}else {
				repetitiveArr = RepeatArr(tempArr);
			}
		}

		showWrongSingleRepMsg(repetitiveArr);

		if (repetitiveArr.length > 0) {
			correctArr = uniqueArr(tempArr);
		}else{
			correctArr = tempArr;
		}
		return {num: correctArr,length:correctArr.length} ;
	}
}

function showWrongSingleErrMsg(errorArr) {
	if (errorArr.length > 0 && errorArr.join('') != ""){
		var message = "<span style='color:#e12048'>错误的号码,已自动帮您过滤: </span>"+ errorArr.join(', ') +"";
		$.ui.popup(
			{
				title:"提示：",
				message: message,
				cancelText:"确 定",
				cancelCallback:
					function(){
					},
				cancelOnly:true
			});
		$("#afui .afPopup").css('top','30px');
		$("#afui .afPopup > div").css({'max-height':'300px','text-align':'justify','word-break':'break-all','padding':'2px 10px','letter-spacing':'1px'});
		var myScroller =  $("#afui .afPopup > div").scroller({
			verticalScroll : true,
			horizontalScroll : false,
			vScrollCSS: "afScrollbar",
			autoEnable : true
		});
	}else{
		toastUtils.showToast('未发现错误号码');
	}
}

function showWrongSingleRepMsg(repetitiveArr) {
	 if (repetitiveArr.length > 0 ){
		var message = "<span style='color:#e12048'>重复的号码,已自动帮您过滤: </span>"+ repetitiveArr.join(', ') +"";
		$.ui.popup(
			{
				title:"提示：",
				message: message,
				cancelText:"确 定",
				cancelCallback:
					function(){
					},
				cancelOnly:true
			});
		 $("#afui .afPopup").css('top','30px');
		 $("#afui .afPopup > div").css({'max-height':'300px','text-align':'justify','word-break':'break-all','padding':'2px 10px','letter-spacing':'1px'});
		 var myScroller =  $("#afui .afPopup > div").scroller({
			 verticalScroll : true,
			 horizontalScroll : false,
			 vScrollCSS: "afScrollbar",
			 autoEnable : true
		 });
	}else{
		toastUtils.showToast('未发现重复号码');
	 }
}

/* 单式 ------- 去重与错误分离 End ------- */

/* 计算奖金和盈利 */
function calcAwardWin(lotteryTag,playMethod,jiXuanObj) {
	var playInfo = jsonUtils.toObject(localStorageUtils.getParam(lotteryTag+"_playInfo"));
	if (!playInfo){
		return;
	}
	var playMethodCode = LotteryInfo.getPlayMethodId(LotteryInfo.getLotteryTypeByTag(lotteryTag),lotteryTag,playMethod);
	$.each(playInfo,function (k,v) {
		if (v.PlayCode == playMethodCode){
			
			var minAward = v['AwardLevelInfo'][v['AwardLevelInfo'].length-1]['AwardAmount'];
			var maxAward = v['AwardLevelInfo'][0]['AwardAmount'];
			$.each(v['AwardLevelInfo'],function (key,val) {
					var awardAmount = Number(val['AwardAmount']);
					minAward = Math.min(minAward,awardAmount);
					maxAward = Math.max(maxAward,awardAmount);
				}
			);
			if(jiXuanObj){ //机选模式，默认为元模式/单注/单倍
				var product = bigNumberUtil.multiply(parseInt(jiXuanObj.rebates) * parseInt(jiXuanObj.multiple),2);
				var decPoint = 2;  //Decimal Point
				showAwardWin(lotteryTag,minAward,maxAward,decPoint,product);
			}else{
				if((lotteryTag == "pks" || lotteryTag == "xyft" || lotteryTag == "txsc" ) && playMethodCode.substr(playMethodCode.length-2,2) == 51){//pks 新玩法 冠亚和值 3~19  （3、4、18、19）（5、6、16、17）（7、8、14、15）（9、10、12、13）（11）
					var beiNum = 1; //利润率追号，奖金和倍数无关，始终按1倍算   
					var product = bigNumberUtil.multiply(parseInt($("#"+lotteryTag+"_fandian").val()) * parseInt(beiNum),2);
					var divided = bigNumberUtil.divided(product,2000);
					
					
					//元角分厘   变化    号码下方的返奖率随之变化   倍率
					var now_modeId = 1;
					if($("#"+lotteryTag+"_modeId").val() == "4"){ 		         //元
						now_modeId = 1;
					}else if($("#"+lotteryTag+"_modeId").val() == "2"){ 		 //角
						now_modeId = 0.1;
					}else if($("#"+lotteryTag+"_modeId").val() == "1"){ 		 //分
						now_modeId = 0.01;
					}else if($("#"+lotteryTag+"_modeId").val() == "8"){ 		 //厘
						now_modeId = 0.001;
					}
					
					var now_minAwa = strSliceToNum(bigNumberUtil.multiply(v['AwardLevelInfo'][0]['AwardAmount'],divided),2);
					now_minAwa = bigNumberUtil.multiply(now_minAwa,now_modeId);
					if(now_minAwa.toString().split(".")[1].split("").length >4){
						now_minAwa = now_minAwa.toString().substr(0,6);
					}
					$("#"+lotteryTag+"_ballView span p")[0].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[1].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[15].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[16].innerHTML = now_minAwa;
					
					now_minAwa = strSliceToNum(bigNumberUtil.multiply(v['AwardLevelInfo'][1]['AwardAmount'],divided),2);
					now_minAwa = bigNumberUtil.multiply(now_minAwa,now_modeId);
					if(now_minAwa.toString().split(".")[1].split("").length >4){
						now_minAwa = now_minAwa.toString().substr(0,6);
					}
					$("#"+lotteryTag+"_ballView span p")[2].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[3].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[13].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[14].innerHTML = now_minAwa;
					
					now_minAwa = strSliceToNum(bigNumberUtil.multiply(v['AwardLevelInfo'][2]['AwardAmount'],divided),2);
					now_minAwa = bigNumberUtil.multiply(now_minAwa,now_modeId);
					if(now_minAwa.toString().split(".")[1].split("").length >4){
						now_minAwa = now_minAwa.toString().substr(0,6);
					}
					$("#"+lotteryTag+"_ballView span p")[4].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[5].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[11].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[12].innerHTML = now_minAwa;
					
					now_minAwa = strSliceToNum(bigNumberUtil.multiply(v['AwardLevelInfo'][3]['AwardAmount'],divided),2);
					now_minAwa = bigNumberUtil.multiply(now_minAwa,now_modeId);
					if(now_minAwa.toString().split(".")[1].split("").length >4){
						now_minAwa = now_minAwa.toString().substr(0,6);
					}
					$("#"+lotteryTag+"_ballView span p")[6].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[7].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[9].innerHTML = now_minAwa;
					$("#"+lotteryTag+"_ballView span p")[10].innerHTML = now_minAwa;
					
					now_minAwa = strSliceToNum(bigNumberUtil.multiply(v['AwardLevelInfo'][4]['AwardAmount'],divided),2);
					now_minAwa = bigNumberUtil.multiply(now_minAwa,now_modeId);
					if(now_minAwa.toString().split(".")[1].split("").length >4){
						now_minAwa = now_minAwa.toString().substr(0,6);
					}
					$("#"+lotteryTag+"_ballView span p")[8].innerHTML = now_minAwa;
				}
				
				
				var beiNum = 1; //利润率追号，奖金和倍数无关，始终按1倍算
				product = bigNumberUtil.multiply(parseInt($("#"+lotteryTag+"_fandian").val()) * parseInt(beiNum),2);
				var divided = bigNumberUtil.divided(product,2000);
				var minAwa = strSliceToNum(bigNumberUtil.multiply(minAward,divided),2);
				var maxAwa = strSliceToNum(bigNumberUtil.multiply(maxAward,divided),2);
				if($("#"+lotteryTag+"_modeId").val() == "8"){ 		 //厘
					decPoint = 4;
					var minResult = bigNumberUtil.multiply(minAwa,0.001);
					var maxResult = bigNumberUtil.multiply(maxAwa,0.001);
					showAwardWin(lotteryTag,minResult,maxResult,decPoint);
				}else if ($("#"+lotteryTag+"_modeId").val() == "2"){  //角
					decPoint = 4;
					minResult = bigNumberUtil.multiply(minAwa,0.1);
					maxResult = bigNumberUtil.multiply(maxAwa,0.1);
					showAwardWin(lotteryTag,minResult,maxResult,decPoint);
				}else if ($("#"+lotteryTag+"_modeId").val() == "1"){  //分
					decPoint = 4;
					minResult = bigNumberUtil.multiply(minAwa,0.01);
					maxResult = bigNumberUtil.multiply(maxAwa,0.01);
					showAwardWin(lotteryTag,minResult,maxResult,decPoint);
				}else{   											  //元
					decPoint = 2;
					minResult = Number(minAwa);
					maxResult = Number(maxAwa);
					showAwardWin(lotteryTag,minResult,maxResult,decPoint);
				}
			}
		}
	});
}

/* 显示奖金和盈利 */
function showAwardWin(lotteryTag,minAwa,maxAwa,decPoint) {
	var beiNumber = parseInt($("#"+lotteryTag+"_beiNum").val());
	var minAwardWithBei = strSliceToNum(bigNumberUtil.multiply(minAwa,beiNumber),decPoint);
	var maxAwardWithBei = strSliceToNum(bigNumberUtil.multiply(maxAwa,beiNumber),decPoint);
	var minWinWithBei = strSliceToNum(bigNumberUtil.minus(minAwardWithBei,Number($('#'+lotteryTag+'_money').text())),decPoint);
	var maxWinWithBei = strSliceToNum(bigNumberUtil.minus(maxAwardWithBei,Number($('#'+lotteryTag+'_money').text())),decPoint);
	if ($('#'+lotteryTag+'_money').text()=="0"){
		$('#'+lotteryTag+'_minAwardWithBei').text(0);
		$('#'+lotteryTag+'_maxAwardWithBei').text("");
		$('#'+lotteryTag+'_minWinWithBei').text(0);
		$('#'+lotteryTag+'_maxWinWithBei').text("");
	}else{
		if (minAwa == maxAwa){
			//用于利润率追号计算的单倍玩法奖金
			$('#'+lotteryTag+'_minAward').text(strSliceToNum(minAwa,4));
			$('#'+lotteryTag+'_maxAward').text("");
			//用于底部显示的中奖奖金和盈利
			$('#'+lotteryTag+'_minAwardWithBei').text(minAwardWithBei);
			$('#'+lotteryTag+'_maxAwardWithBei').text("");
			$('#'+lotteryTag+'_minWinWithBei').text(minWinWithBei);
			$('#'+lotteryTag+'_maxWinWithBei').text("");
		}else {
			//用于利润率追号计算的单倍玩法奖金
			$('#'+lotteryTag+'_minAward').text(minAwa);
			$('#'+lotteryTag+'_maxAward').text(maxAwa);
			//用于底部显示的中奖奖金和盈利
			$('#'+lotteryTag+'_minAwardWithBei').text(minAwardWithBei);
			$('#'+lotteryTag+'_maxAwardWithBei').text('~'+ maxAwardWithBei);
			$('#'+lotteryTag+'_minWinWithBei').text(minWinWithBei);
			$('#'+lotteryTag+'_maxWinWithBei').text('~' + maxWinWithBei);
		}
	}
}

/* clear content in Award and Win when click the Button of qingkong */
function clearAwardWin(lotteryTag) {
	$('#'+lotteryTag+'_minAwardWithBei').text(0);
	$('#'+lotteryTag+'_maxAwardWithBei').text("");
	$('#'+lotteryTag+'_minWinWithBei').text(0);
	$('#'+lotteryTag+'_maxWinWithBei').text("");
}

/*
 * 字符串，保留小数点后n位,只截取无四舍五入
 * @param str [String or Number] 原字符串或数字
 * @param num [Int >= 1] 保留位数,应为大于等于0的整数
 */
function strSliceToNum(str,num) {
	str = str + '';
	var point = str.indexOf('.');
	if(point != -1 && parseInt(num) > 0){
		return Number(str.slice(0, point+num+1));
	}else if(point != -1 && parseInt(num) == 0){
		return Number(str.slice(0, point+num));
	}else{
		return Number(str);
	}
}

/* 获取单挑和单期最高奖金数据 */
function getLotteryMaxBonus(lotteryTag) {
	var danTiaoObj = {},
		danQiObj = {};
	var mode = Number(localStorageUtils.getParam("Mode"));
	var lotteryID = LotteryInfo.getLotteryIdByTag(lotteryTag);
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetLotteryMaxBonus","LotteryCode":'+ lotteryID +'}';
	ajaxUtil.ajaxByAsyncPost(null,params,function(data) {
		if (data.Code == 200){
			var bonusInfo = data.Data.LotteryMaxBonus;
			$.each(bonusInfo,function (key,val) {
				if (val.Sign == 2){  //单期
					danQiObj[val.SingleStageCode] = val.MaxAmt;
				}else if(val.Sign == 1){  //单挑
					danTiaoObj[val.PlayCode] = {'soloAmt':val.SoloAmt, 'soloNote':val.SoloNote };
				}
			});
			//后台控制开关
			if ((mode & 64) == 64){
				localStorageUtils.setParam('danTiaoBonus',jsonUtils.toString(danTiaoObj));
			}
			if ((mode & 128) == 128){
				localStorageUtils.setParam('danQiBonus',jsonUtils.toString(danQiObj));
			}
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	}, null);

	//@独立需求，在投注页显示余额，与单挑单期无关，为了统一调用和修改而放置于此
	//定时刷新投注页，（秒秒彩）出票页，追号页余额。
	showBalance();
	setIntervalMoney = setInterval(function () {
		showBalance();
	},10000);
	//@ 走势图
	showTrend(lotteryTag);
}

/* 获取单挑最高奖金值，并提示 */
function getDanTiaoBonus(lotteryTag,playMethod) {
	var danTiaoInfo = jsonUtils.toObject(localStorageUtils.getParam('danTiaoBonus')),
		lotteryType = LotteryInfo.getLotteryTypeByTag(lotteryTag),
		playMethodID = LotteryInfo.getPlayMethodId(lotteryType, lotteryTag, playMethod);
		
	//2019 5.21 新加
	if((lotteryTag == "pks" || lotteryTag == "xyft" || lotteryTag == "txsc" ) && (playMethod ==32 || playMethod ==33 || playMethod ==34)){//pks 新玩法  大小单双  一个球是一个玩法  所以不管多少注都提示单挑
		toastUtils.showToast('您所投注内容为单挑玩法，最高奖金为 '+ danTiaoInfo[playMethodID]['soloAmt'] +' 元');
	}else{
		if ( danTiaoInfo && danTiaoInfo.hasOwnProperty(playMethodID) && danTiaoInfo[playMethodID]['soloNote'] >= parseInt($('#'+lotteryTag+'_zhushu').html()) ){
			toastUtils.showToast('您所投注内容为单挑玩法，最高奖金为 '+ danTiaoInfo[playMethodID]['soloAmt'] +' 元');
		}
	}

//	if ( danTiaoInfo && danTiaoInfo.hasOwnProperty(playMethodID) && danTiaoInfo[playMethodID]['soloNote'] >= parseInt($('#'+lotteryTag+'_zhushu').html()) ){
//		toastUtils.showToast('您所投注内容为单挑玩法，最高奖金为 '+ danTiaoInfo[playMethodID]['soloAmt'] +' 元');
//	}
}

/* 获取单期最高奖金值 */
function getDanQiBonus(lotteryTag) {
	var lotteryID = LotteryInfo.getLotteryIdByTag(lotteryTag);

	/*var type;
	switch (LotteryInfo.getLotteryTypeByTag(lotteryTag)){
		case 'ssc':
			type = '1001';	break;
		case 'esf':
			type = '2001';	break;
		case 'sd':
			type = '3001';	break;
		case 'pls':
			type = '4001';	break;
		case 'plw':
			type = '5001';	break;
		case 'ssl':
			type = '6001';	break;
		case 'kl8':
			type = '7001';	break;
		case 'pks':
			type = '8001';	break;
		case 'k3':
			type = '9001';	break;
		case 'klsf':
			type = '10001';	break;
		default:
			type = '1001';	break;
	}*/

	var danQiInfo = jsonUtils.toObject(localStorageUtils.getParam('danQiBonus'));
	if (danQiInfo && danQiInfo.hasOwnProperty(lotteryID) && danQiInfo[lotteryID]){
		return '该彩种单期最高奖金为'+ danQiInfo[lotteryID] +'元<br>';
	}else{
		return "";
	}
}

//在投注页显示彩种余额
function showBalance(){
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


//@ 加载走势图入口
function showTrend(lotteryTag) {
	if(	$(".menu-links")){
		$(".menu-links").remove();
	}

	if(lotteryTag == "mmc"){
		return;
	}
	var ele = ('<div class="menu-links">' +
		'        <ul class="toggle-menu">' +
		'            <li class="toggle-bar">' +
		'                <span class="toggle-menu-bar"></span>' +
		'                <span class="toggle-menu-bar"></span>' +
		'                <span class="toggle-menu-bar"></span>' +
		'            </li>' +
		'            <li class="toggle-list" style="display: none;">' +
		'                <ul>' +
		'                    <li><a class="right2" onclick="jumpToLotteryHelp(\''+ lotteryTag +'\')"></a></li>' +
		'                    <li><a class="trend"  id="trend_'+lotteryTag+'"></a></li>' +
		'                </ul>' +
		'            </li>' +
		'        </ul>' +
		'    </div>');

	$("#"+ lotteryTag +"PageHeader").children("a.right2").remove();
	$("#"+ lotteryTag +"PageHeader").append(ele);

	$(".toggle-bar").off("click");
	$(".toggle-bar").on("click",function () {
		$(".toggle-list").toggle("fast");
	});

	$("#trend_"+ lotteryTag +"").off("click");
	$("#trend_"+ lotteryTag +"").on("click",function () {
		var lotteryId = LotteryInfo.getLotteryIdByTag(lotteryTag);
		var url = trend_url + lotteryId;
		window.open(url,"_self");
	});
}

//跳转到彩种帮助页面
function jumpToLotteryHelp(lotteryTag){
	//清空 LotteryUtil.js 中的开奖定时器
	if(typeof(periodTimer) != "undefined" && periodTimer ){
		clearInterval(periodTimer);
	}
	createInitPanel_Fun("lottery_"+ lotteryTag +"_help",true);
}

//获取金额
function getMyMoney() {
	ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}',function(data){
		if (data.Code == 200) {
			var lotteryMoney = data.Data.lotteryMoney;
			var walletLockMoney = data.Data.freezeMoney;
			localStorageUtils.setParam("lotteryMoney",parseFloat(lotteryMoney));
			localStorageUtils.setParam("walletLockMoney", parseFloat(walletLockMoney));
		}else {
			toastUtils.showToast(data.Msg);
		}
	},null);
}

////倍投输入框限制输入大小
//function onkeyup_beitou(this) {
//	this.value=this.value.replace(/\D/g,'')
//	var MaxBetMultiple = localStorageUtils.getParam("MaxBetMultiple");
//	if(number(this.value) >= number(MaxBetMultiple)){
//		this.value = MaxBetMultiple;
//	}
//}






function createFive_pks_new(lotteryName,playType,numArray,title,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	//创建万位
	var wanRedBallLayout = new createFive_pks_new_Html();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"divId":lotteryName+"_ballView",
		"text":title[0],
		"num":numArray,
		"playType":playType,
		"lottery_playType":playType_line1
	}
	wanRedBallLayout.create(wanParams,function(clickedBall){
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line1"]=[];
			LotteryStorage[lotteryName]["line1"].push(clickedBall.text());
		}else{
			LotteryStorage[lotteryName]["line1"].pop(clickedBall.text());
		}
		//计算注数
		calcNotes();
	});
	
	//创建千位
	var qianRedBallLayout = new createFive_pks_new_Html();
	var playType_line2 = lotteryName+"_line2";
	var qianParams = {
		"divId":lotteryName+"_ballView",
		"text":title[1],
		"num":numArray,
		"playType":playType,
		"lottery_playType":playType_line2
	}
	qianRedBallLayout.create(qianParams,function(clickedBall){
		
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line2"]=[];
			LotteryStorage[lotteryName]["line2"].push(clickedBall.text());
		}else{
			LotteryStorage[lotteryName]["line2"].pop(clickedBall.text());
		}
		//计算注数
		calcNotes();
	});

	//创建百位
	var baiRedBallLayout = new createFive_pks_new_Html();
	var playType_line3 = lotteryName+"_line3";
	var qianParams = {
		"divId":lotteryName+"_ballView",
		"text":title[2],
		"num":numArray,
		"playType":playType,
		"lottery_playType":playType_line3
	}
	qianRedBallLayout.create(qianParams,function(clickedBall){
		
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line3"]=[];
			LotteryStorage[lotteryName]["line3"].push(clickedBall.text());
		}else{
			LotteryStorage[lotteryName]["line3"].pop(clickedBall.text());
		}
		//计算注数
		calcNotes();
	});

	//创建十位
	var shiRedBallLayout = new createFive_pks_new_Html();
	var playType_line4 = lotteryName+"_line4";
	var qianParams = {
		"divId":lotteryName+"_ballView",
		"text":title[3],
		"num":numArray,
		"playType":playType,
		"lottery_playType":playType_line4
	}
	qianRedBallLayout.create(qianParams,function(clickedBall){
		
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line4"]=[];
			LotteryStorage[lotteryName]["line4"].push(clickedBall.text());
		}else{
			LotteryStorage[lotteryName]["line4"].pop(clickedBall.text());
		}
		//计算注数
		calcNotes();
	});

	//创建个位
	var geRedBallLayout = new createFive_pks_new_Html();
	var playType_line5 = lotteryName+"_line5";
	var qianParams = {
		"divId":lotteryName+"_ballView",
		"text":title[4],
		"num":numArray,
		"playType":playType,
		"lottery_playType":playType_line5
	}
	qianRedBallLayout.create(qianParams,function(clickedBall){
		
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line5"]=[];
			LotteryStorage[lotteryName]["line5"].push(clickedBall.text());
		}else{
			LotteryStorage[lotteryName]["line5"].pop(clickedBall.text());
		}
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

function createFive_pks_new_Html(){
	var layoutParams = {
		"divId":"",
		"text":"",
		"num":[],
		"lottery_playType":"",
		"playType":""
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
		var $betContent = $('<div class="ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		
		//大
		var $ballLi = $('<li></li>');
		var $ballSpan_1 = "";
		var lotteryType = LotteryInfo.getLotteryTypeByTag(getLayoutParam("lottery_playType").split("_")[0]);
		$ballSpan_1 = $('<span id="'+ getLayoutParam("lottery_playType") + "0"+ '" class="redBalls">'+ getLayoutParam("num")[0] +'</span>');
		$ballSpan_1.on('click',function(event){
			$(this).toggleClass("redBalls_active");
			clickBallCallBack($(this));
			
			if($ballSpan_2.hasClass("redBalls_active")){
				$ballSpan_2.removeClass("redBalls_active");
			}
			if($ballSpan_3.hasClass("redBalls_active")){
				$ballSpan_3.removeClass("redBalls_active");
			}
			if($ballSpan_4.hasClass("redBalls_active")){
				$ballSpan_4.removeClass("redBalls_active");
			}
		});
		$ballLi.append($ballSpan_1);
		$ballUl.append($ballLi);
		//小
		var $ballLi_2 = $('<li></li>');
		var $ballSpan_2 = "";
		var lotteryType = LotteryInfo.getLotteryTypeByTag(getLayoutParam("lottery_playType").split("_")[0]);
		$ballSpan_2 = $('<span id="'+ getLayoutParam("lottery_playType") + "1"+ '" class="redBalls">'+ getLayoutParam("num")[1] +'</span>');
		$ballSpan_2.on('click',function(event){
			$(this).toggleClass("redBalls_active");
			clickBallCallBack($(this));
			
			if($ballSpan_1.hasClass("redBalls_active")){
				$ballSpan_1.removeClass("redBalls_active");
			}
			if($ballSpan_3.hasClass("redBalls_active")){
				$ballSpan_3.removeClass("redBalls_active");
			}
			if($ballSpan_4.hasClass("redBalls_active")){
				$ballSpan_4.removeClass("redBalls_active");
			}
		});
		$ballLi_2.append($ballSpan_2);
		$ballUl.append($ballLi_2);
		
		
		//单
		var $ballLi3 = $('<li></li>');
		var $ballSpan_3 = "";
		var lotteryType = LotteryInfo.getLotteryTypeByTag(getLayoutParam("lottery_playType").split("_")[0]);
		$ballSpan_3 = $('<span id="'+ getLayoutParam("lottery_playType") + "2"+ '" class="redBalls">'+ getLayoutParam("num")[2] +'</span>');
		$ballSpan_3.on('click',function(event){
			$(this).toggleClass("redBalls_active");
			clickBallCallBack($(this));
			
			if($ballSpan_1.hasClass("redBalls_active")){
				$ballSpan_1.removeClass("redBalls_active");
			}
			if($ballSpan_2.hasClass("redBalls_active")){
				$ballSpan_2.removeClass("redBalls_active");
			}
			if($ballSpan_4.hasClass("redBalls_active")){
				$ballSpan_4.removeClass("redBalls_active");
			}
		});
		$ballLi3.append($ballSpan_3);
		$ballUl.append($ballLi3);
		//双
		var $ballLi_4 = $('<li></li>');
		var $ballSpan_4 = "";
		var lotteryType = LotteryInfo.getLotteryTypeByTag(getLayoutParam("lottery_playType").split("_")[0]);
		$ballSpan_4 = $('<span id="'+ getLayoutParam("lottery_playType") + "3"+ '" class="redBalls">'+ getLayoutParam("num")[3] +'</span>');
		$ballSpan_4.on('click',function(event){
			$(this).toggleClass("redBalls_active");
			clickBallCallBack($(this));
			
			if($ballSpan_1.hasClass("redBalls_active")){
				$ballSpan_1.removeClass("redBalls_active");
			}
			if($ballSpan_2.hasClass("redBalls_active")){
				$ballSpan_2.removeClass("redBalls_active");
			}
			if($ballSpan_3.hasClass("redBalls_active")){
				$ballSpan_3.removeClass("redBalls_active");
			}
		});
		$ballLi_4.append($ballSpan_4);
		$ballUl.append($ballLi_4);
		
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

function createOne_pks_new(lotteryName,playType,numArray,title,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	
	//创建冠亚和  大小单双
	var wanRedBallLayout = new createFive_pks_new_Html();
	var playType_line1 = lotteryName+"_line1";
	var wanParams = {
		"divId":lotteryName+"_ballView",
		"text":title[0],
		"num":numArray,
		"playType":playType,
		"lottery_playType":playType_line1
	}
	wanRedBallLayout.create(wanParams,function(clickedBall){
		if(clickedBall.hasClass("redBalls_active")){
			LotteryStorage[lotteryName]["line1"]=[];
			LotteryStorage[lotteryName]["line1"].push(clickedBall.text());
		}else{
			LotteryStorage[lotteryName]["line1"].pop(clickedBall.text());
		}
		//计算注数
		calcNotes();
	});
	
	createRebateLayout(lotteryName);
}


/**
 * 创建非数字类布局       此方法只适用pks 新玩法 冠亚和值3~19 使用。
 */
function createNonNumLayout_pks_new(lotteryName,playType,numArray,calcNotes){
	$("#"+lotteryName+"_ballView").empty();
	//创建布局
	var geRedBallLayout = new createNonNumLayout_pks_new_Html();
	var ge_param = lotteryName+"_line1";
	var geParams = {
		"divId":lotteryName+"_ballView",
		"text":"至少选择1个",
		"num":numArray,
		"lottery_playType":ge_param,
		"playType":playType
	}
	geRedBallLayout.create(geParams,function(clickedBall){
		if(clickedBall.hasClass("pks_new_redBalls_active")){
			LotteryStorage[lotteryName]["line1"].push(clickedBall.text().split(" ")[0]);//因为带有奖金 所以要截取
		}else{
			LotteryStorage[lotteryName]["line1"].pop(clickedBall.text().split(" ")[0]);
		}
		//计算注数
		calcNotes();
	});
	createRebateLayout(lotteryName);
}

/**
 * 
 * */
function createNonNumLayout_pks_new_Html(){
	var layoutParams = {
		"divId":"",
		"text":"",
		"num":[],
		"lottery_playType":"",
		"playType":""
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
		var $betContent = $('<div class="pks_new_ballView"></div>');
		$betContent.append('<h3 class="orange">' + getLayoutParam("text") + '</h3>');
		var $ballUl = $('<ul></ul>');
		for (var i = 0; i < getLayoutParam("num").length; i++) {
			var $ballLi = $('<li></li>');
			var $ballSpan = "";
			var lotteryType = LotteryInfo.getLotteryTypeByTag(getLayoutParam("lottery_playType").split("_")[0]);
			if( (lotteryType =="kl8" && getLayoutParam("playType") == "11")) {  //小球样式-宽度增加
				$ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="redBalls" style="margin:0.5rem 0.3rem;width:3.6rem;font-size: 1rem;">'+ getLayoutParam("num")[i] +'</span>');
			}else{
				$ballSpan = $('<span id="'+ getLayoutParam("lottery_playType") + i+ '" class="pks_new_redBalls">'+ getLayoutParam("num")[i] +' </br><p>00.00</p></span>');
			}
			$ballSpan.on('click',function(event){
				$(this).toggleClass("pks_new_redBalls_active");
				clickBallCallBack($(this));
			});
			$ballLi.append($ballSpan);
			$ballUl.append($ballLi);
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