var hcpssc_playType = 0;
var hcpssc_playMethod = 0;
var hcpssc_rebate;
var hcpsscScroll;
var zhushu;
//进入这个页面时调用
function hcpSscPageLoadedPanel() {
	catchErrorFun("hcp_ssc_init();");
}

//离开这个页面时调用
function hcpSscPageUnloadedPanel(){
	$("#hcpSsc_queding").off('click');
	$("#hcpSscPage_back").off('click');
	$("#hcpSsc_ballView").empty();
	$("#hcpSscSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hcpSscPlaySelect"></select>');
	$("#hcpSscSelect").append($select);
	$("#hcpSsc_money").val('');
}

//入口函数
function hcp_ssc_init(){
	$("#hcpSsc_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
//	$("#hcpSsc_title").html(current_LottreyId);//测试用；
	//玩法初始化；
	for(var i = 0; i< hcp_LotteryInfo.getPlayLength("hcp_ssc");i++){
		var $play = $('<optgroup label="'+hcp_LotteryInfo.getPlayName("hcp_ssc",i)+'"></optgroup>');
		for(var j = 0; j < hcp_LotteryInfo.getMethodLength("hcp_ssc");j++){
			if(hcp_LotteryInfo.getMethodTypeId("hcp_ssc",j) == hcp_LotteryInfo.getPlayTypeId("hcp_ssc",i)){
				var name = hcp_LotteryInfo.getMethodName("hcp_ssc",j);
				if(i == hcpssc_playType && j == hcpssc_playMethod){
					$play.append('<option value="hcpssc'+hcp_LotteryInfo.getMethodIndex("hcp_ssc",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hcpssc'+hcp_LotteryInfo.getMethodIndex("hcp_ssc",j)+'">' + name +'</option>');
				}
			}
		}
		$("#hcpSscPlaySelect").append($play);
	}
	
	[].slice.call( document.getElementById("hcpSscSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hcpsscChangeItem
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
		hcpsscChangeItem("hcpssc"+hcpssc_playMethod);
	});

	//添加滑动条
	if(!hcpsscScroll){
		hcpsscScroll = new IScroll('#hcpSscContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}
	
	//获取期号
	hcp_getQihao("hcpSsc",current_LottreyId);
	
	//获取上一期开奖
	hcp_queryLastPrize("hcpSsc",current_LottreyId);
	
	//机选选号
	$("#hcpSsc_random").off('click');
	$("#hcpSsc_random").on('click', function(event) {
		hcpssc_randomOne();
	});
	
	//返回
	$("#hcpSscPage_back").on('click', function(event) {
		hcpssc_playType = 0;
		hcpssc_playMethod = 0;
		$("#hcpSsc_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hcpSsc_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
		
		hcp_checkoutResult=[];
	});
	
	//清空
	hcp_qingKong("hcpSsc","hcpSsc");
	
	//提交
    $("#hcpSsc_queding").off('click');
    $("#hcpSsc_queding").on('click', function(event) {
        hcpssc_submitData();
    });
    
}

 function hcpsscChangeItem(val) {
	hcpSsc_qingkongAll();
	var temp = val.substring("hcpssc".length,val.length);

	if(val == "hcpssc0"){
		//整合
		$("#hcpSsc_random").show();
		hcpssc_playType = 0;
		hcpssc_playMethod = 0;
		hcp_createFiveLineLayout("hcpSsc", function(){
			//计算注数；
			hcpssc_calcNotes();
		});
		hcpSsc_qingkongAll();
	}else if(val == "hcpssc1"){
		//龙虎斗
		$("#hcpSsc_random").show();
		hcpssc_playType = 0;
		hcpssc_playMethod = 1;
		hcp_createLongHuLayout("hcpSsc",function(){
			//计算注数；
			hcpssc_calcNotes();
		});
		hcpSsc_qingkongAll();
	}else if(val == "hcpssc2"){
		//全5中1
		$("#hcpSsc_random").show();
		hcpssc_playType = 0;
		hcpssc_playMethod = 2;
		hcp_createOneLineLayout("hcpSsc", function(){
			//计算注数；
			hcpssc_calcNotes();
		});
		hcpSsc_qingkongAll();
	}
	
	if(hcpsscScroll){
		hcpsscScroll.refresh();
	}
	
	hcpssc_calcNotes();
	initLossPercent("hcpSsc");
	
	if(localStorageUtils.getParam("playFanDian")!=null && localStorageUtils.getParam("playFanDian")!= undefined){
		var Unite_rebate=new Object();
		Unite_rebate.value = localStorageUtils.getParam("playFanDian");
		//@ 计算赔率金额 
		hcpSsc_calcRate(Unite_rebate);
	}
	
	localStorageUtils.setParam("MaxFanDian",$("#hcpSsc_lossPercent option:last").val()) ;
}

//清空所有记录
function  hcpSsc_qingkongAll(){
	$("#hcpSsc_ballView span").removeClass('hcp_redBalls_active');
	$("#hcpSsc_ballView span").removeClass('hcp_redBalls_property_active');
	hcp_LotteryStorage["hcpSsc"]["line1"] = [];
	hcp_LotteryStorage["hcpSsc"]["line2"] = [];
	hcp_LotteryStorage["hcpSsc"]["line3"] = [];
	hcp_LotteryStorage["hcpSsc"]["line4"] = [];
	hcp_LotteryStorage["hcpSsc"]["line5"] = [];
	hcp_LotteryStorage["hcpSsc"]["line6"] = [];
	hcp_LotteryStorage["hcpSsc"]["line7"] = [];
	hcp_LotteryStorage["hcpSsc"]["line8"] = [];
	hcp_LotteryStorage["hcpSsc"]["line9"] = [];
	hcp_LotteryStorage["hcpSsc"]["line10"] = [];

	localStorageUtils.removeParam("hcpSsc_line1");
	localStorageUtils.removeParam("hcpSsc_line2");
	localStorageUtils.removeParam("hcpSsc_line3");
	localStorageUtils.removeParam("hcpSsc_line4");
	localStorageUtils.removeParam("hcpSsc_line5");
	localStorageUtils.removeParam("hcpSsc_line6");
	localStorageUtils.removeParam("hcpSsc_line7");
	localStorageUtils.removeParam("hcpSsc_line8");
	localStorageUtils.removeParam("hcpSsc_line9");
	localStorageUtils.removeParam("hcpSsc_line10");

	hcpssc_calcNotes();
	
	$("#hcpSsc_money").val("");
}

/**
 * [cqssc_calcNotes 计算注数]
 */
function hcpssc_calcNotes(){
	var notes = 0;

	if(hcpssc_playMethod == 0){
		notes = hcp_LotteryStorage["hcpSsc"]["line1"].length +
			hcp_LotteryStorage["hcpSsc"]["line2"].length +
			hcp_LotteryStorage["hcpSsc"]["line3"].length +
			hcp_LotteryStorage["hcpSsc"]["line4"].length +
			hcp_LotteryStorage["hcpSsc"]["line5"].length +
			hcp_LotteryStorage["hcpSsc"]["line6"].length +
			hcp_LotteryStorage["hcpSsc"]["line7"].length +
			hcp_LotteryStorage["hcpSsc"]["line8"].length +
			hcp_LotteryStorage["hcpSsc"]["line9"].length;
	}else if(hcpssc_playMethod == 1){
		notes = hcp_LotteryStorage["hcpSsc"]["line1"].length +
			hcp_LotteryStorage["hcpSsc"]["line2"].length +
			hcp_LotteryStorage["hcpSsc"]["line3"].length +
			hcp_LotteryStorage["hcpSsc"]["line4"].length +
			hcp_LotteryStorage["hcpSsc"]["line5"].length +
			hcp_LotteryStorage["hcpSsc"]["line6"].length +
			hcp_LotteryStorage["hcpSsc"]["line7"].length +
			hcp_LotteryStorage["hcpSsc"]["line8"].length +
			hcp_LotteryStorage["hcpSsc"]["line9"].length +
			hcp_LotteryStorage["hcpSsc"]["line10"].length;
	}else if(hcpssc_playMethod == 2){
		notes = hcp_LotteryStorage["hcpSsc"]["line1"].length;
	}
	
	zhushu = notes;
	
	//底部Button显示隐藏
	hcpssc_initFooterButton();
}

/**
 * [cqssc_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hcpssc_initFooterButton(){
	if(hcpssc_playMethod == 0){
		if(hcp_LotteryStorage["hcpSsc"]["line1"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpSsc"]["line3"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpSsc"]["line5"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line6"].length > 0 ||
			hcp_LotteryStorage["hcpSsc"]["line7"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line8"].length > 0 ||
			hcp_LotteryStorage["hcpSsc"]["line9"].length > 0){
			$("#hcpSsc_qingkong").css("opacity",1.0);
		}else{
			$("#hcpSsc_qingkong").css("opacity",0.4);
		}
	}else if(hcpssc_playMethod == 1){
		if(hcp_LotteryStorage["hcpSsc"]["line1"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpSsc"]["line3"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpSsc"]["line5"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line6"].length > 0 ||
			hcp_LotteryStorage["hcpSsc"]["line7"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line8"].length > 0 ||
			hcp_LotteryStorage["hcpSsc"]["line9"].length > 0 || hcp_LotteryStorage["hcpSsc"]["line10"].length > 0){
			$("#hcpSsc_qingkong").css("opacity",1.0);
		}else{
			$("#hcpSsc_qingkong").css("opacity",0.4);
		}
	}else if(hcpssc_playMethod == 2 ){
		if(hcp_LotteryStorage["hcpSsc"]["line1"].length > 0){
			$("#hcpSsc_qingkong").css("opacity",1.0);
		}else{
			$("#hcpSsc_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hcpSsc_qingkong").css("opacity",0);
	}
	
	if($("#hcpSsc_qingkong").css("opacity") == "0"){
		$("#hcpSsc_qingkong").css("display","none");
	}else{
		$("#hcpSsc_qingkong").css("display","block");
	}

	if(zhushu > 0){
		$("#hcpSsc_queding").css("opacity",1.0);
	}else{
		$("#hcpSsc_queding").css("opacity",0.4);
	}
}

/**
 * [cqssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hcpssc_submitData(){
	var hcp_submitParams = new hcp_LotterySubmitParams();
	
		if(zhushu <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hcpssc_calcNotes();
		
		//添加玩法位数描述
		hcpssc_SelectionNumberDescription();
		
		hcp_submitParams.lotteryType = "hcpSsc";
		var play = hcp_LotteryInfo.getPlayName("hcp_ssc",hcpssc_playType);//eg:盘口玩法
		var playMethod = hcp_LotteryInfo.getMethodName("hcp_ssc",hcpssc_playMethod);//eg:整合
//		var playMethod = hcpssc_playMethod + "@" + "hcp_ssc";//eg:整合id
		hcp_submitParams.playType = play;
		hcp_submitParams.playMethod = playMethod;
		hcp_submitParams.playTypeIndex = hcpssc_playType;
		hcp_submitParams.playMethodIndex = hcpssc_playMethod;
		var selectedBalls = [];
		if(hcpssc_playMethod == 0 ){//整合
			hcp_submitParams.nums = [hcp_LotteryStorage["hcpSsc"]["line1"],hcp_LotteryStorage["hcpSsc"]["line2"],hcp_LotteryStorage["hcpSsc"]["line3"],hcp_LotteryStorage["hcpSsc"]["line4"],hcp_LotteryStorage["hcpSsc"]["line5"],hcp_LotteryStorage["hcpSsc"]["line6"],hcp_LotteryStorage["hcpSsc"]["line7"],hcp_LotteryStorage["hcpSsc"]["line8"],hcp_LotteryStorage["hcpSsc"]["line9"]];
		}else if(hcpssc_playMethod == 1 ){//龙虎斗
			hcp_submitParams.nums = [hcp_LotteryStorage["hcpSsc"]["line1"],hcp_LotteryStorage["hcpSsc"]["line2"],hcp_LotteryStorage["hcpSsc"]["line3"],hcp_LotteryStorage["hcpSsc"]["line4"],hcp_LotteryStorage["hcpSsc"]["line5"],hcp_LotteryStorage["hcpSsc"]["line6"],hcp_LotteryStorage["hcpSsc"]["line7"],hcp_LotteryStorage["hcpSsc"]["line8"],hcp_LotteryStorage["hcpSsc"]["line9"],hcp_LotteryStorage["hcpSsc"]["line10"]];
		}else if(hcpssc_playMethod == 2 ){//全5 中1
			hcp_submitParams.nums = [hcp_LotteryStorage["hcpSsc"]["line1"]];
		}
		localStorageUtils.setParam("playFanDian",$("#hcpSsc_lossPercent").val());
		hcp_submitParams.rebates = $('#hcpSsc_lossPercent').val();
		hcp_submitParams.money = $("#hcpSsc_money").val();
		hcp_submitParams.award = 2001;    //奖金        $('#cqssc_minAward').html()
		hcp_submitParams.maxAward = 2005;  //多级奖金     $('#cqssc_maxAward').html()
		hcp_submitParams.submit();
		$("#hcpSsc_ballView").empty();
		hcpSsc_qingkongAll();
}

/**
 * [添加玩法位数描述]
 */
function hcpssc_SelectionNumberDescription(){
	var hcpssc_arr = hcp_LotteryStorage["hcpSsc"];
	if(hcpssc_playMethod == 0 )var markArr=["第一球:","第二球:","第三球:","第四球:","第五球:","总和:","前三:","中三:","后三:"];
	if(hcpssc_playMethod == 1 )var markArr=["万VS千:","万VS百:","万VS十:","万VS个:","千VS百:","千VS十:","千VS个:","百VS十:","百VS个:","十VS个:"];
	if(hcpssc_playMethod == 2 )var markArr=["全5中1:"];
	for (var i=0;i<10;i++){
		if(hcpssc_arr["line"+(i+1)].length != 0){
			var item = hcpssc_arr["line"+(i+1)];
			for (var j=0;j<item.length;j++){
				item[j] = markArr[i] +  "_" + item[j];
			}
			hcpssc_arr["line"+(i+1)] = item;
		}
	}
	hcp_LotteryStorage["hcpSsc"] = hcpssc_arr;
}

/**
 * [hcpssc_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hcpssc_randomOne(){
	//选号
	hcpSsc_Random();
	//计算注数
	hcpssc_calcNotes();
//	//提交，跳转出票
	hcpssc_submitData();
}

/**
 * 出票机选
 * @param playMethod
 */
var isCheckOutPage_jixuan= 0;  //0-不是  1-是
function hcpSsc_checkOutRandom(){
	isCheckOutPage_jixuan = 1;
	//选号
	hcpSsc_Random();
	
	//添加玩法位数描述
	hcpssc_SelectionNumberDescription();
	
	var obj = new Object();
	obj.lotteryType = "hcpSsc";
	var play = hcp_LotteryInfo.getPlayName("hcp_ssc",hcpssc_playType);//eg:盘口玩法
	var playMethod = hcp_LotteryInfo.getMethodName("hcp_ssc",hcpssc_playMethod);//eg:整合
	obj.playType = play;
	obj.playMethod = playMethod;
	obj.playTypeIndex = hcpssc_playType;
	obj.playMethodIndex = hcpssc_playMethod;
	var selectedBalls = [];
	if(hcpssc_playMethod == 0 ){//整合
		obj.nums = [hcp_LotteryStorage["hcpSsc"]["line1"],hcp_LotteryStorage["hcpSsc"]["line2"],hcp_LotteryStorage["hcpSsc"]["line3"],hcp_LotteryStorage["hcpSsc"]["line4"],hcp_LotteryStorage["hcpSsc"]["line5"],hcp_LotteryStorage["hcpSsc"]["line6"],hcp_LotteryStorage["hcpSsc"]["line7"],hcp_LotteryStorage["hcpSsc"]["line8"],hcp_LotteryStorage["hcpSsc"]["line9"]];
	}else if(hcpssc_playMethod == 1 ){//龙虎斗
		obj.nums = [hcp_LotteryStorage["hcpSsc"]["line1"],hcp_LotteryStorage["hcpSsc"]["line2"],hcp_LotteryStorage["hcpSsc"]["line3"],hcp_LotteryStorage["hcpSsc"]["line4"],hcp_LotteryStorage["hcpSsc"]["line5"],hcp_LotteryStorage["hcpSsc"]["line6"],hcp_LotteryStorage["hcpSsc"]["line7"],hcp_LotteryStorage["hcpSsc"]["line8"],hcp_LotteryStorage["hcpSsc"]["line9"],hcp_LotteryStorage["hcpSsc"]["line10"]];
	}else if(hcpssc_playMethod == 2 ){//全5 中1
		obj.nums = [hcp_LotteryStorage["hcpSsc"]["line1"]];
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
function hcpSsc_Random(){
//	//用记住的返点  计算奖金赔率 选号页的机选赔率
//	if(localStorageUtils.getParam("playFanDian")!=null && localStorageUtils.getParam("playFanDian")!= undefined){
//		hcp_defaultBetRebate = localStorageUtils.getParam("playFanDian");
//	}
	
	hcp_defaultBetRebate = $('#hcpSsc_lossPercent').val();
	
	if(isCheckOutPage_jixuan == 1){
		hcp_defaultBetRebate = localStorageUtils.getParam("MaxFanDian");//出票机选  默认最大返点；
	}
	
	hcpSsc_qingkongAll();
	if(hcpssc_playMethod == 0){//整合
//		var type_index = Number(mathUtil.getNums(1,9)) + 1;//整合玩法索引；1~7
		var type_index;
		//屏蔽玩法     
		//557-腾讯分分彩  （总和大小单双  type_index == 6        前三 ：7     第一球：1 ）
		if(current_LottreyId == 557){
			var arr=[2,3,4,5,8,9];//(不包含隐藏玩法id)
			var type_index = arr[Number(mathUtil.getNums(1,6))];//整合玩法索引随机
		}else{
			var type_index = Number(mathUtil.getNums(1,9)) + 1;//整合玩法索引；1~7
		}
		
		var ballORrect;
		if(type_index == 1 || type_index == 2 || type_index == 3 || type_index == 4 || type_index == 5){ 
			ballORrect = mathUtil.getNums(1,2); //每一位上是选择球还是属性；
			if(ballORrect == 0){//球
				var rebate = hcp_lottery_rebate[9].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
				//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
				var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				var redBall = mathUtil.getNums(1,10);
				var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_ssc[type_index].play_code[redBall]+"_"+_rebate_value;
				var line_str = "line" + type_index;
				hcp_LotteryStorage["hcpSsc"][line_str].push(redBall_info+"");
			}else{//属性
				var redBall = mathUtil.getNums(1,4);
				var value;
				if(redBall == 0)value="大";
				if(redBall == 1)value="小";
				if(redBall == 2)value="单";
				if(redBall == 3)value="双";
				var rebate = hcp_lottery_rebate[0].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
				//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
				var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_ssc[type_index].play_code[Number(redBall) + 10]+"_"+_rebate_value;
				var line_str = "line" + type_index;
				hcp_LotteryStorage["hcpSsc"][line_str].push(redBall_info+"");
			}
		}else if(type_index == 6 ){//总和
			var redBall = mathUtil.getNums(1,4);
			var value;
			if(redBall == 0)value="大";
			if(redBall == 1)value="小";
			if(redBall == 2)value="单";
			if(redBall == 3)value="双";
			var rebate = hcp_lottery_rebate[0].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_ssc[type_index].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpSsc"][line_str].push(redBall_info+"");
		}else if(type_index == 7 || type_index == 8 ||type_index == 9 ){//特殊玩法
			var redBall = mathUtil.getNums(1,5);
			var value;
			if(redBall == 0)value="豹子";
			if(redBall == 1)value="顺子";
			if(redBall == 2)value="对子";
			if(redBall == 3)value="杂六";
			if(redBall == 4)value="半顺";
			var rebate = hcp_lottery_rebate[74 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_ssc[type_index].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpSsc"][line_str].push(redBall_info+"");
		}
	}else if(hcpssc_playMethod == 1 ){//龙虎斗
		var type_index = Number(mathUtil.getNums(1,10)) + 1;//玩法索引；1~10
		
		//屏蔽玩法     
		//557-腾讯分分彩  （龙虎屏蔽   万千 万百  万十  万个）
		if(current_LottreyId == 557){
			var arr=[5,6,7,8,9,10];//(不包含隐藏玩法id)
			var type_index = arr[Number(mathUtil.getNums(1,6))];//整合玩法索引随机
		}
		
		var redBall = mathUtil.getNums(1,3);
		var value;
		if(redBall == 0)value="龙";
		if(redBall == 1)value="虎";
		if(redBall == 2)value="和";
		var rebate = hcp_lottery_rebate[89 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var _playcode = hcp_playCode_ssc[10].play_code.slice((type_index-1)*3,((type_index-1)*3+3));
		var redBall_info = value + "_" + current_LottreyId + _playcode[redBall]+"_"+_rebate_value;
		var line_str = "line" + type_index;
		hcp_LotteryStorage["hcpSsc"][line_str].push(redBall_info+"");
	}else if(hcpssc_playMethod == 2 ){//全5 中1
		var redBall = mathUtil.getNums(1,10);
		var rebate = hcp_lottery_rebate[119 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_ssc[11].play_code[redBall]+"_"+_rebate_value;
		var line_str = "line1";
		hcp_LotteryStorage["hcpSsc"][line_str].push(redBall_info+"");
	}
}

//@ 计算赔率金额 
function hcpSsc_calcRate(obj) {
	hcpSsc_qingkongAll();
	if (hcpssc_playMethod == 0){
		for(var i=1;i<90;i++){
			var str = i;
			if(i<10)str = "0" + str;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpSsc_lossPercent').blur();
		}
	}else if (hcpssc_playMethod == 1){
		
		for(var i=90;i<120;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpSsc_lossPercent').blur();
		}
	}else if (hcpssc_playMethod == 2){
		for(var i=120;i<130;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpSsc_lossPercent').blur();
		}
	}
}
