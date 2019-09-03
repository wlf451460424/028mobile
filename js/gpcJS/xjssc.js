var xjssc_playType = 2;
var xjssc_playMethod = 15;
var xjssc_sntuo = 0;
var xjssc_rebate;
var xjsscScroll;

//进入这个页面时调用
function xjsscPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("xjssc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("xjssc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function xjsscPageUnloadedPanel(){
	$("#xjssc_queding").off('click');
	$("#xjsscPage_back").off('click');
	$("#xjssc_ballView").empty();
	$("#xjsscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="xjsscPlaySelect"></select>');
	$("#xjsscSelect").append($select);
}

//入口函数
function xjssc_init(){
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
	$("#xjssc_title").html(LotteryInfo.getLotteryNameByTag("xjssc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
        if(i == 15){//去掉骰宝龙虎
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == xjssc_playType && j == xjssc_playMethod){
					$play.append('<option value="xjssc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="xjssc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(xjssc_playMethod,onShowArray)>-1 ){
						xjssc_playType = i;
						xjssc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#xjsscPlaySelect").append($play);
		}
	}
	
	if($("#xjsscPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("xjsscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:xjsscChangeItem
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

	GetLotteryInfo("xjssc",function (){
		xjsscChangeItem("xjssc"+xjssc_playMethod);
	});

	//添加滑动条
	if(!xjsscScroll){
		xjsscScroll = new IScroll('#xjsscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("xjssc",LotteryInfo.getLotteryIdByTag("xjssc"));

	//获取上一期开奖
	queryLastPrize("xjssc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('xjssc');

	//机选选号
	$("#xjssc_random").off('click');
	$("#xjssc_random").on('click', function(event) {
		xjssc_randomOne();
	});

	//返回
	$("#xjsscPage_back").on('click', function(event) {
		// xjssc_playType = 2;
		// xjssc_playMethod = 15;
		$("#xjssc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		xjssc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#xjssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",xjssc_playMethod));
	//玩法说明
	$("#xjssc_paly_shuoming").off('click');
	$("#xjssc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#xjssc_shuoming").text());
	});

	qingKong("xjssc");//清空
	xjssc_submitData();
}

function xjsscResetPlayType(){
	xjssc_playType = 2;
	xjssc_playMethod = 15;
}

function xjsscChangeItem(val) {
	xjssc_qingkongAll();
	var temp = val.substring("xjssc".length,val.length);
	if(val == "xjssc0"){
		//直选复式
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 0;
		xjssc_playMethod = 0;
		createFiveLineLayout("xjssc", function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc1"){
		//直选单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 0;
		xjssc_playMethod = 1;
		$("#xjssc_ballView").empty();
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc2"){
		//组选120
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 0;
		xjssc_playMethod = 2;
		createOneLineLayout("xjssc","至少选择5个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc3"){
		//组选60
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 0;
		xjssc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc4"){
		//组选30
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 0;
		xjssc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc5"){
		//组选20
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 0;
		xjssc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc6"){
		//组选10
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 0;
		xjssc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc7"){
		//组选5
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 0;
		xjssc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc8"){
		//总和大小单双
		$("#xjssc_random").show();
		var num = ["大","小","单","双"];
		xjssc_sntuo = 0;
		xjssc_playType = 0;
		xjssc_playMethod = 8;
		createNonNumLayout("xjssc",xjssc_playMethod,num,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc9"){
		//直选复式
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 1;
		xjssc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("xjssc",tips, function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc10"){
		//直选单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 1;
		xjssc_playMethod = 10;
		$("#xjssc_ballView").empty();
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc11"){
		//组选24
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 1;
		xjssc_playMethod = 11;
		createOneLineLayout("xjssc","至少选择4个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc12"){
		//组选12
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 1;
		xjssc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc13"){
		//组选6
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 1;
		xjssc_playMethod = 13;
		createOneLineLayout("xjssc","二重号:至少选择2个号码",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc14"){
		//组选4
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 1;
		xjssc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc15"){
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc16"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 2;
		xjssc_playMethod = 16;
		$("#xjssc_ballView").empty();
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc17"){
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 17;
		createSumLayout("xjssc",0,27,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc18"){
		//直选跨度
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 18;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc19"){
		//后三组三
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 19;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc20"){
		//后三组六
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 20;
		createOneLineLayout("xjssc","至少选择3个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc21"){
		//后三和值
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 21;
		createSumLayout("xjssc",1,26,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc22"){
		//后三组选包胆
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 22;
		xjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjssc",array,["请选择一个号码"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc23"){
		//后三混合组选
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 2;
		xjssc_playMethod = 23;
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc24"){
		//和值尾数
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 24;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc25"){
		//特殊号
		$("#xjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		xjssc_sntuo = 0;
		xjssc_playType = 2;
		xjssc_playMethod = 25;
		createNonNumLayout("xjssc",xjssc_playMethod,num,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc26"){
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc27"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 3;
		xjssc_playMethod = 27;
		$("#xjssc_ballView").empty();
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc28"){
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 28;
		createSumLayout("xjssc",0,27,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc29"){
		//直选跨度
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 29;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc30"){
		//中三组三
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 30;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc31"){
		//中三组六
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 31;
		createOneLineLayout("xjssc","至少选择3个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc32"){
		//中三和值
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 32;
		createSumLayout("xjssc",1,26,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc33"){
		//中三组选包胆
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 33;
		xjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjssc",array,["请选择一个号码"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc34"){
		//中三混合组选
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 3;
		xjssc_playMethod = 34;
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc35"){
		//和值尾数
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 35;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc36"){
		//特殊号
		$("#xjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		xjssc_sntuo = 0;
		xjssc_playType = 3;
		xjssc_playMethod = 36;
		createNonNumLayout("xjssc",xjssc_playMethod,num,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc37"){
		//直选复式
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc38"){
		//直选单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 4;
		xjssc_playMethod = 38;
		$("#xjssc_ballView").empty();
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc39"){
		//和值
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 39;
		createSumLayout("xjssc",0,27,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc40"){
		//直选跨度
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 40;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc41"){
		//前三组三
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 41;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc42"){
		//前三组六
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 42;
		createOneLineLayout("xjssc","至少选择3个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc43"){
		//前三和值
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 43;
		createSumLayout("xjssc",1,26,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc44"){
		//前三组选包胆
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 44;
		xjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjssc",array,["请选择一个号码"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc45"){
		//前三混合组选
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 4;
		xjssc_playMethod = 45;
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc46"){
		//和值尾数
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 46;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc47"){
		//特殊号
		$("#xjssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		xjssc_sntuo = 0;
		xjssc_playType = 4;
		xjssc_playMethod = 47;
		createNonNumLayout("xjssc",xjssc_playMethod,num,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc48"){
		//后二复式
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 5;
		xjssc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc49"){
		//后二单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 5;
		xjssc_playMethod = 49;
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc50"){
		//后二和值
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 5;
		xjssc_playMethod = 50;
		createSumLayout("xjssc",0,18,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc51"){
		//直选跨度
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 5;
		xjssc_playMethod = 51;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc52"){
		//后二组选
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 5;
		xjssc_playMethod = 52;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc53"){
		//后二和值
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 5;
		xjssc_playMethod = 53;
		createSumLayout("xjssc",1,17,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc54"){
		//后二组选包胆
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 5;
		xjssc_playMethod = 54;
		xjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjssc",array,["请选择一个号码"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc55"){
		//前二复式
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 6;
		xjssc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc56"){
		//前二单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 6;
		xjssc_playMethod = 56;
		xjssc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
	}else if(val == "xjssc57"){
		//前二和值
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 6;
		xjssc_playMethod = 57;
		createSumLayout("xjssc",0,18,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc58"){
		//直选跨度
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 6;
		xjssc_playMethod = 58;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc59"){
		//前二组选
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 6;
		xjssc_playMethod = 59;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc60"){
		//前二和值
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 6;
		xjssc_playMethod = 60;
		createSumLayout("xjssc",1,17,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc61"){
		//前二组选包胆
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 6;
		xjssc_playMethod = 61;
		xjssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjssc",array,["请选择一个号码"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc62"){
		//定位复式
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 7;
		xjssc_playMethod = 62;
		createFiveLineLayout("xjssc", function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc63"){
		//后三一码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 63;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc64"){
		//后三二码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 64;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc65"){
		//前三一码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 65;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc66"){
		//前三二码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 66;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc67"){
		//后四一码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 67;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc68"){
		//后四二码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 68;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc69"){
		//前四一码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 69;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc70"){
		//前四二码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 70;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc71"){
		//五星一码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 71;
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc72"){
		//五星二码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 72;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc73"){
		//五星三码
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 8;
		xjssc_playMethod = 73;
		createOneLineLayout("xjssc","至少选择3个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc74"){
		//后二大小单双
		xjssc_qingkongAll();
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 9;
		xjssc_playMethod = 74;
		createTextBallTwoLayout("xjssc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc75"){
		//后三大小单双
		xjssc_qingkongAll();
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 9;
		xjssc_playMethod = 75;
		createTextBallThreeLayout("xjssc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc76"){
		//前二大小单双
		xjssc_qingkongAll();
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 9;
		xjssc_playMethod = 76;
		createTextBallTwoLayout("xjssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc77"){
		//前三大小单双
		xjssc_qingkongAll();
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 9;
		xjssc_playMethod = 77;
		createTextBallThreeLayout("xjssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc78"){
		//直选复式
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 10;
		xjssc_playMethod = 78;
		createFiveLineLayout("xjssc",function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc79"){
		//直选单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 10;
		xjssc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
		createRenXuanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc80"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 10;
		xjssc_playMethod = 80;
		createSumLayout("xjssc",0,18,function(){
			xjssc_calcNotes();
		});
		createRenXuanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc81"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 10;
		xjssc_playMethod = 81;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		createRenXuanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc82"){
		//组选单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 10;
		xjssc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
		createRenXuanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc83"){
		//组选和值
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 10;
		xjssc_playMethod = 83;
		createSumLayout("xjssc",1,17,function(){
			xjssc_calcNotes();
		});
		createRenXuanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc84"){
		//直选复式
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 11;
		xjssc_playMethod = 84;
		createFiveLineLayout("xjssc", function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc85"){
		//直选单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 11;
		xjssc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
		createRenXuanSanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc86"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 11;
		xjssc_playMethod = 86;
		createSumLayout("xjssc",0,27,function(){
			xjssc_calcNotes();
		});
		createRenXuanSanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc87"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 11;
		xjssc_playMethod = 87;
		createOneLineLayout("xjssc","至少选择2个",0,9,false,function(){
			xjssc_calcNotes();
		});
		createRenXuanSanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc88"){
		//组选单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 11;
		xjssc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
		createRenXuanSanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc89"){
		//组选和值
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 11;
		xjssc_playMethod = 89;
		createOneLineLayout("xjssc","至少选择3个",0,9,false,function(){
			xjssc_calcNotes();
		});
		createRenXuanSanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc90"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 11;
		xjssc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
		createRenXuanSanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc91"){
		//混合组选
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 11;
		xjssc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
		createRenXuanSanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc92"){
		//组选和值
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 11;
		xjssc_playMethod = 92;
		createSumLayout("xjssc",1,26,function(){
			xjssc_calcNotes();
		});
		createRenXuanSanLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc93"){
		$("#xjssc_random").show();
		xjssc_sntuo = 0;
		xjssc_playType = 12;
		xjssc_playMethod = 93;
		createFiveLineLayout("xjssc", function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc94"){
		//直选单式
		$("#xjssc_random").hide();
		xjssc_sntuo = 3;
		xjssc_playType = 12;
		xjssc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjssc",tips);
		createRenXuanSiLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc95"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 12;
		xjssc_playMethod = 95;
		createOneLineLayout("xjssc","至少选择4个",0,9,false,function(){
			xjssc_calcNotes();
		});
		createRenXuanSiLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc96"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 12;
		xjssc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		createRenXuanSiLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc97"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 12;
		xjssc_playMethod = 97;
		$("#xjssc_ballView").empty();
		createOneLineLayout("xjssc","二重号:至少选择2个号码",0,9,false,function(){
			xjssc_calcNotes();
		});
		createRenXuanSiLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc98"){
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 12;
		xjssc_playMethod = 98;
		$("#xjssc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("xjssc",tips,0,9,false,function(){
			xjssc_calcNotes();
		});
		createRenXuanSiLayout("xjssc",xjssc_playMethod,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc99"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 13;
		xjssc_playMethod = 99;
		$("#xjssc_ballView").empty();
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc100"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 13;
		xjssc_playMethod = 100;
		$("#xjssc_ballView").empty();
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc101"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 13;
		xjssc_playMethod = 101;
		$("#xjssc_ballView").empty();
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc102"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 13;
		xjssc_playMethod = 102;
		$("#xjssc_ballView").empty();
		createOneLineLayout("xjssc","至少选择1个",0,9,false,function(){
			xjssc_calcNotes();
		});
		xjssc_qingkongAll();
	}else if(val == "xjssc103"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 103;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc104"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 104;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc105"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 105;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc106"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 106;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc107"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 107;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc108"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 108;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc109"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 109;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc110"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 110;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc111"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 111;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}else if(val == "xjssc112"){
		xjssc_qingkongAll();
		$("#xjssc_random").hide();
		xjssc_sntuo = 0;
		xjssc_playType = 14;
		xjssc_playMethod = 112;
		createTextBallOneLayout("xjssc",["龙","虎","和"],["至少选择一个"],function(){
			xjssc_calcNotes();
		});
	}

	if(xjsscScroll){
		xjsscScroll.refresh();
		xjsscScroll.scrollTo(0,0,1);
	}
	
	$("#xjssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("xjssc",temp);
	hideRandomWhenLi("xjssc",xjssc_sntuo,xjssc_playMethod);
	xjssc_calcNotes();
}
/**
 * [xjssc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function xjssc_initFooterButton(){
	if(xjssc_playMethod == 0 || xjssc_playMethod == 62 || xjssc_playMethod == 78
		|| xjssc_playMethod == 84 || xjssc_playMethod == 93 || xjssc_playType == 7){
		if(LotteryStorage["xjssc"]["line1"].length > 0 || LotteryStorage["xjssc"]["line2"].length > 0 ||
			LotteryStorage["xjssc"]["line3"].length > 0 || LotteryStorage["xjssc"]["line4"].length > 0 ||
			LotteryStorage["xjssc"]["line5"].length > 0){
			$("#xjssc_qingkong").css("opacity",1.0);
		}else{
			$("#xjssc_qingkong").css("opacity",0.4);
		}
	}else if(xjssc_playMethod == 9){
		if(LotteryStorage["xjssc"]["line1"].length > 0 || LotteryStorage["xjssc"]["line2"].length > 0 ||
			LotteryStorage["xjssc"]["line3"].length > 0 || LotteryStorage["xjssc"]["line4"].length > 0 ){
			$("#xjssc_qingkong").css("opacity",1.0);
		}else{
			$("#xjssc_qingkong").css("opacity",0.4);
		}
	}else if(xjssc_playMethod == 37 || xjssc_playMethod == 4 || xjssc_playMethod == 6
		|| xjssc_playMethod == 26 || xjssc_playMethod == 15 || xjssc_playMethod == 75 || xjssc_playMethod == 77){
		if(LotteryStorage["xjssc"]["line1"].length > 0 || LotteryStorage["xjssc"]["line2"].length > 0
			|| LotteryStorage["xjssc"]["line3"].length > 0){
			$("#xjssc_qingkong").css("opacity",1.0);
		}else{
			$("#xjssc_qingkong").css("opacity",0.4);
		}
	}else if(xjssc_playMethod == 3 || xjssc_playMethod == 4 || xjssc_playMethod == 5
		|| xjssc_playMethod == 6 || xjssc_playMethod == 7 || xjssc_playMethod == 12
		|| xjssc_playMethod == 14 || xjssc_playMethod == 48 || xjssc_playMethod == 55
		|| xjssc_playMethod == 74 || xjssc_playMethod == 76 || xjssc_playMethod == 96 || xjssc_playMethod == 98){
		if(LotteryStorage["xjssc"]["line1"].length > 0 || LotteryStorage["xjssc"]["line2"].length > 0){
			$("#xjssc_qingkong").css("opacity",1.0);
		}else{
			$("#xjssc_qingkong").css("opacity",0.4);
		}
	}else if(xjssc_playMethod == 2 || xjssc_playMethod == 8 || xjssc_playMethod == 11 || xjssc_playMethod == 13 || xjssc_playMethod == 39
		|| xjssc_playMethod == 28 || xjssc_playMethod == 17 || xjssc_playMethod == 18 || xjssc_playMethod == 24 || xjssc_playMethod == 41
		|| xjssc_playMethod == 25 || xjssc_playMethod == 29 || xjssc_playMethod == 42 || xjssc_playMethod == 43 || xjssc_playMethod == 30
		|| xjssc_playMethod == 35 || xjssc_playMethod == 36 || xjssc_playMethod == 31 || xjssc_playMethod == 32 || xjssc_playMethod == 19
		|| xjssc_playMethod == 40 || xjssc_playMethod == 46 || xjssc_playMethod == 20 || xjssc_playMethod == 21 || xjssc_playMethod == 50
		|| xjssc_playMethod == 47 || xjssc_playMethod == 51 || xjssc_playMethod == 52 || xjssc_playMethod == 53 || xjssc_playMethod == 57 || xjssc_playMethod == 63
		|| xjssc_playMethod == 58 || xjssc_playMethod == 59 || xjssc_playMethod == 60 || xjssc_playMethod == 65 || xjssc_playMethod == 80 || xjssc_playMethod == 81 || xjssc_playType == 8
		|| xjssc_playMethod == 83 || xjssc_playMethod == 86 || xjssc_playMethod == 87 || xjssc_playMethod == 22 || xjssc_playMethod == 33 || xjssc_playMethod == 44
		|| xjssc_playMethod == 89 || xjssc_playMethod == 92 || xjssc_playMethod == 95 || xjssc_playMethod == 54 || xjssc_playMethod == 61
		|| xjssc_playMethod == 97 || xjssc_playType == 13  || xjssc_playType == 14){
		if(LotteryStorage["xjssc"]["line1"].length > 0){
			$("#xjssc_qingkong").css("opacity",1.0);
		}else{
			$("#xjssc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#xjssc_qingkong").css("opacity",0);
	}

	if($("#xjssc_qingkong").css("opacity") == "0"){
		$("#xjssc_qingkong").css("display","none");
	}else{
		$("#xjssc_qingkong").css("display","block");
	}

	if($('#xjssc_zhushu').html() > 0){
		$("#xjssc_queding").css("opacity",1.0);
	}else{
		$("#xjssc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  xjssc_qingkongAll(){
	$("#xjssc_ballView span").removeClass('redBalls_active');
	LotteryStorage["xjssc"]["line1"] = [];
	LotteryStorage["xjssc"]["line2"] = [];
	LotteryStorage["xjssc"]["line3"] = [];
	LotteryStorage["xjssc"]["line4"] = [];
	LotteryStorage["xjssc"]["line5"] = [];

	localStorageUtils.removeParam("xjssc_line1");
	localStorageUtils.removeParam("xjssc_line2");
	localStorageUtils.removeParam("xjssc_line3");
	localStorageUtils.removeParam("xjssc_line4");
	localStorageUtils.removeParam("xjssc_line5");

	$('#xjssc_zhushu').text(0);
	$('#xjssc_money').text(0);
	clearAwardWin("xjssc");
	xjssc_initFooterButton();
}

/**
 * [xjssc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function xjssc_calcNotes(){
	$('#xjssc_modeId').blur();
	$('#xjssc_fandian').blur();
	
	var notes = 0;

	if(xjssc_playMethod == 0){
		notes = LotteryStorage["xjssc"]["line1"].length *
			LotteryStorage["xjssc"]["line2"].length *
			LotteryStorage["xjssc"]["line3"].length *
			LotteryStorage["xjssc"]["line4"].length *
			LotteryStorage["xjssc"]["line5"].length;
	}else if(xjssc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,5);
	}else if(xjssc_playMethod == 3){
		if (LotteryStorage["xjssc"]["line1"].length >= 1 && LotteryStorage["xjssc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["xjssc"]["line1"],LotteryStorage["xjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(xjssc_playMethod == 4){
		if (LotteryStorage["xjssc"]["line1"].length >= 2 && LotteryStorage["xjssc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["xjssc"]["line2"],LotteryStorage["xjssc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(xjssc_playMethod == 5 || xjssc_playMethod == 12){
		if (LotteryStorage["xjssc"]["line1"].length >= 1 && LotteryStorage["xjssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["xjssc"]["line1"],LotteryStorage["xjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(xjssc_playMethod == 6 || xjssc_playMethod == 7 || xjssc_playMethod == 14){
		if (LotteryStorage["xjssc"]["line1"].length >= 1 && LotteryStorage["xjssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["xjssc"]["line1"],LotteryStorage["xjssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(xjssc_playMethod == 9){
		notes = LotteryStorage["xjssc"]["line1"].length *
			LotteryStorage["xjssc"]["line2"].length *
			LotteryStorage["xjssc"]["line3"].length *
			LotteryStorage["xjssc"]["line4"].length;
	}else if(xjssc_playMethod == 18 || xjssc_playMethod == 29 || xjssc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["xjssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(xjssc_playMethod == 22 || xjssc_playMethod == 33 || xjssc_playMethod == 44 ){
		notes = 54;
	}else if(xjssc_playMethod == 54 || xjssc_playMethod == 61){
		notes = 9;
	}else if(xjssc_playMethod == 51 || xjssc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["xjssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(xjssc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,4);
	}else if(xjssc_playMethod == 13|| xjssc_playMethod == 64 || xjssc_playMethod == 66 || xjssc_playMethod == 68 || xjssc_playMethod == 70 || xjssc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,2);
	}else if(xjssc_playMethod == 37 || xjssc_playMethod == 26 || xjssc_playMethod == 15 || xjssc_playMethod == 75 || xjssc_playMethod == 77){
		notes = LotteryStorage["xjssc"]["line1"].length *
			LotteryStorage["xjssc"]["line2"].length *
			LotteryStorage["xjssc"]["line3"].length ;
	}else if(xjssc_playMethod == 39 || xjssc_playMethod == 28 || xjssc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["xjssc"]["line1"][i]);
		};
	}else if(xjssc_playMethod == 41 || xjssc_playMethod == 30 || xjssc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["xjssc"]["line1"].length,2);
	}else if(xjssc_playMethod == 42 || xjssc_playMethod == 31 || xjssc_playMethod == 20 || xjssc_playMethod == 68 || xjssc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,3);
	}else if(xjssc_playMethod == 43 || xjssc_playMethod == 32 || xjssc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["xjssc"]["line1"][i]);
		};
	}else if(xjssc_playMethod == 48 || xjssc_playMethod == 55 || xjssc_playMethod == 74 || xjssc_playMethod == 76){
		notes = LotteryStorage["xjssc"]["line1"].length *
			LotteryStorage["xjssc"]["line2"].length ;
	}else if(xjssc_playMethod == 50 || xjssc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["xjssc"]["line1"][i]);
		};
	}else if(xjssc_playMethod == 52 || xjssc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,2);
	}else if(xjssc_playMethod == 53 || xjssc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["xjssc"]["line1"][i]);
		};
	}else if(xjssc_playMethod == 62){
		notes = LotteryStorage["xjssc"]["line1"].length +
			LotteryStorage["xjssc"]["line2"].length +
			LotteryStorage["xjssc"]["line3"].length +
			LotteryStorage["xjssc"]["line4"].length +
			LotteryStorage["xjssc"]["line5"].length;
	}else if(xjssc_playType == 13 || xjssc_playType == 14 || xjssc_playMethod == 8 || xjssc_playMethod == 71
		|| xjssc_playMethod == 24 || xjssc_playMethod == 25 || xjssc_playMethod == 35 || xjssc_playMethod == 36 || xjssc_playMethod == 46
		|| xjssc_playMethod == 47 || xjssc_playMethod == 63 || xjssc_playMethod == 65 || xjssc_playMethod == 67 || xjssc_playMethod == 69 ){
		notes = LotteryStorage["xjssc"]["line1"].length ;
	}else if(xjssc_playMethod == 78){
		notes = LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line2"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line3"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line4"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line3"].length +
			LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line4"].length +
			LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line4"].length +
			LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line4"].length * LotteryStorage["xjssc"]["line5"].length;
	}else if (xjssc_playMethod == 80) {
		if ($("#xjssc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["xjssc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,2);
		}
	}else if (xjssc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,2) * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,2);
	}else if (xjssc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["xjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,2);
	}else if (xjssc_playMethod == 84) {
		notes = LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line3"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line4"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line4"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line4"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line4"].length +
			LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line4"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line4"].length * LotteryStorage["xjssc"]["line5"].length ;
	}else if (xjssc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["xjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,3);
	}else if (xjssc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["xjssc"]["line1"].length,2) * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,3);
	}else if (xjssc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,3) * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,3);
	}else if (xjssc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["xjssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["xjssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,3);
	}else if (xjssc_playMethod == 93) {
		notes = LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line4"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line4"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line1"].length * LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line4"].length * LotteryStorage["xjssc"]["line5"].length +
			LotteryStorage["xjssc"]["line2"].length * LotteryStorage["xjssc"]["line3"].length * LotteryStorage["xjssc"]["line4"].length * LotteryStorage["xjssc"]["line5"].length;
	}else if (xjssc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,4)
			* mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,4);
	}else if (xjssc_playMethod == 96) {
		if (LotteryStorage["xjssc"]["line1"].length >= 1 && LotteryStorage["xjssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["xjssc"]["line1"],LotteryStorage["xjssc"]["line2"])
				* mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (xjssc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["xjssc"]["line1"].length,2) * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,4);
	}else if (xjssc_playMethod == 98) {
		if (LotteryStorage["xjssc"]["line1"].length >= 1 && LotteryStorage["xjssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["xjssc"]["line1"],LotteryStorage["xjssc"]["line2"]) * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = xjsscValidData($("#xjssc_single").val());
	}

	if(xjssc_sntuo == 3 || xjssc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","xjssc"),LotteryInfo.getMethodId("ssc",xjssc_playMethod))){
	}else{
		if(parseInt($('#xjssc_modeId').val()) == 8){
			$("#xjssc_random").hide();
		}else{
			$("#xjssc_random").show();
		}
	}

	//验证是否为空
	if( $("#xjssc_beiNum").val() =="" || parseInt($("#xjssc_beiNum").val()) == 0){
		$("#xjssc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#xjssc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#xjssc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#xjssc_zhushu').text(notes);
		if($("#xjssc_modeId").val() == "8"){
			$('#xjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjssc_beiNum").val()),0.002));
		}else if ($("#xjssc_modeId").val() == "2"){
			$('#xjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjssc_beiNum").val()),0.2));
		}else if ($("#xjssc_modeId").val() == "1"){
			$('#xjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjssc_beiNum").val()),0.02));
		}else{
			$('#xjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjssc_beiNum").val()),2));
		}
	} else {
		$('#xjssc_zhushu').text(0);
		$('#xjssc_money').text(0);
	}
	xjssc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('xjssc',xjssc_playMethod);
}

/**
 * [xjssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function xjssc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#xjssc_queding").bind('click', function(event) {

		xjssc_rebate = $("#xjssc_fandian option:last").val();
		if(parseInt($('#xjssc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		xjssc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#xjssc_modeId').val()) == 8){
			if (Number($('#xjssc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('xjssc',xjssc_playMethod);

		submitParams.lotteryType = "xjssc";
		var play = LotteryInfo.getPlayName("ssc",xjssc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",xjssc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = xjssc_playType;
		submitParams.playMethodIndex = xjssc_playMethod;
		var selectedBalls = [];
		if(xjssc_playMethod == 0 || xjssc_playMethod == 3 || xjssc_playMethod == 4
			|| xjssc_playMethod == 5 || xjssc_playMethod == 6 || xjssc_playMethod == 7
			|| xjssc_playMethod == 9 || xjssc_playMethod == 12 || xjssc_playMethod == 14
			|| xjssc_playMethod == 37 || xjssc_playMethod == 26 || xjssc_playMethod == 15
			|| xjssc_playMethod == 48 || xjssc_playMethod == 55 || xjssc_playMethod == 74 || xjssc_playType == 9){
			$("#xjssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(xjssc_playMethod == 2 || xjssc_playMethod == 8 || xjssc_playMethod == 11 || xjssc_playMethod == 13 || xjssc_playMethod == 24
			|| xjssc_playMethod == 39 || xjssc_playMethod == 28 || xjssc_playMethod == 17 || xjssc_playMethod == 18 || xjssc_playMethod == 25
			|| xjssc_playMethod == 22 || xjssc_playMethod == 33 || xjssc_playMethod == 44 || xjssc_playMethod == 54 || xjssc_playMethod == 61
			|| xjssc_playMethod == 41 || xjssc_playMethod == 42 || xjssc_playMethod == 43 || xjssc_playMethod == 29 || xjssc_playMethod == 35
			|| xjssc_playMethod == 30 || xjssc_playMethod == 31 || xjssc_playMethod == 32 || xjssc_playMethod == 40 || xjssc_playMethod == 36
			|| xjssc_playMethod == 19 || xjssc_playMethod == 20 || xjssc_playMethod == 21 || xjssc_playMethod == 46 || xjssc_playMethod == 47
			|| xjssc_playMethod == 50 || xjssc_playMethod == 57 || xjssc_playType == 8 || xjssc_playMethod == 51 || xjssc_playMethod == 58
			|| xjssc_playMethod == 52 || xjssc_playMethod == 53|| xjssc_playMethod == 59 || xjssc_playMethod == 60 || xjssc_playType == 13 || xjssc_playType == 14){
			$("#xjssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(xjssc_playType == 7 || xjssc_playMethod == 78 || xjssc_playMethod == 84 || xjssc_playMethod == 93){
			$("#xjssc_ballView div.ballView").each(function(){
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
		}else if(xjssc_playMethod == 80 || xjssc_playMethod == 81 || xjssc_playMethod == 83
			|| xjssc_playMethod == 86 || xjssc_playMethod == 87 || xjssc_playMethod == 89
			|| xjssc_playMethod == 92 || xjssc_playMethod == 95 || xjssc_playMethod == 97){
			$("#xjssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#xjssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#xjssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#xjssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#xjssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#xjssc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (xjssc_playMethod == 96 || xjssc_playMethod == 98) {
			$("#xjssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#xjssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#xjssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#xjssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#xjssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#xjssc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			xjsscValidateData("submit");
			var array = handleSingleStr($("#xjssc_single").val());
			if(xjssc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(xjssc_playMethod == 10 || xjssc_playMethod == 38 || xjssc_playMethod == 27
				|| xjssc_playMethod == 16 || xjssc_playMethod == 49 || xjssc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(xjssc_playMethod == 45 || xjssc_playMethod == 34 || xjssc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(xjssc_playMethod == 79 || xjssc_playMethod == 82 || xjssc_playMethod == 85 || xjssc_playMethod == 88 ||
				xjssc_playMethod == 89 || xjssc_playMethod == 90 || xjssc_playMethod == 91 || xjssc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#xjssc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#xjssc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#xjssc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#xjssc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#xjssc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#xjssc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#xjssc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#xjssc_fandian").val());
		submitParams.notes = $('#xjssc_zhushu').html();
		submitParams.sntuo = xjssc_sntuo;
		submitParams.multiple = $('#xjssc_beiNum').val();  //requirement
		submitParams.rebates = $('#xjssc_fandian').val();  //requirement
		submitParams.playMode = $('#xjssc_modeId').val();  //requirement
		submitParams.money = $('#xjssc_money').html();  //requirement
		submitParams.award = $('#xjssc_minAward').html();  //奖金
		submitParams.maxAward = $('#xjssc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#xjssc_ballView").empty();
		xjssc_qingkongAll();
	});
}

/**
 * [xjssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function xjssc_randomOne(){
	xjssc_qingkongAll();
	if(xjssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["xjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["xjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["xjssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["xjssc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["xjssc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line2"], function(k, v){
			$("#" + "xjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line3"], function(k, v){
			$("#" + "xjssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line4"], function(k, v){
			$("#" + "xjssc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line5"], function(k, v){
			$("#" + "xjssc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["xjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["xjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["xjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["xjssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["xjssc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line2"], function(k, v){
			$("#" + "xjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line3"], function(k, v){
			$("#" + "xjssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line4"], function(k, v){
			$("#" + "xjssc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(xjssc_playMethod == 37 || xjssc_playMethod == 26 || xjssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["xjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["xjssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["xjssc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line2"], function(k, v){
			$("#" + "xjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line3"], function(k, v){
			$("#" + "xjssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 41 || xjssc_playMethod == 30 || xjssc_playMethod == 19 || xjssc_playMethod == 68
		|| xjssc_playMethod == 52 || xjssc_playMethod == 64 || xjssc_playMethod == 66
		|| xjssc_playMethod == 59 || xjssc_playMethod == 70 || xjssc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["xjssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 42 || xjssc_playMethod == 31 || xjssc_playMethod == 20 || xjssc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["xjssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 39 || xjssc_playMethod == 28 || xjssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["xjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 43 || xjssc_playMethod == 32 || xjssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["xjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 48 || xjssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["xjssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["xjssc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line2"], function(k, v){
			$("#" + "xjssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 25 || xjssc_playMethod == 36 || xjssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["xjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 50 || xjssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["xjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 53 || xjssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["xjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["xjssc"]["line"+line].push(number+"");
		$.each(LotteryStorage["xjssc"]["line"+line], function(k, v){
			$("#" + "xjssc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 63 || xjssc_playMethod == 67 || xjssc_playMethod == 69 || xjssc_playMethod == 71 || xjssc_playType == 13
		|| xjssc_playMethod == 65 || xjssc_playMethod == 18 || xjssc_playMethod == 29 || xjssc_playMethod == 40 || xjssc_playMethod == 22
		|| xjssc_playMethod == 33 || xjssc_playMethod == 44 || xjssc_playMethod == 54 || xjssc_playMethod == 61
		|| xjssc_playMethod == 24 || xjssc_playMethod == 35 || xjssc_playMethod == 46 || xjssc_playMethod == 51 || xjssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["xjssc"]["line1"].push(number+'');
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 74 || xjssc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["xjssc"]["line1"].push(array[0]+"");
		LotteryStorage["xjssc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line2"], function(k, v){
			$("#" + "xjssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 75 || xjssc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["xjssc"]["line1"].push(array[0]+"");
		LotteryStorage["xjssc"]["line2"].push(array[1]+"");
		LotteryStorage["xjssc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line2"], function(k, v){
			$("#" + "xjssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line3"], function(k, v){
			$("#" + "xjssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["xjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["xjssc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["xjssc"]["line"+lines[0]], function(k, v){
			$("#" + "xjssc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line"+lines[1]], function(k, v){
			$("#" + "xjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["xjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["xjssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["xjssc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["xjssc"]["line"+lines[0]], function(k, v){
			$("#" + "xjssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line"+lines[1]], function(k, v){
			$("#" + "xjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line"+lines[0]], function(k, v){
			$("#" + "xjssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["xjssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["xjssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["xjssc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["xjssc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["xjssc"]["line"+lines[0]], function(k, v){
			$("#" + "xjssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line"+lines[1]], function(k, v){
			$("#" + "xjssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line"+lines[2]], function(k, v){
			$("#" + "xjssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjssc"]["line"+lines[3]], function(k, v){
			$("#" + "xjssc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(xjssc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["xjssc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjssc"]["line1"], function(k, v){
			$("#" + "xjssc_line1" + v).toggleClass("redBalls_active");
		});
	}
	xjssc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function xjssc_checkOutRandom(playMethod){
	var obj = new Object();
	if(xjssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(xjssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(xjssc_playMethod == 18 || xjssc_playMethod == 29 || xjssc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(xjssc_playMethod == 22 || xjssc_playMethod == 33 || xjssc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(xjssc_playMethod == 54 || xjssc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(xjssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(xjssc_playMethod == 37 || xjssc_playMethod == 26 || xjssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(xjssc_playMethod == 39 || xjssc_playMethod == 28 || xjssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(xjssc_playMethod == 41 || xjssc_playMethod == 30 || xjssc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(xjssc_playMethod == 52 || xjssc_playMethod == 59 || xjssc_playMethod == 64 || xjssc_playMethod == 66 || xjssc_playMethod == 68
		||xjssc_playMethod == 70 || xjssc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(xjssc_playMethod == 42 || xjssc_playMethod == 31 || xjssc_playMethod == 20 || xjssc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(xjssc_playMethod == 43 || xjssc_playMethod == 32 || xjssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(xjssc_playMethod == 48 || xjssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(xjssc_playMethod == 50 || xjssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(xjssc_playMethod == 53 || xjssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(xjssc_playMethod == 62){
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
	}else if(xjssc_playMethod == 63 || xjssc_playMethod == 65 || xjssc_playMethod == 67 || xjssc_playMethod == 69 || xjssc_playMethod == 71
		|| xjssc_playMethod == 24 || xjssc_playMethod == 35 || xjssc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(xjssc_playMethod == 25 || xjssc_playMethod == 36 || xjssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(xjssc_playMethod == 51 || xjssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(xjssc_playMethod == 74 || xjssc_playMethod == 76){
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
	}else if(xjssc_playMethod == 75 || xjssc_playMethod == 77){
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
	}else if(xjssc_playMethod == 78){
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
	}else if(xjssc_playMethod == 84){
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
	}else if(xjssc_playMethod == 93){
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
	obj.sntuo = xjssc_sntuo;
	obj.multiple = 1;
	obj.rebates = xjssc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('xjssc',xjssc_playMethod,obj);  //机选奖金计算
	obj.award = $('#xjssc_minAward').html();     //奖金
	obj.maxAward = $('#xjssc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [xjsscValidateData 单式数据验证]
 */
function xjsscValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#xjssc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	xjsscValidData(textStr,type);
}

function xjsscValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(xjssc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 38 || xjssc_playMethod == 27 || xjssc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 45 || xjssc_playMethod == 34 || xjssc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 49 || xjssc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,2);
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,2);
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,3);
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,3);
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,3);
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,3);
		xjsscShowFooter(true,notes);
	}else if(xjssc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjssc_tab .button.red").size() ,4);
		xjsscShowFooter(true,notes);
	}

	$('#xjssc_delRepeat').off('click');
	$('#xjssc_delRepeat').on('click',function () {
		content.str = $('#xjssc_single').val() ? $('#xjssc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		xjsscShowFooter(true,notes);
		$("#xjssc_single").val(array.join(" "));
	});

	$("#xjssc_single").val(array.join(" "));
	return notes;
}

function xjsscShowFooter(isValid,notes){
	$('#xjssc_zhushu').text(notes);
	if($("#xjssc_modeId").val() == "8"){
		$('#xjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjssc_beiNum").val()),0.002));
	}else if ($("#xjssc_modeId").val() == "2"){
		$('#xjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjssc_beiNum").val()),0.2));
	}else if ($("#xjssc_modeId").val() == "1"){
		$('#xjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjssc_beiNum").val()),0.02));
	}else{
		$('#xjssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjssc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	xjssc_initFooterButton();
	calcAwardWin('xjssc',xjssc_playMethod);  //计算奖金和盈利
}