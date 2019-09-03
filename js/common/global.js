var website = {
    apkpath:"/android/update.htm",
    path:"/manager/service",
    isLog : false//是否打印日志
};

/*
 * 将某子字符串用指定的字符串来替换
 * oldStr 源字符串
 * beginIndex 所要替换子字符串开始下标
 * endIndex 所要替换的子字符串结束下标（不包括）
 * replaceStr 指定用来替换的字符
 */
function replaceStr(oldStr,beginIndex,endIndex,replaceStr){
    if(endIndex < beginIndex || oldStr.length < (endIndex - beginIndex)){
        return oldStr;
    }
    var str = oldStr.substring(beginIndex,endIndex);
    var temp = "";
    for(var i = 0; i<str.length;i++){
        temp += replaceStr;
    }
    return oldStr.replace(str,temp);
}

//充值状态
function getChargeState1(id,type) {
    if (id == "0") {
        return "未处理"
    }
    if (id == "1") {
        return "交易成功"
    }
    if (id == "2") {
        return "交易失败"
    }
}
//转换显示
function getChargeState(id) {
    if (id == "0") {
        return "未处理"
    }
    if (id == "1") {
        return "交易中"
    }
    if (id == "2") {
        return "拒绝"
    }
    if (id == "3") {
        return "交易成功"
    }
    if (id == "4") {
        return "交易失败"
    }
}


//提款记录状态转换显示
function getTradeWay(typeID) {
    switch(typeID) {
        case '0':
            return '自动出款';
            break;
        case '1':
            return '提款';
            break;
        case '2':
            return '人工提款';
            break;
        case '7':
            return '其他扣款';
            break;
        case '8':
            return '活动扣款';
            break;
        default:
            return '--';
            break;
    }
}
//存款记录状态转换显示
function getDrawingsMark(id,DrawingsMark) {
    switch(id) {
        case 0:
        case 1:
            return '用户提款';
            break;
        case 2:
            return DrawingsMark;
            break;
        default:
            return DrawingsMark;
            break;
    }
}

//判断元角分模式
function getPayMode(id) {
    if ((Number(id) & 32)==32) {
        return "元模式"
    } else if ((Number(id) & 64)==64) {
        return "角模式"
    } else if ((Number(id) & 128)==128) {
        return "分模式"
    } else if ((Number(id) & 256)==256){
        return "厘模式"
    }
}

