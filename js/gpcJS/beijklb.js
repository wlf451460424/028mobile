//定义北京快乐8玩法标识
var beijklb_playType = 0;
var beijklb_playMethod = 0;
var beijklb_sntuo = 0;
var beijklb_rebate;
var beijklbScroll;

//进入这个页面时调用
function beijklbPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("beijklb")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("beijklb_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function beijklbPageUnloadedPanel(){
    $("#beijklbPage_back").off('click');
    $("#beijklb_queding").off('click');
    $("#beijklb_ballView").empty();
    $("#beijklbSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="beijklbPlaySelect"></select>');
    $("#beijklbSelect").append($select);
}

//入口函数
function beijklb_init(){
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
    $("#beijklb_title").html(LotteryInfo.getLotteryNameByTag("beijklb"));
    for(var i = 0; i< LotteryInfo.getPlayLength("kl8");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("kl8",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("kl8");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("kl8",j) == LotteryInfo.getPlayTypeId("kl8",i)){
                var name = LotteryInfo.getMethodName("kl8",j);
                if(i == beijklb_playType && j == beijklb_playMethod){
                    $play.append('<option value="beijklb'+LotteryInfo.getMethodIndex("kl8",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="beijklb'+LotteryInfo.getMethodIndex("kl8",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(beijklb_playMethod,onShowArray)>-1 ){
						beijklb_playType = i;
						beijklb_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#beijklbPlaySelect").append($play);
		}
    }
    
    if($("#beijklbPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("beijklbSelect").querySelectorAll('select.cs-select') ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:beijklbChangeItem
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

    GetLotteryInfo("beijklb",function (){
        beijklbChangeItem("beijklb"+beijklb_playMethod);
    });

    //添加滑动条
    if(!beijklbScroll){
        beijklbScroll = new IScroll('#beijklbContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("beijklb",LotteryInfo.getLotteryIdByTag("beijklb"));

    //获取上一期开奖
    queryLastPrize("beijklb");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('beijklb');

    //机选选号
    $("#beijklb_random").on('click', function(event) {
        beijklb_randomOne();
    });
	
	$("#beijklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",beijklb_playMethod));
	//玩法说明
	$("#beijklb_paly_shuoming").off('click');
	$("#beijklb_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#beijklb_shuoming").text());
	});
	
    //返回
    $("#beijklbPage_back").on('click', function(event) {
        // beijklbResetPlayType();
        $("#beijklb_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        beijklb_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("beijklb");//清空
    beijklb_submitData();
}

function beijklbResetPlayType(){
    beijklb_playType = 0;
    beijklb_playMethod = 0;
}

function beijklbChangeItem(val) {
    beijklb_qingkongAll();
    var temp = val.substring("beijklb".length,val.length);
    if(val == 'beijklb10'){
        $("#beijklb_random").show();
        beijklb_sntuo = 0;
        beijklb_playType = 1;
        beijklb_playMethod = 10;
        var num = ["单","双"];
        createNonNumLayout("beijklb",beijklb_playMethod,num,function(){
            beijklb_calcNotes();
        });
        beijklb_qingkongAll();
    }else if(val == 'beijklb9'){
        $("#beijklb_random").show();
        beijklb_sntuo = 0;
        beijklb_playType = 1;
        beijklb_playMethod = 9;
        var num = ["大","小","和"];
        createNonNumLayout("beijklb",beijklb_playMethod,num,function(){
            beijklb_calcNotes();
        });
        beijklb_qingkongAll();
    }else if(val == 'beijklb8'){
        $("#beijklb_random").show();
        beijklb_sntuo = 0;
        beijklb_playType = 1;
        beijklb_playMethod = 8;
        var num = ["奇","偶","和"];
        createNonNumLayout("beijklb",beijklb_playMethod,num,function(){
            beijklb_calcNotes();
        });
        beijklb_qingkongAll();
    }else if(val == 'beijklb7'){
        $("#beijklb_random").show();
        beijklb_sntuo = 0;
        beijklb_playType = 1;
        beijklb_playMethod = 7;
        var num = ["上","下","中"];
        createNonNumLayout("beijklb",beijklb_playMethod,num,function(){
            beijklb_calcNotes();
        });
        beijklb_qingkongAll();
    }else if(val == 'beijklb11'){
        $("#beijklb_random").show();
        beijklb_sntuo = 0;
        beijklb_playType = 1;
        beijklb_playMethod = 11;
        var num = ["大单","大双","小单","小双"];
        createNonNumLayout("beijklb",beijklb_playMethod,num,function(){
            beijklb_calcNotes();
        });
        beijklb_qingkongAll();
    }else if(val == 'beijklb12'){
        $("#beijklb_random").show();
        beijklb_sntuo = 0;
        beijklb_playType = 2;
        beijklb_playMethod = 12;
        beijklb_qingkongAll();
        var num = ["金","木","水","火","土"];
        createNonNumLayout("beijklb",beijklb_playMethod,num,function(){
            beijklb_calcNotes();
        });
    }else if(parseInt(temp) < 7){
        $("#beijklb_random").show();
        beijklb_sntuo = 0;
        beijklb_playType = 0;
        beijklb_playMethod = parseInt(temp);

        var tips = "上(01-40),下(41-80)：请至少选择"+(beijklb_playMethod+1)+"个号";
        if(beijklb_playMethod == 0){
            createOneLineLayout("beijklb",tips,1,80,true,function(){
                beijklb_calcNotes();
            });
        }else{
            createOneLineMaxLayout("beijklb",beijklb_playMethod+1,8,1,80,true,function(){
                beijklb_calcNotes();
            });
        }

        beijklb_qingkongAll();
    }

    if(beijklbScroll){
        beijklbScroll.refresh();
        beijklbScroll.scrollTo(0,0,1);
    }
    
    $("#beijklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",temp));
    
    initFooterData("beijklb",temp);
    hideRandomWhenLi("beijklb",beijklb_sntuo,beijklb_playMethod);
    beijklb_calcNotes(); // 计算盈利奖金初始化
}

/**
 * [beijklb_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function beijklb_initFooterButton(){
    if (LotteryStorage["beijklb"]["line1"].length > 0) {
        $("#beijklb_qingkong").css("opacity",1.0);
    }else{
        $("#beijklb_qingkong").css("opacity",0.4);
    }

    if($('#beijklb_zhushu').html() > 0){
        $("#beijklb_queding").css("opacity",1.0);
    }else{
        $("#beijklb_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function beijklb_qingkongAll(){
    $("#beijklb_ballView span").removeClass('redBalls_active');
    LotteryStorage["beijklb"]["line1"] = [];

    localStorageUtils.removeParam("beijklb_line1");

    $('#beijklb_zhushu').text(0);
    $('#beijklb_money').text(0);
    clearAwardWin("beijklb");
    beijklb_initFooterButton();
}

/**
 * [beijklb_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function beijklb_calcNotes(){
	$('#beijklb_modeId').blur();
	$('#beijklb_fandian').blur();
	
    var notes = 0;

    if (beijklb_playType == 0) {
        notes = mathUtil.getCCombination(LotteryStorage["beijklb"]["line1"].length,beijklb_playMethod + 1);
    }else if(beijklb_playType == 1 || beijklb_playType == 2){
        notes = LotteryStorage["beijklb"]["line1"].length;
    }

    hideRandomWhenLi("beijklb",beijklb_sntuo,beijklb_playMethod);

    //验证是否为空
    if( $("#beijklb_beiNum").val() =="" || parseInt($("#beijklb_beiNum").val()) == 0){
        $("#beijklb_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#beijklb_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#beijklb_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#beijklb_zhushu').text(notes);
        if($("#beijklb_modeId").val() == "8"){
            $('#beijklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijklb_beiNum").val()),0.002));
        }else if ($("#beijklb_modeId").val() == "2"){
            $('#beijklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijklb_beiNum").val()),0.2));
        }else if ($("#beijklb_modeId").val() == "1"){
            $('#beijklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijklb_beiNum").val()),0.02));
        }else{
            $('#beijklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijklb_beiNum").val()),2));
        }

    } else {
        $('#beijklb_zhushu').text(0);
        $('#beijklb_money').text(0);
    }
    beijklb_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('beijklb',beijklb_playMethod);
}

/**
 * [beijklb_randomOne 随机一注]
 * @return {[type]} [description]
 */
function beijklb_randomOne(){
    beijklb_qingkongAll();
    if(beijklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(beijklb_playMethod + 1,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["beijklb"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["beijklb"]["line1"], function(k, v){
            $("#" + "beijklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(beijklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["beijklb"]["line1"].push(number+"");

        $.each(LotteryStorage["beijklb"]["line1"], function(k, v){
            $("#" + "beijklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(beijklb_playMethod == 8 || beijklb_playMethod == 9 || beijklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        LotteryStorage["beijklb"]["line1"].push(number+"");

        $.each(LotteryStorage["beijklb"]["line1"], function(k, v){
            $("#" + "beijklb_line1" + v).toggleClass("redBalls_active");
        });

    }else if(beijklb_playMethod == 11){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["beijklb"]["line1"].push(number+"");

        $.each(LotteryStorage["beijklb"]["line1"], function(k, v){
            $("#" + "beijklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(beijklb_playMethod == 12){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["beijklb"]["line1"].push(number+"");

        $.each(LotteryStorage["beijklb"]["line1"], function(k, v){
            $("#" + "beijklb_line1" + v).toggleClass("redBalls_active");
        });
    }
    beijklb_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function beijklb_checkOutRandom(playMethod){
    var obj = new Object();
    if(beijklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(beijklb_playMethod + 1,redBallArray);
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
    }else if(beijklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        obj.nums = number == 0 ? "单" : "双";
        obj.notes = 1;
    }else if(beijklb_playMethod == 9){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "大";
        }else if(number == 1){
            obj.nums = "小";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(beijklb_playMethod == 8){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "奇";
        }else if(number == 1){
            obj.nums = "偶";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(beijklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "上";
        }else if(number == 1){
            obj.nums = "下";
        }else if(number == 2){
            obj.nums = "中";
        }
        obj.notes = 1;
    }else if(beijklb_playMethod == 11){
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
    }else if(beijklb_playMethod == 12){
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
    obj.sntuo = beijklb_sntuo;
    obj.multiple = 1;
    obj.rebates = beijklb_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('beijklb',beijklb_playMethod,obj);  //机选奖金计算
    obj.award = $('#beijklb_minAward').html();     //奖金
    obj.maxAward = $('#beijklb_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [beijklb_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function beijklb_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#beijklb_queding").bind('click', function(event) {
        beijklb_rebate = $("#beijklb_fandian option:last").val();
        if(parseInt($('#beijklb_zhushu').html()) <= 0 || Number($("#beijklb_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        beijklb_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#beijklb_modeId').val()) == 8){
            if (Number($('#beijklb_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('beijklb',beijklb_playMethod);

        submitParams.lotteryType = "beijklb";
        var playType = LotteryInfo.getPlayName("kl8",beijklb_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("kl8",beijklb_playMethod);
        submitParams.playTypeIndex = beijklb_playType;
        submitParams.playMethodIndex = beijklb_playMethod;
        var selectedBalls = [];

        $("#beijklb_ballView div.ballView").each(function(){
            $(this).find("span.redBalls_active").each(function(){
                selectedBalls.push($(this).text());
            });
        });
        localStorageUtils.setParam("playMode",$("#beijklb_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#beijklb_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#beijklb_fandian").val());
        submitParams.nums = selectedBalls.join(",");
        submitParams.notes = $('#beijklb_zhushu').html();
        submitParams.sntuo = beijklb_sntuo;
        submitParams.multiple = $('#beijklb_beiNum').val();  //requirement
        submitParams.rebates = $('#beijklb_fandian').val();  //requirement
        submitParams.playMode = $('#beijklb_modeId').val();  //requirement
        submitParams.money = $('#beijklb_money').html();  //requirement
        submitParams.award = $('#beijklb_minAward').html();  //奖金
        submitParams.maxAward = $('#beijklb_maxAward').html();  //多级奖金

        submitParams.submit();
        $("#beijklb_ballView").empty();
        beijklb_qingkongAll();
    });
}