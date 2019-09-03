var accessToken = window.location.hash.substring(1);//获取路径中的access token
var setIntervalMoney;

//官方彩  信用彩  棋牌
var PlayTypeID;

 /**
 *加载数据
 */
function lotteryHallLoadedPanel() {
	//清空 LotteryUtil.js 中的开奖定时器
	 if(typeof(periodTimer) != "undefined" && periodTimer ){
		 clearInterval(periodTimer);
	 }
	 //清空定时器
	 if(typeof(setIntervalMoney) != "undefined" && setIntervalMoney ){
		 clearInterval(setIntervalMoney);
	 }
    getGongGao3();
    lunbo();
    
    
    //查询 第三方
    var IsTestAccount = localStorageUtils.getParam("IsTestAccount");
	if(IsTestAccount == 0){  //正式账号
		 GetThirdPartyInfo();
	}
    
//  //官方彩   默认大厅显示
//  $("#game_type_credit").removeClass('gametype_selected');    // 删除其他li的边框样式
//  $("#game_type_card").removeClass('gametype_selected');    // 删除其他li的边框样式
//	$("#game_type_lottery").addClass('gametype_selected');
//  init();


	//官方 信用 棋牌
	if(localStorageUtils.getParam("PlayTypeID") == "undefined" || localStorageUtils.getParam("PlayTypeID") == null || localStorageUtils.getParam("PlayTypeID") ==""){
		PlayTypeID = 1;
	}else{
		PlayTypeID = localStorageUtils.getParam("PlayTypeID");
	}
    if(PlayTypeID == 1){
    	//官方彩   切换
    	$("#game_type_lottery").addClass('gametype_selected');
    	init();
    }else if(PlayTypeID == 2){
    	//信用彩    切换
    	$("#game_type_credit").addClass('gametype_selected');
    	init_credit();
    }else if(PlayTypeID == 3){
    	//棋牌     切换
    	$("#game_type_card").addClass('gametype_selected');
//  	init_card();
    	GetThirdPartyInfo();
    }
    
    //抢红包动态显示
    if(localStorageUtils.getParam("sendRedPak_show")){
    	var sendRedPak_show = jsonUtils.toObject(localStorageUtils.getParam("sendRedPak_show"));
    	var isOpen = Number(sendRedPak_show.isOpen);  // 0 or 1
    	if ( isOpen ) {
    	    is_show_packet();
    	} else {
    	    $("#openRedPacketBox").hide();
    	}
    }
    
    //客服
    $("#kefuID").off('click');
    $("#kefuID").on('click',function (event) {
    	//var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetOnLineServiceUrl"}';
    	var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/merchant/online_service_user/get"}';
	    ajaxUtil.ajaxByAsyncPost(null,params,function(data){
	    	if(data.Code == 200){
	            window.open(data.Data.ServiceUrl,"_self");
	        }else{
	            toastUtils.showToast(data.Msg);
	        }
	    },null);
    });
    //客服
//  var kefuURL = localStorageUtils.getParam("kefuURL");
//  var kefuURL = localStorageUtils.getParam("kefuURL") + "&info=" + encodeURIComponent("userId=" + localStorageUtils.getParam("myUserID") + "&name=" + localStorageUtils.getParam("username") + "&memo=");
//  var le = kefuURL.length;
//  if ( le > 10 ) {
//      document.getElementById('kefuID').style.display = "";
//  }

    $("#wodecaipiao").off('click');
    $("#wodecaipiao").on('click', function(){
        callMyLottery_Fun();
    });

     //公告
     $("#bulletinId").off('click');
     $("#bulletinId").on('click', function(){
         if(localStorageUtils.getParam("isLogin") == "true"){
	         createInitPanel_Fun("gonggao");
         } else {
             createInitPanel_Fun("loginPage");
         }
     });

	 //优惠活动
	 $("#activityId").off('click');
	 $("#activityId").on('click', function(){
		 if(localStorageUtils.getParam("isLogin") == "true"){
			 createInitPanel_Fun("activity");
		 } else {
			 createInitPanel_Fun("loginPage");
		 }
	 });

     //开奖
    $("#awardHallId").off('click');
    $("#awardHallId").on('click', function(){
        if(localStorageUtils.getParam("isLogin") == "true"){
	        createInitPanel_Fun("awardHallPage");
        } else {
            createInitPanel_Fun("loginPage");
        }
    });    
    
    //*********************************************************************************************************
    //自有官彩  第三方棋牌  切换
    $("#game_type_lottery").off('click');
    $("#game_type_lottery").on('click', function(){
        init();
        $(this).siblings('li').removeClass('gametype_selected');    // 删除其他li的边框样式
        $(this).addClass('gametype_selected');                            // 为当前li添加边框样式
        PlayTypeID = 1;
        localStorageUtils.setParam("PlayTypeID",PlayTypeID);
    });
    $("#game_type_credit").off('click');
    $("#game_type_credit").on('click', function(){
        init_credit();
        $(this).siblings('li').removeClass('gametype_selected');    // 删除其他li的边框样式
        $(this).addClass('gametype_selected');   
        PlayTypeID = 2;
        localStorageUtils.setParam("PlayTypeID",PlayTypeID);
    });
    $("#game_type_card").off('click');
    $("#game_type_card").on('click', function(){
        init_card();
        $(this).siblings('li').removeClass('gametype_selected');    // 删除其他li的边框样式
        $(this).addClass('gametype_selected');   
        PlayTypeID = 3;
        localStorageUtils.setParam("PlayTypeID",PlayTypeID);
    });
    //*********************************************************************************************************
    
    
    
    var params = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserAllMoney"}';
    ajaxUtil.ajaxByAsyncPost1(null, params, function(data){
        if( data.Code == 200 && localStorageUtils.getParam("isLogin") == "true" )  {
            checkOut_clearData();
            checkOut_clearData_mmc();
            //账户余额
            localStorageUtils.setParam("lotteryMoney", data.Data.lotteryMoney);
            localStorageUtils.setParam("dandianLg", "true");
        } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
    },null);
}

