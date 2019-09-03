/* 
* @Author: Administrator
* @Date:   2015-02-08 11:13:06
* @Last Modified by:   Administrator
* @Last Modified time: 2015-03-31 11:11:40
*/
var merchantCode;
/*进入panel时调用*/
function awardHallPageLoadedPanel(){
	catchErrorFun("awardHallPageInit();");
}
/*离开panel时调用*/
function awardHallPageUnloadedPanel(){
	$("#awardList").empty();
}

function awardHallPageInit(){
	$("#awardList").empty();
	 merchantCode = localStorageUtils.getParam("MerchantCode");
	var awardScroller = $("#awardHallPage").scroller({
		verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
	});
    useawardScroller(awardScroller);
	getff();
}

function useawardScroller(myScroller){
	//Scroller add下拉刷新
    myScroller.addPullToRefresh();
	var hideClose;

	$.unbind(myScroller, "refresh-release");
	$.bind(myScroller, "refresh-release", function () {
	    var that = this;
	    clearTimeout(hideClose);
	    hideClose = setTimeout(function () {
		    $("#awardList").empty();
			getff();
	        that.hideRefresh();
	    }, 1200);
	    return false; //tells it to not auto-cancel the refresh
	});
	//滚动过去，下拉将不再起作用！手动取消拉动刷新
	$.unbind(myScroller, "refresh-cancel");
	$.bind(myScroller, "refresh-cancel", function () {
	    clearTimeout(hideClose);
	});
	myScroller.enable();
}

function getff(){
    // var lotteryId = localStorageUtils.getParam("prizeLottery");
	var lotteryIdFC = localStorageUtils.getParam("FCLottery");
	var lotteryMmc=localStorageUtils.getParam("MmcLottery");
	var fc=lotteryIdFC.split(",");
	//需要显示的彩种
	var arr=localStorageUtils.getParam("saleLottery").split(",");
	var lotteryId = [];
	//官方
	for (var i = 0; i < IndexLottery.length;i++) {
		var len = IndexLottery[i].lottery.length;
		for (var z = 0; z < len; z++) {
			if ($.inArray(IndexLottery[i].lottery[z], arr) >= 0) {
				lotteryId.push(IndexLottery[i].lottery[z]);
			}
		}
	}
	
	//盘口
	for (var i = 0; i < hcp_IndexLottery.length;i++) {
		var len = hcp_IndexLottery[i].lottery.length;
		for (var z = 0; z < len; z++) {
			if ($.inArray(hcp_IndexLottery[i].lottery[z], arr) >= 0) {
				lotteryId.push(hcp_IndexLottery[i].lottery[z]);
			}
		}
	}
	
	getData(lotteryId,fc);

	if(lotteryMmc == "50"){
		getLotteryMmc();
	}
}

function getData(id,fc){
	 ajaxUtil.ajaxByAsyncPost1(null, '{"IsSelf":false,"ProjectPublic_PlatformCode":2,"reType":3,"InterfaceName":"/api/v1/netweb/GetHisNumber","CZID":"' +  id + '"}',successCallBack_award1, '正在加载数据...'); }

//获取竞速竞速秒秒彩开奖
function getLotteryMmc(){
	var datetime = new Date();
	var endTime = new Date();
	datetime.setHours(0, 0, 0);
	endTime.setHours(23, 59, 59);
	datetime.setDate(datetime.getDate() - 3);
    var  startDateTime = datetime.Format("yyyy/MM/dd hh:mm:ss");
    var  endDateTime = endTime.Format("yyyy/MM/dd hh:mm:ss");
    ajaxUtil.ajaxByAsyncPost(null,'{"InterfaceName":"/api/v1/netweb/GetLotteryDrawPageFlx","CurrentPageSize":5,"LotteryCode":"50","BeginTime":"' + startDateTime + '","ProjectPublic_PlatformCode":2,"EndTime":"' + endDateTime + '","CurrentPageIndex":0}',successCallBack_award3, '正在加载数据...');
}

