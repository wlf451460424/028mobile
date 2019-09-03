var sdesf_playType = 1;
var sdesf_playMethod = 7;
var sdesf_sntuo = 0;
var sdesf_rebate;
var sdesfScroll;

//进入这个页面时调用
function sdesfPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("sdesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("sdesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function sdesfPageUnloadedPanel(){
    $("#sdesfPage_back").off('click');
    $("#sdesf_queding").off('click');
    $("#sdesf_ballView").empty();
    $("#sdesfSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="sdesfPlaySelect"></select>');
    $("#sdesfSelect").append($select);
}

//入口函数
function sdesf_init(){
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
    $("#sdesf_title").html(LotteryInfo.getLotteryNameByTag("sdesf"));
    for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
    	if(i == 5)continue;
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
                var name = LotteryInfo.getMethodName("esf",j);
                if(i == sdesf_playType && j == sdesf_playMethod){
                    $play.append('<option value="sdesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="sdesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(sdesf_playMethod,onShowArray)>-1 ){
						sdesf_playType = i;
						sdesf_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#sdesfPlaySelect").append($play);
		}
    }
    
    if($("#sdesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("sdesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:sdesfChangeItem
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

    GetLotteryInfo("sdesf",function (){
        sdesfChangeItem("sdesf"+sdesf_playMethod);
    });

    //添加滑动条
    if(!sdesfScroll){
        sdesfScroll = new IScroll('#sdesfContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("sdesf",LotteryInfo.getLotteryIdByTag("sdesf"));

    //获取上一期开奖
    queryLastPrize("sdesf");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('sdesf');

    //机选选号
    $("#sdesf_random").on('click', function(event) {
        sdesf_randomOne();
    });

    //返回
    $("#sdesfPage_back").on('click', function(event) {
        // sdesf_playType = 0;
        // sdesf_playMethod = 0;
        $("#sdesf_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        sdesf_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#sdesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",sdesf_playMethod));
	//玩法说明
	$("#sdesf_paly_shuoming").off('click');
	$("#sdesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#sdesf_shuoming").text());
	});

    qingKong("sdesf");//清空
    sdesf_submitData();
}

function sdesfResetPlayType(){
    sdesf_playType = 0;
    sdesf_playMethod = 0;
}

function sdesfChangeItem(val){
    sdesf_qingkongAll();

    var temp = val.substring("sdesf".length,val.length);

    if(val == 'sdesf1'){
        $("#sdesf_random").hide();
        sdesf_sntuo = 3;
        sdesf_playType = 0;
        sdesf_playMethod = 1;
        $("#sdesf_ballView").empty();
        sdesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("sdesf",tips);
    }else if(val == 'sdesf5'){
        $("#sdesf_random").hide();
        sdesf_sntuo = 3;
        sdesf_playType = 0;
        sdesf_playMethod = 5;
        $("#sdesf_ballView").empty();
        sdesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("sdesf",tips);
    }else if(val == 'sdesf8'){
        $("#sdesf_random").hide();
        sdesf_sntuo = 3;
        sdesf_playType = 1;
        sdesf_playMethod = 8;
        $("#sdesf_ballView").empty();
        sdesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("sdesf",tips);
    }else if(val == 'sdesf12'){
        $("#sdesf_random").hide();
        sdesf_sntuo = 3;
        sdesf_playType = 1;
        sdesf_playMethod = 12;
        $("#sdesf_ballView").empty();
        sdesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("sdesf",tips);
    }else if(parseInt(temp) == 14){
        $("#sdesf_random").show();
        sdesf_sntuo = 0;
        sdesf_playType = 2;
        sdesf_playMethod = parseInt(temp);
        createOneLineLayout("sdesf","请至少选择1个",1,11,true,function(){
            sdesf_calcNotes();
        });
    }else if(val == 'sdesf7'){
        $("#sdesf_random").show();
        sdesf_sntuo = 0;
        sdesf_playType = 1;
        sdesf_playMethod = 7;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tips = [tip1,tip2];
        createTwoLineLayout("sdesf",tips,1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf9'){
        $("#sdesf_random").show();
        sdesf_sntuo = 2;
        sdesf_playType = 1;
        sdesf_playMethod = 9;
        createOneLineLayout("sdesf","请至少选择2个",1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf10'){
        $("#sdesf_random").hide();
        sdesf_sntuo = 1;
        sdesf_playType = 1;
        sdesf_playMethod = 10;
        createDanTuoSpecLayout("sdesf",1,1,10,1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf11'){
        $("#sdesf_random").show();
        sdesf_sntuo = 0;
        sdesf_playType = 1;
        sdesf_playMethod = 11;
        createOneLineLayout("sdesf","请至少选择2个",1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf13'){
        $("#sdesf_random").hide();
        sdesf_sntuo = 1;
        sdesf_playType = 1;
        sdesf_playMethod = 13;
        createDanTuoLayout("sdesf",1,1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf0'){
        $("#sdesf_random").show();
        sdesf_sntuo = 0;
        sdesf_playType = 0;
        sdesf_playMethod = 0;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("sdesf",tips,1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf2'){
        $("#sdesf_random").show();
        sdesf_sntuo = 2;
        sdesf_playType = 0;
        sdesf_playMethod = 2;
        createOneLineLayout("sdesf","请至少选择3个",1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf3'){
        $("#sdesf_random").hide();
        sdesf_sntuo = 1;
        sdesf_playType = 0;
        sdesf_playMethod = 3;
        createDanTuoSpecLayout("sdesf",2,1,10,1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf4'){
        $("#sdesf_random").show();
        sdesf_sntuo = 0;
        sdesf_playType = 0;
        sdesf_playMethod = 4;
        createOneLineLayout("sdesf","请至少选择3个",1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf6'){
        $("#sdesf_random").hide();
        sdesf_sntuo = 1;
        sdesf_playType = 0;
        sdesf_playMethod = 6;
        createDanTuoLayout("sdesf",2,1,11,true,function(){
            sdesf_calcNotes();
        });
        sdesf_qingkongAll();
    }else if(val == 'sdesf16'){
        $("#sdesf_random").show();
        sdesf_sntuo = 0;
        sdesf_playType = 4;
        sdesf_playMethod = 16;
        sdesf_qingkongAll();
        createOneLineLayout("sdesf","前三位：请至少选择1个",1,11,true,function(){
            sdesf_calcNotes();
        });
    }else if(val == 'sdesf15'){
        $("#sdesf_random").show();
        sdesf_sntuo = 0;
        sdesf_playType = 3;
        sdesf_playMethod = 15;
        sdesf_qingkongAll();
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("sdesf",tips,1,11,true,function(){
            sdesf_calcNotes();
        });
    }else if(parseInt(temp) < 27 && parseInt(temp) > 18){
        $("#sdesf_random").show();
        sdesf_sntuo = 0;
        sdesf_playType = 6;
        sdesf_playMethod = parseInt(temp);
        createOneLineLayout("sdesf","请至少选择"+(sdesf_playMethod - 18)+"个",1,11,true,function(){
            sdesf_calcNotes();
        });
    }else if(parseInt(temp) < 35 && parseInt(temp) > 26){
        $("#sdesf_random").hide();
        sdesf_sntuo = 3;
        sdesf_playType = 7;
        sdesf_playMethod = parseInt(temp);
        $("#sdesf_ballView").empty();
        sdesf_qingkongAll();
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
        var tips = "<p>格式说明<br/>"+name[sdesf_playMethod - 27]+":"+ (array[sdesf_playMethod - 27]) +"<br/>1)每注必须是"+(sdesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("sdesf",tips);
    }else if(parseInt(temp) < 42 && parseInt(temp) > 34){
        $("#sdesf_random").hide();
        sdesf_sntuo = 1;
        sdesf_playType = 8;
        sdesf_playMethod = parseInt(temp);
        createDanTuoLayout("sdesf",sdesf_playMethod-34,1,11,true,function(){
            sdesf_calcNotes();
        });
    }

    if(sdesfScroll){
        sdesfScroll.refresh();
        sdesfScroll.scrollTo(0,0,1);
    }
    
    $("#sdesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
    
    initFooterData("sdesf",temp);
    hideRandomWhenLi("sdesf",sdesf_sntuo,sdesf_playMethod);
    sdesf_calcNotes();
}

/**
 * [sdesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function sdesf_initFooterButton(){
    if (sdesf_playType == 6 || sdesf_playType == 2 || sdesf_playType == 4) {
        if (LotteryStorage["sdesf"]["line1"].length > 0) {
            $("#sdesf_qingkong").css("opacity",1.0);
        }else{
            $("#sdesf_qingkong").css("opacity",0.4);
        }
    }else if(sdesf_playType == 8){
        if (LotteryStorage["sdesf"]["line1"].length > 0 || LotteryStorage["sdesf"]["line2"].length > 0) {
            $("#sdesf_qingkong").css("opacity",1.0);
        }else{
            $("#sdesf_qingkong").css("opacity",0.4);
        }
    }else if(sdesf_playType == 3){
        if(LotteryStorage["sdesf"]["line1"].length > 0
            || LotteryStorage["sdesf"]["line2"].length > 0
            || LotteryStorage["sdesf"]["line3"].length > 0){
            $("#sdesf_qingkong").css("opacity",1.0);
        }else{
            $("#sdesf_qingkong").css("opacity",0.4);
        }
    }else if(sdesf_playType == 1){
        if (sdesf_playMethod == 7 || sdesf_playMethod == 10 || sdesf_playMethod == 13) {
            if(LotteryStorage["sdesf"]["line1"].length > 0
                || LotteryStorage["sdesf"]["line2"].length > 0){
                $("#sdesf_qingkong").css("opacity",1.0);
            }else{
                $("#sdesf_qingkong").css("opacity",0.4);
            }
        }else if(sdesf_playMethod == 9 || sdesf_playMethod == 11){
            if(LotteryStorage["sdesf"]["line1"].length > 0){
                $("#sdesf_qingkong").css("opacity",1.0);
            }else{
                $("#sdesf_qingkong").css("opacity",0.4);
            }
        }else if(sdesf_playMethod == 8 || sdesf_playMethod == 12){
            $("#sdesf_qingkong").css("opacity",0);
        }
    }else if(sdesf_playType == 0){
        if (sdesf_playMethod == 0) {
            if(LotteryStorage["sdesf"]["line1"].length > 0
                || LotteryStorage["sdesf"]["line2"].length > 0
                || LotteryStorage["sdesf"]["line3"].length > 0){
                $("#sdesf_qingkong").css("opacity",1.0);
            }else{
                $("#sdesf_qingkong").css("opacity",0.4);
            }
        }else if(sdesf_playMethod == 3 || sdesf_playMethod == 6){
            if(LotteryStorage["sdesf"]["line1"].length > 0
                || LotteryStorage["sdesf"]["line2"].length > 0){
                $("#sdesf_qingkong").css("opacity",1.0);
            }else{
                $("#sdesf_qingkong").css("opacity",0.4);
            }
        }else if(sdesf_playMethod == 2 || sdesf_playMethod == 4){
            if(LotteryStorage["sdesf"]["line1"].length > 0){
                $("#sdesf_qingkong").css("opacity",1.0);
            }else{
                $("#sdesf_qingkong").css("opacity",0.4);
            }
        }else if(sdesf_playMethod == 1 || sdesf_playMethod == 5){
            $("#sdesf_qingkong").css("opacity",0);
        }
    }else{
        $("#sdesf_qingkong").css("opacity",0);
    }

    if($("#sdesf_qingkong").css("opacity") == "0"){
        $("#sdesf_qingkong").css("display","none");
    }else{
        $("#sdesf_qingkong").css("display","block");
    }

    if($('#sdesf_zhushu').html() > 0){
        $("#sdesf_queding").css("opacity",1.0);
    }else{
        $("#sdesf_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  sdesf_qingkongAll(){
    $("#sdesf_ballView span").removeClass('redBalls_active');
    LotteryStorage["sdesf"]["line1"] = [];
    LotteryStorage["sdesf"]["line2"] = [];
    LotteryStorage["sdesf"]["line3"] = [];

    localStorageUtils.removeParam("sdesf_line1");
    localStorageUtils.removeParam("sdesf_line2");
    localStorageUtils.removeParam("sdesf_line3");

    $('#sdesf_zhushu').text(0);
    $('#sdesf_money').text(0);
    clearAwardWin("sdesf");
    sdesf_initFooterButton();
}

/**
 * [sdesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function sdesf_calcNotes(){
	$('#sdesf_modeId').blur();
	$('#sdesf_fandian').blur();
	
    var notes = 0;

    if (sdesf_playType == 6) {
        notes = mathUtil.getCCombination(LotteryStorage["sdesf"]["line1"].length,sdesf_playMethod - 18);
    }else if(sdesf_playType == 8){
        if(LotteryStorage["sdesf"]["line1"].length == 0 || LotteryStorage["sdesf"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["sdesf"]["line2"].length,(sdesf_playMethod - 33)-LotteryStorage["sdesf"]["line1"].length);
        }
    }else if(sdesf_playType == 2 || sdesf_playType == 4){
        notes = LotteryStorage["sdesf"]["line1"].length;
    }else if(sdesf_playType == 1){
        if (sdesf_playMethod == 7){
            for (var i = 0; i < LotteryStorage["sdesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["sdesf"]["line2"].length; j++) {
                    if(LotteryStorage["sdesf"]["line1"][i] != LotteryStorage["sdesf"]["line2"][j]){
                        notes++ ;
                    }
                }
            }
        }else if(sdesf_playMethod == 9){
            notes = mathUtil.getACombination(LotteryStorage["sdesf"]["line1"].length,2);
        }else if(sdesf_playMethod == 10){
            if(LotteryStorage["sdesf"]["line1"].length == 0 || LotteryStorage["sdesf"]["line2"].length == 0){
                notes = 0;
            }else{
                notes = 2 * mathUtil.getCCombination(LotteryStorage["sdesf"]["line2"].length,1);
            }
        }else if(sdesf_playMethod == 11){
            notes = mathUtil.getCCombination(LotteryStorage["sdesf"]["line1"].length,2);
        }else if(sdesf_playMethod == 13){
            if(LotteryStorage["sdesf"]["line1"].length == 0 || LotteryStorage["sdesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["sdesf"]["line2"].length,1);
            }
        }else{  //单式
            notes = sdesfValidateData('onblur');
        }
    }else if(sdesf_playType == 0){
        if (sdesf_playMethod == 0){
            for (var i = 0; i < LotteryStorage["sdesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["sdesf"]["line2"].length; j++) {
                    for (var k = 0; k < LotteryStorage["sdesf"]["line3"].length; k++) {
                        if(LotteryStorage["sdesf"]["line1"][i] != LotteryStorage["sdesf"]["line2"][j]
                            &&LotteryStorage["sdesf"]["line1"][i] != LotteryStorage["sdesf"]["line3"][k]
                            && LotteryStorage["sdesf"]["line2"][j] != LotteryStorage["sdesf"]["line3"][k]){
                            notes++ ;
                        }
                    }
                }
            }
        }else if(sdesf_playMethod == 2){
            notes = mathUtil.getACombination(LotteryStorage["sdesf"]["line1"].length,3);
        }else if(sdesf_playMethod == 3){
            if(LotteryStorage["sdesf"]["line1"].length == 0 || LotteryStorage["sdesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = 6 * mathUtil.getCCombination(LotteryStorage["sdesf"]["line2"].length,3 - LotteryStorage["sdesf"]["line1"].length);
            }
        }else if(sdesf_playMethod == 4){
            notes = mathUtil.getCCombination(LotteryStorage["sdesf"]["line1"].length,3);
        }else if(sdesf_playMethod == 6){
            if(LotteryStorage["sdesf"]["line1"].length == 0 || LotteryStorage["sdesf"]["line2"].length == 0
                || LotteryStorage["sdesf"]["line1"].length + LotteryStorage["sdesf"]["line2"].length < 3){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["sdesf"]["line2"].length,3 - LotteryStorage["sdesf"]["line1"].length);
            }
        }else{  //单式
            notes = sdesfValidateData('onblur');
        }
    }else if(sdesf_playType == 3){
        notes = LotteryStorage["sdesf"]["line1"].length + LotteryStorage["sdesf"]["line2"].length + LotteryStorage["sdesf"]["line3"].length;
    }else{  //单式
        notes = sdesfValidateData('onblur');
    }

    hideRandomWhenLi('sdesf',sdesf_sntuo,sdesf_playMethod);

    //验证是否为空
    if( $("#sdesf_beiNum").val() =="" || parseInt($("#sdesf_beiNum").val()) == 0){
        $("#sdesf_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#sdesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#sdesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#sdesf_zhushu').text(notes);
        if($("#sdesf_modeId").val() == "8"){
            $('#sdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#sdesf_beiNum").val()),0.002));
        }else if ($("#sdesf_modeId").val() == "2"){
            $('#sdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#sdesf_beiNum").val()),0.2));
        }else if ($("#sdesf_modeId").val() == "1"){
            $('#sdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#sdesf_beiNum").val()),0.02));
        }else{
            $('#sdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#sdesf_beiNum").val()),2));
        }
    } else {
        $('#sdesf_zhushu').text(0);
        $('#sdesf_money').text(0);
    }
    sdesf_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('sdesf',sdesf_playMethod);
}

/**
 * [sdesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function sdesf_randomOne(){
    sdesf_qingkongAll();
    if(sdesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(sdesf_playMethod - 18,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["sdesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "sdesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(sdesf_playMethod == 14){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["sdesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["sdesf"]["line1"], function(k, v){
            $("#" + "sdesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(sdesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        LotteryStorage["sdesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["sdesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

        $.each(LotteryStorage["sdesf"]["line1"], function(k, v){
            $("#" + "sdesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["sdesf"]["line2"], function(k, v){
            $("#" + "sdesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(sdesf_playMethod == 9 || sdesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["sdesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "sdesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(sdesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        LotteryStorage["sdesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["sdesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
        LotteryStorage["sdesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

        $.each(LotteryStorage["sdesf"]["line1"], function(k, v){
            $("#" + "sdesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["sdesf"]["line2"], function(k, v){
            $("#" + "sdesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["sdesf"]["line3"], function(k, v){
            $("#" + "sdesf_line3" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(sdesf_playMethod == 2 || sdesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["sdesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "sdesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(sdesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["sdesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["sdesf"]["line1"], function(k, v){
            $("#" + "sdesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(sdesf_playMethod == 15){
        var line = mathUtil.getRandomNum(1,4);
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["sdesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["sdesf"]["line"+line], function(k, v){
            $("#" + "sdesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
        });
    }
    sdesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function sdesf_checkOutRandom(playMethod){
    var obj = new Object();
    if(sdesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(sdesf_playMethod - 18,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(sdesf_playMethod == 14 || sdesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        obj.nums = number < 10 ? "0"+number : number;
        obj.notes = 1;
    }else if(sdesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(sdesf_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(sdesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(sdesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(sdesf_playMethod == 2){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 6;
    }else if(sdesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(sdesf_playMethod == 15){
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
    obj.sntuo = sdesf_sntuo;
    obj.multiple = 1;
    obj.rebates = sdesf_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('sdesf',sdesf_playMethod,obj);  //机选奖金计算
    obj.award = $('#sdesf_minAward').html();     //奖金
    obj.maxAward = $('#sdesf_maxAward').html();  //多级奖金
    return obj;
}


/**
 * [sdesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function sdesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#sdesf_queding").bind('click', function(event) {
		sdesf_rebate = $("#sdesf_fandian option:last").val();
		if(parseInt($('#sdesf_zhushu').html()) <= 0 || Number($("#sdesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		sdesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#sdesf_modeId').val()) == 8){
			if (Number($('#sdesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('sdesf',sdesf_playMethod);

		submitParams.lotteryType = "sdesf";
		var playType = LotteryInfo.getPlayName("esf",sdesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",sdesf_playMethod);
		submitParams.playTypeIndex = sdesf_playType;
		submitParams.playMethodIndex = sdesf_playMethod;
		var selectedBalls = [];
		if (sdesf_playType == 6 || sdesf_playType == 2 || sdesf_playType == 4) {
			$("#sdesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(sdesf_playType == 8){
			if(parseInt($('#sdesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#sdesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(sdesf_playType == 1 || sdesf_playType == 0){
			if(sdesf_playMethod == 7 || sdesf_playMethod == 0){
				$("#sdesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(sdesf_playMethod == 9 || sdesf_playMethod == 11 || sdesf_playMethod == 2 || sdesf_playMethod == 4){
				$("#sdesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(sdesf_playMethod == 10 || sdesf_playMethod == 13 || sdesf_playMethod == 3 || sdesf_playMethod == 6){
				if(parseInt($('#sdesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#sdesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(sdesf_playMethod == 1 || sdesf_playMethod == 8){//直选单式
				//去错误号
				sdesfValidateData("submit");
				var arr = $("#sdesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(sdesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(sdesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(sdesf_playMethod == 5 || sdesf_playMethod == 12){//组选单式
				//去错误号
				sdesfValidateData("submit");
				var arr = $("#sdesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(sdesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(sdesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(sdesf_playMethod == 15) {
			$("#sdesf_ballView div.ballView").each(function(){
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
			sdesfValidateData("submit");
			var arr = $("#sdesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(sdesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(sdesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(sdesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(sdesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(sdesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(sdesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(sdesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#sdesf_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#sdesf_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#sdesf_fandian").val());
		submitParams.notes = $('#sdesf_zhushu').html();
		submitParams.sntuo = sdesf_sntuo;
		submitParams.multiple = $('#sdesf_beiNum').val();  //requirement
		submitParams.rebates = $('#sdesf_fandian').val();  //requirement
		submitParams.playMode = $('#sdesf_modeId').val();  //requirement
		submitParams.money = $('#sdesf_money').html();  //requirement
		submitParams.award = $('#sdesf_minAward').html();  //奖金
		submitParams.maxAward = $('#sdesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#sdesf_ballView").empty();
		sdesf_qingkongAll();
	});
}

function sdesfValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#sdesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
    var	result,
        content = {};
    if(sdesf_playMethod == 1){  //前三直选单式
        content.str = str;
        content.weishu = 8;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if( sdesf_playMethod == 8){  //前二直选单式
        content.str = str;
        content.weishu = 5;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    } else if(sdesf_playMethod == 5){  //前三组选单式
        content.str = str;
        content.weishu = 8;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if(sdesf_playMethod == 12){  //前二组选单式
        content.str = str;
        content.weishu = 5;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if (sdesf_playMethod > 26 && sdesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(sdesf_playMethod - 26);
        content.str = str;
        content.weishu = 3*weiNum-1;
        content.renXuan = true;
        content.select = true;
        result = handleSingleStr_deleteErr(content,type);
    }

    $('#sdesf_delRepeat').off('click');
    $('#sdesf_delRepeat').on('click',function () {
        content.str = $('#sdesf_single').val() ? $('#sdesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        var array = rptResult.num || [];
        notes = rptResult.length;
        sdesfShowFooter(true,notes);
        $("#sdesf_single").val(array.join(","));
    });

    $("#sdesf_single").val(result.num.join(","));
    var notes = result.length;
    sdesfShowFooter(true,notes);
    return notes;
}

function sdesfShowFooter(isValid,notes){
    $('#sdesf_zhushu').text(notes);
    if($("#sdesf_modeId").val() == "8"){
        $('#sdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#sdesf_beiNum").val()),0.002));
    }else if ($("#sdesf_modeId").val() == "2"){
        $('#sdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#sdesf_beiNum").val()),0.2));
    }else if ($("#sdesf_modeId").val() == "1"){
        $('#sdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#sdesf_beiNum").val()),0.02));
    }else{
        $('#sdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#sdesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    sdesf_initFooterButton();
    calcAwardWin('sdesf',sdesf_playMethod);  //计算奖金和盈利
}