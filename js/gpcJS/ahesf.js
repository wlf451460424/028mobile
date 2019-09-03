var ahesf_playType = 1;
var ahesf_playMethod = 7;
var ahesf_sntuo = 0;
var ahesf_rebate;
var ahesfScroll;

//进入这个页面时调用
function ahesfPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("ahesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("ahesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function ahesfPageUnloadedPanel(){
	$("#ahesfPage_back").off('click');
	$("#ahesf_queding").off('click');
	$("#ahesf_ballView").empty();
	$("#ahesfSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="ahesfPlaySelect"></select>');
	$("#ahesfSelect").append($select);
}

//入口函数
function ahesf_init(){
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
	$("#ahesf_title").html(LotteryInfo.getLotteryNameByTag("ahesf"));
	for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
		if(i == 5)continue;
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
				var name = LotteryInfo.getMethodName("esf",j);
				if(i == ahesf_playType && j == ahesf_playMethod){
					$play.append('<option value="ahesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="ahesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(ahesf_playMethod,onShowArray)>-1 ){
						ahesf_playType = i;
						ahesf_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#ahesfPlaySelect").append($play);
		}
	}
	
	if($("#ahesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("ahesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:ahesfChangeItem
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

	GetLotteryInfo("ahesf",function (){
		ahesfChangeItem("ahesf"+ahesf_playMethod);
	});

	//添加滑动条
	if(!ahesfScroll){
		ahesfScroll = new IScroll('#ahesfContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("ahesf",LotteryInfo.getLotteryIdByTag("ahesf"));

	//获取上一期开奖
	queryLastPrize("ahesf");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('ahesf');

	//机选选号
	$("#ahesf_random").on('click', function(event) {
		ahesf_randomOne();
	});
	
	$("#ahesfPage_shuoming").html(LotteryInfo.getMethodShuoming("esf",ahesf_playMethod));
	//玩法说明
	$("#ahesfPage_paly_shuoming").off('click');
	$("#ahesfPage_paly_shuoming").on('click', function(event) {
		toastUtils.showToast($("#ahesfPage_shuoming").text());
	});
	
	//返回
	$("#ahesfPage_back").on('click', function(event) {
		// ahesf_playType = 0;
		// ahesf_playMethod = 0;
		$("#ahesf_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		ahesf_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("ahesf");//清空
	ahesf_submitData();
}

function ahesfResetPlayType(){
	ahesf_playType = 0;
	ahesf_playMethod = 0;
}

function ahesfChangeItem(val){
	ahesf_qingkongAll();

	var temp = val.substring("ahesf".length,val.length);

	if(val == 'ahesf1'){
		$("#ahesf_random").hide();
		ahesf_sntuo = 3;
		ahesf_playType = 0;
		ahesf_playMethod = 1;
		$("#ahesf_ballView").empty();
		ahesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("ahesf",tips);
	}else if(val == 'ahesf5'){
		$("#ahesf_random").hide();
		ahesf_sntuo = 3;
		ahesf_playType = 0;
		ahesf_playMethod = 5;
		$("#ahesf_ballView").empty();
		ahesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("ahesf",tips);
	}else if(val == 'ahesf8'){
		$("#ahesf_random").hide();
		ahesf_sntuo = 3;
		ahesf_playType = 1;
		ahesf_playMethod = 8;
		$("#ahesf_ballView").empty();
		ahesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("ahesf",tips);
	}else if(val == 'ahesf12'){
		$("#ahesf_random").hide();
		ahesf_sntuo = 3;
		ahesf_playType = 1;
		ahesf_playMethod = 12;
		$("#ahesf_ballView").empty();
		ahesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("ahesf",tips);
	}else if(parseInt(temp) == 14){
		$("#ahesf_random").show();
		ahesf_sntuo = 0;
		ahesf_playType = 2;
		ahesf_playMethod = parseInt(temp);
		createOneLineLayout("ahesf","请至少选择1个",1,11,true,function(){
			ahesf_calcNotes();
		});
	}else if(val == 'ahesf7'){
		$("#ahesf_random").show();
		ahesf_sntuo = 0;
		ahesf_playType = 1;
		ahesf_playMethod = 7;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tips = [tip1,tip2];
		createTwoLineLayout("ahesf",tips,1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf9'){
		$("#ahesf_random").show();
		ahesf_sntuo = 2;
		ahesf_playType = 1;
		ahesf_playMethod = 9;
		createOneLineLayout("ahesf","请至少选择2个",1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf10'){
		$("#ahesf_random").hide();
		ahesf_sntuo = 1;
		ahesf_playType = 1;
		ahesf_playMethod = 10;
		createDanTuoSpecLayout("ahesf",1,1,10,1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf11'){
		$("#ahesf_random").show();
		ahesf_sntuo = 0;
		ahesf_playType = 1;
		ahesf_playMethod = 11;
		createOneLineLayout("ahesf","请至少选择2个",1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf13'){
		$("#ahesf_random").hide();
		ahesf_sntuo = 1;
		ahesf_playType = 1;
		ahesf_playMethod = 13;
		createDanTuoLayout("ahesf",1,1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf0'){
		$("#ahesf_random").show();
		ahesf_sntuo = 0;
		ahesf_playType = 0;
		ahesf_playMethod = 0;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("ahesf",tips,1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf2'){
		$("#ahesf_random").show();
		ahesf_sntuo = 2;
		ahesf_playType = 0;
		ahesf_playMethod = 2;
		createOneLineLayout("ahesf","请至少选择3个",1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf3'){
		$("#ahesf_random").hide();
		ahesf_sntuo = 1;
		ahesf_playType = 0;
		ahesf_playMethod = 3;
		createDanTuoSpecLayout("ahesf",2,1,10,1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf4'){
		$("#ahesf_random").show();
		ahesf_sntuo = 0;
		ahesf_playType = 0;
		ahesf_playMethod = 4;
		createOneLineLayout("ahesf","请至少选择3个",1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf6'){
		$("#ahesf_random").hide();
		ahesf_sntuo = 1;
		ahesf_playType = 0;
		ahesf_playMethod = 6;
		createDanTuoLayout("ahesf",2,1,11,true,function(){
			ahesf_calcNotes();
		});
		ahesf_qingkongAll();
	}else if(val == 'ahesf16'){
		$("#ahesf_random").show();
		ahesf_sntuo = 0;
		ahesf_playType = 4;
		ahesf_playMethod = 16;
		ahesf_qingkongAll();
		createOneLineLayout("ahesf","前三位：请至少选择1个",1,11,true,function(){
			ahesf_calcNotes();
		});
	}else if(val == 'ahesf15'){
		$("#ahesf_random").show();
		ahesf_sntuo = 0;
		ahesf_playType = 3;
		ahesf_playMethod = 15;
		ahesf_qingkongAll();
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("ahesf",tips,1,11,true,function(){
			ahesf_calcNotes();
		});
	}else if(parseInt(temp) < 27 && parseInt(temp) > 18){
		$("#ahesf_random").show();
		ahesf_sntuo = 0;
		ahesf_playType = 6;
		ahesf_playMethod = parseInt(temp);
		createOneLineLayout("ahesf","请至少选择"+(ahesf_playMethod - 18)+"个",1,11,true,function(){
			ahesf_calcNotes();
		});
	}else if(parseInt(temp) < 35 && parseInt(temp) > 26){
		$("#ahesf_random").hide();
		ahesf_sntuo = 3;
		ahesf_playType = 7;
		ahesf_playMethod = parseInt(temp);
		$("#ahesf_ballView").empty();
		ahesf_qingkongAll();
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
		var tips = "<p>格式说明<br/>"+name[ahesf_playMethod - 27]+":"+ (array[ahesf_playMethod - 27]) +"<br/>1)每注必须是"+(ahesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("ahesf",tips);
	}else if(parseInt(temp) < 42 && parseInt(temp) > 34){
		$("#ahesf_random").hide();
		ahesf_sntuo = 1;
		ahesf_playType = 8;
		ahesf_playMethod = parseInt(temp);
		createDanTuoLayout("ahesf",ahesf_playMethod-34,1,11,true,function(){
			ahesf_calcNotes();
		});
	}

	if(ahesfScroll){
		ahesfScroll.refresh();
		ahesfScroll.scrollTo(0,0,1);
	}
	
	$("#ahesfPage_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
	
	initFooterData("ahesf",temp);
	hideRandomWhenLi("ahesf",ahesf_sntuo,ahesf_playMethod);
	ahesf_calcNotes();
}

/**
 * [ahesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function ahesf_initFooterButton(){
	if (ahesf_playType == 6 || ahesf_playType == 2 || ahesf_playType == 4) {
		if (LotteryStorage["ahesf"]["line1"].length > 0) {
			$("#ahesf_qingkong").css("opacity",1.0);
		}else{
			$("#ahesf_qingkong").css("opacity",0.4);
		}
	}else if(ahesf_playType == 8){
		if (LotteryStorage["ahesf"]["line1"].length > 0 || LotteryStorage["ahesf"]["line2"].length > 0) {
			$("#ahesf_qingkong").css("opacity",1.0);
		}else{
			$("#ahesf_qingkong").css("opacity",0.4);
		}
	}else if(ahesf_playType == 3){
		if(LotteryStorage["ahesf"]["line1"].length > 0
			|| LotteryStorage["ahesf"]["line2"].length > 0
			|| LotteryStorage["ahesf"]["line3"].length > 0){
			$("#ahesf_qingkong").css("opacity",1.0);
		}else{
			$("#ahesf_qingkong").css("opacity",0.4);
		}
	}else if(ahesf_playType == 1){
		if (ahesf_playMethod == 7 || ahesf_playMethod == 10 || ahesf_playMethod == 13) {
			if(LotteryStorage["ahesf"]["line1"].length > 0
				|| LotteryStorage["ahesf"]["line2"].length > 0){
				$("#ahesf_qingkong").css("opacity",1.0);
			}else{
				$("#ahesf_qingkong").css("opacity",0.4);
			}
		}else if(ahesf_playMethod == 9 || ahesf_playMethod == 11){
			if(LotteryStorage["ahesf"]["line1"].length > 0){
				$("#ahesf_qingkong").css("opacity",1.0);
			}else{
				$("#ahesf_qingkong").css("opacity",0.4);
			}
		}else if(ahesf_playMethod == 8 || ahesf_playMethod == 12){
			$("#ahesf_qingkong").css("opacity",0);
		}
	}else if(ahesf_playType == 0){
		if (ahesf_playMethod == 0) {
			if(LotteryStorage["ahesf"]["line1"].length > 0
				|| LotteryStorage["ahesf"]["line2"].length > 0
				|| LotteryStorage["ahesf"]["line3"].length > 0){
				$("#ahesf_qingkong").css("opacity",1.0);
			}else{
				$("#ahesf_qingkong").css("opacity",0.4);
			}
		}else if(ahesf_playMethod == 3 || ahesf_playMethod == 6){
			if(LotteryStorage["ahesf"]["line1"].length > 0
				|| LotteryStorage["ahesf"]["line2"].length > 0){
				$("#ahesf_qingkong").css("opacity",1.0);
			}else{
				$("#ahesf_qingkong").css("opacity",0.4);
			}
		}else if(ahesf_playMethod == 2 || ahesf_playMethod == 4){
			if(LotteryStorage["ahesf"]["line1"].length > 0){
				$("#ahesf_qingkong").css("opacity",1.0);
			}else{
				$("#ahesf_qingkong").css("opacity",0.4);
			}
		}else if(ahesf_playMethod == 1 || ahesf_playMethod == 5){
			$("#ahesf_qingkong").css("opacity",0);
		}
	}else{
		$("#ahesf_qingkong").css("opacity",0);
	}

	if($("#ahesf_qingkong").css("opacity") == "0"){
		$("#ahesf_qingkong").css("display","none");
	}else{
		$("#ahesf_qingkong").css("display","block");
	}

	if($('#ahesf_zhushu').html() > 0){
		$("#ahesf_queding").css("opacity",1.0);
	}else{
		$("#ahesf_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  ahesf_qingkongAll(){
	$("#ahesf_ballView span").removeClass('redBalls_active');
	LotteryStorage["ahesf"]["line1"] = [];
	LotteryStorage["ahesf"]["line2"] = [];
	LotteryStorage["ahesf"]["line3"] = [];

	localStorageUtils.removeParam("ahesf_line1");
	localStorageUtils.removeParam("ahesf_line2");
	localStorageUtils.removeParam("ahesf_line3");

	$('#ahesf_zhushu').text(0);
	$('#ahesf_money').text(0);
	clearAwardWin("ahesf");
	ahesf_initFooterButton();
}

/**
 * [ahesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function ahesf_calcNotes(){
	$('#ahesf_modeId').blur();
	$('#ahesf_fandian').blur();

	var notes = 0;

	if (ahesf_playType == 6) {
		notes = mathUtil.getCCombination(LotteryStorage["ahesf"]["line1"].length,ahesf_playMethod - 18);
	}else if(ahesf_playType == 8){
		if(LotteryStorage["ahesf"]["line1"].length == 0 || LotteryStorage["ahesf"]["line2"].length == 0){
			notes = 0;
		}else{
			notes = mathUtil.getCCombination(LotteryStorage["ahesf"]["line2"].length,(ahesf_playMethod - 33)-LotteryStorage["ahesf"]["line1"].length);
		}
	}else if(ahesf_playType == 2 || ahesf_playType == 4){
		notes = LotteryStorage["ahesf"]["line1"].length;
	}else if(ahesf_playType == 1){
		if (ahesf_playMethod == 7){
			for (var i = 0; i < LotteryStorage["ahesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["ahesf"]["line2"].length; j++) {
					if(LotteryStorage["ahesf"]["line1"][i] != LotteryStorage["ahesf"]["line2"][j]){
						notes++ ;
					}
				}
			}
		}else if(ahesf_playMethod == 9){
			notes = mathUtil.getACombination(LotteryStorage["ahesf"]["line1"].length,2);
		}else if(ahesf_playMethod == 10){
			if(LotteryStorage["ahesf"]["line1"].length == 0 || LotteryStorage["ahesf"]["line2"].length == 0){
				notes = 0;
			}else{
				notes = 2 * mathUtil.getCCombination(LotteryStorage["ahesf"]["line2"].length,1);
			}
		}else if(ahesf_playMethod == 11){
			notes = mathUtil.getCCombination(LotteryStorage["ahesf"]["line1"].length,2);
		}else if(ahesf_playMethod == 13){
			if(LotteryStorage["ahesf"]["line1"].length == 0 || LotteryStorage["ahesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["ahesf"]["line2"].length,1);
			}
		}else{  //单式
			notes = ahesfValidateData('onblur');
		}
	}else if(ahesf_playType == 0){
		if (ahesf_playMethod == 0){
			for (var i = 0; i < LotteryStorage["ahesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["ahesf"]["line2"].length; j++) {
					for (var k = 0; k < LotteryStorage["ahesf"]["line3"].length; k++) {
						if(LotteryStorage["ahesf"]["line1"][i] != LotteryStorage["ahesf"]["line2"][j]
							&&LotteryStorage["ahesf"]["line1"][i] != LotteryStorage["ahesf"]["line3"][k]
							&& LotteryStorage["ahesf"]["line2"][j] != LotteryStorage["ahesf"]["line3"][k]){
							notes++ ;
						}
					}
				}
			}
		}else if(ahesf_playMethod == 2){
			notes = mathUtil.getACombination(LotteryStorage["ahesf"]["line1"].length,3);
		}else if(ahesf_playMethod == 3){
			if(LotteryStorage["ahesf"]["line1"].length == 0 || LotteryStorage["ahesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = 6 * mathUtil.getCCombination(LotteryStorage["ahesf"]["line2"].length,3 - LotteryStorage["ahesf"]["line1"].length);
			}
		}else if(ahesf_playMethod == 4){
			notes = mathUtil.getCCombination(LotteryStorage["ahesf"]["line1"].length,3);
		}else if(ahesf_playMethod == 6){
			if(LotteryStorage["ahesf"]["line1"].length == 0 || LotteryStorage["ahesf"]["line2"].length == 0
				|| LotteryStorage["ahesf"]["line1"].length + LotteryStorage["ahesf"]["line2"].length < 3){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["ahesf"]["line2"].length,3 - LotteryStorage["ahesf"]["line1"].length);
			}
		}else{  //单式
			notes = ahesfValidateData('onblur');
		}
	}else if(ahesf_playType == 3){
		notes = LotteryStorage["ahesf"]["line1"].length + LotteryStorage["ahesf"]["line2"].length + LotteryStorage["ahesf"]["line3"].length;
	}else{  //单式
		notes = ahesfValidateData('onblur');
	}

	hideRandomWhenLi('ahesf',ahesf_sntuo,ahesf_playMethod);

	//验证是否为空
	if( $("#ahesf_beiNum").val() =="" || parseInt($("#ahesf_beiNum").val()) == 0){
		$("#ahesf_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#ahesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple")) ){
		$("#ahesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#ahesf_zhushu').text(notes);
		if($("#ahesf_modeId").val() == "8"){
			$('#ahesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahesf_beiNum").val()),0.002));
		}else if ($("#ahesf_modeId").val() == "2"){
			$('#ahesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahesf_beiNum").val()),0.2));
		}else if ($("#ahesf_modeId").val() == "1"){
			$('#ahesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahesf_beiNum").val()),0.02));
		}else{
			$('#ahesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahesf_beiNum").val()),2));
		}
	} else {
		$('#ahesf_zhushu').text(0);
		$('#ahesf_money').text(0);
	}
	ahesf_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('ahesf',ahesf_playMethod);
}

/**
 * [ahesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function ahesf_randomOne(){
	ahesf_qingkongAll();
	if(ahesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(ahesf_playMethod - 18,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["ahesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "ahesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ahesf_playMethod == 14){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["ahesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["ahesf"]["line1"], function(k, v){
			$("#" + "ahesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(ahesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		LotteryStorage["ahesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["ahesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

		$.each(LotteryStorage["ahesf"]["line1"], function(k, v){
			$("#" + "ahesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ahesf"]["line2"], function(k, v){
			$("#" + "ahesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(ahesf_playMethod == 9 || ahesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["ahesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "ahesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ahesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		LotteryStorage["ahesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["ahesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
		LotteryStorage["ahesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

		$.each(LotteryStorage["ahesf"]["line1"], function(k, v){
			$("#" + "ahesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ahesf"]["line2"], function(k, v){
			$("#" + "ahesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ahesf"]["line3"], function(k, v){
			$("#" + "ahesf_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(ahesf_playMethod == 2 || ahesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["ahesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "ahesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ahesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["ahesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["ahesf"]["line1"], function(k, v){
			$("#" + "ahesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(ahesf_playMethod == 15){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["ahesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["ahesf"]["line"+line], function(k, v){
			$("#" + "ahesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
		});
	}
	ahesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function ahesf_checkOutRandom(playMethod){
	var obj = new Object();
	if(ahesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(ahesf_playMethod - 18,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(ahesf_playMethod == 14 || ahesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		obj.nums = number < 10 ? "0"+number : number;
		obj.notes = 1;
	}else if(ahesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(ahesf_playMethod == 9){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(ahesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(ahesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(ahesf_playMethod == 2){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 6;
	}else if(ahesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(ahesf_playMethod == 15){
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
	obj.sntuo = ahesf_sntuo;
	obj.multiple = 1;
	obj.rebates = ahesf_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('ahesf',ahesf_playMethod,obj);  //机选奖金计算
	obj.award = $('#ahesf_minAward').html();     //奖金
	obj.maxAward = $('#ahesf_maxAward').html();  //多级奖金
	return obj;
}


/**
 * [ahesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function ahesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#ahesf_queding").bind('click', function(event) {
		ahesf_rebate = $("#ahesf_fandian option:last").val();
		if(parseInt($('#ahesf_zhushu').html()) <= 0 || Number($("#ahesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		ahesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#ahesf_modeId').val()) == 8){
			if (Number($('#ahesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('ahesf',ahesf_playMethod);

		submitParams.lotteryType = "ahesf";
		var playType = LotteryInfo.getPlayName("esf",ahesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",ahesf_playMethod);
		submitParams.playTypeIndex = ahesf_playType;
		submitParams.playMethodIndex = ahesf_playMethod;
		var selectedBalls = [];
		if (ahesf_playType == 6 || ahesf_playType == 2 || ahesf_playType == 4) {
			$("#ahesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(ahesf_playType == 8){
			if(parseInt($('#ahesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#ahesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(ahesf_playType == 1 || ahesf_playType == 0){
			if(ahesf_playMethod == 7 || ahesf_playMethod == 0){
				$("#ahesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(ahesf_playMethod == 9 || ahesf_playMethod == 11 || ahesf_playMethod == 2 || ahesf_playMethod == 4){
				$("#ahesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(ahesf_playMethod == 10 || ahesf_playMethod == 13 || ahesf_playMethod == 3 || ahesf_playMethod == 6){
				if(parseInt($('#ahesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#ahesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(ahesf_playMethod == 1 || ahesf_playMethod == 8){//直选单式
				//去错误号
				ahesfValidateData("submit");
				var arr = $("#ahesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(ahesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(ahesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(ahesf_playMethod == 5 || ahesf_playMethod == 12){//组选单式
				//去错误号
				ahesfValidateData("submit");
				var arr = $("#ahesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(ahesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(ahesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(ahesf_playMethod == 15) {
			$("#ahesf_ballView div.ballView").each(function(){
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
			ahesfValidateData("submit");
			var arr = $("#ahesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(ahesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(ahesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(ahesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(ahesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(ahesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(ahesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(ahesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#ahesf_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#ahesf_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#ahesf_fandian").val());
		submitParams.notes = $('#ahesf_zhushu').html();
		submitParams.sntuo = ahesf_sntuo;
		submitParams.multiple = $('#ahesf_beiNum').val();  //requirement
		submitParams.rebates = $('#ahesf_fandian').val();  //requirement
		submitParams.playMode = $('#ahesf_modeId').val();  //requirement
		submitParams.money = $('#ahesf_money').html();  //requirement
		submitParams.award = $('#ahesf_minAward').html();  //奖金
		submitParams.maxAward = $('#ahesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#ahesf_ballView").empty();
		ahesf_qingkongAll();
	});
}

function ahesfValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#ahesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
	var	result,
		content = {};
    if(ahesf_playMethod == 1){  //前三直选单式
		content.str = str;
		content.weishu = 8;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if( ahesf_playMethod == 8){  //前二直选单式
		content.str = str;
		content.weishu = 5;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    } else if(ahesf_playMethod == 5){  //前三组选单式
		content.str = str;
		content.weishu = 8;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if(ahesf_playMethod == 12){  //前二组选单式
		content.str = str;
		content.weishu = 5;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if (ahesf_playMethod > 26 && ahesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(ahesf_playMethod - 26);
		content.str = str;
		content.weishu = 3*weiNum-1;
		content.renXuan = true;
		content.select = true;
		result = handleSingleStr_deleteErr(content,type);
    }

	$('#ahesf_delRepeat').off('click');
	$('#ahesf_delRepeat').on('click',function () {
		content.str = $('#ahesf_single').val() ? $('#ahesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		ahesfShowFooter(true,notes);
		$("#ahesf_single").val(array.join(","));
	});
	
    $("#ahesf_single").val(result.num.join(","));
    var notes = result.length;
    ahesfShowFooter(true,notes);
	return notes;
}

function ahesfShowFooter(isValid,notes){
    $('#ahesf_zhushu').text(notes);
    if($("#ahesf_modeId").val() == "8"){
        $('#ahesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahesf_beiNum").val()),0.002));
    }else if ($("#ahesf_modeId").val() == "2"){
        $('#ahesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahesf_beiNum").val()),0.2));
    }else if ($("#ahesf_modeId").val() == "1"){
        $('#ahesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahesf_beiNum").val()),0.02));
    }else{
        $('#ahesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    ahesf_initFooterButton();
    calcAwardWin('ahesf',ahesf_playMethod);  //计算奖金和盈利
}