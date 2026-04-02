$("#err_password").hide();
$("#err_confirm_password").hide();

const token = $("#token").val();
const email = $("#email").val();

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

$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            $(".alert").removeClass("alert-warning");
            $(".alert").removeClass("alert-success");
            $(".alert").empty();
            var elementID = this.element.id;
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

        const config = {
            url: `${window.base_url_live}/api/password/reset`,
            method: "POST",
            headers: {
                "X-Requested-With": "xmlhttprequest",
            },
            data: {
                email,
                token,
                password: $("#password").val(),
                password_confirmation: $("#confirm_password").val(),
            },
        };
        axios(config)
            .then(function (response) {
                Swal.fire({
                    title: "Yuhuu",
                    text: "Reset password success, wait redirect to login",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace(`${base_url_live}/login`);
                });
                $(".btn-submit").html("Forgot Password");
                $(".btn-submit").attr("disabled", false);
                $(".btn-submit").removeClass("not-allowed");
                $(".btn-submit").attr("type", "submit");
            })
            .catch(function (error) {
                $(".btn-submit").html("Forgot Password");
                $(".btn-submit").attr("disabled", false);
                $(".btn-submit").removeClass("not-allowed");
                $(".btn-submit").attr("type", "submit");
                $(".alert").addClass("alert-warning");
                $(".alert").html(error.response.data.message);
            });
    });
});
