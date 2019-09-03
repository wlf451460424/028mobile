/*The config of Handicap*/

// Line Test
var arrLines = ["mobile.tlbet6.com","mobile.tlbet8.com","mobile.9tl8.com"];

//官方玩法（false）、信用玩法（true）  切换标志；
var hcp_official_OR_credit = false;

//当前选择的彩种ID
var current_LottreyId = localStorageUtils.getParam("LottreyId");

//计算赔率时候的基值；
var rebate_base = 2000;

//首页
var hcp_IndexLottery = [
	{
		category:"时时彩",
		lottery: ["512", "514", "571", "586", "573", "557"]
//		lottery: []
	},
	{
		category:"11选5",
		lottery:["504","505","516","577","578","585"]
//		lottery: []
	},
	{
		category:"快乐彩",
		lottery:["509","579","580","510","590"]
//		lottery: []
	},
	{
		category:"快三",
		lottery:["526","582","583"]
//		lottery: []
	}
];

var hcp_LotteryId = {
	"512":{tag:"hcpSsc",type:"hcp_ssc",name:"重庆时时彩(信)",logo:"images/cqssc.png", helpTime:"7:30-23:50（20分钟一期，共50期）00:30-03:10（20分钟一期，共9期），全天59期。"},
	"514":{tag:"hcpSsc",type:"hcp_ssc",name:"新疆时时彩(信)",logo:"images/xjssc.png", helpTime:"10:20-2:00，20分钟一期，全天48期。"},
	"571":{tag:"hcpSsc",type:"hcp_ssc",name:"天津时时彩(信)",logo:"images/tjssc.png", helpTime:"09:20-23:00，20分钟一期，全天42期。"},
	"586":{tag:"hcpSsc",type:"hcp_ssc",name:"北京时时彩(信)",logo:"images/bjssc.png", helpTime:"09:00-23:55，5分钟一期，全天179期"},
	"573":{tag:"hcpSsc",type:"hcp_ssc",name:"台湾五分彩(信)",logo:"images/twwfc.png", helpTime:"07:05-23:55，5钟一期，全天 203期"},
	"557":{tag:"hcpSsc",type:"hcp_ssc",name:"奇趣腾讯分分彩(信)",logo:"images/txffc.png", helpTime:"24小时售卖，1分钟一期，全天1440期"},

	"504":{tag:"hcpEsf",type:"hcp_esf",name:"广东11选5(信)",logo:"images/gd11xuan5.png", helpTime:"09:30-23:10，20分钟一期，全天42期。"},
	"505":{tag:"hcpEsf",type:"hcp_esf",name:"江西11选5(信)",logo:"images/jx11xuan5.png", helpTime:"09:30-23:10，20分钟一期，全天42期。"},
	"516":{tag:"hcpEsf",type:"hcp_esf",name:"山东11选5(信)",logo:"images/sh11xuan5.png", helpTime:"9:00-23:00，20分钟/期，全天43期。"},
	"577":{tag:"hcpEsf",type:"hcp_esf",name:"上海11选5(信)",logo:"images/sh11xuan5.png", helpTime:"9:20-24:00，20分钟一期，全天45期。"},
	"578":{tag:"hcpEsf",type:"hcp_esf",name:"安徽11选5(信)",logo:"images/ah11xuan5.png", helpTime:"9:00-22:00，20分钟一期，全天40期。"},
	"585":{tag:"hcpEsf",type:"hcp_esf",name:"江苏11选5(信)",logo:"images/jsuesf.png", helpTime:"8:45-22:05，20分钟一期，全天41期。"},

	"509":{tag:"hcpKlb",type:"hcp_klb",name:"北京快乐8(信)",logo:"images/bjkl8.png", helpTime:"09:00-23:55，5分钟一期，全天179期"},
	"579":{tag:"hcpKlb",type:"hcp_klb",name:"韩国快乐8(信)",logo:"images/hgkl8.png", helpTime:"09:00-23:55，5分钟一期，全天179期"},
	"580":{tag:"hcpKlb",type:"hcp_klb",name:"台湾快乐8(信)",logo:"images/twkl8.png", helpTime:"7:05-23:55，5分钟一期，全天 203期"},

	"526":{tag:"hcpKs",type:"hcp_ks",name:"江苏快3(信)",logo:"images/jsks.png", helpTime:"08:50-22:10，20分钟一期，全天41期"},
	"582":{tag:"hcpKs",type:"hcp_ks",name:"安徽快3(信)",logo:"images/ahks.png", helpTime:"09:00-22:00，20分钟/期，全天40期"},
	"583":{tag:"hcpKs",type:"hcp_ks",name:"湖北快3(信)",logo:"images/hbks.png", helpTime:"9:20-22:00 ，20分钟/期，全天39期"},

	"510":{tag:"hcpPks",type:"hcp_pks",name:"北京PK拾(信)",logo:"images/pkshi.png", helpTime:"09:07-23:57，5分钟一期，全天179期"},

	"590":{tag:"hcpXync",type:"hcp_xync",name:"重庆幸运农场(信)",logo:"images/cqklsf.png", helpTime:"00:11-23:31  20分钟一期，全天共59期"}
};

