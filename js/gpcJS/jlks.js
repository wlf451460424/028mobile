//定义快3玩法标识
var jlks_playType = 0;
var jlks_playMethod = 0;
var jlks_sntuo = 0;
var jlks_rebate;
var jlksScroll;

//进入这个页面时调用
function jlksPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("jlks")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("jlks_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function jlksPageUnloadedPanel(){
    $("#jlksPage_back").off('click');
    $("#jlks_queding").off('click');
    $("#jlks_ballView").empty();
    $("#jlksSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="jlksPlaySelect"></select>');
    $("#jlksSelect").append($select);
}

//入口函数
function jlks_init(){
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
    $("#jlks_title").html(LotteryInfo.getLotteryNameByTag("jlks"));
    for(var i = 0; i< LotteryInfo.getPlayLength("k3");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("k3",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("k3");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("k3",j) == LotteryInfo.getPlayTypeId("k3",i)){
                var name = LotteryInfo.getMethodName("k3",j);
                if(i == jlks_playType && j == jlks_playMethod){
                    $play.append('<option value="jlks'+LotteryInfo.getMethodIndex("k3",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="jlks'+LotteryInfo.getMethodIndex("k3",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(jlks_playMethod,onShowArray)>-1 ){
						jlks_playType = i;
						jlks_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#jlksPlaySelect").append($play);
		}
    }
    
    if($("#jlksPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("jlksSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:jlksChangeItem
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

    GetLotteryInfo("jlks",function (){
        jlksChangeItem("jlks"+jlks_playMethod);
    });

    //添加滑动条
    if(!jlksScroll){
        jlksScroll = new IScroll('#jlksContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("jlks",LotteryInfo.getLotteryIdByTag("jlks"));

    //获取上一期开奖
    queryLastPrize("jlks");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('jlks');

    //返回
    $("#jlksPage_back").on('click', function(event) {
        // jlks_playType = 0;
        // jlks_playMethod = 0;
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        $("#jlks_ballView").empty();
        jlks_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#jlks_shuoming").html(LotteryInfo.getMethodShuoming("k3",jlks_playMethod));
	//玩法说明
	$("#jlks_paly_shuoming").off('click');
	$("#jlks_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#jlks_shuoming").text());
	});

    //机选选号
    $("#jlks_random").on('click', function(event) {
        jlks_randomOne();
    });

    qingKong("jlks");//清空
    jlks_submitData();
}

function jlksResetPlayType(){
    jlks_playType = 0;
    jlks_playMethod = 0;
}

function jlksChangeItem(val) {
    jlks_qingkongAll();
    var temp = val.substring("jlks".length,val.length);
    if(val == "jlks0"){
        $("#jlks_random").show();
        jlks_sntuo = 0;
        jlks_playType = 0;
        jlks_playMethod = 0;
        createSumLayout("jlks",3,18,function(){
            jlks_calcNotes();
        });
    }else if(val == "jlks1"){
        //和值大小单双
        $("#jlks_random").show();
        var num = ["大","小","单","双"];
        jlks_sntuo = 0;
        jlks_playType = 0;
        jlks_playMethod = 1;
        createNonNumLayout("jlks",jlks_playMethod,num,function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks2"){
        $("#jlks_random").show();
        var num = ["111","222","333","444","555","666"];
        jlks_sntuo = 0;
        jlks_playType = 1;
        jlks_playMethod = 2;
        createNonNumLayout("jlks",jlks_playMethod,num,function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks3"){
        $("#jlks_random").hide();
        var num = ["111","222","333","444","555","666"];
        jlks_sntuo = 0;
        jlks_playType = 1;
        jlks_playMethod = 3;
        createTongXuanLayout("jlks",num,function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks4"){
        $("#jlks_random").show();
        jlks_sntuo = 0;
        jlks_playType = 2;
        jlks_playMethod = 4;
        createOneLineLayout("jlks","请至少选择3个",1,6,false,function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks5"){
        $("#jlks_random").hide();
        jlks_sntuo = 1;
        jlks_playType = 2;
        jlks_playMethod = 5;
        createDanTuoSpecLayout("jlks",2,1,5,1,6,false,function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks6"){
        $("#jlks_random").hide();
        jlks_sntuo = 0;
        jlks_playType = 3;
        jlks_playMethod = 6;
        var num = ["123","234","345","456"];
        createTongXuanLayout("jlks",num,function(){
            jlks_calcNotes();
        });
    }else if(val == "jlks7"){
        $("#jlks_random").hide();
        jlks_sntuo = 0;
        jlks_playType = 4;
        jlks_playMethod = 7;
        createErTongHaoLayout("jlks",function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks8"){
        $("#jlks_random").show();
        jlks_sntuo = 0;
        jlks_playType = 4;
        jlks_playMethod = 8;
        var num = ["11*","22*","33*","44*","55*","66*"];
        createNonNumLayout("jlks",jlks_playMethod,num,function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks9"){
        $("#jlks_random").show();
        jlks_sntuo = 0;
        jlks_playType = 5;
        jlks_playMethod = 9;
        createOneLineLayout("jlks","请至少选择2个",1,6,false,function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks10"){
        $("#jlks_random").hide();
        jlks_sntuo = 1;
        jlks_playType = 5;
        jlks_playMethod = 10;
        createDanTuoSpecLayout("jlks",1,1,5,1,6,false,function(){
            jlks_calcNotes();
        });
        jlks_qingkongAll();
    }else if(val == "jlks11"){
        $("#jlks_random").show();
        jlks_sntuo = 0;
        jlks_playType = 6;
        jlks_playMethod = 11;
        createOneLineLayout("jlks","请至少选择1个",1,6,false,function(){
            jlks_calcNotes();
        });
    }

    if (jlksScroll){
        jlksScroll.refresh();
        jlksScroll.scrollTo(0,0,1);
    }
    
    $("#jlks_shuoming").html(LotteryInfo.getMethodShuoming("k3",temp));
    
    initFooterData("jlks",temp);
    hideRandomWhenLi("jlks",jlks_sntuo,jlks_playMethod);
    jlks_calcNotes();
}

/**
 * [jlks_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function jlks_initFooterButton(){
    if(jlks_playMethod == 5 || jlks_playMethod == 7 || jlks_playMethod == 10){
        if (LotteryStorage["jlks"]["line1"].length > 0 || LotteryStorage["jlks"]["line2"].length > 0) {
            $("#jlks_qingkong").css("opacity",1.0);
        }else{
            $("#jlks_qingkong").css("opacity",0.4);
        }
    }else{
        if (LotteryStorage["jlks"]["line1"].length > 0) {
            $("#jlks_qingkong").css("opacity",1.0);
        }else{
            $("#jlks_qingkong").css("opacity",0.4);
        }
    }

    if($('#jlks_zhushu').html() > 0){
        $("#jlks_queding").css("opacity",1.0);
    }else{
        $("#jlks_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function jlks_qingkongAll(){
    $("#jlks_ballView span").removeClass('redBalls_active');
    LotteryStorage["jlks"]["line1"] = [];
    LotteryStorage["jlks"]["line2"] = [];
    localStorageUtils.removeParam("jlks_line1");
    localStorageUtils.removeParam("jlks_line2");

    $('#jlks_zhushu').text(0);
    $('#jlks_money').text(0);
    clearAwardWin("jlks");
    jlks_initFooterButton();
}

/**
 * [jlks_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function jlks_calcNotes(){
	$('#jlks_modeId').blur();
	$('#jlks_fandian').blur();
	
    var notes = 0;

    if(jlks_playMethod == 0 || jlks_playMethod == 2 || jlks_playMethod == 8 || jlks_playMethod == 11){
        notes = LotteryStorage["jlks"]["line1"].length;
    }else if(jlks_playMethod == 1 || jlks_playMethod == 3 || jlks_playMethod == 6){
        notes = LotteryStorage["jlks"]["line1"].length;
    }else if(jlks_playMethod == 4){
        notes = mathUtil.getCCombination(LotteryStorage["jlks"]["line1"].length,3);
    }else if(jlks_playMethod == 5){
        if(LotteryStorage["jlks"]["line1"].length == 0 || LotteryStorage["jlks"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["jlks"]["line2"].length,3-LotteryStorage["jlks"]["line1"].length);
        }
    }else if(jlks_playMethod == 7){
        notes = LotteryStorage["jlks"]["line2"].length * LotteryStorage["jlks"]["line1"].length;
    }else if(jlks_playMethod == 9){
        notes = mathUtil.getCCombination(LotteryStorage["jlks"]["line1"].length,2);
    }else if(jlks_playMethod == 10){
        if(LotteryStorage["jlks"]["line1"].length == 0 || LotteryStorage["jlks"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["jlks"]["line2"].length,2-LotteryStorage["jlks"]["line1"].length);
        }
    }

    hideRandomWhenLi("jlks",jlks_sntuo,jlks_playMethod);

    //验证是否为空
    if( $("#jlks_beiNum").val() =="" || parseInt($("#jlks_beiNum").val()) == 0){
        $("#jlks_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#jlks_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#jlks_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#jlks_zhushu').text(notes);
        if($("#jlks_modeId").val() == "8"){
            $('#jlks_money').text(bigNumberUtil.multiply(notes * parseInt($("#jlks_beiNum").val()),0.002));
        }else if ($("#jlks_modeId").val() == "2"){
            $('#jlks_money').text(bigNumberUtil.multiply(notes * parseInt($("#jlks_beiNum").val()),0.2));
        }else if ($("#jlks_modeId").val() == "1"){
            $('#jlks_money').text(bigNumberUtil.multiply(notes * parseInt($("#jlks_beiNum").val()),0.02));
        }else{
            $('#jlks_money').text(bigNumberUtil.multiply(notes * parseInt($("#jlks_beiNum").val()),2));
        }

    } else {
        $('#jlks_zhushu').text(0);
        $('#jlks_money').text(0);
    }
    jlks_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('jlks',jlks_playMethod);
}

/**
 * [jlks_randomOne 随机一注]
 * @return {[type]} [description]
 */
function jlks_randomOne(){
    jlks_qingkongAll();
    if(jlks_playMethod == 0){
        var number = mathUtil.getRandomNum(3,19);
        LotteryStorage["jlks"]["line1"].push(number+"");

        $.each(LotteryStorage["jlks"]["line1"], function(k, v){
            $("#" + "jlks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jlks_playMethod == 1){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["jlks"]["line1"].push(number+"");
        $.each(LotteryStorage["jlks"]["line1"], function(k, v){
            $("#" + "jlks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jlks_playMethod == 2 || jlks_playMethod == 8){
        var number = mathUtil.getRandomNum(0,6);
        LotteryStorage["jlks"]["line1"].push(number+"");

        $.each(LotteryStorage["jlks"]["line1"], function(k, v){
            $("#" + "jlks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jlks_playMethod == 5){
        var number = mathUtil.getRandomNum(1,7);
        LotteryStorage["jlks"]["line1"].push(number+"");

        $.each(LotteryStorage["jlks"]["line1"], function(k, v){
            $("#" + "jlks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jlks_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["jlks"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["jlks"]["line1"], function(k, v){
            $("#" + "jlks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jlks_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["jlks"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["jlks"]["line1"], function(k, v){
            $("#" + "jlks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jlks_playMethod == 11){
        var number = mathUtil.getRandomNum(1,7);
        LotteryStorage["jlks"]["line1"].push(number+"");

        $.each(LotteryStorage["jlks"]["line1"], function(k, v){
            $("#" + "jlks_line1" + v).toggleClass("redBalls_active");
        });
    }
    jlks_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function jlks_checkOutRandom(playMethod){
    var obj = new Object();
    if(jlks_playMethod == 0){
        var number = mathUtil.getRandomNum(3,19);
        obj.nums = number;
        obj.notes = 1;
    }else if(jlks_playMethod == 1){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(jlks_playMethod == 2){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number + "" + number + "" + number;
        obj.notes = 1;
    }else if(jlks_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jlks_playMethod == 8){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number + "" + number +"*";
        obj.notes = 1;
    }else if(jlks_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jlks_playMethod == 11){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number;
        obj.notes = 1;
    }
    obj.sntuo = jlks_sntuo;
    obj.multiple = 1;
    obj.rebates = jlks_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('jlks',jlks_playMethod,obj);  //机选奖金计算
    obj.award = $('#jlks_minAward').html();     //奖金
    obj.maxAward = $('#jlks_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [jlks_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function jlks_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#jlks_queding").bind('click', function(event) {
        jlks_rebate = $("#jlks_fandian option:last").val();
        if(parseInt($('#jlks_zhushu').html()) <= 0 || Number($("#jlks_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        jlks_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#jlks_modeId').val()) == 8){
            if (Number($('#jlks_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('jlks',jlks_playMethod);

        submitParams.lotteryType = "jlks";
        var playType = LotteryInfo.getPlayName("k3",jlks_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("k3",jlks_playMethod);
        submitParams.playTypeIndex = jlks_playType;
        submitParams.playMethodIndex = jlks_playMethod;
        var selectedBalls = [];

        if (jlks_playType == 0 || jlks_playType == 1 || jlks_playType == 3 || jlks_playType == 6) {
            $("#jlks_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(jlks_playType == 2 || jlks_playType == 5){
            if(jlks_playMethod == 4 || jlks_playMethod == 9){
                $("#jlks_ballView div.ballView").each(function(){
                    $(this).find("span.redBalls_active").each(function(){
                        selectedBalls.push($(this).text());
                    });
                });
                submitParams.nums = selectedBalls.join(",");
            }else{
                if(parseInt($('#jlks_zhushu').html())<2){
                    toastUtils.showToast('胆拖至少选择2注');
                    return;
                }
                $("#jlks_ballView div.ballView").each(function(){
                    var arr = [];
                    $(this).find("span.redBalls_active").each(function(){
                        arr.push($(this).text());
                    });
                    selectedBalls.push(arr.join(","));
                });
                submitParams.nums = selectedBalls.join("#");
            }
        }else if(jlks_playType == 4) {
            if (jlks_playMethod == 7) {
                $("#jlks_ballView div.ballView").each(function () {
                    var arr = [];
                    $(this).find("span.redBalls_active").each(function () {
                        arr.push($(this).text());
                    });
                    selectedBalls.push(arr.join(","));
                });
                submitParams.nums = selectedBalls.join("|");
            } else {
                $("#jlks_ballView div.ballView").each(function () {
                    $(this).find("span.redBalls_active").each(function () {
                        selectedBalls.push($(this).text());
                    });
                });
                submitParams.nums = selectedBalls.join(",");
            }
        }
        localStorageUtils.setParam("playMode",$("#jlks_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#jlks_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#jlks_fandian").val());
        submitParams.notes = $('#jlks_zhushu').html();
        submitParams.sntuo = jlks_sntuo;
        submitParams.multiple = $('#jlks_beiNum').val();  //requirement
        submitParams.rebates = $('#jlks_fandian').val();  //requirement
        submitParams.playMode = $('#jlks_modeId').val();  //requirement
        submitParams.money = $('#jlks_money').html();  //requirement
        submitParams.award = $('#jlks_minAward').html();  //奖金
        submitParams.maxAward = $('#jlks_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#jlks_ballView").empty();
        jlks_qingkongAll();
    });
}