function lotteryHallUnloadedPanel() {
    $("#activitiesScroller").empty();
    $("#ActiveIcons").empty();
    if (inter_t1){
        clearInterval(inter_t1);
    }
    if (timeout_t2){
        clearTimeout(timeout_t2);
    }
    if (timeout_t3){
        clearTimeout(timeout_t3);
    }
    
    Arr_ThirdPartyInfo =[];
//  $("#game_type_lottery").removeClass('gametype_selected');
//  $("#game_type_credit").removeClass('gametype_selected');
//  $("#game_type_card").removeClass('gametype_selected');

	localStorageUtils.setParam("PlayTypeID",PlayTypeID);
    
}

function lunbo(){
    var elem = document.getElementById('huadong');
    window.mySwipe = Swipe(elem, {
        auto: 3000,
        continuous: true,
        disableScroll: true,
        stopPropagation: true,
        callback: function(index, element) {
            $(".xiaoyuandian ul li").length <= index ? index -= $(".xiaoyuandian ul li").length : "";
            $(".xiaoyuandian ul li").eq(index).addClass("active").siblings().removeClass("active");
        }
    });
    $(".xiaoyuandian ul li").click(
        function(){
            mySwipe.slide($(this).index(),500);
        }
    );
}

function init(){
    $("#newAwardList").empty();
    $("#lottery_jjc").empty();
    if(!localStorageUtils.getParam("saleLottery")){
    	return;
    }
    var arr=localStorageUtils.getParam("saleLottery").split(",");
    if(arr.indexOf("21") != -1){
        arr.splice(arr.indexOf("21"),1); //去掉江苏骰宝
    }
    if(arr.indexOf("87") != -1){
        arr.splice(arr.indexOf("87"),1); //去掉吉林骰宝
    }
    if(arr.indexOf("88") != -1){
        arr.splice(arr.indexOf("88"),1); //去掉安徽骰宝
    }
    if(arr.indexOf("89") != -1){
        arr.splice(arr.indexOf("89"),1); //去掉湖北骰宝
    }
    //首页彩种排序
    for (var i = 0; i < IndexLottery.length;i++){
//      var title = '<div style="font-size: 15px;padding: 15px 0 10px 20px;border-bottom:1px solid #ddd;">'+IndexLottery[i].category+'</div>';
//      $("#lottery_jjc").append(title);
        var len = IndexLottery[i].lottery.length;
        var temp = [];
        for(var z = 0; z < len;z++){
            if($.inArray(IndexLottery[i].lottery[z],arr) >= 0){
                temp.push(IndexLottery[i].lottery[z]);
            }
        }
        
        if(temp.length > 0){
    		var title = '<div style="font-size: 15px;padding: 15px 0px 10px 20px;border-bottom:1px solid #ddd;">'+IndexLottery[i].category+'</div>';
        	$("#lottery_jjc").append(title);
    	}
		
		var $textCompent = $('<ul></ul>');
        var length = parseInt(temp.length)  % 3 == 0 ? parseInt(temp.length / 3) : parseInt(temp.length / 3) + 1;
        for (var j = 0; j < length;j++){
            var range = 0;
            if (j == length - 1) {
                range = temp.length % 3 == 0 ? 3 : temp.length % 3;
            } else {
                range = 3;
            }
            var text  = '';
            for (var k = 0; k < range; k++) {
                var index= (j * 3) + k;
                var page = LotteryInfo.getLotteryTagById(temp[index]) + "Page";
                var linkhref = "createInitPanel_Fun('"+page+"')";

                var HaltSaleLottery = localStorageUtils.getParam("HaltSale_ID").split(',');
                if ( HaltSaleLottery && HaltSaleLottery.length > 0 && ($.inArray(temp[index],HaltSaleLottery) != -1 )){
                    linkhref = "toastUtils.showToast('该彩种已停售')";
                }

                var lotteryName = LotteryInfo.getLotteryNameById(temp[index]);
                var imageSrc = LotteryInfo.getLotteryLogoById(temp[index]);

				if($.inArray(temp[index],hot_lottrey) >= 0){
                	text += '<li><a  onclick='+linkhref+'><div class="lottrey-logo"><img src="' + imageSrc + '" class="marLR_18" /><img src="images/logo_tip_hot.png" class="lottrey-logo-ico"/></div><br /><span>'+lotteryName+'</span></a></li>';
                }else if($.inArray(temp[index],new_lottrey) >= 0){
                	text += '<li><a  onclick='+linkhref+'><div class="lottrey-logo"><img src="' + imageSrc + '" class="marLR_18" /><img src="images/logo_tip_new.png" class="lottrey-logo-ico"/></div><br /><span>'+lotteryName+'</span></a></li>';
                }else{
                	text += '<li><a  onclick='+linkhref+'><img src="' + imageSrc + '" class="marLR_18" /><br /><span>'+lotteryName+'</span></a></li>';
                }
            }
            $textCompent.append(text);
            $("#lottery_jjc").append($textCompent);
        }
    }
  //版权所有，年份显示
    var copyrightYear = initDefaultDate(0,'year');
    $("#copyrightYear").html(copyrightYear.split('/')[0]);
}