var hcp_lotteryTag = {

};

var hcp_LotteryInfo = {
	//获取彩种类型（Tag）
	getLotteryTypeById:function (lotteryId) {
		return hcp_LotteryId[lotteryId]["type"];
	},

	//获取彩种名称
	getLotteryNameById:function(lotteryId){
		if (hcp_LotteryId.hasOwnProperty(lotteryId)){
			return hcp_LotteryId[lotteryId]["name"];
		}
	},
	//获取彩种Logo
	getLotteryLogoById:function(lotteryId){
		if (hcp_LotteryId.hasOwnProperty(lotteryId)){
			return hcp_LotteryId[lotteryId]["logo"];
		}
	},
	//获取彩种标识
	getLotteryTagById:function(lotteryId){
		if (hcp_LotteryId.hasOwnProperty(lotteryId)){
			return hcp_LotteryId[lotteryId]["tag"];
		}
	},
	//获取PlayType长度
	getPlayLength:function(type){
		return hcp_PC[type]["playType"].length;
	},
	//获取PlayMethod长度
	getMethodLength:function(type){
		return hcp_PC[type]["playMethod"].length;
	},
	//获取一级玩法名称
	getPlayName:function (category,typeId) {
		return hcp_PC[category]["playType"][typeId]["name"];
	},
	//获取一级玩法typeId
	getPlayTypeId:function (type,index) {
		return hcp_PC[type]["playType"][index]["typeId"];
	},
	//获取二级玩法typeId
	getMethodTypeId:function (type,index) {
		return hcp_PC[type]["playMethod"][index]["typeId"];
	},
	//获取二级玩法名称
	getMethodName:function (category,index) {
		return hcp_PC[category]["playMethod"][index]["name"];
	},
	//获取二级玩法索引
	getMethodIndex:function (category,index) {
		return hcp_PC[category]["playMethod"][index]["index"];
	},
	//获取各彩种玩法说明时间
	getLotteryHelpTime:function (lotteryId) {
		if (hcp_LotteryId.hasOwnProperty(lotteryId)){
			return hcp_LotteryId[lotteryId]["helpTime"];
		}
	},
	//获取玩法名称
	getPlayMethodName:function(lotteryId,playMethodId,id){
		lotteryId = lotteryId.toString();
		playMethodId = playMethodId.toString();
		id = id.toString();
		var methodId = playMethodId.replace(lotteryId,'');
		var type = this.getLotteryTypeById(lotteryId);
		var result;
		var array = [];
		$.each(hcp_PC[type]["playMethod"],function (index,item) {
			if (item.methodId == methodId){ //匹配二级标题
				array.push(item);
				var playName = hcp_PC[type]["playType"][item["typeId"]]["name"];
				result = playName;
			}
		});
		return result;
	},
};

//Play Category
var hcp_PC = {
    //时时彩
	"hcp_ssc":{
		playType:[
			{name:"盘口玩法",typeId:0}
		],
		playMethod:[
			{typeId:0,name:"整合", methodId:"01",index:0},
			{typeId:0,name:"龙虎斗", methodId:"02",index:1},
			{typeId:0,name:"全5中1", methodId:"03",index:2}
		]
	},
    //11选5
	"hcp_esf":{
		playType:[
			{name:"盘口玩法",typeId:0}
		],
		playMethod:[
			{typeId:0,name:"两面盘", methodId:"01",index:0},
			{typeId:0,name:"单号", methodId:"02",index:1},
			{typeId:0,name:"龙虎斗", methodId:"03",index:2},
			{typeId:0,name:"全5中1", methodId:"04",index:3}
		]
	},
    //快三
	"hcp_ks":{
		playType:[
			{name:"盘口玩法",typeId:0}
		],
		playMethod:[
			{typeId:0,name:"大小骰宝", methodId:"01",index:0}
		]
	},
    //幸运农场
	"hcp_xync":{
		playType:[
			{name:"盘口玩法",typeId:0}
		],
		playMethod:[
			{typeId:0,name:"两面盘", methodId:"01",index:0},
			{typeId:0,name:"单球1~8", methodId:"02",index:1},
			{typeId:0,name:"龙虎斗", methodId:"03",index:2},
			{typeId:0,name:"全8中1", methodId:"04",index:3}
		]
	},
    //PK拾
	"hcp_pks":{
		playType:[
			{name:"盘口玩法",typeId:0}
		],
		playMethod:[
			{typeId:0,name:"整合", methodId:"01",index:0},
			{typeId:0,name:"第1~10名", methodId:"02",index:1},
			{typeId:0,name:"冠亚和值", methodId:"03",index:2},
			{typeId:0,name:"冠亚组合", methodId:"04",index:3}
		]
	},
    //快乐8
	"hcp_klb":{
		playType:[
			{name:"盘口玩法",typeId:0}
		],
		playMethod:[
			{typeId:0,name:"总和比数五行", methodId:"01",index:0},
			{typeId:0,name:"正码", methodId:"02",index:1}
		]
	}
};

