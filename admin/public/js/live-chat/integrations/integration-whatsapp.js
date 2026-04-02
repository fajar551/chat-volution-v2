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
        url: `${base_url_live}/api/agent/company-channel/whatsapp`,
        headers: {
            Authorization: `Bearer ${token}`,
            "X-Requested-With": "xmlhttprequest",
            "Content-Type": "application/json",
        },
    };

    await axios(config)
        .then((response) => {
            const resData = response.data.data;

            hideAll();
            $("#iCardWA").show();
            if (resData == null || resData == undefined) {
                $("#iCardWA").append(`
                    <div class="col-8 col-md-8 col-lg-8">
                        <div class="card">
                          <p>File ini ada di folder chatvolutionV2\admin\public\js\live-chat\integrations\integration-whatsapp.js</p>
                            <div class="card-header bg-soft-tangerin-500">
                                <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                                    Whatsapp Connected
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
                                <button class="btn btn-tangerin waves-effect waves-light btn-block w-50 font-weight-bold" onClick="showFormConnect()">
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
            location.replace(`${base_url_live}/404`);
        });

    $(".page-loader").fadeOut(600);
};
checkStatus();

const showFormConnect = () => {
    hideAll();
    $("#formConnecting").show();
};

const backFirstStep = () => {
    checkStatus();
};

/* function confirm */
$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;
            if (["phone"].includes(elementID)) {
                if (this.validationResult == true) {
                    let isValid = iti.isValidNumber();
                    $(`#err_${elementID}`).hide();
                    if (!isValid) {
                        $(`#err_${elementID}`).empty();
                        $(`#err_${elementID}`).append(
                            "Format phone number not supported!"
                        );
                        $(`#err_${elementID}`).show();
                    }
                } else {
                    $(`#err_${elementID}`).empty();
                    $(`#err_${elementID}`).append("Phone number is required");
                    $(`#err_${elementID}`).show();
                }
            }
        });

    $("#btn-save").submit(function (e) {
        e.preventDefault();
        console.log("click")
        phone = iti.getNumber();
        let isValid = iti.isValidNumber();
        $("#err_phone").hide();
        if (!isValid) {
            $("#err_phone").empty();
            $("#err_phone").append("Format phone number not supported!");
            $("#err_phone").show();
            return false;
        }
        const data = {
            inputPhone: phone,
            token: localStorage.getItem("tk"),
        };

        socket.emit("integrate.whatsapp", data);
        document
            .getElementById("btn-save")
            .removeAttribute("data-parsley-validate");
        document
            .getElementById("btn-save")
            .removeAttribute("data-parsley-errors-messages-disabled");
        $(".btn-connect").empty();
        $(".btn-connect").append(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
        `);
        $(".btn-connect").attr("disabled", true);
        $(".back-first").hide();
    });
});

socket.on("integrate.whatsapp.qr", (data) => {
    hideAll();
    $("#qrWA").show();
    qrView();
    generateQr(data);
});

socket.on("integrate.whatsappresult", async (data) => {
    if (!data.success) {
        Toast.fire({
            icon: "error",
            title: `Integration whatsapp failed, because ${data.message.toLowerCase()}`,
        });
        setTimeout(() => {
            location.reload();
        }, 3001);
    } else {
        await checkStatus();
        Toast.fire({
            icon: "success",
            title: `Yuhuu, integration whatsapp success`,
        });
    }

    $("#btn-save").attr("data-parsley-validate");
    $("#btn-save").attr("data-parsley-errors-messages-disabled");
    $(".btn-connect").empty();
    $(".btn-connect").append(`
        <i class="fas fa-link mr-1"></i> Connect
    `);
    $(".btn-connect").attr("disabled", false);
    $(".back-first").show();
});

const loaderCard = () => {
    $("#qrcode").append(`
        <div class="card-loader card-loader--tabs" style="width:${window.width}px;height:${window.height}px"></div>
    `);
    $("#qrcode").show();
};

/* generate code */
const generateQr = (url = "https://chatvolution.my.id") => {
    let elQrCode = document.getElementById("qrcode");

    let width = window.width;
    let height = window.height;

    elQrCode.innerHTML = "";
    $("#qrcode").show();

    new QRious({
        element: elQrCode,
        value: url,
        size: width,
        background: "#ffffff",
        backgroundAlpha: 1,
        foreground: "#ffa237",
        foregroundAlpha: 1,
        level: "H",
    });

    document.getElementById("qrcode").title = "SQAN ME";
};

const disconectWa = () => {
    $(".btn-disconnect").empty();
    $(".btn-disconnect").append(`
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...
    `);
    $(".btn-disconnect").attr("disabled", true);
    socket.emit("disconnect.whatsapp");
};

socket.on("disconnect.whatsappresult", async (response) => {
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

/* initialization intl-tel-input library */
var input = document.querySelector("#phone");
var iti = window.intlTelInput(input, {
    onlyCountries: ["id", "us"],
    preferredCountries: ["id"],
    separateDialCode: true,
    utilsScript: `${base_url_live}/assets/libs/intl-tel-input/build/js/utils.js`,
});

/* minus case in type input number */
document.querySelector("#phone").addEventListener("keypress", function (evt) {
    if (
        (evt.which != 8 && evt.which != 0 && evt.which < 48) ||
        evt.which > 57
    ) {
        evt.preventDefault();
    }
});