function init_card(){
    $("#newAwardList").empty();
    $("#lottery_jjc").empty();
    //第三方棋牌 排序
	var temp = Arr_ThirdPartyInfo;
	var $textCompent = $('<ul></ul>');
    var length = parseInt(temp.length)  % 3 == 0 ? parseInt(temp.length / 3) : parseInt(temp.length / 3) + 1;
    for (var j = 0; j < length;j++){
        var range = 0;
        if (j == length - 1) {
            range = temp.length % 3 == 0 ? 3 : temp.length % 3;
        } else {
            range = 3;
        }
        var text  = '';
        var li_row = '';
        for (var k = 0; k < range; k++) {
        	var index= (j * 3) + k;
			var str_index = Arr_ThirdPartyInfo[index].ThirdpartyValue;
			var str_name = Arr_ThirdPartyInfo[index].ThirdpartyText;
			var str_id = str_index +'_'+str_name;
			var imageSrc = ThirdPartyLogo[str_index-1];
			
			if (k == 0) {
                text += '<ul id="card_list"><li><a name="'+str_id+'"><img src="' + imageSrc + '" class="marLR_18" /><br /><span>'+str_name+'</span></a></li>';
            } else if (k == 1) {
                text += '<li><a name="'+str_id+'"><img src="' + imageSrc + '" class="marLR_18" /><br /><span>'+str_name+'</span></a></li>';
            } else if (k == 2) {
                text += '<li><a name="'+str_id+'"><img src="' + imageSrc + '" class="marLR_18" /><br /><span>'+str_name+'</span></a></li></ul>';
            }
        }
        $textCompent.append(text);
        $("#lottery_jjc").append($textCompent);
    }
    
    $("#card_list li a").click(function(){
        chineseNameJudge(this.name.split("_")[0],this.name.split("_")[1]);
    });

  //版权所有，年份显示
    var copyrightYear = initDefaultDate(0,'year');
    $("#copyrightYear").html(copyrightYear.split('/')[0]);
}

