var selectTypeId = "1";
var selectUserId = "";
var selectUserName = "";

var myUserId = "";
var myUserName = "";
var myRebate = "";

var obj_data;
var redPacket_nav_horScroller;
var redPak_listScroller;

/*进入panel时调用*/
function chooseSendPersonLoadedPanel() {
	catchErrorFun("chooseSendPerson_init();");
}

/*离开panel时调用*/
function chooseSendPersonUnloadedPanel() {
	$('#wholeId').removeClass('checkBoxA').removeClass('checkBox');
    $('#directId').removeClass('checkBoxA').removeClass('checkBox');
    $('#singleId').removeClass('checkBoxA').removeClass('checkBox');
    
    selectTypeId = "1";
}

//@ Init
function chooseSendPerson_init() {
	
	myUserId = localStorageUtils.getParam("myUserID");
	myUserName = localStorageUtils.getParam("username");
	myRebate = localStorageUtils.getParam("MYRebate");
	
	obj_data = {
		"ChildUserName":myUserName,
		"User_ID":myUserId,
		"Rebate":myRebate,
		"LevelNum":0
	};
	
	//清空记录；
	redPacket_ObjectArr = [];

	$("#selectType").append('<input type="radio" checked="checked" name="Sex" value="0"/><label >整个团队');
	$("#selectType").append('<input type="radio" name="Sex" value="1"/><label >直属下级');
	$("#selectType").append('<input type="radio" name="Sex" value="2"/><label >单个人');
	
    $('#wholeId').addClass('checkBoxA');
    $('#directId').addClass('checkBox');
    $('#singleId').addClass('checkBox');

	$("#redPak_showTypeTip").text("发给所选人的整个团队");

	$("#navigationLabel").empty();
	$("#nowName").empty();
	//导航
	var $navigationLabel_Li = $('<span id='+myUserId+'>'+ myUserName +'</span>');
	$("#navigationLabel").append($navigationLabel_Li);
	//列表 当前顶级代理
	$("#nowName").html(myUserName);
//  //id 查询下级代理树
    Id_GetAgentTreeInfo(myUserId);

	//纵向滑动查看下级列表
	redPak_listScroller =  $("#redPakSubListScroller").scroller({
		verticalScroll : true,
		horizontalScroll : false,
		vScrollCSS: "afScrollbar",
		autoEnable : true
	});
	redPak_listScroller.scrollToTop();
	redPak_listScroller.clearInfinite();
	
	//导航条横向滑动
	//【iScroll】参考文档：http://wiki.jikexueyuan.com/project/iscroll-5/
	redPacket_nav_horScroller =  $("#redPacket_nav_scroller").scroller({
		verticalScroll : false,
		horizontalScroll : true,
		vScrollCSS: "afScrollbar",
		autoEnable : true,
		click:true
	});
	redPacket_nav_horScroller.scrollToTop();
	redPacket_nav_horScroller.clearInfinite();
}

// id 查询下级代理树；
function Id_GetAgentTreeInfo(userId){
	$("#SubordinateList").empty();
	
	var div = document.getElementById("SubordinateList");
    while(div.hasChildNodes()) //当div下还存在子节点时 循环继续
    {
        div.removeChild(div.firstChild);
    }

	var param='{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetAgentTreeInfo","UserID":"'+userId+'"}';
	ajaxUtil.ajaxByAsyncPost(null,param,GetAgentTreeInfo_CallBack,null);
}

