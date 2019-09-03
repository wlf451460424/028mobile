var lnesf_playType = 1;
var lnesf_playMethod = 7;
var lnesf_sntuo = 0;
var lnesf_rebate;
var lnesfScroll;

//进入这个页面时调用
function lnesfPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("lnesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("lnesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function lnesfPageUnloadedPanel(){
	$("#lnesfPage_back").off('click');
	$("#lnesf_queding").off('click');
	$("#lnesf_ballView").empty();
	$("#lnesfSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="lnesfPlaySelect"></select>');
	$("#lnesfSelect").append($select);
}

//入口函数
function lnesf_init(){
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
	$("#lnesf_title").html(LotteryInfo.getLotteryNameByTag("lnesf"));
	for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
		if(i == 5)continue;
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
				var name = LotteryInfo.getMethodName("esf",j);
				if(i == lnesf_playType && j == lnesf_playMethod){
					$play.append('<option value="lnesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="lnesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(lnesf_playMethod,onShowArray)>-1 ){
						lnesf_playType = i;
						lnesf_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#lnesfPlaySelect").append($play);
		}
	}
	
	if($("#lnesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("lnesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:lnesfChangeItem
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

	GetLotteryInfo("lnesf",function (){
		lnesfChangeItem("lnesf"+lnesf_playMethod);
	});

	//添加滑动条
	if(!lnesfScroll){
		lnesfScroll = new IScroll('#lnesfContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("lnesf",LotteryInfo.getLotteryIdByTag("lnesf"));

	//获取上一期开奖
	queryLastPrize("lnesf");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('lnesf');

	//机选选号
	$("#lnesf_random").on('click', function(event) {
		lnesf_randomOne();
	});

	//返回
	$("#lnesfPage_back").on('click', function(event) {
		// lnesf_playType = 0;
		// lnesf_playMethod = 0;
		$("#lnesf_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		lnesf_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#lnesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",lnesf_playMethod));
	//玩法说明
	$("#lnesf_paly_shuoming").off('click');
	$("#lnesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#lnesf_shuoming").text());
	});

	qingKong("lnesf");//清空
	lnesf_submitData();
}

function lnesfResetPlayType(){
	lnesf_playType = 0;
	lnesf_playMethod = 0;
}

function lnesfChangeItem(val){
	lnesf_qingkongAll();

	var temp = val.substring("lnesf".length,val.length);

	if(val == 'lnesf1'){
		$("#lnesf_random").hide();
		lnesf_sntuo = 3;
		lnesf_playType = 0;
		lnesf_playMethod = 1;
		$("#lnesf_ballView").empty();
		lnesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("lnesf",tips);
	}else if(val == 'lnesf5'){
		$("#lnesf_random").hide();
		lnesf_sntuo = 3;
		lnesf_playType = 0;
		lnesf_playMethod = 5;
		$("#lnesf_ballView").empty();
		lnesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("lnesf",tips);
	}else if(val == 'lnesf8'){
		$("#lnesf_random").hide();
		lnesf_sntuo = 3;
		lnesf_playType = 1;
		lnesf_playMethod = 8;
		$("#lnesf_ballView").empty();
		lnesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("lnesf",tips);
	}else if(val == 'lnesf12'){
		$("#lnesf_random").hide();
		lnesf_sntuo = 3;
		lnesf_playType = 1;
		lnesf_playMethod = 12;
		$("#lnesf_ballView").empty();
		lnesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("lnesf",tips);
	}else if(parseInt(temp) == 14){
		$("#lnesf_random").show();
		lnesf_sntuo = 0;
		lnesf_playType = 2;
		lnesf_playMethod = parseInt(temp);
		createOneLineLayout("lnesf","请至少选择1个",1,11,true,function(){
			lnesf_calcNotes();
		});
	}else if(val == 'lnesf7'){
		$("#lnesf_random").show();
		lnesf_sntuo = 0;
		lnesf_playType = 1;
		lnesf_playMethod = 7;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tips = [tip1,tip2];
		createTwoLineLayout("lnesf",tips,1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf9'){
		$("#lnesf_random").show();
		lnesf_sntuo = 2;
		lnesf_playType = 1;
		lnesf_playMethod = 9;
		createOneLineLayout("lnesf","请至少选择2个",1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf10'){
		$("#lnesf_random").hide();
		lnesf_sntuo = 1;
		lnesf_playType = 1;
		lnesf_playMethod = 10;
		createDanTuoSpecLayout("lnesf",1,1,10,1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf11'){
		$("#lnesf_random").show();
		lnesf_sntuo = 0;
		lnesf_playType = 1;
		lnesf_playMethod = 11;
		createOneLineLayout("lnesf","请至少选择2个",1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf13'){
		$("#lnesf_random").hide();
		lnesf_sntuo = 1;
		lnesf_playType = 1;
		lnesf_playMethod = 13;
		createDanTuoLayout("lnesf",1,1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf0'){
		$("#lnesf_random").show();
		lnesf_sntuo = 0;
		lnesf_playType = 0;
		lnesf_playMethod = 0;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("lnesf",tips,1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf2'){
		$("#lnesf_random").show();
		lnesf_sntuo = 2;
		lnesf_playType = 0;
		lnesf_playMethod = 2;
		createOneLineLayout("lnesf","请至少选择3个",1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf3'){
		$("#lnesf_random").hide();
		lnesf_sntuo = 1;
		lnesf_playType = 0;
		lnesf_playMethod = 3;
		createDanTuoSpecLayout("lnesf",2,1,10,1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf4'){
		$("#lnesf_random").show();
		lnesf_sntuo = 0;
		lnesf_playType = 0;
		lnesf_playMethod = 4;
		createOneLineLayout("lnesf","请至少选择3个",1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf6'){
		$("#lnesf_random").hide();
		lnesf_sntuo = 1;
		lnesf_playType = 0;
		lnesf_playMethod = 6;
		createDanTuoLayout("lnesf",2,1,11,true,function(){
			lnesf_calcNotes();
		});
		lnesf_qingkongAll();
	}else if(val == 'lnesf16'){
		$("#lnesf_random").show();
		lnesf_sntuo = 0;
		lnesf_playType = 4;
		lnesf_playMethod = 16;
		lnesf_qingkongAll();
		createOneLineLayout("lnesf","前三位：请至少选择1个",1,11,true,function(){
			lnesf_calcNotes();
		});
	}else if(val == 'lnesf15'){
		$("#lnesf_random").show();
		lnesf_sntuo = 0;
		lnesf_playType = 3;
		lnesf_playMethod = 15;
		lnesf_qingkongAll();
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("lnesf",tips,1,11,true,function(){
			lnesf_calcNotes();
		});
	}else if(parseInt(temp) < 27 && parseInt(temp) > 18){
		$("#lnesf_random").show();
		lnesf_sntuo = 0;
		lnesf_playType = 6;
		lnesf_playMethod = parseInt(temp);
		createOneLineLayout("lnesf","请至少选择"+(lnesf_playMethod - 18)+"个",1,11,true,function(){
			lnesf_calcNotes();
		});
	}else if(parseInt(temp) < 35 && parseInt(temp) > 26){
		$("#lnesf_random").hide();
		lnesf_sntuo = 3;
		lnesf_playType = 7;
		lnesf_playMethod = parseInt(temp);
		$("#lnesf_ballView").empty();
		lnesf_qingkongAll();
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
		var tips = "<p>格式说明<br/>"+name[lnesf_playMethod - 27]+":"+ (array[lnesf_playMethod - 27]) +"<br/>1)每注必须是"+(lnesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("lnesf",tips);
	}else if(parseInt(temp) < 42 && parseInt(temp) > 34){
		$("#lnesf_random").hide();
		lnesf_sntuo = 1;
		lnesf_playType = 8;
		lnesf_playMethod = parseInt(temp);
		createDanTuoLayout("lnesf",lnesf_playMethod-34,1,11,true,function(){
			lnesf_calcNotes();
		});
	}

	if(lnesfScroll){
		lnesfScroll.refresh();
		lnesfScroll.scrollTo(0,0,1);
	}
	
	$("#lnesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
	
	initFooterData("lnesf",temp);
	hideRandomWhenLi("lnesf",lnesf_sntuo,lnesf_playMethod);
	lnesf_calcNotes();
}

/**
 * [lnesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function lnesf_initFooterButton(){
	if (lnesf_playType == 6 || lnesf_playType == 2 || lnesf_playType == 4) {
		if (LotteryStorage["lnesf"]["line1"].length > 0) {
			$("#lnesf_qingkong").css("opacity",1.0);
		}else{
			$("#lnesf_qingkong").css("opacity",0.4);
		}
	}else if(lnesf_playType == 8){
		if (LotteryStorage["lnesf"]["line1"].length > 0 || LotteryStorage["lnesf"]["line2"].length > 0) {
			$("#lnesf_qingkong").css("opacity",1.0);
		}else{
			$("#lnesf_qingkong").css("opacity",0.4);
		}
	}else if(lnesf_playType == 3){
		if(LotteryStorage["lnesf"]["line1"].length > 0
			|| LotteryStorage["lnesf"]["line2"].length > 0
			|| LotteryStorage["lnesf"]["line3"].length > 0){
			$("#lnesf_qingkong").css("opacity",1.0);
		}else{
			$("#lnesf_qingkong").css("opacity",0.4);
		}
	}else if(lnesf_playType == 1){
		if (lnesf_playMethod == 7 || lnesf_playMethod == 10 || lnesf_playMethod == 13) {
			if(LotteryStorage["lnesf"]["line1"].length > 0
				|| LotteryStorage["lnesf"]["line2"].length > 0){
				$("#lnesf_qingkong").css("opacity",1.0);
			}else{
				$("#lnesf_qingkong").css("opacity",0.4);
			}
		}else if(lnesf_playMethod == 9 || lnesf_playMethod == 11){
			if(LotteryStorage["lnesf"]["line1"].length > 0){
				$("#lnesf_qingkong").css("opacity",1.0);
			}else{
				$("#lnesf_qingkong").css("opacity",0.4);
			}
		}else if(lnesf_playMethod == 8 || lnesf_playMethod == 12){
			$("#lnesf_qingkong").css("opacity",0);
		}
	}else if(lnesf_playType == 0){
		if (lnesf_playMethod == 0) {
			if(LotteryStorage["lnesf"]["line1"].length > 0
				|| LotteryStorage["lnesf"]["line2"].length > 0
				|| LotteryStorage["lnesf"]["line3"].length > 0){
				$("#lnesf_qingkong").css("opacity",1.0);
			}else{
				$("#lnesf_qingkong").css("opacity",0.4);
			}
		}else if(lnesf_playMethod == 3 || lnesf_playMethod == 6){
			if(LotteryStorage["lnesf"]["line1"].length > 0
				|| LotteryStorage["lnesf"]["line2"].length > 0){
				$("#lnesf_qingkong").css("opacity",1.0);
			}else{
				$("#lnesf_qingkong").css("opacity",0.4);
			}
		}else if(lnesf_playMethod == 2 || lnesf_playMethod == 4){
			if(LotteryStorage["lnesf"]["line1"].length > 0){
				$("#lnesf_qingkong").css("opacity",1.0);
			}else{
				$("#lnesf_qingkong").css("opacity",0.4);
			}
		}else if(lnesf_playMethod == 1 || lnesf_playMethod == 5){
			$("#lnesf_qingkong").css("opacity",0);
		}
	}else{
		$("#lnesf_qingkong").css("opacity",0);
	}

	if($("#lnesf_qingkong").css("opacity") == "0"){
		$("#lnesf_qingkong").css("display","none");
	}else{
		$("#lnesf_qingkong").css("display","block");
	}

	if($('#lnesf_zhushu').html() > 0){
		$("#lnesf_queding").css("opacity",1.0);
	}else{
		$("#lnesf_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  lnesf_qingkongAll(){
	$("#lnesf_ballView span").removeClass('redBalls_active');
	LotteryStorage["lnesf"]["line1"] = [];
	LotteryStorage["lnesf"]["line2"] = [];
	LotteryStorage["lnesf"]["line3"] = [];

	localStorageUtils.removeParam("lnesf_line1");
	localStorageUtils.removeParam("lnesf_line2");
	localStorageUtils.removeParam("lnesf_line3");

	$('#lnesf_zhushu').text(0);
	$('#lnesf_money').text(0);
	clearAwardWin("lnesf");
	lnesf_initFooterButton();
}

/**
 * [lnesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function lnesf_calcNotes(){
	$('#lnesf_modeId').blur();
	$('#lnesf_fandian').blur();
	
	var notes = 0;

	if (lnesf_playType == 6) {
		notes = mathUtil.getCCombination(LotteryStorage["lnesf"]["line1"].length,lnesf_playMethod - 18);
	}else if(lnesf_playType == 8){
		if(LotteryStorage["lnesf"]["line1"].length == 0 || LotteryStorage["lnesf"]["line2"].length == 0){
			notes = 0;
		}else{
			notes = mathUtil.getCCombination(LotteryStorage["lnesf"]["line2"].length,(lnesf_playMethod - 33)-LotteryStorage["lnesf"]["line1"].length);
		}
	}else if(lnesf_playType == 2 || lnesf_playType == 4){
		notes = LotteryStorage["lnesf"]["line1"].length;
	}else if(lnesf_playType == 1){
		if (lnesf_playMethod == 7){
			for (var i = 0; i < LotteryStorage["lnesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["lnesf"]["line2"].length; j++) {
					if(LotteryStorage["lnesf"]["line1"][i] != LotteryStorage["lnesf"]["line2"][j]){
						notes++ ;
					}
				}
			}
		}else if(lnesf_playMethod == 9){
			notes = mathUtil.getACombination(LotteryStorage["lnesf"]["line1"].length,2);
		}else if(lnesf_playMethod == 10){
			if(LotteryStorage["lnesf"]["line1"].length == 0 || LotteryStorage["lnesf"]["line2"].length == 0){
				notes = 0;
			}else{
				notes = 2 * mathUtil.getCCombination(LotteryStorage["lnesf"]["line2"].length,1);
			}
		}else if(lnesf_playMethod == 11){
			notes = mathUtil.getCCombination(LotteryStorage["lnesf"]["line1"].length,2);
		}else if(lnesf_playMethod == 13){
			if(LotteryStorage["lnesf"]["line1"].length == 0 || LotteryStorage["lnesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["lnesf"]["line2"].length,1);
			}
		}else{  //单式
			notes = lnesfValidateData('onblur');
		}
	}else if(lnesf_playType == 0){
		if (lnesf_playMethod == 0){
			for (var i = 0; i < LotteryStorage["lnesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["lnesf"]["line2"].length; j++) {
					for (var k = 0; k < LotteryStorage["lnesf"]["line3"].length; k++) {
						if(LotteryStorage["lnesf"]["line1"][i] != LotteryStorage["lnesf"]["line2"][j]
							&&LotteryStorage["lnesf"]["line1"][i] != LotteryStorage["lnesf"]["line3"][k]
							&& LotteryStorage["lnesf"]["line2"][j] != LotteryStorage["lnesf"]["line3"][k]){
							notes++ ;
						}
					}
				}
			}
		}else if(lnesf_playMethod == 2){
			notes = mathUtil.getACombination(LotteryStorage["lnesf"]["line1"].length,3);
		}else if(lnesf_playMethod == 3){
			if(LotteryStorage["lnesf"]["line1"].length == 0 || LotteryStorage["lnesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = 6 * mathUtil.getCCombination(LotteryStorage["lnesf"]["line2"].length,3 - LotteryStorage["lnesf"]["line1"].length);
			}
		}else if(lnesf_playMethod == 4){
			notes = mathUtil.getCCombination(LotteryStorage["lnesf"]["line1"].length,3);
		}else if(lnesf_playMethod == 6){
			if(LotteryStorage["lnesf"]["line1"].length == 0 || LotteryStorage["lnesf"]["line2"].length == 0
				|| LotteryStorage["lnesf"]["line1"].length + LotteryStorage["lnesf"]["line2"].length < 3){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["lnesf"]["line2"].length,3 - LotteryStorage["lnesf"]["line1"].length);
			}
		}else{  //单式
			notes = lnesfValidateData('onblur');
		}
	}else if(lnesf_playType == 3){
		notes = LotteryStorage["lnesf"]["line1"].length + LotteryStorage["lnesf"]["line2"].length + LotteryStorage["lnesf"]["line3"].length;
	}else{  //单式
		notes = lnesfValidateData('onblur');
	}

	hideRandomWhenLi('lnesf',lnesf_sntuo,lnesf_playMethod);

	//验证是否为空
	if( $("#lnesf_beiNum").val() =="" || parseInt($("#lnesf_beiNum").val()) == 0){
		$("#lnesf_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#lnesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple")) ){
		$("#lnesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#lnesf_zhushu').text(notes);
		if($("#lnesf_modeId").val() == "8"){
			$('#lnesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#lnesf_beiNum").val()),0.002));
		}else if ($("#lnesf_modeId").val() == "2"){
			$('#lnesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#lnesf_beiNum").val()),0.2));
		}else if ($("#lnesf_modeId").val() == "1"){
			$('#lnesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#lnesf_beiNum").val()),0.02));
		}else{
			$('#lnesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#lnesf_beiNum").val()),2));
		}
	} else {
		$('#lnesf_zhushu').text(0);
		$('#lnesf_money').text(0);
	}
	lnesf_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('lnesf',lnesf_playMethod);
}

/**
 * [lnesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function lnesf_randomOne(){
	lnesf_qingkongAll();
	if(lnesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(lnesf_playMethod - 18,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["lnesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "lnesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(lnesf_playMethod == 14){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["lnesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["lnesf"]["line1"], function(k, v){
			$("#" + "lnesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(lnesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		LotteryStorage["lnesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["lnesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

		$.each(LotteryStorage["lnesf"]["line1"], function(k, v){
			$("#" + "lnesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["lnesf"]["line2"], function(k, v){
			$("#" + "lnesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(lnesf_playMethod == 9 || lnesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["lnesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "lnesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(lnesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		LotteryStorage["lnesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["lnesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
		LotteryStorage["lnesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

		$.each(LotteryStorage["lnesf"]["line1"], function(k, v){
			$("#" + "lnesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["lnesf"]["line2"], function(k, v){
			$("#" + "lnesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["lnesf"]["line3"], function(k, v){
			$("#" + "lnesf_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(lnesf_playMethod == 2 || lnesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["lnesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "lnesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(lnesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["lnesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["lnesf"]["line1"], function(k, v){
			$("#" + "lnesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(lnesf_playMethod == 15){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["lnesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["lnesf"]["line"+line], function(k, v){
			$("#" + "lnesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
		});
	}
	lnesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function lnesf_checkOutRandom(playMethod){
	var obj = new Object();
	if(lnesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(lnesf_playMethod - 18,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(lnesf_playMethod == 14 || lnesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		obj.nums = number < 10 ? "0"+number : number;
		obj.notes = 1;
	}else if(lnesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(lnesf_playMethod == 9){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(lnesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(lnesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(lnesf_playMethod == 2){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 6;
	}else if(lnesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(lnesf_playMethod == 15){
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
	obj.sntuo = lnesf_sntuo;
	obj.multiple = 1;
	obj.rebates = lnesf_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('lnesf',lnesf_playMethod,obj);  //机选奖金计算
	obj.award = $('#lnesf_minAward').html();     //奖金
	obj.maxAward = $('#lnesf_maxAward').html();  //多级奖金
	return obj;
}


/**
 * [lnesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function lnesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#lnesf_queding").bind('click', function(event) {
		lnesf_rebate = $("#lnesf_fandian option:last").val();
		if(parseInt($('#lnesf_zhushu').html()) <= 0 || Number($("#lnesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		lnesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#lnesf_modeId').val()) == 8){
			if (Number($('#lnesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('lnesf',lnesf_playMethod);

		submitParams.lotteryType = "lnesf";
		var playType = LotteryInfo.getPlayName("esf",lnesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",lnesf_playMethod);
		submitParams.playTypeIndex = lnesf_playType;
		submitParams.playMethodIndex = lnesf_playMethod;
		var selectedBalls = [];
		if (lnesf_playType == 6 || lnesf_playType == 2 || lnesf_playType == 4) {
			$("#lnesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(lnesf_playType == 8){
			if(parseInt($('#lnesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#lnesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(lnesf_playType == 1 || lnesf_playType == 0){
			if(lnesf_playMethod == 7 || lnesf_playMethod == 0){
				$("#lnesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(lnesf_playMethod == 9 || lnesf_playMethod == 11 || lnesf_playMethod == 2 || lnesf_playMethod == 4){
				$("#lnesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(lnesf_playMethod == 10 || lnesf_playMethod == 13 || lnesf_playMethod == 3 || lnesf_playMethod == 6){
				if(parseInt($('#lnesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#lnesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(lnesf_playMethod == 1 || lnesf_playMethod == 8){//直选单式
				//去错误号
				lnesfValidateData("submit");
				var arr = $("#lnesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(lnesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(lnesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(lnesf_playMethod == 5 || lnesf_playMethod == 12){//组选单式
				//去错误号
				lnesfValidateData("submit");
				var arr = $("#lnesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(lnesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(lnesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(lnesf_playMethod == 15) {
			$("#lnesf_ballView div.ballView").each(function(){
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
			lnesfValidateData("submit");
			var arr = $("#lnesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(lnesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(lnesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(lnesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(lnesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(lnesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(lnesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(lnesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#lnesf_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#lnesf_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#lnesf_fandian").val());
		submitParams.notes = $('#lnesf_zhushu').html();
		submitParams.sntuo = lnesf_sntuo;
		submitParams.multiple = $('#lnesf_beiNum').val();  //requirement
		submitParams.rebates = $('#lnesf_fandian').val();  //requirement
		submitParams.playMode = $('#lnesf_modeId').val();  //requirement
		submitParams.money = $('#lnesf_money').html();  //requirement
		submitParams.award = $('#lnesf_minAward').html();  //奖金
		submitParams.maxAward = $('#lnesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#lnesf_ballView").empty();
		lnesf_qingkongAll();
	});
}

function lnesfValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#lnesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
	var	result,
		content = {};
    if(lnesf_playMethod == 1){  //前三直选单式
		content.str = str;
		content.weishu = 8;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if( lnesf_playMethod == 8){  //前二直选单式
		content.str = str;
		content.weishu = 5;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    } else if(lnesf_playMethod == 5){  //前三组选单式
		content.str = str;
		content.weishu = 8;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if(lnesf_playMethod == 12){  //前二组选单式
		content.str = str;
		content.weishu = 5;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if (lnesf_playMethod > 26 && lnesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(lnesf_playMethod - 26);
		content.str = str;
		content.weishu = 3*weiNum-1;
		content.renXuan = true;
		content.select = true;
		result = handleSingleStr_deleteErr(content,type);
    }

	$('#lnesf_delRepeat').off('click');
	$('#lnesf_delRepeat').on('click',function () {
		content.str = $('#lnesf_single').val() ? $('#lnesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		lnesfShowFooter(true,notes);
		$("#lnesf_single").val(array.join(","));
	});
	
    $("#lnesf_single").val(result.num.join(","));
    var notes = result.length;
    lnesfShowFooter(true,notes);
	return notes;
}

function lnesfShowFooter(isValid,notes){
    $('#lnesf_zhushu').text(notes);
    if($("#lnesf_modeId").val() == "8"){
        $('#lnesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#lnesf_beiNum").val()),0.002));
    }else if ($("#lnesf_modeId").val() == "2"){
        $('#lnesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#lnesf_beiNum").val()),0.2));
    }else if ($("#lnesf_modeId").val() == "1"){
        $('#lnesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#lnesf_beiNum").val()),0.02));
    }else{
        $('#lnesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#lnesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    lnesf_initFooterButton();
    calcAwardWin('lnesf',lnesf_playMethod);  //计算奖金和盈利
}