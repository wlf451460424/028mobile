var djydwfc_playType = 2;
var djydwfc_playMethod = 15;
var djydwfc_sntuo = 0;
var djydwfc_rebate;
var djydwfcScroll;

//进入这个页面时调用
function djydwfcPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("djydwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("djydwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function djydwfcPageUnloadedPanel(){
    $("#djydwfc_queding").off('click');
    $("#djydwfcPage_back").off('click');
    $("#djydwfc_ballView").empty();
    $("#djydwfcSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="djydwfcPlaySelect"></select>');
    $("#djydwfcSelect").append($select);
}

//入口函数
function djydwfc_init(){
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
    $("#djydwfc_title").html(LotteryInfo.getLotteryNameByTag("djydwfc"));
    for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
        	
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
                var name = LotteryInfo.getMethodName("ssc",j);
                if(i == djydwfc_playType && j == djydwfc_playMethod){
                    $play.append('<option value="djydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="djydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(djydwfc_playMethod,onShowArray)>-1 ){
						djydwfc_playType = i;
						djydwfc_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#djydwfcPlaySelect").append($play);
		}
    }
    
    if($("#djydwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("djydwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:djydwfcChangeItem
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

    GetLotteryInfo("djydwfc",function (){
        djydwfcChangeItem("djydwfc"+djydwfc_playMethod);
    });

    //添加滑动条
    if(!djydwfcScroll){
        djydwfcScroll = new IScroll('#djydwfcContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("djydwfc",LotteryInfo.getLotteryIdByTag("djydwfc"));

    //获取上一期开奖
    queryLastPrize("djydwfc");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('djydwfc');

    //机选选号
    $("#djydwfc_random").off('click');
    $("#djydwfc_random").on('click', function(event) {
        djydwfc_randomOne();
    });
    
    $("#djydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",djydwfc_playMethod));
	//玩法说明
	$("#djydwfc_paly_shuoming").off('click');
	$("#djydwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#djydwfc_shuoming").text());
	});

    //返回
    $("#djydwfcPage_back").on('click', function(event) {
        // djydwfc_playType = 2;
        // djydwfc_playMethod = 15;
        $("#djydwfc_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        djydwfc_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });

    qingKong("djydwfc");//清空
    djydwfc_submitData();
}

function djydwfcResetPlayType(){
    djydwfc_playType = 2;
    djydwfc_playMethod = 15;
}

function djydwfcChangeItem(val) {
    djydwfc_qingkongAll();
    var temp = val.substring("djydwfc".length,val.length);
    if(val == "djydwfc0"){
        //直选复式
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 0;
        djydwfc_playMethod = 0;
        createFiveLineLayout("djydwfc", function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc1"){
        //直选单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 0;
        djydwfc_playMethod = 1;
        $("#djydwfc_ballView").empty();
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc2"){
        //组选120
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 0;
        djydwfc_playMethod = 2;
        createOneLineLayout("djydwfc","至少选择5个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc3"){
        //组选60
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 0;
        djydwfc_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc4"){
        //组选30
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 0;
        djydwfc_playMethod = 4;
        var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc5"){
        //组选20
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 0;
        djydwfc_playMethod = 5;
        var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc6"){
        //组选10
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 0;
        djydwfc_playMethod = 6;
        var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc7"){
        //组选5
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 0;
        djydwfc_playMethod = 7;
        var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc8"){
        //总和大小单双
        $("#djydwfc_random").show();
        var num = ["大","小","单","双"];
        djydwfc_sntuo = 0;
        djydwfc_playType = 0;
        djydwfc_playMethod = 8;
        createNonNumLayout("djydwfc",djydwfc_playMethod,num,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc9"){
        //直选复式
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 1;
        djydwfc_playMethod = 9;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createFourLineLayout("djydwfc",tips, function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc10"){
        //直选单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 1;
        djydwfc_playMethod = 10;
        $("#djydwfc_ballView").empty();
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc11"){
        //组选24
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 1;
        djydwfc_playMethod = 11;
        createOneLineLayout("djydwfc","至少选择4个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc12"){
        //组选12
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 1;
        djydwfc_playMethod = 12;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc13"){
        //组选6
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 1;
        djydwfc_playMethod = 13;
        createOneLineLayout("djydwfc","二重号:至少选择2个号码",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc14"){
        //组选4
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 1;
        djydwfc_playMethod = 14;
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc15"){
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 15;
        var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createThreeLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc16"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 2;
        djydwfc_playMethod = 16;
        $("#djydwfc_ballView").empty();
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc17"){
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 17;
        createSumLayout("djydwfc",0,27,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc18"){
        //直选跨度
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 18;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc19"){
        //后三组三
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 19;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc20"){
        //后三组六
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 20;
        createOneLineLayout("djydwfc","至少选择3个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc21"){
        //后三和值
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 21;
        createSumLayout("djydwfc",1,26,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc22"){
        //后三组选包胆
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 22;
        djydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("djydwfc",array,["请选择一个号码"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc23"){
        //后三混合组选
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 2;
        djydwfc_playMethod = 23;
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc24"){
        //和值尾数
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 24;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc25"){
        //特殊号
        $("#djydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        djydwfc_sntuo = 0;
        djydwfc_playType = 2;
        djydwfc_playMethod = 25;
        createNonNumLayout("djydwfc",djydwfc_playMethod,num,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc26"){
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 26;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
        createThreeLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc27"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 3;
        djydwfc_playMethod = 27;
        $("#djydwfc_ballView").empty();
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc28"){
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 28;
        createSumLayout("djydwfc",0,27,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc29"){
        //直选跨度
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 29;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc30"){
        //中三组三
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 30;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc31"){
        //中三组六
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 31;
        createOneLineLayout("djydwfc","至少选择3个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc32"){
        //中三和值
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 32;
        createSumLayout("djydwfc",1,26,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc33"){
        //中三组选包胆
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 33;
        djydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("djydwfc",array,["请选择一个号码"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc34"){
        //中三混合组选
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 3;
        djydwfc_playMethod = 34;
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc35"){
        //和值尾数
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 35;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc36"){
        //特殊号
        $("#djydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        djydwfc_sntuo = 0;
        djydwfc_playType = 3;
        djydwfc_playMethod = 36;
        createNonNumLayout("djydwfc",djydwfc_playMethod,num,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc37"){
        //直选复式
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 37;
        var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
        createThreeLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc38"){
        //直选单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 4;
        djydwfc_playMethod = 38;
        $("#djydwfc_ballView").empty();
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc39"){
        //和值
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 39;
        createSumLayout("djydwfc",0,27,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc40"){
        //直选跨度
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 40;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc41"){
        //前三组三
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 41;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc42"){
        //前三组六
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 42;
        createOneLineLayout("djydwfc","至少选择3个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc43"){
        //前三和值
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 43;
        createSumLayout("djydwfc",1,26,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc44"){
        //前三组选包胆
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 44;
        djydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("djydwfc",array,["请选择一个号码"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc45"){
        //前三混合组选
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 4;
        djydwfc_playMethod = 45;
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc46"){
        //和值尾数
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 46;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc47"){
        //特殊号
        $("#djydwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        djydwfc_sntuo = 0;
        djydwfc_playType = 4;
        djydwfc_playMethod = 47;
        createNonNumLayout("djydwfc",djydwfc_playMethod,num,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc48"){
        //后二复式
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 5;
        djydwfc_playMethod = 48;
        var tips = ["十位：可选1-10个","个位：可选1-10个"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc49"){
        //后二单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 5;
        djydwfc_playMethod = 49;
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc50"){
        //后二和值
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 5;
        djydwfc_playMethod = 50;
        createSumLayout("djydwfc",0,18,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc51"){
        //直选跨度
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 5;
        djydwfc_playMethod = 51;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc52"){
        //后二组选
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 5;
        djydwfc_playMethod = 52;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc53"){
        //后二和值
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 5;
        djydwfc_playMethod = 53;
        createSumLayout("djydwfc",1,17,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc54"){
        //后二组选包胆
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 5;
        djydwfc_playMethod = 54;
        djydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("djydwfc",array,["请选择一个号码"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc55"){
        //前二复式
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 6;
        djydwfc_playMethod = 55;
        var tips = ["万位：可选1-10个","千位：可选1-10个"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc56"){
        //前二单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 6;
        djydwfc_playMethod = 56;
        djydwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
    }else if(val == "djydwfc57"){
        //前二和值
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 6;
        djydwfc_playMethod = 57;
        createSumLayout("djydwfc",0,18,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc58"){
        //直选跨度
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 6;
        djydwfc_playMethod = 58;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc59"){
        //前二组选
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 6;
        djydwfc_playMethod = 59;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc60"){
        //前二和值
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 6;
        djydwfc_playMethod = 60;
        createSumLayout("djydwfc",1,17,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc61"){
        //前二组选包胆
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 6;
        djydwfc_playMethod = 61;
        djydwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("djydwfc",array,["请选择一个号码"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc62"){
        //定位复式
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 7;
        djydwfc_playMethod = 62;
        createFiveLineLayout("djydwfc", function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc63"){
        //后三一码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 63;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc64"){
        //后三二码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 64;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc65"){
        //前三一码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 65;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc66"){
        //前三二码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 66;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc67"){
        //后四一码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 67;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc68"){
        //后四二码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 68;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc69"){
        //前四一码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 69;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc70"){
        //前四二码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 70;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc71"){
        //五星一码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 71;
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc72"){
        //五星二码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 72;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc73"){
        //五星三码
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 8;
        djydwfc_playMethod = 73;
        createOneLineLayout("djydwfc","至少选择3个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc74"){
        //后二大小单双
        djydwfc_qingkongAll();
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 9;
        djydwfc_playMethod = 74;
        createTextBallTwoLayout("djydwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc75"){
        //后三大小单双
        djydwfc_qingkongAll();
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 9;
        djydwfc_playMethod = 75;
        createTextBallThreeLayout("djydwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc76"){
        //前二大小单双
        djydwfc_qingkongAll();
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 9;
        djydwfc_playMethod = 76;
        createTextBallTwoLayout("djydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc77"){
        //前三大小单双
        djydwfc_qingkongAll();
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 9;
        djydwfc_playMethod = 77;
        createTextBallThreeLayout("djydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc78"){
        //直选复式
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 10;
        djydwfc_playMethod = 78;
        createFiveLineLayout("djydwfc",function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc79"){
        //直选单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 10;
        djydwfc_playMethod = 79;
        var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
        createRenXuanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc80"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 10;
        djydwfc_playMethod = 80;
        createSumLayout("djydwfc",0,18,function(){
            djydwfc_calcNotes();
        });
        createRenXuanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc81"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 10;
        djydwfc_playMethod = 81;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        createRenXuanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc82"){
        //组选单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 10;
        djydwfc_playMethod = 82;
        var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
        createRenXuanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc83"){
        //组选和值
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 10;
        djydwfc_playMethod = 83;
        createSumLayout("djydwfc",1,17,function(){
            djydwfc_calcNotes();
        });
        createRenXuanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc84"){
        //直选复式
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 11;
        djydwfc_playMethod = 84;
        createFiveLineLayout("djydwfc", function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc85"){
        //直选单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 11;
        djydwfc_playMethod = 85;
        var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
        createRenXuanSanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc86"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 11;
        djydwfc_playMethod = 86;
        createSumLayout("djydwfc",0,27,function(){
            djydwfc_calcNotes();
        });
        createRenXuanSanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc87"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 11;
        djydwfc_playMethod = 87;
        createOneLineLayout("djydwfc","至少选择2个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        createRenXuanSanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc88"){
        //组选单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 11;
        djydwfc_playMethod = 88;
        var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
        createRenXuanSanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc89"){
        //组选和值
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 11;
        djydwfc_playMethod = 89;
        createOneLineLayout("djydwfc","至少选择3个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        createRenXuanSanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc90"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 11;
        djydwfc_playMethod = 90;
        var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
        createRenXuanSanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc91"){
        //混合组选
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 11;
        djydwfc_playMethod = 91;
        var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
        createRenXuanSanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc92"){
        //组选和值
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 11;
        djydwfc_playMethod = 92;
        createSumLayout("djydwfc",1,26,function(){
            djydwfc_calcNotes();
        });
        createRenXuanSanLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc93"){
        $("#djydwfc_random").show();
        djydwfc_sntuo = 0;
        djydwfc_playType = 12;
        djydwfc_playMethod = 93;
        createFiveLineLayout("djydwfc", function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc94"){
        //直选单式
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 3;
        djydwfc_playType = 12;
        djydwfc_playMethod = 94;
        var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("djydwfc",tips);
        createRenXuanSiLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc95"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 12;
        djydwfc_playMethod = 95;
        createOneLineLayout("djydwfc","至少选择4个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        createRenXuanSiLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc96"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 12;
        djydwfc_playMethod = 96;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        createRenXuanSiLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc97"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 12;
        djydwfc_playMethod = 97;
        $("#djydwfc_ballView").empty();
        createOneLineLayout("djydwfc","二重号:至少选择2个号码",0,9,false,function(){
            djydwfc_calcNotes();
        });
        createRenXuanSiLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc98"){
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 12;
        djydwfc_playMethod = 98;
        $("#djydwfc_ballView").empty();
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("djydwfc",tips,0,9,false,function(){
            djydwfc_calcNotes();
        });
        createRenXuanSiLayout("djydwfc",djydwfc_playMethod,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc99"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 13;
        djydwfc_playMethod = 99;
        $("#djydwfc_ballView").empty();
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc100"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 13;
        djydwfc_playMethod = 100;
        $("#djydwfc_ballView").empty();
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc101"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 13;
        djydwfc_playMethod = 101;
        $("#djydwfc_ballView").empty();
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc102"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 13;
        djydwfc_playMethod = 102;
        $("#djydwfc_ballView").empty();
        createOneLineLayout("djydwfc","至少选择1个",0,9,false,function(){
            djydwfc_calcNotes();
        });
        djydwfc_qingkongAll();
    }else if(val == "djydwfc103"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 103;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc104"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 104;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc105"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 105;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc106"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 106;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc107"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 107;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc108"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 108;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc109"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 109;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc110"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 110;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc111"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 111;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }else if(val == "djydwfc112"){
        djydwfc_qingkongAll();
        $("#djydwfc_random").hide();
        djydwfc_sntuo = 0;
        djydwfc_playType = 14;
        djydwfc_playMethod = 112;
        createTextBallOneLayout("djydwfc",["龙","虎","和"],["至少选择一个"],function(){
            djydwfc_calcNotes();
        });
    }

    if(djydwfcScroll){
        djydwfcScroll.refresh();
        djydwfcScroll.scrollTo(0,0,1);
    }
    
    $("#djydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
    
    initFooterData("djydwfc",temp);
    hideRandomWhenLi("djydwfc",djydwfc_sntuo,djydwfc_playMethod);
    djydwfc_calcNotes();
}
/**
 * [djydwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function djydwfc_initFooterButton(){
    if(djydwfc_playMethod == 0 || djydwfc_playMethod == 62 || djydwfc_playMethod == 78
        || djydwfc_playMethod == 84 || djydwfc_playMethod == 93 || djydwfc_playType == 7){
        if(LotteryStorage["djydwfc"]["line1"].length > 0 || LotteryStorage["djydwfc"]["line2"].length > 0 ||
            LotteryStorage["djydwfc"]["line3"].length > 0 || LotteryStorage["djydwfc"]["line4"].length > 0 ||
            LotteryStorage["djydwfc"]["line5"].length > 0){
            $("#djydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#djydwfc_qingkong").css("opacity",0.4);
        }
    }else if(djydwfc_playMethod == 9){
        if(LotteryStorage["djydwfc"]["line1"].length > 0 || LotteryStorage["djydwfc"]["line2"].length > 0 ||
            LotteryStorage["djydwfc"]["line3"].length > 0 || LotteryStorage["djydwfc"]["line4"].length > 0 ){
            $("#djydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#djydwfc_qingkong").css("opacity",0.4);
        }
    }else if(djydwfc_playMethod == 37 || djydwfc_playMethod == 4 || djydwfc_playMethod == 6
        || djydwfc_playMethod == 26 || djydwfc_playMethod == 15 || djydwfc_playMethod == 75 || djydwfc_playMethod == 77){
        if(LotteryStorage["djydwfc"]["line1"].length > 0 || LotteryStorage["djydwfc"]["line2"].length > 0
            || LotteryStorage["djydwfc"]["line3"].length > 0){
            $("#djydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#djydwfc_qingkong").css("opacity",0.4);
        }
    }else if(djydwfc_playMethod == 3 || djydwfc_playMethod == 4 || djydwfc_playMethod == 5
        || djydwfc_playMethod == 6 || djydwfc_playMethod == 7 || djydwfc_playMethod == 12
        || djydwfc_playMethod == 14 || djydwfc_playMethod == 48 || djydwfc_playMethod == 55
        || djydwfc_playMethod == 74 || djydwfc_playMethod == 76 || djydwfc_playMethod == 96 || djydwfc_playMethod == 98){
        if(LotteryStorage["djydwfc"]["line1"].length > 0 || LotteryStorage["djydwfc"]["line2"].length > 0){
            $("#djydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#djydwfc_qingkong").css("opacity",0.4);
        }
    }else if(djydwfc_playMethod == 2 || djydwfc_playMethod == 8 || djydwfc_playMethod == 11 || djydwfc_playMethod == 13 || djydwfc_playMethod == 39
        || djydwfc_playMethod == 28 || djydwfc_playMethod == 17 || djydwfc_playMethod == 18 || djydwfc_playMethod == 24 || djydwfc_playMethod == 41
        || djydwfc_playMethod == 25 || djydwfc_playMethod == 29 || djydwfc_playMethod == 42 || djydwfc_playMethod == 43 || djydwfc_playMethod == 30
        || djydwfc_playMethod == 35 || djydwfc_playMethod == 36 || djydwfc_playMethod == 31 || djydwfc_playMethod == 32 || djydwfc_playMethod == 19
        || djydwfc_playMethod == 40 || djydwfc_playMethod == 46 || djydwfc_playMethod == 20 || djydwfc_playMethod == 21 || djydwfc_playMethod == 50
        || djydwfc_playMethod == 47 || djydwfc_playMethod == 51 || djydwfc_playMethod == 52 || djydwfc_playMethod == 53 || djydwfc_playMethod == 57 || djydwfc_playMethod == 63
        || djydwfc_playMethod == 58 || djydwfc_playMethod == 59 || djydwfc_playMethod == 60 || djydwfc_playMethod == 65 || djydwfc_playMethod == 80 || djydwfc_playMethod == 81 || djydwfc_playType == 8
        || djydwfc_playMethod == 83 || djydwfc_playMethod == 86 || djydwfc_playMethod == 87 || djydwfc_playMethod == 22 || djydwfc_playMethod == 33 || djydwfc_playMethod == 44
        || djydwfc_playMethod == 89 || djydwfc_playMethod == 92 || djydwfc_playMethod == 95 || djydwfc_playMethod == 54 || djydwfc_playMethod == 61
        || djydwfc_playMethod == 97 || djydwfc_playType == 13  || djydwfc_playType == 14){
        if(LotteryStorage["djydwfc"]["line1"].length > 0){
            $("#djydwfc_qingkong").css("opacity",1.0);
        }else{
            $("#djydwfc_qingkong").css("opacity",0.4);
        }
    }else{
        $("#djydwfc_qingkong").css("opacity",0);
    }

    if($("#djydwfc_qingkong").css("opacity") == "0"){
        $("#djydwfc_qingkong").css("display","none");
    }else{
        $("#djydwfc_qingkong").css("display","block");
    }

    if($('#djydwfc_zhushu').html() > 0){
        $("#djydwfc_queding").css("opacity",1.0);
    }else{
        $("#djydwfc_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  djydwfc_qingkongAll(){
    $("#djydwfc_ballView span").removeClass('redBalls_active');
    LotteryStorage["djydwfc"]["line1"] = [];
    LotteryStorage["djydwfc"]["line2"] = [];
    LotteryStorage["djydwfc"]["line3"] = [];
    LotteryStorage["djydwfc"]["line4"] = [];
    LotteryStorage["djydwfc"]["line5"] = [];

    localStorageUtils.removeParam("djydwfc_line1");
    localStorageUtils.removeParam("djydwfc_line2");
    localStorageUtils.removeParam("djydwfc_line3");
    localStorageUtils.removeParam("djydwfc_line4");
    localStorageUtils.removeParam("djydwfc_line5");

    $('#djydwfc_zhushu').text(0);
    $('#djydwfc_money').text(0);
    clearAwardWin("djydwfc");
    djydwfc_initFooterButton();
}

/**
 * [djydwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function djydwfc_calcNotes(){
	$('#djydwfc_modeId').blur();
	$('#djydwfc_fandian').blur();
	
    var notes = 0;

    if(djydwfc_playMethod == 0){
        notes = LotteryStorage["djydwfc"]["line1"].length *
            LotteryStorage["djydwfc"]["line2"].length *
            LotteryStorage["djydwfc"]["line3"].length *
            LotteryStorage["djydwfc"]["line4"].length *
            LotteryStorage["djydwfc"]["line5"].length;
    }else if(djydwfc_playMethod == 2){
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,5);
    }else if(djydwfc_playMethod == 3){
        if (LotteryStorage["djydwfc"]["line1"].length >= 1 && LotteryStorage["djydwfc"]["line2"].length >= 3) {
            notes = getArraySelect(3,LotteryStorage["djydwfc"]["line1"],LotteryStorage["djydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(djydwfc_playMethod == 4){
        if (LotteryStorage["djydwfc"]["line1"].length >= 2 && LotteryStorage["djydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(2,LotteryStorage["djydwfc"]["line2"],LotteryStorage["djydwfc"]["line1"]);
        }else{
            notes = 0;
        }
    }else if(djydwfc_playMethod == 5 || djydwfc_playMethod == 12){
        if (LotteryStorage["djydwfc"]["line1"].length >= 1 && LotteryStorage["djydwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["djydwfc"]["line1"],LotteryStorage["djydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(djydwfc_playMethod == 6 || djydwfc_playMethod == 7 || djydwfc_playMethod == 14){
        if (LotteryStorage["djydwfc"]["line1"].length >= 1 && LotteryStorage["djydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["djydwfc"]["line1"],LotteryStorage["djydwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(djydwfc_playMethod == 9){
        notes = LotteryStorage["djydwfc"]["line1"].length *
            LotteryStorage["djydwfc"]["line2"].length *
            LotteryStorage["djydwfc"]["line3"].length *
            LotteryStorage["djydwfc"]["line4"].length;
    }else if(djydwfc_playMethod == 18 || djydwfc_playMethod == 29 || djydwfc_playMethod == 40){
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["djydwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
            }
        }
    }else if(djydwfc_playMethod == 22 || djydwfc_playMethod == 33 || djydwfc_playMethod == 44 ){
        notes = 54;
    }else if(djydwfc_playMethod == 54 || djydwfc_playMethod == 61){
        notes = 9;
    }else if(djydwfc_playMethod == 51 || djydwfc_playMethod == 58){
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["djydwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 2;
            }
        }
    }else if(djydwfc_playMethod == 11){
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,4);
    }else if(djydwfc_playMethod == 13|| djydwfc_playMethod == 64 || djydwfc_playMethod == 66 || djydwfc_playMethod == 68 || djydwfc_playMethod == 70 || djydwfc_playMethod == 72){
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,2);
    }else if(djydwfc_playMethod == 37 || djydwfc_playMethod == 26 || djydwfc_playMethod == 15 || djydwfc_playMethod == 75 || djydwfc_playMethod == 77){
        notes = LotteryStorage["djydwfc"]["line1"].length *
            LotteryStorage["djydwfc"]["line2"].length *
            LotteryStorage["djydwfc"]["line3"].length ;
    }else if(djydwfc_playMethod == 39 || djydwfc_playMethod == 28 || djydwfc_playMethod == 17){
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["djydwfc"]["line1"][i]);
        };
    }else if(djydwfc_playMethod == 41 || djydwfc_playMethod == 30 || djydwfc_playMethod == 19){
        notes = mathUtil.getACombination(LotteryStorage["djydwfc"]["line1"].length,2);
    }else if(djydwfc_playMethod == 42 || djydwfc_playMethod == 31 || djydwfc_playMethod == 20 || djydwfc_playMethod == 68 || djydwfc_playMethod == 73){
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,3);
    }else if(djydwfc_playMethod == 43 || djydwfc_playMethod == 32 || djydwfc_playMethod == 21){
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["djydwfc"]["line1"][i]);
        };
    }else if(djydwfc_playMethod == 48 || djydwfc_playMethod == 55 || djydwfc_playMethod == 74 || djydwfc_playMethod == 76){
        notes = LotteryStorage["djydwfc"]["line1"].length *
            LotteryStorage["djydwfc"]["line2"].length ;
    }else if(djydwfc_playMethod == 50 || djydwfc_playMethod == 57){
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["djydwfc"]["line1"][i]);
        };
    }else if(djydwfc_playMethod == 52 || djydwfc_playMethod == 59){
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,2);
    }else if(djydwfc_playMethod == 53 || djydwfc_playMethod == 60){
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["djydwfc"]["line1"][i]);
        };
    }else if(djydwfc_playMethod == 62){
        notes = LotteryStorage["djydwfc"]["line1"].length +
            LotteryStorage["djydwfc"]["line2"].length +
            LotteryStorage["djydwfc"]["line3"].length +
            LotteryStorage["djydwfc"]["line4"].length +
            LotteryStorage["djydwfc"]["line5"].length;
    }else if(djydwfc_playType == 13 || djydwfc_playType == 14 || djydwfc_playMethod == 8 || djydwfc_playMethod == 71
        || djydwfc_playMethod == 24 || djydwfc_playMethod == 25 || djydwfc_playMethod == 35 || djydwfc_playMethod == 36 || djydwfc_playMethod == 46
        || djydwfc_playMethod == 47 || djydwfc_playMethod == 63 || djydwfc_playMethod == 65 || djydwfc_playMethod == 67 || djydwfc_playMethod == 69 ){
        notes = LotteryStorage["djydwfc"]["line1"].length ;
    }else if(djydwfc_playMethod == 78){
        notes = LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line2"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line3"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line4"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line3"].length +
            LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line4"].length +
            LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line4"].length +
            LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line4"].length * LotteryStorage["djydwfc"]["line5"].length;
    }else if (djydwfc_playMethod == 80) {
        if ($("#djydwfc_tab .button.red").size() < 2) {
            notes = 0;
        }else{
            for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
                notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["djydwfc"]["line1"][i]);
            };
            notes *= mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,2);
        }
    }else if (djydwfc_playMethod == 81) {
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,2);
    }else if (djydwfc_playMethod == 83) {
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["djydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,2);
    }else if (djydwfc_playMethod == 84) {
        notes = LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line3"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line4"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line4"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line4"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line4"].length +
            LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line4"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line4"].length * LotteryStorage["djydwfc"]["line5"].length ;
    }else if (djydwfc_playMethod == 86) {
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["djydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,3);
    }else if (djydwfc_playMethod == 87) {
        notes = mathUtil.getACombination(LotteryStorage["djydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,3);
    }else if (djydwfc_playMethod == 89) {
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,3) * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,3);
    }else if (djydwfc_playMethod == 92) {
        for (var i = 0; i < LotteryStorage["djydwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["djydwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,3);
    }else if (djydwfc_playMethod == 93) {
        notes = LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line4"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line4"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line1"].length * LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line4"].length * LotteryStorage["djydwfc"]["line5"].length +
            LotteryStorage["djydwfc"]["line2"].length * LotteryStorage["djydwfc"]["line3"].length * LotteryStorage["djydwfc"]["line4"].length * LotteryStorage["djydwfc"]["line5"].length;
    }else if (djydwfc_playMethod == 95) {
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,4)
            * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,4);
    }else if (djydwfc_playMethod == 96) {
        if (LotteryStorage["djydwfc"]["line1"].length >= 1 && LotteryStorage["djydwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["djydwfc"]["line1"],LotteryStorage["djydwfc"]["line2"])
                * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else if (djydwfc_playMethod == 97) {
        notes = mathUtil.getCCombination(LotteryStorage["djydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,4);
    }else if (djydwfc_playMethod == 98) {
        if (LotteryStorage["djydwfc"]["line1"].length >= 1 && LotteryStorage["djydwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["djydwfc"]["line1"],LotteryStorage["djydwfc"]["line2"]) * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else{
        notes = djydwfcValidData($("#djydwfc_single").val());
    }

    if(djydwfc_sntuo == 3 || djydwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","djydwfc"),LotteryInfo.getMethodId("ssc",djydwfc_playMethod))){
    }else{
        if(parseInt($('#djydwfc_modeId').val()) == 8){
            $("#djydwfc_random").hide();
        }else{
            $("#djydwfc_random").show();
        }
    }

    //验证是否为空
    if( $("#djydwfc_beiNum").val() =="" || parseInt($("#djydwfc_beiNum").val()) == 0){
        $("#djydwfc_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#djydwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#djydwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#djydwfc_zhushu').text(notes);
        if($("#djydwfc_modeId").val() == "8"){
            $('#djydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#djydwfc_beiNum").val()),0.002));
        }else if ($("#djydwfc_modeId").val() == "2"){
            $('#djydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#djydwfc_beiNum").val()),0.2));
        }else if ($("#djydwfc_modeId").val() == "1"){
            $('#djydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#djydwfc_beiNum").val()),0.02));
        }else{
            $('#djydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#djydwfc_beiNum").val()),2));
        }
    } else {
        $('#djydwfc_zhushu').text(0);
        $('#djydwfc_money').text(0);
    }
    djydwfc_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('djydwfc',djydwfc_playMethod);
}

/**
 * [djydwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function djydwfc_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#djydwfc_queding").bind('click', function(event) {
        djydwfc_rebate = $("#djydwfc_fandian option:last").val();
        if(parseInt($('#djydwfc_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        djydwfc_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

        /*if(parseInt($('#djydwfc_modeId').val()) == 8){
            if (Number($('#djydwfc_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('djydwfc',djydwfc_playMethod);

        submitParams.lotteryType = "djydwfc";
        var play = LotteryInfo.getPlayName("ssc",djydwfc_playType);
        var playMethod = LotteryInfo.getMethodName("ssc",djydwfc_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = djydwfc_playType;
        submitParams.playMethodIndex = djydwfc_playMethod;
        var selectedBalls = [];
        if(djydwfc_playMethod == 0 || djydwfc_playMethod == 3 || djydwfc_playMethod == 4
            || djydwfc_playMethod == 5 || djydwfc_playMethod == 6 || djydwfc_playMethod == 7
            || djydwfc_playMethod == 9 || djydwfc_playMethod == 12 || djydwfc_playMethod == 14
            || djydwfc_playMethod == 37 || djydwfc_playMethod == 26 || djydwfc_playMethod == 15
            || djydwfc_playMethod == 48 || djydwfc_playMethod == 55 || djydwfc_playMethod == 74 || djydwfc_playType == 9){
            $("#djydwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(djydwfc_playMethod == 2 || djydwfc_playMethod == 8 || djydwfc_playMethod == 11 || djydwfc_playMethod == 13 || djydwfc_playMethod == 24
            || djydwfc_playMethod == 39 || djydwfc_playMethod == 28 || djydwfc_playMethod == 17 || djydwfc_playMethod == 18 || djydwfc_playMethod == 25
            || djydwfc_playMethod == 22 || djydwfc_playMethod == 33 || djydwfc_playMethod == 44 || djydwfc_playMethod == 54 || djydwfc_playMethod == 61
            || djydwfc_playMethod == 41 || djydwfc_playMethod == 42 || djydwfc_playMethod == 43 || djydwfc_playMethod == 29 || djydwfc_playMethod == 35
            || djydwfc_playMethod == 30 || djydwfc_playMethod == 31 || djydwfc_playMethod == 32 || djydwfc_playMethod == 40 || djydwfc_playMethod == 36
            || djydwfc_playMethod == 19 || djydwfc_playMethod == 20 || djydwfc_playMethod == 21 || djydwfc_playMethod == 46 || djydwfc_playMethod == 47
            || djydwfc_playMethod == 50 || djydwfc_playMethod == 57 || djydwfc_playType == 8 || djydwfc_playMethod == 51 || djydwfc_playMethod == 58
            || djydwfc_playMethod == 52 || djydwfc_playMethod == 53|| djydwfc_playMethod == 59 || djydwfc_playMethod == 60 || djydwfc_playType == 13 || djydwfc_playType == 14){
            $("#djydwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(djydwfc_playType == 7 || djydwfc_playMethod == 78 || djydwfc_playMethod == 84 || djydwfc_playMethod == 93){
            $("#djydwfc_ballView div.ballView").each(function(){
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
        }else if(djydwfc_playMethod == 80 || djydwfc_playMethod == 81 || djydwfc_playMethod == 83
            || djydwfc_playMethod == 86 || djydwfc_playMethod == 87 || djydwfc_playMethod == 89
            || djydwfc_playMethod == 92 || djydwfc_playMethod == 95 || djydwfc_playMethod == 97){
            $("#djydwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            var temp = selectedBalls.join(",") + "#";

            if ($("#djydwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#djydwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#djydwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#djydwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#djydwfc_tab5").hasClass("button red")) {
                temp += "个";
            };

            submitParams.nums = temp;
        }else if (djydwfc_playMethod == 96 || djydwfc_playMethod == 98) {
            $("#djydwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            var temp = selectedBalls.join("|") + "#";
            if ($("#djydwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#djydwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#djydwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#djydwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#djydwfc_tab5").hasClass("button red")) {
                temp += "个";
            };
            submitParams.nums = temp;
        }else{
		    //去错误号
		    djydwfcValidateData("submit");
            var array = handleSingleStr($("#djydwfc_single").val());
            if(djydwfc_playMethod == 1 ){
                submitParams.nums = array.join(" ");
            }else if(djydwfc_playMethod == 10 || djydwfc_playMethod == 38 || djydwfc_playMethod == 27
                || djydwfc_playMethod == 16 || djydwfc_playMethod == 49 || djydwfc_playMethod == 56){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join("|");
                    }else{
                        temp = temp + array[i].split("").join("|") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(djydwfc_playMethod == 45 || djydwfc_playMethod == 34 || djydwfc_playMethod == 23){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(djydwfc_playMethod == 79 || djydwfc_playMethod == 82 || djydwfc_playMethod == 85 || djydwfc_playMethod == 88 ||
                djydwfc_playMethod == 89 || djydwfc_playMethod == 90 || djydwfc_playMethod == 91 || djydwfc_playMethod == 94){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                temp +="#";
                if ($("#djydwfc_tab1").hasClass("button red")) {
                    temp += "万";
                };
                if ($("#djydwfc_tab2").hasClass("button red")) {
                    temp += "千";
                };
                if ($("#djydwfc_tab3").hasClass("button red")) {
                    temp += "百";
                };
                if ($("#djydwfc_tab4").hasClass("button red")) {
                    temp += "十";
                };
                if ($("#djydwfc_tab5").hasClass("button red")) {
                    temp += "个";
                };

                submitParams.nums = temp;
            }
        }
        localStorageUtils.setParam("playMode",$("#djydwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#djydwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#djydwfc_fandian").val());
        submitParams.notes = $('#djydwfc_zhushu').html();
        submitParams.sntuo = djydwfc_sntuo;
        submitParams.multiple = $('#djydwfc_beiNum').val();  //requirement
        submitParams.rebates = $('#djydwfc_fandian').val();  //requirement
        submitParams.playMode = $('#djydwfc_modeId').val();  //requirement
        submitParams.money = $('#djydwfc_money').html();  //requirement
        submitParams.award = $('#djydwfc_minAward').html();  //奖金
        submitParams.maxAward = $('#djydwfc_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#djydwfc_ballView").empty();
        djydwfc_qingkongAll();
    });
}

/**
 * [djydwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function djydwfc_randomOne(){
    djydwfc_qingkongAll();
    if(djydwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        LotteryStorage["djydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["djydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["djydwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["djydwfc"]["line4"].push(redBallArray[3]+"");
        LotteryStorage["djydwfc"]["line5"].push(redBallArray[4]+"");

        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line2"], function(k, v){
            $("#" + "djydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line3"], function(k, v){
            $("#" + "djydwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line4"], function(k, v){
            $("#" + "djydwfc_line4" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line5"], function(k, v){
            $("#" + "djydwfc_line5" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["djydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        LotteryStorage["djydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["djydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["djydwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["djydwfc"]["line4"].push(redBallArray[3]+"");

        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line2"], function(k, v){
            $("#" + "djydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line3"], function(k, v){
            $("#" + "djydwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line4"], function(k, v){
            $("#" + "djydwfc_line4" + v).toggleClass("redBalls_active");
        });

    }else if(djydwfc_playMethod == 37 || djydwfc_playMethod == 26 || djydwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        LotteryStorage["djydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["djydwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["djydwfc"]["line3"].push(redBallArray[2]+"");

        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line2"], function(k, v){
            $("#" + "djydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line3"], function(k, v){
            $("#" + "djydwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 41 || djydwfc_playMethod == 30 || djydwfc_playMethod == 19 || djydwfc_playMethod == 68
        || djydwfc_playMethod == 52 || djydwfc_playMethod == 64 || djydwfc_playMethod == 66
        || djydwfc_playMethod == 59 || djydwfc_playMethod == 70 || djydwfc_playMethod == 72){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["djydwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 42 || djydwfc_playMethod == 31 || djydwfc_playMethod == 20 || djydwfc_playMethod == 73){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["djydwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 39 || djydwfc_playMethod == 28 || djydwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        LotteryStorage["djydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 43 || djydwfc_playMethod == 32 || djydwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        LotteryStorage["djydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 48 || djydwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        LotteryStorage["djydwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["djydwfc"]["line2"].push(redBallArray[1]+"");

        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line2"], function(k, v){
            $("#" + "djydwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 25 || djydwfc_playMethod == 36 || djydwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["djydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 50 || djydwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        LotteryStorage["djydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 53 || djydwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        LotteryStorage["djydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["djydwfc"]["line"+line].push(number+"");
        $.each(LotteryStorage["djydwfc"]["line"+line], function(k, v){
            $("#" + "djydwfc_line" + line + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 63 || djydwfc_playMethod == 67 || djydwfc_playMethod == 69 || djydwfc_playMethod == 71 || djydwfc_playType == 13
        || djydwfc_playMethod == 65 || djydwfc_playMethod == 18 || djydwfc_playMethod == 29 || djydwfc_playMethod == 40 || djydwfc_playMethod == 22
        || djydwfc_playMethod == 33 || djydwfc_playMethod == 44 || djydwfc_playMethod == 54 || djydwfc_playMethod == 61
        || djydwfc_playMethod == 24 || djydwfc_playMethod == 35 || djydwfc_playMethod == 46 || djydwfc_playMethod == 51 || djydwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["djydwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 74 || djydwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        LotteryStorage["djydwfc"]["line1"].push(array[0]+"");
        LotteryStorage["djydwfc"]["line2"].push(array[1]+"");
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line2"], function(k, v){
            $("#" + "djydwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 75 || djydwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        LotteryStorage["djydwfc"]["line1"].push(array[0]+"");
        LotteryStorage["djydwfc"]["line2"].push(array[1]+"");
        LotteryStorage["djydwfc"]["line3"].push(array[2]+"");
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line2"], function(k, v){
            $("#" + "djydwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line3"], function(k, v){
            $("#" + "djydwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);
        LotteryStorage["djydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["djydwfc"]["line"+lines[1]].push(array[1]+"");
        $.each(LotteryStorage["djydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "djydwfc_line" + lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "djydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        LotteryStorage["djydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["djydwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["djydwfc"]["line"+lines[2]].push(array[2]+"");

        $.each(LotteryStorage["djydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "djydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "djydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "djydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        LotteryStorage["djydwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["djydwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["djydwfc"]["line"+lines[2]].push(array[2]+"");
        LotteryStorage["djydwfc"]["line"+lines[3]].push(array[3]+"");

        $.each(LotteryStorage["djydwfc"]["line"+lines[0]], function(k, v){
            $("#" + "djydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line"+lines[1]], function(k, v){
            $("#" + "djydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line"+lines[2]], function(k, v){
            $("#" + "djydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["djydwfc"]["line"+lines[3]], function(k, v){
            $("#" + "djydwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
        });
    }else if(djydwfc_playType == 14){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["djydwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["djydwfc"]["line1"], function(k, v){
            $("#" + "djydwfc_line1" + v).toggleClass("redBalls_active");
        });
    }
    djydwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function djydwfc_checkOutRandom(playMethod){
    var obj = new Object();
    if(djydwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(djydwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(djydwfc_playMethod == 18 || djydwfc_playMethod == 29 || djydwfc_playMethod == 40){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
        }
    }else if(djydwfc_playMethod == 22 || djydwfc_playMethod == 33 || djydwfc_playMethod == 44){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 54;
    }else if(djydwfc_playMethod == 54 || djydwfc_playMethod == 61){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 9;
    }
    else if(djydwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(djydwfc_playMethod == 37 || djydwfc_playMethod == 26 || djydwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(djydwfc_playMethod == 39 || djydwfc_playMethod == 28 || djydwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        obj.nums = number;
        obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
    }else if(djydwfc_playMethod == 41 || djydwfc_playMethod == 30 || djydwfc_playMethod == 19){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(djydwfc_playMethod == 52 || djydwfc_playMethod == 59 || djydwfc_playMethod == 64 || djydwfc_playMethod == 66 || djydwfc_playMethod == 68
        ||djydwfc_playMethod == 70 || djydwfc_playMethod == 72){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(djydwfc_playMethod == 42 || djydwfc_playMethod == 31 || djydwfc_playMethod == 20 || djydwfc_playMethod == 73){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(djydwfc_playMethod == 43 || djydwfc_playMethod == 32 || djydwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        obj.nums = number;
        obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
    }else if(djydwfc_playMethod == 48 || djydwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(djydwfc_playMethod == 50 || djydwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
    }else if(djydwfc_playMethod == 53 || djydwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
    }else if(djydwfc_playMethod == 62){
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
    }else if(djydwfc_playMethod == 63 || djydwfc_playMethod == 65 || djydwfc_playMethod == 67 || djydwfc_playMethod == 69 || djydwfc_playMethod == 71
        || djydwfc_playMethod == 24 || djydwfc_playMethod == 35 || djydwfc_playMethod == 46){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 1;
    }else if(djydwfc_playMethod == 25 || djydwfc_playMethod == 36 || djydwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        var array = ["豹子","顺子","对子","半顺","杂六"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(djydwfc_playMethod == 51 || djydwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
        }
    }else if(djydwfc_playMethod == 74 || djydwfc_playMethod == 76){
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
    }else if(djydwfc_playMethod == 75 || djydwfc_playMethod == 77){
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
    }else if(djydwfc_playMethod == 78){
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
    }else if(djydwfc_playMethod == 84){
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
    }else if(djydwfc_playMethod == 93){
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
    obj.sntuo = djydwfc_sntuo;
    obj.multiple = 1;
    obj.rebates = djydwfc_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('djydwfc',djydwfc_playMethod,obj);  //机选奖金计算
    obj.award = $('#djydwfc_minAward').html();     //奖金
    obj.maxAward = $('#djydwfc_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [djydwfcValidateData 单式数据验证]
 */
function djydwfcValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#djydwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
    djydwfcValidData(textStr,type);
}

function djydwfcValidData(str,type){
    if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
        array,
        result,
        content = {};
    if(djydwfc_playMethod == 1){
        content.str = str;
        content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 10){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 38 || djydwfc_playMethod == 27 || djydwfc_playMethod == 16){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 45 || djydwfc_playMethod == 34 || djydwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 49 || djydwfc_playMethod == 56){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 79){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,2);
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 82){
        content.str = str;
        content.weishu = 2;
        content.duizi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,2);
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 85){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,3);
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 88){
        content.str = str;
        content.weishu = 3;
        content.zusan = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,3);
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 90){
        content.str = str;
        content.weishu = 3;
        content.zuliu = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,3);
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 91){
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,3);
        djydwfcShowFooter(true,notes);
    }else if(djydwfc_playMethod == 94){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#djydwfc_tab .button.red").size() ,4);
        djydwfcShowFooter(true,notes);
    }

    $('#djydwfc_delRepeat').off('click');
    $('#djydwfc_delRepeat').on('click',function () {
        content.str = $('#djydwfc_single').val() ? $('#djydwfc_single').val() : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        array = rptResult.num || [];
        notes = rptResult.length;
        djydwfcShowFooter(true,notes);
        $("#djydwfc_single").val(array.join(" "));
    });

    $("#djydwfc_single").val(array.join(" "));
    return notes;
}

function djydwfcShowFooter(isValid,notes){
    $('#djydwfc_zhushu').text(notes);
    if($("#djydwfc_modeId").val() == "8"){
        $('#djydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#djydwfc_beiNum").val()),0.002));
    }else if ($("#djydwfc_modeId").val() == "2"){
        $('#djydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#djydwfc_beiNum").val()),0.2));
    }else if ($("#djydwfc_modeId").val() == "1"){
        $('#djydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#djydwfc_beiNum").val()),0.02));
    }else{
        $('#djydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#djydwfc_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    djydwfc_initFooterButton();
    calcAwardWin('djydwfc',djydwfc_playMethod);  //计算奖金和盈利
}