function init_credit(){
	$("#newAwardList").empty();
	$("#lottery_jjc").empty();
	var arr=localStorageUtils.getParam("saleLottery").split(",");
	//首页彩种排序
    for (var i = 0; i < hcp_IndexLottery.length;i++){
//      var title = '<div style="font-size: 15px;padding: 15px 0px 10px 20px;border-bottom:1px solid #ddd;">'+hcp_IndexLottery[i].category+'</div>';
//      $("#lottery_jjc").append(title);
        var len = hcp_IndexLottery[i].lottery.length;
        var temp = [];
    	for(var z = 0; z < len;z++){
            if($.inArray(hcp_IndexLottery[i].lottery[z],arr) >= 0){
                temp.push(hcp_IndexLottery[i].lottery[z]);
            }
        }
    	
    	if(temp.length > 0){
    		var title = '<div style="font-size: 15px;padding: 15px 0px 10px 20px;border-bottom:1px solid #ddd;">'+hcp_IndexLottery[i].category+'</div>';
        	$("#lottery_jjc").append(title);
    	}

        var length = parseInt(temp.length)  % 3 == 0 ? parseInt(temp.length / 3) : parseInt(temp.length / 3) + 1;
        for (var j = 0; j < length;j++){
            var range = 0;
            if (j == length - 1) {
                range = temp.length % 3 == 0 ? 3 : temp.length % 3;
            } else {
                range = 3;
            }
            var text  = '';
            for (var k = 0; k < range; k++) {
                var index= (j * 3) + k;
                var page = hcp_LotteryInfo.getLotteryTagById(temp[index]) + "Page";
//              var linkhref = "createInitPanel_Fun('"+page+"')";
				var linkhref = temp[index] + "_" + page;

                var lotteryName = hcp_LotteryInfo.getLotteryNameById(temp[index]);
                var imageSrc = hcp_LotteryInfo.getLotteryLogoById(temp[index]);
                if (k == 0) {
                    text += '<ul id="hcp_list"><li><a name="'+linkhref+'" ><img src="' + imageSrc + '" class="marLR_18" /><br /><span>'+lotteryName+'</span></a></li>';
                } else if (k == 1) {
                    text += '<li><a name="'+linkhref+'"><img src="' + imageSrc + '" class="marLR_18" /><br /><span>'+lotteryName+'</span></a></li>';
                } else if (k == 2) {
                    text += '<li><a name="'+linkhref+'"><img src="' + imageSrc + '" class="marLR_18" /><br /><span>'+lotteryName+'</span></a></li></ul>';
                }
            }
            $("#lottery_jjc").append(text);
        }
    }
    
    $("#hcp_list li a").click(function(){
    	 // alert("点击了"+this.name);
        current_LottreyId = this.name.split("_")[0];
    	var HaltSaleLottery = localStorageUtils.getParam("HaltSale_ID").split(',');
        if (HaltSaleLottery && HaltSaleLottery.length > 0 && $.inArray(current_LottreyId,HaltSaleLottery) != -1 ){
            toastUtils.showToast('该彩种已停售');
            return;
        }
        localStorageUtils.setParam("LottreyId", current_LottreyId);
        createInitPanel_Fun(this.name.split("_")[1]);
    });
    
//  $("input:checkbox:checked").next().nextAll().remove();
//  $("#lottery_jjc ul").nextAll("div").remove();
    
//  $("#lottery_jjc ul").prevAll("div").remove();
    
//  var leet = $("#lottery_jjc ul").prev("div");
//  leet.prevAll("div").remove();
    
//  var elem=document.getElementById('hcp_list'); // 按 id 获取要删除的元素
//	elem.parentNode.removeChild(elem); // 让 “要删除的元素” 的 “父元素” 删除 “要删除的元素”
    
    //版权所有，年份显示
    var copyrightYear = initDefaultDate(0,'year');
    $("#copyrightYear").html(copyrightYear.split('/')[0]);
	
}


