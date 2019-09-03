/*进入panel时调用*/
function modifyDailyWagesNewLoadedPanel(){
    catchErrorFun("modifyDailyWagesNewInit();");
}

/*离开panel时调用*/
function modifyDailyWagesNewUnloadedPanel(){
	$("#modify_dailyWages_type").empty();
	$("#dailyWagesRuleTable").empty();
	$("#new_dailyWages_select").empty();
}

var  modifyDayWageInfo;
//@ Init
function modifyDailyWagesNewInit() {
	modifyDayWageInfo = jsonUtils.toObject(localStorageUtils.getParam("DwNewListData"));  //sub Info
    var DailyWagesSysType = jsonUtils.toObject(localStorageUtils.getParam("DailyWagesSysType")); //Daily wages type
	var selectedTypeVal = modifyDayWageInfo.DayWagesTypeSelected.value;
	//日结类型下拉框
	$.each(DailyWagesSysType,function (k,v) {
		if(selectedTypeVal == v.Id){
			var $option = $('<option selected="selected" value="'+ v.Id +'">日结类型：'+ v.Name +'</optionv>');
		}else{
			var $option = $('<option value="'+ v.Id +'">日结类型：'+ v.Name +'</optionv>');
		}
		$("#modify_dailyWages_type").append($option);
	});
	//新标准下拉框
	$("#new_dailyWages_select").append('<option value="noSelected">请选择新的日结</option>');

	getMineAndSubDwInfo(selectedTypeVal);

    //Btn
    $("#modifyDailyWagesNewBtn").off('click');
    $("#modifyDailyWagesNewBtn").on('click',function () {
        submitModifyDailyWagesNew(modifyDayWageInfo);
    });
}

//Change 日结类型
function getMineAndSubDwInfo(selectedTypeVal) {
	var type = $("#modify_dailyWages_type").val() || selectedTypeVal;
	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/Contract_GetForEditWeb","ProjectPublic_PlatformCode":2,"SubUserId":"'+ modifyDayWageInfo.userID +'","DwTypeId":' + type +'}', modifyDailyWagesNew_callBack, '正在加载数据...');

	getDailyWagesActiveUser(type);
}

function modifyDailyWagesNew_callBack(data) {
    // var modifyDayWageInfo = jsonUtils.toObject(localStorageUtils.getParam("dailyWagesCttInfo"));
    $("#dailyWagesRuleTable").empty();
    $("#new_dailyWages_select").empty().append('<option value="noSelected">请选择新的日结</option>');
    if (data.Code == 200){
        var MyInfoList = data.Data.MyInfoList,
	        SubInfoList = data.Data.SubInfoList,
	        RuleList = data.Data.RuleList,
	        GrantRemark = data.Data.GrantRemark || "销量",  //表头title
	        MaxProportion = Number(data.Data.MaxProportion), //下拉框允许最大值
	        isAllowSign = data.Data.isAllowSign, //是否允许显示保存按钮（Boolean）
	        StatisticModeCode = data.Data.StatisticModeCode;  //3比列 4跳跃(*100)

	    var subUserName = SubInfoList.length ? (SubInfoList[0].UserName) : modifyDayWageInfo.userName;
	    var modify_mine_dw= MyInfoList.length ? MyInfoList[0].MyProportion : 0,
		    modify_sub_dw= SubInfoList.length ? SubInfoList[0].MyProportion : 0;
	    if(StatisticModeCode == 3){
		    modify_mine_dw = bigNumberUtil.multiply(modify_mine_dw,100) + "%";
		    modify_sub_dw = bigNumberUtil.multiply(modify_sub_dw,100) + "%";
	    }else if(StatisticModeCode == 4){
		    modify_mine_dw = bigNumberUtil.multiply(modify_mine_dw,1000);
		    modify_sub_dw = bigNumberUtil.multiply(modify_sub_dw,1000);
	    }

	    $("#modify_dailyWages_mine").html("  &bull; 我的日结: " + modify_mine_dw );
	    $("#moidfy_dailyWages_sub").html("  &bull; 下级【"+ subUserName +"】的日结: " + modify_sub_dw );

	    isAllowSign ? $("#modifyDailyWagesNewBtn").show() : $("#modifyDailyWagesNewBtn").hide();

        //@ 日结标准，表头
        var $MineUl = $('<ul class="recordDetail my-daywage-ctt-three"><li><span> 日结标准 </span><span>'+ GrantRemark +'</span><span> 活跃人数 </span></li></ul>');

        if(RuleList.length > 0){
	        //maxShowDailyWages:表格/选项框 显示的最高范围,为 MaxProportion 或我的日结值取小。
            var maxShowDailyWages = MaxProportion ? Math.min(MaxProportion,Number(MyInfoList[0].MyProportion)) : Number(MyInfoList[0].MyProportion);
	        var minShowDailyWages = (SubInfoList.length > 0) ? Number(SubInfoList[0].MyProportion) : 0;
	        for(var i = 0; i < RuleList.length; i++){
		        var proportion = Number(RuleList[i].DayWagesProportion);
		        if(proportion <= maxShowDailyWages){
		        	var DaySales = RuleList[i].DaySales==-999999999?0:RuleList[i].DaySales;
			        var $li = $('<li><span>'+ RuleList[i].DayWageStandard +'</span><span>'+ DaySales +'</span><span>'+RuleList[i].ActiveNumber+'</span></li>');
			        $MineUl.append($li);  //Table
			        if(minShowDailyWages < proportion){
				        var $option = $('<option value="'+ RuleList[i].ID +'">'+ RuleList[i].DayWageStandard +'</option>>');
				        $("#new_dailyWages_select").append($option);  //select
			        }
		        }
            }
        }else{
            $MineUl.append('<p style="text-align:center;"> 无记录 </p>');
        }
        $("#dailyWagesRuleTable").append($MineUl);
    }else {
        toastUtils.showToast(data.Msg);
    }
}

