
/**
 * @Author:      muchen
 * @DateTime:    2015-1-14
 * @Description: 进入该页面时调用
 */

function playtype_helpPanel(){
	help_playtype_init();
}

var lotteryName;
var helpName;
function help_playtype_init(){
	var arr=localStorageUtils.getParam("saleLottery").split(",");
	var temp = [];
	for (var i = 0; i < IndexLottery.length;i++) {
		var len = IndexLottery[i].lottery.length;
		for (var z = 0; z < len; z++) {
			if ($.inArray(IndexLottery[i].lottery[z], arr) >= 0) {
				temp.push(IndexLottery[i].lottery[z]);
			}
		}
	}
	
	for(var i = 0; i < hcp_IndexLottery.length;i++){
		var len = hcp_IndexLottery[i].lottery.length;
		for (var z = 0; z < len; z++) {
			if($.inArray(hcp_IndexLottery[i].lottery[z],arr) >= 0){
	            temp.push(hcp_IndexLottery[i].lottery[z]);
	        }
		}
    }

	$.each(temp,function(index,item){
		var str = item;
	    if(str.length >= 3 && str.split("")[0] == "5"){
	    	//彩种名称 盘口
	    	lotteryName = hcp_LotteryInfo.getLotteryNameById(str);
	    }else{
	    	lotteryName = LotteryInfo.getLotteryNameById(str);
	    }
		$("#help_playtypeId").append('<li id='+ str +' onclick="func('+str+')"><a class="recordList">'+lotteryName+'</a></li>');
	
	});
}

function func(a){
	current_LottreyId = a;
	var str = a.toString();
	if(str.length >= 3 && str.split("")[0] == "5"){
    	// 盘口
    	helpName = "lottery_"+ hcp_LotteryInfo.getLotteryTagById(str)+"_help";
    }else{
    	helpName = "lottery_"+ LotteryInfo.getLotteryTagById(str)+"_help";
    }
	createInitPanel_Fun(helpName);
}

/**
 * 离开这个页面时调用
 * @return {[type]} [description]
 */
function playtype_helpUnloadedPanel(){
	$("#help_playtypeId").empty();
}