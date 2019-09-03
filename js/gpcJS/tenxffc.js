var tenxffc_playType = 2;
var tenxffc_playMethod = 15;
var tenxffc_sntuo = 0;
var tenxffc_rebate;
var tenxffcScroll;

//进入这个页面时调用
function tenxffcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("tenxffc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("tenxffc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function tenxffcPageUnloadedPanel(){
	$("#tenxffc_queding").off('click');
	$("#tenxffcPage_back").off('click');
	$("#tenxffc_ballView").empty();
	$("#tenxffcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="tenxffcPlaySelect"></select>');
	$("#tenxffcSelect").append($select);
}

//入口函数
function tenxffc_init(){
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
	$("#tenxffc_title").html(LotteryInfo.getLotteryNameByTag("tenxffc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == tenxffc_playType && j == tenxffc_playMethod){
					$play.append('<option value="tenxffc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="tenxffc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(tenxffc_playMethod,onShowArray)>-1 ){
						tenxffc_playType = i;
						tenxffc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#tenxffcPlaySelect").append($play);
		}
	}
	
	if($("#tenxffcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("tenxffcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:tenxffcChangeItem
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

	GetLotteryInfo("tenxffc",function (){
		tenxffcChangeItem("tenxffc"+tenxffc_playMethod);
	});

	//添加滑动条
	if(!tenxffcScroll){
		tenxffcScroll = new IScroll('#tenxffcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("tenxffc",LotteryInfo.getLotteryIdByTag("tenxffc"));

	//获取上一期开奖
	queryLastPrize("tenxffc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('tenxffc');

	//机选选号
	$("#tenxffc_random").off('click');
	$("#tenxffc_random").on('click', function(event) {
		tenxffc_randomOne();
	});

	//返回
	$("#tenxffcPage_back").on('click', function(event) {
		// tenxffc_playType = 2;
		// tenxffc_playMethod = 15;
		$("#tenxffc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		tenxffc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#tenxffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",tenxffc_playMethod));
	//玩法说明
	$("#tenxffc_paly_shuoming").off('click');
	$("#tenxffc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#tenxffc_shuoming").text());
	});

	qingKong("tenxffc");//清空
	tenxffc_submitData();
}

function tenxffcResetPlayType(){
	tenxffc_playType = 2;
	tenxffc_playMethod = 15;
}

function tenxffcChangeItem(val) {
	tenxffc_qingkongAll();
	var temp = val.substring("tenxffc".length,val.length);
	if(val == "tenxffc0"){
		//直选复式
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 0;
		tenxffc_playMethod = 0;
		createFiveLineLayout("tenxffc", function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc1"){
		//直选单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 0;
		tenxffc_playMethod = 1;
		$("#tenxffc_ballView").empty();
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc2"){
		//组选120
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 0;
		tenxffc_playMethod = 2;
		createOneLineLayout("tenxffc","至少选择5个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc3"){
		//组选60
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 0;
		tenxffc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc4"){
		//组选30
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 0;
		tenxffc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc5"){
		//组选20
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 0;
		tenxffc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc6"){
		//组选10
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 0;
		tenxffc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc7"){
		//组选5
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 0;
		tenxffc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc8"){
		//总和大小单双
		$("#tenxffc_random").show();
		var num = ["大","小","单","双"];
		tenxffc_sntuo = 0;
		tenxffc_playType = 0;
		tenxffc_playMethod = 8;
		createNonNumLayout("tenxffc",tenxffc_playMethod,num,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc9"){
		//直选复式
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 1;
		tenxffc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("tenxffc",tips, function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc10"){
		//直选单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 1;
		tenxffc_playMethod = 10;
		$("#tenxffc_ballView").empty();
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc11"){
		//组选24
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 1;
		tenxffc_playMethod = 11;
		createOneLineLayout("tenxffc","至少选择4个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc12"){
		//组选12
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 1;
		tenxffc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc13"){
		//组选6
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 1;
		tenxffc_playMethod = 13;
		createOneLineLayout("tenxffc","二重号:至少选择2个号码",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc14"){
		//组选4
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 1;
		tenxffc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc15"){
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc16"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 2;
		tenxffc_playMethod = 16;
		$("#tenxffc_ballView").empty();
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc17"){
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 17;
		createSumLayout("tenxffc",0,27,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc18"){
		//直选跨度
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 18;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc19"){
		//后三组三
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 19;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc20"){
		//后三组六
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 20;
		createOneLineLayout("tenxffc","至少选择3个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc21"){
		//后三和值
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 21;
		createSumLayout("tenxffc",1,26,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc22"){
		//后三组选包胆
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 22;
		tenxffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxffc",array,["请选择一个号码"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc23"){
		//后三混合组选
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 2;
		tenxffc_playMethod = 23;
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc24"){
		//和值尾数
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 24;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc25"){
		//特殊号
		$("#tenxffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tenxffc_sntuo = 0;
		tenxffc_playType = 2;
		tenxffc_playMethod = 25;
		createNonNumLayout("tenxffc",tenxffc_playMethod,num,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc26"){
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc27"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 3;
		tenxffc_playMethod = 27;
		$("#tenxffc_ballView").empty();
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc28"){
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 28;
		createSumLayout("tenxffc",0,27,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc29"){
		//直选跨度
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 29;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc30"){
		//中三组三
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 30;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc31"){
		//中三组六
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 31;
		createOneLineLayout("tenxffc","至少选择3个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc32"){
		//中三和值
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 32;
		createSumLayout("tenxffc",1,26,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc33"){
		//中三组选包胆
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 33;
		tenxffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxffc",array,["请选择一个号码"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc34"){
		//中三混合组选
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 3;
		tenxffc_playMethod = 34;
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc35"){
		//和值尾数
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 35;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc36"){
		//特殊号
		$("#tenxffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tenxffc_sntuo = 0;
		tenxffc_playType = 3;
		tenxffc_playMethod = 36;
		createNonNumLayout("tenxffc",tenxffc_playMethod,num,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc37"){
		//直选复式
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc38"){
		//直选单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 4;
		tenxffc_playMethod = 38;
		$("#tenxffc_ballView").empty();
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc39"){
		//和值
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 39;
		createSumLayout("tenxffc",0,27,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc40"){
		//直选跨度
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 40;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc41"){
		//前三组三
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 41;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc42"){
		//前三组六
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 42;
		createOneLineLayout("tenxffc","至少选择3个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc43"){
		//前三和值
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 43;
		createSumLayout("tenxffc",1,26,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc44"){
		//前三组选包胆
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 44;
		tenxffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxffc",array,["请选择一个号码"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc45"){
		//前三混合组选
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 4;
		tenxffc_playMethod = 45;
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc46"){
		//和值尾数
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 46;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc47"){
		//特殊号
		$("#tenxffc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		tenxffc_sntuo = 0;
		tenxffc_playType = 4;
		tenxffc_playMethod = 47;
		createNonNumLayout("tenxffc",tenxffc_playMethod,num,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc48"){
		//后二复式
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 5;
		tenxffc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc49"){
		//后二单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 5;
		tenxffc_playMethod = 49;
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc50"){
		//后二和值
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 5;
		tenxffc_playMethod = 50;
		createSumLayout("tenxffc",0,18,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc51"){
		//直选跨度
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 5;
		tenxffc_playMethod = 51;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc52"){
		//后二组选
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 5;
		tenxffc_playMethod = 52;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc53"){
		//后二和值
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 5;
		tenxffc_playMethod = 53;
		createSumLayout("tenxffc",1,17,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc54"){
		//后二组选包胆
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 5;
		tenxffc_playMethod = 54;
		tenxffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxffc",array,["请选择一个号码"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc55"){
		//前二复式
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 6;
		tenxffc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc56"){
		//前二单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 6;
		tenxffc_playMethod = 56;
		tenxffc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
	}else if(val == "tenxffc57"){
		//前二和值
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 6;
		tenxffc_playMethod = 57;
		createSumLayout("tenxffc",0,18,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc58"){
		//直选跨度
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 6;
		tenxffc_playMethod = 58;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc59"){
		//前二组选
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 6;
		tenxffc_playMethod = 59;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc60"){
		//前二和值
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 6;
		tenxffc_playMethod = 60;
		createSumLayout("tenxffc",1,17,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc61"){
		//前二组选包胆
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 6;
		tenxffc_playMethod = 61;
		tenxffc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("tenxffc",array,["请选择一个号码"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc62"){
		//定位复式
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 7;
		tenxffc_playMethod = 62;
		createFiveLineLayout("tenxffc", function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc63"){
		//后三一码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 63;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc64"){
		//后三二码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 64;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc65"){
		//前三一码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 65;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc66"){
		//前三二码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 66;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc67"){
		//后四一码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 67;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc68"){
		//后四二码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 68;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc69"){
		//前四一码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 69;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc70"){
		//前四二码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 70;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc71"){
		//五星一码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 71;
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc72"){
		//五星二码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 72;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc73"){
		//五星三码
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 8;
		tenxffc_playMethod = 73;
		createOneLineLayout("tenxffc","至少选择3个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc74"){
		//后二大小单双
		tenxffc_qingkongAll();
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 9;
		tenxffc_playMethod = 74;
		createTextBallTwoLayout("tenxffc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc75"){
		//后三大小单双
		tenxffc_qingkongAll();
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 9;
		tenxffc_playMethod = 75;
		createTextBallThreeLayout("tenxffc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc76"){
		//前二大小单双
		tenxffc_qingkongAll();
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 9;
		tenxffc_playMethod = 76;
		createTextBallTwoLayout("tenxffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc77"){
		//前三大小单双
		tenxffc_qingkongAll();
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 9;
		tenxffc_playMethod = 77;
		createTextBallThreeLayout("tenxffc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc78"){
		//直选复式
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 10;
		tenxffc_playMethod = 78;
		createFiveLineLayout("tenxffc",function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc79"){
		//直选单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 10;
		tenxffc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
		createRenXuanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc80"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 10;
		tenxffc_playMethod = 80;
		createSumLayout("tenxffc",0,18,function(){
			tenxffc_calcNotes();
		});
		createRenXuanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc81"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 10;
		tenxffc_playMethod = 81;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		createRenXuanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc82"){
		//组选单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 10;
		tenxffc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
		createRenXuanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc83"){
		//组选和值
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 10;
		tenxffc_playMethod = 83;
		createSumLayout("tenxffc",1,17,function(){
			tenxffc_calcNotes();
		});
		createRenXuanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc84"){
		//直选复式
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 11;
		tenxffc_playMethod = 84;
		createFiveLineLayout("tenxffc", function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc85"){
		//直选单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 11;
		tenxffc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
		createRenXuanSanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc86"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 11;
		tenxffc_playMethod = 86;
		createSumLayout("tenxffc",0,27,function(){
			tenxffc_calcNotes();
		});
		createRenXuanSanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc87"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 11;
		tenxffc_playMethod = 87;
		createOneLineLayout("tenxffc","至少选择2个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		createRenXuanSanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc88"){
		//组选单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 11;
		tenxffc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
		createRenXuanSanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc89"){
		//组选和值
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 11;
		tenxffc_playMethod = 89;
		createOneLineLayout("tenxffc","至少选择3个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		createRenXuanSanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc90"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 11;
		tenxffc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
		createRenXuanSanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc91"){
		//混合组选
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 11;
		tenxffc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
		createRenXuanSanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc92"){
		//组选和值
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 11;
		tenxffc_playMethod = 92;
		createSumLayout("tenxffc",1,26,function(){
			tenxffc_calcNotes();
		});
		createRenXuanSanLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc93"){
		$("#tenxffc_random").show();
		tenxffc_sntuo = 0;
		tenxffc_playType = 12;
		tenxffc_playMethod = 93;
		createFiveLineLayout("tenxffc", function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc94"){
		//直选单式
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 3;
		tenxffc_playType = 12;
		tenxffc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("tenxffc",tips);
		createRenXuanSiLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc95"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 12;
		tenxffc_playMethod = 95;
		createOneLineLayout("tenxffc","至少选择4个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		createRenXuanSiLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc96"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 12;
		tenxffc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		createRenXuanSiLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc97"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 12;
		tenxffc_playMethod = 97;
		$("#tenxffc_ballView").empty();
		createOneLineLayout("tenxffc","二重号:至少选择2个号码",0,9,false,function(){
			tenxffc_calcNotes();
		});
		createRenXuanSiLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc98"){
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 12;
		tenxffc_playMethod = 98;
		$("#tenxffc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("tenxffc",tips,0,9,false,function(){
			tenxffc_calcNotes();
		});
		createRenXuanSiLayout("tenxffc",tenxffc_playMethod,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc99"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 13;
		tenxffc_playMethod = 99;
		$("#tenxffc_ballView").empty();
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc100"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 13;
		tenxffc_playMethod = 100;
		$("#tenxffc_ballView").empty();
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc101"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 13;
		tenxffc_playMethod = 101;
		$("#tenxffc_ballView").empty();
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc102"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 13;
		tenxffc_playMethod = 102;
		$("#tenxffc_ballView").empty();
		createOneLineLayout("tenxffc","至少选择1个",0,9,false,function(){
			tenxffc_calcNotes();
		});
		tenxffc_qingkongAll();
	}else if(val == "tenxffc103"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 103;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc104"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 104;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc105"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 105;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc106"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 106;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc107"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 107;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc108"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 108;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc109"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 109;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc110"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 110;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc111"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 111;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}else if(val == "tenxffc112"){
		tenxffc_qingkongAll();
		$("#tenxffc_random").hide();
		tenxffc_sntuo = 0;
		tenxffc_playType = 14;
		tenxffc_playMethod = 112;
		createTextBallOneLayout("tenxffc",["龙","虎","和"],["至少选择一个"],function(){
			tenxffc_calcNotes();
		});
	}

	if(tenxffcScroll){
		tenxffcScroll.refresh();
		tenxffcScroll.scrollTo(0,0,1);
	}
	
	$("#tenxffc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("tenxffc",temp);
	hideRandomWhenLi("tenxffc",tenxffc_sntuo,tenxffc_playMethod);
	tenxffc_calcNotes();
}
/**
 * [tenxffc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function tenxffc_initFooterButton(){
	if(tenxffc_playMethod == 0 || tenxffc_playMethod == 62 || tenxffc_playMethod == 78
		|| tenxffc_playMethod == 84 || tenxffc_playMethod == 93 || tenxffc_playType == 7){
		if(LotteryStorage["tenxffc"]["line1"].length > 0 || LotteryStorage["tenxffc"]["line2"].length > 0 ||
			LotteryStorage["tenxffc"]["line3"].length > 0 || LotteryStorage["tenxffc"]["line4"].length > 0 ||
			LotteryStorage["tenxffc"]["line5"].length > 0){
			$("#tenxffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxffc_qingkong").css("opacity",0.4);
		}
	}else if(tenxffc_playMethod == 9){
		if(LotteryStorage["tenxffc"]["line1"].length > 0 || LotteryStorage["tenxffc"]["line2"].length > 0 ||
			LotteryStorage["tenxffc"]["line3"].length > 0 || LotteryStorage["tenxffc"]["line4"].length > 0 ){
			$("#tenxffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxffc_qingkong").css("opacity",0.4);
		}
	}else if(tenxffc_playMethod == 37 || tenxffc_playMethod == 4 || tenxffc_playMethod == 6
		|| tenxffc_playMethod == 26 || tenxffc_playMethod == 15 || tenxffc_playMethod == 75 || tenxffc_playMethod == 77){
		if(LotteryStorage["tenxffc"]["line1"].length > 0 || LotteryStorage["tenxffc"]["line2"].length > 0
			|| LotteryStorage["tenxffc"]["line3"].length > 0){
			$("#tenxffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxffc_qingkong").css("opacity",0.4);
		}
	}else if(tenxffc_playMethod == 3 || tenxffc_playMethod == 4 || tenxffc_playMethod == 5
		|| tenxffc_playMethod == 6 || tenxffc_playMethod == 7 || tenxffc_playMethod == 12
		|| tenxffc_playMethod == 14 || tenxffc_playMethod == 48 || tenxffc_playMethod == 55
		|| tenxffc_playMethod == 74 || tenxffc_playMethod == 76 || tenxffc_playMethod == 96 || tenxffc_playMethod == 98){
		if(LotteryStorage["tenxffc"]["line1"].length > 0 || LotteryStorage["tenxffc"]["line2"].length > 0){
			$("#tenxffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxffc_qingkong").css("opacity",0.4);
		}
	}else if(tenxffc_playMethod == 2 || tenxffc_playMethod == 8 || tenxffc_playMethod == 11 || tenxffc_playMethod == 13 || tenxffc_playMethod == 39
		|| tenxffc_playMethod == 28 || tenxffc_playMethod == 17 || tenxffc_playMethod == 18 || tenxffc_playMethod == 24 || tenxffc_playMethod == 41
		|| tenxffc_playMethod == 25 || tenxffc_playMethod == 29 || tenxffc_playMethod == 42 || tenxffc_playMethod == 43 || tenxffc_playMethod == 30
		|| tenxffc_playMethod == 35 || tenxffc_playMethod == 36 || tenxffc_playMethod == 31 || tenxffc_playMethod == 32 || tenxffc_playMethod == 19
		|| tenxffc_playMethod == 40 || tenxffc_playMethod == 46 || tenxffc_playMethod == 20 || tenxffc_playMethod == 21 || tenxffc_playMethod == 50
		|| tenxffc_playMethod == 47 || tenxffc_playMethod == 51 || tenxffc_playMethod == 52 || tenxffc_playMethod == 53 || tenxffc_playMethod == 57 || tenxffc_playMethod == 63
		|| tenxffc_playMethod == 58 || tenxffc_playMethod == 59 || tenxffc_playMethod == 60 || tenxffc_playMethod == 65 || tenxffc_playMethod == 80 || tenxffc_playMethod == 81 || tenxffc_playType == 8
		|| tenxffc_playMethod == 83 || tenxffc_playMethod == 86 || tenxffc_playMethod == 87 || tenxffc_playMethod == 22 || tenxffc_playMethod == 33 || tenxffc_playMethod == 44
		|| tenxffc_playMethod == 89 || tenxffc_playMethod == 92 || tenxffc_playMethod == 95 || tenxffc_playMethod == 54 || tenxffc_playMethod == 61
		|| tenxffc_playMethod == 97 || tenxffc_playType == 13  || tenxffc_playType == 14){
		if(LotteryStorage["tenxffc"]["line1"].length > 0){
			$("#tenxffc_qingkong").css("opacity",1.0);
		}else{
			$("#tenxffc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#tenxffc_qingkong").css("opacity",0);
	}

	if($("#tenxffc_qingkong").css("opacity") == "0"){
		$("#tenxffc_qingkong").css("display","none");
	}else{
		$("#tenxffc_qingkong").css("display","block");
	}

	if($('#tenxffc_zhushu').html() > 0){
		$("#tenxffc_queding").css("opacity",1.0);
	}else{
		$("#tenxffc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  tenxffc_qingkongAll(){
	$("#tenxffc_ballView span").removeClass('redBalls_active');
	LotteryStorage["tenxffc"]["line1"] = [];
	LotteryStorage["tenxffc"]["line2"] = [];
	LotteryStorage["tenxffc"]["line3"] = [];
	LotteryStorage["tenxffc"]["line4"] = [];
	LotteryStorage["tenxffc"]["line5"] = [];

	localStorageUtils.removeParam("tenxffc_line1");
	localStorageUtils.removeParam("tenxffc_line2");
	localStorageUtils.removeParam("tenxffc_line3");
	localStorageUtils.removeParam("tenxffc_line4");
	localStorageUtils.removeParam("tenxffc_line5");

	$('#tenxffc_zhushu').text(0);
	$('#tenxffc_money').text(0);
	clearAwardWin("tenxffc");
	tenxffc_initFooterButton();
}

/**
 * [tenxffc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function tenxffc_calcNotes(){
	$('#tenxffc_modeId').blur();
	$('#tenxffc_fandian').blur();
	
	var notes = 0;

	if(tenxffc_playMethod == 0){
		notes = LotteryStorage["tenxffc"]["line1"].length *
			LotteryStorage["tenxffc"]["line2"].length *
			LotteryStorage["tenxffc"]["line3"].length *
			LotteryStorage["tenxffc"]["line4"].length *
			LotteryStorage["tenxffc"]["line5"].length;
	}else if(tenxffc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,5);
	}else if(tenxffc_playMethod == 3){
		if (LotteryStorage["tenxffc"]["line1"].length >= 1 && LotteryStorage["tenxffc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["tenxffc"]["line1"],LotteryStorage["tenxffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tenxffc_playMethod == 4){
		if (LotteryStorage["tenxffc"]["line1"].length >= 2 && LotteryStorage["tenxffc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["tenxffc"]["line2"],LotteryStorage["tenxffc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(tenxffc_playMethod == 5 || tenxffc_playMethod == 12){
		if (LotteryStorage["tenxffc"]["line1"].length >= 1 && LotteryStorage["tenxffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["tenxffc"]["line1"],LotteryStorage["tenxffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tenxffc_playMethod == 6 || tenxffc_playMethod == 7 || tenxffc_playMethod == 14){
		if (LotteryStorage["tenxffc"]["line1"].length >= 1 && LotteryStorage["tenxffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["tenxffc"]["line1"],LotteryStorage["tenxffc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(tenxffc_playMethod == 9){
		notes = LotteryStorage["tenxffc"]["line1"].length *
			LotteryStorage["tenxffc"]["line2"].length *
			LotteryStorage["tenxffc"]["line3"].length *
			LotteryStorage["tenxffc"]["line4"].length;
	}else if(tenxffc_playMethod == 18 || tenxffc_playMethod == 29 || tenxffc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["tenxffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(tenxffc_playMethod == 22 || tenxffc_playMethod == 33 || tenxffc_playMethod == 44 ){
		notes = 54;
	}else if(tenxffc_playMethod == 54 || tenxffc_playMethod == 61){
		notes = 9;
	}else if(tenxffc_playMethod == 51 || tenxffc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["tenxffc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(tenxffc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,4);
	}else if(tenxffc_playMethod == 13|| tenxffc_playMethod == 64 || tenxffc_playMethod == 66 || tenxffc_playMethod == 68 || tenxffc_playMethod == 70 || tenxffc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,2);
	}else if(tenxffc_playMethod == 37 || tenxffc_playMethod == 26 || tenxffc_playMethod == 15 || tenxffc_playMethod == 75 || tenxffc_playMethod == 77){
		notes = LotteryStorage["tenxffc"]["line1"].length *
			LotteryStorage["tenxffc"]["line2"].length *
			LotteryStorage["tenxffc"]["line3"].length ;
	}else if(tenxffc_playMethod == 39 || tenxffc_playMethod == 28 || tenxffc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["tenxffc"]["line1"][i]);
		};
	}else if(tenxffc_playMethod == 41 || tenxffc_playMethod == 30 || tenxffc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["tenxffc"]["line1"].length,2);
	}else if(tenxffc_playMethod == 42 || tenxffc_playMethod == 31 || tenxffc_playMethod == 20 || tenxffc_playMethod == 68 || tenxffc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,3);
	}else if(tenxffc_playMethod == 43 || tenxffc_playMethod == 32 || tenxffc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["tenxffc"]["line1"][i]);
		};
	}else if(tenxffc_playMethod == 48 || tenxffc_playMethod == 55 || tenxffc_playMethod == 74 || tenxffc_playMethod == 76){
		notes = LotteryStorage["tenxffc"]["line1"].length *
			LotteryStorage["tenxffc"]["line2"].length ;
	}else if(tenxffc_playMethod == 50 || tenxffc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["tenxffc"]["line1"][i]);
		};
	}else if(tenxffc_playMethod == 52 || tenxffc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,2);
	}else if(tenxffc_playMethod == 53 || tenxffc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["tenxffc"]["line1"][i]);
		};
	}else if(tenxffc_playMethod == 62){
		notes = LotteryStorage["tenxffc"]["line1"].length +
			LotteryStorage["tenxffc"]["line2"].length +
			LotteryStorage["tenxffc"]["line3"].length +
			LotteryStorage["tenxffc"]["line4"].length +
			LotteryStorage["tenxffc"]["line5"].length;
	}else if(tenxffc_playType == 13 || tenxffc_playType == 14 || tenxffc_playMethod == 8 || tenxffc_playMethod == 71
		|| tenxffc_playMethod == 24 || tenxffc_playMethod == 25 || tenxffc_playMethod == 35 || tenxffc_playMethod == 36 || tenxffc_playMethod == 46
		|| tenxffc_playMethod == 47 || tenxffc_playMethod == 63 || tenxffc_playMethod == 65 || tenxffc_playMethod == 67 || tenxffc_playMethod == 69 ){
		notes = LotteryStorage["tenxffc"]["line1"].length ;
	}else if(tenxffc_playMethod == 78){
		notes = LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line2"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line3"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line4"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line3"].length +
			LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line4"].length +
			LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line4"].length +
			LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line4"].length * LotteryStorage["tenxffc"]["line5"].length;
	}else if (tenxffc_playMethod == 80) {
		if ($("#tenxffc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["tenxffc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,2);
		}
	}else if (tenxffc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,2) * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,2);
	}else if (tenxffc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["tenxffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,2);
	}else if (tenxffc_playMethod == 84) {
		notes = LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line3"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line4"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line4"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line4"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line4"].length +
			LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line4"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line4"].length * LotteryStorage["tenxffc"]["line5"].length ;
	}else if (tenxffc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["tenxffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,3);
	}else if (tenxffc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["tenxffc"]["line1"].length,2) * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,3);
	}else if (tenxffc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,3) * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,3);
	}else if (tenxffc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["tenxffc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["tenxffc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,3);
	}else if (tenxffc_playMethod == 93) {
		notes = LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line4"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line4"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line1"].length * LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line4"].length * LotteryStorage["tenxffc"]["line5"].length +
			LotteryStorage["tenxffc"]["line2"].length * LotteryStorage["tenxffc"]["line3"].length * LotteryStorage["tenxffc"]["line4"].length * LotteryStorage["tenxffc"]["line5"].length;
	}else if (tenxffc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,4)
			* mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,4);
	}else if (tenxffc_playMethod == 96) {
		if (LotteryStorage["tenxffc"]["line1"].length >= 1 && LotteryStorage["tenxffc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["tenxffc"]["line1"],LotteryStorage["tenxffc"]["line2"])
				* mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (tenxffc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["tenxffc"]["line1"].length,2) * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,4);
	}else if (tenxffc_playMethod == 98) {
		if (LotteryStorage["tenxffc"]["line1"].length >= 1 && LotteryStorage["tenxffc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["tenxffc"]["line1"],LotteryStorage["tenxffc"]["line2"]) * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = tenxffcValidData($("#tenxffc_single").val());
	}

	if(tenxffc_sntuo == 3 || tenxffc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","tenxffc"),LotteryInfo.getMethodId("ssc",tenxffc_playMethod))){
	}else{
		if(parseInt($('#tenxffc_modeId').val()) == 8){
			$("#tenxffc_random").hide();
		}else{
			$("#tenxffc_random").show();
		}
	}

	//验证是否为空
	if( $("#tenxffc_beiNum").val() =="" || parseInt($("#tenxffc_beiNum").val()) == 0){
		$("#tenxffc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#tenxffc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#tenxffc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#tenxffc_zhushu').text(notes);
		if($("#tenxffc_modeId").val() == "8"){
			$('#tenxffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxffc_beiNum").val()),0.002));
		}else if ($("#tenxffc_modeId").val() == "2"){
			$('#tenxffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxffc_beiNum").val()),0.2));
		}else if ($("#tenxffc_modeId").val() == "1"){
			$('#tenxffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxffc_beiNum").val()),0.02));
		}else{
			$('#tenxffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxffc_beiNum").val()),2));
		}
	} else {
		$('#tenxffc_zhushu').text(0);
		$('#tenxffc_money').text(0);
	}
	tenxffc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('tenxffc',tenxffc_playMethod);
}

/**
 * [tenxffc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function tenxffc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#tenxffc_queding").bind('click', function(event) {
		tenxffc_rebate = $("#tenxffc_fandian option:last").val();
		if(parseInt($('#tenxffc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		tenxffc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#tenxffc_modeId').val()) == 8){
			if (Number($('#tenxffc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('tenxffc',tenxffc_playMethod);

		submitParams.lotteryType = "tenxffc";
		var play = LotteryInfo.getPlayName("ssc",tenxffc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",tenxffc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = tenxffc_playType;
		submitParams.playMethodIndex = tenxffc_playMethod;
		var selectedBalls = [];
		if(tenxffc_playMethod == 0 || tenxffc_playMethod == 3 || tenxffc_playMethod == 4
			|| tenxffc_playMethod == 5 || tenxffc_playMethod == 6 || tenxffc_playMethod == 7
			|| tenxffc_playMethod == 9 || tenxffc_playMethod == 12 || tenxffc_playMethod == 14
			|| tenxffc_playMethod == 37 || tenxffc_playMethod == 26 || tenxffc_playMethod == 15
			|| tenxffc_playMethod == 48 || tenxffc_playMethod == 55 || tenxffc_playMethod == 74 || tenxffc_playType == 9){
			$("#tenxffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(tenxffc_playMethod == 2 || tenxffc_playMethod == 8 || tenxffc_playMethod == 11 || tenxffc_playMethod == 13 || tenxffc_playMethod == 24
			|| tenxffc_playMethod == 39 || tenxffc_playMethod == 28 || tenxffc_playMethod == 17 || tenxffc_playMethod == 18 || tenxffc_playMethod == 25
			|| tenxffc_playMethod == 22 || tenxffc_playMethod == 33 || tenxffc_playMethod == 44 || tenxffc_playMethod == 54 || tenxffc_playMethod == 61
			|| tenxffc_playMethod == 41 || tenxffc_playMethod == 42 || tenxffc_playMethod == 43 || tenxffc_playMethod == 29 || tenxffc_playMethod == 35
			|| tenxffc_playMethod == 30 || tenxffc_playMethod == 31 || tenxffc_playMethod == 32 || tenxffc_playMethod == 40 || tenxffc_playMethod == 36
			|| tenxffc_playMethod == 19 || tenxffc_playMethod == 20 || tenxffc_playMethod == 21 || tenxffc_playMethod == 46 || tenxffc_playMethod == 47
			|| tenxffc_playMethod == 50 || tenxffc_playMethod == 57 || tenxffc_playType == 8 || tenxffc_playMethod == 51 || tenxffc_playMethod == 58
			|| tenxffc_playMethod == 52 || tenxffc_playMethod == 53|| tenxffc_playMethod == 59 || tenxffc_playMethod == 60 || tenxffc_playType == 13 || tenxffc_playType == 14){
			$("#tenxffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(tenxffc_playType == 7 || tenxffc_playMethod == 78 || tenxffc_playMethod == 84 || tenxffc_playMethod == 93){
			$("#tenxffc_ballView div.ballView").each(function(){
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
		}else if(tenxffc_playMethod == 80 || tenxffc_playMethod == 81 || tenxffc_playMethod == 83
			|| tenxffc_playMethod == 86 || tenxffc_playMethod == 87 || tenxffc_playMethod == 89
			|| tenxffc_playMethod == 92 || tenxffc_playMethod == 95 || tenxffc_playMethod == 97){
			$("#tenxffc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#tenxffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#tenxffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#tenxffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#tenxffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#tenxffc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (tenxffc_playMethod == 96 || tenxffc_playMethod == 98) {
			$("#tenxffc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#tenxffc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#tenxffc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#tenxffc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#tenxffc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#tenxffc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			tenxffcValidateData("submit");
			var array = handleSingleStr($("#tenxffc_single").val());
			if(tenxffc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(tenxffc_playMethod == 10 || tenxffc_playMethod == 38 || tenxffc_playMethod == 27
				|| tenxffc_playMethod == 16 || tenxffc_playMethod == 49 || tenxffc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(tenxffc_playMethod == 45 || tenxffc_playMethod == 34 || tenxffc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(tenxffc_playMethod == 79 || tenxffc_playMethod == 82 || tenxffc_playMethod == 85 || tenxffc_playMethod == 88 ||
				tenxffc_playMethod == 89 || tenxffc_playMethod == 90 || tenxffc_playMethod == 91 || tenxffc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#tenxffc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#tenxffc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#tenxffc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#tenxffc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#tenxffc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#tenxffc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#tenxffc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#tenxffc_fandian").val());
		submitParams.notes = $('#tenxffc_zhushu').html();
		submitParams.sntuo = tenxffc_sntuo;
		submitParams.multiple = $('#tenxffc_beiNum').val();  //requirement
		submitParams.rebates = $('#tenxffc_fandian').val();  //requirement
		submitParams.playMode = $('#tenxffc_modeId').val();  //requirement
		submitParams.money = $('#tenxffc_money').html();  //requirement
		submitParams.award = $('#tenxffc_minAward').html();  //奖金
		submitParams.maxAward = $('#tenxffc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#tenxffc_ballView").empty();
		tenxffc_qingkongAll();
	});
}

/**
 * [tenxffc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function tenxffc_randomOne(){
	tenxffc_qingkongAll();
	if(tenxffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["tenxffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tenxffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tenxffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["tenxffc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["tenxffc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line2"], function(k, v){
			$("#" + "tenxffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line3"], function(k, v){
			$("#" + "tenxffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line4"], function(k, v){
			$("#" + "tenxffc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line5"], function(k, v){
			$("#" + "tenxffc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["tenxffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["tenxffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tenxffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tenxffc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["tenxffc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line2"], function(k, v){
			$("#" + "tenxffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line3"], function(k, v){
			$("#" + "tenxffc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line4"], function(k, v){
			$("#" + "tenxffc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(tenxffc_playMethod == 37 || tenxffc_playMethod == 26 || tenxffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["tenxffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tenxffc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["tenxffc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line2"], function(k, v){
			$("#" + "tenxffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line3"], function(k, v){
			$("#" + "tenxffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 41 || tenxffc_playMethod == 30 || tenxffc_playMethod == 19 || tenxffc_playMethod == 68
		|| tenxffc_playMethod == 52 || tenxffc_playMethod == 64 || tenxffc_playMethod == 66
		|| tenxffc_playMethod == 59 || tenxffc_playMethod == 70 || tenxffc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["tenxffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 42 || tenxffc_playMethod == 31 || tenxffc_playMethod == 20 || tenxffc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["tenxffc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 39 || tenxffc_playMethod == 28 || tenxffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["tenxffc"]["line1"].push(number+'');
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 43 || tenxffc_playMethod == 32 || tenxffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["tenxffc"]["line1"].push(number+'');
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 48 || tenxffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["tenxffc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["tenxffc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line2"], function(k, v){
			$("#" + "tenxffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 25 || tenxffc_playMethod == 36 || tenxffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["tenxffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 50 || tenxffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["tenxffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 53 || tenxffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["tenxffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["tenxffc"]["line"+line].push(number+"");
		$.each(LotteryStorage["tenxffc"]["line"+line], function(k, v){
			$("#" + "tenxffc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 63 || tenxffc_playMethod == 67 || tenxffc_playMethod == 69 || tenxffc_playMethod == 71 || tenxffc_playType == 13
		|| tenxffc_playMethod == 65 || tenxffc_playMethod == 18 || tenxffc_playMethod == 29 || tenxffc_playMethod == 40 || tenxffc_playMethod == 22
		|| tenxffc_playMethod == 33 || tenxffc_playMethod == 44 || tenxffc_playMethod == 54 || tenxffc_playMethod == 61
		|| tenxffc_playMethod == 24 || tenxffc_playMethod == 35 || tenxffc_playMethod == 46 || tenxffc_playMethod == 51 || tenxffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["tenxffc"]["line1"].push(number+'');
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 74 || tenxffc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["tenxffc"]["line1"].push(array[0]+"");
		LotteryStorage["tenxffc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line2"], function(k, v){
			$("#" + "tenxffc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 75 || tenxffc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["tenxffc"]["line1"].push(array[0]+"");
		LotteryStorage["tenxffc"]["line2"].push(array[1]+"");
		LotteryStorage["tenxffc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line2"], function(k, v){
			$("#" + "tenxffc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line3"], function(k, v){
			$("#" + "tenxffc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["tenxffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tenxffc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["tenxffc"]["line"+lines[0]], function(k, v){
			$("#" + "tenxffc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line"+lines[1]], function(k, v){
			$("#" + "tenxffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["tenxffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tenxffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["tenxffc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["tenxffc"]["line"+lines[0]], function(k, v){
			$("#" + "tenxffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line"+lines[1]], function(k, v){
			$("#" + "tenxffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line"+lines[0]], function(k, v){
			$("#" + "tenxffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["tenxffc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["tenxffc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["tenxffc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["tenxffc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["tenxffc"]["line"+lines[0]], function(k, v){
			$("#" + "tenxffc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line"+lines[1]], function(k, v){
			$("#" + "tenxffc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line"+lines[2]], function(k, v){
			$("#" + "tenxffc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["tenxffc"]["line"+lines[3]], function(k, v){
			$("#" + "tenxffc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(tenxffc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["tenxffc"]["line1"].push(number+"");
		$.each(LotteryStorage["tenxffc"]["line1"], function(k, v){
			$("#" + "tenxffc_line1" + v).toggleClass("redBalls_active");
		});
	}
	tenxffc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function tenxffc_checkOutRandom(playMethod){
	var obj = new Object();
	if(tenxffc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tenxffc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(tenxffc_playMethod == 18 || tenxffc_playMethod == 29 || tenxffc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(tenxffc_playMethod == 22 || tenxffc_playMethod == 33 || tenxffc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(tenxffc_playMethod == 54 || tenxffc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(tenxffc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tenxffc_playMethod == 37 || tenxffc_playMethod == 26 || tenxffc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tenxffc_playMethod == 39 || tenxffc_playMethod == 28 || tenxffc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(tenxffc_playMethod == 41 || tenxffc_playMethod == 30 || tenxffc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(tenxffc_playMethod == 52 || tenxffc_playMethod == 59 || tenxffc_playMethod == 64 || tenxffc_playMethod == 66 || tenxffc_playMethod == 68
		||tenxffc_playMethod == 70 || tenxffc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(tenxffc_playMethod == 42 || tenxffc_playMethod == 31 || tenxffc_playMethod == 20 || tenxffc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(tenxffc_playMethod == 43 || tenxffc_playMethod == 32 || tenxffc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(tenxffc_playMethod == 48 || tenxffc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(tenxffc_playMethod == 50 || tenxffc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(tenxffc_playMethod == 53 || tenxffc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(tenxffc_playMethod == 62){
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
	}else if(tenxffc_playMethod == 63 || tenxffc_playMethod == 65 || tenxffc_playMethod == 67 || tenxffc_playMethod == 69 || tenxffc_playMethod == 71
		|| tenxffc_playMethod == 24 || tenxffc_playMethod == 35 || tenxffc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(tenxffc_playMethod == 25 || tenxffc_playMethod == 36 || tenxffc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(tenxffc_playMethod == 51 || tenxffc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(tenxffc_playMethod == 74 || tenxffc_playMethod == 76){
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
	}else if(tenxffc_playMethod == 75 || tenxffc_playMethod == 77){
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
	}else if(tenxffc_playMethod == 78){
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
	}else if(tenxffc_playMethod == 84){
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
	}else if(tenxffc_playMethod == 93){
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
	obj.sntuo = tenxffc_sntuo;
	obj.multiple = 1;
	obj.rebates = tenxffc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('tenxffc',tenxffc_playMethod,obj);  //机选奖金计算
	obj.award = $('#tenxffc_minAward').html();     //奖金
	obj.maxAward = $('#tenxffc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [tenxffcValidateData 单式数据验证]
 */
function tenxffcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#tenxffc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	tenxffcValidData(textStr,type);
}

function tenxffcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(tenxffc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 38 || tenxffc_playMethod == 27 || tenxffc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 45 || tenxffc_playMethod == 34 || tenxffc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 49 || tenxffc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,2);
        tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,2);
        tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,3);
        tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,3);
        tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,3);
        tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,3);
        tenxffcShowFooter(true,notes);
    }else if(tenxffc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#tenxffc_tab .button.red").size() ,4);
        tenxffcShowFooter(true,notes);
    }

	$('#tenxffc_delRepeat').off('click');
	$('#tenxffc_delRepeat').on('click',function () {
		content.str = $('#tenxffc_single').val() ? $('#tenxffc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		tenxffcShowFooter(true,notes);
		$("#tenxffc_single").val(array.join(" "));
	});

    $("#tenxffc_single").val(array.join(" "));
    return notes;
}

function tenxffcShowFooter(isValid,notes){
	$('#tenxffc_zhushu').text(notes);
	if($("#tenxffc_modeId").val() == "8"){
		$('#tenxffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxffc_beiNum").val()),0.002));
	}else if ($("#tenxffc_modeId").val() == "2"){
		$('#tenxffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxffc_beiNum").val()),0.2));
	}else if ($("#tenxffc_modeId").val() == "1"){
		$('#tenxffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxffc_beiNum").val()),0.02));
	}else{
		$('#tenxffc_money').text(bigNumberUtil.multiply(notes * parseInt($("#tenxffc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	tenxffc_initFooterButton();
	calcAwardWin('tenxffc',tenxffc_playMethod);  //计算奖金和盈利
}