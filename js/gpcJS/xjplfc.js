var xjplfc_playType = 2;
var xjplfc_playMethod = 15;
var xjplfc_sntuo = 0;
var xjplfc_rebate;
var xjplfcScroll;

//进入这个页面时调用
function xjplfcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("xjplfc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("xjplfc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function xjplfcPageUnloadedPanel(){
	$("#xjplfc_queding").off('click');
	$("#xjplfcPage_back").off('click');
	$("#xjplfc_ballView").empty();
	$("#xjplfcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="xjplfcPlaySelect"></select>');
	$("#xjplfcSelect").append($select);
}

//入口函数
function xjplfc_init(){
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
	$("#xjplfc_title").html(LotteryInfo.getLotteryNameByTag("xjplfc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == xjplfc_playType && j == xjplfc_playMethod){
					$play.append('<option value="xjplfc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="xjplfc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(xjplfc_playMethod,onShowArray)>-1 ){
						xjplfc_playType = i;
						xjplfc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#xjplfcPlaySelect").append($play);
		}
	}
	
	if($("#xjplfcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("xjplfcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:xjplfcChangeItem
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

	GetLotteryInfo("xjplfc",function (){
		xjplfcChangeItem("xjplfc"+xjplfc_playMethod);
	});

	//添加滑动条
	if(!xjplfcScroll){
		xjplfcScroll = new IScroll('#xjplfcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("xjplfc",LotteryInfo.getLotteryIdByTag("xjplfc"));

	//获取上一期开奖
	queryLastPrize("xjplfc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('xjplfc');

	//机选选号
	$("#xjplfc_random").off('click');
	$("#xjplfc_random").on('click', function(event) {
		xjplfc_randomOne();
	});

	//返回
	$("#xjplfcPage_back").on('click', function(event) {
		// xjplfc_playType = 2;
		// xjplfc_playMethod = 15;
		$("#xjplfc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		xjplfc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#xjplfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",xjplfc_playMethod));
	//玩法说明
	$("#xjplfc_paly_shuoming").off('click');
	$("#xjplfc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#xjplfc_shuoming").text());
	});

	qingKong("xjplfc");//清空
	xjplfc_submitData();
}

function xjplfcResetPlayType(){
	xjplfc_playType = 2;
	xjplfc_playMethod = 15;
}

function xjplfcChangeItem(val) {
	xjplfc_qingkongAll();
	var temp = val.substring("xjplfc".length,val.length);
	if(val == "xjplfc0"){
		//直选复式
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 0;
		xjplfc_playMethod = 0;
		createFiveLineLayout("xjplfc", function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc1"){
		//直选单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 0;
		xjplfc_playMethod = 1;
		$("#xjplfc_ballView").empty();
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc2"){
		//组选120
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 0;
		xjplfc_playMethod = 2;
		createOneLineLayout("xjplfc","至少选择5个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc3"){
		//组选60
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 0;
		xjplfc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc4"){
		//组选30
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 0;
		xjplfc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc5"){
		//组选20
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 0;
		xjplfc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc6"){
		//组选10
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 0;
		xjplfc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc7"){
		//组选5
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 0;
		xjplfc_playMethod = 7;
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc8"){
		//总和大小单双
		$("#xjplfc_random").show();
		var num = ["大","小","单","双"];
		xjplfc_sntuo = 0;
		xjplfc_playType = 0;
		xjplfc_playMethod = 8;
		createNonNumLayout("xjplfc",xjplfc_playMethod,num,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc9"){
		//直选复式
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 1;
		xjplfc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("xjplfc",tips, function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc10"){
		//直选单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 1;
		xjplfc_playMethod = 10;
		$("#xjplfc_ballView").empty();
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc11"){
		//组选24
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 1;
		xjplfc_playMethod = 11;
		createOneLineLayout("xjplfc","至少选择4个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc12"){
		//组选12
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 1;
		xjplfc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc13"){
		//组选6
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 1;
		xjplfc_playMethod = 13;
		createOneLineLayout("xjplfc","二重号:至少选择2个号码",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc14"){
		//组选4
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 1;
		xjplfc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc15"){
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc16"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 2;
		xjplfc_playMethod = 16;
		$("#xjplfc_ballView").empty();
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc17"){
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 17;
		createSumLayout("xjplfc",0,27,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc18"){
		//直选跨度
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 18;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc19"){
		//后三组三
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 19;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc20"){
		//后三组六
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 20;
		createOneLineLayout("xjplfc","至少选择3个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc21"){
		//后三和值
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 21;
		createSumLayout("xjplfc",1,26,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc22"){
		//后三组选包胆
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 22;
		xjplfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjplfc",array,["请选择一个号码"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc23"){
		//后三混合组选
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 2;
		xjplfc_playMethod = 23;
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc24"){
		//和值尾数
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 24;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc25"){
		//特殊号
		$("#xjplfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		xjplfc_sntuo = 0;
		xjplfc_playType = 2;
		xjplfc_playMethod = 25;
		createNonNumLayout("xjplfc",xjplfc_playMethod,num,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc26"){
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc27"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 3;
		xjplfc_playMethod = 27;
		$("#xjplfc_ballView").empty();
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc28"){
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 28;
		createSumLayout("xjplfc",0,27,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc29"){
		//直选跨度
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 29;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc30"){
		//中三组三
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 30;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc31"){
		//中三组六
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 31;
		createOneLineLayout("xjplfc","至少选择3个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc32"){
		//中三和值
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 32;
		createSumLayout("xjplfc",1,26,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc33"){
		//中三组选包胆
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 33;
		xjplfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjplfc",array,["请选择一个号码"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc34"){
		//中三混合组选
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 3;
		xjplfc_playMethod = 34;
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc35"){
		//和值尾数
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 35;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc36"){
		//特殊号
		$("#xjplfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		xjplfc_sntuo = 0;
		xjplfc_playType = 3;
		xjplfc_playMethod = 36;
		createNonNumLayout("xjplfc",xjplfc_playMethod,num,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc37"){
		//直选复式
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc38"){
		//直选单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 4;
		xjplfc_playMethod = 38;
		$("#xjplfc_ballView").empty();
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc39"){
		//和值
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 39;
		createSumLayout("xjplfc",0,27,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc40"){
		//直选跨度
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 40;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc41"){
		//前三组三
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 41;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc42"){
		//前三组六
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 42;
		createOneLineLayout("xjplfc","至少选择3个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc43"){
		//前三和值
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 43;
		createSumLayout("xjplfc",1,26,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc44"){
		//前三组选包胆
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 44;
		xjplfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjplfc",array,["请选择一个号码"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc45"){
		//前三混合组选
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 4;
		xjplfc_playMethod = 45;
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc46"){
		//和值尾数
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 46;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc47"){
		//特殊号
		$("#xjplfc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		xjplfc_sntuo = 0;
		xjplfc_playType = 4;
		xjplfc_playMethod = 47;
		createNonNumLayout("xjplfc",xjplfc_playMethod,num,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc48"){
		//后二复式
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 5;
		xjplfc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc49"){
		//后二单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 5;
		xjplfc_playMethod = 49;
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc50"){
		//后二和值
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 5;
		xjplfc_playMethod = 50;
		createSumLayout("xjplfc",0,18,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc51"){
		//直选跨度
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 5;
		xjplfc_playMethod = 51;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc52"){
		//后二组选
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 5;
		xjplfc_playMethod = 52;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc53"){
		//后二和值
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 5;
		xjplfc_playMethod = 53;
		createSumLayout("xjplfc",1,17,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc54"){
		//后二组选包胆
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 5;
		xjplfc_playMethod = 54;
		xjplfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjplfc",array,["请选择一个号码"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc55"){
		//前二复式
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 6;
		xjplfc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc56"){
		//前二单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 6;
		xjplfc_playMethod = 56;
		xjplfc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
	}else if(val == "xjplfc57"){
		//前二和值
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 6;
		xjplfc_playMethod = 57;
		createSumLayout("xjplfc",0,18,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc58"){
		//直选跨度
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 6;
		xjplfc_playMethod = 58;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc59"){
		//前二组选
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 6;
		xjplfc_playMethod = 59;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc60"){
		//前二和值
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 6;
		xjplfc_playMethod = 60;
		createSumLayout("xjplfc",1,17,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc61"){
		//前二组选包胆
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 6;
		xjplfc_playMethod = 61;
		xjplfc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("xjplfc",array,["请选择一个号码"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc62"){
		//定位复式
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 7;
		xjplfc_playMethod = 62;
		createFiveLineLayout("xjplfc", function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc63"){
		//后三一码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 63;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc64"){
		//后三二码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 64;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc65"){
		//前三一码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 65;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc66"){
		//前三二码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 66;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc67"){
		//后四一码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 67;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc68"){
		//后四二码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 68;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc69"){
		//前四一码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 69;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc70"){
		//前四二码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 70;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc71"){
		//五星一码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 71;
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc72"){
		//五星二码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 72;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc73"){
		//五星三码
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 8;
		xjplfc_playMethod = 73;
		createOneLineLayout("xjplfc","至少选择3个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc74"){
		//后二大小单双
		xjplfc_qingkongAll();
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 9;
		xjplfc_playMethod = 74;
		createTextBallTwoLayout("xjplfc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc75"){
		//后三大小单双
		xjplfc_qingkongAll();
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 9;
		xjplfc_playMethod = 75;
		createTextBallThreeLayout("xjplfc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc76"){
		//前二大小单双
		xjplfc_qingkongAll();
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 9;
		xjplfc_playMethod = 76;
		createTextBallTwoLayout("xjplfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc77"){
		//前三大小单双
		xjplfc_qingkongAll();
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 9;
		xjplfc_playMethod = 77;
		createTextBallThreeLayout("xjplfc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc78"){
		//直选复式
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 10;
		xjplfc_playMethod = 78;
		createFiveLineLayout("xjplfc",function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc79"){
		//直选单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 10;
		xjplfc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
		createRenXuanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc80"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 10;
		xjplfc_playMethod = 80;
		createSumLayout("xjplfc",0,18,function(){
			xjplfc_calcNotes();
		});
		createRenXuanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc81"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 10;
		xjplfc_playMethod = 81;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		createRenXuanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc82"){
		//组选单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 10;
		xjplfc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
		createRenXuanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc83"){
		//组选和值
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 10;
		xjplfc_playMethod = 83;
		createSumLayout("xjplfc",1,17,function(){
			xjplfc_calcNotes();
		});
		createRenXuanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc84"){
		//直选复式
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 11;
		xjplfc_playMethod = 84;
		createFiveLineLayout("xjplfc", function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc85"){
		//直选单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 11;
		xjplfc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
		createRenXuanSanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc86"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 11;
		xjplfc_playMethod = 86;
		createSumLayout("xjplfc",0,27,function(){
			xjplfc_calcNotes();
		});
		createRenXuanSanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc87"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 11;
		xjplfc_playMethod = 87;
		createOneLineLayout("xjplfc","至少选择2个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		createRenXuanSanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc88"){
		//组选单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 11;
		xjplfc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
		createRenXuanSanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc89"){
		//组选和值
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 11;
		xjplfc_playMethod = 89;
		createOneLineLayout("xjplfc","至少选择3个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		createRenXuanSanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc90"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 11;
		xjplfc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
		createRenXuanSanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc91"){
		//混合组选
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 11;
		xjplfc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
		createRenXuanSanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc92"){
		//组选和值
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 11;
		xjplfc_playMethod = 92;
		createSumLayout("xjplfc",1,26,function(){
			xjplfc_calcNotes();
		});
		createRenXuanSanLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc93"){
		$("#xjplfc_random").show();
		xjplfc_sntuo = 0;
		xjplfc_playType = 12;
		xjplfc_playMethod = 93;
		createFiveLineLayout("xjplfc", function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc94"){
		//直选单式
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 3;
		xjplfc_playType = 12;
		xjplfc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("xjplfc",tips);
		createRenXuanSiLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc95"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 12;
		xjplfc_playMethod = 95;
		createOneLineLayout("xjplfc","至少选择4个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		createRenXuanSiLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc96"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 12;
		xjplfc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		createRenXuanSiLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc97"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 12;
		xjplfc_playMethod = 97;
		$("#xjplfc_ballView").empty();
		createOneLineLayout("xjplfc","二重号:至少选择2个号码",0,9,false,function(){
			xjplfc_calcNotes();
		});
		createRenXuanSiLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc98"){
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 12;
		xjplfc_playMethod = 98;
		$("#xjplfc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("xjplfc",tips,0,9,false,function(){
			xjplfc_calcNotes();
		});
		createRenXuanSiLayout("xjplfc",xjplfc_playMethod,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc99"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 13;
		xjplfc_playMethod = 99;
		$("#xjplfc_ballView").empty();
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc100"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 13;
		xjplfc_playMethod = 100;
		$("#xjplfc_ballView").empty();
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc101"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 13;
		xjplfc_playMethod = 101;
		$("#xjplfc_ballView").empty();
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc102"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 13;
		xjplfc_playMethod = 102;
		$("#xjplfc_ballView").empty();
		createOneLineLayout("xjplfc","至少选择1个",0,9,false,function(){
			xjplfc_calcNotes();
		});
		xjplfc_qingkongAll();
	}else if(val == "xjplfc103"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 103;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc104"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 104;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc105"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 105;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc106"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 106;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc107"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 107;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc108"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 108;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc109"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 109;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc110"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 110;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc111"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 111;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}else if(val == "xjplfc112"){
		xjplfc_qingkongAll();
		$("#xjplfc_random").hide();
		xjplfc_sntuo = 0;
		xjplfc_playType = 14;
		xjplfc_playMethod = 112;
		createTextBallOneLayout("xjplfc",["龙","虎","和"],["至少选择一个"],function(){
			xjplfc_calcNotes();
		});
	}

	if(xjplfcScroll){
		xjplfcScroll.refresh();
		xjplfcScroll.scrollTo(0,0,1);
	}
	
	$("#xjplfc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("xjplfc",temp);
	hideRandomWhenLi("xjplfc",xjplfc_sntuo,xjplfc_playMethod);
	xjplfc_calcNotes();
}
/**
 * [xjplfc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function xjplfc_initFooterButton(){
	if(xjplfc_playMethod == 0 || xjplfc_playMethod == 62 || xjplfc_playMethod == 78
		|| xjplfc_playMethod == 84 || xjplfc_playMethod == 93 || xjplfc_playType == 7){
		if(LotteryStorage["xjplfc"]["line1"].length > 0 || LotteryStorage["xjplfc"]["line2"].length > 0 ||
			LotteryStorage["xjplfc"]["line3"].length > 0 || LotteryStorage["xjplfc"]["line4"].length > 0 ||
			LotteryStorage["xjplfc"]["line5"].length > 0){
			$("#xjplfc_qingkong").css("opacity",1.0);
		}else{
			$("#xjplfc_qingkong").css("opacity",0.4);
		}
	}else if(xjplfc_playMethod == 9){
		if(LotteryStorage["xjplfc"]["line1"].length > 0 || LotteryStorage["xjplfc"]["line2"].length > 0 ||
			LotteryStorage["xjplfc"]["line3"].length > 0 || LotteryStorage["xjplfc"]["line4"].length > 0 ){
			$("#xjplfc_qingkong").css("opacity",1.0);
		}else{
			$("#xjplfc_qingkong").css("opacity",0.4);
		}
	}else if(xjplfc_playMethod == 37 || xjplfc_playMethod == 4 || xjplfc_playMethod == 6
		|| xjplfc_playMethod == 26 || xjplfc_playMethod == 15 || xjplfc_playMethod == 75 || xjplfc_playMethod == 77){
		if(LotteryStorage["xjplfc"]["line1"].length > 0 || LotteryStorage["xjplfc"]["line2"].length > 0
			|| LotteryStorage["xjplfc"]["line3"].length > 0){
			$("#xjplfc_qingkong").css("opacity",1.0);
		}else{
			$("#xjplfc_qingkong").css("opacity",0.4);
		}
	}else if(xjplfc_playMethod == 3 || xjplfc_playMethod == 4 || xjplfc_playMethod == 5
		|| xjplfc_playMethod == 6 || xjplfc_playMethod == 7 || xjplfc_playMethod == 12
		|| xjplfc_playMethod == 14 || xjplfc_playMethod == 48 || xjplfc_playMethod == 55
		|| xjplfc_playMethod == 74 || xjplfc_playMethod == 76 || xjplfc_playMethod == 96 || xjplfc_playMethod == 98){
		if(LotteryStorage["xjplfc"]["line1"].length > 0 || LotteryStorage["xjplfc"]["line2"].length > 0){
			$("#xjplfc_qingkong").css("opacity",1.0);
		}else{
			$("#xjplfc_qingkong").css("opacity",0.4);
		}
	}else if(xjplfc_playMethod == 2 || xjplfc_playMethod == 8 || xjplfc_playMethod == 11 || xjplfc_playMethod == 13 || xjplfc_playMethod == 39
		|| xjplfc_playMethod == 28 || xjplfc_playMethod == 17 || xjplfc_playMethod == 18 || xjplfc_playMethod == 24 || xjplfc_playMethod == 41
		|| xjplfc_playMethod == 25 || xjplfc_playMethod == 29 || xjplfc_playMethod == 42 || xjplfc_playMethod == 43 || xjplfc_playMethod == 30
		|| xjplfc_playMethod == 35 || xjplfc_playMethod == 36 || xjplfc_playMethod == 31 || xjplfc_playMethod == 32 || xjplfc_playMethod == 19
		|| xjplfc_playMethod == 40 || xjplfc_playMethod == 46 || xjplfc_playMethod == 20 || xjplfc_playMethod == 21 || xjplfc_playMethod == 50
		|| xjplfc_playMethod == 47 || xjplfc_playMethod == 51 || xjplfc_playMethod == 52 || xjplfc_playMethod == 53 || xjplfc_playMethod == 57 || xjplfc_playMethod == 63
		|| xjplfc_playMethod == 58 || xjplfc_playMethod == 59 || xjplfc_playMethod == 60 || xjplfc_playMethod == 65 || xjplfc_playMethod == 80 || xjplfc_playMethod == 81 || xjplfc_playType == 8
		|| xjplfc_playMethod == 83 || xjplfc_playMethod == 86 || xjplfc_playMethod == 87 || xjplfc_playMethod == 22 || xjplfc_playMethod == 33 || xjplfc_playMethod == 44
		|| xjplfc_playMethod == 89 || xjplfc_playMethod == 92 || xjplfc_playMethod == 95 || xjplfc_playMethod == 54 || xjplfc_playMethod == 61
		|| xjplfc_playMethod == 97 || xjplfc_playType == 13  || xjplfc_playType == 14){
		if(LotteryStorage["xjplfc"]["line1"].length > 0){
			$("#xjplfc_qingkong").css("opacity",1.0);
		}else{
			$("#xjplfc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#xjplfc_qingkong").css("opacity",0);
	}

	if($("#xjplfc_qingkong").css("opacity") == "0"){
		$("#xjplfc_qingkong").css("display","none");
	}else{
		$("#xjplfc_qingkong").css("display","block");
	}

	if($('#xjplfc_zhushu').html() > 0){
		$("#xjplfc_queding").css("opacity",1.0);
	}else{
		$("#xjplfc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  xjplfc_qingkongAll(){
	$("#xjplfc_ballView span").removeClass('redBalls_active');
	LotteryStorage["xjplfc"]["line1"] = [];
	LotteryStorage["xjplfc"]["line2"] = [];
	LotteryStorage["xjplfc"]["line3"] = [];
	LotteryStorage["xjplfc"]["line4"] = [];
	LotteryStorage["xjplfc"]["line5"] = [];

	localStorageUtils.removeParam("xjplfc_line1");
	localStorageUtils.removeParam("xjplfc_line2");
	localStorageUtils.removeParam("xjplfc_line3");
	localStorageUtils.removeParam("xjplfc_line4");
	localStorageUtils.removeParam("xjplfc_line5");

	$('#xjplfc_zhushu').text(0);
	$('#xjplfc_money').text(0);
	clearAwardWin("xjplfc");
	xjplfc_initFooterButton();
}

/**
 * [xjplfc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function xjplfc_calcNotes(){
	$('#xjplfc_modeId').blur();
	$('#xjplfc_fandian').blur();
	
	var notes = 0;

	if(xjplfc_playMethod == 0){
		notes = LotteryStorage["xjplfc"]["line1"].length *
			LotteryStorage["xjplfc"]["line2"].length *
			LotteryStorage["xjplfc"]["line3"].length *
			LotteryStorage["xjplfc"]["line4"].length *
			LotteryStorage["xjplfc"]["line5"].length;
	}else if(xjplfc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,5);
	}else if(xjplfc_playMethod == 3){
		if (LotteryStorage["xjplfc"]["line1"].length >= 1 && LotteryStorage["xjplfc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["xjplfc"]["line1"],LotteryStorage["xjplfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(xjplfc_playMethod == 4){
		if (LotteryStorage["xjplfc"]["line1"].length >= 2 && LotteryStorage["xjplfc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["xjplfc"]["line2"],LotteryStorage["xjplfc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(xjplfc_playMethod == 5 || xjplfc_playMethod == 12){
		if (LotteryStorage["xjplfc"]["line1"].length >= 1 && LotteryStorage["xjplfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["xjplfc"]["line1"],LotteryStorage["xjplfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(xjplfc_playMethod == 6 || xjplfc_playMethod == 7 || xjplfc_playMethod == 14){
		if (LotteryStorage["xjplfc"]["line1"].length >= 1 && LotteryStorage["xjplfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["xjplfc"]["line1"],LotteryStorage["xjplfc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(xjplfc_playMethod == 9){
		notes = LotteryStorage["xjplfc"]["line1"].length *
			LotteryStorage["xjplfc"]["line2"].length *
			LotteryStorage["xjplfc"]["line3"].length *
			LotteryStorage["xjplfc"]["line4"].length;
	}else if(xjplfc_playMethod == 18 || xjplfc_playMethod == 29 || xjplfc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["xjplfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(xjplfc_playMethod == 22 || xjplfc_playMethod == 33 || xjplfc_playMethod == 44 ){
		notes = 54;
	}else if(xjplfc_playMethod == 54 || xjplfc_playMethod == 61){
		notes = 9;
	}else if(xjplfc_playMethod == 51 || xjplfc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["xjplfc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(xjplfc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,4);
	}else if(xjplfc_playMethod == 13|| xjplfc_playMethod == 64 || xjplfc_playMethod == 66 || xjplfc_playMethod == 68 || xjplfc_playMethod == 70 || xjplfc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,2);
	}else if(xjplfc_playMethod == 37 || xjplfc_playMethod == 26 || xjplfc_playMethod == 15 || xjplfc_playMethod == 75 || xjplfc_playMethod == 77){
		notes = LotteryStorage["xjplfc"]["line1"].length *
			LotteryStorage["xjplfc"]["line2"].length *
			LotteryStorage["xjplfc"]["line3"].length ;
	}else if(xjplfc_playMethod == 39 || xjplfc_playMethod == 28 || xjplfc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["xjplfc"]["line1"][i]);
		};
	}else if(xjplfc_playMethod == 41 || xjplfc_playMethod == 30 || xjplfc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["xjplfc"]["line1"].length,2);
	}else if(xjplfc_playMethod == 42 || xjplfc_playMethod == 31 || xjplfc_playMethod == 20 || xjplfc_playMethod == 68 || xjplfc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,3);
	}else if(xjplfc_playMethod == 43 || xjplfc_playMethod == 32 || xjplfc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["xjplfc"]["line1"][i]);
		};
	}else if(xjplfc_playMethod == 48 || xjplfc_playMethod == 55 || xjplfc_playMethod == 74 || xjplfc_playMethod == 76){
		notes = LotteryStorage["xjplfc"]["line1"].length *
			LotteryStorage["xjplfc"]["line2"].length ;
	}else if(xjplfc_playMethod == 50 || xjplfc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["xjplfc"]["line1"][i]);
		};
	}else if(xjplfc_playMethod == 52 || xjplfc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,2);
	}else if(xjplfc_playMethod == 53 || xjplfc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["xjplfc"]["line1"][i]);
		};
	}else if(xjplfc_playMethod == 62){
		notes = LotteryStorage["xjplfc"]["line1"].length +
			LotteryStorage["xjplfc"]["line2"].length +
			LotteryStorage["xjplfc"]["line3"].length +
			LotteryStorage["xjplfc"]["line4"].length +
			LotteryStorage["xjplfc"]["line5"].length;
	}else if(xjplfc_playType == 13 || xjplfc_playType == 14 || xjplfc_playMethod == 8 || xjplfc_playMethod == 71
		|| xjplfc_playMethod == 24 || xjplfc_playMethod == 25 || xjplfc_playMethod == 35 || xjplfc_playMethod == 36 || xjplfc_playMethod == 46
		|| xjplfc_playMethod == 47 || xjplfc_playMethod == 63 || xjplfc_playMethod == 65 || xjplfc_playMethod == 67 || xjplfc_playMethod == 69 ){
		notes = LotteryStorage["xjplfc"]["line1"].length ;
	}else if(xjplfc_playMethod == 78){
		notes = LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line2"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line3"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line4"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line3"].length +
			LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line4"].length +
			LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line4"].length +
			LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line4"].length * LotteryStorage["xjplfc"]["line5"].length;
	}else if (xjplfc_playMethod == 80) {
		if ($("#xjplfc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["xjplfc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,2);
		}
	}else if (xjplfc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,2) * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,2);
	}else if (xjplfc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["xjplfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,2);
	}else if (xjplfc_playMethod == 84) {
		notes = LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line3"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line4"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line4"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line4"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line4"].length +
			LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line4"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line4"].length * LotteryStorage["xjplfc"]["line5"].length ;
	}else if (xjplfc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["xjplfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,3);
	}else if (xjplfc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["xjplfc"]["line1"].length,2) * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,3);
	}else if (xjplfc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,3) * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,3);
	}else if (xjplfc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["xjplfc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["xjplfc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,3);
	}else if (xjplfc_playMethod == 93) {
		notes = LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line4"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line4"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line1"].length * LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line4"].length * LotteryStorage["xjplfc"]["line5"].length +
			LotteryStorage["xjplfc"]["line2"].length * LotteryStorage["xjplfc"]["line3"].length * LotteryStorage["xjplfc"]["line4"].length * LotteryStorage["xjplfc"]["line5"].length;
	}else if (xjplfc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,4)
			* mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,4);
	}else if (xjplfc_playMethod == 96) {
		if (LotteryStorage["xjplfc"]["line1"].length >= 1 && LotteryStorage["xjplfc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["xjplfc"]["line1"],LotteryStorage["xjplfc"]["line2"])
				* mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (xjplfc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["xjplfc"]["line1"].length,2) * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,4);
	}else if (xjplfc_playMethod == 98) {
		if (LotteryStorage["xjplfc"]["line1"].length >= 1 && LotteryStorage["xjplfc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["xjplfc"]["line1"],LotteryStorage["xjplfc"]["line2"]) * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = xjplfcValidData($("#xjplfc_single").val());
	}

	if(xjplfc_sntuo == 3 || xjplfc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","xjplfc"),LotteryInfo.getMethodId("ssc",xjplfc_playMethod))){
	}else{
		if(parseInt($('#xjplfc_modeId').val()) == 8){
			$("#xjplfc_random").hide();
		}else{
			$("#xjplfc_random").show();
		}
	}

	//验证是否为空
	if( $("#xjplfc_beiNum").val() =="" || parseInt($("#xjplfc_beiNum").val()) == 0){
		$("#xjplfc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#xjplfc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#xjplfc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#xjplfc_zhushu').text(notes);
		if($("#xjplfc_modeId").val() == "8"){
			$('#xjplfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjplfc_beiNum").val()),0.002));
		}else if ($("#xjplfc_modeId").val() == "2"){
			$('#xjplfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjplfc_beiNum").val()),0.2));
		}else if ($("#xjplfc_modeId").val() == "1"){
			$('#xjplfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjplfc_beiNum").val()),0.02));
		}else{
			$('#xjplfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjplfc_beiNum").val()),2));
		}
	} else {
		$('#xjplfc_zhushu').text(0);
		$('#xjplfc_money').text(0);
	}
	xjplfc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('xjplfc',xjplfc_playMethod);
}

/**
 * [xjplfc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function xjplfc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#xjplfc_queding").bind('click', function(event) {

		xjplfc_rebate = $("#xjplfc_fandian option:last").val();
		if(parseInt($('#xjplfc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		xjplfc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#xjplfc_modeId').val()) == 8){
			if (Number($('#xjplfc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('xjplfc',xjplfc_playMethod);

		submitParams.lotteryType = "xjplfc";
		var play = LotteryInfo.getPlayName("ssc",xjplfc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",xjplfc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = xjplfc_playType;
		submitParams.playMethodIndex = xjplfc_playMethod;
		var selectedBalls = [];
		if(xjplfc_playMethod == 0 || xjplfc_playMethod == 3 || xjplfc_playMethod == 4
			|| xjplfc_playMethod == 5 || xjplfc_playMethod == 6 || xjplfc_playMethod == 7
			|| xjplfc_playMethod == 9 || xjplfc_playMethod == 12 || xjplfc_playMethod == 14
			|| xjplfc_playMethod == 37 || xjplfc_playMethod == 26 || xjplfc_playMethod == 15
			|| xjplfc_playMethod == 48 || xjplfc_playMethod == 55 || xjplfc_playMethod == 74 || xjplfc_playType == 9){
			$("#xjplfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(xjplfc_playMethod == 2 || xjplfc_playMethod == 8 || xjplfc_playMethod == 11 || xjplfc_playMethod == 13 || xjplfc_playMethod == 24
			|| xjplfc_playMethod == 39 || xjplfc_playMethod == 28 || xjplfc_playMethod == 17 || xjplfc_playMethod == 18 || xjplfc_playMethod == 25
			|| xjplfc_playMethod == 22 || xjplfc_playMethod == 33 || xjplfc_playMethod == 44 || xjplfc_playMethod == 54 || xjplfc_playMethod == 61
			|| xjplfc_playMethod == 41 || xjplfc_playMethod == 42 || xjplfc_playMethod == 43 || xjplfc_playMethod == 29 || xjplfc_playMethod == 35
			|| xjplfc_playMethod == 30 || xjplfc_playMethod == 31 || xjplfc_playMethod == 32 || xjplfc_playMethod == 40 || xjplfc_playMethod == 36
			|| xjplfc_playMethod == 19 || xjplfc_playMethod == 20 || xjplfc_playMethod == 21 || xjplfc_playMethod == 46 || xjplfc_playMethod == 47
			|| xjplfc_playMethod == 50 || xjplfc_playMethod == 57 || xjplfc_playType == 8 || xjplfc_playMethod == 51 || xjplfc_playMethod == 58
			|| xjplfc_playMethod == 52 || xjplfc_playMethod == 53|| xjplfc_playMethod == 59 || xjplfc_playMethod == 60 || xjplfc_playType == 13 || xjplfc_playType == 14){
			$("#xjplfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(xjplfc_playType == 7 || xjplfc_playMethod == 78 || xjplfc_playMethod == 84 || xjplfc_playMethod == 93){
			$("#xjplfc_ballView div.ballView").each(function(){
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
		}else if(xjplfc_playMethod == 80 || xjplfc_playMethod == 81 || xjplfc_playMethod == 83
			|| xjplfc_playMethod == 86 || xjplfc_playMethod == 87 || xjplfc_playMethod == 89
			|| xjplfc_playMethod == 92 || xjplfc_playMethod == 95 || xjplfc_playMethod == 97){
			$("#xjplfc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#xjplfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#xjplfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#xjplfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#xjplfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#xjplfc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (xjplfc_playMethod == 96 || xjplfc_playMethod == 98) {
			$("#xjplfc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#xjplfc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#xjplfc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#xjplfc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#xjplfc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#xjplfc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			xjplfcValidateData("submit");
			var array = handleSingleStr($("#xjplfc_single").val());
			if(xjplfc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(xjplfc_playMethod == 10 || xjplfc_playMethod == 38 || xjplfc_playMethod == 27
				|| xjplfc_playMethod == 16 || xjplfc_playMethod == 49 || xjplfc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(xjplfc_playMethod == 45 || xjplfc_playMethod == 34 || xjplfc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(xjplfc_playMethod == 79 || xjplfc_playMethod == 82 || xjplfc_playMethod == 85 || xjplfc_playMethod == 88 ||
				xjplfc_playMethod == 89 || xjplfc_playMethod == 90 || xjplfc_playMethod == 91 || xjplfc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#xjplfc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#xjplfc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#xjplfc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#xjplfc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#xjplfc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#xjplfc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#xjplfc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#xjplfc_fandian").val());
		submitParams.notes = $('#xjplfc_zhushu').html();
		submitParams.sntuo = xjplfc_sntuo;
		submitParams.multiple = $('#xjplfc_beiNum').val();  //requirement
		submitParams.rebates = $('#xjplfc_fandian').val();  //requirement
		submitParams.playMode = $('#xjplfc_modeId').val();  //requirement
		submitParams.money = $('#xjplfc_money').html();  //requirement
		submitParams.award = $('#xjplfc_minAward').html();  //奖金
		submitParams.maxAward = $('#xjplfc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#xjplfc_ballView").empty();
		xjplfc_qingkongAll();
	});
}

/**
 * [xjplfc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function xjplfc_randomOne(){
	xjplfc_qingkongAll();
	if(xjplfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["xjplfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["xjplfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["xjplfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["xjplfc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["xjplfc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line2"], function(k, v){
			$("#" + "xjplfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line3"], function(k, v){
			$("#" + "xjplfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line4"], function(k, v){
			$("#" + "xjplfc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line5"], function(k, v){
			$("#" + "xjplfc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["xjplfc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["xjplfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["xjplfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["xjplfc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["xjplfc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line2"], function(k, v){
			$("#" + "xjplfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line3"], function(k, v){
			$("#" + "xjplfc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line4"], function(k, v){
			$("#" + "xjplfc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(xjplfc_playMethod == 37 || xjplfc_playMethod == 26 || xjplfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["xjplfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["xjplfc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["xjplfc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line2"], function(k, v){
			$("#" + "xjplfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line3"], function(k, v){
			$("#" + "xjplfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 41 || xjplfc_playMethod == 30 || xjplfc_playMethod == 19 || xjplfc_playMethod == 68
		|| xjplfc_playMethod == 52 || xjplfc_playMethod == 64 || xjplfc_playMethod == 66
		|| xjplfc_playMethod == 59 || xjplfc_playMethod == 70 || xjplfc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["xjplfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 42 || xjplfc_playMethod == 31 || xjplfc_playMethod == 20 || xjplfc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["xjplfc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 39 || xjplfc_playMethod == 28 || xjplfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["xjplfc"]["line1"].push(number+'');
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 43 || xjplfc_playMethod == 32 || xjplfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["xjplfc"]["line1"].push(number+'');
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 48 || xjplfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["xjplfc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["xjplfc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line2"], function(k, v){
			$("#" + "xjplfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 25 || xjplfc_playMethod == 36 || xjplfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["xjplfc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 50 || xjplfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["xjplfc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 53 || xjplfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["xjplfc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["xjplfc"]["line"+line].push(number+"");
		$.each(LotteryStorage["xjplfc"]["line"+line], function(k, v){
			$("#" + "xjplfc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 63 || xjplfc_playMethod == 67 || xjplfc_playMethod == 69 || xjplfc_playMethod == 71 || xjplfc_playType == 13
		|| xjplfc_playMethod == 65 || xjplfc_playMethod == 18 || xjplfc_playMethod == 29 || xjplfc_playMethod == 40 || xjplfc_playMethod == 22
		|| xjplfc_playMethod == 33 || xjplfc_playMethod == 44 || xjplfc_playMethod == 54 || xjplfc_playMethod == 61
		|| xjplfc_playMethod == 24 || xjplfc_playMethod == 35 || xjplfc_playMethod == 46 || xjplfc_playMethod == 51 || xjplfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["xjplfc"]["line1"].push(number+'');
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 74 || xjplfc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["xjplfc"]["line1"].push(array[0]+"");
		LotteryStorage["xjplfc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line2"], function(k, v){
			$("#" + "xjplfc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 75 || xjplfc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["xjplfc"]["line1"].push(array[0]+"");
		LotteryStorage["xjplfc"]["line2"].push(array[1]+"");
		LotteryStorage["xjplfc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line2"], function(k, v){
			$("#" + "xjplfc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line3"], function(k, v){
			$("#" + "xjplfc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["xjplfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["xjplfc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["xjplfc"]["line"+lines[0]], function(k, v){
			$("#" + "xjplfc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line"+lines[1]], function(k, v){
			$("#" + "xjplfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["xjplfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["xjplfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["xjplfc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["xjplfc"]["line"+lines[0]], function(k, v){
			$("#" + "xjplfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line"+lines[1]], function(k, v){
			$("#" + "xjplfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line"+lines[0]], function(k, v){
			$("#" + "xjplfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["xjplfc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["xjplfc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["xjplfc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["xjplfc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["xjplfc"]["line"+lines[0]], function(k, v){
			$("#" + "xjplfc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line"+lines[1]], function(k, v){
			$("#" + "xjplfc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line"+lines[2]], function(k, v){
			$("#" + "xjplfc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xjplfc"]["line"+lines[3]], function(k, v){
			$("#" + "xjplfc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(xjplfc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["xjplfc"]["line1"].push(number+"");
		$.each(LotteryStorage["xjplfc"]["line1"], function(k, v){
			$("#" + "xjplfc_line1" + v).toggleClass("redBalls_active");
		});
	}
	xjplfc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function xjplfc_checkOutRandom(playMethod){
	var obj = new Object();
	if(xjplfc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(xjplfc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(xjplfc_playMethod == 18 || xjplfc_playMethod == 29 || xjplfc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(xjplfc_playMethod == 22 || xjplfc_playMethod == 33 || xjplfc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(xjplfc_playMethod == 54 || xjplfc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(xjplfc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(xjplfc_playMethod == 37 || xjplfc_playMethod == 26 || xjplfc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(xjplfc_playMethod == 39 || xjplfc_playMethod == 28 || xjplfc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(xjplfc_playMethod == 41 || xjplfc_playMethod == 30 || xjplfc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(xjplfc_playMethod == 52 || xjplfc_playMethod == 59 || xjplfc_playMethod == 64 || xjplfc_playMethod == 66 || xjplfc_playMethod == 68
		||xjplfc_playMethod == 70 || xjplfc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(xjplfc_playMethod == 42 || xjplfc_playMethod == 31 || xjplfc_playMethod == 20 || xjplfc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(xjplfc_playMethod == 43 || xjplfc_playMethod == 32 || xjplfc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(xjplfc_playMethod == 48 || xjplfc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(xjplfc_playMethod == 50 || xjplfc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(xjplfc_playMethod == 53 || xjplfc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(xjplfc_playMethod == 62){
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
	}else if(xjplfc_playMethod == 63 || xjplfc_playMethod == 65 || xjplfc_playMethod == 67 || xjplfc_playMethod == 69 || xjplfc_playMethod == 71
		|| xjplfc_playMethod == 24 || xjplfc_playMethod == 35 || xjplfc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(xjplfc_playMethod == 25 || xjplfc_playMethod == 36 || xjplfc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(xjplfc_playMethod == 51 || xjplfc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(xjplfc_playMethod == 74 || xjplfc_playMethod == 76){
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
	}else if(xjplfc_playMethod == 75 || xjplfc_playMethod == 77){
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
	}else if(xjplfc_playMethod == 78){
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
	}else if(xjplfc_playMethod == 84){
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
	}else if(xjplfc_playMethod == 93){
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
	obj.sntuo = xjplfc_sntuo;
	obj.multiple = 1;
	obj.rebates = xjplfc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('xjplfc',xjplfc_playMethod,obj);  //机选奖金计算
	obj.award = $('#xjplfc_minAward').html();     //奖金
	obj.maxAward = $('#xjplfc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [xjplfcValidateData 单式数据验证]
 */
function xjplfcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#xjplfc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	xjplfcValidData(textStr,type);
}

function xjplfcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(xjplfc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 38 || xjplfc_playMethod == 27 || xjplfc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 45 || xjplfc_playMethod == 34 || xjplfc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 49 || xjplfc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,2);
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,2);
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,3);
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,3);
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,3);
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,3);
		xjplfcShowFooter(true,notes);
	}else if(xjplfc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#xjplfc_tab .button.red").size() ,4);
		xjplfcShowFooter(true,notes);
	}

	$('#xjplfc_delRepeat').off('click');
	$('#xjplfc_delRepeat').on('click',function () {
		content.str = $('#xjplfc_single').val() ? $('#xjplfc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		xjplfcShowFooter(true,notes);
		$("#xjplfc_single").val(array.join(" "));
	});

	$("#xjplfc_single").val(array.join(" "));
	return notes;
}

function xjplfcShowFooter(isValid,notes){
	$('#xjplfc_zhushu').text(notes);
	if($("#xjplfc_modeId").val() == "8"){
		$('#xjplfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjplfc_beiNum").val()),0.002));
	}else if ($("#xjplfc_modeId").val() == "2"){
		$('#xjplfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjplfc_beiNum").val()),0.2));
	}else if ($("#xjplfc_modeId").val() == "1"){
		$('#xjplfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjplfc_beiNum").val()),0.02));
	}else{
		$('#xjplfc_money').text(bigNumberUtil.multiply(notes * parseInt($("#xjplfc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	xjplfc_initFooterButton();
	calcAwardWin('xjplfc',xjplfc_playMethod);  //计算奖金和盈利
}