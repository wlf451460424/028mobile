//@ Load
function searchSendPersonLoadedPanel() {
	catchErrorFun("searchSendPerson_init()");
}

//@ Unload
function searchSendPersonUnloadedPanel() {
	$("#redPak_agentList").empty();
	$("#redPak_agentList").hide();
	$("#save_selected_info").val("");
	$("#redPak_inputName").val("");
}

var save_selected_info="";
var isTeam = 1;  //1 团队,0 直属
var now_sub_info = [];

//@ Init
function searchSendPerson_init() {
	$("#redPak_agentList").empty();
	$("#redPak_agentList").hide();
	$("#save_selected_info").val("");
	$("#redPak_inputName").val("");

	//类型  默认进来选择的是团队
	search_chooseSendType(1);
}

//初始化下拉框
function initSearchInput(data) {
	//滚动条
	var myScroller = $("#list_scoller").scroller({
		verticalScroll : true,
		horizontalScroll : false,
		vScrollCSS: "afScrollbar",
		autoEnable : true
	});
	myScroller.scrollToTop();
	myScroller.clearInfinite();
	//列表
	$("#redPak_agentList").empty();
	$("#redPak_agentList").show();
	for(var i=0;i<data.length;i++){
		var $cityList_item = $('<div id='+ data[i].UserId +'_'+ data[i].UserName +'> '+ data[i].UserName +'</div>');
		$("#redPak_agentList").append($cityList_item);
	}

    //给下拉箭头绑定点击事件  点击下拉箭头显示/隐藏对应的列表
    //输入框的类名为selectInput
    //下拉箭头的类名为picture_click、dropDowns
    //下拉列表的类名为selectList
    for(var i = 0; i < $('.picture_click').length; i++) {
         $('.picture_click').eq(i).click(function(){
             $(this).parent().find('.selectList').toggle();
         })
    }
    //为列表中的每一项绑定鼠标经过事件
    $('.selectList div').mouseenter(function(){
        $(this).css("background", "#eee").siblings().css("background", "");
    });
    //为列表中的每一项绑定单击事件
    $('.selectList div').click(function(){
        //文本框为选中项的值
//      $(this).parent().parent().parent().find('.selectInput').val($(this).html());
        $('#redPak_inputName').val($(this).html());
        //保存选择的信息；
        save_selected_info = $(this)[0].id;
        //下拉框隐藏
        $(this).parent().hide();
    });        

    //点击下拉框外部的时候使下拉框隐藏
    var dropDowns = document.getElementsByClassName('dropDowns');
    var selectList = document.getElementsByClassName('selectList');
    document.body.onclick = function(e){
        e = e || window.event;
        var target = e.target || e.srcElement;
        for(var i = 0; i < dropDowns.length; i++) {
            if(target != dropDowns[i] && target != selectList[i]){
                selectList[i].style.display = 'none';
            }
        }
    }
}

function fuzzySearch(e) {
    var that = this;
    //获取列表的ID
    var listId = $(this).attr("list");
    //列表
    var list = $('#' + listId + ' div');
    //列表项数组  包列表项的id、内容、元素
    var listArr = [];
    //遍历列表，将列表信息存入listArr中
    $.each(list, function(index, item){
        var obj = {'eleId': item.getAttribute('id'), 'eleName': item.innerHTML, 'ele': item};
        listArr.push(obj);
    });
    
    //current用来记录当前元素的索引值
    var current = 0;
    //showList为列表中和所输入的字符串匹配的项
    var showList = [];
    //为文本框绑定键盘引起事件
    $(this).keyup(function(e){
        //如果输入空格自动删除
        this.value=this.value.replace(/\s+/g,'');
        //列表框显示
        $('#' + listId).show();

        //文本框中输入的字符串
        var searchVal = $(that).val();
        showList = [];
        //将和所输入的字符串匹配的项存入showList
        //将匹配项显示，不匹配项隐藏
        $.each(listArr, function(index, item){
            if(item.eleName.indexOf(searchVal) != -1) {
                item.ele.style.display = "block";
                showList.push(item.ele);
            }else {
                item.ele.style.display = 'none';
            }
        });
    })
}

