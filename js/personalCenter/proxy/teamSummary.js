//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
var xAxis = [];
var selectDateStartTS;
var selectDateEndTS;
var days = 7;
var myUserID;
var dataType = 0;

/*进入panel时调用*/
function teamSummaryLoadedPanel(){
	catchErrorFun("teamSummaryRecordsInit()");
}
/*离开panel时调用*/
function teamSummaryUnloadedPanel(){
    clearSearchTerm();      
    startDateTime = "";
    endDateTime = ""; 
    $("#teamSumData").empty();
	$("#teamSummaryScroller table").empty();
	$("#weekChart").css("backgroundColor","#f9f9f9");
	$("#monthChart").css("backgroundColor","#f9f9f9");
	$("#weekChart").css("color","#333");
	$("#monthChart").css("color","#333");
	$("#lineChart").empty();

	if(selectDateStartTS){
		selectDateStartTS.dismiss();
	}
	if(selectDateEndTS){
		selectDateEndTS.dismiss();
	}
}
//@ Init
function teamSummaryRecordsInit(){
	$("#teamSumData").empty();
	myUserID = localStorageUtils.getParam("myUserID");

	$("#teamSummaryScroller table").append('<tr><td style="display: none;"></td><td style="width: 48%"><input style="text-align: center;border: 1px solid #cccccc;" type="text" id="selectDateTeamSummary_Stt" readonly/></td><td style="width: 48%"><input style="text-align: center;border: 1px solid #cccccc;" type="text" id="selectDateTeamSummary_End" readonly/></td></tr>');

	//Page Scroller
	hasMorePage = true;
	var myScroller_report = $("#teamSummaryScroller").scroller({
		verticalScroll : true,
		horizontalScroll : false,
		vScrollCSS: "afScrollbar",
		autoEnable : true
	});
	myScroller_report.scrollToTop();
	myScroller_report.clearInfinite();

	$("#selectDateTeamSummary_Stt").val(initDefaultDate(-1,"day"));
	$("#selectDateTeamSummary_End").val(initDefaultDate(-1,"day"));

	selectDateStartTS = new MobileSelectDate();
	selectDateStartTS.init({trigger:'#selectDateTeamSummary_Stt',min:initDefaultDate(-DayRange_3month,"day"),max:initDefaultDate(-1,"day")});
	selectDateEndTS = new MobileSelectDate();
	selectDateEndTS.init({trigger:'#selectDateTeamSummary_End',min:initDefaultDate(-DayRange_3month,"day"),max:initDefaultDate(-1,"day")});

	//查询开始时间
	startDateTime = initDefaultDate(-7,'day') + hms00;
	//查询结束时间
	endDateTime = initDefaultDate(0,'day') + hms59;

	// Init - First time.
	$("#weekChart").css({"backgroundColor":"#FE5D39","color":"#fff"});
	$("#weekChart").siblings().css({"backgroundColor":"#f9f9f9","color":"#333"});

	// 查询今日数据
	ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetTeamOverViewDayList","UserID":"' + myUserID + '"}', teamSumSuccessCallBack_today, null);

	// 查询图表数据
	searchTeamSummary(startDateTime, endDateTime);

	// Click to change time.
	$("#changeChartID button").off('click');
	$("#changeChartID button").on('click',function () {
		$("#lineChart").empty();
		$(this).css({"backgroundColor":"#FE5D39","color":"#fff"});
		$(this).siblings('button').css({"backgroundColor":"#f9f9f9","color":"#333"});
		var clickedID = $(this).context.id;
		if (clickedID == "weekChart"){
			startDateTime = initDefaultDate(-7,'day') + hms00;
			endDateTime = initDefaultDate(0,'day') + hms59;
			searchTeamSummary(startDateTime, endDateTime);
		}else if (clickedID == "halfMonthChart"){
			startDateTime = initDefaultDate(-15,'day') + hms00;
			endDateTime = initDefaultDate(0,'day') + hms59;
			searchTeamSummary(startDateTime, endDateTime);
		}else if (clickedID == "monthChart"){
			startDateTime = initDefaultDate(-30,'day') + hms00;
			endDateTime = initDefaultDate(0,'day') + hms59;
			searchTeamSummary(startDateTime, endDateTime);
		}
	});
}

