//定义快3玩法标识
var ahks_playType = 0;
var ahks_playMethod = 0;
var ahks_sntuo = 0;
var ahks_rebate;
var ahksScroll;

//进入这个页面时调用
function ahksPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("ahks")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("ahks_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function ahksPageUnloadedPanel(){
    $("#ahksPage_back").off('click');
    $("#ahks_queding").off('click');
    $("#ahks_ballView").empty();
    $("#ahksSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="ahksPlaySelect"></select>');
    $("#ahksSelect").append($select);
}

//入口函数
function ahks_init(){
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
    $("#ahks_title").html(LotteryInfo.getLotteryNameByTag("ahks"));
    for(var i = 0; i< LotteryInfo.getPlayLength("k3");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("k3",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("k3");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("k3",j) == LotteryInfo.getPlayTypeId("k3",i)){
                var name = LotteryInfo.getMethodName("k3",j);
                if(i == ahks_playType && j == ahks_playMethod){
                    $play.append('<option value="ahks'+LotteryInfo.getMethodIndex("k3",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="ahks'+LotteryInfo.getMethodIndex("k3",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(ahks_playMethod,onShowArray)>-1 ){
						ahks_playType = i;
						ahks_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#ahksPlaySelect").append($play);
		}
    }
    
    if($("#ahksPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("ahksSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:ahksChangeItem
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

    GetLotteryInfo("ahks",function (){
        ahksChangeItem("ahks"+ahks_playMethod);
    });

    //添加滑动条
    if(!ahksScroll){
        ahksScroll = new IScroll('#ahksContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("ahks",LotteryInfo.getLotteryIdByTag("ahks"));

    //获取上一期开奖
    queryLastPrize("ahks");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('ahks');

    //返回
    $("#ahksPage_back").on('click', function(event) {
        // ahks_playType = 0;
        // ahks_playMethod = 0;
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        $("#ahks_ballView").empty();
        ahks_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    //机选选号
    $("#ahks_random").on('click', function(event) {
        ahks_randomOne();
    });
    
    $("#ahks_shuoming").html(LotteryInfo.getMethodShuoming("k3",ahks_playMethod));
	//玩法说明
	$("#ahks_paly_shuoming").off('click');
	$("#ahks_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#ahks_shuoming").text());
	});

    qingKong("ahks");//清空
    ahks_submitData();
}

function ahksResetPlayType(){
    ahks_playType = 0;
    ahks_playMethod = 0;
}

function ahksChangeItem(val) {
    ahks_qingkongAll();
    var temp = val.substring("ahks".length,val.length);
    if(val == "ahks0"){
        $("#ahks_random").show();
        ahks_sntuo = 0;
        ahks_playType = 0;
        ahks_playMethod = 0;
        createSumLayout("ahks",3,18,function(){
            ahks_calcNotes();
        });
    }else if(val == "ahks1"){
        //和值大小单双
        $("#ahks_random").show();
        var num = ["大","小","单","双"];
        ahks_sntuo = 0;
        ahks_playType = 0;
        ahks_playMethod = 1;
        createNonNumLayout("ahks",ahks_playMethod,num,function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks2"){
        $("#ahks_random").show();
        var num = ["111","222","333","444","555","666"];
        ahks_sntuo = 0;
        ahks_playType = 1;
        ahks_playMethod = 2;
        createNonNumLayout("ahks",ahks_playMethod,num,function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks3"){
        $("#ahks_random").hide();
        var num = ["111","222","333","444","555","666"];
        ahks_sntuo = 0;
        ahks_playType = 1;
        ahks_playMethod = 3;
        createTongXuanLayout("ahks",num,function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks4"){
        $("#ahks_random").show();
        ahks_sntuo = 0;
        ahks_playType = 2;
        ahks_playMethod = 4;
        createOneLineLayout("ahks","请至少选择3个",1,6,false,function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks5"){
        $("#ahks_random").hide();
        ahks_sntuo = 1;
        ahks_playType = 2;
        ahks_playMethod = 5;
        createDanTuoSpecLayout("ahks",2,1,5,1,6,false,function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks6"){
        $("#ahks_random").hide();
        ahks_sntuo = 0;
        ahks_playType = 3;
        ahks_playMethod = 6;
        var num = ["123","234","345","456"];
        createTongXuanLayout("ahks",num,function(){
            ahks_calcNotes();
        });
    }else if(val == "ahks7"){
        $("#ahks_random").hide();
        ahks_sntuo = 0;
        ahks_playType = 4;
        ahks_playMethod = 7;
        createErTongHaoLayout("ahks",function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks8"){
        $("#ahks_random").show();
        ahks_sntuo = 0;
        ahks_playType = 4;
        ahks_playMethod = 8;
        var num = ["11*","22*","33*","44*","55*","66*"];
        createNonNumLayout("ahks",ahks_playMethod,num,function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks9"){
        $("#ahks_random").show();
        ahks_sntuo = 0;
        ahks_playType = 5;
        ahks_playMethod = 9;
        createOneLineLayout("ahks","请至少选择2个",1,6,false,function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks10"){
        $("#ahks_random").hide();
        ahks_sntuo = 1;
        ahks_playType = 5;
        ahks_playMethod = 10;
        createDanTuoSpecLayout("ahks",1,1,5,1,6,false,function(){
            ahks_calcNotes();
        });
        ahks_qingkongAll();
    }else if(val == "ahks11"){
        $("#ahks_random").show();
        ahks_sntuo = 0;
        ahks_playType = 6;
        ahks_playMethod = 11;
        createOneLineLayout("ahks","请至少选择1个",1,6,false,function(){
            ahks_calcNotes();
        });
    }

    if (ahksScroll){
        ahksScroll.refresh();
        ahksScroll.scrollTo(0,0,1);
    }
    
    $("#ahks_shuoming").html(LotteryInfo.getMethodShuoming("k3",temp));
    
    initFooterData("ahks",temp);
    hideRandomWhenLi("ahks",ahks_sntuo,ahks_playMethod);
    ahks_calcNotes();
}

/**
 * [ahks_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function ahks_initFooterButton(){
    if(ahks_playMethod == 5 || ahks_playMethod == 7 || ahks_playMethod == 10){
        if (LotteryStorage["ahks"]["line1"].length > 0 || LotteryStorage["ahks"]["line2"].length > 0) {
            $("#ahks_qingkong").css("opacity",1.0);
        }else{
            $("#ahks_qingkong").css("opacity",0.4);
        }
    }else{
        if (LotteryStorage["ahks"]["line1"].length > 0) {
            $("#ahks_qingkong").css("opacity",1.0);
        }else{
            $("#ahks_qingkong").css("opacity",0.4);
        }
    }

    if($('#ahks_zhushu').html() > 0){
        $("#ahks_queding").css("opacity",1.0);
    }else{
        $("#ahks_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function ahks_qingkongAll(){
    $("#ahks_ballView span").removeClass('redBalls_active');
    LotteryStorage["ahks"]["line1"] = [];
    LotteryStorage["ahks"]["line2"] = [];
    localStorageUtils.removeParam("ahks_line1");
    localStorageUtils.removeParam("ahks_line2");

    $('#ahks_zhushu').text(0);
    $('#ahks_money').text(0);
    clearAwardWin("ahks");
    ahks_initFooterButton();
}

/**
 * [ahks_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function ahks_calcNotes(){
	$('#ahks_modeId').blur();
	$('#ahks_fandian').blur();

    var notes = 0;

    if(ahks_playMethod == 0 || ahks_playMethod == 2 || ahks_playMethod == 8 || ahks_playMethod == 11){
        notes = LotteryStorage["ahks"]["line1"].length;
    }else if(ahks_playMethod == 1 || ahks_playMethod == 3 || ahks_playMethod == 6){
        notes = LotteryStorage["ahks"]["line1"].length;
    }else if(ahks_playMethod == 4){
        notes = mathUtil.getCCombination(LotteryStorage["ahks"]["line1"].length,3);
    }else if(ahks_playMethod == 5){
        if(LotteryStorage["ahks"]["line1"].length == 0 || LotteryStorage["ahks"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["ahks"]["line2"].length,3-LotteryStorage["ahks"]["line1"].length);
        }
    }else if(ahks_playMethod == 7){
        notes = LotteryStorage["ahks"]["line2"].length * LotteryStorage["ahks"]["line1"].length;
    }else if(ahks_playMethod == 9){
        notes = mathUtil.getCCombination(LotteryStorage["ahks"]["line1"].length,2);
    }else if(ahks_playMethod == 10){
        if(LotteryStorage["ahks"]["line1"].length == 0 || LotteryStorage["ahks"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["ahks"]["line2"].length,2-LotteryStorage["ahks"]["line1"].length);
        }
    }

    hideRandomWhenLi("ahks",ahks_sntuo,ahks_playMethod);

    //验证是否为空
    if( $("#ahks_beiNum").val() =="" || parseInt($("#ahks_beiNum").val()) == 0){
        $("#ahks_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#ahks_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#ahks_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#ahks_zhushu').text(notes);
        if($("#ahks_modeId").val() == "8"){
            $('#ahks_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahks_beiNum").val()),0.002));
        }else if ($("#ahks_modeId").val() == "2"){
            $('#ahks_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahks_beiNum").val()),0.2));
        }else if ($("#ahks_modeId").val() == "1"){
            $('#ahks_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahks_beiNum").val()),0.02));
        }else{
            $('#ahks_money').text(bigNumberUtil.multiply(notes * parseInt($("#ahks_beiNum").val()),2));
        }

    } else {
        $('#ahks_zhushu').text(0);
        $('#ahks_money').text(0);
    }
    ahks_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('ahks',ahks_playMethod);
}

/**
 * [ahks_randomOne 随机一注]
 * @return {[type]} [description]
 */
function ahks_randomOne(){
    ahks_qingkongAll();
    if(ahks_playMethod == 0){
        var number = mathUtil.getRandomNum(3,19);
        LotteryStorage["ahks"]["line1"].push(number+"");

        $.each(LotteryStorage["ahks"]["line1"], function(k, v){
            $("#" + "ahks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ahks_playMethod == 1){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["ahks"]["line1"].push(number+"");
        $.each(LotteryStorage["ahks"]["line1"], function(k, v){
            $("#" + "ahks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ahks_playMethod == 2 || ahks_playMethod == 8){
        var number = mathUtil.getRandomNum(0,6);
        LotteryStorage["ahks"]["line1"].push(number+"");

        $.each(LotteryStorage["ahks"]["line1"], function(k, v){
            $("#" + "ahks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ahks_playMethod == 5){
        var number = mathUtil.getRandomNum(1,7);
        LotteryStorage["ahks"]["line1"].push(number+"");

        $.each(LotteryStorage["ahks"]["line1"], function(k, v){
            $("#" + "ahks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ahks_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["ahks"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["ahks"]["line1"], function(k, v){
            $("#" + "ahks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ahks_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["ahks"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["ahks"]["line1"], function(k, v){
            $("#" + "ahks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ahks_playMethod == 11){
        var number = mathUtil.getRandomNum(1,7);
        LotteryStorage["ahks"]["line1"].push(number+"");

        $.each(LotteryStorage["ahks"]["line1"], function(k, v){
            $("#" + "ahks_line1" + v).toggleClass("redBalls_active");
        });
    }
    ahks_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function ahks_checkOutRandom(playMethod){
    var obj = new Object();
    if(ahks_playMethod == 0){
        var number = mathUtil.getRandomNum(3,19);
        obj.nums = number;
        obj.notes = 1;
    }else if(ahks_playMethod == 1){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(ahks_playMethod == 2){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number + "" + number + "" + number;
        obj.notes = 1;
    }else if(ahks_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(ahks_playMethod == 8){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number + "" + number +"*";
        obj.notes = 1;
    }else if(ahks_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(ahks_playMethod == 11){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number;
        obj.notes = 1;
    }
    obj.sntuo = ahks_sntuo;
    obj.multiple = 1;
    obj.rebates = ahks_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('ahks',ahks_playMethod,obj);  //机选奖金计算
    obj.award = $('#ahks_minAward').html();     //奖金
    obj.maxAward = $('#ahks_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [ahks_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function ahks_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#ahks_queding").bind('click', function(event) {
        ahks_rebate = $("#ahks_fandian option:last").val();
        if(parseInt($('#ahks_zhushu').html()) <= 0 || Number($("#ahks_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        ahks_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#ahks_modeId').val()) == 8){
            if (Number($('#ahks_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('ahks',ahks_playMethod);

        submitParams.lotteryType = "ahks";
        var playType = LotteryInfo.getPlayName("k3",ahks_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("k3",ahks_playMethod);
        submitParams.playTypeIndex = ahks_playType;
        submitParams.playMethodIndex = ahks_playMethod;
        var selectedBalls = [];

        if (ahks_playType == 0 || ahks_playType == 1 || ahks_playType == 3 || ahks_playType == 6) {
            $("#ahks_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(ahks_playType == 2 || ahks_playType == 5){
            if(ahks_playMethod == 4 || ahks_playMethod == 9){
                $("#ahks_ballView div.ballView").each(function(){
                    $(this).find("span.redBalls_active").each(function(){
                        selectedBalls.push($(this).text());
                    });
                });
                submitParams.nums = selectedBalls.join(",");
            }else{
                if(parseInt($('#ahks_zhushu').html())<2){
                    toastUtils.showToast('胆拖至少选择2注');
                    return;
                }
                $("#ahks_ballView div.ballView").each(function(){
                    var arr = [];
                    $(this).find("span.redBalls_active").each(function(){
                        arr.push($(this).text());
                    });
                    selectedBalls.push(arr.join(","));
                });
                submitParams.nums = selectedBalls.join("#");
            }
        }else if(ahks_playType == 4) {
            if (ahks_playMethod == 7) {
                $("#ahks_ballView div.ballView").each(function () {
                    var arr = [];
                    $(this).find("span.redBalls_active").each(function () {
                        arr.push($(this).text());
                    });
                    selectedBalls.push(arr.join(","));
                });
                submitParams.nums = selectedBalls.join("|");
            } else {
                $("#ahks_ballView div.ballView").each(function () {
                    $(this).find("span.redBalls_active").each(function () {
                        selectedBalls.push($(this).text());
                    });
                });
                submitParams.nums = selectedBalls.join(",");
            }
        }
        localStorageUtils.setParam("playMode",$("#ahks_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#ahks_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#ahks_fandian").val());
        submitParams.notes = $('#ahks_zhushu').html();
        submitParams.sntuo = ahks_sntuo;
        submitParams.multiple = $('#ahks_beiNum').val();  //requirement
        submitParams.rebates = $('#ahks_fandian').val();  //requirement
        submitParams.playMode = $('#ahks_modeId').val();  //requirement
        submitParams.money = $('#ahks_money').html();  //requirement
        submitParams.award = $('#ahks_minAward').html();  //奖金
        submitParams.maxAward = $('#ahks_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#ahks_ballView").empty();
        ahks_qingkongAll();
    });
}