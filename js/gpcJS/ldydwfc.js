var ldydwfc_playType = 2;
var ldydwfc_playMethod = 15;
var ldydwfc_sntuo = 0;
var ldydwfc_rebate;
var ldydwfcScroll;

//进入这个页面时调用
function ldydwfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("ldydwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("ldydwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function ldydwfcPageUnloadedPanel(){
	$("#ldydwfc_queding").off('click');
	$("#ldydwfcPage_back").off('click');
	$("#ldydwfc_ballView").empty();
	$("#ldydwfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="ldydwfcPlaySelect"></select>');
	$("#ldydwfcSelect").append($select);
}

//入口函数
function ldydwfc_init(){
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
	$("#ldydwfc_title").html(LotteryInfo.getLotteryNameByTag("ldydwfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == ldydwfc_playType && j == ldydwfc_playMethod){
					$play.append('<option value="ldydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="ldydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(ldydwfc_playMethod,onShowArray)>-1 ){
						ldydwfc_playType = i;
						ldydwfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#ldydwfcPlaySelect").append($play);
		}
	}
	
	if($("#ldydwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("ldydwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:ldydwfcChangeItem
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

	GetLotteryInfo("ldydwfc",function (){
		ldydwfcChangeItem("ldydwfc"+ldydwfc_playMethod);
	});

	//添加滑动条
	if(!ldydwfcScroll){
		ldydwfcScroll = new IScroll('#ldydwfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("ldydwfc",LotteryInfo.getLotteryIdByTag("ldydwfc"));

	//获取上一期开奖
	queryLastPrize("ldydwfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('ldydwfc');

	//机选选号
	$("#ldydwfc_random").off('click');
	$("#ldydwfc_random").on('click', function(event) {
		ldydwfc_randomOne();
	});

	//返回
	$("#ldydwfcPage_back").on('click', function(event) {
		// ldydwfc_playType = 2;
		// ldydwfc_playMethod = 15;
		$("#ldydwfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		ldydwfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#ldydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",ldydwfc_playMethod));
	//玩法说明
	$("#ldydwfc_paly_shuoming").off('click');
	$("#ldydwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#ldydwfc_shuoming").text());
	});

	qingKong("ldydwfc");//清空
	ldydwfc_submitData();
}

function ldydwfcResetPlayType(){
	ldydwfc_playType = 2;
	ldydwfc_playMethod = 15;
}

function ldydwfcChangeItem(val) {
	ldydwfc_qingkongAll();
	var temp = val.substring("ldydwfc".length,val.length);
	if(val == "ldydwfc0"){
		//直选复式
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 0;
		createFiveLineLayout("ldydwfc", function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc1"){
		//直选单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 1;
		$("#ldydwfc_ballView").empty();
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc2"){
		//组选120
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 2;
		createOneLineLayout("ldydwfc","至少选择5个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc3"){
		//组选60
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc4"){
		//组选30
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc5"){
		//组选20
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc6"){
		//组选10
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc7"){
		//组选5
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc8"){
		//总和大小单双
		$("#ldydwfc_random").show();
		var num = ["大","小","单","双"];
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 0;
		ldydwfc_playMethod = 8;
		createNonNumLayout("ldydwfc",ldydwfc_playMethod,num,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc9"){
		//直选复式
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 1;
		ldydwfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("ldydwfc",tips, function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc10"){
		//直选单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 1;
		ldydwfc_playMethod = 10;
		$("#ldydwfc_ballView").empty();
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc11"){
		//组选24
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 1;
		ldydwfc_playMethod = 11;
		createOneLineLayout("ldydwfc","至少选择4个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc12"){
		//组选12
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 1;
		ldydwfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc13"){
		//组选6
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 1;
		ldydwfc_playMethod = 13;
		createOneLineLayout("ldydwfc","二重号:至少选择2个号码",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc14"){
		//组选4
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 1;
		ldydwfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc15"){
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc16"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 16;
		$("#ldydwfc_ballView").empty();
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc17"){
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 17;
		createSumLayout("ldydwfc",0,27,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc18"){
		//直选跨度
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 18;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc19"){
		//后三组三
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 19;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc20"){
		//后三组六
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 20;
		createOneLineLayout("ldydwfc","至少选择3个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc21"){
		//后三和值
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 21;
		createSumLayout("ldydwfc",1,26,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc22"){
		//后三组选包胆
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 22;
		ldydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("ldydwfc",array,["请选择一个号码"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc23"){
		//后三混合组选
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 23;
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc24"){
		//和值尾数
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 24;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc25"){
		//特殊号
		$("#ldydwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 2;
		ldydwfc_playMethod = 25;
		createNonNumLayout("ldydwfc",ldydwfc_playMethod,num,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc26"){
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc27"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 27;
		$("#ldydwfc_ballView").empty();
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc28"){
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 28;
		createSumLayout("ldydwfc",0,27,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc29"){
		//直选跨度
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 29;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc30"){
		//中三组三
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 30;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc31"){
		//中三组六
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 31;
		createOneLineLayout("ldydwfc","至少选择3个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc32"){
		//中三和值
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 32;
		createSumLayout("ldydwfc",1,26,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc33"){
		//中三组选包胆
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 33;
		ldydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("ldydwfc",array,["请选择一个号码"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc34"){
		//中三混合组选
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 34;
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc35"){
		//和值尾数
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 35;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc36"){
		//特殊号
		$("#ldydwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 3;
		ldydwfc_playMethod = 36;
		createNonNumLayout("ldydwfc",ldydwfc_playMethod,num,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc37"){
		//直选复式
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc38"){
		//直选单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 38;
		$("#ldydwfc_ballView").empty();
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc39"){
		//和值
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 39;
		createSumLayout("ldydwfc",0,27,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc40"){
		//直选跨度
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 40;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc41"){
		//前三组三
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 41;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc42"){
		//前三组六
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 42;
		createOneLineLayout("ldydwfc","至少选择3个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc43"){
		//前三和值
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 43;
		createSumLayout("ldydwfc",1,26,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc44"){
		//前三组选包胆
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 44;
		ldydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("ldydwfc",array,["请选择一个号码"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc45"){
		//前三混合组选
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 45;
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc46"){
		//和值尾数
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 46;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc47"){
		//特殊号
		$("#ldydwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 4;
		ldydwfc_playMethod = 47;
		createNonNumLayout("ldydwfc",ldydwfc_playMethod,num,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc48"){
		//后二复式
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 5;
		ldydwfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc49"){
		//后二单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 5;
		ldydwfc_playMethod = 49;
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc50"){
		//后二和值
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 5;
		ldydwfc_playMethod = 50;
		createSumLayout("ldydwfc",0,18,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc51"){
		//直选跨度
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 5;
		ldydwfc_playMethod = 51;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc52"){
		//后二组选
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 5;
		ldydwfc_playMethod = 52;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc53"){
		//后二和值
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 5;
		ldydwfc_playMethod = 53;
		createSumLayout("ldydwfc",1,17,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc54"){
		//后二组选包胆
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 5;
		ldydwfc_playMethod = 54;
		ldydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("ldydwfc",array,["请选择一个号码"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc55"){
		//前二复式
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 6;
		ldydwfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc56"){
		//前二单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 6;
		ldydwfc_playMethod = 56;
		ldydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
	}else if(val == "ldydwfc57"){
		//前二和值
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 6;
		ldydwfc_playMethod = 57;
		createSumLayout("ldydwfc",0,18,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc58"){
		//直选跨度
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 6;
		ldydwfc_playMethod = 58;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc59"){
		//前二组选
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 6;
		ldydwfc_playMethod = 59;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc60"){
		//前二和值
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 6;
		ldydwfc_playMethod = 60;
		createSumLayout("ldydwfc",1,17,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc61"){
		//前二组选包胆
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 6;
		ldydwfc_playMethod = 61;
		ldydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("ldydwfc",array,["请选择一个号码"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc62"){
		//定位复式
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 7;
		ldydwfc_playMethod = 62;
		createFiveLineLayout("ldydwfc", function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc63"){
		//后三一码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 63;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc64"){
		//后三二码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 64;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc65"){
		//前三一码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 65;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc66"){
		//前三二码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 66;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc67"){
		//后四一码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 67;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc68"){
		//后四二码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 68;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc69"){
		//前四一码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 69;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc70"){
		//前四二码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 70;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc71"){
		//五星一码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 71;
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc72"){
		//五星二码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 72;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc73"){
		//五星三码
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 8;
		ldydwfc_playMethod = 73;
		createOneLineLayout("ldydwfc","至少选择3个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc74"){
		//后二大小单双
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 9;
		ldydwfc_playMethod = 74;
		createTextBallTwoLayout("ldydwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc75"){
		//后三大小单双
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 9;
		ldydwfc_playMethod = 75;
		createTextBallThreeLayout("ldydwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc76"){
		//前二大小单双
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 9;
		ldydwfc_playMethod = 76;
		createTextBallTwoLayout("ldydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc77"){
		//前三大小单双
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 9;
		ldydwfc_playMethod = 77;
		createTextBallThreeLayout("ldydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc78"){
		//直选复式
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 10;
		ldydwfc_playMethod = 78;
		createFiveLineLayout("ldydwfc",function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc79"){
		//直选单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 10;
		ldydwfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
		createRenXuanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc80"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 10;
		ldydwfc_playMethod = 80;
		createSumLayout("ldydwfc",0,18,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc81"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 10;
		ldydwfc_playMethod = 81;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc82"){
		//组选单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 10;
		ldydwfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
		createRenXuanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc83"){
		//组选和值
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 10;
		ldydwfc_playMethod = 83;
		createSumLayout("ldydwfc",1,17,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc84"){
		//直选复式
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 84;
		createFiveLineLayout("ldydwfc", function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc85"){
		//直选单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
		createRenXuanSanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc86"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 86;
		createSumLayout("ldydwfc",0,27,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanSanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc87"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 87;
		createOneLineLayout("ldydwfc","至少选择2个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanSanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc88"){
		//组选单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
		createRenXuanSanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc89"){
		//组选和值
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 89;
		createOneLineLayout("ldydwfc","至少选择3个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanSanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc90"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
		createRenXuanSanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc91"){
		//混合组选
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
		createRenXuanSanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc92"){
		//组选和值
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 11;
		ldydwfc_playMethod = 92;
		createSumLayout("ldydwfc",1,26,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanSanLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc93"){
		$("#ldydwfc_random").show();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 12;
		ldydwfc_playMethod = 93;
		createFiveLineLayout("ldydwfc", function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc94"){
		//直选单式
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 3;
		ldydwfc_playType = 12;
		ldydwfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("ldydwfc",tips);
		createRenXuanSiLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc95"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 12;
		ldydwfc_playMethod = 95;
		createOneLineLayout("ldydwfc","至少选择4个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanSiLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc96"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 12;
		ldydwfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanSiLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc97"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 12;
		ldydwfc_playMethod = 97;
		$("#ldydwfc_ballView").empty();
		createOneLineLayout("ldydwfc","二重号:至少选择2个号码",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanSiLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc98"){
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 12;
		ldydwfc_playMethod = 98;
		$("#ldydwfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("ldydwfc",tips,0,9,false,function(){
			ldydwfc_calcNotes();
		});
		createRenXuanSiLayout("ldydwfc",ldydwfc_playMethod,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc99"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 13;
		ldydwfc_playMethod = 99;
		$("#ldydwfc_ballView").empty();
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc100"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 13;
		ldydwfc_playMethod = 100;
		$("#ldydwfc_ballView").empty();
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc101"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 13;
		ldydwfc_playMethod = 101;
		$("#ldydwfc_ballView").empty();
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc102"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 13;
		ldydwfc_playMethod = 102;
		$("#ldydwfc_ballView").empty();
		createOneLineLayout("ldydwfc","至少选择1个",0,9,false,function(){
			ldydwfc_calcNotes();
		});
		ldydwfc_qingkongAll();
	}else if(val == "ldydwfc103"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 103;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc104"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 104;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc105"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 105;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc106"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 106;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc107"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 107;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc108"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 108;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc109"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 109;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc110"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 110;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc111"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 111;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}else if(val == "ldydwfc112"){
		ldydwfc_qingkongAll();
		$("#ldydwfc_random").hide();
		ldydwfc_sntuo = 0;
		ldydwfc_playType = 14;
		ldydwfc_playMethod = 112;
		createTextBallOneLayout("ldydwfc",["龙","虎","和"],["至少选择一个"],function(){
			ldydwfc_calcNotes();
		});
	}

	if(ldydwfcScroll){
		ldydwfcScroll.refresh();
		ldydwfcScroll.scrollTo(0,0,1);
	}
	
	$("#ldydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("ldydwfc",temp);
	hideRandomWhenLi("ldydwfc",ldydwfc_sntuo,ldydwfc_playMethod);
	ldydwfc_calcNotes();
}
/**
 * [ldydwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function ldydwfc_initFooterButton(){
	if(ldydwfc_playMethod == 0 || ldydwfc_playMethod == 62 || ldydwfc_playMethod == 78
		|| ldydwfc_playMethod == 84 || ldydwfc_playMethod == 93 || ldydwfc_playType == 7){
		if(LotteryStorage["ldydwfc"]["line1"].length > 0 || LotteryStorage["ldydwfc"]["line2"].length > 0 ||
			LotteryStorage["ldydwfc"]["line3"].length > 0 || LotteryStorage["ldydwfc"]["line4"].length > 0 ||
			LotteryStorage["ldydwfc"]["line5"].length > 0){
			$("#ldydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#ldydwfc_qingkong").css("opacity",0.4);
		}
	}else if(ldydwfc_playMethod == 9){
		if(LotteryStorage["ldydwfc"]["line1"].length > 0 || LotteryStorage["ldydwfc"]["line2"].length > 0 ||
			LotteryStorage["ldydwfc"]["line3"].length > 0 || LotteryStorage["ldydwfc"]["line4"].length > 0 ){
			$("#ldydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#ldydwfc_qingkong").css("opacity",0.4);
		}
	}else if(ldydwfc_playMethod == 37 || ldydwfc_playMethod == 4 || ldydwfc_playMethod == 6
		|| ldydwfc_playMethod == 26 || ldydwfc_playMethod == 15 || ldydwfc_playMethod == 75 || ldydwfc_playMethod == 77){
		if(LotteryStorage["ldydwfc"]["line1"].length > 0 || LotteryStorage["ldydwfc"]["line2"].length > 0
			|| LotteryStorage["ldydwfc"]["line3"].length > 0){
			$("#ldydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#ldydwfc_qingkong").css("opacity",0.4);
		}
	}else if(ldydwfc_playMethod == 3 || ldydwfc_playMethod == 4 || ldydwfc_playMethod == 5
		|| ldydwfc_playMethod == 6 || ldydwfc_playMethod == 7 || ldydwfc_playMethod == 12
		|| ldydwfc_playMethod == 14 || ldydwfc_playMethod == 48 || ldydwfc_playMethod == 55
		|| ldydwfc_playMethod == 74 || ldydwfc_playMethod == 76 || ldydwfc_playMethod == 96 || ldydwfc_playMethod == 98){
		if(LotteryStorage["ldydwfc"]["line1"].length > 0 || LotteryStorage["ldydwfc"]["line2"].length > 0){
			$("#ldydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#ldydwfc_qingkong").css("opacity",0.4);
		}
	}else if(ldydwfc_playMethod == 2 || ldydwfc_playMethod == 8 || ldydwfc_playMethod == 11 || ldydwfc_playMethod == 13 || ldydwfc_playMethod == 39
		|| ldydwfc_playMethod == 28 || ldydwfc_playMethod == 17 || ldydwfc_playMethod == 18 || ldydwfc_playMethod == 24 || ldydwfc_playMethod == 41
		|| ldydwfc_playMethod == 25 || ldydwfc_playMethod == 29 || ldydwfc_playMethod == 42 || ldydwfc_playMethod == 43 || ldydwfc_playMethod == 30
		|| ldydwfc_playMethod == 35 || ldydwfc_playMethod == 36 || ldydwfc_playMethod == 31 || ldydwfc_playMethod == 32 || ldydwfc_playMethod == 19
		|| ldydwfc_playMethod == 40 || ldydwfc_playMethod == 46 || ldydwfc_playMethod == 20 || ldydwfc_playMethod == 21 || ldydwfc_playMethod == 50
		|| ldydwfc_playMethod == 47 || ldydwfc_playMethod == 51 || ldydwfc_playMethod == 52 || ldydwfc_playMethod == 53 || ldydwfc_playMethod == 57 || ldydwfc_playMethod == 63
		|| ldydwfc_playMethod == 58 || ldydwfc_playMethod == 59 || ldydwfc_playMethod == 60 || ldydwfc_playMethod == 65 || ldydwfc_playMethod == 80 || ldydwfc_playMethod == 81 || ldydwfc_playType == 8
		|| ldydwfc_playMethod == 83 || ldydwfc_playMethod == 86 || ldydwfc_playMethod == 87 || ldydwfc_playMethod == 22 || ldydwfc_playMethod == 33 || ldydwfc_playMethod == 44
		|| ldydwfc_playMethod == 89 || ldydwfc_playMethod == 92 || ldydwfc_playMethod == 95 || ldydwfc_playMethod == 54 || ldydwfc_playMethod == 61
		|| ldydwfc_playMethod == 97 || ldydwfc_playType == 13  || ldydwfc_playType == 14){
		if(LotteryStorage["ldydwfc"]["line1"].length > 0){
			$("#ldydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#ldydwfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#ldydwfc_qingkong").css("opacity",0);
	}

	if($("#ldydwfc_qingkong").css("opacity") == "0"){
		$("#ldydwfc_qingkong").css("display","none");
	}else{
		$("#ldydwfc_qingkong").css("display","block");
	}

	if($('#ldydwfc_zhushu').html() > 0){
		$("#ldydwfc_queding").css("opacity",1.0);
	}else{
		$("#ldydwfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  ldydwfc_qingkongAll(){
	$("#ldydwfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["ldydwfc"]["line1"] = [];
	LotteryStorage["ldydwfc"]["line2"] = [];
	LotteryStorage["ldydwfc"]["line3"] = [];
	LotteryStorage["ldydwfc"]["line4"] = [];
	LotteryStorage["ldydwfc"]["line5"] = [];

	localStorageUtils.removeParam("ldydwfc_line1");
	localStorageUtils.removeParam("ldydwfc_line2");
	localStorageUtils.removeParam("ldydwfc_line3");
	localStorageUtils.removeParam("ldydwfc_line4");
	localStorageUtils.removeParam("ldydwfc_line5");

	$('#ldydwfc_zhushu').text(0);
	$('#ldydwfc_money').text(0);
	clearAwardWin("ldydwfc");
	ldydwfc_initFooterButton();
}

/**
 * [ldydwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function ldydwfc_calcNotes(){
	$('#ldydwfc_modeId').blur();
	$('#ldydwfc_fandian').blur();
	
	var notes = 0;

	if(ldydwfc_playMethod == 0){
		notes = LotteryStorage["ldydwfc"]["line1"].length *
			LotteryStorage["ldydwfc"]["line2"].length *
			LotteryStorage["ldydwfc"]["line3"].length *
			LotteryStorage["ldydwfc"]["line4"].length *
			LotteryStorage["ldydwfc"]["line5"].length;
	}else if(ldydwfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,5);
	}else if(ldydwfc_playMethod == 3){
		if (LotteryStorage["ldydwfc"]["line1"].length >= 1 && LotteryStorage["ldydwfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["ldydwfc"]["line1"],LotteryStorage["ldydwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(ldydwfc_playMethod == 4){
		if (LotteryStorage["ldydwfc"]["line1"].length >= 2 && LotteryStorage["ldydwfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["ldydwfc"]["line2"],LotteryStorage["ldydwfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(ldydwfc_playMethod == 5 || ldydwfc_playMethod == 12){
		if (LotteryStorage["ldydwfc"]["line1"].length >= 1 && LotteryStorage["ldydwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["ldydwfc"]["line1"],LotteryStorage["ldydwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(ldydwfc_playMethod == 6 || ldydwfc_playMethod == 7 || ldydwfc_playMethod == 14){
		if (LotteryStorage["ldydwfc"]["line1"].length >= 1 && LotteryStorage["ldydwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["ldydwfc"]["line1"],LotteryStorage["ldydwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(ldydwfc_playMethod == 9){
		notes = LotteryStorage["ldydwfc"]["line1"].length *
			LotteryStorage["ldydwfc"]["line2"].length *
			LotteryStorage["ldydwfc"]["line3"].length *
			LotteryStorage["ldydwfc"]["line4"].length;
	}else if(ldydwfc_playMethod == 18 || ldydwfc_playMethod == 29 || ldydwfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["ldydwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(ldydwfc_playMethod == 22 || ldydwfc_playMethod == 33 || ldydwfc_playMethod == 44 ){
		notes = 54;
	}else if(ldydwfc_playMethod == 54 || ldydwfc_playMethod == 61){
		notes = 9;
	}else if(ldydwfc_playMethod == 51 || ldydwfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["ldydwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(ldydwfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,4);
	}else if(ldydwfc_playMethod == 13|| ldydwfc_playMethod == 64 || ldydwfc_playMethod == 66 || ldydwfc_playMethod == 68 || ldydwfc_playMethod == 70 || ldydwfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,2);
	}else if(ldydwfc_playMethod == 37 || ldydwfc_playMethod == 26 || ldydwfc_playMethod == 15 || ldydwfc_playMethod == 75 || ldydwfc_playMethod == 77){
		notes = LotteryStorage["ldydwfc"]["line1"].length *
			LotteryStorage["ldydwfc"]["line2"].length *
			LotteryStorage["ldydwfc"]["line3"].length ;
	}else if(ldydwfc_playMethod == 39 || ldydwfc_playMethod == 28 || ldydwfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["ldydwfc"]["line1"][i]);
		};
	}else if(ldydwfc_playMethod == 41 || ldydwfc_playMethod == 30 || ldydwfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["ldydwfc"]["line1"].length,2);
	}else if(ldydwfc_playMethod == 42 || ldydwfc_playMethod == 31 || ldydwfc_playMethod == 20 || ldydwfc_playMethod == 68 || ldydwfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,3);
	}else if(ldydwfc_playMethod == 43 || ldydwfc_playMethod == 32 || ldydwfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["ldydwfc"]["line1"][i]);
		};
	}else if(ldydwfc_playMethod == 48 || ldydwfc_playMethod == 55 || ldydwfc_playMethod == 74 || ldydwfc_playMethod == 76){
		notes = LotteryStorage["ldydwfc"]["line1"].length *
			LotteryStorage["ldydwfc"]["line2"].length ;
	}else if(ldydwfc_playMethod == 50 || ldydwfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["ldydwfc"]["line1"][i]);
		};
	}else if(ldydwfc_playMethod == 52 || ldydwfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,2);
	}else if(ldydwfc_playMethod == 53 || ldydwfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["ldydwfc"]["line1"][i]);
		};
	}else if(ldydwfc_playMethod == 62){
		notes = LotteryStorage["ldydwfc"]["line1"].length +
			LotteryStorage["ldydwfc"]["line2"].length +
			LotteryStorage["ldydwfc"]["line3"].length +
			LotteryStorage["ldydwfc"]["line4"].length +
			LotteryStorage["ldydwfc"]["line5"].length;
	}else if(ldydwfc_playType == 13 || ldydwfc_playType == 14 || ldydwfc_playMethod == 8 || ldydwfc_playMethod == 71
		|| ldydwfc_playMethod == 24 || ldydwfc_playMethod == 25 || ldydwfc_playMethod == 35 || ldydwfc_playMethod == 36 || ldydwfc_playMethod == 46
		|| ldydwfc_playMethod == 47 || ldydwfc_playMethod == 63 || ldydwfc_playMethod == 65 || ldydwfc_playMethod == 67 || ldydwfc_playMethod == 69 ){
		notes = LotteryStorage["ldydwfc"]["line1"].length ;
	}else if(ldydwfc_playMethod == 78){
		notes = LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line2"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line3"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line4"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line3"].length +
			LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line4"].length +
			LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line4"].length +
			LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line4"].length * LotteryStorage["ldydwfc"]["line5"].length;
	}else if (ldydwfc_playMethod == 80) {
		if ($("#ldydwfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["ldydwfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,2);
		}
	}else if (ldydwfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,2);
	}else if (ldydwfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["ldydwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,2);
	}else if (ldydwfc_playMethod == 84) {
		notes = LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line3"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line4"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line4"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line4"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line4"].length +
			LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line4"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line4"].length * LotteryStorage["ldydwfc"]["line5"].length ;
	}else if (ldydwfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["ldydwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,3);
	}else if (ldydwfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["ldydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,3);
	}else if (ldydwfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,3) * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,3);
	}else if (ldydwfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["ldydwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["ldydwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,3);
	}else if (ldydwfc_playMethod == 93) {
		notes = LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line4"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line4"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line1"].length * LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line4"].length * LotteryStorage["ldydwfc"]["line5"].length +
			LotteryStorage["ldydwfc"]["line2"].length * LotteryStorage["ldydwfc"]["line3"].length * LotteryStorage["ldydwfc"]["line4"].length * LotteryStorage["ldydwfc"]["line5"].length;
	}else if (ldydwfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,4);
	}else if (ldydwfc_playMethod == 96) {
		if (LotteryStorage["ldydwfc"]["line1"].length >= 1 && LotteryStorage["ldydwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["ldydwfc"]["line1"],LotteryStorage["ldydwfc"]["line2"])
				* mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (ldydwfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["ldydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,4);
	}else if (ldydwfc_playMethod == 98) {
		if (LotteryStorage["ldydwfc"]["line1"].length >= 1 && LotteryStorage["ldydwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["ldydwfc"]["line1"],LotteryStorage["ldydwfc"]["line2"]) * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = ldydwfcValidData($("#ldydwfc_single").val());
	}

	if(ldydwfc_sntuo == 3 || ldydwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","ldydwfc"),LotteryInfo.getMethodId("ssc",ldydwfc_playMethod))){
	}else{
		if(parseInt($('#ldydwfc_modeId').val()) == 8){
			$("#ldydwfc_random").hide();
		}else{
			$("#ldydwfc_random").show();
		}
	}

	//验证是否为空
	if( $("#ldydwfc_beiNum").val() =="" || parseInt($("#ldydwfc_beiNum").val()) == 0){
		$("#ldydwfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#ldydwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#ldydwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#ldydwfc_zhushu').text(notes);
		if($("#ldydwfc_modeId").val() == "8"){
			$('#ldydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#ldydwfc_beiNum").val()),0.002));
		}else if ($("#ldydwfc_modeId").val() == "2"){
			$('#ldydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#ldydwfc_beiNum").val()),0.2));
		}else if ($("#ldydwfc_modeId").val() == "1"){
			$('#ldydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#ldydwfc_beiNum").val()),0.02));
		}else{
			$('#ldydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#ldydwfc_beiNum").val()),2));
		}
	} else {
		$('#ldydwfc_zhushu').text(0);
		$('#ldydwfc_money').text(0);
	}
	ldydwfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('ldydwfc',ldydwfc_playMethod);
}

/**
 * [ldydwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function ldydwfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#ldydwfc_queding").bind('click', function(event) {
		ldydwfc_rebate = $("#ldydwfc_fandian option:last").val();
		if(parseInt($('#ldydwfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		ldydwfc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#ldydwfc_modeId').val()) == 8){
			if (Number($('#ldydwfc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('ldydwfc',ldydwfc_playMethod);

		submitParams.lotteryType = "ldydwfc";
		var play = LotteryInfo.getPlayName("ssc",ldydwfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",ldydwfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = ldydwfc_playType;
		submitParams.playMethodIndex = ldydwfc_playMethod;
		var selectedBalls = [];
		if(ldydwfc_playMethod == 0 || ldydwfc_playMethod == 3 || ldydwfc_playMethod == 4
			|| ldydwfc_playMethod == 5 || ldydwfc_playMethod == 6 || ldydwfc_playMethod == 7
			|| ldydwfc_playMethod == 9 || ldydwfc_playMethod == 12 || ldydwfc_playMethod == 14
			|| ldydwfc_playMethod == 37 || ldydwfc_playMethod == 26 || ldydwfc_playMethod == 15
			|| ldydwfc_playMethod == 48 || ldydwfc_playMethod == 55 || ldydwfc_playMethod == 74 || ldydwfc_playType == 9){
			$("#ldydwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(ldydwfc_playMethod == 2 || ldydwfc_playMethod == 8 || ldydwfc_playMethod == 11 || ldydwfc_playMethod == 13 || ldydwfc_playMethod == 24
			|| ldydwfc_playMethod == 39 || ldydwfc_playMethod == 28 || ldydwfc_playMethod == 17 || ldydwfc_playMethod == 18 || ldydwfc_playMethod == 25
			|| ldydwfc_playMethod == 22 || ldydwfc_playMethod == 33 || ldydwfc_playMethod == 44 || ldydwfc_playMethod == 54 || ldydwfc_playMethod == 61
			|| ldydwfc_playMethod == 41 || ldydwfc_playMethod == 42 || ldydwfc_playMethod == 43 || ldydwfc_playMethod == 29 || ldydwfc_playMethod == 35
			|| ldydwfc_playMethod == 30 || ldydwfc_playMethod == 31 || ldydwfc_playMethod == 32 || ldydwfc_playMethod == 40 || ldydwfc_playMethod == 36
			|| ldydwfc_playMethod == 19 || ldydwfc_playMethod == 20 || ldydwfc_playMethod == 21 || ldydwfc_playMethod == 46 || ldydwfc_playMethod == 47
			|| ldydwfc_playMethod == 50 || ldydwfc_playMethod == 57 || ldydwfc_playType == 8 || ldydwfc_playMethod == 51 || ldydwfc_playMethod == 58
			|| ldydwfc_playMethod == 52 || ldydwfc_playMethod == 53|| ldydwfc_playMethod == 59 || ldydwfc_playMethod == 60 || ldydwfc_playType == 13 || ldydwfc_playType == 14){
			$("#ldydwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(ldydwfc_playType == 7 || ldydwfc_playMethod == 78 || ldydwfc_playMethod == 84 || ldydwfc_playMethod == 93){
			$("#ldydwfc_ballView div.ballView").each(function(){
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
		}else if(ldydwfc_playMethod == 80 || ldydwfc_playMethod == 81 || ldydwfc_playMethod == 83
			|| ldydwfc_playMethod == 86 || ldydwfc_playMethod == 87 || ldydwfc_playMethod == 89
			|| ldydwfc_playMethod == 92 || ldydwfc_playMethod == 95 || ldydwfc_playMethod == 97){
			$("#ldydwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#ldydwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#ldydwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#ldydwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#ldydwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#ldydwfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (ldydwfc_playMethod == 96 || ldydwfc_playMethod == 98) {
			$("#ldydwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#ldydwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#ldydwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#ldydwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#ldydwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#ldydwfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			ldydwfcValidateData("submit");
			var array = handleSingleStr($("#ldydwfc_single").val());
			if(ldydwfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(ldydwfc_playMethod == 10 || ldydwfc_playMethod == 38 || ldydwfc_playMethod == 27
				|| ldydwfc_playMethod == 16 || ldydwfc_playMethod == 49 || ldydwfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(ldydwfc_playMethod == 45 || ldydwfc_playMethod == 34 || ldydwfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(ldydwfc_playMethod == 79 || ldydwfc_playMethod == 82 || ldydwfc_playMethod == 85 || ldydwfc_playMethod == 88 ||
				ldydwfc_playMethod == 89 || ldydwfc_playMethod == 90 || ldydwfc_playMethod == 91 || ldydwfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#ldydwfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#ldydwfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#ldydwfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#ldydwfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#ldydwfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#ldydwfc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#ldydwfc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#ldydwfc_fandian").val());
		submitParams.notes = $('#ldydwfc_zhushu').html();
		submitParams.sntuo = ldydwfc_sntuo;
		submitParams.multiple = $('#ldydwfc_beiNum').val();  //requirement
		submitParams.rebates = $('#ldydwfc_fandian').val();  //requirement
		submitParams.playMode = $('#ldydwfc_modeId').val();  //requirement
		submitParams.money = $('#ldydwfc_money').html();  //requirement
		submitParams.award = $('#ldydwfc_minAward').html();  //奖金
		submitParams.maxAward = $('#ldydwfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#ldydwfc_ballView").empty();
		ldydwfc_qingkongAll();
	});
}

/**
 * [ldydwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function ldydwfc_randomOne(){
	ldydwfc_qingkongAll();
	if(ldydwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["ldydwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["ldydwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["ldydwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["ldydwfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["ldydwfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line2"], function(k, v){
			$("#" + "ldydwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line3"], function(k, v){
			$("#" + "ldydwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line4"], function(k, v){
			$("#" + "ldydwfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line5"], function(k, v){
			$("#" + "ldydwfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["ldydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["ldydwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["ldydwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["ldydwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["ldydwfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line2"], function(k, v){
			$("#" + "ldydwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line3"], function(k, v){
			$("#" + "ldydwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line4"], function(k, v){
			$("#" + "ldydwfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(ldydwfc_playMethod == 37 || ldydwfc_playMethod == 26 || ldydwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["ldydwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["ldydwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["ldydwfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line2"], function(k, v){
			$("#" + "ldydwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line3"], function(k, v){
			$("#" + "ldydwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 41 || ldydwfc_playMethod == 30 || ldydwfc_playMethod == 19 || ldydwfc_playMethod == 68
		|| ldydwfc_playMethod == 52 || ldydwfc_playMethod == 64 || ldydwfc_playMethod == 66
		|| ldydwfc_playMethod == 59 || ldydwfc_playMethod == 70 || ldydwfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["ldydwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 42 || ldydwfc_playMethod == 31 || ldydwfc_playMethod == 20 || ldydwfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["ldydwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 39 || ldydwfc_playMethod == 28 || ldydwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["ldydwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 43 || ldydwfc_playMethod == 32 || ldydwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["ldydwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 48 || ldydwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["ldydwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["ldydwfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line2"], function(k, v){
			$("#" + "ldydwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 25 || ldydwfc_playMethod == 36 || ldydwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["ldydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 50 || ldydwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["ldydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 53 || ldydwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["ldydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["ldydwfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["ldydwfc"]["line"+line], function(k, v){
			$("#" + "ldydwfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 63 || ldydwfc_playMethod == 67 || ldydwfc_playMethod == 69 || ldydwfc_playMethod == 71 || ldydwfc_playType == 13
		|| ldydwfc_playMethod == 65 || ldydwfc_playMethod == 18 || ldydwfc_playMethod == 29 || ldydwfc_playMethod == 40 || ldydwfc_playMethod == 22
		|| ldydwfc_playMethod == 33 || ldydwfc_playMethod == 44 || ldydwfc_playMethod == 54 || ldydwfc_playMethod == 61
		|| ldydwfc_playMethod == 24 || ldydwfc_playMethod == 35 || ldydwfc_playMethod == 46 || ldydwfc_playMethod == 51 || ldydwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["ldydwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 74 || ldydwfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["ldydwfc"]["line1"].push(array[0]+"");
		LotteryStorage["ldydwfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line2"], function(k, v){
			$("#" + "ldydwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 75 || ldydwfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["ldydwfc"]["line1"].push(array[0]+"");
		LotteryStorage["ldydwfc"]["line2"].push(array[1]+"");
		LotteryStorage["ldydwfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line2"], function(k, v){
			$("#" + "ldydwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line3"], function(k, v){
			$("#" + "ldydwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["ldydwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["ldydwfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["ldydwfc"]["line"+lines[0]], function(k, v){
			$("#" + "ldydwfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line"+lines[1]], function(k, v){
			$("#" + "ldydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["ldydwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["ldydwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["ldydwfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["ldydwfc"]["line"+lines[0]], function(k, v){
			$("#" + "ldydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line"+lines[1]], function(k, v){
			$("#" + "ldydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line"+lines[0]], function(k, v){
			$("#" + "ldydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["ldydwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["ldydwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["ldydwfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["ldydwfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["ldydwfc"]["line"+lines[0]], function(k, v){
			$("#" + "ldydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line"+lines[1]], function(k, v){
			$("#" + "ldydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line"+lines[2]], function(k, v){
			$("#" + "ldydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["ldydwfc"]["line"+lines[3]], function(k, v){
			$("#" + "ldydwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(ldydwfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["ldydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["ldydwfc"]["line1"], function(k, v){
			$("#" + "ldydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	ldydwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function ldydwfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(ldydwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 18 || ldydwfc_playMethod == 29 || ldydwfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(ldydwfc_playMethod == 22 || ldydwfc_playMethod == 33 || ldydwfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(ldydwfc_playMethod == 54 || ldydwfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(ldydwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 37 || ldydwfc_playMethod == 26 || ldydwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 39 || ldydwfc_playMethod == 28 || ldydwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(ldydwfc_playMethod == 41 || ldydwfc_playMethod == 30 || ldydwfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(ldydwfc_playMethod == 52 || ldydwfc_playMethod == 59 || ldydwfc_playMethod == 64 || ldydwfc_playMethod == 66 || ldydwfc_playMethod == 68
		||ldydwfc_playMethod == 70 || ldydwfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 42 || ldydwfc_playMethod == 31 || ldydwfc_playMethod == 20 || ldydwfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 43 || ldydwfc_playMethod == 32 || ldydwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(ldydwfc_playMethod == 48 || ldydwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 50 || ldydwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(ldydwfc_playMethod == 53 || ldydwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(ldydwfc_playMethod == 62){
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
	}else if(ldydwfc_playMethod == 63 || ldydwfc_playMethod == 65 || ldydwfc_playMethod == 67 || ldydwfc_playMethod == 69 || ldydwfc_playMethod == 71
		|| ldydwfc_playMethod == 24 || ldydwfc_playMethod == 35 || ldydwfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 25 || ldydwfc_playMethod == 36 || ldydwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(ldydwfc_playMethod == 51 || ldydwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(ldydwfc_playMethod == 74 || ldydwfc_playMethod == 76){
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
	}else if(ldydwfc_playMethod == 75 || ldydwfc_playMethod == 77){
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
	}else if(ldydwfc_playMethod == 78){
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
	}else if(ldydwfc_playMethod == 84){
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
	}else if(ldydwfc_playMethod == 93){
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
	obj.sntuo = ldydwfc_sntuo;
	obj.multiple = 1;
	obj.rebates = ldydwfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('ldydwfc',ldydwfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#ldydwfc_minAward').html();     //奖金
	obj.maxAward = $('#ldydwfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [ldydwfcValidateData 单式数据验证]
 */
function ldydwfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#ldydwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	ldydwfcValidData(textStr,type);
}

function ldydwfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(ldydwfc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 38 || ldydwfc_playMethod == 27 || ldydwfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 45 || ldydwfc_playMethod == 34 || ldydwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 49 || ldydwfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,2);
        ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,2);
        ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,3);
        ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,3);
        ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,3);
        ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,3);
        ldydwfcShowFooter(true,notes);
    }else if(ldydwfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#ldydwfc_tab .button.red").size() ,4);
        ldydwfcShowFooter(true,notes);
    }

	$('#ldydwfc_delRepeat').off('click');
	$('#ldydwfc_delRepeat').on('click',function () {
		content.str = $('#ldydwfc_single').val() ? $('#ldydwfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		ldydwfcShowFooter(true,notes);
		$("#ldydwfc_single").val(array.join(" "));
	});

    $("#ldydwfc_single").val(array.join(" "));
    return notes;
}

function ldydwfcShowFooter(isValid,notes){
	$('#ldydwfc_zhushu').text(notes);
	if($("#ldydwfc_modeId").val() == "8"){
		$('#ldydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#ldydwfc_beiNum").val()),0.002));
	}else if ($("#ldydwfc_modeId").val() == "2"){
		$('#ldydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#ldydwfc_beiNum").val()),0.2));
	}else if ($("#ldydwfc_modeId").val() == "1"){
		$('#ldydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#ldydwfc_beiNum").val()),0.02));
	}else{
		$('#ldydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#ldydwfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	ldydwfc_initFooterButton();
	calcAwardWin('ldydwfc',ldydwfc_playMethod);  //计算奖金和盈利
}