//备注
function remarkZH(operId, temp, userName) {
    if(temp==1){
    	var str = operId;
        if(str.length >= 3 && str.split("")[0] == "5"){
        	//彩种名称 盘口
        	return "购买"+ hcp_LotteryInfo.getLotteryNameById(operId);
        }else{
        	return "购买"+ LotteryInfo.getLotteryNameById(operId);
        }
//      return "购买"+LotteryInfo.getLotteryNameById(operId);
    }else if(temp==10){
        return "用户撤单";
    }else if(temp==11){
        return "管理员撤单";
    }else if(temp==12){
        return "追号中奖撤单";
    }else if(temp==13){
        return "系统撤单";
    }else if(temp==20){
        return LotteryInfo.getLotteryNameById(operId)+"出票";
    }else if(temp==30){
        return "自身投注返点";
    }else if(temp==40){
        return operId+"向上级返点";
    }else if(temp==50){
        return "系统派奖";
    }else if(temp==60){
        return "管理员撤奖";
    }else if(temp==70){
        return "申请提款，扣除余额";
    }else if(temp==90){
       return "提款拒绝，返还账户";
//      return operId;
    }else if(temp==100){
        return "用户提款";
    }else if(temp==110){
        return "用户提款";
    }else if(temp==120){
        return "用户提款";
    }else if(temp==140){
        return "申请充值";
    }else if(temp==150 || temp==8  || temp==14 || temp==15){
        return "用户充值";
    }else if(temp==170){
        return "钱包中心转入彩票";
    }else if(temp==180){
        return "彩票转入钱包中心";
    }else if(temp==190){
        return "给"+operId;
    }else if(temp==200){
        if(operId.indexOf(']') != -1){
            return "来自上级的"+operId.split("]")[1];
        }else{
            return "来自上级"+operId;
        }
    }else if(temp==210){
        return "系统分红";
    }else if(temp==220){
        return "开户送礼";
    }else if(temp==230){
        return "充值送礼";
    }else if(temp==231){
        return operId+"的充值佣金";
    }else if(temp==240){
        return "投注送礼";
    }else if(temp==241){
        return operId+"的投注佣金";
    }else if(temp==251){
        return "满就送";
    }else if(temp==252){
        return "亏损补贴";
    }else if(temp==253){
        return operId+"的亏损佣金";
    }else if(temp==254){
        return operId+"的满就送佣金";
    }else if(temp==255){
        return "消费拿红包";
    }else if(temp==256){
//      return "土豪签到";
        return operId;
    }else if(temp==257){
        return "转盘活动";
    }else if(temp==258){   //"充值奖励"
        return operId;
    }else if(temp==259){   //消费奖励
        return operId;
    }else if(temp==261){  //按比例发放日结
        return operId;
    }else if(temp==262){  //按阶梯发放日结
        return operId;
    }else if(temp==263){  //来自上级的日结
        return operId;
    }else if(temp==264){  //发给下级的日结
        return operId;
    }else if(temp==265){  //人工添加日结
        return operId;
    }else if(temp==266){  //人工扣除日结
        return operId;
    }else if(temp==267){  //来自系统的分红
//      return "来自系统的分红";
        return operId;
    }else if(temp==268){  //来自上级的分红
//      return "来自上级的分红";
        return operId;
    }else if(temp==301){  //消费日结
        return "消费日结";
    }else if(temp==302){  //亏损日结
        return "亏损日结";
    }else if(temp==290 || temp==490 || temp==790|| temp==890){  //从彩票向棋牌转账
        return operId;
    }else if(temp==300 || temp==500 || temp==800|| temp==900){  //从棋牌向彩票转账
        return operId;
    }else if(temp==390){  //从彩票向真人转账
	    return operId;
    }else if(temp==400){  //从真人向彩票转账
	    return operId;
	}else if(temp==590){  //从彩票向AG
	    return operId;
    }else if(temp==600){  //从AG向彩票转账
	    return operId;
    }else if(temp==410){  //真人转账失败
	    return operId;
	}else if(temp==422){  //充值手续费
	    return "充值手续费";
	}else if(temp==423){  //提款手续费
	    return "提款手续费";
    }else if(temp==424){  //提款手续费
	    return "提款拒绝，返还手续费";
    }else{
        return operId;
    }
}


