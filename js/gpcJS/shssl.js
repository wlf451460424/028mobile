
//定义上海时时乐玩法标识
var shssl_playType = 0;
var shssl_playMethod = 0;
var shssl_sntuo = 0;
var shssl_rebate;
var shsslScroll;

//进入这个页面时调用
function shsslPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("shssl")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("shssl_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function shsslPageUnloadedPanel(){
	$("#shsslPage_back").off('click');
	$("#shssl_queding").off('click');
	$("#shssl_ballView").empty();
	$("#shsslSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="shsslPlaySelect"></select>');
	$("#shsslSelect").append($select);
}

//入口函数
function shssl_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("ssl").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("ssl")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("ssl")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
	$("#shssl_title").html(LotteryInfo.getLotteryNameByTag("shssl"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssl");i++){
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssl",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssl");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssl",j) == LotteryInfo.getPlayTypeId("ssl",i)){
				var name = LotteryInfo.getMethodName("ssl",j);
				if(i == shssl_playType && j == shssl_playMethod){
					$play.append('<option value="shssl'+LotteryInfo.getMethodIndex("ssl",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="shssl'+LotteryInfo.getMethodIndex("ssl",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(shssl_playMethod,onShowArray)>-1 ){
						shssl_playType = i;
						shssl_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#shsslPlaySelect").append($play);
		}
	}
	
	if($("#shsslPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("shsslSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:shsslChangeItem
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

	GetLotteryInfo("shssl",function (){
		shsslChangeItem("shssl"+shssl_playMethod);
	});

	//添加滑动条
	if(!shsslScroll){
		shsslScroll = new IScroll('#shsslContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
    getQihao("shssl",LotteryInfo.getLotteryIdByTag("shssl"));

	//获取上一期开奖
	queryLastPrize("shssl");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('shssl');

	//返回
	$("#shsslPage_back").on('click', function(event) {
		// shssl_playType = 0;
		// shssl_playMethod = 0;
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		$("#shssl_ballView").empty();
		shssl_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	//机选选号
	$("#shssl_random").on('click', function(event) {
		shssl_randomOne();
	});
	
	$("#shssl_shuoming").html(LotteryInfo.getMethodShuoming("ssl",shssl_playMethod));
	//玩法说明
	$("#shssl_paly_shuoming").off('click');
	$("#shssl_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#shssl_shuoming").text());
	});

	qingKong("shssl");//清空
	shssl_submitData();
}


function shsslResetPlayType(){
	shssl_playType = 0;
	shssl_playMethod = 0;
}

function shsslChangeItem(val) {
	shssl_qingkongAll();
	var temp = val.substring("shssl".length,val.length);
	if(val == "shssl0"){
		//直选复式
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 0;
		shssl_playMethod = 0;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("shssl",tips,0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl1"){
		//直选单式
		$("#shssl_random").hide();
		shssl_sntuo = 3;
		shssl_playType = 0;
		shssl_playMethod = 1;
		$("#shssl_ballView").empty();
		shssl_qingkongAll();
		var tips = "<p>格式说明<br/>直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("shssl",tips);
	}else if(val == "shssl2"){
		//直选和值
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 0;
		shssl_playMethod = 2;
		createSumLayout("shssl",0,27,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl3"){
		//组三包号
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 0;
		shssl_playMethod = 3;
		createOneLineLayout("shssl","至少选择2个号码",0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl4"){
		//组六包号
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 0;
		shssl_playMethod = 4;
		createOneLineLayout("shssl","至少选择3个号码",0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl5"){
		//直选复式
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 1;
		shssl_playMethod = 5;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码"];
		createTwoLineLayout("shssl",tips,0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl6"){
		//直选单式
		$("#shssl_random").hide();
		shssl_sntuo = 3;
		shssl_playType = 1;
		shssl_playMethod = 6;
		$("#shssl_ballView").empty();

		shssl_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("shssl",tips);
	}else if(val == "shssl7"){
		//直选和值
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 1;
		shssl_playMethod = 7;
		createSumLayout("shssl",0,18,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl8"){
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 1;
		shssl_playMethod = 8;
		createOneLineLayout("shssl","至少选择2个号码",0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl9"){
		//组选单式
		$("#shssl_random").hide();
		shssl_sntuo = 3;
		shssl_playType = 1;
		shssl_playMethod = 9;
		$("#shssl_ballView").empty();
		shssl_qingkongAll();
		var tips = "<p>格式说明<br/>前二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割（2个号码必须各不相同）;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("shssl",tips);
	}else if(val == "shssl10"){
		//直选复式
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 2;
		shssl_playMethod = 10;
		var tips = ["十位:至少选择1个号码","个位:至少选择1个号码"];
		createTwoLineLayout("shssl",tips,0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl11"){
		//直选单式
		$("#shssl_random").hide();
		shssl_sntuo = 3;
		shssl_playType = 2;
		shssl_playMethod = 11;
		$("#shssl_ballView").empty();

		shssl_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("shssl",tips);
	}else if(val == "shssl12"){
		//直选和值
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 2;
		shssl_playMethod = 12;
		createSumLayout("shssl",0,18,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl13"){
		//直选和值
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 2;
		shssl_playMethod = 13;
		createOneLineLayout("shssl","至少选择2个号码",0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl14"){
		//直选单式
		$("#shssl_random").hide();
		shssl_sntuo = 3;
		shssl_playType = 2;
		shssl_playMethod = 14;
		$("#shssl_ballView").empty();
		shssl_qingkongAll();
		var tips = "<p>格式说明<br/>后二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割（2个号码必须各不相同）;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("shssl",tips);
	}else if(val == "shssl15"){
		//直选单式
		$("#shssl_random").show();
		//直选和值
		shssl_sntuo = 0;
		shssl_playType = 3;
		shssl_playMethod = 15;
		createOneLineLayout("shssl","至少选择1个号码",0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}else if(val == "shssl16"){
		//直选和值
		$("#shssl_random").show();
		shssl_sntuo = 0;
		shssl_playType = 4;
		shssl_playMethod = 16;
		createOneLineLayout("shssl","至少选择1个号码",0,9,false,function(){
			shssl_calcNotes();
		});
		shssl_qingkongAll();
	}

	if(shsslScroll){
		shsslScroll.refresh();
		shsslScroll.scrollTo(0,0,1);
	}
	
	$("#shssl_shuoming").html(LotteryInfo.getMethodShuoming("ssl",temp));
	
	initFooterData("shssl",temp);
    hideRandomWhenLi("shssl",shssl_sntuo,shssl_playMethod);
	shssl_calcNotes();
}

/**
 * [shssl_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function shssl_initFooterButton(){
	if(shssl_playMethod == 0){
		if(LotteryStorage["shssl"]["line1"].length > 0 
			|| LotteryStorage["shssl"]["line2"].length > 0
			|| LotteryStorage["shssl"]["line3"].length > 0){
			$("#shssl_qingkong").css("opacity",1.0);
		}else{
			$("#shssl_qingkong").css("opacity",0.4);
		}
	}else if(shssl_playMethod == 2 || shssl_playMethod == 3
		 || shssl_playMethod == 4 || shssl_playMethod == 7
		|| shssl_playMethod == 8 || shssl_playMethod == 12 || shssl_playMethod == 15 || shssl_playMethod == 16
		|| shssl_playMethod == 13){
		if (LotteryStorage["shssl"]["line1"].length > 0 ) {
			$("#shssl_qingkong").css("opacity",1.0);
		}else{
			$("#shssl_qingkong").css("opacity",0.4);
		}
	}else if (shssl_playMethod == 5 || shssl_playMethod == 10) {
		if(LotteryStorage["shssl"]["line1"].length > 0 
			|| LotteryStorage["shssl"]["line2"].length > 0){
			$("#shssl_qingkong").css("opacity",1.0);
		}else{
			$("#shssl_qingkong").css("opacity",0.4);
		}
	}else{
		$("#shssl_qingkong").css("opacity",0);
	}

	if($("#shssl_qingkong").css("opacity") == "0"){
		$("#shssl_qingkong").css("display","none");
	}else{
		$("#shssl_qingkong").css("display","block");
	}
	if($('#shssl_zhushu').html() > 0){
		$("#shssl_queding").css("opacity",1.0);
	}else{
		$("#shssl_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  shssl_qingkongAll(){
	$("#shssl_ballView span").removeClass('redBalls_active');

	LotteryStorage["shssl"]["line1"] = [];
	LotteryStorage["shssl"]["line2"] = [];
	LotteryStorage["shssl"]["line3"] = [];

	localStorageUtils.removeParam("shssl_line1");
	localStorageUtils.removeParam("shssl_line2");
	localStorageUtils.removeParam("shssl_line3");

	$('#shssl_zhushu').text(0);
	$('#shssl_money').text(0);
	clearAwardWin("shssl");
	shssl_initFooterButton();
}

/**
 * [shssl_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function shssl_calcNotes(){
	$('#shssl_modeId').blur();
	$('#shssl_fandian').blur();
	
	var notes = 0;
	if (shssl_playMethod == 0) {
		notes = LotteryStorage["shssl"]["line1"].length * 
					LotteryStorage["shssl"]["line2"].length * 
					LotteryStorage["shssl"]["line3"].length;
	}else if(shssl_playMethod == 2){//和值
		for (var i = 0; i < LotteryStorage["shssl"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(parseInt(LotteryStorage["shssl"]["line1"][i]));
		}
	}else if(shssl_playMethod == 3){//组三包号
		notes = mathUtil.getACombination(LotteryStorage["shssl"]["line1"].length,2); 
	}else if(shssl_playMethod == 4){
		notes = mathUtil.getCCombination(LotteryStorage["shssl"]["line1"].length,3); 
	}else if(shssl_playMethod == 5 || shssl_playMethod == 10){//复式
		notes = LotteryStorage["shssl"]["line1"].length * 
					LotteryStorage["shssl"]["line2"].length ;
	}else if(shssl_playMethod == 7 || shssl_playMethod == 12){//和值
		for (var i = 0; i < LotteryStorage["shssl"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(parseInt(LotteryStorage["shssl"]["line1"][i]));
		}
	}else if(shssl_playMethod == 8 || shssl_playMethod == 13){
		notes = mathUtil.getCCombination(LotteryStorage["shssl"]["line1"].length,2); 
	}else if(shssl_playMethod == 15 || shssl_playMethod == 16){
		notes = LotteryStorage["shssl"]["line1"].length;
	}else{//单式
		notes = shsslValidData($("#shssl_single").val());
	}

    hideRandomWhenLi("shssl",shssl_sntuo,shssl_playMethod);

	//验证是否为空
	if( $("#shssl_beiNum").val() =="" || parseInt($("#shssl_beiNum").val()) == 0){
		$("#shssl_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#shssl_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#shssl_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}
	if(notes > 0) {
		$('#shssl_zhushu').text(notes);
		if($("#shssl_modeId").val() == "8"){
			$('#shssl_money').text(bigNumberUtil.multiply(notes * parseInt($("#shssl_beiNum").val()),0.002));
		}else if ($("#shssl_modeId").val() == "2"){
			$('#shssl_money').text(bigNumberUtil.multiply(notes * parseInt($("#shssl_beiNum").val()),0.2));
		}else if ($("#shssl_modeId").val() == "1"){
			$('#shssl_money').text(bigNumberUtil.multiply(notes * parseInt($("#shssl_beiNum").val()),0.02));
		}else{
			$('#shssl_money').text(bigNumberUtil.multiply(notes * parseInt($("#shssl_beiNum").val()),2));
		}
	} else {
		$('#shssl_zhushu').text(0);
		$('#shssl_money').text(0);
	}
	shssl_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('shssl',shssl_playMethod);
}

/**
 * [shssl_randomOne 随机一注]
 * @return {[type]} [description]
 */
function shssl_randomOne(){
	shssl_qingkongAll();
	if(shssl_playMethod == 0){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["shssl"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["shssl"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["shssl"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["shssl"]["line1"], function(k, v){
			$("#" + "shssl_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["shssl"]["line2"], function(k, v){
			$("#" + "shssl_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["shssl"]["line3"], function(k, v){
			$("#" + "shssl_line3" + v).toggleClass("redBalls_active");
		});

	}else if(shssl_playMethod == 15 || shssl_playMethod == 16){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["shssl"]["line1"].push(number+"");
		$.each(LotteryStorage["shssl"]["line1"], function(k, v){
			$("#" + "shssl_line1" + v).toggleClass("redBalls_active");
		});
	}else if(shssl_playMethod == 2){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["shssl"]["line1"].push(number+"");
		$.each(LotteryStorage["shssl"]["line1"], function(k, v){
			$("#" + "shssl_line1" + v).toggleClass("redBalls_active");
		});
	}else if(shssl_playMethod == 3 || shssl_playMethod == 8 || shssl_playMethod == 13){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["shssl"]["line1"].push(v+"");
		})

		$.each(LotteryStorage["shssl"]["line1"], function(k, v){
			$("#" + "shssl_line1" + v).toggleClass("redBalls_active");
		});
	}else if(shssl_playMethod == 4){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["shssl"]["line1"].push(v+"");
		})

		$.each(LotteryStorage["shssl"]["line1"], function(k, v){
			$("#" + "shssl_line1" + v).toggleClass("redBalls_active");
		});
	}else if(shssl_playMethod == 5 || shssl_playMethod == 10){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["shssl"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["shssl"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["shssl"]["line1"], function(k, v){
			$("#" + "shssl_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["shssl"]["line2"], function(k, v){
			$("#" + "shssl_line2" + v).toggleClass("redBalls_active");
		});
	}else if(shssl_playMethod == 7 || shssl_playMethod == 12){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["shssl"]["line1"].push(number+"");
		$.each(LotteryStorage["shssl"]["line1"], function(k, v){
			$("#" + "shssl_line1" + v).toggleClass("redBalls_active");
		});
	}
	shssl_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function shssl_checkOutRandom(playMethod){
	var obj = new Object();
	if(shssl_playMethod == 0){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(shssl_playMethod == 2){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(shssl_playMethod == 3){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(shssl_playMethod == 4){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(shssl_playMethod == 5 || shssl_playMethod == 10){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(shssl_playMethod == 7 || shssl_playMethod == 12){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(shssl_playMethod == 8 || shssl_playMethod == 13){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(shssl_playMethod == 15 || shssl_playMethod == 16){
		obj.nums = mathUtil.getRandomNum(0,10);
		obj.notes = 1;
	}
	obj.sntuo = shssl_sntuo;
	obj.multiple = 1;
	obj.rebates = shssl_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('shssl',shssl_playMethod,obj);  //机选奖金计算
	obj.award = $('#shssl_minAward').html();     //奖金
	obj.maxAward = $('#shssl_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [shssl_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function shssl_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#shssl_queding").bind('click', function(event) {

		shssl_rebate = $("#shssl_fandian option:last").val();
		if(parseInt($('#shssl_zhushu').html()) <= 0 || Number($("#shssl_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		shssl_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#shssl_modeId').val()) == 8){
            if (Number($('#shssl_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

		//提示单挑奖金
		getDanTiaoBonus('shssl',shssl_playMethod);

		submitParams.lotteryType = "shssl";
		submitParams.playType = LotteryInfo.getPlayName("ssl",shssl_playType);
		submitParams.playMethod = LotteryInfo.getMethodName("ssl",shssl_playMethod);
		submitParams.playTypeIndex = shssl_playType;
		submitParams.playMethodIndex = shssl_playMethod;
		var selectedBalls = [];

		if(shssl_playMethod == 0 || shssl_playMethod == 5 || shssl_playMethod == 10
			|| shssl_playMethod == 8){
			$("#shssl_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(shssl_playMethod == 2 || shssl_playMethod == 3
			 || shssl_playMethod == 4 || shssl_playMethod == 7 ||
			shssl_playMethod == 8 || shssl_playMethod == 12 || shssl_playMethod == 13 || shssl_playMethod == 15 ||
			shssl_playMethod == 16){
			$("#shssl_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");	
		}else if(shssl_playMethod == 1 || shssl_playMethod == 6 || shssl_playMethod == 11){
			//去错误号
			shsslValidateData("submit");
			var array = handleSingleStr($("#shssl_single").val());
			var temp = "";
			for(var i = 0;i < array.length;i++){
				if(i == array.length - 1){
					temp = temp + array[i].split("").join("|");
				}else{
					temp = temp + array[i].split("").join("|") + " ";
				}
			}
			submitParams.nums = temp;
		}else if(shssl_playMethod == 9 || shssl_playMethod == 14){
			//去错误号
			shsslValidateData("submit");
			var array = handleSingleStr($("#shssl_single").val());
			var temp = "";
			for(var i = 0;i < array.length;i++){
				if(i == array.length - 1){
					temp = temp + array[i].split("").join(",");
				}else{
					temp = temp + array[i].split("").join(",") + " ";
				}
			}
			submitParams.nums = temp;
		}
		localStorageUtils.setParam("playMode",$("#shssl_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#shssl_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#shssl_fandian").val());
		submitParams.notes = $('#shssl_zhushu').html();
		submitParams.sntuo = shssl_sntuo;
		submitParams.multiple = $('#shssl_beiNum').val();  //requirement
		submitParams.rebates = $('#shssl_fandian').val();  //requirement
		submitParams.playMode = $('#shssl_modeId').val();  //requirement
		submitParams.money = $('#shssl_money').html();  //requirement
		submitParams.award = $('#shssl_minAward').html();  //奖金
		submitParams.maxAward = $('#shssl_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#shssl_ballView").empty();
		shssl_qingkongAll();
	});
}

/**
 * [shsslValidateData 单式数据验证]
 */
function shsslValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#shssl_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	shsslValidData(textStr,type);
}

function shsslValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var	result;
	var content = {};
	if(shssl_playMethod == 1){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
	}else if(shssl_playMethod == 6 || shssl_playMethod == 11){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
	}else if(shssl_playMethod == 9 || shssl_playMethod == 14){
		content.str = str;
		content.weishu = 2;
		content.numRepeat = true;
		result = handleSingleStr_deleteErr(content,type);
	}

	$('#shssl_delRepeat').off('click');
	$('#shssl_delRepeat').on('click',function () {
		content.str = $('#shssl_single').val() ? $('#shssl_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		shsslShowFooter(true,notes);
		$("#shssl_single").val(array.join(" "));
	});
	
	$("#shssl_single").val(result.num.join(" "));
	var notes = result.length;
	shsslShowFooter(true,notes);
	return notes;
}

function shsslShowFooter(isValid,notes){
	$('#shssl_zhushu').text(notes);
	if($("#shssl_modeId").val() == "8"){
		$('#shssl_money').text(bigNumberUtil.multiply(notes * parseInt($("#shssl_beiNum").val()),0.002));
	}else if ($("#shssl_modeId").val() == "2"){
		$('#shssl_money').text(bigNumberUtil.multiply(notes * parseInt($("#shssl_beiNum").val()),0.2));
	}else if ($("#shssl_modeId").val() == "1"){
		$('#shssl_money').text(bigNumberUtil.multiply(notes * parseInt($("#shssl_beiNum").val()),0.02));
	}else{
		$('#shssl_money').text(bigNumberUtil.multiply(notes * parseInt($("#shssl_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	shssl_initFooterButton();
	calcAwardWin('shssl',shssl_playMethod);  //计算奖金和盈利
}
