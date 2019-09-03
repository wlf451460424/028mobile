var downUserID;
var myUserName;
var myUserID;
var UserLevel;  //当前登录用户等级

var my_DividendRatio;

/*进入panel时调用*/
function modifyBonusLoadedPanel(){
    catchErrorFun("modifyBonusInit();");
}

/*离开panel时调用*/
function modifyBonusUnloadedPanel(){
    $("#suborModifyCttPanel").children('ul').remove();
    
    $("#modifyBonusScoll").scroller().scrollToTop();
    $("#modifyBonusScoll").scroller().clearInfinite();
}

//@ Init
function modifyBonusInit() {
	myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
	UserLevel = localStorageUtils.getParam("UserLevel");
	
    var _myScroller =  $("#modifyBonusScoll").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    
    var modifyCttInfo = jsonUtils.toObject(localStorageUtils.getParam("fenHongCttInfo"));
    downUserID = modifyCttInfo.userID;
    $("#modifyCtt_suborName").html(modifyCttInfo.userName);
    
    $("#selectType_Modify").empty();
    var $selectItem = $('<select name="TypeId" id="TypeId" onchange="TypeIdChange()"></select>');
    $("#selectType_Modify").append($selectItem);

	var BonusSysType = jsonUtils.toObject(localStorageUtils.getParam("BonusSysType")); //Bonus type
	var selectedTypeVal = modifyCttInfo.TypeParameterId;
	//分红契约制度类型列表
	$.each(BonusSysType,function (k,v) {
		if(selectedTypeVal == v.Id){
			var $option = $('<option selected="selected" value="'+ v.Id +'">分红类型：'+ v.Name +'</optionv>');
		}else{
			var $option = $('<option value="'+ v.Id +'">分红类型：'+ v.Name +'</optionv>');
		}
		$selectItem.append($option);
	});
	TypeInfoCharge($("#TypeId").val());

    //Btn
    $("#modifyBonusBtn").off('click');
    $("#modifyBonusBtn").on('click',function () {
        submitmodifyBonus(modifyCttInfo);
    });
    
    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetMyBonusContract","ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'","TypeParameterId":' + $("#TypeId").val() +'}', 
	    function(data){
	    	if(data.Code == 200){
	    		var list = data.Data.MyBonusList;
	    		if(list.length == 0){
			        $("#my_DividendRatio").hide();
			    }else{
			    	var now_My_DividendRatio = 0;
			        for(var i = 0;i< list.length; i++){
						var aa = bigNumberUtil.multiply(100,list[i].DividendRatio);
						if(now_My_DividendRatio < aa){
							now_My_DividendRatio = aa;
						}
			        }
			        localStorageUtils.setParam("now_My_DividendRatio",now_My_DividendRatio);
			        //我的契约
					my_DividendRatio = localStorageUtils.getParam("now_My_DividendRatio");
					$("#my_DividendRatio").html(my_DividendRatio +"%");
			    }
	    	}
	    }, '正在加载数据...');
	    
	
}

//分红类型改变事件
function TypeIdChange() {
    TypeInfoCharge($("#TypeId").val());
    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetMyBonusContract","ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'","TypeParameterId":' + $("#TypeId").val() +'}', 
	    function(data){
	    	if(data.Code == 200){
	    		var list = data.Data.MyBonusList;
	    		if(list.length == 0){
			        $("#my_DividendRatio").hide();
			    }else{
			    	var now_My_DividendRatio = 0;
			        for(var i = 0;i< list.length; i++){
						var aa = bigNumberUtil.multiply(100,list[i].DividendRatio);
						if(now_My_DividendRatio < aa){
							now_My_DividendRatio = aa;
						}
			        }
			        localStorageUtils.setParam("now_My_DividendRatio",now_My_DividendRatio);
			        //我的契约
					my_DividendRatio = localStorageUtils.getParam("now_My_DividendRatio");
					$("#my_DividendRatio").html(my_DividendRatio +"%");
			    }
	    	}
	    }, '正在加载数据...');
} 

/**
 * 查询 数据
 */
function TypeInfoCharge(typeID) {
	//GetUserBonusContract(查询用户分红类型契约)
	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetUserBonusContract","ProjectPublic_PlatformCode":2,"UserID":"'+ downUserID +'","TypeParameterId":'+typeID+'}', modifyBonus_callBack, '正在加载数据...');
}

