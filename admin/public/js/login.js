$("#err_password").hide();
$("#err_email").hide();

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

$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
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

            if (elementID == "password") {
                if (this.validationResult == true) {
                    $("#err_password").hide();
                    $("#err_password").html();
                } else {
                    $("#err_password").show();
                    $("#err_password").html("Password is required!");
                }
            }
        });
    $("#btn-save").submit(function (e) {
        e.preventDefault();
        $(".alert").removeClass("alert-warning");
        $(".alert").removeClass("alert-success");
        $(".alert").empty();

        $("#err_captcha").hide();
        $(
            ".btn-submit"
        ).html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...`);
        $(".btn-submit").attr("disabled", true);
        $(".btn-submit").removeAttr("type");
        $(".btn-submit").addClass("not-allowed");
        const email = $("#input_email").val();
        const password = $("#password").val();
        const config = {
            headers: {
                "X-Requested-With": "xmlhttprequest",
            },
        };
        axios
            .post(
                `${base_url_live}/api/login`,
                {
                    email,
                    password,
                },
                config
            )
            .then(function (response) {
                $(".alert").addClass("alert-success");
                $(".alert").html("Login success");
                const token = response.data.data.token;
                const id = response.data.data.id;
                const uuid = response.data.data.uuid;
                const name = response.data.data.name;
                const email = response.data.data.email;
                const phone = response.data.data.phone;
                const permission = response.data.data.permission;
                const permission_name = response.data.data.roles_name;
                const id_company = response.data.data.id_company;
                const company_name = response.data.data.company_name;
                const id_department = response.data.data.id_department;
                const department_name = response.data.data.department_name;
                const avatar = response.data.data.avatar;
                const company_uuid = response.data.data.company_uuid;
                const live_chat_menu = !response.data.data.live_chat
                    ? false
                    : JSON.stringify(response.data.data.live_chat);
                const crm_menu = !response.data.data.crm
                    ? false
                    : JSON.stringify(response.data.data.crm);
                const social_menu = !response.data.data.social_pilot
                    ? false
                    : JSON.stringify(response.data.data.social_pilot);
                setTimeout(() => {
                    if (Boolean(token)) {
                        let url = `${window.base_url_live}/home`;
                        $(".alert").html("Redirect to home...");

                        localStorage.setItem("UserID", id);
                        localStorage.setItem("tk", token);
                        localStorage.setItem("uuid", uuid);
                        localStorage.setItem("name", name);
                        localStorage.setItem("email", email);
                        localStorage.setItem("phone", phone);
                        localStorage.setItem("permission", permission);
                        localStorage.setItem("company_uuid", company_uuid);
                        localStorage.setItem(
                            "permission_name",
                            permission_name
                        );
                        localStorage.setItem("id_company", id_company);
                        localStorage.setItem("company_name", company_name);
                        localStorage.setItem("id_department", id_department);
                        localStorage.setItem(
                            "department_name",
                            department_name
                        );
                        localStorage.setItem("avatar", avatar);
                        localStorage.setItem("live_chat_menu", live_chat_menu);
                        localStorage.setItem("crm_menu", crm_menu);
                        localStorage.setItem("social_menu", social_menu);

                        location.replace(url);
                    }
                }, 3000);
            })
            .catch(function (error) {
                $(".alert").addClass("alert-warning");
                $(".btn-submit").html(
                    `Masuk <i class="fas fa-sign-in-alt"></i>`
                );
                $(".btn-submit").attr("disabled", false);
                $(".btn-submit").removeClass("not-allowed");
                $(".btn-submit").attr("type", "submit");
                $(".alert").html(error.response.data.message);
            });
    });
});
