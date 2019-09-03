var hcppks_playType = 0;
var hcppks_playMethod = 0;
var hcppks_rebate;
var hcppksScroll;
var zhushu;
//进入这个页面时调用
function hcpPksPageLoadedPanel() {
	catchErrorFun("hcp_pks_init();");
}

//离开这个页面时调用
function hcpPksPageUnloadedPanel(){
	$("#hcpPks_queding").off('click');
	$("#hcpPksPage_back").off('click');
	$("#hcpPks_ballView").empty();
	$("#hcpPksSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hcpPksPlaySelect"></select>');
	$("#hcpPksSelect").append($select);
	$("#hcpPks_money").val('');
}

//入口函数
function hcp_pks_init(){
	$("#hcpPks_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
//	$("#hcpPks_title").html(current_LottreyId);//测试用；
	//玩法初始化；
	for(var i = 0; i< hcp_LotteryInfo.getPlayLength("hcp_pks");i++){
		var $play = $('<optgroup label="'+hcp_LotteryInfo.getPlayName("hcp_pks",i)+'"></optgroup>');
		for(var j = 0; j < hcp_LotteryInfo.getMethodLength("hcp_pks");j++){
			if(hcp_LotteryInfo.getMethodTypeId("hcp_pks",j) == hcp_LotteryInfo.getPlayTypeId("hcp_pks",i)){
				var name = hcp_LotteryInfo.getMethodName("hcp_pks",j);
				if(i == hcppks_playType && j == hcppks_playMethod){
					$play.append('<option value="hcppks'+hcp_LotteryInfo.getMethodIndex("hcp_pks",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hcppks'+hcp_LotteryInfo.getMethodIndex("hcp_pks",j)+'">' + name +'</option>');
				}
			}
		}
		$("#hcpPksPlaySelect").append($play);
	}

	[].slice.call( document.getElementById("hcpPksSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hcppksChangeItem
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
		hcppksChangeItem("hcppks"+hcppks_playMethod);
	});

	//添加滑动条
	if(!hcppksScroll){
		hcppksScroll = new IScroll('#hcpPksContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

	//获取期号
	hcp_getQihao("hcpPks",current_LottreyId);

	//获取上一期开奖
	hcp_queryLastPrize("hcpPks",current_LottreyId);

	//机选选号
	$("#hcpPks_random").off('click');
	$("#hcpPks_random").on('click', function(event) {
		hcppks_randomOne();
	});

	//返回
	$("#hcpPksPage_back").on('click', function(event) {
		hcppks_playType = 0;
		hcppks_playMethod = 0;
		$("#hcpPks_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hcpPks_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
		
		hcp_checkoutResult=[];
	});

	//清空
	hcp_qingKong("hcpPks","hcpPks");

	//提交
    $("#hcpPks_queding").off('click');
    $("#hcpPks_queding").on('click', function(event) {
        hcppks_submitData();
    });
}

function hcppksChangeItem(val) {
	hcpPks_qingkongAll();
	var temp = val.substring("hcppks".length,val.length);

	if(val == "hcppks0"){
		//整合
		$("#hcpPks_random").show();
		hcppks_playType = 0;
		hcppks_playMethod = 0;
		hcpPks_createTwelveLineLayout("hcpPks", function(){
			//计算注数；
			hcppks_calcNotes();
		});
		hcpPks_qingkongAll();
	}else if(val == "hcppks1"){
		//第1~10名
		$("#hcpPks_random").show();
		hcppks_playType = 0;
		hcppks_playMethod = 1;
		hcpPks_createTenLineLayout("hcpPks", function(){
			//计算注数；
			hcppks_calcNotes();
		});
		hcpPks_qingkongAll();
	}else if(val == "hcppks2"){
		//冠亚和值
		$("#hcpPks_random").show();
		hcppks_playType = 0;
		hcppks_playMethod = 2;
		hcpPks_createCrownValueLineLayout("hcpPks", function(){
			//计算注数；
			hcppks_calcNotes();
		});
		hcpPks_qingkongAll();
	}else if(val == "hcppks3"){
		//冠亚组合
		$("#hcpPks_random").show();
		hcppks_playType = 0;
		hcppks_playMethod = 3;
		hcpPks_createCrownCombinationLineLayout("hcpPks", function(){
			//计算注数；
			hcppks_calcNotes();
		});
	}
	
	if(hcppksScroll){
		hcppksScroll.refresh();
	}
	
	hcppks_calcNotes();
	initLossPercent("hcpPks");
	
	if(localStorageUtils.getParam("playFanDian")!=null && localStorageUtils.getParam("playFanDian")!= undefined){
		var Unite_rebate=new Object();
		Unite_rebate.value = localStorageUtils.getParam("playFanDian");
		//@ 计算赔率金额 
		hcpPks_calcRate(Unite_rebate);
	}
	
	localStorageUtils.setParam("MaxFanDian",$("#hcpPks_lossPercent option:last").val()) ;
}

//清空所有记录
function  hcpPks_qingkongAll(){
	$("#hcpPks_ballView span").removeClass('hcp_redBalls_active');
	$("#hcpPks_ballView span").removeClass('hcp_redBalls_property_active');
	hcp_LotteryStorage["hcpPks"]["line1"] = [];
	hcp_LotteryStorage["hcpPks"]["line2"] = [];
	hcp_LotteryStorage["hcpPks"]["line3"] = [];
	hcp_LotteryStorage["hcpPks"]["line4"] = [];
	hcp_LotteryStorage["hcpPks"]["line5"] = [];
	hcp_LotteryStorage["hcpPks"]["line6"] = [];
	hcp_LotteryStorage["hcpPks"]["line7"] = [];
	hcp_LotteryStorage["hcpPks"]["line8"] = [];
	hcp_LotteryStorage["hcpPks"]["line9"] = [];
	hcp_LotteryStorage["hcpPks"]["line10"] = [];
	hcp_LotteryStorage["hcpPks"]["line11"] = [];
	hcp_LotteryStorage["hcpPks"]["line12"] = [];

	localStorageUtils.removeParam("hcpPks_line1");
	localStorageUtils.removeParam("hcpPks_line2");
	localStorageUtils.removeParam("hcpPks_line3");
	localStorageUtils.removeParam("hcpPks_line4");
	localStorageUtils.removeParam("hcpPks_line5");
	localStorageUtils.removeParam("hcpPks_line6");
	localStorageUtils.removeParam("hcpPks_line7");
	localStorageUtils.removeParam("hcpPks_line8");
	localStorageUtils.removeParam("hcpPks_line9");
	localStorageUtils.removeParam("hcpPks_line10");
	localStorageUtils.removeParam("hcpPks_line11");
	localStorageUtils.removeParam("hcpPks_line12");

	hcppks_calcNotes();
	
	$("#hcpPks_money").val("");
}

/**
 * [hcppks_calcNotes 计算注数]
 */
function hcppks_calcNotes(){
	var notes = 0;

	if(hcppks_playMethod == 0){
		notes = hcp_LotteryStorage["hcpPks"]["line1"].length +
			hcp_LotteryStorage["hcpPks"]["line2"].length +
			hcp_LotteryStorage["hcpPks"]["line3"].length +
			hcp_LotteryStorage["hcpPks"]["line4"].length +
			hcp_LotteryStorage["hcpPks"]["line5"].length +
			hcp_LotteryStorage["hcpPks"]["line6"].length +
			hcp_LotteryStorage["hcpPks"]["line7"].length +
			hcp_LotteryStorage["hcpPks"]["line8"].length +
			hcp_LotteryStorage["hcpPks"]["line9"].length +
			hcp_LotteryStorage["hcpPks"]["line10"].length +
			hcp_LotteryStorage["hcpPks"]["line11"].length +
			hcp_LotteryStorage["hcpPks"]["line12"].length;
	}else if(hcppks_playMethod == 1){
		notes = hcp_LotteryStorage["hcpPks"]["line1"].length +
			hcp_LotteryStorage["hcpPks"]["line2"].length +
			hcp_LotteryStorage["hcpPks"]["line3"].length +
			hcp_LotteryStorage["hcpPks"]["line4"].length +
			hcp_LotteryStorage["hcpPks"]["line5"].length +
			hcp_LotteryStorage["hcpPks"]["line6"].length +
			hcp_LotteryStorage["hcpPks"]["line7"].length +
			hcp_LotteryStorage["hcpPks"]["line8"].length +
			hcp_LotteryStorage["hcpPks"]["line9"].length +
			hcp_LotteryStorage["hcpPks"]["line10"].length;
	}else if(hcppks_playMethod == 2){
		notes = hcp_LotteryStorage["hcpPks"]["line1"].length;
	}else if(hcppks_playMethod == 3){
		notes = hcp_LotteryStorage["hcpPks"]["line1"].length;
	}
	
	zhushu = notes;
	
	//底部Button显示隐藏
	hcppks_initFooterButton();
}

/**
 * [hcppks_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hcppks_initFooterButton(){
	if(hcppks_playMethod == 0){
		if(hcp_LotteryStorage["hcpPks"]["line1"].length > 0 || hcp_LotteryStorage["hcpPks"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line3"].length > 0 || hcp_LotteryStorage["hcpPks"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line5"].length > 0 || hcp_LotteryStorage["hcpPks"]["line6"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line7"].length > 0 || hcp_LotteryStorage["hcpPks"]["line8"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line9"].length > 0 || hcp_LotteryStorage["hcpPks"]["line10"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line11"].length >0 || hcp_LotteryStorage["hcpPks"]["line12"].length > 0 ){
			$("#hcpPks_qingkong").css("opacity",1.0);
		}else{
			$("#hcpPks_qingkong").css("opacity",0.4);
		}
	}else if(hcppks_playMethod == 1){
		if(hcp_LotteryStorage["hcpPks"]["line1"].length > 0 || hcp_LotteryStorage["hcpPks"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line3"].length > 0 || hcp_LotteryStorage["hcpPks"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line5"].length > 0 || hcp_LotteryStorage["hcpPks"]["line6"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line7"].length > 0 || hcp_LotteryStorage["hcpPks"]["line8"].length > 0 ||
			hcp_LotteryStorage["hcpPks"]["line9"].length > 0 || hcp_LotteryStorage["hcpPks"]["line10"].length > 0){
			$("#hcpPks_qingkong").css("opacity",1.0);
		}else{
			$("#hcpPks_qingkong").css("opacity",0.4);
		}
	}else if(hcppks_playMethod == 2 ){
		if(hcp_LotteryStorage["hcpPks"]["line1"].length > 0){
			$("#hcpPks_qingkong").css("opacity",1.0);
		}else{
			$("#hcpPks_qingkong").css("opacity",0.4);
		}
	}else if(hcppks_playMethod == 3 ){
		if(hcp_LotteryStorage["hcpPks"]["line1"].length > 0){
			$("#hcpPks_qingkong").css("opacity",1.0);
		}else{
			$("#hcpPks_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hcpPks_qingkong").css("opacity",0);
	}
	
	if($("#hcpPks_qingkong").css("opacity") == "0"){
		$("#hcpPks_qingkong").css("display","none");
	}else{
		$("#hcpPks_qingkong").css("display","block");
	}

	if(zhushu > 0){
		$("#hcpPks_queding").css("opacity",1.0);
	}else{
		$("#hcpPks_queding").css("opacity",0.4);
	}
}

/**
 * [hcppks_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hcppks_submitData(){
	var submitParams = new hcp_LotterySubmitParams();
	
		if(zhushu <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hcppks_calcNotes();
		
		//添加玩法位数描述
		hcppks_SelectionNumberDescription();
		
		submitParams.lotteryType = "hcpPks";
		var play = hcp_LotteryInfo.getPlayName("hcp_pks",hcppks_playType);//eg:盘口玩法
		var playMethod = hcp_LotteryInfo.getMethodName("hcp_pks",hcppks_playMethod);//eg:整合
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = hcppks_playType;
		submitParams.playMethodIndex = hcppks_playMethod;
		var selectedBalls = [];
		if(hcppks_playMethod == 0 ){//整合
			submitParams.nums = [hcp_LotteryStorage["hcpPks"]["line1"],hcp_LotteryStorage["hcpPks"]["line2"],hcp_LotteryStorage["hcpPks"]["line3"],hcp_LotteryStorage["hcpPks"]["line4"],hcp_LotteryStorage["hcpPks"]["line5"],hcp_LotteryStorage["hcpPks"]["line6"],hcp_LotteryStorage["hcpPks"]["line7"],hcp_LotteryStorage["hcpPks"]["line8"],hcp_LotteryStorage["hcpPks"]["line9"],hcp_LotteryStorage["hcpPks"]["line10"],hcp_LotteryStorage["hcpPks"]["line11"],hcp_LotteryStorage["hcpPks"]["line12"]];
		}else if(hcppks_playMethod == 1 ){//第1~10名
			submitParams.nums = [hcp_LotteryStorage["hcpPks"]["line1"],hcp_LotteryStorage["hcpPks"]["line2"],hcp_LotteryStorage["hcpPks"]["line3"],hcp_LotteryStorage["hcpPks"]["line4"],hcp_LotteryStorage["hcpPks"]["line5"],hcp_LotteryStorage["hcpPks"]["line6"],hcp_LotteryStorage["hcpPks"]["line7"],hcp_LotteryStorage["hcpPks"]["line8"],hcp_LotteryStorage["hcpPks"]["line9"],hcp_LotteryStorage["hcpPks"]["line10"]];
		}else if(hcppks_playMethod == 2 ){//冠亚和值
			submitParams.nums = [hcp_LotteryStorage["hcpPks"]["line1"]];
		}else if(hcppks_playMethod == 3 ){//冠亚组合
			submitParams.nums = [hcp_LotteryStorage["hcpPks"]["line1"]];
		}
		localStorageUtils.setParam("playFanDian",$("#hcpPks_lossPercent").val());
		submitParams.rebates = $('#hcpPks_lossPercent').val();
		submitParams.money = $("#hcpPks_money").val();
		submitParams.award = 2001;    //奖金        $('#cqssc_minAward').html()
		submitParams.maxAward = 2005;  //多级奖金     $('#cqssc_maxAward').html()
		submitParams.submit();
		$("#hcpPks_ballView").empty();
		hcpPks_qingkongAll();
}

/**
 * [添加玩法位数描述]
 */
function hcppks_SelectionNumberDescription(){
	var hcppks_arr = hcp_LotteryStorage["hcpPks"];
	if(hcppks_playMethod == 0 )var markArr=["冠亚和值:","冠军:","亚军:","第三名:","第四名:","第五名:","第六名:","第七名:","第八名:","第九名:","第十名:","VS:"];
	if(hcppks_playMethod == 1 )var markArr=["冠军:","亚军:","第三名:","第四名:","第五名:","第六名:","第七名:","第八名:","第九名:","第十名:"];
	if(hcppks_playMethod == 2 )var markArr=["冠亚和值:"];
	if(hcppks_playMethod == 3 )var markArr=["冠亚组合:"];
	var vs_arr=["冠军VS第十名:_龙","冠军VS第十名:_虎","亚军VS第九名:_龙","亚军VS第九名:_虎","第三名VS第八名:_龙","第三名VS第八名:_虎","第四名VS第七名:_龙","第四名VS第七名:_虎","第五名VS第六名:_龙","第五名VS第六名:_虎"];
	for (var i=0;i<12;i++){
		if(hcppks_arr["line"+(i+1)].length != 0){
			var item = hcppks_arr["line"+(i+1)];
			for (var j=0;j<item.length;j++){
				if(hcppks_playMethod == 3){//投注内容加[]
					var now_str = item[j].split("_");
					now_str[0] = "[" + now_str[0] + "]";
					var new_str="";
					for(var k=0;k<now_str.length;k++){
						if(k!=now_str.length-1){
							new_str += now_str[k] + "_" ;
						}else{
							new_str += now_str[k];
						}
					}
					item[j] = markArr[i] +  "_" + new_str;
				}else if (hcppks_playMethod == 0 && i ==11){//整合玩法  vs
					var now_str = item[j].split("_");
					var index = Number(now_str[1].slice(now_str[1].length-2,now_str[1].length))-45;//此玩法从45 开始的    转换投注内容
					now_str[0] = vs_arr[index];
					var new_str="";
					for(var k=0;k<now_str.length;k++){
						if(k!=now_str.length-1){
							new_str += now_str[k] + "_" ;
						}else{
							new_str += now_str[k];
						}
					}
					item[j] = new_str;
				}else{	
					item[j] = markArr[i] +  "_" + item[j];
				}
				
				
//				item[j] = markArr[i] +  "_" + item[j];
			}
			hcppks_arr["line"+(i+1)] = item;
		}
	}
	hcp_LotteryStorage["hcpPks"] = hcppks_arr;
}

/**
 * [hcppks_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hcppks_randomOne(){
	//选号
	hcpPks_Random();
	//计算注数
	hcppks_calcNotes();
	//提交，跳转出票
	hcppks_submitData();
}

/**
 * 出票机选
 * @param playMethod
 */
var isCheckOutPage_jixuan= 0;  //0-不是  1-是
function hcpPks_checkOutRandom(){
	isCheckOutPage_jixuan = 1;
	//选号
	hcpPks_Random();
	
	//添加玩法位数描述
	hcppks_SelectionNumberDescription();
	
	var obj = new Object();
	obj.lotteryType = "hcpPks";
	var play = hcp_LotteryInfo.getPlayName("hcp_pks",hcppks_playType);//eg:盘口玩法
	var playMethod = hcp_LotteryInfo.getMethodName("hcp_pks",hcppks_playMethod);//eg:整合
	obj.playType = play;
	obj.playMethod = playMethod;
	obj.playTypeIndex = hcppks_playType;
	obj.playMethodIndex = hcppks_playMethod;
	var selectedBalls = [];
	if(hcppks_playMethod == 0 ){//整合
		obj.nums = [hcp_LotteryStorage["hcpPks"]["line1"],hcp_LotteryStorage["hcpPks"]["line2"],hcp_LotteryStorage["hcpPks"]["line3"],hcp_LotteryStorage["hcpPks"]["line4"],hcp_LotteryStorage["hcpPks"]["line5"],hcp_LotteryStorage["hcpPks"]["line6"],hcp_LotteryStorage["hcpPks"]["line7"],hcp_LotteryStorage["hcpPks"]["line8"],hcp_LotteryStorage["hcpPks"]["line9"],hcp_LotteryStorage["hcpPks"]["line10"],hcp_LotteryStorage["hcpPks"]["line11"],hcp_LotteryStorage["hcpPks"]["line12"]];
	}else if(hcppks_playMethod == 1 ){//第1~10名
		obj.nums = [hcp_LotteryStorage["hcpPks"]["line1"],hcp_LotteryStorage["hcpPks"]["line2"],hcp_LotteryStorage["hcpPks"]["line3"],hcp_LotteryStorage["hcpPks"]["line4"],hcp_LotteryStorage["hcpPks"]["line5"],hcp_LotteryStorage["hcpPks"]["line6"],hcp_LotteryStorage["hcpPks"]["line7"],hcp_LotteryStorage["hcpPks"]["line8"],hcp_LotteryStorage["hcpPks"]["line9"],hcp_LotteryStorage["hcpPks"]["line10"]];
	}else if(hcppks_playMethod == 2 ){//冠亚和值
		obj.nums = [hcp_LotteryStorage["hcpPks"]["line1"]];
	}else if(hcppks_playMethod == 3 ){//冠亚组合
		obj.nums = [hcp_LotteryStorage["hcpPks"]["line1"]];
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
function hcpPks_Random(){
	hcp_defaultBetRebate = $('#hcpPks_lossPercent').val();
	
	if(isCheckOutPage_jixuan == 1){
		hcp_defaultBetRebate = localStorageUtils.getParam("MaxFanDian");//出票机选  默认最大返点；
	}
	
	hcpPks_qingkongAll();
	if(hcppks_playMethod == 0){//整合
		var type_index = Number(mathUtil.getNums(1,12)) + 1;//整合玩法索引；1~7
		var ballORrect;
		if(type_index == 1 || type_index == 2 || type_index == 3 || type_index == 4 || type_index == 5|| type_index == 6 || 
		   type_index == 7 || type_index == 8 || type_index == 9 || type_index == 10|| type_index == 11){
			var redBall = mathUtil.getNums(1,4);
			var value;
			if(redBall == 0)value="大";
			if(redBall == 1)value="小";
			if(redBall == 2)value="单";
			if(redBall == 3)value="双";
			var rebate = hcp_lottery_rebate[0].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_pks[Number(type_index)-1].play_code[Number(redBall)]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpPks"][line_str].push(redBall_info+"");
		}else if(type_index == 12 ){//vs
			var redBall = mathUtil.getNums(1,10);
			var value;
			var contentArray = ["1V10龙","2V9龙","3V8龙","4V7龙","5V6龙","1V10虎","2V9虎","3V8虎","4V7虎","5V6虎"];
			value = contentArray[Number(redBall)]
			var rebate = hcp_lottery_rebate[44 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_pks[Number(type_index)-1].play_code[Number(redBall)]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpPks"][line_str].push(redBall_info+"");
		}
	}else if(hcppks_playMethod == 1 ){//第1`10名
		var type_index = Number(mathUtil.getNums(1,10)) + 1;//整合玩法索引；1~7
		var rebate = hcp_lottery_rebate[54].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall = Number(mathUtil.getNums(1,10))+ 1;
		var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_pks[12 + type_index -1].play_code[redBall-1]+"_"+_rebate_value;
		var line_str = "line" + type_index;
		hcp_LotteryStorage["hcpPks"][line_str].push(redBall_info+"");
	}else if(hcppks_playMethod == 2 ){//冠亚和值
		var redBall = Number(mathUtil.getNums(1,17)) + 3;
		var rebate = hcp_lottery_rebate[154 + redBall -3].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall_info = redBall + "_" + current_LottreyId + hcp_playCode_pks[22].play_code[redBall-3]+"_"+_rebate_value;
		var line_str = "line1";
		hcp_LotteryStorage["hcpPks"][line_str].push(redBall_info+"");
	}else if(hcppks_playMethod == 3 ){//冠亚组合
		var redBall = mathUtil.getNums(1,45);
		var value;
		var contentArray = ["1-2","1-3","1-4","1-5","1-6","1-7","1-8","1-9","1-10","2-3","2-4","2-5","2-6","2-7","2-8","2-9","2-10","3-4","3-5","3-6","3-7","3-8","3-9","3-10","4-5","4-6","4-7","4-8","4-9","4-10","5-6","5-7","5-8","5-9","5-10","6-7","6-8","6-9","6-10","7-8","7-9","7-10","8-9","8-10","9-10"];
		value = contentArray[Number(redBall)]
		var rebate = hcp_lottery_rebate[171 + redBall[0]].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_pks[23].play_code[Number(redBall[0])]+"_"+_rebate_value;
		var line_str = "line1";
		hcp_LotteryStorage["hcpPks"][line_str].push(redBall_info+"");
	}
}

//@ 计算赔率金额 
function hcpPks_calcRate(obj) {
	hcpPks_qingkongAll();
	if (hcppks_playMethod == 0){
		for(var i=1;i<55;i++){
			var str = i;
			if(i<10)str = "0" + str;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpPks_lossPercent').blur();
		}
	}else if (hcppks_playMethod == 1){
		
		for(var i=55;i<155;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpPks_lossPercent').blur();
		}
	}else if (hcppks_playMethod == 2){
		for(var i=155;i<172;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpPks_lossPercent').blur();
		}
	}else if (hcppks_playMethod == 3){
		for(var i=172;i<217;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpPks_lossPercent').blur();
		}
	}
}