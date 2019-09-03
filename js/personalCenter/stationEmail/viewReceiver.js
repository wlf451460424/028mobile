
//@ 进入页面时
function viewReceiverLoadedPanel() {
    catchErrorFun("viewReceiver_init();");
}
//@ 离开页面时
function viewReceiverUnloadedPanel() {
    $("#viewLists").empty();
}
var PAGESIZE_viewRec = 5;

//@ 入口函数
function viewReceiver_init() {
    //点击返回按钮
    $("#viewReceiver_back").off('click');
    $("#viewReceiver_back").on('click',function () {
        setPanelBackPage_Fun("EmailDetails");
    });

    getAllReceiver();
    page = 0;
    hasMorePage = true;
    var _myScroller =  $("#viewReceiverScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'viewLists','getAllRec_next()');
}

function getAllReceiver() {
    page = 0;
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/get_addressee","StationEmailId":"'+ messageID +'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_viewRec + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param,getAllReceCallBack,'正在加载数据...');
}
function getAllRec_next() {
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/get_addressee","StationEmailId":"'+ messageID +'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_viewRec + '}';
    ajaxUtil.ajaxByAsyncPost1(null, param,getAllReceCallBack,'正在加载数据...');
}

//@ 获取下级收件人
function getAllReceCallBack(cb) {
//  if (page == 0) {
//      $("#viewLists").empty();
//      $("#viewReceiverScroller").scroller().scrollToTop();
//      $("#viewReceiverScroller").scroller().clearInfinite();
//  }

    $("#viewLists").empty();
    $("#viewReceiverScroller").scroller().scrollToTop();
    $("#viewReceiverScroller").scroller().clearInfinite();
    if (cb.Code == 200){
        var receiver = cb.Data.Records;
        isHasMorePage(receiver,PAGESIZE_viewRec);
        $.each(receiver,function (key,val) {
            var recName = val.ReceiverName;
            var recStatus = val.EmailState;
            var $recLi = $('<li><span>'+ recName +'</span>'+ showRecStatus(recStatus) +'</li>');
            $("#viewLists").append($recLi);
        });
    }else if(($.inArray(cb.Code,[401,402,403,404,405,406,423]) > -1)){
    	toastUtils.showToast("请重新登录");
	    loginAgain();
    } else{
        toastUtils.showToast("获取数据失败");
    }
}
//@ 显示已读未读
function showRecStatus(status) {
    if(status == 1){
        return '<span style="color:#4fa053;">已读</span>';
    }else if (status == 2){
        return '<span class="redtext">未读</span>';
    }

}