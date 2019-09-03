
/*进入panel时调用*/
function transferRecordDetailLoadedPanel(){
	catchErrorFun("transferRecordDetailInit();");
}
/*离开panel时调用*/
function transferRecordDetailUnloadedPanel(){
	 
}
function transferRecordDetailInit(){
    var myTransferRecordItem = JSON.parse(localStorageUtils.getParam("myTransferRecord"));
    $("#transferDetail_order").html(myTransferRecordItem.orderId);
    $("#transferDetail_source").html(transferDetail(myTransferRecordItem.DetailsSource));
    $("#transferDetail_money").html(myTransferRecordItem.TransferMoney);
    $("#transferDetail_state").html(myTransferRecordItem.TransferType);
    $("#transferDetail_time").html(myTransferRecordItem.InsertTime);
    $("#transferDetail_maks").html(myTransferRecordItem.Marks);
    
	if($("#transferDetail_state").val() != "交易成功"){
		$("#transferDetail_state span").css('color','red');
	}else{
		$("#transferDetail_state span").css('color','green');
	}
}