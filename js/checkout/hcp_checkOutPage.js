/* 
*   出票
* * @Author: admin
*/

//总注数
var zongjine = 0;
var zhushuzongs = 0;
var newFactCNumber;
/**
 * @Description: 进入该页面时调用
 */
function hcp_checkOutPageLoadedPanel(){
    catchErrorFun("hcp_checkOutPage_init();");
    $("#hcp_selectNum_list").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    $("#hcp_selectNum_list").scroller().scrollToTop();
    $("#hcp_selectNum_list").scroller().clearInfinite();     
}
/**
 * @Description: 离开本页面时调用
 */
function hcp_checkOutPageUnloadedPanel(){
    $("#hcp_checkOutPage_jixuan").css("display", "");
    $("#hcp_lossPerInput").val("");
}
/**
 * @Description: 入口
 */
function hcp_checkOutPage_init(){
	$("#hcp_ticcket_name").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
	
	//用户选号的记录信息
	hcp_addListViewItem_fisrt();

    //机选按钮监听
    $("#hcp_checkOutPage_jixuan").off('click');
    $("#hcp_checkOutPage_jixuan").on('click', function(event) {
        hcp_checkOut_jixuan();
    });

    //清空号码按钮监听
    $("#hcp_checkOutPage_qingkong").off('click');
    $("#hcp_checkOutPage_qingkong").on('click', function(event) {
        $("#hcp_listviewid").empty();
		$("#hcp_lossPerInput").val('');
        hcp_checkoutResult=[];
        zhushuzongs = 0;
		hcp_getCheckOutNotesAndMoney(0);
	});

    //手选按钮监听
    $("#hcp_checkOutPage_shouxuan").off('click');
    $("#hcp_checkOutPage_shouxuan").on('click', function(event) {
        createInitPanel_Fun(hcp_LotteryInfo.getLotteryTagById(current_LottreyId)+"Page",true);   
//   	checkOut_clearData();
    });
     //追号按钮监听
    $("#hcp_checkOutPage_zhuihao").off('click');
    $("#hcp_checkOutPage_zhuihao").on('click',function(e){
    	$.ui.popup(
        {
            title:"提示：",
            message:'追号功能，敬请期待！',
            doneText:"确定"
        });
    });

    //统一设置列表所有赔率
    $("#hcp_LossPerBtn").off('click');
    $("#hcp_LossPerBtn").on('click',function (event) {
        var inputVal = Number($("#hcp_lossPerInput").val());
        if (inputVal > 0) {
            hcp_unified_money(inputVal);
        }else {
            toastUtils.showToast("请输入正确的金额");
        }
    });
        
    //付款按钮监听
    $("#hcp_checkOutPage_payout").off('click');
    $("#hcp_checkOutPage_payout").on('click', function(event) {
    	$(":input").blur();
    	
    	if(Number($('#hcp_checkOutPage_money').text()) > Number($('#hcp_checkOut_lottery_money').text())){
			toastUtils.showToast("余额不足");
			return;
		}
		if(Number($('#hcp_checkOutPage_zhushu').text())<1){
			toastUtils.showToast("至少选择一注!");
			return;
		}
		if(Number($('#hcp_checkOutPage_money').text())<1){
			toastUtils.showToast("投注金额不能为空!");
			return;
		}
		
		//提示
        $.ui.popup(
        {
            title:"提 示",
            message:'您共投' + $('#hcp_checkOutPage_zhushu').text() +'注,共' + $('#hcp_checkOutPage_money').text() +'元，请确认',
            cancelText:"关闭",
            cancelCallback:
            function(){
            },
            doneText:"确定",
            doneCallback:
            function(){
                hcp_getQiHao();
            },
            cancelOnly:false
        });
    });
    
	//返回,清空所有数据
    $("#hcp_checkOutPage_back").off('click');
    $("#hcp_checkOutPage_back").on('click',function(e){
    	if(hcp_checkoutResult.length ==0){
    		createInitPanel_Fun(hcp_LotteryInfo.getLotteryTagById(current_LottreyId)+"Page",true); 
    	}else{
    		$.ui.popup(
	        {
	            title:"提示：",
	            message:'返回将清空已选号码！<br/><br/>您确定返回吗？',
	            cancelText:"关闭",
	            cancelCallback:
	            function(){
	            },
	            doneText:"确定",
	            doneCallback:
	            function(){
	            	createInitPanel_Fun(hcp_LotteryInfo.getLotteryTagById(current_LottreyId)+"Page",true); 
	           	 	hcp_checkOut_clearData();
	            },
	            cancelOnly:false
	        });
    	}
    });
}

