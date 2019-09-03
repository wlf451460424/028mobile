/* 
* @Author: Administrator
* @Date:   2015-02-08 11:09:41
* @Last Modified by:   Administrator
* @Last Modified time: 2015-12-23 17:35:27
*/
var couponPage = 1;
var newsType = "0";
var hasMore = true;
var totalPage = 0;


function gonggaoDetailLoadedPanel(){
  catchErrorFun("gonggaoDetail_init();");
}

function gonggaoDetail_init(){
    $("#gonggaoDetImg").empty();
    $("#gonggaocontentID").empty();
    var newsId = localStorageUtils.getParam("newsId");
    var param = '{"ProjectPublic_PlatformCode":2,"newsId":"' + newsId + '","InterfaceName":"/api/v1/netweb/get_news_detail"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(data){
        if(data.Code == 200){
            var detail = data.Data;
	        $("#gonggaotimeID").text(detail.PublishTime);
	        $("#gonggaotitleID").text(detail.Title);
	        $("#gonggaocontentID").append(detail.Content);

        }else if ( ($.inArray(data.Code,[401,402,403,404,405,406,423]) > -1) ) {
	        loginAgain();
        }else{
            toastUtils.showToast(data.Msg);
        }

    },'正在加载数据');
}