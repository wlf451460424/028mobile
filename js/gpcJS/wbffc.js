var wbffc_playType = 2;
var wbffc_playMethod = 15;
var wbffc_sntuo = 0;
var wbffc_rebate;
var wbffcScroll;

//进入这个页面时调用
function wbffcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("wbffc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("wbffc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function wbffcPageUnloadedPanel(){
	$("#wbffc_queding").off('click');
	$("#wbffcPage_back").off('click');
	$("#wbffc_ballView").empty();
	$("#wbffcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="wbffcPlaySelect"></select>');
	$("#wbffcSelect").append($select);
}

//入口函数
function wbffc_init(){
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
	$("#wbffc_title").html(LotteryInfo.getLotteryNameByTag("wbffc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == wbffc_playType && j == wbffc_playMethod){
					$play.append('<option value="wbffc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="wbffc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(wbffc_playMethod,onShowArray)>-1 ){
						wbffc_playType = i;
						wbffc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#wbffcPlaySelect").append($play);
		}
	}
	
	if($("#wbffcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("wbffcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:wbffcChangeItem
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

	GetLotteryInfo("wbffc",function (){
		wbffcChangeItem("wbffc"+wbffc_playMethod);
	});

	//添加滑动条
	if(!wbffcScroll){
		wbffcScroll = new IScroll('#wbffcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("wbffc",LotteryInfo.getLotteryIdByTag("wbffc"));

	//获取上一期开奖
	queryLastPrize("wbffc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('wbffc');

	//机选选号
	$("#wbffc_random").off('click');
	$("#wbffc_random").on('click', function(event) {
		wbffc_randomOne();
	});

	//返回
	$("#wbffcPage_back").on('click', function(event) {
		// wbffc_playType = 2;
		// wbffc_playMethod = 15;
		$("#wbffc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		wbffc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#wbffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",wbffc_playMethod));
	//玩法说明
	$("#wbffc_paly_shuoming").off('click');
	$("#wbffc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#wbffc_shuoming").text());
	});

	qingKong("wbffc");//清空
	wbffc_submitData();
}

function wbffcResetPlayType(){
	wbffc_playType = 2;
	wbffc_playMethod = 15;
}

function wbffcChangeItem(val) {
	wbffc_qingkongAll();
	var temp = val.substring("wbffc".length,val.length);
	if(val == "wbffc0"){
		//直选复式
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 0;
		wbffc_playMethod = 0;
		createFiveLineLayout("wbffc", function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc1"){
		//直选单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 0;
		wbffc_playMethod = 1;
		$("#wbffc_ballView").empty();
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc2"){
		//组选120
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 0;
		wbffc_playMethod = 2;
		createOneLineLayout("wbffc","至少选择5个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc3"){
		//组选60
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 0;
		wbffc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc4"){
		//组选30
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 0;
		wbffc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc5"){
		//组选20
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 0;
		wbffc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc6"){
		//组选10
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 0;
		wbffc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc7"){
		//组选5
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 0;
		wbffc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc8"){
		//总和大小单双
		$("#wbffc_random").show();
		var num = ["大","小","单","双"];
		wbffc_sntuo = 0;
		wbffc_playType = 0;
		wbffc_playMethod = 8;
		createNonNumLayout("wbffc",wbffc_playMethod,num,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc9"){
		//直选复式
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 1;
		wbffc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("wbffc",tips, function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc10"){
		//直选单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 1;
		wbffc_playMethod = 10;
		$("#wbffc_ballView").empty();
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc11"){
		//组选24
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 1;
		wbffc_playMethod = 11;
		createOneLineLayout("wbffc","至少选择4个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc12"){
		//组选12
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 1;
		wbffc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc13"){
		//组选6
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 1;
		wbffc_playMethod = 13;
		createOneLineLayout("wbffc","二重号:至少选择2个号码",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc14"){
		//组选4
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 1;
		wbffc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc15"){
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc16"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 2;
		wbffc_playMethod = 16;
		$("#wbffc_ballView").empty();
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc17"){
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 17;
		createSumLayout("wbffc",0,27,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc18"){
		//直选跨度
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 18;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc19"){
		//后三组三
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 19;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc20"){
		//后三组六
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 20;
		createOneLineLayout("wbffc","至少选择3个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc21"){
		//后三和值
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 21;
		createSumLayout("wbffc",1,26,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc22"){
		//后三组选包胆
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 22;
		wbffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbffc",array,["请选择一个号码"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc23"){
		//后三混合组选
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 2;
		wbffc_playMethod = 23;
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc24"){
		//和值尾数
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 24;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc25"){
		//特殊号
		$("#wbffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbffc_sntuo = 0;
		wbffc_playType = 2;
		wbffc_playMethod = 25;
		createNonNumLayout("wbffc",wbffc_playMethod,num,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc26"){
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc27"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 3;
		wbffc_playMethod = 27;
		$("#wbffc_ballView").empty();
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc28"){
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 28;
		createSumLayout("wbffc",0,27,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc29"){
		//直选跨度
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 29;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc30"){
		//中三组三
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 30;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc31"){
		//中三组六
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 31;
		createOneLineLayout("wbffc","至少选择3个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc32"){
		//中三和值
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 32;
		createSumLayout("wbffc",1,26,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc33"){
		//中三组选包胆
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 33;
		wbffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbffc",array,["请选择一个号码"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc34"){
		//中三混合组选
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 3;
		wbffc_playMethod = 34;
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc35"){
		//和值尾数
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 35;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc36"){
		//特殊号
		$("#wbffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbffc_sntuo = 0;
		wbffc_playType = 3;
		wbffc_playMethod = 36;
		createNonNumLayout("wbffc",wbffc_playMethod,num,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc37"){
		//直选复式
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc38"){
		//直选单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 4;
		wbffc_playMethod = 38;
		$("#wbffc_ballView").empty();
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc39"){
		//和值
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 39;
		createSumLayout("wbffc",0,27,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc40"){
		//直选跨度
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 40;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc41"){
		//前三组三
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 41;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc42"){
		//前三组六
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 42;
		createOneLineLayout("wbffc","至少选择3个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc43"){
		//前三和值
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 43;
		createSumLayout("wbffc",1,26,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc44"){
		//前三组选包胆
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 44;
		wbffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbffc",array,["请选择一个号码"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc45"){
		//前三混合组选
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 4;
		wbffc_playMethod = 45;
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc46"){
		//和值尾数
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 46;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc47"){
		//特殊号
		$("#wbffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wbffc_sntuo = 0;
		wbffc_playType = 4;
		wbffc_playMethod = 47;
		createNonNumLayout("wbffc",wbffc_playMethod,num,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc48"){
		//后二复式
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 5;
		wbffc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc49"){
		//后二单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 5;
		wbffc_playMethod = 49;
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc50"){
		//后二和值
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 5;
		wbffc_playMethod = 50;
		createSumLayout("wbffc",0,18,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc51"){
		//直选跨度
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 5;
		wbffc_playMethod = 51;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc52"){
		//后二组选
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 5;
		wbffc_playMethod = 52;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc53"){
		//后二和值
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 5;
		wbffc_playMethod = 53;
		createSumLayout("wbffc",1,17,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc54"){
		//后二组选包胆
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 5;
		wbffc_playMethod = 54;
		wbffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbffc",array,["请选择一个号码"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc55"){
		//前二复式
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 6;
		wbffc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc56"){
		//前二单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 6;
		wbffc_playMethod = 56;
		wbffc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
	}else if(val == "wbffc57"){
		//前二和值
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 6;
		wbffc_playMethod = 57;
		createSumLayout("wbffc",0,18,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc58"){
		//直选跨度
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 6;
		wbffc_playMethod = 58;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc59"){
		//前二组选
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 6;
		wbffc_playMethod = 59;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc60"){
		//前二和值
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 6;
		wbffc_playMethod = 60;
		createSumLayout("wbffc",1,17,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc61"){
		//前二组选包胆
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 6;
		wbffc_playMethod = 61;
		wbffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wbffc",array,["请选择一个号码"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc62"){
		//定位复式
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 7;
		wbffc_playMethod = 62;
		createFiveLineLayout("wbffc", function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc63"){
		//后三一码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 63;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc64"){
		//后三二码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 64;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc65"){
		//前三一码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 65;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc66"){
		//前三二码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 66;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc67"){
		//后四一码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 67;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc68"){
		//后四二码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 68;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc69"){
		//前四一码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 69;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc70"){
		//前四二码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 70;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc71"){
		//五星一码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 71;
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc72"){
		//五星二码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 72;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc73"){
		//五星三码
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 8;
		wbffc_playMethod = 73;
		createOneLineLayout("wbffc","至少选择3个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc74"){
		//后二大小单双
		wbffc_qingkongAll();
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 9;
		wbffc_playMethod = 74;
		createTextBallTwoLayout("wbffc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc75"){
		//后三大小单双
		wbffc_qingkongAll();
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 9;
		wbffc_playMethod = 75;
		createTextBallThreeLayout("wbffc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc76"){
		//前二大小单双
		wbffc_qingkongAll();
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 9;
		wbffc_playMethod = 76;
		createTextBallTwoLayout("wbffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc77"){
		//前三大小单双
		wbffc_qingkongAll();
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 9;
		wbffc_playMethod = 77;
		createTextBallThreeLayout("wbffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc78"){
		//直选复式
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 10;
		wbffc_playMethod = 78;
		createFiveLineLayout("wbffc",function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc79"){
		//直选单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 10;
		wbffc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
		createRenXuanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc80"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 10;
		wbffc_playMethod = 80;
		createSumLayout("wbffc",0,18,function(){
			wbffc_calcNotes();
		});
		createRenXuanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc81"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 10;
		wbffc_playMethod = 81;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		createRenXuanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc82"){
		//组选单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 10;
		wbffc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
		createRenXuanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc83"){
		//组选和值
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 10;
		wbffc_playMethod = 83;
		createSumLayout("wbffc",1,17,function(){
			wbffc_calcNotes();
		});
		createRenXuanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc84"){
		//直选复式
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 11;
		wbffc_playMethod = 84;
		createFiveLineLayout("wbffc", function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc85"){
		//直选单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 11;
		wbffc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
		createRenXuanSanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc86"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 11;
		wbffc_playMethod = 86;
		createSumLayout("wbffc",0,27,function(){
			wbffc_calcNotes();
		});
		createRenXuanSanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc87"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 11;
		wbffc_playMethod = 87;
		createOneLineLayout("wbffc","至少选择2个",0,9,false,function(){
			wbffc_calcNotes();
		});
		createRenXuanSanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc88"){
		//组选单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 11;
		wbffc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
		createRenXuanSanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc89"){
		//组选和值
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 11;
		wbffc_playMethod = 89;
		createOneLineLayout("wbffc","至少选择3个",0,9,false,function(){
			wbffc_calcNotes();
		});
		createRenXuanSanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc90"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 11;
		wbffc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
		createRenXuanSanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc91"){
		//混合组选
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 11;
		wbffc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
		createRenXuanSanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc92"){
		//组选和值
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 11;
		wbffc_playMethod = 92;
		createSumLayout("wbffc",1,26,function(){
			wbffc_calcNotes();
		});
		createRenXuanSanLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc93"){
		$("#wbffc_random").show();
		wbffc_sntuo = 0;
		wbffc_playType = 12;
		wbffc_playMethod = 93;
		createFiveLineLayout("wbffc", function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc94"){
		//直选单式
		$("#wbffc_random").hide();
		wbffc_sntuo = 3;
		wbffc_playType = 12;
		wbffc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wbffc",tips);
		createRenXuanSiLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc95"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 12;
		wbffc_playMethod = 95;
		createOneLineLayout("wbffc","至少选择4个",0,9,false,function(){
			wbffc_calcNotes();
		});
		createRenXuanSiLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc96"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 12;
		wbffc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		createRenXuanSiLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc97"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 12;
		wbffc_playMethod = 97;
		$("#wbffc_ballView").empty();
		createOneLineLayout("wbffc","二重号:至少选择2个号码",0,9,false,function(){
			wbffc_calcNotes();
		});
		createRenXuanSiLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc98"){
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 12;
		wbffc_playMethod = 98;
		$("#wbffc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wbffc",tips,0,9,false,function(){
			wbffc_calcNotes();
		});
		createRenXuanSiLayout("wbffc",wbffc_playMethod,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc99"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 13;
		wbffc_playMethod = 99;
		$("#wbffc_ballView").empty();
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc100"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 13;
		wbffc_playMethod = 100;
		$("#wbffc_ballView").empty();
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc101"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 13;
		wbffc_playMethod = 101;
		$("#wbffc_ballView").empty();
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc102"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 13;
		wbffc_playMethod = 102;
		$("#wbffc_ballView").empty();
		createOneLineLayout("wbffc","至少选择1个",0,9,false,function(){
			wbffc_calcNotes();
		});
		wbffc_qingkongAll();
	}else if(val == "wbffc103"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 103;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc104"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 104;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc105"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 105;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc106"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 106;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc107"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 107;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc108"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 108;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc109"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 109;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc110"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 110;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc111"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 111;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}else if(val == "wbffc112"){
		wbffc_qingkongAll();
		$("#wbffc_random").hide();
		wbffc_sntuo = 0;
		wbffc_playType = 14;
		wbffc_playMethod = 112;
		createTextBallOneLayout("wbffc",["龙","虎","和"],["至少选择一个"],function(){
			wbffc_calcNotes();
		});
	}

	if(wbffcScroll){
		wbffcScroll.refresh();
		wbffcScroll.scrollTo(0,0,1);
	}
	
	$("#wbffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("wbffc",temp);
	hideRandomWhenLi("wbffc",wbffc_sntuo,wbffc_playMethod);
	wbffc_calcNotes();
}
/**
 * [wbffc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function wbffc_initFooterButton(){
	if(wbffc_playMethod == 0 || wbffc_playMethod == 62 || wbffc_playMethod == 78
		|| wbffc_playMethod == 84 || wbffc_playMethod == 93 || wbffc_playType == 7){
		if(LotteryStorage["wbffc"]["line1"].length > 0 || LotteryStorage["wbffc"]["line2"].length > 0 ||
			LotteryStorage["wbffc"]["line3"].length > 0 || LotteryStorage["wbffc"]["line4"].length > 0 ||
			LotteryStorage["wbffc"]["line5"].length > 0){
			$("#wbffc_qingkong").css("opacity",1.0);
		}else{
			$("#wbffc_qingkong").css("opacity",0.4);
		}
	}else if(wbffc_playMethod == 9){
		if(LotteryStorage["wbffc"]["line1"].length > 0 || LotteryStorage["wbffc"]["line2"].length > 0 ||
			LotteryStorage["wbffc"]["line3"].length > 0 || LotteryStorage["wbffc"]["line4"].length > 0 ){
			$("#wbffc_qingkong").css("opacity",1.0);
		}else{
			$("#wbffc_qingkong").css("opacity",0.4);
		}
	}else if(wbffc_playMethod == 37 || wbffc_playMethod == 4 || wbffc_playMethod == 6
		|| wbffc_playMethod == 26 || wbffc_playMethod == 15 || wbffc_playMethod == 75 || wbffc_playMethod == 77){
		if(LotteryStorage["wbffc"]["line1"].length > 0 || LotteryStorage["wbffc"]["line2"].length > 0
			|| LotteryStorage["wbffc"]["line3"].length > 0){
			$("#wbffc_qingkong").css("opacity",1.0);
		}else{
			$("#wbffc_qingkong").css("opacity",0.4);
		}
	}else if(wbffc_playMethod == 3 || wbffc_playMethod == 4 || wbffc_playMethod == 5
		|| wbffc_playMethod == 6 || wbffc_playMethod == 7 || wbffc_playMethod == 12
		|| wbffc_playMethod == 14 || wbffc_playMethod == 48 || wbffc_playMethod == 55
		|| wbffc_playMethod == 74 || wbffc_playMethod == 76 || wbffc_playMethod == 96 || wbffc_playMethod == 98){
		if(LotteryStorage["wbffc"]["line1"].length > 0 || LotteryStorage["wbffc"]["line2"].length > 0){
			$("#wbffc_qingkong").css("opacity",1.0);
		}else{
			$("#wbffc_qingkong").css("opacity",0.4);
		}
	}else if(wbffc_playMethod == 2 || wbffc_playMethod == 8 || wbffc_playMethod == 11 || wbffc_playMethod == 13 || wbffc_playMethod == 39
		|| wbffc_playMethod == 28 || wbffc_playMethod == 17 || wbffc_playMethod == 18 || wbffc_playMethod == 24 || wbffc_playMethod == 41
		|| wbffc_playMethod == 25 || wbffc_playMethod == 29 || wbffc_playMethod == 42 || wbffc_playMethod == 43 || wbffc_playMethod == 30
		|| wbffc_playMethod == 35 || wbffc_playMethod == 36 || wbffc_playMethod == 31 || wbffc_playMethod == 32 || wbffc_playMethod == 19
		|| wbffc_playMethod == 40 || wbffc_playMethod == 46 || wbffc_playMethod == 20 || wbffc_playMethod == 21 || wbffc_playMethod == 50
		|| wbffc_playMethod == 47 || wbffc_playMethod == 51 || wbffc_playMethod == 52 || wbffc_playMethod == 53 || wbffc_playMethod == 57 || wbffc_playMethod == 63
		|| wbffc_playMethod == 58 || wbffc_playMethod == 59 || wbffc_playMethod == 60 || wbffc_playMethod == 65 || wbffc_playMethod == 80 || wbffc_playMethod == 81 || wbffc_playType == 8
		|| wbffc_playMethod == 83 || wbffc_playMethod == 86 || wbffc_playMethod == 87 || wbffc_playMethod == 22 || wbffc_playMethod == 33 || wbffc_playMethod == 44
		|| wbffc_playMethod == 89 || wbffc_playMethod == 92 || wbffc_playMethod == 95 || wbffc_playMethod == 54 || wbffc_playMethod == 61
		|| wbffc_playMethod == 97 || wbffc_playType == 13  || wbffc_playType == 14){
		if(LotteryStorage["wbffc"]["line1"].length > 0){
			$("#wbffc_qingkong").css("opacity",1.0);
		}else{
			$("#wbffc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#wbffc_qingkong").css("opacity",0);
	}

	if($("#wbffc_qingkong").css("opacity") == "0"){
		$("#wbffc_qingkong").css("display","none");
	}else{
		$("#wbffc_qingkong").css("display","block");
	}

	if($('#wbffc_zhushu').html() > 0){
		$("#wbffc_queding").css("opacity",1.0);
	}else{
		$("#wbffc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  wbffc_qingkongAll(){
	$("#wbffc_ballView span").removeClass('redBalls_active');
	LotteryStorage["wbffc"]["line1"] = [];
	LotteryStorage["wbffc"]["line2"] = [];
	LotteryStorage["wbffc"]["line3"] = [];
	LotteryStorage["wbffc"]["line4"] = [];
	LotteryStorage["wbffc"]["line5"] = [];

	localStorageUtils.removeParam("wbffc_line1");
	localStorageUtils.removeParam("wbffc_line2");
	localStorageUtils.removeParam("wbffc_line3");
	localStorageUtils.removeParam("wbffc_line4");
	localStorageUtils.removeParam("wbffc_line5");

	$('#wbffc_zhushu').text(0);
	$('#wbffc_money').text(0);
	clearAwardWin("wbffc");
	wbffc_initFooterButton();
}

/**
 * [wbffc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function wbffc_calcNotes(){
	$('#wbffc_modeId').blur();
	$('#wbffc_fandian').blur();
	
	var notes = 0;

	if(wbffc_playMethod == 0){
		notes = LotteryStorage["wbffc"]["line1"].length *
			LotteryStorage["wbffc"]["line2"].length *
			LotteryStorage["wbffc"]["line3"].length *
			LotteryStorage["wbffc"]["line4"].length *
			LotteryStorage["wbffc"]["line5"].length;
	}else if(wbffc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,5);
	}else if(wbffc_playMethod == 3){
		if (LotteryStorage["wbffc"]["line1"].length >= 1 && LotteryStorage["wbffc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["wbffc"]["line1"],LotteryStorage["wbffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbffc_playMethod == 4){
		if (LotteryStorage["wbffc"]["line1"].length >= 2 && LotteryStorage["wbffc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["wbffc"]["line2"],LotteryStorage["wbffc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(wbffc_playMethod == 5 || wbffc_playMethod == 12){
		if (LotteryStorage["wbffc"]["line1"].length >= 1 && LotteryStorage["wbffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["wbffc"]["line1"],LotteryStorage["wbffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbffc_playMethod == 6 || wbffc_playMethod == 7 || wbffc_playMethod == 14){
		if (LotteryStorage["wbffc"]["line1"].length >= 1 && LotteryStorage["wbffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["wbffc"]["line1"],LotteryStorage["wbffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wbffc_playMethod == 9){
		notes = LotteryStorage["wbffc"]["line1"].length *
			LotteryStorage["wbffc"]["line2"].length *
			LotteryStorage["wbffc"]["line3"].length *
			LotteryStorage["wbffc"]["line4"].length;
	}else if(wbffc_playMethod == 18 || wbffc_playMethod == 29 || wbffc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["wbffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(wbffc_playMethod == 22 || wbffc_playMethod == 33 || wbffc_playMethod == 44 ){
		notes = 54;
	}else if(wbffc_playMethod == 54 || wbffc_playMethod == 61){
		notes = 9;
	}else if(wbffc_playMethod == 51 || wbffc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["wbffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(wbffc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,4);
	}else if(wbffc_playMethod == 13|| wbffc_playMethod == 64 || wbffc_playMethod == 66 || wbffc_playMethod == 68 || wbffc_playMethod == 70 || wbffc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,2);
	}else if(wbffc_playMethod == 37 || wbffc_playMethod == 26 || wbffc_playMethod == 15 || wbffc_playMethod == 75 || wbffc_playMethod == 77){
		notes = LotteryStorage["wbffc"]["line1"].length *
			LotteryStorage["wbffc"]["line2"].length *
			LotteryStorage["wbffc"]["line3"].length ;
	}else if(wbffc_playMethod == 39 || wbffc_playMethod == 28 || wbffc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["wbffc"]["line1"][i]);
		};
	}else if(wbffc_playMethod == 41 || wbffc_playMethod == 30 || wbffc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["wbffc"]["line1"].length,2);
	}else if(wbffc_playMethod == 42 || wbffc_playMethod == 31 || wbffc_playMethod == 20 || wbffc_playMethod == 68 || wbffc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,3);
	}else if(wbffc_playMethod == 43 || wbffc_playMethod == 32 || wbffc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["wbffc"]["line1"][i]);
		};
	}else if(wbffc_playMethod == 48 || wbffc_playMethod == 55 || wbffc_playMethod == 74 || wbffc_playMethod == 76){
		notes = LotteryStorage["wbffc"]["line1"].length *
			LotteryStorage["wbffc"]["line2"].length ;
	}else if(wbffc_playMethod == 50 || wbffc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["wbffc"]["line1"][i]);
		};
	}else if(wbffc_playMethod == 52 || wbffc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,2);
	}else if(wbffc_playMethod == 53 || wbffc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["wbffc"]["line1"][i]);
		};
	}else if(wbffc_playMethod == 62){
		notes = LotteryStorage["wbffc"]["line1"].length +
			LotteryStorage["wbffc"]["line2"].length +
			LotteryStorage["wbffc"]["line3"].length +
			LotteryStorage["wbffc"]["line4"].length +
			LotteryStorage["wbffc"]["line5"].length;
	}else if(wbffc_playType == 13 || wbffc_playType == 14 || wbffc_playMethod == 8 || wbffc_playMethod == 71
		|| wbffc_playMethod == 24 || wbffc_playMethod == 25 || wbffc_playMethod == 35 || wbffc_playMethod == 36 || wbffc_playMethod == 46
		|| wbffc_playMethod == 47 || wbffc_playMethod == 63 || wbffc_playMethod == 65 || wbffc_playMethod == 67 || wbffc_playMethod == 69 ){
		notes = LotteryStorage["wbffc"]["line1"].length ;
	}else if(wbffc_playMethod == 78){
		notes = LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line2"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line3"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line4"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line3"].length +
			LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line4"].length +
			LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line4"].length +
			LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line4"].length * LotteryStorage["wbffc"]["line5"].length;
	}else if (wbffc_playMethod == 80) {
		if ($("#wbffc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["wbffc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,2);
		}
	}else if (wbffc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,2) * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,2);
	}else if (wbffc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["wbffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,2);
	}else if (wbffc_playMethod == 84) {
		notes = LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line3"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line4"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line4"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line4"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line4"].length +
			LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line4"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line4"].length * LotteryStorage["wbffc"]["line5"].length ;
	}else if (wbffc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["wbffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,3);
	}else if (wbffc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["wbffc"]["line1"].length,2) * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,3);
	}else if (wbffc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,3) * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,3);
	}else if (wbffc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["wbffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["wbffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,3);
	}else if (wbffc_playMethod == 93) {
		notes = LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line4"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line4"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line1"].length * LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line4"].length * LotteryStorage["wbffc"]["line5"].length +
			LotteryStorage["wbffc"]["line2"].length * LotteryStorage["wbffc"]["line3"].length * LotteryStorage["wbffc"]["line4"].length * LotteryStorage["wbffc"]["line5"].length;
	}else if (wbffc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,4)
			* mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,4);
	}else if (wbffc_playMethod == 96) {
		if (LotteryStorage["wbffc"]["line1"].length >= 1 && LotteryStorage["wbffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["wbffc"]["line1"],LotteryStorage["wbffc"]["line2"])
				* mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (wbffc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["wbffc"]["line1"].length,2) * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,4);
	}else if (wbffc_playMethod == 98) {
		if (LotteryStorage["wbffc"]["line1"].length >= 1 && LotteryStorage["wbffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["wbffc"]["line1"],LotteryStorage["wbffc"]["line2"]) * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = wbffcValidData($("#wbffc_single").val());
	}

	if(wbffc_sntuo == 3 || wbffc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","wbffc"),LotteryInfo.getMethodId("ssc",wbffc_playMethod))){
	}else{
		if(parseInt($('#wbffc_modeId').val()) == 8){
			$("#wbffc_random").hide();
		}else{
			$("#wbffc_random").show();
		}
	}

	//验证是否为空
	if( $("#wbffc_beiNum").val() =="" || parseInt($("#wbffc_beiNum").val()) == 0){
		$("#wbffc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#wbffc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#wbffc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#wbffc_zhushu').text(notes);
		if($("#wbffc_modeId").val() == "8"){
			$('#wbffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbffc_beiNum").val()),0.002));
		}else if ($("#wbffc_modeId").val() == "2"){
			$('#wbffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbffc_beiNum").val()),0.2));
		}else if ($("#wbffc_modeId").val() == "1"){
			$('#wbffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbffc_beiNum").val()),0.02));
		}else{
			$('#wbffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbffc_beiNum").val()),2));
		}
	} else {
		$('#wbffc_zhushu').text(0);
		$('#wbffc_money').text(0);
	}
	wbffc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('wbffc',wbffc_playMethod);
}

/**
 * [wbffc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function wbffc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#wbffc_queding").bind('click', function(event) {

		wbffc_rebate = $("#wbffc_fandian option:last").val();
		if(parseInt($('#wbffc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		wbffc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#wbffc_modeId').val()) == 8){
			if (Number($('#wbffc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('wbffc',wbffc_playMethod);

		submitParams.lotteryType = "wbffc";
		var play = LotteryInfo.getPlayName("ssc",wbffc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",wbffc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = wbffc_playType;
		submitParams.playMethodIndex = wbffc_playMethod;
		var selectedBalls = [];
		if(wbffc_playMethod == 0 || wbffc_playMethod == 3 || wbffc_playMethod == 4
			|| wbffc_playMethod == 5 || wbffc_playMethod == 6 || wbffc_playMethod == 7
			|| wbffc_playMethod == 9 || wbffc_playMethod == 12 || wbffc_playMethod == 14
			|| wbffc_playMethod == 37 || wbffc_playMethod == 26 || wbffc_playMethod == 15
			|| wbffc_playMethod == 48 || wbffc_playMethod == 55 || wbffc_playMethod == 74 || wbffc_playType == 9){
			$("#wbffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(wbffc_playMethod == 2 || wbffc_playMethod == 8 || wbffc_playMethod == 11 || wbffc_playMethod == 13 || wbffc_playMethod == 24
			|| wbffc_playMethod == 39 || wbffc_playMethod == 28 || wbffc_playMethod == 17 || wbffc_playMethod == 18 || wbffc_playMethod == 25
			|| wbffc_playMethod == 22 || wbffc_playMethod == 33 || wbffc_playMethod == 44 || wbffc_playMethod == 54 || wbffc_playMethod == 61
			|| wbffc_playMethod == 41 || wbffc_playMethod == 42 || wbffc_playMethod == 43 || wbffc_playMethod == 29 || wbffc_playMethod == 35
			|| wbffc_playMethod == 30 || wbffc_playMethod == 31 || wbffc_playMethod == 32 || wbffc_playMethod == 40 || wbffc_playMethod == 36
			|| wbffc_playMethod == 19 || wbffc_playMethod == 20 || wbffc_playMethod == 21 || wbffc_playMethod == 46 || wbffc_playMethod == 47
			|| wbffc_playMethod == 50 || wbffc_playMethod == 57 || wbffc_playType == 8 || wbffc_playMethod == 51 || wbffc_playMethod == 58
			|| wbffc_playMethod == 52 || wbffc_playMethod == 53|| wbffc_playMethod == 59 || wbffc_playMethod == 60 || wbffc_playType == 13 || wbffc_playType == 14){
			$("#wbffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(wbffc_playType == 7 || wbffc_playMethod == 78 || wbffc_playMethod == 84 || wbffc_playMethod == 93){
			$("#wbffc_ballView div.ballView").each(function(){
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
		}else if(wbffc_playMethod == 80 || wbffc_playMethod == 81 || wbffc_playMethod == 83
			|| wbffc_playMethod == 86 || wbffc_playMethod == 87 || wbffc_playMethod == 89
			|| wbffc_playMethod == 92 || wbffc_playMethod == 95 || wbffc_playMethod == 97){
			$("#wbffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#wbffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#wbffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#wbffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#wbffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#wbffc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (wbffc_playMethod == 96 || wbffc_playMethod == 98) {
			$("#wbffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#wbffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#wbffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#wbffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#wbffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#wbffc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			wbffcValidateData("submit");
			var array = handleSingleStr($("#wbffc_single").val());
			if(wbffc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(wbffc_playMethod == 10 || wbffc_playMethod == 38 || wbffc_playMethod == 27
				|| wbffc_playMethod == 16 || wbffc_playMethod == 49 || wbffc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(wbffc_playMethod == 45 || wbffc_playMethod == 34 || wbffc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(wbffc_playMethod == 79 || wbffc_playMethod == 82 || wbffc_playMethod == 85 || wbffc_playMethod == 88 ||
				wbffc_playMethod == 89 || wbffc_playMethod == 90 || wbffc_playMethod == 91 || wbffc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#wbffc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#wbffc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#wbffc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#wbffc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#wbffc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#wbffc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#wbffc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#wbffc_fandian").val());
		submitParams.notes = $('#wbffc_zhushu').html();
		submitParams.sntuo = wbffc_sntuo;
		submitParams.multiple = $('#wbffc_beiNum').val();  //requirement
		submitParams.rebates = $('#wbffc_fandian').val();  //requirement
		submitParams.playMode = $('#wbffc_modeId').val();  //requirement
		submitParams.money = $('#wbffc_money').html();  //requirement
		submitParams.award = $('#wbffc_minAward').html();  //奖金
		submitParams.maxAward = $('#wbffc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#wbffc_ballView").empty();
		wbffc_qingkongAll();
	});
}

/**
 * [wbffc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function wbffc_randomOne(){
	wbffc_qingkongAll();
	if(wbffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["wbffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["wbffc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["wbffc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line2"], function(k, v){
			$("#" + "wbffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line3"], function(k, v){
			$("#" + "wbffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line4"], function(k, v){
			$("#" + "wbffc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line5"], function(k, v){
			$("#" + "wbffc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["wbffc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["wbffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["wbffc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line2"], function(k, v){
			$("#" + "wbffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line3"], function(k, v){
			$("#" + "wbffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line4"], function(k, v){
			$("#" + "wbffc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(wbffc_playMethod == 37 || wbffc_playMethod == 26 || wbffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["wbffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wbffc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line2"], function(k, v){
			$("#" + "wbffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line3"], function(k, v){
			$("#" + "wbffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 41 || wbffc_playMethod == 30 || wbffc_playMethod == 19 || wbffc_playMethod == 68
		|| wbffc_playMethod == 52 || wbffc_playMethod == 64 || wbffc_playMethod == 66
		|| wbffc_playMethod == 59 || wbffc_playMethod == 70 || wbffc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["wbffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 42 || wbffc_playMethod == 31 || wbffc_playMethod == 20 || wbffc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["wbffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 39 || wbffc_playMethod == 28 || wbffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["wbffc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 43 || wbffc_playMethod == 32 || wbffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["wbffc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 48 || wbffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["wbffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wbffc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line2"], function(k, v){
			$("#" + "wbffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 25 || wbffc_playMethod == 36 || wbffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["wbffc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 50 || wbffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["wbffc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 53 || wbffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["wbffc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["wbffc"]["line"+line].push(number+"");
		$.each(LotteryStorage["wbffc"]["line"+line], function(k, v){
			$("#" + "wbffc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 63 || wbffc_playMethod == 67 || wbffc_playMethod == 69 || wbffc_playMethod == 71 || wbffc_playType == 13
		|| wbffc_playMethod == 65 || wbffc_playMethod == 18 || wbffc_playMethod == 29 || wbffc_playMethod == 40 || wbffc_playMethod == 22
		|| wbffc_playMethod == 33 || wbffc_playMethod == 44 || wbffc_playMethod == 54 || wbffc_playMethod == 61
		|| wbffc_playMethod == 24 || wbffc_playMethod == 35 || wbffc_playMethod == 46 || wbffc_playMethod == 51 || wbffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["wbffc"]["line1"].push(number+'');
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 74 || wbffc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["wbffc"]["line1"].push(array[0]+"");
		LotteryStorage["wbffc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line2"], function(k, v){
			$("#" + "wbffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 75 || wbffc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["wbffc"]["line1"].push(array[0]+"");
		LotteryStorage["wbffc"]["line2"].push(array[1]+"");
		LotteryStorage["wbffc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line2"], function(k, v){
			$("#" + "wbffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line3"], function(k, v){
			$("#" + "wbffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["wbffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbffc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["wbffc"]["line"+lines[0]], function(k, v){
			$("#" + "wbffc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line"+lines[1]], function(k, v){
			$("#" + "wbffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["wbffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["wbffc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["wbffc"]["line"+lines[0]], function(k, v){
			$("#" + "wbffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line"+lines[1]], function(k, v){
			$("#" + "wbffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line"+lines[0]], function(k, v){
			$("#" + "wbffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["wbffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wbffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["wbffc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["wbffc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["wbffc"]["line"+lines[0]], function(k, v){
			$("#" + "wbffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line"+lines[1]], function(k, v){
			$("#" + "wbffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line"+lines[2]], function(k, v){
			$("#" + "wbffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wbffc"]["line"+lines[3]], function(k, v){
			$("#" + "wbffc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(wbffc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["wbffc"]["line1"].push(number+"");
		$.each(LotteryStorage["wbffc"]["line1"], function(k, v){
			$("#" + "wbffc_line1" + v).toggleClass("redBalls_active");
		});
	}
	wbffc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function wbffc_checkOutRandom(playMethod){
	var obj = new Object();
	if(wbffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(wbffc_playMethod == 18 || wbffc_playMethod == 29 || wbffc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(wbffc_playMethod == 22 || wbffc_playMethod == 33 || wbffc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(wbffc_playMethod == 54 || wbffc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(wbffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbffc_playMethod == 37 || wbffc_playMethod == 26 || wbffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbffc_playMethod == 39 || wbffc_playMethod == 28 || wbffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(wbffc_playMethod == 41 || wbffc_playMethod == 30 || wbffc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(wbffc_playMethod == 52 || wbffc_playMethod == 59 || wbffc_playMethod == 64 || wbffc_playMethod == 66 || wbffc_playMethod == 68
		||wbffc_playMethod == 70 || wbffc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(wbffc_playMethod == 42 || wbffc_playMethod == 31 || wbffc_playMethod == 20 || wbffc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(wbffc_playMethod == 43 || wbffc_playMethod == 32 || wbffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(wbffc_playMethod == 48 || wbffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wbffc_playMethod == 50 || wbffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(wbffc_playMethod == 53 || wbffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(wbffc_playMethod == 62){
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
	}else if(wbffc_playMethod == 63 || wbffc_playMethod == 65 || wbffc_playMethod == 67 || wbffc_playMethod == 69 || wbffc_playMethod == 71
		|| wbffc_playMethod == 24 || wbffc_playMethod == 35 || wbffc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(wbffc_playMethod == 25 || wbffc_playMethod == 36 || wbffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(wbffc_playMethod == 51 || wbffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(wbffc_playMethod == 74 || wbffc_playMethod == 76){
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
	}else if(wbffc_playMethod == 75 || wbffc_playMethod == 77){
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
	}else if(wbffc_playMethod == 78){
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
	}else if(wbffc_playMethod == 84){
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
	}else if(wbffc_playMethod == 93){
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
	obj.sntuo = wbffc_sntuo;
	obj.multiple = 1;
	obj.rebates = wbffc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('wbffc',wbffc_playMethod,obj);  //机选奖金计算
	obj.award = $('#wbffc_minAward').html();     //奖金
	obj.maxAward = $('#wbffc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [wbffcValidateData 单式数据验证]
 */
function wbffcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#wbffc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	wbffcValidData(textStr,type);
}

function wbffcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(wbffc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 38 || wbffc_playMethod == 27 || wbffc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 45 || wbffc_playMethod == 34 || wbffc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 49 || wbffc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,2);
        wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,2);
        wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,3);
        wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,3);
        wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,3);
        wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,3);
        wbffcShowFooter(true,notes);
    }else if(wbffc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wbffc_tab .button.red").size() ,4);
        wbffcShowFooter(true,notes);
    }

	$('#wbffc_delRepeat').off('click');
	$('#wbffc_delRepeat').on('click',function () {
		content.str = $('#wbffc_single').val() ? $('#wbffc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		wbffcShowFooter(true,notes);
		$("#wbffc_single").val(array.join(" "));
	});

    $("#wbffc_single").val(array.join(" "));
    return notes;
}

function wbffcShowFooter(isValid,notes){
	$('#wbffc_zhushu').text(notes);
	if($("#wbffc_modeId").val() == "8"){
		$('#wbffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbffc_beiNum").val()),0.002));
	}else if ($("#wbffc_modeId").val() == "2"){
		$('#wbffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbffc_beiNum").val()),0.2));
	}else if ($("#wbffc_modeId").val() == "1"){
		$('#wbffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbffc_beiNum").val()),0.02));
	}else{
		$('#wbffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wbffc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	wbffc_initFooterButton();
	calcAwardWin('wbffc',wbffc_playMethod);  //计算奖金和盈利
}