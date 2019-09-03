var mmc_playType = 2;
var mmc_playMethod = 15;
var mmc_sntuo = 0;
var mmc_rebate;
var mmcScroll;

//进入这个页面时调用
function mmcPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("mmc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("mmc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function mmcPageUnloadedPanel(){
	$("#mmc_queding").off('click');
	$("#mmcPage_back").off('click');
	$("#mmc_ballView").empty();
	$("#mmcSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="mmcPlaySelect"></select>');
	$("#mmcSelect").append($select);
}

//入口函数
function mmc_init(){
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
	$("#mmc_title").html(LotteryInfo.getLotteryNameByTag("mmc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("ssc");i++){
		if(i == 15){//去掉骰宝龙虎 
			continue;
		}
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("ssc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("ssc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("ssc",j) == LotteryInfo.getPlayTypeId("ssc",i)){
				var name = LotteryInfo.getMethodName("ssc",j);
				if(i == mmc_playType && j == mmc_playMethod){
					$play.append('<option value="mmc'+LotteryInfo.getMethodIndex("ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="mmc'+LotteryInfo.getMethodIndex("ssc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(mmc_playMethod,onShowArray)>-1 ){
						mmc_playType = i;
						mmc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#mmcPlaySelect").append($play);
		}
	}
	
	if($("#mmcPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("mmcSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:mmcChangeItem
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

	GetLotteryInfo("mmc",function (){
		mmcChangeItem("mmc"+mmc_playMethod);
	});

	//添加滑动条
	if(!mmcScroll){
		mmcScroll = new IScroll('#mmcContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	// getQihao("mmc",LotteryInfo.getLotteryIdByTag("mmc"));

	//获取上一期开奖
	queryLastPrize("mmc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('mmc');

	//机选选号
	$("#mmc_random").on('click', function(event) {
		mmc_randomOne();
	});

	//返回
	$("#mmcPage_back").on('click', function(event) {
		// mmc_playType = 2;
		// mmc_playMethod = 15;
		$("#mmc_ballView").empty();
		localStorageUtils.removeParam("playMode");
        localStorageUtils.removeParam("playBeiNum");
        localStorageUtils.removeParam("playFanDian");
		mmc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#mmc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",mmc_playMethod));
	//玩法说明
	$("#mmc_paly_shuoming").off('click');
	$("#mmc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#mmc_shuoming").text());
	});

	qingKong("mmc");//清空
	mmc_submitData();
}

function mmcResetPlayType(){
	mmc_playType = 2;
	mmc_playMethod = 15;
}

function mmcChangeItem(val) {
	mmc_qingkongAll();
	var temp = val.substring("mmc".length,val.length);
	if(val == "mmc0"){
		//直选复式
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 0;
		mmc_playMethod = 0;
		createFiveLineLayout("mmc", function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc1"){
		//直选单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 0;
		mmc_playMethod = 1;
		$("#mmc_ballView").empty();
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>五星直选:12345<br/>1)每注必须是5个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc2"){
		//组选120
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 0;
		mmc_playMethod = 2;
		createOneLineLayout("mmc","至少选择5个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc3"){
		//组选60
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 0;
		mmc_playMethod = 3;
		var tips = ["二重号:至少选择1个号码","单号:至少选择3个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc4"){
		//组选30
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 0;
		mmc_playMethod = 4;
		var tips = ["二重号:至少选择2个号码","单号:至少选择1个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc5"){
		//组选20
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 0;
		mmc_playMethod = 5;
		var tips = ["三重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc6"){
		//组选10
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 0;
		mmc_playMethod = 6;
		var tips = ["三重号:至少选择1个号码","二重号:至少选择1个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc7"){
		//组选5
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 0;
		mmc_playMethod = 7
		var tips = ["四重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc8"){
		//总和大小单双
		$("#mmc_random").show();
		var num = ["大","小","单","双"];
		mmc_sntuo = 0;
		mmc_playType = 0;
		mmc_playMethod = 8;
		createNonNumLayout("mmc",mmc_playMethod,num,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc9"){
		//直选复式
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 1;
		mmc_playMethod = 9;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createFourLineLayout("mmc",tips, function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc10"){
		//直选单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 1;
		mmc_playMethod = 10;
		$("#mmc_ballView").empty();
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>后四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc11"){
		//组选24
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 1;
		mmc_playMethod = 11;
		createOneLineLayout("mmc","至少选择4个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc12"){
		//组选12
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 1;
		mmc_playMethod = 12;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc13"){
		//组选6
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 1;
		mmc_playMethod = 13;
		createOneLineLayout("mmc","二重号:至少选择2个号码",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc14"){
		//组选4
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 1;
		mmc_playMethod = 14;
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc15"){
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 15;
		var tips = ["百位:至少选择1个号码","十位:至少选择1个号码","个位:至少选择1个号码"];
		createThreeLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc16"){
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 2;
		mmc_playMethod = 16;
		$("#mmc_ballView").empty();
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>后三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc17"){
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 17;
		createSumLayout("mmc",0,27,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc18"){
		//直选跨度
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 18;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc19"){
		//后三组三
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 19;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc20"){
		//后三组六
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 20;
		createOneLineLayout("mmc","至少选择3个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc21"){
		//后三和值
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 21;
		createSumLayout("mmc",1,26,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc22"){
		//后三组选包胆
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 22;
		mmc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("mmc",array,["请选择一个号码"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc23"){
		//后三混合组选
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 2;
		mmc_playMethod = 23;
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>后三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc24"){
		//和值尾数
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 24;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc25"){
		//特殊号
		$("#mmc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		mmc_sntuo = 0;
		mmc_playType = 2;
		mmc_playMethod = 25;
		createNonNumLayout("mmc",mmc_playMethod,num,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc26"){
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 26;
		var tips = ["千位:至少选择1个号码","百位:至少选择1个号码","十位:至少选择1个号码"];
		createThreeLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc27"){
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 3;
		mmc_playMethod = 27;
		$("#mmc_ballView").empty();
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>中三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc28"){
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 28;
		createSumLayout("mmc",0,27,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc29"){
		//直选跨度
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 29;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc30"){
		//中三组三
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 30;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc31"){
		//中三组六
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 31;
		createOneLineLayout("mmc","至少选择3个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc32"){
		//中三和值
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 32;
		createSumLayout("mmc",1,26,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc33"){
		//中三组选包胆
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 33;
		mmc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("mmc",array,["请选择一个号码"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc34"){
		//中三混合组选
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 3;
		mmc_playMethod = 34;
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>中三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc35"){
		//和值尾数
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 35;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc36"){
		//特殊号
		$("#mmc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		mmc_sntuo = 0;
		mmc_playType = 3;
		mmc_playMethod = 36;
		createNonNumLayout("mmc",mmc_playMethod,num,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc37"){
		//直选复式
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 37;
		var tips = ["万位:至少选择1个号码","千位:至少选择1个号码","百位:至少选择1个号码"];
		createThreeLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc38"){
		//直选单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 4;
		mmc_playMethod = 38;
		$("#mmc_ballView").empty();
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>前三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc39"){
		//和值
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 39;
		createSumLayout("mmc",0,27,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc40"){
		//直选跨度
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 40;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc41"){
		//前三组三
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 41;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc42"){
		//前三组六
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 42;
		createOneLineLayout("mmc","至少选择3个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc43"){
		//前三和值
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 43;
		createSumLayout("mmc",1,26,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc44"){
		//前三组选包胆
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 44;
		mmc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("mmc",array,["请选择一个号码"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc45"){
		//前三混合组选
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 4;
		mmc_playMethod = 45;
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>前三混合组选(含组三、组六):123或者223<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc46"){
		//和值尾数
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 46;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc47"){
		//特殊号
		$("#mmc_random").show();
		var num = ["豹子","顺子","对子","半顺","杂六"];
		mmc_sntuo = 0;
		mmc_playType = 4;
		mmc_playMethod = 47;
		createNonNumLayout("mmc",mmc_playMethod,num,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc48"){
		//后二复式
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 5;
		mmc_playMethod = 48;
		var tips = ["十位：可选1-10个","个位：可选1-10个"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc49"){
		//后二单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 5;
		mmc_playMethod = 49;
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>后二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc50"){
		//后二和值
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 5;
		mmc_playMethod = 50;
		createSumLayout("mmc",0,18,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc51"){
		//直选跨度
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 5;
		mmc_playMethod = 51;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc52"){
		//后二组选
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 5;
		mmc_playMethod = 52;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc53"){
		//后二和值
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 5;
		mmc_playMethod = 53;
		createSumLayout("mmc",1,17,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc54"){
		//后二组选包胆
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 5;
		mmc_playMethod = 54;
		mmc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("mmc",array,["请选择一个号码"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc55"){
		//前二复式
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 6;
		mmc_playMethod = 55;
		var tips = ["万位：可选1-10个","千位：可选1-10个"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc56"){
		//前二单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 6;
		mmc_playMethod = 56;
		mmc_qingkongAll();
		var tips = "<p>格式说明<br/>前二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
	}else if(val == "mmc57"){
		//前二和值
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 6;
		mmc_playMethod = 57;
		createSumLayout("mmc",0,18,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc58"){
		//直选跨度
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 6;
		mmc_playMethod = 58;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc59"){
		//前二组选
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 6;
		mmc_playMethod = 59;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc60"){
		//前二和值
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 6;
		mmc_playMethod = 60;
		createSumLayout("mmc",1,17,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc61"){
		//前二组选包胆
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 6;
		mmc_playMethod = 61;
		mmc_qingkongAll();
		var array = ["0","1","2","3","4","5","6","7","8","9"];
		createMutexBallLayout("mmc",array,["请选择一个号码"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc62"){
		//定位复式
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 7;
		mmc_playMethod = 62;
		createFiveLineLayout("mmc", function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc63"){
		//后三一码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 63;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc64"){
		//后三二码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 64;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc65"){
		//前三一码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 65;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc66"){
		//前三二码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 66;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc67"){
		//后四一码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 67;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc68"){
		//后四二码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 68;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc69"){
		//前四一码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 69;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc70"){
		//前四二码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 70;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc71"){
		//五星一码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 71;
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc72"){
		//五星二码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 72;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc73"){
		//五星三码
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 8;
		mmc_playMethod = 73;
		createOneLineLayout("mmc","至少选择3个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc74"){
		//后二大小单双
		mmc_qingkongAll();
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 9;
		mmc_playMethod = 74;
		createTextBallTwoLayout("mmc",["大","小","单","双"],["十位:至少选择一个","个位:至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc75"){
		//后三大小单双
		mmc_qingkongAll();
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 9;
		mmc_playMethod = 75;
		createTextBallThreeLayout("mmc",["大","小","单","双"],["百位:至少选择一个","十位:至少选择一个","个位:至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc76"){
		//前二大小单双
		mmc_qingkongAll();
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 9;
		mmc_playMethod = 76;
		createTextBallTwoLayout("mmc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc77"){
		//前三大小单双
		mmc_qingkongAll();
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 9;
		mmc_playMethod = 77;
		createTextBallThreeLayout("mmc",["大","小","单","双"],["万位:至少选择一个","千位:至少选择一个","百位:至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc78"){
		//直选复式
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 10;
		mmc_playMethod = 78;
		createFiveLineLayout("mmc",function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc79"){
		//直选单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 10;
		mmc_playMethod = 79;
		var tips = "<p>格式说明<br/>任选二直选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
		createRenXuanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc80"){
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 10;
		mmc_playMethod = 80;
		createSumLayout("mmc",0,18,function(){
			mmc_calcNotes();
		});
		createRenXuanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc81"){
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 10;
		mmc_playMethod = 81;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		createRenXuanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc82"){
		//组选单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 10;
		mmc_playMethod = 82;
		var tips = "<p>格式说明<br/>任选二组选:12<br/>1)每注必须是2个号码,每个号码之间无需用符号分割，每注号码不能相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
		createRenXuanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc83"){
		//组选和值
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 10;
		mmc_playMethod = 83;
		createSumLayout("mmc",1,17,function(){
			mmc_calcNotes();
		});
		createRenXuanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc84"){
		//直选复式
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 11;
		mmc_playMethod = 84;
		createFiveLineLayout("mmc", function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc85"){
		//直选单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 11;
		mmc_playMethod = 85;
		var tips = "<p>格式说明<br/>任选三直选:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
		createRenXuanSanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc86"){
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 11;
		mmc_playMethod = 86;
		createSumLayout("mmc",0,27,function(){
			mmc_calcNotes();
		});
		createRenXuanSanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc87"){
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 11;
		mmc_playMethod = 87;
		createOneLineLayout("mmc","至少选择2个",0,9,false,function(){
			mmc_calcNotes();
		});
		createRenXuanSanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc88"){
		//组选单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 11;
		mmc_playMethod = 88;
		var tips = "<p>格式说明<br/>任选三组三:122<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
		createRenXuanSanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc89"){
		//组选和值
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 11;
		mmc_playMethod = 89;
		createOneLineLayout("mmc","至少选择3个",0,9,false,function(){
			mmc_calcNotes();
		});
		createRenXuanSanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc90"){
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 11;
		mmc_playMethod = 90;
		var tips = "<p>格式说明<br/>任选三组六:123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割，每注号码各不相同;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
		createRenXuanSanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc91"){
		//混合组选
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 11;
		mmc_playMethod = 91;
		var tips = "<p>格式说明<br/>任选三混合组选:122或123<br/>1)每注必须是3个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
		createRenXuanSanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc92"){
		//组选和值
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 11;
		mmc_playMethod = 92;
		createSumLayout("mmc",1,26,function(){
			mmc_calcNotes();
		});
		createRenXuanSanLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc93"){
		$("#mmc_random").show();
		mmc_sntuo = 0;
		mmc_playType = 12;
		mmc_playMethod = 93;
		createFiveLineLayout("mmc", function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc94"){
		//直选单式
		$("#mmc_random").hide();
		mmc_sntuo = 3;
		mmc_playType = 12;
		mmc_playMethod = 94;
		var tips = "<p>格式说明<br/>任选四直选:1234<br/>1)每注必须是4个号码,每个号码之间无需用符号分割;2)每注之间可用空格、逗号、分号或回车分割;3)只支持单式.</p>";
		createSingleLayout("mmc",tips);
		createRenXuanSiLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc95"){
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 12;
		mmc_playMethod = 95;
		createOneLineLayout("mmc","至少选择4个",0,9,false,function(){
			mmc_calcNotes();
		});
		createRenXuanSiLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc96"){
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 12;
		mmc_playMethod = 96;
		var tips = ["二重号:至少选择1个号码","单号:至少选择2个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		createRenXuanSiLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc97"){
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 12;
		mmc_playMethod = 97;
		$("#mmc_ballView").empty();
		createOneLineLayout("mmc","二重号:至少选择2个号码",0,9,false,function(){
			mmc_calcNotes();
		});
		createRenXuanSiLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc98"){
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 12;
		mmc_playMethod = 98;
		$("#mmc_ballView").empty();
		var tips = ["三重号:至少选择1个号码","单号:至少选择1个号码"];
		createTwoLineLayout("mmc",tips,0,9,false,function(){
			mmc_calcNotes();
		});
		createRenXuanSiLayout("mmc",mmc_playMethod,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc99"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 13;
		mmc_playMethod = 99;
		$("#mmc_ballView").empty();
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc100"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 13;
		mmc_playMethod = 100;
		$("#mmc_ballView").empty();
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc101"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 13;
		mmc_playMethod = 101;
		$("#mmc_ballView").empty();
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc102"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 13;
		mmc_playMethod = 102;
		$("#mmc_ballView").empty();
		createOneLineLayout("mmc","至少选择1个",0,9,false,function(){
			mmc_calcNotes();
		});
		mmc_qingkongAll();
	}else if(val == "mmc103"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 103;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc104"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 104;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc105"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 105;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc106"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 106;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc107"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 107;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc108"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 108;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc109"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 109;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc110"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 110;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc111"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 111;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}else if(val == "mmc112"){
		mmc_qingkongAll();
		$("#mmc_random").hide();
		mmc_sntuo = 0;
		mmc_playType = 14;
		mmc_playMethod = 112;
		createTextBallOneLayout("mmc",["龙","虎","和"],["至少选择一个"],function(){
			mmc_calcNotes();
		});
	}

	if(mmcScroll){
		mmcScroll.refresh();
		mmcScroll.scrollTo(0,0,1);
	}
	
	$("#mmc_shuoming").html(LotteryInfo.getMethodShuoming("ssc",temp));
	
	initFooterData("mmc",temp);
	hideRandomWhenLi("mmc",mmc_sntuo,mmc_playMethod);
	mmc_calcNotes();
}
/**
 * [mmc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function mmc_initFooterButton(){
	if(mmc_playMethod == 0 || mmc_playMethod == 62 || mmc_playMethod == 78
		|| mmc_playMethod == 84 || mmc_playMethod == 93 || mmc_playType == 7){
		if(LotteryStorage["mmc"]["line1"].length > 0 || LotteryStorage["mmc"]["line2"].length > 0 ||
			LotteryStorage["mmc"]["line3"].length > 0 || LotteryStorage["mmc"]["line4"].length > 0 ||
			LotteryStorage["mmc"]["line5"].length > 0){
			$("#mmc_qingkong").css("opacity",1.0);
		}else{
			$("#mmc_qingkong").css("opacity",0.4);
		}
	}else if(mmc_playMethod == 9){
		if(LotteryStorage["mmc"]["line1"].length > 0 || LotteryStorage["mmc"]["line2"].length > 0 ||
			LotteryStorage["mmc"]["line3"].length > 0 || LotteryStorage["mmc"]["line4"].length > 0 ){
			$("#mmc_qingkong").css("opacity",1.0);
		}else{
			$("#mmc_qingkong").css("opacity",0.4);
		}
	}else if(mmc_playMethod == 37 || mmc_playMethod == 4 || mmc_playMethod == 6
		|| mmc_playMethod == 26 || mmc_playMethod == 15 || mmc_playMethod == 75 || mmc_playMethod == 77){
		if(LotteryStorage["mmc"]["line1"].length > 0 || LotteryStorage["mmc"]["line2"].length > 0
			|| LotteryStorage["mmc"]["line3"].length > 0){
			$("#mmc_qingkong").css("opacity",1.0);
		}else{
			$("#mmc_qingkong").css("opacity",0.4);
		}
	}else if(mmc_playMethod == 3 || mmc_playMethod == 4 || mmc_playMethod == 5
		|| mmc_playMethod == 6 || mmc_playMethod == 7 || mmc_playMethod == 12
		|| mmc_playMethod == 14 || mmc_playMethod == 48 || mmc_playMethod == 55
		|| mmc_playMethod == 74 || mmc_playMethod == 76 || mmc_playMethod == 96 || mmc_playMethod == 98){
		if(LotteryStorage["mmc"]["line1"].length > 0 || LotteryStorage["mmc"]["line2"].length > 0){
			$("#mmc_qingkong").css("opacity",1.0);
		}else{
			$("#mmc_qingkong").css("opacity",0.4);
		}
	}else if(mmc_playMethod == 2 || mmc_playMethod == 8 || mmc_playMethod == 11 || mmc_playMethod == 13 || mmc_playMethod == 39
		|| mmc_playMethod == 28 || mmc_playMethod == 17 || mmc_playMethod == 18 || mmc_playMethod == 24 || mmc_playMethod == 41
		|| mmc_playMethod == 25 || mmc_playMethod == 29 || mmc_playMethod == 42 || mmc_playMethod == 43 || mmc_playMethod == 30
		|| mmc_playMethod == 35 || mmc_playMethod == 36 || mmc_playMethod == 31 || mmc_playMethod == 32 || mmc_playMethod == 19
		|| mmc_playMethod == 40 || mmc_playMethod == 46 || mmc_playMethod == 20 || mmc_playMethod == 21 || mmc_playMethod == 50
		|| mmc_playMethod == 47 || mmc_playMethod == 51 || mmc_playMethod == 52 || mmc_playMethod == 53 || mmc_playMethod == 57 || mmc_playMethod == 63
		|| mmc_playMethod == 58 || mmc_playMethod == 59 || mmc_playMethod == 60 || mmc_playMethod == 65 || mmc_playMethod == 80 || mmc_playMethod == 81 || mmc_playType == 8
		|| mmc_playMethod == 83 || mmc_playMethod == 86 || mmc_playMethod == 87 || mmc_playMethod == 22 || mmc_playMethod == 33 || mmc_playMethod == 44
		|| mmc_playMethod == 89 || mmc_playMethod == 92 || mmc_playMethod == 95 || mmc_playMethod == 54 || mmc_playMethod == 61
		|| mmc_playMethod == 97 || mmc_playType == 13  || mmc_playType == 14){
		if(LotteryStorage["mmc"]["line1"].length > 0){
			$("#mmc_qingkong").css("opacity",1.0);
		}else{
			$("#mmc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#mmc_qingkong").css("opacity",0);
	}

	if($("#mmc_qingkong").css("opacity") == "0"){
		$("#mmc_qingkong").css("display","none");
	}else{
		$("#mmc_qingkong").css("display","block");
	}

	if($('#mmc_zhushu').html() > 0){
		$("#mmc_queding").css("opacity",1.0);
	}else{
		$("#mmc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function  mmc_qingkongAll(){
	$("#mmc_ballView span").removeClass('redBalls_active');
	LotteryStorage["mmc"]["line1"] = [];
	LotteryStorage["mmc"]["line2"] = [];
	LotteryStorage["mmc"]["line3"] = [];
	LotteryStorage["mmc"]["line4"] = [];
	LotteryStorage["mmc"]["line5"] = [];

	localStorageUtils.removeParam("mmc_line1");
	localStorageUtils.removeParam("mmc_line2");
	localStorageUtils.removeParam("mmc_line3");
	localStorageUtils.removeParam("mmc_line4");
	localStorageUtils.removeParam("mmc_line5");

	$('#mmc_zhushu').text(0);
	$('#mmc_money').text(0);
	clearAwardWin("mmc");
	mmc_initFooterButton();
}

/**
 * [mmc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function mmc_calcNotes(){
	$('#mmc_modeId').blur();
	$('#mmc_fandian').blur();
	
	var notes = 0;

	if(mmc_playMethod == 0){
		notes = LotteryStorage["mmc"]["line1"].length *
			LotteryStorage["mmc"]["line2"].length *
			LotteryStorage["mmc"]["line3"].length *
			LotteryStorage["mmc"]["line4"].length *
			LotteryStorage["mmc"]["line5"].length;
	}else if(mmc_playMethod == 2){
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,5);
	}else if(mmc_playMethod == 3){
		if (LotteryStorage["mmc"]["line1"].length >= 1 && LotteryStorage["mmc"]["line2"].length >= 3) {
			notes = getArraySelect(3,LotteryStorage["mmc"]["line1"],LotteryStorage["mmc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(mmc_playMethod == 4){
		if (LotteryStorage["mmc"]["line1"].length >= 2 && LotteryStorage["mmc"]["line2"].length >= 1) {
			notes = getArraySelect(2,LotteryStorage["mmc"]["line2"],LotteryStorage["mmc"]["line1"]);
		}else{
			notes = 0;
		}
	}else if(mmc_playMethod == 5 || mmc_playMethod == 12){
		if (LotteryStorage["mmc"]["line1"].length >= 1 && LotteryStorage["mmc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["mmc"]["line1"],LotteryStorage["mmc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(mmc_playMethod == 6 || mmc_playMethod == 7 || mmc_playMethod == 14){
		if (LotteryStorage["mmc"]["line1"].length >= 1 && LotteryStorage["mmc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["mmc"]["line1"],LotteryStorage["mmc"]["line2"]);
		}else{
			notes = 0;
		}
	}else if(mmc_playMethod == 9){
		notes = LotteryStorage["mmc"]["line1"].length *
			LotteryStorage["mmc"]["line2"].length *
			LotteryStorage["mmc"]["line3"].length *
			LotteryStorage["mmc"]["line4"].length;
	}else if(mmc_playMethod == 18 || mmc_playMethod == 29 || mmc_playMethod == 40){
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["mmc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 6 * temp;
			}
		}
	}else if(mmc_playMethod == 22 || mmc_playMethod == 33 || mmc_playMethod == 44 ){
		notes = 54;
	}else if(mmc_playMethod == 54 || mmc_playMethod == 61){
		notes = 9;
	}else if(mmc_playMethod == 51 || mmc_playMethod == 58){
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			var temp = parseInt(LotteryStorage["mmc"]["line1"][i]);
			if(temp == 0){
				notes += 10;
			}else {
				notes += mathUtil.getCCombination(10 - temp,1) * 2;
			}
		}
	}else if(mmc_playMethod == 11){
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,4);
	}else if(mmc_playMethod == 13|| mmc_playMethod == 64 || mmc_playMethod == 66 || mmc_playMethod == 68 || mmc_playMethod == 70 || mmc_playMethod == 72){
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,2);
	}else if(mmc_playMethod == 37 || mmc_playMethod == 26 || mmc_playMethod == 15 || mmc_playMethod == 75 || mmc_playMethod == 77){
		notes = LotteryStorage["mmc"]["line1"].length *
			LotteryStorage["mmc"]["line2"].length *
			LotteryStorage["mmc"]["line3"].length ;
	}else if(mmc_playMethod == 39 || mmc_playMethod == 28 || mmc_playMethod == 17){
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["mmc"]["line1"][i]);
		};
	}else if(mmc_playMethod == 41 || mmc_playMethod == 30 || mmc_playMethod == 19){
		notes = mathUtil.getACombination(LotteryStorage["mmc"]["line1"].length,2);
	}else if(mmc_playMethod == 42 || mmc_playMethod == 31 || mmc_playMethod == 20 || mmc_playMethod == 68 || mmc_playMethod == 73){
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,3);
	}else if(mmc_playMethod == 43 || mmc_playMethod == 32 || mmc_playMethod == 21){
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["mmc"]["line1"][i]);
		};
	}else if(mmc_playMethod == 48 || mmc_playMethod == 55 || mmc_playMethod == 74 || mmc_playMethod == 76){
		notes = LotteryStorage["mmc"]["line1"].length *
			LotteryStorage["mmc"]["line2"].length ;
	}else if(mmc_playMethod == 50 || mmc_playMethod == 57){
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["mmc"]["line1"][i]);
		};
	}else if(mmc_playMethod == 52 || mmc_playMethod == 59){
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,2);
	}else if(mmc_playMethod == 53 || mmc_playMethod == 60){
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["mmc"]["line1"][i]);
		};
	}else if(mmc_playMethod == 62){
		notes = LotteryStorage["mmc"]["line1"].length +
			LotteryStorage["mmc"]["line2"].length +
			LotteryStorage["mmc"]["line3"].length +
			LotteryStorage["mmc"]["line4"].length +
			LotteryStorage["mmc"]["line5"].length;
	}else if(mmc_playType == 13 || mmc_playType == 14 || mmc_playMethod == 8 || mmc_playMethod == 71
		|| mmc_playMethod == 24 || mmc_playMethod == 25 || mmc_playMethod == 35 || mmc_playMethod == 36 || mmc_playMethod == 46
		|| mmc_playMethod == 47 || mmc_playMethod == 63 || mmc_playMethod == 65 || mmc_playMethod == 67 || mmc_playMethod == 69 ){
		notes = LotteryStorage["mmc"]["line1"].length ;
	}else if(mmc_playMethod == 78){
		notes = LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line2"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line3"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line4"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line3"].length +
			LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line4"].length +
			LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line4"].length +
			LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line4"].length * LotteryStorage["mmc"]["line5"].length;
	}else if (mmc_playMethod == 80) {
		if ($("#mmc_tab .button.red").size() < 2) {
			notes = 0;
		}else{
			for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
				notes += mathUtil.getErXingZhiXuanHeZhiNote(LotteryStorage["mmc"]["line1"][i]);
			};
			notes *= mathUtil.getCCombination($("#mmc_tab .button.red").size() ,2);
		}
	}else if (mmc_playMethod == 81) {
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,2) * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,2);
	}else if (mmc_playMethod == 83) {
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			notes += mathUtil.getErXingZuXuanHeZhiNote(LotteryStorage["mmc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#mmc_tab .button.red").size() ,2);
	}else if (mmc_playMethod == 84) {
		notes = LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line3"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line4"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line4"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line4"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line4"].length +
			LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line4"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line4"].length * LotteryStorage["mmc"]["line5"].length ;
	}else if (mmc_playMethod == 86) {
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			notes += mathUtil.getZhiXuanHeZhiNote(LotteryStorage["mmc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#mmc_tab .button.red").size() ,3);
	}else if (mmc_playMethod == 87) {
		notes = mathUtil.getACombination(LotteryStorage["mmc"]["line1"].length,2) * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,3);
	}else if (mmc_playMethod == 89) {
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,3) * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,3);
	}else if (mmc_playMethod == 92) {
		for (var i = 0; i < LotteryStorage["mmc"]["line1"].length; i++) {
			notes += mathUtil.getSanXingZuXuanHeZhiNote(LotteryStorage["mmc"]["line1"][i]);
		};
		notes *= mathUtil.getCCombination($("#mmc_tab .button.red").size() ,3);
	}else if (mmc_playMethod == 93) {
		notes = LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line4"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line4"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line1"].length * LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line4"].length * LotteryStorage["mmc"]["line5"].length +
			LotteryStorage["mmc"]["line2"].length * LotteryStorage["mmc"]["line3"].length * LotteryStorage["mmc"]["line4"].length * LotteryStorage["mmc"]["line5"].length;
	}else if (mmc_playMethod == 95) {
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,4)
			* mathUtil.getCCombination($("#mmc_tab .button.red").size() ,4);
	}else if (mmc_playMethod == 96) {
		if (LotteryStorage["mmc"]["line1"].length >= 1 && LotteryStorage["mmc"]["line2"].length >= 2) {
			notes = getArraySelect(2,LotteryStorage["mmc"]["line1"],LotteryStorage["mmc"]["line2"])
				* mathUtil.getCCombination($("#mmc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else if (mmc_playMethod == 97) {
		notes = mathUtil.getCCombination(LotteryStorage["mmc"]["line1"].length,2) * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,4);
	}else if (mmc_playMethod == 98) {
		if (LotteryStorage["mmc"]["line1"].length >= 1 && LotteryStorage["mmc"]["line2"].length >= 1) {
			notes = getArraySelect(1,LotteryStorage["mmc"]["line1"],LotteryStorage["mmc"]["line2"]) * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,4);
		}else{
			notes = 0;
		}
	}else{
		notes = mmcValidData($("#mmc_single").val());
	}

	if(mmc_sntuo == 3 || mmc_sntuo == 1 || getplayid(LotteryInfo.getId("ssc","mmc"),LotteryInfo.getMethodId("ssc",mmc_playMethod))){
	}else{
		if(parseInt($('#mmc_modeId').val()) == 8){
			$("#mmc_random").hide();
		}else{
			$("#mmc_random").show();
		}
	}

	//验证是否为空
	if( $("#mmc_beiNum").val() =="" || parseInt($("#mmc_beiNum").val()) == 0){
		$("#mmc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#mmc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#mmc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}

	if(notes > 0) {
		$('#mmc_zhushu').text(notes);
		if($("#mmc_modeId").val() == "8"){
			$('#mmc_money').text(bigNumberUtil.multiply(notes * parseInt($("#mmc_beiNum").val()),0.002));
		}else if ($("#mmc_modeId").val() == "2"){
			$('#mmc_money').text(bigNumberUtil.multiply(notes * parseInt($("#mmc_beiNum").val()),0.2));
		}else if ($("#mmc_modeId").val() == "1"){
			$('#mmc_money').text(bigNumberUtil.multiply(notes * parseInt($("#mmc_beiNum").val()),0.02));
		}else{
			$('#mmc_money').text(bigNumberUtil.multiply(notes * parseInt($("#mmc_beiNum").val()),2));
		}
	} else {
		$('#mmc_zhushu').text(0);
		$('#mmc_money').text(0);
	}
	mmc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('mmc',mmc_playMethod);
}

/**
 * [mmc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function mmc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#mmc_queding").bind('click', function(event) {
		mmc_rebate = $("#mmc_fandian option:last").val();
		if(parseInt($('#mmc_zhushu').html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		mmc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#mmc_modeId').val()) == 8){
			if (Number($('#mmc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('mmc',mmc_playMethod);

		submitParams.lotteryType = "mmc";
		var play = LotteryInfo.getPlayName("ssc",mmc_playType);
		var playMethod = LotteryInfo.getMethodName("ssc",mmc_playMethod);
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = mmc_playType;
		submitParams.playMethodIndex = mmc_playMethod;
		var selectedBalls = [];
		if(mmc_playMethod == 0 || mmc_playMethod == 3 || mmc_playMethod == 4
			|| mmc_playMethod == 5 || mmc_playMethod == 6 || mmc_playMethod == 7
			|| mmc_playMethod == 9 || mmc_playMethod == 12 || mmc_playMethod == 14
			|| mmc_playMethod == 37 || mmc_playMethod == 26 || mmc_playMethod == 15
			|| mmc_playMethod == 48 || mmc_playMethod == 55 || mmc_playMethod == 74 || mmc_playType == 9){
			$("#mmc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			submitParams.nums = selectedBalls.join("|");
		}else if(mmc_playMethod == 2 || mmc_playMethod == 8 || mmc_playMethod == 11 || mmc_playMethod == 13 || mmc_playMethod == 24
			|| mmc_playMethod == 39 || mmc_playMethod == 28 || mmc_playMethod == 17 || mmc_playMethod == 18 || mmc_playMethod == 25
			|| mmc_playMethod == 22 || mmc_playMethod == 33 || mmc_playMethod == 44 || mmc_playMethod == 54 || mmc_playMethod == 61
			|| mmc_playMethod == 41 || mmc_playMethod == 42 || mmc_playMethod == 43 || mmc_playMethod == 29 || mmc_playMethod == 35
			|| mmc_playMethod == 30 || mmc_playMethod == 31 || mmc_playMethod == 32 || mmc_playMethod == 40 || mmc_playMethod == 36
			|| mmc_playMethod == 19 || mmc_playMethod == 20 || mmc_playMethod == 21 || mmc_playMethod == 46 || mmc_playMethod == 47
			|| mmc_playMethod == 50 || mmc_playMethod == 57 || mmc_playType == 8 || mmc_playMethod == 51 || mmc_playMethod == 58
			|| mmc_playMethod == 52 || mmc_playMethod == 53|| mmc_playMethod == 59 || mmc_playMethod == 60 || mmc_playType == 13 || mmc_playType == 14){
			$("#mmc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(mmc_playType == 7 || mmc_playMethod == 78 || mmc_playMethod == 84 || mmc_playMethod == 93){
			$("#mmc_ballView div.ballView").each(function(){
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
		}else if(mmc_playMethod == 80 || mmc_playMethod == 81 || mmc_playMethod == 83
			|| mmc_playMethod == 86 || mmc_playMethod == 87 || mmc_playMethod == 89
			|| mmc_playMethod == 92 || mmc_playMethod == 95 || mmc_playMethod == 97){
			$("#mmc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			var temp = selectedBalls.join(",") + "#";

			if ($("#mmc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#mmc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#mmc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#mmc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#mmc_tab5").hasClass("button red")) {
				temp += "个";
			};

			submitParams.nums = temp;
		}else if (mmc_playMethod == 96 || mmc_playMethod == 98) {
			$("#mmc_ballView div.ballView").each(function(){
				var arr = [];
				$(this).find("span.redBalls_active").each(function(){
					arr.push($(this).text());
				});
				selectedBalls.push(arr.join(","));
			});
			var temp = selectedBalls.join("|") + "#";
			if ($("#mmc_tab1").hasClass("button red")) {
				temp += "万";
			};
			if ($("#mmc_tab2").hasClass("button red")) {
				temp += "千";
			};
			if ($("#mmc_tab3").hasClass("button red")) {
				temp += "百";
			};
			if ($("#mmc_tab4").hasClass("button red")) {
				temp += "十";
			};
			if ($("#mmc_tab5").hasClass("button red")) {
				temp += "个";
			};
			submitParams.nums = temp;
		}else{
			//去错误号
			mmcValidateData("submit");
			var array = handleSingleStr($("#mmc_single").val());
			if(mmc_playMethod == 1 ){
				submitParams.nums = array.join(" ");
			}else if(mmc_playMethod == 10 || mmc_playMethod == 38 || mmc_playMethod == 27
				|| mmc_playMethod == 16 || mmc_playMethod == 49 || mmc_playMethod == 56){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join("|");
					}else{
						temp = temp + array[i].split("").join("|") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(mmc_playMethod == 45 || mmc_playMethod == 34 || mmc_playMethod == 23){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				submitParams.nums = temp;
			}else if(mmc_playMethod == 79 || mmc_playMethod == 82 || mmc_playMethod == 85 || mmc_playMethod == 88 ||
				mmc_playMethod == 89 || mmc_playMethod == 90 || mmc_playMethod == 91 || mmc_playMethod == 94){
				var temp = "";
				for(var i = 0;i < array.length;i++){
					if(i == array.length - 1){
						temp = temp + array[i].split("").join(",");
					}else{
						temp = temp + array[i].split("").join(",") + " ";
					}
				}
				temp +="#";
				if ($("#mmc_tab1").hasClass("button red")) {
					temp += "万";
				};
				if ($("#mmc_tab2").hasClass("button red")) {
					temp += "千";
				};
				if ($("#mmc_tab3").hasClass("button red")) {
					temp += "百";
				};
				if ($("#mmc_tab4").hasClass("button red")) {
					temp += "十";
				};
				if ($("#mmc_tab5").hasClass("button red")) {
					temp += "个";
				};

				submitParams.nums = temp;
			}
		}
		localStorageUtils.setParam("playMode",$("#mmc_modeId").val());
        localStorageUtils.setParam("playBeiNum",$("#mmc_beiNum").val());
        localStorageUtils.setParam("playFanDian",$("#mmc_fandian").val());
		submitParams.notes = $('#mmc_zhushu').html();
		submitParams.sntuo = mmc_sntuo;
		submitParams.multiple = $('#mmc_beiNum').val();  //requirement
		submitParams.rebates = $('#mmc_fandian').val();  //requirement
		submitParams.playMode = $('#mmc_modeId').val();  //requirement
		submitParams.money = $('#mmc_money').html();  //requirement
		submitParams.award = $('#mmc_minAward').html();  //奖金
		submitParams.maxAward = $('#mmc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#mmc_ballView").empty();
		mmc_qingkongAll();
	});
}

/**
 * [mmc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function mmc_randomOne(){
	mmc_qingkongAll();
	if(mmc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		LotteryStorage["mmc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["mmc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["mmc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["mmc"]["line4"].push(redBallArray[3]+"");
		LotteryStorage["mmc"]["line5"].push(redBallArray[4]+"");

		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line2"], function(k, v){
			$("#" + "mmc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line3"], function(k, v){
			$("#" + "mmc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line4"], function(k, v){
			$("#" + "mmc_line4" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line5"], function(k, v){
			$("#" + "mmc_line5" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		LotteryStorage["mmc"]["line1"].push(number+"");
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		LotteryStorage["mmc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["mmc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["mmc"]["line3"].push(redBallArray[2]+"");
		LotteryStorage["mmc"]["line4"].push(redBallArray[3]+"");

		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line2"], function(k, v){
			$("#" + "mmc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line3"], function(k, v){
			$("#" + "mmc_line3" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line4"], function(k, v){
			$("#" + "mmc_line4" + v).toggleClass("redBalls_active");
		});

	}else if(mmc_playMethod == 37 || mmc_playMethod == 26 || mmc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		LotteryStorage["mmc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["mmc"]["line2"].push(redBallArray[1]+"");
		LotteryStorage["mmc"]["line3"].push(redBallArray[2]+"");

		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line2"], function(k, v){
			$("#" + "mmc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line3"], function(k, v){
			$("#" + "mmc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 41 || mmc_playMethod == 30 || mmc_playMethod == 19 || mmc_playMethod == 68
		|| mmc_playMethod == 52 || mmc_playMethod == 64 || mmc_playMethod == 66
		|| mmc_playMethod == 59 || mmc_playMethod == 70 || mmc_playMethod == 72){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["mmc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 42 || mmc_playMethod == 31 || mmc_playMethod == 20 || mmc_playMethod == 73){
		var redBallArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function (k,v) {
			LotteryStorage["mmc"]["line1"].push(v+"");
		});
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 39 || mmc_playMethod == 28 || mmc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		LotteryStorage["mmc"]["line1"].push(number+'');
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 43 || mmc_playMethod == 32 || mmc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		LotteryStorage["mmc"]["line1"].push(number+'');
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 48 || mmc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		LotteryStorage["mmc"]["line1"].push(redBallArray[0]+"");
		LotteryStorage["mmc"]["line2"].push(redBallArray[1]+"");

		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line2"], function(k, v){
			$("#" + "mmc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 25 || mmc_playMethod == 36 || mmc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		LotteryStorage["mmc"]["line1"].push(number+"");
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 50 || mmc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		LotteryStorage["mmc"]["line1"].push(number+"");
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 53 || mmc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		LotteryStorage["mmc"]["line1"].push(number+"");
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 62){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["mmc"]["line"+line].push(number+"");
		$.each(LotteryStorage["mmc"]["line"+line], function(k, v){
			$("#" + "mmc_line" + line + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 63 || mmc_playMethod == 67 || mmc_playMethod == 69 || mmc_playMethod == 71 || mmc_playType == 13
		|| mmc_playMethod == 65 || mmc_playMethod == 18 || mmc_playMethod == 29 || mmc_playMethod == 40 || mmc_playMethod == 22
		|| mmc_playMethod == 33 || mmc_playMethod == 44 || mmc_playMethod == 54 || mmc_playMethod == 61
		|| mmc_playMethod == 24 || mmc_playMethod == 35 || mmc_playMethod == 46 || mmc_playMethod == 51 || mmc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		LotteryStorage["mmc"]["line1"].push(number+'');
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 74 || mmc_playMethod == 76){
		var array = mathUtil.getNums(2,4);
		LotteryStorage["mmc"]["line1"].push(array[0]+"");
		LotteryStorage["mmc"]["line2"].push(array[1]+"");
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line2"], function(k, v){
			$("#" + "mmc_line2" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 75 || mmc_playMethod == 77){
		var array = mathUtil.getNums(3,4);
		LotteryStorage["mmc"]["line1"].push(array[0]+"");
		LotteryStorage["mmc"]["line2"].push(array[1]+"");
		LotteryStorage["mmc"]["line3"].push(array[2]+"");
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line2"], function(k, v){
			$("#" + "mmc_line2" + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line3"], function(k, v){
			$("#" + "mmc_line3" + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 78){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(2,lineArray);
		var array = mathUtil.getNums(2,10);
		LotteryStorage["mmc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["mmc"]["line"+lines[1]].push(array[1]+"");
		$.each(LotteryStorage["mmc"]["line"+lines[0]], function(k, v){
			$("#" + "mmc_line" + lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line"+lines[1]], function(k, v){
			$("#" + "mmc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 84){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(3,lineArray);
		var array = mathUtil.getNums(3,10);
		LotteryStorage["mmc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["mmc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["mmc"]["line"+lines[2]].push(array[2]+"");

		$.each(LotteryStorage["mmc"]["line"+lines[0]], function(k, v){
			$("#" + "mmc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line"+lines[1]], function(k, v){
			$("#" + "mmc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line"+lines[0]], function(k, v){
			$("#" + "mmc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playMethod == 93){
		var lineArray = mathUtil.getInts(1,5);
		var lines = mathUtil.getDifferentNums(4,lineArray);
		var array = mathUtil.getNums(4,10);
		LotteryStorage["mmc"]["line"+lines[0]].push(array[0]+"");
		LotteryStorage["mmc"]["line"+lines[1]].push(array[1]+"");
		LotteryStorage["mmc"]["line"+lines[2]].push(array[2]+"");
		LotteryStorage["mmc"]["line"+lines[3]].push(array[3]+"");

		$.each(LotteryStorage["mmc"]["line"+lines[0]], function(k, v){
			$("#" + "mmc_line"+ lines[0] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line"+lines[1]], function(k, v){
			$("#" + "mmc_line"+ lines[1] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line"+lines[2]], function(k, v){
			$("#" + "mmc_line"+ lines[2] + v).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["mmc"]["line"+lines[3]], function(k, v){
			$("#" + "mmc_line"+ lines[3] + v).toggleClass("redBalls_active");
		});
	}else if(mmc_playType == 14){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["mmc"]["line1"].push(number+"");
		$.each(LotteryStorage["mmc"]["line1"], function(k, v){
			$("#" + "mmc_line1" + v).toggleClass("redBalls_active");
		});
	}
	mmc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function mmc_checkOutRandom(playMethod){
	var obj = new Object();
	if(mmc_playMethod == 0){
		var redBallArray = mathUtil.getNums(5,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(mmc_playMethod == 8){
		var number = mathUtil.getRandomNum(0,4);
		var array = ["大","小","单","双"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(mmc_playMethod == 18 || mmc_playMethod == 29 || mmc_playMethod == 40){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 6 * number;
		}
	}else if(mmc_playMethod == 22 || mmc_playMethod == 33 || mmc_playMethod == 44){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 54;
	}else if(mmc_playMethod == 54 || mmc_playMethod == 61){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 9;
	}
	else if(mmc_playMethod == 9){
		var redBallArray = mathUtil.getNums(4,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(mmc_playMethod == 37 || mmc_playMethod == 26 || mmc_playMethod == 15){
		var redBallArray = mathUtil.getNums(3,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(mmc_playMethod == 39 || mmc_playMethod == 28 || mmc_playMethod == 17){
		var number = mathUtil.getRandomNum(0,28);
		obj.nums = number;
		obj.notes = mathUtil.getZhiXuanHeZhiNote(number);
	}else if(mmc_playMethod == 41 || mmc_playMethod == 30 || mmc_playMethod == 19){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 2;
	}else if(mmc_playMethod == 52 || mmc_playMethod == 59 || mmc_playMethod == 64 || mmc_playMethod == 66 || mmc_playMethod == 68
		||mmc_playMethod == 70 || mmc_playMethod == 72){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(2,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(mmc_playMethod == 42 || mmc_playMethod == 31 || mmc_playMethod == 20 || mmc_playMethod == 73){
		var lineArray = mathUtil.getInts(0,9);
		var array = mathUtil.getDifferentNums(3,lineArray);
		obj.nums = array.join(",");
		obj.notes = 1;
	}else if(mmc_playMethod == 43 || mmc_playMethod == 32 || mmc_playMethod == 21){
		var number = mathUtil.getRandomNum(1,27);
		obj.nums = number;
		obj.notes = mathUtil.getSanXingZuXuanHeZhiNote(number);
	}else if(mmc_playMethod == 48 || mmc_playMethod == 55){
		var redBallArray = mathUtil.getNums(2,10);
		obj.nums = redBallArray.join("|");
		obj.notes = 1;
	}else if(mmc_playMethod == 50 || mmc_playMethod == 57){
		var number = mathUtil.getRandomNum(0,19);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZhiXuanHeZhiNote(number);
	}else if(mmc_playMethod == 53 || mmc_playMethod == 60){
		var number = mathUtil.getRandomNum(1,18);
		obj.nums = number;
		obj.notes = mathUtil.getErXingZuXuanHeZhiNote(number);
	}else if(mmc_playMethod == 62){
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
	}else if(mmc_playMethod == 63 || mmc_playMethod == 65 || mmc_playMethod == 67 || mmc_playMethod == 69 || mmc_playMethod == 71
		|| mmc_playMethod == 24 || mmc_playMethod == 35 || mmc_playMethod == 46){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		obj.notes = 1;
	}else if(mmc_playMethod == 25 || mmc_playMethod == 36 || mmc_playMethod == 47){
		var number = mathUtil.getRandomNum(0,5);
		var array = ["豹子","顺子","对子","半顺","杂六"];
		obj.nums = array[number];
		obj.notes = 1;
	}else if(mmc_playMethod == 51 || mmc_playMethod == 58){
		var number = mathUtil.getRandomNum(0,10);
		obj.nums = number;
		if(number == 0){
			obj.notes = 10;
		}else {
			obj.notes = mathUtil.getCCombination(10 - number,1) * 2;
		}
	}else if(mmc_playMethod == 74 || mmc_playMethod == 76){
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
	}else if(mmc_playMethod == 75 || mmc_playMethod == 77){
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
	}else if(mmc_playMethod == 78){
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
	}else if(mmc_playMethod == 84){
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
	}else if(mmc_playMethod == 93){
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
	obj.sntuo = mmc_sntuo;
	obj.multiple = 1;
	obj.rebates = mmc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('mmc',mmc_playMethod,obj);  //机选奖金计算
	obj.award = $('#mmc_minAward').html();     //奖金
	obj.maxAward = $('#mmc_maxAward').html();  //多级奖金
	return obj;
}

/**
 * [mmcValidateData 单式数据验证]
 */
function mmcValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#mmc_single").val();
    textStr = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+|\s+/g),' ');
	mmcValidData(textStr,type);
}

function mmcValidData(str,type){
	if (typeof type == "undefined"){type = "onblur"}
	var notes = 0,
		array,
		result,
		content = {};
	if(mmc_playMethod == 1){
		content.str = str;
		content.weishu = 5;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 10){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 38 || mmc_playMethod == 27 || mmc_playMethod == 16){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 45 || mmc_playMethod == 34 || mmc_playMethod == 23){
		// baozi : 是否要过滤豹子号
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 49 || mmc_playMethod == 56){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length;
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 79){
		content.str = str;
		content.weishu = 2;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,2);
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 82){
		content.str = str;
		content.weishu = 2;
		content.duizi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,2);
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 85){
		content.str = str;
		content.weishu = 3;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,3);
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 88){
		content.str = str;
		content.weishu = 3;
		content.zusan = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,3);
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 90){
		content.str = str;
		content.weishu = 3;
		content.zuliu = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,3);
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 91){
		content.str = str;
		content.weishu = 3;
		content.baozi = true;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,3);
		mmcShowFooter(true,notes);
	}else if(mmc_playMethod == 94){
		content.str = str;
		content.weishu = 4;
		result = handleSingleStr_deleteErr(content,type);
		array = result.num;
		notes = result.length * mathUtil.getCCombination($("#mmc_tab .button.red").size() ,4);
		mmcShowFooter(true,notes);
	}

	$('#mmc_delRepeat').off('click');
	$('#mmc_delRepeat').on('click',function () {
		content.str = $('#mmc_single').val() ? $('#mmc_single').val() : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		array = rptResult.num || [];
		notes = rptResult.length;
		mmcShowFooter(true,notes);
		$("#mmc_single").val(array.join(" "));
	});

	$("#mmc_single").val(array.join(" "));
	return notes;
}

function mmcShowFooter(isValid,notes){
	$('#mmc_zhushu').text(notes);
	if($("#mmc_modeId").val() == "8"){
		$('#mmc_money').text(bigNumberUtil.multiply(notes * parseInt($("#mmc_beiNum").val()),0.002));
	}else if ($("#mmc_modeId").val() == "2"){
		$('#mmc_money').text(bigNumberUtil.multiply(notes * parseInt($("#mmc_beiNum").val()),0.2));
	}else if ($("#mmc_modeId").val() == "1"){
		$('#mmc_money').text(bigNumberUtil.multiply(notes * parseInt($("#mmc_beiNum").val()),0.02));
	}else{
		$('#mmc_money').text(bigNumberUtil.multiply(notes * parseInt($("#mmc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	mmc_initFooterButton();
	calcAwardWin('mmc',mmc_playMethod);  //计算奖金和盈利
}