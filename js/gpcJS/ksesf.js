var ksesf_playType = 1;
var ksesf_playMethod = 7;
var ksesf_sntuo = 0;
var ksesf_rebate;
var ksesfScroll;

//进入这个页面时调用
function ksesfPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("ksesf")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("ksesf_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function ksesfPageUnloadedPanel(){
    $("#ksesfPage_back").off('click');
    $("#ksesf_queding").off('click');
    $("#ksesf_ballView").empty();
    $("#ksesfSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="ksesfPlaySelect"></select>');
    $("#ksesfSelect").append($select);
}

//入口函数
function ksesf_init(){
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
    $("#ksesf_title").html(LotteryInfo.getLotteryNameByTag("ksesf"));
    for(var i = 0; i< LotteryInfo.getPlayLength("esf");i++){
    	if(i == 5)continue;
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("esf",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("esf");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("esf",j) == LotteryInfo.getPlayTypeId("esf",i)){
                var name = LotteryInfo.getMethodName("esf",j);
                if(i == ksesf_playType && j == ksesf_playMethod){
                    $play.append('<option value="ksesf'+LotteryInfo.getMethodIndex("esf",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="ksesf'+LotteryInfo.getMethodIndex("esf",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(ksesf_playMethod,onShowArray)>-1 ){
						ksesf_playType = i;
						ksesf_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#ksesfPlaySelect").append($play);
		}
    }
    
    if($("#ksesfPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("ksesfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:ksesfChangeItem
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

    GetLotteryInfo("ksesf",function (){
        ksesfChangeItem("ksesf"+ksesf_playMethod);
    });

    //添加滑动条
    if(!ksesfScroll){
        ksesfScroll = new IScroll('#ksesfContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("ksesf",LotteryInfo.getLotteryIdByTag("ksesf"));

    //获取上一期开奖
    queryLastPrize("ksesf");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('ksesf');

    //机选选号
    $("#ksesf_random").on('click', function(event) {
        ksesf_randomOne();
    });

    //返回
    $("#ksesfPage_back").on('click', function(event) {
        // ksesf_playType = 0;
        // ksesf_playMethod = 0;
        $("#ksesf_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        ksesf_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#ksesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",ksesf_playMethod));
	//玩法说明
	$("#ksesf_paly_shuoming").off('click');
	$("#ksesf_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#ksesf_shuoming").text());
	});

    qingKong("ksesf");//清空
    ksesf_submitData();
}

function ksesfResetPlayType(){
    ksesf_playType = 0;
    ksesf_playMethod = 0;
}

function ksesfChangeItem(val){
    ksesf_qingkongAll();

    var temp = val.substring("ksesf".length,val.length);

    if(val == 'ksesf1'){
        $("#ksesf_random").hide();
        ksesf_sntuo = 3;
        ksesf_playType = 0;
        ksesf_playMethod = 1;
        $("#ksesf_ballView").empty();
        ksesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("ksesf",tips);
    }else if(val == 'ksesf5'){
        $("#ksesf_random").hide();
        ksesf_sntuo = 3;
        ksesf_playType = 0;
        ksesf_playMethod = 5;
        $("#ksesf_ballView").empty();
        ksesf_qingkongAll();
        var tips = "<p>格式说明<br/>前三组选:01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("ksesf",tips);
    }else if(val == 'ksesf8'){
        $("#ksesf_random").hide();
        ksesf_sntuo = 3;
        ksesf_playType = 1;
        ksesf_playMethod = 8;
        $("#ksesf_ballView").empty();
        ksesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("ksesf",tips);
    }else if(val == 'ksesf12'){
        $("#ksesf_random").hide();
        ksesf_sntuo = 3;
        ksesf_playType = 1;
        ksesf_playMethod = 12;
        $("#ksesf_ballView").empty();
        ksesf_qingkongAll();
        var tips = "<p>格式说明<br/>前二组选:01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("ksesf",tips);
    }else if(parseInt(temp) == 14){
        $("#ksesf_random").show();
        ksesf_sntuo = 0;
        ksesf_playType = 2;
        ksesf_playMethod = parseInt(temp);
        createOneLineLayout("ksesf","请至少选择1个",1,11,true,function(){
            ksesf_calcNotes();
        });
    }else if(val == 'ksesf7'){
        $("#ksesf_random").show();
        ksesf_sntuo = 0;
        ksesf_playType = 1;
        ksesf_playMethod = 7;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tips = [tip1,tip2];
        createTwoLineLayout("ksesf",tips,1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf9'){
        $("#ksesf_random").show();
        ksesf_sntuo = 2;
        ksesf_playType = 1;
        ksesf_playMethod = 9;
        createOneLineLayout("ksesf","请至少选择2个",1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf10'){
        $("#ksesf_random").hide();
        ksesf_sntuo = 1;
        ksesf_playType = 1;
        ksesf_playMethod = 10;
        createDanTuoSpecLayout("ksesf",1,1,10,1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf11'){
        $("#ksesf_random").show();
        ksesf_sntuo = 0;
        ksesf_playType = 1;
        ksesf_playMethod = 11;
        createOneLineLayout("ksesf","请至少选择2个",1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf13'){
        $("#ksesf_random").hide();
        ksesf_sntuo = 1;
        ksesf_playType = 1;
        ksesf_playMethod = 13;
        createDanTuoLayout("ksesf",1,1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf0'){
        $("#ksesf_random").show();
        ksesf_sntuo = 0;
        ksesf_playType = 0;
        ksesf_playMethod = 0;
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("ksesf",tips,1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf2'){
        $("#ksesf_random").show();
        ksesf_sntuo = 2;
        ksesf_playType = 0;
        ksesf_playMethod = 2;
        createOneLineLayout("ksesf","请至少选择3个",1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf3'){
        $("#ksesf_random").hide();
        ksesf_sntuo = 1;
        ksesf_playType = 0;
        ksesf_playMethod = 3;
        createDanTuoSpecLayout("ksesf",2,1,10,1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf4'){
        $("#ksesf_random").show();
        ksesf_sntuo = 0;
        ksesf_playType = 0;
        ksesf_playMethod = 4;
        createOneLineLayout("ksesf","请至少选择3个",1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf6'){
        $("#ksesf_random").hide();
        ksesf_sntuo = 1;
        ksesf_playType = 0;
        ksesf_playMethod = 6;
        createDanTuoLayout("ksesf",2,1,11,true,function(){
            ksesf_calcNotes();
        });
        ksesf_qingkongAll();
    }else if(val == 'ksesf16'){
        $("#ksesf_random").show();
        ksesf_sntuo = 0;
        ksesf_playType = 4;
        ksesf_playMethod = 16;
        ksesf_qingkongAll();
        createOneLineLayout("ksesf","前三位：请至少选择1个",1,11,true,function(){
            ksesf_calcNotes();
        });
    }else if(val == 'ksesf15'){
        $("#ksesf_random").show();
        ksesf_sntuo = 0;
        ksesf_playType = 3;
        ksesf_playMethod = 15;
        ksesf_qingkongAll();
        var tip1 = "第一位：可选1-11个";
        var tip2 = "第二位：可选1-11个";
        var tip3 = "第三位：可选1-11个";
        var tips = [tip1,tip2,tip3];

        createThreeLineLayout("ksesf",tips,1,11,true,function(){
            ksesf_calcNotes();
        });
    }else if(parseInt(temp) < 27 && parseInt(temp) > 18){
        $("#ksesf_random").show();
        ksesf_sntuo = 0;
        ksesf_playType = 6;
        ksesf_playMethod = parseInt(temp);
        createOneLineLayout("ksesf","请至少选择"+(ksesf_playMethod - 18)+"个",1,11,true,function(){
            ksesf_calcNotes();
        });
    }else if(parseInt(temp) < 35 && parseInt(temp) > 26){
        $("#ksesf_random").hide();
        ksesf_sntuo = 3;
        ksesf_playType = 7;
        ksesf_playMethod = parseInt(temp);
        $("#ksesf_ballView").empty();
        ksesf_qingkongAll();
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
        var tips = "<p>格式说明<br/>"+name[ksesf_playMethod - 27]+":"+ (array[ksesf_playMethod - 27]) +"<br/>1)每注必须是"+(ksesf_playMethod - 26)+"个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
        createSingleLayout("ksesf",tips);
    }else if(parseInt(temp) < 42 && parseInt(temp) > 34){
        $("#ksesf_random").hide();
        ksesf_sntuo = 1;
        ksesf_playType = 8;
        ksesf_playMethod = parseInt(temp);
        createDanTuoLayout("ksesf",ksesf_playMethod-34,1,11,true,function(){
            ksesf_calcNotes();
        });
    }

    if(ksesfScroll){
        ksesfScroll.refresh();
        ksesfScroll.scrollTo(0,0,1);
    }
    
    $("#ksesf_shuoming").html(LotteryInfo.getMethodShuoming("esf",temp));
    
    initFooterData("ksesf",temp);
    hideRandomWhenLi("ksesf",ksesf_sntuo,ksesf_playMethod);
    ksesf_calcNotes();
}

/**
 * [ksesf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function ksesf_initFooterButton(){
    if (ksesf_playType == 6 || ksesf_playType == 2 || ksesf_playType == 4) {
        if (LotteryStorage["ksesf"]["line1"].length > 0) {
            $("#ksesf_qingkong").css("opacity",1.0);
        }else{
            $("#ksesf_qingkong").css("opacity",0.4);
        }
    }else if(ksesf_playType == 8){
        if (LotteryStorage["ksesf"]["line1"].length > 0 || LotteryStorage["ksesf"]["line2"].length > 0) {
            $("#ksesf_qingkong").css("opacity",1.0);
        }else{
            $("#ksesf_qingkong").css("opacity",0.4);
        }
    }else if(ksesf_playType == 3){
        if(LotteryStorage["ksesf"]["line1"].length > 0
            || LotteryStorage["ksesf"]["line2"].length > 0
            || LotteryStorage["ksesf"]["line3"].length > 0){
            $("#ksesf_qingkong").css("opacity",1.0);
        }else{
            $("#ksesf_qingkong").css("opacity",0.4);
        }
    }else if(ksesf_playType == 1){
        if (ksesf_playMethod == 7 || ksesf_playMethod == 10 || ksesf_playMethod == 13) {
            if(LotteryStorage["ksesf"]["line1"].length > 0
                || LotteryStorage["ksesf"]["line2"].length > 0){
                $("#ksesf_qingkong").css("opacity",1.0);
            }else{
                $("#ksesf_qingkong").css("opacity",0.4);
            }
        }else if(ksesf_playMethod == 9 || ksesf_playMethod == 11){
            if(LotteryStorage["ksesf"]["line1"].length > 0){
                $("#ksesf_qingkong").css("opacity",1.0);
            }else{
                $("#ksesf_qingkong").css("opacity",0.4);
            }
        }else if(ksesf_playMethod == 8 || ksesf_playMethod == 12){
            $("#ksesf_qingkong").css("opacity",0);
        }
    }else if(ksesf_playType == 0){
        if (ksesf_playMethod == 0) {
            if(LotteryStorage["ksesf"]["line1"].length > 0
                || LotteryStorage["ksesf"]["line2"].length > 0
                || LotteryStorage["ksesf"]["line3"].length > 0){
                $("#ksesf_qingkong").css("opacity",1.0);
            }else{
                $("#ksesf_qingkong").css("opacity",0.4);
            }
        }else if(ksesf_playMethod == 3 || ksesf_playMethod == 6){
            if(LotteryStorage["ksesf"]["line1"].length > 0
                || LotteryStorage["ksesf"]["line2"].length > 0){
                $("#ksesf_qingkong").css("opacity",1.0);
            }else{
                $("#ksesf_qingkong").css("opacity",0.4);
            }
        }else if(ksesf_playMethod == 2 || ksesf_playMethod == 4){
            if(LotteryStorage["ksesf"]["line1"].length > 0){
                $("#ksesf_qingkong").css("opacity",1.0);
            }else{
                $("#ksesf_qingkong").css("opacity",0.4);
            }
        }else if(ksesf_playMethod == 1 || ksesf_playMethod == 5){
            $("#ksesf_qingkong").css("opacity",0);
        }
    }else{
        $("#ksesf_qingkong").css("opacity",0);
    }

    if($("#ksesf_qingkong").css("opacity") == "0"){
        $("#ksesf_qingkong").css("display","none");
    }else{
        $("#ksesf_qingkong").css("display","block");
    }

    if($('#ksesf_zhushu').html() > 0){
        $("#ksesf_queding").css("opacity",1.0);
    }else{
        $("#ksesf_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  ksesf_qingkongAll(){
    $("#ksesf_ballView span").removeClass('redBalls_active');
    LotteryStorage["ksesf"]["line1"] = [];
    LotteryStorage["ksesf"]["line2"] = [];
    LotteryStorage["ksesf"]["line3"] = [];

    localStorageUtils.removeParam("ksesf_line1");
    localStorageUtils.removeParam("ksesf_line2");
    localStorageUtils.removeParam("ksesf_line3");

    $('#ksesf_zhushu').text(0);
    $('#ksesf_money').text(0);
    clearAwardWin("ksesf");
    ksesf_initFooterButton();
}

/**
 * [ksesf_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function ksesf_calcNotes(){
	$('#ksesf_modeId').blur();
	$('#ksesf_fandian').blur();
	
    var notes = 0;

    if (ksesf_playType == 6) {
        notes = mathUtil.getCCombination(LotteryStorage["ksesf"]["line1"].length,ksesf_playMethod - 18);
    }else if(ksesf_playType == 8){
        if(LotteryStorage["ksesf"]["line1"].length == 0 || LotteryStorage["ksesf"]["line2"].length == 0){
            notes = 0;
        }else{
            notes = mathUtil.getCCombination(LotteryStorage["ksesf"]["line2"].length,(ksesf_playMethod - 33)-LotteryStorage["ksesf"]["line1"].length);
        }
    }else if(ksesf_playType == 2 || ksesf_playType == 4){
        notes = LotteryStorage["ksesf"]["line1"].length;
    }else if(ksesf_playType == 1){
        if (ksesf_playMethod == 7){
            for (var i = 0; i < LotteryStorage["ksesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["ksesf"]["line2"].length; j++) {
                    if(LotteryStorage["ksesf"]["line1"][i] != LotteryStorage["ksesf"]["line2"][j]){
                        notes++ ;
                    }
                }
            }
        }else if(ksesf_playMethod == 9){
            notes = mathUtil.getACombination(LotteryStorage["ksesf"]["line1"].length,2);
        }else if(ksesf_playMethod == 10){
            if(LotteryStorage["ksesf"]["line1"].length == 0 || LotteryStorage["ksesf"]["line2"].length == 0){
                notes = 0;
            }else{
                notes = 2 * mathUtil.getCCombination(LotteryStorage["ksesf"]["line2"].length,1);
            }
        }else if(ksesf_playMethod == 11){
            notes = mathUtil.getCCombination(LotteryStorage["ksesf"]["line1"].length,2);
        }else if(ksesf_playMethod == 13){
            if(LotteryStorage["ksesf"]["line1"].length == 0 || LotteryStorage["ksesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["ksesf"]["line2"].length,1);
            }
        }else{  //单式
            notes = ksesfValidateData('onblur');
        }
    }else if(ksesf_playType == 0){
        if (ksesf_playMethod == 0){
            for (var i = 0; i < LotteryStorage["ksesf"]["line1"].length; i++) {
                for (var j = 0; j < LotteryStorage["ksesf"]["line2"].length; j++) {
                    for (var k = 0; k < LotteryStorage["ksesf"]["line3"].length; k++) {
                        if(LotteryStorage["ksesf"]["line1"][i] != LotteryStorage["ksesf"]["line2"][j]
                            &&LotteryStorage["ksesf"]["line1"][i] != LotteryStorage["ksesf"]["line3"][k]
                            && LotteryStorage["ksesf"]["line2"][j] != LotteryStorage["ksesf"]["line3"][k]){
                            notes++ ;
                        }
                    }
                }
            }
        }else if(ksesf_playMethod == 2){
            notes = mathUtil.getACombination(LotteryStorage["ksesf"]["line1"].length,3);
        }else if(ksesf_playMethod == 3){
            if(LotteryStorage["ksesf"]["line1"].length == 0 || LotteryStorage["ksesf"]["line2"].length == 0){
                notes = 0;
            }else {
                notes = 6 * mathUtil.getCCombination(LotteryStorage["ksesf"]["line2"].length,3 - LotteryStorage["ksesf"]["line1"].length);
            }
        }else if(ksesf_playMethod == 4){
            notes = mathUtil.getCCombination(LotteryStorage["ksesf"]["line1"].length,3);
        }else if(ksesf_playMethod == 6){
            if(LotteryStorage["ksesf"]["line1"].length == 0 || LotteryStorage["ksesf"]["line2"].length == 0
                || LotteryStorage["ksesf"]["line1"].length + LotteryStorage["ksesf"]["line2"].length < 3){
                notes = 0;
            }else {
                notes = mathUtil.getCCombination(LotteryStorage["ksesf"]["line2"].length,3 - LotteryStorage["ksesf"]["line1"].length);
            }
        }else{  //单式
            notes = ksesfValidateData('onblur');
        }
    }else if(ksesf_playType == 3){
        notes = LotteryStorage["ksesf"]["line1"].length + LotteryStorage["ksesf"]["line2"].length + LotteryStorage["ksesf"]["line3"].length;
    }else{  //单式
        notes = ksesfValidateData('onblur');
    }

    hideRandomWhenLi('ksesf',ksesf_sntuo,ksesf_playMethod);

    //验证是否为空
    if( $("#ksesf_beiNum").val() =="" || parseInt($("#ksesf_beiNum").val()) == 0){
        $("#ksesf_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#ksesf_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#ksesf_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#ksesf_zhushu').text(notes);
        if($("#ksesf_modeId").val() == "8"){
            $('#ksesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ksesf_beiNum").val()),0.002));
        }else if ($("#ksesf_modeId").val() == "2"){
            $('#ksesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ksesf_beiNum").val()),0.2));
        }else if ($("#ksesf_modeId").val() == "1"){
            $('#ksesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ksesf_beiNum").val()),0.02));
        }else{
            $('#ksesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ksesf_beiNum").val()),2));
        }
    } else {
        $('#ksesf_zhushu').text(0);
        $('#ksesf_money').text(0);
    }
    ksesf_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('ksesf',ksesf_playMethod);
}

/**
 * [ksesf_randomOne 随机一注]
 * @return {[type]} [description]
 */
function ksesf_randomOne(){
    ksesf_qingkongAll();
    if(ksesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(ksesf_playMethod - 18,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["ksesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "ksesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ksesf_playMethod == 14){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["ksesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["ksesf"]["line1"], function(k, v){
            $("#" + "ksesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(ksesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        LotteryStorage["ksesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["ksesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");

        $.each(LotteryStorage["ksesf"]["line1"], function(k, v){
            $("#" + "ksesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["ksesf"]["line2"], function(k, v){
            $("#" + "ksesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(ksesf_playMethod == 9 || ksesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["ksesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "ksesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ksesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        LotteryStorage["ksesf"]["line1"].push(array[0] < 10 ? "0"+array[0] : array[0]+"");
        LotteryStorage["ksesf"]["line2"].push(array[1] < 10 ? "0"+array[1] : array[1]+"");
        LotteryStorage["ksesf"]["line3"].push(array[2] < 10 ? "0"+array[2] : array[2]+"");

        $.each(LotteryStorage["ksesf"]["line1"], function(k, v){
            $("#" + "ksesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["ksesf"]["line2"], function(k, v){
            $("#" + "ksesf_line2" + parseInt(v)).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["ksesf"]["line3"], function(k, v){
            $("#" + "ksesf_line3" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(ksesf_playMethod == 2 || ksesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(k,v){
            LotteryStorage["ksesf"]["line1"][k] = v < 10 ? "0"+v : v+"";
            $("#" + "ksesf_line1" + v).toggleClass("redBalls_active");
        });
    }else if(ksesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["ksesf"]["line1"].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["ksesf"]["line1"], function(k, v){
            $("#" + "ksesf_line1" + parseInt(v)).toggleClass("redBalls_active");
        });
    }else if(ksesf_playMethod == 15){
        var line = mathUtil.getRandomNum(1,4);
        var number = mathUtil.getRandomNum(1,12);
        LotteryStorage["ksesf"]["line"+line].push(number < 10 ? "0"+number : number+"");
        $.each(LotteryStorage["ksesf"]["line"+line], function(k, v){
            $("#" + "ksesf_line" + line + parseInt(v)).toggleClass("redBalls_active");
        });
    }
    ksesf_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function ksesf_checkOutRandom(playMethod){
    var obj = new Object();
    if(ksesf_playType == 6){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(ksesf_playMethod - 18,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(ksesf_playMethod == 14 || ksesf_playMethod == 16){
        var number = mathUtil.getRandomNum(1,12);
        obj.nums = number < 10 ? "0"+number : number;
        obj.notes = 1;
    }else if(ksesf_playMethod == 7){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(ksesf_playMethod == 9){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(ksesf_playMethod == 11){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(ksesf_playMethod == 0){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join("|");
        obj.notes = 1;
    }else if(ksesf_playMethod == 2){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 6;
    }else if(ksesf_playMethod == 4){
        var redBallArray = mathUtil.getInts(1,11);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function(index){
            if(array[index] < 10){
                array[index] = "0"+array[index];
            }
        });
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(ksesf_playMethod == 15){
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
    obj.sntuo = ksesf_sntuo;
    obj.multiple = 1;
    obj.rebates = ksesf_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('ksesf',ksesf_playMethod,obj);  //机选奖金计算
    obj.award = $('#ksesf_minAward').html();     //奖金
    obj.maxAward = $('#ksesf_maxAward').html();  //多级奖金
    return obj;
}


/**
 * [ksesf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function ksesf_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#ksesf_queding").bind('click', function(event) {
		ksesf_rebate = $("#ksesf_fandian option:last").val();
		if(parseInt($('#ksesf_zhushu').html()) <= 0 || Number($("#ksesf_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		ksesf_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#ksesf_modeId').val()) == 8){
			if (Number($('#ksesf_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('ksesf',ksesf_playMethod);

		submitParams.lotteryType = "ksesf";
		var playType = LotteryInfo.getPlayName("esf",ksesf_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("esf",ksesf_playMethod);
		submitParams.playTypeIndex = ksesf_playType;
		submitParams.playMethodIndex = ksesf_playMethod;
		var selectedBalls = [];
		if (ksesf_playType == 6 || ksesf_playType == 2 || ksesf_playType == 4) {
			$("#ksesf_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(ksesf_playType == 8){
			if(parseInt($('#ksesf_zhushu').html())<2){
				toastUtils.showToast('胆拖至少选择2注');
				return;
			}
			$("#ksesf_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("#");
		}else if(ksesf_playType == 1 || ksesf_playType == 0){
			if(ksesf_playMethod == 7 || ksesf_playMethod == 0){
				$("#ksesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else if(ksesf_playMethod == 9 || ksesf_playMethod == 11 || ksesf_playMethod == 2 || ksesf_playMethod == 4){
				$("#ksesf_ballView div.ballView").each(function(){
					$(this).find("span.redBalls_active").each(function(){
						selectedBalls.push($(this).text());
					});
				});
				submitParams.nums = selectedBalls.join(",");
			}else if(ksesf_playMethod == 10 || ksesf_playMethod == 13 || ksesf_playMethod == 3 || ksesf_playMethod == 6){
				if(parseInt($('#ksesf_zhushu').html())<2){
					toastUtils.showToast('胆拖至少选择2注');
					return;
				}
				$("#ksesf_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("#");
			}else if(ksesf_playMethod == 1 || ksesf_playMethod == 8){//直选单式
				//去错误号
				ksesfValidateData("submit");
				var arr = $("#ksesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(ksesf_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(ksesf_playMethod == 1){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}else if(ksesf_playMethod == 5 || ksesf_playMethod == 12){//组选单式
				//去错误号
				ksesfValidateData("submit");
				var arr = $("#ksesf_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(ksesf_playMethod == 12){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(ksesf_playMethod == 5){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
				submitParams.nums = str;
			}
		}else if(ksesf_playMethod == 15) {
			$("#ksesf_ballView div.ballView").each(function(){
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
			ksesfValidateData("submit");
			var arr = $("#ksesf_single").val().split(",");
			for(var i = 0;i<arr.length;i++){
				if(arr[i].split(' ').length<2){
					if(ksesf_playMethod == 28){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
					}else if(ksesf_playMethod == 29){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
					}else if(ksesf_playMethod == 30){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
					}else if(ksesf_playMethod == 31){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
					}else if(ksesf_playMethod == 32){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12);
					}else if(ksesf_playMethod == 33){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14);
					}else if(ksesf_playMethod == 34){
						arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10)+" "+arr[i].split(' ')[0].slice(10,12)+" "+arr[i].split(' ')[0].slice(12,14)+" "+arr[i].split(' ')[0].slice(14,16);
					}
				}
			}
			var str = arr.join(',').replace(new RegExp(/\s+/g),'#').replace(new RegExp(/,+/g),' ').replace(new RegExp(/#+/g),',');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#ksesf_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#ksesf_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#ksesf_fandian").val());
		submitParams.notes = $('#ksesf_zhushu').html();
		submitParams.sntuo = ksesf_sntuo;
		submitParams.multiple = $('#ksesf_beiNum').val();  //requirement
		submitParams.rebates = $('#ksesf_fandian').val();  //requirement
		submitParams.playMode = $('#ksesf_modeId').val();  //requirement
		submitParams.money = $('#ksesf_money').html();  //requirement
		submitParams.award = $('#ksesf_minAward').html();  //奖金
		submitParams.maxAward = $('#ksesf_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#ksesf_ballView").empty();
		ksesf_qingkongAll();
	});
}

function ksesfValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#ksesf_single").val();
    var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
    var	result,
        content = {};
    if(ksesf_playMethod == 1){  //前三直选单式
        content.str = str;
        content.weishu = 8;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if( ksesf_playMethod == 8){  //前二直选单式
        content.str = str;
        content.weishu = 5;
        content.zhiXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    } else if(ksesf_playMethod == 5){  //前三组选单式
        content.str = str;
        content.weishu = 8;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if(ksesf_playMethod == 12){  //前二组选单式
        content.str = str;
        content.weishu = 5;
        content.renXuan = true;
        content.maxNum = 11;
        result = handleSingleStr_deleteErr(content,type);
    }else if (ksesf_playMethod > 26 && ksesf_playMethod < 35){  //任选单式
        var weiNum = parseInt(ksesf_playMethod - 26);
        content.str = str;
        content.weishu = 3*weiNum-1;
        content.renXuan = true;
        content.select = true;
        result = handleSingleStr_deleteErr(content,type);
    }

    $('#ksesf_delRepeat').off('click');
    $('#ksesf_delRepeat').on('click',function () {
        content.str = $('#ksesf_single').val() ? $('#ksesf_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        var array = rptResult.num || [];
        notes = rptResult.length;
        ksesfShowFooter(true,notes);
        $("#ksesf_single").val(array.join(","));
    });

    $("#ksesf_single").val(result.num.join(","));
    var notes = result.length;
    ksesfShowFooter(true,notes);
    return notes;
}

function ksesfShowFooter(isValid,notes){
    $('#ksesf_zhushu').text(notes);
    if($("#ksesf_modeId").val() == "8"){
        $('#ksesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ksesf_beiNum").val()),0.002));
    }else if ($("#ksesf_modeId").val() == "2"){
        $('#ksesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ksesf_beiNum").val()),0.2));
    }else if ($("#ksesf_modeId").val() == "1"){
        $('#ksesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ksesf_beiNum").val()),0.02));
    }else{
        $('#ksesf_money').text(bigNumberUtil.multiply(notes * parseInt($("#ksesf_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    ksesf_initFooterButton();
    calcAwardWin('ksesf',ksesf_playMethod);  //计算奖金和盈利
}