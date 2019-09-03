var twwfc_playType = 2;
var twwfc_playMethod = 15;
var twwfc_sntuo = 0;
var twwfc_rebate;
var twwfcScroll;

//进入这个页面时调用
function twwfcPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("twwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("twwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function twwfcPageUnloadedPanel(){
    $("#twwfc_queding").off('click');
    $("#twwfcPage_back").off('click');
    $("#twwfc_ballView").empty();
    $("#twwfcSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="twwfcPlaySelect"></select>');
    $("#twwfcSelect").append($select);
}

//入口函数
function twwfc_init(){
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
    $("#twwfc_title").html(LotteryInfo.getLotteryNameByTag("twwfc"));
    for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
       	if(i == 15){//去掉骰宝龙虎 
			continue;
		}
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
           
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
                var name = LotteryInfo.getMethodName("ssc",j);
                if(i == twwfc_playType && j == twwfc_playMethod){
                    $play.append('<option value="twwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="twwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(twwfc_playMethod,onShowArray)>-1 ){
						twwfc_playType = i;
						twwfc_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#twwfcPlaySelect").append($play);
		}
    }
    
    if($("#twwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("twwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:twwfcChangeItem
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

    GetLotteryInfo("twwfc",function (){
        twwfcChangeItem("twwfc"+twwfc_playMethod);
    });

    //添加滑动条
    if(!twwfcScroll){
        twwfcScroll = new IScroll('#twwfcContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("twwfc",LotteryInfo.getLotteryIdByTag("twwfc"));

    //获取上一期开奖
    queryLastPrize("twwfc");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('twwfc');

    //机选选号
    $("#twwfc_random").on('click', function(event) {
        twwfc_randomOne();
    });

    //返回
    $("#twwfcPage_back").on('click', function(event) {
        // twwfc_playType = 2;
        // twwfc_playMethod = 15;
        $("#twwfc_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        twwfc_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#twwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",twwfc_playMethod));
	//玩法说明
	$("#twwfc_paly_shuoming").off('click');
	$("#twwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#twwfc_shuoming").text());
	});

    qingKong("twwfc");//清空
    twwfc_submitData();
}

function twwfcResetPlayType(){
    twwfc_playType = 2;
    twwfc_playMethod = 15;
}

function twwfcChangeItem(val) {
    twwfc_qingkongAll();
    var temp = val.substring("twwfc".length,val.length);
    if(val == "twwfc0"){
        //直选复式
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 0;
        twwfc_playMethod = 0;
        createFiveLineLayout("twwfc", function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc1"){
        //直选单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 0;
        twwfc_playMethod = 1;
        $("#twwfc_ballView").empty();
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc2"){
        //组选120
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 0;
        twwfc_playMethod = 2;
        createOneLineLayout("twwfc","至少选择5个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc3"){
        //组选60
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 0;
        twwfc_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc4"){
        //组选30
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 0;
        twwfc_playMethod = 4;
        var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc5"){
        //组选20
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 0;
        twwfc_playMethod = 5;
        var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc6"){
        //组选10
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 0;
        twwfc_playMethod = 6;
        var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc7"){
        //组选5
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 0;
        twwfc_playMethod = 7
        var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc8"){
        //总和大小单双
        $("#twwfc_random").show();
        var num = ["大","小","单","双"];
        twwfc_sntuo = 0;
        twwfc_playType = 0;
        twwfc_playMethod = 8;
        createNonNumLayout("twwfc",twwfc_playMethod,num,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc9"){
        //直选复式
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 1;
        twwfc_playMethod = 9;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createFourLineLayout("twwfc",tips, function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc10"){
        //直选单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 1;
        twwfc_playMethod = 10;
        $("#twwfc_ballView").empty();
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc11"){
        //组选24
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 1;
        twwfc_playMethod = 11;
        createOneLineLayout("twwfc","至少选择4个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc12"){
        //组选12
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 1;
        twwfc_playMethod = 12;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc13"){
        //组选6
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 1;
        twwfc_playMethod = 13;
        createOneLineLayout("twwfc","二重号:至少选择2个号码",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc14"){
        //组选4
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 1;
        twwfc_playMethod = 14;
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc15"){
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 15;
        var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createThreeLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc16"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 2;
        twwfc_playMethod = 16;
        $("#twwfc_ballView").empty();
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc17"){
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 17;
        createSumLayout("twwfc",0,27,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc18"){
        //直选跨度
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 18;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc19"){
        //后三组三
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 19;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc20"){
        //后三组六
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 20;
        createOneLineLayout("twwfc","至少选择3个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc21"){
        //后三和值
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 21;
        createSumLayout("twwfc",1,26,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc22"){
        //后三组选包胆
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 22;
        twwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("twwfc",array,["请选择一个号码"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc23"){
        //后三混合组选
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 2;
        twwfc_playMethod = 23;
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc24"){
        //和值尾数
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 24;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc25"){
        //特殊号
        $("#twwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        twwfc_sntuo = 0;
        twwfc_playType = 2;
        twwfc_playMethod = 25;
        createNonNumLayout("twwfc",twwfc_playMethod,num,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc26"){
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 26;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
        createThreeLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc27"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 3;
        twwfc_playMethod = 27;
        $("#twwfc_ballView").empty();
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc28"){
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 28;
        createSumLayout("twwfc",0,27,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc29"){
        //直选跨度
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 29;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc30"){
        //中三组三
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 30;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc31"){
        //中三组六
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 31;
        createOneLineLayout("twwfc","至少选择3个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc32"){
        //中三和值
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 32;
        createSumLayout("twwfc",1,26,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc33"){
        //中三组选包胆
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 33;
        twwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("twwfc",array,["请选择一个号码"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc34"){
        //中三混合组选
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 3;
        twwfc_playMethod = 34;
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc35"){
        //和值尾数
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 35;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc36"){
        //特殊号
        $("#twwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        twwfc_sntuo = 0;
        twwfc_playType = 3;
        twwfc_playMethod = 36;
        createNonNumLayout("twwfc",twwfc_playMethod,num,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc37"){
        //直选复式
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 37;
        var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
        createThreeLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc38"){
        //直选单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 4;
        twwfc_playMethod = 38;
        $("#twwfc_ballView").empty();
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc39"){
        //和值
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 39;
        createSumLayout("twwfc",0,27,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc40"){
        //直选跨度
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 40;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc41"){
        //前三组三
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 41;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc42"){
        //前三组六
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 42;
        createOneLineLayout("twwfc","至少选择3个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc43"){
        //前三和值
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 43;
        createSumLayout("twwfc",1,26,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc44"){
        //前三组选包胆
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 44;
        twwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("twwfc",array,["请选择一个号码"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc45"){
        //前三混合组选
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 4;
        twwfc_playMethod = 45;
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc46"){
        //和值尾数
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 46;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc47"){
        //特殊号
        $("#twwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        twwfc_sntuo = 0;
        twwfc_playType = 4;
        twwfc_playMethod = 47;
        createNonNumLayout("twwfc",twwfc_playMethod,num,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc48"){
        //后二复式
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 5;
        twwfc_playMethod = 48;
        var tips = ["十位：可选1-10个","个位：可选1-10个"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc49"){
        //后二单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 5;
        twwfc_playMethod = 49;
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc50"){
        //后二和值
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 5;
        twwfc_playMethod = 50;
        createSumLayout("twwfc",0,18,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc51"){
        //直选跨度
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 5;
        twwfc_playMethod = 51;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc52"){
        //后二组选
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 5;
        twwfc_playMethod = 52;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc53"){
        //后二和值
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 5;
        twwfc_playMethod = 53;
        createSumLayout("twwfc",1,17,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc54"){
        //后二组选包胆
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 5;
        twwfc_playMethod = 54;
        twwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("twwfc",array,["请选择一个号码"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc55"){
        //前二复式
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 6;
        twwfc_playMethod = 55;
        var tips = ["万位：可选1-10个","千位：可选1-10个"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc56"){
        //前二单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 6;
        twwfc_playMethod = 56;
        twwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
    }else if(val == "twwfc57"){
        //前二和值
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 6;
        twwfc_playMethod = 57;
        createSumLayout("twwfc",0,18,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc58"){
        //直选跨度
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 6;
        twwfc_playMethod = 58;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc59"){
        //前二组选
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 6;
        twwfc_playMethod = 59;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc60"){
        //前二和值
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 6;
        twwfc_playMethod = 60;
        createSumLayout("twwfc",1,17,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc61"){
        //前二组选包胆
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 6;
        twwfc_playMethod = 61;
        twwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("twwfc",array,["请选择一个号码"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc62"){
        //定位复式
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 7;
        twwfc_playMethod = 62;
        createFiveLineLayout("twwfc", function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc63"){
        //后三一码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 63;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc64"){
        //后三二码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 64;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc65"){
        //前三一码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 65;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc66"){
        //前三二码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 66;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc67"){
        //后四一码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 67;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc68"){
        //后四二码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 68;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc69"){
        //前四一码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 69;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc70"){
        //前四二码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 70;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc71"){
        //五星一码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 71;
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc72"){
        //五星二码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 72;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc73"){
        //五星三码
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 8;
        twwfc_playMethod = 73;
        createOneLineLayout("twwfc","至少选择3个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc74"){
        //后二大小单双
        twwfc_qingkongAll();
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 9;
        twwfc_playMethod = 74;
        createTextBallTwoLayout("twwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc75"){
        //后三大小单双
        twwfc_qingkongAll();
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 9;
        twwfc_playMethod = 75;
        createTextBallThreeLayout("twwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc76"){
        //前二大小单双
        twwfc_qingkongAll();
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 9;
        twwfc_playMethod = 76;
        createTextBallTwoLayout("twwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc77"){
        //前三大小单双
        twwfc_qingkongAll();
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 9;
        twwfc_playMethod = 77;
        createTextBallThreeLayout("twwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc78"){
        //直选复式
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 10;
        twwfc_playMethod = 78;
        createFiveLineLayout("twwfc",function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc79"){
        //直选单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 10;
        twwfc_playMethod = 79;
        var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
        createRenXuanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc80"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 10;
        twwfc_playMethod = 80;
        createSumLayout("twwfc",0,18,function(){
            twwfc_calcNotes();
        });
        createRenXuanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc81"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 10;
        twwfc_playMethod = 81;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        createRenXuanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc82"){
        //组选单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 10;
        twwfc_playMethod = 82;
        var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
        createRenXuanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc83"){
        //组选和值
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 10;
        twwfc_playMethod = 83;
        createSumLayout("twwfc",1,17,function(){
            twwfc_calcNotes();
        });
        createRenXuanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc84"){
        //直选复式
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 11;
        twwfc_playMethod = 84;
        createFiveLineLayout("twwfc", function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc85"){
        //直选单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 11;
        twwfc_playMethod = 85;
        var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
        createRenXuanSanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc86"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 11;
        twwfc_playMethod = 86;
        createSumLayout("twwfc",0,27,function(){
            twwfc_calcNotes();
        });
        createRenXuanSanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc87"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 11;
        twwfc_playMethod = 87;
        createOneLineLayout("twwfc","至少选择2个",0,9,false,function(){
            twwfc_calcNotes();
        });
        createRenXuanSanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc88"){
        //组选单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 11;
        twwfc_playMethod = 88;
        var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
        createRenXuanSanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc89"){
        //组选和值
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 11;
        twwfc_playMethod = 89;
        createOneLineLayout("twwfc","至少选择3个",0,9,false,function(){
            twwfc_calcNotes();
        });
        createRenXuanSanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc90"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 11;
        twwfc_playMethod = 90;
        var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
        createRenXuanSanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc91"){
        //混合组选
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 11;
        twwfc_playMethod = 91;
        var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
        createRenXuanSanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc92"){
        //组选和值
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 11;
        twwfc_playMethod = 92;
        createSumLayout("twwfc",1,26,function(){
            twwfc_calcNotes();
        });
        createRenXuanSanLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc93"){
        $("#twwfc_random").show();
        twwfc_sntuo = 0;
        twwfc_playType = 12;
        twwfc_playMethod = 93;
        createFiveLineLayout("twwfc", function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc94"){
        //直选单式
        $("#twwfc_random").hide();
        twwfc_sntuo = 3;
        twwfc_playType = 12;
        twwfc_playMethod = 94;
        var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("twwfc",tips);
        createRenXuanSiLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc95"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 12;
        twwfc_playMethod = 95;
        createOneLineLayout("twwfc","至少选择4个",0,9,false,function(){
            twwfc_calcNotes();
        });
        createRenXuanSiLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc96"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 12;
        twwfc_playMethod = 96;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        createRenXuanSiLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc97"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 12;
        twwfc_playMethod = 97;
        $("#twwfc_ballView").empty();
        createOneLineLayout("twwfc","二重号:至少选择2个号码",0,9,false,function(){
            twwfc_calcNotes();
        });
        createRenXuanSiLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc98"){
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 12;
        twwfc_playMethod = 98;
        $("#twwfc_ballView").empty();
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("twwfc",tips,0,9,false,function(){
            twwfc_calcNotes();
        });
        createRenXuanSiLayout("twwfc",twwfc_playMethod,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc99"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 13;
        twwfc_playMethod = 99;
        $("#twwfc_ballView").empty();
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc100"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 13;
        twwfc_playMethod = 100;
        $("#twwfc_ballView").empty();
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc101"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 13;
        twwfc_playMethod = 101;
        $("#twwfc_ballView").empty();
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc102"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 13;
        twwfc_playMethod = 102;
        $("#twwfc_ballView").empty();
        createOneLineLayout("twwfc","至少选择1个",0,9,false,function(){
            twwfc_calcNotes();
        });
        twwfc_qingkongAll();
    }else if(val == "twwfc103"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 103;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc104"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 104;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc105"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 105;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc106"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 106;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc107"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 107;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc108"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 108;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc109"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 109;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc110"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 110;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc111"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 111;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }else if(val == "twwfc112"){
        twwfc_qingkongAll();
        $("#twwfc_random").hide();
        twwfc_sntuo = 0;
        twwfc_playType = 14;
        twwfc_playMethod = 112;
        createTextBallOneLayout("twwfc",["龙","虎","和"],["至少选择一个"],function(){
            twwfc_calcNotes();
        });
    }

    if(twwfcScroll){
        twwfcScroll.refresh();
        twwfcScroll.scrollTo(0,0,1);
    }
    
    $("#twwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
    
    initFooterData("twwfc",temp);
    hideRandomWhenLi("twwfc",twwfc_sntuo,twwfc_playMethod);
    twwfc_calcNotes();
}
/**
 * [twwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function twwfc_initFooterButton(){
    if(twwfc_playMethod == 0 || twwfc_playMethod == 62 || twwfc_playMethod == 78
        || twwfc_playMethod == 84 || twwfc_playMethod == 93 || twwfc_playType == 7){
        if(LotteryStorage["twwfc"]["line1"].length > 0 || LotteryStorage["twwfc"]["line2"].length > 0 ||
            LotteryStorage["twwfc"]["line3"].length > 0 || LotteryStorage["twwfc"]["line4"].length > 0 ||
            LotteryStorage["twwfc"]["line5"].length > 0){
            $("#twwfc_qingkong").css("opacity",1.0);
        }else{
            $("#twwfc_qingkong").css("opacity",0.4);
        }
    }else if(twwfc_playMethod == 9){
        if(LotteryStorage["twwfc"]["line1"].length > 0 || LotteryStorage["twwfc"]["line2"].length > 0 ||
            LotteryStorage["twwfc"]["line3"].length > 0 || LotteryStorage["twwfc"]["line4"].length > 0 ){
            $("#twwfc_qingkong").css("opacity",1.0);
        }else{
            $("#twwfc_qingkong").css("opacity",0.4);
        }
    }else if(twwfc_playMethod == 37 || twwfc_playMethod == 4 || twwfc_playMethod == 6
        || twwfc_playMethod == 26 || twwfc_playMethod == 15 || twwfc_playMethod == 75 || twwfc_playMethod == 77){
        if(LotteryStorage["twwfc"]["line1"].length > 0 || LotteryStorage["twwfc"]["line2"].length > 0
            || LotteryStorage["twwfc"]["line3"].length > 0){
            $("#twwfc_qingkong").css("opacity",1.0);
        }else{
            $("#twwfc_qingkong").css("opacity",0.4);
        }
    }else if(twwfc_playMethod == 3 || twwfc_playMethod == 4 || twwfc_playMethod == 5
        || twwfc_playMethod == 6 || twwfc_playMethod == 7 || twwfc_playMethod == 12
        || twwfc_playMethod == 14 || twwfc_playMethod == 48 || twwfc_playMethod == 55
        || twwfc_playMethod == 74 || twwfc_playMethod == 76 || twwfc_playMethod == 96 || twwfc_playMethod == 98){
        if(LotteryStorage["twwfc"]["line1"].length > 0 || LotteryStorage["twwfc"]["line2"].length > 0){
            $("#twwfc_qingkong").css("opacity",1.0);
        }else{
            $("#twwfc_qingkong").css("opacity",0.4);
        }
    }else if(twwfc_playMethod == 2 || twwfc_playMethod == 8 || twwfc_playMethod == 11 || twwfc_playMethod == 13 || twwfc_playMethod == 39
        || twwfc_playMethod == 28 || twwfc_playMethod == 17 || twwfc_playMethod == 18 || twwfc_playMethod == 24 || twwfc_playMethod == 41
        || twwfc_playMethod == 25 || twwfc_playMethod == 29 || twwfc_playMethod == 42 || twwfc_playMethod == 43 || twwfc_playMethod == 30
        || twwfc_playMethod == 35 || twwfc_playMethod == 36 || twwfc_playMethod == 31 || twwfc_playMethod == 32 || twwfc_playMethod == 19
        || twwfc_playMethod == 40 || twwfc_playMethod == 46 || twwfc_playMethod == 20 || twwfc_playMethod == 21 || twwfc_playMethod == 50
        || twwfc_playMethod == 47 || twwfc_playMethod == 51 || twwfc_playMethod == 52 || twwfc_playMethod == 53 || twwfc_playMethod == 57 || twwfc_playMethod == 63
        || twwfc_playMethod == 58 || twwfc_playMethod == 59 || twwfc_playMethod == 60 || twwfc_playMethod == 65 || twwfc_playMethod == 80 || twwfc_playMethod == 81 || twwfc_playType == 8
        || twwfc_playMethod == 83 || twwfc_playMethod == 86 || twwfc_playMethod == 87 || twwfc_playMethod == 22 || twwfc_playMethod == 33 || twwfc_playMethod == 44
        || twwfc_playMethod == 89 || twwfc_playMethod == 92 || twwfc_playMethod == 95 || twwfc_playMethod == 54 || twwfc_playMethod == 61
        || twwfc_playMethod == 97 || twwfc_playType == 13  || twwfc_playType == 14){
        if(LotteryStorage["twwfc"]["line1"].length > 0){
            $("#twwfc_qingkong").css("opacity",1.0);
        }else{
            $("#twwfc_qingkong").css("opacity",0.4);
        }
    }else{
        $("#twwfc_qingkong").css("opacity",0);
    }

    if($("#twwfc_qingkong").css("opacity") == "0"){
        $("#twwfc_qingkong").css("display","none");
    }else{
        $("#twwfc_qingkong").css("display","block");
    }

    if($('#twwfc_zhushu').html() > 0){
        $("#twwfc_queding").css("opacity",1.0);
    }else{
        $("#twwfc_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  twwfc_qingkongAll(){
    $("#twwfc_ballView span").removeClass('redBalls_active');
    LotteryStorage["twwfc"]["line1"] = [];
    LotteryStorage["twwfc"]["line2"] = [];
    LotteryStorage["twwfc"]["line3"] = [];
    LotteryStorage["twwfc"]["line4"] = [];
    LotteryStorage["twwfc"]["line5"] = [];

    localStorageUtils.removeParam("twwfc_line1");
    localStorageUtils.removeParam("twwfc_line2");
    localStorageUtils.removeParam("twwfc_line3");
    localStorageUtils.removeParam("twwfc_line4");
    localStorageUtils.removeParam("twwfc_line5");

    $('#twwfc_zhushu').text(0);
    $('#twwfc_money').text(0);
    clearAwardWin("twwfc");
    twwfc_initFooterButton();
}

/**
 * [twwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function twwfc_calcNotes(){
	$('#twwfc_modeId').blur();
	$('#twwfc_fandian').blur();
	
    var notes = 0;

    if(twwfc_playMethod == 0){
        notes = LotteryStorage["twwfc"]["line1"].length *
            LotteryStorage["twwfc"]["line2"].length *
            LotteryStorage["twwfc"]["line3"].length *
            LotteryStorage["twwfc"]["line4"].length *
            LotteryStorage["twwfc"]["line5"].length;
    }else if(twwfc_playMethod == 2){
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,5);
    }else if(twwfc_playMethod == 3){
        if (LotteryStorage["twwfc"]["line1"].length >= 1 && LotteryStorage["twwfc"]["line2"].length >= 3) {
            notes = getArraySelect(3,LotteryStorage["twwfc"]["line1"],LotteryStorage["twwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(twwfc_playMethod == 4){
        if (LotteryStorage["twwfc"]["line1"].length >= 2 && LotteryStorage["twwfc"]["line2"].length >= 1) {
            notes = getArraySelect(2,LotteryStorage["twwfc"]["line2"],LotteryStorage["twwfc"]["line1"]);
        }else{
            notes = 0;
        }
    }else if(twwfc_playMethod == 5 || twwfc_playMethod == 12){
        if (LotteryStorage["twwfc"]["line1"].length >= 1 && LotteryStorage["twwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["twwfc"]["line1"],LotteryStorage["twwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(twwfc_playMethod == 6 || twwfc_playMethod == 7 || twwfc_playMethod == 14){
        if (LotteryStorage["twwfc"]["line1"].length >= 1 && LotteryStorage["twwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["twwfc"]["line1"],LotteryStorage["twwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(twwfc_playMethod == 9){
        notes = LotteryStorage["twwfc"]["line1"].length *
            LotteryStorage["twwfc"]["line2"].length *
            LotteryStorage["twwfc"]["line3"].length *
            LotteryStorage["twwfc"]["line4"].length;
    }else if(twwfc_playMethod == 18 || twwfc_playMethod == 29 || twwfc_playMethod == 40){
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["twwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
            }
        }
    }else if(twwfc_playMethod == 22 || twwfc_playMethod == 33 || twwfc_playMethod == 44 ){
        notes = 54;
    }else if(twwfc_playMethod == 54 || twwfc_playMethod == 61){
        notes = 9;
    }else if(twwfc_playMethod == 51 || twwfc_playMethod == 58){
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["twwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 2;
            }
        }
    }else if(twwfc_playMethod == 11){
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,4);
    }else if(twwfc_playMethod == 13|| twwfc_playMethod == 64 || twwfc_playMethod == 66 || twwfc_playMethod == 68 || twwfc_playMethod == 70 || twwfc_playMethod == 72){
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,2);
    }else if(twwfc_playMethod == 37 || twwfc_playMethod == 26 || twwfc_playMethod == 15 || twwfc_playMethod == 75 || twwfc_playMethod == 77){
        notes = LotteryStorage["twwfc"]["line1"].length *
            LotteryStorage["twwfc"]["line2"].length *
            LotteryStorage["twwfc"]["line3"].length ;
    }else if(twwfc_playMethod == 39 || twwfc_playMethod == 28 || twwfc_playMethod == 17){
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["twwfc"]["line1"][i]);
        };
    }else if(twwfc_playMethod == 41 || twwfc_playMethod == 30 || twwfc_playMethod == 19){
        notes = mathUtil.getACombination(LotteryStorage["twwfc"]["line1"].length,2);
    }else if(twwfc_playMethod == 42 || twwfc_playMethod == 31 || twwfc_playMethod == 20 || twwfc_playMethod == 68 || twwfc_playMethod == 73){
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,3);
    }else if(twwfc_playMethod == 43 || twwfc_playMethod == 32 || twwfc_playMethod == 21){
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["twwfc"]["line1"][i]);
        };
    }else if(twwfc_playMethod == 48 || twwfc_playMethod == 55 || twwfc_playMethod == 74 || twwfc_playMethod == 76){
        notes = LotteryStorage["twwfc"]["line1"].length *
            LotteryStorage["twwfc"]["line2"].length ;
    }else if(twwfc_playMethod == 50 || twwfc_playMethod == 57){
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["twwfc"]["line1"][i]);
        };
    }else if(twwfc_playMethod == 52 || twwfc_playMethod == 59){
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,2);
    }else if(twwfc_playMethod == 53 || twwfc_playMethod == 60){
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["twwfc"]["line1"][i]);
        };
    }else if(twwfc_playMethod == 62){
        notes = LotteryStorage["twwfc"]["line1"].length +
            LotteryStorage["twwfc"]["line2"].length +
            LotteryStorage["twwfc"]["line3"].length +
            LotteryStorage["twwfc"]["line4"].length +
            LotteryStorage["twwfc"]["line5"].length;
    }else if(twwfc_playType == 13 || twwfc_playType == 14 || twwfc_playMethod == 8 || twwfc_playMethod == 71
        || twwfc_playMethod == 24 || twwfc_playMethod == 25 || twwfc_playMethod == 35 || twwfc_playMethod == 36 || twwfc_playMethod == 46
        || twwfc_playMethod == 47 || twwfc_playMethod == 63 || twwfc_playMethod == 65 || twwfc_playMethod == 67 || twwfc_playMethod == 69 ){
        notes = LotteryStorage["twwfc"]["line1"].length ;
    }else if(twwfc_playMethod == 78){
        notes = LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line2"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line3"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line4"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line3"].length +
            LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line4"].length +
            LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line4"].length +
            LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line4"].length * LotteryStorage["twwfc"]["line5"].length;
    }else if (twwfc_playMethod == 80) {
        if ($("#twwfc_tab .button.red").size() < 2) {
            notes = 0;
        }else{
            for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
                notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["twwfc"]["line1"][i]);
            };
            notes *= mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,2);
        }
    }else if (twwfc_playMethod == 81) {
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,2) * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,2);
    }else if (twwfc_playMethod == 83) {
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["twwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,2);
    }else if (twwfc_playMethod == 84) {
        notes = LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line3"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line4"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line4"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line4"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line4"].length +
            LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line4"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line4"].length * LotteryStorage["twwfc"]["line5"].length ;
    }else if (twwfc_playMethod == 86) {
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["twwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,3);
    }else if (twwfc_playMethod == 87) {
        notes = mathUtil.getACombination(LotteryStorage["twwfc"]["line1"].length,2) * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,3);
    }else if (twwfc_playMethod == 89) {
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,3) * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,3);
    }else if (twwfc_playMethod == 92) {
        for (var i = 0; i < LotteryStorage["twwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["twwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,3);
    }else if (twwfc_playMethod == 93) {
        notes = LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line4"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line4"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line1"].length * LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line4"].length * LotteryStorage["twwfc"]["line5"].length +
            LotteryStorage["twwfc"]["line2"].length * LotteryStorage["twwfc"]["line3"].length * LotteryStorage["twwfc"]["line4"].length * LotteryStorage["twwfc"]["line5"].length;
    }else if (twwfc_playMethod == 95) {
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,4)
            * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,4);
    }else if (twwfc_playMethod == 96) {
        if (LotteryStorage["twwfc"]["line1"].length >= 1 && LotteryStorage["twwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["twwfc"]["line1"],LotteryStorage["twwfc"]["line2"])
                * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else if (twwfc_playMethod == 97) {
        notes = mathUtil.getCCombination(LotteryStorage["twwfc"]["line1"].length,2) * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,4);
    }else if (twwfc_playMethod == 98) {
        if (LotteryStorage["twwfc"]["line1"].length >= 1 && LotteryStorage["twwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["twwfc"]["line1"],LotteryStorage["twwfc"]["line2"]) * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else{
        notes = twwfcValidData($("#twwfc_single").val());
    }

    if(twwfc_sntuo == 3 || twwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","twwfc"),LotteryInfo.getMethodId("ssc",twwfc_playMethod))){
    }else{
        if(parseInt($('#twwfc_modeId').val()) == 8){
            $("#twwfc_random").hide();
        }else{
            $("#twwfc_random").show();
        }
    }

    //验证是否为空
    if( $("#twwfc_beiNum").val() =="" || parseInt($("#twwfc_beiNum").val()) == 0){
        $("#twwfc_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#twwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#twwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#twwfc_zhushu').text(notes);
        if($("#twwfc_modeId").val() == "8"){
            $('#twwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#twwfc_beiNum").val()),0.002));
        }else if ($("#twwfc_modeId").val() == "2"){
            $('#twwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#twwfc_beiNum").val()),0.2));
        }else if ($("#twwfc_modeId").val() == "1"){
            $('#twwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#twwfc_beiNum").val()),0.02));
        }else{
            $('#twwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#twwfc_beiNum").val()),2));
        }
    } else {
        $('#twwfc_zhushu').text(0);
        $('#twwfc_money').text(0);
    }
    twwfc_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('twwfc',twwfc_playMethod);
}

/**
 * [twwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function twwfc_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#twwfc_queding").bind('click', function(event) {

        twwfc_rebate = $("#twwfc_fandian option:last").val();
        if(parseInt($('#twwfc_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        twwfc_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

       /* if(parseInt($('#twwfc_modeId').val()) == 8){
            if (Number($('#twwfc_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('twwfc',twwfc_playMethod);

        submitParams.lotteryType = "twwfc";
        var play = LotteryInfo.getPlayName("ssc",twwfc_playType);
        var playMethod = LotteryInfo.getMethodName("ssc",twwfc_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = twwfc_playType;
        submitParams.playMethodIndex = twwfc_playMethod;
        var selectedBalls = [];
        if(twwfc_playMethod == 0 || twwfc_playMethod == 3 || twwfc_playMethod == 4
            || twwfc_playMethod == 5 || twwfc_playMethod == 6 || twwfc_playMethod == 7
            || twwfc_playMethod == 9 || twwfc_playMethod == 12 || twwfc_playMethod == 14
            || twwfc_playMethod == 37 || twwfc_playMethod == 26 || twwfc_playMethod == 15
            || twwfc_playMethod == 48 || twwfc_playMethod == 55 || twwfc_playMethod == 74 || twwfc_playType == 9){
            $("#twwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(twwfc_playMethod == 2 || twwfc_playMethod == 8 || twwfc_playMethod == 11 || twwfc_playMethod == 13 || twwfc_playMethod == 24
            || twwfc_playMethod == 39 || twwfc_playMethod == 28 || twwfc_playMethod == 17 || twwfc_playMethod == 18 || twwfc_playMethod == 25
            || twwfc_playMethod == 22 || twwfc_playMethod == 33 || twwfc_playMethod == 44 || twwfc_playMethod == 54 || twwfc_playMethod == 61
            || twwfc_playMethod == 41 || twwfc_playMethod == 42 || twwfc_playMethod == 43 || twwfc_playMethod == 29 || twwfc_playMethod == 35
            || twwfc_playMethod == 30 || twwfc_playMethod == 31 || twwfc_playMethod == 32 || twwfc_playMethod == 40 || twwfc_playMethod == 36
            || twwfc_playMethod == 19 || twwfc_playMethod == 20 || twwfc_playMethod == 21 || twwfc_playMethod == 46 || twwfc_playMethod == 47
            || twwfc_playMethod == 50 || twwfc_playMethod == 57 || twwfc_playType == 8 || twwfc_playMethod == 51 || twwfc_playMethod == 58
            || twwfc_playMethod == 52 || twwfc_playMethod == 53|| twwfc_playMethod == 59 || twwfc_playMethod == 60 || twwfc_playType == 13 || twwfc_playType == 14){
            $("#twwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(twwfc_playType == 7 || twwfc_playMethod == 78 || twwfc_playMethod == 84 || twwfc_playMethod == 93){
            $("#twwfc_ballView div.ballView").each(function(){
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
        }else if(twwfc_playMethod == 80 || twwfc_playMethod == 81 || twwfc_playMethod == 83
            || twwfc_playMethod == 86 || twwfc_playMethod == 87 || twwfc_playMethod == 89
            || twwfc_playMethod == 92 || twwfc_playMethod == 95 || twwfc_playMethod == 97){
            $("#twwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            var temp = selectedBalls.join(",") + "#";

            if ($("#twwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#twwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#twwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#twwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#twwfc_tab5").hasClass("button red")) {
                temp += "个";
            };

            submitParams.nums = temp;
        }else if (twwfc_playMethod == 96 || twwfc_playMethod == 98) {
            $("#twwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            var temp = selectedBalls.join("|") + "#";
            if ($("#twwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#twwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#twwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#twwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#twwfc_tab5").hasClass("button red")) {
                temp += "个";
            };
            submitParams.nums = temp;
        }else{
	        //去错误号
	        twwfcValidateData("submit");
            var array = handleSingleStr($("#twwfc_single").val());
            if(twwfc_playMethod == 1 ){
                submitParams.nums = array.join(" ");
            }else if(twwfc_playMethod == 10 || twwfc_playMethod == 38 || twwfc_playMethod == 27
                || twwfc_playMethod == 16 || twwfc_playMethod == 49 || twwfc_playMethod == 56){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join("|");
                    }else{
                        temp = temp + array[i].split("").join("|") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(twwfc_playMethod == 45 || twwfc_playMethod == 34 || twwfc_playMethod == 23){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(twwfc_playMethod == 79 || twwfc_playMethod == 82 || twwfc_playMethod == 85 || twwfc_playMethod == 88 ||
                twwfc_playMethod == 89 || twwfc_playMethod == 90 || twwfc_playMethod == 91 || twwfc_playMethod == 94){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                temp +="#";
                if ($("#twwfc_tab1").hasClass("button red")) {
                    temp += "万";
                };
                if ($("#twwfc_tab2").hasClass("button red")) {
                    temp += "千";
                };
                if ($("#twwfc_tab3").hasClass("button red")) {
                    temp += "百";
                };
                if ($("#twwfc_tab4").hasClass("button red")) {
                    temp += "十";
                };
                if ($("#twwfc_tab5").hasClass("button red")) {
                    temp += "个";
                };

                submitParams.nums = temp;
            }
        }
        localStorageUtils.setParam("playMode",$("#twwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#twwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#twwfc_fandian").val());
        submitParams.notes = $('#twwfc_zhushu').html();
        submitParams.sntuo = twwfc_sntuo;
        submitParams.multiple = $('#twwfc_beiNum').val();  //requirement
        submitParams.rebates = $('#twwfc_fandian').val();  //requirement
        submitParams.playMode = $('#twwfc_modeId').val();  //requirement
        submitParams.money = $('#twwfc_money').html();  //requirement
        submitParams.award = $('#twwfc_minAward').html();  //奖金
        submitParams.maxAward = $('#twwfc_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#twwfc_ballView").empty();
        twwfc_qingkongAll();
    });
}

/**
 * [twwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function twwfc_randomOne(){
    twwfc_qingkongAll();
    if(twwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        LotteryStorage["twwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["twwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["twwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["twwfc"]["line4"].push(redBallArray[3]+"");
        LotteryStorage["twwfc"]["line5"].push(redBallArray[4]+"");

        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line2"], function(k, v){
            $("#" + "twwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line3"], function(k, v){
            $("#" + "twwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line4"], function(k, v){
            $("#" + "twwfc_line4" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line5"], function(k, v){
            $("#" + "twwfc_line5" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["twwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        LotteryStorage["twwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["twwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["twwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["twwfc"]["line4"].push(redBallArray[3]+"");

        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line2"], function(k, v){
            $("#" + "twwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line3"], function(k, v){
            $("#" + "twwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line4"], function(k, v){
            $("#" + "twwfc_line4" + v).toggleClass("redBalls_active");
        });

    }else if(twwfc_playMethod == 37 || twwfc_playMethod == 26 || twwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        LotteryStorage["twwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["twwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["twwfc"]["line3"].push(redBallArray[2]+"");

        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line2"], function(k, v){
            $("#" + "twwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line3"], function(k, v){
            $("#" + "twwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 41 || twwfc_playMethod == 30 || twwfc_playMethod == 19 || twwfc_playMethod == 68
        || twwfc_playMethod == 52 || twwfc_playMethod == 64 || twwfc_playMethod == 66
        || twwfc_playMethod == 59 || twwfc_playMethod == 70 || twwfc_playMethod == 72){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["twwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 42 || twwfc_playMethod == 31 || twwfc_playMethod == 20 || twwfc_playMethod == 73){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["twwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 39 || twwfc_playMethod == 28 || twwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        LotteryStorage["twwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 43 || twwfc_playMethod == 32 || twwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        LotteryStorage["twwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 48 || twwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        LotteryStorage["twwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["twwfc"]["line2"].push(redBallArray[1]+"");

        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line2"], function(k, v){
            $("#" + "twwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 25 || twwfc_playMethod == 36 || twwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["twwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 50 || twwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        LotteryStorage["twwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 53 || twwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        LotteryStorage["twwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["twwfc"]["line"+line].push(number+"");
        $.each(LotteryStorage["twwfc"]["line"+line], function(k, v){
            $("#" + "twwfc_line" + line + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 63 || twwfc_playMethod == 67 || twwfc_playMethod == 69 || twwfc_playMethod == 71 || twwfc_playType == 13
        || twwfc_playMethod == 65 || twwfc_playMethod == 18 || twwfc_playMethod == 29 || twwfc_playMethod == 40 || twwfc_playMethod == 22
        || twwfc_playMethod == 33 || twwfc_playMethod == 44 || twwfc_playMethod == 54 || twwfc_playMethod == 61
        || twwfc_playMethod == 24 || twwfc_playMethod == 35 || twwfc_playMethod == 46 || twwfc_playMethod == 51 || twwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["twwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 74 || twwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        LotteryStorage["twwfc"]["line1"].push(array[0]+"");
        LotteryStorage["twwfc"]["line2"].push(array[1]+"");
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line2"], function(k, v){
            $("#" + "twwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 75 || twwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        LotteryStorage["twwfc"]["line1"].push(array[0]+"");
        LotteryStorage["twwfc"]["line2"].push(array[1]+"");
        LotteryStorage["twwfc"]["line3"].push(array[2]+"");
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line2"], function(k, v){
            $("#" + "twwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line3"], function(k, v){
            $("#" + "twwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);
        LotteryStorage["twwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["twwfc"]["line"+lines[1]].push(array[1]+"");
        $.each(LotteryStorage["twwfc"]["line"+lines[0]], function(k, v){
            $("#" + "twwfc_line" + lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line"+lines[1]], function(k, v){
            $("#" + "twwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        LotteryStorage["twwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["twwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["twwfc"]["line"+lines[2]].push(array[2]+"");

        $.each(LotteryStorage["twwfc"]["line"+lines[0]], function(k, v){
            $("#" + "twwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line"+lines[1]], function(k, v){
            $("#" + "twwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line"+lines[0]], function(k, v){
            $("#" + "twwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        LotteryStorage["twwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["twwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["twwfc"]["line"+lines[2]].push(array[2]+"");
        LotteryStorage["twwfc"]["line"+lines[3]].push(array[3]+"");

        $.each(LotteryStorage["twwfc"]["line"+lines[0]], function(k, v){
            $("#" + "twwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line"+lines[1]], function(k, v){
            $("#" + "twwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line"+lines[2]], function(k, v){
            $("#" + "twwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["twwfc"]["line"+lines[3]], function(k, v){
            $("#" + "twwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
        });
    }else if(twwfc_playType == 14){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["twwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["twwfc"]["line1"], function(k, v){
            $("#" + "twwfc_line1" + v).toggleClass("redBalls_active");
        });
    }
    twwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function twwfc_checkOutRandom(playMethod){
    var obj = new Object();
    if(twwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(twwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(twwfc_playMethod == 18 || twwfc_playMethod == 29 || twwfc_playMethod == 40){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
        }
    }else if(twwfc_playMethod == 22 || twwfc_playMethod == 33 || twwfc_playMethod == 44){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 54;
    }else if(twwfc_playMethod == 54 || twwfc_playMethod == 61){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 9;
    }
    else if(twwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(twwfc_playMethod == 37 || twwfc_playMethod == 26 || twwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(twwfc_playMethod == 39 || twwfc_playMethod == 28 || twwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        obj.nums = number;
        obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
    }else if(twwfc_playMethod == 41 || twwfc_playMethod == 30 || twwfc_playMethod == 19){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(twwfc_playMethod == 52 || twwfc_playMethod == 59 || twwfc_playMethod == 64 || twwfc_playMethod == 66 || twwfc_playMethod == 68
        ||twwfc_playMethod == 70 || twwfc_playMethod == 72){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(twwfc_playMethod == 42 || twwfc_playMethod == 31 || twwfc_playMethod == 20 || twwfc_playMethod == 73){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(twwfc_playMethod == 43 || twwfc_playMethod == 32 || twwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        obj.nums = number;
        obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
    }else if(twwfc_playMethod == 48 || twwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(twwfc_playMethod == 50 || twwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
    }else if(twwfc_playMethod == 53 || twwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
    }else if(twwfc_playMethod == 62){
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
    }else if(twwfc_playMethod == 63 || twwfc_playMethod == 65 || twwfc_playMethod == 67 || twwfc_playMethod == 69 || twwfc_playMethod == 71
        || twwfc_playMethod == 24 || twwfc_playMethod == 35 || twwfc_playMethod == 46){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 1;
    }else if(twwfc_playMethod == 25 || twwfc_playMethod == 36 || twwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        var array = ["豹子","顺子","对子","半顺","杂六"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(twwfc_playMethod == 51 || twwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
        }
    }else if(twwfc_playMethod == 74 || twwfc_playMethod == 76){
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
    }else if(twwfc_playMethod == 75 || twwfc_playMethod == 77){
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
    }else if(twwfc_playMethod == 78){
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
    }else if(twwfc_playMethod == 84){
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
    }else if(twwfc_playMethod == 93){
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
    obj.sntuo = twwfc_sntuo;
    obj.multiple = 1;
    obj.rebates = twwfc_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('twwfc',twwfc_playMethod,obj);  //机选奖金计算
    obj.award = $('#twwfc_minAward').html();     //奖金
    obj.maxAward = $('#twwfc_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [twwfcValidateData 单式数据验证]
 */
function twwfcValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#twwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
    twwfcValidData(textStr,type);
}

function twwfcValidData(str,type){
    if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
        array,
        result,
        content = {};
    if(twwfc_playMethod == 1){
        content.str = str;
        content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 10){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 38 || twwfc_playMethod == 27 || twwfc_playMethod == 16){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 45 || twwfc_playMethod == 34 || twwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 49 || twwfc_playMethod == 56){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 79){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,2);
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 82){
        content.str = str;
        content.weishu = 2;
        content.duizi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,2);
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 85){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,3);
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 88){
        content.str = str;
        content.weishu = 3;
        content.zusan = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,3);
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 90){
        content.str = str;
        content.weishu = 3;
        content.zuliu = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,3);
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 91){
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,3);
        twwfcShowFooter(true,notes);
    }else if(twwfc_playMethod == 94){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#twwfc_tab .button.red").size() ,4);
        twwfcShowFooter(true,notes);
    }

    $('#twwfc_delRepeat').off('click');
    $('#twwfc_delRepeat').on('click',function () {
        content.str = $('#twwfc_single').val() ? $('#twwfc_single').val() : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        array = rptResult.num || [];
        notes = rptResult.length;
        twwfcShowFooter(true,notes);
        $("#twwfc_single").val(array.join(" "));
    });

    $("#twwfc_single").val(array.join(" "));
    return notes;
}

function twwfcShowFooter(isValid,notes){
    $('#twwfc_zhushu').text(notes);
    if($("#twwfc_modeId").val() == "8"){
        $('#twwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#twwfc_beiNum").val()),0.002));
    }else if ($("#twwfc_modeId").val() == "2"){
        $('#twwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#twwfc_beiNum").val()),0.2));
    }else if ($("#twwfc_modeId").val() == "1"){
        $('#twwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#twwfc_beiNum").val()),0.02));
    }else{
        $('#twwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#twwfc_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    twwfc_initFooterButton();
    calcAwardWin('twwfc',twwfc_playMethod);  //计算奖金和盈利
}