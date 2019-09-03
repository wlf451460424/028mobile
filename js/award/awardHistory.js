/* 
 * @Author: Administrator
 * @Last Modified by:   Administrator
 * @Last Modified time: 2015-02-10 13:17:58
 */
var historyAwardPage = 1;
var hasMore = true;
var historyLot = "";
var historyBack = "";
//页大小
var PAGESIZE = 15;
/*进入panel时调用*/
function awardHistoryLoadedPanel(){
	catchErrorFun("awardHistoryInit();");
}
/*离开panel时调用*/
function awardHistoryUnloadedPanel(){
	$("#awardHistoryList").empty();
	historyAwardPage = 1;
}
/* Init */
function awardHistoryInit(){
	historyLot = localStorageUtils.getParam("historyLottery");
	historyBack = localStorageUtils.getParam("historyBack");
	$("#awardHistoryTitle").html(LotteryInfo.getLotteryNameById(historyLot));
	searchResult();
	$("#awardHistoryList").empty();
	historyAwardPage = 1;
	var awardHistoryScroller = $("#awardHistory").scroller({
		verticalScroll : true,
		horizontalScroll : false,
		vScrollCSS: "afScrollbar",
		autoEnable : true
	});
	useawardHistoryScroller(awardHistoryScroller);
	//返回
	$("#awardHistory_back").off('click');
	$("#awardHistory_back").on('click', function(event) {
		createInitPanel_Fun(''+historyBack+'Page',true);
	});
}

function useawardHistoryScroller(myScroller){
	$("#awardHistory").scroller().scrollToTop();
	$("#awardHistory").scroller().clearInfinite();
	//Scroller add下拉刷新
	myScroller.addPullToRefresh();
	myScroller.addInfinite();
	myScroller.runCB=true;
	var hideClose;
	$.unbind(myScroller, "refresh-release");
	$.bind(myScroller, "refresh-release", function () {
		var that = this;
		clearTimeout(hideClose);
		hideClose = setTimeout(function () {
			$("#awardHistoryList").empty();
			historyAwardPage = 1;
			searchResult();
			that.hideRefresh();
		}, 2000);
		return false; //tells it to not auto-cancel the refresh
	});
	//滚动过去，下拉将不再起作用！手动取消拉动刷新
	$.unbind(myScroller, "refresh-cancel");
	$.bind(myScroller, "refresh-cancel", function () {
		clearTimeout(hideClose);
	});
	myScroller.enable();
	/*修复afui refresh事件会触发infinite事件bug*/
	$(document.body).unbind("touchmove");
	$(document.body).bind("touchmove", function(e) {
		if (touch.y1 - touch.y2 <= 0) {
			$("#infinite").hide();
		} else {
			$("#infinite").show();
		}
	});
	$.unbind(myScroller, "infinite-scroll");
	$.bind(myScroller, "infinite-scroll", function () {
		var self = this;
		if(!hasMore){
			$(self.el).find("#infinite").remove();
			self.clearInfinite();
			$(self.el).find("#myHistoryRecords_noItem")?$(self.el).append(''):$(self.el).append('<div id="myHistoryRecords_noItem"><span>没有数据了！</span></div>');
			return;
		}
		if( $("#infinite").length==0){
			$(self.el).append('<div id="infinite"><div class="pullDown loading"><span class="pullDownIcon"></span><span class="pullDownLabel">正在加载...</span></div></div>');
			$.bind(myScroller, "infinite-scroll-end", function () {
				$.unbind(myScroller, "infinite-scroll-end");
				setTimeout(function () {
					$(self.el).find("#infinite").remove();
					self.clearInfinite();
					historyAwardPage++;
					searchResult();
					// self.scrollToBottom(); //在没有数据时，会造成页面卡顿，暂时注掉。
				}, 3000);
			});
		}
	});
}

/**
 * 获取历史开奖请求
 */
function searchResult(){
	if(historyLot==50){
		var datetime = new Date();
		var endTime = new Date();
		datetime.setHours(0, 0, 0);
		endTime.setHours(23, 59, 59);
		datetime.setDate(datetime.getDate() - 3);
		var  startDateTime = datetime.Format("yyyy/MM/dd hh:mm:ss");
		var  endDateTime = endTime.Format("yyyy/MM/dd hh:mm:ss");
		var  page_mmc =historyAwardPage - 1;
		ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetLotteryDrawPageFlx","CurrentPageSize":15,"LotteryCode":"50","BeginTime":"' + startDateTime + '","ProjectPublic_PlatformCode":2,"EndTime":"' + endDateTime + '","CurrentPageIndex":'+ page_mmc +'}',MmcHistorySuccessCallBack, '正在加载数据...');
	}else{
		ajaxUtil.ajaxByAsyncPost1(null, '{"IsSelf":false,"ProjectPublic_PlatformCode":2,"reType":4,"InterfaceName":"/api/v1/netweb/GetHisNumber","Size":'+PAGESIZE+',"Page":'+historyAwardPage+',"CZID":' +  historyLot + '}',successCallBackhistory, '正在加载数据...');
	}

}

function successCallBackhistory(data){
	if(data.Code == 200){
	    $.each(data.Data, function(key, val) {
			var $li = $("<li></li>");
			$li.append('<h3 class="subTitle"><b>第'+val.CzPeriod+'期</b></h3>');
			var $ul = $("<ul class='ResultNew marL10'></ul>");
	
			var _resultS = val.CzNum;
			var _resultA = _resultS.split(",");
			if(LotteryInfo.getLotteryTypeById(val.CzType) == 'kl8'){
				_resultA = _resultA.slice(0,20);  //The first 20.
			}
			for(var i = 0; i < _resultA.length; i++){
				$ul.append('<li>' + _resultA[i] + "</li>");
			}
			$li.append($ul);
			$("#awardHistoryList").append($li);
		});
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

function MmcHistorySuccessCallBack(data){
	if(data.Code == 200){
	    var info=data.Data.IssueModlst;
		$.each(info, function(key, val) {
			var $li = $("<li></li>");
			$li.append('<h3 class="subTitle"><b>第'+val.IssueNumber1+'期</b></h3>');
			var $ul = $("<ul class='ResultNew marL10'></ul>");

			var _resultS = val.DrawResult1;
			var _resultA = _resultS.split(",");
			for(var i = 0; i < _resultA.length; i++){
				$ul.append('<li>' + _resultA[i] + "</li>");
			}
			$li.append($ul);
			$("#awardHistoryList").append($li);
		});
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	}else{
	    toastUtils.showToast(data.Msg);
	}
}