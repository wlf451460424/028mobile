/*进入panel时调用*/
function modifyDailyWagesLoadedPanel(){
    catchErrorFun("modifyDailyWagesInit();");
}

/*离开panel时调用*/
function modifyDailyWagesUnloadedPanel(){
    $("#modifyDailyWages_mine").empty();
    $("#modifyDailyWages_sub").empty();
}

//@ Init
function modifyDailyWagesInit() {
    var modifyDayWageInfo = jsonUtils.toObject(localStorageUtils.getParam("dailyWagesCttInfo"));
    var myUserID = localStorageUtils.getParam("myUserID");
    $("#modifyDayWage_suborName").html(modifyDayWageInfo.userName);

    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetMyDownDayWages","ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'","SubordinateUserid":' + modifyDayWageInfo.userID+'}', modifyDailyWages_callBack, '正在加载数据...');

    //Btn
    $("#modifyDailyWagesBtn").off('click');
    $("#modifyDailyWagesBtn").on('click',function () {
        submitModifyDailyWages(modifyDayWageInfo);
    });
}

function modifyDailyWages_callBack(data) {
	if(data.Code == 200){
	    var MyDayWages = data.Data.MyDayWages;
    	var SubordinateDayWages = data.Data.SubordinateDayWages;
    	//@ 我的日工资契约
        var $MineUl = $('<ul class="recordDetail my-daywage-ctt"></ul>');
        if (MyDayWages.length > 0){
            $MineUl.append('<li><span> 消费额 </span><span> 消费奖励比例 </span></li>');
            for(var i = 0; i < MyDayWages.length; i++){
                var $LiMine = $('<li><span>'+MyDayWages[i].BetMoneyMin +' ≤消费额≤ '+ MyDayWages[i].BetMoneyMax +' </span><span>'+bigNumberUtil.multiply(MyDayWages[i].RewardProportion,100)+' %</span></li>');

                $MineUl.append( $LiMine);
            }
        }else {
            $MineUl.append('<p style="text-align:center;"> 无记录 </p>');
        }
        $("#modifyDailyWages_mine").append('<p style="text-align:center;">活跃人数：<span class="red">'+ data.Data.ActivePersonNum + '</span>； 达标流水：<span class="red">'+ data.Data.StandardMoney +'</span></p>');
        $("#modifyDailyWages_mine").append($MineUl);

        //@ 直属下级日工资契约
        if (SubordinateDayWages.length > 0){
            var ActiveNum = SubordinateDayWages[0].ActivePersonNum;
            var BetMoneyMin = SubordinateDayWages[0].BetMoneyMin;
            var BetMoneyMax = SubordinateDayWages[0].BetMoneyMax;
            // var LossMoneyMax = SubordinateDayWages[0].LossMoneyMax;
            // var LossMoneyMin = SubordinateDayWages[0].LossMoneyMin;
            var StandardMoney = SubordinateDayWages[0].StandardMoney;
            var RewardProportion = bigNumberUtil.multiply(100,SubordinateDayWages[0].RewardProportion);
            addModifyInfo_dayWage(ActiveNum, StandardMoney, BetMoneyMin, BetMoneyMax, RewardProportion);
        }else{
            addModifyInfo_dayWage(0, 0, 0, 999999999, 0);
        }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 添加直属下级的日工资契约
function addModifyInfo_dayWage(ActiveNum, StandardMoney, BetMoneyMin, BetMoneyMax, RewardProportion) {
    var $subUl = $('<ul class="recordDetail modify-subDaywage">'+
        '<li><span>活跃人数：</span><input type="tel" maxlength="4" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" id="modify_DW_ActiveNum" value="'+ ActiveNum +'"><span class="red">[ 范围为0-1000 ]</span></li>'+
        '<li><span>达标流水：</span><input type="tel" maxlength="6" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" id="modify_DW_Standard" value="'+ StandardMoney +'"><span class="red">[范围为0-100000]</span></li>'+
        '<li><span>奖励比例：满足</span><input type="tel" maxlength="9" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" id="modify_DW_BetMin" value="'+ BetMoneyMin +
        '"> ≤ 消费额 ≤ <input type="tel" maxlength="9" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" id="modify_DW_BetMax" value="'+ BetMoneyMax +
        '"> 得 <input type="text" style="width:33%;" onkeyup="return threeDecimal(this,value)" maxlength="5" id="modify_DW_Proportion" value="'+ RewardProportion +'"> %</li></ul>');
    $("#modifyDailyWages_sub").append($subUl);
}

//@ 点击按钮
function submitModifyDailyWages(modifyDayWageInfo) {
    var active = Number($("#modify_DW_ActiveNum").val());
    var standard = Number($("#modify_DW_Standard").val());
    var DWProportion = Number($("#modify_DW_Proportion").val());
    var betMin = Number($("#modify_DW_BetMin").val());
    var betMax = Number($("#modify_DW_BetMax").val());

    if (localStorageUtils.getParam("newDaywageMsg") == 0){
        toastUtils.showToast("您尚未签约，不能与下级签约！");   return;
    }
    if (active < 0 || active >1000){
        toastUtils.showToast("活跃人数范围：0 ~ 1000");   return;
    }
    if (standard < 0 || standard >100000){
        toastUtils.showToast("达标流水范围：0 ~ 100000");   return;
    }
    if( betMin > betMax){
        toastUtils.showToast("数据有误");  return;
    }
    if ( DWProportion < 0.001 || DWProportion > 1 ){
        toastUtils.showToast("输入有误,比例范围为0.001% ~ 1%");  return;
    }
    if (!(/^[0-9]+(.[0-9]{0,3})?$/.test(DWProportion))){
        toastUtils.showToast("输入有误,比例范围为0.001% ~ 1%");  return;
    }

    var DailyWagesContent = [], obj={};
    obj.BetMoneyMin = betMin;
    obj.BetMoneyMax = betMax;
    obj.LossMoneyMin = 0;
    obj.LossMoneyMax = 0;
    obj.ActivePersonNum = Number($("#modify_DW_ActiveNum").val());
    obj.StandardMoney = Number($("#modify_DW_Standard").val());
    obj.RewardProportion = bigNumberUtil.divided(DWProportion, 100);
    obj.RewardType = 1;
    DailyWagesContent.push(obj);

    if (modifyDayWageInfo.State == 2){  //添加日工资契约
        ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/AddDayWages","ProjectPublic_PlatformCode":2,"UserName":"' + modifyDayWageInfo.userName +'","ActivePersonNum":'+ obj.ActivePersonNum +',"StandardMoney":'+ obj.StandardMoney +',"StatisticalMethod":1,"RewardProportionModels":'+jsonUtils.toString(DailyWagesContent)+'}', function (data) {
            if(data.Code == 200){
                if (data.Data.Result > 0){
                    toastUtils.showToast("添加成功");
                    setPanelBackPage_Fun("dailyWagesContract");
                }else if (data.Data.Result == 0){
                    toastUtils.showToast(data.Data.Msg);
                }else if (data.Data.Result == -1){
                    toastUtils.showToast("用户不存在");
                }else if (data.Data.Result == -2){
                    toastUtils.showToast("不能添加会员");
                }else if (data.Data.Result == -3){
                    toastUtils.showToast("该代理已添加日工资契约");
                }else if (data.Data.Result == -4){
                    toastUtils.showToast("级别超过限制");
                }else if (data.Data.Result == -5){
                    toastUtils.showToast(data.Data.Msg);
                }else {
                    toastUtils.showToast("添加失败");
                }
            }else {
                toastUtils.showToast(data.Msg);
            }
        }, '正在加载数据...');

    }else{  //修改日工资契约
        ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/ModifyDayWages","ProjectPublic_PlatformCode":2,"UserID":"'+ modifyDayWageInfo.userID +'","UserName":"' + modifyDayWageInfo.userName +'","ActivePersonNum":'+ obj.ActivePersonNum +',"StandardMoney":'+ obj.StandardMoney +',"StatisticalMethod":1,"RewardProportionModels":'+jsonUtils.toString(DailyWagesContent)+'}', function (data) {
            if (data.Code == 200){
                if (data.Data.Result){
                    toastUtils.showToast("修改成功");
                    setPanelBackPage_Fun("dailyWagesContract");
                }else {
                    if (data.Data.Msg != 1){
                        toastUtils.showToast(data.Data.Msg);
                    }else {
                        toastUtils.showToast("修改失败");
                    }
                }
            }else {
                toastUtils.showToast(data.Msg);
            }
        }, '正在加载数据...');
    }
}

//@ 小数点后只能输入3位
function threeDecimal(e, number) {
    if (!/^\d+[.]?\d*$/.test(number)) {
        //检测正则是否匹配
        e.value = /^\d+[.]?\d*/.exec(e.value);
    }
    var origin = e.value;
    var temp=origin.replace(/^(\-)*(\d+)\.(\d\d\d).*$/,'$1$2.$3');
    e.value = temp;
    return false;
}
