var gdesf_playType = 1;
var gdesf_playMethod = 7;
var gdesf_sntuo = 0;
var gdesf_rebate;
var gdesfScroll;

//进入这个页面时调用
function gdesfPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("gdesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("gdesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function gdesfPageUnloadedPanel(){
    $("#gdesfPage_back").off('click');
    $("#gdesf_queding").off('click');
    $("#gdesf_ballView").empty();
    $("#gdesfSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="gdesfPlaySelect"></select>');
    $("#gdesfSelect").append($select);
}

//入口函数
function gdesf_init(){
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
    $("#gdesf_title").html(LotteryInfo.getLotteryNameByTag("gdesf"));
    for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
    	if(i == 5)continue;
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
                var name = LotteryInfo.getMethodName("esf",j);
                if(i == gdesf_playType && j == gdesf_playMethod){
                    $play.append('<option value="gdesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="gdesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(gdesf_playMethod,onShowArray)>-1 ){
						gdesf_playType = i;
						gdesf_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#gdesfPlaySelect").append($play);
		}
    }
    
    if($("#gdesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("gdesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:gdesfChangeItem
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

    GetLotteryInfo("gdesf",function (){
        gdesfChangeItem("gdesf"+gdesf_playMethod);
    });

    //添加滑动条
    if(!gdesfScroll){
        gdesfScroll = new IScroll('#gdesfContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("gdesf",LotteryInfo.getLotteryIdByTag("gdesf"));

    //获取上一期开奖
    queryLastPrize("gdesf");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('gdesf');

    //机选选号
    $("#gdesf_random").on('click', function(event) {
        gdesf_randomOne();
    });
    
    $("#gdesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",gdesf_playMethod));
	//玩法说明
	$("#gdesf_paly_shuoming").off('click');
	$("#gdesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#gdesf_shuoming").text());
	});

    //返回
    $("#gdesfPage_back").on('click', function(event) {
        // gdesf_playType = 0;
        // gdesf_playMethod = 0;
        $("#gdesf_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        gdesf_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("gdesf");//清空
    gdesf_submitData();
}

function gdesfResetPlayType(){
    gdesf_playType = 0;
    gdesf_playMethod = 0;
}

function gdesfChangeItem(val){
    gdesf_qingkongAll();

    var temp = val.substring("gdesf".length,val.length);

    if(val == 'gdesf1'){
        $("#gdesf_random").hide();
        gdesf_sntuo = 3;
        gdesf_playType = 0;
        gdesf_playMethod = 1;
        $("#gdesf_ballView").empty();
        gdesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("gdesf",tips);
    }else if(val == 'gdesf5'){
        $("#gdesf_random").hide();
        gdesf_sntuo = 3;
        gdesf_playType = 0;
        gdesf_playMethod = 5;
        $("#gdesf_ballView").empty();
        gdesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("gdesf",tips);
    }else if(val == 'gdesf8'){
        $("#gdesf_random").hide();
        gdesf_sntuo = 3;
        gdesf_playType = 1;
        gdesf_playMethod = 8;
        $("#gdesf_ballView").empty();
        gdesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("gdesf",tips);
    }else if(val == 'gdesf12'){
        $("#gdesf_random").hide();
        gdesf_sntuo = 3;
        gdesf_playType = 1;
        gdesf_playMethod = 12;
        $("#gdesf_ballView").empty();
        gdesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("gdesf",tips);
    }else if(parseInt(temp) == 14){
        $("#gdesf_random").show();
        gdesf_sntuo = 0;
        gdesf_playType = 2;
        gdesf_playMethod = parseInt(temp);
        createOneLineLayout("gdesf","请至少选择1个",1,11,true,function(){
            gdesf_calcNotes();
        });
    }else if(val == 'gdesf7'){
        $("#gdesf_random").show();
        gdesf_sntuo = 0;
        gdesf_playType = 1;
        gdesf_playMethod = 7;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tips = [tip1,tip2];
        createTwoLineLayout("gdesf",tips,1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf9'){
        $("#gdesf_random").show();
        gdesf_sntuo = 2;
        gdesf_playType = 1;
        gdesf_playMethod = 9;
        createOneLineLayout("gdesf","请至少选择2个",1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf10'){
        $("#gdesf_random").hide();
        gdesf_sntuo = 1;
        gdesf_playType = 1;
        gdesf_playMethod = 10;
        createDanTuoSpecLayout("gdesf",1,1,10,1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf11'){
        $("#gdesf_random").show();
        gdesf_sntuo = 0;
        gdesf_playType = 1;
        gdesf_playMethod = 11;
        createOneLineLayout("gdesf","请至少选择2个",1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf13'){
        $("#gdesf_random").hide();
        gdesf_sntuo = 1;
        gdesf_playType = 1;
        gdesf_playMethod = 13;
        createDanTuoLayout("gdesf",1,1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf0'){
        $("#gdesf_random").show();
        gdesf_sntuo = 0;
        gdesf_playType = 0;
        gdesf_playMethod = 0;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("gdesf",tips,1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf2'){
        $("#gdesf_random").show();
        gdesf_sntuo = 2;
        gdesf_playType = 0;
        gdesf_playMethod = 2;
        createOneLineLayout("gdesf","请至少选择3个",1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf3'){
        $("#gdesf_random").hide();
        gdesf_sntuo = 1;
        gdesf_playType = 0;
        gdesf_playMethod = 3;
        createDanTuoSpecLayout("gdesf",2,1,10,1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf4'){
        $("#gdesf_random").show();
        gdesf_sntuo = 0;
        gdesf_playType = 0;
        gdesf_playMethod = 4;
        createOneLineLayout("gdesf","请至少选择3个",1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf6'){
        $("#gdesf_random").hide();
        gdesf_sntuo = 1;
        gdesf_playType = 0;
        gdesf_playMethod = 6;
        createDanTuoLayout("gdesf",2,1,11,true,function(){
            gdesf_calcNotes();
        });
        gdesf_qingkongAll();
    }else if(val == 'gdesf16'){
        $("#gdesf_random").show();
        gdesf_sntuo = 0;
        gdesf_playType = 4;
        gdesf_playMethod = 16;
        gdesf_qingkongAll();
        createOneLineLayout("gdesf","前三位：请至少选择1个",1,11,true,function(){
            gdesf_calcNotes();
        });
    }else if(val == 'gdesf15'){
        $("#gdesf_random").show();
        gdesf_sntuo = 0;
        gdesf_playType = 3;
        gdesf_playMethod = 15;
        gdesf_qingkongAll();
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("gdesf",tips,1,11,true,function(){
            gdesf_calcNotes();
        });
    }else if(parseInt(temp) < 27 && parseInt(temp) > 18){
        $("#gdesf_random").show();
        gdesf_sntuo = 0;
        gdesf_playType = 6;
        gdesf_playMethod = parseInt(temp);
        createOneLineLayout("gdesf","请至少选择"+(gdesf_playMethod - 18)+"个",1,11,true,function(){
            gdesf_calcNotes();
        });
    }else if(parseInt(temp) < 35 && parseInt(temp) > 26){
        $("#gdesf_random").hide();
        gdesf_sntuo = 3;
        gdesf_playType = 7;
        gdesf_playMethod = parseInt(temp);
        $("#gdesf_ballView").empty();
        gdesf_qingkongAll();
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
        var tips = "<p>格式说明<br/>"+name[gdesf_playMethod - 27]+":"+ (array[gdesf_playMethod - 27]) +"<br/>1)每注必须是"+(gdesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("gdesf",tips);
    }else if(parseInt(temp) < 42 && parseInt(temp) > 34){
        $("#gdesf_random").hide();
        gdesf_sntuo = 1;
        gdesf_playType = 8;
        gdesf_playMethod = parseInt(temp);
        createDanTuoLayout("gdesf",gdesf_playMethod-34,1,11,true,function(){
            gdesf_calcNotes();
        });
    }

    if(gdesfScroll){
        gdesfScroll.refresh();
        gdesfScroll.scrollTo(0,0,1);
    }
    
    $("#gdesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
    
    initFooterData("gdesf",temp);
    hideRandomWhenLi("gdesf",gdesf_sntuo,gdesf_playMethod);
    gdesf_calcNotes();
}

/**
 * [gdesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function gdesf_initFooterButton(){
    if (gdesf_playType == 6 || gdesf_playType == 2 || gdesf_playType == 4) {
        if (LotteryStorage["gdesf"]["line1"].length > 0) {
            $("#gdesf_qingkong").css("opacity",1.0);
        }else{
            $("#gdesf_qingkong").css("opacity",0.4);
        }
    }else if(gdesf_playType == 8){
        if (LotteryStorage["gdesf"]["line1"].length > 0 || LotteryStorage["gdesf"]["line2"].length > 0) {
            $("#gdesf_qingkong").css("opacity",1.0);
        }else{
            $("#gdesf_qingkong").css("opacity",0.4);
        }
    }else if(gdesf_playType == 3){
        if(LotteryStorage["gdesf"]["line1"].length > 0
            || LotteryStorage["gdesf"]["line2"].length > 0
            || LotteryStorage["gdesf"]["line3"].length > 0){
            $("#gdesf_qingkong").css("opacity",1.0);
        }else{
            $("#gdesf_qingkong").css("opacity",0.4);
        }
    }else if(gdesf_playType == 1){
        if (gdesf_playMethod == 7 || gdesf_playMethod == 10 || gdesf_playMethod == 13) {
            if(LotteryStorage["gdesf"]["line1"].length > 0
                || LotteryStorage["gdesf"]["line2"].length > 0){
                $("#gdesf_qingkong").css("opacity",1.0);
            }else{
                $("#gdesf_qingkong").css("opacity",0.4);
            }
        }else if(gdesf_playMethod == 9 || gdesf_playMethod == 11){
            if(LotteryStorage["gdesf"]["line1"].length > 0){
                $("#gdesf_qingkong").css("opacity",1.0);
            }else{
                $("#gdesf_qingkong").css("opacity",0.4);
            }
        }else if(gdesf_playMethod == 8 || gdesf_playMethod == 12){
            $("#gdesf_qingkong").css("opacity",0);
        }
    }else if(gdesf_playType == 0){
        if (gdesf_playMethod == 0) {
            if(LotteryStorage["gdesf"]["line1"].length > 0
                || LotteryStorage["gdesf"]["line2"].length > 0
                || LotteryStorage["gdesf"]["line3"].length > 0){
                $("#gdesf_qingkong").css("opacity",1.0);
            }else{
                $("#gdesf_qingkong").css("opacity",0.4);
            }
        }else if(gdesf_playMethod == 3 || gdesf_playMethod == 6){
            if(LotteryStorage["gdesf"]["line1"].length > 0
                || LotteryStorage["gdesf"]["line2"].length > 0){
                $("#gdesf_qingkong").css("opacity",1.0);
            }else{
                $("#gdesf_qingkong").css("opacity",0.4);
            }
        }else if(gdesf_playMethod == 2 || gdesf_playMethod == 4){
            if(LotteryStorage["gdesf"]["line1"].length > 0){
                $("#gdesf_qingkong").css("opacity",1.0);
            }else{
                $("#gdesf_qingkong").css("opacity",0.4);
            }
        }else if(gdesf_playMethod == 1 || gdesf_playMethod == 5){
            $("#gdesf_qingkong").css("opacity",0);
        }
    }else{
        $("#gdesf_qingkong").css("opacity",0);
    }

    if($("#gdesf_qingkong").css("opacity") == "0"){
        $("#gdesf_qingkong").css("display","none");
    }else{
        $("#gdesf_qingkong").css("display","block");
    }

    if($('#gdesf_zhushu').html() > 0){
        $("#gdesf_queding").css("opacity",1.0);
    }else{
        $("#gdesf_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  gdesf_qingkongAll(){
    $("#gdesf_ballView span").removeClass('redBalls_active');
    LotteryStorage["gdesf"]["line1"] = [];
    LotteryStorage["gdesf"]["line2"] = [];
    LotteryStorage["gdesf"]["line3"] = [];

    localStorageUtils.removeParam("gdesf_line1");
    localStorageUtils.removeParam("gdesf_line2");
    localStorageUtils.removeParam("gdesf_line3");

    $('#gdesf_zhushu').text(0);
    $('#gdesf_money').text(0);
    clearAwardWin("gdesf");
    gdesf_initFooterButton();
}

/**
 * [gdesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function gdesf_calcNotes(){
	$('#gdesf_modeId').blur();
	$('#gdesf_fandian').blur();
	
    var notes = 0;

    if (gdesf_playType == 6) {
        notes = mathUtil.getCCombination(LotteryStorage["gdesf"]["line1"].length,gdesf_playMethod - 18);
    }else if(gdesf_playType == 8){
        if(LotteryStorage["gdesf"]["line1"].length == 0 || LotteryStorage["gdesf"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["gdesf"]["line2"].length,(gdesf_playMethod - 33)-LotteryStorage["gdesf"]["line1"].length);
        }
    }else if(gdesf_playType == 2 || gdesf_playType == 4){
        notes = LotteryStorage["gdesf"]["line1"].length;
    }else if(gdesf_playType == 1){
        if (gdesf_playMethod == 7){
            for (var i = 0; i < LotteryStorage["gdesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["gdesf"]["line2"].length; j++) {
                    if(LotteryStorage["gdesf"]["line1"][i] != LotteryStorage["gdesf"]["line2"][j]){
                        notes++ ;
                    }
                }
            }
        }else if(gdesf_playMethod == 9){
            notes = mathUtil.getACombination(LotteryStorage["gdesf"]["line1"].length,2);
        }else if(gdesf_playMethod == 10){
            if(LotteryStorage["gdesf"]["line1"].length == 0 || LotteryStorage["gdesf"]["line2"].length == 0){
                notes = 0;
            }else{
                notes = 2 * mathUtil.getCCombination(LotteryStorage["gdesf"]["line2"].length,1);
            }
        }else if(gdesf_playMethod == 11){
            notes = mathUtil.getCCombination(LotteryStorage["gdesf"]["line1"].length,2);
        }else if(gdesf_playMethod == 13){
            if(LotteryStorage["gdesf"]["line1"].length == 0 || LotteryStorage["gdesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["gdesf"]["line2"].length,1);
            }
        }else{  //单式
            notes = gdesfValidateData('onblur');
        }
    }else if(gdesf_playType == 0){
        if (gdesf_playMethod == 0){
            for (var i = 0; i < LotteryStorage["gdesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["gdesf"]["line2"].length; j++) {
                    for (var k = 0; k < LotteryStorage["gdesf"]["line3"].length; k++) {
                        if(LotteryStorage["gdesf"]["line1"][i] != LotteryStorage["gdesf"]["line2"][j]
                            &&LotteryStorage["gdesf"]["line1"][i] != LotteryStorage["gdesf"]["line3"][k]
                            && LotteryStorage["gdesf"]["line2"][j] != LotteryStorage["gdesf"]["line3"][k]){
                            notes++ ;
                        }
                    }
                }
            }
        }else if(gdesf_playMethod == 2){
            notes = mathUtil.getACombination(LotteryStorage["gdesf"]["line1"].length,3);
        }else if(gdesf_playMethod == 3){
            if(LotteryStorage["gdesf"]["line1"].length == 0 || LotteryStorage["gdesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = 6 * mathUtil.getCCombination(LotteryStorage["gdesf"]["line2"].length,3 - LotteryStorage["gdesf"]["line1"].length);
            }
        }else if(gdesf_playMethod == 4){
            notes = mathUtil.getCCombination(LotteryStorage["gdesf"]["line1"].length,3);
        }else if(gdesf_playMethod == 6){
            if(LotteryStorage["gdesf"]["line1"].length == 0 || LotteryStorage["gdesf"]["line2"].length == 0
                || LotteryStorage["gdesf"]["line1"].length + LotteryStorage["gdesf"]["line2"].length < 3){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["gdesf"]["line2"].length,3 - LotteryStorage["gdesf"]["line1"].length);
            }
        }else{  //单式
            notes = gdesfValidateData('onblur');
        }
    }else if(gdesf_playType == 3){
        notes = LotteryStorage["gdesf"]["line1"].length + LotteryStorage["gdesf"]["line2"].length + LotteryStorage["gdesf"]["line3"].length;
    }else{  //单式
        notes = gdesfValidateData('onblur');
    }

    hideRandomWhenLi('gdesf',gdesf_sntuo,gdesf_playMethod);

    //验证是否为空
    if( $("#gdesf_beiNum").val() =="" || parseInt($("#gdesf_beiNum").val()) == 0){
        $("#gdesf_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#gdesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#gdesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#gdesf_zhushu').text(notes);
        if($("#gdesf_modeId").val() == "8"){
            $('#gdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#gdesf_beiNum").val()),0.002));
        }else if ($("#gdesf_modeId").val() == "2"){
            $('#gdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#gdesf_beiNum").val()),0.2));
        }else if ($("#gdesf_modeId").val() == "1"){
            $('#gdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#gdesf_beiNum").val()),0.02));
        }else{
            $('#gdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#gdesf_beiNum").val()),2));
        }
    } else {
        $('#gdesf_zhushu').text(0);
        $('#gdesf_money').text(0);
    }
    gdesf_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('gdesf',gdesf_playMethod);
}

/**
 * [gdesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function gdesf_randomOne(){
    gdesf_qingkongAll();
    if(gdesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(gdesf_playMethod - 18,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["gdesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "gdesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(gdesf_playMethod == 14){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["gdesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["gdesf"]["line1"], function(k, v){
            $("#" + "gdesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(gdesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        LotteryStorage["gdesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["gdesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

        $.each(LotteryStorage["gdesf"]["line1"], function(k, v){
            $("#" + "gdesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["gdesf"]["line2"], function(k, v){
            $("#" + "gdesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(gdesf_playMethod == 9 || gdesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["gdesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "gdesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(gdesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        LotteryStorage["gdesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["gdesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
        LotteryStorage["gdesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

        $.each(LotteryStorage["gdesf"]["line1"], function(k, v){
            $("#" + "gdesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["gdesf"]["line2"], function(k, v){
            $("#" + "gdesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["gdesf"]["line3"], function(k, v){
            $("#" + "gdesf_line3" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(gdesf_playMethod == 2 || gdesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["gdesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "gdesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(gdesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["gdesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["gdesf"]["line1"], function(k, v){
            $("#" + "gdesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(gdesf_playMethod == 15){
        var line = mathUtil.getRandomNum(1,4);
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["gdesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["gdesf"]["line"+line], function(k, v){
            $("#" + "gdesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
        });
    }
    gdesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function gdesf_checkOutRandom(playMethod){
    var obj = new Object();
    if(gdesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(gdesf_playMethod - 18,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(gdesf_playMethod == 14 || gdesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        obj.nums = number < 10 ? "0"+number : number;
        obj.notes = 1;
    }else if(gdesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(gdesf_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(gdesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(gdesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(gdesf_playMethod == 2){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 6;
    }else if(gdesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(gdesf_playMethod == 15){
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
    obj.sntuo = gdesf_sntuo;
    obj.multiple = 1;
    obj.rebates = gdesf_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('gdesf',gdesf_playMethod,obj);  //机选奖金计算
    obj.award = $('#gdesf_minAward').html();     //奖金
    obj.maxAward = $('#gdesf_maxAward').html();  //多级奖金
    return obj;
}


/**
 * [gdesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function gdesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#gdesf_queding").bind('click', function(event) {
		gdesf_rebate = $("#gdesf_fandian option:last").val();
		if(parseInt($('#gdesf_zhushu').html()) <= 0 || Number($("#gdesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		gdesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#gdesf_modeId').val()) == 8){
			if (Number($('#gdesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('gdesf',gdesf_playMethod);

		submitParams.lotteryType = "gdesf";
		var playType = LotteryInfo.getPlayName("esf",gdesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",gdesf_playMethod);
		submitParams.playTypeIndex = gdesf_playType;
		submitParams.playMethodIndex = gdesf_playMethod;
		var selectedBalls = [];
		if (gdesf_playType == 6 || gdesf_playType == 2 || gdesf_playType == 4) {
			$("#gdesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(gdesf_playType == 8){
			if(parseInt($('#gdesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#gdesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(gdesf_playType == 1 || gdesf_playType == 0){
			if(gdesf_playMethod == 7 || gdesf_playMethod == 0){
				$("#gdesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(gdesf_playMethod == 9 || gdesf_playMethod == 11 || gdesf_playMethod == 2 || gdesf_playMethod == 4){
				$("#gdesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(gdesf_playMethod == 10 || gdesf_playMethod == 13 || gdesf_playMethod == 3 || gdesf_playMethod == 6){
				if(parseInt($('#gdesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#gdesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(gdesf_playMethod == 1 || gdesf_playMethod == 8){//直选单式
				//去错误号
				gdesfValidateData("submit");
				var arr = $("#gdesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(gdesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(gdesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(gdesf_playMethod == 5 || gdesf_playMethod == 12){//组选单式
				//去错误号
				gdesfValidateData("submit");
				var arr = $("#gdesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(gdesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(gdesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(gdesf_playMethod == 15) {
			$("#gdesf_ballView div.ballView").each(function(){
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
			gdesfValidateData("submit");
			var arr = $("#gdesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(gdesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(gdesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(gdesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(gdesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(gdesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(gdesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(gdesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#gdesf_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#gdesf_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#gdesf_fandian").val());
		submitParams.notes = $('#gdesf_zhushu').html();
		submitParams.sntuo = gdesf_sntuo;
		submitParams.multiple = $('#gdesf_beiNum').val();  //requirement
		submitParams.rebates = $('#gdesf_fandian').val();  //requirement
		submitParams.playMode = $('#gdesf_modeId').val();  //requirement
		submitParams.money = $('#gdesf_money').html();  //requirement
		submitParams.award = $('#gdesf_minAward').html();  //奖金
		submitParams.maxAward = $('#gdesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#gdesf_ballView").empty();
		gdesf_qingkongAll();
	});
}

function gdesfValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#gdesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
    var	result,
        content = {};
    if(gdesf_playMethod == 1){  //前三直选单式
        content.str = str;
        content.weishu = 8;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if( gdesf_playMethod == 8){  //前二直选单式
        content.str = str;
        content.weishu = 5;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    } else if(gdesf_playMethod == 5){  //前三组选单式
        content.str = str;
        content.weishu = 8;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if(gdesf_playMethod == 12){  //前二组选单式
        content.str = str;
        content.weishu = 5;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if (gdesf_playMethod > 26 && gdesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(gdesf_playMethod - 26);
        content.str = str;
        content.weishu = 3*weiNum-1;
        content.renXuan = true;
        content.select = true;
        result = handleSingleStr_deleteErr(content,type);
    }

    $('#gdesf_delRepeat').off('click');
    $('#gdesf_delRepeat').on('click',function () {
        content.str = $('#gdesf_single').val() ? $('#gdesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        var array = rptResult.num || [];
        notes = rptResult.length;
        gdesfShowFooter(true,notes);
        $("#gdesf_single").val(array.join(","));
    });

    $("#gdesf_single").val(result.num.join(","));
    var notes = result.length;
    gdesfShowFooter(true,notes);
    return notes;
}

function gdesfShowFooter(isValid,notes){
    $('#gdesf_zhushu').text(notes);
    if($("#gdesf_modeId").val() == "8"){
        $('#gdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#gdesf_beiNum").val()),0.002));
    }else if ($("#gdesf_modeId").val() == "2"){
        $('#gdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#gdesf_beiNum").val()),0.2));
    }else if ($("#gdesf_modeId").val() == "1"){
        $('#gdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#gdesf_beiNum").val()),0.02));
    }else{
        $('#gdesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#gdesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    gdesf_initFooterButton();
    calcAwardWin('gdesf',gdesf_playMethod);  //计算奖金和盈利
}