
'use strict';
//用户名
var userName = "";
var myUserID;
var securityState;
var modifiedSecurity = [];

//@ 进入页面加载
function setSecurityLoadedPanel(){
  catchErrorFun("setSecurityInit();");
}

//@ 页面离开时加载
function setSecurityUnloadedPanel(){
	modifiedSecurity = [];
	$("#security_Q1").empty();
	$("#security_Q2").empty();
	$("#security_A1").val('');
	$("#security_A2").val('');
}
var QuestionArr
//@ 初始化
function setSecurityInit(){
    userName = localStorageUtils.getParam("username");
	myUserID = localStorageUtils.getParam("myUserID");
	// 密保设置  ( 1：已设置; 0：未设置 )
    securityState = parseInt(localStorageUtils.getParam("securityState"));

	var param = '{"ProjectPublic_PlatformCode":2,"UserID":' + myUserID + ',"InterfaceName":"/api/v1/netweb/GetSecurityQuestion"}';
	ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
		if (data.Code == 200) {
			QuestionArr = data.Data.SecurityQuestionModels;
			$("#security_Q1").append('<option value="Question_Default">请选择密保问题</option>');
			$("#security_Q2").append('<option value="Question_Default">请选择密保问题</option>');
			for (var i = 0; i< QuestionArr.length; i++){
				$("#security_Q1").append("<option value='Q1_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
				$("#security_Q2").append("<option value='Q2_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
			}

			if (securityState){
				var paramInit = '{"ProjectPublic_PlatformCode":2,"UserID":' + myUserID + ',"FlagType":1,"InterfaceName":"/api/v1/netweb/InitSecurityData"}';
				ajaxUtil.ajaxByAsyncPost1(null, paramInit, function (data) {
					if (data.Code == 200) {
						var QuestionInitArr = data.Data.SecurityQuestionAnswerModels;
						for (var k = 0;k < QuestionInitArr.length; k++){
							modifiedSecurity.push({'ID':QuestionInitArr[k].ID,'Answer':QuestionInitArr[k].Answer,"KeyID":QuestionInitArr[k].KeyID})
						}
//						$("#security_Q1").val("Q1_" + modifiedSecurity[0].ID);
//						$("#security_Q2").val("Q2_" + modifiedSecurity[1].ID);
//						$("#security_A1").val(modifiedSecurity[0].Answer);
//						$("#security_A2").val(modifiedSecurity[1].Answer);
						
						//去除重复问题
						$("#security_Q1").empty();
						$("#security_Q2").empty();
						$("#security_Q1").append('<option value="Question_Default">请选择密保问题</option>');
						$("#security_Q2").append('<option value="Question_Default">请选择密保问题</option>');
						for (var i = 0; i< QuestionArr.length; i++){
							if(QuestionArr[i].ID != modifiedSecurity[1].ID){
								$("#security_Q1").append("<option value='Q1_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
							}
							if(QuestionArr[i].ID != modifiedSecurity[0].ID){
								$("#security_Q2").append("<option value='Q2_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
							}
						}
						
						//设置选中
						$("#security_Q1").val("Q1_" + modifiedSecurity[0].ID);
						$("#security_Q2").val("Q2_" + modifiedSecurity[1].ID);
						$("#security_A1").val(modifiedSecurity[0].Answer);
						$("#security_A2").val(modifiedSecurity[1].Answer);
						
					}
				},null);
			}else {
				$("#security_Q1").val('Question_Default');
				$("#security_Q2").val('Question_Default');
				$("#security_A1").val('');
				$("#security_A2").val('');
			}
		} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
			toastUtils.showToast("请重新登录");
			loginAgain();
		} else {
			toastUtils.showToast(data.Msg);
		}
	},null);

	// 重置
	$("#security_reset").off('click');
	$("#security_reset").on('click', function(){
		$("#security_Q1").empty();
		$("#security_Q2").empty();
		$("#security_Q1").append('<option value="Question_Default">请选择密保问题</option>');
		$("#security_Q2").append('<option value="Question_Default">请选择密保问题</option>');
		for (var i = 0; i< QuestionArr.length; i++){
			$("#security_Q1").append("<option value='Q1_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
			$("#security_Q2").append("<option value='Q2_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
		}
			
		$('#security_Q1').prop('selectedIndex', 0);
		$("#security_A1").val('');

		$('#security_Q2').prop('selectedIndex', 0);
		$("#security_A2").val('');
	});
	
	// 下一步
	$("#security_next").off('click');
	$("#security_next").on('click', function(){
		var Q1_select = $("#security_Q1").find("option:selected").text(),
			Q2_select = $("#security_Q2").find("option:selected").text(),
			Q1_value = $("#security_Q1").val().split("_")[1],
			Q2_value = $("#security_Q2").val().split("_")[1],
			A1_select = $("#security_A1").val(),
			A2_select = $("#security_A2").val();

		if ($("#security_Q1").val() == "Question_Default" || $("#security_Q2").val() == "Question_Default" ){
			toastUtils.showToast("请选择密保问题");
			return;
		}
		if (Q1_select == Q2_select){
			toastUtils.showToast("两个问题不可重复");
			return;
		}
		if (getStrLength_EnCn(A1_select) < 4 || getStrLength_EnCn(A1_select) > 20 || getStrLength_EnCn(A2_select) < 4 || getStrLength_EnCn(A2_select) > 20){
			toastUtils.showToast("答案为 4-20 个字符");
			return;
		}

		var message = '<p>'+ Q1_select +'</p><p>'+ A1_select +'</p><p>'+ Q2_select +'</p><p>'+ A2_select +'</p>';
		setTimeout(function () {
			$.ui.popup(
				{
					title:"确认信息",
					message:message,
					cancelText:"上一步",
					cancelCallback:
						function(){
						},
					doneText:"确定",
					doneCallback:
						function(){
							if (securityState){
								var questionModel_modify = jsonUtils.toString([{"ID":Q1_value,"Question":A1_select,"KeyID":modifiedSecurity[0].KeyID},{"ID":Q2_value,"Question":A2_select,"KeyID":modifiedSecurity[1].KeyID}]);

								var param = '{"ProjectPublic_PlatformCode":2,"UserID":' + myUserID + ',"UserName":"' + userName + '","SecurityQuestionModels":'+ questionModel_modify +',"InterfaceName":"/api/v1/netweb/UserSecurityQuestionEdit"}';
								ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
									if (data.Code == 200) {
										if (data.Data.Result){
											toastUtils.showToast("修改成功");
											setPanelBackPage_Fun("personalInfo");
										}else {
											toastUtils.showToast("修改失败");
										}
									} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
										toastUtils.showToast("请重新登录");
										loginAgain();
									} else {
										toastUtils.showToast(data.Msg);
									}
								},null);
							}else{
								var questionModel_add = jsonUtils.toString([{"ID":Q1_value,"Question":A1_select},{"ID":Q2_value,"Question":A2_select}]);

								var param = '{"ProjectPublic_PlatformCode":2,"UserID":' + myUserID + ',"UserName":"' + userName + '","SecurityQuestionModels":'+ questionModel_add +',"InterfaceName":"/api/v1/netweb/UserSecurityQuestionAdd"}';
								ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
									if (data.Code == 200) {
										if (data.Data.Result){
											toastUtils.showToast("设置成功");
											
//											if(localStorageUtils.getParam("intoType") == "myPersonalCenter_chongzhi" || localStorageUtils.getParam("intoType") == "myPersonalCenter_tikuan"){
//												//从充值提款进入的完善信息
												
												createInitPanel_Fun('myLottery');
												//跳转验证资金密码
												CheckGetSecurityPromptingState();
//											}else{
//												setPanelBackPage_Fun("modifyBankPassword");  //密保界面去设置的话，设置完让其跳入设置资金密码页面
//											}
										}else {
											toastUtils.showToast("设置失败");
										}
									} else if ($.inArray(data.Code,[401,402,403,404,405,423]) != -1 ) {
										toastUtils.showToast("请重新登录");
										loginAgain();
									} else {
										toastUtils.showToast(data.Msg);
									}
								},null);
							}
						},
					cancelOnly:false
				});
		},300);
	});
}

