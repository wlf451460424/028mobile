var hgydwfc_playType = 2;
var hgydwfc_playMethod = 15;
var hgydwfc_sntuo = 0;
var hgydwfc_rebate;
var hgydwfcScroll;

//进入这个页面时调用
function hgydwfcPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hgydwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hgydwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hgydwfcPageUnloadedPanel(){
    $("#hgydwfc_queding").off('click');
    $("#hgydwfcPage_back").off('click');
    $("#hgydwfc_ballView").empty();
    $("#hgydwfcSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="hgydwfcPlaySelect"></select>');
    $("#hgydwfcSelect").append($select);
}

//入口函数
function hgydwfc_init(){
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
    $("#hgydwfc_title").html(LotteryInfo.getLotteryNameByTag("hgydwfc"));
    for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
                var name = LotteryInfo.getMethodName("ssc",j);
                if(i == hgydwfc_playType && j == hgydwfc_playMethod){
                    $play.append('<option value="hgydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="hgydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hgydwfc_playMethod,onShowArray)>-1 ){
						hgydwfc_playType = i;
						hgydwfc_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hgydwfcPlaySelect").append($play);
		}
    }
    
    if($("#hgydwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("hgydwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:hgydwfcChangeItem
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

    GetLotteryInfo("hgydwfc",function (){
        hgydwfcChangeItem("hgydwfc"+hgydwfc_playMethod);
    });

    //添加滑动条
    if(!hgydwfcScroll){
        hgydwfcScroll = new IScroll('#hgydwfcContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("hgydwfc",LotteryInfo.getLotteryIdByTag("hgydwfc"));

    //获取上一期开奖
    queryLastPrize("hgydwfc");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('hgydwfc');

    //机选选号
    $("#hgydwfc_random").off('click');
    $("#hgydwfc_random").on('click', function(event) {
        hgydwfc_randomOne();
    });
    
    $("#hgydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",hgydwfc_playMethod));
	//玩法说明
	$("#hgydwfc_paly_shuoming").off('click');
	$("#hgydwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hgydwfc_shuoming").text());
	});

    //返回
    $("#hgydwfcPage_back").on('click', function(event) {
        // hgydwfc_playType = 2;
        // hgydwfc_playMethod = 15;
        $("#hgydwfc_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        hgydwfc_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("hgydwfc");//清空
    hgydwfc_submitData();
}

function hgydwfcResetPlayType(){
    hgydwfc_playType = 2;
    hgydwfc_playMethod = 15;
}

function hgydwfcChangeItem(val) {
    hgydwfc_qingkongAll();
    var temp = val.substring("hgydwfc".length,val.length);
    if(val == "hgydwfc0"){
        //直选复式
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 0;
        createFiveLineLayout("hgydwfc", function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc1"){
        //直选单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 1;
        $("#hgydwfc_ballView").empty();
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc2"){
        //组选120
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 2;
        createOneLineLayout("hgydwfc","至少选择5个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc3"){
        //组选60
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc4"){
        //组选30
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 4;
        var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc5"){
        //组选20
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 5;
        var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc6"){
        //组选10
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 6;
        var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc7"){
        //组选5
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 7;
        var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc8"){
        //总和大小单双
        $("#hgydwfc_random").show();
        var num = ["大","小","单","双"];
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 0;
        hgydwfc_playMethod = 8;
        createNonNumLayout("hgydwfc",hgydwfc_playMethod,num,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc9"){
        //直选复式
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 1;
        hgydwfc_playMethod = 9;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createFourLineLayout("hgydwfc",tips, function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc10"){
        //直选单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 1;
        hgydwfc_playMethod = 10;
        $("#hgydwfc_ballView").empty();
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc11"){
        //组选24
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 1;
        hgydwfc_playMethod = 11;
        createOneLineLayout("hgydwfc","至少选择4个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc12"){
        //组选12
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 1;
        hgydwfc_playMethod = 12;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc13"){
        //组选6
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 1;
        hgydwfc_playMethod = 13;
        createOneLineLayout("hgydwfc","二重号:至少选择2个号码",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc14"){
        //组选4
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 1;
        hgydwfc_playMethod = 14;
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc15"){
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 15;
        var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createThreeLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc16"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 16;
        $("#hgydwfc_ballView").empty();
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc17"){
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 17;
        createSumLayout("hgydwfc",0,27,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc18"){
        //直选跨度
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 18;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc19"){
        //后三组三
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 19;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc20"){
        //后三组六
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 20;
        createOneLineLayout("hgydwfc","至少选择3个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc21"){
        //后三和值
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 21;
        createSumLayout("hgydwfc",1,26,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc22"){
        //后三组选包胆
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 22;
        hgydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("hgydwfc",array,["请选择一个号码"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc23"){
        //后三混合组选
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 23;
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc24"){
        //和值尾数
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 24;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc25"){
        //特殊号
        $("#hgydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 2;
        hgydwfc_playMethod = 25;
        createNonNumLayout("hgydwfc",hgydwfc_playMethod,num,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc26"){
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 26;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
        createThreeLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc27"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 27;
        $("#hgydwfc_ballView").empty();
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc28"){
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 28;
        createSumLayout("hgydwfc",0,27,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc29"){
        //直选跨度
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 29;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc30"){
        //中三组三
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 30;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc31"){
        //中三组六
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 31;
        createOneLineLayout("hgydwfc","至少选择3个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc32"){
        //中三和值
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 32;
        createSumLayout("hgydwfc",1,26,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc33"){
        //中三组选包胆
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 33;
        hgydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("hgydwfc",array,["请选择一个号码"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc34"){
        //中三混合组选
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 34;
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc35"){
        //和值尾数
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 35;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc36"){
        //特殊号
        $("#hgydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 3;
        hgydwfc_playMethod = 36;
        createNonNumLayout("hgydwfc",hgydwfc_playMethod,num,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc37"){
        //直选复式
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 37;
        var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
        createThreeLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc38"){
        //直选单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 38;
        $("#hgydwfc_ballView").empty();
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc39"){
        //和值
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 39;
        createSumLayout("hgydwfc",0,27,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc40"){
        //直选跨度
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 40;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc41"){
        //前三组三
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 41;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc42"){
        //前三组六
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 42;
        createOneLineLayout("hgydwfc","至少选择3个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc43"){
        //前三和值
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 43;
        createSumLayout("hgydwfc",1,26,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc44"){
        //前三组选包胆
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 44;
        hgydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("hgydwfc",array,["请选择一个号码"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc45"){
        //前三混合组选
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 45;
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc46"){
        //和值尾数
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 46;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc47"){
        //特殊号
        $("#hgydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 4;
        hgydwfc_playMethod = 47;
        createNonNumLayout("hgydwfc",hgydwfc_playMethod,num,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc48"){
        //后二复式
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 5;
        hgydwfc_playMethod = 48;
        var tips = ["十位：可选1-10个","个位：可选1-10个"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc49"){
        //后二单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 5;
        hgydwfc_playMethod = 49;
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc50"){
        //后二和值
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 5;
        hgydwfc_playMethod = 50;
        createSumLayout("hgydwfc",0,18,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc51"){
        //直选跨度
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 5;
        hgydwfc_playMethod = 51;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc52"){
        //后二组选
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 5;
        hgydwfc_playMethod = 52;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc53"){
        //后二和值
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 5;
        hgydwfc_playMethod = 53;
        createSumLayout("hgydwfc",1,17,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc54"){
        //后二组选包胆
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 5;
        hgydwfc_playMethod = 54;
        hgydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("hgydwfc",array,["请选择一个号码"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc55"){
        //前二复式
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 6;
        hgydwfc_playMethod = 55;
        var tips = ["万位：可选1-10个","千位：可选1-10个"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc56"){
        //前二单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 6;
        hgydwfc_playMethod = 56;
        hgydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
    }else if(val == "hgydwfc57"){
        //前二和值
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 6;
        hgydwfc_playMethod = 57;
        createSumLayout("hgydwfc",0,18,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc58"){
        //直选跨度
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 6;
        hgydwfc_playMethod = 58;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc59"){
        //前二组选
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 6;
        hgydwfc_playMethod = 59;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc60"){
        //前二和值
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 6;
        hgydwfc_playMethod = 60;
        createSumLayout("hgydwfc",1,17,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc61"){
        //前二组选包胆
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 6;
        hgydwfc_playMethod = 61;
        hgydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("hgydwfc",array,["请选择一个号码"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc62"){
        //定位复式
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 7;
        hgydwfc_playMethod = 62;
        createFiveLineLayout("hgydwfc", function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc63"){
        //后三一码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 63;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc64"){
        //后三二码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 64;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc65"){
        //前三一码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 65;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc66"){
        //前三二码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 66;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc67"){
        //后四一码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 67;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc68"){
        //后四二码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 68;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc69"){
        //前四一码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 69;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc70"){
        //前四二码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 70;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc71"){
        //五星一码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 71;
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc72"){
        //五星二码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 72;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc73"){
        //五星三码
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 8;
        hgydwfc_playMethod = 73;
        createOneLineLayout("hgydwfc","至少选择3个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc74"){
        //后二大小单双
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 9;
        hgydwfc_playMethod = 74;
        createTextBallTwoLayout("hgydwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc75"){
        //后三大小单双
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 9;
        hgydwfc_playMethod = 75;
        createTextBallThreeLayout("hgydwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc76"){
        //前二大小单双
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 9;
        hgydwfc_playMethod = 76;
        createTextBallTwoLayout("hgydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc77"){
        //前三大小单双
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 9;
        hgydwfc_playMethod = 77;
        createTextBallThreeLayout("hgydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc78"){
        //直选复式
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 10;
        hgydwfc_playMethod = 78;
        createFiveLineLayout("hgydwfc",function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc79"){
        //直选单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 10;
        hgydwfc_playMethod = 79;
        var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
        createRenXuanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc80"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 10;
        hgydwfc_playMethod = 80;
        createSumLayout("hgydwfc",0,18,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc81"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 10;
        hgydwfc_playMethod = 81;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc82"){
        //组选单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 10;
        hgydwfc_playMethod = 82;
        var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
        createRenXuanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc83"){
        //组选和值
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 10;
        hgydwfc_playMethod = 83;
        createSumLayout("hgydwfc",1,17,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc84"){
        //直选复式
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 84;
        createFiveLineLayout("hgydwfc", function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc85"){
        //直选单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 85;
        var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
        createRenXuanSanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc86"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 86;
        createSumLayout("hgydwfc",0,27,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanSanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc87"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 87;
        createOneLineLayout("hgydwfc","至少选择2个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanSanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc88"){
        //组选单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 88;
        var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
        createRenXuanSanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc89"){
        //组选和值
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 89;
        createOneLineLayout("hgydwfc","至少选择3个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanSanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc90"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 90;
        var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
        createRenXuanSanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc91"){
        //混合组选
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 91;
        var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
        createRenXuanSanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc92"){
        //组选和值
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 11;
        hgydwfc_playMethod = 92;
        createSumLayout("hgydwfc",1,26,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanSanLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc93"){
        $("#hgydwfc_random").show();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 12;
        hgydwfc_playMethod = 93;
        createFiveLineLayout("hgydwfc", function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc94"){
        //直选单式
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 3;
        hgydwfc_playType = 12;
        hgydwfc_playMethod = 94;
        var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("hgydwfc",tips);
        createRenXuanSiLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc95"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 12;
        hgydwfc_playMethod = 95;
        createOneLineLayout("hgydwfc","至少选择4个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanSiLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc96"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 12;
        hgydwfc_playMethod = 96;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanSiLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc97"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 12;
        hgydwfc_playMethod = 97;
        $("#hgydwfc_ballView").empty();
        createOneLineLayout("hgydwfc","二重号:至少选择2个号码",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanSiLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc98"){
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 12;
        hgydwfc_playMethod = 98;
        $("#hgydwfc_ballView").empty();
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("hgydwfc",tips,0,9,false,function(){
            hgydwfc_calcNotes();
        });
        createRenXuanSiLayout("hgydwfc",hgydwfc_playMethod,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc99"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 13;
        hgydwfc_playMethod = 99;
        $("#hgydwfc_ballView").empty();
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc100"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 13;
        hgydwfc_playMethod = 100;
        $("#hgydwfc_ballView").empty();
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc101"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 13;
        hgydwfc_playMethod = 101;
        $("#hgydwfc_ballView").empty();
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc102"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 13;
        hgydwfc_playMethod = 102;
        $("#hgydwfc_ballView").empty();
        createOneLineLayout("hgydwfc","至少选择1个",0,9,false,function(){
            hgydwfc_calcNotes();
        });
        hgydwfc_qingkongAll();
    }else if(val == "hgydwfc103"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 103;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc104"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 104;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc105"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 105;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc106"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 106;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc107"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 107;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc108"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 108;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc109"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 109;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc110"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 110;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc111"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 111;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }else if(val == "hgydwfc112"){
        hgydwfc_qingkongAll();
        $("#hgydwfc_random").hide();
        hgydwfc_sntuo = 0;
        hgydwfc_playType = 14;
        hgydwfc_playMethod = 112;
        createTextBallOneLayout("hgydwfc",["龙","虎","和"],["至少选择一个"],function(){
            hgydwfc_calcNotes();
        });
    }

    if(hgydwfcScroll){
        hgydwfcScroll.refresh();
        hgydwfcScroll.scrollTo(0,0,1);
    }
    
    $("#hgydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
    
    initFooterData("hgydwfc",temp);
    hideRandomWhenLi("hgydwfc",hgydwfc_sntuo,hgydwfc_playMethod);
    hgydwfc_calcNotes();
}
/**
 * [hgydwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hgydwfc_initFooterButton(){
    if(hgydwfc_playMethod == 0 || hgydwfc_playMethod == 62 || hgydwfc_playMethod == 78
        || hgydwfc_playMethod == 84 || hgydwfc_playMethod == 93 || hgydwfc_playType == 7){
        if(LotteryStorage["hgydwfc"]["line1"].length > 0 || LotteryStorage["hgydwfc"]["line2"].length > 0 ||
            LotteryStorage["hgydwfc"]["line3"].length > 0 || LotteryStorage["hgydwfc"]["line4"].length > 0 ||
            LotteryStorage["hgydwfc"]["line5"].length > 0){
            $("#hgydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#hgydwfc_qingkong").css("opacity",0.4);
        }
    }else if(hgydwfc_playMethod == 9){
        if(LotteryStorage["hgydwfc"]["line1"].length > 0 || LotteryStorage["hgydwfc"]["line2"].length > 0 ||
            LotteryStorage["hgydwfc"]["line3"].length > 0 || LotteryStorage["hgydwfc"]["line4"].length > 0 ){
            $("#hgydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#hgydwfc_qingkong").css("opacity",0.4);
        }
    }else if(hgydwfc_playMethod == 37 || hgydwfc_playMethod == 4 || hgydwfc_playMethod == 6
        || hgydwfc_playMethod == 26 || hgydwfc_playMethod == 15 || hgydwfc_playMethod == 75 || hgydwfc_playMethod == 77){
        if(LotteryStorage["hgydwfc"]["line1"].length > 0 || LotteryStorage["hgydwfc"]["line2"].length > 0
            || LotteryStorage["hgydwfc"]["line3"].length > 0){
            $("#hgydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#hgydwfc_qingkong").css("opacity",0.4);
        }
    }else if(hgydwfc_playMethod == 3 || hgydwfc_playMethod == 4 || hgydwfc_playMethod == 5
        || hgydwfc_playMethod == 6 || hgydwfc_playMethod == 7 || hgydwfc_playMethod == 12
        || hgydwfc_playMethod == 14 || hgydwfc_playMethod == 48 || hgydwfc_playMethod == 55
        || hgydwfc_playMethod == 74 || hgydwfc_playMethod == 76 || hgydwfc_playMethod == 96 || hgydwfc_playMethod == 98){
        if(LotteryStorage["hgydwfc"]["line1"].length > 0 || LotteryStorage["hgydwfc"]["line2"].length > 0){
            $("#hgydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#hgydwfc_qingkong").css("opacity",0.4);
        }
    }else if(hgydwfc_playMethod == 2 || hgydwfc_playMethod == 8 || hgydwfc_playMethod == 11 || hgydwfc_playMethod == 13 || hgydwfc_playMethod == 39
        || hgydwfc_playMethod == 28 || hgydwfc_playMethod == 17 || hgydwfc_playMethod == 18 || hgydwfc_playMethod == 24 || hgydwfc_playMethod == 41
        || hgydwfc_playMethod == 25 || hgydwfc_playMethod == 29 || hgydwfc_playMethod == 42 || hgydwfc_playMethod == 43 || hgydwfc_playMethod == 30
        || hgydwfc_playMethod == 35 || hgydwfc_playMethod == 36 || hgydwfc_playMethod == 31 || hgydwfc_playMethod == 32 || hgydwfc_playMethod == 19
        || hgydwfc_playMethod == 40 || hgydwfc_playMethod == 46 || hgydwfc_playMethod == 20 || hgydwfc_playMethod == 21 || hgydwfc_playMethod == 50
        || hgydwfc_playMethod == 47 || hgydwfc_playMethod == 51 || hgydwfc_playMethod == 52 || hgydwfc_playMethod == 53 || hgydwfc_playMethod == 57 || hgydwfc_playMethod == 63
        || hgydwfc_playMethod == 58 || hgydwfc_playMethod == 59 || hgydwfc_playMethod == 60 || hgydwfc_playMethod == 65 || hgydwfc_playMethod == 80 || hgydwfc_playMethod == 81 || hgydwfc_playType == 8
        || hgydwfc_playMethod == 83 || hgydwfc_playMethod == 86 || hgydwfc_playMethod == 87 || hgydwfc_playMethod == 22 || hgydwfc_playMethod == 33 || hgydwfc_playMethod == 44
        || hgydwfc_playMethod == 89 || hgydwfc_playMethod == 92 || hgydwfc_playMethod == 95 || hgydwfc_playMethod == 54 || hgydwfc_playMethod == 61
        || hgydwfc_playMethod == 97 || hgydwfc_playType == 13  || hgydwfc_playType == 14){
        if(LotteryStorage["hgydwfc"]["line1"].length > 0){
            $("#hgydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#hgydwfc_qingkong").css("opacity",0.4);
        }
    }else{
        $("#hgydwfc_qingkong").css("opacity",0);
    }

    if($("#hgydwfc_qingkong").css("opacity") == "0"){
        $("#hgydwfc_qingkong").css("display","none");
    }else{
        $("#hgydwfc_qingkong").css("display","block");
    }

    if($('#hgydwfc_zhushu').html() > 0){
        $("#hgydwfc_queding").css("opacity",1.0);
    }else{
        $("#hgydwfc_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  hgydwfc_qingkongAll(){
    $("#hgydwfc_ballView span").removeClass('redBalls_active');
    LotteryStorage["hgydwfc"]["line1"] = [];
    LotteryStorage["hgydwfc"]["line2"] = [];
    LotteryStorage["hgydwfc"]["line3"] = [];
    LotteryStorage["hgydwfc"]["line4"] = [];
    LotteryStorage["hgydwfc"]["line5"] = [];

    localStorageUtils.removeParam("hgydwfc_line1");
    localStorageUtils.removeParam("hgydwfc_line2");
    localStorageUtils.removeParam("hgydwfc_line3");
    localStorageUtils.removeParam("hgydwfc_line4");
    localStorageUtils.removeParam("hgydwfc_line5");

    $('#hgydwfc_zhushu').text(0);
    $('#hgydwfc_money').text(0);
    clearAwardWin("hgydwfc");
    hgydwfc_initFooterButton();
}

/**
 * [hgydwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hgydwfc_calcNotes(){
	$('#hgydwfc_modeId').blur();
	$('#hgydwfc_fandian').blur();
	
    var notes = 0;

    if(hgydwfc_playMethod == 0){
        notes = LotteryStorage["hgydwfc"]["line1"].length *
            LotteryStorage["hgydwfc"]["line2"].length *
            LotteryStorage["hgydwfc"]["line3"].length *
            LotteryStorage["hgydwfc"]["line4"].length *
            LotteryStorage["hgydwfc"]["line5"].length;
    }else if(hgydwfc_playMethod == 2){
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,5);
    }else if(hgydwfc_playMethod == 3){
        if (LotteryStorage["hgydwfc"]["line1"].length >= 1 && LotteryStorage["hgydwfc"]["line2"].length >= 3) {
            notes = getArraySelect(3,LotteryStorage["hgydwfc"]["line1"],LotteryStorage["hgydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(hgydwfc_playMethod == 4){
        if (LotteryStorage["hgydwfc"]["line1"].length >= 2 && LotteryStorage["hgydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(2,LotteryStorage["hgydwfc"]["line2"],LotteryStorage["hgydwfc"]["line1"]);
        }else{
            notes = 0;
        }
    }else if(hgydwfc_playMethod == 5 || hgydwfc_playMethod == 12){
        if (LotteryStorage["hgydwfc"]["line1"].length >= 1 && LotteryStorage["hgydwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["hgydwfc"]["line1"],LotteryStorage["hgydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(hgydwfc_playMethod == 6 || hgydwfc_playMethod == 7 || hgydwfc_playMethod == 14){
        if (LotteryStorage["hgydwfc"]["line1"].length >= 1 && LotteryStorage["hgydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["hgydwfc"]["line1"],LotteryStorage["hgydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(hgydwfc_playMethod == 9){
        notes = LotteryStorage["hgydwfc"]["line1"].length *
            LotteryStorage["hgydwfc"]["line2"].length *
            LotteryStorage["hgydwfc"]["line3"].length *
            LotteryStorage["hgydwfc"]["line4"].length;
    }else if(hgydwfc_playMethod == 18 || hgydwfc_playMethod == 29 || hgydwfc_playMethod == 40){
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["hgydwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
            }
        }
    }else if(hgydwfc_playMethod == 22 || hgydwfc_playMethod == 33 || hgydwfc_playMethod == 44 ){
        notes = 54;
    }else if(hgydwfc_playMethod == 54 || hgydwfc_playMethod == 61){
        notes = 9;
    }else if(hgydwfc_playMethod == 51 || hgydwfc_playMethod == 58){
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["hgydwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 2;
            }
        }
    }else if(hgydwfc_playMethod == 11){
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,4);
    }else if(hgydwfc_playMethod == 13|| hgydwfc_playMethod == 64 || hgydwfc_playMethod == 66 || hgydwfc_playMethod == 68 || hgydwfc_playMethod == 70 || hgydwfc_playMethod == 72){
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,2);
    }else if(hgydwfc_playMethod == 37 || hgydwfc_playMethod == 26 || hgydwfc_playMethod == 15 || hgydwfc_playMethod == 75 || hgydwfc_playMethod == 77){
        notes = LotteryStorage["hgydwfc"]["line1"].length *
            LotteryStorage["hgydwfc"]["line2"].length *
            LotteryStorage["hgydwfc"]["line3"].length ;
    }else if(hgydwfc_playMethod == 39 || hgydwfc_playMethod == 28 || hgydwfc_playMethod == 17){
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hgydwfc"]["line1"][i]);
        };
    }else if(hgydwfc_playMethod == 41 || hgydwfc_playMethod == 30 || hgydwfc_playMethod == 19){
        notes = mathUtil.getACombination(LotteryStorage["hgydwfc"]["line1"].length,2);
    }else if(hgydwfc_playMethod == 42 || hgydwfc_playMethod == 31 || hgydwfc_playMethod == 20 || hgydwfc_playMethod == 68 || hgydwfc_playMethod == 73){
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,3);
    }else if(hgydwfc_playMethod == 43 || hgydwfc_playMethod == 32 || hgydwfc_playMethod == 21){
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hgydwfc"]["line1"][i]);
        };
    }else if(hgydwfc_playMethod == 48 || hgydwfc_playMethod == 55 || hgydwfc_playMethod == 74 || hgydwfc_playMethod == 76){
        notes = LotteryStorage["hgydwfc"]["line1"].length *
            LotteryStorage["hgydwfc"]["line2"].length ;
    }else if(hgydwfc_playMethod == 50 || hgydwfc_playMethod == 57){
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hgydwfc"]["line1"][i]);
        };
    }else if(hgydwfc_playMethod == 52 || hgydwfc_playMethod == 59){
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,2);
    }else if(hgydwfc_playMethod == 53 || hgydwfc_playMethod == 60){
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hgydwfc"]["line1"][i]);
        };
    }else if(hgydwfc_playMethod == 62){
        notes = LotteryStorage["hgydwfc"]["line1"].length +
            LotteryStorage["hgydwfc"]["line2"].length +
            LotteryStorage["hgydwfc"]["line3"].length +
            LotteryStorage["hgydwfc"]["line4"].length +
            LotteryStorage["hgydwfc"]["line5"].length;
    }else if(hgydwfc_playType == 13 || hgydwfc_playType == 14 || hgydwfc_playMethod == 8 || hgydwfc_playMethod == 71
        || hgydwfc_playMethod == 24 || hgydwfc_playMethod == 25 || hgydwfc_playMethod == 35 || hgydwfc_playMethod == 36 || hgydwfc_playMethod == 46
        || hgydwfc_playMethod == 47 || hgydwfc_playMethod == 63 || hgydwfc_playMethod == 65 || hgydwfc_playMethod == 67 || hgydwfc_playMethod == 69 ){
        notes = LotteryStorage["hgydwfc"]["line1"].length ;
    }else if(hgydwfc_playMethod == 78){
        notes = LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line2"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line3"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line4"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line3"].length +
            LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line4"].length +
            LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line4"].length +
            LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line4"].length * LotteryStorage["hgydwfc"]["line5"].length;
    }else if (hgydwfc_playMethod == 80) {
        if ($("#hgydwfc_tab .button.red").size() < 2) {
            notes = 0;
        }else{
            for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
                notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hgydwfc"]["line1"][i]);
            };
            notes *= mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,2);
        }
    }else if (hgydwfc_playMethod == 81) {
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,2);
    }else if (hgydwfc_playMethod == 83) {
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hgydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,2);
    }else if (hgydwfc_playMethod == 84) {
        notes = LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line3"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line4"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line4"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line4"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line4"].length +
            LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line4"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line4"].length * LotteryStorage["hgydwfc"]["line5"].length ;
    }else if (hgydwfc_playMethod == 86) {
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hgydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,3);
    }else if (hgydwfc_playMethod == 87) {
        notes = mathUtil.getACombination(LotteryStorage["hgydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,3);
    }else if (hgydwfc_playMethod == 89) {
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,3) * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,3);
    }else if (hgydwfc_playMethod == 92) {
        for (var i = 0; i < LotteryStorage["hgydwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hgydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,3);
    }else if (hgydwfc_playMethod == 93) {
        notes = LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line4"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line4"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line1"].length * LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line4"].length * LotteryStorage["hgydwfc"]["line5"].length +
            LotteryStorage["hgydwfc"]["line2"].length * LotteryStorage["hgydwfc"]["line3"].length * LotteryStorage["hgydwfc"]["line4"].length * LotteryStorage["hgydwfc"]["line5"].length;
    }else if (hgydwfc_playMethod == 95) {
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,4)
            * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,4);
    }else if (hgydwfc_playMethod == 96) {
        if (LotteryStorage["hgydwfc"]["line1"].length >= 1 && LotteryStorage["hgydwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["hgydwfc"]["line1"],LotteryStorage["hgydwfc"]["line2"])
                * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else if (hgydwfc_playMethod == 97) {
        notes = mathUtil.getCCombination(LotteryStorage["hgydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,4);
    }else if (hgydwfc_playMethod == 98) {
        if (LotteryStorage["hgydwfc"]["line1"].length >= 1 && LotteryStorage["hgydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["hgydwfc"]["line1"],LotteryStorage["hgydwfc"]["line2"]) * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else{
        notes = hgydwfcValidData($("#hgydwfc_single").val());
    }

    if(hgydwfc_sntuo == 3 || hgydwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","hgydwfc"),LotteryInfo.getMethodId("ssc",hgydwfc_playMethod))){
    }else{
        if(parseInt($('#hgydwfc_modeId').val()) == 8){
            $("#hgydwfc_random").hide();
        }else{
            $("#hgydwfc_random").show();
        }
    }

    //验证是否为空
    if( $("#hgydwfc_beiNum").val() =="" || parseInt($("#hgydwfc_beiNum").val()) == 0){
        $("#hgydwfc_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#hgydwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#hgydwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#hgydwfc_zhushu').text(notes);
        if($("#hgydwfc_modeId").val() == "8"){
            $('#hgydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgydwfc_beiNum").val()),0.002));
        }else if ($("#hgydwfc_modeId").val() == "2"){
            $('#hgydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgydwfc_beiNum").val()),0.2));
        }else if ($("#hgydwfc_modeId").val() == "1"){
            $('#hgydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgydwfc_beiNum").val()),0.02));
        }else{
            $('#hgydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgydwfc_beiNum").val()),2));
        }
    } else {
        $('#hgydwfc_zhushu').text(0);
        $('#hgydwfc_money').text(0);
    }
    hgydwfc_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('hgydwfc',hgydwfc_playMethod);
}

/**
 * [hgydwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hgydwfc_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#hgydwfc_queding").bind('click', function(event) {
        hgydwfc_rebate = $("#hgydwfc_fandian option:last").val();
        if(parseInt($('#hgydwfc_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        hgydwfc_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#hgydwfc_modeId').val()) == 8){
            if (Number($('#hgydwfc_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('hgydwfc',hgydwfc_playMethod);

        submitParams.lotteryType = "hgydwfc";
        var play = LotteryInfo.getPlayName("ssc",hgydwfc_playType);
        var playMethod = LotteryInfo.getMethodName("ssc",hgydwfc_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = hgydwfc_playType;
        submitParams.playMethodIndex = hgydwfc_playMethod;
        var selectedBalls = [];
        if(hgydwfc_playMethod == 0 || hgydwfc_playMethod == 3 || hgydwfc_playMethod == 4
            || hgydwfc_playMethod == 5 || hgydwfc_playMethod == 6 || hgydwfc_playMethod == 7
            || hgydwfc_playMethod == 9 || hgydwfc_playMethod == 12 || hgydwfc_playMethod == 14
            || hgydwfc_playMethod == 37 || hgydwfc_playMethod == 26 || hgydwfc_playMethod == 15
            || hgydwfc_playMethod == 48 || hgydwfc_playMethod == 55 || hgydwfc_playMethod == 74 || hgydwfc_playType == 9){
            $("#hgydwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(hgydwfc_playMethod == 2 || hgydwfc_playMethod == 8 || hgydwfc_playMethod == 11 || hgydwfc_playMethod == 13 || hgydwfc_playMethod == 24
            || hgydwfc_playMethod == 39 || hgydwfc_playMethod == 28 || hgydwfc_playMethod == 17 || hgydwfc_playMethod == 18 || hgydwfc_playMethod == 25
            || hgydwfc_playMethod == 22 || hgydwfc_playMethod == 33 || hgydwfc_playMethod == 44 || hgydwfc_playMethod == 54 || hgydwfc_playMethod == 61
            || hgydwfc_playMethod == 41 || hgydwfc_playMethod == 42 || hgydwfc_playMethod == 43 || hgydwfc_playMethod == 29 || hgydwfc_playMethod == 35
            || hgydwfc_playMethod == 30 || hgydwfc_playMethod == 31 || hgydwfc_playMethod == 32 || hgydwfc_playMethod == 40 || hgydwfc_playMethod == 36
            || hgydwfc_playMethod == 19 || hgydwfc_playMethod == 20 || hgydwfc_playMethod == 21 || hgydwfc_playMethod == 46 || hgydwfc_playMethod == 47
            || hgydwfc_playMethod == 50 || hgydwfc_playMethod == 57 || hgydwfc_playType == 8 || hgydwfc_playMethod == 51 || hgydwfc_playMethod == 58
            || hgydwfc_playMethod == 52 || hgydwfc_playMethod == 53|| hgydwfc_playMethod == 59 || hgydwfc_playMethod == 60 || hgydwfc_playType == 13 || hgydwfc_playType == 14){
            $("#hgydwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(hgydwfc_playType == 7 || hgydwfc_playMethod == 78 || hgydwfc_playMethod == 84 || hgydwfc_playMethod == 93){
            $("#hgydwfc_ballView div.ballView").each(function(){
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
        }else if(hgydwfc_playMethod == 80 || hgydwfc_playMethod == 81 || hgydwfc_playMethod == 83
            || hgydwfc_playMethod == 86 || hgydwfc_playMethod == 87 || hgydwfc_playMethod == 89
            || hgydwfc_playMethod == 92 || hgydwfc_playMethod == 95 || hgydwfc_playMethod == 97){
            $("#hgydwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            var temp = selectedBalls.join(",") + "#";

            if ($("#hgydwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#hgydwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#hgydwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#hgydwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#hgydwfc_tab5").hasClass("button red")) {
                temp += "个";
            };

            submitParams.nums = temp;
        }else if (hgydwfc_playMethod == 96 || hgydwfc_playMethod == 98) {
            $("#hgydwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            var temp = selectedBalls.join("|") + "#";
            if ($("#hgydwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#hgydwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#hgydwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#hgydwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#hgydwfc_tab5").hasClass("button red")) {
                temp += "个";
            };
            submitParams.nums = temp;
        }else{
		    //去错误号
		    hgydwfcValidateData("submit");
            var array = handleSingleStr($("#hgydwfc_single").val());
            if(hgydwfc_playMethod == 1 ){
                submitParams.nums = array.join(" ");
            }else if(hgydwfc_playMethod == 10 || hgydwfc_playMethod == 38 || hgydwfc_playMethod == 27
                || hgydwfc_playMethod == 16 || hgydwfc_playMethod == 49 || hgydwfc_playMethod == 56){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join("|");
                    }else{
                        temp = temp + array[i].split("").join("|") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(hgydwfc_playMethod == 45 || hgydwfc_playMethod == 34 || hgydwfc_playMethod == 23){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(hgydwfc_playMethod == 79 || hgydwfc_playMethod == 82 || hgydwfc_playMethod == 85 || hgydwfc_playMethod == 88 ||
                hgydwfc_playMethod == 89 || hgydwfc_playMethod == 90 || hgydwfc_playMethod == 91 || hgydwfc_playMethod == 94){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                temp +="#";
                if ($("#hgydwfc_tab1").hasClass("button red")) {
                    temp += "万";
                };
                if ($("#hgydwfc_tab2").hasClass("button red")) {
                    temp += "千";
                };
                if ($("#hgydwfc_tab3").hasClass("button red")) {
                    temp += "百";
                };
                if ($("#hgydwfc_tab4").hasClass("button red")) {
                    temp += "十";
                };
                if ($("#hgydwfc_tab5").hasClass("button red")) {
                    temp += "个";
                };

                submitParams.nums = temp;
            }
        }
        localStorageUtils.setParam("playMode",$("#hgydwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#hgydwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#hgydwfc_fandian").val());
        submitParams.notes = $('#hgydwfc_zhushu').html();
        submitParams.sntuo = hgydwfc_sntuo;
        submitParams.multiple = $('#hgydwfc_beiNum').val();  //requirement
        submitParams.rebates = $('#hgydwfc_fandian').val();  //requirement
        submitParams.playMode = $('#hgydwfc_modeId').val();  //requirement
        submitParams.money = $('#hgydwfc_money').html();  //requirement
        submitParams.award = $('#hgydwfc_minAward').html();  //奖金
        submitParams.maxAward = $('#hgydwfc_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#hgydwfc_ballView").empty();
        hgydwfc_qingkongAll();
    });
}

/**
 * [hgydwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hgydwfc_randomOne(){
    hgydwfc_qingkongAll();
    if(hgydwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        LotteryStorage["hgydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["hgydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["hgydwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["hgydwfc"]["line4"].push(redBallArray[3]+"");
        LotteryStorage["hgydwfc"]["line5"].push(redBallArray[4]+"");

        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line2"], function(k, v){
            $("#" + "hgydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line3"], function(k, v){
            $("#" + "hgydwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line4"], function(k, v){
            $("#" + "hgydwfc_line4" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line5"], function(k, v){
            $("#" + "hgydwfc_line5" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["hgydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        LotteryStorage["hgydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["hgydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["hgydwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["hgydwfc"]["line4"].push(redBallArray[3]+"");

        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line2"], function(k, v){
            $("#" + "hgydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line3"], function(k, v){
            $("#" + "hgydwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line4"], function(k, v){
            $("#" + "hgydwfc_line4" + v).toggleClass("redBalls_active");
        });

    }else if(hgydwfc_playMethod == 37 || hgydwfc_playMethod == 26 || hgydwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        LotteryStorage["hgydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["hgydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["hgydwfc"]["line3"].push(redBallArray[2]+"");

        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line2"], function(k, v){
            $("#" + "hgydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line3"], function(k, v){
            $("#" + "hgydwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 41 || hgydwfc_playMethod == 30 || hgydwfc_playMethod == 19 || hgydwfc_playMethod == 68
        || hgydwfc_playMethod == 52 || hgydwfc_playMethod == 64 || hgydwfc_playMethod == 66
        || hgydwfc_playMethod == 59 || hgydwfc_playMethod == 70 || hgydwfc_playMethod == 72){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["hgydwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 42 || hgydwfc_playMethod == 31 || hgydwfc_playMethod == 20 || hgydwfc_playMethod == 73){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["hgydwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 39 || hgydwfc_playMethod == 28 || hgydwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        LotteryStorage["hgydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 43 || hgydwfc_playMethod == 32 || hgydwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        LotteryStorage["hgydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 48 || hgydwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        LotteryStorage["hgydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["hgydwfc"]["line2"].push(redBallArray[1]+"");

        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line2"], function(k, v){
            $("#" + "hgydwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 25 || hgydwfc_playMethod == 36 || hgydwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["hgydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 50 || hgydwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        LotteryStorage["hgydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 53 || hgydwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        LotteryStorage["hgydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["hgydwfc"]["line"+line].push(number+"");
        $.each(LotteryStorage["hgydwfc"]["line"+line], function(k, v){
            $("#" + "hgydwfc_line" + line + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 63 || hgydwfc_playMethod == 67 || hgydwfc_playMethod == 69 || hgydwfc_playMethod == 71 || hgydwfc_playType == 13
        || hgydwfc_playMethod == 65 || hgydwfc_playMethod == 18 || hgydwfc_playMethod == 29 || hgydwfc_playMethod == 40 || hgydwfc_playMethod == 22
        || hgydwfc_playMethod == 33 || hgydwfc_playMethod == 44 || hgydwfc_playMethod == 54 || hgydwfc_playMethod == 61
        || hgydwfc_playMethod == 24 || hgydwfc_playMethod == 35 || hgydwfc_playMethod == 46 || hgydwfc_playMethod == 51 || hgydwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["hgydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 74 || hgydwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        LotteryStorage["hgydwfc"]["line1"].push(array[0]+"");
        LotteryStorage["hgydwfc"]["line2"].push(array[1]+"");
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line2"], function(k, v){
            $("#" + "hgydwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 75 || hgydwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        LotteryStorage["hgydwfc"]["line1"].push(array[0]+"");
        LotteryStorage["hgydwfc"]["line2"].push(array[1]+"");
        LotteryStorage["hgydwfc"]["line3"].push(array[2]+"");
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line2"], function(k, v){
            $("#" + "hgydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line3"], function(k, v){
            $("#" + "hgydwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);
        LotteryStorage["hgydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["hgydwfc"]["line"+lines[1]].push(array[1]+"");
        $.each(LotteryStorage["hgydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "hgydwfc_line" + lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "hgydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        LotteryStorage["hgydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["hgydwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["hgydwfc"]["line"+lines[2]].push(array[2]+"");

        $.each(LotteryStorage["hgydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "hgydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "hgydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "hgydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        LotteryStorage["hgydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["hgydwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["hgydwfc"]["line"+lines[2]].push(array[2]+"");
        LotteryStorage["hgydwfc"]["line"+lines[3]].push(array[3]+"");

        $.each(LotteryStorage["hgydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "hgydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "hgydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line"+lines[2]], function(k, v){
            $("#" + "hgydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["hgydwfc"]["line"+lines[3]], function(k, v){
            $("#" + "hgydwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
        });
    }else if(hgydwfc_playType == 14){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["hgydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["hgydwfc"]["line1"], function(k, v){
            $("#" + "hgydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }
    hgydwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hgydwfc_checkOutRandom(playMethod){
    var obj = new Object();
    if(hgydwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 18 || hgydwfc_playMethod == 29 || hgydwfc_playMethod == 40){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
        }
    }else if(hgydwfc_playMethod == 22 || hgydwfc_playMethod == 33 || hgydwfc_playMethod == 44){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 54;
    }else if(hgydwfc_playMethod == 54 || hgydwfc_playMethod == 61){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 9;
    }
    else if(hgydwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 37 || hgydwfc_playMethod == 26 || hgydwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 39 || hgydwfc_playMethod == 28 || hgydwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        obj.nums = number;
        obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
    }else if(hgydwfc_playMethod == 41 || hgydwfc_playMethod == 30 || hgydwfc_playMethod == 19){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(hgydwfc_playMethod == 52 || hgydwfc_playMethod == 59 || hgydwfc_playMethod == 64 || hgydwfc_playMethod == 66 || hgydwfc_playMethod == 68
        ||hgydwfc_playMethod == 70 || hgydwfc_playMethod == 72){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 42 || hgydwfc_playMethod == 31 || hgydwfc_playMethod == 20 || hgydwfc_playMethod == 73){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 43 || hgydwfc_playMethod == 32 || hgydwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        obj.nums = number;
        obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
    }else if(hgydwfc_playMethod == 48 || hgydwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 50 || hgydwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
    }else if(hgydwfc_playMethod == 53 || hgydwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
    }else if(hgydwfc_playMethod == 62){
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
    }else if(hgydwfc_playMethod == 63 || hgydwfc_playMethod == 65 || hgydwfc_playMethod == 67 || hgydwfc_playMethod == 69 || hgydwfc_playMethod == 71
        || hgydwfc_playMethod == 24 || hgydwfc_playMethod == 35 || hgydwfc_playMethod == 46){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 25 || hgydwfc_playMethod == 36 || hgydwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        var array = ["豹子","顺子","对子","半顺","杂六"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(hgydwfc_playMethod == 51 || hgydwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
        }
    }else if(hgydwfc_playMethod == 74 || hgydwfc_playMethod == 76){
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
    }else if(hgydwfc_playMethod == 75 || hgydwfc_playMethod == 77){
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
    }else if(hgydwfc_playMethod == 78){
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
    }else if(hgydwfc_playMethod == 84){
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
    }else if(hgydwfc_playMethod == 93){
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
    obj.sntuo = hgydwfc_sntuo;
    obj.multiple = 1;
    obj.rebates = hgydwfc_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('hgydwfc',hgydwfc_playMethod,obj);  //机选奖金计算
    obj.award = $('#hgydwfc_minAward').html();     //奖金
    obj.maxAward = $('#hgydwfc_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [hgydwfcValidateData 单式数据验证]
 */
function hgydwfcValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#hgydwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
    hgydwfcValidData(textStr,type);
}

function hgydwfcValidData(str,type){
    if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
        array,
        result,
        content = {};
    if(hgydwfc_playMethod == 1){
        content.str = str;
        content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 10){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 38 || hgydwfc_playMethod == 27 || hgydwfc_playMethod == 16){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 45 || hgydwfc_playMethod == 34 || hgydwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 49 || hgydwfc_playMethod == 56){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 79){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,2);
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 82){
        content.str = str;
        content.weishu = 2;
        content.duizi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,2);
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 85){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,3);
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 88){
        content.str = str;
        content.weishu = 3;
        content.zusan = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,3);
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 90){
        content.str = str;
        content.weishu = 3;
        content.zuliu = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,3);
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 91){
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,3);
        hgydwfcShowFooter(true,notes);
    }else if(hgydwfc_playMethod == 94){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hgydwfc_tab .button.red").size() ,4);
        hgydwfcShowFooter(true,notes);
    }

    $('#hgydwfc_delRepeat').off('click');
    $('#hgydwfc_delRepeat').on('click',function () {
        content.str = $('#hgydwfc_single').val() ? $('#hgydwfc_single').val() : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        array = rptResult.num || [];
        notes = rptResult.length;
        hgydwfcShowFooter(true,notes);
        $("#hgydwfc_single").val(array.join(" "));
    });

    $("#hgydwfc_single").val(array.join(" "));
    return notes;
}

function hgydwfcShowFooter(isValid,notes){
    $('#hgydwfc_zhushu').text(notes);
    if($("#hgydwfc_modeId").val() == "8"){
        $('#hgydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgydwfc_beiNum").val()),0.002));
    }else if ($("#hgydwfc_modeId").val() == "2"){
        $('#hgydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgydwfc_beiNum").val()),0.2));
    }else if ($("#hgydwfc_modeId").val() == "1"){
        $('#hgydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgydwfc_beiNum").val()),0.02));
    }else{
        $('#hgydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hgydwfc_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    hgydwfc_initFooterButton();
    calcAwardWin('hgydwfc',hgydwfc_playMethod);  //计算奖金和盈利
}