/**
 * @Description: 统一金额
 */
function hcp_unified_money(value) {
//	var obj_arr = [];
//	$.each(hcp_checkoutResult, function(k, v){
//	 	obj_arr.push(v.nums);
//	});
//	for (var j=0;j<obj_arr.length;j++){
//		var item = obj_arr[j].toString().split(",");
//		for (var k=0;k<item.length;k++){
//			var item_arr = item[k].toString().split("_");
//			var str = item_arr[0]+"_"+item_arr[1]+"_"+item_arr[2]+"_"+item_arr[3]+"_"+ value;
//			obj_arr[j][k] = [];
//			obj_arr[j][k] = str;
//		}
//	}
// 			
//	hcp_checkoutResult[0].nums = [];
//  hcp_checkoutResult[0].nums =obj_arr;
//  //动态创建投注列表view
//  hcp_addListViewItem();
    
    for (var j=0;j<hcp_checkoutResult.length;j++){
    	var item = hcp_checkoutResult[j].nums;
    	for (var k=0;k<item[0].length;k++){
			var item_arr = item[0][k].toString().split("_");
			var str = item_arr[0]+"_"+item_arr[1]+"_"+item_arr[2]+"_"+item_arr[3]+"_"+ value;
			item_arr = str;
			hcp_checkoutResult[j].nums[0][k] = str;
		}
    }
    //动态创建投注列表view
    hcp_addListViewItem();
}

/**
 * @Description: 动态创建投注列表item 选号页面跳转进来；
 */
function hcp_addListViewItem_fisrt() {
    $("#hcp_listviewid").empty();
    zhushuzongs=0;
    zongjine = 0;
    
    for (var j=0;j<hcp_checkoutResult.length;j++){
    	var betNumber_arr = [];
	    var old_betNumber_arr = hcp_checkoutResult[j].nums
	    var item_arr =[];
		for (var i=0;i<old_betNumber_arr.length;i++){
			if(old_betNumber_arr[i].length > 0){
				item_arr = old_betNumber_arr[i];
				if(hcp_checkoutResult[j].money != ""){
					for (var k=0;k<item_arr.length;k++){
						item_arr[k] = item_arr[k] + "_" + hcp_checkoutResult[j].money;
					}
				}
				betNumber_arr.push(item_arr);
			}
		}
		hcp_checkoutResult[j].nums = [];
		hcp_checkoutResult[j].nums = betNumber_arr;
    }
    //动态创建投注列表view
    hcp_addListViewItem();
}

/**
 * @Description: 动态创建投注列表item
 */
