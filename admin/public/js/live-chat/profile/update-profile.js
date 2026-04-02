let token = localStorage.getItem("tk");

const getProfile = () => {
    const config = {
        method: "get",
        url: `${base_url_live}/api/agent/profile/show`,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
    };

    axios(config)
        .then((response) => {
            const dataRes = response.data.data;
            $(".dt-department_name").html(
                !dataRes.department_name ? "-" : dataRes.department_name
            );
            $(".dt-company_name").html(
                !dataRes.company_name ? "-" : dataRes.company_name
            );
            $(".dt-uuid").html(!dataRes.uuid ? "-" : dataRes.uuid);
            $(".dt-permission_name").html(
                !dataRes.permission_name ? "-" : dataRes.permission_name
            );
            $(".dt-email").html(!dataRes.email ? "-" : dataRes.email);
            $("#name").val(!dataRes.name ? "" : dataRes.name);
            $("#phone").val(!dataRes.phone ? "" : dataRes.phone);
        })
        .catch((err) => {
            console.warn(err);
        });
};

getProfile();

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

/* save */
$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            let elementID = this.element.id;
            let valRes = this.validationResult;

            if (elementID == "name") {
                if (this.validationResult == true) {
                    $("#err_name").hide();
                } else {
                    $("#err_name").show();
                    if (valRes[0].assert.name == "minlength") {
                        $("#err_name").html(
                            `min length ${valRes[0].assert.priority}`
                        );
                    } else {
                        $("#err_name").html("Name is required!");
                    }
                }
            }

            if (elementID == "phone") {
                if (this.validationResult == true) {
                    $("#err_phone").hide();
                } else {
                    $("#err_phone").show();
                    $("#err_phone").html("Phone number is required!");
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
        let data = new FormData();

        data.append("name", $("#name").val());
        data.append("email", $("#email").val());
        data.append("phone", phone_number);

        const config = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
                "X-Requested-With": "xmlhttprequest",
            },
            mimeType: "multipart/form-data",
            url: `${window.base_url_live}/api/agent/profile/update`,
            data,
        };

        axios(config)
            .then((response) => {
                const dataRes = response.data.data;
                localStorage.setItem("email", dataRes.email);
                localStorage.setItem("name", dataRes.name);
                localStorage.setItem("id_company", dataRes.id_company);
                localStorage.setItem("avatar", dataRes.avatar);
                localStorage.setItem("phone", dataRes.phone);
                localStorage.setItem("uuid", dataRes.uuid);
                Swal.fire({
                    title: "Yuhuu",
                    text: "Update profile is success!",
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
                console.warn(error);
                $(".btn-submit").attr("disabled", false);
                $(".btn-submit").removeClass("not-allowed");
                $(".btn-submit").attr("type", "submit");
                $(".btn-submit").html(`Save`);
            });
    });
});

const backProfile = () => {
    location.href = `${window.base_url_live}/profile`;
};

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

$(".page-loader").fadeOut(500);
