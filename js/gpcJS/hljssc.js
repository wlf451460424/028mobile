var hljssc_playType = 2;
var hljssc_playMethod = 15;
var hljssc_sntuo = 0;
var hljssc_rebate;
var hljsscScroll;

//进入这个页面时调用
function hljsscPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hljssc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hljssc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hljsscPageUnloadedPanel(){
	$("#hljssc_queding").off('click');
	$("#hljsscPage_back").off('click');
	$("#hljssc_ballView").empty();
	$("#hljsscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hljsscPlaySelect"></select>');
	$("#hljsscSelect").append($select);
}

//入口函数
function hljssc_init(){
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
	$("#hljssc_title").html(LotteryInfo.getLotteryNameByTag("hljssc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == hljssc_playType && j == hljssc_playMethod){
					$play.append('<option value="hljssc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hljssc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hljssc_playMethod,onShowArray)>-1 ){
						hljssc_playType = i;
						hljssc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hljsscPlaySelect").append($play);
		}
	}
	
	if($("#hljsscPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("hljsscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hljsscChangeItem
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

	GetLotteryInfo("hljssc",function (){
		hljsscChangeItem("hljssc"+hljssc_playMethod);
	});

	//添加滑动条
	if(!hljsscScroll){
		hljsscScroll = new IScroll('#hljsscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("hljssc",LotteryInfo.getLotteryIdByTag("hljssc"));

	//获取上一期开奖
	queryLastPrize("hljssc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('hljssc');

	//机选选号
	$("#hljssc_random").on('click', function(event) {
		hljssc_randomOne();
	});
	
	$("#hljssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",hljssc_playMethod));
	//玩法说明
	$("#hljssc_paly_shuoming").off('click');
	$("#hljssc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hljssc_shuoming").text());
	});

	//返回
	$("#hljsscPage_back").on('click', function(event) {
		hljssc_playType = 2;
		hljssc_playMethod = 15;
		$("#hljssc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hljssc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("hljssc");//清空
	hljssc_submitData();
}

function hljsscResetPlayType(){
	hljssc_playType = 2;
	hljssc_playMethod = 15;
}

function hljsscChangeItem(val) {
	hljssc_qingkongAll();
	var temp = val.substring("hljssc".length,val.length);
	if(val == "hljssc0"){
		//直选复式
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 0;
		hljssc_playMethod = 0;
		createFiveLineLayout("hljssc", function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc1"){
		//直选单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 0;
		hljssc_playMethod = 1;
		$("#hljssc_ballView").empty();
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc2"){
		//组选120
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 0;
		hljssc_playMethod = 2;
		createOneLineLayout("hljssc","至少选择5个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc3"){
		//组选60
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 0;
		hljssc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc4"){
		//组选30
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 0;
		hljssc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc5"){
		//组选20
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 0;
		hljssc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc6"){
		//组选10
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 0;
		hljssc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc7"){
		//组选5
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 0;
		hljssc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc8"){
		//总和大小单双
		$("#hljssc_random").show();
		var num = ["大","小","单","双"];
		hljssc_sntuo = 0;
		hljssc_playType = 0;
		hljssc_playMethod = 8;
		createNonNumLayout("hljssc",hljssc_playMethod,num,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc9"){
		//直选复式
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 1;
		hljssc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("hljssc",tips, function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc10"){
		//直选单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 1;
		hljssc_playMethod = 10;
		$("#hljssc_ballView").empty();
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc11"){
		//组选24
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 1;
		hljssc_playMethod = 11;
		createOneLineLayout("hljssc","至少选择4个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc12"){
		//组选12
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 1;
		hljssc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc13"){
		//组选6
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 1;
		hljssc_playMethod = 13;
		createOneLineLayout("hljssc","二重号:至少选择2个号码",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc14"){
		//组选4
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 1;
		hljssc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc15"){
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc16"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 2;
		hljssc_playMethod = 16;
		$("#hljssc_ballView").empty();
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc17"){
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 17;
		createSumLayout("hljssc",0,27,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc18"){
		//直选跨度
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 18;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc19"){
		//后三组三
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 19;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc20"){
		//后三组六
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 20;
		createOneLineLayout("hljssc","至少选择3个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc21"){
		//后三和值
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 21;
		createSumLayout("hljssc",1,26,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc22"){
		//后三组选包胆
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 22;
		hljssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hljssc",array,["请选择一个号码"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc23"){
		//后三混合组选
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 2;
		hljssc_playMethod = 23;
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc24"){
		//和值尾数
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 24;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc25"){
		//特殊号
		$("#hljssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hljssc_sntuo = 0;
		hljssc_playType = 2;
		hljssc_playMethod = 25;
		createNonNumLayout("hljssc",hljssc_playMethod,num,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc26"){
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc27"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 3;
		hljssc_playMethod = 27;
		$("#hljssc_ballView").empty();
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc28"){
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 28;
		createSumLayout("hljssc",0,27,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc29"){
		//直选跨度
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 29;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc30"){
		//中三组三
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 30;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc31"){
		//中三组六
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 31;
		createOneLineLayout("hljssc","至少选择3个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc32"){
		//中三和值
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 32;
		createSumLayout("hljssc",1,26,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc33"){
		//中三组选包胆
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 33;
		hljssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hljssc",array,["请选择一个号码"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc34"){
		//中三混合组选
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 3;
		hljssc_playMethod = 34;
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc35"){
		//和值尾数
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 35;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc36"){
		//特殊号
		$("#hljssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hljssc_sntuo = 0;
		hljssc_playType = 3;
		hljssc_playMethod = 36;
		createNonNumLayout("hljssc",hljssc_playMethod,num,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc37"){
		//直选复式
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc38"){
		//直选单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 4;
		hljssc_playMethod = 38;
		$("#hljssc_ballView").empty();
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc39"){
		//和值
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 39;
		createSumLayout("hljssc",0,27,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc40"){
		//直选跨度
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 40;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc41"){
		//前三组三
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 41;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc42"){
		//前三组六
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 42;
		createOneLineLayout("hljssc","至少选择3个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc43"){
		//前三和值
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 43;
		createSumLayout("hljssc",1,26,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc44"){
		//前三组选包胆
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 44;
		hljssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hljssc",array,["请选择一个号码"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc45"){
		//前三混合组选
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 4;
		hljssc_playMethod = 45;
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc46"){
		//和值尾数
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 46;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc47"){
		//特殊号
		$("#hljssc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hljssc_sntuo = 0;
		hljssc_playType = 4;
		hljssc_playMethod = 47;
		createNonNumLayout("hljssc",hljssc_playMethod,num,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc48"){
		//后二复式
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 5;
		hljssc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc49"){
		//后二单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 5;
		hljssc_playMethod = 49;
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc50"){
		//后二和值
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 5;
		hljssc_playMethod = 50;
		createSumLayout("hljssc",0,18,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc51"){
		//直选跨度
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 5;
		hljssc_playMethod = 51;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc52"){
		//后二组选
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 5;
		hljssc_playMethod = 52;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc53"){
		//后二和值
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 5;
		hljssc_playMethod = 53;
		createSumLayout("hljssc",1,17,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc54"){
		//后二组选包胆
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 5;
		hljssc_playMethod = 54;
		hljssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hljssc",array,["请选择一个号码"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc55"){
		//前二复式
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 6;
		hljssc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc56"){
		//前二单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 6;
		hljssc_playMethod = 56;
		hljssc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
	}else if(val == "hljssc57"){
		//前二和值
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 6;
		hljssc_playMethod = 57;
		createSumLayout("hljssc",0,18,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc58"){
		//直选跨度
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 6;
		hljssc_playMethod = 58;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc59"){
		//前二组选
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 6;
		hljssc_playMethod = 59;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc60"){
		//前二和值
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 6;
		hljssc_playMethod = 60;
		createSumLayout("hljssc",1,17,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc61"){
		//前二组选包胆
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 6;
		hljssc_playMethod = 61;
		hljssc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hljssc",array,["请选择一个号码"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc62"){
		//定位复式
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 7;
		hljssc_playMethod = 62;
		createFiveLineLayout("hljssc", function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc63"){
		//后三一码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 63;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc64"){
		//后三二码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 64;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc65"){
		//前三一码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 65;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc66"){
		//前三二码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 66;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc67"){
		//后四一码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 67;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc68"){
		//后四二码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 68;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc69"){
		//前四一码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 69;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc70"){
		//前四二码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 70;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc71"){
		//五星一码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 71;
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc72"){
		//五星二码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 72;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc73"){
		//五星三码
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 8;
		hljssc_playMethod = 73;
		createOneLineLayout("hljssc","至少选择3个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc74"){
		//后二大小单双
		hljssc_qingkongAll();
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 9;
		hljssc_playMethod = 74;
		createTextBallTwoLayout("hljssc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc75"){
		//后三大小单双
		hljssc_qingkongAll();
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 9;
		hljssc_playMethod = 75;
		createTextBallThreeLayout("hljssc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc76"){
		//前二大小单双
		hljssc_qingkongAll();
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 9;
		hljssc_playMethod = 76;
		createTextBallTwoLayout("hljssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc77"){
		//前三大小单双
		hljssc_qingkongAll();
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 9;
		hljssc_playMethod = 77;
		createTextBallThreeLayout("hljssc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc78"){
		//直选复式
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 10;
		hljssc_playMethod = 78;
		createFiveLineLayout("hljssc",function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc79"){
		//直选单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 10;
		hljssc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
		createRenXuanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc80"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 10;
		hljssc_playMethod = 80;
		createSumLayout("hljssc",0,18,function(){
			hljssc_calcNotes();
		});
		createRenXuanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc81"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 10;
		hljssc_playMethod = 81;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		createRenXuanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc82"){
		//组选单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 10;
		hljssc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
		createRenXuanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc83"){
		//组选和值
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 10;
		hljssc_playMethod = 83;
		createSumLayout("hljssc",1,17,function(){
			hljssc_calcNotes();
		});
		createRenXuanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc84"){
		//直选复式
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 11;
		hljssc_playMethod = 84;
		createFiveLineLayout("hljssc", function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc85"){
		//直选单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 11;
		hljssc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
		createRenXuanSanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc86"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 11;
		hljssc_playMethod = 86;
		createSumLayout("hljssc",0,27,function(){
			hljssc_calcNotes();
		});
		createRenXuanSanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc87"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 11;
		hljssc_playMethod = 87;
		createOneLineLayout("hljssc","至少选择2个",0,9,false,function(){
			hljssc_calcNotes();
		});
		createRenXuanSanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc88"){
		//组选单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 11;
		hljssc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
		createRenXuanSanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc89"){
		//组选和值
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 11;
		hljssc_playMethod = 89;
		createOneLineLayout("hljssc","至少选择3个",0,9,false,function(){
			hljssc_calcNotes();
		});
		createRenXuanSanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc90"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 11;
		hljssc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
		createRenXuanSanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc91"){
		//混合组选
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 11;
		hljssc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
		createRenXuanSanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc92"){
		//组选和值
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 11;
		hljssc_playMethod = 92;
		createSumLayout("hljssc",1,26,function(){
			hljssc_calcNotes();
		});
		createRenXuanSanLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc93"){
		$("#hljssc_random").show();
		hljssc_sntuo = 0;
		hljssc_playType = 12;
		hljssc_playMethod = 93;
		createFiveLineLayout("hljssc", function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc94"){
		//直选单式
		$("#hljssc_random").hide();
		hljssc_sntuo = 3;
		hljssc_playType = 12;
		hljssc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hljssc",tips);
		createRenXuanSiLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc95"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 12;
		hljssc_playMethod = 95;
		createOneLineLayout("hljssc","至少选择4个",0,9,false,function(){
			hljssc_calcNotes();
		});
		createRenXuanSiLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc96"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 12;
		hljssc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		createRenXuanSiLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc97"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 12;
		hljssc_playMethod = 97;
		$("#hljssc_ballView").empty();
		createOneLineLayout("hljssc","二重号:至少选择2个号码",0,9,false,function(){
			hljssc_calcNotes();
		});
		createRenXuanSiLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc98"){
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 12;
		hljssc_playMethod = 98;
		$("#hljssc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hljssc",tips,0,9,false,function(){
			hljssc_calcNotes();
		});
		createRenXuanSiLayout("hljssc",hljssc_playMethod,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc99"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 13;
		hljssc_playMethod = 99;
		$("#hljssc_ballView").empty();
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc100"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 13;
		hljssc_playMethod = 100;
		$("#hljssc_ballView").empty();
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc101"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 13;
		hljssc_playMethod = 101;
		$("#hljssc_ballView").empty();
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc102"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 13;
		hljssc_playMethod = 102;
		$("#hljssc_ballView").empty();
		createOneLineLayout("hljssc","至少选择1个",0,9,false,function(){
			hljssc_calcNotes();
		});
		hljssc_qingkongAll();
	}else if(val == "hljssc103"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 103;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc104"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 104;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc105"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 105;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc106"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 106;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc107"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 107;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc108"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 108;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc109"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 109;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc110"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 110;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc111"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 111;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}else if(val == "hljssc112"){
		hljssc_qingkongAll();
		$("#hljssc_random").hide();
		hljssc_sntuo = 0;
		hljssc_playType = 14;
		hljssc_playMethod = 112;
		createTextBallOneLayout("hljssc",["龙","虎","和"],["至少选择一个"],function(){
			hljssc_calcNotes();
		});
	}

	if(hljsscScroll){
		hljsscScroll.refresh();
		hljsscScroll.scrollTo(0,0,1);
	}
	
	$("#hljssc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("hljssc",temp);
	hideRandomWhenLi("hljssc",hljssc_sntuo,hljssc_playMethod);
	hljssc_calcNotes();
}
/**
 * [hljssc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hljssc_initFooterButton(){
	if(hljssc_playMethod == 0 || hljssc_playMethod == 62 || hljssc_playMethod == 78
		|| hljssc_playMethod == 84 || hljssc_playMethod == 93 || hljssc_playType == 7){
		if(LotteryStorage["hljssc"]["line1"].length > 0 || LotteryStorage["hljssc"]["line2"].length > 0 ||
			LotteryStorage["hljssc"]["line3"].length > 0 || LotteryStorage["hljssc"]["line4"].length > 0 ||
			LotteryStorage["hljssc"]["line5"].length > 0){
			$("#hljssc_qingkong").css("opacity",1.0);
		}else{
			$("#hljssc_qingkong").css("opacity",0.4);
		}
	}else if(hljssc_playMethod == 9){
		if(LotteryStorage["hljssc"]["line1"].length > 0 || LotteryStorage["hljssc"]["line2"].length > 0 ||
			LotteryStorage["hljssc"]["line3"].length > 0 || LotteryStorage["hljssc"]["line4"].length > 0 ){
			$("#hljssc_qingkong").css("opacity",1.0);
		}else{
			$("#hljssc_qingkong").css("opacity",0.4);
		}
	}else if(hljssc_playMethod == 37 || hljssc_playMethod == 4 || hljssc_playMethod == 6
		|| hljssc_playMethod == 26 || hljssc_playMethod == 15 || hljssc_playMethod == 75 || hljssc_playMethod == 77){
		if(LotteryStorage["hljssc"]["line1"].length > 0 || LotteryStorage["hljssc"]["line2"].length > 0
			|| LotteryStorage["hljssc"]["line3"].length > 0){
			$("#hljssc_qingkong").css("opacity",1.0);
		}else{
			$("#hljssc_qingkong").css("opacity",0.4);
		}
	}else if(hljssc_playMethod == 3 || hljssc_playMethod == 4 || hljssc_playMethod == 5
		|| hljssc_playMethod == 6 || hljssc_playMethod == 7 || hljssc_playMethod == 12
		|| hljssc_playMethod == 14 || hljssc_playMethod == 48 || hljssc_playMethod == 55
		|| hljssc_playMethod == 74 || hljssc_playMethod == 76 || hljssc_playMethod == 96 || hljssc_playMethod == 98){
		if(LotteryStorage["hljssc"]["line1"].length > 0 || LotteryStorage["hljssc"]["line2"].length > 0){
			$("#hljssc_qingkong").css("opacity",1.0);
		}else{
			$("#hljssc_qingkong").css("opacity",0.4);
		}
	}else if(hljssc_playMethod == 2 || hljssc_playMethod == 8 || hljssc_playMethod == 11 || hljssc_playMethod == 13 || hljssc_playMethod == 39
		|| hljssc_playMethod == 28 || hljssc_playMethod == 17 || hljssc_playMethod == 18 || hljssc_playMethod == 24 || hljssc_playMethod == 41
		|| hljssc_playMethod == 25 || hljssc_playMethod == 29 || hljssc_playMethod == 42 || hljssc_playMethod == 43 || hljssc_playMethod == 30
		|| hljssc_playMethod == 35 || hljssc_playMethod == 36 || hljssc_playMethod == 31 || hljssc_playMethod == 32 || hljssc_playMethod == 19
		|| hljssc_playMethod == 40 || hljssc_playMethod == 46 || hljssc_playMethod == 20 || hljssc_playMethod == 21 || hljssc_playMethod == 50
		|| hljssc_playMethod == 47 || hljssc_playMethod == 51 || hljssc_playMethod == 52 || hljssc_playMethod == 53 || hljssc_playMethod == 57 || hljssc_playMethod == 63
		|| hljssc_playMethod == 58 || hljssc_playMethod == 59 || hljssc_playMethod == 60 || hljssc_playMethod == 65 || hljssc_playMethod == 80 || hljssc_playMethod == 81 || hljssc_playType == 8
		|| hljssc_playMethod == 83 || hljssc_playMethod == 86 || hljssc_playMethod == 87 || hljssc_playMethod == 22 || hljssc_playMethod == 33 || hljssc_playMethod == 44
		|| hljssc_playMethod == 89 || hljssc_playMethod == 92 || hljssc_playMethod == 95 || hljssc_playMethod == 54 || hljssc_playMethod == 61
		|| hljssc_playMethod == 97 || hljssc_playType == 13  || hljssc_playType == 14){
		if(LotteryStorage["hljssc"]["line1"].length > 0){
			$("#hljssc_qingkong").css("opacity",1.0);
		}else{
			$("#hljssc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hljssc_qingkong").css("opacity",0);
	}

	if($("#hljssc_qingkong").css("opacity") == "0"){
		$("#hljssc_qingkong").css("display","none");
	}else{
		$("#hljssc_qingkong").css("display","block");
	}

	if($('#hljssc_zhushu').html() > 0){
		$("#hljssc_queding").css("opacity",1.0);
	}else{
		$("#hljssc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  hljssc_qingkongAll(){
	$("#hljssc_ballView span").removeClass('redBalls_active');
	LotteryStorage["hljssc"]["line1"] = [];
	LotteryStorage["hljssc"]["line2"] = [];
	LotteryStorage["hljssc"]["line3"] = [];
	LotteryStorage["hljssc"]["line4"] = [];
	LotteryStorage["hljssc"]["line5"] = [];

	localStorageUtils.removeParam("hljssc_line1");
	localStorageUtils.removeParam("hljssc_line2");
	localStorageUtils.removeParam("hljssc_line3");
	localStorageUtils.removeParam("hljssc_line4");
	localStorageUtils.removeParam("hljssc_line5");

	$('#hljssc_zhushu').text(0);
	$('#hljssc_money').text(0);
	clearAwardWin("hljssc");
	hljssc_initFooterButton();
}

/**
 * [hljssc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hljssc_calcNotes(){
	$('#hljssc_modeId').blur();
	$('#hljssc_fandian').blur();
	
	var notes = 0;

	if(hljssc_playMethod == 0){
		notes = LotteryStorage["hljssc"]["line1"].length *
			LotteryStorage["hljssc"]["line2"].length *
			LotteryStorage["hljssc"]["line3"].length *
			LotteryStorage["hljssc"]["line4"].length *
			LotteryStorage["hljssc"]["line5"].length;
	}else if(hljssc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,5);
	}else if(hljssc_playMethod == 3){
		if (LotteryStorage["hljssc"]["line1"].length >= 1 && LotteryStorage["hljssc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["hljssc"]["line1"],LotteryStorage["hljssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hljssc_playMethod == 4){
		if (LotteryStorage["hljssc"]["line1"].length >= 2 && LotteryStorage["hljssc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["hljssc"]["line2"],LotteryStorage["hljssc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(hljssc_playMethod == 5 || hljssc_playMethod == 12){
		if (LotteryStorage["hljssc"]["line1"].length >= 1 && LotteryStorage["hljssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["hljssc"]["line1"],LotteryStorage["hljssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hljssc_playMethod == 6 || hljssc_playMethod == 7 || hljssc_playMethod == 14){
		if (LotteryStorage["hljssc"]["line1"].length >= 1 && LotteryStorage["hljssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["hljssc"]["line1"],LotteryStorage["hljssc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hljssc_playMethod == 9){
		notes = LotteryStorage["hljssc"]["line1"].length *
			LotteryStorage["hljssc"]["line2"].length *
			LotteryStorage["hljssc"]["line3"].length *
			LotteryStorage["hljssc"]["line4"].length;
	}else if(hljssc_playMethod == 18 || hljssc_playMethod == 29 || hljssc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["hljssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(hljssc_playMethod == 22 || hljssc_playMethod == 33 || hljssc_playMethod == 44 ){
		notes = 54;
	}else if(hljssc_playMethod == 54 || hljssc_playMethod == 61){
		notes = 9;
	}else if(hljssc_playMethod == 51 || hljssc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["hljssc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(hljssc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,4);
	}else if(hljssc_playMethod == 13|| hljssc_playMethod == 64 || hljssc_playMethod == 66 || hljssc_playMethod == 68 || hljssc_playMethod == 70 || hljssc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,2);
	}else if(hljssc_playMethod == 37 || hljssc_playMethod == 26 || hljssc_playMethod == 15 || hljssc_playMethod == 75 || hljssc_playMethod == 77){
		notes = LotteryStorage["hljssc"]["line1"].length *
			LotteryStorage["hljssc"]["line2"].length *
			LotteryStorage["hljssc"]["line3"].length ;
	}else if(hljssc_playMethod == 39 || hljssc_playMethod == 28 || hljssc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hljssc"]["line1"][i]);
		};
	}else if(hljssc_playMethod == 41 || hljssc_playMethod == 30 || hljssc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["hljssc"]["line1"].length,2);
	}else if(hljssc_playMethod == 42 || hljssc_playMethod == 31 || hljssc_playMethod == 20 || hljssc_playMethod == 68 || hljssc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,3);
	}else if(hljssc_playMethod == 43 || hljssc_playMethod == 32 || hljssc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hljssc"]["line1"][i]);
		};
	}else if(hljssc_playMethod == 48 || hljssc_playMethod == 55 || hljssc_playMethod == 74 || hljssc_playMethod == 76){
		notes = LotteryStorage["hljssc"]["line1"].length *
			LotteryStorage["hljssc"]["line2"].length ;
	}else if(hljssc_playMethod == 50 || hljssc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hljssc"]["line1"][i]);
		};
	}else if(hljssc_playMethod == 52 || hljssc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,2);
	}else if(hljssc_playMethod == 53 || hljssc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hljssc"]["line1"][i]);
		};
	}else if(hljssc_playMethod == 62){
		notes = LotteryStorage["hljssc"]["line1"].length +
			LotteryStorage["hljssc"]["line2"].length +
			LotteryStorage["hljssc"]["line3"].length +
			LotteryStorage["hljssc"]["line4"].length +
			LotteryStorage["hljssc"]["line5"].length;
	}else if(hljssc_playType == 13 || hljssc_playType == 14 || hljssc_playMethod == 8 || hljssc_playMethod == 71
		|| hljssc_playMethod == 24 || hljssc_playMethod == 25 || hljssc_playMethod == 35 || hljssc_playMethod == 36 || hljssc_playMethod == 46
		|| hljssc_playMethod == 47 || hljssc_playMethod == 63 || hljssc_playMethod == 65 || hljssc_playMethod == 67 || hljssc_playMethod == 69 ){
		notes = LotteryStorage["hljssc"]["line1"].length ;
	}else if(hljssc_playMethod == 78){
		notes = LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line2"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line3"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line4"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line3"].length +
			LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line4"].length +
			LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line4"].length +
			LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line4"].length * LotteryStorage["hljssc"]["line5"].length;
	}else if (hljssc_playMethod == 80) {
		if ($("#hljssc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hljssc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,2);
		}
	}else if (hljssc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,2) * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,2);
	}else if (hljssc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hljssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,2);
	}else if (hljssc_playMethod == 84) {
		notes = LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line3"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line4"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line4"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line4"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line4"].length +
			LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line4"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line4"].length * LotteryStorage["hljssc"]["line5"].length ;
	}else if (hljssc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hljssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,3);
	}else if (hljssc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["hljssc"]["line1"].length,2) * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,3);
	}else if (hljssc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,3) * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,3);
	}else if (hljssc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["hljssc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hljssc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,3);
	}else if (hljssc_playMethod == 93) {
		notes = LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line4"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line4"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line1"].length * LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line4"].length * LotteryStorage["hljssc"]["line5"].length +
			LotteryStorage["hljssc"]["line2"].length * LotteryStorage["hljssc"]["line3"].length * LotteryStorage["hljssc"]["line4"].length * LotteryStorage["hljssc"]["line5"].length;
	}else if (hljssc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,4)
			* mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,4);
	}else if (hljssc_playMethod == 96) {
		if (LotteryStorage["hljssc"]["line1"].length >= 1 && LotteryStorage["hljssc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["hljssc"]["line1"],LotteryStorage["hljssc"]["line2"])
				* mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (hljssc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["hljssc"]["line1"].length,2) * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,4);
	}else if (hljssc_playMethod == 98) {
		if (LotteryStorage["hljssc"]["line1"].length >= 1 && LotteryStorage["hljssc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["hljssc"]["line1"],LotteryStorage["hljssc"]["line2"]) * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = hljsscValidData($("#hljssc_single").val());
	}

	if(hljssc_sntuo == 3 || hljssc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","hljssc"),LotteryInfo.getMethodId("ssc",hljssc_playMethod))){
	}else{
		if(parseInt($('#hljssc_modeId').val()) == 8){
			$("#hljssc_random").hide();
		}else{
			$("#hljssc_random").show();
		}
	}

	//验证是否为空
	if( $("#hljssc_beiNum").val() =="" || parseInt($("#hljssc_beiNum").val()) == 0){
		$("#hljssc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#hljssc_beiNum").val() > 9999){
		$("#hljssc_beiNum").val(9999);
	}

	if(notes > 0) {
		$('#hljssc_zhushu').text(notes);
		if($("#hljssc_modeId").val() == "8"){
			$('#hljssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljssc_beiNum").val()),0.002));
		}else if ($("#hljssc_modeId").val() == "2"){
			$('#hljssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljssc_beiNum").val()),0.2));
		}else if ($("#hljssc_modeId").val() == "1"){
			$('#hljssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljssc_beiNum").val()),0.02));
		}else{
			$('#hljssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljssc_beiNum").val()),2));
		}
	} else {
		$('#hljssc_zhushu').text(0);
		$('#hljssc_money').text(0);
	}
	hljssc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('hljssc',hljssc_playMethod);
}

/**
 * [hljssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hljssc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#hljssc_queding").bind('click', function(event) {
		hljssc_rebate = $("#hljssc_fandian option:last").val();
		if(parseInt($('#hljssc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hljssc_calcNotes();

		//设置单笔最低投注额为1元
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		//提示单挑奖金
		getDanTiaoBonus('hljssc',hljssc_playMethod);

		submitParams.lotteryType = "hljssc";
		var play = LotteryInfo.getPlayName("ssc",hljssc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",hljssc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = hljssc_playType;
		submitParams.playMethodIndex = hljssc_playMethod;
		var selectedBalls = [];
		if(hljssc_playMethod == 0 || hljssc_playMethod == 3 || hljssc_playMethod == 4
			|| hljssc_playMethod == 5 || hljssc_playMethod == 6 || hljssc_playMethod == 7
			|| hljssc_playMethod == 9 || hljssc_playMethod == 12 || hljssc_playMethod == 14
			|| hljssc_playMethod == 37 || hljssc_playMethod == 26 || hljssc_playMethod == 15
			|| hljssc_playMethod == 48 || hljssc_playMethod == 55 || hljssc_playMethod == 74 || hljssc_playType == 9){
			$("#hljssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(hljssc_playMethod == 2 || hljssc_playMethod == 8 || hljssc_playMethod == 11 || hljssc_playMethod == 13 || hljssc_playMethod == 24
			|| hljssc_playMethod == 39 || hljssc_playMethod == 28 || hljssc_playMethod == 17 || hljssc_playMethod == 18 || hljssc_playMethod == 25
			|| hljssc_playMethod == 22 || hljssc_playMethod == 33 || hljssc_playMethod == 44 || hljssc_playMethod == 54 || hljssc_playMethod == 61
			|| hljssc_playMethod == 41 || hljssc_playMethod == 42 || hljssc_playMethod == 43 || hljssc_playMethod == 29 || hljssc_playMethod == 35
			|| hljssc_playMethod == 30 || hljssc_playMethod == 31 || hljssc_playMethod == 32 || hljssc_playMethod == 40 || hljssc_playMethod == 36
			|| hljssc_playMethod == 19 || hljssc_playMethod == 20 || hljssc_playMethod == 21 || hljssc_playMethod == 46 || hljssc_playMethod == 47
			|| hljssc_playMethod == 50 || hljssc_playMethod == 57 || hljssc_playType == 8 || hljssc_playMethod == 51 || hljssc_playMethod == 58
			|| hljssc_playMethod == 52 || hljssc_playMethod == 53|| hljssc_playMethod == 59 || hljssc_playMethod == 60 || hljssc_playType == 13 || hljssc_playType == 14){
			$("#hljssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(hljssc_playType == 7 || hljssc_playMethod == 78 || hljssc_playMethod == 84 || hljssc_playMethod == 93){
			$("#hljssc_ballView div.ballView").each(function(){
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
		}else if(hljssc_playMethod == 80 || hljssc_playMethod == 81 || hljssc_playMethod == 83
			|| hljssc_playMethod == 86 || hljssc_playMethod == 87 || hljssc_playMethod == 89
			|| hljssc_playMethod == 92 || hljssc_playMethod == 95 || hljssc_playMethod == 97){
			$("#hljssc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#hljssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#hljssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#hljssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#hljssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#hljssc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (hljssc_playMethod == 96 || hljssc_playMethod == 98) {
			$("#hljssc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#hljssc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#hljssc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#hljssc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#hljssc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#hljssc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			var array = handleSingleStr($("#hljssc_single").val());
			if(hljssc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(hljssc_playMethod == 10 || hljssc_playMethod == 38 || hljssc_playMethod == 27
				|| hljssc_playMethod == 16 || hljssc_playMethod == 49 || hljssc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(hljssc_playMethod == 45 || hljssc_playMethod == 34 || hljssc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(hljssc_playMethod == 79 || hljssc_playMethod == 82 || hljssc_playMethod == 85 || hljssc_playMethod == 88 ||
				hljssc_playMethod == 89 || hljssc_playMethod == 90 || hljssc_playMethod == 91 || hljssc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#hljssc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#hljssc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#hljssc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#hljssc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#hljssc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#hljssc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#hljssc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#hljssc_fandian").val());
		submitParams.notes = $('#hljssc_zhushu').html();
		submitParams.sntuo = hljssc_sntuo;
		submitParams.multiple = $('#hljssc_beiNum').val();  //requirement
		submitParams.rebates = $('#hljssc_fandian').val();  //requirement
		submitParams.playMode = $('#hljssc_modeId').val();  //requirement
		submitParams.money = $('#hljssc_money').html();  //requirement
		submitParams.award = $('#hljssc_minAward').html();  //奖金
		submitParams.maxAward = $('#hljssc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#hljssc_ballView").empty();
		hljssc_qingkongAll();
	});
}

/**
 * [hljssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hljssc_randomOne(){
	hljssc_qingkongAll();
	if(hljssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["hljssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hljssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hljssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["hljssc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["hljssc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line2"], function(k, v){
			$("#" + "hljssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line3"], function(k, v){
			$("#" + "hljssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line4"], function(k, v){
			$("#" + "hljssc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line5"], function(k, v){
			$("#" + "hljssc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["hljssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["hljssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hljssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hljssc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["hljssc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line2"], function(k, v){
			$("#" + "hljssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line3"], function(k, v){
			$("#" + "hljssc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line4"], function(k, v){
			$("#" + "hljssc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(hljssc_playMethod == 37 || hljssc_playMethod == 26 || hljssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["hljssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hljssc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hljssc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line2"], function(k, v){
			$("#" + "hljssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line3"], function(k, v){
			$("#" + "hljssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 41 || hljssc_playMethod == 30 || hljssc_playMethod == 19 || hljssc_playMethod == 68
		|| hljssc_playMethod == 52 || hljssc_playMethod == 64 || hljssc_playMethod == 66
		|| hljssc_playMethod == 59 || hljssc_playMethod == 70 || hljssc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["hljssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 42 || hljssc_playMethod == 31 || hljssc_playMethod == 20 || hljssc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["hljssc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 39 || hljssc_playMethod == 28 || hljssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["hljssc"]["line1"].push(number+'');
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 43 || hljssc_playMethod == 32 || hljssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["hljssc"]["line1"].push(number+'');
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 48 || hljssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["hljssc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hljssc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line2"], function(k, v){
			$("#" + "hljssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 25 || hljssc_playMethod == 36 || hljssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["hljssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 50 || hljssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["hljssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 53 || hljssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["hljssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["hljssc"]["line"+line].push(number+"");
		$.each(LotteryStorage["hljssc"]["line"+line], function(k, v){
			$("#" + "hljssc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 63 || hljssc_playMethod == 67 || hljssc_playMethod == 69 || hljssc_playMethod == 71 || hljssc_playType == 13
		|| hljssc_playMethod == 65 || hljssc_playMethod == 18 || hljssc_playMethod == 29 || hljssc_playMethod == 40 || hljssc_playMethod == 22
		|| hljssc_playMethod == 33 || hljssc_playMethod == 44 || hljssc_playMethod == 54 || hljssc_playMethod == 61
		|| hljssc_playMethod == 24 || hljssc_playMethod == 35 || hljssc_playMethod == 46 || hljssc_playMethod == 51 || hljssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["hljssc"]["line1"].push(number+'');
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 74 || hljssc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["hljssc"]["line1"].push(array[0]+"");
		LotteryStorage["hljssc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line2"], function(k, v){
			$("#" + "hljssc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 75 || hljssc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["hljssc"]["line1"].push(array[0]+"");
		LotteryStorage["hljssc"]["line2"].push(array[1]+"");
		LotteryStorage["hljssc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line2"], function(k, v){
			$("#" + "hljssc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line3"], function(k, v){
			$("#" + "hljssc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["hljssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hljssc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["hljssc"]["line"+lines[0]], function(k, v){
			$("#" + "hljssc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line"+lines[1]], function(k, v){
			$("#" + "hljssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["hljssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hljssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["hljssc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["hljssc"]["line"+lines[0]], function(k, v){
			$("#" + "hljssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line"+lines[1]], function(k, v){
			$("#" + "hljssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line"+lines[0]], function(k, v){
			$("#" + "hljssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["hljssc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hljssc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["hljssc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["hljssc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["hljssc"]["line"+lines[0]], function(k, v){
			$("#" + "hljssc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line"+lines[1]], function(k, v){
			$("#" + "hljssc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line"+lines[2]], function(k, v){
			$("#" + "hljssc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hljssc"]["line"+lines[3]], function(k, v){
			$("#" + "hljssc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(hljssc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["hljssc"]["line1"].push(number+"");
		$.each(LotteryStorage["hljssc"]["line1"], function(k, v){
			$("#" + "hljssc_line1" + v).toggleClass("redBalls_active");
		});
	}
	hljssc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hljssc_checkOutRandom(playMethod){
	var obj = new Object();
	if(hljssc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hljssc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(hljssc_playMethod == 18 || hljssc_playMethod == 29 || hljssc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(hljssc_playMethod == 22 || hljssc_playMethod == 33 || hljssc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(hljssc_playMethod == 54 || hljssc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(hljssc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hljssc_playMethod == 37 || hljssc_playMethod == 26 || hljssc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hljssc_playMethod == 39 || hljssc_playMethod == 28 || hljssc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(hljssc_playMethod == 41 || hljssc_playMethod == 30 || hljssc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(hljssc_playMethod == 52 || hljssc_playMethod == 59 || hljssc_playMethod == 64 || hljssc_playMethod == 66 || hljssc_playMethod == 68
		||hljssc_playMethod == 70 || hljssc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hljssc_playMethod == 42 || hljssc_playMethod == 31 || hljssc_playMethod == 20 || hljssc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hljssc_playMethod == 43 || hljssc_playMethod == 32 || hljssc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(hljssc_playMethod == 48 || hljssc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hljssc_playMethod == 50 || hljssc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(hljssc_playMethod == 53 || hljssc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(hljssc_playMethod == 62){
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
	}else if(hljssc_playMethod == 63 || hljssc_playMethod == 65 || hljssc_playMethod == 67 || hljssc_playMethod == 69 || hljssc_playMethod == 71
		|| hljssc_playMethod == 24 || hljssc_playMethod == 35 || hljssc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(hljssc_playMethod == 25 || hljssc_playMethod == 36 || hljssc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(hljssc_playMethod == 51 || hljssc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(hljssc_playMethod == 74 || hljssc_playMethod == 76){
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
	}else if(hljssc_playMethod == 75 || hljssc_playMethod == 77){
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
	}else if(hljssc_playMethod == 78){
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
	}else if(hljssc_playMethod == 84){
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
	}else if(hljssc_playMethod == 93){
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
	obj.sntuo = hljssc_sntuo;
	obj.multiple = 1;
	obj.rebates = hljssc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('hljssc',hljssc_playMethod,obj);  //机选奖金计算
	obj.award = $('#hljssc_minAward').html();     //奖金
	obj.maxAward = $('#hljssc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [hljsscValidateData 单式数据验证]
 */
function hljsscValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#hljssc_single").val();
	textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	hljsscValidData(textStr,type);
}

function hljsscValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(hljssc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 38 || hljssc_playMethod == 27 || hljssc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 45 || hljssc_playMethod == 34 || hljssc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 49 || hljssc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,2);
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,2);
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,3);
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,3);
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,3);
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,3);
		hljsscShowFooter(true,notes);
	}else if(hljssc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hljssc_tab .button.red").size() ,4);
		hljsscShowFooter(true,notes);
	}

	$('#hljssc_delRepeat').off('click');
	$('#hljssc_delRepeat').on('click',function () {
		content.str = $('#hljssc_single').val() ? $('#hljssc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		hljsscShowFooter(true,notes);
		$("#hljssc_single").val(array.join(" "));
	});

	$("#hljssc_single").val(array.join(" "));
	return notes;
}

function hljsscShowFooter(isValid,notes){
	$('#hljssc_zhushu').text(notes);
	if($("#hljssc_modeId").val() == "8"){
		$('#hljssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljssc_beiNum").val()),0.002));
	}else if ($("#hljssc_modeId").val() == "2"){
		$('#hljssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljssc_beiNum").val()),0.2));
	}else if ($("#hljssc_modeId").val() == "1"){
		$('#hljssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljssc_beiNum").val()),0.02));
	}else{
		$('#hljssc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hljssc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	hljssc_initFooterButton();
	calcAwardWin('hljssc',hljssc_playMethod);  //计算奖金和盈利
}