function GetAgentTreeInfo_CallBack(data) {
    if (data.Code == 200){
    	$("#SubordinateList").empty();
        var list = data.Data.GetUserModel;

	    // Whole Team，可选自身
        if(selectTypeId == 1){
       		list.splice(0, 0, obj_data); 
        }

        if (list.length > 0){
	        if( selectTypeId == 2 ){ //直属下级当有下级列表时，增加自身
		        list.splice(0, 0, obj_data);
	        }

	        $.each(list,function (key,val) {
	        	var $obj_Li;
	        	if(val.LevelNum > 0 && selectTypeId == 3){  //单个人，有下级，样式不同
			        $obj_Li = $('<li id='+ val.ChildUserName + "_" + val.User_ID + "_" + val.LevelNum +'><span>'+ val.ChildUserName + " (" + val.Rebate + ")" +'</span><span class="btnRight"></span></li>');
		        }else{
			        if( selectTypeId == 2 && (val.Category & 64)==64){  //直属下级过滤掉会员
				        return;
			        }
//			        if(  selectTypeId == 2 && key != 0 && val.LevelNum < 1){
//			        	return;
//			        }
			        $obj_Li = $('<li id='+ val.ChildUserName + "_" + val.User_ID + "_" + val.LevelNum +'><span>'+ val.ChildUserName + " (" + val.Rebate + ")" +'</span></li>');
		        }

	            //点击进入详情页
	            $obj_Li.on('click',function () {
			        $(this).siblings('li').removeClass('SubordinateList_li_selected');  // 删除其他兄弟元素的样式
			        $(this).addClass('SubordinateList_li_selected');           // 添加当前元素的样式
					getSerachSubordinate($(this).context.id);
					selectUserId = val.User_ID;
					selectUserName = val.ChildUserName;
	            });
	            $("#SubordinateList").append($obj_Li);
	        });

	        //纵向滑动
	        redPak_listScroller.scrollToTop();
	        redPak_listScroller.clearInfinite();
	        //横向滑动
	        redPacket_nav_horScroller.adjustScroll();
	        redPacket_nav_horScroller.clearInfinite();
        }
    } else {
    	toastUtils.showToast(data.Msg);
    }
}

//查询下级
function getSerachSubordinate(str){
	var once_name = str.split("_")[0];
	var once_id = str.split("_")[1];
	var once_num = str.split("_")[2];
//	if(selectTypeId == 1){//整个团队
//		selectUserId = myUserId;
//		selectUserName = myUserName;
//		if(once_num > 0){
//			var $navigationLabel_Li = $('<span id='+once_id+' style="color: #FE5D39;font-weight:bold">'+ '&nbsp&nbsp>&nbsp&nbsp' + once_name +'</span>');
//			$("#navigationLabel span").removeAttr("style");
//			$("#navigationLabel span").addClass('redPackObject_daohang_span');
//			$("#navigationLabel").append($navigationLabel_Li);
//			$("#nowName").html(once_name);
//			//id 查询下级代理树
//			// Id_GetAgentTreeInfo(once_id);
//		}else{
//			toastUtils.showToast("当前用户无下级团队");
//			return;
//		}
//	}else if(selectTypeId == 1 || selectTypeId == 2){//直属下级
	if(selectTypeId == 1 || selectTypeId == 2){//直属下级
		if($("#navigationLabel span").length >1){
			//toastUtils.showToast("直属下级不可再点击");
			//jquery删除最后一个元素
			$("#navigationLabel span:last").remove();
		}
		
		if($("#navigationLabel span:first")[0].innerHTML == once_name){
			//jquery删除最后一个元素
			$("#navigationLabel span:last").remove();
			//导航
			var $navigationLabel_Li = $('<span id='+once_id+' style="color: #FE5D39;font-weight:bold">'+ once_name +'</span>');
		}else{
			//导航
			var $navigationLabel_Li = $('<span id='+once_id+' style="color: #FE5D39;font-weight:bold">'+ '&nbsp&nbsp>&nbsp&nbsp' + once_name +'</span>');
		}
		
		$("#navigationLabel span").removeAttr("style");
		$("#navigationLabel span").addClass('redPackObject_daohang_span');
		$("#navigationLabel").append($navigationLabel_Li);
		//列表 当前顶级代理
		$("#nowName").html(myUserName);
	}else if(selectTypeId == 3){//单个人
		if(once_num > 0){
			var $navigationLabel_Li = $('<span id='+once_id+' style="color: #FE5D39;font-weight:bold">'+ '&nbsp&nbsp>&nbsp&nbsp' + once_name +'</span>');
			$("#navigationLabel span").removeAttr("style");
			$("#navigationLabel span").addClass('redPackObject_daohang_span');
			$("#navigationLabel").append($navigationLabel_Li);
			$("#nowName").html(once_name);
			//id 查询下级代理树
	    	Id_GetAgentTreeInfo(once_id);

			//纵向滑动
			redPak_listScroller.scrollToTop();
			redPak_listScroller.clearInfinite();
		}
	}
	
	$("#navigationLabel span").click(function (e) {
		var nn = 0;
		for(var i = $("#navigationLabel span").length -1 ;i >0 ; i--){
			if($("#navigationLabel span")[i].innerHTML != $(this).context.innerHTML){
				nn++;
			}else{
				break;
			}
		}
		for(var j=0;j<nn ;j++){
			$("#navigationLabel span:last").remove();
		}
		
		$("#navigationLabel span:last").css('color', '#FE5D39');
		
		if($("#navigationLabel span:first").innerHTML == $(this).context.innerHTML){
			$("#navigationLabel span:last").css('color', '#000000');
			selectUserId = "";
			selectUserName = "";
		}
		
		$("#nowName").html($(this).context.innerHTML);
		//id 查询下级代理树
    	Id_GetAgentTreeInfo($(this).context.id);
    	nn = 0;
	});

	//横向滑动
	redPacket_nav_horScroller.adjustScroll();
	redPacket_nav_horScroller.clearInfinite();
}

