/* 
* 出票
* @Author: Administrator
* @Date:   2015-01-20 15:50:08
*/

//总注数
var zhushu_mmc = 0;
//连续开奖次数
var continueNum=1;
//已经投注次数
var touzhuNum=1;
var lotteryId;
//确保付款同步，即付款按钮不能频繁点击
var syncPay_mmc = true;
//临时期号
var tempIssueNumber = "";
var newFactCNumber="";
//定时器
var continueTimer;
var stopBetTimer;
//中奖奖金
var awardMoneyAll=0;
//判断是否点击了停止开奖;0:未点击；1：点击；
var IsClickStop=0;
/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:20:09
 * @Description: 进入该页面时调用
 */
function mmccheckOutPageLoadedPanel(){
    catchErrorFun("mmccheckOutPage_init();");
    $("#mmcselectNum_list").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    $("#mmcselectNum_list").scroller().scrollToTop();
    $("#mmcselectNum_list").scroller().clearInfinite();

	//清空 LotteryUtil.js 中的开奖定时器
	if(typeof(periodTimer) != "undefined" && periodTimer ){
		clearInterval(periodTimer);
	}
	//清空定时器
	if(typeof(setIntervalMoney) != "undefined" && setIntervalMoney ){
		clearInterval(setIntervalMoney);
	}
}
/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:20:23
 * @Description: 离开本页面时调用
 */
function mmccheckOutPageUnloadedPanel(){
  $("#mmccheckOutPage_jixuan").css("display", "");
  continueNum=1;
  IsClickStop=0;
  touzhuNum=1;
  $("#continueLottery").val(1);
   //物理返回键或者正常退出
    if(continueTimer){
        clearTimeout(continueTimer);
    }
    if(stopBetTimer){
        clearTimeout(stopBetTimer);
    }
    removePopup_mmc();
}
/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:19:48
 * @Description: 入口
 */
function mmccheckOutPage_init(){
    continueNum=1;
    IsClickStop=0;
    mmccheckOutPage_payout();
    addListViewItem_mmc();
    var lotteryCate = LotteryInfo.getLotteryTypeByTag(currentTouzhuInfo.lotteryType);
    if(currentTouzhuInfo.sntuo == "3" || currentTouzhuInfo.sntuo == "1" || getplayid(LotteryInfo.getId(lotteryCate,currentTouzhuInfo.lotteryType),LotteryInfo.getMethodId(lotteryCate,currentTouzhuInfo.playMethodIndex))){
        $("#mmccheckOutPage_jixuan").css("display", "none");
    }

    var orderNum; //出票页面的订单数量。
    //机选按钮监听
    $("#mmccheckOutPage_jixuan").off('click');
    $("#mmccheckOutPage_jixuan").on('click', function(event) {
        orderNum = $("#listviewid_mmc li").size();
        if (orderNum >= 10){
            toastUtils.showToast("最多只可添加 10 单");
        }else{
            resetFukanFlag_mmc();
            mmccheckOut_jixuan();
        }
    });
    //更新手选按钮的href,/后参数判断返回猜中页面是普通还是胆拖
    $("#mmccheckOutPage_shouxuan").off('click');
    $("#mmccheckOutPage_shouxuan").on('click', function(event) {
        orderNum = $("#listviewid_mmc li").size();
        if (orderNum >= 10){
            toastUtils.showToast("最多只可添加 10 单");
        }else {
            //清空localStorageUtils存储的数据
            createInitPanel_Fun(currentTouzhuInfo.lotteryType+"Page",true);
            resetFukanFlag_mmc();
        }
    });

    //清空号码按钮监听
    $("#mmccheckOutPage_qingkong").off('click');
    $("#mmccheckOutPage_qingkong").on('click', function(event) {
        $("#listviewid_mmc").empty();
        localStorageUtils.removeParam("resultList_checkout");
        //总注数
        zhushu_mmc = 0;
        checkoutResult=[];
        IsClickStop=0;
        //确保付款同步，即付款按钮不能频繁点击
        syncPay_mmc = true;
        //临时期号
        tempIssueNumber = "";
        newFactCNumber="";
        //清空显示的注数和金额
        localStorageUtils.removeParam("zhushu_mmc");
        getCheckOutNotesAndMoney_mmc(0);
    });
    //返回,清空所有数据
    $("#mmccheckOutPage_back").off('click');
    $("#mmccheckOutPage_back").on('click',function(e){
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
                        createInitPanel_Fun(currentTouzhuInfo.lotteryType+"Page",true);
                        checkOut_clearData_mmc();
                    },
                cancelOnly:false
            });

    });
    lotteryId=LotteryInfo.getLotteryIdByTag(currentTouzhuInfo.lotteryType);
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-13 09:50:10
 * @Description: 清空记录
 */