function successCallBack_award1(data){
	if(data.Code == 200){
		var sortArr=[];
		var sortArr_1=[];
		var sortArr_2=[];
		for(var i = 0; i < data.Data.length; i++){
			var str = data.Data[i].CzType.toString();
			if(str.length >= 3 && str.split("")[0] == "5"){
				sortArr_2.push(data.Data[i]);
			}else{
				sortArr_1.push(data.Data[i]);
			}
		}
		for(var i = 0; i < sortArr_1.length; i++){
			sortArr.push(sortArr_1[i]);
		}
		for(var i = 0; i < sortArr_2.length; i++){
			sortArr.push(sortArr_2[i]);
		}
		
	    $.each(sortArr, function(key, val) {
			var $li = $("<li></li>");
			$li.bind('click', function(event) {
				localStorageUtils.setParam("historyLottery",val.CzType);
				localStorageUtils.setParam("historyBack","awardHall");
				createInitPanel_Fun('awardHistory',true);
			});
			
			//获取彩种名称
			var str = val.CzType.toString();
            if(str.length >= 3 && str.split("")[0] == "5"){
            	//盘口
            	var lotteryName = hcp_LotteryInfo.getLotteryNameById(val.CzType); //Logo src
            }else{
            	var lotteryName = LotteryInfo.getLotteryNameById(val.CzType); //Logo src
            }
            
			var $a = $('<a></a>');
			$a.append('<h3 class="subTitle"><b>'+ lotteryName +'</b><span class="marL6 gray">第'+val.CzPeriod+'期</span></h3>');
			var $ul = $("<ul class='ResultNew marL10'></ul>");
	
			var _resultS = val.CzNum;
			var _resultA = _resultS.split(",");
			if(LotteryInfo.getLotteryTypeById(val.CzType) == 'kl8'){
				_resultA = _resultA.slice(0,20);  //The first 20.
			}
			for(var i = 0; i < _resultA.length; i++){
				$ul.append('<li>' + _resultA[i] + "</li>");
			}
			var $span = $("<span class='btnRight'></span>");
			
			////获取彩种 图标
			//var $img = $("<img src="+LotteryInfo.getLotteryLogoById(val.CzType)+">"); //Logo src
			var str = val.CzType.toString();
            if(str.length >= 3 && str.split("")[0] == "5"){
            	//盘口
            	var $img = $("<img src="+hcp_LotteryInfo.getLotteryLogoById(val.CzType)+">"); //Logo src
            }else{
            	var $img = $("<img src="+LotteryInfo.getLotteryLogoById(val.CzType)+">"); //Logo src
            }
			
			var $table=$("<table></table>");
			var $tr=$("<tr></tr>");
			var $td1=$("<td></td>");
			var $td2=$("<td></td>");
			$a.append($ul);
			$td1.append($img);
			$td2.append($a);
			$tr.append($td1);
			$tr.append($td2);
			$table.append($tr);
			$li.append($table);
			$("#awardList").append($li);
		});
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	}else{
	    toastUtils.showToast(data.Msg);
	}
	
}

// 竞速秒秒彩开奖
function successCallBack_award3(data){
    if(data.Code == 200){
	    if(data.Data.IssueModlst == null){
      		return;
		}
		var lotteryId = "50";
		$.each(data.Data.IssueModlst, function(key, val) {
			if(key == 0){
				var $li = $("<li></li>");
					$li.bind('click', function(event) {
						localStorageUtils.setParam("historyLottery",lotteryId);
						localStorageUtils.setParam("historyBack","awardHall");
						createInitPanel_Fun('awardHistory',true);
					});
					var $a = $('<a></a>');
					$a.append('<h3 class="subTitle"><b>'+LotteryInfo.getLotteryNameById(lotteryId)+'</b><span class="marL6 gray">第'+val.IssueNumber1+'期</span></h3>');
					var $ul = $("<ul class='ResultNew marL10'></ul>");

					var _resultS = val.DrawResult1;
					var _resultA = _resultS.split(",");
					for(var i = 0; i < _resultA.length; i++){
						$ul.append('<li>' + _resultA[i] + "</li>");
					}
					var $span = $("<span class='btnRight'></span>");
					var $img = $("<img src="+LotteryInfo.getLotteryLogoById(lotteryId)+">"); //Logo src
				    var $table=$("<table></table>");
				    var $tr=$("<tr></tr>");
				    var $td1=$("<td></td>");
				    var $td2=$("<td></td>");
				    $a.append($ul);
				    $td1.append($img);
				    $td2.append($a);
				    $tr.append($td1);
				    $tr.append($td2);
				    $table.append($tr);
				    $li.append($table);
				    $("#awardList").append($li);
			}
		});	
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
    }else{
	    toastUtils.showToast(data.Msg);
	}
	
}