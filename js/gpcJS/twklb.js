//定义北京快乐8玩法标识
var twklb_playType = 0;
var twklb_playMethod = 0;
var twklb_sntuo = 0;
var twklb_rebate;
var twklbScroll;

//进入这个页面时调用
function twklbPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("twklb")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("twklb_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function twklbPageUnloadedPanel(){
    $("#twklbPage_back").off('click');
    $("#twklb_queding").off('click');
    $("#twklb_ballView").empty();
    $("#twklbSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="twklbPlaySelect"></select>');
    $("#twklbSelect").append($select);
}

//入口函数
function twklb_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("kl8").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("kl8")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("kl8")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
    $("#twklb_title").html(LotteryInfo.getLotteryNameByTag("twklb"));
    for(var i = 0; i< LotteryInfo.getPlayLength("kl8");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("kl8",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("kl8");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("kl8",j) == LotteryInfo.getPlayTypeId("kl8",i)){
                var name = LotteryInfo.getMethodName("kl8",j);
                if(i == twklb_playType && j == twklb_playMethod){
                    $play.append('<option value="twklb'+LotteryInfo.getMethodIndex("kl8",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="twklb'+LotteryInfo.getMethodIndex("kl8",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(twklb_playMethod,onShowArray)>-1 ){
						twklb_playType = i;
						twklb_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#twklbPlaySelect").append($play);
		}
    }
    
    if($("#twklbPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("twklbSelect").querySelectorAll('select.cs-select') ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:twklbChangeItem
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

    GetLotteryInfo("twklb",function (){
        twklbChangeItem("twklb"+twklb_playMethod);
    });

    //添加滑动条
    if(!twklbScroll){
        twklbScroll = new IScroll('#twklbContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("twklb",LotteryInfo.getLotteryIdByTag("twklb"));

    //获取上一期开奖
    queryLastPrize("twklb");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('twklb');

    //机选选号
    $("#twklb_random").on('click', function(event) {
        twklb_randomOne();
    });

    //返回
    $("#twklbPage_back").on('click', function(event) {
        // twklbResetPlayType();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        $("#twklb_ballView").empty();
        twklb_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#twklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",twklb_playMethod));
	//玩法说明
	$("#twklb_paly_shuoming").off('click');
	$("#twklb_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#twklb_shuoming").text());
	});

    qingKong("twklb");//清空
    twklb_submitData();
}

function twklbResetPlayType(){
    twklb_playType = 0;
    twklb_playMethod = 0;
}

function twklbChangeItem(val) {
    twklb_qingkongAll();
    var temp = val.substring("twklb".length,val.length);
    if(val == 'twklb10'){
        $("#twklb_random").show();
        twklb_sntuo = 0;
        twklb_playType = 1;
        twklb_playMethod = 10;
        var num = ["单","双"];
        createNonNumLayout("twklb",twklb_playMethod,num,function(){
            twklb_calcNotes();
        });
        twklb_qingkongAll();
    }else if(val == 'twklb9'){
        $("#twklb_random").show();
        twklb_sntuo = 0;
        twklb_playType = 1;
        twklb_playMethod = 9;
        var num = ["大","小","和"];
        createNonNumLayout("twklb",twklb_playMethod,num,function(){
            twklb_calcNotes();
        });
        twklb_qingkongAll();
    }else if(val == 'twklb8'){
        $("#twklb_random").show();
        twklb_sntuo = 0;
        twklb_playType = 1;
        twklb_playMethod = 8;
        var num = ["奇","偶","和"];
        createNonNumLayout("twklb",twklb_playMethod,num,function(){
            twklb_calcNotes();
        });
        twklb_qingkongAll();
    }else if(val == 'twklb7'){
        $("#twklb_random").show();
        twklb_sntuo = 0;
        twklb_playType = 1;
        twklb_playMethod = 7;
        var num = ["上","下","中"];
        createNonNumLayout("twklb",twklb_playMethod,num,function(){
            twklb_calcNotes();
        });
        twklb_qingkongAll();
    }else if(val == 'twklb11'){
        $("#twklb_random").show();
        twklb_sntuo = 0;
        twklb_playType = 1;
        twklb_playMethod = 11;
        var num = ["大单","大双","小单","小双"];
        createNonNumLayout("twklb",twklb_playMethod,num,function(){
            twklb_calcNotes();
        });
        twklb_qingkongAll();
    }else if(val == 'twklb12'){
        $("#twklb_random").show();
        twklb_sntuo = 0;
        twklb_playType = 2;
        twklb_playMethod = 12;
        twklb_qingkongAll();
        var num = ["金","木","水","火","土"];
        createNonNumLayout("twklb",twklb_playMethod,num,function(){
            twklb_calcNotes();
        });
    }else if(parseInt(temp) < 7){
        $("#twklb_random").show();
        twklb_sntuo = 0;
        twklb_playType = 0;
        twklb_playMethod = parseInt(temp);

        var tips = "上(01-40),下(41-80)：请至少选择"+(twklb_playMethod+1)+"个号";
        if(twklb_playMethod == 0){
            createOneLineLayout("twklb",tips,1,80,true,function(){
                twklb_calcNotes();
            });
        }else{
            createOneLineMaxLayout("twklb",twklb_playMethod+1,8,1,80,true,function(){
                twklb_calcNotes();
            });
        }

        twklb_qingkongAll();
    }

    if(twklbScroll){
        twklbScroll.refresh();
        twklbScroll.scrollTo(0,0,1);
    }
    
    $("#twklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",temp));
    
    initFooterData("twklb",temp);
    hideRandomWhenLi("twklb",twklb_sntuo,twklb_playMethod);
    twklb_calcNotes(); // 计算盈利奖金初始化
}

/**
 * [twklb_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function twklb_initFooterButton(){
    if (LotteryStorage["twklb"]["line1"].length > 0) {
        $("#twklb_qingkong").css("opacity",1.0);
    }else{
        $("#twklb_qingkong").css("opacity",0.4);
    }

    if($('#twklb_zhushu').html() > 0){
        $("#twklb_queding").css("opacity",1.0);
    }else{
        $("#twklb_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function twklb_qingkongAll(){
    $("#twklb_ballView span").removeClass('redBalls_active');
    LotteryStorage["twklb"]["line1"] = [];

    localStorageUtils.removeParam("twklb_line1");

    $('#twklb_zhushu').text(0);
    $('#twklb_money').text(0);
    clearAwardWin("twklb");
    twklb_initFooterButton();
}

/**
 * [twklb_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function twklb_calcNotes(){
	$('#twklb_modeId').blur();
	$('#twklb_fandian').blur();
	
    var notes = 0;

    if (twklb_playType == 0) {
        notes = mathUtil.getCCombination(LotteryStorage["twklb"]["line1"].length,twklb_playMethod + 1);
    }else if(twklb_playType == 1 || twklb_playType == 2){
        notes = LotteryStorage["twklb"]["line1"].length;
    }

    hideRandomWhenLi("twklb",twklb_sntuo,twklb_playMethod);

    //验证是否为空
    if( $("#twklb_beiNum").val() =="" || parseInt($("#twklb_beiNum").val()) == 0){
        $("#twklb_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#twklb_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#twklb_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#twklb_zhushu').text(notes);
        if($("#twklb_modeId").val() == "8"){
            $('#twklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#twklb_beiNum").val()),0.002));
        }else if ($("#twklb_modeId").val() == "2"){
            $('#twklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#twklb_beiNum").val()),0.2));
        }else if ($("#twklb_modeId").val() == "1"){
            $('#twklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#twklb_beiNum").val()),0.02));
        }else{
            $('#twklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#twklb_beiNum").val()),2));
        }

    } else {
        $('#twklb_zhushu').text(0);
        $('#twklb_money').text(0);
    }
    twklb_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('twklb',twklb_playMethod);
}

/**
 * [twklb_randomOne 随机一注]
 * @return {[type]} [description]
 */
function twklb_randomOne(){
    twklb_qingkongAll();
    if(twklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(twklb_playMethod + 1,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["twklb"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["twklb"]["line1"], function(k, v){
            $("#" + "twklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["twklb"]["line1"].push(number+"");

        $.each(LotteryStorage["twklb"]["line1"], function(k, v){
            $("#" + "twklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twklb_playMethod == 8 || twklb_playMethod == 9 || twklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        LotteryStorage["twklb"]["line1"].push(number+"");

        $.each(LotteryStorage["twklb"]["line1"], function(k, v){
            $("#" + "twklb_line1" + v).toggleClass("redBalls_active");
        });

    }else if(twklb_playMethod == 11){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["twklb"]["line1"].push(number+"");

        $.each(LotteryStorage["twklb"]["line1"], function(k, v){
            $("#" + "twklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twklb_playMethod == 12){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["twklb"]["line1"].push(number+"");

        $.each(LotteryStorage["twklb"]["line1"], function(k, v){
            $("#" + "twklb_line1" + v).toggleClass("redBalls_active");
        });
    }
    twklb_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function twklb_checkOutRandom(playMethod){
    var obj = new Object();
    if(twklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(twklb_playMethod + 1,redBallArray);
        array.sort(function (a,b) {
            return a - b;
        });
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(twklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        obj.nums = number == 0 ? "单" : "双";
        obj.notes = 1;
    }else if(twklb_playMethod == 9){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "大";
        }else if(number == 1){
            obj.nums = "小";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(twklb_playMethod == 8){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "奇";
        }else if(number == 1){
            obj.nums = "偶";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(twklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "上";
        }else if(number == 1){
            obj.nums = "下";
        }else if(number == 2){
            obj.nums = "中";
        }
        obj.notes = 1;
    }else if(twklb_playMethod == 11){
        var number = mathUtil.getRandomNum(0,4);
        if(number == 0){
            obj.nums = "大单";
        }else if(number == 1){
            obj.nums = "大双";
        }else if(number == 2){
            obj.nums = "小单";
        }else{
            obj.nums = "小双";
        }
        obj.notes = 1;
    }else if(twklb_playMethod == 12){
        var number = mathUtil.getRandomNum(0,5);
        if(number == 0){
            obj.nums = "金";
        }else if(number == 1){
            obj.nums = "木";
        }else if(number == 2){
            obj.nums = "水";
        }else if(number == 3){
            obj.nums = "火";
        }else{
            obj.nums = "土";
        }
        obj.notes = 1;
    }
    obj.sntuo = twklb_sntuo;
    obj.multiple = 1;
    obj.rebates = twklb_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('twklb',twklb_playMethod,obj);  //机选奖金计算
    obj.award = $('#twklb_minAward').html();     //奖金
    obj.maxAward = $('#twklb_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [twklb_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function twklb_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#twklb_queding").bind('click', function(event) {
        twklb_rebate = $("#twklb_fandian option:last").val();
        if(parseInt($('#twklb_zhushu').html()) <= 0 || Number($("#twklb_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        twklb_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

       /* if(parseInt($('#twklb_modeId').val()) == 8){
            if (Number($('#twklb_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('twklb',twklb_playMethod);

        submitParams.lotteryType = "twklb";
        var playType = LotteryInfo.getPlayName("kl8",twklb_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("kl8",twklb_playMethod);
        submitParams.playTypeIndex = twklb_playType;
        submitParams.playMethodIndex = twklb_playMethod;
        var selectedBalls = [];

        $("#twklb_ballView div.ballView").each(function(){
            $(this).find("span.redBalls_active").each(function(){
                selectedBalls.push($(this).text());
            });
        });
        localStorageUtils.setParam("playMode",$("#twklb_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#twklb_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#twklb_fandian").val());
        submitParams.nums = selectedBalls.join(",");
        submitParams.notes = $('#twklb_zhushu').html();
        submitParams.sntuo = twklb_sntuo;
        submitParams.multiple = $('#twklb_beiNum').val();  //requirement
        submitParams.rebates = $('#twklb_fandian').val();  //requirement
        submitParams.playMode = $('#twklb_modeId').val();  //requirement
        submitParams.money = $('#twklb_money').html();  //requirement
        submitParams.award = $('#twklb_minAward').html();  //奖金
        submitParams.maxAward = $('#twklb_maxAward').html();  //多级奖金

        submitParams.submit();
        $("#twklb_ballView").empty();
        twklb_qingkongAll();
    });
}