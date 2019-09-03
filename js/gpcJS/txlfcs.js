var txlfcs_playType = 2;
var txlfcs_playMethod = 15;
var txlfcs_sntuo = 0;
var txlfcs_rebate;
var txlfcsScroll;

//进入这个页面时调用
function txlfcsPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("txlfcs")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("txlfcs_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function txlfcsPageUnloadedPanel(){
	$("#txlfcs_queding").off('click');
	$("#txlfcsPage_back").off('click');
	$("#txlfcs_ballView").empty();
	$("#txlfcsSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="txlfcsPlaySelect"></select>');
	$("#txlfcsSelect").append($select);
}

//入口函数
function txlfcs_init(){
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
	$("#txlfcs_title").html(LotteryInfo.getLotteryNameByTag("txlfcs"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == txlfcs_playType && j == txlfcs_playMethod){
					$play.append('<option value="txlfcs'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="txlfcs'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(txlfcs_playMethod,onShowArray)>-1 ){
						txlfcs_playType = i;
						txlfcs_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#txlfcsPlaySelect").append($play);
		}
	}
	
	if($("#txlfcsPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("txlfcsSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:txlfcsChangeItem
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

	GetLotteryInfo("txlfcs",function (){
		txlfcsChangeItem("txlfcs"+txlfcs_playMethod);
	});

	//添加滑动条
	if(!txlfcsScroll){
		txlfcsScroll = new IScroll('#txlfcsContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("txlfcs",LotteryInfo.getLotteryIdByTag("txlfcs"));

	//获取上一期开奖
	queryLastPrize("txlfcs");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('txlfcs');

	//机选选号
	$("#txlfcs_random").on('click', function(event) {
		txlfcs_randomOne();
	});

	//返回
	$("#txlfcsPage_back").on('click', function(event) {
//		txlfcs_playType = 2;
//		txlfcs_playMethod = 15;
		$("#txlfcs_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		txlfcs_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#txlfcs_shuoming").html(LotteryInfo.getMethodShuoming("ssc",txlfcs_playMethod));
	//玩法说明
	$("#txlfcs_paly_shuoming").off('click');
	$("#txlfcs_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#txlfcs_shuoming").text());
	});

	qingKong("txlfcs");//清空
	txlfcs_submitData();
}

function txlfcsResetPlayType(){
	txlfcs_playType = 2;
	txlfcs_playMethod = 15;
}

function txlfcsChangeItem(val) {
	txlfcs_qingkongAll();
	var temp = val.substring("txlfcs".length,val.length);
	if(val == "txlfcs0"){
		//直选复式
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 0;
		txlfcs_playMethod = 0;
		createFiveLineLayout("txlfcs", function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs1"){
		//直选单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 0;
		txlfcs_playMethod = 1;
		$("#txlfcs_ballView").empty();
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs2"){
		//组选120
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 0;
		txlfcs_playMethod = 2;
		createOneLineLayout("txlfcs","至少选择5个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs3"){
		//组选60
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 0;
		txlfcs_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs4"){
		//组选30
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 0;
		txlfcs_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs5"){
		//组选20
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 0;
		txlfcs_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs6"){
		//组选10
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 0;
		txlfcs_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs7"){
		//组选5
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 0;
		txlfcs_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs8"){
		//总和大小单双
		$("#txlfcs_random").show();
		var num = ["大","小","单","双"];
		txlfcs_sntuo = 0;
		txlfcs_playType = 0;
		txlfcs_playMethod = 8;
		createNonNumLayout("txlfcs",txlfcs_playMethod,num,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs9"){
		//直选复式
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 1;
		txlfcs_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("txlfcs",tips, function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs10"){
		//直选单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 1;
		txlfcs_playMethod = 10;
		$("#txlfcs_ballView").empty();
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs11"){
		//组选24
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 1;
		txlfcs_playMethod = 11;
		createOneLineLayout("txlfcs","至少选择4个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs12"){
		//组选12
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 1;
		txlfcs_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs13"){
		//组选6
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 1;
		txlfcs_playMethod = 13;
		createOneLineLayout("txlfcs","二重号:至少选择2个号码",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs14"){
		//组选4
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 1;
		txlfcs_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs15"){
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs16"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 2;
		txlfcs_playMethod = 16;
		$("#txlfcs_ballView").empty();
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs17"){
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 17;
		createSumLayout("txlfcs",0,27,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs18"){
		//直选跨度
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 18;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs19"){
		//后三组三
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 19;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs20"){
		//后三组六
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 20;
		createOneLineLayout("txlfcs","至少选择3个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs21"){
		//后三和值
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 21;
		createSumLayout("txlfcs",1,26,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs22"){
		//后三组选包胆
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 22;
		txlfcs_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcs",array,["请选择一个号码"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs23"){
		//后三混合组选
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 2;
		txlfcs_playMethod = 23;
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs24"){
		//和值尾数
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 24;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs25"){
		//特殊号
		$("#txlfcs_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txlfcs_sntuo = 0;
		txlfcs_playType = 2;
		txlfcs_playMethod = 25;
		createNonNumLayout("txlfcs",txlfcs_playMethod,num,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs26"){
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs27"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 3;
		txlfcs_playMethod = 27;
		$("#txlfcs_ballView").empty();
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs28"){
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 28;
		createSumLayout("txlfcs",0,27,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs29"){
		//直选跨度
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 29;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs30"){
		//中三组三
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 30;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs31"){
		//中三组六
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 31;
		createOneLineLayout("txlfcs","至少选择3个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs32"){
		//中三和值
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 32;
		createSumLayout("txlfcs",1,26,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs33"){
		//中三组选包胆
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 33;
		txlfcs_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcs",array,["请选择一个号码"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs34"){
		//中三混合组选
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 3;
		txlfcs_playMethod = 34;
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs35"){
		//和值尾数
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 35;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs36"){
		//特殊号
		$("#txlfcs_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txlfcs_sntuo = 0;
		txlfcs_playType = 3;
		txlfcs_playMethod = 36;
		createNonNumLayout("txlfcs",txlfcs_playMethod,num,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs37"){
		//直选复式
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs38"){
		//直选单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 4;
		txlfcs_playMethod = 38;
		$("#txlfcs_ballView").empty();
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs39"){
		//和值
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 39;
		createSumLayout("txlfcs",0,27,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs40"){
		//直选跨度
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 40;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs41"){
		//前三组三
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 41;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs42"){
		//前三组六
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 42;
		createOneLineLayout("txlfcs","至少选择3个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs43"){
		//前三和值
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 43;
		createSumLayout("txlfcs",1,26,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs44"){
		//前三组选包胆
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 44;
		txlfcs_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcs",array,["请选择一个号码"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs45"){
		//前三混合组选
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 4;
		txlfcs_playMethod = 45;
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs46"){
		//和值尾数
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 46;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs47"){
		//特殊号
		$("#txlfcs_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		txlfcs_sntuo = 0;
		txlfcs_playType = 4;
		txlfcs_playMethod = 47;
		createNonNumLayout("txlfcs",txlfcs_playMethod,num,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs48"){
		//后二复式
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 5;
		txlfcs_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs49"){
		//后二单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 5;
		txlfcs_playMethod = 49;
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs50"){
		//后二和值
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 5;
		txlfcs_playMethod = 50;
		createSumLayout("txlfcs",0,18,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs51"){
		//直选跨度
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 5;
		txlfcs_playMethod = 51;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs52"){
		//后二组选
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 5;
		txlfcs_playMethod = 52;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs53"){
		//后二和值
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 5;
		txlfcs_playMethod = 53;
		createSumLayout("txlfcs",1,17,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs54"){
		//后二组选包胆
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 5;
		txlfcs_playMethod = 54;
		txlfcs_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcs",array,["请选择一个号码"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs55"){
		//前二复式
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 6;
		txlfcs_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs56"){
		//前二单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 6;
		txlfcs_playMethod = 56;
		txlfcs_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
	}else if(val == "txlfcs57"){
		//前二和值
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 6;
		txlfcs_playMethod = 57;
		createSumLayout("txlfcs",0,18,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs58"){
		//直选跨度
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 6;
		txlfcs_playMethod = 58;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs59"){
		//前二组选
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 6;
		txlfcs_playMethod = 59;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs60"){
		//前二和值
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 6;
		txlfcs_playMethod = 60;
		createSumLayout("txlfcs",1,17,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs61"){
		//前二组选包胆
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 6;
		txlfcs_playMethod = 61;
		txlfcs_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("txlfcs",array,["请选择一个号码"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs62"){
		//定位复式
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 7;
		txlfcs_playMethod = 62;
		createFiveLineLayout("txlfcs", function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs63"){
		//后三一码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 63;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs64"){
		//后三二码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 64;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs65"){
		//前三一码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 65;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs66"){
		//前三二码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 66;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs67"){
		//后四一码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 67;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs68"){
		//后四二码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 68;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs69"){
		//前四一码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 69;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs70"){
		//前四二码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 70;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs71"){
		//五星一码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 71;
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs72"){
		//五星二码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 72;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs73"){
		//五星三码
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 8;
		txlfcs_playMethod = 73;
		createOneLineLayout("txlfcs","至少选择3个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs74"){
		//后二大小单双
		txlfcs_qingkongAll();
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 9;
		txlfcs_playMethod = 74;
		createTextBallTwoLayout("txlfcs",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs75"){
		//后三大小单双
		txlfcs_qingkongAll();
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 9;
		txlfcs_playMethod = 75;
		createTextBallThreeLayout("txlfcs",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs76"){
		//前二大小单双
		txlfcs_qingkongAll();
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 9;
		txlfcs_playMethod = 76;
		createTextBallTwoLayout("txlfcs",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs77"){
		//前三大小单双
		txlfcs_qingkongAll();
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 9;
		txlfcs_playMethod = 77;
		createTextBallThreeLayout("txlfcs",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs78"){
		//直选复式
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 10;
		txlfcs_playMethod = 78;
		createFiveLineLayout("txlfcs",function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs79"){
		//直选单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 10;
		txlfcs_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
		createRenXuanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs80"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 10;
		txlfcs_playMethod = 80;
		createSumLayout("txlfcs",0,18,function(){
			txlfcs_calcNotes();
		});
		createRenXuanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs81"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 10;
		txlfcs_playMethod = 81;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		createRenXuanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs82"){
		//组选单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 10;
		txlfcs_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
		createRenXuanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs83"){
		//组选和值
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 10;
		txlfcs_playMethod = 83;
		createSumLayout("txlfcs",1,17,function(){
			txlfcs_calcNotes();
		});
		createRenXuanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs84"){
		//直选复式
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 11;
		txlfcs_playMethod = 84;
		createFiveLineLayout("txlfcs", function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs85"){
		//直选单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 11;
		txlfcs_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
		createRenXuanSanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs86"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 11;
		txlfcs_playMethod = 86;
		createSumLayout("txlfcs",0,27,function(){
			txlfcs_calcNotes();
		});
		createRenXuanSanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs87"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 11;
		txlfcs_playMethod = 87;
		createOneLineLayout("txlfcs","至少选择2个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		createRenXuanSanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs88"){
		//组选单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 11;
		txlfcs_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
		createRenXuanSanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs89"){
		//组选和值
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 11;
		txlfcs_playMethod = 89;
		createOneLineLayout("txlfcs","至少选择3个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		createRenXuanSanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs90"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 11;
		txlfcs_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
		createRenXuanSanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs91"){
		//混合组选
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 11;
		txlfcs_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
		createRenXuanSanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs92"){
		//组选和值
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 11;
		txlfcs_playMethod = 92;
		createSumLayout("txlfcs",1,26,function(){
			txlfcs_calcNotes();
		});
		createRenXuanSanLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs93"){
		$("#txlfcs_random").show();
		txlfcs_sntuo = 0;
		txlfcs_playType = 12;
		txlfcs_playMethod = 93;
		createFiveLineLayout("txlfcs", function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs94"){
		//直选单式
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 3;
		txlfcs_playType = 12;
		txlfcs_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("txlfcs",tips);
		createRenXuanSiLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs95"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 12;
		txlfcs_playMethod = 95;
		createOneLineLayout("txlfcs","至少选择4个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		createRenXuanSiLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs96"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 12;
		txlfcs_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		createRenXuanSiLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs97"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 12;
		txlfcs_playMethod = 97;
		$("#txlfcs_ballView").empty();
		createOneLineLayout("txlfcs","二重号:至少选择2个号码",0,9,false,function(){
			txlfcs_calcNotes();
		});
		createRenXuanSiLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs98"){
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 12;
		txlfcs_playMethod = 98;
		$("#txlfcs_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("txlfcs",tips,0,9,false,function(){
			txlfcs_calcNotes();
		});
		createRenXuanSiLayout("txlfcs",txlfcs_playMethod,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs99"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 13;
		txlfcs_playMethod = 99;
		$("#txlfcs_ballView").empty();
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs100"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 13;
		txlfcs_playMethod = 100;
		$("#txlfcs_ballView").empty();
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs101"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 13;
		txlfcs_playMethod = 101;
		$("#txlfcs_ballView").empty();
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs102"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 13;
		txlfcs_playMethod = 102;
		$("#txlfcs_ballView").empty();
		createOneLineLayout("txlfcs","至少选择1个",0,9,false,function(){
			txlfcs_calcNotes();
		});
		txlfcs_qingkongAll();
	}else if(val == "txlfcs103"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 103;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs104"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 104;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs105"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 105;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs106"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 106;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs107"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 107;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs108"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 108;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs109"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 109;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs110"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 110;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs111"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 111;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}else if(val == "txlfcs112"){
		txlfcs_qingkongAll();
		$("#txlfcs_random").hide();
		txlfcs_sntuo = 0;
		txlfcs_playType = 14;
		txlfcs_playMethod = 112;
		createTextBallOneLayout("txlfcs",["龙","虎","和"],["至少选择一个"],function(){
			txlfcs_calcNotes();
		});
	}

	if(txlfcsScroll){
		txlfcsScroll.refresh();
		txlfcsScroll.scrollTo(0,0,1);
	}
	
	$("#txlfcs_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("txlfcs",temp);
	hideRandomWhenLi("txlfcs",txlfcs_sntuo,txlfcs_playMethod);
	txlfcs_calcNotes();
}
/**
 * [txlfcs_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function txlfcs_initFooterButton(){
	if(txlfcs_playMethod == 0 || txlfcs_playMethod == 62 || txlfcs_playMethod == 78
		|| txlfcs_playMethod == 84 || txlfcs_playMethod == 93 || txlfcs_playType == 7){
		if(LotteryStorage["txlfcs"]["line1"].length > 0 || LotteryStorage["txlfcs"]["line2"].length > 0 ||
			LotteryStorage["txlfcs"]["line3"].length > 0 || LotteryStorage["txlfcs"]["line4"].length > 0 ||
			LotteryStorage["txlfcs"]["line5"].length > 0){
			$("#txlfcs_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcs_qingkong").css("opacity",0.4);
		}
	}else if(txlfcs_playMethod == 9){
		if(LotteryStorage["txlfcs"]["line1"].length > 0 || LotteryStorage["txlfcs"]["line2"].length > 0 ||
			LotteryStorage["txlfcs"]["line3"].length > 0 || LotteryStorage["txlfcs"]["line4"].length > 0 ){
			$("#txlfcs_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcs_qingkong").css("opacity",0.4);
		}
	}else if(txlfcs_playMethod == 37 || txlfcs_playMethod == 4 || txlfcs_playMethod == 6
		|| txlfcs_playMethod == 26 || txlfcs_playMethod == 15 || txlfcs_playMethod == 75 || txlfcs_playMethod == 77){
		if(LotteryStorage["txlfcs"]["line1"].length > 0 || LotteryStorage["txlfcs"]["line2"].length > 0
			|| LotteryStorage["txlfcs"]["line3"].length > 0){
			$("#txlfcs_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcs_qingkong").css("opacity",0.4);
		}
	}else if(txlfcs_playMethod == 3 || txlfcs_playMethod == 4 || txlfcs_playMethod == 5
		|| txlfcs_playMethod == 6 || txlfcs_playMethod == 7 || txlfcs_playMethod == 12
		|| txlfcs_playMethod == 14 || txlfcs_playMethod == 48 || txlfcs_playMethod == 55
		|| txlfcs_playMethod == 74 || txlfcs_playMethod == 76 || txlfcs_playMethod == 96 || txlfcs_playMethod == 98){
		if(LotteryStorage["txlfcs"]["line1"].length > 0 || LotteryStorage["txlfcs"]["line2"].length > 0){
			$("#txlfcs_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcs_qingkong").css("opacity",0.4);
		}
	}else if(txlfcs_playMethod == 2 || txlfcs_playMethod == 8 || txlfcs_playMethod == 11 || txlfcs_playMethod == 13 || txlfcs_playMethod == 39
		|| txlfcs_playMethod == 28 || txlfcs_playMethod == 17 || txlfcs_playMethod == 18 || txlfcs_playMethod == 24 || txlfcs_playMethod == 41
		|| txlfcs_playMethod == 25 || txlfcs_playMethod == 29 || txlfcs_playMethod == 42 || txlfcs_playMethod == 43 || txlfcs_playMethod == 30
		|| txlfcs_playMethod == 35 || txlfcs_playMethod == 36 || txlfcs_playMethod == 31 || txlfcs_playMethod == 32 || txlfcs_playMethod == 19
		|| txlfcs_playMethod == 40 || txlfcs_playMethod == 46 || txlfcs_playMethod == 20 || txlfcs_playMethod == 21 || txlfcs_playMethod == 50
		|| txlfcs_playMethod == 47 || txlfcs_playMethod == 51 || txlfcs_playMethod == 52 || txlfcs_playMethod == 53 || txlfcs_playMethod == 57 || txlfcs_playMethod == 63
		|| txlfcs_playMethod == 58 || txlfcs_playMethod == 59 || txlfcs_playMethod == 60 || txlfcs_playMethod == 65 || txlfcs_playMethod == 80 || txlfcs_playMethod == 81 || txlfcs_playType == 8
		|| txlfcs_playMethod == 83 || txlfcs_playMethod == 86 || txlfcs_playMethod == 87 || txlfcs_playMethod == 22 || txlfcs_playMethod == 33 || txlfcs_playMethod == 44
		|| txlfcs_playMethod == 89 || txlfcs_playMethod == 92 || txlfcs_playMethod == 95 || txlfcs_playMethod == 54 || txlfcs_playMethod == 61
		|| txlfcs_playMethod == 97 || txlfcs_playType == 13  || txlfcs_playType == 14){
		if(LotteryStorage["txlfcs"]["line1"].length > 0){
			$("#txlfcs_qingkong").css("opacity",1.0);
		}else{
			$("#txlfcs_qingkong").css("opacity",0.4);
		}
	}else{
		$("#txlfcs_qingkong").css("opacity",0);
	}

	if($("#txlfcs_qingkong").css("opacity") == "0"){
		$("#txlfcs_qingkong").css("display","none");
	}else{
		$("#txlfcs_qingkong").css("display","block");
	}

	if($('#txlfcs_zhushu').html() > 0){
		$("#txlfcs_queding").css("opacity",1.0);
	}else{
		$("#txlfcs_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  txlfcs_qingkongAll(){
	$("#txlfcs_ballView span").removeClass('redBalls_active');
	LotteryStorage["txlfcs"]["line1"] = [];
	LotteryStorage["txlfcs"]["line2"] = [];
	LotteryStorage["txlfcs"]["line3"] = [];
	LotteryStorage["txlfcs"]["line4"] = [];
	LotteryStorage["txlfcs"]["line5"] = [];

	localStorageUtils.removeParam("txlfcs_line1");
	localStorageUtils.removeParam("txlfcs_line2");
	localStorageUtils.removeParam("txlfcs_line3");
	localStorageUtils.removeParam("txlfcs_line4");
	localStorageUtils.removeParam("txlfcs_line5");

	$('#txlfcs_zhushu').text(0);
	$('#txlfcs_money').text(0);
	clearAwardWin("txlfcs");
	txlfcs_initFooterButton();
}

/**
 * [txlfcs_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function txlfcs_calcNotes(){
	$('#txlfcs_modeId').blur();
	$('#txlfcs_fandian').blur();
	
	var notes = 0;

	if(txlfcs_playMethod == 0){
		notes = LotteryStorage["txlfcs"]["line1"].length *
			LotteryStorage["txlfcs"]["line2"].length *
			LotteryStorage["txlfcs"]["line3"].length *
			LotteryStorage["txlfcs"]["line4"].length *
			LotteryStorage["txlfcs"]["line5"].length;
	}else if(txlfcs_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,5);
	}else if(txlfcs_playMethod == 3){
		if (LotteryStorage["txlfcs"]["line1"].length >= 1 && LotteryStorage["txlfcs"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["txlfcs"]["line1"],LotteryStorage["txlfcs"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txlfcs_playMethod == 4){
		if (LotteryStorage["txlfcs"]["line1"].length >= 2 && LotteryStorage["txlfcs"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["txlfcs"]["line2"],LotteryStorage["txlfcs"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(txlfcs_playMethod == 5 || txlfcs_playMethod == 12){
		if (LotteryStorage["txlfcs"]["line1"].length >= 1 && LotteryStorage["txlfcs"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txlfcs"]["line1"],LotteryStorage["txlfcs"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txlfcs_playMethod == 6 || txlfcs_playMethod == 7 || txlfcs_playMethod == 14){
		if (LotteryStorage["txlfcs"]["line1"].length >= 1 && LotteryStorage["txlfcs"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txlfcs"]["line1"],LotteryStorage["txlfcs"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(txlfcs_playMethod == 9){
		notes = LotteryStorage["txlfcs"]["line1"].length *
			LotteryStorage["txlfcs"]["line2"].length *
			LotteryStorage["txlfcs"]["line3"].length *
			LotteryStorage["txlfcs"]["line4"].length;
	}else if(txlfcs_playMethod == 18 || txlfcs_playMethod == 29 || txlfcs_playMethod == 40){
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txlfcs"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(txlfcs_playMethod == 22 || txlfcs_playMethod == 33 || txlfcs_playMethod == 44 ){
		notes = 54;
	}else if(txlfcs_playMethod == 54 || txlfcs_playMethod == 61){
		notes = 9;
	}else if(txlfcs_playMethod == 51 || txlfcs_playMethod == 58){
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["txlfcs"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(txlfcs_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,4);
	}else if(txlfcs_playMethod == 13|| txlfcs_playMethod == 64 || txlfcs_playMethod == 66 || txlfcs_playMethod == 68 || txlfcs_playMethod == 70 || txlfcs_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,2);
	}else if(txlfcs_playMethod == 37 || txlfcs_playMethod == 26 || txlfcs_playMethod == 15 || txlfcs_playMethod == 75 || txlfcs_playMethod == 77){
		notes = LotteryStorage["txlfcs"]["line1"].length *
			LotteryStorage["txlfcs"]["line2"].length *
			LotteryStorage["txlfcs"]["line3"].length ;
	}else if(txlfcs_playMethod == 39 || txlfcs_playMethod == 28 || txlfcs_playMethod == 17){
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txlfcs"]["line1"][i]);
		};
	}else if(txlfcs_playMethod == 41 || txlfcs_playMethod == 30 || txlfcs_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["txlfcs"]["line1"].length,2);
	}else if(txlfcs_playMethod == 42 || txlfcs_playMethod == 31 || txlfcs_playMethod == 20 || txlfcs_playMethod == 68 || txlfcs_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,3);
	}else if(txlfcs_playMethod == 43 || txlfcs_playMethod == 32 || txlfcs_playMethod == 21){
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txlfcs"]["line1"][i]);
		};
	}else if(txlfcs_playMethod == 48 || txlfcs_playMethod == 55 || txlfcs_playMethod == 74 || txlfcs_playMethod == 76){
		notes = LotteryStorage["txlfcs"]["line1"].length *
			LotteryStorage["txlfcs"]["line2"].length ;
	}else if(txlfcs_playMethod == 50 || txlfcs_playMethod == 57){
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txlfcs"]["line1"][i]);
		};
	}else if(txlfcs_playMethod == 52 || txlfcs_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,2);
	}else if(txlfcs_playMethod == 53 || txlfcs_playMethod == 60){
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txlfcs"]["line1"][i]);
		};
	}else if(txlfcs_playMethod == 62){
		notes = LotteryStorage["txlfcs"]["line1"].length +
			LotteryStorage["txlfcs"]["line2"].length +
			LotteryStorage["txlfcs"]["line3"].length +
			LotteryStorage["txlfcs"]["line4"].length +
			LotteryStorage["txlfcs"]["line5"].length;
	}else if(txlfcs_playType == 13 || txlfcs_playType == 14 || txlfcs_playMethod == 8 || txlfcs_playMethod == 71
		|| txlfcs_playMethod == 24 || txlfcs_playMethod == 25 || txlfcs_playMethod == 35 || txlfcs_playMethod == 36 || txlfcs_playMethod == 46
		|| txlfcs_playMethod == 47 || txlfcs_playMethod == 63 || txlfcs_playMethod == 65 || txlfcs_playMethod == 67 || txlfcs_playMethod == 69 ){
		notes = LotteryStorage["txlfcs"]["line1"].length ;
	}else if(txlfcs_playMethod == 78){
		notes = LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line2"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line3"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line4"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line3"].length +
			LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line4"].length +
			LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line4"].length +
			LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line4"].length * LotteryStorage["txlfcs"]["line5"].length;
	}else if (txlfcs_playMethod == 80) {
		if ($("#txlfcs_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["txlfcs"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,2);
		}
	}else if (txlfcs_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,2) * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,2);
	}else if (txlfcs_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["txlfcs"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,2);
	}else if (txlfcs_playMethod == 84) {
		notes = LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line3"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line4"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line4"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line4"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line4"].length +
			LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line4"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line4"].length * LotteryStorage["txlfcs"]["line5"].length ;
	}else if (txlfcs_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["txlfcs"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,3);
	}else if (txlfcs_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["txlfcs"]["line1"].length,2) * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,3);
	}else if (txlfcs_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,3) * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,3);
	}else if (txlfcs_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["txlfcs"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["txlfcs"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,3);
	}else if (txlfcs_playMethod == 93) {
		notes = LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line4"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line4"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line1"].length * LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line4"].length * LotteryStorage["txlfcs"]["line5"].length +
			LotteryStorage["txlfcs"]["line2"].length * LotteryStorage["txlfcs"]["line3"].length * LotteryStorage["txlfcs"]["line4"].length * LotteryStorage["txlfcs"]["line5"].length;
	}else if (txlfcs_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,4)
			* mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,4);
	}else if (txlfcs_playMethod == 96) {
		if (LotteryStorage["txlfcs"]["line1"].length >= 1 && LotteryStorage["txlfcs"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["txlfcs"]["line1"],LotteryStorage["txlfcs"]["line2"])
				* mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (txlfcs_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["txlfcs"]["line1"].length,2) * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,4);
	}else if (txlfcs_playMethod == 98) {
		if (LotteryStorage["txlfcs"]["line1"].length >= 1 && LotteryStorage["txlfcs"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["txlfcs"]["line1"],LotteryStorage["txlfcs"]["line2"]) * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = txlfcsValidData($("#txlfcs_single").val());
	}

	if(txlfcs_sntuo == 3 || txlfcs_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","txlfcs"),LotteryInfo.getMethodId("ssc",txlfcs_playMethod))){
	}else{
		if(parseInt($('#txlfcs_modeId').val()) == 8){
			$("#txlfcs_random").hide();
		}else{
			$("#txlfcs_random").show();
		}
	}

	//验证是否为空
	if( $("#txlfcs_beiNum").val() =="" || parseInt($("#txlfcs_beiNum").val()) == 0){
		$("#txlfcs_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#txlfcs_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#txlfcs_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#txlfcs_zhushu').text(notes);
		if($("#txlfcs_modeId").val() == "8"){
			$('#txlfcs_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcs_beiNum").val()),0.002));
		}else if ($("#txlfcs_modeId").val() == "2"){
			$('#txlfcs_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcs_beiNum").val()),0.2));
		}else if ($("#txlfcs_modeId").val() == "1"){
			$('#txlfcs_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcs_beiNum").val()),0.02));
		}else{
			$('#txlfcs_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcs_beiNum").val()),2));
		}
	} else {
		$('#txlfcs_zhushu').text(0);
		$('#txlfcs_money').text(0);
	}
	txlfcs_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('txlfcs',txlfcs_playMethod);
}

/**
 * [txlfcs_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function txlfcs_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#txlfcs_queding").bind('click', function(event) {
		txlfcs_rebate = $("#txlfcs_fandian option:first").val();
		if(parseInt($('#txlfcs_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		txlfcs_calcNotes();

		//设置单笔最低投注额为1元
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		//提示单挑奖金
		getDanTiaoBonus('txlfcs',txlfcs_playMethod);

		submitParams.lotteryType = "txlfcs";
		var play = LotteryInfo.getPlayName("ssc",txlfcs_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",txlfcs_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = txlfcs_playType;
		submitParams.playMethodIndex = txlfcs_playMethod;
		var selectedBalls = [];
		if(txlfcs_playMethod == 0 || txlfcs_playMethod == 3 || txlfcs_playMethod == 4
			|| txlfcs_playMethod == 5 || txlfcs_playMethod == 6 || txlfcs_playMethod == 7
			|| txlfcs_playMethod == 9 || txlfcs_playMethod == 12 || txlfcs_playMethod == 14
			|| txlfcs_playMethod == 37 || txlfcs_playMethod == 26 || txlfcs_playMethod == 15
			|| txlfcs_playMethod == 48 || txlfcs_playMethod == 55 || txlfcs_playMethod == 74 || txlfcs_playType == 9){
			$("#txlfcs_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(txlfcs_playMethod == 2 || txlfcs_playMethod == 8 || txlfcs_playMethod == 11 || txlfcs_playMethod == 13 || txlfcs_playMethod == 24
			|| txlfcs_playMethod == 39 || txlfcs_playMethod == 28 || txlfcs_playMethod == 17 || txlfcs_playMethod == 18 || txlfcs_playMethod == 25
			|| txlfcs_playMethod == 22 || txlfcs_playMethod == 33 || txlfcs_playMethod == 44 || txlfcs_playMethod == 54 || txlfcs_playMethod == 61
			|| txlfcs_playMethod == 41 || txlfcs_playMethod == 42 || txlfcs_playMethod == 43 || txlfcs_playMethod == 29 || txlfcs_playMethod == 35
			|| txlfcs_playMethod == 30 || txlfcs_playMethod == 31 || txlfcs_playMethod == 32 || txlfcs_playMethod == 40 || txlfcs_playMethod == 36
			|| txlfcs_playMethod == 19 || txlfcs_playMethod == 20 || txlfcs_playMethod == 21 || txlfcs_playMethod == 46 || txlfcs_playMethod == 47
			|| txlfcs_playMethod == 50 || txlfcs_playMethod == 57 || txlfcs_playType == 8 || txlfcs_playMethod == 51 || txlfcs_playMethod == 58
			|| txlfcs_playMethod == 52 || txlfcs_playMethod == 53|| txlfcs_playMethod == 59 || txlfcs_playMethod == 60 || txlfcs_playType == 13 || txlfcs_playType == 14){
			$("#txlfcs_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(txlfcs_playType == 7 || txlfcs_playMethod == 78 || txlfcs_playMethod == 84 || txlfcs_playMethod == 93){
			$("#txlfcs_ballView div.ballView").each(function(){
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
		}else if(txlfcs_playMethod == 80 || txlfcs_playMethod == 81 || txlfcs_playMethod == 83
			|| txlfcs_playMethod == 86 || txlfcs_playMethod == 87 || txlfcs_playMethod == 89
			|| txlfcs_playMethod == 92 || txlfcs_playMethod == 95 || txlfcs_playMethod == 97){
			$("#txlfcs_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#txlfcs_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txlfcs_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txlfcs_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txlfcs_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txlfcs_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (txlfcs_playMethod == 96 || txlfcs_playMethod == 98) {
			$("#txlfcs_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#txlfcs_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#txlfcs_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#txlfcs_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#txlfcs_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#txlfcs_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			var array = handleSingleStr($("#txlfcs_single").val());
			if(txlfcs_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(txlfcs_playMethod == 10 || txlfcs_playMethod == 38 || txlfcs_playMethod == 27
				|| txlfcs_playMethod == 16 || txlfcs_playMethod == 49 || txlfcs_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txlfcs_playMethod == 45 || txlfcs_playMethod == 34 || txlfcs_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(txlfcs_playMethod == 79 || txlfcs_playMethod == 82 || txlfcs_playMethod == 85 || txlfcs_playMethod == 88 ||
				txlfcs_playMethod == 89 || txlfcs_playMethod == 90 || txlfcs_playMethod == 91 || txlfcs_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#txlfcs_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#txlfcs_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#txlfcs_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#txlfcs_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#txlfcs_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#txlfcs_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#txlfcs_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#txlfcs_fandian").val());
		submitParams.notes = $('#txlfcs_zhushu').html();
		submitParams.sntuo = txlfcs_sntuo;
		submitParams.multiple = $('#txlfcs_beiNum').val();  //requirement
		submitParams.rebates = $('#txlfcs_fandian').val();  //requirement
		submitParams.playMode = $('#txlfcs_modeId').val();  //requirement
		submitParams.money = $('#txlfcs_money').html();  //requirement
		submitParams.award = $('#txlfcs_minAward').html();  //奖金
		submitParams.maxAward = $('#txlfcs_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#txlfcs_ballView").empty();
		txlfcs_qingkongAll();
	});
}

/**
 * [txlfcs_randomOne 随机一注]
 * @return {[type]} [description]
 */
function txlfcs_randomOne(){
	txlfcs_qingkongAll();
	if(txlfcs_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["txlfcs"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txlfcs"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txlfcs"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txlfcs"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["txlfcs"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line2"], function(k, v){
			$("#" + "txlfcs_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line3"], function(k, v){
			$("#" + "txlfcs_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line4"], function(k, v){
			$("#" + "txlfcs_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line5"], function(k, v){
			$("#" + "txlfcs_line5" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["txlfcs"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["txlfcs"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txlfcs"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txlfcs"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["txlfcs"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line2"], function(k, v){
			$("#" + "txlfcs_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line3"], function(k, v){
			$("#" + "txlfcs_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line4"], function(k, v){
			$("#" + "txlfcs_line4" + v).toggleClass("redBalls_active");
		});

	}else if(txlfcs_playMethod == 37 || txlfcs_playMethod == 26 || txlfcs_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["txlfcs"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txlfcs"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["txlfcs"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line2"], function(k, v){
			$("#" + "txlfcs_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line3"], function(k, v){
			$("#" + "txlfcs_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 41 || txlfcs_playMethod == 30 || txlfcs_playMethod == 19 || txlfcs_playMethod == 68
		|| txlfcs_playMethod == 52 || txlfcs_playMethod == 64 || txlfcs_playMethod == 66
		|| txlfcs_playMethod == 59 || txlfcs_playMethod == 70 || txlfcs_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txlfcs"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 42 || txlfcs_playMethod == 31 || txlfcs_playMethod == 20 || txlfcs_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["txlfcs"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 39 || txlfcs_playMethod == 28 || txlfcs_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["txlfcs"]["line1"].push(number+'');
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 43 || txlfcs_playMethod == 32 || txlfcs_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["txlfcs"]["line1"].push(number+'');
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 48 || txlfcs_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["txlfcs"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["txlfcs"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line2"], function(k, v){
			$("#" + "txlfcs_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 25 || txlfcs_playMethod == 36 || txlfcs_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["txlfcs"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 50 || txlfcs_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["txlfcs"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 53 || txlfcs_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["txlfcs"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txlfcs"]["line"+line].push(number+"");
		$.each(LotteryStorage["txlfcs"]["line"+line], function(k, v){
			$("#" + "txlfcs_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 63 || txlfcs_playMethod == 67 || txlfcs_playMethod == 69 || txlfcs_playMethod == 71 || txlfcs_playType == 13
		|| txlfcs_playMethod == 65 || txlfcs_playMethod == 18 || txlfcs_playMethod == 29 || txlfcs_playMethod == 40 || txlfcs_playMethod == 22
		|| txlfcs_playMethod == 33 || txlfcs_playMethod == 44 || txlfcs_playMethod == 54 || txlfcs_playMethod == 61
		|| txlfcs_playMethod == 24 || txlfcs_playMethod == 35 || txlfcs_playMethod == 46 || txlfcs_playMethod == 51 || txlfcs_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["txlfcs"]["line1"].push(number+'');
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 74 || txlfcs_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["txlfcs"]["line1"].push(array[0]+"");
		LotteryStorage["txlfcs"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line2"], function(k, v){
			$("#" + "txlfcs_line2" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 75 || txlfcs_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["txlfcs"]["line1"].push(array[0]+"");
		LotteryStorage["txlfcs"]["line2"].push(array[1]+"");
		LotteryStorage["txlfcs"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line2"], function(k, v){
			$("#" + "txlfcs_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line3"], function(k, v){
			$("#" + "txlfcs_line3" + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["txlfcs"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txlfcs"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["txlfcs"]["line"+lines[0]], function(k, v){
			$("#" + "txlfcs_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line"+lines[1]], function(k, v){
			$("#" + "txlfcs_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["txlfcs"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txlfcs"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txlfcs"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["txlfcs"]["line"+lines[0]], function(k, v){
			$("#" + "txlfcs_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line"+lines[1]], function(k, v){
			$("#" + "txlfcs_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line"+lines[0]], function(k, v){
			$("#" + "txlfcs_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["txlfcs"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["txlfcs"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["txlfcs"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["txlfcs"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["txlfcs"]["line"+lines[0]], function(k, v){
			$("#" + "txlfcs_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line"+lines[1]], function(k, v){
			$("#" + "txlfcs_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line"+lines[2]], function(k, v){
			$("#" + "txlfcs_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txlfcs"]["line"+lines[3]], function(k, v){
			$("#" + "txlfcs_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(txlfcs_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["txlfcs"]["line1"].push(number+"");
		$.each(LotteryStorage["txlfcs"]["line1"], function(k, v){
			$("#" + "txlfcs_line1" + v).toggleClass("redBalls_active");
		});
	}
	txlfcs_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function txlfcs_checkOutRandom(playMethod){
	var obj = new Object();
	if(txlfcs_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txlfcs_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txlfcs_playMethod == 18 || txlfcs_playMethod == 29 || txlfcs_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(txlfcs_playMethod == 22 || txlfcs_playMethod == 33 || txlfcs_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(txlfcs_playMethod == 54 || txlfcs_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(txlfcs_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txlfcs_playMethod == 37 || txlfcs_playMethod == 26 || txlfcs_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txlfcs_playMethod == 39 || txlfcs_playMethod == 28 || txlfcs_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(txlfcs_playMethod == 41 || txlfcs_playMethod == 30 || txlfcs_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(txlfcs_playMethod == 52 || txlfcs_playMethod == 59 || txlfcs_playMethod == 64 || txlfcs_playMethod == 66 || txlfcs_playMethod == 68
		||txlfcs_playMethod == 70 || txlfcs_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txlfcs_playMethod == 42 || txlfcs_playMethod == 31 || txlfcs_playMethod == 20 || txlfcs_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(txlfcs_playMethod == 43 || txlfcs_playMethod == 32 || txlfcs_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(txlfcs_playMethod == 48 || txlfcs_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(txlfcs_playMethod == 50 || txlfcs_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(txlfcs_playMethod == 53 || txlfcs_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(txlfcs_playMethod == 62){
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
	}else if(txlfcs_playMethod == 63 || txlfcs_playMethod == 65 || txlfcs_playMethod == 67 || txlfcs_playMethod == 69 || txlfcs_playMethod == 71
		|| txlfcs_playMethod == 24 || txlfcs_playMethod == 35 || txlfcs_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(txlfcs_playMethod == 25 || txlfcs_playMethod == 36 || txlfcs_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(txlfcs_playMethod == 51 || txlfcs_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(txlfcs_playMethod == 74 || txlfcs_playMethod == 76){
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
	}else if(txlfcs_playMethod == 75 || txlfcs_playMethod == 77){
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
	}else if(txlfcs_playMethod == 78){
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
	}else if(txlfcs_playMethod == 84){
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
	}else if(txlfcs_playMethod == 93){
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
	obj.sntuo = txlfcs_sntuo;
	obj.multiple = 1;
	obj.rebates = txlfcs_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('txlfcs',txlfcs_playMethod,obj);  //机选奖金计算
	obj.award = $('#txlfcs_minAward').html();     //奖金
	obj.maxAward = $('#txlfcs_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [txlfcsValidateData 单式数据验证]
 */
function txlfcsValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#txlfcs_single").val();
	textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	txlfcsValidData(textStr,type);
}

function txlfcsValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(txlfcs_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 38 || txlfcs_playMethod == 27 || txlfcs_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 45 || txlfcs_playMethod == 34 || txlfcs_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 49 || txlfcs_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,2);
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,2);
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,3);
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,3);
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,3);
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,3);
		txlfcsShowFooter(true,notes);
	}else if(txlfcs_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#txlfcs_tab .button.red").size() ,4);
		txlfcsShowFooter(true,notes);
	}

	$('#txlfcs_delRepeat').off('click');
	$('#txlfcs_delRepeat').on('click',function () {
		content.str = $('#txlfcs_single').val() ? $('#txlfcs_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		txlfcsShowFooter(true,notes);
		$("#txlfcs_single").val(array.join(" "));
	});

	$("#txlfcs_single").val(array.join(" "));
	return notes;
}

function txlfcsShowFooter(isValid,notes){
	$('#txlfcs_zhushu').text(notes);
	if($("#txlfcs_modeId").val() == "8"){
		$('#txlfcs_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcs_beiNum").val()),0.002));
	}else if ($("#txlfcs_modeId").val() == "2"){
		$('#txlfcs_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcs_beiNum").val()),0.2));
	}else if ($("#txlfcs_modeId").val() == "1"){
		$('#txlfcs_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcs_beiNum").val()),0.02));
	}else{
		$('#txlfcs_money').text(bigNumberUtil.multiply(notes * parseInt($("#txlfcs_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	txlfcs_initFooterButton();
	calcAwardWin('txlfcs',txlfcs_playMethod);  //计算奖金和盈利
}