function searchTeamSummary(startDateTime, endDateTime) {
	var dates = [];
	/*var startTime = new Date(startDateTime.split(" ")[0]);
	var endTime = new Date(endDateTime.split(" ")[0]);*/
	var startTime = new Date(new Date(startDateTime.split(" ")[0]).getTime()+24*60*60*1000);
	var endTime = new Date(new Date(endDateTime.split(" ")[0]).getTime()+24*60*60*1000);
	var len = (endTime.getTime() - startTime.getTime())/(24*60*60*1000);
	for (var i = 0; i<= len ;i++){
		// 2018-07-11,为了兼容安卓系统中，QQ浏览器日期显示为英文格式的问题。
		// dates.push(new Date(startTime.getTime()+24*60*60*1000*i).toLocaleDateString().replace(/-/g,'/'));
		dates.push(new Date(startTime.getTime()+24*60*60*1000*i).toISOString().split('T')[0].replace(/-/g,'/'));
	}
	xAxis = dates;
	days = len;
	dataType = 0;
	searchTotal_teamSummary(dates[0]+ hms00, dates[dates.length-1]+ hms59, dataType);
}

//@ Send arguments to the Server
// [0:团队充值,1:团队提款,2:团队投注,3:注册人数,4:投注人数,5:登录人数]
function searchTotal_teamSummary(startDateTime, endDateTime, dataType) {
		ajaxUtil.ajaxByAsyncPost(null, '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetTeamOverViewChartList","UserID":"' + myUserID + '","DataType":'+ dataType +',"BeginTime":"' + startDateTime + '","EndTime":"' + endDateTime + '"}', teamSumSuccessCallBack_chart, null);
}