//账户记录里面获取收支类型值
function getShouZhiByID(id, RechargeType, payTypeName) {
    var temp;
    switch(id) {
        case 1:
            return "投注";
            break;
        case 10:
        case 11:
        case 12:
        case 13:
            return "撤单";
            break;
        case 17:
        case 153:
            return "活动加款";
            break;
        case 20 :
            return "出票";
            break;
        case 30:
            return "自身投注返点";
            break;
        case 40:
            return "下级返点";
            break;
        case 50:
            return "中奖";
            break;
        case 60:
            return "撤奖";
            break;
        case 70:
            return "提款";
            break;
        case 80:
            return "申请提款失败";
            break;
        case 90:
            return "提款";
            break;
        case 100:
            return "提款审批同意--后台人工出款";
            break;
        case 110:
            return "提款审批同意--自动出款";
            break;
        case 120:
            return "人工出款";
            break;
        case 121:
            return "提款成功--刷新";
            break;
        case 122:
            return "人工提款";
            break;
        case 130:
            return "提款失败";
            break;
        case 131:
            return "提款失败--刷新1";
            break;
        case 140:
            return "申请充值";
            break;
        case 150:
            if(RechargeType==0){
                temp="网银充值";
            }else if(RechargeType==1){
                temp="在线转账";
            }else if(RechargeType==2){
                temp="其他";
            }else if(RechargeType==3){
                temp="人工存款";
            }else if(RechargeType==4){
                temp="活动";
            }else {
	            temp = payTypeName || "";
            }
            return temp;
            break;
        case 151:
            return "其他加款";
            break;
        case 152:
            return "人工存款";
            break;
        case 160:
            return "充值失败";
            break;
        case 170:
        case 180:
        case 290:
        case 300:
        case 310:
        case 390:
        case 400:
        case 410:
        case 490:
        case 500:
        case 510:
        case 590:
        case 600:
        case 790:
        case 800:
        case 810:
        case 890:
        case 900:
        case 910:
            return "转账";
            break;
        case 190:
            return "给下级充值";
            break;
        case 200:
            return "来自上级的充值";
            break;
        case 210:
            return "分红";
            break;
        case 220:
        case 230:
        case 231:
        case 240:
        case 241:
        case 251:
        case 252:
        case 253:
        case 254:
        case 255:
        case 256:
        case 257:
            return "系统活动";
            break;
        case 258:
            return "系统活动";
            break;
        case 259:
            return "系统活动";
            break;
        case 261:
            return temp="按比例发放日结";
            break;
        case 262:
            return temp="按阶梯发放日结";
            break;
        case 263:
            return temp="来自上级的日结";
            break;
        case 264:
            return temp="发给下级的日结";
            break;
        case 265:
            return temp="人工添加日结";
            break;
        case 266:
            return temp="人工扣除日结";
            break;
        case 267:
        case 268:
        case 269:
            return temp="分红";
            break;
        case 301:
        case 302:
            return temp="日结";
            break;
        case 303:
            return temp="其他扣款";
            break;
        case 304:
            return temp="活动扣款";
            break;
         case 411:
		    return temp="新日结";
		    break;
	    case 412:
		    return temp="红包雨";
		    break;
		case 422:
		    return temp="充值手续费";
		    break;
		case 423:
		case 424:
		    return temp="提款手续费";
		    break;
        default:
            break;
    }
}

function dailyWages(DetailSource, Remark){
	switch (parseInt(DetailSource)){
		case 263:
			return "来自上级的日结";
			break;
		case 264:
			return "发给下级的日结";
			break;
		case 265:
			return "人工添加日结";
			break;
		case 266:
			return "人工扣除日结";
			break;
		case 301:
			return "消费日结";
			break;
		case 302:
			return "亏损日结";
			break;
		case 411:
			return "新日结";
			break;
		default:
			return Remark;
	}
}

/**
 * 保存记录的查询条件，如我的账户，投注记录等
 * @param {Object} searchTerms 查询条件。searchTerms.time：时间，searchTerms.type：类型 (除时间之外的查询条件),searchTerms.isDetail：标记是否进入详情界面。true表示已进入详情界面。
 */
function saveSearchTerm(searchTerms,key) {
    if (null == searchTerms) {
        clearSearchTerm(key);
        return;
    }
    //保存查询条件
    var tempStr = JSON.stringify(searchTerms);
    if(key){
        localStorageUtils.setParam(key, tempStr);
    }else{
        localStorageUtils.setParam("searchTermByRecoder", tempStr);
    }
}

/**
 * 清除本地存储的记录的查询条件
 */
function clearSearchTerm(key) {
    var objTemp = getSearchTerm(key);
    if (null == objTemp) {
        if (key){
            localStorageUtils.setParam(key, "");
        }else{
            localStorageUtils.setParam("searchTermByRecoder", "");
        }
        return;
    }

    if (objTemp.isDetail == true) {
        //如果是从详情界面返回，则不清除本地存储的数据
        return ;
    }
    if (key){
        localStorageUtils.setParam(key, "");
    }else{
        localStorageUtils.setParam("searchTermByRecoder", "");
    }
}

/**
 * 获取本地存储的记录的查询条件
 * @return 查询条件。类型：Object。obj.time：时间，obj.type：类型 (除时间之外的查询条件)
 */
function getSearchTerm(key) {
    var tempStr;
    if(key){
        tempStr = localStorageUtils.getParam(key);
    }else{
        tempStr = localStorageUtils.getParam("searchTermByRecoder");
    }

    if ((tempStr == null)|| ("" == tempStr)) {
        return null;
    }

    return JSON.parse(tempStr);
}

