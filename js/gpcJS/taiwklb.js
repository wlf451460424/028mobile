//定义北京快乐8玩法标识
var taiwklb_playType = 0;
var taiwklb_playMethod = 0;
var taiwklb_sntuo = 0;
var taiwklb_rebate;
var taiwklbScroll;

//进入这个页面时调用
function taiwklbPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("taiwklb")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("taiwklb_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function taiwklbPageUnloadedPanel(){
    $("#taiwklbPage_back").off('click');
    $("#taiwklb_queding").off('click');
    $("#taiwklb_ballView").empty();
    $("#taiwklbSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="taiwklbPlaySelect"></select>');
    $("#taiwklbSelect").append($select);
}

//入口函数
function taiwklb_init(){
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
    $("#taiwklb_title").html(LotteryInfo.getLotteryNameByTag("taiwklb"));
    for(var i = 0; i< LotteryInfo.getPlayLength("kl8");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("kl8",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("kl8");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("kl8",j) == LotteryInfo.getPlayTypeId("kl8",i)){
                var name = LotteryInfo.getMethodName("kl8",j);
                if(i == taiwklb_playType && j == taiwklb_playMethod){
                    $play.append('<option value="taiwklb'+LotteryInfo.getMethodIndex("kl8",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="taiwklb'+LotteryInfo.getMethodIndex("kl8",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(taiwklb_playMethod,onShowArray)>-1 ){
						taiwklb_playType = i;
						taiwklb_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#taiwklbPlaySelect").append($play);
		}
    }
    
    if($("#taiwklbPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("taiwklbSelect").querySelectorAll('select.cs-select') ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:taiwklbChangeItem
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

    GetLotteryInfo("taiwklb",function (){
        taiwklbChangeItem("taiwklb"+taiwklb_playMethod);
    });

    //添加滑动条
    if(!taiwklbScroll){
        taiwklbScroll = new IScroll('#taiwklbContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("taiwklb",LotteryInfo.getLotteryIdByTag("taiwklb"));

    //获取上一期开奖
    queryLastPrize("taiwklb");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('taiwklb');

    //机选选号
    $("#taiwklb_random").on('click', function(event) {
        taiwklb_randomOne();
    });

    //返回
    $("#taiwklbPage_back").on('click', function(event) {
        // taiwklbResetPlayType();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        $("#taiwklb_ballView").empty();
        taiwklb_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#taiwklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",taiwklb_playMethod));
	//玩法说明
	$("#taiwklb_paly_shuoming").off('click');
	$("#taiwklb_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#taiwklb_shuoming").text());
	});

    qingKong("taiwklb");//清空
    taiwklb_submitData();
}

function taiwklbResetPlayType(){
    taiwklb_playType = 0;
    taiwklb_playMethod = 0;
}

function taiwklbChangeItem(val) {
    taiwklb_qingkongAll();
    var temp = val.substring("taiwklb".length,val.length);
    if(val == 'taiwklb10'){
        $("#taiwklb_random").show();
        taiwklb_sntuo = 0;
        taiwklb_playType = 1;
        taiwklb_playMethod = 10;
        var num = ["单","双"];
        createNonNumLayout("taiwklb",taiwklb_playMethod,num,function(){
            taiwklb_calcNotes();
        });
        taiwklb_qingkongAll();
    }else if(val == 'taiwklb9'){
        $("#taiwklb_random").show();
        taiwklb_sntuo = 0;
        taiwklb_playType = 1;
        taiwklb_playMethod = 9;
        var num = ["大","小","和"];
        createNonNumLayout("taiwklb",taiwklb_playMethod,num,function(){
            taiwklb_calcNotes();
        });
        taiwklb_qingkongAll();
    }else if(val == 'taiwklb8'){
        $("#taiwklb_random").show();
        taiwklb_sntuo = 0;
        taiwklb_playType = 1;
        taiwklb_playMethod = 8;
        var num = ["奇","偶","和"];
        createNonNumLayout("taiwklb",taiwklb_playMethod,num,function(){
            taiwklb_calcNotes();
        });
        taiwklb_qingkongAll();
    }else if(val == 'taiwklb7'){
        $("#taiwklb_random").show();
        taiwklb_sntuo = 0;
        taiwklb_playType = 1;
        taiwklb_playMethod = 7;
        var num = ["上","下","中"];
        createNonNumLayout("taiwklb",taiwklb_playMethod,num,function(){
            taiwklb_calcNotes();
        });
        taiwklb_qingkongAll();
    }else if(val == 'taiwklb11'){
        $("#taiwklb_random").show();
        taiwklb_sntuo = 0;
        taiwklb_playType = 1;
        taiwklb_playMethod = 11;
        var num = ["大单","大双","小单","小双"];
        createNonNumLayout("taiwklb",taiwklb_playMethod,num,function(){
            taiwklb_calcNotes();
        });
        taiwklb_qingkongAll();
    }else if(val == 'taiwklb12'){
        $("#taiwklb_random").show();
        taiwklb_sntuo = 0;
        taiwklb_playType = 2;
        taiwklb_playMethod = 12;
        taiwklb_qingkongAll();
        var num = ["金","木","水","火","土"];
        createNonNumLayout("taiwklb",taiwklb_playMethod,num,function(){
            taiwklb_calcNotes();
        });
    }else if(parseInt(temp) < 7){
        $("#taiwklb_random").show();
        taiwklb_sntuo = 0;
        taiwklb_playType = 0;
        taiwklb_playMethod = parseInt(temp);

        var tips = "上(01-40),下(41-80)：请至少选择"+(taiwklb_playMethod+1)+"个号";
        if(taiwklb_playMethod == 0){
            createOneLineLayout("taiwklb",tips,1,80,true,function(){
                taiwklb_calcNotes();
            });
        }else{
            createOneLineMaxLayout("taiwklb",taiwklb_playMethod+1,8,1,80,true,function(){
                taiwklb_calcNotes();
            });
        }

        taiwklb_qingkongAll();
    }

    if(taiwklbScroll){
        taiwklbScroll.refresh();
        taiwklbScroll.scrollTo(0,0,1);
    }
    
    $("#taiwklb_shuoming").html(LotteryInfo.getMethodShuoming("kl8",temp));
    
    initFooterData("taiwklb",temp);
    hideRandomWhenLi("taiwklb",taiwklb_sntuo,taiwklb_playMethod);
    taiwklb_calcNotes(); // 计算盈利奖金初始化
}

/**
 * [taiwklb_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function taiwklb_initFooterButton(){
    if (LotteryStorage["taiwklb"]["line1"].length > 0) {
        $("#taiwklb_qingkong").css("opacity",1.0);
    }else{
        $("#taiwklb_qingkong").css("opacity",0.4);
    }

    if($('#taiwklb_zhushu').html() > 0){
        $("#taiwklb_queding").css("opacity",1.0);
    }else{
        $("#taiwklb_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function taiwklb_qingkongAll(){
    $("#taiwklb_ballView span").removeClass('redBalls_active');
    LotteryStorage["taiwklb"]["line1"] = [];

    localStorageUtils.removeParam("taiwklb_line1");

    $('#taiwklb_zhushu').text(0);
    $('#taiwklb_money').text(0);
    clearAwardWin("taiwklb");
    taiwklb_initFooterButton();
}

/**
 * [taiwklb_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function taiwklb_calcNotes(){
	$('#taiwklb_modeId').blur();
	$('#taiwklb_fandian').blur();
	
    var notes = 0;

    if (taiwklb_playType == 0) {
        notes = mathUtil.getCCombination(LotteryStorage["taiwklb"]["line1"].length,taiwklb_playMethod + 1);
    }else if(taiwklb_playType == 1 || taiwklb_playType == 2){
        notes = LotteryStorage["taiwklb"]["line1"].length;
    }

    hideRandomWhenLi("taiwklb",taiwklb_sntuo,taiwklb_playMethod);

    //验证是否为空
    if( $("#taiwklb_beiNum").val() =="" || parseInt($("#taiwklb_beiNum").val()) == 0){
        $("#taiwklb_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#taiwklb_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#taiwklb_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#taiwklb_zhushu').text(notes);
        if($("#taiwklb_modeId").val() == "8"){
            $('#taiwklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwklb_beiNum").val()),0.002));
        }else if ($("#taiwklb_modeId").val() == "2"){
            $('#taiwklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwklb_beiNum").val()),0.2));
        }else if ($("#taiwklb_modeId").val() == "1"){
            $('#taiwklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwklb_beiNum").val()),0.02));
        }else{
            $('#taiwklb_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwklb_beiNum").val()),2));
        }

    } else {
        $('#taiwklb_zhushu').text(0);
        $('#taiwklb_money').text(0);
    }
    taiwklb_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('taiwklb',taiwklb_playMethod);
}

/**
 * [taiwklb_randomOne 随机一注]
 * @return {[type]} [description]
 */
function taiwklb_randomOne(){
    taiwklb_qingkongAll();
    if(taiwklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(taiwklb_playMethod + 1,redBallArray);
        $.each(array, function (k,v) {
            LotteryStorage["taiwklb"]["line1"].push(v+"");
        })

        $.each(LotteryStorage["taiwklb"]["line1"], function(k, v){
            $("#" + "taiwklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["taiwklb"]["line1"].push(number+"");

        $.each(LotteryStorage["taiwklb"]["line1"], function(k, v){
            $("#" + "taiwklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwklb_playMethod == 8 || taiwklb_playMethod == 9 || taiwklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        LotteryStorage["taiwklb"]["line1"].push(number+"");

        $.each(LotteryStorage["taiwklb"]["line1"], function(k, v){
            $("#" + "taiwklb_line1" + v).toggleClass("redBalls_active");
        });

    }else if(taiwklb_playMethod == 11){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["taiwklb"]["line1"].push(number+"");

        $.each(LotteryStorage["taiwklb"]["line1"], function(k, v){
            $("#" + "taiwklb_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwklb_playMethod == 12){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["taiwklb"]["line1"].push(number+"");

        $.each(LotteryStorage["taiwklb"]["line1"], function(k, v){
            $("#" + "taiwklb_line1" + v).toggleClass("redBalls_active");
        });
    }
    taiwklb_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function taiwklb_checkOutRandom(playMethod){
    var obj = new Object();
    if(taiwklb_playType == 0){
        var redBallArray = mathUtil.getInts(1,80);
        var array = mathUtil.getDifferentNums(taiwklb_playMethod + 1,redBallArray);
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
    }else if(taiwklb_playMethod == 10){
        var number = mathUtil.getRandomNum(0,2);
        obj.nums = number == 0 ? "单" : "双";
        obj.notes = 1;
    }else if(taiwklb_playMethod == 9){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "大";
        }else if(number == 1){
            obj.nums = "小";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(taiwklb_playMethod == 8){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "奇";
        }else if(number == 1){
            obj.nums = "偶";
        }else if(number == 2){
            obj.nums = "和";
        }
        obj.notes = 1;
    }else if(taiwklb_playMethod == 7){
        var number = mathUtil.getRandomNum(0,3);
        if(number == 0){
            obj.nums = "上";
        }else if(number == 1){
            obj.nums = "下";
        }else if(number == 2){
            obj.nums = "中";
        }
        obj.notes = 1;
    }else if(taiwklb_playMethod == 11){
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
    }else if(taiwklb_playMethod == 12){
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
    obj.sntuo = taiwklb_sntuo;
    obj.multiple = 1;
    obj.rebates = taiwklb_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('taiwklb',taiwklb_playMethod,obj);  //机选奖金计算
    obj.award = $('#taiwklb_minAward').html();     //奖金
    obj.maxAward = $('#taiwklb_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [taiwklb_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function taiwklb_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#taiwklb_queding").bind('click', function(event) {
        taiwklb_rebate = $("#taiwklb_fandian option:last").val();
        if(parseInt($('#taiwklb_zhushu').html()) <= 0 || Number($("#taiwklb_money").html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        taiwklb_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

       /* if(parseInt($('#taiwklb_modeId').val()) == 8){
            if (Number($('#taiwklb_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('taiwklb',taiwklb_playMethod);

        submitParams.lotteryType = "taiwklb";
        var playType = LotteryInfo.getPlayName("kl8",taiwklb_playType);
        submitParams.playType = playType;
        submitParams.playMethod = LotteryInfo.getMethodName("kl8",taiwklb_playMethod);
        submitParams.playTypeIndex = taiwklb_playType;
        submitParams.playMethodIndex = taiwklb_playMethod;
        var selectedBalls = [];

        $("#taiwklb_ballView div.ballView").each(function(){
            $(this).find("span.redBalls_active").each(function(){
                selectedBalls.push($(this).text());
            });
        });
        localStorageUtils.setParam("playMode",$("#taiwklb_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#taiwklb_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#taiwklb_fandian").val());
        submitParams.nums = selectedBalls.join(",");
        submitParams.notes = $('#taiwklb_zhushu').html();
        submitParams.sntuo = taiwklb_sntuo;
        submitParams.multiple = $('#taiwklb_beiNum').val();  //requirement
        submitParams.rebates = $('#taiwklb_fandian').val();  //requirement
        submitParams.playMode = $('#taiwklb_modeId').val();  //requirement
        submitParams.money = $('#taiwklb_money').html();  //requirement
        submitParams.award = $('#taiwklb_minAward').html();  //奖金
        submitParams.maxAward = $('#taiwklb_maxAward').html();  //多级奖金

        submitParams.submit();
        $("#taiwklb_ballView").empty();
        taiwklb_qingkongAll();
    });
}