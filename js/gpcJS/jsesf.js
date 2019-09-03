var jsesf_playType = 1;
var jsesf_playMethod = 7;
var jsesf_sntuo = 0;
var jsesf_rebate;
var jsesfScroll;

//进入这个页面时调用
function jsesfPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("jsesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("jsesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function jsesfPageUnloadedPanel(){
    $("#jsesfPage_back").off('click');
    $("#jsesf_queding").off('click');
    $("#jsesf_ballView").empty();
    $("#jsesfSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="jsesfPlaySelect"></select>');
    $("#jsesfSelect").append($select);
}

//入口函数
function jsesf_init(){
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
    $("#jsesf_title").html(LotteryInfo.getLotteryNameByTag("jsesf"));
    for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
    	if(i == 5)continue;
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
                var name = LotteryInfo.getMethodName("esf",j);
                if(i == jsesf_playType && j == jsesf_playMethod){
                    $play.append('<option value="jsesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="jsesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(jsesf_playMethod,onShowArray)>-1 ){
						jsesf_playType = i;
						jsesf_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#jsesfPlaySelect").append($play);
		}
    }
    
    if($("#jsesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("jsesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:jsesfChangeItem
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

    GetLotteryInfo("jsesf",function (){
        jsesfChangeItem("jsesf"+jsesf_playMethod);
    });

    //添加滑动条
    if(!jsesfScroll){
        jsesfScroll = new IScroll('#jsesfContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("jsesf",LotteryInfo.getLotteryIdByTag("jsesf"));

    //获取上一期开奖
    queryLastPrize("jsesf");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('jsesf');

    //机选选号
    $("#jsesf_random").on('click', function(event) {
        jsesf_randomOne();
    });
    
    $("#jsesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",jsesf_playMethod));
	//玩法说明
	$("#jsesf_paly_shuoming").off('click');
	$("#jsesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#jsesf_shuoming").text());
	});

    //返回
    $("#jsesfPage_back").on('click', function(event) {
        // jsesf_playType = 0;
        // jsesf_playMethod = 0;
        $("#jsesf_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        jsesf_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("jsesf");//清空
    jsesf_submitData();
}

function jsesfResetPlayType(){
    jsesf_playType = 0;
    jsesf_playMethod = 0;
}

function jsesfChangeItem(val){
    jsesf_qingkongAll();

    var temp = val.substring("jsesf".length,val.length);

    if(val == 'jsesf1'){
        $("#jsesf_random").hide();
        jsesf_sntuo = 3;
        jsesf_playType = 0;
        jsesf_playMethod = 1;
        $("#jsesf_ballView").empty();
        jsesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsesf",tips);
    }else if(val == 'jsesf5'){
        $("#jsesf_random").hide();
        jsesf_sntuo = 3;
        jsesf_playType = 0;
        jsesf_playMethod = 5;
        $("#jsesf_ballView").empty();
        jsesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsesf",tips);
    }else if(val == 'jsesf8'){
        $("#jsesf_random").hide();
        jsesf_sntuo = 3;
        jsesf_playType = 1;
        jsesf_playMethod = 8;
        $("#jsesf_ballView").empty();
        jsesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsesf",tips);
    }else if(val == 'jsesf12'){
        $("#jsesf_random").hide();
        jsesf_sntuo = 3;
        jsesf_playType = 1;
        jsesf_playMethod = 12;
        $("#jsesf_ballView").empty();
        jsesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsesf",tips);
    }else if(parseInt(temp) == 14){
        $("#jsesf_random").show();
        jsesf_sntuo = 0;
        jsesf_playType = 2;
        jsesf_playMethod = parseInt(temp);
        createOneLineLayout("jsesf","请至少选择1个",1,11,true,function(){
            jsesf_calcNotes();
        });
    }else if(val == 'jsesf7'){
        $("#jsesf_random").show();
        jsesf_sntuo = 0;
        jsesf_playType = 1;
        jsesf_playMethod = 7;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tips = [tip1,tip2];
        createTwoLineLayout("jsesf",tips,1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf9'){
        $("#jsesf_random").show();
        jsesf_sntuo = 2;
        jsesf_playType = 1;
        jsesf_playMethod = 9;
        createOneLineLayout("jsesf","请至少选择2个",1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf10'){
        $("#jsesf_random").hide();
        jsesf_sntuo = 1;
        jsesf_playType = 1;
        jsesf_playMethod = 10;
        createDanTuoSpecLayout("jsesf",1,1,10,1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf11'){
        $("#jsesf_random").show();
        jsesf_sntuo = 0;
        jsesf_playType = 1;
        jsesf_playMethod = 11;
        createOneLineLayout("jsesf","请至少选择2个",1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf13'){
        $("#jsesf_random").hide();
        jsesf_sntuo = 1;
        jsesf_playType = 1;
        jsesf_playMethod = 13;
        createDanTuoLayout("jsesf",1,1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf0'){
        $("#jsesf_random").show();
        jsesf_sntuo = 0;
        jsesf_playType = 0;
        jsesf_playMethod = 0;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("jsesf",tips,1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf2'){
        $("#jsesf_random").show();
        jsesf_sntuo = 2;
        jsesf_playType = 0;
        jsesf_playMethod = 2;
        createOneLineLayout("jsesf","请至少选择3个",1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf3'){
        $("#jsesf_random").hide();
        jsesf_sntuo = 1;
        jsesf_playType = 0;
        jsesf_playMethod = 3;
        createDanTuoSpecLayout("jsesf",2,1,10,1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf4'){
        $("#jsesf_random").show();
        jsesf_sntuo = 0;
        jsesf_playType = 0;
        jsesf_playMethod = 4;
        createOneLineLayout("jsesf","请至少选择3个",1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf6'){
        $("#jsesf_random").hide();
        jsesf_sntuo = 1;
        jsesf_playType = 0;
        jsesf_playMethod = 6;
        createDanTuoLayout("jsesf",2,1,11,true,function(){
            jsesf_calcNotes();
        });
        jsesf_qingkongAll();
    }else if(val == 'jsesf16'){
        $("#jsesf_random").show();
        jsesf_sntuo = 0;
        jsesf_playType = 4;
        jsesf_playMethod = 16;
        jsesf_qingkongAll();
        createOneLineLayout("jsesf","前三位：请至少选择1个",1,11,true,function(){
            jsesf_calcNotes();
        });
    }else if(val == 'jsesf15'){
        $("#jsesf_random").show();
        jsesf_sntuo = 0;
        jsesf_playType = 3;
        jsesf_playMethod = 15;
        jsesf_qingkongAll();
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("jsesf",tips,1,11,true,function(){
            jsesf_calcNotes();
        });
    }else if(parseInt(temp) < 27 && parseInt(temp) > 18){
        $("#jsesf_random").show();
        jsesf_sntuo = 0;
        jsesf_playType = 6;
        jsesf_playMethod = parseInt(temp);
        createOneLineLayout("jsesf","请至少选择"+(jsesf_playMethod - 18)+"个",1,11,true,function(){
            jsesf_calcNotes();
        });
    }else if(parseInt(temp) < 35 && parseInt(temp) > 26){
        $("#jsesf_random").hide();
        jsesf_sntuo = 3;
        jsesf_playType = 7;
        jsesf_playMethod = parseInt(temp);
        $("#jsesf_ballView").empty();
        jsesf_qingkongAll();
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
        var tips = "<p>格式说明<br/>"+name[jsesf_playMethod - 27]+":"+ (array[jsesf_playMethod - 27]) +"<br/>1)每注必须是"+(jsesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jsesf",tips);
    }else if(parseInt(temp) < 42 && parseInt(temp) > 34){
        $("#jsesf_random").hide();
        jsesf_sntuo = 1;
        jsesf_playType = 8;
        jsesf_playMethod = parseInt(temp);
        createDanTuoLayout("jsesf",jsesf_playMethod-34,1,11,true,function(){
            jsesf_calcNotes();
        });
    }

    if(jsesfScroll){
        jsesfScroll.refresh();
        jsesfScroll.scrollTo(0,0,1);
    }
    
    $("#jsesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
    
    initFooterData("jsesf",temp);
    hideRandomWhenLi("jsesf",jsesf_sntuo,jsesf_playMethod);
    jsesf_calcNotes();
}

/**
 * [jsesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function jsesf_initFooterButton(){
    if (jsesf_playType == 6 || jsesf_playType == 2 || jsesf_playType == 4) {
        if (LotteryStorage["jsesf"]["line1"].length > 0) {
            $("#jsesf_qingkong").css("opacity",1.0);
        }else{
            $("#jsesf_qingkong").css("opacity",0.4);
        }
    }else if(jsesf_playType == 8){
        if (LotteryStorage["jsesf"]["line1"].length > 0 || LotteryStorage["jsesf"]["line2"].length > 0) {
            $("#jsesf_qingkong").css("opacity",1.0);
        }else{
            $("#jsesf_qingkong").css("opacity",0.4);
        }
    }else if(jsesf_playType == 3){
        if(LotteryStorage["jsesf"]["line1"].length > 0
            || LotteryStorage["jsesf"]["line2"].length > 0
            || LotteryStorage["jsesf"]["line3"].length > 0){
            $("#jsesf_qingkong").css("opacity",1.0);
        }else{
            $("#jsesf_qingkong").css("opacity",0.4);
        }
    }else if(jsesf_playType == 1){
        if (jsesf_playMethod == 7 || jsesf_playMethod == 10 || jsesf_playMethod == 13) {
            if(LotteryStorage["jsesf"]["line1"].length > 0
                || LotteryStorage["jsesf"]["line2"].length > 0){
                $("#jsesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsesf_qingkong").css("opacity",0.4);
            }
        }else if(jsesf_playMethod == 9 || jsesf_playMethod == 11){
            if(LotteryStorage["jsesf"]["line1"].length > 0){
                $("#jsesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsesf_qingkong").css("opacity",0.4);
            }
        }else if(jsesf_playMethod == 8 || jsesf_playMethod == 12){
            $("#jsesf_qingkong").css("opacity",0);
        }
    }else if(jsesf_playType == 0){
        if (jsesf_playMethod == 0) {
            if(LotteryStorage["jsesf"]["line1"].length > 0
                || LotteryStorage["jsesf"]["line2"].length > 0
                || LotteryStorage["jsesf"]["line3"].length > 0){
                $("#jsesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsesf_qingkong").css("opacity",0.4);
            }
        }else if(jsesf_playMethod == 3 || jsesf_playMethod == 6){
            if(LotteryStorage["jsesf"]["line1"].length > 0
                || LotteryStorage["jsesf"]["line2"].length > 0){
                $("#jsesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsesf_qingkong").css("opacity",0.4);
            }
        }else if(jsesf_playMethod == 2 || jsesf_playMethod == 4){
            if(LotteryStorage["jsesf"]["line1"].length > 0){
                $("#jsesf_qingkong").css("opacity",1.0);
            }else{
                $("#jsesf_qingkong").css("opacity",0.4);
            }
        }else if(jsesf_playMethod == 1 || jsesf_playMethod == 5){
            $("#jsesf_qingkong").css("opacity",0);
        }
    }else{
        $("#jsesf_qingkong").css("opacity",0);
    }

    if($("#jsesf_qingkong").css("opacity") == "0"){
        $("#jsesf_qingkong").css("display","none");
    }else{
        $("#jsesf_qingkong").css("display","block");
    }

    if($('#jsesf_zhushu').html() > 0){
        $("#jsesf_queding").css("opacity",1.0);
    }else{
        $("#jsesf_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  jsesf_qingkongAll(){
    $("#jsesf_ballView span").removeClass('redBalls_active');
    LotteryStorage["jsesf"]["line1"] = [];
    LotteryStorage["jsesf"]["line2"] = [];
    LotteryStorage["jsesf"]["line3"] = [];

    localStorageUtils.removeParam("jsesf_line1");
    localStorageUtils.removeParam("jsesf_line2");
    localStorageUtils.removeParam("jsesf_line3");

    $('#jsesf_zhushu').text(0);
    $('#jsesf_money').text(0);
    clearAwardWin("jsesf");
    jsesf_initFooterButton();
}

/**
 * [jsesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function jsesf_calcNotes(){
	$('#jsesf_modeId').blur();
	$('#jsesf_fandian').blur();
	
    var notes = 0;

    if (jsesf_playType == 6) {
        notes = mathUtil.getCCombination(LotteryStorage["jsesf"]["line1"].length,jsesf_playMethod - 18);
    }else if(jsesf_playType == 8){
        if(LotteryStorage["jsesf"]["line1"].length == 0 || LotteryStorage["jsesf"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["jsesf"]["line2"].length,(jsesf_playMethod - 33)-LotteryStorage["jsesf"]["line1"].length);
        }
    }else if(jsesf_playType == 2 || jsesf_playType == 4){
        notes = LotteryStorage["jsesf"]["line1"].length;
    }else if(jsesf_playType == 1){
        if (jsesf_playMethod == 7){
            for (var i = 0; i < LotteryStorage["jsesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["jsesf"]["line2"].length; j++) {
                    if(LotteryStorage["jsesf"]["line1"][i] != LotteryStorage["jsesf"]["line2"][j]){
                        notes++ ;
                    }
                }
            }
        }else if(jsesf_playMethod == 9){
            notes = mathUtil.getACombination(LotteryStorage["jsesf"]["line1"].length,2);
        }else if(jsesf_playMethod == 10){
            if(LotteryStorage["jsesf"]["line1"].length == 0 || LotteryStorage["jsesf"]["line2"].length == 0){
                notes = 0;
            }else{
                notes = 2 * mathUtil.getCCombination(LotteryStorage["jsesf"]["line2"].length,1);
            }
        }else if(jsesf_playMethod == 11){
            notes = mathUtil.getCCombination(LotteryStorage["jsesf"]["line1"].length,2);
        }else if(jsesf_playMethod == 13){
            if(LotteryStorage["jsesf"]["line1"].length == 0 || LotteryStorage["jsesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["jsesf"]["line2"].length,1);
            }
        }else{  //单式
            notes = jsesfValidateData('onblur');
        }
    }else if(jsesf_playType == 0){
        if (jsesf_playMethod == 0){
            for (var i = 0; i < LotteryStorage["jsesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["jsesf"]["line2"].length; j++) {
                    for (var k = 0; k < LotteryStorage["jsesf"]["line3"].length; k++) {
                        if(LotteryStorage["jsesf"]["line1"][i] != LotteryStorage["jsesf"]["line2"][j]
                            &&LotteryStorage["jsesf"]["line1"][i] != LotteryStorage["jsesf"]["line3"][k]
                            && LotteryStorage["jsesf"]["line2"][j] != LotteryStorage["jsesf"]["line3"][k]){
                            notes++ ;
                        }
                    }
                }
            }
        }else if(jsesf_playMethod == 2){
            notes = mathUtil.getACombination(LotteryStorage["jsesf"]["line1"].length,3);
        }else if(jsesf_playMethod == 3){
            if(LotteryStorage["jsesf"]["line1"].length == 0 || LotteryStorage["jsesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = 6 * mathUtil.getCCombination(LotteryStorage["jsesf"]["line2"].length,3 - LotteryStorage["jsesf"]["line1"].length);
            }
        }else if(jsesf_playMethod == 4){
            notes = mathUtil.getCCombination(LotteryStorage["jsesf"]["line1"].length,3);
        }else if(jsesf_playMethod == 6){
            if(LotteryStorage["jsesf"]["line1"].length == 0 || LotteryStorage["jsesf"]["line2"].length == 0
                || LotteryStorage["jsesf"]["line1"].length + LotteryStorage["jsesf"]["line2"].length < 3){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["jsesf"]["line2"].length,3 - LotteryStorage["jsesf"]["line1"].length);
            }
        }else{  //单式
            notes = jsesfValidateData('onblur');
        }
    }else if(jsesf_playType == 3){
        notes = LotteryStorage["jsesf"]["line1"].length + LotteryStorage["jsesf"]["line2"].length + LotteryStorage["jsesf"]["line3"].length;
    }else{  //单式
        notes = jsesfValidateData('onblur');
    }

    hideRandomWhenLi('jsesf',jsesf_sntuo,jsesf_playMethod);

    //验证是否为空
    if( $("#jsesf_beiNum").val() =="" || parseInt($("#jsesf_beiNum").val()) == 0){
        $("#jsesf_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#jsesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#jsesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#jsesf_zhushu').text(notes);
        if($("#jsesf_modeId").val() == "8"){
            $('#jsesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsesf_beiNum").val()),0.002));
        }else if ($("#jsesf_modeId").val() == "2"){
            $('#jsesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsesf_beiNum").val()),0.2));
        }else if ($("#jsesf_modeId").val() == "1"){
            $('#jsesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsesf_beiNum").val()),0.02));
        }else{
            $('#jsesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsesf_beiNum").val()),2));
        }
    } else {
        $('#jsesf_zhushu').text(0);
        $('#jsesf_money').text(0);
    }
    jsesf_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('jsesf',jsesf_playMethod);
}

/**
 * [jsesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function jsesf_randomOne(){
    jsesf_qingkongAll();
    if(jsesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(jsesf_playMethod - 18,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jsesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jsesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsesf_playMethod == 14){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jsesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jsesf"]["line1"], function(k, v){
            $("#" + "jsesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jsesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        LotteryStorage["jsesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["jsesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

        $.each(LotteryStorage["jsesf"]["line1"], function(k, v){
            $("#" + "jsesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jsesf"]["line2"], function(k, v){
            $("#" + "jsesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jsesf_playMethod == 9 || jsesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jsesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jsesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        LotteryStorage["jsesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["jsesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
        LotteryStorage["jsesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

        $.each(LotteryStorage["jsesf"]["line1"], function(k, v){
            $("#" + "jsesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jsesf"]["line2"], function(k, v){
            $("#" + "jsesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jsesf"]["line3"], function(k, v){
            $("#" + "jsesf_line3" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jsesf_playMethod == 2 || jsesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jsesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jsesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jsesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jsesf"]["line1"], function(k, v){
            $("#" + "jsesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jsesf_playMethod == 15){
        var line = mathUtil.getRandomNum(1,4);
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jsesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jsesf"]["line"+line], function(k, v){
            $("#" + "jsesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
        });
    }
    jsesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function jsesf_checkOutRandom(playMethod){
    var obj = new Object();
    if(jsesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(jsesf_playMethod - 18,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jsesf_playMethod == 14 || jsesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        obj.nums = number < 10 ? "0"+number : number;
        obj.notes = 1;
    }else if(jsesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(jsesf_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(jsesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jsesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(jsesf_playMethod == 2){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 6;
    }else if(jsesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jsesf_playMethod == 15){
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
    obj.sntuo = jsesf_sntuo;
    obj.multiple = 1;
    obj.rebates = jsesf_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('jsesf',jsesf_playMethod,obj);  //机选奖金计算
    obj.award = $('#jsesf_minAward').html();     //奖金
    obj.maxAward = $('#jsesf_maxAward').html();  //多级奖金
    return obj;
}


/**
 * [jsesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function jsesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#jsesf_queding").bind('click', function(event) {
		jsesf_rebate = $("#jsesf_fandian option:last").val();
		if(parseInt($('#jsesf_zhushu').html()) <= 0 || Number($("#jsesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		jsesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#jsesf_modeId').val()) == 8){
			if (Number($('#jsesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('jsesf',jsesf_playMethod);

		submitParams.lotteryType = "jsesf";
		var playType = LotteryInfo.getPlayName("esf",jsesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",jsesf_playMethod);
		submitParams.playTypeIndex = jsesf_playType;
		submitParams.playMethodIndex = jsesf_playMethod;
		var selectedBalls = [];
		if (jsesf_playType == 6 || jsesf_playType == 2 || jsesf_playType == 4) {
			$("#jsesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(jsesf_playType == 8){
			if(parseInt($('#jsesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#jsesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(jsesf_playType == 1 || jsesf_playType == 0){
			if(jsesf_playMethod == 7 || jsesf_playMethod == 0){
				$("#jsesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(jsesf_playMethod == 9 || jsesf_playMethod == 11 || jsesf_playMethod == 2 || jsesf_playMethod == 4){
				$("#jsesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(jsesf_playMethod == 10 || jsesf_playMethod == 13 || jsesf_playMethod == 3 || jsesf_playMethod == 6){
				if(parseInt($('#jsesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#jsesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(jsesf_playMethod == 1 || jsesf_playMethod == 8){//直选单式
				//去错误号
				jsesfValidateData("submit");
				var arr = $("#jsesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(jsesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(jsesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(jsesf_playMethod == 5 || jsesf_playMethod == 12){//组选单式
				//去错误号
				jsesfValidateData("submit");
				var arr = $("#jsesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(jsesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(jsesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(jsesf_playMethod == 15) {
			$("#jsesf_ballView div.ballView").each(function(){
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
			jsesfValidateData("submit");
			var arr = $("#jsesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(jsesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(jsesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(jsesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(jsesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(jsesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(jsesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(jsesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#jsesf_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#jsesf_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#jsesf_fandian").val());
		submitParams.notes = $('#jsesf_zhushu').html();
		submitParams.sntuo = jsesf_sntuo;
		submitParams.multiple = $('#jsesf_beiNum').val();  //requirement
		submitParams.rebates = $('#jsesf_fandian').val();  //requirement
		submitParams.playMode = $('#jsesf_modeId').val();  //requirement
		submitParams.money = $('#jsesf_money').html();  //requirement
		submitParams.award = $('#jsesf_minAward').html();  //奖金
		submitParams.maxAward = $('#jsesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#jsesf_ballView").empty();
		jsesf_qingkongAll();
	});
}

function jsesfValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#jsesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
    var	result,
        content = {};
    if(jsesf_playMethod == 1){  //前三直选单式
        content.str = str;
        content.weishu = 8;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if( jsesf_playMethod == 8){  //前二直选单式
        content.str = str;
        content.weishu = 5;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    } else if(jsesf_playMethod == 5){  //前三组选单式
        content.str = str;
        content.weishu = 8;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if(jsesf_playMethod == 12){  //前二组选单式
        content.str = str;
        content.weishu = 5;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if (jsesf_playMethod > 26 && jsesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(jsesf_playMethod - 26);
        content.str = str;
        content.weishu = 3*weiNum-1;
        content.renXuan = true;
        content.select = true;
        result = handleSingleStr_deleteErr(content,type);
    }

    $('#jsesf_delRepeat').off('click');
    $('#jsesf_delRepeat').on('click',function () {
        content.str = $('#jsesf_single').val() ? $('#jsesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        var array = rptResult.num || [];
        notes = rptResult.length;
        jsesfShowFooter(true,notes);
        $("#jsesf_single").val(array.join(","));
    });

    $("#jsesf_single").val(result.num.join(","));
    var notes = result.length;
    jsesfShowFooter(true,notes);
    return notes;
}
function jsesfShowFooter(isValid,notes){
    $('#jsesf_zhushu').text(notes);
    if($("#jsesf_modeId").val() == "8"){
        $('#jsesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsesf_beiNum").val()),0.002));
    }else if ($("#jsesf_modeId").val() == "2"){
        $('#jsesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsesf_beiNum").val()),0.2));
    }else if ($("#jsesf_modeId").val() == "1"){
        $('#jsesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsesf_beiNum").val()),0.02));
    }else{
        $('#jsesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    jsesf_initFooterButton();
    calcAwardWin('jsesf',jsesf_playMethod);  //计算奖金和盈利
}