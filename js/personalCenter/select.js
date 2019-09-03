
/********** 隐藏显示  **********/
function showHide(obj, objToHide) {
    var el = $("#" + objToHide)[0];
    $(obj).toggleClass('active');
    $(el).toggle();
}

//验证正则
var checkUtil = {
	TikuanMIma : function (s) {
		var regu = /^(\w){6,20}$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	Email : function (s) {
		var regu = /([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	QQ : function (s) {
		var regu = /^[0-9]{5,13}$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	Tel : function (s) {
		var regu = /^1[3|4|5|7|8][0-9]{9}$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	Name : function (s) {
		var regu = /^[\u4E00-\u9FA5]{2,6}$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	IDcard : function (s) {
		var regu = /^[0-9]{15}$|^[0-9]{18}$|^[0-9]{17}[X|x]$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	BankName : function (s) {
		var regu = /^[\u4E00-\u9FA5]{2,100}$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	BankNum : function (s) {
		var regu = /^[0-9]{16,19}$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	UserName : function (s) {
if (!isChinese(s)) {
			var regu = /^(?!^\d+$)([\u2E80-\u9FFF]|[a-z-A-Z0-9]|[_]){3,16}$/;
		    var re = new RegExp(regu);
		    if (re.test(s)) {
		        return true;
		    }else{
			    return false;
	        }
		}else{
	          if (checksum(s) >=4) {
                  return true;
	          }else{
                  return false;
	          }
		}
	},
	Mima : function (s) {
		var regu = /^[0-9A-Za-z]{6,20}$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	Money : function (s) {
		var regu = /^((1[0-9])|([2-9]\d)|([1-9]\d{2,}))(\.\d{1,2})?$/g;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	},
	isNum : function(s) {
		var regu = /^[0-9]*$/;
	    var re = new RegExp(regu);
	    if (re.test(s)) {
	        return true;
	    }else{
	       return false;
	    }
	}
}
//判断是否全为汉字
	function isChinese(temp) { 
		var re=/[^\u4e00-\u9fa5]/; 
		if(re.test(temp)) return false; 
		return true; 
	} 

	function checksum(chars){
		var sum = 0; 
		for (var i=0; i<chars.length; i++){ 
		    var c = chars.charCodeAt(i); 
			if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)){ 
			    sum++; 
		    }else{     
		      sum+=2; 
		    } 
		}
		return sum;
	}
//个人中心省市级联
function selectCity(idP,idC){
	var $p = $('<select></select>');
	$.each(city, function(k, v) {
		$p.append('<option value="'+k+'">'+city[k].name+'</option>')
			.change(function(){
			$("#" + idC).empty();
			var value = $(this).val();
			$("#" + idC).append(selectCity2(value));
		});
	});

	$("#" + idP).append($p);
	$("#" + idC).append('<select><option value="C0000">请选择城市</option></select>');
}

function selectCity2(value){
	var citys = city[value].citys;
	var $c = $('<select></select>');
	$.each(citys, function(k,v) {
		$c.append('<option value="'+k+'">'+v+'</option>')
			.change(function(){
			});
	});
	return $c;
}

function selectFn(value){
	var $c = $('<select></select>');
	$.each(value, function(k,v) {
		$c.append('<option value="'+k+'">'+v.name+'</option>')
			.change(function(){
			});
	});
	return $c;
}

var goBack = {
	myLottery : function(){createInitPanel_Fun('myLottery');},
	subordinateManage : function(){createInitPanel_Fun('subordinateManage');},
	personalInfo : function(){createInitPanel_Fun('personalInfo');},
	showBankInfo : function(){createInitPanel_Fun('showBankInfo');},
	EmailLists : function(){createInitPanel_Fun('EmailLists');},
	sendEmail : function(){createInitPanel_Fun('sendEmail');},
	contractManage : function(){createInitPanel_Fun('contractManageNew');},
	loginPage : function(){createInitPanel_Fun('loginPage');},
	myRedPacket : function(){createInitPanel_Fun('myRedPacket');},
	activity : function(){createInitPanel_Fun('activity');},
	proxyBettingRecord : function(){setPanelBackPage_Fun('proxyBettingRecord');},
	proxyBettingRecordPK : function(){setPanelBackPage_Fun('proxyBettingRecordPK');}
};


//是否还有更多数据
function isHasMorePage(rows,size){
	if(rows.length == 0){
		hasMorePage = false;
		toastUtils.showToast("没有数据");
		return;
	} else if(rows.length >= parseInt(size)){
		hasMorePage = true;
	} else {
		hasMorePage = false;
		return;
	}
}

//使用上拉加载 和 下拉刷新
//myScroller scroller对象
//emptyID刷新时要清空的div id
//useFun 刷新加载调用的方法
function addUseScroller(myScroller,emptyID,useFun){
    myScroller.addPullToRefresh();//Scroller add下拉刷新
	myScroller.addInfinite();//Scroller add上拉加载分页
    myScroller.runCB=true;
	var hideClose;
	$.unbind(myScroller, "refresh-release");
	$.bind(myScroller, "refresh-release", function () {
	    var that = this;
	    clearTimeout(hideClose);
	    hideClose = setTimeout(function (){
	    	$("#" + emptyID).empty();
	    	page = 0;
	    	hasMorePage = true;
    		eval(useFun);
    		that.hideRefresh();
	    }, 1600);
	    return false; //tells it to not auto-cancel the refresh
	});
	//滚动过去，下拉将不再起作用！手动取消拉动刷新
	$.bind(myScroller, "refresh-cancel", function () {
	    clearTimeout(hideClose);
	});

	myScroller.enable();
	/*修复afui refresh事件会触发infinite事件bug*/
	$(document.body).unbind("touchmove");
    $(document.body).bind("touchmove", function(e) {
        if (touch.y1 - touch.y2 <= 0) {
            $("#infinite").hide();
        } else {
            $("#infinite").show();
        }
    });
    $.unbind(myScroller, "infinite-scroll");
    $.bind(myScroller, "infinite-scroll", function () {
        var self = this;
        if (!hasMorePage) { //没有数据了，则直接返回，不再下拉
            self.clearInfinite();
            //$("#noItem")[0] ? $("#" + emptyID).append('') : $("#" + emptyID).append('<div id="noItem"><span>没有更多数据了</span></div>');
            return;
        }
        if($("#infinite").length==0){
        	$(self.el).append('<div id="infinite"><div class="pullDown loading"><span class="pullDownIcon"></span><span class="pullDownLabel">正在加载....</span></div></div>');
        	$.unbind(myScroller, "infinite-scroll-end");
            $.bind(myScroller, "infinite-scroll-end", function () {
            	// if(isScrollDown){return false;}
                $.unbind(myScroller, "infinite-scroll-end");
                self.scrollToBottom();
                setTimeout(function () {
                    $(self.el).find("#infinite").remove();
                    self.clearInfinite();
                    page++;
    				eval(useFun);
    				self.scrollToBottom();
                }, 1600);
            });
        }else {
        	return;
        }
    });
}

//下拉刷新
//clearnFun 清空函数
// useFun 刷新调用函数
function UseScrollerRefresh(myScroller,clearnFun,useFun){
	myScroller.scrollToTop();
	//Scroller add下拉刷新
    myScroller.addPullToRefresh();
    //向下拉动出现下拉开始刷新
	var hideClose;
	myScroller.runCB=true;
	$.unbind(myScroller, "refresh-release");
	$.bind(myScroller, "refresh-release", function () {
	    var that = this;
	    clearTimeout(hideClose);
	    hideClose = setTimeout(function (){
	    	eval(clearnFun);
    		eval(useFun);
    		that.hideRefresh();
	    }, 2000);
	    return false; //tell it not to cancel auto refresh
	});
	//滚动过去，下拉将不再起作用！手动取消拉动刷新
	$.bind(myScroller, "refresh-cancel", function () {
	    clearTimeout(hideClose);
	});
	myScroller.enable();
}

function addUseScroller_new(myScroller,emptyID,useFun){
	myScroller.addPullToRefresh();//Scroller add下拉刷新
	myScroller.addInfinite();//Scroller add上拉加载分页
	myScroller.runCB=true;
	var hideClose;
	$.unbind(myScroller, "refresh-release");
	$.bind(myScroller, "refresh-release", function () {
		var that = this;
		clearTimeout(hideClose);
		hideClose = setTimeout(function (){
			$("#" + emptyID).empty();
			page = 1;
			hasMorePage = true;
			eval(useFun);
			that.hideRefresh();
		}, 1600);
		return false; //tells it to not auto-cancel the refresh
	});
	//滚动过去，下拉将不再起作用！手动取消拉动刷新
	$.bind(myScroller, "refresh-cancel", function () {
		clearTimeout(hideClose);
	});

	myScroller.enable();
	/*修复afui refresh事件会触发infinite事件bug*/
	$(document.body).unbind("touchmove");
	$(document.body).bind("touchmove", function(e) {
		if (touch.y1 - touch.y2 <= 0) {
			$("#infinite").hide();
		} else {
			$("#infinite").show();
		}
	});
	$.unbind(myScroller, "infinite-scroll");
	$.bind(myScroller, "infinite-scroll", function () {
		var self = this;
		if (!hasMorePage) { //没有数据了，则直接返回，不再下拉
			self.clearInfinite();
			//$("#noItem")[0] ? $("#" + emptyID).append('') : $("#" + emptyID).append('<div id="noItem"><span>没有更多数据了</span></div>');
			return;
		}
		if($("#infinite").length==0){
			$(self.el).append('<div id="infinite"><div class="pullDown loading"><span class="pullDownIcon"></span><span class="pullDownLabel">正在加载....</span></div></div>');
			$.unbind(myScroller, "infinite-scroll-end");
			$.bind(myScroller, "infinite-scroll-end", function () {
				// if(isScrollDown){return false;}
				$.unbind(myScroller, "infinite-scroll-end");
				self.scrollToBottom();
				setTimeout(function () {
					$(self.el).find("#infinite").remove();
					self.clearInfinite();
					page++;
					eval(useFun);
					self.scrollToBottom();
				}, 1600);
			});
		}else {
			return;
		}
	});
}

//日期 毫秒数转化为年月日时分秒
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
}
