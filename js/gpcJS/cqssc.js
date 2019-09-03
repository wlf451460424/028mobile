var cqssc_playType = 2;
var cqssc_playMethod = 15;
var cqssc_sntuo = 0;
var cqssc_rebate;
var cqsscScroll;

var lotteryPlay_config = [];
//进入这个页面时调用
function cqsscPageLoadedPanel() {
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("cqssc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("cqssc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function cqsscPageUnloadedPanel(){
	$("#cqssc_queding").off('click');
	$("#cqsscPage_back").off('click');
	$("#cqssc_ballView").empty();
	$("#cqsscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="cqsscPlaySelect"></select>');
	$("#cqsscSelect").append($select);
}

//入口函数
function cqssc_init(){
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
	$("#cqssc_title").html(LotteryInfo.getLotteryNameByTag("cqssc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodArry("ssc").length;j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == cqssc_playType && j == cqssc_playMethod){
					$play.append('<option value="cqssc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="cqssc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(cqssc_playMethod,onShowArray)>-1 ){
						cqssc_playType = i;
						cqssc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#cqsscPlaySelect").append($play);
		}
	}
	
	if($("#cqsscPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("cqsscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:cqsscChangeItem
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

	GetLotteryInfo("cqssc",function (){
		cqsscChangeItem("cqssc"+cqssc_playMethod);
	});

	//添加滑动条
	if(!cqsscScroll){
		cqsscScroll = new IScroll('#cqsscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("cqssc",LotteryInfo.getLotteryIdByTag("cqssc"));

	//获取上一期开奖
	queryLastPrize("cqssc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('cqssc');

	//机选选号
	$("#cqssc_random").off('click');
	$("#cqssc_random").on('click', function(event) {
		cqssc_randomOne();
	});
	
	$("#cqssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",cqssc_playMethod));
	//玩法说明
	$("#cqssc_paly_shuoming").off('click');
	$("#cqssc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#cqssc_shuoming").text());
	});

	//返回
	$("#cqsscPage_back").on('click', function(event) {
		// cqssc_playType = 2;
		// cqssc_playMethod = 15;
		$("#cqssc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		cqssc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("cqssc");//清空
	cqssc_submitData();
}

function cqsscResetPlayType(){
	cqssc_playType = 2;
	cqssc_playMethod = 15;
}

function cqsscChangeItem(val) {
	cqssc_qingkongAll();
	var temp = val.substring("cqssc".length,val.length);
	if(val == "cqssc0"){
		//直选复式
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 0;
		cqssc_playMethod = 0;
		createFiveLineLayout("cqssc", function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc1"){
		//直选单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 0;
		cqssc_playMethod = 1;
		$("#cqssc_ballView").empty();
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc2"){
		//组选120
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 0;
		cqssc_playMethod = 2;
		createOneLineLayout("cqssc","至少选择5个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc3"){
		//组选60
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 0;
		cqssc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc4"){
		//组选30
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 0;
		cqssc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc5"){
		//组选20
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 0;
		cqssc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc6"){
		//组选10
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 0;
		cqssc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc7"){
		//组选5
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 0;
		cqssc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc8"){
		//总和大小单双
		$("#cqssc_random").show();
		var num = ["大","小","单","双"];
		cqssc_sntuo = 0;
		cqssc_playType = 0;
		cqssc_playMethod = 8;
		createNonNumLayout("cqssc",cqssc_playMethod,num,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc9"){
		//直选复式
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 1;
		cqssc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("cqssc",tips, function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc10"){
		//直选单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 1;
		cqssc_playMethod = 10;
		$("#cqssc_ballView").empty();
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc11"){
		//组选24
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 1;
		cqssc_playMethod = 11;
		createOneLineLayout("cqssc","至少选择4个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc12"){
		//组选12
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 1;
		cqssc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc13"){
		//组选6
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 1;
		cqssc_playMethod = 13;
		createOneLineLayout("cqssc","二重号:至少选择2个号码",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc14"){
		//组选4
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 1;
		cqssc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc15"){
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc16"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 2;
		cqssc_playMethod = 16;
		$("#cqssc_ballView").empty();
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc17"){
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 17;
		createSumLayout("cqssc",0,27,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc18"){
		//直选跨度
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 18;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc19"){
		//后三组三
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 19;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc20"){
		//后三组六
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 20;
		createOneLineLayout("cqssc","至少选择3个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc21"){
		//后三和值
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 21;
		createSumLayout("cqssc",1,26,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc22"){
		//后三组选包胆
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 22;
		cqssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("cqssc",array,["请选择一个号码"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc23"){
		//后三混合组选
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 2;
		cqssc_playMethod = 23;
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc24"){
		//和值尾数
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 24;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc25"){
		//特殊号
		$("#cqssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		cqssc_sntuo = 0;
		cqssc_playType = 2;
		cqssc_playMethod = 25;
		createNonNumLayout("cqssc",cqssc_playMethod,num,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc26"){
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc27"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 3;
		cqssc_playMethod = 27;
		$("#cqssc_ballView").empty();
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc28"){
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 28;
		createSumLayout("cqssc",0,27,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc29"){
		//直选跨度
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 29;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc30"){
		//中三组三
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 30;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc31"){
		//中三组六
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 31;
		createOneLineLayout("cqssc","至少选择3个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc32"){
		//中三和值
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 32;
		createSumLayout("cqssc",1,26,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc33"){
		//中三组选包胆
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 33;
		cqssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("cqssc",array,["请选择一个号码"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc34"){
		//中三混合组选
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 3;
		cqssc_playMethod = 34;
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc35"){
		//和值尾数
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 35;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc36"){
		//特殊号
		$("#cqssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		cqssc_sntuo = 0;
		cqssc_playType = 3;
		cqssc_playMethod = 36;
		createNonNumLayout("cqssc",cqssc_playMethod,num,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc37"){
		//直选复式
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc38"){
		//直选单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 4;
		cqssc_playMethod = 38;
		$("#cqssc_ballView").empty();
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc39"){
		//和值
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 39;
		createSumLayout("cqssc",0,27,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc40"){
		//直选跨度
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 40;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc41"){
		//前三组三
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 41;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc42"){
		//前三组六
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 42;
		createOneLineLayout("cqssc","至少选择3个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc43"){
		//前三和值
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 43;
		createSumLayout("cqssc",1,26,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc44"){
		//前三组选包胆
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 44;
		cqssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("cqssc",array,["请选择一个号码"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc45"){
		//前三混合组选
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 4;
		cqssc_playMethod = 45;
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc46"){
		//和值尾数
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 46;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc47"){
		//特殊号
		$("#cqssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		cqssc_sntuo = 0;
		cqssc_playType = 4;
		cqssc_playMethod = 47;
		createNonNumLayout("cqssc",cqssc_playMethod,num,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc48"){
		//后二复式
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 5;
		cqssc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc49"){
		//后二单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 5;
		cqssc_playMethod = 49;
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc50"){
		//后二和值
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 5;
		cqssc_playMethod = 50;
		createSumLayout("cqssc",0,18,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc51"){
		//直选跨度
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 5;
		cqssc_playMethod = 51;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc52"){
		//后二组选
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 5;
		cqssc_playMethod = 52;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc53"){
		//后二和值
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 5;
		cqssc_playMethod = 53;
		createSumLayout("cqssc",1,17,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc54"){
		//后二组选包胆
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 5;
		cqssc_playMethod = 54;
		cqssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("cqssc",array,["请选择一个号码"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc55"){
		//前二复式
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 6;
		cqssc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc56"){
		//前二单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 6;
		cqssc_playMethod = 56;
		cqssc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
	}else if(val == "cqssc57"){
		//前二和值
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 6;
		cqssc_playMethod = 57;
		createSumLayout("cqssc",0,18,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc58"){
		//直选跨度
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 6;
		cqssc_playMethod = 58;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc59"){
		//前二组选
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 6;
		cqssc_playMethod = 59;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc60"){
		//前二和值
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 6;
		cqssc_playMethod = 60;
		createSumLayout("cqssc",1,17,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc61"){
		//前二组选包胆
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 6;
		cqssc_playMethod = 61;
		cqssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("cqssc",array,["请选择一个号码"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc62"){
		//定位复式
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 7;
		cqssc_playMethod = 62;
		createFiveLineLayout("cqssc", function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc63"){
		//后三一码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 63;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc64"){
		//后三二码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 64;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc65"){
		//前三一码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 65;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc66"){
		//前三二码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 66;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc67"){
		//后四一码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 67;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc68"){
		//后四二码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 68;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc69"){
		//前四一码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 69;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc70"){
		//前四二码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 70;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc71"){
		//五星一码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 71;
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc72"){
		//五星二码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 72;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc73"){
		//五星三码
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 8;
		cqssc_playMethod = 73;
		createOneLineLayout("cqssc","至少选择3个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc74"){
		//后二大小单双
		cqssc_qingkongAll();
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 9;
		cqssc_playMethod = 74;
		createTextBallTwoLayout("cqssc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc75"){
		//后三大小单双
		cqssc_qingkongAll();
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 9;
		cqssc_playMethod = 75;
		createTextBallThreeLayout("cqssc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc76"){
		//前二大小单双
		cqssc_qingkongAll();
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 9;
		cqssc_playMethod = 76;
		createTextBallTwoLayout("cqssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc77"){
		//前三大小单双
		cqssc_qingkongAll();
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 9;
		cqssc_playMethod = 77;
		createTextBallThreeLayout("cqssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc78"){
		//直选复式
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 10;
		cqssc_playMethod = 78;
		createFiveLineLayout("cqssc",function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc79"){
		//直选单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 10;
		cqssc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
		createRenXuanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc80"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 10;
		cqssc_playMethod = 80;
		createSumLayout("cqssc",0,18,function(){
			cqssc_calcNotes();
		});
		createRenXuanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc81"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 10;
		cqssc_playMethod = 81;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		createRenXuanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc82"){
		//组选单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 10;
		cqssc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
		createRenXuanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc83"){
		//组选和值
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 10;
		cqssc_playMethod = 83;
		createSumLayout("cqssc",1,17,function(){
			cqssc_calcNotes();
		});
		createRenXuanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc84"){
		//直选复式
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 11;
		cqssc_playMethod = 84;
		createFiveLineLayout("cqssc", function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc85"){
		//直选单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 11;
		cqssc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
		createRenXuanSanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc86"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 11;
		cqssc_playMethod = 86;
		createSumLayout("cqssc",0,27,function(){
			cqssc_calcNotes();
		});
		createRenXuanSanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc87"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 11;
		cqssc_playMethod = 87;
		createOneLineLayout("cqssc","至少选择2个",0,9,false,function(){
			cqssc_calcNotes();
		});
		createRenXuanSanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc88"){
		//组选单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 11;
		cqssc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
		createRenXuanSanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc89"){
		//组选和值
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 11;
		cqssc_playMethod = 89;
		createOneLineLayout("cqssc","至少选择3个",0,9,false,function(){
			cqssc_calcNotes();
		});
		createRenXuanSanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc90"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 11;
		cqssc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
		createRenXuanSanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc91"){
		//混合组选
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 11;
		cqssc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
		createRenXuanSanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc92"){
		//组选和值
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 11;
		cqssc_playMethod = 92;
		createSumLayout("cqssc",1,26,function(){
			cqssc_calcNotes();
		});
		createRenXuanSanLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc93"){
		$("#cqssc_random").show();
		cqssc_sntuo = 0;
		cqssc_playType = 12;
		cqssc_playMethod = 93;
		createFiveLineLayout("cqssc", function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc94"){
		//直选单式
		$("#cqssc_random").hide();
		cqssc_sntuo = 3;
		cqssc_playType = 12;
		cqssc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("cqssc",tips);
		createRenXuanSiLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc95"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 12;
		cqssc_playMethod = 95;
		createOneLineLayout("cqssc","至少选择4个",0,9,false,function(){
			cqssc_calcNotes();
		});
		createRenXuanSiLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc96"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 12;
		cqssc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		createRenXuanSiLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc97"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 12;
		cqssc_playMethod = 97;
		$("#cqssc_ballView").empty();
		createOneLineLayout("cqssc","二重号:至少选择2个号码",0,9,false,function(){
			cqssc_calcNotes();
		});
		createRenXuanSiLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc98"){
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 12;
		cqssc_playMethod = 98;
		$("#cqssc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("cqssc",tips,0,9,false,function(){
			cqssc_calcNotes();
		});
		createRenXuanSiLayout("cqssc",cqssc_playMethod,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc99"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 13;
		cqssc_playMethod = 99;
		$("#cqssc_ballView").empty();
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc100"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 13;
		cqssc_playMethod = 100;
		$("#cqssc_ballView").empty();
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc101"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 13;
		cqssc_playMethod = 101;
		$("#cqssc_ballView").empty();
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc102"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 13;
		cqssc_playMethod = 102;
		$("#cqssc_ballView").empty();
		createOneLineLayout("cqssc","至少选择1个",0,9,false,function(){
			cqssc_calcNotes();
		});
		cqssc_qingkongAll();
	}else if(val == "cqssc103"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 103;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc104"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 104;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc105"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 105;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc106"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 106;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc107"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 107;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc108"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 108;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc109"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 109;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc110"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 110;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc111"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 111;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc112"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 14;
		cqssc_playMethod = 112;
		createTextBallOneLayout("cqssc",["龙","虎","和"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc123"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 123;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc124"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 124;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc125"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 125;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc126"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 126;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc127"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 127;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc128"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 128;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc129"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 129;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc130"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 130;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc131"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 131;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}else if(val == "cqssc132"){
		cqssc_qingkongAll();
		$("#cqssc_random").hide();
		cqssc_sntuo = 0;
		cqssc_playType = 16;
		cqssc_playMethod = 132;
		createTextBallOneLayout("cqssc",["龙","虎"],["至少选择一个"],function(){
			cqssc_calcNotes();
		});
	}

	if(cqsscScroll){
		cqsscScroll.refresh();
		cqsscScroll.scrollTo(0,0,1);
	}
	
	$("#cqssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("cqssc",temp);
	hideRandomWhenLi("cqssc",cqssc_sntuo,cqssc_playMethod);
	cqssc_calcNotes();
}
/**
 * [cqssc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function cqssc_initFooterButton(){
	if(cqssc_playMethod == 0 || cqssc_playMethod == 62 || cqssc_playMethod == 78
		|| cqssc_playMethod == 84 || cqssc_playMethod == 93 || cqssc_playType == 7){
		if(LotteryStorage["cqssc"]["line1"].length > 0 || LotteryStorage["cqssc"]["line2"].length > 0 ||
			LotteryStorage["cqssc"]["line3"].length > 0 || LotteryStorage["cqssc"]["line4"].length > 0 ||
			LotteryStorage["cqssc"]["line5"].length > 0){
			$("#cqssc_qingkong").css("opacity",1.0);
		}else{
			$("#cqssc_qingkong").css("opacity",0.4);
		}
	}else if(cqssc_playMethod == 9){
		if(LotteryStorage["cqssc"]["line1"].length > 0 || LotteryStorage["cqssc"]["line2"].length > 0 ||
			LotteryStorage["cqssc"]["line3"].length > 0 || LotteryStorage["cqssc"]["line4"].length > 0 ){
			$("#cqssc_qingkong").css("opacity",1.0);
		}else{
			$("#cqssc_qingkong").css("opacity",0.4);
		}
	}else if(cqssc_playMethod == 37 || cqssc_playMethod == 4 || cqssc_playMethod == 6
		|| cqssc_playMethod == 26 || cqssc_playMethod == 15 || cqssc_playMethod == 75 || cqssc_playMethod == 77){
		if(LotteryStorage["cqssc"]["line1"].length > 0 || LotteryStorage["cqssc"]["line2"].length > 0
			|| LotteryStorage["cqssc"]["line3"].length > 0){
			$("#cqssc_qingkong").css("opacity",1.0);
		}else{
			$("#cqssc_qingkong").css("opacity",0.4);
		}
	}else if(cqssc_playMethod == 3 || cqssc_playMethod == 4 || cqssc_playMethod == 5
		|| cqssc_playMethod == 6 || cqssc_playMethod == 7 || cqssc_playMethod == 12
		|| cqssc_playMethod == 14 || cqssc_playMethod == 48 || cqssc_playMethod == 55
		|| cqssc_playMethod == 74 || cqssc_playMethod == 76 || cqssc_playMethod == 96 || cqssc_playMethod == 98){
		if(LotteryStorage["cqssc"]["line1"].length > 0 || LotteryStorage["cqssc"]["line2"].length > 0){
			$("#cqssc_qingkong").css("opacity",1.0);
		}else{
			$("#cqssc_qingkong").css("opacity",0.4);
		}
	}else if(cqssc_playMethod == 2 || cqssc_playMethod == 8 || cqssc_playMethod == 11 || cqssc_playMethod == 13 || cqssc_playMethod == 39
		|| cqssc_playMethod == 28 || cqssc_playMethod == 17 || cqssc_playMethod == 18 || cqssc_playMethod == 24 || cqssc_playMethod == 41
		|| cqssc_playMethod == 25 || cqssc_playMethod == 29 || cqssc_playMethod == 42 || cqssc_playMethod == 43 || cqssc_playMethod == 30
		|| cqssc_playMethod == 35 || cqssc_playMethod == 36 || cqssc_playMethod == 31 || cqssc_playMethod == 32 || cqssc_playMethod == 19
		|| cqssc_playMethod == 40 || cqssc_playMethod == 46 || cqssc_playMethod == 20 || cqssc_playMethod == 21 || cqssc_playMethod == 50
		|| cqssc_playMethod == 47 || cqssc_playMethod == 51 || cqssc_playMethod == 52 || cqssc_playMethod == 53 || cqssc_playMethod == 57 || cqssc_playMethod == 63
		|| cqssc_playMethod == 58 || cqssc_playMethod == 59 || cqssc_playMethod == 60 || cqssc_playMethod == 65 || cqssc_playMethod == 80 || cqssc_playMethod == 81 || cqssc_playType == 8
		|| cqssc_playMethod == 83 || cqssc_playMethod == 86 || cqssc_playMethod == 87 || cqssc_playMethod == 22 || cqssc_playMethod == 33 || cqssc_playMethod == 44
		|| cqssc_playMethod == 89 || cqssc_playMethod == 92 || cqssc_playMethod == 95 || cqssc_playMethod == 54 || cqssc_playMethod == 61
		|| cqssc_playMethod == 97 || cqssc_playType == 13  || cqssc_playType == 14 || cqssc_playType == 16){
		if(LotteryStorage["cqssc"]["line1"].length > 0){
			$("#cqssc_qingkong").css("opacity",1.0);
		}else{
			$("#cqssc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#cqssc_qingkong").css("opacity",0);
	}

	if($("#cqssc_qingkong").css("opacity") == "0"){
		$("#cqssc_qingkong").css("display","none");
	}else{
		$("#cqssc_qingkong").css("display","block");
	}

	if($('#cqssc_zhushu').html() > 0){
		$("#cqssc_queding").css("opacity",1.0);
	}else{
		$("#cqssc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  cqssc_qingkongAll(){
	$("#cqssc_ballView span").removeClass('redBalls_active');
	LotteryStorage["cqssc"]["line1"] = [];
	LotteryStorage["cqssc"]["line2"] = [];
	LotteryStorage["cqssc"]["line3"] = [];
	LotteryStorage["cqssc"]["line4"] = [];
	LotteryStorage["cqssc"]["line5"] = [];

	localStorageUtils.removeParam("cqssc_line1");
	localStorageUtils.removeParam("cqssc_line2");
	localStorageUtils.removeParam("cqssc_line3");
	localStorageUtils.removeParam("cqssc_line4");
	localStorageUtils.removeParam("cqssc_line5");

	$('#cqssc_zhushu').text(0);
	$('#cqssc_money').text(0);
	clearAwardWin("cqssc");
	cqssc_initFooterButton();
}

/**
 * [cqssc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function cqssc_calcNotes(){
	$('#cqssc_modeId').blur();
	$('#cqssc_fandian').blur();
	
	var notes = 0;

	if(cqssc_playMethod == 0){
		notes = LotteryStorage["cqssc"]["line1"].length *
			LotteryStorage["cqssc"]["line2"].length *
			LotteryStorage["cqssc"]["line3"].length *
			LotteryStorage["cqssc"]["line4"].length *
			LotteryStorage["cqssc"]["line5"].length;
	}else if(cqssc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,5);
	}else if(cqssc_playMethod == 3){
		if (LotteryStorage["cqssc"]["line1"].length >= 1 && LotteryStorage["cqssc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["cqssc"]["line1"],LotteryStorage["cqssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(cqssc_playMethod == 4){
		if (LotteryStorage["cqssc"]["line1"].length >= 2 && LotteryStorage["cqssc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["cqssc"]["line2"],LotteryStorage["cqssc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(cqssc_playMethod == 5 || cqssc_playMethod == 12){
		if (LotteryStorage["cqssc"]["line1"].length >= 1 && LotteryStorage["cqssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["cqssc"]["line1"],LotteryStorage["cqssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(cqssc_playMethod == 6 || cqssc_playMethod == 7 || cqssc_playMethod == 14){
		if (LotteryStorage["cqssc"]["line1"].length >= 1 && LotteryStorage["cqssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["cqssc"]["line1"],LotteryStorage["cqssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(cqssc_playMethod == 9){
		notes = LotteryStorage["cqssc"]["line1"].length *
			LotteryStorage["cqssc"]["line2"].length *
			LotteryStorage["cqssc"]["line3"].length *
			LotteryStorage["cqssc"]["line4"].length;
	}else if(cqssc_playMethod == 18 || cqssc_playMethod == 29 || cqssc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["cqssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(cqssc_playMethod == 22 || cqssc_playMethod == 33 || cqssc_playMethod == 44 ){
		notes = 54;
	}else if(cqssc_playMethod == 54 || cqssc_playMethod == 61){
		notes = 9;
	}else if(cqssc_playMethod == 51 || cqssc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["cqssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(cqssc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,4);
	}else if(cqssc_playMethod == 13|| cqssc_playMethod == 64 || cqssc_playMethod == 66 || cqssc_playMethod == 68 || cqssc_playMethod == 70 || cqssc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,2);
	}else if(cqssc_playMethod == 37 || cqssc_playMethod == 26 || cqssc_playMethod == 15 || cqssc_playMethod == 75 || cqssc_playMethod == 77){
		notes = LotteryStorage["cqssc"]["line1"].length *
			LotteryStorage["cqssc"]["line2"].length *
			LotteryStorage["cqssc"]["line3"].length ;
	}else if(cqssc_playMethod == 39 || cqssc_playMethod == 28 || cqssc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["cqssc"]["line1"][i]);
		};
	}else if(cqssc_playMethod == 41 || cqssc_playMethod == 30 || cqssc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["cqssc"]["line1"].length,2);
	}else if(cqssc_playMethod == 42 || cqssc_playMethod == 31 || cqssc_playMethod == 20 || cqssc_playMethod == 68 || cqssc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,3);
	}else if(cqssc_playMethod == 43 || cqssc_playMethod == 32 || cqssc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["cqssc"]["line1"][i]);
		};
	}else if(cqssc_playMethod == 48 || cqssc_playMethod == 55 || cqssc_playMethod == 74 || cqssc_playMethod == 76){
		notes = LotteryStorage["cqssc"]["line1"].length *
			LotteryStorage["cqssc"]["line2"].length ;
	}else if(cqssc_playMethod == 50 || cqssc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["cqssc"]["line1"][i]);
		};
	}else if(cqssc_playMethod == 52 || cqssc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,2);
	}else if(cqssc_playMethod == 53 || cqssc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["cqssc"]["line1"][i]);
		};
	}else if(cqssc_playMethod == 62){
		notes = LotteryStorage["cqssc"]["line1"].length +
			LotteryStorage["cqssc"]["line2"].length +
			LotteryStorage["cqssc"]["line3"].length +
			LotteryStorage["cqssc"]["line4"].length +
			LotteryStorage["cqssc"]["line5"].length;
	}else if(cqssc_playType == 13 || cqssc_playType == 14 || cqssc_playType == 16 || cqssc_playMethod == 8 || cqssc_playMethod == 71
		|| cqssc_playMethod == 24 || cqssc_playMethod == 25 || cqssc_playMethod == 35 || cqssc_playMethod == 36 || cqssc_playMethod == 46
		|| cqssc_playMethod == 47 || cqssc_playMethod == 63 || cqssc_playMethod == 65 || cqssc_playMethod == 67 || cqssc_playMethod == 69 ){
		notes = LotteryStorage["cqssc"]["line1"].length ;
	}else if(cqssc_playMethod == 78){
		notes = LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line2"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line3"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line4"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line3"].length +
			LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line4"].length +
			LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line4"].length +
			LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line4"].length * LotteryStorage["cqssc"]["line5"].length;
	}else if (cqssc_playMethod == 80) {
		if ($("#cqssc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["cqssc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,2);
		}
	}else if (cqssc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,2) * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,2);
	}else if (cqssc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["cqssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,2);
	}else if (cqssc_playMethod == 84) {
		notes = LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line3"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line4"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line4"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line4"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line4"].length +
			LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line4"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line4"].length * LotteryStorage["cqssc"]["line5"].length ;
	}else if (cqssc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["cqssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,3);
	}else if (cqssc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["cqssc"]["line1"].length,2) * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,3);
	}else if (cqssc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,3) * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,3);
	}else if (cqssc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["cqssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["cqssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,3);
	}else if (cqssc_playMethod == 93) {
		notes = LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line4"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line4"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line1"].length * LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line4"].length * LotteryStorage["cqssc"]["line5"].length +
			LotteryStorage["cqssc"]["line2"].length * LotteryStorage["cqssc"]["line3"].length * LotteryStorage["cqssc"]["line4"].length * LotteryStorage["cqssc"]["line5"].length;
	}else if (cqssc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,4)
			* mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,4);
	}else if (cqssc_playMethod == 96) {
		if (LotteryStorage["cqssc"]["line1"].length >= 1 && LotteryStorage["cqssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["cqssc"]["line1"],LotteryStorage["cqssc"]["line2"])
				* mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (cqssc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["cqssc"]["line1"].length,2) * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,4);
	}else if (cqssc_playMethod == 98) {
		if (LotteryStorage["cqssc"]["line1"].length >= 1 && LotteryStorage["cqssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["cqssc"]["line1"],LotteryStorage["cqssc"]["line2"]) * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = cqsscValidData($("#cqssc_single").val());
	}

	if(cqssc_sntuo == 3 || cqssc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","cqssc"),LotteryInfo.getMethodId("ssc",cqssc_playMethod))){
	}else{
		if(parseInt($('#cqssc_modeId').val()) == 8){
			$("#cqssc_random").hide();
		}else{
			$("#cqssc_random").show();
		}
	}

	//验证是否为空
	if( $("#cqssc_beiNum").val() =="" || parseInt($("#cqssc_beiNum").val()) == 0){
		$("#cqssc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#cqssc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#cqssc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#cqssc_zhushu').text(notes);
		if($("#cqssc_modeId").val() == "8"){
			$('#cqssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqssc_beiNum").val()),0.002));
		}else if ($("#cqssc_modeId").val() == "2"){
			$('#cqssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqssc_beiNum").val()),0.2));
		}else if ($("#cqssc_modeId").val() == "1"){
			$('#cqssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqssc_beiNum").val()),0.02));
		}else{
			$('#cqssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqssc_beiNum").val()),2));
		}
	} else {
		$('#cqssc_zhushu').text(0);
		$('#cqssc_money').text(0);
	}
	cqssc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('cqssc',cqssc_playMethod);
}

/**
 * [cqssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function cqssc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#cqssc_queding").bind('click', function(event) {
		cqssc_rebate = $("#cqssc_fandian option:last").val();
		if(parseInt($('#cqssc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		cqssc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#cqssc_modeId').val()) == 8){
			if (Number($('#cqssc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('cqssc',cqssc_playMethod);

		submitParams.lotteryType = "cqssc";
		var play = LotteryInfo.getPlayName("ssc",cqssc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",cqssc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = cqssc_playType;
		submitParams.playMethodIndex = cqssc_playMethod;
		var selectedBalls = [];
		if(cqssc_playMethod == 0 || cqssc_playMethod == 3 || cqssc_playMethod == 4
			|| cqssc_playMethod == 5 || cqssc_playMethod == 6 || cqssc_playMethod == 7
			|| cqssc_playMethod == 9 || cqssc_playMethod == 12 || cqssc_playMethod == 14
			|| cqssc_playMethod == 37 || cqssc_playMethod == 26 || cqssc_playMethod == 15
			|| cqssc_playMethod == 48 || cqssc_playMethod == 55 || cqssc_playMethod == 74 || cqssc_playType == 9){
			$("#cqssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(cqssc_playMethod == 2 || cqssc_playMethod == 8 || cqssc_playMethod == 11 || cqssc_playMethod == 13 || cqssc_playMethod == 24
			|| cqssc_playMethod == 39 || cqssc_playMethod == 28 || cqssc_playMethod == 17 || cqssc_playMethod == 18 || cqssc_playMethod == 25
			|| cqssc_playMethod == 22 || cqssc_playMethod == 33 || cqssc_playMethod == 44 || cqssc_playMethod == 54 || cqssc_playMethod == 61
			|| cqssc_playMethod == 41 || cqssc_playMethod == 42 || cqssc_playMethod == 43 || cqssc_playMethod == 29 || cqssc_playMethod == 35
			|| cqssc_playMethod == 30 || cqssc_playMethod == 31 || cqssc_playMethod == 32 || cqssc_playMethod == 40 || cqssc_playMethod == 36
			|| cqssc_playMethod == 19 || cqssc_playMethod == 20 || cqssc_playMethod == 21 || cqssc_playMethod == 46 || cqssc_playMethod == 47
			|| cqssc_playMethod == 50 || cqssc_playMethod == 57 || cqssc_playType == 8 || cqssc_playMethod == 51 || cqssc_playMethod == 58
			|| cqssc_playMethod == 52 || cqssc_playMethod == 53|| cqssc_playMethod == 59 || cqssc_playMethod == 60 || cqssc_playType == 13 || cqssc_playType == 14|| cqssc_playType == 16){
			$("#cqssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(cqssc_playType == 7 || cqssc_playMethod == 78 || cqssc_playMethod == 84 || cqssc_playMethod == 93){
			$("#cqssc_ballView div.ballView").each(function(){
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
		}else if(cqssc_playMethod == 80 || cqssc_playMethod == 81 || cqssc_playMethod == 83
			|| cqssc_playMethod == 86 || cqssc_playMethod == 87 || cqssc_playMethod == 89
			|| cqssc_playMethod == 92 || cqssc_playMethod == 95 || cqssc_playMethod == 97){
			$("#cqssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#cqssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#cqssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#cqssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#cqssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#cqssc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (cqssc_playMethod == 96 || cqssc_playMethod == 98) {
			$("#cqssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#cqssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#cqssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#cqssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#cqssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#cqssc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			cqsscValidateData("submit");
			var array = handleSingleStr($("#cqssc_single").val());
			if(cqssc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(cqssc_playMethod == 10 || cqssc_playMethod == 38 || cqssc_playMethod == 27
				|| cqssc_playMethod == 16 || cqssc_playMethod == 49 || cqssc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(cqssc_playMethod == 45 || cqssc_playMethod == 34 || cqssc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(cqssc_playMethod == 79 || cqssc_playMethod == 82 || cqssc_playMethod == 85 || cqssc_playMethod == 88 ||
				cqssc_playMethod == 89 || cqssc_playMethod == 90 || cqssc_playMethod == 91 || cqssc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#cqssc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#cqssc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#cqssc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#cqssc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#cqssc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#cqssc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#cqssc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#cqssc_fandian").val());
		submitParams.notes = $('#cqssc_zhushu').html();
		submitParams.sntuo = cqssc_sntuo;
		submitParams.multiple = $('#cqssc_beiNum').val();  //requirement
		submitParams.rebates = $('#cqssc_fandian').val();  //requirement
		submitParams.playMode = $('#cqssc_modeId').val();  //requirement
		submitParams.money = $('#cqssc_money').html();  //requirement
		submitParams.award = $('#cqssc_minAward').html();  //奖金
		submitParams.maxAward = $('#cqssc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#cqssc_ballView").empty();
		cqssc_qingkongAll();
	});
}

/**
 * [cqssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function cqssc_randomOne(){
	cqssc_qingkongAll();
	if(cqssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["cqssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["cqssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["cqssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["cqssc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["cqssc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line2"], function(k, v){
			$("#" + "cqssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line3"], function(k, v){
			$("#" + "cqssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line4"], function(k, v){
			$("#" + "cqssc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line5"], function(k, v){
			$("#" + "cqssc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["cqssc"]["line1"].push(number+"");
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["cqssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["cqssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["cqssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["cqssc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line2"], function(k, v){
			$("#" + "cqssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line3"], function(k, v){
			$("#" + "cqssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line4"], function(k, v){
			$("#" + "cqssc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(cqssc_playMethod == 37 || cqssc_playMethod == 26 || cqssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["cqssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["cqssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["cqssc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line2"], function(k, v){
			$("#" + "cqssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line3"], function(k, v){
			$("#" + "cqssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 41 || cqssc_playMethod == 30 || cqssc_playMethod == 19 || cqssc_playMethod == 68
		|| cqssc_playMethod == 52 || cqssc_playMethod == 64 || cqssc_playMethod == 66
		|| cqssc_playMethod == 59 || cqssc_playMethod == 70 || cqssc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["cqssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 42 || cqssc_playMethod == 31 || cqssc_playMethod == 20 || cqssc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["cqssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 39 || cqssc_playMethod == 28 || cqssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["cqssc"]["line1"].push(number+'');
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 43 || cqssc_playMethod == 32 || cqssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["cqssc"]["line1"].push(number+'');
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 48 || cqssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["cqssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["cqssc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line2"], function(k, v){
			$("#" + "cqssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 25 || cqssc_playMethod == 36 || cqssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["cqssc"]["line1"].push(number+"");
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 50 || cqssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["cqssc"]["line1"].push(number+"");
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 53 || cqssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["cqssc"]["line1"].push(number+"");
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["cqssc"]["line"+line].push(number+"");
		$.each(LotteryStorage["cqssc"]["line"+line], function(k, v){
			$("#" + "cqssc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 63 || cqssc_playMethod == 67 || cqssc_playMethod == 69 || cqssc_playMethod == 71 || cqssc_playType == 13
		|| cqssc_playMethod == 65 || cqssc_playMethod == 18 || cqssc_playMethod == 29 || cqssc_playMethod == 40 || cqssc_playMethod == 22
		|| cqssc_playMethod == 33 || cqssc_playMethod == 44 || cqssc_playMethod == 54 || cqssc_playMethod == 61
		|| cqssc_playMethod == 24 || cqssc_playMethod == 35 || cqssc_playMethod == 46 || cqssc_playMethod == 51 || cqssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["cqssc"]["line1"].push(number+'');
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 74 || cqssc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["cqssc"]["line1"].push(array[0]+"");
		LotteryStorage["cqssc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line2"], function(k, v){
			$("#" + "cqssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 75 || cqssc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["cqssc"]["line1"].push(array[0]+"");
		LotteryStorage["cqssc"]["line2"].push(array[1]+"");
		LotteryStorage["cqssc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line2"], function(k, v){
			$("#" + "cqssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line3"], function(k, v){
			$("#" + "cqssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["cqssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["cqssc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["cqssc"]["line"+lines[0]], function(k, v){
			$("#" + "cqssc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line"+lines[1]], function(k, v){
			$("#" + "cqssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["cqssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["cqssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["cqssc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["cqssc"]["line"+lines[0]], function(k, v){
			$("#" + "cqssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line"+lines[1]], function(k, v){
			$("#" + "cqssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line"+lines[0]], function(k, v){
			$("#" + "cqssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["cqssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["cqssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["cqssc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["cqssc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["cqssc"]["line"+lines[0]], function(k, v){
			$("#" + "cqssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line"+lines[1]], function(k, v){
			$("#" + "cqssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line"+lines[2]], function(k, v){
			$("#" + "cqssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["cqssc"]["line"+lines[3]], function(k, v){
			$("#" + "cqssc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(cqssc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["cqssc"]["line1"].push(number+"");
		$.each(LotteryStorage["cqssc"]["line1"], function(k, v){
			$("#" + "cqssc_line1" + v).toggleClass("redBalls_active");
		});
	}
	cqssc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function cqssc_checkOutRandom(playMethod){
	var obj = new Object();
	if(cqssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(cqssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(cqssc_playMethod == 18 || cqssc_playMethod == 29 || cqssc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(cqssc_playMethod == 22 || cqssc_playMethod == 33 || cqssc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(cqssc_playMethod == 54 || cqssc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(cqssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(cqssc_playMethod == 37 || cqssc_playMethod == 26 || cqssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(cqssc_playMethod == 39 || cqssc_playMethod == 28 || cqssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(cqssc_playMethod == 41 || cqssc_playMethod == 30 || cqssc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(cqssc_playMethod == 52 || cqssc_playMethod == 59 || cqssc_playMethod == 64 || cqssc_playMethod == 66 || cqssc_playMethod == 68
		||cqssc_playMethod == 70 || cqssc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(cqssc_playMethod == 42 || cqssc_playMethod == 31 || cqssc_playMethod == 20 || cqssc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(cqssc_playMethod == 43 || cqssc_playMethod == 32 || cqssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(cqssc_playMethod == 48 || cqssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(cqssc_playMethod == 50 || cqssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(cqssc_playMethod == 53 || cqssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(cqssc_playMethod == 62){
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
	}else if(cqssc_playMethod == 63 || cqssc_playMethod == 65 || cqssc_playMethod == 67 || cqssc_playMethod == 69 || cqssc_playMethod == 71
		|| cqssc_playMethod == 24 || cqssc_playMethod == 35 || cqssc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(cqssc_playMethod == 25 || cqssc_playMethod == 36 || cqssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(cqssc_playMethod == 51 || cqssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(cqssc_playMethod == 74 || cqssc_playMethod == 76){
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
	}else if(cqssc_playMethod == 75 || cqssc_playMethod == 77){
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
	}else if(cqssc_playMethod == 78){
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
	}else if(cqssc_playMethod == 84){
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
	}else if(cqssc_playMethod == 93){
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
	obj.sntuo = cqssc_sntuo;
	obj.multiple = 1;
	obj.rebates = cqssc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('cqssc',cqssc_playMethod,obj);  //机选奖金计算
	obj.award = $('#cqssc_minAward').html();     //奖金
	obj.maxAward = $('#cqssc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [cqsscValidateData 单式数据验证]
 */
function cqsscValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#cqssc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	cqsscValidData(textStr,type);
}

function cqsscValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(cqssc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 38 || cqssc_playMethod == 27 || cqssc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 45 || cqssc_playMethod == 34 || cqssc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 49 || cqssc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,2);
        cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,2);
        cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,3);
        cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,3);
        cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,3);
        cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,3);
        cqsscShowFooter(true,notes);
    }else if(cqssc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#cqssc_tab .button.red").size() ,4);
        cqsscShowFooter(true,notes);
    }

	$('#cqssc_delRepeat').off('click');
	$('#cqssc_delRepeat').on('click',function () {
		content.str = $('#cqssc_single').val() ? $('#cqssc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		cqsscShowFooter(true,notes);
		$("#cqssc_single").val(array.join(" "));
	});

    $("#cqssc_single").val(array.join(" "));
    return notes;
}

function cqsscShowFooter(isValid,notes){
	$('#cqssc_zhushu').text(notes);
	if($("#cqssc_modeId").val() == "8"){
		$('#cqssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqssc_beiNum").val()),0.002));
	}else if ($("#cqssc_modeId").val() == "2"){
		$('#cqssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqssc_beiNum").val()),0.2));
	}else if ($("#cqssc_modeId").val() == "1"){
		$('#cqssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqssc_beiNum").val()),0.02));
	}else{
		$('#cqssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#cqssc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	cqssc_initFooterButton();
	calcAwardWin('cqssc',cqssc_playMethod);  //计算奖金和盈利
}