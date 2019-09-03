/*进入panel时调用*/
function modifyDailyWagesThreeLoadedPanel(){
    catchErrorFun("modifyDailyWagesThreeInit();");
}

/*离开panel时调用*/
function modifyDailyWagesThreeUnloadedPanel(){
    $("#initDailyWages").empty();
    $("#new_daily_wages").empty();
    $("#pending_daily_wages").empty();
}

//@ Init
function modifyDailyWagesThreeInit() {
    var modifyDayWageInfo = jsonUtils.toObject(localStorageUtils.getParam("dailyWagesCttInfo"));
    var myUserID = localStorageUtils.getParam("myUserID");
    $("#modify_daily_wages_username").html("用户名："+modifyDayWageInfo.userName);

    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetMyDownDayWagesThree","ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'","SubordinateUserid":' + modifyDayWageInfo.userID+'}', modifyDailyWagesThree_callBack, '正在加载数据...');

    //Btn
    $("#modifyDailyWagesBtn").off('click');
    $("#modifyDailyWagesBtn").on('click',function () {
        submitModifyDailyWages(modifyDayWageInfo);
    });
}

function modifyDailyWagesThree_callBack(data) {
    var modifyDayWageInfo = jsonUtils.toObject(localStorageUtils.getParam("dailyWagesCttInfo"));
    if(data.Code == 200){
	    var MyDayWages = data.Data.MyDayWagesThree;
        var SubordinateDayWages = data.Data.SubordinateDayWagesThree;
        var initDailyWages = data.Data.InitDayWagesRules;
        var my_daily_wages = 0;

        //@ 日工资标准，表头
        var $MineUl = $('<ul class="recordDetail my-daywage-ctt-three"><li><span> 日工资标准 </span><span> 销量 </span><span> 活跃人数 </span></li></ul>');

        if(MyDayWages.length > 0){
            my_daily_wages = MyDayWages[0].DayWagesProportion;
            $("#my_daily_wages").html("我的日工资契约："+ MyDayWages[0].DayWageStandard);

            if (initDailyWages.length > 0){
                for(var i = 0; i < initDailyWages.length; i++){
                    if(parseFloat(my_daily_wages) >= initDailyWages[i].DayWagesProportion){
                        var $LiMine = $('<li><span>'+ initDailyWages[i].DayWageStandard +'</span><span>'+initDailyWages[i].DaySales+'</span><span>'+initDailyWages[i].ActiveNumber+'</span></li>');
                        $MineUl.append( $LiMine);
                    }
                }
            }else {
                $MineUl.append('<p style="text-align:center;"> 无记录 </p>');
            }
        }else{
            $("#my_daily_wages").html("我的日工资契约：0");
            $MineUl.append('<p style="text-align:center;"> 无记录 </p>');
        }

        var current_daily_wages = 0;
        if(SubordinateDayWages.length > 0){
            current_daily_wages = SubordinateDayWages[0].DayWagesProportion;
            $("#current_daily_wages").html("当前日工资："+ SubordinateDayWages[0].DayWageStandard);
        }else{
            $("#current_daily_wages").html("当前日工资：0");
        }

        $("#initDailyWages").append($MineUl);

        $("#new_daily_wages").append('<option value="">请选择新的日工资</option>');

        if (modifyDayWageInfo.State == 2) {  //添加日工资契约
            $("#modifyDailyWagesBtn").show();
            $("#new_daily_wages").show();
            for (var i = 0; i < initDailyWages.length;i++){
                if(parseFloat(initDailyWages[i].DayWagesProportion) <= parseFloat(my_daily_wages) && bigNumberUtil.multiply(initDailyWages[i].DayWagesProportion,100) >= data.Data.MaxdDayWagesProportion){
                    $("#new_daily_wages").append('<option value="'+initDailyWages[i].ID+'">'+ initDailyWages[i].DayWageStandard +'</option>')
                }
            }
        }else{ //修改日工资契约
            for (var i = 0; i < initDailyWages.length;i++){
                if( (parseFloat(initDailyWages[i].DayWagesProportion) <= parseFloat(my_daily_wages)) && (parseFloat(initDailyWages[i].DayWagesProportion) > parseFloat(current_daily_wages)) ){
                    $("#new_daily_wages").append('<option value="'+(i+1)+'">'+ initDailyWages[i].DayWageStandard +'</option>')
                }
            }
            $("#new_daily_wages").show();
            $("#modifyDailyWagesBtn").show();

            if(modifyDayWageInfo.State == 0){
                $("#modifyDailyWagesBtn").hide();
                $("#new_daily_wages").hide();
                $("#pending_daily_wages").html('待确认日工资：'+data.Data.SuperiorDayWageStandard);
            }
        }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}


//@ 点击按钮
function submitModifyDailyWages(modifyDayWageInfo) {
	if($("#new_daily_wages").find("option:selected").val() == ""){
		toastUtils.showToast("请选择日工资");
		return;
	}

	if (modifyDayWageInfo.State == 2){  //添加日工资契约
		ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/AddDayWagesThree","ProjectPublic_PlatformCode":2,"UserName":"' + modifyDayWageInfo.userName +'","ID":'+ $("#new_daily_wages").find("option:selected").val() +'}', function (data) {
			if(data.Code == 200){
				if(data.Data.Result == 1){
					toastUtils.showToast("添加成功");
					setPanelBackPage_Fun("dailyWagesContractThree");
				}else if(data.Data.Result == -5){
					toastUtils.showToast("该用户是非顶级代理");
				}else {
					toastUtils.showToast("添加失败，请稍后再试");
				}
			} else {
				toastUtils.showToast(data.Msg);
			}
		}, '正在加载数据...');

	}else{  //修改日工资契约
		ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/ModifyDayWagesThree","ProjectPublic_PlatformCode":2,"UserName":"' + modifyDayWageInfo.userName +'","ModifyId":'+ $("#new_daily_wages").find("option:selected").val() +',"UserID":'+ modifyDayWageInfo.userID +'}', function (data) {
			if(data.Code == 200){
				if(data.Data.Result){
					toastUtils.showToast("修改成功");
					setPanelBackPage_Fun("dailyWagesContractThree");
				}else {
					toastUtils.showToast("修改失败，请稍后再试");
				}
			} else {
				toastUtils.showToast(data.Msg);
			}
		}, '正在加载数据...');
	}
}
