var jssfc_playType = 2;
var jssfc_playMethod = 15;
var jssfc_sntuo = 0;
var jssfc_rebate;
var jssfcScroll;

//进入这个页面时调用
function jssfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("jssfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("jssfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function jssfcPageUnloadedPanel(){
	$("#jssfc_queding").off('click');
	$("#jssfcPage_back").off('click');
	$("#jssfc_ballView").empty();
	$("#jssfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="jssfcPlaySelect"></select>');
	$("#jssfcSelect").append($select);
}

//入口函数
function jssfc_init(){
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
	$("#jssfc_title").html(LotteryInfo.getLotteryNameByTag("jssfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == jssfc_playType && j == jssfc_playMethod){
					$play.append('<option value="jssfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="jssfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(jssfc_playMethod,onShowArray)>-1 ){
						jssfc_playType = i;
						jssfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#jssfcPlaySelect").append($play);
		}
	}
	
	if($("#jssfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("jssfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:jssfcChangeItem
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

	GetLotteryInfo("jssfc",function (){
		jssfcChangeItem("jssfc"+jssfc_playMethod);
	});

	//添加滑动条
	if(!jssfcScroll){
		jssfcScroll = new IScroll('#jssfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("jssfc",LotteryInfo.getLotteryIdByTag("jssfc"));

	//获取上一期开奖
	queryLastPrize("jssfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('jssfc');

	//机选选号
	$("#jssfc_random").off('click');
	$("#jssfc_random").on('click', function(event) {
		jssfc_randomOne();
	});
	
	$("#jssfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",jssfc_playMethod));
	//玩法说明
	$("#jssfc_paly_shuoming").off('click');
	$("#jssfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#jssfc_shuoming").text());
	});

	//返回
	$("#jssfcPage_back").on('click', function(event) {
		// jssfc_playType = 2;
		// jssfc_playMethod = 15;
		$("#jssfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		jssfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});

	qingKong("jssfc");//清空
	jssfc_submitData();
}

function jssfcResetPlayType(){
	jssfc_playType = 2;
	jssfc_playMethod = 15;
}

function jssfcChangeItem(val) {
	jssfc_qingkongAll();
	var temp = val.substring("jssfc".length,val.length);
	if(val == "jssfc0"){
		//直选复式
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 0;
		jssfc_playMethod = 0;
		createFiveLineLayout("jssfc", function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc1"){
		//直选单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 0;
		jssfc_playMethod = 1;
		$("#jssfc_ballView").empty();
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc2"){
		//组选120
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 0;
		jssfc_playMethod = 2;
		createOneLineLayout("jssfc","至少选择5个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc3"){
		//组选60
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 0;
		jssfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc4"){
		//组选30
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 0;
		jssfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc5"){
		//组选20
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 0;
		jssfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc6"){
		//组选10
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 0;
		jssfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc7"){
		//组选5
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 0;
		jssfc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc8"){
		//总和大小单双
		$("#jssfc_random").show();
		var num = ["大","小","单","双"];
		jssfc_sntuo = 0;
		jssfc_playType = 0;
		jssfc_playMethod = 8;
		createNonNumLayout("jssfc",jssfc_playMethod,num,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc9"){
		//直选复式
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 1;
		jssfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("jssfc",tips, function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc10"){
		//直选单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 1;
		jssfc_playMethod = 10;
		$("#jssfc_ballView").empty();
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc11"){
		//组选24
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 1;
		jssfc_playMethod = 11;
		createOneLineLayout("jssfc","至少选择4个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc12"){
		//组选12
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 1;
		jssfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc13"){
		//组选6
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 1;
		jssfc_playMethod = 13;
		createOneLineLayout("jssfc","二重号:至少选择2个号码",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc14"){
		//组选4
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 1;
		jssfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc15"){
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc16"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 2;
		jssfc_playMethod = 16;
		$("#jssfc_ballView").empty();
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc17"){
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 17;
		createSumLayout("jssfc",0,27,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc18"){
		//直选跨度
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 18;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc19"){
		//后三组三
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 19;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc20"){
		//后三组六
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 20;
		createOneLineLayout("jssfc","至少选择3个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc21"){
		//后三和值
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 21;
		createSumLayout("jssfc",1,26,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc22"){
		//后三组选包胆
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 22;
		jssfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jssfc",array,["请选择一个号码"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc23"){
		//后三混合组选
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 2;
		jssfc_playMethod = 23;
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc24"){
		//和值尾数
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 24;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc25"){
		//特殊号
		$("#jssfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		jssfc_sntuo = 0;
		jssfc_playType = 2;
		jssfc_playMethod = 25;
		createNonNumLayout("jssfc",jssfc_playMethod,num,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc26"){
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc27"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 3;
		jssfc_playMethod = 27;
		$("#jssfc_ballView").empty();
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc28"){
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 28;
		createSumLayout("jssfc",0,27,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc29"){
		//直选跨度
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 29;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc30"){
		//中三组三
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 30;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc31"){
		//中三组六
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 31;
		createOneLineLayout("jssfc","至少选择3个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc32"){
		//中三和值
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 32;
		createSumLayout("jssfc",1,26,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc33"){
		//中三组选包胆
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 33;
		jssfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jssfc",array,["请选择一个号码"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc34"){
		//中三混合组选
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 3;
		jssfc_playMethod = 34;
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc35"){
		//和值尾数
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 35;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc36"){
		//特殊号
		$("#jssfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		jssfc_sntuo = 0;
		jssfc_playType = 3;
		jssfc_playMethod = 36;
		createNonNumLayout("jssfc",jssfc_playMethod,num,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc37"){
		//直选复式
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc38"){
		//直选单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 4;
		jssfc_playMethod = 38;
		$("#jssfc_ballView").empty();
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc39"){
		//和值
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 39;
		createSumLayout("jssfc",0,27,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc40"){
		//直选跨度
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 40;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc41"){
		//前三组三
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 41;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc42"){
		//前三组六
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 42;
		createOneLineLayout("jssfc","至少选择3个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc43"){
		//前三和值
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 43;
		createSumLayout("jssfc",1,26,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc44"){
		//前三组选包胆
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 44;
		jssfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jssfc",array,["请选择一个号码"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc45"){
		//前三混合组选
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 4;
		jssfc_playMethod = 45;
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc46"){
		//和值尾数
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 46;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc47"){
		//特殊号
		$("#jssfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		jssfc_sntuo = 0;
		jssfc_playType = 4;
		jssfc_playMethod = 47;
		createNonNumLayout("jssfc",jssfc_playMethod,num,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc48"){
		//后二复式
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 5;
		jssfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc49"){
		//后二单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 5;
		jssfc_playMethod = 49;
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc50"){
		//后二和值
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 5;
		jssfc_playMethod = 50;
		createSumLayout("jssfc",0,18,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc51"){
		//直选跨度
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 5;
		jssfc_playMethod = 51;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc52"){
		//后二组选
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 5;
		jssfc_playMethod = 52;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc53"){
		//后二和值
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 5;
		jssfc_playMethod = 53;
		createSumLayout("jssfc",1,17,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc54"){
		//后二组选包胆
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 5;
		jssfc_playMethod = 54;
		jssfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jssfc",array,["请选择一个号码"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc55"){
		//前二复式
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 6;
		jssfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc56"){
		//前二单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 6;
		jssfc_playMethod = 56;
		jssfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
	}else if(val == "jssfc57"){
		//前二和值
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 6;
		jssfc_playMethod = 57;
		createSumLayout("jssfc",0,18,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc58"){
		//直选跨度
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 6;
		jssfc_playMethod = 58;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc59"){
		//前二组选
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 6;
		jssfc_playMethod = 59;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc60"){
		//前二和值
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 6;
		jssfc_playMethod = 60;
		createSumLayout("jssfc",1,17,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc61"){
		//前二组选包胆
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 6;
		jssfc_playMethod = 61;
		jssfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("jssfc",array,["请选择一个号码"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc62"){
		//定位复式
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 7;
		jssfc_playMethod = 62;
		createFiveLineLayout("jssfc", function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc63"){
		//后三一码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 63;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc64"){
		//后三二码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 64;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc65"){
		//前三一码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 65;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc66"){
		//前三二码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 66;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc67"){
		//后四一码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 67;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc68"){
		//后四二码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 68;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc69"){
		//前四一码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 69;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc70"){
		//前四二码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 70;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc71"){
		//五星一码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 71;
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc72"){
		//五星二码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 72;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc73"){
		//五星三码
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 8;
		jssfc_playMethod = 73;
		createOneLineLayout("jssfc","至少选择3个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc74"){
		//后二大小单双
		jssfc_qingkongAll();
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 9;
		jssfc_playMethod = 74;
		createTextBallTwoLayout("jssfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc75"){
		//后三大小单双
		jssfc_qingkongAll();
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 9;
		jssfc_playMethod = 75;
		createTextBallThreeLayout("jssfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc76"){
		//前二大小单双
		jssfc_qingkongAll();
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 9;
		jssfc_playMethod = 76;
		createTextBallTwoLayout("jssfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc77"){
		//前三大小单双
		jssfc_qingkongAll();
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 9;
		jssfc_playMethod = 77;
		createTextBallThreeLayout("jssfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc78"){
		//直选复式
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 10;
		jssfc_playMethod = 78;
		createFiveLineLayout("jssfc",function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc79"){
		//直选单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 10;
		jssfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
		createRenXuanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc80"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 10;
		jssfc_playMethod = 80;
		createSumLayout("jssfc",0,18,function(){
			jssfc_calcNotes();
		});
		createRenXuanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc81"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 10;
		jssfc_playMethod = 81;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		createRenXuanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc82"){
		//组选单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 10;
		jssfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
		createRenXuanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc83"){
		//组选和值
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 10;
		jssfc_playMethod = 83;
		createSumLayout("jssfc",1,17,function(){
			jssfc_calcNotes();
		});
		createRenXuanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc84"){
		//直选复式
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 11;
		jssfc_playMethod = 84;
		createFiveLineLayout("jssfc", function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc85"){
		//直选单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 11;
		jssfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
		createRenXuanSanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc86"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 11;
		jssfc_playMethod = 86;
		createSumLayout("jssfc",0,27,function(){
			jssfc_calcNotes();
		});
		createRenXuanSanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc87"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 11;
		jssfc_playMethod = 87;
		createOneLineLayout("jssfc","至少选择2个",0,9,false,function(){
			jssfc_calcNotes();
		});
		createRenXuanSanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc88"){
		//组选单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 11;
		jssfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
		createRenXuanSanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc89"){
		//组选和值
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 11;
		jssfc_playMethod = 89;
		createOneLineLayout("jssfc","至少选择3个",0,9,false,function(){
			jssfc_calcNotes();
		});
		createRenXuanSanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc90"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 11;
		jssfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
		createRenXuanSanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc91"){
		//混合组选
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 11;
		jssfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
		createRenXuanSanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc92"){
		//组选和值
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 11;
		jssfc_playMethod = 92;
		createSumLayout("jssfc",1,26,function(){
			jssfc_calcNotes();
		});
		createRenXuanSanLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc93"){
		$("#jssfc_random").show();
		jssfc_sntuo = 0;
		jssfc_playType = 12;
		jssfc_playMethod = 93;
		createFiveLineLayout("jssfc", function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc94"){
		//直选单式
		$("#jssfc_random").hide();
		jssfc_sntuo = 3;
		jssfc_playType = 12;
		jssfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("jssfc",tips);
		createRenXuanSiLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc95"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 12;
		jssfc_playMethod = 95;
		createOneLineLayout("jssfc","至少选择4个",0,9,false,function(){
			jssfc_calcNotes();
		});
		createRenXuanSiLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc96"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 12;
		jssfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		createRenXuanSiLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc97"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 12;
		jssfc_playMethod = 97;
		$("#jssfc_ballView").empty();
		createOneLineLayout("jssfc","二重号:至少选择2个号码",0,9,false,function(){
			jssfc_calcNotes();
		});
		createRenXuanSiLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc98"){
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 12;
		jssfc_playMethod = 98;
		$("#jssfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("jssfc",tips,0,9,false,function(){
			jssfc_calcNotes();
		});
		createRenXuanSiLayout("jssfc",jssfc_playMethod,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc99"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 13;
		jssfc_playMethod = 99;
		$("#jssfc_ballView").empty();
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc100"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 13;
		jssfc_playMethod = 100;
		$("#jssfc_ballView").empty();
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc101"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 13;
		jssfc_playMethod = 101;
		$("#jssfc_ballView").empty();
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc102"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 13;
		jssfc_playMethod = 102;
		$("#jssfc_ballView").empty();
		createOneLineLayout("jssfc","至少选择1个",0,9,false,function(){
			jssfc_calcNotes();
		});
		jssfc_qingkongAll();
	}else if(val == "jssfc103"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 103;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc104"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 104;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc105"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 105;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc106"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 106;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc107"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 107;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc108"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 108;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc109"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 109;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc110"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 110;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc111"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 111;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}else if(val == "jssfc112"){
		jssfc_qingkongAll();
		$("#jssfc_random").hide();
		jssfc_sntuo = 0;
		jssfc_playType = 14;
		jssfc_playMethod = 112;
		createTextBallOneLayout("jssfc",["龙","虎","和"],["至少选择一个"],function(){
			jssfc_calcNotes();
		});
	}

	if(jssfcScroll){
		jssfcScroll.refresh();
		jssfcScroll.scrollTo(0,0,1);
	}
	
	$("#jssfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("jssfc",temp);
	hideRandomWhenLi("jssfc",jssfc_sntuo,jssfc_playMethod);
	jssfc_calcNotes();
}
/**
 * [jssfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function jssfc_initFooterButton(){
	if(jssfc_playMethod == 0 || jssfc_playMethod == 62 || jssfc_playMethod == 78
		|| jssfc_playMethod == 84 || jssfc_playMethod == 93 || jssfc_playType == 7){
		if(LotteryStorage["jssfc"]["line1"].length > 0 || LotteryStorage["jssfc"]["line2"].length > 0 ||
			LotteryStorage["jssfc"]["line3"].length > 0 || LotteryStorage["jssfc"]["line4"].length > 0 ||
			LotteryStorage["jssfc"]["line5"].length > 0){
			$("#jssfc_qingkong").css("opacity",1.0);
		}else{
			$("#jssfc_qingkong").css("opacity",0.4);
		}
	}else if(jssfc_playMethod == 9){
		if(LotteryStorage["jssfc"]["line1"].length > 0 || LotteryStorage["jssfc"]["line2"].length > 0 ||
			LotteryStorage["jssfc"]["line3"].length > 0 || LotteryStorage["jssfc"]["line4"].length > 0 ){
			$("#jssfc_qingkong").css("opacity",1.0);
		}else{
			$("#jssfc_qingkong").css("opacity",0.4);
		}
	}else if(jssfc_playMethod == 37 || jssfc_playMethod == 4 || jssfc_playMethod == 6
		|| jssfc_playMethod == 26 || jssfc_playMethod == 15 || jssfc_playMethod == 75 || jssfc_playMethod == 77){
		if(LotteryStorage["jssfc"]["line1"].length > 0 || LotteryStorage["jssfc"]["line2"].length > 0
			|| LotteryStorage["jssfc"]["line3"].length > 0){
			$("#jssfc_qingkong").css("opacity",1.0);
		}else{
			$("#jssfc_qingkong").css("opacity",0.4);
		}
	}else if(jssfc_playMethod == 3 || jssfc_playMethod == 4 || jssfc_playMethod == 5
		|| jssfc_playMethod == 6 || jssfc_playMethod == 7 || jssfc_playMethod == 12
		|| jssfc_playMethod == 14 || jssfc_playMethod == 48 || jssfc_playMethod == 55
		|| jssfc_playMethod == 74 || jssfc_playMethod == 76 || jssfc_playMethod == 96 || jssfc_playMethod == 98){
		if(LotteryStorage["jssfc"]["line1"].length > 0 || LotteryStorage["jssfc"]["line2"].length > 0){
			$("#jssfc_qingkong").css("opacity",1.0);
		}else{
			$("#jssfc_qingkong").css("opacity",0.4);
		}
	}else if(jssfc_playMethod == 2 || jssfc_playMethod == 8 || jssfc_playMethod == 11 || jssfc_playMethod == 13 || jssfc_playMethod == 39
		|| jssfc_playMethod == 28 || jssfc_playMethod == 17 || jssfc_playMethod == 18 || jssfc_playMethod == 24 || jssfc_playMethod == 41
		|| jssfc_playMethod == 25 || jssfc_playMethod == 29 || jssfc_playMethod == 42 || jssfc_playMethod == 43 || jssfc_playMethod == 30
		|| jssfc_playMethod == 35 || jssfc_playMethod == 36 || jssfc_playMethod == 31 || jssfc_playMethod == 32 || jssfc_playMethod == 19
		|| jssfc_playMethod == 40 || jssfc_playMethod == 46 || jssfc_playMethod == 20 || jssfc_playMethod == 21 || jssfc_playMethod == 50
		|| jssfc_playMethod == 47 || jssfc_playMethod == 51 || jssfc_playMethod == 52 || jssfc_playMethod == 53 || jssfc_playMethod == 57 || jssfc_playMethod == 63
		|| jssfc_playMethod == 58 || jssfc_playMethod == 59 || jssfc_playMethod == 60 || jssfc_playMethod == 65 || jssfc_playMethod == 80 || jssfc_playMethod == 81 || jssfc_playType == 8
		|| jssfc_playMethod == 83 || jssfc_playMethod == 86 || jssfc_playMethod == 87 || jssfc_playMethod == 22 || jssfc_playMethod == 33 || jssfc_playMethod == 44
		|| jssfc_playMethod == 89 || jssfc_playMethod == 92 || jssfc_playMethod == 95 || jssfc_playMethod == 54 || jssfc_playMethod == 61
		|| jssfc_playMethod == 97 || jssfc_playType == 13  || jssfc_playType == 14){
		if(LotteryStorage["jssfc"]["line1"].length > 0){
			$("#jssfc_qingkong").css("opacity",1.0);
		}else{
			$("#jssfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#jssfc_qingkong").css("opacity",0);
	}

	if($("#jssfc_qingkong").css("opacity") == "0"){
		$("#jssfc_qingkong").css("display","none");
	}else{
		$("#jssfc_qingkong").css("display","block");
	}

	if($('#jssfc_zhushu').html() > 0){
		$("#jssfc_queding").css("opacity",1.0);
	}else{
		$("#jssfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  jssfc_qingkongAll(){
	$("#jssfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["jssfc"]["line1"] = [];
	LotteryStorage["jssfc"]["line2"] = [];
	LotteryStorage["jssfc"]["line3"] = [];
	LotteryStorage["jssfc"]["line4"] = [];
	LotteryStorage["jssfc"]["line5"] = [];

	localStorageUtils.removeParam("jssfc_line1");
	localStorageUtils.removeParam("jssfc_line2");
	localStorageUtils.removeParam("jssfc_line3");
	localStorageUtils.removeParam("jssfc_line4");
	localStorageUtils.removeParam("jssfc_line5");

	$('#jssfc_zhushu').text(0);
	$('#jssfc_money').text(0);
	clearAwardWin("jssfc");
	jssfc_initFooterButton();
}

/**
 * [jssfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function jssfc_calcNotes(){
	$('#jssfc_modeId').blur();
	$('#jssfc_fandian').blur();
	
	var notes = 0;

	if(jssfc_playMethod == 0){
		notes = LotteryStorage["jssfc"]["line1"].length *
			LotteryStorage["jssfc"]["line2"].length *
			LotteryStorage["jssfc"]["line3"].length *
			LotteryStorage["jssfc"]["line4"].length *
			LotteryStorage["jssfc"]["line5"].length;
	}else if(jssfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,5);
	}else if(jssfc_playMethod == 3){
		if (LotteryStorage["jssfc"]["line1"].length >= 1 && LotteryStorage["jssfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["jssfc"]["line1"],LotteryStorage["jssfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(jssfc_playMethod == 4){
		if (LotteryStorage["jssfc"]["line1"].length >= 2 && LotteryStorage["jssfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["jssfc"]["line2"],LotteryStorage["jssfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(jssfc_playMethod == 5 || jssfc_playMethod == 12){
		if (LotteryStorage["jssfc"]["line1"].length >= 1 && LotteryStorage["jssfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["jssfc"]["line1"],LotteryStorage["jssfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(jssfc_playMethod == 6 || jssfc_playMethod == 7 || jssfc_playMethod == 14){
		if (LotteryStorage["jssfc"]["line1"].length >= 1 && LotteryStorage["jssfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["jssfc"]["line1"],LotteryStorage["jssfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(jssfc_playMethod == 9){
		notes = LotteryStorage["jssfc"]["line1"].length *
			LotteryStorage["jssfc"]["line2"].length *
			LotteryStorage["jssfc"]["line3"].length *
			LotteryStorage["jssfc"]["line4"].length;
	}else if(jssfc_playMethod == 18 || jssfc_playMethod == 29 || jssfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["jssfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(jssfc_playMethod == 22 || jssfc_playMethod == 33 || jssfc_playMethod == 44 ){
		notes = 54;
	}else if(jssfc_playMethod == 54 || jssfc_playMethod == 61){
		notes = 9;
	}else if(jssfc_playMethod == 51 || jssfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["jssfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(jssfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,4);
	}else if(jssfc_playMethod == 13|| jssfc_playMethod == 64 || jssfc_playMethod == 66 || jssfc_playMethod == 68 || jssfc_playMethod == 70 || jssfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,2);
	}else if(jssfc_playMethod == 37 || jssfc_playMethod == 26 || jssfc_playMethod == 15 || jssfc_playMethod == 75 || jssfc_playMethod == 77){
		notes = LotteryStorage["jssfc"]["line1"].length *
			LotteryStorage["jssfc"]["line2"].length *
			LotteryStorage["jssfc"]["line3"].length ;
	}else if(jssfc_playMethod == 39 || jssfc_playMethod == 28 || jssfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["jssfc"]["line1"][i]);
		};
	}else if(jssfc_playMethod == 41 || jssfc_playMethod == 30 || jssfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["jssfc"]["line1"].length,2);
	}else if(jssfc_playMethod == 42 || jssfc_playMethod == 31 || jssfc_playMethod == 20 || jssfc_playMethod == 68 || jssfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,3);
	}else if(jssfc_playMethod == 43 || jssfc_playMethod == 32 || jssfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["jssfc"]["line1"][i]);
		};
	}else if(jssfc_playMethod == 48 || jssfc_playMethod == 55 || jssfc_playMethod == 74 || jssfc_playMethod == 76){
		notes = LotteryStorage["jssfc"]["line1"].length *
			LotteryStorage["jssfc"]["line2"].length ;
	}else if(jssfc_playMethod == 50 || jssfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["jssfc"]["line1"][i]);
		};
	}else if(jssfc_playMethod == 52 || jssfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,2);
	}else if(jssfc_playMethod == 53 || jssfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["jssfc"]["line1"][i]);
		};
	}else if(jssfc_playMethod == 62){
		notes = LotteryStorage["jssfc"]["line1"].length +
			LotteryStorage["jssfc"]["line2"].length +
			LotteryStorage["jssfc"]["line3"].length +
			LotteryStorage["jssfc"]["line4"].length +
			LotteryStorage["jssfc"]["line5"].length;
	}else if(jssfc_playType == 13 || jssfc_playType == 14 || jssfc_playMethod == 8 || jssfc_playMethod == 71
		|| jssfc_playMethod == 24 || jssfc_playMethod == 25 || jssfc_playMethod == 35 || jssfc_playMethod == 36 || jssfc_playMethod == 46
		|| jssfc_playMethod == 47 || jssfc_playMethod == 63 || jssfc_playMethod == 65 || jssfc_playMethod == 67 || jssfc_playMethod == 69 ){
		notes = LotteryStorage["jssfc"]["line1"].length ;
	}else if(jssfc_playMethod == 78){
		notes = LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line2"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line3"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line4"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line3"].length +
			LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line4"].length +
			LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line4"].length +
			LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line4"].length * LotteryStorage["jssfc"]["line5"].length;
	}else if (jssfc_playMethod == 80) {
		if ($("#jssfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["jssfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,2);
		}
	}else if (jssfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,2) * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,2);
	}else if (jssfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["jssfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,2);
	}else if (jssfc_playMethod == 84) {
		notes = LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line3"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line4"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line4"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line4"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line4"].length +
			LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line4"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line4"].length * LotteryStorage["jssfc"]["line5"].length ;
	}else if (jssfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["jssfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,3);
	}else if (jssfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["jssfc"]["line1"].length,2) * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,3);
	}else if (jssfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,3) * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,3);
	}else if (jssfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["jssfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["jssfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,3);
	}else if (jssfc_playMethod == 93) {
		notes = LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line4"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line4"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line1"].length * LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line4"].length * LotteryStorage["jssfc"]["line5"].length +
			LotteryStorage["jssfc"]["line2"].length * LotteryStorage["jssfc"]["line3"].length * LotteryStorage["jssfc"]["line4"].length * LotteryStorage["jssfc"]["line5"].length;
	}else if (jssfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,4);
	}else if (jssfc_playMethod == 96) {
		if (LotteryStorage["jssfc"]["line1"].length >= 1 && LotteryStorage["jssfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["jssfc"]["line1"],LotteryStorage["jssfc"]["line2"])
				* mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (jssfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["jssfc"]["line1"].length,2) * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,4);
	}else if (jssfc_playMethod == 98) {
		if (LotteryStorage["jssfc"]["line1"].length >= 1 && LotteryStorage["jssfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["jssfc"]["line1"],LotteryStorage["jssfc"]["line2"]) * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = jssfcValidData($("#jssfc_single").val());
	}

	if(jssfc_sntuo == 3 || jssfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","jssfc"),LotteryInfo.getMethodId("ssc",jssfc_playMethod))){
	}else{
		if(parseInt($('#jssfc_modeId').val()) == 8){
			$("#jssfc_random").hide();
		}else{
			$("#jssfc_random").show();
		}
	}

	//验证是否为空
	if( $("#jssfc_beiNum").val() =="" || parseInt($("#jssfc_beiNum").val()) == 0){
		$("#jssfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#jssfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#jssfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#jssfc_zhushu').text(notes);
		if($("#jssfc_modeId").val() == "8"){
			$('#jssfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jssfc_beiNum").val()),0.002));
		}else if ($("#jssfc_modeId").val() == "2"){
			$('#jssfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jssfc_beiNum").val()),0.2));
		}else if ($("#jssfc_modeId").val() == "1"){
			$('#jssfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jssfc_beiNum").val()),0.02));
		}else{
			$('#jssfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jssfc_beiNum").val()),2));
		}
	} else {
		$('#jssfc_zhushu').text(0);
		$('#jssfc_money').text(0);
	}
	jssfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('jssfc',jssfc_playMethod);
}

/**
 * [jssfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function jssfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#jssfc_queding").bind('click', function(event) {
		jssfc_rebate = $("#jssfc_fandian option:last").val();
		if(parseInt($('#jssfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		jssfc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#jssfc_modeId').val()) == 8){
			if (Number($('#jssfc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('jssfc',jssfc_playMethod);

		submitParams.lotteryType = "jssfc";
		var play = LotteryInfo.getPlayName("ssc",jssfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",jssfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = jssfc_playType;
		submitParams.playMethodIndex = jssfc_playMethod;
		var selectedBalls = [];
		if(jssfc_playMethod == 0 || jssfc_playMethod == 3 || jssfc_playMethod == 4
			|| jssfc_playMethod == 5 || jssfc_playMethod == 6 || jssfc_playMethod == 7
			|| jssfc_playMethod == 9 || jssfc_playMethod == 12 || jssfc_playMethod == 14
			|| jssfc_playMethod == 37 || jssfc_playMethod == 26 || jssfc_playMethod == 15
			|| jssfc_playMethod == 48 || jssfc_playMethod == 55 || jssfc_playMethod == 74 || jssfc_playType == 9){
			$("#jssfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(jssfc_playMethod == 2 || jssfc_playMethod == 8 || jssfc_playMethod == 11 || jssfc_playMethod == 13 || jssfc_playMethod == 24
			|| jssfc_playMethod == 39 || jssfc_playMethod == 28 || jssfc_playMethod == 17 || jssfc_playMethod == 18 || jssfc_playMethod == 25
			|| jssfc_playMethod == 22 || jssfc_playMethod == 33 || jssfc_playMethod == 44 || jssfc_playMethod == 54 || jssfc_playMethod == 61
			|| jssfc_playMethod == 41 || jssfc_playMethod == 42 || jssfc_playMethod == 43 || jssfc_playMethod == 29 || jssfc_playMethod == 35
			|| jssfc_playMethod == 30 || jssfc_playMethod == 31 || jssfc_playMethod == 32 || jssfc_playMethod == 40 || jssfc_playMethod == 36
			|| jssfc_playMethod == 19 || jssfc_playMethod == 20 || jssfc_playMethod == 21 || jssfc_playMethod == 46 || jssfc_playMethod == 47
			|| jssfc_playMethod == 50 || jssfc_playMethod == 57 || jssfc_playType == 8 || jssfc_playMethod == 51 || jssfc_playMethod == 58
			|| jssfc_playMethod == 52 || jssfc_playMethod == 53|| jssfc_playMethod == 59 || jssfc_playMethod == 60 || jssfc_playType == 13 || jssfc_playType == 14){
			$("#jssfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(jssfc_playType == 7 || jssfc_playMethod == 78 || jssfc_playMethod == 84 || jssfc_playMethod == 93){
			$("#jssfc_ballView div.ballView").each(function(){
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
		}else if(jssfc_playMethod == 80 || jssfc_playMethod == 81 || jssfc_playMethod == 83
			|| jssfc_playMethod == 86 || jssfc_playMethod == 87 || jssfc_playMethod == 89
			|| jssfc_playMethod == 92 || jssfc_playMethod == 95 || jssfc_playMethod == 97){
			$("#jssfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#jssfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#jssfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#jssfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#jssfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#jssfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (jssfc_playMethod == 96 || jssfc_playMethod == 98) {
			$("#jssfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#jssfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#jssfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#jssfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#jssfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#jssfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			jssfcValidateData("submit");
			var array = handleSingleStr($("#jssfc_single").val());
			if(jssfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(jssfc_playMethod == 10 || jssfc_playMethod == 38 || jssfc_playMethod == 27
				|| jssfc_playMethod == 16 || jssfc_playMethod == 49 || jssfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(jssfc_playMethod == 45 || jssfc_playMethod == 34 || jssfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(jssfc_playMethod == 79 || jssfc_playMethod == 82 || jssfc_playMethod == 85 || jssfc_playMethod == 88 ||
				jssfc_playMethod == 89 || jssfc_playMethod == 90 || jssfc_playMethod == 91 || jssfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#jssfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#jssfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#jssfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#jssfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#jssfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#jssfc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#jssfc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#jssfc_fandian").val());
		submitParams.notes = $('#jssfc_zhushu').html();
		submitParams.sntuo = jssfc_sntuo;
		submitParams.multiple = $('#jssfc_beiNum').val();  //requirement
		submitParams.rebates = $('#jssfc_fandian').val();  //requirement
		submitParams.playMode = $('#jssfc_modeId').val();  //requirement
		submitParams.money = $('#jssfc_money').html();  //requirement
		submitParams.award = $('#jssfc_minAward').html();  //奖金
		submitParams.maxAward = $('#jssfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#jssfc_ballView").empty();
		jssfc_qingkongAll();
	});
}

/**
 * [jssfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function jssfc_randomOne(){
	jssfc_qingkongAll();
	if(jssfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["jssfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["jssfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["jssfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["jssfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["jssfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line2"], function(k, v){
			$("#" + "jssfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line3"], function(k, v){
			$("#" + "jssfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line4"], function(k, v){
			$("#" + "jssfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line5"], function(k, v){
			$("#" + "jssfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["jssfc"]["line1"].push(number+"");
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["jssfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["jssfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["jssfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["jssfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line2"], function(k, v){
			$("#" + "jssfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line3"], function(k, v){
			$("#" + "jssfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line4"], function(k, v){
			$("#" + "jssfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(jssfc_playMethod == 37 || jssfc_playMethod == 26 || jssfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["jssfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["jssfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["jssfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line2"], function(k, v){
			$("#" + "jssfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line3"], function(k, v){
			$("#" + "jssfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 41 || jssfc_playMethod == 30 || jssfc_playMethod == 19 || jssfc_playMethod == 68
		|| jssfc_playMethod == 52 || jssfc_playMethod == 64 || jssfc_playMethod == 66
		|| jssfc_playMethod == 59 || jssfc_playMethod == 70 || jssfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["jssfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 42 || jssfc_playMethod == 31 || jssfc_playMethod == 20 || jssfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["jssfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 39 || jssfc_playMethod == 28 || jssfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["jssfc"]["line1"].push(number+'');
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 43 || jssfc_playMethod == 32 || jssfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["jssfc"]["line1"].push(number+'');
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 48 || jssfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["jssfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["jssfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line2"], function(k, v){
			$("#" + "jssfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 25 || jssfc_playMethod == 36 || jssfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["jssfc"]["line1"].push(number+"");
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 50 || jssfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["jssfc"]["line1"].push(number+"");
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 53 || jssfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["jssfc"]["line1"].push(number+"");
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["jssfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["jssfc"]["line"+line], function(k, v){
			$("#" + "jssfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 63 || jssfc_playMethod == 67 || jssfc_playMethod == 69 || jssfc_playMethod == 71 || jssfc_playType == 13
		|| jssfc_playMethod == 65 || jssfc_playMethod == 18 || jssfc_playMethod == 29 || jssfc_playMethod == 40 || jssfc_playMethod == 22
		|| jssfc_playMethod == 33 || jssfc_playMethod == 44 || jssfc_playMethod == 54 || jssfc_playMethod == 61
		|| jssfc_playMethod == 24 || jssfc_playMethod == 35 || jssfc_playMethod == 46 || jssfc_playMethod == 51 || jssfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["jssfc"]["line1"].push(number+'');
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 74 || jssfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["jssfc"]["line1"].push(array[0]+"");
		LotteryStorage["jssfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line2"], function(k, v){
			$("#" + "jssfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 75 || jssfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["jssfc"]["line1"].push(array[0]+"");
		LotteryStorage["jssfc"]["line2"].push(array[1]+"");
		LotteryStorage["jssfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line2"], function(k, v){
			$("#" + "jssfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line3"], function(k, v){
			$("#" + "jssfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["jssfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["jssfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["jssfc"]["line"+lines[0]], function(k, v){
			$("#" + "jssfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line"+lines[1]], function(k, v){
			$("#" + "jssfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["jssfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["jssfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["jssfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["jssfc"]["line"+lines[0]], function(k, v){
			$("#" + "jssfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line"+lines[1]], function(k, v){
			$("#" + "jssfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line"+lines[0]], function(k, v){
			$("#" + "jssfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["jssfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["jssfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["jssfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["jssfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["jssfc"]["line"+lines[0]], function(k, v){
			$("#" + "jssfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line"+lines[1]], function(k, v){
			$("#" + "jssfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line"+lines[2]], function(k, v){
			$("#" + "jssfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["jssfc"]["line"+lines[3]], function(k, v){
			$("#" + "jssfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(jssfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["jssfc"]["line1"].push(number+"");
		$.each(LotteryStorage["jssfc"]["line1"], function(k, v){
			$("#" + "jssfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	jssfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function jssfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(jssfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(jssfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(jssfc_playMethod == 18 || jssfc_playMethod == 29 || jssfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(jssfc_playMethod == 22 || jssfc_playMethod == 33 || jssfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(jssfc_playMethod == 54 || jssfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(jssfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(jssfc_playMethod == 37 || jssfc_playMethod == 26 || jssfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(jssfc_playMethod == 39 || jssfc_playMethod == 28 || jssfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(jssfc_playMethod == 41 || jssfc_playMethod == 30 || jssfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(jssfc_playMethod == 52 || jssfc_playMethod == 59 || jssfc_playMethod == 64 || jssfc_playMethod == 66 || jssfc_playMethod == 68
		||jssfc_playMethod == 70 || jssfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(jssfc_playMethod == 42 || jssfc_playMethod == 31 || jssfc_playMethod == 20 || jssfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(jssfc_playMethod == 43 || jssfc_playMethod == 32 || jssfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(jssfc_playMethod == 48 || jssfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(jssfc_playMethod == 50 || jssfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(jssfc_playMethod == 53 || jssfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(jssfc_playMethod == 62){
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
	}else if(jssfc_playMethod == 63 || jssfc_playMethod == 65 || jssfc_playMethod == 67 || jssfc_playMethod == 69 || jssfc_playMethod == 71
		|| jssfc_playMethod == 24 || jssfc_playMethod == 35 || jssfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(jssfc_playMethod == 25 || jssfc_playMethod == 36 || jssfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(jssfc_playMethod == 51 || jssfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(jssfc_playMethod == 74 || jssfc_playMethod == 76){
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
	}else if(jssfc_playMethod == 75 || jssfc_playMethod == 77){
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
	}else if(jssfc_playMethod == 78){
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
	}else if(jssfc_playMethod == 84){
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
	}else if(jssfc_playMethod == 93){
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
	obj.sntuo = jssfc_sntuo;
	obj.multiple = 1;
	obj.rebates = jssfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('jssfc',jssfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#jssfc_minAward').html();     //奖金
	obj.maxAward = $('#jssfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [jssfcValidateData 单式数据验证]
 */
function jssfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#jssfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	jssfcValidData(textStr,type);
}

function jssfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(jssfc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 38 || jssfc_playMethod == 27 || jssfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 45 || jssfc_playMethod == 34 || jssfc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 49 || jssfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,2);
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,2);
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,3);
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,3);
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,3);
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,3);
		jssfcShowFooter(true,notes);
	}else if(jssfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#jssfc_tab .button.red").size() ,4);
		jssfcShowFooter(true,notes);
	}

	$('#jssfc_delRepeat').off('click');
	$('#jssfc_delRepeat').on('click',function () {
		content.str = $('#jssfc_single').val() ? $('#jssfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		jssfcShowFooter(true,notes);
		$("#jssfc_single").val(array.join(" "));
	});

	$("#jssfc_single").val(array.join(" "));
	return notes;
}

function jssfcShowFooter(isValid,notes){
	$('#jssfc_zhushu').text(notes);
	if($("#jssfc_modeId").val() == "8"){
		$('#jssfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jssfc_beiNum").val()),0.002));
	}else if ($("#jssfc_modeId").val() == "2"){
		$('#jssfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jssfc_beiNum").val()),0.2));
	}else if ($("#jssfc_modeId").val() == "1"){
		$('#jssfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jssfc_beiNum").val()),0.02));
	}else{
		$('#jssfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#jssfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	jssfc_initFooterButton();
	calcAwardWin('jssfc',jssfc_playMethod);  //计算奖金和盈利
}