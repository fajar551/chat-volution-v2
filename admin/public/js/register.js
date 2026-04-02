$("#err_email").hide();
$("#err_name").hide();
$("#err_phone").hide();
$("#err_company_name").hide();
$("#err_confirm_password").hide();
$("#err_password").hide();
$("#err_captcha").hide();

const rsk = $("#rsk").val();
const rseck = $("#rseck").val();
window.g_response = null;

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

const showHidePassword = (event) => {
    let fieldName = event.dataset.fieldname;
    let isShow = event.dataset.show == "true" ? true : false;

    let elField = document.getElementById(fieldName);
    let elFieldShowEye = document.querySelector(`.is-show-${fieldName}`);
    let elBtn = document.querySelector(`.btn-is-show-${fieldName}`);

    if (!elField) {
        return Toast.fire({
            icon: "error",
            title: "Field Not Found!",
        });
    }

    if (!elFieldShowEye) {
        return Toast.fire({
            icon: "error",
            title: "Field Not Found!",
        });
    }

    if (!elBtn) {
        return Toast.fire({
            icon: "error",
            title: "Field Not Found!",
        });
    }

    if (isShow) {
        elField.removeAttribute("type");
        elField.setAttribute("type", "password");
        elBtn.removeAttribute("data-show");
        elBtn.setAttribute("data-show", "false");
        elBtn.innerHTML = "";
        elBtn.innerHTML = `
            <i class="fas fa-eye-slash is-show-${fieldName}"></i>
        `;
    } else {
        elField.removeAttribute("type");
        elField.setAttribute("type", "text");
        elBtn.removeAttribute("data-show");
        elBtn.setAttribute("data-show", "true");
        elBtn.innerHTML = "";
        elBtn.innerHTML = `
            <i class="fas fa-eye is-show-${fieldName}"></i>
        `;
    }
};

// recaptcha google
var onloadCallback = function () {
    grecaptcha.render("reCAPTCHA", {
        sitekey: rsk,
        callback: verifyCallback,
    });
};

// set token to window
function verifyCallback(res) {
    window.g_response = res;
    $("#btn").prop("disabled", false);
}

/* input type customize */
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
// setInputFilter(document.getElementById("phone"), function (value) {
//     return /^-?\d*$/.test(value);
// });

/* ajax */
var settings = {
    url: `${window.base_url_live}/api/register`,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
};

//has uppercase
window.Parsley.addValidator("uppercase", {
    requirementType: "integer",
    validateString: function (value, requirement) {
        var uppercases = value.match(/[A-Z]/g) || [];
        return uppercases.length >= requirement;
    },
    messages: {
        en: "Your password must contain uppercase letter minimal: ",
        id: "Password harus disertakan huruf besar minimal: ",
    },
});

//has lowercase
window.Parsley.addValidator("lowercase", {
    requirementType: "integer",
    validateString: function (value, requirement) {
        var lowecases = value.match(/[a-z]/g) || [];
        return lowecases.length >= requirement;
    },
    messages: {
        en: "Your password must contain lowercase letter minimal: ",
        id: "Password harus disertakan huruf kecil minimal: ",
    },
});

//has number
window.Parsley.addValidator("number", {
    requirementType: "integer",
    validateString: function (value, requirement) {
        var numbers = value.match(/[0-9]/g) || [];
        return numbers.length >= requirement;
    },
    messages: {
        en: "Your password must contain number, minimal: ",
        id: "Password harus disertakan karakter angka dengan panjang minimal: ",
    },
});

