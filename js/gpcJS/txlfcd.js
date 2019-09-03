var txlfcd_playType = 2;
var txlfcd_playMethod = 15;
var txlfcd_sntuo = 0;
var txlfcd_rebate;
var txlfcdScroll;

//进入这个页面时调用
function txlfcdPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("txlfcd")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("txlfcd_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function txlfcdPageUnloadedPanel(){
	$("#txlfcd_queding").off('click');
	$("#txlfcdPage_back").off('click');
	$("#txlfcd_ballView").empty();
	$("#txlfcdSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="txlfcdPlaySelect"></select>');
	$("#txlfcdSelect").append($select);
}

//入口函数
function txlfcd_init(){
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
	$("#txlfcd_title").html(LotteryInfo.getLotteryNameByTag("txlfcd"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == txlfcd_playType && j == txlfcd_playMethod){
					$play.append('<option value="txlfcd'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="txlfcd'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(txlfcd_playMethod,onShowArray)>-1 ){
						txlfcd_playType = i;
						txlfcd_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#txlfcdPlaySelect").append($play);
		}
	}
	
	if($("#txlfcdPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("txlfcdSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:txlfcdChangeItem
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

	GetLotteryInfo("txlfcd",function (){
		txlfcdChangeItem("txlfcd"+txlfcd_playMethod);
	});

	//添加滑动条
	if(!txlfcdScroll){
		txlfcdScroll = new IScroll('#txlfcdContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("txlfcd",LotteryInfo.getLotteryIdByTag("txlfcd"));

	//获取上一期开奖
	queryLastPrize("txlfcd");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('txlfcd');

	//机选选号
	$("#txlfcd_random").on('click', function(event) {
		txlfcd_randomOne();
	});

	//返回
	$("#txlfcdPage_back").on('click', function(event) {
//		txlfcd_playType = 2;
//		txlfcd_playMethod = 15;
		$("#txlfcd_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		txlfcd_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#txlfcd_shuoming").html(LotteryInfo.getMethodShuoming("ssc",txlfcd_playMethod));
	//玩法说明
	$("#txlfcd_paly_shuoming").off('click');
	$("#txlfcd_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#txlfcd_shuoming").text());
	});

	qingKong("txlfcd");//清空
	txlfcd_submitData();
}

function txlfcdResetPlayType(){
	txlfcd_playType = 2;
	txlfcd_playMethod = 15;
}

function txlfcdChangeItem(val) {
	txlfcd_qingkongAll();
	var temp = val.substring("txlfcd".length,val.length);
	if(val == "txlfcd0"){
		//直选复式
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 0;
		txlfcd_playMethod = 0;
		createFiveLineLayout("txlfcd", function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd1"){
		//直选单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 0;
		txlfcd_playMethod = 1;
		$("#txlfcd_ballView").empty();
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd2"){
		//组选120
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 0;
		txlfcd_playMethod = 2;
		createOneLineLayout("txlfcd","至少选择5个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd3"){
		//组选60
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 0;
		txlfcd_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd4"){
		//组选30
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 0;
		txlfcd_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd5"){
		//组选20
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 0;
		txlfcd_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd6"){
		//组选10
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 0;
		txlfcd_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd7"){
		//组选5
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 0;
		txlfcd_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd8"){
		//总和大小单双
		$("#txlfcd_random").show();
		var num = ["大","小","单","双"];
		txlfcd_sntuo = 0;
		txlfcd_playType = 0;
		txlfcd_playMethod = 8;
		createNonNumLayout("txlfcd",txlfcd_playMethod,num,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd9"){
		//直选复式
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 1;
		txlfcd_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("txlfcd",tips, function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd10"){
		//直选单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 1;
		txlfcd_playMethod = 10;
		$("#txlfcd_ballView").empty();
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd11"){
		//组选24
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 1;
		txlfcd_playMethod = 11;
		createOneLineLayout("txlfcd","至少选择4个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd12"){
		//组选12
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 1;
		txlfcd_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd13"){
		//组选6
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 1;
		txlfcd_playMethod = 13;
		createOneLineLayout("txlfcd","二重号:至少选择2个号码",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd14"){
		//组选4
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 1;
		txlfcd_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd15"){
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd16"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 2;
		txlfcd_playMethod = 16;
		$("#txlfcd_ballView").empty();
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd17"){
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 17;
		createSumLayout("txlfcd",0,27,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd18"){
		//直选跨度
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 18;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd19"){
		//后三组三
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 19;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd20"){
		//后三组六
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 20;
		createOneLineLayout("txlfcd","至少选择3个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd21"){
		//后三和值
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 21;
		createSumLayout("txlfcd",1,26,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd22"){
		//后三组选包胆
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 22;
		txlfcd_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcd",array,["请选择一个号码"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd23"){
		//后三混合组选
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 2;
		txlfcd_playMethod = 23;
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd24"){
		//和值尾数
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 24;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd25"){
		//特殊号
		$("#txlfcd_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txlfcd_sntuo = 0;
		txlfcd_playType = 2;
		txlfcd_playMethod = 25;
		createNonNumLayout("txlfcd",txlfcd_playMethod,num,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd26"){
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd27"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 3;
		txlfcd_playMethod = 27;
		$("#txlfcd_ballView").empty();
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd28"){
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 28;
		createSumLayout("txlfcd",0,27,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd29"){
		//直选跨度
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 29;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd30"){
		//中三组三
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 30;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd31"){
		//中三组六
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 31;
		createOneLineLayout("txlfcd","至少选择3个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd32"){
		//中三和值
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 32;
		createSumLayout("txlfcd",1,26,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd33"){
		//中三组选包胆
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 33;
		txlfcd_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcd",array,["请选择一个号码"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd34"){
		//中三混合组选
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 3;
		txlfcd_playMethod = 34;
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd35"){
		//和值尾数
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 35;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd36"){
		//特殊号
		$("#txlfcd_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txlfcd_sntuo = 0;
		txlfcd_playType = 3;
		txlfcd_playMethod = 36;
		createNonNumLayout("txlfcd",txlfcd_playMethod,num,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd37"){
		//直选复式
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd38"){
		//直选单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 4;
		txlfcd_playMethod = 38;
		$("#txlfcd_ballView").empty();
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd39"){
		//和值
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 39;
		createSumLayout("txlfcd",0,27,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd40"){
		//直选跨度
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 40;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd41"){
		//前三组三
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 41;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd42"){
		//前三组六
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 42;
		createOneLineLayout("txlfcd","至少选择3个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd43"){
		//前三和值
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 43;
		createSumLayout("txlfcd",1,26,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd44"){
		//前三组选包胆
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 44;
		txlfcd_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcd",array,["请选择一个号码"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd45"){
		//前三混合组选
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 4;
		txlfcd_playMethod = 45;
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd46"){
		//和值尾数
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 46;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd47"){
		//特殊号
		$("#txlfcd_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txlfcd_sntuo = 0;
		txlfcd_playType = 4;
		txlfcd_playMethod = 47;
		createNonNumLayout("txlfcd",txlfcd_playMethod,num,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd48"){
		//后二复式
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 5;
		txlfcd_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd49"){
		//后二单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 5;
		txlfcd_playMethod = 49;
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd50"){
		//后二和值
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 5;
		txlfcd_playMethod = 50;
		createSumLayout("txlfcd",0,18,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd51"){
		//直选跨度
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 5;
		txlfcd_playMethod = 51;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd52"){
		//后二组选
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 5;
		txlfcd_playMethod = 52;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd53"){
		//后二和值
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 5;
		txlfcd_playMethod = 53;
		createSumLayout("txlfcd",1,17,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd54"){
		//后二组选包胆
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 5;
		txlfcd_playMethod = 54;
		txlfcd_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcd",array,["请选择一个号码"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd55"){
		//前二复式
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 6;
		txlfcd_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd56"){
		//前二单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 6;
		txlfcd_playMethod = 56;
		txlfcd_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
	}else if(val == "txlfcd57"){
		//前二和值
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 6;
		txlfcd_playMethod = 57;
		createSumLayout("txlfcd",0,18,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd58"){
		//直选跨度
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 6;
		txlfcd_playMethod = 58;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd59"){
		//前二组选
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 6;
		txlfcd_playMethod = 59;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd60"){
		//前二和值
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 6;
		txlfcd_playMethod = 60;
		createSumLayout("txlfcd",1,17,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd61"){
		//前二组选包胆
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 6;
		txlfcd_playMethod = 61;
		txlfcd_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcd",array,["请选择一个号码"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd62"){
		//定位复式
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 7;
		txlfcd_playMethod = 62;
		createFiveLineLayout("txlfcd", function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd63"){
		//后三一码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 63;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd64"){
		//后三二码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 64;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd65"){
		//前三一码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 65;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd66"){
		//前三二码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 66;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd67"){
		//后四一码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 67;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd68"){
		//后四二码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 68;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd69"){
		//前四一码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 69;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd70"){
		//前四二码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 70;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd71"){
		//五星一码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 71;
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd72"){
		//五星二码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 72;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd73"){
		//五星三码
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 8;
		txlfcd_playMethod = 73;
		createOneLineLayout("txlfcd","至少选择3个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd74"){
		//后二大小单双
		txlfcd_qingkongAll();
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 9;
		txlfcd_playMethod = 74;
		createTextBallTwoLayout("txlfcd",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd75"){
		//后三大小单双
		txlfcd_qingkongAll();
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 9;
		txlfcd_playMethod = 75;
		createTextBallThreeLayout("txlfcd",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd76"){
		//前二大小单双
		txlfcd_qingkongAll();
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 9;
		txlfcd_playMethod = 76;
		createTextBallTwoLayout("txlfcd",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd77"){
		//前三大小单双
		txlfcd_qingkongAll();
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 9;
		txlfcd_playMethod = 77;
		createTextBallThreeLayout("txlfcd",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd78"){
		//直选复式
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 10;
		txlfcd_playMethod = 78;
		createFiveLineLayout("txlfcd",function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd79"){
		//直选单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 10;
		txlfcd_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
		createRenXuanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd80"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 10;
		txlfcd_playMethod = 80;
		createSumLayout("txlfcd",0,18,function(){
			txlfcd_calcNotes();
		});
		createRenXuanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd81"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 10;
		txlfcd_playMethod = 81;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		createRenXuanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd82"){
		//组选单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 10;
		txlfcd_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
		createRenXuanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd83"){
		//组选和值
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 10;
		txlfcd_playMethod = 83;
		createSumLayout("txlfcd",1,17,function(){
			txlfcd_calcNotes();
		});
		createRenXuanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd84"){
		//直选复式
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 11;
		txlfcd_playMethod = 84;
		createFiveLineLayout("txlfcd", function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd85"){
		//直选单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 11;
		txlfcd_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
		createRenXuanSanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd86"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 11;
		txlfcd_playMethod = 86;
		createSumLayout("txlfcd",0,27,function(){
			txlfcd_calcNotes();
		});
		createRenXuanSanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd87"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 11;
		txlfcd_playMethod = 87;
		createOneLineLayout("txlfcd","至少选择2个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		createRenXuanSanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd88"){
		//组选单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 11;
		txlfcd_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
		createRenXuanSanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd89"){
		//组选和值
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 11;
		txlfcd_playMethod = 89;
		createOneLineLayout("txlfcd","至少选择3个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		createRenXuanSanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd90"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 11;
		txlfcd_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
		createRenXuanSanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd91"){
		//混合组选
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 11;
		txlfcd_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
		createRenXuanSanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd92"){
		//组选和值
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 11;
		txlfcd_playMethod = 92;
		createSumLayout("txlfcd",1,26,function(){
			txlfcd_calcNotes();
		});
		createRenXuanSanLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd93"){
		$("#txlfcd_random").show();
		txlfcd_sntuo = 0;
		txlfcd_playType = 12;
		txlfcd_playMethod = 93;
		createFiveLineLayout("txlfcd", function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd94"){
		//直选单式
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 3;
		txlfcd_playType = 12;
		txlfcd_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcd",tips);
		createRenXuanSiLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd95"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 12;
		txlfcd_playMethod = 95;
		createOneLineLayout("txlfcd","至少选择4个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		createRenXuanSiLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd96"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 12;
		txlfcd_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		createRenXuanSiLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd97"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 12;
		txlfcd_playMethod = 97;
		$("#txlfcd_ballView").empty();
		createOneLineLayout("txlfcd","二重号:至少选择2个号码",0,9,false,function(){
			txlfcd_calcNotes();
		});
		createRenXuanSiLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd98"){
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 12;
		txlfcd_playMethod = 98;
		$("#txlfcd_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txlfcd",tips,0,9,false,function(){
			txlfcd_calcNotes();
		});
		createRenXuanSiLayout("txlfcd",txlfcd_playMethod,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd99"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 13;
		txlfcd_playMethod = 99;
		$("#txlfcd_ballView").empty();
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd100"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 13;
		txlfcd_playMethod = 100;
		$("#txlfcd_ballView").empty();
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd101"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 13;
		txlfcd_playMethod = 101;
		$("#txlfcd_ballView").empty();
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd102"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 13;
		txlfcd_playMethod = 102;
		$("#txlfcd_ballView").empty();
		createOneLineLayout("txlfcd","至少选择1个",0,9,false,function(){
			txlfcd_calcNotes();
		});
		txlfcd_qingkongAll();
	}else if(val == "txlfcd103"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 103;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd104"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 104;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd105"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 105;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd106"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 106;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd107"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 107;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd108"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 108;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd109"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 109;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd110"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 110;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd111"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 111;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}else if(val == "txlfcd112"){
		txlfcd_qingkongAll();
		$("#txlfcd_random").hide();
		txlfcd_sntuo = 0;
		txlfcd_playType = 14;
		txlfcd_playMethod = 112;
		createTextBallOneLayout("txlfcd",["龙","虎","和"],["至少选择一个"],function(){
			txlfcd_calcNotes();
		});
	}

	if(txlfcdScroll){
		txlfcdScroll.refresh();
		txlfcdScroll.scrollTo(0,0,1);
	}
	
	$("#txlfcd_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("txlfcd",temp);
	hideRandomWhenLi("txlfcd",txlfcd_sntuo,txlfcd_playMethod);
	txlfcd_calcNotes();
}
/**
 * [txlfcd_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function txlfcd_initFooterButton(){
	if(txlfcd_playMethod == 0 || txlfcd_playMethod == 62 || txlfcd_playMethod == 78
		|| txlfcd_playMethod == 84 || txlfcd_playMethod == 93 || txlfcd_playType == 7){
		if(LotteryStorage["txlfcd"]["line1"].length > 0 || LotteryStorage["txlfcd"]["line2"].length > 0 ||
			LotteryStorage["txlfcd"]["line3"].length > 0 || LotteryStorage["txlfcd"]["line4"].length > 0 ||
			LotteryStorage["txlfcd"]["line5"].length > 0){
			$("#txlfcd_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcd_qingkong").css("opacity",0.4);
		}
	}else if(txlfcd_playMethod == 9){
		if(LotteryStorage["txlfcd"]["line1"].length > 0 || LotteryStorage["txlfcd"]["line2"].length > 0 ||
			LotteryStorage["txlfcd"]["line3"].length > 0 || LotteryStorage["txlfcd"]["line4"].length > 0 ){
			$("#txlfcd_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcd_qingkong").css("opacity",0.4);
		}
	}else if(txlfcd_playMethod == 37 || txlfcd_playMethod == 4 || txlfcd_playMethod == 6
		|| txlfcd_playMethod == 26 || txlfcd_playMethod == 15 || txlfcd_playMethod == 75 || txlfcd_playMethod == 77){
		if(LotteryStorage["txlfcd"]["line1"].length > 0 || LotteryStorage["txlfcd"]["line2"].length > 0
			|| LotteryStorage["txlfcd"]["line3"].length > 0){
			$("#txlfcd_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcd_qingkong").css("opacity",0.4);
		}
	}else if(txlfcd_playMethod == 3 || txlfcd_playMethod == 4 || txlfcd_playMethod == 5
		|| txlfcd_playMethod == 6 || txlfcd_playMethod == 7 || txlfcd_playMethod == 12
		|| txlfcd_playMethod == 14 || txlfcd_playMethod == 48 || txlfcd_playMethod == 55
		|| txlfcd_playMethod == 74 || txlfcd_playMethod == 76 || txlfcd_playMethod == 96 || txlfcd_playMethod == 98){
		if(LotteryStorage["txlfcd"]["line1"].length > 0 || LotteryStorage["txlfcd"]["line2"].length > 0){
			$("#txlfcd_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcd_qingkong").css("opacity",0.4);
		}
	}else if(txlfcd_playMethod == 2 || txlfcd_playMethod == 8 || txlfcd_playMethod == 11 || txlfcd_playMethod == 13 || txlfcd_playMethod == 39
		|| txlfcd_playMethod == 28 || txlfcd_playMethod == 17 || txlfcd_playMethod == 18 || txlfcd_playMethod == 24 || txlfcd_playMethod == 41
		|| txlfcd_playMethod == 25 || txlfcd_playMethod == 29 || txlfcd_playMethod == 42 || txlfcd_playMethod == 43 || txlfcd_playMethod == 30
		|| txlfcd_playMethod == 35 || txlfcd_playMethod == 36 || txlfcd_playMethod == 31 || txlfcd_playMethod == 32 || txlfcd_playMethod == 19
		|| txlfcd_playMethod == 40 || txlfcd_playMethod == 46 || txlfcd_playMethod == 20 || txlfcd_playMethod == 21 || txlfcd_playMethod == 50
		|| txlfcd_playMethod == 47 || txlfcd_playMethod == 51 || txlfcd_playMethod == 52 || txlfcd_playMethod == 53 || txlfcd_playMethod == 57 || txlfcd_playMethod == 63
		|| txlfcd_playMethod == 58 || txlfcd_playMethod == 59 || txlfcd_playMethod == 60 || txlfcd_playMethod == 65 || txlfcd_playMethod == 80 || txlfcd_playMethod == 81 || txlfcd_playType == 8
		|| txlfcd_playMethod == 83 || txlfcd_playMethod == 86 || txlfcd_playMethod == 87 || txlfcd_playMethod == 22 || txlfcd_playMethod == 33 || txlfcd_playMethod == 44
		|| txlfcd_playMethod == 89 || txlfcd_playMethod == 92 || txlfcd_playMethod == 95 || txlfcd_playMethod == 54 || txlfcd_playMethod == 61
		|| txlfcd_playMethod == 97 || txlfcd_playType == 13  || txlfcd_playType == 14){
		if(LotteryStorage["txlfcd"]["line1"].length > 0){
			$("#txlfcd_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcd_qingkong").css("opacity",0.4);
		}
	}else{
		$("#txlfcd_qingkong").css("opacity",0);
	}

	if($("#txlfcd_qingkong").css("opacity") == "0"){
		$("#txlfcd_qingkong").css("display","none");
	}else{
		$("#txlfcd_qingkong").css("display","block");
	}

	if($('#txlfcd_zhushu').html() > 0){
		$("#txlfcd_queding").css("opacity",1.0);
	}else{
		$("#txlfcd_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  txlfcd_qingkongAll(){
	$("#txlfcd_ballView span").removeClass('redBalls_active');
	LotteryStorage["txlfcd"]["line1"] = [];
	LotteryStorage["txlfcd"]["line2"] = [];
	LotteryStorage["txlfcd"]["line3"] = [];
	LotteryStorage["txlfcd"]["line4"] = [];
	LotteryStorage["txlfcd"]["line5"] = [];

	localStorageUtils.removeParam("txlfcd_line1");
	localStorageUtils.removeParam("txlfcd_line2");
	localStorageUtils.removeParam("txlfcd_line3");
	localStorageUtils.removeParam("txlfcd_line4");
	localStorageUtils.removeParam("txlfcd_line5");

	$('#txlfcd_zhushu').text(0);
	$('#txlfcd_money').text(0);
	clearAwardWin("txlfcd");
	txlfcd_initFooterButton();
}

/**
 * [txlfcd_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function txlfcd_calcNotes(){
	$('#txlfcd_modeId').blur();
	$('#txlfcd_fandian').blur();
	
	var notes = 0;

	if(txlfcd_playMethod == 0){
		notes = LotteryStorage["txlfcd"]["line1"].length *
			LotteryStorage["txlfcd"]["line2"].length *
			LotteryStorage["txlfcd"]["line3"].length *
			LotteryStorage["txlfcd"]["line4"].length *
			LotteryStorage["txlfcd"]["line5"].length;
	}else if(txlfcd_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,5);
	}else if(txlfcd_playMethod == 3){
		if (LotteryStorage["txlfcd"]["line1"].length >= 1 && LotteryStorage["txlfcd"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["txlfcd"]["line1"],LotteryStorage["txlfcd"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txlfcd_playMethod == 4){
		if (LotteryStorage["txlfcd"]["line1"].length >= 2 && LotteryStorage["txlfcd"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["txlfcd"]["line2"],LotteryStorage["txlfcd"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(txlfcd_playMethod == 5 || txlfcd_playMethod == 12){
		if (LotteryStorage["txlfcd"]["line1"].length >= 1 && LotteryStorage["txlfcd"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txlfcd"]["line1"],LotteryStorage["txlfcd"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txlfcd_playMethod == 6 || txlfcd_playMethod == 7 || txlfcd_playMethod == 14){
		if (LotteryStorage["txlfcd"]["line1"].length >= 1 && LotteryStorage["txlfcd"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txlfcd"]["line1"],LotteryStorage["txlfcd"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txlfcd_playMethod == 9){
		notes = LotteryStorage["txlfcd"]["line1"].length *
			LotteryStorage["txlfcd"]["line2"].length *
			LotteryStorage["txlfcd"]["line3"].length *
			LotteryStorage["txlfcd"]["line4"].length;
	}else if(txlfcd_playMethod == 18 || txlfcd_playMethod == 29 || txlfcd_playMethod == 40){
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txlfcd"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(txlfcd_playMethod == 22 || txlfcd_playMethod == 33 || txlfcd_playMethod == 44 ){
		notes = 54;
	}else if(txlfcd_playMethod == 54 || txlfcd_playMethod == 61){
		notes = 9;
	}else if(txlfcd_playMethod == 51 || txlfcd_playMethod == 58){
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txlfcd"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(txlfcd_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,4);
	}else if(txlfcd_playMethod == 13|| txlfcd_playMethod == 64 || txlfcd_playMethod == 66 || txlfcd_playMethod == 68 || txlfcd_playMethod == 70 || txlfcd_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,2);
	}else if(txlfcd_playMethod == 37 || txlfcd_playMethod == 26 || txlfcd_playMethod == 15 || txlfcd_playMethod == 75 || txlfcd_playMethod == 77){
		notes = LotteryStorage["txlfcd"]["line1"].length *
			LotteryStorage["txlfcd"]["line2"].length *
			LotteryStorage["txlfcd"]["line3"].length ;
	}else if(txlfcd_playMethod == 39 || txlfcd_playMethod == 28 || txlfcd_playMethod == 17){
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txlfcd"]["line1"][i]);
		};
	}else if(txlfcd_playMethod == 41 || txlfcd_playMethod == 30 || txlfcd_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["txlfcd"]["line1"].length,2);
	}else if(txlfcd_playMethod == 42 || txlfcd_playMethod == 31 || txlfcd_playMethod == 20 || txlfcd_playMethod == 68 || txlfcd_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,3);
	}else if(txlfcd_playMethod == 43 || txlfcd_playMethod == 32 || txlfcd_playMethod == 21){
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txlfcd"]["line1"][i]);
		};
	}else if(txlfcd_playMethod == 48 || txlfcd_playMethod == 55 || txlfcd_playMethod == 74 || txlfcd_playMethod == 76){
		notes = LotteryStorage["txlfcd"]["line1"].length *
			LotteryStorage["txlfcd"]["line2"].length ;
	}else if(txlfcd_playMethod == 50 || txlfcd_playMethod == 57){
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txlfcd"]["line1"][i]);
		};
	}else if(txlfcd_playMethod == 52 || txlfcd_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,2);
	}else if(txlfcd_playMethod == 53 || txlfcd_playMethod == 60){
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txlfcd"]["line1"][i]);
		};
	}else if(txlfcd_playMethod == 62){
		notes = LotteryStorage["txlfcd"]["line1"].length +
			LotteryStorage["txlfcd"]["line2"].length +
			LotteryStorage["txlfcd"]["line3"].length +
			LotteryStorage["txlfcd"]["line4"].length +
			LotteryStorage["txlfcd"]["line5"].length;
	}else if(txlfcd_playType == 13 || txlfcd_playType == 14 || txlfcd_playMethod == 8 || txlfcd_playMethod == 71
		|| txlfcd_playMethod == 24 || txlfcd_playMethod == 25 || txlfcd_playMethod == 35 || txlfcd_playMethod == 36 || txlfcd_playMethod == 46
		|| txlfcd_playMethod == 47 || txlfcd_playMethod == 63 || txlfcd_playMethod == 65 || txlfcd_playMethod == 67 || txlfcd_playMethod == 69 ){
		notes = LotteryStorage["txlfcd"]["line1"].length ;
	}else if(txlfcd_playMethod == 78){
		notes = LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line2"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line3"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line4"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line3"].length +
			LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line4"].length +
			LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line4"].length +
			LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line4"].length * LotteryStorage["txlfcd"]["line5"].length;
	}else if (txlfcd_playMethod == 80) {
		if ($("#txlfcd_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txlfcd"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,2);
		}
	}else if (txlfcd_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,2) * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,2);
	}else if (txlfcd_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txlfcd"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,2);
	}else if (txlfcd_playMethod == 84) {
		notes = LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line3"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line4"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line4"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line4"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line4"].length +
			LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line4"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line4"].length * LotteryStorage["txlfcd"]["line5"].length ;
	}else if (txlfcd_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txlfcd"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,3);
	}else if (txlfcd_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["txlfcd"]["line1"].length,2) * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,3);
	}else if (txlfcd_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,3) * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,3);
	}else if (txlfcd_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["txlfcd"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txlfcd"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,3);
	}else if (txlfcd_playMethod == 93) {
		notes = LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line4"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line4"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line1"].length * LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line4"].length * LotteryStorage["txlfcd"]["line5"].length +
			LotteryStorage["txlfcd"]["line2"].length * LotteryStorage["txlfcd"]["line3"].length * LotteryStorage["txlfcd"]["line4"].length * LotteryStorage["txlfcd"]["line5"].length;
	}else if (txlfcd_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,4)
			* mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,4);
	}else if (txlfcd_playMethod == 96) {
		if (LotteryStorage["txlfcd"]["line1"].length >= 1 && LotteryStorage["txlfcd"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txlfcd"]["line1"],LotteryStorage["txlfcd"]["line2"])
				* mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (txlfcd_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["txlfcd"]["line1"].length,2) * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,4);
	}else if (txlfcd_playMethod == 98) {
		if (LotteryStorage["txlfcd"]["line1"].length >= 1 && LotteryStorage["txlfcd"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txlfcd"]["line1"],LotteryStorage["txlfcd"]["line2"]) * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = txlfcdValidData($("#txlfcd_single").val());
	}

	if(txlfcd_sntuo == 3 || txlfcd_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","txlfcd"),LotteryInfo.getMethodId("ssc",txlfcd_playMethod))){
	}else{
		if(parseInt($('#txlfcd_modeId').val()) == 8){
			$("#txlfcd_random").hide();
		}else{
			$("#txlfcd_random").show();
		}
	}

	//验证是否为空
	if( $("#txlfcd_beiNum").val() =="" || parseInt($("#txlfcd_beiNum").val()) == 0){
		$("#txlfcd_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#txlfcd_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#txlfcd_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#txlfcd_zhushu').text(notes);
		if($("#txlfcd_modeId").val() == "8"){
			$('#txlfcd_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcd_beiNum").val()),0.002));
		}else if ($("#txlfcd_modeId").val() == "2"){
			$('#txlfcd_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcd_beiNum").val()),0.2));
		}else if ($("#txlfcd_modeId").val() == "1"){
			$('#txlfcd_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcd_beiNum").val()),0.02));
		}else{
			$('#txlfcd_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcd_beiNum").val()),2));
		}
	} else {
		$('#txlfcd_zhushu').text(0);
		$('#txlfcd_money').text(0);
	}
	txlfcd_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('txlfcd',txlfcd_playMethod);
}

/**
 * [txlfcd_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function txlfcd_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#txlfcd_queding").bind('click', function(event) {
		txlfcd_rebate = $("#txlfcd_fandian option:first").val();
		if(parseInt($('#txlfcd_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		txlfcd_calcNotes();

		//设置单笔最低投注额为1元
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		//提示单挑奖金
		getDanTiaoBonus('txlfcd',txlfcd_playMethod);

		submitParams.lotteryType = "txlfcd";
		var play = LotteryInfo.getPlayName("ssc",txlfcd_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",txlfcd_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = txlfcd_playType;
		submitParams.playMethodIndex = txlfcd_playMethod;
		var selectedBalls = [];
		if(txlfcd_playMethod == 0 || txlfcd_playMethod == 3 || txlfcd_playMethod == 4
			|| txlfcd_playMethod == 5 || txlfcd_playMethod == 6 || txlfcd_playMethod == 7
			|| txlfcd_playMethod == 9 || txlfcd_playMethod == 12 || txlfcd_playMethod == 14
			|| txlfcd_playMethod == 37 || txlfcd_playMethod == 26 || txlfcd_playMethod == 15
			|| txlfcd_playMethod == 48 || txlfcd_playMethod == 55 || txlfcd_playMethod == 74 || txlfcd_playType == 9){
			$("#txlfcd_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(txlfcd_playMethod == 2 || txlfcd_playMethod == 8 || txlfcd_playMethod == 11 || txlfcd_playMethod == 13 || txlfcd_playMethod == 24
			|| txlfcd_playMethod == 39 || txlfcd_playMethod == 28 || txlfcd_playMethod == 17 || txlfcd_playMethod == 18 || txlfcd_playMethod == 25
			|| txlfcd_playMethod == 22 || txlfcd_playMethod == 33 || txlfcd_playMethod == 44 || txlfcd_playMethod == 54 || txlfcd_playMethod == 61
			|| txlfcd_playMethod == 41 || txlfcd_playMethod == 42 || txlfcd_playMethod == 43 || txlfcd_playMethod == 29 || txlfcd_playMethod == 35
			|| txlfcd_playMethod == 30 || txlfcd_playMethod == 31 || txlfcd_playMethod == 32 || txlfcd_playMethod == 40 || txlfcd_playMethod == 36
			|| txlfcd_playMethod == 19 || txlfcd_playMethod == 20 || txlfcd_playMethod == 21 || txlfcd_playMethod == 46 || txlfcd_playMethod == 47
			|| txlfcd_playMethod == 50 || txlfcd_playMethod == 57 || txlfcd_playType == 8 || txlfcd_playMethod == 51 || txlfcd_playMethod == 58
			|| txlfcd_playMethod == 52 || txlfcd_playMethod == 53|| txlfcd_playMethod == 59 || txlfcd_playMethod == 60 || txlfcd_playType == 13 || txlfcd_playType == 14){
			$("#txlfcd_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(txlfcd_playType == 7 || txlfcd_playMethod == 78 || txlfcd_playMethod == 84 || txlfcd_playMethod == 93){
			$("#txlfcd_ballView div.ballView").each(function(){
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
		}else if(txlfcd_playMethod == 80 || txlfcd_playMethod == 81 || txlfcd_playMethod == 83
			|| txlfcd_playMethod == 86 || txlfcd_playMethod == 87 || txlfcd_playMethod == 89
			|| txlfcd_playMethod == 92 || txlfcd_playMethod == 95 || txlfcd_playMethod == 97){
			$("#txlfcd_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#txlfcd_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txlfcd_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txlfcd_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txlfcd_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txlfcd_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (txlfcd_playMethod == 96 || txlfcd_playMethod == 98) {
			$("#txlfcd_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#txlfcd_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txlfcd_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txlfcd_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txlfcd_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txlfcd_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			var array = handleSingleStr($("#txlfcd_single").val());
			if(txlfcd_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(txlfcd_playMethod == 10 || txlfcd_playMethod == 38 || txlfcd_playMethod == 27
				|| txlfcd_playMethod == 16 || txlfcd_playMethod == 49 || txlfcd_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txlfcd_playMethod == 45 || txlfcd_playMethod == 34 || txlfcd_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txlfcd_playMethod == 79 || txlfcd_playMethod == 82 || txlfcd_playMethod == 85 || txlfcd_playMethod == 88 ||
				txlfcd_playMethod == 89 || txlfcd_playMethod == 90 || txlfcd_playMethod == 91 || txlfcd_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#txlfcd_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#txlfcd_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#txlfcd_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#txlfcd_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#txlfcd_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#txlfcd_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#txlfcd_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#txlfcd_fandian").val());
		submitParams.notes = $('#txlfcd_zhushu').html();
		submitParams.sntuo = txlfcd_sntuo;
		submitParams.multiple = $('#txlfcd_beiNum').val();  //requirement
		submitParams.rebates = $('#txlfcd_fandian').val();  //requirement
		submitParams.playMode = $('#txlfcd_modeId').val();  //requirement
		submitParams.money = $('#txlfcd_money').html();  //requirement
		submitParams.award = $('#txlfcd_minAward').html();  //奖金
		submitParams.maxAward = $('#txlfcd_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#txlfcd_ballView").empty();
		txlfcd_qingkongAll();
	});
}

/**
 * [txlfcd_randomOne 随机一注]
 * @return {[type]} [description]
 */
function txlfcd_randomOne(){
	txlfcd_qingkongAll();
	if(txlfcd_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["txlfcd"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txlfcd"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txlfcd"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txlfcd"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["txlfcd"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line2"], function(k, v){
			$("#" + "txlfcd_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line3"], function(k, v){
			$("#" + "txlfcd_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line4"], function(k, v){
			$("#" + "txlfcd_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line5"], function(k, v){
			$("#" + "txlfcd_line5" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["txlfcd"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["txlfcd"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txlfcd"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txlfcd"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txlfcd"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line2"], function(k, v){
			$("#" + "txlfcd_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line3"], function(k, v){
			$("#" + "txlfcd_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line4"], function(k, v){
			$("#" + "txlfcd_line4" + v).toggleClass("redBalls_active");
		});

	}else if(txlfcd_playMethod == 37 || txlfcd_playMethod == 26 || txlfcd_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["txlfcd"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txlfcd"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txlfcd"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line2"], function(k, v){
			$("#" + "txlfcd_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line3"], function(k, v){
			$("#" + "txlfcd_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 41 || txlfcd_playMethod == 30 || txlfcd_playMethod == 19 || txlfcd_playMethod == 68
		|| txlfcd_playMethod == 52 || txlfcd_playMethod == 64 || txlfcd_playMethod == 66
		|| txlfcd_playMethod == 59 || txlfcd_playMethod == 70 || txlfcd_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txlfcd"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 42 || txlfcd_playMethod == 31 || txlfcd_playMethod == 20 || txlfcd_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txlfcd"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 39 || txlfcd_playMethod == 28 || txlfcd_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["txlfcd"]["line1"].push(number+'');
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 43 || txlfcd_playMethod == 32 || txlfcd_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["txlfcd"]["line1"].push(number+'');
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 48 || txlfcd_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["txlfcd"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txlfcd"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line2"], function(k, v){
			$("#" + "txlfcd_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 25 || txlfcd_playMethod == 36 || txlfcd_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["txlfcd"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 50 || txlfcd_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["txlfcd"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 53 || txlfcd_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["txlfcd"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txlfcd"]["line"+line].push(number+"");
		$.each(LotteryStorage["txlfcd"]["line"+line], function(k, v){
			$("#" + "txlfcd_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 63 || txlfcd_playMethod == 67 || txlfcd_playMethod == 69 || txlfcd_playMethod == 71 || txlfcd_playType == 13
		|| txlfcd_playMethod == 65 || txlfcd_playMethod == 18 || txlfcd_playMethod == 29 || txlfcd_playMethod == 40 || txlfcd_playMethod == 22
		|| txlfcd_playMethod == 33 || txlfcd_playMethod == 44 || txlfcd_playMethod == 54 || txlfcd_playMethod == 61
		|| txlfcd_playMethod == 24 || txlfcd_playMethod == 35 || txlfcd_playMethod == 46 || txlfcd_playMethod == 51 || txlfcd_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txlfcd"]["line1"].push(number+'');
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 74 || txlfcd_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["txlfcd"]["line1"].push(array[0]+"");
		LotteryStorage["txlfcd"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line2"], function(k, v){
			$("#" + "txlfcd_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 75 || txlfcd_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["txlfcd"]["line1"].push(array[0]+"");
		LotteryStorage["txlfcd"]["line2"].push(array[1]+"");
		LotteryStorage["txlfcd"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line2"], function(k, v){
			$("#" + "txlfcd_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line3"], function(k, v){
			$("#" + "txlfcd_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["txlfcd"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txlfcd"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["txlfcd"]["line"+lines[0]], function(k, v){
			$("#" + "txlfcd_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line"+lines[1]], function(k, v){
			$("#" + "txlfcd_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["txlfcd"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txlfcd"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txlfcd"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["txlfcd"]["line"+lines[0]], function(k, v){
			$("#" + "txlfcd_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line"+lines[1]], function(k, v){
			$("#" + "txlfcd_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line"+lines[0]], function(k, v){
			$("#" + "txlfcd_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["txlfcd"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txlfcd"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txlfcd"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["txlfcd"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["txlfcd"]["line"+lines[0]], function(k, v){
			$("#" + "txlfcd_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line"+lines[1]], function(k, v){
			$("#" + "txlfcd_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line"+lines[2]], function(k, v){
			$("#" + "txlfcd_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcd"]["line"+lines[3]], function(k, v){
			$("#" + "txlfcd_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(txlfcd_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["txlfcd"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcd"]["line1"], function(k, v){
			$("#" + "txlfcd_line1" + v).toggleClass("redBalls_active");
		});
	}
	txlfcd_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function txlfcd_checkOutRandom(playMethod){
	var obj = new Object();
	if(txlfcd_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txlfcd_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txlfcd_playMethod == 18 || txlfcd_playMethod == 29 || txlfcd_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(txlfcd_playMethod == 22 || txlfcd_playMethod == 33 || txlfcd_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(txlfcd_playMethod == 54 || txlfcd_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(txlfcd_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txlfcd_playMethod == 37 || txlfcd_playMethod == 26 || txlfcd_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txlfcd_playMethod == 39 || txlfcd_playMethod == 28 || txlfcd_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(txlfcd_playMethod == 41 || txlfcd_playMethod == 30 || txlfcd_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(txlfcd_playMethod == 52 || txlfcd_playMethod == 59 || txlfcd_playMethod == 64 || txlfcd_playMethod == 66 || txlfcd_playMethod == 68
		||txlfcd_playMethod == 70 || txlfcd_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txlfcd_playMethod == 42 || txlfcd_playMethod == 31 || txlfcd_playMethod == 20 || txlfcd_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txlfcd_playMethod == 43 || txlfcd_playMethod == 32 || txlfcd_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(txlfcd_playMethod == 48 || txlfcd_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txlfcd_playMethod == 50 || txlfcd_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(txlfcd_playMethod == 53 || txlfcd_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(txlfcd_playMethod == 62){
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
	}else if(txlfcd_playMethod == 63 || txlfcd_playMethod == 65 || txlfcd_playMethod == 67 || txlfcd_playMethod == 69 || txlfcd_playMethod == 71
		|| txlfcd_playMethod == 24 || txlfcd_playMethod == 35 || txlfcd_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(txlfcd_playMethod == 25 || txlfcd_playMethod == 36 || txlfcd_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txlfcd_playMethod == 51 || txlfcd_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(txlfcd_playMethod == 74 || txlfcd_playMethod == 76){
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
	}else if(txlfcd_playMethod == 75 || txlfcd_playMethod == 77){
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
	}else if(txlfcd_playMethod == 78){
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
	}else if(txlfcd_playMethod == 84){
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
	}else if(txlfcd_playMethod == 93){
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
	obj.sntuo = txlfcd_sntuo;
	obj.multiple = 1;
	obj.rebates = txlfcd_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('txlfcd',txlfcd_playMethod,obj);  //机选奖金计算
	obj.award = $('#txlfcd_minAward').html();     //奖金
	obj.maxAward = $('#txlfcd_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [txlfcdValidateData 单式数据验证]
 */
function txlfcdValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#txlfcd_single").val();
	textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	txlfcdValidData(textStr,type);
}

function txlfcdValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(txlfcd_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 38 || txlfcd_playMethod == 27 || txlfcd_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 45 || txlfcd_playMethod == 34 || txlfcd_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 49 || txlfcd_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,2);
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,2);
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,3);
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,3);
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,3);
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,3);
		txlfcdShowFooter(true,notes);
	}else if(txlfcd_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcd_tab .button.red").size() ,4);
		txlfcdShowFooter(true,notes);
	}

	$('#txlfcd_delRepeat').off('click');
	$('#txlfcd_delRepeat').on('click',function () {
		content.str = $('#txlfcd_single').val() ? $('#txlfcd_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		txlfcdShowFooter(true,notes);
		$("#txlfcd_single").val(array.join(" "));
	});

	$("#txlfcd_single").val(array.join(" "));
	return notes;
}

function txlfcdShowFooter(isValid,notes){
	$('#txlfcd_zhushu').text(notes);
	if($("#txlfcd_modeId").val() == "8"){
		$('#txlfcd_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcd_beiNum").val()),0.002));
	}else if ($("#txlfcd_modeId").val() == "2"){
		$('#txlfcd_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcd_beiNum").val()),0.2));
	}else if ($("#txlfcd_modeId").val() == "1"){
		$('#txlfcd_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcd_beiNum").val()),0.02));
	}else{
		$('#txlfcd_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcd_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	txlfcd_initFooterButton();
	calcAwardWin('txlfcd',txlfcd_playMethod);  //计算奖金和盈利
}