/**
 * [downloadApp_Fun description]
 * @return {[type]} [description]
 */
function downloadApp_Fun(){
    createInitPanel_Fun("app");
}


/**
 * [downloadApp_Fun description]
 * @return {[type]} [description]
 */
function loginComputerLink(){
    window.location.href='/';
}

/*
 函数startmarquee的参数：
 scrollHeight：文字一次向上滚动的距离或高度；
 speed：滚动速度；
 delay：滚动停顿的时间间隔；
 index：可以使封装后的函数应用于页面当中不同的元素；(暂时不用，使用时可加入到参数列表里)
 */
var inter_t1;
var timeout_t3;
var timeout_t2;
function startMarquee(scrollHeight,speed,delay){
    var p=false;
    //对象中的实际内容被复制了一份，包含了两个ul
    var scrollerContent=document.getElementById("activitiesScroller");
    scrollerContent.innerHTML+=scrollerContent.innerHTML;
    //鼠标滑过，停止滚动;
    scrollerContent.onmouseover=function(){p=true};
    //鼠标离开，开始滚动;
    scrollerContent.onmouseout=function(){p=false};
    //文字内容顶端与滚动区域顶端的距离，初始值为0；
    scrollerContent.scrollTop = 0;
    //每隔一段时间，setInterval便会执行一次scrolling函数；speed越大，滚动时间间隔越大，滚动速度越慢；
    function start(){
        inter_t1=setInterval(scrolling,speed);
        if(!p){ scrollerContent.scrollTop += 1;}
    }
    function scrolling(){
        if(scrollerContent.scrollTop%scrollHeight!=0){
            scrollerContent.scrollTop += 1;
            if(scrollerContent.scrollTop>=scrollerContent.scrollHeight/2) scrollerContent.scrollTop = 0;
        }else{
            clearInterval(inter_t1);
            if (timeout_t2){
                clearTimeout(timeout_t2);
            }
            timeout_t2 = setTimeout(start,delay);
        }
    }
    timeout_t3 = setTimeout(start,delay);
}

/*获取公告前三条*/
function  getGongGao3() {
    $("#activitiesScroller").empty();
    $("#ActiveIcons").empty();
    var page = 0;
    ajaxUtil.ajaxByAsyncPost1(null,'{"ProjectPublic_PlatformCode":2,"PageIndex":"' + page + '","PageSize":"3","InterfaceName":"/api/v1/netweb/get_news_list"}',function(data){
        if (data.Code == 200) {
            var Info = data.Data;
            if(Info.length){
	            $(".ActivitesGonggao").show();
	            var $strong =$('<strong>&nbsp;公告：</strong>');
	            var $gongGaoIcon = $('<img src="././images/img-mod/gongGaoIcon.png"/>');
	            var $itemUL = $('<ul></ul>');
	            $.each(Info, function(key, val) {
		            var itemli = '<li data-news='+ val.Sysid +'>'+ val.Title +'</li>' ;
		            $itemUL.append(itemli);
	            });
	            $("#ActiveIcons").append($gongGaoIcon);
	            $("#ActiveIcons").append($strong);
	            $("#activitiesScroller").append($itemUL);
	            //公告滚动效果
	            startMarquee(40,40,3000);
	            $("#activitiesScroller li").on('click',function () {
		            localStorageUtils.setParam("newsId",$(this).data("news"));
		            createInitPanel_Fun('gonggaoDetail');
	            });
            }else {
	            $(".ActivitesGonggao").hide();
            }
        } else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			$(".ActivitesGonggao").hide();
			toastUtils.showToast(data.Msg);
		}
    },null);
}

/*
 *  对接第三方系统  
 * 
 * 	编号：1     大熊棋牌
 		2     开元棋牌
 		3  VR真人
 * 
 * */
var Arr_ThirdPartyInfo=[];
function GetThirdPartyInfo(){
	ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyTransferDirection"}',function (data) {
		if (data.Code == 200) {
			Arr_ThirdPartyInfo=[];
			Arr_ThirdPartyInfo = data.Data.TransferDirection;
			ThirdPartyInfo = Arr_ThirdPartyInfo;
			creatHtmlView_Navigation();
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	},'正在加载数据');
}

