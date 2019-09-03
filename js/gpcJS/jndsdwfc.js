var jndsdwfc_playType = 2;
var jndsdwfc_playMethod = 15;
var jndsdwfc_sntuo = 0;
var jndsdwfc_rebate;
var jndsdwfcScroll;

//进入这个页面时调用
function jndsdwfcPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("jndsdwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("jndsdwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function jndsdwfcPageUnloadedPanel(){
    $("#jndsdwfc_queding").off('click');
    $("#jndsdwfcPage_back").off('click');
    $("#jndsdwfc_ballView").empty();
    $("#jndsdwfcSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="jndsdwfcPlaySelect"></select>');
    $("#jndsdwfcSelect").append($select);
}

//入口函数
function jndsdwfc_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("ssc").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("ssc")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("ssc")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
    $("#jndsdwfc_title").html(LotteryInfo.getLotteryNameByTag("jndsdwfc"));
    for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
                var name = LotteryInfo.getMethodName("ssc",j);
                if(i == jndsdwfc_playType && j == jndsdwfc_playMethod){
                    $play.append('<option value="jndsdwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="jndsdwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(jndsdwfc_playMethod,onShowArray)>-1 ){
						jndsdwfc_playType = i;
						jndsdwfc_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#jndsdwfcPlaySelect").append($play);
		}
    }
    
    if($("#jndsdwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("jndsdwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:jndsdwfcChangeItem
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

    GetLotteryInfo("jndsdwfc",function (){
        jndsdwfcChangeItem("jndsdwfc"+jndsdwfc_playMethod);
    });

    //添加滑动条
    if(!jndsdwfcScroll){
        jndsdwfcScroll = new IScroll('#jndsdwfcContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("jndsdwfc",LotteryInfo.getLotteryIdByTag("jndsdwfc"));

    //获取上一期开奖
    queryLastPrize("jndsdwfc");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('jndsdwfc');

    //机选选号
    $("#jndsdwfc_random").off('click');
    $("#jndsdwfc_random").on('click', function(event) {
        jndsdwfc_randomOne();
    });
    
    $("#jndsdwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",jndsdwfc_playMethod));
	//玩法说明
	$("#jndsdwfc_paly_shuoming").off('click');
	$("#jndsdwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#jndsdwfc_shuoming").text());
	});

    //返回
    $("#jndsdwfcPage_back").on('click', function(event) {
        // jndsdwfc_playType = 2;
        // jndsdwfc_playMethod = 15;
        $("#jndsdwfc_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        jndsdwfc_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("jndsdwfc");//清空
    jndsdwfc_submitData();
}

function jndsdwfcResetPlayType(){
    jndsdwfc_playType = 2;
    jndsdwfc_playMethod = 15;
}

function jndsdwfcChangeItem(val) {
    jndsdwfc_qingkongAll();
    var temp = val.substring("jndsdwfc".length,val.length);
    if(val == "jndsdwfc0"){
        //直选复式
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 0;
        createFiveLineLayout("jndsdwfc", function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc1"){
        //直选单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 1;
        $("#jndsdwfc_ballView").empty();
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc2"){
        //组选120
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 2;
        createOneLineLayout("jndsdwfc","至少选择5个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc3"){
        //组选60
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc4"){
        //组选30
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 4;
        var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc5"){
        //组选20
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 5;
        var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc6"){
        //组选10
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 6;
        var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc7"){
        //组选5
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 7;
        var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc8"){
        //总和大小单双
        $("#jndsdwfc_random").show();
        var num = ["大","小","单","双"];
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 0;
        jndsdwfc_playMethod = 8;
        createNonNumLayout("jndsdwfc",jndsdwfc_playMethod,num,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc9"){
        //直选复式
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 1;
        jndsdwfc_playMethod = 9;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createFourLineLayout("jndsdwfc",tips, function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc10"){
        //直选单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 1;
        jndsdwfc_playMethod = 10;
        $("#jndsdwfc_ballView").empty();
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc11"){
        //组选24
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 1;
        jndsdwfc_playMethod = 11;
        createOneLineLayout("jndsdwfc","至少选择4个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc12"){
        //组选12
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 1;
        jndsdwfc_playMethod = 12;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc13"){
        //组选6
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 1;
        jndsdwfc_playMethod = 13;
        createOneLineLayout("jndsdwfc","二重号:至少选择2个号码",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc14"){
        //组选4
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 1;
        jndsdwfc_playMethod = 14;
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc15"){
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 15;
        var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createThreeLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc16"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 16;
        $("#jndsdwfc_ballView").empty();
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc17"){
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 17;
        createSumLayout("jndsdwfc",0,27,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc18"){
        //直选跨度
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 18;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc19"){
        //后三组三
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 19;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc20"){
        //后三组六
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 20;
        createOneLineLayout("jndsdwfc","至少选择3个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc21"){
        //后三和值
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 21;
        createSumLayout("jndsdwfc",1,26,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc22"){
        //后三组选包胆
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 22;
        jndsdwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("jndsdwfc",array,["请选择一个号码"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc23"){
        //后三混合组选
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 23;
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc24"){
        //和值尾数
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 24;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc25"){
        //特殊号
        $("#jndsdwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 2;
        jndsdwfc_playMethod = 25;
        createNonNumLayout("jndsdwfc",jndsdwfc_playMethod,num,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc26"){
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 26;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
        createThreeLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc27"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 27;
        $("#jndsdwfc_ballView").empty();
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc28"){
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 28;
        createSumLayout("jndsdwfc",0,27,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc29"){
        //直选跨度
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 29;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc30"){
        //中三组三
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 30;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc31"){
        //中三组六
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 31;
        createOneLineLayout("jndsdwfc","至少选择3个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc32"){
        //中三和值
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 32;
        createSumLayout("jndsdwfc",1,26,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc33"){
        //中三组选包胆
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 33;
        jndsdwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("jndsdwfc",array,["请选择一个号码"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc34"){
        //中三混合组选
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 34;
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc35"){
        //和值尾数
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 35;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc36"){
        //特殊号
        $("#jndsdwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 3;
        jndsdwfc_playMethod = 36;
        createNonNumLayout("jndsdwfc",jndsdwfc_playMethod,num,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc37"){
        //直选复式
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 37;
        var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
        createThreeLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc38"){
        //直选单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 38;
        $("#jndsdwfc_ballView").empty();
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc39"){
        //和值
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 39;
        createSumLayout("jndsdwfc",0,27,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc40"){
        //直选跨度
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 40;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc41"){
        //前三组三
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 41;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc42"){
        //前三组六
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 42;
        createOneLineLayout("jndsdwfc","至少选择3个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc43"){
        //前三和值
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 43;
        createSumLayout("jndsdwfc",1,26,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc44"){
        //前三组选包胆
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 44;
        jndsdwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("jndsdwfc",array,["请选择一个号码"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc45"){
        //前三混合组选
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 45;
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc46"){
        //和值尾数
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 46;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc47"){
        //特殊号
        $("#jndsdwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 4;
        jndsdwfc_playMethod = 47;
        createNonNumLayout("jndsdwfc",jndsdwfc_playMethod,num,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc48"){
        //后二复式
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 5;
        jndsdwfc_playMethod = 48;
        var tips = ["十位：可选1-10个","个位：可选1-10个"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc49"){
        //后二单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 5;
        jndsdwfc_playMethod = 49;
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc50"){
        //后二和值
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 5;
        jndsdwfc_playMethod = 50;
        createSumLayout("jndsdwfc",0,18,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc51"){
        //直选跨度
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 5;
        jndsdwfc_playMethod = 51;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc52"){
        //后二组选
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 5;
        jndsdwfc_playMethod = 52;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc53"){
        //后二和值
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 5;
        jndsdwfc_playMethod = 53;
        createSumLayout("jndsdwfc",1,17,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc54"){
        //后二组选包胆
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 5;
        jndsdwfc_playMethod = 54;
        jndsdwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("jndsdwfc",array,["请选择一个号码"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc55"){
        //前二复式
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 6;
        jndsdwfc_playMethod = 55;
        var tips = ["万位：可选1-10个","千位：可选1-10个"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc56"){
        //前二单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 6;
        jndsdwfc_playMethod = 56;
        jndsdwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
    }else if(val == "jndsdwfc57"){
        //前二和值
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 6;
        jndsdwfc_playMethod = 57;
        createSumLayout("jndsdwfc",0,18,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc58"){
        //直选跨度
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 6;
        jndsdwfc_playMethod = 58;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc59"){
        //前二组选
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 6;
        jndsdwfc_playMethod = 59;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc60"){
        //前二和值
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 6;
        jndsdwfc_playMethod = 60;
        createSumLayout("jndsdwfc",1,17,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc61"){
        //前二组选包胆
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 6;
        jndsdwfc_playMethod = 61;
        jndsdwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("jndsdwfc",array,["请选择一个号码"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc62"){
        //定位复式
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 7;
        jndsdwfc_playMethod = 62;
        createFiveLineLayout("jndsdwfc", function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc63"){
        //后三一码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 63;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc64"){
        //后三二码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 64;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc65"){
        //前三一码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 65;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc66"){
        //前三二码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 66;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc67"){
        //后四一码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 67;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc68"){
        //后四二码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 68;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc69"){
        //前四一码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 69;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc70"){
        //前四二码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 70;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc71"){
        //五星一码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 71;
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc72"){
        //五星二码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 72;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc73"){
        //五星三码
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 8;
        jndsdwfc_playMethod = 73;
        createOneLineLayout("jndsdwfc","至少选择3个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc74"){
        //后二大小单双
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 9;
        jndsdwfc_playMethod = 74;
        createTextBallTwoLayout("jndsdwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc75"){
        //后三大小单双
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 9;
        jndsdwfc_playMethod = 75;
        createTextBallThreeLayout("jndsdwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc76"){
        //前二大小单双
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 9;
        jndsdwfc_playMethod = 76;
        createTextBallTwoLayout("jndsdwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc77"){
        //前三大小单双
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 9;
        jndsdwfc_playMethod = 77;
        createTextBallThreeLayout("jndsdwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc78"){
        //直选复式
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 10;
        jndsdwfc_playMethod = 78;
        createFiveLineLayout("jndsdwfc",function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc79"){
        //直选单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 10;
        jndsdwfc_playMethod = 79;
        var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
        createRenXuanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc80"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 10;
        jndsdwfc_playMethod = 80;
        createSumLayout("jndsdwfc",0,18,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc81"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 10;
        jndsdwfc_playMethod = 81;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc82"){
        //组选单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 10;
        jndsdwfc_playMethod = 82;
        var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
        createRenXuanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc83"){
        //组选和值
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 10;
        jndsdwfc_playMethod = 83;
        createSumLayout("jndsdwfc",1,17,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc84"){
        //直选复式
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 84;
        createFiveLineLayout("jndsdwfc", function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc85"){
        //直选单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 85;
        var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
        createRenXuanSanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc86"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 86;
        createSumLayout("jndsdwfc",0,27,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanSanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc87"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 87;
        createOneLineLayout("jndsdwfc","至少选择2个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanSanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc88"){
        //组选单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 88;
        var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
        createRenXuanSanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc89"){
        //组选和值
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 89;
        createOneLineLayout("jndsdwfc","至少选择3个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanSanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc90"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 90;
        var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
        createRenXuanSanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc91"){
        //混合组选
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 91;
        var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
        createRenXuanSanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc92"){
        //组选和值
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 11;
        jndsdwfc_playMethod = 92;
        createSumLayout("jndsdwfc",1,26,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanSanLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc93"){
        $("#jndsdwfc_random").show();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 12;
        jndsdwfc_playMethod = 93;
        createFiveLineLayout("jndsdwfc", function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc94"){
        //直选单式
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 3;
        jndsdwfc_playType = 12;
        jndsdwfc_playMethod = 94;
        var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("jndsdwfc",tips);
        createRenXuanSiLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc95"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 12;
        jndsdwfc_playMethod = 95;
        createOneLineLayout("jndsdwfc","至少选择4个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanSiLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc96"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 12;
        jndsdwfc_playMethod = 96;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanSiLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc97"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 12;
        jndsdwfc_playMethod = 97;
        $("#jndsdwfc_ballView").empty();
        createOneLineLayout("jndsdwfc","二重号:至少选择2个号码",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanSiLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc98"){
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 12;
        jndsdwfc_playMethod = 98;
        $("#jndsdwfc_ballView").empty();
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("jndsdwfc",tips,0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        createRenXuanSiLayout("jndsdwfc",jndsdwfc_playMethod,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc99"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 13;
        jndsdwfc_playMethod = 99;
        $("#jndsdwfc_ballView").empty();
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc100"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 13;
        jndsdwfc_playMethod = 100;
        $("#jndsdwfc_ballView").empty();
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc101"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 13;
        jndsdwfc_playMethod = 101;
        $("#jndsdwfc_ballView").empty();
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc102"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 13;
        jndsdwfc_playMethod = 102;
        $("#jndsdwfc_ballView").empty();
        createOneLineLayout("jndsdwfc","至少选择1个",0,9,false,function(){
            jndsdwfc_calcNotes();
        });
        jndsdwfc_qingkongAll();
    }else if(val == "jndsdwfc103"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 103;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc104"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 104;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc105"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 105;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc106"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 106;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc107"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 107;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc108"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 108;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc109"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 109;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc110"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 110;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc111"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 111;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }else if(val == "jndsdwfc112"){
        jndsdwfc_qingkongAll();
        $("#jndsdwfc_random").hide();
        jndsdwfc_sntuo = 0;
        jndsdwfc_playType = 14;
        jndsdwfc_playMethod = 112;
        createTextBallOneLayout("jndsdwfc",["龙","虎","和"],["至少选择一个"],function(){
            jndsdwfc_calcNotes();
        });
    }

    if(jndsdwfcScroll){
        jndsdwfcScroll.refresh();
        jndsdwfcScroll.scrollTo(0,0,1);
    }
    
    $("#jndsdwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
    
    initFooterData("jndsdwfc",temp);
    hideRandomWhenLi("jndsdwfc",jndsdwfc_sntuo,jndsdwfc_playMethod);
    jndsdwfc_calcNotes();
}
/**
 * [jndsdwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function jndsdwfc_initFooterButton(){
    if(jndsdwfc_playMethod == 0 || jndsdwfc_playMethod == 62 || jndsdwfc_playMethod == 78
        || jndsdwfc_playMethod == 84 || jndsdwfc_playMethod == 93 || jndsdwfc_playType == 7){
        if(LotteryStorage["jndsdwfc"]["line1"].length > 0 || LotteryStorage["jndsdwfc"]["line2"].length > 0 ||
            LotteryStorage["jndsdwfc"]["line3"].length > 0 || LotteryStorage["jndsdwfc"]["line4"].length > 0 ||
            LotteryStorage["jndsdwfc"]["line5"].length > 0){
            $("#jndsdwfc_qingkong").css("opacity",1.0);
        }else{
            $("#jndsdwfc_qingkong").css("opacity",0.4);
        }
    }else if(jndsdwfc_playMethod == 9){
        if(LotteryStorage["jndsdwfc"]["line1"].length > 0 || LotteryStorage["jndsdwfc"]["line2"].length > 0 ||
            LotteryStorage["jndsdwfc"]["line3"].length > 0 || LotteryStorage["jndsdwfc"]["line4"].length > 0 ){
            $("#jndsdwfc_qingkong").css("opacity",1.0);
        }else{
            $("#jndsdwfc_qingkong").css("opacity",0.4);
        }
    }else if(jndsdwfc_playMethod == 37 || jndsdwfc_playMethod == 4 || jndsdwfc_playMethod == 6
        || jndsdwfc_playMethod == 26 || jndsdwfc_playMethod == 15 || jndsdwfc_playMethod == 75 || jndsdwfc_playMethod == 77){
        if(LotteryStorage["jndsdwfc"]["line1"].length > 0 || LotteryStorage["jndsdwfc"]["line2"].length > 0
            || LotteryStorage["jndsdwfc"]["line3"].length > 0){
            $("#jndsdwfc_qingkong").css("opacity",1.0);
        }else{
            $("#jndsdwfc_qingkong").css("opacity",0.4);
        }
    }else if(jndsdwfc_playMethod == 3 || jndsdwfc_playMethod == 4 || jndsdwfc_playMethod == 5
        || jndsdwfc_playMethod == 6 || jndsdwfc_playMethod == 7 || jndsdwfc_playMethod == 12
        || jndsdwfc_playMethod == 14 || jndsdwfc_playMethod == 48 || jndsdwfc_playMethod == 55
        || jndsdwfc_playMethod == 74 || jndsdwfc_playMethod == 76 || jndsdwfc_playMethod == 96 || jndsdwfc_playMethod == 98){
        if(LotteryStorage["jndsdwfc"]["line1"].length > 0 || LotteryStorage["jndsdwfc"]["line2"].length > 0){
            $("#jndsdwfc_qingkong").css("opacity",1.0);
        }else{
            $("#jndsdwfc_qingkong").css("opacity",0.4);
        }
    }else if(jndsdwfc_playMethod == 2 || jndsdwfc_playMethod == 8 || jndsdwfc_playMethod == 11 || jndsdwfc_playMethod == 13 || jndsdwfc_playMethod == 39
        || jndsdwfc_playMethod == 28 || jndsdwfc_playMethod == 17 || jndsdwfc_playMethod == 18 || jndsdwfc_playMethod == 24 || jndsdwfc_playMethod == 41
        || jndsdwfc_playMethod == 25 || jndsdwfc_playMethod == 29 || jndsdwfc_playMethod == 42 || jndsdwfc_playMethod == 43 || jndsdwfc_playMethod == 30
        || jndsdwfc_playMethod == 35 || jndsdwfc_playMethod == 36 || jndsdwfc_playMethod == 31 || jndsdwfc_playMethod == 32 || jndsdwfc_playMethod == 19
        || jndsdwfc_playMethod == 40 || jndsdwfc_playMethod == 46 || jndsdwfc_playMethod == 20 || jndsdwfc_playMethod == 21 || jndsdwfc_playMethod == 50
        || jndsdwfc_playMethod == 47 || jndsdwfc_playMethod == 51 || jndsdwfc_playMethod == 52 || jndsdwfc_playMethod == 53 || jndsdwfc_playMethod == 57 || jndsdwfc_playMethod == 63
        || jndsdwfc_playMethod == 58 || jndsdwfc_playMethod == 59 || jndsdwfc_playMethod == 60 || jndsdwfc_playMethod == 65 || jndsdwfc_playMethod == 80 || jndsdwfc_playMethod == 81 || jndsdwfc_playType == 8
        || jndsdwfc_playMethod == 83 || jndsdwfc_playMethod == 86 || jndsdwfc_playMethod == 87 || jndsdwfc_playMethod == 22 || jndsdwfc_playMethod == 33 || jndsdwfc_playMethod == 44
        || jndsdwfc_playMethod == 89 || jndsdwfc_playMethod == 92 || jndsdwfc_playMethod == 95 || jndsdwfc_playMethod == 54 || jndsdwfc_playMethod == 61
        || jndsdwfc_playMethod == 97 || jndsdwfc_playType == 13  || jndsdwfc_playType == 14){
        if(LotteryStorage["jndsdwfc"]["line1"].length > 0){
            $("#jndsdwfc_qingkong").css("opacity",1.0);
        }else{
            $("#jndsdwfc_qingkong").css("opacity",0.4);
        }
    }else{
        $("#jndsdwfc_qingkong").css("opacity",0);
    }

    if($("#jndsdwfc_qingkong").css("opacity") == "0"){
        $("#jndsdwfc_qingkong").css("display","none");
    }else{
        $("#jndsdwfc_qingkong").css("display","block");
    }

    if($('#jndsdwfc_zhushu').html() > 0){
        $("#jndsdwfc_queding").css("opacity",1.0);
    }else{
        $("#jndsdwfc_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  jndsdwfc_qingkongAll(){
    $("#jndsdwfc_ballView span").removeClass('redBalls_active');
    LotteryStorage["jndsdwfc"]["line1"] = [];
    LotteryStorage["jndsdwfc"]["line2"] = [];
    LotteryStorage["jndsdwfc"]["line3"] = [];
    LotteryStorage["jndsdwfc"]["line4"] = [];
    LotteryStorage["jndsdwfc"]["line5"] = [];

    localStorageUtils.removeParam("jndsdwfc_line1");
    localStorageUtils.removeParam("jndsdwfc_line2");
    localStorageUtils.removeParam("jndsdwfc_line3");
    localStorageUtils.removeParam("jndsdwfc_line4");
    localStorageUtils.removeParam("jndsdwfc_line5");

    $('#jndsdwfc_zhushu').text(0);
    $('#jndsdwfc_money').text(0);
    clearAwardWin("jndsdwfc");
    jndsdwfc_initFooterButton();
}

/**
 * [jndsdwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function jndsdwfc_calcNotes(){
	$('#jndsdwfc_modeId').blur();
	$('#jndsdwfc_fandian').blur();
	
    var notes = 0;

    if(jndsdwfc_playMethod == 0){
        notes = LotteryStorage["jndsdwfc"]["line1"].length *
            LotteryStorage["jndsdwfc"]["line2"].length *
            LotteryStorage["jndsdwfc"]["line3"].length *
            LotteryStorage["jndsdwfc"]["line4"].length *
            LotteryStorage["jndsdwfc"]["line5"].length;
    }else if(jndsdwfc_playMethod == 2){
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,5);
    }else if(jndsdwfc_playMethod == 3){
        if (LotteryStorage["jndsdwfc"]["line1"].length >= 1 && LotteryStorage["jndsdwfc"]["line2"].length >= 3) {
            notes = getArraySelect(3,LotteryStorage["jndsdwfc"]["line1"],LotteryStorage["jndsdwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(jndsdwfc_playMethod == 4){
        if (LotteryStorage["jndsdwfc"]["line1"].length >= 2 && LotteryStorage["jndsdwfc"]["line2"].length >= 1) {
            notes = getArraySelect(2,LotteryStorage["jndsdwfc"]["line2"],LotteryStorage["jndsdwfc"]["line1"]);
        }else{
            notes = 0;
        }
    }else if(jndsdwfc_playMethod == 5 || jndsdwfc_playMethod == 12){
        if (LotteryStorage["jndsdwfc"]["line1"].length >= 1 && LotteryStorage["jndsdwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["jndsdwfc"]["line1"],LotteryStorage["jndsdwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(jndsdwfc_playMethod == 6 || jndsdwfc_playMethod == 7 || jndsdwfc_playMethod == 14){
        if (LotteryStorage["jndsdwfc"]["line1"].length >= 1 && LotteryStorage["jndsdwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["jndsdwfc"]["line1"],LotteryStorage["jndsdwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(jndsdwfc_playMethod == 9){
        notes = LotteryStorage["jndsdwfc"]["line1"].length *
            LotteryStorage["jndsdwfc"]["line2"].length *
            LotteryStorage["jndsdwfc"]["line3"].length *
            LotteryStorage["jndsdwfc"]["line4"].length;
    }else if(jndsdwfc_playMethod == 18 || jndsdwfc_playMethod == 29 || jndsdwfc_playMethod == 40){
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["jndsdwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
            }
        }
    }else if(jndsdwfc_playMethod == 22 || jndsdwfc_playMethod == 33 || jndsdwfc_playMethod == 44 ){
        notes = 54;
    }else if(jndsdwfc_playMethod == 54 || jndsdwfc_playMethod == 61){
        notes = 9;
    }else if(jndsdwfc_playMethod == 51 || jndsdwfc_playMethod == 58){
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["jndsdwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 2;
            }
        }
    }else if(jndsdwfc_playMethod == 11){
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,4);
    }else if(jndsdwfc_playMethod == 13|| jndsdwfc_playMethod == 64 || jndsdwfc_playMethod == 66 || jndsdwfc_playMethod == 68 || jndsdwfc_playMethod == 70 || jndsdwfc_playMethod == 72){
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,2);
    }else if(jndsdwfc_playMethod == 37 || jndsdwfc_playMethod == 26 || jndsdwfc_playMethod == 15 || jndsdwfc_playMethod == 75 || jndsdwfc_playMethod == 77){
        notes = LotteryStorage["jndsdwfc"]["line1"].length *
            LotteryStorage["jndsdwfc"]["line2"].length *
            LotteryStorage["jndsdwfc"]["line3"].length ;
    }else if(jndsdwfc_playMethod == 39 || jndsdwfc_playMethod == 28 || jndsdwfc_playMethod == 17){
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["jndsdwfc"]["line1"][i]);
        };
    }else if(jndsdwfc_playMethod == 41 || jndsdwfc_playMethod == 30 || jndsdwfc_playMethod == 19){
        notes = mathUtil.getACombination(LotteryStorage["jndsdwfc"]["line1"].length,2);
    }else if(jndsdwfc_playMethod == 42 || jndsdwfc_playMethod == 31 || jndsdwfc_playMethod == 20 || jndsdwfc_playMethod == 68 || jndsdwfc_playMethod == 73){
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,3);
    }else if(jndsdwfc_playMethod == 43 || jndsdwfc_playMethod == 32 || jndsdwfc_playMethod == 21){
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["jndsdwfc"]["line1"][i]);
        };
    }else if(jndsdwfc_playMethod == 48 || jndsdwfc_playMethod == 55 || jndsdwfc_playMethod == 74 || jndsdwfc_playMethod == 76){
        notes = LotteryStorage["jndsdwfc"]["line1"].length *
            LotteryStorage["jndsdwfc"]["line2"].length ;
    }else if(jndsdwfc_playMethod == 50 || jndsdwfc_playMethod == 57){
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["jndsdwfc"]["line1"][i]);
        };
    }else if(jndsdwfc_playMethod == 52 || jndsdwfc_playMethod == 59){
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,2);
    }else if(jndsdwfc_playMethod == 53 || jndsdwfc_playMethod == 60){
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["jndsdwfc"]["line1"][i]);
        };
    }else if(jndsdwfc_playMethod == 62){
        notes = LotteryStorage["jndsdwfc"]["line1"].length +
            LotteryStorage["jndsdwfc"]["line2"].length +
            LotteryStorage["jndsdwfc"]["line3"].length +
            LotteryStorage["jndsdwfc"]["line4"].length +
            LotteryStorage["jndsdwfc"]["line5"].length;
    }else if(jndsdwfc_playType == 13 || jndsdwfc_playType == 14 || jndsdwfc_playMethod == 8 || jndsdwfc_playMethod == 71
        || jndsdwfc_playMethod == 24 || jndsdwfc_playMethod == 25 || jndsdwfc_playMethod == 35 || jndsdwfc_playMethod == 36 || jndsdwfc_playMethod == 46
        || jndsdwfc_playMethod == 47 || jndsdwfc_playMethod == 63 || jndsdwfc_playMethod == 65 || jndsdwfc_playMethod == 67 || jndsdwfc_playMethod == 69 ){
        notes = LotteryStorage["jndsdwfc"]["line1"].length ;
    }else if(jndsdwfc_playMethod == 78){
        notes = LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line2"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line3"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line4"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line3"].length +
            LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line4"].length +
            LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line4"].length +
            LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line4"].length * LotteryStorage["jndsdwfc"]["line5"].length;
    }else if (jndsdwfc_playMethod == 80) {
        if ($("#jndsdwfc_tab .button.red").size() < 2) {
            notes = 0;
        }else{
            for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
                notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["jndsdwfc"]["line1"][i]);
            };
            notes *= mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,2);
        }
    }else if (jndsdwfc_playMethod == 81) {
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,2) * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,2);
    }else if (jndsdwfc_playMethod == 83) {
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["jndsdwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,2);
    }else if (jndsdwfc_playMethod == 84) {
        notes = LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line3"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line4"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line4"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line4"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line4"].length +
            LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line4"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line4"].length * LotteryStorage["jndsdwfc"]["line5"].length ;
    }else if (jndsdwfc_playMethod == 86) {
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["jndsdwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,3);
    }else if (jndsdwfc_playMethod == 87) {
        notes = mathUtil.getACombination(LotteryStorage["jndsdwfc"]["line1"].length,2) * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,3);
    }else if (jndsdwfc_playMethod == 89) {
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,3) * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,3);
    }else if (jndsdwfc_playMethod == 92) {
        for (var i = 0; i < LotteryStorage["jndsdwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["jndsdwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,3);
    }else if (jndsdwfc_playMethod == 93) {
        notes = LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line4"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line4"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line1"].length * LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line4"].length * LotteryStorage["jndsdwfc"]["line5"].length +
            LotteryStorage["jndsdwfc"]["line2"].length * LotteryStorage["jndsdwfc"]["line3"].length * LotteryStorage["jndsdwfc"]["line4"].length * LotteryStorage["jndsdwfc"]["line5"].length;
    }else if (jndsdwfc_playMethod == 95) {
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,4)
            * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,4);
    }else if (jndsdwfc_playMethod == 96) {
        if (LotteryStorage["jndsdwfc"]["line1"].length >= 1 && LotteryStorage["jndsdwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["jndsdwfc"]["line1"],LotteryStorage["jndsdwfc"]["line2"])
                * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else if (jndsdwfc_playMethod == 97) {
        notes = mathUtil.getCCombination(LotteryStorage["jndsdwfc"]["line1"].length,2) * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,4);
    }else if (jndsdwfc_playMethod == 98) {
        if (LotteryStorage["jndsdwfc"]["line1"].length >= 1 && LotteryStorage["jndsdwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["jndsdwfc"]["line1"],LotteryStorage["jndsdwfc"]["line2"]) * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else{
        notes = jndsdwfcValidData($("#jndsdwfc_single").val());
    }

    if(jndsdwfc_sntuo == 3 || jndsdwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","jndsdwfc"),LotteryInfo.getMethodId("ssc",jndsdwfc_playMethod))){
    }else{
        if(parseInt($('#jndsdwfc_modeId').val()) == 8){
            $("#jndsdwfc_random").hide();
        }else{
            $("#jndsdwfc_random").show();
        }
    }

    //验证是否为空
    if( $("#jndsdwfc_beiNum").val() =="" || parseInt($("#jndsdwfc_beiNum").val()) == 0){
        $("#jndsdwfc_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#jndsdwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#jndsdwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#jndsdwfc_zhushu').text(notes);
        if($("#jndsdwfc_modeId").val() == "8"){
            $('#jndsdwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jndsdwfc_beiNum").val()),0.002));
        }else if ($("#jndsdwfc_modeId").val() == "2"){
            $('#jndsdwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jndsdwfc_beiNum").val()),0.2));
        }else if ($("#jndsdwfc_modeId").val() == "1"){
            $('#jndsdwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jndsdwfc_beiNum").val()),0.02));
        }else{
            $('#jndsdwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jndsdwfc_beiNum").val()),2));
        }
    } else {
        $('#jndsdwfc_zhushu').text(0);
        $('#jndsdwfc_money').text(0);
    }
    jndsdwfc_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('jndsdwfc',jndsdwfc_playMethod);
}

/**
 * [jndsdwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function jndsdwfc_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#jndsdwfc_queding").bind('click', function(event) {
        jndsdwfc_rebate = $("#jndsdwfc_fandian option:last").val();
        if(parseInt($('#jndsdwfc_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        jndsdwfc_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#jndsdwfc_modeId').val()) == 8){
            if (Number($('#jndsdwfc_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('jndsdwfc',jndsdwfc_playMethod);

        submitParams.lotteryType = "jndsdwfc";
        var play = LotteryInfo.getPlayName("ssc",jndsdwfc_playType);
        var playMethod = LotteryInfo.getMethodName("ssc",jndsdwfc_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = jndsdwfc_playType;
        submitParams.playMethodIndex = jndsdwfc_playMethod;
        var selectedBalls = [];
        if(jndsdwfc_playMethod == 0 || jndsdwfc_playMethod == 3 || jndsdwfc_playMethod == 4
            || jndsdwfc_playMethod == 5 || jndsdwfc_playMethod == 6 || jndsdwfc_playMethod == 7
            || jndsdwfc_playMethod == 9 || jndsdwfc_playMethod == 12 || jndsdwfc_playMethod == 14
            || jndsdwfc_playMethod == 37 || jndsdwfc_playMethod == 26 || jndsdwfc_playMethod == 15
            || jndsdwfc_playMethod == 48 || jndsdwfc_playMethod == 55 || jndsdwfc_playMethod == 74 || jndsdwfc_playType == 9){
            $("#jndsdwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(jndsdwfc_playMethod == 2 || jndsdwfc_playMethod == 8 || jndsdwfc_playMethod == 11 || jndsdwfc_playMethod == 13 || jndsdwfc_playMethod == 24
            || jndsdwfc_playMethod == 39 || jndsdwfc_playMethod == 28 || jndsdwfc_playMethod == 17 || jndsdwfc_playMethod == 18 || jndsdwfc_playMethod == 25
            || jndsdwfc_playMethod == 22 || jndsdwfc_playMethod == 33 || jndsdwfc_playMethod == 44 || jndsdwfc_playMethod == 54 || jndsdwfc_playMethod == 61
            || jndsdwfc_playMethod == 41 || jndsdwfc_playMethod == 42 || jndsdwfc_playMethod == 43 || jndsdwfc_playMethod == 29 || jndsdwfc_playMethod == 35
            || jndsdwfc_playMethod == 30 || jndsdwfc_playMethod == 31 || jndsdwfc_playMethod == 32 || jndsdwfc_playMethod == 40 || jndsdwfc_playMethod == 36
            || jndsdwfc_playMethod == 19 || jndsdwfc_playMethod == 20 || jndsdwfc_playMethod == 21 || jndsdwfc_playMethod == 46 || jndsdwfc_playMethod == 47
            || jndsdwfc_playMethod == 50 || jndsdwfc_playMethod == 57 || jndsdwfc_playType == 8 || jndsdwfc_playMethod == 51 || jndsdwfc_playMethod == 58
            || jndsdwfc_playMethod == 52 || jndsdwfc_playMethod == 53|| jndsdwfc_playMethod == 59 || jndsdwfc_playMethod == 60 || jndsdwfc_playType == 13 || jndsdwfc_playType == 14){
            $("#jndsdwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(jndsdwfc_playType == 7 || jndsdwfc_playMethod == 78 || jndsdwfc_playMethod == 84 || jndsdwfc_playMethod == 93){
            $("#jndsdwfc_ballView div.ballView").each(function(){
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
        }else if(jndsdwfc_playMethod == 80 || jndsdwfc_playMethod == 81 || jndsdwfc_playMethod == 83
            || jndsdwfc_playMethod == 86 || jndsdwfc_playMethod == 87 || jndsdwfc_playMethod == 89
            || jndsdwfc_playMethod == 92 || jndsdwfc_playMethod == 95 || jndsdwfc_playMethod == 97){
            $("#jndsdwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            var temp = selectedBalls.join(",") + "#";

            if ($("#jndsdwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#jndsdwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#jndsdwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#jndsdwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#jndsdwfc_tab5").hasClass("button red")) {
                temp += "个";
            };

            submitParams.nums = temp;
        }else if (jndsdwfc_playMethod == 96 || jndsdwfc_playMethod == 98) {
            $("#jndsdwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            var temp = selectedBalls.join("|") + "#";
            if ($("#jndsdwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#jndsdwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#jndsdwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#jndsdwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#jndsdwfc_tab5").hasClass("button red")) {
                temp += "个";
            };
            submitParams.nums = temp;
        }else{
		    //去错误号
		    jndsdwfcValidateData("submit");
            var array = handleSingleStr($("#jndsdwfc_single").val());
            if(jndsdwfc_playMethod == 1 ){
                submitParams.nums = array.join(" ");
            }else if(jndsdwfc_playMethod == 10 || jndsdwfc_playMethod == 38 || jndsdwfc_playMethod == 27
                || jndsdwfc_playMethod == 16 || jndsdwfc_playMethod == 49 || jndsdwfc_playMethod == 56){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join("|");
                    }else{
                        temp = temp + array[i].split("").join("|") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(jndsdwfc_playMethod == 45 || jndsdwfc_playMethod == 34 || jndsdwfc_playMethod == 23){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(jndsdwfc_playMethod == 79 || jndsdwfc_playMethod == 82 || jndsdwfc_playMethod == 85 || jndsdwfc_playMethod == 88 ||
                jndsdwfc_playMethod == 89 || jndsdwfc_playMethod == 90 || jndsdwfc_playMethod == 91 || jndsdwfc_playMethod == 94){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                temp +="#";
                if ($("#jndsdwfc_tab1").hasClass("button red")) {
                    temp += "万";
                };
                if ($("#jndsdwfc_tab2").hasClass("button red")) {
                    temp += "千";
                };
                if ($("#jndsdwfc_tab3").hasClass("button red")) {
                    temp += "百";
                };
                if ($("#jndsdwfc_tab4").hasClass("button red")) {
                    temp += "十";
                };
                if ($("#jndsdwfc_tab5").hasClass("button red")) {
                    temp += "个";
                };

                submitParams.nums = temp;
            }
        }
        localStorageUtils.setParam("playMode",$("#jndsdwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#jndsdwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#jndsdwfc_fandian").val());
        submitParams.notes = $('#jndsdwfc_zhushu').html();
        submitParams.sntuo = jndsdwfc_sntuo;
        submitParams.multiple = $('#jndsdwfc_beiNum').val();  //requirement
        submitParams.rebates = $('#jndsdwfc_fandian').val();  //requirement
        submitParams.playMode = $('#jndsdwfc_modeId').val();  //requirement
        submitParams.money = $('#jndsdwfc_money').html();  //requirement
        submitParams.award = $('#jndsdwfc_minAward').html();  //奖金
        submitParams.maxAward = $('#jndsdwfc_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#jndsdwfc_ballView").empty();
        jndsdwfc_qingkongAll();
    });
}

/**
 * [jndsdwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function jndsdwfc_randomOne(){
    jndsdwfc_qingkongAll();
    if(jndsdwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        LotteryStorage["jndsdwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["jndsdwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["jndsdwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["jndsdwfc"]["line4"].push(redBallArray[3]+"");
        LotteryStorage["jndsdwfc"]["line5"].push(redBallArray[4]+"");

        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line2"], function(k, v){
            $("#" + "jndsdwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line3"], function(k, v){
            $("#" + "jndsdwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line4"], function(k, v){
            $("#" + "jndsdwfc_line4" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line5"], function(k, v){
            $("#" + "jndsdwfc_line5" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["jndsdwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        LotteryStorage["jndsdwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["jndsdwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["jndsdwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["jndsdwfc"]["line4"].push(redBallArray[3]+"");

        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line2"], function(k, v){
            $("#" + "jndsdwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line3"], function(k, v){
            $("#" + "jndsdwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line4"], function(k, v){
            $("#" + "jndsdwfc_line4" + v).toggleClass("redBalls_active");
        });

    }else if(jndsdwfc_playMethod == 37 || jndsdwfc_playMethod == 26 || jndsdwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        LotteryStorage["jndsdwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["jndsdwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["jndsdwfc"]["line3"].push(redBallArray[2]+"");

        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line2"], function(k, v){
            $("#" + "jndsdwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line3"], function(k, v){
            $("#" + "jndsdwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 41 || jndsdwfc_playMethod == 30 || jndsdwfc_playMethod == 19 || jndsdwfc_playMethod == 68
        || jndsdwfc_playMethod == 52 || jndsdwfc_playMethod == 64 || jndsdwfc_playMethod == 66
        || jndsdwfc_playMethod == 59 || jndsdwfc_playMethod == 70 || jndsdwfc_playMethod == 72){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["jndsdwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 42 || jndsdwfc_playMethod == 31 || jndsdwfc_playMethod == 20 || jndsdwfc_playMethod == 73){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["jndsdwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 39 || jndsdwfc_playMethod == 28 || jndsdwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        LotteryStorage["jndsdwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 43 || jndsdwfc_playMethod == 32 || jndsdwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        LotteryStorage["jndsdwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 48 || jndsdwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        LotteryStorage["jndsdwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["jndsdwfc"]["line2"].push(redBallArray[1]+"");

        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line2"], function(k, v){
            $("#" + "jndsdwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 25 || jndsdwfc_playMethod == 36 || jndsdwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["jndsdwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 50 || jndsdwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        LotteryStorage["jndsdwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 53 || jndsdwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        LotteryStorage["jndsdwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["jndsdwfc"]["line"+line].push(number+"");
        $.each(LotteryStorage["jndsdwfc"]["line"+line], function(k, v){
            $("#" + "jndsdwfc_line" + line + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 63 || jndsdwfc_playMethod == 67 || jndsdwfc_playMethod == 69 || jndsdwfc_playMethod == 71 || jndsdwfc_playType == 13
        || jndsdwfc_playMethod == 65 || jndsdwfc_playMethod == 18 || jndsdwfc_playMethod == 29 || jndsdwfc_playMethod == 40 || jndsdwfc_playMethod == 22
        || jndsdwfc_playMethod == 33 || jndsdwfc_playMethod == 44 || jndsdwfc_playMethod == 54 || jndsdwfc_playMethod == 61
        || jndsdwfc_playMethod == 24 || jndsdwfc_playMethod == 35 || jndsdwfc_playMethod == 46 || jndsdwfc_playMethod == 51 || jndsdwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["jndsdwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 74 || jndsdwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        LotteryStorage["jndsdwfc"]["line1"].push(array[0]+"");
        LotteryStorage["jndsdwfc"]["line2"].push(array[1]+"");
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line2"], function(k, v){
            $("#" + "jndsdwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 75 || jndsdwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        LotteryStorage["jndsdwfc"]["line1"].push(array[0]+"");
        LotteryStorage["jndsdwfc"]["line2"].push(array[1]+"");
        LotteryStorage["jndsdwfc"]["line3"].push(array[2]+"");
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line2"], function(k, v){
            $("#" + "jndsdwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line3"], function(k, v){
            $("#" + "jndsdwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);
        LotteryStorage["jndsdwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["jndsdwfc"]["line"+lines[1]].push(array[1]+"");
        $.each(LotteryStorage["jndsdwfc"]["line"+lines[0]], function(k, v){
            $("#" + "jndsdwfc_line" + lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line"+lines[1]], function(k, v){
            $("#" + "jndsdwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        LotteryStorage["jndsdwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["jndsdwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["jndsdwfc"]["line"+lines[2]].push(array[2]+"");

        $.each(LotteryStorage["jndsdwfc"]["line"+lines[0]], function(k, v){
            $("#" + "jndsdwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line"+lines[1]], function(k, v){
            $("#" + "jndsdwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line"+lines[0]], function(k, v){
            $("#" + "jndsdwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        LotteryStorage["jndsdwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["jndsdwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["jndsdwfc"]["line"+lines[2]].push(array[2]+"");
        LotteryStorage["jndsdwfc"]["line"+lines[3]].push(array[3]+"");

        $.each(LotteryStorage["jndsdwfc"]["line"+lines[0]], function(k, v){
            $("#" + "jndsdwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line"+lines[1]], function(k, v){
            $("#" + "jndsdwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line"+lines[2]], function(k, v){
            $("#" + "jndsdwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["jndsdwfc"]["line"+lines[3]], function(k, v){
            $("#" + "jndsdwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
        });
    }else if(jndsdwfc_playType == 14){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["jndsdwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["jndsdwfc"]["line1"], function(k, v){
            $("#" + "jndsdwfc_line1" + v).toggleClass("redBalls_active");
        });
    }
    jndsdwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function jndsdwfc_checkOutRandom(playMethod){
    var obj = new Object();
    if(jndsdwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 18 || jndsdwfc_playMethod == 29 || jndsdwfc_playMethod == 40){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
        }
    }else if(jndsdwfc_playMethod == 22 || jndsdwfc_playMethod == 33 || jndsdwfc_playMethod == 44){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 54;
    }else if(jndsdwfc_playMethod == 54 || jndsdwfc_playMethod == 61){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 9;
    }
    else if(jndsdwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 37 || jndsdwfc_playMethod == 26 || jndsdwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 39 || jndsdwfc_playMethod == 28 || jndsdwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        obj.nums = number;
        obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
    }else if(jndsdwfc_playMethod == 41 || jndsdwfc_playMethod == 30 || jndsdwfc_playMethod == 19){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(jndsdwfc_playMethod == 52 || jndsdwfc_playMethod == 59 || jndsdwfc_playMethod == 64 || jndsdwfc_playMethod == 66 || jndsdwfc_playMethod == 68
        ||jndsdwfc_playMethod == 70 || jndsdwfc_playMethod == 72){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 42 || jndsdwfc_playMethod == 31 || jndsdwfc_playMethod == 20 || jndsdwfc_playMethod == 73){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 43 || jndsdwfc_playMethod == 32 || jndsdwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        obj.nums = number;
        obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
    }else if(jndsdwfc_playMethod == 48 || jndsdwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 50 || jndsdwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
    }else if(jndsdwfc_playMethod == 53 || jndsdwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
    }else if(jndsdwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        if(line == 1){
            obj.nums = number + "|*|*|*|*";
        }else if(line == 2){
            obj.nums = "*|"+ number +"|*|*|*";
        }else if(line == 3){
            obj.nums = "*|*|"+number +"|*|*";
        }else if(line == 4){
            obj.nums = "*|*|*|"+ number +"|*";
        }else if(line == 5){
            obj.nums = "*|*|*|*|" + number;
        }
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 63 || jndsdwfc_playMethod == 65 || jndsdwfc_playMethod == 67 || jndsdwfc_playMethod == 69 || jndsdwfc_playMethod == 71
        || jndsdwfc_playMethod == 24 || jndsdwfc_playMethod == 35 || jndsdwfc_playMethod == 46){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 25 || jndsdwfc_playMethod == 36 || jndsdwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        var array = ["豹子","顺子","对子","半顺","杂六"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 51 || jndsdwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
        }
    }else if(jndsdwfc_playMethod == 74 || jndsdwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        var temp = [];
        for(var i = 0; i < array.length;i++){
            if(array[i] == 0){
                temp.push("大");
            }else if(array[i] == 1){
                temp.push("小");
            }else if(array[i] == 2){
                temp.push("单");
            }else if(array[i] == 3){
                temp.push("双");
            }
        }
        obj.nums = temp.join("|");
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 75 || jndsdwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        var temp = [];
        for(var i = 0; i < array.length;i++){
            if(array[i] == 0){
                temp.push("大");
            }else if(array[i] == 1){
                temp.push("小");
            }else if(array[i] == 2){
                temp.push("单");
            }else if(array[i] == 3){
                temp.push("双");
            }
        }
        obj.nums = temp.join("|");
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);

        if(isContained([1,2],lines)){
            obj.nums = array[0]+"|"+array[1]+"|*|*|*";
        }else if(isContained([1,3],lines)){
            obj.nums = array[0]+"|*|"+array[1]+"|*|*";
        }else if(isContained([1,4],lines)){
            obj.nums = array[0]+"|*|*|"+array[1]+"|*";
        }else if(isContained([1,5],lines)){
            obj.nums = array[0]+"|*|*|*|"+array[1];
        }else if(isContained([2,3],lines)){
            obj.nums = "*|"+array[0]+"|"+array[1]+"|*|*";
        }else if(isContained([2,4],lines)){
            obj.nums = "*|"+array[0]+"|*|"+array[1]+"|*";
        }else if(isContained([2,5],lines)){
            obj.nums = "*|"+array[0]+"|*|*|"+array[1];
        }else if(isContained([3,4],lines)){
            obj.nums = "*|*|"+array[0]+"|"+array[1]+"|*";
        }else if(isContained([3,5],lines)){
            obj.nums = "*|*|"+array[0]+"|*|"+array[1];
        }else if(isContained([4,5],lines)){
            obj.nums = "*|*|*|"+array[0]+"|"+array[1];
        }
        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        if(isContained([1,2,3],lines)){
            obj.nums = array[0]+"|"+array[1]+"|"+array[2]+"|*|*";
        }else if(isContained([1,2,4],lines)){
            obj.nums = array[0]+"|"+array[1]+"|*|"+array[2]+"|*";
        }else if(isContained([1,2,5],lines)){
            obj.nums = array[0]+"|"+array[1]+"|*|*|"+array[2];
        }else if(isContained([1,3,4],lines)){
            obj.nums = array[0]+"|*|"+array[1]+"|"+array[2]+"|*";
        }else if(isContained([1,3,5],lines)){
            obj.nums = array[0]+"|*|"+array[1]+"|*|"+array[2];
        }else if(isContained([1,4,5],lines)){
            obj.nums = array[0]+"|*|*|"+array[1]+"|"+array[2];
        }else if(isContained([2,3,4],lines)){
            obj.nums = "*|"+array[0]+"|"+array[1]+"|"+array[2]+"|*";
        }else if(isContained([2,3,5],lines)){
            obj.nums = "*|"+array[0]+"|"+array[1]+"|*|"+array[2];
        }else if(isContained([2,4,5],lines)){
            obj.nums = "*|"+array[0]+"|*|"+array[1]+"|"+array[2];
        }else if(isContained([3,4,5],lines)){
            obj.nums = "*|*|"+array[0]+"|"+array[1]+"|"+array[2];
        }

        obj.notes = 1;
    }else if(jndsdwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        if(isContained([1,2,3,4],lines)){
            obj.nums = array[0]+"|"+array[1]+"|"+array[2]+"|"+array[3]+"|*";
        }else if(isContained([1,2,3,5],lines)){
            obj.nums = array[0]+"|"+array[1]+"|"+array[2]+"|*|"+array[3];
        }else if(isContained([1,2,4,5],lines)){
            obj.nums = array[0]+"|"+array[1]+"|*|"+array[2]+"|"+array[3];
        }else if(isContained([1,3,4,5],lines)){
            obj.nums = array[0]+"|*|"+array[1]+"|"+array[2]+"|"+array[3];
        }else if(isContained([2,3,4,5],lines)){
            obj.nums = "*|"+array[0]+"|"+array[1]+"|"+array[2]+"|"+array[3];
        }
        obj.notes = 1;
    }
    obj.sntuo = jndsdwfc_sntuo;
    obj.multiple = 1;
    obj.rebates = jndsdwfc_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('jndsdwfc',jndsdwfc_playMethod,obj);  //机选奖金计算
    obj.award = $('#jndsdwfc_minAward').html();     //奖金
    obj.maxAward = $('#jndsdwfc_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [jndsdwfcValidateData 单式数据验证]
 */
function jndsdwfcValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#jndsdwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
    jndsdwfcValidData(textStr,type);
}

function jndsdwfcValidData(str,type){
    if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
        array,
        result,
        content = {};
    if(jndsdwfc_playMethod == 1){
        content.str = str;
        content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 10){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 38 || jndsdwfc_playMethod == 27 || jndsdwfc_playMethod == 16){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 45 || jndsdwfc_playMethod == 34 || jndsdwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 49 || jndsdwfc_playMethod == 56){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 79){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,2);
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 82){
        content.str = str;
        content.weishu = 2;
        content.duizi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,2);
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 85){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,3);
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 88){
        content.str = str;
        content.weishu = 3;
        content.zusan = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,3);
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 90){
        content.str = str;
        content.weishu = 3;
        content.zuliu = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,3);
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 91){
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,3);
        jndsdwfcShowFooter(true,notes);
    }else if(jndsdwfc_playMethod == 94){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#jndsdwfc_tab .button.red").size() ,4);
        jndsdwfcShowFooter(true,notes);
    }

    $('#jndsdwfc_delRepeat').off('click');
    $('#jndsdwfc_delRepeat').on('click',function () {
        content.str = $('#jndsdwfc_single').val() ? $('#jndsdwfc_single').val() : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        array = rptResult.num || [];
        notes = rptResult.length;
        jndsdwfcShowFooter(true,notes);
        $("#jndsdwfc_single").val(array.join(" "));
    });

    $("#jndsdwfc_single").val(array.join(" "));
    return notes;
}

function jndsdwfcShowFooter(isValid,notes){
    $('#jndsdwfc_zhushu').text(notes);
    if($("#jndsdwfc_modeId").val() == "8"){
        $('#jndsdwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jndsdwfc_beiNum").val()),0.002));
    }else if ($("#jndsdwfc_modeId").val() == "2"){
        $('#jndsdwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jndsdwfc_beiNum").val()),0.2));
    }else if ($("#jndsdwfc_modeId").val() == "1"){
        $('#jndsdwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jndsdwfc_beiNum").val()),0.02));
    }else{
        $('#jndsdwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jndsdwfc_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    jndsdwfc_initFooterButton();
    calcAwardWin('jndsdwfc',jndsdwfc_playMethod);  //计算奖金和盈利
}