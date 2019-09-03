var txsfc_playType = 2;
var txsfc_playMethod = 15;
var txsfc_sntuo = 0;
var txsfc_rebate;
var txsfcScroll;

//进入这个页面时调用
function txsfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("txsfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("txsfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function txsfcPageUnloadedPanel(){
	$("#txsfc_queding").off('click');
	$("#txsfcPage_back").off('click');
	$("#txsfc_ballView").empty();
	$("#txsfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="txsfcPlaySelect"></select>');
	$("#txsfcSelect").append($select);
}

//入口函数
function txsfc_init(){
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
	$("#txsfc_title").html(LotteryInfo.getLotteryNameByTag("txsfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == txsfc_playType && j == txsfc_playMethod){
					$play.append('<option value="txsfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="txsfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(txsfc_playMethod,onShowArray)>-1 ){
						txsfc_playType = i;
						txsfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#txsfcPlaySelect").append($play);
		}
	}
	
	if($("#txsfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("txsfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:txsfcChangeItem
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

	GetLotteryInfo("txsfc",function (){
		txsfcChangeItem("txsfc"+txsfc_playMethod);
	});

	//添加滑动条
	if(!txsfcScroll){
		txsfcScroll = new IScroll('#txsfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("txsfc",LotteryInfo.getLotteryIdByTag("txsfc"));

	//获取上一期开奖
	queryLastPrize("txsfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('txsfc');

	//机选选号
	$("#txsfc_random").on('click', function(event) {
		txsfc_randomOne();
	});

	//返回
	$("#txsfcPage_back").on('click', function(event) {
//		txsfc_playType = 2;
//		txsfc_playMethod = 15;
		$("#txsfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		txsfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#txsfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",txsfc_playMethod));
	//玩法说明
	$("#txsfc_paly_shuoming").off('click');
	$("#txsfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#txsfc_shuoming").text());
	});

	qingKong("txsfc");//清空
	txsfc_submitData();
}

function txsfcResetPlayType(){
	txsfc_playType = 2;
	txsfc_playMethod = 15;
}

function txsfcChangeItem(val) {
	txsfc_qingkongAll();
	var temp = val.substring("txsfc".length,val.length);
	if(val == "txsfc0"){
		//直选复式
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 0;
		txsfc_playMethod = 0;
		createFiveLineLayout("txsfc", function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc1"){
		//直选单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 0;
		txsfc_playMethod = 1;
		$("#txsfc_ballView").empty();
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc2"){
		//组选120
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 0;
		txsfc_playMethod = 2;
		createOneLineLayout("txsfc","至少选择5个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc3"){
		//组选60
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 0;
		txsfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc4"){
		//组选30
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 0;
		txsfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc5"){
		//组选20
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 0;
		txsfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc6"){
		//组选10
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 0;
		txsfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc7"){
		//组选5
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 0;
		txsfc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc8"){
		//总和大小单双
		$("#txsfc_random").show();
		var num = ["大","小","单","双"];
		txsfc_sntuo = 0;
		txsfc_playType = 0;
		txsfc_playMethod = 8;
		createNonNumLayout("txsfc",txsfc_playMethod,num,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc9"){
		//直选复式
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 1;
		txsfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("txsfc",tips, function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc10"){
		//直选单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 1;
		txsfc_playMethod = 10;
		$("#txsfc_ballView").empty();
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc11"){
		//组选24
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 1;
		txsfc_playMethod = 11;
		createOneLineLayout("txsfc","至少选择4个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc12"){
		//组选12
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 1;
		txsfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc13"){
		//组选6
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 1;
		txsfc_playMethod = 13;
		createOneLineLayout("txsfc","二重号:至少选择2个号码",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc14"){
		//组选4
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 1;
		txsfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc15"){
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc16"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 2;
		txsfc_playMethod = 16;
		$("#txsfc_ballView").empty();
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc17"){
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 17;
		createSumLayout("txsfc",0,27,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc18"){
		//直选跨度
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 18;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc19"){
		//后三组三
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 19;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc20"){
		//后三组六
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 20;
		createOneLineLayout("txsfc","至少选择3个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc21"){
		//后三和值
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 21;
		createSumLayout("txsfc",1,26,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc22"){
		//后三组选包胆
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 22;
		txsfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txsfc",array,["请选择一个号码"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc23"){
		//后三混合组选
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 2;
		txsfc_playMethod = 23;
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc24"){
		//和值尾数
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 24;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc25"){
		//特殊号
		$("#txsfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txsfc_sntuo = 0;
		txsfc_playType = 2;
		txsfc_playMethod = 25;
		createNonNumLayout("txsfc",txsfc_playMethod,num,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc26"){
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc27"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 3;
		txsfc_playMethod = 27;
		$("#txsfc_ballView").empty();
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc28"){
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 28;
		createSumLayout("txsfc",0,27,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc29"){
		//直选跨度
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 29;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc30"){
		//中三组三
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 30;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc31"){
		//中三组六
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 31;
		createOneLineLayout("txsfc","至少选择3个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc32"){
		//中三和值
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 32;
		createSumLayout("txsfc",1,26,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc33"){
		//中三组选包胆
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 33;
		txsfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txsfc",array,["请选择一个号码"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc34"){
		//中三混合组选
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 3;
		txsfc_playMethod = 34;
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc35"){
		//和值尾数
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 35;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc36"){
		//特殊号
		$("#txsfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txsfc_sntuo = 0;
		txsfc_playType = 3;
		txsfc_playMethod = 36;
		createNonNumLayout("txsfc",txsfc_playMethod,num,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc37"){
		//直选复式
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc38"){
		//直选单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 4;
		txsfc_playMethod = 38;
		$("#txsfc_ballView").empty();
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc39"){
		//和值
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 39;
		createSumLayout("txsfc",0,27,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc40"){
		//直选跨度
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 40;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc41"){
		//前三组三
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 41;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc42"){
		//前三组六
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 42;
		createOneLineLayout("txsfc","至少选择3个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc43"){
		//前三和值
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 43;
		createSumLayout("txsfc",1,26,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc44"){
		//前三组选包胆
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 44;
		txsfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txsfc",array,["请选择一个号码"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc45"){
		//前三混合组选
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 4;
		txsfc_playMethod = 45;
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc46"){
		//和值尾数
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 46;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc47"){
		//特殊号
		$("#txsfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txsfc_sntuo = 0;
		txsfc_playType = 4;
		txsfc_playMethod = 47;
		createNonNumLayout("txsfc",txsfc_playMethod,num,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc48"){
		//后二复式
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 5;
		txsfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc49"){
		//后二单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 5;
		txsfc_playMethod = 49;
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc50"){
		//后二和值
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 5;
		txsfc_playMethod = 50;
		createSumLayout("txsfc",0,18,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc51"){
		//直选跨度
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 5;
		txsfc_playMethod = 51;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc52"){
		//后二组选
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 5;
		txsfc_playMethod = 52;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc53"){
		//后二和值
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 5;
		txsfc_playMethod = 53;
		createSumLayout("txsfc",1,17,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc54"){
		//后二组选包胆
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 5;
		txsfc_playMethod = 54;
		txsfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txsfc",array,["请选择一个号码"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc55"){
		//前二复式
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 6;
		txsfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc56"){
		//前二单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 6;
		txsfc_playMethod = 56;
		txsfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
	}else if(val == "txsfc57"){
		//前二和值
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 6;
		txsfc_playMethod = 57;
		createSumLayout("txsfc",0,18,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc58"){
		//直选跨度
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 6;
		txsfc_playMethod = 58;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc59"){
		//前二组选
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 6;
		txsfc_playMethod = 59;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc60"){
		//前二和值
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 6;
		txsfc_playMethod = 60;
		createSumLayout("txsfc",1,17,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc61"){
		//前二组选包胆
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 6;
		txsfc_playMethod = 61;
		txsfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txsfc",array,["请选择一个号码"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc62"){
		//定位复式
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 7;
		txsfc_playMethod = 62;
		createFiveLineLayout("txsfc", function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc63"){
		//后三一码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 63;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc64"){
		//后三二码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 64;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc65"){
		//前三一码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 65;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc66"){
		//前三二码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 66;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc67"){
		//后四一码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 67;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc68"){
		//后四二码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 68;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc69"){
		//前四一码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 69;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc70"){
		//前四二码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 70;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc71"){
		//五星一码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 71;
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc72"){
		//五星二码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 72;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc73"){
		//五星三码
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 8;
		txsfc_playMethod = 73;
		createOneLineLayout("txsfc","至少选择3个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc74"){
		//后二大小单双
		txsfc_qingkongAll();
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 9;
		txsfc_playMethod = 74;
		createTextBallTwoLayout("txsfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc75"){
		//后三大小单双
		txsfc_qingkongAll();
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 9;
		txsfc_playMethod = 75;
		createTextBallThreeLayout("txsfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc76"){
		//前二大小单双
		txsfc_qingkongAll();
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 9;
		txsfc_playMethod = 76;
		createTextBallTwoLayout("txsfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc77"){
		//前三大小单双
		txsfc_qingkongAll();
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 9;
		txsfc_playMethod = 77;
		createTextBallThreeLayout("txsfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc78"){
		//直选复式
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 10;
		txsfc_playMethod = 78;
		createFiveLineLayout("txsfc",function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc79"){
		//直选单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 10;
		txsfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
		createRenXuanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc80"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 10;
		txsfc_playMethod = 80;
		createSumLayout("txsfc",0,18,function(){
			txsfc_calcNotes();
		});
		createRenXuanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc81"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 10;
		txsfc_playMethod = 81;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		createRenXuanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc82"){
		//组选单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 10;
		txsfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
		createRenXuanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc83"){
		//组选和值
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 10;
		txsfc_playMethod = 83;
		createSumLayout("txsfc",1,17,function(){
			txsfc_calcNotes();
		});
		createRenXuanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc84"){
		//直选复式
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 11;
		txsfc_playMethod = 84;
		createFiveLineLayout("txsfc", function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc85"){
		//直选单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 11;
		txsfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
		createRenXuanSanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc86"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 11;
		txsfc_playMethod = 86;
		createSumLayout("txsfc",0,27,function(){
			txsfc_calcNotes();
		});
		createRenXuanSanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc87"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 11;
		txsfc_playMethod = 87;
		createOneLineLayout("txsfc","至少选择2个",0,9,false,function(){
			txsfc_calcNotes();
		});
		createRenXuanSanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc88"){
		//组选单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 11;
		txsfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
		createRenXuanSanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc89"){
		//组选和值
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 11;
		txsfc_playMethod = 89;
		createOneLineLayout("txsfc","至少选择3个",0,9,false,function(){
			txsfc_calcNotes();
		});
		createRenXuanSanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc90"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 11;
		txsfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
		createRenXuanSanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc91"){
		//混合组选
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 11;
		txsfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
		createRenXuanSanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc92"){
		//组选和值
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 11;
		txsfc_playMethod = 92;
		createSumLayout("txsfc",1,26,function(){
			txsfc_calcNotes();
		});
		createRenXuanSanLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc93"){
		$("#txsfc_random").show();
		txsfc_sntuo = 0;
		txsfc_playType = 12;
		txsfc_playMethod = 93;
		createFiveLineLayout("txsfc", function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc94"){
		//直选单式
		$("#txsfc_random").hide();
		txsfc_sntuo = 3;
		txsfc_playType = 12;
		txsfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txsfc",tips);
		createRenXuanSiLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc95"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 12;
		txsfc_playMethod = 95;
		createOneLineLayout("txsfc","至少选择4个",0,9,false,function(){
			txsfc_calcNotes();
		});
		createRenXuanSiLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc96"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 12;
		txsfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		createRenXuanSiLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc97"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 12;
		txsfc_playMethod = 97;
		$("#txsfc_ballView").empty();
		createOneLineLayout("txsfc","二重号:至少选择2个号码",0,9,false,function(){
			txsfc_calcNotes();
		});
		createRenXuanSiLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc98"){
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 12;
		txsfc_playMethod = 98;
		$("#txsfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txsfc",tips,0,9,false,function(){
			txsfc_calcNotes();
		});
		createRenXuanSiLayout("txsfc",txsfc_playMethod,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc99"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 13;
		txsfc_playMethod = 99;
		$("#txsfc_ballView").empty();
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc100"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 13;
		txsfc_playMethod = 100;
		$("#txsfc_ballView").empty();
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc101"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 13;
		txsfc_playMethod = 101;
		$("#txsfc_ballView").empty();
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc102"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 13;
		txsfc_playMethod = 102;
		$("#txsfc_ballView").empty();
		createOneLineLayout("txsfc","至少选择1个",0,9,false,function(){
			txsfc_calcNotes();
		});
		txsfc_qingkongAll();
	}else if(val == "txsfc103"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 103;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc104"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 104;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc105"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 105;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc106"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 106;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc107"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 107;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc108"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 108;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc109"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 109;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc110"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 110;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc111"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 111;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}else if(val == "txsfc112"){
		txsfc_qingkongAll();
		$("#txsfc_random").hide();
		txsfc_sntuo = 0;
		txsfc_playType = 14;
		txsfc_playMethod = 112;
		createTextBallOneLayout("txsfc",["龙","虎","和"],["至少选择一个"],function(){
			txsfc_calcNotes();
		});
	}

	if(txsfcScroll){
		txsfcScroll.refresh();
		txsfcScroll.scrollTo(0,0,1);
	}
	
	$("#txsfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("txsfc",temp);
	hideRandomWhenLi("txsfc",txsfc_sntuo,txsfc_playMethod);
	txsfc_calcNotes();
}
/**
 * [txsfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function txsfc_initFooterButton(){
	if(txsfc_playMethod == 0 || txsfc_playMethod == 62 || txsfc_playMethod == 78
		|| txsfc_playMethod == 84 || txsfc_playMethod == 93 || txsfc_playType == 7){
		if(LotteryStorage["txsfc"]["line1"].length > 0 || LotteryStorage["txsfc"]["line2"].length > 0 ||
			LotteryStorage["txsfc"]["line3"].length > 0 || LotteryStorage["txsfc"]["line4"].length > 0 ||
			LotteryStorage["txsfc"]["line5"].length > 0){
			$("#txsfc_qingkong").css("opacity",1.0);
		}else{
			$("#txsfc_qingkong").css("opacity",0.4);
		}
	}else if(txsfc_playMethod == 9){
		if(LotteryStorage["txsfc"]["line1"].length > 0 || LotteryStorage["txsfc"]["line2"].length > 0 ||
			LotteryStorage["txsfc"]["line3"].length > 0 || LotteryStorage["txsfc"]["line4"].length > 0 ){
			$("#txsfc_qingkong").css("opacity",1.0);
		}else{
			$("#txsfc_qingkong").css("opacity",0.4);
		}
	}else if(txsfc_playMethod == 37 || txsfc_playMethod == 4 || txsfc_playMethod == 6
		|| txsfc_playMethod == 26 || txsfc_playMethod == 15 || txsfc_playMethod == 75 || txsfc_playMethod == 77){
		if(LotteryStorage["txsfc"]["line1"].length > 0 || LotteryStorage["txsfc"]["line2"].length > 0
			|| LotteryStorage["txsfc"]["line3"].length > 0){
			$("#txsfc_qingkong").css("opacity",1.0);
		}else{
			$("#txsfc_qingkong").css("opacity",0.4);
		}
	}else if(txsfc_playMethod == 3 || txsfc_playMethod == 4 || txsfc_playMethod == 5
		|| txsfc_playMethod == 6 || txsfc_playMethod == 7 || txsfc_playMethod == 12
		|| txsfc_playMethod == 14 || txsfc_playMethod == 48 || txsfc_playMethod == 55
		|| txsfc_playMethod == 74 || txsfc_playMethod == 76 || txsfc_playMethod == 96 || txsfc_playMethod == 98){
		if(LotteryStorage["txsfc"]["line1"].length > 0 || LotteryStorage["txsfc"]["line2"].length > 0){
			$("#txsfc_qingkong").css("opacity",1.0);
		}else{
			$("#txsfc_qingkong").css("opacity",0.4);
		}
	}else if(txsfc_playMethod == 2 || txsfc_playMethod == 8 || txsfc_playMethod == 11 || txsfc_playMethod == 13 || txsfc_playMethod == 39
		|| txsfc_playMethod == 28 || txsfc_playMethod == 17 || txsfc_playMethod == 18 || txsfc_playMethod == 24 || txsfc_playMethod == 41
		|| txsfc_playMethod == 25 || txsfc_playMethod == 29 || txsfc_playMethod == 42 || txsfc_playMethod == 43 || txsfc_playMethod == 30
		|| txsfc_playMethod == 35 || txsfc_playMethod == 36 || txsfc_playMethod == 31 || txsfc_playMethod == 32 || txsfc_playMethod == 19
		|| txsfc_playMethod == 40 || txsfc_playMethod == 46 || txsfc_playMethod == 20 || txsfc_playMethod == 21 || txsfc_playMethod == 50
		|| txsfc_playMethod == 47 || txsfc_playMethod == 51 || txsfc_playMethod == 52 || txsfc_playMethod == 53 || txsfc_playMethod == 57 || txsfc_playMethod == 63
		|| txsfc_playMethod == 58 || txsfc_playMethod == 59 || txsfc_playMethod == 60 || txsfc_playMethod == 65 || txsfc_playMethod == 80 || txsfc_playMethod == 81 || txsfc_playType == 8
		|| txsfc_playMethod == 83 || txsfc_playMethod == 86 || txsfc_playMethod == 87 || txsfc_playMethod == 22 || txsfc_playMethod == 33 || txsfc_playMethod == 44
		|| txsfc_playMethod == 89 || txsfc_playMethod == 92 || txsfc_playMethod == 95 || txsfc_playMethod == 54 || txsfc_playMethod == 61
		|| txsfc_playMethod == 97 || txsfc_playType == 13  || txsfc_playType == 14){
		if(LotteryStorage["txsfc"]["line1"].length > 0){
			$("#txsfc_qingkong").css("opacity",1.0);
		}else{
			$("#txsfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#txsfc_qingkong").css("opacity",0);
	}

	if($("#txsfc_qingkong").css("opacity") == "0"){
		$("#txsfc_qingkong").css("display","none");
	}else{
		$("#txsfc_qingkong").css("display","block");
	}

	if($('#txsfc_zhushu').html() > 0){
		$("#txsfc_queding").css("opacity",1.0);
	}else{
		$("#txsfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  txsfc_qingkongAll(){
	$("#txsfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["txsfc"]["line1"] = [];
	LotteryStorage["txsfc"]["line2"] = [];
	LotteryStorage["txsfc"]["line3"] = [];
	LotteryStorage["txsfc"]["line4"] = [];
	LotteryStorage["txsfc"]["line5"] = [];

	localStorageUtils.removeParam("txsfc_line1");
	localStorageUtils.removeParam("txsfc_line2");
	localStorageUtils.removeParam("txsfc_line3");
	localStorageUtils.removeParam("txsfc_line4");
	localStorageUtils.removeParam("txsfc_line5");

	$('#txsfc_zhushu').text(0);
	$('#txsfc_money').text(0);
	clearAwardWin("txsfc");
	txsfc_initFooterButton();
}

/**
 * [txsfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function txsfc_calcNotes(){
	$('#txsfc_modeId').blur();
	$('#txsfc_fandian').blur();
	
	var notes = 0;

	if(txsfc_playMethod == 0){
		notes = LotteryStorage["txsfc"]["line1"].length *
			LotteryStorage["txsfc"]["line2"].length *
			LotteryStorage["txsfc"]["line3"].length *
			LotteryStorage["txsfc"]["line4"].length *
			LotteryStorage["txsfc"]["line5"].length;
	}else if(txsfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,5);
	}else if(txsfc_playMethod == 3){
		if (LotteryStorage["txsfc"]["line1"].length >= 1 && LotteryStorage["txsfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["txsfc"]["line1"],LotteryStorage["txsfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txsfc_playMethod == 4){
		if (LotteryStorage["txsfc"]["line1"].length >= 2 && LotteryStorage["txsfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["txsfc"]["line2"],LotteryStorage["txsfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(txsfc_playMethod == 5 || txsfc_playMethod == 12){
		if (LotteryStorage["txsfc"]["line1"].length >= 1 && LotteryStorage["txsfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txsfc"]["line1"],LotteryStorage["txsfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txsfc_playMethod == 6 || txsfc_playMethod == 7 || txsfc_playMethod == 14){
		if (LotteryStorage["txsfc"]["line1"].length >= 1 && LotteryStorage["txsfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txsfc"]["line1"],LotteryStorage["txsfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txsfc_playMethod == 9){
		notes = LotteryStorage["txsfc"]["line1"].length *
			LotteryStorage["txsfc"]["line2"].length *
			LotteryStorage["txsfc"]["line3"].length *
			LotteryStorage["txsfc"]["line4"].length;
	}else if(txsfc_playMethod == 18 || txsfc_playMethod == 29 || txsfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txsfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(txsfc_playMethod == 22 || txsfc_playMethod == 33 || txsfc_playMethod == 44 ){
		notes = 54;
	}else if(txsfc_playMethod == 54 || txsfc_playMethod == 61){
		notes = 9;
	}else if(txsfc_playMethod == 51 || txsfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txsfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(txsfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,4);
	}else if(txsfc_playMethod == 13|| txsfc_playMethod == 64 || txsfc_playMethod == 66 || txsfc_playMethod == 68 || txsfc_playMethod == 70 || txsfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,2);
	}else if(txsfc_playMethod == 37 || txsfc_playMethod == 26 || txsfc_playMethod == 15 || txsfc_playMethod == 75 || txsfc_playMethod == 77){
		notes = LotteryStorage["txsfc"]["line1"].length *
			LotteryStorage["txsfc"]["line2"].length *
			LotteryStorage["txsfc"]["line3"].length ;
	}else if(txsfc_playMethod == 39 || txsfc_playMethod == 28 || txsfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txsfc"]["line1"][i]);
		};
	}else if(txsfc_playMethod == 41 || txsfc_playMethod == 30 || txsfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["txsfc"]["line1"].length,2);
	}else if(txsfc_playMethod == 42 || txsfc_playMethod == 31 || txsfc_playMethod == 20 || txsfc_playMethod == 68 || txsfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,3);
	}else if(txsfc_playMethod == 43 || txsfc_playMethod == 32 || txsfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txsfc"]["line1"][i]);
		};
	}else if(txsfc_playMethod == 48 || txsfc_playMethod == 55 || txsfc_playMethod == 74 || txsfc_playMethod == 76){
		notes = LotteryStorage["txsfc"]["line1"].length *
			LotteryStorage["txsfc"]["line2"].length ;
	}else if(txsfc_playMethod == 50 || txsfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txsfc"]["line1"][i]);
		};
	}else if(txsfc_playMethod == 52 || txsfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,2);
	}else if(txsfc_playMethod == 53 || txsfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txsfc"]["line1"][i]);
		};
	}else if(txsfc_playMethod == 62){
		notes = LotteryStorage["txsfc"]["line1"].length +
			LotteryStorage["txsfc"]["line2"].length +
			LotteryStorage["txsfc"]["line3"].length +
			LotteryStorage["txsfc"]["line4"].length +
			LotteryStorage["txsfc"]["line5"].length;
	}else if(txsfc_playType == 13 || txsfc_playType == 14 || txsfc_playMethod == 8 || txsfc_playMethod == 71
		|| txsfc_playMethod == 24 || txsfc_playMethod == 25 || txsfc_playMethod == 35 || txsfc_playMethod == 36 || txsfc_playMethod == 46
		|| txsfc_playMethod == 47 || txsfc_playMethod == 63 || txsfc_playMethod == 65 || txsfc_playMethod == 67 || txsfc_playMethod == 69 ){
		notes = LotteryStorage["txsfc"]["line1"].length ;
	}else if(txsfc_playMethod == 78){
		notes = LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line2"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line3"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line4"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line3"].length +
			LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line4"].length +
			LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line4"].length +
			LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line4"].length * LotteryStorage["txsfc"]["line5"].length;
	}else if (txsfc_playMethod == 80) {
		if ($("#txsfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txsfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,2);
		}
	}else if (txsfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,2) * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,2);
	}else if (txsfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txsfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,2);
	}else if (txsfc_playMethod == 84) {
		notes = LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line3"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line4"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line4"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line4"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line4"].length +
			LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line4"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line4"].length * LotteryStorage["txsfc"]["line5"].length ;
	}else if (txsfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txsfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,3);
	}else if (txsfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["txsfc"]["line1"].length,2) * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,3);
	}else if (txsfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,3) * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,3);
	}else if (txsfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["txsfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txsfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,3);
	}else if (txsfc_playMethod == 93) {
		notes = LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line4"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line4"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line1"].length * LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line4"].length * LotteryStorage["txsfc"]["line5"].length +
			LotteryStorage["txsfc"]["line2"].length * LotteryStorage["txsfc"]["line3"].length * LotteryStorage["txsfc"]["line4"].length * LotteryStorage["txsfc"]["line5"].length;
	}else if (txsfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,4);
	}else if (txsfc_playMethod == 96) {
		if (LotteryStorage["txsfc"]["line1"].length >= 1 && LotteryStorage["txsfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txsfc"]["line1"],LotteryStorage["txsfc"]["line2"])
				* mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (txsfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["txsfc"]["line1"].length,2) * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,4);
	}else if (txsfc_playMethod == 98) {
		if (LotteryStorage["txsfc"]["line1"].length >= 1 && LotteryStorage["txsfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txsfc"]["line1"],LotteryStorage["txsfc"]["line2"]) * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = txsfcValidData($("#txsfc_single").val());
	}

	if(txsfc_sntuo == 3 || txsfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","txsfc"),LotteryInfo.getMethodId("ssc",txsfc_playMethod))){
	}else{
		if(parseInt($('#txsfc_modeId').val()) == 8){
			$("#txsfc_random").hide();
		}else{
			$("#txsfc_random").show();
		}
	}

	//验证是否为空
	if( $("#txsfc_beiNum").val() =="" || parseInt($("#txsfc_beiNum").val()) == 0){
		$("#txsfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#txsfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#txsfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#txsfc_zhushu').text(notes);
		if($("#txsfc_modeId").val() == "8"){
			$('#txsfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsfc_beiNum").val()),0.002));
		}else if ($("#txsfc_modeId").val() == "2"){
			$('#txsfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsfc_beiNum").val()),0.2));
		}else if ($("#txsfc_modeId").val() == "1"){
			$('#txsfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsfc_beiNum").val()),0.02));
		}else{
			$('#txsfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsfc_beiNum").val()),2));
		}
	} else {
		$('#txsfc_zhushu').text(0);
		$('#txsfc_money').text(0);
	}
	txsfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('txsfc',txsfc_playMethod);
}

/**
 * [txsfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function txsfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#txsfc_queding").bind('click', function(event) {
		txsfc_rebate = $("#txsfc_fandian option:first").val();
		if(parseInt($('#txsfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		txsfc_calcNotes();

		//设置单笔最低投注额为1元
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		//提示单挑奖金
		getDanTiaoBonus('txsfc',txsfc_playMethod);

		submitParams.lotteryType = "txsfc";
		var play = LotteryInfo.getPlayName("ssc",txsfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",txsfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = txsfc_playType;
		submitParams.playMethodIndex = txsfc_playMethod;
		var selectedBalls = [];
		if(txsfc_playMethod == 0 || txsfc_playMethod == 3 || txsfc_playMethod == 4
			|| txsfc_playMethod == 5 || txsfc_playMethod == 6 || txsfc_playMethod == 7
			|| txsfc_playMethod == 9 || txsfc_playMethod == 12 || txsfc_playMethod == 14
			|| txsfc_playMethod == 37 || txsfc_playMethod == 26 || txsfc_playMethod == 15
			|| txsfc_playMethod == 48 || txsfc_playMethod == 55 || txsfc_playMethod == 74 || txsfc_playType == 9){
			$("#txsfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(txsfc_playMethod == 2 || txsfc_playMethod == 8 || txsfc_playMethod == 11 || txsfc_playMethod == 13 || txsfc_playMethod == 24
			|| txsfc_playMethod == 39 || txsfc_playMethod == 28 || txsfc_playMethod == 17 || txsfc_playMethod == 18 || txsfc_playMethod == 25
			|| txsfc_playMethod == 22 || txsfc_playMethod == 33 || txsfc_playMethod == 44 || txsfc_playMethod == 54 || txsfc_playMethod == 61
			|| txsfc_playMethod == 41 || txsfc_playMethod == 42 || txsfc_playMethod == 43 || txsfc_playMethod == 29 || txsfc_playMethod == 35
			|| txsfc_playMethod == 30 || txsfc_playMethod == 31 || txsfc_playMethod == 32 || txsfc_playMethod == 40 || txsfc_playMethod == 36
			|| txsfc_playMethod == 19 || txsfc_playMethod == 20 || txsfc_playMethod == 21 || txsfc_playMethod == 46 || txsfc_playMethod == 47
			|| txsfc_playMethod == 50 || txsfc_playMethod == 57 || txsfc_playType == 8 || txsfc_playMethod == 51 || txsfc_playMethod == 58
			|| txsfc_playMethod == 52 || txsfc_playMethod == 53|| txsfc_playMethod == 59 || txsfc_playMethod == 60 || txsfc_playType == 13 || txsfc_playType == 14){
			$("#txsfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(txsfc_playType == 7 || txsfc_playMethod == 78 || txsfc_playMethod == 84 || txsfc_playMethod == 93){
			$("#txsfc_ballView div.ballView").each(function(){
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
		}else if(txsfc_playMethod == 80 || txsfc_playMethod == 81 || txsfc_playMethod == 83
			|| txsfc_playMethod == 86 || txsfc_playMethod == 87 || txsfc_playMethod == 89
			|| txsfc_playMethod == 92 || txsfc_playMethod == 95 || txsfc_playMethod == 97){
			$("#txsfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#txsfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txsfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txsfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txsfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txsfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (txsfc_playMethod == 96 || txsfc_playMethod == 98) {
			$("#txsfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#txsfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txsfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txsfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txsfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txsfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			var array = handleSingleStr($("#txsfc_single").val());
			if(txsfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(txsfc_playMethod == 10 || txsfc_playMethod == 38 || txsfc_playMethod == 27
				|| txsfc_playMethod == 16 || txsfc_playMethod == 49 || txsfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txsfc_playMethod == 45 || txsfc_playMethod == 34 || txsfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txsfc_playMethod == 79 || txsfc_playMethod == 82 || txsfc_playMethod == 85 || txsfc_playMethod == 88 ||
				txsfc_playMethod == 89 || txsfc_playMethod == 90 || txsfc_playMethod == 91 || txsfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#txsfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#txsfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#txsfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#txsfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#txsfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#txsfc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#txsfc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#txsfc_fandian").val());
		submitParams.notes = $('#txsfc_zhushu').html();
		submitParams.sntuo = txsfc_sntuo;
		submitParams.multiple = $('#txsfc_beiNum').val();  //requirement
		submitParams.rebates = $('#txsfc_fandian').val();  //requirement
		submitParams.playMode = $('#txsfc_modeId').val();  //requirement
		submitParams.money = $('#txsfc_money').html();  //requirement
		submitParams.award = $('#txsfc_minAward').html();  //奖金
		submitParams.maxAward = $('#txsfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#txsfc_ballView").empty();
		txsfc_qingkongAll();
	});
}

/**
 * [txsfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function txsfc_randomOne(){
	txsfc_qingkongAll();
	if(txsfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["txsfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txsfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txsfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txsfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["txsfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line2"], function(k, v){
			$("#" + "txsfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line3"], function(k, v){
			$("#" + "txsfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line4"], function(k, v){
			$("#" + "txsfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line5"], function(k, v){
			$("#" + "txsfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["txsfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["txsfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txsfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txsfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txsfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line2"], function(k, v){
			$("#" + "txsfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line3"], function(k, v){
			$("#" + "txsfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line4"], function(k, v){
			$("#" + "txsfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(txsfc_playMethod == 37 || txsfc_playMethod == 26 || txsfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["txsfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txsfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txsfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line2"], function(k, v){
			$("#" + "txsfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line3"], function(k, v){
			$("#" + "txsfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 41 || txsfc_playMethod == 30 || txsfc_playMethod == 19 || txsfc_playMethod == 68
		|| txsfc_playMethod == 52 || txsfc_playMethod == 64 || txsfc_playMethod == 66
		|| txsfc_playMethod == 59 || txsfc_playMethod == 70 || txsfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txsfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 42 || txsfc_playMethod == 31 || txsfc_playMethod == 20 || txsfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txsfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 39 || txsfc_playMethod == 28 || txsfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["txsfc"]["line1"].push(number+'');
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 43 || txsfc_playMethod == 32 || txsfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["txsfc"]["line1"].push(number+'');
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 48 || txsfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["txsfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txsfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line2"], function(k, v){
			$("#" + "txsfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 25 || txsfc_playMethod == 36 || txsfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["txsfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 50 || txsfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["txsfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 53 || txsfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["txsfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txsfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["txsfc"]["line"+line], function(k, v){
			$("#" + "txsfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 63 || txsfc_playMethod == 67 || txsfc_playMethod == 69 || txsfc_playMethod == 71 || txsfc_playType == 13
		|| txsfc_playMethod == 65 || txsfc_playMethod == 18 || txsfc_playMethod == 29 || txsfc_playMethod == 40 || txsfc_playMethod == 22
		|| txsfc_playMethod == 33 || txsfc_playMethod == 44 || txsfc_playMethod == 54 || txsfc_playMethod == 61
		|| txsfc_playMethod == 24 || txsfc_playMethod == 35 || txsfc_playMethod == 46 || txsfc_playMethod == 51 || txsfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txsfc"]["line1"].push(number+'');
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 74 || txsfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["txsfc"]["line1"].push(array[0]+"");
		LotteryStorage["txsfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line2"], function(k, v){
			$("#" + "txsfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 75 || txsfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["txsfc"]["line1"].push(array[0]+"");
		LotteryStorage["txsfc"]["line2"].push(array[1]+"");
		LotteryStorage["txsfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line2"], function(k, v){
			$("#" + "txsfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line3"], function(k, v){
			$("#" + "txsfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["txsfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txsfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["txsfc"]["line"+lines[0]], function(k, v){
			$("#" + "txsfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line"+lines[1]], function(k, v){
			$("#" + "txsfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["txsfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txsfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txsfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["txsfc"]["line"+lines[0]], function(k, v){
			$("#" + "txsfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line"+lines[1]], function(k, v){
			$("#" + "txsfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line"+lines[0]], function(k, v){
			$("#" + "txsfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["txsfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txsfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txsfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["txsfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["txsfc"]["line"+lines[0]], function(k, v){
			$("#" + "txsfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line"+lines[1]], function(k, v){
			$("#" + "txsfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line"+lines[2]], function(k, v){
			$("#" + "txsfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsfc"]["line"+lines[3]], function(k, v){
			$("#" + "txsfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(txsfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["txsfc"]["line1"].push(number+"");
		$.each(LotteryStorage["txsfc"]["line1"], function(k, v){
			$("#" + "txsfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	txsfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function txsfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(txsfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txsfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txsfc_playMethod == 18 || txsfc_playMethod == 29 || txsfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(txsfc_playMethod == 22 || txsfc_playMethod == 33 || txsfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(txsfc_playMethod == 54 || txsfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(txsfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txsfc_playMethod == 37 || txsfc_playMethod == 26 || txsfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txsfc_playMethod == 39 || txsfc_playMethod == 28 || txsfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(txsfc_playMethod == 41 || txsfc_playMethod == 30 || txsfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(txsfc_playMethod == 52 || txsfc_playMethod == 59 || txsfc_playMethod == 64 || txsfc_playMethod == 66 || txsfc_playMethod == 68
		||txsfc_playMethod == 70 || txsfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txsfc_playMethod == 42 || txsfc_playMethod == 31 || txsfc_playMethod == 20 || txsfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txsfc_playMethod == 43 || txsfc_playMethod == 32 || txsfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(txsfc_playMethod == 48 || txsfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txsfc_playMethod == 50 || txsfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(txsfc_playMethod == 53 || txsfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(txsfc_playMethod == 62){
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
	}else if(txsfc_playMethod == 63 || txsfc_playMethod == 65 || txsfc_playMethod == 67 || txsfc_playMethod == 69 || txsfc_playMethod == 71
		|| txsfc_playMethod == 24 || txsfc_playMethod == 35 || txsfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(txsfc_playMethod == 25 || txsfc_playMethod == 36 || txsfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txsfc_playMethod == 51 || txsfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(txsfc_playMethod == 74 || txsfc_playMethod == 76){
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
	}else if(txsfc_playMethod == 75 || txsfc_playMethod == 77){
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
	}else if(txsfc_playMethod == 78){
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
	}else if(txsfc_playMethod == 84){
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
	}else if(txsfc_playMethod == 93){
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
	obj.sntuo = txsfc_sntuo;
	obj.multiple = 1;
	obj.rebates = txsfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('txsfc',txsfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#txsfc_minAward').html();     //奖金
	obj.maxAward = $('#txsfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [txsfcValidateData 单式数据验证]
 */
function txsfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#txsfc_single").val();
	textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	txsfcValidData(textStr,type);
}

function txsfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(txsfc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 38 || txsfc_playMethod == 27 || txsfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 45 || txsfc_playMethod == 34 || txsfc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 49 || txsfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,2);
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,2);
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,3);
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,3);
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,3);
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,3);
		txsfcShowFooter(true,notes);
	}else if(txsfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txsfc_tab .button.red").size() ,4);
		txsfcShowFooter(true,notes);
	}

	$('#txsfc_delRepeat').off('click');
	$('#txsfc_delRepeat').on('click',function () {
		content.str = $('#txsfc_single').val() ? $('#txsfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		txsfcShowFooter(true,notes);
		$("#txsfc_single").val(array.join(" "));
	});

	$("#txsfc_single").val(array.join(" "));
	return notes;
}

function txsfcShowFooter(isValid,notes){
	$('#txsfc_zhushu').text(notes);
	if($("#txsfc_modeId").val() == "8"){
		$('#txsfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsfc_beiNum").val()),0.002));
	}else if ($("#txsfc_modeId").val() == "2"){
		$('#txsfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsfc_beiNum").val()),0.2));
	}else if ($("#txsfc_modeId").val() == "1"){
		$('#txsfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsfc_beiNum").val()),0.02));
	}else{
		$('#txsfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	txsfc_initFooterButton();
	calcAwardWin('txsfc',txsfc_playMethod);  //计算奖金和盈利
}