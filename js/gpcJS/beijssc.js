var beijssc_playType = 2;
var beijssc_playMethod = 15;
var beijssc_sntuo = 0;
var beijssc_rebate;
var beijsscScroll;

//进入这个页面时调用
function beijsscPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("beijssc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("beijssc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function beijsscPageUnloadedPanel(){
	$("#beijssc_queding").off('click');
	$("#beijsscPage_back").off('click');
	$("#beijssc_ballView").empty();
	$("#beijsscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="beijsscPlaySelect"></select>');
	$("#beijsscSelect").append($select);
}

//入口函数
function beijssc_init(){
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
	$("#beijssc_title").html(LotteryInfo.getLotteryNameByTag("beijssc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == beijssc_playType && j == beijssc_playMethod){
					$play.append('<option value="beijssc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="beijssc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(beijssc_playMethod,onShowArray)>-1 ){
						beijssc_playType = i;
						beijssc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#beijsscPlaySelect").append($play);
		}
	}
	
	if($("#beijsscPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("beijsscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:beijsscChangeItem
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

	GetLotteryInfo("beijssc",function (){
		beijsscChangeItem("beijssc"+beijssc_playMethod);
	});

	//添加滑动条
	if(!beijsscScroll){
		beijsscScroll = new IScroll('#beijsscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("beijssc",LotteryInfo.getLotteryIdByTag("beijssc"));

	//获取上一期开奖
	queryLastPrize("beijssc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('beijssc');

	//机选选号
	$("#beijssc_random").on('click', function(event) {
		beijssc_randomOne();
	});
	
	$("#beijssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",beijssc_playMethod));
	//玩法说明
	$("#beijssc_paly_shuoming").off('click');
	$("#beijssc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#beijssc_shuoming").text());
	});

	//返回
	$("#beijsscPage_back").on('click', function(event) {
		// beijssc_playType = 2;
		// beijssc_playMethod = 15;
		$("#beijssc_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		beijssc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("beijssc");//清空
	beijssc_submitData();
}

function beijsscResetPlayType(){
	beijssc_playType = 2;
	beijssc_playMethod = 15;
}

function beijsscChangeItem(val) {
	beijssc_qingkongAll();
	var temp = val.substring("beijssc".length,val.length);
	if(val == "beijssc0"){
		//直选复式
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 0;
		beijssc_playMethod = 0;
		createFiveLineLayout("beijssc", function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc1"){
		//直选单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 0;
		beijssc_playMethod = 1;
		$("#beijssc_ballView").empty();
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc2"){
		//组选120
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 0;
		beijssc_playMethod = 2;
		createOneLineLayout("beijssc","至少选择5个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc3"){
		//组选60
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 0;
		beijssc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc4"){
		//组选30
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 0;
		beijssc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc5"){
		//组选20
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 0;
		beijssc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc6"){
		//组选10
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 0;
		beijssc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc7"){
		//组选5
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 0;
		beijssc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc8"){
		//总和大小单双
		$("#beijssc_random").show();
		var num = ["大","小","单","双"];
		beijssc_sntuo = 0;
		beijssc_playType = 0;
		beijssc_playMethod = 8;
		createNonNumLayout("beijssc",beijssc_playMethod,num,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc9"){
		//直选复式
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 1;
		beijssc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("beijssc",tips, function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc10"){
		//直选单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 1;
		beijssc_playMethod = 10;
		$("#beijssc_ballView").empty();
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc11"){
		//组选24
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 1;
		beijssc_playMethod = 11;
		createOneLineLayout("beijssc","至少选择4个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc12"){
		//组选12
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 1;
		beijssc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc13"){
		//组选6
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 1;
		beijssc_playMethod = 13;
		createOneLineLayout("beijssc","二重号:至少选择2个号码",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc14"){
		//组选4
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 1;
		beijssc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc15"){
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc16"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 2;
		beijssc_playMethod = 16;
		$("#beijssc_ballView").empty();
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc17"){
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 17;
		createSumLayout("beijssc",0,27,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc18"){
		//直选跨度
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 18;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc19"){
		//后三组三
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 19;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc20"){
		//后三组六
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 20;
		createOneLineLayout("beijssc","至少选择3个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc21"){
		//后三和值
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 21;
		createSumLayout("beijssc",1,26,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc22"){
		//后三组选包胆
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 22;
		beijssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("beijssc",array,["请选择一个号码"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc23"){
		//后三混合组选
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 2;
		beijssc_playMethod = 23;
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc24"){
		//和值尾数
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 24;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc25"){
		//特殊号
		$("#beijssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		beijssc_sntuo = 0;
		beijssc_playType = 2;
		beijssc_playMethod = 25;
		createNonNumLayout("beijssc",beijssc_playMethod,num,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc26"){
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc27"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 3;
		beijssc_playMethod = 27;
		$("#beijssc_ballView").empty();
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc28"){
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 28;
		createSumLayout("beijssc",0,27,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc29"){
		//直选跨度
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 29;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc30"){
		//中三组三
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 30;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc31"){
		//中三组六
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 31;
		createOneLineLayout("beijssc","至少选择3个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc32"){
		//中三和值
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 32;
		createSumLayout("beijssc",1,26,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc33"){
		//中三组选包胆
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 33;
		beijssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("beijssc",array,["请选择一个号码"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc34"){
		//中三混合组选
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 3;
		beijssc_playMethod = 34;
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc35"){
		//和值尾数
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 35;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc36"){
		//特殊号
		$("#beijssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		beijssc_sntuo = 0;
		beijssc_playType = 3;
		beijssc_playMethod = 36;
		createNonNumLayout("beijssc",beijssc_playMethod,num,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc37"){
		//直选复式
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc38"){
		//直选单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 4;
		beijssc_playMethod = 38;
		$("#beijssc_ballView").empty();
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc39"){
		//和值
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 39;
		createSumLayout("beijssc",0,27,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc40"){
		//直选跨度
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 40;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc41"){
		//前三组三
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 41;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc42"){
		//前三组六
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 42;
		createOneLineLayout("beijssc","至少选择3个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc43"){
		//前三和值
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 43;
		createSumLayout("beijssc",1,26,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc44"){
		//前三组选包胆
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 44;
		beijssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("beijssc",array,["请选择一个号码"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc45"){
		//前三混合组选
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 4;
		beijssc_playMethod = 45;
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc46"){
		//和值尾数
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 46;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc47"){
		//特殊号
		$("#beijssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		beijssc_sntuo = 0;
		beijssc_playType = 4;
		beijssc_playMethod = 47;
		createNonNumLayout("beijssc",beijssc_playMethod,num,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc48"){
		//后二复式
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 5;
		beijssc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc49"){
		//后二单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 5;
		beijssc_playMethod = 49;
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc50"){
		//后二和值
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 5;
		beijssc_playMethod = 50;
		createSumLayout("beijssc",0,18,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc51"){
		//直选跨度
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 5;
		beijssc_playMethod = 51;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc52"){
		//后二组选
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 5;
		beijssc_playMethod = 52;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc53"){
		//后二和值
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 5;
		beijssc_playMethod = 53;
		createSumLayout("beijssc",1,17,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc54"){
		//后二组选包胆
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 5;
		beijssc_playMethod = 54;
		beijssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("beijssc",array,["请选择一个号码"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc55"){
		//前二复式
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 6;
		beijssc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc56"){
		//前二单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 6;
		beijssc_playMethod = 56;
		beijssc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
	}else if(val == "beijssc57"){
		//前二和值
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 6;
		beijssc_playMethod = 57;
		createSumLayout("beijssc",0,18,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc58"){
		//直选跨度
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 6;
		beijssc_playMethod = 58;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc59"){
		//前二组选
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 6;
		beijssc_playMethod = 59;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc60"){
		//前二和值
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 6;
		beijssc_playMethod = 60;
		createSumLayout("beijssc",1,17,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc61"){
		//前二组选包胆
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 6;
		beijssc_playMethod = 61;
		beijssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("beijssc",array,["请选择一个号码"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc62"){
		//定位复式
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 7;
		beijssc_playMethod = 62;
		createFiveLineLayout("beijssc", function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc63"){
		//后三一码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 63;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc64"){
		//后三二码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 64;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc65"){
		//前三一码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 65;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc66"){
		//前三二码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 66;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc67"){
		//后四一码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 67;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc68"){
		//后四二码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 68;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc69"){
		//前四一码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 69;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc70"){
		//前四二码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 70;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc71"){
		//五星一码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 71;
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc72"){
		//五星二码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 72;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc73"){
		//五星三码
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 8;
		beijssc_playMethod = 73;
		createOneLineLayout("beijssc","至少选择3个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc74"){
		//后二大小单双
		beijssc_qingkongAll();
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 9;
		beijssc_playMethod = 74;
		createTextBallTwoLayout("beijssc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc75"){
		//后三大小单双
		beijssc_qingkongAll();
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 9;
		beijssc_playMethod = 75;
		createTextBallThreeLayout("beijssc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc76"){
		//前二大小单双
		beijssc_qingkongAll();
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 9;
		beijssc_playMethod = 76;
		createTextBallTwoLayout("beijssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc77"){
		//前三大小单双
		beijssc_qingkongAll();
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 9;
		beijssc_playMethod = 77;
		createTextBallThreeLayout("beijssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc78"){
		//直选复式
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 10;
		beijssc_playMethod = 78;
		createFiveLineLayout("beijssc",function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc79"){
		//直选单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 10;
		beijssc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
		createRenXuanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc80"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 10;
		beijssc_playMethod = 80;
		createSumLayout("beijssc",0,18,function(){
			beijssc_calcNotes();
		});
		createRenXuanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc81"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 10;
		beijssc_playMethod = 81;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		createRenXuanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc82"){
		//组选单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 10;
		beijssc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
		createRenXuanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc83"){
		//组选和值
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 10;
		beijssc_playMethod = 83;
		createSumLayout("beijssc",1,17,function(){
			beijssc_calcNotes();
		});
		createRenXuanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc84"){
		//直选复式
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 11;
		beijssc_playMethod = 84;
		createFiveLineLayout("beijssc", function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc85"){
		//直选单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 11;
		beijssc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
		createRenXuanSanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc86"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 11;
		beijssc_playMethod = 86;
		createSumLayout("beijssc",0,27,function(){
			beijssc_calcNotes();
		});
		createRenXuanSanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc87"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 11;
		beijssc_playMethod = 87;
		createOneLineLayout("beijssc","至少选择2个",0,9,false,function(){
			beijssc_calcNotes();
		});
		createRenXuanSanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc88"){
		//组选单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 11;
		beijssc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
		createRenXuanSanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc89"){
		//组选和值
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 11;
		beijssc_playMethod = 89;
		createOneLineLayout("beijssc","至少选择3个",0,9,false,function(){
			beijssc_calcNotes();
		});
		createRenXuanSanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc90"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 11;
		beijssc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
		createRenXuanSanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc91"){
		//混合组选
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 11;
		beijssc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
		createRenXuanSanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc92"){
		//组选和值
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 11;
		beijssc_playMethod = 92;
		createSumLayout("beijssc",1,26,function(){
			beijssc_calcNotes();
		});
		createRenXuanSanLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc93"){
		$("#beijssc_random").show();
		beijssc_sntuo = 0;
		beijssc_playType = 12;
		beijssc_playMethod = 93;
		createFiveLineLayout("beijssc", function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc94"){
		//直选单式
		$("#beijssc_random").hide();
		beijssc_sntuo = 3;
		beijssc_playType = 12;
		beijssc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("beijssc",tips);
		createRenXuanSiLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc95"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 12;
		beijssc_playMethod = 95;
		createOneLineLayout("beijssc","至少选择4个",0,9,false,function(){
			beijssc_calcNotes();
		});
		createRenXuanSiLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc96"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 12;
		beijssc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		createRenXuanSiLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc97"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 12;
		beijssc_playMethod = 97;
		$("#beijssc_ballView").empty();
		createOneLineLayout("beijssc","二重号:至少选择2个号码",0,9,false,function(){
			beijssc_calcNotes();
		});
		createRenXuanSiLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc98"){
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 12;
		beijssc_playMethod = 98;
		$("#beijssc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("beijssc",tips,0,9,false,function(){
			beijssc_calcNotes();
		});
		createRenXuanSiLayout("beijssc",beijssc_playMethod,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc99"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 13;
		beijssc_playMethod = 99;
		$("#beijssc_ballView").empty();
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc100"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 13;
		beijssc_playMethod = 100;
		$("#beijssc_ballView").empty();
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc101"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 13;
		beijssc_playMethod = 101;
		$("#beijssc_ballView").empty();
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc102"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 13;
		beijssc_playMethod = 102;
		$("#beijssc_ballView").empty();
		createOneLineLayout("beijssc","至少选择1个",0,9,false,function(){
			beijssc_calcNotes();
		});
		beijssc_qingkongAll();
	}else if(val == "beijssc103"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 103;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc104"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 104;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc105"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 105;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc106"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 106;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc107"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 107;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc108"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 108;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc109"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 109;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc110"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 110;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc111"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 111;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}else if(val == "beijssc112"){
		beijssc_qingkongAll();
		$("#beijssc_random").hide();
		beijssc_sntuo = 0;
		beijssc_playType = 14;
		beijssc_playMethod = 112;
		createTextBallOneLayout("beijssc",["龙","虎","和"],["至少选择一个"],function(){
			beijssc_calcNotes();
		});
	}

	if(beijsscScroll){
		beijsscScroll.refresh();
		beijsscScroll.scrollTo(0,0,1);
	}
	
	$("#beijssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("beijssc",temp);
	hideRandomWhenLi("beijssc",beijssc_sntuo,beijssc_playMethod);
	beijssc_calcNotes();
}
/**
 * [beijssc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function beijssc_initFooterButton(){
	if(beijssc_playMethod == 0 || beijssc_playMethod == 62 || beijssc_playMethod == 78
		|| beijssc_playMethod == 84 || beijssc_playMethod == 93 || beijssc_playType == 7){
		if(LotteryStorage["beijssc"]["line1"].length > 0 || LotteryStorage["beijssc"]["line2"].length > 0 ||
			LotteryStorage["beijssc"]["line3"].length > 0 || LotteryStorage["beijssc"]["line4"].length > 0 ||
			LotteryStorage["beijssc"]["line5"].length > 0){
			$("#beijssc_qingkong").css("opacity",1.0);
		}else{
			$("#beijssc_qingkong").css("opacity",0.4);
		}
	}else if(beijssc_playMethod == 9){
		if(LotteryStorage["beijssc"]["line1"].length > 0 || LotteryStorage["beijssc"]["line2"].length > 0 ||
			LotteryStorage["beijssc"]["line3"].length > 0 || LotteryStorage["beijssc"]["line4"].length > 0 ){
			$("#beijssc_qingkong").css("opacity",1.0);
		}else{
			$("#beijssc_qingkong").css("opacity",0.4);
		}
	}else if(beijssc_playMethod == 37 || beijssc_playMethod == 4 || beijssc_playMethod == 6
		|| beijssc_playMethod == 26 || beijssc_playMethod == 15 || beijssc_playMethod == 75 || beijssc_playMethod == 77){
		if(LotteryStorage["beijssc"]["line1"].length > 0 || LotteryStorage["beijssc"]["line2"].length > 0
			|| LotteryStorage["beijssc"]["line3"].length > 0){
			$("#beijssc_qingkong").css("opacity",1.0);
		}else{
			$("#beijssc_qingkong").css("opacity",0.4);
		}
	}else if(beijssc_playMethod == 3 || beijssc_playMethod == 4 || beijssc_playMethod == 5
		|| beijssc_playMethod == 6 || beijssc_playMethod == 7 || beijssc_playMethod == 12
		|| beijssc_playMethod == 14 || beijssc_playMethod == 48 || beijssc_playMethod == 55
		|| beijssc_playMethod == 74 || beijssc_playMethod == 76 || beijssc_playMethod == 96 || beijssc_playMethod == 98){
		if(LotteryStorage["beijssc"]["line1"].length > 0 || LotteryStorage["beijssc"]["line2"].length > 0){
			$("#beijssc_qingkong").css("opacity",1.0);
		}else{
			$("#beijssc_qingkong").css("opacity",0.4);
		}
	}else if(beijssc_playMethod == 2 || beijssc_playMethod == 8 || beijssc_playMethod == 11 || beijssc_playMethod == 13 || beijssc_playMethod == 39
		|| beijssc_playMethod == 28 || beijssc_playMethod == 17 || beijssc_playMethod == 18 || beijssc_playMethod == 24 || beijssc_playMethod == 41
		|| beijssc_playMethod == 25 || beijssc_playMethod == 29 || beijssc_playMethod == 42 || beijssc_playMethod == 43 || beijssc_playMethod == 30
		|| beijssc_playMethod == 35 || beijssc_playMethod == 36 || beijssc_playMethod == 31 || beijssc_playMethod == 32 || beijssc_playMethod == 19
		|| beijssc_playMethod == 40 || beijssc_playMethod == 46 || beijssc_playMethod == 20 || beijssc_playMethod == 21 || beijssc_playMethod == 50
		|| beijssc_playMethod == 47 || beijssc_playMethod == 51 || beijssc_playMethod == 52 || beijssc_playMethod == 53 || beijssc_playMethod == 57 || beijssc_playMethod == 63
		|| beijssc_playMethod == 58 || beijssc_playMethod == 59 || beijssc_playMethod == 60 || beijssc_playMethod == 65 || beijssc_playMethod == 80 || beijssc_playMethod == 81 || beijssc_playType == 8
		|| beijssc_playMethod == 83 || beijssc_playMethod == 86 || beijssc_playMethod == 87 || beijssc_playMethod == 22 || beijssc_playMethod == 33 || beijssc_playMethod == 44
		|| beijssc_playMethod == 89 || beijssc_playMethod == 92 || beijssc_playMethod == 95 || beijssc_playMethod == 54 || beijssc_playMethod == 61
		|| beijssc_playMethod == 97 || beijssc_playType == 13  || beijssc_playType == 14){
		if(LotteryStorage["beijssc"]["line1"].length > 0){
			$("#beijssc_qingkong").css("opacity",1.0);
		}else{
			$("#beijssc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#beijssc_qingkong").css("opacity",0);
	}

	if($("#beijssc_qingkong").css("opacity") == "0"){
		$("#beijssc_qingkong").css("display","none");
	}else{
		$("#beijssc_qingkong").css("display","block");
	}

	if($('#beijssc_zhushu').html() > 0){
		$("#beijssc_queding").css("opacity",1.0);
	}else{
		$("#beijssc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  beijssc_qingkongAll(){
	$("#beijssc_ballView span").removeClass('redBalls_active');
	LotteryStorage["beijssc"]["line1"] = [];
	LotteryStorage["beijssc"]["line2"] = [];
	LotteryStorage["beijssc"]["line3"] = [];
	LotteryStorage["beijssc"]["line4"] = [];
	LotteryStorage["beijssc"]["line5"] = [];

	localStorageUtils.removeParam("beijssc_line1");
	localStorageUtils.removeParam("beijssc_line2");
	localStorageUtils.removeParam("beijssc_line3");
	localStorageUtils.removeParam("beijssc_line4");
	localStorageUtils.removeParam("beijssc_line5");

	$('#beijssc_zhushu').text(0);
	$('#beijssc_money').text(0);
	clearAwardWin("beijssc");
	beijssc_initFooterButton();
}

/**
 * [beijssc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function beijssc_calcNotes(){
	$('#beijssc_modeId').blur();
	$('#beijssc_fandian').blur();
	
	var notes = 0;

	if(beijssc_playMethod == 0){
		notes = LotteryStorage["beijssc"]["line1"].length *
			LotteryStorage["beijssc"]["line2"].length *
			LotteryStorage["beijssc"]["line3"].length *
			LotteryStorage["beijssc"]["line4"].length *
			LotteryStorage["beijssc"]["line5"].length;
	}else if(beijssc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,5);
	}else if(beijssc_playMethod == 3){
		if (LotteryStorage["beijssc"]["line1"].length >= 1 && LotteryStorage["beijssc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["beijssc"]["line1"],LotteryStorage["beijssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(beijssc_playMethod == 4){
		if (LotteryStorage["beijssc"]["line1"].length >= 2 && LotteryStorage["beijssc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["beijssc"]["line2"],LotteryStorage["beijssc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(beijssc_playMethod == 5 || beijssc_playMethod == 12){
		if (LotteryStorage["beijssc"]["line1"].length >= 1 && LotteryStorage["beijssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["beijssc"]["line1"],LotteryStorage["beijssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(beijssc_playMethod == 6 || beijssc_playMethod == 7 || beijssc_playMethod == 14){
		if (LotteryStorage["beijssc"]["line1"].length >= 1 && LotteryStorage["beijssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["beijssc"]["line1"],LotteryStorage["beijssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(beijssc_playMethod == 9){
		notes = LotteryStorage["beijssc"]["line1"].length *
			LotteryStorage["beijssc"]["line2"].length *
			LotteryStorage["beijssc"]["line3"].length *
			LotteryStorage["beijssc"]["line4"].length;
	}else if(beijssc_playMethod == 18 || beijssc_playMethod == 29 || beijssc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["beijssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(beijssc_playMethod == 22 || beijssc_playMethod == 33 || beijssc_playMethod == 44 ){
		notes = 54;
	}else if(beijssc_playMethod == 54 || beijssc_playMethod == 61){
		notes = 9;
	}else if(beijssc_playMethod == 51 || beijssc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["beijssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(beijssc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,4);
	}else if(beijssc_playMethod == 13|| beijssc_playMethod == 64 || beijssc_playMethod == 66 || beijssc_playMethod == 68 || beijssc_playMethod == 70 || beijssc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,2);
	}else if(beijssc_playMethod == 37 || beijssc_playMethod == 26 || beijssc_playMethod == 15 || beijssc_playMethod == 75 || beijssc_playMethod == 77){
		notes = LotteryStorage["beijssc"]["line1"].length *
			LotteryStorage["beijssc"]["line2"].length *
			LotteryStorage["beijssc"]["line3"].length ;
	}else if(beijssc_playMethod == 39 || beijssc_playMethod == 28 || beijssc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["beijssc"]["line1"][i]);
		};
	}else if(beijssc_playMethod == 41 || beijssc_playMethod == 30 || beijssc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["beijssc"]["line1"].length,2);
	}else if(beijssc_playMethod == 42 || beijssc_playMethod == 31 || beijssc_playMethod == 20 || beijssc_playMethod == 68 || beijssc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,3);
	}else if(beijssc_playMethod == 43 || beijssc_playMethod == 32 || beijssc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["beijssc"]["line1"][i]);
		};
	}else if(beijssc_playMethod == 48 || beijssc_playMethod == 55 || beijssc_playMethod == 74 || beijssc_playMethod == 76){
		notes = LotteryStorage["beijssc"]["line1"].length *
			LotteryStorage["beijssc"]["line2"].length ;
	}else if(beijssc_playMethod == 50 || beijssc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["beijssc"]["line1"][i]);
		};
	}else if(beijssc_playMethod == 52 || beijssc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,2);
	}else if(beijssc_playMethod == 53 || beijssc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["beijssc"]["line1"][i]);
		};
	}else if(beijssc_playMethod == 62){
		notes = LotteryStorage["beijssc"]["line1"].length +
			LotteryStorage["beijssc"]["line2"].length +
			LotteryStorage["beijssc"]["line3"].length +
			LotteryStorage["beijssc"]["line4"].length +
			LotteryStorage["beijssc"]["line5"].length;
	}else if(beijssc_playType == 13 || beijssc_playType == 14 || beijssc_playMethod == 8 || beijssc_playMethod == 71
		|| beijssc_playMethod == 24 || beijssc_playMethod == 25 || beijssc_playMethod == 35 || beijssc_playMethod == 36 || beijssc_playMethod == 46
		|| beijssc_playMethod == 47 || beijssc_playMethod == 63 || beijssc_playMethod == 65 || beijssc_playMethod == 67 || beijssc_playMethod == 69 ){
		notes = LotteryStorage["beijssc"]["line1"].length ;
	}else if(beijssc_playMethod == 78){
		notes = LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line2"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line3"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line4"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line3"].length +
			LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line4"].length +
			LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line4"].length +
			LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line4"].length * LotteryStorage["beijssc"]["line5"].length;
	}else if (beijssc_playMethod == 80) {
		if ($("#beijssc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["beijssc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,2);
		}
	}else if (beijssc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,2) * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,2);
	}else if (beijssc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["beijssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,2);
	}else if (beijssc_playMethod == 84) {
		notes = LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line3"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line4"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line4"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line4"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line4"].length +
			LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line4"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line4"].length * LotteryStorage["beijssc"]["line5"].length ;
	}else if (beijssc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["beijssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,3);
	}else if (beijssc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["beijssc"]["line1"].length,2) * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,3);
	}else if (beijssc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,3) * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,3);
	}else if (beijssc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["beijssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["beijssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,3);
	}else if (beijssc_playMethod == 93) {
		notes = LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line4"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line4"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line1"].length * LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line4"].length * LotteryStorage["beijssc"]["line5"].length +
			LotteryStorage["beijssc"]["line2"].length * LotteryStorage["beijssc"]["line3"].length * LotteryStorage["beijssc"]["line4"].length * LotteryStorage["beijssc"]["line5"].length;
	}else if (beijssc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,4)
			* mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,4);
	}else if (beijssc_playMethod == 96) {
		if (LotteryStorage["beijssc"]["line1"].length >= 1 && LotteryStorage["beijssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["beijssc"]["line1"],LotteryStorage["beijssc"]["line2"])
				* mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (beijssc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["beijssc"]["line1"].length,2) * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,4);
	}else if (beijssc_playMethod == 98) {
		if (LotteryStorage["beijssc"]["line1"].length >= 1 && LotteryStorage["beijssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["beijssc"]["line1"],LotteryStorage["beijssc"]["line2"]) * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = beijsscValidData($("#beijssc_single").val());
	}

	if(beijssc_sntuo == 3 || beijssc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","beijssc"),LotteryInfo.getMethodId("ssc",beijssc_playMethod))){
	}else{
		if(parseInt($('#beijssc_modeId').val()) == 8){
			$("#beijssc_random").hide();
		}else{
			$("#beijssc_random").show();
		}
	}

	//验证是否为空
	if( $("#beijssc_beiNum").val() =="" || parseInt($("#beijssc_beiNum").val()) == 0){
		$("#beijssc_beiNum").val(1);
	}

	//验证慢彩最大倍数
	if($("#beijssc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#beijssc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#beijssc_zhushu').text(notes);
		if($("#beijssc_modeId").val() == "8"){
			$('#beijssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijssc_beiNum").val()),0.002));
		}else if ($("#beijssc_modeId").val() == "2"){
			$('#beijssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijssc_beiNum").val()),0.2));
		}else if ($("#beijssc_modeId").val() == "1"){
			$('#beijssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijssc_beiNum").val()),0.02));
		}else{
			$('#beijssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijssc_beiNum").val()),2));
		}
	} else {
		$('#beijssc_zhushu').text(0);
		$('#beijssc_money').text(0);
	}
	beijssc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('beijssc',beijssc_playMethod);
}

/**
 * [beijssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function beijssc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#beijssc_queding").bind('click', function(event) {
		beijssc_rebate = $("#beijssc_fandian option:last").val();
		if(parseInt($('#beijssc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		beijssc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#beijssc_modeId').val()) == 8){
			if (Number($('#beijssc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('beijssc',beijssc_playMethod);

		submitParams.lotteryType = "beijssc";
		var play = LotteryInfo.getPlayName("ssc",beijssc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",beijssc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = beijssc_playType;
		submitParams.playMethodIndex = beijssc_playMethod;
		var selectedBalls = [];
		if(beijssc_playMethod == 0 || beijssc_playMethod == 3 || beijssc_playMethod == 4
			|| beijssc_playMethod == 5 || beijssc_playMethod == 6 || beijssc_playMethod == 7
			|| beijssc_playMethod == 9 || beijssc_playMethod == 12 || beijssc_playMethod == 14
			|| beijssc_playMethod == 37 || beijssc_playMethod == 26 || beijssc_playMethod == 15
			|| beijssc_playMethod == 48 || beijssc_playMethod == 55 || beijssc_playMethod == 74 || beijssc_playType == 9){
			$("#beijssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(beijssc_playMethod == 2 || beijssc_playMethod == 8 || beijssc_playMethod == 11 || beijssc_playMethod == 13 || beijssc_playMethod == 24
			|| beijssc_playMethod == 39 || beijssc_playMethod == 28 || beijssc_playMethod == 17 || beijssc_playMethod == 18 || beijssc_playMethod == 25
			|| beijssc_playMethod == 22 || beijssc_playMethod == 33 || beijssc_playMethod == 44 || beijssc_playMethod == 54 || beijssc_playMethod == 61
			|| beijssc_playMethod == 41 || beijssc_playMethod == 42 || beijssc_playMethod == 43 || beijssc_playMethod == 29 || beijssc_playMethod == 35
			|| beijssc_playMethod == 30 || beijssc_playMethod == 31 || beijssc_playMethod == 32 || beijssc_playMethod == 40 || beijssc_playMethod == 36
			|| beijssc_playMethod == 19 || beijssc_playMethod == 20 || beijssc_playMethod == 21 || beijssc_playMethod == 46 || beijssc_playMethod == 47
			|| beijssc_playMethod == 50 || beijssc_playMethod == 57 || beijssc_playType == 8 || beijssc_playMethod == 51 || beijssc_playMethod == 58
			|| beijssc_playMethod == 52 || beijssc_playMethod == 53|| beijssc_playMethod == 59 || beijssc_playMethod == 60 || beijssc_playType == 13 || beijssc_playType == 14){
			$("#beijssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(beijssc_playType == 7 || beijssc_playMethod == 78 || beijssc_playMethod == 84 || beijssc_playMethod == 93){
			$("#beijssc_ballView div.ballView").each(function(){
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
		}else if(beijssc_playMethod == 80 || beijssc_playMethod == 81 || beijssc_playMethod == 83
			|| beijssc_playMethod == 86 || beijssc_playMethod == 87 || beijssc_playMethod == 89
			|| beijssc_playMethod == 92 || beijssc_playMethod == 95 || beijssc_playMethod == 97){
			$("#beijssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#beijssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#beijssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#beijssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#beijssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#beijssc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (beijssc_playMethod == 96 || beijssc_playMethod == 98) {
			$("#beijssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#beijssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#beijssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#beijssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#beijssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#beijssc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			beijsscValidateData("submit");
			var array = handleSingleStr($("#beijssc_single").val());
			if(beijssc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(beijssc_playMethod == 10 || beijssc_playMethod == 38 || beijssc_playMethod == 27
				|| beijssc_playMethod == 16 || beijssc_playMethod == 49 || beijssc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(beijssc_playMethod == 45 || beijssc_playMethod == 34 || beijssc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(beijssc_playMethod == 79 || beijssc_playMethod == 82 || beijssc_playMethod == 85 || beijssc_playMethod == 88 ||
				beijssc_playMethod == 89 || beijssc_playMethod == 90 || beijssc_playMethod == 91 || beijssc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#beijssc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#beijssc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#beijssc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#beijssc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#beijssc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#beijssc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#beijssc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#beijssc_fandian").val());
		submitParams.notes = $('#beijssc_zhushu').html();
		submitParams.sntuo = beijssc_sntuo;
		submitParams.multiple = $('#beijssc_beiNum').val();  //requirement
		submitParams.rebates = $('#beijssc_fandian').val();  //requirement
		submitParams.playMode = $('#beijssc_modeId').val();  //requirement
		submitParams.money = $('#beijssc_money').html();  //requirement
		submitParams.award = $('#beijssc_minAward').html();  //奖金
		submitParams.maxAward = $('#beijssc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#beijssc_ballView").empty();
		beijssc_qingkongAll();
	});
}

/**
 * [beijssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function beijssc_randomOne(){
	beijssc_qingkongAll();
	if(beijssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["beijssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["beijssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["beijssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["beijssc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["beijssc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line2"], function(k, v){
			$("#" + "beijssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line3"], function(k, v){
			$("#" + "beijssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line4"], function(k, v){
			$("#" + "beijssc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line5"], function(k, v){
			$("#" + "beijssc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["beijssc"]["line1"].push(number+"");
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["beijssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["beijssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["beijssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["beijssc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line2"], function(k, v){
			$("#" + "beijssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line3"], function(k, v){
			$("#" + "beijssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line4"], function(k, v){
			$("#" + "beijssc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(beijssc_playMethod == 37 || beijssc_playMethod == 26 || beijssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["beijssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["beijssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["beijssc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line2"], function(k, v){
			$("#" + "beijssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line3"], function(k, v){
			$("#" + "beijssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 41 || beijssc_playMethod == 30 || beijssc_playMethod == 19 || beijssc_playMethod == 68
		|| beijssc_playMethod == 52 || beijssc_playMethod == 64 || beijssc_playMethod == 66
		|| beijssc_playMethod == 59 || beijssc_playMethod == 70 || beijssc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["beijssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 42 || beijssc_playMethod == 31 || beijssc_playMethod == 20 || beijssc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["beijssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 39 || beijssc_playMethod == 28 || beijssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["beijssc"]["line1"].push(number+'');
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 43 || beijssc_playMethod == 32 || beijssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["beijssc"]["line1"].push(number+'');
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 48 || beijssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["beijssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["beijssc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line2"], function(k, v){
			$("#" + "beijssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 25 || beijssc_playMethod == 36 || beijssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["beijssc"]["line1"].push(number+"");
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 50 || beijssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["beijssc"]["line1"].push(number+"");
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 53 || beijssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["beijssc"]["line1"].push(number+"");
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["beijssc"]["line"+line].push(number+"");
		$.each(LotteryStorage["beijssc"]["line"+line], function(k, v){
			$("#" + "beijssc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 63 || beijssc_playMethod == 67 || beijssc_playMethod == 69 || beijssc_playMethod == 71 || beijssc_playType == 13
		|| beijssc_playMethod == 65 || beijssc_playMethod == 18 || beijssc_playMethod == 29 || beijssc_playMethod == 40 || beijssc_playMethod == 22
		|| beijssc_playMethod == 33 || beijssc_playMethod == 44 || beijssc_playMethod == 54 || beijssc_playMethod == 61
		|| beijssc_playMethod == 24 || beijssc_playMethod == 35 || beijssc_playMethod == 46 || beijssc_playMethod == 51 || beijssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["beijssc"]["line1"].push(number+'');
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 74 || beijssc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["beijssc"]["line1"].push(array[0]+"");
		LotteryStorage["beijssc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line2"], function(k, v){
			$("#" + "beijssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 75 || beijssc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["beijssc"]["line1"].push(array[0]+"");
		LotteryStorage["beijssc"]["line2"].push(array[1]+"");
		LotteryStorage["beijssc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line2"], function(k, v){
			$("#" + "beijssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line3"], function(k, v){
			$("#" + "beijssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["beijssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["beijssc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["beijssc"]["line"+lines[0]], function(k, v){
			$("#" + "beijssc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line"+lines[1]], function(k, v){
			$("#" + "beijssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["beijssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["beijssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["beijssc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["beijssc"]["line"+lines[0]], function(k, v){
			$("#" + "beijssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line"+lines[1]], function(k, v){
			$("#" + "beijssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line"+lines[0]], function(k, v){
			$("#" + "beijssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["beijssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["beijssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["beijssc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["beijssc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["beijssc"]["line"+lines[0]], function(k, v){
			$("#" + "beijssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line"+lines[1]], function(k, v){
			$("#" + "beijssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line"+lines[2]], function(k, v){
			$("#" + "beijssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["beijssc"]["line"+lines[3]], function(k, v){
			$("#" + "beijssc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(beijssc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["beijssc"]["line1"].push(number+"");
		$.each(LotteryStorage["beijssc"]["line1"], function(k, v){
			$("#" + "beijssc_line1" + v).toggleClass("redBalls_active");
		});
	}
	beijssc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function beijssc_checkOutRandom(playMethod){
	var obj = new Object();
	if(beijssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(beijssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(beijssc_playMethod == 18 || beijssc_playMethod == 29 || beijssc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(beijssc_playMethod == 22 || beijssc_playMethod == 33 || beijssc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(beijssc_playMethod == 54 || beijssc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(beijssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(beijssc_playMethod == 37 || beijssc_playMethod == 26 || beijssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(beijssc_playMethod == 39 || beijssc_playMethod == 28 || beijssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(beijssc_playMethod == 41 || beijssc_playMethod == 30 || beijssc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(beijssc_playMethod == 52 || beijssc_playMethod == 59 || beijssc_playMethod == 64 || beijssc_playMethod == 66 || beijssc_playMethod == 68
		||beijssc_playMethod == 70 || beijssc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(beijssc_playMethod == 42 || beijssc_playMethod == 31 || beijssc_playMethod == 20 || beijssc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(beijssc_playMethod == 43 || beijssc_playMethod == 32 || beijssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(beijssc_playMethod == 48 || beijssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(beijssc_playMethod == 50 || beijssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(beijssc_playMethod == 53 || beijssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(beijssc_playMethod == 62){
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
	}else if(beijssc_playMethod == 63 || beijssc_playMethod == 65 || beijssc_playMethod == 67 || beijssc_playMethod == 69 || beijssc_playMethod == 71
		|| beijssc_playMethod == 24 || beijssc_playMethod == 35 || beijssc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(beijssc_playMethod == 25 || beijssc_playMethod == 36 || beijssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(beijssc_playMethod == 51 || beijssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(beijssc_playMethod == 74 || beijssc_playMethod == 76){
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
	}else if(beijssc_playMethod == 75 || beijssc_playMethod == 77){
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
	}else if(beijssc_playMethod == 78){
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
	}else if(beijssc_playMethod == 84){
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
	}else if(beijssc_playMethod == 93){
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
	obj.sntuo = beijssc_sntuo;
	obj.multiple = 1;
	obj.rebates = beijssc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('beijssc',beijssc_playMethod,obj);  //机选奖金计算
	obj.award = $('#beijssc_minAward').html();     //奖金
	obj.maxAward = $('#beijssc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [beijsscValidateData 单式数据验证]
 */
function beijsscValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#beijssc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	beijsscValidData(textStr,type);
}

function beijsscValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(beijssc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 38 || beijssc_playMethod == 27 || beijssc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 45 || beijssc_playMethod == 34 || beijssc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 49 || beijssc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,2);
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,2);
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,3);
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,3);
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,3);
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,3);
		beijsscShowFooter(true,notes);
	}else if(beijssc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#beijssc_tab .button.red").size() ,4);
		beijsscShowFooter(true,notes);
	}

	$('#beijssc_delRepeat').off('click');
	$('#beijssc_delRepeat').on('click',function () {
		content.str = $('#beijssc_single').val() ? $('#beijssc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		beijsscShowFooter(true,notes);
		$("#beijssc_single").val(array.join(" "));
	});

	$("#beijssc_single").val(array.join(" "));
	return notes;
}

function beijsscShowFooter(isValid,notes){
	$('#beijssc_zhushu').text(notes);
	if($("#beijssc_modeId").val() == "8"){
		$('#beijssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijssc_beiNum").val()),0.002));
	}else if ($("#beijssc_modeId").val() == "2"){
		$('#beijssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijssc_beiNum").val()),0.2));
	}else if ($("#beijssc_modeId").val() == "1"){
		$('#beijssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijssc_beiNum").val()),0.02));
	}else{
		$('#beijssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#beijssc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	beijssc_initFooterButton();
	calcAwardWin('beijssc',beijssc_playMethod);  //计算奖金和盈利
}