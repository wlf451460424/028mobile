//定义北京快乐8玩法标识
var bjklb_playType = 0;
var bjklb_playMethod = 0;
var bjklb_sntuo = 0;
var bjklb_rebate;
var bjklbScroll;

//进入这个页面时调用
function bjklbPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("bjklb")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("bjklb_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function bjklbPageUnloadedPanel(){
    $("#bjklbPage_back").off('click');
    $("#bjklb_queding").off('click');
    $("#bjklb_ballView").empty();
    $("#bjklbSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="bjklbPlaySelect"></select>');
    $("#bjklbSelect").append($select);
}

//入口函数
function bjklb_init(){
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
    $("#bjklb_title").html(LotteryInfo.getLotteryNameByTag("bjklb"));
    for(var i = 0; i< LotteryInfo.getPlayLength("kl8");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("kl8",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("kl8");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("kl8",j) == LotteryInfo.getPlayTypeId("kl8",i)){
                var name = LotteryInfo.getMethodName("kl8",j);
                if(i == bjklb_playType && j == bjklb_playMethod){
                    $play.append('<option value="bjklb'+LotteryInfo.getMethodIndex("kl8",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="bjklb'+LotteryInfo.getMethodIndex("kl8",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(bjklb_playMethod,onShowArray)>-1 ){
						bjklb_playType = i;
						bjklb_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#bjklbPlaySelect").append($play);
		}
    }
    
    if($("#bjklbPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("bjklbSelect").querySelectorAll('select.cs-select') ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:bjklbChangeItem
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

    GetLotteryInfo("bjklb",function (){
        bjklbChangeItem("bjklb"+bjklb_playMethod);
    });

    //添加滑动条
    if(!bjklbScroll){
        bjklbScroll = new IScroll('#bjklbContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("bjklb",LotteryInfo.getLotteryIdByTag("bjklb"));

    //获取上一期开奖
    queryLastPrize("bjklb");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('bjklb');

    //机选选号
    $("#bjklb_random").on('click', function(event) {
        bjklb_randomOne();
    });
    
    $("#bjklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",bjklb_playMethod));
	//玩法说明
	$("#bjklb_paly_shuoming").off('click');
	$("#bjklb_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#bjklb_shuoming").text());
	});

    //返回
    $("#bjklbPage_back").on('click', function(event) {
        // bjklbResetPlayType();
        $("#bjklb_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        bjklb_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("bjklb");//清空
    bjklb_submitData();
}

function bjklbResetPlayType(){
    bjklb_playType = 0;
    bjklb_playMethod = 0;
}

function bjklbChangeItem(val) {
    bjklb_qingkongAll();
    var temp = val.substring("bjklb".length,val.length);
    if(val == 'bjklb10'){
        $("#bjklb_random").show();
        bjklb_sntuo = 0;
        bjklb_playType = 1;
        bjklb_playMethod = 10;
        var num = ["单","双"];
        createNonNumLayout("bjklb",bjklb_playMethod,num,function(){
            bjklb_calcNotes();
        });
        bjklb_qingkongAll();
    }else if(val == 'bjklb9'){
        $("#bjklb_random").show();
        bjklb_sntuo = 0;
        bjklb_playType = 1;
        bjklb_playMethod = 9;
        var num = ["大","小","和"];
        createNonNumLayout("bjklb",bjklb_playMethod,num,function(){
            bjklb_calcNotes();
        });
        bjklb_qingkongAll();
    }else if(val == 'bjklb8'){
        $("#bjklb_random").show();
        bjklb_sntuo = 0;
        bjklb_playType = 1;
        bjklb_playMethod = 8;
        var num = ["奇","偶","和"];
        createNonNumLayout("bjklb",bjklb_playMethod,num,function(){
            bjklb_calcNotes();
        });
        bjklb_qingkongAll();
    }else if(val == 'bjklb7'){
        $("#bjklb_random").show();
        bjklb_sntuo = 0;
        bjklb_playType = 1;
        bjklb_playMethod = 7;
        var num = ["上","下","中"];
        createNonNumLayout("bjklb",bjklb_playMethod,num,function(){
            bjklb_calcNotes();
        });
        bjklb_qingkongAll();
    }else if(val == 'bjklb11'){
        $("#bjklb_random").show();
        bjklb_sntuo = 0;
        bjklb_playType = 1;
        bjklb_playMethod = 11;
        var num = ["大单","大双","小单","小双"];
        createNonNumLayout("bjklb",bjklb_playMethod,num,function(){
            bjklb_calcNotes();
        });
        bjklb_qingkongAll();
    }else if(val == 'bjklb12'){
        $("#bjklb_random").show();
        bjklb_sntuo = 0;
        bjklb_playType = 2;
        bjklb_playMethod = 12;
        bjklb_qingkongAll();
        var num = ["金","木","水","火","土"];
        createNonNumLayout("bjklb",bjklb_playMethod,num,function(){
            bjklb_calcNotes();
        });
    }else if(parseInt(temp) < 7){
        $("#bjklb_random").show();
        bjklb_sntuo = 0;
        bjklb_playType = 0;
        bjklb_playMethod = parseInt(temp);

        var tips = "上(01-40),下(41-80)：请至少选择"+(bjklb_playMethod+1)+"个号";
        if(bjklb_playMethod == 0){
            createOneLineLayout("bjklb",tips,1,80,true,function(){
                bjklb_calcNotes();
            });
        }else{
            createOneLineMaxLayout("bjklb",bjklb_playMethod+1,8,1,80,true,function(){
                bjklb_calcNotes();
            });
        }

        bjklb_qingkongAll();
    }

    if(bjklbScroll){
        bjklbScroll.refresh();
        bjklbScroll.scrollTo(0,0,1);
    }
    
    $("#bjklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",temp));
    
    initFooterData("bjklb",temp);
    hideRandomWhenLi("bjklb",bjklb_sntuo,bjklb_playMethod);
    bjklb_calcNotes(); // 计算盈利奖金初始化
}

/**
 * [bjklb_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function bjklb_initFooterButton(){
    if (LotteryStorage["bjklb"]["line1"].length > 0) {
        $("#bjklb_qingkong").css("opacity",1.0);
    }else{
        $("#bjklb_qingkong").css("opacity",0.4);
    }

    if($('#bjklb_zhushu').html() > 0){
        $("#bjklb_queding").css("opacity",1.0);
    }else{
        $("#bjklb_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function bjklb_qingkongAll(){
    $("#bjklb_ballView span").removeClass('redBalls_active');
    LotteryStorage["bjklb"]["line1"] = [];

    localStorageUtils.removeParam("bjklb_line1");

    $('#bjklb_zhushu').text(0);
    $('#bjklb_money').text(0);
    clearAwardWin("bjklb");
    bjklb_initFooterButton();
}

/**
 * [bjklb_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function bjklb_calcNotes(){
	$('#bjklb_modeId').blur();
	$('#bjklb_fandian').blur();
	
    var notes = 0;

    if (bjklb_playType == 0) {
        notes = mathUtil.getCCombination(LotteryStorage["bjklb"]["line1"].length,bjklb_playMethod + 1);
    }else if(bjklb_playType == 1 || bjklb_playType == 2){
        notes = LotteryStorage["bjklb"]["line1"].length;
    }

    hideRandomWhenLi("bjklb",bjklb_sntuo,bjklb_playMethod);

    //验证是否为空
    if( $("#bjklb_beiNum").val() =="" || parseInt($("#bjklb_beiNum").val()) == 0){
        $("#bjklb_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#bjklb_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#bjklb_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#bjklb_zhushu').text(notes);
        if($("#bjklb_modeId").val() == "8"){
            $('#bjklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjklb_beiNum").val()),0.002));
        }else if ($("#bjklb_modeId").val() == "2"){
            $('#bjklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjklb_beiNum").val()),0.2));
        }else if ($("#bjklb_modeId").val() == "1"){
            $('#bjklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjklb_beiNum").val()),0.02));
        }else{
            $('#bjklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjklb_beiNum").val()),2));
        }

    } else {
        $('#bjklb_zhushu').text(0);
        $('#bjklb_money').text(0);
    }
    bjklb_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('bjklb',bjklb_playMethod);
}

/**
 * [bjklb_randomOne 随机一注]
 * @return {[type]} [description]
 */
function bjklb_randomOne(){
    bjklb_qingkongAll();
    if(bjklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(bjklb_playMethod + 1,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["bjklb"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["bjklb"]["line1"], function(k, v){
            $("#" + "bjklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bjklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["bjklb"]["line1"].push(number+"");

        $.each(LotteryStorage["bjklb"]["line1"], function(k, v){
            $("#" + "bjklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bjklb_playMethod == 8 || bjklb_playMethod == 9 || bjklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        LotteryStorage["bjklb"]["line1"].push(number+"");

        $.each(LotteryStorage["bjklb"]["line1"], function(k, v){
            $("#" + "bjklb_line1" + v).toggleClass("redBalls_active");
        });

    }else if(bjklb_playMethod == 11){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["bjklb"]["line1"].push(number+"");

        $.each(LotteryStorage["bjklb"]["line1"], function(k, v){
            $("#" + "bjklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bjklb_playMethod == 12){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["bjklb"]["line1"].push(number+"");

        $.each(LotteryStorage["bjklb"]["line1"], function(k, v){
            $("#" + "bjklb_line1" + v).toggleClass("redBalls_active");
        });
    }
    bjklb_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function bjklb_checkOutRandom(playMethod){
    var obj = new Object();
    if(bjklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(bjklb_playMethod + 1,redBallArray);
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
    }else if(bjklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        obj.nums = number == 0 ? "单" : "双";
        obj.notes = 1;
    }else if(bjklb_playMethod == 9){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "大";
        }else if(number == 1){
            obj.nums = "小";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(bjklb_playMethod == 8){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "奇";
        }else if(number == 1){
            obj.nums = "偶";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(bjklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "上";
        }else if(number == 1){
            obj.nums = "下";
        }else if(number == 2){
            obj.nums = "中";
        }
        obj.notes = 1;
    }else if(bjklb_playMethod == 11){
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
    }else if(bjklb_playMethod == 12){
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
    obj.sntuo = bjklb_sntuo;
    obj.multiple = 1;
    obj.rebates = bjklb_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('bjklb',bjklb_playMethod,obj);  //机选奖金计算
    obj.award = $('#bjklb_minAward').html();     //奖金
    obj.maxAward = $('#bjklb_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [bjklb_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function bjklb_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#bjklb_queding").bind('click', function(event) {
        bjklb_rebate = $("#bjklb_fandian option:last").val();
        if(parseInt($('#bjklb_zhushu').html()) <= 0 || Number($("#bjklb_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        bjklb_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#bjklb_modeId').val()) == 8){
            if (Number($('#bjklb_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('bjklb',bjklb_playMethod);

        submitParams.lotteryType = "bjklb";
        var playType = LotteryInfo.getPlayName("kl8",bjklb_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("kl8",bjklb_playMethod);
        submitParams.playTypeIndex = bjklb_playType;
        submitParams.playMethodIndex = bjklb_playMethod;
        var selectedBalls = [];

        $("#bjklb_ballView div.ballView").each(function(){
            $(this).find("span.redBalls_active").each(function(){
                selectedBalls.push($(this).text());
            });
        });
        localStorageUtils.setParam("playMode",$("#bjklb_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#bjklb_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#bjklb_fandian").val());
        submitParams.nums = selectedBalls.join(",");
        submitParams.notes = $('#bjklb_zhushu').html();
        submitParams.sntuo = bjklb_sntuo;
        submitParams.multiple = $('#bjklb_beiNum').val();  //requirement
        submitParams.rebates = $('#bjklb_fandian').val();  //requirement
        submitParams.playMode = $('#bjklb_modeId').val();  //requirement
        submitParams.money = $('#bjklb_money').html();  //requirement
        submitParams.award = $('#bjklb_minAward').html();  //奖金
        submitParams.maxAward = $('#bjklb_maxAward').html();  //多级奖金

        submitParams.submit();
        $("#bjklb_ballView").empty();
        bjklb_qingkongAll();
    });
}