function name_onchange_handler(e) {
	//保存选择的信息；
    save_selected_info =  $('#redPak_inputName').val();
}

var isHave = false;
var isHave_objInfo;
function search_subCommit(){
	if(save_selected_info != ""){
		var sace_info = save_selected_info.split("_");
		if(sace_info.length < 2){
			for(var i=0;i<now_sub_info.length;i++){
		    	if(save_selected_info == now_sub_info[i].UserName){
					isHave_objInfo = now_sub_info[i].UserId + "_" + now_sub_info[i].UserName;
					isHave = true;
		    	}
		    }
			
			if(isHave){//输入的用户存在；
				save_selected_info = isHave_objInfo;
				sace_info = [];
				sace_info = save_selected_info.split("_");
	    		sace_info.splice(0, 0, selectTypeId);
				localStorageUtils.setParam("redPacket_ObjectArr",jsonUtils.toString(sace_info));
			}else{
				toastUtils.showToast("此用户不存在");
				return;
			}
			
		}else{
			sace_info.splice(0, 0, selectTypeId);
			localStorageUtils.setParam("redPacket_ObjectArr",jsonUtils.toString(sace_info));
		}
		
	}else {
		toastUtils.showToast("您没有选择联系人");
		return;
	}
	setPanelBackPage_Fun('sendRedPacket');
	save_selected_info = "";
}

var selectTypeId = 1;
//@ 切换发送对象类型
function search_chooseSendType(id){
	$("#redPak_inputName").val("");
	
    $('#search_wholeId').removeClass('checkBoxA').removeClass('checkBox');
    $('#search_directId').removeClass('checkBoxA').removeClass('checkBox');
    $('#search_singleId').removeClass('checkBoxA').removeClass('checkBox');

    selectTypeId = id;
	if(id == 1){    
	    $('#search_wholeId').addClass('checkBoxA');
	    $('#search_directId').addClass('checkBox');
	    $('#search_singleId').addClass('checkBox');
	    $("#redPak_showTypeTip_search").text("发给所选人的整个团队");
	    
	    isTeam = 1;
	}else if(id == 2){    
	    $('#search_directId').addClass('checkBoxA');
	    $('#search_wholeId').addClass('checkBox');
	    $('#search_singleId').addClass('checkBox');
		$("#redPak_showTypeTip_search").text("发给所选人的直属下级");
		
		isTeam = 0;
	}else if(id == 3){
	  	$('#search_singleId').addClass('checkBoxA');
	    $('#search_directId').addClass('checkBox');
	    $('#search_wholeId').addClass('checkBox');
		$("#redPak_showTypeTip_search").text("发给所选人");
		
		isTeam = 1;
	}
	
	var parameters = '{"InterfaceName":"/api/v1/netweb/redPacket_getAgentTree","ProjectPublic_PlatformCode":2,"IsTeam":'+ isTeam +'}';
	ajaxUtil.ajaxByAsyncPost(null, parameters,function (data) {
		if(data.Code == 200){
			if(data.Data.UserList.length <1)return;
			//初始化下拉框
			now_sub_info = data.Data.UserList;
			if(selectTypeId == 3){//类型为单个人的时候，不包含自己。
				now_sub_info.shift();
			}
			if(selectTypeId == 2){//类型为直属下级的时候，不包含会员。
				var newArr = [];
				for(var i=0;i<now_sub_info.length;i++){
					if(now_sub_info[i].IsAgent){
						newArr.push(now_sub_info[i]);
					}
				}
				now_sub_info = [];
				now_sub_info = newArr;
			}
    		initSearchInput(now_sub_info);
		}else if($.inArray(data.Code,[401,402,403,404,405,423]) > -1) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		}else {
			var msg = data.Msg || "未获取到数据";
			toastUtils.showToast(msg);
		}
	} ,null);
}