
//定义福彩3D玩法标识
var fcsd_playType = 0;
var fcsd_playMethod = 0;
var fcsd_sntuo = 0;
var fcsd_rebate;
var fcsdScroll;

//进入这个页面时调用
function fcsdPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("fcsd")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("fcsd_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function fcsdPageUnloadedPanel(){
	$("#fcsdPage_back").off('click');
	$("#fcsd_queding").off('click');
	$("#fcsd_ballView").empty();
	$("#fcsdSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="fcsdPlaySelect"></select>');
	$("#fcsdSelect").append($select);
}
//入口函数
function fcsd_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("sd").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("sd")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("sd")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面
	$("#fcsd_title").html(LotteryInfo.getLotteryNameByTag("fcsd"));
	for(var i = 0; i< LotteryInfo.getPlayLength("sd");i++){
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("sd",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("sd");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(i==0 && (j == 3 || j == 7 || j == 8 || j == 9 || j == 10)){
				continue;
			}
			if(i==1 && (j == 13 || j == 14 || j == 15 || j == 16 || j == 17 || j == 18)){
				continue;
			}
			if(i==2 && (j == 21 || j == 22 || j == 23 || j == 24 || j == 25 || j == 26)){
				continue;
			}
			
			if(LotteryInfo.getMethodTypeId("sd",j) == LotteryInfo.getPlayTypeId("sd",i)){
				var name = LotteryInfo.getMethodName("sd",j);
				if(i == fcsd_playType && j == fcsd_playMethod){
					$play.append('<option value="fcsd'+LotteryInfo.getMethodIndex("sd",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="fcsd'+LotteryInfo.getMethodIndex("sd",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(fcsd_playMethod,onShowArray)>-1 ){
						fcsd_playType = i;
						fcsd_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#fcsdPlaySelect").append($play);
		}
	}
	
	if($("#fcsdPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("fcsdSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:fcsdChangeItem
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

	GetLotteryInfo("fcsd",function (){
		fcsdChangeItem("fcsd"+fcsd_playMethod);
	});

	//添加滑动条
	if(!fcsdScroll){
		fcsdScroll = new IScroll('#fcsdContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
    getQihao("fcsd",LotteryInfo.getLotteryIdByTag("fcsd"));

	//获取上一期开奖
	queryLastPrize("fcsd");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('fcsd');

	//返回
	$("#fcsdPage_back").on('click', function(event) {
		// fcsd_playType = 0;
		// fcsd_playMethod = 0;
		$("#fcsd_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		fcsd_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	//机选选号
	$("#fcsd_random").on('click', function(event) {
		fcsd_randomOne();
	});
	
	$("#fcsd_shuoming").html(LotteryInfo.getMethodShuoming("sd",fcsd_playMethod));
	//玩法说明
	$("#fcsd_paly_shuoming").off('click');
	$("#fcsd_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#fcsd_shuoming").text());
	});

	qingKong("fcsd");
	fcsd_submitData();
}


function fcsdResetPlayType(){
	fcsd_playType = 0;
	fcsd_playMethod = 0;
}

function fcsdChangeItem(val) {
	fcsd_qingkongAll();
	var temp = val.substring("fcsd".length,val.length);
	if(val == 'fcsd0'){
		//直选复式
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 0;
		fcsd_playMethod = 0;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("fcsd",tips,0,9,false,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}else if(val == 'fcsd1'){
		//直选单式
		$("#fcsd_random").hide();
		fcsd_sntuo = 3;
		fcsd_playType = 0;
		fcsd_playMethod = 1;
		fcsd_qingkongAll();
		var tips = "<p>格式说明<br/>直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("fcsd",tips);
	}else if(val == 'fcsd2'){
		//直选和值
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 0;
		fcsd_playMethod = 2;
		createSumLayout("fcsd",0,27,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}else if(val == 'fcsd4'){
		//直选复式
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 0;
		fcsd_playMethod = 4;
		createOneLineLayout("fcsd","请至少选择2个",0,9,false,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}else if(val == 'fcsd5'){
		//包号
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 0;
		fcsd_playMethod = 5;
		createOneLineLayout("fcsd","请至少选择3个",0,9,false,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}else if(val == 'fcsd6'){
		//直选单式
		$("#fcsd_random").hide();
		fcsd_sntuo = 3;
		fcsd_playType = 0;
		fcsd_playMethod = 6;
		fcsd_qingkongAll();
		var tips = "<p>格式说明<br/>混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("fcsd",tips);
	}else if(val == 'fcsd27'){
		//一星定位
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 3;
		fcsd_playMethod = 27;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("fcsd",tips,0,9,false,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}else if(val == 'fcsd11'){
		//直选复式
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 1;
		fcsd_playMethod = 11;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码"];
		createTwoLineLayout("fcsd",tips,0,9,false,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}else if(val == 'fcsd12'){
		//直选单式
		$("#fcsd_random").hide();
		fcsd_sntuo = 3;
		fcsd_playType = 1;
		fcsd_playMethod = 12;
		$("#fcsd_ballView").empty();
		fcsd_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("fcsd",tips);
	}else if(val == 'fcsd19'){
		//直选复式
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 2;
		fcsd_playMethod = 19;
		var tips = ["十位:至少选择1个号码","个位:至少选择1个号码"];
		createTwoLineLayout("fcsd",tips,0,9,false,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}else if(val == 'fcsd20'){
		//直选单式
		$("#fcsd_random").hide();
		fcsd_sntuo = 3;
		fcsd_playType = 2;
		fcsd_playMethod = 20;
		$("#fcsd_ballView").empty();
		fcsd_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("fcsd",tips);
	}else if(val == 'fcsd28'){
		//直选复式
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 4;
		fcsd_playMethod = 28;
		createOneLineLayout("fcsd","请至少选择1个",0,9,false,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}else if(val == 'fcsd29'){
		//直选单式
		$("#fcsd_random").show();
		fcsd_sntuo = 0;
		fcsd_playType = 4;
		fcsd_playMethod = 29;
		createOneLineLayout("fcsd","请至少选择2个",0,9,false,function(){
			fcsd_calcNotes();
		});
		fcsd_qingkongAll();
	}

	if(fcsdScroll){
		fcsdScroll.refresh();
		fcsdScroll.scrollTo(0,0,1);
	}
	
	$("#fcsd_shuoming").html(LotteryInfo.getMethodShuoming("sd",temp));
	
	initFooterData("fcsd",temp);
    hideRandomWhenLi("fcsd",fcsd_sntuo,fcsd_playMethod);
	fcsd_calcNotes();
}


/**
 * [fcsd_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function fcsd_initFooterButton(){
	if(fcsd_playMethod == 0 || fcsd_playMethod == 27){
		if(LotteryStorage["fcsd"]["line1"].length > 0
			|| LotteryStorage["fcsd"]["line2"].length > 0
			|| LotteryStorage["fcsd"]["line3"].length > 0){
			$("#fcsd_qingkong").css("opacity",1.0);
		}else{
			$("#fcsd_qingkong").css("opacity",0.4);
		}
	}else if(fcsd_playMethod == 2 || fcsd_playMethod == 4 || fcsd_playMethod == 5
		|| fcsd_playMethod == 28 || fcsd_playMethod == 29){
		if (LotteryStorage["fcsd"]["line1"].length > 0 ) {
			$("#fcsd_qingkong").css("opacity",1.0);
		}else{
			$("#fcsd_qingkong").css("opacity",0.4);
		}
	}else if (fcsd_playMethod == 11 || fcsd_playMethod == 19) {
		if(LotteryStorage["fcsd"]["line1"].length > 0
			|| LotteryStorage["fcsd"]["line2"].length > 0){
			$("#fcsd_qingkong").css("opacity",1.0);
		}else{
			$("#fcsd_qingkong").css("opacity",0.4);
		}
	}else{
		$("#fcsd_qingkong").css("opacity",0);
	}

	if($("#fcsd_qingkong").css("opacity") == "0"){
		$("#fcsd_qingkong").css("display","none");
	}else{
		$("#fcsd_qingkong").css("display","block");
	}

	if($('#fcsd_zhushu').html() > 0){
		$("#fcsd_queding").css("opacity",1.0);
	}else{
		$("#fcsd_queding").css("opacity",0.4);
	}
}

//清空所有记录
function fcsd_qingkongAll(){
	$("#fcsd_ballView span").removeClass('redBalls_active');
	LotteryStorage["fcsd"]["line1"] = [];
	LotteryStorage["fcsd"]["line2"] = [];
	LotteryStorage["fcsd"]["line3"] = [];

	localStorageUtils.removeParam("fcsd_line1");
	localStorageUtils.removeParam("fcsd_line2");
	localStorageUtils.removeParam("fcsd_line3");

	$('#fcsd_zhushu').text(0);
	$('#fcsd_money').text(0);
	clearAwardWin("fcsd");
	fcsd_initFooterButton();

}

/**
 * [fcsd_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function fcsd_calcNotes(){
	$('#fcsd_modeId').blur();
	$('#fcsd_fandian').blur();
	
	var notes = 0;
	if (fcsd_playMethod == 0) {
		notes = LotteryStorage["fcsd"]["line1"].length *
			LotteryStorage["fcsd"]["line2"].length *
			LotteryStorage["fcsd"]["line3"].length;
	}else if(fcsd_playMethod == 2){//和值
		for (var i = 0; i < LotteryStorage["fcsd"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(parseInt(LotteryStorage["fcsd"]["line1"][i]));
		}
	}else if(fcsd_playMethod == 4){//组三包号
		notes = mathUtil.getACombination(LotteryStorage["fcsd"]["line1"].length,2);
	}else if(fcsd_playMethod == 5){
		notes = mathUtil.getCCombination(LotteryStorage["fcsd"]["line1"].length,3);
	}else if(fcsd_playMethod == 27){//一星定位
		notes = LotteryStorage["fcsd"]["line1"].length +
			LotteryStorage["fcsd"]["line2"].length +
			LotteryStorage["fcsd"]["line3"].length;
	}else if(fcsd_playMethod == 11 || fcsd_playMethod == 19){//二星复式
		notes = LotteryStorage["fcsd"]["line1"].length *
			LotteryStorage["fcsd"]["line2"].length;
	}else if(fcsd_playMethod == 28){
		notes = LotteryStorage["fcsd"]["line1"].length;
	}else if(fcsd_playMethod == 29){
		notes = mathUtil.getCCombination(LotteryStorage["fcsd"]["line1"].length,2);
	}else{
		notes = fcsdValidData($("#fcsd_single").val());
	}

	//验证是否为空
	if( $("#fcsd_beiNum").val() =="" || parseInt($("#fcsd_beiNum").val()) == 0){
		$("#fcsd_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#fcsd_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#fcsd_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#fcsd_zhushu').text(notes);
		if($("#fcsd_modeId").val() == "8"){
			$('#fcsd_money').text(bigNumberUtil.multiply(notes * parseInt($("#fcsd_beiNum").val()),0.002));
		}else if ($("#fcsd_modeId").val() == "2"){
			$('#fcsd_money').text(bigNumberUtil.multiply(notes * parseInt($("#fcsd_beiNum").val()),0.2));
		}else if ($("#fcsd_modeId").val() == "1"){
			$('#fcsd_money').text(bigNumberUtil.multiply(notes * parseInt($("#fcsd_beiNum").val()),0.02));
		}else{
			$('#fcsd_money').text(bigNumberUtil.multiply(notes * parseInt($("#fcsd_beiNum").val()),2));
		}

	} else {
		$('#fcsd_zhushu').text(0);
		$('#fcsd_money').text(0);
	}
	fcsd_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('fcsd',fcsd_playMethod);
}

/**
 * [fcsd_randomOne 随机一注]
 * @return {[type]} [description]
 */
function fcsd_randomOne(){
	fcsd_qingkongAll();
	if(fcsd_playMethod == 0){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["fcsd"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["fcsd"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["fcsd"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["fcsd"]["line1"], function(k, v){
			$("#" + "fcsd_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["fcsd"]["line2"], function(k, v){
			$("#" + "fcsd_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["fcsd"]["line3"], function(k, v){
			$("#" + "fcsd_line3" + v).toggleClass("redBalls_active");
		});

	}else if(fcsd_playMethod == 2){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["fcsd"]["line1"].push(number+"");
		$.each(LotteryStorage["fcsd"]["line1"], function(k, v){
			$("#" + "fcsd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(fcsd_playMethod == 4 || fcsd_playMethod == 29){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array, function (k,v) {
			LotteryStorage["fcsd"]["line1"].push(v+"");
		})

		$.each(LotteryStorage["fcsd"]["line1"], function(k, v){
			$("#" + "fcsd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(fcsd_playMethod == 5){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array, function (k,v) {
			LotteryStorage["fcsd"]["line1"].push(v+"");
		})
		$.each(LotteryStorage["fcsd"]["line1"], function(k, v){
			$("#" + "fcsd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(fcsd_playMethod == 27){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["fcsd"]["line"+line].push(number+"");
		$.each(LotteryStorage["fcsd"]["line"+line], function(k, v){
			$("#" + "fcsd_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(fcsd_playMethod == 11 || fcsd_playMethod == 19){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["fcsd"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["fcsd"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["fcsd"]["line1"], function(k, v){
			$("#" + "fcsd_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["fcsd"]["line2"], function(k, v){
			$("#" + "fcsd_line2" + v).toggleClass("redBalls_active");
		});

	}else if(fcsd_playMethod == 28){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["fcsd"]["line1"].push(number+"");
		$.each(LotteryStorage["fcsd"]["line1"], function(k, v){
			$("#" + "fcsd_line1" + v).toggleClass("redBalls_active");
		});
	}
	fcsd_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function fcsd_checkOutRandom(playMethod){
	var obj = new Object();
	if(fcsd_playMethod == 0){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(fcsd_playMethod == 2){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(fcsd_playMethod == 4){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(fcsd_playMethod == 5){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(fcsd_playMethod == 27){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(0,10);
		if(line == 1){
			obj.nums = number + "|*|*";
		}else if(line == 2){
			obj.nums = "*|"+ number +"|*";
		}else if(line == 3){
			obj.nums = "*|*|"+number;
		}
		obj.notes = 1;
	}else if(fcsd_playMethod == 11 || fcsd_playMethod == 19){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(fcsd_playMethod == 28){
		obj.nums = mathUtil.getRandomNum(0,10);
		obj.notes = 1;
	}else if(fcsd_playMethod == 29){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}
	obj.sntuo = fcsd_sntuo;
	obj.multiple = 1;
	obj.rebates = fcsd_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('fcsd',fcsd_playMethod,obj);  //机选奖金计算
	obj.award = $('#fcsd_minAward').html();     //奖金
	obj.maxAward = $('#fcsd_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [fcsd_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function fcsd_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#fcsd_queding").bind('click', function(event) {

		fcsd_rebate = $("#fcsd_fandian option:last").val();
		if(parseInt($('#fcsd_zhushu').html()) <= 0 || Number($("#fcsd_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		fcsd_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#fcsd_modeId').val()) == 8){
            if (Number($('#fcsd_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

		//提示单挑奖金
		getDanTiaoBonus('fcsd',fcsd_playMethod);

		submitParams.lotteryType = "fcsd";
		submitParams.playType = LotteryInfo.getPlayName("sd",fcsd_playType);
		submitParams.playMethod = LotteryInfo.getMethodName("sd",fcsd_playMethod);
		submitParams.playTypeIndex = fcsd_playType;
		submitParams.playMethodIndex = fcsd_playMethod;
		var selectedBalls = [];

		if(fcsd_playMethod == 0 || fcsd_playMethod == 11 || fcsd_playMethod == 19){
			$("#fcsd_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(fcsd_playMethod == 2 || fcsd_playMethod == 4 || fcsd_playMethod == 5
			|| fcsd_playMethod == 28 || fcsd_playMethod == 29){
			$("#fcsd_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(fcsd_playMethod == 1 || fcsd_playMethod == 12 || fcsd_playMethod == 20){
			//去错误号
			fcsdValidateData("submit");
			var array = handleSingleStr($("#fcsd_single").val());
			var temp = "";
			for(var i = 0;i < array.length;i++){
				if(i == array.length - 1){
					temp = temp + array[i].split("").join("|");
				}else{
					temp = temp + array[i].split("").join("|") + " ";
				}
			}
			submitParams.nums = temp;
		}else if(fcsd_playMethod == 6){
			//去错误号
			fcsdValidateData("submit");
			var array = handleSingleStr($("#fcsd_single").val());
			var temp = "";
			for(var i = 0;i < array.length;i++){
				if(i == array.length - 1){
					temp = temp + array[i].split("").join(",");
				}else{
					temp = temp + array[i].split("").join(",") + " ";
				}
			}
			submitParams.nums = temp;
		}else if(fcsd_playMethod == 27){
			$("#fcsd_ballView div.ballView").each(function(){
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
		}
		localStorageUtils.setParam("playMode",$("#fcsd_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#fcsd_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#fcsd_fandian").val());
		submitParams.notes = $('#fcsd_zhushu').html();
		submitParams.sntuo = fcsd_sntuo;
		submitParams.multiple = $('#fcsd_beiNum').val();  //requirement
		submitParams.rebates = $('#fcsd_fandian').val();  //requirement
		submitParams.playMode = $('#fcsd_modeId').val();  //requirement
		submitParams.money = $('#fcsd_money').html();  //requirement
		submitParams.award = $('#fcsd_minAward').html();  //奖金
		submitParams.maxAward = $('#fcsd_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#fcsd_ballView").empty();
		fcsd_qingkongAll();
	});
}

/**
 * [fcsdValidateData 单式数据验证]
 */
function fcsdValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#fcsd_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	fcsdValidData(textStr,type);
}

function fcsdValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var result;
	var content = {};
	if(fcsd_playMethod == 1){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
	}else if(fcsd_playMethod == 12 || fcsd_playMethod == 20){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
	}else if(fcsd_playMethod == 6){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
	}

	$('#fcsd_delRepeat').off('click');
	$('#fcsd_delRepeat').on('click',function () {
		content.str = $('#fcsd_single').val() ? $('#fcsd_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		fcsdShowFooter(true,notes);
		$("#fcsd_single").val(array.join(" "));
	});
	
	$("#fcsd_single").val(result.num.join(" "));
	var notes = result.length;
	fcsdShowFooter(true,notes);
	return notes;
}

function fcsdShowFooter(isValid, notes){
	$('#fcsd_zhushu').text(notes);
	if($("#fcsd_modeId").val() == "8"){
		$('#fcsd_money').text(bigNumberUtil.multiply(notes * parseInt($("#fcsd_beiNum").val()),0.002));
	}else if ($("#fcsd_modeId").val() == "2"){
		$('#fcsd_money').text(bigNumberUtil.multiply(notes * parseInt($("#fcsd_beiNum").val()),0.2));
	}else if ($("#fcsd_modeId").val() == "1"){
		$('#fcsd_money').text(bigNumberUtil.multiply(notes * parseInt($("#fcsd_beiNum").val()),0.02));
	}else{
		$('#fcsd_money').text(bigNumberUtil.multiply(notes * parseInt($("#fcsd_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	fcsd_initFooterButton();
	calcAwardWin('fcsd', fcsd_playMethod);  //计算奖金和盈利
}