//赔率存贮；
var hcp_lottery_rebate=[];

//选号存贮
var hcp_LotteryStorage = {
	"hcpSsc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : [], "line6" : [], "line7" : [], "line8":[], "line9":[], "line10":[]},
	"hcpEsf" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : [], "line6" : [], "line7" : [], "line8":[], "line9":[], "line10":[]},
	"hcpKlb" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"hcpKs" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"hcpPks" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : [], "line6" : [], "line7" : [], "line8":[], "line9":[], "line10":[], "line11":[], "line12":[]},
	"hcpXync" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : [], "line6" : [], "line7" : [], "line8":[], "line9":[],"line10" : [],"line11" : [] , "line12" : [] , "line13" : [] , "line14" : [] , "line15" : [], "line16" : [], "line17" : [], "line18":[], "line19":[],"line20" : [],"line21" : [] , "line22" : [] , "line23" : [] , "line24" : [] , "line25" : [], "line26" : [], "line27" : [], "line28":[]},
};

//ssc玩法
var hcp_playCode_ssc = [
	{
		name:"置空补位",
		play_code :[]
	},
	{
		name:"整合     第1球  1~9 大小单双",
		play_code :["09","10","11","12","13","14","15","16","17","18","05","06","07","08"]
	},
	{
		name:"整合   第2球        1~9 大小单双",
		play_code :["23","24","25","26","27","28","29","30","31","32","19","20","21","22"]
	},
	{
		name:"整合   第3球        1~9 大小单双",
		play_code :["37","38","39","40","41","42","43","44","45","46","33","34","35","36"]
	},
	{
		name:"整合   第4球        1~9 大小单双",
		play_code :["51","52","53","54","55","56","57","58","59","60","47","48","49","50"]
	},
	{
		name:"整合   第5球        1~9 大小单双",
		play_code :["65","66","67","68","69","70","71","72","73","74","61","62","63","64"]
	},
	{
		name:"整合   总和           总大总小总单总双",
		play_code :["01","02","03","04"]
	},
	{
		name:"整合   前三  特殊玩法    豹子 顺子 对子 杂六 半顺",
		play_code :["75","76","77","78","79"]
	},
	{
		name:"整合   中三  特殊玩法    豹子 顺子 对子 杂六 半顺",
		play_code :["80","81","82","83","84"]
	},
	{
		name:"整合   后三 特殊玩法    豹子 顺子 对子 杂六 半顺",
		play_code :["85","86","87","88","89"]
	},
	{
		name:"龙虎斗  万千……",
		play_code :["90","91","92","93","94","95","96","97","98","99","100","101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119"]
	},
	{
		name:"全5中1",
		play_code :["120","121","122","123","124","125","126","127","128","129"]
	}
];

