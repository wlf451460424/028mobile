var hnwfc_playType = 2;
var hnwfc_playMethod = 15;
var hnwfc_sntuo = 0;
var hnwfc_rebate;
var hnwfcScroll;

//进入这个页面时调用
function hnwfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hnwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hnwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hnwfcPageUnloadedPanel(){
	$("#hnwfc_queding").off('click');
	$("#hnwfcPage_back").off('click');
	$("#hnwfc_ballView").empty();
	$("#hnwfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hnwfcPlaySelect"></select>');
	$("#hnwfcSelect").append($select);
}

//入口函数
function hnwfc_init(){
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
	$("#hnwfc_title").html(LotteryInfo.getLotteryNameByTag("hnwfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == hnwfc_playType && j == hnwfc_playMethod){
					$play.append('<option value="hnwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hnwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hnwfc_playMethod,onShowArray)>-1 ){
						hnwfc_playType = i;
						hnwfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hnwfcPlaySelect").append($play);
		}
	}
	
	if($("#hnwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("hnwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hnwfcChangeItem
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

	GetLotteryInfo("hnwfc",function (){
		hnwfcChangeItem("hnwfc"+hnwfc_playMethod);
	});

	//添加滑动条
	if(!hnwfcScroll){
		hnwfcScroll = new IScroll('#hnwfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("hnwfc",LotteryInfo.getLotteryIdByTag("hnwfc"));

	//获取上一期开奖
	queryLastPrize("hnwfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('hnwfc');

	//机选选号
	$("#hnwfc_random").off('click');
	$("#hnwfc_random").on('click', function(event) {
		hnwfc_randomOne();
	});
	
	$("#hnwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",hnwfc_playMethod));
	//玩法说明
	$("#hnwfc_paly_shuoming").off('click');
	$("#hnwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hnwfc_shuoming").text());
	});

	//返回
	$("#hnwfcPage_back").on('click', function(event) {
		// hnwfc_playType = 2;
		// hnwfc_playMethod = 15;
		$("#hnwfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hnwfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("hnwfc");//清空
	hnwfc_submitData();
}

function hnwfcResetPlayType(){
	hnwfc_playType = 2;
	hnwfc_playMethod = 15;
}

function hnwfcChangeItem(val) {
	hnwfc_qingkongAll();
	var temp = val.substring("hnwfc".length,val.length);
	if(val == "hnwfc0"){
		//直选复式
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 0;
		hnwfc_playMethod = 0;
		createFiveLineLayout("hnwfc", function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc1"){
		//直选单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 0;
		hnwfc_playMethod = 1;
		$("#hnwfc_ballView").empty();
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc2"){
		//组选120
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 0;
		hnwfc_playMethod = 2;
		createOneLineLayout("hnwfc","至少选择5个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc3"){
		//组选60
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 0;
		hnwfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc4"){
		//组选30
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 0;
		hnwfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc5"){
		//组选20
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 0;
		hnwfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc6"){
		//组选10
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 0;
		hnwfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc7"){
		//组选5
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 0;
		hnwfc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc8"){
		//总和大小单双
		$("#hnwfc_random").show();
		var num = ["大","小","单","双"];
		hnwfc_sntuo = 0;
		hnwfc_playType = 0;
		hnwfc_playMethod = 8;
		createNonNumLayout("hnwfc",hnwfc_playMethod,num,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc9"){
		//直选复式
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 1;
		hnwfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("hnwfc",tips, function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc10"){
		//直选单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 1;
		hnwfc_playMethod = 10;
		$("#hnwfc_ballView").empty();
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc11"){
		//组选24
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 1;
		hnwfc_playMethod = 11;
		createOneLineLayout("hnwfc","至少选择4个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc12"){
		//组选12
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 1;
		hnwfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc13"){
		//组选6
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 1;
		hnwfc_playMethod = 13;
		createOneLineLayout("hnwfc","二重号:至少选择2个号码",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc14"){
		//组选4
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 1;
		hnwfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc15"){
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc16"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 2;
		hnwfc_playMethod = 16;
		$("#hnwfc_ballView").empty();
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc17"){
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 17;
		createSumLayout("hnwfc",0,27,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc18"){
		//直选跨度
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 18;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc19"){
		//后三组三
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 19;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc20"){
		//后三组六
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 20;
		createOneLineLayout("hnwfc","至少选择3个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc21"){
		//后三和值
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 21;
		createSumLayout("hnwfc",1,26,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc22"){
		//后三组选包胆
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 22;
		hnwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnwfc",array,["请选择一个号码"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc23"){
		//后三混合组选
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 2;
		hnwfc_playMethod = 23;
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc24"){
		//和值尾数
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 24;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc25"){
		//特殊号
		$("#hnwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnwfc_sntuo = 0;
		hnwfc_playType = 2;
		hnwfc_playMethod = 25;
		createNonNumLayout("hnwfc",hnwfc_playMethod,num,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc26"){
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc27"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 3;
		hnwfc_playMethod = 27;
		$("#hnwfc_ballView").empty();
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc28"){
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 28;
		createSumLayout("hnwfc",0,27,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc29"){
		//直选跨度
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 29;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc30"){
		//中三组三
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 30;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc31"){
		//中三组六
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 31;
		createOneLineLayout("hnwfc","至少选择3个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc32"){
		//中三和值
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 32;
		createSumLayout("hnwfc",1,26,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc33"){
		//中三组选包胆
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 33;
		hnwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnwfc",array,["请选择一个号码"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc34"){
		//中三混合组选
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 3;
		hnwfc_playMethod = 34;
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc35"){
		//和值尾数
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 35;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc36"){
		//特殊号
		$("#hnwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnwfc_sntuo = 0;
		hnwfc_playType = 3;
		hnwfc_playMethod = 36;
		createNonNumLayout("hnwfc",hnwfc_playMethod,num,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc37"){
		//直选复式
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc38"){
		//直选单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 4;
		hnwfc_playMethod = 38;
		$("#hnwfc_ballView").empty();
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc39"){
		//和值
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 39;
		createSumLayout("hnwfc",0,27,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc40"){
		//直选跨度
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 40;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc41"){
		//前三组三
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 41;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc42"){
		//前三组六
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 42;
		createOneLineLayout("hnwfc","至少选择3个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc43"){
		//前三和值
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 43;
		createSumLayout("hnwfc",1,26,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc44"){
		//前三组选包胆
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 44;
		hnwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnwfc",array,["请选择一个号码"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc45"){
		//前三混合组选
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 4;
		hnwfc_playMethod = 45;
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc46"){
		//和值尾数
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 46;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc47"){
		//特殊号
		$("#hnwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnwfc_sntuo = 0;
		hnwfc_playType = 4;
		hnwfc_playMethod = 47;
		createNonNumLayout("hnwfc",hnwfc_playMethod,num,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc48"){
		//后二复式
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 5;
		hnwfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc49"){
		//后二单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 5;
		hnwfc_playMethod = 49;
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc50"){
		//后二和值
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 5;
		hnwfc_playMethod = 50;
		createSumLayout("hnwfc",0,18,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc51"){
		//直选跨度
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 5;
		hnwfc_playMethod = 51;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc52"){
		//后二组选
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 5;
		hnwfc_playMethod = 52;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc53"){
		//后二和值
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 5;
		hnwfc_playMethod = 53;
		createSumLayout("hnwfc",1,17,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc54"){
		//后二组选包胆
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 5;
		hnwfc_playMethod = 54;
		hnwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnwfc",array,["请选择一个号码"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc55"){
		//前二复式
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 6;
		hnwfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc56"){
		//前二单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 6;
		hnwfc_playMethod = 56;
		hnwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
	}else if(val == "hnwfc57"){
		//前二和值
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 6;
		hnwfc_playMethod = 57;
		createSumLayout("hnwfc",0,18,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc58"){
		//直选跨度
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 6;
		hnwfc_playMethod = 58;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc59"){
		//前二组选
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 6;
		hnwfc_playMethod = 59;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc60"){
		//前二和值
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 6;
		hnwfc_playMethod = 60;
		createSumLayout("hnwfc",1,17,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc61"){
		//前二组选包胆
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 6;
		hnwfc_playMethod = 61;
		hnwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnwfc",array,["请选择一个号码"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc62"){
		//定位复式
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 7;
		hnwfc_playMethod = 62;
		createFiveLineLayout("hnwfc", function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc63"){
		//后三一码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 63;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc64"){
		//后三二码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 64;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc65"){
		//前三一码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 65;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc66"){
		//前三二码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 66;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc67"){
		//后四一码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 67;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc68"){
		//后四二码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 68;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc69"){
		//前四一码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 69;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc70"){
		//前四二码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 70;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc71"){
		//五星一码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 71;
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc72"){
		//五星二码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 72;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc73"){
		//五星三码
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 8;
		hnwfc_playMethod = 73;
		createOneLineLayout("hnwfc","至少选择3个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc74"){
		//后二大小单双
		hnwfc_qingkongAll();
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 9;
		hnwfc_playMethod = 74;
		createTextBallTwoLayout("hnwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc75"){
		//后三大小单双
		hnwfc_qingkongAll();
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 9;
		hnwfc_playMethod = 75;
		createTextBallThreeLayout("hnwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc76"){
		//前二大小单双
		hnwfc_qingkongAll();
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 9;
		hnwfc_playMethod = 76;
		createTextBallTwoLayout("hnwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc77"){
		//前三大小单双
		hnwfc_qingkongAll();
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 9;
		hnwfc_playMethod = 77;
		createTextBallThreeLayout("hnwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc78"){
		//直选复式
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 10;
		hnwfc_playMethod = 78;
		createFiveLineLayout("hnwfc",function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc79"){
		//直选单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 10;
		hnwfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
		createRenXuanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc80"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 10;
		hnwfc_playMethod = 80;
		createSumLayout("hnwfc",0,18,function(){
			hnwfc_calcNotes();
		});
		createRenXuanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc81"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 10;
		hnwfc_playMethod = 81;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		createRenXuanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc82"){
		//组选单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 10;
		hnwfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
		createRenXuanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc83"){
		//组选和值
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 10;
		hnwfc_playMethod = 83;
		createSumLayout("hnwfc",1,17,function(){
			hnwfc_calcNotes();
		});
		createRenXuanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc84"){
		//直选复式
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 11;
		hnwfc_playMethod = 84;
		createFiveLineLayout("hnwfc", function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc85"){
		//直选单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 11;
		hnwfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
		createRenXuanSanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc86"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 11;
		hnwfc_playMethod = 86;
		createSumLayout("hnwfc",0,27,function(){
			hnwfc_calcNotes();
		});
		createRenXuanSanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc87"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 11;
		hnwfc_playMethod = 87;
		createOneLineLayout("hnwfc","至少选择2个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		createRenXuanSanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc88"){
		//组选单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 11;
		hnwfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
		createRenXuanSanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc89"){
		//组选和值
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 11;
		hnwfc_playMethod = 89;
		createOneLineLayout("hnwfc","至少选择3个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		createRenXuanSanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc90"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 11;
		hnwfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
		createRenXuanSanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc91"){
		//混合组选
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 11;
		hnwfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
		createRenXuanSanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc92"){
		//组选和值
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 11;
		hnwfc_playMethod = 92;
		createSumLayout("hnwfc",1,26,function(){
			hnwfc_calcNotes();
		});
		createRenXuanSanLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc93"){
		$("#hnwfc_random").show();
		hnwfc_sntuo = 0;
		hnwfc_playType = 12;
		hnwfc_playMethod = 93;
		createFiveLineLayout("hnwfc", function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc94"){
		//直选单式
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 3;
		hnwfc_playType = 12;
		hnwfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnwfc",tips);
		createRenXuanSiLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc95"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 12;
		hnwfc_playMethod = 95;
		createOneLineLayout("hnwfc","至少选择4个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		createRenXuanSiLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc96"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 12;
		hnwfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		createRenXuanSiLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc97"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 12;
		hnwfc_playMethod = 97;
		$("#hnwfc_ballView").empty();
		createOneLineLayout("hnwfc","二重号:至少选择2个号码",0,9,false,function(){
			hnwfc_calcNotes();
		});
		createRenXuanSiLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc98"){
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 12;
		hnwfc_playMethod = 98;
		$("#hnwfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnwfc",tips,0,9,false,function(){
			hnwfc_calcNotes();
		});
		createRenXuanSiLayout("hnwfc",hnwfc_playMethod,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc99"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 13;
		hnwfc_playMethod = 99;
		$("#hnwfc_ballView").empty();
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc100"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 13;
		hnwfc_playMethod = 100;
		$("#hnwfc_ballView").empty();
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc101"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 13;
		hnwfc_playMethod = 101;
		$("#hnwfc_ballView").empty();
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc102"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 13;
		hnwfc_playMethod = 102;
		$("#hnwfc_ballView").empty();
		createOneLineLayout("hnwfc","至少选择1个",0,9,false,function(){
			hnwfc_calcNotes();
		});
		hnwfc_qingkongAll();
	}else if(val == "hnwfc103"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 103;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc104"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 104;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc105"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 105;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc106"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 106;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc107"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 107;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc108"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 108;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc109"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 109;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc110"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 110;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc111"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 111;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc112"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 14;
		hnwfc_playMethod = 112;
		createTextBallOneLayout("hnwfc",["龙","虎","和"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc123"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 123;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc124"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 124;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc125"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 125;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc126"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 126;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc127"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 127;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc128"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 128;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc129"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 129;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc130"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 130;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc131"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 131;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}else if(val == "hnwfc132"){
		hnwfc_qingkongAll();
		$("#hnwfc_random").hide();
		hnwfc_sntuo = 0;
		hnwfc_playType = 16;
		hnwfc_playMethod = 132;
		createTextBallOneLayout("hnwfc",["龙","虎"],["至少选择一个"],function(){
			hnwfc_calcNotes();
		});
	}

	if(hnwfcScroll){
		hnwfcScroll.refresh();
		hnwfcScroll.scrollTo(0,0,1);
	}
	
	$("#hnwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("hnwfc",temp);
	hideRandomWhenLi("hnwfc",hnwfc_sntuo,hnwfc_playMethod);
	hnwfc_calcNotes();
}
/**
 * [hnwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hnwfc_initFooterButton(){
	if(hnwfc_playMethod == 0 || hnwfc_playMethod == 62 || hnwfc_playMethod == 78
		|| hnwfc_playMethod == 84 || hnwfc_playMethod == 93 || hnwfc_playType == 7){
		if(LotteryStorage["hnwfc"]["line1"].length > 0 || LotteryStorage["hnwfc"]["line2"].length > 0 ||
			LotteryStorage["hnwfc"]["line3"].length > 0 || LotteryStorage["hnwfc"]["line4"].length > 0 ||
			LotteryStorage["hnwfc"]["line5"].length > 0){
			$("#hnwfc_qingkong").css("opacity",1.0);
		}else{
			$("#hnwfc_qingkong").css("opacity",0.4);
		}
	}else if(hnwfc_playMethod == 9){
		if(LotteryStorage["hnwfc"]["line1"].length > 0 || LotteryStorage["hnwfc"]["line2"].length > 0 ||
			LotteryStorage["hnwfc"]["line3"].length > 0 || LotteryStorage["hnwfc"]["line4"].length > 0 ){
			$("#hnwfc_qingkong").css("opacity",1.0);
		}else{
			$("#hnwfc_qingkong").css("opacity",0.4);
		}
	}else if(hnwfc_playMethod == 37 || hnwfc_playMethod == 4 || hnwfc_playMethod == 6
		|| hnwfc_playMethod == 26 || hnwfc_playMethod == 15 || hnwfc_playMethod == 75 || hnwfc_playMethod == 77){
		if(LotteryStorage["hnwfc"]["line1"].length > 0 || LotteryStorage["hnwfc"]["line2"].length > 0
			|| LotteryStorage["hnwfc"]["line3"].length > 0){
			$("#hnwfc_qingkong").css("opacity",1.0);
		}else{
			$("#hnwfc_qingkong").css("opacity",0.4);
		}
	}else if(hnwfc_playMethod == 3 || hnwfc_playMethod == 4 || hnwfc_playMethod == 5
		|| hnwfc_playMethod == 6 || hnwfc_playMethod == 7 || hnwfc_playMethod == 12
		|| hnwfc_playMethod == 14 || hnwfc_playMethod == 48 || hnwfc_playMethod == 55
		|| hnwfc_playMethod == 74 || hnwfc_playMethod == 76 || hnwfc_playMethod == 96 || hnwfc_playMethod == 98){
		if(LotteryStorage["hnwfc"]["line1"].length > 0 || LotteryStorage["hnwfc"]["line2"].length > 0){
			$("#hnwfc_qingkong").css("opacity",1.0);
		}else{
			$("#hnwfc_qingkong").css("opacity",0.4);
		}
	}else if(hnwfc_playMethod == 2 || hnwfc_playMethod == 8 || hnwfc_playMethod == 11 || hnwfc_playMethod == 13 || hnwfc_playMethod == 39
		|| hnwfc_playMethod == 28 || hnwfc_playMethod == 17 || hnwfc_playMethod == 18 || hnwfc_playMethod == 24 || hnwfc_playMethod == 41
		|| hnwfc_playMethod == 25 || hnwfc_playMethod == 29 || hnwfc_playMethod == 42 || hnwfc_playMethod == 43 || hnwfc_playMethod == 30
		|| hnwfc_playMethod == 35 || hnwfc_playMethod == 36 || hnwfc_playMethod == 31 || hnwfc_playMethod == 32 || hnwfc_playMethod == 19
		|| hnwfc_playMethod == 40 || hnwfc_playMethod == 46 || hnwfc_playMethod == 20 || hnwfc_playMethod == 21 || hnwfc_playMethod == 50
		|| hnwfc_playMethod == 47 || hnwfc_playMethod == 51 || hnwfc_playMethod == 52 || hnwfc_playMethod == 53 || hnwfc_playMethod == 57 || hnwfc_playMethod == 63
		|| hnwfc_playMethod == 58 || hnwfc_playMethod == 59 || hnwfc_playMethod == 60 || hnwfc_playMethod == 65 || hnwfc_playMethod == 80 || hnwfc_playMethod == 81 || hnwfc_playType == 8
		|| hnwfc_playMethod == 83 || hnwfc_playMethod == 86 || hnwfc_playMethod == 87 || hnwfc_playMethod == 22 || hnwfc_playMethod == 33 || hnwfc_playMethod == 44
		|| hnwfc_playMethod == 89 || hnwfc_playMethod == 92 || hnwfc_playMethod == 95 || hnwfc_playMethod == 54 || hnwfc_playMethod == 61
		|| hnwfc_playMethod == 97 || hnwfc_playType == 13  || hnwfc_playType == 14 || hnwfc_playType == 16){
		if(LotteryStorage["hnwfc"]["line1"].length > 0){
			$("#hnwfc_qingkong").css("opacity",1.0);
		}else{
			$("#hnwfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hnwfc_qingkong").css("opacity",0);
	}

	if($("#hnwfc_qingkong").css("opacity") == "0"){
		$("#hnwfc_qingkong").css("display","none");
	}else{
		$("#hnwfc_qingkong").css("display","block");
	}

	if($('#hnwfc_zhushu').html() > 0){
		$("#hnwfc_queding").css("opacity",1.0);
	}else{
		$("#hnwfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  hnwfc_qingkongAll(){
	$("#hnwfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["hnwfc"]["line1"] = [];
	LotteryStorage["hnwfc"]["line2"] = [];
	LotteryStorage["hnwfc"]["line3"] = [];
	LotteryStorage["hnwfc"]["line4"] = [];
	LotteryStorage["hnwfc"]["line5"] = [];

	localStorageUtils.removeParam("hnwfc_line1");
	localStorageUtils.removeParam("hnwfc_line2");
	localStorageUtils.removeParam("hnwfc_line3");
	localStorageUtils.removeParam("hnwfc_line4");
	localStorageUtils.removeParam("hnwfc_line5");

	$('#hnwfc_zhushu').text(0);
	$('#hnwfc_money').text(0);
	clearAwardWin("hnwfc");
	hnwfc_initFooterButton();
}

/**
 * [hnwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hnwfc_calcNotes(){
	$('#hnwfc_modeId').blur();
	$('#hnwfc_fandian').blur();
	
	var notes = 0;

	if(hnwfc_playMethod == 0){
		notes = LotteryStorage["hnwfc"]["line1"].length *
			LotteryStorage["hnwfc"]["line2"].length *
			LotteryStorage["hnwfc"]["line3"].length *
			LotteryStorage["hnwfc"]["line4"].length *
			LotteryStorage["hnwfc"]["line5"].length;
	}else if(hnwfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,5);
	}else if(hnwfc_playMethod == 3){
		if (LotteryStorage["hnwfc"]["line1"].length >= 1 && LotteryStorage["hnwfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["hnwfc"]["line1"],LotteryStorage["hnwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnwfc_playMethod == 4){
		if (LotteryStorage["hnwfc"]["line1"].length >= 2 && LotteryStorage["hnwfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["hnwfc"]["line2"],LotteryStorage["hnwfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(hnwfc_playMethod == 5 || hnwfc_playMethod == 12){
		if (LotteryStorage["hnwfc"]["line1"].length >= 1 && LotteryStorage["hnwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["hnwfc"]["line1"],LotteryStorage["hnwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnwfc_playMethod == 6 || hnwfc_playMethod == 7 || hnwfc_playMethod == 14){
		if (LotteryStorage["hnwfc"]["line1"].length >= 1 && LotteryStorage["hnwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["hnwfc"]["line1"],LotteryStorage["hnwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnwfc_playMethod == 9){
		notes = LotteryStorage["hnwfc"]["line1"].length *
			LotteryStorage["hnwfc"]["line2"].length *
			LotteryStorage["hnwfc"]["line3"].length *
			LotteryStorage["hnwfc"]["line4"].length;
	}else if(hnwfc_playMethod == 18 || hnwfc_playMethod == 29 || hnwfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["hnwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(hnwfc_playMethod == 22 || hnwfc_playMethod == 33 || hnwfc_playMethod == 44 ){
		notes = 54;
	}else if(hnwfc_playMethod == 54 || hnwfc_playMethod == 61){
		notes = 9;
	}else if(hnwfc_playMethod == 51 || hnwfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["hnwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(hnwfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,4);
	}else if(hnwfc_playMethod == 13|| hnwfc_playMethod == 64 || hnwfc_playMethod == 66 || hnwfc_playMethod == 68 || hnwfc_playMethod == 70 || hnwfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,2);
	}else if(hnwfc_playMethod == 37 || hnwfc_playMethod == 26 || hnwfc_playMethod == 15 || hnwfc_playMethod == 75 || hnwfc_playMethod == 77){
		notes = LotteryStorage["hnwfc"]["line1"].length *
			LotteryStorage["hnwfc"]["line2"].length *
			LotteryStorage["hnwfc"]["line3"].length ;
	}else if(hnwfc_playMethod == 39 || hnwfc_playMethod == 28 || hnwfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hnwfc"]["line1"][i]);
		};
	}else if(hnwfc_playMethod == 41 || hnwfc_playMethod == 30 || hnwfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["hnwfc"]["line1"].length,2);
	}else if(hnwfc_playMethod == 42 || hnwfc_playMethod == 31 || hnwfc_playMethod == 20 || hnwfc_playMethod == 68 || hnwfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,3);
	}else if(hnwfc_playMethod == 43 || hnwfc_playMethod == 32 || hnwfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hnwfc"]["line1"][i]);
		};
	}else if(hnwfc_playMethod == 48 || hnwfc_playMethod == 55 || hnwfc_playMethod == 74 || hnwfc_playMethod == 76){
		notes = LotteryStorage["hnwfc"]["line1"].length *
			LotteryStorage["hnwfc"]["line2"].length ;
	}else if(hnwfc_playMethod == 50 || hnwfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hnwfc"]["line1"][i]);
		};
	}else if(hnwfc_playMethod == 52 || hnwfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,2);
	}else if(hnwfc_playMethod == 53 || hnwfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hnwfc"]["line1"][i]);
		};
	}else if(hnwfc_playMethod == 62){
		notes = LotteryStorage["hnwfc"]["line1"].length +
			LotteryStorage["hnwfc"]["line2"].length +
			LotteryStorage["hnwfc"]["line3"].length +
			LotteryStorage["hnwfc"]["line4"].length +
			LotteryStorage["hnwfc"]["line5"].length;
	}else if(hnwfc_playType == 13 || hnwfc_playType == 14 || hnwfc_playType == 16 || hnwfc_playMethod == 8 || hnwfc_playMethod == 71
		|| hnwfc_playMethod == 24 || hnwfc_playMethod == 25 || hnwfc_playMethod == 35 || hnwfc_playMethod == 36 || hnwfc_playMethod == 46
		|| hnwfc_playMethod == 47 || hnwfc_playMethod == 63 || hnwfc_playMethod == 65 || hnwfc_playMethod == 67 || hnwfc_playMethod == 69 ){
		notes = LotteryStorage["hnwfc"]["line1"].length ;
	}else if(hnwfc_playMethod == 78){
		notes = LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line2"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line3"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line4"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line3"].length +
			LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line4"].length +
			LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line4"].length +
			LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line4"].length * LotteryStorage["hnwfc"]["line5"].length;
	}else if (hnwfc_playMethod == 80) {
		if ($("#hnwfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hnwfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,2);
		}
	}else if (hnwfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,2) * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,2);
	}else if (hnwfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hnwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,2);
	}else if (hnwfc_playMethod == 84) {
		notes = LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line3"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line4"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line4"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line4"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line4"].length +
			LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line4"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line4"].length * LotteryStorage["hnwfc"]["line5"].length ;
	}else if (hnwfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hnwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,3);
	}else if (hnwfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["hnwfc"]["line1"].length,2) * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,3);
	}else if (hnwfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,3) * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,3);
	}else if (hnwfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["hnwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hnwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,3);
	}else if (hnwfc_playMethod == 93) {
		notes = LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line4"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line4"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line1"].length * LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line4"].length * LotteryStorage["hnwfc"]["line5"].length +
			LotteryStorage["hnwfc"]["line2"].length * LotteryStorage["hnwfc"]["line3"].length * LotteryStorage["hnwfc"]["line4"].length * LotteryStorage["hnwfc"]["line5"].length;
	}else if (hnwfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,4);
	}else if (hnwfc_playMethod == 96) {
		if (LotteryStorage["hnwfc"]["line1"].length >= 1 && LotteryStorage["hnwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["hnwfc"]["line1"],LotteryStorage["hnwfc"]["line2"])
				* mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (hnwfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["hnwfc"]["line1"].length,2) * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,4);
	}else if (hnwfc_playMethod == 98) {
		if (LotteryStorage["hnwfc"]["line1"].length >= 1 && LotteryStorage["hnwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["hnwfc"]["line1"],LotteryStorage["hnwfc"]["line2"]) * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = hnwfcValidData($("#hnwfc_single").val());
	}

	if(hnwfc_sntuo == 3 || hnwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","hnwfc"),LotteryInfo.getMethodId("ssc",hnwfc_playMethod))){
	}else{
		if(parseInt($('#hnwfc_modeId').val()) == 8){
			$("#hnwfc_random").hide();
		}else{
			$("#hnwfc_random").show();
		}
	}

	//验证是否为空
	if( $("#hnwfc_beiNum").val() =="" || parseInt($("#hnwfc_beiNum").val()) == 0){
		$("#hnwfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#hnwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#hnwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#hnwfc_zhushu').text(notes);
		if($("#hnwfc_modeId").val() == "8"){
			$('#hnwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnwfc_beiNum").val()),0.002));
		}else if ($("#hnwfc_modeId").val() == "2"){
			$('#hnwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnwfc_beiNum").val()),0.2));
		}else if ($("#hnwfc_modeId").val() == "1"){
			$('#hnwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnwfc_beiNum").val()),0.02));
		}else{
			$('#hnwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnwfc_beiNum").val()),2));
		}
	} else {
		$('#hnwfc_zhushu').text(0);
		$('#hnwfc_money').text(0);
	}
	hnwfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('hnwfc',hnwfc_playMethod);
}

/**
 * [hnwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hnwfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#hnwfc_queding").bind('click', function(event) {
		hnwfc_rebate = $("#hnwfc_fandian option:last").val();
		if(parseInt($('#hnwfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hnwfc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#hnwfc_modeId').val()) == 8){
			if (Number($('#hnwfc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('hnwfc',hnwfc_playMethod);

		submitParams.lotteryType = "hnwfc";
		var play = LotteryInfo.getPlayName("ssc",hnwfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",hnwfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = hnwfc_playType;
		submitParams.playMethodIndex = hnwfc_playMethod;
		var selectedBalls = [];
		if(hnwfc_playMethod == 0 || hnwfc_playMethod == 3 || hnwfc_playMethod == 4
			|| hnwfc_playMethod == 5 || hnwfc_playMethod == 6 || hnwfc_playMethod == 7
			|| hnwfc_playMethod == 9 || hnwfc_playMethod == 12 || hnwfc_playMethod == 14
			|| hnwfc_playMethod == 37 || hnwfc_playMethod == 26 || hnwfc_playMethod == 15
			|| hnwfc_playMethod == 48 || hnwfc_playMethod == 55 || hnwfc_playMethod == 74 || hnwfc_playType == 9){
			$("#hnwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(hnwfc_playMethod == 2 || hnwfc_playMethod == 8 || hnwfc_playMethod == 11 || hnwfc_playMethod == 13 || hnwfc_playMethod == 24
			|| hnwfc_playMethod == 39 || hnwfc_playMethod == 28 || hnwfc_playMethod == 17 || hnwfc_playMethod == 18 || hnwfc_playMethod == 25
			|| hnwfc_playMethod == 22 || hnwfc_playMethod == 33 || hnwfc_playMethod == 44 || hnwfc_playMethod == 54 || hnwfc_playMethod == 61
			|| hnwfc_playMethod == 41 || hnwfc_playMethod == 42 || hnwfc_playMethod == 43 || hnwfc_playMethod == 29 || hnwfc_playMethod == 35
			|| hnwfc_playMethod == 30 || hnwfc_playMethod == 31 || hnwfc_playMethod == 32 || hnwfc_playMethod == 40 || hnwfc_playMethod == 36
			|| hnwfc_playMethod == 19 || hnwfc_playMethod == 20 || hnwfc_playMethod == 21 || hnwfc_playMethod == 46 || hnwfc_playMethod == 47
			|| hnwfc_playMethod == 50 || hnwfc_playMethod == 57 || hnwfc_playType == 8 || hnwfc_playMethod == 51 || hnwfc_playMethod == 58
			|| hnwfc_playMethod == 52 || hnwfc_playMethod == 53|| hnwfc_playMethod == 59 || hnwfc_playMethod == 60 || hnwfc_playType == 13 || hnwfc_playType == 14|| hnwfc_playType == 16){
			$("#hnwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(hnwfc_playType == 7 || hnwfc_playMethod == 78 || hnwfc_playMethod == 84 || hnwfc_playMethod == 93){
			$("#hnwfc_ballView div.ballView").each(function(){
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
		}else if(hnwfc_playMethod == 80 || hnwfc_playMethod == 81 || hnwfc_playMethod == 83
			|| hnwfc_playMethod == 86 || hnwfc_playMethod == 87 || hnwfc_playMethod == 89
			|| hnwfc_playMethod == 92 || hnwfc_playMethod == 95 || hnwfc_playMethod == 97){
			$("#hnwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#hnwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#hnwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#hnwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#hnwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#hnwfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (hnwfc_playMethod == 96 || hnwfc_playMethod == 98) {
			$("#hnwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#hnwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#hnwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#hnwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#hnwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#hnwfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			hnwfcValidateData("submit");
			var array = handleSingleStr($("#hnwfc_single").val());
			if(hnwfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(hnwfc_playMethod == 10 || hnwfc_playMethod == 38 || hnwfc_playMethod == 27
				|| hnwfc_playMethod == 16 || hnwfc_playMethod == 49 || hnwfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(hnwfc_playMethod == 45 || hnwfc_playMethod == 34 || hnwfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(hnwfc_playMethod == 79 || hnwfc_playMethod == 82 || hnwfc_playMethod == 85 || hnwfc_playMethod == 88 ||
				hnwfc_playMethod == 89 || hnwfc_playMethod == 90 || hnwfc_playMethod == 91 || hnwfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#hnwfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#hnwfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#hnwfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#hnwfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#hnwfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#hnwfc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#hnwfc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#hnwfc_fandian").val());
		submitParams.notes = $('#hnwfc_zhushu').html();
		submitParams.sntuo = hnwfc_sntuo;
		submitParams.multiple = $('#hnwfc_beiNum').val();  //requirement
		submitParams.rebates = $('#hnwfc_fandian').val();  //requirement
		submitParams.playMode = $('#hnwfc_modeId').val();  //requirement
		submitParams.money = $('#hnwfc_money').html();  //requirement
		submitParams.award = $('#hnwfc_minAward').html();  //奖金
		submitParams.maxAward = $('#hnwfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#hnwfc_ballView").empty();
		hnwfc_qingkongAll();
	});
}

/**
 * [hnwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hnwfc_randomOne(){
	hnwfc_qingkongAll();
	if(hnwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["hnwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["hnwfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["hnwfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line2"], function(k, v){
			$("#" + "hnwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line3"], function(k, v){
			$("#" + "hnwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line4"], function(k, v){
			$("#" + "hnwfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line5"], function(k, v){
			$("#" + "hnwfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["hnwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["hnwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["hnwfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line2"], function(k, v){
			$("#" + "hnwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line3"], function(k, v){
			$("#" + "hnwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line4"], function(k, v){
			$("#" + "hnwfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(hnwfc_playMethod == 37 || hnwfc_playMethod == 26 || hnwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["hnwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnwfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line2"], function(k, v){
			$("#" + "hnwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line3"], function(k, v){
			$("#" + "hnwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 41 || hnwfc_playMethod == 30 || hnwfc_playMethod == 19 || hnwfc_playMethod == 68
		|| hnwfc_playMethod == 52 || hnwfc_playMethod == 64 || hnwfc_playMethod == 66
		|| hnwfc_playMethod == 59 || hnwfc_playMethod == 70 || hnwfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["hnwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 42 || hnwfc_playMethod == 31 || hnwfc_playMethod == 20 || hnwfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["hnwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 39 || hnwfc_playMethod == 28 || hnwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["hnwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 43 || hnwfc_playMethod == 32 || hnwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["hnwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 48 || hnwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["hnwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnwfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line2"], function(k, v){
			$("#" + "hnwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 25 || hnwfc_playMethod == 36 || hnwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["hnwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 50 || hnwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["hnwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 53 || hnwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["hnwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["hnwfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["hnwfc"]["line"+line], function(k, v){
			$("#" + "hnwfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 63 || hnwfc_playMethod == 67 || hnwfc_playMethod == 69 || hnwfc_playMethod == 71 || hnwfc_playType == 13
		|| hnwfc_playMethod == 65 || hnwfc_playMethod == 18 || hnwfc_playMethod == 29 || hnwfc_playMethod == 40 || hnwfc_playMethod == 22
		|| hnwfc_playMethod == 33 || hnwfc_playMethod == 44 || hnwfc_playMethod == 54 || hnwfc_playMethod == 61
		|| hnwfc_playMethod == 24 || hnwfc_playMethod == 35 || hnwfc_playMethod == 46 || hnwfc_playMethod == 51 || hnwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["hnwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 74 || hnwfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["hnwfc"]["line1"].push(array[0]+"");
		LotteryStorage["hnwfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line2"], function(k, v){
			$("#" + "hnwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 75 || hnwfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["hnwfc"]["line1"].push(array[0]+"");
		LotteryStorage["hnwfc"]["line2"].push(array[1]+"");
		LotteryStorage["hnwfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line2"], function(k, v){
			$("#" + "hnwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line3"], function(k, v){
			$("#" + "hnwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["hnwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnwfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["hnwfc"]["line"+lines[0]], function(k, v){
			$("#" + "hnwfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line"+lines[1]], function(k, v){
			$("#" + "hnwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["hnwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["hnwfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["hnwfc"]["line"+lines[0]], function(k, v){
			$("#" + "hnwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line"+lines[1]], function(k, v){
			$("#" + "hnwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line"+lines[0]], function(k, v){
			$("#" + "hnwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["hnwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["hnwfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["hnwfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["hnwfc"]["line"+lines[0]], function(k, v){
			$("#" + "hnwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line"+lines[1]], function(k, v){
			$("#" + "hnwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line"+lines[2]], function(k, v){
			$("#" + "hnwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnwfc"]["line"+lines[3]], function(k, v){
			$("#" + "hnwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(hnwfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["hnwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnwfc"]["line1"], function(k, v){
			$("#" + "hnwfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	hnwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hnwfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(hnwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(hnwfc_playMethod == 18 || hnwfc_playMethod == 29 || hnwfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(hnwfc_playMethod == 22 || hnwfc_playMethod == 33 || hnwfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(hnwfc_playMethod == 54 || hnwfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(hnwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnwfc_playMethod == 37 || hnwfc_playMethod == 26 || hnwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnwfc_playMethod == 39 || hnwfc_playMethod == 28 || hnwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(hnwfc_playMethod == 41 || hnwfc_playMethod == 30 || hnwfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(hnwfc_playMethod == 52 || hnwfc_playMethod == 59 || hnwfc_playMethod == 64 || hnwfc_playMethod == 66 || hnwfc_playMethod == 68
		||hnwfc_playMethod == 70 || hnwfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hnwfc_playMethod == 42 || hnwfc_playMethod == 31 || hnwfc_playMethod == 20 || hnwfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hnwfc_playMethod == 43 || hnwfc_playMethod == 32 || hnwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(hnwfc_playMethod == 48 || hnwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnwfc_playMethod == 50 || hnwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(hnwfc_playMethod == 53 || hnwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(hnwfc_playMethod == 62){
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
	}else if(hnwfc_playMethod == 63 || hnwfc_playMethod == 65 || hnwfc_playMethod == 67 || hnwfc_playMethod == 69 || hnwfc_playMethod == 71
		|| hnwfc_playMethod == 24 || hnwfc_playMethod == 35 || hnwfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(hnwfc_playMethod == 25 || hnwfc_playMethod == 36 || hnwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(hnwfc_playMethod == 51 || hnwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(hnwfc_playMethod == 74 || hnwfc_playMethod == 76){
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
	}else if(hnwfc_playMethod == 75 || hnwfc_playMethod == 77){
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
	}else if(hnwfc_playMethod == 78){
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
	}else if(hnwfc_playMethod == 84){
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
	}else if(hnwfc_playMethod == 93){
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
	obj.sntuo = hnwfc_sntuo;
	obj.multiple = 1;
	obj.rebates = hnwfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('hnwfc',hnwfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#hnwfc_minAward').html();     //奖金
	obj.maxAward = $('#hnwfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [hnwfcValidateData 单式数据验证]
 */
function hnwfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#hnwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	hnwfcValidData(textStr,type);
}

function hnwfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(hnwfc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 38 || hnwfc_playMethod == 27 || hnwfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 45 || hnwfc_playMethod == 34 || hnwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 49 || hnwfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,2);
        hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,2);
        hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,3);
        hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,3);
        hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,3);
        hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,3);
        hnwfcShowFooter(true,notes);
    }else if(hnwfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnwfc_tab .button.red").size() ,4);
        hnwfcShowFooter(true,notes);
    }

	$('#hnwfc_delRepeat').off('click');
	$('#hnwfc_delRepeat').on('click',function () {
		content.str = $('#hnwfc_single').val() ? $('#hnwfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		hnwfcShowFooter(true,notes);
		$("#hnwfc_single").val(array.join(" "));
	});

    $("#hnwfc_single").val(array.join(" "));
    return notes;
}

function hnwfcShowFooter(isValid,notes){
	$('#hnwfc_zhushu').text(notes);
	if($("#hnwfc_modeId").val() == "8"){
		$('#hnwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnwfc_beiNum").val()),0.002));
	}else if ($("#hnwfc_modeId").val() == "2"){
		$('#hnwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnwfc_beiNum").val()),0.2));
	}else if ($("#hnwfc_modeId").val() == "1"){
		$('#hnwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnwfc_beiNum").val()),0.02));
	}else{
		$('#hnwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnwfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	hnwfc_initFooterButton();
	calcAwardWin('hnwfc',hnwfc_playMethod);  //计算奖金和盈利
}