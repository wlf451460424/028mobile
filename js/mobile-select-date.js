/*
 * Created with WebStorm 2016.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: lukas
 * Date: 2016-08-16
 * Time: 14:11:27
 */

(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.MobileSelectDate = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	var MobileSelectDate = function() {
		var rnd = Math.random().toString().replace('.', '');
		this.id = 'scroller_' + rnd;
		this.scroller;
		this.data;
		this.index = 0;
		this.value = [0, 0, 0];
		this.oldvalue;
		this.oldtext;
		this.text = ['', '', ''];
		this.level = 3;
		this.mtop = 30;
		this.separator = ' ';
		this.datePicker;
	};
	MobileSelectDate.prototype = {

		setMinAndMax:function(minVal,maxVal){
			this.min = new Date(minVal);
			this.max = new Date(maxVal);
			this.getData();
			this.scroller = $('#' + this.id);
			this.format();
			this.value = maxVal.split("/");
			this.text = maxVal.split("/");
		},
		init: function(settings) {
			this.settings = $.extend({}, settings);
			this.separator = "/";
			var now = new Date();
			this.settings.value = this.settings.value || $(this.settings.trigger).val() || now.getFullYear() + "/" + ("0" + (now.getMonth() + 1)).slice(-2) + '/' + ("0" + (now.getDate())).slice(-2);
			this.settings.value = this.settings.value.replace(/\//g, ',');
			this.settings.text = this.settings.value.split(',');
			this.settings.default==undefined ? this.default=1:this.default = 0 ;//0为空,1时默认选中第一项
			this.trigger = $(this.settings.trigger);
			this.trigger.attr("readonly", "readonly");
			this.value = (this.settings.value && this.settings.value.split(",")) || [0, 0, 0];
			this.text = this.settings.text || this.trigger.val().split(' ') || ['', '', ''];
			this.oldvalue = this.value.concat([]);
			this.oldtext = this.text.concat([]);
			this.settings.min ? this.min = new Date(this.settings.min) : this.min = "2010/01/01";
			this.settings.max ? this.max = new Date(this.settings.max) : this.max = new Date();
			this.getData();
			var clickedDateId = this.settings.trigger;  //当前被选中的元素ID
			var anotherDateId = "#"+$(this.settings.trigger).parent().siblings()[1].childNodes[0].id;  //另一个时间的ID
			this.bindEvent(clickedDateId,anotherDateId);
		},
		//覆盖数据方法,so easy
		getData: function() {
			var json = [];
			var tempMin = new Date(this.min.getFullYear(),this.min.getMonth());
			var tempMax = new Date(this.max.getFullYear(),this.max.getMonth());
			var tempMinYear = new Date(this.min.getFullYear());
			var tempMaxYear = new Date(this.max.getFullYear());

			for (var small = this.min.getFullYear(), large = this.max.getFullYear(); small <= large; small++) {
				var objYear = {};
				objYear['id'] = objYear['name'] = small;
				objYear.child = [];
				for (var m = 1; m <= 12; m++) {
					var objMonth = {};
					objMonth['id'] = objMonth['name'] = ("0" + m).slice(-2);
					objMonth.child = [];
					var days = new Date(small, m, 0).getDate();
                    // 控制要显示的Day
					for (var d = 1; d <= days; d++) {
						var objDay = {};
						var cur = new Date(small,m-1,d);
						if(cur.getTime() >= this.min.getTime() && cur.getTime() <= this.max.getTime()){
							objDay['id'] = objDay['name'] = ("0" + d).slice(-2);
							objMonth.child.push(objDay);
						}
					}
					// 控制要显示的月份Month
					var curMon = new Date(small,m-1);
					if(curMon.getTime() >= tempMin.getTime() && curMon.getTime() <= tempMax.getTime()){
						objMonth['id'] = objMonth['name'] = ("0" + m).slice(-2);
						objYear.child.push(objMonth);
					}
				}
				// 控制要显示的年份Year
				var curYear = new Date(small);
				if(curYear.getTime() >= tempMinYear.getTime() && curYear.getTime() <= tempMaxYear.getTime()) {
					json.push(objYear);
				}
			}
			this.data = json;
		},
		bindEvent: function(clickedDateId,anotherDateId) {
			var _this = this;
			this.trigger.click(function(e) {

				var settings,buttons;
				if( _this.settings.position == "bottom"){
					settings ={
						position:"bottom",
						width:"100%",
						className:"ui-dialog-bottom",
						animate:false
					};
					var buttons=[{
							'no': '取消'
						},{
							'yes': '确定'
						}];
				}

				_this.datePicker = $.Dateconfirm('<div class="ui-scroller-mask"><div id="' + _this.id + '" class="ui-scroller"><div></div><div ></div><div></div><p></p></div></div>',buttons,function(t, c) {
					if (t == "yes") {
						_this.submit(clickedDateId,anotherDateId)
					}
					if (t == 'no') {
						_this.cancel();
					}
					this.dispose();
				},$.extend({
					width: 320,
					height: 218
				},settings));
				
				_this.scroller = $('#' + _this.id);
				_this.format();
				var start = 0,
					end = 0;
				_this.scroller.children().bind('touchstart', function(e) {
					start = (e.changedTouches || e.originalEvent.changedTouches)[0].pageY;
				});
				_this.scroller.children().bind('touchmove', function(e) {
					end = (e.changedTouches || e.originalEvent.changedTouches)[0].pageY;
					var diff = end - start;
					var dl = $(e.target).parent();
					if (dl[0].nodeName != "DL") {
						return;
					}
					var top = parseInt(dl.css('top') || 0) + diff;
					dl.css('top', top);
					start = end;
					return false;
				});
				_this.scroller.children().bind('touchend', function(e) {
					end = (e.changedTouches || e.originalEvent.changedTouches)[0].pageY;
					var diff = end - start;
					var dl = $(e.target).parent();
					if (dl[0].nodeName != "DL") {
						return;
					}
					var i = $(dl.parent()).index();
					var top = parseInt(dl.css('top') || 0) + diff;
					if (top > _this.mtop) {
						top = _this.mtop;
					}
					if (top < -$(dl).height() + 60) {
						top = -$(dl).height() + 60;
					}
					var mod = top / _this.mtop;
					var mode = Math.round(mod);
					var index = Math.abs(mode) + 1;
					if (mode == 1) {
						index = 0;
					}
					_this.value[i] = $(dl.children().get(index)).attr('ref');
					_this.value[i] == 0 ? _this.text[i] = "" : _this.text[i] = $(dl.children().get(index)).html();
					for (var j = _this.level - 1; j > i; j--) {
						_this.value[j] = 0;
						_this.text[j] = "";
					}
					if (!$(dl.children().get(index)).hasClass('focus')) {
						_this.format();
					}
					$(dl.children().get(index)).addClass('focus').siblings().removeClass('focus');
					dl.css('top', mode * _this.mtop);
					return false;
				});
				return false;
			});
		},
		format: function() {
			var _this = this;
			var child = _this.scroller.children();
			this.f(this.data);
		},
		f: function(data) {
			var _this = this;
			var item = data;
			if (!item) {
				item = [];
			}
			var str = '<dl><dd ref="0">——</dd>';
			var focus = 0,
				childData, top = _this.mtop;
			if (_this.index !== 0 && _this.value[_this.index - 1] == "0" && this.default == 0) {
				str = '<dl><dd ref="0" class="focus">——</dd>';
				_this.value[_this.index] = 0;
				_this.text[_this.index] = "";
				focus = 0;
			} else {
				if (_this.value[_this.index] == "0") {
					str = '<dl><dd ref="0" class="focus">——</dd>';
					focus = 0;
				}
				if (item.length > 0 && this.default == 1) {
					str = '<dl>';
					var pid = item[0].pid || 0;
					var id = item[0].id || 0;
					focus = item[0].id;
					childData = item[0].child;
					if(!_this.value[this.index ]){
						_this.value[this.index ] = id;
						_this.text[this.index] = item[0].name;
					}
					str += '<dd pid="' + pid + '" class="' + cls + '" ref="' + id + '">' + item[0].name + '</dd>';
				}
				for (var j = _this.default, len = item.length; j < len; j++) {
					var pid = item[j].pid || 0;
					var id = item[j].id || 0;
					var cls = '';
					if (_this.value[_this.index] == id) {
						cls = "focus";
						focus = id;
						childData = item[j].child;
						top = _this.mtop * (-(j - _this.default));
					}
					str += '<dd pid="' + pid + '" class="' + cls + '" ref="' + id + '">' + item[j].name + '</dd>';
				}
			}
			str += "</dl>";
			var newdom = $(str);
			newdom.css('top', top);
			var child = _this.scroller.children();
			$(child[_this.index]).html(newdom);
			_this.index++;
			if (_this.index > _this.level - 1) {
				_this.index = 0;
				return;
			}
			_this.f(childData);
		},
		//  selectedSttId,selectedEndId
		submit: function(clickedDateId,anotherDateId) {
			// this.oldvalue =$(clickedDateId).val();
			this.oldvalue = this.value.concat([]);
			this.oldtext = this.text.concat([]);
			if (this.trigger[0].nodeType == 1) {
				//input赋值
				this.trigger.val(this.text.join(this.separator));
				this.trigger.attr('data-value', this.value.join(','));
			}
			this.trigger.next(':hidden').val(this.value.join(','));

			/* 判断用户点击的是开始时间还是结束时间，并对应赋值  */
			var regStt = new RegExp("stt","i");
			var regEnd = new RegExp("end","i");
			var resultStt = regStt.test(clickedDateId);  //True or False
			var resultEnd = regEnd.test(anotherDateId);
			//查询开始时间和结束时间
			if(resultStt && resultEnd){
				startDateTime = $(clickedDateId).val();
				endDateTime = $(anotherDateId).val();
				// console.log("stt is:"+startDateTime+"  end is :"+endDateTime);
				this.validTime(startDateTime,endDateTime,clickedDateId,anotherDateId);
			}else{
				startDateTime = $(anotherDateId).val();
				endDateTime = $(clickedDateId).val();
				// console.log("stt is:"+startDateTime+"  end is :"+endDateTime);
				this.validTime(startDateTime,endDateTime,anotherDateId,clickedDateId);
			}
			 this.settings.callback && this.settings.callback(this.scroller);
		},
		cancel: function() {
			// 注释掉，修复时间控件弹出后，再点击取消，第二次再点开就显示当前月的1号的问题。
			// this.value = this.oldvalue.concat([]);
			// this.text = this.oldtext.concat([]);
		},
		dismiss:function () {
			if(this.datePicker){
				this.datePicker.dispose();
			}
		},
		validTime: function(startTime,endTime,startId,endId){
			// 判断开始时间和结束时间大小
			//参数说明 == startTime:开始时间；endTime：结束时间；startId：开始时间的元素ID；endId：结束时间的元素ID。
			var arr1 = startTime.split("/");
			var arr2 = endTime.split("/");
			var date1=new Date(parseInt(arr1[0]),parseInt(arr1[1])-1,parseInt(arr1[2]),0,0,0);
			var date2=new Date(parseInt(arr2[0]),parseInt(arr2[1])-1,parseInt(arr2[2]),0,0,0);
			if(date1.getTime()>date2.getTime()) {
				// toastUtils.showToast('开始时间不能大于结束时间,请重新查询');
				 endDateTime = startDateTime;
				$(endId).val($(startId).val());
				this.queryDateforPages(startId);
				return;
			}else{
				this.queryDateforPages(startId);
			}
			return;
		},
		queryDateforPages: function (startId) {
			//查询日期时需要加上时分秒，否则当开始、结束时间为同一天时无数据。
			startDateTime_query = startDateTime + hms00;
			endDateTime_query = endDateTime + hms59;

			//所有涉及时间控件查询的页面，都需在此配置。
			//最好注释掉每个页面查询数据后的返回数据(console.log)，频繁查询记录，会多次返回数据，控制台数据堆砌太多。
			switch(startId){
				//充值记录
				case "#selectDateCharge_Stt":
					var type = $("#myChargeRecordsearchType").val();
					searchCharge(startDateTime_query, endDateTime_query, type);
					break;
				//投注记录
				case "#selectDateMyBetting_Stt":
                    var type = $("#searchLottery_bettId").val();
					searchBetting(startDateTime_query, endDateTime_query, type);
					break;
				//信用记录
				case "#selectDateMyBetting_SttPK":
                    var type = $("#searchLottery_bettIdPK").val();
					searchBettingPK(startDateTime_query, endDateTime_query, type);
					break;
				//中奖记录
				case "#selectDateWin_Stt":
                    var type = $("#searchLottery_winrecord").val();
					searchBetting_myWinRecord(startDateTime_query, endDateTime_query, type);
					break;
				//追号记录
				case "#selectDatezhuiHao_Stt":
                    var type = $("#searchLottery_zhuihaoId").val();
					searchZhuihao(startDateTime_query, endDateTime_query, type);
					break;
				//账变记录
				case "#selectDateAccount_Stt":
                    var type = $("#myAccountRecordsearchType").val();
					searchAccount(startDateTime_query, endDateTime_query, type);
					break;
				//提款记录
				case "#selectDateWithdrawal_Stt":
                    var type = $("#searchTypeWit").val();
					searchChargeWit(startDateTime_query, endDateTime_query, type);
					break;
				//分红记录
				case "#selectDateFenHong_Stt":
                    var type = $("#fenHongRecordType").val();
					getfenHongRecord(startDateTime_query, endDateTime_query ,type);
					break;
				//TeamSummary
				case "#selectDateTeamSummary_Stt":
					searchTeamSummary(startDateTime_query, endDateTime_query);
					break;
                //TeamReportAll
                case "#selectDateTRA_Stt":
                    searchTotal_teamReportAll(startDateTime_query, endDateTime_query);
                    break;
                //TeamReportSelf
                case "#selectDateTRS_Stt":
                    searchTotal_teamReportSel(startDateTime_query, endDateTime_query);
                    break;
				//TeamReportSubordinate
				case "#selectDateTRSub_Stt":
					var type = $("#searchType_teamReportSub").val();
					searchteamReportSubordinate(startDateTime_query, endDateTime_query,type);
					break;
				//TeamReport
                case "#selectDateteamReport_Stt":
                    searchteamReport(startDateTime_query, endDateTime_query);
                    break;
                //MyReport
                case "#selectDateMyReport_Stt":
                    searchTotal_myReport(startDateTime_query, endDateTime_query);
                    break;
                //proxyAccount
                case "#selDateProxyAccount_Stt":
                    var type = $("#proxyAccountSearchType").val();
                    searchProxyAccount(startDateTime_query, endDateTime_query,type);
                    break;
                //proxyBetting
                case "#selDateProxyBetting_Stt":
                    var type = $("#proxyBettingSearchType").val();
                    searchBetting_proxy(startDateTime_query, endDateTime_query,type);
                    break;
                //proxyBettingPK
                case "#selDateProxyBetting_SttPK":
                    var type = $("#proxyBettingSearchTypePK").val();
                    searchBetting_proxyPK(startDateTime_query, endDateTime_query,type);
                    break;
                //teamWithdrawal
                case "#selectDateTW_Stt":
                    var type = $("#searchType_teamWithdrawal").val();
                    searchteamWithdrawal_Record(startDateTime_query, endDateTime_query,type);
                    break;
				//proxyMember
				case "#selectDateProxyMem_Stt":
					// var type = $("#searchType_proxyMember").val();
					var type = 2; //直属下级
					if(startDateTime_query.length > endDateTime_query.length){
						endDateTime_query = "";
					}else if (startDateTime_query.length < endDateTime_query.length){
						startDateTime_query = "";
					}
					searchTeamproxyMember(startDateTime_query, endDateTime_query,type);
					break;
                //teamCharge
                case "#selectDateTC_Stt":
                    var type = $("#searchType_teamCharge").val();
                    searchTeamCharge(startDateTime_query, endDateTime_query,type);
                    break;
                //teamAccount
                case "#selectDateTA_Stt":
                    var type = $("#searchType_teamAccount").val();
                    searchTeamAccount(startDateTime_query, endDateTime_query,type);
                    break;
                //teamBetting
                case "#selectDateTB_Stt":
                    var type = $("#searchType_teamBetting").val();
                    searchTeamBetting(startDateTime_query, endDateTime_query,type);
                    break;
                //dailywagesRecords
                case "#selectDatedailyWages_Stt":
                    var type = $("#dailyWagesRecordType").val();
                    getdailyWagesRecords_scroll(startDateTime_query, endDateTime_query, type);
                    break;
                //gamePersonalReport
                case "#selectDateGamePersonalReport_Stt":
                    searchTotal_gamePersonalReport(startDateTime_query, endDateTime_query);
                    break;
				//teamGameReportAll
                case "#selectDateGRA_Stt":
                    searchTotal_teamGameReportAll(startDateTime_query, endDateTime_query);
                    break;
				//teamGameReportSelf
                case "#selectDateGRS_Stt":
                    searchTotal_teamGameReportSelf(startDateTime_query, endDateTime_query);
                    break;
				//TeamGameReportSubordinate
                case "#selectDateGRSub_Stt":
                    var type = $("#searchType_teamGameReportSub").val();
                    searchteamGameReportSubordinate_Record(startDateTime_query, endDateTime_query,type);
                    break;
                //thirdReport
                case "#selectDateThirdReport_Stt":
                    var type = $("#searchType_thirdReport").val();
                    searchthirdReport_Record(startDateTime_query, endDateTime_query,type);
                    break;
				//myTransferRecord
				case "#selectDateTransfer_Stt":
					searchMyTransfer(startDateTime_query, endDateTime_query);
					break;
				//lossDailyWagesRecords
				case "#selectDatelossDailyWages_Stt":
					getlossDailyWagesRecord(startDateTime_query, endDateTime_query);
					break;
				//myVrTransferRecord   真人转账记录
                case "#selectDateVrTransfer_Stt":
                    searchMyVrTransfer(startDateTime_query, endDateTime_query);
                    break;
				//personalPersonalReport
                case "#vr_selectDatePersonalPersonalReport_Stt":
                    searchTotal_personalPersonalReport(startDateTime_query, endDateTime_query);
                    break;
				//teamPersonalReportAll
                case "#vr_selectDateGRA_Stt":
                    searchTotal_teamPersonalReportAll(startDateTime_query, endDateTime_query);
                    break;
				//teamPersonalReportSelf
                case "#vr_selectDateGRS_Stt":
                    searchTotal_teamPersonalReportSel(startDateTime_query, endDateTime_query);
                    break;
				//TeamPersonalReportSubordinate
                case "#vr_selectDateGRSub_Stt":
                    var type = $("#searchType_teamPersonalReportSub").val();
                    searchTeamPersonalReportSub_Record(startDateTime_query, endDateTime_query,type);
                    break;
                //systemReport
				case "#selectDatesystemReport_Stt":
					get_info($("#lottreyType").val(),1);
					break;
				//bonusRecords
				case "#selectDatebonus_Stt":
					getbonusRecord(searchUserName,$("#TypeLottrey").val(),$("#isSelfType").val(),$("#timeType").val(),startDateTime, endDateTime);
					break;
				//新制度-日结记录
				case "#selectDwDateNew_Stt":
					getDailyWagesRecordNew(startDateTime_query, endDateTime_query);
					break;
				//发红包记录
				case "#selectSendPacket_Stt":
					searchSendRedPacket(startDateTime_query, endDateTime_query);
					break;
				//收红包记录
				case "#selectGetPacket_Stt":
					searchGetRedPacket(startDateTime_query, endDateTime_query);
					break;
			}
		}
	};
	return MobileSelectDate;
});