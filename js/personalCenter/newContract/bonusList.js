var myUserName;
var myUserID;
var page = 0;
var PAGESIZE_FenHongCtt = 10;
//@ Loaded
function bonusListLoadedPanel(){
    catchErrorFun("bonusListInit();");
}

//@ Unloaded
function bonusListUnloadedPanel(){
    $("#bonusListShow").empty();
    $("#bonusListScroller").scroller().scrollToTop();
    $("#bonusListScroller").scroller().clearInfinite();
}

//@ Init
function bonusListInit() {
    myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
    page = 0;
    hasMorePage = true;

    var _myScroller =  $("#bonusListScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'bonusListShow','bonusListByScroll()');
    // Entrace
    loadfenHongCtt();

    //Search Username
    $("#bonusListSearch").off('click');
    $("#bonusListSearch").on('click', function() {
        searchBonusUser();
    });

    //一键结算
    $("#oneKeySettlementNew").unbind('click');
    $("#oneKeySettlementNew").bind('click', function() {
	    getBonusPeriod();
    });
}

//@ First Page
function loadfenHongCtt() {
	
	$("#selectType").empty();
    var $selectType = $('<table><tr><td><select name="ContractState" id="ContractState" onchange="ContractStateChange()"><option value="-1" selected="selected">状态:全部</option><option value="1">状态:已签约</option><option value="2">状态:未签约</option><option value="0">状态:待确认</option></select></td><td><select name="TypeParameter" id="TypeParameter" onchange="TypeParameterChange()"></select></td></tr></table>');
    $("#selectType").append($selectType);
    $("#TypeParameter").empty();
    
	//GetSystemMgrType(获取制度类型列表)1=日结，2=分红、3=私返
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetSystemMgrType","ProjectPublic_PlatformCode":2,"TypeID":"2"}', function (data) {
    	if(data.Code == 200){
    		if(data.Data.SysMgrTypeModel.length>0){
			    localStorageUtils.setParam("BonusSysType",jsonUtils.toString(data.Data.SysMgrTypeModel));
    			for(var i=0;i<data.Data.SysMgrTypeModel.length;i++){
    				var $option = $('<option value="'+ data.Data.SysMgrTypeModel[i].Id +'">'+'分红类型：'+ data.Data.SysMgrTypeModel[i].Name +'</option>');
    				$("#TypeParameter").append($option);
    			}
    			var TypeID = jsonUtils.toObject(localStorageUtils.getParam("bonusList_selectedTypeID")); 
    			if(TypeID){
    				$("#TypeParameter").val(TypeID);
    				infoCharge("",$("#ContractState").val(),TypeID);
    			}else{
    				infoCharge("",$("#ContractState").val(),$("#TypeParameter").val());
    			}
    		}else{
    			toastUtils.showToast("获取制度类型列表为空");
    		}
	    } else {
	    	toastUtils.showToast(data.Msg);
	        return;
	    }
    }, '正在加载数据...');
}

//@ 下拉加载下一页
function bonusListByScroll(){
    infoCharge("",$("#ContractState").val(),$("#TypeParameter").val());
}
//分红状态改变事件
function ContractStateChange() {
    page = 0;
    infoCharge("",$("#ContractState").val(),$("#TypeParameter").val());
} 
//分红类型改变事件
function TypeParameterChange() {
	localStorageUtils.setParam("bonusList_selectedTypeID", $("#TypeParameter").val());
    page = 0;
    infoCharge("",$("#ContractState").val(),$("#TypeParameter").val());
} 

/**
 * 查询 分红契约列表数据
 */
function infoCharge(userName,state,typeID) {
	// GetBonusContent（下级分红契约列表）
	if(userName == ""){
		ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetBonusContent","ProjectPublic_PlatformCode":2,"UserName":"","ContractState":'+state+',"TypeParameterId":'+typeID+',"CurrentPageIndex":'+page+',"CurrentPageSize":'+PAGESIZE_FenHongCtt+'}', loadfenHongCtt_callBack, '正在加载数据...');
	}else{
		ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetBonusContent","ProjectPublic_PlatformCode":2,"UserName":"'+userName+'","ContractState":'+state+',"TypeParameterId":'+typeID+',"CurrentPageIndex":'+page+',"CurrentPageSize":'+PAGESIZE_FenHongCtt+'}', loadfenHongCtt_callBack, '正在加载数据...');
	}
}

