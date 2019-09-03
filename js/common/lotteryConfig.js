
//首页
var IndexLottery = [
	{
		category:"时时彩",
		lottery: ["119","12", "71", "14","115", "86", "73", "90", "56", "44", "43", "66", "58", "48","57","59","49","93","94","108","109","110","111","112","113","116","117","118"]
	},
	{
		category:"竞速彩",
		lottery:["50","51","53","55"]
	},
	{
		category:"快乐彩",
		lottery:["26","82","83","15","10","11","114","9","79","80","81","91","92"]
	},
	{
		category:"低频彩",
		lottery:["19","84","17","18"]
	},
	{
		category:"11选5",
		lottery:["61","63","85","4","78","16","5","77","101","102","103","104"]
	}
];

//第三方对接系统  配置信息；
var ThirdPartyInfo = [];

//无配置玩法提示语；
var noPlayMethodTips = "无可销售玩法";

//第三方棋牌 logo
var ThirdPartyLogo = ["images/thirdPartyImg/Card_ICO.png",
					"images/thirdPartyImg/Card_ICO.png",
					"images/thirdPartyImg/VR_ICO.png",
					"images/thirdPartyImg/AG_ICO.png",
					"",
					"images/thirdPartyImg/Card_ICO.png",
					"images/thirdPartyImg/Card_ICO.png",
];

