function activity_2LoadedPanel(){
  catchErrorFun("activity_2Detail_init();");
}

function activity_2Detail_init(){
	$("#recive_btn").off('click');
    $("#recive_btn").on('click', function(){
        GetReward();
    });
    
//	//查询领取条件
//	Get_Recharge_Activity();
}

//查询领取条件
function Get_Recharge_Activity() {
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Get_Recharge_Activity"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
			//0：无可领取金额 -2:已领取过
            var retMoney = d.Data.ReturnMoney;
            if (retMoney == "" || retMoney == "-2") {
                retMoney = 0;
                $("#recive_btn_li").hide();
            }else{
                $("#recive_btn_li").show();
            }
            $("#awardAmount").text(retMoney);
            $("#rechargeSum").text(d.Data.ReceiveMoney);
        }
    },'正在加载数据');
}

function GetReward() {
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Receive_Recharge_ActivityMoney"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if (d.Code == 200) {
                toastUtils.showToast(d.Data.Remarks);
                Get_Recharge_Activity();
        }else {
             toastUtils.showToast('当前网络不给力，请稍后再试');
        }

    },'正在加载数据');
    
}