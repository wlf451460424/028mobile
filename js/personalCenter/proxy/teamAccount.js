/** teamAccount
 */
//页大小
var PAGESIZE_teamAccount = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
var type_teamAccount = 0;
var IsHistory = false;
var selDateTAStart;
var selDateTAEnd;
/*进入panel时调用*/
function teamAccountLoadedPanel(){
    catchErrorFun("teamAccountRecordsInit();");
}
/*离开panel时调用*/
function teamAccountUnloadedPanel(){
    $("#teamAccountList").empty();
    //清除本地存储的查询条件
    clearSearchTerm();
    startDateTime = "";
    endDateTime = "";
    type_teamAccount = 0;
    IsHistory=false;
    if(selDateTAStart){
        selDateTAStart.dismiss();
    }
    if(selDateTAEnd){
        selDateTAEnd.dismiss();
    }
}

function teamAccountRecordsInit(){
    $("#teamAccountSelect").empty();

    var $select=$('<table><tr>' +
        '<td><select name="searchDate_teamAccount" id="searchDate_teamAccount" data-theme="a" data-mini="true" onchange="dateChange_teamAccount()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td>' +
        '<td><input type="text" id="selectDateTA_Stt" readonly/></td>' +
        '<td><input type="text" id="selectDateTA_End" readonly/></td></tr>' +
        '<tr><td colspan="3"><select name="searchType_teamAccount" id="searchType_teamAccount" data-theme="a" data-mini="true" onchange="typeChange_teamAccount()"><option value="0" selected="selected">全部</option><option value="18">充值</option>'+
        '<option value="26">提款</option><option value="3">转账</option><option value="1">投注</option>'+
        '<option value="2">中奖</option><option value="4">撤单</option>'+
        '<option value="5">撤奖</option><option value="6">活动</option>'+
        '<option value="7">下级返点</option><option value="8">自身投注返点</option>'+
        '<option value="9">给下级充值</option><option value="10">来自上级的充值</option>'+
        '<option value="33">提款手续费</option><option value="34">充值手续费</option>'+
        '<option value="11">管理员添加</option></select>'+
        '</td></tr></table>');

    if (localStorageUtils.getParam("IsDayWages") == "true"){
        $select.find('td:last-child').children('select').append('<option value="29">日结</option>');
    }
    if (localStorageUtils.getParam("IsContract") == "true"){
        $select.find('td:last-child').children('select').append('<option value="28">分红</option>');
    }
	//红包动态显示
	var sendRedPak_show = jsonUtils.toObject(localStorageUtils.getParam("sendRedPak_show")),
		isOpen = Number(sendRedPak_show.isOpen);  // 0 or 1
	if(isOpen){
		$select.find('td:last-child').children('select').append('<option value="31">红包雨</option>');
	}
    $("#teamAccountSelect").append($select);

    //查询开始时间
    selDateTAStart = new MobileSelectDate();
    selDateTAStart.init({trigger:'#selectDateTA_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selDateTAEnd = new MobileSelectDate();
    selDateTAEnd.init({trigger:'#selectDateTA_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

    userName = localStorageUtils.getParam("username");
    myUserID = localStorageUtils.getParam("myUserID");
    page = 0;
    hasMorePage = true; //默认还有分页
    type_teamAccount = $("#searchType_teamAccount").val();

    var _teamScroller =  $("#teamAccountScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _teamScroller.scrollToTop();
    _teamScroller.clearInfinite();
    addUseScroller(_teamScroller,'teamAccountList','getteamAccountRecords()');
    //进入时加载
    loadBySearchItemsTeamAccount();

    /**
     * 团队投注查询（右上角搜索）
     */
    $("#teamAccountSearchBtn").unbind('click');
    $("#teamAccountSearchBtn").bind('click', function(event) {
        $.ui.popup({
            title:"团队账变查询",
            message:'<input type="text" id="teamAccount_searchByName" maxLength="25"  placeholder="请输入要查找的用户名" />',
            cancelText:"关闭",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var searchUser = $("#teamAccount_searchByName").val();
                    if(searchUser ==""){
                        toastUtils.showToast("请输入要查找的用户名");
                        return;
                    }
                    queryteamAccountUserName(searchUser);
                },
            cancelOnly:false
        });
    });
}

/********** 查询投注记录 **********/
function getteamAccountRecords(){
	startDateTime = $("#selectDateTA_Stt").val()+hms00;
    endDateTime = $("#selectDateTA_End").val()+hms59;
    nextPage_teamAccount(startDateTime, endDateTime, type_teamAccount);
}

/********** 创建投注记录列表  *********/
function createteamAccountRecordsList(data){
	$("#teamAccount_noData_tips").hide();
    if (page == 0) {
        $("#teamAccountList").empty();
        $("#teamAccountScroller").scroller().scrollToTop();
        $("#teamAccountScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	    	$("#teamAccount_noData_tips").show();
	        toastUtils.showToast("没有数据");
	        return;
	    }
	    if (data.Data.DataCount == 0) {
	    	$("#teamAccount_noData_tips").show();
	      //toastUtils.showToast("没有数据");
	    } 
	    if (data.Data.DataCount!=0) {
	        var UfInfo = data.Data.UfInfo;
	        isHasMorePage(UfInfo,PAGESIZE_teamAccount);
	
	        for (var i = 0; i < UfInfo.length; i++) {
	            var dataSet = new Object();
	            dataSet.userName = UfInfo[i].UserName;  // 用户名
	            dataSet.DetailsSource = UfInfo[i].DetailsSource;
	            dataSet.orderId = UfInfo[i].OrderID;  // 订单号
		        dataSet.tradeType = getShouZhiByID(UfInfo[i].DetailsSource, UfInfo[i].RechargeType,UfInfo[i].PayTypeName);  //交易类型
	            //转盘活动未中奖时的金额显示
	            if(UfInfo[i].UseMoney == 0 && UfInfo[i].DetailsSource == 257){
	                dataSet.tradeMoney = UfInfo[i].Marks;
	            }else{
	                dataSet.tradeMoney = UfInfo[i].UseMoney;  // 交易金额
	            }
	            dataSet.thenBalance = UfInfo[i].ThenBalance;  // 余额
	            dataSet.details = remarkZH(UfInfo[i].Marks+"", UfInfo[i].DetailsSource, userName);  // 备注
	            dataSet.insertTime = UfInfo[i].InsertTime;  // 交易时间
	            //手续费
	            dataSet.FeeMoney = UfInfo[i].FeeMoney;
	             //彩种id
                dataSet.lotteryType = UfInfo[i].Marks;
	
	            var $itemLi = $('<li></li>').data('teamAccount',dataSet);
	            $itemLi.on('click',function() {
	                onItemClickListener_teamAccount();
	                localStorageUtils.setParam("teamAccount",JSON.stringify($(this).data('teamAccount')));
	                setPanelBackPage_Fun('teamAccountDetails');
	            });
//	            $itemLi.append('<a class="recordList"><dl class="orderList"><dd>用户名:&nbsp;' + dataSet.userName + '</dd><dd>交易金额:&nbsp;<span class="red">' + dataSet.tradeMoney +'</span></dd><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd></dl></a>');
	            $itemLi.append(teamAccount_selectRecordsIco(type,UfInfo[i].DetailsSource,dataSet,UfInfo[i].RechargeType));
	
	            $("#teamAccountList").append($itemLi);
	        }
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}


function teamAccount_selectRecordsIco(type,DetailsSource,dataSet,RechargeType){
	var str;
    switch(Number(type)) {
    	case 0:  //全部
    		switch(DetailsSource) {
		        case 1: //投注
		        case 20 : //出票
//		            return "投注";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/tou_ico.png"></dl></a>';
		            break;
		        case 10://撤单
		        case 11://撤单
		        case 12://撤单
		        case 13://撤单
//		            return "撤";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/che_ico.png"></dl></a>';
		            break;
		        case 60: //撤奖 
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/che_ico.png"></dl></a>';
		            break;
		        case 17: //活动加款
		        case 153: //活动加款
//		            return "优惠活动";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
		            break;
		        case 30: //自身投注返点
		        case 40: //下级返点
//		            return "返";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/fan_ico.png"></dl></a>';
		            break;
		        case 50:
//		            return "中奖";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/jiang_ico.png"></dl></a>';
		            break;
		        case 70: //提款
		        case 100://提款审批同意--后台人工出款
		        case 110://提款审批同意--自动出款
		        case 120://人工出款
		        case 121://提款成功--刷新
		        case 122://人工提款
//		            return "提款";
					return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico.png"></dl></a>';
		            break;
	         	case 90: //提款  提款拒绝，返还账户
	         		return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico_refuse.png"></dl></a>';
		            break;
		        case 80://申请提款失败
		        case 130://提款失败
		        case 131://提款失败--刷新1
		            return "提款失败";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico_refuse.png"></dl></a>';
		            break;
		        case 140://申请充值
		        case 151://其他加款
		        case 152://人工存款
		        case 200://来自上级的充值
//		            return "充值";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            break;
		        case 190:
//		            return "给下级充值";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            break;
		        case 160:
//		            return "充值失败";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico_refuse.png"></dl></a>';
		            break;
		        case 150:
		            if(RechargeType==0){
//		                temp="网银充值";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            }else if(RechargeType==1){
//		                temp="在线转账";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            }else if(RechargeType==2){
//		                temp="其他";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            }else if(RechargeType==3){
//		                temp="人工存款";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            }else if(RechargeType==4){
//		                temp="活动";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
		            }
		            break;
		        case 170:
		        case 180:
		        case 290:
		        case 310:
		        case 390:
		        case 410:
		        case 490:
		        case 510:
		        case 590:
		        case 790:
		        case 810:
		        case 890:
		        case 910:
//		            return "转账";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico.png"></dl></a>';
		            break;
		        case 300:
		        case 400:
		        case 500:
		        case 600:
		        case 700:
		        case 800:
		        case 900:
//		            return "转账"; 第三方到彩票
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico.png"></dl></a>';
		            break;
		        case 220:
		        case 230:
		        case 231:
		        case 240:
		        case 241:
		        case 251:
		        case 252:
		        case 253:
		        case 254:
		        case 255:
		        case 256:
		        case 257:
		        case 258:
		        case 259:
//		            return "系统活动";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
		            break;
		        case 264://发给下级的日结
		        case 266://人工扣除日结
//		            return temp="日结";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/rigongzi_ico.png"></dl></a>';
		            break;
		        case 261://按比例发放日结
		        case 262://按阶梯发放日结
		        case 263://来自上级的日结
		        case 265://人工添加日结
		        case 301:
		        case 302://日结
		        case 411://新日结
//		            return temp="日结";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/rigongzi_ico.png"></dl></a>';
		            break;
		        case 210:
		        case 267:
		        case 268:
		        case 269:
//		            return temp="分红";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/fenhong_ico.png"></dl></a>';
		            break;
		        case 303://其他扣款
		        case 304://活动扣款
//		            return temp="活动扣款";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
		            break;
			    case 412:
			   	 	//return temp="红包雨";
			    	return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hong_ico.png"></dl></a>';
					break;
				case 422:
//				    return temp="充值手续费";
				    return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
				    break;
				case 423:
//					return temp="提款手续费";//提款成功
				    return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
				    break;
				case 424:
//				    return temp="提款手续费";//提款拒绝 返还手续费
				    return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
				    break;
		        default:
		            break;
		    }
		case 18:  //充值
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
            break;
        case 9:  //给下级充值
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
            break;
        case 10:  //来自上级的充值
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
            break;
        case 34:  //充值手续费
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
            break;
        case 11:  //管理员添加
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/guan_ico.png"></dl></a>';
            break;
        case 26:  //提款
        	switch(DetailsSource) {
		        case 70 : //提款成功
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico.png"></dl></a>';
		            break;
		        case 90 : //提款  提款拒绝，返还账户
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico_refuse.png"></dl></a>';
		            break;
            }
        case 33:  //提款手续费
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
            break;
        case 3:  //转账
        	switch(DetailsSource) {
        		case 170:
		        case 180:
		        case 290:
		        case 310:
		        case 390:
		        case 410:
		        case 490:
		        case 510:
		        case 590:
		        case 790:
		        case 810:
		        case 890:
		        case 910:
//		            return "转账";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico.png"></dl></a>';
		            break;
		        case 300:
		        case 400:
		        case 500:
		        case 600:
		        case 700:
		        case 800:
		        case 900:
//		            return "转账"; 第三方到彩票
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico.png"></dl></a>';
		            break;
        		default:
		            break;
		    }
        case 1:  //投注
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/tou_ico.png"></dl></a>';
            break;
        case 2:  //中奖
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/jiang_ico.png"></dl></a>';
            break;
        case 4:   //撤单
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/che_ico.png"></dl></a>';
            break;
        case 5: //撤奖 
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/che_ico.png"></dl></a>';
            break;
        case 6:  //活动
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
            break;
        case 7:   //下级返点
        case 8:  //自身投注返点
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/fan_ico.png"></dl></a>';
            break;
        case 28:  //分红
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/fenhong_ico.png"></dl></a>';
            break;
        case 29:  //日工资
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/rigongzi_ico.png"></dl></a>';
            break;
        case 31:  //红包
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hong_ico.png"></dl></a>';
            break;
        default:
        	return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tradeType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.tradeMoney +'</span></dd><dd>时间:&nbsp;' + dataSet.insertTime +'</dd></dl></a>';
        	break;
    }
}


//玩法类型改变事件
function typeChange_teamAccount() {
    type_teamAccount = $("#searchType_teamAccount").val();
    startDateTime = $("#selectDateTA_Stt").val()+hms00;
    endDateTime = $("#selectDateTA_End").val()+hms59;
    searchTeamAccount(startDateTime, endDateTime, type_teamAccount);
}
/**
 * 查询历史投注记录信息（滚动刷新后的列表）
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 */
function nextPage_teamAccount(startDateTime, endDateTime, type_teamAcct) {
    var params = '{"InterfaceName":"/api/v1/netweb/GetTeamAccountChanged","Source":'+type_teamAcct+',"ProjectPublic_PlatformCode":2,"ThisUserName":"","insertTimeMin":"' + startDateTime + '","IsHistory":' + IsHistory + ',"insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamAccount + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createteamAccountRecordsList,null);
}

/**
 * 查询历史投注记录信息（通过改变彩种，时间等查询条件时刷新的结果）
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 */
function searchTeamAccount(startDateTime, endDateTime, type_teamAcct) {
    page=0;
    var params = '{"InterfaceName":"/api/v1/netweb/GetTeamAccountChanged","Source":'+type_teamAcct+',"ProjectPublic_PlatformCode":2,"ThisUserName":"","insertTimeMin":"' + startDateTime + '","IsHistory":' + IsHistory + ',"insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamAccount + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createteamAccountRecordsList,null);
}
/**
 * 日期改变事件
 * [dateChange_teamAccount description]
 * @return {[type_teamAccount]} [description]
 */
function dateChange_teamAccount() {
    var timeType = $("#searchDate_teamAccount").val();
    type_teamAccount = $("#searchType_teamAccount").val();
    switch(timeType) {
        case "0":
            //当前记录
            $("#selectDateTA_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateTA_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateTA_Stt").val()+hms00;
            endDateTime = $("#selectDateTA_End").val()+hms59;
            IsHistory = false;
            searchTeamAccount(startDateTime, endDateTime,type_teamAccount);
            changeDateRange_TA(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateTA_Stt").val(initDefaultDate(-4,'day'));  //view
            $("#selectDateTA_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDateTA_Stt").val()+hms00;
            endDateTime = $("#selectDateTA_End").val()+hms59;
            IsHistory = true;
            searchTeamAccount(startDateTime, endDateTime,type_teamAccount);
            changeDateRange_TA(-33,"day",-4,"day");     //Controller
            break;
    }
}

/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_TA(minNum,minType,maxNum,maxType){
    selDateTAStart.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selDateTAEnd.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}


//根据用户名模糊查找
function queryteamAccountUserName(searchUser){
    page = 0;
    type_teamAccount = $("#searchType_teamAccount").val();
    var params = '{"InterfaceName":"/api/v1/netweb/GetTeamAccountChanged","Source":'+type_teamAccount+',"ProjectPublic_PlatformCode":2,"ThisUserName":"' + searchUser + '","insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","IsHistory":' + IsHistory + ',"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_teamAccount + '}';
    ajaxUtil.ajaxByAsyncPost1(null, params, createteamAccountRecordsList,null);
}

/**
 * 通过查询条件加载数据
 */
function loadBySearchItemsTeamAccount() {
    var conditionsTeamAccount = getSearchTerm();
    if (null != conditionsTeamAccount) {
        if(unloadAtBettingDetail == true){
            initTeamAccountRecordsPage();
        }else{
            var dataOptions = document.getElementById('searchDate_teamAccount').options;
            for (var i = 0; i < dataOptions.length; i++) {
                dataOptions[i].selected = false;
                if (dataOptions[i].value == conditionsTeamAccount.time) {
                    dataOptions[i].selected = true;
                }
            }
            var typeOptions = document.getElementById('searchType_teamAccount').options;
            for (var i = 0; i < typeOptions.length; i++) {
                typeOptions[i].selected = false;
                if (typeOptions[i].value == conditionsTeamAccount.type) {
                    typeOptions[i].selected = true;
                }
            }
            type_teamAccount = conditionsTeamAccount.type;
            startDateTime = conditionsTeamAccount.dateStt + hms00;
            endDateTime = conditionsTeamAccount.dateEnd + hms59;
            $("#selectDateTA_Stt").val(conditionsTeamAccount.dateStt);
            $("#selectDateTA_End").val(conditionsTeamAccount.dateEnd);
            // 时间选择器
            var dateChange = conditionsTeamAccount.time;
            switch (dateChange){
                case "0":
                    IsHistory=false;
                    localStorageUtils.setParam("IsHistory",IsHistory);
                    changeDateRange_TA(-3,"day",0,"day");   //Controller
                    break;
                case "1":
                    IsHistory=true;
                    localStorageUtils.setParam("IsHistory",IsHistory);
                    changeDateRange_TA(-33,"day",-4,"day");     //Controller
                    break;
            }
            //根据日期查询条件查询数据
            searchTeamAccount(startDateTime, endDateTime, type_teamAccount);
            //重置isDetail标记，表示从记录界面返回
            var searchconditionsTeamAccount = getSearchTerm();
            searchconditionsTeamAccount.isDetail =  false;
            saveSearchTerm(searchconditionsTeamAccount);
        }
    } else {
        initTeamAccountRecordsPage();
    }
}

function initTeamAccountRecordsPage() {
    IsHistory = false;
    localStorageUtils.setParam("IsHistory",IsHistory);
    $("#selectDateTA_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateTA_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = initDefaultDate(0,"day") + hms00;
    //查询结束时间
    endDateTime = initDefaultDate(0,"day") + hms59;
    type_teamAccount = 0;
    searchTeamAccount(startDateTime, endDateTime, type_teamAccount);
}
/**
 * 每个item点击时，触发该方法，保存当前的查询条件
 */
function onItemClickListener_teamAccount() {
    var searchconditionsTeamAccount = {};
    searchconditionsTeamAccount.time =  $("#searchDate_teamAccount").val();
    searchconditionsTeamAccount.type =  $("#searchType_teamAccount").val();
    searchconditionsTeamAccount.dateStt = $("#selectDateTA_Stt").val();
    searchconditionsTeamAccount.dateEnd = $("#selectDateTA_End").val();
    searchconditionsTeamAccount.isDetail =  true;
    saveSearchTerm(searchconditionsTeamAccount);
}
