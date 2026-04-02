var tk = localStorage.getItem("tk");
var settings = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

$(function () {
    $("#btn-save").parsley();
    $("#btn-save").submit(function (e) {
        var alertMultiple = [];
        e.preventDefault();

        $(".page-loader").removeAttr("style");
        settings.url = `${window.base_url_live}/api/faq`;
        settings.data = JSON.stringify({
            question: $("#question").val(),
            answer: $("#answer").val(),
        });
        $.ajax(settings)
            .done(function (response) {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Congratulation",
                    text: "Add label successfuly!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace(`${base_url_live}/faq`);
                });
            })
            .fail(function (response) {
                $(".page-loader").attr("style", "display:none");
                $.each(response.responseJSON.error, function (key, val) {
                    alertMultiple.push({
                        icon: "warning",
                        title: "Warning",
                        text: val,
                    });
                });
                swal.queue(alertMultiple);
            });
    });
});

/* off loader */
$(".page-loader").fadeOut(500);
