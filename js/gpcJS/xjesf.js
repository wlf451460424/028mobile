var xjesf_playType = 1;
var xjesf_playMethod = 7;
var xjesf_sntuo = 0;
var xjesf_rebate;
var xjesfScroll;

//进入这个页面时调用
function xjesfPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("xjesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("xjesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function xjesfPageUnloadedPanel(){
	$("#xjesfPage_back").off('click');
	$("#xjesf_queding").off('click');
	$("#xjesf_ballView").empty();
	$("#xjesfSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="xjesfPlaySelect"></select>');
	$("#xjesfSelect").append($select);
}

//入口函数
function xjesf_init(){
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
	$("#xjesf_title").html(LotteryInfo.getLotteryNameByTag("xjesf"));
	for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
		if(i == 5)continue;
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
				var name = LotteryInfo.getMethodName("esf",j);
				if(i == xjesf_playType && j == xjesf_playMethod){
					$play.append('<option value="xjesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="xjesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(xjesf_playMethod,onShowArray)>-1 ){
						xjesf_playType = i;
						xjesf_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#xjesfPlaySelect").append($play);
		}
	}
	
	if($("#xjesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("xjesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:xjesfChangeItem
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

	GetLotteryInfo("xjesf",function (){
		xjesfChangeItem("xjesf"+xjesf_playMethod);
	});

	//添加滑动条
	if(!xjesfScroll){
		xjesfScroll = new IScroll('#xjesfContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("xjesf",LotteryInfo.getLotteryIdByTag("xjesf"));

	//获取上一期开奖
	queryLastPrize("xjesf");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('xjesf');

	//机选选号
	$("#xjesf_random").on('click', function(event) {
		xjesf_randomOne();
	});

	//返回
	$("#xjesfPage_back").on('click', function(event) {
		// xjesf_playType = 0;
		// xjesf_playMethod = 0;
		$("#xjesf_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		xjesf_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#xjesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",xjesf_playMethod));
	//玩法说明
	$("#xjesf_paly_shuoming").off('click');
	$("#xjesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#xjesf_shuoming").text());
	});

	qingKong("xjesf");//清空
	xjesf_submitData();
}

function xjesfResetPlayType(){
	xjesf_playType = 0;
	xjesf_playMethod = 0;
}

function xjesfChangeItem(val){
	xjesf_qingkongAll();

	var temp = val.substring("xjesf".length,val.length);

	if(val == 'xjesf1'){
		$("#xjesf_random").hide();
		xjesf_sntuo = 3;
		xjesf_playType = 0;
		xjesf_playMethod = 1;
		$("#xjesf_ballView").empty();
		xjesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xjesf",tips);
	}else if(val == 'xjesf5'){
		$("#xjesf_random").hide();
		xjesf_sntuo = 3;
		xjesf_playType = 0;
		xjesf_playMethod = 5;
		$("#xjesf_ballView").empty();
		xjesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xjesf",tips);
	}else if(val == 'xjesf8'){
		$("#xjesf_random").hide();
		xjesf_sntuo = 3;
		xjesf_playType = 1;
		xjesf_playMethod = 8;
		$("#xjesf_ballView").empty();
		xjesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xjesf",tips);
	}else if(val == 'xjesf12'){
		$("#xjesf_random").hide();
		xjesf_sntuo = 3;
		xjesf_playType = 1;
		xjesf_playMethod = 12;
		$("#xjesf_ballView").empty();
		xjesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xjesf",tips);
	}else if(parseInt(temp) == 14){
		$("#xjesf_random").show();
		xjesf_sntuo = 0;
		xjesf_playType = 2;
		xjesf_playMethod = parseInt(temp);
		createOneLineLayout("xjesf","请至少选择1个",1,11,true,function(){
			xjesf_calcNotes();
		});
	}else if(val == 'xjesf7'){
		$("#xjesf_random").show();
		xjesf_sntuo = 0;
		xjesf_playType = 1;
		xjesf_playMethod = 7;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tips = [tip1,tip2];
		createTwoLineLayout("xjesf",tips,1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf9'){
		$("#xjesf_random").show();
		xjesf_sntuo = 2;
		xjesf_playType = 1;
		xjesf_playMethod = 9;
		createOneLineLayout("xjesf","请至少选择2个",1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf10'){
		$("#xjesf_random").hide();
		xjesf_sntuo = 1;
		xjesf_playType = 1;
		xjesf_playMethod = 10;
		createDanTuoSpecLayout("xjesf",1,1,10,1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf11'){
		$("#xjesf_random").show();
		xjesf_sntuo = 0;
		xjesf_playType = 1;
		xjesf_playMethod = 11;
		createOneLineLayout("xjesf","请至少选择2个",1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf13'){
		$("#xjesf_random").hide();
		xjesf_sntuo = 1;
		xjesf_playType = 1;
		xjesf_playMethod = 13;
		createDanTuoLayout("xjesf",1,1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf0'){
		$("#xjesf_random").show();
		xjesf_sntuo = 0;
		xjesf_playType = 0;
		xjesf_playMethod = 0;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("xjesf",tips,1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf2'){
		$("#xjesf_random").show();
		xjesf_sntuo = 2;
		xjesf_playType = 0;
		xjesf_playMethod = 2;
		createOneLineLayout("xjesf","请至少选择3个",1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf3'){
		$("#xjesf_random").hide();
		xjesf_sntuo = 1;
		xjesf_playType = 0;
		xjesf_playMethod = 3;
		createDanTuoSpecLayout("xjesf",2,1,10,1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf4'){
		$("#xjesf_random").show();
		xjesf_sntuo = 0;
		xjesf_playType = 0;
		xjesf_playMethod = 4;
		createOneLineLayout("xjesf","请至少选择3个",1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf6'){
		$("#xjesf_random").hide();
		xjesf_sntuo = 1;
		xjesf_playType = 0;
		xjesf_playMethod = 6;
		createDanTuoLayout("xjesf",2,1,11,true,function(){
			xjesf_calcNotes();
		});
		xjesf_qingkongAll();
	}else if(val == 'xjesf16'){
		$("#xjesf_random").show();
		xjesf_sntuo = 0;
		xjesf_playType = 4;
		xjesf_playMethod = 16;
		xjesf_qingkongAll();
		createOneLineLayout("xjesf","前三位：请至少选择1个",1,11,true,function(){
			xjesf_calcNotes();
		});
	}else if(val == 'xjesf15'){
		$("#xjesf_random").show();
		xjesf_sntuo = 0;
		xjesf_playType = 3;
		xjesf_playMethod = 15;
		xjesf_qingkongAll();
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("xjesf",tips,1,11,true,function(){
			xjesf_calcNotes();
		});
	}else if(parseInt(temp) < 27 && parseInt(temp) > 18){
		$("#xjesf_random").show();
		xjesf_sntuo = 0;
		xjesf_playType = 6;
		xjesf_playMethod = parseInt(temp);
		createOneLineLayout("xjesf","请至少选择"+(xjesf_playMethod - 18)+"个",1,11,true,function(){
			xjesf_calcNotes();
		});
	}else if(parseInt(temp) < 35 && parseInt(temp) > 26){
		$("#xjesf_random").hide();
		xjesf_sntuo = 3;
		xjesf_playType = 7;
		xjesf_playMethod = parseInt(temp);
		$("#xjesf_ballView").empty();
		xjesf_qingkongAll();
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
		var tips = "<p>格式说明<br/>"+name[xjesf_playMethod - 27]+":"+ (array[xjesf_playMethod - 27]) +"<br/>1)每注必须是"+(xjesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xjesf",tips);
	}else if(parseInt(temp) < 42 && parseInt(temp) > 34){
		$("#xjesf_random").hide();
		xjesf_sntuo = 1;
		xjesf_playType = 8;
		xjesf_playMethod = parseInt(temp);
		createDanTuoLayout("xjesf",xjesf_playMethod-34,1,11,true,function(){
			xjesf_calcNotes();
		});
	}

	if(xjesfScroll){
		xjesfScroll.refresh();
		xjesfScroll.scrollTo(0,0,1);
	}
	
	$("#xjesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
	
	initFooterData("xjesf",temp);
	hideRandomWhenLi("xjesf",xjesf_sntuo,xjesf_playMethod);
	xjesf_calcNotes();
}

/**
 * [xjesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function xjesf_initFooterButton(){
	if (xjesf_playType == 6 || xjesf_playType == 2 || xjesf_playType == 4) {
		if (LotteryStorage["xjesf"]["line1"].length > 0) {
			$("#xjesf_qingkong").css("opacity",1.0);
		}else{
			$("#xjesf_qingkong").css("opacity",0.4);
		}
	}else if(xjesf_playType == 8){
		if (LotteryStorage["xjesf"]["line1"].length > 0 || LotteryStorage["xjesf"]["line2"].length > 0) {
			$("#xjesf_qingkong").css("opacity",1.0);
		}else{
			$("#xjesf_qingkong").css("opacity",0.4);
		}
	}else if(xjesf_playType == 3){
		if(LotteryStorage["xjesf"]["line1"].length > 0
			|| LotteryStorage["xjesf"]["line2"].length > 0
			|| LotteryStorage["xjesf"]["line3"].length > 0){
			$("#xjesf_qingkong").css("opacity",1.0);
		}else{
			$("#xjesf_qingkong").css("opacity",0.4);
		}
	}else if(xjesf_playType == 1){
		if (xjesf_playMethod == 7 || xjesf_playMethod == 10 || xjesf_playMethod == 13) {
			if(LotteryStorage["xjesf"]["line1"].length > 0
				|| LotteryStorage["xjesf"]["line2"].length > 0){
				$("#xjesf_qingkong").css("opacity",1.0);
			}else{
				$("#xjesf_qingkong").css("opacity",0.4);
			}
		}else if(xjesf_playMethod == 9 || xjesf_playMethod == 11){
			if(LotteryStorage["xjesf"]["line1"].length > 0){
				$("#xjesf_qingkong").css("opacity",1.0);
			}else{
				$("#xjesf_qingkong").css("opacity",0.4);
			}
		}else if(xjesf_playMethod == 8 || xjesf_playMethod == 12){
			$("#xjesf_qingkong").css("opacity",0);
		}
	}else if(xjesf_playType == 0){
		if (xjesf_playMethod == 0) {
			if(LotteryStorage["xjesf"]["line1"].length > 0
				|| LotteryStorage["xjesf"]["line2"].length > 0
				|| LotteryStorage["xjesf"]["line3"].length > 0){
				$("#xjesf_qingkong").css("opacity",1.0);
			}else{
				$("#xjesf_qingkong").css("opacity",0.4);
			}
		}else if(xjesf_playMethod == 3 || xjesf_playMethod == 6){
			if(LotteryStorage["xjesf"]["line1"].length > 0
				|| LotteryStorage["xjesf"]["line2"].length > 0){
				$("#xjesf_qingkong").css("opacity",1.0);
			}else{
				$("#xjesf_qingkong").css("opacity",0.4);
			}
		}else if(xjesf_playMethod == 2 || xjesf_playMethod == 4){
			if(LotteryStorage["xjesf"]["line1"].length > 0){
				$("#xjesf_qingkong").css("opacity",1.0);
			}else{
				$("#xjesf_qingkong").css("opacity",0.4);
			}
		}else if(xjesf_playMethod == 1 || xjesf_playMethod == 5){
			$("#xjesf_qingkong").css("opacity",0);
		}
	}else{
		$("#xjesf_qingkong").css("opacity",0);
	}

	if($("#xjesf_qingkong").css("opacity") == "0"){
		$("#xjesf_qingkong").css("display","none");
	}else{
		$("#xjesf_qingkong").css("display","block");
	}

	if($('#xjesf_zhushu').html() > 0){
		$("#xjesf_queding").css("opacity",1.0);
	}else{
		$("#xjesf_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  xjesf_qingkongAll(){
	$("#xjesf_ballView span").removeClass('redBalls_active');
	LotteryStorage["xjesf"]["line1"] = [];
	LotteryStorage["xjesf"]["line2"] = [];
	LotteryStorage["xjesf"]["line3"] = [];

	localStorageUtils.removeParam("xjesf_line1");
	localStorageUtils.removeParam("xjesf_line2");
	localStorageUtils.removeParam("xjesf_line3");

	$('#xjesf_zhushu').text(0);
	$('#xjesf_money').text(0);
	clearAwardWin("xjesf");
	xjesf_initFooterButton();
}

/**
 * [xjesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function xjesf_calcNotes(){
	$('#xjesf_modeId').blur();
	$('#xjesf_fandian').blur();
	
	var notes = 0;

	if (xjesf_playType == 6) {
		notes = mathUtil.getCCombination(LotteryStorage["xjesf"]["line1"].length,xjesf_playMethod - 18);
	}else if(xjesf_playType == 8){
		if(LotteryStorage["xjesf"]["line1"].length == 0 || LotteryStorage["xjesf"]["line2"].length == 0){
			notes = 0;
		}else{
			notes = mathUtil.getCCombination(LotteryStorage["xjesf"]["line2"].length,(xjesf_playMethod - 33)-LotteryStorage["xjesf"]["line1"].length);
		}
	}else if(xjesf_playType == 2 || xjesf_playType == 4){
		notes = LotteryStorage["xjesf"]["line1"].length;
	}else if(xjesf_playType == 1){
		if (xjesf_playMethod == 7){
			for (var i = 0; i < LotteryStorage["xjesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["xjesf"]["line2"].length; j++) {
					if(LotteryStorage["xjesf"]["line1"][i] != LotteryStorage["xjesf"]["line2"][j]){
						notes++ ;
					}
				}
			}
		}else if(xjesf_playMethod == 9){
			notes = mathUtil.getACombination(LotteryStorage["xjesf"]["line1"].length,2);
		}else if(xjesf_playMethod == 10){
			if(LotteryStorage["xjesf"]["line1"].length == 0 || LotteryStorage["xjesf"]["line2"].length == 0){
				notes = 0;
			}else{
				notes = 2 * mathUtil.getCCombination(LotteryStorage["xjesf"]["line2"].length,1);
			}
		}else if(xjesf_playMethod == 11){
			notes = mathUtil.getCCombination(LotteryStorage["xjesf"]["line1"].length,2);
		}else if(xjesf_playMethod == 13){
			if(LotteryStorage["xjesf"]["line1"].length == 0 || LotteryStorage["xjesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["xjesf"]["line2"].length,1);
			}
		}else{  //单式
			notes = xjesfValidateData('onblur');
		}
	}else if(xjesf_playType == 0){
		if (xjesf_playMethod == 0){
			for (var i = 0; i < LotteryStorage["xjesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["xjesf"]["line2"].length; j++) {
					for (var k = 0; k < LotteryStorage["xjesf"]["line3"].length; k++) {
						if(LotteryStorage["xjesf"]["line1"][i] != LotteryStorage["xjesf"]["line2"][j]
							&&LotteryStorage["xjesf"]["line1"][i] != LotteryStorage["xjesf"]["line3"][k]
							&& LotteryStorage["xjesf"]["line2"][j] != LotteryStorage["xjesf"]["line3"][k]){
							notes++ ;
						}
					}
				}
			}
		}else if(xjesf_playMethod == 2){
			notes = mathUtil.getACombination(LotteryStorage["xjesf"]["line1"].length,3);
		}else if(xjesf_playMethod == 3){
			if(LotteryStorage["xjesf"]["line1"].length == 0 || LotteryStorage["xjesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = 6 * mathUtil.getCCombination(LotteryStorage["xjesf"]["line2"].length,3 - LotteryStorage["xjesf"]["line1"].length);
			}
		}else if(xjesf_playMethod == 4){
			notes = mathUtil.getCCombination(LotteryStorage["xjesf"]["line1"].length,3);
		}else if(xjesf_playMethod == 6){
			if(LotteryStorage["xjesf"]["line1"].length == 0 || LotteryStorage["xjesf"]["line2"].length == 0
				|| LotteryStorage["xjesf"]["line1"].length + LotteryStorage["xjesf"]["line2"].length < 3){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["xjesf"]["line2"].length,3 - LotteryStorage["xjesf"]["line1"].length);
			}
		}else{  //单式
			notes = xjesfValidateData('onblur');
		}
	}else if(xjesf_playType == 3){
		notes = LotteryStorage["xjesf"]["line1"].length + LotteryStorage["xjesf"]["line2"].length + LotteryStorage["xjesf"]["line3"].length;
	}else{  //单式
		notes = xjesfValidateData('onblur');
	}

	hideRandomWhenLi('xjesf',xjesf_sntuo,xjesf_playMethod);

	//验证是否为空
	if( $("#xjesf_beiNum").val() =="" || parseInt($("#xjesf_beiNum").val()) == 0){
		$("#xjesf_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#xjesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple")) ){
		$("#xjesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#xjesf_zhushu').text(notes);
		if($("#xjesf_modeId").val() == "8"){
			$('#xjesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjesf_beiNum").val()),0.002));
		}else if ($("#xjesf_modeId").val() == "2"){
			$('#xjesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjesf_beiNum").val()),0.2));
		}else if ($("#xjesf_modeId").val() == "1"){
			$('#xjesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjesf_beiNum").val()),0.02));
		}else{
			$('#xjesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjesf_beiNum").val()),2));
		}
	} else {
		$('#xjesf_zhushu').text(0);
		$('#xjesf_money').text(0);
	}
	xjesf_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('xjesf',xjesf_playMethod);
}

/**
 * [xjesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function xjesf_randomOne(){
	xjesf_qingkongAll();
	if(xjesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(xjesf_playMethod - 18,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["xjesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "xjesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjesf_playMethod == 14){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["xjesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["xjesf"]["line1"], function(k, v){
			$("#" + "xjesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xjesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		LotteryStorage["xjesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["xjesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

		$.each(LotteryStorage["xjesf"]["line1"], function(k, v){
			$("#" + "xjesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjesf"]["line2"], function(k, v){
			$("#" + "xjesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xjesf_playMethod == 9 || xjesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["xjesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "xjesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		LotteryStorage["xjesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["xjesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
		LotteryStorage["xjesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

		$.each(LotteryStorage["xjesf"]["line1"], function(k, v){
			$("#" + "xjesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjesf"]["line2"], function(k, v){
			$("#" + "xjesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjesf"]["line3"], function(k, v){
			$("#" + "xjesf_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xjesf_playMethod == 2 || xjesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["xjesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "xjesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["xjesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["xjesf"]["line1"], function(k, v){
			$("#" + "xjesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xjesf_playMethod == 15){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["xjesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["xjesf"]["line"+line], function(k, v){
			$("#" + "xjesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
		});
	}
	xjesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function xjesf_checkOutRandom(playMethod){
	var obj = new Object();
	if(xjesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(xjesf_playMethod - 18,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(xjesf_playMethod == 14 || xjesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		obj.nums = number < 10 ? "0"+number : number;
		obj.notes = 1;
	}else if(xjesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(xjesf_playMethod == 9){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(xjesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(xjesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(xjesf_playMethod == 2){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 6;
	}else if(xjesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(xjesf_playMethod == 15){
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
	obj.sntuo = xjesf_sntuo;
	obj.multiple = 1;
	obj.rebates = xjesf_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('xjesf',xjesf_playMethod,obj);  //机选奖金计算
	obj.award = $('#xjesf_minAward').html();     //奖金
	obj.maxAward = $('#xjesf_maxAward').html();  //多级奖金
	return obj;
}


/**
 * [xjesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function xjesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#xjesf_queding").bind('click', function(event) {
		xjesf_rebate = $("#xjesf_fandian option:last").val();
		if(parseInt($('#xjesf_zhushu').html()) <= 0 || Number($("#xjesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		xjesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#xjesf_modeId').val()) == 8){
			if (Number($('#xjesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('xjesf',xjesf_playMethod);

		submitParams.lotteryType = "xjesf";
		var playType = LotteryInfo.getPlayName("esf",xjesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",xjesf_playMethod);
		submitParams.playTypeIndex = xjesf_playType;
		submitParams.playMethodIndex = xjesf_playMethod;
		var selectedBalls = [];
		if (xjesf_playType == 6 || xjesf_playType == 2 || xjesf_playType == 4) {
			$("#xjesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(xjesf_playType == 8){
			if(parseInt($('#xjesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#xjesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(xjesf_playType == 1 || xjesf_playType == 0){
			if(xjesf_playMethod == 7 || xjesf_playMethod == 0){
				$("#xjesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(xjesf_playMethod == 9 || xjesf_playMethod == 11 || xjesf_playMethod == 2 || xjesf_playMethod == 4){
				$("#xjesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(xjesf_playMethod == 10 || xjesf_playMethod == 13 || xjesf_playMethod == 3 || xjesf_playMethod == 6){
				if(parseInt($('#xjesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#xjesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(xjesf_playMethod == 1 || xjesf_playMethod == 8){//直选单式
				//去错误号
				xjesfValidateData("submit");
				var arr = $("#xjesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(xjesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(xjesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(xjesf_playMethod == 5 || xjesf_playMethod == 12){//组选单式
				//去错误号
				xjesfValidateData("submit");
				var arr = $("#xjesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(xjesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(xjesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(xjesf_playMethod == 15) {
			$("#xjesf_ballView div.ballView").each(function(){
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
			xjesfValidateData("submit");
			var arr = $("#xjesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(xjesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(xjesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(xjesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(xjesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(xjesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(xjesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(xjesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#xjesf_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#xjesf_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#xjesf_fandian").val());
		submitParams.notes = $('#xjesf_zhushu').html();
		submitParams.sntuo = xjesf_sntuo;
		submitParams.multiple = $('#xjesf_beiNum').val();  //requirement
		submitParams.rebates = $('#xjesf_fandian').val();  //requirement
		submitParams.playMode = $('#xjesf_modeId').val();  //requirement
		submitParams.money = $('#xjesf_money').html();  //requirement
		submitParams.award = $('#xjesf_minAward').html();  //奖金
		submitParams.maxAward = $('#xjesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#xjesf_ballView").empty();
		xjesf_qingkongAll();
	});
}

function xjesfValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#xjesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
	var	result,
		content = {};
    if(xjesf_playMethod == 1){  //前三直选单式
		content.str = str;
		content.weishu = 8;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if( xjesf_playMethod == 8){  //前二直选单式
		content.str = str;
		content.weishu = 5;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    } else if(xjesf_playMethod == 5){  //前三组选单式
		content.str = str;
		content.weishu = 8;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if(xjesf_playMethod == 12){  //前二组选单式
		content.str = str;
		content.weishu = 5;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if (xjesf_playMethod > 26 && xjesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(xjesf_playMethod - 26);
		content.str = str;
		content.weishu = 3*weiNum-1;
		content.renXuan = true;
		content.select = true;
		result = handleSingleStr_deleteErr(content,type);
    }

	$('#xjesf_delRepeat').off('click');
	$('#xjesf_delRepeat').on('click',function () {
		content.str = $('#xjesf_single').val() ? $('#xjesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		xjesfShowFooter(true,notes);
		$("#xjesf_single").val(array.join(","));
	});
	
    $("#xjesf_single").val(result.num.join(","));
    var notes = result.length;
    xjesfShowFooter(true,notes);
	return notes;
}

function xjesfShowFooter(isValid,notes){
    $('#xjesf_zhushu').text(notes);
    if($("#xjesf_modeId").val() == "8"){
        $('#xjesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjesf_beiNum").val()),0.002));
    }else if ($("#xjesf_modeId").val() == "2"){
        $('#xjesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjesf_beiNum").val()),0.2));
    }else if ($("#xjesf_modeId").val() == "1"){
        $('#xjesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjesf_beiNum").val()),0.02));
    }else{
        $('#xjesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    xjesf_initFooterButton();
    calcAwardWin('xjesf',xjesf_playMethod);  //计算奖金和盈利
}