//@ 我的和下级分红契约数据
function modifyBonus_callBack(data) {
	$("#suborModifyCttPanel").empty();
	$("#modifyBonusScoll").scroller().scrollToTop();
    $("#modifyBonusScoll").scroller().clearInfinite();
    var $add = $('<li><span></span><span><a onclick="addUL(this);"> 添加行 </a></span></li>');

    if (data.Code == 200){
    	var downContract = data.Data.UserBonusList;
        //@ 直属下级分红契约
        if (downContract.length > 0){
	        for(var i = 0; i < downContract.length; i++){
		        var betMoneyMin = downContract[i].BetMoneyMin;
		        var lossMoneyMin = downContract[i].LossMoneyMin;
		        var activeNum = downContract[i].ActivePersonNum;
		        var dividendRatio = bigNumberUtil.multiply(100,downContract[i].DividendRatio);

		        var $ulSub = addModifyInfo_fenHong(betMoneyMin, lossMoneyMin, activeNum, dividendRatio);

		        //控制每个UL底部的"删除"和"添加行"按钮；
		        var $add_delete = $('<li><span><a onclick="deleteUL(this);"> 删 除 </a></span><span><a onclick="addUL(this);"> 添加行 </a></span></li>');
		        var $delete = $('<li><span><a onclick="deleteUL(this);"> 删 除 </a></span><span style="display:none;"><a onclick="addUL(this);"> 添加行 </a></span></li>');
		        if(i == 0){
			        $ulSub.children('li:last-child').remove();
		        	    if(downContract.length == 1){
			            $ulSub.append($add);
		            }else {
			            $($add[0]).children('span:last-child').css('display','none');
			            $ulSub.append($add);
		            }
		        }else {
			        $ulSub.children('li:last-child').remove();
			        if (i == downContract.length-1){
				        $ulSub.append($add_delete);
			        }else {
				        $ulSub.append($delete);
			        }
		        }
		        $("#suborModifyCttPanel").append($ulSub);
	        }
        }else{  //没有数据，默认显示一个panel
	        var $noDateSub = addModifyInfo_fenHong(0, 0, 0, 0);
	            $noDateSub.children('li:last-child').remove();
	            $noDateSub.append($add);
	        $("#suborModifyCttPanel").append($noDateSub);
        }

		$("#modifyBonusScoll").css("padding-bottom","30px");//刷新列表滚动；
		
	    //分红契约类型A允许签约，与下级签约页面切换不允许的类型，该页面应不显示保存按钮
	    data.Data.IsSubContract ? $("#modifyBonusBtn").show() : $("#modifyBonusBtn").hide();
    }else {
        toastUtils.showToast(data.Msg);
    }
}

//@ 添加直属下级分红契约
function addModifyInfo_fenHong(BetMoneyMin, LossMoneyMin, ActiveNum, DividendRatio) {
    var $subData = $('<ul class="recordDetail sub-fenhong-ctt">'+
        '<li><span> 销量 </span><span> 亏损 </span></li>'+
        '<li><span><input type="tel" maxlength="9" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" value="'+ BetMoneyMin +'"></span><span><input type="tel" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" maxlength="9" value="'+ LossMoneyMin +'"></span></li>'+
        '<li><span> 活跃人数 </span><span> 分红比例（%）</span></li>'+
        '<li><span><input type="tel" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" maxlength="4" value="'+ ActiveNum +'"></span><span><input type="text" onkeyup="return ValidateNumberTwoDecimal(this,value)" maxlength="6" style="width:90%" value="'+ DividendRatio +'"></span></li><li><span></span><span></span></li></ul>');

    return $subData;
}

//@ 提交按钮 分红契约
function submitmodifyBonus(modifyCttInfo) {
    var ContractContent = [];
    var ul = $("#suborModifyCttPanel").children('ul');

    for (var i=0; i < ul.length; i++){
        var obj = {};
        var BetMoneyMin = Number($(ul[i]).children('li:first-child').next().children('span:first-child').children('input').val());  //销量Min
        if (i == ul.length - 1){
            var LossMoneyMax = 999999999;
            var BetMoneyMax = 999999999;
	        var ActivePersonNum = Number($(ul[i]).children('li:last-child').prev().children('span:first-child').children('input').val());   //活跃人数
            var ActivePersonNumNext = Number($(ul[i]).children('li:last-child').prev().children('span:first-child').children('input').val()); //下个框的活跃人数
        }else{
            var LossMoneyMax = Number($(ul[i+1]).children('li:first-child').next().children('span:last-child').children('input').val());    //亏损Max
            var BetMoneyMax = Number($(ul[i+1]).children('li:first-child').next().children('span:first-child').children('input').val());   //销量Max
            var ActivePersonNum = Number($(ul[i]).children('li:last-child').prev().children('span:first-child').children('input').val());   //活跃人数
            var ActivePersonNumNext = Number($(ul[i+1]).children('li:last-child').prev().children('span:first-child').children('input').val()); //下个框的活跃人数
        }
        var LossMoneyMin = Number($(ul[i]).children('li:first-child').next().children('span:last-child').children('input').val());  //亏损Min
        var DividendRatio = Number($(ul[i]).children('li:last-child').prev().children('span:last-child').children('input').val());  //分红比例
		
		
		//分红比例不能大于自己最高的分红比例
		if(DividendRatio > my_DividendRatio){
			toastUtils.showToast("下级的分红比例不能大于自身的最大比例");
            return;
		}
        // 分红比例限制
        if (DividendRatio < 0.01 || DividendRatio > 100){
            toastUtils.showToast("分红比例范围：0.01 ~ 100 %");
            return;
        }else{
            obj.DividendRatio = bigNumberUtil.divided(DividendRatio,100);
        }

        //消费，亏损，活跃人数限制
        if (BetMoneyMin> BetMoneyMax || LossMoneyMin> LossMoneyMax || ActivePersonNum > ActivePersonNumNext){
            toastUtils.showToast("存在错误信息,无法修改");
            return;
        }else {
            obj.BetMoneyMin = BetMoneyMin;
            obj.BetMoneyMax = BetMoneyMax;
            obj.LossMoneyMin = LossMoneyMin;
            obj.LossMoneyMax = LossMoneyMax;
            obj.ActivePersonNum = ActivePersonNum;
        }
        ContractContent.push(obj);
    }
    
    var typeName =  ($("#TypeId").find("option:selected").text()).split("：")[1];
	//AddBonusContractContent（添加分红契约 和 修改分红契约）
    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/AddBonusContractContent","ProjectPublic_PlatformCode":2,"UserName":"' + myUserName +'","UserID":"'+downUserID+'","LoginUserName":"'+ modifyCttInfo.userName +'","TypeParameterId":"'+$("#TypeId").val()+'","TypeName":"'+typeName+'","ContractContentModels":'+jsonUtils.toString(ContractContent)+'}', function (data) {
        if(data.Code == 200){
		    if (data.Data.Result > 0){
                toastUtils.showToast("添加成功");
                setPanelBackPage_Fun("bonusList");
            }else if (data.Data.Result == -1){
                toastUtils.showToast("用户不存在");
            }else if (data.Data.Result == -2){
                toastUtils.showToast("不能添加会员");
            }else if (data.Data.Result == -3){
                toastUtils.showToast("该代理已添加分红契约");
            }else if (data.Data.Result == -4){
                toastUtils.showToast("级别超过限制");
            }else if (data.Data.Result == -5){
                toastUtils.showToast("您尚未签约，不能与下级签约");
            }else {
                toastUtils.showToast("添加失败");
            }
		}else{
		    toastUtils.showToast(data.Msg);
		}
    }, '正在加载数据...');
}

