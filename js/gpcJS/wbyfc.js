var wbyfc_playType = 2;
var wbyfc_playMethod = 15;
var wbyfc_sntuo = 0;
var wbyfc_rebate;
var wbyfcScroll;

//进入这个页面时调用
function wbyfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("wbyfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("wbyfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function wbyfcPageUnloadedPanel(){
	$("#wbyfc_queding").off('click');
	$("#wbyfcPage_back").off('click');
	$("#wbyfc_ballView").empty();
	$("#wbyfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="wbyfcPlaySelect"></select>');
	$("#wbyfcSelect").append($select);
}

//入口函数
function wbyfc_init(){
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
	$("#wbyfc_title").html(LotteryInfo.getLotteryNameByTag("wbyfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == wbyfc_playType && j == wbyfc_playMethod){
					$play.append('<option value="wbyfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="wbyfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(wbyfc_playMethod,onShowArray)>-1 ){
						wbyfc_playType = i;
						wbyfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#wbyfcPlaySelect").append($play);
		}
	}
	
	if($("#wbyfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("wbyfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:wbyfcChangeItem
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

	GetLotteryInfo("wbyfc",function (){
		wbyfcChangeItem("wbyfc"+wbyfc_playMethod);
	});

	//添加滑动条
	if(!wbyfcScroll){
		wbyfcScroll = new IScroll('#wbyfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("wbyfc",LotteryInfo.getLotteryIdByTag("wbyfc"));

	//获取上一期开奖
	queryLastPrize("wbyfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('wbyfc');

	//机选选号
	$("#wbyfc_random").off('click');
	$("#wbyfc_random").on('click', function(event) {
		wbyfc_randomOne();
	});

	//返回
	$("#wbyfcPage_back").on('click', function(event) {
		// wbyfc_playType = 2;
		// wbyfc_playMethod = 15;
		$("#wbyfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		wbyfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#wbyfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",wbyfc_playMethod));
	//玩法说明
	$("#wbyfc_paly_shuoming").off('click');
	$("#wbyfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#wbyfc_shuoming").text());
	});

	qingKong("wbyfc");//清空
	wbyfc_submitData();
}

function wbyfcResetPlayType(){
	wbyfc_playType = 2;
	wbyfc_playMethod = 15;
}

function wbyfcChangeItem(val) {
	wbyfc_qingkongAll();
	var temp = val.substring("wbyfc".length,val.length);
	if(val == "wbyfc0"){
		//直选复式
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 0;
		wbyfc_playMethod = 0;
		createFiveLineLayout("wbyfc", function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc1"){
		//直选单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 0;
		wbyfc_playMethod = 1;
		$("#wbyfc_ballView").empty();
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc2"){
		//组选120
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 0;
		wbyfc_playMethod = 2;
		createOneLineLayout("wbyfc","至少选择5个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc3"){
		//组选60
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 0;
		wbyfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc4"){
		//组选30
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 0;
		wbyfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc5"){
		//组选20
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 0;
		wbyfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc6"){
		//组选10
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 0;
		wbyfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc7"){
		//组选5
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 0;
		wbyfc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc8"){
		//总和大小单双
		$("#wbyfc_random").show();
		var num = ["大","小","单","双"];
		wbyfc_sntuo = 0;
		wbyfc_playType = 0;
		wbyfc_playMethod = 8;
		createNonNumLayout("wbyfc",wbyfc_playMethod,num,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc9"){
		//直选复式
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 1;
		wbyfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("wbyfc",tips, function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc10"){
		//直选单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 1;
		wbyfc_playMethod = 10;
		$("#wbyfc_ballView").empty();
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc11"){
		//组选24
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 1;
		wbyfc_playMethod = 11;
		createOneLineLayout("wbyfc","至少选择4个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc12"){
		//组选12
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 1;
		wbyfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc13"){
		//组选6
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 1;
		wbyfc_playMethod = 13;
		createOneLineLayout("wbyfc","二重号:至少选择2个号码",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc14"){
		//组选4
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 1;
		wbyfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc15"){
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc16"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 2;
		wbyfc_playMethod = 16;
		$("#wbyfc_ballView").empty();
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc17"){
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 17;
		createSumLayout("wbyfc",0,27,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc18"){
		//直选跨度
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 18;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc19"){
		//后三组三
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 19;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc20"){
		//后三组六
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 20;
		createOneLineLayout("wbyfc","至少选择3个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc21"){
		//后三和值
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 21;
		createSumLayout("wbyfc",1,26,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc22"){
		//后三组选包胆
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 22;
		wbyfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbyfc",array,["请选择一个号码"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc23"){
		//后三混合组选
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 2;
		wbyfc_playMethod = 23;
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc24"){
		//和值尾数
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 24;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc25"){
		//特殊号
		$("#wbyfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbyfc_sntuo = 0;
		wbyfc_playType = 2;
		wbyfc_playMethod = 25;
		createNonNumLayout("wbyfc",wbyfc_playMethod,num,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc26"){
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc27"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 3;
		wbyfc_playMethod = 27;
		$("#wbyfc_ballView").empty();
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc28"){
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 28;
		createSumLayout("wbyfc",0,27,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc29"){
		//直选跨度
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 29;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc30"){
		//中三组三
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 30;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc31"){
		//中三组六
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 31;
		createOneLineLayout("wbyfc","至少选择3个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc32"){
		//中三和值
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 32;
		createSumLayout("wbyfc",1,26,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc33"){
		//中三组选包胆
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 33;
		wbyfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbyfc",array,["请选择一个号码"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc34"){
		//中三混合组选
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 3;
		wbyfc_playMethod = 34;
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc35"){
		//和值尾数
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 35;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc36"){
		//特殊号
		$("#wbyfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbyfc_sntuo = 0;
		wbyfc_playType = 3;
		wbyfc_playMethod = 36;
		createNonNumLayout("wbyfc",wbyfc_playMethod,num,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc37"){
		//直选复式
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc38"){
		//直选单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 4;
		wbyfc_playMethod = 38;
		$("#wbyfc_ballView").empty();
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc39"){
		//和值
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 39;
		createSumLayout("wbyfc",0,27,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc40"){
		//直选跨度
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 40;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc41"){
		//前三组三
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 41;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc42"){
		//前三组六
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 42;
		createOneLineLayout("wbyfc","至少选择3个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc43"){
		//前三和值
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 43;
		createSumLayout("wbyfc",1,26,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc44"){
		//前三组选包胆
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 44;
		wbyfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbyfc",array,["请选择一个号码"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc45"){
		//前三混合组选
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 4;
		wbyfc_playMethod = 45;
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc46"){
		//和值尾数
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 46;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc47"){
		//特殊号
		$("#wbyfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbyfc_sntuo = 0;
		wbyfc_playType = 4;
		wbyfc_playMethod = 47;
		createNonNumLayout("wbyfc",wbyfc_playMethod,num,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc48"){
		//后二复式
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 5;
		wbyfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc49"){
		//后二单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 5;
		wbyfc_playMethod = 49;
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc50"){
		//后二和值
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 5;
		wbyfc_playMethod = 50;
		createSumLayout("wbyfc",0,18,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc51"){
		//直选跨度
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 5;
		wbyfc_playMethod = 51;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc52"){
		//后二组选
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 5;
		wbyfc_playMethod = 52;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc53"){
		//后二和值
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 5;
		wbyfc_playMethod = 53;
		createSumLayout("wbyfc",1,17,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc54"){
		//后二组选包胆
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 5;
		wbyfc_playMethod = 54;
		wbyfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbyfc",array,["请选择一个号码"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc55"){
		//前二复式
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 6;
		wbyfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc56"){
		//前二单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 6;
		wbyfc_playMethod = 56;
		wbyfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
	}else if(val == "wbyfc57"){
		//前二和值
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 6;
		wbyfc_playMethod = 57;
		createSumLayout("wbyfc",0,18,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc58"){
		//直选跨度
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 6;
		wbyfc_playMethod = 58;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc59"){
		//前二组选
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 6;
		wbyfc_playMethod = 59;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc60"){
		//前二和值
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 6;
		wbyfc_playMethod = 60;
		createSumLayout("wbyfc",1,17,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc61"){
		//前二组选包胆
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 6;
		wbyfc_playMethod = 61;
		wbyfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbyfc",array,["请选择一个号码"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc62"){
		//定位复式
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 7;
		wbyfc_playMethod = 62;
		createFiveLineLayout("wbyfc", function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc63"){
		//后三一码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 63;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc64"){
		//后三二码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 64;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc65"){
		//前三一码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 65;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc66"){
		//前三二码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 66;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc67"){
		//后四一码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 67;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc68"){
		//后四二码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 68;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc69"){
		//前四一码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 69;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc70"){
		//前四二码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 70;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc71"){
		//五星一码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 71;
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc72"){
		//五星二码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 72;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc73"){
		//五星三码
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 8;
		wbyfc_playMethod = 73;
		createOneLineLayout("wbyfc","至少选择3个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc74"){
		//后二大小单双
		wbyfc_qingkongAll();
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 9;
		wbyfc_playMethod = 74;
		createTextBallTwoLayout("wbyfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc75"){
		//后三大小单双
		wbyfc_qingkongAll();
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 9;
		wbyfc_playMethod = 75;
		createTextBallThreeLayout("wbyfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc76"){
		//前二大小单双
		wbyfc_qingkongAll();
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 9;
		wbyfc_playMethod = 76;
		createTextBallTwoLayout("wbyfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc77"){
		//前三大小单双
		wbyfc_qingkongAll();
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 9;
		wbyfc_playMethod = 77;
		createTextBallThreeLayout("wbyfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc78"){
		//直选复式
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 10;
		wbyfc_playMethod = 78;
		createFiveLineLayout("wbyfc",function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc79"){
		//直选单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 10;
		wbyfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
		createRenXuanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc80"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 10;
		wbyfc_playMethod = 80;
		createSumLayout("wbyfc",0,18,function(){
			wbyfc_calcNotes();
		});
		createRenXuanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc81"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 10;
		wbyfc_playMethod = 81;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		createRenXuanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc82"){
		//组选单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 10;
		wbyfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
		createRenXuanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc83"){
		//组选和值
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 10;
		wbyfc_playMethod = 83;
		createSumLayout("wbyfc",1,17,function(){
			wbyfc_calcNotes();
		});
		createRenXuanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc84"){
		//直选复式
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 11;
		wbyfc_playMethod = 84;
		createFiveLineLayout("wbyfc", function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc85"){
		//直选单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 11;
		wbyfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
		createRenXuanSanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc86"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 11;
		wbyfc_playMethod = 86;
		createSumLayout("wbyfc",0,27,function(){
			wbyfc_calcNotes();
		});
		createRenXuanSanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc87"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 11;
		wbyfc_playMethod = 87;
		createOneLineLayout("wbyfc","至少选择2个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		createRenXuanSanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc88"){
		//组选单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 11;
		wbyfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
		createRenXuanSanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc89"){
		//组选和值
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 11;
		wbyfc_playMethod = 89;
		createOneLineLayout("wbyfc","至少选择3个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		createRenXuanSanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc90"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 11;
		wbyfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
		createRenXuanSanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc91"){
		//混合组选
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 11;
		wbyfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
		createRenXuanSanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc92"){
		//组选和值
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 11;
		wbyfc_playMethod = 92;
		createSumLayout("wbyfc",1,26,function(){
			wbyfc_calcNotes();
		});
		createRenXuanSanLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc93"){
		$("#wbyfc_random").show();
		wbyfc_sntuo = 0;
		wbyfc_playType = 12;
		wbyfc_playMethod = 93;
		createFiveLineLayout("wbyfc", function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc94"){
		//直选单式
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 3;
		wbyfc_playType = 12;
		wbyfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbyfc",tips);
		createRenXuanSiLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc95"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 12;
		wbyfc_playMethod = 95;
		createOneLineLayout("wbyfc","至少选择4个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		createRenXuanSiLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc96"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 12;
		wbyfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		createRenXuanSiLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc97"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 12;
		wbyfc_playMethod = 97;
		$("#wbyfc_ballView").empty();
		createOneLineLayout("wbyfc","二重号:至少选择2个号码",0,9,false,function(){
			wbyfc_calcNotes();
		});
		createRenXuanSiLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc98"){
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 12;
		wbyfc_playMethod = 98;
		$("#wbyfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbyfc",tips,0,9,false,function(){
			wbyfc_calcNotes();
		});
		createRenXuanSiLayout("wbyfc",wbyfc_playMethod,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc99"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 13;
		wbyfc_playMethod = 99;
		$("#wbyfc_ballView").empty();
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc100"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 13;
		wbyfc_playMethod = 100;
		$("#wbyfc_ballView").empty();
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc101"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 13;
		wbyfc_playMethod = 101;
		$("#wbyfc_ballView").empty();
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc102"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 13;
		wbyfc_playMethod = 102;
		$("#wbyfc_ballView").empty();
		createOneLineLayout("wbyfc","至少选择1个",0,9,false,function(){
			wbyfc_calcNotes();
		});
		wbyfc_qingkongAll();
	}else if(val == "wbyfc103"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 103;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc104"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 104;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc105"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 105;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc106"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 106;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc107"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 107;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc108"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 108;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc109"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 109;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc110"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 110;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc111"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 111;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}else if(val == "wbyfc112"){
		wbyfc_qingkongAll();
		$("#wbyfc_random").hide();
		wbyfc_sntuo = 0;
		wbyfc_playType = 14;
		wbyfc_playMethod = 112;
		createTextBallOneLayout("wbyfc",["龙","虎","和"],["至少选择一个"],function(){
			wbyfc_calcNotes();
		});
	}

	if(wbyfcScroll){
		wbyfcScroll.refresh();
		wbyfcScroll.scrollTo(0,0,1);
	}
	
	$("#wbyfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("wbyfc",temp);
	hideRandomWhenLi("wbyfc",wbyfc_sntuo,wbyfc_playMethod);
	wbyfc_calcNotes();
}
/**
 * [wbyfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function wbyfc_initFooterButton(){
	if(wbyfc_playMethod == 0 || wbyfc_playMethod == 62 || wbyfc_playMethod == 78
		|| wbyfc_playMethod == 84 || wbyfc_playMethod == 93 || wbyfc_playType == 7){
		if(LotteryStorage["wbyfc"]["line1"].length > 0 || LotteryStorage["wbyfc"]["line2"].length > 0 ||
			LotteryStorage["wbyfc"]["line3"].length > 0 || LotteryStorage["wbyfc"]["line4"].length > 0 ||
			LotteryStorage["wbyfc"]["line5"].length > 0){
			$("#wbyfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbyfc_qingkong").css("opacity",0.4);
		}
	}else if(wbyfc_playMethod == 9){
		if(LotteryStorage["wbyfc"]["line1"].length > 0 || LotteryStorage["wbyfc"]["line2"].length > 0 ||
			LotteryStorage["wbyfc"]["line3"].length > 0 || LotteryStorage["wbyfc"]["line4"].length > 0 ){
			$("#wbyfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbyfc_qingkong").css("opacity",0.4);
		}
	}else if(wbyfc_playMethod == 37 || wbyfc_playMethod == 4 || wbyfc_playMethod == 6
		|| wbyfc_playMethod == 26 || wbyfc_playMethod == 15 || wbyfc_playMethod == 75 || wbyfc_playMethod == 77){
		if(LotteryStorage["wbyfc"]["line1"].length > 0 || LotteryStorage["wbyfc"]["line2"].length > 0
			|| LotteryStorage["wbyfc"]["line3"].length > 0){
			$("#wbyfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbyfc_qingkong").css("opacity",0.4);
		}
	}else if(wbyfc_playMethod == 3 || wbyfc_playMethod == 4 || wbyfc_playMethod == 5
		|| wbyfc_playMethod == 6 || wbyfc_playMethod == 7 || wbyfc_playMethod == 12
		|| wbyfc_playMethod == 14 || wbyfc_playMethod == 48 || wbyfc_playMethod == 55
		|| wbyfc_playMethod == 74 || wbyfc_playMethod == 76 || wbyfc_playMethod == 96 || wbyfc_playMethod == 98){
		if(LotteryStorage["wbyfc"]["line1"].length > 0 || LotteryStorage["wbyfc"]["line2"].length > 0){
			$("#wbyfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbyfc_qingkong").css("opacity",0.4);
		}
	}else if(wbyfc_playMethod == 2 || wbyfc_playMethod == 8 || wbyfc_playMethod == 11 || wbyfc_playMethod == 13 || wbyfc_playMethod == 39
		|| wbyfc_playMethod == 28 || wbyfc_playMethod == 17 || wbyfc_playMethod == 18 || wbyfc_playMethod == 24 || wbyfc_playMethod == 41
		|| wbyfc_playMethod == 25 || wbyfc_playMethod == 29 || wbyfc_playMethod == 42 || wbyfc_playMethod == 43 || wbyfc_playMethod == 30
		|| wbyfc_playMethod == 35 || wbyfc_playMethod == 36 || wbyfc_playMethod == 31 || wbyfc_playMethod == 32 || wbyfc_playMethod == 19
		|| wbyfc_playMethod == 40 || wbyfc_playMethod == 46 || wbyfc_playMethod == 20 || wbyfc_playMethod == 21 || wbyfc_playMethod == 50
		|| wbyfc_playMethod == 47 || wbyfc_playMethod == 51 || wbyfc_playMethod == 52 || wbyfc_playMethod == 53 || wbyfc_playMethod == 57 || wbyfc_playMethod == 63
		|| wbyfc_playMethod == 58 || wbyfc_playMethod == 59 || wbyfc_playMethod == 60 || wbyfc_playMethod == 65 || wbyfc_playMethod == 80 || wbyfc_playMethod == 81 || wbyfc_playType == 8
		|| wbyfc_playMethod == 83 || wbyfc_playMethod == 86 || wbyfc_playMethod == 87 || wbyfc_playMethod == 22 || wbyfc_playMethod == 33 || wbyfc_playMethod == 44
		|| wbyfc_playMethod == 89 || wbyfc_playMethod == 92 || wbyfc_playMethod == 95 || wbyfc_playMethod == 54 || wbyfc_playMethod == 61
		|| wbyfc_playMethod == 97 || wbyfc_playType == 13  || wbyfc_playType == 14){
		if(LotteryStorage["wbyfc"]["line1"].length > 0){
			$("#wbyfc_qingkong").css("opacity",1.0);
		}else{
			$("#wbyfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#wbyfc_qingkong").css("opacity",0);
	}

	if($("#wbyfc_qingkong").css("opacity") == "0"){
		$("#wbyfc_qingkong").css("display","none");
	}else{
		$("#wbyfc_qingkong").css("display","block");
	}

	if($('#wbyfc_zhushu').html() > 0){
		$("#wbyfc_queding").css("opacity",1.0);
	}else{
		$("#wbyfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  wbyfc_qingkongAll(){
	$("#wbyfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["wbyfc"]["line1"] = [];
	LotteryStorage["wbyfc"]["line2"] = [];
	LotteryStorage["wbyfc"]["line3"] = [];
	LotteryStorage["wbyfc"]["line4"] = [];
	LotteryStorage["wbyfc"]["line5"] = [];

	localStorageUtils.removeParam("wbyfc_line1");
	localStorageUtils.removeParam("wbyfc_line2");
	localStorageUtils.removeParam("wbyfc_line3");
	localStorageUtils.removeParam("wbyfc_line4");
	localStorageUtils.removeParam("wbyfc_line5");

	$('#wbyfc_zhushu').text(0);
	$('#wbyfc_money').text(0);
	clearAwardWin("wbyfc");
	wbyfc_initFooterButton();
}

/**
 * [wbyfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function wbyfc_calcNotes(){
	$('#wbyfc_modeId').blur();
	$('#wbyfc_fandian').blur();
	
	var notes = 0;

	if(wbyfc_playMethod == 0){
		notes = LotteryStorage["wbyfc"]["line1"].length *
			LotteryStorage["wbyfc"]["line2"].length *
			LotteryStorage["wbyfc"]["line3"].length *
			LotteryStorage["wbyfc"]["line4"].length *
			LotteryStorage["wbyfc"]["line5"].length;
	}else if(wbyfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,5);
	}else if(wbyfc_playMethod == 3){
		if (LotteryStorage["wbyfc"]["line1"].length >= 1 && LotteryStorage["wbyfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["wbyfc"]["line1"],LotteryStorage["wbyfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbyfc_playMethod == 4){
		if (LotteryStorage["wbyfc"]["line1"].length >= 2 && LotteryStorage["wbyfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["wbyfc"]["line2"],LotteryStorage["wbyfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(wbyfc_playMethod == 5 || wbyfc_playMethod == 12){
		if (LotteryStorage["wbyfc"]["line1"].length >= 1 && LotteryStorage["wbyfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["wbyfc"]["line1"],LotteryStorage["wbyfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbyfc_playMethod == 6 || wbyfc_playMethod == 7 || wbyfc_playMethod == 14){
		if (LotteryStorage["wbyfc"]["line1"].length >= 1 && LotteryStorage["wbyfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["wbyfc"]["line1"],LotteryStorage["wbyfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbyfc_playMethod == 9){
		notes = LotteryStorage["wbyfc"]["line1"].length *
			LotteryStorage["wbyfc"]["line2"].length *
			LotteryStorage["wbyfc"]["line3"].length *
			LotteryStorage["wbyfc"]["line4"].length;
	}else if(wbyfc_playMethod == 18 || wbyfc_playMethod == 29 || wbyfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["wbyfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(wbyfc_playMethod == 22 || wbyfc_playMethod == 33 || wbyfc_playMethod == 44 ){
		notes = 54;
	}else if(wbyfc_playMethod == 54 || wbyfc_playMethod == 61){
		notes = 9;
	}else if(wbyfc_playMethod == 51 || wbyfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["wbyfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(wbyfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,4);
	}else if(wbyfc_playMethod == 13|| wbyfc_playMethod == 64 || wbyfc_playMethod == 66 || wbyfc_playMethod == 68 || wbyfc_playMethod == 70 || wbyfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,2);
	}else if(wbyfc_playMethod == 37 || wbyfc_playMethod == 26 || wbyfc_playMethod == 15 || wbyfc_playMethod == 75 || wbyfc_playMethod == 77){
		notes = LotteryStorage["wbyfc"]["line1"].length *
			LotteryStorage["wbyfc"]["line2"].length *
			LotteryStorage["wbyfc"]["line3"].length ;
	}else if(wbyfc_playMethod == 39 || wbyfc_playMethod == 28 || wbyfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["wbyfc"]["line1"][i]);
		};
	}else if(wbyfc_playMethod == 41 || wbyfc_playMethod == 30 || wbyfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["wbyfc"]["line1"].length,2);
	}else if(wbyfc_playMethod == 42 || wbyfc_playMethod == 31 || wbyfc_playMethod == 20 || wbyfc_playMethod == 68 || wbyfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,3);
	}else if(wbyfc_playMethod == 43 || wbyfc_playMethod == 32 || wbyfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["wbyfc"]["line1"][i]);
		};
	}else if(wbyfc_playMethod == 48 || wbyfc_playMethod == 55 || wbyfc_playMethod == 74 || wbyfc_playMethod == 76){
		notes = LotteryStorage["wbyfc"]["line1"].length *
			LotteryStorage["wbyfc"]["line2"].length ;
	}else if(wbyfc_playMethod == 50 || wbyfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["wbyfc"]["line1"][i]);
		};
	}else if(wbyfc_playMethod == 52 || wbyfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,2);
	}else if(wbyfc_playMethod == 53 || wbyfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["wbyfc"]["line1"][i]);
		};
	}else if(wbyfc_playMethod == 62){
		notes = LotteryStorage["wbyfc"]["line1"].length +
			LotteryStorage["wbyfc"]["line2"].length +
			LotteryStorage["wbyfc"]["line3"].length +
			LotteryStorage["wbyfc"]["line4"].length +
			LotteryStorage["wbyfc"]["line5"].length;
	}else if(wbyfc_playType == 13 || wbyfc_playType == 14 || wbyfc_playMethod == 8 || wbyfc_playMethod == 71
		|| wbyfc_playMethod == 24 || wbyfc_playMethod == 25 || wbyfc_playMethod == 35 || wbyfc_playMethod == 36 || wbyfc_playMethod == 46
		|| wbyfc_playMethod == 47 || wbyfc_playMethod == 63 || wbyfc_playMethod == 65 || wbyfc_playMethod == 67 || wbyfc_playMethod == 69 ){
		notes = LotteryStorage["wbyfc"]["line1"].length ;
	}else if(wbyfc_playMethod == 78){
		notes = LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line2"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line3"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line4"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line3"].length +
			LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line4"].length +
			LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line4"].length +
			LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line4"].length * LotteryStorage["wbyfc"]["line5"].length;
	}else if (wbyfc_playMethod == 80) {
		if ($("#wbyfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["wbyfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,2);
		}
	}else if (wbyfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,2) * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,2);
	}else if (wbyfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["wbyfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,2);
	}else if (wbyfc_playMethod == 84) {
		notes = LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line3"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line4"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line4"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line4"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line4"].length +
			LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line4"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line4"].length * LotteryStorage["wbyfc"]["line5"].length ;
	}else if (wbyfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["wbyfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,3);
	}else if (wbyfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["wbyfc"]["line1"].length,2) * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,3);
	}else if (wbyfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,3) * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,3);
	}else if (wbyfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["wbyfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["wbyfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,3);
	}else if (wbyfc_playMethod == 93) {
		notes = LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line4"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line4"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line1"].length * LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line4"].length * LotteryStorage["wbyfc"]["line5"].length +
			LotteryStorage["wbyfc"]["line2"].length * LotteryStorage["wbyfc"]["line3"].length * LotteryStorage["wbyfc"]["line4"].length * LotteryStorage["wbyfc"]["line5"].length;
	}else if (wbyfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,4);
	}else if (wbyfc_playMethod == 96) {
		if (LotteryStorage["wbyfc"]["line1"].length >= 1 && LotteryStorage["wbyfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["wbyfc"]["line1"],LotteryStorage["wbyfc"]["line2"])
				* mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (wbyfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["wbyfc"]["line1"].length,2) * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,4);
	}else if (wbyfc_playMethod == 98) {
		if (LotteryStorage["wbyfc"]["line1"].length >= 1 && LotteryStorage["wbyfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["wbyfc"]["line1"],LotteryStorage["wbyfc"]["line2"]) * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = wbyfcValidData($("#wbyfc_single").val());
	}

	if(wbyfc_sntuo == 3 || wbyfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","wbyfc"),LotteryInfo.getMethodId("ssc",wbyfc_playMethod))){
	}else{
		if(parseInt($('#wbyfc_modeId').val()) == 8){
			$("#wbyfc_random").hide();
		}else{
			$("#wbyfc_random").show();
		}
	}

	//验证是否为空
	if( $("#wbyfc_beiNum").val() =="" || parseInt($("#wbyfc_beiNum").val()) == 0){
		$("#wbyfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#wbyfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#wbyfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#wbyfc_zhushu').text(notes);
		if($("#wbyfc_modeId").val() == "8"){
			$('#wbyfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbyfc_beiNum").val()),0.002));
		}else if ($("#wbyfc_modeId").val() == "2"){
			$('#wbyfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbyfc_beiNum").val()),0.2));
		}else if ($("#wbyfc_modeId").val() == "1"){
			$('#wbyfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbyfc_beiNum").val()),0.02));
		}else{
			$('#wbyfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbyfc_beiNum").val()),2));
		}
	} else {
		$('#wbyfc_zhushu').text(0);
		$('#wbyfc_money').text(0);
	}
	wbyfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('wbyfc',wbyfc_playMethod);
}

/**
 * [wbyfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function wbyfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#wbyfc_queding").bind('click', function(event) {

		wbyfc_rebate = $("#wbyfc_fandian option:last").val();
		if(parseInt($('#wbyfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		wbyfc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#wbyfc_modeId').val()) == 8){
			if (Number($('#wbyfc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('wbyfc',wbyfc_playMethod);

		submitParams.lotteryType = "wbyfc";
		var play = LotteryInfo.getPlayName("ssc",wbyfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",wbyfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = wbyfc_playType;
		submitParams.playMethodIndex = wbyfc_playMethod;
		var selectedBalls = [];
		if(wbyfc_playMethod == 0 || wbyfc_playMethod == 3 || wbyfc_playMethod == 4
			|| wbyfc_playMethod == 5 || wbyfc_playMethod == 6 || wbyfc_playMethod == 7
			|| wbyfc_playMethod == 9 || wbyfc_playMethod == 12 || wbyfc_playMethod == 14
			|| wbyfc_playMethod == 37 || wbyfc_playMethod == 26 || wbyfc_playMethod == 15
			|| wbyfc_playMethod == 48 || wbyfc_playMethod == 55 || wbyfc_playMethod == 74 || wbyfc_playType == 9){
			$("#wbyfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(wbyfc_playMethod == 2 || wbyfc_playMethod == 8 || wbyfc_playMethod == 11 || wbyfc_playMethod == 13 || wbyfc_playMethod == 24
			|| wbyfc_playMethod == 39 || wbyfc_playMethod == 28 || wbyfc_playMethod == 17 || wbyfc_playMethod == 18 || wbyfc_playMethod == 25
			|| wbyfc_playMethod == 22 || wbyfc_playMethod == 33 || wbyfc_playMethod == 44 || wbyfc_playMethod == 54 || wbyfc_playMethod == 61
			|| wbyfc_playMethod == 41 || wbyfc_playMethod == 42 || wbyfc_playMethod == 43 || wbyfc_playMethod == 29 || wbyfc_playMethod == 35
			|| wbyfc_playMethod == 30 || wbyfc_playMethod == 31 || wbyfc_playMethod == 32 || wbyfc_playMethod == 40 || wbyfc_playMethod == 36
			|| wbyfc_playMethod == 19 || wbyfc_playMethod == 20 || wbyfc_playMethod == 21 || wbyfc_playMethod == 46 || wbyfc_playMethod == 47
			|| wbyfc_playMethod == 50 || wbyfc_playMethod == 57 || wbyfc_playType == 8 || wbyfc_playMethod == 51 || wbyfc_playMethod == 58
			|| wbyfc_playMethod == 52 || wbyfc_playMethod == 53|| wbyfc_playMethod == 59 || wbyfc_playMethod == 60 || wbyfc_playType == 13 || wbyfc_playType == 14){
			$("#wbyfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(wbyfc_playType == 7 || wbyfc_playMethod == 78 || wbyfc_playMethod == 84 || wbyfc_playMethod == 93){
			$("#wbyfc_ballView div.ballView").each(function(){
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
		}else if(wbyfc_playMethod == 80 || wbyfc_playMethod == 81 || wbyfc_playMethod == 83
			|| wbyfc_playMethod == 86 || wbyfc_playMethod == 87 || wbyfc_playMethod == 89
			|| wbyfc_playMethod == 92 || wbyfc_playMethod == 95 || wbyfc_playMethod == 97){
			$("#wbyfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#wbyfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#wbyfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#wbyfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#wbyfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#wbyfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (wbyfc_playMethod == 96 || wbyfc_playMethod == 98) {
			$("#wbyfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#wbyfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#wbyfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#wbyfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#wbyfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#wbyfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			wbyfcValidateData("submit");
			var array = handleSingleStr($("#wbyfc_single").val());
			if(wbyfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(wbyfc_playMethod == 10 || wbyfc_playMethod == 38 || wbyfc_playMethod == 27
				|| wbyfc_playMethod == 16 || wbyfc_playMethod == 49 || wbyfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(wbyfc_playMethod == 45 || wbyfc_playMethod == 34 || wbyfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(wbyfc_playMethod == 79 || wbyfc_playMethod == 82 || wbyfc_playMethod == 85 || wbyfc_playMethod == 88 ||
				wbyfc_playMethod == 89 || wbyfc_playMethod == 90 || wbyfc_playMethod == 91 || wbyfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#wbyfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#wbyfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#wbyfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#wbyfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#wbyfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#wbyfc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#wbyfc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#wbyfc_fandian").val());
		submitParams.notes = $('#wbyfc_zhushu').html();
		submitParams.sntuo = wbyfc_sntuo;
		submitParams.multiple = $('#wbyfc_beiNum').val();  //requirement
		submitParams.rebates = $('#wbyfc_fandian').val();  //requirement
		submitParams.playMode = $('#wbyfc_modeId').val();  //requirement
		submitParams.money = $('#wbyfc_money').html();  //requirement
		submitParams.award = $('#wbyfc_minAward').html();  //奖金
		submitParams.maxAward = $('#wbyfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#wbyfc_ballView").empty();
		wbyfc_qingkongAll();
	});
}

/**
 * [wbyfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function wbyfc_randomOne(){
	wbyfc_qingkongAll();
	if(wbyfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["wbyfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbyfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbyfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["wbyfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["wbyfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line2"], function(k, v){
			$("#" + "wbyfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line3"], function(k, v){
			$("#" + "wbyfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line4"], function(k, v){
			$("#" + "wbyfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line5"], function(k, v){
			$("#" + "wbyfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["wbyfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["wbyfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbyfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbyfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["wbyfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line2"], function(k, v){
			$("#" + "wbyfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line3"], function(k, v){
			$("#" + "wbyfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line4"], function(k, v){
			$("#" + "wbyfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(wbyfc_playMethod == 37 || wbyfc_playMethod == 26 || wbyfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["wbyfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbyfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbyfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line2"], function(k, v){
			$("#" + "wbyfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line3"], function(k, v){
			$("#" + "wbyfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 41 || wbyfc_playMethod == 30 || wbyfc_playMethod == 19 || wbyfc_playMethod == 68
		|| wbyfc_playMethod == 52 || wbyfc_playMethod == 64 || wbyfc_playMethod == 66
		|| wbyfc_playMethod == 59 || wbyfc_playMethod == 70 || wbyfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["wbyfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 42 || wbyfc_playMethod == 31 || wbyfc_playMethod == 20 || wbyfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["wbyfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 39 || wbyfc_playMethod == 28 || wbyfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["wbyfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 43 || wbyfc_playMethod == 32 || wbyfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["wbyfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 48 || wbyfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["wbyfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbyfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line2"], function(k, v){
			$("#" + "wbyfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 25 || wbyfc_playMethod == 36 || wbyfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["wbyfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 50 || wbyfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["wbyfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 53 || wbyfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["wbyfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["wbyfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["wbyfc"]["line"+line], function(k, v){
			$("#" + "wbyfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 63 || wbyfc_playMethod == 67 || wbyfc_playMethod == 69 || wbyfc_playMethod == 71 || wbyfc_playType == 13
		|| wbyfc_playMethod == 65 || wbyfc_playMethod == 18 || wbyfc_playMethod == 29 || wbyfc_playMethod == 40 || wbyfc_playMethod == 22
		|| wbyfc_playMethod == 33 || wbyfc_playMethod == 44 || wbyfc_playMethod == 54 || wbyfc_playMethod == 61
		|| wbyfc_playMethod == 24 || wbyfc_playMethod == 35 || wbyfc_playMethod == 46 || wbyfc_playMethod == 51 || wbyfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["wbyfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 74 || wbyfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["wbyfc"]["line1"].push(array[0]+"");
		LotteryStorage["wbyfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line2"], function(k, v){
			$("#" + "wbyfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 75 || wbyfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["wbyfc"]["line1"].push(array[0]+"");
		LotteryStorage["wbyfc"]["line2"].push(array[1]+"");
		LotteryStorage["wbyfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line2"], function(k, v){
			$("#" + "wbyfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line3"], function(k, v){
			$("#" + "wbyfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["wbyfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbyfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["wbyfc"]["line"+lines[0]], function(k, v){
			$("#" + "wbyfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line"+lines[1]], function(k, v){
			$("#" + "wbyfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["wbyfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbyfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["wbyfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["wbyfc"]["line"+lines[0]], function(k, v){
			$("#" + "wbyfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line"+lines[1]], function(k, v){
			$("#" + "wbyfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line"+lines[0]], function(k, v){
			$("#" + "wbyfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["wbyfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbyfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["wbyfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["wbyfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["wbyfc"]["line"+lines[0]], function(k, v){
			$("#" + "wbyfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line"+lines[1]], function(k, v){
			$("#" + "wbyfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line"+lines[2]], function(k, v){
			$("#" + "wbyfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbyfc"]["line"+lines[3]], function(k, v){
			$("#" + "wbyfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(wbyfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["wbyfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbyfc"]["line1"], function(k, v){
			$("#" + "wbyfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	wbyfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function wbyfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(wbyfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbyfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(wbyfc_playMethod == 18 || wbyfc_playMethod == 29 || wbyfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(wbyfc_playMethod == 22 || wbyfc_playMethod == 33 || wbyfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(wbyfc_playMethod == 54 || wbyfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(wbyfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbyfc_playMethod == 37 || wbyfc_playMethod == 26 || wbyfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbyfc_playMethod == 39 || wbyfc_playMethod == 28 || wbyfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(wbyfc_playMethod == 41 || wbyfc_playMethod == 30 || wbyfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(wbyfc_playMethod == 52 || wbyfc_playMethod == 59 || wbyfc_playMethod == 64 || wbyfc_playMethod == 66 || wbyfc_playMethod == 68
		||wbyfc_playMethod == 70 || wbyfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(wbyfc_playMethod == 42 || wbyfc_playMethod == 31 || wbyfc_playMethod == 20 || wbyfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(wbyfc_playMethod == 43 || wbyfc_playMethod == 32 || wbyfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(wbyfc_playMethod == 48 || wbyfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbyfc_playMethod == 50 || wbyfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(wbyfc_playMethod == 53 || wbyfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(wbyfc_playMethod == 62){
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
	}else if(wbyfc_playMethod == 63 || wbyfc_playMethod == 65 || wbyfc_playMethod == 67 || wbyfc_playMethod == 69 || wbyfc_playMethod == 71
		|| wbyfc_playMethod == 24 || wbyfc_playMethod == 35 || wbyfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(wbyfc_playMethod == 25 || wbyfc_playMethod == 36 || wbyfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(wbyfc_playMethod == 51 || wbyfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(wbyfc_playMethod == 74 || wbyfc_playMethod == 76){
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
	}else if(wbyfc_playMethod == 75 || wbyfc_playMethod == 77){
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
	}else if(wbyfc_playMethod == 78){
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
	}else if(wbyfc_playMethod == 84){
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
	}else if(wbyfc_playMethod == 93){
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
	obj.sntuo = wbyfc_sntuo;
	obj.multiple = 1;
	obj.rebates = wbyfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('wbyfc',wbyfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#wbyfc_minAward').html();     //奖金
	obj.maxAward = $('#wbyfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [wbyfcValidateData 单式数据验证]
 */
function wbyfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#wbyfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	wbyfcValidData(textStr,type);
}

function wbyfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(wbyfc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 38 || wbyfc_playMethod == 27 || wbyfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 45 || wbyfc_playMethod == 34 || wbyfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 49 || wbyfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,2);
        wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,2);
        wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,3);
        wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,3);
        wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,3);
        wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,3);
        wbyfcShowFooter(true,notes);
    }else if(wbyfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbyfc_tab .button.red").size() ,4);
        wbyfcShowFooter(true,notes);
    }

	$('#wbyfc_delRepeat').off('click');
	$('#wbyfc_delRepeat').on('click',function () {
		content.str = $('#wbyfc_single').val() ? $('#wbyfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		wbyfcShowFooter(true,notes);
		$("#wbyfc_single").val(array.join(" "));
	});

    $("#wbyfc_single").val(array.join(" "));
    return notes;
}

function wbyfcShowFooter(isValid,notes){
	$('#wbyfc_zhushu').text(notes);
	if($("#wbyfc_modeId").val() == "8"){
		$('#wbyfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbyfc_beiNum").val()),0.002));
	}else if ($("#wbyfc_modeId").val() == "2"){
		$('#wbyfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbyfc_beiNum").val()),0.2));
	}else if ($("#wbyfc_modeId").val() == "1"){
		$('#wbyfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbyfc_beiNum").val()),0.02));
	}else{
		$('#wbyfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbyfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	wbyfc_initFooterButton();
	calcAwardWin('wbyfc',wbyfc_playMethod);  //计算奖金和盈利
}