$(".comp-field").hide();
$("#err_name").hide();
$("#err_email").hide();
$("#err_phone").hide();
$("#err_company_name").hide();
$("#err_password").hide();
$("#err_confirm_password").hide();

const id_roles = $("#id_roles").val();
if (id_roles != 2) {
    $(".comp-field").empty();
} else {
    $(".comp-field").show();
}

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

const token_verification = $("#token").val();
const email = $("#email").val();
const name = $("#name").val();
const message = $("#message").val();
const id = $("#id").val();
const code = $("#code").val();

$(".desc").html(message);
$(".desc").addClass("text-tangerin");

/* ajax */
var settings = {
    url: `${base_url_live}/api/agent/verification?token=${token_verification}`,
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
};

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

/* function confirm */
$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;

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
                            $("#err_password").append(`
                            <li>Password Is Required!</li>
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
        $(
            ".btn-submit"
        ).html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...`);
        $(".btn-submit").attr("disabled", true);
        $(".btn-submit").removeAttr("type");
        $(".btn-submit").addClass("not-allowed");
        var arr_data = {};
        arr_data.confirm_password = $("#confirm_password").val();
        // arr_data.phone = $("#phone").val();
        arr_data.phone = phone_number;
        arr_data.password = $("#password").val();
        arr_data.status = 1;
        if (id_roles != 2) {
            arr_data.company_name = $("#company_name").val();
        }
        settings.data = JSON.stringify(arr_data);
        $.ajax(settings)
            .done(function (response) {
                localStorage.setItem("status_response", response.status);
                localStorage.setItem("code", response.code);
                localStorage.setItem("data", JSON.stringify(response.data));
                localStorage.setItem("message", response.message);
                localStorage.setItem("menu", "complete-verify");
                location.replace("/redirect");
            })
            .fail(function (response) {
                $(".btn-submit").html(`Complete & Continue`);
                $(".btn-submit").attr("disabled", false);
                $(".btn-submit").removeClass("not-allowed");
                $(".btn-submit").attr("type", "submit");
                $.each(response.responseJSON.message, function (key, val) {
                    $("#" + key).addClass("parsley-error");
                    $("#err_" + key).html(val);
                    $("#err_" + key).show();
                });
            });
    });
});

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
setInputFilter(document.getElementById("phone"), function (value) {
    return /^-?\d*$/.test(value);
});
/* off loader */
$(".page-loader").fadeOut(500);

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
