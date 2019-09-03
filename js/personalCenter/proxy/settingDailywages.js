
/*进入panel时调用*/
function settingDailywagesLoadedPanel(){
	catchErrorFun("dailywagesInit();");
}
/*离开panel时调用*/
function settingDailywagesUnloadedPanel(){
    $("#changeBili").empty();
    $("#changeDailyState").val(2);
}
/*  变量定义  */
//自身日结比例
var myDailywages="";
//直属下级名称
var subordinateName ="";
//直属代理比例
var subordinateBili = "";
//直属代理当前日结状态
var dailywagesState ="1";

function dailywagesInit() {
    subordinateName = localStorageUtils.getParam("subordinateName");  //下级名称
    myDailywages = localStorageUtils.getParam("myDailywages");  //我的日结比例
    subordinateBili = localStorageUtils.getParam("subordinateBili");  //下级比例
    dailywagesState = localStorageUtils.getParam("dailywagesState");  //日结当前状态

    //下级代理名称显示
    $("#subordinateName").html(subordinateName);
    //我的比例 - 显示数据处理
    var maxBili = bigNumberUtil.multiply(myDailywages,100).toString();
    myDailywages = bigNumberUtil.multiply(myDailywages,100).toString()+' %';
    $("#myDailywages").html(myDailywages);
    //下级比例 - 显示数据处理
    var minBili = bigNumberUtil.multiply(subordinateBili,100).toString();
    subordinateBili = bigNumberUtil.multiply(subordinateBili,100).toString()+' %';
    $("#subordinateBili").html(subordinateBili);
    //日结状态显示
    if (dailywagesState=="1"){
        $("#dailywagesState").html("开启");
    }
    if (dailywagesState=="0"){
        $("#dailywagesState").html("关闭");
    }
    //设置比例-区间显示
    setProxyBili(minBili,maxBili);
    //提交日结设置的信息时
    $("#dailywageSubmit").off('click');
    $("#dailywageSubmit").on("click", function() {
        var changeBili = $("#changeBili").val();
        //修改下级日结比例
        if (changeBili=="0"||!changeBili){
            if (maxBili==minBili){
                toastUtils.showToast("当前已无可设置的选项");
                return;
            }else {
                toastUtils.showToast("请设置日结比例");
                return;
            }
        }else{
            var setProxyRatio = bigNumberUtil.divided(changeBili,100).toString();
        }

        //修改日结状态
        var setDailyStatus = dailywagesState;

        ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+subordinateName+'","Status":"'+setDailyStatus+'","SettlementRatio":'+setProxyRatio+',"InterfaceName":"/api/v1/netweb/AddDailyWagesSetting","ProjectPublic_PlatformCode":2}', setDailywages, '正在提交数据中...');

    });
}
/*设置日结比例中需要显示的选项*/
function setProxyBili(minBili,maxBili) {
    //string to number
    minBili = (+minBili) + (+"0");
    maxBili = (+maxBili) + (+"0");
    var loopLength = maxBili*10-minBili*10;
    $("#changeBili").append('<option value="0">请选择</option>');

    for (var i = loopLength-1; i >= 0; i--) {
        maxBili = ((+maxBili) + (+"0")).toFixed(1);//保留1位小数点
        $("#changeBili").append('<option value=' + maxBili + '>' + maxBili+ ' %</option>');
        maxBili = bigNumberUtil.minus(maxBili,0.1).toString();
    }
}

/*设置日结，返回函数*/
function setDailywages(data) {
    if (data.Code==200){
        if (data.Data.ResultState){
            toastUtils.showToast("设置成功");
            ajaxUtil.ajaxByAsyncPost(null, '{"UserName":"'+subordinateName+'","InterfaceName":"/api/v1/netweb/ShowDailyWagesSetting","ProjectPublic_PlatformCode":2}', showSucceedData, '正在提交数据中...');
        }
        else if(data.Data.OrderState==-2)
        {
            toastUtils.showToast("关闭失败！该用户下级日结未关闭");
        }
        else if(data.Data.OrderState==-5)
        {
            toastUtils.showToast("设置失败！您的日结已被关闭");
        }
        else if(data.Data.OrderState==-3)
        {
            toastUtils.showToast("日结比例超过直属上级");
        }
        else if(data.Data.OrderState==-4)
        {
            toastUtils.showToast("日结比例超过最低比例");
        }else {
        	toastUtils.showToast("设置失败");
        }
    }else{
	    toastUtils.showToast(data.Msg);
	}
}

/*当设置成功后，更新页面显示数据*/
function showSucceedData(data) {
	if(data.Code == 200){
	    //直属下级日结比例
	    subordinateBili = bigNumberUtil.multiply(data.Data.LowerLevelSettlementRatio,100).toString()+' %';
	    $("#subordinateBili").html(subordinateBili);
	    localStorageUtils.removeParam("subordinateBili");
	    localStorageUtils.setParam("subordinateBili",data.Data.LowerLevelSettlementRatio);
	    ////日结开关状态
	    localStorageUtils.removeParam("dailywagesState");
	    localStorageUtils.setParam("dailywagesState",data.Data.LowerLevelState);
	    if (data.Data.LowerLevelState=="1"){
	        $("#dailywagesState").html("开启");
	    }
	    if (data.Data.LowerLevelState=="0"){
	        $("#dailywagesState").html("关闭");
	    }
	    $("#changeBili").empty();
	    setProxyBili(bigNumberUtil.multiply(data.Data.LowerLevelSettlementRatio,100).toString(),bigNumberUtil.multiply(data.Data.MySettlementRatio,100).toString());
	}else{
	    toastUtils.showToast(data.Msg);
	}
}
