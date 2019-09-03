var hcpks_playType = 0;
var hcpks_playMethod = 0;
var hcpks_rebate;
var hcpksScroll;

//进入这个页面时调用
function hcpKsPageLoadedPanel() {
	catchErrorFun("hcp_ks_init();");
}

//离开这个页面时调用
function hcpKsPageUnloadedPanel(){
	$("#hcpKs_queding").off('click');
	$("#hcpKsPage_back").off('click');
	$("#hcpKs_ballView").empty();
	$("#hcpKsSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hcpKsPlaySelect"></select>');
	$("#hcpKsSelect").append($select);
	$("#hcpKs_money").val('');
}

//入口函数
function hcp_ks_init(){
	$("#hcpKs_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
//	$("#hcpKs_title").html(current_LottreyId);//测试用；

	//玩法初始化；
	for(var i = 0; i< hcp_LotteryInfo.getPlayLength("hcp_ks");i++){
		var $play = $('<optgroup label="'+hcp_LotteryInfo.getPlayName("hcp_ks",i)+'"></optgroup>');
		for(var j = 0; j < hcp_LotteryInfo.getMethodLength("hcp_ks");j++){
			if(hcp_LotteryInfo.getMethodTypeId("hcp_ks",j) == hcp_LotteryInfo.getPlayTypeId("hcp_ks",i)){
				var name = hcp_LotteryInfo.getMethodName("hcp_ks",j);
				if(i == hcpks_playType && j == hcpks_playMethod){
					$play.append('<option value="hcp_ks_'+hcp_LotteryInfo.getMethodIndex("hcp_ks",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hcp_ks_'+hcp_LotteryInfo.getMethodIndex("hcp_ks",j)+'">' + name +'</option>');
				}
			}
		}
		$("#hcpKsPlaySelect").append($play);
	}
	
	[].slice.call( document.getElementById("hcpKsSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hcpksChangeItem
		});
	});
	
	//添加玩法选区滑动条
	new IScroll('.cs-options',{
		click:true,
		scrollbars: true,
		mouseWheel: true,
		interactiveScrollbars: true,
		shrinkScrollbars: 'scale',
		fadeScrollbars: true
	});
	
	//获取每个玩法下的返点列表
	hcp_getLotteryInfo(current_LottreyId,function (){
		hcpksChangeItem("hcpks"+hcpks_playMethod);
	});

	//添加页面滑动条
	if(!hcpksScroll){
		hcpksScroll = new IScroll('#hcpKsContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}
	
	//获取期号
	hcp_getQihao("hcpKs", current_LottreyId);
	
	//获取上一期开奖
	hcp_queryLastPrize("hcpKs", current_LottreyId);
	
	//机选选号
	$("#hcpKs_random").off('click');
	$("#hcpKs_random").on('click', function(event) {
		hcpks_randomOne();
	});
	
	//返回
	$("#hcpKsPage_back").on('click', function(event) {
		hcpks_playType = 0;
		hcpks_playMethod = 0;
		$("#hcpKs_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hcpKs_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
		
		hcp_checkoutResult=[];
	});

	//清空 Btn
	hcp_qingKong("hcpKs","hcpKs");

	//提交 Btn
	$("#hcpKs_queding").off('click');
	$("#hcpKs_queding").on('click', function(event) {
		hcpks_submitData();
	});
}

//清空所有记录
function  hcpKs_qingkongAll(){
	$("#hcpKs_ballView span").removeClass('hcp_redBalls_active');
	$("#hcpKs_ballView span").removeClass('hcp_redBalls_property_active');
	hcp_LotteryStorage["hcpKs"]["line1"] = [];
	hcp_LotteryStorage["hcpKs"]["line2"] = [];
	hcp_LotteryStorage["hcpKs"]["line3"] = [];
	hcp_LotteryStorage["hcpKs"]["line4"] = [];
	hcp_LotteryStorage["hcpKs"]["line5"] = [];

	localStorageUtils.removeParam("hcpKs_line1");
	localStorageUtils.removeParam("hcpKs_line2");
	localStorageUtils.removeParam("hcpKs_line3");
	localStorageUtils.removeParam("hcpKs_line4");
	localStorageUtils.removeParam("hcpKs_line5");

	hcpks_calcNotes();

	$("#hcpKs_money").val("");
}

//@ 切换玩法
function hcpksChangeItem(val) {
	hcpKs_qingkongAll();
	var temp = val.substring("hcpKs".length,val.length);

	if(val == "hcpks0"){
		//大小骰宝
		$("#hcpKs_random").show();
		hcpks_playType = 0;
		hcpks_playMethod = 0;
		hcpKs_createFiveLineLayout("hcpKs", function(){
			//计算注数；
			hcpks_calcNotes();
		});
		hcpKs_qingkongAll();
	}
	
	if(hcpksScroll){
		hcpksScroll.refresh();
	}
	
	hcpks_calcNotes();
	initLossPercent("hcpKs");
	
	if(localStorageUtils.getParam("playFanDian")!=null && localStorageUtils.getParam("playFanDian")!= undefined){
		var Unite_rebate=new Object();
		Unite_rebate.value = localStorageUtils.getParam("playFanDian");
		//@ 计算赔率金额 
		hcpKs_calcRate(Unite_rebate);
	}
	
	localStorageUtils.setParam("MaxFanDian",$("#hcpKs_lossPercent option:last").val()) ;
}

/**
 * [hcpks_calcNotes 计算注数]
 */
function hcpks_calcNotes(){
	var notes = 0;

	if(hcpks_playMethod == 0){
		notes = hcp_LotteryStorage["hcpKs"]["line1"].length +
			hcp_LotteryStorage["hcpKs"]["line2"].length +
			hcp_LotteryStorage["hcpKs"]["line3"].length +
			hcp_LotteryStorage["hcpKs"]["line4"].length +
			hcp_LotteryStorage["hcpKs"]["line5"].length;
	}
	
	zhushu = notes;
	
	//底部Button显示隐藏
	hcpks_initFooterButton();
}

/**
 * [hcpks_initFooterButton 初始化底部Button显示隐藏]
 */
function hcpks_initFooterButton(){
	if(hcpks_playMethod == 0){
		if(hcp_LotteryStorage["hcpKs"]["line1"].length > 0 || hcp_LotteryStorage["hcpKs"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpKs"]["line3"].length > 0 || hcp_LotteryStorage["hcpKs"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpKs"]["line5"].length > 0 ){
			$("#hcpKs_qingkong").css("opacity",1.0);
		}else{
			$("#hcpKs_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hcpKs_qingkong").css("opacity",0);
	}

	if($("#hcpKs_qingkong").css("opacity") == "0"){
		$("#hcpKs_qingkong").css("display","none");
	}else{
		$("#hcpKs_qingkong").css("display","block");
	}

	if(zhushu > 0){
		$("#hcpKs_queding").css("opacity",1.0);
	}else{
		$("#hcpKs_queding").css("opacity",0.4);
	}
}

/**
 * [cqssc_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hcpks_submitData(){
	var submitParams = new hcp_LotterySubmitParams();

	if(zhushu <= 0){
		toastUtils.showToast('请至少选择一注');
		return;
	}
	hcpks_calcNotes();

	//添加玩法位数描述
	hcpks_SelectionNumberDescription();

	submitParams.lotteryType = "hcpks";
	var play = hcp_LotteryInfo.getPlayName("hcp_ks",hcpks_playType);//eg:盘口玩法
	var playMethod = hcp_LotteryInfo.getMethodName("hcp_ks",hcpks_playMethod);//eg:大小骰宝
	submitParams.playType = play;
	submitParams.playMethod = playMethod;
	submitParams.playTypeIndex = hcpks_playType;
	submitParams.playMethodIndex = hcpks_playMethod;
	if(hcpks_playMethod == 0 ){//整合
		submitParams.nums = [hcp_LotteryStorage["hcpKs"]["line1"],hcp_LotteryStorage["hcpKs"]["line2"],hcp_LotteryStorage["hcpKs"]["line3"],hcp_LotteryStorage["hcpKs"]["line4"],hcp_LotteryStorage["hcpKs"]["line5"]];
	}
	localStorageUtils.setParam("playFanDian",$("#hcpKs_lossPercent").val());
	submitParams.rebates = $('#hcpKs_lossPercent').val();
	submitParams.money = $("#hcpKs_money").val();
	submitParams.award = 2001;    //奖金
	submitParams.maxAward = 2005;  //多级奖金
	submitParams.submit();
	$("#hcpKs_ballView").empty();
	hcpKs_qingkongAll();
}


/**
 * [添加玩法位数描述]
 */
function hcpks_SelectionNumberDescription(){
	var hcpks_arr = hcp_LotteryStorage["hcpKs"];
	if(hcpks_playMethod == 0 ) var markArr=["三军:、大小:","围骰:、全骰:","点数:","长牌:","短牌:"];

	for (var i=0;i<5;i++){
		if(hcpks_arr["line"+(i+1)].length != 0){
			var item = hcpks_arr["line"+(i+1)];
			for (var j=0;j<item.length;j++){
				if(i==0 || i==1){
					if(Number(item[j].split("_")[0])>0){
						item[j] = markArr[i].split("、")[0] +  "_" + item[j];
					}else{
						item[j] = markArr[i].split("、")[1] +  "_" + item[j];
					}
				}else if(i==3 || i==4){
					item[j] = item[j].replace("-","");
					item[j] = markArr[i] +  "_" + item[j];
				}else{
					item[j] = markArr[i] +  "_" + item[j];
				}
			}
			hcpks_arr["line"+(i+1)] = item;
		}
	}
	hcp_LotteryStorage["hcpKs"] = hcpks_arr;
}

/**
 * [hcpks_randomOne 随机一注]
 */
function hcpks_randomOne(){
	//选号
	hcpks_Random();
	//计算注数
	hcpks_calcNotes();
	//提交，跳转出票
	hcpks_submitData();
}

/**
 * 出票机选
 */
var isCheckOutPage_jixuan= 0;  //0-不是  1-是
function hcpKs_checkOutRandom(){
	isCheckOutPage_jixuan = 1;
	//选号
	hcpks_Random();

	//添加玩法位数描述
	hcpks_SelectionNumberDescription();

	var obj = {};
	obj.lotteryType = "hcpks";
	var play = hcp_LotteryInfo.getPlayName("hcp_ks",hcpks_playType); //eg:盘口玩法
	var playMethod = hcp_LotteryInfo.getMethodName("hcp_ks",hcpks_playMethod); //一级玩法
	obj.playType = play;
	obj.playMethod = playMethod;
	obj.playTypeIndex = hcpks_playType;
	obj.playMethodIndex = hcpks_playMethod;
	if(hcpks_playMethod == 0 ){ //大小骰宝
		obj.nums = [hcp_LotteryStorage["hcpKs"]["line1"],hcp_LotteryStorage["hcpKs"]["line2"],hcp_LotteryStorage["hcpKs"]["line3"],hcp_LotteryStorage["hcpKs"]["line4"],hcp_LotteryStorage["hcpKs"]["line5"]];
	}

//	obj.rebates = hcp_defaultBetRebate;
	obj.rebates = localStorageUtils.getParam("MaxFanDian");  //requirement   //出票机选  默认最大返点；
	obj.money = "";       // 投注金额
	obj.award = 2001;     // 奖金
	obj.maxAward = 2005;  // 多级奖金
	return obj;
}

/**
 * 机选 选号
 */
function hcpks_Random(){
	hcp_defaultBetRebate = $('#hcpKs_lossPercent').val();
	
	if(isCheckOutPage_jixuan == 1){
		hcp_defaultBetRebate = localStorageUtils.getParam("MaxFanDian");//出票机选  默认最大返点；
	}
	
	hcpKs_qingkongAll();
	if(hcpks_playMethod == 0){
		var type_index = Number(mathUtil.getNums(1,5)) + 1;//玩法索引；1~5
		var ballORrect;
		if(type_index == 1){
			ballORrect = mathUtil.getNums(1,2); //每一位上是选择球还是属性；
			if(ballORrect == 0){//球
				var rebate = hcp_lottery_rebate[0].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
				//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
				var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				var redBall = parseInt(mathUtil.getNums(1,6))+1;
				var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_ks[type_index-1].play_code[redBall-1]+"_"+_rebate_value;
				var line_str = "line" + type_index;
				hcp_LotteryStorage["hcpKs"][line_str].push(redBall_info+"");
			}else{//属性
				var redBall = mathUtil.getNums(1,2);
				var value;
				if(redBall == 0)value="大";
				if(redBall == 1)value="小";
				var rebate = hcp_lottery_rebate[6].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
				//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
				var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_ks[type_index-1].play_code[Number(redBall) + 6]+"_"+_rebate_value;
				var line_str = "line" + type_index;
				hcp_LotteryStorage["hcpKs"][line_str].push(redBall_info+"");
			}
		}else if(type_index == 2){
			ballORrect = mathUtil.getNums(1,2); //每一位上是选择球还是属性；
			if(ballORrect == 0){//球
				var rebate = hcp_lottery_rebate[8].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
				//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
				var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				var redBall = parseInt(mathUtil.getNums(1,6))+1;
				var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_ks[type_index-1].play_code[redBall-1]+"_"+_rebate_value;
				var line_str = "line" + type_index;
				hcp_LotteryStorage["hcpKs"][line_str].push(redBall_info+"");
			}else{//属性
				var redBall = 0;
				var value = "全骰";
				var rebate = hcp_lottery_rebate[14].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
				//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
				var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
				var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_ks[type_index-1].play_code[Number(redBall) + 6]+"_"+_rebate_value;
				var line_str = "line" + type_index;
				hcp_LotteryStorage["hcpKs"][line_str].push(redBall_info+"");
			}
		}else if(type_index == 3){
			var randomIndex = parseInt(mathUtil.getNums(1,14));
			var rebate = hcp_lottery_rebate[15+randomIndex].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall = ["4点","5点","6点","7点","8点","9点","10点","11点","12点","13点","14点","15点","16点","17点"][randomIndex];
			var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_ks[type_index-1].play_code[randomIndex]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpKs"][line_str].push(redBall_info+"");
		}else if(type_index == 4){
			var rebate = hcp_lottery_rebate[29].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var randomIndex = parseInt(mathUtil.getNums(1,15));
			var redBall = ["1-2","1-3","1-4","1-5","1-6","2-3","2-4","2-5","2-6","3-4","3-5","3-6","4-5","4-6","5-6"][randomIndex];
			var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_ks[type_index-1].play_code[randomIndex]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpKs"][line_str].push(redBall_info+"");
		}else if(type_index == 5){
			var rebate = hcp_lottery_rebate[44].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var randomIndex = parseInt(mathUtil.getNums(1,6));
			var redBall = ["1-1","2-2","3-3","4-4","5-5","6-6"][randomIndex];
			var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_ks[type_index-1].play_code[randomIndex]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpKs"][line_str].push(redBall_info+"");
		}
	}
}

//@ 计算赔率金额 
function hcpKs_calcRate(obj) {
	hcpKs_qingkongAll();
	if (hcpks_playMethod == 0){
		for(var i=1; i<51; i++){  //i = the num of balls in this page
			var str = i;
			if(i<10)str = "0" + str;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpks_lossPercent').blur();
		}
	}
}