//@ 数据返回
function loadfenHongCtt_callBack(data){
    if (page == 0) {
        $("#bonusListShow").empty();
        $("#bonusListScroller").scroller().scrollToTop();
        $("#bonusListScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data == null){
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    //一键结算 和 footer 是否显示
	    data.Data.LockState == 1 ? $("#bonusListFooter").parent('.footer').show() : $("#bonusListFooter").parent('.footer').hide();
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
	            modifyCttInfo.TypeParameterId = $("#TypeParameter").val();
	            modifyCttInfo.TypeName =  ($("#TypeParameter").find("option:selected").text()).replace(new RegExp(/:+|：+/g),':').split(":")[1];
				
	            if (data.Data.LockState == 1 && val.State !=2 ){  //显示分红结算按钮
	                var $li = $('<li><a><dl class="orderList"><dd>用户名:&nbsp;' + val.UserName +
	                    '</dd><dd>返点:&nbsp;' + val.Rebate +
	                    '</dd><dd>状态:&nbsp;'+ getFenHongState(val.State)[0] +
	                    '</dd><dd><button onclick="contract_ModifyCtt(this)" class="modifyCttBtn">'+ getFenHongState(val.State)[1] +
	                    '</button><button class="modifySettleBtn" onclick="contract_Settle(this)">分红结算</button></dd></dl></a></li>').data('fenHongCttInfo',modifyCttInfo);
		            if(data.Data.IsSubContract==0) { $($li[0].children[0].children[0].children[3].children[0]).hide(); }
	            }else{
	                var $li = $('<li><a><dl class="orderList"><dd>用户名:&nbsp;' + val.UserName +
	                    '</dd><dd>返点:&nbsp;' + val.Rebate +
	                    '</dd><dd>状态:&nbsp;'+ getFenHongState(val.State)[0] +
	                    '</dd><dd><button onclick="contract_ModifyCtt(this)" class="modifyCttBtn">'+ getFenHongState(val.State)[1] +'</button></dd></dl></a></li>').data('fenHongCttInfo',modifyCttInfo);
		            if(data.Data.IsSubContract==0) { $($li[0].children[0].children[0].children[3]).hide(); }
	            }
	            $("#bonusListShow").append($li);
	        });
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 显示状态
function getFenHongState(state) {
    switch (state){
        case 0:
            return ['待确认','修改契约'];
        case 1:
            return ['已签约','修改契约'];
        case 2:
            return ['未签约','签订契约'];
    }
}

//@ 修改或签订契约
function contract_ModifyCtt(element) {
    var info = jsonUtils.toString($(element).parents("li").data('fenHongCttInfo'));
    localStorageUtils.setParam("fenHongCttInfo",info);
    setPanelBackPage_Fun("modifyBonus");
}

//@ 分红结算
function contract_Settle(element) {
    var info = jsonUtils.toString($(element).parents("li").data('fenHongCttInfo'));
    localStorageUtils.setParam("fenHongCttInfo",info);
    setPanelBackPage_Fun("bonusSettle");
}

//@ 获取分红周期
function getBonusPeriod() {
    var bonusType = {
        "val": $("#TypeParameter").val(),
        "name": $("#TypeParameter").find("option:selected").text().replace(new RegExp(/:+|：+/g),':').split(":")[1]
    };
	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/NewGetContractPeriod","ProjectPublic_PlatformCode":2,"TypeParameterId":'+ bonusType.val +',"Number":1}',function (data) {
		if (data.Code == 200){
			var periodInfo = data.Data.GetCurrentPeriodList;
			var beginTime = "",
			    endTime = "";

		    if( periodInfo.length ){
			    beginTime = periodInfo[0].BeginTime;
				endTime = periodInfo[0].EndTime;
            }

            setTimeout(function () {
	            $.ui.popup(
		            {
			            title:"一键结算",
			            message:'<p>分红类型：'+bonusType.name+'</p><p style="color:#9008d7">本次分红周期：'+ beginTime +'<br>至 '+ endTime +'</p>',
			            cancelText:"关闭",
			            cancelCallback:
				            function(){
				            },
			            doneText:"确定",
			            doneCallback:function () {
				            oneKeyToSettle(beginTime,endTime,bonusType.val, bonusType.name);
			            },
			            cancelOnly:false
		            });
            },350);

		}else {
			toastUtils.showToast(data.Msg);
		}
	},null);
}

//@ 前台新分红一键结算
function oneKeyToSettle(beginTime, endTime, typeId, typeName) {
   ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/NewOneKeySettlement","ProjectPublic_PlatformCode":2,"Sign":1,"BeginTime":"'+ beginTime +'","EndTime":"'+ endTime +'","UserName":"'+ myUserName +'","TypeParameterId":"'+ typeId +'","TypeName":"'+ typeName +'"}', function (data) {
        if (data.Code == 200){
            if (data.Data.StateBool){
                toastUtils.showToast("一键结算成功");
                setPanelBackPage_Fun("contractManageNew");
            }else {
                toastUtils.showToast("一键结算失败");
            }
        }else {
            toastUtils.showToast(data.Msg);
        }
    }, '正在加载数据...');
}

//@ 查找用户名
function searchBonusUser(){
    $.ui.popup({
        title:"查询用户名",
        message:'<input type="text" id="searchBonusUser" maxLength="25" placeholder="请输入要查找的用户名" />',
        cancelText:"关闭",
        cancelCallback:
            function(){
            },
        doneText:"确定",
        doneCallback:
            function(){
                var searchUser = $("#searchBonusUser").val();
                if(searchUser == ""){
                    toastUtils.showToast("请输入要查找的用户名");
                    return;
                }
                page = 0;
                infoCharge(searchUser,$("#ContractState").val(),$("#TypeParameter").val());
            },
        cancelOnly:false
    });
}
