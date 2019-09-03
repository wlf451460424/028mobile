var bjssc_playType = 2;
var bjssc_playMethod = 15;
var bjssc_sntuo = 0;
var bjssc_rebate;
var bjsscScroll;

//进入这个页面时调用
function bjsscPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("bjssc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("bjssc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function bjsscPageUnloadedPanel(){
	$("#bjssc_queding").off('click');
	$("#bjsscPage_back").off('click');
	$("#bjssc_ballView").empty();
	$("#bjsscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="bjsscPlaySelect"></select>');
	$("#bjsscSelect").append($select);
}

//入口函数
function bjssc_init(){
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
	$("#bjssc_title").html(LotteryInfo.getLotteryNameByTag("bjssc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == bjssc_playType && j == bjssc_playMethod){
					$play.append('<option value="bjssc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="bjssc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(bjssc_playMethod,onShowArray)>-1 ){
						bjssc_playType = i;
						bjssc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#bjsscPlaySelect").append($play);
		}
	}
	
	if($("#bjsscPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("bjsscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:bjsscChangeItem
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

	GetLotteryInfo("bjssc",function (){
		bjsscChangeItem("bjssc"+bjssc_playMethod);
	});

	//添加滑动条
	if(!bjsscScroll){
		bjsscScroll = new IScroll('#bjsscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("bjssc",LotteryInfo.getLotteryIdByTag("bjssc"));

	//获取上一期开奖
	queryLastPrize("bjssc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('bjssc');

	//机选选号
	$("#bjssc_random").on('click', function(event) {
		bjssc_randomOne();
	});
	
	$("#bjssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",bjssc_playMethod));
	//玩法说明
	$("#bjssc_paly_shuoming").off('click');
	$("#bjssc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#bjssc_shuoming").text());
	});

	//返回
	$("#bjsscPage_back").on('click', function(event) {
		// bjssc_playType = 2;
		// bjssc_playMethod = 15;
		$("#bjssc_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		bjssc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("bjssc");//清空
	bjssc_submitData();
}

function bjsscResetPlayType(){
	bjssc_playType = 2;
	bjssc_playMethod = 15;
}

function bjsscChangeItem(val) {
	bjssc_qingkongAll();
	var temp = val.substring("bjssc".length,val.length);
	if(val == "bjssc0"){
		//直选复式
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 0;
		bjssc_playMethod = 0;
		createFiveLineLayout("bjssc", function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc1"){
		//直选单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 0;
		bjssc_playMethod = 1;
		$("#bjssc_ballView").empty();
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc2"){
		//组选120
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 0;
		bjssc_playMethod = 2;
		createOneLineLayout("bjssc","至少选择5个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc3"){
		//组选60
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 0;
		bjssc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc4"){
		//组选30
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 0;
		bjssc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc5"){
		//组选20
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 0;
		bjssc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc6"){
		//组选10
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 0;
		bjssc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc7"){
		//组选5
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 0;
		bjssc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc8"){
		//总和大小单双
		$("#bjssc_random").show();
		var num = ["大","小","单","双"];
		bjssc_sntuo = 0;
		bjssc_playType = 0;
		bjssc_playMethod = 8;
		createNonNumLayout("bjssc",bjssc_playMethod,num,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc9"){
		//直选复式
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 1;
		bjssc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("bjssc",tips, function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc10"){
		//直选单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 1;
		bjssc_playMethod = 10;
		$("#bjssc_ballView").empty();
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc11"){
		//组选24
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 1;
		bjssc_playMethod = 11;
		createOneLineLayout("bjssc","至少选择4个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc12"){
		//组选12
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 1;
		bjssc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc13"){
		//组选6
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 1;
		bjssc_playMethod = 13;
		createOneLineLayout("bjssc","二重号:至少选择2个号码",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc14"){
		//组选4
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 1;
		bjssc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc15"){
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc16"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 2;
		bjssc_playMethod = 16;
		$("#bjssc_ballView").empty();
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc17"){
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 17;
		createSumLayout("bjssc",0,27,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc18"){
		//直选跨度
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 18;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc19"){
		//后三组三
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 19;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc20"){
		//后三组六
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 20;
		createOneLineLayout("bjssc","至少选择3个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc21"){
		//后三和值
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 21;
		createSumLayout("bjssc",1,26,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc22"){
		//后三组选包胆
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 22;
		bjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bjssc",array,["请选择一个号码"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc23"){
		//后三混合组选
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 2;
		bjssc_playMethod = 23;
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc24"){
		//和值尾数
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 24;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc25"){
		//特殊号
		$("#bjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		bjssc_sntuo = 0;
		bjssc_playType = 2;
		bjssc_playMethod = 25;
		createNonNumLayout("bjssc",bjssc_playMethod,num,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc26"){
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc27"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 3;
		bjssc_playMethod = 27;
		$("#bjssc_ballView").empty();
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc28"){
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 28;
		createSumLayout("bjssc",0,27,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc29"){
		//直选跨度
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 29;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc30"){
		//中三组三
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 30;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc31"){
		//中三组六
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 31;
		createOneLineLayout("bjssc","至少选择3个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc32"){
		//中三和值
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 32;
		createSumLayout("bjssc",1,26,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc33"){
		//中三组选包胆
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 33;
		bjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bjssc",array,["请选择一个号码"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc34"){
		//中三混合组选
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 3;
		bjssc_playMethod = 34;
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc35"){
		//和值尾数
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 35;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc36"){
		//特殊号
		$("#bjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		bjssc_sntuo = 0;
		bjssc_playType = 3;
		bjssc_playMethod = 36;
		createNonNumLayout("bjssc",bjssc_playMethod,num,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc37"){
		//直选复式
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc38"){
		//直选单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 4;
		bjssc_playMethod = 38;
		$("#bjssc_ballView").empty();
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc39"){
		//和值
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 39;
		createSumLayout("bjssc",0,27,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc40"){
		//直选跨度
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 40;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc41"){
		//前三组三
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 41;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc42"){
		//前三组六
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 42;
		createOneLineLayout("bjssc","至少选择3个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc43"){
		//前三和值
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 43;
		createSumLayout("bjssc",1,26,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc44"){
		//前三组选包胆
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 44;
		bjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bjssc",array,["请选择一个号码"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc45"){
		//前三混合组选
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 4;
		bjssc_playMethod = 45;
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc46"){
		//和值尾数
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 46;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc47"){
		//特殊号
		$("#bjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		bjssc_sntuo = 0;
		bjssc_playType = 4;
		bjssc_playMethod = 47;
		createNonNumLayout("bjssc",bjssc_playMethod,num,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc48"){
		//后二复式
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 5;
		bjssc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc49"){
		//后二单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 5;
		bjssc_playMethod = 49;
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc50"){
		//后二和值
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 5;
		bjssc_playMethod = 50;
		createSumLayout("bjssc",0,18,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc51"){
		//直选跨度
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 5;
		bjssc_playMethod = 51;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc52"){
		//后二组选
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 5;
		bjssc_playMethod = 52;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc53"){
		//后二和值
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 5;
		bjssc_playMethod = 53;
		createSumLayout("bjssc",1,17,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc54"){
		//后二组选包胆
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 5;
		bjssc_playMethod = 54;
		bjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bjssc",array,["请选择一个号码"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc55"){
		//前二复式
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 6;
		bjssc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc56"){
		//前二单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 6;
		bjssc_playMethod = 56;
		bjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
	}else if(val == "bjssc57"){
		//前二和值
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 6;
		bjssc_playMethod = 57;
		createSumLayout("bjssc",0,18,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc58"){
		//直选跨度
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 6;
		bjssc_playMethod = 58;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc59"){
		//前二组选
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 6;
		bjssc_playMethod = 59;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc60"){
		//前二和值
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 6;
		bjssc_playMethod = 60;
		createSumLayout("bjssc",1,17,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc61"){
		//前二组选包胆
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 6;
		bjssc_playMethod = 61;
		bjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bjssc",array,["请选择一个号码"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc62"){
		//定位复式
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 7;
		bjssc_playMethod = 62;
		createFiveLineLayout("bjssc", function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc63"){
		//后三一码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 63;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc64"){
		//后三二码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 64;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc65"){
		//前三一码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 65;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc66"){
		//前三二码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 66;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc67"){
		//后四一码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 67;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc68"){
		//后四二码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 68;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc69"){
		//前四一码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 69;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc70"){
		//前四二码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 70;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc71"){
		//五星一码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 71;
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc72"){
		//五星二码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 72;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc73"){
		//五星三码
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 8;
		bjssc_playMethod = 73;
		createOneLineLayout("bjssc","至少选择3个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc74"){
		//后二大小单双
		bjssc_qingkongAll();
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 9;
		bjssc_playMethod = 74;
		createTextBallTwoLayout("bjssc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc75"){
		//后三大小单双
		bjssc_qingkongAll();
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 9;
		bjssc_playMethod = 75;
		createTextBallThreeLayout("bjssc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc76"){
		//前二大小单双
		bjssc_qingkongAll();
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 9;
		bjssc_playMethod = 76;
		createTextBallTwoLayout("bjssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc77"){
		//前三大小单双
		bjssc_qingkongAll();
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 9;
		bjssc_playMethod = 77;
		createTextBallThreeLayout("bjssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc78"){
		//直选复式
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 10;
		bjssc_playMethod = 78;
		createFiveLineLayout("bjssc",function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc79"){
		//直选单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 10;
		bjssc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
		createRenXuanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc80"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 10;
		bjssc_playMethod = 80;
		createSumLayout("bjssc",0,18,function(){
			bjssc_calcNotes();
		});
		createRenXuanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc81"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 10;
		bjssc_playMethod = 81;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		createRenXuanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc82"){
		//组选单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 10;
		bjssc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
		createRenXuanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc83"){
		//组选和值
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 10;
		bjssc_playMethod = 83;
		createSumLayout("bjssc",1,17,function(){
			bjssc_calcNotes();
		});
		createRenXuanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc84"){
		//直选复式
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 11;
		bjssc_playMethod = 84;
		createFiveLineLayout("bjssc", function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc85"){
		//直选单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 11;
		bjssc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
		createRenXuanSanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc86"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 11;
		bjssc_playMethod = 86;
		createSumLayout("bjssc",0,27,function(){
			bjssc_calcNotes();
		});
		createRenXuanSanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc87"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 11;
		bjssc_playMethod = 87;
		createOneLineLayout("bjssc","至少选择2个",0,9,false,function(){
			bjssc_calcNotes();
		});
		createRenXuanSanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc88"){
		//组选单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 11;
		bjssc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
		createRenXuanSanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc89"){
		//组选和值
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 11;
		bjssc_playMethod = 89;
		createOneLineLayout("bjssc","至少选择3个",0,9,false,function(){
			bjssc_calcNotes();
		});
		createRenXuanSanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc90"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 11;
		bjssc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
		createRenXuanSanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc91"){
		//混合组选
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 11;
		bjssc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
		createRenXuanSanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc92"){
		//组选和值
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 11;
		bjssc_playMethod = 92;
		createSumLayout("bjssc",1,26,function(){
			bjssc_calcNotes();
		});
		createRenXuanSanLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc93"){
		$("#bjssc_random").show();
		bjssc_sntuo = 0;
		bjssc_playType = 12;
		bjssc_playMethod = 93;
		createFiveLineLayout("bjssc", function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc94"){
		//直选单式
		$("#bjssc_random").hide();
		bjssc_sntuo = 3;
		bjssc_playType = 12;
		bjssc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bjssc",tips);
		createRenXuanSiLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc95"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 12;
		bjssc_playMethod = 95;
		createOneLineLayout("bjssc","至少选择4个",0,9,false,function(){
			bjssc_calcNotes();
		});
		createRenXuanSiLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc96"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 12;
		bjssc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		createRenXuanSiLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc97"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 12;
		bjssc_playMethod = 97;
		$("#bjssc_ballView").empty();
		createOneLineLayout("bjssc","二重号:至少选择2个号码",0,9,false,function(){
			bjssc_calcNotes();
		});
		createRenXuanSiLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc98"){
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 12;
		bjssc_playMethod = 98;
		$("#bjssc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("bjssc",tips,0,9,false,function(){
			bjssc_calcNotes();
		});
		createRenXuanSiLayout("bjssc",bjssc_playMethod,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc99"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 13;
		bjssc_playMethod = 99;
		$("#bjssc_ballView").empty();
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc100"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 13;
		bjssc_playMethod = 100;
		$("#bjssc_ballView").empty();
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc101"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 13;
		bjssc_playMethod = 101;
		$("#bjssc_ballView").empty();
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc102"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 13;
		bjssc_playMethod = 102;
		$("#bjssc_ballView").empty();
		createOneLineLayout("bjssc","至少选择1个",0,9,false,function(){
			bjssc_calcNotes();
		});
		bjssc_qingkongAll();
	}else if(val == "bjssc103"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 103;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc104"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 104;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc105"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 105;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc106"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 106;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc107"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 107;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc108"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 108;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc109"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 109;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc110"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 110;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc111"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 111;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}else if(val == "bjssc112"){
		bjssc_qingkongAll();
		$("#bjssc_random").hide();
		bjssc_sntuo = 0;
		bjssc_playType = 14;
		bjssc_playMethod = 112;
		createTextBallOneLayout("bjssc",["龙","虎","和"],["至少选择一个"],function(){
			bjssc_calcNotes();
		});
	}

	if(bjsscScroll){
		bjsscScroll.refresh();
		bjsscScroll.scrollTo(0,0,1);
	}
	
	$("#bjssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("bjssc",temp);
	hideRandomWhenLi("bjssc",bjssc_sntuo,bjssc_playMethod);
	bjssc_calcNotes();
}
/**
 * [bjssc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function bjssc_initFooterButton(){
	if(bjssc_playMethod == 0 || bjssc_playMethod == 62 || bjssc_playMethod == 78
		|| bjssc_playMethod == 84 || bjssc_playMethod == 93 || bjssc_playType == 7){
		if(LotteryStorage["bjssc"]["line1"].length > 0 || LotteryStorage["bjssc"]["line2"].length > 0 ||
			LotteryStorage["bjssc"]["line3"].length > 0 || LotteryStorage["bjssc"]["line4"].length > 0 ||
			LotteryStorage["bjssc"]["line5"].length > 0){
			$("#bjssc_qingkong").css("opacity",1.0);
		}else{
			$("#bjssc_qingkong").css("opacity",0.4);
		}
	}else if(bjssc_playMethod == 9){
		if(LotteryStorage["bjssc"]["line1"].length > 0 || LotteryStorage["bjssc"]["line2"].length > 0 ||
			LotteryStorage["bjssc"]["line3"].length > 0 || LotteryStorage["bjssc"]["line4"].length > 0 ){
			$("#bjssc_qingkong").css("opacity",1.0);
		}else{
			$("#bjssc_qingkong").css("opacity",0.4);
		}
	}else if(bjssc_playMethod == 37 || bjssc_playMethod == 4 || bjssc_playMethod == 6
		|| bjssc_playMethod == 26 || bjssc_playMethod == 15 || bjssc_playMethod == 75 || bjssc_playMethod == 77){
		if(LotteryStorage["bjssc"]["line1"].length > 0 || LotteryStorage["bjssc"]["line2"].length > 0
			|| LotteryStorage["bjssc"]["line3"].length > 0){
			$("#bjssc_qingkong").css("opacity",1.0);
		}else{
			$("#bjssc_qingkong").css("opacity",0.4);
		}
	}else if(bjssc_playMethod == 3 || bjssc_playMethod == 4 || bjssc_playMethod == 5
		|| bjssc_playMethod == 6 || bjssc_playMethod == 7 || bjssc_playMethod == 12
		|| bjssc_playMethod == 14 || bjssc_playMethod == 48 || bjssc_playMethod == 55
		|| bjssc_playMethod == 74 || bjssc_playMethod == 76 || bjssc_playMethod == 96 || bjssc_playMethod == 98){
		if(LotteryStorage["bjssc"]["line1"].length > 0 || LotteryStorage["bjssc"]["line2"].length > 0){
			$("#bjssc_qingkong").css("opacity",1.0);
		}else{
			$("#bjssc_qingkong").css("opacity",0.4);
		}
	}else if(bjssc_playMethod == 2 || bjssc_playMethod == 8 || bjssc_playMethod == 11 || bjssc_playMethod == 13 || bjssc_playMethod == 39
		|| bjssc_playMethod == 28 || bjssc_playMethod == 17 || bjssc_playMethod == 18 || bjssc_playMethod == 24 || bjssc_playMethod == 41
		|| bjssc_playMethod == 25 || bjssc_playMethod == 29 || bjssc_playMethod == 42 || bjssc_playMethod == 43 || bjssc_playMethod == 30
		|| bjssc_playMethod == 35 || bjssc_playMethod == 36 || bjssc_playMethod == 31 || bjssc_playMethod == 32 || bjssc_playMethod == 19
		|| bjssc_playMethod == 40 || bjssc_playMethod == 46 || bjssc_playMethod == 20 || bjssc_playMethod == 21 || bjssc_playMethod == 50
		|| bjssc_playMethod == 47 || bjssc_playMethod == 51 || bjssc_playMethod == 52 || bjssc_playMethod == 53 || bjssc_playMethod == 57 || bjssc_playMethod == 63
		|| bjssc_playMethod == 58 || bjssc_playMethod == 59 || bjssc_playMethod == 60 || bjssc_playMethod == 65 || bjssc_playMethod == 80 || bjssc_playMethod == 81 || bjssc_playType == 8
		|| bjssc_playMethod == 83 || bjssc_playMethod == 86 || bjssc_playMethod == 87 || bjssc_playMethod == 22 || bjssc_playMethod == 33 || bjssc_playMethod == 44
		|| bjssc_playMethod == 89 || bjssc_playMethod == 92 || bjssc_playMethod == 95 || bjssc_playMethod == 54 || bjssc_playMethod == 61
		|| bjssc_playMethod == 97 || bjssc_playType == 13  || bjssc_playType == 14){
		if(LotteryStorage["bjssc"]["line1"].length > 0){
			$("#bjssc_qingkong").css("opacity",1.0);
		}else{
			$("#bjssc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#bjssc_qingkong").css("opacity",0);
	}

	if($("#bjssc_qingkong").css("opacity") == "0"){
		$("#bjssc_qingkong").css("display","none");
	}else{
		$("#bjssc_qingkong").css("display","block");
	}

	if($('#bjssc_zhushu').html() > 0){
		$("#bjssc_queding").css("opacity",1.0);
	}else{
		$("#bjssc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  bjssc_qingkongAll(){
	$("#bjssc_ballView span").removeClass('redBalls_active');
	LotteryStorage["bjssc"]["line1"] = [];
	LotteryStorage["bjssc"]["line2"] = [];
	LotteryStorage["bjssc"]["line3"] = [];
	LotteryStorage["bjssc"]["line4"] = [];
	LotteryStorage["bjssc"]["line5"] = [];

	localStorageUtils.removeParam("bjssc_line1");
	localStorageUtils.removeParam("bjssc_line2");
	localStorageUtils.removeParam("bjssc_line3");
	localStorageUtils.removeParam("bjssc_line4");
	localStorageUtils.removeParam("bjssc_line5");

	$('#bjssc_zhushu').text(0);
	$('#bjssc_money').text(0);
	clearAwardWin("bjssc");
	bjssc_initFooterButton();
}

/**
 * [bjssc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function bjssc_calcNotes(){
	$('#bjssc_modeId').blur();
	$('#bjssc_fandian').blur();
	
	var notes = 0;

	if(bjssc_playMethod == 0){
		notes = LotteryStorage["bjssc"]["line1"].length *
			LotteryStorage["bjssc"]["line2"].length *
			LotteryStorage["bjssc"]["line3"].length *
			LotteryStorage["bjssc"]["line4"].length *
			LotteryStorage["bjssc"]["line5"].length;
	}else if(bjssc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,5);
	}else if(bjssc_playMethod == 3){
		if (LotteryStorage["bjssc"]["line1"].length >= 1 && LotteryStorage["bjssc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["bjssc"]["line1"],LotteryStorage["bjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(bjssc_playMethod == 4){
		if (LotteryStorage["bjssc"]["line1"].length >= 2 && LotteryStorage["bjssc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["bjssc"]["line2"],LotteryStorage["bjssc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(bjssc_playMethod == 5 || bjssc_playMethod == 12){
		if (LotteryStorage["bjssc"]["line1"].length >= 1 && LotteryStorage["bjssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["bjssc"]["line1"],LotteryStorage["bjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(bjssc_playMethod == 6 || bjssc_playMethod == 7 || bjssc_playMethod == 14){
		if (LotteryStorage["bjssc"]["line1"].length >= 1 && LotteryStorage["bjssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["bjssc"]["line1"],LotteryStorage["bjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(bjssc_playMethod == 9){
		notes = LotteryStorage["bjssc"]["line1"].length *
			LotteryStorage["bjssc"]["line2"].length *
			LotteryStorage["bjssc"]["line3"].length *
			LotteryStorage["bjssc"]["line4"].length;
	}else if(bjssc_playMethod == 18 || bjssc_playMethod == 29 || bjssc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["bjssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(bjssc_playMethod == 22 || bjssc_playMethod == 33 || bjssc_playMethod == 44 ){
		notes = 54;
	}else if(bjssc_playMethod == 54 || bjssc_playMethod == 61){
		notes = 9;
	}else if(bjssc_playMethod == 51 || bjssc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["bjssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(bjssc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,4);
	}else if(bjssc_playMethod == 13|| bjssc_playMethod == 64 || bjssc_playMethod == 66 || bjssc_playMethod == 68 || bjssc_playMethod == 70 || bjssc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,2);
	}else if(bjssc_playMethod == 37 || bjssc_playMethod == 26 || bjssc_playMethod == 15 || bjssc_playMethod == 75 || bjssc_playMethod == 77){
		notes = LotteryStorage["bjssc"]["line1"].length *
			LotteryStorage["bjssc"]["line2"].length *
			LotteryStorage["bjssc"]["line3"].length ;
	}else if(bjssc_playMethod == 39 || bjssc_playMethod == 28 || bjssc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["bjssc"]["line1"][i]);
		};
	}else if(bjssc_playMethod == 41 || bjssc_playMethod == 30 || bjssc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["bjssc"]["line1"].length,2);
	}else if(bjssc_playMethod == 42 || bjssc_playMethod == 31 || bjssc_playMethod == 20 || bjssc_playMethod == 68 || bjssc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,3);
	}else if(bjssc_playMethod == 43 || bjssc_playMethod == 32 || bjssc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["bjssc"]["line1"][i]);
		};
	}else if(bjssc_playMethod == 48 || bjssc_playMethod == 55 || bjssc_playMethod == 74 || bjssc_playMethod == 76){
		notes = LotteryStorage["bjssc"]["line1"].length *
			LotteryStorage["bjssc"]["line2"].length ;
	}else if(bjssc_playMethod == 50 || bjssc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["bjssc"]["line1"][i]);
		};
	}else if(bjssc_playMethod == 52 || bjssc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,2);
	}else if(bjssc_playMethod == 53 || bjssc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["bjssc"]["line1"][i]);
		};
	}else if(bjssc_playMethod == 62){
		notes = LotteryStorage["bjssc"]["line1"].length +
			LotteryStorage["bjssc"]["line2"].length +
			LotteryStorage["bjssc"]["line3"].length +
			LotteryStorage["bjssc"]["line4"].length +
			LotteryStorage["bjssc"]["line5"].length;
	}else if(bjssc_playType == 13 || bjssc_playType == 14 || bjssc_playMethod == 8 || bjssc_playMethod == 71
		|| bjssc_playMethod == 24 || bjssc_playMethod == 25 || bjssc_playMethod == 35 || bjssc_playMethod == 36 || bjssc_playMethod == 46
		|| bjssc_playMethod == 47 || bjssc_playMethod == 63 || bjssc_playMethod == 65 || bjssc_playMethod == 67 || bjssc_playMethod == 69 ){
		notes = LotteryStorage["bjssc"]["line1"].length ;
	}else if(bjssc_playMethod == 78){
		notes = LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line2"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line3"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line4"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line3"].length +
			LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line4"].length +
			LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line4"].length +
			LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line4"].length * LotteryStorage["bjssc"]["line5"].length;
	}else if (bjssc_playMethod == 80) {
		if ($("#bjssc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["bjssc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,2);
		}
	}else if (bjssc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,2) * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,2);
	}else if (bjssc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["bjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,2);
	}else if (bjssc_playMethod == 84) {
		notes = LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line3"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line4"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line4"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line4"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line4"].length +
			LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line4"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line4"].length * LotteryStorage["bjssc"]["line5"].length ;
	}else if (bjssc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["bjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,3);
	}else if (bjssc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["bjssc"]["line1"].length,2) * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,3);
	}else if (bjssc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,3) * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,3);
	}else if (bjssc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["bjssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["bjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,3);
	}else if (bjssc_playMethod == 93) {
		notes = LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line4"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line4"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line1"].length * LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line4"].length * LotteryStorage["bjssc"]["line5"].length +
			LotteryStorage["bjssc"]["line2"].length * LotteryStorage["bjssc"]["line3"].length * LotteryStorage["bjssc"]["line4"].length * LotteryStorage["bjssc"]["line5"].length;
	}else if (bjssc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,4)
			* mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,4);
	}else if (bjssc_playMethod == 96) {
		if (LotteryStorage["bjssc"]["line1"].length >= 1 && LotteryStorage["bjssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["bjssc"]["line1"],LotteryStorage["bjssc"]["line2"])
				* mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (bjssc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["bjssc"]["line1"].length,2) * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,4);
	}else if (bjssc_playMethod == 98) {
		if (LotteryStorage["bjssc"]["line1"].length >= 1 && LotteryStorage["bjssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["bjssc"]["line1"],LotteryStorage["bjssc"]["line2"]) * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = bjsscValidData($("#bjssc_single").val());
	}

	if(bjssc_sntuo == 3 || bjssc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","bjssc"),LotteryInfo.getMethodId("ssc",bjssc_playMethod))){
	}else{
		if(parseInt($('#bjssc_modeId').val()) == 8){
			$("#bjssc_random").hide();
		}else{
			$("#bjssc_random").show();
		}
	}

	//验证是否为空
	if( $("#bjssc_beiNum").val() =="" || parseInt($("#bjssc_beiNum").val()) == 0){
		$("#bjssc_beiNum").val(1);
	}

	//验证慢彩最大倍数
	if($("#bjssc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#bjssc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#bjssc_zhushu').text(notes);
		if($("#bjssc_modeId").val() == "8"){
			$('#bjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjssc_beiNum").val()),0.002));
		}else if ($("#bjssc_modeId").val() == "2"){
			$('#bjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjssc_beiNum").val()),0.2));
		}else if ($("#bjssc_modeId").val() == "1"){
			$('#bjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjssc_beiNum").val()),0.02));
		}else{
			$('#bjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjssc_beiNum").val()),2));
		}
	} else {
		$('#bjssc_zhushu').text(0);
		$('#bjssc_money').text(0);
	}
	bjssc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('bjssc',bjssc_playMethod);
}

/**
 * [bjssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function bjssc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#bjssc_queding").bind('click', function(event) {
		bjssc_rebate = $("#bjssc_fandian option:last").val();
		if(parseInt($('#bjssc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		bjssc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#bjssc_modeId').val()) == 8){
			if (Number($('#bjssc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('bjssc',bjssc_playMethod);

		submitParams.lotteryType = "bjssc";
		var play = LotteryInfo.getPlayName("ssc",bjssc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",bjssc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = bjssc_playType;
		submitParams.playMethodIndex = bjssc_playMethod;
		var selectedBalls = [];
		if(bjssc_playMethod == 0 || bjssc_playMethod == 3 || bjssc_playMethod == 4
			|| bjssc_playMethod == 5 || bjssc_playMethod == 6 || bjssc_playMethod == 7
			|| bjssc_playMethod == 9 || bjssc_playMethod == 12 || bjssc_playMethod == 14
			|| bjssc_playMethod == 37 || bjssc_playMethod == 26 || bjssc_playMethod == 15
			|| bjssc_playMethod == 48 || bjssc_playMethod == 55 || bjssc_playMethod == 74 || bjssc_playType == 9){
			$("#bjssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(bjssc_playMethod == 2 || bjssc_playMethod == 8 || bjssc_playMethod == 11 || bjssc_playMethod == 13 || bjssc_playMethod == 24
			|| bjssc_playMethod == 39 || bjssc_playMethod == 28 || bjssc_playMethod == 17 || bjssc_playMethod == 18 || bjssc_playMethod == 25
			|| bjssc_playMethod == 22 || bjssc_playMethod == 33 || bjssc_playMethod == 44 || bjssc_playMethod == 54 || bjssc_playMethod == 61
			|| bjssc_playMethod == 41 || bjssc_playMethod == 42 || bjssc_playMethod == 43 || bjssc_playMethod == 29 || bjssc_playMethod == 35
			|| bjssc_playMethod == 30 || bjssc_playMethod == 31 || bjssc_playMethod == 32 || bjssc_playMethod == 40 || bjssc_playMethod == 36
			|| bjssc_playMethod == 19 || bjssc_playMethod == 20 || bjssc_playMethod == 21 || bjssc_playMethod == 46 || bjssc_playMethod == 47
			|| bjssc_playMethod == 50 || bjssc_playMethod == 57 || bjssc_playType == 8 || bjssc_playMethod == 51 || bjssc_playMethod == 58
			|| bjssc_playMethod == 52 || bjssc_playMethod == 53|| bjssc_playMethod == 59 || bjssc_playMethod == 60 || bjssc_playType == 13 || bjssc_playType == 14){
			$("#bjssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(bjssc_playType == 7 || bjssc_playMethod == 78 || bjssc_playMethod == 84 || bjssc_playMethod == 93){
			$("#bjssc_ballView div.ballView").each(function(){
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
		}else if(bjssc_playMethod == 80 || bjssc_playMethod == 81 || bjssc_playMethod == 83
			|| bjssc_playMethod == 86 || bjssc_playMethod == 87 || bjssc_playMethod == 89
			|| bjssc_playMethod == 92 || bjssc_playMethod == 95 || bjssc_playMethod == 97){
			$("#bjssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#bjssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#bjssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#bjssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#bjssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#bjssc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (bjssc_playMethod == 96 || bjssc_playMethod == 98) {
			$("#bjssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#bjssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#bjssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#bjssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#bjssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#bjssc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			bjsscValidateData("submit");
			var array = handleSingleStr($("#bjssc_single").val());
			if(bjssc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(bjssc_playMethod == 10 || bjssc_playMethod == 38 || bjssc_playMethod == 27
				|| bjssc_playMethod == 16 || bjssc_playMethod == 49 || bjssc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(bjssc_playMethod == 45 || bjssc_playMethod == 34 || bjssc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(bjssc_playMethod == 79 || bjssc_playMethod == 82 || bjssc_playMethod == 85 || bjssc_playMethod == 88 ||
				bjssc_playMethod == 89 || bjssc_playMethod == 90 || bjssc_playMethod == 91 || bjssc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#bjssc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#bjssc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#bjssc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#bjssc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#bjssc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#bjssc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#bjssc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#bjssc_fandian").val());
		submitParams.notes = $('#bjssc_zhushu').html();
		submitParams.sntuo = bjssc_sntuo;
		submitParams.multiple = $('#bjssc_beiNum').val();  //requirement
		submitParams.rebates = $('#bjssc_fandian').val();  //requirement
		submitParams.playMode = $('#bjssc_modeId').val();  //requirement
		submitParams.money = $('#bjssc_money').html();  //requirement
		submitParams.award = $('#bjssc_minAward').html();  //奖金
		submitParams.maxAward = $('#bjssc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#bjssc_ballView").empty();
		bjssc_qingkongAll();
	});
}

/**
 * [bjssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function bjssc_randomOne(){
	bjssc_qingkongAll();
	if(bjssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["bjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["bjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["bjssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["bjssc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["bjssc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line2"], function(k, v){
			$("#" + "bjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line3"], function(k, v){
			$("#" + "bjssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line4"], function(k, v){
			$("#" + "bjssc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line5"], function(k, v){
			$("#" + "bjssc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["bjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["bjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["bjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["bjssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["bjssc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line2"], function(k, v){
			$("#" + "bjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line3"], function(k, v){
			$("#" + "bjssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line4"], function(k, v){
			$("#" + "bjssc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(bjssc_playMethod == 37 || bjssc_playMethod == 26 || bjssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["bjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["bjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["bjssc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line2"], function(k, v){
			$("#" + "bjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line3"], function(k, v){
			$("#" + "bjssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 41 || bjssc_playMethod == 30 || bjssc_playMethod == 19 || bjssc_playMethod == 68
		|| bjssc_playMethod == 52 || bjssc_playMethod == 64 || bjssc_playMethod == 66
		|| bjssc_playMethod == 59 || bjssc_playMethod == 70 || bjssc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["bjssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 42 || bjssc_playMethod == 31 || bjssc_playMethod == 20 || bjssc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["bjssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 39 || bjssc_playMethod == 28 || bjssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["bjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 43 || bjssc_playMethod == 32 || bjssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["bjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 48 || bjssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["bjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["bjssc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line2"], function(k, v){
			$("#" + "bjssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 25 || bjssc_playMethod == 36 || bjssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["bjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 50 || bjssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["bjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 53 || bjssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["bjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["bjssc"]["line"+line].push(number+"");
		$.each(LotteryStorage["bjssc"]["line"+line], function(k, v){
			$("#" + "bjssc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 63 || bjssc_playMethod == 67 || bjssc_playMethod == 69 || bjssc_playMethod == 71 || bjssc_playType == 13
		|| bjssc_playMethod == 65 || bjssc_playMethod == 18 || bjssc_playMethod == 29 || bjssc_playMethod == 40 || bjssc_playMethod == 22
		|| bjssc_playMethod == 33 || bjssc_playMethod == 44 || bjssc_playMethod == 54 || bjssc_playMethod == 61
		|| bjssc_playMethod == 24 || bjssc_playMethod == 35 || bjssc_playMethod == 46 || bjssc_playMethod == 51 || bjssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["bjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 74 || bjssc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["bjssc"]["line1"].push(array[0]+"");
		LotteryStorage["bjssc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line2"], function(k, v){
			$("#" + "bjssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 75 || bjssc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["bjssc"]["line1"].push(array[0]+"");
		LotteryStorage["bjssc"]["line2"].push(array[1]+"");
		LotteryStorage["bjssc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line2"], function(k, v){
			$("#" + "bjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line3"], function(k, v){
			$("#" + "bjssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["bjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["bjssc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["bjssc"]["line"+lines[0]], function(k, v){
			$("#" + "bjssc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line"+lines[1]], function(k, v){
			$("#" + "bjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["bjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["bjssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["bjssc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["bjssc"]["line"+lines[0]], function(k, v){
			$("#" + "bjssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line"+lines[1]], function(k, v){
			$("#" + "bjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line"+lines[0]], function(k, v){
			$("#" + "bjssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["bjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["bjssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["bjssc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["bjssc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["bjssc"]["line"+lines[0]], function(k, v){
			$("#" + "bjssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line"+lines[1]], function(k, v){
			$("#" + "bjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line"+lines[2]], function(k, v){
			$("#" + "bjssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bjssc"]["line"+lines[3]], function(k, v){
			$("#" + "bjssc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(bjssc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["bjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["bjssc"]["line1"], function(k, v){
			$("#" + "bjssc_line1" + v).toggleClass("redBalls_active");
		});
	}
	bjssc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function bjssc_checkOutRandom(playMethod){
	var obj = new Object();
	if(bjssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(bjssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(bjssc_playMethod == 18 || bjssc_playMethod == 29 || bjssc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(bjssc_playMethod == 22 || bjssc_playMethod == 33 || bjssc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(bjssc_playMethod == 54 || bjssc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(bjssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(bjssc_playMethod == 37 || bjssc_playMethod == 26 || bjssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(bjssc_playMethod == 39 || bjssc_playMethod == 28 || bjssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(bjssc_playMethod == 41 || bjssc_playMethod == 30 || bjssc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(bjssc_playMethod == 52 || bjssc_playMethod == 59 || bjssc_playMethod == 64 || bjssc_playMethod == 66 || bjssc_playMethod == 68
		||bjssc_playMethod == 70 || bjssc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(bjssc_playMethod == 42 || bjssc_playMethod == 31 || bjssc_playMethod == 20 || bjssc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(bjssc_playMethod == 43 || bjssc_playMethod == 32 || bjssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(bjssc_playMethod == 48 || bjssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(bjssc_playMethod == 50 || bjssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(bjssc_playMethod == 53 || bjssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(bjssc_playMethod == 62){
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
	}else if(bjssc_playMethod == 63 || bjssc_playMethod == 65 || bjssc_playMethod == 67 || bjssc_playMethod == 69 || bjssc_playMethod == 71
		|| bjssc_playMethod == 24 || bjssc_playMethod == 35 || bjssc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(bjssc_playMethod == 25 || bjssc_playMethod == 36 || bjssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(bjssc_playMethod == 51 || bjssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(bjssc_playMethod == 74 || bjssc_playMethod == 76){
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
	}else if(bjssc_playMethod == 75 || bjssc_playMethod == 77){
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
	}else if(bjssc_playMethod == 78){
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
	}else if(bjssc_playMethod == 84){
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
	}else if(bjssc_playMethod == 93){
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
	obj.sntuo = bjssc_sntuo;
	obj.multiple = 1;
	obj.rebates = bjssc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('bjssc',bjssc_playMethod,obj);  //机选奖金计算
	obj.award = $('#bjssc_minAward').html();     //奖金
	obj.maxAward = $('#bjssc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [bjsscValidateData 单式数据验证]
 */
function bjsscValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#bjssc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	bjsscValidData(textStr,type);
}

function bjsscValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(bjssc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 38 || bjssc_playMethod == 27 || bjssc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 45 || bjssc_playMethod == 34 || bjssc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 49 || bjssc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,2);
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,2);
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,3);
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,3);
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,3);
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,3);
		bjsscShowFooter(true,notes);
	}else if(bjssc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#bjssc_tab .button.red").size() ,4);
		bjsscShowFooter(true,notes);
	}

	$('#bjssc_delRepeat').off('click');
	$('#bjssc_delRepeat').on('click',function () {
		content.str = $('#bjssc_single').val() ? $('#bjssc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		bjsscShowFooter(true,notes);
		$("#bjssc_single").val(array.join(" "));
	});

	$("#bjssc_single").val(array.join(" "));
	return notes;
}

function bjsscShowFooter(isValid,notes){
	$('#bjssc_zhushu').text(notes);
	if($("#bjssc_modeId").val() == "8"){
		$('#bjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjssc_beiNum").val()),0.002));
	}else if ($("#bjssc_modeId").val() == "2"){
		$('#bjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjssc_beiNum").val()),0.2));
	}else if ($("#bjssc_modeId").val() == "1"){
		$('#bjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjssc_beiNum").val()),0.02));
	}else{
		$('#bjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bjssc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	bjssc_initFooterButton();
	calcAwardWin('bjssc',bjssc_playMethod);  //计算奖金和盈利
}