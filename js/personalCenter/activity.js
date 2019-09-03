//@ Unload
function activityUnloadedPanel() {
	
}

//@ Loaded
function activityLoadedPanel() {
	catchErrorFun("activityInit();");
}

//@ Init
function activityInit() {
	myUserID = localStorageUtils.getParam("myUserID");
	myRebate = localStorageUtils.getParam("MYRebate");
	myLevel = localStorageUtils.getParam("Level")
	if(myLevel == 3 && myRebate == 1980){
		$('#activity2').show();
	}else{
		$('#activity2').hide();
	}

}

