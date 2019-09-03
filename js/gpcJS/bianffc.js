var bianffc_playType = 2;
var bianffc_playMethod = 15;
var bianffc_sntuo = 0;
var bianffc_rebate;
var bianffcScroll;

//进入这个页面时调用
function bianffcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("bianffc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("bianffc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function bianffcPageUnloadedPanel(){
	$("#bianffc_queding").off('click');
	$("#bianffcPage_back").off('click');
	$("#bianffc_ballView").empty();
	$("#bianffcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="bianffcPlaySelect"></select>');
	$("#bianffcSelect").append($select);
}

//入口函数
function bianffc_init(){
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
	$("#bianffc_title").html(LotteryInfo.getLotteryNameByTag("bianffc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == bianffc_playType && j == bianffc_playMethod){
					$play.append('<option value="bianffc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="bianffc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(bianffc_playMethod,onShowArray)>-1 ){
						bianffc_playType = i;
						bianffc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#bianffcPlaySelect").append($play);
		}
	}
	
	if($("#bianffcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("bianffcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:bianffcChangeItem
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

	GetLotteryInfo("bianffc",function (){
		bianffcChangeItem("bianffc"+bianffc_playMethod);
	});

	//添加滑动条
	if(!bianffcScroll){
		bianffcScroll = new IScroll('#bianffcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("bianffc",LotteryInfo.getLotteryIdByTag("bianffc"));

	//获取上一期开奖
	queryLastPrize("bianffc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('bianffc');

	//机选选号
	$("#bianffc_random").off('click');
	$("#bianffc_random").on('click', function(event) {
		bianffc_randomOne();
	});
	
	$("#bianffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",bianffc_playMethod));
	//玩法说明
	$("#bianffc_paly_shuoming").off('click');
	$("#bianffc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#bianffc_shuoming").text());
	});

	//返回
	$("#bianffcPage_back").on('click', function(event) {
		// bianffc_playType = 2;
		// bianffc_playMethod = 15;
		$("#bianffc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		bianffc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("bianffc");//清空
	bianffc_submitData();
}

function bianffcResetPlayType(){
	bianffc_playType = 2;
	bianffc_playMethod = 15;
}

function bianffcChangeItem(val) {
	bianffc_qingkongAll();
	var temp = val.substring("bianffc".length,val.length);
	if(val == "bianffc0"){
		//直选复式
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 0;
		bianffc_playMethod = 0;
		createFiveLineLayout("bianffc", function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc1"){
		//直选单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 0;
		bianffc_playMethod = 1;
		$("#bianffc_ballView").empty();
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc2"){
		//组选120
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 0;
		bianffc_playMethod = 2;
		createOneLineLayout("bianffc","至少选择5个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc3"){
		//组选60
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 0;
		bianffc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc4"){
		//组选30
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 0;
		bianffc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc5"){
		//组选20
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 0;
		bianffc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc6"){
		//组选10
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 0;
		bianffc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc7"){
		//组选5
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 0;
		bianffc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc8"){
		//总和大小单双
		$("#bianffc_random").show();
		var num = ["大","小","单","双"];
		bianffc_sntuo = 0;
		bianffc_playType = 0;
		bianffc_playMethod = 8;
		createNonNumLayout("bianffc",bianffc_playMethod,num,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc9"){
		//直选复式
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 1;
		bianffc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("bianffc",tips, function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc10"){
		//直选单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 1;
		bianffc_playMethod = 10;
		$("#bianffc_ballView").empty();
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc11"){
		//组选24
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 1;
		bianffc_playMethod = 11;
		createOneLineLayout("bianffc","至少选择4个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc12"){
		//组选12
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 1;
		bianffc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc13"){
		//组选6
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 1;
		bianffc_playMethod = 13;
		createOneLineLayout("bianffc","二重号:至少选择2个号码",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc14"){
		//组选4
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 1;
		bianffc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc15"){
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc16"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 2;
		bianffc_playMethod = 16;
		$("#bianffc_ballView").empty();
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc17"){
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 17;
		createSumLayout("bianffc",0,27,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc18"){
		//直选跨度
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 18;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc19"){
		//后三组三
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 19;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc20"){
		//后三组六
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 20;
		createOneLineLayout("bianffc","至少选择3个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc21"){
		//后三和值
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 21;
		createSumLayout("bianffc",1,26,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc22"){
		//后三组选包胆
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 22;
		bianffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bianffc",array,["请选择一个号码"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc23"){
		//后三混合组选
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 2;
		bianffc_playMethod = 23;
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc24"){
		//和值尾数
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 24;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc25"){
		//特殊号
		$("#bianffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		bianffc_sntuo = 0;
		bianffc_playType = 2;
		bianffc_playMethod = 25;
		createNonNumLayout("bianffc",bianffc_playMethod,num,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc26"){
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc27"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 3;
		bianffc_playMethod = 27;
		$("#bianffc_ballView").empty();
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc28"){
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 28;
		createSumLayout("bianffc",0,27,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc29"){
		//直选跨度
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 29;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc30"){
		//中三组三
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 30;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc31"){
		//中三组六
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 31;
		createOneLineLayout("bianffc","至少选择3个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc32"){
		//中三和值
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 32;
		createSumLayout("bianffc",1,26,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc33"){
		//中三组选包胆
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 33;
		bianffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bianffc",array,["请选择一个号码"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc34"){
		//中三混合组选
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 3;
		bianffc_playMethod = 34;
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc35"){
		//和值尾数
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 35;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc36"){
		//特殊号
		$("#bianffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		bianffc_sntuo = 0;
		bianffc_playType = 3;
		bianffc_playMethod = 36;
		createNonNumLayout("bianffc",bianffc_playMethod,num,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc37"){
		//直选复式
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc38"){
		//直选单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 4;
		bianffc_playMethod = 38;
		$("#bianffc_ballView").empty();
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc39"){
		//和值
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 39;
		createSumLayout("bianffc",0,27,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc40"){
		//直选跨度
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 40;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc41"){
		//前三组三
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 41;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc42"){
		//前三组六
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 42;
		createOneLineLayout("bianffc","至少选择3个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc43"){
		//前三和值
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 43;
		createSumLayout("bianffc",1,26,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc44"){
		//前三组选包胆
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 44;
		bianffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bianffc",array,["请选择一个号码"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc45"){
		//前三混合组选
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 4;
		bianffc_playMethod = 45;
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc46"){
		//和值尾数
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 46;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc47"){
		//特殊号
		$("#bianffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		bianffc_sntuo = 0;
		bianffc_playType = 4;
		bianffc_playMethod = 47;
		createNonNumLayout("bianffc",bianffc_playMethod,num,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc48"){
		//后二复式
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 5;
		bianffc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc49"){
		//后二单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 5;
		bianffc_playMethod = 49;
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc50"){
		//后二和值
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 5;
		bianffc_playMethod = 50;
		createSumLayout("bianffc",0,18,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc51"){
		//直选跨度
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 5;
		bianffc_playMethod = 51;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc52"){
		//后二组选
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 5;
		bianffc_playMethod = 52;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc53"){
		//后二和值
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 5;
		bianffc_playMethod = 53;
		createSumLayout("bianffc",1,17,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc54"){
		//后二组选包胆
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 5;
		bianffc_playMethod = 54;
		bianffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bianffc",array,["请选择一个号码"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc55"){
		//前二复式
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 6;
		bianffc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc56"){
		//前二单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 6;
		bianffc_playMethod = 56;
		bianffc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
	}else if(val == "bianffc57"){
		//前二和值
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 6;
		bianffc_playMethod = 57;
		createSumLayout("bianffc",0,18,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc58"){
		//直选跨度
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 6;
		bianffc_playMethod = 58;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc59"){
		//前二组选
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 6;
		bianffc_playMethod = 59;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc60"){
		//前二和值
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 6;
		bianffc_playMethod = 60;
		createSumLayout("bianffc",1,17,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc61"){
		//前二组选包胆
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 6;
		bianffc_playMethod = 61;
		bianffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("bianffc",array,["请选择一个号码"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc62"){
		//定位复式
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 7;
		bianffc_playMethod = 62;
		createFiveLineLayout("bianffc", function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc63"){
		//后三一码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 63;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc64"){
		//后三二码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 64;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc65"){
		//前三一码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 65;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc66"){
		//前三二码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 66;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc67"){
		//后四一码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 67;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc68"){
		//后四二码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 68;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc69"){
		//前四一码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 69;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc70"){
		//前四二码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 70;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc71"){
		//五星一码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 71;
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc72"){
		//五星二码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 72;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc73"){
		//五星三码
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 8;
		bianffc_playMethod = 73;
		createOneLineLayout("bianffc","至少选择3个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc74"){
		//后二大小单双
		bianffc_qingkongAll();
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 9;
		bianffc_playMethod = 74;
		createTextBallTwoLayout("bianffc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc75"){
		//后三大小单双
		bianffc_qingkongAll();
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 9;
		bianffc_playMethod = 75;
		createTextBallThreeLayout("bianffc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc76"){
		//前二大小单双
		bianffc_qingkongAll();
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 9;
		bianffc_playMethod = 76;
		createTextBallTwoLayout("bianffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc77"){
		//前三大小单双
		bianffc_qingkongAll();
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 9;
		bianffc_playMethod = 77;
		createTextBallThreeLayout("bianffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc78"){
		//直选复式
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 10;
		bianffc_playMethod = 78;
		createFiveLineLayout("bianffc",function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc79"){
		//直选单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 10;
		bianffc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
		createRenXuanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc80"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 10;
		bianffc_playMethod = 80;
		createSumLayout("bianffc",0,18,function(){
			bianffc_calcNotes();
		});
		createRenXuanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc81"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 10;
		bianffc_playMethod = 81;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		createRenXuanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc82"){
		//组选单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 10;
		bianffc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
		createRenXuanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc83"){
		//组选和值
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 10;
		bianffc_playMethod = 83;
		createSumLayout("bianffc",1,17,function(){
			bianffc_calcNotes();
		});
		createRenXuanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc84"){
		//直选复式
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 11;
		bianffc_playMethod = 84;
		createFiveLineLayout("bianffc", function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc85"){
		//直选单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 11;
		bianffc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
		createRenXuanSanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc86"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 11;
		bianffc_playMethod = 86;
		createSumLayout("bianffc",0,27,function(){
			bianffc_calcNotes();
		});
		createRenXuanSanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc87"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 11;
		bianffc_playMethod = 87;
		createOneLineLayout("bianffc","至少选择2个",0,9,false,function(){
			bianffc_calcNotes();
		});
		createRenXuanSanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc88"){
		//组选单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 11;
		bianffc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
		createRenXuanSanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc89"){
		//组选和值
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 11;
		bianffc_playMethod = 89;
		createOneLineLayout("bianffc","至少选择3个",0,9,false,function(){
			bianffc_calcNotes();
		});
		createRenXuanSanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc90"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 11;
		bianffc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
		createRenXuanSanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc91"){
		//混合组选
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 11;
		bianffc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
		createRenXuanSanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc92"){
		//组选和值
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 11;
		bianffc_playMethod = 92;
		createSumLayout("bianffc",1,26,function(){
			bianffc_calcNotes();
		});
		createRenXuanSanLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc93"){
		$("#bianffc_random").show();
		bianffc_sntuo = 0;
		bianffc_playType = 12;
		bianffc_playMethod = 93;
		createFiveLineLayout("bianffc", function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc94"){
		//直选单式
		$("#bianffc_random").hide();
		bianffc_sntuo = 3;
		bianffc_playType = 12;
		bianffc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("bianffc",tips);
		createRenXuanSiLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc95"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 12;
		bianffc_playMethod = 95;
		createOneLineLayout("bianffc","至少选择4个",0,9,false,function(){
			bianffc_calcNotes();
		});
		createRenXuanSiLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc96"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 12;
		bianffc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		createRenXuanSiLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc97"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 12;
		bianffc_playMethod = 97;
		$("#bianffc_ballView").empty();
		createOneLineLayout("bianffc","二重号:至少选择2个号码",0,9,false,function(){
			bianffc_calcNotes();
		});
		createRenXuanSiLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc98"){
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 12;
		bianffc_playMethod = 98;
		$("#bianffc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("bianffc",tips,0,9,false,function(){
			bianffc_calcNotes();
		});
		createRenXuanSiLayout("bianffc",bianffc_playMethod,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc99"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 13;
		bianffc_playMethod = 99;
		$("#bianffc_ballView").empty();
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc100"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 13;
		bianffc_playMethod = 100;
		$("#bianffc_ballView").empty();
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc101"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 13;
		bianffc_playMethod = 101;
		$("#bianffc_ballView").empty();
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc102"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 13;
		bianffc_playMethod = 102;
		$("#bianffc_ballView").empty();
		createOneLineLayout("bianffc","至少选择1个",0,9,false,function(){
			bianffc_calcNotes();
		});
		bianffc_qingkongAll();
	}else if(val == "bianffc103"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 103;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc104"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 104;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc105"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 105;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc106"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 106;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc107"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 107;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc108"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 108;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc109"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 109;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc110"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 110;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc111"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 111;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc112"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 14;
		bianffc_playMethod = 112;
		createTextBallOneLayout("bianffc",["龙","虎","和"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc123"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 123;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc124"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 124;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc125"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 125;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc126"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 126;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc127"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 127;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc128"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 128;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc129"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 129;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc130"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 130;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc131"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 131;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}else if(val == "bianffc132"){
		bianffc_qingkongAll();
		$("#bianffc_random").hide();
		bianffc_sntuo = 0;
		bianffc_playType = 16;
		bianffc_playMethod = 132;
		createTextBallOneLayout("bianffc",["龙","虎"],["至少选择一个"],function(){
			bianffc_calcNotes();
		});
	}

	if(bianffcScroll){
		bianffcScroll.refresh();
		bianffcScroll.scrollTo(0,0,1);
	}
	
	$("#bianffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("bianffc",temp);
	hideRandomWhenLi("bianffc",bianffc_sntuo,bianffc_playMethod);
	bianffc_calcNotes();
}
/**
 * [bianffc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function bianffc_initFooterButton(){
	if(bianffc_playMethod == 0 || bianffc_playMethod == 62 || bianffc_playMethod == 78
		|| bianffc_playMethod == 84 || bianffc_playMethod == 93 || bianffc_playType == 7){
		if(LotteryStorage["bianffc"]["line1"].length > 0 || LotteryStorage["bianffc"]["line2"].length > 0 ||
			LotteryStorage["bianffc"]["line3"].length > 0 || LotteryStorage["bianffc"]["line4"].length > 0 ||
			LotteryStorage["bianffc"]["line5"].length > 0){
			$("#bianffc_qingkong").css("opacity",1.0);
		}else{
			$("#bianffc_qingkong").css("opacity",0.4);
		}
	}else if(bianffc_playMethod == 9){
		if(LotteryStorage["bianffc"]["line1"].length > 0 || LotteryStorage["bianffc"]["line2"].length > 0 ||
			LotteryStorage["bianffc"]["line3"].length > 0 || LotteryStorage["bianffc"]["line4"].length > 0 ){
			$("#bianffc_qingkong").css("opacity",1.0);
		}else{
			$("#bianffc_qingkong").css("opacity",0.4);
		}
	}else if(bianffc_playMethod == 37 || bianffc_playMethod == 4 || bianffc_playMethod == 6
		|| bianffc_playMethod == 26 || bianffc_playMethod == 15 || bianffc_playMethod == 75 || bianffc_playMethod == 77){
		if(LotteryStorage["bianffc"]["line1"].length > 0 || LotteryStorage["bianffc"]["line2"].length > 0
			|| LotteryStorage["bianffc"]["line3"].length > 0){
			$("#bianffc_qingkong").css("opacity",1.0);
		}else{
			$("#bianffc_qingkong").css("opacity",0.4);
		}
	}else if(bianffc_playMethod == 3 || bianffc_playMethod == 4 || bianffc_playMethod == 5
		|| bianffc_playMethod == 6 || bianffc_playMethod == 7 || bianffc_playMethod == 12
		|| bianffc_playMethod == 14 || bianffc_playMethod == 48 || bianffc_playMethod == 55
		|| bianffc_playMethod == 74 || bianffc_playMethod == 76 || bianffc_playMethod == 96 || bianffc_playMethod == 98){
		if(LotteryStorage["bianffc"]["line1"].length > 0 || LotteryStorage["bianffc"]["line2"].length > 0){
			$("#bianffc_qingkong").css("opacity",1.0);
		}else{
			$("#bianffc_qingkong").css("opacity",0.4);
		}
	}else if(bianffc_playMethod == 2 || bianffc_playMethod == 8 || bianffc_playMethod == 11 || bianffc_playMethod == 13 || bianffc_playMethod == 39
		|| bianffc_playMethod == 28 || bianffc_playMethod == 17 || bianffc_playMethod == 18 || bianffc_playMethod == 24 || bianffc_playMethod == 41
		|| bianffc_playMethod == 25 || bianffc_playMethod == 29 || bianffc_playMethod == 42 || bianffc_playMethod == 43 || bianffc_playMethod == 30
		|| bianffc_playMethod == 35 || bianffc_playMethod == 36 || bianffc_playMethod == 31 || bianffc_playMethod == 32 || bianffc_playMethod == 19
		|| bianffc_playMethod == 40 || bianffc_playMethod == 46 || bianffc_playMethod == 20 || bianffc_playMethod == 21 || bianffc_playMethod == 50
		|| bianffc_playMethod == 47 || bianffc_playMethod == 51 || bianffc_playMethod == 52 || bianffc_playMethod == 53 || bianffc_playMethod == 57 || bianffc_playMethod == 63
		|| bianffc_playMethod == 58 || bianffc_playMethod == 59 || bianffc_playMethod == 60 || bianffc_playMethod == 65 || bianffc_playMethod == 80 || bianffc_playMethod == 81 || bianffc_playType == 8
		|| bianffc_playMethod == 83 || bianffc_playMethod == 86 || bianffc_playMethod == 87 || bianffc_playMethod == 22 || bianffc_playMethod == 33 || bianffc_playMethod == 44
		|| bianffc_playMethod == 89 || bianffc_playMethod == 92 || bianffc_playMethod == 95 || bianffc_playMethod == 54 || bianffc_playMethod == 61
		|| bianffc_playMethod == 97 || bianffc_playType == 13  || bianffc_playType == 14 || bianffc_playType == 16){
		if(LotteryStorage["bianffc"]["line1"].length > 0){
			$("#bianffc_qingkong").css("opacity",1.0);
		}else{
			$("#bianffc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#bianffc_qingkong").css("opacity",0);
	}

	if($("#bianffc_qingkong").css("opacity") == "0"){
		$("#bianffc_qingkong").css("display","none");
	}else{
		$("#bianffc_qingkong").css("display","block");
	}

	if($('#bianffc_zhushu').html() > 0){
		$("#bianffc_queding").css("opacity",1.0);
	}else{
		$("#bianffc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  bianffc_qingkongAll(){
	$("#bianffc_ballView span").removeClass('redBalls_active');
	LotteryStorage["bianffc"]["line1"] = [];
	LotteryStorage["bianffc"]["line2"] = [];
	LotteryStorage["bianffc"]["line3"] = [];
	LotteryStorage["bianffc"]["line4"] = [];
	LotteryStorage["bianffc"]["line5"] = [];

	localStorageUtils.removeParam("bianffc_line1");
	localStorageUtils.removeParam("bianffc_line2");
	localStorageUtils.removeParam("bianffc_line3");
	localStorageUtils.removeParam("bianffc_line4");
	localStorageUtils.removeParam("bianffc_line5");

	$('#bianffc_zhushu').text(0);
	$('#bianffc_money').text(0);
	clearAwardWin("bianffc");
	bianffc_initFooterButton();
}

/**
 * [bianffc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function bianffc_calcNotes(){
	$('#bianffc_modeId').blur();
	$('#bianffc_fandian').blur();
	
	var notes = 0;

	if(bianffc_playMethod == 0){
		notes = LotteryStorage["bianffc"]["line1"].length *
			LotteryStorage["bianffc"]["line2"].length *
			LotteryStorage["bianffc"]["line3"].length *
			LotteryStorage["bianffc"]["line4"].length *
			LotteryStorage["bianffc"]["line5"].length;
	}else if(bianffc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,5);
	}else if(bianffc_playMethod == 3){
		if (LotteryStorage["bianffc"]["line1"].length >= 1 && LotteryStorage["bianffc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["bianffc"]["line1"],LotteryStorage["bianffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(bianffc_playMethod == 4){
		if (LotteryStorage["bianffc"]["line1"].length >= 2 && LotteryStorage["bianffc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["bianffc"]["line2"],LotteryStorage["bianffc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(bianffc_playMethod == 5 || bianffc_playMethod == 12){
		if (LotteryStorage["bianffc"]["line1"].length >= 1 && LotteryStorage["bianffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["bianffc"]["line1"],LotteryStorage["bianffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(bianffc_playMethod == 6 || bianffc_playMethod == 7 || bianffc_playMethod == 14){
		if (LotteryStorage["bianffc"]["line1"].length >= 1 && LotteryStorage["bianffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["bianffc"]["line1"],LotteryStorage["bianffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(bianffc_playMethod == 9){
		notes = LotteryStorage["bianffc"]["line1"].length *
			LotteryStorage["bianffc"]["line2"].length *
			LotteryStorage["bianffc"]["line3"].length *
			LotteryStorage["bianffc"]["line4"].length;
	}else if(bianffc_playMethod == 18 || bianffc_playMethod == 29 || bianffc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["bianffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(bianffc_playMethod == 22 || bianffc_playMethod == 33 || bianffc_playMethod == 44 ){
		notes = 54;
	}else if(bianffc_playMethod == 54 || bianffc_playMethod == 61){
		notes = 9;
	}else if(bianffc_playMethod == 51 || bianffc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["bianffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(bianffc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,4);
	}else if(bianffc_playMethod == 13|| bianffc_playMethod == 64 || bianffc_playMethod == 66 || bianffc_playMethod == 68 || bianffc_playMethod == 70 || bianffc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,2);
	}else if(bianffc_playMethod == 37 || bianffc_playMethod == 26 || bianffc_playMethod == 15 || bianffc_playMethod == 75 || bianffc_playMethod == 77){
		notes = LotteryStorage["bianffc"]["line1"].length *
			LotteryStorage["bianffc"]["line2"].length *
			LotteryStorage["bianffc"]["line3"].length ;
	}else if(bianffc_playMethod == 39 || bianffc_playMethod == 28 || bianffc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["bianffc"]["line1"][i]);
		};
	}else if(bianffc_playMethod == 41 || bianffc_playMethod == 30 || bianffc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["bianffc"]["line1"].length,2);
	}else if(bianffc_playMethod == 42 || bianffc_playMethod == 31 || bianffc_playMethod == 20 || bianffc_playMethod == 68 || bianffc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,3);
	}else if(bianffc_playMethod == 43 || bianffc_playMethod == 32 || bianffc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["bianffc"]["line1"][i]);
		};
	}else if(bianffc_playMethod == 48 || bianffc_playMethod == 55 || bianffc_playMethod == 74 || bianffc_playMethod == 76){
		notes = LotteryStorage["bianffc"]["line1"].length *
			LotteryStorage["bianffc"]["line2"].length ;
	}else if(bianffc_playMethod == 50 || bianffc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["bianffc"]["line1"][i]);
		};
	}else if(bianffc_playMethod == 52 || bianffc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,2);
	}else if(bianffc_playMethod == 53 || bianffc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["bianffc"]["line1"][i]);
		};
	}else if(bianffc_playMethod == 62){
		notes = LotteryStorage["bianffc"]["line1"].length +
			LotteryStorage["bianffc"]["line2"].length +
			LotteryStorage["bianffc"]["line3"].length +
			LotteryStorage["bianffc"]["line4"].length +
			LotteryStorage["bianffc"]["line5"].length;
	}else if(bianffc_playType == 13 || bianffc_playType == 14 || bianffc_playType == 16 || bianffc_playMethod == 8 || bianffc_playMethod == 71
		|| bianffc_playMethod == 24 || bianffc_playMethod == 25 || bianffc_playMethod == 35 || bianffc_playMethod == 36 || bianffc_playMethod == 46
		|| bianffc_playMethod == 47 || bianffc_playMethod == 63 || bianffc_playMethod == 65 || bianffc_playMethod == 67 || bianffc_playMethod == 69 ){
		notes = LotteryStorage["bianffc"]["line1"].length ;
	}else if(bianffc_playMethod == 78){
		notes = LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line2"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line3"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line4"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line3"].length +
			LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line4"].length +
			LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line4"].length +
			LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line4"].length * LotteryStorage["bianffc"]["line5"].length;
	}else if (bianffc_playMethod == 80) {
		if ($("#bianffc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["bianffc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,2);
		}
	}else if (bianffc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,2) * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,2);
	}else if (bianffc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["bianffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,2);
	}else if (bianffc_playMethod == 84) {
		notes = LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line3"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line4"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line4"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line4"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line4"].length +
			LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line4"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line4"].length * LotteryStorage["bianffc"]["line5"].length ;
	}else if (bianffc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["bianffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,3);
	}else if (bianffc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["bianffc"]["line1"].length,2) * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,3);
	}else if (bianffc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,3) * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,3);
	}else if (bianffc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["bianffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["bianffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,3);
	}else if (bianffc_playMethod == 93) {
		notes = LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line4"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line4"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line1"].length * LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line4"].length * LotteryStorage["bianffc"]["line5"].length +
			LotteryStorage["bianffc"]["line2"].length * LotteryStorage["bianffc"]["line3"].length * LotteryStorage["bianffc"]["line4"].length * LotteryStorage["bianffc"]["line5"].length;
	}else if (bianffc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,4)
			* mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,4);
	}else if (bianffc_playMethod == 96) {
		if (LotteryStorage["bianffc"]["line1"].length >= 1 && LotteryStorage["bianffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["bianffc"]["line1"],LotteryStorage["bianffc"]["line2"])
				* mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (bianffc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["bianffc"]["line1"].length,2) * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,4);
	}else if (bianffc_playMethod == 98) {
		if (LotteryStorage["bianffc"]["line1"].length >= 1 && LotteryStorage["bianffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["bianffc"]["line1"],LotteryStorage["bianffc"]["line2"]) * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = bianffcValidData($("#bianffc_single").val());
	}

	if(bianffc_sntuo == 3 || bianffc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","bianffc"),LotteryInfo.getMethodId("ssc",bianffc_playMethod))){
	}else{
		if(parseInt($('#bianffc_modeId').val()) == 8){
			$("#bianffc_random").hide();
		}else{
			$("#bianffc_random").show();
		}
	}

	//验证是否为空
	if( $("#bianffc_beiNum").val() =="" || parseInt($("#bianffc_beiNum").val()) == 0){
		$("#bianffc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#bianffc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#bianffc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#bianffc_zhushu').text(notes);
		if($("#bianffc_modeId").val() == "8"){
			$('#bianffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bianffc_beiNum").val()),0.002));
		}else if ($("#bianffc_modeId").val() == "2"){
			$('#bianffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bianffc_beiNum").val()),0.2));
		}else if ($("#bianffc_modeId").val() == "1"){
			$('#bianffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bianffc_beiNum").val()),0.02));
		}else{
			$('#bianffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bianffc_beiNum").val()),2));
		}
	} else {
		$('#bianffc_zhushu').text(0);
		$('#bianffc_money').text(0);
	}
	bianffc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('bianffc',bianffc_playMethod);
}

/**
 * [bianffc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function bianffc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#bianffc_queding").bind('click', function(event) {
		bianffc_rebate = $("#bianffc_fandian option:last").val();
		if(parseInt($('#bianffc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		bianffc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#bianffc_modeId').val()) == 8){
			if (Number($('#bianffc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('bianffc',bianffc_playMethod);

		submitParams.lotteryType = "bianffc";
		var play = LotteryInfo.getPlayName("ssc",bianffc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",bianffc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = bianffc_playType;
		submitParams.playMethodIndex = bianffc_playMethod;
		var selectedBalls = [];
		if(bianffc_playMethod == 0 || bianffc_playMethod == 3 || bianffc_playMethod == 4
			|| bianffc_playMethod == 5 || bianffc_playMethod == 6 || bianffc_playMethod == 7
			|| bianffc_playMethod == 9 || bianffc_playMethod == 12 || bianffc_playMethod == 14
			|| bianffc_playMethod == 37 || bianffc_playMethod == 26 || bianffc_playMethod == 15
			|| bianffc_playMethod == 48 || bianffc_playMethod == 55 || bianffc_playMethod == 74 || bianffc_playType == 9){
			$("#bianffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(bianffc_playMethod == 2 || bianffc_playMethod == 8 || bianffc_playMethod == 11 || bianffc_playMethod == 13 || bianffc_playMethod == 24
			|| bianffc_playMethod == 39 || bianffc_playMethod == 28 || bianffc_playMethod == 17 || bianffc_playMethod == 18 || bianffc_playMethod == 25
			|| bianffc_playMethod == 22 || bianffc_playMethod == 33 || bianffc_playMethod == 44 || bianffc_playMethod == 54 || bianffc_playMethod == 61
			|| bianffc_playMethod == 41 || bianffc_playMethod == 42 || bianffc_playMethod == 43 || bianffc_playMethod == 29 || bianffc_playMethod == 35
			|| bianffc_playMethod == 30 || bianffc_playMethod == 31 || bianffc_playMethod == 32 || bianffc_playMethod == 40 || bianffc_playMethod == 36
			|| bianffc_playMethod == 19 || bianffc_playMethod == 20 || bianffc_playMethod == 21 || bianffc_playMethod == 46 || bianffc_playMethod == 47
			|| bianffc_playMethod == 50 || bianffc_playMethod == 57 || bianffc_playType == 8 || bianffc_playMethod == 51 || bianffc_playMethod == 58
			|| bianffc_playMethod == 52 || bianffc_playMethod == 53|| bianffc_playMethod == 59 || bianffc_playMethod == 60 || bianffc_playType == 13 || bianffc_playType == 14|| bianffc_playType == 16){
			$("#bianffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(bianffc_playType == 7 || bianffc_playMethod == 78 || bianffc_playMethod == 84 || bianffc_playMethod == 93){
			$("#bianffc_ballView div.ballView").each(function(){
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
		}else if(bianffc_playMethod == 80 || bianffc_playMethod == 81 || bianffc_playMethod == 83
			|| bianffc_playMethod == 86 || bianffc_playMethod == 87 || bianffc_playMethod == 89
			|| bianffc_playMethod == 92 || bianffc_playMethod == 95 || bianffc_playMethod == 97){
			$("#bianffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#bianffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#bianffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#bianffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#bianffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#bianffc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (bianffc_playMethod == 96 || bianffc_playMethod == 98) {
			$("#bianffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#bianffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#bianffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#bianffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#bianffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#bianffc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			bianffcValidateData("submit");
			var array = handleSingleStr($("#bianffc_single").val());
			if(bianffc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(bianffc_playMethod == 10 || bianffc_playMethod == 38 || bianffc_playMethod == 27
				|| bianffc_playMethod == 16 || bianffc_playMethod == 49 || bianffc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(bianffc_playMethod == 45 || bianffc_playMethod == 34 || bianffc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(bianffc_playMethod == 79 || bianffc_playMethod == 82 || bianffc_playMethod == 85 || bianffc_playMethod == 88 ||
				bianffc_playMethod == 89 || bianffc_playMethod == 90 || bianffc_playMethod == 91 || bianffc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#bianffc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#bianffc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#bianffc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#bianffc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#bianffc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#bianffc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#bianffc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#bianffc_fandian").val());
		submitParams.notes = $('#bianffc_zhushu').html();
		submitParams.sntuo = bianffc_sntuo;
		submitParams.multiple = $('#bianffc_beiNum').val();  //requirement
		submitParams.rebates = $('#bianffc_fandian').val();  //requirement
		submitParams.playMode = $('#bianffc_modeId').val();  //requirement
		submitParams.money = $('#bianffc_money').html();  //requirement
		submitParams.award = $('#bianffc_minAward').html();  //奖金
		submitParams.maxAward = $('#bianffc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#bianffc_ballView").empty();
		bianffc_qingkongAll();
	});
}

/**
 * [bianffc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function bianffc_randomOne(){
	bianffc_qingkongAll();
	if(bianffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["bianffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["bianffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["bianffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["bianffc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["bianffc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line2"], function(k, v){
			$("#" + "bianffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line3"], function(k, v){
			$("#" + "bianffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line4"], function(k, v){
			$("#" + "bianffc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line5"], function(k, v){
			$("#" + "bianffc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["bianffc"]["line1"].push(number+"");
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["bianffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["bianffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["bianffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["bianffc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line2"], function(k, v){
			$("#" + "bianffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line3"], function(k, v){
			$("#" + "bianffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line4"], function(k, v){
			$("#" + "bianffc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(bianffc_playMethod == 37 || bianffc_playMethod == 26 || bianffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["bianffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["bianffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["bianffc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line2"], function(k, v){
			$("#" + "bianffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line3"], function(k, v){
			$("#" + "bianffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 41 || bianffc_playMethod == 30 || bianffc_playMethod == 19 || bianffc_playMethod == 68
		|| bianffc_playMethod == 52 || bianffc_playMethod == 64 || bianffc_playMethod == 66
		|| bianffc_playMethod == 59 || bianffc_playMethod == 70 || bianffc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["bianffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 42 || bianffc_playMethod == 31 || bianffc_playMethod == 20 || bianffc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["bianffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 39 || bianffc_playMethod == 28 || bianffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["bianffc"]["line1"].push(number+'');
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 43 || bianffc_playMethod == 32 || bianffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["bianffc"]["line1"].push(number+'');
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 48 || bianffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["bianffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["bianffc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line2"], function(k, v){
			$("#" + "bianffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 25 || bianffc_playMethod == 36 || bianffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["bianffc"]["line1"].push(number+"");
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 50 || bianffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["bianffc"]["line1"].push(number+"");
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 53 || bianffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["bianffc"]["line1"].push(number+"");
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["bianffc"]["line"+line].push(number+"");
		$.each(LotteryStorage["bianffc"]["line"+line], function(k, v){
			$("#" + "bianffc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 63 || bianffc_playMethod == 67 || bianffc_playMethod == 69 || bianffc_playMethod == 71 || bianffc_playType == 13
		|| bianffc_playMethod == 65 || bianffc_playMethod == 18 || bianffc_playMethod == 29 || bianffc_playMethod == 40 || bianffc_playMethod == 22
		|| bianffc_playMethod == 33 || bianffc_playMethod == 44 || bianffc_playMethod == 54 || bianffc_playMethod == 61
		|| bianffc_playMethod == 24 || bianffc_playMethod == 35 || bianffc_playMethod == 46 || bianffc_playMethod == 51 || bianffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["bianffc"]["line1"].push(number+'');
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 74 || bianffc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["bianffc"]["line1"].push(array[0]+"");
		LotteryStorage["bianffc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line2"], function(k, v){
			$("#" + "bianffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 75 || bianffc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["bianffc"]["line1"].push(array[0]+"");
		LotteryStorage["bianffc"]["line2"].push(array[1]+"");
		LotteryStorage["bianffc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line2"], function(k, v){
			$("#" + "bianffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line3"], function(k, v){
			$("#" + "bianffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["bianffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["bianffc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["bianffc"]["line"+lines[0]], function(k, v){
			$("#" + "bianffc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line"+lines[1]], function(k, v){
			$("#" + "bianffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["bianffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["bianffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["bianffc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["bianffc"]["line"+lines[0]], function(k, v){
			$("#" + "bianffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line"+lines[1]], function(k, v){
			$("#" + "bianffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line"+lines[0]], function(k, v){
			$("#" + "bianffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["bianffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["bianffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["bianffc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["bianffc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["bianffc"]["line"+lines[0]], function(k, v){
			$("#" + "bianffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line"+lines[1]], function(k, v){
			$("#" + "bianffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line"+lines[2]], function(k, v){
			$("#" + "bianffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["bianffc"]["line"+lines[3]], function(k, v){
			$("#" + "bianffc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(bianffc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["bianffc"]["line1"].push(number+"");
		$.each(LotteryStorage["bianffc"]["line1"], function(k, v){
			$("#" + "bianffc_line1" + v).toggleClass("redBalls_active");
		});
	}
	bianffc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function bianffc_checkOutRandom(playMethod){
	var obj = new Object();
	if(bianffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(bianffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(bianffc_playMethod == 18 || bianffc_playMethod == 29 || bianffc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(bianffc_playMethod == 22 || bianffc_playMethod == 33 || bianffc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(bianffc_playMethod == 54 || bianffc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(bianffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(bianffc_playMethod == 37 || bianffc_playMethod == 26 || bianffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(bianffc_playMethod == 39 || bianffc_playMethod == 28 || bianffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(bianffc_playMethod == 41 || bianffc_playMethod == 30 || bianffc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(bianffc_playMethod == 52 || bianffc_playMethod == 59 || bianffc_playMethod == 64 || bianffc_playMethod == 66 || bianffc_playMethod == 68
		||bianffc_playMethod == 70 || bianffc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(bianffc_playMethod == 42 || bianffc_playMethod == 31 || bianffc_playMethod == 20 || bianffc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(bianffc_playMethod == 43 || bianffc_playMethod == 32 || bianffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(bianffc_playMethod == 48 || bianffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(bianffc_playMethod == 50 || bianffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(bianffc_playMethod == 53 || bianffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(bianffc_playMethod == 62){
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
	}else if(bianffc_playMethod == 63 || bianffc_playMethod == 65 || bianffc_playMethod == 67 || bianffc_playMethod == 69 || bianffc_playMethod == 71
		|| bianffc_playMethod == 24 || bianffc_playMethod == 35 || bianffc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(bianffc_playMethod == 25 || bianffc_playMethod == 36 || bianffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(bianffc_playMethod == 51 || bianffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(bianffc_playMethod == 74 || bianffc_playMethod == 76){
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
	}else if(bianffc_playMethod == 75 || bianffc_playMethod == 77){
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
	}else if(bianffc_playMethod == 78){
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
	}else if(bianffc_playMethod == 84){
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
	}else if(bianffc_playMethod == 93){
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
	obj.sntuo = bianffc_sntuo;
	obj.multiple = 1;
	obj.rebates = bianffc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('bianffc',bianffc_playMethod,obj);  //机选奖金计算
	obj.award = $('#bianffc_minAward').html();     //奖金
	obj.maxAward = $('#bianffc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [bianffcValidateData 单式数据验证]
 */
function bianffcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#bianffc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	bianffcValidData(textStr,type);
}

function bianffcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(bianffc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 38 || bianffc_playMethod == 27 || bianffc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 45 || bianffc_playMethod == 34 || bianffc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 49 || bianffc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,2);
        bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,2);
        bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,3);
        bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,3);
        bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,3);
        bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,3);
        bianffcShowFooter(true,notes);
    }else if(bianffc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#bianffc_tab .button.red").size() ,4);
        bianffcShowFooter(true,notes);
    }

	$('#bianffc_delRepeat').off('click');
	$('#bianffc_delRepeat').on('click',function () {
		content.str = $('#bianffc_single').val() ? $('#bianffc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		bianffcShowFooter(true,notes);
		$("#bianffc_single").val(array.join(" "));
	});

    $("#bianffc_single").val(array.join(" "));
    return notes;
}

function bianffcShowFooter(isValid,notes){
	$('#bianffc_zhushu').text(notes);
	if($("#bianffc_modeId").val() == "8"){
		$('#bianffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bianffc_beiNum").val()),0.002));
	}else if ($("#bianffc_modeId").val() == "2"){
		$('#bianffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bianffc_beiNum").val()),0.2));
	}else if ($("#bianffc_modeId").val() == "1"){
		$('#bianffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bianffc_beiNum").val()),0.02));
	}else{
		$('#bianffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#bianffc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	bianffc_initFooterButton();
	calcAwardWin('bianffc',bianffc_playMethod);  //计算奖金和盈利
}