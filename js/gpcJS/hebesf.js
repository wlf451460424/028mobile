var hebesf_playType = 1;
var hebesf_playMethod = 7;
var hebesf_sntuo = 0;
var hebesf_rebate;
var hebesfScroll;

//进入这个页面时调用
function hebesfPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hebesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hebesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hebesfPageUnloadedPanel(){
	$("#hebesfPage_back").off('click');
	$("#hebesf_queding").off('click');
	$("#hebesf_ballView").empty();
	$("#hebesfSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hebesfPlaySelect"></select>');
	$("#hebesfSelect").append($select);
}

//入口函数
function hebesf_init(){
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
	$("#hebesf_title").html(LotteryInfo.getLotteryNameByTag("hebesf"));
	for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
		if(i == 5)continue;
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
				var name = LotteryInfo.getMethodName("esf",j);
				if(i == hebesf_playType && j == hebesf_playMethod){
					$play.append('<option value="hebesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hebesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hebesf_playMethod,onShowArray)>-1 ){
						hebesf_playType = i;
						hebesf_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hebesfPlaySelect").append($play);
		}
	}
	
	if($("#hebesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("hebesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hebesfChangeItem
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

	GetLotteryInfo("hebesf",function (){
		hebesfChangeItem("hebesf"+hebesf_playMethod);
	});

	//添加滑动条
	if(!hebesfScroll){
		hebesfScroll = new IScroll('#hebesfContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("hebesf",LotteryInfo.getLotteryIdByTag("hebesf"));

	//获取上一期开奖
	queryLastPrize("hebesf");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('hebesf');

	//机选选号
	$("#hebesf_random").on('click', function(event) {
		hebesf_randomOne();
	});
	
	$("#hebesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",hebesf_playMethod));
	//玩法说明
	$("#hebesf_paly_shuoming").off('click');
	$("#hebesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hebesf_shuoming").text());
	});

	//返回
	$("#hebesfPage_back").on('click', function(event) {
		// hebesf_playType = 0;
		// hebesf_playMethod = 0;
		$("#hebesf_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		hebesf_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("hebesf");//清空
	hebesf_submitData();
}

function hebesfResetPlayType(){
	hebesf_playType = 0;
	hebesf_playMethod = 0;
}

function hebesfChangeItem(val){
	hebesf_qingkongAll();

	var temp = val.substring("hebesf".length,val.length);

	if(val == 'hebesf1'){
		$("#hebesf_random").hide();
		hebesf_sntuo = 3;
		hebesf_playType = 0;
		hebesf_playMethod = 1;
		$("#hebesf_ballView").empty();
		hebesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hebesf",tips);
	}else if(val == 'hebesf5'){
		$("#hebesf_random").hide();
		hebesf_sntuo = 3;
		hebesf_playType = 0;
		hebesf_playMethod = 5;
		$("#hebesf_ballView").empty();
		hebesf_qingkongAll();
		var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hebesf",tips);
	}else if(val == 'hebesf8'){
		$("#hebesf_random").hide();
		hebesf_sntuo = 3;
		hebesf_playType = 1;
		hebesf_playMethod = 8;
		$("#hebesf_ballView").empty();
		hebesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hebesf",tips);
	}else if(val == 'hebesf12'){
		$("#hebesf_random").hide();
		hebesf_sntuo = 3;
		hebesf_playType = 1;
		hebesf_playMethod = 12;
		$("#hebesf_ballView").empty();
		hebesf_qingkongAll();
		var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hebesf",tips);
	}else if(parseInt(temp) == 14){
		$("#hebesf_random").show();
		hebesf_sntuo = 0;
		hebesf_playType = 2;
		hebesf_playMethod = parseInt(temp);
		createOneLineLayout("hebesf","请至少选择1个",1,11,true,function(){
			hebesf_calcNotes();
		});
	}else if(val == 'hebesf7'){
		$("#hebesf_random").show();
		hebesf_sntuo = 0;
		hebesf_playType = 1;
		hebesf_playMethod = 7;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tips = [tip1,tip2];
		createTwoLineLayout("hebesf",tips,1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf9'){
		$("#hebesf_random").show();
		hebesf_sntuo = 2;
		hebesf_playType = 1;
		hebesf_playMethod = 9;
		createOneLineLayout("hebesf","请至少选择2个",1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf10'){
		$("#hebesf_random").hide();
		hebesf_sntuo = 1;
		hebesf_playType = 1;
		hebesf_playMethod = 10;
		createDanTuoSpecLayout("hebesf",1,1,10,1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf11'){
		$("#hebesf_random").show();
		hebesf_sntuo = 0;
		hebesf_playType = 1;
		hebesf_playMethod = 11;
		createOneLineLayout("hebesf","请至少选择2个",1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf13'){
		$("#hebesf_random").hide();
		hebesf_sntuo = 1;
		hebesf_playType = 1;
		hebesf_playMethod = 13;
		createDanTuoLayout("hebesf",1,1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf0'){
		$("#hebesf_random").show();
		hebesf_sntuo = 0;
		hebesf_playType = 0;
		hebesf_playMethod = 0;
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("hebesf",tips,1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf2'){
		$("#hebesf_random").show();
		hebesf_sntuo = 2;
		hebesf_playType = 0;
		hebesf_playMethod = 2;
		createOneLineLayout("hebesf","请至少选择3个",1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf3'){
		$("#hebesf_random").hide();
		hebesf_sntuo = 1;
		hebesf_playType = 0;
		hebesf_playMethod = 3;
		createDanTuoSpecLayout("hebesf",2,1,10,1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf4'){
		$("#hebesf_random").show();
		hebesf_sntuo = 0;
		hebesf_playType = 0;
		hebesf_playMethod = 4;
		createOneLineLayout("hebesf","请至少选择3个",1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf6'){
		$("#hebesf_random").hide();
		hebesf_sntuo = 1;
		hebesf_playType = 0;
		hebesf_playMethod = 6;
		createDanTuoLayout("hebesf",2,1,11,true,function(){
			hebesf_calcNotes();
		});
		hebesf_qingkongAll();
	}else if(val == 'hebesf16'){
		$("#hebesf_random").show();
		hebesf_sntuo = 0;
		hebesf_playType = 4;
		hebesf_playMethod = 16;
		hebesf_qingkongAll();
		createOneLineLayout("hebesf","前三位：请至少选择1个",1,11,true,function(){
			hebesf_calcNotes();
		});
	}else if(val == 'hebesf15'){
		$("#hebesf_random").show();
		hebesf_sntuo = 0;
		hebesf_playType = 3;
		hebesf_playMethod = 15;
		hebesf_qingkongAll();
		var tip1 = "第一位：可选1-11个";
		var tip2 = "第二位：可选1-11个";
		var tip3 = "第三位：可选1-11个";
		var tips = [tip1,tip2,tip3];

		createThreeLineLayout("hebesf",tips,1,11,true,function(){
			hebesf_calcNotes();
		});
	}else if(parseInt(temp) < 27 && parseInt(temp) > 18){
		$("#hebesf_random").show();
		hebesf_sntuo = 0;
		hebesf_playType = 6;
		hebesf_playMethod = parseInt(temp);
		createOneLineLayout("hebesf","请至少选择"+(hebesf_playMethod - 18)+"个",1,11,true,function(){
			hebesf_calcNotes();
		});
	}else if(parseInt(temp) < 35 && parseInt(temp) > 26){
		$("#hebesf_random").hide();
		hebesf_sntuo = 3;
		hebesf_playType = 7;
		hebesf_playMethod = parseInt(temp);
		$("#hebesf_ballView").empty();
		hebesf_qingkongAll();
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
		var tips = "<p>格式说明<br/>"+name[hebesf_playMethod - 27]+":"+ (array[hebesf_playMethod - 27]) +"<br/>1)每注必须是"+(hebesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("hebesf",tips);
	}else if(parseInt(temp) < 42 && parseInt(temp) > 34){
		$("#hebesf_random").hide();
		hebesf_sntuo = 1;
		hebesf_playType = 8;
		hebesf_playMethod = parseInt(temp);
		createDanTuoLayout("hebesf",hebesf_playMethod-34,1,11,true,function(){
			hebesf_calcNotes();
		});
	}

	if(hebesfScroll){
		hebesfScroll.refresh();
		hebesfScroll.scrollTo(0,0,1);
	}
	
	$("#hebesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
	
	initFooterData("hebesf",temp);
	hideRandomWhenLi("hebesf",hebesf_sntuo,hebesf_playMethod);
	hebesf_calcNotes();
}

/**
 * [hebesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hebesf_initFooterButton(){
	if (hebesf_playType == 6 || hebesf_playType == 2 || hebesf_playType == 4) {
		if (LotteryStorage["hebesf"]["line1"].length > 0) {
			$("#hebesf_qingkong").css("opacity",1.0);
		}else{
			$("#hebesf_qingkong").css("opacity",0.4);
		}
	}else if(hebesf_playType == 8){
		if (LotteryStorage["hebesf"]["line1"].length > 0 || LotteryStorage["hebesf"]["line2"].length > 0) {
			$("#hebesf_qingkong").css("opacity",1.0);
		}else{
			$("#hebesf_qingkong").css("opacity",0.4);
		}
	}else if(hebesf_playType == 3){
		if(LotteryStorage["hebesf"]["line1"].length > 0
			|| LotteryStorage["hebesf"]["line2"].length > 0
			|| LotteryStorage["hebesf"]["line3"].length > 0){
			$("#hebesf_qingkong").css("opacity",1.0);
		}else{
			$("#hebesf_qingkong").css("opacity",0.4);
		}
	}else if(hebesf_playType == 1){
		if (hebesf_playMethod == 7 || hebesf_playMethod == 10 || hebesf_playMethod == 13) {
			if(LotteryStorage["hebesf"]["line1"].length > 0
				|| LotteryStorage["hebesf"]["line2"].length > 0){
				$("#hebesf_qingkong").css("opacity",1.0);
			}else{
				$("#hebesf_qingkong").css("opacity",0.4);
			}
		}else if(hebesf_playMethod == 9 || hebesf_playMethod == 11){
			if(LotteryStorage["hebesf"]["line1"].length > 0){
				$("#hebesf_qingkong").css("opacity",1.0);
			}else{
				$("#hebesf_qingkong").css("opacity",0.4);
			}
		}else if(hebesf_playMethod == 8 || hebesf_playMethod == 12){
			$("#hebesf_qingkong").css("opacity",0);
		}
	}else if(hebesf_playType == 0){
		if (hebesf_playMethod == 0) {
			if(LotteryStorage["hebesf"]["line1"].length > 0
				|| LotteryStorage["hebesf"]["line2"].length > 0
				|| LotteryStorage["hebesf"]["line3"].length > 0){
				$("#hebesf_qingkong").css("opacity",1.0);
			}else{
				$("#hebesf_qingkong").css("opacity",0.4);
			}
		}else if(hebesf_playMethod == 3 || hebesf_playMethod == 6){
			if(LotteryStorage["hebesf"]["line1"].length > 0
				|| LotteryStorage["hebesf"]["line2"].length > 0){
				$("#hebesf_qingkong").css("opacity",1.0);
			}else{
				$("#hebesf_qingkong").css("opacity",0.4);
			}
		}else if(hebesf_playMethod == 2 || hebesf_playMethod == 4){
			if(LotteryStorage["hebesf"]["line1"].length > 0){
				$("#hebesf_qingkong").css("opacity",1.0);
			}else{
				$("#hebesf_qingkong").css("opacity",0.4);
			}
		}else if(hebesf_playMethod == 1 || hebesf_playMethod == 5){
			$("#hebesf_qingkong").css("opacity",0);
		}
	}else{
		$("#hebesf_qingkong").css("opacity",0);
	}

	if($("#hebesf_qingkong").css("opacity") == "0"){
		$("#hebesf_qingkong").css("display","none");
	}else{
		$("#hebesf_qingkong").css("display","block");
	}

	if($('#hebesf_zhushu').html() > 0){
		$("#hebesf_queding").css("opacity",1.0);
	}else{
		$("#hebesf_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  hebesf_qingkongAll(){
	$("#hebesf_ballView span").removeClass('redBalls_active');
	LotteryStorage["hebesf"]["line1"] = [];
	LotteryStorage["hebesf"]["line2"] = [];
	LotteryStorage["hebesf"]["line3"] = [];

	localStorageUtils.removeParam("hebesf_line1");
	localStorageUtils.removeParam("hebesf_line2");
	localStorageUtils.removeParam("hebesf_line3");

	$('#hebesf_zhushu').text(0);
	$('#hebesf_money').text(0);
	clearAwardWin("hebesf");
	hebesf_initFooterButton();
}

/**
 * [hebesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hebesf_calcNotes(){
	$('#hebesf_modeId').blur();
	$('#hebesf_fandian').blur();
	
	var notes = 0;

	if (hebesf_playType == 6) {
		notes = mathUtil.getCCombination(LotteryStorage["hebesf"]["line1"].length,hebesf_playMethod - 18);
	}else if(hebesf_playType == 8){
		if(LotteryStorage["hebesf"]["line1"].length == 0 || LotteryStorage["hebesf"]["line2"].length == 0){
			notes = 0;
		}else{
			notes = mathUtil.getCCombination(LotteryStorage["hebesf"]["line2"].length,(hebesf_playMethod - 33)-LotteryStorage["hebesf"]["line1"].length);
		}
	}else if(hebesf_playType == 2 || hebesf_playType == 4){
		notes = LotteryStorage["hebesf"]["line1"].length;
	}else if(hebesf_playType == 1){
		if (hebesf_playMethod == 7){
			for (var i = 0; i < LotteryStorage["hebesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["hebesf"]["line2"].length; j++) {
					if(LotteryStorage["hebesf"]["line1"][i] != LotteryStorage["hebesf"]["line2"][j]){
						notes++ ;
					}
				}
			}
		}else if(hebesf_playMethod == 9){
			notes = mathUtil.getACombination(LotteryStorage["hebesf"]["line1"].length,2);
		}else if(hebesf_playMethod == 10){
			if(LotteryStorage["hebesf"]["line1"].length == 0 || LotteryStorage["hebesf"]["line2"].length == 0){
				notes = 0;
			}else{
				notes = 2 * mathUtil.getCCombination(LotteryStorage["hebesf"]["line2"].length,1);
			}
		}else if(hebesf_playMethod == 11){
			notes = mathUtil.getCCombination(LotteryStorage["hebesf"]["line1"].length,2);
		}else if(hebesf_playMethod == 13){
			if(LotteryStorage["hebesf"]["line1"].length == 0 || LotteryStorage["hebesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["hebesf"]["line2"].length,1);
			}
		}else{  //单式
			notes = hebesfValidateData('onblur');
		}
	}else if(hebesf_playType == 0){
		if (hebesf_playMethod == 0){
			for (var i = 0; i < LotteryStorage["hebesf"]["line1"].length; i++) {
				for (var j = 0; j < LotteryStorage["hebesf"]["line2"].length; j++) {
					for (var k = 0; k < LotteryStorage["hebesf"]["line3"].length; k++) {
						if(LotteryStorage["hebesf"]["line1"][i] != LotteryStorage["hebesf"]["line2"][j]
							&&LotteryStorage["hebesf"]["line1"][i] != LotteryStorage["hebesf"]["line3"][k]
							&& LotteryStorage["hebesf"]["line2"][j] != LotteryStorage["hebesf"]["line3"][k]){
							notes++ ;
						}
					}
				}
			}
		}else if(hebesf_playMethod == 2){
			notes = mathUtil.getACombination(LotteryStorage["hebesf"]["line1"].length,3);
		}else if(hebesf_playMethod == 3){
			if(LotteryStorage["hebesf"]["line1"].length == 0 || LotteryStorage["hebesf"]["line2"].length == 0){
				notes = 0;
			}else {
				notes = 6 * mathUtil.getCCombination(LotteryStorage["hebesf"]["line2"].length,3 - LotteryStorage["hebesf"]["line1"].length);
			}
		}else if(hebesf_playMethod == 4){
			notes = mathUtil.getCCombination(LotteryStorage["hebesf"]["line1"].length,3);
		}else if(hebesf_playMethod == 6){
			if(LotteryStorage["hebesf"]["line1"].length == 0 || LotteryStorage["hebesf"]["line2"].length == 0
				|| LotteryStorage["hebesf"]["line1"].length + LotteryStorage["hebesf"]["line2"].length < 3){
				notes = 0;
			}else {
				notes = mathUtil.getCCombination(LotteryStorage["hebesf"]["line2"].length,3 - LotteryStorage["hebesf"]["line1"].length);
			}
		}else{  //单式
			notes = hebesfValidateData('onblur');
		}
	}else if(hebesf_playType == 3){
		notes = LotteryStorage["hebesf"]["line1"].length + LotteryStorage["hebesf"]["line2"].length + LotteryStorage["hebesf"]["line3"].length;
	}else{  //单式
		notes = hebesfValidateData('onblur');
	}

	hideRandomWhenLi('hebesf',hebesf_sntuo,hebesf_playMethod);

	//验证是否为空
	if( $("#hebesf_beiNum").val() =="" || parseInt($("#hebesf_beiNum").val()) == 0){
		$("#hebesf_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#hebesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple")) ){
		$("#hebesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#hebesf_zhushu').text(notes);
		if($("#hebesf_modeId").val() == "8"){
			$('#hebesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hebesf_beiNum").val()),0.002));
		}else if ($("#hebesf_modeId").val() == "2"){
			$('#hebesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hebesf_beiNum").val()),0.2));
		}else if ($("#hebesf_modeId").val() == "1"){
			$('#hebesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hebesf_beiNum").val()),0.02));
		}else{
			$('#hebesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hebesf_beiNum").val()),2));
		}
	} else {
		$('#hebesf_zhushu').text(0);
		$('#hebesf_money').text(0);
	}
	hebesf_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('hebesf',hebesf_playMethod);
}

/**
 * [hebesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hebesf_randomOne(){
	hebesf_qingkongAll();
	if(hebesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(hebesf_playMethod - 18,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["hebesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "hebesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hebesf_playMethod == 14){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["hebesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["hebesf"]["line1"], function(k, v){
			$("#" + "hebesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(hebesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		LotteryStorage["hebesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["hebesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

		$.each(LotteryStorage["hebesf"]["line1"], function(k, v){
			$("#" + "hebesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hebesf"]["line2"], function(k, v){
			$("#" + "hebesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(hebesf_playMethod == 9 || hebesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["hebesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "hebesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hebesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		LotteryStorage["hebesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
		LotteryStorage["hebesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
		LotteryStorage["hebesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

		$.each(LotteryStorage["hebesf"]["line1"], function(k, v){
			$("#" + "hebesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hebesf"]["line2"], function(k, v){
			$("#" + "hebesf_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hebesf"]["line3"], function(k, v){
			$("#" + "hebesf_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(hebesf_playMethod == 2 || hebesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(k,v){
			LotteryStorage["hebesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
			$("#" + "hebesf_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hebesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["hebesf"]["line1"].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["hebesf"]["line1"], function(k, v){
			$("#" + "hebesf_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(hebesf_playMethod == 15){
		var line = mathUtil.getRandomNum(1,4);
		var number = mathUtil.getRandomNum(1,12);
		LotteryStorage["hebesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
		$.each(LotteryStorage["hebesf"]["line"+line], function(k, v){
			$("#" + "hebesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
		});
	}
	hebesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hebesf_checkOutRandom(playMethod){
	var obj = new Object();
	if(hebesf_playType == 6){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(hebesf_playMethod - 18,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hebesf_playMethod == 14 || hebesf_playMethod == 16){
		var number = mathUtil.getRandomNum(1,12);
		obj.nums = number < 10 ? "0"+number : number;
		obj.notes = 1;
	}else if(hebesf_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(hebesf_playMethod == 9){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(hebesf_playMethod == 11){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hebesf_playMethod == 0){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(hebesf_playMethod == 2){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 6;
	}else if(hebesf_playMethod == 4){
		var redBallArray = mathUtil.getInts(1,11);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hebesf_playMethod == 15){
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
	obj.sntuo = hebesf_sntuo;
	obj.multiple = 1;
	obj.rebates = hebesf_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('hebesf',hebesf_playMethod,obj);  //机选奖金计算
	obj.award = $('#hebesf_minAward').html();     //奖金
	obj.maxAward = $('#hebesf_maxAward').html();  //多级奖金
	return obj;
}


/**
 * [hebesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hebesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#hebesf_queding").bind('click', function(event) {
		hebesf_rebate = $("#hebesf_fandian option:last").val();
		if(parseInt($('#hebesf_zhushu').html()) <= 0 || Number($("#hebesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hebesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#hebesf_modeId').val()) == 8){
			if (Number($('#hebesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('hebesf',hebesf_playMethod);

		submitParams.lotteryType = "hebesf";
		var playType = LotteryInfo.getPlayName("esf",hebesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",hebesf_playMethod);
		submitParams.playTypeIndex = hebesf_playType;
		submitParams.playMethodIndex = hebesf_playMethod;
		var selectedBalls = [];
		if (hebesf_playType == 6 || hebesf_playType == 2 || hebesf_playType == 4) {
			$("#hebesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(hebesf_playType == 8){
			if(parseInt($('#hebesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#hebesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(hebesf_playType == 1 || hebesf_playType == 0){
			if(hebesf_playMethod == 7 || hebesf_playMethod == 0){
				$("#hebesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(hebesf_playMethod == 9 || hebesf_playMethod == 11 || hebesf_playMethod == 2 || hebesf_playMethod == 4){
				$("#hebesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(hebesf_playMethod == 10 || hebesf_playMethod == 13 || hebesf_playMethod == 3 || hebesf_playMethod == 6){
				if(parseInt($('#hebesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#hebesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(hebesf_playMethod == 1 || hebesf_playMethod == 8){//直选单式
				//去错误号
				hebesfValidateData("submit");
				var arr = $("#hebesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(hebesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(hebesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(hebesf_playMethod == 5 || hebesf_playMethod == 12){//组选单式
				//去错误号
				hebesfValidateData("submit");
				var arr = $("#hebesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(hebesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(hebesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(hebesf_playMethod == 15) {
			$("#hebesf_ballView div.ballView").each(function(){
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
			hebesfValidateData("submit");
			var arr = $("#hebesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(hebesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(hebesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(hebesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(hebesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(hebesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(hebesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(hebesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#hebesf_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#hebesf_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#hebesf_fandian").val());
		submitParams.notes = $('#hebesf_zhushu').html();
		submitParams.sntuo = hebesf_sntuo;
		submitParams.multiple = $('#hebesf_beiNum').val();  //requirement
		submitParams.rebates = $('#hebesf_fandian').val();  //requirement
		submitParams.playMode = $('#hebesf_modeId').val();  //requirement
		submitParams.money = $('#hebesf_money').html();  //requirement
		submitParams.award = $('#hebesf_minAward').html();  //奖金
		submitParams.maxAward = $('#hebesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#hebesf_ballView").empty();
		hebesf_qingkongAll();
	});
}

function hebesfValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#hebesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
	var	result,
		content = {};
    if(hebesf_playMethod == 1){  //前三直选单式
		content.str = str;
		content.weishu = 8;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if( hebesf_playMethod == 8){  //前二直选单式
		content.str = str;
		content.weishu = 5;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    } else if(hebesf_playMethod == 5){  //前三组选单式
		content.str = str;
		content.weishu = 8;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if(hebesf_playMethod == 12){  //前二组选单式
		content.str = str;
		content.weishu = 5;
		content.renXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
    }else if (hebesf_playMethod > 26 && hebesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(hebesf_playMethod - 26);
		content.str = str;
		content.weishu = 3*weiNum-1;
		content.renXuan = true;
		content.select = true;
		result = handleSingleStr_deleteErr(content,type);
    }

	$('#hebesf_delRepeat').off('click');
	$('#hebesf_delRepeat').on('click',function () {
		content.str = $('#hebesf_single').val() ? $('#hebesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		hebesfShowFooter(true,notes);
		$("#hebesf_single").val(array.join(","));
	});
	
    $("#hebesf_single").val(result.num.join(","));
    var notes = result.length;
    hebesfShowFooter(true,notes);
	return notes;
}

function hebesfShowFooter(isValid,notes){
    $('#hebesf_zhushu').text(notes);
    if($("#hebesf_modeId").val() == "8"){
        $('#hebesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hebesf_beiNum").val()),0.002));
    }else if ($("#hebesf_modeId").val() == "2"){
        $('#hebesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hebesf_beiNum").val()),0.2));
    }else if ($("#hebesf_modeId").val() == "1"){
        $('#hebesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hebesf_beiNum").val()),0.02));
    }else{
        $('#hebesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#hebesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    hebesf_initFooterButton();
    calcAwardWin('hebesf',hebesf_playMethod);  //计算奖金和盈利
}