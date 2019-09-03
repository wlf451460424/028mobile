var taiwwfc_playType = 2;
var taiwwfc_playMethod = 15;
var taiwwfc_sntuo = 0;
var taiwwfc_rebate;
var taiwwfcScroll;

//进入这个页面时调用
function taiwwfcPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("taiwwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("taiwwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function taiwwfcPageUnloadedPanel(){
    $("#taiwwfc_queding").off('click');
    $("#taiwwfcPage_back").off('click');
    $("#taiwwfc_ballView").empty();
    $("#taiwwfcSelect").empty();
    var $select = $('<select class="cs-select cs-skin-overlay" id="taiwwfcPlaySelect"></select>');
    $("#taiwwfcSelect").append($select);
}

//入口函数
function taiwwfc_init(){
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
    $("#taiwwfc_title").html(LotteryInfo.getLotteryNameByTag("taiwwfc"));
    for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
        var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
        for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
           
			if($.inArray(j,onShowArray)>-1)continue;
			
            if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
                var name = LotteryInfo.getMethodName("ssc",j);
                if(i == taiwwfc_playType && j == taiwwfc_playMethod){
                    $play.append('<option value="taiwwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
                }else{
                    $play.append('<option value="taiwwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
                    
                    //如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(taiwwfc_playMethod,onShowArray)>-1 ){
						taiwwfc_playType = i;
						taiwwfc_playMethod = j;
					}
                }
            }
        }
        
        //如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#taiwwfcPlaySelect").append($play);
		}
    }
    
    if($("#taiwwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

    [].slice.call( document.getElementById("taiwwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el, {
            stickyPlaceholder: true,
            onChange:taiwwfcChangeItem
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

    GetLotteryInfo("taiwwfc",function (){
        taiwwfcChangeItem("taiwwfc"+taiwwfc_playMethod);
    });

    //添加滑动条
    if(!taiwwfcScroll){
        taiwwfcScroll = new IScroll('#taiwwfcContent',{
            click:true,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    }

    //获取期号
    getQihao("taiwwfc",LotteryInfo.getLotteryIdByTag("taiwwfc"));

    //获取上一期开奖
    queryLastPrize("taiwwfc");

    //获取单挑和单期最高奖金
    getLotteryMaxBonus('taiwwfc');

    //机选选号
    $("#taiwwfc_random").on('click', function(event) {
        taiwwfc_randomOne();
    });

    //返回
    $("#taiwwfcPage_back").on('click', function(event) {
        // taiwwfc_playType = 2;
        // taiwwfc_playMethod = 15;
        $("#taiwwfc_ballView").empty();
        localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
        taiwwfc_qingkongAll();
        setPanelBackPage_Fun('lotteryHallPage');
    });
    
    $("#taiwwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",taiwwfc_playMethod));
	//玩法说明
	$("#taiwwfc_paly_shuoming").off('click');
	$("#taiwwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#taiwwfc_shuoming").text());
	});

    qingKong("taiwwfc");//清空
    taiwwfc_submitData();
}

function taiwwfcResetPlayType(){
    taiwwfc_playType = 2;
    taiwwfc_playMethod = 15;
}

function taiwwfcChangeItem(val) {
    taiwwfc_qingkongAll();
    var temp = val.substring("taiwwfc".length,val.length);
    if(val == "taiwwfc0"){
        //直选复式
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 0;
        createFiveLineLayout("taiwwfc", function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc1"){
        //直选单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 1;
        $("#taiwwfc_ballView").empty();
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc2"){
        //组选120
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 2;
        createOneLineLayout("taiwwfc","至少选择5个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc3"){
        //组选60
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 3;
        var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc4"){
        //组选30
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 4;
        var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc5"){
        //组选20
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 5;
        var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc6"){
        //组选10
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 6;
        var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc7"){
        //组选5
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 7
        var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc8"){
        //总和大小单双
        $("#taiwwfc_random").show();
        var num = ["大","小","单","双"];
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 0;
        taiwwfc_playMethod = 8;
        createNonNumLayout("taiwwfc",taiwwfc_playMethod,num,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc9"){
        //直选复式
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 1;
        taiwwfc_playMethod = 9;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createFourLineLayout("taiwwfc",tips, function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc10"){
        //直选单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 1;
        taiwwfc_playMethod = 10;
        $("#taiwwfc_ballView").empty();
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc11"){
        //组选24
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 1;
        taiwwfc_playMethod = 11;
        createOneLineLayout("taiwwfc","至少选择4个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc12"){
        //组选12
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 1;
        taiwwfc_playMethod = 12;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc13"){
        //组选6
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 1;
        taiwwfc_playMethod = 13;
        createOneLineLayout("taiwwfc","二重号:至少选择2个号码",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc14"){
        //组选4
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 1;
        taiwwfc_playMethod = 14;
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc15"){
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 15;
        var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
        createThreeLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc16"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 16;
        $("#taiwwfc_ballView").empty();
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc17"){
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 17;
        createSumLayout("taiwwfc",0,27,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc18"){
        //直选跨度
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 18;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc19"){
        //后三组三
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 19;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc20"){
        //后三组六
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 20;
        createOneLineLayout("taiwwfc","至少选择3个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc21"){
        //后三和值
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 21;
        createSumLayout("taiwwfc",1,26,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc22"){
        //后三组选包胆
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 22;
        taiwwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("taiwwfc",array,["请选择一个号码"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc23"){
        //后三混合组选
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 23;
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc24"){
        //和值尾数
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 24;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc25"){
        //特殊号
        $("#taiwwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 2;
        taiwwfc_playMethod = 25;
        createNonNumLayout("taiwwfc",taiwwfc_playMethod,num,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc26"){
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 26;
        var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
        createThreeLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc27"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 27;
        $("#taiwwfc_ballView").empty();
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc28"){
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 28;
        createSumLayout("taiwwfc",0,27,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc29"){
        //直选跨度
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 29;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc30"){
        //中三组三
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 30;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc31"){
        //中三组六
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 31;
        createOneLineLayout("taiwwfc","至少选择3个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc32"){
        //中三和值
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 32;
        createSumLayout("taiwwfc",1,26,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc33"){
        //中三组选包胆
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 33;
        taiwwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("taiwwfc",array,["请选择一个号码"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc34"){
        //中三混合组选
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 34;
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc35"){
        //和值尾数
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 35;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc36"){
        //特殊号
        $("#taiwwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 3;
        taiwwfc_playMethod = 36;
        createNonNumLayout("taiwwfc",taiwwfc_playMethod,num,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc37"){
        //直选复式
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 37;
        var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
        createThreeLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc38"){
        //直选单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 38;
        $("#taiwwfc_ballView").empty();
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc39"){
        //和值
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 39;
        createSumLayout("taiwwfc",0,27,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc40"){
        //直选跨度
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 40;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc41"){
        //前三组三
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 41;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc42"){
        //前三组六
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 42;
        createOneLineLayout("taiwwfc","至少选择3个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc43"){
        //前三和值
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 43;
        createSumLayout("taiwwfc",1,26,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc44"){
        //前三组选包胆
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 44;
        taiwwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("taiwwfc",array,["请选择一个号码"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc45"){
        //前三混合组选
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 45;
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc46"){
        //和值尾数
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 46;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc47"){
        //特殊号
        $("#taiwwfc_random").show();
        var num = ["豹子","顺子","对子","半顺","杂六"];
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 4;
        taiwwfc_playMethod = 47;
        createNonNumLayout("taiwwfc",taiwwfc_playMethod,num,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc48"){
        //后二复式
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 5;
        taiwwfc_playMethod = 48;
        var tips = ["十位：可选1-10个","个位：可选1-10个"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc49"){
        //后二单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 5;
        taiwwfc_playMethod = 49;
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc50"){
        //后二和值
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 5;
        taiwwfc_playMethod = 50;
        createSumLayout("taiwwfc",0,18,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc51"){
        //直选跨度
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 5;
        taiwwfc_playMethod = 51;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc52"){
        //后二组选
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 5;
        taiwwfc_playMethod = 52;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc53"){
        //后二和值
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 5;
        taiwwfc_playMethod = 53;
        createSumLayout("taiwwfc",1,17,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc54"){
        //后二组选包胆
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 5;
        taiwwfc_playMethod = 54;
        taiwwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("taiwwfc",array,["请选择一个号码"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc55"){
        //前二复式
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 6;
        taiwwfc_playMethod = 55;
        var tips = ["万位：可选1-10个","千位：可选1-10个"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc56"){
        //前二单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 6;
        taiwwfc_playMethod = 56;
        taiwwfc_qingkongAll();
        var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
    }else if(val == "taiwwfc57"){
        //前二和值
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 6;
        taiwwfc_playMethod = 57;
        createSumLayout("taiwwfc",0,18,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc58"){
        //直选跨度
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 6;
        taiwwfc_playMethod = 58;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc59"){
        //前二组选
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 6;
        taiwwfc_playMethod = 59;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc60"){
        //前二和值
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 6;
        taiwwfc_playMethod = 60;
        createSumLayout("taiwwfc",1,17,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc61"){
        //前二组选包胆
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 6;
        taiwwfc_playMethod = 61;
        taiwwfc_qingkongAll();
        var array = ["0","1","2","3","4","5","6","7","8","9"];
        createMutexBallLayout("taiwwfc",array,["请选择一个号码"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc62"){
        //定位复式
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 7;
        taiwwfc_playMethod = 62;
        createFiveLineLayout("taiwwfc", function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc63"){
        //后三一码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 63;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc64"){
        //后三二码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 64;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc65"){
        //前三一码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 65;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc66"){
        //前三二码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 66;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc67"){
        //后四一码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 67;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc68"){
        //后四二码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 68;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc69"){
        //前四一码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 69;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc70"){
        //前四二码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 70;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc71"){
        //五星一码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 71;
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc72"){
        //五星二码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 72;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc73"){
        //五星三码
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 8;
        taiwwfc_playMethod = 73;
        createOneLineLayout("taiwwfc","至少选择3个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc74"){
        //后二大小单双
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 9;
        taiwwfc_playMethod = 74;
        createTextBallTwoLayout("taiwwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc75"){
        //后三大小单双
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 9;
        taiwwfc_playMethod = 75;
        createTextBallThreeLayout("taiwwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc76"){
        //前二大小单双
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 9;
        taiwwfc_playMethod = 76;
        createTextBallTwoLayout("taiwwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc77"){
        //前三大小单双
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 9;
        taiwwfc_playMethod = 77;
        createTextBallThreeLayout("taiwwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc78"){
        //直选复式
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 10;
        taiwwfc_playMethod = 78;
        createFiveLineLayout("taiwwfc",function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc79"){
        //直选单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 10;
        taiwwfc_playMethod = 79;
        var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
        createRenXuanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc80"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 10;
        taiwwfc_playMethod = 80;
        createSumLayout("taiwwfc",0,18,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc81"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 10;
        taiwwfc_playMethod = 81;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc82"){
        //组选单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 10;
        taiwwfc_playMethod = 82;
        var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
        createRenXuanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc83"){
        //组选和值
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 10;
        taiwwfc_playMethod = 83;
        createSumLayout("taiwwfc",1,17,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc84"){
        //直选复式
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 84;
        createFiveLineLayout("taiwwfc", function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc85"){
        //直选单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 85;
        var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
        createRenXuanSanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc86"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 86;
        createSumLayout("taiwwfc",0,27,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanSanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc87"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 87;
        createOneLineLayout("taiwwfc","至少选择2个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanSanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc88"){
        //组选单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 88;
        var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
        createRenXuanSanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc89"){
        //组选和值
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 89;
        createOneLineLayout("taiwwfc","至少选择3个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanSanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc90"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 90;
        var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
        createRenXuanSanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc91"){
        //混合组选
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 91;
        var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
        createRenXuanSanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc92"){
        //组选和值
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 11;
        taiwwfc_playMethod = 92;
        createSumLayout("taiwwfc",1,26,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanSanLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc93"){
        $("#taiwwfc_random").show();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 12;
        taiwwfc_playMethod = 93;
        createFiveLineLayout("taiwwfc", function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc94"){
        //直选单式
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 3;
        taiwwfc_playType = 12;
        taiwwfc_playMethod = 94;
        var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
        createSingleLayout("taiwwfc",tips);
        createRenXuanSiLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc95"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 12;
        taiwwfc_playMethod = 95;
        createOneLineLayout("taiwwfc","至少选择4个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanSiLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc96"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 12;
        taiwwfc_playMethod = 96;
        var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanSiLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc97"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 12;
        taiwwfc_playMethod = 97;
        $("#taiwwfc_ballView").empty();
        createOneLineLayout("taiwwfc","二重号:至少选择2个号码",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanSiLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc98"){
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 12;
        taiwwfc_playMethod = 98;
        $("#taiwwfc_ballView").empty();
        var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
        createTwoLineLayout("taiwwfc",tips,0,9,false,function(){
            taiwwfc_calcNotes();
        });
        createRenXuanSiLayout("taiwwfc",taiwwfc_playMethod,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc99"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 13;
        taiwwfc_playMethod = 99;
        $("#taiwwfc_ballView").empty();
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc100"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 13;
        taiwwfc_playMethod = 100;
        $("#taiwwfc_ballView").empty();
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc101"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 13;
        taiwwfc_playMethod = 101;
        $("#taiwwfc_ballView").empty();
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc102"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 13;
        taiwwfc_playMethod = 102;
        $("#taiwwfc_ballView").empty();
        createOneLineLayout("taiwwfc","至少选择1个",0,9,false,function(){
            taiwwfc_calcNotes();
        });
        taiwwfc_qingkongAll();
    }else if(val == "taiwwfc103"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 103;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc104"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 104;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc105"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 105;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc106"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 106;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc107"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 107;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc108"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 108;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc109"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 109;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc110"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 110;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc111"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 111;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }else if(val == "taiwwfc112"){
        taiwwfc_qingkongAll();
        $("#taiwwfc_random").hide();
        taiwwfc_sntuo = 0;
        taiwwfc_playType = 14;
        taiwwfc_playMethod = 112;
        createTextBallOneLayout("taiwwfc",["龙","虎","和"],["至少选择一个"],function(){
            taiwwfc_calcNotes();
        });
    }

    if(taiwwfcScroll){
        taiwwfcScroll.refresh();
        taiwwfcScroll.scrollTo(0,0,1);
    }
    
    $("#taiwwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
    
    initFooterData("taiwwfc",temp);
    hideRandomWhenLi("taiwwfc",taiwwfc_sntuo,taiwwfc_playMethod);
    taiwwfc_calcNotes();
}
/**
 * [taiwwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function taiwwfc_initFooterButton(){
    if(taiwwfc_playMethod == 0 || taiwwfc_playMethod == 62 || taiwwfc_playMethod == 78
        || taiwwfc_playMethod == 84 || taiwwfc_playMethod == 93 || taiwwfc_playType == 7){
        if(LotteryStorage["taiwwfc"]["line1"].length > 0 || LotteryStorage["taiwwfc"]["line2"].length > 0 ||
            LotteryStorage["taiwwfc"]["line3"].length > 0 || LotteryStorage["taiwwfc"]["line4"].length > 0 ||
            LotteryStorage["taiwwfc"]["line5"].length > 0){
            $("#taiwwfc_qingkong").css("opacity",1.0);
        }else{
            $("#taiwwfc_qingkong").css("opacity",0.4);
        }
    }else if(taiwwfc_playMethod == 9){
        if(LotteryStorage["taiwwfc"]["line1"].length > 0 || LotteryStorage["taiwwfc"]["line2"].length > 0 ||
            LotteryStorage["taiwwfc"]["line3"].length > 0 || LotteryStorage["taiwwfc"]["line4"].length > 0 ){
            $("#taiwwfc_qingkong").css("opacity",1.0);
        }else{
            $("#taiwwfc_qingkong").css("opacity",0.4);
        }
    }else if(taiwwfc_playMethod == 37 || taiwwfc_playMethod == 4 || taiwwfc_playMethod == 6
        || taiwwfc_playMethod == 26 || taiwwfc_playMethod == 15 || taiwwfc_playMethod == 75 || taiwwfc_playMethod == 77){
        if(LotteryStorage["taiwwfc"]["line1"].length > 0 || LotteryStorage["taiwwfc"]["line2"].length > 0
            || LotteryStorage["taiwwfc"]["line3"].length > 0){
            $("#taiwwfc_qingkong").css("opacity",1.0);
        }else{
            $("#taiwwfc_qingkong").css("opacity",0.4);
        }
    }else if(taiwwfc_playMethod == 3 || taiwwfc_playMethod == 4 || taiwwfc_playMethod == 5
        || taiwwfc_playMethod == 6 || taiwwfc_playMethod == 7 || taiwwfc_playMethod == 12
        || taiwwfc_playMethod == 14 || taiwwfc_playMethod == 48 || taiwwfc_playMethod == 55
        || taiwwfc_playMethod == 74 || taiwwfc_playMethod == 76 || taiwwfc_playMethod == 96 || taiwwfc_playMethod == 98){
        if(LotteryStorage["taiwwfc"]["line1"].length > 0 || LotteryStorage["taiwwfc"]["line2"].length > 0){
            $("#taiwwfc_qingkong").css("opacity",1.0);
        }else{
            $("#taiwwfc_qingkong").css("opacity",0.4);
        }
    }else if(taiwwfc_playMethod == 2 || taiwwfc_playMethod == 8 || taiwwfc_playMethod == 11 || taiwwfc_playMethod == 13 || taiwwfc_playMethod == 39
        || taiwwfc_playMethod == 28 || taiwwfc_playMethod == 17 || taiwwfc_playMethod == 18 || taiwwfc_playMethod == 24 || taiwwfc_playMethod == 41
        || taiwwfc_playMethod == 25 || taiwwfc_playMethod == 29 || taiwwfc_playMethod == 42 || taiwwfc_playMethod == 43 || taiwwfc_playMethod == 30
        || taiwwfc_playMethod == 35 || taiwwfc_playMethod == 36 || taiwwfc_playMethod == 31 || taiwwfc_playMethod == 32 || taiwwfc_playMethod == 19
        || taiwwfc_playMethod == 40 || taiwwfc_playMethod == 46 || taiwwfc_playMethod == 20 || taiwwfc_playMethod == 21 || taiwwfc_playMethod == 50
        || taiwwfc_playMethod == 47 || taiwwfc_playMethod == 51 || taiwwfc_playMethod == 52 || taiwwfc_playMethod == 53 || taiwwfc_playMethod == 57 || taiwwfc_playMethod == 63
        || taiwwfc_playMethod == 58 || taiwwfc_playMethod == 59 || taiwwfc_playMethod == 60 || taiwwfc_playMethod == 65 || taiwwfc_playMethod == 80 || taiwwfc_playMethod == 81 || taiwwfc_playType == 8
        || taiwwfc_playMethod == 83 || taiwwfc_playMethod == 86 || taiwwfc_playMethod == 87 || taiwwfc_playMethod == 22 || taiwwfc_playMethod == 33 || taiwwfc_playMethod == 44
        || taiwwfc_playMethod == 89 || taiwwfc_playMethod == 92 || taiwwfc_playMethod == 95 || taiwwfc_playMethod == 54 || taiwwfc_playMethod == 61
        || taiwwfc_playMethod == 97 || taiwwfc_playType == 13  || taiwwfc_playType == 14){
        if(LotteryStorage["taiwwfc"]["line1"].length > 0){
            $("#taiwwfc_qingkong").css("opacity",1.0);
        }else{
            $("#taiwwfc_qingkong").css("opacity",0.4);
        }
    }else{
        $("#taiwwfc_qingkong").css("opacity",0);
    }

    if($("#taiwwfc_qingkong").css("opacity") == "0"){
        $("#taiwwfc_qingkong").css("display","none");
    }else{
        $("#taiwwfc_qingkong").css("display","block");
    }

    if($('#taiwwfc_zhushu').html() > 0){
        $("#taiwwfc_queding").css("opacity",1.0);
    }else{
        $("#taiwwfc_queding").css("opacity",0.4);
    }
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  taiwwfc_qingkongAll(){
    $("#taiwwfc_ballView span").removeClass('redBalls_active');
    LotteryStorage["taiwwfc"]["line1"] = [];
    LotteryStorage["taiwwfc"]["line2"] = [];
    LotteryStorage["taiwwfc"]["line3"] = [];
    LotteryStorage["taiwwfc"]["line4"] = [];
    LotteryStorage["taiwwfc"]["line5"] = [];

    localStorageUtils.removeParam("taiwwfc_line1");
    localStorageUtils.removeParam("taiwwfc_line2");
    localStorageUtils.removeParam("taiwwfc_line3");
    localStorageUtils.removeParam("taiwwfc_line4");
    localStorageUtils.removeParam("taiwwfc_line5");

    $('#taiwwfc_zhushu').text(0);
    $('#taiwwfc_money').text(0);
    clearAwardWin("taiwwfc");
    taiwwfc_initFooterButton();
}

/**
 * [taiwwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function taiwwfc_calcNotes(){
	$('#taiwwfc_modeId').blur();
	$('#taiwwfc_fandian').blur();
	
    var notes = 0;

    if(taiwwfc_playMethod == 0){
        notes = LotteryStorage["taiwwfc"]["line1"].length *
            LotteryStorage["taiwwfc"]["line2"].length *
            LotteryStorage["taiwwfc"]["line3"].length *
            LotteryStorage["taiwwfc"]["line4"].length *
            LotteryStorage["taiwwfc"]["line5"].length;
    }else if(taiwwfc_playMethod == 2){
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,5);
    }else if(taiwwfc_playMethod == 3){
        if (LotteryStorage["taiwwfc"]["line1"].length >= 1 && LotteryStorage["taiwwfc"]["line2"].length >= 3) {
            notes = getArraySelect(3,LotteryStorage["taiwwfc"]["line1"],LotteryStorage["taiwwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(taiwwfc_playMethod == 4){
        if (LotteryStorage["taiwwfc"]["line1"].length >= 2 && LotteryStorage["taiwwfc"]["line2"].length >= 1) {
            notes = getArraySelect(2,LotteryStorage["taiwwfc"]["line2"],LotteryStorage["taiwwfc"]["line1"]);
        }else{
            notes = 0;
        }
    }else if(taiwwfc_playMethod == 5 || taiwwfc_playMethod == 12){
        if (LotteryStorage["taiwwfc"]["line1"].length >= 1 && LotteryStorage["taiwwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["taiwwfc"]["line1"],LotteryStorage["taiwwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(taiwwfc_playMethod == 6 || taiwwfc_playMethod == 7 || taiwwfc_playMethod == 14){
        if (LotteryStorage["taiwwfc"]["line1"].length >= 1 && LotteryStorage["taiwwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["taiwwfc"]["line1"],LotteryStorage["taiwwfc"]["line2"]);
        }else{
            notes = 0;
        }
    }else if(taiwwfc_playMethod == 9){
        notes = LotteryStorage["taiwwfc"]["line1"].length *
            LotteryStorage["taiwwfc"]["line2"].length *
            LotteryStorage["taiwwfc"]["line3"].length *
            LotteryStorage["taiwwfc"]["line4"].length;
    }else if(taiwwfc_playMethod == 18 || taiwwfc_playMethod == 29 || taiwwfc_playMethod == 40){
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["taiwwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
            }
        }
    }else if(taiwwfc_playMethod == 22 || taiwwfc_playMethod == 33 || taiwwfc_playMethod == 44 ){
        notes = 54;
    }else if(taiwwfc_playMethod == 54 || taiwwfc_playMethod == 61){
        notes = 9;
    }else if(taiwwfc_playMethod == 51 || taiwwfc_playMethod == 58){
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            var temp = parseInt(LotteryStorage["taiwwfc"]["line1"][i]);
            if(temp == 0){
                notes += 10;
            }else {
                notes += mathUtil.getCCombination(10 - temp,1) * 2;
            }
        }
    }else if(taiwwfc_playMethod == 11){
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,4);
    }else if(taiwwfc_playMethod == 13|| taiwwfc_playMethod == 64 || taiwwfc_playMethod == 66 || taiwwfc_playMethod == 68 || taiwwfc_playMethod == 70 || taiwwfc_playMethod == 72){
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,2);
    }else if(taiwwfc_playMethod == 37 || taiwwfc_playMethod == 26 || taiwwfc_playMethod == 15 || taiwwfc_playMethod == 75 || taiwwfc_playMethod == 77){
        notes = LotteryStorage["taiwwfc"]["line1"].length *
            LotteryStorage["taiwwfc"]["line2"].length *
            LotteryStorage["taiwwfc"]["line3"].length ;
    }else if(taiwwfc_playMethod == 39 || taiwwfc_playMethod == 28 || taiwwfc_playMethod == 17){
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["taiwwfc"]["line1"][i]);
        };
    }else if(taiwwfc_playMethod == 41 || taiwwfc_playMethod == 30 || taiwwfc_playMethod == 19){
        notes = mathUtil.getACombination(LotteryStorage["taiwwfc"]["line1"].length,2);
    }else if(taiwwfc_playMethod == 42 || taiwwfc_playMethod == 31 || taiwwfc_playMethod == 20 || taiwwfc_playMethod == 68 || taiwwfc_playMethod == 73){
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,3);
    }else if(taiwwfc_playMethod == 43 || taiwwfc_playMethod == 32 || taiwwfc_playMethod == 21){
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["taiwwfc"]["line1"][i]);
        };
    }else if(taiwwfc_playMethod == 48 || taiwwfc_playMethod == 55 || taiwwfc_playMethod == 74 || taiwwfc_playMethod == 76){
        notes = LotteryStorage["taiwwfc"]["line1"].length *
            LotteryStorage["taiwwfc"]["line2"].length ;
    }else if(taiwwfc_playMethod == 50 || taiwwfc_playMethod == 57){
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["taiwwfc"]["line1"][i]);
        };
    }else if(taiwwfc_playMethod == 52 || taiwwfc_playMethod == 59){
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,2);
    }else if(taiwwfc_playMethod == 53 || taiwwfc_playMethod == 60){
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["taiwwfc"]["line1"][i]);
        };
    }else if(taiwwfc_playMethod == 62){
        notes = LotteryStorage["taiwwfc"]["line1"].length +
            LotteryStorage["taiwwfc"]["line2"].length +
            LotteryStorage["taiwwfc"]["line3"].length +
            LotteryStorage["taiwwfc"]["line4"].length +
            LotteryStorage["taiwwfc"]["line5"].length;
    }else if(taiwwfc_playType == 13 || taiwwfc_playType == 14 || taiwwfc_playMethod == 8 || taiwwfc_playMethod == 71
        || taiwwfc_playMethod == 24 || taiwwfc_playMethod == 25 || taiwwfc_playMethod == 35 || taiwwfc_playMethod == 36 || taiwwfc_playMethod == 46
        || taiwwfc_playMethod == 47 || taiwwfc_playMethod == 63 || taiwwfc_playMethod == 65 || taiwwfc_playMethod == 67 || taiwwfc_playMethod == 69 ){
        notes = LotteryStorage["taiwwfc"]["line1"].length ;
    }else if(taiwwfc_playMethod == 78){
        notes = LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line2"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line3"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line4"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line3"].length +
            LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line4"].length +
            LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line4"].length +
            LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line4"].length * LotteryStorage["taiwwfc"]["line5"].length;
    }else if (taiwwfc_playMethod == 80) {
        if ($("#taiwwfc_tab .button.red").size() < 2) {
            notes = 0;
        }else{
            for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
                notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["taiwwfc"]["line1"][i]);
            };
            notes *= mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,2);
        }
    }else if (taiwwfc_playMethod == 81) {
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,2) * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,2);
    }else if (taiwwfc_playMethod == 83) {
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["taiwwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,2);
    }else if (taiwwfc_playMethod == 84) {
        notes = LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line3"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line4"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line4"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line4"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line4"].length +
            LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line4"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line4"].length * LotteryStorage["taiwwfc"]["line5"].length ;
    }else if (taiwwfc_playMethod == 86) {
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["taiwwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,3);
    }else if (taiwwfc_playMethod == 87) {
        notes = mathUtil.getACombination(LotteryStorage["taiwwfc"]["line1"].length,2) * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,3);
    }else if (taiwwfc_playMethod == 89) {
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,3) * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,3);
    }else if (taiwwfc_playMethod == 92) {
        for (var i = 0; i < LotteryStorage["taiwwfc"]["line1"].length; i++) {
            notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["taiwwfc"]["line1"][i]);
        };
        notes *= mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,3);
    }else if (taiwwfc_playMethod == 93) {
        notes = LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line4"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line4"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line1"].length * LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line4"].length * LotteryStorage["taiwwfc"]["line5"].length +
            LotteryStorage["taiwwfc"]["line2"].length * LotteryStorage["taiwwfc"]["line3"].length * LotteryStorage["taiwwfc"]["line4"].length * LotteryStorage["taiwwfc"]["line5"].length;
    }else if (taiwwfc_playMethod == 95) {
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,4)
            * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,4);
    }else if (taiwwfc_playMethod == 96) {
        if (LotteryStorage["taiwwfc"]["line1"].length >= 1 && LotteryStorage["taiwwfc"]["line2"].length >= 2) {
            notes = getArraySelect(2,LotteryStorage["taiwwfc"]["line1"],LotteryStorage["taiwwfc"]["line2"])
                * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else if (taiwwfc_playMethod == 97) {
        notes = mathUtil.getCCombination(LotteryStorage["taiwwfc"]["line1"].length,2) * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,4);
    }else if (taiwwfc_playMethod == 98) {
        if (LotteryStorage["taiwwfc"]["line1"].length >= 1 && LotteryStorage["taiwwfc"]["line2"].length >= 1) {
            notes = getArraySelect(1,LotteryStorage["taiwwfc"]["line1"],LotteryStorage["taiwwfc"]["line2"]) * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,4);
        }else{
            notes = 0;
        }
    }else{
        notes = taiwwfcValidData($("#taiwwfc_single").val());
    }

    if(taiwwfc_sntuo == 3 || taiwwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","taiwwfc"),LotteryInfo.getMethodId("ssc",taiwwfc_playMethod))){
    }else{
        if(parseInt($('#taiwwfc_modeId').val()) == 8){
            $("#taiwwfc_random").hide();
        }else{
            $("#taiwwfc_random").show();
        }
    }

    //验证是否为空
    if( $("#taiwwfc_beiNum").val() =="" || parseInt($("#taiwwfc_beiNum").val()) == 0){
        $("#taiwwfc_beiNum").val(1);
    }

    //验证慢彩最大倍数为9999
    if($("#taiwwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
        $("#taiwwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
    }

    if(notes > 0) {
        $('#taiwwfc_zhushu').text(notes);
        if($("#taiwwfc_modeId").val() == "8"){
            $('#taiwwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwwfc_beiNum").val()),0.002));
        }else if ($("#taiwwfc_modeId").val() == "2"){
            $('#taiwwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwwfc_beiNum").val()),0.2));
        }else if ($("#taiwwfc_modeId").val() == "1"){
            $('#taiwwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwwfc_beiNum").val()),0.02));
        }else{
            $('#taiwwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwwfc_beiNum").val()),2));
        }
    } else {
        $('#taiwwfc_zhushu').text(0);
        $('#taiwwfc_money').text(0);
    }
    taiwwfc_initFooterButton();
    // 计算奖金盈利
    calcAwardWin('taiwwfc',taiwwfc_playMethod);
}

/**
 * [taiwwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function taiwwfc_submitData(){
    var submitParams = new LotterySubmitParams();
    $("#taiwwfc_queding").bind('click', function(event) {

        taiwwfc_rebate = $("#taiwwfc_fandian option:last").val();
        if(parseInt($('#taiwwfc_zhushu').html()) <= 0){
            toastUtils.showToast('请至少选择一注');
            return;
        }
        taiwwfc_calcNotes();

	    //后台控制是否可以投注
	    if(!check_AgentCanBetting()) return;

	    //设置单笔最低投注额
	    if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

       /* if(parseInt($('#taiwwfc_modeId').val()) == 8){
            if (Number($('#taiwwfc_money').html()) < 0.02){
                toastUtils.showToast('请至少选择0.02元');
                return;
            }
        }*/

        //提示单挑奖金
        getDanTiaoBonus('taiwwfc',taiwwfc_playMethod);

        submitParams.lotteryType = "taiwwfc";
        var play = LotteryInfo.getPlayName("ssc",taiwwfc_playType);
        var playMethod = LotteryInfo.getMethodName("ssc",taiwwfc_playMethod);
        submitParams.playType = play;
        submitParams.playMethod = playMethod;
        submitParams.playTypeIndex = taiwwfc_playType;
        submitParams.playMethodIndex = taiwwfc_playMethod;
        var selectedBalls = [];
        if(taiwwfc_playMethod == 0 || taiwwfc_playMethod == 3 || taiwwfc_playMethod == 4
            || taiwwfc_playMethod == 5 || taiwwfc_playMethod == 6 || taiwwfc_playMethod == 7
            || taiwwfc_playMethod == 9 || taiwwfc_playMethod == 12 || taiwwfc_playMethod == 14
            || taiwwfc_playMethod == 37 || taiwwfc_playMethod == 26 || taiwwfc_playMethod == 15
            || taiwwfc_playMethod == 48 || taiwwfc_playMethod == 55 || taiwwfc_playMethod == 74 || taiwwfc_playType == 9){
            $("#taiwwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            submitParams.nums = selectedBalls.join("|");
        }else if(taiwwfc_playMethod == 2 || taiwwfc_playMethod == 8 || taiwwfc_playMethod == 11 || taiwwfc_playMethod == 13 || taiwwfc_playMethod == 24
            || taiwwfc_playMethod == 39 || taiwwfc_playMethod == 28 || taiwwfc_playMethod == 17 || taiwwfc_playMethod == 18 || taiwwfc_playMethod == 25
            || taiwwfc_playMethod == 22 || taiwwfc_playMethod == 33 || taiwwfc_playMethod == 44 || taiwwfc_playMethod == 54 || taiwwfc_playMethod == 61
            || taiwwfc_playMethod == 41 || taiwwfc_playMethod == 42 || taiwwfc_playMethod == 43 || taiwwfc_playMethod == 29 || taiwwfc_playMethod == 35
            || taiwwfc_playMethod == 30 || taiwwfc_playMethod == 31 || taiwwfc_playMethod == 32 || taiwwfc_playMethod == 40 || taiwwfc_playMethod == 36
            || taiwwfc_playMethod == 19 || taiwwfc_playMethod == 20 || taiwwfc_playMethod == 21 || taiwwfc_playMethod == 46 || taiwwfc_playMethod == 47
            || taiwwfc_playMethod == 50 || taiwwfc_playMethod == 57 || taiwwfc_playType == 8 || taiwwfc_playMethod == 51 || taiwwfc_playMethod == 58
            || taiwwfc_playMethod == 52 || taiwwfc_playMethod == 53|| taiwwfc_playMethod == 59 || taiwwfc_playMethod == 60 || taiwwfc_playType == 13 || taiwwfc_playType == 14){
            $("#taiwwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            submitParams.nums = selectedBalls.join(",");
        }else if(taiwwfc_playType == 7 || taiwwfc_playMethod == 78 || taiwwfc_playMethod == 84 || taiwwfc_playMethod == 93){
            $("#taiwwfc_ballView div.ballView").each(function(){
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
        }else if(taiwwfc_playMethod == 80 || taiwwfc_playMethod == 81 || taiwwfc_playMethod == 83
            || taiwwfc_playMethod == 86 || taiwwfc_playMethod == 87 || taiwwfc_playMethod == 89
            || taiwwfc_playMethod == 92 || taiwwfc_playMethod == 95 || taiwwfc_playMethod == 97){
            $("#taiwwfc_ballView div.ballView").each(function(){
                $(this).find("span.redBalls_active").each(function(){
                    selectedBalls.push($(this).text());
                });
            });
            var temp = selectedBalls.join(",") + "#";

            if ($("#taiwwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#taiwwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#taiwwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#taiwwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#taiwwfc_tab5").hasClass("button red")) {
                temp += "个";
            };

            submitParams.nums = temp;
        }else if (taiwwfc_playMethod == 96 || taiwwfc_playMethod == 98) {
            $("#taiwwfc_ballView div.ballView").each(function(){
                var arr = [];
                $(this).find("span.redBalls_active").each(function(){
                    arr.push($(this).text());
                });
                selectedBalls.push(arr.join(","));
            });
            var temp = selectedBalls.join("|") + "#";
            if ($("#taiwwfc_tab1").hasClass("button red")) {
                temp += "万";
            };
            if ($("#taiwwfc_tab2").hasClass("button red")) {
                temp += "千";
            };
            if ($("#taiwwfc_tab3").hasClass("button red")) {
                temp += "百";
            };
            if ($("#taiwwfc_tab4").hasClass("button red")) {
                temp += "十";
            };
            if ($("#taiwwfc_tab5").hasClass("button red")) {
                temp += "个";
            };
            submitParams.nums = temp;
        }else{
	        //去错误号
	        taiwwfcValidateData("submit");
            var array = handleSingleStr($("#taiwwfc_single").val());
            if(taiwwfc_playMethod == 1 ){
                submitParams.nums = array.join(" ");
            }else if(taiwwfc_playMethod == 10 || taiwwfc_playMethod == 38 || taiwwfc_playMethod == 27
                || taiwwfc_playMethod == 16 || taiwwfc_playMethod == 49 || taiwwfc_playMethod == 56){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join("|");
                    }else{
                        temp = temp + array[i].split("").join("|") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(taiwwfc_playMethod == 45 || taiwwfc_playMethod == 34 || taiwwfc_playMethod == 23){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                submitParams.nums = temp;
            }else if(taiwwfc_playMethod == 79 || taiwwfc_playMethod == 82 || taiwwfc_playMethod == 85 || taiwwfc_playMethod == 88 ||
                taiwwfc_playMethod == 89 || taiwwfc_playMethod == 90 || taiwwfc_playMethod == 91 || taiwwfc_playMethod == 94){
                var temp = "";
                for(var i = 0;i < array.length;i++){
                    if(i == array.length - 1){
                        temp = temp + array[i].split("").join(",");
                    }else{
                        temp = temp + array[i].split("").join(",") + " ";
                    }
                }
                temp +="#";
                if ($("#taiwwfc_tab1").hasClass("button red")) {
                    temp += "万";
                };
                if ($("#taiwwfc_tab2").hasClass("button red")) {
                    temp += "千";
                };
                if ($("#taiwwfc_tab3").hasClass("button red")) {
                    temp += "百";
                };
                if ($("#taiwwfc_tab4").hasClass("button red")) {
                    temp += "十";
                };
                if ($("#taiwwfc_tab5").hasClass("button red")) {
                    temp += "个";
                };

                submitParams.nums = temp;
            }
        }
        localStorageUtils.setParam("playMode",$("#taiwwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#taiwwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#taiwwfc_fandian").val());
        submitParams.notes = $('#taiwwfc_zhushu').html();
        submitParams.sntuo = taiwwfc_sntuo;
        submitParams.multiple = $('#taiwwfc_beiNum').val();  //requirement
        submitParams.rebates = $('#taiwwfc_fandian').val();  //requirement
        submitParams.playMode = $('#taiwwfc_modeId').val();  //requirement
        submitParams.money = $('#taiwwfc_money').html();  //requirement
        submitParams.award = $('#taiwwfc_minAward').html();  //奖金
        submitParams.maxAward = $('#taiwwfc_maxAward').html();  //多级奖金
        submitParams.submit();
        $("#taiwwfc_ballView").empty();
        taiwwfc_qingkongAll();
    });
}

/**
 * [taiwwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function taiwwfc_randomOne(){
    taiwwfc_qingkongAll();
    if(taiwwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        LotteryStorage["taiwwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["taiwwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["taiwwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["taiwwfc"]["line4"].push(redBallArray[3]+"");
        LotteryStorage["taiwwfc"]["line5"].push(redBallArray[4]+"");

        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line2"], function(k, v){
            $("#" + "taiwwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line3"], function(k, v){
            $("#" + "taiwwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line4"], function(k, v){
            $("#" + "taiwwfc_line4" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line5"], function(k, v){
            $("#" + "taiwwfc_line5" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        LotteryStorage["taiwwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        LotteryStorage["taiwwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["taiwwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["taiwwfc"]["line3"].push(redBallArray[2]+"");
        LotteryStorage["taiwwfc"]["line4"].push(redBallArray[3]+"");

        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line2"], function(k, v){
            $("#" + "taiwwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line3"], function(k, v){
            $("#" + "taiwwfc_line3" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line4"], function(k, v){
            $("#" + "taiwwfc_line4" + v).toggleClass("redBalls_active");
        });

    }else if(taiwwfc_playMethod == 37 || taiwwfc_playMethod == 26 || taiwwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        LotteryStorage["taiwwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["taiwwfc"]["line2"].push(redBallArray[1]+"");
        LotteryStorage["taiwwfc"]["line3"].push(redBallArray[2]+"");

        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line2"], function(k, v){
            $("#" + "taiwwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line3"], function(k, v){
            $("#" + "taiwwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 41 || taiwwfc_playMethod == 30 || taiwwfc_playMethod == 19 || taiwwfc_playMethod == 68
        || taiwwfc_playMethod == 52 || taiwwfc_playMethod == 64 || taiwwfc_playMethod == 66
        || taiwwfc_playMethod == 59 || taiwwfc_playMethod == 70 || taiwwfc_playMethod == 72){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["taiwwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 42 || taiwwfc_playMethod == 31 || taiwwfc_playMethod == 20 || taiwwfc_playMethod == 73){
        var redBallArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,redBallArray);
        $.each(array,function (k,v) {
            LotteryStorage["taiwwfc"]["line1"].push(v+"");
        });
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 39 || taiwwfc_playMethod == 28 || taiwwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        LotteryStorage["taiwwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 43 || taiwwfc_playMethod == 32 || taiwwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        LotteryStorage["taiwwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 48 || taiwwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        LotteryStorage["taiwwfc"]["line1"].push(redBallArray[0]+"");
        LotteryStorage["taiwwfc"]["line2"].push(redBallArray[1]+"");

        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line2"], function(k, v){
            $("#" + "taiwwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 25 || taiwwfc_playMethod == 36 || taiwwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        LotteryStorage["taiwwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 50 || taiwwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        LotteryStorage["taiwwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 53 || taiwwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        LotteryStorage["taiwwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 62){
        var line = mathUtil.getRandomNum(1,6);
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["taiwwfc"]["line"+line].push(number+"");
        $.each(LotteryStorage["taiwwfc"]["line"+line], function(k, v){
            $("#" + "taiwwfc_line" + line + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 63 || taiwwfc_playMethod == 67 || taiwwfc_playMethod == 69 || taiwwfc_playMethod == 71 || taiwwfc_playType == 13
        || taiwwfc_playMethod == 65 || taiwwfc_playMethod == 18 || taiwwfc_playMethod == 29 || taiwwfc_playMethod == 40 || taiwwfc_playMethod == 22
        || taiwwfc_playMethod == 33 || taiwwfc_playMethod == 44 || taiwwfc_playMethod == 54 || taiwwfc_playMethod == 61
        || taiwwfc_playMethod == 24 || taiwwfc_playMethod == 35 || taiwwfc_playMethod == 46 || taiwwfc_playMethod == 51 || taiwwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        LotteryStorage["taiwwfc"]["line1"].push(number+'');
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 74 || taiwwfc_playMethod == 76){
        var array = mathUtil.getNums(2,4);
        LotteryStorage["taiwwfc"]["line1"].push(array[0]+"");
        LotteryStorage["taiwwfc"]["line2"].push(array[1]+"");
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line2"], function(k, v){
            $("#" + "taiwwfc_line2" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 75 || taiwwfc_playMethod == 77){
        var array = mathUtil.getNums(3,4);
        LotteryStorage["taiwwfc"]["line1"].push(array[0]+"");
        LotteryStorage["taiwwfc"]["line2"].push(array[1]+"");
        LotteryStorage["taiwwfc"]["line3"].push(array[2]+"");
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line2"], function(k, v){
            $("#" + "taiwwfc_line2" + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line3"], function(k, v){
            $("#" + "taiwwfc_line3" + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 78){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(2,lineArray);
        var array = mathUtil.getNums(2,10);
        LotteryStorage["taiwwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["taiwwfc"]["line"+lines[1]].push(array[1]+"");
        $.each(LotteryStorage["taiwwfc"]["line"+lines[0]], function(k, v){
            $("#" + "taiwwfc_line" + lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line"+lines[1]], function(k, v){
            $("#" + "taiwwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 84){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(3,lineArray);
        var array = mathUtil.getNums(3,10);
        LotteryStorage["taiwwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["taiwwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["taiwwfc"]["line"+lines[2]].push(array[2]+"");

        $.each(LotteryStorage["taiwwfc"]["line"+lines[0]], function(k, v){
            $("#" + "taiwwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line"+lines[1]], function(k, v){
            $("#" + "taiwwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line"+lines[0]], function(k, v){
            $("#" + "taiwwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playMethod == 93){
        var lineArray = mathUtil.getInts(1,5);
        var lines = mathUtil.getDifferentNums(4,lineArray);
        var array = mathUtil.getNums(4,10);
        LotteryStorage["taiwwfc"]["line"+lines[0]].push(array[0]+"");
        LotteryStorage["taiwwfc"]["line"+lines[1]].push(array[1]+"");
        LotteryStorage["taiwwfc"]["line"+lines[2]].push(array[2]+"");
        LotteryStorage["taiwwfc"]["line"+lines[3]].push(array[3]+"");

        $.each(LotteryStorage["taiwwfc"]["line"+lines[0]], function(k, v){
            $("#" + "taiwwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line"+lines[1]], function(k, v){
            $("#" + "taiwwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line"+lines[2]], function(k, v){
            $("#" + "taiwwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
        });
        $.each(LotteryStorage["taiwwfc"]["line"+lines[3]], function(k, v){
            $("#" + "taiwwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
        });
    }else if(taiwwfc_playType == 14){
        var number = mathUtil.getRandomNum(0,2);
        LotteryStorage["taiwwfc"]["line1"].push(number+"");
        $.each(LotteryStorage["taiwwfc"]["line1"], function(k, v){
            $("#" + "taiwwfc_line1" + v).toggleClass("redBalls_active");
        });
    }
    taiwwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function taiwwfc_checkOutRandom(playMethod){
    var obj = new Object();
    if(taiwwfc_playMethod == 0){
        var redBallArray = mathUtil.getNums(5,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 8){
        var number = mathUtil.getRandomNum(0,4);
        var array = ["大","小","单","双"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 18 || taiwwfc_playMethod == 29 || taiwwfc_playMethod == 40){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
        }
    }else if(taiwwfc_playMethod == 22 || taiwwfc_playMethod == 33 || taiwwfc_playMethod == 44){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 54;
    }else if(taiwwfc_playMethod == 54 || taiwwfc_playMethod == 61){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 9;
    }
    else if(taiwwfc_playMethod == 9){
        var redBallArray = mathUtil.getNums(4,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 37 || taiwwfc_playMethod == 26 || taiwwfc_playMethod == 15){
        var redBallArray = mathUtil.getNums(3,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 39 || taiwwfc_playMethod == 28 || taiwwfc_playMethod == 17){
        var number = mathUtil.getRandomNum(0,28);
        obj.nums = number;
        obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
    }else if(taiwwfc_playMethod == 41 || taiwwfc_playMethod == 30 || taiwwfc_playMethod == 19){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 2;
    }else if(taiwwfc_playMethod == 52 || taiwwfc_playMethod == 59 || taiwwfc_playMethod == 64 || taiwwfc_playMethod == 66 || taiwwfc_playMethod == 68
        ||taiwwfc_playMethod == 70 || taiwwfc_playMethod == 72){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(2,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 42 || taiwwfc_playMethod == 31 || taiwwfc_playMethod == 20 || taiwwfc_playMethod == 73){
        var lineArray = mathUtil.getInts(0,9);
        var array = mathUtil.getDifferentNums(3,lineArray);
        obj.nums = array.join(",");
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 43 || taiwwfc_playMethod == 32 || taiwwfc_playMethod == 21){
        var number = mathUtil.getRandomNum(1,27);
        obj.nums = number;
        obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
    }else if(taiwwfc_playMethod == 48 || taiwwfc_playMethod == 55){
        var redBallArray = mathUtil.getNums(2,10);
        obj.nums = redBallArray.join("|");
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 50 || taiwwfc_playMethod == 57){
        var number = mathUtil.getRandomNum(0,19);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
    }else if(taiwwfc_playMethod == 53 || taiwwfc_playMethod == 60){
        var number = mathUtil.getRandomNum(1,18);
        obj.nums = number;
        obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
    }else if(taiwwfc_playMethod == 62){
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
    }else if(taiwwfc_playMethod == 63 || taiwwfc_playMethod == 65 || taiwwfc_playMethod == 67 || taiwwfc_playMethod == 69 || taiwwfc_playMethod == 71
        || taiwwfc_playMethod == 24 || taiwwfc_playMethod == 35 || taiwwfc_playMethod == 46){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 25 || taiwwfc_playMethod == 36 || taiwwfc_playMethod == 47){
        var number = mathUtil.getRandomNum(0,5);
        var array = ["豹子","顺子","对子","半顺","杂六"];
        obj.nums = array[number];
        obj.notes = 1;
    }else if(taiwwfc_playMethod == 51 || taiwwfc_playMethod == 58){
        var number = mathUtil.getRandomNum(0,10);
        obj.nums = number;
        if(number == 0){
            obj.notes = 10;
        }else {
            obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
        }
    }else if(taiwwfc_playMethod == 74 || taiwwfc_playMethod == 76){
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
    }else if(taiwwfc_playMethod == 75 || taiwwfc_playMethod == 77){
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
    }else if(taiwwfc_playMethod == 78){
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
    }else if(taiwwfc_playMethod == 84){
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
    }else if(taiwwfc_playMethod == 93){
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
    obj.sntuo = taiwwfc_sntuo;
    obj.multiple = 1;
    obj.rebates = taiwwfc_rebate;
    obj.playMode = "4";
    obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
    calcAwardWin('taiwwfc',taiwwfc_playMethod,obj);  //机选奖金计算
    obj.award = $('#taiwwfc_minAward').html();     //奖金
    obj.maxAward = $('#taiwwfc_maxAward').html();  //多级奖金
    return obj;
}

/**
 * [taiwwfcValidateData 单式数据验证]
 */
function taiwwfcValidateData(type){
    if (typeof type == "undefined"){type = "onblur"}
    var textStr = $("#taiwwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
    taiwwfcValidData(textStr,type);
}

function taiwwfcValidData(str,type){
    if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
        array,
        result,
        content = {};
    if(taiwwfc_playMethod == 1){
        content.str = str;
        content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 10){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 38 || taiwwfc_playMethod == 27 || taiwwfc_playMethod == 16){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 45 || taiwwfc_playMethod == 34 || taiwwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 49 || taiwwfc_playMethod == 56){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length;
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 79){
        content.str = str;
        content.weishu = 2;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,2);
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 82){
        content.str = str;
        content.weishu = 2;
        content.duizi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,2);
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 85){
        content.str = str;
        content.weishu = 3;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,3);
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 88){
        content.str = str;
        content.weishu = 3;
        content.zusan = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,3);
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 90){
        content.str = str;
        content.weishu = 3;
        content.zuliu = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,3);
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 91){
        content.str = str;
        content.weishu = 3;
        content.baozi = true;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,3);
        taiwwfcShowFooter(true,notes);
    }else if(taiwwfc_playMethod == 94){
        content.str = str;
        content.weishu = 4;
        result = handleSingleStr_deleteErr(content,type);
        array = result.num;
        notes = result.length * mathUtil.getCCombination($("#taiwwfc_tab .button.red").size() ,4);
        taiwwfcShowFooter(true,notes);
    }

    $('#taiwwfc_delRepeat').off('click');
    $('#taiwwfc_delRepeat').on('click',function () {
        content.str = $('#taiwwfc_single').val() ? $('#taiwwfc_single').val() : '';
        var rptResult = handleSingleStr_deleteRepeat(content);
        array = rptResult.num || [];
        notes = rptResult.length;
        taiwwfcShowFooter(true,notes);
        $("#taiwwfc_single").val(array.join(" "));
    });

    $("#taiwwfc_single").val(array.join(" "));
    return notes;
}

function taiwwfcShowFooter(isValid,notes){
    $('#taiwwfc_zhushu').text(notes);
    if($("#taiwwfc_modeId").val() == "8"){
        $('#taiwwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwwfc_beiNum").val()),0.002));
    }else if ($("#taiwwfc_modeId").val() == "2"){
        $('#taiwwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwwfc_beiNum").val()),0.2));
    }else if ($("#taiwwfc_modeId").val() == "1"){
        $('#taiwwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwwfc_beiNum").val()),0.02));
    }else{
        $('#taiwwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#taiwwfc_beiNum").val()),2));
    }
    if(!isValid){
        toastUtils.showToast('格式不正确');
    }
    taiwwfc_initFooterButton();
    calcAwardWin('taiwwfc',taiwwfc_playMethod);  //计算奖金和盈利
}