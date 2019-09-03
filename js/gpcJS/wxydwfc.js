var wxydwfc_playType = 2;
var wxydwfc_playMethod = 15;
var wxydwfc_sntuo = 0;
var wxydwfc_rebate;
var wxydwfcScroll;

//进入这个页面时调用
function wxydwfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("wxydwfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("wxydwfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function wxydwfcPageUnloadedPanel(){
	$("#wxydwfc_queding").off('click');
	$("#wxydwfcPage_back").off('click');
	$("#wxydwfc_ballView").empty();
	$("#wxydwfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="wxydwfcPlaySelect"></select>');
	$("#wxydwfcSelect").append($select);
}

//入口函数
function wxydwfc_init(){
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
	$("#wxydwfc_title").html(LotteryInfo.getLotteryNameByTag("wxydwfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == wxydwfc_playType && j == wxydwfc_playMethod){
					$play.append('<option value="wxydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="wxydwfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(wxydwfc_playMethod,onShowArray)>-1 ){
						wxydwfc_playType = i;
						wxydwfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#wxydwfcPlaySelect").append($play);
		}
	}
	
	if($("#wxydwfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("wxydwfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:wxydwfcChangeItem
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

	GetLotteryInfo("wxydwfc",function (){
		wxydwfcChangeItem("wxydwfc"+wxydwfc_playMethod);
	});

	//添加滑动条
	if(!wxydwfcScroll){
		wxydwfcScroll = new IScroll('#wxydwfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("wxydwfc",LotteryInfo.getLotteryIdByTag("wxydwfc"));

	//获取上一期开奖
	queryLastPrize("wxydwfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('wxydwfc');

	//机选选号
	$("#wxydwfc_random").off('click');
	$("#wxydwfc_random").on('click', function(event) {
		wxydwfc_randomOne();
	});

	//返回
	$("#wxydwfcPage_back").on('click', function(event) {
		// wxydwfc_playType = 2;
		// wxydwfc_playMethod = 15;
		$("#wxydwfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		wxydwfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#wxydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",wxydwfc_playMethod));
	//玩法说明
	$("#wxydwfc_paly_shuoming").off('click');
	$("#wxydwfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#wxydwfc_shuoming").text());
	});

	qingKong("wxydwfc");//清空
	wxydwfc_submitData();
}

function wxydwfcResetPlayType(){
	wxydwfc_playType = 2;
	wxydwfc_playMethod = 15;
}

function wxydwfcChangeItem(val) {
	wxydwfc_qingkongAll();
	var temp = val.substring("wxydwfc".length,val.length);
	if(val == "wxydwfc0"){
		//直选复式
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 0;
		createFiveLineLayout("wxydwfc", function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc1"){
		//直选单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 1;
		$("#wxydwfc_ballView").empty();
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc2"){
		//组选120
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 2;
		createOneLineLayout("wxydwfc","至少选择5个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc3"){
		//组选60
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc4"){
		//组选30
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc5"){
		//组选20
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc6"){
		//组选10
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc7"){
		//组选5
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc8"){
		//总和大小单双
		$("#wxydwfc_random").show();
		var num = ["大","小","单","双"];
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 0;
		wxydwfc_playMethod = 8;
		createNonNumLayout("wxydwfc",wxydwfc_playMethod,num,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc9"){
		//直选复式
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 1;
		wxydwfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("wxydwfc",tips, function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc10"){
		//直选单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 1;
		wxydwfc_playMethod = 10;
		$("#wxydwfc_ballView").empty();
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc11"){
		//组选24
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 1;
		wxydwfc_playMethod = 11;
		createOneLineLayout("wxydwfc","至少选择4个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc12"){
		//组选12
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 1;
		wxydwfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc13"){
		//组选6
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 1;
		wxydwfc_playMethod = 13;
		createOneLineLayout("wxydwfc","二重号:至少选择2个号码",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc14"){
		//组选4
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 1;
		wxydwfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc15"){
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc16"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 16;
		$("#wxydwfc_ballView").empty();
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc17"){
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 17;
		createSumLayout("wxydwfc",0,27,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc18"){
		//直选跨度
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 18;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc19"){
		//后三组三
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 19;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc20"){
		//后三组六
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 20;
		createOneLineLayout("wxydwfc","至少选择3个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc21"){
		//后三和值
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 21;
		createSumLayout("wxydwfc",1,26,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc22"){
		//后三组选包胆
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 22;
		wxydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wxydwfc",array,["请选择一个号码"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc23"){
		//后三混合组选
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 23;
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc24"){
		//和值尾数
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 24;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc25"){
		//特殊号
		$("#wxydwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 2;
		wxydwfc_playMethod = 25;
		createNonNumLayout("wxydwfc",wxydwfc_playMethod,num,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc26"){
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc27"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 27;
		$("#wxydwfc_ballView").empty();
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc28"){
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 28;
		createSumLayout("wxydwfc",0,27,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc29"){
		//直选跨度
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 29;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc30"){
		//中三组三
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 30;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc31"){
		//中三组六
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 31;
		createOneLineLayout("wxydwfc","至少选择3个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc32"){
		//中三和值
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 32;
		createSumLayout("wxydwfc",1,26,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc33"){
		//中三组选包胆
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 33;
		wxydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wxydwfc",array,["请选择一个号码"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc34"){
		//中三混合组选
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 34;
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc35"){
		//和值尾数
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 35;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc36"){
		//特殊号
		$("#wxydwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 3;
		wxydwfc_playMethod = 36;
		createNonNumLayout("wxydwfc",wxydwfc_playMethod,num,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc37"){
		//直选复式
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc38"){
		//直选单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 38;
		$("#wxydwfc_ballView").empty();
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc39"){
		//和值
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 39;
		createSumLayout("wxydwfc",0,27,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc40"){
		//直选跨度
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 40;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc41"){
		//前三组三
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 41;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc42"){
		//前三组六
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 42;
		createOneLineLayout("wxydwfc","至少选择3个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc43"){
		//前三和值
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 43;
		createSumLayout("wxydwfc",1,26,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc44"){
		//前三组选包胆
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 44;
		wxydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wxydwfc",array,["请选择一个号码"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc45"){
		//前三混合组选
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 45;
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc46"){
		//和值尾数
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 46;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc47"){
		//特殊号
		$("#wxydwfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 4;
		wxydwfc_playMethod = 47;
		createNonNumLayout("wxydwfc",wxydwfc_playMethod,num,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc48"){
		//后二复式
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 5;
		wxydwfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc49"){
		//后二单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 5;
		wxydwfc_playMethod = 49;
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc50"){
		//后二和值
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 5;
		wxydwfc_playMethod = 50;
		createSumLayout("wxydwfc",0,18,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc51"){
		//直选跨度
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 5;
		wxydwfc_playMethod = 51;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc52"){
		//后二组选
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 5;
		wxydwfc_playMethod = 52;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc53"){
		//后二和值
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 5;
		wxydwfc_playMethod = 53;
		createSumLayout("wxydwfc",1,17,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc54"){
		//后二组选包胆
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 5;
		wxydwfc_playMethod = 54;
		wxydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wxydwfc",array,["请选择一个号码"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc55"){
		//前二复式
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 6;
		wxydwfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc56"){
		//前二单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 6;
		wxydwfc_playMethod = 56;
		wxydwfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
	}else if(val == "wxydwfc57"){
		//前二和值
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 6;
		wxydwfc_playMethod = 57;
		createSumLayout("wxydwfc",0,18,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc58"){
		//直选跨度
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 6;
		wxydwfc_playMethod = 58;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc59"){
		//前二组选
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 6;
		wxydwfc_playMethod = 59;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc60"){
		//前二和值
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 6;
		wxydwfc_playMethod = 60;
		createSumLayout("wxydwfc",1,17,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc61"){
		//前二组选包胆
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 6;
		wxydwfc_playMethod = 61;
		wxydwfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("wxydwfc",array,["请选择一个号码"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc62"){
		//定位复式
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 7;
		wxydwfc_playMethod = 62;
		createFiveLineLayout("wxydwfc", function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc63"){
		//后三一码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 63;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc64"){
		//后三二码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 64;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc65"){
		//前三一码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 65;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc66"){
		//前三二码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 66;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc67"){
		//后四一码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 67;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc68"){
		//后四二码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 68;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc69"){
		//前四一码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 69;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc70"){
		//前四二码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 70;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc71"){
		//五星一码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 71;
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc72"){
		//五星二码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 72;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc73"){
		//五星三码
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 8;
		wxydwfc_playMethod = 73;
		createOneLineLayout("wxydwfc","至少选择3个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc74"){
		//后二大小单双
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 9;
		wxydwfc_playMethod = 74;
		createTextBallTwoLayout("wxydwfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc75"){
		//后三大小单双
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 9;
		wxydwfc_playMethod = 75;
		createTextBallThreeLayout("wxydwfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc76"){
		//前二大小单双
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 9;
		wxydwfc_playMethod = 76;
		createTextBallTwoLayout("wxydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc77"){
		//前三大小单双
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 9;
		wxydwfc_playMethod = 77;
		createTextBallThreeLayout("wxydwfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc78"){
		//直选复式
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 10;
		wxydwfc_playMethod = 78;
		createFiveLineLayout("wxydwfc",function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc79"){
		//直选单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 10;
		wxydwfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
		createRenXuanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc80"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 10;
		wxydwfc_playMethod = 80;
		createSumLayout("wxydwfc",0,18,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc81"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 10;
		wxydwfc_playMethod = 81;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc82"){
		//组选单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 10;
		wxydwfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
		createRenXuanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc83"){
		//组选和值
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 10;
		wxydwfc_playMethod = 83;
		createSumLayout("wxydwfc",1,17,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc84"){
		//直选复式
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 84;
		createFiveLineLayout("wxydwfc", function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc85"){
		//直选单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
		createRenXuanSanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc86"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 86;
		createSumLayout("wxydwfc",0,27,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanSanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc87"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 87;
		createOneLineLayout("wxydwfc","至少选择2个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanSanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc88"){
		//组选单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
		createRenXuanSanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc89"){
		//组选和值
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 89;
		createOneLineLayout("wxydwfc","至少选择3个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanSanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc90"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
		createRenXuanSanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc91"){
		//混合组选
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
		createRenXuanSanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc92"){
		//组选和值
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 11;
		wxydwfc_playMethod = 92;
		createSumLayout("wxydwfc",1,26,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanSanLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc93"){
		$("#wxydwfc_random").show();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 12;
		wxydwfc_playMethod = 93;
		createFiveLineLayout("wxydwfc", function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc94"){
		//直选单式
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 3;
		wxydwfc_playType = 12;
		wxydwfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("wxydwfc",tips);
		createRenXuanSiLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc95"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 12;
		wxydwfc_playMethod = 95;
		createOneLineLayout("wxydwfc","至少选择4个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanSiLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc96"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 12;
		wxydwfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanSiLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc97"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 12;
		wxydwfc_playMethod = 97;
		$("#wxydwfc_ballView").empty();
		createOneLineLayout("wxydwfc","二重号:至少选择2个号码",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanSiLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc98"){
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 12;
		wxydwfc_playMethod = 98;
		$("#wxydwfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("wxydwfc",tips,0,9,false,function(){
			wxydwfc_calcNotes();
		});
		createRenXuanSiLayout("wxydwfc",wxydwfc_playMethod,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc99"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 13;
		wxydwfc_playMethod = 99;
		$("#wxydwfc_ballView").empty();
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc100"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 13;
		wxydwfc_playMethod = 100;
		$("#wxydwfc_ballView").empty();
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc101"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 13;
		wxydwfc_playMethod = 101;
		$("#wxydwfc_ballView").empty();
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc102"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 13;
		wxydwfc_playMethod = 102;
		$("#wxydwfc_ballView").empty();
		createOneLineLayout("wxydwfc","至少选择1个",0,9,false,function(){
			wxydwfc_calcNotes();
		});
		wxydwfc_qingkongAll();
	}else if(val == "wxydwfc103"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 103;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc104"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 104;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc105"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 105;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc106"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 106;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc107"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 107;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc108"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 108;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc109"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 109;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc110"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 110;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc111"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 111;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}else if(val == "wxydwfc112"){
		wxydwfc_qingkongAll();
		$("#wxydwfc_random").hide();
		wxydwfc_sntuo = 0;
		wxydwfc_playType = 14;
		wxydwfc_playMethod = 112;
		createTextBallOneLayout("wxydwfc",["龙","虎","和"],["至少选择一个"],function(){
			wxydwfc_calcNotes();
		});
	}

	if(wxydwfcScroll){
		wxydwfcScroll.refresh();
		wxydwfcScroll.scrollTo(0,0,1);
	}
	
	$("#wxydwfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("wxydwfc",temp);
	hideRandomWhenLi("wxydwfc",wxydwfc_sntuo,wxydwfc_playMethod);
	wxydwfc_calcNotes();
}
/**
 * [wxydwfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function wxydwfc_initFooterButton(){
	if(wxydwfc_playMethod == 0 || wxydwfc_playMethod == 62 || wxydwfc_playMethod == 78
		|| wxydwfc_playMethod == 84 || wxydwfc_playMethod == 93 || wxydwfc_playType == 7){
		if(LotteryStorage["wxydwfc"]["line1"].length > 0 || LotteryStorage["wxydwfc"]["line2"].length > 0 ||
			LotteryStorage["wxydwfc"]["line3"].length > 0 || LotteryStorage["wxydwfc"]["line4"].length > 0 ||
			LotteryStorage["wxydwfc"]["line5"].length > 0){
			$("#wxydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wxydwfc_qingkong").css("opacity",0.4);
		}
	}else if(wxydwfc_playMethod == 9){
		if(LotteryStorage["wxydwfc"]["line1"].length > 0 || LotteryStorage["wxydwfc"]["line2"].length > 0 ||
			LotteryStorage["wxydwfc"]["line3"].length > 0 || LotteryStorage["wxydwfc"]["line4"].length > 0 ){
			$("#wxydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wxydwfc_qingkong").css("opacity",0.4);
		}
	}else if(wxydwfc_playMethod == 37 || wxydwfc_playMethod == 4 || wxydwfc_playMethod == 6
		|| wxydwfc_playMethod == 26 || wxydwfc_playMethod == 15 || wxydwfc_playMethod == 75 || wxydwfc_playMethod == 77){
		if(LotteryStorage["wxydwfc"]["line1"].length > 0 || LotteryStorage["wxydwfc"]["line2"].length > 0
			|| LotteryStorage["wxydwfc"]["line3"].length > 0){
			$("#wxydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wxydwfc_qingkong").css("opacity",0.4);
		}
	}else if(wxydwfc_playMethod == 3 || wxydwfc_playMethod == 4 || wxydwfc_playMethod == 5
		|| wxydwfc_playMethod == 6 || wxydwfc_playMethod == 7 || wxydwfc_playMethod == 12
		|| wxydwfc_playMethod == 14 || wxydwfc_playMethod == 48 || wxydwfc_playMethod == 55
		|| wxydwfc_playMethod == 74 || wxydwfc_playMethod == 76 || wxydwfc_playMethod == 96 || wxydwfc_playMethod == 98){
		if(LotteryStorage["wxydwfc"]["line1"].length > 0 || LotteryStorage["wxydwfc"]["line2"].length > 0){
			$("#wxydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wxydwfc_qingkong").css("opacity",0.4);
		}
	}else if(wxydwfc_playMethod == 2 || wxydwfc_playMethod == 8 || wxydwfc_playMethod == 11 || wxydwfc_playMethod == 13 || wxydwfc_playMethod == 39
		|| wxydwfc_playMethod == 28 || wxydwfc_playMethod == 17 || wxydwfc_playMethod == 18 || wxydwfc_playMethod == 24 || wxydwfc_playMethod == 41
		|| wxydwfc_playMethod == 25 || wxydwfc_playMethod == 29 || wxydwfc_playMethod == 42 || wxydwfc_playMethod == 43 || wxydwfc_playMethod == 30
		|| wxydwfc_playMethod == 35 || wxydwfc_playMethod == 36 || wxydwfc_playMethod == 31 || wxydwfc_playMethod == 32 || wxydwfc_playMethod == 19
		|| wxydwfc_playMethod == 40 || wxydwfc_playMethod == 46 || wxydwfc_playMethod == 20 || wxydwfc_playMethod == 21 || wxydwfc_playMethod == 50
		|| wxydwfc_playMethod == 47 || wxydwfc_playMethod == 51 || wxydwfc_playMethod == 52 || wxydwfc_playMethod == 53 || wxydwfc_playMethod == 57 || wxydwfc_playMethod == 63
		|| wxydwfc_playMethod == 58 || wxydwfc_playMethod == 59 || wxydwfc_playMethod == 60 || wxydwfc_playMethod == 65 || wxydwfc_playMethod == 80 || wxydwfc_playMethod == 81 || wxydwfc_playType == 8
		|| wxydwfc_playMethod == 83 || wxydwfc_playMethod == 86 || wxydwfc_playMethod == 87 || wxydwfc_playMethod == 22 || wxydwfc_playMethod == 33 || wxydwfc_playMethod == 44
		|| wxydwfc_playMethod == 89 || wxydwfc_playMethod == 92 || wxydwfc_playMethod == 95 || wxydwfc_playMethod == 54 || wxydwfc_playMethod == 61
		|| wxydwfc_playMethod == 97 || wxydwfc_playType == 13  || wxydwfc_playType == 14){
		if(LotteryStorage["wxydwfc"]["line1"].length > 0){
			$("#wxydwfc_qingkong").css("opacity",1.0);
		}else{
			$("#wxydwfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#wxydwfc_qingkong").css("opacity",0);
	}

	if($("#wxydwfc_qingkong").css("opacity") == "0"){
		$("#wxydwfc_qingkong").css("display","none");
	}else{
		$("#wxydwfc_qingkong").css("display","block");
	}

	if($('#wxydwfc_zhushu').html() > 0){
		$("#wxydwfc_queding").css("opacity",1.0);
	}else{
		$("#wxydwfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  wxydwfc_qingkongAll(){
	$("#wxydwfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["wxydwfc"]["line1"] = [];
	LotteryStorage["wxydwfc"]["line2"] = [];
	LotteryStorage["wxydwfc"]["line3"] = [];
	LotteryStorage["wxydwfc"]["line4"] = [];
	LotteryStorage["wxydwfc"]["line5"] = [];

	localStorageUtils.removeParam("wxydwfc_line1");
	localStorageUtils.removeParam("wxydwfc_line2");
	localStorageUtils.removeParam("wxydwfc_line3");
	localStorageUtils.removeParam("wxydwfc_line4");
	localStorageUtils.removeParam("wxydwfc_line5");

	$('#wxydwfc_zhushu').text(0);
	$('#wxydwfc_money').text(0);
	clearAwardWin("wxydwfc");
	wxydwfc_initFooterButton();
}

/**
 * [wxydwfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function wxydwfc_calcNotes(){
	$('#wxydwfc_modeId').blur();
	$('#wxydwfc_fandian').blur();
	
	var notes = 0;

	if(wxydwfc_playMethod == 0){
		notes = LotteryStorage["wxydwfc"]["line1"].length *
			LotteryStorage["wxydwfc"]["line2"].length *
			LotteryStorage["wxydwfc"]["line3"].length *
			LotteryStorage["wxydwfc"]["line4"].length *
			LotteryStorage["wxydwfc"]["line5"].length;
	}else if(wxydwfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,5);
	}else if(wxydwfc_playMethod == 3){
		if (LotteryStorage["wxydwfc"]["line1"].length >= 1 && LotteryStorage["wxydwfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["wxydwfc"]["line1"],LotteryStorage["wxydwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wxydwfc_playMethod == 4){
		if (LotteryStorage["wxydwfc"]["line1"].length >= 2 && LotteryStorage["wxydwfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["wxydwfc"]["line2"],LotteryStorage["wxydwfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(wxydwfc_playMethod == 5 || wxydwfc_playMethod == 12){
		if (LotteryStorage["wxydwfc"]["line1"].length >= 1 && LotteryStorage["wxydwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["wxydwfc"]["line1"],LotteryStorage["wxydwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wxydwfc_playMethod == 6 || wxydwfc_playMethod == 7 || wxydwfc_playMethod == 14){
		if (LotteryStorage["wxydwfc"]["line1"].length >= 1 && LotteryStorage["wxydwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["wxydwfc"]["line1"],LotteryStorage["wxydwfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(wxydwfc_playMethod == 9){
		notes = LotteryStorage["wxydwfc"]["line1"].length *
			LotteryStorage["wxydwfc"]["line2"].length *
			LotteryStorage["wxydwfc"]["line3"].length *
			LotteryStorage["wxydwfc"]["line4"].length;
	}else if(wxydwfc_playMethod == 18 || wxydwfc_playMethod == 29 || wxydwfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["wxydwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(wxydwfc_playMethod == 22 || wxydwfc_playMethod == 33 || wxydwfc_playMethod == 44 ){
		notes = 54;
	}else if(wxydwfc_playMethod == 54 || wxydwfc_playMethod == 61){
		notes = 9;
	}else if(wxydwfc_playMethod == 51 || wxydwfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["wxydwfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(wxydwfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,4);
	}else if(wxydwfc_playMethod == 13|| wxydwfc_playMethod == 64 || wxydwfc_playMethod == 66 || wxydwfc_playMethod == 68 || wxydwfc_playMethod == 70 || wxydwfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,2);
	}else if(wxydwfc_playMethod == 37 || wxydwfc_playMethod == 26 || wxydwfc_playMethod == 15 || wxydwfc_playMethod == 75 || wxydwfc_playMethod == 77){
		notes = LotteryStorage["wxydwfc"]["line1"].length *
			LotteryStorage["wxydwfc"]["line2"].length *
			LotteryStorage["wxydwfc"]["line3"].length ;
	}else if(wxydwfc_playMethod == 39 || wxydwfc_playMethod == 28 || wxydwfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["wxydwfc"]["line1"][i]);
		};
	}else if(wxydwfc_playMethod == 41 || wxydwfc_playMethod == 30 || wxydwfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["wxydwfc"]["line1"].length,2);
	}else if(wxydwfc_playMethod == 42 || wxydwfc_playMethod == 31 || wxydwfc_playMethod == 20 || wxydwfc_playMethod == 68 || wxydwfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,3);
	}else if(wxydwfc_playMethod == 43 || wxydwfc_playMethod == 32 || wxydwfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["wxydwfc"]["line1"][i]);
		};
	}else if(wxydwfc_playMethod == 48 || wxydwfc_playMethod == 55 || wxydwfc_playMethod == 74 || wxydwfc_playMethod == 76){
		notes = LotteryStorage["wxydwfc"]["line1"].length *
			LotteryStorage["wxydwfc"]["line2"].length ;
	}else if(wxydwfc_playMethod == 50 || wxydwfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["wxydwfc"]["line1"][i]);
		};
	}else if(wxydwfc_playMethod == 52 || wxydwfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,2);
	}else if(wxydwfc_playMethod == 53 || wxydwfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["wxydwfc"]["line1"][i]);
		};
	}else if(wxydwfc_playMethod == 62){
		notes = LotteryStorage["wxydwfc"]["line1"].length +
			LotteryStorage["wxydwfc"]["line2"].length +
			LotteryStorage["wxydwfc"]["line3"].length +
			LotteryStorage["wxydwfc"]["line4"].length +
			LotteryStorage["wxydwfc"]["line5"].length;
	}else if(wxydwfc_playType == 13 || wxydwfc_playType == 14 || wxydwfc_playMethod == 8 || wxydwfc_playMethod == 71
		|| wxydwfc_playMethod == 24 || wxydwfc_playMethod == 25 || wxydwfc_playMethod == 35 || wxydwfc_playMethod == 36 || wxydwfc_playMethod == 46
		|| wxydwfc_playMethod == 47 || wxydwfc_playMethod == 63 || wxydwfc_playMethod == 65 || wxydwfc_playMethod == 67 || wxydwfc_playMethod == 69 ){
		notes = LotteryStorage["wxydwfc"]["line1"].length ;
	}else if(wxydwfc_playMethod == 78){
		notes = LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line2"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line3"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line4"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line3"].length +
			LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line4"].length +
			LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line4"].length +
			LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line4"].length * LotteryStorage["wxydwfc"]["line5"].length;
	}else if (wxydwfc_playMethod == 80) {
		if ($("#wxydwfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["wxydwfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,2);
		}
	}else if (wxydwfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,2);
	}else if (wxydwfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["wxydwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,2);
	}else if (wxydwfc_playMethod == 84) {
		notes = LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line3"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line4"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line4"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line4"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line4"].length +
			LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line4"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line4"].length * LotteryStorage["wxydwfc"]["line5"].length ;
	}else if (wxydwfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["wxydwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,3);
	}else if (wxydwfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["wxydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,3);
	}else if (wxydwfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,3) * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,3);
	}else if (wxydwfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["wxydwfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["wxydwfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,3);
	}else if (wxydwfc_playMethod == 93) {
		notes = LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line4"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line4"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line1"].length * LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line4"].length * LotteryStorage["wxydwfc"]["line5"].length +
			LotteryStorage["wxydwfc"]["line2"].length * LotteryStorage["wxydwfc"]["line3"].length * LotteryStorage["wxydwfc"]["line4"].length * LotteryStorage["wxydwfc"]["line5"].length;
	}else if (wxydwfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,4);
	}else if (wxydwfc_playMethod == 96) {
		if (LotteryStorage["wxydwfc"]["line1"].length >= 1 && LotteryStorage["wxydwfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["wxydwfc"]["line1"],LotteryStorage["wxydwfc"]["line2"])
				* mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (wxydwfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["wxydwfc"]["line1"].length,2) * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,4);
	}else if (wxydwfc_playMethod == 98) {
		if (LotteryStorage["wxydwfc"]["line1"].length >= 1 && LotteryStorage["wxydwfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["wxydwfc"]["line1"],LotteryStorage["wxydwfc"]["line2"]) * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = wxydwfcValidData($("#wxydwfc_single").val());
	}

	if(wxydwfc_sntuo == 3 || wxydwfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","wxydwfc"),LotteryInfo.getMethodId("ssc",wxydwfc_playMethod))){
	}else{
		if(parseInt($('#wxydwfc_modeId').val()) == 8){
			$("#wxydwfc_random").hide();
		}else{
			$("#wxydwfc_random").show();
		}
	}

	//验证是否为空
	if( $("#wxydwfc_beiNum").val() =="" || parseInt($("#wxydwfc_beiNum").val()) == 0){
		$("#wxydwfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#wxydwfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#wxydwfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#wxydwfc_zhushu').text(notes);
		if($("#wxydwfc_modeId").val() == "8"){
			$('#wxydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wxydwfc_beiNum").val()),0.002));
		}else if ($("#wxydwfc_modeId").val() == "2"){
			$('#wxydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wxydwfc_beiNum").val()),0.2));
		}else if ($("#wxydwfc_modeId").val() == "1"){
			$('#wxydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wxydwfc_beiNum").val()),0.02));
		}else{
			$('#wxydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wxydwfc_beiNum").val()),2));
		}
	} else {
		$('#wxydwfc_zhushu').text(0);
		$('#wxydwfc_money').text(0);
	}
	wxydwfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('wxydwfc',wxydwfc_playMethod);
}

/**
 * [wxydwfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function wxydwfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#wxydwfc_queding").bind('click', function(event) {

		wxydwfc_rebate = $("#wxydwfc_fandian option:last").val();
		if(parseInt($('#wxydwfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		wxydwfc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#wxydwfc_modeId').val()) == 8){
			if (Number($('#wxydwfc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('wxydwfc',wxydwfc_playMethod);

		submitParams.lotteryType = "wxydwfc";
		var play = LotteryInfo.getPlayName("ssc",wxydwfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",wxydwfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = wxydwfc_playType;
		submitParams.playMethodIndex = wxydwfc_playMethod;
		var selectedBalls = [];
		if(wxydwfc_playMethod == 0 || wxydwfc_playMethod == 3 || wxydwfc_playMethod == 4
			|| wxydwfc_playMethod == 5 || wxydwfc_playMethod == 6 || wxydwfc_playMethod == 7
			|| wxydwfc_playMethod == 9 || wxydwfc_playMethod == 12 || wxydwfc_playMethod == 14
			|| wxydwfc_playMethod == 37 || wxydwfc_playMethod == 26 || wxydwfc_playMethod == 15
			|| wxydwfc_playMethod == 48 || wxydwfc_playMethod == 55 || wxydwfc_playMethod == 74 || wxydwfc_playType == 9){
			$("#wxydwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(wxydwfc_playMethod == 2 || wxydwfc_playMethod == 8 || wxydwfc_playMethod == 11 || wxydwfc_playMethod == 13 || wxydwfc_playMethod == 24
			|| wxydwfc_playMethod == 39 || wxydwfc_playMethod == 28 || wxydwfc_playMethod == 17 || wxydwfc_playMethod == 18 || wxydwfc_playMethod == 25
			|| wxydwfc_playMethod == 22 || wxydwfc_playMethod == 33 || wxydwfc_playMethod == 44 || wxydwfc_playMethod == 54 || wxydwfc_playMethod == 61
			|| wxydwfc_playMethod == 41 || wxydwfc_playMethod == 42 || wxydwfc_playMethod == 43 || wxydwfc_playMethod == 29 || wxydwfc_playMethod == 35
			|| wxydwfc_playMethod == 30 || wxydwfc_playMethod == 31 || wxydwfc_playMethod == 32 || wxydwfc_playMethod == 40 || wxydwfc_playMethod == 36
			|| wxydwfc_playMethod == 19 || wxydwfc_playMethod == 20 || wxydwfc_playMethod == 21 || wxydwfc_playMethod == 46 || wxydwfc_playMethod == 47
			|| wxydwfc_playMethod == 50 || wxydwfc_playMethod == 57 || wxydwfc_playType == 8 || wxydwfc_playMethod == 51 || wxydwfc_playMethod == 58
			|| wxydwfc_playMethod == 52 || wxydwfc_playMethod == 53|| wxydwfc_playMethod == 59 || wxydwfc_playMethod == 60 || wxydwfc_playType == 13 || wxydwfc_playType == 14){
			$("#wxydwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(wxydwfc_playType == 7 || wxydwfc_playMethod == 78 || wxydwfc_playMethod == 84 || wxydwfc_playMethod == 93){
			$("#wxydwfc_ballView div.ballView").each(function(){
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
		}else if(wxydwfc_playMethod == 80 || wxydwfc_playMethod == 81 || wxydwfc_playMethod == 83
			|| wxydwfc_playMethod == 86 || wxydwfc_playMethod == 87 || wxydwfc_playMethod == 89
			|| wxydwfc_playMethod == 92 || wxydwfc_playMethod == 95 || wxydwfc_playMethod == 97){
			$("#wxydwfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#wxydwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#wxydwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#wxydwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#wxydwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#wxydwfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (wxydwfc_playMethod == 96 || wxydwfc_playMethod == 98) {
			$("#wxydwfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#wxydwfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#wxydwfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#wxydwfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#wxydwfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#wxydwfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			wxydwfcValidateData("submit");
			var array = handleSingleStr($("#wxydwfc_single").val());
			if(wxydwfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(wxydwfc_playMethod == 10 || wxydwfc_playMethod == 38 || wxydwfc_playMethod == 27
				|| wxydwfc_playMethod == 16 || wxydwfc_playMethod == 49 || wxydwfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(wxydwfc_playMethod == 45 || wxydwfc_playMethod == 34 || wxydwfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(wxydwfc_playMethod == 79 || wxydwfc_playMethod == 82 || wxydwfc_playMethod == 85 || wxydwfc_playMethod == 88 ||
				wxydwfc_playMethod == 89 || wxydwfc_playMethod == 90 || wxydwfc_playMethod == 91 || wxydwfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#wxydwfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#wxydwfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#wxydwfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#wxydwfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#wxydwfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#wxydwfc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#wxydwfc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#wxydwfc_fandian").val());
		submitParams.notes = $('#wxydwfc_zhushu').html();
		submitParams.sntuo = wxydwfc_sntuo;
		submitParams.multiple = $('#wxydwfc_beiNum').val();  //requirement
		submitParams.rebates = $('#wxydwfc_fandian').val();  //requirement
		submitParams.playMode = $('#wxydwfc_modeId').val();  //requirement
		submitParams.money = $('#wxydwfc_money').html();  //requirement
		submitParams.award = $('#wxydwfc_minAward').html();  //奖金
		submitParams.maxAward = $('#wxydwfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#wxydwfc_ballView").empty();
		wxydwfc_qingkongAll();
	});
}

/**
 * [wxydwfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function wxydwfc_randomOne(){
	wxydwfc_qingkongAll();
	if(wxydwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["wxydwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wxydwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wxydwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["wxydwfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["wxydwfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line2"], function(k, v){
			$("#" + "wxydwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line3"], function(k, v){
			$("#" + "wxydwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line4"], function(k, v){
			$("#" + "wxydwfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line5"], function(k, v){
			$("#" + "wxydwfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["wxydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["wxydwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wxydwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wxydwfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["wxydwfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line2"], function(k, v){
			$("#" + "wxydwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line3"], function(k, v){
			$("#" + "wxydwfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line4"], function(k, v){
			$("#" + "wxydwfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(wxydwfc_playMethod == 37 || wxydwfc_playMethod == 26 || wxydwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["wxydwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wxydwfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["wxydwfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line2"], function(k, v){
			$("#" + "wxydwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line3"], function(k, v){
			$("#" + "wxydwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 41 || wxydwfc_playMethod == 30 || wxydwfc_playMethod == 19 || wxydwfc_playMethod == 68
		|| wxydwfc_playMethod == 52 || wxydwfc_playMethod == 64 || wxydwfc_playMethod == 66
		|| wxydwfc_playMethod == 59 || wxydwfc_playMethod == 70 || wxydwfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["wxydwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 42 || wxydwfc_playMethod == 31 || wxydwfc_playMethod == 20 || wxydwfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["wxydwfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 39 || wxydwfc_playMethod == 28 || wxydwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["wxydwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 43 || wxydwfc_playMethod == 32 || wxydwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["wxydwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 48 || wxydwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["wxydwfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["wxydwfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line2"], function(k, v){
			$("#" + "wxydwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 25 || wxydwfc_playMethod == 36 || wxydwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["wxydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 50 || wxydwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["wxydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 53 || wxydwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["wxydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["wxydwfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["wxydwfc"]["line"+line], function(k, v){
			$("#" + "wxydwfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 63 || wxydwfc_playMethod == 67 || wxydwfc_playMethod == 69 || wxydwfc_playMethod == 71 || wxydwfc_playType == 13
		|| wxydwfc_playMethod == 65 || wxydwfc_playMethod == 18 || wxydwfc_playMethod == 29 || wxydwfc_playMethod == 40 || wxydwfc_playMethod == 22
		|| wxydwfc_playMethod == 33 || wxydwfc_playMethod == 44 || wxydwfc_playMethod == 54 || wxydwfc_playMethod == 61
		|| wxydwfc_playMethod == 24 || wxydwfc_playMethod == 35 || wxydwfc_playMethod == 46 || wxydwfc_playMethod == 51 || wxydwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["wxydwfc"]["line1"].push(number+'');
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 74 || wxydwfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["wxydwfc"]["line1"].push(array[0]+"");
		LotteryStorage["wxydwfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line2"], function(k, v){
			$("#" + "wxydwfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 75 || wxydwfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["wxydwfc"]["line1"].push(array[0]+"");
		LotteryStorage["wxydwfc"]["line2"].push(array[1]+"");
		LotteryStorage["wxydwfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line2"], function(k, v){
			$("#" + "wxydwfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line3"], function(k, v){
			$("#" + "wxydwfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["wxydwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wxydwfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["wxydwfc"]["line"+lines[0]], function(k, v){
			$("#" + "wxydwfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line"+lines[1]], function(k, v){
			$("#" + "wxydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["wxydwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wxydwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["wxydwfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["wxydwfc"]["line"+lines[0]], function(k, v){
			$("#" + "wxydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line"+lines[1]], function(k, v){
			$("#" + "wxydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line"+lines[0]], function(k, v){
			$("#" + "wxydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["wxydwfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["wxydwfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["wxydwfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["wxydwfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["wxydwfc"]["line"+lines[0]], function(k, v){
			$("#" + "wxydwfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line"+lines[1]], function(k, v){
			$("#" + "wxydwfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line"+lines[2]], function(k, v){
			$("#" + "wxydwfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["wxydwfc"]["line"+lines[3]], function(k, v){
			$("#" + "wxydwfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(wxydwfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["wxydwfc"]["line1"].push(number+"");
		$.each(LotteryStorage["wxydwfc"]["line1"], function(k, v){
			$("#" + "wxydwfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	wxydwfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function wxydwfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(wxydwfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 18 || wxydwfc_playMethod == 29 || wxydwfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(wxydwfc_playMethod == 22 || wxydwfc_playMethod == 33 || wxydwfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(wxydwfc_playMethod == 54 || wxydwfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(wxydwfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 37 || wxydwfc_playMethod == 26 || wxydwfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 39 || wxydwfc_playMethod == 28 || wxydwfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(wxydwfc_playMethod == 41 || wxydwfc_playMethod == 30 || wxydwfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(wxydwfc_playMethod == 52 || wxydwfc_playMethod == 59 || wxydwfc_playMethod == 64 || wxydwfc_playMethod == 66 || wxydwfc_playMethod == 68
		||wxydwfc_playMethod == 70 || wxydwfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 42 || wxydwfc_playMethod == 31 || wxydwfc_playMethod == 20 || wxydwfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 43 || wxydwfc_playMethod == 32 || wxydwfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(wxydwfc_playMethod == 48 || wxydwfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 50 || wxydwfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(wxydwfc_playMethod == 53 || wxydwfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(wxydwfc_playMethod == 62){
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
	}else if(wxydwfc_playMethod == 63 || wxydwfc_playMethod == 65 || wxydwfc_playMethod == 67 || wxydwfc_playMethod == 69 || wxydwfc_playMethod == 71
		|| wxydwfc_playMethod == 24 || wxydwfc_playMethod == 35 || wxydwfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 25 || wxydwfc_playMethod == 36 || wxydwfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(wxydwfc_playMethod == 51 || wxydwfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(wxydwfc_playMethod == 74 || wxydwfc_playMethod == 76){
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
	}else if(wxydwfc_playMethod == 75 || wxydwfc_playMethod == 77){
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
	}else if(wxydwfc_playMethod == 78){
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
	}else if(wxydwfc_playMethod == 84){
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
	}else if(wxydwfc_playMethod == 93){
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
	obj.sntuo = wxydwfc_sntuo;
	obj.multiple = 1;
	obj.rebates = wxydwfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('wxydwfc',wxydwfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#wxydwfc_minAward').html();     //奖金
	obj.maxAward = $('#wxydwfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [wxydwfcValidateData 单式数据验证]
 */
function wxydwfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#wxydwfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	wxydwfcValidData(textStr,type);
}

function wxydwfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
    var notes = 0,
   		array,
		result,
		content = {};
    if(wxydwfc_playMethod == 1){
    	content.str = str;
		content.weishu = 5;
        result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length;
        wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 38 || wxydwfc_playMethod == 27 || wxydwfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 45 || wxydwfc_playMethod == 34 || wxydwfc_playMethod == 23){
        // baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 49 || wxydwfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,2);
        wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,2);
        wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,3);
        wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,3);
        wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,3);
        wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,3);
        wxydwfcShowFooter(true,notes);
    }else if(wxydwfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
        notes = result.length * mathUtil.getCCombination($("#wxydwfc_tab .button.red").size() ,4);
        wxydwfcShowFooter(true,notes);
    }

	$('#wxydwfc_delRepeat').off('click');
	$('#wxydwfc_delRepeat').on('click',function () {
		content.str = $('#wxydwfc_single').val() ? $('#wxydwfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		wxydwfcShowFooter(true,notes);
		$("#wxydwfc_single").val(array.join(" "));
	});

    $("#wxydwfc_single").val(array.join(" "));
    return notes;
}

function wxydwfcShowFooter(isValid,notes){
	$('#wxydwfc_zhushu').text(notes);
	if($("#wxydwfc_modeId").val() == "8"){
		$('#wxydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wxydwfc_beiNum").val()),0.002));
	}else if ($("#wxydwfc_modeId").val() == "2"){
		$('#wxydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wxydwfc_beiNum").val()),0.2));
	}else if ($("#wxydwfc_modeId").val() == "1"){
		$('#wxydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wxydwfc_beiNum").val()),0.02));
	}else{
		$('#wxydwfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#wxydwfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	wxydwfc_initFooterButton();
	calcAwardWin('wxydwfc',wxydwfc_playMethod);  //计算奖金和盈利
}