const permission = localStorage.getItem("permission");
const token = localStorage.getItem("tk");
const uuid = localStorage.getItem("uuid");
const menu = "whmcs";

const hideAll = () => {
    $("#err_domain").hide();
    $("#err_identifier").hide();
    $("#err_secret").hide();
    $("#iCardWHMCS").hide();
    $("#iCardWHMCS").empty();
    $("#formConnecting").hide();
};
hideAll();

if (token == null || token == undefined || !token) {
    location.replace(`${base_url_live}/login`);
}

if ([1, 3, 4].includes(permission)) {
    location.replace(`${base_url_live}/404`);
}

let dataIntegration = null;

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
        method: "get",
        url: `${base_url_live}/api/agent/company-channel/whmcs`,
        headers: {
            Authorization: `Bearer ${token}`,
            "X-Requested-With": "xmlhttprequest",
            "Content-Type": "application/json",
        },
    };
    await axios(config)
        .then((response) => {
            const resultRes = response.data;
            hideAll();
            $("#iCardWHMCS").show();

            if (resultRes.data == null) {
                $("#iCardWHMCS").append(`
                    <div class="col-8 col-md-8 col-lg-8">
                        <div class="card">
                            <div class="card-header bg-soft-tangerin-500">
                                <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                                    WHMCS Not Connected
                                </h2>
                            </div>
                            <div class="card-body ">
                                <div class="text-center">
                                    <img class="w-20 img-fluid" src="${base_url_live}/assets/images/illustration/il-canceled.svg"
                                        alt="Qchat Social Management">
                                    <p class="mt-2 font-size-15 text-dark-soft">
                                        Your whmcs account not connected with system <b>Chatvolution</b>, read the
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
                $("#iCardWHMCS").append(`
                    <div class="col-8 col-md-8 col-lg-8">
                        <div class="card">
                            <div class="card-header bg-soft-tangerin-500">
                                <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                                    WHMCS Connected
                                </h2>
                            </div>
                            <div class="card-body border border-white">
                                <div class="text-center">
                                    <img class="w-20 img-fluid" src="${base_url_live}/assets/images/illustration/il-girlcer-dark.svg"
                                        alt="Qchat Social Management">
                                    <p class="mt-2 font-size-15 text-dark-soft">
                                        Your WHMCS connected with system Chatvolution.
                                    </p>
                                </div>
                            </div>
                            <div class="card-footer text-center">
                                <button class="btn btn-danger waves-effect waves-light btn-block w-50 font-weight-bold" id="btn-disconnect-telegram" onclick="disconnect()">
                                    <i class="fas fa-power-off mr-1"></i> Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                `);
            }
            $(".page-loader").fadeOut(600);
        })
        .catch((error) => {
            location.replace(`${base_url_live}/404`);
        });
};
checkStatus();

const showFormConnect = () => {
    hideAll();
    $("#formConnecting").show();
};

const backFirstStep = () => {
    checkStatus();
};

/* function connect */
$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;
            if (["domain", "identifier", "secret"].includes(elementID)) {
                if (this.validationResult == true) {
                    $(`#err_${elementID}`).hide();
                } else {
                    $(`#err_${elementID}`).show();
                }
            }
        });

    $("#btn-save").submit(function (e) {
        e.preventDefault();
        hideAll();
        $(".page-loader").removeAttr("style");
        const data = {
            domain: $("#domain").val(),
            identifier: $("#identifier").val(),
            secret: $("#secret").val(),
        };

        const config = {
            url: `${base_url_live}/api/agent/connect-channel/whmcs`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: `Bearer ${token}`,
            },
            data,
        };

        axios(config)
            .then(async (response) => {
                await checkStatus();
                Toast.fire({
                    icon: "success",
                    title: "Yeah, successfuly WHMCS connected with system chat volution!",
                });
            })
            .catch((error) => {
                $(".page-loader").fadeOut(600);
                Swal.fire({
                    title: "Error",
                    text: `Error From WHMCS: ${error.response.data.message}`,
                    icon: "error",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    confirmButtonColor: "#ff3d60",
                    confirmButtonText: "Refresh",
                }).then((result) => {
                    checkStatus();
                });
            });
    });
});

/* function disconnect */
const disconnect = () => {
    const config = {
        url: `${base_url_live}/api/agent/disconnect-channel/whmcs`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
        },
    };

    axios(config)
        .then(async (response) => {
            await checkStatus();
            Toast.fire({
                icon: "success",
                title: "Hmm, you disconnect WHMCS from system ChatVolution!",
            });
        })
        .catch((error) => {
            $(".page-loader").fadeOut(600);

            Swal.fire({
                title: "Error",
                text: `Error: ${error.response.data.message}`,
                icon: "error",
                showCancelButton: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
                confirmButtonColor: "#ff3d60",
                confirmButtonText: "Refresh",
            }).then((result) => {
                checkStatus();
            });
        });
};

/* universal function */
const showDocumentation = () => {
    $("#readDocumentation").modal("show");

    $("#contentDoc").append(`
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title text-muted" id="exampleModalFullscreenLabel">Documentation Integration
                    WHMCS With Secret Key
                </h5>
                <button type="button" class="close" onclick="hideDocumentation()" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body">
                <h5>Read Tutorial Integration WHMCS, to System Chatvolution:</h5>
                <div class="pl-1">
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <h6 class="text-muted">
                            <b>1.</b> Login WHMCS with url: <a href="#" class="text-url-secondary">Click Me</a>,
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

const hideDocumentation = () => {
    $("#readDocumentation").modal("hide");
    $("#contentDoc").empty();
};

$("#readDocumentation").on("hide.bs.modal", function (e) {
    $("#contentDoc").empty();
});
