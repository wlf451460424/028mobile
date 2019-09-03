
/*进入panel时调用*/
function teamGameReportSubordinateDetailLoadedPanel(){
    catchErrorFun("teamGameReportSubordinateDetailInit();");
}

/*离开panel时调用*/
function teamGameReportSubordinateDetailUnloadedPanel(){
    $("#teamGameReportSubordinateDetailUlId").empty();
}

function teamGameReportSubordinateDetailInit(){
	var teamGameReportSubordinate = JSON.parse(localStorageUtils.getParam("teamGameReportSubordinate"));
	if(parseInt(teamGameReportSubordinate.ChildNum) > 0){
		$("#teamGameReportSubordinateDetail_back").show();
	}else{
		$("#teamGameReportSubordinateDetail_back").hide();
	}

    $("#teamGameReportSubordinateDetailUlId").empty();
    var $SubordinateDetailUl = "";
    if(gameId == 1 ){
	    $SubordinateDetailUl = teamGameReportSubDetail_QiPai_DX(teamGameReportSubordinate);
	    $("#teamGameReportSubordinateDetailUlId").append($SubordinateDetailUl);

	    var colorShow = [6,7];
	    $.each(colorShow,function (key,val) {
		    var items=$('#teamGameReportSubordinateDetailUlId li:eq('+ val +') span');
		    if(items[0].innerHTML < 0){
			    items.css('color','red');
		    }else if(items[0].innerHTML > 0){
			    items.css('color','green');
		    }else{
			    items.css('color','#FE5D39');
		    }
	    });
	}else if(gameId == 2){
		$SubordinateDetailUl = teamGameReportSubDetail_QiPai_KY(teamGameReportSubordinate);
		$("#teamGameReportSubordinateDetailUlId").append($SubordinateDetailUl);
		    
	    var items=$('#teamGameReportSubordinateDetailUlId li:eq(4) span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
	
    }else if(gameId == 3){
	    $SubordinateDetailUl = teamGameReportSubDetail_Vr(teamGameReportSubordinate);
	    $("#teamGameReportSubordinateDetailUlId").append($SubordinateDetailUl);
	    
		var items=$('#teamGameReportSubordinateDetailUlId li:eq(6) span');
		if(items[0].innerHTML < 0){
			items.css('color','red');
		}else if(items[0].innerHTML > 0){
			items.css('color','green');
		}else{
			items.css('color','#FE5D39');
		}
    }else if(gameId == 4){
	    $SubordinateDetailUl = teamGameReportSubDetail_Ag(teamGameReportSubordinate);
	    $("#teamGameReportSubordinateDetailUlId").append($SubordinateDetailUl);

	    var colorShow = [5,6,7,8,10];
	    $.each(colorShow,function (key,val) {
		    var items=$('#teamGameReportSubordinateDetailUlId li:eq('+ val +') span');
		    if(items[0].innerHTML < 0){
			    items.css('color','red');
		    }else if(items[0].innerHTML > 0){
			    items.css('color','green');
		    }else{
			    items.css('color','#FE5D39');
		    }
	    });
    }

//	$("#teamGameReportSubordinateDetailUlId").append($SubordinateDetailUl);

    $("#teamGameReportSubordinateDetail_back").off('click');
    $("#teamGameReportSubordinateDetail_back").on('click', function() {
	    var subordinateId = teamGameReportSubordinate.userId;
        localStorageUtils.setParam("gameSubordinateId", subordinateId);
        setPanelBackPage_Fun('teamGameReportSubordinate');
    });
}

//@ 大雄棋牌（美天棋牌）
function teamGameReportSubDetail_QiPai_DX(teamGameReportSubordinate) {
	var $SubordinateDetailUl = $('<ul class="recordDetail">' +
        '<li>用户名：<span >'+ teamGameReportSubordinate.userName +'</span></li>' +
        '<li>类 型：<span >'+ teamGameReportSubordinate.category +'</span></li>' +
        '<li>投注金额：<span >'+ Number(teamGameReportSubordinate.GamePay) +'</span></li>' +
        '<li>中奖金额：<span >'+ Number(teamGameReportSubordinate.GameGet) +'</span></li>' +
        '<li>房 费：<span >'+ Number(teamGameReportSubordinate.RoomFee) +'</span></li>' +
        '<li>其他收入：<span >'+ Number(teamGameReportSubordinate.OtherMoney) +'</span></li>' +
        '<li>对战类盈亏：<span >'+ Number(teamGameReportSubordinate.PlayIncome) +'</span></li>' +
        '<li>电子类盈亏：<span >'+ Number(teamGameReportSubordinate.SystemIncome) +'</span></li></ul>');
	
	return $SubordinateDetailUl;
}

//@ 开元棋牌
function teamGameReportSubDetail_QiPai_KY(teamGameReportSubordinate) {
	var $SubordinateDetailUl = $('<ul class="recordDetail">' +
        '<li>用户名：<span >'+ teamGameReportSubordinate.userName +'</span></li>' +
        '<li>类 型：<span >'+ teamGameReportSubordinate.category +'</span></li>' +
        '<li>游戏消费：<span >'+ Number(teamGameReportSubordinate.GamePay) +'</span></li>' +
        '<li>其他收入：<span >'+ Number(teamGameReportSubordinate.OtherMoney) +'</span></li>' +
        '<li>盈亏：<span >'+ Number(teamGameReportSubordinate.PL) +'</span></li></ul>');
	
	return $SubordinateDetailUl;
}

//@ vr 类
function teamGameReportSubDetail_Vr(teamGameReportSubordinate) {
	var $SubordinateDetailUl=$('<ul class="recordDetail">' +
		'<li>用户名：<span >'+ teamGameReportSubordinate.userName +'</span></li>' +
		'<li>类 型：<span >'+ teamGameReportSubordinate.category +'</span></li>' +
		'<li>投注金额：<span >'+ Number(teamGameReportSubordinate.PersonalPay) +'</span></li>' +
		'<li>中奖金额：<span >'+ Number(teamGameReportSubordinate.PersonalGet) +'</span></li>' +
		'<li>其他收入：<span >'+ Number((teamGameReportSubordinate.Dailywage || 0) ) +'</span></li>' +
		'<li>打赏金额：<span >'+ Number(teamGameReportSubordinate.Rewards) +'</span></li>' +
		'<li>盈	  亏：<span >'+ Number(teamGameReportSubordinate.winloss) +'</span></li></ul>');
    
    return $SubordinateDetailUl;
}

//@ AG
function teamGameReportSubDetail_Ag(teamGameReportSubordinate) {
	var $SubordinateDetailUl=$('<ul class="recordDetail">' +
		'<li>用户名：<span >'+ teamGameReportSubordinate.userName +'</span></li>' +
		'<li>类 型：<span >'+ teamGameReportSubordinate.category +'</span></li>' +
		'<li>总投注：<span >'+ Number(teamGameReportSubordinate.GamePay) +'</span></li>' +
		'<li>有效投注：<span >'+ Number(teamGameReportSubordinate.ValidBetAmount) +'</span></li>' +
		'<li>中奖金额：<span >'+ Number(teamGameReportSubordinate.GameGet) +'</span></li>' +
		'<li>视讯盈亏：<span >'+ Number(teamGameReportSubordinate.SXNetAmount) +'</span></li>' +
		'<li>电子盈亏：<span >'+ Number(teamGameReportSubordinate.DZNetAmount) +'</span></li>' +
		'<li>桌面盈亏：<span >'+ Number(teamGameReportSubordinate.ZYNetAmount) +'</span></li>' +
		'<li>捕鱼王盈亏：<span >'+ Number(teamGameReportSubordinate.BYNetAmount) +'</span></li>' +
		'<li>其他收入：<span >'+ Number(teamGameReportSubordinate.OtherMoney) +'</span></li>' +
		'<li>总盈亏：<span >'+ Number(teamGameReportSubordinate.TotalNetAmount) +'</span></li></ul>');
	return $SubordinateDetailUl;
}