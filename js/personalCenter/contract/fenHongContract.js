var PAGESIZE_FenHongCtt = 20;
//@ Loaded
function fenHongContractLoadedPanel(){
    catchErrorFun("fenHongContractInit();");
}

//@ Unloaded
function fenHongContractUnloadedPanel(){
    $("#fenHongCttList").empty();
    $("#fenHongCttScroller").scroller().scrollToTop();
    $("#fenHongCttScroller").scroller().clearInfinite();
}

//@ Init
function fenHongContractInit() {
    myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
    page = 0;
    hasMorePage = true;

    var _myScroller =  $("#fenHongCttScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'fenHongCttList','fenHongContractByScroll()');
    // Entrace
    loadfenHongCtt();

    //Search Username
    $("#fenHongCttSearch").unbind('click');
    $("#fenHongCttSearch").bind('click', function(event) {
        searchFenHongUser();
    });

    //一键结算
    $("#oneKeySettlement").unbind('click');
    $("#oneKeySettlement").bind('click', function(event) {
        oneKeyToSettle();
    });
}
//@ 下拉加载下一页
function fenHongContractByScroll(){
    fenHongContract_scroll();
}

//@ First Page
function loadfenHongCtt() {
    page = 0;
    fenHongContract_scroll();
}

//@ 下一页
function fenHongContract_scroll() {
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetContract","ProjectPublic_PlatformCode":2,"UserName":"","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_FenHongCtt + '}', loadfenHongCtt_callBack, '正在加载数据...');
}

//@ 数据返回
function loadfenHongCtt_callBack(data){
    if (page == 0) {
        $("#fenHongCttList").empty();
        $("#fenHongCttScroller").scroller().scrollToTop();
        $("#fenHongCttScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    //一键结算 和 footer 是否显示
	    data.Data.LockState == 1 ? $("#fenHongContractFooter").parent('.footer').show() : $("#fenHongContractFooter").parent('.footer').hide();
	    var info = data.Data.ContractManagerModels;
	    if (info.length == 0) {
		    toastUtils.showToast("没有数据");
		    return;
		}
	    if (info.length >0){
	        isHasMorePage(info,PAGESIZE_FenHongCtt);
	        $.each(info,function (key,val) {
	            var modifyCttInfo = {};
	            modifyCttInfo.userID = val.UserID;
	            modifyCttInfo.userName = val.UserName;
	            modifyCttInfo.State = val.State;
	
	            if (data.Data.LockState == 1 && val.State >= 0){
	                var $li = $('<li><a><dl class="orderList"><dd>用户名:&nbsp;' + val.UserName + '</dd><dd>返点:&nbsp;' + val.Rebate +'</dd><dd>状态:&nbsp;'+ getFenHongState(val.State)[0] +'</dd><dd><button onclick="contract_ModifyCtt(this)" class="modifyCttBtn">'+ getFenHongState(val.State)[1] +'</button><button class="modifySettleBtn" onclick="contract_Settle(this)">分红结算</button></dd></dl></a></li>').data('fenHongCttInfo',modifyCttInfo);
	            }else{
	                var $li = $('<li><a><dl class="orderList"><dd>用户名:&nbsp;' + val.UserName + '</dd><dd>返点:&nbsp;' + val.Rebate +'</dd><dd>状态:&nbsp;'+ getFenHongState(val.State)[0] +'</dd><dd><button onclick="contract_ModifyCtt(this)" class="modifyCttBtn">'+ getFenHongState(val.State)[1] +'</button></dd></dl></a></li>').data('fenHongCttInfo',modifyCttInfo);
	            }
	
	            $("#fenHongCttList").append($li);
	        });
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 显示状态
function getFenHongState(state) {
    switch (state){
        case -1:
            return ['未签约','签订契约'];
        case 0:
            return ['待确认','修改契约'];
        case 1:
            return ['已签约','修改契约'];
        case 2:
            return ['已拒绝','修改契约'];
    }
}

//@ 修改或签订契约
function contract_ModifyCtt(element) {
    var info = jsonUtils.toString($(element).parents("li").data('fenHongCttInfo'));
    localStorageUtils.setParam("fenHongCttInfo",info);
    setPanelBackPage_Fun("modifyContract");
}

//@ 分红结算
function contract_Settle(element) {
    var info = jsonUtils.toString($(element).parents("li").data('fenHongCttInfo'));
    localStorageUtils.setParam("fenHongCttInfo",info);
    setPanelBackPage_Fun("fenHongSettle");
}

//@ 一键结算
function oneKeyToSettle() {
    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/OneKeySettlement","ProjectPublic_PlatformCode":2,"UserName":"'+ myUserName +'","Sign":1,"UserID":' + myUserID + '}', function (data) {
        if (data.Code == 200){
            if (data.Data.StateBool){
                toastUtils.showToast("一键结算成功");
                setPanelBackPage_Fun("contractManage");
            }else {
                toastUtils.showToast("一键结算失败");
            }
        }else {
            toastUtils.showToast(data.Msg);
        }
    }, '正在加载数据...');
}

//@ 查找用户名
function searchFenHongUser(){
    $.ui.popup({
        title:"查询用户名",
        message:'<input type="text" id="searchFenHongUser" maxLength="25" placeholder="请输入要查找的用户名" />',
        cancelText:"关闭",
        cancelCallback:
            function(){
            },
        doneText:"确定",
        doneCallback:
            function(){
                var searchUser = $("#searchFenHongUser").val();
                if(searchUser == ""){
                    toastUtils.showToast("请输入要查找的用户名");
                    return;
                }
                page = 0;
                ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetContract","ProjectPublic_PlatformCode":2,"UserName":"'+searchUser+'","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_FenHongCtt + '}', loadfenHongCtt_callBack, '正在加载数据...');
            },
        cancelOnly:false
    });
}