//has special char
window.Parsley.addValidator("special", {
    requirementType: "integer",
    validateString: function (value, requirement) {
        var specials = value.match(/[!@#$%^&*]/g) || [];
        return specials.length >= requirement;
    },
    messages: {
        en: "Your password must contain special characters, minimal: ",
        id: "Password harus disertakan spesial karakter minimal: ",
    },
});

/* custom message minlength */
window.Parsley.addValidator("minlength", {
    requirementType: "integer",
    validateString: function (value, requirement) {
        return value.length >= requirement;
    },
    messages: {
        en: "minimal length: ",
        id: "panjang minimal: ",
    },
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

/* function add */
$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;
            if (elementID == "name") {
                if (this.validationResult == true) {
                    $("#err_name").hide();
                } else {
                    $("#err_name").show();
                }
            }

            if (elementID == "email") {
                if (this.validationResult == true) {
                    $("#err_email").hide();
                } else {
                    $("#err_email").show();
                }
            }

            if (elementID == "phone") {
                if (this.validationResult == true) {
                    $("#err_phone").hide();
                } else {
                    $("#err_phone").show();
                }
            }

            if (elementID == "company_name") {
                if (this.validationResult == true) {
                    $("#err_company_name").hide();
                } else {
                    $("#err_company_name").show();
                }
            }

            if (elementID == "password") {
                $("#err_password").show();
                $("#err_password").empty();

                var valPass = this.validationResult;
                if (valPass.length > 0) {
                    $("#err_password").append(`
                    <ul>
                `);
                    valPass.forEach((el) => {
                        if (!el.assert.validator.messages) {
                            // $('#err_password').append(`
                            //     <li>Kata sandi wajib diisi!</li>
                            // `)
                            $("#err_password").append(`
                            <li>Password is required!</li>
                        `);
                        } else {
                            $("#err_password").append(`
                            <li>${
                                el.assert.validator.messages.en +
                                el.assert.requirements
                            }</li>
                        `);
                        }
                    });
                    $("#err_password").append(`
                    </ul>
                `);
                } else {
                    $("#err_password").empty();
                }
            }

            if (elementID == "confirm_password") {
                if (this.validationResult == true) {
                    $("#err_confirm_password").hide();
                } else {
                    $("#err_confirm_password").show();
                }
            }
        });

    $("#btn-save").submit(function (e) {
        e.preventDefault();
        let phone_number = iti.getNumber();
        let isValid = iti.isValidNumber();
        if (!isValid) {
            $("#err_phone").empty();
            $("#err_phone").append("Format phone number not supported!");
            $("#err_phone").show();
            return false;
        }

        $("#err_captcha").hide();
        $(
            ".btn-submit"
        ).html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...`);
        $(".btn-submit").attr("disabled", true);
        $(".btn-submit").removeAttr("type");
        $(".btn-submit").addClass("not-allowed");
        if (
            g_response == "" ||
            g_response == false ||
            g_response == null ||
            g_response == undefined
        ) {
            $("#err_captcha").show();
            $(".btn-submit").html(`Join <i class="fas fa-sign-in-alt"></i>`);
            $(".btn-submit").attr("disabled", false);
            $(".btn-submit").attr("type", "submit");
            $(".btn-submit").removeClass("not-allowed");
        } else {
            settings.data = JSON.stringify({
                name: $("#name").val(),
                email: $("#email").val(),
                password: $("#password").val(),
                confirm_password: $("#confirm_password").val(),
                // phone: $("#phone").val(),
                phone: phone_number,
                company_name: $("#company_name").val(),
                captcha: g_response,
            });

            $.ajax(settings)
                .done(function (response) {
                    localStorage.setItem(
                        "userReg",
                        JSON.stringify(response.data)
                    );
                    grecaptcha.reset();
                    g_response = null;
                    Swal.fire({
                        title: "Yuhuu",
                        text: "Register success, wait we send your email verification",
                        icon: "success",
                        showCancelButton: false,
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    }).then(function () {
                        location.replace(`${base_url_live}/verify/register`);
                    });
                })
                .fail(function (response) {
                    grecaptcha.reset();
                    g_response = null;
                    $(".btn-submit").html(
                        `Gabung <i class="fas fa-sign-in-alt"></i>`
                    );
                    $(".btn-submit").attr("disabled", false);
                    $(".btn-submit").removeClass("not-allowed");
                    $(".btn-submit").attr("type", "submit");
                    $.each(response.responseJSON.message, function (key, val) {
                        $("#" + key).addClass("parsley-error");
                        $("#err_" + key).html(val);
                        $("#err_" + key).show();
                    });
                });
        }
    });
});