//esf玩法
var hcp_playCode_esf = [
	{
		name:"两面盘    总和  大小单双尾大尾小",
		play_code :["21","22","23","24","25","26"]
	},
	{
		name:"两面盘   第1球  大小单双",
		play_code :["01","02","03","04"]
	},
	{
		name:"两面盘    第2球  大小单双",
		play_code :["05","06","07","08"]
	},
	{
		name:"两面盘    第3球  大小单双",
		play_code :["09","10","11","12"]
	},
	{
		name:"两面盘    第4球  大小单双",
		play_code :["13","14","15","16"]
	},
	{
		name:"两面盘    第5球  大小单双",
		play_code :["17","18","19","20"]
	},
	{
		name:"单号   第一球  1~11",
		play_code :["27","28","29","30","31","32","33","34","35","36","37"]
	},
	{
		name:"单号   第二球  1~11",
		play_code :["38","39","40","41","42","43","44","45","46","47","48"]
	},
	{
		name:"单号   第三球  1~11",
		play_code :["49","50","51","52","53","54","55","56","57","58","59"]
	},
	{
		name:"单号   第四球  1~11",
		play_code :["60","61","62","63","64","65","66","67","68","69","70"]
	},
	{
		name:"单号   第五球  1~11",
		play_code :["71","72","73","74","75","76","77","78","79","80","81"]
	},
	{
		name:"龙虎斗  ",
		play_code :["82","83","84","85","86","87","88","89","90","91","92","93","94","95","96","97","98","99","100","101"]
	},
	{
		name:"5中1  ",
		play_code :["102","103","104","105","106","107","108","109","110","111","112"]
	},
	{
		name:"两面盘    上下盘   上下和",
		play_code :["113","114","115"]
	},
	{
		name:"两面盘    奇偶盘   奇偶和",
		play_code :["116","117","118"]
	},
];
//klb玩法
var hcp_playCode_klb = [
	{
		name:"总和比数五行         总和  大小单双   ",
		play_code :["01","02","03","04"]
	},
	{
		name:"总和比数五行         总和  810 大单大双 小单小双",
		play_code :["05","06","07","08","09"]
	},
	{
		name:"总和比数五行         总和  前后和   ",
		play_code :["10","11","12"]
	},
	{
		name:"总和比数五行         总和  单双和   ",
		play_code :["13","14","15"]
	},
	{
		name:"总和比数五行         总和  五行",
		play_code :["16","17","18","19","20"]
	},
	{
		name:"正码  1~80",
		play_code :["21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50",
					"51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67","68","69","70","71","72","73","74","75","76","77","78","79","80",
					"81","82","83","84","85","86","87","88","89","90","91","92","93","94","95","96","97","98","99","100"]
	}
];
//k3 玩法
var hcp_playCode_ks = [
	{
		name:"大小骰宝       三军、大小",
		play_code:["01","02","03","04","05","06","07","08"]
	},
	{
		name:"大小骰宝       围骰、全骰",
		play_code:["09","10","11","12","13","14","15"]
	},
	{
		name:"大小骰宝       点数 4点 ~ 17点",
		play_code:["16","17","18","19","20","21","22","23","24","25","26","27","28","29"]
	},
	{
		name:"大小骰宝       长牌",
		play_code:["30","31","32","33","34","35","36","37","38","39","40","41","42","43","44"]
	},
	{
		name:"大小骰宝       短牌",
		play_code:["45","46","47","48","49","50"]
	}
];
//pks玩法
var hcp_playCode_pks = [
	{
		name:"整合       冠亚 总和    小单小双 ",
		play_code :["01","02","03","04"]
	},
	{
		name:"整合       第一名 冠军   小单小双",
		play_code :["05","06","07","08"]
	},
	{
		name:"整合       第二名 亚军  小单小双",
		play_code :["09","10","11","12"]
	},
	{
		name:"整合       第三名   小单小双",
		play_code :["13","14","15","16"]
	},
	{
		name:"整合       第四名   小单小双",
		play_code :["17","18","19","20"]
	},
	{
		name:"整合       第五名   小单小双",
		play_code :["21","22","23","24"]
	},
	{
		name:"整合       第六名   小单小双",
		play_code :["25","26","27","28"]
	},
	{
		name:"整合       第七名   小单小双",
		play_code :["29","30","31","32"]
	},
	{
		name:"整合       第八名   小单小双",
		play_code :["33","34","35","36"]
	},
	{
		name:"整合       第九名   小单小双",
		play_code :["37","38","39","40"]
	},
	{
		name:"整合       第十名   小单小双",
		play_code :["41","42","43","44"]
	},
	{
		name:"整合       VS",
		play_code :["45","46","47","48","49","50","51","52","53","54"]
	},
	{
		name:"第1~10名       第一名    1~10",
		play_code :["55","56","57","58","59","60","61","62","63","64"]
	},
	{
		name:"第1~10名       第二名    1~10",
		play_code :["65","66","67","68","69","70","71","72","73","74"]
	},
	{
		name:"第1~10名       第三名    1~10",
		play_code :["75","76","77","78","79","80","81","82","83","84"]
	},
	{
		name:"第1~10名       第四名    1~10",
		play_code :["85","86","87","88","89","90","91","92","93","94"]
	},
	{
		name:"第1~10名       第五名    1~10",
		play_code :["95","96","97","98","99","100","101","102","103","104"]
	},
	{
		name:"第1~10名       第六名    1~10",
		play_code :["105","106","107","108","109","110","111","112","113","114"]
	},
	{
		name:"第1~10名       第七名    1~10",
		play_code :["115","116","117","118","119","120","121","122","123","124"]
	},
	{
		name:"第1~10名       第八名    1~10",
		play_code :["125","126","127","128","129","130","131","132","133","134"]
	},
	{
		name:"第1~10名       第九名    1~10",
		play_code :["135","136","137","138","139","140","141","142","143","144"]
	},
	{
		name:"第1~10名       第十名    1~10",
		play_code :["145","146","147","148","149","150","151","152","153","154"]
	},
	{
		name:"冠亚和值    3~19",
		play_code :["155","156","157","158","159","160","161","162","163","164","165","166","167","168","169","170","171"]
	},
	{
		name:"冠亚组合" ,
		play_code :["172","173","174","175","176","177","178","179","180",
					"181","182","183","184","185","186","187","188","189",
					"190","191","192","193","194","195","196","197","198",
					"199","200","201","202","203","204","205","206","207",
					"208","209","210","211","212","213","214","215","216"]
	}
];