function hcp_addListViewItem() {
    $("#hcp_listviewid").empty();
    zhushuzongs=0;
    zongjine = 0;
    for (var m=0;m<hcp_checkoutResult.length;m++){
    	if(!isNullObj(hcp_checkoutResult[m])){
    		var lotteryType = hcp_checkoutResult[m].lotteryType;
    		var playMethodIndex = hcp_checkoutResult[m].playMethodIndex;
    		var playName = hcp_checkoutResult[m].playMethod;
    		var nums = hcp_checkoutResult[m].nums;
    		var playRebates = hcp_checkoutResult[m].rebates;
    		var money = hcp_checkoutResult[m].money;
    		
    		//创建投注信息的每一个item
    		var obj_arr = [];
			obj_arr = nums;
		 	var mark;
			for (var j=0;j<obj_arr.length;j++){
				var num = j;
				
				for (var k=0;k<obj_arr[j].length;k++){
					var itemArr = obj_arr[j][k].toString().split("_");
//					var itemMoney = itemArr.length>4 ? itemArr[4] : (money ? money : "");
					var itemMoney = itemArr.length>4 ? itemArr[4] : "";
					if(Number(itemMoney)>0)zongjine += Number(itemMoney);
				    var $itemLi = $('<li class="hcp_checkItem">' +
			            '<p style="font-weight: bold;"><span>'+ itemArr[0] +'</span><span style="color:#FE5D39;margin-left: 6px;">'+ itemArr[1] +'</span></p>' +
						//'<p style="color: #666;">玩法：<span>'+playName+'</span>&nbsp;&nbsp;&nbsp;&nbsp;玩法ID：<span>'+itemArr[2]+'</span></p>' +
						'<p style="color: #666;">玩法：<span>'+playName+'</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;赔率：<span>'+itemArr[3]+'</span></p>' +
			            '<p style="color: #666;">返点：<span>'+playRebates+'</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="tel" onchange="add_money('+m+','+k+',this)" placeholder="输入金额" maxlength="9" value="'+ itemMoney +'" onkeyup="this.value=this.value.replace(/\\D/g,\'\')">&nbsp;&nbsp;元<br/></p></li>');
				    var $itemLi_a = $('<div onclick="hcp_del('+m+','+k+')" id="' + num + '" style="position: absolute;left:82%;top:26%;width:50px;height:50px;text-align:center;padding-top:10px;"><img src="images/del.png" style="width:24px; height:24px;"/></div>');
				    $itemLi.append($itemLi_a);
				    
					$("#hcp_listviewid").append($itemLi);
				    zhushuzongs ++;
				}
			}
    	}
    }
    hcp_getCheckOutNotesAndMoney(zongjine);
}

//添加金额；
function add_money(a,b,obj){
	obj.blur();
//	var arr =[];
//	$.each(hcp_checkoutResult, function(k, v){
//	 	arr = v.nums;
//	});
//	
//  var arr_one = arr[a];
//  var item_arr = arr_one.toString().split("_");
//  var str = item_arr[0]+"_"+item_arr[1]+"_"+item_arr[2]+"_"+item_arr[3]+"_"+ obj.value;
//  arr_one = [];
//  arr_one = str;
//  arr.splice(a,1,arr_one);
//  
//  hcp_checkoutResult[0].nums = [];
//  hcp_checkoutResult[0].nums =arr;
//  
//  //动态创建投注列表view
//  hcp_addListViewItem();
    
    var item_arr = hcp_checkoutResult[a].nums[0][b].toString().split("_");
    var str = item_arr[0]+"_"+item_arr[1]+"_"+item_arr[2]+"_"+item_arr[3]+"_"+ obj.value;
    hcp_checkoutResult[a].nums[0][b] = str;
    
    //动态创建投注列表view
    hcp_addListViewItem();
}

//动态删除LI
function hcp_del(a,b){
	var arr =[];
	arr = hcp_checkoutResult[a].nums;
    arr[0].splice(b,1);
    
    if(arr[0].length == 0){
    	hcp_checkoutResult.splice(a,1);
    }else{
    	hcp_checkoutResult[a].nums = [];
    	hcp_checkoutResult[a].nums =arr;
    }
    
    //动态创建投注列表view
    hcp_addListViewItem();
}


/**
 * 判断对象是否为空
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isNullObj(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)){
            return false;
        }
    }
    return true;
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-13 09:50:10
 * @Description: 清空记录
 */
function hcp_checkOut_clearData() {
    hcp_checkoutResult=[];
    //总注数
    zhushuzongs = 0;
	$("#hcp_lossPerInput").val('');
}

/**
 * 获取最新期号  
 */
function hcp_getQiHao(){
  	var params='{"LotteryCodeEnum": ' + current_LottreyId + ',"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetCurrLotteryIssue"}';
    ajaxUtil.ajaxByAsyncPost1(null,params,function(data){
        if(data.Code == 200){
           newFactCNumber=data.Data.IssueNumber;
           hcp_fukuanPost();
        } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
        }else{
		    toastUtils.showToast(data.Msg);
		}
    },null);
}

/**
 * @Description:  付款时的post请求
 */
