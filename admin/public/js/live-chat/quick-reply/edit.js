var type = $("#type").val();

$("#url-back").attr(
    "href",
    type == 1
        ? `${base_url_live}/general-quick-replies`
        : `${base_url_live}/personal-quick-replies`
);

$("#text-back").html(
    type == 1
        ? "Back To General Quick Replies"
        : "Back To Personal Quick Replies"
);

$("#headLable").html(
    type == 1 ? "Edit General Quick Reply" : "Edit Personal Quick Reply"
);

$("#txtLable").html(
    type == 1
        ? "Changes general quick reply by inputting."
        : "Changes personal quick reply by inputting."
);

var id = $("#id").val();
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
        settings.url = `${window.base_url_live}/api/quick/reply`;
        settings.method = "PUT";
        settings.data = {
            id: id,
            message: $("#message").val(),
            shortcut: $("#shortcut").val(),
        };

        axios(settings)
            .then((response) => {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Congratulation",
                    text:
                        type == 1
                            ? "Edit general quick reply successfuly!"
                            : "Edit personal quick reply successfuly!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace(
                        type == 1
                            ? `${base_url_live}/general-quick-replies`
                            : `${base_url_live}/personal-quick-replies`
                    );
                });
            })
            .catch((error) => {
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

/* get detail */
function getDetail() {
    settings.url = `${window.base_url_live}/api/quick/reply/${id}`;
    settings.method = "GET";

    axios(settings)
        .then((response) => {
            $("#message").val(response.data.data.message);
            $("#shortcut").val(response.data.data.shortcut);
        })
        .catch((error) => {
            console.warn(error);
        });
}
getDetail();

/* validation input */
function setInputFilter(textbox, inputFilter) {
    [
        "input",
        "keydown",
        "keyup",
        "mousedown",
        "mouseup",
        "select",
        "contextmenu",
        "drop",
    ].forEach(function (event) {
        if (textbox != null) {
            textbox.addEventListener(event, function () {
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(
                        this.oldSelectionStart,
                        this.oldSelectionEnd
                    );
                } else {
                    this.value = "";
                }
            });
        }
    });
}

setInputFilter(document.getElementById("shortcut"), function (value) {
    return /^[a-zA-z_-\d]*$/i.test(value);
});
/* off loader */
$(".page-loader").fadeOut(500);