function changeTwoDecimal_f(x)
{
    var f_x = parseFloat(x);
    if (isNaN(f_x))
    {
        //alert('function:changeTwoDecimal->parameter error');
        return false;
    }
    var f_x = Math.round(x*100)/100;
    var s_x = f_x.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0)
    {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2)
    {
        s_x += '0';
    }
    return s_x;
}
/**
 * 数字小数保留处理
 * [changeTwoDecimal_ff description]
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
function changeTwoDecimal_ff(x)
{
    var f_x = parseFloat(x);
    if (isNaN(f_x))
    {
        //alert('function:changeTwoDecimal->parameter error');
        return false;
    }
    var f_x = Math.round(x*10000)/10000;
    var s_x = f_x.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0)
    {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2)
    {
        s_x += '0';
    }
    return s_x;
}

function isChina(s){
    var patrn=/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    if(!patrn.exec(s)){
        return false;
    }
    else{
        return true;
    }
}

//数组替换
function replaceArray(nums,origArray,replacedArray) {
    var str = nums;
    $.each(origArray, function(index, item) {
        str = str.replace(new RegExp(item,'gm'), replacedArray[index]);
    });
    return str;
}

/**
 * 投注页面 汉字-->数字
 */
function tzContentToNum(lotteryId, playId, content) {
    var str = content;
    var type = LotteryInfo.getLotteryTypeById(lotteryId);
    var methodId = playId.replace(lotteryId,"");
    if (type == "ssc"){
        switch (methodId){
            case '82':
            case '11':
            case '79':
            case '80':
            case '81':
                var regArray = ["大", "小", "单", "双"];
                var valueArray = ["0", "1", "2", "3"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '85':
            case '88':
            case '91':
                var regArray = ["豹子", "顺子", "对子", "半顺", "杂六"];
                var valueArray = ["0", "1", "2", "3", "4"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '37':
            case '38':
            case '39':
            case '40':
            case '59':
            case '60':
            case '61':
            case '62':
            case '63':
            case '64':
            case '65':
            case '66':
            case '67':
            case '68':
            case '69':
                var regArray = ["万", "千", "百", "十", "个", "#"];
                var valueArray = ["0", "1", "2", "3", "4", "$"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '94':
            case '95':
            case '96':
            case '97':
            case '98':
            case '99':
            case '100':
            case '101':
            case '102':
            case '103':
                var regArray = ["龙", "虎", "和"];
                var valueArray = ["0", "1", "2"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '119':
            case '120':
            case '121':
            case '122':
            case '123':
            case '124':
            case '125':
            case '126':
            case '127':
            case '128':
                var regArray = ["龙", "虎"];
                var valueArray = ["0", "1"];
                str = replaceArray(content,regArray,valueArray);
                break;
        }
    }else if (type == "pks"){
        switch (methodId){
            case '16':
            case '17':
            case '18':
                var regArray = ["大", "小"];
                var valueArray = ["0", "1"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '19':
            case '20':
            case '21':
                var regArray = ["单", "双"];
                var valueArray = ["2", "3"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '22':
            case '23':
            case '24':
                var regArray = ["龙", "虎"];
                var valueArray = ["0", "1"];
                str = replaceArray(content,regArray,valueArray);
                break;
	        case '31':
		        var regArray = ["大", "双"];
		        var valueArray = ["0", "3"];
		        str = replaceArray(content,regArray,valueArray);
		        break;
	        case '32':
		        var regArray = ["小", "单"];
		        var valueArray = ["1", "2"];
		        str = replaceArray(content,regArray,valueArray);
		        break;
            case '35':
            case '36':
            case '37':
            case '38':
            case '39':
		       var regArray = ["龙", "虎"];
                var valueArray = ["0", "1"];
		        str = replaceArray(content,regArray,valueArray);
		        break;
		    case '40':
		    case '41':
		    case '50':
		       var regArray = ["大", "小","单","双"];
                var valueArray = ["0", "1","2","3"];
		        str = replaceArray(content,regArray,valueArray);
		        break;
        }
    }else if (type == "kl8"){
        switch (methodId){
            case '11':
                var regArray = ["单", "双"];
                var valueArray = ["0", "1"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '12':
                var regArray = ["小", "和", "大"];
                var valueArray = ["1", "2", "0"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '13':
                var regArray = ["奇", "和", "偶"];
                var valueArray = ["0", "2", "1"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '14':
                var regArray = ["上", "中", "下"];
                var valueArray = ["0", "2", "1"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '15':
                var regArray = ["大单", "大双", "小单","小双"];
                var valueArray = ["0", "1", "2","3"];
                str = replaceArray(content,regArray,valueArray);
                break;
            case '16':
                var regArray = ["金", "木", "水","火","土"];
                var valueArray = ["0", "1", "2","3","4"];
                str = replaceArray(content,regArray,valueArray);
                break;
        }
    }else if (type == "k3"){
        if(methodId == '18') {
            var regArray = ["大", "小", "单", "双"];
            var valueArray = ["0", "1", "2", "3"];
            str = replaceArray(content,regArray,valueArray);
        }
    }else if (type == "klsf"){
        if(methodId == '20') {
            var regArray = ["大", "小", "单", "双"];
            var valueArray = ["0", "1", "2", "3"];
            str = replaceArray(content,["尾大","尾小","和单","和双"],["4", "5", "6", "7"]);
            str = replaceArray(str,regArray,valueArray);
        } else if(methodId == '21') {
            var regArray = ["大", "小", "和"];
            var valueArray = ["0", "1", "2"];
            str = replaceArray(content,regArray,valueArray);
        } else if(methodId == '22') {
            var regArray = ["春", "夏", "秋", "冬","东","南","西","北"];
            var valueArray = ["0", "1", "2", "3", "4", "5", "6", "7"];
            str = replaceArray(content,regArray,valueArray);
        }else if(methodId == '23') {
            var regArray = ["金", "木", "水", "火","土"];
            var valueArray = ["0", "1", "2", "3", "4"];
            str = replaceArray(content,regArray,valueArray);
        }else if(methodId == '24' || methodId == '25'){
            str = content.replace(/V/g,'|');

           /* var regArray = ["1V2", "1V3", "1V4", "1V5","1V6","1V7","1V8","2V3","2V4","2V5","2V6","2V7","2V8",
            "3V4","3V5","3V6","3V7","3V8","4V5","4V6","4V7","4V8","5V6","5V7","5V8","6V7","6V8","7V8"];
            var valueArray = ["1,2", "1,3", "1,4", "1,5","1,6","1,7","1,8","2,3","2,4","2,5","2,6","2,7","2,8",
                "3,4","3,5","3,6","3,7","3,8","4,5","4,6","4,7","4,8","5,6","5,7","5,8","6,7","6,8","7,8"];
            str = replaceArray(content,regArray,valueArray);*/
        }
    }
    return str;
}

/**
 * 个人中心  数字-->汉字
 */
function tzContentToChinese(lotteryId, playType, nums) {
    var str = nums;
    var type = LotteryInfo.getLotteryTypeById(lotteryId);
    var methodId = playType.replace(lotteryId,"");
    if ( type == 'ssc'){
        switch (methodId){
            case '82':
            case '11':
            case '79':
            case '80':
            case '81':
                var regArray = ["0", "1", "2", "3"];
                var valueArray = ['大', '小', '单', '双'];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '85':
            case '88':
            case '91':
                var regArray = ["0", "1", "2", "3", "4"];
                var valueArray = ['豹子', '顺子', '对子', '半顺','杂六'];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '37':
            case '38':
            case '39':
            case '40':
            case '59':
            case '60':
            case '61':
            case '62':
            case '63':
            case '64':
            case '65':
            case '66':
            case '67':
            case '68':
            case '69':
                var sear=new RegExp('$');
                if(str.indexOf("$") > 0)
                {
                    var arr = nums.split("$");
                    str =arr[0]+""+ formatNum5(arr[0],arr[1]);
                }else{
                    str=nums;
                }
                break;
            case '94':
            case '95':
            case '96':
            case '97':
            case '98':
            case '99':
            case '100':
            case '101':
            case '102':
            case '103':
            case '109':
            case '110':
            case '111':
            case '112':
            case '113':
            case '114':
            case '115':
            case '116':
            case '117':
            case '118':
                var regArray = ["0", "1", "2"];
                var valueArray = ['龙', '虎', '和'];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '119':
            case '120':
            case '121':
            case '122':
            case '123':
            case '124':
            case '125':
            case '126':
            case '127':
            case '128':
            	var regArray = ["0", "1"];
                var valueArray = ['龙', '虎'];
                str = replaceArray(nums,regArray,valueArray);
                break;
        }
    }else if (type == 'pks'){
        switch (methodId){
            case '16':
            case '17':
            case '18':
                var regArray = ["0", "1"];
                var valueArray = ["大","小"];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '19':
            case '20':
            case '21':
                var regArray = ["2", "3"];
                var valueArray = ["单","双"];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '22':
            case '23':
            case '24':
                var regArray = ["0", "1"];
                var valueArray = ["龙","虎"];
                str = replaceArray(nums,regArray,valueArray);
                break;
	        case '31':
		        var regArray = ["0", "3"];
		        var valueArray = ["大", "双"];
		        str = replaceArray(nums,regArray,valueArray);
		        break;
	        case '32':
		        var regArray = ["1", "2"];
		        var valueArray = ["小", "单"];
		        str = replaceArray(nums,regArray,valueArray);
		        break;
            case '35':
		    case '36':
		    case '37':
		    case '38':
		    case '39':
		        var regArray = ["0", "1"];
                var valueArray = ["龙","虎"];
		        str = replaceArray(nums,regArray,valueArray);
		        break;
		    case '40':
		    case '41':
		    case '42':
		    case '43':
		    case '44':
		    case '45':
		    case '46':
		    case '47':
		    case '48':
		    case '49':
		    case '50':
		    	var regArray = ["0", "1","2", "3"];
                var valueArray = ["大","小","单","双"];
		        str = replaceArray(nums,regArray,valueArray);
		        break;
        }
    }else if (type == 'kl8'){
        switch (methodId){
            case '11':
                var regArray = ["0", "1"];
                var valueArray = ["单","双"];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '12':
                var regArray = ["1", "2", "0"];
                var valueArray = ["小","和","大"];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '13':
                var regArray = ["0", "2", "1"];
                var valueArray = ["奇","和","偶"];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '14':
                var regArray = ["0", "2", "1"];
                var valueArray = ["上","中","下"];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '15':
                var regArray = ["0", "1", "2","3"];
                var valueArray = ["大单","大双","小单","小双"];
                str = replaceArray(nums,regArray,valueArray);
                break;
            case '16':
                var regArray = ["0", "1", "2","3","4"];
                var valueArray = ["金","木","水","火","土"];
                str = replaceArray(nums,regArray,valueArray);
                break;
        }
    }else if (type == 'tb'){
        switch (methodId){
            case '16':
            case '17':
                var regArray = ["0", "1", "2", "3"];
                var valueArray = ['大', '小', '单', '双'];
                str = replaceArray(nums,regArray,valueArray);
                break;
        }
    }else if (type == "k3"){
        if(methodId == '18') {
            var regArray = ["0", "1", "2", "3"];
            var valueArray = ['大', '小', '单', '双'];
            str = replaceArray(nums,regArray,valueArray);
        }
    }else if (type == "klsf"){
        if(methodId == '20') {
            var regArray = ["0", "1", "2", "3", "4", "5", "6", "7"];
            var valueArray = ["大", "小", "单", "双","尾大","尾小","和单","和双"];
            str = replaceArray(nums,regArray,valueArray);
        } else if(methodId == '21') {
            var regArray = ["0", "1", "2"];
            var valueArray = ["大", "小", "和"];
            str = replaceArray(nums,regArray,valueArray);
        } else if(methodId == '22') {
            var regArray = ["0", "1", "2", "3", "4", "5", "6", "7"];
            var valueArray = ["春", "夏", "秋", "冬","东","南","西","北"];
            str = replaceArray(nums,regArray,valueArray);
        }else if(methodId == '23') {
            var regArray = ["0", "1", "2", "3", "4"];
            var valueArray = ["金", "木", "水", "火","土"];
            str = replaceArray(nums,regArray,valueArray);
        }else if(methodId == '24' || methodId == '25'){
           /* var regArray = ["1,2", "1,3", "1,4", "1,5","1,6","1,7","1,8","2,3","2,4","2,5","2,6","2,7","2,8",
                "3,4","3,5","3,6","3,7","3,8","4,5","4,6","4,7","4,8","5,6","5,7","5,8","6,7","6,8","7,8"];
            var valueArray = ["1V2", "1V3", "1V4", "1V5","1V6","1V7","1V8","2V3","2V4","2V5","2V6","2V7","2V8",
                "3V4","3V5","3V6","3V7","3V8","4V5","4V6","4V7","4V8","5V6","5V7","5V8","6V7","6V8","7V8"];
            str = replaceArray(nums,regArray,valueArray);*/

            str = nums.replace(/\|/g,'V');
        }
    }
    return str;
}

//时时彩，组选4。
function formatNum5(strNum,numsum) {
    var arrays =["","","","",""];
    var str="";
    for(var i=0;i<numsum.length;i++){
        if(numsum.charAt(i) ==0){
            arrays[0]="万";
        }else if(numsum.charAt(i) ==1){
            arrays[1]="千";
        }else if(numsum.charAt(i) ==2){
            arrays[2]="百";
        }else if(numsum.charAt(i) ==3){
            arrays[3]="十";
        }else if(numsum.charAt(i) ==4){
            arrays[4]="个";
        }
    }
    for(var i=0;i<arrays.length;i++){
        str+=arrays[i];
    }
    var strnut="";
    for(var j=0;j<strNum.length;j++){
        if(j != strNum.length -1){
            strnut+=strNum[j]+" ";
        }else{
            strnut+=strNum[j];
        }
    }
    strnut=strnut+"#"+str;
    return "#"+str
}

/**
 * 隐藏部分玩法出票页面中机选按钮
 */
function getplayid(lotteryId,methodId) {
    if (LotteryInfo.getLotteryTypeById(lotteryId) == "ssc") {  //时时彩
        switch (methodId) {
            case "39":
            case "40":
            case "41":
            case "42":
            case "43":
            case "44":
            case "45":
            case "46":
            case "47":
            case "48":
            case "49":
            case "50":
            case "51":
            case "52":
            case "53":
            case "54":
            case "55":
            case "56":
            case "57":
            case "58":
            case "59":
            case "60":
            case "61":
            case "62":
            case "63":
            case "64":
            case "66":
            case "67":
            case "68":
            case "69":

            case "94":
            case "95":
            case "96":
            case "97":
            case "98":
            case "99":
            case "100":
            case "101":
            case "102":
            case "103":
            
            case "119":
            case "120":
            case "121":
            case "122":
            case "123":
            case "124":
            case "125":
            case "126":
            case "127":
            case "128":
                return true;
                break;
            default:
                return false;
                break;

        }
    } else if (LotteryInfo.getLotteryTypeById(lotteryId) == "k3") { //快三
        switch (methodId) {
            case "02":
            case "05":
            case "08":
                return true;
                break;
            default:
                return false;
                break;
        }
    } else if (LotteryInfo.getLotteryTypeById(lotteryId).indexOf("esf") != -1) {  // 11选5
        switch (methodId) {
            case "16":
            case "17":
                return true;
                break;
            default:
                return false;
                break;
        }
    } else if(LotteryInfo.getLotteryTypeById(lotteryId) == "klsf"){ //快乐十分
        switch (methodId) {
            case "01":
            case "02":
            case "05":
            case "16":
            case "17":
            case "18":
            case "19":
                return true;
                break;
            default:
                return false;
                break;
        }
    } else {
        return false;
    }
}