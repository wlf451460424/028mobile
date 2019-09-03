
//@ 进入该页面时调用
function RetrievePwdLoadedPanel(){
	catchErrorFun("RetrievePwd_init();");
}

//@ 离开这个页面时调用
function RetrievePwdUnloadedPanel(){
	$("#RePwd_Questions").empty();
	$('#RePwd_UserName').val('');
	$('#RePwd_Answer').val('');
}

function RetrievePwd_init(){
	var param = '{"InterfaceName":"/api/v1/netweb/GetSecurityQuestion"}';
	ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
		if (data.Code == 200){
			var QuestionArr = data.Data.SecurityQuestionModels;
			$("#RePwd_Questions").append('<option selected="selected" value="Default">请选择密保问题</option>');
			for (var i = 0; i< QuestionArr.length; i++){
				$("#RePwd_Questions").append("<option value="+ QuestionArr[i].ID +">"+ QuestionArr[i].Question +"</option>");
			}
		} else {
			toastUtils.showToast(data.Msg);
		}

	},null);

	// Button
	$("#RetrievePwdBtn").off('click');
	$("#RetrievePwdBtn").on('click', function(){
		RetrievePwd_submit();
	});
}

//Submit
function RetrievePwd_submit() {
	var rePwd_name = $('#RePwd_UserName').val().trim(),
	 	rePwd_mode = $('#RecoveryMode').val(),
		rePwd_question = $('#RePwd_Questions').val(),
	 	rePwd_answer = $('#RePwd_Answer').val().trim();

	if (rePwd_name == ""){
		toastUtils.showToast("请输入用户名");
		return;
	}
	if (!rePwd_question || rePwd_question == "Default"){
		toastUtils.showToast("请选择密保问题");
		return;
	}
	if (rePwd_answer == ""){
		toastUtils.showToast("请输入密保答案");
		return;
	}

	var param = "{'ProjectPublic_PlatformCode':2,'InterfaceName':'/api/v1/netweb/RetrievePassword','UserName':'"+ rePwd_name +"','RecoveryMode':"+ rePwd_mode +",'SecurityID':"+ rePwd_question +",'Answer':'"+ rePwd_answer +"'}";
	ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
		if (data.Code == 200){
			if (data.Data.Result == 1){
				var message = '<input id="RePwd_newPwd" type="password" placeholder="请输入新登录密码"/><br><br><input id="RePwd_checkPwd" type="password" placeholder="请再次输入登录密码">';
				setTimeout(function () {
					$.ui.popup(
						{
							title:"重置登录密码",
							message:message,
							cancelText:"确定",
							cancelCallback:
								function(){
									var newPwd = $('#RePwd_newPwd').val(),
										checkNewPwd = $('#RePwd_checkPwd').val();
									if (newPwd == "") {
										toastUtils.showToast("新密码不能为空");
										return;
									} else if (newPwd.length < 6 || newPwd.length > 16) {
										toastUtils.showToast("密码只能为(6-16)位字母和数字混合组成");
										return;
									}
									if (checkNewPwd == "") {
										toastUtils.showToast("确认密码不能为空");
										return;
									} else if (checkNewPwd != newPwd) {
										toastUtils.showToast("确认密码与新密码不一致");
										return;
									} else if (checkNewPwd == "a123456"){
										toastUtils.showToast("不能修改为默认密码");
										return;
									}

									var test = /^(?=.{6,16})(?=.*[a-zA-Z])(?=.*[0-9])[0-9a-zA-Z]*$/;
									if (!test.exec(checkNewPwd) || !test.exec(newPwd)) {
										toastUtils.showToast("密码只能为(6-16)位字母和数字混合组成");
										return false;
									}
									var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"/api/v1/netweb/ResetPassword","UserName":"'+ rePwd_name +'","NewPassword":"'+ checkNewPwd +'"}';
									ajaxUtil.ajaxByAsyncPost1(null, param, function (data) {
										if (data.Code == 200){
											if (data.Data.Result){
												toastUtils.showToast('修改成功');
												localStorageUtils.removeParam('LoginPasswd');
												$("#passwd").val('');
												$("#validateCode").val('');
												loginAgain();
											}else{
												toastUtils.showToast('修改失败');
											}
										} else {
											toastUtils.showToast(data.Msg);
										}

									},null);
								},
							cancelOnly:true
						});
				},300);
			}else if (data.Data.Result == -1){
				toastUtils.showToast('资金密码错误');
			}else if (data.Data.Result == -2){
				toastUtils.showToast('用户不存在');
			}else if (data.Data.Result == -3){
				toastUtils.showToast('密保问题回答错误');
			}else if (data.Data.Result == -4){
				toastUtils.showToast('该用户没有设置密保');
			}else if (data.Data.Result == -5){
				toastUtils.showToast('该用户没有设置资金密码');
			}else {
				toastUtils.showToast('验证失败');
			}
		} else {
			toastUtils.showToast(data.Msg);
		}

	},null);
}
