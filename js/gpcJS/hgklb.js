//定义北京快乐8玩法标识
var hgklb_playType = 0;
var hgklb_playMethod = 0;
var hgklb_sntuo = 0;
var hgklb_rebate;
var hgklbScroll;

//进入这个页面时调用
function hgklbPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hgklb")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hgklb_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hgklbPageUnloadedPanel(){
    $("#hgklbPage_back").off('click');
    $("#hgklb_queding").off('click');
    $("#hgklb_ballView").empty();
    $("#hgklbSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="hgklbPlaySelect"></select>');
    $("#hgklbSelect").append($select);
}

//入口函数
function hgklb_init(){
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
    $("#hgklb_title").html(LotteryInfo.getLotteryNameByTag("hgklb"));
    for(var i = 0; i< LotteryInfo.getPlayLength("kl8");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("kl8",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("kl8");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("kl8",j) == LotteryInfo.getPlayTypeId("kl8",i)){
                var name = LotteryInfo.getMethodName("kl8",j);
                if(i == hgklb_playType && j == hgklb_playMethod){
                    $play.append('<option value="hgklb'+LotteryInfo.getMethodIndex("kl8",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="hgklb'+LotteryInfo.getMethodIndex("kl8",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hgklb_playMethod,onShowArray)>-1 ){
						hgklb_playType = i;
						hgklb_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hgklbPlaySelect").append($play);
		}
    }
    
    if($("#hgklbPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("hgklbSelect").querySelectorAll('select.cs-select') ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:hgklbChangeItem
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

    GetLotteryInfo("hgklb",function (){
        hgklbChangeItem("hgklb"+hgklb_playMethod);
    });

    //添加滑动条
    if(!hgklbScroll){
        hgklbScroll = new IScroll('#hgklbContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("hgklb",LotteryInfo.getLotteryIdByTag("hgklb"));

    //获取上一期开奖
    queryLastPrize("hgklb");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('hgklb');

    //机选选号
    $("#hgklb_random").on('click', function(event) {
        hgklb_randomOne();
    });
    
    $("#hgklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",hgklb_playMethod));
	//玩法说明
	$("#hgklb_paly_shuoming").off('click');
	$("#hgklb_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hgklb_shuoming").text());
	});

    //返回
    $("#hgklbPage_back").on('click', function(event) {
        // hgklbResetPlayType();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        $("#hgklb_ballView").empty();
        hgklb_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("hgklb");//清空
    hgklb_submitData();
}

function hgklbResetPlayType(){
    hgklb_playType = 0;
    hgklb_playMethod = 0;
}

function hgklbChangeItem(val) {
    hgklb_qingkongAll();
    var temp = val.substring("hgklb".length,val.length);
    if(val == 'hgklb10'){
        $("#hgklb_random").show();
        hgklb_sntuo = 0;
        hgklb_playType = 1;
        hgklb_playMethod = 10;
        var num = ["单","双"];
        createNonNumLayout("hgklb",hgklb_playMethod,num,function(){
            hgklb_calcNotes();
        });
        hgklb_qingkongAll();
    }else if(val == 'hgklb9'){
        $("#hgklb_random").show();
        hgklb_sntuo = 0;
        hgklb_playType = 1;
        hgklb_playMethod = 9;
        var num = ["大","小","和"];
        createNonNumLayout("hgklb",hgklb_playMethod,num,function(){
            hgklb_calcNotes();
        });
        hgklb_qingkongAll();
    }else if(val == 'hgklb8'){
        $("#hgklb_random").show();
        hgklb_sntuo = 0;
        hgklb_playType = 1;
        hgklb_playMethod = 8;
        var num = ["奇","偶","和"];
        createNonNumLayout("hgklb",hgklb_playMethod,num,function(){
            hgklb_calcNotes();
        });
        hgklb_qingkongAll();
    }else if(val == 'hgklb7'){
        $("#hgklb_random").show();
        hgklb_sntuo = 0;
        hgklb_playType = 1;
        hgklb_playMethod = 7;
        var num = ["上","下","中"];
        createNonNumLayout("hgklb",hgklb_playMethod,num,function(){
            hgklb_calcNotes();
        });
        hgklb_qingkongAll();
    }else if(val == 'hgklb11'){
        $("#hgklb_random").show();
        hgklb_sntuo = 0;
        hgklb_playType = 1;
        hgklb_playMethod = 11;
        var num = ["大单","大双","小单","小双"];
        createNonNumLayout("hgklb",hgklb_playMethod,num,function(){
            hgklb_calcNotes();
        });
        hgklb_qingkongAll();
    }else if(val == 'hgklb12'){
        $("#hgklb_random").show();
        hgklb_sntuo = 0;
        hgklb_playType = 2;
        hgklb_playMethod = 12;
        hgklb_qingkongAll();
        var num = ["金","木","水","火","土"];
        createNonNumLayout("hgklb",hgklb_playMethod,num,function(){
            hgklb_calcNotes();
        });
    }else if(parseInt(temp) < 7){
        $("#hgklb_random").show();
        hgklb_sntuo = 0;
        hgklb_playType = 0;
        hgklb_playMethod = parseInt(temp);

        var tips = "上(01-40),下(41-80)：请至少选择"+(hgklb_playMethod+1)+"个号";
        if(hgklb_playMethod == 0){
            createOneLineLayout("hgklb",tips,1,80,true,function(){
                hgklb_calcNotes();
            });
        }else{
            createOneLineMaxLayout("hgklb",hgklb_playMethod+1,8,1,80,true,function(){
                hgklb_calcNotes();
            });
        }

        hgklb_qingkongAll();
    }

    if(hgklbScroll){
        hgklbScroll.refresh();
        hgklbScroll.scrollTo(0,0,1);
    }
    
    $("#hgklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",temp));
    
    initFooterData("hgklb",temp);
    hideRandomWhenLi("hgklb",hgklb_sntuo,hgklb_playMethod);
    hgklb_calcNotes(); // 计算盈利奖金初始化
}

/**
 * [hgklb_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hgklb_initFooterButton(){
    if (LotteryStorage["hgklb"]["line1"].length > 0) {
        $("#hgklb_qingkong").css("opacity",1.0);
    }else{
        $("#hgklb_qingkong").css("opacity",0.4);
    }

    if($('#hgklb_zhushu').html() > 0){
        $("#hgklb_queding").css("opacity",1.0);
    }else{
        $("#hgklb_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function hgklb_qingkongAll(){
    $("#hgklb_ballView span").removeClass('redBalls_active');
    LotteryStorage["hgklb"]["line1"] = [];

    localStorageUtils.removeParam("hgklb_line1");

    $('#hgklb_zhushu').text(0);
    $('#hgklb_money').text(0);
    clearAwardWin("hgklb");
    hgklb_initFooterButton();
}

/**
 * [hgklb_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hgklb_calcNotes(){
	$('#hgklb_modeId').blur();
	$('#hgklb_fandian').blur();
	
    var notes = 0;

    if (hgklb_playType == 0) {
        notes = mathUtil.getCCombination(LotteryStorage["hgklb"]["line1"].length,hgklb_playMethod + 1);
    }else if(hgklb_playType == 1 || hgklb_playType == 2){
        notes = LotteryStorage["hgklb"]["line1"].length;
    }

    hideRandomWhenLi("hgklb",hgklb_sntuo,hgklb_playMethod);

    //验证是否为空
    if( $("#hgklb_beiNum").val() =="" || parseInt($("#hgklb_beiNum").val()) == 0){
        $("#hgklb_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#hgklb_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#hgklb_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#hgklb_zhushu').text(notes);
        if($("#hgklb_modeId").val() == "8"){
            $('#hgklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgklb_beiNum").val()),0.002));
        }else if ($("#hgklb_modeId").val() == "2"){
            $('#hgklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgklb_beiNum").val()),0.2));
        }else if ($("#hgklb_modeId").val() == "1"){
            $('#hgklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgklb_beiNum").val()),0.02));
        }else{
            $('#hgklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgklb_beiNum").val()),2));
        }

    } else {
        $('#hgklb_zhushu').text(0);
        $('#hgklb_money').text(0);
    }
    hgklb_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('hgklb',hgklb_playMethod);
}

/**
 * [hgklb_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hgklb_randomOne(){
    hgklb_qingkongAll();
    if(hgklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(hgklb_playMethod + 1,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["hgklb"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["hgklb"]["line1"], function(k, v){
            $("#" + "hgklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["hgklb"]["line1"].push(number+"");

        $.each(LotteryStorage["hgklb"]["line1"], function(k, v){
            $("#" + "hgklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgklb_playMethod == 8 || hgklb_playMethod == 9 || hgklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        LotteryStorage["hgklb"]["line1"].push(number+"");

        $.each(LotteryStorage["hgklb"]["line1"], function(k, v){
            $("#" + "hgklb_line1" + v).toggleClass("redBalls_active");
        });

    }else if(hgklb_playMethod == 11){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["hgklb"]["line1"].push(number+"");

        $.each(LotteryStorage["hgklb"]["line1"], function(k, v){
            $("#" + "hgklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgklb_playMethod == 12){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["hgklb"]["line1"].push(number+"");

        $.each(LotteryStorage["hgklb"]["line1"], function(k, v){
            $("#" + "hgklb_line1" + v).toggleClass("redBalls_active");
        });
    }
    hgklb_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hgklb_checkOutRandom(playMethod){
    var obj = new Object();
    if(hgklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(hgklb_playMethod + 1,redBallArray);
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
    }else if(hgklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        obj.nums = number == 0 ? "单" : "双";
        obj.notes = 1;
    }else if(hgklb_playMethod == 9){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "大";
        }else if(number == 1){
            obj.nums = "小";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(hgklb_playMethod == 8){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "奇";
        }else if(number == 1){
            obj.nums = "偶";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(hgklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "上";
        }else if(number == 1){
            obj.nums = "下";
        }else if(number == 2){
            obj.nums = "中";
        }
        obj.notes = 1;
    }else if(hgklb_playMethod == 11){
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
    }else if(hgklb_playMethod == 12){
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
    obj.sntuo = hgklb_sntuo;
    obj.multiple = 1;
    obj.rebates = hgklb_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('hgklb',hgklb_playMethod,obj);  //机选奖金计算
    obj.award = $('#hgklb_minAward').html();     //奖金
    obj.maxAward = $('#hgklb_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [hgklb_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hgklb_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#hgklb_queding").bind('click', function(event) {
        hgklb_rebate = $("#hgklb_fandian option:last").val();
        if(parseInt($('#hgklb_zhushu').html()) <= 0 || Number($("#hgklb_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        hgklb_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#hgklb_modeId').val()) == 8){
            if (Number($('#hgklb_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('hgklb',hgklb_playMethod);

        submitParams.lotteryType = "hgklb";
        var playType = LotteryInfo.getPlayName("kl8",hgklb_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("kl8",hgklb_playMethod);
        submitParams.playTypeIndex = hgklb_playType;
        submitParams.playMethodIndex = hgklb_playMethod;
        var selectedBalls = [];

        $("#hgklb_ballView div.ballView").each(function(){
            $(this).find("span.redBalls_active").each(function(){
                selectedBalls.push($(this).text());
            });
        });
        localStorageUtils.setParam("playMode",$("#hgklb_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#hgklb_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#hgklb_fandian").val());
        submitParams.nums = selectedBalls.join(",");
        submitParams.notes = $('#hgklb_zhushu').html();
        submitParams.sntuo = hgklb_sntuo;
        submitParams.multiple = $('#hgklb_beiNum').val();  //requirement
        submitParams.rebates = $('#hgklb_fandian').val();  //requirement
        submitParams.playMode = $('#hgklb_modeId').val();  //requirement
        submitParams.money = $('#hgklb_money').html();  //requirement
        submitParams.award = $('#hgklb_minAward').html();  //奖金
        submitParams.maxAward = $('#hgklb_maxAward').html();  //多级奖金

        submitParams.submit();
        $("#hgklb_ballView").empty();
        hgklb_qingkongAll();
    });
}