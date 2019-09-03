// 开业活动：会员充值大酬宾：充值就送10%
function new_activity_1LoadedPanel(){
	catchErrorFun("new_activity_1Detail_init();");
}
function new_activity_1Detail_init(){
	//查询活动反奖金额接口
	Get_activity_info();
}
//查询活动反奖金额接口
function Get_activity_info() {
	$('#singe_btn').hide();
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Get_NationalAvtivity","UserID":"'+localStorageUtils.getParam("myUserID")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
            $("#ReceiveMoney").text(d.Data.ReceiveMoney);//充值金额
            $("#ReturnMoney").text(d.Data.ReturnMoney);//反奖金额(>0 按钮显示)
			
			// ReturnMoney 反奖金额(>0 按钮显示)
			// ReceiveMoney 首冲金额
			// ConsumptionMoney  消费金额（0无意义）
			// Remarks  说明
			// Recharge_NationalAvtivity 活动领取接口
			// ReturnMoney 领取结果 1成功 <1失败 
			// Remarks     说明
            
            //是否可以签到领取
            if(Number(d.Data.ReturnMoney)>0){ //可以领取
				$('#singe_btn').show();
            	$("#singe_btn").off('click');
			    $("#singe_btn").on('click', function(){
			        //领取
			        UserSign();
			    });
            }else{
				$('#singe_btn').hide();
				$("#singe_btn").off('click');
            }
        }
    },'正在加载数据');
}

//领取
function UserSign() {
	$("#singe_btn").off('click');
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Recharge_NationalAvtivity","UserID":"'+localStorageUtils.getParam("myUserID")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
        	if(d.Data.ReturnMoney == 1){ // (1=成功、<1失败 )
        		toastUtils.showToast('领取成功！');
        	}else{
        		toastUtils.showToast(d.Data.Remarks);
        	}
        }else{
        	toastUtils.showToast('领取失败');
        }
        //获取签到活动充值、有效投注金额
		Get_activity_info();
    },'正在加载数据');
}
