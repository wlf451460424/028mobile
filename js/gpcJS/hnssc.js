var hnssc_playType = 2;
var hnssc_playMethod = 15;
var hnssc_sntuo = 0;
var hnssc_rebate;
var hnsscScroll;

//进入这个页面时调用
function hnsscPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hnssc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hnssc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hnsscPageUnloadedPanel(){
	$("#hnssc_queding").off('click');
	$("#hnsscPage_back").off('click');
	$("#hnssc_ballView").empty();
	$("#hnsscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hnsscPlaySelect"></select>');
	$("#hnsscSelect").append($select);
}

//入口函数
function hnssc_init(){
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
	$("#hnssc_title").html(LotteryInfo.getLotteryNameByTag("hnssc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == hnssc_playType && j == hnssc_playMethod){
					$play.append('<option value="hnssc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hnssc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hnssc_playMethod,onShowArray)>-1 ){
						hnssc_playType = i;
						hnssc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hnsscPlaySelect").append($play);
		}
	}
	
	if($("#hnsscPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("hnsscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hnsscChangeItem
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

	GetLotteryInfo("hnssc",function (){
		hnsscChangeItem("hnssc"+hnssc_playMethod);
	});

	//添加滑动条
	if(!hnsscScroll){
		hnsscScroll = new IScroll('#hnsscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("hnssc",LotteryInfo.getLotteryIdByTag("hnssc"));

	//获取上一期开奖
	queryLastPrize("hnssc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('hnssc');

	//机选选号
	$("#hnssc_random").off('click');
	$("#hnssc_random").on('click', function(event) {
		hnssc_randomOne();
	});
	
	$("#hnssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",hnssc_playMethod));
	//玩法说明
	$("#hnssc_paly_shuoming").off('click');
	$("#hnssc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hnssc_shuoming").text());
	});

	//返回
	$("#hnsscPage_back").on('click', function(event) {
		// hnssc_playType = 2;
		// hnssc_playMethod = 15;
		$("#hnssc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hnssc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("hnssc");//清空
	hnssc_submitData();
}

function hnsscResetPlayType(){
	hnssc_playType = 2;
	hnssc_playMethod = 15;
}

function hnsscChangeItem(val) {
	hnssc_qingkongAll();
	var temp = val.substring("hnssc".length,val.length);
	if(val == "hnssc0"){
		//直选复式
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 0;
		hnssc_playMethod = 0;
		createFiveLineLayout("hnssc", function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc1"){
		//直选单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 0;
		hnssc_playMethod = 1;
		$("#hnssc_ballView").empty();
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc2"){
		//组选120
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 0;
		hnssc_playMethod = 2;
		createOneLineLayout("hnssc","至少选择5个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc3"){
		//组选60
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 0;
		hnssc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc4"){
		//组选30
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 0;
		hnssc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc5"){
		//组选20
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 0;
		hnssc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc6"){
		//组选10
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 0;
		hnssc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc7"){
		//组选5
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 0;
		hnssc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc8"){
		//总和大小单双
		$("#hnssc_random").show();
		var num = ["大","小","单","双"];
		hnssc_sntuo = 0;
		hnssc_playType = 0;
		hnssc_playMethod = 8;
		createNonNumLayout("hnssc",hnssc_playMethod,num,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc9"){
		//直选复式
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 1;
		hnssc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("hnssc",tips, function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc10"){
		//直选单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 1;
		hnssc_playMethod = 10;
		$("#hnssc_ballView").empty();
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc11"){
		//组选24
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 1;
		hnssc_playMethod = 11;
		createOneLineLayout("hnssc","至少选择4个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc12"){
		//组选12
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 1;
		hnssc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc13"){
		//组选6
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 1;
		hnssc_playMethod = 13;
		createOneLineLayout("hnssc","二重号:至少选择2个号码",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc14"){
		//组选4
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 1;
		hnssc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc15"){
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc16"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 2;
		hnssc_playMethod = 16;
		$("#hnssc_ballView").empty();
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc17"){
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 17;
		createSumLayout("hnssc",0,27,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc18"){
		//直选跨度
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 18;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc19"){
		//后三组三
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 19;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc20"){
		//后三组六
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 20;
		createOneLineLayout("hnssc","至少选择3个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc21"){
		//后三和值
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 21;
		createSumLayout("hnssc",1,26,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc22"){
		//后三组选包胆
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 22;
		hnssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnssc",array,["请选择一个号码"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc23"){
		//后三混合组选
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 2;
		hnssc_playMethod = 23;
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc24"){
		//和值尾数
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 24;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc25"){
		//特殊号
		$("#hnssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnssc_sntuo = 0;
		hnssc_playType = 2;
		hnssc_playMethod = 25;
		createNonNumLayout("hnssc",hnssc_playMethod,num,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc26"){
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc27"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 3;
		hnssc_playMethod = 27;
		$("#hnssc_ballView").empty();
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc28"){
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 28;
		createSumLayout("hnssc",0,27,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc29"){
		//直选跨度
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 29;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc30"){
		//中三组三
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 30;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc31"){
		//中三组六
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 31;
		createOneLineLayout("hnssc","至少选择3个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc32"){
		//中三和值
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 32;
		createSumLayout("hnssc",1,26,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc33"){
		//中三组选包胆
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 33;
		hnssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnssc",array,["请选择一个号码"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc34"){
		//中三混合组选
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 3;
		hnssc_playMethod = 34;
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc35"){
		//和值尾数
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 35;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc36"){
		//特殊号
		$("#hnssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnssc_sntuo = 0;
		hnssc_playType = 3;
		hnssc_playMethod = 36;
		createNonNumLayout("hnssc",hnssc_playMethod,num,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc37"){
		//直选复式
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc38"){
		//直选单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 4;
		hnssc_playMethod = 38;
		$("#hnssc_ballView").empty();
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc39"){
		//和值
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 39;
		createSumLayout("hnssc",0,27,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc40"){
		//直选跨度
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 40;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc41"){
		//前三组三
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 41;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc42"){
		//前三组六
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 42;
		createOneLineLayout("hnssc","至少选择3个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc43"){
		//前三和值
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 43;
		createSumLayout("hnssc",1,26,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc44"){
		//前三组选包胆
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 44;
		hnssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnssc",array,["请选择一个号码"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc45"){
		//前三混合组选
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 4;
		hnssc_playMethod = 45;
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc46"){
		//和值尾数
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 46;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc47"){
		//特殊号
		$("#hnssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnssc_sntuo = 0;
		hnssc_playType = 4;
		hnssc_playMethod = 47;
		createNonNumLayout("hnssc",hnssc_playMethod,num,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc48"){
		//后二复式
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 5;
		hnssc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc49"){
		//后二单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 5;
		hnssc_playMethod = 49;
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc50"){
		//后二和值
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 5;
		hnssc_playMethod = 50;
		createSumLayout("hnssc",0,18,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc51"){
		//直选跨度
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 5;
		hnssc_playMethod = 51;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc52"){
		//后二组选
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 5;
		hnssc_playMethod = 52;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc53"){
		//后二和值
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 5;
		hnssc_playMethod = 53;
		createSumLayout("hnssc",1,17,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc54"){
		//后二组选包胆
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 5;
		hnssc_playMethod = 54;
		hnssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnssc",array,["请选择一个号码"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc55"){
		//前二复式
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 6;
		hnssc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc56"){
		//前二单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 6;
		hnssc_playMethod = 56;
		hnssc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
	}else if(val == "hnssc57"){
		//前二和值
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 6;
		hnssc_playMethod = 57;
		createSumLayout("hnssc",0,18,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc58"){
		//直选跨度
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 6;
		hnssc_playMethod = 58;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc59"){
		//前二组选
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 6;
		hnssc_playMethod = 59;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc60"){
		//前二和值
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 6;
		hnssc_playMethod = 60;
		createSumLayout("hnssc",1,17,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc61"){
		//前二组选包胆
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 6;
		hnssc_playMethod = 61;
		hnssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnssc",array,["请选择一个号码"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc62"){
		//定位复式
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 7;
		hnssc_playMethod = 62;
		createFiveLineLayout("hnssc", function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc63"){
		//后三一码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 63;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc64"){
		//后三二码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 64;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc65"){
		//前三一码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 65;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc66"){
		//前三二码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 66;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc67"){
		//后四一码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 67;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc68"){
		//后四二码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 68;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc69"){
		//前四一码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 69;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc70"){
		//前四二码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 70;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc71"){
		//五星一码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 71;
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc72"){
		//五星二码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 72;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc73"){
		//五星三码
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 8;
		hnssc_playMethod = 73;
		createOneLineLayout("hnssc","至少选择3个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc74"){
		//后二大小单双
		hnssc_qingkongAll();
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 9;
		hnssc_playMethod = 74;
		createTextBallTwoLayout("hnssc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc75"){
		//后三大小单双
		hnssc_qingkongAll();
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 9;
		hnssc_playMethod = 75;
		createTextBallThreeLayout("hnssc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc76"){
		//前二大小单双
		hnssc_qingkongAll();
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 9;
		hnssc_playMethod = 76;
		createTextBallTwoLayout("hnssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc77"){
		//前三大小单双
		hnssc_qingkongAll();
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 9;
		hnssc_playMethod = 77;
		createTextBallThreeLayout("hnssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc78"){
		//直选复式
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 10;
		hnssc_playMethod = 78;
		createFiveLineLayout("hnssc",function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc79"){
		//直选单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 10;
		hnssc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
		createRenXuanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc80"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 10;
		hnssc_playMethod = 80;
		createSumLayout("hnssc",0,18,function(){
			hnssc_calcNotes();
		});
		createRenXuanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc81"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 10;
		hnssc_playMethod = 81;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		createRenXuanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc82"){
		//组选单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 10;
		hnssc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
		createRenXuanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc83"){
		//组选和值
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 10;
		hnssc_playMethod = 83;
		createSumLayout("hnssc",1,17,function(){
			hnssc_calcNotes();
		});
		createRenXuanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc84"){
		//直选复式
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 11;
		hnssc_playMethod = 84;
		createFiveLineLayout("hnssc", function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc85"){
		//直选单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 11;
		hnssc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
		createRenXuanSanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc86"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 11;
		hnssc_playMethod = 86;
		createSumLayout("hnssc",0,27,function(){
			hnssc_calcNotes();
		});
		createRenXuanSanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc87"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 11;
		hnssc_playMethod = 87;
		createOneLineLayout("hnssc","至少选择2个",0,9,false,function(){
			hnssc_calcNotes();
		});
		createRenXuanSanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc88"){
		//组选单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 11;
		hnssc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
		createRenXuanSanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc89"){
		//组选和值
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 11;
		hnssc_playMethod = 89;
		createOneLineLayout("hnssc","至少选择3个",0,9,false,function(){
			hnssc_calcNotes();
		});
		createRenXuanSanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc90"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 11;
		hnssc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
		createRenXuanSanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc91"){
		//混合组选
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 11;
		hnssc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
		createRenXuanSanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc92"){
		//组选和值
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 11;
		hnssc_playMethod = 92;
		createSumLayout("hnssc",1,26,function(){
			hnssc_calcNotes();
		});
		createRenXuanSanLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc93"){
		$("#hnssc_random").show();
		hnssc_sntuo = 0;
		hnssc_playType = 12;
		hnssc_playMethod = 93;
		createFiveLineLayout("hnssc", function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc94"){
		//直选单式
		$("#hnssc_random").hide();
		hnssc_sntuo = 3;
		hnssc_playType = 12;
		hnssc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnssc",tips);
		createRenXuanSiLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc95"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 12;
		hnssc_playMethod = 95;
		createOneLineLayout("hnssc","至少选择4个",0,9,false,function(){
			hnssc_calcNotes();
		});
		createRenXuanSiLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc96"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 12;
		hnssc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		createRenXuanSiLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc97"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 12;
		hnssc_playMethod = 97;
		$("#hnssc_ballView").empty();
		createOneLineLayout("hnssc","二重号:至少选择2个号码",0,9,false,function(){
			hnssc_calcNotes();
		});
		createRenXuanSiLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc98"){
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 12;
		hnssc_playMethod = 98;
		$("#hnssc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnssc",tips,0,9,false,function(){
			hnssc_calcNotes();
		});
		createRenXuanSiLayout("hnssc",hnssc_playMethod,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc99"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 13;
		hnssc_playMethod = 99;
		$("#hnssc_ballView").empty();
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc100"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 13;
		hnssc_playMethod = 100;
		$("#hnssc_ballView").empty();
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc101"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 13;
		hnssc_playMethod = 101;
		$("#hnssc_ballView").empty();
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc102"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 13;
		hnssc_playMethod = 102;
		$("#hnssc_ballView").empty();
		createOneLineLayout("hnssc","至少选择1个",0,9,false,function(){
			hnssc_calcNotes();
		});
		hnssc_qingkongAll();
	}else if(val == "hnssc103"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 103;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc104"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 104;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc105"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 105;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc106"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 106;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc107"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 107;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc108"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 108;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc109"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 109;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc110"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 110;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc111"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 111;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc112"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 14;
		hnssc_playMethod = 112;
		createTextBallOneLayout("hnssc",["龙","虎","和"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc123"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 123;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc124"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 124;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc125"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 125;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc126"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 126;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc127"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 127;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc128"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 128;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc129"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 129;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc130"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 130;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc131"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 131;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}else if(val == "hnssc132"){
		hnssc_qingkongAll();
		$("#hnssc_random").hide();
		hnssc_sntuo = 0;
		hnssc_playType = 16;
		hnssc_playMethod = 132;
		createTextBallOneLayout("hnssc",["龙","虎"],["至少选择一个"],function(){
			hnssc_calcNotes();
		});
	}

	if(hnsscScroll){
		hnsscScroll.refresh();
		hnsscScroll.scrollTo(0,0,1);
	}
	
	$("#hnssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("hnssc",temp);
	hideRandomWhenLi("hnssc",hnssc_sntuo,hnssc_playMethod);
	hnssc_calcNotes();
}
/**
 * [hnssc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hnssc_initFooterButton(){
	if(hnssc_playMethod == 0 || hnssc_playMethod == 62 || hnssc_playMethod == 78
		|| hnssc_playMethod == 84 || hnssc_playMethod == 93 || hnssc_playType == 7){
		if(LotteryStorage["hnssc"]["line1"].length > 0 || LotteryStorage["hnssc"]["line2"].length > 0 ||
			LotteryStorage["hnssc"]["line3"].length > 0 || LotteryStorage["hnssc"]["line4"].length > 0 ||
			LotteryStorage["hnssc"]["line5"].length > 0){
			$("#hnssc_qingkong").css("opacity",1.0);
		}else{
			$("#hnssc_qingkong").css("opacity",0.4);
		}
	}else if(hnssc_playMethod == 9){
		if(LotteryStorage["hnssc"]["line1"].length > 0 || LotteryStorage["hnssc"]["line2"].length > 0 ||
			LotteryStorage["hnssc"]["line3"].length > 0 || LotteryStorage["hnssc"]["line4"].length > 0 ){
			$("#hnssc_qingkong").css("opacity",1.0);
		}else{
			$("#hnssc_qingkong").css("opacity",0.4);
		}
	}else if(hnssc_playMethod == 37 || hnssc_playMethod == 4 || hnssc_playMethod == 6
		|| hnssc_playMethod == 26 || hnssc_playMethod == 15 || hnssc_playMethod == 75 || hnssc_playMethod == 77){
		if(LotteryStorage["hnssc"]["line1"].length > 0 || LotteryStorage["hnssc"]["line2"].length > 0
			|| LotteryStorage["hnssc"]["line3"].length > 0){
			$("#hnssc_qingkong").css("opacity",1.0);
		}else{
			$("#hnssc_qingkong").css("opacity",0.4);
		}
	}else if(hnssc_playMethod == 3 || hnssc_playMethod == 4 || hnssc_playMethod == 5
		|| hnssc_playMethod == 6 || hnssc_playMethod == 7 || hnssc_playMethod == 12
		|| hnssc_playMethod == 14 || hnssc_playMethod == 48 || hnssc_playMethod == 55
		|| hnssc_playMethod == 74 || hnssc_playMethod == 76 || hnssc_playMethod == 96 || hnssc_playMethod == 98){
		if(LotteryStorage["hnssc"]["line1"].length > 0 || LotteryStorage["hnssc"]["line2"].length > 0){
			$("#hnssc_qingkong").css("opacity",1.0);
		}else{
			$("#hnssc_qingkong").css("opacity",0.4);
		}
	}else if(hnssc_playMethod == 2 || hnssc_playMethod == 8 || hnssc_playMethod == 11 || hnssc_playMethod == 13 || hnssc_playMethod == 39
		|| hnssc_playMethod == 28 || hnssc_playMethod == 17 || hnssc_playMethod == 18 || hnssc_playMethod == 24 || hnssc_playMethod == 41
		|| hnssc_playMethod == 25 || hnssc_playMethod == 29 || hnssc_playMethod == 42 || hnssc_playMethod == 43 || hnssc_playMethod == 30
		|| hnssc_playMethod == 35 || hnssc_playMethod == 36 || hnssc_playMethod == 31 || hnssc_playMethod == 32 || hnssc_playMethod == 19
		|| hnssc_playMethod == 40 || hnssc_playMethod == 46 || hnssc_playMethod == 20 || hnssc_playMethod == 21 || hnssc_playMethod == 50
		|| hnssc_playMethod == 47 || hnssc_playMethod == 51 || hnssc_playMethod == 52 || hnssc_playMethod == 53 || hnssc_playMethod == 57 || hnssc_playMethod == 63
		|| hnssc_playMethod == 58 || hnssc_playMethod == 59 || hnssc_playMethod == 60 || hnssc_playMethod == 65 || hnssc_playMethod == 80 || hnssc_playMethod == 81 || hnssc_playType == 8
		|| hnssc_playMethod == 83 || hnssc_playMethod == 86 || hnssc_playMethod == 87 || hnssc_playMethod == 22 || hnssc_playMethod == 33 || hnssc_playMethod == 44
		|| hnssc_playMethod == 89 || hnssc_playMethod == 92 || hnssc_playMethod == 95 || hnssc_playMethod == 54 || hnssc_playMethod == 61
		|| hnssc_playMethod == 97 || hnssc_playType == 13  || hnssc_playType == 14 || hnssc_playType == 16){
		if(LotteryStorage["hnssc"]["line1"].length > 0){
			$("#hnssc_qingkong").css("opacity",1.0);
		}else{
			$("#hnssc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hnssc_qingkong").css("opacity",0);
	}

	if($("#hnssc_qingkong").css("opacity") == "0"){
		$("#hnssc_qingkong").css("display","none");
	}else{
		$("#hnssc_qingkong").css("display","block");
	}

	if($('#hnssc_zhushu').html() > 0){
		$("#hnssc_queding").css("opacity",1.0);
	}else{
		$("#hnssc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  hnssc_qingkongAll(){
	$("#hnssc_ballView span").removeClass('redBalls_active');
	LotteryStorage["hnssc"]["line1"] = [];
	LotteryStorage["hnssc"]["line2"] = [];
	LotteryStorage["hnssc"]["line3"] = [];
	LotteryStorage["hnssc"]["line4"] = [];
	LotteryStorage["hnssc"]["line5"] = [];

	localStorageUtils.removeParam("hnssc_line1");
	localStorageUtils.removeParam("hnssc_line2");
	localStorageUtils.removeParam("hnssc_line3");
	localStorageUtils.removeParam("hnssc_line4");
	localStorageUtils.removeParam("hnssc_line5");

	$('#hnssc_zhushu').text(0);
	$('#hnssc_money').text(0);
	clearAwardWin("hnssc");
	hnssc_initFooterButton();
}

/**
 * [hnssc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hnssc_calcNotes(){
	$('#hnssc_modeId').blur();
	$('#hnssc_fandian').blur();
	
	var notes = 0;

	if(hnssc_playMethod == 0){
		notes = LotteryStorage["hnssc"]["line1"].length *
			LotteryStorage["hnssc"]["line2"].length *
			LotteryStorage["hnssc"]["line3"].length *
			LotteryStorage["hnssc"]["line4"].length *
			LotteryStorage["hnssc"]["line5"].length;
	}else if(hnssc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,5);
	}else if(hnssc_playMethod == 3){
		if (LotteryStorage["hnssc"]["line1"].length >= 1 && LotteryStorage["hnssc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["hnssc"]["line1"],LotteryStorage["hnssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnssc_playMethod == 4){
		if (LotteryStorage["hnssc"]["line1"].length >= 2 && LotteryStorage["hnssc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["hnssc"]["line2"],LotteryStorage["hnssc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(hnssc_playMethod == 5 || hnssc_playMethod == 12){
		if (LotteryStorage["hnssc"]["line1"].length >= 1 && LotteryStorage["hnssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["hnssc"]["line1"],LotteryStorage["hnssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnssc_playMethod == 6 || hnssc_playMethod == 7 || hnssc_playMethod == 14){
		if (LotteryStorage["hnssc"]["line1"].length >= 1 && LotteryStorage["hnssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["hnssc"]["line1"],LotteryStorage["hnssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnssc_playMethod == 9){
		notes = LotteryStorage["hnssc"]["line1"].length *
			LotteryStorage["hnssc"]["line2"].length *
			LotteryStorage["hnssc"]["line3"].length *
			LotteryStorage["hnssc"]["line4"].length;
	}else if(hnssc_playMethod == 18 || hnssc_playMethod == 29 || hnssc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["hnssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(hnssc_playMethod == 22 || hnssc_playMethod == 33 || hnssc_playMethod == 44 ){
		notes = 54;
	}else if(hnssc_playMethod == 54 || hnssc_playMethod == 61){
		notes = 9;
	}else if(hnssc_playMethod == 51 || hnssc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["hnssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(hnssc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,4);
	}else if(hnssc_playMethod == 13|| hnssc_playMethod == 64 || hnssc_playMethod == 66 || hnssc_playMethod == 68 || hnssc_playMethod == 70 || hnssc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,2);
	}else if(hnssc_playMethod == 37 || hnssc_playMethod == 26 || hnssc_playMethod == 15 || hnssc_playMethod == 75 || hnssc_playMethod == 77){
		notes = LotteryStorage["hnssc"]["line1"].length *
			LotteryStorage["hnssc"]["line2"].length *
			LotteryStorage["hnssc"]["line3"].length ;
	}else if(hnssc_playMethod == 39 || hnssc_playMethod == 28 || hnssc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hnssc"]["line1"][i]);
		};
	}else if(hnssc_playMethod == 41 || hnssc_playMethod == 30 || hnssc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["hnssc"]["line1"].length,2);
	}else if(hnssc_playMethod == 42 || hnssc_playMethod == 31 || hnssc_playMethod == 20 || hnssc_playMethod == 68 || hnssc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,3);
	}else if(hnssc_playMethod == 43 || hnssc_playMethod == 32 || hnssc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hnssc"]["line1"][i]);
		};
	}else if(hnssc_playMethod == 48 || hnssc_playMethod == 55 || hnssc_playMethod == 74 || hnssc_playMethod == 76){
		notes = LotteryStorage["hnssc"]["line1"].length *
			LotteryStorage["hnssc"]["line2"].length ;
	}else if(hnssc_playMethod == 50 || hnssc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hnssc"]["line1"][i]);
		};
	}else if(hnssc_playMethod == 52 || hnssc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,2);
	}else if(hnssc_playMethod == 53 || hnssc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hnssc"]["line1"][i]);
		};
	}else if(hnssc_playMethod == 62){
		notes = LotteryStorage["hnssc"]["line1"].length +
			LotteryStorage["hnssc"]["line2"].length +
			LotteryStorage["hnssc"]["line3"].length +
			LotteryStorage["hnssc"]["line4"].length +
			LotteryStorage["hnssc"]["line5"].length;
	}else if(hnssc_playType == 13 || hnssc_playType == 14 || hnssc_playType == 16 || hnssc_playMethod == 8 || hnssc_playMethod == 71
		|| hnssc_playMethod == 24 || hnssc_playMethod == 25 || hnssc_playMethod == 35 || hnssc_playMethod == 36 || hnssc_playMethod == 46
		|| hnssc_playMethod == 47 || hnssc_playMethod == 63 || hnssc_playMethod == 65 || hnssc_playMethod == 67 || hnssc_playMethod == 69 ){
		notes = LotteryStorage["hnssc"]["line1"].length ;
	}else if(hnssc_playMethod == 78){
		notes = LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line2"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line3"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line4"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line3"].length +
			LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line4"].length +
			LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line4"].length +
			LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line4"].length * LotteryStorage["hnssc"]["line5"].length;
	}else if (hnssc_playMethod == 80) {
		if ($("#hnssc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hnssc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,2);
		}
	}else if (hnssc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,2) * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,2);
	}else if (hnssc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hnssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,2);
	}else if (hnssc_playMethod == 84) {
		notes = LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line3"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line4"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line4"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line4"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line4"].length +
			LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line4"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line4"].length * LotteryStorage["hnssc"]["line5"].length ;
	}else if (hnssc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hnssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,3);
	}else if (hnssc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["hnssc"]["line1"].length,2) * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,3);
	}else if (hnssc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,3) * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,3);
	}else if (hnssc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["hnssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hnssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,3);
	}else if (hnssc_playMethod == 93) {
		notes = LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line4"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line4"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line1"].length * LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line4"].length * LotteryStorage["hnssc"]["line5"].length +
			LotteryStorage["hnssc"]["line2"].length * LotteryStorage["hnssc"]["line3"].length * LotteryStorage["hnssc"]["line4"].length * LotteryStorage["hnssc"]["line5"].length;
	}else if (hnssc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,4)
			* mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,4);
	}else if (hnssc_playMethod == 96) {
		if (LotteryStorage["hnssc"]["line1"].length >= 1 && LotteryStorage["hnssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["hnssc"]["line1"],LotteryStorage["hnssc"]["line2"])
				* mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (hnssc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["hnssc"]["line1"].length,2) * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,4);
	}else if (hnssc_playMethod == 98) {
		if (LotteryStorage["hnssc"]["line1"].length >= 1 && LotteryStorage["hnssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["hnssc"]["line1"],LotteryStorage["hnssc"]["line2"]) * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = hnsscValidData($("#hnssc_single").val());
	}

	if(hnssc_sntuo == 3 || hnssc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","hnssc"),LotteryInfo.getMethodId("ssc",hnssc_playMethod))){
	}else{
		if(parseInt($('#hnssc_modeId').val()) == 8){
			$("#hnssc_random").hide();
		}else{
			$("#hnssc_random").show();
		}
	}

	//验证是否为空
	if( $("#hnssc_beiNum").val() =="" || parseInt($("#hnssc_beiNum").val()) == 0){
		$("#hnssc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#hnssc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#hnssc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#hnssc_zhushu').text(notes);
		if($("#hnssc_modeId").val() == "8"){
			$('#hnssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnssc_beiNum").val()),0.002));
		}else if ($("#hnssc_modeId").val() == "2"){
			$('#hnssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnssc_beiNum").val()),0.2));
		}else if ($("#hnssc_modeId").val() == "1"){
			$('#hnssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnssc_beiNum").val()),0.02));
		}else{
			$('#hnssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnssc_beiNum").val()),2));
		}
	} else {
		$('#hnssc_zhushu').text(0);
		$('#hnssc_money').text(0);
	}
	hnssc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('hnssc',hnssc_playMethod);
}

/**
 * [hnssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hnssc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#hnssc_queding").bind('click', function(event) {
		hnssc_rebate = $("#hnssc_fandian option:last").val();
		if(parseInt($('#hnssc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hnssc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#hnssc_modeId').val()) == 8){
			if (Number($('#hnssc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('hnssc',hnssc_playMethod);

		submitParams.lotteryType = "hnssc";
		var play = LotteryInfo.getPlayName("ssc",hnssc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",hnssc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = hnssc_playType;
		submitParams.playMethodIndex = hnssc_playMethod;
		var selectedBalls = [];
		if(hnssc_playMethod == 0 || hnssc_playMethod == 3 || hnssc_playMethod == 4
			|| hnssc_playMethod == 5 || hnssc_playMethod == 6 || hnssc_playMethod == 7
			|| hnssc_playMethod == 9 || hnssc_playMethod == 12 || hnssc_playMethod == 14
			|| hnssc_playMethod == 37 || hnssc_playMethod == 26 || hnssc_playMethod == 15
			|| hnssc_playMethod == 48 || hnssc_playMethod == 55 || hnssc_playMethod == 74 || hnssc_playType == 9){
			$("#hnssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(hnssc_playMethod == 2 || hnssc_playMethod == 8 || hnssc_playMethod == 11 || hnssc_playMethod == 13 || hnssc_playMethod == 24
			|| hnssc_playMethod == 39 || hnssc_playMethod == 28 || hnssc_playMethod == 17 || hnssc_playMethod == 18 || hnssc_playMethod == 25
			|| hnssc_playMethod == 22 || hnssc_playMethod == 33 || hnssc_playMethod == 44 || hnssc_playMethod == 54 || hnssc_playMethod == 61
			|| hnssc_playMethod == 41 || hnssc_playMethod == 42 || hnssc_playMethod == 43 || hnssc_playMethod == 29 || hnssc_playMethod == 35
			|| hnssc_playMethod == 30 || hnssc_playMethod == 31 || hnssc_playMethod == 32 || hnssc_playMethod == 40 || hnssc_playMethod == 36
			|| hnssc_playMethod == 19 || hnssc_playMethod == 20 || hnssc_playMethod == 21 || hnssc_playMethod == 46 || hnssc_playMethod == 47
			|| hnssc_playMethod == 50 || hnssc_playMethod == 57 || hnssc_playType == 8 || hnssc_playMethod == 51 || hnssc_playMethod == 58
			|| hnssc_playMethod == 52 || hnssc_playMethod == 53|| hnssc_playMethod == 59 || hnssc_playMethod == 60 || hnssc_playType == 13 || hnssc_playType == 14|| hnssc_playType == 16){
			$("#hnssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(hnssc_playType == 7 || hnssc_playMethod == 78 || hnssc_playMethod == 84 || hnssc_playMethod == 93){
			$("#hnssc_ballView div.ballView").each(function(){
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
		}else if(hnssc_playMethod == 80 || hnssc_playMethod == 81 || hnssc_playMethod == 83
			|| hnssc_playMethod == 86 || hnssc_playMethod == 87 || hnssc_playMethod == 89
			|| hnssc_playMethod == 92 || hnssc_playMethod == 95 || hnssc_playMethod == 97){
			$("#hnssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#hnssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#hnssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#hnssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#hnssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#hnssc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (hnssc_playMethod == 96 || hnssc_playMethod == 98) {
			$("#hnssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#hnssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#hnssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#hnssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#hnssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#hnssc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			hnsscValidateData("submit");
			var array = handleSingleStr($("#hnssc_single").val());
			if(hnssc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(hnssc_playMethod == 10 || hnssc_playMethod == 38 || hnssc_playMethod == 27
				|| hnssc_playMethod == 16 || hnssc_playMethod == 49 || hnssc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(hnssc_playMethod == 45 || hnssc_playMethod == 34 || hnssc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(hnssc_playMethod == 79 || hnssc_playMethod == 82 || hnssc_playMethod == 85 || hnssc_playMethod == 88 ||
				hnssc_playMethod == 89 || hnssc_playMethod == 90 || hnssc_playMethod == 91 || hnssc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#hnssc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#hnssc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#hnssc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#hnssc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#hnssc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#hnssc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#hnssc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#hnssc_fandian").val());
		submitParams.notes = $('#hnssc_zhushu').html();
		submitParams.sntuo = hnssc_sntuo;
		submitParams.multiple = $('#hnssc_beiNum').val();  //requirement
		submitParams.rebates = $('#hnssc_fandian').val();  //requirement
		submitParams.playMode = $('#hnssc_modeId').val();  //requirement
		submitParams.money = $('#hnssc_money').html();  //requirement
		submitParams.award = $('#hnssc_minAward').html();  //奖金
		submitParams.maxAward = $('#hnssc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#hnssc_ballView").empty();
		hnssc_qingkongAll();
	});
}

/**
 * [hnssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hnssc_randomOne(){
	hnssc_qingkongAll();
	if(hnssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["hnssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["hnssc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["hnssc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line2"], function(k, v){
			$("#" + "hnssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line3"], function(k, v){
			$("#" + "hnssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line4"], function(k, v){
			$("#" + "hnssc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line5"], function(k, v){
			$("#" + "hnssc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["hnssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["hnssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["hnssc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line2"], function(k, v){
			$("#" + "hnssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line3"], function(k, v){
			$("#" + "hnssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line4"], function(k, v){
			$("#" + "hnssc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(hnssc_playMethod == 37 || hnssc_playMethod == 26 || hnssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["hnssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnssc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line2"], function(k, v){
			$("#" + "hnssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line3"], function(k, v){
			$("#" + "hnssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 41 || hnssc_playMethod == 30 || hnssc_playMethod == 19 || hnssc_playMethod == 68
		|| hnssc_playMethod == 52 || hnssc_playMethod == 64 || hnssc_playMethod == 66
		|| hnssc_playMethod == 59 || hnssc_playMethod == 70 || hnssc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["hnssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 42 || hnssc_playMethod == 31 || hnssc_playMethod == 20 || hnssc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["hnssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 39 || hnssc_playMethod == 28 || hnssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["hnssc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 43 || hnssc_playMethod == 32 || hnssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["hnssc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 48 || hnssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["hnssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnssc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line2"], function(k, v){
			$("#" + "hnssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 25 || hnssc_playMethod == 36 || hnssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["hnssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 50 || hnssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["hnssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 53 || hnssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["hnssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["hnssc"]["line"+line].push(number+"");
		$.each(LotteryStorage["hnssc"]["line"+line], function(k, v){
			$("#" + "hnssc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 63 || hnssc_playMethod == 67 || hnssc_playMethod == 69 || hnssc_playMethod == 71 || hnssc_playType == 13
		|| hnssc_playMethod == 65 || hnssc_playMethod == 18 || hnssc_playMethod == 29 || hnssc_playMethod == 40 || hnssc_playMethod == 22
		|| hnssc_playMethod == 33 || hnssc_playMethod == 44 || hnssc_playMethod == 54 || hnssc_playMethod == 61
		|| hnssc_playMethod == 24 || hnssc_playMethod == 35 || hnssc_playMethod == 46 || hnssc_playMethod == 51 || hnssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["hnssc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 74 || hnssc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["hnssc"]["line1"].push(array[0]+"");
		LotteryStorage["hnssc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line2"], function(k, v){
			$("#" + "hnssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 75 || hnssc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["hnssc"]["line1"].push(array[0]+"");
		LotteryStorage["hnssc"]["line2"].push(array[1]+"");
		LotteryStorage["hnssc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line2"], function(k, v){
			$("#" + "hnssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line3"], function(k, v){
			$("#" + "hnssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["hnssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnssc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["hnssc"]["line"+lines[0]], function(k, v){
			$("#" + "hnssc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line"+lines[1]], function(k, v){
			$("#" + "hnssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["hnssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["hnssc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["hnssc"]["line"+lines[0]], function(k, v){
			$("#" + "hnssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line"+lines[1]], function(k, v){
			$("#" + "hnssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line"+lines[0]], function(k, v){
			$("#" + "hnssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["hnssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["hnssc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["hnssc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["hnssc"]["line"+lines[0]], function(k, v){
			$("#" + "hnssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line"+lines[1]], function(k, v){
			$("#" + "hnssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line"+lines[2]], function(k, v){
			$("#" + "hnssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnssc"]["line"+lines[3]], function(k, v){
			$("#" + "hnssc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(hnssc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["hnssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnssc"]["line1"], function(k, v){
			$("#" + "hnssc_line1" + v).toggleClass("redBalls_active");
		});
	}
	hnssc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hnssc_checkOutRandom(playMethod){
	var obj = new Object();
	if(hnssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(hnssc_playMethod == 18 || hnssc_playMethod == 29 || hnssc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(hnssc_playMethod == 22 || hnssc_playMethod == 33 || hnssc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(hnssc_playMethod == 54 || hnssc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(hnssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnssc_playMethod == 37 || hnssc_playMethod == 26 || hnssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnssc_playMethod == 39 || hnssc_playMethod == 28 || hnssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(hnssc_playMethod == 41 || hnssc_playMethod == 30 || hnssc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(hnssc_playMethod == 52 || hnssc_playMethod == 59 || hnssc_playMethod == 64 || hnssc_playMethod == 66 || hnssc_playMethod == 68
		||hnssc_playMethod == 70 || hnssc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hnssc_playMethod == 42 || hnssc_playMethod == 31 || hnssc_playMethod == 20 || hnssc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hnssc_playMethod == 43 || hnssc_playMethod == 32 || hnssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(hnssc_playMethod == 48 || hnssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnssc_playMethod == 50 || hnssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(hnssc_playMethod == 53 || hnssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(hnssc_playMethod == 62){
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
	}else if(hnssc_playMethod == 63 || hnssc_playMethod == 65 || hnssc_playMethod == 67 || hnssc_playMethod == 69 || hnssc_playMethod == 71
		|| hnssc_playMethod == 24 || hnssc_playMethod == 35 || hnssc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(hnssc_playMethod == 25 || hnssc_playMethod == 36 || hnssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(hnssc_playMethod == 51 || hnssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(hnssc_playMethod == 74 || hnssc_playMethod == 76){
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
	}else if(hnssc_playMethod == 75 || hnssc_playMethod == 77){
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
	}else if(hnssc_playMethod == 78){
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
	}else if(hnssc_playMethod == 84){
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
	}else if(hnssc_playMethod == 93){
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
	obj.sntuo = hnssc_sntuo;
	obj.multiple = 1;
	obj.rebates = hnssc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('hnssc',hnssc_playMethod,obj);  //机选奖金计算
	obj.award = $('#hnssc_minAward').html();     //奖金
	obj.maxAward = $('#hnssc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [hnsscValidateData 单式数据验证]
 */
function hnsscValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#hnssc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	hnsscValidData(textStr,type);
}

function hnsscValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(hnssc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 38 || hnssc_playMethod == 27 || hnssc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 45 || hnssc_playMethod == 34 || hnssc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 49 || hnssc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,2);
        hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,2);
        hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,3);
        hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,3);
        hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,3);
        hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,3);
        hnsscShowFooter(true,notes);
    }else if(hnssc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnssc_tab .button.red").size() ,4);
        hnsscShowFooter(true,notes);
    }

	$('#hnssc_delRepeat').off('click');
	$('#hnssc_delRepeat').on('click',function () {
		content.str = $('#hnssc_single').val() ? $('#hnssc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		hnsscShowFooter(true,notes);
		$("#hnssc_single").val(array.join(" "));
	});

    $("#hnssc_single").val(array.join(" "));
    return notes;
}

function hnsscShowFooter(isValid,notes){
	$('#hnssc_zhushu').text(notes);
	if($("#hnssc_modeId").val() == "8"){
		$('#hnssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnssc_beiNum").val()),0.002));
	}else if ($("#hnssc_modeId").val() == "2"){
		$('#hnssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnssc_beiNum").val()),0.2));
	}else if ($("#hnssc_modeId").val() == "1"){
		$('#hnssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnssc_beiNum").val()),0.02));
	}else{
		$('#hnssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnssc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	hnssc_initFooterButton();
	calcAwardWin('hnssc',hnssc_playMethod);  //计算奖金和盈利
}