/*进入panel时调用*/
function modifyContractLoadedPanel(){
    catchErrorFun("modifyContractInit();");
}

/*离开panel时调用*/
function modifyContractUnloadedPanel(){
    $("#myModifyCttPanel").children('ul').remove();
    $("#suborModifyCttPanel").children('ul').remove();
}

var UserLevel;  //当前登录用户等级
var myUserID;  //当前用户ID

//@ Init
function modifyContractInit() {
    var modifyCttInfo = jsonUtils.toObject(localStorageUtils.getParam("fenHongCttInfo"));
    myUserID = localStorageUtils.getParam("myUserID");
    UserLevel = localStorageUtils.getParam("UserLevel");
    $("#modifyCtt_suborName").html(modifyCttInfo.userName);

    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetMyDownContract","ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'","DownUserId":' + modifyCttInfo.userID+'}', modifyContract_callBack, '正在加载数据...');

    //Btn
    $("#modifyContractBtn").off('click');
    $("#modifyContractBtn").on('click',function () {
        submitModifyContract(modifyCttInfo);
    });
}
//@ 我的和下级分红契约数据
function modifyContract_callBack(data) {
	if(data.Code == 200){
	    var myContract = data.Data.MyContract;
	    var downContract = data.Data.DownContract;
	    var $add = $('<li><span></span><span><a onclick="addUL(this);"> 添加行 </a></span></li>');
	    
	    //@ 我的分红契约
        if (myContract.length > 0){
            for(var i = 0; i < myContract.length; i++){
                var $ulMine = $('<ul class="recordDetail my-fenhong-ctt">'+
                    '<li><span> 消费额 </span><span> 亏损额 </span></li>'+
                    '<li><span>'+myContract[i].BetMoneyMin+'</span><span>'+myContract[i].LossMoneyMin+'</span></li>'+
                    '<li><span> 活跃人数 </span><span> 分红比例（%）</span></li>'+
                    '<li><span>'+myContract[i].ActivePersonNum+'</span><span>'+ bigNumberUtil.multiply(myContract[i].DividendRatio,100) +'</span></li></ul>');

                $("#myModifyCttPanel").append($ulMine);
            }
        }else {
            var $noDataMine = ('<ul class="recordDetail my-fenhong-ctt">'+
            '<li><span>消费额</span><span>亏损额</span></li>'+
            '<li><span> 0 </span><span> 0 </span></li>'+
            '<li><span> 活跃人数 </span><span> 分红比例（%）</span></li>'+
            '<li><span> 0 </span><span> 0 </span></li></ul>');

            $("#myModifyCttPanel").append($noDataMine);
        }

        //@ 直属下级分红契约
        if ( parseInt(UserLevel) < 3){
            var levelThree_ul = addModifyInfo_fenHong(0,0,0,30);
            levelThree_ul.children('li').children('span').children('input').attr("readonly","readonly");
            $("#suborModifyCttPanel").append(levelThree_ul);
        }else{
            if (downContract.length > 0){
                for(var i = 0; i < downContract.length; i++){
                    var betMoneyMin = downContract[i].BetMoneyMin;
                    var lossMoneyMin = downContract[i].LossMoneyMin;
                    var activeNum = downContract[i].ActivePersonNum;
                    var dividendRatio = bigNumberUtil.multiply(100,downContract[i].DividendRatio);

                    var $ulSub = addModifyInfo_fenHong(betMoneyMin, lossMoneyMin, activeNum, dividendRatio);

                    if (i == downContract.length-1){
                        $ulSub.children('li:last-child').remove();
                        $ulSub.append($add);
                    }
                    $("#suborModifyCttPanel").append($ulSub);
                }
            }else{  //没有数据，默认显示一个panel
                var $noDateSub = addModifyInfo_fenHong(0, 0, 0, 0);
                $noDateSub.children('li:last-child').remove();
                $noDateSub.append($add);
                $("#suborModifyCttPanel").append($noDateSub);
            }
        }
	}else{
	    toastUtils.showToast(data.Msg);
	}
}

//@ 添加直属下级分红契约
function addModifyInfo_fenHong(BetMoneyMin, LossMoneyMin, ActiveNum, DividendRatio) {
    var $subData = $('<ul class="recordDetail sub-fenhong-ctt">'+
        '<li><span> 消费额 </span><span> 亏损额 </span></li>'+
        '<li><span><input type="tel" maxlength="9" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" value="'+ BetMoneyMin +'"></span><span><input type="tel" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" maxlength="9" value="'+ LossMoneyMin +'"></span></li>'+
        '<li><span> 活跃人数 </span><span> 分红比例（%）</span></li>'+
        '<li><span><input type="tel" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" maxlength="4" value="'+ ActiveNum +'"></span><span><input type="text" onkeyup="return ValidateNumberTwoDecimal(this,value)" maxlength="6" style="width:90%" value="'+ DividendRatio +'"></span></li><li><span></span><span></span></li></ul>');

    return $subData;
}