//@ 今日数据
function teamSumSuccessCallBack_today(data) {
	if (data.Code == 200) {
		$("#teamSumData").empty();
		//显示列表或者统计数据
		var $totalInfo = $('<ul class="recordDetail">'+
			'<li>团队余额：<span id="tmSum_balance">0</span></li>' +
			'<li>团队成员：<span id="tmSum_member">0</span></li>' +
			'<li>团队充值：<span id="tmSum_charge">0</span></li>' +
			'<li>团队提款：<span id="tmSum_withdraw">0</span></li>' +
			'<li>团队投注：<span id="tmSum_touzhu">0</span></li>' +
			'<li>投注人数：<span id="tmSum_touzhuNum">0</span></li>' +
			'<li>注册人数：<span id="tmSum_registers">0</span></li>' );
//			'<li>登录人数：<span id="tmSum_logined">0</span></li></ul>');
		$("#teamSumData").append($totalInfo);

		var todayData = data.Data.TodayList;
		if(todayData.length > 0) {
			$("#tmSum_balance").html(todayData[0].TeamLotteryMoney);
			$("#tmSum_member").html(todayData[0].TeamNum);
			$("#tmSum_charge").html(todayData[0].TeamRechargeMoney);
			$("#tmSum_withdraw").html(todayData[0].TeamDrawingsMoney);
			$("#tmSum_touzhu").html(todayData[0].TeamBetMoney);
			$("#tmSum_touzhuNum").html(todayData[0].TeamBetNum);
			$("#tmSum_registers").html(todayData[0].TeamNewAddNum);
			$("#tmSum_logined").html(todayData[0].TeamLoginNum);
		}else{
			toastUtils.showToast("暂未查到今日数据");
		}
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//@ 图表数据
function teamSumSuccessCallBack_chart(data) {
	// Create 6 Arrays of length 30.
	var charge = new Array(days).join(0).split('');
	var withdrawal = new Array(days).join(0).split('');
	var	teamBet = new Array(days).join(0).split('');
	var	betNum = new Array(days).join(0).split('');
	var	register = new Array(days).join(0).split('');
	var	online = new Array(days).join(0).split('');

	if (data.Code == 200) {
		if (data.Data.TeamDataInfoList.length >0 && dataType == 0){
			// 团队充值
			addDatatoArray(charge, data.Data.TeamDataInfoList);
		}else if(data.Data.TeamDataInfoList.length >0 && dataType == 1){
			// 团队提款
			addDatatoArray(withdrawal,data.Data.TeamDataInfoList);
		}else if(data.Data.TeamDataInfoList.length >0 && dataType == 2){
			// 团队投注
			addDatatoArray(teamBet, data.Data.TeamDataInfoList);
		}else if(data.Data.TeamDataInfoList.length >0 && dataType == 3){
			// 注册人数
			addDatatoArray(register, data.Data.TeamDataInfoList);
		}else if(data.Data.TeamDataInfoList.length >0 && dataType == 4){
			// 投注人数
			addDatatoArray(betNum, data.Data.TeamDataInfoList);
		}else if(data.Data.TeamDataInfoList.length >0 && dataType == 5){
			// 登录人数
			addDatatoArray(online, data.Data.TeamDataInfoList);
		}
	} else {
		toastUtils.showToast(data.Msg);
	}
	changeChart(charge, withdrawal, teamBet, register, betNum);
}

// 匹配各日期的数据
// Arguments : 'array' and 'source' are arrays; data is a String.
function addDatatoArray(array, source) {
	for(var m = 0; m < xAxis.length; m++){
		for (var n = 0;n < source.length; n++){
			// 2018-07-11,为了兼容安卓系统中，QQ浏览器日期显示为英文格式的问题。
			// var date = new Date(source[n]["DateTime"]).toLocaleDateString().replace(/-/g,'/');
			var date = new Date(source[n]["DateTime"]).toISOString().split('T')[0].replace(/-/g,'/');
			if (xAxis[m] == date){
				array[m] = source[n]['Num'];
			}
		}
	}
}

//@ Change chart.
function changeChart(DataCharge, DataWithdraw, DataBet, DataRegister, DataBetNum) {
	var DataArray = [DataCharge, DataWithdraw, DataBet, DataRegister, DataBetNum]; //元素顺序Important
	showChart(xAxis,DataArray);
}

/*初始化显示为 一周 折线图*/
function showChart(xAxis,dataArray) {
	//Analysis of Data
	var dataName = ['团队充值','团队提款','团队投注','注册人数','投注人数']; //dataName.length = datArray.length
	var seriesArray = [];
	//设置默认选中项
	var legendSelected = {
		'团队充值': false,
		'团队提款': false,
		'团队投注': false,
		'注册人数': false,
		'投注人数': false
	};
	for (var i = 0; i < dataArray.length; i++){
		var everyData = dataArray[i];
		var seriesList = {
			name:dataName[i],
			type:'line',
			smooth: true,
			data: everyData,
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: '#FE5D39'  //线条填充色
					}])
				}
			}
		};
		//将当前点击项设置为默认显示
		if (i == dataType){
			var selected = dataName[i];
			legendSelected[selected] = true;
		}
		seriesArray.push(seriesList);
	}

	var myChart = echarts.init(document.getElementById('lineChart'));
	var option = {
		//提示框浮层
		tooltip: {
			trigger: 'axis'
		},
		//图例
		legend: {
			data:dataName,
			top:0,
			bottom:60,
			left:10,
			orient:'horizontal',
			itemGap:12,
			itemHeight:18,
			selectedMode:'single',
			inactiveColor:'#999',
			padding:[3,3],
			height:130,
			textStyle:{
				fontSize:14
			},
			selected: legendSelected
		},
		//工具栏
		toolbox: {
			show: true,
			right:8,
			top:58,
			bottom:5,
            itemSize:20,
            itemGap:15,
            feature: {
				magicType: {type: ['line', 'bar']},
				saveAsImage: {}
			}
		},
		//显示区域
		grid:{
			top: 123,
			left: 62,
			width: '80%'
		},
		//X轴
		xAxis:[{
				type: 'category',
				boundaryGap: false,
				data: xAxis
			}],
		//Y轴
		yAxis: {
			type: 'value',
			axisLabel: {
				formatter: '{value}'
			}
		},
		color:['#FE5D39 ','#FE5D39','#FE5D39','#FE5D39','#FE5D39','#FE5D39'],

		//数据区域缩放
		dataZoom: [{
				type: 'slider',  //X轴滑动条
				start: 0, // %
				end: 100
			},
			{
				type: 'inside', //内嵌型X轴横向触摸
				start: 0,
				end:100
			}],
		series:seriesArray
	};
	myChart.setOption(option);

	// 图例开关的行为只会触发 legendselectchanged 事件
	myChart.on('legendselectchanged', function (params) {
		// 获取点击图例的选中状态
		switch (params.name){
			case "团队充值":
				dataType = 0;	break;
			case '团队提款':
				dataType = 1;	break;
			case '团队投注':
				dataType = 2;	break;
			case '注册人数':
				dataType = 3;	break;
			case '投注人数':
				dataType = 4;	break;
			case '登录人数':
				dataType = 5;	break;
			default:
				dataType = 0;
				break;
		}
		searchTotal_teamSummary(startDateTime, endDateTime, dataType)
	});
}