//@ 切换发送对象类型
function chooseSendType(id){
    $('#wholeId').removeClass('checkBoxA').removeClass('checkBox');
    $('#directId').removeClass('checkBoxA').removeClass('checkBox');
    $('#singleId').removeClass('checkBoxA').removeClass('checkBox');

    selectTypeId = id;
	if(id == 1){    
	    $('#wholeId').addClass('checkBoxA');
	    $('#directId').addClass('checkBox');
	    $('#singleId').addClass('checkBox');
	    $("#redPak_showTypeTip").text("发给所选人的整个团队");
	}else if(id == 2){    
	    $('#directId').addClass('checkBoxA');
	    $('#wholeId').addClass('checkBox');
	    $('#singleId').addClass('checkBox');
		$("#redPak_showTypeTip").text("发给所选人的直属下级");
	}else if(id == 3){
	  	$('#singleId').addClass('checkBoxA');
	    $('#directId').addClass('checkBox');
	    $('#wholeId').addClass('checkBox');
		$("#redPak_showTypeTip").text("发给所选人");
	}
	
	selectUserId = "";
	selectUserName = "";
    
    $("#navigationLabel").empty();
	$("#nowName").empty();
	//导航
	var $navigationLabel_Li = $('<span id='+myUserId+'>'+ myUserName +'</span>');
	$("#navigationLabel").append($navigationLabel_Li);
	//列表 当前顶级代理
	$("#nowName").html(myUserName);
    //id 查询下级代理树
    Id_GetAgentTreeInfo(myUserId);
}

function subCommit(){
	if(selectUserId == "" || selectUserName == ""){
		toastUtils.showToast("请选择发红包的对象");
		return;
	}
	
	redPacket_ObjectArr.push(selectTypeId);
	redPacket_ObjectArr.push(selectUserId);
	redPacket_ObjectArr.push(selectUserName);

	localStorageUtils.setParam("redPacket_ObjectArr",jsonUtils.toString(redPacket_ObjectArr));
	setPanelBackPage_Fun('sendRedPacket');
	
	//测试代码  看信息；
	var sendData = selectTypeId +"_"+ selectUserId +"_"+ selectUserName;
//	localStorageUtils.setParam("redPack_SendObjectData",sendData);
	console.log(sendData);
	
}

