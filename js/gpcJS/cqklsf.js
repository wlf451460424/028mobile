var cqklsf_playType = 0;
var cqklsf_playMethod = 0;
var cqklsf_sntuo = 0;
var cqklsf_rebate;
var cqklsfScroll;

//进入这个页面时调用
function cqklsfPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("cqklsf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("cqklsf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function cqklsfPageUnloadedPanel(){
    $("#cqklsf_queding").off('click');
    $("#cqklsfPage_back").off('click');
    $("#cqklsf_ballView").empty();
    $("#cqklsfSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="cqklsfPlaySelect"></select>');
    $("#cqklsfSelect").append($select);
}

//入口函数
function cqklsf_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("klsf").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("klsf")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("klsf")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
    $("#cqklsf_title").html(LotteryInfo.getLotteryNameByTag("cqklsf"));
    for(var i = 0; i< LotteryInfo.getPlayLength("klsf");i++){
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("klsf",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("klsf");j++){
            
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("klsf",j) == LotteryInfo.getPlayTypeId("klsf",i)){
                var name = LotteryInfo.getMethodName("klsf",j);
                if(i == cqklsf_playType && j == cqklsf_playMethod){
                    $play.append('<option value="cqklsf'+LotteryInfo.getMethodIndex("klsf",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="cqklsf'+LotteryInfo.getMethodIndex("klsf",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(cqklsf_playMethod,onShowArray)>-1 ){
						cqklsf_playType = i;
						cqklsf_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#cqklsfPlaySelect").append($play);
		}
    }
    
    if($("#cqklsfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("cqklsfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:cqklsfChangeItem
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

    GetLotteryInfo("cqklsf",function (){
        cqklsfChangeItem("cqklsf"+cqklsf_playMethod);
    });

    //添加滑动条
    if(!cqklsfScroll){
        cqklsfScroll = new IScroll('#cqklsfContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("cqklsf",LotteryInfo.getLotteryIdByTag("cqklsf"));

    //获取上一期开奖
    queryLastPrize("cqklsf");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('cqklsf');

    //机选选号
    $("#cqklsf_random").on('click', function(event) {
        cqklsf_randomOne();
    });
    
    $("#cqklsf_shuoming").html(LotteryInfo.getMethodShuoming("klsf",cqklsf_playMethod));
	//玩法说明
	$("#cqklsf_paly_shuoming").off('click');
	$("#cqklsf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#cqklsf_shuoming").text());
	});

    //返回
    $("#cqklsfPage_back").on('click', function(event) {
        // cqklsf_playType = 0;
        // cqklsf_playMethod = 0;
        $("#cqklsf_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        cqklsf_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("cqklsf");//清空
    cqklsf_submitData();
}

function cqklsfResetPlayType(){
    cqklsf_playType = 0;
    cqklsf_playMethod = 0;
}

function cqklsfChangeItem(val) {
    cqklsf_qingkongAll();
    var temp = val.substring("cqklsf".length,val.length);
    if(val == "cqklsf0"){
        //前三直选
        $("#cqklsf_random").hide();
        cqklsf_sntuo = 0;
        cqklsf_playType = 0;
        cqklsf_playMethod = 0;
        createThreeLineLayout("cqklsf", ["第一位","第二位","第三位"],1,20,true,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf1"){
        //后三直选
        $("#cqklsf_random").hide();
        cqklsf_sntuo = 0;
        cqklsf_playType = 0;
        cqklsf_playMethod = 1;
        createThreeLineLayout("cqklsf", ["第六位","第七位","第八位"],1,20,true,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf2"){
        //前三组选
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 0;
        cqklsf_playMethod = 2;
        createOneLineLayout("cqklsf","至少选择3个",1,20,true,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf3"){
        //后三组选
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 0;
        cqklsf_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createOneLineLayout("cqklsf","至少选择3个",1,20,true,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf4"){
        //二星直选
        $("#cqklsf_random").hide();
        cqklsf_sntuo = 0;
        cqklsf_playType = 1;
        cqklsf_playMethod = 4;
        createTwoLineLayout("cqklsf",["第一位","第二位"],1,20,true,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf5"){
        //二星组选
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 1;
        cqklsf_playMethod = 5;
        createOneLineLayout("cqklsf","至少选择2个",1,20,true,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(parseInt(temp) > 5 && parseInt(temp) < 14){
        //定位胆
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 2;
        cqklsf_playMethod = parseInt(temp);
        var tips = ["第一位：至少选择1个号码",
            "第二位：至少选择1个号码",
            "第三位：至少选择1个号码",
            "第四位：至少选择1个号码",
            "第五位：至少选择1个号码",
            "第六位：至少选择1个号码",
            "第七位：至少选择1个号码",
            "第八位：至少选择1个号码"
        ];
        createOneLineLayout("cqklsf",tips[cqklsf_playMethod - 6],1,20,true,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(parseInt(temp) > 13 && parseInt(temp) < 19){
        //任选复式
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 3;
        cqklsf_playMethod = parseInt(temp);
        var tips = ["一中一:至少选择1个号码",
            "二中二:至少选择2个号码",
            "三中三:至少选择3个号码",
            "四中四:至少选择4个号码",
            "五中五:至少选择5个号码"
        ];
        createOneLineLayout("cqklsf",tips[cqklsf_playMethod - 14],1,20,true,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(parseInt(temp) > 18 && parseInt(temp) < 23){
        //任选胆拖
        $("#cqklsf_random").hide();
        cqklsf_sntuo = 1;
        cqklsf_playType = 4;
        cqklsf_playMethod = parseInt(temp);
        createDanTuoLayout("cqklsf",cqklsf_playMethod - 18,1,20, true, function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf23"){
        //大小单双
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 5;
        cqklsf_playMethod = 23;
        var tips = ["第一位","第二位","第三位","第四位","第五位","第六位","第七位","第八位"];
        var text = ["大","小","单","双","尾大","尾小","和单","和双"];
        createTextBallLayout("cqklsf",tips, text,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf24"){
        //大小和
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 5;
        cqklsf_playMethod = 24;
        createTextBallOneLayout("cqklsf",["大","小","和"],["至少选择一个号码"],function () {
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf25"){
        //四季方位
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 6;
        cqklsf_playMethod = 25;
        var tips = ["第一位","第二位","第三位","第四位","第五位","第六位","第七位","第八位"];
        var text = ["春","夏","秋","冬","东","南","西","北"];
        createTextBallLayout("cqklsf",tips, text,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(val == "cqklsf26"){
        //五行
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 7;
        cqklsf_playMethod = 26;
        var tips = ["第一位","第二位","第三位","第四位","第五位","第六位","第七位","第八位"];
        var text = ["金","木","水","火","土"];
        createTextBallLayout("cqklsf",tips, text,function(){
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }else if(parseInt(temp) == 27 || parseInt(temp) == 28){
        //龙虎
        $("#cqklsf_random").show();
        cqklsf_sntuo = 0;
        cqklsf_playType = 8;
        cqklsf_playMethod = parseInt(temp);
        var array = [];
        for (var i = 1;i < 9; i++){
            for (var j = i+1; j < 9;j++){
                array.push(i+"V"+j);
            }
        }
        createTextBallOneLayout("cqklsf",array,["至少选择一个号码"],function () {
            cqklsf_calcNotes();
        });
        cqklsf_qingkongAll();
    }

    if(cqklsfScroll){
        cqklsfScroll.refresh();
        cqklsfScroll.scrollTo(0,0,1);
    }
    
    $("#cqklsf_shuoming").html(LotteryInfo.getMethodShuoming("klsf",temp));
    
    initFooterData("cqklsf",temp);
    hideRandomWhenLi("cqklsf",cqklsf_sntuo,cqklsf_playMethod);
    cqklsf_calcNotes();
}
/**
 * [cqklsf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function cqklsf_initFooterButton(){
    if(cqklsf_playMethod == 0 || cqklsf_playMethod == 1 ){
        if(LotteryStorage["cqklsf"]["line1"].length > 0 || LotteryStorage["cqklsf"]["line2"].length > 0 ||
            LotteryStorage["cqklsf"]["line3"].length > 0 ){
            $("#cqklsf_qingkong").css("opacity",1.0);
        }else{
            $("#cqklsf_qingkong").css("opacity",0.4);
        }
    }else if(cqklsf_playMethod == 2 || cqklsf_playMethod == 3 || cqklsf_playMethod == 5 || cqklsf_playType == 2 || cqklsf_playType == 3
        || cqklsf_playMethod == 24 || cqklsf_playMethod == 27 || cqklsf_playMethod == 28){
        if(LotteryStorage["cqklsf"]["line1"].length > 0){
            $("#cqklsf_qingkong").css("opacity",1.0);
        }else{
            $("#cqklsf_qingkong").css("opacity",0.4);
        }
    }else if(cqklsf_playMethod == 4 || cqklsf_playType == 4){
        if(LotteryStorage["cqklsf"]["line1"].length > 0 || LotteryStorage["cqklsf"]["line2"].length > 0){
            $("#cqklsf_qingkong").css("opacity",1.0);
        }else{
            $("#cqklsf_qingkong").css("opacity",0.4);
        }
    }else if(cqklsf_playMethod == 23 || cqklsf_playMethod == 25 || cqklsf_playMethod == 26){
        if(LotteryStorage["cqklsf"]["line1"].length > 0 || LotteryStorage["cqklsf"]["line2"].length > 0 ||
            LotteryStorage["cqklsf"]["line3"].length > 0 || LotteryStorage["cqklsf"]["line4"].length > 0 || LotteryStorage["cqklsf"]["line5"].length > 0 ||
            LotteryStorage["cqklsf"]["line6"].length > 0 || LotteryStorage["cqklsf"]["line7"].length > 0 || LotteryStorage["cqklsf"]["line8"].length > 0){
            $("#cqklsf_qingkong").css("opacity",1.0);
        }else{
            $("#cqklsf_qingkong").css("opacity",0.4);
        }
    }else{
        $("#cqklsf_qingkong").css("opacity",0);
    }

    if($("#cqklsf_qingkong").css("opacity") == "0"){
        $("#cqklsf_qingkong").css("display","none");
    }else{
        $("#cqklsf_qingkong").css("display","block");
    }

    if($('#cqklsf_zhushu').html() > 0){
        $("#cqklsf_queding").css("opacity",1.0);
    }else{
        $("#cqklsf_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  cqklsf_qingkongAll(){
    $("#cqklsf_ballView span").removeClass('redBalls_active');
    LotteryStorage["cqklsf"]["line1"] = [];
    LotteryStorage["cqklsf"]["line2"] = [];
    LotteryStorage["cqklsf"]["line3"] = [];
    LotteryStorage["cqklsf"]["line4"] = [];
    LotteryStorage["cqklsf"]["line5"] = [];
    LotteryStorage["cqklsf"]["line6"] = [];
    LotteryStorage["cqklsf"]["line7"] = [];
    LotteryStorage["cqklsf"]["line8"] = [];

    localStorageUtils.removeParam("cqklsf_line1");
    localStorageUtils.removeParam("cqklsf_line2");
    localStorageUtils.removeParam("cqklsf_line3");
    localStorageUtils.removeParam("cqklsf_line4");
    localStorageUtils.removeParam("cqklsf_line5");
    localStorageUtils.removeParam("cqklsf_line6");
    localStorageUtils.removeParam("cqklsf_line7");
    localStorageUtils.removeParam("cqklsf_line8");

    $('#cqklsf_zhushu').text(0);
    $('#cqklsf_money').text(0);
    clearAwardWin("cqklsf");
    cqklsf_initFooterButton();
}

/**
 * [cqklsf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function cqklsf_calcNotes(){
	$('#cqklsf_modeId').blur();
	$('#cqklsf_fandian').blur();
	
    var notes = 0;

    if(cqklsf_playMethod == 0 || cqklsf_playMethod == 1){
        for (var i = 0; i < LotteryStorage["cqklsf"]["line1"].length; i++) {
            for (var j = 0; j < LotteryStorage["cqklsf"]["line2"].length; j++) {
                for (var k = 0; k < LotteryStorage["cqklsf"]["line3"].length; k++) {
                    if(LotteryStorage["cqklsf"]["line1"][i] != LotteryStorage["cqklsf"]["line2"][j]
                        &&LotteryStorage["cqklsf"]["line1"][i] != LotteryStorage["cqklsf"]["line3"][k]
                        && LotteryStorage["cqklsf"]["line2"][j] != LotteryStorage["cqklsf"]["line3"][k]){
                        notes++ ;
                    }
                }
            }
        }
    }else if(cqklsf_playMethod == 2 || cqklsf_playMethod == 3){
        notes = mathUtil.getCCombination(LotteryStorage["cqklsf"]["line1"].length,3);
    }else if(cqklsf_playMethod == 4){
        for (var i = 0; i < LotteryStorage["cqklsf"]["line1"].length; i++) {
            for (var j = 0; j < LotteryStorage["cqklsf"]["line2"].length; j++) {
                if(LotteryStorage["cqklsf"]["line1"][i] != LotteryStorage["cqklsf"]["line2"][j]){
                    notes++ ;
                }
            }
        }
    }else if(cqklsf_playMethod == 5){
        notes = mathUtil.getCCombination(LotteryStorage["cqklsf"]["line1"].length,2);
    }else if(cqklsf_playType == 2 || cqklsf_playMethod == 24 || cqklsf_playType == 8){
        notes = LotteryStorage["cqklsf"]["line1"].length;
    }else if(cqklsf_playType == 3){
        notes = mathUtil.getCCombination(LotteryStorage["cqklsf"]["line1"].length,cqklsf_playMethod - 13);
    }else if(cqklsf_playType == 4){
        if(LotteryStorage["cqklsf"]["line1"].length == 0 || LotteryStorage["cqklsf"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["cqklsf"]["line2"].length,(cqklsf_playMethod - 17)-LotteryStorage["cqklsf"]["line1"].length);
        }
    }else if(cqklsf_playMethod == 23 || cqklsf_playMethod == 25 || cqklsf_playMethod == 26){
       notes = LotteryStorage["cqklsf"]["line1"].length + LotteryStorage["cqklsf"]["line2"].length +
           LotteryStorage["cqklsf"]["line3"].length + LotteryStorage["cqklsf"]["line4"].length +
           LotteryStorage["cqklsf"]["line5"].length + LotteryStorage["cqklsf"]["line6"].length +
           LotteryStorage["cqklsf"]["line7"].length + LotteryStorage["cqklsf"]["line8"].length;

    }

    if(cqklsf_sntuo == 3 || cqklsf_sntuo == 1 || getplayid(LotteryInfo.getId("klsf","cqklsf"),LotteryInfo.getMethodId("klsf",cqklsf_playMethod))){
    }else{
        if(parseInt($('#cqklsf_modeId').val()) == 8){
            $("#cqklsf_random").hide();
        }else{
            $("#cqklsf_random").show();
        }
    }

    //验证是否为空
    if( $("#cqklsf_beiNum").val() =="" || parseInt($("#cqklsf_beiNum").val()) == 0){
        $("#cqklsf_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#cqklsf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#cqklsf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#cqklsf_zhushu').text(notes);
        if($("#cqklsf_modeId").val() == "8"){
            $('#cqklsf_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqklsf_beiNum").val()),0.002));
        }else if ($("#cqklsf_modeId").val() == "2"){
            $('#cqklsf_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqklsf_beiNum").val()),0.2));
        }else if ($("#cqklsf_modeId").val() == "1"){
            $('#cqklsf_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqklsf_beiNum").val()),0.02));
        }else{
            $('#cqklsf_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqklsf_beiNum").val()),2));
        }
    } else {
        $('#cqklsf_zhushu').text(0);
        $('#cqklsf_money').text(0);
    }
    cqklsf_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('cqklsf',cqklsf_playMethod);
}

/**
 * [cqklsf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function cqklsf_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#cqklsf_queding").bind('click', function(event) {
        cqklsf_rebate = $("#cqklsf_fandian option:last").val();
        if(parseInt($('#cqklsf_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        cqklsf_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#cqklsf_modeId').val()) == 8){
            if (Number($('#cqklsf_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('cqklsf',cqklsf_playMethod);

        submitParams.lotteryType = "cqklsf";
        var play = LotteryInfo.getPlayName("klsf",cqklsf_playType);
        var playMethod = LotteryInfo.getMethodName("klsf",cqklsf_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = cqklsf_playType;
        submitParams.playMethodIndex = cqklsf_playMethod;
        var selectedBalls = [];
        if(cqklsf_playMethod == 0 || cqklsf_playMethod == 1 || cqklsf_playMethod == 4){
            $("#cqklsf_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(cqklsf_playMethod == 2 || cqklsf_playMethod == 3 || cqklsf_playMethod == 5 || cqklsf_playType == 2 || cqklsf_playType == 3 || cqklsf_playMethod == 24){
            $("#cqklsf_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(cqklsf_playType == 4){
            if(parseInt($('#cqklsf_zhushu').html())<2){
                toastUtils.showToast('胆拖至少选择2注');
                return;
            }
            $("#cqklsf_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("#");
        }else if(cqklsf_playMethod == 23 || cqklsf_playMethod == 25 || cqklsf_playMethod == 26){
            $("#cqklsf_ballView div.ballView").each(function(){
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
        }else if(cqklsf_playType == 8){
            $("#cqklsf_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }
        localStorageUtils.setParam("playMode",$("#cqklsf_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#cqklsf_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#cqklsf_fandian").val());
        submitParams.notes = $('#cqklsf_zhushu').html();
        submitParams.sntuo = cqklsf_sntuo;
        submitParams.multiple = $('#cqklsf_beiNum').val();  //requirement
        submitParams.rebates = $('#cqklsf_fandian').val();  //requirement
        submitParams.playMode = $('#cqklsf_modeId').val();  //requirement
        submitParams.money = $('#cqklsf_money').html();  //requirement
        submitParams.award = $('#cqklsf_minAward').html();  //奖金
        submitParams.maxAward = $('#cqklsf_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#cqklsf_ballView").empty();
        cqklsf_qingkongAll();
    });
}

/**
 * [cqklsf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function cqklsf_randomOne(){
    cqklsf_qingkongAll();
    if(cqklsf_playMethod == 2 || cqklsf_playMethod == 3){
        var redBallArray = mathUtil.getInts(1,20);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["cqklsf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "cqklsf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(cqklsf_playMethod == 5){
        var redBallArray = mathUtil.getInts(1,20);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["cqklsf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "cqklsf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(cqklsf_playType == 2){
        var redBallArray = mathUtil.getInts(1,20);
        var array = mathUtil.getDifferentNums(1,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["cqklsf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "cqklsf_line1" + v).toggleClass("redBalls_active");
        });

    }else if(cqklsf_playType == 3){
        var redBallArray = mathUtil.getInts(1,20);
        var array = mathUtil.getDifferentNums(cqklsf_playMethod - 13,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["cqklsf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "cqklsf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(cqklsf_playMethod == 23){
        var line = mathUtil.getRandomNum(1,9);
        var num = mathUtil.getRandomNum(0,8);
        var array = ["大","小","单","双","尾大","尾小","和单","和双"];
        LotteryStorage["cqklsf"]["line"+line].push(array[num]);
        $("#cqklsf_line"+line + num).toggleClass("redBalls_active");
    }else if(cqklsf_playMethod == 24){
        var num = mathUtil.getRandomNum(0,3);
        var array = ["大","小","和"];
        LotteryStorage["cqklsf"]["line1"].push(array[num]);
        $("#cqklsf_line1" + num).toggleClass("redBalls_active");
    }else if(cqklsf_playMethod == 25){
        var line = mathUtil.getRandomNum(1,9);
        var num = mathUtil.getRandomNum(0,8);
        var array = ["春","夏","秋","冬","东","南","西","北"];
        LotteryStorage["cqklsf"]["line"+line].push(array[num]);
        $("#cqklsf_line"+line + num).toggleClass("redBalls_active");
    }else if(cqklsf_playMethod == 26){
        var line = mathUtil.getRandomNum(1,9);
        var num = mathUtil.getRandomNum(0,5);
        var array = ["金","木","水","火","土"];
        LotteryStorage["cqklsf"]["line"+line].push(array[num]);
        $("#cqklsf_line"+line + num).toggleClass("redBalls_active");
    }else if(cqklsf_playType == 8){
        var num = mathUtil.getRandomNum(0,28);
        var array = [];
        for (var i = 1;i < 9; i++){
            for (var j = i+1; j < 9;j++){
                array.push(i+"V"+j);
            }
        }
        LotteryStorage["cqklsf"]["line1"].push(array[num]);
        $("#cqklsf_line1" + num).toggleClass("redBalls_active");
    }
    cqklsf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function cqklsf_checkOutRandom(playMethod){
    var obj = new Object();
    if(cqklsf_playMethod == 2 || cqklsf_playMethod == 3){
        var redBallArray = mathUtil.getInts(1,20);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(cqklsf_playMethod == 5){
        var redBallArray = mathUtil.getInts(1,20);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(cqklsf_playType == 2){
        var redBallArray = mathUtil.getInts(1,20);
        var array = mathUtil.getDifferentNums(1,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(cqklsf_playType == 3){
        var redBallArray = mathUtil.getInts(1,20);
        var array = mathUtil.getDifferentNums(cqklsf_playMethod - 13,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(cqklsf_playMethod == 23){
        var line = mathUtil.getRandomNum(0,8);
        var num = mathUtil.getRandomNum(0,8);
        var array = ["大","小","单","双","尾大","尾小","和单","和双"];
        var arr = [];
        for (var i = 0;i < 8;i++){
            if(i == line){
                arr.push(array[num]);
            }else{
                arr.push("*")
            }
        }
        obj.nums = arr.join("|");
        obj.notes = 1;
    }else if(cqklsf_playMethod == 24){
        var num = mathUtil.getRandomNum(0,3);
        var array = ["大","小","和"];
        obj.nums = array[num];
        obj.notes = 1;
    }else if(cqklsf_playMethod == 25){
        var line = mathUtil.getRandomNum(0,8);
        var num = mathUtil.getRandomNum(0,8);
        var array = ["春","夏","秋","冬","东","南","西","北"];
        var arr = [];
        for (var i = 0;i < 8;i++){
            if(i == line){
                arr.push(array[num]);
            }else{
                arr.push("*")
            }
        }
        obj.nums = arr.join("|");
        obj.notes = 1;
    }else if(cqklsf_playMethod == 26){
        var line = mathUtil.getRandomNum(0,8);
        var num = mathUtil.getRandomNum(0,5);
        var array = ["金","木","水","火","土"];
        var arr = [];
        for (var i = 0;i < 8;i++){
            if(i == line){
                arr.push(array[num]);
            }else{
                arr.push("*")
            }
        }
        obj.nums = arr.join("|");
        obj.notes = 1;
    }else if(cqklsf_playType == 8){
        var num = mathUtil.getRandomNum(0,28);
        var array = [];
        for (var i = 1;i < 9; i++){
            for (var j = i+1; j < 9;j++){
                array.push(i+"V"+j);
            }
        }
        obj.nums = array[num];
        obj.notes = 1;
    }
    obj.sntuo = cqklsf_sntuo;
    obj.multiple = 1;
    obj.rebates = cqklsf_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('cqklsf',cqklsf_playMethod,obj);  //机选奖金计算
    obj.award = $('#cqklsf_minAward').html();     //奖金
    obj.maxAward = $('#cqklsf_maxAward').html();  //多级奖金
    return obj;
}