function hcp_fukuanPost(){
    //装载向服务器提交的数据
    var paramList = [];
    var isContinue = true;
	
	for (var k=0;k<hcp_checkoutResult.length;k++){
      	var obj = hcp_checkoutResult[k];
        var obj_arr = [];
		obj_arr = hcp_checkoutResult[k].nums;
		for (var j=0;j<obj_arr[0].length;j++){
		    var checkoutParam = {
                toString : function() {
                    return JSON.stringify(this);
                }
            };
            var item_arr= obj_arr[0][j].toString().split("_");
            if(item_arr.length < 5){
            	isContinue = false;
            	toastUtils.showToast("投注金额不能为空");
            	return;
            }
            if(item_arr[item_arr.length-1]=="" || item_arr[item_arr.length-1]==0){
            	isContinue = false;
            	toastUtils.showToast("投注金额不能为空");
            	return;
            }
		    checkoutParam.LotteryCode = current_LottreyId;//彩种id
            checkoutParam.PlayCode = item_arr[2];
            checkoutParam.BetRebate = obj.rebates;
            checkoutParam.IssueNumber = newFactCNumber;
            checkoutParam.Odds = item_arr[3];
            checkoutParam.BetMoney = item_arr[4];
            
            if(checkoutParam.PlayCode == "52615" || checkoutParam.PlayCode == "58215" || checkoutParam.PlayCode == "58315"){//快三全骰  投注内容格式特殊：全骰。
            	checkoutParam.BetContent = item_arr[1];
            }else if(checkoutParam.PlayCode == "50912" || checkoutParam.PlayCode == "57912" || checkoutParam.PlayCode == "58012"){//快乐8  投注内容格式特殊：前后和。
            	checkoutParam.BetContent = item_arr[1];
            }else if(checkoutParam.PlayCode == "50915" || checkoutParam.PlayCode == "57915" || checkoutParam.PlayCode == "58015"){//快乐8  投注内容格式特殊：单双和。
            	checkoutParam.BetContent = item_arr[1];
            }else if(checkoutParam.PlayCode == "50905" || checkoutParam.PlayCode == "57905" || checkoutParam.PlayCode == "58005"){//快乐8  投注内容格式特殊：总和810。
            	checkoutParam.BetContent = item_arr[0].replace(":","")+item_arr[1];
            }else{
            	checkoutParam.BetContent = item_arr[0].replace(":","-")+item_arr[1];
            }

            paramList.push(checkoutParam);
		}
    }

	
        
    if (!isContinue) {
    	toastUtils.showToast("投注金额不能为空");
        return;
    }

    if (1000 < paramList.length) {
        toastUtils.showToast("您的订单不能超过1000条!");
        return;
    }
	
    ajaxUtil.ajaxByAsyncPost(null, '{"UserIDList":[0],"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', function(data) {
    if (data.Code == 200) {
        var yue = data.Data.lotteryMoney;
        var totalMoney = $('#checkOutPage_money').html();
        var result = bigNumberUtil.minus(yue, totalMoney);
        var zero = new BigNumber("0");
        if (result >= zero) {
            var params = '{"BetInfoList":[' + paramList.join(",") +'],"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/UserBet_PK"}';
            ajaxUtil.ajaxByAsyncPost(null,params,function(data) {
                if(data.Code == 200){
                    if(true == data.Data.state){
                    	//清空
                    	$("#hcp_listviewid").empty();
                    	$("#hcp_lossPerInput").val('');
						hcp_checkoutResult=[];
						
						$.ui.blockUI(.2);
                        ajaxUtil.ajaxByAsyncPost(null, '{"UserIDList":[0],"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', function(response) {
                            if (true == response.state) {
                                var yue = response.lotteryMoney;
                                localStorageUtils.setParam("lotteryMoney", yue); //保存余额
                            }
                        });

                        //*** 弹窗显示查看记录的按钮 ****
                        $.ui.popup(
                        {
                            title:"提 示",
                            message:'投注成功',
                            cancelText:"查看记录",
                            cancelCallback:
                                function(){
                                    /*if(currentTouzhuInfo.lotteryType){
                                        eval(currentTouzhuInfo.lotteryType+"ResetPlayType()");
                                    }*/
                                    localStorageUtils.removeParam("playMode");
                                    localStorageUtils.removeParam("playBeiNum");
                                    localStorageUtils.removeParam("playFanDian");
                                    createInitPanel_Fun("myBettingRecordsPK",true);
                                    //清除数据
                                    hcp_checkOut_clearData();
                                    //cancel
                                    if($.query("BODY DIV#mask")){
                                        $.query("BODY DIV#mask").unbind("touchstart");
                                        $.query("BODY DIV#mask").unbind("touchmove");
                                        $("BODY DIV#mask").remove();
                                    }
                                },
                            doneText:"继续投注",
                            onShow:function(){
                                setTimeout(function(){
                                    if($.query("BODY DIV#mask").length == 0){
                                        opacity = " style='opacity:0.8;'";
                                        $.query("BODY").prepend($("<div id='mask'" + opacity + "></div>"));
                                        $.query("BODY DIV#mask").bind("touchstart", function (e) {
                                            e.preventDefault();
                                        });
                                        $.query("BODY DIV#mask").bind("touchmove", function (e) {
                                            e.preventDefault();
                                        });
                                    }
                                },50);
                            },
                            doneCallback:
                                function(){
                                	createInitPanel_Fun(  hcp_LotteryInfo.getLotteryTagById(current_LottreyId) + "Page" );
                                    //清除数据
                                    hcp_checkOut_clearData();
                                    //done
                                    if( $.query("BODY DIV#mask")){
                                        $.query("BODY DIV#mask").unbind("touchstart");
                                        $.query("BODY DIV#mask").unbind("touchmove");
                                        $("BODY DIV#mask").remove();
                                    }
                                },
                            cancelOnly:false
                        });
                    }else{
						toastUtils.showToast(data.Data.mark);
                    }
                } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
					toastUtils.showToast("请重新登录");
					loginAgain();
    			}else{
				    toastUtils.showToast(data.Msg);
				}
            },null);
        }else{
            toastUtils.showToast("余额不足");
     	}
    }else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
    }else{
    	toastUtils.showToast(data.Msg);
    }
},'正在生成订单');
}

