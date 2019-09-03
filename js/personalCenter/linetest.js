//初始化数据
function lineTestLoadedPanel() {
    //解决登录页Header和lineTest Header 同时出现的bug。
    if($("#loginPageHeader")){
	    $("#loginPageHeader").remove();
    }

    $('.liad_box_ul').empty();
    //初始化显示
    isfirstLine = true;

    //页面显示文案
    var showLines = [];
    for (var i = 1; i <= arrLines.length; i++){
        showLines.push("官方地址 " + i);
    }

    $.each(arrLines,function () {
        $('.liad_box_ul').append('<li><span>0ms</span><input readonly type="text" value="" style="width:60%"><a href="#" style="color:#ffffff">前往</a></li>')
    });

    //给各个线路框绑定显示对应的线路数据
    $(".liad_box_ul li").each(function(index, domEle) {
        //给跳转a标签添加地址
        $(domEle).find("a").on('click',function () {
            window.location.href = 'https://' + arrLines[index] + '/Mobile/#loginPage';
        });
        //给各个线路检测输入框写入配置的域名
        $(domEle).find("input").attr("value", showLines[index]);
    });
    $("#submit").on('click',linesTest);
    linesTest();
}

//测试网速方法
function linesTest() {
    $(".liad_box_ul li").each(function(index, domEle) {
        /*开始时间*/
        var startTime_index = null;
        var $_span = $(domEle).children("span");
        $_span.text("检测中...");
        var domEle_index = arrLines[index];
        $.ajax({
            url:"https://" + domEle_index + "/testLine",
            type: 'get',
            dataType:'jsonp',
            jsonp:'callback',
            timeout: 15000,
            success:function(data){
                var endTime = new Date();
                var tt = parseInt((endTime.getTime() - startTime_index.getTime())/30);
                if(tt<20){
                    $_span.attr("class","speed_1");
                } else if (tt>=20 && tt<100){
                    $_span.attr("class","speed_2");
                }else{
                    $_span.attr("class","speed_3");
                }
                $("#pingresult").append("<span id='speed_" + index + "' value='" + domEle_index + "'>" + tt + "</span>");
                $_span.text(tt + "ms");
            },
            error: function(){
                if ($_span.text() == '检测中...') {
                    $_span.text('超时');
                    $_span.attr("class","speed_3");
                }
            },
            complete : function(xhr, textStatus) {
                if (xhr.status != 200) {
                    if ($_span.text() == '检测中...') {
                        $_span.text('超时');
                        $_span.attr("class","speed_3");
                    }
                }
            },
            beforeSend: function(e, xhr, o){
                startTime_index = new Date();
            }
        })
    });
}
