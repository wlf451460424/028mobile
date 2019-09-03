var txffc_playType = 2;
var txffc_playMethod = 15;
var txffc_sntuo = 0;
var txffc_rebate;
var txffcScroll;

//进入这个页面时调用
function txffcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("txffc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("txffc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function txffcPageUnloadedPanel(){
	$("#txffc_queding").off('click');
	$("#txffcPage_back").off('click');
	$("#txffc_ballView").empty();
	$("#txffcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="txffcPlaySelect"></select>');
	$("#txffcSelect").append($select);
}

//入口函数
function txffc_init(){
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
	$("#txffc_title").html(LotteryInfo.getLotteryNameByTag("txffc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == txffc_playType && j == txffc_playMethod){
					$play.append('<option value="txffc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="txffc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(txffc_playMethod,onShowArray)>-1 ){
						txffc_playType = i;
						txffc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#txffcPlaySelect").append($play);
		}
	}
	
	if($("#txffcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("txffcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:txffcChangeItem
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

	GetLotteryInfo("txffc",function (){
		txffcChangeItem("txffc"+txffc_playMethod);
	});

	//添加滑动条
	if(!txffcScroll){
		txffcScroll = new IScroll('#txffcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("txffc",LotteryInfo.getLotteryIdByTag("txffc"));

	//获取上一期开奖
	queryLastPrize("txffc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('txffc');

	//机选选号
	$("#txffc_random").on('click', function(event) {
		txffc_randomOne();
	});

	//返回
	$("#txffcPage_back").on('click', function(event) {
		// txffc_playType = 2;
		// txffc_playMethod = 15;
		$("#txffc_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		txffc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#txffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",txffc_playMethod));
	//玩法说明
	$("#txffc_paly_shuoming").off('click');
	$("#txffc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#txffc_shuoming").text());
	});

	qingKong("txffc");//清空
	txffc_submitData();
}

function txffcResetPlayType(){
	txffc_playType = 2;
	txffc_playMethod = 15;
}

function txffcChangeItem(val) {
	txffc_qingkongAll();
	var temp = val.substring("txffc".length,val.length);
	if(val == "txffc0"){
		//直选复式
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 0;
		txffc_playMethod = 0;
		createFiveLineLayout("txffc", function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc1"){
		//直选单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 0;
		txffc_playMethod = 1;
		$("#txffc_ballView").empty();
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc2"){
		//组选120
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 0;
		txffc_playMethod = 2;
		createOneLineLayout("txffc","至少选择5个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc3"){
		//组选60
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 0;
		txffc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc4"){
		//组选30
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 0;
		txffc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc5"){
		//组选20
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 0;
		txffc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc6"){
		//组选10
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 0;
		txffc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc7"){
		//组选5
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 0;
		txffc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc8"){
		//总和大小单双
		$("#txffc_random").show();
		var num = ["大","小","单","双"];
		txffc_sntuo = 0;
		txffc_playType = 0;
		txffc_playMethod = 8;
		createNonNumLayout("txffc",txffc_playMethod,num,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc9"){
		//直选复式
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 1;
		txffc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("txffc",tips, function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc10"){
		//直选单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 1;
		txffc_playMethod = 10;
		$("#txffc_ballView").empty();
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc11"){
		//组选24
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 1;
		txffc_playMethod = 11;
		createOneLineLayout("txffc","至少选择4个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc12"){
		//组选12
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 1;
		txffc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc13"){
		//组选6
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 1;
		txffc_playMethod = 13;
		createOneLineLayout("txffc","二重号:至少选择2个号码",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc14"){
		//组选4
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 1;
		txffc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc15"){
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc16"){
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 2;
		txffc_playMethod = 16;
		$("#txffc_ballView").empty();
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc17"){
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 17;
		createSumLayout("txffc",0,27,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc18"){
		//直选跨度
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 18;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc19"){
		//后三组三
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 19;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc20"){
		//后三组六
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 20;
		createOneLineLayout("txffc","至少选择3个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc21"){
		//后三和值
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 21;
		createSumLayout("txffc",1,26,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc22"){
		//后三组选包胆
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 22;
		txffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txffc",array,["请选择一个号码"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc23"){
		//后三混合组选
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 2;
		txffc_playMethod = 23;
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc24"){
		//和值尾数
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 24;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc25"){
		//特殊号
		$("#txffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txffc_sntuo = 0;
		txffc_playType = 2;
		txffc_playMethod = 25;
		createNonNumLayout("txffc",txffc_playMethod,num,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc26"){
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc27"){
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 3;
		txffc_playMethod = 27;
		$("#txffc_ballView").empty();
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc28"){
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 28;
		createSumLayout("txffc",0,27,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc29"){
		//直选跨度
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 29;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc30"){
		//中三组三
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 30;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc31"){
		//中三组六
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 31;
		createOneLineLayout("txffc","至少选择3个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc32"){
		//中三和值
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 32;
		createSumLayout("txffc",1,26,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc33"){
		//中三组选包胆
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 33;
		txffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txffc",array,["请选择一个号码"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc34"){
		//中三混合组选
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 3;
		txffc_playMethod = 34;
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc35"){
		//和值尾数
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 35;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc36"){
		//特殊号
		$("#txffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txffc_sntuo = 0;
		txffc_playType = 3;
		txffc_playMethod = 36;
		createNonNumLayout("txffc",txffc_playMethod,num,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc37"){
		//直选复式
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc38"){
		//直选单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 4;
		txffc_playMethod = 38;
		$("#txffc_ballView").empty();
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc39"){
		//和值
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 39;
		createSumLayout("txffc",0,27,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc40"){
		//直选跨度
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 40;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc41"){
		//前三组三
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 41;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc42"){
		//前三组六
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 42;
		createOneLineLayout("txffc","至少选择3个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc43"){
		//前三和值
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 43;
		createSumLayout("txffc",1,26,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc44"){
		//前三组选包胆
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 44;
		txffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txffc",array,["请选择一个号码"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc45"){
		//前三混合组选
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 4;
		txffc_playMethod = 45;
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc46"){
		//和值尾数
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 46;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc47"){
		//特殊号
		$("#txffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txffc_sntuo = 0;
		txffc_playType = 4;
		txffc_playMethod = 47;
		createNonNumLayout("txffc",txffc_playMethod,num,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc48"){
		//后二复式
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 5;
		txffc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc49"){
		//后二单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 5;
		txffc_playMethod = 49;
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc50"){
		//后二和值
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 5;
		txffc_playMethod = 50;
		createSumLayout("txffc",0,18,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc51"){
		//直选跨度
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 5;
		txffc_playMethod = 51;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc52"){
		//后二组选
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 5;
		txffc_playMethod = 52;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc53"){
		//后二和值
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 5;
		txffc_playMethod = 53;
		createSumLayout("txffc",1,17,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc54"){
		//后二组选包胆
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 5;
		txffc_playMethod = 54;
		txffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txffc",array,["请选择一个号码"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc55"){
		//前二复式
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 6;
		txffc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc56"){
		//前二单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 6;
		txffc_playMethod = 56;
		txffc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
	}else if(val == "txffc57"){
		//前二和值
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 6;
		txffc_playMethod = 57;
		createSumLayout("txffc",0,18,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc58"){
		//直选跨度
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 6;
		txffc_playMethod = 58;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc59"){
		//前二组选
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 6;
		txffc_playMethod = 59;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc60"){
		//前二和值
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 6;
		txffc_playMethod = 60;
		createSumLayout("txffc",1,17,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc61"){
		//前二组选包胆
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 6;
		txffc_playMethod = 61;
		txffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txffc",array,["请选择一个号码"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc62"){
		//定位复式
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 7;
		txffc_playMethod = 62;
		createFiveLineLayout("txffc", function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc63"){
		//后三一码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 63;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc64"){
		//后三二码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 64;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc65"){
		//前三一码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 65;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc66"){
		//前三二码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 66;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc67"){
		//后四一码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 67;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc68"){
		//后四二码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 68;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc69"){
		//前四一码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 69;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc70"){
		//前四二码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 70;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc71"){
		//五星一码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 71;
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc72"){
		//五星二码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 72;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc73"){
		//五星三码
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 8;
		txffc_playMethod = 73;
		createOneLineLayout("txffc","至少选择3个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc74"){
		//后二大小单双
		txffc_qingkongAll();
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 9;
		txffc_playMethod = 74;
		createTextBallTwoLayout("txffc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc75"){
		//后三大小单双
		txffc_qingkongAll();
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 9;
		txffc_playMethod = 75;
		createTextBallThreeLayout("txffc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc76"){
		//前二大小单双
		txffc_qingkongAll();
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 9;
		txffc_playMethod = 76;
		createTextBallTwoLayout("txffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc77"){
		//前三大小单双
		txffc_qingkongAll();
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 9;
		txffc_playMethod = 77;
		createTextBallThreeLayout("txffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc78"){
		//直选复式
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 10;
		txffc_playMethod = 78;
		createFiveLineLayout("txffc",function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc79"){
		//直选单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 10;
		txffc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
		createRenXuanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc80"){
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 10;
		txffc_playMethod = 80;
		createSumLayout("txffc",0,18,function(){
			txffc_calcNotes();
		});
		createRenXuanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc81"){
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 10;
		txffc_playMethod = 81;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		createRenXuanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc82"){
		//组选单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 10;
		txffc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
		createRenXuanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc83"){
		//组选和值
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 10;
		txffc_playMethod = 83;
		createSumLayout("txffc",1,17,function(){
			txffc_calcNotes();
		});
		createRenXuanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc84"){
		//直选复式
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 11;
		txffc_playMethod = 84;
		createFiveLineLayout("txffc", function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc85"){
		//直选单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 11;
		txffc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
		createRenXuanSanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc86"){
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 11;
		txffc_playMethod = 86;
		createSumLayout("txffc",0,27,function(){
			txffc_calcNotes();
		});
		createRenXuanSanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc87"){
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 11;
		txffc_playMethod = 87;
		createOneLineLayout("txffc","至少选择2个",0,9,false,function(){
			txffc_calcNotes();
		});
		createRenXuanSanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc88"){
		//组选单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 11;
		txffc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
		createRenXuanSanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc89"){
		//组选和值
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 11;
		txffc_playMethod = 89;
		createOneLineLayout("txffc","至少选择3个",0,9,false,function(){
			txffc_calcNotes();
		});
		createRenXuanSanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc90"){
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 11;
		txffc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
		createRenXuanSanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc91"){
		//混合组选
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 11;
		txffc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
		createRenXuanSanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc92"){
		//组选和值
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 11;
		txffc_playMethod = 92;
		createSumLayout("txffc",1,26,function(){
			txffc_calcNotes();
		});
		createRenXuanSanLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc93"){
		$("#txffc_random").show();
		txffc_sntuo = 0;
		txffc_playType = 12;
		txffc_playMethod = 93;
		createFiveLineLayout("txffc", function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc94"){
		//直选单式
		$("#txffc_random").hide();
		txffc_sntuo = 3;
		txffc_playType = 12;
		txffc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txffc",tips);
		createRenXuanSiLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc95"){
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 12;
		txffc_playMethod = 95;
		createOneLineLayout("txffc","至少选择4个",0,9,false,function(){
			txffc_calcNotes();
		});
		createRenXuanSiLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc96"){
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 12;
		txffc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		createRenXuanSiLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc97"){
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 12;
		txffc_playMethod = 97;
		$("#txffc_ballView").empty();
		createOneLineLayout("txffc","二重号:至少选择2个号码",0,9,false,function(){
			txffc_calcNotes();
		});
		createRenXuanSiLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc98"){
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 12;
		txffc_playMethod = 98;
		$("#txffc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txffc",tips,0,9,false,function(){
			txffc_calcNotes();
		});
		createRenXuanSiLayout("txffc",txffc_playMethod,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc99"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 13;
		txffc_playMethod = 99;
		$("#txffc_ballView").empty();
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc100"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 13;
		txffc_playMethod = 100;
		$("#txffc_ballView").empty();
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc101"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 13;
		txffc_playMethod = 101;
		$("#txffc_ballView").empty();
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc102"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 13;
		txffc_playMethod = 102;
		$("#txffc_ballView").empty();
		createOneLineLayout("txffc","至少选择1个",0,9,false,function(){
			txffc_calcNotes();
		});
		txffc_qingkongAll();
	}else if(val == "txffc103"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 103;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc104"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 104;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc105"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 105;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc106"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 106;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc107"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 107;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc108"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 108;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc109"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 109;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc110"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 110;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc111"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 111;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc112"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 14;
		txffc_playMethod = 112;
		createTextBallOneLayout("txffc",["龙","虎","和"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc123"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 123;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc124"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 124;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc125"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 125;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc126"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 126;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc127"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 127;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc128"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 128;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc129"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 129;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc130"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 130;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc131"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 131;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}else if(val == "txffc132"){
		txffc_qingkongAll();
		$("#txffc_random").hide();
		txffc_sntuo = 0;
		txffc_playType = 16;
		txffc_playMethod = 132;
		createTextBallOneLayout("txffc",["龙","虎"],["至少选择一个"],function(){
			txffc_calcNotes();
		});
	}

	if(txffcScroll){
		txffcScroll.refresh();
		txffcScroll.scrollTo(0,0,1);
	}
	
	$("#txffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("txffc",temp);
	hideRandomWhenLi("txffc",txffc_sntuo,txffc_playMethod);
	txffc_calcNotes();
}
/**
 * [txffc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function txffc_initFooterButton(){
	if(txffc_playMethod == 0 || txffc_playMethod == 62 || txffc_playMethod == 78
		|| txffc_playMethod == 84 || txffc_playMethod == 93 || txffc_playType == 7){
		if(LotteryStorage["txffc"]["line1"].length > 0 || LotteryStorage["txffc"]["line2"].length > 0 ||
			LotteryStorage["txffc"]["line3"].length > 0 || LotteryStorage["txffc"]["line4"].length > 0 ||
			LotteryStorage["txffc"]["line5"].length > 0){
			$("#txffc_qingkong").css("opacity",1.0);
		}else{
			$("#txffc_qingkong").css("opacity",0.4);
		}
	}else if(txffc_playMethod == 9){
		if(LotteryStorage["txffc"]["line1"].length > 0 || LotteryStorage["txffc"]["line2"].length > 0 ||
			LotteryStorage["txffc"]["line3"].length > 0 || LotteryStorage["txffc"]["line4"].length > 0 ){
			$("#txffc_qingkong").css("opacity",1.0);
		}else{
			$("#txffc_qingkong").css("opacity",0.4);
		}
	}else if(txffc_playMethod == 37 || txffc_playMethod == 4 || txffc_playMethod == 6
		|| txffc_playMethod == 26 || txffc_playMethod == 15 || txffc_playMethod == 75 || txffc_playMethod == 77){
		if(LotteryStorage["txffc"]["line1"].length > 0 || LotteryStorage["txffc"]["line2"].length > 0
			|| LotteryStorage["txffc"]["line3"].length > 0){
			$("#txffc_qingkong").css("opacity",1.0);
		}else{
			$("#txffc_qingkong").css("opacity",0.4);
		}
	}else if(txffc_playMethod == 3 || txffc_playMethod == 4 || txffc_playMethod == 5
		|| txffc_playMethod == 6 || txffc_playMethod == 7 || txffc_playMethod == 12
		|| txffc_playMethod == 14 || txffc_playMethod == 48 || txffc_playMethod == 55
		|| txffc_playMethod == 74 || txffc_playMethod == 76 || txffc_playMethod == 96 || txffc_playMethod == 98){
		if(LotteryStorage["txffc"]["line1"].length > 0 || LotteryStorage["txffc"]["line2"].length > 0){
			$("#txffc_qingkong").css("opacity",1.0);
		}else{
			$("#txffc_qingkong").css("opacity",0.4);
		}
	}else if(txffc_playMethod == 2 || txffc_playMethod == 8 || txffc_playMethod == 11 || txffc_playMethod == 13 || txffc_playMethod == 39
		|| txffc_playMethod == 28 || txffc_playMethod == 17 || txffc_playMethod == 18 || txffc_playMethod == 24 || txffc_playMethod == 41
		|| txffc_playMethod == 25 || txffc_playMethod == 29 || txffc_playMethod == 42 || txffc_playMethod == 43 || txffc_playMethod == 30
		|| txffc_playMethod == 35 || txffc_playMethod == 36 || txffc_playMethod == 31 || txffc_playMethod == 32 || txffc_playMethod == 19
		|| txffc_playMethod == 40 || txffc_playMethod == 46 || txffc_playMethod == 20 || txffc_playMethod == 21 || txffc_playMethod == 50
		|| txffc_playMethod == 47 || txffc_playMethod == 51 || txffc_playMethod == 52 || txffc_playMethod == 53 || txffc_playMethod == 57 || txffc_playMethod == 63
		|| txffc_playMethod == 58 || txffc_playMethod == 59 || txffc_playMethod == 60 || txffc_playMethod == 65 || txffc_playMethod == 80 || txffc_playMethod == 81 || txffc_playType == 8
		|| txffc_playMethod == 83 || txffc_playMethod == 86 || txffc_playMethod == 87 || txffc_playMethod == 22 || txffc_playMethod == 33 || txffc_playMethod == 44
		|| txffc_playMethod == 89 || txffc_playMethod == 92 || txffc_playMethod == 95 || txffc_playMethod == 54 || txffc_playMethod == 61
		|| txffc_playMethod == 97 || txffc_playType == 13  || txffc_playType == 14 || txffc_playType == 16){
		if(LotteryStorage["txffc"]["line1"].length > 0){
			$("#txffc_qingkong").css("opacity",1.0);
		}else{
			$("#txffc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#txffc_qingkong").css("opacity",0);
	}

	if($("#txffc_qingkong").css("opacity") == "0"){
		$("#txffc_qingkong").css("display","none");
	}else{
		$("#txffc_qingkong").css("display","block");
	}

	if($('#txffc_zhushu').html() > 0){
		$("#txffc_queding").css("opacity",1.0);
	}else{
		$("#txffc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  txffc_qingkongAll(){
	$("#txffc_ballView span").removeClass('redBalls_active');
	LotteryStorage["txffc"]["line1"] = [];
	LotteryStorage["txffc"]["line2"] = [];
	LotteryStorage["txffc"]["line3"] = [];
	LotteryStorage["txffc"]["line4"] = [];
	LotteryStorage["txffc"]["line5"] = [];

	localStorageUtils.removeParam("txffc_line1");
	localStorageUtils.removeParam("txffc_line2");
	localStorageUtils.removeParam("txffc_line3");
	localStorageUtils.removeParam("txffc_line4");
	localStorageUtils.removeParam("txffc_line5");

	$('#txffc_zhushu').text(0);
	$('#txffc_money').text(0);
	clearAwardWin("txffc");
	txffc_initFooterButton();
}

/**
 * [txffc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function txffc_calcNotes(){
	$('#txffc_modeId').blur();
	$('#txffc_fandian').blur();
	
	var notes = 0;

	if(txffc_playMethod == 0){
		notes = LotteryStorage["txffc"]["line1"].length *
			LotteryStorage["txffc"]["line2"].length *
			LotteryStorage["txffc"]["line3"].length *
			LotteryStorage["txffc"]["line4"].length *
			LotteryStorage["txffc"]["line5"].length;
	}else if(txffc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,5);
	}else if(txffc_playMethod == 3){
		if (LotteryStorage["txffc"]["line1"].length >= 1 && LotteryStorage["txffc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["txffc"]["line1"],LotteryStorage["txffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txffc_playMethod == 4){
		if (LotteryStorage["txffc"]["line1"].length >= 2 && LotteryStorage["txffc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["txffc"]["line2"],LotteryStorage["txffc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(txffc_playMethod == 5 || txffc_playMethod == 12){
		if (LotteryStorage["txffc"]["line1"].length >= 1 && LotteryStorage["txffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txffc"]["line1"],LotteryStorage["txffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txffc_playMethod == 6 || txffc_playMethod == 7 || txffc_playMethod == 14){
		if (LotteryStorage["txffc"]["line1"].length >= 1 && LotteryStorage["txffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txffc"]["line1"],LotteryStorage["txffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txffc_playMethod == 9){
		notes = LotteryStorage["txffc"]["line1"].length *
			LotteryStorage["txffc"]["line2"].length *
			LotteryStorage["txffc"]["line3"].length *
			LotteryStorage["txffc"]["line4"].length;
	}else if(txffc_playMethod == 18 || txffc_playMethod == 29 || txffc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(txffc_playMethod == 22 || txffc_playMethod == 33 || txffc_playMethod == 44 ){
		notes = 54;
	}else if(txffc_playMethod == 54 || txffc_playMethod == 61){
		notes = 9;
	}else if(txffc_playMethod == 51 || txffc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(txffc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,4);
	}else if(txffc_playMethod == 13|| txffc_playMethod == 64 || txffc_playMethod == 66 || txffc_playMethod == 68 || txffc_playMethod == 70 || txffc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,2);
	}else if(txffc_playMethod == 37 || txffc_playMethod == 26 || txffc_playMethod == 15 || txffc_playMethod == 75 || txffc_playMethod == 77){
		notes = LotteryStorage["txffc"]["line1"].length *
			LotteryStorage["txffc"]["line2"].length *
			LotteryStorage["txffc"]["line3"].length ;
	}else if(txffc_playMethod == 39 || txffc_playMethod == 28 || txffc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txffc"]["line1"][i]);
		};
	}else if(txffc_playMethod == 41 || txffc_playMethod == 30 || txffc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["txffc"]["line1"].length,2);
	}else if(txffc_playMethod == 42 || txffc_playMethod == 31 || txffc_playMethod == 20 || txffc_playMethod == 68 || txffc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,3);
	}else if(txffc_playMethod == 43 || txffc_playMethod == 32 || txffc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txffc"]["line1"][i]);
		};
	}else if(txffc_playMethod == 48 || txffc_playMethod == 55 || txffc_playMethod == 74 || txffc_playMethod == 76){
		notes = LotteryStorage["txffc"]["line1"].length *
			LotteryStorage["txffc"]["line2"].length ;
	}else if(txffc_playMethod == 50 || txffc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txffc"]["line1"][i]);
		};
	}else if(txffc_playMethod == 52 || txffc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,2);
	}else if(txffc_playMethod == 53 || txffc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txffc"]["line1"][i]);
		};
	}else if(txffc_playMethod == 62){
		notes = LotteryStorage["txffc"]["line1"].length +
			LotteryStorage["txffc"]["line2"].length +
			LotteryStorage["txffc"]["line3"].length +
			LotteryStorage["txffc"]["line4"].length +
			LotteryStorage["txffc"]["line5"].length;
	}else if(txffc_playType == 13 || txffc_playType == 14 || txffc_playType == 16 || txffc_playMethod == 8 || txffc_playMethod == 71
		|| txffc_playMethod == 24 || txffc_playMethod == 25 || txffc_playMethod == 35 || txffc_playMethod == 36 || txffc_playMethod == 46
		|| txffc_playMethod == 47 || txffc_playMethod == 63 || txffc_playMethod == 65 || txffc_playMethod == 67 || txffc_playMethod == 69 ){
		notes = LotteryStorage["txffc"]["line1"].length ;
	}else if(txffc_playMethod == 78){
		notes = LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line2"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line3"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line4"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line3"].length +
			LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line4"].length +
			LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line4"].length +
			LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line4"].length * LotteryStorage["txffc"]["line5"].length;
	}else if (txffc_playMethod == 80) {
		if ($("#txffc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txffc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#txffc_tab .button.red").size() ,2);
		}
	}else if (txffc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,2) * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,2);
	}else if (txffc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txffc_tab .button.red").size() ,2);
	}else if (txffc_playMethod == 84) {
		notes = LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line3"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line4"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line4"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line4"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line4"].length +
			LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line4"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line4"].length * LotteryStorage["txffc"]["line5"].length ;
	}else if (txffc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txffc_tab .button.red").size() ,3);
	}else if (txffc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["txffc"]["line1"].length,2) * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,3);
	}else if (txffc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,3) * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,3);
	}else if (txffc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["txffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txffc_tab .button.red").size() ,3);
	}else if (txffc_playMethod == 93) {
		notes = LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line4"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line4"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line1"].length * LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line4"].length * LotteryStorage["txffc"]["line5"].length +
			LotteryStorage["txffc"]["line2"].length * LotteryStorage["txffc"]["line3"].length * LotteryStorage["txffc"]["line4"].length * LotteryStorage["txffc"]["line5"].length;
	}else if (txffc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,4)
			* mathUtil.getCCombination($("#txffc_tab .button.red").size() ,4);
	}else if (txffc_playMethod == 96) {
		if (LotteryStorage["txffc"]["line1"].length >= 1 && LotteryStorage["txffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txffc"]["line1"],LotteryStorage["txffc"]["line2"])
				* mathUtil.getCCombination($("#txffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (txffc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["txffc"]["line1"].length,2) * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,4);
	}else if (txffc_playMethod == 98) {
		if (LotteryStorage["txffc"]["line1"].length >= 1 && LotteryStorage["txffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txffc"]["line1"],LotteryStorage["txffc"]["line2"]) * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = txffcValidData($("#txffc_single").val());
	}

	if(txffc_sntuo == 3 || txffc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","txffc"),LotteryInfo.getMethodId("ssc",txffc_playMethod))){
	}else{
		if(parseInt($('#txffc_modeId').val()) == 8){
			$("#txffc_random").hide();
		}else{
			$("#txffc_random").show();
		}
	}

	//验证是否为空
	if( $("#txffc_beiNum").val() =="" || parseInt($("#txffc_beiNum").val()) == 0){
		$("#txffc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#txffc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#txffc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#txffc_zhushu').text(notes);
		if($("#txffc_modeId").val() == "8"){
			$('#txffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txffc_beiNum").val()),0.002));
		}else if ($("#txffc_modeId").val() == "2"){
			$('#txffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txffc_beiNum").val()),0.2));
		}else if ($("#txffc_modeId").val() == "1"){
			$('#txffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txffc_beiNum").val()),0.02));
		}else{
			$('#txffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txffc_beiNum").val()),2));
		}
	} else {
		$('#txffc_zhushu').text(0);
		$('#txffc_money').text(0);
	}
	txffc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('txffc',txffc_playMethod);
}

/**
 * [txffc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function txffc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#txffc_queding").bind('click', function(event) {

		txffc_rebate = $("#txffc_fandian option:last").val();
		if(parseInt($('#txffc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		txffc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
//		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;
		//20180927  需求读取配置文件。
		if (Number($('#txffc_money').html()) < Number(min_Money)){
			toastUtils.showToast('订单最低金额'+ min_Money + '元');
			return;
		}

		/*if(parseInt($('#txffc_modeId').val()) == 8){
			if (Number($('#txffc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('txffc',txffc_playMethod);

		submitParams.lotteryType = "txffc";
		var play = LotteryInfo.getPlayName("ssc",txffc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",txffc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = txffc_playType;
		submitParams.playMethodIndex = txffc_playMethod;
		var selectedBalls = [];
		if(txffc_playMethod == 0 || txffc_playMethod == 3 || txffc_playMethod == 4
			|| txffc_playMethod == 5 || txffc_playMethod == 6 || txffc_playMethod == 7
			|| txffc_playMethod == 9 || txffc_playMethod == 12 || txffc_playMethod == 14
			|| txffc_playMethod == 37 || txffc_playMethod == 26 || txffc_playMethod == 15
			|| txffc_playMethod == 48 || txffc_playMethod == 55 || txffc_playMethod == 74 || txffc_playType == 9){
			$("#txffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(txffc_playMethod == 2 || txffc_playMethod == 8 || txffc_playMethod == 11 || txffc_playMethod == 13 || txffc_playMethod == 24
			|| txffc_playMethod == 39 || txffc_playMethod == 28 || txffc_playMethod == 17 || txffc_playMethod == 18 || txffc_playMethod == 25
			|| txffc_playMethod == 22 || txffc_playMethod == 33 || txffc_playMethod == 44 || txffc_playMethod == 54 || txffc_playMethod == 61
			|| txffc_playMethod == 41 || txffc_playMethod == 42 || txffc_playMethod == 43 || txffc_playMethod == 29 || txffc_playMethod == 35
			|| txffc_playMethod == 30 || txffc_playMethod == 31 || txffc_playMethod == 32 || txffc_playMethod == 40 || txffc_playMethod == 36
			|| txffc_playMethod == 19 || txffc_playMethod == 20 || txffc_playMethod == 21 || txffc_playMethod == 46 || txffc_playMethod == 47
			|| txffc_playMethod == 50 || txffc_playMethod == 57 || txffc_playType == 8 || txffc_playMethod == 51 || txffc_playMethod == 58
			|| txffc_playMethod == 52 || txffc_playMethod == 53|| txffc_playMethod == 59 || txffc_playMethod == 60 || txffc_playType == 13 || txffc_playType == 14|| txffc_playType == 16){
			$("#txffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(txffc_playType == 7 || txffc_playMethod == 78 || txffc_playMethod == 84 || txffc_playMethod == 93){
			$("#txffc_ballView div.ballView").each(function(){
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
		}else if(txffc_playMethod == 80 || txffc_playMethod == 81 || txffc_playMethod == 83
			|| txffc_playMethod == 86 || txffc_playMethod == 87 || txffc_playMethod == 89
			|| txffc_playMethod == 92 || txffc_playMethod == 95 || txffc_playMethod == 97){
			$("#txffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#txffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txffc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (txffc_playMethod == 96 || txffc_playMethod == 98) {
			$("#txffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#txffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txffc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			txffcValidateData("submit");
			var array = handleSingleStr($("#txffc_single").val());
			if(txffc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(txffc_playMethod == 10 || txffc_playMethod == 38 || txffc_playMethod == 27
				|| txffc_playMethod == 16 || txffc_playMethod == 49 || txffc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txffc_playMethod == 45 || txffc_playMethod == 34 || txffc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txffc_playMethod == 79 || txffc_playMethod == 82 || txffc_playMethod == 85 || txffc_playMethod == 88 ||
				txffc_playMethod == 89 || txffc_playMethod == 90 || txffc_playMethod == 91 || txffc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#txffc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#txffc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#txffc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#txffc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#txffc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#txffc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#txffc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#txffc_fandian").val());
		submitParams.notes = $('#txffc_zhushu').html();
		submitParams.sntuo = txffc_sntuo;
		submitParams.multiple = $('#txffc_beiNum').val();  //requirement
		submitParams.rebates = $('#txffc_fandian').val();  //requirement
		submitParams.playMode = $('#txffc_modeId').val();  //requirement
		submitParams.money = $('#txffc_money').html();  //requirement
		submitParams.award = $('#txffc_minAward').html();  //奖金
		submitParams.maxAward = $('#txffc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#txffc_ballView").empty();
		txffc_qingkongAll();
	});
}

/**
 * [txffc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function txffc_randomOne(){
	txffc_qingkongAll();
	if(txffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["txffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txffc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["txffc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line2"], function(k, v){
			$("#" + "txffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line3"], function(k, v){
			$("#" + "txffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line4"], function(k, v){
			$("#" + "txffc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line5"], function(k, v){
			$("#" + "txffc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["txffc"]["line1"].push(number+"");
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["txffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txffc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line2"], function(k, v){
			$("#" + "txffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line3"], function(k, v){
			$("#" + "txffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line4"], function(k, v){
			$("#" + "txffc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(txffc_playMethod == 37 || txffc_playMethod == 26 || txffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["txffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txffc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line2"], function(k, v){
			$("#" + "txffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line3"], function(k, v){
			$("#" + "txffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 41 || txffc_playMethod == 30 || txffc_playMethod == 19 || txffc_playMethod == 68
		|| txffc_playMethod == 52 || txffc_playMethod == 64 || txffc_playMethod == 66
		|| txffc_playMethod == 59 || txffc_playMethod == 70 || txffc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 42 || txffc_playMethod == 31 || txffc_playMethod == 20 || txffc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 39 || txffc_playMethod == 28 || txffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["txffc"]["line1"].push(number+'');
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 43 || txffc_playMethod == 32 || txffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["txffc"]["line1"].push(number+'');
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 48 || txffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["txffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txffc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line2"], function(k, v){
			$("#" + "txffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 25 || txffc_playMethod == 36 || txffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["txffc"]["line1"].push(number+"");
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 50 || txffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["txffc"]["line1"].push(number+"");
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 53 || txffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["txffc"]["line1"].push(number+"");
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txffc"]["line"+line].push(number+"");
		$.each(LotteryStorage["txffc"]["line"+line], function(k, v){
			$("#" + "txffc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 63 || txffc_playMethod == 67 || txffc_playMethod == 69 || txffc_playMethod == 71 || txffc_playType == 13
		|| txffc_playMethod == 65 || txffc_playMethod == 18 || txffc_playMethod == 29 || txffc_playMethod == 40 || txffc_playMethod == 22
		|| txffc_playMethod == 33 || txffc_playMethod == 44 || txffc_playMethod == 54 || txffc_playMethod == 61
		|| txffc_playMethod == 24 || txffc_playMethod == 35 || txffc_playMethod == 46 || txffc_playMethod == 51 || txffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txffc"]["line1"].push(number+'');
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 74 || txffc_playMethod == 76){
		// 可以混合投注的代码（下面一行）
		//var array = mathUtil.getNums(2,4);
		// 不可以混合投注的代码（下面二行）
        var lineArray = mathUtil.getInts(0,3);
        var array = mathUtil.getDifferentNums(2,lineArray);
        
		LotteryStorage["txffc"]["line1"].push(array[0]+"");
		LotteryStorage["txffc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line2"], function(k, v){
			$("#" + "txffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 75 || txffc_playMethod == 77){
		// 可以混合投注的代码（下面一行）
		//var array = mathUtil.getNums(3,4);
		// 不可以混合投注的代码（下面二行）
        var lineArray = mathUtil.getInts(0,3);
        var array = mathUtil.getDifferentNums_multiple(3,lineArray);
        
		LotteryStorage["txffc"]["line1"].push(array[0]+"");
		LotteryStorage["txffc"]["line2"].push(array[1]+"");
		LotteryStorage["txffc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line2"], function(k, v){
			$("#" + "txffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line3"], function(k, v){
			$("#" + "txffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["txffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txffc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["txffc"]["line"+lines[0]], function(k, v){
			$("#" + "txffc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line"+lines[1]], function(k, v){
			$("#" + "txffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["txffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txffc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["txffc"]["line"+lines[0]], function(k, v){
			$("#" + "txffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line"+lines[1]], function(k, v){
			$("#" + "txffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line"+lines[0]], function(k, v){
			$("#" + "txffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["txffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txffc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["txffc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["txffc"]["line"+lines[0]], function(k, v){
			$("#" + "txffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line"+lines[1]], function(k, v){
			$("#" + "txffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line"+lines[2]], function(k, v){
			$("#" + "txffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txffc"]["line"+lines[3]], function(k, v){
			$("#" + "txffc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(txffc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["txffc"]["line1"].push(number+"");
		$.each(LotteryStorage["txffc"]["line1"], function(k, v){
			$("#" + "txffc_line1" + v).toggleClass("redBalls_active");
		});
	}
	txffc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function txffc_checkOutRandom(playMethod){
	var obj = new Object();
	if(txffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txffc_playMethod == 18 || txffc_playMethod == 29 || txffc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(txffc_playMethod == 22 || txffc_playMethod == 33 || txffc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(txffc_playMethod == 54 || txffc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(txffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txffc_playMethod == 37 || txffc_playMethod == 26 || txffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txffc_playMethod == 39 || txffc_playMethod == 28 || txffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(txffc_playMethod == 41 || txffc_playMethod == 30 || txffc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(txffc_playMethod == 52 || txffc_playMethod == 59 || txffc_playMethod == 64 || txffc_playMethod == 66 || txffc_playMethod == 68
		||txffc_playMethod == 70 || txffc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txffc_playMethod == 42 || txffc_playMethod == 31 || txffc_playMethod == 20 || txffc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txffc_playMethod == 43 || txffc_playMethod == 32 || txffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(txffc_playMethod == 48 || txffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txffc_playMethod == 50 || txffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(txffc_playMethod == 53 || txffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(txffc_playMethod == 62){
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
	}else if(txffc_playMethod == 63 || txffc_playMethod == 65 || txffc_playMethod == 67 || txffc_playMethod == 69 || txffc_playMethod == 71
		|| txffc_playMethod == 24 || txffc_playMethod == 35 || txffc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(txffc_playMethod == 25 || txffc_playMethod == 36 || txffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txffc_playMethod == 51 || txffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(txffc_playMethod == 74 || txffc_playMethod == 76){
		//var array = mathUtil.getNums(2,4);
        var lineArray = mathUtil.getInts(0,3);
        var array = mathUtil.getDifferentNums(2,lineArray);
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
	}else if(txffc_playMethod == 75 || txffc_playMethod == 77){
		//var array = mathUtil.getNums(3,4);
        var lineArray = mathUtil.getInts(0,3);
        var array = mathUtil.getDifferentNums_multiple(3,lineArray);
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
	}else if(txffc_playMethod == 78){
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
	}else if(txffc_playMethod == 84){
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
	}else if(txffc_playMethod == 93){
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
	obj.sntuo = txffc_sntuo;
	obj.multiple = 1;
	obj.rebates = txffc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('txffc',txffc_playMethod,obj);  //机选奖金计算
	obj.award = $('#txffc_minAward').html();     //奖金
	obj.maxAward = $('#txffc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [txffcValidateData 单式数据验证]
 */
function txffcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#txffc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	txffcValidData(textStr,type);
}

function txffcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(txffc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 38 || txffc_playMethod == 27 || txffc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 45 || txffc_playMethod == 34 || txffc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 49 || txffc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,2);
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,2);
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,3);
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,3);
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,3);
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,3);
		txffcShowFooter(true,notes);
	}else if(txffc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txffc_tab .button.red").size() ,4);
		txffcShowFooter(true,notes);
	}

	$('#txffc_delRepeat').off('click');
	$('#txffc_delRepeat').on('click',function () {
		content.str = $('#txffc_single').val() ? $('#txffc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		txffcShowFooter(true,notes);
		$("#txffc_single").val(array.join(" "));
	});

	$("#txffc_single").val(array.join(" "));
	return notes;
}

function txffcShowFooter(isValid,notes){
	$('#txffc_zhushu').text(notes);
	if($("#txffc_modeId").val() == "8"){
		$('#txffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txffc_beiNum").val()),0.002));
	}else if ($("#txffc_modeId").val() == "2"){
		$('#txffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txffc_beiNum").val()),0.2));
	}else if ($("#txffc_modeId").val() == "1"){
		$('#txffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txffc_beiNum").val()),0.02));
	}else{
		$('#txffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txffc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	txffc_initFooterButton();
	calcAwardWin('txffc',txffc_playMethod);  //计算奖金和盈利
}