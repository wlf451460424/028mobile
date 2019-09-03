var hljesf_playType = 1;
var hljesf_playMethod = 7;
var hljesf_sntuo = 0;
var hljesf_rebate;
var hljesfScroll;

//进入这个页面时调用
function hljesfPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hljesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hljesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hljesfPageUnloadedPanel(){
	$("#hljesfPage_back").off('click');
	$("#hljesf_queding").off('click');
	$("#hljesf_ballView").empty();
	$("#hljesfSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hljesfPlaySelect"></select>');
	$("#hljesfSelect").append($select);
}

//入口函数
function hljesf_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("esf").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("esf")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("esf")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
	$("#hljesf_title").html(LotteryInfo.getLotteryNameByTag("hljesf"));
	for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
		if(i == 5)continue;
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
				var name = LotteryInfo.getMethodName("esf",j);
				if(i == hljesf_playType && j == hljesf_playMethod){
					$play.append('<option value="hljesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hljesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hljesf_playMethod,onShowArray)>-1 ){
						hljesf_playType = i;
						hljesf_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hljesfPlaySelect").append($play);
		}
	}
	
	if($("#hljesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("hljesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hljesfChangeItem
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

	GetLotteryInfo("hljesf",function (){
		hljesfChangeItem("hljesf"+hljesf_playMethod);
	});

	//添加滑动条
	if(!hljesfScroll){
		hljesfScroll = new IScroll('#hljesfContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("hljesf",LotteryInfo.getLotteryIdByTag("hljesf"));

	//获取上一期开奖
	queryLastPrize("hljesf");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('hljesf');

	//机选选号
	$("#hljesf_random").on('click', function(event) {
		hljesf_randomOne();
	});
	
	$("#hljesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",hljesf_playMethod));
	//玩法说明
	$("#hljesf_paly_shuoming").off('click');
	$("#hljesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hljesf_shuoming").text());
	});

	//返回
	$("#hljesfPage_back").on('click', function(event) {
		// hljesf_playType = 0;
		// hljesf_playMethod = 0;
		$("#hljesf_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		hljesf_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("hljesf");//清空
	hljesf_submitData();
}

function hljesfResetPlayType(){
	hljesf_playType = 0;
	hljesf_playMethod = 0;
}

function hljesfChangeItem(val){
	hljesf_qingkongAll();

	var temp = val.substring("hljesf".length,val.length);

	if(val == 'hljesf1'){
		$("#hljesf_random").hide();
		hljesf_sntuo = 3;
		hljesf_playType = 0;
		hljesf_playMethod = 1;
		$("#hljesf_ballView").empty();
		hljesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hljesf",tips);
	}else if(val == 'hljesf5'){
		$("#hljesf_random").hide();
		hljesf_sntuo = 3;
		hljesf_playType = 0;
		hljesf_playMethod = 5;
		$("#hljesf_ballView").empty();
		hljesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hljesf",tips);
	}else if(val == 'hljesf8'){
		$("#hljesf_random").hide();
		hljesf_sntuo = 3;
		hljesf_playType = 1;
		hljesf_playMethod = 8;
		$("#hljesf_ballView").empty();
		hljesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hljesf",tips);
	}else if(val == 'hljesf12'){
		$("#hljesf_random").hide();
		hljesf_sntuo = 3;
		hljesf_playType = 1;
		hljesf_playMethod = 12;
		$("#hljesf_ballView").empty();
		hljesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hljesf",tips);
	}else if(parseInt(temp) == 14){
		$("#hljesf_random").show();
		hljesf_sntuo = 0;
		hljesf_playType = 2;
		hljesf_playMethod = parseInt(temp);
		createOneLineLayout("hljesf","请至少选择1个",1,11,true,function(){
			hljesf_calcNotes();
		});
	}else if(val == 'hljesf7'){
		$("#hljesf_random").show();
		hljesf_sntuo = 0;
		hljesf_playType = 1;
		hljesf_playMethod = 7;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tips = [tip1,tip2];
		createTwoLineLayout("hljesf",tips,1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf9'){
		$("#hljesf_random").show();
		hljesf_sntuo = 2;
		hljesf_playType = 1;
		hljesf_playMethod = 9;
		createOneLineLayout("hljesf","请至少选择2个",1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf10'){
		$("#hljesf_random").hide();
		hljesf_sntuo = 1;
		hljesf_playType = 1;
		hljesf_playMethod = 10;
		createDanTuoSpecLayout("hljesf",1,1,10,1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf11'){
		$("#hljesf_random").show();
		hljesf_sntuo = 0;
		hljesf_playType = 1;
		hljesf_playMethod = 11;
		createOneLineLayout("hljesf","请至少选择2个",1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf13'){
		$("#hljesf_random").hide();
		hljesf_sntuo = 1;
		hljesf_playType = 1;
		hljesf_playMethod = 13;
		createDanTuoLayout("hljesf",1,1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf0'){
		$("#hljesf_random").show();
		hljesf_sntuo = 0;
		hljesf_playType = 0;
		hljesf_playMethod = 0;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("hljesf",tips,1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf2'){
		$("#hljesf_random").show();
		hljesf_sntuo = 2;
		hljesf_playType = 0;
		hljesf_playMethod = 2;
		createOneLineLayout("hljesf","请至少选择3个",1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf3'){
		$("#hljesf_random").hide();
		hljesf_sntuo = 1;
		hljesf_playType = 0;
		hljesf_playMethod = 3;
		createDanTuoSpecLayout("hljesf",2,1,10,1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf4'){
		$("#hljesf_random").show();
		hljesf_sntuo = 0;
		hljesf_playType = 0;
		hljesf_playMethod = 4;
		createOneLineLayout("hljesf","请至少选择3个",1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf6'){
		$("#hljesf_random").hide();
		hljesf_sntuo = 1;
		hljesf_playType = 0;
		hljesf_playMethod = 6;
		createDanTuoLayout("hljesf",2,1,11,true,function(){
			hljesf_calcNotes();
		});
		hljesf_qingkongAll();
	}else if(val == 'hljesf16'){
		$("#hljesf_random").show();
		hljesf_sntuo = 0;
		hljesf_playType = 4;
		hljesf_playMethod = 16;
		hljesf_qingkongAll();
		createOneLineLayout("hljesf","前三位：请至少选择1个",1,11,true,function(){
			hljesf_calcNotes();
		});
	}else if(val == 'hljesf15'){
		$("#hljesf_random").show();
		hljesf_sntuo = 0;
		hljesf_playType = 3;
		hljesf_playMethod = 15;
		hljesf_qingkongAll();
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("hljesf",tips,1,11,true,function(){
			hljesf_calcNotes();
		});
	}else if(parseInt(temp) < 27 && parseInt(temp) > 18){
		$("#hljesf_random").show();
		hljesf_sntuo = 0;
		hljesf_playType = 6;
		hljesf_playMethod = parseInt(temp);
		createOneLineLayout("hljesf","请至少选择"+(hljesf_playMethod - 18)+"个",1,11,true,function(){
			hljesf_calcNotes();
		});
	}else if(parseInt(temp) < 35 && parseInt(temp) > 26){
		$("#hljesf_random").hide();
		hljesf_sntuo = 3;
		hljesf_playType = 7;
		hljesf_playMethod = parseInt(temp);
		$("#hljesf_ballView").empty();
		hljesf_qingkongAll();
		var array = [
			"01",
			"01 02 或 0102",
			"01 02 03 或 010203",
			"01 02 03 04 或 01020304",
			"01 02 03 04 05 或 0102030405",
			"01 02 03 04 05 06 或 010203040506",
			"01 02 03 04 05 06 07 或 01020304050607",
			"01 02 03 04 05 06 07 08 或 0102030405060708"
		];
        var name = [
            "一中一",
            "二中二",
            "三中三",
            "四中四",
            "五中五",
            "六中五",
            "七中五",
            "八中五",
        ];
		var tips = "<p>格式说明<br/>"+name[hljesf_playMethod - 27]+":"+ (array[hljesf_playMethod - 27]) +"<br/>1)每注必须是"+(hljesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hljesf",tips);
	}else if(parseInt(temp) < 42 && parseInt(temp) > 34){
		$("#hljesf_random").hide();
		hljesf_sntuo = 1;
		hljesf_playType = 8;
		hljesf_playMethod = parseInt(temp);
		createDanTuoLayout("hljesf",hljesf_playMethod-34,1,11,true,function(){
			hljesf_calcNotes();
		});
	}

	if(hljesfScroll){
		hljesfScroll.refresh();
		hljesfScroll.scrollTo(0,0,1);
	}
	
	$("#hljesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
	
	initFooterData("hljesf",temp);
	hideRandomWhenLi("hljesf",hljesf_sntuo,hljesf_playMethod);
	hljesf_calcNotes();
}

/**
 * [hljesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hljesf_initFooterButton(){
	if (hljesf_playType == 6 || hljesf_playType == 2 || hljesf_playType == 4) {
		if (LotteryStorage["hljesf"]["line1"].length > 0) {
			$("#hljesf_qingkong").css("opacity",1.0);
		}else{
			$("#hljesf_qingkong").css("opacity",0.4);
		}
	}else if(hljesf_playType == 8){
		if (LotteryStorage["hljesf"]["line1"].length > 0 || LotteryStorage["hljesf"]["line2"].length > 0) {
			$("#hljesf_qingkong").css("opacity",1.0);
		}else{
			$("#hljesf_qingkong").css("opacity",0.4);
		}
	}else if(hljesf_playType == 3){
		if(LotteryStorage["hljesf"]["line1"].length > 0
			|| LotteryStorage["hljesf"]["line2"].length > 0
			|| LotteryStorage["hljesf"]["line3"].length > 0){
			$("#hljesf_qingkong").css("opacity",1.0);
		}else{
			$("#hljesf_qingkong").css("opacity",0.4);
		}
	}else if(hljesf_playType == 1){
		if (hljesf_playMethod == 7 || hljesf_playMethod == 10 || hljesf_playMethod == 13) {
			if(LotteryStorage["hljesf"]["line1"].length > 0
				|| LotteryStorage["hljesf"]["line2"].length > 0){
				$("#hljesf_qingkong").css("opacity",1.0);
			}else{
				$("#hljesf_qingkong").css("opacity",0.4);
			}
		}else if(hljesf_playMethod == 9 || hljesf_playMethod == 11){
			if(LotteryStorage["hljesf"]["line1"].length > 0){
				$("#hljesf_qingkong").css("opacity",1.0);
			}else{
				$("#hljesf_qingkong").css("opacity",0.4);
			}
		}else if(hljesf_playMethod == 8 || hljesf_playMethod == 12){
			$("#hljesf_qingkong").css("opacity",0);
		}
	}else if(hljesf_playType == 0){
		if (hljesf_playMethod == 0) {
			if(LotteryStorage["hljesf"]["line1"].length > 0
				|| LotteryStorage["hljesf"]["line2"].length > 0
				|| LotteryStorage["hljesf"]["line3"].length > 0){
				$("#hljesf_qingkong").css("opacity",1.0);
			}else{
				$("#hljesf_qingkong").css("opacity",0.4);
			}
		}else if(hljesf_playMethod == 3 || hljesf_playMethod == 6){
			if(LotteryStorage["hljesf"]["line1"].length > 0
				|| LotteryStorage["hljesf"]["line2"].length > 0){
				$("#hljesf_qingkong").css("opacity",1.0);
			}else{
				$("#hljesf_qingkong").css("opacity",0.4);
			}
		}else if(hljesf_playMethod == 2 || hljesf_playMethod == 4){
			if(LotteryStorage["hljesf"]["line1"].length > 0){
				$("#hljesf_qingkong").css("opacity",1.0);
			}else{
				$("#hljesf_qingkong").css("opacity",0.4);
			}
		}else if(hljesf_playMethod == 1 || hljesf_playMethod == 5){
			$("#hljesf_qingkong").css("opacity",0);
		}
	}else{
		$("#hljesf_qingkong").css("opacity",0);
	}

	if($("#hljesf_qingkong").css("opacity") == "0"){
		$("#hljesf_qingkong").css("display","none");
	}else{
		$("#hljesf_qingkong").css("display","block");
	}

	if($('#hljesf_zhushu').html() > 0){
		$("#hljesf_queding").css("opacity",1.0);
	}else{
		$("#hljesf_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  hljesf_qingkongAll(){
	$("#hljesf_ballView span").removeClass('redBalls_active');
	LotteryStorage["hljesf"]["line1"] = [];
	LotteryStorage["hljesf"]["line2"] = [];
	LotteryStorage["hljesf"]["line3"] = [];

	localStorageUtils.removeParam("hljesf_line1");
	localStorageUtils.removeParam("hljesf_line2");
	localStorageUtils.removeParam("hljesf_line3");

	$('#hljesf_zhushu').text(0);
	$('#hljesf_money').text(0);
	clearAwardWin("hljesf");
	hljesf_initFooterButton();
}

/**
 * [hljesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hljesf_calcNotes(){
	$('#hljesf_modeId').blur();
	$('#hljesf_fandian').blur();
	
	var notes = 0;

	if (hljesf_playType == 6) {
		notes = mathUtil.getCCombination(LotteryStorage["hljesf"]["line1"].length,hljesf_playMethod - 18);
	}else if(hljesf_playType == 8){
		if(LotteryStorage["hljesf"]["line1"].length == 0 || LotteryStorage["hljesf"]["line2"].length == 0){
			notes = 0;
		}else{
			notes = mathUtil.getCCombination(LotteryStorage["hljesf"]["line2"].length,(hljesf_playMethod - 33)-LotteryStorage["hljesf"]["line1"].length);
		}
	}else if(hljesf_playType == 2 || hljesf_playType == 4){
		notes = LotteryStorage["hljesf"]["line1"].length;
	}else if(hljesf_playType == 1){
		if (hljesf_playMethod == 7){
			for (var i = 0; i < LotteryStorage["hljesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["hljesf"]["line2"].length; j++) {
					if(LotteryStorage["hljesf"]["line1"][i] != LotteryStorage["hljesf"]["line2"][j]){
						notes++ ;
					}
				}
			}
		}else if(hljesf_playMethod == 9){
			notes = mathUtil.getACombination(LotteryStorage["hljesf"]["line1"].length,2);
		}else if(hljesf_playMethod == 10){
			if(LotteryStorage["hljesf"]["line1"].length == 0 || LotteryStorage["hljesf"]["line2"].length == 0){
				notes = 0;
			}else{
				notes = 2 * mathUtil.getCCombination(LotteryStorage["hljesf"]["line2"].length,1);
			}
		}else if(hljesf_playMethod == 11){
			notes = mathUtil.getCCombination(LotteryStorage["hljesf"]["line1"].length,2);
		}else if(hljesf_playMethod == 13){
			if(LotteryStorage["hljesf"]["line1"].length == 0 || LotteryStorage["hljesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["hljesf"]["line2"].length,1);
			}
		}else{  //单式
			notes = hljesfValidateData('onblur');
		}
	}else if(hljesf_playType == 0){
		if (hljesf_playMethod == 0){
			for (var i = 0; i < LotteryStorage["hljesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["hljesf"]["line2"].length; j++) {
					for (var k = 0; k < LotteryStorage["hljesf"]["line3"].length; k++) {
						if(LotteryStorage["hljesf"]["line1"][i] != LotteryStorage["hljesf"]["line2"][j]
							&&LotteryStorage["hljesf"]["line1"][i] != LotteryStorage["hljesf"]["line3"][k]
							&& LotteryStorage["hljesf"]["line2"][j] != LotteryStorage["hljesf"]["line3"][k]){
							notes++ ;
						}
					}
				}
			}
		}else if(hljesf_playMethod == 2){
			notes = mathUtil.getACombination(LotteryStorage["hljesf"]["line1"].length,3);
		}else if(hljesf_playMethod == 3){
			if(LotteryStorage["hljesf"]["line1"].length == 0 || LotteryStorage["hljesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = 6 * mathUtil.getCCombination(LotteryStorage["hljesf"]["line2"].length,3 - LotteryStorage["hljesf"]["line1"].length);
			}
		}else if(hljesf_playMethod == 4){
			notes = mathUtil.getCCombination(LotteryStorage["hljesf"]["line1"].length,3);
		}else if(hljesf_playMethod == 6){
			if(LotteryStorage["hljesf"]["line1"].length == 0 || LotteryStorage["hljesf"]["line2"].length == 0
				|| LotteryStorage["hljesf"]["line1"].length + LotteryStorage["hljesf"]["line2"].length < 3){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["hljesf"]["line2"].length,3 - LotteryStorage["hljesf"]["line1"].length);
			}
		}else{  //单式
			notes = hljesfValidateData('onblur');
		}
	}else if(hljesf_playType == 3){
		notes = LotteryStorage["hljesf"]["line1"].length + LotteryStorage["hljesf"]["line2"].length + LotteryStorage["hljesf"]["line3"].length;
	}else{  //单式
		notes = hljesfValidateData('onblur');
	}

	hideRandomWhenLi('hljesf',hljesf_sntuo,hljesf_playMethod);

	//验证是否为空
	if( $("#hljesf_beiNum").val() =="" || parseInt($("#hljesf_beiNum").val()) == 0){
		$("#hljesf_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#hljesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple")) ){
		$("#hljesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#hljesf_zhushu').text(notes);
		if($("#hljesf_modeId").val() == "8"){
			$('#hljesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljesf_beiNum").val()),0.002));
		}else if ($("#hljesf_modeId").val() == "2"){
			$('#hljesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljesf_beiNum").val()),0.2));
		}else if ($("#hljesf_modeId").val() == "1"){
			$('#hljesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljesf_beiNum").val()),0.02));
		}else{
			$('#hljesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljesf_beiNum").val()),2));
		}
	} else {
		$('#hljesf_zhushu').text(0);
		$('#hljesf_money').text(0);
	}
	hljesf_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('hljesf',hljesf_playMethod);
}

/**
 * [hljesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hljesf_randomOne(){
	hljesf_qingkongAll();
	if(hljesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(hljesf_playMethod - 18,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["hljesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "hljesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljesf_playMethod == 14){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["hljesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["hljesf"]["line1"], function(k, v){
			$("#" + "hljesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(hljesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		LotteryStorage["hljesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["hljesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

		$.each(LotteryStorage["hljesf"]["line1"], function(k, v){
			$("#" + "hljesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljesf"]["line2"], function(k, v){
			$("#" + "hljesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(hljesf_playMethod == 9 || hljesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["hljesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "hljesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		LotteryStorage["hljesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["hljesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
		LotteryStorage["hljesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

		$.each(LotteryStorage["hljesf"]["line1"], function(k, v){
			$("#" + "hljesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljesf"]["line2"], function(k, v){
			$("#" + "hljesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljesf"]["line3"], function(k, v){
			$("#" + "hljesf_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(hljesf_playMethod == 2 || hljesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["hljesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "hljesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["hljesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["hljesf"]["line1"], function(k, v){
			$("#" + "hljesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(hljesf_playMethod == 15){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["hljesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["hljesf"]["line"+line], function(k, v){
			$("#" + "hljesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
		});
	}
	hljesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hljesf_checkOutRandom(playMethod){
	var obj = new Object();
	if(hljesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(hljesf_playMethod - 18,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hljesf_playMethod == 14 || hljesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		obj.nums = number < 10 ? "0"+number : number;
		obj.notes = 1;
	}else if(hljesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(hljesf_playMethod == 9){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(hljesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hljesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(hljesf_playMethod == 2){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 6;
	}else if(hljesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hljesf_playMethod == 15){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(1,12);
		var temp = number < 10 ? "0"+number : number;
		if(line == 1){
			obj.nums = temp+"|*|*";
		}else if(line == 2){
			obj.nums = "*|"+temp+"|*";
		}else if(line == 3){
			obj.nums = "*|*|"+temp;
		}
		obj.notes = 1;
	}
	obj.sntuo = hljesf_sntuo;
	obj.multiple = 1;
	obj.rebates = hljesf_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('hljesf',hljesf_playMethod,obj);  //机选奖金计算
	obj.award = $('#hljesf_minAward').html();     //奖金
	obj.maxAward = $('#hljesf_maxAward').html();  //多级奖金
	return obj;
}


/**
 * [hljesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hljesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#hljesf_queding").bind('click', function(event) {
		hljesf_rebate = $("#hljesf_fandian option:last").val();
		if(parseInt($('#hljesf_zhushu').html()) <= 0 || Number($("#hljesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hljesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#hljesf_modeId').val()) == 8){
			if (Number($('#hljesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('hljesf',hljesf_playMethod);

		submitParams.lotteryType = "hljesf";
		var playType = LotteryInfo.getPlayName("esf",hljesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",hljesf_playMethod);
		submitParams.playTypeIndex = hljesf_playType;
		submitParams.playMethodIndex = hljesf_playMethod;
		var selectedBalls = [];
		if (hljesf_playType == 6 || hljesf_playType == 2 || hljesf_playType == 4) {
			$("#hljesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(hljesf_playType == 8){
			if(parseInt($('#hljesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#hljesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(hljesf_playType == 1 || hljesf_playType == 0){
			if(hljesf_playMethod == 7 || hljesf_playMethod == 0){
				$("#hljesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(hljesf_playMethod == 9 || hljesf_playMethod == 11 || hljesf_playMethod == 2 || hljesf_playMethod == 4){
				$("#hljesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(hljesf_playMethod == 10 || hljesf_playMethod == 13 || hljesf_playMethod == 3 || hljesf_playMethod == 6){
				if(parseInt($('#hljesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#hljesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(hljesf_playMethod == 1 || hljesf_playMethod == 8){//直选单式
				//去错误号
				hljesfValidateData("submit");
				var arr = $("#hljesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(hljesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(hljesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(hljesf_playMethod == 5 || hljesf_playMethod == 12){//组选单式
				//去错误号
				hljesfValidateData("submit");
				var arr = $("#hljesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(hljesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(hljesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(hljesf_playMethod == 15) {
			$("#hljesf_ballView div.ballView").each(function(){
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
		}else {//任选单式
			//去错误号
			hljesfValidateData("submit");
			var arr = $("#hljesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(hljesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(hljesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(hljesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(hljesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(hljesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(hljesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(hljesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#hljesf_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#hljesf_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#hljesf_fandian").val());
		submitParams.notes = $('#hljesf_zhushu').html();
		submitParams.sntuo = hljesf_sntuo;
		submitParams.multiple = $('#hljesf_beiNum').val();  //requirement
		submitParams.rebates = $('#hljesf_fandian').val();  //requirement
		submitParams.playMode = $('#hljesf_modeId').val();  //requirement
		submitParams.money = $('#hljesf_money').html();  //requirement
		submitParams.award = $('#hljesf_minAward').html();  //奖金
		submitParams.maxAward = $('#hljesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#hljesf_ballView").empty();
		hljesf_qingkongAll();
	});
}

function hljesfValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#hljesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
	var	result,
		content = {};
    if(hljesf_playMethod == 1){  //前三直选单式
		content.str = str;
		content.weishu = 8;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if( hljesf_playMethod == 8){  //前二直选单式
		content.str = str;
		content.weishu = 5;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    } else if(hljesf_playMethod == 5){  //前三组选单式
		content.str = str;
		content.weishu = 8;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if(hljesf_playMethod == 12){  //前二组选单式
		content.str = str;
		content.weishu = 5;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if (hljesf_playMethod > 26 && hljesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(hljesf_playMethod - 26);
		content.str = str;
		content.weishu = 3*weiNum-1;
		content.renXuan = true;
		content.select = true;
		result = handleSingleStr_deleteErr(content,type);
    }

	$('#hljesf_delRepeat').off('click');
	$('#hljesf_delRepeat').on('click',function () {
		content.str = $('#hljesf_single').val() ? $('#hljesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		hljesfShowFooter(true,notes);
		$("#hljesf_single").val(array.join(","));
	});
	
    $("#hljesf_single").val(result.num.join(","));
    var notes = result.length;
    hljesfShowFooter(true,notes);
	return notes;
}

function hljesfShowFooter(isValid,notes){
    $('#hljesf_zhushu').text(notes);
    if($("#hljesf_modeId").val() == "8"){
        $('#hljesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljesf_beiNum").val()),0.002));
    }else if ($("#hljesf_modeId").val() == "2"){
        $('#hljesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljesf_beiNum").val()),0.2));
    }else if ($("#hljesf_modeId").val() == "1"){
        $('#hljesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljesf_beiNum").val()),0.02));
    }else{
        $('#hljesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    hljesf_initFooterButton();
    calcAwardWin('hljesf',hljesf_playMethod);  //计算奖金和盈利
}