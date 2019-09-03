var txwfc_playType = 2;
var txwfc_playMethod = 15;
var txwfc_sntuo = 0;
var txwfc_rebate;
var txwfcScroll;

//进入这个页面时调用
function txwfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("txwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("txwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function txwfcPageUnloadedPanel(){
	$("#txwfc_queding").off('click');
	$("#txwfcPage_back").off('click');
	$("#txwfc_ballView").empty();
	$("#txwfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="txwfcPlaySelect"></select>');
	$("#txwfcSelect").append($select);
}

//入口函数
function txwfc_init(){
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
	$("#txwfc_title").html(LotteryInfo.getLotteryNameByTag("txwfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == txwfc_playType && j == txwfc_playMethod){
					$play.append('<option value="txwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="txwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(txwfc_playMethod,onShowArray)>-1 ){
						txwfc_playType = i;
						txwfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#txwfcPlaySelect").append($play);
		}
	}
	
	if($("#txwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("txwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:txwfcChangeItem
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

	GetLotteryInfo("txwfc",function (){
		txwfcChangeItem("txwfc"+txwfc_playMethod);
	});

	//添加滑动条
	if(!txwfcScroll){
		txwfcScroll = new IScroll('#txwfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("txwfc",LotteryInfo.getLotteryIdByTag("txwfc"));

	//获取上一期开奖
	queryLastPrize("txwfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('txwfc');

	//机选选号
	$("#txwfc_random").on('click', function(event) {
		txwfc_randomOne();
	});

	//返回
	$("#txwfcPage_back").on('click', function(event) {
//		txwfc_playType = 2;
//		txwfc_playMethod = 15;
		$("#txwfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		txwfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#txwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",txwfc_playMethod));
	//玩法说明
	$("#txwfc_paly_shuoming").off('click');
	$("#txwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#txwfc_shuoming").text());
	});

	qingKong("txwfc");//清空
	txwfc_submitData();
}

function txwfcResetPlayType(){
	txwfc_playType = 2;
	txwfc_playMethod = 15;
}

function txwfcChangeItem(val) {
	txwfc_qingkongAll();
	var temp = val.substring("txwfc".length,val.length);
	if(val == "txwfc0"){
		//直选复式
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 0;
		txwfc_playMethod = 0;
		createFiveLineLayout("txwfc", function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc1"){
		//直选单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 0;
		txwfc_playMethod = 1;
		$("#txwfc_ballView").empty();
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc2"){
		//组选120
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 0;
		txwfc_playMethod = 2;
		createOneLineLayout("txwfc","至少选择5个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc3"){
		//组选60
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 0;
		txwfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc4"){
		//组选30
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 0;
		txwfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc5"){
		//组选20
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 0;
		txwfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc6"){
		//组选10
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 0;
		txwfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc7"){
		//组选5
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 0;
		txwfc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc8"){
		//总和大小单双
		$("#txwfc_random").show();
		var num = ["大","小","单","双"];
		txwfc_sntuo = 0;
		txwfc_playType = 0;
		txwfc_playMethod = 8;
		createNonNumLayout("txwfc",txwfc_playMethod,num,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc9"){
		//直选复式
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 1;
		txwfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("txwfc",tips, function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc10"){
		//直选单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 1;
		txwfc_playMethod = 10;
		$("#txwfc_ballView").empty();
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc11"){
		//组选24
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 1;
		txwfc_playMethod = 11;
		createOneLineLayout("txwfc","至少选择4个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc12"){
		//组选12
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 1;
		txwfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc13"){
		//组选6
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 1;
		txwfc_playMethod = 13;
		createOneLineLayout("txwfc","二重号:至少选择2个号码",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc14"){
		//组选4
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 1;
		txwfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc15"){
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc16"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 2;
		txwfc_playMethod = 16;
		$("#txwfc_ballView").empty();
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc17"){
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 17;
		createSumLayout("txwfc",0,27,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc18"){
		//直选跨度
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 18;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc19"){
		//后三组三
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 19;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc20"){
		//后三组六
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 20;
		createOneLineLayout("txwfc","至少选择3个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc21"){
		//后三和值
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 21;
		createSumLayout("txwfc",1,26,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc22"){
		//后三组选包胆
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 22;
		txwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txwfc",array,["请选择一个号码"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc23"){
		//后三混合组选
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 2;
		txwfc_playMethod = 23;
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc24"){
		//和值尾数
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 24;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc25"){
		//特殊号
		$("#txwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txwfc_sntuo = 0;
		txwfc_playType = 2;
		txwfc_playMethod = 25;
		createNonNumLayout("txwfc",txwfc_playMethod,num,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc26"){
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc27"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 3;
		txwfc_playMethod = 27;
		$("#txwfc_ballView").empty();
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc28"){
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 28;
		createSumLayout("txwfc",0,27,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc29"){
		//直选跨度
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 29;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc30"){
		//中三组三
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 30;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc31"){
		//中三组六
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 31;
		createOneLineLayout("txwfc","至少选择3个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc32"){
		//中三和值
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 32;
		createSumLayout("txwfc",1,26,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc33"){
		//中三组选包胆
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 33;
		txwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txwfc",array,["请选择一个号码"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc34"){
		//中三混合组选
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 3;
		txwfc_playMethod = 34;
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc35"){
		//和值尾数
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 35;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc36"){
		//特殊号
		$("#txwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txwfc_sntuo = 0;
		txwfc_playType = 3;
		txwfc_playMethod = 36;
		createNonNumLayout("txwfc",txwfc_playMethod,num,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc37"){
		//直选复式
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc38"){
		//直选单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 4;
		txwfc_playMethod = 38;
		$("#txwfc_ballView").empty();
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc39"){
		//和值
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 39;
		createSumLayout("txwfc",0,27,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc40"){
		//直选跨度
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 40;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc41"){
		//前三组三
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 41;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc42"){
		//前三组六
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 42;
		createOneLineLayout("txwfc","至少选择3个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc43"){
		//前三和值
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 43;
		createSumLayout("txwfc",1,26,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc44"){
		//前三组选包胆
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 44;
		txwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txwfc",array,["请选择一个号码"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc45"){
		//前三混合组选
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 4;
		txwfc_playMethod = 45;
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc46"){
		//和值尾数
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 46;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc47"){
		//特殊号
		$("#txwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txwfc_sntuo = 0;
		txwfc_playType = 4;
		txwfc_playMethod = 47;
		createNonNumLayout("txwfc",txwfc_playMethod,num,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc48"){
		//后二复式
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 5;
		txwfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc49"){
		//后二单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 5;
		txwfc_playMethod = 49;
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc50"){
		//后二和值
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 5;
		txwfc_playMethod = 50;
		createSumLayout("txwfc",0,18,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc51"){
		//直选跨度
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 5;
		txwfc_playMethod = 51;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc52"){
		//后二组选
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 5;
		txwfc_playMethod = 52;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc53"){
		//后二和值
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 5;
		txwfc_playMethod = 53;
		createSumLayout("txwfc",1,17,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc54"){
		//后二组选包胆
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 5;
		txwfc_playMethod = 54;
		txwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txwfc",array,["请选择一个号码"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc55"){
		//前二复式
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 6;
		txwfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc56"){
		//前二单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 6;
		txwfc_playMethod = 56;
		txwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
	}else if(val == "txwfc57"){
		//前二和值
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 6;
		txwfc_playMethod = 57;
		createSumLayout("txwfc",0,18,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc58"){
		//直选跨度
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 6;
		txwfc_playMethod = 58;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc59"){
		//前二组选
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 6;
		txwfc_playMethod = 59;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc60"){
		//前二和值
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 6;
		txwfc_playMethod = 60;
		createSumLayout("txwfc",1,17,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc61"){
		//前二组选包胆
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 6;
		txwfc_playMethod = 61;
		txwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txwfc",array,["请选择一个号码"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc62"){
		//定位复式
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 7;
		txwfc_playMethod = 62;
		createFiveLineLayout("txwfc", function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc63"){
		//后三一码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 63;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc64"){
		//后三二码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 64;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc65"){
		//前三一码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 65;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc66"){
		//前三二码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 66;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc67"){
		//后四一码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 67;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc68"){
		//后四二码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 68;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc69"){
		//前四一码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 69;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc70"){
		//前四二码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 70;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc71"){
		//五星一码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 71;
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc72"){
		//五星二码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 72;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc73"){
		//五星三码
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 8;
		txwfc_playMethod = 73;
		createOneLineLayout("txwfc","至少选择3个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc74"){
		//后二大小单双
		txwfc_qingkongAll();
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 9;
		txwfc_playMethod = 74;
		createTextBallTwoLayout("txwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc75"){
		//后三大小单双
		txwfc_qingkongAll();
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 9;
		txwfc_playMethod = 75;
		createTextBallThreeLayout("txwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc76"){
		//前二大小单双
		txwfc_qingkongAll();
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 9;
		txwfc_playMethod = 76;
		createTextBallTwoLayout("txwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc77"){
		//前三大小单双
		txwfc_qingkongAll();
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 9;
		txwfc_playMethod = 77;
		createTextBallThreeLayout("txwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc78"){
		//直选复式
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 10;
		txwfc_playMethod = 78;
		createFiveLineLayout("txwfc",function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc79"){
		//直选单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 10;
		txwfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
		createRenXuanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc80"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 10;
		txwfc_playMethod = 80;
		createSumLayout("txwfc",0,18,function(){
			txwfc_calcNotes();
		});
		createRenXuanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc81"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 10;
		txwfc_playMethod = 81;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		createRenXuanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc82"){
		//组选单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 10;
		txwfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
		createRenXuanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc83"){
		//组选和值
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 10;
		txwfc_playMethod = 83;
		createSumLayout("txwfc",1,17,function(){
			txwfc_calcNotes();
		});
		createRenXuanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc84"){
		//直选复式
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 11;
		txwfc_playMethod = 84;
		createFiveLineLayout("txwfc", function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc85"){
		//直选单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 11;
		txwfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
		createRenXuanSanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc86"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 11;
		txwfc_playMethod = 86;
		createSumLayout("txwfc",0,27,function(){
			txwfc_calcNotes();
		});
		createRenXuanSanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc87"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 11;
		txwfc_playMethod = 87;
		createOneLineLayout("txwfc","至少选择2个",0,9,false,function(){
			txwfc_calcNotes();
		});
		createRenXuanSanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc88"){
		//组选单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 11;
		txwfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
		createRenXuanSanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc89"){
		//组选和值
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 11;
		txwfc_playMethod = 89;
		createOneLineLayout("txwfc","至少选择3个",0,9,false,function(){
			txwfc_calcNotes();
		});
		createRenXuanSanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc90"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 11;
		txwfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
		createRenXuanSanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc91"){
		//混合组选
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 11;
		txwfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
		createRenXuanSanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc92"){
		//组选和值
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 11;
		txwfc_playMethod = 92;
		createSumLayout("txwfc",1,26,function(){
			txwfc_calcNotes();
		});
		createRenXuanSanLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc93"){
		$("#txwfc_random").show();
		txwfc_sntuo = 0;
		txwfc_playType = 12;
		txwfc_playMethod = 93;
		createFiveLineLayout("txwfc", function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc94"){
		//直选单式
		$("#txwfc_random").hide();
		txwfc_sntuo = 3;
		txwfc_playType = 12;
		txwfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txwfc",tips);
		createRenXuanSiLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc95"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 12;
		txwfc_playMethod = 95;
		createOneLineLayout("txwfc","至少选择4个",0,9,false,function(){
			txwfc_calcNotes();
		});
		createRenXuanSiLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc96"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 12;
		txwfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		createRenXuanSiLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc97"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 12;
		txwfc_playMethod = 97;
		$("#txwfc_ballView").empty();
		createOneLineLayout("txwfc","二重号:至少选择2个号码",0,9,false,function(){
			txwfc_calcNotes();
		});
		createRenXuanSiLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc98"){
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 12;
		txwfc_playMethod = 98;
		$("#txwfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txwfc",tips,0,9,false,function(){
			txwfc_calcNotes();
		});
		createRenXuanSiLayout("txwfc",txwfc_playMethod,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc99"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 13;
		txwfc_playMethod = 99;
		$("#txwfc_ballView").empty();
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc100"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 13;
		txwfc_playMethod = 100;
		$("#txwfc_ballView").empty();
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc101"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 13;
		txwfc_playMethod = 101;
		$("#txwfc_ballView").empty();
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc102"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 13;
		txwfc_playMethod = 102;
		$("#txwfc_ballView").empty();
		createOneLineLayout("txwfc","至少选择1个",0,9,false,function(){
			txwfc_calcNotes();
		});
		txwfc_qingkongAll();
	}else if(val == "txwfc103"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 103;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc104"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 104;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc105"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 105;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc106"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 106;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc107"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 107;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc108"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 108;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc109"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 109;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc110"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 110;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc111"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 111;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}else if(val == "txwfc112"){
		txwfc_qingkongAll();
		$("#txwfc_random").hide();
		txwfc_sntuo = 0;
		txwfc_playType = 14;
		txwfc_playMethod = 112;
		createTextBallOneLayout("txwfc",["龙","虎","和"],["至少选择一个"],function(){
			txwfc_calcNotes();
		});
	}

	if(txwfcScroll){
		txwfcScroll.refresh();
		txwfcScroll.scrollTo(0,0,1);
	}
	
	$("#txwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("txwfc",temp);
	hideRandomWhenLi("txwfc",txwfc_sntuo,txwfc_playMethod);
	txwfc_calcNotes();
}
/**
 * [txwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function txwfc_initFooterButton(){
	if(txwfc_playMethod == 0 || txwfc_playMethod == 62 || txwfc_playMethod == 78
		|| txwfc_playMethod == 84 || txwfc_playMethod == 93 || txwfc_playType == 7){
		if(LotteryStorage["txwfc"]["line1"].length > 0 || LotteryStorage["txwfc"]["line2"].length > 0 ||
			LotteryStorage["txwfc"]["line3"].length > 0 || LotteryStorage["txwfc"]["line4"].length > 0 ||
			LotteryStorage["txwfc"]["line5"].length > 0){
			$("#txwfc_qingkong").css("opacity",1.0);
		}else{
			$("#txwfc_qingkong").css("opacity",0.4);
		}
	}else if(txwfc_playMethod == 9){
		if(LotteryStorage["txwfc"]["line1"].length > 0 || LotteryStorage["txwfc"]["line2"].length > 0 ||
			LotteryStorage["txwfc"]["line3"].length > 0 || LotteryStorage["txwfc"]["line4"].length > 0 ){
			$("#txwfc_qingkong").css("opacity",1.0);
		}else{
			$("#txwfc_qingkong").css("opacity",0.4);
		}
	}else if(txwfc_playMethod == 37 || txwfc_playMethod == 4 || txwfc_playMethod == 6
		|| txwfc_playMethod == 26 || txwfc_playMethod == 15 || txwfc_playMethod == 75 || txwfc_playMethod == 77){
		if(LotteryStorage["txwfc"]["line1"].length > 0 || LotteryStorage["txwfc"]["line2"].length > 0
			|| LotteryStorage["txwfc"]["line3"].length > 0){
			$("#txwfc_qingkong").css("opacity",1.0);
		}else{
			$("#txwfc_qingkong").css("opacity",0.4);
		}
	}else if(txwfc_playMethod == 3 || txwfc_playMethod == 4 || txwfc_playMethod == 5
		|| txwfc_playMethod == 6 || txwfc_playMethod == 7 || txwfc_playMethod == 12
		|| txwfc_playMethod == 14 || txwfc_playMethod == 48 || txwfc_playMethod == 55
		|| txwfc_playMethod == 74 || txwfc_playMethod == 76 || txwfc_playMethod == 96 || txwfc_playMethod == 98){
		if(LotteryStorage["txwfc"]["line1"].length > 0 || LotteryStorage["txwfc"]["line2"].length > 0){
			$("#txwfc_qingkong").css("opacity",1.0);
		}else{
			$("#txwfc_qingkong").css("opacity",0.4);
		}
	}else if(txwfc_playMethod == 2 || txwfc_playMethod == 8 || txwfc_playMethod == 11 || txwfc_playMethod == 13 || txwfc_playMethod == 39
		|| txwfc_playMethod == 28 || txwfc_playMethod == 17 || txwfc_playMethod == 18 || txwfc_playMethod == 24 || txwfc_playMethod == 41
		|| txwfc_playMethod == 25 || txwfc_playMethod == 29 || txwfc_playMethod == 42 || txwfc_playMethod == 43 || txwfc_playMethod == 30
		|| txwfc_playMethod == 35 || txwfc_playMethod == 36 || txwfc_playMethod == 31 || txwfc_playMethod == 32 || txwfc_playMethod == 19
		|| txwfc_playMethod == 40 || txwfc_playMethod == 46 || txwfc_playMethod == 20 || txwfc_playMethod == 21 || txwfc_playMethod == 50
		|| txwfc_playMethod == 47 || txwfc_playMethod == 51 || txwfc_playMethod == 52 || txwfc_playMethod == 53 || txwfc_playMethod == 57 || txwfc_playMethod == 63
		|| txwfc_playMethod == 58 || txwfc_playMethod == 59 || txwfc_playMethod == 60 || txwfc_playMethod == 65 || txwfc_playMethod == 80 || txwfc_playMethod == 81 || txwfc_playType == 8
		|| txwfc_playMethod == 83 || txwfc_playMethod == 86 || txwfc_playMethod == 87 || txwfc_playMethod == 22 || txwfc_playMethod == 33 || txwfc_playMethod == 44
		|| txwfc_playMethod == 89 || txwfc_playMethod == 92 || txwfc_playMethod == 95 || txwfc_playMethod == 54 || txwfc_playMethod == 61
		|| txwfc_playMethod == 97 || txwfc_playType == 13  || txwfc_playType == 14){
		if(LotteryStorage["txwfc"]["line1"].length > 0){
			$("#txwfc_qingkong").css("opacity",1.0);
		}else{
			$("#txwfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#txwfc_qingkong").css("opacity",0);
	}

	if($("#txwfc_qingkong").css("opacity") == "0"){
		$("#txwfc_qingkong").css("display","none");
	}else{
		$("#txwfc_qingkong").css("display","block");
	}

	if($('#txwfc_zhushu').html() > 0){
		$("#txwfc_queding").css("opacity",1.0);
	}else{
		$("#txwfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  txwfc_qingkongAll(){
	$("#txwfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["txwfc"]["line1"] = [];
	LotteryStorage["txwfc"]["line2"] = [];
	LotteryStorage["txwfc"]["line3"] = [];
	LotteryStorage["txwfc"]["line4"] = [];
	LotteryStorage["txwfc"]["line5"] = [];

	localStorageUtils.removeParam("txwfc_line1");
	localStorageUtils.removeParam("txwfc_line2");
	localStorageUtils.removeParam("txwfc_line3");
	localStorageUtils.removeParam("txwfc_line4");
	localStorageUtils.removeParam("txwfc_line5");

	$('#txwfc_zhushu').text(0);
	$('#txwfc_money').text(0);
	clearAwardWin("txwfc");
	txwfc_initFooterButton();
}

/**
 * [txwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function txwfc_calcNotes(){
	$('#txwfc_modeId').blur();
	$('#txwfc_fandian').blur();
	
	var notes = 0;

	if(txwfc_playMethod == 0){
		notes = LotteryStorage["txwfc"]["line1"].length *
			LotteryStorage["txwfc"]["line2"].length *
			LotteryStorage["txwfc"]["line3"].length *
			LotteryStorage["txwfc"]["line4"].length *
			LotteryStorage["txwfc"]["line5"].length;
	}else if(txwfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,5);
	}else if(txwfc_playMethod == 3){
		if (LotteryStorage["txwfc"]["line1"].length >= 1 && LotteryStorage["txwfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["txwfc"]["line1"],LotteryStorage["txwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txwfc_playMethod == 4){
		if (LotteryStorage["txwfc"]["line1"].length >= 2 && LotteryStorage["txwfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["txwfc"]["line2"],LotteryStorage["txwfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(txwfc_playMethod == 5 || txwfc_playMethod == 12){
		if (LotteryStorage["txwfc"]["line1"].length >= 1 && LotteryStorage["txwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txwfc"]["line1"],LotteryStorage["txwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txwfc_playMethod == 6 || txwfc_playMethod == 7 || txwfc_playMethod == 14){
		if (LotteryStorage["txwfc"]["line1"].length >= 1 && LotteryStorage["txwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txwfc"]["line1"],LotteryStorage["txwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txwfc_playMethod == 9){
		notes = LotteryStorage["txwfc"]["line1"].length *
			LotteryStorage["txwfc"]["line2"].length *
			LotteryStorage["txwfc"]["line3"].length *
			LotteryStorage["txwfc"]["line4"].length;
	}else if(txwfc_playMethod == 18 || txwfc_playMethod == 29 || txwfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(txwfc_playMethod == 22 || txwfc_playMethod == 33 || txwfc_playMethod == 44 ){
		notes = 54;
	}else if(txwfc_playMethod == 54 || txwfc_playMethod == 61){
		notes = 9;
	}else if(txwfc_playMethod == 51 || txwfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(txwfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,4);
	}else if(txwfc_playMethod == 13|| txwfc_playMethod == 64 || txwfc_playMethod == 66 || txwfc_playMethod == 68 || txwfc_playMethod == 70 || txwfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,2);
	}else if(txwfc_playMethod == 37 || txwfc_playMethod == 26 || txwfc_playMethod == 15 || txwfc_playMethod == 75 || txwfc_playMethod == 77){
		notes = LotteryStorage["txwfc"]["line1"].length *
			LotteryStorage["txwfc"]["line2"].length *
			LotteryStorage["txwfc"]["line3"].length ;
	}else if(txwfc_playMethod == 39 || txwfc_playMethod == 28 || txwfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txwfc"]["line1"][i]);
		};
	}else if(txwfc_playMethod == 41 || txwfc_playMethod == 30 || txwfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["txwfc"]["line1"].length,2);
	}else if(txwfc_playMethod == 42 || txwfc_playMethod == 31 || txwfc_playMethod == 20 || txwfc_playMethod == 68 || txwfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,3);
	}else if(txwfc_playMethod == 43 || txwfc_playMethod == 32 || txwfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txwfc"]["line1"][i]);
		};
	}else if(txwfc_playMethod == 48 || txwfc_playMethod == 55 || txwfc_playMethod == 74 || txwfc_playMethod == 76){
		notes = LotteryStorage["txwfc"]["line1"].length *
			LotteryStorage["txwfc"]["line2"].length ;
	}else if(txwfc_playMethod == 50 || txwfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txwfc"]["line1"][i]);
		};
	}else if(txwfc_playMethod == 52 || txwfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,2);
	}else if(txwfc_playMethod == 53 || txwfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txwfc"]["line1"][i]);
		};
	}else if(txwfc_playMethod == 62){
		notes = LotteryStorage["txwfc"]["line1"].length +
			LotteryStorage["txwfc"]["line2"].length +
			LotteryStorage["txwfc"]["line3"].length +
			LotteryStorage["txwfc"]["line4"].length +
			LotteryStorage["txwfc"]["line5"].length;
	}else if(txwfc_playType == 13 || txwfc_playType == 14 || txwfc_playMethod == 8 || txwfc_playMethod == 71
		|| txwfc_playMethod == 24 || txwfc_playMethod == 25 || txwfc_playMethod == 35 || txwfc_playMethod == 36 || txwfc_playMethod == 46
		|| txwfc_playMethod == 47 || txwfc_playMethod == 63 || txwfc_playMethod == 65 || txwfc_playMethod == 67 || txwfc_playMethod == 69 ){
		notes = LotteryStorage["txwfc"]["line1"].length ;
	}else if(txwfc_playMethod == 78){
		notes = LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line2"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line3"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line4"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line3"].length +
			LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line4"].length +
			LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line4"].length +
			LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line4"].length * LotteryStorage["txwfc"]["line5"].length;
	}else if (txwfc_playMethod == 80) {
		if ($("#txwfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txwfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,2);
		}
	}else if (txwfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,2) * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,2);
	}else if (txwfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,2);
	}else if (txwfc_playMethod == 84) {
		notes = LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line3"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line4"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line4"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line4"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line4"].length +
			LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line4"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line4"].length * LotteryStorage["txwfc"]["line5"].length ;
	}else if (txwfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,3);
	}else if (txwfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["txwfc"]["line1"].length,2) * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,3);
	}else if (txwfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,3) * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,3);
	}else if (txwfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["txwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,3);
	}else if (txwfc_playMethod == 93) {
		notes = LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line4"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line4"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line1"].length * LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line4"].length * LotteryStorage["txwfc"]["line5"].length +
			LotteryStorage["txwfc"]["line2"].length * LotteryStorage["txwfc"]["line3"].length * LotteryStorage["txwfc"]["line4"].length * LotteryStorage["txwfc"]["line5"].length;
	}else if (txwfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,4);
	}else if (txwfc_playMethod == 96) {
		if (LotteryStorage["txwfc"]["line1"].length >= 1 && LotteryStorage["txwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txwfc"]["line1"],LotteryStorage["txwfc"]["line2"])
				* mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (txwfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["txwfc"]["line1"].length,2) * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,4);
	}else if (txwfc_playMethod == 98) {
		if (LotteryStorage["txwfc"]["line1"].length >= 1 && LotteryStorage["txwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txwfc"]["line1"],LotteryStorage["txwfc"]["line2"]) * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = txwfcValidData($("#txwfc_single").val());
	}

	if(txwfc_sntuo == 3 || txwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","txwfc"),LotteryInfo.getMethodId("ssc",txwfc_playMethod))){
	}else{
		if(parseInt($('#txwfc_modeId').val()) == 8){
			$("#txwfc_random").hide();
		}else{
			$("#txwfc_random").show();
		}
	}

	//验证是否为空
	if( $("#txwfc_beiNum").val() =="" || parseInt($("#txwfc_beiNum").val()) == 0){
		$("#txwfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#txwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#txwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#txwfc_zhushu').text(notes);
		if($("#txwfc_modeId").val() == "8"){
			$('#txwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txwfc_beiNum").val()),0.002));
		}else if ($("#txwfc_modeId").val() == "2"){
			$('#txwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txwfc_beiNum").val()),0.2));
		}else if ($("#txwfc_modeId").val() == "1"){
			$('#txwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txwfc_beiNum").val()),0.02));
		}else{
			$('#txwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txwfc_beiNum").val()),2));
		}
	} else {
		$('#txwfc_zhushu').text(0);
		$('#txwfc_money').text(0);
	}
	txwfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('txwfc',txwfc_playMethod);
}

/**
 * [txwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function txwfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#txwfc_queding").bind('click', function(event) {
		txwfc_rebate = $("#txwfc_fandian option:first").val();
		if(parseInt($('#txwfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		txwfc_calcNotes();

		//设置单笔最低投注额为1元
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		//提示单挑奖金
		getDanTiaoBonus('txwfc',txwfc_playMethod);

		submitParams.lotteryType = "txwfc";
		var play = LotteryInfo.getPlayName("ssc",txwfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",txwfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = txwfc_playType;
		submitParams.playMethodIndex = txwfc_playMethod;
		var selectedBalls = [];
		if(txwfc_playMethod == 0 || txwfc_playMethod == 3 || txwfc_playMethod == 4
			|| txwfc_playMethod == 5 || txwfc_playMethod == 6 || txwfc_playMethod == 7
			|| txwfc_playMethod == 9 || txwfc_playMethod == 12 || txwfc_playMethod == 14
			|| txwfc_playMethod == 37 || txwfc_playMethod == 26 || txwfc_playMethod == 15
			|| txwfc_playMethod == 48 || txwfc_playMethod == 55 || txwfc_playMethod == 74 || txwfc_playType == 9){
			$("#txwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(txwfc_playMethod == 2 || txwfc_playMethod == 8 || txwfc_playMethod == 11 || txwfc_playMethod == 13 || txwfc_playMethod == 24
			|| txwfc_playMethod == 39 || txwfc_playMethod == 28 || txwfc_playMethod == 17 || txwfc_playMethod == 18 || txwfc_playMethod == 25
			|| txwfc_playMethod == 22 || txwfc_playMethod == 33 || txwfc_playMethod == 44 || txwfc_playMethod == 54 || txwfc_playMethod == 61
			|| txwfc_playMethod == 41 || txwfc_playMethod == 42 || txwfc_playMethod == 43 || txwfc_playMethod == 29 || txwfc_playMethod == 35
			|| txwfc_playMethod == 30 || txwfc_playMethod == 31 || txwfc_playMethod == 32 || txwfc_playMethod == 40 || txwfc_playMethod == 36
			|| txwfc_playMethod == 19 || txwfc_playMethod == 20 || txwfc_playMethod == 21 || txwfc_playMethod == 46 || txwfc_playMethod == 47
			|| txwfc_playMethod == 50 || txwfc_playMethod == 57 || txwfc_playType == 8 || txwfc_playMethod == 51 || txwfc_playMethod == 58
			|| txwfc_playMethod == 52 || txwfc_playMethod == 53|| txwfc_playMethod == 59 || txwfc_playMethod == 60 || txwfc_playType == 13 || txwfc_playType == 14){
			$("#txwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(txwfc_playType == 7 || txwfc_playMethod == 78 || txwfc_playMethod == 84 || txwfc_playMethod == 93){
			$("#txwfc_ballView div.ballView").each(function(){
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
		}else if(txwfc_playMethod == 80 || txwfc_playMethod == 81 || txwfc_playMethod == 83
			|| txwfc_playMethod == 86 || txwfc_playMethod == 87 || txwfc_playMethod == 89
			|| txwfc_playMethod == 92 || txwfc_playMethod == 95 || txwfc_playMethod == 97){
			$("#txwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#txwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txwfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (txwfc_playMethod == 96 || txwfc_playMethod == 98) {
			$("#txwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#txwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txwfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			var array = handleSingleStr($("#txwfc_single").val());
			if(txwfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(txwfc_playMethod == 10 || txwfc_playMethod == 38 || txwfc_playMethod == 27
				|| txwfc_playMethod == 16 || txwfc_playMethod == 49 || txwfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txwfc_playMethod == 45 || txwfc_playMethod == 34 || txwfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txwfc_playMethod == 79 || txwfc_playMethod == 82 || txwfc_playMethod == 85 || txwfc_playMethod == 88 ||
				txwfc_playMethod == 89 || txwfc_playMethod == 90 || txwfc_playMethod == 91 || txwfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#txwfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#txwfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#txwfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#txwfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#txwfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#txwfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#txwfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#txwfc_fandian").val());
		submitParams.notes = $('#txwfc_zhushu').html();
		submitParams.sntuo = txwfc_sntuo;
		submitParams.multiple = $('#txwfc_beiNum').val();  //requirement
		submitParams.rebates = $('#txwfc_fandian').val();  //requirement
		submitParams.playMode = $('#txwfc_modeId').val();  //requirement
		submitParams.money = $('#txwfc_money').html();  //requirement
		submitParams.award = $('#txwfc_minAward').html();  //奖金
		submitParams.maxAward = $('#txwfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#txwfc_ballView").empty();
		txwfc_qingkongAll();
	});
}

/**
 * [txwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function txwfc_randomOne(){
	txwfc_qingkongAll();
	if(txwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["txwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txwfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["txwfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line2"], function(k, v){
			$("#" + "txwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line3"], function(k, v){
			$("#" + "txwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line4"], function(k, v){
			$("#" + "txwfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line5"], function(k, v){
			$("#" + "txwfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["txwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["txwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txwfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line2"], function(k, v){
			$("#" + "txwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line3"], function(k, v){
			$("#" + "txwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line4"], function(k, v){
			$("#" + "txwfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(txwfc_playMethod == 37 || txwfc_playMethod == 26 || txwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["txwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txwfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line2"], function(k, v){
			$("#" + "txwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line3"], function(k, v){
			$("#" + "txwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 41 || txwfc_playMethod == 30 || txwfc_playMethod == 19 || txwfc_playMethod == 68
		|| txwfc_playMethod == 52 || txwfc_playMethod == 64 || txwfc_playMethod == 66
		|| txwfc_playMethod == 59 || txwfc_playMethod == 70 || txwfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 42 || txwfc_playMethod == 31 || txwfc_playMethod == 20 || txwfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 39 || txwfc_playMethod == 28 || txwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["txwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 43 || txwfc_playMethod == 32 || txwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["txwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 48 || txwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["txwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txwfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line2"], function(k, v){
			$("#" + "txwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 25 || txwfc_playMethod == 36 || txwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["txwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 50 || txwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["txwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 53 || txwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["txwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txwfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["txwfc"]["line"+line], function(k, v){
			$("#" + "txwfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 63 || txwfc_playMethod == 67 || txwfc_playMethod == 69 || txwfc_playMethod == 71 || txwfc_playType == 13
		|| txwfc_playMethod == 65 || txwfc_playMethod == 18 || txwfc_playMethod == 29 || txwfc_playMethod == 40 || txwfc_playMethod == 22
		|| txwfc_playMethod == 33 || txwfc_playMethod == 44 || txwfc_playMethod == 54 || txwfc_playMethod == 61
		|| txwfc_playMethod == 24 || txwfc_playMethod == 35 || txwfc_playMethod == 46 || txwfc_playMethod == 51 || txwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 74 || txwfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["txwfc"]["line1"].push(array[0]+"");
		LotteryStorage["txwfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line2"], function(k, v){
			$("#" + "txwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 75 || txwfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["txwfc"]["line1"].push(array[0]+"");
		LotteryStorage["txwfc"]["line2"].push(array[1]+"");
		LotteryStorage["txwfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line2"], function(k, v){
			$("#" + "txwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line3"], function(k, v){
			$("#" + "txwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["txwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txwfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["txwfc"]["line"+lines[0]], function(k, v){
			$("#" + "txwfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line"+lines[1]], function(k, v){
			$("#" + "txwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["txwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txwfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["txwfc"]["line"+lines[0]], function(k, v){
			$("#" + "txwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line"+lines[1]], function(k, v){
			$("#" + "txwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line"+lines[0]], function(k, v){
			$("#" + "txwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["txwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txwfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["txwfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["txwfc"]["line"+lines[0]], function(k, v){
			$("#" + "txwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line"+lines[1]], function(k, v){
			$("#" + "txwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line"+lines[2]], function(k, v){
			$("#" + "txwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txwfc"]["line"+lines[3]], function(k, v){
			$("#" + "txwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(txwfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["txwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txwfc"]["line1"], function(k, v){
			$("#" + "txwfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	txwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function txwfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(txwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txwfc_playMethod == 18 || txwfc_playMethod == 29 || txwfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(txwfc_playMethod == 22 || txwfc_playMethod == 33 || txwfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(txwfc_playMethod == 54 || txwfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(txwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txwfc_playMethod == 37 || txwfc_playMethod == 26 || txwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txwfc_playMethod == 39 || txwfc_playMethod == 28 || txwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(txwfc_playMethod == 41 || txwfc_playMethod == 30 || txwfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(txwfc_playMethod == 52 || txwfc_playMethod == 59 || txwfc_playMethod == 64 || txwfc_playMethod == 66 || txwfc_playMethod == 68
		||txwfc_playMethod == 70 || txwfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txwfc_playMethod == 42 || txwfc_playMethod == 31 || txwfc_playMethod == 20 || txwfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txwfc_playMethod == 43 || txwfc_playMethod == 32 || txwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(txwfc_playMethod == 48 || txwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txwfc_playMethod == 50 || txwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(txwfc_playMethod == 53 || txwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(txwfc_playMethod == 62){
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
	}else if(txwfc_playMethod == 63 || txwfc_playMethod == 65 || txwfc_playMethod == 67 || txwfc_playMethod == 69 || txwfc_playMethod == 71
		|| txwfc_playMethod == 24 || txwfc_playMethod == 35 || txwfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(txwfc_playMethod == 25 || txwfc_playMethod == 36 || txwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txwfc_playMethod == 51 || txwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(txwfc_playMethod == 74 || txwfc_playMethod == 76){
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
	}else if(txwfc_playMethod == 75 || txwfc_playMethod == 77){
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
	}else if(txwfc_playMethod == 78){
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
	}else if(txwfc_playMethod == 84){
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
	}else if(txwfc_playMethod == 93){
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
	obj.sntuo = txwfc_sntuo;
	obj.multiple = 1;
	obj.rebates = txwfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('txwfc',txwfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#txwfc_minAward').html();     //奖金
	obj.maxAward = $('#txwfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [txwfcValidateData 单式数据验证]
 */
function txwfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#txwfc_single").val();
	textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	txwfcValidData(textStr,type);
}

function txwfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(txwfc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 38 || txwfc_playMethod == 27 || txwfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 45 || txwfc_playMethod == 34 || txwfc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 49 || txwfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,2);
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,2);
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,3);
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,3);
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,3);
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,3);
		txwfcShowFooter(true,notes);
	}else if(txwfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txwfc_tab .button.red").size() ,4);
		txwfcShowFooter(true,notes);
	}

	$('#txwfc_delRepeat').off('click');
	$('#txwfc_delRepeat').on('click',function () {
		content.str = $('#txwfc_single').val() ? $('#txwfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		txwfcShowFooter(true,notes);
		$("#txwfc_single").val(array.join(" "));
	});

	$("#txwfc_single").val(array.join(" "));
	return notes;
}

function txwfcShowFooter(isValid,notes){
	$('#txwfc_zhushu').text(notes);
	if($("#txwfc_modeId").val() == "8"){
		$('#txwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txwfc_beiNum").val()),0.002));
	}else if ($("#txwfc_modeId").val() == "2"){
		$('#txwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txwfc_beiNum").val()),0.2));
	}else if ($("#txwfc_modeId").val() == "1"){
		$('#txwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txwfc_beiNum").val()),0.02));
	}else{
		$('#txwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txwfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	txwfc_initFooterButton();
	calcAwardWin('txwfc',txwfc_playMethod);  //计算奖金和盈利
}