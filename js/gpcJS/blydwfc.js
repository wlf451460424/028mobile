var blydwfc_playType = 2;
var blydwfc_playMethod = 15;
var blydwfc_sntuo = 0;
var blydwfc_rebate;
var blydwfcScroll;

//进入这个页面时调用
function blydwfcPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("blydwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("blydwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function blydwfcPageUnloadedPanel(){
    $("#blydwfc_queding").off('click');
    $("#blydwfcPage_back").off('click');
    $("#blydwfc_ballView").empty();
    $("#blydwfcSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="blydwfcPlaySelect"></select>');
    $("#blydwfcSelect").append($select);
}

//入口函数
function blydwfc_init(){
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
    $("#blydwfc_title").html(LotteryInfo.getLotteryNameByTag("blydwfc"));
    for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
                var name = LotteryInfo.getMethodName("ssc",j);
                if(i == blydwfc_playType && j == blydwfc_playMethod){
                    $play.append('<option value="blydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="blydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(blydwfc_playMethod,onShowArray)>-1 ){
						blydwfc_playType = i;
						blydwfc_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#blydwfcPlaySelect").append($play);
		}
    }
    
    if($("#blydwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("blydwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:blydwfcChangeItem
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

    GetLotteryInfo("blydwfc",function (){
        blydwfcChangeItem("blydwfc"+blydwfc_playMethod);
    });

    //添加滑动条
    if(!blydwfcScroll){
        blydwfcScroll = new IScroll('#blydwfcContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("blydwfc",LotteryInfo.getLotteryIdByTag("blydwfc"));

    //获取上一期开奖
    queryLastPrize("blydwfc");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('blydwfc');

    //机选选号
    $("#blydwfc_random").off('click');
    $("#blydwfc_random").on('click', function(event) {
        blydwfc_randomOne();
    });
    
    $("#blydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",blydwfc_playMethod));
	//玩法说明
	$("#blydwfc_paly_shuoming").off('click');
	$("#blydwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#blydwfc_shuoming").text());
	});

    //返回
    $("#blydwfcPage_back").on('click', function(event) {
        // blydwfc_playType = 2;
        // blydwfc_playMethod = 15;
        $("#blydwfc_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        blydwfc_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("blydwfc");//清空
    blydwfc_submitData();
}

function blydwfcResetPlayType(){
    blydwfc_playType = 2;
    blydwfc_playMethod = 15;
}

function blydwfcChangeItem(val) {
    blydwfc_qingkongAll();
    var temp = val.substring("blydwfc".length,val.length);
    if(val == "blydwfc0"){
        //直选复式
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 0;
        blydwfc_playMethod = 0;
        createFiveLineLayout("blydwfc", function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc1"){
        //直选单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 0;
        blydwfc_playMethod = 1;
        $("#blydwfc_ballView").empty();
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc2"){
        //组选120
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 0;
        blydwfc_playMethod = 2;
        createOneLineLayout("blydwfc","至少选择5个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc3"){
        //组选60
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 0;
        blydwfc_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc4"){
        //组选30
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 0;
        blydwfc_playMethod = 4;
        var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc5"){
        //组选20
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 0;
        blydwfc_playMethod = 5;
        var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc6"){
        //组选10
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 0;
        blydwfc_playMethod = 6;
        var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc7"){
        //组选5
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 0;
        blydwfc_playMethod = 7;
        var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc8"){
        //总和大小单双
        $("#blydwfc_random").show();
        var num = ["大","小","单","双"];
        blydwfc_sntuo = 0;
        blydwfc_playType = 0;
        blydwfc_playMethod = 8;
        createNonNumLayout("blydwfc",blydwfc_playMethod,num,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc9"){
        //直选复式
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 1;
        blydwfc_playMethod = 9;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createFourLineLayout("blydwfc",tips, function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc10"){
        //直选单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 1;
        blydwfc_playMethod = 10;
        $("#blydwfc_ballView").empty();
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc11"){
        //组选24
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 1;
        blydwfc_playMethod = 11;
        createOneLineLayout("blydwfc","至少选择4个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc12"){
        //组选12
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 1;
        blydwfc_playMethod = 12;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc13"){
        //组选6
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 1;
        blydwfc_playMethod = 13;
        createOneLineLayout("blydwfc","二重号:至少选择2个号码",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc14"){
        //组选4
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 1;
        blydwfc_playMethod = 14;
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc15"){
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 15;
        var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createThreeLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc16"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 2;
        blydwfc_playMethod = 16;
        $("#blydwfc_ballView").empty();
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc17"){
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 17;
        createSumLayout("blydwfc",0,27,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc18"){
        //直选跨度
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 18;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc19"){
        //后三组三
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 19;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc20"){
        //后三组六
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 20;
        createOneLineLayout("blydwfc","至少选择3个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc21"){
        //后三和值
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 21;
        createSumLayout("blydwfc",1,26,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc22"){
        //后三组选包胆
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 22;
        blydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blydwfc",array,["请选择一个号码"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc23"){
        //后三混合组选
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 2;
        blydwfc_playMethod = 23;
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc24"){
        //和值尾数
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 24;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc25"){
        //特殊号
        $("#blydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        blydwfc_sntuo = 0;
        blydwfc_playType = 2;
        blydwfc_playMethod = 25;
        createNonNumLayout("blydwfc",blydwfc_playMethod,num,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc26"){
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 26;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
        createThreeLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc27"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 3;
        blydwfc_playMethod = 27;
        $("#blydwfc_ballView").empty();
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc28"){
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 28;
        createSumLayout("blydwfc",0,27,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc29"){
        //直选跨度
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 29;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc30"){
        //中三组三
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 30;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc31"){
        //中三组六
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 31;
        createOneLineLayout("blydwfc","至少选择3个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc32"){
        //中三和值
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 32;
        createSumLayout("blydwfc",1,26,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc33"){
        //中三组选包胆
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 33;
        blydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blydwfc",array,["请选择一个号码"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc34"){
        //中三混合组选
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 3;
        blydwfc_playMethod = 34;
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc35"){
        //和值尾数
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 35;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc36"){
        //特殊号
        $("#blydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        blydwfc_sntuo = 0;
        blydwfc_playType = 3;
        blydwfc_playMethod = 36;
        createNonNumLayout("blydwfc",blydwfc_playMethod,num,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc37"){
        //直选复式
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 37;
        var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
        createThreeLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc38"){
        //直选单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 4;
        blydwfc_playMethod = 38;
        $("#blydwfc_ballView").empty();
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc39"){
        //和值
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 39;
        createSumLayout("blydwfc",0,27,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc40"){
        //直选跨度
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 40;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc41"){
        //前三组三
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 41;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc42"){
        //前三组六
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 42;
        createOneLineLayout("blydwfc","至少选择3个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc43"){
        //前三和值
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 43;
        createSumLayout("blydwfc",1,26,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc44"){
        //前三组选包胆
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 44;
        blydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blydwfc",array,["请选择一个号码"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc45"){
        //前三混合组选
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 4;
        blydwfc_playMethod = 45;
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc46"){
        //和值尾数
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 46;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc47"){
        //特殊号
        $("#blydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        blydwfc_sntuo = 0;
        blydwfc_playType = 4;
        blydwfc_playMethod = 47;
        createNonNumLayout("blydwfc",blydwfc_playMethod,num,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc48"){
        //后二复式
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 5;
        blydwfc_playMethod = 48;
        var tips = ["十位：可选1-10个","个位：可选1-10个"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc49"){
        //后二单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 5;
        blydwfc_playMethod = 49;
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc50"){
        //后二和值
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 5;
        blydwfc_playMethod = 50;
        createSumLayout("blydwfc",0,18,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc51"){
        //直选跨度
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 5;
        blydwfc_playMethod = 51;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc52"){
        //后二组选
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 5;
        blydwfc_playMethod = 52;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc53"){
        //后二和值
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 5;
        blydwfc_playMethod = 53;
        createSumLayout("blydwfc",1,17,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc54"){
        //后二组选包胆
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 5;
        blydwfc_playMethod = 54;
        blydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blydwfc",array,["请选择一个号码"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc55"){
        //前二复式
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 6;
        blydwfc_playMethod = 55;
        var tips = ["万位：可选1-10个","千位：可选1-10个"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc56"){
        //前二单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 6;
        blydwfc_playMethod = 56;
        blydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
    }else if(val == "blydwfc57"){
        //前二和值
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 6;
        blydwfc_playMethod = 57;
        createSumLayout("blydwfc",0,18,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc58"){
        //直选跨度
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 6;
        blydwfc_playMethod = 58;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc59"){
        //前二组选
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 6;
        blydwfc_playMethod = 59;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc60"){
        //前二和值
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 6;
        blydwfc_playMethod = 60;
        createSumLayout("blydwfc",1,17,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc61"){
        //前二组选包胆
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 6;
        blydwfc_playMethod = 61;
        blydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blydwfc",array,["请选择一个号码"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc62"){
        //定位复式
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 7;
        blydwfc_playMethod = 62;
        createFiveLineLayout("blydwfc", function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc63"){
        //后三一码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 63;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc64"){
        //后三二码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 64;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc65"){
        //前三一码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 65;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc66"){
        //前三二码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 66;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc67"){
        //后四一码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 67;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc68"){
        //后四二码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 68;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc69"){
        //前四一码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 69;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc70"){
        //前四二码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 70;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc71"){
        //五星一码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 71;
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc72"){
        //五星二码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 72;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc73"){
        //五星三码
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 8;
        blydwfc_playMethod = 73;
        createOneLineLayout("blydwfc","至少选择3个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc74"){
        //后二大小单双
        blydwfc_qingkongAll();
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 9;
        blydwfc_playMethod = 74;
        createTextBallTwoLayout("blydwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc75"){
        //后三大小单双
        blydwfc_qingkongAll();
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 9;
        blydwfc_playMethod = 75;
        createTextBallThreeLayout("blydwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc76"){
        //前二大小单双
        blydwfc_qingkongAll();
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 9;
        blydwfc_playMethod = 76;
        createTextBallTwoLayout("blydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc77"){
        //前三大小单双
        blydwfc_qingkongAll();
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 9;
        blydwfc_playMethod = 77;
        createTextBallThreeLayout("blydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc78"){
        //直选复式
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 10;
        blydwfc_playMethod = 78;
        createFiveLineLayout("blydwfc",function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc79"){
        //直选单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 10;
        blydwfc_playMethod = 79;
        var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
        createRenXuanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc80"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 10;
        blydwfc_playMethod = 80;
        createSumLayout("blydwfc",0,18,function(){
            blydwfc_calcNotes();
        });
        createRenXuanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc81"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 10;
        blydwfc_playMethod = 81;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        createRenXuanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc82"){
        //组选单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 10;
        blydwfc_playMethod = 82;
        var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
        createRenXuanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc83"){
        //组选和值
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 10;
        blydwfc_playMethod = 83;
        createSumLayout("blydwfc",1,17,function(){
            blydwfc_calcNotes();
        });
        createRenXuanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc84"){
        //直选复式
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 11;
        blydwfc_playMethod = 84;
        createFiveLineLayout("blydwfc", function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc85"){
        //直选单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 11;
        blydwfc_playMethod = 85;
        var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
        createRenXuanSanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc86"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 11;
        blydwfc_playMethod = 86;
        createSumLayout("blydwfc",0,27,function(){
            blydwfc_calcNotes();
        });
        createRenXuanSanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc87"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 11;
        blydwfc_playMethod = 87;
        createOneLineLayout("blydwfc","至少选择2个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        createRenXuanSanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc88"){
        //组选单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 11;
        blydwfc_playMethod = 88;
        var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
        createRenXuanSanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc89"){
        //组选和值
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 11;
        blydwfc_playMethod = 89;
        createOneLineLayout("blydwfc","至少选择3个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        createRenXuanSanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc90"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 11;
        blydwfc_playMethod = 90;
        var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
        createRenXuanSanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc91"){
        //混合组选
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 11;
        blydwfc_playMethod = 91;
        var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
        createRenXuanSanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc92"){
        //组选和值
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 11;
        blydwfc_playMethod = 92;
        createSumLayout("blydwfc",1,26,function(){
            blydwfc_calcNotes();
        });
        createRenXuanSanLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc93"){
        $("#blydwfc_random").show();
        blydwfc_sntuo = 0;
        blydwfc_playType = 12;
        blydwfc_playMethod = 93;
        createFiveLineLayout("blydwfc", function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc94"){
        //直选单式
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 3;
        blydwfc_playType = 12;
        blydwfc_playMethod = 94;
        var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blydwfc",tips);
        createRenXuanSiLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc95"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 12;
        blydwfc_playMethod = 95;
        createOneLineLayout("blydwfc","至少选择4个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        createRenXuanSiLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc96"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 12;
        blydwfc_playMethod = 96;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        createRenXuanSiLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc97"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 12;
        blydwfc_playMethod = 97;
        $("#blydwfc_ballView").empty();
        createOneLineLayout("blydwfc","二重号:至少选择2个号码",0,9,false,function(){
            blydwfc_calcNotes();
        });
        createRenXuanSiLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc98"){
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 12;
        blydwfc_playMethod = 98;
        $("#blydwfc_ballView").empty();
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("blydwfc",tips,0,9,false,function(){
            blydwfc_calcNotes();
        });
        createRenXuanSiLayout("blydwfc",blydwfc_playMethod,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc99"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 13;
        blydwfc_playMethod = 99;
        $("#blydwfc_ballView").empty();
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc100"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 13;
        blydwfc_playMethod = 100;
        $("#blydwfc_ballView").empty();
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc101"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 13;
        blydwfc_playMethod = 101;
        $("#blydwfc_ballView").empty();
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc102"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 13;
        blydwfc_playMethod = 102;
        $("#blydwfc_ballView").empty();
        createOneLineLayout("blydwfc","至少选择1个",0,9,false,function(){
            blydwfc_calcNotes();
        });
        blydwfc_qingkongAll();
    }else if(val == "blydwfc103"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 103;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc104"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 104;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc105"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 105;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc106"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 106;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc107"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 107;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc108"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 108;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc109"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 109;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc110"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 110;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc111"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 111;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }else if(val == "blydwfc112"){
        blydwfc_qingkongAll();
        $("#blydwfc_random").hide();
        blydwfc_sntuo = 0;
        blydwfc_playType = 14;
        blydwfc_playMethod = 112;
        createTextBallOneLayout("blydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blydwfc_calcNotes();
        });
    }

    if(blydwfcScroll){
        blydwfcScroll.refresh();
        blydwfcScroll.scrollTo(0,0,1);
    }
    
    $("#blydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
    
    initFooterData("blydwfc",temp);
    hideRandomWhenLi("blydwfc",blydwfc_sntuo,blydwfc_playMethod);
    blydwfc_calcNotes();
}
/**
 * [blydwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function blydwfc_initFooterButton(){
    if(blydwfc_playMethod == 0 || blydwfc_playMethod == 62 || blydwfc_playMethod == 78
        || blydwfc_playMethod == 84 || blydwfc_playMethod == 93 || blydwfc_playType == 7){
        if(LotteryStorage["blydwfc"]["line1"].length > 0 || LotteryStorage["blydwfc"]["line2"].length > 0 ||
            LotteryStorage["blydwfc"]["line3"].length > 0 || LotteryStorage["blydwfc"]["line4"].length > 0 ||
            LotteryStorage["blydwfc"]["line5"].length > 0){
            $("#blydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blydwfc_qingkong").css("opacity",0.4);
        }
    }else if(blydwfc_playMethod == 9){
        if(LotteryStorage["blydwfc"]["line1"].length > 0 || LotteryStorage["blydwfc"]["line2"].length > 0 ||
            LotteryStorage["blydwfc"]["line3"].length > 0 || LotteryStorage["blydwfc"]["line4"].length > 0 ){
            $("#blydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blydwfc_qingkong").css("opacity",0.4);
        }
    }else if(blydwfc_playMethod == 37 || blydwfc_playMethod == 4 || blydwfc_playMethod == 6
        || blydwfc_playMethod == 26 || blydwfc_playMethod == 15 || blydwfc_playMethod == 75 || blydwfc_playMethod == 77){
        if(LotteryStorage["blydwfc"]["line1"].length > 0 || LotteryStorage["blydwfc"]["line2"].length > 0
            || LotteryStorage["blydwfc"]["line3"].length > 0){
            $("#blydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blydwfc_qingkong").css("opacity",0.4);
        }
    }else if(blydwfc_playMethod == 3 || blydwfc_playMethod == 4 || blydwfc_playMethod == 5
        || blydwfc_playMethod == 6 || blydwfc_playMethod == 7 || blydwfc_playMethod == 12
        || blydwfc_playMethod == 14 || blydwfc_playMethod == 48 || blydwfc_playMethod == 55
        || blydwfc_playMethod == 74 || blydwfc_playMethod == 76 || blydwfc_playMethod == 96 || blydwfc_playMethod == 98){
        if(LotteryStorage["blydwfc"]["line1"].length > 0 || LotteryStorage["blydwfc"]["line2"].length > 0){
            $("#blydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blydwfc_qingkong").css("opacity",0.4);
        }
    }else if(blydwfc_playMethod == 2 || blydwfc_playMethod == 8 || blydwfc_playMethod == 11 || blydwfc_playMethod == 13 || blydwfc_playMethod == 39
        || blydwfc_playMethod == 28 || blydwfc_playMethod == 17 || blydwfc_playMethod == 18 || blydwfc_playMethod == 24 || blydwfc_playMethod == 41
        || blydwfc_playMethod == 25 || blydwfc_playMethod == 29 || blydwfc_playMethod == 42 || blydwfc_playMethod == 43 || blydwfc_playMethod == 30
        || blydwfc_playMethod == 35 || blydwfc_playMethod == 36 || blydwfc_playMethod == 31 || blydwfc_playMethod == 32 || blydwfc_playMethod == 19
        || blydwfc_playMethod == 40 || blydwfc_playMethod == 46 || blydwfc_playMethod == 20 || blydwfc_playMethod == 21 || blydwfc_playMethod == 50
        || blydwfc_playMethod == 47 || blydwfc_playMethod == 51 || blydwfc_playMethod == 52 || blydwfc_playMethod == 53 || blydwfc_playMethod == 57 || blydwfc_playMethod == 63
        || blydwfc_playMethod == 58 || blydwfc_playMethod == 59 || blydwfc_playMethod == 60 || blydwfc_playMethod == 65 || blydwfc_playMethod == 80 || blydwfc_playMethod == 81 || blydwfc_playType == 8
        || blydwfc_playMethod == 83 || blydwfc_playMethod == 86 || blydwfc_playMethod == 87 || blydwfc_playMethod == 22 || blydwfc_playMethod == 33 || blydwfc_playMethod == 44
        || blydwfc_playMethod == 89 || blydwfc_playMethod == 92 || blydwfc_playMethod == 95 || blydwfc_playMethod == 54 || blydwfc_playMethod == 61
        || blydwfc_playMethod == 97 || blydwfc_playType == 13  || blydwfc_playType == 14){
        if(LotteryStorage["blydwfc"]["line1"].length > 0){
            $("#blydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blydwfc_qingkong").css("opacity",0.4);
        }
    }else{
        $("#blydwfc_qingkong").css("opacity",0);
    }

    if($("#blydwfc_qingkong").css("opacity") == "0"){
        $("#blydwfc_qingkong").css("display","none");
    }else{
        $("#blydwfc_qingkong").css("display","block");
    }

    if($('#blydwfc_zhushu').html() > 0){
        $("#blydwfc_queding").css("opacity",1.0);
    }else{
        $("#blydwfc_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  blydwfc_qingkongAll(){
    $("#blydwfc_ballView span").removeClass('redBalls_active');
    LotteryStorage["blydwfc"]["line1"] = [];
    LotteryStorage["blydwfc"]["line2"] = [];
    LotteryStorage["blydwfc"]["line3"] = [];
    LotteryStorage["blydwfc"]["line4"] = [];
    LotteryStorage["blydwfc"]["line5"] = [];

    localStorageUtils.removeParam("blydwfc_line1");
    localStorageUtils.removeParam("blydwfc_line2");
    localStorageUtils.removeParam("blydwfc_line3");
    localStorageUtils.removeParam("blydwfc_line4");
    localStorageUtils.removeParam("blydwfc_line5");

    $('#blydwfc_zhushu').text(0);
    $('#blydwfc_money').text(0);
    clearAwardWin("blydwfc");
    blydwfc_initFooterButton();
}

/**
 * [blydwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function blydwfc_calcNotes(){
	$('#blydwfc_modeId').blur();
	$('#blydwfc_fandian').blur();
	
    var notes = 0;

    if(blydwfc_playMethod == 0){
        notes = LotteryStorage["blydwfc"]["line1"].length *
            LotteryStorage["blydwfc"]["line2"].length *
            LotteryStorage["blydwfc"]["line3"].length *
            LotteryStorage["blydwfc"]["line4"].length *
            LotteryStorage["blydwfc"]["line5"].length;
    }else if(blydwfc_playMethod == 2){
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,5);
    }else if(blydwfc_playMethod == 3){
        if (LotteryStorage["blydwfc"]["line1"].length >= 1 && LotteryStorage["blydwfc"]["line2"].length >= 3) {
            notes = getArraySelect(3,LotteryStorage["blydwfc"]["line1"],LotteryStorage["blydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(blydwfc_playMethod == 4){
        if (LotteryStorage["blydwfc"]["line1"].length >= 2 && LotteryStorage["blydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(2,LotteryStorage["blydwfc"]["line2"],LotteryStorage["blydwfc"]["line1"]);
        }else{
            notes = 0;
        }
    }else if(blydwfc_playMethod == 5 || blydwfc_playMethod == 12){
        if (LotteryStorage["blydwfc"]["line1"].length >= 1 && LotteryStorage["blydwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["blydwfc"]["line1"],LotteryStorage["blydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(blydwfc_playMethod == 6 || blydwfc_playMethod == 7 || blydwfc_playMethod == 14){
        if (LotteryStorage["blydwfc"]["line1"].length >= 1 && LotteryStorage["blydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["blydwfc"]["line1"],LotteryStorage["blydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(blydwfc_playMethod == 9){
        notes = LotteryStorage["blydwfc"]["line1"].length *
            LotteryStorage["blydwfc"]["line2"].length *
            LotteryStorage["blydwfc"]["line3"].length *
            LotteryStorage["blydwfc"]["line4"].length;
    }else if(blydwfc_playMethod == 18 || blydwfc_playMethod == 29 || blydwfc_playMethod == 40){
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["blydwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
            }
        }
    }else if(blydwfc_playMethod == 22 || blydwfc_playMethod == 33 || blydwfc_playMethod == 44 ){
        notes = 54;
    }else if(blydwfc_playMethod == 54 || blydwfc_playMethod == 61){
        notes = 9;
    }else if(blydwfc_playMethod == 51 || blydwfc_playMethod == 58){
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["blydwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 2;
            }
        }
    }else if(blydwfc_playMethod == 11){
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,4);
    }else if(blydwfc_playMethod == 13|| blydwfc_playMethod == 64 || blydwfc_playMethod == 66 || blydwfc_playMethod == 68 || blydwfc_playMethod == 70 || blydwfc_playMethod == 72){
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,2);
    }else if(blydwfc_playMethod == 37 || blydwfc_playMethod == 26 || blydwfc_playMethod == 15 || blydwfc_playMethod == 75 || blydwfc_playMethod == 77){
        notes = LotteryStorage["blydwfc"]["line1"].length *
            LotteryStorage["blydwfc"]["line2"].length *
            LotteryStorage["blydwfc"]["line3"].length ;
    }else if(blydwfc_playMethod == 39 || blydwfc_playMethod == 28 || blydwfc_playMethod == 17){
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["blydwfc"]["line1"][i]);
        };
    }else if(blydwfc_playMethod == 41 || blydwfc_playMethod == 30 || blydwfc_playMethod == 19){
        notes = mathUtil.getACombination(LotteryStorage["blydwfc"]["line1"].length,2);
    }else if(blydwfc_playMethod == 42 || blydwfc_playMethod == 31 || blydwfc_playMethod == 20 || blydwfc_playMethod == 68 || blydwfc_playMethod == 73){
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,3);
    }else if(blydwfc_playMethod == 43 || blydwfc_playMethod == 32 || blydwfc_playMethod == 21){
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["blydwfc"]["line1"][i]);
        };
    }else if(blydwfc_playMethod == 48 || blydwfc_playMethod == 55 || blydwfc_playMethod == 74 || blydwfc_playMethod == 76){
        notes = LotteryStorage["blydwfc"]["line1"].length *
            LotteryStorage["blydwfc"]["line2"].length ;
    }else if(blydwfc_playMethod == 50 || blydwfc_playMethod == 57){
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["blydwfc"]["line1"][i]);
        };
    }else if(blydwfc_playMethod == 52 || blydwfc_playMethod == 59){
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,2);
    }else if(blydwfc_playMethod == 53 || blydwfc_playMethod == 60){
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["blydwfc"]["line1"][i]);
        };
    }else if(blydwfc_playMethod == 62){
        notes = LotteryStorage["blydwfc"]["line1"].length +
            LotteryStorage["blydwfc"]["line2"].length +
            LotteryStorage["blydwfc"]["line3"].length +
            LotteryStorage["blydwfc"]["line4"].length +
            LotteryStorage["blydwfc"]["line5"].length;
    }else if(blydwfc_playType == 13 || blydwfc_playType == 14 || blydwfc_playMethod == 8 || blydwfc_playMethod == 71
        || blydwfc_playMethod == 24 || blydwfc_playMethod == 25 || blydwfc_playMethod == 35 || blydwfc_playMethod == 36 || blydwfc_playMethod == 46
        || blydwfc_playMethod == 47 || blydwfc_playMethod == 63 || blydwfc_playMethod == 65 || blydwfc_playMethod == 67 || blydwfc_playMethod == 69 ){
        notes = LotteryStorage["blydwfc"]["line1"].length ;
    }else if(blydwfc_playMethod == 78){
        notes = LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line2"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line3"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line4"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line3"].length +
            LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line4"].length +
            LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line4"].length +
            LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line4"].length * LotteryStorage["blydwfc"]["line5"].length;
    }else if (blydwfc_playMethod == 80) {
        if ($("#blydwfc_tab .button.red").size() < 2) {
            notes = 0;
        }else{
            for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
                notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["blydwfc"]["line1"][i]);
            };
            notes *= mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,2);
        }
    }else if (blydwfc_playMethod == 81) {
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,2);
    }else if (blydwfc_playMethod == 83) {
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["blydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,2);
    }else if (blydwfc_playMethod == 84) {
        notes = LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line3"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line4"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line4"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line4"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line4"].length +
            LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line4"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line4"].length * LotteryStorage["blydwfc"]["line5"].length ;
    }else if (blydwfc_playMethod == 86) {
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["blydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,3);
    }else if (blydwfc_playMethod == 87) {
        notes = mathUtil.getACombination(LotteryStorage["blydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,3);
    }else if (blydwfc_playMethod == 89) {
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,3) * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,3);
    }else if (blydwfc_playMethod == 92) {
        for (var i = 0; i < LotteryStorage["blydwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["blydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,3);
    }else if (blydwfc_playMethod == 93) {
        notes = LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line4"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line4"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line1"].length * LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line4"].length * LotteryStorage["blydwfc"]["line5"].length +
            LotteryStorage["blydwfc"]["line2"].length * LotteryStorage["blydwfc"]["line3"].length * LotteryStorage["blydwfc"]["line4"].length * LotteryStorage["blydwfc"]["line5"].length;
    }else if (blydwfc_playMethod == 95) {
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,4)
            * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,4);
    }else if (blydwfc_playMethod == 96) {
        if (LotteryStorage["blydwfc"]["line1"].length >= 1 && LotteryStorage["blydwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["blydwfc"]["line1"],LotteryStorage["blydwfc"]["line2"])
                * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else if (blydwfc_playMethod == 97) {
        notes = mathUtil.getCCombination(LotteryStorage["blydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,4);
    }else if (blydwfc_playMethod == 98) {
        if (LotteryStorage["blydwfc"]["line1"].length >= 1 && LotteryStorage["blydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["blydwfc"]["line1"],LotteryStorage["blydwfc"]["line2"]) * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else{
        notes = blydwfcValidData($("#blydwfc_single").val());
    }

    if(blydwfc_sntuo == 3 || blydwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","blydwfc"),LotteryInfo.getMethodId("ssc",blydwfc_playMethod))){
    }else{
        if(parseInt($('#blydwfc_modeId').val()) == 8){
            $("#blydwfc_random").hide();
        }else{
            $("#blydwfc_random").show();
        }
    }

    //验证是否为空
    if( $("#blydwfc_beiNum").val() =="" || parseInt($("#blydwfc_beiNum").val()) == 0){
        $("#blydwfc_beiNum").val(1);
    }

    //验证慢彩最大倍数
    if($("#blydwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#blydwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#blydwfc_zhushu').text(notes);
        if($("#blydwfc_modeId").val() == "8"){
            $('#blydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blydwfc_beiNum").val()),0.002));
        }else if ($("#blydwfc_modeId").val() == "2"){
            $('#blydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blydwfc_beiNum").val()),0.2));
        }else if ($("#blydwfc_modeId").val() == "1"){
            $('#blydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blydwfc_beiNum").val()),0.02));
        }else{
            $('#blydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blydwfc_beiNum").val()),2));
        }
    } else {
        $('#blydwfc_zhushu').text(0);
        $('#blydwfc_money').text(0);
    }
    blydwfc_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('blydwfc',blydwfc_playMethod);
}

/**
 * [blydwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function blydwfc_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#blydwfc_queding").bind('click', function(event) {
        blydwfc_rebate = $("#blydwfc_fandian option:last").val();
        if(parseInt($('#blydwfc_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        blydwfc_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#blydwfc_modeId').val()) == 8){
            if (Number($('#blydwfc_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('blydwfc',blydwfc_playMethod);

        submitParams.lotteryType = "blydwfc";
        var play = LotteryInfo.getPlayName("ssc",blydwfc_playType);
        var playMethod = LotteryInfo.getMethodName("ssc",blydwfc_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = blydwfc_playType;
        submitParams.playMethodIndex = blydwfc_playMethod;
        var selectedBalls = [];
        if(blydwfc_playMethod == 0 || blydwfc_playMethod == 3 || blydwfc_playMethod == 4
            || blydwfc_playMethod == 5 || blydwfc_playMethod == 6 || blydwfc_playMethod == 7
            || blydwfc_playMethod == 9 || blydwfc_playMethod == 12 || blydwfc_playMethod == 14
            || blydwfc_playMethod == 37 || blydwfc_playMethod == 26 || blydwfc_playMethod == 15
            || blydwfc_playMethod == 48 || blydwfc_playMethod == 55 || blydwfc_playMethod == 74 || blydwfc_playType == 9){
            $("#blydwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(blydwfc_playMethod == 2 || blydwfc_playMethod == 8 || blydwfc_playMethod == 11 || blydwfc_playMethod == 13 || blydwfc_playMethod == 24
            || blydwfc_playMethod == 39 || blydwfc_playMethod == 28 || blydwfc_playMethod == 17 || blydwfc_playMethod == 18 || blydwfc_playMethod == 25
            || blydwfc_playMethod == 22 || blydwfc_playMethod == 33 || blydwfc_playMethod == 44 || blydwfc_playMethod == 54 || blydwfc_playMethod == 61
            || blydwfc_playMethod == 41 || blydwfc_playMethod == 42 || blydwfc_playMethod == 43 || blydwfc_playMethod == 29 || blydwfc_playMethod == 35
            || blydwfc_playMethod == 30 || blydwfc_playMethod == 31 || blydwfc_playMethod == 32 || blydwfc_playMethod == 40 || blydwfc_playMethod == 36
            || blydwfc_playMethod == 19 || blydwfc_playMethod == 20 || blydwfc_playMethod == 21 || blydwfc_playMethod == 46 || blydwfc_playMethod == 47
            || blydwfc_playMethod == 50 || blydwfc_playMethod == 57 || blydwfc_playType == 8 || blydwfc_playMethod == 51 || blydwfc_playMethod == 58
            || blydwfc_playMethod == 52 || blydwfc_playMethod == 53|| blydwfc_playMethod == 59 || blydwfc_playMethod == 60 || blydwfc_playType == 13 || blydwfc_playType == 14){
            $("#blydwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(blydwfc_playType == 7 || blydwfc_playMethod == 78 || blydwfc_playMethod == 84 || blydwfc_playMethod == 93){
            $("#blydwfc_ballView div.ballView").each(function(){
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
        }else if(blydwfc_playMethod == 80 || blydwfc_playMethod == 81 || blydwfc_playMethod == 83
            || blydwfc_playMethod == 86 || blydwfc_playMethod == 87 || blydwfc_playMethod == 89
            || blydwfc_playMethod == 92 || blydwfc_playMethod == 95 || blydwfc_playMethod == 97){
            $("#blydwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            var temp = selectedBalls.join(",") + "#";

            if ($("#blydwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#blydwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#blydwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#blydwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#blydwfc_tab5").hasClass("button red")) {
                temp += "个";
            };

            submitParams.nums = temp;
        }else if (blydwfc_playMethod == 96 || blydwfc_playMethod == 98) {
            $("#blydwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            var temp = selectedBalls.join("|") + "#";
            if ($("#blydwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#blydwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#blydwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#blydwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#blydwfc_tab5").hasClass("button red")) {
                temp += "个";
            };
            submitParams.nums = temp;
        }else{
		    //去错误号
		    blydwfcValidateData("submit");
            var array = handleSingleStr($("#blydwfc_single").val());
            if(blydwfc_playMethod == 1 ){
                submitParams.nums = array.join(" ");
            }else if(blydwfc_playMethod == 10 || blydwfc_playMethod == 38 || blydwfc_playMethod == 27
                || blydwfc_playMethod == 16 || blydwfc_playMethod == 49 || blydwfc_playMethod == 56){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join("|");
                    }else{
                        temp = temp + array[i].split("").join("|") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(blydwfc_playMethod == 45 || blydwfc_playMethod == 34 || blydwfc_playMethod == 23){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(blydwfc_playMethod == 79 || blydwfc_playMethod == 82 || blydwfc_playMethod == 85 || blydwfc_playMethod == 88 ||
                blydwfc_playMethod == 89 || blydwfc_playMethod == 90 || blydwfc_playMethod == 91 || blydwfc_playMethod == 94){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                temp +="#";
                if ($("#blydwfc_tab1").hasClass("button red")) {
                    temp += "万";
                };
                if ($("#blydwfc_tab2").hasClass("button red")) {
                    temp += "千";
                };
                if ($("#blydwfc_tab3").hasClass("button red")) {
                    temp += "百";
                };
                if ($("#blydwfc_tab4").hasClass("button red")) {
                    temp += "十";
                };
                if ($("#blydwfc_tab5").hasClass("button red")) {
                    temp += "个";
                };

                submitParams.nums = temp;
            }
        }
        localStorageUtils.setParam("playMode",$("#blydwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#blydwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#blydwfc_fandian").val());
        submitParams.notes = $('#blydwfc_zhushu').html();
        submitParams.sntuo = blydwfc_sntuo;
        submitParams.multiple = $('#blydwfc_beiNum').val();  //requirement
        submitParams.rebates = $('#blydwfc_fandian').val();  //requirement
        submitParams.playMode = $('#blydwfc_modeId').val();  //requirement
        submitParams.money = $('#blydwfc_money').html();  //requirement
        submitParams.award = $('#blydwfc_minAward').html();  //奖金
        submitParams.maxAward = $('#blydwfc_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#blydwfc_ballView").empty();
        blydwfc_qingkongAll();
    });
}

/**
 * [blydwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function blydwfc_randomOne(){
    blydwfc_qingkongAll();
    if(blydwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        LotteryStorage["blydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["blydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["blydwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["blydwfc"]["line4"].push(redBallArray[3]+"");
        LotteryStorage["blydwfc"]["line5"].push(redBallArray[4]+"");

        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line2"], function(k, v){
            $("#" + "blydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line3"], function(k, v){
            $("#" + "blydwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line4"], function(k, v){
            $("#" + "blydwfc_line4" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line5"], function(k, v){
            $("#" + "blydwfc_line5" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["blydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        LotteryStorage["blydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["blydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["blydwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["blydwfc"]["line4"].push(redBallArray[3]+"");

        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line2"], function(k, v){
            $("#" + "blydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line3"], function(k, v){
            $("#" + "blydwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line4"], function(k, v){
            $("#" + "blydwfc_line4" + v).toggleClass("redBalls_active");
        });

    }else if(blydwfc_playMethod == 37 || blydwfc_playMethod == 26 || blydwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        LotteryStorage["blydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["blydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["blydwfc"]["line3"].push(redBallArray[2]+"");

        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line2"], function(k, v){
            $("#" + "blydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line3"], function(k, v){
            $("#" + "blydwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 41 || blydwfc_playMethod == 30 || blydwfc_playMethod == 19 || blydwfc_playMethod == 68
        || blydwfc_playMethod == 52 || blydwfc_playMethod == 64 || blydwfc_playMethod == 66
        || blydwfc_playMethod == 59 || blydwfc_playMethod == 70 || blydwfc_playMethod == 72){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["blydwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 42 || blydwfc_playMethod == 31 || blydwfc_playMethod == 20 || blydwfc_playMethod == 73){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["blydwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 39 || blydwfc_playMethod == 28 || blydwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        LotteryStorage["blydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 43 || blydwfc_playMethod == 32 || blydwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        LotteryStorage["blydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 48 || blydwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        LotteryStorage["blydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["blydwfc"]["line2"].push(redBallArray[1]+"");

        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line2"], function(k, v){
            $("#" + "blydwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 25 || blydwfc_playMethod == 36 || blydwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["blydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 50 || blydwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        LotteryStorage["blydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 53 || blydwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        LotteryStorage["blydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["blydwfc"]["line"+line].push(number+"");
        $.each(LotteryStorage["blydwfc"]["line"+line], function(k, v){
            $("#" + "blydwfc_line" + line + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 63 || blydwfc_playMethod == 67 || blydwfc_playMethod == 69 || blydwfc_playMethod == 71 || blydwfc_playType == 13
        || blydwfc_playMethod == 65 || blydwfc_playMethod == 18 || blydwfc_playMethod == 29 || blydwfc_playMethod == 40 || blydwfc_playMethod == 22
        || blydwfc_playMethod == 33 || blydwfc_playMethod == 44 || blydwfc_playMethod == 54 || blydwfc_playMethod == 61
        || blydwfc_playMethod == 24 || blydwfc_playMethod == 35 || blydwfc_playMethod == 46 || blydwfc_playMethod == 51 || blydwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["blydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 74 || blydwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        LotteryStorage["blydwfc"]["line1"].push(array[0]+"");
        LotteryStorage["blydwfc"]["line2"].push(array[1]+"");
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line2"], function(k, v){
            $("#" + "blydwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 75 || blydwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        LotteryStorage["blydwfc"]["line1"].push(array[0]+"");
        LotteryStorage["blydwfc"]["line2"].push(array[1]+"");
        LotteryStorage["blydwfc"]["line3"].push(array[2]+"");
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line2"], function(k, v){
            $("#" + "blydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line3"], function(k, v){
            $("#" + "blydwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);
        LotteryStorage["blydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["blydwfc"]["line"+lines[1]].push(array[1]+"");
        $.each(LotteryStorage["blydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "blydwfc_line" + lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "blydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        LotteryStorage["blydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["blydwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["blydwfc"]["line"+lines[2]].push(array[2]+"");

        $.each(LotteryStorage["blydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "blydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "blydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "blydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        LotteryStorage["blydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["blydwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["blydwfc"]["line"+lines[2]].push(array[2]+"");
        LotteryStorage["blydwfc"]["line"+lines[3]].push(array[3]+"");

        $.each(LotteryStorage["blydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "blydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "blydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line"+lines[2]], function(k, v){
            $("#" + "blydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blydwfc"]["line"+lines[3]], function(k, v){
            $("#" + "blydwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
        });
    }else if(blydwfc_playType == 14){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["blydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blydwfc"]["line1"], function(k, v){
            $("#" + "blydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }
    blydwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function blydwfc_checkOutRandom(playMethod){
    var obj = new Object();
    if(blydwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(blydwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(blydwfc_playMethod == 18 || blydwfc_playMethod == 29 || blydwfc_playMethod == 40){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
        }
    }else if(blydwfc_playMethod == 22 || blydwfc_playMethod == 33 || blydwfc_playMethod == 44){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 54;
    }else if(blydwfc_playMethod == 54 || blydwfc_playMethod == 61){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 9;
    }
    else if(blydwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(blydwfc_playMethod == 37 || blydwfc_playMethod == 26 || blydwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(blydwfc_playMethod == 39 || blydwfc_playMethod == 28 || blydwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        obj.nums = number;
        obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
    }else if(blydwfc_playMethod == 41 || blydwfc_playMethod == 30 || blydwfc_playMethod == 19){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(blydwfc_playMethod == 52 || blydwfc_playMethod == 59 || blydwfc_playMethod == 64 || blydwfc_playMethod == 66 || blydwfc_playMethod == 68
        ||blydwfc_playMethod == 70 || blydwfc_playMethod == 72){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(blydwfc_playMethod == 42 || blydwfc_playMethod == 31 || blydwfc_playMethod == 20 || blydwfc_playMethod == 73){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(blydwfc_playMethod == 43 || blydwfc_playMethod == 32 || blydwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        obj.nums = number;
        obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
    }else if(blydwfc_playMethod == 48 || blydwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(blydwfc_playMethod == 50 || blydwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
    }else if(blydwfc_playMethod == 53 || blydwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
    }else if(blydwfc_playMethod == 62){
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
    }else if(blydwfc_playMethod == 63 || blydwfc_playMethod == 65 || blydwfc_playMethod == 67 || blydwfc_playMethod == 69 || blydwfc_playMethod == 71
        || blydwfc_playMethod == 24 || blydwfc_playMethod == 35 || blydwfc_playMethod == 46){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 1;
    }else if(blydwfc_playMethod == 25 || blydwfc_playMethod == 36 || blydwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        var array = ["豹子","顺子","对子","半顺","杂六"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(blydwfc_playMethod == 51 || blydwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
        }
    }else if(blydwfc_playMethod == 74 || blydwfc_playMethod == 76){
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
    }else if(blydwfc_playMethod == 75 || blydwfc_playMethod == 77){
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
    }else if(blydwfc_playMethod == 78){
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
    }else if(blydwfc_playMethod == 84){
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
    }else if(blydwfc_playMethod == 93){
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
    obj.sntuo = blydwfc_sntuo;
    obj.multiple = 1;
    obj.rebates = blydwfc_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('blydwfc',blydwfc_playMethod,obj);  //机选奖金计算
    obj.award = $('#blydwfc_minAward').html();     //奖金
    obj.maxAward = $('#blydwfc_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [blydwfcValidateData 单式数据验证]
 */
function blydwfcValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#blydwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
    blydwfcValidData(textStr,type);
}

function blydwfcValidData(str,type){
    if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
        array,
        result,
        content = {};
    if(blydwfc_playMethod == 1){
        content.str = str;
        content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 10){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 38 || blydwfc_playMethod == 27 || blydwfc_playMethod == 16){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 45 || blydwfc_playMethod == 34 || blydwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 49 || blydwfc_playMethod == 56){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 79){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,2);
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 82){
        content.str = str;
        content.weishu = 2;
        content.duizi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,2);
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 85){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,3);
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 88){
        content.str = str;
        content.weishu = 3;
        content.zusan = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,3);
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 90){
        content.str = str;
        content.weishu = 3;
        content.zuliu = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,3);
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 91){
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,3);
        blydwfcShowFooter(true,notes);
    }else if(blydwfc_playMethod == 94){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blydwfc_tab .button.red").size() ,4);
        blydwfcShowFooter(true,notes);
    }

    $('#blydwfc_delRepeat').off('click');
    $('#blydwfc_delRepeat').on('click',function () {
        content.str = $('#blydwfc_single').val() ? $('#blydwfc_single').val() : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        array = rptResult.num || [];
        notes = rptResult.length;
        blydwfcShowFooter(true,notes);
        $("#blydwfc_single").val(array.join(" "));
    });

    $("#blydwfc_single").val(array.join(" "));
    return notes;
}

function blydwfcShowFooter(isValid,notes){
    $('#blydwfc_zhushu').text(notes);
    if($("#blydwfc_modeId").val() == "8"){
        $('#blydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blydwfc_beiNum").val()),0.002));
    }else if ($("#blydwfc_modeId").val() == "2"){
        $('#blydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blydwfc_beiNum").val()),0.2));
    }else if ($("#blydwfc_modeId").val() == "1"){
        $('#blydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blydwfc_beiNum").val()),0.02));
    }else{
        $('#blydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blydwfc_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    blydwfc_initFooterButton();
    calcAwardWin('blydwfc',blydwfc_playMethod);  //计算奖金和盈利
}