//创建导航菜单；
function creatHtmlView_Navigation(){
	if(Arr_ThirdPartyInfo.length > 0 ){  //正式账号
		$("#game_type_card").show();
	}else{
		$("#game_type_card").hide();
	}
	
	if(PlayTypeID == 3){
		init_card();
	}
    
    // li 宽度自适应
	var li_num = $(".changeplay ul li").size();
	var li_hidden = $(".changeplay ul li:hidden").length;
	$(".changeplay ul > li").css("width","calc(100% / "+ (li_num-li_hidden) +")");
}

//@ 第三方 登录
function get_game_login(partyType,partyName) {
	var userName = localStorageUtils.getParam("username");
	ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyLogin","ID":"'+partyType+'","UserName":"'+ userName +'"}',function (data) {
		if (data.Code == 200) {
			if(data.Data.LoginUrl){
				localStorageUtils.setParam("LoginUrl",data.Data.LoginUrl);
				get_game_balance(partyType,partyName);
			}else{
				toastUtils.showToast("获取信息失败");
			}
		} else {
			toastUtils.showToast(data.Msg);
		}
	},'正在加载数据');
}

var userName;
//@ 获取 第三方 余额
function get_game_balance(partyType,partyName) {
	userName = localStorageUtils.getParam("username");
	ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ThirdPartyGetGamerBalance","ID":"'+partyType+'","UserName":"'+userName+'"}',function (data) {
		if(data.Code == 200){
			var Balance = data.Data.Balance || 0;
			var message = $('<div><p style="margin:0 0 10px">'+partyName+'账户余额：'+ Balance +'元.</p><a style="color:red" onclick="gotoTransfer()">余额不足？去转账&#10154;</a></div>');
			setTimeout(function () {
				$.ui.popup(
					{
						title:"提示",
						message:message,
						cancelText:"进入游戏",
						cancelCallback:
							function(){
								window.open(localStorageUtils.getParam("LoginUrl"),"_self");  //跳转链接
							},
						doneText:"关闭",
						doneCallback:
							function(){
							}
					});
			},250);
		} else{
			toastUtils.showToast(data.Msg);
		}
	},null);
}

// 中文名处理；
function chineseNameJudge(partyType,partyName) {
//	1.先检查有无中文;
//	2.查询昵称;
//	3.修改昵称;
	
	var userName = localStorageUtils.getParam("username");
	if(!funcChina(userName) && partyType != 1 && partyType != 2 && partyType != 6){//含有中文  大熊 开元支持中文；
		//查询昵称
		ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetNickName"}',function (data) {
			if (data.Code == 200) {
				if(data.Data.NickName){
					//昵称存在，直接登录。
					get_game_login(partyType,partyName);
				}else{
					var message = $('<input type="text" id="VrName" placeholder="由4-25个数字、字母组成(不能为纯数字)"  value="" ></input>');
					setTimeout(function () {
				      	$.ui.popup({
				          	title:"幸运昵称",
				          	message: message,
				          	cancelText:"关闭",
				          	cancelCallback:
				              	function(){
				              	},
				          	doneText:"确定",
				          	doneCallback:
				              	function(){
				              		if($("#VrName")[0].value == ""){
				              			toastUtils.showToast("昵称不能为空！");
				              			chineseNameJudge();
				              			return;
				              		}
				              		if(verificationNickName($("#VrName")[0].value)){
				              			//修改VR昵称          Result: -1昵称包含中文   -2昵称已存在   1成功   -3已经设置昵称
										ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ModifyRelationUserName","NickName":"'+ $("#VrName")[0].value +'"}',function (data) {
											if(data.Code == 200){
												if(data.Data.Result == 1){ //成功
													toastUtils.showToast("设置成功");
													get_game_login(partyType,partyName);
												}else if(data.Data.Result == -1){
													toastUtils.showToast("昵称不符合规则");
													chineseNameJudge();
												}else if(data.Data.Result == -2){
													toastUtils.showToast("昵称已存在");
												}else if(data.Data.Result == -3){
//													toastUtils.showToast("昵称已设置");
													get_game_login(partyType,partyName);
												}
											} else {
												toastUtils.showToast(data.Msg);
											}
										},null);
				              		}else{
				              			toastUtils.showToast("昵称不符合规则！");
				              			chineseNameJudge();
				              		}
				              	},
				          	cancelOnly:false
				      	});
				  	},300);
				}
			} else {
				toastUtils.showToast(data.Msg);
			}
		},'正在加载数据');
	}else{
		get_game_login(partyType,partyName);
	}
}

