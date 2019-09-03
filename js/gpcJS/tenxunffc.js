var tenxunffc_playType = 2;
var tenxunffc_playMethod = 15;
var tenxunffc_sntuo = 0;
var tenxunffc_rebate;
var tenxunffcScroll;

//进入这个页面时调用
function tenxunffcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("tenxunffc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("tenxunffc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function tenxunffcPageUnloadedPanel(){
	$("#tenxunffc_queding").off('click');
	$("#tenxunffcPage_back").off('click');
	$("#tenxunffc_ballView").empty();
	$("#tenxunffcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="tenxunffcPlaySelect"></select>');
	$("#tenxunffcSelect").append($select);
}

//入口函数
function tenxunffc_init(){
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
	$("#tenxunffc_title").html(LotteryInfo.getLotteryNameByTag("tenxunffc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if (i == 15){//去掉骰宝龙虎
            continue;
        }
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == tenxunffc_playType && j == tenxunffc_playMethod){
					$play.append('<option value="tenxunffc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="tenxunffc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(tenxunffc_playMethod,onShowArray)>-1 ){
						tenxunffc_playType = i;
						tenxunffc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#tenxunffcPlaySelect").append($play);
		}
	}
	
	if($("#tenxunffcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("tenxunffcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:tenxunffcChangeItem
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

	GetLotteryInfo("tenxunffc",function (){
		tenxunffcChangeItem("tenxunffc"+tenxunffc_playMethod);
	});

	//添加滑动条
	if(!tenxunffcScroll){
		tenxunffcScroll = new IScroll('#tenxunffcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("tenxunffc",LotteryInfo.getLotteryIdByTag("tenxunffc"));

	//获取上一期开奖
	queryLastPrize("tenxunffc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('tenxunffc');

	//机选选号
	$("#tenxunffc_random").on('click', function(event) {
		tenxunffc_randomOne();
	});

	//返回
	$("#tenxunffcPage_back").on('click', function(event) {
		// tenxunffc_playType = 2;
		// tenxunffc_playMethod = 15;
		$("#tenxunffc_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		tenxunffc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#tenxunffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",tenxunffc_playMethod));
	//玩法说明
	$("#tenxunffc_paly_shuoming").off('click');
	$("#tenxunffc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#tenxunffc_shuoming").text());
	});

	qingKong("tenxunffc");//清空
	tenxunffc_submitData();
}

function tenxunffcResetPlayType(){
	tenxunffc_playType = 2;
	tenxunffc_playMethod = 15;
}

function tenxunffcChangeItem(val) {
	tenxunffc_qingkongAll();
	var temp = val.substring("tenxunffc".length,val.length);
	if(val == "tenxunffc0"){
		//直选复式
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 0;
		createFiveLineLayout("tenxunffc", function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc1"){
		//直选单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 1;
		$("#tenxunffc_ballView").empty();
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc2"){
		//组选120
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 2;
		createOneLineLayout("tenxunffc","至少选择5个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc3"){
		//组选60
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc4"){
		//组选30
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc5"){
		//组选20
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc6"){
		//组选10
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc7"){
		//组选5
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc8"){
		//总和大小单双
		$("#tenxunffc_random").show();
		var num = ["大","小","单","双"];
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 0;
		tenxunffc_playMethod = 8;
		createNonNumLayout("tenxunffc",tenxunffc_playMethod,num,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc9"){
		//直选复式
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 1;
		tenxunffc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("tenxunffc",tips, function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc10"){
		//直选单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 1;
		tenxunffc_playMethod = 10;
		$("#tenxunffc_ballView").empty();
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc11"){
		//组选24
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 1;
		tenxunffc_playMethod = 11;
		createOneLineLayout("tenxunffc","至少选择4个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc12"){
		//组选12
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 1;
		tenxunffc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc13"){
		//组选6
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 1;
		tenxunffc_playMethod = 13;
		createOneLineLayout("tenxunffc","二重号:至少选择2个号码",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc14"){
		//组选4
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 1;
		tenxunffc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc15"){
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc16"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 16;
		$("#tenxunffc_ballView").empty();
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc17"){
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 17;
		createSumLayout("tenxunffc",0,27,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc18"){
		//直选跨度
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 18;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc19"){
		//后三组三
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 19;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc20"){
		//后三组六
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 20;
		createOneLineLayout("tenxunffc","至少选择3个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc21"){
		//后三和值
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 21;
		createSumLayout("tenxunffc",1,26,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc22"){
		//后三组选包胆
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 22;
		tenxunffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxunffc",array,["请选择一个号码"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc23"){
		//后三混合组选
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 23;
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc24"){
		//和值尾数
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 24;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc25"){
		//特殊号
		$("#tenxunffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 2;
		tenxunffc_playMethod = 25;
		createNonNumLayout("tenxunffc",tenxunffc_playMethod,num,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc26"){
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc27"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 27;
		$("#tenxunffc_ballView").empty();
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc28"){
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 28;
		createSumLayout("tenxunffc",0,27,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc29"){
		//直选跨度
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 29;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc30"){
		//中三组三
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 30;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc31"){
		//中三组六
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 31;
		createOneLineLayout("tenxunffc","至少选择3个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc32"){
		//中三和值
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 32;
		createSumLayout("tenxunffc",1,26,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc33"){
		//中三组选包胆
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 33;
		tenxunffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxunffc",array,["请选择一个号码"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc34"){
		//中三混合组选
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 34;
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc35"){
		//和值尾数
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 35;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc36"){
		//特殊号
		$("#tenxunffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 3;
		tenxunffc_playMethod = 36;
		createNonNumLayout("tenxunffc",tenxunffc_playMethod,num,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc37"){
		//直选复式
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc38"){
		//直选单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 38;
		$("#tenxunffc_ballView").empty();
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc39"){
		//和值
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 39;
		createSumLayout("tenxunffc",0,27,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc40"){
		//直选跨度
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 40;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc41"){
		//前三组三
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 41;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc42"){
		//前三组六
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 42;
		createOneLineLayout("tenxunffc","至少选择3个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc43"){
		//前三和值
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 43;
		createSumLayout("tenxunffc",1,26,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc44"){
		//前三组选包胆
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 44;
		tenxunffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxunffc",array,["请选择一个号码"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc45"){
		//前三混合组选
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 45;
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc46"){
		//和值尾数
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 46;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc47"){
		//特殊号
		$("#tenxunffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 4;
		tenxunffc_playMethod = 47;
		createNonNumLayout("tenxunffc",tenxunffc_playMethod,num,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc48"){
		//后二复式
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 5;
		tenxunffc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc49"){
		//后二单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 5;
		tenxunffc_playMethod = 49;
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc50"){
		//后二和值
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 5;
		tenxunffc_playMethod = 50;
		createSumLayout("tenxunffc",0,18,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc51"){
		//直选跨度
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 5;
		tenxunffc_playMethod = 51;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc52"){
		//后二组选
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 5;
		tenxunffc_playMethod = 52;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc53"){
		//后二和值
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 5;
		tenxunffc_playMethod = 53;
		createSumLayout("tenxunffc",1,17,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc54"){
		//后二组选包胆
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 5;
		tenxunffc_playMethod = 54;
		tenxunffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxunffc",array,["请选择一个号码"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc55"){
		//前二复式
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 6;
		tenxunffc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc56"){
		//前二单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 6;
		tenxunffc_playMethod = 56;
		tenxunffc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
	}else if(val == "tenxunffc57"){
		//前二和值
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 6;
		tenxunffc_playMethod = 57;
		createSumLayout("tenxunffc",0,18,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc58"){
		//直选跨度
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 6;
		tenxunffc_playMethod = 58;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc59"){
		//前二组选
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 6;
		tenxunffc_playMethod = 59;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc60"){
		//前二和值
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 6;
		tenxunffc_playMethod = 60;
		createSumLayout("tenxunffc",1,17,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc61"){
		//前二组选包胆
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 6;
		tenxunffc_playMethod = 61;
		tenxunffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxunffc",array,["请选择一个号码"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc62"){
		//定位复式
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 7;
		tenxunffc_playMethod = 62;
		createFiveLineLayout("tenxunffc", function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc63"){
		//后三一码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 63;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc64"){
		//后三二码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 64;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc65"){
		//前三一码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 65;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc66"){
		//前三二码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 66;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc67"){
		//后四一码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 67;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc68"){
		//后四二码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 68;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc69"){
		//前四一码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 69;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc70"){
		//前四二码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 70;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc71"){
		//五星一码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 71;
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc72"){
		//五星二码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 72;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc73"){
		//五星三码
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 8;
		tenxunffc_playMethod = 73;
		createOneLineLayout("tenxunffc","至少选择3个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc74"){
		//后二大小单双
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 9;
		tenxunffc_playMethod = 74;
		createTextBallTwoLayout("tenxunffc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc75"){
		//后三大小单双
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 9;
		tenxunffc_playMethod = 75;
		createTextBallThreeLayout("tenxunffc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc76"){
		//前二大小单双
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 9;
		tenxunffc_playMethod = 76;
		createTextBallTwoLayout("tenxunffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc77"){
		//前三大小单双
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 9;
		tenxunffc_playMethod = 77;
		createTextBallThreeLayout("tenxunffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc78"){
		//直选复式
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 10;
		tenxunffc_playMethod = 78;
		createFiveLineLayout("tenxunffc",function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc79"){
		//直选单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 10;
		tenxunffc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
		createRenXuanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc80"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 10;
		tenxunffc_playMethod = 80;
		createSumLayout("tenxunffc",0,18,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc81"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 10;
		tenxunffc_playMethod = 81;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc82"){
		//组选单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 10;
		tenxunffc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
		createRenXuanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc83"){
		//组选和值
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 10;
		tenxunffc_playMethod = 83;
		createSumLayout("tenxunffc",1,17,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc84"){
		//直选复式
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 84;
		createFiveLineLayout("tenxunffc", function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc85"){
		//直选单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
		createRenXuanSanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc86"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 86;
		createSumLayout("tenxunffc",0,27,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanSanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc87"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 87;
		createOneLineLayout("tenxunffc","至少选择2个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanSanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc88"){
		//组选单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
		createRenXuanSanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc89"){
		//组选和值
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 89;
		createOneLineLayout("tenxunffc","至少选择3个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanSanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc90"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
		createRenXuanSanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc91"){
		//混合组选
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
		createRenXuanSanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc92"){
		//组选和值
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 11;
		tenxunffc_playMethod = 92;
		createSumLayout("tenxunffc",1,26,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanSanLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc93"){
		$("#tenxunffc_random").show();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 12;
		tenxunffc_playMethod = 93;
		createFiveLineLayout("tenxunffc", function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc94"){
		//直选单式
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 3;
		tenxunffc_playType = 12;
		tenxunffc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxunffc",tips);
		createRenXuanSiLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc95"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 12;
		tenxunffc_playMethod = 95;
		createOneLineLayout("tenxunffc","至少选择4个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanSiLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc96"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 12;
		tenxunffc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanSiLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc97"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 12;
		tenxunffc_playMethod = 97;
		$("#tenxunffc_ballView").empty();
		createOneLineLayout("tenxunffc","二重号:至少选择2个号码",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanSiLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc98"){
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 12;
		tenxunffc_playMethod = 98;
		$("#tenxunffc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tenxunffc",tips,0,9,false,function(){
			tenxunffc_calcNotes();
		});
		createRenXuanSiLayout("tenxunffc",tenxunffc_playMethod,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc99"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 13;
		tenxunffc_playMethod = 99;
		$("#tenxunffc_ballView").empty();
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc100"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 13;
		tenxunffc_playMethod = 100;
		$("#tenxunffc_ballView").empty();
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc101"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 13;
		tenxunffc_playMethod = 101;
		$("#tenxunffc_ballView").empty();
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc102"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 13;
		tenxunffc_playMethod = 102;
		$("#tenxunffc_ballView").empty();
		createOneLineLayout("tenxunffc","至少选择1个",0,9,false,function(){
			tenxunffc_calcNotes();
		});
		tenxunffc_qingkongAll();
	}else if(val == "tenxunffc103"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 103;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc104"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 104;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc105"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 105;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc106"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 106;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc107"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 107;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc108"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 108;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc109"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 109;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc110"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 110;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc111"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 111;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc112"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 14;
		tenxunffc_playMethod = 112;
		createTextBallOneLayout("tenxunffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc123"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 123;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc124"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 124;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc125"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 125;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc126"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 126;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc127"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 127;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc128"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 128;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc129"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 129;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc130"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 130;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc131"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 131;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}else if(val == "tenxunffc132"){
		tenxunffc_qingkongAll();
		$("#tenxunffc_random").hide();
		tenxunffc_sntuo = 0;
		tenxunffc_playType = 16;
		tenxunffc_playMethod = 132;
		createTextBallOneLayout("tenxunffc",["龙","虎"],["至少选择一个"],function(){
			tenxunffc_calcNotes();
		});
	}

	if(tenxunffcScroll){
		tenxunffcScroll.refresh();
		tenxunffcScroll.scrollTo(0,0,1);
	}
	
	$("#tenxunffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("tenxunffc",temp);
	hideRandomWhenLi("tenxunffc",tenxunffc_sntuo,tenxunffc_playMethod);
	tenxunffc_calcNotes();
}
/**
 * [tenxunffc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function tenxunffc_initFooterButton(){
	if(tenxunffc_playMethod == 0 || tenxunffc_playMethod == 62 || tenxunffc_playMethod == 78
		|| tenxunffc_playMethod == 84 || tenxunffc_playMethod == 93 || tenxunffc_playType == 7){
		if(LotteryStorage["tenxunffc"]["line1"].length > 0 || LotteryStorage["tenxunffc"]["line2"].length > 0 ||
			LotteryStorage["tenxunffc"]["line3"].length > 0 || LotteryStorage["tenxunffc"]["line4"].length > 0 ||
			LotteryStorage["tenxunffc"]["line5"].length > 0){
			$("#tenxunffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxunffc_qingkong").css("opacity",0.4);
		}
	}else if(tenxunffc_playMethod == 9){
		if(LotteryStorage["tenxunffc"]["line1"].length > 0 || LotteryStorage["tenxunffc"]["line2"].length > 0 ||
			LotteryStorage["tenxunffc"]["line3"].length > 0 || LotteryStorage["tenxunffc"]["line4"].length > 0 ){
			$("#tenxunffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxunffc_qingkong").css("opacity",0.4);
		}
	}else if(tenxunffc_playMethod == 37 || tenxunffc_playMethod == 4 || tenxunffc_playMethod == 6
		|| tenxunffc_playMethod == 26 || tenxunffc_playMethod == 15 || tenxunffc_playMethod == 75 || tenxunffc_playMethod == 77){
		if(LotteryStorage["tenxunffc"]["line1"].length > 0 || LotteryStorage["tenxunffc"]["line2"].length > 0
			|| LotteryStorage["tenxunffc"]["line3"].length > 0){
			$("#tenxunffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxunffc_qingkong").css("opacity",0.4);
		}
	}else if(tenxunffc_playMethod == 3 || tenxunffc_playMethod == 4 || tenxunffc_playMethod == 5
		|| tenxunffc_playMethod == 6 || tenxunffc_playMethod == 7 || tenxunffc_playMethod == 12
		|| tenxunffc_playMethod == 14 || tenxunffc_playMethod == 48 || tenxunffc_playMethod == 55
		|| tenxunffc_playMethod == 74 || tenxunffc_playMethod == 76 || tenxunffc_playMethod == 96 || tenxunffc_playMethod == 98){
		if(LotteryStorage["tenxunffc"]["line1"].length > 0 || LotteryStorage["tenxunffc"]["line2"].length > 0){
			$("#tenxunffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxunffc_qingkong").css("opacity",0.4);
		}
	}else if(tenxunffc_playMethod == 2 || tenxunffc_playMethod == 8 || tenxunffc_playMethod == 11 || tenxunffc_playMethod == 13 || tenxunffc_playMethod == 39
		|| tenxunffc_playMethod == 28 || tenxunffc_playMethod == 17 || tenxunffc_playMethod == 18 || tenxunffc_playMethod == 24 || tenxunffc_playMethod == 41
		|| tenxunffc_playMethod == 25 || tenxunffc_playMethod == 29 || tenxunffc_playMethod == 42 || tenxunffc_playMethod == 43 || tenxunffc_playMethod == 30
		|| tenxunffc_playMethod == 35 || tenxunffc_playMethod == 36 || tenxunffc_playMethod == 31 || tenxunffc_playMethod == 32 || tenxunffc_playMethod == 19
		|| tenxunffc_playMethod == 40 || tenxunffc_playMethod == 46 || tenxunffc_playMethod == 20 || tenxunffc_playMethod == 21 || tenxunffc_playMethod == 50
		|| tenxunffc_playMethod == 47 || tenxunffc_playMethod == 51 || tenxunffc_playMethod == 52 || tenxunffc_playMethod == 53 || tenxunffc_playMethod == 57 || tenxunffc_playMethod == 63
		|| tenxunffc_playMethod == 58 || tenxunffc_playMethod == 59 || tenxunffc_playMethod == 60 || tenxunffc_playMethod == 65 || tenxunffc_playMethod == 80 || tenxunffc_playMethod == 81 || tenxunffc_playType == 8
		|| tenxunffc_playMethod == 83 || tenxunffc_playMethod == 86 || tenxunffc_playMethod == 87 || tenxunffc_playMethod == 22 || tenxunffc_playMethod == 33 || tenxunffc_playMethod == 44
		|| tenxunffc_playMethod == 89 || tenxunffc_playMethod == 92 || tenxunffc_playMethod == 95 || tenxunffc_playMethod == 54 || tenxunffc_playMethod == 61
		|| tenxunffc_playMethod == 97 || tenxunffc_playType == 13  || tenxunffc_playType == 14 || tenxunffc_playType == 16){
		if(LotteryStorage["tenxunffc"]["line1"].length > 0){
			$("#tenxunffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxunffc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#tenxunffc_qingkong").css("opacity",0);
	}

	if($("#tenxunffc_qingkong").css("opacity") == "0"){
		$("#tenxunffc_qingkong").css("display","none");
	}else{
		$("#tenxunffc_qingkong").css("display","block");
	}

	if($('#tenxunffc_zhushu').html() > 0){
		$("#tenxunffc_queding").css("opacity",1.0);
	}else{
		$("#tenxunffc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  tenxunffc_qingkongAll(){
	$("#tenxunffc_ballView span").removeClass('redBalls_active');
	LotteryStorage["tenxunffc"]["line1"] = [];
	LotteryStorage["tenxunffc"]["line2"] = [];
	LotteryStorage["tenxunffc"]["line3"] = [];
	LotteryStorage["tenxunffc"]["line4"] = [];
	LotteryStorage["tenxunffc"]["line5"] = [];

	localStorageUtils.removeParam("tenxunffc_line1");
	localStorageUtils.removeParam("tenxunffc_line2");
	localStorageUtils.removeParam("tenxunffc_line3");
	localStorageUtils.removeParam("tenxunffc_line4");
	localStorageUtils.removeParam("tenxunffc_line5");

	$('#tenxunffc_zhushu').text(0);
	$('#tenxunffc_money').text(0);
	clearAwardWin("tenxunffc");
	tenxunffc_initFooterButton();
}

/**
 * [tenxunffc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function tenxunffc_calcNotes(){
	$('#tenxunffc_modeId').blur();
	$('#tenxunffc_fandian').blur();
	
	var notes = 0;

	if(tenxunffc_playMethod == 0){
		notes = LotteryStorage["tenxunffc"]["line1"].length *
			LotteryStorage["tenxunffc"]["line2"].length *
			LotteryStorage["tenxunffc"]["line3"].length *
			LotteryStorage["tenxunffc"]["line4"].length *
			LotteryStorage["tenxunffc"]["line5"].length;
	}else if(tenxunffc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,5);
	}else if(tenxunffc_playMethod == 3){
		if (LotteryStorage["tenxunffc"]["line1"].length >= 1 && LotteryStorage["tenxunffc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["tenxunffc"]["line1"],LotteryStorage["tenxunffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tenxunffc_playMethod == 4){
		if (LotteryStorage["tenxunffc"]["line1"].length >= 2 && LotteryStorage["tenxunffc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["tenxunffc"]["line2"],LotteryStorage["tenxunffc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(tenxunffc_playMethod == 5 || tenxunffc_playMethod == 12){
		if (LotteryStorage["tenxunffc"]["line1"].length >= 1 && LotteryStorage["tenxunffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["tenxunffc"]["line1"],LotteryStorage["tenxunffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tenxunffc_playMethod == 6 || tenxunffc_playMethod == 7 || tenxunffc_playMethod == 14){
		if (LotteryStorage["tenxunffc"]["line1"].length >= 1 && LotteryStorage["tenxunffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["tenxunffc"]["line1"],LotteryStorage["tenxunffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tenxunffc_playMethod == 9){
		notes = LotteryStorage["tenxunffc"]["line1"].length *
			LotteryStorage["tenxunffc"]["line2"].length *
			LotteryStorage["tenxunffc"]["line3"].length *
			LotteryStorage["tenxunffc"]["line4"].length;
	}else if(tenxunffc_playMethod == 18 || tenxunffc_playMethod == 29 || tenxunffc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["tenxunffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(tenxunffc_playMethod == 22 || tenxunffc_playMethod == 33 || tenxunffc_playMethod == 44 ){
		notes = 54;
	}else if(tenxunffc_playMethod == 54 || tenxunffc_playMethod == 61){
		notes = 9;
	}else if(tenxunffc_playMethod == 51 || tenxunffc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["tenxunffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(tenxunffc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,4);
	}else if(tenxunffc_playMethod == 13|| tenxunffc_playMethod == 64 || tenxunffc_playMethod == 66 || tenxunffc_playMethod == 68 || tenxunffc_playMethod == 70 || tenxunffc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,2);
	}else if(tenxunffc_playMethod == 37 || tenxunffc_playMethod == 26 || tenxunffc_playMethod == 15 || tenxunffc_playMethod == 75 || tenxunffc_playMethod == 77){
		notes = LotteryStorage["tenxunffc"]["line1"].length *
			LotteryStorage["tenxunffc"]["line2"].length *
			LotteryStorage["tenxunffc"]["line3"].length ;
	}else if(tenxunffc_playMethod == 39 || tenxunffc_playMethod == 28 || tenxunffc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["tenxunffc"]["line1"][i]);
		};
	}else if(tenxunffc_playMethod == 41 || tenxunffc_playMethod == 30 || tenxunffc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["tenxunffc"]["line1"].length,2);
	}else if(tenxunffc_playMethod == 42 || tenxunffc_playMethod == 31 || tenxunffc_playMethod == 20 || tenxunffc_playMethod == 68 || tenxunffc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,3);
	}else if(tenxunffc_playMethod == 43 || tenxunffc_playMethod == 32 || tenxunffc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["tenxunffc"]["line1"][i]);
		};
	}else if(tenxunffc_playMethod == 48 || tenxunffc_playMethod == 55 || tenxunffc_playMethod == 74 || tenxunffc_playMethod == 76){
		notes = LotteryStorage["tenxunffc"]["line1"].length *
			LotteryStorage["tenxunffc"]["line2"].length ;
	}else if(tenxunffc_playMethod == 50 || tenxunffc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["tenxunffc"]["line1"][i]);
		};
	}else if(tenxunffc_playMethod == 52 || tenxunffc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,2);
	}else if(tenxunffc_playMethod == 53 || tenxunffc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["tenxunffc"]["line1"][i]);
		};
	}else if(tenxunffc_playMethod == 62){
		notes = LotteryStorage["tenxunffc"]["line1"].length +
			LotteryStorage["tenxunffc"]["line2"].length +
			LotteryStorage["tenxunffc"]["line3"].length +
			LotteryStorage["tenxunffc"]["line4"].length +
			LotteryStorage["tenxunffc"]["line5"].length;
	}else if(tenxunffc_playType == 13 || tenxunffc_playType == 14 || tenxunffc_playType == 16 || tenxunffc_playMethod == 8 || tenxunffc_playMethod == 71
		|| tenxunffc_playMethod == 24 || tenxunffc_playMethod == 25 || tenxunffc_playMethod == 35 || tenxunffc_playMethod == 36 || tenxunffc_playMethod == 46
		|| tenxunffc_playMethod == 47 || tenxunffc_playMethod == 63 || tenxunffc_playMethod == 65 || tenxunffc_playMethod == 67 || tenxunffc_playMethod == 69 ){
		notes = LotteryStorage["tenxunffc"]["line1"].length ;
	}else if(tenxunffc_playMethod == 78){
		notes = LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line2"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line3"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line4"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line3"].length +
			LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line4"].length +
			LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line4"].length +
			LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line4"].length * LotteryStorage["tenxunffc"]["line5"].length;
	}else if (tenxunffc_playMethod == 80) {
		if ($("#tenxunffc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["tenxunffc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,2);
		}
	}else if (tenxunffc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,2) * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,2);
	}else if (tenxunffc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["tenxunffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,2);
	}else if (tenxunffc_playMethod == 84) {
		notes = LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line3"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line4"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line4"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line4"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line4"].length +
			LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line4"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line4"].length * LotteryStorage["tenxunffc"]["line5"].length ;
	}else if (tenxunffc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["tenxunffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,3);
	}else if (tenxunffc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["tenxunffc"]["line1"].length,2) * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,3);
	}else if (tenxunffc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,3) * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,3);
	}else if (tenxunffc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["tenxunffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["tenxunffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,3);
	}else if (tenxunffc_playMethod == 93) {
		notes = LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line4"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line4"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line1"].length * LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line4"].length * LotteryStorage["tenxunffc"]["line5"].length +
			LotteryStorage["tenxunffc"]["line2"].length * LotteryStorage["tenxunffc"]["line3"].length * LotteryStorage["tenxunffc"]["line4"].length * LotteryStorage["tenxunffc"]["line5"].length;
	}else if (tenxunffc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,4)
			* mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,4);
	}else if (tenxunffc_playMethod == 96) {
		if (LotteryStorage["tenxunffc"]["line1"].length >= 1 && LotteryStorage["tenxunffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["tenxunffc"]["line1"],LotteryStorage["tenxunffc"]["line2"])
				* mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (tenxunffc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["tenxunffc"]["line1"].length,2) * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,4);
	}else if (tenxunffc_playMethod == 98) {
		if (LotteryStorage["tenxunffc"]["line1"].length >= 1 && LotteryStorage["tenxunffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["tenxunffc"]["line1"],LotteryStorage["tenxunffc"]["line2"]) * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = tenxunffcValidData($("#tenxunffc_single").val());
	}

	if(tenxunffc_sntuo == 3 || tenxunffc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","tenxunffc"),LotteryInfo.getMethodId("ssc",tenxunffc_playMethod))){
	}else{
		if(parseInt($('#tenxunffc_modeId').val()) == 8){
			$("#tenxunffc_random").hide();
		}else{
			$("#tenxunffc_random").show();
		}
	}

	//验证是否为空
	if( $("#tenxunffc_beiNum").val() =="" || parseInt($("#tenxunffc_beiNum").val()) == 0){
		$("#tenxunffc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#tenxunffc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#tenxunffc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#tenxunffc_zhushu').text(notes);
		if($("#tenxunffc_modeId").val() == "8"){
			$('#tenxunffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxunffc_beiNum").val()),0.002));
		}else if ($("#tenxunffc_modeId").val() == "2"){
			$('#tenxunffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxunffc_beiNum").val()),0.2));
		}else if ($("#tenxunffc_modeId").val() == "1"){
			$('#tenxunffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxunffc_beiNum").val()),0.02));
		}else{
			$('#tenxunffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxunffc_beiNum").val()),2));
		}
	} else {
		$('#tenxunffc_zhushu').text(0);
		$('#tenxunffc_money').text(0);
	}
	tenxunffc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('tenxunffc',tenxunffc_playMethod);
}

/**
 * [tenxunffc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function tenxunffc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#tenxunffc_queding").bind('click', function(event) {

		tenxunffc_rebate = $("#tenxunffc_fandian option:last").val();
		if(parseInt($('#tenxunffc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		tenxunffc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
//		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;
		//20180927  需求读取配置文件。
		if (Number($('#tenxunffc_money').html()) < Number(min_Money)){
			toastUtils.showToast('订单最低金额'+ min_Money + '元');
			return;
		}

		/*if(parseInt($('#tenxunffc_modeId').val()) == 8){
			if (Number($('#tenxunffc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('tenxunffc',tenxunffc_playMethod);

		submitParams.lotteryType = "tenxunffc";
		var play = LotteryInfo.getPlayName("ssc",tenxunffc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",tenxunffc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = tenxunffc_playType;
		submitParams.playMethodIndex = tenxunffc_playMethod;
		var selectedBalls = [];
		if(tenxunffc_playMethod == 0 || tenxunffc_playMethod == 3 || tenxunffc_playMethod == 4
			|| tenxunffc_playMethod == 5 || tenxunffc_playMethod == 6 || tenxunffc_playMethod == 7
			|| tenxunffc_playMethod == 9 || tenxunffc_playMethod == 12 || tenxunffc_playMethod == 14
			|| tenxunffc_playMethod == 37 || tenxunffc_playMethod == 26 || tenxunffc_playMethod == 15
			|| tenxunffc_playMethod == 48 || tenxunffc_playMethod == 55 || tenxunffc_playMethod == 74 || tenxunffc_playType == 9){
			$("#tenxunffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(tenxunffc_playMethod == 2 || tenxunffc_playMethod == 8 || tenxunffc_playMethod == 11 || tenxunffc_playMethod == 13 || tenxunffc_playMethod == 24
			|| tenxunffc_playMethod == 39 || tenxunffc_playMethod == 28 || tenxunffc_playMethod == 17 || tenxunffc_playMethod == 18 || tenxunffc_playMethod == 25
			|| tenxunffc_playMethod == 22 || tenxunffc_playMethod == 33 || tenxunffc_playMethod == 44 || tenxunffc_playMethod == 54 || tenxunffc_playMethod == 61
			|| tenxunffc_playMethod == 41 || tenxunffc_playMethod == 42 || tenxunffc_playMethod == 43 || tenxunffc_playMethod == 29 || tenxunffc_playMethod == 35
			|| tenxunffc_playMethod == 30 || tenxunffc_playMethod == 31 || tenxunffc_playMethod == 32 || tenxunffc_playMethod == 40 || tenxunffc_playMethod == 36
			|| tenxunffc_playMethod == 19 || tenxunffc_playMethod == 20 || tenxunffc_playMethod == 21 || tenxunffc_playMethod == 46 || tenxunffc_playMethod == 47
			|| tenxunffc_playMethod == 50 || tenxunffc_playMethod == 57 || tenxunffc_playType == 8 || tenxunffc_playMethod == 51 || tenxunffc_playMethod == 58
			|| tenxunffc_playMethod == 52 || tenxunffc_playMethod == 53|| tenxunffc_playMethod == 59 || tenxunffc_playMethod == 60 || tenxunffc_playType == 13 || tenxunffc_playType == 14|| tenxunffc_playType == 16){
			$("#tenxunffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(tenxunffc_playType == 7 || tenxunffc_playMethod == 78 || tenxunffc_playMethod == 84 || tenxunffc_playMethod == 93){
			$("#tenxunffc_ballView div.ballView").each(function(){
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
		}else if(tenxunffc_playMethod == 80 || tenxunffc_playMethod == 81 || tenxunffc_playMethod == 83
			|| tenxunffc_playMethod == 86 || tenxunffc_playMethod == 87 || tenxunffc_playMethod == 89
			|| tenxunffc_playMethod == 92 || tenxunffc_playMethod == 95 || tenxunffc_playMethod == 97){
			$("#tenxunffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#tenxunffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#tenxunffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#tenxunffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#tenxunffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#tenxunffc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (tenxunffc_playMethod == 96 || tenxunffc_playMethod == 98) {
			$("#tenxunffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#tenxunffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#tenxunffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#tenxunffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#tenxunffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#tenxunffc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			tenxunffcValidateData("submit");
			var array = handleSingleStr($("#tenxunffc_single").val());
			if(tenxunffc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(tenxunffc_playMethod == 10 || tenxunffc_playMethod == 38 || tenxunffc_playMethod == 27
				|| tenxunffc_playMethod == 16 || tenxunffc_playMethod == 49 || tenxunffc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(tenxunffc_playMethod == 45 || tenxunffc_playMethod == 34 || tenxunffc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(tenxunffc_playMethod == 79 || tenxunffc_playMethod == 82 || tenxunffc_playMethod == 85 || tenxunffc_playMethod == 88 ||
				tenxunffc_playMethod == 89 || tenxunffc_playMethod == 90 || tenxunffc_playMethod == 91 || tenxunffc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#tenxunffc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#tenxunffc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#tenxunffc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#tenxunffc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#tenxunffc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#tenxunffc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#tenxunffc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#tenxunffc_fandian").val());
		submitParams.notes = $('#tenxunffc_zhushu').html();
		submitParams.sntuo = tenxunffc_sntuo;
		submitParams.multiple = $('#tenxunffc_beiNum').val();  //requirement
		submitParams.rebates = $('#tenxunffc_fandian').val();  //requirement
		submitParams.playMode = $('#tenxunffc_modeId').val();  //requirement
		submitParams.money = $('#tenxunffc_money').html();  //requirement
		submitParams.award = $('#tenxunffc_minAward').html();  //奖金
		submitParams.maxAward = $('#tenxunffc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#tenxunffc_ballView").empty();
		tenxunffc_qingkongAll();
	});
}

/**
 * [tenxunffc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function tenxunffc_randomOne(){
	tenxunffc_qingkongAll();
	if(tenxunffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["tenxunffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tenxunffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tenxunffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["tenxunffc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["tenxunffc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line2"], function(k, v){
			$("#" + "tenxunffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line3"], function(k, v){
			$("#" + "tenxunffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line4"], function(k, v){
			$("#" + "tenxunffc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line5"], function(k, v){
			$("#" + "tenxunffc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["tenxunffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["tenxunffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tenxunffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tenxunffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["tenxunffc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line2"], function(k, v){
			$("#" + "tenxunffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line3"], function(k, v){
			$("#" + "tenxunffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line4"], function(k, v){
			$("#" + "tenxunffc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(tenxunffc_playMethod == 37 || tenxunffc_playMethod == 26 || tenxunffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["tenxunffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tenxunffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tenxunffc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line2"], function(k, v){
			$("#" + "tenxunffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line3"], function(k, v){
			$("#" + "tenxunffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 41 || tenxunffc_playMethod == 30 || tenxunffc_playMethod == 19 || tenxunffc_playMethod == 68
		|| tenxunffc_playMethod == 52 || tenxunffc_playMethod == 64 || tenxunffc_playMethod == 66
		|| tenxunffc_playMethod == 59 || tenxunffc_playMethod == 70 || tenxunffc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["tenxunffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 42 || tenxunffc_playMethod == 31 || tenxunffc_playMethod == 20 || tenxunffc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["tenxunffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 39 || tenxunffc_playMethod == 28 || tenxunffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["tenxunffc"]["line1"].push(number+'');
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 43 || tenxunffc_playMethod == 32 || tenxunffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["tenxunffc"]["line1"].push(number+'');
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 48 || tenxunffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["tenxunffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tenxunffc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line2"], function(k, v){
			$("#" + "tenxunffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 25 || tenxunffc_playMethod == 36 || tenxunffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["tenxunffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 50 || tenxunffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["tenxunffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 53 || tenxunffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["tenxunffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["tenxunffc"]["line"+line].push(number+"");
		$.each(LotteryStorage["tenxunffc"]["line"+line], function(k, v){
			$("#" + "tenxunffc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 63 || tenxunffc_playMethod == 67 || tenxunffc_playMethod == 69 || tenxunffc_playMethod == 71 || tenxunffc_playType == 13
		|| tenxunffc_playMethod == 65 || tenxunffc_playMethod == 18 || tenxunffc_playMethod == 29 || tenxunffc_playMethod == 40 || tenxunffc_playMethod == 22
		|| tenxunffc_playMethod == 33 || tenxunffc_playMethod == 44 || tenxunffc_playMethod == 54 || tenxunffc_playMethod == 61
		|| tenxunffc_playMethod == 24 || tenxunffc_playMethod == 35 || tenxunffc_playMethod == 46 || tenxunffc_playMethod == 51 || tenxunffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["tenxunffc"]["line1"].push(number+'');
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 74 || tenxunffc_playMethod == 76){
		// 可以混合投注的代码（下面一行）
		//var array = mathUtil.getNums(2,4);
		// 不可以混合投注的代码（下面二行）
        var lineArray = mathUtil.getInts(0,3);
        var array = mathUtil.getDifferentNums(2,lineArray);
        
		LotteryStorage["tenxunffc"]["line1"].push(array[0]+"");
		LotteryStorage["tenxunffc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line2"], function(k, v){
			$("#" + "tenxunffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 75 || tenxunffc_playMethod == 77){
		// 可以混合投注的代码（下面一行）
		//var array = mathUtil.getNums(3,4);
		// 不可以混合投注的代码（下面二行）
        var lineArray = mathUtil.getInts(0,3);
        var array = mathUtil.getDifferentNums_multiple(3,lineArray);
        
		LotteryStorage["tenxunffc"]["line1"].push(array[0]+"");
		LotteryStorage["tenxunffc"]["line2"].push(array[1]+"");
		LotteryStorage["tenxunffc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line2"], function(k, v){
			$("#" + "tenxunffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line3"], function(k, v){
			$("#" + "tenxunffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["tenxunffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tenxunffc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["tenxunffc"]["line"+lines[0]], function(k, v){
			$("#" + "tenxunffc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line"+lines[1]], function(k, v){
			$("#" + "tenxunffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["tenxunffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tenxunffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["tenxunffc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["tenxunffc"]["line"+lines[0]], function(k, v){
			$("#" + "tenxunffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line"+lines[1]], function(k, v){
			$("#" + "tenxunffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line"+lines[0]], function(k, v){
			$("#" + "tenxunffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["tenxunffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tenxunffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["tenxunffc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["tenxunffc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["tenxunffc"]["line"+lines[0]], function(k, v){
			$("#" + "tenxunffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line"+lines[1]], function(k, v){
			$("#" + "tenxunffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line"+lines[2]], function(k, v){
			$("#" + "tenxunffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxunffc"]["line"+lines[3]], function(k, v){
			$("#" + "tenxunffc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(tenxunffc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["tenxunffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxunffc"]["line1"], function(k, v){
			$("#" + "tenxunffc_line1" + v).toggleClass("redBalls_active");
		});
	}
	tenxunffc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function tenxunffc_checkOutRandom(playMethod){
	var obj = new Object();
	if(tenxunffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 18 || tenxunffc_playMethod == 29 || tenxunffc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(tenxunffc_playMethod == 22 || tenxunffc_playMethod == 33 || tenxunffc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(tenxunffc_playMethod == 54 || tenxunffc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(tenxunffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 37 || tenxunffc_playMethod == 26 || tenxunffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 39 || tenxunffc_playMethod == 28 || tenxunffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(tenxunffc_playMethod == 41 || tenxunffc_playMethod == 30 || tenxunffc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(tenxunffc_playMethod == 52 || tenxunffc_playMethod == 59 || tenxunffc_playMethod == 64 || tenxunffc_playMethod == 66 || tenxunffc_playMethod == 68
		||tenxunffc_playMethod == 70 || tenxunffc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 42 || tenxunffc_playMethod == 31 || tenxunffc_playMethod == 20 || tenxunffc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 43 || tenxunffc_playMethod == 32 || tenxunffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(tenxunffc_playMethod == 48 || tenxunffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 50 || tenxunffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(tenxunffc_playMethod == 53 || tenxunffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(tenxunffc_playMethod == 62){
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
	}else if(tenxunffc_playMethod == 63 || tenxunffc_playMethod == 65 || tenxunffc_playMethod == 67 || tenxunffc_playMethod == 69 || tenxunffc_playMethod == 71
		|| tenxunffc_playMethod == 24 || tenxunffc_playMethod == 35 || tenxunffc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 25 || tenxunffc_playMethod == 36 || tenxunffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(tenxunffc_playMethod == 51 || tenxunffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(tenxunffc_playMethod == 74 || tenxunffc_playMethod == 76){
		//var array = mathUtil.getNums(2,4);
        var lineArray = mathUtil.getInts(0,3);
        var array = mathUtil.getDifferentNums(2,lineArray);
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
	}else if(tenxunffc_playMethod == 75 || tenxunffc_playMethod == 77){
		//var array = mathUtil.getNums(3,4);
        var lineArray = mathUtil.getInts(0,3);
        var array = mathUtil.getDifferentNums_multiple(3,lineArray);
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
	}else if(tenxunffc_playMethod == 78){
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
	}else if(tenxunffc_playMethod == 84){
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
	}else if(tenxunffc_playMethod == 93){
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
	obj.sntuo = tenxunffc_sntuo;
	obj.multiple = 1;
	obj.rebates = tenxunffc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('tenxunffc',tenxunffc_playMethod,obj);  //机选奖金计算
	obj.award = $('#tenxunffc_minAward').html();     //奖金
	obj.maxAward = $('#tenxunffc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [tenxunffcValidateData 单式数据验证]
 */
function tenxunffcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#tenxunffc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	tenxunffcValidData(textStr,type);
}

function tenxunffcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(tenxunffc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 38 || tenxunffc_playMethod == 27 || tenxunffc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 45 || tenxunffc_playMethod == 34 || tenxunffc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 49 || tenxunffc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,2);
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,2);
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,3);
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,3);
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,3);
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,3);
		tenxunffcShowFooter(true,notes);
	}else if(tenxunffc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tenxunffc_tab .button.red").size() ,4);
		tenxunffcShowFooter(true,notes);
	}

	$('#tenxunffc_delRepeat').off('click');
	$('#tenxunffc_delRepeat').on('click',function () {
		content.str = $('#tenxunffc_single').val() ? $('#tenxunffc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		tenxunffcShowFooter(true,notes);
		$("#tenxunffc_single").val(array.join(" "));
	});

	$("#tenxunffc_single").val(array.join(" "));
	return notes;
}

function tenxunffcShowFooter(isValid,notes){
	$('#tenxunffc_zhushu').text(notes);
	if($("#tenxunffc_modeId").val() == "8"){
		$('#tenxunffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxunffc_beiNum").val()),0.002));
	}else if ($("#tenxunffc_modeId").val() == "2"){
		$('#tenxunffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxunffc_beiNum").val()),0.2));
	}else if ($("#tenxunffc_modeId").val() == "1"){
		$('#tenxunffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxunffc_beiNum").val()),0.02));
	}else{
		$('#tenxunffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxunffc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	tenxunffc_initFooterButton();
	calcAwardWin('tenxunffc',tenxunffc_playMethod);  //计算奖金和盈利
}