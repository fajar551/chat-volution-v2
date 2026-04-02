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

const hideAll = () => {
    $("#send-again").hide();
    $("#waiting-text").hide();
    $("#processing-loader").hide();
    $("#countdown").hide();
};

/* ajax */
var settings = {
    url: `${window.base_url_live}/api/agent/verification/resend`,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
};
var userReg = !localStorage.getItem("userReg")
    ? null
    : JSON.parse(localStorage.getItem("userReg"));

var email = userReg.email;
$(".lbl-email").html("(" + email + ")");
/* countdown settup */
hideAll();

var timeLeft = 60;
var elCountdown = document.getElementById("countdown");
var timerId = setInterval(countdown, 1000);

function countdown() {
    $("#countdown").show();
    $("#waiting-text").show();

    if (timeLeft == -1) {
        hideAll();
        showButtonAgain();
        clearTimeout(timerId);
    } else {
        elCountdown.innerHTML = timeLeft + " Second";
        timeLeft--;
    }
}

function showButtonAgain() {
    $("#send-again").show();
}

$("#send-again").click(function () {
    hideAll();
    $("#processing-loader").show();
    settings.data = JSON.stringify({
        email,
    });

    $.ajax(settings)
        .done(function (response) {
            hideAll();
            timeLeft = 60;
            setInterval(countdown, 1000);
            return Toast.fire({
                icon: "success",
                title: response.message,
                timer: 5000,
            });
        })
        .fail(function (response) {
            hideAll();
            localStorage.clear();
            if (response.responseJSON.data.verification_status == "warning") {
                Swal.fire({
                    title: response.responseJSON.data.verification_status,
                    text: response.responseJSON.message,
                    icon: "warning",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 5000,
                    timerProgressBar: true,
                }).then(function () {
                    redirectLogin();
                });
            } else {
                Swal.fire({
                    title: response.responseJSON.data.verification_status,
                    text: response.responseJSON.message,
                    icon: "error",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 5000,
                    timerProgressBar: true,
                }).then(function () {
                    redirectLogin();
                });
            }
        });
});

const redirectLogin = () => {
    location.replace(`${base_url_live}/login`);
};
/* off loader */
$(".page-loader").fadeOut(500);
