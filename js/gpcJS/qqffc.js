var qqffc_playType = 2;
var qqffc_playMethod = 15;
var qqffc_sntuo = 0;
var qqffc_rebate;
var qqffcScroll;

//进入这个页面时调用
function qqffcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("qqffc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("qqffc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function qqffcPageUnloadedPanel(){
	$("#qqffc_queding").off('click');
	$("#qqffcPage_back").off('click');
	$("#qqffc_ballView").empty();
	$("#qqffcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="qqffcPlaySelect"></select>');
	$("#qqffcSelect").append($select);
}

//入口函数
function qqffc_init(){
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
	$("#qqffc_title").html(LotteryInfo.getLotteryNameByTag("qqffc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
      	if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
            
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == qqffc_playType && j == qqffc_playMethod){
					$play.append('<option value="qqffc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="qqffc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(qqffc_playMethod,onShowArray)>-1 ){
						qqffc_playType = i;
						qqffc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#qqffcPlaySelect").append($play);
		}
	}
	
	if($("#qqffcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("qqffcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:qqffcChangeItem
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

	GetLotteryInfo("qqffc",function (){
		qqffcChangeItem("qqffc"+qqffc_playMethod);
	});

	//添加滑动条
	if(!qqffcScroll){
		qqffcScroll = new IScroll('#qqffcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("qqffc",LotteryInfo.getLotteryIdByTag("qqffc"));

	//获取上一期开奖
	queryLastPrize("qqffc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('qqffc');

	//机选选号
	$("#qqffc_random").on('click', function(event) {
		qqffc_randomOne();
	});

	//返回
	$("#qqffcPage_back").on('click', function(event) {
		// qqffc_playType = 2;
		// qqffc_playMethod = 15;
		$("#qqffc_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		qqffc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#qqffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",qqffc_playMethod));
	//玩法说明
	$("#qqffc_paly_shuoming").off('click');
	$("#qqffc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#qqffc_shuoming").text());
	});

	qingKong("qqffc");//清空
	qqffc_submitData();
}

function qqffcResetPlayType(){
	qqffc_playType = 2;
	qqffc_playMethod = 15;
}

function qqffcChangeItem(val) {
	qqffc_qingkongAll();
	var temp = val.substring("qqffc".length,val.length);
	if(val == "qqffc0"){
		//直选复式
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 0;
		qqffc_playMethod = 0;
		createFiveLineLayout("qqffc", function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc1"){
		//直选单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 0;
		qqffc_playMethod = 1;
		$("#qqffc_ballView").empty();
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc2"){
		//组选120
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 0;
		qqffc_playMethod = 2;
		createOneLineLayout("qqffc","至少选择5个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc3"){
		//组选60
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 0;
		qqffc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc4"){
		//组选30
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 0;
		qqffc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc5"){
		//组选20
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 0;
		qqffc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc6"){
		//组选10
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 0;
		qqffc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc7"){
		//组选5
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 0;
		qqffc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc8"){
		//总和大小单双
		$("#qqffc_random").show();
		var num = ["大","小","单","双"];
		qqffc_sntuo = 0;
		qqffc_playType = 0;
		qqffc_playMethod = 8;
		createNonNumLayout("qqffc",qqffc_playMethod,num,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc9"){
		//直选复式
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 1;
		qqffc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("qqffc",tips, function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc10"){
		//直选单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 1;
		qqffc_playMethod = 10;
		$("#qqffc_ballView").empty();
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc11"){
		//组选24
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 1;
		qqffc_playMethod = 11;
		createOneLineLayout("qqffc","至少选择4个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc12"){
		//组选12
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 1;
		qqffc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc13"){
		//组选6
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 1;
		qqffc_playMethod = 13;
		createOneLineLayout("qqffc","二重号:至少选择2个号码",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc14"){
		//组选4
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 1;
		qqffc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc15"){
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc16"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 2;
		qqffc_playMethod = 16;
		$("#qqffc_ballView").empty();
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc17"){
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 17;
		createSumLayout("qqffc",0,27,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc18"){
		//直选跨度
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 18;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc19"){
		//后三组三
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 19;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc20"){
		//后三组六
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 20;
		createOneLineLayout("qqffc","至少选择3个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc21"){
		//后三和值
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 21;
		createSumLayout("qqffc",1,26,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc22"){
		//后三组选包胆
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 22;
		qqffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("qqffc",array,["请选择一个号码"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc23"){
		//后三混合组选
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 2;
		qqffc_playMethod = 23;
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc24"){
		//和值尾数
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 24;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc25"){
		//特殊号
		$("#qqffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		qqffc_sntuo = 0;
		qqffc_playType = 2;
		qqffc_playMethod = 25;
		createNonNumLayout("qqffc",qqffc_playMethod,num,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc26"){
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc27"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 3;
		qqffc_playMethod = 27;
		$("#qqffc_ballView").empty();
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc28"){
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 28;
		createSumLayout("qqffc",0,27,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc29"){
		//直选跨度
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 29;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc30"){
		//中三组三
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 30;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc31"){
		//中三组六
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 31;
		createOneLineLayout("qqffc","至少选择3个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc32"){
		//中三和值
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 32;
		createSumLayout("qqffc",1,26,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc33"){
		//中三组选包胆
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 33;
		qqffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("qqffc",array,["请选择一个号码"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc34"){
		//中三混合组选
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 3;
		qqffc_playMethod = 34;
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc35"){
		//和值尾数
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 35;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc36"){
		//特殊号
		$("#qqffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		qqffc_sntuo = 0;
		qqffc_playType = 3;
		qqffc_playMethod = 36;
		createNonNumLayout("qqffc",qqffc_playMethod,num,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc37"){
		//直选复式
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc38"){
		//直选单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 4;
		qqffc_playMethod = 38;
		$("#qqffc_ballView").empty();
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc39"){
		//和值
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 39;
		createSumLayout("qqffc",0,27,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc40"){
		//直选跨度
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 40;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc41"){
		//前三组三
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 41;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc42"){
		//前三组六
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 42;
		createOneLineLayout("qqffc","至少选择3个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc43"){
		//前三和值
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 43;
		createSumLayout("qqffc",1,26,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc44"){
		//前三组选包胆
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 44;
		qqffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("qqffc",array,["请选择一个号码"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc45"){
		//前三混合组选
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 4;
		qqffc_playMethod = 45;
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc46"){
		//和值尾数
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 46;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc47"){
		//特殊号
		$("#qqffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		qqffc_sntuo = 0;
		qqffc_playType = 4;
		qqffc_playMethod = 47;
		createNonNumLayout("qqffc",qqffc_playMethod,num,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc48"){
		//后二复式
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 5;
		qqffc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc49"){
		//后二单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 5;
		qqffc_playMethod = 49;
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc50"){
		//后二和值
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 5;
		qqffc_playMethod = 50;
		createSumLayout("qqffc",0,18,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc51"){
		//直选跨度
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 5;
		qqffc_playMethod = 51;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc52"){
		//后二组选
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 5;
		qqffc_playMethod = 52;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc53"){
		//后二和值
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 5;
		qqffc_playMethod = 53;
		createSumLayout("qqffc",1,17,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc54"){
		//后二组选包胆
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 5;
		qqffc_playMethod = 54;
		qqffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("qqffc",array,["请选择一个号码"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc55"){
		//前二复式
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 6;
		qqffc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc56"){
		//前二单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 6;
		qqffc_playMethod = 56;
		qqffc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
	}else if(val == "qqffc57"){
		//前二和值
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 6;
		qqffc_playMethod = 57;
		createSumLayout("qqffc",0,18,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc58"){
		//直选跨度
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 6;
		qqffc_playMethod = 58;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc59"){
		//前二组选
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 6;
		qqffc_playMethod = 59;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc60"){
		//前二和值
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 6;
		qqffc_playMethod = 60;
		createSumLayout("qqffc",1,17,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc61"){
		//前二组选包胆
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 6;
		qqffc_playMethod = 61;
		qqffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("qqffc",array,["请选择一个号码"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc62"){
		//定位复式
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 7;
		qqffc_playMethod = 62;
		createFiveLineLayout("qqffc", function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc63"){
		//后三一码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 63;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc64"){
		//后三二码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 64;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc65"){
		//前三一码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 65;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc66"){
		//前三二码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 66;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc67"){
		//后四一码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 67;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc68"){
		//后四二码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 68;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc69"){
		//前四一码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 69;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc70"){
		//前四二码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 70;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc71"){
		//五星一码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 71;
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc72"){
		//五星二码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 72;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc73"){
		//五星三码
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 8;
		qqffc_playMethod = 73;
		createOneLineLayout("qqffc","至少选择3个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc74"){
		//后二大小单双
		qqffc_qingkongAll();
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 9;
		qqffc_playMethod = 74;
		createTextBallTwoLayout("qqffc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc75"){
		//后三大小单双
		qqffc_qingkongAll();
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 9;
		qqffc_playMethod = 75;
		createTextBallThreeLayout("qqffc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc76"){
		//前二大小单双
		qqffc_qingkongAll();
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 9;
		qqffc_playMethod = 76;
		createTextBallTwoLayout("qqffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc77"){
		//前三大小单双
		qqffc_qingkongAll();
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 9;
		qqffc_playMethod = 77;
		createTextBallThreeLayout("qqffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc78"){
		//直选复式
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 10;
		qqffc_playMethod = 78;
		createFiveLineLayout("qqffc",function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc79"){
		//直选单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 10;
		qqffc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
		createRenXuanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc80"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 10;
		qqffc_playMethod = 80;
		createSumLayout("qqffc",0,18,function(){
			qqffc_calcNotes();
		});
		createRenXuanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc81"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 10;
		qqffc_playMethod = 81;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		createRenXuanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc82"){
		//组选单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 10;
		qqffc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
		createRenXuanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc83"){
		//组选和值
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 10;
		qqffc_playMethod = 83;
		createSumLayout("qqffc",1,17,function(){
			qqffc_calcNotes();
		});
		createRenXuanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc84"){
		//直选复式
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 11;
		qqffc_playMethod = 84;
		createFiveLineLayout("qqffc", function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc85"){
		//直选单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 11;
		qqffc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
		createRenXuanSanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc86"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 11;
		qqffc_playMethod = 86;
		createSumLayout("qqffc",0,27,function(){
			qqffc_calcNotes();
		});
		createRenXuanSanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc87"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 11;
		qqffc_playMethod = 87;
		createOneLineLayout("qqffc","至少选择2个",0,9,false,function(){
			qqffc_calcNotes();
		});
		createRenXuanSanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc88"){
		//组选单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 11;
		qqffc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
		createRenXuanSanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc89"){
		//组选和值
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 11;
		qqffc_playMethod = 89;
		createOneLineLayout("qqffc","至少选择3个",0,9,false,function(){
			qqffc_calcNotes();
		});
		createRenXuanSanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc90"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 11;
		qqffc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
		createRenXuanSanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc91"){
		//混合组选
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 11;
		qqffc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
		createRenXuanSanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc92"){
		//组选和值
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 11;
		qqffc_playMethod = 92;
		createSumLayout("qqffc",1,26,function(){
			qqffc_calcNotes();
		});
		createRenXuanSanLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc93"){
		$("#qqffc_random").show();
		qqffc_sntuo = 0;
		qqffc_playType = 12;
		qqffc_playMethod = 93;
		createFiveLineLayout("qqffc", function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc94"){
		//直选单式
		$("#qqffc_random").hide();
		qqffc_sntuo = 3;
		qqffc_playType = 12;
		qqffc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("qqffc",tips);
		createRenXuanSiLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc95"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 12;
		qqffc_playMethod = 95;
		createOneLineLayout("qqffc","至少选择4个",0,9,false,function(){
			qqffc_calcNotes();
		});
		createRenXuanSiLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc96"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 12;
		qqffc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		createRenXuanSiLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc97"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 12;
		qqffc_playMethod = 97;
		$("#qqffc_ballView").empty();
		createOneLineLayout("qqffc","二重号:至少选择2个号码",0,9,false,function(){
			qqffc_calcNotes();
		});
		createRenXuanSiLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc98"){
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 12;
		qqffc_playMethod = 98;
		$("#qqffc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("qqffc",tips,0,9,false,function(){
			qqffc_calcNotes();
		});
		createRenXuanSiLayout("qqffc",qqffc_playMethod,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc99"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 13;
		qqffc_playMethod = 99;
		$("#qqffc_ballView").empty();
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc100"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 13;
		qqffc_playMethod = 100;
		$("#qqffc_ballView").empty();
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc101"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 13;
		qqffc_playMethod = 101;
		$("#qqffc_ballView").empty();
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc102"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 13;
		qqffc_playMethod = 102;
		$("#qqffc_ballView").empty();
		createOneLineLayout("qqffc","至少选择1个",0,9,false,function(){
			qqffc_calcNotes();
		});
		qqffc_qingkongAll();
	}else if(val == "qqffc103"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 103;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc104"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 104;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc105"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 105;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc106"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 106;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc107"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 107;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc108"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 108;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc109"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 109;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc110"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 110;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc111"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 111;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}else if(val == "qqffc112"){
		qqffc_qingkongAll();
		$("#qqffc_random").hide();
		qqffc_sntuo = 0;
		qqffc_playType = 14;
		qqffc_playMethod = 112;
		createTextBallOneLayout("qqffc",["龙","虎","和"],["至少选择一个"],function(){
			qqffc_calcNotes();
		});
	}

	if(qqffcScroll){
		qqffcScroll.refresh();
		qqffcScroll.scrollTo(0,0,1);
	}
	
	$("#qqffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("qqffc",temp);
	hideRandomWhenLi("qqffc",qqffc_sntuo,qqffc_playMethod);
	qqffc_calcNotes();
}
/**
 * [qqffc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function qqffc_initFooterButton(){
	if(qqffc_playMethod == 0 || qqffc_playMethod == 62 || qqffc_playMethod == 78
		|| qqffc_playMethod == 84 || qqffc_playMethod == 93 || qqffc_playType == 7){
		if(LotteryStorage["qqffc"]["line1"].length > 0 || LotteryStorage["qqffc"]["line2"].length > 0 ||
			LotteryStorage["qqffc"]["line3"].length > 0 || LotteryStorage["qqffc"]["line4"].length > 0 ||
			LotteryStorage["qqffc"]["line5"].length > 0){
			$("#qqffc_qingkong").css("opacity",1.0);
		}else{
			$("#qqffc_qingkong").css("opacity",0.4);
		}
	}else if(qqffc_playMethod == 9){
		if(LotteryStorage["qqffc"]["line1"].length > 0 || LotteryStorage["qqffc"]["line2"].length > 0 ||
			LotteryStorage["qqffc"]["line3"].length > 0 || LotteryStorage["qqffc"]["line4"].length > 0 ){
			$("#qqffc_qingkong").css("opacity",1.0);
		}else{
			$("#qqffc_qingkong").css("opacity",0.4);
		}
	}else if(qqffc_playMethod == 37 || qqffc_playMethod == 4 || qqffc_playMethod == 6
		|| qqffc_playMethod == 26 || qqffc_playMethod == 15 || qqffc_playMethod == 75 || qqffc_playMethod == 77){
		if(LotteryStorage["qqffc"]["line1"].length > 0 || LotteryStorage["qqffc"]["line2"].length > 0
			|| LotteryStorage["qqffc"]["line3"].length > 0){
			$("#qqffc_qingkong").css("opacity",1.0);
		}else{
			$("#qqffc_qingkong").css("opacity",0.4);
		}
	}else if(qqffc_playMethod == 3 || qqffc_playMethod == 4 || qqffc_playMethod == 5
		|| qqffc_playMethod == 6 || qqffc_playMethod == 7 || qqffc_playMethod == 12
		|| qqffc_playMethod == 14 || qqffc_playMethod == 48 || qqffc_playMethod == 55
		|| qqffc_playMethod == 74 || qqffc_playMethod == 76 || qqffc_playMethod == 96 || qqffc_playMethod == 98){
		if(LotteryStorage["qqffc"]["line1"].length > 0 || LotteryStorage["qqffc"]["line2"].length > 0){
			$("#qqffc_qingkong").css("opacity",1.0);
		}else{
			$("#qqffc_qingkong").css("opacity",0.4);
		}
	}else if(qqffc_playMethod == 2 || qqffc_playMethod == 8 || qqffc_playMethod == 11 || qqffc_playMethod == 13 || qqffc_playMethod == 39
		|| qqffc_playMethod == 28 || qqffc_playMethod == 17 || qqffc_playMethod == 18 || qqffc_playMethod == 24 || qqffc_playMethod == 41
		|| qqffc_playMethod == 25 || qqffc_playMethod == 29 || qqffc_playMethod == 42 || qqffc_playMethod == 43 || qqffc_playMethod == 30
		|| qqffc_playMethod == 35 || qqffc_playMethod == 36 || qqffc_playMethod == 31 || qqffc_playMethod == 32 || qqffc_playMethod == 19
		|| qqffc_playMethod == 40 || qqffc_playMethod == 46 || qqffc_playMethod == 20 || qqffc_playMethod == 21 || qqffc_playMethod == 50
		|| qqffc_playMethod == 47 || qqffc_playMethod == 51 || qqffc_playMethod == 52 || qqffc_playMethod == 53 || qqffc_playMethod == 57 || qqffc_playMethod == 63
		|| qqffc_playMethod == 58 || qqffc_playMethod == 59 || qqffc_playMethod == 60 || qqffc_playMethod == 65 || qqffc_playMethod == 80 || qqffc_playMethod == 81 || qqffc_playType == 8
		|| qqffc_playMethod == 83 || qqffc_playMethod == 86 || qqffc_playMethod == 87 || qqffc_playMethod == 22 || qqffc_playMethod == 33 || qqffc_playMethod == 44
		|| qqffc_playMethod == 89 || qqffc_playMethod == 92 || qqffc_playMethod == 95 || qqffc_playMethod == 54 || qqffc_playMethod == 61
		|| qqffc_playMethod == 97 || qqffc_playType == 13  || qqffc_playType == 14){
		if(LotteryStorage["qqffc"]["line1"].length > 0){
			$("#qqffc_qingkong").css("opacity",1.0);
		}else{
			$("#qqffc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#qqffc_qingkong").css("opacity",0);
	}

	if($("#qqffc_qingkong").css("opacity") == "0"){
		$("#qqffc_qingkong").css("display","none");
	}else{
		$("#qqffc_qingkong").css("display","block");
	}

	if($('#qqffc_zhushu').html() > 0){
		$("#qqffc_queding").css("opacity",1.0);
	}else{
		$("#qqffc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  qqffc_qingkongAll(){
	$("#qqffc_ballView span").removeClass('redBalls_active');
	LotteryStorage["qqffc"]["line1"] = [];
	LotteryStorage["qqffc"]["line2"] = [];
	LotteryStorage["qqffc"]["line3"] = [];
	LotteryStorage["qqffc"]["line4"] = [];
	LotteryStorage["qqffc"]["line5"] = [];

	localStorageUtils.removeParam("qqffc_line1");
	localStorageUtils.removeParam("qqffc_line2");
	localStorageUtils.removeParam("qqffc_line3");
	localStorageUtils.removeParam("qqffc_line4");
	localStorageUtils.removeParam("qqffc_line5");

	$('#qqffc_zhushu').text(0);
	$('#qqffc_money').text(0);
	clearAwardWin("qqffc");
	qqffc_initFooterButton();
}

/**
 * [qqffc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function qqffc_calcNotes(){
	$('#qqffc_modeId').blur();
	$('#qqffc_fandian').blur();
	
	var notes = 0;

	if(qqffc_playMethod == 0){
		notes = LotteryStorage["qqffc"]["line1"].length *
			LotteryStorage["qqffc"]["line2"].length *
			LotteryStorage["qqffc"]["line3"].length *
			LotteryStorage["qqffc"]["line4"].length *
			LotteryStorage["qqffc"]["line5"].length;
	}else if(qqffc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,5);
	}else if(qqffc_playMethod == 3){
		if (LotteryStorage["qqffc"]["line1"].length >= 1 && LotteryStorage["qqffc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["qqffc"]["line1"],LotteryStorage["qqffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(qqffc_playMethod == 4){
		if (LotteryStorage["qqffc"]["line1"].length >= 2 && LotteryStorage["qqffc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["qqffc"]["line2"],LotteryStorage["qqffc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(qqffc_playMethod == 5 || qqffc_playMethod == 12){
		if (LotteryStorage["qqffc"]["line1"].length >= 1 && LotteryStorage["qqffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["qqffc"]["line1"],LotteryStorage["qqffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(qqffc_playMethod == 6 || qqffc_playMethod == 7 || qqffc_playMethod == 14){
		if (LotteryStorage["qqffc"]["line1"].length >= 1 && LotteryStorage["qqffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["qqffc"]["line1"],LotteryStorage["qqffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(qqffc_playMethod == 9){
		notes = LotteryStorage["qqffc"]["line1"].length *
			LotteryStorage["qqffc"]["line2"].length *
			LotteryStorage["qqffc"]["line3"].length *
			LotteryStorage["qqffc"]["line4"].length;
	}else if(qqffc_playMethod == 18 || qqffc_playMethod == 29 || qqffc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["qqffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(qqffc_playMethod == 22 || qqffc_playMethod == 33 || qqffc_playMethod == 44 ){
		notes = 54;
	}else if(qqffc_playMethod == 54 || qqffc_playMethod == 61){
		notes = 9;
	}else if(qqffc_playMethod == 51 || qqffc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["qqffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(qqffc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,4);
	}else if(qqffc_playMethod == 13|| qqffc_playMethod == 64 || qqffc_playMethod == 66 || qqffc_playMethod == 68 || qqffc_playMethod == 70 || qqffc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,2);
	}else if(qqffc_playMethod == 37 || qqffc_playMethod == 26 || qqffc_playMethod == 15 || qqffc_playMethod == 75 || qqffc_playMethod == 77){
		notes = LotteryStorage["qqffc"]["line1"].length *
			LotteryStorage["qqffc"]["line2"].length *
			LotteryStorage["qqffc"]["line3"].length ;
	}else if(qqffc_playMethod == 39 || qqffc_playMethod == 28 || qqffc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["qqffc"]["line1"][i]);
		};
	}else if(qqffc_playMethod == 41 || qqffc_playMethod == 30 || qqffc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["qqffc"]["line1"].length,2);
	}else if(qqffc_playMethod == 42 || qqffc_playMethod == 31 || qqffc_playMethod == 20 || qqffc_playMethod == 68 || qqffc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,3);
	}else if(qqffc_playMethod == 43 || qqffc_playMethod == 32 || qqffc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["qqffc"]["line1"][i]);
		};
	}else if(qqffc_playMethod == 48 || qqffc_playMethod == 55 || qqffc_playMethod == 74 || qqffc_playMethod == 76){
		notes = LotteryStorage["qqffc"]["line1"].length *
			LotteryStorage["qqffc"]["line2"].length ;
	}else if(qqffc_playMethod == 50 || qqffc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["qqffc"]["line1"][i]);
		};
	}else if(qqffc_playMethod == 52 || qqffc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,2);
	}else if(qqffc_playMethod == 53 || qqffc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["qqffc"]["line1"][i]);
		};
	}else if(qqffc_playMethod == 62){
		notes = LotteryStorage["qqffc"]["line1"].length +
			LotteryStorage["qqffc"]["line2"].length +
			LotteryStorage["qqffc"]["line3"].length +
			LotteryStorage["qqffc"]["line4"].length +
			LotteryStorage["qqffc"]["line5"].length;
	}else if(qqffc_playType == 13 || qqffc_playType == 14 || qqffc_playMethod == 8 || qqffc_playMethod == 71
		|| qqffc_playMethod == 24 || qqffc_playMethod == 25 || qqffc_playMethod == 35 || qqffc_playMethod == 36 || qqffc_playMethod == 46
		|| qqffc_playMethod == 47 || qqffc_playMethod == 63 || qqffc_playMethod == 65 || qqffc_playMethod == 67 || qqffc_playMethod == 69 ){
		notes = LotteryStorage["qqffc"]["line1"].length ;
	}else if(qqffc_playMethod == 78){
		notes = LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line2"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line3"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line4"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line3"].length +
			LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line4"].length +
			LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line4"].length +
			LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line4"].length * LotteryStorage["qqffc"]["line5"].length;
	}else if (qqffc_playMethod == 80) {
		if ($("#qqffc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["qqffc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,2);
		}
	}else if (qqffc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,2) * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,2);
	}else if (qqffc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["qqffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,2);
	}else if (qqffc_playMethod == 84) {
		notes = LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line3"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line4"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line4"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line4"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line4"].length +
			LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line4"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line4"].length * LotteryStorage["qqffc"]["line5"].length ;
	}else if (qqffc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["qqffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,3);
	}else if (qqffc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["qqffc"]["line1"].length,2) * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,3);
	}else if (qqffc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,3) * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,3);
	}else if (qqffc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["qqffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["qqffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,3);
	}else if (qqffc_playMethod == 93) {
		notes = LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line4"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line4"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line1"].length * LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line4"].length * LotteryStorage["qqffc"]["line5"].length +
			LotteryStorage["qqffc"]["line2"].length * LotteryStorage["qqffc"]["line3"].length * LotteryStorage["qqffc"]["line4"].length * LotteryStorage["qqffc"]["line5"].length;
	}else if (qqffc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,4)
			* mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,4);
	}else if (qqffc_playMethod == 96) {
		if (LotteryStorage["qqffc"]["line1"].length >= 1 && LotteryStorage["qqffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["qqffc"]["line1"],LotteryStorage["qqffc"]["line2"])
				* mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (qqffc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["qqffc"]["line1"].length,2) * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,4);
	}else if (qqffc_playMethod == 98) {
		if (LotteryStorage["qqffc"]["line1"].length >= 1 && LotteryStorage["qqffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["qqffc"]["line1"],LotteryStorage["qqffc"]["line2"]) * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = qqffcValidData($("#qqffc_single").val());
	}

	if(qqffc_sntuo == 3 || qqffc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","qqffc"),LotteryInfo.getMethodId("ssc",qqffc_playMethod))){
	}else{
		if(parseInt($('#qqffc_modeId').val()) == 8){
			$("#qqffc_random").hide();
		}else{
			$("#qqffc_random").show();
		}
	}

	//验证是否为空
	if( $("#qqffc_beiNum").val() =="" || parseInt($("#qqffc_beiNum").val()) == 0){
		$("#qqffc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#qqffc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#qqffc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#qqffc_zhushu').text(notes);
		if($("#qqffc_modeId").val() == "8"){
			$('#qqffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#qqffc_beiNum").val()),0.002));
		}else if ($("#qqffc_modeId").val() == "2"){
			$('#qqffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#qqffc_beiNum").val()),0.2));
		}else if ($("#qqffc_modeId").val() == "1"){
			$('#qqffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#qqffc_beiNum").val()),0.02));
		}else{
			$('#qqffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#qqffc_beiNum").val()),2));
		}
	} else {
		$('#qqffc_zhushu').text(0);
		$('#qqffc_money').text(0);
	}
	qqffc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('qqffc',qqffc_playMethod);
}

/**
 * [qqffc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function qqffc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#qqffc_queding").bind('click', function(event) {
		qqffc_rebate = $("#qqffc_fandian option:last").val();
		if(parseInt($('#qqffc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		qqffc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#qqffc_modeId').val()) == 8){
			if (Number($('#qqffc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('qqffc',qqffc_playMethod);

		submitParams.lotteryType = "qqffc";
		var play = LotteryInfo.getPlayName("ssc",qqffc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",qqffc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = qqffc_playType;
		submitParams.playMethodIndex = qqffc_playMethod;
		var selectedBalls = [];
		if(qqffc_playMethod == 0 || qqffc_playMethod == 3 || qqffc_playMethod == 4
			|| qqffc_playMethod == 5 || qqffc_playMethod == 6 || qqffc_playMethod == 7
			|| qqffc_playMethod == 9 || qqffc_playMethod == 12 || qqffc_playMethod == 14
			|| qqffc_playMethod == 37 || qqffc_playMethod == 26 || qqffc_playMethod == 15
			|| qqffc_playMethod == 48 || qqffc_playMethod == 55 || qqffc_playMethod == 74 || qqffc_playType == 9){
			$("#qqffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(qqffc_playMethod == 2 || qqffc_playMethod == 8 || qqffc_playMethod == 11 || qqffc_playMethod == 13 || qqffc_playMethod == 24
			|| qqffc_playMethod == 39 || qqffc_playMethod == 28 || qqffc_playMethod == 17 || qqffc_playMethod == 18 || qqffc_playMethod == 25
			|| qqffc_playMethod == 22 || qqffc_playMethod == 33 || qqffc_playMethod == 44 || qqffc_playMethod == 54 || qqffc_playMethod == 61
			|| qqffc_playMethod == 41 || qqffc_playMethod == 42 || qqffc_playMethod == 43 || qqffc_playMethod == 29 || qqffc_playMethod == 35
			|| qqffc_playMethod == 30 || qqffc_playMethod == 31 || qqffc_playMethod == 32 || qqffc_playMethod == 40 || qqffc_playMethod == 36
			|| qqffc_playMethod == 19 || qqffc_playMethod == 20 || qqffc_playMethod == 21 || qqffc_playMethod == 46 || qqffc_playMethod == 47
			|| qqffc_playMethod == 50 || qqffc_playMethod == 57 || qqffc_playType == 8 || qqffc_playMethod == 51 || qqffc_playMethod == 58
			|| qqffc_playMethod == 52 || qqffc_playMethod == 53|| qqffc_playMethod == 59 || qqffc_playMethod == 60 || qqffc_playType == 13 || qqffc_playType == 14){
			$("#qqffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(qqffc_playType == 7 || qqffc_playMethod == 78 || qqffc_playMethod == 84 || qqffc_playMethod == 93){
			$("#qqffc_ballView div.ballView").each(function(){
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
		}else if(qqffc_playMethod == 80 || qqffc_playMethod == 81 || qqffc_playMethod == 83
			|| qqffc_playMethod == 86 || qqffc_playMethod == 87 || qqffc_playMethod == 89
			|| qqffc_playMethod == 92 || qqffc_playMethod == 95 || qqffc_playMethod == 97){
			$("#qqffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#qqffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#qqffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#qqffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#qqffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#qqffc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (qqffc_playMethod == 96 || qqffc_playMethod == 98) {
			$("#qqffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#qqffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#qqffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#qqffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#qqffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#qqffc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			qqffcValidateData("submit");
			var array = handleSingleStr($("#qqffc_single").val());
			if(qqffc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(qqffc_playMethod == 10 || qqffc_playMethod == 38 || qqffc_playMethod == 27
				|| qqffc_playMethod == 16 || qqffc_playMethod == 49 || qqffc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(qqffc_playMethod == 45 || qqffc_playMethod == 34 || qqffc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(qqffc_playMethod == 79 || qqffc_playMethod == 82 || qqffc_playMethod == 85 || qqffc_playMethod == 88 ||
				qqffc_playMethod == 89 || qqffc_playMethod == 90 || qqffc_playMethod == 91 || qqffc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#qqffc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#qqffc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#qqffc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#qqffc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#qqffc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#qqffc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#qqffc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#qqffc_fandian").val());
		submitParams.notes = $('#qqffc_zhushu').html();
		submitParams.sntuo = qqffc_sntuo;
		submitParams.multiple = $('#qqffc_beiNum').val();  //requirement
		submitParams.rebates = $('#qqffc_fandian').val();  //requirement
		submitParams.playMode = $('#qqffc_modeId').val();  //requirement
		submitParams.money = $('#qqffc_money').html();  //requirement
		submitParams.award = $('#qqffc_minAward').html();  //奖金
		submitParams.maxAward = $('#qqffc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#qqffc_ballView").empty();
		qqffc_qingkongAll();
	});
}

/**
 * [qqffc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function qqffc_randomOne(){
	qqffc_qingkongAll();
	if(qqffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["qqffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["qqffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["qqffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["qqffc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["qqffc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line2"], function(k, v){
			$("#" + "qqffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line3"], function(k, v){
			$("#" + "qqffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line4"], function(k, v){
			$("#" + "qqffc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line5"], function(k, v){
			$("#" + "qqffc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["qqffc"]["line1"].push(number+"");
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["qqffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["qqffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["qqffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["qqffc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line2"], function(k, v){
			$("#" + "qqffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line3"], function(k, v){
			$("#" + "qqffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line4"], function(k, v){
			$("#" + "qqffc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(qqffc_playMethod == 37 || qqffc_playMethod == 26 || qqffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["qqffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["qqffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["qqffc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line2"], function(k, v){
			$("#" + "qqffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line3"], function(k, v){
			$("#" + "qqffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 41 || qqffc_playMethod == 30 || qqffc_playMethod == 19 || qqffc_playMethod == 68
		|| qqffc_playMethod == 52 || qqffc_playMethod == 64 || qqffc_playMethod == 66
		|| qqffc_playMethod == 59 || qqffc_playMethod == 70 || qqffc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["qqffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 42 || qqffc_playMethod == 31 || qqffc_playMethod == 20 || qqffc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["qqffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 39 || qqffc_playMethod == 28 || qqffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["qqffc"]["line1"].push(number+'');
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 43 || qqffc_playMethod == 32 || qqffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["qqffc"]["line1"].push(number+'');
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 48 || qqffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["qqffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["qqffc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line2"], function(k, v){
			$("#" + "qqffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 25 || qqffc_playMethod == 36 || qqffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["qqffc"]["line1"].push(number+"");
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 50 || qqffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["qqffc"]["line1"].push(number+"");
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 53 || qqffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["qqffc"]["line1"].push(number+"");
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["qqffc"]["line"+line].push(number+"");
		$.each(LotteryStorage["qqffc"]["line"+line], function(k, v){
			$("#" + "qqffc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 63 || qqffc_playMethod == 67 || qqffc_playMethod == 69 || qqffc_playMethod == 71 || qqffc_playType == 13
		|| qqffc_playMethod == 65 || qqffc_playMethod == 18 || qqffc_playMethod == 29 || qqffc_playMethod == 40 || qqffc_playMethod == 22
		|| qqffc_playMethod == 33 || qqffc_playMethod == 44 || qqffc_playMethod == 54 || qqffc_playMethod == 61
		|| qqffc_playMethod == 24 || qqffc_playMethod == 35 || qqffc_playMethod == 46 || qqffc_playMethod == 51 || qqffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["qqffc"]["line1"].push(number+'');
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 74 || qqffc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["qqffc"]["line1"].push(array[0]+"");
		LotteryStorage["qqffc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line2"], function(k, v){
			$("#" + "qqffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 75 || qqffc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["qqffc"]["line1"].push(array[0]+"");
		LotteryStorage["qqffc"]["line2"].push(array[1]+"");
		LotteryStorage["qqffc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line2"], function(k, v){
			$("#" + "qqffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line3"], function(k, v){
			$("#" + "qqffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["qqffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["qqffc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["qqffc"]["line"+lines[0]], function(k, v){
			$("#" + "qqffc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line"+lines[1]], function(k, v){
			$("#" + "qqffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["qqffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["qqffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["qqffc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["qqffc"]["line"+lines[0]], function(k, v){
			$("#" + "qqffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line"+lines[1]], function(k, v){
			$("#" + "qqffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line"+lines[0]], function(k, v){
			$("#" + "qqffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["qqffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["qqffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["qqffc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["qqffc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["qqffc"]["line"+lines[0]], function(k, v){
			$("#" + "qqffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line"+lines[1]], function(k, v){
			$("#" + "qqffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line"+lines[2]], function(k, v){
			$("#" + "qqffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["qqffc"]["line"+lines[3]], function(k, v){
			$("#" + "qqffc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(qqffc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["qqffc"]["line1"].push(number+"");
		$.each(LotteryStorage["qqffc"]["line1"], function(k, v){
			$("#" + "qqffc_line1" + v).toggleClass("redBalls_active");
		});
	}
	qqffc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function qqffc_checkOutRandom(playMethod){
	var obj = new Object();
	if(qqffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(qqffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(qqffc_playMethod == 18 || qqffc_playMethod == 29 || qqffc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(qqffc_playMethod == 22 || qqffc_playMethod == 33 || qqffc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(qqffc_playMethod == 54 || qqffc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(qqffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(qqffc_playMethod == 37 || qqffc_playMethod == 26 || qqffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(qqffc_playMethod == 39 || qqffc_playMethod == 28 || qqffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(qqffc_playMethod == 41 || qqffc_playMethod == 30 || qqffc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(qqffc_playMethod == 52 || qqffc_playMethod == 59 || qqffc_playMethod == 64 || qqffc_playMethod == 66 || qqffc_playMethod == 68
		||qqffc_playMethod == 70 || qqffc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(qqffc_playMethod == 42 || qqffc_playMethod == 31 || qqffc_playMethod == 20 || qqffc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(qqffc_playMethod == 43 || qqffc_playMethod == 32 || qqffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(qqffc_playMethod == 48 || qqffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(qqffc_playMethod == 50 || qqffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(qqffc_playMethod == 53 || qqffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(qqffc_playMethod == 62){
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
	}else if(qqffc_playMethod == 63 || qqffc_playMethod == 65 || qqffc_playMethod == 67 || qqffc_playMethod == 69 || qqffc_playMethod == 71
		|| qqffc_playMethod == 24 || qqffc_playMethod == 35 || qqffc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(qqffc_playMethod == 25 || qqffc_playMethod == 36 || qqffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(qqffc_playMethod == 51 || qqffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(qqffc_playMethod == 74 || qqffc_playMethod == 76){
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
	}else if(qqffc_playMethod == 75 || qqffc_playMethod == 77){
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
	}else if(qqffc_playMethod == 78){
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
	}else if(qqffc_playMethod == 84){
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
	}else if(qqffc_playMethod == 93){
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
	obj.sntuo = qqffc_sntuo;
	obj.multiple = 1;
	obj.rebates = qqffc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('qqffc',qqffc_playMethod,obj);  //机选奖金计算
	obj.award = $('#qqffc_minAward').html();     //奖金
	obj.maxAward = $('#qqffc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [qqffcValidateData 单式数据验证]
 */
function qqffcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#qqffc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	qqffcValidData(textStr,type);
}

function qqffcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(qqffc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 38 || qqffc_playMethod == 27 || qqffc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 45 || qqffc_playMethod == 34 || qqffc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 49 || qqffc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,2);
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,2);
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,3);
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,3);
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,3);
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,3);
		qqffcShowFooter(true,notes);
	}else if(qqffc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#qqffc_tab .button.red").size() ,4);
		qqffcShowFooter(true,notes);
	}

	$('#qqffc_delRepeat').off('click');
	$('#qqffc_delRepeat').on('click',function () {
		content.str = $('#qqffc_single').val() ? $('#qqffc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		qqffcShowFooter(true,notes);
		$("#qqffc_single").val(array.join(" "));
	});

	$("#qqffc_single").val(array.join(" "));
	return notes;
}

function qqffcShowFooter(isValid,notes){
	$('#qqffc_zhushu').text(notes);
	if($("#qqffc_modeId").val() == "8"){
		$('#qqffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#qqffc_beiNum").val()),0.002));
	}else if ($("#qqffc_modeId").val() == "2"){
		$('#qqffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#qqffc_beiNum").val()),0.2));
	}else if ($("#qqffc_modeId").val() == "1"){
		$('#qqffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#qqffc_beiNum").val()),0.02));
	}else{
		$('#qqffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#qqffc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	qqffc_initFooterButton();
	calcAwardWin('qqffc',qqffc_playMethod);  //计算奖金和盈利
}