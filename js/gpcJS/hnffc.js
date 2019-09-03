var hnffc_playType = 2;
var hnffc_playMethod = 15;
var hnffc_sntuo = 0;
var hnffc_rebate;
var hnffcScroll;

//进入这个页面时调用
function hnffcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("hnffc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("hnffc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function hnffcPageUnloadedPanel(){
	$("#hnffc_queding").off('click');
	$("#hnffcPage_back").off('click');
	$("#hnffc_ballView").empty();
	$("#hnffcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hnffcPlaySelect"></select>');
	$("#hnffcSelect").append($select);
}

//入口函数
function hnffc_init(){
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
	$("#hnffc_title").html(LotteryInfo.getLotteryNameByTag("hnffc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == hnffc_playType && j == hnffc_playMethod){
					$play.append('<option value="hnffc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hnffc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(hnffc_playMethod,onShowArray)>-1 ){
						hnffc_playType = i;
						hnffc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#hnffcPlaySelect").append($play);
		}
	}
	
	if($("#hnffcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("hnffcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hnffcChangeItem
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

	GetLotteryInfo("hnffc",function (){
		hnffcChangeItem("hnffc"+hnffc_playMethod);
	});

	//添加滑动条
	if(!hnffcScroll){
		hnffcScroll = new IScroll('#hnffcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("hnffc",LotteryInfo.getLotteryIdByTag("hnffc"));

	//获取上一期开奖
	queryLastPrize("hnffc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('hnffc');

	//机选选号
	$("#hnffc_random").off('click');
	$("#hnffc_random").on('click', function(event) {
		hnffc_randomOne();
	});
	
	$("#hnffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",hnffc_playMethod));
	//玩法说明
	$("#hnffc_paly_shuoming").off('click');
	$("#hnffc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#hnffc_shuoming").text());
	});

	//返回
	$("#hnffcPage_back").on('click', function(event) {
		// hnffc_playType = 2;
		// hnffc_playMethod = 15;
		$("#hnffc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hnffc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("hnffc");//清空
	hnffc_submitData();
}

function hnffcResetPlayType(){
	hnffc_playType = 2;
	hnffc_playMethod = 15;
}

function hnffcChangeItem(val) {
	hnffc_qingkongAll();
	var temp = val.substring("hnffc".length,val.length);
	if(val == "hnffc0"){
		//直选复式
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 0;
		hnffc_playMethod = 0;
		createFiveLineLayout("hnffc", function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc1"){
		//直选单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 0;
		hnffc_playMethod = 1;
		$("#hnffc_ballView").empty();
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc2"){
		//组选120
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 0;
		hnffc_playMethod = 2;
		createOneLineLayout("hnffc","至少选择5个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc3"){
		//组选60
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 0;
		hnffc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc4"){
		//组选30
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 0;
		hnffc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc5"){
		//组选20
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 0;
		hnffc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc6"){
		//组选10
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 0;
		hnffc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc7"){
		//组选5
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 0;
		hnffc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc8"){
		//总和大小单双
		$("#hnffc_random").show();
		var num = ["大","小","单","双"];
		hnffc_sntuo = 0;
		hnffc_playType = 0;
		hnffc_playMethod = 8;
		createNonNumLayout("hnffc",hnffc_playMethod,num,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc9"){
		//直选复式
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 1;
		hnffc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("hnffc",tips, function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc10"){
		//直选单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 1;
		hnffc_playMethod = 10;
		$("#hnffc_ballView").empty();
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc11"){
		//组选24
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 1;
		hnffc_playMethod = 11;
		createOneLineLayout("hnffc","至少选择4个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc12"){
		//组选12
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 1;
		hnffc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc13"){
		//组选6
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 1;
		hnffc_playMethod = 13;
		createOneLineLayout("hnffc","二重号:至少选择2个号码",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc14"){
		//组选4
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 1;
		hnffc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc15"){
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc16"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 2;
		hnffc_playMethod = 16;
		$("#hnffc_ballView").empty();
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc17"){
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 17;
		createSumLayout("hnffc",0,27,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc18"){
		//直选跨度
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 18;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc19"){
		//后三组三
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 19;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc20"){
		//后三组六
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 20;
		createOneLineLayout("hnffc","至少选择3个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc21"){
		//后三和值
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 21;
		createSumLayout("hnffc",1,26,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc22"){
		//后三组选包胆
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 22;
		hnffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnffc",array,["请选择一个号码"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc23"){
		//后三混合组选
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 2;
		hnffc_playMethod = 23;
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc24"){
		//和值尾数
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 24;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc25"){
		//特殊号
		$("#hnffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnffc_sntuo = 0;
		hnffc_playType = 2;
		hnffc_playMethod = 25;
		createNonNumLayout("hnffc",hnffc_playMethod,num,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc26"){
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc27"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 3;
		hnffc_playMethod = 27;
		$("#hnffc_ballView").empty();
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc28"){
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 28;
		createSumLayout("hnffc",0,27,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc29"){
		//直选跨度
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 29;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc30"){
		//中三组三
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 30;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc31"){
		//中三组六
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 31;
		createOneLineLayout("hnffc","至少选择3个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc32"){
		//中三和值
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 32;
		createSumLayout("hnffc",1,26,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc33"){
		//中三组选包胆
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 33;
		hnffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnffc",array,["请选择一个号码"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc34"){
		//中三混合组选
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 3;
		hnffc_playMethod = 34;
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc35"){
		//和值尾数
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 35;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc36"){
		//特殊号
		$("#hnffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnffc_sntuo = 0;
		hnffc_playType = 3;
		hnffc_playMethod = 36;
		createNonNumLayout("hnffc",hnffc_playMethod,num,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc37"){
		//直选复式
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc38"){
		//直选单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 4;
		hnffc_playMethod = 38;
		$("#hnffc_ballView").empty();
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc39"){
		//和值
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 39;
		createSumLayout("hnffc",0,27,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc40"){
		//直选跨度
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 40;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc41"){
		//前三组三
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 41;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc42"){
		//前三组六
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 42;
		createOneLineLayout("hnffc","至少选择3个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc43"){
		//前三和值
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 43;
		createSumLayout("hnffc",1,26,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc44"){
		//前三组选包胆
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 44;
		hnffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnffc",array,["请选择一个号码"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc45"){
		//前三混合组选
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 4;
		hnffc_playMethod = 45;
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc46"){
		//和值尾数
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 46;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc47"){
		//特殊号
		$("#hnffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		hnffc_sntuo = 0;
		hnffc_playType = 4;
		hnffc_playMethod = 47;
		createNonNumLayout("hnffc",hnffc_playMethod,num,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc48"){
		//后二复式
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 5;
		hnffc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc49"){
		//后二单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 5;
		hnffc_playMethod = 49;
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc50"){
		//后二和值
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 5;
		hnffc_playMethod = 50;
		createSumLayout("hnffc",0,18,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc51"){
		//直选跨度
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 5;
		hnffc_playMethod = 51;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc52"){
		//后二组选
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 5;
		hnffc_playMethod = 52;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc53"){
		//后二和值
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 5;
		hnffc_playMethod = 53;
		createSumLayout("hnffc",1,17,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc54"){
		//后二组选包胆
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 5;
		hnffc_playMethod = 54;
		hnffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnffc",array,["请选择一个号码"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc55"){
		//前二复式
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 6;
		hnffc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc56"){
		//前二单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 6;
		hnffc_playMethod = 56;
		hnffc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
	}else if(val == "hnffc57"){
		//前二和值
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 6;
		hnffc_playMethod = 57;
		createSumLayout("hnffc",0,18,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc58"){
		//直选跨度
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 6;
		hnffc_playMethod = 58;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc59"){
		//前二组选
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 6;
		hnffc_playMethod = 59;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc60"){
		//前二和值
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 6;
		hnffc_playMethod = 60;
		createSumLayout("hnffc",1,17,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc61"){
		//前二组选包胆
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 6;
		hnffc_playMethod = 61;
		hnffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("hnffc",array,["请选择一个号码"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc62"){
		//定位复式
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 7;
		hnffc_playMethod = 62;
		createFiveLineLayout("hnffc", function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc63"){
		//后三一码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 63;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc64"){
		//后三二码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 64;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc65"){
		//前三一码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 65;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc66"){
		//前三二码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 66;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc67"){
		//后四一码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 67;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc68"){
		//后四二码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 68;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc69"){
		//前四一码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 69;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc70"){
		//前四二码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 70;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc71"){
		//五星一码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 71;
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc72"){
		//五星二码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 72;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc73"){
		//五星三码
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 8;
		hnffc_playMethod = 73;
		createOneLineLayout("hnffc","至少选择3个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc74"){
		//后二大小单双
		hnffc_qingkongAll();
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 9;
		hnffc_playMethod = 74;
		createTextBallTwoLayout("hnffc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc75"){
		//后三大小单双
		hnffc_qingkongAll();
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 9;
		hnffc_playMethod = 75;
		createTextBallThreeLayout("hnffc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc76"){
		//前二大小单双
		hnffc_qingkongAll();
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 9;
		hnffc_playMethod = 76;
		createTextBallTwoLayout("hnffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc77"){
		//前三大小单双
		hnffc_qingkongAll();
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 9;
		hnffc_playMethod = 77;
		createTextBallThreeLayout("hnffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc78"){
		//直选复式
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 10;
		hnffc_playMethod = 78;
		createFiveLineLayout("hnffc",function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc79"){
		//直选单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 10;
		hnffc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
		createRenXuanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc80"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 10;
		hnffc_playMethod = 80;
		createSumLayout("hnffc",0,18,function(){
			hnffc_calcNotes();
		});
		createRenXuanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc81"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 10;
		hnffc_playMethod = 81;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		createRenXuanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc82"){
		//组选单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 10;
		hnffc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
		createRenXuanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc83"){
		//组选和值
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 10;
		hnffc_playMethod = 83;
		createSumLayout("hnffc",1,17,function(){
			hnffc_calcNotes();
		});
		createRenXuanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc84"){
		//直选复式
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 11;
		hnffc_playMethod = 84;
		createFiveLineLayout("hnffc", function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc85"){
		//直选单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 11;
		hnffc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
		createRenXuanSanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc86"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 11;
		hnffc_playMethod = 86;
		createSumLayout("hnffc",0,27,function(){
			hnffc_calcNotes();
		});
		createRenXuanSanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc87"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 11;
		hnffc_playMethod = 87;
		createOneLineLayout("hnffc","至少选择2个",0,9,false,function(){
			hnffc_calcNotes();
		});
		createRenXuanSanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc88"){
		//组选单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 11;
		hnffc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
		createRenXuanSanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc89"){
		//组选和值
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 11;
		hnffc_playMethod = 89;
		createOneLineLayout("hnffc","至少选择3个",0,9,false,function(){
			hnffc_calcNotes();
		});
		createRenXuanSanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc90"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 11;
		hnffc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
		createRenXuanSanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc91"){
		//混合组选
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 11;
		hnffc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
		createRenXuanSanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc92"){
		//组选和值
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 11;
		hnffc_playMethod = 92;
		createSumLayout("hnffc",1,26,function(){
			hnffc_calcNotes();
		});
		createRenXuanSanLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc93"){
		$("#hnffc_random").show();
		hnffc_sntuo = 0;
		hnffc_playType = 12;
		hnffc_playMethod = 93;
		createFiveLineLayout("hnffc", function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc94"){
		//直选单式
		$("#hnffc_random").hide();
		hnffc_sntuo = 3;
		hnffc_playType = 12;
		hnffc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("hnffc",tips);
		createRenXuanSiLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc95"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 12;
		hnffc_playMethod = 95;
		createOneLineLayout("hnffc","至少选择4个",0,9,false,function(){
			hnffc_calcNotes();
		});
		createRenXuanSiLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc96"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 12;
		hnffc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		createRenXuanSiLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc97"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 12;
		hnffc_playMethod = 97;
		$("#hnffc_ballView").empty();
		createOneLineLayout("hnffc","二重号:至少选择2个号码",0,9,false,function(){
			hnffc_calcNotes();
		});
		createRenXuanSiLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc98"){
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 12;
		hnffc_playMethod = 98;
		$("#hnffc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("hnffc",tips,0,9,false,function(){
			hnffc_calcNotes();
		});
		createRenXuanSiLayout("hnffc",hnffc_playMethod,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc99"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 13;
		hnffc_playMethod = 99;
		$("#hnffc_ballView").empty();
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc100"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 13;
		hnffc_playMethod = 100;
		$("#hnffc_ballView").empty();
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc101"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 13;
		hnffc_playMethod = 101;
		$("#hnffc_ballView").empty();
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc102"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 13;
		hnffc_playMethod = 102;
		$("#hnffc_ballView").empty();
		createOneLineLayout("hnffc","至少选择1个",0,9,false,function(){
			hnffc_calcNotes();
		});
		hnffc_qingkongAll();
	}else if(val == "hnffc103"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 103;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc104"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 104;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc105"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 105;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc106"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 106;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc107"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 107;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc108"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 108;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc109"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 109;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc110"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 110;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc111"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 111;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc112"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 14;
		hnffc_playMethod = 112;
		createTextBallOneLayout("hnffc",["龙","虎","和"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc123"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 123;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc124"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 124;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc125"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 125;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc126"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 126;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc127"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 127;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc128"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 128;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc129"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 129;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc130"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 130;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc131"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 131;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}else if(val == "hnffc132"){
		hnffc_qingkongAll();
		$("#hnffc_random").hide();
		hnffc_sntuo = 0;
		hnffc_playType = 16;
		hnffc_playMethod = 132;
		createTextBallOneLayout("hnffc",["龙","虎"],["至少选择一个"],function(){
			hnffc_calcNotes();
		});
	}

	if(hnffcScroll){
		hnffcScroll.refresh();
		hnffcScroll.scrollTo(0,0,1);
	}
	
	$("#hnffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("hnffc",temp);
	hideRandomWhenLi("hnffc",hnffc_sntuo,hnffc_playMethod);
	hnffc_calcNotes();
}
/**
 * [hnffc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hnffc_initFooterButton(){
	if(hnffc_playMethod == 0 || hnffc_playMethod == 62 || hnffc_playMethod == 78
		|| hnffc_playMethod == 84 || hnffc_playMethod == 93 || hnffc_playType == 7){
		if(LotteryStorage["hnffc"]["line1"].length > 0 || LotteryStorage["hnffc"]["line2"].length > 0 ||
			LotteryStorage["hnffc"]["line3"].length > 0 || LotteryStorage["hnffc"]["line4"].length > 0 ||
			LotteryStorage["hnffc"]["line5"].length > 0){
			$("#hnffc_qingkong").css("opacity",1.0);
		}else{
			$("#hnffc_qingkong").css("opacity",0.4);
		}
	}else if(hnffc_playMethod == 9){
		if(LotteryStorage["hnffc"]["line1"].length > 0 || LotteryStorage["hnffc"]["line2"].length > 0 ||
			LotteryStorage["hnffc"]["line3"].length > 0 || LotteryStorage["hnffc"]["line4"].length > 0 ){
			$("#hnffc_qingkong").css("opacity",1.0);
		}else{
			$("#hnffc_qingkong").css("opacity",0.4);
		}
	}else if(hnffc_playMethod == 37 || hnffc_playMethod == 4 || hnffc_playMethod == 6
		|| hnffc_playMethod == 26 || hnffc_playMethod == 15 || hnffc_playMethod == 75 || hnffc_playMethod == 77){
		if(LotteryStorage["hnffc"]["line1"].length > 0 || LotteryStorage["hnffc"]["line2"].length > 0
			|| LotteryStorage["hnffc"]["line3"].length > 0){
			$("#hnffc_qingkong").css("opacity",1.0);
		}else{
			$("#hnffc_qingkong").css("opacity",0.4);
		}
	}else if(hnffc_playMethod == 3 || hnffc_playMethod == 4 || hnffc_playMethod == 5
		|| hnffc_playMethod == 6 || hnffc_playMethod == 7 || hnffc_playMethod == 12
		|| hnffc_playMethod == 14 || hnffc_playMethod == 48 || hnffc_playMethod == 55
		|| hnffc_playMethod == 74 || hnffc_playMethod == 76 || hnffc_playMethod == 96 || hnffc_playMethod == 98){
		if(LotteryStorage["hnffc"]["line1"].length > 0 || LotteryStorage["hnffc"]["line2"].length > 0){
			$("#hnffc_qingkong").css("opacity",1.0);
		}else{
			$("#hnffc_qingkong").css("opacity",0.4);
		}
	}else if(hnffc_playMethod == 2 || hnffc_playMethod == 8 || hnffc_playMethod == 11 || hnffc_playMethod == 13 || hnffc_playMethod == 39
		|| hnffc_playMethod == 28 || hnffc_playMethod == 17 || hnffc_playMethod == 18 || hnffc_playMethod == 24 || hnffc_playMethod == 41
		|| hnffc_playMethod == 25 || hnffc_playMethod == 29 || hnffc_playMethod == 42 || hnffc_playMethod == 43 || hnffc_playMethod == 30
		|| hnffc_playMethod == 35 || hnffc_playMethod == 36 || hnffc_playMethod == 31 || hnffc_playMethod == 32 || hnffc_playMethod == 19
		|| hnffc_playMethod == 40 || hnffc_playMethod == 46 || hnffc_playMethod == 20 || hnffc_playMethod == 21 || hnffc_playMethod == 50
		|| hnffc_playMethod == 47 || hnffc_playMethod == 51 || hnffc_playMethod == 52 || hnffc_playMethod == 53 || hnffc_playMethod == 57 || hnffc_playMethod == 63
		|| hnffc_playMethod == 58 || hnffc_playMethod == 59 || hnffc_playMethod == 60 || hnffc_playMethod == 65 || hnffc_playMethod == 80 || hnffc_playMethod == 81 || hnffc_playType == 8
		|| hnffc_playMethod == 83 || hnffc_playMethod == 86 || hnffc_playMethod == 87 || hnffc_playMethod == 22 || hnffc_playMethod == 33 || hnffc_playMethod == 44
		|| hnffc_playMethod == 89 || hnffc_playMethod == 92 || hnffc_playMethod == 95 || hnffc_playMethod == 54 || hnffc_playMethod == 61
		|| hnffc_playMethod == 97 || hnffc_playType == 13  || hnffc_playType == 14 || hnffc_playType == 16){
		if(LotteryStorage["hnffc"]["line1"].length > 0){
			$("#hnffc_qingkong").css("opacity",1.0);
		}else{
			$("#hnffc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hnffc_qingkong").css("opacity",0);
	}

	if($("#hnffc_qingkong").css("opacity") == "0"){
		$("#hnffc_qingkong").css("display","none");
	}else{
		$("#hnffc_qingkong").css("display","block");
	}

	if($('#hnffc_zhushu').html() > 0){
		$("#hnffc_queding").css("opacity",1.0);
	}else{
		$("#hnffc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  hnffc_qingkongAll(){
	$("#hnffc_ballView span").removeClass('redBalls_active');
	LotteryStorage["hnffc"]["line1"] = [];
	LotteryStorage["hnffc"]["line2"] = [];
	LotteryStorage["hnffc"]["line3"] = [];
	LotteryStorage["hnffc"]["line4"] = [];
	LotteryStorage["hnffc"]["line5"] = [];

	localStorageUtils.removeParam("hnffc_line1");
	localStorageUtils.removeParam("hnffc_line2");
	localStorageUtils.removeParam("hnffc_line3");
	localStorageUtils.removeParam("hnffc_line4");
	localStorageUtils.removeParam("hnffc_line5");

	$('#hnffc_zhushu').text(0);
	$('#hnffc_money').text(0);
	clearAwardWin("hnffc");
	hnffc_initFooterButton();
}

/**
 * [hnffc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function hnffc_calcNotes(){
	$('#hnffc_modeId').blur();
	$('#hnffc_fandian').blur();
	
	var notes = 0;

	if(hnffc_playMethod == 0){
		notes = LotteryStorage["hnffc"]["line1"].length *
			LotteryStorage["hnffc"]["line2"].length *
			LotteryStorage["hnffc"]["line3"].length *
			LotteryStorage["hnffc"]["line4"].length *
			LotteryStorage["hnffc"]["line5"].length;
	}else if(hnffc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,5);
	}else if(hnffc_playMethod == 3){
		if (LotteryStorage["hnffc"]["line1"].length >= 1 && LotteryStorage["hnffc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["hnffc"]["line1"],LotteryStorage["hnffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnffc_playMethod == 4){
		if (LotteryStorage["hnffc"]["line1"].length >= 2 && LotteryStorage["hnffc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["hnffc"]["line2"],LotteryStorage["hnffc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(hnffc_playMethod == 5 || hnffc_playMethod == 12){
		if (LotteryStorage["hnffc"]["line1"].length >= 1 && LotteryStorage["hnffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["hnffc"]["line1"],LotteryStorage["hnffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnffc_playMethod == 6 || hnffc_playMethod == 7 || hnffc_playMethod == 14){
		if (LotteryStorage["hnffc"]["line1"].length >= 1 && LotteryStorage["hnffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["hnffc"]["line1"],LotteryStorage["hnffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(hnffc_playMethod == 9){
		notes = LotteryStorage["hnffc"]["line1"].length *
			LotteryStorage["hnffc"]["line2"].length *
			LotteryStorage["hnffc"]["line3"].length *
			LotteryStorage["hnffc"]["line4"].length;
	}else if(hnffc_playMethod == 18 || hnffc_playMethod == 29 || hnffc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["hnffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(hnffc_playMethod == 22 || hnffc_playMethod == 33 || hnffc_playMethod == 44 ){
		notes = 54;
	}else if(hnffc_playMethod == 54 || hnffc_playMethod == 61){
		notes = 9;
	}else if(hnffc_playMethod == 51 || hnffc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["hnffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(hnffc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,4);
	}else if(hnffc_playMethod == 13|| hnffc_playMethod == 64 || hnffc_playMethod == 66 || hnffc_playMethod == 68 || hnffc_playMethod == 70 || hnffc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,2);
	}else if(hnffc_playMethod == 37 || hnffc_playMethod == 26 || hnffc_playMethod == 15 || hnffc_playMethod == 75 || hnffc_playMethod == 77){
		notes = LotteryStorage["hnffc"]["line1"].length *
			LotteryStorage["hnffc"]["line2"].length *
			LotteryStorage["hnffc"]["line3"].length ;
	}else if(hnffc_playMethod == 39 || hnffc_playMethod == 28 || hnffc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hnffc"]["line1"][i]);
		};
	}else if(hnffc_playMethod == 41 || hnffc_playMethod == 30 || hnffc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["hnffc"]["line1"].length,2);
	}else if(hnffc_playMethod == 42 || hnffc_playMethod == 31 || hnffc_playMethod == 20 || hnffc_playMethod == 68 || hnffc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,3);
	}else if(hnffc_playMethod == 43 || hnffc_playMethod == 32 || hnffc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hnffc"]["line1"][i]);
		};
	}else if(hnffc_playMethod == 48 || hnffc_playMethod == 55 || hnffc_playMethod == 74 || hnffc_playMethod == 76){
		notes = LotteryStorage["hnffc"]["line1"].length *
			LotteryStorage["hnffc"]["line2"].length ;
	}else if(hnffc_playMethod == 50 || hnffc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hnffc"]["line1"][i]);
		};
	}else if(hnffc_playMethod == 52 || hnffc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,2);
	}else if(hnffc_playMethod == 53 || hnffc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hnffc"]["line1"][i]);
		};
	}else if(hnffc_playMethod == 62){
		notes = LotteryStorage["hnffc"]["line1"].length +
			LotteryStorage["hnffc"]["line2"].length +
			LotteryStorage["hnffc"]["line3"].length +
			LotteryStorage["hnffc"]["line4"].length +
			LotteryStorage["hnffc"]["line5"].length;
	}else if(hnffc_playType == 13 || hnffc_playType == 14 || hnffc_playType == 16 || hnffc_playMethod == 8 || hnffc_playMethod == 71
		|| hnffc_playMethod == 24 || hnffc_playMethod == 25 || hnffc_playMethod == 35 || hnffc_playMethod == 36 || hnffc_playMethod == 46
		|| hnffc_playMethod == 47 || hnffc_playMethod == 63 || hnffc_playMethod == 65 || hnffc_playMethod == 67 || hnffc_playMethod == 69 ){
		notes = LotteryStorage["hnffc"]["line1"].length ;
	}else if(hnffc_playMethod == 78){
		notes = LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line2"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line3"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line4"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line3"].length +
			LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line4"].length +
			LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line4"].length +
			LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line4"].length * LotteryStorage["hnffc"]["line5"].length;
	}else if (hnffc_playMethod == 80) {
		if ($("#hnffc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["hnffc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,2);
		}
	}else if (hnffc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,2) * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,2);
	}else if (hnffc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["hnffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,2);
	}else if (hnffc_playMethod == 84) {
		notes = LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line3"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line4"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line4"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line4"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line4"].length +
			LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line4"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line4"].length * LotteryStorage["hnffc"]["line5"].length ;
	}else if (hnffc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["hnffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,3);
	}else if (hnffc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["hnffc"]["line1"].length,2) * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,3);
	}else if (hnffc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,3) * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,3);
	}else if (hnffc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["hnffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["hnffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,3);
	}else if (hnffc_playMethod == 93) {
		notes = LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line4"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line4"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line1"].length * LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line4"].length * LotteryStorage["hnffc"]["line5"].length +
			LotteryStorage["hnffc"]["line2"].length * LotteryStorage["hnffc"]["line3"].length * LotteryStorage["hnffc"]["line4"].length * LotteryStorage["hnffc"]["line5"].length;
	}else if (hnffc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,4)
			* mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,4);
	}else if (hnffc_playMethod == 96) {
		if (LotteryStorage["hnffc"]["line1"].length >= 1 && LotteryStorage["hnffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["hnffc"]["line1"],LotteryStorage["hnffc"]["line2"])
				* mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (hnffc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["hnffc"]["line1"].length,2) * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,4);
	}else if (hnffc_playMethod == 98) {
		if (LotteryStorage["hnffc"]["line1"].length >= 1 && LotteryStorage["hnffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["hnffc"]["line1"],LotteryStorage["hnffc"]["line2"]) * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = hnffcValidData($("#hnffc_single").val());
	}

	if(hnffc_sntuo == 3 || hnffc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","hnffc"),LotteryInfo.getMethodId("ssc",hnffc_playMethod))){
	}else{
		if(parseInt($('#hnffc_modeId').val()) == 8){
			$("#hnffc_random").hide();
		}else{
			$("#hnffc_random").show();
		}
	}

	//验证是否为空
	if( $("#hnffc_beiNum").val() =="" || parseInt($("#hnffc_beiNum").val()) == 0){
		$("#hnffc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#hnffc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#hnffc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#hnffc_zhushu').text(notes);
		if($("#hnffc_modeId").val() == "8"){
			$('#hnffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnffc_beiNum").val()),0.002));
		}else if ($("#hnffc_modeId").val() == "2"){
			$('#hnffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnffc_beiNum").val()),0.2));
		}else if ($("#hnffc_modeId").val() == "1"){
			$('#hnffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnffc_beiNum").val()),0.02));
		}else{
			$('#hnffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnffc_beiNum").val()),2));
		}
	} else {
		$('#hnffc_zhushu').text(0);
		$('#hnffc_money').text(0);
	}
	hnffc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('hnffc',hnffc_playMethod);
}

/**
 * [hnffc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hnffc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#hnffc_queding").bind('click', function(event) {
		hnffc_rebate = $("#hnffc_fandian option:last").val();
		if(parseInt($('#hnffc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hnffc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#hnffc_modeId').val()) == 8){
			if (Number($('#hnffc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('hnffc',hnffc_playMethod);

		submitParams.lotteryType = "hnffc";
		var play = LotteryInfo.getPlayName("ssc",hnffc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",hnffc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = hnffc_playType;
		submitParams.playMethodIndex = hnffc_playMethod;
		var selectedBalls = [];
		if(hnffc_playMethod == 0 || hnffc_playMethod == 3 || hnffc_playMethod == 4
			|| hnffc_playMethod == 5 || hnffc_playMethod == 6 || hnffc_playMethod == 7
			|| hnffc_playMethod == 9 || hnffc_playMethod == 12 || hnffc_playMethod == 14
			|| hnffc_playMethod == 37 || hnffc_playMethod == 26 || hnffc_playMethod == 15
			|| hnffc_playMethod == 48 || hnffc_playMethod == 55 || hnffc_playMethod == 74 || hnffc_playType == 9){
			$("#hnffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(hnffc_playMethod == 2 || hnffc_playMethod == 8 || hnffc_playMethod == 11 || hnffc_playMethod == 13 || hnffc_playMethod == 24
			|| hnffc_playMethod == 39 || hnffc_playMethod == 28 || hnffc_playMethod == 17 || hnffc_playMethod == 18 || hnffc_playMethod == 25
			|| hnffc_playMethod == 22 || hnffc_playMethod == 33 || hnffc_playMethod == 44 || hnffc_playMethod == 54 || hnffc_playMethod == 61
			|| hnffc_playMethod == 41 || hnffc_playMethod == 42 || hnffc_playMethod == 43 || hnffc_playMethod == 29 || hnffc_playMethod == 35
			|| hnffc_playMethod == 30 || hnffc_playMethod == 31 || hnffc_playMethod == 32 || hnffc_playMethod == 40 || hnffc_playMethod == 36
			|| hnffc_playMethod == 19 || hnffc_playMethod == 20 || hnffc_playMethod == 21 || hnffc_playMethod == 46 || hnffc_playMethod == 47
			|| hnffc_playMethod == 50 || hnffc_playMethod == 57 || hnffc_playType == 8 || hnffc_playMethod == 51 || hnffc_playMethod == 58
			|| hnffc_playMethod == 52 || hnffc_playMethod == 53|| hnffc_playMethod == 59 || hnffc_playMethod == 60 || hnffc_playType == 13 || hnffc_playType == 14|| hnffc_playType == 16){
			$("#hnffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(hnffc_playType == 7 || hnffc_playMethod == 78 || hnffc_playMethod == 84 || hnffc_playMethod == 93){
			$("#hnffc_ballView div.ballView").each(function(){
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
		}else if(hnffc_playMethod == 80 || hnffc_playMethod == 81 || hnffc_playMethod == 83
			|| hnffc_playMethod == 86 || hnffc_playMethod == 87 || hnffc_playMethod == 89
			|| hnffc_playMethod == 92 || hnffc_playMethod == 95 || hnffc_playMethod == 97){
			$("#hnffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#hnffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#hnffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#hnffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#hnffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#hnffc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (hnffc_playMethod == 96 || hnffc_playMethod == 98) {
			$("#hnffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#hnffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#hnffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#hnffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#hnffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#hnffc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			hnffcValidateData("submit");
			var array = handleSingleStr($("#hnffc_single").val());
			if(hnffc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(hnffc_playMethod == 10 || hnffc_playMethod == 38 || hnffc_playMethod == 27
				|| hnffc_playMethod == 16 || hnffc_playMethod == 49 || hnffc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(hnffc_playMethod == 45 || hnffc_playMethod == 34 || hnffc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(hnffc_playMethod == 79 || hnffc_playMethod == 82 || hnffc_playMethod == 85 || hnffc_playMethod == 88 ||
				hnffc_playMethod == 89 || hnffc_playMethod == 90 || hnffc_playMethod == 91 || hnffc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#hnffc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#hnffc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#hnffc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#hnffc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#hnffc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#hnffc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#hnffc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#hnffc_fandian").val());
		submitParams.notes = $('#hnffc_zhushu').html();
		submitParams.sntuo = hnffc_sntuo;
		submitParams.multiple = $('#hnffc_beiNum').val();  //requirement
		submitParams.rebates = $('#hnffc_fandian').val();  //requirement
		submitParams.playMode = $('#hnffc_modeId').val();  //requirement
		submitParams.money = $('#hnffc_money').html();  //requirement
		submitParams.award = $('#hnffc_minAward').html();  //奖金
		submitParams.maxAward = $('#hnffc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#hnffc_ballView").empty();
		hnffc_qingkongAll();
	});
}

/**
 * [hnffc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hnffc_randomOne(){
	hnffc_qingkongAll();
	if(hnffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["hnffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["hnffc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["hnffc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line2"], function(k, v){
			$("#" + "hnffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line3"], function(k, v){
			$("#" + "hnffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line4"], function(k, v){
			$("#" + "hnffc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line5"], function(k, v){
			$("#" + "hnffc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["hnffc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["hnffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["hnffc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line2"], function(k, v){
			$("#" + "hnffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line3"], function(k, v){
			$("#" + "hnffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line4"], function(k, v){
			$("#" + "hnffc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(hnffc_playMethod == 37 || hnffc_playMethod == 26 || hnffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["hnffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["hnffc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line2"], function(k, v){
			$("#" + "hnffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line3"], function(k, v){
			$("#" + "hnffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 41 || hnffc_playMethod == 30 || hnffc_playMethod == 19 || hnffc_playMethod == 68
		|| hnffc_playMethod == 52 || hnffc_playMethod == 64 || hnffc_playMethod == 66
		|| hnffc_playMethod == 59 || hnffc_playMethod == 70 || hnffc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["hnffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 42 || hnffc_playMethod == 31 || hnffc_playMethod == 20 || hnffc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["hnffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 39 || hnffc_playMethod == 28 || hnffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["hnffc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 43 || hnffc_playMethod == 32 || hnffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["hnffc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 48 || hnffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["hnffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["hnffc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line2"], function(k, v){
			$("#" + "hnffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 25 || hnffc_playMethod == 36 || hnffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["hnffc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 50 || hnffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["hnffc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 53 || hnffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["hnffc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["hnffc"]["line"+line].push(number+"");
		$.each(LotteryStorage["hnffc"]["line"+line], function(k, v){
			$("#" + "hnffc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 63 || hnffc_playMethod == 67 || hnffc_playMethod == 69 || hnffc_playMethod == 71 || hnffc_playType == 13
		|| hnffc_playMethod == 65 || hnffc_playMethod == 18 || hnffc_playMethod == 29 || hnffc_playMethod == 40 || hnffc_playMethod == 22
		|| hnffc_playMethod == 33 || hnffc_playMethod == 44 || hnffc_playMethod == 54 || hnffc_playMethod == 61
		|| hnffc_playMethod == 24 || hnffc_playMethod == 35 || hnffc_playMethod == 46 || hnffc_playMethod == 51 || hnffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["hnffc"]["line1"].push(number+'');
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 74 || hnffc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["hnffc"]["line1"].push(array[0]+"");
		LotteryStorage["hnffc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line2"], function(k, v){
			$("#" + "hnffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 75 || hnffc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["hnffc"]["line1"].push(array[0]+"");
		LotteryStorage["hnffc"]["line2"].push(array[1]+"");
		LotteryStorage["hnffc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line2"], function(k, v){
			$("#" + "hnffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line3"], function(k, v){
			$("#" + "hnffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["hnffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnffc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["hnffc"]["line"+lines[0]], function(k, v){
			$("#" + "hnffc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line"+lines[1]], function(k, v){
			$("#" + "hnffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["hnffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["hnffc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["hnffc"]["line"+lines[0]], function(k, v){
			$("#" + "hnffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line"+lines[1]], function(k, v){
			$("#" + "hnffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line"+lines[0]], function(k, v){
			$("#" + "hnffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["hnffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["hnffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["hnffc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["hnffc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["hnffc"]["line"+lines[0]], function(k, v){
			$("#" + "hnffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line"+lines[1]], function(k, v){
			$("#" + "hnffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line"+lines[2]], function(k, v){
			$("#" + "hnffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["hnffc"]["line"+lines[3]], function(k, v){
			$("#" + "hnffc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(hnffc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["hnffc"]["line1"].push(number+"");
		$.each(LotteryStorage["hnffc"]["line1"], function(k, v){
			$("#" + "hnffc_line1" + v).toggleClass("redBalls_active");
		});
	}
	hnffc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function hnffc_checkOutRandom(playMethod){
	var obj = new Object();
	if(hnffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(hnffc_playMethod == 18 || hnffc_playMethod == 29 || hnffc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(hnffc_playMethod == 22 || hnffc_playMethod == 33 || hnffc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(hnffc_playMethod == 54 || hnffc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(hnffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnffc_playMethod == 37 || hnffc_playMethod == 26 || hnffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnffc_playMethod == 39 || hnffc_playMethod == 28 || hnffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(hnffc_playMethod == 41 || hnffc_playMethod == 30 || hnffc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(hnffc_playMethod == 52 || hnffc_playMethod == 59 || hnffc_playMethod == 64 || hnffc_playMethod == 66 || hnffc_playMethod == 68
		||hnffc_playMethod == 70 || hnffc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hnffc_playMethod == 42 || hnffc_playMethod == 31 || hnffc_playMethod == 20 || hnffc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(hnffc_playMethod == 43 || hnffc_playMethod == 32 || hnffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(hnffc_playMethod == 48 || hnffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(hnffc_playMethod == 50 || hnffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(hnffc_playMethod == 53 || hnffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(hnffc_playMethod == 62){
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
	}else if(hnffc_playMethod == 63 || hnffc_playMethod == 65 || hnffc_playMethod == 67 || hnffc_playMethod == 69 || hnffc_playMethod == 71
		|| hnffc_playMethod == 24 || hnffc_playMethod == 35 || hnffc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(hnffc_playMethod == 25 || hnffc_playMethod == 36 || hnffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(hnffc_playMethod == 51 || hnffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(hnffc_playMethod == 74 || hnffc_playMethod == 76){
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
	}else if(hnffc_playMethod == 75 || hnffc_playMethod == 77){
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
	}else if(hnffc_playMethod == 78){
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
	}else if(hnffc_playMethod == 84){
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
	}else if(hnffc_playMethod == 93){
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
	obj.sntuo = hnffc_sntuo;
	obj.multiple = 1;
	obj.rebates = hnffc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('hnffc',hnffc_playMethod,obj);  //机选奖金计算
	obj.award = $('#hnffc_minAward').html();     //奖金
	obj.maxAward = $('#hnffc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [hnffcValidateData 单式数据验证]
 */
function hnffcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#hnffc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	hnffcValidData(textStr,type);
}

function hnffcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(hnffc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 38 || hnffc_playMethod == 27 || hnffc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 45 || hnffc_playMethod == 34 || hnffc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 49 || hnffc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,2);
        hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,2);
        hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,3);
        hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,3);
        hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,3);
        hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,3);
        hnffcShowFooter(true,notes);
    }else if(hnffc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#hnffc_tab .button.red").size() ,4);
        hnffcShowFooter(true,notes);
    }

	$('#hnffc_delRepeat').off('click');
	$('#hnffc_delRepeat').on('click',function () {
		content.str = $('#hnffc_single').val() ? $('#hnffc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		hnffcShowFooter(true,notes);
		$("#hnffc_single").val(array.join(" "));
	});

    $("#hnffc_single").val(array.join(" "));
    return notes;
}

function hnffcShowFooter(isValid,notes){
	$('#hnffc_zhushu').text(notes);
	if($("#hnffc_modeId").val() == "8"){
		$('#hnffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnffc_beiNum").val()),0.002));
	}else if ($("#hnffc_modeId").val() == "2"){
		$('#hnffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnffc_beiNum").val()),0.2));
	}else if ($("#hnffc_modeId").val() == "1"){
		$('#hnffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnffc_beiNum").val()),0.02));
	}else{
		$('#hnffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#hnffc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	hnffc_initFooterButton();
	calcAwardWin('hnffc',hnffc_playMethod);  //计算奖金和盈利
}