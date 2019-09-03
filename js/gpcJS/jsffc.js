var jsffc_playType = 2;
var jsffc_playMethod = 15;
var jsffc_sntuo = 0;
var jsffc_rebate;
var jsffcScroll;

//进入这个页面时调用
function jsffcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("jsffc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("jsffc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function jsffcPageUnloadedPanel(){
	$("#jsffc_queding").off('click');
	$("#jsffcPage_back").off('click');
	$("#jsffc_ballView").empty();
	$("#jsffcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="jsffcPlaySelect"></select>');
	$("#jsffcSelect").append($select);
}

//入口函数
function jsffc_init(){
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
	$("#jsffc_title").html(LotteryInfo.getLotteryNameByTag("jsffc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == jsffc_playType && j == jsffc_playMethod){
					$play.append('<option value="jsffc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="jsffc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(jsffc_playMethod,onShowArray)>-1 ){
						jsffc_playType = i;
						jsffc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#jsffcPlaySelect").append($play);
		}
	}
	
	if($("#jsffcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("jsffcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:jsffcChangeItem
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

	GetLotteryInfo("jsffc",function (){
		jsffcChangeItem("jsffc"+jsffc_playMethod);
	});

	//添加滑动条
	if(!jsffcScroll){
		jsffcScroll = new IScroll('#jsffcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("jsffc",LotteryInfo.getLotteryIdByTag("jsffc"));

	//获取上一期开奖
	queryLastPrize("jsffc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('jsffc');

	//机选选号
	$("#jsffc_random").off('click');
	$("#jsffc_random").on('click', function(event) {
		jsffc_randomOne();
	});
	
	$("#jsffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",jsffc_playMethod));
	//玩法说明
	$("#jsffc_paly_shuoming").off('click');
	$("#jsffc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#jsffc_shuoming").text());
	});

	//返回
	$("#jsffcPage_back").on('click', function(event) {
		// jsffc_playType = 2;
		// jsffc_playMethod = 15;
		$("#jsffc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		jsffc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("jsffc");//清空
	jsffc_submitData();
}

function jsffcResetPlayType(){
	jsffc_playType = 2;
	jsffc_playMethod = 15;
}

function jsffcChangeItem(val) {
	jsffc_qingkongAll();
	var temp = val.substring("jsffc".length,val.length);
	if(val == "jsffc0"){
		//直选复式
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 0;
		jsffc_playMethod = 0;
		createFiveLineLayout("jsffc", function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc1"){
		//直选单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 0;
		jsffc_playMethod = 1;
		$("#jsffc_ballView").empty();
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc2"){
		//组选120
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 0;
		jsffc_playMethod = 2;
		createOneLineLayout("jsffc","至少选择5个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc3"){
		//组选60
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 0;
		jsffc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc4"){
		//组选30
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 0;
		jsffc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc5"){
		//组选20
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 0;
		jsffc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc6"){
		//组选10
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 0;
		jsffc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc7"){
		//组选5
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 0;
		jsffc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc8"){
		//总和大小单双
		$("#jsffc_random").show();
		var num = ["大","小","单","双"];
		jsffc_sntuo = 0;
		jsffc_playType = 0;
		jsffc_playMethod = 8;
		createNonNumLayout("jsffc",jsffc_playMethod,num,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc9"){
		//直选复式
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 1;
		jsffc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("jsffc",tips, function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc10"){
		//直选单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 1;
		jsffc_playMethod = 10;
		$("#jsffc_ballView").empty();
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc11"){
		//组选24
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 1;
		jsffc_playMethod = 11;
		createOneLineLayout("jsffc","至少选择4个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc12"){
		//组选12
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 1;
		jsffc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc13"){
		//组选6
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 1;
		jsffc_playMethod = 13;
		createOneLineLayout("jsffc","二重号:至少选择2个号码",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc14"){
		//组选4
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 1;
		jsffc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc15"){
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc16"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 2;
		jsffc_playMethod = 16;
		$("#jsffc_ballView").empty();
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc17"){
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 17;
		createSumLayout("jsffc",0,27,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc18"){
		//直选跨度
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 18;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc19"){
		//后三组三
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 19;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc20"){
		//后三组六
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 20;
		createOneLineLayout("jsffc","至少选择3个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc21"){
		//后三和值
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 21;
		createSumLayout("jsffc",1,26,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc22"){
		//后三组选包胆
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 22;
		jsffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jsffc",array,["请选择一个号码"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc23"){
		//后三混合组选
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 2;
		jsffc_playMethod = 23;
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc24"){
		//和值尾数
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 24;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc25"){
		//特殊号
		$("#jsffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		jsffc_sntuo = 0;
		jsffc_playType = 2;
		jsffc_playMethod = 25;
		createNonNumLayout("jsffc",jsffc_playMethod,num,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc26"){
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc27"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 3;
		jsffc_playMethod = 27;
		$("#jsffc_ballView").empty();
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc28"){
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 28;
		createSumLayout("jsffc",0,27,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc29"){
		//直选跨度
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 29;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc30"){
		//中三组三
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 30;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc31"){
		//中三组六
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 31;
		createOneLineLayout("jsffc","至少选择3个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc32"){
		//中三和值
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 32;
		createSumLayout("jsffc",1,26,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc33"){
		//中三组选包胆
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 33;
		jsffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jsffc",array,["请选择一个号码"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc34"){
		//中三混合组选
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 3;
		jsffc_playMethod = 34;
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc35"){
		//和值尾数
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 35;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc36"){
		//特殊号
		$("#jsffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		jsffc_sntuo = 0;
		jsffc_playType = 3;
		jsffc_playMethod = 36;
		createNonNumLayout("jsffc",jsffc_playMethod,num,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc37"){
		//直选复式
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc38"){
		//直选单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 4;
		jsffc_playMethod = 38;
		$("#jsffc_ballView").empty();
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc39"){
		//和值
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 39;
		createSumLayout("jsffc",0,27,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc40"){
		//直选跨度
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 40;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc41"){
		//前三组三
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 41;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc42"){
		//前三组六
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 42;
		createOneLineLayout("jsffc","至少选择3个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc43"){
		//前三和值
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 43;
		createSumLayout("jsffc",1,26,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc44"){
		//前三组选包胆
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 44;
		jsffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jsffc",array,["请选择一个号码"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc45"){
		//前三混合组选
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 4;
		jsffc_playMethod = 45;
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc46"){
		//和值尾数
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 46;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc47"){
		//特殊号
		$("#jsffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		jsffc_sntuo = 0;
		jsffc_playType = 4;
		jsffc_playMethod = 47;
		createNonNumLayout("jsffc",jsffc_playMethod,num,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc48"){
		//后二复式
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 5;
		jsffc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc49"){
		//后二单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 5;
		jsffc_playMethod = 49;
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc50"){
		//后二和值
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 5;
		jsffc_playMethod = 50;
		createSumLayout("jsffc",0,18,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc51"){
		//直选跨度
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 5;
		jsffc_playMethod = 51;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc52"){
		//后二组选
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 5;
		jsffc_playMethod = 52;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc53"){
		//后二和值
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 5;
		jsffc_playMethod = 53;
		createSumLayout("jsffc",1,17,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc54"){
		//后二组选包胆
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 5;
		jsffc_playMethod = 54;
		jsffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jsffc",array,["请选择一个号码"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc55"){
		//前二复式
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 6;
		jsffc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc56"){
		//前二单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 6;
		jsffc_playMethod = 56;
		jsffc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
	}else if(val == "jsffc57"){
		//前二和值
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 6;
		jsffc_playMethod = 57;
		createSumLayout("jsffc",0,18,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc58"){
		//直选跨度
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 6;
		jsffc_playMethod = 58;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc59"){
		//前二组选
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 6;
		jsffc_playMethod = 59;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc60"){
		//前二和值
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 6;
		jsffc_playMethod = 60;
		createSumLayout("jsffc",1,17,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc61"){
		//前二组选包胆
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 6;
		jsffc_playMethod = 61;
		jsffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jsffc",array,["请选择一个号码"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc62"){
		//定位复式
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 7;
		jsffc_playMethod = 62;
		createFiveLineLayout("jsffc", function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc63"){
		//后三一码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 63;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc64"){
		//后三二码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 64;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc65"){
		//前三一码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 65;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc66"){
		//前三二码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 66;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc67"){
		//后四一码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 67;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc68"){
		//后四二码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 68;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc69"){
		//前四一码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 69;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc70"){
		//前四二码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 70;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc71"){
		//五星一码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 71;
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc72"){
		//五星二码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 72;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc73"){
		//五星三码
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 8;
		jsffc_playMethod = 73;
		createOneLineLayout("jsffc","至少选择3个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc74"){
		//后二大小单双
		jsffc_qingkongAll();
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 9;
		jsffc_playMethod = 74;
		createTextBallTwoLayout("jsffc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc75"){
		//后三大小单双
		jsffc_qingkongAll();
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 9;
		jsffc_playMethod = 75;
		createTextBallThreeLayout("jsffc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc76"){
		//前二大小单双
		jsffc_qingkongAll();
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 9;
		jsffc_playMethod = 76;
		createTextBallTwoLayout("jsffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc77"){
		//前三大小单双
		jsffc_qingkongAll();
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 9;
		jsffc_playMethod = 77;
		createTextBallThreeLayout("jsffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc78"){
		//直选复式
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 10;
		jsffc_playMethod = 78;
		createFiveLineLayout("jsffc",function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc79"){
		//直选单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 10;
		jsffc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
		createRenXuanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc80"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 10;
		jsffc_playMethod = 80;
		createSumLayout("jsffc",0,18,function(){
			jsffc_calcNotes();
		});
		createRenXuanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc81"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 10;
		jsffc_playMethod = 81;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		createRenXuanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc82"){
		//组选单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 10;
		jsffc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
		createRenXuanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc83"){
		//组选和值
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 10;
		jsffc_playMethod = 83;
		createSumLayout("jsffc",1,17,function(){
			jsffc_calcNotes();
		});
		createRenXuanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc84"){
		//直选复式
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 11;
		jsffc_playMethod = 84;
		createFiveLineLayout("jsffc", function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc85"){
		//直选单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 11;
		jsffc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
		createRenXuanSanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc86"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 11;
		jsffc_playMethod = 86;
		createSumLayout("jsffc",0,27,function(){
			jsffc_calcNotes();
		});
		createRenXuanSanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc87"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 11;
		jsffc_playMethod = 87;
		createOneLineLayout("jsffc","至少选择2个",0,9,false,function(){
			jsffc_calcNotes();
		});
		createRenXuanSanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc88"){
		//组选单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 11;
		jsffc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
		createRenXuanSanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc89"){
		//组选和值
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 11;
		jsffc_playMethod = 89;
		createOneLineLayout("jsffc","至少选择3个",0,9,false,function(){
			jsffc_calcNotes();
		});
		createRenXuanSanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc90"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 11;
		jsffc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
		createRenXuanSanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc91"){
		//混合组选
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 11;
		jsffc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
		createRenXuanSanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc92"){
		//组选和值
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 11;
		jsffc_playMethod = 92;
		createSumLayout("jsffc",1,26,function(){
			jsffc_calcNotes();
		});
		createRenXuanSanLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc93"){
		$("#jsffc_random").show();
		jsffc_sntuo = 0;
		jsffc_playType = 12;
		jsffc_playMethod = 93;
		createFiveLineLayout("jsffc", function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc94"){
		//直选单式
		$("#jsffc_random").hide();
		jsffc_sntuo = 3;
		jsffc_playType = 12;
		jsffc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jsffc",tips);
		createRenXuanSiLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc95"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 12;
		jsffc_playMethod = 95;
		createOneLineLayout("jsffc","至少选择4个",0,9,false,function(){
			jsffc_calcNotes();
		});
		createRenXuanSiLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc96"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 12;
		jsffc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		createRenXuanSiLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc97"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 12;
		jsffc_playMethod = 97;
		$("#jsffc_ballView").empty();
		createOneLineLayout("jsffc","二重号:至少选择2个号码",0,9,false,function(){
			jsffc_calcNotes();
		});
		createRenXuanSiLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc98"){
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 12;
		jsffc_playMethod = 98;
		$("#jsffc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("jsffc",tips,0,9,false,function(){
			jsffc_calcNotes();
		});
		createRenXuanSiLayout("jsffc",jsffc_playMethod,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc99"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 13;
		jsffc_playMethod = 99;
		$("#jsffc_ballView").empty();
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc100"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 13;
		jsffc_playMethod = 100;
		$("#jsffc_ballView").empty();
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc101"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 13;
		jsffc_playMethod = 101;
		$("#jsffc_ballView").empty();
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc102"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 13;
		jsffc_playMethod = 102;
		$("#jsffc_ballView").empty();
		createOneLineLayout("jsffc","至少选择1个",0,9,false,function(){
			jsffc_calcNotes();
		});
		jsffc_qingkongAll();
	}else if(val == "jsffc103"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 103;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc104"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 104;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc105"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 105;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc106"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 106;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc107"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 107;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc108"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 108;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc109"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 109;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc110"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 110;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc111"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 111;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}else if(val == "jsffc112"){
		jsffc_qingkongAll();
		$("#jsffc_random").hide();
		jsffc_sntuo = 0;
		jsffc_playType = 14;
		jsffc_playMethod = 112;
		createTextBallOneLayout("jsffc",["龙","虎","和"],["至少选择一个"],function(){
			jsffc_calcNotes();
		});
	}

	if(jsffcScroll){
		jsffcScroll.refresh();
		jsffcScroll.scrollTo(0,0,1);
	}
	
	$("#jsffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("jsffc",temp);
	hideRandomWhenLi("jsffc",jsffc_sntuo,jsffc_playMethod);
	jsffc_calcNotes();
}
/**
 * [jsffc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function jsffc_initFooterButton(){
	if(jsffc_playMethod == 0 || jsffc_playMethod == 62 || jsffc_playMethod == 78
		|| jsffc_playMethod == 84 || jsffc_playMethod == 93 || jsffc_playType == 7){
		if(LotteryStorage["jsffc"]["line1"].length > 0 || LotteryStorage["jsffc"]["line2"].length > 0 ||
			LotteryStorage["jsffc"]["line3"].length > 0 || LotteryStorage["jsffc"]["line4"].length > 0 ||
			LotteryStorage["jsffc"]["line5"].length > 0){
			$("#jsffc_qingkong").css("opacity",1.0);
		}else{
			$("#jsffc_qingkong").css("opacity",0.4);
		}
	}else if(jsffc_playMethod == 9){
		if(LotteryStorage["jsffc"]["line1"].length > 0 || LotteryStorage["jsffc"]["line2"].length > 0 ||
			LotteryStorage["jsffc"]["line3"].length > 0 || LotteryStorage["jsffc"]["line4"].length > 0 ){
			$("#jsffc_qingkong").css("opacity",1.0);
		}else{
			$("#jsffc_qingkong").css("opacity",0.4);
		}
	}else if(jsffc_playMethod == 37 || jsffc_playMethod == 4 || jsffc_playMethod == 6
		|| jsffc_playMethod == 26 || jsffc_playMethod == 15 || jsffc_playMethod == 75 || jsffc_playMethod == 77){
		if(LotteryStorage["jsffc"]["line1"].length > 0 || LotteryStorage["jsffc"]["line2"].length > 0
			|| LotteryStorage["jsffc"]["line3"].length > 0){
			$("#jsffc_qingkong").css("opacity",1.0);
		}else{
			$("#jsffc_qingkong").css("opacity",0.4);
		}
	}else if(jsffc_playMethod == 3 || jsffc_playMethod == 4 || jsffc_playMethod == 5
		|| jsffc_playMethod == 6 || jsffc_playMethod == 7 || jsffc_playMethod == 12
		|| jsffc_playMethod == 14 || jsffc_playMethod == 48 || jsffc_playMethod == 55
		|| jsffc_playMethod == 74 || jsffc_playMethod == 76 || jsffc_playMethod == 96 || jsffc_playMethod == 98){
		if(LotteryStorage["jsffc"]["line1"].length > 0 || LotteryStorage["jsffc"]["line2"].length > 0){
			$("#jsffc_qingkong").css("opacity",1.0);
		}else{
			$("#jsffc_qingkong").css("opacity",0.4);
		}
	}else if(jsffc_playMethod == 2 || jsffc_playMethod == 8 || jsffc_playMethod == 11 || jsffc_playMethod == 13 || jsffc_playMethod == 39
		|| jsffc_playMethod == 28 || jsffc_playMethod == 17 || jsffc_playMethod == 18 || jsffc_playMethod == 24 || jsffc_playMethod == 41
		|| jsffc_playMethod == 25 || jsffc_playMethod == 29 || jsffc_playMethod == 42 || jsffc_playMethod == 43 || jsffc_playMethod == 30
		|| jsffc_playMethod == 35 || jsffc_playMethod == 36 || jsffc_playMethod == 31 || jsffc_playMethod == 32 || jsffc_playMethod == 19
		|| jsffc_playMethod == 40 || jsffc_playMethod == 46 || jsffc_playMethod == 20 || jsffc_playMethod == 21 || jsffc_playMethod == 50
		|| jsffc_playMethod == 47 || jsffc_playMethod == 51 || jsffc_playMethod == 52 || jsffc_playMethod == 53 || jsffc_playMethod == 57 || jsffc_playMethod == 63
		|| jsffc_playMethod == 58 || jsffc_playMethod == 59 || jsffc_playMethod == 60 || jsffc_playMethod == 65 || jsffc_playMethod == 80 || jsffc_playMethod == 81 || jsffc_playType == 8
		|| jsffc_playMethod == 83 || jsffc_playMethod == 86 || jsffc_playMethod == 87 || jsffc_playMethod == 22 || jsffc_playMethod == 33 || jsffc_playMethod == 44
		|| jsffc_playMethod == 89 || jsffc_playMethod == 92 || jsffc_playMethod == 95 || jsffc_playMethod == 54 || jsffc_playMethod == 61
		|| jsffc_playMethod == 97 || jsffc_playType == 13  || jsffc_playType == 14){
		if(LotteryStorage["jsffc"]["line1"].length > 0){
			$("#jsffc_qingkong").css("opacity",1.0);
		}else{
			$("#jsffc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#jsffc_qingkong").css("opacity",0);
	}

	if($("#jsffc_qingkong").css("opacity") == "0"){
		$("#jsffc_qingkong").css("display","none");
	}else{
		$("#jsffc_qingkong").css("display","block");
	}

	if($('#jsffc_zhushu').html() > 0){
		$("#jsffc_queding").css("opacity",1.0);
	}else{
		$("#jsffc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  jsffc_qingkongAll(){
	$("#jsffc_ballView span").removeClass('redBalls_active');
	LotteryStorage["jsffc"]["line1"] = [];
	LotteryStorage["jsffc"]["line2"] = [];
	LotteryStorage["jsffc"]["line3"] = [];
	LotteryStorage["jsffc"]["line4"] = [];
	LotteryStorage["jsffc"]["line5"] = [];

	localStorageUtils.removeParam("jsffc_line1");
	localStorageUtils.removeParam("jsffc_line2");
	localStorageUtils.removeParam("jsffc_line3");
	localStorageUtils.removeParam("jsffc_line4");
	localStorageUtils.removeParam("jsffc_line5");

	$('#jsffc_zhushu').text(0);
	$('#jsffc_money').text(0);
	clearAwardWin("jsffc");
	jsffc_initFooterButton();
}

/**
 * [jsffc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function jsffc_calcNotes(){
	$('#jsffc_modeId').blur();
	$('#jsffc_fandian').blur();
	
	var notes = 0;

	if(jsffc_playMethod == 0){
		notes = LotteryStorage["jsffc"]["line1"].length *
			LotteryStorage["jsffc"]["line2"].length *
			LotteryStorage["jsffc"]["line3"].length *
			LotteryStorage["jsffc"]["line4"].length *
			LotteryStorage["jsffc"]["line5"].length;
	}else if(jsffc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,5);
	}else if(jsffc_playMethod == 3){
		if (LotteryStorage["jsffc"]["line1"].length >= 1 && LotteryStorage["jsffc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["jsffc"]["line1"],LotteryStorage["jsffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(jsffc_playMethod == 4){
		if (LotteryStorage["jsffc"]["line1"].length >= 2 && LotteryStorage["jsffc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["jsffc"]["line2"],LotteryStorage["jsffc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(jsffc_playMethod == 5 || jsffc_playMethod == 12){
		if (LotteryStorage["jsffc"]["line1"].length >= 1 && LotteryStorage["jsffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["jsffc"]["line1"],LotteryStorage["jsffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(jsffc_playMethod == 6 || jsffc_playMethod == 7 || jsffc_playMethod == 14){
		if (LotteryStorage["jsffc"]["line1"].length >= 1 && LotteryStorage["jsffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["jsffc"]["line1"],LotteryStorage["jsffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(jsffc_playMethod == 9){
		notes = LotteryStorage["jsffc"]["line1"].length *
			LotteryStorage["jsffc"]["line2"].length *
			LotteryStorage["jsffc"]["line3"].length *
			LotteryStorage["jsffc"]["line4"].length;
	}else if(jsffc_playMethod == 18 || jsffc_playMethod == 29 || jsffc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["jsffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(jsffc_playMethod == 22 || jsffc_playMethod == 33 || jsffc_playMethod == 44 ){
		notes = 54;
	}else if(jsffc_playMethod == 54 || jsffc_playMethod == 61){
		notes = 9;
	}else if(jsffc_playMethod == 51 || jsffc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["jsffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(jsffc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,4);
	}else if(jsffc_playMethod == 13|| jsffc_playMethod == 64 || jsffc_playMethod == 66 || jsffc_playMethod == 68 || jsffc_playMethod == 70 || jsffc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,2);
	}else if(jsffc_playMethod == 37 || jsffc_playMethod == 26 || jsffc_playMethod == 15 || jsffc_playMethod == 75 || jsffc_playMethod == 77){
		notes = LotteryStorage["jsffc"]["line1"].length *
			LotteryStorage["jsffc"]["line2"].length *
			LotteryStorage["jsffc"]["line3"].length ;
	}else if(jsffc_playMethod == 39 || jsffc_playMethod == 28 || jsffc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["jsffc"]["line1"][i]);
		};
	}else if(jsffc_playMethod == 41 || jsffc_playMethod == 30 || jsffc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["jsffc"]["line1"].length,2);
	}else if(jsffc_playMethod == 42 || jsffc_playMethod == 31 || jsffc_playMethod == 20 || jsffc_playMethod == 68 || jsffc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,3);
	}else if(jsffc_playMethod == 43 || jsffc_playMethod == 32 || jsffc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["jsffc"]["line1"][i]);
		};
	}else if(jsffc_playMethod == 48 || jsffc_playMethod == 55 || jsffc_playMethod == 74 || jsffc_playMethod == 76){
		notes = LotteryStorage["jsffc"]["line1"].length *
			LotteryStorage["jsffc"]["line2"].length ;
	}else if(jsffc_playMethod == 50 || jsffc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["jsffc"]["line1"][i]);
		};
	}else if(jsffc_playMethod == 52 || jsffc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,2);
	}else if(jsffc_playMethod == 53 || jsffc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["jsffc"]["line1"][i]);
		};
	}else if(jsffc_playMethod == 62){
		notes = LotteryStorage["jsffc"]["line1"].length +
			LotteryStorage["jsffc"]["line2"].length +
			LotteryStorage["jsffc"]["line3"].length +
			LotteryStorage["jsffc"]["line4"].length +
			LotteryStorage["jsffc"]["line5"].length;
	}else if(jsffc_playType == 13 || jsffc_playType == 14 || jsffc_playMethod == 8 || jsffc_playMethod == 71
		|| jsffc_playMethod == 24 || jsffc_playMethod == 25 || jsffc_playMethod == 35 || jsffc_playMethod == 36 || jsffc_playMethod == 46
		|| jsffc_playMethod == 47 || jsffc_playMethod == 63 || jsffc_playMethod == 65 || jsffc_playMethod == 67 || jsffc_playMethod == 69 ){
		notes = LotteryStorage["jsffc"]["line1"].length ;
	}else if(jsffc_playMethod == 78){
		notes = LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line2"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line3"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line4"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line3"].length +
			LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line4"].length +
			LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line4"].length +
			LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line4"].length * LotteryStorage["jsffc"]["line5"].length;
	}else if (jsffc_playMethod == 80) {
		if ($("#jsffc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["jsffc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,2);
		}
	}else if (jsffc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,2) * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,2);
	}else if (jsffc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["jsffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,2);
	}else if (jsffc_playMethod == 84) {
		notes = LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line3"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line4"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line4"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line4"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line4"].length +
			LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line4"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line4"].length * LotteryStorage["jsffc"]["line5"].length ;
	}else if (jsffc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["jsffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,3);
	}else if (jsffc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["jsffc"]["line1"].length,2) * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,3);
	}else if (jsffc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,3) * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,3);
	}else if (jsffc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["jsffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["jsffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,3);
	}else if (jsffc_playMethod == 93) {
		notes = LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line4"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line4"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line1"].length * LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line4"].length * LotteryStorage["jsffc"]["line5"].length +
			LotteryStorage["jsffc"]["line2"].length * LotteryStorage["jsffc"]["line3"].length * LotteryStorage["jsffc"]["line4"].length * LotteryStorage["jsffc"]["line5"].length;
	}else if (jsffc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,4)
			* mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,4);
	}else if (jsffc_playMethod == 96) {
		if (LotteryStorage["jsffc"]["line1"].length >= 1 && LotteryStorage["jsffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["jsffc"]["line1"],LotteryStorage["jsffc"]["line2"])
				* mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (jsffc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["jsffc"]["line1"].length,2) * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,4);
	}else if (jsffc_playMethod == 98) {
		if (LotteryStorage["jsffc"]["line1"].length >= 1 && LotteryStorage["jsffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["jsffc"]["line1"],LotteryStorage["jsffc"]["line2"]) * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = jsffcValidData($("#jsffc_single").val());
	}

	if(jsffc_sntuo == 3 || jsffc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","jsffc"),LotteryInfo.getMethodId("ssc",jsffc_playMethod))){
	}else{
		if(parseInt($('#jsffc_modeId').val()) == 8){
			$("#jsffc_random").hide();
		}else{
			$("#jsffc_random").show();
		}
	}

	//验证是否为空
	if( $("#jsffc_beiNum").val() =="" || parseInt($("#jsffc_beiNum").val()) == 0){
		$("#jsffc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#jsffc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#jsffc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#jsffc_zhushu').text(notes);
		if($("#jsffc_modeId").val() == "8"){
			$('#jsffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsffc_beiNum").val()),0.002));
		}else if ($("#jsffc_modeId").val() == "2"){
			$('#jsffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsffc_beiNum").val()),0.2));
		}else if ($("#jsffc_modeId").val() == "1"){
			$('#jsffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsffc_beiNum").val()),0.02));
		}else{
			$('#jsffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsffc_beiNum").val()),2));
		}
	} else {
		$('#jsffc_zhushu').text(0);
		$('#jsffc_money').text(0);
	}
	jsffc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('jsffc',jsffc_playMethod);
}

/**
 * [jsffc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function jsffc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#jsffc_queding").bind('click', function(event) {
		jsffc_rebate = $("#jsffc_fandian option:last").val();
		if(parseInt($('#jsffc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		jsffc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#jsffc_modeId').val()) == 8){
			if (Number($('#jsffc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('jsffc',jsffc_playMethod);

		submitParams.lotteryType = "jsffc";
		var play = LotteryInfo.getPlayName("ssc",jsffc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",jsffc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = jsffc_playType;
		submitParams.playMethodIndex = jsffc_playMethod;
		var selectedBalls = [];
		if(jsffc_playMethod == 0 || jsffc_playMethod == 3 || jsffc_playMethod == 4
			|| jsffc_playMethod == 5 || jsffc_playMethod == 6 || jsffc_playMethod == 7
			|| jsffc_playMethod == 9 || jsffc_playMethod == 12 || jsffc_playMethod == 14
			|| jsffc_playMethod == 37 || jsffc_playMethod == 26 || jsffc_playMethod == 15
			|| jsffc_playMethod == 48 || jsffc_playMethod == 55 || jsffc_playMethod == 74 || jsffc_playType == 9){
			$("#jsffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(jsffc_playMethod == 2 || jsffc_playMethod == 8 || jsffc_playMethod == 11 || jsffc_playMethod == 13 || jsffc_playMethod == 24
			|| jsffc_playMethod == 39 || jsffc_playMethod == 28 || jsffc_playMethod == 17 || jsffc_playMethod == 18 || jsffc_playMethod == 25
			|| jsffc_playMethod == 22 || jsffc_playMethod == 33 || jsffc_playMethod == 44 || jsffc_playMethod == 54 || jsffc_playMethod == 61
			|| jsffc_playMethod == 41 || jsffc_playMethod == 42 || jsffc_playMethod == 43 || jsffc_playMethod == 29 || jsffc_playMethod == 35
			|| jsffc_playMethod == 30 || jsffc_playMethod == 31 || jsffc_playMethod == 32 || jsffc_playMethod == 40 || jsffc_playMethod == 36
			|| jsffc_playMethod == 19 || jsffc_playMethod == 20 || jsffc_playMethod == 21 || jsffc_playMethod == 46 || jsffc_playMethod == 47
			|| jsffc_playMethod == 50 || jsffc_playMethod == 57 || jsffc_playType == 8 || jsffc_playMethod == 51 || jsffc_playMethod == 58
			|| jsffc_playMethod == 52 || jsffc_playMethod == 53|| jsffc_playMethod == 59 || jsffc_playMethod == 60 || jsffc_playType == 13 || jsffc_playType == 14){
			$("#jsffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(jsffc_playType == 7 || jsffc_playMethod == 78 || jsffc_playMethod == 84 || jsffc_playMethod == 93){
			$("#jsffc_ballView div.ballView").each(function(){
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
		}else if(jsffc_playMethod == 80 || jsffc_playMethod == 81 || jsffc_playMethod == 83
			|| jsffc_playMethod == 86 || jsffc_playMethod == 87 || jsffc_playMethod == 89
			|| jsffc_playMethod == 92 || jsffc_playMethod == 95 || jsffc_playMethod == 97){
			$("#jsffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#jsffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#jsffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#jsffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#jsffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#jsffc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (jsffc_playMethod == 96 || jsffc_playMethod == 98) {
			$("#jsffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#jsffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#jsffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#jsffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#jsffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#jsffc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			jsffcValidateData("submit");
			var array = handleSingleStr($("#jsffc_single").val());
			if(jsffc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(jsffc_playMethod == 10 || jsffc_playMethod == 38 || jsffc_playMethod == 27
				|| jsffc_playMethod == 16 || jsffc_playMethod == 49 || jsffc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(jsffc_playMethod == 45 || jsffc_playMethod == 34 || jsffc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(jsffc_playMethod == 79 || jsffc_playMethod == 82 || jsffc_playMethod == 85 || jsffc_playMethod == 88 ||
				jsffc_playMethod == 89 || jsffc_playMethod == 90 || jsffc_playMethod == 91 || jsffc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#jsffc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#jsffc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#jsffc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#jsffc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#jsffc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#jsffc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#jsffc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#jsffc_fandian").val());
		submitParams.notes = $('#jsffc_zhushu').html();
		submitParams.sntuo = jsffc_sntuo;
		submitParams.multiple = $('#jsffc_beiNum').val();  //requirement
		submitParams.rebates = $('#jsffc_fandian').val();  //requirement
		submitParams.playMode = $('#jsffc_modeId').val();  //requirement
		submitParams.money = $('#jsffc_money').html();  //requirement
		submitParams.award = $('#jsffc_minAward').html();  //奖金
		submitParams.maxAward = $('#jsffc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#jsffc_ballView").empty();
		jsffc_qingkongAll();
	});
}

/**
 * [jsffc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function jsffc_randomOne(){
	jsffc_qingkongAll();
	if(jsffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["jsffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["jsffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["jsffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["jsffc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["jsffc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line2"], function(k, v){
			$("#" + "jsffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line3"], function(k, v){
			$("#" + "jsffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line4"], function(k, v){
			$("#" + "jsffc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line5"], function(k, v){
			$("#" + "jsffc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["jsffc"]["line1"].push(number+"");
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["jsffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["jsffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["jsffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["jsffc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line2"], function(k, v){
			$("#" + "jsffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line3"], function(k, v){
			$("#" + "jsffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line4"], function(k, v){
			$("#" + "jsffc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(jsffc_playMethod == 37 || jsffc_playMethod == 26 || jsffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["jsffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["jsffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["jsffc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line2"], function(k, v){
			$("#" + "jsffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line3"], function(k, v){
			$("#" + "jsffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 41 || jsffc_playMethod == 30 || jsffc_playMethod == 19 || jsffc_playMethod == 68
		|| jsffc_playMethod == 52 || jsffc_playMethod == 64 || jsffc_playMethod == 66
		|| jsffc_playMethod == 59 || jsffc_playMethod == 70 || jsffc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["jsffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 42 || jsffc_playMethod == 31 || jsffc_playMethod == 20 || jsffc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["jsffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 39 || jsffc_playMethod == 28 || jsffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["jsffc"]["line1"].push(number+'');
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 43 || jsffc_playMethod == 32 || jsffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["jsffc"]["line1"].push(number+'');
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 48 || jsffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["jsffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["jsffc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line2"], function(k, v){
			$("#" + "jsffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 25 || jsffc_playMethod == 36 || jsffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["jsffc"]["line1"].push(number+"");
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 50 || jsffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["jsffc"]["line1"].push(number+"");
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 53 || jsffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["jsffc"]["line1"].push(number+"");
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["jsffc"]["line"+line].push(number+"");
		$.each(LotteryStorage["jsffc"]["line"+line], function(k, v){
			$("#" + "jsffc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 63 || jsffc_playMethod == 67 || jsffc_playMethod == 69 || jsffc_playMethod == 71 || jsffc_playType == 13
		|| jsffc_playMethod == 65 || jsffc_playMethod == 18 || jsffc_playMethod == 29 || jsffc_playMethod == 40 || jsffc_playMethod == 22
		|| jsffc_playMethod == 33 || jsffc_playMethod == 44 || jsffc_playMethod == 54 || jsffc_playMethod == 61
		|| jsffc_playMethod == 24 || jsffc_playMethod == 35 || jsffc_playMethod == 46 || jsffc_playMethod == 51 || jsffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["jsffc"]["line1"].push(number+'');
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 74 || jsffc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["jsffc"]["line1"].push(array[0]+"");
		LotteryStorage["jsffc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line2"], function(k, v){
			$("#" + "jsffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 75 || jsffc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["jsffc"]["line1"].push(array[0]+"");
		LotteryStorage["jsffc"]["line2"].push(array[1]+"");
		LotteryStorage["jsffc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line2"], function(k, v){
			$("#" + "jsffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line3"], function(k, v){
			$("#" + "jsffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["jsffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["jsffc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["jsffc"]["line"+lines[0]], function(k, v){
			$("#" + "jsffc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line"+lines[1]], function(k, v){
			$("#" + "jsffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["jsffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["jsffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["jsffc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["jsffc"]["line"+lines[0]], function(k, v){
			$("#" + "jsffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line"+lines[1]], function(k, v){
			$("#" + "jsffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line"+lines[0]], function(k, v){
			$("#" + "jsffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["jsffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["jsffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["jsffc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["jsffc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["jsffc"]["line"+lines[0]], function(k, v){
			$("#" + "jsffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line"+lines[1]], function(k, v){
			$("#" + "jsffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line"+lines[2]], function(k, v){
			$("#" + "jsffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jsffc"]["line"+lines[3]], function(k, v){
			$("#" + "jsffc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(jsffc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["jsffc"]["line1"].push(number+"");
		$.each(LotteryStorage["jsffc"]["line1"], function(k, v){
			$("#" + "jsffc_line1" + v).toggleClass("redBalls_active");
		});
	}
	jsffc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function jsffc_checkOutRandom(playMethod){
	var obj = new Object();
	if(jsffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(jsffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(jsffc_playMethod == 18 || jsffc_playMethod == 29 || jsffc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(jsffc_playMethod == 22 || jsffc_playMethod == 33 || jsffc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(jsffc_playMethod == 54 || jsffc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(jsffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(jsffc_playMethod == 37 || jsffc_playMethod == 26 || jsffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(jsffc_playMethod == 39 || jsffc_playMethod == 28 || jsffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(jsffc_playMethod == 41 || jsffc_playMethod == 30 || jsffc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(jsffc_playMethod == 52 || jsffc_playMethod == 59 || jsffc_playMethod == 64 || jsffc_playMethod == 66 || jsffc_playMethod == 68
		||jsffc_playMethod == 70 || jsffc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(jsffc_playMethod == 42 || jsffc_playMethod == 31 || jsffc_playMethod == 20 || jsffc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(jsffc_playMethod == 43 || jsffc_playMethod == 32 || jsffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(jsffc_playMethod == 48 || jsffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(jsffc_playMethod == 50 || jsffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(jsffc_playMethod == 53 || jsffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(jsffc_playMethod == 62){
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
	}else if(jsffc_playMethod == 63 || jsffc_playMethod == 65 || jsffc_playMethod == 67 || jsffc_playMethod == 69 || jsffc_playMethod == 71
		|| jsffc_playMethod == 24 || jsffc_playMethod == 35 || jsffc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(jsffc_playMethod == 25 || jsffc_playMethod == 36 || jsffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(jsffc_playMethod == 51 || jsffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(jsffc_playMethod == 74 || jsffc_playMethod == 76){
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
	}else if(jsffc_playMethod == 75 || jsffc_playMethod == 77){
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
	}else if(jsffc_playMethod == 78){
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
	}else if(jsffc_playMethod == 84){
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
	}else if(jsffc_playMethod == 93){
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
	obj.sntuo = jsffc_sntuo;
	obj.multiple = 1;
	obj.rebates = jsffc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('jsffc',jsffc_playMethod,obj);  //机选奖金计算
	obj.award = $('#jsffc_minAward').html();     //奖金
	obj.maxAward = $('#jsffc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [jsffcValidateData 单式数据验证]
 */
function jsffcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#jsffc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	jsffcValidData(textStr,type);
}

function jsffcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(jsffc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 38 || jsffc_playMethod == 27 || jsffc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 45 || jsffc_playMethod == 34 || jsffc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 49 || jsffc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,2);
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,2);
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,3);
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,3);
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,3);
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,3);
		jsffcShowFooter(true,notes);
	}else if(jsffc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jsffc_tab .button.red").size() ,4);
		jsffcShowFooter(true,notes);
	}

	$('#jsffc_delRepeat').off('click');
	$('#jsffc_delRepeat').on('click',function () {
		content.str = $('#jsffc_single').val() ? $('#jsffc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		jsffcShowFooter(true,notes);
		$("#jsffc_single").val(array.join(" "));
	});

	$("#jsffc_single").val(array.join(" "));
	return notes;
}

function jsffcShowFooter(isValid,notes){
	$('#jsffc_zhushu').text(notes);
	if($("#jsffc_modeId").val() == "8"){
		$('#jsffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsffc_beiNum").val()),0.002));
	}else if ($("#jsffc_modeId").val() == "2"){
		$('#jsffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsffc_beiNum").val()),0.2));
	}else if ($("#jsffc_modeId").val() == "1"){
		$('#jsffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsffc_beiNum").val()),0.02));
	}else{
		$('#jsffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jsffc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	jsffc_initFooterButton();
	calcAwardWin('jsffc',jsffc_playMethod);  //计算奖金和盈利
}