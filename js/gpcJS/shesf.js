var shesf_playType = 1;
var shesf_playMethod = 7;
var shesf_sntuo = 0;
var shesf_rebate;
var shesfScroll;

//进入这个页面时调用
function shesfPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("shesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("shesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function shesfPageUnloadedPanel(){
    $("#shesfPage_back").off('click');
    $("#shesf_queding").off('click');
    $("#shesf_ballView").empty();
    $("#shesfSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="shesfPlaySelect"></select>');
    $("#shesfSelect").append($select);
}

//入口函数
function shesf_init(){
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
    $("#shesf_title").html(LotteryInfo.getLotteryNameByTag("shesf"));
    for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
    	if(i == 5)continue;
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
                var name = LotteryInfo.getMethodName("esf",j);
                if(i == shesf_playType && j == shesf_playMethod){
                    $play.append('<option value="shesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="shesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(shesf_playMethod,onShowArray)>-1 ){
						shesf_playType = i;
						shesf_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#shesfPlaySelect").append($play);
		}
    }
    
    if($("#shesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("shesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:shesfChangeItem
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

    GetLotteryInfo("shesf",function (){
        shesfChangeItem("shesf"+shesf_playMethod);
    });

    //添加滑动条
    if(!shesfScroll){
        shesfScroll = new IScroll('#shesfContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("shesf",LotteryInfo.getLotteryIdByTag("shesf"));

    //获取上一期开奖
    queryLastPrize("shesf");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('shesf');

    //机选选号
    $("#shesf_random").on('click', function(event) {
        shesf_randomOne();
    });

    //返回
    $("#shesfPage_back").on('click', function(event) {
        // shesf_playType = 0;
        // shesf_playMethod = 0;
        $("#shesf_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        shesf_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#shesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",shesf_playMethod));
	//玩法说明
	$("#shesf_paly_shuoming").off('click');
	$("#shesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#shesf_shuoming").text());
	});

    qingKong("shesf");//清空
    shesf_submitData();
}

function shesfResetPlayType(){
    shesf_playType = 0;
    shesf_playMethod = 0;
}

function shesfChangeItem(val){
    shesf_qingkongAll();

    var temp = val.substring("shesf".length,val.length);

    if(val == 'shesf1'){
        $("#shesf_random").hide();
        shesf_sntuo = 3;
        shesf_playType = 0;
        shesf_playMethod = 1;
        $("#shesf_ballView").empty();
        shesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("shesf",tips);
    }else if(val == 'shesf5'){
        $("#shesf_random").hide();
        shesf_sntuo = 3;
        shesf_playType = 0;
        shesf_playMethod = 5;
        $("#shesf_ballView").empty();
        shesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("shesf",tips);
    }else if(val == 'shesf8'){
        $("#shesf_random").hide();
        shesf_sntuo = 3;
        shesf_playType = 1;
        shesf_playMethod = 8;
        $("#shesf_ballView").empty();
        shesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("shesf",tips);
    }else if(val == 'shesf12'){
        $("#shesf_random").hide();
        shesf_sntuo = 3;
        shesf_playType = 1;
        shesf_playMethod = 12;
        $("#shesf_ballView").empty();
        shesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("shesf",tips);
    }else if(parseInt(temp) == 14){
        $("#shesf_random").show();
        shesf_sntuo = 0;
        shesf_playType = 2;
        shesf_playMethod = parseInt(temp);
        createOneLineLayout("shesf","请至少选择1个",1,11,true,function(){
            shesf_calcNotes();
        });
    }else if(val == 'shesf7'){
        $("#shesf_random").show();
        shesf_sntuo = 0;
        shesf_playType = 1;
        shesf_playMethod = 7;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tips = [tip1,tip2];
        createTwoLineLayout("shesf",tips,1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf9'){
        $("#shesf_random").show();
        shesf_sntuo = 2;
        shesf_playType = 1;
        shesf_playMethod = 9;
        createOneLineLayout("shesf","请至少选择2个",1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf10'){
        $("#shesf_random").hide();
        shesf_sntuo = 1;
        shesf_playType = 1;
        shesf_playMethod = 10;
        createDanTuoSpecLayout("shesf",1,1,10,1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf11'){
        $("#shesf_random").show();
        shesf_sntuo = 0;
        shesf_playType = 1;
        shesf_playMethod = 11;
        createOneLineLayout("shesf","请至少选择2个",1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf13'){
        $("#shesf_random").hide();
        shesf_sntuo = 1;
        shesf_playType = 1;
        shesf_playMethod = 13;
        createDanTuoLayout("shesf",1,1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf0'){
        $("#shesf_random").show();
        shesf_sntuo = 0;
        shesf_playType = 0;
        shesf_playMethod = 0;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("shesf",tips,1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf2'){
        $("#shesf_random").show();
        shesf_sntuo = 2;
        shesf_playType = 0;
        shesf_playMethod = 2;
        createOneLineLayout("shesf","请至少选择3个",1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf3'){
        $("#shesf_random").hide();
        shesf_sntuo = 1;
        shesf_playType = 0;
        shesf_playMethod = 3;
        createDanTuoSpecLayout("shesf",2,1,10,1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf4'){
        $("#shesf_random").show();
        shesf_sntuo = 0;
        shesf_playType = 0;
        shesf_playMethod = 4;
        createOneLineLayout("shesf","请至少选择3个",1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf6'){
        $("#shesf_random").hide();
        shesf_sntuo = 1;
        shesf_playType = 0;
        shesf_playMethod = 6;
        createDanTuoLayout("shesf",2,1,11,true,function(){
            shesf_calcNotes();
        });
        shesf_qingkongAll();
    }else if(val == 'shesf16'){
        $("#shesf_random").show();
        shesf_sntuo = 0;
        shesf_playType = 4;
        shesf_playMethod = 16;
        shesf_qingkongAll();
        createOneLineLayout("shesf","前三位：请至少选择1个",1,11,true,function(){
            shesf_calcNotes();
        });
    }else if(val == 'shesf15'){
        $("#shesf_random").show();
        shesf_sntuo = 0;
        shesf_playType = 3;
        shesf_playMethod = 15;
        shesf_qingkongAll();
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("shesf",tips,1,11,true,function(){
            shesf_calcNotes();
        });
    }else if(parseInt(temp) < 27 && parseInt(temp) > 18){
        $("#shesf_random").show();
        shesf_sntuo = 0;
        shesf_playType = 6;
        shesf_playMethod = parseInt(temp);
        createOneLineLayout("shesf","请至少选择"+(shesf_playMethod - 18)+"个",1,11,true,function(){
            shesf_calcNotes();
        });
    }else if(parseInt(temp) < 35 && parseInt(temp) > 26){
        $("#shesf_random").hide();
        shesf_sntuo = 3;
        shesf_playType = 7;
        shesf_playMethod = parseInt(temp);
        $("#shesf_ballView").empty();
        shesf_qingkongAll();
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
        var tips = "<p>格式说明<br/>"+name[shesf_playMethod - 27]+":"+ (array[shesf_playMethod - 27]) +"<br/>1)每注必须是"+(shesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("shesf",tips);
    }else if(parseInt(temp) < 42 && parseInt(temp) > 34){
        $("#shesf_random").hide();
        shesf_sntuo = 1;
        shesf_playType = 8;
        shesf_playMethod = parseInt(temp);
        createDanTuoLayout("shesf",shesf_playMethod-34,1,11,true,function(){
            shesf_calcNotes();
        });
    }

    if(shesfScroll){
        shesfScroll.refresh();
        shesfScroll.scrollTo(0,0,1);
    }
    
    $("#shesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
    
    initFooterData("shesf",temp);
    hideRandomWhenLi("shesf",shesf_sntuo,shesf_playMethod);
    shesf_calcNotes();
}

/**
 * [shesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function shesf_initFooterButton(){
    if (shesf_playType == 6 || shesf_playType == 2 || shesf_playType == 4) {
        if (LotteryStorage["shesf"]["line1"].length > 0) {
            $("#shesf_qingkong").css("opacity",1.0);
        }else{
            $("#shesf_qingkong").css("opacity",0.4);
        }
    }else if(shesf_playType == 8){
        if (LotteryStorage["shesf"]["line1"].length > 0 || LotteryStorage["shesf"]["line2"].length > 0) {
            $("#shesf_qingkong").css("opacity",1.0);
        }else{
            $("#shesf_qingkong").css("opacity",0.4);
        }
    }else if(shesf_playType == 3){
        if(LotteryStorage["shesf"]["line1"].length > 0
            || LotteryStorage["shesf"]["line2"].length > 0
            || LotteryStorage["shesf"]["line3"].length > 0){
            $("#shesf_qingkong").css("opacity",1.0);
        }else{
            $("#shesf_qingkong").css("opacity",0.4);
        }
    }else if(shesf_playType == 1){
        if (shesf_playMethod == 7 || shesf_playMethod == 10 || shesf_playMethod == 13) {
            if(LotteryStorage["shesf"]["line1"].length > 0
                || LotteryStorage["shesf"]["line2"].length > 0){
                $("#shesf_qingkong").css("opacity",1.0);
            }else{
                $("#shesf_qingkong").css("opacity",0.4);
            }
        }else if(shesf_playMethod == 9 || shesf_playMethod == 11){
            if(LotteryStorage["shesf"]["line1"].length > 0){
                $("#shesf_qingkong").css("opacity",1.0);
            }else{
                $("#shesf_qingkong").css("opacity",0.4);
            }
        }else if(shesf_playMethod == 8 || shesf_playMethod == 12){
            $("#shesf_qingkong").css("opacity",0);
        }
    }else if(shesf_playType == 0){
        if (shesf_playMethod == 0) {
            if(LotteryStorage["shesf"]["line1"].length > 0
                || LotteryStorage["shesf"]["line2"].length > 0
                || LotteryStorage["shesf"]["line3"].length > 0){
                $("#shesf_qingkong").css("opacity",1.0);
            }else{
                $("#shesf_qingkong").css("opacity",0.4);
            }
        }else if(shesf_playMethod == 3 || shesf_playMethod == 6){
            if(LotteryStorage["shesf"]["line1"].length > 0
                || LotteryStorage["shesf"]["line2"].length > 0){
                $("#shesf_qingkong").css("opacity",1.0);
            }else{
                $("#shesf_qingkong").css("opacity",0.4);
            }
        }else if(shesf_playMethod == 2 || shesf_playMethod == 4){
            if(LotteryStorage["shesf"]["line1"].length > 0){
                $("#shesf_qingkong").css("opacity",1.0);
            }else{
                $("#shesf_qingkong").css("opacity",0.4);
            }
        }else if(shesf_playMethod == 1 || shesf_playMethod == 5){
            $("#shesf_qingkong").css("opacity",0);
        }
    }else{
        $("#shesf_qingkong").css("opacity",0);
    }

    if($("#shesf_qingkong").css("opacity") == "0"){
        $("#shesf_qingkong").css("display","none");
    }else{
        $("#shesf_qingkong").css("display","block");
    }

    if($('#shesf_zhushu').html() > 0){
        $("#shesf_queding").css("opacity",1.0);
    }else{
        $("#shesf_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  shesf_qingkongAll(){
    $("#shesf_ballView span").removeClass('redBalls_active');
    LotteryStorage["shesf"]["line1"] = [];
    LotteryStorage["shesf"]["line2"] = [];
    LotteryStorage["shesf"]["line3"] = [];

    localStorageUtils.removeParam("shesf_line1");
    localStorageUtils.removeParam("shesf_line2");
    localStorageUtils.removeParam("shesf_line3");

    $('#shesf_zhushu').text(0);
    $('#shesf_money').text(0);
    clearAwardWin("shesf");
    shesf_initFooterButton();
}

/**
 * [shesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function shesf_calcNotes(){
	$('#shesf_modeId').blur();
	$('#shesf_fandian').blur();
	
    var notes = 0;

    if (shesf_playType == 6) {
        notes = mathUtil.getCCombination(LotteryStorage["shesf"]["line1"].length,shesf_playMethod - 18);
    }else if(shesf_playType == 8){
        if(LotteryStorage["shesf"]["line1"].length == 0 || LotteryStorage["shesf"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["shesf"]["line2"].length,(shesf_playMethod - 33)-LotteryStorage["shesf"]["line1"].length);
        }
    }else if(shesf_playType == 2 || shesf_playType == 4){
        notes = LotteryStorage["shesf"]["line1"].length;
    }else if(shesf_playType == 1){
        if (shesf_playMethod == 7){
            for (var i = 0; i < LotteryStorage["shesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["shesf"]["line2"].length; j++) {
                    if(LotteryStorage["shesf"]["line1"][i] != LotteryStorage["shesf"]["line2"][j]){
                        notes++ ;
                    }
                }
            }
        }else if(shesf_playMethod == 9){
            notes = mathUtil.getACombination(LotteryStorage["shesf"]["line1"].length,2);
        }else if(shesf_playMethod == 10){
            if(LotteryStorage["shesf"]["line1"].length == 0 || LotteryStorage["shesf"]["line2"].length == 0){
                notes = 0;
            }else{
                notes = 2 * mathUtil.getCCombination(LotteryStorage["shesf"]["line2"].length,1);
            }
        }else if(shesf_playMethod == 11){
            notes = mathUtil.getCCombination(LotteryStorage["shesf"]["line1"].length,2);
        }else if(shesf_playMethod == 13){
            if(LotteryStorage["shesf"]["line1"].length == 0 || LotteryStorage["shesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["shesf"]["line2"].length,1);
            }
        }else{  //单式
            notes = shesfValidateData('onblur');
        }
    }else if(shesf_playType == 0){
        if (shesf_playMethod == 0){
            for (var i = 0; i < LotteryStorage["shesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["shesf"]["line2"].length; j++) {
                    for (var k = 0; k < LotteryStorage["shesf"]["line3"].length; k++) {
                        if(LotteryStorage["shesf"]["line1"][i] != LotteryStorage["shesf"]["line2"][j]
                            &&LotteryStorage["shesf"]["line1"][i] != LotteryStorage["shesf"]["line3"][k]
                            && LotteryStorage["shesf"]["line2"][j] != LotteryStorage["shesf"]["line3"][k]){
                            notes++ ;
                        }
                    }
                }
            }
        }else if(shesf_playMethod == 2){
            notes = mathUtil.getACombination(LotteryStorage["shesf"]["line1"].length,3);
        }else if(shesf_playMethod == 3){
            if(LotteryStorage["shesf"]["line1"].length == 0 || LotteryStorage["shesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = 6 * mathUtil.getCCombination(LotteryStorage["shesf"]["line2"].length,3 - LotteryStorage["shesf"]["line1"].length);
            }
        }else if(shesf_playMethod == 4){
            notes = mathUtil.getCCombination(LotteryStorage["shesf"]["line1"].length,3);
        }else if(shesf_playMethod == 6){
            if(LotteryStorage["shesf"]["line1"].length == 0 || LotteryStorage["shesf"]["line2"].length == 0
                || LotteryStorage["shesf"]["line1"].length + LotteryStorage["shesf"]["line2"].length < 3){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["shesf"]["line2"].length,3 - LotteryStorage["shesf"]["line1"].length);
            }
        }else{  //单式
            notes = shesfValidateData('onblur');
        }
    }else if(shesf_playType == 3){
        notes = LotteryStorage["shesf"]["line1"].length + LotteryStorage["shesf"]["line2"].length + LotteryStorage["shesf"]["line3"].length;
    }else{  //单式
        notes = shesfValidateData('onblur');
    }

    hideRandomWhenLi('shesf',shesf_sntuo,shesf_playMethod);

    //验证是否为空
    if( $("#shesf_beiNum").val() =="" || parseInt($("#shesf_beiNum").val()) == 0){
        $("#shesf_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#shesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#shesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#shesf_zhushu').text(notes);
        if($("#shesf_modeId").val() == "8"){
            $('#shesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#shesf_beiNum").val()),0.002));
        }else if ($("#shesf_modeId").val() == "2"){
            $('#shesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#shesf_beiNum").val()),0.2));
        }else if ($("#shesf_modeId").val() == "1"){
            $('#shesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#shesf_beiNum").val()),0.02));
        }else{
            $('#shesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#shesf_beiNum").val()),2));
        }
    } else {
        $('#shesf_zhushu').text(0);
        $('#shesf_money').text(0);
    }
    shesf_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('shesf',shesf_playMethod);
}

/**
 * [shesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function shesf_randomOne(){
    shesf_qingkongAll();
    if(shesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(shesf_playMethod - 18,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["shesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "shesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(shesf_playMethod == 14){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["shesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["shesf"]["line1"], function(k, v){
            $("#" + "shesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(shesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        LotteryStorage["shesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["shesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

        $.each(LotteryStorage["shesf"]["line1"], function(k, v){
            $("#" + "shesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["shesf"]["line2"], function(k, v){
            $("#" + "shesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(shesf_playMethod == 9 || shesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["shesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "shesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(shesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        LotteryStorage["shesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["shesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
        LotteryStorage["shesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

        $.each(LotteryStorage["shesf"]["line1"], function(k, v){
            $("#" + "shesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["shesf"]["line2"], function(k, v){
            $("#" + "shesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["shesf"]["line3"], function(k, v){
            $("#" + "shesf_line3" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(shesf_playMethod == 2 || shesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["shesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "shesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(shesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["shesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["shesf"]["line1"], function(k, v){
            $("#" + "shesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(shesf_playMethod == 15){
        var line = mathUtil.getRandomNum(1,4);
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["shesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["shesf"]["line"+line], function(k, v){
            $("#" + "shesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
        });
    }
    shesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function shesf_checkOutRandom(playMethod){
    var obj = new Object();
    if(shesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(shesf_playMethod - 18,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(shesf_playMethod == 14 || shesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        obj.nums = number < 10 ? "0"+number : number;
        obj.notes = 1;
    }else if(shesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(shesf_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(shesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(shesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(shesf_playMethod == 2){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 6;
    }else if(shesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(shesf_playMethod == 15){
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
    obj.sntuo = shesf_sntuo;
    obj.multiple = 1;
    obj.rebates = shesf_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('shesf',shesf_playMethod,obj);  //机选奖金计算
    obj.award = $('#shesf_minAward').html();     //奖金
    obj.maxAward = $('#shesf_maxAward').html();  //多级奖金
    return obj;
}


/**
 * [shesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function shesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#shesf_queding").bind('click', function(event) {
		shesf_rebate = $("#shesf_fandian option:last").val();
		if(parseInt($('#shesf_zhushu').html()) <= 0 || Number($("#shesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		shesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#shesf_modeId').val()) == 8){
			if (Number($('#shesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('shesf',shesf_playMethod);

		submitParams.lotteryType = "shesf";
		var playType = LotteryInfo.getPlayName("esf",shesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",shesf_playMethod);
		submitParams.playTypeIndex = shesf_playType;
		submitParams.playMethodIndex = shesf_playMethod;
		var selectedBalls = [];
		if (shesf_playType == 6 || shesf_playType == 2 || shesf_playType == 4) {
			$("#shesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(shesf_playType == 8){
			if(parseInt($('#shesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#shesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(shesf_playType == 1 || shesf_playType == 0){
			if(shesf_playMethod == 7 || shesf_playMethod == 0){
				$("#shesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(shesf_playMethod == 9 || shesf_playMethod == 11 || shesf_playMethod == 2 || shesf_playMethod == 4){
				$("#shesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(shesf_playMethod == 10 || shesf_playMethod == 13 || shesf_playMethod == 3 || shesf_playMethod == 6){
				if(parseInt($('#shesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#shesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(shesf_playMethod == 1 || shesf_playMethod == 8){//直选单式
				//去错误号
				shesfValidateData("submit");
				var arr = $("#shesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(shesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(shesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(shesf_playMethod == 5 || shesf_playMethod == 12){//组选单式
				//去错误号
				shesfValidateData("submit");
				var arr = $("#shesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(shesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(shesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(shesf_playMethod == 15) {
			$("#shesf_ballView div.ballView").each(function(){
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
			shesfValidateData("submit");
			var arr = $("#shesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(shesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(shesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(shesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(shesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(shesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(shesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(shesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#shesf_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#shesf_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#shesf_fandian").val());
		submitParams.notes = $('#shesf_zhushu').html();
		submitParams.sntuo = shesf_sntuo;
		submitParams.multiple = $('#shesf_beiNum').val();  //requirement
		submitParams.rebates = $('#shesf_fandian').val();  //requirement
		submitParams.playMode = $('#shesf_modeId').val();  //requirement
		submitParams.money = $('#shesf_money').html();  //requirement
		submitParams.award = $('#shesf_minAward').html();  //奖金
		submitParams.maxAward = $('#shesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#shesf_ballView").empty();
		shesf_qingkongAll();
	});
}

function shesfValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#shesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
    var	result,
        content = {};
    if(shesf_playMethod == 1){  //前三直选单式
        content.str = str;
        content.weishu = 8;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if( shesf_playMethod == 8){  //前二直选单式
        content.str = str;
        content.weishu = 5;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    } else if(shesf_playMethod == 5){  //前三组选单式
        content.str = str;
        content.weishu = 8;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if(shesf_playMethod == 12){  //前二组选单式
        content.str = str;
        content.weishu = 5;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if (shesf_playMethod > 26 && shesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(shesf_playMethod - 26);
        content.str = str;
        content.weishu = 3*weiNum-1;
        content.renXuan = true;
        content.select = true;
        result = handleSingleStr_deleteErr(content,type);
    }

    $('#shesf_delRepeat').off('click');
    $('#shesf_delRepeat').on('click',function () {
        content.str = $('#shesf_single').val() ? $('#shesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        var array = rptResult.num || [];
        notes = rptResult.length;
        shesfShowFooter(true,notes);
        $("#shesf_single").val(array.join(","));
    });

    $("#shesf_single").val(result.num.join(","));
    var notes = result.length;
    shesfShowFooter(true,notes);
    return notes;
}

function shesfShowFooter(isValid,notes){
    $('#shesf_zhushu').text(notes);
    if($("#shesf_modeId").val() == "8"){
        $('#shesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#shesf_beiNum").val()),0.002));
    }else if ($("#shesf_modeId").val() == "2"){
        $('#shesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#shesf_beiNum").val()),0.2));
    }else if ($("#shesf_modeId").val() == "1"){
        $('#shesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#shesf_beiNum").val()),0.02));
    }else{
        $('#shesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#shesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    shesf_initFooterButton();
    calcAwardWin('shesf',shesf_playMethod);  //计算奖金和盈利
}