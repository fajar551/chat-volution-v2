const permission = localStorage.getItem("permission");
const token = localStorage.getItem("tk");
const uuid = localStorage.getItem("uuid");
const menu = "telegram";

$("#err_telegram_api_username").hide();
$("#err_telegram_api_id").hide();
$("#err_telegram_api_hash").hide();
$("#err_mobile_number").hide();

const hideAll = () => {
    $("#iCardTelegram").hide();
    $("#formConnecting").hide();
    $("#formOTP").hide();
    $("#send-again").hide();
    $("#countdown").hide();
    $("#waiting-text").hide();
};
hideAll();

if (token == null || token == undefined || !token) {
    location.replace(`${base_url_live}/login`);
}

if ([1, 3, 4].includes(permission)) {
    location.replace(`${base_url_live}/404`);
}

window.dataAuth = null;
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

/* fancybox galery */
Fancybox.bind('[data-fancybox="gallery"]', {
    Toolbar: {
        display: [
            { id: "prev", position: "center" },
            { id: "counter", position: "center" },
            { id: "next", position: "center" },
            "zoom",
            "slideshow",
            "download",
            "close",
            "thumbs",
        ],
    },
    on: {
        initLayout: (fancybox) => {},
    },
});

const checkStatus = async () => {
    const config = {
        method: "get",
        url: `${base_url_live}/api/agent/company-channel/telegram`,
        headers: {
            Authorization: `Bearer ${token}`,
            "X-Requested-With": "xmlhttprequest",
            "Content-Type": "application/json",
        },
    };
    await axios(config)
        .then((response) => {
            const result_res = response.data;
            hideAll();
            $("#iCardTelegram").empty();
            $("#iCardTelegram").show();

            if (result_res.data == null) {
                return $("#iCardTelegram").append(`
                <div class="col-8 col-md-8 col-lg-8">
                    <div class="card">
                        <div class="card-header bg-soft-tangerin-500">
                            <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                                Telegram Not Connected
                            </h2>
                        </div>
                        <div class="card-body ">
                            <div class="text-center">
                                <img class="w-20 img-fluid" src="${base_url_live}/assets/images/illustration/il-canceled.svg"
                                    alt="Qchat Social Management">
                                <p class="mt-2 font-size-15 text-dark-soft">
                                    Your telegram account not connected with system <b>Chatvolution</b>, read the
                                    <a class="text-url-dark" onclick="showDocumentation('read')"><b>documentation</b></a>,
                                    then click button in below.
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
                return $("#iCardTelegram").append(`
                <div class="col-8 col-md-8 col-lg-8">
                    <div class="card">
                        <div class="card-header bg-soft-tangerin-500">
                            <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                                Telegram Connected
                            </h2>
                        </div>
                        <div class="card-body border border-white">
                            <div class="text-center">
                                <img class="w-20 img-fluid" src="${base_url_live}/assets/images/illustration/il-girlcer-dark.svg"
                                    alt="Qchat Social Management">
                                <p class="mt-2 font-size-15 text-dark-soft">
                                    Your telegram connected with system Chatvolution.
                                </p>
                            </div>
                        </div>
                        <div class="card-footer text-center">
                            <button class="btn btn-danger waves-effect waves-light btn-block w-50 font-weight-bold" id="btn-disconnect-telegram" onclick="disconnectTelegram()">
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

const showDocumentation = () => {
    $("#readDocumentation").modal("show");

    $("#contentDoc").append(`
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title text-muted" id="exampleModalFullscreenLabel">
                    Tutorial Integration Telegram To ChatVolution
                </h5>
                <button type="button" class="close" onclick="hideDocumentation()" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="pl-1">
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>1.</b> Login Telegram in: <a href="https://my.telegram.org/auth" target="_blank" class="text-url-secondary">my.telegram.org</a>
                        </h6>
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>2.</b> Enter the cellphone number registered on Telegram
                        </h6>
                        <a id="overview-file" data-fancybox="gallery" href="${base_url_live}/assets/images/integrations/telegram/1.png">
                            <img onmousedown="return false" src="${base_url_live}/assets/images/integrations/telegram/1.png" alt="step1"
                            class="img-rounded shadow pointer w-50 ml-3">
                        </a>
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>3.</b> check and insert verification code from telegram,example:
                        </h6>
                        <a id="overview-file" data-fancybox="gallery" href="${base_url_live}/assets/images/integrations/telegram/authentication.jpg">
                            <img onmousedown="return false" src="${base_url_live}/assets/images/integrations/telegram/authentication.jpg" alt="step2"
                            class="img-rounded shadow pointer w-25 h-25 ml-3">
                        </a>
                        <a id="overview-file" data-fancybox="gallery" href="${base_url_live}/assets/images/integrations/telegram/verify.png">
                            <img onmousedown="return false" src="${base_url_live}/assets/images/integrations/telegram/verify.png" alt="step2"
                            class="img-rounded shadow pointer w-50 h-50 ml-3">
                        </a>
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>4.</b> Click API DEVELOPMENT Tools, and then copy telegram api key and api hash
                        </h6>
                        <a id="overview-file" data-fancybox="gallery" href="${base_url_live}/assets/images/integrations/telegram/2.png">
                            <img onmousedown="return false" src="${base_url_live}/assets/images/integrations/telegram/2.png" alt="step3"
                            class="img-rounded shadow pointer w-50 h-50 ml-3">
                        </a>
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>5.</b> Paste api key and api hash to form integration chatVolution, example:
                        </h6>
                        <a id="overview-file" data-fancybox="gallery" href="${base_url_live}/assets/images/integrations/telegram/3.png">
                            <img onmousedown="return false" src="${base_url_live}/assets/images/integrations/telegram/3.png" alt="step5"
                            class="img-rounded shadow pointer w-50 h-25 ml-3">
                        </a>
                        <a id="overview-file" data-fancybox="gallery" href="${base_url_live}/assets/images/integrations/telegram/form.png">
                            <img onmousedown="return false" src="${base_url_live}/assets/images/integrations/telegram/form.png" alt="step5"
                            class="img-rounded shadow pointer w-25 h-25 ml-3">
                        </a>
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>6.</b> Type OTP code telegram to chat volution, example:
                        </h6>
                        <a id="overview-file" data-fancybox="gallery" href="${base_url_live}/assets/images/integrations/telegram/authentication 2.png">
                            <img onmousedown="return false" src="${base_url_live}/assets/images/integrations/telegram/authentication 2.png" alt="step6"
                            class="img-rounded shadow pointer w-50 h-25 ml-3">
                        </a>
                        <a id="overview-file" data-fancybox="gallery" href="${base_url_live}/assets/images/integrations/telegram/typing otp.png">
                            <img onmousedown="return false" src="${base_url_live}/assets/images/integrations/telegram/typing otp.png" alt="step6"
                            class="img-rounded shadow pointer w-25 h-25 ml-3">
                        </a>
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
var input = document.querySelector("#mobile_number");
var iti = window.intlTelInput(input, {
    onlyCountries: ["id", "us"],
    preferredCountries: ["id"],
    separateDialCode: true,
    utilsScript: `${base_url_live}/assets/libs/intl-tel-input/build/js/utils.js`,
});

/* minus case in type input number */
document
    .querySelector("#mobile_number")
    .addEventListener("keypress", function (evt) {
        if (
            (evt.which != 8 && evt.which != 0 && evt.which < 48) ||
            evt.which > 57
        ) {
            evt.preventDefault();
        }
    });

document
    .querySelector("#telegram_api_id")
    .addEventListener("keypress", function (evt) {
        if (
            (evt.which != 8 && evt.which != 0 && evt.which < 48) ||
            evt.which > 57
        ) {
            evt.preventDefault();
        }
    });

/* form connected */
const showFormConnect = () => {
    hideAll();
    $("#formConnecting").show();
};

/* back card */
const backFirstStep = () => {
    checkStatus();
};

/* send data to connect & result connect */
$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;
            if (["mobile_number"].includes(elementID)) {
                let isValid = iti.isValidNumber();
                if (!isValid) {
                    $(`#err_${elementID}`).empty();
                    $(`#err_${elementID}`).append(
                        "Format phone number not supported!"
                    );
                    $(`#err_${elementID}`).show();
                }
            } else {
                if (this.validationResult == true) {
                    $(`#err_${elementID}`).hide();
                } else {
                    $(`#err_${elementID}`).show();
                }
            }
        });

    $("#btn-save").submit(function (e) {
        e.preventDefault();
        let phone_number = iti.getNumber();
        let isValid = iti.isValidNumber();
        if (!isValid) {
            $("#err_mobile_number").empty();
            $("#err_mobile_number").append(
                "Format phone number not supported!"
            );
            $("#err_mobile_number").show();
            return false;
        }
        const dataIntegration = {
            inputApiId: $("#telegram_api_id").val(),
            inputApiHash: $("#telegram_api_hash").val(),
            inputAccountUsername: $("#telegram_api_username").val(),
            inputPhone: phone_number,
            token,
        };

        hideAll();
        $("#formOTP").show();

        socket.emit("integrate.telegram", dataIntegration);
        iti.setNumber("+62");
        $("#telegram_api_id").val("");
        $("#telegram_api_hash").val("");
        $("#telegram_api_username").val("");
    });
});

/* type otp code */
let digitValidate = function (ele) {
    ele.value = ele.value.replace(/[^0-9]/g, "");
};

let tabChange = function (val) {
    try {
        let ele = document.querySelectorAll(".otp");
        if (ele[val - 1].value != "") {
            ele[val].focus();
        } else if (ele[val - 1].value == "") {
            ele[val - 2].focus();
        }
    } catch (error) {}
};

/* send code virifycation done process*/
const verifyAccount = () => {
    let digitNumber = "";
    let digit1 = $("#digit-1").val();
    let digit2 = $("#digit-2").val();
    let digit3 = $("#digit-3").val();
    let digit4 = $("#digit-4").val();
    let digit5 = $("#digit-5").val();

    if (!digit1 || !digit2 || !digit3 || !digit4 || !digit5) {
        Toast.fire({
            icon: "success",
            title: "OTP code less than 5",
        });
    } else {
        let resultCodeNumber = digitNumber.concat(
            digit1,
            digit2,
            digit3,
            digit4,
            digit5
        );

        socket.emit("integrate.telegram.submitcode", resultCodeNumber);
    }
};

socket.on("integrate.telegramresult", (response) => {
    if (response.success) {
        Toast.fire({
            icon: "success",
            title: "Yuhuu, integration telegram success",
        });
        $("#digit-1").val(null);
        $("#digit-2").val(null);
        $("#digit-3").val(null);
        $("#digit-4").val(null);
        $("#digit-5").val(null);
        checkStatus();
    } else {
        Toast.fire({
            icon: "error",
            title: !Boolean(response.message) ? "" : response.message,
        });
    }
});

disconnectTelegram = () => {
    socket.emit("disconnect.telegram");
};

socket.on("disconnect.telegramresult", (response) => {
    if (response.success) {
        Toast.fire({
            icon: "success",
            title: "Yuhuu, disconnect telegram successfuly",
        });
        checkStatus();
    } else {
        Toast.fire({
            icon: "error",
            title: response.message,
        });
        checkStatus();
    }
});
