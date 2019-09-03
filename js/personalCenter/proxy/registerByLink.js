
/* 链接注册 */

/*@ 进入panel时调用*/
function registerByLinkLoadedPanel(){
	catchErrorFun("registerByLinkInit();");

}
/*@ 离开panel时调用*/
function registerByLinkUnloadedPanel(){
    $("#showLinks").empty();
}
/*@ 入口函数*/
function registerByLinkInit(){
    getRegisterUrlList();
}

//@ 获取用户链接列表请求
function getRegisterUrlList() {
    //通过接口获取数据
    myUserID = Number(localStorageUtils.getParam("myUserID"));
    var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/GetUserRegistUrlList","UserID":"'+myUserID+'"}';
    ajaxUtil.ajaxByAsyncPost1(null, param, getRegistUrlListCallBack,'正在加载数据...');
}

//@ 获取用户链接列表返回数据
function getRegistUrlListCallBack(data) {
    //返回正常数据
    if (data.Code == 200 ){
        var RegistUrlList = data.Data.UserRegistUrlList;
        if (RegistUrlList.length > 0){
        //页面显示
            $("#noLink").hide();
            $("#hasLink").show();

	        //链接最大10条，大于10后不可添加
	        $("#addNewLink").off('click');
	        $("#addNewLink").on('click',function(){
	            if(RegistUrlList.length < 10){
	                setPanelBackPage_Fun('registerByLinkDetails');
	            } else{
	                toastUtils.showToast('注册链接最多可以添加10条，请先处理闲置链接!');
	            }
	        });
	
	        //列表生成
	        for(var i=RegistUrlList.length-1; i>=0; i--) {
	            var val = RegistUrlList[i];
	            var list = "";
	            list += '<li>用户类型：<span>'+ showUserType(val.UserType) +'</span><br>';
	            list += '注册返点：<span>'+ val.Rebate +'</span><br>';
	            // list += '团队名称：<span>'+ val.TeamName +'</span><br>';
	            // list += ' QQ ：<span>'+ val.QQ +'</span><br>';
	            list += '生成时间：<span>'+ val.CreateTime +'</span><br>';
	            list += '注册人数：<span>'+ val.RegisteredNum +'</span><br>';
	            if (val.Status == 1){
	                list += '注册地址：<span style="font-size: 13px;" class="redtext"> (长按复制)</span><textarea readonly cols="40" rows="2" style="width:100%;color:#3583fd;font-size:17px;padding:10px 0 0 5px; border: 1px solid #cccccc;margin-bottom:10px;">'+ getShortLink(val.RegistUrl) +'</textarea>';
	                list += '<p style="text-align: right;margin:0;"><button onclick="changeLinkStatus('+val.ID+','+val.Status+')">关闭链接</button><button onclick="deleteLink('+val.ID+')">删 除</button></p>';
	            }else{
	                list += '<p style="text-align: right;margin:0;"><button style="background-color: #FE5D39;border-color:#FE5D39;" onclick="changeLinkStatus('+val.ID+','+val.Status+')">开启链接</button><button onclick="deleteLink('+val.ID+')">删 除</button></p>';
	            }
	            list += '</li>';
	           $("#showLinks").append(list);
	       }
	    }else{
            $("#hasLink").hide();
	        $("#noLink").show();
	        $("#addNewLink").off('click');
	        $("#addNewLink").on('click',function(){
	            setPanelBackPage_Fun('registerByLinkDetails');
	        });
        }
    }else{
        toastUtils.showToast(data.Msg);
    }
}

//@ 获取短链接
function getShortLink(longUrl) {
	//注册链接域名在后台配置的域名中  随机一个，前台直接显示
	return longUrl;
	
//  var shortUrl = "";
//  $.ajax({
//      type : "post",
//      url : "/agentCenter/getShortLink",
//      data : {"urlCode":longUrl},
//      async : false,  //同步获取数据
//      success : function(data){
//          shortUrl = data;
//      }
//  });
//  return shortUrl;
}

//@ 用户类型转换
function showUserType(type) {
    switch (type){
        case 1:
            return "代理";  break;
        case 2:
            return "会员";  break;
        default:
            break;
    }
}

//@ 关闭或开启链接 [被点击的按钮，当前链接的自增ID，当前链接的状态]
function changeLinkStatus(ID,status) {
    if (status == 1){ //关闭链接
        $.ui.popup(
            {
                title:"提示：",
                message:'您确定关闭此链接吗？<br>关闭期间将无法注册下级！',
                cancelText:"取消",
                cancelCallback:
                    function(){
                    },
                doneText:"确定",
                doneCallback:
                    function(){
                        status = 0;
                        var paramOpen = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ModifyUserRegistUrl","ID":"'+ ID +'","Status":'+ status +'}';
                        ajaxUtil.ajaxByAsyncPost1(null, paramOpen, function (data) {
                            if (data.Code == 200){
                                if (data.Data.CompleteStatus){
                                    // 更新列表
                                    $("#showLinks").empty();
                                    getRegisterUrlList();
                                    toastUtils.showToast("链接关闭成功");
                                }else if(!data.Data.CompleteStatus){
                                    toastUtils.showToast("链接关闭失败,请稍后再试");
                                }
                            }else{
                                toastUtils.showToast(data.Msg);
                            }
                        },'正在加载数据...');
                    },
                cancelOnly:false
            });
    }else if (status == 0){ //开启链接
        status = 1;
        var paramOpen = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ModifyUserRegistUrl","ID":"'+ ID +'","Status":'+ status +'}';
        ajaxUtil.ajaxByAsyncPost1(null, paramOpen, function (data) {
            if (data.Code == 200){
                if (data.Data.CompleteStatus){
                    // 更新列表
                    $("#showLinks").empty();
                    getRegisterUrlList();
                    toastUtils.showToast("链接开启成功");
                }else if(!data.Data.CompleteStatus){
                    toastUtils.showToast("链接开启失败,请稍后再试");
                }
            }else{
                toastUtils.showToast(data.Msg);
            }
        },'正在加载数据...');
    }
}

//@ 删除当前链接 [被点击的按钮，当前链接的自增ID]
function deleteLink(ID) {
    $.ui.popup(
        {
            title:"提示：",
            message:'您确定删除此链接吗？<br>删除后将无法注册下级！',
            cancelText:"取消",
            cancelCallback:
                function(){
                },
            doneText:"确定",
            doneCallback:
                function(){
                    var paramDelete = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/DeleteUserRegistUrl","ID":"'+ ID +'"}';
                    ajaxUtil.ajaxByAsyncPost1(null, paramDelete, function (data) {
                        if (data.Code == 200){
                            if (data.Data.CompleteStatus){
                                // 更新列表
                                $("#showLinks").empty();
                                getRegisterUrlList();
                                toastUtils.showToast("链接删除成功");
                            }else if(!data.Data.CompleteStatus){
                                toastUtils.showToast("链接删除失败,请稍后再试");
                            }
                        }else{
                            toastUtils.showToast(data.Msg);
                        }
                    },'正在加载数据...');
                },
            cancelOnly:false
        });
}


