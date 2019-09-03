
//定义PK拾玩法标识
var xyft_playType = 0;
var xyft_playMethod = 0;
var xyft_sntuo = 0;
var xyft_rebate;
var xyftScroll;

//进入这个页面时调用
function xyftPageLoadedPanel() {
	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/lotteries/play/get_config","LotteryCode":"'+LotteryInfo.getLotteryIdByTag("xyft")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
    	if(data.Code == 200){
			lotteryPlay_config = data.Data;
			catchErrorFun("xyft_init();");
        }else{
            toastUtils.showToast(data.Msg);
        }
    },null);
}

//离开这个页面时调用
function xyftPageUnloadedPanel(){
	$("#xyftPage_back").off('click');
	$("#xyft_queding").off('click');
	$("#xyft_ballView").empty();
	$("#xyftSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="xyftPlaySelect"></select>');
	$("#xyftSelect").append($select);
}

//入口函数
function xyft_init(){
	var onShowArray=[];//需要隐藏玩法的index;
	for(var j = 0; j < LotteryInfo.getMethodArry("xyft").length;j++){
		for(var k=0;k<lotteryPlay_config.length;k++){
			if(  ( LotteryInfo.getMethodArry("xyft")[j].methodId ==  lotteryPlay_config[k].PlayCode.toString().replace(lotteryPlay_config[k].LotteryCode.toString(),"") )&&
				   	lotteryPlay_config[k].BetMode == LotteryInfo.getMethodArry("xyft")[j].mode){
				onShowArray.push(j);
			}
		}
	}
	//初始玩法页面	
	$("#xyft_title").html(LotteryInfo.getLotteryNameByTag("xyft"));
	for(var i = 0; i< LotteryInfo.getPlayLength("xyft");i++){
		if(i == 8)continue;
		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("xyft",i)+'"></optgroup>');
		for(var j = 0; j < LotteryInfo.getMethodLength("xyft");j++){
			
			if($.inArray(j,onShowArray)>-1)continue;
			
			if(LotteryInfo.getMethodTypeId("xyft",j) == LotteryInfo.getPlayTypeId("xyft",i)){
				var name = LotteryInfo.getMethodName("xyft",j);
				if(i == xyft_playType && j == xyft_playMethod){
					$play.append('<option value="xyft'+LotteryInfo.getMethodIndex("xyft",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="xyft'+LotteryInfo.getMethodIndex("xyft",j)+'">' + name +'</option>');
					
					//如果前台默认的玩法在后台隐藏了  那么就默认显示开启的第一个玩法
					if( $.inArray(xyft_playMethod,onShowArray)>-1 ){
						xyft_playType = i;
						xyft_playMethod = j;
					}
				}
			}
		}
		
		//如果此标签下所有玩法都隐藏，标签消失
		if($play[0].children.length > 0 ){
			$("#xyftPlaySelect").append($play);
		}
	}
	
	if($("#xyftPlaySelect")[0].children.length < 1){
		toastUtils.showToast(noPlayMethodTips);
		setPanelBackPage_Fun('lotteryHallPage');
		return;
	}

	[].slice.call( document.getElementById("xyftSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:xyftChangeItem
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

	GetLotteryInfo("xyft",function (){
		xyftChangeItem("xyft"+xyft_playMethod);
	});

	//添加滑动条
	if(!xyftScroll){
		xyftScroll = new IScroll('#xyftContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	getQihao("xyft",LotteryInfo.getLotteryIdByTag("xyft"));

	//获取上一期开奖
	queryLastPrize("xyft");

	//获取单挑和单期最高奖金
	getLotteryMaxBonus('xyft');

	//机选选号
	$("#xyft_random").on('click', function(event) {
		xyft_randomOne();
	});

	//返回
	$("#xyftPage_back").on('click', function(event) {
		// xyft_playType = 0;
		// xyft_playMethod = 0;
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		$("#xyft_ballView").empty();
		xyft_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
	});
	
	$("#xyft_shuoming").html(LotteryInfo.getMethodShuoming("xyft",xyft_playMethod));
	//玩法说明
	$("#xyft_paly_shuoming").off('click');
	$("#xyft_paly_shuoming").on('click', function(event) {
			toastUtils.showToast($("#xyft_shuoming").text());
	});

	qingKong("xyft");//清空
	xyft_submitData();
}

function xyftResetPlayType(){
	xyft_playType = 0;
	xyft_playMethod = 0;
}

function xyftChangeItem(val) {
	xyft_qingkongAll();
	var temp = val.substring("xyft".length,val.length);
	if(val == 'xyft0'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 0;
		xyft_playMethod = 0;

		createOneLineLayout("xyft","请至少选择1个",1,10,true,function(){
			xyft_calcNotes();
		});
	}else if(val == 'xyft1'){
		$("#xyft_random").show();
		var tip1 = "冠军：可选1-10个";
		var tip2 = "亚军：可选1-10个";
		var tips = [tip1,tip2];
		xyft_sntuo = 0;
		xyft_playType = 1;
		xyft_playMethod = 1;
		createTwoWinner("xyft",tips,1,10,true,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft2'){
		$("#xyft_random").hide();
		xyft_sntuo = 3;
		xyft_playType = 1;
		xyft_playMethod = 2;
		xyft_qingkongAll();
		var tips = "<p>格式说明<br/>冠亚军单式01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xyft",tips);
	}else if(val == 'xyft3'){
		$("#xyft_random").show();
		var tip1 = "冠军：可选1-10个";
		var tip2 = "亚军：可选1-10个";
		var tip3 = "季军：可选1-10个";
		var tips = [tip1,tip2,tip3];
		xyft_sntuo = 0;
		xyft_playType = 2;
		xyft_playMethod = 3;
		createThreeWinner("xyft",tips,1,10,true,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	} else if(val == 'xyft4'){
		$("#xyft_random").hide();
		xyft_sntuo = 3;
		xyft_playType = 2;
		xyft_playMethod = 4;
		xyft_qingkongAll();
		var tips = "<p>格式说明<br/>猜前三名单式01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xyft",tips);
	}else if(val == 'xyft5'){
		$("#xyft_random").show();
		var tip1 = "冠军：可选1-10个";
		var tip2 = "亚军：可选1-10个";
		var tip3 = "季军：可选1-10个";
		var tip4 = "第四名：可选1-10个";
		var tips = [tip1,tip2,tip3,tip4];
		xyft_sntuo = 0;
		xyft_playType = 3;
		xyft_playMethod = 5;
		createFourWinner("xyft",tips,1,10,true,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft6'){
		$("#xyft_random").hide();
		$("#xyft_qingkong").hide();
		xyft_sntuo = 3;
		xyft_playType = 3;
		xyft_playMethod = 6;
		xyft_qingkongAll();
		var tips = "<p>格式说明<br/>猜前四名单式01 02 03 04或01020304<br/>1)每注必须是4个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xyft",tips);
	}else if(val == 'xyft7'){
		$("#xyft_random").show();
		var tip1 = "冠军：可选1-10个";
		var tip2 = "亚军：可选1-10个";
		var tip3 = "季军：可选1-10个";
		var tip4 = "第四名：可选1-10个";
		var tip5 = "第五名：可选1-10个";
		var tips = [tip1,tip2,tip3,tip4,tip5];
		xyft_sntuo = 0;
		xyft_playType = 4;
		xyft_playMethod = 7;
		createFiveWinner("xyft",tips,1,10,true,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft8'){
		$("#xyft_random").hide();
		$("#xyft_qingkong").hide();
		xyft_sntuo = 3;
		xyft_playType = 4;
		xyft_playMethod = 8;
		xyft_qingkongAll();
		var tips = "<p>格式说明<br/>猜前五名单式01 02 03 04 05或0102030405<br/>1)每注必须是5个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
		createSingleLayout("xyft",tips);
	}else if(val == 'xyft9'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 5;
		xyft_playMethod = 9;
		var tips = ["冠军","亚军","季军","第四名","第五名"];
		createFiveWinner("xyft",tips,1,10,true,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft10'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 5;
		xyft_playMethod = 10;
		var tips = ["第六名","第七名","第八名","第九名","第十名"];
		createFiveWinner("xyft",tips,1,10,true,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft11'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 6;
		xyft_playMethod = 11;
		var num = ["大","小"];
		createNonNumLayout("xyft",xyft_playMethod,num,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft12'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 6;
		xyft_playMethod = 12;
		var num = ["大","小"];
		createNonNumLayout("xyft",xyft_playMethod,num,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft13'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 6;
		xyft_playMethod = 13;
		var num = ["大","小"];
		createNonNumLayout("xyft",xyft_playMethod,num,function(){
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft14'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 7;
		xyft_playMethod = 14;
		var num = ["单", "双"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft15'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 7;
		xyft_playMethod = 15;
		var num = ["单", "双"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft16'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 7;
		xyft_playMethod = 16;
		var num = ["单", "双"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft17'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 8;
		xyft_playMethod = 17;
		var num = ["龙", "虎"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft18'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 8;
		xyft_playMethod = 18;
		var num = ["龙", "虎"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft19'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 8;
		xyft_playMethod = 19;
		var num = ["龙", "虎"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft20'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 9;
		xyft_playMethod = 20;
		var num = ["3", "4", "18", "19"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft21'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 9;
		xyft_playMethod = 21;
		var num = ["5", "6", "16", "17"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft22'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 9;
		xyft_playMethod = 22;
		var num = ["7", "8", "14", "15"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft23'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 9;
		xyft_playMethod = 23;
		var num = ["9", "10", "12", "13"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft24'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 9;
		xyft_playMethod = 24;
		var num = ["11"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft25'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 9;
		xyft_playMethod = 25;
		var num = ["大", "双"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft26'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 9;
		xyft_playMethod = 26;
		var num = ["小", "单"];
		createNonNumLayout("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft27'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 10;
		xyft_playMethod = 27;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft28'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 10;
		xyft_playMethod = 28;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft29'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 10;
		xyft_playMethod = 29;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft30'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 10;
		xyft_playMethod = 30;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft31'){
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 10;
		xyft_playMethod = 31;
		var num = ["龙", "虎"];
		createNonNumLayout_pks_lh("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
		
		
	}else if(val == 'xyft32'){     //2019.05.09   新 玩法
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 11;
		xyft_playMethod = 32;
		var num = ["大","小","单","双",];
		var title = ["冠军：至少选择一个","亚军：至少选择一个","季军：至少选择一个","第四名：至少选择一个","第五名：至少选择一个"];
		createFive_pks_new("xyft", xyft_playMethod, num, title,function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft33'){     //2019.05.09   新 玩法
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 11;
		xyft_playMethod = 33;
		var num = ["大","小","单","双",];
		var title = ["第六名：至少选择一个","第七名：至少选择一个","第八名：至少选择一个","第九名：至少选择一个","第十名：至少选择一个"];
		createFive_pks_new("xyft", xyft_playMethod, num, title,function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft34'){     //2019.05.09   新 玩法
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 11;
		xyft_playMethod = 34;
		var num = ["大","小","单","双",];
		var title = ["冠亚和：至少选择一个"];
		createOne_pks_new("xyft", xyft_playMethod, num, title,function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}else if(val == 'xyft35'){     //2019.05.09   新 玩法
		$("#xyft_random").show();
		xyft_sntuo = 0;
		xyft_playType = 12;
		xyft_playMethod = 35;
		var num = ["3", "4","5", "6","7", "8","9", "10","11", "12","13", "14","15", "16","17", "18","19"];
		createNonNumLayout_pks_new("xyft", xyft_playMethod, num, function () {
			xyft_calcNotes();
		});
		xyft_qingkongAll();
	}
	
	
	if(xyftScroll){
		xyftScroll.refresh();
		xyftScroll.scrollTo(0,0,1);
	}
	
	$("#xyft_shuoming").html(LotteryInfo.getMethodShuoming("xyft",temp));

	initFooterData("xyft",temp);
	hideRandomWhenLi("xyft",xyft_sntuo,xyft_playMethod);
	xyft_calcNotes();
}

/**
 * [xyft_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function xyft_initFooterButton(){
	if(xyft_playMethod == 1 || xyft_playMethod == 0){
		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0) {
			$("#xyft_qingkong").css("opacity",1.0);
		}else{
			$("#xyft_qingkong").css("opacity",0.4);
		}
	}else if(xyft_playMethod == 3){
		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
			|| LotteryStorage["xyft"]["line3"].length > 0) {
			$("#xyft_qingkong").css("opacity",1.0);
		}else{
			$("#xyft_qingkong").css("opacity",0.4);
		}
	}else if(xyft_playMethod == 5){
		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
			|| LotteryStorage["xyft"]["line3"].length > 0 || LotteryStorage["xyft"]["line4"].length > 0) {
			$("#xyft_qingkong").css("opacity",1.0);
		}else{
			$("#xyft_qingkong").css("opacity",0.4);
		}
	}else if(xyft_playMethod == 32 || xyft_playMethod == 33 || xyft_playMethod == 34){
		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
			|| LotteryStorage["xyft"]["line3"].length > 0 || LotteryStorage["xyft"]["line4"].length > 0) {
			$("#xyft_qingkong").css("opacity",1.0);
		}else{
			$("#xyft_qingkong").css("opacity",0.4);
		}
	}else if(xyft_playMethod == 35){
		if (LotteryStorage["xyft"]["line1"].length > 0 ) {
			$("#xyft_qingkong").css("opacity",1.0);
		}else{
			$("#xyft_qingkong").css("opacity",0.4);
		}
	}else if(xyft_playMethod == 7){
		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
			|| LotteryStorage["xyft"]["line3"].length > 0 || LotteryStorage["xyft"]["line4"].length > 0 || LotteryStorage["xyft"]["line5"].length > 0) {
			$("#xyft_qingkong").css("opacity",1.0);
		}else{
			$("#xyft_qingkong").css("opacity",0.4);
		}
	}else if(xyft_playType == 5){
		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
			|| LotteryStorage["xyft"]["line3"].length > 0 || LotteryStorage["xyft"]["line4"].length > 0 || LotteryStorage["xyft"]["line5"].length > 0) {
			$("#xyft_qingkong").css("opacity",1.0);
		}else{
			$("#xyft_qingkong").css("opacity",0.4);
		}
	}else if(xyft_playType == 6 || xyft_playType == 7 || xyft_playType == 8 || xyft_playType == 9|| xyft_playType == 10){
		if(LotteryStorage["xyft"]["line1"].length > 0){
			$("#xyft_qingkong").css("opacity",1.0);
		}else{
			$("#xyft_qingkong").css("opacity",0.4);
		}
	}else{
		$("#xyft_qingkong").css("opacity",0);
	}

	if($("#xyft_qingkong").css("opacity") == "0"){
		$("#xyft_qingkong").css("display","none");
	}else{
		$("#xyft_qingkong").css("display","block");
	}

	if($('#xyft_zhushu').html() > 0){
		$("#xyft_queding").css("opacity",1.0);
	}else{
		$("#xyft_queding").css("opacity",0.4);
	}
}

/**
 * @Author:      admin
 * @DateTime:    2014-12-13 14:40:19
 * @Description: 清空所有记录
 */
function xyft_qingkongAll(){
	$("#xyft_ballView span").removeClass('redBalls_active');
	$("#xyft_ballView span").removeClass('pks_new_redBalls_active');
	LotteryStorage["xyft"]["line1"] = [];
	LotteryStorage["xyft"]["line2"] = [];
	LotteryStorage["xyft"]["line3"] = [];
	LotteryStorage["xyft"]["line4"] = [];
	LotteryStorage["xyft"]["line5"] = [];
	localStorageUtils.removeParam("xyft_line1");
	localStorageUtils.removeParam("xyft_line2");
	localStorageUtils.removeParam("xyft_line3");
	localStorageUtils.removeParam("xyft_line4");
	localStorageUtils.removeParam("xyft_line5");

	$('#xyft_zhushu').text(0);
	$('#xyft_money').text(0);
	clearAwardWin("xyft");
	xyft_initFooterButton();
}

/**
 * [xyft_calcNotes 计算注数]
 * @return {[type]} [description]
 */
function xyft_calcNotes(){
	$('#xyft_modeId').blur();
	$('#xyft_fandian').blur();
	
	var notes = 0;
	if(xyft_playMethod == 0 || xyft_playType == 6 || xyft_playType == 7 || xyft_playType == 8 || xyft_playType == 9|| xyft_playType == 10|| xyft_playType == 12){
		notes = LotteryStorage["xyft"]["line1"].length;
	}else if(xyft_playMethod == 1 ) {
		for(var i = 0;i < LotteryStorage["xyft"]["line1"].length; i++){
			var flag = false;
			for(var j = 0;j < LotteryStorage["xyft"]["line2"].length; j++){
				if(LotteryStorage["xyft"]["line1"][i] == LotteryStorage["xyft"]["line2"][j]){
					flag = true;
				}
			}
			if(flag){
				notes += (LotteryStorage["xyft"]["line2"].length - 1);
			}else{
				notes += LotteryStorage["xyft"]["line2"].length;
			}
		}
	}else if(xyft_playType == 5){
		notes = LotteryStorage["xyft"]["line1"].length + LotteryStorage["xyft"]["line2"].length + LotteryStorage["xyft"]["line3"].length
			+ LotteryStorage["xyft"]["line4"].length + LotteryStorage["xyft"]["line5"].length;
	}else if(xyft_playType == 11){
		notes = LotteryStorage["xyft"]["line1"].length + LotteryStorage["xyft"]["line2"].length + LotteryStorage["xyft"]["line3"].length
			+ LotteryStorage["xyft"]["line4"].length + LotteryStorage["xyft"]["line5"].length;
	}else if(xyft_playMethod == 3){
		for(var i = 0;i < LotteryStorage["xyft"]["line1"].length; i++){
			for(var j = 0;j < LotteryStorage["xyft"]["line2"].length; j++){
				for(var k = 0;k < LotteryStorage["xyft"]["line3"].length; k++){
					if(LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line2"][j] &&
						LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line3"][k]
						&& LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line3"][k]){
						notes++;
					}
				}
			}
		}
	}else if(xyft_playMethod == 5){
		for(var i = 0;i < LotteryStorage["xyft"]["line1"].length; i++){
			for(var j = 0;j < LotteryStorage["xyft"]["line2"].length; j++){
				for(var k = 0;k < LotteryStorage["xyft"]["line3"].length; k++){
					for(var m = 0;m < LotteryStorage["xyft"]["line4"].length; m++){
						if(LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line2"][j] &&
						LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line3"][k]&&
						LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line4"][m]&&
						LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line3"][k]&&
						LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line4"][m]&&
						LotteryStorage["xyft"]["line3"][k] != LotteryStorage["xyft"]["line4"][m]){
						notes++;
						}
					}
				}
			}
		}
	}else if(xyft_playMethod == 7){
		for(var i = 0;i < LotteryStorage["xyft"]["line1"].length; i++){
			for(var j = 0;j < LotteryStorage["xyft"]["line2"].length; j++){
				for(var k = 0;k < LotteryStorage["xyft"]["line3"].length; k++){
					for(var m = 0;m < LotteryStorage["xyft"]["line4"].length; m++){
						for(var n = 0;n < LotteryStorage["xyft"]["line5"].length; n++){
							if(LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line2"][j] &&
							LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line3"][k]&&
							LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line4"][m]&&
							LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line5"][n]&&
							LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line3"][k]&&
							LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line4"][m]&&
							LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line5"][n]&&
							LotteryStorage["xyft"]["line3"][k] != LotteryStorage["xyft"]["line4"][m]&&
							LotteryStorage["xyft"]["line3"][k] != LotteryStorage["xyft"]["line5"][n]&&
							LotteryStorage["xyft"]["line4"][m] != LotteryStorage["xyft"]["line5"][n]){
							notes++;
							}
						}
					}
				}
			}
		}
	}else if(xyft_playType == 11){
		notes = LotteryStorage["xyft"]["line1"].length + LotteryStorage["xyft"]["line2"].length + LotteryStorage["xyft"]["line3"].length
			+ LotteryStorage["xyft"]["line4"].length + LotteryStorage["xyft"]["line5"].length;
	}else{//单式
		notes = xyftValidateData('onblur');
	}

	hideRandomWhenLi("xyft",xyft_sntuo,xyft_playMethod);

	//验证是否为空
	if( $("#xyft_beiNum").val() =="" || parseInt($("#xyft_beiNum").val()) == 0){
		$("#xyft_beiNum").val(1);
	}

	//验证慢彩最大倍数为9999
	if($("#xyft_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
		$("#xyft_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	}
	if(notes > 0) {
		$('#xyft_zhushu').text(notes);
		if($("#xyft_modeId").val() == "8"){
			$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.002));
		}else if ($("#xyft_modeId").val() == "2"){
			$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.2));
		}else if ($("#xyft_modeId").val() == "1"){
			$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.02));
		}else{
			$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),2));
		}

	} else {
		$('#xyft_zhushu').text(0);
		$('#xyft_money').text(0);
	}
	xyft_initFooterButton();
	// 计算奖金盈利
	calcAwardWin('xyft',xyft_playMethod);
}

/**
 * [xyft_randomOne 随机一注]
 * @return {[type]} [description]
 */
function xyft_randomOne(){
	xyft_qingkongAll();
	if(xyft_playType == 0){
		var number = mathUtil.getRandomNum(1,11);
		LotteryStorage["xyft"]["line1"].push(number > 9 ? number+"" : "0"+number);

		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xyft_playMethod == 1){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		LotteryStorage["xyft"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
		LotteryStorage["xyft"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line2"], function(k, v){
			$("#" + "xyft_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xyft_playMethod == 3){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		LotteryStorage["xyft"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
		LotteryStorage["xyft"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
		LotteryStorage["xyft"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line2"], function(k, v){
			$("#" + "xyft_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line3"], function(k, v){
			$("#" + "xyft_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xyft_playMethod == 5){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(4,redBallArray);
		LotteryStorage["xyft"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
		LotteryStorage["xyft"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
		LotteryStorage["xyft"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
		LotteryStorage["xyft"]["line4"].push(array[3] > 9 ? array[3]+"" : "0"+array[3]);
		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line2"], function(k, v){
			$("#" + "xyft_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line3"], function(k, v){
			$("#" + "xyft_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line4"], function(k, v){
			$("#" + "xyft_line4" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xyft_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(5,redBallArray);
		LotteryStorage["xyft"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
		LotteryStorage["xyft"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
		LotteryStorage["xyft"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
		LotteryStorage["xyft"]["line4"].push(array[3] > 9 ? array[3]+"" : "0"+array[3]);
		LotteryStorage["xyft"]["line5"].push(array[4] > 9 ? array[4]+"" : "0"+array[4]);
		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line2"], function(k, v){
			$("#" + "xyft_line2" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line3"], function(k, v){
			$("#" + "xyft_line3" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line4"], function(k, v){
			$("#" + "xyft_line4" + parseInt(v)).toggleClass("redBalls_active");
		});
		$.each(LotteryStorage["xyft"]["line5"], function(k, v){
			$("#" + "xyft_line5" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xyft_playType == 5){
		var line = mathUtil.getRandomNum(1,6);
		var number = mathUtil.getRandomNum(1,11);
		LotteryStorage["xyft"]["line"+line].push(number > 9 ? number+"" : "0"+number);

		$.each(LotteryStorage["xyft"]["line"+line], function(k, v){
			$("#" + "xyft_line"+line + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xyft_playType == 6 || xyft_playType == 7 || xyft_playType == 8 || xyft_playType == 10){
		var number = mathUtil.getRandomNum(0,2);
		LotteryStorage["xyft"]["line1"].push(number > 9 ? number+"" : "0"+number);

		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
		});
	}else if(xyft_playType == 9){
		if(xyft_playMethod == 20){
			var contentArr = ["3","4","18","19"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["xyft"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(xyft_playMethod == 21){
			var contentArr = ["5","6","16","17"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["xyft"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(xyft_playMethod == 22){
			var contentArr = ["7","8","14","15"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["xyft"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(xyft_playMethod == 23){
			var contentArr = ["9","10","12","13"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["xyft"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(xyft_playMethod == 24){
			var contentArr = ["11"];
			var number = mathUtil.getRandomNum(0,1);
			LotteryStorage["xyft"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(xyft_playMethod == 25 ){
			var contentArr = ["0","3"];
			var number = mathUtil.getRandomNum(0,2);
			LotteryStorage["xyft"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(xyft_playMethod == 26){
			var contentArr = ["1","2"];
			var number = mathUtil.getRandomNum(0,2);
			LotteryStorage["xyft"]["line1"].push(contentArr[number]);

			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}
	}else if(xyft_playType == 11){
		if(xyft_playMethod == 32){
			var contentArr = ["0","1","2","3"];
			var line_number = mathUtil.getRandomNum(1,6);
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["xyft"]["line" + line_number].push(contentArr[number]);
			
			$.each(LotteryStorage["xyft"]["line" + line_number], function(k, v){
				$("#" + "xyft_line"+ line_number + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(xyft_playMethod == 33){
			var contentArr = ["0","1","2","3"];
			var line_number = mathUtil.getRandomNum(1,6);
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["xyft"]["line" + line_number].push(contentArr[number]);
			
			$.each(LotteryStorage["xyft"]["line" + line_number], function(k, v){
				$("#" + "xyft_line"+ line_number + parseInt(number)).toggleClass("redBalls_active");
			});
		}else if(xyft_playMethod == 34){
			var contentArr = ["0","1","2","3"];
			var number = mathUtil.getRandomNum(0,4);
			LotteryStorage["xyft"]["line1"].push(contentArr[number]);
			
			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
			});
		}
	}else if(xyft_playType == 12){
		if(xyft_playMethod == 35){//冠亚和  3~19
			var number = mathUtil.getRandomNum(3,20);
			LotteryStorage["xyft"]["line1"].push(number);
	
			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
				$("#" + "xyft_line1" + parseInt(Number(v)-3)).toggleClass("pks_new_redBalls_active");
			});
		}
	}
	xyft_calcNotes();
}

/**
 * 出票机选
 * @param playMethod
 */
function xyft_checkOutRandom(playMethod){
	var obj = new Object();
	if(xyft_playType == 0){
		var number = mathUtil.getRandomNum(1,11);
		obj.nums = number < 10 ? "0"+number : number;
		obj.notes = 1;
	}else if(xyft_playMethod == 1){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(2,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(xyft_playMethod == 3){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(3,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(xyft_playType == 5){
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
	}else if(xyft_playType == 6){
		var number = mathUtil.getRandomNum(0,2);
		obj.nums = number == 0 ? "大" : "小";
		obj.notes = 1;
	}else if(xyft_playType == 7){
		var number = mathUtil.getRandomNum(0,2);
		obj.nums = number == 0 ? "单" : "双";
		obj.notes = 1;
	}else if(xyft_playType == 8 || xyft_playType == 10){
		var number = mathUtil.getRandomNum(0,2);
		obj.nums = number == 0 ? "龙" : "虎";
		obj.notes = 1;
	}else if(xyft_playType == 9){
		if(xyft_playMethod == 20){
			var contentArr = ["3","4","18","19"];
			var number = mathUtil.getRandomNum(0,4);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(xyft_playMethod == 21){
			var contentArr = ["5","6","16","17"];
			var number = mathUtil.getRandomNum(0,4);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(xyft_playMethod == 22){
			var contentArr = ["7","8","14","15"];
			var number = mathUtil.getRandomNum(0,4);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(xyft_playMethod == 23){
			var contentArr = ["9","10","12","13"];
			var number = mathUtil.getRandomNum(0,4);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(xyft_playMethod == 24){
			var contentArr = ["11"];
			var number = mathUtil.getRandomNum(0,1);
			obj.nums = contentArr[number];
			obj.notes = 1;
		}else if(xyft_playMethod == 25){
			var number = mathUtil.getRandomNum(0,2);
			obj.nums = number == 0 ? "大" : "双";
			obj.notes = 1;
		}else if(xyft_playMethod == 26){
			var number = mathUtil.getRandomNum(0,2);
			obj.nums = number == 0 ? "小" : "单";
			obj.notes = 1;
		}
	}else if(xyft_playMethod == 5){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(4,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(xyft_playMethod == 7){
		var redBallArray = mathUtil.getInts(1,10);
		var array = mathUtil.getDifferentNums(5,redBallArray);
		$.each(array,function(index){
			if(array[index] < 10){
				array[index] = "0"+array[index];
			}
		});
		obj.nums = array.join("|");
		obj.notes = 1;
	}else if(xyft_playMethod == 32){
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
	}else if(xyft_playMethod == 33){
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
	}else if(xyft_playMethod == 34){
		var number = mathUtil.getRandomNum(0,4);
		var contentArr =["大","小","单","双"];
		obj.nums = contentArr[number];
		obj.notes = 1;
	}else if(xyft_playMethod == 35){
		var number = mathUtil.getRandomNum(3,20);
		obj.nums = number;
		obj.notes = 1;
	}
	obj.sntuo = xyft_sntuo;
	obj.multiple = 1;
	obj.rebates = xyft_rebate;
	obj.playMode = "4";
	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
	calcAwardWin('xyft',xyft_playMethod,obj);  //机选奖金计算
	obj.award = $('#xyft_minAward').html();     //奖金
	obj.maxAward = $('#xyft_maxAward').html();  //多级奖金
	return obj;
}


/**
 * [xyft_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function xyft_submitData(){
	var submitParams = new LotterySubmitParams();
	$("#xyft_queding").bind('click', function(event) {
		xyft_rebate = $("#xyft_fandian option:last").val();
		localStorageUtils.setParam("max_rebate", xyft_rebate);
		if(parseInt($('#xyft_zhushu').html()) <= 0 || Number($("#xyft_money").html()) <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		xyft_calcNotes();

		//后台控制是否可以投注
		if(!check_AgentCanBetting()) return;

		//设置单笔最低投注额
		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;

		/*if(parseInt($('#xyft_modeId').val()) == 8){
			if (Number($('#xyft_money').html()) < 0.02){
				toastUtils.showToast('请至少选择0.02元');
				return;
			}
		}*/

		//提示单挑奖金
		getDanTiaoBonus('xyft',xyft_playMethod);

		submitParams.lotteryType = "xyft";
		var playType = LotteryInfo.getPlayName("xyft",xyft_playType);
		submitParams.playType = playType;
		submitParams.playMethod = LotteryInfo.getMethodName("xyft",xyft_playMethod);
		submitParams.playTypeIndex = xyft_playType;
		submitParams.playMethodIndex = xyft_playMethod;
		var selectedBalls = [];

		if (xyft_playType == 0 || xyft_playType == 6 || xyft_playType == 7 || xyft_playType == 8 || xyft_playType == 9 || xyft_playType == 10) {
			$("#xyft_ballView div.ballView").each(function(){
				$(this).find("span.redBalls_active").each(function(){
					selectedBalls.push($(this).text());
				});
			});
			submitParams.nums = selectedBalls.join(",");
		}else if(xyft_playType == 1 || xyft_playType == 2|| xyft_playType == 3|| xyft_playType == 4){
			if(xyft_playMethod == 1 || xyft_playMethod == 3|| xyft_playMethod == 5|| xyft_playMethod == 7){
				$("#xyft_ballView div.ballView").each(function(){
					var arr = [];
					$(this).find("span.redBalls_active").each(function(){
						arr.push($(this).text());
					});
					selectedBalls.push(arr.join(","));
				});
				submitParams.nums = selectedBalls.join("|");
			}else{//单式
				//去错误号
				xyftValidateData("submit");
				var arr = $("#xyft_single").val().split(",");
				for(var i = 0;i<arr.length;i++){
					if(arr[i].split(' ').length<2){
						if(xyft_playMethod == 2){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
						}else if(xyft_playMethod == 4){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
						}else if(xyft_playMethod == 6){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
						}else if(xyft_playMethod == 8){
							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
						}
					}
				}
				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
				submitParams.nums = str;
			}
		}else if(xyft_playType == 5) {
			$("#xyft_ballView div.ballView").each(function(){
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
		}else if(xyft_playType == 11) {
			$("#xyft_ballView div.ballView").each(function(){
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
		}else if(xyft_playType == 12){
			$("#xyft_ballView div.pks_new_ballView").each(function(){
				$(this).find("span.pks_new_redBalls_active").each(function(){
					selectedBalls.push($(this).text().split(" ")[0]);//因为带有奖金 所以要截取
				});
			});
			submitParams.nums = selectedBalls.join(",");
			
		}else{
			//去错误号
			xyftValidateData("submit");
			var arr = $("#xyft_single").val().split(",");
			var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
			submitParams.nums = str;
		}
		localStorageUtils.setParam("playMode",$("#xyft_modeId").val());
		localStorageUtils.setParam("playBeiNum",$("#xyft_beiNum").val());
		localStorageUtils.setParam("playFanDian",$("#xyft_fandian").val());
		submitParams.notes = $('#xyft_zhushu').html();
		submitParams.sntuo = xyft_sntuo;
		submitParams.multiple = $('#xyft_beiNum').val();  //requirement
		submitParams.rebates = $('#xyft_fandian').val();  //requirement
		submitParams.playMode = $('#xyft_modeId').val();  //requirement
		submitParams.money = $('#xyft_money').html();  //requirement
		submitParams.award = $('#xyft_minAward').html();  //奖金
		submitParams.maxAward = $('#xyft_maxAward').html();  //多级奖金
		submitParams.submit();
		$("#xyft_ballView").empty();
		xyft_qingkongAll();
	});
}


/**
 * [xyftValidateData 单式数据验证]
 */
function xyftValidateData(type){
	if (typeof type == "undefined"){type = "onblur"}
	var textStr = $("#xyft_single").val();
	var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
	var result,
		content = {};
	if(xyft_playMethod == 2){
		content.str = str;
		content.weishu = 5;
		content.zhiXuan = true;
		content.maxNum = 10;
		result = handleSingleStr_deleteErr(content,type);
	}else if(xyft_playMethod == 4){
		content.str = str;
		content.weishu = 8;
		content.zhiXuan = true;
		content.maxNum = 10;
		result = handleSingleStr_deleteErr(content,type);
	}else if(xyft_playMethod == 6){
		content.str = str;
		content.weishu = 11;
		content.zhiXuan = true;
		content.maxNum = 11;
		result = handleSingleStr_deleteErr(content,type);
	}else if(xyft_playMethod == 8){
		content.str = str;
		content.weishu = 14;
		content.zhiXuan = true;
		content.maxNum = 14;
		result = handleSingleStr_deleteErr(content,type);
	}

	$('#xyft_delRepeat').off('click');
	$('#xyft_delRepeat').on('click',function () {
		content.str = $('#xyft_single').val() ? $('#xyft_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
		var rptResult = handleSingleStr_deleteRepeat(content);
		var array = rptResult.num || [];
		notes = rptResult.length;
		xyftShowFooter(true,notes);
		$("#xyft_single").val(array.join(","));
	});

	$("#xyft_single").val(result.num.join(","));
	var notes = result.length;
	xyftShowFooter(true,notes);
	return notes;
}

function xyftShowFooter(isValid,notes){
	$('#xyft_zhushu').text(notes);
	if($("#xyft_modeId").val() == "8"){
		$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.002));
	}else if ($("#xyft_modeId").val() == "2"){
		$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.2));
	}else if ($("#xyft_modeId").val() == "1"){
		$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.02));
	}else{
		$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),2));
	}
	if(!isValid){
		toastUtils.showToast('格式不正确');
	}
	xyft_initFooterButton();
	calcAwardWin('xyft',xyft_playMethod);  //计算奖金和盈利
}





////定义PK拾玩法标识
//var xyft_playType = 0;
//var xyft_playMethod = 0;
//var xyft_sntuo = 0;
//var xyft_rebate;
//var xyftScroll;
//
////进入这个页面时调用
//function xyftPageLoadedPanel() {
//	catchErrorFun("xyft_init();");
//}
//
////离开这个页面时调用
//function xyftPageUnloadedPanel(){
//	$("#xyftPage_back").off('click');
//	$("#xyft_queding").off('click');
//	$("#xyft_ballView").empty();
//	$("#xyftSelect").empty();
//	var $select = $('<select class="cs-select cs-skin-overlay" id="xyftPlaySelect"></select>');
//	$("#xyftSelect").append($select);
//}
//
////入口函数
//function xyft_init(){
//	$("#xyft_title").html(LotteryInfo.getLotteryNameByTag("xyft"));
//	for(var i = 0; i< LotteryInfo.getPlayLength("xyft");i++){
//		if(i == 8 || i == 3 || i == 4 || i == 9 || i == 10){  //龙虎玩法隐藏   前四 前五    冠亚车和、龙虎斗
//			continue;
//		}
//		var $play = $('<optgroup label="'+LotteryInfo.getPlayName("xyft",i)+'"></optgroup>');
//		for(var j = 0; j < LotteryInfo.getMethodLength("xyft");j++){
//			if(LotteryInfo.getMethodTypeId("xyft",j) == LotteryInfo.getPlayTypeId("xyft",i)){
//				var name = LotteryInfo.getMethodName("xyft",j);
//				if(i == xyft_playType && j == xyft_playMethod){
//					$play.append('<option value="xyft'+LotteryInfo.getMethodIndex("xyft",j)+'" selected="selected">' + name +'</option>');
//				}else{
//					$play.append('<option value="xyft'+LotteryInfo.getMethodIndex("xyft",j)+'">' + name +'</option>');
//				}
//			}
//		}
//		$("#xyftPlaySelect").append($play);
//	}
//
//	[].slice.call( document.getElementById("xyftSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
//		new SelectFx(el, {
//			stickyPlaceholder: true,
//			onChange:xyftChangeItem
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
//	GetLotteryInfo("xyft",function (){
//		xyftChangeItem("xyft"+xyft_playMethod);
//	});
//
//	//添加滑动条
//	if(!xyftScroll){
//		xyftScroll = new IScroll('#xyftContent',{
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
//	getQihao("xyft",LotteryInfo.getLotteryIdByTag("xyft"));
//
//	//获取上一期开奖
//	queryLastPrize("xyft");
//
//	//获取单挑和单期最高奖金
//	getLotteryMaxBonus('xyft');
//
//	//机选选号
//	$("#xyft_random").on('click', function(event) {
//		xyft_randomOne();
//	});
//
//	//返回
//	$("#xyftPage_back").on('click', function(event) {
//		// xyft_playType = 0;
//		// xyft_playMethod = 0;
//		localStorageUtils.removeParam("playMode");
//		localStorageUtils.removeParam("playBeiNum");
//		localStorageUtils.removeParam("playFanDian");
//		$("#xyft_ballView").empty();
//		xyft_qingkongAll();
//		setPanelBackPage_Fun('lotteryHallPage');
//	});
//
//	qingKong("xyft");//清空
//	xyft_submitData();
//}
//
//function xyftResetPlayType(){
//	xyft_playType = 0;
//	xyft_playMethod = 0;
//}
//
//function xyftChangeItem(val) {
//	xyft_qingkongAll();
//	var temp = val.substring("xyft".length,val.length);
//	if(val == 'xyft0'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 0;
//		xyft_playMethod = 0;
//
//		createOneLineLayout("xyft","请至少选择1个",1,10,true,function(){
//			xyft_calcNotes();
//		});
//	}else if(val == 'xyft1'){
//		$("#xyft_random").show();
//		var tip1 = "冠军：可选1-10个";
//		var tip2 = "亚军：可选1-10个";
//		var tips = [tip1,tip2];
//		xyft_sntuo = 0;
//		xyft_playType = 1;
//		xyft_playMethod = 1;
//		createTwoWinner("xyft",tips,1,10,true,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft2'){
//		$("#xyft_random").hide();
//		xyft_sntuo = 3;
//		xyft_playType = 1;
//		xyft_playMethod = 2;
//		xyft_qingkongAll();
//		var tips = "<p>格式说明<br/>冠亚军单式01 02或0102<br/>1)每注必须是2个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
//		createSingleLayout("xyft",tips);
//	}else if(val == 'xyft3'){
//		$("#xyft_random").show();
//		var tip1 = "冠军：可选1-10个";
//		var tip2 = "亚军：可选1-10个";
//		var tip3 = "季军：可选1-10个";
//		var tips = [tip1,tip2,tip3];
//		xyft_sntuo = 0;
//		xyft_playType = 2;
//		xyft_playMethod = 3;
//		createThreeWinner("xyft",tips,1,10,true,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	} else if(val == 'xyft4'){
//		$("#xyft_random").hide();
//		xyft_sntuo = 3;
//		xyft_playType = 2;
//		xyft_playMethod = 4;
//		xyft_qingkongAll();
//		var tips = "<p>格式说明<br/>猜前三名单式01 02 03或010203<br/>1)每注必须是3个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
//		createSingleLayout("xyft",tips);
//	}else if(val == 'xyft5'){
//		$("#xyft_random").show();
//		var tip1 = "冠军：可选1-10个";
//		var tip2 = "亚军：可选1-10个";
//		var tip3 = "季军：可选1-10个";
//		var tip4 = "第四名：可选1-10个";
//		var tips = [tip1,tip2,tip3,tip4];
//		xyft_sntuo = 0;
//		xyft_playType = 3;
//		xyft_playMethod = 5;
//		createFourWinner("xyft",tips,1,10,true,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft6'){
//		$("#xyft_random").hide();
//		$("#xyft_qingkong").hide();
//		xyft_sntuo = 3;
//		xyft_playType = 3;
//		xyft_playMethod = 6;
//		xyft_qingkongAll();
//		var tips = "<p>格式说明<br/>猜前四名单式01 02 03 04或01020304<br/>1)每注必须是4个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
//		createSingleLayout("xyft",tips);
//	}else if(val == 'xyft7'){
//		$("#xyft_random").show();
//		var tip1 = "冠军：可选1-10个";
//		var tip2 = "亚军：可选1-10个";
//		var tip3 = "季军：可选1-10个";
//		var tip4 = "第四名：可选1-10个";
//		var tip5 = "第五名：可选1-10个";
//		var tips = [tip1,tip2,tip3,tip4,tip5];
//		xyft_sntuo = 0;
//		xyft_playType = 4;
//		xyft_playMethod = 7;
//		createFiveWinner("xyft",tips,1,10,true,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft8'){
//		$("#xyft_random").hide();
//		$("#xyft_qingkong").hide();
//		xyft_sntuo = 3;
//		xyft_playType = 4;
//		xyft_playMethod = 8;
//		xyft_qingkongAll();
//		var tips = "<p>格式说明<br/>猜前四名单式01 02 03 04 05或0102030405<br/>1)每注必须是4个号码;2)每注之间以逗号、分号、换行符分割;3)只支持单式.</p>";
//		createSingleLayout("xyft",tips);
//	}else if(val == 'xyft9'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 5;
//		xyft_playMethod = 9;
//		var tips = ["冠军","亚军","季军","第四名","第五名"];
//		createFiveWinner("xyft",tips,1,10,true,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft10'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 5;
//		xyft_playMethod = 10;
//		var tips = ["第六名","第七名","第八名","第九名","第十名"];
//		createFiveWinner("xyft",tips,1,10,true,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft11'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 6;
//		xyft_playMethod = 11;
//		var num = ["大","小"];
//		createNonNumLayout("xyft",xyft_playMethod,num,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft12'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 6;
//		xyft_playMethod = 12;
//		var num = ["大","小"];
//		createNonNumLayout("xyft",xyft_playMethod,num,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft13'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 6;
//		xyft_playMethod = 13;
//		var num = ["大","小"];
//		createNonNumLayout("xyft",xyft_playMethod,num,function(){
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft14'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 7;
//		xyft_playMethod = 14;
//		var num = ["单", "双"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft15'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 7;
//		xyft_playMethod = 15;
//		var num = ["单", "双"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft16'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 7;
//		xyft_playMethod = 16;
//		var num = ["单", "双"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft17'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 8;
//		xyft_playMethod = 17;
//		var num = ["龙", "虎"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft18'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 8;
//		xyft_playMethod = 18;
//		var num = ["龙", "虎"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft19'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 8;
//		xyft_playMethod = 19;
//		var num = ["龙", "虎"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft20'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 9;
//		xyft_playMethod = 20;
//		var num = ["3", "4", "18", "19"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft21'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 9;
//		xyft_playMethod = 21;
//		var num = ["5", "6", "16", "17"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft22'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 9;
//		xyft_playMethod = 22;
//		var num = ["7", "8", "14", "15"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft23'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 9;
//		xyft_playMethod = 23;
//		var num = ["9", "10", "12", "13"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft24'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 9;
//		xyft_playMethod = 24;
//		var num = ["11"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft25'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 9;
//		xyft_playMethod = 25;
//		var num = ["大", "双"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft26'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 9;
//		xyft_playMethod = 26;
//		var num = ["小", "单"];
//		createNonNumLayout("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft27'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 10;
//		xyft_playMethod = 27;
//		var num = ["龙", "虎"];
//		createNonNumLayout_xyft_lh("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft28'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 10;
//		xyft_playMethod = 28;
//		var num = ["龙", "虎"];
//		createNonNumLayout_xyft_lh("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft29'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 10;
//		xyft_playMethod = 29;
//		var num = ["龙", "虎"];
//		createNonNumLayout_xyft_lh("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft30'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 10;
//		xyft_playMethod = 30;
//		var num = ["龙", "虎"];
//		createNonNumLayout_xyft_lh("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}else if(val == 'xyft31'){
//		$("#xyft_random").show();
//		xyft_sntuo = 0;
//		xyft_playType = 10;
//		xyft_playMethod = 31;
//		var num = ["龙", "虎"];
//		createNonNumLayout_xyft_lh("xyft", xyft_playMethod, num, function () {
//			xyft_calcNotes();
//		});
//		xyft_qingkongAll();
//	}
//	
//	
//	if(xyftScroll){
//		xyftScroll.refresh();
//		xyftScroll.scrollTo(0,0,1);
//	}
//
//	initFooterData("xyft",temp);
//	hideRandomWhenLi("xyft",xyft_sntuo,xyft_playMethod);
//	xyft_calcNotes();
//}
//
///**
// * [xyft_initFooterButton 初始化底部Button显示隐藏]
// * @return {[type]} [description]
// */
//function xyft_initFooterButton(){
//	if(xyft_playMethod == 1 || xyft_playMethod == 0){
//		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0) {
//			$("#xyft_qingkong").css("opacity",1.0);
//		}else{
//			$("#xyft_qingkong").css("opacity",0.4);
//		}
//	}else if(xyft_playMethod == 3){
//		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
//			|| LotteryStorage["xyft"]["line3"].length > 0) {
//			$("#xyft_qingkong").css("opacity",1.0);
//		}else{
//			$("#xyft_qingkong").css("opacity",0.4);
//		}
//	}else if(xyft_playMethod == 5){
//		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
//			|| LotteryStorage["xyft"]["line3"].length > 0 || LotteryStorage["xyft"]["line4"].length > 0) {
//			$("#xyft_qingkong").css("opacity",1.0);
//		}else{
//			$("#xyft_qingkong").css("opacity",0.4);
//		}
//	}else if(xyft_playMethod == 7){
//		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
//			|| LotteryStorage["xyft"]["line3"].length > 0 || LotteryStorage["xyft"]["line4"].length > 0 || LotteryStorage["xyft"]["line5"].length > 0) {
//			$("#xyft_qingkong").css("opacity",1.0);
//		}else{
//			$("#xyft_qingkong").css("opacity",0.4);
//		}
//	}else if(xyft_playType == 5){
//		if (LotteryStorage["xyft"]["line1"].length > 0 || LotteryStorage["xyft"]["line2"].length > 0
//			|| LotteryStorage["xyft"]["line3"].length > 0 || LotteryStorage["xyft"]["line4"].length > 0 || LotteryStorage["xyft"]["line5"].length > 0) {
//			$("#xyft_qingkong").css("opacity",1.0);
//		}else{
//			$("#xyft_qingkong").css("opacity",0.4);
//		}
//	}else if(xyft_playType == 6 || xyft_playType == 7 || xyft_playType == 8 || xyft_playType == 9|| xyft_playType == 10){
//		if(LotteryStorage["xyft"]["line1"].length > 0){
//			$("#xyft_qingkong").css("opacity",1.0);
//		}else{
//			$("#xyft_qingkong").css("opacity",0.4);
//		}
//	}else{
//		$("#xyft_qingkong").css("opacity",0);
//	}
//
//	if($("#xyft_qingkong").css("opacity") == "0"){
//		$("#xyft_qingkong").css("display","none");
//	}else{
//		$("#xyft_qingkong").css("display","block");
//	}
//
//	if($('#xyft_zhushu').html() > 0){
//		$("#xyft_queding").css("opacity",1.0);
//	}else{
//		$("#xyft_queding").css("opacity",0.4);
//	}
//}
//
///**
// * @Author:      admin
// * @DateTime:    2014-12-13 14:40:19
// * @Description: 清空所有记录
// */
//function xyft_qingkongAll(){
//	$("#xyft_ballView span").removeClass('redBalls_active');
//	LotteryStorage["xyft"]["line1"] = [];
//	LotteryStorage["xyft"]["line2"] = [];
//	LotteryStorage["xyft"]["line3"] = [];
//	LotteryStorage["xyft"]["line4"] = [];
//	LotteryStorage["xyft"]["line5"] = [];
//	localStorageUtils.removeParam("xyft_line1");
//	localStorageUtils.removeParam("xyft_line2");
//	localStorageUtils.removeParam("xyft_line3");
//	localStorageUtils.removeParam("xyft_line4");
//	localStorageUtils.removeParam("xyft_line5");
//
//	$('#xyft_zhushu').text(0);
//	$('#xyft_money').text(0);
//	clearAwardWin("xyft");
//	xyft_initFooterButton();
//}
//
///**
// * [xyft_calcNotes 计算注数]
// * @return {[type]} [description]
// */
//function xyft_calcNotes(){
//	$('#xyft_modeId').blur();
//	$('#xyft_fandian').blur();
//	
//	var notes = 0;
//	if(xyft_playMethod == 0 || xyft_playType == 6 || xyft_playType == 7 || xyft_playType == 8 || xyft_playType == 9|| xyft_playType == 10){
//		notes = LotteryStorage["xyft"]["line1"].length;
//	}else if(xyft_playMethod == 1 ) {
//		for(var i = 0;i < LotteryStorage["xyft"]["line1"].length; i++){
//			var flag = false;
//			for(var j = 0;j < LotteryStorage["xyft"]["line2"].length; j++){
//				if(LotteryStorage["xyft"]["line1"][i] == LotteryStorage["xyft"]["line2"][j]){
//					flag = true;
//				}
//			}
//			if(flag){
//				notes += (LotteryStorage["xyft"]["line2"].length - 1);
//			}else{
//				notes += LotteryStorage["xyft"]["line2"].length;
//			}
//		}
//	}else if(xyft_playType == 5){
//		notes = LotteryStorage["xyft"]["line1"].length + LotteryStorage["xyft"]["line2"].length + LotteryStorage["xyft"]["line3"].length
//			+ LotteryStorage["xyft"]["line4"].length + LotteryStorage["xyft"]["line5"].length;
//	}else if(xyft_playMethod == 3){
//		for(var i = 0;i < LotteryStorage["xyft"]["line1"].length; i++){
//			for(var j = 0;j < LotteryStorage["xyft"]["line2"].length; j++){
//				for(var k = 0;k < LotteryStorage["xyft"]["line3"].length; k++){
//					if(LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line2"][j] &&
//						LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line3"][k]
//						&& LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line3"][k]){
//						notes++;
//					}
//				}
//			}
//		}
//	}else if(xyft_playMethod == 5){
//		for(var i = 0;i < LotteryStorage["xyft"]["line1"].length; i++){
//			for(var j = 0;j < LotteryStorage["xyft"]["line2"].length; j++){
//				for(var k = 0;k < LotteryStorage["xyft"]["line3"].length; k++){
//					for(var m = 0;m < LotteryStorage["xyft"]["line4"].length; m++){
//						if(LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line2"][j] &&
//						LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line3"][k]&&
//						LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line4"][m]&&
//						LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line3"][k]&&
//						LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line4"][m]&&
//						LotteryStorage["xyft"]["line3"][k] != LotteryStorage["xyft"]["line4"][m]){
//						notes++;
//						}
//					}
//				}
//			}
//		}
//	}else if(xyft_playMethod == 7){
//		for(var i = 0;i < LotteryStorage["xyft"]["line1"].length; i++){
//			for(var j = 0;j < LotteryStorage["xyft"]["line2"].length; j++){
//				for(var k = 0;k < LotteryStorage["xyft"]["line3"].length; k++){
//					for(var m = 0;m < LotteryStorage["xyft"]["line4"].length; m++){
//						for(var n = 0;n < LotteryStorage["xyft"]["line5"].length; n++){
//							if(LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line2"][j] &&
//							LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line3"][k]&&
//							LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line4"][m]&&
//							LotteryStorage["xyft"]["line1"][i] != LotteryStorage["xyft"]["line5"][n]&&
//							LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line3"][k]&&
//							LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line4"][m]&&
//							LotteryStorage["xyft"]["line2"][j] != LotteryStorage["xyft"]["line5"][n]&&
//							LotteryStorage["xyft"]["line3"][k] != LotteryStorage["xyft"]["line4"][m]&&
//							LotteryStorage["xyft"]["line3"][k] != LotteryStorage["xyft"]["line5"][n]&&
//							LotteryStorage["xyft"]["line4"][m] != LotteryStorage["xyft"]["line5"][n]){
//							notes++;
//							}
//						}
//					}
//				}
//			}
//		}
//	}else{//单式
//		notes = xyftValidateData('onblur');
//	}
//
//	hideRandomWhenLi("xyft",xyft_sntuo,xyft_playMethod);
//
//	//验证是否为空
//	if( $("#xyft_beiNum").val() =="" || parseInt($("#xyft_beiNum").val()) == 0){
//		$("#xyft_beiNum").val(1);
//	}
//
//	//验证慢彩最大倍数为9999
//	if($("#xyft_beiNum").val() > parseInt(localStorageUtils.getParam("MaxBetMultiple"))){
//		$("#xyft_beiNum").val(parseInt(localStorageUtils.getParam("MaxBetMultiple")));
//	}
//	if(notes > 0) {
//		$('#xyft_zhushu').text(notes);
//		if($("#xyft_modeId").val() == "8"){
//			$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.002));
//		}else if ($("#xyft_modeId").val() == "2"){
//			$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.2));
//		}else if ($("#xyft_modeId").val() == "1"){
//			$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.02));
//		}else{
//			$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),2));
//		}
//
//	} else {
//		$('#xyft_zhushu').text(0);
//		$('#xyft_money').text(0);
//	}
//	xyft_initFooterButton();
//	// 计算奖金盈利
//	calcAwardWin('xyft',xyft_playMethod);
//}
//
///**
// * [xyft_randomOne 随机一注]
// * @return {[type]} [description]
// */
//function xyft_randomOne(){
//	xyft_qingkongAll();
//	if(xyft_playType == 0){
//		var number = mathUtil.getRandomNum(1,11);
//		LotteryStorage["xyft"]["line1"].push(number > 9 ? number+"" : "0"+number);
//
//		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(xyft_playMethod == 1){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(2,redBallArray);
//		LotteryStorage["xyft"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
//		LotteryStorage["xyft"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
//		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line2"], function(k, v){
//			$("#" + "xyft_line2" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(xyft_playMethod == 3){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(3,redBallArray);
//		LotteryStorage["xyft"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
//		LotteryStorage["xyft"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
//		LotteryStorage["xyft"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
//		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line2"], function(k, v){
//			$("#" + "xyft_line2" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line3"], function(k, v){
//			$("#" + "xyft_line3" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(xyft_playMethod == 5){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(4,redBallArray);
//		LotteryStorage["xyft"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
//		LotteryStorage["xyft"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
//		LotteryStorage["xyft"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
//		LotteryStorage["xyft"]["line4"].push(array[3] > 9 ? array[3]+"" : "0"+array[3]);
//		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line2"], function(k, v){
//			$("#" + "xyft_line2" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line3"], function(k, v){
//			$("#" + "xyft_line3" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line4"], function(k, v){
//			$("#" + "xyft_line4" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(xyft_playMethod == 7){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(5,redBallArray);
//		LotteryStorage["xyft"]["line1"].push(array[0] > 9 ? array[0]+"" : "0"+array[0]);
//		LotteryStorage["xyft"]["line2"].push(array[1] > 9 ? array[1]+"" : "0"+array[1]);
//		LotteryStorage["xyft"]["line3"].push(array[2] > 9 ? array[2]+"" : "0"+array[2]);
//		LotteryStorage["xyft"]["line4"].push(array[3] > 9 ? array[3]+"" : "0"+array[3]);
//		LotteryStorage["xyft"]["line5"].push(array[4] > 9 ? array[4]+"" : "0"+array[4]);
//		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line2"], function(k, v){
//			$("#" + "xyft_line2" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line3"], function(k, v){
//			$("#" + "xyft_line3" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line4"], function(k, v){
//			$("#" + "xyft_line4" + parseInt(v)).toggleClass("redBalls_active");
//		});
//		$.each(LotteryStorage["xyft"]["line5"], function(k, v){
//			$("#" + "xyft_line5" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(xyft_playType == 5){
//		var line = mathUtil.getRandomNum(1,6);
//		var number = mathUtil.getRandomNum(1,11);
//		LotteryStorage["xyft"]["line"+line].push(number > 9 ? number+"" : "0"+number);
//
//		$.each(LotteryStorage["xyft"]["line"+line], function(k, v){
//			$("#" + "xyft_line"+line + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(xyft_playType == 6 || xyft_playType == 7 || xyft_playType == 8 || xyft_playType == 10){
//		var number = mathUtil.getRandomNum(0,2);
//		LotteryStorage["xyft"]["line1"].push(number > 9 ? number+"" : "0"+number);
//
//		$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//			$("#" + "xyft_line1" + parseInt(v)).toggleClass("redBalls_active");
//		});
//	}else if(xyft_playType == 9){
//		if(xyft_playMethod == 20){
//			var contentArr = ["3","4","18","19"];
//			var number = mathUtil.getRandomNum(0,4);
//			LotteryStorage["xyft"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(xyft_playMethod == 21){
//			var contentArr = ["5","6","16","17"];
//			var number = mathUtil.getRandomNum(0,4);
//			LotteryStorage["xyft"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(xyft_playMethod == 22){
//			var contentArr = ["7","8","14","15"];
//			var number = mathUtil.getRandomNum(0,4);
//			LotteryStorage["xyft"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(xyft_playMethod == 23){
//			var contentArr = ["9","10","12","13"];
//			var number = mathUtil.getRandomNum(0,4);
//			LotteryStorage["xyft"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(xyft_playMethod == 24){
//			var contentArr = ["11"];
//			var number = mathUtil.getRandomNum(0,1);
//			LotteryStorage["xyft"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(xyft_playMethod == 25 ){
//			var contentArr = ["0","3"];
//			var number = mathUtil.getRandomNum(0,2);
//			LotteryStorage["xyft"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}else if(xyft_playMethod == 26){
//			var contentArr = ["1","2"];
//			var number = mathUtil.getRandomNum(0,2);
//			LotteryStorage["xyft"]["line1"].push(contentArr[number]);
//
//			$.each(LotteryStorage["xyft"]["line1"], function(k, v){
//				$("#" + "xyft_line1" + parseInt(number)).toggleClass("redBalls_active");
//			});
//		}
//	}
//	xyft_calcNotes();
//}
//
///**
// * 出票机选
// * @param playMethod
// */
//function xyft_checkOutRandom(playMethod){
//	var obj = new Object();
//	if(xyft_playType == 0){
//		var number = mathUtil.getRandomNum(1,11);
//		obj.nums = number < 10 ? "0"+number : number;
//		obj.notes = 1;
//	}else if(xyft_playMethod == 1){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(2,redBallArray);
//		$.each(array,function(index){
//			if(array[index] < 10){
//				array[index] = "0"+array[index];
//			}
//		});
//		obj.nums = array.join("|");
//		obj.notes = 1;
//	}else if(xyft_playMethod == 3){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(3,redBallArray);
//		$.each(array,function(index){
//			if(array[index] < 10){
//				array[index] = "0"+array[index];
//			}
//		});
//		obj.nums = array.join("|");
//		obj.notes = 1;
//	}else if(xyft_playType == 5){
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
//	}else if(xyft_playType == 6){
//		var number = mathUtil.getRandomNum(0,2);
//		obj.nums = number == 0 ? "大" : "小";
//		obj.notes = 1;
//	}else if(xyft_playType == 7){
//		var number = mathUtil.getRandomNum(0,2);
//		obj.nums = number == 0 ? "单" : "双";
//		obj.notes = 1;
//	}else if(xyft_playType == 8 || xyft_playType == 10){
//		var number = mathUtil.getRandomNum(0,2);
//		obj.nums = number == 0 ? "龙" : "虎";
//		obj.notes = 1;
//	}else if(xyft_playType == 9){
//		if(xyft_playMethod == 20){
//			var contentArr = ["3","4","18","19"];
//			var number = mathUtil.getRandomNum(0,4);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(xyft_playMethod == 21){
//			var contentArr = ["5","6","16","17"];
//			var number = mathUtil.getRandomNum(0,4);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(xyft_playMethod == 22){
//			var contentArr = ["7","8","14","15"];
//			var number = mathUtil.getRandomNum(0,4);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(xyft_playMethod == 23){
//			var contentArr = ["9","10","12","13"];
//			var number = mathUtil.getRandomNum(0,4);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(xyft_playMethod == 24){
//			var contentArr = ["11"];
//			var number = mathUtil.getRandomNum(0,1);
//			obj.nums = contentArr[number];
//			obj.notes = 1;
//		}else if(xyft_playMethod == 25){
//			var number = mathUtil.getRandomNum(0,2);
//			obj.nums = number == 0 ? "大" : "双";
//			obj.notes = 1;
//		}else if(xyft_playMethod == 26){
//			var number = mathUtil.getRandomNum(0,2);
//			obj.nums = number == 0 ? "小" : "单";
//			obj.notes = 1;
//		}
//	}else if(xyft_playMethod == 5){
//		var redBallArray = mathUtil.getInts(1,10);
//		var array = mathUtil.getDifferentNums(4,redBallArray);
//		$.each(array,function(index){
//			if(array[index] < 10){
//				array[index] = "0"+array[index];
//			}
//		});
//		obj.nums = array.join("|");
//		obj.notes = 1;
//	}else if(xyft_playMethod == 7){
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
//	obj.sntuo = xyft_sntuo;
//	obj.multiple = 1;
//	obj.rebates = xyft_rebate;
//	obj.playMode = "4";
//	obj.money = bigNumberUtil.multiply(obj.notes,2).toString();
//	calcAwardWin('xyft',xyft_playMethod,obj);  //机选奖金计算
//	obj.award = $('#xyft_minAward').html();     //奖金
//	obj.maxAward = $('#xyft_maxAward').html();  //多级奖金
//	return obj;
//}
//
//
///**
// * [xyft_submitData 确认提交数据]
// * @return {[type]} [description]
// */
//function xyft_submitData(){
//	var submitParams = new LotterySubmitParams();
//	$("#xyft_queding").bind('click', function(event) {
//		xyft_rebate = $("#xyft_fandian option:last").val();
//		if(parseInt($('#xyft_zhushu').html()) <= 0 || Number($("#xyft_money").html()) <= 0){
//			toastUtils.showToast('请至少选择一注');
//			return;
//		}
//		xyft_calcNotes();
//
//		//后台控制是否可以投注
//		if(!check_AgentCanBetting()) return;
//
//		//设置单笔最低投注额
//		if(!check_SingleBettingAmount(golba_PageName() + "_money")) return;
//
//		/*if(parseInt($('#xyft_modeId').val()) == 8){
//			if (Number($('#xyft_money').html()) < 0.02){
//				toastUtils.showToast('请至少选择0.02元');
//				return;
//			}
//		}*/
//
//		//提示单挑奖金
//		getDanTiaoBonus('xyft',xyft_playMethod);
//
//		submitParams.lotteryType = "xyft";
//		var playType = LotteryInfo.getPlayName("xyft",xyft_playType);
//		submitParams.playType = playType;
//		submitParams.playMethod = LotteryInfo.getMethodName("xyft",xyft_playMethod);
//		submitParams.playTypeIndex = xyft_playType;
//		submitParams.playMethodIndex = xyft_playMethod;
//		var selectedBalls = [];
//
//		if (xyft_playType == 0 || xyft_playType == 6 || xyft_playType == 7 || xyft_playType == 8 || xyft_playType == 9 || xyft_playType == 10) {
//			$("#xyft_ballView div.ballView").each(function(){
//				$(this).find("span.redBalls_active").each(function(){
//					selectedBalls.push($(this).text());
//				});
//			});
//			submitParams.nums = selectedBalls.join(",");
//		}else if(xyft_playType == 1 || xyft_playType == 2|| xyft_playType == 3|| xyft_playType == 4){
//			if(xyft_playMethod == 1 || xyft_playMethod == 3|| xyft_playMethod == 5|| xyft_playMethod == 7){
//				$("#xyft_ballView div.ballView").each(function(){
//					var arr = [];
//					$(this).find("span.redBalls_active").each(function(){
//						arr.push($(this).text());
//					});
//					selectedBalls.push(arr.join(","));
//				});
//				submitParams.nums = selectedBalls.join("|");
//			}else{//单式
//				//去错误号
//				xyftValidateData("submit");
//				var arr = $("#xyft_single").val().split(",");
//				for(var i = 0;i<arr.length;i++){
//					if(arr[i].split(' ').length<2){
//						if(xyft_playMethod == 2){
//							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4);
//						}else if(xyft_playMethod == 4){
//							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6);
//						}else if(xyft_playMethod == 6){
//							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8);
//						}else if(xyft_playMethod == 8){
//							arr[i]=arr[i].split(' ')[0].slice(0,2) +" "+arr[i].split(' ')[0].slice(2,4)+" "+arr[i].split(' ')[0].slice(4,6)+" "+arr[i].split(' ')[0].slice(6,8)+" "+arr[i].split(' ')[0].slice(8,10);
//						}
//					}
//				}
//				var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
//				submitParams.nums = str;
//			}
//		}else if(xyft_playType == 5) {
//			$("#xyft_ballView div.ballView").each(function(){
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
//			xyftValidateData("submit");
//			var arr = $("#xyft_single").val().split(",");
//			var str = arr.join(',').replace(new RegExp(/\s+/g),'|').replace(new RegExp(/,+/g),' ');
//			submitParams.nums = str;
//		}
//		localStorageUtils.setParam("playMode",$("#xyft_modeId").val());
//		localStorageUtils.setParam("playBeiNum",$("#xyft_beiNum").val());
//		localStorageUtils.setParam("playFanDian",$("#xyft_fandian").val());
//		submitParams.notes = $('#xyft_zhushu').html();
//		submitParams.sntuo = xyft_sntuo;
//		submitParams.multiple = $('#xyft_beiNum').val();  //requirement
//		submitParams.rebates = $('#xyft_fandian').val();  //requirement
//		submitParams.playMode = $('#xyft_modeId').val();  //requirement
//		submitParams.money = $('#xyft_money').html();  //requirement
//		submitParams.award = $('#xyft_minAward').html();  //奖金
//		submitParams.maxAward = $('#xyft_maxAward').html();  //多级奖金
//		submitParams.submit();
//		$("#xyft_ballView").empty();
//		xyft_qingkongAll();
//	});
//}
//
//
///**
// * [xyftValidateData 单式数据验证]
// */
//function xyftValidateData(type){
//	if (typeof type == "undefined"){type = "onblur"}
//	var textStr = $("#xyft_single").val();
//	var str = textStr.replace(new RegExp(/,+|，+|;+|；+|\n+/g),',');
//	var result,
//		content = {};
//	if(xyft_playMethod == 2){
//		content.str = str;
//		content.weishu = 5;
//		content.zhiXuan = true;
//		content.maxNum = 10;
//		result = handleSingleStr_deleteErr(content,type);
//	}else if(xyft_playMethod == 4){
//		content.str = str;
//		content.weishu = 8;
//		content.zhiXuan = true;
//		content.maxNum = 10;
//		result = handleSingleStr_deleteErr(content,type);
//	}else if(xyft_playMethod == 6){
//		content.str = str;
//		content.weishu = 11;
//		content.zhiXuan = true;
//		content.maxNum = 11;
//		result = handleSingleStr_deleteErr(content,type);
//	}else if(xyft_playMethod == 8){
//		content.str = str;
//		content.weishu = 14;
//		content.zhiXuan = true;
//		content.maxNum = 14;
//		result = handleSingleStr_deleteErr(content,type);
//	}
//
//	$('#xyft_delRepeat').off('click');
//	$('#xyft_delRepeat').on('click',function () {
//		content.str = $('#xyft_single').val() ? $('#xyft_single').val().replace(new RegExp(/,+|，+|;+|；+|\n+/g),',') : '';
//		var rptResult = handleSingleStr_deleteRepeat(content);
//		var array = rptResult.num || [];
//		notes = rptResult.length;
//		xyftShowFooter(true,notes);
//		$("#xyft_single").val(array.join(","));
//	});
//
//	$("#xyft_single").val(result.num.join(","));
//	var notes = result.length;
//	xyftShowFooter(true,notes);
//	return notes;
//}
//
//function xyftShowFooter(isValid,notes){
//	$('#xyft_zhushu').text(notes);
//	if($("#xyft_modeId").val() == "8"){
//		$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.002));
//	}else if ($("#xyft_modeId").val() == "2"){
//		$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.2));
//	}else if ($("#xyft_modeId").val() == "1"){
//		$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),0.02));
//	}else{
//		$('#xyft_money').text(bigNumberUtil.multiply(notes * parseInt($("#xyft_beiNum").val()),2));
//	}
//	if(!isValid){
//		toastUtils.showToast('格式不正确');
//	}
//	xyft_initFooterButton();
//	calcAwardWin('xyft',xyft_playMethod);  //计算奖金和盈利
//}
//
