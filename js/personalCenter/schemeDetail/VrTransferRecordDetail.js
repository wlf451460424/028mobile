
/*进入panel时调用*/
function VrTransferRecordDetailLoadedPanel(){
	catchErrorFun("VrTransferRecordDetailInit();");
}
/*离开panel时调用*/
function VrTransferRecordDetailUnloadedPanel(){
	 
}
function VrTransferRecordDetailInit(){
    var myVrTransferRecordItem = JSON.parse(localStorageUtils.getParam("myVrTransferRecord"));
    $("#VrTransferDetail_order").html(myVrTransferRecordItem.orderId);
    $("#VrTransferDetail_source").html(VrtransferDetail(myVrTransferRecordItem.DetailsSource));
    $("#VrTransferDetail_money").html(myVrTransferRecordItem.TransferMoney);
    $("#VrTransferDetail_state").html(myVrTransferRecordItem.TransferType);
    $("#VrTransferDetail_time").html(myVrTransferRecordItem.InsertTime);
    $("#VrTransferDetail_maks").html(myVrTransferRecordItem.Marks);
}