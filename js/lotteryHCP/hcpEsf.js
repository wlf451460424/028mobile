var hcpesf_playType = 0;
var hcpesf_playMethod = 0;
var hcpesf_rebate;
var hcpesfScroll;
var zhushu;
//进入这个页面时调用
function hcpEsfPageLoadedPanel() {
	catchErrorFun("hcp_esf_init();");
}

//离开这个页面时调用
function hcpEsfPageUnloadedPanel(){
	$("#hcpEsf_queding").off('click');
	$("#hcpEsfPage_back").off('click');
	$("#hcpEsf_ballView").empty();
	$("#hcpEsfSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hcpEsfPlaySelect"></select>');
	$("#hcpEsfSelect").append($select);
	$("#hcpEsf_money").val('');
}

//入口函数
function hcp_esf_init(){
	$("#hcpEsf_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
//	$("#hcpEsf_title").html(current_LottreyId);//测试用；
	
	//玩法初始化；
	for(var i = 0; i< hcp_LotteryInfo.getPlayLength("hcp_esf");i++){
		var $play = $('<optgroup label="'+hcp_LotteryInfo.getPlayName("hcp_esf",i)+'"></optgroup>');
		for(var j = 0; j < hcp_LotteryInfo.getMethodLength("hcp_esf");j++){
			if(hcp_LotteryInfo.getMethodTypeId("hcp_esf",j) == hcp_LotteryInfo.getPlayTypeId("hcp_esf",i)){
				var name = hcp_LotteryInfo.getMethodName("hcp_esf",j);
				if(i == hcpesf_playType && j == hcpesf_playMethod){
					$play.append('<option value="hcpesf'+hcp_LotteryInfo.getMethodIndex("hcp_esf",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hcpesf'+hcp_LotteryInfo.getMethodIndex("hcp_esf",j)+'">' + name +'</option>');
				}
			}
		}
		$("#hcpEsfPlaySelect").append($play);
	}
	
	[].slice.call( document.getElementById("hcpEsfSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hcpesfChangeItem
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
	
	//获取每个玩法下的返点列表；
	hcp_getLotteryInfo(current_LottreyId,function (){
		hcpesfChangeItem("hcpesf"+hcpesf_playMethod);
	});

	//添加滑动条
	if(!hcpesfScroll){
		hcpesfScroll = new IScroll('#hcpEsfContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}
	
	//获取期号
	hcp_getQihao("hcpEsf",current_LottreyId);
	
	//获取上一期开奖
	hcp_queryLastPrize("hcpEsf",current_LottreyId);
	
	//机选选号
	$("#hcpEsf_random").off('click');
	$("#hcpEsf_random").on('click', function(event) {
		hcpesf_randomOne();
	});
	
	//返回
	$("#hcpEsfPage_back").on('click', function(event) {
		hcpesf_playType = 0;
		hcpesf_playMethod = 0;
		$("#hcpEsf_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hcpEsf_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
		
		hcp_checkoutResult=[];
	});
	
	//清空
	hcp_qingKong("hcpEsf","hcpEsf");
	
	//提交
    $("#hcpEsf_queding").off('click');
    $("#hcpEsf_queding").on('click', function(event) {
        hcpesf_submitData();
    });
}

function hcpesfChangeItem(val) {
	hcpEsf_qingkongAll();
	var temp = val.substring("hcpesf".length,val.length);

	if(val == "hcpesf0"){
		//两面盘
		$("#hcpEsf_random").show();
		hcpesf_playType = 0;
		hcpesf_playMethod = 0;
		hcpEsf_createFiveLineLayout("hcpEsf", function(){
			//计算注数；
			hcpesf_calcNotes();
		});
		hcpEsf_qingkongAll();
	}else if(val == "hcpesf1"){
		//单号
		$("#hcpEsf_random").show();
		hcpesf_playType = 0;
		hcpesf_playMethod = 1;
		hcpEsf_createFiveLineSingleNumLayout("hcpEsf", function(){
			//计算注数；
			hcpesf_calcNotes();
		});
		hcpEsf_qingkongAll();
	}else if(val == "hcpesf2"){
		//龙虎斗
		$("#hcpEsf_random").show();
		hcpesf_playType = 0;
		hcpesf_playMethod = 2;
		hcpEsf_LonghudouLayout("hcpEsf", function(){
			//计算注数；
			hcpesf_calcNotes();
		});
		hcpEsf_qingkongAll();
	}else if(val == "hcpesf3"){
		//全5中1 
		$("#hcpEsf_random").show();
		hcpesf_playType = 0;
		hcpesf_playMethod = 3;
		hcpEsf_OneLineLayout("hcpEsf", function(){
			//计算注数；
			hcpesf_calcNotes();
		});
		hcpEsf_qingkongAll();
	}
	
	if(hcpesfScroll){
		hcpesfScroll.refresh();
	}
	
	hcpesf_calcNotes();
	initLossPercent("hcpEsf");
	
	if(localStorageUtils.getParam("playFanDian")!=null && localStorageUtils.getParam("playFanDian")!= undefined){
		var Unite_rebate=new Object();
		Unite_rebate.value = localStorageUtils.getParam("playFanDian");
		//@ 计算赔率金额 
		hcpEsf_calcRate(Unite_rebate);
	}
	
	localStorageUtils.setParam("MaxFanDian",$("#hcpEsf_lossPercent option:last").val()) ;
}

//清空所有记录
function  hcpEsf_qingkongAll(){
	$("#hcpEsf_ballView span").removeClass('hcp_redBalls_active');
	$("#hcpEsf_ballView span").removeClass('hcp_redBalls_property_active');
	hcp_LotteryStorage["hcpEsf"]["line1"] = [];
	hcp_LotteryStorage["hcpEsf"]["line2"] = [];
	hcp_LotteryStorage["hcpEsf"]["line3"] = [];
	hcp_LotteryStorage["hcpEsf"]["line4"] = [];
	hcp_LotteryStorage["hcpEsf"]["line5"] = [];
	hcp_LotteryStorage["hcpEsf"]["line6"] = [];
	hcp_LotteryStorage["hcpEsf"]["line7"] = [];
	hcp_LotteryStorage["hcpEsf"]["line8"] = [];
	hcp_LotteryStorage["hcpEsf"]["line9"] = [];
	hcp_LotteryStorage["hcpEsf"]["line10"] = [];

	localStorageUtils.removeParam("hcpEsf_line1");
	localStorageUtils.removeParam("hcpEsf_line2");
	localStorageUtils.removeParam("hcpEsf_line3");
	localStorageUtils.removeParam("hcpEsf_line4");
	localStorageUtils.removeParam("hcpEsf_line5");
	localStorageUtils.removeParam("hcpEsf_line6");
	localStorageUtils.removeParam("hcpEsf_line7");
	localStorageUtils.removeParam("hcpEsf_line8");
	localStorageUtils.removeParam("hcpEsf_line9");
	localStorageUtils.removeParam("hcpEsf_line10");

	hcpesf_calcNotes();
	
	$("#hcpEsf_money").val("");
}

/**
 * [cqssc_calcNotes 计算注数]
 */
function hcpesf_calcNotes(){
	var notes = 0;

	if(hcpesf_playMethod == 0){
		notes = hcp_LotteryStorage["hcpEsf"]["line1"].length +
			hcp_LotteryStorage["hcpEsf"]["line2"].length +
			hcp_LotteryStorage["hcpEsf"]["line3"].length +
			hcp_LotteryStorage["hcpEsf"]["line4"].length +
			hcp_LotteryStorage["hcpEsf"]["line5"].length +
			hcp_LotteryStorage["hcpEsf"]["line6"].length +
			hcp_LotteryStorage["hcpEsf"]["line7"].length +
			hcp_LotteryStorage["hcpEsf"]["line8"].length;
	}else if(hcpesf_playMethod == 1){
		notes = hcp_LotteryStorage["hcpEsf"]["line1"].length +
			hcp_LotteryStorage["hcpEsf"]["line2"].length +
			hcp_LotteryStorage["hcpEsf"]["line3"].length +
			hcp_LotteryStorage["hcpEsf"]["line4"].length +
			hcp_LotteryStorage["hcpEsf"]["line5"].length;
	}else if(hcpesf_playMethod == 2){
		notes = hcp_LotteryStorage["hcpEsf"]["line1"].length +
			hcp_LotteryStorage["hcpEsf"]["line2"].length +
			hcp_LotteryStorage["hcpEsf"]["line3"].length +
			hcp_LotteryStorage["hcpEsf"]["line4"].length +
			hcp_LotteryStorage["hcpEsf"]["line5"].length +
			hcp_LotteryStorage["hcpEsf"]["line6"].length +
			hcp_LotteryStorage["hcpEsf"]["line7"].length +
			hcp_LotteryStorage["hcpEsf"]["line8"].length +
			hcp_LotteryStorage["hcpEsf"]["line9"].length +
			hcp_LotteryStorage["hcpEsf"]["line10"].length;
	}else if(hcpesf_playMethod == 3){
		notes = hcp_LotteryStorage["hcpEsf"]["line1"].length;
	}
	
	zhushu = notes;
	
	//底部Button显示隐藏
	hcpesf_initFooterButton();
}


/**
 * [esf_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hcpesf_initFooterButton(){
	if(hcpesf_playMethod == 0){
		if(hcp_LotteryStorage["hcpEsf"]["line1"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line3"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line5"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line6"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line7"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line8"].length > 0){
			$("#hcpEsf_qingkong").css("opacity",1.0);
		}else{
			$("#hcpEsf_qingkong").css("opacity",0.4);
		}
	}else if(hcpesf_playMethod == 1){
		if(hcp_LotteryStorage["hcpEsf"]["line1"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line3"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line5"].length > 0){
			$("#hcpEsf_qingkong").css("opacity",1.0);
		}else{
			$("#hcpEsf_qingkong").css("opacity",0.4);
		}
	}else if(hcpesf_playMethod == 2){
		if(hcp_LotteryStorage["hcpEsf"]["line1"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line3"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line5"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line6"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line7"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line8"].length > 0 ||
			hcp_LotteryStorage["hcpEsf"]["line9"].length > 0 || hcp_LotteryStorage["hcpEsf"]["line10"].length > 0){
			$("#hcpEsf_qingkong").css("opacity",1.0);
		}else{
			$("#hcpEsf_qingkong").css("opacity",0.4);
		}
	}else if(hcpesf_playMethod == 3 ){
		if(hcp_LotteryStorage["hcpEsf"]["line1"].length > 0){
			$("#hcpEsf_qingkong").css("opacity",1.0);
		}else{
			$("#hcpEsf_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hcpEsf_qingkong").css("opacity",0);
	}
	
	if($("#hcpEsf_qingkong").css("opacity") == "0"){
		$("#hcpEsf_qingkong").css("display","none");
	}else{
		$("#hcpEsf_qingkong").css("display","block");
	}

	if(zhushu > 0){
		$("#hcpEsf_queding").css("opacity",1.0);
	}else{
		$("#hcpEsf_queding").css("opacity",0.4);
	}
}

/**
 * [esf_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hcpesf_submitData(){
	var submitParams = new hcp_LotterySubmitParams();
	
		if(zhushu <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hcpesf_calcNotes();
		
		//添加玩法位数描述
		hcpesf_SelectionNumberDescription();
		
		submitParams.lotteryType = "hcpEsf";
		var play = hcp_LotteryInfo.getPlayName("hcp_esf",hcpesf_playType);//eg:盘口玩法
		var playMethod = hcp_LotteryInfo.getMethodName("hcp_esf",hcpesf_playMethod);//eg:整合
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = hcpesf_playType;
		submitParams.playMethodIndex = hcpesf_playMethod;
		var selectedBalls = [];
		if(hcpesf_playMethod == 0 ){//两面盘
			submitParams.nums = [hcp_LotteryStorage["hcpEsf"]["line1"],hcp_LotteryStorage["hcpEsf"]["line2"],hcp_LotteryStorage["hcpEsf"]["line3"],hcp_LotteryStorage["hcpEsf"]["line4"],hcp_LotteryStorage["hcpEsf"]["line5"],hcp_LotteryStorage["hcpEsf"]["line6"],hcp_LotteryStorage["hcpEsf"]["line7"],hcp_LotteryStorage["hcpEsf"]["line8"]];
		}else if(hcpesf_playMethod == 1 ){//单号
			submitParams.nums = [hcp_LotteryStorage["hcpEsf"]["line1"],hcp_LotteryStorage["hcpEsf"]["line2"],hcp_LotteryStorage["hcpEsf"]["line3"],hcp_LotteryStorage["hcpEsf"]["line4"],hcp_LotteryStorage["hcpEsf"]["line5"]];
		}else if(hcpesf_playMethod == 2 ){//龙虎斗
			submitParams.nums = [hcp_LotteryStorage["hcpEsf"]["line1"],hcp_LotteryStorage["hcpEsf"]["line2"],hcp_LotteryStorage["hcpEsf"]["line3"],hcp_LotteryStorage["hcpEsf"]["line4"],hcp_LotteryStorage["hcpEsf"]["line5"],hcp_LotteryStorage["hcpEsf"]["line6"],hcp_LotteryStorage["hcpEsf"]["line7"],hcp_LotteryStorage["hcpEsf"]["line8"],hcp_LotteryStorage["hcpEsf"]["line9"],hcp_LotteryStorage["hcpEsf"]["line10"]];
		}else if(hcpesf_playMethod == 3 ){//全5 中1
			submitParams.nums = [hcp_LotteryStorage["hcpEsf"]["line1"]];
		}
		localStorageUtils.setParam("playFanDian",$("#hcpEsf_lossPercent").val());
		submitParams.rebates = $('#hcpEsf_lossPercent').val();
		submitParams.money = $("#hcpEsf_money").val();
		submitParams.award = 2001;    //奖金        $('#cqssc_minAward').html()
		submitParams.maxAward = 2005;  //多级奖金     $('#cqssc_maxAward').html()
		submitParams.submit();
		$("#hcpEsf_ballView").empty();
		hcpEsf_qingkongAll();
}

/**
 * [添加玩法位数描述]
 */
function hcpesf_SelectionNumberDescription(){
	var hcpesf_arr = hcp_LotteryStorage["hcpEsf"];
	if(hcpesf_playMethod == 0 )var markArr=["第一球:","第二球:","第三球:","第四球:","第五球:","总和:","上下盘:","奇偶盘:"];
	if(hcpesf_playMethod == 1 )var markArr=["第一球:","第二球:","第三球:","第四球:","第五球:"];
	if(hcpesf_playMethod == 2 )var markArr=["第一球vs第二球:","第一球vs第三球:","第一球vs第四球:","第一球vs第五球:","第二球vs第三球:","第二球vs第四球:","第二球vs第五球:","第三球vs第四球:","第三球vs第五球:","第四球vs第五球:"];
	if(hcpesf_playMethod == 3 )var markArr=["全5中1:"];
	for (var i=0;i<10;i++){
		if(hcpesf_arr["line"+(i+1)].length != 0){
			var item = hcpesf_arr["line"+(i+1)];
			for (var j=0;j<item.length;j++){
				item[j] = markArr[i] +  "_" + item[j];
			}
			hcpesf_arr["line"+(i+1)] = item;
		}
	}
	hcp_LotteryStorage["hcpEsf"] = hcpesf_arr;
}

/**
 * [hcpssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hcpesf_randomOne(){
	//选号
	hcpEsf_Random();
	//计算注数
	hcpesf_calcNotes();
	//提交，跳转出票
	hcpesf_submitData();
}

/**
 * 出票机选
 * @param playMethod
 */
var isCheckOutPage_jixuan= 0;  //0-不是  1-是
function hcpEsf_checkOutRandom(){
	isCheckOutPage_jixuan = 1;
	//选号
	hcpEsf_Random();
	
	//添加玩法位数描述
	hcpesf_SelectionNumberDescription();
	
	var obj = new Object();
	obj.lotteryType = "hcpEsf";
	var play = hcp_LotteryInfo.getPlayName("hcp_esf",hcpesf_playType);//eg:盘口玩法
	var playMethod = hcp_LotteryInfo.getMethodName("hcp_esf",hcpesf_playMethod);//eg:整合
	obj.playType = play;
	obj.playMethod = playMethod;
	obj.playTypeIndex = hcpesf_playType;
	obj.playMethodIndex = hcpesf_playMethod;
	var selectedBalls = [];
	if(hcpesf_playMethod == 0 ){//两面盘
		obj.nums = [hcp_LotteryStorage["hcpEsf"]["line1"],hcp_LotteryStorage["hcpEsf"]["line2"],hcp_LotteryStorage["hcpEsf"]["line3"],hcp_LotteryStorage["hcpEsf"]["line4"],hcp_LotteryStorage["hcpEsf"]["line5"],hcp_LotteryStorage["hcpEsf"]["line6"],hcp_LotteryStorage["hcpEsf"]["line7"],hcp_LotteryStorage["hcpEsf"]["line8"]];
	}else if(hcpesf_playMethod == 1 ){//单号
		obj.nums = [hcp_LotteryStorage["hcpEsf"]["line1"],hcp_LotteryStorage["hcpEsf"]["line2"],hcp_LotteryStorage["hcpEsf"]["line3"],hcp_LotteryStorage["hcpEsf"]["line4"],hcp_LotteryStorage["hcpEsf"]["line5"]];
	}else if(hcpesf_playMethod == 2 ){//龙虎斗
		obj.nums = [hcp_LotteryStorage["hcpEsf"]["line1"],hcp_LotteryStorage["hcpEsf"]["line2"],hcp_LotteryStorage["hcpEsf"]["line3"],hcp_LotteryStorage["hcpEsf"]["line4"],hcp_LotteryStorage["hcpEsf"]["line5"],hcp_LotteryStorage["hcpEsf"]["line6"],hcp_LotteryStorage["hcpEsf"]["line7"],hcp_LotteryStorage["hcpEsf"]["line8"],hcp_LotteryStorage["hcpEsf"]["line9"],hcp_LotteryStorage["hcpEsf"]["line10"]];
	}else if(hcpesf_playMethod == 3 ){//全5 中1
		obj.nums = [hcp_LotteryStorage["hcpEsf"]["line1"]];
	}
	
//	obj.rebates = hcp_defaultBetRebate;  //requirement   $('#cqssc_fandian').val()
	obj.rebates = localStorageUtils.getParam("MaxFanDian");  //requirement   //出票机选  默认最大返点；
	obj.money = "";       //requirement   $('#cqssc_money').html()
	obj.award = 2001;    //奖金        $('#cqssc_minAward').html()
	obj.maxAward = 2005;  //多级奖金     $('#cqssc_maxAward').html()
	return obj;
}

/**
 * 机选 选号
 * @param playMethod
 */
function hcpEsf_Random(){
	hcp_defaultBetRebate = $('#hcpEsf_lossPercent').val();
	
	if(isCheckOutPage_jixuan == 1){
		hcp_defaultBetRebate = localStorageUtils.getParam("MaxFanDian");//出票机选  默认最大返点；
	}
	
	hcpEsf_qingkongAll();
	if(hcpesf_playMethod == 0){//两面盘
		var type_index = Number(mathUtil.getNums(1,6)) + 1;//整合玩法索引；1~7
		if(type_index == 1 || type_index == 2 || type_index == 3 || type_index == 4 || type_index == 5){
			var redBall = mathUtil.getNums(1,4);
			var value;
			if(redBall == 0)value="大";
			if(redBall == 1)value="小";
			if(redBall == 2)value="单";
			if(redBall == 3)value="双";
			var rebate = hcp_lottery_rebate[0].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_esf[type_index].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpEsf"][line_str].push(redBall_info+"");
		}else if(type_index == 6 ){//总和
			var redBall = mathUtil.getNums(1,6);
			var value;
			if(redBall == 0)value="大";
			if(redBall == 1)value="小";
			if(redBall == 2)value="单";
			if(redBall == 3)value="双";
			if(redBall == 4)value="尾大";
			if(redBall == 5)value="尾小";
			var rebate = hcp_lottery_rebate[20+redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_esf[0].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpEsf"][line_str].push(redBall_info+"");
		}
	}else if(hcpesf_playMethod == 1 ){//单号
		var type_index = Number(mathUtil.getNums(1,5)) + 1;//单号玩法索引
		var rebate = hcp_lottery_rebate[26].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall = mathUtil.getNums(1,11);
		var redBall_info = (Number(redBall[0])+1) + "_" + current_LottreyId + hcp_playCode_esf[5+type_index].play_code[redBall]+"_"+_rebate_value;
		var line_str = "line" + type_index;
		hcp_LotteryStorage["hcpEsf"][line_str].push(redBall_info+"");
	}else if(hcpesf_playMethod == 2 ){//龙虎斗
		var type_index = Number(mathUtil.getNums(1,10)) + 1;//龙虎斗玩法索引；1~7
		var redBall = mathUtil.getNums(1,2);
		var value;
		if(redBall == 0)value="龙";
		if(redBall == 1)value="虎";
		var rebate = hcp_lottery_rebate[81 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var _playcode = hcp_playCode_esf[11].play_code.slice((type_index-1)*2,((type_index-1)*2+2));
		var redBall_info = value + "_" + current_LottreyId + _playcode[redBall]+"_"+_rebate_value;
		var line_str = "line" + type_index;
		hcp_LotteryStorage["hcpEsf"][line_str].push(redBall_info+"");
	}else if(hcpesf_playMethod == 3 ){//全5 中1
		var redBall = mathUtil.getNums(1,11);
		var rebate = hcp_lottery_rebate[101 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall_info = (Number(redBall[0])+1) + "_" + current_LottreyId + hcp_playCode_esf[12].play_code[redBall]+"_"+_rebate_value;
		var line_str = "line1";
		hcp_LotteryStorage["hcpEsf"][line_str].push(redBall_info+"");
	}
}

//@ 计算赔率金额 
function hcpEsf_calcRate(obj) {
	hcpEsf_qingkongAll();
	if (hcpesf_playMethod == 0){
		for(var i=1;i<27;i++){
			var str = i;
			if(i<10)str = "0" + str;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpEsf_lossPercent').blur();
		}
		for(var i=113;i<119;i++){
			var str = i;
			if(i<10)str = "0" + str;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpEsf_lossPercent').blur();
		}
	}else if (hcpesf_playMethod == 1){
		
		for(var i=27;i<82;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
		}
	}else if (hcpesf_playMethod == 2){
		for(var i=82;i<102;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpEsf_lossPercent').blur();
		}
	}else if (hcpesf_playMethod == 3){
		for(var i=102;i<113;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpEsf_lossPercent').blur();
		}
	}
}