//@ Get the Active Number of Daily wages Users
function getDailyWagesActiveUser(selectedTypeVal) {
	var type = $("#modify_dailyWages_type").val() || selectedTypeVal;
	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetDayWageActiveUserCondition","ProjectPublic_PlatformCode":2,"DayWagesTypeid":' + type +'}', function (data) {
		if(data.Code == 200 ){
			var recharge = Number(data.Data.Recharge),  // 日结充值条件
				consumption = Number(data.Data.Consumption);  //日结消费条件
			if(recharge && consumption){
				$("#dailyWages_activeUser").text("当日充值量大于 "+ recharge +" 元，且当日投注量大于 "+ consumption +" 元为活跃用户。");
			}else if( recharge > 0 ){
				$("#dailyWages_activeUser").text("当日充值量大于 "+ recharge +" 元为活跃用户。");
			}else if( consumption > 0 ){
				$("#dailyWages_activeUser").text("当日投注量大于 "+ consumption +" 元为活跃用户。");
			}else {
				$("#dailyWages_activeUser").text("");
			}
		}
	},null);
}

//@ 点击按钮
function submitModifyDailyWagesNew(modifyDayWageInfo) {
    if($("#new_dailyWages_select").find("option:selected").val() === "noSelected"){
        toastUtils.showToast("请选择日结");
        return;
    }
    var selectedDw = $("#new_dailyWages_select").find("option:selected");
	var selectedDwType = {
		"value": $("#modify_dailyWages_type").val(),
		"name": $("#modify_dailyWages_type").find("option:selected").text().replace(new RegExp(/:+|：+/g),':').split(":")[1]
	};

	 //添加或者修改日结契约
    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/Contract_EditInfo","ProjectPublic_PlatformCode":2,"User_ID":'+ modifyDayWageInfo.userID +',"DwTypeId":'+ selectedDwType.value +',"UserName":"' + modifyDayWageInfo.userName +'","ID":'+ selectedDw.val() +',"TypeName":"'+ selectedDwType.name +'"}', function (data) {
            if(data.Code == 200){
	            if(data.Data.Result == 1){
		            toastUtils.showToast("添加成功");
		            setPanelBackPage_Fun("dailyWagesNewList");
	            }else if(data.Data.Result == -5){
		            toastUtils.showToast("该用户是非顶级代理");
	            }else {
		            toastUtils.showToast("添加失败，请稍后再试");
	            }
            } else {
	            toastUtils.showToast(data.Msg);
            }
        }, '正在加载数据...');

}