/**
 * @Description:  计算组数和金额
 */
function hcp_getCheckOutNotesAndMoney(zongjine){
    if(zhushuzongs==null){
        $("#hcp_checkOutPage_zhushu").html("0");
    }else{
        $("#hcp_checkOutPage_zhushu").html(zhushuzongs);
    }
    $("#hcp_checkOutPage_money").html(parseFloat(zongjine));
    $("#hcp_checkOut_lottery_money").html(localStorageUtils.getParam("lotteryMoney"));
}

/**
 * @Description: 机选
 */
function hcp_checkOut_jixuan(){
    var randomObject = hcp_clickForRandom(eval(hcp_LotteryInfo.getLotteryTagById(current_LottreyId) + '_checkOutRandom'));
    var submitParams = new hcp_LotterySubmitParams();
    submitParams.lotteryType = randomObject.lotteryType;
    submitParams.playType = randomObject.playType;
    submitParams.playMethod =  randomObject.playMethod ;
    submitParams.playTypeIndex = randomObject.playTypeIndex ;
    submitParams.playMethodIndex = randomObject.playMethodIndex ;
    submitParams.notes = randomObject.notes;
    submitParams.sntuo = randomObject.sntuo;
    submitParams.multiple = randomObject.multiple;
    submitParams.rebates = randomObject.rebates;
    submitParams.playMode = randomObject.playMode;
    submitParams.money = randomObject.money;
    submitParams.award = randomObject.award;
    submitParams.maxAward = randomObject.maxAward;
    var new_nums = [];
    for (var i=0;i<randomObject.nums.length;i++){
    	if(randomObject.nums[i].length != 0){
			if(Number($("#hcp_lossPerInput").val())){
				new_nums.push(randomObject.nums[i][0] + "_" + Number($("#hcp_lossPerInput").val()));
			}else{
				new_nums.push(randomObject.nums[i][0]);
			}
		}
    }
    submitParams.nums =[];
    submitParams.nums.push(new_nums);
    
    if(hcp_checkoutResult.length == 0){  //点击清空按钮之后，hcp_checkoutResult=[];
    	hcp_checkoutResult[0] = submitParams;
    }else{
//		hcp_checkoutResult[0].nums[0].unshift(new_nums);
		hcp_checkoutResult.unshift(submitParams);
    }

//	if(!submitParams.money){
//		hcp_checkoutResult[0].money = Number($("#hcp_lossPerInput").val());
//	}

    hcp_addListViewItem();
}