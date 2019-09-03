
function agreementPageLoadPanel() {
    getAgreementState();
}

function agreementPageUnloadedPanel() {
}

function getAgreementState() {
    $("#agreement_No").off('click');
    $("#agreement_No").on('click', function() {
        destroyLogin();
    });

    $("#agreement_Yes").off('click');
    $("#agreement_Yes").on('click', function() {
//      getPanelBackPage_Fun();  
        //正常登录
        createInitPanel_Fun("lotteryHall");
    });
}