//xync玩法
var hcp_playCode_xync = [
	{
		name:"两面盘      总和    大小单双 尾大尾小 ",
		play_code :["01","02","03","04","05","06"]
	},
	{
		name:"两面盘      第一球   大小单双 尾大尾小 和单和双 ",
		play_code :["07","08","09","10","11","12","13","14"]
	},
	{
		name:"两面盘      第二球   大小单双 尾大尾小 和单和双 ",
		play_code :["15","16","17","18","19","20","21","22"]
	},
	{
		name:"两面盘      第三球   大小单双 尾大尾小 和单和双 ",
		play_code :["23","24","25","26","27","28","29","30"]
	},
	{
		name:"两面盘      第四球   大小单双 尾大尾小 和单和双 ",
		play_code :["31","32","33","34","35","36","37","38"]
	},
	{
		name:"两面盘      第五球   大小单双 尾大尾小 和单和双 ",
		play_code :["39","40","41","42","43","44","45","46"]
	},
	{
		name:"两面盘      第六球   大小单双 尾大尾小 和单和双 ",
		play_code :["47","48","49","50","51","52","53","54"]
	},
	{
		name:"两面盘      第七球   大小单双 尾大尾小 和单和双 ",
		play_code :["55","56","57","58","59","60","61","62"]
	},
	{
		name:"两面盘      第八球   大小单双 尾大尾小 和单和双 ",
		play_code :["63","64","65","66","67","68","69","70"]
	},
	{
		name:"单球1~8       第一球  1~20 ",
		play_code :["71","72","73","74","75","76","77","78","79","80","81","82","83","84","85","86","87","88","89","90"]
	},
	{
		name:"单球1~8          第二球  1~20 ",
		play_code :["91","92","93","94","95","96","97","98","99","100","101","102","103","104","105","106","107","108","109","110"]
	},
	{
		name:"单球1~8          第三球  1~20 ",
		play_code :["111","112","113","114","115","116","117","118","119","120","121","122","123","124","125","126","127","128","129","130"]
	},
	{
		name:"单球1~8          第四球  1~20 ",
		play_code :["131","132","133","134","135","136","137","138","139","140","141","142","143","144","145","146","147","148","149","150"]
	},
	{
		name:"单球1~8          第五球  1~20 ",
		play_code :["151","152","153","154","155","156","157","158","159","160","161","162","163","164","165","166","167","168","169","170"]
	},
	{
		name:"单球1~8          第六球  1~20 ",
		play_code :["171","172","173","174","175","176","177","178","179","180","181","182","183","184","185","186","187","188","189","190"]
	},
	{
		name:"单球1~8          第七球  1~20 ",
		play_code :["191","192","193","194","195","196","197","198","199","200","201","202","203","204","205","206","207","208","209","210"]
	},
	{
		name:"单球1~8          第八球  1~20 ",
		play_code :["211","212","213","214","215","216","217","218","219","220","221","222","223","224","225","226","227","228","229","230"]
	},
	{
		name:"龙虎斗 ",
		play_code :["231","232","233","234","235","236","237","238","239","240","241","242","243","244","245","246","247","248","249","250",
					"251","252","253","254","255","256","257","258","259","260","261","262","263","264","265","266","267","268","269","270",
					"271","272","273","274","275","276","277","278","279","280","281","282","283","284","285","286"]
	},
	{
		name:"全8中1  1~20 ",
		play_code :["287","288","289","290","291","292","293","294","295","296","297","298","299","300","301","302","303","304","305","306"]
	}
];