var hot_lottrey = ["12","57","56","113","5","78","10","11","114"];
var new_lottrey = [];
//Lottery Category
var LC = {
	"ssc":{
		jsffc:{name:"永胜1分彩",lotteryId:"51",logo:"images/ffc.png",type:"ssc"},
		jssfc:{name:"永胜3分彩",lotteryId:"53",logo:"images/3fc.png",type:"ssc"},
		bxwfc:{name:"永胜5分彩",lotteryId:"55",logo:"images/5fc.png",type:"ssc"},
		mmc:{name:"永胜秒秒彩",lotteryId:"50",logo:"images/mmc.png",type:"ssc"},
		cqssc:{name:"重庆时时彩",lotteryId:"12",logo:"images/cqssc.png",type:"ssc"},
		tjssc:{name:"天津时时彩",lotteryId:"71",logo:"images/tjssc.png",type:"ssc"},
		xjssc:{name:"新疆时时彩",lotteryId:"14",logo:"images/xjssc.png",type:"ssc"},
		hgydwfc:{name:"老韩国1.5分彩",lotteryId:"72",logo:"images/hgydwfc.png",type:"ssc"},
		blydwfc:{name:"韩国1.5分彩",lotteryId:"56",logo:"images/blydwfc.png",type:"ssc"},
		djydwfc:{name:"东京1.5分彩",lotteryId:"75",logo:"images/djydwfc.png",type:"ssc"},
		twwfc:{name:"台湾五分彩",lotteryId:"73",logo:"images/twwfc.png",type:"ssc"},
		jndsdwfc:{name:"加拿大3.5分彩",lotteryId:"76",logo:"images/jndsdwfc.png",type:"ssc"},
		xjplfc:{name:"新加坡2分彩",lotteryId:"74",logo:"images/xjplfc.png",type:"ssc"},
		txffc:{name:"奇趣腾讯分分彩",lotteryId:"57",logo:"images/txffc.png",type:"ssc"},
		tenxunffc:{name:"腾讯分分彩",lotteryId:"59",logo:"images/tenxffc.png",type:"ssc"},
		qqffc:{name:"QQ分分彩",lotteryId:"58",logo:"images/qqffc.png",type:"ssc"},
		bjssc:{name:"北京时时彩",lotteryId:"86",logo:"images/bjssc.png",type:"ssc"},
		blanydwfc:{name:"菲律宾1.5分彩",lotteryId:"66",logo:"images/blanydwfc.png",type:"ssc"},
		wxydwfc:{name:"微信1.5分彩",lotteryId:"43",logo:"images/wxydwfc.png",type:"ssc"},
		ldydwfc:{name:"巴黎1.5分彩",lotteryId:"44",logo:"images/ldydwfc.png",type:"ssc"},
		tenxffc:{name:"QQ分分彩",lotteryId:"48",logo:"images/qqffc.png",type:"ssc"},
		wbffc:{name:"微博分分彩",lotteryId:"49",logo:"images/wbffc.png",type:"ssc"},
		beijssc:{name:"北京时时彩",lotteryId:"93",logo:"images/bjssc.png",type:"ssc"},
		taiwwfc:{name:"台湾五分彩",lotteryId:"94",logo:"images/twwfc.png",type:"ssc"},
		
		txlfcd:{name:"腾讯分分彩-单",lotteryId:"108",logo:"images/txlfcd.png",type:"ssc"},
		txlfcs:{name:"腾讯分分彩-双",lotteryId:"109",logo:"images/txlfcs.png",type:"ssc"},
		txsfc:{name:"腾讯3分彩",lotteryId:"110",logo:"images/txsfc.png",type:"ssc"},
		txwfc:{name:"腾讯5分彩",lotteryId:"111",logo:"images/txwfc.png",type:"ssc"},
		wbyfc:{name:"微博分分彩",lotteryId:"112",logo:"images/wbffc.png",type:"ssc"},
		wbwfc:{name:"微博5分彩",lotteryId:"113",logo:"images/wbwfc.png",type:"ssc"},
		hljssc:{name:"黑龙江时时彩",lotteryId:"115",logo:"images/hljssc.png",type:"ssc"},
		hnwfc:{name:"河内5分彩",lotteryId:"116",logo:"images/hnwfc.png",type:"ssc"},
		hnssc:{name:"河内时时彩",lotteryId:"117",logo:"images/hnssc.png",type:"ssc"},
		hnffc:{name:"河内1分彩",lotteryId:"118",logo:"images/hnffc.png",type:"ssc"},
		bianffc:{name:"币安分分彩",lotteryId:"119",logo:"images/bianffc.png",type:"ssc"}
	},
	"esf":{
		jsesf:{name:"11选5分分彩",lotteryId:"61",logo:"images/jsesf.png",type:"esf"},
		ksesf:{name:"11选5三分彩",lotteryId:"63",logo:"images/ksesf.png",type:"esf"},
		gdesf:{name:"广东11选5",lotteryId:"4",logo:"images/gd11xuan5.png",type:"esf"},
		jxesf:{name:"江西11选5",lotteryId:"5",logo:"images/jx11xuan5.png",type:"esf"},
		shesf:{name:"上海11选5",lotteryId:"77",logo:"images/sh11xuan5.png",type:"esf"},
		ahesf:{name:"安徽11选5",lotteryId:"78",logo:"images/ah11xuan5.png",type:"esf"},
		sdesf:{name:"山东11选5",lotteryId:"16",logo:"images/sd11xuan5.png",type:"esf"},
		jsuesf:{name:"江苏11选5",lotteryId:"85",logo:"images/jsuesf.png",type:"esf"},
		
		hljesf:{name:"黑龙江11选5",lotteryId:"101",logo:"images/hljesf.png",type:"esf"},
		hebesf:{name:"河北11选5",lotteryId:"102",logo:"images/hebesf.png",type:"esf"},
		lnesf:{name:"辽宁11选5",lotteryId:"103",logo:"images/lnesf.png",type:"esf"},
		xjesf:{name:"新疆11选5",lotteryId:"104",logo:"images/xjesf.png",type:"esf"}
	},
	"sd":{
		fcsd:{name:"福彩3D",lotteryId:"19",logo:"images/fc_sd.png",type:"sd"},
		ffsd:{name:"3D分分彩",lotteryId:"84",logo:"images/ff_sd.png",type:"sd"}
	},
	"pls":{
		pls:{name:"排列三",lotteryId:"17",logo:"images/pl3.png",type:"pls"}
	},
	"plw":{
		plw:{name:"排列五",lotteryId:"18",logo:"images/pl5.png",type:"plw"}
	},
	"ssl":{
		shssl:{name:"上海时时乐",lotteryId:"15",logo:"images/shssl.png",type:"ssl"}
	},
	"kl8":{
		bjklb:{name:"北京快乐8",lotteryId:"9",logo:"images/bjkl8.png",type:"kl8"},
		hgklb:{name:"韩国快乐8",lotteryId:"79",logo:"images/hgkl8.png",type:"kl8"},
		twklb:{name:"台湾快乐8",lotteryId:"80",logo:"images/twkl8.png",type:"kl8"},
		beijklb:{name:"北京快乐8",lotteryId:"91",logo:"images/bjkl8.png",type:"kl8"},
		taiwklb:{name:"台湾快乐8",lotteryId:"92",logo:"images/twkl8.png",type:"kl8"}
	},
	"pks":{
		pks:{name:"北京PK拾",lotteryId:"10",logo:"images/pkshi.png",type:"pks"},
		xyft:{name:"幸运飞艇",lotteryId:"11",logo:"images/xyft.png",type:"pks"},
		txsc:{name:"奇趣腾讯赛车",lotteryId:"114",logo:"images/txsc.png",type:"pks"}
	},
	"k3":{
		jsks:{name:"江苏快3",lotteryId:"26",logo:"images/jsks.png",type:"k3"},
		jlks:{name:"吉林快3",lotteryId:"81",logo:"images/jlks.png",type:"k3"},
		ahks:{name:"安徽快3",lotteryId:"82",logo:"images/ahks.png",type:"k3"},
		hbks:{name:"湖北快3",lotteryId:"83",logo:"images/hbks.png",type:"k3"}
	},
//	"tb":{
//		jskstb:{name:"江苏骰宝",lotteryId:"21",logo:"images/jsks.png",type:"tb"},
//		jlkstb:{name:"吉林骰宝",lotteryId:"87",logo:"images/jlks.png",type:"tb"},
//		ahkstb:{name:"安徽骰宝",lotteryId:"88",logo:"images/ahks.png",type:"tb"},
//		hbkstb:{name:"湖北骰宝",lotteryId:"89",logo:"images/hbks.png",type:"tb"}
//	},
	"klsf":{
		cqklsf:{name:"重庆幸运农场",lotteryId:"90",logo:"images/cqklsf.png",type:"klsf"}
	}
};
//Play Category
var PC = {
	"ssc":{
		playType:[
			{name:"五星",typeId:0},
			{name:"四星",typeId:1},
			{name:"后三",typeId:2},
			{name:"中三",typeId:3},
			{name:"前三",typeId:4},
			{name:"后二",typeId:5},
			{name:"前二",typeId:6},
			{name:"定位胆",typeId:7},
			{name:"不定位",typeId:8},
			{name:"大小单双",typeId:9},
			{name:"任选二",typeId:10},
			{name:"任选三",typeId:11},
			{name:"任选四",typeId:12},
			{name:"趣味",typeId:13},
			{name:"龙虎",typeId:14},
			{name:"骰宝龙虎",typeId:15},
			{name:"新龙虎",typeId:16}
		],

		playMethod:[
			{typeId:0,name:"直选复式", methodId:"01",mode:"0",index:0,shuoming:"从万、千、百、十、个位各选1个号码，选号与开奖号按位一致即中奖。"},
			{typeId:0,name:"直选单式", methodId:"01",mode:"8",index:1,shuoming:"手动输入1个五位数号码，选号与开奖号按位一致即中奖。"},
			{typeId:0,name:"组选120", methodId:"41",mode:"0",index:2,shuoming:"从0-9中任意选择5个号码，选号与开奖号一致，顺序不限，即中奖。"},
			{typeId:0,name:"组选60", methodId:"42",mode:"0",index:3,shuoming:"选择1个二重号和3个单号，开奖号码包含单号，且二重号在开奖号码中出现2次，即中奖。"},
			{typeId:0,name:"组选30", methodId:"43",mode:"0",index:4,shuoming:"选择2个二重号和1个单号，开奖号码包含单号，且2个二重号分别在开奖号码中出现2次，即中奖。"},
			{typeId:0,name:"组选20", methodId:"44",mode:"0",index:5,shuoming:"选择1个三重号和2个单号，开奖号码包含单号，且三重号在开奖号码中出现3次，即中奖。"},
			{typeId:0,name:"组选10", methodId:"45",mode:"0",index:6,shuoming:"选择1个三重号和1个二重号，开奖号码中三重号出现3次，且二重号出现2次，即中奖。"},
			{typeId:0,name:"组选5", methodId:"46",mode:"0",index:7,shuoming:"选择1个四重号和1个单号，开奖号码包含单号，且四重号在开奖号码中出现4次，即中奖。"},
			{typeId:0,name:"总和大小单双", methodId:"82",mode:"0",index:8,shuoming:"从总和的大、小、单、双中任意选择1个号码形态组成一注，只要所选形态与开奖号码的5位数号码总和（大于等于23：总和大；小于等于22：总和小；单数：总和单；双数：总和双）形态相同，即为中奖。"},

			{typeId:1,name:"直选复式", methodId:"32",mode:"0",index:9,shuoming:"从个、十、百、千位各选一个号码，选号与开奖号后四位按位一致即中奖。"},
			{typeId:1,name:"直选单式", methodId:"32",mode:"8",index:10,shuoming:"手动输入1个四位数号码，选号与开奖号后四位按位一致即中奖。"},
			{typeId:1,name:"组选24", methodId:"51",mode:"0",index:11,shuoming:"从0-9中选择4个号码，选号与开奖号后四位一致，顺序不限，即中奖。"},
			{typeId:1,name:"组选12", methodId:"52",mode:"0",index:12,shuoming:"选择1个二重号和2个单号，开奖号码后四位包含单号，且二重号出现2次，即中奖。"},
			{typeId:1,name:"组选6", methodId:"53",mode:"0",index:13,shuoming:"选择2个二重号，所选的2个二重号在开奖号码后四位中分别出现2次，即中奖。"},
			{typeId:1,name:"组选4", methodId:"54",mode:"0",index:14,shuoming:"选择1个三重号与1个单号，开奖号码后四位包含单号，且三重号出现3次，即中奖。"},

			{typeId:2,name:"直选复式", methodId:"03",mode:"0",index:15,shuoming:"从百、十、个位各选一个号码，选号与开奖号后3位按位一致，即中奖。"},
			{typeId:2,name:"直选单式", methodId:"03",mode:"8",index:16,shuoming:"手动输入1个三位数号码，选号与开奖号后3位按位一致，即中奖。"},
			{typeId:2,name:"直选和值", methodId:"04",mode:"0",index:17,shuoming:"所选数值等于开奖号码后三位数字相加之和，即中奖。"},
			{typeId:2,name:"直选跨度", methodId:"89",mode:"0",index:18,shuoming:"从0-9中选择1个号码组成一注，所选数值等于开奖号码的后3位最大与最小数字相减之差，即为中奖。"},
			{typeId:2,name:"组三复式", methodId:"05",mode:"0",index:19,shuoming:"从0-9中选择2个数字组成两注，选号与开奖号后三位相同，顺序不限，即中奖。"},
			{typeId:2,name:"组六复式", methodId:"06",mode:"0",index:20,shuoming:"从0-9中任意选择3个号码组成一注，选号与开奖号后三位相同，顺序不限，即中奖。"},
			{typeId:2,name:"组选和值", methodId:"17",mode:"0",index:21,shuoming:"所选数值等于开奖号码后三位数字相加之和(不含豹子号)，即中奖。"},
			{typeId:2,name:"组选包胆", methodId:"104",mode:"0",index:22,shuoming:"从0-9中任意选择1个包胆号码，开奖号码的后三位中任意1位与所选包胆号码相同(不含豹子号)，即为中奖。"},
			{typeId:2,name:"混合组选", methodId:"36",mode:"8",index:23,shuoming:"任选一个非豹子的三位数号码，选号与开奖号后三位相同，顺序不限，即中奖。"},
			{typeId:2,name:"和值尾数", methodId:"90",mode:"0",index:24,shuoming:"所选数值等于开奖号码的百位、十位、个位三个数字相加之和的尾数，即为中奖。"},
			{typeId:2,name:"特殊号", methodId:"91",mode:"0",index:25,shuoming:"所选的号码特殊属性和开奖号码后三位属性一致，即为中奖。1、豹子：开奖号码后三位全部相同；2、顺子：开奖号码后三位不分顺序，呈现连号状态；3、对子：开奖号码后三位中有任意2个号码相同。4、半顺：开奖号码后三位不分顺序，有2个号码呈现连号状态；5、杂六：开奖号码后三位数字非豹子、顺子、对子、半顺。"},

			{typeId:3,name:"直选复式", methodId:"25",mode:"0",index:26,shuoming:"从千、百、十位各选一个号码，选号与开奖号中3位按位一致，即中奖。"},
			{typeId:3,name:"直选单式", methodId:"25",mode:"8",index:27,shuoming:"手动输入1个三位数号码，选号与开奖号中3位按位一致，即中奖。"},
			{typeId:3,name:"直选和值", methodId:"26",mode:"0",index:28,shuoming:"所选数值等于开奖号码中三位数字相加之和，即中奖。"},
			{typeId:3,name:"直选跨度", methodId:"86",mode:"0",index:29,shuoming:"从0-9中选择1个号码组成一注，所选数值等于开奖号码的中3位最大与最小数字相减之差，即为中奖。"},
			{typeId:3,name:"组三复式", methodId:"27",mode:"0",index:30,shuoming:"从0-9中选择2个数字组成两注，选号与开奖号中三位相同，顺序不限，即中奖。"},
			{typeId:3,name:"组六复式", methodId:"28",mode:"0",index:31,shuoming:"从0-9中任意选择3个号码组成一注，选号与开奖号中三位相同，顺序不限，即中奖。"},
			{typeId:3,name:"组选和值", methodId:"29",mode:"0",index:32,shuoming:"所选数值等于开奖号码中三位数字相加之和(不含豹子号)，即中奖。"},
			{typeId:3,name:"组选包胆", methodId:"105",mode:"0",index:33,shuoming:"从0-9中任意选择1个包胆号码，开奖号码的中三位中任意1位与所选包胆号码相同(不含豹子号)，即为中奖。"},
			{typeId:3,name:"混合组选", methodId:"35",mode:"8",index:34,shuoming:"任选一个非豹子的三位数号码，选号与开奖号中三位相同，顺序不限，即中奖。"},
			{typeId:3,name:"和值尾数", methodId:"87",mode:"0",index:35,shuoming:"所选数值等于开奖号码的千位、百位、十位三个数字相加之和的尾数，即为中奖。"},
			{typeId:3,name:"特殊号", methodId:"88",mode:"0",index:36,shuoming:"所选的号码特殊属性和开奖号码中三位属性一致，即为中奖。1、豹子：开奖号码中间三位全部相同；2、顺子：开奖号码中间三位不分顺序，呈现连号状态；3、对子：开奖号码中间三位中有任意2个号码相同。4、半顺：开奖号码中间三位不分顺序，有2个号码呈现连号状态；5、杂六：开奖号码中间三位数字非豹子、顺子、对子、半顺。"},

			{typeId:4,name:"直选复式", methodId:"12",mode:"0",index:37,shuoming:"从万、千、百位各选一个号码，选号与开奖号前3位按位一致，即中奖。"},
			{typeId:4,name:"直选单式", methodId:"12",mode:"8",index:38,shuoming:"手动输入1个三位数号码，选号与开奖号前3位按位一致，即中奖。"},
			{typeId:4,name:"直选和值", methodId:"13",mode:"0",index:39,shuoming:"所选数值等于开奖号码前三位数字相加之和，即中奖。"},
			{typeId:4,name:"直选跨度", methodId:"83",mode:"0",index:40,shuoming:"从0-9中选择1个号码组成一注，所选数值等于开奖号码的前3位最大与最小数字相减之差，即为中奖。"},
			{typeId:4,name:"组三复式", methodId:"14",mode:"0",index:41,shuoming:"从0-9中选择2个数字组成两注，选号与开奖号前三位相同，顺序不限，即中奖。"},
			{typeId:4,name:"组六复式", methodId:"15",mode:"0",index:42,shuoming:"从0-9中任意选择3个号码组成一注，选号与开奖号前三位相同，顺序不限，即中奖。"},
			{typeId:4,name:"组选和值", methodId:"16",mode:"0",index:43,shuoming:"所选数值等于开奖号码前三位数字相加之和(不含豹子号)，即中奖。"},
			{typeId:4,name:"组选包胆", methodId:"106",mode:"0",index:44,shuoming:"从0-9中任意选择1个包胆号码，开奖号码的前三位中任意1位与所选包胆号码相同(不含豹子号)，即为中奖。"},
			{typeId:4,name:"混合组选", methodId:"34",mode:"8",index:45,shuoming:"任选一个非豹子的三位数号码，选号与开奖号前三位相同，顺序不限，即中奖。"},
			{typeId:4,name:"和值尾数", methodId:"84",mode:"0",index:46,shuoming:"所选数值等于开奖号码的万位、千位、百位三个数字相加之和的尾数，即为中奖。"},
			{typeId:4,name:"特殊号", methodId:"85",mode:"0",index:47,shuoming:"所选号码特殊属性与开奖号码前3位的属性一致，即为中奖。1、豹子：开奖号码前三位全部相同；2、顺子：开奖号码前三位不分顺序，呈现连号状态；3、对子：开奖号码前三位中有任意2个号码相同。4、半顺：开奖号码前三位不分顺序，有2个号码呈现连号状态；5、杂六：开奖号码前三位数字非豹子、顺子、对子、半顺。"},

			{typeId:5,name:"直选复式", methodId:"07",mode:"0",index:48,shuoming:"从十、个位各选1个号码，选号与开奖号后两位按位一致即中奖。"},
			{typeId:5,name:"直选单式", methodId:"07",mode:"8",index:49,shuoming:"手动输入1个两位数号码，选号与开奖号后两位按位一致即中奖。"},
			{typeId:5,name:"直选和值", methodId:"08",mode:"0",index:50,shuoming:"所选数值等于开奖号码后二位数字相加之和，即中奖。"},
			{typeId:5,name:"直选跨度", methodId:"93",mode:"0",index:51,shuoming:"从0-9中选择1个号码组成一注，所选数值等于开奖号码的后2位最大与最小数字相减之差，即为中奖。"},
			{typeId:5,name:"组选复式", methodId:"09",mode:"0",index:52,shuoming:"从0-9中选择2个号码，选号与开奖号后两位相同，顺序不限（不含对子），即中奖。"},
			{typeId:5,name:"组选和值", methodId:"22",mode:"0",index:53,shuoming:"所选数值等于开奖号码后两位数字相加之和（不含对子），即中奖。"},
			{typeId:5,name:"组选包胆", methodId:"107",mode:"0",index:54,shuoming:"从0-9中任意选择1个号码，开奖号码的后二位中任意1位与所选的包胆号码相同（不含对子），即中奖。"},

			{typeId:6,name:"直选复式", methodId:"18",mode:"0",index:55,shuoming:"从万、千位各选1个号码，选号与开奖号前两位按位一致即中奖。"},
			{typeId:6,name:"直选单式", methodId:"18",mode:"8",index:56,shuoming:"手动输入1个两位数号码，选号与开奖号前两位按位一致即中奖。"},
			{typeId:6,name:"直选和值", methodId:"19",mode:"0",index:57,shuoming:"所选数值等于开奖号码前二位数字相加之和，即中奖。"},
			{typeId:6,name:"直选跨度", methodId:"92",mode:"0",index:58,shuoming:"从0-9中选择1个号码组成一注，所选数值等于开奖号码的前2位最大与最小数字相减之差，即为中奖。"},
			{typeId:6,name:"组选复式", methodId:"20",mode:"0",index:59,shuoming:"从0-9中选择2个号码，选号与开奖号前两位相同，顺序不限（不含对子），即中奖。"},
			{typeId:6,name:"组选和值", methodId:"21",mode:"0",index:60,shuoming:"所选数值等于开奖号码前两位数字相加之和（不含对子），即中奖。"},
			{typeId:6,name:"组选包胆", methodId:"108",mode:"0",index:61,shuoming:"从0-9中任意选择1个号码，开奖号码的前二位中任意1位与所选的包胆号码相同（不含对子），即中奖。"},

			{typeId:7,name:"定位胆", methodId:"10",mode:"0",index:62,shuoming:"从任意位置上至少选择一个号码，选号与相同位置上的开奖号码一致即中奖。"},

			{typeId:8,name:"后三一码", methodId:"24",mode:"0",index:63,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码后三位中包含这个号码，包含即中奖。"},
			{typeId:8,name:"后三二码", methodId:"71",mode:"0",index:64,shuoming:"从0-9中至少选择2个号码，竞猜开奖号码后三位中包含这2个号码，包含即中奖。"},
			{typeId:8,name:"前三一码", methodId:"23",mode:"0",index:65,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码前三位中包含这个号码，包含即中奖。"},
			{typeId:8,name:"前三二码", methodId:"70",mode:"0",index:66,shuoming:"从0-9中至少选择2个号码，竞猜开奖号码前三位中包含这2个号码，包含即中奖。"},
			{typeId:8,name:"后四一码", methodId:"74",mode:"0",index:67,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码后四位中包含这个号码，包含即中奖。"},
			{typeId:8,name:"后四二码", methodId:"75",mode:"0",index:68,shuoming:"从0-9中至少选择2个号码，竞猜开奖号码后四位中包含这2个号码，包含即中奖。"},
			{typeId:8,name:"前四一码", methodId:"72",mode:"0",index:69,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码前四位中包含这个号码，包含即中奖。"},
			{typeId:8,name:"前四二码", methodId:"73",mode:"0",index:70,shuoming:"从0-9中至少选择2个号码，竞猜开奖号码前四位中包含这2个号码，包含即中奖。"},
			{typeId:8,name:"五星一码", methodId:"76",mode:"0",index:71,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码中包含这个号码，包含即中奖。"},
			{typeId:8,name:"五星二码", methodId:"77",mode:"0",index:72,shuoming:"从0-9中至少选择2个号码，竞猜开奖号码中包含这2个号码，包含即中奖。"},
			{typeId:8,name:"五星三码", methodId:"78",mode:"0",index:73,shuoming:"从0-9中至少选择3个号码，竞猜开奖号码中包含这3个号码，包含即中奖。"},

			{typeId:9,name:"后二", methodId:"11",mode:"0",index:74,shuoming:"从十、个位的大小单双中各选1种属性，所选属性与开奖号码的属性相同，顺序一致，即中奖。"},
			{typeId:9,name:"后三", methodId:"79",mode:"0",index:75,shuoming:"从百、十、个位的大小单双中各选1种属性，所选属性与开奖号码的属性相同，顺序一致，即中奖。"},
			{typeId:9,name:"前二", methodId:"80",mode:"0",index:76,shuoming:"从万、千位的大小单双中各选1种属性，所选属性与开奖号码的属性相同，顺序一致，即中奖。"},
			{typeId:9,name:"前三", methodId:"81",mode:"0",index:77,shuoming:"从万、千、百位的大小单双中各选1种属性，所选属性与开奖号码的属性相同，顺序一致，即中奖。"},

			{typeId:10,name:"直选复式", methodId:"37",mode:"0",index:78,shuoming:"从至少两位上各选1个号码，选号与开奖号按位一致即中奖。"},
			{typeId:10,name:"直选单式", methodId:"37",mode:"8",index:79,shuoming:"至少勾选两个位置，手动输入1个两位数号码，选号与开奖号按位一致即中奖。"},
			{typeId:10,name:"直选和值", methodId:"59",mode:"0",index:80,shuoming:"至少选择两个位置，至少选择一个和值，所选和值与开奖号码和值相同，即中奖。"},
			{typeId:10,name:"组选复式", methodId:"60",mode:"0",index:81,shuoming:"至少选择两个位置，至少选择两个号码，所选2个位置的开奖号码与选号相同，顺序不限，即中奖。"},
			{typeId:10,name:"组选单式", methodId:"60",mode:"8",index:82,shuoming:"至少勾选两个位置，手动输入1个两位数的号码， 所选2个位置的开奖号码与输入号码相同，顺序不限，即中奖。"},
			{typeId:10,name:"组选和值", methodId:"61",mode:"0",index:83,shuoming:"至少选择两个位置，选择一个和值，所选和值与开奖号码和值（不含对子）相同，即中奖。"},

			{typeId:11,name:"直选复式", methodId:"38",mode:"0",index:84,shuoming:"从至少三位上各选1个号码，选号与开奖号码按位一致即中奖。"},
			{typeId:11,name:"直选单式", methodId:"38",mode:"8",index:85,shuoming:"至少勾选三个位置，手动输入1个三位数号码，输入号码与开奖号码按位一致即中奖。"},
			{typeId:11,name:"直选和值", methodId:"62",mode:"0",index:86,shuoming:"至少选择三个位置，至少选择一个和值，所选和值与开奖号码和值相同，即中奖。"},
			{typeId:11,name:"组三复式", methodId:"39",mode:"0",index:87,shuoming:"至少选择三个位置，至少选择两个号码，所选3个位置的开奖号码与选号相同，顺序不限，即中奖。"},
			{typeId:11,name:"组三单式", methodId:"39",mode:"8",index:88,shuoming:"至少勾选三个位置，然后输入一个组三号码，所选3个位置的开奖号码与输入号码相同，顺序不限，即中奖。"},
			{typeId:11,name:"组六复式", methodId:"40",mode:"0",index:89,shuoming:"至少选择三个位置，至少选择三个号码，所选3个位置的开奖号码与选号相同，顺序不限，即中奖。"},
			{typeId:11,name:"组六单式", methodId:"40",mode:"8",index:90,shuoming:"至少勾选三个位置，然后输入一个组六号码，所选3个位置的开奖号码与输入号码一致，顺序不限，即中奖。"},
			{typeId:11,name:"混合组选", methodId:"63",mode:"0",index:91,shuoming:"至少勾选三个位置，然后输入三个号码(不含豹子号)，所选3个位置的开奖号码与输入号码一致，顺序不限，即中奖。"},
			{typeId:11,name:"组选和值", methodId:"64",mode:"0",index:92,shuoming:"至少选择三个位置，至少选择一个和值，所选和值与开奖号码和值（不含豹子号）相同，即中奖。"},

			{typeId:12,name:"直选复式", methodId:"65",mode:"0",index:93,shuoming:"从至少四位上各选1个号码，选号与开奖号按位一致即中奖。"},
			{typeId:12,name:"直选单式", methodId:"65",mode:"8",index:94,shuoming:"至少勾选四个位置，手动输入一个四位数号码，输入号与开奖号按位一致即中奖。"},
			{typeId:12,name:"组选24", methodId:"66",mode:"0",index:95,shuoming:"至少选择四个位置，至少选择4个号码，选号与所选4个位置的开奖号码一致，顺序不限，即中奖。"},
			{typeId:12,name:"组选12", methodId:"67",mode:"0",index:96,shuoming:"至少选择四个位置，选择1个二重号和2个单号，所选4个位置的开奖号码包含单号，且二重号出现了2次，即中奖。"},
			{typeId:12,name:"组选6", methodId:"68",mode:"0",index:97,shuoming:"至少选择四个位置，选择2个二重号， 所选的2个二重号码在所选4个位置的开奖号码中分别出现2次，即中奖。"},
			{typeId:12,name:"组选4", methodId:"69",mode:"0",index:98,shuoming:"至少选择四个位置，选择1个三重号和1个单号，所选4个位置的开奖号码包含单号，且三重号码出现了3次，即中奖。"},

			{typeId:13,name:"一帆风顺", methodId:"47",mode:"0",index:99,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码中包含这个号码，包含即中奖。"},
			{typeId:13,name:"好事成双", methodId:"48",mode:"0",index:100,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码中包含这个号码且出现2次，即中奖。"},
			{typeId:13,name:"三星报喜", methodId:"49",mode:"0",index:101,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码中包含这个号码且出现3次，即中奖。"},
			{typeId:13,name:"四季发财", methodId:"50",mode:"0",index:102,shuoming:"从0-9中至少选择1个号码，竞猜开奖号码中包含这个号码且出现4次，即中奖。"},

			{typeId:14,name:"万千", methodId:"94",mode:"0",index:103,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的万位大于千位，则为龙；万位小于千位，则为虎；万位和千位相同，则为和。"},
			{typeId:14,name:"万百", methodId:"95",mode:"0",index:104,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的万位大于百位，则为龙；万位小于百位，则为虎；万位和百位相同，则为和。"},
			{typeId:14,name:"万十", methodId:"96",mode:"0",index:105,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的万位大于十位，则为龙；万位小于十位，则为虎；万位和十位相同，则为和。"},
			{typeId:14,name:"万个", methodId:"97",mode:"0",index:106,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的万位大于个位，则为龙；万位小于个位，则为虎；万位和个位相同，则为和。"},
			{typeId:14,name:"千百", methodId:"98",mode:"0",index:107,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的千位大于百位，则为龙；千位小于百位，则为虎；千位和百位相同，则为和。"},
			{typeId:14,name:"千十", methodId:"99",mode:"0",index:108,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的千位大于十位，则为龙；千位小于十位，则为虎；千位和十位相同，则为和。"},
			{typeId:14,name:"千个", methodId:"100",mode:"0",index:109,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的千位大于个位，则为龙；千位小于个位，则为虎；千位和个位相同，则为和。"},
			{typeId:14,name:"百十", methodId:"101",mode:"0",index:110,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的百位大于十位，则为龙；百位小于十位，则为虎；百位和十位相同，则为和。"},
			{typeId:14,name:"百个", methodId:"102",mode:"0",index:111,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的百位大于个位，则为龙；百位小于个位，则为虎；百位和个位相同，则为和。"},
			{typeId:14,name:"十个", methodId:"103",mode:"0",index:112,shuoming:"从龙、虎、和中任意选择1个号码形态组成一注，只要开奖号码的十位大于个位，则为龙；十位小于个位，则为虎；十位和个位相同，则为和。"},

			{typeId:15,name:"万千", methodId:"109",index:113},
			{typeId:15,name:"万百", methodId:"110",index:114},
			{typeId:15,name:"万十", methodId:"111",index:115},
			{typeId:15,name:"万个", methodId:"112",index:116},
			{typeId:15,name:"千百", methodId:"113",index:117},
			{typeId:15,name:"千十", methodId:"114",index:118},
			{typeId:15,name:"千个", methodId:"115",index:119},
			{typeId:15,name:"百十", methodId:"116",index:120},
			{typeId:15,name:"百个", methodId:"117",index:121},
			{typeId:15,name:"十个", methodId:"118",index:122},
			
			{typeId:16,name:"万千", methodId:"119",mode:"0",index:123,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的万位大于千位，则为龙；万位小于千位，则为虎。"},
			{typeId:16,name:"万百", methodId:"120",mode:"0",index:124,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的万位大于百位，则为龙；万位小于百位，则为虎。"},
			{typeId:16,name:"万十", methodId:"121",mode:"0",index:125,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的万位大于十位，则为龙；万位小于十位，则为虎。"},
			{typeId:16,name:"万个", methodId:"122",mode:"0",index:126,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的万位大于个位，则为龙；万位小于个位，则为虎。"},
			{typeId:16,name:"千百", methodId:"123",mode:"0",index:127,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的千位大于百位，则为龙；千位小于百位，则为虎。"},
			{typeId:16,name:"千十", methodId:"124",mode:"0",index:128,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的千位大于十位，则为龙；千位小于十位，则为虎。"},
			{typeId:16,name:"千个", methodId:"125",mode:"0",index:129,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的千位大于个位，则为龙；千位小于个位，则为虎。"},
			{typeId:16,name:"百十", methodId:"126",mode:"0",index:130,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的百位大于十位，则为龙；百位小于十位，则为虎。"},
			{typeId:16,name:"百个", methodId:"127",mode:"0",index:131,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的百位大于个位，则为龙；百位小于个位，则为虎。"},
			{typeId:16,name:"十个", methodId:"128",mode:"0",index:132,shuoming:"从龙、虎中任意选择1个号码形态组成一注，只要开奖号码的十位大于个位，则为龙；十位小于个位，则为虎。"}
		]
	},
	"esf":{
		playType:[
			{"name":"前三","typeId":0},
			{"name":"前二","typeId":1},
			{"name":"前一","typeId":2},
			{"name":"定位胆","typeId":3},
			{"name":"不定胆","typeId":4},
			{"name":"趣味型","typeId":5},//没有此玩法   但是此处不能直接注销  在子菜单注销
			{"name":"任选复式","typeId":6},
			{"name":"任选单式","typeId":7},
			{"name":"任选胆拖","typeId":8}
		],
		playMethod:[
			{typeId:0,name:"直选复式", methodId:"11",mode:"0",index:0,shuoming:"从前3位各选1个或多个号码投注，选号与开奖号码前3位相同，且顺序一致，即中奖。"},
			{typeId:0,name:"直选单式", methodId:"11",mode:"8",index:1,shuoming:"手动输入3个号码，所输入号码与开奖号码前3位相同，且顺序一致，即中奖。"},
			{typeId:0,name:"直选组合", methodId:"11",mode:"16",index:2,shuoming:"至少选3个号码组成6注，选号包含开奖号码前3位即中奖。"},
			{typeId:0,name:"直选胆拖", methodId:"11",mode:"1",index:3,shuoming:"胆码可选1-2个，拖码可选2-10个，胆码加拖码个数≥3个。所选单注号码与开奖号码的前三位相同，且顺序一致，即中奖。"},
			{typeId:0,name:"组选复式", methodId:"12",mode:"0",index:4,shuoming:"至少选择3个号码投注，选号包含开奖号码前3位即中奖。"},
			{typeId:0,name:"组选单式", methodId:"12",mode:"8",index:5,shuoming:"手动输入3个号码，所输入号码包含开奖号码前3位即中奖。"},
			{typeId:0,name:"组选胆拖", methodId:"12",mode:"1",index:6,shuoming:"胆码可选1-2个，拖码可选2-10个，胆码加拖码个数>3个，所选单注号码与开奖号码的前三位相同，顺序不限，即中奖。"},

			{typeId:1,name:"直选复式", methodId:"09",mode:"0",index:7,shuoming:"从前2位各选1个或多个号码，选号与开奖号码前2位相同，且顺序一致，即中奖。"},
			{typeId:1,name:"直选单式", methodId:"09",mode:"8",index:8,shuoming:"手动输入2个号码，所输入号码与开奖号码前2位相同，且顺序一致，即中奖。"},
			{typeId:1,name:"直选组合", methodId:"09",mode:"16",index:9,shuoming:"至少选2个号码组成两注，选号包含开奖号码前2位即中奖。"},
			{typeId:1,name:"直选胆拖", methodId:"09",mode:"1",index:10,shuoming:"胆码选1个，拖码可选1-10个，胆码加拖码个数≥2个。所选单注号码与开奖号码的前两位相同，且顺序一致，即中奖。"},
			{typeId:1,name:"组选复式", methodId:"10",mode:"0",index:11,shuoming:"至少选择2个号码投注，选号包含在开奖号码前2位中即中奖。"},
			{typeId:1,name:"组选单式", methodId:"10",mode:"8",index:12,shuoming:"手动输入2个号码，所输入号码包含在开奖号码前2位中即中奖。"},
			{typeId:1,name:"组选胆拖", methodId:"10",mode:"1",index:13,shuoming:"胆码选1个，拖码可选2-10个，胆码加拖码个数>2个。所选单注号码与开奖号码的前两位相同，顺序不限，即中奖。"},

			{typeId:2,name:"直选复式", methodId:"13",mode:"0",index:14,shuoming:"从第一位至少选择1个号码，选号与开奖号码第1位一致即中奖。"},

			{typeId:3,name:"前三位", methodId:"15",mode:"0",index:15,shuoming:"从第一位、第二位、第三位任意1个位置或多个位置上选择1个号码，所选号码与相同位置上的开奖号码一致，即中奖。"},

			{typeId:4,name:"前三位", methodId:"14",mode:"0",index:16,shuoming:"从01-11共11个号码中选择1个号码，每注由1个号码组成，只要当期摇出的开奖号码的前三位中包含所选号码，即中奖。"},

			{typeId:5,name:"定单双", methodId:"1000",mode:"0",index:17,shuoming:"从6种单双个数组合中选择1种组合，当开奖号码的单双个数与所选单双组合一致，即中奖。"},
			{typeId:5,name:"猜中位", methodId:"1000",mode:"0",index:18,shuoming:"从3-9中选择1个号码进行购买，所选号码与5个开奖号码按照大小顺序排列后的第3个号码相同，即中奖。"},

			{typeId:6,name:"一中一", methodId:"01",mode:"0",index:19,shuoming:"从01-11中选择1个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:6,name:"二中二", methodId:"02",mode:"0",index:20,shuoming:"从01-11中选择2个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:6,name:"三中三", methodId:"03",mode:"0",index:21,shuoming:"从01-11中选择3个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:6,name:"四中四", methodId:"04",mode:"0",index:22,shuoming:"从01-11中选择4个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:6,name:"五中五", methodId:"05",mode:"0",index:23,shuoming:"从01-11中选择5个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:6,name:"六中五", methodId:"06",mode:"0",index:24,shuoming:"从01-11中选择6个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:6,name:"七中五", methodId:"07",mode:"0",index:25,shuoming:"从01-11中选择7个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:6,name:"八中五", methodId:"08",mode:"0",index:26,shuoming:"从01-11中选择8个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},

			{typeId:7,name:"一中一", methodId:"01",mode:"8",index:27,shuoming:"从01-11中手动输入1个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:7,name:"二中二", methodId:"02",mode:"8",index:28,shuoming:"从01-11中手动输入2个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:7,name:"三中三", methodId:"03",mode:"8",index:29,shuoming:"从01-11中手动输入3个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:7,name:"四中四", methodId:"04",mode:"8",index:30,shuoming:"从01-11中手动输入4个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:7,name:"五中五", methodId:"05",mode:"8",index:31,shuoming:"从01-11中手动输入5个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:7,name:"六中五", methodId:"06",mode:"8",index:32,shuoming:"从01-11中手动输入6个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:7,name:"七中五", methodId:"07",mode:"8",index:33,shuoming:"从01-11中手动输入7个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},
			{typeId:7,name:"八中五", methodId:"08",mode:"8",index:34,shuoming:"从01-11中手动输入8个号码进行投注，只要开奖号码中包含所选号码，即中奖。"},

			{typeId:8,name:"二中二", methodId:"02",mode:"1",index:35,shuoming:"从01-11中选择2个及以上号码进行投注，每注需至少包括1个胆码及1个拖码。只要开奖号码中包含所选单注号码，即中奖。"},
			{typeId:8,name:"三中三", methodId:"03",mode:"1",index:36,shuoming:"从01-11中选择3个及以上号码进行投注，每注需至少包括1个胆码及2个拖码。只要开奖号码中包含所选单注号码，即中奖。"},
			{typeId:8,name:"四中四", methodId:"04",mode:"1",index:37,shuoming:"从01-11中选择4个及以上号码进行投注，每注需至少包括1个胆码及3个拖码。只要开奖号码中包含所选单注号码，即中奖。"},
			{typeId:8,name:"五中五", methodId:"05",mode:"1",index:38,shuoming:"从01-11中选择5个及以上号码进行投注，每注需至少包括1个胆码及4个拖码。只要开奖号码中包含所选单注号码，即中奖。"},
			{typeId:8,name:"六中五", methodId:"06",mode:"1",index:39,shuoming:"从01-11中选择6个及以上号码进行投注，每注需至少包括1个胆码及5个拖码。只要开奖号码中包含所选单注号码，即中奖。"},
			{typeId:8,name:"七中五", methodId:"07",mode:"1",index:40,shuoming:"从01-11中选择7个及以上号码进行投注，每注需至少包括1个胆码及6个拖码。只要开奖号码中包含所选单注号码，即中奖。"},
			{typeId:8,name:"八中五", methodId:"08",mode:"1",index:41,shuoming:"从01-11中选择8个及以上号码进行投注，每注需至少包括1个胆码及7个拖码。只要开奖号码中包含所选单注号码，即中奖。"}
		]
	},
	"sd":{
		playType:[
			{"name":"三星","typeId":0},
			{"name":"前二","typeId":1},
			{"name":"后二","typeId":2},
			{"name":"定位胆","typeId":3},
			{"name":"不定胆","typeId":4},
//			{"name":"大小单双","typeId":5}
		],
		playMethod:[
			{typeId:0,name:"直选复式", methodId:"01",mode:"0",index:0,shuoming:"每位至少选择一个号码，选号与开奖号码按位一致即中奖。"},
			{typeId:0,name:"直选单式", methodId:"01",mode:"8",index:1,shuoming:"手动输入3个号码，所输入选号与开奖号码按位一致即中奖。"},
			{typeId:0,name:"直选和值", methodId:"02",mode:"0",index:2,shuoming:"至少选择一个和值，竞猜开奖号码数字之和。"},
			{typeId:0,name:"直选跨度", methodId:"1000",index:3,shuoming:""},
			{typeId:0,name:"组三", methodId:"03",mode:"0",index:4,shuoming:"至少选择2个号码，开奖号为组三且包含在投注号码中，即中奖。"},
			{typeId:0,name:"组六", methodId:"05",mode:"0",index:5,shuoming:"至少选择3个号码，开奖号为组六且包含在投注号码中，即中奖。"},
			{typeId:0,name:"混合组选", methodId:"16",mode:"8",index:6,shuoming:"手动输入一个非豹子的3个号码，选号与开奖号相同，顺序不限，即中奖。"},
			{typeId:0,name:"组选和值", methodId:"1000",index:7,shuoming:""},
			{typeId:0,name:"组选包胆", methodId:"1000",index:8,shuoming:""},
			{typeId:0,name:"和值尾数", methodId:"1000",index:9,shuoming:""},
			{typeId:0,name:"特殊号码", methodId:"1000",index:10,shuoming:""},

			{typeId:1,name:"直选复式", methodId:"09",mode:"0",index:11,shuoming:"每位至少选择1个号码，选号与开奖号码前2位按位一致即中奖。"},
			{typeId:1,name:"直选单式", methodId:"09",mode:"8",index:12,shuoming:"手动输入2个号码，所输入号码与开奖号码前2位按位一致即中奖。"},
			{typeId:1,name:"直选和值", methodId:"1000",index:13,shuoming:""},
			{typeId:1,name:"直选跨度", methodId:"1000",index:14,shuoming:""},
			{typeId:1,name:"组选复式", methodId:"1000",index:15,shuoming:""},
			{typeId:1,name:"组选单式", methodId:"1000",index:16,shuoming:""},
			{typeId:1,name:"组选和值", methodId:"1000",index:17,shuoming:""},
			{typeId:1,name:"组选包胆", methodId:"1000",index:18,shuoming:""},

			{typeId:2,name:"直选复式", methodId:"11",mode:"0",index:19,shuoming:"每位至少选择1个号码，选号与开奖号码后2位按位一致即中奖。"},
			{typeId:2,name:"直选单式", methodId:"11",mode:"8",index:20,shuoming:"手动输入2个号码，所输入号码与开奖号码后2位按位一致即中奖。"},
			{typeId:2,name:"直选和值", methodId:"1000",index:21,shuoming:""},
			{typeId:2,name:"直选跨度", methodId:"1000",index:22,shuoming:""},
			{typeId:2,name:"组选复式", methodId:"1000",index:23,shuoming:""},
			{typeId:2,name:"组选单式", methodId:"1000",index:24,shuoming:""},
			{typeId:2,name:"组选和值", methodId:"1000",index:25,shuoming:""},
			{typeId:2,name:"组选包胆", methodId:"1000",index:26,shuoming:""},

			{typeId:3,name:"定位胆", methodId:"07",mode:"0",index:27,shuoming:"从任意位选择1个或多个号码，选号与开奖号码按位一致即中奖。"},

			{typeId:4,name:"一码不定胆", methodId:"08",mode:"0",index:28,shuoming:"至少选择1个号码，开奖号码包含所选号码即中奖。"},
			{typeId:4,name:"二码不定胆", methodId:"15",mode:"0",index:29,shuoming:"至少选择2个号码，开奖号码包含所选号码即中奖。"},

			{typeId:5,name:"三星大小单双", methodId:"1000",index:30,shuoming:""},
			{typeId:5,name:"前二大小单双", methodId:"1000",index:31,shuoming:""},
			{typeId:5,name:"后二大小单双", methodId:"1000",index:32,shuoming:""}
		]
	},
	"pls":{
		playType:[
			{"name":"三星","typeId":0},
			{"name":"前二","typeId":1},
			{"name":"后二","typeId":2},
			{"name":"定位胆","typeId":3},
			{"name":"不定胆","typeId":4},
//			{"name":"大小单双","typeId":5}
		],
		playMethod:[
			{typeId:0,name:"直选复式", methodId:"01",mode:"0",index:0,shuoming:"每位至少选择一个号码，选号与开奖号码按位一致即中奖。"},
			{typeId:0,name:"直选单式", methodId:"01",mode:"8",index:1,shuoming:"手动输入3个号码，所输入选号与开奖号码按位一致即中奖。"},
			{typeId:0,name:"直选和值", methodId:"02",mode:"0",index:2,shuoming:"至少选择一个和值，竞猜开奖号码数字之和。"},
			{typeId:0,name:"直选跨度", methodId:"1000",index:3,shuoming:""},
			{typeId:0,name:"组三", methodId:"03",mode:"0",index:4,shuoming:"至少选择2个号码，开奖号为组三且包含在投注号码中，即中奖。"},
			{typeId:0,name:"组六", methodId:"05",mode:"0",index:5,shuoming:"至少选择3个号码，开奖号为组六且包含在投注号码中，即中奖。"},
			{typeId:0,name:"混合组选", methodId:"16",mode:"8",index:6,shuoming:"手动输入一个非豹子的3个号码，选号与开奖号相同，顺序不限，即中奖。"},
			{typeId:0,name:"组选和值", methodId:"1000",index:7,shuoming:""},
			{typeId:0,name:"组选包胆", methodId:"1000",index:8,shuoming:""},
			{typeId:0,name:"和值尾数", methodId:"1000",index:9,shuoming:""},
			{typeId:0,name:"特殊号码", methodId:"1000",index:10,shuoming:""},

			{typeId:1,name:"直选复式", methodId:"09",mode:"0",index:11,shuoming:"每位至少选择1个号码，选号与开奖号码前2位按位一致即中奖。"},
			{typeId:1,name:"直选单式", methodId:"09",mode:"8",index:12,shuoming:"手动输入2个号码，所输入号码与开奖号码前2位按位一致即中奖。"},
			{typeId:1,name:"直选和值", methodId:"1000",index:13,shuoming:""},
			{typeId:1,name:"直选跨度", methodId:"1000",index:14,shuoming:""},
			{typeId:1,name:"组选复式", methodId:"1000",index:15,shuoming:""},
			{typeId:1,name:"组选单式", methodId:"1000",index:16,shuoming:""},
			{typeId:1,name:"组选和值", methodId:"1000",index:17,shuoming:""},
			{typeId:1,name:"组选包胆", methodId:"1000",index:18,shuoming:""},

			{typeId:2,name:"直选复式", methodId:"11",mode:"0",index:19,shuoming:"每位至少选择1个号码，选号与开奖号码后2位按位一致即中奖。"},
			{typeId:2,name:"直选单式", methodId:"11",mode:"8",index:20,shuoming:"手动输入2个号码，所输入号码与开奖号码后2位按位一致即中奖。"},
			{typeId:2,name:"直选和值", methodId:"1000",index:21,shuoming:""},
			{typeId:2,name:"直选跨度", methodId:"1000",index:22,shuoming:""},
			{typeId:2,name:"组选复式", methodId:"1000",index:23,shuoming:""},
			{typeId:2,name:"组选单式", methodId:"1000",index:24,shuoming:""},
			{typeId:2,name:"组选和值", methodId:"1000",index:25,shuoming:""},
			{typeId:2,name:"组选包胆", methodId:"1000",index:26,shuoming:""},

			{typeId:3,name:"定位胆", methodId:"07",mode:"0",index:27,shuoming:"从任意位选择1个或多个号码，选号与开奖号码按位一致即中奖。"},

			{typeId:4,name:"一码不定胆", methodId:"08",mode:"0",index:28,shuoming:"至少选择1个号码，开奖号码包含所选号码即中奖。"},
			{typeId:4,name:"二码不定胆", methodId:"15",mode:"0",index:29,shuoming:"至少选择2个号码，开奖号码包含所选号码即中奖。"},

			{typeId:5,name:"三星大小单双", methodId:"1000",index:30,shuoming:""},
			{typeId:5,name:"前二大小单双", methodId:"1000",index:31,shuoming:""},
			{typeId:5,name:"后二大小单双", methodId:"1000",index:32,shuoming:""}
		]
	},
	"plw":{
		playType:[
			{"name":"五星","typeId":0},
			{"name":"定位胆","typeId":1},
			{"name":"不定胆","typeId":2}
		],
		playMethod:[
			{typeId:0,name:"直选复式", methodId:"01",mode:"0",index:0,shuoming:"每位各选1个号码，选号与开奖号按位一致即中奖。"},
			{typeId:0,name:"直选单式", methodId:"01",mode:"8",index:1,shuoming:"手动输入1个五位数号码，选号与开奖号按位一致即中奖。"},
			{typeId:1,name:"定位胆", methodId:"02",mode:"0",index:2,shuoming:"从万、千、百、十、个任意位置上至少选择1个号码，选号与开奖号码按位一致即中奖。"},
			{typeId:2,name:"一码", methodId:"03",mode:"0",index:3,shuoming:"从0-9中至少选择一个号码，选号与开奖号码任意位一致即中奖。"}
		]
	},
	"ssl":{
		playType:[
			{"name":"三星","typeId":0},
			{"name":"前二","typeId":1},
			{"name":"后二","typeId":2},
			{"name":"前一","typeId":3},
			{"name":"后一","typeId":4}],
		playMethod:[
			{typeId:0,name:"直选复式", methodId:"01",mode:"0",index:0,shuoming:"每位至少选择1个号码，选号与开奖号码按位一致即中奖。"},
			{typeId:0,name:"直选单式", methodId:"01",mode:"8",index:1,shuoming:"手动输入3个号码，所输入号码与开奖号码按位一致即中奖。"},
			{typeId:0,name:"直选和值", methodId:"03",mode:"0",index:2,shuoming:"至少选择一个和值，竞猜开奖号码之和。"},
			{typeId:0,name:"组三", methodId:"04",mode:"0",index:3,shuoming:"至少选择2个号码，开奖号为组三且包含在投注号码中，即中奖。"},
			{typeId:0,name:"组六", methodId:"06",mode:"0",index:4,shuoming:"至少选择3个号码，开奖号为组六且包含在投注号码中，即中奖。"},

			{typeId:1,name:"直选复式", methodId:"08",mode:"0",index:5,shuoming:"每位至少选择1个号码，选号与开奖号码前2位按位一致即中奖。"},
			{typeId:1,name:"直选单式", methodId:"08",mode:"8",index:6,shuoming:"手动输入2个号码，所输入号码与开奖号码前2位按位一致即中奖。"},
			{typeId:1,name:"直选和值", methodId:"12",mode:"0",index:7,shuoming:"至少选择一个和值，竞猜开奖号码前二位之和。"},
			{typeId:1,name:"组选复式", methodId:"13",mode:"0",index:8,shuoming:"至少选择2个号码，选号与开奖号码前2位相同，顺序不限，即中奖。"},
			{typeId:1,name:"组选单式", methodId:"13",mode:"8",index:9,shuoming:"手动输入2个号码，所输入号码与开奖号码前2位相同，顺序不限，即中奖。"},

			{typeId:2,name:"直选复式", methodId:"09",mode:"0",index:10,shuoming:"每位至少选择1个号码，选号与开奖号码后2位按位一致即中奖。"},
			{typeId:2,name:"直选单式", methodId:"09",mode:"8",index:11,shuoming:"手动输入2个号码，所输入号码与开奖号码后2位按位一致即中奖。"},
			{typeId:2,name:"直选和值", methodId:"14",mode:"0",index:12,shuoming:"至少选择一个和值，竞猜开奖号码后二位之和。"},
			{typeId:2,name:"组选复式", methodId:"15",mode:"0",index:13,shuoming:"至少选择2个号码，选号与开奖号码后2位相同，顺序不限，即中奖。"},
			{typeId:2,name:"组选单式", methodId:"15",mode:"8",index:14,shuoming:"手动输入2个号码，所输入号码与开奖号码后2位相同，顺序不限，即中奖。"},

			{typeId:3,name:"直选复式", methodId:"10",mode:"0",index:15,shuoming:"从百位至少选择1个号码，选号与开奖号码第1位一致即中奖。"},

			{typeId:4,name:"直选复式", methodId:"11",mode:"0",index:16,shuoming:"从个位至少选择1个号码，选号与开奖号码最后一位一致即中奖。"}
		]
	},
	"kl8":{
		playType:[
			{"name":"任选","typeId":0},
			{"name":"趣味","typeId":1},
			{"name":"五行","typeId":2}],
		playMethod:[
			{typeId:0,name:"任选1", methodId:"01",mode:"0",index:0,shuoming:"从01-80中选择1个号码组成一注，当期开奖结果的20个号码中包含所选号码，即中奖。"},
			{typeId:0,name:"任选2", methodId:"02",mode:"0",index:1,shuoming:"从01-80中选择2-8个号码进行投注，当期开奖结果的20个号码中包含所选号码，即中奖。"},
			{typeId:0,name:"任选3", methodId:"03",mode:"0",index:2,shuoming:"从01-80中选择3-8个号码进行投注，当期开奖结果的20个号码中包含3个或2个所选号码，即中奖。不兼中兼得。"},
			{typeId:0,name:"任选4", methodId:"04",mode:"0",index:3,shuoming:"从01-80中选择4-8个号码进行投注，当期开奖结果的20个号码中包含4个、3个或2个所选号码，即中奖。不兼中兼得。"},
			{typeId:0,name:"任选5", methodId:"05",mode:"0",index:4,shuoming:"从01-80中选择5-8个号码进行投注，当期开奖结果的20个号码中包含5个、4个或3个所选号码，即中奖。不兼中兼得。"},
			{typeId:0,name:"任选6", methodId:"06",mode:"0",index:5,shuoming:"从01-80中选择6-8个号码进行投注，当期开奖结果的20个号码中包含6个、5个、4个或3个所选号码，即中奖。不兼中兼得。"},
			{typeId:0,name:"任选7", methodId:"07",mode:"0",index:6,shuoming:"从01-80中选择7-8个号码进行投注，当期开奖结果的20个号码中包含7个、6个、5个、4个或0个所选号码，即中奖。不兼中兼得。"},

			{typeId:1,name:"上下盘", methodId:"14",mode:"0",index:7,shuoming:"任选一个上下盘属性，当开奖结果的20个号码的上下盘属性与所投注的结果一致，即可中奖。"},
			{typeId:1,name:"奇偶盘", methodId:"13",mode:"0",index:8,shuoming:"选择任意一个奇偶盘属性，当开奖结果的20个号码的奇偶盘与所投注的结果一致。即可中奖。"},
			{typeId:1,name:"和值大小", methodId:"12",mode:"0",index:9,shuoming:"选择20个开奖号码的总和值的大小属性，小于810为小，等于810为和，大于810为大。"},
			{typeId:1,name:"和值单双", methodId:"11",mode:"0",index:10,shuoming:"20个开奖号码的总和值为奇数时即中“单”，为偶数时中“双”。"},
			{typeId:1,name:"和值大小单双", methodId:"15",mode:"0",index:11,shuoming:"任选一个和值大小单双属性，当开奖结果的20个号码的和值大小单双属性与所投注的结果一致，即可中奖。"},

			{typeId:2,name:"五行", methodId:"16",mode:"0",index:12,shuoming:"任选一个五行属性，当开奖结果的20个号码总和值的五行属性与所投注的结果一致，即可中奖。"}
		]
	},
	"pks":{
		playType:[
			{"name":"猜冠军","typeId":0},
			{"name":"猜冠亚军","typeId":1},
			{"name":"猜前三名","typeId":2},
			{"name":"猜前四名","typeId":3},
			{"name":"猜前五名","typeId":4},
			{"name":"定位胆","typeId":5},
			{"name":"大小","typeId":6},
			{"name":"单双","typeId":7},
			{"name":"龙虎","typeId":8},
			{"name":"冠亚车和","typeId":9},
			{"name":"龙虎斗","typeId":10},
			{"name":"大小单双","typeId":11},
			{"name":"冠亚和","typeId":12}
		],
		playMethod:[
			{typeId:0,name:"猜冠军", methodId:"11",mode:"0",index:0,shuoming:"从01-10中选择一个号码，只要开奖的冠军号码与所选的号码一致，即中奖。"},

			{typeId:1,name:"复式", methodId:"12",mode:"0",index:1,shuoming:"从01-10中选择2个号码，只要开奖的冠军、亚军号码与所选的号码相同，且顺序一致，即中奖。"},
			{typeId:1,name:"单式", methodId:"12",mode:"8",index:2,shuoming:"手动输入2个两位数号码组成一注，所选号码与开奖的冠军、亚军号码相同，且顺序一致，即中奖。"},

			{typeId:2,name:"复式", methodId:"13",mode:"0",index:3,shuoming:"从01-10中选择3个号码，只要开奖的冠军、亚军、季军号码与所选的号码相同，且顺序一致，即中奖。"},
			{typeId:2,name:"单式", methodId:"13",mode:"8",index:4,shuoming:"手动输入3个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军号码相同，且顺序一致，即中奖。"},

			{typeId:3,name:"复式", methodId:"33",mode:"0",index:5,shuoming:"从01-10中选择4个号码，只要开奖的冠军、亚军、季军、第四名的车号与所选号码相同，且顺序一致，即中奖。"},
			{typeId:3,name:"单式", methodId:"33",mode:"8",index:6,shuoming:"手动输入4个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军、第四名的车号相同，且顺序一致，即中奖。"},
			
			{typeId:4,name:"复式", methodId:"34",mode:"0",index:7,shuoming:"从01-10中选择5个号码，只要开奖的冠军、亚军、季军、第四名、第五名的车号与所选号码相同，且顺序一致，即中奖。"},
			{typeId:4,name:"单式", methodId:"34",mode:"8",index:8,shuoming:"手动输入5个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军、第四名、第五名的车号相同，且顺序一致，即中奖。"},

			{typeId:5,name:"1~5名", methodId:"14",mode:"0",index:9,shuoming:"从第一名到第五名任意位置上至少选择一个号码，所选的号码与相同位置上的开奖号码一致，即中奖。"},
			{typeId:5,name:"6~10名", methodId:"15",mode:"0",index:10,shuoming:"从第六名到第十名任意位置上至少选择一个号码，所选的号码与相同位置上的开奖号码一致，即中奖。"},

			{typeId:6,name:"冠军", methodId:"16",mode:"0",index:11,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},
			{typeId:6,name:"亚军", methodId:"17",mode:"0",index:12,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},
			{typeId:6,name:"季军", methodId:"18",mode:"0",index:13,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},

			{typeId:7,name:"冠军", methodId:"19",mode:"0",index:14,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},
			{typeId:7,name:"亚军", methodId:"20",mode:"0",index:15,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},
			{typeId:7,name:"季军", methodId:"21",mode:"0",index:16,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},

			{typeId:8,name:"冠亚军", methodId:"22",index:17,shuoming:""},
			{typeId:8,name:"冠季军", methodId:"23",index:18,shuoming:""},
			{typeId:8,name:"亚季军", methodId:"24",index:19,shuoming:""},

			{typeId:9,name:"3,4,18,19", methodId:"26",mode:"0",index:20,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"5,6,16,17", methodId:"27",mode:"0",index:21,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"7,8,14,15", methodId:"28",mode:"0",index:22,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"9,10,12,13", methodId:"29",mode:"0",index:23,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"11", methodId:"30",index:24,mode:"0",shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"大,双", methodId:"31",index:25,mode:"0",shuoming:"以冠军车号和亚军车号之和大小来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			{typeId:9,name:"小,单", methodId:"32",index:26,mode:"0",shuoming:"以冠军车号和亚军车号之和大小来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			
			{typeId:10,name:"第一名VS第十名", methodId:"35",mode:"0",index:27,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第一名大于第十名，则为龙；第一名小于第十名，则为虎。"},
			{typeId:10,name:"第二名VS第九名", methodId:"36",mode:"0",index:28,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第二名大于第九名，则为龙；第二名小于第九名，则为虎。"},
			{typeId:10,name:"第三名VS第八名", methodId:"37",mode:"0",index:29,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第三名大于第八名，则为龙；第三名小于第八名，则为虎。"},
			{typeId:10,name:"第四名VS第七名", methodId:"38",mode:"0",index:30,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第四名大于第七名，则为龙；第四名小于第七名，则为虎。"},
			{typeId:10,name:"第五名VS第六名", methodId:"39",mode:"0",index:31,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第五名大于第六名，则为龙；第五名小于第六名，则为虎。"},
			
			{typeId:11,name:"前五名", methodId:"40",mode:"0",index:32,shuoming:"从第一名到第五名任意位置上至少选择一个号码属性，所选号码属性与相同位置上的开奖号码的大小单双属性一致，即为中奖。"},
			{typeId:11,name:"后五名", methodId:"41",mode:"0",index:33,shuoming:"从第六名到第十名任意位置上至少选择一个号码属性，所选号码属性与相同位置上的开奖号码的大小单双属性一致，即为中奖。"},
			{typeId:11,name:"冠亚和", methodId:"50",mode:"0",index:34,shuoming:"以冠军车号和亚军车号之和属性来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			
			{typeId:12,name:"和值", methodId:"51",mode:"0", index:35,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			
		]
	},
	"xyft":{
		playType:[
			{"name":"猜冠军","typeId":0},
			{"name":"猜冠亚军","typeId":1},
			{"name":"猜前三名","typeId":2},
			{"name":"猜前四名","typeId":3},
			{"name":"猜前五名","typeId":4},
			{"name":"定位胆","typeId":5},
			{"name":"大小","typeId":6},
			{"name":"单双","typeId":7},
			{"name":"龙虎","typeId":8},
			{"name":"冠亚车和","typeId":9},
			{"name":"龙虎斗","typeId":10},
			{"name":"大小单双","typeId":11},
			{"name":"冠亚和","typeId":12}
		],
		playMethod:[
			{typeId:0,name:"猜冠军", methodId:"11",mode:"0",index:0,shuoming:"从01-10中选择一个号码，只要开奖的冠军号码与所选的号码一致，即中奖。"},

			{typeId:1,name:"复式", methodId:"12",mode:"0",index:1,shuoming:"从01-10中选择2个号码，只要开奖的冠军、亚军号码与所选的号码相同，且顺序一致，即中奖。"},
			{typeId:1,name:"单式", methodId:"12",mode:"8",index:2,shuoming:"手动输入2个两位数号码组成一注，所选号码与开奖的冠军、亚军号码相同，且顺序一致，即中奖。"},

			{typeId:2,name:"复式", methodId:"13",mode:"0",index:3,shuoming:"从01-10中选择3个号码，只要开奖的冠军、亚军、季军号码与所选的号码相同，且顺序一致，即中奖。"},
			{typeId:2,name:"单式", methodId:"13",mode:"8",index:4,shuoming:"手动输入3个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军号码相同，且顺序一致，即中奖。"},

			{typeId:3,name:"复式", methodId:"33",mode:"0",index:5,shuoming:"从01-10中选择4个号码，只要开奖的冠军、亚军、季军、第四名的车号与所选号码相同，且顺序一致，即中奖。"},
			{typeId:3,name:"单式", methodId:"33",mode:"8",index:6,shuoming:"手动输入4个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军、第四名的车号相同，且顺序一致，即中奖。"},
			
			{typeId:4,name:"复式", methodId:"34",mode:"0",index:7,shuoming:"从01-10中选择5个号码，只要开奖的冠军、亚军、季军、第四名、第五名的车号与所选号码相同，且顺序一致，即中奖。"},
			{typeId:4,name:"单式", methodId:"34",mode:"8",index:8,shuoming:"手动输入5个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军、第四名、第五名的车号相同，且顺序一致，即中奖。"},

			{typeId:5,name:"1~5名", methodId:"14",mode:"0",index:9,shuoming:"从第一名到第五名任意位置上至少选择一个号码，所选的号码与相同位置上的开奖号码一致，即中奖。"},
			{typeId:5,name:"6~10名", methodId:"15",mode:"0",index:10,shuoming:"从第六名到第十名任意位置上至少选择一个号码，所选的号码与相同位置上的开奖号码一致，即中奖。"},

			{typeId:6,name:"冠军", methodId:"16",mode:"0",index:11,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},
			{typeId:6,name:"亚军", methodId:"17",mode:"0",index:12,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},
			{typeId:6,name:"季军", methodId:"18",mode:"0",index:13,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},

			{typeId:7,name:"冠军", methodId:"19",mode:"0",index:14,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},
			{typeId:7,name:"亚军", methodId:"20",mode:"0",index:15,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},
			{typeId:7,name:"季军", methodId:"21",mode:"0",index:16,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},

			{typeId:8,name:"冠亚军", methodId:"22",index:17,shuoming:""},
			{typeId:8,name:"冠季军", methodId:"23",index:18,shuoming:""},
			{typeId:8,name:"亚季军", methodId:"24",index:19,shuoming:""},

			{typeId:9,name:"3,4,18,19", methodId:"26",mode:"0",index:20,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"5,6,16,17", methodId:"27",mode:"0",index:21,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"7,8,14,15", methodId:"28",mode:"0",index:22,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"9,10,12,13", methodId:"29",mode:"0",index:23,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"11", methodId:"30",index:24,mode:"0",shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"大,双", methodId:"31",index:25,mode:"0",shuoming:"以冠军车号和亚军车号之和大小来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			{typeId:9,name:"小,单", methodId:"32",index:26,mode:"0",shuoming:"以冠军车号和亚军车号之和大小来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			
			{typeId:10,name:"第一名VS第十名", methodId:"35",mode:"0",index:27,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第一名大于第十名，则为龙；第一名小于第十名，则为虎。"},
			{typeId:10,name:"第二名VS第九名", methodId:"36",mode:"0",index:28,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第二名大于第九名，则为龙；第二名小于第九名，则为虎。"},
			{typeId:10,name:"第三名VS第八名", methodId:"37",mode:"0",index:29,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第三名大于第八名，则为龙；第三名小于第八名，则为虎。"},
			{typeId:10,name:"第四名VS第七名", methodId:"38",mode:"0",index:30,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第四名大于第七名，则为龙；第四名小于第七名，则为虎。"},
			{typeId:10,name:"第五名VS第六名", methodId:"39",mode:"0",index:31,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第五名大于第六名，则为龙；第五名小于第六名，则为虎。"},
			
			{typeId:11,name:"前五名", methodId:"40",mode:"0",index:32,shuoming:"从第一名到第五名任意位置上至少选择一个号码属性，所选号码属性与相同位置上的开奖号码的大小单双属性一致，即为中奖。"},
			{typeId:11,name:"后五名", methodId:"41",mode:"0",index:33,shuoming:"从第六名到第十名任意位置上至少选择一个号码属性，所选号码属性与相同位置上的开奖号码的大小单双属性一致，即为中奖。"},
			{typeId:11,name:"冠亚和", methodId:"50",mode:"0",index:34,shuoming:"以冠军车号和亚军车号之和属性来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			
			{typeId:12,name:"和值", methodId:"51",mode:"0", index:35,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			
		]
	},
	"txsc":{
		playType:[
			{"name":"猜冠军","typeId":0},
			{"name":"猜冠亚军","typeId":1},
			{"name":"猜前三名","typeId":2},
			{"name":"猜前四名","typeId":3},
			{"name":"猜前五名","typeId":4},
			{"name":"定位胆","typeId":5},
			{"name":"大小","typeId":6},
			{"name":"单双","typeId":7},
			{"name":"龙虎","typeId":8},
			{"name":"冠亚车和","typeId":9},
			{"name":"龙虎斗","typeId":10},
			{"name":"大小单双","typeId":11},
			{"name":"冠亚和","typeId":12}
		],
		playMethod:[
			{typeId:0,name:"猜冠军", methodId:"11",mode:"0",index:0,shuoming:"从01-10中选择一个号码，只要开奖的冠军号码与所选的号码一致，即中奖。"},

			{typeId:1,name:"复式", methodId:"12",mode:"0",index:1,shuoming:"从01-10中选择2个号码，只要开奖的冠军、亚军号码与所选的号码相同，且顺序一致，即中奖。"},
			{typeId:1,name:"单式", methodId:"12",mode:"8",index:2,shuoming:"手动输入2个两位数号码组成一注，所选号码与开奖的冠军、亚军号码相同，且顺序一致，即中奖。"},

			{typeId:2,name:"复式", methodId:"13",mode:"0",index:3,shuoming:"从01-10中选择3个号码，只要开奖的冠军、亚军、季军号码与所选的号码相同，且顺序一致，即中奖。"},
			{typeId:2,name:"单式", methodId:"13",mode:"8",index:4,shuoming:"手动输入3个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军号码相同，且顺序一致，即中奖。"},

			{typeId:3,name:"复式", methodId:"33",mode:"0",index:5,shuoming:"从01-10中选择4个号码，只要开奖的冠军、亚军、季军、第四名的车号与所选号码相同，且顺序一致，即中奖。"},
			{typeId:3,name:"单式", methodId:"33",mode:"8",index:6,shuoming:"手动输入4个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军、第四名的车号相同，且顺序一致，即中奖。"},
			
			{typeId:4,name:"复式", methodId:"34",mode:"0",index:7,shuoming:"从01-10中选择5个号码，只要开奖的冠军、亚军、季军、第四名、第五名的车号与所选号码相同，且顺序一致，即中奖。"},
			{typeId:4,name:"单式", methodId:"34",mode:"8",index:8,shuoming:"手动输入5个两位数号码组成一注，所选号码与开奖的冠军、亚军、季军、第四名、第五名的车号相同，且顺序一致，即中奖。"},

			{typeId:5,name:"1~5名", methodId:"14",mode:"0",index:9,shuoming:"从第一名到第五名任意位置上至少选择一个号码，所选的号码与相同位置上的开奖号码一致，即中奖。"},
			{typeId:5,name:"6~10名", methodId:"15",mode:"0",index:10,shuoming:"从第六名到第十名任意位置上至少选择一个号码，所选的号码与相同位置上的开奖号码一致，即中奖。"},

			{typeId:6,name:"冠军", methodId:"16",mode:"0",index:11,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},
			{typeId:6,name:"亚军", methodId:"17",mode:"0",index:12,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},
			{typeId:6,name:"季军", methodId:"18",mode:"0",index:13,shuoming:"选择大或者小进行投注，只要开奖的名次对应车号的大小（01,02,03,04,05为小；06,07,08,09,10为大）与所选一致，即中奖。"},

			{typeId:7,name:"冠军", methodId:"19",mode:"0",index:14,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},
			{typeId:7,name:"亚军", methodId:"20",mode:"0",index:15,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},
			{typeId:7,name:"季军", methodId:"21",mode:"0",index:16,shuoming:"选择单或者双进行投注，只要开奖的名次对应车号的单双（01,03,05,07,09为单；02,04,06,08,10为双）与所选一致，即中奖。"},

			{typeId:8,name:"冠亚军", methodId:"22",index:17,shuoming:""},
			{typeId:8,name:"冠季军", methodId:"23",index:18,shuoming:""},
			{typeId:8,name:"亚季军", methodId:"24",index:19,shuoming:""},

			{typeId:9,name:"3,4,18,19", methodId:"26",mode:"0",index:20,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"5,6,16,17", methodId:"27",mode:"0",index:21,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"7,8,14,15", methodId:"28",mode:"0",index:22,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"9,10,12,13", methodId:"29",mode:"0",index:23,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"11", methodId:"30",index:24,mode:"0",shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			{typeId:9,name:"大,双", methodId:"31",index:25,mode:"0",shuoming:"以冠军车号和亚军车号之和大小来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			{typeId:9,name:"小,单", methodId:"32",index:26,mode:"0",shuoming:"以冠军车号和亚军车号之和大小来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			
			{typeId:10,name:"第一名VS第十名", methodId:"35",mode:"0",index:27,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第一名大于第十名，则为龙；第一名小于第十名，则为虎。"},
			{typeId:10,name:"第二名VS第九名", methodId:"36",mode:"0",index:28,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第二名大于第九名，则为龙；第二名小于第九名，则为虎。"},
			{typeId:10,name:"第三名VS第八名", methodId:"37",mode:"0",index:29,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第三名大于第八名，则为龙；第三名小于第八名，则为虎。"},
			{typeId:10,name:"第四名VS第七名", methodId:"38",mode:"0",index:30,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第四名大于第七名，则为龙；第四名小于第七名，则为虎。"},
			{typeId:10,name:"第五名VS第六名", methodId:"39",mode:"0",index:31,shuoming:"从龙、虎中任意选择1个号码形态组成一注，开奖号码的第五名大于第六名，则为龙；第五名小于第六名，则为虎。"},
			
			{typeId:11,name:"前五名", methodId:"40",mode:"0",index:32,shuoming:"从第一名到第五名任意位置上至少选择一个号码属性，所选号码属性与相同位置上的开奖号码的大小单双属性一致，即为中奖。"},
			{typeId:11,name:"后五名", methodId:"41",mode:"0",index:33,shuoming:"从第六名到第十名任意位置上至少选择一个号码属性，所选号码属性与相同位置上的开奖号码的大小单双属性一致，即为中奖。"},
			{typeId:11,name:"冠亚和", methodId:"50",mode:"0",index:34,shuoming:"以冠军车号和亚军车号之和属性来判断胜负，冠亚和大于11为大，小于或等于11为小，双数叫双，单数叫单，所选形态与之一致即为中奖。"},
			
			{typeId:12,name:"和值", methodId:"51",mode:"0", index:35,shuoming:"冠亚车号总和可能出现结果为3-19，投中对应冠亚和指定数字视为中奖，其余情形视为不中奖。"},
			
		]
	},
	"k3":{
		playType:[
			{"name":"和值","typeId":0},
			{"name":"三同号","typeId":1},
			{"name":"三不同号","typeId":2},
			{"name":"三连号","typeId":3},
			{"name":"二同号","typeId":4},
			{"name":"二不同号","typeId":5},
			{"name":"单挑一骰","typeId":6}],
		playMethod:[
			{typeId:0,name:"和值", methodId:"01",mode:"0",index:0,shuoming:"至少选择1个和值进行投注，所选和值与开奖的3个号码和值相同，即中奖。"},
			{typeId:0,name:"大小单双", methodId:"18",mode:"0",index:1,shuoming:"至少选择1个号码形态进行投注，所选形态与开奖号码的和值形态相同，即中奖。11-18为大,3-10为小。"},

			{typeId:1,name:"单选", methodId:"03",mode:"0",index:2,shuoming:"选择相同的三个号码（111、222、333、444、555、666）中的任意一个进行投注，所选号码开出，即中奖。"},
			{typeId:1,name:"通选", methodId:"02",mode:"0",index:3,shuoming:"对所有相同的三个号码（111、222、333、444、555、666）进行投注，任意号码开出，即中奖。"},

			{typeId:2,name:"标准", methodId:"06",mode:"0",index:4,shuoming:"从1-6中任选3个或多个号码，所选号码与开奖的3个号码相同，即中奖。"},
			{typeId:2,name:"胆拖", methodId:"06",mode:"1",index:5,shuoming:"选1~2个胆码，1~5个拖码，胆码加拖码不少于3个，所选的每注号码与开奖号码相同，即中奖。"},

			{typeId:3,name:"通选", methodId:"08",mode:"0",index:6,shuoming:"对所有三个相连的号码（123、234、345、456）进行投注，任意号码开出，即中奖。"},

			{typeId:4,name:"单选", methodId:"05",mode:"0",index:7,shuoming:"选择1对相同号码和1个不同号码投注，所选号码与开奖号码相同（顺序不限），即中奖。"},
			{typeId:4,name:"复选", methodId:"04",mode:"0",index:8,shuoming:"从11*、22*、33*、44*、55*、66*中任选一个或多个号码，选号包含在开奖号（顺序不限）中，即中奖。"},

			{typeId:5,name:"标准", methodId:"07",mode:"0",index:9,shuoming:"从1-6中任选2个或多个号码，所选号码与开奖号码任意2个号码相同，即中奖。"},
			{typeId:5,name:"胆拖", methodId:"07",mode:"1",index:10,shuoming:"选1个胆码，1~5个拖码，胆码加拖码不少于2个，选号与开奖号码任意2号相同，即中奖。"},

			{typeId:6,name:"单挑一骰", methodId:"09",mode:"0",index:11,shuoming:"选择一个或多个骰号，如果开奖号码中包含该号（顺序不限），即中奖。"}
		]
	},
//	"tb":{
//		playType:[
//			{"name":"和值","typeId":0},
//			{"name":"三同号","typeId":1},
//			{"name":"二同号","typeId":2},
//			{"name":"二不同号","typeId":3},
//			{"name":"猜一个号","typeId":4},
//			{"name":"和值","typeId":5}],
//		playMethod:[
//			{typeId:0,name:"和值", methodId:"10",index:0},
//
//			{typeId:1,name:"单选", methodId:"11",index:1},
//			{typeId:1,name:"通选", methodId:"12",index:2},
//
//			{typeId:2,name:"复选", methodId:"13",index:3},
//			{typeId:3,name:"二不同号", methodId:"14",index:4},
//
//			{typeId:4,name:"猜一个号", methodId:"15",index:5},
//
//			{typeId:5,name:"大小", methodId:"16",index:6},
//			{typeId:5,name:"单双", methodId:"17",index:7}
//		]
//	},
	"klsf":{
		playType:[
            {"name":"三星","typeId":0},
            {"name":"二星","typeId":1},
            {"name":"定位胆","typeId":2},
            {"name":"任选复式","typeId":3},
            {"name":"任选胆拖","typeId":4},
            {"name":"大小单双","typeId":5},
            {"name":"四季方位","typeId":6},
            {"name":"五行","typeId":7},
            {"name":"龙虎","typeId":8}
		],
		playMethod:[
            {typeId:0,name:"前三直选", methodId:"01",mode:"0",index:0,shuoming:"从第一位，第二位，第三位各选一个号码组成一注，所选号码与开奖号码前三位全部相同，且顺序一致，即为中奖。"},
            {typeId:0,name:"后三直选", methodId:"02",mode:"0",index:1,shuoming:"从第六位、第七位、第八位各选一个号码组成一注，所选号码与开奖号码后三位全部相同，且顺序一致，即为中奖。"},
            {typeId:0,name:"前三组选", methodId:"03",mode:"0",index:2,shuoming:"从01-20中任意选择3个号码组成一注，所选号码与开奖号码前三位全部相同，顺序不限，即为中奖。"},
            {typeId:0,name:"后三组选", methodId:"04",mode:"0",index:3,shuoming:"从01-20中任意选择3个号码组成一注，所选号码与开奖号码后三位全部相同，顺序不限，即为中奖。"},

            {typeId:1,name:"二星直选", methodId:"05",mode:"0",index:4,shuoming:"从第一位、第二位各选一个号码组成一注，投注的两个号码与开奖的8个号码中任2个连续号码相同且顺序一致，即为中奖。"},
            {typeId:1,name:"二星组选", methodId:"06",mode:"0",index:5,shuoming:"从1--20中任意选择两个号码组成一注，投注的两个号码与开奖的8个号码中任2个连续号码相同（顺序不限）即为中奖。"},

            {typeId:2,name:"第一位", methodId:"07",mode:"0",index:6,shuoming:"从第一位任意位置上至少选择一个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"},
            {typeId:2,name:"第二位", methodId:"08",mode:"0",index:7,shuoming:"从第二位任意位置上至少选择一个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"},
            {typeId:2,name:"第三位", methodId:"09",mode:"0",index:8,shuoming:"从第三位任意位置上至少选择一个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"},
            {typeId:2,name:"第四位", methodId:"10",mode:"0",index:9,shuoming:"从第四位任意位置上至少选择一个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"},
            {typeId:2,name:"第五位", methodId:"11",mode:"0",index:10,shuoming:"从第五位任意位置上至少选择一个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"},
            {typeId:2,name:"第六位", methodId:"12",mode:"0",index:11,shuoming:"从第六位任意位置上至少选择一个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"},
            {typeId:2,name:"第七位", methodId:"13",mode:"0",index:12,shuoming:"从第七位任意位置上至少选择一个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"},
            {typeId:2,name:"第八位", methodId:"14",mode:"0",index:13,shuoming:"从第八位任意位置上至少选择一个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"},

            {typeId:3,name:"一中一", methodId:"15",mode:"0",mode:"0",index:14,shuoming:"从01-20中选择1个号码，每注由1个号码组成，只要开奖号码包含所选号码，即为中奖。"},
            {typeId:3,name:"二中二", methodId:"16",mode:"0",index:15,shuoming:"从01-20中选择2个号码，每注由2个号码组成，只要开奖号码的任意2位包含所选的2个号码，即为中奖。"},
            {typeId:3,name:"三中三", methodId:"17",mode:"0",index:16,shuoming:"从01-20中选择3个号码，每注由3个号码组成，只要开奖号码的任意3位包含所选的3个号码，即为中奖。"},
            {typeId:3,name:"四中四", methodId:"18",mode:"0",index:17,shuoming:"从01-20中选择4个号码，每注由4个号码组成，只要开奖号码的任意4位包含所选的4个号码，即为中奖。"},
            {typeId:3,name:"五中五", methodId:"19",mode:"0",index:18,shuoming:"从01-20中选择5个号码，每注由5个号码组成，只要开奖号码的任意5位包含所选的5个号码，即为中奖。"},

            {typeId:4,name:"二中二", methodId:"16",imode:"1",index:19,shuoming:"从01-20中任意选择1个胆码以及1个以上的号码作为拖码，所选号码与开奖号码相同，即为中奖。"},
            {typeId:4,name:"三中三", methodId:"17",mode:"1",index:20,shuoming:"从01-20中任意选择1个或多个胆码以及1个以上的号码作为拖码，所选号码与开奖号码相同，即为中奖。"},
            {typeId:4,name:"四中四", methodId:"18",mode:"1",index:21,shuoming:"从01-20中任意选择1个或多个胆码以及1个以上的号码作为拖码，所选号码与开奖号码相同，即为中奖。"},
            {typeId:4,name:"五中五", methodId:"19",mode:"1",index:22,shuoming:"从01-20中任意选择1个或多个胆码以及1个以上的号码作为拖码，所选号码与开奖号码相同，即为中奖。 "},

            {typeId:5,name:"大小单双", methodId:"20",mode:"0",index:23,shuoming:"从第一位到第八位任意位置上至少选择一个以上玩法，所选玩法与相同位置上的玩法计算结果一致，即为中奖。"},
            {typeId:5,name:"大小和", methodId:"21",mode:"0",index:24,shuoming:"从大、小、和中至少选择一个玩法组成一注， 8个开奖号码之和在36-83之间为小，84为和，85-132为大。"},

            {typeId:6,name:"四季方位", methodId:"22",mode:"0",index:25,shuoming:"第一位到第八位任意位置上至少选择一个以上玩法，所选玩法与相同位置上的玩法计算结果一致，即为中奖。"},

            {typeId:7,name:"五行", methodId:"23",mode:"0",index:26,shuoming:"从第一位到第八位任意位置上至少选择一个以上玩法，所选玩法与相同位置上的玩法计算结果一致，即为中奖。"},

            {typeId:8,name:"龙", methodId:"24",mode:"0",index:27,shuoming:"从龙虎选择一种，在玩法PK（其上数字为开奖号码具体位置）中至少选择一种以上，当投注“龙” ，玩法为“1V2”，开奖号码第1位大于第2位即为中奖；当投注“虎”，玩法为“1V2”，则开奖号码第1位小于第2位即为中奖。"},
            {typeId:8,name:"虎", methodId:"25",mode:"0",index:28,shuoming:"从龙虎选择一种，在玩法PK（其上数字为开奖号码具体位置）中至少选择一种以上，当投注“龙” ，玩法为“1V2”，开奖号码第1位大于第2位即为中奖；当投注“虎”，玩法为“1V2”，则开奖号码第1位小于第2位即为中奖。"}
		]
	}
};

var LotteryId = {
	"4":{tag:"gdesf",type:"esf",name:"广东11选5"},
	"5":{tag:"jxesf",type:"esf",name:"江西11选5"},
	"16":{tag:"sdesf",type:"esf",name:"山东11选5"},
	"61":{tag:"jsesf",type:"esf",name:"11选5分分彩"},
	"63":{tag:"ksesf",type:"esf",name:"11选5三分彩"},
	"77":{tag:"shesf",type:"esf",name:"上海11选5"},
	"78":{tag:"ahesf",type:"esf",name:"安徽11选5"},
	"85":{tag:"jsuesf",type:"esf",name:"江苏11选5"},
	"101":{tag:"hljesf",type:"esf",name:"黑龙江11选5"},
	"102":{tag:"hebesf",type:"esf",name:"河北11选5"},
	"103":{tag:"lnesf",type:"esf",name:"辽宁11选5"},
	"104":{tag:"xjesf",type:"esf",name:"新疆11选5"},

	"12":{tag:"cqssc",type:"ssc",name:"重庆时时彩"},
	"14":{tag:"xjssc",type:"ssc",name:"新疆时时彩"},
	"56":{tag:"blydwfc",type:"ssc",name:"韩国1.5分彩"},
	"71":{tag:"tjssc",type:"ssc",name:"天津时时彩"},
	"72":{tag:"hgydwfc",type:"ssc",name:"老韩国1.5分彩"},
	"73":{tag:"twwfc",type:"ssc",name:"台湾五分彩"},
	"74":{tag:"xjplfc",type:"ssc",name:"新加坡2分彩"},
	"75":{tag:"djydwfc",type:"ssc",name:"东京1.5分彩"},
	"76":{tag:"jndsdwfc",type:"ssc",name:"加拿大3.5分彩"},
	"50":{tag:"mmc",type:"ssc",name:"永胜秒秒彩"},
	"51":{tag:"jsffc",type:"ssc",name:"永胜1分彩"},
	"53":{tag:"jssfc",type:"ssc",name:"永胜3分彩"},
	"55":{tag:"bxwfc",type:"ssc",name:"永胜5分彩"},
	"57":{tag:"txffc",type:"ssc",name:"奇趣腾讯分分彩"},
	"59":{tag:"tenxunffc",type:"ssc",name:"腾讯分分彩"},
	"58":{tag:"qqffc",type:"ssc",name:"QQ分分彩"},
	"86":{tag:"bjssc",type:"ssc",name:"北京时时彩"},
	"66":{tag:"blanydwfc",type:"ssc",name:"菲律宾1.5分彩"},
	"43":{tag:"wxydwfc",type:"ssc",name:"微信1.5分彩"},
	"44":{tag:"ldydwfc",type:"ssc",name:"巴黎1.5分彩"},
	"48":{tag:"tenxffc",type:"ssc",name:"QQ分分彩"},
	"49":{tag:"wbffc",type:"ssc",name:"微博分分彩"},
	"93":{tag:"beijssc",type:"ssc",name:"北京时时彩"},
	"94":{tag:"taiwwfc",type:"ssc",name:"台湾五分彩"},
	"108":{tag:"txlfcd",type:"ssc",name:"腾讯2分彩-单"},
	"109":{tag:"txlfcs",type:"ssc",name:"腾讯2分彩-双"},
	"110":{tag:"txsfc",type:"ssc",name:"腾讯3分彩"},
	"111":{tag:"txwfc",type:"ssc",name:"腾讯5分彩"},
	"112":{tag:"wbyfc",type:"ssc",name:"微博分分彩"},
	"113":{tag:"wbwfc",type:"ssc",name:"微博五分彩"},
	"115":{tag:"hljssc",type:"ssc",name:"黑龙江时时彩"},
	"116":{tag:"hnwfc",type:"ssc",name:"河内5分彩"},
	"117":{tag:"hnssc",type:"ssc",name:"河内时时彩"},
	"118":{tag:"hnffc",type:"ssc",name:"河内1分彩"},
	"119":{tag:"bianffc",type:"ssc",name:"币安分分彩"},

	"9":{tag:"bjklb",type:"kl8",name:"北京快乐8"},
	"79":{tag:"hgklb",type:"kl8",name:"韩国快乐8"},
	"80":{tag:"twklb",type:"kl8",name:"台湾快乐8"},
	"91":{tag:"beijklb",type:"kl8",name:"北京快乐8"},
	"92":{tag:"taiwklb",type:"kl8",name:"台湾快乐8"},
	
	"114":{tag:"txsc",type:"pks",name:"奇趣腾讯赛车"},
	"10":{tag:"pks",type:"pks",name:"北京PK拾"},
	"11":{tag:"xyft",type:"pks",name:"幸运飞艇"},
	"15":{tag:"shssl",type:"ssl",name:"上海时时乐"},
	"17":{tag:"pls",type:"pls",name:"排列三"},
	"18":{tag:"plw",type:"plw",name:"排列五"},
	"84":{tag:"ffsd",type:"sd",name:"3D分分彩"},
	"19":{tag:"fcsd",type:"sd",name:"福彩3D"},

	"26":{tag:"jsks",type:"k3",name:"江苏快3"},
	"81":{tag:"jlks",type:"k3",name:"吉林快3"},
	"82":{tag:"ahks",type:"k3",name:"安徽快3"},
	"83":{tag:"hbks",type:"k3",name:"湖北快3"},
	"21":{tag:"jskstb",type:"tb",name:"江苏骰宝"},
	"87":{tag:"jlkstb",type:"tb",name:"吉林骰宝"},
	"88":{tag:"ahkstb",type:"tb",name:"安徽骰宝"},
	"89":{tag:"hbkstb",type:"tb",name:"湖北骰宝"},
	"90":{tag:"cqklsf",type:"klsf",name:"重庆幸运农场"}
};

var LotteryTag = {
	"ahesf":{id:"78",type:"esf",name:"安徽11选5"},
	"jsesf":{id:"61",type:"esf",name:"11选5分分彩"},
	"ksesf":{id:"63",type:"esf",name:"11选5三分彩"},
	"gdesf":{id:"4",type:"esf",name:"广东11选5"},
	"shesf":{id:"77",type:"esf",name:"上海11选5"},
	"jxesf":{id:"5",type:"esf",name:"江西11选5"},
	"sdesf":{id:"16",type:"esf",name:"山东11选5"},
	"jsuesf":{id:"85",type:"esf",name:"江苏11选5"},
	"hljesf":{id:"101",type:"esf",name:"黑龙江11选5"},
	"hebesf":{id:"102",type:"esf",name:"河北11选5"},
	"lnesf":{id:"103",type:"esf",name:"辽宁11选5"},
	"xjesf":{id:"104",type:"esf",name:"新疆11选5"},

	"mmc":{id:"50",type:"ssc",name:"永胜秒秒彩"},
	"jsffc":{id:"51",type:"ssc",name:"永胜1分彩"},
	"jssfc":{id:"53",type:"ssc",name:"永胜3分彩"},
	"bxwfc":{id:"55",type:"ssc",name:"永胜5分彩"},
	"cqssc":{id:"12",type:"ssc",name:"重庆时时彩"},
	"xjssc":{id:"14",type:"ssc",name:"新疆时时彩"},
	"tjssc":{id:"71",type:"ssc",name:"天津时时彩"},
	"hgydwfc":{id:"72",type:"ssc",name:"老韩国1.5分彩"},
	"blydwfc":{id:"56",type:"ssc",name:"韩国1.5分彩"},
	"twwfc":{id:"73",type:"ssc",name:"台湾五分彩"},
	"djydwfc":{id:"75",type:"ssc",name:"东京1.5分彩"},
	"jndsdwfc":{id:"76",type:"ssc",name:"加拿大3.5分彩"},
	"xjplfc":{id:"74",type:"ssc",name:"新加坡2分彩"},
	"txffc":{id:"57",type:"ssc",name:"奇趣腾讯分分彩"},
	"tenxunffc":{id:"59",type:"ssc",name:"腾讯分分彩"},
	"qqffc":{id:"58",type:"ssc",name:"QQ分分彩"},
	"bjssc":{id:"86",type:"ssc",name:"北京时时彩"},
	"blanydwfc":{id:"66",type:"ssc",name:"菲律宾1.5分彩"},
	"wxydwfc":{id:"43",type:"ssc",name:"微信1.5分彩"},
	"ldydwfc":{id:"44",type:"ssc",name:"巴黎1.5分彩"},
	"tenxffc":{id:"48",type:"ssc",name:"QQ分分彩"},
	"wbffc":{id:"49",type:"ssc",name:"微博分分彩"},
	"beijssc":{id:"93",type:"ssc",name:"北京时时彩"},
	"taiwwfc":{id:"94",type:"ssc",name:"台湾五分彩"},
	"txlfcd":{id:"108",type:"ssc",name:"腾讯2分彩-单"},
	"txlfcs":{id:"109",type:"ssc",name:"腾讯2分彩-双"},
	"txsfc":{id:"110",type:"ssc",name:"腾讯3分彩"},
	"txwfc":{id:"111",type:"ssc",name:"腾讯5分彩"},
	"wbyfc":{id:"112",type:"ssc",name:"微博分分彩"},
	"wbwfc":{id:"113",type:"ssc",name:"微博五分彩"},
	"hljssc":{id:"115",type:"ssc",name:"黑龙江时时彩"},
	"hnwfc":{id:"116",type:"ssc",name:"河内5分彩"},
	"hnssc":{id:"117",type:"ssc",name:"河内时时彩"},
	"hnffc":{id:"118",type:"ssc",name:"河内1分彩"},
	"bianffc":{id:"119",type:"ssc",name:"币安分分彩"},
	
	"bjklb":{id:"9",type:"kl8",name:"北京快乐8"},
	"hgklb":{id:"79",type:"kl8",name:"韩国快乐8"},
	"twklb":{id:"80",type:"kl8",name:"台湾快乐8"},
	"beijklb":{id:"91",type:"kl8",name:"北京快乐8"},
	"taiwklb":{id:"92",type:"kl8",name:"台湾快乐8"},
	
	"txsc":{id:"114",type:"pks",name:"奇趣腾讯赛车"},
	"pks":{id:"10",type:"pks",name:"北京PK拾"},
	"xyft":{id:"11",type:"pks",name:"幸运飞艇"},
	"shssl":{id:"15",type:"ssl",name:"上海时时乐"},
	"pls":{id:"17",type:"pls",name:"排列三"},
	"plw":{id:"18",type:"plw",name:"排列五"},
	"ffsd":{id:"84",type:"sd",name:"3D分分彩"},
	"fcsd":{id:"19",type:"sd",name:"福彩3D"},

	"jsks":{id:"26",type:"k3",name:"江苏快3"},
	"jlks":{id:"81",type:"k3",name:"吉林快3"},
	"ahks":{id:"82",type:"k3",name:"安徽快3"},
	"hbks":{id:"83",type:"k3",name:"湖北快3"},
	"jskstb":{id:"21",type:"tb",name:"江苏骰宝"},
	"jlkstb":{id:"87",type:"tb",name:"吉林骰宝"},
	"ahkstb":{id:"88",type:"tb",name:"安徽骰宝"},
	"hbkstb":{id:"89",type:"tb",name:"湖北骰宝"},
	"cqklsf":{id:"90",type:"klsf",name:"重庆幸运农场"}
};

var LotteryStorage = {
	"fcsd" : {"line1" : [] , "line2" : [] , "line3" : []},
	"ffsd" : {"line1" : [] , "line2" : [] , "line3" : []},
	"pls" : {"line1" : [] , "line2" : [] , "line3" : []},
	"plw" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"jsesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"ksesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"gdesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"jxesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"sdesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"shesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"ahesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"jsuesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"hljesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"hebesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"lnesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	"xjesf" : {"line1" : [] , "line2" : [] , "line3" : []},
	
	"shssl" : {"line1" : [] , "line2" : [] , "line3" : []},
	"jsffc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"bxwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"jssfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"mmc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"cqssc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"xjssc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"tjssc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"hgydwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"blydwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"twwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"taiwwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"djydwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"jndsdwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"xjplfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"txffc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"tenxunffc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"qqffc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"bjssc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"beijssc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"blanydwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"wxydwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"ldydwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"tenxffc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"wbffc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"txlfcd" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"txlfcs" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"txsfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"txwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"wbyfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"wbwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"hljssc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"hnwfc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"hnssc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"hnffc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"bianffc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	
	"txsc" : {"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"bjklb":{"line1":[]},
	"beijklb":{"line1":[]},
	"hgklb":{"line1":[]},
	"twklb":{"line1":[]},
	"taiwklb":{"line1":[]},
	"pks":{"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"xyft":{"line1" : [] , "line2" : [] , "line3" : [] , "line4" : [] , "line5" : []},
	"jsks":{"line1" : [] , "line2" : []},
	"jlks":{"line1" : [] , "line2" : []},
	"ahks":{"line1" : [] , "line2" : []},
	"hbks":{"line1" : [] , "line2" : []},
	"jskstb":{"line1" : [] , "line2" : []},
	"jlkstb":{"line1" : [] , "line2" : []},
	"ahkstb":{"line1" : [] , "line2" : []},
	"hbkstb":{"line1" : [] , "line2" : []},
	"cqklsf":{"line1" : [] , "line2" : [], "line3" : [] , "line4" : [] , "line5" : [], "line6" : [] , "line7" : [] , "line8" : []}
};

//判断购买方式  :普通投注、胆拖投注、组合投注、方案粘贴投注、复式投注
function getBuyMode1(id) {
	if ((Number(id) & 1)==1) {
		return "胆拖";
	} else if ((Number(id) & 16)==16) {
		return "组合";
	} else if ((Number(id) & 8)==8) {
		return "单式";
	} else if((Number(id) & 0)==0){
		return "复式";
	}
}
//判断 快3 - 胆拖 或者 标准
function getBuyMode2(id){
	if ((Number(id) & 1)==1) {
		return "胆拖";
	} else if((Number(id) & 0)==0){
		return "标准";
	}
}

var LotteryInfo = {
	//获取彩种名称
	getName:function (category,lottery){
		return LC[category][lottery]["name"];
	},
	//获取彩种ID
	getId:function (category,lottery) {
		return LC[category][lottery]["lotteryId"];
	},
	//获取彩种LOGO
	getLogo:function (category,lottery) {
		return LC[category][lottery]["logo"];
	},
	//获取彩种类型
	getType:function (category,lottery) {
		return LC[category][lottery]["type"];
	},
	//获取一级玩法名称
	getPlayName:function (category,typeId) {
		return PC[category]["playType"][typeId]["name"];
	},
	//获取一级玩法ID
	getPlayId:function (category,typeId) {
		return PC[category]["playType"][typeId]["typeId"];
	},
	//获取二级玩法名称
	getMethodName:function (category,index) {
		return PC[category]["playMethod"][index]["name"];
	},
	//获取二级玩法ID
	getMethodId:function (category,index) {
		return PC[category]["playMethod"][index]["methodId"];
	},
	//获取二级玩法索引
	getMethodIndex:function (category,index) {
		return PC[category]["playMethod"][index]["index"];
	},
	//获取彩种名称
	getLotteryNameById:function(lotteryId){
		if (LotteryId.hasOwnProperty(lotteryId)){
			return LotteryId[lotteryId]["name"];
		}
	},
	//获取彩种标识
	getLotteryTagById:function(lotteryId){
		if (LotteryId.hasOwnProperty(lotteryId)){
			return LotteryId[lotteryId]["tag"];
		}
	},
	//获取彩种类型
	getLotteryTypeById:function(lotteryId){
		if (LotteryId.hasOwnProperty(lotteryId)){
			return LotteryId[lotteryId]["type"];
		}
	},
	//获取彩种Logo
	getLotteryLogoById:function(lotteryId){
		if (LotteryId.hasOwnProperty(lotteryId)){
			return LC[this.getLotteryTypeById(lotteryId)][this.getLotteryTagById(lotteryId)]["logo"];
		}
	},
	//获取玩法ID
	getPlayMethodId:function (category,lottery,index) {
		return this.getId(category,lottery) + this.getMethodId(category,index);
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
		$.each(PC[type]["playMethod"],function (index,item) {
			if (item.methodId == methodId){ //匹配二级标题
				array.push(item);
				var playName = PC[type]["playType"][item["typeId"]]["name"];

				if((type == "pls" || type == "sd") && item["typeId"] == "4"){//排列3  3D不定胆
					result = playName+ "_" +item["name"].substring(0,2);
				}else if(type == "ssc" && item["typeId"] == "7"){//时时彩定位胆
					result = playName+ "_" +item["name"];
				}else if(type == "ssc" && item["typeId"] == "9"){//时时彩大小单双
					result = item["name"]+playName;
				}else if(type == "esf" && (item["typeId"] == "3" || item["typeId"] == "4")){//11选5定位胆/不定胆
					result = item["name"]+playName;
				}else if(type == "esf" && item["typeId"] == "2"){//11选5前一
					result = playName;
				}else if(type == "ssl" && (item["typeId"] == "3" || item["typeId"] == "4")){//上海时时乐前一/后一
					result = playName;
				}else if (playName != item["name"]){
					result = playName+ "_" +item["name"];
				}else{
					result = playName;
				}
			}
		});
		
		if(type == "pks"){//2019.5.13  pks新玩法处理
			if(methodId == "40" || methodId == "41"|| methodId == "42"|| methodId == "43"|| methodId == "44"
				|| methodId == "45"|| methodId == "46"|| methodId == "47"|| methodId == "48"|| methodId == "49"){
				var arr=["冠军","亚军","季军","第四名","第五名","第六名","第七名","第八名","第九名","第十名"]
				result = "大小单双" + "_" + arr[Number(methodId.replace("4",""))];
			}else if(methodId == "50"){
				result = "大小单双" + "_" + "冠亚和";
			}else if(methodId == "51"){
				result = "冠亚和" + "_" + "和值";
			}
		}
					
					
		if (array.length > 1){
			if (type == 'esf'){
				$.each(array,function (index,item) {
					var Pname = PC[type]["playType"][item.typeId]["name"];
					if (Pname.indexOf(getBuyMode1(id))!=-1){  //如果 esf 一级标题含有“组合，复式，单式，胆拖”
						result = PC[type]["playType"][item.typeId]["name"] + "_" + item["name"];
						return false;
					}else{
						result = Pname + "_" + item["name"];
						if (item["name"].indexOf(getBuyMode1(id))!=-1){  //如果 esf 二级标题含有“组合，复式，单式，胆拖”
							result = Pname + "_" +	item["name"];
							return false;
						}
					}
				});
			}else{
				$.each(array,function (index,item) {
					var name = item["name"];
					if(type == "k3"){
						if (name.indexOf(getBuyMode2(id))!=-1){
							result = PC[type]["playType"][item.typeId]["name"] + "_" + name;
						}
					}else{
						if (name.indexOf(getBuyMode1(id))!=-1){
							result = PC[type]["playType"][item.typeId]["name"] + "_" + name;
						}
					}
				})
			}
		}
		return result;
	},
	//获取PlayType长度
	getPlayLength:function(type){
		return PC[type]["playType"].length;
	},
	//获取PlayMethod长度
	getMethodLength:function(type){
		return PC[type]["playMethod"].length;
	},
	//获取PlayMethod数组
	getMethodArry:function(type){
		return PC[type]["playMethod"];
	},
	//获取一级玩法typeId
	getPlayTypeId:function (type,index) {
		return PC[type]["playType"][index]["typeId"];
	},
	//获取二级玩法typeId
	getMethodTypeId:function (type,index) {
		return PC[type]["playMethod"][index]["typeId"];
	},
	//获取彩种ID（Tag）
	getLotteryIdByTag:function (lotteryTag) {
		return LotteryTag[lotteryTag]["id"];
	},
	//获取彩种名称（Tag）
	getLotteryNameByTag:function (lotteryTag) {
		return LotteryTag[lotteryTag]["name"];
	},
	//获取彩种类型（Tag）
	getLotteryTypeByTag:function (lotteryTag) {
		return LotteryTag[lotteryTag]["type"];
	},
	//获取玩法说明
	getMethodShuoming:function (category,index) {
		return PC[category]["playMethod"][index]["shuoming"];
	},
};

/* ------------------- ↓ 个人中心配置项 ↓ ------------------- */

//@ 添加银行卡 - 银行名称及其图标路径
var bankValue = {
	icbc : {name:'中国工商银行',logo:'images/bank/icbc.png'},
	abc : {name:'中国农业银行',logo:'images/bank/abc.png'},
	ccb : {name:'中国建设银行',logo:'images/bank/ccb.png'},
	comm : {name:'交通银行',logo:'images/bank/comm.png'},
	cmb : {name:'招商银行',logo:'images/bank/cmb.png'},
	boc : {name:'中国银行',logo:'images/bank/boc.png'},
	cib : {name:'兴业银行',logo:'images/bank/cib.png'},
	bos : {name:'上海银行',logo:'images/bank/bos.png'},
	citic : {name:'中信银行',logo:'images/bank/citic.png'},
    ecitic : {name:'中信银行'},  //充值
	ceb : {name:'中国光大银行',logo:'images/bank/ceb.png'},
	psbc : {name:'邮政储蓄银行',logo:'images/bank/psbc.png'},
	sdb : {name:'平安银行',logo:'images/bank/sdb.png'},
    cpb : {name:'平安银行',logo:'images/bank/sdb.png'},  //充值
	cmbc : {name:'民生银行',logo:'images/bank/cmbc.png'},
	hxb : {name:'华夏银行',logo:'images/bank/hxb.png'},
	spdb : {name:'上海浦东发展银行',logo:'images/bank/spdb.png'},
	bob : {name:'北京银行',logo:'images/bank/bob.png'},
	cbhb : {name:'渤海银行',logo:'images/bank/cbhb.png'},
	gzb : {name:'广州银行',logo:'images/bank/gzb.png'},
	bod : {name:'东莞银行',logo:'images/bank/bod.png'},
	hzb : {name:'杭州银行',logo:'images/bank/hzb.png'},
	czb : {name:'浙商银行',logo:'images/bank/czb.png'},
	gdb : {name:'广发银行',logo:'images/bank/gdb.png'},
	nbb : {name:'宁波银行',logo:'images/bank/nbb.png'},
	njcb : {name:'南京银行'}  //充值
};

/*  @ 充值方式配置表 - 添加新充值方式在 rechargeID 中配置即可
 * key：ID值
 * IsMobile:是否可在手机端充值（1是0否）; IsOnline:是否为在线充值方式（1是0否）; name:充值名称（String）; typeID:另一个ID值.
 */
var rechargeID = {
	'16': { IsMobile : 0, IsOnline : 0, typeID : 5, name : '在线支付' },
	'17': { IsMobile : 0, IsOnline : 0, typeID : 8, name : '在线支付' },
	'19': { IsMobile : 0, IsOnline : 0, typeID : 9, name : '在线支付' },
	'20': { IsMobile : 0, IsOnline : 0, typeID : 14, name : '在线支付' },
	'21': { IsMobile : 0, IsOnline : 0, typeID : 15, name : '' },
	'22': { IsMobile : 0, IsOnline : 0, typeID : 16, name : '' },
	'23': { IsMobile : 0, IsOnline : 0, typeID : 18, name : '' },
	'24': { IsMobile : 0, IsOnline : 0, typeID : 19, name : '' },
	'25': { IsMobile : 0, IsOnline : 0, typeID : 20, name : '' },
	'26': { IsMobile : 1, IsOnline : 1, typeID : 21, name : '' },
	'27': { IsMobile : 1, IsOnline : 1, typeID : 22, name : 'WECHAT' },
	'28': { IsMobile : 1, IsOnline : 1, typeID : 23, name : 'NOCARD' },
	'29': { IsMobile : 0, IsOnline : 0, typeID : 24, name : '' },
	'30': { IsMobile : 0, IsOnline : 0, typeID : 25, name : '' },
	'31': { IsMobile : 1, IsOnline : 1, typeID : 26, name : 'gfbapp' },
	'151': { IsMobile : 1, IsOnline : 0, typeID : 6, name : 'icbc' },
	'152': { IsMobile : 1, IsOnline : 0, typeID : 12, name : 'cmb' },
	'153': { IsMobile : 1, IsOnline : 0, typeID : 11, name : 'ccb' },
	'154': { IsMobile : 1, IsOnline : 0, typeID : 10, name : 'alipay' },
	'155': { IsMobile : 1, IsOnline : 0, typeID : 13, name : 'tenpay' },
	'156': { IsMobile : 1, IsOnline : 0, typeID : 17, name : 'cmbc' }
	// '158': { IsMobile : 1, IsOnline : 0, typeID : 72, name : 'abc' }
};

//@ 充值限额：金额列表
var chargeLimitMoney = [5000,3000,2000,1000,500,300,200,100,50];


// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


function golba_PageName(){
	var strUrl=location.href;
	var arrUrl=strUrl.split("/");
	var strPage=arrUrl[arrUrl.length-1];
	return strPage.slice(0, strPage.length-4);
}

//设置单笔最低投注额为****元   后台动态配置，登录拿取；
function check_SingleBettingAmount(tagString){
	if(Number($(tagString).html()) < localStorageUtils.getParam("MinBetMoney")){
		toastUtils.showToast("单笔最低投注额为" + localStorageUtils.getParam("MinBetMoney") + "元",2000);
		return false;
	}
	return true;
}

//后台控制代理是否可以投注
function check_AgentCanBetting(){
	var isAgent = localStorageUtils.getParam("IsAgent");
	var CommonFlag = Number(localStorageUtils.getParam("CommonFlag"));
	if(isAgent == "true" && (CommonFlag & 8) != 8){
		toastUtils.showToast("您的账号不允许投注");
		return false;
	}
	return true;
}

//报表颜色设置；
function checkValue(value)
{
	value = Number(value);
	var cssTyle;
	
	if(value > 0){
		cssTyle = "cssTyleGreen";
	}
	if(value == 0){
		cssTyle = "cssTyleBlack";
	}
	if(value < 0){
		cssTyle = "cssTyleRed";
	}
	return cssTyle;
}

//单一登录提示
function signLoginTips(data)
{
/*	if(data && data.Code && data.Code == 402) {
		toastUtils.showToast("账号已在另一台设备登录");
		loginAgain();
		return;
	}*/
}
