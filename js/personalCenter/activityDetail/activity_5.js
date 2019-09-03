function activity_5LoadedPanel(){
	catchErrorFun("activity_5Detail_init();");
}

function activity_5Detail_init(){
	//获取签到活动充值、有效投注金额
	Get_activity_info();
}

//获取签到活动充值、有效投注金额
function Get_activity_info() {
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Act_VerificationSign","UserID":"'+localStorageUtils.getParam("myUserID")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
            $("#RechargeMoney").text(d.Data.RechargeMoney);//充值金额
            $("#BuyMoney").text(d.Data.BetMoney);//投注金额（消费金额）
            $("#singeDays").text(d.Data.SignedNum);//已连续签到次数
            
            //是否可以签到领取
            if(d.Data.SignSate){ //可以签到
            	var a1 =document.getElementById("singe_btn");
            	a1.src = "images/singe5_show.png";
            	$("#singe_btn").off('click');
			    $("#singe_btn").on('click', function(){
			        //领取
			        UserSign();
			    });
            }else{
            	var a1 =document.getElementById("singe_btn");
            	a1.src = "images/singe5_over.png";
//          	$("#singe_btn").off('click');
//          	$("#singe_btn").on('click', function(){
//			        //签到
//			        toastUtils.showToast('活动区间内充值400元，且每日消费400元即可领取');
//			    });
            }
        }else{
        	toastUtils.showToast('获取数据失败');
        }
    },'正在加载数据');
}

//领取
function UserSign() {
	$("#singe_btn").off('click');
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Act_UserSign","UserID":"'+localStorageUtils.getParam("myUserID")+'"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
        	if(d.Data.SignState == 1){ // 签到状态(1=成功、-4=失败、-2=当天已领取)
        		toastUtils.showToast('领取成功,赠送' + d.Data.RewardMoney +"元！");
        	}else if(d.Data.SignState == -2){
        		toastUtils.showToast('已领取');
        	}else if(d.Data.SignState == -4){
        		toastUtils.showToast('活动区间充值'+ d.Data.RechargeMoney + '元，且每日消费 ' + d.Data.BetMoney + '元即可领取');
        	}
        }else{
        	toastUtils.showToast('领取失败');
        }
        //获取签到活动充值、有效投注金额
		Get_activity_info();
    },'正在加载数据');
}