//添加行
function addUL(element) {
    var spendValue = Number($(element).parents('ul').children('li:first-child').next().children('span:first-child').children('input').val());
    var lossValue = Number($(element).parents('ul').children('li:first-child').next().children('span:last-child').children('input').val());
    var onlineValue = Number($(element).parents('ul').children('li:last-child').prev().children('span:first-child').children('input').val());
    var biliValue = Number($(element).parents('ul').children('li:last-child').prev().children('span:last-child').children('input').val());

    var spendValue_prev = $(element).parents('ul').prev('ul').children('li:first-child').next().children('span:first-child').children('input').val();
    var lossValue_prev = $(element).parents('ul').prev('ul').children('li:first-child').next().children('span:last-child').children('input').val();
    var onlineValue_prev = $(element).parents('ul').prev('ul').children('li:last-child').prev().children('span:first-child').children('input').val();
    var biliValue_prev = $(element).parents('ul').prev('ul').children('li:last-child').prev().children('span:last-child').children('input').val();

    // 分红比例限制
    if (biliValue < 0.01 || biliValue > 100){
        toastUtils.showToast('分红比例范围：0.01 ~ 100%');
        return;
    }
    //销量，亏损，活跃人数限制
    if (spendValue_prev && lossValue_prev  && onlineValue_prev ){
        if (spendValue < spendValue_prev || lossValue < lossValue_prev || onlineValue < onlineValue_prev){
            toastUtils.showToast("存在错误信息，无法添加新行");
            return;
        }
    }

    var $addUL = $('<ul class="recordDetail sub-fenhong-ctt">'+
        '<li><span> 销量 </span><span> 亏损 </span></li>'+
        '<li><span><input type="tel" maxlength="9" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" value="0"></span><span><input type="tel" maxlength="9" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" value="0"></span></li>'+
        '<li><span> 活跃人数 </span><span> 分红比例（%）</span></li>'+
        '<li><span><input type="tel" maxlength="4" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" value="0"></span><span><input type="text" value="0" onkeyup="return ValidateNumberTwoDecimal(this,value)" maxlength="6"></span></li>'+
        '<li><span><a onclick="deleteUL(this);"> 删 除 </a></span><span><a onclick="addUL(this);"> 添加行 </a></span></li></ul>');
    $("#suborModifyCttPanel").append($addUL);
    $(element).parent('span').css("display","none");  // myself 添加行

    $(element).parents('ul.sub-fenhong-ctt').prev().children('li:last-child').children('span:last-child').css("display","none");  //prev 添加行
    
    $("#modifyBonusScoll").css("padding-bottom","30px");   //解决滑动条滑到最底页面显示不全的问题
}

//删除行
function deleteUL(element) {
    if($(element).parent('span').next('span').css('display')=="none"){
        $(element).parents('ul.sub-fenhong-ctt').remove();
    }else {
        $(element).parents('ul.sub-fenhong-ctt').prev().children('li:last-child').children('span:last-child').css("display","");  //prev 添加行
        $(element).parents('ul.sub-fenhong-ctt').remove();
    }
}
