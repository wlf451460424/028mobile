
//定义排列5玩法标识
var plw_playType = 0;
var plw_playMethod = 0;
var plw_sntuo = 0;
var plw_rebate;
var plwScroll;

//进入这个页面时调用
function plwPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("plw")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("plw_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}
//离开这个页面时调用
function plwPageUnloadedPanel(){
	$("#plwPage_back").off('click');
	$("#plw_queding").off('click');
	$("#plw_ballView").empty();
	$("#plwSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="plwPlaySelect"></select>');
	$("#plwSelect").append($select);
}
//入口函数
function plw_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("plw").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("plw")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("plw")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
	$("#plw_title").html(LotteryInfo.getLotteryNameByTag("plw"));
	for(var i = 0; i< LotteryInfo.getPlayLength("plw");i++){
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("plw",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("plw");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("plw",j) == LotteryInfo.getPlayTypeId("plw",i)){
				var name = LotteryInfo.getMethodName("plw",j);
				if(i == plw_playType && j == plw_playMethod){
					$play.append('<option value="plw'+LotteryInfo.getMethodIndex("plw",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="plw'+LotteryInfo.getMethodIndex("plw",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(plw_playMethod,onShowArray)>-1 ){
						plw_playType = i;
						plw_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#plwPlaySelect").append($play);
		}
	}
	
	if($("#plwPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("plwSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:plwChangeItem
		});
	});

	//添加滑动条
	new IScroll('.cs-options',{
		click:true,
		scrollbars: true,
		mouseWheel: true,
		interactiveScrollbars: true,
		shrinkScrollbars: 'scale',
		fadeScrollbars: true
	});

	GetLotteryInfo("plw",function (){
		plwChangeItem("plw"+plw_playMethod);
	});

	//添加滑动条
	if(!plwScroll){
		plwScroll = new IScroll('#plwContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("plw",LotteryInfo.getLotteryIdByTag("plw"));

	//获取上一期开奖
	queryLastPrize("plw");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('plw');

	//返回
	$("#plwPage_back").on('click', function(event) {
		// plw_playType = 0;
		// plw_playMethod = 0;
		$("#plw_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		plw_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	//机选选号
	$("#plw_random").on('click', function(event) {
		if(plw_playMethod != 1){
			plw_randomOne();
		}
	});
	
	$("#plw_shuoming").html(LotteryInfo.getMethodShuoming("plw",plw_playMethod));
	//玩法说明
	$("#plw_paly_shuoming").off('click');
	$("#plw_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#plw_shuoming").text());
	});

	qingKong("plw");//清空
	plw_submitData();
}

function plwResetPlayType(){
	plw_playType = 0;
	plw_playMethod = 0;
}

function plwChangeItem(val) {
	plw_qingkongAll();
	var temp = val.substring("plw".length,val.length);
	if(val == 'plw0'){
		//直选复式
		$("#plw_random").show();
		plw_sntuo = 0;
		plw_playType = 0;
		plw_playMethod = 0;
		createFiveLineLayout("plw",function(){
			plw_calcNotes();
		});
		plw_qingkongAll();
	}else if(val == 'plw1'){
		//直选单式
		$("#plw_random").hide();
		plw_sntuo = 3;
		plw_playType = 0;
		plw_playMethod = 1;
		plw_qingkongAll();
		var tips = "<p>格式说明<br/>直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("plw",tips);
	}else if(val == 'plw2'){
		//定位
		$("#plw_random").show();
		plw_sntuo = 0;
		plw_playType = 1;
		plw_playMethod = 2;
		createFiveLineLayout("plw",function(){
			plw_calcNotes();
		});
		plw_qingkongAll();
	}else if(val == 'plw3'){
		//直选复式
		$("#plw_random").show();
		plw_sntuo = 0;
		plw_playType = 2;
		plw_playMethod = 3;
		createOneLineLayout("plw","请至少选择1个",0,9,false,function(){
			plw_calcNotes();
		});
		plw_qingkongAll();
	}
	if(plwScroll){
		plwScroll.refresh();
		plwScroll.scrollTo(0,0,1);
	}
	
	$("#plw_shuoming").html(LotteryInfo.getMethodShuoming("plw",temp));
	
	initFooterData("plw",temp);
    hideRandomWhenLi("plw",plw_sntuo,plw_playMethod);
	plw_calcNotes();
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function plw_qingkongAll(){
	$("#plw_ballView span").removeClass('redBalls_active');
	LotteryStorage["plw"]["line1"] = [];
	LotteryStorage["plw"]["line2"] = [];
	LotteryStorage["plw"]["line3"] = [];
	LotteryStorage["plw"]["line4"] = [];
	LotteryStorage["plw"]["line5"] = [];

	localStorageUtils.removeParam("plw_line1");
	localStorageUtils.removeParam("plw_line2");
	localStorageUtils.removeParam("plw_line3");
	localStorageUtils.removeParam("plw_line4");
	localStorageUtils.removeParam("plw_line5");

	$('#plw_zhushu').text(0);
	$('#plw_money').text(0);
	clearAwardWin("plw");
	plw_initFooterButton();
}

/**
 * [plw_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function plw_calcNotes(){
	$('#plw_modeId').blur();
	$('#plw_fandian').blur();
	
	var notes = 0;
	if(plw_playMethod == 0){
		notes = LotteryStorage["plw"]["line1"].length *
			LotteryStorage["plw"]["line2"].length *
			LotteryStorage["plw"]["line3"].length *
			LotteryStorage["plw"]["line4"].length *
			LotteryStorage["plw"]["line5"].length;
	}else if (plw_playMethod == 2) {
		notes = LotteryStorage["plw"]["line1"].length +
			LotteryStorage["plw"]["line2"].length +
			LotteryStorage["plw"]["line3"].length +
			LotteryStorage["plw"]["line4"].length +
			LotteryStorage["plw"]["line5"].length;
	}else if (plw_playMethod == 3) {
		notes = LotteryStorage["plw"]["line1"].length;
	}else{
	notes = plwValidData($("#plw_single").val());
	}
	//验证是否为空
	if( $("#plw_beiNum").val() =="" || parseInt($("#plw_beiNum").val()) == 0){
		$("#plw_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#plw_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#plw_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
			$('#plw_zhushu').text(notes);
		if($("#plw_modeId").val() == "8"){
			$('#plw_money').text(bigNumberUtil.multiply(notes * parseInt($("#plw_beiNum").val()),0.002));
		}else if ($("#plw_modeId").val() == "2"){
			$('#plw_money').text(bigNumberUtil.multiply(notes * parseInt($("#plw_beiNum").val()),0.2));
		}else if ($("#plw_modeId").val() == "1"){
			$('#plw_money').text(bigNumberUtil.multiply(notes * parseInt($("#plw_beiNum").val()),0.02));
		}else{
			$('#plw_money').text(bigNumberUtil.multiply(notes * parseInt($("#plw_beiNum").val()),2));
		}
	} else {
			$('#plw_zhushu').text(0);
			$('#plw_money').text(0);
		}
	plw_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('plw',plw_playMethod);
}

/**
 * [plw_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function plw_initFooterButton(){
	if(plw_playMethod == 0 || plw_playMethod == 2 || plw_playMethod == 3){
		if(LotteryStorage["plw"]["line1"].length > 0 || LotteryStorage["plw"]["line2"].length > 0 ||
			LotteryStorage["plw"]["line3"].length > 0 || LotteryStorage["plw"]["line4"].length > 0 ||
			LotteryStorage["plw"]["line5"].length > 0){
			$("#plw_qingkong").css("opacity",1.0);
		}else{
			$("#plw_qingkong").css("opacity",0.4);
		}
	}else{
		$("#plw_qingkong").css("opacity",0);
	}

	if($("#plw_qingkong").css("opacity") == "0"){
		$("#plw_qingkong").css("display","none");
	}else{
		$("#plw_qingkong").css("display","block");
	}

	if($('#plw_zhushu').html() > 0){
		$("#plw_queding").css("opacity",1.0);
	}else{
		$("#plw_queding").css("opacity",0.4);
	}
}

/**
 * [plw_randomOne 随机一注]
 * @return {[type]} [description]
 */
function plw_randomOne(){
	plw_qingkongAll();
	if(plw_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["plw"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["plw"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["plw"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["plw"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["plw"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["plw"]["line1"], function(k, v){
			$("#" + "plw_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["plw"]["line2"], function(k, v){
			$("#" + "plw_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["plw"]["line3"], function(k, v){
			$("#" + "plw_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["plw"]["line4"], function(k, v){
			$("#" + "plw_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["plw"]["line5"], function(k, v){
			$("#" + "plw_line5" + v).toggleClass("redBalls_active");
		});
	}else if(plw_playMethod == 2){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["plw"]["line"+line].push(number+"");
		$.each(LotteryStorage["plw"]["line"+line], function(k, v){
			$("#" + "plw_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(plw_playMethod == 3){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["plw"]["line1"].push(number+"");
		$.each(LotteryStorage["plw"]["line1"], function(k, v){
			$("#" + "plw_line1" + v).toggleClass("redBalls_active");
		});
	}
	plw_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function plw_checkOutRandom(playMethod){
	var obj = new Object();
	if(plw_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
	}else if(plw_playMethod == 2){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		if(line == 1){
			obj.nums = number + "|*|*|*|*";
		}else if(line == 2){
			obj.nums = "*|"+ number +"|*|*|*";
		}else if(line == 3){
			obj.nums = "*|*|"+number +"|*|*";
		}else if(line == 4){
			obj.nums = "*|*|*|"+ number +"|*";
		}else if(line == 5){
			obj.nums = "*|*|*|*|" + number;
		}
	}else if(plw_playMethod == 3){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
	}
	obj.notes = 1;
	obj.sntuo = plw_sntuo;
	obj.multiple = 1;
	obj.rebates = plw_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('plw',plw_playMethod,obj);  //机选奖金计算
	obj.award = $('#plw_minAward').html();     //奖金
	obj.maxAward = $('#plw_maxAward').html();  //多级奖金
	return obj;
}
/**
 * [plw_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function plw_submitData(){
	$("#plw_queding").off('click');
	$("#plw_queding").on('click', function(event) {

		plw_rebate = $("#plw_fandian option:last").val();
		if(parseInt($('#plw_zhushu').html()) <= 0 || Number($("#plw_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		plw_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#plw_modeId').val()) == 8){
            if (Number($('#plw_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

		//提示单挑奖金
		getDanTiaoBonus('plw',plw_playMethod);

		var submitParams = new LotterySubmitParams();
		submitParams.lotteryType = "plw";
		submitParams.playType = LotteryInfo.getPlayName("plw",plw_playType);
		submitParams.playMethod = LotteryInfo.getMethodName("plw",plw_playMethod);
		submitParams.playTypeIndex = plw_playType;
		submitParams.playMethodIndex = plw_playMethod;
		var selectedBalls = [];
		if(plw_playMethod == 0){
			$("#plw_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(plw_playMethod == 2) {
			$("#plw_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				if (arr.length == 0) {
					selectedBalls.push("*");
				}else{
					selectedBalls.push(arr.join(","));
				}
			});
			submitParams.nums = selectedBalls.join("|");
		}else if (plw_playMethod == 3) {
			$("#plw_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else{
			//去错误号
			plwValidateData("submit");
			var array = handleSingleStr($("#plw_single").val());
			var temp = "";
			for(var i = 0;i < array.length;i++){
				if(i == array.length - 1){
					temp = temp + array[i].split("").join("|");
				}else{
					temp = temp + array[i].split("").join("|") + " ";
				}
			}
			submitParams.nums = temp;
		}
		localStorageUtils.setParam("playMode",$("#plw_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#plw_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#plw_fandian").val());
		submitParams.notes = $('#plw_zhushu').html();
		submitParams.sntuo = plw_sntuo;
		submitParams.multiple = $('#plw_beiNum').val();  //requirement
		submitParams.rebates = $('#plw_fandian').val();  //requirement
		submitParams.playMode = $('#plw_modeId').val();  //requirement
		submitParams.money = $('#plw_money').html();  //requirement
		submitParams.award = $('#plw_minAward').html();  //奖金
		submitParams.maxAward = $('#plw_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#plw_ballView").empty();
		plw_qingkongAll();
	});
}

function plwValidateData(type) {
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#plw_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	plwValidData(textStr,type);
}

/**
 * [plwValidateData 验证直选单式数据的合法性]
 */
function plwValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var content = {};
	content.str = str;
	content.weishu = 5;
	var result = handleSingleStr_deleteErr(content,type);

	$('#plw_delRepeat').off('click');
	$('#plw_delRepeat').on('click',function () {
		content.str = $('#plw_single').val() ? $('#plw_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		plwShowFooter(true,notes);
		$("#plw_single").val(array.join(" "));
	});
	
	$("#plw_single").val(result.num.join(" "));
	var notes = result.length;
	plwShowFooter(true,notes);
	return notes;
}

function plwShowFooter(isValid, notes){
	$('#plw_zhushu').text(notes);
	if($("#plw_modeId").val() == "8"){
		$('#plw_money').text(bigNumberUtil.multiply(notes * parseInt($("#plw_beiNum").val()),0.002));
	}else if ($("#plw_modeId").val() == "2"){
		$('#plw_money').text(bigNumberUtil.multiply(notes * parseInt($("#plw_beiNum").val()),0.2));
	}else if ($("#plw_modeId").val() == "1"){
		$('#plw_money').text(bigNumberUtil.multiply(notes * parseInt($("#plw_beiNum").val()),0.02));
	}else{
		$('#plw_money').text(bigNumberUtil.multiply(notes * parseInt($("#plw_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	plw_initFooterButton();
	calcAwardWin('plw',plw_playMethod);  //计算奖金和盈利
}