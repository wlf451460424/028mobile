var tjssc_playType = 2;
var tjssc_playMethod = 15;
var tjssc_sntuo = 0;
var tjssc_rebate;
var tjsscScroll;

//进入这个页面时调用
function tjsscPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("tjssc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("tjssc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function tjsscPageUnloadedPanel(){
	$("#tjssc_queding").off('click');
	$("#tjsscPage_back").off('click');
	$("#tjssc_ballView").empty();
	$("#tjsscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="tjsscPlaySelect"></select>');
	$("#tjsscSelect").append($select);
}

//入口函数
function tjssc_init(){
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
	$("#tjssc_title").html(LotteryInfo.getLotteryNameByTag("tjssc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == tjssc_playType && j == tjssc_playMethod){
					$play.append('<option value="tjssc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="tjssc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(tjssc_playMethod,onShowArray)>-1 ){
						tjssc_playType = i;
						tjssc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#tjsscPlaySelect").append($play);
		}
	}
	
	if($("#tjsscPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("tjsscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:tjsscChangeItem
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

	GetLotteryInfo("tjssc",function (){
		tjsscChangeItem("tjssc"+tjssc_playMethod);
	});

	//添加滑动条
	if(!tjsscScroll){
		tjsscScroll = new IScroll('#tjsscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("tjssc",LotteryInfo.getLotteryIdByTag("tjssc"));

	//获取上一期开奖
	queryLastPrize("tjssc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('tjssc');

	//机选选号
	$("#tjssc_random").off('click');
	$("#tjssc_random").on('click', function(event) {
		tjssc_randomOne();
	});

	//返回
	$("#tjsscPage_back").on('click', function(event) {
		// tjssc_playType = 2;
		// tjssc_playMethod = 15;
		$("#tjssc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		tjssc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#tjssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",tjssc_playMethod));
	//玩法说明
	$("#tjssc_paly_shuoming").off('click');
	$("#tjssc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#tjssc_shuoming").text());
	});

	qingKong("tjssc");//清空
	tjssc_submitData();
}

function tjsscResetPlayType(){
	tjssc_playType = 2;
	tjssc_playMethod = 15;
}

function tjsscChangeItem(val) {
	tjssc_qingkongAll();
	var temp = val.substring("tjssc".length,val.length);
	if(val == "tjssc0"){
		//直选复式
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 0;
		tjssc_playMethod = 0;
		createFiveLineLayout("tjssc", function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc1"){
		//直选单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 0;
		tjssc_playMethod = 1;
		$("#tjssc_ballView").empty();
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc2"){
		//组选120
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 0;
		tjssc_playMethod = 2;
		createOneLineLayout("tjssc","至少选择5个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc3"){
		//组选60
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 0;
		tjssc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc4"){
		//组选30
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 0;
		tjssc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc5"){
		//组选20
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 0;
		tjssc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc6"){
		//组选10
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 0;
		tjssc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc7"){
		//组选5
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 0;
		tjssc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc8"){
		//总和大小单双
		$("#tjssc_random").show();
		var num = ["大","小","单","双"];
		tjssc_sntuo = 0;
		tjssc_playType = 0;
		tjssc_playMethod = 8;
		createNonNumLayout("tjssc",tjssc_playMethod,num,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc9"){
		//直选复式
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 1;
		tjssc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("tjssc",tips, function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc10"){
		//直选单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 1;
		tjssc_playMethod = 10;
		$("#tjssc_ballView").empty();
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc11"){
		//组选24
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 1;
		tjssc_playMethod = 11;
		createOneLineLayout("tjssc","至少选择4个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc12"){
		//组选12
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 1;
		tjssc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc13"){
		//组选6
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 1;
		tjssc_playMethod = 13;
		createOneLineLayout("tjssc","二重号:至少选择2个号码",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc14"){
		//组选4
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 1;
		tjssc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc15"){
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc16"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 2;
		tjssc_playMethod = 16;
		$("#tjssc_ballView").empty();
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc17"){
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 17;
		createSumLayout("tjssc",0,27,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc18"){
		//直选跨度
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 18;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc19"){
		//后三组三
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 19;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc20"){
		//后三组六
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 20;
		createOneLineLayout("tjssc","至少选择3个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc21"){
		//后三和值
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 21;
		createSumLayout("tjssc",1,26,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc22"){
		//后三组选包胆
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 22;
		tjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tjssc",array,["请选择一个号码"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc23"){
		//后三混合组选
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 2;
		tjssc_playMethod = 23;
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc24"){
		//和值尾数
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 24;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc25"){
		//特殊号
		$("#tjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tjssc_sntuo = 0;
		tjssc_playType = 2;
		tjssc_playMethod = 25;
		createNonNumLayout("tjssc",tjssc_playMethod,num,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc26"){
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc27"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 3;
		tjssc_playMethod = 27;
		$("#tjssc_ballView").empty();
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc28"){
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 28;
		createSumLayout("tjssc",0,27,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc29"){
		//直选跨度
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 29;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc30"){
		//中三组三
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 30;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc31"){
		//中三组六
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 31;
		createOneLineLayout("tjssc","至少选择3个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc32"){
		//中三和值
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 32;
		createSumLayout("tjssc",1,26,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc33"){
		//中三组选包胆
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 33;
		tjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tjssc",array,["请选择一个号码"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc34"){
		//中三混合组选
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 3;
		tjssc_playMethod = 34;
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc35"){
		//和值尾数
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 35;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc36"){
		//特殊号
		$("#tjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tjssc_sntuo = 0;
		tjssc_playType = 3;
		tjssc_playMethod = 36;
		createNonNumLayout("tjssc",tjssc_playMethod,num,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc37"){
		//直选复式
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc38"){
		//直选单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 4;
		tjssc_playMethod = 38;
		$("#tjssc_ballView").empty();
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc39"){
		//和值
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 39;
		createSumLayout("tjssc",0,27,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc40"){
		//直选跨度
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 40;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc41"){
		//前三组三
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 41;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc42"){
		//前三组六
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 42;
		createOneLineLayout("tjssc","至少选择3个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc43"){
		//前三和值
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 43;
		createSumLayout("tjssc",1,26,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc44"){
		//前三组选包胆
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 44;
		tjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tjssc",array,["请选择一个号码"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc45"){
		//前三混合组选
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 4;
		tjssc_playMethod = 45;
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc46"){
		//和值尾数
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 46;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc47"){
		//特殊号
		$("#tjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tjssc_sntuo = 0;
		tjssc_playType = 4;
		tjssc_playMethod = 47;
		createNonNumLayout("tjssc",tjssc_playMethod,num,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc48"){
		//后二复式
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 5;
		tjssc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc49"){
		//后二单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 5;
		tjssc_playMethod = 49;
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc50"){
		//后二和值
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 5;
		tjssc_playMethod = 50;
		createSumLayout("tjssc",0,18,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc51"){
		//直选跨度
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 5;
		tjssc_playMethod = 51;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc52"){
		//后二组选
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 5;
		tjssc_playMethod = 52;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc53"){
		//后二和值
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 5;
		tjssc_playMethod = 53;
		createSumLayout("tjssc",1,17,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc54"){
		//后二组选包胆
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 5;
		tjssc_playMethod = 54;
		tjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tjssc",array,["请选择一个号码"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc55"){
		//前二复式
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 6;
		tjssc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc56"){
		//前二单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 6;
		tjssc_playMethod = 56;
		tjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
	}else if(val == "tjssc57"){
		//前二和值
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 6;
		tjssc_playMethod = 57;
		createSumLayout("tjssc",0,18,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc58"){
		//直选跨度
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 6;
		tjssc_playMethod = 58;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc59"){
		//前二组选
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 6;
		tjssc_playMethod = 59;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc60"){
		//前二和值
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 6;
		tjssc_playMethod = 60;
		createSumLayout("tjssc",1,17,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc61"){
		//前二组选包胆
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 6;
		tjssc_playMethod = 61;
		tjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tjssc",array,["请选择一个号码"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc62"){
		//定位复式
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 7;
		tjssc_playMethod = 62;
		createFiveLineLayout("tjssc", function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc63"){
		//后三一码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 63;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc64"){
		//后三二码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 64;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc65"){
		//前三一码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 65;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc66"){
		//前三二码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 66;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc67"){
		//后四一码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 67;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc68"){
		//后四二码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 68;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc69"){
		//前四一码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 69;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc70"){
		//前四二码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 70;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc71"){
		//五星一码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 71;
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc72"){
		//五星二码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 72;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc73"){
		//五星三码
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 8;
		tjssc_playMethod = 73;
		createOneLineLayout("tjssc","至少选择3个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc74"){
		//后二大小单双
		tjssc_qingkongAll();
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 9;
		tjssc_playMethod = 74;
		createTextBallTwoLayout("tjssc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc75"){
		//后三大小单双
		tjssc_qingkongAll();
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 9;
		tjssc_playMethod = 75;
		createTextBallThreeLayout("tjssc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc76"){
		//前二大小单双
		tjssc_qingkongAll();
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 9;
		tjssc_playMethod = 76;
		createTextBallTwoLayout("tjssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc77"){
		//前三大小单双
		tjssc_qingkongAll();
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 9;
		tjssc_playMethod = 77;
		createTextBallThreeLayout("tjssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc78"){
		//直选复式
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 10;
		tjssc_playMethod = 78;
		createFiveLineLayout("tjssc",function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc79"){
		//直选单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 10;
		tjssc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
		createRenXuanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc80"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 10;
		tjssc_playMethod = 80;
		createSumLayout("tjssc",0,18,function(){
			tjssc_calcNotes();
		});
		createRenXuanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc81"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 10;
		tjssc_playMethod = 81;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		createRenXuanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc82"){
		//组选单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 10;
		tjssc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
		createRenXuanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc83"){
		//组选和值
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 10;
		tjssc_playMethod = 83;
		createSumLayout("tjssc",1,17,function(){
			tjssc_calcNotes();
		});
		createRenXuanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc84"){
		//直选复式
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 11;
		tjssc_playMethod = 84;
		createFiveLineLayout("tjssc", function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc85"){
		//直选单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 11;
		tjssc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
		createRenXuanSanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc86"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 11;
		tjssc_playMethod = 86;
		createSumLayout("tjssc",0,27,function(){
			tjssc_calcNotes();
		});
		createRenXuanSanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc87"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 11;
		tjssc_playMethod = 87;
		createOneLineLayout("tjssc","至少选择2个",0,9,false,function(){
			tjssc_calcNotes();
		});
		createRenXuanSanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc88"){
		//组选单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 11;
		tjssc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
		createRenXuanSanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc89"){
		//组选和值
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 11;
		tjssc_playMethod = 89;
		createOneLineLayout("tjssc","至少选择3个",0,9,false,function(){
			tjssc_calcNotes();
		});
		createRenXuanSanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc90"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 11;
		tjssc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
		createRenXuanSanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc91"){
		//混合组选
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 11;
		tjssc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
		createRenXuanSanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc92"){
		//组选和值
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 11;
		tjssc_playMethod = 92;
		createSumLayout("tjssc",1,26,function(){
			tjssc_calcNotes();
		});
		createRenXuanSanLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc93"){
		$("#tjssc_random").show();
		tjssc_sntuo = 0;
		tjssc_playType = 12;
		tjssc_playMethod = 93;
		createFiveLineLayout("tjssc", function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc94"){
		//直选单式
		$("#tjssc_random").hide();
		tjssc_sntuo = 3;
		tjssc_playType = 12;
		tjssc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tjssc",tips);
		createRenXuanSiLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc95"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 12;
		tjssc_playMethod = 95;
		createOneLineLayout("tjssc","至少选择4个",0,9,false,function(){
			tjssc_calcNotes();
		});
		createRenXuanSiLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc96"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 12;
		tjssc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		createRenXuanSiLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc97"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 12;
		tjssc_playMethod = 97;
		$("#tjssc_ballView").empty();
		createOneLineLayout("tjssc","二重号:至少选择2个号码",0,9,false,function(){
			tjssc_calcNotes();
		});
		createRenXuanSiLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc98"){
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 12;
		tjssc_playMethod = 98;
		$("#tjssc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tjssc",tips,0,9,false,function(){
			tjssc_calcNotes();
		});
		createRenXuanSiLayout("tjssc",tjssc_playMethod,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc99"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 13;
		tjssc_playMethod = 99;
		$("#tjssc_ballView").empty();
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc100"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 13;
		tjssc_playMethod = 100;
		$("#tjssc_ballView").empty();
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc101"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 13;
		tjssc_playMethod = 101;
		$("#tjssc_ballView").empty();
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc102"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 13;
		tjssc_playMethod = 102;
		$("#tjssc_ballView").empty();
		createOneLineLayout("tjssc","至少选择1个",0,9,false,function(){
			tjssc_calcNotes();
		});
		tjssc_qingkongAll();
	}else if(val == "tjssc103"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 103;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc104"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 104;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc105"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 105;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc106"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 106;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc107"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 107;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc108"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 108;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc109"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 109;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc110"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 110;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc111"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 111;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}else if(val == "tjssc112"){
		tjssc_qingkongAll();
		$("#tjssc_random").hide();
		tjssc_sntuo = 0;
		tjssc_playType = 14;
		tjssc_playMethod = 112;
		createTextBallOneLayout("tjssc",["龙","虎","和"],["至少选择一个"],function(){
			tjssc_calcNotes();
		});
	}

	if(tjsscScroll){
		tjsscScroll.refresh();
		tjsscScroll.scrollTo(0,0,1);
	}
	
	$("#tjssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("tjssc",temp);
	hideRandomWhenLi("tjssc",tjssc_sntuo,tjssc_playMethod);
	tjssc_calcNotes();
}
/**
 * [tjssc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function tjssc_initFooterButton(){
	if(tjssc_playMethod == 0 || tjssc_playMethod == 62 || tjssc_playMethod == 78
		|| tjssc_playMethod == 84 || tjssc_playMethod == 93 || tjssc_playType == 7){
		if(LotteryStorage["tjssc"]["line1"].length > 0 || LotteryStorage["tjssc"]["line2"].length > 0 ||
			LotteryStorage["tjssc"]["line3"].length > 0 || LotteryStorage["tjssc"]["line4"].length > 0 ||
			LotteryStorage["tjssc"]["line5"].length > 0){
			$("#tjssc_qingkong").css("opacity",1.0);
		}else{
			$("#tjssc_qingkong").css("opacity",0.4);
		}
	}else if(tjssc_playMethod == 9){
		if(LotteryStorage["tjssc"]["line1"].length > 0 || LotteryStorage["tjssc"]["line2"].length > 0 ||
			LotteryStorage["tjssc"]["line3"].length > 0 || LotteryStorage["tjssc"]["line4"].length > 0 ){
			$("#tjssc_qingkong").css("opacity",1.0);
		}else{
			$("#tjssc_qingkong").css("opacity",0.4);
		}
	}else if(tjssc_playMethod == 37 || tjssc_playMethod == 4 || tjssc_playMethod == 6
		|| tjssc_playMethod == 26 || tjssc_playMethod == 15 || tjssc_playMethod == 75 || tjssc_playMethod == 77){
		if(LotteryStorage["tjssc"]["line1"].length > 0 || LotteryStorage["tjssc"]["line2"].length > 0
			|| LotteryStorage["tjssc"]["line3"].length > 0){
			$("#tjssc_qingkong").css("opacity",1.0);
		}else{
			$("#tjssc_qingkong").css("opacity",0.4);
		}
	}else if(tjssc_playMethod == 3 || tjssc_playMethod == 4 || tjssc_playMethod == 5
		|| tjssc_playMethod == 6 || tjssc_playMethod == 7 || tjssc_playMethod == 12
		|| tjssc_playMethod == 14 || tjssc_playMethod == 48 || tjssc_playMethod == 55
		|| tjssc_playMethod == 74 || tjssc_playMethod == 76 || tjssc_playMethod == 96 || tjssc_playMethod == 98){
		if(LotteryStorage["tjssc"]["line1"].length > 0 || LotteryStorage["tjssc"]["line2"].length > 0){
			$("#tjssc_qingkong").css("opacity",1.0);
		}else{
			$("#tjssc_qingkong").css("opacity",0.4);
		}
	}else if(tjssc_playMethod == 2 || tjssc_playMethod == 8 || tjssc_playMethod == 11 || tjssc_playMethod == 13 || tjssc_playMethod == 39
		|| tjssc_playMethod == 28 || tjssc_playMethod == 17 || tjssc_playMethod == 18 || tjssc_playMethod == 24 || tjssc_playMethod == 41
		|| tjssc_playMethod == 25 || tjssc_playMethod == 29 || tjssc_playMethod == 42 || tjssc_playMethod == 43 || tjssc_playMethod == 30
		|| tjssc_playMethod == 35 || tjssc_playMethod == 36 || tjssc_playMethod == 31 || tjssc_playMethod == 32 || tjssc_playMethod == 19
		|| tjssc_playMethod == 40 || tjssc_playMethod == 46 || tjssc_playMethod == 20 || tjssc_playMethod == 21 || tjssc_playMethod == 50
		|| tjssc_playMethod == 47 || tjssc_playMethod == 51 || tjssc_playMethod == 52 || tjssc_playMethod == 53 || tjssc_playMethod == 57 || tjssc_playMethod == 63
		|| tjssc_playMethod == 58 || tjssc_playMethod == 59 || tjssc_playMethod == 60 || tjssc_playMethod == 65 || tjssc_playMethod == 80 || tjssc_playMethod == 81 || tjssc_playType == 8
		|| tjssc_playMethod == 83 || tjssc_playMethod == 86 || tjssc_playMethod == 87 || tjssc_playMethod == 22 || tjssc_playMethod == 33 || tjssc_playMethod == 44
		|| tjssc_playMethod == 89 || tjssc_playMethod == 92 || tjssc_playMethod == 95 || tjssc_playMethod == 54 || tjssc_playMethod == 61
		|| tjssc_playMethod == 97 || tjssc_playType == 13  || tjssc_playType == 14){
		if(LotteryStorage["tjssc"]["line1"].length > 0){
			$("#tjssc_qingkong").css("opacity",1.0);
		}else{
			$("#tjssc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#tjssc_qingkong").css("opacity",0);
	}

	if($("#tjssc_qingkong").css("opacity") == "0"){
		$("#tjssc_qingkong").css("display","none");
	}else{
		$("#tjssc_qingkong").css("display","block");
	}

	if($('#tjssc_zhushu').html() > 0){
		$("#tjssc_queding").css("opacity",1.0);
	}else{
		$("#tjssc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  tjssc_qingkongAll(){
	$("#tjssc_ballView span").removeClass('redBalls_active');
	LotteryStorage["tjssc"]["line1"] = [];
	LotteryStorage["tjssc"]["line2"] = [];
	LotteryStorage["tjssc"]["line3"] = [];
	LotteryStorage["tjssc"]["line4"] = [];
	LotteryStorage["tjssc"]["line5"] = [];

	localStorageUtils.removeParam("tjssc_line1");
	localStorageUtils.removeParam("tjssc_line2");
	localStorageUtils.removeParam("tjssc_line3");
	localStorageUtils.removeParam("tjssc_line4");
	localStorageUtils.removeParam("tjssc_line5");

	$('#tjssc_zhushu').text(0);
	$('#tjssc_money').text(0);
	clearAwardWin("tjssc");
	tjssc_initFooterButton();
}

/**
 * [tjssc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function tjssc_calcNotes(){
	$('#tjssc_modeId').blur();
	$('#tjssc_fandian').blur();
	
	var notes = 0;

	if(tjssc_playMethod == 0){
		notes = LotteryStorage["tjssc"]["line1"].length *
			LotteryStorage["tjssc"]["line2"].length *
			LotteryStorage["tjssc"]["line3"].length *
			LotteryStorage["tjssc"]["line4"].length *
			LotteryStorage["tjssc"]["line5"].length;
	}else if(tjssc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,5);
	}else if(tjssc_playMethod == 3){
		if (LotteryStorage["tjssc"]["line1"].length >= 1 && LotteryStorage["tjssc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["tjssc"]["line1"],LotteryStorage["tjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tjssc_playMethod == 4){
		if (LotteryStorage["tjssc"]["line1"].length >= 2 && LotteryStorage["tjssc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["tjssc"]["line2"],LotteryStorage["tjssc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(tjssc_playMethod == 5 || tjssc_playMethod == 12){
		if (LotteryStorage["tjssc"]["line1"].length >= 1 && LotteryStorage["tjssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["tjssc"]["line1"],LotteryStorage["tjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tjssc_playMethod == 6 || tjssc_playMethod == 7 || tjssc_playMethod == 14){
		if (LotteryStorage["tjssc"]["line1"].length >= 1 && LotteryStorage["tjssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["tjssc"]["line1"],LotteryStorage["tjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tjssc_playMethod == 9){
		notes = LotteryStorage["tjssc"]["line1"].length *
			LotteryStorage["tjssc"]["line2"].length *
			LotteryStorage["tjssc"]["line3"].length *
			LotteryStorage["tjssc"]["line4"].length;
	}else if(tjssc_playMethod == 18 || tjssc_playMethod == 29 || tjssc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["tjssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(tjssc_playMethod == 22 || tjssc_playMethod == 33 || tjssc_playMethod == 44 ){
		notes = 54;
	}else if(tjssc_playMethod == 54 || tjssc_playMethod == 61){
		notes = 9;
	}else if(tjssc_playMethod == 51 || tjssc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["tjssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(tjssc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,4);
	}else if(tjssc_playMethod == 13|| tjssc_playMethod == 64 || tjssc_playMethod == 66 || tjssc_playMethod == 68 || tjssc_playMethod == 70 || tjssc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,2);
	}else if(tjssc_playMethod == 37 || tjssc_playMethod == 26 || tjssc_playMethod == 15 || tjssc_playMethod == 75 || tjssc_playMethod == 77){
		notes = LotteryStorage["tjssc"]["line1"].length *
			LotteryStorage["tjssc"]["line2"].length *
			LotteryStorage["tjssc"]["line3"].length ;
	}else if(tjssc_playMethod == 39 || tjssc_playMethod == 28 || tjssc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["tjssc"]["line1"][i]);
		};
	}else if(tjssc_playMethod == 41 || tjssc_playMethod == 30 || tjssc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["tjssc"]["line1"].length,2);
	}else if(tjssc_playMethod == 42 || tjssc_playMethod == 31 || tjssc_playMethod == 20 || tjssc_playMethod == 68 || tjssc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,3);
	}else if(tjssc_playMethod == 43 || tjssc_playMethod == 32 || tjssc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["tjssc"]["line1"][i]);
		};
	}else if(tjssc_playMethod == 48 || tjssc_playMethod == 55 || tjssc_playMethod == 74 || tjssc_playMethod == 76){
		notes = LotteryStorage["tjssc"]["line1"].length *
			LotteryStorage["tjssc"]["line2"].length ;
	}else if(tjssc_playMethod == 50 || tjssc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["tjssc"]["line1"][i]);
		};
	}else if(tjssc_playMethod == 52 || tjssc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,2);
	}else if(tjssc_playMethod == 53 || tjssc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["tjssc"]["line1"][i]);
		};
	}else if(tjssc_playMethod == 62){
		notes = LotteryStorage["tjssc"]["line1"].length +
			LotteryStorage["tjssc"]["line2"].length +
			LotteryStorage["tjssc"]["line3"].length +
			LotteryStorage["tjssc"]["line4"].length +
			LotteryStorage["tjssc"]["line5"].length;
	}else if(tjssc_playType == 13 || tjssc_playType == 14 || tjssc_playMethod == 8 || tjssc_playMethod == 71
		|| tjssc_playMethod == 24 || tjssc_playMethod == 25 || tjssc_playMethod == 35 || tjssc_playMethod == 36 || tjssc_playMethod == 46
		|| tjssc_playMethod == 47 || tjssc_playMethod == 63 || tjssc_playMethod == 65 || tjssc_playMethod == 67 || tjssc_playMethod == 69 ){
		notes = LotteryStorage["tjssc"]["line1"].length ;
	}else if(tjssc_playMethod == 78){
		notes = LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line2"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line3"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line4"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line3"].length +
			LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line4"].length +
			LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line4"].length +
			LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line4"].length * LotteryStorage["tjssc"]["line5"].length;
	}else if (tjssc_playMethod == 80) {
		if ($("#tjssc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["tjssc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,2);
		}
	}else if (tjssc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,2) * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,2);
	}else if (tjssc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["tjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,2);
	}else if (tjssc_playMethod == 84) {
		notes = LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line3"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line4"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line4"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line4"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line4"].length +
			LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line4"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line4"].length * LotteryStorage["tjssc"]["line5"].length ;
	}else if (tjssc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["tjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,3);
	}else if (tjssc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["tjssc"]["line1"].length,2) * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,3);
	}else if (tjssc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,3) * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,3);
	}else if (tjssc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["tjssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["tjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,3);
	}else if (tjssc_playMethod == 93) {
		notes = LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line4"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line4"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line1"].length * LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line4"].length * LotteryStorage["tjssc"]["line5"].length +
			LotteryStorage["tjssc"]["line2"].length * LotteryStorage["tjssc"]["line3"].length * LotteryStorage["tjssc"]["line4"].length * LotteryStorage["tjssc"]["line5"].length;
	}else if (tjssc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,4)
			* mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,4);
	}else if (tjssc_playMethod == 96) {
		if (LotteryStorage["tjssc"]["line1"].length >= 1 && LotteryStorage["tjssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["tjssc"]["line1"],LotteryStorage["tjssc"]["line2"])
				* mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (tjssc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["tjssc"]["line1"].length,2) * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,4);
	}else if (tjssc_playMethod == 98) {
		if (LotteryStorage["tjssc"]["line1"].length >= 1 && LotteryStorage["tjssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["tjssc"]["line1"],LotteryStorage["tjssc"]["line2"]) * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = tjsscValidData($("#tjssc_single").val());
	}

	if(tjssc_sntuo == 3 || tjssc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","tjssc"),LotteryInfo.getMethodId("ssc",tjssc_playMethod))){
	}else{
		if(parseInt($('#tjssc_modeId').val()) == 8){
			$("#tjssc_random").hide();
		}else{
			$("#tjssc_random").show();
		}
	}

	//验证是否为空
	if( $("#tjssc_beiNum").val() =="" || parseInt($("#tjssc_beiNum").val()) == 0){
		$("#tjssc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#tjssc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#tjssc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#tjssc_zhushu').text(notes);
		if($("#tjssc_modeId").val() == "8"){
			$('#tjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tjssc_beiNum").val()),0.002));
		}else if ($("#tjssc_modeId").val() == "2"){
			$('#tjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tjssc_beiNum").val()),0.2));
		}else if ($("#tjssc_modeId").val() == "1"){
			$('#tjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tjssc_beiNum").val()),0.02));
		}else{
			$('#tjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tjssc_beiNum").val()),2));
		}
	} else {
		$('#tjssc_zhushu').text(0);
		$('#tjssc_money').text(0);
	}
	tjssc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('tjssc',tjssc_playMethod);
}

/**
 * [tjssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function tjssc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#tjssc_queding").bind('click', function(event) {

		tjssc_rebate = $("#tjssc_fandian option:last").val();
		if(parseInt($('#tjssc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		tjssc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#tjssc_modeId').val()) == 8){
			if (Number($('#tjssc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('tjssc',tjssc_playMethod);

		submitParams.lotteryType = "tjssc";
		var play = LotteryInfo.getPlayName("ssc",tjssc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",tjssc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = tjssc_playType;
		submitParams.playMethodIndex = tjssc_playMethod;
		var selectedBalls = [];
		if(tjssc_playMethod == 0 || tjssc_playMethod == 3 || tjssc_playMethod == 4
			|| tjssc_playMethod == 5 || tjssc_playMethod == 6 || tjssc_playMethod == 7
			|| tjssc_playMethod == 9 || tjssc_playMethod == 12 || tjssc_playMethod == 14
			|| tjssc_playMethod == 37 || tjssc_playMethod == 26 || tjssc_playMethod == 15
			|| tjssc_playMethod == 48 || tjssc_playMethod == 55 || tjssc_playMethod == 74 || tjssc_playType == 9){
			$("#tjssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(tjssc_playMethod == 2 || tjssc_playMethod == 8 || tjssc_playMethod == 11 || tjssc_playMethod == 13 || tjssc_playMethod == 24
			|| tjssc_playMethod == 39 || tjssc_playMethod == 28 || tjssc_playMethod == 17 || tjssc_playMethod == 18 || tjssc_playMethod == 25
			|| tjssc_playMethod == 22 || tjssc_playMethod == 33 || tjssc_playMethod == 44 || tjssc_playMethod == 54 || tjssc_playMethod == 61
			|| tjssc_playMethod == 41 || tjssc_playMethod == 42 || tjssc_playMethod == 43 || tjssc_playMethod == 29 || tjssc_playMethod == 35
			|| tjssc_playMethod == 30 || tjssc_playMethod == 31 || tjssc_playMethod == 32 || tjssc_playMethod == 40 || tjssc_playMethod == 36
			|| tjssc_playMethod == 19 || tjssc_playMethod == 20 || tjssc_playMethod == 21 || tjssc_playMethod == 46 || tjssc_playMethod == 47
			|| tjssc_playMethod == 50 || tjssc_playMethod == 57 || tjssc_playType == 8 || tjssc_playMethod == 51 || tjssc_playMethod == 58
			|| tjssc_playMethod == 52 || tjssc_playMethod == 53|| tjssc_playMethod == 59 || tjssc_playMethod == 60 || tjssc_playType == 13 || tjssc_playType == 14){
			$("#tjssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(tjssc_playType == 7 || tjssc_playMethod == 78 || tjssc_playMethod == 84 || tjssc_playMethod == 93){
			$("#tjssc_ballView div.ballView").each(function(){
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
		}else if(tjssc_playMethod == 80 || tjssc_playMethod == 81 || tjssc_playMethod == 83
			|| tjssc_playMethod == 86 || tjssc_playMethod == 87 || tjssc_playMethod == 89
			|| tjssc_playMethod == 92 || tjssc_playMethod == 95 || tjssc_playMethod == 97){
			$("#tjssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#tjssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#tjssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#tjssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#tjssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#tjssc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (tjssc_playMethod == 96 || tjssc_playMethod == 98) {
			$("#tjssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#tjssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#tjssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#tjssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#tjssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#tjssc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			tjsscValidateData("submit");
			var array = handleSingleStr($("#tjssc_single").val());
			if(tjssc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(tjssc_playMethod == 10 || tjssc_playMethod == 38 || tjssc_playMethod == 27
				|| tjssc_playMethod == 16 || tjssc_playMethod == 49 || tjssc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(tjssc_playMethod == 45 || tjssc_playMethod == 34 || tjssc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(tjssc_playMethod == 79 || tjssc_playMethod == 82 || tjssc_playMethod == 85 || tjssc_playMethod == 88 ||
				tjssc_playMethod == 89 || tjssc_playMethod == 90 || tjssc_playMethod == 91 || tjssc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#tjssc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#tjssc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#tjssc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#tjssc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#tjssc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#tjssc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#tjssc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#tjssc_fandian").val());
		submitParams.notes = $('#tjssc_zhushu').html();
		submitParams.sntuo = tjssc_sntuo;
		submitParams.multiple = $('#tjssc_beiNum').val();  //requirement
		submitParams.rebates = $('#tjssc_fandian').val();  //requirement
		submitParams.playMode = $('#tjssc_modeId').val();  //requirement
		submitParams.money = $('#tjssc_money').html();  //requirement
		submitParams.award = $('#tjssc_minAward').html();  //奖金
		submitParams.maxAward = $('#tjssc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#tjssc_ballView").empty();
		tjssc_qingkongAll();
	});
}

/**
 * [tjssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function tjssc_randomOne(){
	tjssc_qingkongAll();
	if(tjssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["tjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tjssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["tjssc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["tjssc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line2"], function(k, v){
			$("#" + "tjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line3"], function(k, v){
			$("#" + "tjssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line4"], function(k, v){
			$("#" + "tjssc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line5"], function(k, v){
			$("#" + "tjssc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["tjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["tjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tjssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["tjssc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line2"], function(k, v){
			$("#" + "tjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line3"], function(k, v){
			$("#" + "tjssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line4"], function(k, v){
			$("#" + "tjssc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(tjssc_playMethod == 37 || tjssc_playMethod == 26 || tjssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["tjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tjssc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line2"], function(k, v){
			$("#" + "tjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line3"], function(k, v){
			$("#" + "tjssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 41 || tjssc_playMethod == 30 || tjssc_playMethod == 19 || tjssc_playMethod == 68
		|| tjssc_playMethod == 52 || tjssc_playMethod == 64 || tjssc_playMethod == 66
		|| tjssc_playMethod == 59 || tjssc_playMethod == 70 || tjssc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["tjssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 42 || tjssc_playMethod == 31 || tjssc_playMethod == 20 || tjssc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["tjssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 39 || tjssc_playMethod == 28 || tjssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["tjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 43 || tjssc_playMethod == 32 || tjssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["tjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 48 || tjssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["tjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tjssc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line2"], function(k, v){
			$("#" + "tjssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 25 || tjssc_playMethod == 36 || tjssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["tjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 50 || tjssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["tjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 53 || tjssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["tjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["tjssc"]["line"+line].push(number+"");
		$.each(LotteryStorage["tjssc"]["line"+line], function(k, v){
			$("#" + "tjssc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 63 || tjssc_playMethod == 67 || tjssc_playMethod == 69 || tjssc_playMethod == 71 || tjssc_playType == 13
		|| tjssc_playMethod == 65 || tjssc_playMethod == 18 || tjssc_playMethod == 29 || tjssc_playMethod == 40 || tjssc_playMethod == 22
		|| tjssc_playMethod == 33 || tjssc_playMethod == 44 || tjssc_playMethod == 54 || tjssc_playMethod == 61
		|| tjssc_playMethod == 24 || tjssc_playMethod == 35 || tjssc_playMethod == 46 || tjssc_playMethod == 51 || tjssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["tjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 74 || tjssc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["tjssc"]["line1"].push(array[0]+"");
		LotteryStorage["tjssc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line2"], function(k, v){
			$("#" + "tjssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 75 || tjssc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["tjssc"]["line1"].push(array[0]+"");
		LotteryStorage["tjssc"]["line2"].push(array[1]+"");
		LotteryStorage["tjssc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line2"], function(k, v){
			$("#" + "tjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line3"], function(k, v){
			$("#" + "tjssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["tjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tjssc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["tjssc"]["line"+lines[0]], function(k, v){
			$("#" + "tjssc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line"+lines[1]], function(k, v){
			$("#" + "tjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["tjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tjssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["tjssc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["tjssc"]["line"+lines[0]], function(k, v){
			$("#" + "tjssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line"+lines[1]], function(k, v){
			$("#" + "tjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line"+lines[0]], function(k, v){
			$("#" + "tjssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["tjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tjssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["tjssc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["tjssc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["tjssc"]["line"+lines[0]], function(k, v){
			$("#" + "tjssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line"+lines[1]], function(k, v){
			$("#" + "tjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line"+lines[2]], function(k, v){
			$("#" + "tjssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tjssc"]["line"+lines[3]], function(k, v){
			$("#" + "tjssc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(tjssc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["tjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["tjssc"]["line1"], function(k, v){
			$("#" + "tjssc_line1" + v).toggleClass("redBalls_active");
		});
	}
	tjssc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function tjssc_checkOutRandom(playMethod){
	var obj = new Object();
	if(tjssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tjssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(tjssc_playMethod == 18 || tjssc_playMethod == 29 || tjssc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(tjssc_playMethod == 22 || tjssc_playMethod == 33 || tjssc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(tjssc_playMethod == 54 || tjssc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(tjssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tjssc_playMethod == 37 || tjssc_playMethod == 26 || tjssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tjssc_playMethod == 39 || tjssc_playMethod == 28 || tjssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(tjssc_playMethod == 41 || tjssc_playMethod == 30 || tjssc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(tjssc_playMethod == 52 || tjssc_playMethod == 59 || tjssc_playMethod == 64 || tjssc_playMethod == 66 || tjssc_playMethod == 68
		||tjssc_playMethod == 70 || tjssc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(tjssc_playMethod == 42 || tjssc_playMethod == 31 || tjssc_playMethod == 20 || tjssc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(tjssc_playMethod == 43 || tjssc_playMethod == 32 || tjssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(tjssc_playMethod == 48 || tjssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tjssc_playMethod == 50 || tjssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(tjssc_playMethod == 53 || tjssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(tjssc_playMethod == 62){
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
	}else if(tjssc_playMethod == 63 || tjssc_playMethod == 65 || tjssc_playMethod == 67 || tjssc_playMethod == 69 || tjssc_playMethod == 71
		|| tjssc_playMethod == 24 || tjssc_playMethod == 35 || tjssc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(tjssc_playMethod == 25 || tjssc_playMethod == 36 || tjssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(tjssc_playMethod == 51 || tjssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(tjssc_playMethod == 74 || tjssc_playMethod == 76){
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
	}else if(tjssc_playMethod == 75 || tjssc_playMethod == 77){
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
	}else if(tjssc_playMethod == 78){
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
	}else if(tjssc_playMethod == 84){
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
	}else if(tjssc_playMethod == 93){
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
	obj.sntuo = tjssc_sntuo;
	obj.multiple = 1;
	obj.rebates = tjssc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('tjssc',tjssc_playMethod,obj);  //机选奖金计算
	obj.award = $('#tjssc_minAward').html();     //奖金
	obj.maxAward = $('#tjssc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [tjsscValidateData 单式数据验证]
 */
function tjsscValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#tjssc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	tjsscValidData(textStr,type);
}

function tjsscValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(tjssc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 38 || tjssc_playMethod == 27 || tjssc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 45 || tjssc_playMethod == 34 || tjssc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 49 || tjssc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,2);
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,2);
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,3);
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,3);
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,3);
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,3);
		tjsscShowFooter(true,notes);
	}else if(tjssc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tjssc_tab .button.red").size() ,4);
		tjsscShowFooter(true,notes);
	}

	$('#tjssc_delRepeat').off('click');
	$('#tjssc_delRepeat').on('click',function () {
		content.str = $('#tjssc_single').val() ? $('#tjssc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		tjsscShowFooter(true,notes);
		$("#tjssc_single").val(array.join(" "));
	});

	$("#tjssc_single").val(array.join(" "));
	return notes;
}

function tjsscShowFooter(isValid,notes){
	$('#tjssc_zhushu').text(notes);
	if($("#tjssc_modeId").val() == "8"){
		$('#tjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tjssc_beiNum").val()),0.002));
	}else if ($("#tjssc_modeId").val() == "2"){
		$('#tjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tjssc_beiNum").val()),0.2));
	}else if ($("#tjssc_modeId").val() == "1"){
		$('#tjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tjssc_beiNum").val()),0.02));
	}else{
		$('#tjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tjssc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	tjssc_initFooterButton();
	calcAwardWin('tjssc',tjssc_playMethod);  //计算奖金和盈利
}