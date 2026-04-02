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

/* assets switch function */
$("#customSwitch3").prop("checked", false);
var oldSwitch = 0;
var meta = $("#meta").val();
var menu = meta.replace("_", " ");

if (meta == "welcome_message") {
    $("#headerLbl").html("Welcome Message");
    $("#descLbl").html(
        "Welcome your visitors with a custom type message once they open up the messenger on your website."
    );
    $("#descMsg").html("Automatic message, if a visitor gives a message.");
    $("#swipeLbl").html("Swipe To Enable Welcome Message");
} else if (meta == "away_message") {
    $("#headerLbl").html("Away Message");
    $("#descLbl").html(
        "Notify your visitors with a custom type message when you are away."
    );
    $("#descMsg").html("Automatic message, if you are away.");
    $("#swipeLbl").html("Swipe To Enable Away Message");
} else {
    $("#headerLbl").html("Closing Message");
    $("#descLbl").html(
        "Leave a custom type message to your visitors once you have resolved their case."
    );
    $("#descMsg").html("Automatic message, if you resolved their case.");
    $("#swipeLbl").html("Swipe To Enable Closing Message");
}

/* assets header api */
const tk = localStorage.getItem("tk");
const settings = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

/* get detail */
const getDetail = () => {
    settings.url = `${window.base_url_live}/api/chat/agent/messages/default?meta=${meta}`;
    settings.method = "get";
    axios(settings)
        .then((response) => {
            const dataRes = response.data.data;
            if (Boolean(dataRes)) {
                $("#customSwitch3").prop(
                    "checked",
                    dataRes.status == 1 ? dataRes.status : 0
                );
                oldSwitch = dataRes.status == 1 ? dataRes.status : 0;
                $("#message").val(dataRes.value);
                changeSwitch();
            } else {
                $("#customSwitch3").prop("checked", 0);
                oldSwitch = 0;
                $("#message").val(null);
                changeSwitch();
            }
        })
        .catch((err) => {
            console.warn(err);
            $("#customSwitch3").prop("checked", 0);
            oldSwitch = 0;
            $("#message").val(null);
            changeSwitch();
        });
};
getDetail();

/* data-parsley-minlength="2" data-parsley-required */
const changeSwitch = () => {
    if (oldSwitch && !$("#customSwitch3").prop("checked")) {
        $(".btn-save").removeAttr("style");
        $(".btn-save").removeAttr("disabled");
        $("#message").removeAttr("data-parsley-minlength");
        $("#message").removeAttr("data-parsley-required");
        $("#message").removeAttr("data-parsley-required-message");
        $("#message").attr("disabled", true);
        $("#message").attr("style", "cursor:no-drop");
    } else if (
        $("#customSwitch3").prop("checked") &&
        (oldSwitch || !oldSwitch)
    ) {
        $("#message").removeAttr("disabled");
        $("#message").removeAttr("style");
        $(".btn-save").removeAttr("disabled");
        $(".btn-save").removeAttr("style");
        $("#message").attr("data-parsley-minlength", "2");
        $("#message").attr("data-parsley-required", true);
        $("#message").attr(
            "data-parsley-required-message",
            "Message is required!"
        );
    } else {
        $("#message").attr("disabled", true);
        $(".btn-save").attr("disabled", true);
        $(".btn-save").attr("style", "cursor:no-drop");
        $("#message").attr("style", "cursor:no-drop");
        $("#message").removeAttr("data-parsley-minlength");
        $("#message").removeAttr("data-parsley-required");
        $("#message").removeAttr("data-parsley-required-message");
    }
};

$("#btn-save").parsley();
$("#btn-save").submit(function (e) {
    e.preventDefault();
    $(".page-loader").removeAttr("style");
    settings.url = `${window.base_url_live}/api/setting`;
    settings.method = "POST";
    settings.data = {
        meta: meta,
        value: $("#message").val(),
        status: $("#customSwitch3").prop("checked"),
    };

    axios(settings)
        .then((response) => {
            $(".page-loader").attr("style", "display:none");
            oldSwitch = $("#customSwitch3").prop("checked");
            changeSwitch();
            return Toast.fire({
                icon: "success",
                title: "Save " + menu + " successfuly!",
            });
        })
        .catch((err) => {
            //  $(".page-loader").attr("style", "display:none");
            //  !response.responseJSON.error.value ? false : Toast.fire({
            //      icon: "warning",
            //      title: 'Message is required!',
            //  });

            console.warn(err.responseJson);
        });
});
/* off loader */
$(".page-loader").fadeOut(500);
