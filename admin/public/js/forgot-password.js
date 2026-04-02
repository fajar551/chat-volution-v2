let emailUser = "";

const firstForm = () => {
    $(".form-forgot").hide();
    $("#err_email").hide();
};

const notifyEmail = () => {
    $(".notify-email").empty();
    $(".notify-email").hide();
    $(".specialBottomForm").empty();
    $(".specialBottomForm").hide();
};

const hideNotifyChildren = () => {
    $("#send-again").hide();
    $("#waiting-text").hide();
    $("#processing-loader").hide();
    $("#countdown").hide();
};

const renderPageForgot = () => {
    $(".form-input-forgot").append(`
        <div class="form-group mb-4">
            <i class="fas fa-envelope auti-custom-input-icon"></i>
            <label for="input_email">Email</label>
            <input type="email" data-parsley-required class="form-control" id="input_email" placeholder="Type Your Email">
            <span class="text-danger" id="err_email"></span>
        </div>
        <div class="mt-4 text-center">
            <button type="submit" class="btn btn-tangerin btn-block w-md waves-effect waves-light btn-submit">
                Forgot Password
            </button>
        </div>
    `);
    $(".form-forgot").show();
    $(".form-input-forgot").show();
};

const specialBottomForm = (type = false) => {
    if (!type) {
        $(".specialBottomForm").append(`
            <p>
                did you remember the password?
                <a href="${base_url_live}/login" class="font-weight-medium text-tangerin">
                    Come on login</a>
            </p>
        `);
    }
    $(".specialBottomForm").show();
};

const renderNotifyEmail = async () => {
    firstForm();
    notifyEmail();
    hideNotifyChildren();

    $(".form-input-forgot").empty();
    $(".form-input-forgot").hide();

    $(".notify-email").addClass("mt-5");
    await $(".notify-email").append(`
        <img class="w-35 img-fluid" src="${
            window.base_url_live
        }/assets/images/illustration/il-mailsent-tangerin-soft.svg" alt="Qchat Social Management">
        <p class="mt-2 font-size-15">
            We have sent a url forgot a password to email
            <b class="font-size-17 lbl-email">${
                !emailUser ? "example@qwords.co.id" : emailUser
            }</b>,
            <b class="font-size-17">Please check</b> and <b class="font-size-17">add new password</b>
            or <a href="#" onclick="backToFormForgot()" class="text-url-secondary">try another email address</a>.
        </p>
    `);

    hideNotifyChildren();
    $(".notify-email").show();
};

const backToFormForgot = () => {
    notifyEmail();
    firstForm();
    renderPageForgot();
    specialBottomForm();
    emailUser = "";
};
backToFormForgot();

sendEmail = () => {
    const config = {
        url: `${window.base_url_live}/api/password/forgot-password`,
        method: "POST",
        headers: {
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            email: emailUser,
        },
    };
    axios(config)
        .then(function (response) {
            $(".alert").addClass("alert-success");
            $(".alert").html("Sending your email...");

            renderNotifyEmail();

            $(".btn-submit").html("Forgot Password");
            $(".btn-submit").attr("disabled", false);
            $(".btn-submit").removeClass("not-allowed");
            $(".btn-submit").attr("type", "submit");
            $(".alert").removeClass("alert-warning");
            $(".alert").removeClass("alert-success");
            $(".alert").empty();

            $("#input_email").val(null);
        })
        .catch(function (error) {
            $(".alert").addClass("alert-warning");
            $(".btn-submit").html("Forgot Password");
            $(".btn-submit").attr("disabled", false);
            $(".btn-submit").removeClass("not-allowed");
            $(".btn-submit").attr("type", "submit");
            $("#input_email").val(null);
            $(".alert").html(error.response.data.message);
        });
};

$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            $(".alert").removeClass("alert-warning");
            $(".alert").removeClass("alert-success");
            $(".alert").empty();

            var elementID = this.element.id;
            if (elementID == "input_email") {
                if (this.validationResult == true) {
                    $("#err_email").hide();
                    $("#err_email").html();
                } else {
                    $("#err_email").show();
                    $("#err_email").html("Email is required!");
                }
            }
        });
    $("#btn-save").submit(function (e) {
        e.preventDefault();
        $(".alert").removeClass("alert-warning");
        $(".alert").removeClass("alert-success");
        $(".alert").empty();

        $(
            ".btn-submit"
        ).html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...`);
        $(".btn-submit").attr("disabled", true);
        $(".btn-submit").removeAttr("type");
        $(".btn-submit").addClass("not-allowed");

        emailUser = $("#input_email").val();
        sendEmail();
    });
});
