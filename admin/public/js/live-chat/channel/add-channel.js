const roleID = localStorage.getItem("permission");
const UserID = localStorage.getItem("UserID");

if (roleID != 1) {
    location.replace("/404");
}

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

var tk = localStorage.getItem("tk");
var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

/* function add */
$(function () {
    $("#btn-save").parsley();
    $("#btn-save").submit(function (e) {
        e.preventDefault();
        var alertMultiple = [];

        $(".page-loader").removeAttr("style");
        settings.url = "/api/chat/channel";
        settings.method = "POST";
        settings.data = JSON.stringify({
            name: $("#name").val(),
            description: $("#description").val(),
        });
        $.ajax(settings)
            .done(function (response) {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Congratulation",
                    text: "Add channel successfuly!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace("/channels");
                });
            })
            .fail(function (response) {
                $(".page-loader").attr("style", "display:none");
                $.each(response.responseJSON.error, function (key, val) {
                    alertMultiple.push({
                        icon: "warning",
                        title: "Warning",
                        text: val[0],
                    });
                });
                swal.queue(alertMultiple);
            });
    });
});
/* off loader */
$(".page-loader").fadeOut(500);
