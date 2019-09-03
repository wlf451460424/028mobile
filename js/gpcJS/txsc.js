
//定义PK拾玩法标识
var txsc_playType = 0;
var txsc_playMethod = 0;
var txsc_sntuo = 0;
var txsc_rebate;
var txscScroll;

//进入这个页面时调用
function txscPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("txsc")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("txsc_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function txscPageUnloadedPanel(){
	$("#txscPage_back").off('click');
	$("#txsc_queding").off('click');
	$("#txsc_ballView").empty();
	$("#txscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="txscPlaySelect"></select>');
	$("#txscSelect").append($select);
}

//入口函数
function txsc_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("txsc").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("txsc")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("txsc")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
	$("#txsc_title").html(LotteryInfo.getLotteryNameByTag("txsc"));
	for(var i = 0; i< LotteryInfo.getPlayLength("txsc");i++){
		if(i == 8)continue;
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("txsc",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("txsc");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("txsc",j) == LotteryInfo.getPlayTypeId("txsc",i)){
				var name = LotteryInfo.getMethodName("txsc",j);
				if(i == txsc_playType && j == txsc_playMethod){
					$play.append('<option value="txsc'+LotteryInfo.getMethodIndex("txsc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="txsc'+LotteryInfo.getMethodIndex("txsc",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(txsc_playMethod,onShowArray)>-1 ){
						txsc_playType = i;
						txsc_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#txscPlaySelect").append($play);
		}
	}
	
	if($("#txscPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("txscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:txscChangeItem
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

	GetLotteryInfo("txsc",function (){
		txscChangeItem("txsc"+txsc_playMethod);
	});

	//添加滑动条
	if(!txscScroll){
		txscScroll = new IScroll('#txscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("txsc",LotteryInfo.getLotteryIdByTag("txsc"));

	//获取上一期开奖
	queryLastPrize("txsc");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('txsc');

	//机选选号
	$("#txsc_random").on('click', function(event) {
		txsc_randomOne();
	});

	//返回
	$("#txscPage_back").on('click', function(event) {
		// txsc_playType = 0;
		// txsc_playMethod = 0;
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		$("#txsc_ballView").empty();
		txsc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#txsc_shuoming").html(LotteryInfo.getMethodShuoming("txsc",txsc_playMethod));
	//玩法说明
	$("#txsc_paly_shuoming").off('click');
	$("#txsc_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#txsc_shuoming").text());
	});

	qingKong("txsc");//清空
	txsc_submitData();
}

function txscResetPlayType(){
	txsc_playType = 0;
	txsc_playMethod = 0;
}

function txscChangeItem(val) {
	txsc_qingkongAll();
	var temp = val.substring("txsc".length,val.length);
	if(val == 'txsc0'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 0;
		txsc_playMethod = 0;

		createOneLineLayout("txsc","请至少选择1个",1,10,true,function(){
			txsc_calcNotes();
		});
	}else if(val == 'txsc1'){
		$("#txsc_random").show();
		var tip1 = "冠军：可选1-10个";
		var tip2 = "亚军：可选1-10个";
		var tips = [tip1,tip2];
		txsc_sntuo = 0;
		txsc_playType = 1;
		txsc_playMethod = 1;
		createTwoWinner("txsc",tips,1,10,true,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc2'){
		$("#txsc_random").hide();
		txsc_sntuo = 3;
		txsc_playType = 1;
		txsc_playMethod = 2;
		txsc_qingkongAll();
		var tips = "<p>格式说明<br/>冠亚军单式01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("txsc",tips);
	}else if(val == 'txsc3'){
		$("#txsc_random").show();
		var tip1 = "冠军：可选1-10个";
		var tip2 = "亚军：可选1-10个";
		var tip3 = "季军：可选1-10个";
		var tips = [tip1,tip2,tip3];
		txsc_sntuo = 0;
		txsc_playType = 2;
		txsc_playMethod = 3;
		createThreeWinner("txsc",tips,1,10,true,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	} else if(val == 'txsc4'){
		$("#txsc_random").hide();
		txsc_sntuo = 3;
		txsc_playType = 2;
		txsc_playMethod = 4;
		txsc_qingkongAll();
		var tips = "<p>格式说明<br/>猜前三名单式01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("txsc",tips);
	}else if(val == 'txsc5'){
		$("#txsc_random").show();
		var tip1 = "冠军：可选1-10个";
		var tip2 = "亚军：可选1-10个";
		var tip3 = "季军：可选1-10个";
		var tip4 = "第四名：可选1-10个";
		var tips = [tip1,tip2,tip3,tip4];
		txsc_sntuo = 0;
		txsc_playType = 3;
		txsc_playMethod = 5;
		createFourWinner("txsc",tips,1,10,true,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc6'){
		$("#txsc_random").hide();
		$("#txsc_qingkong").hide();
		txsc_sntuo = 3;
		txsc_playType = 3;
		txsc_playMethod = 6;
		txsc_qingkongAll();
		var tips = "<p>格式说明<br/>猜前四名单式01 02 03 04或01020304<br/>1)每注必须是4个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("txsc",tips);
	}else if(val == 'txsc7'){
		$("#txsc_random").show();
		var tip1 = "冠军：可选1-10个";
		var tip2 = "亚军：可选1-10个";
		var tip3 = "季军：可选1-10个";
		var tip4 = "第四名：可选1-10个";
		var tip5 = "第五名：可选1-10个";
		var tips = [tip1,tip2,tip3,tip4,tip5];
		txsc_sntuo = 0;
		txsc_playType = 4;
		txsc_playMethod = 7;
		createFiveWinner("txsc",tips,1,10,true,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc8'){
		$("#txsc_random").hide();
		$("#txsc_qingkong").hide();
		txsc_sntuo = 3;
		txsc_playType = 4;
		txsc_playMethod = 8;
		txsc_qingkongAll();
		var tips = "<p>格式说明<br/>猜前五名单式01 02 03 04 05或0102030405<br/>1)每注必须是5个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("txsc",tips);
	}else if(val == 'txsc9'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 5;
		txsc_playMethod = 9;
		var tips = ["冠军","亚军","季军","第四名","第五名"];
		createFiveWinner("txsc",tips,1,10,true,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc10'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 5;
		txsc_playMethod = 10;
		var tips = ["第六名","第七名","第八名","第九名","第十名"];
		createFiveWinner("txsc",tips,1,10,true,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc11'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 6;
		txsc_playMethod = 11;
		var num = ["大","小"];
		createNonNumLayout("txsc",txsc_playMethod,num,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc12'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 6;
		txsc_playMethod = 12;
		var num = ["大","小"];
		createNonNumLayout("txsc",txsc_playMethod,num,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc13'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 6;
		txsc_playMethod = 13;
		var num = ["大","小"];
		createNonNumLayout("txsc",txsc_playMethod,num,function(){
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc14'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 7;
		txsc_playMethod = 14;
		var num = ["单", "双"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc15'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 7;
		txsc_playMethod = 15;
		var num = ["单", "双"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc16'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 7;
		txsc_playMethod = 16;
		var num = ["单", "双"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc17'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 8;
		txsc_playMethod = 17;
		var num = ["龙", "虎"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc18'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 8;
		txsc_playMethod = 18;
		var num = ["龙", "虎"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc19'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 8;
		txsc_playMethod = 19;
		var num = ["龙", "虎"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc20'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 9;
		txsc_playMethod = 20;
		var num = ["3", "4", "18", "19"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc21'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 9;
		txsc_playMethod = 21;
		var num = ["5", "6", "16", "17"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc22'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 9;
		txsc_playMethod = 22;
		var num = ["7", "8", "14", "15"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc23'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 9;
		txsc_playMethod = 23;
		var num = ["9", "10", "12", "13"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc24'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 9;
		txsc_playMethod = 24;
		var num = ["11"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc25'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 9;
		txsc_playMethod = 25;
		var num = ["大", "双"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc26'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 9;
		txsc_playMethod = 26;
		var num = ["小", "单"];
		createNonNumLayout("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc27'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 10;
		txsc_playMethod = 27;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc28'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 10;
		txsc_playMethod = 28;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc29'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 10;
		txsc_playMethod = 29;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc30'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 10;
		txsc_playMethod = 30;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc31'){
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 10;
		txsc_playMethod = 31;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
		
		
	}else if(val == 'txsc32'){     //2019.05.09   新 玩法
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 11;
		txsc_playMethod = 32;
		var num = ["大","小","单","双",];
		var title = ["冠军：至少选择一个","亚军：至少选择一个","季军：至少选择一个","第四名：至少选择一个","第五名：至少选择一个"];
		createFive_pks_new("txsc", txsc_playMethod, num, title,function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc33'){     //2019.05.09   新 玩法
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 11;
		txsc_playMethod = 33;
		var num = ["大","小","单","双",];
		var title = ["第六名：至少选择一个","第七名：至少选择一个","第八名：至少选择一个","第九名：至少选择一个","第十名：至少选择一个"];
		createFive_pks_new("txsc", txsc_playMethod, num, title,function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc34'){     //2019.05.09   新 玩法
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 11;
		txsc_playMethod = 34;
		var num = ["大","小","单","双",];
		var title = ["冠亚和：至少选择一个"];
		createOne_pks_new("txsc", txsc_playMethod, num, title,function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}else if(val == 'txsc35'){     //2019.05.09   新 玩法
		$("#txsc_random").show();
		txsc_sntuo = 0;
		txsc_playType = 12;
		txsc_playMethod = 35;
		var num = ["3", "4","5", "6","7", "8","9", "10","11", "12","13", "14","15", "16","17", "18","19"];
		createNonNumLayout_pks_new("txsc", txsc_playMethod, num, function () {
			txsc_calcNotes();
		});
		txsc_qingkongAll();
	}
	
	
	if(txscScroll){
		txscScroll.refresh();
		txscScroll.scrollTo(0,0,1);
	}
	
	$("#txsc_shuoming").html(LotteryInfo.getMethodShuoming("txsc",temp));

	initFooterData("txsc",temp);
	hideRandomWhenLi("txsc",txsc_sntuo,txsc_playMethod);
	txsc_calcNotes();
}

/**
 * [txsc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function txsc_initFooterButton(){
	if(txsc_playMethod == 1 || txsc_playMethod == 0){
		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0) {
			$("#txsc_qingkong").css("opacity",1.0);
		}else{
			$("#txsc_qingkong").css("opacity",0.4);
		}
	}else if(txsc_playMethod == 3){
		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
			|| LotteryStorage["txsc"]["line3"].length > 0) {
			$("#txsc_qingkong").css("opacity",1.0);
		}else{
			$("#txsc_qingkong").css("opacity",0.4);
		}
	}else if(txsc_playMethod == 5){
		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
			|| LotteryStorage["txsc"]["line3"].length > 0 || LotteryStorage["txsc"]["line4"].length > 0) {
			$("#txsc_qingkong").css("opacity",1.0);
		}else{
			$("#txsc_qingkong").css("opacity",0.4);
		}
	}else if(txsc_playMethod == 32 || txsc_playMethod == 33 || txsc_playMethod == 34){
		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
			|| LotteryStorage["txsc"]["line3"].length > 0 || LotteryStorage["txsc"]["line4"].length > 0) {
			$("#txsc_qingkong").css("opacity",1.0);
		}else{
			$("#txsc_qingkong").css("opacity",0.4);
		}
	}else if(txsc_playMethod == 35){
		if (LotteryStorage["txsc"]["line1"].length > 0 ) {
			$("#txsc_qingkong").css("opacity",1.0);
		}else{
			$("#txsc_qingkong").css("opacity",0.4);
		}
	}else if(txsc_playMethod == 7){
		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
			|| LotteryStorage["txsc"]["line3"].length > 0 || LotteryStorage["txsc"]["line4"].length > 0 || LotteryStorage["txsc"]["line5"].length > 0) {
			$("#txsc_qingkong").css("opacity",1.0);
		}else{
			$("#txsc_qingkong").css("opacity",0.4);
		}
	}else if(txsc_playType == 5){
		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
			|| LotteryStorage["txsc"]["line3"].length > 0 || LotteryStorage["txsc"]["line4"].length > 0 || LotteryStorage["txsc"]["line5"].length > 0) {
			$("#txsc_qingkong").css("opacity",1.0);
		}else{
			$("#txsc_qingkong").css("opacity",0.4);
		}
	}else if(txsc_playType == 6 || txsc_playType == 7 || txsc_playType == 8 || txsc_playType == 9|| txsc_playType == 10){
		if(LotteryStorage["txsc"]["line1"].length > 0){
			$("#txsc_qingkong").css("opacity",1.0);
		}else{
			$("#txsc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#txsc_qingkong").css("opacity",0);
	}

	if($("#txsc_qingkong").css("opacity") == "0"){
		$("#txsc_qingkong").css("display","none");
	}else{
		$("#txsc_qingkong").css("display","block");
	}

	if($('#txsc_zhushu').html() > 0){
		$("#txsc_queding").css("opacity",1.0);
	}else{
		$("#txsc_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function txsc_qingkongAll(){
	$("#txsc_ballView span").removeClass('redBalls_active');
	$("#txsc_ballView span").removeClass('pks_new_redBalls_active');
	LotteryStorage["txsc"]["line1"] = [];
	LotteryStorage["txsc"]["line2"] = [];
	LotteryStorage["txsc"]["line3"] = [];
	LotteryStorage["txsc"]["line4"] = [];
	LotteryStorage["txsc"]["line5"] = [];
	localStorageUtils.removeParam("txsc_line1");
	localStorageUtils.removeParam("txsc_line2");
	localStorageUtils.removeParam("txsc_line3");
	localStorageUtils.removeParam("txsc_line4");
	localStorageUtils.removeParam("txsc_line5");

	$('#txsc_zhushu').text(0);
	$('#txsc_money').text(0);
	clearAwardWin("txsc");
	txsc_initFooterButton();
}

/**
 * [txsc_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function txsc_calcNotes(){
	$('#txsc_modeId').blur();
	$('#txsc_fandian').blur();
	
	var notes = 0;
	if(txsc_playMethod == 0 || txsc_playType == 6 || txsc_playType == 7 || txsc_playType == 8 || txsc_playType == 9|| txsc_playType == 10|| txsc_playType == 12){
		notes = LotteryStorage["txsc"]["line1"].length;
	}else if(txsc_playMethod == 1 ) {
		for(var i = 0;i < LotteryStorage["txsc"]["line1"].length; i++){
			var flag = false;
			for(var j = 0;j < LotteryStorage["txsc"]["line2"].length; j++){
				if(LotteryStorage["txsc"]["line1"][i] == LotteryStorage["txsc"]["line2"][j]){
					flag = true;
				}
			}
			if(flag){
				notes += (LotteryStorage["txsc"]["line2"].length - 1);
			}else{
				notes += LotteryStorage["txsc"]["line2"].length;
			}
		}
	}else if(txsc_playType == 5){
		notes = LotteryStorage["txsc"]["line1"].length + LotteryStorage["txsc"]["line2"].length + LotteryStorage["txsc"]["line3"].length
			+ LotteryStorage["txsc"]["line4"].length + LotteryStorage["txsc"]["line5"].length;
	}else if(txsc_playType == 11){
		notes = LotteryStorage["txsc"]["line1"].length + LotteryStorage["txsc"]["line2"].length + LotteryStorage["txsc"]["line3"].length
			+ LotteryStorage["txsc"]["line4"].length + LotteryStorage["txsc"]["line5"].length;
	}else if(txsc_playMethod == 3){
		for(var i = 0;i < LotteryStorage["txsc"]["line1"].length; i++){
			for(var j = 0;j < LotteryStorage["txsc"]["line2"].length; j++){
				for(var k = 0;k < LotteryStorage["txsc"]["line3"].length; k++){
					if(LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line2"][j] &&
						LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line3"][k]
						&& LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line3"][k]){
						notes++;
					}
				}
			}
		}
	}else if(txsc_playMethod == 5){
		for(var i = 0;i < LotteryStorage["txsc"]["line1"].length; i++){
			for(var j = 0;j < LotteryStorage["txsc"]["line2"].length; j++){
				for(var k = 0;k < LotteryStorage["txsc"]["line3"].length; k++){
					for(var m = 0;m < LotteryStorage["txsc"]["line4"].length; m++){
						if(LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line2"][j] &&
						LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line3"][k]&&
						LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line4"][m]&&
						LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line3"][k]&&
						LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line4"][m]&&
						LotteryStorage["txsc"]["line3"][k] != LotteryStorage["txsc"]["line4"][m]){
						notes++;
						}
					}
				}
			}
		}
	}else if(txsc_playMethod == 7){
		for(var i = 0;i < LotteryStorage["txsc"]["line1"].length; i++){
			for(var j = 0;j < LotteryStorage["txsc"]["line2"].length; j++){
				for(var k = 0;k < LotteryStorage["txsc"]["line3"].length; k++){
					for(var m = 0;m < LotteryStorage["txsc"]["line4"].length; m++){
						for(var n = 0;n < LotteryStorage["txsc"]["line5"].length; n++){
							if(LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line2"][j] &&
							LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line3"][k]&&
							LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line4"][m]&&
							LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line5"][n]&&
							LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line3"][k]&&
							LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line4"][m]&&
							LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line5"][n]&&
							LotteryStorage["txsc"]["line3"][k] != LotteryStorage["txsc"]["line4"][m]&&
							LotteryStorage["txsc"]["line3"][k] != LotteryStorage["txsc"]["line5"][n]&&
							LotteryStorage["txsc"]["line4"][m] != LotteryStorage["txsc"]["line5"][n]){
							notes++;
							}
						}
					}
				}
			}
		}
	}else if(txsc_playType == 11){
		notes = LotteryStorage["txsc"]["line1"].length + LotteryStorage["txsc"]["line2"].length + LotteryStorage["txsc"]["line3"].length
			+ LotteryStorage["txsc"]["line4"].length + LotteryStorage["txsc"]["line5"].length;
	}else{//单式
		notes = txscValidateData('onblur');
	}

	hideRandomWhenLi("txsc",txsc_sntuo,txsc_playMethod);

	//验证是否为空
	if( $("#txsc_beiNum").val() =="" || parseInt($("#txsc_beiNum").val()) == 0){
		$("#txsc_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#txsc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#txsc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}
	if(notes > 0) {
		$('#txsc_zhushu').text(notes);
		if($("#txsc_modeId").val() == "8"){
			$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.002));
		}else if ($("#txsc_modeId").val() == "2"){
			$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.2));
		}else if ($("#txsc_modeId").val() == "1"){
			$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.02));
		}else{
			$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),2));
		}

	} else {
		$('#txsc_zhushu').text(0);
		$('#txsc_money').text(0);
	}
	txsc_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('txsc',txsc_playMethod);
}

/**
 * [txsc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function txsc_randomOne(){
	txsc_qingkongAll();
	if(txsc_playType == 0){
		var number = mathUtil.getRandomNum(1,11);
		LotteryStorage["txsc"]["line1"].push(number > 9 ? number+"" : "0"+number);

		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(txsc_playMethod == 1){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		LotteryStorage["txsc"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
		LotteryStorage["txsc"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line2"], function(k, v){
			$("#" + "txsc_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(txsc_playMethod == 3){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		LotteryStorage["txsc"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
		LotteryStorage["txsc"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
		LotteryStorage["txsc"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line2"], function(k, v){
			$("#" + "txsc_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line3"], function(k, v){
			$("#" + "txsc_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(txsc_playMethod == 5){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(4,redBallArray);
		LotteryStorage["txsc"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
		LotteryStorage["txsc"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
		LotteryStorage["txsc"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
		LotteryStorage["txsc"]["line4"].push(array[3] > 9 ? array[3]+"" : "0"+array[3]);
		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line2"], function(k, v){
			$("#" + "txsc_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line3"], function(k, v){
			$("#" + "txsc_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line4"], function(k, v){
			$("#" + "txsc_line4" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(txsc_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(5,redBallArray);
		LotteryStorage["txsc"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
		LotteryStorage["txsc"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
		LotteryStorage["txsc"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
		LotteryStorage["txsc"]["line4"].push(array[3] > 9 ? array[3]+"" : "0"+array[3]);
		LotteryStorage["txsc"]["line5"].push(array[4] > 9 ? array[4]+"" : "0"+array[4]);
		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line2"], function(k, v){
			$("#" + "txsc_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line3"], function(k, v){
			$("#" + "txsc_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line4"], function(k, v){
			$("#" + "txsc_line4" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["txsc"]["line5"], function(k, v){
			$("#" + "txsc_line5" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(txsc_playType == 5){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(1,11);
		LotteryStorage["txsc"]["line"+line].push(number > 9 ? number+"" : "0"+number);

		$.each(LotteryStorage["txsc"]["line"+line], function(k, v){
			$("#" + "txsc_line"+line + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(txsc_playType == 6 || txsc_playType == 7 || txsc_playType == 8 || txsc_playType == 10){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["txsc"]["line1"].push(number > 9 ? number+"" : "0"+number);

		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(txsc_playType == 9){
		if(txsc_playMethod == 20){
			var contentArr = ["3","4","18","19"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["txsc"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(txsc_playMethod == 21){
			var contentArr = ["5","6","16","17"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["txsc"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(txsc_playMethod == 22){
			var contentArr = ["7","8","14","15"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["txsc"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(txsc_playMethod == 23){
			var contentArr = ["9","10","12","13"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["txsc"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(txsc_playMethod == 24){
			var contentArr = ["11"];
			var number = mathUtil.getRandomNum(0,1);
			LotteryStorage["txsc"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(txsc_playMethod == 25 ){
			var contentArr = ["0","3"];
			var number = mathUtil.getRandomNum(0,2);
			LotteryStorage["txsc"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(txsc_playMethod == 26){
			var contentArr = ["1","2"];
			var number = mathUtil.getRandomNum(0,2);
			LotteryStorage["txsc"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}
	}else if(txsc_playType == 11){
		if(txsc_playMethod == 32){
			var contentArr = ["0","1","2","3"];
			var line_number = mathUtil.getRandomNum(1,6);
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["txsc"]["line" + line_number].push(contentArr[number]);
			
			$.each(LotteryStorage["txsc"]["line" + line_number], function(k, v){
				$("#" + "txsc_line"+ line_number + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(txsc_playMethod == 33){
			var contentArr = ["0","1","2","3"];
			var line_number = mathUtil.getRandomNum(1,6);
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["txsc"]["line" + line_number].push(contentArr[number]);
			
			$.each(LotteryStorage["txsc"]["line" + line_number], function(k, v){
				$("#" + "txsc_line"+ line_number + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(txsc_playMethod == 34){
			var contentArr = ["0","1","2","3"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["txsc"]["line1"].push(contentArr[number]);
			
			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}
	}else if(txsc_playType == 12){
		if(txsc_playMethod == 35){//冠亚和  3~19
			var number = mathUtil.getRandomNum(3,20);
			LotteryStorage["txsc"]["line1"].push(number);
	
			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
				$("#" + "txsc_line1" + parseInt(Number(v)-3)).toggleClass("pks_new_redBalls_active");
			});
		}
	}
	txsc_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function txsc_checkOutRandom(playMethod){
	var obj = new Object();
	if(txsc_playType == 0){
		var number = mathUtil.getRandomNum(1,11);
		obj.nums = number < 10 ? "0"+number : number;
		obj.notes = 1;
	}else if(txsc_playMethod == 1){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(txsc_playMethod == 3){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(txsc_playType == 5){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(1,11);
		number = number < 10 ? "0"+number : number;
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
	}else if(txsc_playType == 6){
		var number = mathUtil.getRandomNum(0,2);
		obj.nums = number == 0 ? "大" : "小";
		obj.notes = 1;
	}else if(txsc_playType == 7){
		var number = mathUtil.getRandomNum(0,2);
		obj.nums = number == 0 ? "单" : "双";
		obj.notes = 1;
	}else if(txsc_playType == 8 || txsc_playType == 10){
		var number = mathUtil.getRandomNum(0,2);
		obj.nums = number == 0 ? "龙" : "虎";
		obj.notes = 1;
	}else if(txsc_playType == 9){
		if(txsc_playMethod == 20){
			var contentArr = ["3","4","18","19"];
			var number = mathUtil.getRandomNum(0,4);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(txsc_playMethod == 21){
			var contentArr = ["5","6","16","17"];
			var number = mathUtil.getRandomNum(0,4);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(txsc_playMethod == 22){
			var contentArr = ["7","8","14","15"];
			var number = mathUtil.getRandomNum(0,4);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(txsc_playMethod == 23){
			var contentArr = ["9","10","12","13"];
			var number = mathUtil.getRandomNum(0,4);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(txsc_playMethod == 24){
			var contentArr = ["11"];
			var number = mathUtil.getRandomNum(0,1);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(txsc_playMethod == 25){
			var number = mathUtil.getRandomNum(0,2);
			obj.nums = number == 0 ? "大" : "双";
			obj.notes = 1;
		}else if(txsc_playMethod == 26){
			var number = mathUtil.getRandomNum(0,2);
			obj.nums = number == 0 ? "小" : "单";
			obj.notes = 1;
		}
	}else if(txsc_playMethod == 5){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(4,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(txsc_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(5,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(txsc_playMethod == 32){
		var line_number = mathUtil.getRandomNum(0,5);
		var number = mathUtil.getRandomNum(0,4);
		var contentArr =["大","小","单","双"];
		if(line_number==0){
			obj.nums = contentArr[number] +"|*|*|*|*";
		}else if(line_number==1){
			obj.nums = "*|" + contentArr[number] +"|*|*|*";
		}else if(line_number==2){
			obj.nums = "*|*|" + contentArr[number] +"|*|*";
		}else if(line_number==3){
			obj.nums = "*|*|*|" + contentArr[number] +"|*";
		}else if(line_number==4){
			obj.nums = "*|*|*|*|" + contentArr[number];
		}
		obj.notes = 1;
	}else if(txsc_playMethod == 33){
		var line_number = mathUtil.getRandomNum(0,5);
		var number = mathUtil.getRandomNum(0,4);
		var contentArr =["大","小","单","双"];
		if(line_number==0){
			obj.nums = contentArr[number] +"|*|*|*|*";
		}else if(line_number==1){
			obj.nums = "*|" + contentArr[number] +"|*|*|*";
		}else if(line_number==2){
			obj.nums = "*|*|" + contentArr[number] +"|*|*";
		}else if(line_number==3){
			obj.nums = "*|*|*|" + contentArr[number] +"|*";
		}else if(line_number==4){
			obj.nums = "*|*|*|*|" + contentArr[number];
		}
		obj.notes = 1;
	}else if(txsc_playMethod == 34){
		var number = mathUtil.getRandomNum(0,4);
		var contentArr =["大","小","单","双"];
		obj.nums = contentArr[number];
		obj.notes = 1;
	}else if(txsc_playMethod == 35){
		var number = mathUtil.getRandomNum(3,20);
		obj.nums = number;
		obj.notes = 1;
	}
	obj.sntuo = txsc_sntuo;
	obj.multiple = 1;
	obj.rebates = txsc_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('txsc',txsc_playMethod,obj);  //机选奖金计算
	obj.award = $('#txsc_minAward').html();     //奖金
	obj.maxAward = $('#txsc_maxAward').html();  //多级奖金
	return obj;
}


/**
 * [txsc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function txsc_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#txsc_queding").bind('click', function(event) {
		txsc_rebate = $("#txsc_fandian option:last").val();
		localStorageUtils.setParam("max_rebate", txsc_rebate);
		if(parseInt($('#txsc_zhushu').html()) <= 0 || Number($("#txsc_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		txsc_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#txsc_modeId').val()) == 8){
			if (Number($('#txsc_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('txsc',txsc_playMethod);

		submitParams.lotteryType = "txsc";
		var playType = LotteryInfo.getPlayName("txsc",txsc_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("txsc",txsc_playMethod);
		submitParams.playTypeIndex = txsc_playType;
		submitParams.playMethodIndex = txsc_playMethod;
		var selectedBalls = [];

		if (txsc_playType == 0 || txsc_playType == 6 || txsc_playType == 7 || txsc_playType == 8 || txsc_playType == 9 || txsc_playType == 10) {
			$("#txsc_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(txsc_playType == 1 || txsc_playType == 2|| txsc_playType == 3|| txsc_playType == 4){
			if(txsc_playMethod == 1 || txsc_playMethod == 3|| txsc_playMethod == 5|| txsc_playMethod == 7){
				$("#txsc_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else{//单式
				//去错误号
				txscValidateData("submit");
				var arr = $("#txsc_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(txsc_playMethod == 2){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(txsc_playMethod == 4){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}else if(txsc_playMethod == 6){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
						}else if(txsc_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}
		}else if(txsc_playType == 5) {
			$("#txsc_ballView div.ballView").each(function(){
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
		}else if(txsc_playType == 11) {
			$("#txsc_ballView div.ballView").each(function(){
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
		}else if(txsc_playType == 12){
			$("#txsc_ballView div.pks_new_ballView").each(function(){
				$(this).find("span.pks_new_redBalls_active").each(function(){
					selectedBalls.push($(this).text().split(" ")[0]);//因为带有奖金 所以要截取
				});
			});
			submitParams.nums = selectedBalls.join(",");
			
		}else{
			//去错误号
			txscValidateData("submit");
			var arr = $("#txsc_single").val().split(",");
			var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#txsc_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#txsc_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#txsc_fandian").val());
		submitParams.notes = $('#txsc_zhushu').html();
		submitParams.sntuo = txsc_sntuo;
		submitParams.multiple = $('#txsc_beiNum').val();  //requirement
		submitParams.rebates = $('#txsc_fandian').val();  //requirement
		submitParams.playMode = $('#txsc_modeId').val();  //requirement
		submitParams.money = $('#txsc_money').html();  //requirement
		submitParams.award = $('#txsc_minAward').html();  //奖金
		submitParams.maxAward = $('#txsc_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#txsc_ballView").empty();
		txsc_qingkongAll();
	});
}


/**
 * [txscValidateData 单式数据验证]
 */
function txscValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#txsc_single").val();
	var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
	var result,
		content = {};
	if(txsc_playMethod == 2){
		content.str = str;
		content.weishu = 5;
		content.zhiXuan = true;
		content.maxNum = 10;
		result = handleSingleStr_deleteErr(content,type);
	}else if(txsc_playMethod == 4){
		content.str = str;
		content.weishu = 8;
		content.zhiXuan = true;
		content.maxNum = 10;
		result = handleSingleStr_deleteErr(content,type);
	}else if(txsc_playMethod == 6){
		content.str = str;
		content.weishu = 11;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
	}else if(txsc_playMethod == 8){
		content.str = str;
		content.weishu = 14;
		content.zhiXuan = true;
		content.maxNum = 14;
		result = handleSingleStr_deleteErr(content,type);
	}

	$('#txsc_delRepeat').off('click');
	$('#txsc_delRepeat').on('click',function () {
		content.str = $('#txsc_single').val() ? $('#txsc_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		txscShowFooter(true,notes);
		$("#txsc_single").val(array.join(","));
	});

	$("#txsc_single").val(result.num.join(","));
	var notes = result.length;
	txscShowFooter(true,notes);
	return notes;
}

function txscShowFooter(isValid,notes){
	$('#txsc_zhushu').text(notes);
	if($("#txsc_modeId").val() == "8"){
		$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.002));
	}else if ($("#txsc_modeId").val() == "2"){
		$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.2));
	}else if ($("#txsc_modeId").val() == "1"){
		$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.02));
	}else{
		$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	txsc_initFooterButton();
	calcAwardWin('txsc',txsc_playMethod);  //计算奖金和盈利
}




//
////定义PK拾玩法标识
//var txsc_playType = 0;
//var txsc_playMethod = 0;
//var txsc_sntuo = 0;
//var txsc_rebate;
//var txscScroll;
//
////进入这个页面时调用
//function txscPageLoadedPanel() {
//	catchErrorFun("txsc_init();");
//}
//
////离开这个页面时调用
//function txscPageUnloadedPanel(){
//	$("#txscPage_back").off('click');
//	$("#txsc_queding").off('click');
//	$("#txsc_ballView").empty();
//	$("#txscSelect").empty();
//	var $select = $('<select class="cs-select cs-skin-overlay" id="txscPlaySelect"></select>');
//	$("#txscSelect").append($select);
//}
//
////入口函数
//function txsc_init(){
//	$("#txsc_title").html(LotteryInfo.getLotteryNameByTag("txsc"));
//	for(var i = 0; i< LotteryInfo.getPlayLength("txsc");i++){
//		if(i == 8 || i == 9 ||i == 3 || i == 4 || i == 10){  //龙虎玩法隐藏   猜前四名、猜前五名、冠亚车和、龙虎斗
//			continue;
//		}
//		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("txsc",i)+'"></optgroup>');
//		for(var j = 0; j < LotteryInfo.getMethodLength("txsc");j++){
//			if(LotteryInfo.getMethodTypeId("txsc",j) == LotteryInfo.getPlayTypeId("txsc",i)){
//				var name = LotteryInfo.getMethodName("txsc",j);
//				if(i == txsc_playType && j == txsc_playMethod){
//					$play.append('<option value="txsc'+LotteryInfo.getMethodIndex("txsc",j)+'" selected="selected">' + name +'</option>');
//				}else{
//					$play.append('<option value="txsc'+LotteryInfo.getMethodIndex("txsc",j)+'">' + name +'</option>');
//				}
//			}
//		}
//		$("#txscPlaySelect").append($play);
//	}
//
//	[].slice.call( document.getElementById("txscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
//		new SelectFx(el, {
//			stickyPlaceholder: true,
//			onChange:txscChangeItem
//		});
//	});
//
//	//添加滑动条
//	new IScroll('.cs-options',{
//		click:true,
//		scrollbars: true,
//		mouseWheel: true,
//		interactiveScrollbars: true,
//		shrinkScrollbars: 'scale',
//		fadeScrollbars: true
//	});
//
//	GetLotteryInfo("txsc",function (){
//		txscChangeItem("txsc"+txsc_playMethod);
//	});
//
//	//添加滑动条
//	if(!txscScroll){
//		txscScroll = new IScroll('#txscContent',{
//			click:true,
//			scrollbars: true,
//			mouseWheel: true,
//			interactiveScrollbars: true,
//			shrinkScrollbars: 'scale',
//			fadeScrollbars: true
//		});
//	}
//
//	//获取期号
//	getQihao("txsc",LotteryInfo.getLotteryIdByTag("txsc"));
//
//	//获取上一期开奖
//	queryLastPrize("txsc");
//
//	//获取单挑和单期最高奖金
//	getLotteryMaxBonus('txsc');
//
//	//机选选号
//	$("#txsc_random").on('click', function(event) {
//		txsc_randomOne();
//	});
//
//	//返回
//	$("#txscPage_back").on('click', function(event) {
//		// txsc_playType = 0;
//		// txsc_playMethod = 0;
//		localStorageUtils.removeParam("playMode");
//		localStorageUtils.removeParam("playBeiNum");
//		localStorageUtils.removeParam("playFanDian");
//		$("#txsc_ballView").empty();
//		txsc_qingkongAll();
//		setPanelBackPage_Fun('lotteryHallPage');
//	});
//
//	qingKong("txsc");//清空
//	txsc_submitData();
//}
//
//function txscResetPlayType(){
//	txsc_playType = 0;
//	txsc_playMethod = 0;
//}
//
//function txscChangeItem(val) {
//	txsc_qingkongAll();
//	var temp = val.substring("txsc".length,val.length);
//	if(val == 'txsc0'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 0;
//		txsc_playMethod = 0;
//
//		createOneLineLayout("txsc","请至少选择1个",1,10,true,function(){
//			txsc_calcNotes();
//		});
//	}else if(val == 'txsc1'){
//		$("#txsc_random").show();
//		var tip1 = "冠军：可选1-10个";
//		var tip2 = "亚军：可选1-10个";
//		var tips = [tip1,tip2];
//		txsc_sntuo = 0;
//		txsc_playType = 1;
//		txsc_playMethod = 1;
//		createTwoWinner("txsc",tips,1,10,true,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc2'){
//		$("#txsc_random").hide();
//		txsc_sntuo = 3;
//		txsc_playType = 1;
//		txsc_playMethod = 2;
//		txsc_qingkongAll();
//		var tips = "<p>格式说明<br/>冠亚军单式01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
//		createSingleLayout("txsc",tips);
//	}else if(val == 'txsc3'){
//		$("#txsc_random").show();
//		var tip1 = "冠军：可选1-10个";
//		var tip2 = "亚军：可选1-10个";
//		var tip3 = "季军：可选1-10个";
//		var tips = [tip1,tip2,tip3];
//		txsc_sntuo = 0;
//		txsc_playType = 2;
//		txsc_playMethod = 3;
//		createThreeWinner("txsc",tips,1,10,true,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	} else if(val == 'txsc4'){
//		$("#txsc_random").hide();
//		txsc_sntuo = 3;
//		txsc_playType = 2;
//		txsc_playMethod = 4;
//		txsc_qingkongAll();
//		var tips = "<p>格式说明<br/>猜前三名单式01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
//		createSingleLayout("txsc",tips);
//	}else if(val == 'txsc5'){
//		$("#txsc_random").show();
//		var tip1 = "冠军：可选1-10个";
//		var tip2 = "亚军：可选1-10个";
//		var tip3 = "季军：可选1-10个";
//		var tip4 = "第四名：可选1-10个";
//		var tips = [tip1,tip2,tip3,tip4];
//		txsc_sntuo = 0;
//		txsc_playType = 3;
//		txsc_playMethod = 5;
//		createFourWinner("txsc",tips,1,10,true,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc6'){
//		$("#txsc_random").hide();
//		$("#txsc_qingkong").hide();
//		txsc_sntuo = 3;
//		txsc_playType = 3;
//		txsc_playMethod = 6;
//		txsc_qingkongAll();
//		var tips = "<p>格式说明<br/>猜前四名单式01 02 03 04或01020304<br/>1)每注必须是4个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
//		createSingleLayout("txsc",tips);
//	}else if(val == 'txsc7'){
//		$("#txsc_random").show();
//		var tip1 = "冠军：可选1-10个";
//		var tip2 = "亚军：可选1-10个";
//		var tip3 = "季军：可选1-10个";
//		var tip4 = "第四名：可选1-10个";
//		var tip5 = "第五名：可选1-10个";
//		var tips = [tip1,tip2,tip3,tip4,tip5];
//		txsc_sntuo = 0;
//		txsc_playType = 4;
//		txsc_playMethod = 7;
//		createFiveWinner("txsc",tips,1,10,true,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc8'){
//		$("#txsc_random").hide();
//		$("#txsc_qingkong").hide();
//		txsc_sntuo = 3;
//		txsc_playType = 4;
//		txsc_playMethod = 8;
//		txsc_qingkongAll();
//		var tips = "<p>格式说明<br/>猜前四名单式01 02 03 04 05或0102030405<br/>1)每注必须是4个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
//		createSingleLayout("txsc",tips);
//	}else if(val == 'txsc9'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 5;
//		txsc_playMethod = 9;
//		var tips = ["冠军","亚军","季军","第四名","第五名"];
//		createFiveWinner("txsc",tips,1,10,true,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc10'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 5;
//		txsc_playMethod = 10;
//		var tips = ["第六名","第七名","第八名","第九名","第十名"];
//		createFiveWinner("txsc",tips,1,10,true,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc11'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 6;
//		txsc_playMethod = 11;
//		var num = ["大","小"];
//		createNonNumLayout("txsc",txsc_playMethod,num,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc12'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 6;
//		txsc_playMethod = 12;
//		var num = ["大","小"];
//		createNonNumLayout("txsc",txsc_playMethod,num,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc13'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 6;
//		txsc_playMethod = 13;
//		var num = ["大","小"];
//		createNonNumLayout("txsc",txsc_playMethod,num,function(){
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc14'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 7;
//		txsc_playMethod = 14;
//		var num = ["单", "双"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc15'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 7;
//		txsc_playMethod = 15;
//		var num = ["单", "双"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc16'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 7;
//		txsc_playMethod = 16;
//		var num = ["单", "双"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc17'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 8;
//		txsc_playMethod = 17;
//		var num = ["龙", "虎"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc18'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 8;
//		txsc_playMethod = 18;
//		var num = ["龙", "虎"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc19'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 8;
//		txsc_playMethod = 19;
//		var num = ["龙", "虎"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc20'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 9;
//		txsc_playMethod = 20;
//		var num = ["3", "4", "18", "19"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc21'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 9;
//		txsc_playMethod = 21;
//		var num = ["5", "6", "16", "17"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc22'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 9;
//		txsc_playMethod = 22;
//		var num = ["7", "8", "14", "15"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc23'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 9;
//		txsc_playMethod = 23;
//		var num = ["9", "10", "12", "13"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc24'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 9;
//		txsc_playMethod = 24;
//		var num = ["11"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc25'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 9;
//		txsc_playMethod = 25;
//		var num = ["大", "双"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc26'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 9;
//		txsc_playMethod = 26;
//		var num = ["小", "单"];
//		createNonNumLayout("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc27'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 10;
//		txsc_playMethod = 27;
//		var num = ["龙", "虎"];
//		createNonNumLayout_txsc_lh("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc28'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 10;
//		txsc_playMethod = 28;
//		var num = ["龙", "虎"];
//		createNonNumLayout_txsc_lh("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc29'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 10;
//		txsc_playMethod = 29;
//		var num = ["龙", "虎"];
//		createNonNumLayout_txsc_lh("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc30'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 10;
//		txsc_playMethod = 30;
//		var num = ["龙", "虎"];
//		createNonNumLayout_txsc_lh("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}else if(val == 'txsc31'){
//		$("#txsc_random").show();
//		txsc_sntuo = 0;
//		txsc_playType = 10;
//		txsc_playMethod = 31;
//		var num = ["龙", "虎"];
//		createNonNumLayout_txsc_lh("txsc", txsc_playMethod, num, function () {
//			txsc_calcNotes();
//		});
//		txsc_qingkongAll();
//	}
//	
//	
//	if(txscScroll){
//		txscScroll.refresh();
//		txscScroll.scrollTo(0,0,1);
//	}
//
//	initFooterData("txsc",temp);
//	hideRandomWhenLi("txsc",txsc_sntuo,txsc_playMethod);
//	txsc_calcNotes();
//}
//
///**
// * [txsc_initFooterButton 初始化底部Button显示隐藏]
// * @return {[type]} [description]
// */
//function txsc_initFooterButton(){
//	if(txsc_playMethod == 1 || txsc_playMethod == 0){
//		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0) {
//			$("#txsc_qingkong").css("opacity",1.0);
//		}else{
//			$("#txsc_qingkong").css("opacity",0.4);
//		}
//	}else if(txsc_playMethod == 3){
//		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
//			|| LotteryStorage["txsc"]["line3"].length > 0) {
//			$("#txsc_qingkong").css("opacity",1.0);
//		}else{
//			$("#txsc_qingkong").css("opacity",0.4);
//		}
//	}else if(txsc_playMethod == 5){
//		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
//			|| LotteryStorage["txsc"]["line3"].length > 0 || LotteryStorage["txsc"]["line4"].length > 0) {
//			$("#txsc_qingkong").css("opacity",1.0);
//		}else{
//			$("#txsc_qingkong").css("opacity",0.4);
//		}
//	}else if(txsc_playMethod == 7){
//		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
//			|| LotteryStorage["txsc"]["line3"].length > 0 || LotteryStorage["txsc"]["line4"].length > 0 || LotteryStorage["txsc"]["line5"].length > 0) {
//			$("#txsc_qingkong").css("opacity",1.0);
//		}else{
//			$("#txsc_qingkong").css("opacity",0.4);
//		}
//	}else if(txsc_playType == 5){
//		if (LotteryStorage["txsc"]["line1"].length > 0 || LotteryStorage["txsc"]["line2"].length > 0
//			|| LotteryStorage["txsc"]["line3"].length > 0 || LotteryStorage["txsc"]["line4"].length > 0 || LotteryStorage["txsc"]["line5"].length > 0) {
//			$("#txsc_qingkong").css("opacity",1.0);
//		}else{
//			$("#txsc_qingkong").css("opacity",0.4);
//		}
//	}else if(txsc_playType == 6 || txsc_playType == 7 || txsc_playType == 8 || txsc_playType == 9|| txsc_playType == 10){
//		if(LotteryStorage["txsc"]["line1"].length > 0){
//			$("#txsc_qingkong").css("opacity",1.0);
//		}else{
//			$("#txsc_qingkong").css("opacity",0.4);
//		}
//	}else{
//		$("#txsc_qingkong").css("opacity",0);
//	}
//
//	if($("#txsc_qingkong").css("opacity") == "0"){
//		$("#txsc_qingkong").css("display","none");
//	}else{
//		$("#txsc_qingkong").css("display","block");
//	}
//
//	if($('#txsc_zhushu').html() > 0){
//		$("#txsc_queding").css("opacity",1.0);
//	}else{
//		$("#txsc_queding").css("opacity",0.4);
//	}
//}
//
///**
// * @Author:      admin
// * @DateTime:    2014-12-13 14:40:19
// * @Description: 清空所有记录
// */
//function txsc_qingkongAll(){
//	$("#txsc_ballView span").removeClass('redBalls_active');
//	LotteryStorage["txsc"]["line1"] = [];
//	LotteryStorage["txsc"]["line2"] = [];
//	LotteryStorage["txsc"]["line3"] = [];
//	LotteryStorage["txsc"]["line4"] = [];
//	LotteryStorage["txsc"]["line5"] = [];
//	localStorageUtils.removeParam("txsc_line1");
//	localStorageUtils.removeParam("txsc_line2");
//	localStorageUtils.removeParam("txsc_line3");
//	localStorageUtils.removeParam("txsc_line4");
//	localStorageUtils.removeParam("txsc_line5");
//
//	$('#txsc_zhushu').text(0);
//	$('#txsc_money').text(0);
//	clearAwardWin("txsc");
//	txsc_initFooterButton();
//}
//
///**
// * [txsc_calcNotes 计算注数]
// * @return {[type]} [description]
// */
//function txsc_calcNotes(){
//	$('#txsc_modeId').blur();
//	$('#txsc_fandian').blur();
//	
//	var notes = 0;
//	if(txsc_playMethod == 0 || txsc_playType == 6 || txsc_playType == 7 || txsc_playType == 8 || txsc_playType == 9|| txsc_playType == 10){
//		notes = LotteryStorage["txsc"]["line1"].length;
//	}else if(txsc_playMethod == 1 ) {
//		for(var i = 0;i < LotteryStorage["txsc"]["line1"].length; i++){
//			var flag = false;
//			for(var j = 0;j < LotteryStorage["txsc"]["line2"].length; j++){
//				if(LotteryStorage["txsc"]["line1"][i] == LotteryStorage["txsc"]["line2"][j]){
//					flag = true;
//				}
//			}
//			if(flag){
//				notes += (LotteryStorage["txsc"]["line2"].length - 1);
//			}else{
//				notes += LotteryStorage["txsc"]["line2"].length;
//			}
//		}
//	}else if(txsc_playType == 5){
//		notes = LotteryStorage["txsc"]["line1"].length + LotteryStorage["txsc"]["line2"].length + LotteryStorage["txsc"]["line3"].length
//			+ LotteryStorage["txsc"]["line4"].length + LotteryStorage["txsc"]["line5"].length;
//	}else if(txsc_playMethod == 3){
//		for(var i = 0;i < LotteryStorage["txsc"]["line1"].length; i++){
//			for(var j = 0;j < LotteryStorage["txsc"]["line2"].length; j++){
//				for(var k = 0;k < LotteryStorage["txsc"]["line3"].length; k++){
//					if(LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line2"][j] &&
//						LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line3"][k]
//						&& LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line3"][k]){
//						notes++;
//					}
//				}
//			}
//		}
//	}else if(txsc_playMethod == 5){
//		for(var i = 0;i < LotteryStorage["txsc"]["line1"].length; i++){
//			for(var j = 0;j < LotteryStorage["txsc"]["line2"].length; j++){
//				for(var k = 0;k < LotteryStorage["txsc"]["line3"].length; k++){
//					for(var m = 0;m < LotteryStorage["txsc"]["line4"].length; m++){
//						if(LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line2"][j] &&
//						LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line3"][k]&&
//						LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line4"][m]&&
//						LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line3"][k]&&
//						LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line4"][m]&&
//						LotteryStorage["txsc"]["line3"][k] != LotteryStorage["txsc"]["line4"][m]){
//						notes++;
//						}
//					}
//				}
//			}
//		}
//	}else if(txsc_playMethod == 7){
//		for(var i = 0;i < LotteryStorage["txsc"]["line1"].length; i++){
//			for(var j = 0;j < LotteryStorage["txsc"]["line2"].length; j++){
//				for(var k = 0;k < LotteryStorage["txsc"]["line3"].length; k++){
//					for(var m = 0;m < LotteryStorage["txsc"]["line4"].length; m++){
//						for(var n = 0;n < LotteryStorage["txsc"]["line5"].length; n++){
//							if(LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line2"][j] &&
//							LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line3"][k]&&
//							LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line4"][m]&&
//							LotteryStorage["txsc"]["line1"][i] != LotteryStorage["txsc"]["line5"][n]&&
//							LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line3"][k]&&
//							LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line4"][m]&&
//							LotteryStorage["txsc"]["line2"][j] != LotteryStorage["txsc"]["line5"][n]&&
//							LotteryStorage["txsc"]["line3"][k] != LotteryStorage["txsc"]["line4"][m]&&
//							LotteryStorage["txsc"]["line3"][k] != LotteryStorage["txsc"]["line5"][n]&&
//							LotteryStorage["txsc"]["line4"][m] != LotteryStorage["txsc"]["line5"][n]){
//							notes++;
//							}
//						}
//					}
//				}
//			}
//		}
//	}else{//单式
//		notes = txscValidateData('onblur');
//	}
//
//	hideRandomWhenLi("txsc",txsc_sntuo,txsc_playMethod);
//
//	//验证是否为空
//	if( $("#txsc_beiNum").val() =="" || parseInt($("#txsc_beiNum").val()) == 0){
//		$("#txsc_beiNum").val(1);
//	}
//
//	//验证慢彩最大倍数为9999
//	if($("#txsc_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
//		$("#txsc_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
//	}
//	if(notes > 0) {
//		$('#txsc_zhushu').text(notes);
//		if($("#txsc_modeId").val() == "8"){
//			$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.002));
//		}else if ($("#txsc_modeId").val() == "2"){
//			$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.2));
//		}else if ($("#txsc_modeId").val() == "1"){
//			$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.02));
//		}else{
//			$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),2));
//		}
//
//	} else {
//		$('#txsc_zhushu').text(0);
//		$('#txsc_money').text(0);
//	}
//	txsc_initFooterButton();
//	// 计算奖金盈利
//	calcAwardWin('txsc',txsc_playMethod);
//}
//
///**
// * [txsc_randomOne 随机一注]
// * @return {[type]} [description]
// */
//function txsc_randomOne(){
//	txsc_qingkongAll();
//	if(txsc_playType == 0){
//		var number = mathUtil.getRandomNum(1,11);
//		LotteryStorage["txsc"]["line1"].push(number > 9 ? number+"" : "0"+number);
//
//		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(txsc_playMethod == 1){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(2,redBallArray);
//		LotteryStorage["txsc"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
//		LotteryStorage["txsc"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
//		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line2"], function(k, v){
//			$("#" + "txsc_line2" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(txsc_playMethod == 3){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(3,redBallArray);
//		LotteryStorage["txsc"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
//		LotteryStorage["txsc"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
//		LotteryStorage["txsc"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
//		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line2"], function(k, v){
//			$("#" + "txsc_line2" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line3"], function(k, v){
//			$("#" + "txsc_line3" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(txsc_playMethod == 5){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(4,redBallArray);
//		LotteryStorage["txsc"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
//		LotteryStorage["txsc"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
//		LotteryStorage["txsc"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
//		LotteryStorage["txsc"]["line4"].push(array[3] > 9 ? array[3]+"" : "0"+array[3]);
//		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line2"], function(k, v){
//			$("#" + "txsc_line2" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line3"], function(k, v){
//			$("#" + "txsc_line3" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line4"], function(k, v){
//			$("#" + "txsc_line4" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(txsc_playMethod == 7){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(5,redBallArray);
//		LotteryStorage["txsc"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
//		LotteryStorage["txsc"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
//		LotteryStorage["txsc"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
//		LotteryStorage["txsc"]["line4"].push(array[3] > 9 ? array[3]+"" : "0"+array[3]);
//		LotteryStorage["txsc"]["line5"].push(array[4] > 9 ? array[4]+"" : "0"+array[4]);
//		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line2"], function(k, v){
//			$("#" + "txsc_line2" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line3"], function(k, v){
//			$("#" + "txsc_line3" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line4"], function(k, v){
//			$("#" + "txsc_line4" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["txsc"]["line5"], function(k, v){
//			$("#" + "txsc_line5" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(txsc_playType == 5){
//		var line = mathUtil.getRandomNum(1,6);
//		var number = mathUtil.getRandomNum(1,11);
//		LotteryStorage["txsc"]["line"+line].push(number > 9 ? number+"" : "0"+number);
//
//		$.each(LotteryStorage["txsc"]["line"+line], function(k, v){
//			$("#" + "txsc_line"+line + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(txsc_playType == 6 || txsc_playType == 7 || txsc_playType == 8 || txsc_playType == 10){
//		var number = mathUtil.getRandomNum(0,2);
//		LotteryStorage["txsc"]["line1"].push(number > 9 ? number+"" : "0"+number);
//
//		$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//			$("#" + "txsc_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(txsc_playType == 9){
//		if(txsc_playMethod == 20){
//			var contentArr = ["3","4","18","19"];
//			var number = mathUtil.getRandomNum(0,4);
//			LotteryStorage["txsc"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(txsc_playMethod == 21){
//			var contentArr = ["5","6","16","17"];
//			var number = mathUtil.getRandomNum(0,4);
//			LotteryStorage["txsc"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(txsc_playMethod == 22){
//			var contentArr = ["7","8","14","15"];
//			var number = mathUtil.getRandomNum(0,4);
//			LotteryStorage["txsc"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(txsc_playMethod == 23){
//			var contentArr = ["9","10","12","13"];
//			var number = mathUtil.getRandomNum(0,4);
//			LotteryStorage["txsc"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(txsc_playMethod == 24){
//			var contentArr = ["11"];
//			var number = mathUtil.getRandomNum(0,1);
//			LotteryStorage["txsc"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(txsc_playMethod == 25 ){
//			var contentArr = ["0","3"];
//			var number = mathUtil.getRandomNum(0,2);
//			LotteryStorage["txsc"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(txsc_playMethod == 26){
//			var contentArr = ["1","2"];
//			var number = mathUtil.getRandomNum(0,2);
//			LotteryStorage["txsc"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["txsc"]["line1"], function(k, v){
//				$("#" + "txsc_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}
//	}
//	txsc_calcNotes();
//}
//
///**
// * 出票机选
// * @param playMethod
// */
//function txsc_checkOutRandom(playMethod){
//	var obj = new Object();
//	if(txsc_playType == 0){
//		var number = mathUtil.getRandomNum(1,11);
//		obj.nums = number < 10 ? "0"+number : number;
//		obj.notes = 1;
//	}else if(txsc_playMethod == 1){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(2,redBallArray);
//		$.each(array,function(index){
//			if(array[index] < 10){
//				array[index] = "0"+array[index];
//			}
//		});
//		obj.nums = array.join("|");
//		obj.notes = 1;
//	}else if(txsc_playMethod == 3){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(3,redBallArray);
//		$.each(array,function(index){
//			if(array[index] < 10){
//				array[index] = "0"+array[index];
//			}
//		});
//		obj.nums = array.join("|");
//		obj.notes = 1;
//	}else if(txsc_playType == 5){
//		var line = mathUtil.getRandomNum(1,6);
//		var number = mathUtil.getRandomNum(1,11);
//		number = number < 10 ? "0"+number : number;
//		if(line == 1){
//			obj.nums = number + "|*|*|*|*";
//		}else if(line == 2){
//			obj.nums = "*|"+ number +"|*|*|*";
//		}else if(line == 3){
//			obj.nums = "*|*|"+number +"|*|*";
//		}else if(line == 4){
//			obj.nums = "*|*|*|"+ number +"|*";
//		}else if(line == 5){
//			obj.nums = "*|*|*|*|" + number;
//		}
//		obj.notes = 1;
//	}else if(txsc_playType == 6){
//		var number = mathUtil.getRandomNum(0,2);
//		obj.nums = number == 0 ? "大" : "小";
//		obj.notes = 1;
//	}else if(txsc_playType == 7){
//		var number = mathUtil.getRandomNum(0,2);
//		obj.nums = number == 0 ? "单" : "双";
//		obj.notes = 1;
//	}else if(txsc_playType == 8 || txsc_playType == 10){
//		var number = mathUtil.getRandomNum(0,2);
//		obj.nums = number == 0 ? "龙" : "虎";
//		obj.notes = 1;
//	}else if(txsc_playType == 9){
//		if(txsc_playMethod == 20){
//			var contentArr = ["3","4","18","19"];
//			var number = mathUtil.getRandomNum(0,4);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(txsc_playMethod == 21){
//			var contentArr = ["5","6","16","17"];
//			var number = mathUtil.getRandomNum(0,4);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(txsc_playMethod == 22){
//			var contentArr = ["7","8","14","15"];
//			var number = mathUtil.getRandomNum(0,4);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(txsc_playMethod == 23){
//			var contentArr = ["9","10","12","13"];
//			var number = mathUtil.getRandomNum(0,4);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(txsc_playMethod == 24){
//			var contentArr = ["11"];
//			var number = mathUtil.getRandomNum(0,1);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(txsc_playMethod == 25){
//			var number = mathUtil.getRandomNum(0,2);
//			obj.nums = number == 0 ? "大" : "双";
//			obj.notes = 1;
//		}else if(txsc_playMethod == 26){
//			var number = mathUtil.getRandomNum(0,2);
//			obj.nums = number == 0 ? "小" : "单";
//			obj.notes = 1;
//		}
//	}else if(txsc_playMethod == 5){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(4,redBallArray);
//		$.each(array,function(index){
//			if(array[index] < 10){
//				array[index] = "0"+array[index];
//			}
//		});
//		obj.nums = array.join("|");
//		obj.notes = 1;
//	}else if(txsc_playMethod == 7){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(5,redBallArray);
//		$.each(array,function(index){
//			if(array[index] < 10){
//				array[index] = "0"+array[index];
//			}
//		});
//		obj.nums = array.join("|");
//		obj.notes = 1;
//	}
//	obj.sntuo = txsc_sntuo;
//	obj.multiple = 1;
//	obj.rebates = txsc_rebate;
//	obj.playMode = "4";
//	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
//	calcAwardWin('txsc',txsc_playMethod,obj);  //机选奖金计算
//	obj.award = $('#txsc_minAward').html();     //奖金
//	obj.maxAward = $('#txsc_maxAward').html();  //多级奖金
//	return obj;
//}
//
//
///**
// * [txsc_submitData 确认提交数据]
// * @return {[type]} [description]
// */
//function txsc_submitData(){
//	var submitParams = new LotterySubmitParams();
//	$("#txsc_queding").bind('click', function(event) {
//		txsc_rebate = $("#txsc_fandian option:last").val();
//		if(parseInt($('#txsc_zhushu').html()) <= 0 || Number($("#txsc_money").html()) <= 0){
//			toastUtils.showToast('请至少选择一注');
//			return;
//		}
//		txsc_calcNotes();
//
//		//后台控制是否可以投注
//		if(!check_AgentCanBetting()) return;
//
//		//设置单笔最低投注额
//		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;
//
//		/*if(parseInt($('#txsc_modeId').val()) == 8){
//			if (Number($('#txsc_money').html()) < 0.02){
//				toastUtils.showToast('请至少选择0.02元');
//				return;
//			}
//		}*/
//
//		//提示单挑奖金
//		getDanTiaoBonus('txsc',txsc_playMethod);
//
//		submitParams.lotteryType = "txsc";
//		var playType = LotteryInfo.getPlayName("txsc",txsc_playType);
//		submitParams.playType = playType;
//		submitParams.playMethod = LotteryInfo.getMethodName("txsc",txsc_playMethod);
//		submitParams.playTypeIndex = txsc_playType;
//		submitParams.playMethodIndex = txsc_playMethod;
//		var selectedBalls = [];
//
//		if (txsc_playType == 0 || txsc_playType == 6 || txsc_playType == 7 || txsc_playType == 8 || txsc_playType == 9 || txsc_playType == 10) {
//			$("#txsc_ballView div.ballView").each(function(){
//				$(this).find("span.redBalls_active").each(function(){
//					selectedBalls.push($(this).text());
//				});
//			});
//			submitParams.nums = selectedBalls.join(",");
//		}else if(txsc_playType == 1 || txsc_playType == 2|| txsc_playType == 3|| txsc_playType == 4){
//			if(txsc_playMethod == 1 || txsc_playMethod == 3|| txsc_playMethod == 5|| txsc_playMethod == 7){
//				$("#txsc_ballView div.ballView").each(function(){
//					var arr = [];
//					$(this).find("span.redBalls_active").each(function(){
//						arr.push($(this).text());
//					});
//					selectedBalls.push(arr.join(","));
//				});
//				submitParams.nums = selectedBalls.join("|");
//			}else{//单式
//				//去错误号
//				txscValidateData("submit");
//				var arr = $("#txsc_single").val().split(",");
//				for(var i = 0;i<arr.length;i++){
//					if(arr[i].split(' ').length<2){
//						if(txsc_playMethod == 2){
//							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
//						}else if(txsc_playMethod == 4){
//							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
//						}else if(txsc_playMethod == 6){
//							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
//						}else if(txsc_playMethod == 8){
//							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
//						}
//					}
//				}
//				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
//				submitParams.nums = str;
//			}
//		}else if(txsc_playType == 5) {
//			$("#txsc_ballView div.ballView").each(function(){
//				var arr = [];
//				$(this).find("span.redBalls_active").each(function(){
//					arr.push($(this).text());
//				});
//				if (arr.length == 0) {
//					selectedBalls.push("*");
//				}else{
//					selectedBalls.push(arr.join(","));
//				}
//			});
//			submitParams.nums = selectedBalls.join("|");
//		}else{
//			//去错误号
//			txscValidateData("submit");
//			var arr = $("#txsc_single").val().split(",");
//			var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
//			submitParams.nums = str;
//		}
//		localStorageUtils.setParam("playMode",$("#txsc_modeId").val());
//		localStorageUtils.setParam("playBeiNum",$("#txsc_beiNum").val());
//		localStorageUtils.setParam("playFanDian",$("#txsc_fandian").val());
//		submitParams.notes = $('#txsc_zhushu').html();
//		submitParams.sntuo = txsc_sntuo;
//		submitParams.multiple = $('#txsc_beiNum').val();  //requirement
//		submitParams.rebates = $('#txsc_fandian').val();  //requirement
//		submitParams.playMode = $('#txsc_modeId').val();  //requirement
//		submitParams.money = $('#txsc_money').html();  //requirement
//		submitParams.award = $('#txsc_minAward').html();  //奖金
//		submitParams.maxAward = $('#txsc_maxAward').html();  //多级奖金
//		submitParams.submit();
//		$("#txsc_ballView").empty();
//		txsc_qingkongAll();
//	});
//}
//
//
///**
// * [txscValidateData 单式数据验证]
// */
//function txscValidateData(type){
//	if (typeof type == "undefined"){type = "onblur"}
//	var textStr = $("#txsc_single").val();
//	var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
//	var result,
//		content = {};
//	if(txsc_playMethod == 2){
//		content.str = str;
//		content.weishu = 5;
//		content.zhiXuan = true;
//		content.maxNum = 10;
//		result = handleSingleStr_deleteErr(content,type);
//	}else if(txsc_playMethod == 4){
//		content.str = str;
//		content.weishu = 8;
//		content.zhiXuan = true;
//		content.maxNum = 10;
//		result = handleSingleStr_deleteErr(content,type);
//	}else if(txsc_playMethod == 6){
//		content.str = str;
//		content.weishu = 11;
//		content.zhiXuan = true;
//		content.maxNum = 11;
//		result = handleSingleStr_deleteErr(content,type);
//	}else if(txsc_playMethod == 8){
//		content.str = str;
//		content.weishu = 14;
//		content.zhiXuan = true;
//		content.maxNum = 14;
//		result = handleSingleStr_deleteErr(content,type);
//	}
//
//	$('#txsc_delRepeat').off('click');
//	$('#txsc_delRepeat').on('click',function () {
//		content.str = $('#txsc_single').val() ? $('#txsc_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
//		var rptResult = handleSingleStr_deleteRepeat(content);
//		var array = rptResult.num || [];
//		notes = rptResult.length;
//		txscShowFooter(true,notes);
//		$("#txsc_single").val(array.join(","));
//	});
//
//	$("#txsc_single").val(result.num.join(","));
//	var notes = result.length;
//	txscShowFooter(true,notes);
//	return notes;
//}
//
//function txscShowFooter(isValid,notes){
//	$('#txsc_zhushu').text(notes);
//	if($("#txsc_modeId").val() == "8"){
//		$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.002));
//	}else if ($("#txsc_modeId").val() == "2"){
//		$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.2));
//	}else if ($("#txsc_modeId").val() == "1"){
//		$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),0.02));
//	}else{
//		$('#txsc_money').text(bigNumberUtil.multiply(notes * parseInt($("#txsc_beiNum").val()),2));
//	}
//	if(!isValid){
//		toastUtils.showToast('格式不正确');
//	}
//	txsc_initFooterButton();
//	calcAwardWin('txsc',txsc_playMethod);  //计算奖金和盈利
//}