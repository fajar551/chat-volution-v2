let token = localStorage.getItem("tk");

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

const backProfile = () => {
    location.href = `${window.base_url_live}/profile`;
};

$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;
            if (elementID == "new_password") {
                $(`#err_${elementID}`).show();
                $(`#err_${elementID}`).empty();

                var valPass = this.validationResult;
                if (valPass.length > 0) {
                    $(`#err_${elementID}`).append(`
                        <ul>
                    `);
                    valPass.forEach((el) => {
                        if (!el.assert.validator.messages) {
                            $(`#err_${elementID}`).append(`
                                <li>Password is required!</li>
                            `);
                        } else {
                            $(`#err_${elementID}`).append(`
                                <li>${
                                    el.assert.validator.messages.en +
                                    el.assert.requirements
                                }</li>
                            `);
                        }
                    });
                    $(`#err_${elementID}`).append(`
                        </ul>
                    `);
                } else {
                    $(`#err_${elementID}`).empty();
                }
            }

            if (elementID == "old_password") {
                if (this.validationResult == true) {
                    $(`#err_${elementID}`).hide();
                } else {
                    $(`#err_${elementID}`).show();
                    $(`#err_${elementID}`).html("Old password is required!");
                }
            }

            if (elementID == "c_n_password") {
                let valRes = this.validationResult;
                if (this.validationResult == true) {
                    $(`#err_${elementID}`).hide();
                } else {
                    $(`#err_${elementID}`).show();
                    if (valRes[0].assert.name == "required") {
                        $(`#err_${elementID}`).html(
                            "Confirm new password is required!"
                        );
                    } else {
                        $(`#err_${elementID}`).html(
                            "Confirm new password not same with password!"
                        );
                    }
                }
            }
        });

    $("#btn-save").submit(function (e) {
        e.preventDefault();

        $(
            ".btn-submit"
        ).html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...`);
        $(".btn-submit").attr("disabled", true);
        $(".btn-submit").removeAttr("type");
        $(".btn-submit").addClass("not-allowed");

        const data = {
            old_password: $("#old_password").val(),
            password: $("#new_password").val(),
            confirm_password: $("#c_n_password").val(),
        };

        const config = {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-Requested-With": "xmlhttprequest",
            },
            url: `${window.base_url_live}/api/agent/profile/change-password`,
            data,
        };
        axios(config)
            .then((response) => {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Yuhuu",
                    text: "Change password is success!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace(`${window.base_url_live}/profile`);
                });
            })
            .catch((error) => {
                $(".btn-submit").attr("disabled", false);
                $(".btn-submit").removeClass("not-allowed");
                $(".btn-submit").attr("type", "submit");
                $(".btn-submit").html("Change Password");
                if (!error.response) {
                    console.warn(error);
                } else {
                    let messageError = error.response.data.message;
                    let result = messageError.search("new");
                    if (result < 1) {
                        $("#old_password").addClass("parsley-error");
                        $("#err_old_password").show();
                        $("#err_old_password").html(
                            error.response.data.message
                        );
                    } else {
                        $("#new_password").addClass("parsley-error");
                        $("#err_new_password").show();
                        $("#err_new_password").html(
                            error.response.data.message
                        );
                    }
                }
            });
    });
});

$(".page-loader").fadeOut(500);
