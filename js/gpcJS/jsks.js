//定义快3玩法标识
var jsks_playType = 0;
var jsks_playMethod = 0;
var jsks_sntuo = 0;
var jsks_rebate;
var jsksScroll;

//进入这个页面时调用
function jsksPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("jsks")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("jsks_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function jsksPageUnloadedPanel(){
    $("#jsksPage_back").off('click');
    $("#jsks_queding").off('click');
    $("#jsks_ballView").empty();
    $("#jsksSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="jsksPlaySelect"></select>');
    $("#jsksSelect").append($select);
}

//入口函数
function jsks_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("k3").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("k3")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("k3")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
    $("#jsks_title").html(LotteryInfo.getLotteryNameByTag("jsks"));
    for(var i = 0; i< LotteryInfo.getPlayLength("k3");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("k3",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("k3");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("k3",j) == LotteryInfo.getPlayTypeId("k3",i)){
                var name = LotteryInfo.getMethodName("k3",j);
                if(i == jsks_playType && j == jsks_playMethod){
                    $play.append('<option value="jsks'+LotteryInfo.getMethodIndex("k3",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="jsks'+LotteryInfo.getMethodIndex("k3",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(jsks_playMethod,onShowArray)>-1 ){
						jsks_playType = i;
						jsks_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#jsksPlaySelect").append($play);
		}
    }
    
    if($("#jsksPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("jsksSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:jsksChangeItem
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

    GetLotteryInfo("jsks",function (){
        jsksChangeItem("jsks"+jsks_playMethod);
    });

    //添加滑动条
    if(!jsksScroll){
        jsksScroll = new IScroll('#jsksContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("jsks",LotteryInfo.getLotteryIdByTag("jsks"));

    //获取上一期开奖
    queryLastPrize("jsks");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('jsks');

    //返回
    $("#jsksPage_back").on('click', function(event) {
        // jsks_playType = 0;
        // jsks_playMethod = 0;
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        $("#jsks_ballView").empty();
        jsks_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#jsks_shuoming").html(LotteryInfo.getMethodShuoming("k3",jsks_playMethod));
	//玩法说明
	$("#jsks_paly_shuoming").off('click');
	$("#jsks_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#jsks_shuoming").text());
	});

    //机选选号
    $("#jsks_random").on('click', function(event) {
        jsks_randomOne();
    });

    qingKong("jsks");//清空
    jsks_submitData();
}

function jsksResetPlayType(){
    jsks_playType = 0;
    jsks_playMethod = 0;
}

function jsksChangeItem(val) {
    jsks_qingkongAll();
    var temp = val.substring("jsks".length,val.length);
    if(val == "jsks0"){
        $("#jsks_random").show();
        jsks_sntuo = 0;
        jsks_playType = 0;
        jsks_playMethod = 0;
        createSumLayout("jsks",3,18,function(){
            jsks_calcNotes();
        });
    }else if(val == "jsks1"){
        //和值大小单双
        $("#jsks_random").show();
        var num = ["大","小","单","双"];
        jsks_sntuo = 0;
        jsks_playType = 0;
        jsks_playMethod = 1;
        createNonNumLayout("jsks",jsks_playMethod,num,function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks2"){
        $("#jsks_random").show();
        var num = ["111","222","333","444","555","666"];
        jsks_sntuo = 0;
        jsks_playType = 1;
        jsks_playMethod = 2;
        createNonNumLayout("jsks",jsks_playMethod,num,function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks3"){
        $("#jsks_random").hide();
        var num = ["111","222","333","444","555","666"];
        jsks_sntuo = 0;
        jsks_playType = 1;
        jsks_playMethod = 3;
        createTongXuanLayout("jsks",num,function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks4"){
        $("#jsks_random").show();
        jsks_sntuo = 0;
        jsks_playType = 2;
        jsks_playMethod = 4;
        createOneLineLayout("jsks","请至少选择3个",1,6,false,function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks5"){
        $("#jsks_random").hide();
        jsks_sntuo = 1;
        jsks_playType = 2;
        jsks_playMethod = 5;
        createDanTuoSpecLayout("jsks",2,1,5,1,6,false,function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks6"){
        $("#jsks_random").hide();
        jsks_sntuo = 0;
        jsks_playType = 3;
        jsks_playMethod = 6;
        var num = ["123","234","345","456"];
        createTongXuanLayout("jsks",num,function(){
            jsks_calcNotes();
        });
    }else if(val == "jsks7"){
        $("#jsks_random").hide();
        jsks_sntuo = 0;
        jsks_playType = 4;
        jsks_playMethod = 7;
        createErTongHaoLayout("jsks",function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks8"){
        $("#jsks_random").show();
        jsks_sntuo = 0;
        jsks_playType = 4;
        jsks_playMethod = 8;
        var num = ["11*","22*","33*","44*","55*","66*"];
        createNonNumLayout("jsks",jsks_playMethod,num,function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks9"){
        $("#jsks_random").show();
        jsks_sntuo = 0;
        jsks_playType = 5;
        jsks_playMethod = 9;
        createOneLineLayout("jsks","请至少选择2个",1,6,false,function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks10"){
        $("#jsks_random").hide();
        jsks_sntuo = 1;
        jsks_playType = 5;
        jsks_playMethod = 10;
        createDanTuoSpecLayout("jsks",1,1,5,1,6,false,function(){
            jsks_calcNotes();
        });
        jsks_qingkongAll();
    }else if(val == "jsks11"){
        $("#jsks_random").show();
        jsks_sntuo = 0;
        jsks_playType = 6;
        jsks_playMethod = 11;
        createOneLineLayout("jsks","请至少选择1个",1,6,false,function(){
            jsks_calcNotes();
        });
    }

    if (jsksScroll){
        jsksScroll.refresh();
        jsksScroll.scrollTo(0,0,1);
    }
    
    $("#jsks_shuoming").html(LotteryInfo.getMethodShuoming("k3",temp));
    
    initFooterData("jsks",temp);
    hideRandomWhenLi("jsks",jsks_sntuo,jsks_playMethod);
    jsks_calcNotes();
}

/**
 * [jsks_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function jsks_initFooterButton(){
    if(jsks_playMethod == 5 || jsks_playMethod == 7 || jsks_playMethod == 10){
        if (LotteryStorage["jsks"]["line1"].length > 0 || LotteryStorage["jsks"]["line2"].length > 0) {
            $("#jsks_qingkong").css("opacity",1.0);
        }else{
            $("#jsks_qingkong").css("opacity",0.4);
        }
    }else{
        if (LotteryStorage["jsks"]["line1"].length > 0) {
            $("#jsks_qingkong").css("opacity",1.0);
        }else{
            $("#jsks_qingkong").css("opacity",0.4);
        }
    }

    if($('#jsks_zhushu').html() > 0){
        $("#jsks_queding").css("opacity",1.0);
    }else{
        $("#jsks_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function jsks_qingkongAll(){
    $("#jsks_ballView span").removeClass('redBalls_active');
    LotteryStorage["jsks"]["line1"] = [];
    LotteryStorage["jsks"]["line2"] = [];
    localStorageUtils.removeParam("jsks_line1");
    localStorageUtils.removeParam("jsks_line2");

    $('#jsks_zhushu').text(0);
    $('#jsks_money').text(0);
    clearAwardWin("jsks");
    jsks_initFooterButton();
}

/**
 * [jsks_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function jsks_calcNotes(){
	$('#jsks_modeId').blur();
	$('#jsks_fandian').blur();
	
    var notes = 0;

    if(jsks_playMethod == 0 || jsks_playMethod == 2 || jsks_playMethod == 8 || jsks_playMethod == 11){
        notes = LotteryStorage["jsks"]["line1"].length;
    }else if(jsks_playMethod == 1 || jsks_playMethod == 3 || jsks_playMethod == 6){
        notes = LotteryStorage["jsks"]["line1"].length;
    }else if(jsks_playMethod == 4){
        notes = mathUtil.getCCombination(LotteryStorage["jsks"]["line1"].length,3);
    }else if(jsks_playMethod == 5){
        if(LotteryStorage["jsks"]["line1"].length == 0 || LotteryStorage["jsks"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["jsks"]["line2"].length,3-LotteryStorage["jsks"]["line1"].length);
        }
    }else if(jsks_playMethod == 7){
        notes = LotteryStorage["jsks"]["line2"].length * LotteryStorage["jsks"]["line1"].length;
    }else if(jsks_playMethod == 9){
        notes = mathUtil.getCCombination(LotteryStorage["jsks"]["line1"].length,2);
    }else if(jsks_playMethod == 10){
        if(LotteryStorage["jsks"]["line1"].length == 0 || LotteryStorage["jsks"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["jsks"]["line2"].length,2-LotteryStorage["jsks"]["line1"].length);
        }
    }

    hideRandomWhenLi("jsks",jsks_sntuo,jsks_playMethod);

    //验证是否为空
    if( $("#jsks_beiNum").val() =="" || parseInt($("#jsks_beiNum").val()) == 0){
        $("#jsks_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#jsks_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#jsks_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#jsks_zhushu').text(notes);
        if($("#jsks_modeId").val() == "8"){
            $('#jsks_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsks_beiNum").val()),0.002));
        }else if ($("#jsks_modeId").val() == "2"){
            $('#jsks_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsks_beiNum").val()),0.2));
        }else if ($("#jsks_modeId").val() == "1"){
            $('#jsks_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsks_beiNum").val()),0.02));
        }else{
            $('#jsks_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsks_beiNum").val()),2));
        }

    } else {
        $('#jsks_zhushu').text(0);
        $('#jsks_money').text(0);
    }
    jsks_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('jsks',jsks_playMethod);
}

/**
 * [jsks_randomOne 随机一注]
 * @return {[type]} [description]
 */
function jsks_randomOne(){
    jsks_qingkongAll();
    if(jsks_playMethod == 0){
        var number = mathUtil.getRandomNum(3,19);
        LotteryStorage["jsks"]["line1"].push(number+"");

        $.each(LotteryStorage["jsks"]["line1"], function(k, v){
            $("#" + "jsks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsks_playMethod == 1){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["jsks"]["line1"].push(number+"");
        $.each(LotteryStorage["jsks"]["line1"], function(k, v){
            $("#" + "jsks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsks_playMethod == 2 || jsks_playMethod == 8){
        var number = mathUtil.getRandomNum(0,6);
        LotteryStorage["jsks"]["line1"].push(number+"");

        $.each(LotteryStorage["jsks"]["line1"], function(k, v){
            $("#" + "jsks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsks_playMethod == 5){
        var number = mathUtil.getRandomNum(1,7);
        LotteryStorage["jsks"]["line1"].push(number+"");

        $.each(LotteryStorage["jsks"]["line1"], function(k, v){
            $("#" + "jsks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsks_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["jsks"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["jsks"]["line1"], function(k, v){
            $("#" + "jsks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsks_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["jsks"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["jsks"]["line1"], function(k, v){
            $("#" + "jsks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jsks_playMethod == 11){
        var number = mathUtil.getRandomNum(1,7);
        LotteryStorage["jsks"]["line1"].push(number+"");

        $.each(LotteryStorage["jsks"]["line1"], function(k, v){
            $("#" + "jsks_line1" + v).toggleClass("redBalls_active");
        });
    }
    jsks_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function jsks_checkOutRandom(playMethod){
    var obj = new Object();
    if(jsks_playMethod == 0){
        var number = mathUtil.getRandomNum(3,19);
        obj.nums = number;
        obj.notes = 1;
    }else if(jsks_playMethod == 1){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(jsks_playMethod == 2){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number + "" + number + "" + number;
        obj.notes = 1;
    }else if(jsks_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jsks_playMethod == 8){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number + "" + number +"*";
        obj.notes = 1;
    }else if(jsks_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jsks_playMethod == 11){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number;
        obj.notes = 1;
    }
    obj.sntuo = jsks_sntuo;
    obj.multiple = 1;
    obj.rebates = jsks_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('jsks',jsks_playMethod,obj);  //机选奖金计算
    obj.award = $('#jsks_minAward').html();     //奖金
    obj.maxAward = $('#jsks_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [jsks_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function jsks_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#jsks_queding").bind('click', function(event) {
        jsks_rebate = $("#jsks_fandian option:last").val();
        if(parseInt($('#jsks_zhushu').html()) <= 0 || Number($("#jsks_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        jsks_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#jsks_modeId').val()) == 8){
            if (Number($('#jsks_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('jsks',jsks_playMethod);

        submitParams.lotteryType = "jsks";
        var playType = LotteryInfo.getPlayName("k3",jsks_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("k3",jsks_playMethod);
        submitParams.playTypeIndex = jsks_playType;
        submitParams.playMethodIndex = jsks_playMethod;
        var selectedBalls = [];

        if (jsks_playType == 0 || jsks_playType == 1 || jsks_playType == 3 || jsks_playType == 6) {
            $("#jsks_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(jsks_playType == 2 || jsks_playType == 5){
            if(jsks_playMethod == 4 || jsks_playMethod == 9){
                $("#jsks_ballView div.ballView").each(function(){
                    $(this).find("span.redBalls_active").each(function(){
                        selectedBalls.push($(this).text());
                    });
                });
                submitParams.nums = selectedBalls.join(",");
            }else{
                if(parseInt($('#jsks_zhushu').html())<2){
                    toastUtils.showToast('胆拖至少选择2注');
                    return;
                }
                $("#jsks_ballView div.ballView").each(function(){
                    var arr = [];
                    $(this).find("span.redBalls_active").each(function(){
                        arr.push($(this).text());
                    });
                    selectedBalls.push(arr.join(","));
                });
                submitParams.nums = selectedBalls.join("#");
            }
        }else if(jsks_playType == 4) {
            if (jsks_playMethod == 7) {
                $("#jsks_ballView div.ballView").each(function () {
                    var arr = [];
                    $(this).find("span.redBalls_active").each(function () {
                        arr.push($(this).text());
                    });
                    selectedBalls.push(arr.join(","));
                });
                submitParams.nums = selectedBalls.join("|");
            } else {
                $("#jsks_ballView div.ballView").each(function () {
                    $(this).find("span.redBalls_active").each(function () {
                        selectedBalls.push($(this).text());
                    });
                });
                submitParams.nums = selectedBalls.join(",");
            }
        }
        localStorageUtils.setParam("playMode",$("#jsks_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#jsks_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#jsks_fandian").val());
        submitParams.notes = $('#jsks_zhushu').html();
        submitParams.sntuo = jsks_sntuo;
        submitParams.multiple = $('#jsks_beiNum').val();  //requirement
        submitParams.rebates = $('#jsks_fandian').val();  //requirement
        submitParams.playMode = $('#jsks_modeId').val();  //requirement
        submitParams.money = $('#jsks_money').html();  //requirement
        submitParams.award = $('#jsks_minAward').html();  //奖金
        submitParams.maxAward = $('#jsks_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#jsks_ballView").empty();
        jsks_qingkongAll();
    });
}