//方法  返回false为包含中文；true不包含
function funcChina(obj){   
	if(/.*[\u4e00-\u9fa5]+.*$/.test(obj))   
	{   
		return false;   
	}   
	return true;   
}

function verificationNickName(val){
	var reg = /^(?!\d+$)[\da-zA-Z]{4,25}$/;
	if (reg.test(val)){
		return true;
	}
	return false;
}

function gotoTransfer(){
	
	//获取用户信息
    ajaxUtil.ajaxByAsyncPost(null,'{"ProjectPublic_PlatformCode":2,"UserName":"' + userName + '","InterfaceName":"/api/v1/netweb/GetUserDetailNew"}',function(data){
        if (data.Code == 200) {
        	localStorageUtils.setParam("IsTranAccount",data.Data.IsTranAccount);//转账是否开启, true开启false关闭
        	
        	var IsTranAccount = localStorageUtils.getParam("IsTranAccount");//转账是否开启, true开启false关闭
			if(IsTranAccount == "false"){
				toastUtils.showToast("您无法转账，请联系客服！");
				return;
			}
			//走充值 提款转账的流程；
			flag = 4;
		    //个人中心  转账调用
			CheckPayOutPwdAndTransferPwdloaded();
		}
    },'正在加载数据');
}

/*
* 抢红包部分
*/
var redPacketNum = 0;
var redPacketArr = [];
//@ 判断登录用户是否可以抢红包
function is_show_packet() {
	var parameters = '{"InterfaceName":"/api/v1/netweb/redPacket_isHas","ProjectPublic_PlatformCode":2}';
	ajaxUtil.ajaxByAsyncPost1(null, parameters, function (data) {
		if (data.Code == 200) {
			var redPak_list = data.Data;
			//判断是否有新的红包
			if(redPak_list.length == redPacketArr.length){
				redPacketArr = redPacketArr;
			}else{
				redPacketArr = redPak_list;
			}
			redPacketNum = redPacketArr.length;
			if(redPacketNum){
				$("#openRedPacketBox").show();
				$("#openRedPacketBox").children("span").text(redPacketNum);

				var sendPerson = redPacketArr[0].SendName;
				var packetName = redPacketArr[0].Name;
				var packetId = redPacketArr[0].RedEnvelopId;
				click_packet_box(sendPerson,packetName,packetId);
			}else {
				$("#openRedPacketBox").hide();
			}
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	},null);
}

//@ 点击红包图标处理
function click_packet_box(sendPerson,packetName,packetId) {
	$("#openRedPacketBox").off('click');
	$("#openRedPacketBox").on('click',function (event) {
		if( $("#redPak_show") ){
			$("#redPak_show").remove();
		}

		// 红包遮罩层
		var $redPak_shadowBg = $('<div id="redPak_shadowBg" ' +
			'style="width: 100%;height: 100%; background-color: #111;opacity: 0.5;position: fixed;z-index: 99999;">' +
			'</div>');

		var $packet = $('<div id="redPak_show" class="packet-background">' +
			'<div class="packet-text">' +
			'<span onclick="close_packet()" class="rm-redPak"></span>' +
			'<p>'+ sendPerson +'</p>' +
			'<p>给你发了一个红包</p>' +
			'<h3>'+ packetName +'</h3>' +
			'</div>' +
			'<div class="packet-btn" id="open_packet_btn"></div>' +
			'</div>');
		$("body").append($redPak_shadowBg).append($packet);

		$("#open_packet_btn").on("click",function () {
			open_packet(packetId);
		});
	});
}

//@ 开启红包
function open_packet(packetId){
	$("#open_packet_btn").unbind('click');
	// 红包按钮旋转动画
	$(".packet-btn").addClass("packet-opening");

	var parameters = '{"InterfaceName":"/api/v1/netweb/redPacket_open","ProjectPublic_PlatformCode":2,"Sysid":"' + packetId + '"}';
	ajaxUtil.ajaxByAsyncPost1(null, parameters,open_packet_data ,null);
}

//@ 抢红包返回数据
function open_packet_data(data) {
	if (data.Code == 200) {
		var $needToShow;
		var data = data.Data;

		if(data.ReceiveEnum == 1){
			// 领取成功提示
			var $successInfo = $('<div class="redPak-open-info">' +
				'<img src="images/redPacket/icon_success.png" alt="领取成功">' +
				'<h3>￥'+ data.Amount +'</h3>' +
				'<p onclick="open_packet_success()" style="color:#87ceeb;">查看记录</p>' +
				'</div>');
			$needToShow = $successInfo;
			redPacketArr.shift();  //领取成功后，则删掉其，使 Arr 的 length 减 1，与接口返回的Arr length 一致。
		}else if(data.ReceiveEnum == 3){
			// 过期提示
			var $overdueInfo = $('<div class="redPak-open-info">' +
				'<img src="images/redPacket/icon_overdue.png" alt="红包过期">' +
				'<p>红包已过期</p>' +
				'<h5>该红包超过24小时未领取.</h5>' +
				'</div>');
			$needToShow = $overdueInfo;

			var overDue_redPak = redPacketArr.shift();
			redPacketArr.push(overDue_redPak);
			
		}else if(data.ReceiveEnum == 4 || data.ReceiveEnum == 5){
			// 充值未达标
			var tips = data.FriendlyMessage.replace("\n","<br>");
			var $overdueInfo = $('<div class="redPak-open-info">' +
				'<img src="images/redPacket/icon_shouMan.png" alt="流水未达标">' +
				'<p>'+ tips +'</p>' +
				'</div>');
			$needToShow = $overdueInfo;

			var overDue_redPak = redPacketArr.shift();
			redPacketArr.push(overDue_redPak);
		}else if(data.ReceiveEnum == 6){
			// 已经领取提示
			var $overdueInfo = $('<div class="redPak-open-info">' +
				'<img src="images/redPacket/icon_shouMan.png" alt="红包已领取">' +
				'</div>');
			$needToShow = $overdueInfo;

			var overDue_redPak = redPacketArr.shift();
			redPacketArr.push(overDue_redPak);
		}else if(data.ReceiveEnum == 2){
			var tips = "手慢了.已抢光！";

			// 手慢抢光了提示
			var $shouManInfo = $('<div class="redPak-open-info">' +
				'<img src="images/redPacket/icon_shouMan.png" alt="手慢了">' +
				'<p>'+ tips +'</p>' +
				'</div>');
			$needToShow = $shouManInfo;

			var overDue_redPak = redPacketArr.shift();
			redPacketArr.push(overDue_redPak);
		}else{
			// 领取失败提示
			var $shouManInfo = $('<div class="redPak-open-info">' +
				'<img src="images/redPacket/icon_shouMan.png" alt="领取失败">' +
				'</div>');
			$needToShow = $shouManInfo;

			var overDue_redPak = redPacketArr.shift();
			redPacketArr.push(overDue_redPak);
		}

		$(".packet-text").addClass("packetBg-moving");
		// is Has more packet ?
		is_show_packet();

		setTimeout(function(){
			$(".packet-btn").removeClass("packet-opening").remove();
			$(".packet-text").removeClass("packetBg-moving").css({"top":"-180px"});
			$(".packet-background").css({"background":"#fafafa"});
			$(".rm-redPak").css({"position":"relative","top":"180px"});
			$("#redPak_show").append($needToShow);
		},1500);
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}

//@ 关闭红包
function close_packet() {
	if( $("#redPak_show") ){
		$("#redPak_show").remove();
	}
	//去掉遮罩
	if($("#redPak_shadowBg")){
		$("#redPak_shadowBg").remove();
	}
}

//@ 抢红包成功处理
function open_packet_success() {
	createInitPanel_Fun("getRedPacketRecord");

	if( $("#redPak_show") ){
		$("#redPak_show").remove();
	}
	//去掉遮罩
	if($("#redPak_shadowBg")){
		$("#redPak_shadowBg").remove();
	}
}