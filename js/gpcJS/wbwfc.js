var wbwfc_playType = 2;
var wbwfc_playMethod = 15;
var wbwfc_sntuo = 0;
var wbwfc_rebate;
var wbwfcScroll;

//进入这个页面时调用
function wbwfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("wbwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("wbwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function wbwfcPageUnloadedPanel(){
	$("#wbwfc_queding").off('click');
	$("#wbwfcPage_back").off('click');
	$("#wbwfc_ballView").empty();
	$("#wbwfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="wbwfcPlaySelect"></select>');
	$("#wbwfcSelect").append($select);
}

//入口函数
function wbwfc_init(){
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
	$("#wbwfc_title").html(LotteryInfo.getLotteryNameByTag("wbwfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == wbwfc_playType && j == wbwfc_playMethod){
					$play.append('<option value="wbwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="wbwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(wbwfc_playMethod,onShowArray)>-1 ){
						wbwfc_playType = i;
						wbwfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#wbwfcPlaySelect").append($play);
		}
	}
	
	if($("#wbwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("wbwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:wbwfcChangeItem
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

	GetLotteryInfo("wbwfc",function (){
		wbwfcChangeItem("wbwfc"+wbwfc_playMethod);
	});

	//添加滑动条
	if(!wbwfcScroll){
		wbwfcScroll = new IScroll('#wbwfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("wbwfc",LotteryInfo.getLotteryIdByTag("wbwfc"));

	//获取上一期开奖
	queryLastPrize("wbwfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('wbwfc');

	//机选选号
	$("#wbwfc_random").off('click');
	$("#wbwfc_random").on('click', function(event) {
		wbwfc_randomOne();
	});

	//返回
	$("#wbwfcPage_back").on('click', function(event) {
		// wbwfc_playType = 2;
		// wbwfc_playMethod = 15;
		$("#wbwfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		wbwfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#wbwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",wbwfc_playMethod));
	//玩法说明
	$("#wbwfc_paly_shuoming").off('click');
	$("#wbwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#wbwfc_shuoming").text());
	});

	qingKong("wbwfc");//清空
	wbwfc_submitData();
}

function wbwfcResetPlayType(){
	wbwfc_playType = 2;
	wbwfc_playMethod = 15;
}

function wbwfcChangeItem(val) {
	wbwfc_qingkongAll();
	var temp = val.substring("wbwfc".length,val.length);
	if(val == "wbwfc0"){
		//直选复式
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 0;
		wbwfc_playMethod = 0;
		createFiveLineLayout("wbwfc", function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc1"){
		//直选单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 0;
		wbwfc_playMethod = 1;
		$("#wbwfc_ballView").empty();
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc2"){
		//组选120
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 0;
		wbwfc_playMethod = 2;
		createOneLineLayout("wbwfc","至少选择5个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc3"){
		//组选60
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 0;
		wbwfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc4"){
		//组选30
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 0;
		wbwfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc5"){
		//组选20
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 0;
		wbwfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc6"){
		//组选10
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 0;
		wbwfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc7"){
		//组选5
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 0;
		wbwfc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc8"){
		//总和大小单双
		$("#wbwfc_random").show();
		var num = ["大","小","单","双"];
		wbwfc_sntuo = 0;
		wbwfc_playType = 0;
		wbwfc_playMethod = 8;
		createNonNumLayout("wbwfc",wbwfc_playMethod,num,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc9"){
		//直选复式
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 1;
		wbwfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("wbwfc",tips, function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc10"){
		//直选单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 1;
		wbwfc_playMethod = 10;
		$("#wbwfc_ballView").empty();
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc11"){
		//组选24
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 1;
		wbwfc_playMethod = 11;
		createOneLineLayout("wbwfc","至少选择4个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc12"){
		//组选12
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 1;
		wbwfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc13"){
		//组选6
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 1;
		wbwfc_playMethod = 13;
		createOneLineLayout("wbwfc","二重号:至少选择2个号码",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc14"){
		//组选4
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 1;
		wbwfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc15"){
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc16"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 2;
		wbwfc_playMethod = 16;
		$("#wbwfc_ballView").empty();
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc17"){
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 17;
		createSumLayout("wbwfc",0,27,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc18"){
		//直选跨度
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 18;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc19"){
		//后三组三
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 19;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc20"){
		//后三组六
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 20;
		createOneLineLayout("wbwfc","至少选择3个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc21"){
		//后三和值
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 21;
		createSumLayout("wbwfc",1,26,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc22"){
		//后三组选包胆
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 22;
		wbwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbwfc",array,["请选择一个号码"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc23"){
		//后三混合组选
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 2;
		wbwfc_playMethod = 23;
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc24"){
		//和值尾数
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 24;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc25"){
		//特殊号
		$("#wbwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbwfc_sntuo = 0;
		wbwfc_playType = 2;
		wbwfc_playMethod = 25;
		createNonNumLayout("wbwfc",wbwfc_playMethod,num,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc26"){
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc27"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 3;
		wbwfc_playMethod = 27;
		$("#wbwfc_ballView").empty();
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc28"){
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 28;
		createSumLayout("wbwfc",0,27,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc29"){
		//直选跨度
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 29;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc30"){
		//中三组三
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 30;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc31"){
		//中三组六
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 31;
		createOneLineLayout("wbwfc","至少选择3个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc32"){
		//中三和值
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 32;
		createSumLayout("wbwfc",1,26,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc33"){
		//中三组选包胆
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 33;
		wbwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbwfc",array,["请选择一个号码"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc34"){
		//中三混合组选
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 3;
		wbwfc_playMethod = 34;
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc35"){
		//和值尾数
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 35;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc36"){
		//特殊号
		$("#wbwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbwfc_sntuo = 0;
		wbwfc_playType = 3;
		wbwfc_playMethod = 36;
		createNonNumLayout("wbwfc",wbwfc_playMethod,num,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc37"){
		//直选复式
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc38"){
		//直选单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 4;
		wbwfc_playMethod = 38;
		$("#wbwfc_ballView").empty();
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc39"){
		//和值
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 39;
		createSumLayout("wbwfc",0,27,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc40"){
		//直选跨度
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 40;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc41"){
		//前三组三
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 41;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc42"){
		//前三组六
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 42;
		createOneLineLayout("wbwfc","至少选择3个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc43"){
		//前三和值
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 43;
		createSumLayout("wbwfc",1,26,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc44"){
		//前三组选包胆
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 44;
		wbwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbwfc",array,["请选择一个号码"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc45"){
		//前三混合组选
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 4;
		wbwfc_playMethod = 45;
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc46"){
		//和值尾数
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 46;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc47"){
		//特殊号
		$("#wbwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbwfc_sntuo = 0;
		wbwfc_playType = 4;
		wbwfc_playMethod = 47;
		createNonNumLayout("wbwfc",wbwfc_playMethod,num,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc48"){
		//后二复式
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 5;
		wbwfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc49"){
		//后二单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 5;
		wbwfc_playMethod = 49;
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc50"){
		//后二和值
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 5;
		wbwfc_playMethod = 50;
		createSumLayout("wbwfc",0,18,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc51"){
		//直选跨度
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 5;
		wbwfc_playMethod = 51;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc52"){
		//后二组选
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 5;
		wbwfc_playMethod = 52;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc53"){
		//后二和值
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 5;
		wbwfc_playMethod = 53;
		createSumLayout("wbwfc",1,17,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc54"){
		//后二组选包胆
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 5;
		wbwfc_playMethod = 54;
		wbwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbwfc",array,["请选择一个号码"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc55"){
		//前二复式
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 6;
		wbwfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc56"){
		//前二单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 6;
		wbwfc_playMethod = 56;
		wbwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
	}else if(val == "wbwfc57"){
		//前二和值
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 6;
		wbwfc_playMethod = 57;
		createSumLayout("wbwfc",0,18,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc58"){
		//直选跨度
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 6;
		wbwfc_playMethod = 58;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc59"){
		//前二组选
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 6;
		wbwfc_playMethod = 59;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc60"){
		//前二和值
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 6;
		wbwfc_playMethod = 60;
		createSumLayout("wbwfc",1,17,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc61"){
		//前二组选包胆
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 6;
		wbwfc_playMethod = 61;
		wbwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbwfc",array,["请选择一个号码"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc62"){
		//定位复式
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 7;
		wbwfc_playMethod = 62;
		createFiveLineLayout("wbwfc", function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc63"){
		//后三一码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 63;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc64"){
		//后三二码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 64;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc65"){
		//前三一码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 65;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc66"){
		//前三二码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 66;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc67"){
		//后四一码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 67;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc68"){
		//后四二码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 68;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc69"){
		//前四一码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 69;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc70"){
		//前四二码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 70;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc71"){
		//五星一码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 71;
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc72"){
		//五星二码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 72;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc73"){
		//五星三码
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 8;
		wbwfc_playMethod = 73;
		createOneLineLayout("wbwfc","至少选择3个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc74"){
		//后二大小单双
		wbwfc_qingkongAll();
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 9;
		wbwfc_playMethod = 74;
		createTextBallTwoLayout("wbwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc75"){
		//后三大小单双
		wbwfc_qingkongAll();
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 9;
		wbwfc_playMethod = 75;
		createTextBallThreeLayout("wbwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc76"){
		//前二大小单双
		wbwfc_qingkongAll();
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 9;
		wbwfc_playMethod = 76;
		createTextBallTwoLayout("wbwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc77"){
		//前三大小单双
		wbwfc_qingkongAll();
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 9;
		wbwfc_playMethod = 77;
		createTextBallThreeLayout("wbwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc78"){
		//直选复式
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 10;
		wbwfc_playMethod = 78;
		createFiveLineLayout("wbwfc",function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc79"){
		//直选单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 10;
		wbwfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
		createRenXuanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc80"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 10;
		wbwfc_playMethod = 80;
		createSumLayout("wbwfc",0,18,function(){
			wbwfc_calcNotes();
		});
		createRenXuanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc81"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 10;
		wbwfc_playMethod = 81;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		createRenXuanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc82"){
		//组选单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 10;
		wbwfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
		createRenXuanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc83"){
		//组选和值
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 10;
		wbwfc_playMethod = 83;
		createSumLayout("wbwfc",1,17,function(){
			wbwfc_calcNotes();
		});
		createRenXuanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc84"){
		//直选复式
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 11;
		wbwfc_playMethod = 84;
		createFiveLineLayout("wbwfc", function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc85"){
		//直选单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 11;
		wbwfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
		createRenXuanSanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc86"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 11;
		wbwfc_playMethod = 86;
		createSumLayout("wbwfc",0,27,function(){
			wbwfc_calcNotes();
		});
		createRenXuanSanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc87"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 11;
		wbwfc_playMethod = 87;
		createOneLineLayout("wbwfc","至少选择2个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		createRenXuanSanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc88"){
		//组选单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 11;
		wbwfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
		createRenXuanSanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc89"){
		//组选和值
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 11;
		wbwfc_playMethod = 89;
		createOneLineLayout("wbwfc","至少选择3个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		createRenXuanSanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc90"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 11;
		wbwfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
		createRenXuanSanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc91"){
		//混合组选
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 11;
		wbwfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
		createRenXuanSanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc92"){
		//组选和值
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 11;
		wbwfc_playMethod = 92;
		createSumLayout("wbwfc",1,26,function(){
			wbwfc_calcNotes();
		});
		createRenXuanSanLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc93"){
		$("#wbwfc_random").show();
		wbwfc_sntuo = 0;
		wbwfc_playType = 12;
		wbwfc_playMethod = 93;
		createFiveLineLayout("wbwfc", function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc94"){
		//直选单式
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 3;
		wbwfc_playType = 12;
		wbwfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbwfc",tips);
		createRenXuanSiLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc95"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 12;
		wbwfc_playMethod = 95;
		createOneLineLayout("wbwfc","至少选择4个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		createRenXuanSiLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc96"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 12;
		wbwfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		createRenXuanSiLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc97"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 12;
		wbwfc_playMethod = 97;
		$("#wbwfc_ballView").empty();
		createOneLineLayout("wbwfc","二重号:至少选择2个号码",0,9,false,function(){
			wbwfc_calcNotes();
		});
		createRenXuanSiLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc98"){
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 12;
		wbwfc_playMethod = 98;
		$("#wbwfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbwfc",tips,0,9,false,function(){
			wbwfc_calcNotes();
		});
		createRenXuanSiLayout("wbwfc",wbwfc_playMethod,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc99"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 13;
		wbwfc_playMethod = 99;
		$("#wbwfc_ballView").empty();
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc100"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 13;
		wbwfc_playMethod = 100;
		$("#wbwfc_ballView").empty();
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc101"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 13;
		wbwfc_playMethod = 101;
		$("#wbwfc_ballView").empty();
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc102"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 13;
		wbwfc_playMethod = 102;
		$("#wbwfc_ballView").empty();
		createOneLineLayout("wbwfc","至少选择1个",0,9,false,function(){
			wbwfc_calcNotes();
		});
		wbwfc_qingkongAll();
	}else if(val == "wbwfc103"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 103;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc104"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 104;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc105"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 105;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc106"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 106;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc107"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 107;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc108"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 108;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc109"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 109;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc110"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 110;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc111"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 111;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}else if(val == "wbwfc112"){
		wbwfc_qingkongAll();
		$("#wbwfc_random").hide();
		wbwfc_sntuo = 0;
		wbwfc_playType = 14;
		wbwfc_playMethod = 112;
		createTextBallOneLayout("wbwfc",["龙","虎","和"],["至少选择一个"],function(){
			wbwfc_calcNotes();
		});
	}

	if(wbwfcScroll){
		wbwfcScroll.refresh();
		wbwfcScroll.scrollTo(0,0,1);
	}
	
	$("#wbwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("wbwfc",temp);
	hideRandomWhenLi("wbwfc",wbwfc_sntuo,wbwfc_playMethod);
	wbwfc_calcNotes();
}
/**
 * [wbwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function wbwfc_initFooterButton(){
	if(wbwfc_playMethod == 0 || wbwfc_playMethod == 62 || wbwfc_playMethod == 78
		|| wbwfc_playMethod == 84 || wbwfc_playMethod == 93 || wbwfc_playType == 7){
		if(LotteryStorage["wbwfc"]["line1"].length > 0 || LotteryStorage["wbwfc"]["line2"].length > 0 ||
			LotteryStorage["wbwfc"]["line3"].length > 0 || LotteryStorage["wbwfc"]["line4"].length > 0 ||
			LotteryStorage["wbwfc"]["line5"].length > 0){
			$("#wbwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbwfc_qingkong").css("opacity",0.4);
		}
	}else if(wbwfc_playMethod == 9){
		if(LotteryStorage["wbwfc"]["line1"].length > 0 || LotteryStorage["wbwfc"]["line2"].length > 0 ||
			LotteryStorage["wbwfc"]["line3"].length > 0 || LotteryStorage["wbwfc"]["line4"].length > 0 ){
			$("#wbwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbwfc_qingkong").css("opacity",0.4);
		}
	}else if(wbwfc_playMethod == 37 || wbwfc_playMethod == 4 || wbwfc_playMethod == 6
		|| wbwfc_playMethod == 26 || wbwfc_playMethod == 15 || wbwfc_playMethod == 75 || wbwfc_playMethod == 77){
		if(LotteryStorage["wbwfc"]["line1"].length > 0 || LotteryStorage["wbwfc"]["line2"].length > 0
			|| LotteryStorage["wbwfc"]["line3"].length > 0){
			$("#wbwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbwfc_qingkong").css("opacity",0.4);
		}
	}else if(wbwfc_playMethod == 3 || wbwfc_playMethod == 4 || wbwfc_playMethod == 5
		|| wbwfc_playMethod == 6 || wbwfc_playMethod == 7 || wbwfc_playMethod == 12
		|| wbwfc_playMethod == 14 || wbwfc_playMethod == 48 || wbwfc_playMethod == 55
		|| wbwfc_playMethod == 74 || wbwfc_playMethod == 76 || wbwfc_playMethod == 96 || wbwfc_playMethod == 98){
		if(LotteryStorage["wbwfc"]["line1"].length > 0 || LotteryStorage["wbwfc"]["line2"].length > 0){
			$("#wbwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbwfc_qingkong").css("opacity",0.4);
		}
	}else if(wbwfc_playMethod == 2 || wbwfc_playMethod == 8 || wbwfc_playMethod == 11 || wbwfc_playMethod == 13 || wbwfc_playMethod == 39
		|| wbwfc_playMethod == 28 || wbwfc_playMethod == 17 || wbwfc_playMethod == 18 || wbwfc_playMethod == 24 || wbwfc_playMethod == 41
		|| wbwfc_playMethod == 25 || wbwfc_playMethod == 29 || wbwfc_playMethod == 42 || wbwfc_playMethod == 43 || wbwfc_playMethod == 30
		|| wbwfc_playMethod == 35 || wbwfc_playMethod == 36 || wbwfc_playMethod == 31 || wbwfc_playMethod == 32 || wbwfc_playMethod == 19
		|| wbwfc_playMethod == 40 || wbwfc_playMethod == 46 || wbwfc_playMethod == 20 || wbwfc_playMethod == 21 || wbwfc_playMethod == 50
		|| wbwfc_playMethod == 47 || wbwfc_playMethod == 51 || wbwfc_playMethod == 52 || wbwfc_playMethod == 53 || wbwfc_playMethod == 57 || wbwfc_playMethod == 63
		|| wbwfc_playMethod == 58 || wbwfc_playMethod == 59 || wbwfc_playMethod == 60 || wbwfc_playMethod == 65 || wbwfc_playMethod == 80 || wbwfc_playMethod == 81 || wbwfc_playType == 8
		|| wbwfc_playMethod == 83 || wbwfc_playMethod == 86 || wbwfc_playMethod == 87 || wbwfc_playMethod == 22 || wbwfc_playMethod == 33 || wbwfc_playMethod == 44
		|| wbwfc_playMethod == 89 || wbwfc_playMethod == 92 || wbwfc_playMethod == 95 || wbwfc_playMethod == 54 || wbwfc_playMethod == 61
		|| wbwfc_playMethod == 97 || wbwfc_playType == 13  || wbwfc_playType == 14){
		if(LotteryStorage["wbwfc"]["line1"].length > 0){
			$("#wbwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbwfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#wbwfc_qingkong").css("opacity",0);
	}

	if($("#wbwfc_qingkong").css("opacity") == "0"){
		$("#wbwfc_qingkong").css("display","none");
	}else{
		$("#wbwfc_qingkong").css("display","block");
	}

	if($('#wbwfc_zhushu').html() > 0){
		$("#wbwfc_queding").css("opacity",1.0);
	}else{
		$("#wbwfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  wbwfc_qingkongAll(){
	$("#wbwfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["wbwfc"]["line1"] = [];
	LotteryStorage["wbwfc"]["line2"] = [];
	LotteryStorage["wbwfc"]["line3"] = [];
	LotteryStorage["wbwfc"]["line4"] = [];
	LotteryStorage["wbwfc"]["line5"] = [];

	localStorageUtils.removeParam("wbwfc_line1");
	localStorageUtils.removeParam("wbwfc_line2");
	localStorageUtils.removeParam("wbwfc_line3");
	localStorageUtils.removeParam("wbwfc_line4");
	localStorageUtils.removeParam("wbwfc_line5");

	$('#wbwfc_zhushu').text(0);
	$('#wbwfc_money').text(0);
	clearAwardWin("wbwfc");
	wbwfc_initFooterButton();
}

/**
 * [wbwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function wbwfc_calcNotes(){
	$('#wbwfc_modeId').blur();
	$('#wbwfc_fandian').blur();
	
	var notes = 0;

	if(wbwfc_playMethod == 0){
		notes = LotteryStorage["wbwfc"]["line1"].length *
			LotteryStorage["wbwfc"]["line2"].length *
			LotteryStorage["wbwfc"]["line3"].length *
			LotteryStorage["wbwfc"]["line4"].length *
			LotteryStorage["wbwfc"]["line5"].length;
	}else if(wbwfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,5);
	}else if(wbwfc_playMethod == 3){
		if (LotteryStorage["wbwfc"]["line1"].length >= 1 && LotteryStorage["wbwfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["wbwfc"]["line1"],LotteryStorage["wbwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbwfc_playMethod == 4){
		if (LotteryStorage["wbwfc"]["line1"].length >= 2 && LotteryStorage["wbwfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["wbwfc"]["line2"],LotteryStorage["wbwfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(wbwfc_playMethod == 5 || wbwfc_playMethod == 12){
		if (LotteryStorage["wbwfc"]["line1"].length >= 1 && LotteryStorage["wbwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["wbwfc"]["line1"],LotteryStorage["wbwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbwfc_playMethod == 6 || wbwfc_playMethod == 7 || wbwfc_playMethod == 14){
		if (LotteryStorage["wbwfc"]["line1"].length >= 1 && LotteryStorage["wbwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["wbwfc"]["line1"],LotteryStorage["wbwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbwfc_playMethod == 9){
		notes = LotteryStorage["wbwfc"]["line1"].length *
			LotteryStorage["wbwfc"]["line2"].length *
			LotteryStorage["wbwfc"]["line3"].length *
			LotteryStorage["wbwfc"]["line4"].length;
	}else if(wbwfc_playMethod == 18 || wbwfc_playMethod == 29 || wbwfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["wbwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(wbwfc_playMethod == 22 || wbwfc_playMethod == 33 || wbwfc_playMethod == 44 ){
		notes = 54;
	}else if(wbwfc_playMethod == 54 || wbwfc_playMethod == 61){
		notes = 9;
	}else if(wbwfc_playMethod == 51 || wbwfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["wbwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(wbwfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,4);
	}else if(wbwfc_playMethod == 13|| wbwfc_playMethod == 64 || wbwfc_playMethod == 66 || wbwfc_playMethod == 68 || wbwfc_playMethod == 70 || wbwfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,2);
	}else if(wbwfc_playMethod == 37 || wbwfc_playMethod == 26 || wbwfc_playMethod == 15 || wbwfc_playMethod == 75 || wbwfc_playMethod == 77){
		notes = LotteryStorage["wbwfc"]["line1"].length *
			LotteryStorage["wbwfc"]["line2"].length *
			LotteryStorage["wbwfc"]["line3"].length ;
	}else if(wbwfc_playMethod == 39 || wbwfc_playMethod == 28 || wbwfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["wbwfc"]["line1"][i]);
		};
	}else if(wbwfc_playMethod == 41 || wbwfc_playMethod == 30 || wbwfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["wbwfc"]["line1"].length,2);
	}else if(wbwfc_playMethod == 42 || wbwfc_playMethod == 31 || wbwfc_playMethod == 20 || wbwfc_playMethod == 68 || wbwfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,3);
	}else if(wbwfc_playMethod == 43 || wbwfc_playMethod == 32 || wbwfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["wbwfc"]["line1"][i]);
		};
	}else if(wbwfc_playMethod == 48 || wbwfc_playMethod == 55 || wbwfc_playMethod == 74 || wbwfc_playMethod == 76){
		notes = LotteryStorage["wbwfc"]["line1"].length *
			LotteryStorage["wbwfc"]["line2"].length ;
	}else if(wbwfc_playMethod == 50 || wbwfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["wbwfc"]["line1"][i]);
		};
	}else if(wbwfc_playMethod == 52 || wbwfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,2);
	}else if(wbwfc_playMethod == 53 || wbwfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["wbwfc"]["line1"][i]);
		};
	}else if(wbwfc_playMethod == 62){
		notes = LotteryStorage["wbwfc"]["line1"].length +
			LotteryStorage["wbwfc"]["line2"].length +
			LotteryStorage["wbwfc"]["line3"].length +
			LotteryStorage["wbwfc"]["line4"].length +
			LotteryStorage["wbwfc"]["line5"].length;
	}else if(wbwfc_playType == 13 || wbwfc_playType == 14 || wbwfc_playMethod == 8 || wbwfc_playMethod == 71
		|| wbwfc_playMethod == 24 || wbwfc_playMethod == 25 || wbwfc_playMethod == 35 || wbwfc_playMethod == 36 || wbwfc_playMethod == 46
		|| wbwfc_playMethod == 47 || wbwfc_playMethod == 63 || wbwfc_playMethod == 65 || wbwfc_playMethod == 67 || wbwfc_playMethod == 69 ){
		notes = LotteryStorage["wbwfc"]["line1"].length ;
	}else if(wbwfc_playMethod == 78){
		notes = LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line2"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line3"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line4"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line3"].length +
			LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line4"].length +
			LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line4"].length +
			LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line4"].length * LotteryStorage["wbwfc"]["line5"].length;
	}else if (wbwfc_playMethod == 80) {
		if ($("#wbwfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["wbwfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,2);
		}
	}else if (wbwfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,2) * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,2);
	}else if (wbwfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["wbwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,2);
	}else if (wbwfc_playMethod == 84) {
		notes = LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line3"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line4"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line4"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line4"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line4"].length +
			LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line4"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line4"].length * LotteryStorage["wbwfc"]["line5"].length ;
	}else if (wbwfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["wbwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,3);
	}else if (wbwfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["wbwfc"]["line1"].length,2) * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,3);
	}else if (wbwfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,3) * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,3);
	}else if (wbwfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["wbwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["wbwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,3);
	}else if (wbwfc_playMethod == 93) {
		notes = LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line4"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line4"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line1"].length * LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line4"].length * LotteryStorage["wbwfc"]["line5"].length +
			LotteryStorage["wbwfc"]["line2"].length * LotteryStorage["wbwfc"]["line3"].length * LotteryStorage["wbwfc"]["line4"].length * LotteryStorage["wbwfc"]["line5"].length;
	}else if (wbwfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,4);
	}else if (wbwfc_playMethod == 96) {
		if (LotteryStorage["wbwfc"]["line1"].length >= 1 && LotteryStorage["wbwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["wbwfc"]["line1"],LotteryStorage["wbwfc"]["line2"])
				* mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (wbwfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["wbwfc"]["line1"].length,2) * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,4);
	}else if (wbwfc_playMethod == 98) {
		if (LotteryStorage["wbwfc"]["line1"].length >= 1 && LotteryStorage["wbwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["wbwfc"]["line1"],LotteryStorage["wbwfc"]["line2"]) * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = wbwfcValidData($("#wbwfc_single").val());
	}

	if(wbwfc_sntuo == 3 || wbwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","wbwfc"),LotteryInfo.getMethodId("ssc",wbwfc_playMethod))){
	}else{
		if(parseInt($('#wbwfc_modeId').val()) == 8){
			$("#wbwfc_random").hide();
		}else{
			$("#wbwfc_random").show();
		}
	}

	//验证是否为空
	if( $("#wbwfc_beiNum").val() =="" || parseInt($("#wbwfc_beiNum").val()) == 0){
		$("#wbwfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#wbwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#wbwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#wbwfc_zhushu').text(notes);
		if($("#wbwfc_modeId").val() == "8"){
			$('#wbwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbwfc_beiNum").val()),0.002));
		}else if ($("#wbwfc_modeId").val() == "2"){
			$('#wbwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbwfc_beiNum").val()),0.2));
		}else if ($("#wbwfc_modeId").val() == "1"){
			$('#wbwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbwfc_beiNum").val()),0.02));
		}else{
			$('#wbwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbwfc_beiNum").val()),2));
		}
	} else {
		$('#wbwfc_zhushu').text(0);
		$('#wbwfc_money').text(0);
	}
	wbwfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('wbwfc',wbwfc_playMethod);
}

/**
 * [wbwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function wbwfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#wbwfc_queding").bind('click', function(event) {

		wbwfc_rebate = $("#wbwfc_fandian option:last").val();
		if(parseInt($('#wbwfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		wbwfc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#wbwfc_modeId').val()) == 8){
			if (Number($('#wbwfc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('wbwfc',wbwfc_playMethod);

		submitParams.lotteryType = "wbwfc";
		var play = LotteryInfo.getPlayName("ssc",wbwfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",wbwfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = wbwfc_playType;
		submitParams.playMethodIndex = wbwfc_playMethod;
		var selectedBalls = [];
		if(wbwfc_playMethod == 0 || wbwfc_playMethod == 3 || wbwfc_playMethod == 4
			|| wbwfc_playMethod == 5 || wbwfc_playMethod == 6 || wbwfc_playMethod == 7
			|| wbwfc_playMethod == 9 || wbwfc_playMethod == 12 || wbwfc_playMethod == 14
			|| wbwfc_playMethod == 37 || wbwfc_playMethod == 26 || wbwfc_playMethod == 15
			|| wbwfc_playMethod == 48 || wbwfc_playMethod == 55 || wbwfc_playMethod == 74 || wbwfc_playType == 9){
			$("#wbwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(wbwfc_playMethod == 2 || wbwfc_playMethod == 8 || wbwfc_playMethod == 11 || wbwfc_playMethod == 13 || wbwfc_playMethod == 24
			|| wbwfc_playMethod == 39 || wbwfc_playMethod == 28 || wbwfc_playMethod == 17 || wbwfc_playMethod == 18 || wbwfc_playMethod == 25
			|| wbwfc_playMethod == 22 || wbwfc_playMethod == 33 || wbwfc_playMethod == 44 || wbwfc_playMethod == 54 || wbwfc_playMethod == 61
			|| wbwfc_playMethod == 41 || wbwfc_playMethod == 42 || wbwfc_playMethod == 43 || wbwfc_playMethod == 29 || wbwfc_playMethod == 35
			|| wbwfc_playMethod == 30 || wbwfc_playMethod == 31 || wbwfc_playMethod == 32 || wbwfc_playMethod == 40 || wbwfc_playMethod == 36
			|| wbwfc_playMethod == 19 || wbwfc_playMethod == 20 || wbwfc_playMethod == 21 || wbwfc_playMethod == 46 || wbwfc_playMethod == 47
			|| wbwfc_playMethod == 50 || wbwfc_playMethod == 57 || wbwfc_playType == 8 || wbwfc_playMethod == 51 || wbwfc_playMethod == 58
			|| wbwfc_playMethod == 52 || wbwfc_playMethod == 53|| wbwfc_playMethod == 59 || wbwfc_playMethod == 60 || wbwfc_playType == 13 || wbwfc_playType == 14){
			$("#wbwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(wbwfc_playType == 7 || wbwfc_playMethod == 78 || wbwfc_playMethod == 84 || wbwfc_playMethod == 93){
			$("#wbwfc_ballView div.ballView").each(function(){
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
		}else if(wbwfc_playMethod == 80 || wbwfc_playMethod == 81 || wbwfc_playMethod == 83
			|| wbwfc_playMethod == 86 || wbwfc_playMethod == 87 || wbwfc_playMethod == 89
			|| wbwfc_playMethod == 92 || wbwfc_playMethod == 95 || wbwfc_playMethod == 97){
			$("#wbwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#wbwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#wbwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#wbwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#wbwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#wbwfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (wbwfc_playMethod == 96 || wbwfc_playMethod == 98) {
			$("#wbwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#wbwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#wbwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#wbwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#wbwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#wbwfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			wbwfcValidateData("submit");
			var array = handleSingleStr($("#wbwfc_single").val());
			if(wbwfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(wbwfc_playMethod == 10 || wbwfc_playMethod == 38 || wbwfc_playMethod == 27
				|| wbwfc_playMethod == 16 || wbwfc_playMethod == 49 || wbwfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(wbwfc_playMethod == 45 || wbwfc_playMethod == 34 || wbwfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(wbwfc_playMethod == 79 || wbwfc_playMethod == 82 || wbwfc_playMethod == 85 || wbwfc_playMethod == 88 ||
				wbwfc_playMethod == 89 || wbwfc_playMethod == 90 || wbwfc_playMethod == 91 || wbwfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#wbwfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#wbwfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#wbwfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#wbwfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#wbwfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#wbwfc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#wbwfc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#wbwfc_fandian").val());
		submitParams.notes = $('#wbwfc_zhushu').html();
		submitParams.sntuo = wbwfc_sntuo;
		submitParams.multiple = $('#wbwfc_beiNum').val();  //requirement
		submitParams.rebates = $('#wbwfc_fandian').val();  //requirement
		submitParams.playMode = $('#wbwfc_modeId').val();  //requirement
		submitParams.money = $('#wbwfc_money').html();  //requirement
		submitParams.award = $('#wbwfc_minAward').html();  //奖金
		submitParams.maxAward = $('#wbwfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#wbwfc_ballView").empty();
		wbwfc_qingkongAll();
	});
}

/**
 * [wbwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function wbwfc_randomOne(){
	wbwfc_qingkongAll();
	if(wbwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["wbwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["wbwfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["wbwfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line2"], function(k, v){
			$("#" + "wbwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line3"], function(k, v){
			$("#" + "wbwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line4"], function(k, v){
			$("#" + "wbwfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line5"], function(k, v){
			$("#" + "wbwfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["wbwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["wbwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["wbwfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line2"], function(k, v){
			$("#" + "wbwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line3"], function(k, v){
			$("#" + "wbwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line4"], function(k, v){
			$("#" + "wbwfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(wbwfc_playMethod == 37 || wbwfc_playMethod == 26 || wbwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["wbwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbwfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line2"], function(k, v){
			$("#" + "wbwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line3"], function(k, v){
			$("#" + "wbwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 41 || wbwfc_playMethod == 30 || wbwfc_playMethod == 19 || wbwfc_playMethod == 68
		|| wbwfc_playMethod == 52 || wbwfc_playMethod == 64 || wbwfc_playMethod == 66
		|| wbwfc_playMethod == 59 || wbwfc_playMethod == 70 || wbwfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["wbwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 42 || wbwfc_playMethod == 31 || wbwfc_playMethod == 20 || wbwfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["wbwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 39 || wbwfc_playMethod == 28 || wbwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["wbwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 43 || wbwfc_playMethod == 32 || wbwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["wbwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 48 || wbwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["wbwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbwfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line2"], function(k, v){
			$("#" + "wbwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 25 || wbwfc_playMethod == 36 || wbwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["wbwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 50 || wbwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["wbwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 53 || wbwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["wbwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["wbwfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["wbwfc"]["line"+line], function(k, v){
			$("#" + "wbwfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 63 || wbwfc_playMethod == 67 || wbwfc_playMethod == 69 || wbwfc_playMethod == 71 || wbwfc_playType == 13
		|| wbwfc_playMethod == 65 || wbwfc_playMethod == 18 || wbwfc_playMethod == 29 || wbwfc_playMethod == 40 || wbwfc_playMethod == 22
		|| wbwfc_playMethod == 33 || wbwfc_playMethod == 44 || wbwfc_playMethod == 54 || wbwfc_playMethod == 61
		|| wbwfc_playMethod == 24 || wbwfc_playMethod == 35 || wbwfc_playMethod == 46 || wbwfc_playMethod == 51 || wbwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["wbwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 74 || wbwfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["wbwfc"]["line1"].push(array[0]+"");
		LotteryStorage["wbwfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line2"], function(k, v){
			$("#" + "wbwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 75 || wbwfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["wbwfc"]["line1"].push(array[0]+"");
		LotteryStorage["wbwfc"]["line2"].push(array[1]+"");
		LotteryStorage["wbwfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line2"], function(k, v){
			$("#" + "wbwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line3"], function(k, v){
			$("#" + "wbwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["wbwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbwfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["wbwfc"]["line"+lines[0]], function(k, v){
			$("#" + "wbwfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line"+lines[1]], function(k, v){
			$("#" + "wbwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["wbwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["wbwfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["wbwfc"]["line"+lines[0]], function(k, v){
			$("#" + "wbwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line"+lines[1]], function(k, v){
			$("#" + "wbwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line"+lines[0]], function(k, v){
			$("#" + "wbwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["wbwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["wbwfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["wbwfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["wbwfc"]["line"+lines[0]], function(k, v){
			$("#" + "wbwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line"+lines[1]], function(k, v){
			$("#" + "wbwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line"+lines[2]], function(k, v){
			$("#" + "wbwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbwfc"]["line"+lines[3]], function(k, v){
			$("#" + "wbwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(wbwfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["wbwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbwfc"]["line1"], function(k, v){
			$("#" + "wbwfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	wbwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function wbwfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(wbwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(wbwfc_playMethod == 18 || wbwfc_playMethod == 29 || wbwfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(wbwfc_playMethod == 22 || wbwfc_playMethod == 33 || wbwfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(wbwfc_playMethod == 54 || wbwfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(wbwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbwfc_playMethod == 37 || wbwfc_playMethod == 26 || wbwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbwfc_playMethod == 39 || wbwfc_playMethod == 28 || wbwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(wbwfc_playMethod == 41 || wbwfc_playMethod == 30 || wbwfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(wbwfc_playMethod == 52 || wbwfc_playMethod == 59 || wbwfc_playMethod == 64 || wbwfc_playMethod == 66 || wbwfc_playMethod == 68
		||wbwfc_playMethod == 70 || wbwfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(wbwfc_playMethod == 42 || wbwfc_playMethod == 31 || wbwfc_playMethod == 20 || wbwfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(wbwfc_playMethod == 43 || wbwfc_playMethod == 32 || wbwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(wbwfc_playMethod == 48 || wbwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbwfc_playMethod == 50 || wbwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(wbwfc_playMethod == 53 || wbwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(wbwfc_playMethod == 62){
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
	}else if(wbwfc_playMethod == 63 || wbwfc_playMethod == 65 || wbwfc_playMethod == 67 || wbwfc_playMethod == 69 || wbwfc_playMethod == 71
		|| wbwfc_playMethod == 24 || wbwfc_playMethod == 35 || wbwfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(wbwfc_playMethod == 25 || wbwfc_playMethod == 36 || wbwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(wbwfc_playMethod == 51 || wbwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(wbwfc_playMethod == 74 || wbwfc_playMethod == 76){
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
	}else if(wbwfc_playMethod == 75 || wbwfc_playMethod == 77){
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
	}else if(wbwfc_playMethod == 78){
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
	}else if(wbwfc_playMethod == 84){
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
	}else if(wbwfc_playMethod == 93){
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
	obj.sntuo = wbwfc_sntuo;
	obj.multiple = 1;
	obj.rebates = wbwfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('wbwfc',wbwfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#wbwfc_minAward').html();     //奖金
	obj.maxAward = $('#wbwfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [wbwfcValidateData 单式数据验证]
 */
function wbwfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#wbwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	wbwfcValidData(textStr,type);
}

function wbwfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(wbwfc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 38 || wbwfc_playMethod == 27 || wbwfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 45 || wbwfc_playMethod == 34 || wbwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 49 || wbwfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,2);
        wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,2);
        wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,3);
        wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,3);
        wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,3);
        wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,3);
        wbwfcShowFooter(true,notes);
    }else if(wbwfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbwfc_tab .button.red").size() ,4);
        wbwfcShowFooter(true,notes);
    }

	$('#wbwfc_delRepeat').off('click');
	$('#wbwfc_delRepeat').on('click',function () {
		content.str = $('#wbwfc_single').val() ? $('#wbwfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		wbwfcShowFooter(true,notes);
		$("#wbwfc_single").val(array.join(" "));
	});

    $("#wbwfc_single").val(array.join(" "));
    return notes;
}

function wbwfcShowFooter(isValid,notes){
	$('#wbwfc_zhushu').text(notes);
	if($("#wbwfc_modeId").val() == "8"){
		$('#wbwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbwfc_beiNum").val()),0.002));
	}else if ($("#wbwfc_modeId").val() == "2"){
		$('#wbwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbwfc_beiNum").val()),0.2));
	}else if ($("#wbwfc_modeId").val() == "1"){
		$('#wbwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbwfc_beiNum").val()),0.02));
	}else{
		$('#wbwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbwfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	wbwfc_initFooterButton();
	calcAwardWin('wbwfc',wbwfc_playMethod);  //计算奖金和盈利
}