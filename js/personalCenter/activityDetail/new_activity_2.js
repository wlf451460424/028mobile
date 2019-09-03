// 开业活动：会员充值，坐等收佣
function new_activity_2LoadedPanel(){
	catchErrorFun("new_activity_2Detail_init();");
}
function new_activity_2Detail_init(){
	//获取活动是否可以领取
	Get_activity_info_2();
}
//获取活动是否可以领取
function Get_activity_info_2() {
	$("#recive_btn").hide();
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Get_MemberRecharge_Commission","UserID":"'+localStorageUtils.getParam("myUserID")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
            //是否可以领取
            if(d.Data.Result == 1){ //可以领取 显示按钮
				$("#recive_btn").show();
            	$("#recive_btn").off('click');
			    $("#recive_btn").on('click', function(){
			        //领取
					$("#recive_btn").hide();
			        reciveMoney();
			    });
            }else{
				$("#recive_btn").hide();
				$("#recive_btn").off('click');
            }
        }
    },'正在加载数据');
}

//领取
function reciveMoney() {
	$("#singe_btn").off('click');
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Receive_MemberRecharge_Commission","UserID":"'+localStorageUtils.getParam("myUserID")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
        	if(d.Data.Result == 1){ // (1=成功、<>1失败 )
        		toastUtils.showToast('领取成功！');
        	}else{
        		toastUtils.showToast(d.Data.Remarks);
        	}
        }else{
        	toastUtils.showToast('领取失败');
        }
        //获取活动是否可以领取
		Get_activity_info_2();
    },'正在加载数据');
}
