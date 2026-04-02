const permission = localStorage.getItem("permission");
const token = localStorage.getItem("tk");
const uuid = localStorage.getItem("uuid");
const menu = "whatsapp";

$("#err_phone").hide();

const qrView = () => {
    $("#qrcode").empty();
    $("#qrcode").hide();
    $("#btn-qrcode").hide();
    $("#btn-qrcode").empty();
};
qrView();

const hideAll = () => {
    $("#iCardWA").hide();
    $("#formConnecting").hide();
    $("#qrWA").hide();
    $("#iCardWA").empty();
};
hideAll();

if (token == null || token == undefined || !token) {
    location.replace(`${base_url_live}/login`);
}

if ([1, 3, 4].includes(permission)) {
    location.replace(`${base_url_live}/404`);
}

var dataAuth = {};
let phone = null;

/* toast with sweetalert2 */
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: false,
    allowEscapeKey: false,
    allowOutsideClick: false,
    showClass: {
        popup: "animated lightSpeedIn",
    },
    hideClass: {
        popup: "animated lightSpeedOut",
    },
    onOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
});

const checkStatus = async () => {
    const config = {
        method: "GET",
        url: `${BASE_SOCKET_RELABS}/status`,
    };

    await axios(config)
        .then((response) => {
            hideAll();
            $("#iCardWA").show();
            if (response.data !== "CONNECTED") {
                $("#iCardWA").append(`
                    <div class="col-8 col-md-8 col-lg-8">
                        <div class="card">
                            <div class="card-header bg-soft-tangerin-500">
                                <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                                    Whatsapp Disconnected
                                </h2>
                            </div>
                            <div class="card-body border border-white">
                                <div class="text-center">
                                    <img class="w-20 img-fluid" src="${base_url_live}/assets/images/illustration/il-canceled.svg" alt="Qchat Social Management">
                                    <p class="mt-2 font-size-15 text-dark-soft">
                                        Your Whatsapp account not connected with system <b>Chatvolution</b>
                                    </p>
                                </div>
                            </div>
                            <div class="card-footer text-center">
                                <button class="btn btn-tangerin waves-effect waves-light btn-block w-50 font-weight-bold btn-connect" onClick="showFormConnect()">
                                    <i class="fas fa-link mr-1"></i> Connect
                                </button>
                            </div>
                        </div>
                    </div>
                `);
            } else {
                $("#iCardWA").append(`
                    <div class="col-8 col-md-8 col-lg-8">
                        <div class="card">
                            <div class="card-header bg-soft-tangerin-500">
                                <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                                    Whatsapp Connected
                                </h2>
                            </div>
                            <div class="card-body border border-white">
                                <div class="text-center">
                                    <img class="w-20 img-fluid" src="${base_url_live}/assets/images/illustration/il-girlcer-dark.svg" alt="Qchat Social Management">
                                    <p class="mt-2 font-size-15 text-dark-soft">
                                        Your Whatsapp connected with system Chatvolution.
                                    </p>
                                </div>
                            </div>
                            <div class="card-footer text-center">
                                <button class="btn btn-danger waves-effect waves-light btn-block w-50 font-weight-bold btn-disconnect" onclick="disconectWa()">
                                    <i class="fas fa-power-off mr-1"></i> Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                `);
            }
        })
        .catch((error) => {
            // location.replace(`${base_url_live}/404`);
            console.log(error)
        });

    $(".page-loader").fadeOut(600);
};
checkStatus();

const showFormConnect = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "onMessage": "console.log(message)"
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    fetch("https://waserverrelabs.genio.id/init", requestOptions)
      .then((result) =>{
        $(".btn-connect").empty();
        $(".btn-connect").append(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
        `);
        $(".btn-connect").attr("disabled", true);
      })
      .catch((error) => console.error(error))
};

socketRelabs.on('qrCode', async (data) => {
    if(data.message === "connect"){
        await checkStatus();
    }else{
        $(".btn-connect").empty();
        $(".btn-connect").append(`
            <i class="fas fa-link mr-1"></i> Connect
        `);
        $(".btn-connect").attr("disabled", false);
        hideAll();
        $("#qrWA").show();
        qrView();
        document.getElementById('qrCode').src = data.image;
    }
});

const backFirstStep = () => {
    checkStatus();
};

const loaderCard = () => {
    $("#qrcode").append(`
        <div class="card-loader card-loader--tabs" style="width:${window.width}px;height:${window.height}px"></div>
    `);
    $("#qrcode").show();
};

const disconectWa = () => {
    $(".btn-disconnect").empty();
    $(".btn-disconnect").append(`
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...
    `);
    $(".btn-disconnect").attr("disabled", true);
    socketRelabs.emit("disconnect.whatsapp");
};

socketRelabs.on("disconnect.whatsappresult", async (response) => {
    if(response.success){
        await checkStatus();
        Toast.fire({
            icon: "success",
            title: `Disconnect with whatsapp success`,
        });
        $(".btn-disconnect").empty();
        $(".btn-disconnect").append(`
            <i class="fas fa-power-off mr-1"></i> Disconnect
        `);
        $(".btn-disconnect").attr("disabled", false);
    }else{
        await checkStatus();
        Toast.fire({
            icon: "error",
            title: `Disconnect with whatsapp error`,
        });
        $(".btn-disconnect").empty();
        $(".btn-disconnect").append(`
            <i class="fas fa-power-off mr-1"></i> Disconnect
        `);
        $(".btn-disconnect").attr("disabled", false);
    }
    
});
/* documentation popup */
const showDocumentation = () => {
    $("#readDocumentation").modal("show");

    $("#contentDoc").append(`
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title text-muted" id="exampleModalFullscreenLabel">Documentation Integration
                    Whatsapp
                </h5>
                <button type="button" class="close" onclick="hideDocumentation()" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body">
                <h5>Read Tutorial Integration Whatsapp with QrCode, to System Chatvolution:</h5>
                <div class="pl-1">
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>1.</b> Login Telegram with url: <a href="#" class="text-url-secondary">Click Me</a>,
                            and then
                        </h6>
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>2.</b> And then do this step image in below
                        </h6>
                        <img src="${base_url_live}/assets/images/layouts/layout-2.jpg" alt="step1"
                            class="img-rounded w-25 ml-3">
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>3.</b> And then do this step image in below
                        </h6>
                        <img src="${base_url_live}/assets/images/layouts/layout-2.jpg" alt="step1"
                            class="img-rounded w-25 ml-3">
                    </div>
                </div>
            </div>
        </div>
    `);
};

/* hide documentation with button */
const hideDocumentation = () => {
    $("#readDocumentation").modal("hide");
    $("#contentDoc").empty();
};

/* hide documentation with key esc/escape */
$("#readDocumentation").on("hide.bs.modal", function (e) {
    $("#contentDoc").empty();
});
