var bxwfc_playType = 2;
var bxwfc_playMethod = 15;
var bxwfc_sntuo = 0;
var bxwfc_rebate;
var bxwfcScroll;

//进入这个页面时调用
function bxwfcPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("bxwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("bxwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function bxwfcPageUnloadedPanel(){
    $("#bxwfc_queding").off('click');
    $("#bxwfcPage_back").off('click');
    $("#bxwfc_ballView").empty();
    $("#bxwfcSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="bxwfcPlaySelect"></select>');
    $("#bxwfcSelect").append($select);
}

//入口函数
function bxwfc_init(){
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
    $("#bxwfc_title").html(LotteryInfo.getLotteryNameByTag("bxwfc"));
    for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
                var name = LotteryInfo.getMethodName("ssc",j);
                if(i == bxwfc_playType && j == bxwfc_playMethod){
                    $play.append('<option value="bxwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="bxwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(bxwfc_playMethod,onShowArray)>-1 ){
						bxwfc_playType = i;
						bxwfc_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#bxwfcPlaySelect").append($play);
		}
    }
    
    if($("#bxwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("bxwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:bxwfcChangeItem
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

    GetLotteryInfo("bxwfc",function (){
        bxwfcChangeItem("bxwfc"+bxwfc_playMethod);
    });

    //添加滑动条
    if(!bxwfcScroll){
        bxwfcScroll = new IScroll('#bxwfcContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("bxwfc",LotteryInfo.getLotteryIdByTag("bxwfc"));

    //获取上一期开奖
    queryLastPrize("bxwfc");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('bxwfc');

    //机选选号
    $("#bxwfc_random").off('click');
    $("#bxwfc_random").on('click', function(event) {
        bxwfc_randomOne();
    });
    
    $("#bxwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",bxwfc_playMethod));
	//玩法说明
	$("#bxwfc_paly_shuoming").off('click');
	$("#bxwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("bxwfc_#shuoming").text());
	});

    //返回
    $("#bxwfcPage_back").on('click', function(event) {
        // bxwfc_playType = 2;
        // bxwfc_playMethod = 15;
        $("#bxwfc_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        bxwfc_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("bxwfc");//清空
    bxwfc_submitData();
}

function bxwfcResetPlayType(){
    bxwfc_playType = 2;
    bxwfc_playMethod = 15;
}

function bxwfcChangeItem(val) {
    bxwfc_qingkongAll();
    var temp = val.substring("bxwfc".length,val.length);
    if(val == "bxwfc0"){
        //直选复式
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 0;
        bxwfc_playMethod = 0;
        createFiveLineLayout("bxwfc", function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc1"){
        //直选单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 0;
        bxwfc_playMethod = 1;
        $("#bxwfc_ballView").empty();
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc2"){
        //组选120
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 0;
        bxwfc_playMethod = 2;
        createOneLineLayout("bxwfc","至少选择5个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc3"){
        //组选60
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 0;
        bxwfc_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc4"){
        //组选30
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 0;
        bxwfc_playMethod = 4;
        var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc5"){
        //组选20
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 0;
        bxwfc_playMethod = 5;
        var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc6"){
        //组选10
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 0;
        bxwfc_playMethod = 6;
        var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc7"){
        //组选5
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 0;
        bxwfc_playMethod = 7;
        var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc8"){
        //总和大小单双
        $("#bxwfc_random").show();
        var num = ["大","小","单","双"];
        bxwfc_sntuo = 0;
        bxwfc_playType = 0;
        bxwfc_playMethod = 8;
        createNonNumLayout("bxwfc",bxwfc_playMethod,num,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc9"){
        //直选复式
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 1;
        bxwfc_playMethod = 9;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createFourLineLayout("bxwfc",tips, function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc10"){
        //直选单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 1;
        bxwfc_playMethod = 10;
        $("#bxwfc_ballView").empty();
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc11"){
        //组选24
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 1;
        bxwfc_playMethod = 11;
        createOneLineLayout("bxwfc","至少选择4个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc12"){
        //组选12
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 1;
        bxwfc_playMethod = 12;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc13"){
        //组选6
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 1;
        bxwfc_playMethod = 13;
        createOneLineLayout("bxwfc","二重号:至少选择2个号码",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc14"){
        //组选4
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 1;
        bxwfc_playMethod = 14;
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc15"){
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 15;
        var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createThreeLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc16"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 2;
        bxwfc_playMethod = 16;
        $("#bxwfc_ballView").empty();
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc17"){
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 17;
        createSumLayout("bxwfc",0,27,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc18"){
        //直选跨度
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 18;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc19"){
        //后三组三
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 19;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc20"){
        //后三组六
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 20;
        createOneLineLayout("bxwfc","至少选择3个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc21"){
        //后三和值
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 21;
        createSumLayout("bxwfc",1,26,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc22"){
        //后三组选包胆
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 22;
        bxwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("bxwfc",array,["请选择一个号码"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc23"){
        //后三混合组选
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 2;
        bxwfc_playMethod = 23;
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc24"){
        //和值尾数
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 24;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc25"){
        //特殊号
        $("#bxwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        bxwfc_sntuo = 0;
        bxwfc_playType = 2;
        bxwfc_playMethod = 25;
        createNonNumLayout("bxwfc",bxwfc_playMethod,num,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc26"){
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 26;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
        createThreeLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc27"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 3;
        bxwfc_playMethod = 27;
        $("#bxwfc_ballView").empty();
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc28"){
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 28;
        createSumLayout("bxwfc",0,27,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc29"){
        //直选跨度
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 29;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc30"){
        //中三组三
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 30;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc31"){
        //中三组六
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 31;
        createOneLineLayout("bxwfc","至少选择3个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc32"){
        //中三和值
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 32;
        createSumLayout("bxwfc",1,26,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc33"){
        //中三组选包胆
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 33;
        bxwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("bxwfc",array,["请选择一个号码"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc34"){
        //中三混合组选
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 3;
        bxwfc_playMethod = 34;
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc35"){
        //和值尾数
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 35;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc36"){
        //特殊号
        $("#bxwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        bxwfc_sntuo = 0;
        bxwfc_playType = 3;
        bxwfc_playMethod = 36;
        createNonNumLayout("bxwfc",bxwfc_playMethod,num,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc37"){
        //直选复式
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 37;
        var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
        createThreeLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc38"){
        //直选单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 4;
        bxwfc_playMethod = 38;
        $("#bxwfc_ballView").empty();
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc39"){
        //和值
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 39;
        createSumLayout("bxwfc",0,27,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc40"){
        //直选跨度
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 40;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc41"){
        //前三组三
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 41;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc42"){
        //前三组六
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 42;
        createOneLineLayout("bxwfc","至少选择3个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc43"){
        //前三和值
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 43;
        createSumLayout("bxwfc",1,26,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc44"){
        //前三组选包胆
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 44;
        bxwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("bxwfc",array,["请选择一个号码"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc45"){
        //前三混合组选
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 4;
        bxwfc_playMethod = 45;
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc46"){
        //和值尾数
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 46;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc47"){
        //特殊号
        $("#bxwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        bxwfc_sntuo = 0;
        bxwfc_playType = 4;
        bxwfc_playMethod = 47;
        createNonNumLayout("bxwfc",bxwfc_playMethod,num,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc48"){
        //后二复式
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 5;
        bxwfc_playMethod = 48;
        var tips = ["十位：可选1-10个","个位：可选1-10个"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc49"){
        //后二单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 5;
        bxwfc_playMethod = 49;
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc50"){
        //后二和值
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 5;
        bxwfc_playMethod = 50;
        createSumLayout("bxwfc",0,18,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc51"){
        //直选跨度
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 5;
        bxwfc_playMethod = 51;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc52"){
        //后二组选
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 5;
        bxwfc_playMethod = 52;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc53"){
        //后二和值
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 5;
        bxwfc_playMethod = 53;
        createSumLayout("bxwfc",1,17,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc54"){
        //后二组选包胆
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 5;
        bxwfc_playMethod = 54;
        bxwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("bxwfc",array,["请选择一个号码"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc55"){
        //前二复式
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 6;
        bxwfc_playMethod = 55;
        var tips = ["万位：可选1-10个","千位：可选1-10个"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc56"){
        //前二单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 6;
        bxwfc_playMethod = 56;
        bxwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
    }else if(val == "bxwfc57"){
        //前二和值
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 6;
        bxwfc_playMethod = 57;
        createSumLayout("bxwfc",0,18,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc58"){
        //直选跨度
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 6;
        bxwfc_playMethod = 58;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc59"){
        //前二组选
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 6;
        bxwfc_playMethod = 59;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc60"){
        //前二和值
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 6;
        bxwfc_playMethod = 60;
        createSumLayout("bxwfc",1,17,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc61"){
        //前二组选包胆
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 6;
        bxwfc_playMethod = 61;
        bxwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("bxwfc",array,["请选择一个号码"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc62"){
        //定位复式
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 7;
        bxwfc_playMethod = 62;
        createFiveLineLayout("bxwfc", function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc63"){
        //后三一码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 63;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc64"){
        //后三二码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 64;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc65"){
        //前三一码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 65;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc66"){
        //前三二码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 66;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc67"){
        //后四一码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 67;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc68"){
        //后四二码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 68;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc69"){
        //前四一码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 69;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc70"){
        //前四二码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 70;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc71"){
        //五星一码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 71;
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc72"){
        //五星二码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 72;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc73"){
        //五星三码
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 8;
        bxwfc_playMethod = 73;
        createOneLineLayout("bxwfc","至少选择3个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc74"){
        //后二大小单双
        bxwfc_qingkongAll();
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 9;
        bxwfc_playMethod = 74;
        createTextBallTwoLayout("bxwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc75"){
        //后三大小单双
        bxwfc_qingkongAll();
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 9;
        bxwfc_playMethod = 75;
        createTextBallThreeLayout("bxwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc76"){
        //前二大小单双
        bxwfc_qingkongAll();
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 9;
        bxwfc_playMethod = 76;
        createTextBallTwoLayout("bxwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc77"){
        //前三大小单双
        bxwfc_qingkongAll();
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 9;
        bxwfc_playMethod = 77;
        createTextBallThreeLayout("bxwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc78"){
        //直选复式
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 10;
        bxwfc_playMethod = 78;
        createFiveLineLayout("bxwfc",function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc79"){
        //直选单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 10;
        bxwfc_playMethod = 79;
        var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
        createRenXuanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc80"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 10;
        bxwfc_playMethod = 80;
        createSumLayout("bxwfc",0,18,function(){
            bxwfc_calcNotes();
        });
        createRenXuanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc81"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 10;
        bxwfc_playMethod = 81;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        createRenXuanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc82"){
        //组选单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 10;
        bxwfc_playMethod = 82;
        var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
        createRenXuanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc83"){
        //组选和值
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 10;
        bxwfc_playMethod = 83;
        createSumLayout("bxwfc",1,17,function(){
            bxwfc_calcNotes();
        });
        createRenXuanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc84"){
        //直选复式
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 11;
        bxwfc_playMethod = 84;
        createFiveLineLayout("bxwfc", function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc85"){
        //直选单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 11;
        bxwfc_playMethod = 85;
        var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
        createRenXuanSanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc86"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 11;
        bxwfc_playMethod = 86;
        createSumLayout("bxwfc",0,27,function(){
            bxwfc_calcNotes();
        });
        createRenXuanSanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc87"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 11;
        bxwfc_playMethod = 87;
        createOneLineLayout("bxwfc","至少选择2个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        createRenXuanSanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc88"){
        //组选单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 11;
        bxwfc_playMethod = 88;
        var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
        createRenXuanSanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc89"){
        //组选和值
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 11;
        bxwfc_playMethod = 89;
        createOneLineLayout("bxwfc","至少选择3个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        createRenXuanSanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc90"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 11;
        bxwfc_playMethod = 90;
        var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
        createRenXuanSanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc91"){
        //混合组选
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 11;
        bxwfc_playMethod = 91;
        var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
        createRenXuanSanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc92"){
        //组选和值
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 11;
        bxwfc_playMethod = 92;
        createSumLayout("bxwfc",1,26,function(){
            bxwfc_calcNotes();
        });
        createRenXuanSanLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc93"){
        $("#bxwfc_random").show();
        bxwfc_sntuo = 0;
        bxwfc_playType = 12;
        bxwfc_playMethod = 93;
        createFiveLineLayout("bxwfc", function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc94"){
        //直选单式
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 3;
        bxwfc_playType = 12;
        bxwfc_playMethod = 94;
        var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("bxwfc",tips);
        createRenXuanSiLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc95"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 12;
        bxwfc_playMethod = 95;
        createOneLineLayout("bxwfc","至少选择4个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        createRenXuanSiLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc96"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 12;
        bxwfc_playMethod = 96;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        createRenXuanSiLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc97"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 12;
        bxwfc_playMethod = 97;
        $("#bxwfc_ballView").empty();
        createOneLineLayout("bxwfc","二重号:至少选择2个号码",0,9,false,function(){
            bxwfc_calcNotes();
        });
        createRenXuanSiLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc98"){
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 12;
        bxwfc_playMethod = 98;
        $("#bxwfc_ballView").empty();
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("bxwfc",tips,0,9,false,function(){
            bxwfc_calcNotes();
        });
        createRenXuanSiLayout("bxwfc",bxwfc_playMethod,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc99"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 13;
        bxwfc_playMethod = 99;
        $("#bxwfc_ballView").empty();
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc100"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 13;
        bxwfc_playMethod = 100;
        $("#bxwfc_ballView").empty();
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc101"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 13;
        bxwfc_playMethod = 101;
        $("#bxwfc_ballView").empty();
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc102"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 13;
        bxwfc_playMethod = 102;
        $("#bxwfc_ballView").empty();
        createOneLineLayout("bxwfc","至少选择1个",0,9,false,function(){
            bxwfc_calcNotes();
        });
        bxwfc_qingkongAll();
    }else if(val == "bxwfc103"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 103;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc104"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 104;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc105"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 105;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc106"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 106;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc107"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 107;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc108"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 108;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc109"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 109;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc110"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 110;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc111"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 111;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }else if(val == "bxwfc112"){
        bxwfc_qingkongAll();
        $("#bxwfc_random").hide();
        bxwfc_sntuo = 0;
        bxwfc_playType = 14;
        bxwfc_playMethod = 112;
        createTextBallOneLayout("bxwfc",["龙","虎","和"],["至少选择一个"],function(){
            bxwfc_calcNotes();
        });
    }

    if(bxwfcScroll){
        bxwfcScroll.refresh();
        bxwfcScroll.scrollTo(0,0,1);
    }
    
    $("#shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
    
    initFooterData("bxwfc",temp);
    hideRandomWhenLi("bxwfc",bxwfc_sntuo,bxwfc_playMethod);
    bxwfc_calcNotes();
}
/**
 * [bxwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function bxwfc_initFooterButton(){
    if(bxwfc_playMethod == 0 || bxwfc_playMethod == 62 || bxwfc_playMethod == 78
        || bxwfc_playMethod == 84 || bxwfc_playMethod == 93 || bxwfc_playType == 7){
        if(LotteryStorage["bxwfc"]["line1"].length > 0 || LotteryStorage["bxwfc"]["line2"].length > 0 ||
            LotteryStorage["bxwfc"]["line3"].length > 0 || LotteryStorage["bxwfc"]["line4"].length > 0 ||
            LotteryStorage["bxwfc"]["line5"].length > 0){
            $("#bxwfc_qingkong").css("opacity",1.0);
        }else{
            $("#bxwfc_qingkong").css("opacity",0.4);
        }
    }else if(bxwfc_playMethod == 9){
        if(LotteryStorage["bxwfc"]["line1"].length > 0 || LotteryStorage["bxwfc"]["line2"].length > 0 ||
            LotteryStorage["bxwfc"]["line3"].length > 0 || LotteryStorage["bxwfc"]["line4"].length > 0 ){
            $("#bxwfc_qingkong").css("opacity",1.0);
        }else{
            $("#bxwfc_qingkong").css("opacity",0.4);
        }
    }else if(bxwfc_playMethod == 37 || bxwfc_playMethod == 4 || bxwfc_playMethod == 6
        || bxwfc_playMethod == 26 || bxwfc_playMethod == 15 || bxwfc_playMethod == 75 || bxwfc_playMethod == 77){
        if(LotteryStorage["bxwfc"]["line1"].length > 0 || LotteryStorage["bxwfc"]["line2"].length > 0
            || LotteryStorage["bxwfc"]["line3"].length > 0){
            $("#bxwfc_qingkong").css("opacity",1.0);
        }else{
            $("#bxwfc_qingkong").css("opacity",0.4);
        }
    }else if(bxwfc_playMethod == 3 || bxwfc_playMethod == 4 || bxwfc_playMethod == 5
        || bxwfc_playMethod == 6 || bxwfc_playMethod == 7 || bxwfc_playMethod == 12
        || bxwfc_playMethod == 14 || bxwfc_playMethod == 48 || bxwfc_playMethod == 55
        || bxwfc_playMethod == 74 || bxwfc_playMethod == 76 || bxwfc_playMethod == 96 || bxwfc_playMethod == 98){
        if(LotteryStorage["bxwfc"]["line1"].length > 0 || LotteryStorage["bxwfc"]["line2"].length > 0){
            $("#bxwfc_qingkong").css("opacity",1.0);
        }else{
            $("#bxwfc_qingkong").css("opacity",0.4);
        }
    }else if(bxwfc_playMethod == 2 || bxwfc_playMethod == 8 || bxwfc_playMethod == 11 || bxwfc_playMethod == 13 || bxwfc_playMethod == 39
        || bxwfc_playMethod == 28 || bxwfc_playMethod == 17 || bxwfc_playMethod == 18 || bxwfc_playMethod == 24 || bxwfc_playMethod == 41
        || bxwfc_playMethod == 25 || bxwfc_playMethod == 29 || bxwfc_playMethod == 42 || bxwfc_playMethod == 43 || bxwfc_playMethod == 30
        || bxwfc_playMethod == 35 || bxwfc_playMethod == 36 || bxwfc_playMethod == 31 || bxwfc_playMethod == 32 || bxwfc_playMethod == 19
        || bxwfc_playMethod == 40 || bxwfc_playMethod == 46 || bxwfc_playMethod == 20 || bxwfc_playMethod == 21 || bxwfc_playMethod == 50
        || bxwfc_playMethod == 47 || bxwfc_playMethod == 51 || bxwfc_playMethod == 52 || bxwfc_playMethod == 53 || bxwfc_playMethod == 57 || bxwfc_playMethod == 63
        || bxwfc_playMethod == 58 || bxwfc_playMethod == 59 || bxwfc_playMethod == 60 || bxwfc_playMethod == 65 || bxwfc_playMethod == 80 || bxwfc_playMethod == 81 || bxwfc_playType == 8
        || bxwfc_playMethod == 83 || bxwfc_playMethod == 86 || bxwfc_playMethod == 87 || bxwfc_playMethod == 22 || bxwfc_playMethod == 33 || bxwfc_playMethod == 44
        || bxwfc_playMethod == 89 || bxwfc_playMethod == 92 || bxwfc_playMethod == 95 || bxwfc_playMethod == 54 || bxwfc_playMethod == 61
        || bxwfc_playMethod == 97 || bxwfc_playType == 13  || bxwfc_playType == 14){
        if(LotteryStorage["bxwfc"]["line1"].length > 0){
            $("#bxwfc_qingkong").css("opacity",1.0);
        }else{
            $("#bxwfc_qingkong").css("opacity",0.4);
        }
    }else{
        $("#bxwfc_qingkong").css("opacity",0);
    }

    if($("#bxwfc_qingkong").css("opacity") == "0"){
        $("#bxwfc_qingkong").css("display","none");
    }else{
        $("#bxwfc_qingkong").css("display","block");
    }

    if($('#bxwfc_zhushu').html() > 0){
        $("#bxwfc_queding").css("opacity",1.0);
    }else{
        $("#bxwfc_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  bxwfc_qingkongAll(){
    $("#bxwfc_ballView span").removeClass('redBalls_active');
    LotteryStorage["bxwfc"]["line1"] = [];
    LotteryStorage["bxwfc"]["line2"] = [];
    LotteryStorage["bxwfc"]["line3"] = [];
    LotteryStorage["bxwfc"]["line4"] = [];
    LotteryStorage["bxwfc"]["line5"] = [];

    localStorageUtils.removeParam("bxwfc_line1");
    localStorageUtils.removeParam("bxwfc_line2");
    localStorageUtils.removeParam("bxwfc_line3");
    localStorageUtils.removeParam("bxwfc_line4");
    localStorageUtils.removeParam("bxwfc_line5");

    $('#bxwfc_zhushu').text(0);
    $('#bxwfc_money').text(0);
    clearAwardWin("bxwfc");
    bxwfc_initFooterButton();
}

/**
 * [bxwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function bxwfc_calcNotes(){
	$('#bxwfc_modeId').blur();
	$('#bxwfc_fandian').blur();
	
    var notes = 0;

    if(bxwfc_playMethod == 0){
        notes = LotteryStorage["bxwfc"]["line1"].length *
            LotteryStorage["bxwfc"]["line2"].length *
            LotteryStorage["bxwfc"]["line3"].length *
            LotteryStorage["bxwfc"]["line4"].length *
            LotteryStorage["bxwfc"]["line5"].length;
    }else if(bxwfc_playMethod == 2){
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,5);
    }else if(bxwfc_playMethod == 3){
        if (LotteryStorage["bxwfc"]["line1"].length >= 1 && LotteryStorage["bxwfc"]["line2"].length >= 3) {
            notes = getArraySelect(3,LotteryStorage["bxwfc"]["line1"],LotteryStorage["bxwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(bxwfc_playMethod == 4){
        if (LotteryStorage["bxwfc"]["line1"].length >= 2 && LotteryStorage["bxwfc"]["line2"].length >= 1) {
            notes = getArraySelect(2,LotteryStorage["bxwfc"]["line2"],LotteryStorage["bxwfc"]["line1"]);
        }else{
            notes = 0;
        }
    }else if(bxwfc_playMethod == 5 || bxwfc_playMethod == 12){
        if (LotteryStorage["bxwfc"]["line1"].length >= 1 && LotteryStorage["bxwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["bxwfc"]["line1"],LotteryStorage["bxwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(bxwfc_playMethod == 6 || bxwfc_playMethod == 7 || bxwfc_playMethod == 14){
        if (LotteryStorage["bxwfc"]["line1"].length >= 1 && LotteryStorage["bxwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["bxwfc"]["line1"],LotteryStorage["bxwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(bxwfc_playMethod == 9){
        notes = LotteryStorage["bxwfc"]["line1"].length *
            LotteryStorage["bxwfc"]["line2"].length *
            LotteryStorage["bxwfc"]["line3"].length *
            LotteryStorage["bxwfc"]["line4"].length;
    }else if(bxwfc_playMethod == 18 || bxwfc_playMethod == 29 || bxwfc_playMethod == 40){
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["bxwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
            }
        }
    }else if(bxwfc_playMethod == 22 || bxwfc_playMethod == 33 || bxwfc_playMethod == 44 ){
        notes = 54;
    }else if(bxwfc_playMethod == 54 || bxwfc_playMethod == 61){
        notes = 9;
    }else if(bxwfc_playMethod == 51 || bxwfc_playMethod == 58){
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["bxwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 2;
            }
        }
    }else if(bxwfc_playMethod == 11){
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,4);
    }else if(bxwfc_playMethod == 13|| bxwfc_playMethod == 64 || bxwfc_playMethod == 66 || bxwfc_playMethod == 68 || bxwfc_playMethod == 70 || bxwfc_playMethod == 72){
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,2);
    }else if(bxwfc_playMethod == 37 || bxwfc_playMethod == 26 || bxwfc_playMethod == 15 || bxwfc_playMethod == 75 || bxwfc_playMethod == 77){
        notes = LotteryStorage["bxwfc"]["line1"].length *
            LotteryStorage["bxwfc"]["line2"].length *
            LotteryStorage["bxwfc"]["line3"].length ;
    }else if(bxwfc_playMethod == 39 || bxwfc_playMethod == 28 || bxwfc_playMethod == 17){
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["bxwfc"]["line1"][i]);
        };
    }else if(bxwfc_playMethod == 41 || bxwfc_playMethod == 30 || bxwfc_playMethod == 19){
        notes = mathUtil.getACombination(LotteryStorage["bxwfc"]["line1"].length,2);
    }else if(bxwfc_playMethod == 42 || bxwfc_playMethod == 31 || bxwfc_playMethod == 20 || bxwfc_playMethod == 68 || bxwfc_playMethod == 73){
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,3);
    }else if(bxwfc_playMethod == 43 || bxwfc_playMethod == 32 || bxwfc_playMethod == 21){
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["bxwfc"]["line1"][i]);
        };
    }else if(bxwfc_playMethod == 48 || bxwfc_playMethod == 55 || bxwfc_playMethod == 74 || bxwfc_playMethod == 76){
        notes = LotteryStorage["bxwfc"]["line1"].length *
            LotteryStorage["bxwfc"]["line2"].length ;
    }else if(bxwfc_playMethod == 50 || bxwfc_playMethod == 57){
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["bxwfc"]["line1"][i]);
        };
    }else if(bxwfc_playMethod == 52 || bxwfc_playMethod == 59){
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,2);
    }else if(bxwfc_playMethod == 53 || bxwfc_playMethod == 60){
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["bxwfc"]["line1"][i]);
        };
    }else if(bxwfc_playMethod == 62){
        notes = LotteryStorage["bxwfc"]["line1"].length +
            LotteryStorage["bxwfc"]["line2"].length +
            LotteryStorage["bxwfc"]["line3"].length +
            LotteryStorage["bxwfc"]["line4"].length +
            LotteryStorage["bxwfc"]["line5"].length;
    }else if(bxwfc_playType == 13 || bxwfc_playType == 14 || bxwfc_playMethod == 8 || bxwfc_playMethod == 71
        || bxwfc_playMethod == 24 || bxwfc_playMethod == 25 || bxwfc_playMethod == 35 || bxwfc_playMethod == 36 || bxwfc_playMethod == 46
        || bxwfc_playMethod == 47 || bxwfc_playMethod == 63 || bxwfc_playMethod == 65 || bxwfc_playMethod == 67 || bxwfc_playMethod == 69 ){
        notes = LotteryStorage["bxwfc"]["line1"].length ;
    }else if(bxwfc_playMethod == 78){
        notes = LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line2"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line3"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line4"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line3"].length +
            LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line4"].length +
            LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line4"].length +
            LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line4"].length * LotteryStorage["bxwfc"]["line5"].length;
    }else if (bxwfc_playMethod == 80) {
        if ($("#bxwfc_tab .button.red").size() < 2) {
            notes = 0;
        }else{
            for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
                notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["bxwfc"]["line1"][i]);
            };
            notes *= mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,2);
        }
    }else if (bxwfc_playMethod == 81) {
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,2) * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,2);
    }else if (bxwfc_playMethod == 83) {
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["bxwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,2);
    }else if (bxwfc_playMethod == 84) {
        notes = LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line3"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line4"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line4"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line4"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line4"].length +
            LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line4"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line4"].length * LotteryStorage["bxwfc"]["line5"].length ;
    }else if (bxwfc_playMethod == 86) {
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["bxwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,3);
    }else if (bxwfc_playMethod == 87) {
        notes = mathUtil.getACombination(LotteryStorage["bxwfc"]["line1"].length,2) * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,3);
    }else if (bxwfc_playMethod == 89) {
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,3) * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,3);
    }else if (bxwfc_playMethod == 92) {
        for (var i = 0; i < LotteryStorage["bxwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["bxwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,3);
    }else if (bxwfc_playMethod == 93) {
        notes = LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line4"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line4"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line1"].length * LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line4"].length * LotteryStorage["bxwfc"]["line5"].length +
            LotteryStorage["bxwfc"]["line2"].length * LotteryStorage["bxwfc"]["line3"].length * LotteryStorage["bxwfc"]["line4"].length * LotteryStorage["bxwfc"]["line5"].length;
    }else if (bxwfc_playMethod == 95) {
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,4)
            * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,4);
    }else if (bxwfc_playMethod == 96) {
        if (LotteryStorage["bxwfc"]["line1"].length >= 1 && LotteryStorage["bxwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["bxwfc"]["line1"],LotteryStorage["bxwfc"]["line2"])
                * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else if (bxwfc_playMethod == 97) {
        notes = mathUtil.getCCombination(LotteryStorage["bxwfc"]["line1"].length,2) * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,4);
    }else if (bxwfc_playMethod == 98) {
        if (LotteryStorage["bxwfc"]["line1"].length >= 1 && LotteryStorage["bxwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["bxwfc"]["line1"],LotteryStorage["bxwfc"]["line2"]) * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else{
        notes = bxwfcValidData($("#bxwfc_single").val());
    }

    if(bxwfc_sntuo == 3 || bxwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","bxwfc"),LotteryInfo.getMethodId("ssc",bxwfc_playMethod))){
    }else{
        if(parseInt($('#bxwfc_modeId').val()) == 8){
            $("#bxwfc_random").hide();
        }else{
            $("#bxwfc_random").show();
        }
    }

    //验证是否为空
    if( $("#bxwfc_beiNum").val() =="" || parseInt($("#bxwfc_beiNum").val()) == 0){
        $("#bxwfc_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#bxwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#bxwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#bxwfc_zhushu').text(notes);
        if($("#bxwfc_modeId").val() == "8"){
            $('#bxwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bxwfc_beiNum").val()),0.002));
        }else if ($("#bxwfc_modeId").val() == "2"){
            $('#bxwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bxwfc_beiNum").val()),0.2));
        }else if ($("#bxwfc_modeId").val() == "1"){
            $('#bxwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bxwfc_beiNum").val()),0.02));
        }else{
            $('#bxwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bxwfc_beiNum").val()),2));
        }
    } else {
        $('#bxwfc_zhushu').text(0);
        $('#bxwfc_money').text(0);
    }
    bxwfc_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('bxwfc',bxwfc_playMethod);
}

/**
 * [bxwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function bxwfc_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#bxwfc_queding").bind('click', function(event) {
        bxwfc_rebate = $("#bxwfc_fandian option:last").val();
        if(parseInt($('#bxwfc_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        bxwfc_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#bxwfc_modeId').val()) == 8){
            if (Number($('#bxwfc_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('bxwfc',bxwfc_playMethod);

        submitParams.lotteryType = "bxwfc";
        var play = LotteryInfo.getPlayName("ssc",bxwfc_playType);
        var playMethod = LotteryInfo.getMethodName("ssc",bxwfc_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = bxwfc_playType;
        submitParams.playMethodIndex = bxwfc_playMethod;
        var selectedBalls = [];
        if(bxwfc_playMethod == 0 || bxwfc_playMethod == 3 || bxwfc_playMethod == 4
            || bxwfc_playMethod == 5 || bxwfc_playMethod == 6 || bxwfc_playMethod == 7
            || bxwfc_playMethod == 9 || bxwfc_playMethod == 12 || bxwfc_playMethod == 14
            || bxwfc_playMethod == 37 || bxwfc_playMethod == 26 || bxwfc_playMethod == 15
            || bxwfc_playMethod == 48 || bxwfc_playMethod == 55 || bxwfc_playMethod == 74 || bxwfc_playType == 9){
            $("#bxwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(bxwfc_playMethod == 2 || bxwfc_playMethod == 8 || bxwfc_playMethod == 11 || bxwfc_playMethod == 13 || bxwfc_playMethod == 24
            || bxwfc_playMethod == 39 || bxwfc_playMethod == 28 || bxwfc_playMethod == 17 || bxwfc_playMethod == 18 || bxwfc_playMethod == 25
            || bxwfc_playMethod == 22 || bxwfc_playMethod == 33 || bxwfc_playMethod == 44 || bxwfc_playMethod == 54 || bxwfc_playMethod == 61
            || bxwfc_playMethod == 41 || bxwfc_playMethod == 42 || bxwfc_playMethod == 43 || bxwfc_playMethod == 29 || bxwfc_playMethod == 35
            || bxwfc_playMethod == 30 || bxwfc_playMethod == 31 || bxwfc_playMethod == 32 || bxwfc_playMethod == 40 || bxwfc_playMethod == 36
            || bxwfc_playMethod == 19 || bxwfc_playMethod == 20 || bxwfc_playMethod == 21 || bxwfc_playMethod == 46 || bxwfc_playMethod == 47
            || bxwfc_playMethod == 50 || bxwfc_playMethod == 57 || bxwfc_playType == 8 || bxwfc_playMethod == 51 || bxwfc_playMethod == 58
            || bxwfc_playMethod == 52 || bxwfc_playMethod == 53|| bxwfc_playMethod == 59 || bxwfc_playMethod == 60 || bxwfc_playType == 13 || bxwfc_playType == 14){
            $("#bxwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(bxwfc_playType == 7 || bxwfc_playMethod == 78 || bxwfc_playMethod == 84 || bxwfc_playMethod == 93){
            $("#bxwfc_ballView div.ballView").each(function(){
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
        }else if(bxwfc_playMethod == 80 || bxwfc_playMethod == 81 || bxwfc_playMethod == 83
            || bxwfc_playMethod == 86 || bxwfc_playMethod == 87 || bxwfc_playMethod == 89
            || bxwfc_playMethod == 92 || bxwfc_playMethod == 95 || bxwfc_playMethod == 97){
            $("#bxwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            var temp = selectedBalls.join(",") + "#";

            if ($("#bxwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#bxwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#bxwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#bxwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#bxwfc_tab5").hasClass("button red")) {
                temp += "个";
            };

            submitParams.nums = temp;
        }else if (bxwfc_playMethod == 96 || bxwfc_playMethod == 98) {
            $("#bxwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            var temp = selectedBalls.join("|") + "#";
            if ($("#bxwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#bxwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#bxwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#bxwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#bxwfc_tab5").hasClass("button red")) {
                temp += "个";
            };
            submitParams.nums = temp;
        }else{
        	//去错误号
	    	bxwfcValidateData("submit");
            var array = handleSingleStr($("#bxwfc_single").val());
            if(bxwfc_playMethod == 1 ){
                submitParams.nums = array.join(" ");
            }else if(bxwfc_playMethod == 10 || bxwfc_playMethod == 38 || bxwfc_playMethod == 27
                || bxwfc_playMethod == 16 || bxwfc_playMethod == 49 || bxwfc_playMethod == 56){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join("|");
                    }else{
                        temp = temp + array[i].split("").join("|") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(bxwfc_playMethod == 45 || bxwfc_playMethod == 34 || bxwfc_playMethod == 23){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(bxwfc_playMethod == 79 || bxwfc_playMethod == 82 || bxwfc_playMethod == 85 || bxwfc_playMethod == 88 ||
                bxwfc_playMethod == 89 || bxwfc_playMethod == 90 || bxwfc_playMethod == 91 || bxwfc_playMethod == 94){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                temp +="#";
                if ($("#bxwfc_tab1").hasClass("button red")) {
                    temp += "万";
                };
                if ($("#bxwfc_tab2").hasClass("button red")) {
                    temp += "千";
                };
                if ($("#bxwfc_tab3").hasClass("button red")) {
                    temp += "百";
                };
                if ($("#bxwfc_tab4").hasClass("button red")) {
                    temp += "十";
                };
                if ($("#bxwfc_tab5").hasClass("button red")) {
                    temp += "个";
                };

                submitParams.nums = temp;
            }
        }
        localStorageUtils.setParam("playMode",$("#bxwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#bxwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#bxwfc_fandian").val());
        submitParams.notes = $('#bxwfc_zhushu').html();
        submitParams.sntuo = bxwfc_sntuo;
        submitParams.multiple = $('#bxwfc_beiNum').val();  //requirement
        submitParams.rebates = $('#bxwfc_fandian').val();  //requirement
        submitParams.playMode = $('#bxwfc_modeId').val();  //requirement
        submitParams.money = $('#bxwfc_money').html();  //requirement
        submitParams.award = $('#bxwfc_minAward').html();  //奖金
        submitParams.maxAward = $('#bxwfc_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#bxwfc_ballView").empty();
        bxwfc_qingkongAll();
    });
}

/**
 * [bxwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function bxwfc_randomOne(){
    bxwfc_qingkongAll();
    if(bxwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        LotteryStorage["bxwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["bxwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["bxwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["bxwfc"]["line4"].push(redBallArray[3]+"");
        LotteryStorage["bxwfc"]["line5"].push(redBallArray[4]+"");

        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line2"], function(k, v){
            $("#" + "bxwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line3"], function(k, v){
            $("#" + "bxwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line4"], function(k, v){
            $("#" + "bxwfc_line4" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line5"], function(k, v){
            $("#" + "bxwfc_line5" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["bxwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        LotteryStorage["bxwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["bxwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["bxwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["bxwfc"]["line4"].push(redBallArray[3]+"");

        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line2"], function(k, v){
            $("#" + "bxwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line3"], function(k, v){
            $("#" + "bxwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line4"], function(k, v){
            $("#" + "bxwfc_line4" + v).toggleClass("redBalls_active");
        });

    }else if(bxwfc_playMethod == 37 || bxwfc_playMethod == 26 || bxwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        LotteryStorage["bxwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["bxwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["bxwfc"]["line3"].push(redBallArray[2]+"");

        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line2"], function(k, v){
            $("#" + "bxwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line3"], function(k, v){
            $("#" + "bxwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 41 || bxwfc_playMethod == 30 || bxwfc_playMethod == 19 || bxwfc_playMethod == 68
        || bxwfc_playMethod == 52 || bxwfc_playMethod == 64 || bxwfc_playMethod == 66
        || bxwfc_playMethod == 59 || bxwfc_playMethod == 70 || bxwfc_playMethod == 72){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["bxwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 42 || bxwfc_playMethod == 31 || bxwfc_playMethod == 20 || bxwfc_playMethod == 73){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["bxwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 39 || bxwfc_playMethod == 28 || bxwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        LotteryStorage["bxwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 43 || bxwfc_playMethod == 32 || bxwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        LotteryStorage["bxwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 48 || bxwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        LotteryStorage["bxwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["bxwfc"]["line2"].push(redBallArray[1]+"");

        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line2"], function(k, v){
            $("#" + "bxwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 25 || bxwfc_playMethod == 36 || bxwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["bxwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 50 || bxwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        LotteryStorage["bxwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 53 || bxwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        LotteryStorage["bxwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["bxwfc"]["line"+line].push(number+"");
        $.each(LotteryStorage["bxwfc"]["line"+line], function(k, v){
            $("#" + "bxwfc_line" + line + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 63 || bxwfc_playMethod == 67 || bxwfc_playMethod == 69 || bxwfc_playMethod == 71 || bxwfc_playType == 13
        || bxwfc_playMethod == 65 || bxwfc_playMethod == 18 || bxwfc_playMethod == 29 || bxwfc_playMethod == 40 || bxwfc_playMethod == 22
        || bxwfc_playMethod == 33 || bxwfc_playMethod == 44 || bxwfc_playMethod == 54 || bxwfc_playMethod == 61
        || bxwfc_playMethod == 24 || bxwfc_playMethod == 35 || bxwfc_playMethod == 46 || bxwfc_playMethod == 51 || bxwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["bxwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 74 || bxwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        LotteryStorage["bxwfc"]["line1"].push(array[0]+"");
        LotteryStorage["bxwfc"]["line2"].push(array[1]+"");
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line2"], function(k, v){
            $("#" + "bxwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 75 || bxwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        LotteryStorage["bxwfc"]["line1"].push(array[0]+"");
        LotteryStorage["bxwfc"]["line2"].push(array[1]+"");
        LotteryStorage["bxwfc"]["line3"].push(array[2]+"");
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line2"], function(k, v){
            $("#" + "bxwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line3"], function(k, v){
            $("#" + "bxwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);
        LotteryStorage["bxwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["bxwfc"]["line"+lines[1]].push(array[1]+"");
        $.each(LotteryStorage["bxwfc"]["line"+lines[0]], function(k, v){
            $("#" + "bxwfc_line" + lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line"+lines[1]], function(k, v){
            $("#" + "bxwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        LotteryStorage["bxwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["bxwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["bxwfc"]["line"+lines[2]].push(array[2]+"");

        $.each(LotteryStorage["bxwfc"]["line"+lines[0]], function(k, v){
            $("#" + "bxwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line"+lines[1]], function(k, v){
            $("#" + "bxwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line"+lines[0]], function(k, v){
            $("#" + "bxwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        LotteryStorage["bxwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["bxwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["bxwfc"]["line"+lines[2]].push(array[2]+"");
        LotteryStorage["bxwfc"]["line"+lines[3]].push(array[3]+"");

        $.each(LotteryStorage["bxwfc"]["line"+lines[0]], function(k, v){
            $("#" + "bxwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line"+lines[1]], function(k, v){
            $("#" + "bxwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line"+lines[2]], function(k, v){
            $("#" + "bxwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["bxwfc"]["line"+lines[3]], function(k, v){
            $("#" + "bxwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
        });
    }else if(bxwfc_playType == 14){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["bxwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["bxwfc"]["line1"], function(k, v){
            $("#" + "bxwfc_line1" + v).toggleClass("redBalls_active");
        });
    }
    bxwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function bxwfc_checkOutRandom(playMethod){
    var obj = new Object();
    if(bxwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(bxwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(bxwfc_playMethod == 18 || bxwfc_playMethod == 29 || bxwfc_playMethod == 40){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
        }
    }else if(bxwfc_playMethod == 22 || bxwfc_playMethod == 33 || bxwfc_playMethod == 44){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 54;
    }else if(bxwfc_playMethod == 54 || bxwfc_playMethod == 61){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 9;
    }
    else if(bxwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(bxwfc_playMethod == 37 || bxwfc_playMethod == 26 || bxwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(bxwfc_playMethod == 39 || bxwfc_playMethod == 28 || bxwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        obj.nums = number;
        obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
    }else if(bxwfc_playMethod == 41 || bxwfc_playMethod == 30 || bxwfc_playMethod == 19){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(bxwfc_playMethod == 52 || bxwfc_playMethod == 59 || bxwfc_playMethod == 64 || bxwfc_playMethod == 66 || bxwfc_playMethod == 68
        ||bxwfc_playMethod == 70 || bxwfc_playMethod == 72){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(bxwfc_playMethod == 42 || bxwfc_playMethod == 31 || bxwfc_playMethod == 20 || bxwfc_playMethod == 73){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(bxwfc_playMethod == 43 || bxwfc_playMethod == 32 || bxwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        obj.nums = number;
        obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
    }else if(bxwfc_playMethod == 48 || bxwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(bxwfc_playMethod == 50 || bxwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
    }else if(bxwfc_playMethod == 53 || bxwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
    }else if(bxwfc_playMethod == 62){
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
    }else if(bxwfc_playMethod == 63 || bxwfc_playMethod == 65 || bxwfc_playMethod == 67 || bxwfc_playMethod == 69 || bxwfc_playMethod == 71
        || bxwfc_playMethod == 24 || bxwfc_playMethod == 35 || bxwfc_playMethod == 46){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 1;
    }else if(bxwfc_playMethod == 25 || bxwfc_playMethod == 36 || bxwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        var array = ["豹子","顺子","对子","半顺","杂六"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(bxwfc_playMethod == 51 || bxwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
        }
    }else if(bxwfc_playMethod == 74 || bxwfc_playMethod == 76){
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
    }else if(bxwfc_playMethod == 75 || bxwfc_playMethod == 77){
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
    }else if(bxwfc_playMethod == 78){
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
    }else if(bxwfc_playMethod == 84){
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
    }else if(bxwfc_playMethod == 93){
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
    obj.sntuo = bxwfc_sntuo;
    obj.multiple = 1;
    obj.rebates = bxwfc_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('bxwfc',bxwfc_playMethod,obj);  //机选奖金计算
    obj.award = $('#bxwfc_minAward').html();     //奖金
    obj.maxAward = $('#bxwfc_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [bxwfcValidateData 单式数据验证]
 */
function bxwfcValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#bxwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
    bxwfcValidData(textStr,type);
}

function bxwfcValidData(str,type){
    if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
        array,
        result,
        content = {};
    if(bxwfc_playMethod == 1){
        content.str = str;
        content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 10){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 38 || bxwfc_playMethod == 27 || bxwfc_playMethod == 16){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 45 || bxwfc_playMethod == 34 || bxwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 49 || bxwfc_playMethod == 56){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 79){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,2);
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 82){
        content.str = str;
        content.weishu = 2;
        content.duizi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,2);
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 85){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,3);
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 88){
        content.str = str;
        content.weishu = 3;
        content.zusan = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,3);
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 90){
        content.str = str;
        content.weishu = 3;
        content.zuliu = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,3);
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 91){
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,3);
        bxwfcShowFooter(true,notes);
    }else if(bxwfc_playMethod == 94){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bxwfc_tab .button.red").size() ,4);
        bxwfcShowFooter(true,notes);
    }

    $('#bxwfc_delRepeat').off('click');
    $('#bxwfc_delRepeat').on('click',function () {
        content.str = $('#bxwfc_single').val() ? $('#bxwfc_single').val() : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        array = rptResult.num || [];
        notes = rptResult.length;
        bxwfcShowFooter(true,notes);
        $("#bxwfc_single").val(array.join(" "));
    });

    $("#bxwfc_single").val(array.join(" "));
    return notes;
}

function bxwfcShowFooter(isValid,notes){
    $('#bxwfc_zhushu').text(notes);
    if($("#bxwfc_modeId").val() == "8"){
        $('#bxwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bxwfc_beiNum").val()),0.002));
    }else if ($("#bxwfc_modeId").val() == "2"){
        $('#bxwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bxwfc_beiNum").val()),0.2));
    }else if ($("#bxwfc_modeId").val() == "1"){
        $('#bxwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bxwfc_beiNum").val()),0.02));
    }else{
        $('#bxwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bxwfc_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    bxwfc_initFooterButton();
    calcAwardWin('bxwfc',bxwfc_playMethod);  //计算奖金和盈利
}