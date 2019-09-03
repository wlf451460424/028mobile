var hcpxync_playType = 0;
var hcpxync_playMethod = 0;
var hcpxync_rebate;
var hcpxyncScroll;
var zhushu;
//进入这个页面时调用
function hcpXyncPageLoadedPanel() {
	catchErrorFun("hcp_xync_init();");
}

//离开这个页面时调用
function hcpXyncPageUnloadedPanel(){
	$("#hcpXync_queding").off('click');
	$("#hcpXyncPage_back").off('click');
	$("#hcpXync_ballView").empty();
	$("#hcpXyncSelect").empty();
	var $select = $('<select class="cs-select cs-skin-overlay" id="hcpXyncPlaySelect"></select>');
	$("#hcpXyncSelect").append($select);
}

//入口函数
function hcp_xync_init(){
	$("#hcpXync_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
//	$("#hcpXync_title").html(current_LottreyId);//测试用；
	//玩法初始化；
	for(var i = 0; i< hcp_LotteryInfo.getPlayLength("hcp_xync");i++){
		var $play = $('<optgroup label="'+hcp_LotteryInfo.getPlayName("hcp_xync",i)+'"></optgroup>');
		for(var j = 0; j < hcp_LotteryInfo.getMethodLength("hcp_xync");j++){
			if(hcp_LotteryInfo.getMethodTypeId("hcp_xync",j) == hcp_LotteryInfo.getPlayTypeId("hcp_xync",i)){
				var name = hcp_LotteryInfo.getMethodName("hcp_xync",j);
				if(i == hcpxync_playType && j == hcpxync_playMethod){
					$play.append('<option value="hcpxync'+hcp_LotteryInfo.getMethodIndex("hcp_xync",j)+'" selected="selected">' + name +'</option>');
				}else{
					$play.append('<option value="hcpxync'+hcp_LotteryInfo.getMethodIndex("hcp_xync",j)+'">' + name +'</option>');
				}
			}
		}
		$("#hcpXyncPlaySelect").append($play);
	}
	
	[].slice.call( document.getElementById("hcpXyncSelect").querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
		new SelectFx(el, {
			stickyPlaceholder: true,
			onChange:hcpxyncChangeItem
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
		hcpxyncChangeItem("hcpxync"+hcpxync_playMethod);
	});

	//添加滑动条
	if(!hcpxyncScroll){
		hcpxyncScroll = new IScroll('#hcpXyncContent',{
			click:true,
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}
	
	//获取期号
	hcp_getQihao("hcpXync",current_LottreyId);
	
	//获取上一期开奖
	hcp_queryLastPrize("hcpXync",current_LottreyId);
	
	//机选选号
	$("#hcpXync_random").off('click');
	$("#hcpXync_random").on('click', function(event) {
		hcpxync_randomOne();
	});
	
	//返回
	$("#hcpXyncPage_back").on('click', function(event) {
		hcpxync_playType = 0;
		hcpxync_playMethod = 0;
		$("#hcpXync_ballView").empty();
		localStorageUtils.removeParam("playMode");
		localStorageUtils.removeParam("playBeiNum");
		localStorageUtils.removeParam("playFanDian");
		hcpXync_qingkongAll();
		setPanelBackPage_Fun('lotteryHallPage');
		
		hcp_checkoutResult=[];
	});
	
	//清空
	hcp_qingKong("hcpXync","hcpXync");
	
	//提交
    $("#hcpXync_queding").off('click');
    $("#hcpXync_queding").on('click', function(event) {
        hcpxync_submitData();
    });
}

function hcpxyncChangeItem(val) {
	hcpXync_qingkongAll();
	var temp = val.substring("hcpxync".length,val.length);

	if(val == "hcpxync0"){
		//两面盘
		$("#hcpXync_random").show();
		hcpxync_playType = 0;
		hcpxync_playMethod = 0;
		hcpXync_createFiveLineLayout("hcpXync", function(){
			//计算注数；
			hcpxync_calcNotes();
		});
		hcpXync_qingkongAll();
	}else if(val == "hcpxync1"){
		//单号
		$("#hcpXync_random").show();
		hcpxync_playType = 0;
		hcpxync_playMethod = 1;
		hcpXync_createFiveLineSingleNumLayout("hcpXync", function(){
			//计算注数；
			hcpxync_calcNotes();
		});
		hcpXync_qingkongAll();
	}else if(val == "hcpxync2"){
		//龙虎斗
		$("#hcpXync_random").show();
		hcpxync_playType = 0;
		hcpxync_playMethod = 2;
		hcpXync_LonghudouLayout("hcpXync", function(){
			//计算注数；
			hcpxync_calcNotes();
		});
		hcpXync_qingkongAll();
	}else if(val == "hcpxync3"){
		//全8中1 
		$("#hcpXync_random").show();
		hcpxync_playType = 0;
		hcpxync_playMethod = 3;
		hcpXync_OneLineLayout("hcpXync", function(){
			//计算注数；
			hcpxync_calcNotes();
		});
		hcpXync_qingkongAll();
	}
	
	if(hcpxyncScroll){
		hcpxyncScroll.refresh();
	}
	
	hcpxync_calcNotes();
	initLossPercent("hcpXync");
	
	if(localStorageUtils.getParam("playFanDian")!=null && localStorageUtils.getParam("playFanDian")!= undefined){
		var Unite_rebate=new Object();
		Unite_rebate.value = localStorageUtils.getParam("playFanDian");
		//@ 计算赔率金额 
		hcpXync_calcRate(Unite_rebate);
	}
	
	localStorageUtils.setParam("MaxFanDian",$("#hcpXync_lossPercent option:last").val()) ;
}

//清空所有记录
function  hcpXync_qingkongAll(){
	$("#hcpXync_ballView span").removeClass('hcp_redBalls_active');
	$("#hcpXync_ballView span").removeClass('hcp_redBalls_property_active');
	hcp_LotteryStorage["hcpXync"]["line1"] = [];hcp_LotteryStorage["hcpXync"]["line2"] = [];hcp_LotteryStorage["hcpXync"]["line3"] = [];hcp_LotteryStorage["hcpXync"]["line4"] = [];
	hcp_LotteryStorage["hcpXync"]["line5"] = [];hcp_LotteryStorage["hcpXync"]["line6"] = [];hcp_LotteryStorage["hcpXync"]["line7"] = [];hcp_LotteryStorage["hcpXync"]["line8"] = [];
	hcp_LotteryStorage["hcpXync"]["line9"] = [];hcp_LotteryStorage["hcpXync"]["line10"] = [];hcp_LotteryStorage["hcpXync"]["line11"] = [];hcp_LotteryStorage["hcpXync"]["line12"] = [];
	hcp_LotteryStorage["hcpXync"]["line13"] = [];hcp_LotteryStorage["hcpXync"]["line14"] = [];hcp_LotteryStorage["hcpXync"]["line15"] = [];hcp_LotteryStorage["hcpXync"]["line16"] = [];
	hcp_LotteryStorage["hcpXync"]["line17"] = [];hcp_LotteryStorage["hcpXync"]["line18"] = [];hcp_LotteryStorage["hcpXync"]["line19"] = [];hcp_LotteryStorage["hcpXync"]["line20"] = [];
	hcp_LotteryStorage["hcpXync"]["line21"] = [];hcp_LotteryStorage["hcpXync"]["line22"] = [];hcp_LotteryStorage["hcpXync"]["line23"] = [];hcp_LotteryStorage["hcpXync"]["line24"] = [];
	hcp_LotteryStorage["hcpXync"]["line25"] = [];hcp_LotteryStorage["hcpXync"]["line26"] = [];hcp_LotteryStorage["hcpXync"]["line27"] = [];hcp_LotteryStorage["hcpXync"]["line28"] = [];
	
	localStorageUtils.removeParam("hcpXync_line1");localStorageUtils.removeParam("hcpXync_line2");localStorageUtils.removeParam("hcpXync_line3");localStorageUtils.removeParam("hcpXync_line4");
	localStorageUtils.removeParam("hcpXync_line5");localStorageUtils.removeParam("hcpXync_line6");localStorageUtils.removeParam("hcpXync_line7");localStorageUtils.removeParam("hcpXync_line8");
	localStorageUtils.removeParam("hcpXync_line9");localStorageUtils.removeParam("hcpXync_line10");localStorageUtils.removeParam("hcpXync_line11");localStorageUtils.removeParam("hcpXync_line12");
	localStorageUtils.removeParam("hcpXync_line13");localStorageUtils.removeParam("hcpXync_line14");localStorageUtils.removeParam("hcpXync_line15");localStorageUtils.removeParam("hcpXync_line16");
	localStorageUtils.removeParam("hcpXync_line17");localStorageUtils.removeParam("hcpXync_line18");localStorageUtils.removeParam("hcpXync_line19");localStorageUtils.removeParam("hcpXync_line20");
	localStorageUtils.removeParam("hcpXync_line21");localStorageUtils.removeParam("hcpXync_line22");localStorageUtils.removeParam("hcpXync_line23");localStorageUtils.removeParam("hcpXync_line24");
	localStorageUtils.removeParam("hcpXync_line25");localStorageUtils.removeParam("hcpXync_line26");localStorageUtils.removeParam("hcpXync_line27");localStorageUtils.removeParam("hcpXync_line28");

	hcpxync_calcNotes();
	
	$("#hcpXync_money").val("");
}

/**
 * [cqssc_calcNotes 计算注数]
 */
function hcpxync_calcNotes(){
	var notes = 0;

	if(hcpxync_playMethod == 0){
		notes = hcp_LotteryStorage["hcpXync"]["line1"].length +
			hcp_LotteryStorage["hcpXync"]["line2"].length +
			hcp_LotteryStorage["hcpXync"]["line3"].length +
			hcp_LotteryStorage["hcpXync"]["line4"].length +
			hcp_LotteryStorage["hcpXync"]["line5"].length +
			hcp_LotteryStorage["hcpXync"]["line6"].length +
			hcp_LotteryStorage["hcpXync"]["line7"].length +
			hcp_LotteryStorage["hcpXync"]["line8"].length +
			hcp_LotteryStorage["hcpXync"]["line9"].length;
	}else if(hcpxync_playMethod == 1){
		notes = hcp_LotteryStorage["hcpXync"]["line1"].length + hcp_LotteryStorage["hcpXync"]["line2"].length + hcp_LotteryStorage["hcpXync"]["line3"].length + hcp_LotteryStorage["hcpXync"]["line4"].length +
				hcp_LotteryStorage["hcpXync"]["line5"].length + hcp_LotteryStorage["hcpXync"]["line6"].length + hcp_LotteryStorage["hcpXync"]["line7"].length + hcp_LotteryStorage["hcpXync"]["line8"].length ;
	}else if(hcpxync_playMethod == 2){
		notes = hcp_LotteryStorage["hcpXync"]["line1"].length + hcp_LotteryStorage["hcpXync"]["line2"].length + hcp_LotteryStorage["hcpXync"]["line3"].length + hcp_LotteryStorage["hcpXync"]["line4"].length +
				hcp_LotteryStorage["hcpXync"]["line5"].length + hcp_LotteryStorage["hcpXync"]["line6"].length + hcp_LotteryStorage["hcpXync"]["line7"].length + hcp_LotteryStorage["hcpXync"]["line8"].length +
				hcp_LotteryStorage["hcpXync"]["line9"].length + hcp_LotteryStorage["hcpXync"]["line10"].length + hcp_LotteryStorage["hcpXync"]["line11"].length + hcp_LotteryStorage["hcpXync"]["line12"].length + 
				hcp_LotteryStorage["hcpXync"]["line13"].length + hcp_LotteryStorage["hcpXync"]["line14"].length + hcp_LotteryStorage["hcpXync"]["line15"].length + hcp_LotteryStorage["hcpXync"]["line16"].length + 
				hcp_LotteryStorage["hcpXync"]["line17"].length + hcp_LotteryStorage["hcpXync"]["line18"].length + hcp_LotteryStorage["hcpXync"]["line19"].length + hcp_LotteryStorage["hcpXync"]["line20"].length + 
				hcp_LotteryStorage["hcpXync"]["line21"].length + hcp_LotteryStorage["hcpXync"]["line22"].length + hcp_LotteryStorage["hcpXync"]["line23"].length + hcp_LotteryStorage["hcpXync"]["line24"].length + 
				hcp_LotteryStorage["hcpXync"]["line25"].length + hcp_LotteryStorage["hcpXync"]["line26"].length + hcp_LotteryStorage["hcpXync"]["line27"].length + hcp_LotteryStorage["hcpXync"]["line28"].length;
	}else if(hcpxync_playMethod == 3){
		notes = hcp_LotteryStorage["hcpXync"]["line1"].length;
	}
	
	zhushu = notes;
	
	//底部Button显示隐藏
	hcpxync_initFooterButton();
}


/**
 * [hcpxync_initFooterButton 初始化底部Button显示隐藏]
 * @return {[type]} [description]
 */
function hcpxync_initFooterButton(){
	if(hcpxync_playMethod == 0){
		if(hcp_LotteryStorage["hcpXync"]["line1"].length > 0 || hcp_LotteryStorage["hcpXync"]["line2"].length > 0 ||
			hcp_LotteryStorage["hcpXync"]["line3"].length > 0 || hcp_LotteryStorage["hcpXync"]["line4"].length > 0 ||
			hcp_LotteryStorage["hcpXync"]["line5"].length > 0 || hcp_LotteryStorage["hcpXync"]["line6"].length > 0 ||
			hcp_LotteryStorage["hcpXync"]["line7"].length > 0 || hcp_LotteryStorage["hcpXync"]["line8"].length > 0 ||
			hcp_LotteryStorage["hcpXync"]["line9"].length > 0){
			$("#hcpXync_qingkong").css("opacity",1.0);
		}else{
			$("#hcpXync_qingkong").css("opacity",0.4);
		}
	}else if(hcpxync_playMethod == 1){
		if(hcp_LotteryStorage["hcpXync"]["line1"].length > 0 || hcp_LotteryStorage["hcpXync"]["line2"].length > 0 || hcp_LotteryStorage["hcpXync"]["line3"].length > 0 || hcp_LotteryStorage["hcpXync"]["line4"].length ||
				hcp_LotteryStorage["hcpXync"]["line5"].length > 0 || hcp_LotteryStorage["hcpXync"]["line6"].length > 0 || hcp_LotteryStorage["hcpXync"]["line7"].length > 0 || hcp_LotteryStorage["hcpXync"]["line8"].length){
			$("#hcpXync_qingkong").css("opacity",1.0);
		}else{
			$("#hcpXync_qingkong").css("opacity",0.4);
		}
	}else if(hcpxync_playMethod == 2){
		if(hcp_LotteryStorage["hcpXync"]["line1"].length > 0 || hcp_LotteryStorage["hcpXync"]["line2"].length > 0 || hcp_LotteryStorage["hcpXync"]["line3"].length > 0 || hcp_LotteryStorage["hcpXync"]["line4"].length ||
				hcp_LotteryStorage["hcpXync"]["line5"].length > 0 || hcp_LotteryStorage["hcpXync"]["line6"].length > 0 || hcp_LotteryStorage["hcpXync"]["line7"].length > 0 || hcp_LotteryStorage["hcpXync"]["line8"].length ||
				hcp_LotteryStorage["hcpXync"]["line9"].length > 0 || hcp_LotteryStorage["hcpXync"]["line10"].length > 0 || hcp_LotteryStorage["hcpXync"]["line11"].length > 0 || hcp_LotteryStorage["hcpXync"]["line12"].length || 
				hcp_LotteryStorage["hcpXync"]["line13"].length > 0 || hcp_LotteryStorage["hcpXync"]["line14"].length > 0 || hcp_LotteryStorage["hcpXync"]["line15"].length > 0 || hcp_LotteryStorage["hcpXync"]["line16"].length || 
				hcp_LotteryStorage["hcpXync"]["line17"].length > 0 || hcp_LotteryStorage["hcpXync"]["line18"].length > 0 || hcp_LotteryStorage["hcpXync"]["line19"].length > 0 || hcp_LotteryStorage["hcpXync"]["line20"].length || 
				hcp_LotteryStorage["hcpXync"]["line21"].length > 0 || hcp_LotteryStorage["hcpXync"]["line22"].length > 0 || hcp_LotteryStorage["hcpXync"]["line23"].length > 0 || hcp_LotteryStorage["hcpXync"]["line24"].length || 
				hcp_LotteryStorage["hcpXync"]["line25"].length > 0 || hcp_LotteryStorage["hcpXync"]["line26"].length > 0 || hcp_LotteryStorage["hcpXync"]["line27"].length > 0 || hcp_LotteryStorage["hcpXync"]["line28"].length){
			$("#hcpXync_qingkong").css("opacity",1.0);
		}else{
			$("#hcpXync_qingkong").css("opacity",0.4);
		}
	}else if(hcpxync_playMethod == 3 ){
		if(hcp_LotteryStorage["hcpXync"]["line1"].length > 0){
			$("#hcpXync_qingkong").css("opacity",1.0);
		}else{
			$("#hcpXync_qingkong").css("opacity",0.4);
		}
	}else{
		$("#hcpXync_qingkong").css("opacity",0);
	}
	
	if($("#hcpXync_qingkong").css("opacity") == "0"){
		$("#hcpXync_qingkong").css("display","none");
	}else{
		$("#hcpXync_qingkong").css("display","block");
	}

	if(zhushu > 0){
		$("#hcpXync_queding").css("opacity",1.0);
	}else{
		$("#hcpXync_queding").css("opacity",0.4);
	}
}

/**
 * [hcpxync_submitData 确认提交数据]
 * @return {[type]} [description]
 */
function hcpxync_submitData(){
	var submitParams = new hcp_LotterySubmitParams();
	
		if(zhushu <= 0){
			toastUtils.showToast('请至少选择一注');
			return;
		}
		hcpxync_calcNotes();
		
		//添加玩法位数描述
		hcpxync_SelectionNumberDescription();
		
		submitParams.lotteryType = "hcpXync";
		var play = hcp_LotteryInfo.getPlayName("hcp_xync",hcpxync_playType);//eg:盘口玩法
		var playMethod = hcp_LotteryInfo.getMethodName("hcp_xync",hcpxync_playMethod);//eg:整合
		submitParams.playType = play;
		submitParams.playMethod = playMethod;
		submitParams.playTypeIndex = hcpxync_playType;
		submitParams.playMethodIndex = hcpxync_playMethod;
		var selectedBalls = [];
		if(hcpxync_playMethod == 0 ){//两面盘
			submitParams.nums = [hcp_LotteryStorage["hcpXync"]["line1"],hcp_LotteryStorage["hcpXync"]["line2"],hcp_LotteryStorage["hcpXync"]["line3"],hcp_LotteryStorage["hcpXync"]["line4"],hcp_LotteryStorage["hcpXync"]["line5"],hcp_LotteryStorage["hcpXync"]["line6"],hcp_LotteryStorage["hcpXync"]["line7"],hcp_LotteryStorage["hcpXync"]["line8"],hcp_LotteryStorage["hcpXync"]["line9"]];
		}else if(hcpxync_playMethod == 1 ){//单号
			submitParams.nums = [hcp_LotteryStorage["hcpXync"]["line1"],hcp_LotteryStorage["hcpXync"]["line2"],hcp_LotteryStorage["hcpXync"]["line3"],hcp_LotteryStorage["hcpXync"]["line4"],hcp_LotteryStorage["hcpXync"]["line5"],hcp_LotteryStorage["hcpXync"]["line6"],hcp_LotteryStorage["hcpXync"]["line7"],hcp_LotteryStorage["hcpXync"]["line8"]];
		}else if(hcpxync_playMethod == 2 ){//龙虎斗
			submitParams.nums = [hcp_LotteryStorage["hcpXync"]["line1"],hcp_LotteryStorage["hcpXync"]["line2"],hcp_LotteryStorage["hcpXync"]["line3"],hcp_LotteryStorage["hcpXync"]["line4"],
				hcp_LotteryStorage["hcpXync"]["line5"],hcp_LotteryStorage["hcpXync"]["line6"],hcp_LotteryStorage["hcpXync"]["line7"],hcp_LotteryStorage["hcpXync"]["line8"],
				hcp_LotteryStorage["hcpXync"]["line9"],hcp_LotteryStorage["hcpXync"]["line10"],hcp_LotteryStorage["hcpXync"]["line11"],hcp_LotteryStorage["hcpXync"]["line12"],
				hcp_LotteryStorage["hcpXync"]["line13"],hcp_LotteryStorage["hcpXync"]["line14"],hcp_LotteryStorage["hcpXync"]["line15"],hcp_LotteryStorage["hcpXync"]["line16"],
				hcp_LotteryStorage["hcpXync"]["line17"],hcp_LotteryStorage["hcpXync"]["line18"],hcp_LotteryStorage["hcpXync"]["line19"],hcp_LotteryStorage["hcpXync"]["line20"],
				hcp_LotteryStorage["hcpXync"]["line21"],hcp_LotteryStorage["hcpXync"]["line22"],hcp_LotteryStorage["hcpXync"]["line23"],hcp_LotteryStorage["hcpXync"]["line24"], 
				hcp_LotteryStorage["hcpXync"]["line25"],hcp_LotteryStorage["hcpXync"]["line26"],hcp_LotteryStorage["hcpXync"]["line27"],hcp_LotteryStorage["hcpXync"]["line28"]];
		}else if(hcpxync_playMethod == 3 ){//全8 中1
			submitParams.nums = [hcp_LotteryStorage["hcpXync"]["line1"]];
		}
		localStorageUtils.setParam("playFanDian",$("#hcpXync_lossPercent").val());
		submitParams.rebates = $('#hcpXync_lossPercent').val();
		submitParams.money = $("#hcpXync_money").val();
		submitParams.award = 2001;    //奖金        $('#cqssc_minAward').html()
		submitParams.maxAward = 2005;  //多级奖金     $('#cqssc_maxAward').html()
		submitParams.submit();
		$("#hcpXync_ballView").empty();
		hcpXync_qingkongAll();
}

/**
 * [添加玩法位数描述]
 */
function hcpxync_SelectionNumberDescription(){
	var hcpxync_arr = hcp_LotteryStorage["hcpXync"];
	if(hcpxync_playMethod == 0 )var markArr=["总和:","第一球:","第二球:","第三球:","第四球:","第五球:","第六球:","第七球:","第八球:"];
	if(hcpxync_playMethod == 1 )var markArr=["第一球:","第二球:","第三球:","第四球:","第五球:","第六球:","第七球:","第八球:"];
	if(hcpxync_playMethod == 2 )var markArr=["第一球vs第二球:","第一球vs第三球:","第一球vs第四球:","第一球vs第五球:","第一球vs第六球:","第一球vs第七球:","第一球vs第八球:","第二球vs第三球:","第二球vs第四球:","第二球vs第五球:","第二球vs第六球:","第二球vs第七球:","第二球vs第八球:","第三球vs第四球:","第三球vs第五球:","第三球vs第六球:","第三球vs第七球:","第三球vs第八球:","第四球vs第五球:","第四球vs第六球:","第四球vs第七球:","第四球vs第八球:","第五球vs第六球:","第五球vs第七球:","第五球vs第八球:","第六球vs第七球:","第六球vs第八球:","第七球vs第八球:"];
	if(hcpxync_playMethod == 3 )var markArr=["全8中1:"];
	for (var i=0;i<28;i++){
		if(hcpxync_arr["line"+(i+1)].length != 0){
			var item = hcpxync_arr["line"+(i+1)];
			for (var j=0;j<item.length;j++){
				item[j] = markArr[i] +  "_" + item[j];
			}
			hcpxync_arr["line"+(i+1)] = item;
		}
	}
	hcp_LotteryStorage["hcpXync"] = hcpxync_arr;
}

/**
 * [hcpxync_randomOne 随机一注]
 * @return {[type]} [description]
 */
function hcpxync_randomOne(){
	//选号
	hcpXync_Random();
	//计算注数
	hcpxync_calcNotes();
	//提交，跳转出票
	hcpxync_submitData();
}

/**
 * 出票机选
 * @param playMethod
 */
var isCheckOutPage_jixuan= 0;  //0-不是  1-是
function hcpXync_checkOutRandom(){
	isCheckOutPage_jixuan = 1;
	//选号
	hcpXync_Random();
	
	//添加玩法位数描述
	hcpxync_SelectionNumberDescription();
	
	var obj = new Object();
	obj.lotteryType = "hcpXync";
	var play = hcp_LotteryInfo.getPlayName("hcp_xync",hcpxync_playType);//eg:盘口玩法
	var playMethod = hcp_LotteryInfo.getMethodName("hcp_xync",hcpxync_playMethod);//eg:整合
	obj.playType = play;
	obj.playMethod = playMethod;
	obj.playTypeIndex = hcpxync_playType;
	obj.playMethodIndex = hcpxync_playMethod;
	var selectedBalls = [];
	if(hcpxync_playMethod == 0 ){//两面盘
		obj.nums = [hcp_LotteryStorage["hcpXync"]["line1"],hcp_LotteryStorage["hcpXync"]["line2"],hcp_LotteryStorage["hcpXync"]["line3"],hcp_LotteryStorage["hcpXync"]["line4"],hcp_LotteryStorage["hcpXync"]["line5"],hcp_LotteryStorage["hcpXync"]["line6"],hcp_LotteryStorage["hcpXync"]["line7"],hcp_LotteryStorage["hcpXync"]["line8"],hcp_LotteryStorage["hcpXync"]["line9"]];
	}else if(hcpxync_playMethod == 1 ){//单号
		obj.nums = [hcp_LotteryStorage["hcpXync"]["line1"],hcp_LotteryStorage["hcpXync"]["line2"],hcp_LotteryStorage["hcpXync"]["line3"],hcp_LotteryStorage["hcpXync"]["line4"],hcp_LotteryStorage["hcpXync"]["line5"],hcp_LotteryStorage["hcpXync"]["line6"],hcp_LotteryStorage["hcpXync"]["line7"],hcp_LotteryStorage["hcpXync"]["line8"]];
	}else if(hcpxync_playMethod == 2 ){//龙虎斗
		obj.nums = [hcp_LotteryStorage["hcpXync"]["line1"],hcp_LotteryStorage["hcpXync"]["line2"],hcp_LotteryStorage["hcpXync"]["line3"],hcp_LotteryStorage["hcpXync"]["line4"],
				hcp_LotteryStorage["hcpXync"]["line5"],hcp_LotteryStorage["hcpXync"]["line6"],hcp_LotteryStorage["hcpXync"]["line7"],hcp_LotteryStorage["hcpXync"]["line8"],
				hcp_LotteryStorage["hcpXync"]["line9"],hcp_LotteryStorage["hcpXync"]["line10"],hcp_LotteryStorage["hcpXync"]["line11"],hcp_LotteryStorage["hcpXync"]["line12"],
				hcp_LotteryStorage["hcpXync"]["line13"],hcp_LotteryStorage["hcpXync"]["line14"],hcp_LotteryStorage["hcpXync"]["line15"],hcp_LotteryStorage["hcpXync"]["line16"],
				hcp_LotteryStorage["hcpXync"]["line17"],hcp_LotteryStorage["hcpXync"]["line18"],hcp_LotteryStorage["hcpXync"]["line19"],hcp_LotteryStorage["hcpXync"]["line20"],
				hcp_LotteryStorage["hcpXync"]["line21"],hcp_LotteryStorage["hcpXync"]["line22"],hcp_LotteryStorage["hcpXync"]["line23"],hcp_LotteryStorage["hcpXync"]["line24"], 
				hcp_LotteryStorage["hcpXync"]["line25"],hcp_LotteryStorage["hcpXync"]["line26"],hcp_LotteryStorage["hcpXync"]["line27"],hcp_LotteryStorage["hcpXync"]["line28"]];
	}else if(hcpxync_playMethod == 3 ){//全8 中1
		obj.nums = [hcp_LotteryStorage["hcpXync"]["line1"]];
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
function hcpXync_Random(){
	hcp_defaultBetRebate = $('#hcpXync_lossPercent').val();
	
	if(isCheckOutPage_jixuan == 1){
		hcp_defaultBetRebate = localStorageUtils.getParam("MaxFanDian");//出票机选  默认最大返点；
	}
	
	hcpXync_qingkongAll();
	if(hcpxync_playMethod == 0){//两面盘
		var type_index = Number(mathUtil.getNums(1,8)) + 1;//整合玩法索引；1~9
		if(type_index == 1 ){
			var redBall = mathUtil.getNums(1,6);
			var value;
			if(redBall == 0)value="大";
			if(redBall == 1)value="小";
			if(redBall == 2)value="单";
			if(redBall == 3)value="双";
			if(redBall == 4)value="尾大";
			if(redBall == 5)value="尾小";
			var rebate = hcp_lottery_rebate[Number(redBall)].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_xync[type_index-1].play_code[Number(redBall)]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpXync"][line_str].push(redBall_info+"");
		}else if(type_index == 2 || type_index == 3 || type_index == 4 || type_index == 5 || type_index == 6 || type_index == 7 || type_index == 8){
			var redBall = mathUtil.getNums(1,8);
			var value;
			if(redBall == 0)value="大";
			if(redBall == 1)value="小";
			if(redBall == 2)value="单";
			if(redBall == 3)value="双";
			if(redBall == 4)value="尾大";
			if(redBall == 5)value="尾小";
			if(redBall == 6)value="合单";
			if(redBall == 7)value="合双";
			var rebate = hcp_lottery_rebate[6+Number(redBall)].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
			//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
			var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
			var redBall_info = value + "_" + current_LottreyId +  hcp_playCode_xync[type_index-1].play_code[Number(redBall)]+"_"+_rebate_value;
			var line_str = "line" + type_index;
			hcp_LotteryStorage["hcpXync"][line_str].push(redBall_info+"");
		}
	}else if(hcpxync_playMethod == 1 ){//单号
		var type_index = Number(mathUtil.getNums(1,8)) + 1;//单号玩法索引
		var rebate = hcp_lottery_rebate[70].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall = mathUtil.getNums(1,20);
		var redBall_info = (Number(redBall[0])+1) + "_" + current_LottreyId + hcp_playCode_xync[8+type_index].play_code[Number(redBall)]+"_"+_rebate_value;
		var line_str = "line" + type_index;
		hcp_LotteryStorage["hcpXync"][line_str].push(redBall_info+"");
	}else if(hcpxync_playMethod == 2 ){//龙虎斗
		var type_index = Number(mathUtil.getNums(1,28)) + 1;//龙虎斗玩法索引；1~28
		var redBall = mathUtil.getNums(1,2);
		var value;
		if(redBall == 0)value="龙";
		if(redBall == 1)value="虎";
		var rebate = hcp_lottery_rebate[230 + Number(redBall)].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var _playcode = hcp_playCode_xync[17].play_code.slice((type_index-1)*2,((type_index-1)*2+2));
		var redBall_info = value + "_" + current_LottreyId + _playcode[Number(redBall)]+"_"+_rebate_value;
		var line_str = "line" + type_index;
		hcp_LotteryStorage["hcpXync"][line_str].push(redBall_info+"");
	}else if(hcpxync_playMethod == 3 ){//全8中1
		var redBall = mathUtil.getNums(1,20);
		var rebate = hcp_lottery_rebate[286 + Number(redBall)].AwardLevelInfo[0].AwardAmount;//机选的时候赔率都是默认最大的；
		//parseInt((rebate*(hcp_defaultBetRebate/rebate_base))*10000)/10000
		var _rebate_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(rebate,bigNumberUtil.divided(hcp_defaultBetRebate,rebate_base)),10000)),10000);
		var redBall_info = (Number(redBall[0])+1) + "_" + current_LottreyId + hcp_playCode_xync[18].play_code[Number(redBall)]+"_"+_rebate_value;
		var line_str = "line1";
		hcp_LotteryStorage["hcpXync"][line_str].push(redBall_info+"");
	}
}

//@ 计算赔率金额 
function hcpXync_calcRate(obj) {
	hcpXync_qingkongAll();
	if (hcpxync_playMethod == 0){
		for(var i=1;i<71;i++){
			var str = i;
			if(i<10)str = "0" + str;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpXync_lossPercent').blur();
		}
	}else if (hcpxync_playMethod == 1){
		
		for(var i=71;i<231;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpXync_lossPercent').blur();
		}
	}else if (hcpxync_playMethod == 2){
		for(var i=231;i<287;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpXync_lossPercent').blur();
		}
	}else if (hcpxync_playMethod == 3){
		for(var i=287;i<307;i++){
			var str = i;
			if(!$("#Odds_"+str)[0])continue;
			var base = $("#Odds_"+str)[0].attributes[1].value;
			//var rebate_transform = bigNumberUtil.multiply(obj.value,1000);
			var rebate_transform = obj.value;
			var show_value = bigNumberUtil.divided(parseInt(bigNumberUtil.multiply(bigNumberUtil.multiply(base,bigNumberUtil.divided(rebate_transform,rebate_base)),10000)),10000);
			//parseInt((base*(obj.value/rebate_base*1000))*10000)/10000
			$("#Odds_"+str).text(show_value.toString());
			$('#hcpXync_lossPercent').blur();
		}
	}
}