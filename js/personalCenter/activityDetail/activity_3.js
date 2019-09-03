function activity_3LoadedPanel(){
	catchErrorFun("activity_3Detail_init();");
}

function activity_3Detail_init(){
	//获取签到活动充值、有效投注金额
	Getbuymoney();
}

//获取签到活动充值、有效投注金额
function Getbuymoney() {
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/Getbuymoney"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
            $("#RechargeMoney_3").text(d.Data.RechargeMoney);
            $("#BuyMoney_3").text(d.Data.BuyMoney);
            $("#singeDays_3").text(d.Data.RegisterNum);
            
            
            var root_div = document.getElementById('clearfix');
			var second_divs = root_div.children;
			for(var i = 0; i < second_divs.length; i++){
			    if (second_divs[i].className == "active") {
					second_divs[i].className = "";
				}
			}
            var days = Number(d.Data.RegisterNum);
            for(var i=0;i<days;i++){
            	$("#signIn_box li").eq(i).addClass("active");
            	$("#signIn_box li p").eq(i).css({"color":"#8159d4"});
            	$("#signIn_box li span").eq(i).css({"background":"#8159d4"});
            }
             
            
			//检查是否可以领取奖金(实际就是查询  已经签到的天数)
			CheckgetReginmoney();
        }
    },'正在加载数据');
}

//检查是否可以领取奖金
function CheckgetReginmoney() {
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/CheckgetReginmoney"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
            $("#singeDays_3").text(d.Data.Resultdata);
            
            if(d.Data.IsRegister == true){ //已签到
            	var a1 =document.getElementById("singe_btn_3");
            	a1.src = "images/singe_3_over.png";
            	$("#singe_btn_3").off('click');
            }else{//未签到
            	if(Number($("#BuyMoney_3")[0].innerText) >= 2000 ){
	            	var a1 =document.getElementById("singe_btn_3");
	            	a1.src = "images/singe_3_show.png";
	            	$("#singe_btn_3").off('click');
				    $("#singe_btn_3").on('click', function(){
				        //签到
				        UserRegin();
				    });
	            }else{
	            	var a1 =document.getElementById("singe_btn_3");
	            	a1.src = "images/singe_3_hide.png";
	            	$("#singe_btn_3").off('click');
	            	$("#singe_btn_3").on('click', function(){
				        //签到
				        toastUtils.showToast('条件未达标');
				    });
	            }
            }
        }
    },'正在加载数据');
}

//签到
function UserRegin() {
	$("#singe_btn_3").off('click');
	var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/UserRegin"}';
    ajaxUtil.ajaxByAsyncPost(null,param,function(d){
        if(d.Code == 200){
        	if(d.Data.ResultNum == 1){
        		toastUtils.showToast('签到成功');
        	}else{
        		toastUtils.showToast('签到失败');
        	}
        }else{
        	toastUtils.showToast('签到失败');
        }
        //获取签到活动充值、有效投注金额
		Getbuymoney();
    },'正在加载数据');
}