//			$("#security_Q1").append('<option value="Question_Default">请选择密保问题</option>');
//			$("#security_Q2").append('<option value="Question_Default">请选择密保问题</option>');
//			for (var i = 0; i< QuestionArr.length; i++){
//				$("#security_Q1").append("<option value='Q1_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
//				$("#security_Q2").append("<option value='Q2_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
//			}
			
function changeSecurityQue(element) {
	var security_Q1_value = $("#security_Q1").val();
	var security_Q2_value = $("#security_Q2").val();
	
	if (element.id == "security_Q1"){
		$("#security_A1").val('');
		//重新构建
		if($("#security_Q1").val() != "Question_Default"){
			$("#security_Q2").empty();
			$("#security_Q2").append('<option value="Question_Default">请选择密保问题</option>');
			for (var i = 0; i< QuestionArr.length; i++){
				if(QuestionArr[i].ID != $("#security_Q1").val().split("_")[1]){
					$("#security_Q2").append("<option value='Q2_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
				}
			}
			//设置选中   
			if(security_Q2_value.split("_")[1] == $("#security_Q1").val().split("_")[1]){//已经设置过密保要修改的话  一进来就会默认选择之前的问题   所以切换问题的时候如果选择的和另外一个问题一样  那就另外一个变成请选择
				$("#security_Q2").val("Question_Default");
			}else{
				$("#security_Q2").val(security_Q2_value);
			}
		}else{
			var now_index = $("#security_Q2").val();
			$("#security_Q2").empty();
			$("#security_Q2").append('<option value="Question_Default">请选择密保问题</option>');
			for (var i = 0; i< QuestionArr.length; i++){
				$("#security_Q2").append("<option value='Q2_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
			}
			$("#security_Q2").val(now_index);
		}
		
		
	}else if (element.id == "security_Q2"){
		$("#security_A2").val('');
		//重新构建
		if($("#security_Q2").val() != "Question_Default"){
			$("#security_Q1").empty();
			$("#security_Q1").append('<option value="Question_Default">请选择密保问题</option>');
			for (var i = 0; i< QuestionArr.length; i++){
				if(QuestionArr[i].ID != $("#security_Q2").val().split("_")[1]){
					$("#security_Q1").append("<option value='Q1_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
				}
			}
		//设置选中   
			if(security_Q1_value.split("_")[1] == $("#security_Q2").val().split("_")[1]){//已经设置过密保要修改的话  一进来就会默认选择之前的问题   所以切换问题的时候如果选择的和另外一个问题一样  那就另外一个变成请选择
				$("#security_Q1").val("Question_Default");
			}else{
				$("#security_Q1").val(security_Q1_value);
			}
		}else{
			var now_index = $("#security_Q1").val();
			$("#security_Q1").empty();
			$("#security_Q1").append('<option value="Question_Default">请选择密保问题</option>');
			for (var i = 0; i< QuestionArr.length; i++){
				$("#security_Q1").append("<option value='Q1_"+ QuestionArr[i].ID +"'>"+ QuestionArr[i].Question +"</option>");
			}
			$("#security_Q1").val(now_index);
		}	
	}
}


