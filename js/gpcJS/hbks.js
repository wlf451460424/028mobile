//定义快3玩法标识
var hbks_playType = 0;
var hbks_playMethod = 0;
var hbks_sntuo = 0;
var hbks_rebate;
var hbksScroll;

//进入这个页面时调用
function hbksPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hbks")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hbks_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hbksPageUnloadedPanel(){
    $("#hbksPage_back").off('click');
    $("#hbks_queding").off('click');
    $("#hbks_ballView").empty();
    $("#hbksSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="hbksPlaySelect"></select>');
    $("#hbksSelect").append($select);
}

//入口函数
function hbks_init(){
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
    $("#hbks_title").html(LotteryInfo.getLotteryNameByTag("hbks"));
    for(var i = 0; i< LotteryInfo.getPlayLength("k3");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("k3",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("k3");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("k3",j) == LotteryInfo.getPlayTypeId("k3",i)){
                var name = LotteryInfo.getMethodName("k3",j);
                if(i == hbks_playType && j == hbks_playMethod){
                    $play.append('<option value="hbks'+LotteryInfo.getMethodIndex("k3",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="hbks'+LotteryInfo.getMethodIndex("k3",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hbks_playMethod,onShowArray)>-1 ){
						hbks_playType = i;
						hbks_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hbksPlaySelect").append($play);
		}
    }
    
    if($("#hbksPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("hbksSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:hbksChangeItem
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

    GetLotteryInfo("hbks",function (){
        hbksChangeItem("hbks"+hbks_playMethod);
    });

    //添加滑动条
    if(!hbksScroll){
        hbksScroll = new IScroll('#hbksContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("hbks",LotteryInfo.getLotteryIdByTag("hbks"));

    //获取上一期开奖
    queryLastPrize("hbks");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('hbks');

    //返回
    $("#hbksPage_back").on('click', function(event) {
        // hbks_playType = 0;
        // hbks_playMethod = 0;
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        $("#hbks_ballView").empty();
        hbks_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    //机选选号
    $("#hbks_random").on('click', function(event) {
        hbks_randomOne();
    });
    
    $("#hbks_shuoming").html(LotteryInfo.getMethodShuoming("k3",hbks_playMethod));
	//玩法说明
	$("#hbks_paly_shuoming").off('click');
	$("#hbks_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hbks_shuoming").text());
	});

    qingKong("hbks");//清空
    hbks_submitData();
}

function hbksResetPlayType(){
    hbks_playType = 0;
    hbks_playMethod = 0;
}

function hbksChangeItem(val) {
    hbks_qingkongAll();
    var temp = val.substring("hbks".length,val.length);
    if(val == "hbks0"){
        $("#hbks_random").show();
        hbks_sntuo = 0;
        hbks_playType = 0;
        hbks_playMethod = 0;
        createSumLayout("hbks",3,18,function(){
            hbks_calcNotes();
        });
    }else if(val == "hbks1"){
        //和值大小单双
        $("#hbks_random").show();
        var num = ["大","小","单","双"];
        hbks_sntuo = 0;
        hbks_playType = 0;
        hbks_playMethod = 1;
        createNonNumLayout("hbks",hbks_playMethod,num,function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks2"){
        $("#hbks_random").show();
        var num = ["111","222","333","444","555","666"];
        hbks_sntuo = 0;
        hbks_playType = 1;
        hbks_playMethod = 2;
        createNonNumLayout("hbks",hbks_playMethod,num,function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks3"){
        $("#hbks_random").hide();
        var num = ["111","222","333","444","555","666"];
        hbks_sntuo = 0;
        hbks_playType = 1;
        hbks_playMethod = 3;
        createTongXuanLayout("hbks",num,function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks4"){
        $("#hbks_random").show();
        hbks_sntuo = 0;
        hbks_playType = 2;
        hbks_playMethod = 4;
        createOneLineLayout("hbks","请至少选择3个",1,6,false,function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks5"){
        $("#hbks_random").hide();
        hbks_sntuo = 1;
        hbks_playType = 2;
        hbks_playMethod = 5;
        createDanTuoSpecLayout("hbks",2,1,5,1,6,false,function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks6"){
        $("#hbks_random").hide();
        hbks_sntuo = 0;
        hbks_playType = 3;
        hbks_playMethod = 6;
        var num = ["123","234","345","456"];
        createTongXuanLayout("hbks",num,function(){
            hbks_calcNotes();
        });
    }else if(val == "hbks7"){
        $("#hbks_random").hide();
        hbks_sntuo = 0;
        hbks_playType = 4;
        hbks_playMethod = 7;
        createErTongHaoLayout("hbks",function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks8"){
        $("#hbks_random").show();
        hbks_sntuo = 0;
        hbks_playType = 4;
        hbks_playMethod = 8;
        var num = ["11*","22*","33*","44*","55*","66*"];
        createNonNumLayout("hbks",hbks_playMethod,num,function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks9"){
        $("#hbks_random").show();
        hbks_sntuo = 0;
        hbks_playType = 5;
        hbks_playMethod = 9;
        createOneLineLayout("hbks","请至少选择2个",1,6,false,function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks10"){
        $("#hbks_random").hide();
        hbks_sntuo = 1;
        hbks_playType = 5;
        hbks_playMethod = 10;
        createDanTuoSpecLayout("hbks",1,1,5,1,6,false,function(){
            hbks_calcNotes();
        });
        hbks_qingkongAll();
    }else if(val == "hbks11"){
        $("#hbks_random").show();
        hbks_sntuo = 0;
        hbks_playType = 6;
        hbks_playMethod = 11;
        createOneLineLayout("hbks","请至少选择1个",1,6,false,function(){
            hbks_calcNotes();
        });
    }

    if (hbksScroll){
        hbksScroll.refresh();
        hbksScroll.scrollTo(0,0,1);
    }
    
    $("#hbks_shuoming").html(LotteryInfo.getMethodShuoming("k3",temp));
    
    initFooterData("hbks",temp);
    hideRandomWhenLi("hbks",hbks_sntuo,hbks_playMethod);
    hbks_calcNotes();
}

/**
 * [hbks_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hbks_initFooterButton(){
    if(hbks_playMethod == 5 || hbks_playMethod == 7 || hbks_playMethod == 10){
        if (LotteryStorage["hbks"]["line1"].length > 0 || LotteryStorage["hbks"]["line2"].length > 0) {
            $("#hbks_qingkong").css("opacity",1.0);
        }else{
            $("#hbks_qingkong").css("opacity",0.4);
        }
    }else{
        if (LotteryStorage["hbks"]["line1"].length > 0) {
            $("#hbks_qingkong").css("opacity",1.0);
        }else{
            $("#hbks_qingkong").css("opacity",0.4);
        }
    }

    if($('#hbks_zhushu').html() > 0){
        $("#hbks_queding").css("opacity",1.0);
    }else{
        $("#hbks_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function hbks_qingkongAll(){
    $("#hbks_ballView span").removeClass('redBalls_active');
    LotteryStorage["hbks"]["line1"] = [];
    LotteryStorage["hbks"]["line2"] = [];
    localStorageUtils.removeParam("hbks_line1");
    localStorageUtils.removeParam("hbks_line2");

    $('#hbks_zhushu').text(0);
    $('#hbks_money').text(0);
    clearAwardWin("hbks");
    hbks_initFooterButton();
}

/**
 * [hbks_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hbks_calcNotes(){
	$('#hbks_modeId').blur();
	$('#hbks_fandian').blur();
	
    var notes = 0;

    if(hbks_playMethod == 0 || hbks_playMethod == 2 || hbks_playMethod == 8 || hbks_playMethod == 11){
        notes = LotteryStorage["hbks"]["line1"].length;
    }else if(hbks_playMethod == 1 || hbks_playMethod == 3 || hbks_playMethod == 6){
        notes = LotteryStorage["hbks"]["line1"].length;
    }else if(hbks_playMethod == 4){
        notes = mathUtil.getCCombination(LotteryStorage["hbks"]["line1"].length,3);
    }else if(hbks_playMethod == 5){
        if(LotteryStorage["hbks"]["line1"].length == 0 || LotteryStorage["hbks"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["hbks"]["line2"].length,3-LotteryStorage["hbks"]["line1"].length);
        }
    }else if(hbks_playMethod == 7){
        notes = LotteryStorage["hbks"]["line2"].length * LotteryStorage["hbks"]["line1"].length;
    }else if(hbks_playMethod == 9){
        notes = mathUtil.getCCombination(LotteryStorage["hbks"]["line1"].length,2);
    }else if(hbks_playMethod == 10){
        if(LotteryStorage["hbks"]["line1"].length == 0 || LotteryStorage["hbks"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["hbks"]["line2"].length,2-LotteryStorage["hbks"]["line1"].length);
        }
    }

    hideRandomWhenLi("hbks",hbks_sntuo,hbks_playMethod);

    //验证是否为空
    if( $("#hbks_beiNum").val() =="" || parseInt($("#hbks_beiNum").val()) == 0){
        $("#hbks_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#hbks_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#hbks_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#hbks_zhushu').text(notes);
        if($("#hbks_modeId").val() == "8"){
            $('#hbks_money').text(bigNumberUtil.multiply(notes * parseInt($("#hbks_beiNum").val()),0.002));
        }else if ($("#hbks_modeId").val() == "2"){
            $('#hbks_money').text(bigNumberUtil.multiply(notes * parseInt($("#hbks_beiNum").val()),0.2));
        }else if ($("#hbks_modeId").val() == "1"){
            $('#hbks_money').text(bigNumberUtil.multiply(notes * parseInt($("#hbks_beiNum").val()),0.02));
        }else{
            $('#hbks_money').text(bigNumberUtil.multiply(notes * parseInt($("#hbks_beiNum").val()),2));
        }

    } else {
        $('#hbks_zhushu').text(0);
        $('#hbks_money').text(0);
    }
    hbks_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('hbks',hbks_playMethod);
}

/**
 * [hbks_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hbks_randomOne(){
    hbks_qingkongAll();
    if(hbks_playMethod == 0){
        var number = mathUtil.getRandomNum(3,19);
        LotteryStorage["hbks"]["line1"].push(number+"");

        $.each(LotteryStorage["hbks"]["line1"], function(k, v){
            $("#" + "hbks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hbks_playMethod == 1){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["hbks"]["line1"].push(number+"");
        $.each(LotteryStorage["hbks"]["line1"], function(k, v){
            $("#" + "hbks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hbks_playMethod == 2 || hbks_playMethod == 8){
        var number = mathUtil.getRandomNum(0,6);
        LotteryStorage["hbks"]["line1"].push(number+"");

        $.each(LotteryStorage["hbks"]["line1"], function(k, v){
            $("#" + "hbks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hbks_playMethod == 5){
        var number = mathUtil.getRandomNum(1,7);
        LotteryStorage["hbks"]["line1"].push(number+"");

        $.each(LotteryStorage["hbks"]["line1"], function(k, v){
            $("#" + "hbks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hbks_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["hbks"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["hbks"]["line1"], function(k, v){
            $("#" + "hbks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hbks_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["hbks"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["hbks"]["line1"], function(k, v){
            $("#" + "hbks_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hbks_playMethod == 11){
        var number = mathUtil.getRandomNum(1,7);
        LotteryStorage["hbks"]["line1"].push(number+"");

        $.each(LotteryStorage["hbks"]["line1"], function(k, v){
            $("#" + "hbks_line1" + v).toggleClass("redBalls_active");
        });
    }
    hbks_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hbks_checkOutRandom(playMethod){
    var obj = new Object();
    if(hbks_playMethod == 0){
        var number = mathUtil.getRandomNum(3,19);
        obj.nums = number;
        obj.notes = 1;
    }else if(hbks_playMethod == 1){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(hbks_playMethod == 2){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number + "" + number + "" + number;
        obj.notes = 1;
    }else if(hbks_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(hbks_playMethod == 8){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number + "" + number +"*";
        obj.notes = 1;
    }else if(hbks_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,6);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(hbks_playMethod == 11){
        var number = mathUtil.getRandomNum(1,7);
        obj.nums = number;
        obj.notes = 1;
    }
    obj.sntuo = hbks_sntuo;
    obj.multiple = 1;
    obj.rebates = hbks_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('hbks',hbks_playMethod,obj);  //机选奖金计算
    obj.award = $('#hbks_minAward').html();     //奖金
    obj.maxAward = $('#hbks_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [hbks_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hbks_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#hbks_queding").bind('click', function(event) {
        hbks_rebate = $("#hbks_fandian option:last").val();
        if(parseInt($('#hbks_zhushu').html()) <= 0 || Number($("#hbks_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        hbks_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#hbks_modeId').val()) == 8){
            if (Number($('#hbks_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('hbks',hbks_playMethod);

        submitParams.lotteryType = "hbks";
        var playType = LotteryInfo.getPlayName("k3",hbks_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("k3",hbks_playMethod);
        submitParams.playTypeIndex = hbks_playType;
        submitParams.playMethodIndex = hbks_playMethod;
        var selectedBalls = [];

        if (hbks_playType == 0 || hbks_playType == 1 || hbks_playType == 3 || hbks_playType == 6) {
            $("#hbks_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(hbks_playType == 2 || hbks_playType == 5){
            if(hbks_playMethod == 4 || hbks_playMethod == 9){
                $("#hbks_ballView div.ballView").each(function(){
                    $(this).find("span.redBalls_active").each(function(){
                        selectedBalls.push($(this).text());
                    });
                });
                submitParams.nums = selectedBalls.join(",");
            }else{
                if(parseInt($('#hbks_zhushu').html())<2){
                    toastUtils.showToast('胆拖至少选择2注');
                    return;
                }
                $("#hbks_ballView div.ballView").each(function(){
                    var arr = [];
                    $(this).find("span.redBalls_active").each(function(){
                        arr.push($(this).text());
                    });
                    selectedBalls.push(arr.join(","));
                });
                submitParams.nums = selectedBalls.join("#");
            }
        }else if(hbks_playType == 4) {
            if (hbks_playMethod == 7) {
                $("#hbks_ballView div.ballView").each(function () {
                    var arr = [];
                    $(this).find("span.redBalls_active").each(function () {
                        arr.push($(this).text());
                    });
                    selectedBalls.push(arr.join(","));
                });
                submitParams.nums = selectedBalls.join("|");
            } else {
                $("#hbks_ballView div.ballView").each(function () {
                    $(this).find("span.redBalls_active").each(function () {
                        selectedBalls.push($(this).text());
                    });
                });
                submitParams.nums = selectedBalls.join(",");
            }
        }
        localStorageUtils.setParam("playMode",$("#hbks_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#hbks_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#hbks_fandian").val());
        submitParams.notes = $('#hbks_zhushu').html();
        submitParams.sntuo = hbks_sntuo;
        submitParams.multiple = $('#hbks_beiNum').val();  //requirement
        submitParams.rebates = $('#hbks_fandian').val();  //requirement
        submitParams.playMode = $('#hbks_modeId').val();  //requirement
        submitParams.money = $('#hbks_money').html();  //requirement
        submitParams.award = $('#hbks_minAward').html();  //奖金
        submitParams.maxAward = $('#hbks_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#hbks_ballView").empty();
        hbks_qingkongAll();
    });
}