/**
 *  盘口：加载各个彩种的玩法说明，以及售卖时间等
**/

//@ 进入时时彩类玩法页面时
function lottery_hcpSsc_helpPanel() {
    //title
    $("#help_hcpSsc_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
    //time
    $("#hcpSscHelp_time").html(hcp_LotteryInfo.getLotteryHelpTime(current_LottreyId));
    
    $("#tb_table").empty();
	var $itemLi = $('<tr><th width="26%" colspan="2">玩法</th><th colspan="3">中奖条件</th></tr>');
	$("#tb_table").append($itemLi);
	
	var $itemLi = $('<tr><td width="16%" rowspan="4">第一球 ~ 第五球</td></tr>'+
		'<tr><td>大小</td><td colspan="3">根据相应单项投注的第一球 ~ 第五球，开出的球号大于或等于5为大，小于或等于4为小</td></tr>'+
		'<tr><td>单双</td><td colspan="3">根据相应单项投注的第一球 ~ 第五球，开出的球号为双数叫双，如0、2、4、6、8；号码为单数叫单，如1、3、5、7、9</td></tr>'+
		'<tr><td>第一球~第五球</td><td colspan="3">指下注的每一球与开出之号码其开奖顺序及开奖号码相同，视为中奖，如第一球开出号码8，下注第一球为8者视为中奖，其余情形视为不中奖</td></tr>');
	$("#tb_table").append($itemLi);
	
	if(current_LottreyId != 557){  //腾讯分分彩-557（ 去掉总和-大小单双）
		var $itemLi = $('<tr><td width="16%" rowspan="3">总和大小单双</td></tr>'+
			'<tr><td>大小</td><td colspan="3">根据开出的球号数字总和值 大于或等于23为大，小于或等于22为小</td></tr>'+
			'<tr><td>单双</td><td colspan="3">根据开出的球号数字总和值是双数为总和双，是单数为总和单</td></tr>');
		$("#tb_table").append($itemLi);
	}
	
	var $itemLi = $('<tr><td width="16%" rowspan="6">(前三/中三/后三) 特殊玩法</td></tr>'+
		'<tr><td>豹子</td><td colspan="3">中奖号码的百位千位万位数字都相同。如中奖号码为000、111、999等，中奖号码的百位千位万位数字相同，则投注豹子者视为中奖，其它视为不中奖</td></tr>'+
		'<tr><td>顺子</td><td colspan="3">中奖号码的百位千位万位数字都相连，不分顺序（数字9、0、1视为相连）。如中奖号码为123、901、321、546等，中奖号码百位千位万位数字相连，则投注顺子者视为中奖，其它视为不中奖</td></tr>'+
		'<tr><td>对子</td><td colspan="3">中奖号码的百位、千位、万位任意两位数字相同（不包括豹子）。如中奖号码为001，112、696，中奖号码有两位数字相同，则投注对子者视为中奖，其它视为不中奖</td></tr>'+
		'<tr><td>半顺</td><td colspan="3">中奖号码的百位、千位、万位任意两位数字相连，不分顺序（不包括顺子、对子，数字9、0、1相连）。如中奖号码为125、540、390、706，中奖号码有两位数字相连，则投注半顺者视为中奖，其它视为不中奖。如果开奖号码为顺子、对子,则半顺视为不中奖。如中奖号码为123、901、556、233，视为不中奖</td></tr>'+
		'<tr><td>杂六</td><td colspan="3">不包括豹子、对子、顺子、半顺的所有中奖号码。如中奖号码百位、千位、万位为157，中奖号码位数之间无关联性，则投注杂六者视为中奖，其它视为不中奖</td></tr>');
	$("#tb_table").append($itemLi);
	
	var $itemLi = $('<tr><td width="16%" rowspan="3">龙虎斗 (0为最小，9为最大)</td></tr>'+
		'<tr><td>龙、虎</td><td colspan="3">以龙和虎点数大小比较来判断胜负，龙大于虎则投注"龙"者中奖，如龙开8，虎开0；若龙小于虎则投注"虎"者中奖。 其余情形视为不中奖</td></tr>'+
		'<tr><td>和</td><td colspan="3">龙和虎点数相同，投注"和"者中奖，如龙开8，虎开8。其余情形视为不中奖</td></tr>');
	$("#tb_table").append($itemLi);
	
	var $itemLi = $('<tr><td width="16%" rowspan="2">全5中1</td></tr>'+
		'<tr><td colspan="4">0~9任选1号进行投注,当所有5个开奖号码中任一数与所选的号码相同时，即为中奖。</td></tr>');
	$("#tb_table").append($itemLi);
}

//@ 进入11选5类玩法页面时
function lottery_hcpEsf_helpPanel() {
    //title
    $("#help_hcpEsf_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
    //time
    $("#hcpEsfHelp_time").html(hcp_LotteryInfo.getLotteryHelpTime(current_LottreyId));
}

//@ 进入快3类玩法页面时
function lottery_hcpKs_helpPanel() {
    //title
    $("#help_hcpKs_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
    //time
    $("#hcpKsHelp_time").html(hcp_LotteryInfo.getLotteryHelpTime(current_LottreyId));
}

//@ 进入PK拾类玩法页面时
function lottery_hcpPks_helpPanel() {
    //title
    $("#help_hcpPks_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
    //time
    $("#hcpPksHelp_time").html(hcp_LotteryInfo.getLotteryHelpTime(current_LottreyId));
}

//@ 进入快乐8类玩法页面时
function lottery_hcpKlb_helpPanel() {
    //title
    $("#help_hcpKlb_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
    //time
    $("#hcpKlbHelp_time").html(hcp_LotteryInfo.getLotteryHelpTime(current_LottreyId));
}

//@ 进入信用农场类玩法页面时
function lottery_hcpXync_helpPanel() {
    //title
    $("#help_hcpXync_title").html(hcp_LotteryInfo.getLotteryNameById(current_LottreyId));
    //time
    $("#hcpXyncHelp_time").html(hcp_LotteryInfo.getLotteryHelpTime(current_LottreyId));
}