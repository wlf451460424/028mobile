
var myUserName;
var myUserID;

/*进入panel时调用*/
function myBonusLoadedPanel(){
    catchErrorFun("myBonusInit();");
}

/*离开panel时调用*/
function myBonusUnloadedPanel(){
    $("#myBonus_notData").empty();
    $("#myBonus_list").empty();
    $("#myBonus_Modified_list").empty();
}

//@ Init
function myBonusInit() {
	$("#selectType_div").empty();
    var $selectType = $('<select name="searchType" id="searchType"  onchange="typeChange()"></select>');
    $("#selectType_div").append($selectType);
	
    myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
	
	//GetSystemMgrType(获取制度类型列表)1=日结，2=分红、3=私返
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/GetSystemMgrType","ProjectPublic_PlatformCode":2,"TypeID":"2"}', function (data) {
    	if(data.Code == 200){
    		if(data.Data.SysMgrTypeModel.length>0){
    			for(var i=0;i<data.Data.SysMgrTypeModel.length;i++){
    				var $option = $('<option value="'+ data.Data.SysMgrTypeModel[i].Id +'">'+'分红类型：'+ data.Data.SysMgrTypeModel[i].Name +'</option>');
    				$selectType.append($option);
    			}
    			typeIdCharge($("#searchType").val());
    		}else{
    			toastUtils.showToast("获取制度类型列表为空");
    		}
	    } else {
	    	toastUtils.showToast(data.Msg);
	        return;
	    }
    }, '正在加载数据...');
}
//分红类型改变事件
function typeChange() {
    typeIdCharge($("#searchType").val());
}  
/**
 * 查询 分红契约数据
 */
function typeIdCharge(typeID) {
	// GetMyBonusContract（前台获取自身分红契约信息）  旧接口名称：GetMyBonusContract改成NewGetContractDetails  2018-1-11
	ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetMyBonusContract","ProjectPublic_PlatformCode":2,"UserID":"'+ myUserID +'","TypeParameterId":' + typeID +'}', getmyBonusInfo, '正在加载数据...');
}
// 服务端返数据
function getmyBonusInfo(data) {
	$("#myBonus_notData").empty();
    $("#myBonus_list").empty();
    $("#myBonus_Modified_list").empty();
    $("#myBonus_notData").parent('div').show();
    $("#myBonus_list").parent('div').show();
	$("#myBonus_Modified_list").parent('div').show();
	if(data.Code == 200){
		var list = data.Data.MyBonusList;
	    var Modified_list = data.Data.ModifyList;
	    if(list.length == 0 && Modified_list.length == 0){
	        $("#myBonus_notData").append('<ul class="recordDetail"><p style="text-align: center;">无记录</p></ul>');
	    }
	    
	    if(list.length == 0){
	        $("#myBonus_list").parent('div').hide();
	    }else{
	        for(var i = 0;i< list.length; i++){
	            var $panel = $('<ul class="recordDetail my-fenhong-ctt"><li><span>销量</span><span>亏损</span></li>'+
	                '<li><span class="redtext">'+ list[i].BetMoneyMin +'</span><span class="redtext">' + list[i].LossMoneyMin +
	                '</span></li><li><span>活跃人数</span><span>分红比例</span></li><li><span class="redtext">'+ list[i].ActivePersonNum +
	                '</span><span class="redtext">' + bigNumberUtil.multiply(100,list[i].DividendRatio) +' %</span></li></ul>');
	            $("#myBonus_list").append($panel);
	        }
	    }
	    
	    if(Modified_list.length == 0){
	        $("#myBonus_Modified_list").parent('div').hide();
	    }else{
	    	$("#agree_info").css('display','inline'); 
	        for (var i = 0;i< Modified_list.length; i++){
	            var $panel = $('<ul class="recordDetail my-fenhong-ctt"><li><span>销量</span><span>亏损</span></li>'+
	                '<li><span class="redtext">'+ Modified_list[i].BetMoneyMin +'</span><span class="redtext">' + Modified_list[i].LossMoneyMin +
	                '</span></li><li><span>活跃人数</span><span>分红比例</span></li><li><span class="redtext">'+ Modified_list[i].ActivePersonNum +
	                '</span><span class="redtext">' + bigNumberUtil.multiply(100,Modified_list[i].DividendRatio) +' %</span></li></ul>');
	
	            $("#myBonus_Modified_list").append($panel);
	        }
	        $("#myBonus_Modified_list").append('<a class="loginBtn" style="margin-top:40px;" onclick="AgreemyBonus(1)">同意</a>');
	    }
    } else {
    	toastUtils.showToast(data.Msg);
        return;
    }
    
}

//@ 同意按钮
function AgreemyBonus(IsAgree) {
	var TypeParameterId = $("#searchType").val();
    var TypeName = ($("#searchType").find("option:selected").text()).split("：")[1];
	//AgreeBonusContract（同意分红契约）
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"/api/v1/netweb/AgreeBonusContract","ProjectPublic_PlatformCode":2,"IsAgree":'+ IsAgree +',"UserName":"'+ myUserName +'","TypeParameterId":'+TypeParameterId+',"TypeName":"'+ TypeName +'"} ', function (data) {
        if(data.Code == 200){
		    if (data.Data.Result){
                toastUtils.showToast("您的契约已经变更，下次分红将按照新的契约执行");
                $("#myBonus_list a").css('display',"none");
                setPanelBackPage_Fun("contractManageNew");
            }else {
                toastUtils.showToast("同意失败，请稍后再试");
            }
		}else{
		    toastUtils.showToast(data.Msg);
		}
    }, '正在加载数据...');
}