/*
Ajax 三级省市联动(兼容JQM)

settings 参数说明
-----
url:省市数据josn文件路径
prov:默认省份
city:默认城市
dist:默认地区（县）
nodata:无数据状态(hidden为隐藏,block显示空白)
required:必选项
------------------------------ */
(function($){
	var data=[{"id":"0","text":"请选择省份","city":[{"id":"00","text":"请选择市区"}]},{"id":"1","text":"北京市","city":[{"id":"100","text":"东城区"},{"id":"101","text":"西城区"},{"id":"102","text":"崇文区"},{"id":"103","text":"宣武区"},{"id":"104","text":"朝阳区"},{"id":"105","text":"海淀区"},{"id":"106","text":"丰台区"},{"id":"107","text":"石景山区"},{"id":"108","text":"房山区"},{"id":"109","text":"通州区"},{"id":"110","text":"顺义区"},{"id":"111","text":"门头沟区"},{"id":"112","text":"昌平区"},{"id":"113","text":"大兴区"},{"id":"114","text":"怀柔区"},{"id":"115","text":"平谷区"},{"id":"116","text":"密云县"},{"id":"117","text":"延庆县"}]},{"id":"2","text":"上海市","city":[{"id":"200","text":"黄浦区"},{"id":"201","text":"卢湾区"},{"id":"202","text":"徐汇区"},{"id":"203","text":"长宁区"},{"id":"204","text":"静安区"},{"id":"205","text":"普陀区"},{"id":"206","text":"闸北区"},{"id":"207","text":"虹口区"},{"id":"208","text":"杨浦区"},{"id":"209","text":"宝山区"},{"id":"210","text":"闵行区"},{"id":"211","text":"嘉定区"},{"id":"212","text":"浦东新区"},{"id":"213","text":"金山区"},{"id":"214","text":"松江区"},{"id":"215","text":"青浦区"},{"id":"216","text":"南汇区"},{"id":"217","text":"奉贤区"},{"id":"218","text":"崇明县"}]},{"id":"3","text":"天津市","city":[{"id":"300","text":"和平区"},{"id":"301","text":"河东区"},{"id":"302","text":"河西区"},{"id":"303","text":"南开区"},{"id":"304","text":"河北区"},{"id":"305","text":"红桥区"},{"id":"306","text":"塘沽区"},{"id":"307","text":"汉沽区"},{"id":"308","text":"大港区"},{"id":"309","text":"东丽区"},{"id":"310","text":"西青区"},{"id":"311","text":"津南区"},{"id":"312","text":"北辰区"},{"id":"313","text":"武清区"},{"id":"314","text":"宝坻区"},{"id":"315","text":"宁河县"},{"id":"316","text":"静海县"},{"id":"317","text":"蓟县"}]},{"id":"4","text":"重庆市","city":[{"id":"400","text":"渝中区"},{"id":"401","text":"大渡口区"},{"id":"402","text":"江北区"},{"id":"403","text":"沙坪坝区"},{"id":"404","text":"九龙坡区"},{"id":"405","text":"南岸区"},{"id":"406","text":"北碚区"},{"id":"407","text":"万盛区"},{"id":"408","text":"双桥区"},{"id":"409","text":"渝北区"},{"id":"410","text":"巴南区"},{"id":"411","text":"万县区"},{"id":"412","text":"涪陵区"},{"id":"413","text":"永川市"},{"id":"414","text":"合川市"},{"id":"415","text":"江津市"},{"id":"416","text":"南川市"},{"id":"417","text":"长寿县"},{"id":"418","text":"綦江县"},{"id":"419","text":"潼南县"},{"id":"420","text":"荣昌县"},{"id":"421","text":"壁山县"},{"id":"422","text":"大足县"},{"id":"423","text":"铜梁县"},{"id":"424","text":"梁平县"},{"id":"425","text":"城口县"},{"id":"426","text":"垫江县"},{"id":"427","text":"武隆县"},{"id":"428","text":"丰都县"},{"id":"429","text":"忠 县"},{"id":"430","text":"开 县"},{"id":"431","text":"云阳县"},{"id":"432","text":"青龙镇青龙嘴"},{"id":"433","text":"奉节县"},{"id":"434","text":"巫山县"},{"id":"435","text":"巫溪县"},{"id":"436","text":"南宾镇"},{"id":"437","text":"中和镇"},{"id":"438","text":"钟多镇"},{"id":"439","text":"联合镇"},{"id":"440","text":"汉葭镇"}]},{"id":"5","text":"河北省","city":[{"id":"500","text":"石家庄市"},{"id":"501","text":"唐山市"},{"id":"502","text":"秦皇岛市"},{"id":"503","text":"邯郸市"},{"id":"504","text":"邢台市"},{"id":"505","text":"保定市"},{"id":"506","text":"张家口市"},{"id":"507","text":"承德市"},{"id":"508","text":"沧州市"},{"id":"509","text":"廊坊市"},{"id":"510","text":"衡水市"}]},{"id":"6","text":"山西省","city":[{"id":"600","text":"太原市"},{"id":"601","text":"大同市"},{"id":"602","text":"阳泉市"},{"id":"603","text":"长治市"},{"id":"604","text":"晋城市"},{"id":"605","text":"朔州市"},{"id":"606","text":"晋中市"},{"id":"607","text":"运城市"},{"id":"608","text":"忻州市"},{"id":"609","text":"临汾市"},{"id":"610","text":"吕梁市"}]},{"id":"7","text":"辽宁省","city":[{"id":"700","text":"沈阳市"},{"id":"701","text":"大连市"},{"id":"702","text":"鞍山市"},{"id":"703","text":"抚顺市"},{"id":"704","text":"本溪市"},{"id":"705","text":"丹东市"},{"id":"706","text":"锦州市"},{"id":"707","text":"营口市"},{"id":"708","text":"阜新市"},{"id":"709","text":"辽阳市"},{"id":"710","text":"盘锦市"},{"id":"711","text":"铁岭市"},{"id":"712","text":"朝阳市"},{"id":"713","text":"葫芦岛市"}]},{"id":"8","text":"吉林省","city":[{"id":"800","text":"长春市"},{"id":"801","text":"吉林市"},{"id":"802","text":"四平市"},{"id":"803","text":"辽源市"},{"id":"804","text":"通化市"},{"id":"805","text":"白山市"},{"id":"806","text":"松原市"},{"id":"807","text":"白城市"},{"id":"808","text":"延边朝鲜族自治州"}]},{"id":"9","text":"河南省","city":[{"id":"900","text":"郑州市"},{"id":"901","text":"开封市"},{"id":"902","text":"洛阳市"},{"id":"903","text":"平顶山市"},{"id":"904","text":"安阳市"},{"id":"905","text":"鹤壁市"},{"id":"906","text":"新乡市"},{"id":"907","text":"焦作市"},{"id":"908","text":"濮阳市"},{"id":"909","text":"许昌市"},{"id":"910","text":"漯河市"},{"id":"911","text":"三门峡市"},{"id":"912","text":"南阳市"},{"id":"913","text":"商丘市"},{"id":"914","text":"信阳市"},{"id":"915","text":"周口市"},{"id":"916","text":"驻马店市"},{"id":"917","text":"济源市"}]},{"id":"10","text":"江苏省","city":[{"id":"1000","text":"南京市"},{"id":"1001","text":"无锡市"},{"id":"1002","text":"徐州市"},{"id":"1003","text":"常州市"},{"id":"1004","text":"苏州市"},{"id":"1005","text":"南通市"},{"id":"1006","text":"连云港市"},{"id":"1007","text":"淮安市"},{"id":"1008","text":"盐城市"},{"id":"1009","text":"扬州市"},{"id":"1010","text":"镇江市"},{"id":"1011","text":"泰州市"},{"id":"1012","text":"宿迁市"}]},{"id":"11","text":"浙江省","city":[{"id":"1100","text":"杭州市"},{"id":"1101","text":"宁波市"},{"id":"1102","text":"温州市"},{"id":"1103","text":"嘉兴市"},{"id":"1104","text":"湖州市"},{"id":"1105","text":"绍兴市"},{"id":"1106","text":"金华市"},{"id":"1107","text":"衢州市"},{"id":"1108","text":"舟山市"},{"id":"1109","text":"台州市"},{"id":"1110","text":"丽水市"}]},{"id":"12","text":"安徽省","city":[{"id":"1200","text":"合肥市"},{"id":"1201","text":"芜湖市"},{"id":"1202","text":"蚌埠市"},{"id":"1203","text":"淮南市"},{"id":"1204","text":"马鞍山市"},{"id":"1205","text":"淮北市"},{"id":"1206","text":"铜陵市"},{"id":"1207","text":"安庆市"},{"id":"1208","text":"黄山市"},{"id":"1209","text":"滁州市"},{"id":"1210","text":"阜阳市"},{"id":"1211","text":"宿州市"},{"id":"1212","text":"巢湖市"},{"id":"1213","text":"六安市"},{"id":"1214","text":"亳州市"},{"id":"1215","text":"池州市"},{"id":"1216","text":"宣城市"}]},{"id":"13","text":"福建省","city":[{"id":"1300","text":"福州市"},{"id":"1301","text":"厦门市"},{"id":"1302","text":"莆田市"},{"id":"1303","text":"三明市"},{"id":"1304","text":"泉州市"},{"id":"1305","text":"漳州市"},{"id":"1306","text":"南平市"},{"id":"1307","text":"龙岩市"},{"id":"1308","text":"宁德市"}]},{"id":"14","text":"江西省","city":[{"id":"1400","text":"南昌市"},{"id":"1401","text":"景德镇市"},{"id":"1402","text":"萍乡市"},{"id":"1403","text":"九江市"},{"id":"1404","text":"新余市"},{"id":"1405","text":"鹰潭市"},{"id":"1406","text":"赣州市"},{"id":"1407","text":"吉安市"},{"id":"1408","text":"宜春市"},{"id":"1409","text":"抚州市"},{"id":"1410","text":"上饶市"}]},{"id":"15","text":"山东省","city":[{"id":"1500","text":"济南市"},{"id":"1501","text":"青岛市"},{"id":"1502","text":"淄博市"},{"id":"1503","text":"枣庄市"},{"id":"1504","text":"东营市"},{"id":"1505","text":"烟台市"},{"id":"1506","text":"潍坊市"},{"id":"1507","text":"威海市"},{"id":"1508","text":"济宁市"},{"id":"1509","text":"泰安市"},{"id":"1510","text":"日照市"},{"id":"1511","text":"莱芜市"},{"id":"1512","text":"临沂市"},{"id":"1513","text":"德州市"},{"id":"1514","text":"聊城市"},{"id":"1515","text":"滨州市"},{"id":"1516","text":"菏泽市"}]},{"id":"16","text":"湖北省","city":[{"id":"1600","text":"武汉市"},{"id":"1601","text":"黄石市"},{"id":"1602","text":"襄樊市"},{"id":"1603","text":"十堰市"},{"id":"1604","text":"荆州市"},{"id":"1605","text":"宜昌市"},{"id":"1606","text":"荆门市"},{"id":"1607","text":"鄂州市"},{"id":"1608","text":"孝感市"},{"id":"1609","text":"黄冈市"},{"id":"1610","text":"咸宁市"},{"id":"1611","text":"随州市"},{"id":"1612","text":"恩施州"},{"id":"1613","text":"仙桃市"},{"id":"1614","text":"潜江市"},{"id":"1615","text":"天门市"},{"id":"1616","text":"神农架林区"}]},{"id":"17","text":"湖南省","city":[{"id":"1700","text":"长沙市"},{"id":"1701","text":"株洲市"},{"id":"1702","text":"湘潭市"},{"id":"1703","text":"衡阳市"},{"id":"1704","text":"邵阳市"},{"id":"1705","text":"岳阳市"},{"id":"1706","text":"常德市"},{"id":"1707","text":"张家界市"},{"id":"1708","text":"益阳市"},{"id":"1709","text":"郴州市"},{"id":"1710","text":"永州市"},{"id":"1711","text":"怀化市"},{"id":"1712","text":"娄底市"},{"id":"1713","text":"湘西州"}]},{"id":"18","text":"广东省","city":[{"id":"1800","text":"广州市"},{"id":"1801","text":"深圳市"},{"id":"1802","text":"珠海市"},{"id":"1803","text":"汕头市"},{"id":"1804","text":"韶关市"},{"id":"1805","text":"佛山市"},{"id":"1806","text":"江门市"},{"id":"1807","text":"湛江市"},{"id":"1808","text":"茂名市"},{"id":"1809","text":"肇庆市"},{"id":"1810","text":"惠州市"},{"id":"1811","text":"梅州市"},{"id":"1812","text":"汕尾市"},{"id":"1813","text":"河源市"},{"id":"1814","text":"阳江市"},{"id":"1915","text":"清远市"},{"id":"1816","text":"东莞市"},{"id":"1817","text":"中山市"},{"id":"1818","text":"潮州市"},{"id":"1819","text":"揭阳市"},{"id":"1820","text":"云浮市"}]},{"id":"19","text":"海南省","city":[{"id":"1900","text":"海口市"},{"id":"1901","text":"龙华区"},{"id":"1902","text":"秀英区"},{"id":"1903","text":"琼山区"},{"id":"1904","text":"美兰区"},{"id":"1905","text":"三亚市"}]},{"id":"20","text":"四川省","city":[{"id":"2000","text":"成都市"},{"id":"2001","text":"自贡市"},{"id":"2002","text":"攀枝花市"},{"id":"2003","text":"泸州市"},{"id":"2004","text":"德阳市"},{"id":"2005","text":"绵阳市"},{"id":"2006","text":"广元市"},{"id":"2007","text":"遂宁市"},{"id":"2008","text":"内江市"},{"id":"2009","text":"乐山市"},{"id":"2010","text":"南充市"},{"id":"2011","text":"宜宾市"},{"id":"2012","text":"广安市"},{"id":"2013","text":"达州市"},{"id":"2014","text":"眉山市"},{"id":"2015","text":"雅安市"},{"id":"2016","text":"巴中市"},{"id":"2017","text":"资阳市"},{"id":"2018","text":"阿坝州"},{"id":"2019","text":"甘孜州"},{"id":"2020","text":"凉山州"}]},{"id":"21","text":"贵州省","city":[{"id":"2100","text":"贵阳市"},{"id":"2101","text":"六盘水市"},{"id":"2102","text":"遵义市"},{"id":"2103","text":"安顺市"},{"id":"2104","text":"铜仁地区"},{"id":"2105","text":"毕节地区"},{"id":"2106","text":"黔西南州"},{"id":"2107","text":"黔东南州"},{"id":"2108","text":"黔南州"}]},{"id":"22","text":"云南省","city":[{"id":"2200","text":"昆明市"},{"id":"2201","text":"大理市"},{"id":"2202","text":"曲靖市"},{"id":"2203","text":"玉溪市"},{"id":"2204","text":"昭通市"},{"id":"2205","text":"楚雄市"},{"id":"2206","text":"红河市"},{"id":"2207","text":"文山市"},{"id":"2208","text":"思茅市"},{"id":"2209","text":"西双版纳市"},{"id":"2210","text":"保山市"},{"id":"2211","text":"德宏市"},{"id":"2212","text":"丽江市"},{"id":"2213","text":"怒江市"},{"id":"2214","text":"迪庆市"},{"id":"2215","text":"临沧市"}]},{"id":"23","text":"陕西省","city":[{"id":"2300","text":"西安市"},{"id":"2301","text":"铜川市"},{"id":"2302","text":"宝鸡市"},{"id":"2303","text":"咸阳市"},{"id":"2304","text":"渭南市"},{"id":"2305","text":"延安市"},{"id":"2306","text":"汉中市"},{"id":"2307","text":"榆林市"},{"id":"2308","text":"安康市"},{"id":"2309","text":"商洛市"}]},{"id":"24","text":"甘肃省","city":[{"id":"2400","text":"兰州市"},{"id":"2401","text":"嘉峪关市"},{"id":"2402","text":"金昌市"},{"id":"2403","text":"白银市"},{"id":"2404","text":"天水市"},{"id":"2405","text":"武威市"},{"id":"2406","text":"张掖市"},{"id":"2407","text":"平凉市"},{"id":"2408","text":"酒泉市"},{"id":"2409","text":"庆阳市"},{"id":"2410","text":"定西市"},{"id":"2411","text":"陇南市"},{"id":"2412","text":"临夏州"},{"id":"2413","text":"甘南州"}]},{"id":"25","text":"青海省","city":[{"id":"2500","text":"西宁市"},{"id":"2501","text":"海东地区"},{"id":"2502","text":"海北州"},{"id":"2503","text":"黄南州"},{"id":"2504","text":"海南州"},{"id":"2505","text":"果洛州"},{"id":"2506","text":"玉树州"},{"id":"2507","text":"海西州"}]},{"id":"26","text":"黑龙江省","city":[{"id":"2600","text":"哈尔滨市"},{"id":"2601","text":"齐齐哈尔市"},{"id":"2602","text":"鸡西市"},{"id":"2603","text":"鹤岗市"},{"id":"2604","text":"双鸭山市"},{"id":"2605","text":"大庆市"},{"id":"2606","text":"伊春市"},{"id":"2607","text":"佳木斯市"},{"id":"2608","text":"七台河市"},{"id":"2609","text":"牡丹江市"},{"id":"2610","text":"黑河市"},{"id":"2611","text":"绥化市"},{"id":"2612","text":"大兴安岭地区"}]},{"id":"27","text":"内蒙古自治区","city":[{"id":"2700","text":"呼和浩特市"},{"id":"2701","text":"包头市"},{"id":"2702","text":"乌海市"},{"id":"2703","text":"赤峰市"},{"id":"2704","text":"通辽市"},{"id":"2705","text":"鄂尔多斯市"},{"id":"2706","text":"呼伦贝尔市"},{"id":"2707","text":"巴彦淖尔市"},{"id":"2708","text":"乌兰察布市"},{"id":"2709","text":"兴安盟"},{"id":"2710","text":"锡林郭勒盟"},{"id":"2711","text":"阿拉善盟"}]},{"id":"28","text":"广西壮族自治区","city":[{"id":"2800","text":"南宁市"},{"id":"2801","text":"柳州市"},{"id":"2802","text":"桂林市"},{"id":"2803","text":"梧州市"},{"id":"2804","text":"北海市"},{"id":"2805","text":"防城港市"},{"id":"2806","text":"钦州市"},{"id":"2807","text":"贵港市"},{"id":"2808","text":"玉林市"},{"id":"2809","text":"百色市"},{"id":"2810","text":"贺州市"},{"id":"2811","text":"河池市"},{"id":"2812","text":"来宾市"},{"id":"2813","text":"崇左市"}]},{"id":"29","text":"西藏自治区","city":[{"id":"2900","text":"拉萨市"},{"id":"2901","text":"昌都地区"},{"id":"2902","text":"山南地区"},{"id":"2903","text":"日喀则地区"},{"id":"2904","text":"那曲地区"},{"id":"2905","text":"阿里地区"},{"id":"2906","text":"林芝地区"}]},{"id":"30","text":"宁夏回族自治区","city":[{"id":"3000","text":"银川市"},{"id":"3001","text":"石嘴山市"},{"id":"3002","text":"吴忠市"},{"id":"3003","text":"固原市"},{"id":"3004","text":"中卫市"}]},{"id":"31","text":"新疆维吾尔自治区","city":[{"id":"3100","text":"乌鲁木齐市"},{"id":"3101","text":"克拉玛依市"},{"id":"3102","text":"吐鲁番地区"},{"id":"3103","text":"哈密地区"},{"id":"3104","text":"和田地区"},{"id":"3105","text":"阿克苏地区"},{"id":"3106","text":"喀什地区"},{"id":"3107","text":"克孜勒苏柯尔克孜自治州"},{"id":"3108","text":"巴音郭楞蒙古自治州"},{"id":"3109","text":"昌吉回族自治州"},{"id":"3110","text":"博尔塔拉蒙古自治州"},{"id":"3111","text":"伊犁哈萨克自治州"},{"id":"3112","text":"塔城地区"},{"id":"3113","text":"阿勒泰地区"},{"id":"3114","text":"石河子市"},{"id":"3115","text":"阿拉尔市"},{"id":"3116","text":"图木舒克市"},{"id":"3117","text":"五家渠市"}]},{"id":"32","text":"台湾省","city":[{"id":"3200","text":"台北市"},{"id":"3201","text":"高雄市"},{"id":"3202","text":"基隆市"},{"id":"3203","text":"台中市"},{"id":"3204","text":"台南市"},{"id":"3205","text":"新竹市"},{"id":"3206","text":"嘉义市"},{"id":"3207","text":"台北县"},{"id":"3208","text":"宜兰县"},{"id":"3209","text":"桃园县"},{"id":"3210","text":"新竹县"},{"id":"3211","text":"苗栗县"},{"id":"3212","text":"台中县"},{"id":"3213","text":"彰化县"},{"id":"3214","text":"南投县"},{"id":"3215","text":"云林县"},{"id":"3216","text":"嘉义县"},{"id":"3217","text":"台南县"},{"id":"3218","text":"高雄县"},{"id":"3219","text":"屏东县"},{"id":"3220","text":"澎湖县"},{"id":"3221","text":"台东县"},{"id":"3222","text":"花莲县"}]},{"id":"33","text":"香港特别行政区","city":[{"id":"3300","text":"中西区"},{"id":"3301","text":"东区"},{"id":"3302","text":"九龙城区"},{"id":"3303","text":"观塘区"},{"id":"3304","text":"南区"},{"id":"3305","text":"深水埗区"},{"id":"3306","text":"黄大仙区"},{"id":"3307","text":"湾仔区"},{"id":"3308","text":"油尖旺区"},{"id":"3309","text":"离岛区"},{"id":"3310","text":"葵青区"},{"id":"3311","text":"北区"},{"id":"3312","text":"西贡区"},{"id":"3313","text":"沙田区"},{"id":"3314","text":"屯门区"},{"id":"3315","text":"大埔区"},{"id":"3316","text":"荃湾区"},{"id":"3317","text":"元朗区"}]},{"id":"34","text":"澳门特别行政区","city":[{"id":"3400","text":"澳门地区"}]},{"id":"35","text":"其它","city":[{"id":"3500","text":"其它地区"}]}];
	$.fn.citySelect=function(settings){
		if(this.length<1){return;};

		// 默认值
		settings=$.extend({
			url:"city.min.js",
			prov:null,
			city:null,
			dist:null,
			nodata:"hidden",
			required:false
		},settings);

		var box_obj=this;
		var prov_obj=box_obj.find("#prov");
		var city_obj=box_obj.find("#city");
		var dist_obj=box_obj.find("#dist");
		var prov_val=settings.prov;
		var city_val=settings.city;
		var dist_val=settings.dist;
		var select_prehtml=(settings.required) ? "" : "<option value=''>请选择</option>";
		var city_json;

		// 赋值市级函数
		var cityStart=function(){
			var prov_id=$('.prov option:selected').index();
			//重选的时候,清空
			city_obj.parent().parent().css("display","block");
			dist_obj.parent().parent().css("display","block");
			$('.city').text("");
			$('.dist').text("");

			if(!settings.required){
				prov_id--;
			};
			city_obj.empty().attr("disabled",true);
			dist_obj.empty().attr("disabled",true);
			if(prov_id<0||typeof(data[prov_id].id)=="undefined"){
				if(settings.nodata=="hidden"){
					city_obj.parent().css("display","none");
					dist_obj.parent().css("display","none");
				}else if(settings.nodata=="block"){
					city_obj.parent().css("display","block");
					dist_obj.parent().css("display","block");
				};
				return;
			};
			
			// 遍历赋值市级下拉列表
			temp_html=select_prehtml;
			$.each(data[prov_id].city,function(i,city){
				if(settings.city =="0"){
				temp_html+="<option value='00'>请选择市</option>";	
				}else{
				temp_html+="<option value='"+city.id+"'>"+city.text+"</option>";
				}
			});
			
			city_obj.append(temp_html).attr("disabled",false).css("display","block");
			//distStart();
		};

		// 赋值地区（县）函数
		var distStart=function(){
			
			//重选的时候,清空
			dist_obj.parent().parent().css("display","block");
			$('.dist').text("");
			var prov_id=$('.prov option:selected').index();
			var city_id=$('.city option:selected').index();
			if(!settings.required){
				prov_id--;
				city_id--;
			};

			dist_obj.empty().attr("disabled",true);
			if(prov_id<0||city_id<0||typeof(city_json.citylist[prov_id].c[city_id].a)=="undefined"){
				if(settings.nodata=="hidden"){
					dist_obj.parent().css("display","none");
				}else if(settings.nodata=="block"){
					dist_obj.parent().css("display","block");
				};

				return;
			};
			// 遍历赋值市级下拉列表
			temp_html=select_prehtml;
			$.each(city_json.citylist[prov_id].c[city_id].a,function(i,dist){
				if(i==0){
					$(".dist").html(dist.s);
					temp_html+="<option value='"+dist.s+"' data-placeholder='true'>"+dist.s+"</option>";

				}else{
					temp_html+="<option value='"+dist.s+"'>"+dist.s+"</option>";
				}
				
			});
		
			dist_obj.html(temp_html).attr("disabled",false).css({"display":"","visibility":""});
			//页面隐藏
		};

        // 选择省份时发生事件
            prov_obj.bind("change",function(){
                cityStart();
                city_obj.trigger('change');
            });

            // 选择市级时发生事件
            city_obj.bind("change",function(){
                // distStart();
            });

		var init=function(){
			// 遍历赋值省份下拉列表
			temp_html=select_prehtml;
			$.each(data,function(i,prov){
				temp_html+="<option value='"+prov.id+"'>"+prov.text+"</option>";				
			});
			prov_obj.append(temp_html);
			//prov_obj.selectmenu("refresh",true);
			//若有传入省份与市级的值，则选中。（setTimeout为兼容IE6而设置）
			setTimeout(function(){
				if(settings.prov!=null&&settings.prov!=""){
					prov_obj.val(settings.prov);
					//prov_obj.selectmenu("refresh",true);
					prov_obj.trigger('change');
					//$(".prov").html(settings.prov);
					cityStart();
					//$(".city").html(settings.city);
					setTimeout(function(){
						if(settings.city!=null&&settings.city!=""){
							city_obj.val(settings.city);
							//city_obj.selectmenu("refresh",true);
							// distStart();
							// setTimeout(function(){
								// if(settings.dist!=null){
									// dist_obj.val(settings.dist);
								// };
							// },1);
						};
					},1);
				};
			},1);

			
			prov_obj.trigger('change');
			city_obj.trigger('change');
		};

		// 设置省市json数据
		if(typeof(settings.url)!="string"){
			$.getJSON(settings.url,function(json){
				city_json=data;
				init();
			});
		}else{
			city_json=data;
			init();
		};
	};
})(jQuery);