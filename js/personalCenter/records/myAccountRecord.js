//页大小
var PAGESIZE_myAccoun = 20;
//查询开始时间
var startDateTime = "";
//查询结束时间
var endDateTime = "";
//用户名
var userName = "";
//收支类型
var type = 0;
//IsHistory 默认false  是否是历史记录
var IsHistory=false;
var selectDateEE;
var selectDateEF;

/*进入panel时调用*/
function myAccountRecordLoadedPanel(){
	catchErrorFun("myAccountRecordInit();");
}
/*离开panel时调用*/
function myAccountRecordUnloadedPanel(){
	$("#myAccountRecordList").empty();
    //查询开始时间
      startDateTime = "";
    //查询结束时间
      endDateTime = "";
    //收支类型
      type = 0;
    //IsHistory 默认false  是否是历史记录
      IsHistory=false;
	//清除本地存储的查询条件
	 clearSearchTerm();
    if(selectDateEE){
        selectDateEE.dismiss();
    }
    if(selectDateEF){
        selectDateEF.dismiss();
    }
}
function myAccountRecordInit(){
    $("#selectType_account").empty();
    $("#selectAccountID").empty();

    var $selectType_account=$('<select name="myAccountRecordsearchType" id="myAccountRecordsearchType" data-theme="a" data-mini="true" onchange="typeChangeAccount()">' +
	    '<option value="0" selected="selected">全部</option>' +
	    '<option value="18">充值</option>' +
	    '<option value="26">提款</option>' +
	    '<option value="3">转账</option>' +
	    '<option value="1">投注</option>' +
	    '<option value="2">中奖</option>' +
	    '<option value="4">撤单</option>' +
	    '<option value="5">撤奖</option>' +
	    '<option value="6">活动</option>' +
	    '<option value="7">下级返点</option>' +
	    '<option value="8">自身投注返点</option>' +
	    '<option value="9">给下级充值</option>' +
	    '<option value="10">来自上级的充值</option>' +
	    '<option value="33">提款手续费</option>' +
	    '<option value="34">充值手续费</option>' +
	    '<option value="11">管理员添加</option></select>');

    if (localStorageUtils.getParam("IsDayWages") == "true"){
        $selectType_account.append('<option value="29">日结</option>');
    }
    if (localStorageUtils.getParam("IsContract") == "true"){
        $selectType_account.append('<option value="28">分红</option>');
    }
	//红包动态显示
	var sendRedPak_show = jsonUtils.toObject(localStorageUtils.getParam("sendRedPak_show")),
		isOpen = Number(sendRedPak_show.isOpen);  // 0 or 1
	if(isOpen){
		$selectType_account.append('<option value="31">红包雨</option>');
	}
    $("#selectType_account").append($selectType_account);

    var $select=$('<table><tr><td><select name="myAccountRecordsearchDate" id="myAccountRecordsearchDate" data-theme="a" data-mini="true" onchange="dateChangeAccount()"><option value="0" selected="selected">当前记录</option><option value="1">历史记录</option></select></td><td><input type="text" id="selectDateAccount_Stt" readonly/></td><td><input type="text" id="selectDateAccount_End" readonly/></td></tr></table>');
    $("#selectAccountID").append($select);

    selectDateEE = new MobileSelectDate();
    selectDateEE.init({trigger:'#selectDateAccount_Stt',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});
    selectDateEF = new MobileSelectDate();
    selectDateEF.init({trigger:'#selectDateAccount_End',min:initDefaultDate(-3,"day"),max:initDefaultDate(0,"day")});

	userName = localStorageUtils.getParam("username");  //我的账号名称
	page = 0;
	hasMorePage = true;//默认还有分页
    var _myScroller =  $("#myAccountRecordScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
	_myScroller.clearInfinite();
    addUseScroller(_myScroller,'myAccountRecordList','getAccountRecord()');
    //进入时加载
    loadBySearchItemsAccount();
}

function getAccountRecord(){
    startDateTime = $("#selectDateAccount_Stt").val()+hms00;
    endDateTime = $("#selectDateAccount_End").val()+hms59;
    searchAccount_acc(startDateTime, endDateTime, type);
}

/**
 * Description 查询账户历史记录回调函数
 * @param
 * @return data 服务端返数据
 */
function searchSuccessCallBackmyAccount(data) {
	$("#myAccountRecord_noData_tips").hide();
    if (page == 0) {
        $("#myAccountRecordList").empty();
        $("#myAccountRecordScroller").scroller().scrollToTop();
        $("#myAccountRecordScroller").scroller().clearInfinite();
    }
    
    if(data.Code == 200){
	    if(data.Data ==null){
	   		$("#myAccountRecord_noData_tips").show();
	  		//toastUtils.showToast("没有数据");
	    	return;
	    }
	    if (data.Data.DataCount!=0) {
	    	var info=data.Data.UfInfo;
	        isHasMorePage(info,PAGESIZE_myAccoun);
	        for (var i = 0; i < info.length; i++) {
	        	var text = "";
	            var dataSet = new Object();
                dataSet.orderId = info[i].OrderID;
                //金额
                //dataSet.ufmoney = bigNumberUtil.getBalanceRealMoney(info[i].UseMoney,4);
                if(info[i].UseMoney == 0 && info[i].DetailsSource == 257){    //转盘活动未中奖时
                    dataSet.ufmoney =info[i].Marks;
                    //dataSet.ufmoney =info[i].UseMoney+"元"; //显示金额
                    // dataSet.ufmoney = "再接再厉";  //显示提示语
                }else{
                    dataSet.ufmoney =info[i].UseMoney+"元";
                }
                dataSet.ufmoney_ = info[i].UseMoney;
                dataSet.DetailsSource = info[i].DetailsSource;
               // dataSet.ufmoney =info[i].UseMoney;// changeTwoDecimal_f(info[i].UseMoney);
                //交易时间
                dataSet.optime = info[i].InsertTime;
                //手续费
                dataSet.FeeMoney =info[i].FeeMoney;// changeTwoDecimal_f(info[i].poundage);
                //用户余额
                dataSet.cbalaces = info[i].ThenBalance;//changeTwoDecimal_f(info[i].ThenBalance);
                //属性:投注、派奖
                // dataSet.ufproperty = info[i].DetailsSource;
                // dataSet.cztype = info[i].DetailsSource;
                //类型
                dataSet.tranType = getShouZhiByID(info[i].DetailsSource,info[i].RechargeType,info[i].PayTypeName);
                //备注
                dataSet.details = remarkZH(info[i].Marks+"", info[i].DetailsSource, userName);
                 //彩种id
                dataSet.lotteryType = info[i].Marks;
                
				var $itemLi = $('<li></li>').data('account',dataSet);
				$itemLi.on('click',function() {
					onItemClickListener_Account();				
					localStorageUtils.setParam("account",JSON.stringify($(this).data('account')));
					setPanelBackPage_Fun('accountDetails');
				});
//				$itemLi.append('<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>');
				$itemLi.append(myAccountRecord_selectRecordsIco(type,info[i].DetailsSource,dataSet,info[i].RechargeType));
	
				$("#myAccountRecordList").append($itemLi);
	      	}
	    }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}


function myAccountRecord_selectRecordsIco(type,DetailsSource,dataSet,RechargeType){
	var str;
    switch(Number(type)) {
    	case 0:  //全部
    		switch(DetailsSource) {
		        case 1: //投注
		        case 20 : //出票
//		            return "投注";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/tou_ico.png"></dl></a>';
		            break;
		        case 10://撤单
		        case 11://撤单
		        case 12://撤单
		        case 13://撤单
//		            return "撤";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/che_ico.png"></dl></a>';
		            break;
		        case 60: //撤奖 
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/che_ico.png"></dl></a>';
		            break;
		        case 17: //活动加款
		        case 153: //活动加款
//		            return "优惠活动";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
		            break;
		        case 30: //自身投注返点
		        case 40: //下级返点
//		            return "返";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/fan_ico.png"></dl></a>';
		            break;
		        case 50:
//		            return "中奖";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/jiang_ico.png"></dl></a>';
		            break;
		        case 70: //提款
		        case 100://提款审批同意--后台人工出款
		        case 110://提款审批同意--自动出款
		        case 120://人工出款
		        case 121://提款成功--刷新
		        case 122://人工提款
//		            return "提款";
					return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico.png"></dl></a>';
		            break;
	         	case 90: //提款  提款拒绝，返还账户
	         		return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico_refuse.png"></dl></a>';
		            break;
		        case 80://申请提款失败
		        case 130://提款失败
		        case 131://提款失败--刷新1
		            return "提款失败";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico_refuse.png"></dl></a>';
		            break;
		        case 140://申请充值
		        case 151://其他加款
		        case 152://人工存款
		        case 200://来自上级的充值
//		            return "充值";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            break;
		        case 190:
//		            return "给下级充值";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            break;
		        case 160:
//		            return "充值失败";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico_refuse.png"></dl></a>';
		            break;
		        case 150:
		            if(RechargeType==0){
//		                temp="网银充值";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            }else if(RechargeType==1){
//		                temp="在线转账";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            }else if(RechargeType==2){
//		                temp="其他";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            }else if(RechargeType==3){
//		                temp="人工存款";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
		            }else if(RechargeType==4){
//		                temp="活动";
		                return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
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
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico.png"></dl></a>';
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
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
		            break;
		        case 264://发给下级的日结
		        case 266://人工扣除日结
//		            return temp="日结";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/rigongzi_ico.png"></dl></a>';
		            break;
		        case 261://按比例发放日结
		        case 262://按阶梯发放日结
		        case 263://来自上级的日结
		        case 265://人工添加日结
		        case 301:
		        case 302://日结
		        case 411://新日结
//		            return temp="日结";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/rigongzi_ico.png"></dl></a>';
		            break;
		        case 210:
		        case 267:
		        case 268:
		        case 269:
//		            return temp="分红";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/fenhong_ico.png"></dl></a>';
		            break;
		        case 303://其他扣款
		        case 304://活动扣款
//		            return temp="活动扣款";
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
		            break;
			    case 412:
			   	 	//return temp="红包雨";
			    	return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hong_ico.png"></dl></a>';
					break;
				case 422:
//				    return temp="充值手续费";
				    return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
				    break;
				case 423:
//					return temp="提款手续费";//提款成功
				    return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
				    break;
				case 424:
//				    return temp="提款手续费";//提款拒绝 返还手续费
				    return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
				    break;
		        default:
		            break;
		    }
		case 18:  //充值
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
            break;
        case 9:  //给下级充值
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
            break;
        case 10:  //来自上级的充值
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/chong_ico.png"></dl></a>';
            break;
        case 34:  //充值手续费
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
            break;
        case 11:  //管理员添加
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/guan_ico.png"></dl></a>';
            break;
        case 26:  //提款
        	switch(DetailsSource) {
		        case 70 : //提款成功
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico.png"></dl></a>';
		            break;
		        case 90 : //提款  提款拒绝，返还账户
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/ti_ico_refuse.png"></dl></a>';
		            break;
            }
        case 33:  //提款手续费
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/shou_ico.png"></dl></a>';
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
		            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/zhuan_ico.png"></dl></a>';
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
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/tou_ico.png"></dl></a>';
            break;
        case 2:  //中奖
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/jiang_ico.png"></dl></a>';
            break;
        case 4:   //撤单
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/che_ico.png"></dl></a>';
            break;
        case 5: //撤奖 
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:red">-' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/che_ico.png"></dl></a>';
            break;
        case 6:  //活动
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hui_ico.png"></dl></a>';
            break;
        case 7:   //下级返点
        case 8:  //自身投注返点
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/fan_ico.png"></dl></a>';
            break;
        case 28:  //分红
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/fenhong_ico.png"></dl></a>';
            break;
        case 29:  //日工资
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/rigongzi_ico.png"></dl></a>';
            break;
        case 31:  //红包
            return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd><img style="width:35px;height:35px;margin: 15px 0 0 60px;" src="././images/record_ico/hong_ico.png"></dl></a>';
            break;
        default:
        	return '<a class="recordList"><dl class="orderList"><dd>类型:&nbsp;'+dataSet.tranType+'</dd><dd>金额:&nbsp;<span style="color:#4bdc03">' + dataSet.ufmoney +'</span></dd><dd>时间:&nbsp;' + dataSet.optime +'</dd></dl></a>';
        	break;
    }
}

/**
 * 查询账户信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param type 查询收支类型
 */
function searchAccount(startDateTime, endDateTime, type) {
	if(!type)type=0;
    page=0;
    var paramssearch = '{"InterfaceName":"/api/v1/netweb/DailyWagesGetUserFundList","ProjectPublic_PlatformCode":2,"IsHistory":' + IsHistory + ',"Source":' + type + ',"insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myAccoun + '}';
    ajaxUtil.ajaxByAsyncPost1(null, paramssearch, searchSuccessCallBackmyAccount,null);    
}
/**
 * 查询账户信息
 * @param startDateTime 查询开始时间
 * @param endDateTime 查询结束时间
 * @param type 查询收支类型
 */
function searchAccount_acc(startDateTime, endDateTime, type) {
	if(!type)type=0;
    var paramssearch = '{"InterfaceName":"/api/v1/netweb/DailyWagesGetUserFundList","ProjectPublic_PlatformCode":2,"IsHistory":' + IsHistory + ',"Source":' + type + ',"insertTimeMin":"' + startDateTime + '","insertTimeMax":"' + endDateTime + '","CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_myAccoun + '}';
    ajaxUtil.ajaxByAsyncPost1(null, paramssearch, searchSuccessCallBackmyAccount,null);    
}
//日期改变事件
function dateChangeAccount() {
    var selectedIndex = $("#myAccountRecordsearchDate").val();
    switch(selectedIndex) {
        case "0":
            //当前记录
            $("#selectDateAccount_Stt").val(initDefaultDate(0,'day'));  //View
            $("#selectDateAccount_End").val(initDefaultDate(0,'day'));
            startDateTime = $("#selectDateAccount_Stt").val()+hms00;
            endDateTime = $("#selectDateAccount_End").val()+hms59;
            type = $("#myAccountRecordsearchType").val();
            IsHistory=false;
            localStorageUtils.setParam("IsHistory",IsHistory);
            searchAccount(startDateTime, endDateTime, type);
            changeDateRange_account(-3,"day",0,"day");   //Controller
            break;
        case "1":
            //历史记录
            $("#selectDateAccount_Stt").val(initDefaultDate(-4,'day'));  //View
            $("#selectDateAccount_End").val(initDefaultDate(-4,'day'));
            startDateTime = $("#selectDateAccount_Stt").val()+hms00;
            endDateTime = $("#selectDateAccount_End").val()+hms59;
            type = $("#myAccountRecordsearchType").val();
            IsHistory=true;
            localStorageUtils.setParam("IsHistory",IsHistory);
            searchAccount(startDateTime, endDateTime, type);
            changeDateRange_account(-33,"day",-4,"day");   //Controller
            break;
    }
}
/*
 *   切换当前记录或者历史记录时。
 **/
function changeDateRange_account(minNum,minType,maxNum,maxType){
    selectDateEE.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
    selectDateEF.setMinAndMax(initDefaultDate(minNum,minType),initDefaultDate(maxNum,maxType));
}

//玩法类型改变事件
function typeChangeAccount() {
    type = $("#myAccountRecordsearchType").val();
    startDateTime = $("#selectDateAccount_Stt").val()+hms00;
    endDateTime = $("#selectDateAccount_End").val()+hms59;
    searchAccount(startDateTime, endDateTime, type);
}              
/**
 * 通过查询条件加载数据 
 */
function loadBySearchItemsAccount() {
	var conditionsAccount = getSearchTerm();
	if (null != conditionsAccount) {
	    if(unloadAtBettingDetail == true){
	        initAccountRecordsPage();
        }else{
		var dataOptions = document.getElementById('myAccountRecordsearchDate').options;
		for (var i = 0; i < dataOptions.length; i++) {
			dataOptions[i].selected = false;
			if (dataOptions[i].value == conditionsAccount.time) {
				dataOptions[i].selected = true;
			}
		}
		var typeOptions = document.getElementById('myAccountRecordsearchType').options;
		for (var i = 0; i < typeOptions.length; i++) {
			typeOptions[i].selected = false;
			if (typeOptions[i].value == conditionsAccount.type) {
				typeOptions[i].selected = true;
			}
		}
        type = conditionsAccount.type;
		if(!conditionsAccount.type)type = 0;
        startDateTime = conditionsAccount.dateStt+hms00;
        endDateTime = conditionsAccount.dateEnd+hms59;
        $("#selectDateAccount_Stt").val(conditionsAccount.dateStt);
        $("#selectDateAccount_End").val(conditionsAccount.dateEnd);
        // 时间选择器
        var dateChange = conditionsAccount.time;
        switch (dateChange){
            case "0":
                IsHistory=false;
                localStorageUtils.setParam("IsHistory",IsHistory);
                changeDateRange_account(-3,"day",0,"day");   //Controller
                break;
            case "1":
                IsHistory=true;
                localStorageUtils.setParam("IsHistory",IsHistory);
                changeDateRange_account(-33,"day",-4,"day");   //Controller
                break;
        }
        //根据日期查询条件查询数据
        searchAccount(startDateTime, endDateTime, type);
		//重置isDetail标记，表示从记录界面返回
		var searchconditionsAccount = getSearchTerm();
    	searchconditionsAccount.isDetail =  false;
    	saveSearchTerm(searchconditionsAccount);
        }
	} else {
        initAccountRecordsPage();
	}
}
function initAccountRecordsPage() {
    IsHistory=false;
    localStorageUtils.setParam("IsHistory",IsHistory);
    $("#selectDateAccount_Stt").val(initDefaultDate(0,"day"));
    $("#selectDateAccount_End").val(initDefaultDate(0,"day"));
    //查询开始时间
    startDateTime = $("#selectDateAccount_Stt").val()+hms00;
    //查询结束时间
    endDateTime = $("#selectDateAccount_End").val()+hms59;
    type = 0;
    searchAccount(startDateTime, endDateTime, type);
}
/**
 * 每个item点击时，触发该方法，保存当前的查询条件 
 */
function onItemClickListener_Account() {
	var searchconditionsAccount = {};
	searchconditionsAccount.time =  $("#myAccountRecordsearchDate").val();
	searchconditionsAccount.type =  $("#myAccountRecordsearchType").val();
    searchconditionsAccount.dateStt = $("#selectDateAccount_Stt").val();
    searchconditionsAccount.dateEnd = $("#selectDateAccount_End").val();
	searchconditionsAccount.isDetail =  true;
	saveSearchTerm(searchconditionsAccount);
}