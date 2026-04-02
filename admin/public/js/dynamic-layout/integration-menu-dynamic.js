let layerWDTH = screen.width;
if (layerWDTH > 1100) {
    // requestQrCode();
    window.width = 350;
    window.height = 350;
} else if (layerWDTH > 1000) {
    window.width = 250;
    window.height = 250;
} else {
    $("#qrcode").empty();
    // requestQrCode(180, 180);
    window.width = 180;
    window.height = 180;
}

$(window).resize(function (e) {
    let layer = $("body").innerWidth();
    if (layerWDTH > 1100) {
        window.width = 350;
        window.height = 350;
    } else if (layerWDTH > 1000) {
        window.width = 250;
        window.height = 250;
    } else {
        window.width = 180;
        window.height = 180;
    }

    if (menu == "whatsapp") {
        showButtonReqQr();
        // showButtonReqQr();
    }
});
