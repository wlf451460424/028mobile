var jsuesf_playType = 1;
var jsuesf_playMethod = 7;
var jsuesf_sntuo = 0;
var jsuesf_rebate;
var jsuesfScroll;

//进入这个页面时调用
function jsuesfPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("jsuesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("jsuesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function jsuesfPageUnloadedPanel(){
    $("#jsuesfPage_back").off('click');
    $("#jsuesf_queding").off('click');
    $("#jsuesf_ballView").empty();
    $("#jsuesfSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="jsuesfPlaySelect"></select>');
    $("#jsuesfSelect").append($select);
}

//入口函数
function jsuesf_init(){
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
    $("#jsuesf_title").html(LotteryInfo.getLotteryNameByTag("jsuesf"));
    for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
    	if(i == 5)continue;
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
                var name = LotteryInfo.getMethodName("esf",j);
                if(i == jsuesf_playType && j == jsuesf_playMethod){
                    $play.append('<option value="jsuesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="jsuesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(jsuesf_playMethod,onShowArray)>-1 ){
						jsuesf_playType = i;
						jsuesf_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#jsuesfPlaySelect").append($play);
		}
    }
    
    if($("#jsuesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("jsuesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:jsuesfChangeItem
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

    GetLotteryInfo("jsuesf",function (){
        jsuesfChangeItem("jsuesf"+jsuesf_playMethod);
    });

    //添加滑动条
    if(!jsuesfScroll){
        jsuesfScroll = new IScroll('#jsuesfContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("jsuesf",LotteryInfo.getLotteryIdByTag("jsuesf"));

    //获取上一期开奖
    queryLastPrize("jsuesf");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('jsuesf');

    //机选选号
    $("#jsuesf_random").on('click', function(event) {
        jsuesf_randomOne();
    });

    //返回
    $("#jsuesfPage_back").on('click', function(event) {
        // jsuesf_playType = 0;
        // jsuesf_playMethod = 0;
        $("#jsuesf_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        jsuesf_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#jsuesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",jsuesf_playMethod));
	//玩法说明
	$("#jsuesf_paly_shuoming").off('click');
	$("#jsuesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#jsuesf_shuoming").text());
	});

    qingKong("jsuesf");//清空
    jsuesf_submitData();
}

function jsuesfResetPlayType(){
    jsuesf_playType = 0;
    jsuesf_playMethod = 0;
}

function jsuesfChangeItem(val){
    jsuesf_qingkongAll();

    var temp = val.substring("jsuesf".length,val.length);

    if(val == 'jsuesf1'){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 3;
        jsuesf_playType = 0;
        jsuesf_playMethod = 1;
        $("#jsuesf_ballView").empty();
        jsuesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsuesf",tips);
    }else if(val == 'jsuesf5'){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 3;
        jsuesf_playType = 0;
        jsuesf_playMethod = 5;
        $("#jsuesf_ballView").empty();
        jsuesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsuesf",tips);
    }else if(val == 'jsuesf8'){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 3;
        jsuesf_playType = 1;
        jsuesf_playMethod = 8;
        $("#jsuesf_ballView").empty();
        jsuesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsuesf",tips);
    }else if(val == 'jsuesf12'){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 3;
        jsuesf_playType = 1;
        jsuesf_playMethod = 12;
        $("#jsuesf_ballView").empty();
        jsuesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsuesf",tips);
    }else if(parseInt(temp) == 14){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 0;
        jsuesf_playType = 2;
        jsuesf_playMethod = parseInt(temp);
        createOneLineLayout("jsuesf","请至少选择1个",1,11,true,function(){
            jsuesf_calcNotes();
        });
    }else if(val == 'jsuesf7'){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 0;
        jsuesf_playType = 1;
        jsuesf_playMethod = 7;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tips = [tip1,tip2];
        createTwoLineLayout("jsuesf",tips,1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf9'){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 2;
        jsuesf_playType = 1;
        jsuesf_playMethod = 9;
        createOneLineLayout("jsuesf","请至少选择2个",1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf10'){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 1;
        jsuesf_playType = 1;
        jsuesf_playMethod = 10;
        createDanTuoSpecLayout("jsuesf",1,1,10,1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf11'){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 0;
        jsuesf_playType = 1;
        jsuesf_playMethod = 11;
        createOneLineLayout("jsuesf","请至少选择2个",1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf13'){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 1;
        jsuesf_playType = 1;
        jsuesf_playMethod = 13;
        createDanTuoLayout("jsuesf",1,1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf0'){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 0;
        jsuesf_playType = 0;
        jsuesf_playMethod = 0;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("jsuesf",tips,1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf2'){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 2;
        jsuesf_playType = 0;
        jsuesf_playMethod = 2;
        createOneLineLayout("jsuesf","请至少选择3个",1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf3'){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 1;
        jsuesf_playType = 0;
        jsuesf_playMethod = 3;
        createDanTuoSpecLayout("jsuesf",2,1,10,1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf4'){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 0;
        jsuesf_playType = 0;
        jsuesf_playMethod = 4;
        createOneLineLayout("jsuesf","请至少选择3个",1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf6'){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 1;
        jsuesf_playType = 0;
        jsuesf_playMethod = 6;
        createDanTuoLayout("jsuesf",2,1,11,true,function(){
            jsuesf_calcNotes();
        });
        jsuesf_qingkongAll();
    }else if(val == 'jsuesf16'){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 0;
        jsuesf_playType = 4;
        jsuesf_playMethod = 16;
        jsuesf_qingkongAll();
        createOneLineLayout("jsuesf","前三位：请至少选择1个",1,11,true,function(){
            jsuesf_calcNotes();
        });
    }else if(val == 'jsuesf15'){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 0;
        jsuesf_playType = 3;
        jsuesf_playMethod = 15;
        jsuesf_qingkongAll();
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("jsuesf",tips,1,11,true,function(){
            jsuesf_calcNotes();
        });
    }else if(parseInt(temp) < 27 && parseInt(temp) > 18){
        $("#jsuesf_random").show();
        jsuesf_sntuo = 0;
        jsuesf_playType = 6;
        jsuesf_playMethod = parseInt(temp);
        createOneLineLayout("jsuesf","请至少选择"+(jsuesf_playMethod - 18)+"个",1,11,true,function(){
            jsuesf_calcNotes();
        });
    }else if(parseInt(temp) < 35 && parseInt(temp) > 26){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 3;
        jsuesf_playType = 7;
        jsuesf_playMethod = parseInt(temp);
        $("#jsuesf_ballView").empty();
        jsuesf_qingkongAll();
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
        var tips = "<p>格式说明<br/>"+name[jsuesf_playMethod - 27]+":"+ (array[jsuesf_playMethod - 27]) +"<br/>1)每注必须是"+(jsuesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsuesf",tips);
    }else if(parseInt(temp) < 42 && parseInt(temp) > 34){
        $("#jsuesf_random").hide();
        jsuesf_sntuo = 1;
        jsuesf_playType = 8;
        jsuesf_playMethod = parseInt(temp);
        createDanTuoLayout("jsuesf",jsuesf_playMethod-34,1,11,true,function(){
            jsuesf_calcNotes();
        });
    }

    if(jsuesfScroll){
        jsuesfScroll.refresh();
        jsuesfScroll.scrollTo(0,0,1);
    }
    
    $("#jsuesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
    
    initFooterData("jsuesf",temp);
    hideRandomWhenLi("jsuesf",jsuesf_sntuo,jsuesf_playMethod);
    jsuesf_calcNotes();
}

/**
 * [jsuesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function jsuesf_initFooterButton(){
    if (jsuesf_playType == 6 || jsuesf_playType == 2 || jsuesf_playType == 4) {
        if (LotteryStorage["jsuesf"]["line1"].length > 0) {
            $("#jsuesf_qingkong").css("opacity",1.0);
        }else{
            $("#jsuesf_qingkong").css("opacity",0.4);
        }
    }else if(jsuesf_playType == 8){
        if (LotteryStorage["jsuesf"]["line1"].length > 0 || LotteryStorage["jsuesf"]["line2"].length > 0) {
            $("#jsuesf_qingkong").css("opacity",1.0);
        }else{
            $("#jsuesf_qingkong").css("opacity",0.4);
        }
    }else if(jsuesf_playType == 3){
        if(LotteryStorage["jsuesf"]["line1"].length > 0
            || LotteryStorage["jsuesf"]["line2"].length > 0
            || LotteryStorage["jsuesf"]["line3"].length > 0){
            $("#jsuesf_qingkong").css("opacity",1.0);
        }else{
            $("#jsuesf_qingkong").css("opacity",0.4);
        }
    }else if(jsuesf_playType == 1){
        if (jsuesf_playMethod == 7 || jsuesf_playMethod == 10 || jsuesf_playMethod == 13) {
            if(LotteryStorage["jsuesf"]["line1"].length > 0
                || LotteryStorage["jsuesf"]["line2"].length > 0){
                $("#jsuesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsuesf_qingkong").css("opacity",0.4);
            }
        }else if(jsuesf_playMethod == 9 || jsuesf_playMethod == 11){
            if(LotteryStorage["jsuesf"]["line1"].length > 0){
                $("#jsuesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsuesf_qingkong").css("opacity",0.4);
            }
        }else if(jsuesf_playMethod == 8 || jsuesf_playMethod == 12){
            $("#jsuesf_qingkong").css("opacity",0);
        }
    }else if(jsuesf_playType == 0){
        if (jsuesf_playMethod == 0) {
            if(LotteryStorage["jsuesf"]["line1"].length > 0
                || LotteryStorage["jsuesf"]["line2"].length > 0
                || LotteryStorage["jsuesf"]["line3"].length > 0){
                $("#jsuesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsuesf_qingkong").css("opacity",0.4);
            }
        }else if(jsuesf_playMethod == 3 || jsuesf_playMethod == 6){
            if(LotteryStorage["jsuesf"]["line1"].length > 0
                || LotteryStorage["jsuesf"]["line2"].length > 0){
                $("#jsuesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsuesf_qingkong").css("opacity",0.4);
            }
        }else if(jsuesf_playMethod == 2 || jsuesf_playMethod == 4){
            if(LotteryStorage["jsuesf"]["line1"].length > 0){
                $("#jsuesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsuesf_qingkong").css("opacity",0.4);
            }
        }else if(jsuesf_playMethod == 1 || jsuesf_playMethod == 5){
            $("#jsuesf_qingkong").css("opacity",0);
        }
    }else{
        $("#jsuesf_qingkong").css("opacity",0);
    }

    if($("#jsuesf_qingkong").css("opacity") == "0"){
        $("#jsuesf_qingkong").css("display","none");
    }else{
        $("#jsuesf_qingkong").css("display","block");
    }

    if($('#jsuesf_zhushu').html() > 0){
        $("#jsuesf_queding").css("opacity",1.0);
    }else{
        $("#jsuesf_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  jsuesf_qingkongAll(){
    $("#jsuesf_ballView span").removeClass('redBalls_active');
    LotteryStorage["jsuesf"]["line1"] = [];
    LotteryStorage["jsuesf"]["line2"] = [];
    LotteryStorage["jsuesf"]["line3"] = [];

    localStorageUtils.removeParam("jsuesf_line1");
    localStorageUtils.removeParam("jsuesf_line2");
    localStorageUtils.removeParam("jsuesf_line3");

    $('#jsuesf_zhushu').text(0);
    $('#jsuesf_money').text(0);
    clearAwardWin("jsuesf");
    jsuesf_initFooterButton();
}

/**
 * [jsuesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function jsuesf_calcNotes(){
	$('#jsuesf_modeId').blur();
	$('#jsuesf_fandian').blur();
	
    var notes = 0;

    if (jsuesf_playType == 6) {
        notes = mathUtil.getCCombination(LotteryStorage["jsuesf"]["line1"].length,jsuesf_playMethod - 18);
    }else if(jsuesf_playType == 8){
        if(LotteryStorage["jsuesf"]["line1"].length == 0 || LotteryStorage["jsuesf"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["jsuesf"]["line2"].length,(jsuesf_playMethod - 33)-LotteryStorage["jsuesf"]["line1"].length);
        }
    }else if(jsuesf_playType == 2 || jsuesf_playType == 4){
        notes = LotteryStorage["jsuesf"]["line1"].length;
    }else if(jsuesf_playType == 1){
        if (jsuesf_playMethod == 7){
            for (var i = 0; i < LotteryStorage["jsuesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["jsuesf"]["line2"].length; j++) {
                    if(LotteryStorage["jsuesf"]["line1"][i] != LotteryStorage["jsuesf"]["line2"][j]){
                        notes++ ;
                    }
                }
            }
        }else if(jsuesf_playMethod == 9){
            notes = mathUtil.getACombination(LotteryStorage["jsuesf"]["line1"].length,2);
        }else if(jsuesf_playMethod == 10){
            if(LotteryStorage["jsuesf"]["line1"].length == 0 || LotteryStorage["jsuesf"]["line2"].length == 0){
                notes = 0;
            }else{
                notes = 2 * mathUtil.getCCombination(LotteryStorage["jsuesf"]["line2"].length,1);
            }
        }else if(jsuesf_playMethod == 11){
            notes = mathUtil.getCCombination(LotteryStorage["jsuesf"]["line1"].length,2);
        }else if(jsuesf_playMethod == 13){
            if(LotteryStorage["jsuesf"]["line1"].length == 0 || LotteryStorage["jsuesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["jsuesf"]["line2"].length,1);
            }
        }else{  //单式
            notes = jsuesfValidateData('onblur');
        }
    }else if(jsuesf_playType == 0){
        if (jsuesf_playMethod == 0){
            for (var i = 0; i < LotteryStorage["jsuesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["jsuesf"]["line2"].length; j++) {
                    for (var k = 0; k < LotteryStorage["jsuesf"]["line3"].length; k++) {
                        if(LotteryStorage["jsuesf"]["line1"][i] != LotteryStorage["jsuesf"]["line2"][j]
                            &&LotteryStorage["jsuesf"]["line1"][i] != LotteryStorage["jsuesf"]["line3"][k]
                            && LotteryStorage["jsuesf"]["line2"][j] != LotteryStorage["jsuesf"]["line3"][k]){
                            notes++ ;
                        }
                    }
                }
            }
        }else if(jsuesf_playMethod == 2){
            notes = mathUtil.getACombination(LotteryStorage["jsuesf"]["line1"].length,3);
        }else if(jsuesf_playMethod == 3){
            if(LotteryStorage["jsuesf"]["line1"].length == 0 || LotteryStorage["jsuesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = 6 * mathUtil.getCCombination(LotteryStorage["jsuesf"]["line2"].length,3 - LotteryStorage["jsuesf"]["line1"].length);
            }
        }else if(jsuesf_playMethod == 4){
            notes = mathUtil.getCCombination(LotteryStorage["jsuesf"]["line1"].length,3);
        }else if(jsuesf_playMethod == 6){
            if(LotteryStorage["jsuesf"]["line1"].length == 0 || LotteryStorage["jsuesf"]["line2"].length == 0
                || LotteryStorage["jsuesf"]["line1"].length + LotteryStorage["jsuesf"]["line2"].length < 3){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["jsuesf"]["line2"].length,3 - LotteryStorage["jsuesf"]["line1"].length);
            }
        }else{  //单式
            notes = jsuesfValidateData('onblur');
        }
    }else if(jsuesf_playType == 3){
        notes = LotteryStorage["jsuesf"]["line1"].length + LotteryStorage["jsuesf"]["line2"].length + LotteryStorage["jsuesf"]["line3"].length;
    }else{  //单式
        notes = jsuesfValidateData('onblur');
    }

    hideRandomWhenLi('jsuesf',jsuesf_sntuo,jsuesf_playMethod);

    //验证是否为空
    if( $("#jsuesf_beiNum").val() =="" || parseInt($("#jsuesf_beiNum").val()) == 0){
        $("#jsuesf_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#jsuesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#jsuesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#jsuesf_zhushu').text(notes);
        if($("#jsuesf_modeId").val() == "8"){
            $('#jsuesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsuesf_beiNum").val()),0.002));
        }else if ($("#jsuesf_modeId").val() == "2"){
            $('#jsuesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsuesf_beiNum").val()),0.2));
        }else if ($("#jsuesf_modeId").val() == "1"){
            $('#jsuesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsuesf_beiNum").val()),0.02));
        }else{
            $('#jsuesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsuesf_beiNum").val()),2));
        }
    } else {
        $('#jsuesf_zhushu').text(0);
        $('#jsuesf_money').text(0);
    }
    jsuesf_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('jsuesf',jsuesf_playMethod);
}

/**
 * [jsuesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function jsuesf_randomOne(){
    jsuesf_qingkongAll();
    if(jsuesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(jsuesf_playMethod - 18,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jsuesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jsuesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsuesf_playMethod == 14){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jsuesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jsuesf"]["line1"], function(k, v){
            $("#" + "jsuesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jsuesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        LotteryStorage["jsuesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["jsuesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

        $.each(LotteryStorage["jsuesf"]["line1"], function(k, v){
            $("#" + "jsuesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jsuesf"]["line2"], function(k, v){
            $("#" + "jsuesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jsuesf_playMethod == 9 || jsuesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jsuesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jsuesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsuesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        LotteryStorage["jsuesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["jsuesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
        LotteryStorage["jsuesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

        $.each(LotteryStorage["jsuesf"]["line1"], function(k, v){
            $("#" + "jsuesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jsuesf"]["line2"], function(k, v){
            $("#" + "jsuesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jsuesf"]["line3"], function(k, v){
            $("#" + "jsuesf_line3" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jsuesf_playMethod == 2 || jsuesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jsuesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jsuesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsuesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jsuesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jsuesf"]["line1"], function(k, v){
            $("#" + "jsuesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jsuesf_playMethod == 15){
        var line = mathUtil.getRandomNum(1,4);
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jsuesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jsuesf"]["line"+line], function(k, v){
            $("#" + "jsuesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
        });
    }
    jsuesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function jsuesf_checkOutRandom(playMethod){
    var obj = new Object();
    if(jsuesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(jsuesf_playMethod - 18,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jsuesf_playMethod == 14 || jsuesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        obj.nums = number < 10 ? "0"+number : number;
        obj.notes = 1;
    }else if(jsuesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(jsuesf_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(jsuesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jsuesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(jsuesf_playMethod == 2){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 6;
    }else if(jsuesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jsuesf_playMethod == 15){
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
    obj.sntuo = jsuesf_sntuo;
    obj.multiple = 1;
    obj.rebates = jsuesf_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('jsuesf',jsuesf_playMethod,obj);  //机选奖金计算
    obj.award = $('#jsuesf_minAward').html();     //奖金
    obj.maxAward = $('#jsuesf_maxAward').html();  //多级奖金
    return obj;
}


/**
 * [jsuesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function jsuesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#jsuesf_queding").bind('click', function(event) {
		jsuesf_rebate = $("#jsuesf_fandian option:last").val();
		if(parseInt($('#jsuesf_zhushu').html()) <= 0 || Number($("#jsuesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		jsuesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#jsuesf_modeId').val()) == 8){
			if (Number($('#jsuesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('jsuesf',jsuesf_playMethod);

		submitParams.lotteryType = "jsuesf";
		var playType = LotteryInfo.getPlayName("esf",jsuesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",jsuesf_playMethod);
		submitParams.playTypeIndex = jsuesf_playType;
		submitParams.playMethodIndex = jsuesf_playMethod;
		var selectedBalls = [];
		if (jsuesf_playType == 6 || jsuesf_playType == 2 || jsuesf_playType == 4) {
			$("#jsuesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(jsuesf_playType == 8){
			if(parseInt($('#jsuesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#jsuesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(jsuesf_playType == 1 || jsuesf_playType == 0){
			if(jsuesf_playMethod == 7 || jsuesf_playMethod == 0){
				$("#jsuesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(jsuesf_playMethod == 9 || jsuesf_playMethod == 11 || jsuesf_playMethod == 2 || jsuesf_playMethod == 4){
				$("#jsuesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(jsuesf_playMethod == 10 || jsuesf_playMethod == 13 || jsuesf_playMethod == 3 || jsuesf_playMethod == 6){
				if(parseInt($('#jsuesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#jsuesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(jsuesf_playMethod == 1 || jsuesf_playMethod == 8){//直选单式
				//去错误号
				jsuesfValidateData("submit");
				var arr = $("#jsuesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(jsuesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(jsuesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(jsuesf_playMethod == 5 || jsuesf_playMethod == 12){//组选单式
				//去错误号
				jsuesfValidateData("submit");
				var arr = $("#jsuesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(jsuesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(jsuesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(jsuesf_playMethod == 15) {
			$("#jsuesf_ballView div.ballView").each(function(){
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
			jsuesfValidateData("submit");
			var arr = $("#jsuesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(jsuesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(jsuesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(jsuesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(jsuesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(jsuesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(jsuesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(jsuesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#jsuesf_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#jsuesf_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#jsuesf_fandian").val());
		submitParams.notes = $('#jsuesf_zhushu').html();
		submitParams.sntuo = jsuesf_sntuo;
		submitParams.multiple = $('#jsuesf_beiNum').val();  //requirement
		submitParams.rebates = $('#jsuesf_fandian').val();  //requirement
		submitParams.playMode = $('#jsuesf_modeId').val();  //requirement
		submitParams.money = $('#jsuesf_money').html();  //requirement
		submitParams.award = $('#jsuesf_minAward').html();  //奖金
		submitParams.maxAward = $('#jsuesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#jsuesf_ballView").empty();
		jsuesf_qingkongAll();
	});
}

function jsuesfValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#jsuesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
    var	result,
        content = {};
    if(jsuesf_playMethod == 1){  //前三直选单式
        content.str = str;
        content.weishu = 8;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if( jsuesf_playMethod == 8){  //前二直选单式
        content.str = str;
        content.weishu = 5;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    } else if(jsuesf_playMethod == 5){  //前三组选单式
        content.str = str;
        content.weishu = 8;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if(jsuesf_playMethod == 12){  //前二组选单式
        content.str = str;
        content.weishu = 5;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if (jsuesf_playMethod > 26 && jsuesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(jsuesf_playMethod - 26);
        content.str = str;
        content.weishu = 3*weiNum-1;
        content.renXuan = true;
        content.select = true;
        result = handleSingleStr_deleteErr(content,type);
    }

    $('#jsuesf_delRepeat').off('click');
    $('#jsuesf_delRepeat').on('click',function () {
        content.str = $('#jsuesf_single').val() ? $('#jsuesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        var array = rptResult.num || [];
        notes = rptResult.length;
        jsuesfShowFooter(true,notes);
        $("#jsuesf_single").val(array.join(","));
    });

    $("#jsuesf_single").val(result.num.join(","));
    var notes = result.length;
    jsuesfShowFooter(true,notes);
    return notes;
}

function jsuesfShowFooter(isValid,notes){
    $('#jsuesf_zhushu').text(notes);
    if($("#jsuesf_modeId").val() == "8"){
        $('#jsuesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsuesf_beiNum").val()),0.002));
    }else if ($("#jsuesf_modeId").val() == "2"){
        $('#jsuesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsuesf_beiNum").val()),0.2));
    }else if ($("#jsuesf_modeId").val() == "1"){
        $('#jsuesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsuesf_beiNum").val()),0.02));
    }else{
        $('#jsuesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsuesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    jsuesf_initFooterButton();
    calcAwardWin('jsuesf',jsuesf_playMethod);  //计算奖金和盈利
}