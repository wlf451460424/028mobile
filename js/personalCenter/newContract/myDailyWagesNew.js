/* 新制度，我的日结契约 */
var myUserName;
var myUserID;

/*进入panel时调用*/
function myDailyWagesNewLoadedPanel(){
    catchErrorFun("myDailyWagesNewInit();");
}

/*离开panel时调用*/
function myDailyWagesNewUnloadedPanel(){
    $("#myDailyWagesScrollerNew").empty();
}

function myDailyWagesNewInit() {
	$("#myDailyWages_selectType").empty();
	var $select=$('<table><tr><td>' +
		'<select name="myDailyWagesType" id="myDailyWagesType" data-theme="a" data-mini="true" onchange="changeMyDailyWagesType()"></select>' +
		'</td></tr></table>');
	$("#myDailyWages_selectType").append($select);

	myUserID = localStorageUtils.getParam("myUserID");
	myUserName = localStorageUtils.getParam("username");
    var queryType = 1;  //类型【1=日结，2=分红、3=私返】
    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/GetSystemMgrType","ProjectPublic_PlatformCode":2,"TypeID":'+ queryType +'}', function (data) {
        if (data.Code == 200){
            var myType = data.Data.SysMgrTypeModel;
            for(var i=0; i < myType.length; i++){
                var $option = $('<option value="'+ myType[i].Id +'">日结类型: '+ myType[i].Name +'</optionv>');
                $("#myDailyWagesType").append($option);
            }
            changeMyDailyWagesType();
        }else {
            toastUtils.showToast(data.Msg);
        }
    }, null);
}

function changeMyDailyWagesType() {
    var typeId = $("#myDailyWagesType").val();
    ajaxUtil.ajaxByAsyncPost1(null,'{"InterfaceName":"/api/v1/netweb/Rule_GetMyInfo","ProjectPublic_PlatformCode":2,"DwTypeId":'+ typeId +',"UserID":'+ myUserID +'}',function (data) {
        if(data.Code == 200){
            var DwRuleList = data.Data.DwRuleList;
            var title = data.Data.GrantRemark || "销量";  //表头文案显示
            showDailyWageRules(DwRuleList,title);
        }else{
	        toastUtils.showToast(data.Msg);
        }
    },null)
}

//@ 加载日结标准_表格显示
function showDailyWageRules(dataList,title) {
	var myDailyWages = dataList[dataList.length-1].DayWageStandard;
    $("#myDailyWagesScrollerNew").empty().append('<p>我的日结：'+ getMyDailyWagesStr(myDailyWages) +'</p>');

    //表头
    var $ul = $('<ul class="recordDetail my-daywage-ctt-three"><li><span> 日结标准 </span><span>'+ title +'</span><span> 活跃人数 </span></li></ul>');
    //表格数据
    if(dataList.length > 0){
        $.each(dataList,function (key,val) {
        	var DaySales = val.DaySales==-999999999?0:val.DaySales;
            var $li_data = $('<li><span>'+ val.DayWageStandard +'</span><span>'+ DaySales +'</span><span>'+ val.ActiveNumber +'</span></li>');
            $ul.append($li_data);
        });
        $("#dailyWageRulesNew").empty().append($ul);
    }
}

//截取我的日结数据
function getMyDailyWagesStr(myDailyWages){
	var index_start = myDailyWages.indexOf("【");
	var index_end = myDailyWages.indexOf("】");
	return result = myDailyWages.substr((index_start+1),(index_end-index_start-1));
}

