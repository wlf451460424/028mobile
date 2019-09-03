var blanydwfc_playType = 2;
var blanydwfc_playMethod = 15;
var blanydwfc_sntuo = 0;
var blanydwfc_rebate;
var blanydwfcScroll;

//进入这个页面时调用
function blanydwfcPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("blanydwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("blanydwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function blanydwfcPageUnloadedPanel(){
    $("#blanydwfc_queding").off('click');
    $("#blanydwfcPage_back").off('click');
    $("#blanydwfc_ballView").empty();
    $("#blanydwfcSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="blanydwfcPlaySelect"></select>');
    $("#blanydwfcSelect").append($select);
}

//入口函数
function blanydwfc_init(){
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
    $("#blanydwfc_title").html(LotteryInfo.getLotteryNameByTag("blanydwfc"));
    for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
                var name = LotteryInfo.getMethodName("ssc",j);
                if(i == blanydwfc_playType && j == blanydwfc_playMethod){
                    $play.append('<option value="blanydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="blanydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(blanydwfc_playMethod,onShowArray)>-1 ){
						blanydwfc_playType = i;
						blanydwfc_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#blanydwfcPlaySelect").append($play);
		}
    }
    
    if($("#blanydwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("blanydwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:blanydwfcChangeItem
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

    GetLotteryInfo("blanydwfc",function (){
        blanydwfcChangeItem("blanydwfc"+blanydwfc_playMethod);
    });

    //添加滑动条
    if(!blanydwfcScroll){
        blanydwfcScroll = new IScroll('#blanydwfcContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("blanydwfc",LotteryInfo.getLotteryIdByTag("blanydwfc"));

    //获取上一期开奖
    queryLastPrize("blanydwfc");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('blanydwfc');

    //机选选号
    $("#blanydwfc_random").off('click');
    $("#blanydwfc_random").on('click', function(event) {
        blanydwfc_randomOne();
    });
    
    $("#blanydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",blanydwfc_playMethod));
	//玩法说明
	$("#blanydwfc_paly_shuoming").off('click');
	$("#blanydwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#shuoming").text());
	});

    //返回
    $("#blanydwfcPage_back").on('click', function(event) {
        // blanydwfc_playType = 2;
        // blanydwfc_playMethod = 15;
        $("#blanydwfc_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        blanydwfc_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("blanydwfc");//清空
    blanydwfc_submitData();
}

function blanydwfcResetPlayType(){
    blanydwfc_playType = 2;
    blanydwfc_playMethod = 15;
}

function blanydwfcChangeItem(val) {
    blanydwfc_qingkongAll();
    var temp = val.substring("blanydwfc".length,val.length);
    if(val == "blanydwfc0"){
        //直选复式
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 0;
        createFiveLineLayout("blanydwfc", function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc1"){
        //直选单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 1;
        $("#blanydwfc_ballView").empty();
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc2"){
        //组选120
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 2;
        createOneLineLayout("blanydwfc","至少选择5个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc3"){
        //组选60
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc4"){
        //组选30
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 4;
        var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc5"){
        //组选20
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 5;
        var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc6"){
        //组选10
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 6;
        var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc7"){
        //组选5
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 7;
        var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc8"){
        //总和大小单双
        $("#blanydwfc_random").show();
        var num = ["大","小","单","双"];
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 0;
        blanydwfc_playMethod = 8;
        createNonNumLayout("blanydwfc",blanydwfc_playMethod,num,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc9"){
        //直选复式
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 1;
        blanydwfc_playMethod = 9;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createFourLineLayout("blanydwfc",tips, function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc10"){
        //直选单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 1;
        blanydwfc_playMethod = 10;
        $("#blanydwfc_ballView").empty();
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc11"){
        //组选24
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 1;
        blanydwfc_playMethod = 11;
        createOneLineLayout("blanydwfc","至少选择4个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc12"){
        //组选12
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 1;
        blanydwfc_playMethod = 12;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc13"){
        //组选6
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 1;
        blanydwfc_playMethod = 13;
        createOneLineLayout("blanydwfc","二重号:至少选择2个号码",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc14"){
        //组选4
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 1;
        blanydwfc_playMethod = 14;
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc15"){
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 15;
        var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createThreeLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc16"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 16;
        $("#blanydwfc_ballView").empty();
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc17"){
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 17;
        createSumLayout("blanydwfc",0,27,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc18"){
        //直选跨度
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 18;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc19"){
        //后三组三
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 19;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc20"){
        //后三组六
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 20;
        createOneLineLayout("blanydwfc","至少选择3个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc21"){
        //后三和值
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 21;
        createSumLayout("blanydwfc",1,26,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc22"){
        //后三组选包胆
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 22;
        blanydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blanydwfc",array,["请选择一个号码"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc23"){
        //后三混合组选
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 23;
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc24"){
        //和值尾数
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 24;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc25"){
        //特殊号
        $("#blanydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 2;
        blanydwfc_playMethod = 25;
        createNonNumLayout("blanydwfc",blanydwfc_playMethod,num,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc26"){
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 26;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
        createThreeLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc27"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 27;
        $("#blanydwfc_ballView").empty();
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc28"){
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 28;
        createSumLayout("blanydwfc",0,27,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc29"){
        //直选跨度
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 29;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc30"){
        //中三组三
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 30;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc31"){
        //中三组六
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 31;
        createOneLineLayout("blanydwfc","至少选择3个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc32"){
        //中三和值
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 32;
        createSumLayout("blanydwfc",1,26,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc33"){
        //中三组选包胆
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 33;
        blanydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blanydwfc",array,["请选择一个号码"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc34"){
        //中三混合组选
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 34;
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc35"){
        //和值尾数
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 35;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc36"){
        //特殊号
        $("#blanydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 3;
        blanydwfc_playMethod = 36;
        createNonNumLayout("blanydwfc",blanydwfc_playMethod,num,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc37"){
        //直选复式
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 37;
        var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
        createThreeLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc38"){
        //直选单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 38;
        $("#blanydwfc_ballView").empty();
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc39"){
        //和值
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 39;
        createSumLayout("blanydwfc",0,27,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc40"){
        //直选跨度
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 40;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc41"){
        //前三组三
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 41;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc42"){
        //前三组六
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 42;
        createOneLineLayout("blanydwfc","至少选择3个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc43"){
        //前三和值
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 43;
        createSumLayout("blanydwfc",1,26,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc44"){
        //前三组选包胆
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 44;
        blanydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blanydwfc",array,["请选择一个号码"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc45"){
        //前三混合组选
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 45;
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc46"){
        //和值尾数
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 46;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc47"){
        //特殊号
        $("#blanydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 4;
        blanydwfc_playMethod = 47;
        createNonNumLayout("blanydwfc",blanydwfc_playMethod,num,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc48"){
        //后二复式
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 5;
        blanydwfc_playMethod = 48;
        var tips = ["十位：可选1-10个","个位：可选1-10个"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc49"){
        //后二单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 5;
        blanydwfc_playMethod = 49;
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc50"){
        //后二和值
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 5;
        blanydwfc_playMethod = 50;
        createSumLayout("blanydwfc",0,18,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc51"){
        //直选跨度
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 5;
        blanydwfc_playMethod = 51;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc52"){
        //后二组选
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 5;
        blanydwfc_playMethod = 52;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc53"){
        //后二和值
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 5;
        blanydwfc_playMethod = 53;
        createSumLayout("blanydwfc",1,17,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc54"){
        //后二组选包胆
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 5;
        blanydwfc_playMethod = 54;
        blanydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blanydwfc",array,["请选择一个号码"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc55"){
        //前二复式
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 6;
        blanydwfc_playMethod = 55;
        var tips = ["万位：可选1-10个","千位：可选1-10个"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc56"){
        //前二单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 6;
        blanydwfc_playMethod = 56;
        blanydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
    }else if(val == "blanydwfc57"){
        //前二和值
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 6;
        blanydwfc_playMethod = 57;
        createSumLayout("blanydwfc",0,18,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc58"){
        //直选跨度
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 6;
        blanydwfc_playMethod = 58;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc59"){
        //前二组选
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 6;
        blanydwfc_playMethod = 59;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc60"){
        //前二和值
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 6;
        blanydwfc_playMethod = 60;
        createSumLayout("blanydwfc",1,17,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc61"){
        //前二组选包胆
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 6;
        blanydwfc_playMethod = 61;
        blanydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("blanydwfc",array,["请选择一个号码"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc62"){
        //定位复式
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 7;
        blanydwfc_playMethod = 62;
        createFiveLineLayout("blanydwfc", function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc63"){
        //后三一码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 63;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc64"){
        //后三二码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 64;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc65"){
        //前三一码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 65;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc66"){
        //前三二码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 66;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc67"){
        //后四一码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 67;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc68"){
        //后四二码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 68;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc69"){
        //前四一码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 69;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc70"){
        //前四二码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 70;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc71"){
        //五星一码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 71;
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc72"){
        //五星二码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 72;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc73"){
        //五星三码
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 8;
        blanydwfc_playMethod = 73;
        createOneLineLayout("blanydwfc","至少选择3个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc74"){
        //后二大小单双
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 9;
        blanydwfc_playMethod = 74;
        createTextBallTwoLayout("blanydwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc75"){
        //后三大小单双
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 9;
        blanydwfc_playMethod = 75;
        createTextBallThreeLayout("blanydwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc76"){
        //前二大小单双
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 9;
        blanydwfc_playMethod = 76;
        createTextBallTwoLayout("blanydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc77"){
        //前三大小单双
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 9;
        blanydwfc_playMethod = 77;
        createTextBallThreeLayout("blanydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc78"){
        //直选复式
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 10;
        blanydwfc_playMethod = 78;
        createFiveLineLayout("blanydwfc",function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc79"){
        //直选单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 10;
        blanydwfc_playMethod = 79;
        var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
        createRenXuanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc80"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 10;
        blanydwfc_playMethod = 80;
        createSumLayout("blanydwfc",0,18,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc81"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 10;
        blanydwfc_playMethod = 81;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc82"){
        //组选单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 10;
        blanydwfc_playMethod = 82;
        var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
        createRenXuanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc83"){
        //组选和值
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 10;
        blanydwfc_playMethod = 83;
        createSumLayout("blanydwfc",1,17,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc84"){
        //直选复式
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 84;
        createFiveLineLayout("blanydwfc", function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc85"){
        //直选单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 85;
        var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
        createRenXuanSanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc86"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 86;
        createSumLayout("blanydwfc",0,27,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanSanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc87"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 87;
        createOneLineLayout("blanydwfc","至少选择2个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanSanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc88"){
        //组选单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 88;
        var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
        createRenXuanSanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc89"){
        //组选和值
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 89;
        createOneLineLayout("blanydwfc","至少选择3个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanSanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc90"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 90;
        var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
        createRenXuanSanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc91"){
        //混合组选
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 91;
        var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
        createRenXuanSanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc92"){
        //组选和值
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 11;
        blanydwfc_playMethod = 92;
        createSumLayout("blanydwfc",1,26,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanSanLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc93"){
        $("#blanydwfc_random").show();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 12;
        blanydwfc_playMethod = 93;
        createFiveLineLayout("blanydwfc", function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc94"){
        //直选单式
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 3;
        blanydwfc_playType = 12;
        blanydwfc_playMethod = 94;
        var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("blanydwfc",tips);
        createRenXuanSiLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc95"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 12;
        blanydwfc_playMethod = 95;
        createOneLineLayout("blanydwfc","至少选择4个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanSiLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc96"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 12;
        blanydwfc_playMethod = 96;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanSiLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc97"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 12;
        blanydwfc_playMethod = 97;
        $("#blanydwfc_ballView").empty();
        createOneLineLayout("blanydwfc","二重号:至少选择2个号码",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanSiLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc98"){
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 12;
        blanydwfc_playMethod = 98;
        $("#blanydwfc_ballView").empty();
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("blanydwfc",tips,0,9,false,function(){
            blanydwfc_calcNotes();
        });
        createRenXuanSiLayout("blanydwfc",blanydwfc_playMethod,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc99"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 13;
        blanydwfc_playMethod = 99;
        $("#blanydwfc_ballView").empty();
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc100"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 13;
        blanydwfc_playMethod = 100;
        $("#blanydwfc_ballView").empty();
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc101"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 13;
        blanydwfc_playMethod = 101;
        $("#blanydwfc_ballView").empty();
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc102"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 13;
        blanydwfc_playMethod = 102;
        $("#blanydwfc_ballView").empty();
        createOneLineLayout("blanydwfc","至少选择1个",0,9,false,function(){
            blanydwfc_calcNotes();
        });
        blanydwfc_qingkongAll();
    }else if(val == "blanydwfc103"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 103;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc104"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 104;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc105"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 105;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc106"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 106;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc107"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 107;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc108"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 108;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc109"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 109;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc110"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 110;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc111"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 111;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }else if(val == "blanydwfc112"){
        blanydwfc_qingkongAll();
        $("#blanydwfc_random").hide();
        blanydwfc_sntuo = 0;
        blanydwfc_playType = 14;
        blanydwfc_playMethod = 112;
        createTextBallOneLayout("blanydwfc",["龙","虎","和"],["至少选择一个"],function(){
            blanydwfc_calcNotes();
        });
    }

    if(blanydwfcScroll){
        blanydwfcScroll.refresh();
        blanydwfcScroll.scrollTo(0,0,1);
    }
    
    $("#blanydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
    
    initFooterData("blanydwfc",temp);
    hideRandomWhenLi("blanydwfc",blanydwfc_sntuo,blanydwfc_playMethod);
    blanydwfc_calcNotes();
}
/**
 * [blanydwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function blanydwfc_initFooterButton(){
    if(blanydwfc_playMethod == 0 || blanydwfc_playMethod == 62 || blanydwfc_playMethod == 78
        || blanydwfc_playMethod == 84 || blanydwfc_playMethod == 93 || blanydwfc_playType == 7){
        if(LotteryStorage["blanydwfc"]["line1"].length > 0 || LotteryStorage["blanydwfc"]["line2"].length > 0 ||
            LotteryStorage["blanydwfc"]["line3"].length > 0 || LotteryStorage["blanydwfc"]["line4"].length > 0 ||
            LotteryStorage["blanydwfc"]["line5"].length > 0){
            $("#blanydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blanydwfc_qingkong").css("opacity",0.4);
        }
    }else if(blanydwfc_playMethod == 9){
        if(LotteryStorage["blanydwfc"]["line1"].length > 0 || LotteryStorage["blanydwfc"]["line2"].length > 0 ||
            LotteryStorage["blanydwfc"]["line3"].length > 0 || LotteryStorage["blanydwfc"]["line4"].length > 0 ){
            $("#blanydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blanydwfc_qingkong").css("opacity",0.4);
        }
    }else if(blanydwfc_playMethod == 37 || blanydwfc_playMethod == 4 || blanydwfc_playMethod == 6
        || blanydwfc_playMethod == 26 || blanydwfc_playMethod == 15 || blanydwfc_playMethod == 75 || blanydwfc_playMethod == 77){
        if(LotteryStorage["blanydwfc"]["line1"].length > 0 || LotteryStorage["blanydwfc"]["line2"].length > 0
            || LotteryStorage["blanydwfc"]["line3"].length > 0){
            $("#blanydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blanydwfc_qingkong").css("opacity",0.4);
        }
    }else if(blanydwfc_playMethod == 3 || blanydwfc_playMethod == 4 || blanydwfc_playMethod == 5
        || blanydwfc_playMethod == 6 || blanydwfc_playMethod == 7 || blanydwfc_playMethod == 12
        || blanydwfc_playMethod == 14 || blanydwfc_playMethod == 48 || blanydwfc_playMethod == 55
        || blanydwfc_playMethod == 74 || blanydwfc_playMethod == 76 || blanydwfc_playMethod == 96 || blanydwfc_playMethod == 98){
        if(LotteryStorage["blanydwfc"]["line1"].length > 0 || LotteryStorage["blanydwfc"]["line2"].length > 0){
            $("#blanydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blanydwfc_qingkong").css("opacity",0.4);
        }
    }else if(blanydwfc_playMethod == 2 || blanydwfc_playMethod == 8 || blanydwfc_playMethod == 11 || blanydwfc_playMethod == 13 || blanydwfc_playMethod == 39
        || blanydwfc_playMethod == 28 || blanydwfc_playMethod == 17 || blanydwfc_playMethod == 18 || blanydwfc_playMethod == 24 || blanydwfc_playMethod == 41
        || blanydwfc_playMethod == 25 || blanydwfc_playMethod == 29 || blanydwfc_playMethod == 42 || blanydwfc_playMethod == 43 || blanydwfc_playMethod == 30
        || blanydwfc_playMethod == 35 || blanydwfc_playMethod == 36 || blanydwfc_playMethod == 31 || blanydwfc_playMethod == 32 || blanydwfc_playMethod == 19
        || blanydwfc_playMethod == 40 || blanydwfc_playMethod == 46 || blanydwfc_playMethod == 20 || blanydwfc_playMethod == 21 || blanydwfc_playMethod == 50
        || blanydwfc_playMethod == 47 || blanydwfc_playMethod == 51 || blanydwfc_playMethod == 52 || blanydwfc_playMethod == 53 || blanydwfc_playMethod == 57 || blanydwfc_playMethod == 63
        || blanydwfc_playMethod == 58 || blanydwfc_playMethod == 59 || blanydwfc_playMethod == 60 || blanydwfc_playMethod == 65 || blanydwfc_playMethod == 80 || blanydwfc_playMethod == 81 || blanydwfc_playType == 8
        || blanydwfc_playMethod == 83 || blanydwfc_playMethod == 86 || blanydwfc_playMethod == 87 || blanydwfc_playMethod == 22 || blanydwfc_playMethod == 33 || blanydwfc_playMethod == 44
        || blanydwfc_playMethod == 89 || blanydwfc_playMethod == 92 || blanydwfc_playMethod == 95 || blanydwfc_playMethod == 54 || blanydwfc_playMethod == 61
        || blanydwfc_playMethod == 97 || blanydwfc_playType == 13  || blanydwfc_playType == 14){
        if(LotteryStorage["blanydwfc"]["line1"].length > 0){
            $("#blanydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#blanydwfc_qingkong").css("opacity",0.4);
        }
    }else{
        $("#blanydwfc_qingkong").css("opacity",0);
    }

    if($("#blanydwfc_qingkong").css("opacity") == "0"){
        $("#blanydwfc_qingkong").css("display","none");
    }else{
        $("#blanydwfc_qingkong").css("display","block");
    }

    if($('#blanydwfc_zhushu').html() > 0){
        $("#blanydwfc_queding").css("opacity",1.0);
    }else{
        $("#blanydwfc_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  blanydwfc_qingkongAll(){
    $("#blanydwfc_ballView span").removeClass('redBalls_active');
    LotteryStorage["blanydwfc"]["line1"] = [];
    LotteryStorage["blanydwfc"]["line2"] = [];
    LotteryStorage["blanydwfc"]["line3"] = [];
    LotteryStorage["blanydwfc"]["line4"] = [];
    LotteryStorage["blanydwfc"]["line5"] = [];

    localStorageUtils.removeParam("blanydwfc_line1");
    localStorageUtils.removeParam("blanydwfc_line2");
    localStorageUtils.removeParam("blanydwfc_line3");
    localStorageUtils.removeParam("blanydwfc_line4");
    localStorageUtils.removeParam("blanydwfc_line5");

    $('#blanydwfc_zhushu').text(0);
    $('#blanydwfc_money').text(0);
    clearAwardWin("blanydwfc");
    blanydwfc_initFooterButton();
}

/**
 * [blanydwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function blanydwfc_calcNotes(){
	$('#blanydwfc_modeId').blur();
	$('#blanydwfc_fandian').blur();
	
    var notes = 0;

    if(blanydwfc_playMethod == 0){
        notes = LotteryStorage["blanydwfc"]["line1"].length *
            LotteryStorage["blanydwfc"]["line2"].length *
            LotteryStorage["blanydwfc"]["line3"].length *
            LotteryStorage["blanydwfc"]["line4"].length *
            LotteryStorage["blanydwfc"]["line5"].length;
    }else if(blanydwfc_playMethod == 2){
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,5);
    }else if(blanydwfc_playMethod == 3){
        if (LotteryStorage["blanydwfc"]["line1"].length >= 1 && LotteryStorage["blanydwfc"]["line2"].length >= 3) {
            notes = getArraySelect(3,LotteryStorage["blanydwfc"]["line1"],LotteryStorage["blanydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(blanydwfc_playMethod == 4){
        if (LotteryStorage["blanydwfc"]["line1"].length >= 2 && LotteryStorage["blanydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(2,LotteryStorage["blanydwfc"]["line2"],LotteryStorage["blanydwfc"]["line1"]);
        }else{
            notes = 0;
        }
    }else if(blanydwfc_playMethod == 5 || blanydwfc_playMethod == 12){
        if (LotteryStorage["blanydwfc"]["line1"].length >= 1 && LotteryStorage["blanydwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["blanydwfc"]["line1"],LotteryStorage["blanydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(blanydwfc_playMethod == 6 || blanydwfc_playMethod == 7 || blanydwfc_playMethod == 14){
        if (LotteryStorage["blanydwfc"]["line1"].length >= 1 && LotteryStorage["blanydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["blanydwfc"]["line1"],LotteryStorage["blanydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(blanydwfc_playMethod == 9){
        notes = LotteryStorage["blanydwfc"]["line1"].length *
            LotteryStorage["blanydwfc"]["line2"].length *
            LotteryStorage["blanydwfc"]["line3"].length *
            LotteryStorage["blanydwfc"]["line4"].length;
    }else if(blanydwfc_playMethod == 18 || blanydwfc_playMethod == 29 || blanydwfc_playMethod == 40){
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["blanydwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
            }
        }
    }else if(blanydwfc_playMethod == 22 || blanydwfc_playMethod == 33 || blanydwfc_playMethod == 44 ){
        notes = 54;
    }else if(blanydwfc_playMethod == 54 || blanydwfc_playMethod == 61){
        notes = 9;
    }else if(blanydwfc_playMethod == 51 || blanydwfc_playMethod == 58){
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["blanydwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 2;
            }
        }
    }else if(blanydwfc_playMethod == 11){
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,4);
    }else if(blanydwfc_playMethod == 13|| blanydwfc_playMethod == 64 || blanydwfc_playMethod == 66 || blanydwfc_playMethod == 68 || blanydwfc_playMethod == 70 || blanydwfc_playMethod == 72){
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,2);
    }else if(blanydwfc_playMethod == 37 || blanydwfc_playMethod == 26 || blanydwfc_playMethod == 15 || blanydwfc_playMethod == 75 || blanydwfc_playMethod == 77){
        notes = LotteryStorage["blanydwfc"]["line1"].length *
            LotteryStorage["blanydwfc"]["line2"].length *
            LotteryStorage["blanydwfc"]["line3"].length ;
    }else if(blanydwfc_playMethod == 39 || blanydwfc_playMethod == 28 || blanydwfc_playMethod == 17){
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["blanydwfc"]["line1"][i]);
        };
    }else if(blanydwfc_playMethod == 41 || blanydwfc_playMethod == 30 || blanydwfc_playMethod == 19){
        notes = mathUtil.getACombination(LotteryStorage["blanydwfc"]["line1"].length,2);
    }else if(blanydwfc_playMethod == 42 || blanydwfc_playMethod == 31 || blanydwfc_playMethod == 20 || blanydwfc_playMethod == 68 || blanydwfc_playMethod == 73){
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,3);
    }else if(blanydwfc_playMethod == 43 || blanydwfc_playMethod == 32 || blanydwfc_playMethod == 21){
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["blanydwfc"]["line1"][i]);
        };
    }else if(blanydwfc_playMethod == 48 || blanydwfc_playMethod == 55 || blanydwfc_playMethod == 74 || blanydwfc_playMethod == 76){
        notes = LotteryStorage["blanydwfc"]["line1"].length *
            LotteryStorage["blanydwfc"]["line2"].length ;
    }else if(blanydwfc_playMethod == 50 || blanydwfc_playMethod == 57){
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["blanydwfc"]["line1"][i]);
        };
    }else if(blanydwfc_playMethod == 52 || blanydwfc_playMethod == 59){
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,2);
    }else if(blanydwfc_playMethod == 53 || blanydwfc_playMethod == 60){
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["blanydwfc"]["line1"][i]);
        };
    }else if(blanydwfc_playMethod == 62){
        notes = LotteryStorage["blanydwfc"]["line1"].length +
            LotteryStorage["blanydwfc"]["line2"].length +
            LotteryStorage["blanydwfc"]["line3"].length +
            LotteryStorage["blanydwfc"]["line4"].length +
            LotteryStorage["blanydwfc"]["line5"].length;
    }else if(blanydwfc_playType == 13 || blanydwfc_playType == 14 || blanydwfc_playMethod == 8 || blanydwfc_playMethod == 71
        || blanydwfc_playMethod == 24 || blanydwfc_playMethod == 25 || blanydwfc_playMethod == 35 || blanydwfc_playMethod == 36 || blanydwfc_playMethod == 46
        || blanydwfc_playMethod == 47 || blanydwfc_playMethod == 63 || blanydwfc_playMethod == 65 || blanydwfc_playMethod == 67 || blanydwfc_playMethod == 69 ){
        notes = LotteryStorage["blanydwfc"]["line1"].length ;
    }else if(blanydwfc_playMethod == 78){
        notes = LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line2"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line3"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line4"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line3"].length +
            LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line4"].length +
            LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line4"].length +
            LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line4"].length * LotteryStorage["blanydwfc"]["line5"].length;
    }else if (blanydwfc_playMethod == 80) {
        if ($("#blanydwfc_tab .button.red").size() < 2) {
            notes = 0;
        }else{
            for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
                notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["blanydwfc"]["line1"][i]);
            };
            notes *= mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,2);
        }
    }else if (blanydwfc_playMethod == 81) {
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,2);
    }else if (blanydwfc_playMethod == 83) {
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["blanydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,2);
    }else if (blanydwfc_playMethod == 84) {
        notes = LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line3"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line4"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line4"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line4"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line4"].length +
            LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line4"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line4"].length * LotteryStorage["blanydwfc"]["line5"].length ;
    }else if (blanydwfc_playMethod == 86) {
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["blanydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,3);
    }else if (blanydwfc_playMethod == 87) {
        notes = mathUtil.getACombination(LotteryStorage["blanydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,3);
    }else if (blanydwfc_playMethod == 89) {
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,3) * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,3);
    }else if (blanydwfc_playMethod == 92) {
        for (var i = 0; i < LotteryStorage["blanydwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["blanydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,3);
    }else if (blanydwfc_playMethod == 93) {
        notes = LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line4"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line4"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line1"].length * LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line4"].length * LotteryStorage["blanydwfc"]["line5"].length +
            LotteryStorage["blanydwfc"]["line2"].length * LotteryStorage["blanydwfc"]["line3"].length * LotteryStorage["blanydwfc"]["line4"].length * LotteryStorage["blanydwfc"]["line5"].length;
    }else if (blanydwfc_playMethod == 95) {
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,4)
            * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,4);
    }else if (blanydwfc_playMethod == 96) {
        if (LotteryStorage["blanydwfc"]["line1"].length >= 1 && LotteryStorage["blanydwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["blanydwfc"]["line1"],LotteryStorage["blanydwfc"]["line2"])
                * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else if (blanydwfc_playMethod == 97) {
        notes = mathUtil.getCCombination(LotteryStorage["blanydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,4);
    }else if (blanydwfc_playMethod == 98) {
        if (LotteryStorage["blanydwfc"]["line1"].length >= 1 && LotteryStorage["blanydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["blanydwfc"]["line1"],LotteryStorage["blanydwfc"]["line2"]) * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else{
        notes = blanydwfcValidData($("#blanydwfc_single").val());
    }

    if(blanydwfc_sntuo == 3 || blanydwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","blanydwfc"),LotteryInfo.getMethodId("ssc",blanydwfc_playMethod))){
    }else{
        if(parseInt($('#blanydwfc_modeId').val()) == 8){
            $("#blanydwfc_random").hide();
        }else{
            $("#blanydwfc_random").show();
        }
    }

    //验证是否为空
    if( $("#blanydwfc_beiNum").val() =="" || parseInt($("#blanydwfc_beiNum").val()) == 0){
        $("#blanydwfc_beiNum").val(1);
    }

    //验证慢彩最大倍数
    if($("#blanydwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#blanydwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#blanydwfc_zhushu').text(notes);
        if($("#blanydwfc_modeId").val() == "8"){
            $('#blanydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blanydwfc_beiNum").val()),0.002));
        }else if ($("#blanydwfc_modeId").val() == "2"){
            $('#blanydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blanydwfc_beiNum").val()),0.2));
        }else if ($("#blanydwfc_modeId").val() == "1"){
            $('#blanydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blanydwfc_beiNum").val()),0.02));
        }else{
            $('#blanydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blanydwfc_beiNum").val()),2));
        }
    } else {
        $('#blanydwfc_zhushu').text(0);
        $('#blanydwfc_money').text(0);
    }
    blanydwfc_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('blanydwfc',blanydwfc_playMethod);
}

/**
 * [blanydwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function blanydwfc_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#blanydwfc_queding").bind('click', function(event) {
        blanydwfc_rebate = $("#blanydwfc_fandian option:last").val();
        if(parseInt($('#blanydwfc_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        blanydwfc_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

       /* if(parseInt($('#blanydwfc_modeId').val()) == 8){
            if (Number($('#blanydwfc_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('blanydwfc',blanydwfc_playMethod);

        submitParams.lotteryType = "blanydwfc";
        var play = LotteryInfo.getPlayName("ssc",blanydwfc_playType);
        var playMethod = LotteryInfo.getMethodName("ssc",blanydwfc_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = blanydwfc_playType;
        submitParams.playMethodIndex = blanydwfc_playMethod;
        var selectedBalls = [];
        if(blanydwfc_playMethod == 0 || blanydwfc_playMethod == 3 || blanydwfc_playMethod == 4
            || blanydwfc_playMethod == 5 || blanydwfc_playMethod == 6 || blanydwfc_playMethod == 7
            || blanydwfc_playMethod == 9 || blanydwfc_playMethod == 12 || blanydwfc_playMethod == 14
            || blanydwfc_playMethod == 37 || blanydwfc_playMethod == 26 || blanydwfc_playMethod == 15
            || blanydwfc_playMethod == 48 || blanydwfc_playMethod == 55 || blanydwfc_playMethod == 74 || blanydwfc_playType == 9){
            $("#blanydwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(blanydwfc_playMethod == 2 || blanydwfc_playMethod == 8 || blanydwfc_playMethod == 11 || blanydwfc_playMethod == 13 || blanydwfc_playMethod == 24
            || blanydwfc_playMethod == 39 || blanydwfc_playMethod == 28 || blanydwfc_playMethod == 17 || blanydwfc_playMethod == 18 || blanydwfc_playMethod == 25
            || blanydwfc_playMethod == 22 || blanydwfc_playMethod == 33 || blanydwfc_playMethod == 44 || blanydwfc_playMethod == 54 || blanydwfc_playMethod == 61
            || blanydwfc_playMethod == 41 || blanydwfc_playMethod == 42 || blanydwfc_playMethod == 43 || blanydwfc_playMethod == 29 || blanydwfc_playMethod == 35
            || blanydwfc_playMethod == 30 || blanydwfc_playMethod == 31 || blanydwfc_playMethod == 32 || blanydwfc_playMethod == 40 || blanydwfc_playMethod == 36
            || blanydwfc_playMethod == 19 || blanydwfc_playMethod == 20 || blanydwfc_playMethod == 21 || blanydwfc_playMethod == 46 || blanydwfc_playMethod == 47
            || blanydwfc_playMethod == 50 || blanydwfc_playMethod == 57 || blanydwfc_playType == 8 || blanydwfc_playMethod == 51 || blanydwfc_playMethod == 58
            || blanydwfc_playMethod == 52 || blanydwfc_playMethod == 53|| blanydwfc_playMethod == 59 || blanydwfc_playMethod == 60 || blanydwfc_playType == 13 || blanydwfc_playType == 14){
            $("#blanydwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(blanydwfc_playType == 7 || blanydwfc_playMethod == 78 || blanydwfc_playMethod == 84 || blanydwfc_playMethod == 93){
            $("#blanydwfc_ballView div.ballView").each(function(){
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
        }else if(blanydwfc_playMethod == 80 || blanydwfc_playMethod == 81 || blanydwfc_playMethod == 83
            || blanydwfc_playMethod == 86 || blanydwfc_playMethod == 87 || blanydwfc_playMethod == 89
            || blanydwfc_playMethod == 92 || blanydwfc_playMethod == 95 || blanydwfc_playMethod == 97){
            $("#blanydwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            var temp = selectedBalls.join(",") + "#";

            if ($("#blanydwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#blanydwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#blanydwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#blanydwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#blanydwfc_tab5").hasClass("button red")) {
                temp += "个";
            };

            submitParams.nums = temp;
        }else if (blanydwfc_playMethod == 96 || blanydwfc_playMethod == 98) {
            $("#blanydwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            var temp = selectedBalls.join("|") + "#";
            if ($("#blanydwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#blanydwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#blanydwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#blanydwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#blanydwfc_tab5").hasClass("button red")) {
                temp += "个";
            };
            submitParams.nums = temp;
        }else{
        	//去错误号
	   		blanydwfcValidateData("submit");
            var array = handleSingleStr($("#blanydwfc_single").val());
            if(blanydwfc_playMethod == 1 ){
                submitParams.nums = array.join(" ");
            }else if(blanydwfc_playMethod == 10 || blanydwfc_playMethod == 38 || blanydwfc_playMethod == 27
                || blanydwfc_playMethod == 16 || blanydwfc_playMethod == 49 || blanydwfc_playMethod == 56){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join("|");
                    }else{
                        temp = temp + array[i].split("").join("|") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(blanydwfc_playMethod == 45 || blanydwfc_playMethod == 34 || blanydwfc_playMethod == 23){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(blanydwfc_playMethod == 79 || blanydwfc_playMethod == 82 || blanydwfc_playMethod == 85 || blanydwfc_playMethod == 88 ||
                blanydwfc_playMethod == 89 || blanydwfc_playMethod == 90 || blanydwfc_playMethod == 91 || blanydwfc_playMethod == 94){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                temp +="#";
                if ($("#blanydwfc_tab1").hasClass("button red")) {
                    temp += "万";
                };
                if ($("#blanydwfc_tab2").hasClass("button red")) {
                    temp += "千";
                };
                if ($("#blanydwfc_tab3").hasClass("button red")) {
                    temp += "百";
                };
                if ($("#blanydwfc_tab4").hasClass("button red")) {
                    temp += "十";
                };
                if ($("#blanydwfc_tab5").hasClass("button red")) {
                    temp += "个";
                };

                submitParams.nums = temp;
            }
        }
        localStorageUtils.setParam("playMode",$("#blanydwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#blanydwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#blanydwfc_fandian").val());
        submitParams.notes = $('#blanydwfc_zhushu').html();
        submitParams.sntuo = blanydwfc_sntuo;
        submitParams.multiple = $('#blanydwfc_beiNum').val();  //requirement
        submitParams.rebates = $('#blanydwfc_fandian').val();  //requirement
        submitParams.playMode = $('#blanydwfc_modeId').val();  //requirement
        submitParams.money = $('#blanydwfc_money').html();  //requirement
        submitParams.award = $('#blanydwfc_minAward').html();  //奖金
        submitParams.maxAward = $('#blanydwfc_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#blanydwfc_ballView").empty();
        blanydwfc_qingkongAll();
    });
}

/**
 * [blanydwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function blanydwfc_randomOne(){
    blanydwfc_qingkongAll();
    if(blanydwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        LotteryStorage["blanydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["blanydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["blanydwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["blanydwfc"]["line4"].push(redBallArray[3]+"");
        LotteryStorage["blanydwfc"]["line5"].push(redBallArray[4]+"");

        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line2"], function(k, v){
            $("#" + "blanydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line3"], function(k, v){
            $("#" + "blanydwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line4"], function(k, v){
            $("#" + "blanydwfc_line4" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line5"], function(k, v){
            $("#" + "blanydwfc_line5" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["blanydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        LotteryStorage["blanydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["blanydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["blanydwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["blanydwfc"]["line4"].push(redBallArray[3]+"");

        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line2"], function(k, v){
            $("#" + "blanydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line3"], function(k, v){
            $("#" + "blanydwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line4"], function(k, v){
            $("#" + "blanydwfc_line4" + v).toggleClass("redBalls_active");
        });

    }else if(blanydwfc_playMethod == 37 || blanydwfc_playMethod == 26 || blanydwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        LotteryStorage["blanydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["blanydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["blanydwfc"]["line3"].push(redBallArray[2]+"");

        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line2"], function(k, v){
            $("#" + "blanydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line3"], function(k, v){
            $("#" + "blanydwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 41 || blanydwfc_playMethod == 30 || blanydwfc_playMethod == 19 || blanydwfc_playMethod == 68
        || blanydwfc_playMethod == 52 || blanydwfc_playMethod == 64 || blanydwfc_playMethod == 66
        || blanydwfc_playMethod == 59 || blanydwfc_playMethod == 70 || blanydwfc_playMethod == 72){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["blanydwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 42 || blanydwfc_playMethod == 31 || blanydwfc_playMethod == 20 || blanydwfc_playMethod == 73){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["blanydwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 39 || blanydwfc_playMethod == 28 || blanydwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        LotteryStorage["blanydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 43 || blanydwfc_playMethod == 32 || blanydwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        LotteryStorage["blanydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 48 || blanydwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        LotteryStorage["blanydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["blanydwfc"]["line2"].push(redBallArray[1]+"");

        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line2"], function(k, v){
            $("#" + "blanydwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 25 || blanydwfc_playMethod == 36 || blanydwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["blanydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 50 || blanydwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        LotteryStorage["blanydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 53 || blanydwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        LotteryStorage["blanydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["blanydwfc"]["line"+line].push(number+"");
        $.each(LotteryStorage["blanydwfc"]["line"+line], function(k, v){
            $("#" + "blanydwfc_line" + line + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 63 || blanydwfc_playMethod == 67 || blanydwfc_playMethod == 69 || blanydwfc_playMethod == 71 || blanydwfc_playType == 13
        || blanydwfc_playMethod == 65 || blanydwfc_playMethod == 18 || blanydwfc_playMethod == 29 || blanydwfc_playMethod == 40 || blanydwfc_playMethod == 22
        || blanydwfc_playMethod == 33 || blanydwfc_playMethod == 44 || blanydwfc_playMethod == 54 || blanydwfc_playMethod == 61
        || blanydwfc_playMethod == 24 || blanydwfc_playMethod == 35 || blanydwfc_playMethod == 46 || blanydwfc_playMethod == 51 || blanydwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["blanydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 74 || blanydwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        LotteryStorage["blanydwfc"]["line1"].push(array[0]+"");
        LotteryStorage["blanydwfc"]["line2"].push(array[1]+"");
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line2"], function(k, v){
            $("#" + "blanydwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 75 || blanydwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        LotteryStorage["blanydwfc"]["line1"].push(array[0]+"");
        LotteryStorage["blanydwfc"]["line2"].push(array[1]+"");
        LotteryStorage["blanydwfc"]["line3"].push(array[2]+"");
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line2"], function(k, v){
            $("#" + "blanydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line3"], function(k, v){
            $("#" + "blanydwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);
        LotteryStorage["blanydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["blanydwfc"]["line"+lines[1]].push(array[1]+"");
        $.each(LotteryStorage["blanydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "blanydwfc_line" + lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "blanydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        LotteryStorage["blanydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["blanydwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["blanydwfc"]["line"+lines[2]].push(array[2]+"");

        $.each(LotteryStorage["blanydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "blanydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "blanydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "blanydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        LotteryStorage["blanydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["blanydwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["blanydwfc"]["line"+lines[2]].push(array[2]+"");
        LotteryStorage["blanydwfc"]["line"+lines[3]].push(array[3]+"");

        $.each(LotteryStorage["blanydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "blanydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "blanydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line"+lines[2]], function(k, v){
            $("#" + "blanydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["blanydwfc"]["line"+lines[3]], function(k, v){
            $("#" + "blanydwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
        });
    }else if(blanydwfc_playType == 14){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["blanydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["blanydwfc"]["line1"], function(k, v){
            $("#" + "blanydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }
    blanydwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function blanydwfc_checkOutRandom(playMethod){
    var obj = new Object();
    if(blanydwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 18 || blanydwfc_playMethod == 29 || blanydwfc_playMethod == 40){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
        }
    }else if(blanydwfc_playMethod == 22 || blanydwfc_playMethod == 33 || blanydwfc_playMethod == 44){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 54;
    }else if(blanydwfc_playMethod == 54 || blanydwfc_playMethod == 61){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 9;
    }
    else if(blanydwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 37 || blanydwfc_playMethod == 26 || blanydwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 39 || blanydwfc_playMethod == 28 || blanydwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        obj.nums = number;
        obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
    }else if(blanydwfc_playMethod == 41 || blanydwfc_playMethod == 30 || blanydwfc_playMethod == 19){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(blanydwfc_playMethod == 52 || blanydwfc_playMethod == 59 || blanydwfc_playMethod == 64 || blanydwfc_playMethod == 66 || blanydwfc_playMethod == 68
        ||blanydwfc_playMethod == 70 || blanydwfc_playMethod == 72){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 42 || blanydwfc_playMethod == 31 || blanydwfc_playMethod == 20 || blanydwfc_playMethod == 73){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 43 || blanydwfc_playMethod == 32 || blanydwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        obj.nums = number;
        obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
    }else if(blanydwfc_playMethod == 48 || blanydwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 50 || blanydwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
    }else if(blanydwfc_playMethod == 53 || blanydwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
    }else if(blanydwfc_playMethod == 62){
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
    }else if(blanydwfc_playMethod == 63 || blanydwfc_playMethod == 65 || blanydwfc_playMethod == 67 || blanydwfc_playMethod == 69 || blanydwfc_playMethod == 71
        || blanydwfc_playMethod == 24 || blanydwfc_playMethod == 35 || blanydwfc_playMethod == 46){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 25 || blanydwfc_playMethod == 36 || blanydwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        var array = ["豹子","顺子","对子","半顺","杂六"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(blanydwfc_playMethod == 51 || blanydwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
        }
    }else if(blanydwfc_playMethod == 74 || blanydwfc_playMethod == 76){
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
    }else if(blanydwfc_playMethod == 75 || blanydwfc_playMethod == 77){
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
    }else if(blanydwfc_playMethod == 78){
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
    }else if(blanydwfc_playMethod == 84){
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
    }else if(blanydwfc_playMethod == 93){
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
    obj.sntuo = blanydwfc_sntuo;
    obj.multiple = 1;
    obj.rebates = blanydwfc_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('blanydwfc',blanydwfc_playMethod,obj);  //机选奖金计算
    obj.award = $('#blanydwfc_minAward').html();     //奖金
    obj.maxAward = $('#blanydwfc_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [blanydwfcValidateData 单式数据验证]
 */
function blanydwfcValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#blanydwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
    blanydwfcValidData(textStr,type);
}

function blanydwfcValidData(str,type){
    if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
        array,
        result,
        content = {};
    if(blanydwfc_playMethod == 1){
        content.str = str;
        content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 10){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 38 || blanydwfc_playMethod == 27 || blanydwfc_playMethod == 16){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 45 || blanydwfc_playMethod == 34 || blanydwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 49 || blanydwfc_playMethod == 56){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 79){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,2);
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 82){
        content.str = str;
        content.weishu = 2;
        content.duizi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,2);
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 85){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,3);
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 88){
        content.str = str;
        content.weishu = 3;
        content.zusan = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,3);
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 90){
        content.str = str;
        content.weishu = 3;
        content.zuliu = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,3);
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 91){
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,3);
        blanydwfcShowFooter(true,notes);
    }else if(blanydwfc_playMethod == 94){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#blanydwfc_tab .button.red").size() ,4);
        blanydwfcShowFooter(true,notes);
    }

    $('#blanydwfc_delRepeat').off('click');
    $('#blanydwfc_delRepeat').on('click',function () {
        content.str = $('#blanydwfc_single').val() ? $('#blanydwfc_single').val() : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        array = rptResult.num || [];
        notes = rptResult.length;
        blanydwfcShowFooter(true,notes);
        $("#blanydwfc_single").val(array.join(" "));
    });

    $("#blanydwfc_single").val(array.join(" "));
    return notes;
}

function blanydwfcShowFooter(isValid,notes){
    $('#blanydwfc_zhushu').text(notes);
    if($("#blanydwfc_modeId").val() == "8"){
        $('#blanydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blanydwfc_beiNum").val()),0.002));
    }else if ($("#blanydwfc_modeId").val() == "2"){
        $('#blanydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blanydwfc_beiNum").val()),0.2));
    }else if ($("#blanydwfc_modeId").val() == "1"){
        $('#blanydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blanydwfc_beiNum").val()),0.02));
    }else{
        $('#blanydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#blanydwfc_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    blanydwfc_initFooterButton();
    calcAwardWin('blanydwfc',blanydwfc_playMethod);  //计算奖金和盈利
}