//@ 提交按钮 分红契约
function submitModifyContract(modifyCttInfo) {
    var ContractContent = [];
    var ul = $("#suborModifyCttPanel").children('ul');

    for (var i=0; i < ul.length; i++){
        var obj = {};
        var BetMoneyMin = Number($(ul[i]).children('li:first-child').next().children('span:first-child').children('input').val());  //消费额Min
        if (i == ul.length - 1){
            var LossMoneyMax = 999999999;
            var BetMoneyMax = 999999999;
            var ActivePersonNumNext = Number($(ul[i]).children('li:last-child').prev().children('span:first-child').children('input').val()); //下个框的活跃人数
        }else{
            var LossMoneyMax = Number($(ul[i+1]).children('li:first-child').next().children('span:last-child').children('input').val());    //亏损额Max
            var BetMoneyMax = Number($(ul[i+1]).children('li:first-child').next().children('span:first-child').children('input').val());   //消费额Max
            var ActivePersonNum = Number($(ul[i]).children('li:last-child').prev().children('span:first-child').children('input').val());   //活跃人数
            var ActivePersonNumNext = Number($(ul[i+1]).children('li:last-child').prev().children('span:first-child').children('input').val()); //下个框的活跃人数
        }
        var LossMoneyMin = Number($(ul[i]).children('li:first-child').next().children('span:last-child').children('input').val());  //亏损额Min
        var DividendRatio = Number($(ul[i]).children('li:last-child').prev().children('span:last-child').children('input').val());  //分红比例

        // 分红比例限制
        if (DividendRatio < 0.001 || DividendRatio > 100){
            toastUtils.showToast("分红比例范围：0.001 ~ 100 %");
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

    if (modifyCttInfo.State == -1){  //添加契约
        ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/AddContract","ProjectPublic_PlatformCode":2,"UserName":"' + modifyCttInfo.userName +'","ContractContentModels":'+jsonUtils.toString(ContractContent)+'}', function (data) {
            if(data.Code == 200){
			    if (data.Data.Result > 0){
	                toastUtils.showToast("添加成功");
	                setPanelBackPage_Fun("fenHongContract");
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

    }else {  //修改契约
        ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/ModifyContractContent","ProjectPublic_PlatformCode":2,"UserID":'+ modifyCttInfo.userID +',"UserName":"' + modifyCttInfo.userName +'","ContractContentModels":'+jsonUtils.toString(ContractContent)+'}', function (data) {
            if(data.Code == 200){
			    if (data.Data.Result){
	                toastUtils.showToast("修改成功");
	                setPanelBackPage_Fun("fenHongContract");
	            }else{
	                toastUtils.showToast("修改失败");
	            }
			}else{
			    toastUtils.showToast(data.Msg);
			}
        }, '正在加载数据...');
    }
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
    if (biliValue < 0.001 || biliValue > 100){
        toastUtils.showToast('分红比例范围：0.001 ~ 100%');
        return;
    }
    //消费额，亏损额，活跃人数限制
    if (spendValue_prev && lossValue_prev  && onlineValue_prev ){
        if (spendValue < spendValue_prev || lossValue < lossValue_prev || onlineValue < onlineValue_prev){
            toastUtils.showToast("存在错误信息，无法添加新行");
            return;
        }
    }

    var $addUL = $('<ul class="recordDetail sub-fenhong-ctt">'+
        '<li><span> 消费额 </span><span> 亏损额 </span></li>'+
        '<li><span><input type="tel" maxlength="9" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" value="0"></span><span><input type="tel" maxlength="9" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" value="0"></span></li>'+
        '<li><span> 活跃人数 </span><span> 分红比例（%）</span></li>'+
        '<li><span><input type="tel" maxlength="4" onkeyup="this.value=this.value.replace(/\\D/g,\''+'\')" value="0"></span><span><input type="text" value="0" onkeyup="return ValidateNumberTwoDecimal(this,value)" maxlength="6"></span></li>'+
        '<li><span><a onclick="deleteUL(this);"> 删 除 </a></span><span><a onclick="addUL(this);"> 添加行 </a></span></li></ul>');
    $("#suborModifyCttPanel").append($addUL);
    $(element).parent('span').css("display","none");  // myself 添加行

    $(element).parents('ul.sub-fenhong-ctt').prev().children('li:last-child').children('span:last-child').css("display","none");  //prev 添加行
    
    $("#modifyContractScoll").css("padding-bottom","30px");   //解决滑动条滑到最底页面显示不全的问题
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