function checkOut_clearData_mmc() {
    localStorageUtils.removeParam("resultList_checkout");
    currentTouzhuInfo=[];
    //总注数
    zhushu_mmc = 0;
    checkoutResult=[];
    awardMoneyAll = 0;
    IsClickStop=0;
    //确保付款同步，即付款按钮不能频繁点击
    syncPay_mmc = true;
    //临时期号
    tempIssueNumber = "";
    newFactCNumber="";
    localStorageUtils.removeParam("prizeNumMMC");
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:18:03
 * @Description: 付款按钮点击
 */
function mmccheckOutPage_payout() {
    $("#mmccheckOutPage_payout").off('click');
    $("#mmccheckOutPage_payout").on('click', function(event) {
        if(!syncPay_mmc){
            return;
        }
        syncPay_mmc=false;
        if($('#mmccheckOutPage_zhushu').text() == 0){
            toastUtils.showToast("至少选择一注",2000);
            $.ui.blockUI(.1);
            setTimeout(function () {
                $.unblockUI();
            }, 2000);
            return;
        }
        //提示
        $.ui.popup(
        {
            title:"提示：",
            message:'您选择了' + $('#mmccheckOutPage_zhushu').text() +'注,共' + $('#mmccheckOutPage_money').text() +'元，请确认',
            cancelText:"关闭",
            cancelCallback:
            function(){
                resetFukanFlag_mmc();
            },
            doneText:"确定",
            doneCallback:
            function(){
                fukuanPostmmc();
            },
            cancelOnly:false
        });
    });
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:21:00
 * @Description:  付款时的post请求
 */
function fukuanPostmmc(){
       //装载向服务器提交的数据
        var paramList = [];
           $.each(checkoutResult, function(index, objStr) {
                var checkoutParam = {
                    toString : function() {
                        return JSON.stringify(this);
                    }
                };
                var obj = objStr;
               var playMethod=LotteryInfo.getPlayMethodId(LotteryInfo.getLotteryTypeByTag(checkoutResult[index].lotteryType),checkoutResult[index].lotteryType,checkoutResult[index].playMethodIndex);
                checkoutParam.BetContent = tzContentToNum(LotteryInfo.getLotteryIdByTag(checkoutResult[index].lotteryType), playMethod ,obj.nums);
                checkoutParam.BetCount = obj.notes;
                checkoutParam.PlayCode = playMethod;
                checkoutParam.IssueNumber = newFactCNumber;
                checkoutParam.BetRebate = obj.rebates.split(",")[0];
                checkoutParam.BetMoney = obj.money;
                checkoutParam.BetMultiple = obj.multiple;
                if(obj.sntuo==1){
                   checkoutParam.BetMode = 1;
                }else if(obj.sntuo==2){
                   checkoutParam.BetMode = 16;
                }else if(obj.sntuo==3){
                   checkoutParam.BetMode = 8;
                }else{
                   checkoutParam.BetMode = 0;
                }
                paramList.push(checkoutParam);
            });

        if (1000 < paramList.length) {
            resetFukanFlag_mmc();
            toastUtils.showToast("您的订单不能超过1000条!");
            return;
        }

        if (paramList.length <= 0) {
            resetFukanFlag_mmc();
            toastUtils.showToast("您当前网速不给力，建议稍后重新操作!");
            return;
        }
     ajaxUtil.ajaxByAsyncPost1(null, '{"UserIDList":[0],"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', function(data) {
            if (data.Code == 200) {
            	if (data.Data.SystemState == 64) {
	            	var yue = data.Data.lotteryMoney;
	               	var totalMoney = $('#mmccheckOutPage_money').html();
	               	var result = bigNumberUtil.minus(yue, totalMoney);
	               	var zero = new BigNumber("0");
	               	if (result >= zero) {
	                   //向服务器提交投注的数据
	                   $("#mmccheckOutPage_zhushu").data("paramList", paramList);
	                   postParamsMmc(paramList,function(data){
	                       paySuccess(data);
	                   }, function() {
	                       resetFukanFlag_mmc();
	                   },parseInt(lotteryId, 10),parseInt(fandianshu, 10));
	               	} else {
	                   resetFukanFlag_mmc();
	                   toastUtils.showToast("余额不足！");
	               	}
	            } else if (-1 == data.state){
	                        loginAgain();
	            } else if(data.SystemState==-2){
	                  toastUtils.showToast("您的账号已在别处登录");
	                  loginAgain();
	            } else {
	                resetFukanFlag_mmc();
	                toastUtils.showToast("获取余额失败！");
	            }
            }
         },null);
}
/*
 * 点击付款后连续开奖
 * */
function paySuccess(data){

    if (null == data) {
        toastUtils.showToast("您当前网速不给力，建议稍后重新操作!");
        return;
    }
    if(true == data.BetComplete){
        var childrens = $("#listviewid_mmc").children();
        $.each(childrens, function(index, item) {
            $(item).remove();
        });

        if(continueNum == 1){
            prizeNumMsg('<div id="smallprize" style="height: 50px"><span class="redBallsmmc"></span><span class="redBallsmmc"></span><span class="redBallsmmc"></span><span class="redBallsmmc"></span><span class="redBallsmmc"></span></div><br><div id="zhongjiangjineId"></div>',1);
        } else{
            if(continueNum != 1 && touzhuNum==1){
                prizeNumMsg('<div id="smallprize" style="height: 50px"><span class="redBallsmmc"></span><span class="redBallsmmc"></span><span class="redBallsmmc"></span><span class="redBallsmmc"></span><span class="redBallsmmc"></span></div><br><div id="zhongjiangjineId"></div>',1);
            }
            if(continueNum != 1 && touzhuNum < continueNum){
                continueTimer = setTimeout(function(){
                    var paramList = $("#mmccheckOutPage_zhushu").data("paramList");
                    postParamsMmc(paramList,function(result){
                        paySuccess(result);
                    }, function() {
                        resetFukanFlag_mmc();
                    },parseInt(lotteryId, 10),parseInt(fandianshu, 10));
                },2700);
            }
        }

        var awardMoney=0;
        var isaward=false;
        for (var i=0; i < data.Betmod.length; i++) {
            awardMoney=data.Betmod[i].AwardMoney;
            if(data.Betmod[i].Isaward){
                isaward=true;
                awardMoneyAll=bigNumberUtil.add(awardMoney,awardMoneyAll);
            }
        }
        var prizeNum=data.Betmod[0].DrawResult;
        var divId="smallprize";
        localStorageUtils.setParam("prizeNumMMC",prizeNum);
        if(IsClickStop==0){
            sn_Lottery_choose("#smallprize", ".redBallsmmc", 10,divId,prizeNum,isaward,awardMoneyAll);
        }
    }else{
	    if(-1==data.mark){
		    toastUtils.showToast("您还没有完成与下级的分红契约，无法投注！");
	    }else if(data.mark == -100){
		    toastUtils.showToast("投注金额必须大于" + localStorageUtils.getParam("MinBetMoney") + "元");
	    }else if(data.mark == -101){
		    toastUtils.showToast("投注倍数不能大于"+ parseInt(localStorageUtils.getParam("MaxBetMultiple")));
	    }else if(data.mark == -102){
		    toastUtils.showToast("您的账号不允许投注");
	    }else{
		    toastUtils.showToast("开奖失败");
	    }
    }
}

/***********************************************/
/**
 * [sn_Lottery_choose description]
 * @param  {[type]} elem   [外层box]
 * @param  {[type]} numBox [滚动数字box]
 * @param  {[type]} count  [最大数字限制]
 * @return {[type]}        [function]
 */
function sn_Lottery_choose(elem, numBox, count,divId,prizeNum,Isaward,AwardMoney){
    var Num = $(elem);
    var arrBall = [];
    var interval, index, i = 0;
    for(var i = 0; i < count; i++){
        arrBall.push(i);
    }
    arrBall.sort(function(){return (Math.random()<0.5?1:-1)});
    function setNum(){
        Num.find(numBox).each(function(){
            index = arrBall[Math.floor(Math.random() * (count - 1))];
            $(this).text(index);
        });
        i++;

        if( i > count + 10){
            arrBall.sort(function(){return (Math.random()<0.5?1:-1)});
            for(var j = 0; j < Num.find(numBox).length; j++){
                Num.find(numBox).eq(j).val(arrBall[j]);
            }

            if(i==21) {
                if (touzhuNum == continueNum) {  //last one
                    if (AwardMoney != 0) {
                        displayPrizeNummmc(divId, prizeNum, '恭喜您中奖啦！奖金为：'+ AwardMoney +' 元'+'<br/>'+'5秒后返回投注页面...');
                        document.getElementById("alertMsg_btn2").style.display="none";
                        setTimeout(function(){backToCheckout();},5000);
                    } else {
                        displayPrizeNummmc(divId, prizeNum, '很遗憾未中奖，祝您下次好运！'+'<br/>'+'5秒后返回投注页面...');
                        document.getElementById("alertMsg_btn2").style.display="none";
                        setTimeout(function(){backToCheckout();},5000);
                    }
                    clearTimeout(continueTimer);
                }else{
                    if(Isaward){
                        AwardMoney = bigNumberUtil.add(AwardMoney,AwardMoney);
                    }
                    if(IsClickStop==0){
                        displayPrizeNummmc(divId, prizeNum, '第'+touzhuNum+'次开奖');
                        touzhuNum++;
                    }
                }
            }

            return;
        }
        stopBetTimer = setTimeout(arguments.callee,50);
    }
    setNum();
}

/**
 *显示开奖号码
 *@param  divId 开奖号码view所在的div的ID
 *@param  prizeNum 开奖号码,格式为"1,2,3"
 */
function displayPrizeNummmc(divId, prizeNum,mag) {
    var numList;
    if(prizeNum){
        numList = prizeNum.split(',');
    }else{
        numList ="";
    }
    var spanList = $("#" + divId).find('span');
    $.each(numList, function(index, item) {
        $(spanList[index]).html(item);
    });
    $("#zhongjiangjineId").html(mag)
}

/**
 *点击“付款”按钮时，如果提交数据异常中断，则需重置某些数据
 */
function resetFukanFlag_mmc() {
    //表示用户可以点击“付款”按钮
    syncPay_mmc = true;
}


/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:17:27
 * @Description: 动态创建投注列表item
 */
function addListViewItem_mmc() {
    $("#listviewid_mmc").empty();
    zhushu_mmc=0;
    var zongjine_mmc = 0;
    $.each(checkoutResult, function(k, v){
        if(!isNullObj(v)){
            if(v.playMethod == v.playType){
                zongjine_mmc = bigNumberUtil.add(zongjine_mmc,v.money).toString();
                getItemLimmc(v.nums, v.playMethod, v.notes, k,v.multiple, v.rebates, v.playMode,v.money);
            }else{
                zongjine_mmc = bigNumberUtil.add(zongjine_mmc,v.money).toString();
                getItemLimmc(v.nums, v.playType+"_"+v.playMethod, v.notes, k,v.multiple, v.rebates, v.playMode,v.money);
            }
        }
    });
    getCheckOutNotesAndMoney_mmc(bigNumberUtil.multiply($("#continueLottery").val(),zongjine_mmc).toString());
    //获取彩种标题
    $("#ticcket_name").html(LotteryInfo.getLotteryNameByTag(currentTouzhuInfo.lotteryType));
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:16:06
 * @Description: 机选
 */
function mmccheckOut_jixuan(){
    var lotteryCate = LotteryInfo.getLotteryTypeByTag(currentTouzhuInfo.lotteryType);
    if(currentTouzhuInfo.sntuo == "3" || currentTouzhuInfo.sntuo == "1" || getplayid(LotteryInfo.getId(lotteryCate,currentTouzhuInfo.lotteryType),LotteryInfo.getMethodId(lotteryCate,currentTouzhuInfo.playMethodIndex))){
        toastUtils.showToast("不能机选，请手选号码！",2000);
        $.ui.blockUI(.1);
        setTimeout(function () {
            $.unblockUI();
        }, 2000);
    }else {
        var conId = getLotteryConid();
        var randomObject = clickForRandom(eval(currentTouzhuInfo.lotteryType + '_checkOutRandom'),[currentTouzhuInfo.playTypeIndex,currentTouzhuInfo.playMethodIndex]);
        var submitParams = new LotterySubmitParams();
            submitParams.lotteryType = currentTouzhuInfo.lotteryType;
            submitParams.playType = currentTouzhuInfo.playType;
            submitParams.playMethod =  currentTouzhuInfo.playMethod ;
            submitParams.playTypeIndex = currentTouzhuInfo.playTypeIndex ;
            submitParams.playMethodIndex = currentTouzhuInfo.playMethodIndex ;
            submitParams.nums = randomObject.nums;
            submitParams.notes = randomObject.notes;
            submitParams.sntuo = randomObject.sntuo;
            submitParams.multiple = randomObject.multiple;
            submitParams.rebates = randomObject.rebates;
            submitParams.playMode = randomObject.playMode;
            submitParams.money = randomObject.money;
            checkoutResult.splice(0, 0, submitParams);
            refreshLocalResultList_mmc(checkoutResult);
            addListViewItem_mmc();
    }
}

/**
 *刷新本地存储的选号信息记录
 */
function refreshLocalResultList_mmc(list) {
    var temp = [];
    $.each(list, function(index, item) {
        temp.push(JSON.stringify(item));
    });
    localStorageUtils.setParam("resultList_checkout", temp.join(SEPARATOR));
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-13 09:29:24
 * @Description:  计算组数和金额
 */
 function getCheckOutNotesAndMoney_mmc(zongjine_mmc){
    if(zhushu_mmc == null){
        $("#mmccheckOutPage_zhushu").html(0);
    }else{
        $("#mmccheckOutPage_zhushu").html(zhushu_mmc);
    }
    $("#mmccheckOutPage_money").html(parseFloat(zongjine_mmc));
    $("#mmccheckOut_lottery_money").html(localStorageUtils.getParam("lotteryMoney"));
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-13 11:37:23
 * @Description: 随机创建删除按钮id
 */
function getConID(){
    return "conID" + parseInt(Math.random() * 1000000);
}

 /**
  * @Author:      muchen
  * @DateTime:    2014-12-13 11:36:40
  * @Description: 创建投注信息的每一个item
  */
 function getItemLimmc(nums, playName, notes, conId, multiple, playRebates, playMode, money, zongjine){
     var temp = zongjine;
     var $itemLi = $('<li class="delNumF" style="background: #fff;padding-top: 0px;padding-bottom: 2px;padding-right: 1px;padding-left: 1px;"><div class="delNum"><p style="color: #FE5D39;font-size: 16px;width: 88%;font-weight: bold;overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+ nums +'</p><p  style="color: #9B9A9A;"><span >'+ playName +'</span>&nbsp;&nbsp;<span data-inline="true">'+ notes +'</span>注&nbsp;&nbsp;<span>'+multiple+'</span>倍<br />返点<span>['+playRebates+']</span>&nbsp;&nbsp;<span>'+getPlayMode(playMode)+'</span>&nbsp;&nbsp;<span>'+money+'</span>元</p></div></li>');
     var $itemLi_a = $('<div onclick="del_mm(' + conId + ')" id="' + conId + '"  style="position: absolute;left:80%;top:10%;width:50px;height:50px;text-align:center;padding-top:10px;"><img src="images/del.png"  style="width:24px; height:24px;"/></div>');
     $itemLi.append($itemLi_a);
     $("#listviewid_mmc").append($itemLi);
     zhushu_mmc += parseInt(notes);
 }
//动态删除LI
function del_mm(liId) {
    checkoutResult.splice(liId, 1);
    //动态创建投注列表view
    addListViewItem_mmc();
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
 *切换连续开奖次数
 */
function getContinueNum(){
    continueNum = parseInt($("#continueLottery").val());
    var zongjine_mmc = 0;
    $.each(checkoutResult, function(k, v){
        if(!isNullObj(v)){
            zongjine_mmc = bigNumberUtil.add(zongjine_mmc,v.money).toString();
        }
    });
    getCheckOutNotesAndMoney_mmc(bigNumberUtil.multiply(zongjine_mmc,$("#continueLottery").val()).toString());
}

//弹出开奖信息
function prizeNumMsg(msg, mode) { //mode为空或0，只有一个确认按钮，mode为1时只有取消按钮
    msg = msg || '';
    mode = mode || 0;
    var top = document.body.scrollTop || document.documentElement.scrollTop;
    var isIe = (document.all) ? true : false;
    var isIE6 = isIe && !window.XMLHttpRequest;
    var sTop = document.documentElement.scrollTop || document.body.scrollTop;
    var sLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    var winSize = function(){
        var xScroll, yScroll, windowWidth, windowHeight, pageWidth, pageHeight;
        // innerHeight获取的是可视窗口的高度，IE不支持此属性
        if (window.innerHeight && window.scrollMaxY) {
            xScroll = document.body.scrollWidth;
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }

        if (self.innerHeight) {    // all except Explorer
            windowWidth = self.innerWidth;
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }

        // for small pages with total height less then height of the viewport
        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }

        // for small pages with total width less then width of the viewport
        if (xScroll < windowWidth) {
            pageWidth = windowWidth;
        } else {
            pageWidth = xScroll;
        }

        return{
            'pageWidth':pageWidth,
            'pageHeight':pageHeight,
            'windowWidth':windowWidth,
            'windowHeight':windowHeight
        }
    }();
    //alert(winSize.pageWidth);
    //遮罩层
    var styleStr = 'top:0;left:0;position:absolute;z-index:10000;background:#666;width:' + winSize.pageWidth + 'px;height:' +  (winSize.pageHeight + 30) + 'px;';
    styleStr += (isIe) ? "filter:alpha(opacity=80);" : "opacity:0.8;"; //遮罩层DIV
    var shadowDiv = document.createElement('div'); //添加阴影DIV
    shadowDiv.style.cssText = styleStr; //添加样式
    shadowDiv.id = "shadowDiv";
    //如果是IE6则创建IFRAME遮罩SELECT
    if (isIE6) {
        var maskIframe = document.createElement('iframe');
        maskIframe.style.cssText = 'width:' + winSize.pageWidth + 'px;height:' + (winSize.pageHeight + 30) + 'px;position:absolute;visibility:inherit;z-index:-1;filter:alpha(opacity=0);';
        maskIframe.frameborder = 0;
        maskIframe.src = "about:blank";
        shadowDiv.appendChild(maskIframe);
    }
    document.body.insertBefore(shadowDiv, document.body.firstChild); //遮罩层加入文档
    //弹出框
    var styleStr1 = 'display:block;position:fixed;_position:absolute;left:' + (winSize.windowWidth / 2 - 140) + 'px;top:' + (winSize.windowHeight / 2 - 50) + 'px;_top:' + (winSize.windowHeight / 2 + top - 150)+ 'px;'; //弹出框的位置
    var alertBox = document.createElement('div');
    alertBox.id = 'alertMsg';
    alertBox.style.cssText = styleStr1;
    //创建弹出框里面的内容P标签
    var alertMsg_info = document.createElement('P');
    alertMsg_info.id = 'alertMsg_info';
    alertMsg_info.innerHTML = msg;
    alertBox.appendChild(alertMsg_info);
    //创建按钮
    if(mode==0){
        var btn1 = document.createElement('a');
        btn1.id = 'alertMsg_btn1';
        btn1.href = 'javas' + 'cript:void(0)';
        btn1.innerHTML = '<cite>OK</cite>';
        btn1.onclick = function () {
            document.body.removeChild(alertBox);
            document.body.removeChild(shadowDiv);
            //保存余额
            ajaxUtil.ajaxByAsyncPost(null, '{"UserIDList":[0],"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', function(data) {
                if (data.Code == 200) {
                    var yue = data.Data.lotteryMoney;
                    localStorageUtils.setParam("lotteryMoney",yue);
                }
            });
            //返回相应的彩种界面
            createInitPanel_Fun(currentTouzhuInfo.lotteryType+"Page",true);
            //清除数据
            checkOut_clearData_mmc();
            return true;
        };
        alertBox.appendChild(btn1);
    }

    if (mode === 1) {
        var btn2 = document.createElement('a');
        btn2.id = 'alertMsg_btn2';
        btn2.href = 'javas' + 'cript:void(0)';
        btn2.innerHTML = '<cite>停止开奖</cite>';
        btn2.onclick = function () {
            IsClickStop=1;
            btn2.style.display="none";
            var prizeNumMMC=localStorageUtils.getParam("prizeNumMMC");
            clearTimeout(stopBetTimer);
            if (awardMoneyAll) {
                displayPrizeNummmc("smallprize", prizeNumMMC, '恭喜您中奖啦！奖金为：' + awardMoneyAll + '元.'+'<br/>'+'5秒后返回投注页面...');
            } else {
                displayPrizeNummmc("smallprize", prizeNumMMC, '很遗憾未中奖，祝您下次好运！'+'<br/>'+'5秒后返回投注页面...');
            }
            clearTimeout(continueTimer);
            //保存余额
            ajaxUtil.ajaxByAsyncPost(null, '{"UserIDList":[0],"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', function(data) {
                if (data.Code == 200) {
                    var yue = data.Data.lotteryMoney;
                    localStorageUtils.setParam("lotteryMoney",yue);
                }
            });

            setTimeout(function(){
                document.body.removeChild(alertBox);
                document.body.removeChild(shadowDiv);
                //返回相应的彩种界面
                createInitPanel_Fun(currentTouzhuInfo.lotteryType+"Page",true);
                //清除数据
                checkOut_clearData_mmc();
            },5000);
        };
        alertBox.appendChild(btn2);
    }
    document.body.appendChild(alertBox);
}

/*
 * 开奖完成后，自动返回出票页面时，保存余额，清除数据
 * */
function backToCheckout(){
    //保存余额
    ajaxUtil.ajaxByAsyncPost(null, '{"UserIDList":[0],"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}', function(data) {
        if (data.Code == 200) {
            var yue = data.Data.lotteryMoney;
            localStorageUtils.setParam("lotteryMoney",yue);
        }
    });

    //返回相应的彩种界面
    createInitPanel_Fun(currentTouzhuInfo.lotteryType+"Page",true);
    //清除数据
    checkOut_clearData_mmc();
}
/*
* 删除弹窗与遮罩层
* */
function removePopup_mmc() {
    var alertMsg=document.getElementById("alertMsg");
    var shadowDiv=document.getElementById("shadowDiv");
    if(alertMsg){
        removeElement(alertMsg);
    }
   if(shadowDiv){
       removeElement(shadowDiv);
   }
}
function removeElement(_element){
    var _parentElement = _element.parentNode;
    if(_parentElement){
        _parentElement.removeChild(_element);
    }
}
