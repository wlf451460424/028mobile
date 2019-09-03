var jxesf_playType = 1;
var jxesf_playMethod = 7;
var jxesf_sntuo = 0;
var jxesf_rebate;
var jxesfScroll;

//进入这个页面时调用
function jxesfPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("jxesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("jxesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function jxesfPageUnloadedPanel(){
    $("#jxesfPage_back").off('click');
    $("#jxesf_queding").off('click');
    $("#jxesf_ballView").empty();
    $("#jxesfSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="jxesfPlaySelect"></select>');
    $("#jxesfSelect").append($select);
}

//入口函数
function jxesf_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("esf").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("esf")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("esf")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
    $("#jxesf_title").html(LotteryInfo.getLotteryNameByTag("jxesf"));
    for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
    	if(i == 5)continue;
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
                var name = LotteryInfo.getMethodName("esf",j);
                if(i == jxesf_playType && j == jxesf_playMethod){
                    $play.append('<option value="jxesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="jxesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(jxesf_playMethod,onShowArray)>-1 ){
						jxesf_playType = i;
						jxesf_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#jxesfPlaySelect").append($play);
		}
    }
    
    if($("#jxesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("jxesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:jxesfChangeItem
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

    GetLotteryInfo("jxesf",function (){
        jxesfChangeItem("jxesf"+jxesf_playMethod);
    });

    //添加滑动条
    if(!jxesfScroll){
        jxesfScroll = new IScroll('#jxesfContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("jxesf",LotteryInfo.getLotteryIdByTag("jxesf"));

    //获取上一期开奖
    queryLastPrize("jxesf");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('jxesf');

    //机选选号
    $("#jxesf_random").on('click', function(event) {
        jxesf_randomOne();
    });

    //返回
    $("#jxesfPage_back").on('click', function(event) {
        // jxesf_playType = 0;
        // jxesf_playMethod = 0;
        $("#jxesf_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        jxesf_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#jxesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",jxesf_playMethod));
	//玩法说明
	$("#jxesf_paly_shuoming").off('click');
	$("#jxesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#jxesf_shuoming").text());
	});

    qingKong("jxesf");//清空
    jxesf_submitData();
}

function jxesfResetPlayType(){
    jxesf_playType = 0;
    jxesf_playMethod = 0;
}

function jxesfChangeItem(val){
    jxesf_qingkongAll();

    var temp = val.substring("jxesf".length,val.length);

    if(val == 'jxesf1'){
        $("#jxesf_random").hide();
        jxesf_sntuo = 3;
        jxesf_playType = 0;
        jxesf_playMethod = 1;
        $("#jxesf_ballView").empty();
        jxesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jxesf",tips);
    }else if(val == 'jxesf5'){
        $("#jxesf_random").hide();
        jxesf_sntuo = 3;
        jxesf_playType = 0;
        jxesf_playMethod = 5;
        $("#jxesf_ballView").empty();
        jxesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jxesf",tips);
    }else if(val == 'jxesf8'){
        $("#jxesf_random").hide();
        jxesf_sntuo = 3;
        jxesf_playType = 1;
        jxesf_playMethod = 8;
        $("#jxesf_ballView").empty();
        jxesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jxesf",tips);
    }else if(val == 'jxesf12'){
        $("#jxesf_random").hide();
        jxesf_sntuo = 3;
        jxesf_playType = 1;
        jxesf_playMethod = 12;
        $("#jxesf_ballView").empty();
        jxesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jxesf",tips);
    }else if(parseInt(temp) == 14){
        $("#jxesf_random").show();
        jxesf_sntuo = 0;
        jxesf_playType = 2;
        jxesf_playMethod = parseInt(temp);
        createOneLineLayout("jxesf","请至少选择1个",1,11,true,function(){
            jxesf_calcNotes();
        });
    }else if(val == 'jxesf7'){
        $("#jxesf_random").show();
        jxesf_sntuo = 0;
        jxesf_playType = 1;
        jxesf_playMethod = 7;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tips = [tip1,tip2];
        createTwoLineLayout("jxesf",tips,1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf9'){
        $("#jxesf_random").show();
        jxesf_sntuo = 2;
        jxesf_playType = 1;
        jxesf_playMethod = 9;
        createOneLineLayout("jxesf","请至少选择2个",1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf10'){
        $("#jxesf_random").hide();
        jxesf_sntuo = 1;
        jxesf_playType = 1;
        jxesf_playMethod = 10;
        createDanTuoSpecLayout("jxesf",1,1,10,1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf11'){
        $("#jxesf_random").show();
        jxesf_sntuo = 0;
        jxesf_playType = 1;
        jxesf_playMethod = 11;
        createOneLineLayout("jxesf","请至少选择2个",1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf13'){
        $("#jxesf_random").hide();
        jxesf_sntuo = 1;
        jxesf_playType = 1;
        jxesf_playMethod = 13;
        createDanTuoLayout("jxesf",1,1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf0'){
        $("#jxesf_random").show();
        jxesf_sntuo = 0;
        jxesf_playType = 0;
        jxesf_playMethod = 0;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("jxesf",tips,1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf2'){
        $("#jxesf_random").show();
        jxesf_sntuo = 2;
        jxesf_playType = 0;
        jxesf_playMethod = 2;
        createOneLineLayout("jxesf","请至少选择3个",1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf3'){
        $("#jxesf_random").hide();
        jxesf_sntuo = 1;
        jxesf_playType = 0;
        jxesf_playMethod = 3;
        createDanTuoSpecLayout("jxesf",2,1,10,1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf4'){
        $("#jxesf_random").show();
        jxesf_sntuo = 0;
        jxesf_playType = 0;
        jxesf_playMethod = 4;
        createOneLineLayout("jxesf","请至少选择3个",1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf6'){
        $("#jxesf_random").hide();
        jxesf_sntuo = 1;
        jxesf_playType = 0;
        jxesf_playMethod = 6;
        createDanTuoLayout("jxesf",2,1,11,true,function(){
            jxesf_calcNotes();
        });
        jxesf_qingkongAll();
    }else if(val == 'jxesf16'){
        $("#jxesf_random").show();
        jxesf_sntuo = 0;
        jxesf_playType = 4;
        jxesf_playMethod = 16;
        jxesf_qingkongAll();
        createOneLineLayout("jxesf","前三位：请至少选择1个",1,11,true,function(){
            jxesf_calcNotes();
        });
    }else if(val == 'jxesf15'){
        $("#jxesf_random").show();
        jxesf_sntuo = 0;
        jxesf_playType = 3;
        jxesf_playMethod = 15;
        jxesf_qingkongAll();
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("jxesf",tips,1,11,true,function(){
            jxesf_calcNotes();
        });
    }else if(parseInt(temp) < 27 && parseInt(temp) > 18){
        $("#jxesf_random").show();
        jxesf_sntuo = 0;
        jxesf_playType = 6;
        jxesf_playMethod = parseInt(temp);
        createOneLineLayout("jxesf","请至少选择"+(jxesf_playMethod - 18)+"个",1,11,true,function(){
            jxesf_calcNotes();
        });
    }else if(parseInt(temp) < 35 && parseInt(temp) > 26){
        $("#jxesf_random").hide();
        jxesf_sntuo = 3;
        jxesf_playType = 7;
        jxesf_playMethod = parseInt(temp);
        $("#jxesf_ballView").empty();
        jxesf_qingkongAll();
	    var array = [
		    "01",
		    "01 02 或 0102",
		    "01 02 03 或 010203",
		    "01 02 03 04 或 01020304",
		    "01 02 03 04 05 或 0102030405",
		    "01 02 03 04 05 06 或 010203040506",
		    "01 02 03 04 05 06 07 或 01020304050607",
		    "01 02 03 04 05 06 07 08 或 0102030405060708"
	    ];
        var name = [
            "一中一",
            "二中二",
            "三中三",
            "四中四",
            "五中五",
            "六中五",
            "七中五",
            "八中五",
        ];
        var tips = "<p>格式说明<br/>"+name[jxesf_playMethod - 27]+":"+ (array[jxesf_playMethod - 27]) +"<br/>1)每注必须是"+(jxesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("jxesf",tips);
    }else if(parseInt(temp) < 42 && parseInt(temp) > 34){
        $("#jxesf_random").hide();
        jxesf_sntuo = 1;
        jxesf_playType = 8;
        jxesf_playMethod = parseInt(temp);
        createDanTuoLayout("jxesf",jxesf_playMethod-34,1,11,true,function(){
            jxesf_calcNotes();
        });
    }

    if(jxesfScroll){
        jxesfScroll.refresh();
        jxesfScroll.scrollTo(0,0,1);
    }
    
    $("#jxesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
    
    initFooterData("jxesf",temp);
    hideRandomWhenLi("jxesf",jxesf_sntuo,jxesf_playMethod);
    jxesf_calcNotes();
}

/**
 * [jxesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function jxesf_initFooterButton(){
    if (jxesf_playType == 6 || jxesf_playType == 2 || jxesf_playType == 4) {
        if (LotteryStorage["jxesf"]["line1"].length > 0) {
            $("#jxesf_qingkong").css("opacity",1.0);
        }else{
            $("#jxesf_qingkong").css("opacity",0.4);
        }
    }else if(jxesf_playType == 8){
        if (LotteryStorage["jxesf"]["line1"].length > 0 || LotteryStorage["jxesf"]["line2"].length > 0) {
            $("#jxesf_qingkong").css("opacity",1.0);
        }else{
            $("#jxesf_qingkong").css("opacity",0.4);
        }
    }else if(jxesf_playType == 3){
        if(LotteryStorage["jxesf"]["line1"].length > 0
            || LotteryStorage["jxesf"]["line2"].length > 0
            || LotteryStorage["jxesf"]["line3"].length > 0){
            $("#jxesf_qingkong").css("opacity",1.0);
        }else{
            $("#jxesf_qingkong").css("opacity",0.4);
        }
    }else if(jxesf_playType == 1){
        if (jxesf_playMethod == 7 || jxesf_playMethod == 10 || jxesf_playMethod == 13) {
            if(LotteryStorage["jxesf"]["line1"].length > 0
                || LotteryStorage["jxesf"]["line2"].length > 0){
                $("#jxesf_qingkong").css("opacity",1.0);
            }else{
                $("#jxesf_qingkong").css("opacity",0.4);
            }
        }else if(jxesf_playMethod == 9 || jxesf_playMethod == 11){
            if(LotteryStorage["jxesf"]["line1"].length > 0){
                $("#jxesf_qingkong").css("opacity",1.0);
            }else{
                $("#jxesf_qingkong").css("opacity",0.4);
            }
        }else if(jxesf_playMethod == 8 || jxesf_playMethod == 12){
            $("#jxesf_qingkong").css("opacity",0);
        }
    }else if(jxesf_playType == 0){
        if (jxesf_playMethod == 0) {
            if(LotteryStorage["jxesf"]["line1"].length > 0
                || LotteryStorage["jxesf"]["line2"].length > 0
                || LotteryStorage["jxesf"]["line3"].length > 0){
                $("#jxesf_qingkong").css("opacity",1.0);
            }else{
                $("#jxesf_qingkong").css("opacity",0.4);
            }
        }else if(jxesf_playMethod == 3 || jxesf_playMethod == 6){
            if(LotteryStorage["jxesf"]["line1"].length > 0
                || LotteryStorage["jxesf"]["line2"].length > 0){
                $("#jxesf_qingkong").css("opacity",1.0);
            }else{
                $("#jxesf_qingkong").css("opacity",0.4);
            }
        }else if(jxesf_playMethod == 2 || jxesf_playMethod == 4){
            if(LotteryStorage["jxesf"]["line1"].length > 0){
                $("#jxesf_qingkong").css("opacity",1.0);
            }else{
                $("#jxesf_qingkong").css("opacity",0.4);
            }
        }else if(jxesf_playMethod == 1 || jxesf_playMethod == 5){
            $("#jxesf_qingkong").css("opacity",0);
        }
    }else{
        $("#jxesf_qingkong").css("opacity",0);
    }

    if($("#jxesf_qingkong").css("opacity") == "0"){
        $("#jxesf_qingkong").css("display","none");
    }else{
        $("#jxesf_qingkong").css("display","block");
    }

    if($('#jxesf_zhushu').html() > 0){
        $("#jxesf_queding").css("opacity",1.0);
    }else{
        $("#jxesf_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  jxesf_qingkongAll(){
    $("#jxesf_ballView span").removeClass('redBalls_active');
    LotteryStorage["jxesf"]["line1"] = [];
    LotteryStorage["jxesf"]["line2"] = [];
    LotteryStorage["jxesf"]["line3"] = [];

    localStorageUtils.removeParam("jxesf_line1");
    localStorageUtils.removeParam("jxesf_line2");
    localStorageUtils.removeParam("jxesf_line3");

    $('#jxesf_zhushu').text(0);
    $('#jxesf_money').text(0);
    clearAwardWin("jxesf");
    jxesf_initFooterButton();
}

/**
 * [jxesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function jxesf_calcNotes(){
	$('#jxesf_modeId').blur();
	$('#jxesf_fandian').blur();
	
    var notes = 0;

    if (jxesf_playType == 6) {
        notes = mathUtil.getCCombination(LotteryStorage["jxesf"]["line1"].length,jxesf_playMethod - 18);
    }else if(jxesf_playType == 8){
        if(LotteryStorage["jxesf"]["line1"].length == 0 || LotteryStorage["jxesf"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["jxesf"]["line2"].length,(jxesf_playMethod - 33)-LotteryStorage["jxesf"]["line1"].length);
        }
    }else if(jxesf_playType == 2 || jxesf_playType == 4){
        notes = LotteryStorage["jxesf"]["line1"].length;
    }else if(jxesf_playType == 1){
        if (jxesf_playMethod == 7){
            for (var i = 0; i < LotteryStorage["jxesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["jxesf"]["line2"].length; j++) {
                    if(LotteryStorage["jxesf"]["line1"][i] != LotteryStorage["jxesf"]["line2"][j]){
                        notes++ ;
                    }
                }
            }
        }else if(jxesf_playMethod == 9){
            notes = mathUtil.getACombination(LotteryStorage["jxesf"]["line1"].length,2);
        }else if(jxesf_playMethod == 10){
            if(LotteryStorage["jxesf"]["line1"].length == 0 || LotteryStorage["jxesf"]["line2"].length == 0){
                notes = 0;
            }else{
                notes = 2 * mathUtil.getCCombination(LotteryStorage["jxesf"]["line2"].length,1);
            }
        }else if(jxesf_playMethod == 11){
            notes = mathUtil.getCCombination(LotteryStorage["jxesf"]["line1"].length,2);
        }else if(jxesf_playMethod == 13){
            if(LotteryStorage["jxesf"]["line1"].length == 0 || LotteryStorage["jxesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["jxesf"]["line2"].length,1);
            }
        }else{  //单式
            notes = jxesfValidateData('onblur');
        }
    }else if(jxesf_playType == 0){
        if (jxesf_playMethod == 0){
            for (var i = 0; i < LotteryStorage["jxesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["jxesf"]["line2"].length; j++) {
                    for (var k = 0; k < LotteryStorage["jxesf"]["line3"].length; k++) {
                        if(LotteryStorage["jxesf"]["line1"][i] != LotteryStorage["jxesf"]["line2"][j]
                            &&LotteryStorage["jxesf"]["line1"][i] != LotteryStorage["jxesf"]["line3"][k]
                            && LotteryStorage["jxesf"]["line2"][j] != LotteryStorage["jxesf"]["line3"][k]){
                            notes++ ;
                        }
                    }
                }
            }
        }else if(jxesf_playMethod == 2){
            notes = mathUtil.getACombination(LotteryStorage["jxesf"]["line1"].length,3);
        }else if(jxesf_playMethod == 3){
            if(LotteryStorage["jxesf"]["line1"].length == 0 || LotteryStorage["jxesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = 6 * mathUtil.getCCombination(LotteryStorage["jxesf"]["line2"].length,3 - LotteryStorage["jxesf"]["line1"].length);
            }
        }else if(jxesf_playMethod == 4){
            notes = mathUtil.getCCombination(LotteryStorage["jxesf"]["line1"].length,3);
        }else if(jxesf_playMethod == 6){
            if(LotteryStorage["jxesf"]["line1"].length == 0 || LotteryStorage["jxesf"]["line2"].length == 0
                || LotteryStorage["jxesf"]["line1"].length + LotteryStorage["jxesf"]["line2"].length < 3){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["jxesf"]["line2"].length,3 - LotteryStorage["jxesf"]["line1"].length);
            }
        }else{  //单式
            notes = jxesfValidateData('onblur');
        }
    }else if(jxesf_playType == 3){
        notes = LotteryStorage["jxesf"]["line1"].length + LotteryStorage["jxesf"]["line2"].length + LotteryStorage["jxesf"]["line3"].length;
    }else{  //单式
        notes = jxesfValidateData('onblur');
    }

    hideRandomWhenLi('jxesf',jxesf_sntuo,jxesf_playMethod);

    //验证是否为空
    if( $("#jxesf_beiNum").val() =="" || parseInt($("#jxesf_beiNum").val()) == 0){
        $("#jxesf_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#jxesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#jxesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#jxesf_zhushu').text(notes);
        if($("#jxesf_modeId").val() == "8"){
            $('#jxesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jxesf_beiNum").val()),0.002));
        }else if ($("#jxesf_modeId").val() == "2"){
            $('#jxesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jxesf_beiNum").val()),0.2));
        }else if ($("#jxesf_modeId").val() == "1"){
            $('#jxesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jxesf_beiNum").val()),0.02));
        }else{
            $('#jxesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jxesf_beiNum").val()),2));
        }
    } else {
        $('#jxesf_zhushu').text(0);
        $('#jxesf_money').text(0);
    }
    jxesf_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('jxesf',jxesf_playMethod);
}

/**
 * [jxesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function jxesf_randomOne(){
    jxesf_qingkongAll();
    if(jxesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(jxesf_playMethod - 18,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jxesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jxesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jxesf_playMethod == 14){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jxesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jxesf"]["line1"], function(k, v){
            $("#" + "jxesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jxesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        LotteryStorage["jxesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["jxesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

        $.each(LotteryStorage["jxesf"]["line1"], function(k, v){
            $("#" + "jxesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jxesf"]["line2"], function(k, v){
            $("#" + "jxesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jxesf_playMethod == 9 || jxesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jxesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jxesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jxesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        LotteryStorage["jxesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["jxesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
        LotteryStorage["jxesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

        $.each(LotteryStorage["jxesf"]["line1"], function(k, v){
            $("#" + "jxesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jxesf"]["line2"], function(k, v){
            $("#" + "jxesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jxesf"]["line3"], function(k, v){
            $("#" + "jxesf_line3" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jxesf_playMethod == 2 || jxesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["jxesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "jxesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jxesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jxesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jxesf"]["line1"], function(k, v){
            $("#" + "jxesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(jxesf_playMethod == 15){
        var line = mathUtil.getRandomNum(1,4);
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["jxesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["jxesf"]["line"+line], function(k, v){
            $("#" + "jxesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
        });
    }
    jxesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function jxesf_checkOutRandom(playMethod){
    var obj = new Object();
    if(jxesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(jxesf_playMethod - 18,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jxesf_playMethod == 14 || jxesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        obj.nums = number < 10 ? "0"+number : number;
        obj.notes = 1;
    }else if(jxesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(jxesf_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(jxesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jxesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(jxesf_playMethod == 2){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 6;
    }else if(jxesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jxesf_playMethod == 15){
        var line = mathUtil.getRandomNum(1,4);
        var number = mathUtil.getRandomNum(1,12);
        var temp = number < 10 ? "0"+number : number;
        if(line == 1){
            obj.nums = temp+"|*|*";
        }else if(line == 2){
            obj.nums = "*|"+temp+"|*";
        }else if(line == 3){
            obj.nums = "*|*|"+temp;
        }
        obj.notes = 1;
    }
    obj.sntuo = jxesf_sntuo;
    obj.multiple = 1;
    obj.rebates = jxesf_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('jxesf',jxesf_playMethod,obj);  //机选奖金计算
    obj.award = $('#jxesf_minAward').html();     //奖金
    obj.maxAward = $('#jxesf_maxAward').html();  //多级奖金
    return obj;
}


/**
 * [jxesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function jxesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#jxesf_queding").bind('click', function(event) {
		jxesf_rebate = $("#jxesf_fandian option:last").val();
		if(parseInt($('#jxesf_zhushu').html()) <= 0 || Number($("#jxesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		jxesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#jxesf_modeId').val()) == 8){
			if (Number($('#jxesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('jxesf',jxesf_playMethod);

		submitParams.lotteryType = "jxesf";
		var playType = LotteryInfo.getPlayName("esf",jxesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",jxesf_playMethod);
		submitParams.playTypeIndex = jxesf_playType;
		submitParams.playMethodIndex = jxesf_playMethod;
		var selectedBalls = [];
		if (jxesf_playType == 6 || jxesf_playType == 2 || jxesf_playType == 4) {
			$("#jxesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(jxesf_playType == 8){
			if(parseInt($('#jxesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#jxesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(jxesf_playType == 1 || jxesf_playType == 0){
			if(jxesf_playMethod == 7 || jxesf_playMethod == 0){
				$("#jxesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(jxesf_playMethod == 9 || jxesf_playMethod == 11 || jxesf_playMethod == 2 || jxesf_playMethod == 4){
				$("#jxesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(jxesf_playMethod == 10 || jxesf_playMethod == 13 || jxesf_playMethod == 3 || jxesf_playMethod == 6){
				if(parseInt($('#jxesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#jxesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(jxesf_playMethod == 1 || jxesf_playMethod == 8){//直选单式
				//去错误号
				jxesfValidateData("submit");
				var arr = $("#jxesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(jxesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(jxesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(jxesf_playMethod == 5 || jxesf_playMethod == 12){//组选单式
				//去错误号
				jxesfValidateData("submit");
				var arr = $("#jxesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(jxesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(jxesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(jxesf_playMethod == 15) {
			$("#jxesf_ballView div.ballView").each(function(){
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
		}else {//任选单式
			//去错误号
			jxesfValidateData("submit");
			var arr = $("#jxesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(jxesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(jxesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(jxesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(jxesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(jxesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(jxesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(jxesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#jxesf_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#jxesf_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#jxesf_fandian").val());
		submitParams.notes = $('#jxesf_zhushu').html();
		submitParams.sntuo = jxesf_sntuo;
		submitParams.multiple = $('#jxesf_beiNum').val();  //requirement
		submitParams.rebates = $('#jxesf_fandian').val();  //requirement
		submitParams.playMode = $('#jxesf_modeId').val();  //requirement
		submitParams.money = $('#jxesf_money').html();  //requirement
		submitParams.award = $('#jxesf_minAward').html();  //奖金
		submitParams.maxAward = $('#jxesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#jxesf_ballView").empty();
		jxesf_qingkongAll();
	});
}

function jxesfValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#jxesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
    var	result,
        content = {};
    if(jxesf_playMethod == 1){  //前三直选单式
        content.str = str;
        content.weishu = 8;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if( jxesf_playMethod == 8){  //前二直选单式
        content.str = str;
        content.weishu = 5;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    } else if(jxesf_playMethod == 5){  //前三组选单式
        content.str = str;
        content.weishu = 8;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if(jxesf_playMethod == 12){  //前二组选单式
        content.str = str;
        content.weishu = 5;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if (jxesf_playMethod > 26 && jxesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(jxesf_playMethod - 26);
        content.str = str;
        content.weishu = 3*weiNum-1;
        content.renXuan = true;
        content.select = true;
        result = handleSingleStr_deleteErr(content,type);
    }

    $('#jxesf_delRepeat').off('click');
    $('#jxesf_delRepeat').on('click',function () {
        content.str = $('#jxesf_single').val() ? $('#jxesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        var array = rptResult.num || [];
        notes = rptResult.length;
        jxesfShowFooter(true,notes);
        $("#jxesf_single").val(array.join(","));
    });

    $("#jxesf_single").val(result.num.join(","));
    var notes = result.length;
    jxesfShowFooter(true,notes);
    return notes;
}

function jxesfShowFooter(isValid,notes){
    $('#jxesf_zhushu').text(notes);
    if($("#jxesf_modeId").val() == "8"){
        $('#jxesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jxesf_beiNum").val()),0.002));
    }else if ($("#jxesf_modeId").val() == "2"){
        $('#jxesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jxesf_beiNum").val()),0.2));
    }else if ($("#jxesf_modeId").val() == "1"){
        $('#jxesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jxesf_beiNum").val()),0.02));
    }else{
        $('#jxesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#jxesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    jxesf_initFooterButton();
    calcAwardWin('jxesf',jxesf_playMethod);  //计算奖金和盈利
}