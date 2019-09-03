var hasMorePage = true;
/*进入panel时调用*/
function gonggaoLoadedPanel(){
	catchErrorFun("gonggaoInit();");
}
/*离开panel时调用*/
function gonggaoUnloadedPanel(){
	$("#gonggaoList").empty();
}
function gonggaoInit(){
    $("#gonggao_backId").off('click');
    $("#gonggao_backId").on('click', function(){
         setPanelBackPage_Fun('lotteryHallPage');
    });

	page = 0;
	hasMorePage = false;//默认还有分页
	//使用滚动条
	var _myScroller = $("#gonggao").scroller({
		verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
	});
	_myScroller.scrollToTop();
	_myScroller.clearInfinite();
	addUseScroller(_myScroller,'gonggaoList','getgonggao()');
    //查询充值记录
	getgonggao();
}
/********** 查询充值记录  **********/
function getgonggao(){
        ajaxUtil.ajaxByAsyncPost1(null,'{"ProjectPublic_PlatformCode":2,"PageIndex":"' + page + '","PageSize":50,"InterfaceName":"/api/v1/netweb/get_news_list"}',function(data){
            if (data.Code == 200) {
                var Info = data.Data;
                isHasMorePage(Info,50);
                $.each(Info, function(key, val) {
					var $itemLi = $('<li ></li>');
					$itemLi.append('<a class="recordList"><dl><dt><b>'+val.Title +'</b></dt><dd><span>'+ val.PublishTime +'</span></dd></dl></a>');
				    $itemLi.on('click',function() {
						localStorageUtils.setParam("newsId",val.Sysid);
						createInitPanel_Fun('gonggaoDetail');
					});					
			 		$("#gonggaoList").append($itemLi);
			    });
            }else if (($.inArray(data.Code,[401,402,403,404,405,406,423]) > -1) ) {
				loginAgain();
			}else{
	            toastUtils.showToast(data.Msg);
            }
        },null);
}