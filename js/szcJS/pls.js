
//定义福彩3D玩法标识
var pls_playType = 0;
var pls_playMethod = 0;
var pls_sntuo = 0;
var pls_rebate;
var plsScroll;

//进入这个页面时调用
function plsPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("pls")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("pls_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function plsPageUnloadedPanel(){
	$("#plsPage_back").off('click');
	$("#pls_queding").off('click');
	$("#pls_ballView").empty();
	$("#plsSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="plsPlaySelect"></select>');
	$("#plsSelect").append($select);
}
//入口函数
function pls_init(){
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
	$("#pls_title").html(LotteryInfo.getLotteryNameByTag("pls"));
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
				if(i == pls_playType && j == pls_playMethod){
					$play.append('<option value="pls'+LotteryInfo.getMethodIndex("sd",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="pls'+LotteryInfo.getMethodIndex("sd",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(pls_playMethod,onShowArray)>-1 ){
						pls_playType = i;
						pls_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#plsPlaySelect").append($play);
		}
	}
	
	if($("#plsPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("plsSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:plsChangeItem
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

	GetLotteryInfo("pls",function (){
		plsChangeItem("pls"+pls_playMethod);
	});

	//添加滑动条
	if(!plsScroll){
		plsScroll = new IScroll('#plsContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
    getQihao("pls",LotteryInfo.getLotteryIdByTag("pls"));

	//获取上一期开奖
	queryLastPrize("pls");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('pls');

	//返回
	$("#plsPage_back").on('click', function(event) {
		// pls_playType = 0;
		// pls_playMethod = 0;
		$("#pls_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		pls_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	//机选选号
	$("#pls_random").on('click', function(event) {
		pls_randomOne();
	});
	
	$("#pls_shuoming").html(LotteryInfo.getMethodShuoming("sd",pls_playMethod));
	//玩法说明
	$("#pls_paly_shuoming").off('click');
	$("#pls_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#pls_shuoming").text());
	});

	qingKong("pls");
	pls_submitData();
}


function plsResetPlayType(){
	pls_playType = 0;
	pls_playMethod = 0;
}

function plsChangeItem(val) {
	pls_qingkongAll();
	var temp = val.substring("pls".length,val.length);
	if(val == 'pls0'){
		//直选复式
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 0;
		pls_playMethod = 0;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("pls",tips,0,9,false,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}else if(val == 'pls1'){
		//直选单式
		$("#pls_random").hide();
		pls_sntuo = 3;
		pls_playType = 0;
		pls_playMethod = 1;
		pls_qingkongAll();
		var tips = "<p>格式说明<br/>直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("pls",tips);
	}else if(val == 'pls2'){
		//直选和值
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 0;
		pls_playMethod = 2;
		createSumLayout("pls",0,27,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}else if(val == 'pls4'){
		//直选复式
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 0;
		pls_playMethod = 4;
		createOneLineLayout("pls","请至少选择2个",0,9,false,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}else if(val == 'pls5'){
		//包号
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 0;
		pls_playMethod = 5;
		createOneLineLayout("pls","请至少选择3个",0,9,false,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}else if(val == 'pls6'){
		//直选单式
		$("#pls_random").hide();
		pls_sntuo = 3;
		pls_playType = 0;
		pls_playMethod = 6;
		pls_qingkongAll();
		var tips = "<p>格式说明<br/>混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("pls",tips);
	}else if(val == 'pls27'){
		//一星定位
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 3;
		pls_playMethod = 27;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("pls",tips,0,9,false,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}else if(val == 'pls11'){
		//直选复式
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 1;
		pls_playMethod = 11;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码"];
		createTwoLineLayout("pls",tips,0,9,false,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}else if(val == 'pls12'){
		//直选单式
		$("#pls_random").hide();
		pls_sntuo = 3;
		pls_playType = 1;
		pls_playMethod = 12;
		$("#pls_ballView").empty();
		pls_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("pls",tips);
	}else if(val == 'pls19'){
		//直选复式
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 2;
		pls_playMethod = 19;
		var tips = ["十位:至少选择1个号码","个位:至少选择1个号码"];
		createTwoLineLayout("pls",tips,0,9,false,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}else if(val == 'pls20'){
		//直选单式
		$("#pls_random").hide();
		pls_sntuo = 3;
		pls_playType = 2;
		pls_playMethod = 20;
		$("#pls_ballView").empty();
		pls_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("pls",tips);
	}else if(val == 'pls28'){
		//直选复式
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 4;
		pls_playMethod = 28;
		createOneLineLayout("pls","请至少选择1个",0,9,false,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}else if(val == 'pls29'){
		//直选单式
		$("#pls_random").show();
		pls_sntuo = 0;
		pls_playType = 4;
		pls_playMethod = 29;
		createOneLineLayout("pls","请至少选择2个",0,9,false,function(){
			pls_calcNotes();
		});
		pls_qingkongAll();
	}

	if(plsScroll){
		plsScroll.refresh();
		plsScroll.scrollTo(0,0,1);
	}
	
	$("#pls_shuoming").html(LotteryInfo.getMethodShuoming("sd",temp));
	
	initFooterData("pls",temp);
    hideRandomWhenLi("pls",pls_sntuo,pls_playMethod);
	pls_calcNotes();
}


/**
 * [pls_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function pls_initFooterButton(){
	if(pls_playMethod == 0 || pls_playMethod == 27){
		if(LotteryStorage["pls"]["line1"].length > 0
			|| LotteryStorage["pls"]["line2"].length > 0
			|| LotteryStorage["pls"]["line3"].length > 0){
			$("#pls_qingkong").css("opacity",1.0);
		}else{
			$("#pls_qingkong").css("opacity",0.4);
		}
	}else if(pls_playMethod == 2 || pls_playMethod == 4 || pls_playMethod == 5
		|| pls_playMethod == 28 || pls_playMethod == 29){
		if (LotteryStorage["pls"]["line1"].length > 0 ) {
			$("#pls_qingkong").css("opacity",1.0);
		}else{
			$("#pls_qingkong").css("opacity",0.4);
		}
	}else if (pls_playMethod == 11 || pls_playMethod == 19) {
		if(LotteryStorage["pls"]["line1"].length > 0
			|| LotteryStorage["pls"]["line2"].length > 0){
			$("#pls_qingkong").css("opacity",1.0);
		}else{
			$("#pls_qingkong").css("opacity",0.4);
		}
	}else{
		$("#pls_qingkong").css("opacity",0);
	}

	if($("#pls_qingkong").css("opacity") == "0"){
		$("#pls_qingkong").css("display","none");
	}else{
		$("#pls_qingkong").css("display","block");
	}

	if($('#pls_zhushu').html() > 0){
		$("#pls_queding").css("opacity",1.0);
	}else{
		$("#pls_queding").css("opacity",0.4);
	}
}

//清空所有记录
function pls_qingkongAll(){
	$("#pls_ballView span").removeClass('redBalls_active');
	LotteryStorage["pls"]["line1"] = [];
	LotteryStorage["pls"]["line2"] = [];
	LotteryStorage["pls"]["line3"] = [];

	localStorageUtils.removeParam("pls_line1");
	localStorageUtils.removeParam("pls_line2");
	localStorageUtils.removeParam("pls_line3");

	$('#pls_zhushu').text(0);
	$('#pls_money').text(0);
	clearAwardWin("pls");
	pls_initFooterButton();

}

/**
 * [pls_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function pls_calcNotes(){
	$('#pls_modeId').blur();
	$('#pls_fandian').blur();
	
	var notes = 0;
	if (pls_playMethod == 0) {
		notes = LotteryStorage["pls"]["line1"].length *
			LotteryStorage["pls"]["line2"].length *
			LotteryStorage["pls"]["line3"].length;
	}else if(pls_playMethod == 2){//和值
		for (var i = 0; i < LotteryStorage["pls"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(parseInt(LotteryStorage["pls"]["line1"][i]));
		}
	}else if(pls_playMethod == 4){//组三包号
		notes = mathUtil.getACombination(LotteryStorage["pls"]["line1"].length,2);
	}else if(pls_playMethod == 5){
		notes = mathUtil.getCCombination(LotteryStorage["pls"]["line1"].length,3);
	}else if(pls_playMethod == 27){//一星定位
		notes = LotteryStorage["pls"]["line1"].length +
			LotteryStorage["pls"]["line2"].length +
			LotteryStorage["pls"]["line3"].length;
	}else if(pls_playMethod == 11 || pls_playMethod == 19){//二星复式
		notes = LotteryStorage["pls"]["line1"].length *
			LotteryStorage["pls"]["line2"].length;
	}else if(pls_playMethod == 28){
		notes = LotteryStorage["pls"]["line1"].length;
	}else if(pls_playMethod == 29){
		notes = mathUtil.getCCombination(LotteryStorage["pls"]["line1"].length,2);
	}else{
		notes = plsValidData($("#pls_single").val());
	}

	//验证是否为空
	if( $("#pls_beiNum").val() =="" || parseInt($("#pls_beiNum").val()) == 0){
		$("#pls_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#pls_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#pls_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#pls_zhushu').text(notes);
		if($("#pls_modeId").val() == "8"){
			$('#pls_money').text(bigNumberUtil.multiply(notes * parseInt($("#pls_beiNum").val()),0.002));
		}else if ($("#pls_modeId").val() == "2"){
			$('#pls_money').text(bigNumberUtil.multiply(notes * parseInt($("#pls_beiNum").val()),0.2));
		}else if ($("#pls_modeId").val() == "1"){
			$('#pls_money').text(bigNumberUtil.multiply(notes * parseInt($("#pls_beiNum").val()),0.02));
		}else{
			$('#pls_money').text(bigNumberUtil.multiply(notes * parseInt($("#pls_beiNum").val()),2));
		}

	} else {
		$('#pls_zhushu').text(0);
		$('#pls_money').text(0);
	}
	pls_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('pls',pls_playMethod);
}

/**
 * [pls_randomOne 随机一注]
 * @return {[type]} [description]
 */
function pls_randomOne(){
	pls_qingkongAll();
	if(pls_playMethod == 0){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["pls"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["pls"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["pls"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["pls"]["line1"], function(k, v){
			$("#" + "pls_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["pls"]["line2"], function(k, v){
			$("#" + "pls_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["pls"]["line3"], function(k, v){
			$("#" + "pls_line3" + v).toggleClass("redBalls_active");
		});

	}else if(pls_playMethod == 2){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["pls"]["line1"].push(number+"");
		$.each(LotteryStorage["pls"]["line1"], function(k, v){
			$("#" + "pls_line1" + v).toggleClass("redBalls_active");
		});
	}else if(pls_playMethod == 4 || pls_playMethod == 29){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array, function (k,v) {
			LotteryStorage["pls"]["line1"].push(v+"");
		})

		$.each(LotteryStorage["pls"]["line1"], function(k, v){
			$("#" + "pls_line1" + v).toggleClass("redBalls_active");
		});
	}else if(pls_playMethod == 5){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array, function (k,v) {
			LotteryStorage["pls"]["line1"].push(v+"");
		})
		$.each(LotteryStorage["pls"]["line1"], function(k, v){
			$("#" + "pls_line1" + v).toggleClass("redBalls_active");
		});
	}else if(pls_playMethod == 27){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["pls"]["line"+line].push(number+"");
		$.each(LotteryStorage["pls"]["line"+line], function(k, v){
			$("#" + "pls_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(pls_playMethod == 11 || pls_playMethod == 19){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["pls"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["pls"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["pls"]["line1"], function(k, v){
			$("#" + "pls_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["pls"]["line2"], function(k, v){
			$("#" + "pls_line2" + v).toggleClass("redBalls_active");
		});

	}else if(pls_playMethod == 28){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["pls"]["line1"].push(number+"");
		$.each(LotteryStorage["pls"]["line1"], function(k, v){
			$("#" + "pls_line1" + v).toggleClass("redBalls_active");
		});
	}
	pls_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function pls_checkOutRandom(playMethod){
	var obj = new Object();
	if(pls_playMethod == 0){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(pls_playMethod == 2){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(pls_playMethod == 4){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(pls_playMethod == 5){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(pls_playMethod == 27){
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
	}else if(pls_playMethod == 11 || pls_playMethod == 19){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(pls_playMethod == 28){
		obj.nums = mathUtil.getRandomNum(0,10);
		obj.notes = 1;
	}else if(pls_playMethod == 29){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}
	obj.sntuo = pls_sntuo;
	obj.multiple = 1;
	obj.rebates = pls_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('pls',pls_playMethod,obj);  //机选奖金计算
	obj.award = $('#pls_minAward').html();     //奖金
	obj.maxAward = $('#pls_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [pls_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function pls_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#pls_queding").bind('click', function(event) {

		pls_rebate = $("#pls_fandian option:last").val();
		if(parseInt($('#pls_zhushu').html()) <= 0 || Number($("#pls_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		pls_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#pls_modeId').val()) == 8){
            if (Number($('#pls_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

		//提示单挑奖金
		getDanTiaoBonus('pls',pls_playMethod);

		submitParams.lotteryType = "pls";
		submitParams.playType = LotteryInfo.getPlayName("sd",pls_playType);
		submitParams.playMethod = LotteryInfo.getMethodName("sd",pls_playMethod);
		submitParams.playTypeIndex = pls_playType;
		submitParams.playMethodIndex = pls_playMethod;
		var selectedBalls = [];

		if(pls_playMethod == 0 || pls_playMethod == 11 || pls_playMethod == 19){
			$("#pls_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(pls_playMethod == 2 || pls_playMethod == 4 || pls_playMethod == 5
			|| pls_playMethod == 28 || pls_playMethod == 29){
			$("#pls_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(pls_playMethod == 1 || pls_playMethod == 12 || pls_playMethod == 20){
			//去错误号
			plsValidateData("submit");
			var array = handleSingleStr($("#pls_single").val());
			var temp = "";
			for(var i = 0;i < array.length;i++){
				if(i == array.length - 1){
					temp = temp + array[i].split("").join("|");
				}else{
					temp = temp + array[i].split("").join("|") + " ";
				}
			}
			submitParams.nums = temp;
		}else if(pls_playMethod == 6){
			//去错误号
			plsValidateData("submit");
			var array = handleSingleStr($("#pls_single").val());
			var temp = "";
			for(var i = 0;i < array.length;i++){
				if(i == array.length - 1){
					temp = temp + array[i].split("").join(",");
				}else{
					temp = temp + array[i].split("").join(",") + " ";
				}
			}
			submitParams.nums = temp;
		}else if(pls_playMethod == 27){
			$("#pls_ballView div.ballView").each(function(){
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
		localStorageUtils.setParam("playMode",$("#pls_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#pls_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#pls_fandian").val());
		submitParams.notes = $('#pls_zhushu').html();
		submitParams.sntuo = pls_sntuo;
		submitParams.multiple = $('#pls_beiNum').val();  //requirement
		submitParams.rebates = $('#pls_fandian').val();  //requirement
		submitParams.playMode = $('#pls_modeId').val();  //requirement
		submitParams.money = $('#pls_money').html();  //requirement
		submitParams.award = $('#pls_minAward').html();  //奖金
		submitParams.maxAward = $('#pls_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#pls_ballView").empty();
		pls_qingkongAll();
	});
}

/**
 * [plsValidateData 单式数据验证]
 */
function plsValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#pls_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	plsValidData(textStr,type);
}

function plsValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var result;
	var content = {};
	if(pls_playMethod == 1){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
	}else if(pls_playMethod == 12 || pls_playMethod == 20){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
	}else if(pls_playMethod == 6){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
	}

	$('#pls_delRepeat').off('click');
	$('#pls_delRepeat').on('click',function () {
		content.str = $('#pls_single').val() ? $('#pls_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		plsShowFooter(true,notes);
		$("#pls_single").val(array.join(" "));
	});
	
	$("#pls_single").val(result.num.join(" "));
	var notes = result.length;
	plsShowFooter(true,notes);
	return notes;
}

function plsShowFooter(isValid, notes){
	$('#pls_zhushu').text(notes);
	if($("#pls_modeId").val() == "8"){
		$('#pls_money').text(bigNumberUtil.multiply(notes * parseInt($("#pls_beiNum").val()),0.002));
	}else if ($("#pls_modeId").val() == "2"){
		$('#pls_money').text(bigNumberUtil.multiply(notes * parseInt($("#pls_beiNum").val()),0.2));
	}else if ($("#pls_modeId").val() == "1"){
		$('#pls_money').text(bigNumberUtil.multiply(notes * parseInt($("#pls_beiNum").val()),0.02));
	}else{
		$('#pls_money').text(bigNumberUtil.multiply(notes * parseInt($("#pls_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	pls_initFooterButton();
	calcAwardWin('pls', pls_playMethod);  //计算奖金和盈利
}