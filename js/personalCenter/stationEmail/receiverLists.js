'use strict';

//@ 进入页面时
function receiverListsLoadedPanel() {
    catchErrorFun("receiverLists_init();");
}
//@ 离开页面时
function receiverListsUnloadedPanel() {
    $("#selectUpper").empty();
    $("#selectSubUser").empty();
}
var receiverId;

//@ 入口函数
function receiverLists_init() {
    var myUserID = localStorageUtils.getParam("myUserID");
    var userLevel = localStorageUtils.getParam("userLevel");
    receiverId=localStorageUtils.getParam("receiverId");  //收件箱回复被选中的id
    getUpper(userLevel);  //上级
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetSubUserName","UserID":'+ myUserID +'}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getSubName,null);  //下级

    //click submit Button
    $("#addReceiver").off('click');
    $("#addReceiver").on('click',function (e) {
        var checkedArr = new Array();
        $(".receiverLists input[name='receiver']:checked").each(function () {
            var checkedPerson = {};
            checkedPerson.name = $(this).next().html();
            checkedPerson.id = $(this).val();
            checkedArr.push(checkedPerson);
        });
        localStorageUtils.setParam("checkedPerson",jsonUtils.toString(checkedArr));
        setPanelBackPage_Fun('sendEmail');
        localStorageUtils.removeParam("receiverId");
    });
}

//@ Upper
function getUpper(userLevel) {
    if (userLevel == "1"){ //无上级
        $("#selectUpper").hide();
    }else{
        $("#selectUpper").show();
        $("#selectUpper").append('<p style="border-bottom: 1px solid #cacece;padding: 0 0 8px 10px;font-size:16px;">我的上级：</p>');
        if (receiverId && receiverId != "undefined"){
            if (typeof(receiverId)=="string"){
                receiverId = receiverId.split(",");
            }
            if ($.inArray('-1',receiverId) == -1){  //Unchecked
                $("#selectUpper").append('<ul><li><input type="checkbox" class="checkRcer" name="receiver" id="toShangJi" value="-1"/><label for="toShangJi" class="selectReceiver">上级</label></li></ul>');
            }else{  //Checked
                $("#selectUpper").append('<ul><li><input type="checkbox" class="checkRcer" checked="checked" name="receiver" id="toShangJi" value="-1"/><label for="toShangJi" class="selectReceiver">上级</label></li></ul>');
            }
        }else{
            $("#selectUpper").append('<ul><li><input type="checkbox" class="checkRcer" name="receiver" id="toShangJi" value="-1"/><label for="toShangJi" class="selectReceiver">上级</label></li></ul>');
        }
    }
}

//@ Subordinate
function getSubName(data) {
	if (data.Code == 200) {
		var subArray = data.Data.UserModels;
        if (subArray.length > 0){
            $("#selectSubUser").show();
            var $ul = $('<ul class="mylist"></ul>');
            $.each(subArray,function (key,val) {
                if (receiverId && receiverId != "undefined"){
                    if (typeof(receiverId)=="string"){
                        receiverId = receiverId.split(",");
                    }
                    if($.inArray(val.User_ID+'',receiverId) == -1){  //Unchecked
                        $subLi = $('<li><input type="checkbox" class="checkRcer" name="receiver" value="'+val.User_ID+'" id="toSub_'+ val.User_ID +'"><label class="selectReceiver" for="toSub_'+ val.User_ID +'">'+ val.ChildUserName +'</label></li>');
                    }else{  //Checked
                        var $subLi = $('<li><input type="checkbox" checked="checked" class="checkRcer" name="receiver" value="'+val.User_ID+'" id="toSub_'+ val.User_ID +'"><label class="selectReceiver" for="toSub_'+ val.User_ID +'">'+ val.ChildUserName +'</label></li>');
                    }
                    $ul.append($subLi);
                }else{
                   var $subLi = $('<li><input type="checkbox" class="checkRcer" name="receiver" value="'+val.User_ID+'" id="toSub_'+ val.User_ID +'"><label class="selectReceiver" for="toSub_'+ val.User_ID +'">'+ val.ChildUserName +'</label></li>');
                    $ul.append($subLi);
                }
            });
            $("#selectSubUser").append('<p style="border-bottom: 1px solid #cacece;padding: 0 0 8px 10px;font-size:16px;">我的下级：</p>');
            $("#selectSubUser").append($ul);
            $("#selectSubUser").append('<p style="border-top:1px solid #cacece; padding:6px 0 8px 0"><input type="checkbox" id="checkAll"/><label for="checkAll">全选</label></p>');

        }else{
            $("#selectSubUser").hide();
        }
        checkAll();
	} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
		toastUtils.showToast("请重新登录");
		loginAgain();
	} else {
		toastUtils.showToast(data.Msg);
	}
}
// 全选，全不选，绑定点击事件。
function checkAll() {
    var checkAll = $("#checkAll");
    var jq_check = $('#checkAll').parent();
    var jq_items = $('.receiverLists input[name="receiver"]');
    var rows = $('.receiverLists li');
    checkAll.prop('checked', jq_items.size() == jq_items.filter(':checked').size());
    jq_check.on('click',function(){
        if ($("#checkAll").prop('checked')){
            jq_items.each(function(){
                $(this).prop("checked",false);
                jq_check.prop("checked",false);
            });
        }else{
            jq_items.each(function(){
                $(this).prop("checked",true);
                jq_check.prop("checked",true);
            });
        }
    });

    jq_check.bind({
         click: function(){
         $(this).prop('checked',$(this).prop('checked'));
         }
     });
    //全选与全不选一体显示
    jq_check.click(function(){
        jq_items.add(checkAll).prop('checked',this.checked);
    });

    //选框的点击事件
    rows.bind({
        mouseenter: function(){
            $(this).addClass('hover');
        },
        mouseleave: function(){
            $(this).removeClass('hover');
        },
        //点选
        click: function(){
            //行内点击时,行内的选框状态为原状态取反
            $(this).find(':checkbox').prop('checked', !$(this).find(':checkbox').get(0).checked);
            //判断选中个数与实际个数是否相同,以确定全选/全不选状态
            checkAll.prop('checked', jq_items.size() == jq_items.filter(':checked').size());
        }
    });
}