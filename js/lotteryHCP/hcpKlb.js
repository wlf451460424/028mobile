var hcpklb_playType = 0;
var hcpklb_playMethod = 0;
var hcpklb_rebate;
var hcpklbScroll;
var zhushu;
//进入这个页面时调用
function hcpKlbPageLoadedPanel() {
	catchErrorFun("hcp_klb_init();");
}

//离开这个页面时调用
function hcpKlbPageUnloadedPanel(){
	$("#hcpKlb_queding").off('click');
	$("#hcpKlbPage_back").off('click');
	$("#hcpKlb_ballView").empty();
	$("#hcpKlbSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hcpKlbPlaySelect"></select>');
	$("#hcpKlbSelect").append($select);
	$("#hcpKlb_money").val('');
}

//入口函数
function hcp_klb_init(){
	$("#hcpKlb_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
//	$("#hcpKlb_title").html(current_LottreyId);//测试用；
	//玩法初始化；
	for(var i = 0; i< hcp_LotteryInfo.getPlayLength("hcp_klb");i++){
		var $play = $('<optgroup label="'+hcp_LotteryInfo.getPlayName("hcp_klb",i)+'"></optgroup>');
		for(var j = 0; j < hcp_LotteryInfo.getMethodLength("hcp_klb");j++){
			if(hcp_LotteryInfo.getMethodTypeId("hcp_klb",j) == hcp_LotteryInfo.getPlayTypeId("hcp_klb",i)){
				var name = hcp_LotteryInfo.getMethodName("hcp_klb",j);
				if(i == hcpklb_playType && j == hcpklb_playMethod){
					$play.append('<option value="hcpklb'+hcp_LotteryInfo.getMethodIndex("hcp_klb",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hcpklb'+hcp_LotteryInfo.getMethodIndex("hcp_klb",j)+'">' + name +'</option>');
				}
			}
		}
		$("#hcpKlbPlaySelect").append($play);
	}
	
	[].slice.call( document.getElementById("hcpKlbSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hcpklbChangeItem
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
		hcpklbChangeItem("hcpklb"+hcpklb_playMethod);
	});

	//添加滑动条
	if(!hcpklbScroll){
		hcpklbScroll = new IScroll('#hcpKlbContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}
	
	//获取期号
	hcp_getQihao("hcpKlb",current_LottreyId);
	
	//获取上一期开奖
	hcp_queryLastPrize("hcpKlb", current_LottreyId);
	
	//机选选号
	$("#hcpKlb_random").off('click');
	$("#hcpKlb_random").on('click', function(event) {
		hcpklb_randomOne();
	});
	
	//返回
	$("#hcpKlbPage_back").on('click', function(event) {
		hcpklb_playType = 0;
		hcpklb_playMethod = 0;
		$("#hcpKlb_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hcpKlb_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
		
		hcp_checkoutResult=[];
	});
	
	//清空
	hcp_qingKong("hcpKlb","hcpKlb");
	
	//提交
    $("#hcpKlb_queding").off('click');
    $("#hcpKlb_queding").on('click', function(event) {
        hcpklb_submitData();
    });
}

function hcpklbChangeItem(val) {
	hcpKlb_qingkongAll();
	var temp = val.substring("hcpklb".length,val.length);

	if(val == "hcpklb0"){
		//总和 比数 五行
		$("#hcpKlb_random").show();
		hcpklb_playType = 0;
		hcpklb_playMethod = 0;
		hcpKlb_createFourLineLayout("hcpKlb", function(){
			//计算注数；
			hcpklb_calcNotes();
		});
		hcpKlb_qingkongAll();
	}else if(val == "hcpklb1"){
		//正码
		$("#hcpKlb_random").show();
		hcpklb_playType = 0;
		hcpklb_playMethod = 1;
		hcpKlb_createOneLineLayout("hcpKlb",function(){
			//计算注数；
			hcpklb_calcNotes();
		});
		hcpKlb_qingkongAll();
	}
	
	if(hcpklbScroll){
		hcpklbScroll.refresh();
	}
	
	hcpklb_calcNotes();
	initLossPercent("hcpKlb");
	
	if(localStorageUtils.getParam("playFanDian")!=null && localStorageUtils.getParam("playFanDian")!= undefined){
		var Unite_rebate=new Object();
		Unite_rebate.value = localStorageUtils.getParam("playFanDian");
		//@ 计算赔率金额 
		hcpKlb_calcRate(Unite_rebate);
	}
	
	localStorageUtils.setParam("MaxFanDian",$("#hcpKlb_lossPercent option:last").val()) ;
}

//清空所有记录
function  hcpKlb_qingkongAll(){
	$("#hcpKlb_ballView span").removeClass('hcp_redBalls_active');
	$("#hcpKlb_ballView span").removeClass('hcp_redBalls_property_active');
	hcp_LotteryStorage["hcpKlb"]["line1"] = [];
	hcp_LotteryStorage["hcpKlb"]["line2"] = [];
	hcp_LotteryStorage["hcpKlb"]["line3"] = [];
	hcp_LotteryStorage["hcpKlb"]["line4"] = [];
	hcp_LotteryStorage["hcpKlb"]["line5"] = [];

	localStorageUtils.removeParam("hcpKlb_line1");
	localStorageUtils.removeParam("hcpKlb_line2");
	localStorageUtils.removeParam("hcpKlb_line3");
	localStorageUtils.removeParam("hcpKlb_line4");
	localStorageUtils.removeParam("hcpKlb_line5");

	hcpklb_calcNotes();
	
	$("#hcpKlb_money").val("");
}

/**
 * [klb_calcNotes 计算注数]
 */
function hcpklb_calcNotes(){
	var notes = 0;

	if(hcpklb_playMethod == 0){
		notes = hcp_LotteryStorage["hcpKlb"]["line1"].length +
			hcp_LotteryStorage["hcpKlb"]["line2"].length +
			hcp_LotteryStorage["hcpKlb"]["line3"].length +
			hcp_LotteryStorage["hcpKlb"]["line4"].length +
			hcp_LotteryStorage["hcpKlb"]["line5"].length;
	}else if(hcpklb_playMethod == 1){
		notes = hcp_LotteryStorage["hcpKlb"]["line1"].length;
	}
	
	zhushu = notes;
	
	//底部Button显示隐藏
	hcpklb_initFooterButton();
}

/**
 * [klb_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hcpklb_initFooterButton(){
	if(hcpklb_playMethod == 0){
		if(hcp_LotteryStorage["hcpKlb"]["line1"].length > 0 || hcp_LotteryStorage["hcpKlb"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpKlb"]["line3"].length > 0 || hcp_LotteryStorage["hcpKlb"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpKlb"]["line5"].length > 0 ){
			$("#hcpKlb_qingkong").css("opacity",1.0);
		}else{
			$("#hcpKlb_qingkong").css("opacity",0.4);
		}
	}else if(hcpklb_playMethod == 1 ){
		if(hcp_LotteryStorage["hcpKlb"]["line1"].length > 0){
			$("#hcpKlb_qingkong").css("opacity",1.0);
		}else{
			$("#hcpKlb_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hcpKlb_qingkong").css("opacity",0);
	}
	
	if($("#hcpKlb_qingkong").css("opacity") == "0"){
		$("#hcpKlb_qingkong").css("display","none");
	}else{
		$("#hcpKlb_qingkong").css("display","block");
	}

	if(zhushu > 0){
		$("#hcpKlb_queding").css("opacity",1.0);
	}else{
		$("#hcpKlb_queding").css("opacity",0.4);
	}
}

/**
 * [klb_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hcpklb_submitData(){
	var submitParams = new hcp_LotterySubmitParams();
	
		if(zhushu <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hcpklb_calcNotes();
		
		//添加玩法位数描述
		hcpklb_SelectionNumberDescription();
		
		submitParams.lotteryType = "hcpKlb";
		var play = hcp_LotteryInfo.getPlayName("hcp_klb",hcpklb_playType);//eg:盘口玩法
		var playMethod = hcp_LotteryInfo.getMethodName("hcp_klb",hcpklb_playMethod);//eg:整合
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = hcpklb_playType;
		submitParams.playMethodIndex = hcpklb_playMethod;
		var selectedBalls = [];
		if(hcpklb_playMethod == 0 ){//总和 比数 五行
			submitParams.nums = [hcp_LotteryStorage["hcpKlb"]["line1"],hcp_LotteryStorage["hcpKlb"]["line2"],hcp_LotteryStorage["hcpKlb"]["line3"],hcp_LotteryStorage["hcpKlb"]["line4"],hcp_LotteryStorage["hcpKlb"]["line5"]];
		}else if(hcpklb_playMethod == 1 ){//正码
			submitParams.nums = [hcp_LotteryStorage["hcpKlb"]["line1"]];
		}
		localStorageUtils.setParam("playFanDian",$("#hcpKlb_lossPercent").val());
		submitParams.rebates = $('#hcpKlb_lossPercent').val();
		submitParams.money = $("#hcpKlb_money").val();
		submitParams.award = 2001;    //奖金        $('#cqssc_minAward').html()
		submitParams.maxAward = 2005;  //多级奖金     $('#cqssc_maxAward').html()
		submitParams.submit();
		$("#hcpKlb_ballView").empty();
		hcpKlb_qingkongAll();
}

/**
 * [添加玩法位数描述]
 */
function hcpklb_SelectionNumberDescription(){
	var hcpklb_arr = hcp_LotteryStorage["hcpKlb"];
	if(hcpklb_playMethod == 0 )var markArr=["总和:","总和:","前后和:","单双和:","五行:"];
	if(hcpklb_playMethod == 1 )var markArr=["正码:"];
	for (var i=0;i<5;i++){
		if(hcpklb_arr["line"+(i+1)].length != 0){
			var item = hcpklb_arr["line"+(i+1)];
			for (var j=0;j<item.length;j++){
				item[j] = markArr[i] +  "_" + item[j];
			}
			hcpklb_arr["line"+(i+1)] = item;
		}
	}
	hcp_LotteryStorage["hcpKlb"] = hcpklb_arr;
}

/**
 * [hcpklb_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hcpklb_randomOne(){
	//选号
	hcpKlb_Random();
	//计算注数
	hcpklb_calcNotes();
	//提交，跳转出票
	hcpklb_submitData();
}

/**
 * 出票机选
 * @param playMethod
 */
var isCheckOutPage_jixuan= 0;  //0-不是  1-是
function hcpKlb_checkOutRandom(){
	isCheckOutPage_jixuan = 1;
	//选号
	hcpKlb_Random();
	
	//添加玩法位数描述
	hcpklb_SelectionNumberDescription();
	
	var obj = new Object();
	obj.lotteryType = "hcpKlb";
	var play = hcp_LotteryInfo.getPlayName("hcp_klb",hcpklb_playType);//eg:盘口玩法
	var playMethod = hcp_LotteryInfo.getMethodName("hcp_klb",hcpklb_playMethod);//eg:整合
	obj.playType = play;
	obj.playMethod = playMethod;
	obj.playTypeIndex = hcpklb_playType;
	obj.playMethodIndex = hcpklb_playMethod;
	var selectedBalls = [];
	if(hcpklb_playMethod == 0 ){//总和 比数 五行
		obj.nums = [hcp_LotteryStorage["hcpKlb"]["line1"],hcp_LotteryStorage["hcpKlb"]["line2"],hcp_LotteryStorage["hcpKlb"]["line3"],hcp_LotteryStorage["hcpKlb"]["line4"],hcp_LotteryStorage["hcpKlb"]["line5"]];
	}else if(hcpklb_playMethod == 1 ){//正码
		obj.nums = [hcp_LotteryStorage["hcpKlb"]["line1"]];
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
function hcpKlb_Random(){
	hcp_defaultBetRebate = $('#hcpKlb_lossPercent').val();
	
	if(isCheckOutPage_jixuan == 1){
		hcp_defaultBetRebate = localStorageUtils.getParam("MaxFanDian");//出票机选  默认最大返点；
	}
	
	hcpKlb_qingkongAll();
	if(hcpklb_playMethod == 0){//总和 比数 五行
		var type_index = Number(mathUtil.getNums(1,5)) + 1;//整合玩法索引；1~5
		var ballORrect;
		if(type_index == 1){//总和
			var redBall = mathUtil.getNums(1,4);
			var value;
			if(redBall == 0)value="大";
			if(redBall == 1)value="小";
			if(redBall == 2)value="单";
			if(redBall == 3)value="双";
			var rebate = hcp_lottery_rebate[redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_klb[0].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpKlb"][line_str].push(redBall_info+"");
		}else if(type_index == 2 ){//总和
			var redBall = mathUtil.getNums(1,5);
			var value;
			if(redBall == 0)value="810";
			if(redBall == 1)value="大单";
			if(redBall == 2)value="大双";
			if(redBall == 3)value="小单";
			if(redBall == 4)value="小双";
			var rebate = hcp_lottery_rebate[4 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_klb[1].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpKlb"][line_str].push(redBall_info+"");
		}else if(type_index == 3 ){//总和  前后和
			var redBall = mathUtil.getNums(1,3);
			var value;
			if(redBall == 0)value="前多";
			if(redBall == 1)value="后多";
			if(redBall == 2)value="前后和";
			var rebate = hcp_lottery_rebate[9 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_klb[2].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpKlb"][line_str].push(redBall_info+"");
		}else if(type_index == 4 ){//总和  单双和
			var redBall = mathUtil.getNums(1,3);
			var value;
			if(redBall == 0)value="单多";
			if(redBall == 1)value="双多";
			if(redBall == 2)value="单双和";
			var rebate = hcp_lottery_rebate[12 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_klb[3].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpKlb"][line_str].push(redBall_info+"");
		}else if(type_index == 5 ){//总和  单双和
			var redBall = mathUtil.getNums(1,5);
			var value;
			if(redBall == 0)value="金";
			if(redBall == 1)value="木";
			if(redBall == 2)value="水";
			if(redBall == 3)value="火";
			if(redBall == 4)value="土";
			var rebate = hcp_lottery_rebate[15 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_klb[4].play_code[redBall]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpKlb"][line_str].push(redBall_info+"");
		}
	}else if(hcpklb_playMethod == 1 ){//正码
		var redBall = mathUtil.getNums(1,80);
		var rebate = hcp_lottery_rebate[20 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall_info = (Number(redBall[0])+1) + "_" + current_LottreyId + hcp_playCode_klb[5].play_code[redBall]+"_"+_rebate_value;
		var line_str = "line1";
		hcp_LotteryStorage["hcpKlb"][line_str].push(redBall_info+"");
	}
}

//@ 计算赔率金额 
function hcpKlb_calcRate(obj) {
	hcpKlb_qingkongAll();
	if (hcpklb_playMethod == 0){
		for(var i=1;i<21;i++){
			var str = i;
			if(i<10)str = "0" + str;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpKlb_lossPercent').blur();
		}
	}else if (hcpklb_playMethod == 1){
		
		for(var i=21;i<101;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpKlb_lossPercent').blur();
		}
	}
}