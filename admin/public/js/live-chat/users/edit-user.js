$("#err_name").hide();
$(".i-send").hide();
$("#err_company").hide();
$("#err_department").hide();

const roleID = localStorage.getItem("permission");
const UserID = localStorage.getItem("UserID");
const menu = $("#title").val();
const label = $("#label").val();
const id = $("#id").val();
var parent_url = "";
var tk = localStorage.getItem("tk");

var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

$("#department").removeAttr("data-parsley-required");
$(".i-department").hide();

$("#menu-label").html(menu);
let menuNameList = "";
if (label == "edit staff") {
    menuNameList = "staff";
} else if (label == "edit agent") {
    menuNameList = "agents";
} else {
    menuNameList = "company";
}
$("#backUrl").attr("href", `${menuNameList}`);
$("#backUrl").append(`
    <i class="ri-arrow-left-line mr-2"></i> Back to ${menuNameList}
`);

$("#department").removeAttr("data-parsley-required");
$(".i-department").hide();
$("#company").removeAttr("data-parsley-required");
$(".i-company").hide();

if(roleID == 1){
    if (label == "edit staff" || label == "edit agent"){
        $("#department").attr("data-parsley-required", true);
        $(".i-department").show();
        getDetail();
    }else{
        redirectError();
    }
}else if (roleID == 2) {
    if (label == "edit staff" || label == "edit agent") {
        let elEmail = document.getElementById("email");
        elEmail.removeAttribute("readonly", false);
        elEmail.removeAttribute("disabled");
        elEmail.removeAttribute("style");

        elEmail.setAttribute("type", "email");
        elEmail.setAttribute("data-parsley-type", "email");
        elEmail.setAttribute("data-parsley-email-message", "Type not same");
        elEmail.setAttribute("data-parsley-required", true);


        $("#department").attr("data-parsley-required", true);
        $(".i-department").show();
        getDepartment();
        getDetail();
        $(".i-access").remove();
        $("#department").attr("data-parsley-required", true);
        $(".i-department").show();

        parent_url = "staff";
    } else if (label == "edit agent") {
        let elEmail = document.getElementById("email");
        elEmail.removeAttribute("readonly", false);
        elEmail.removeAttribute("disabled");
        elEmail.removeAttribute("style");

        elEmail.setAttribute("type", "email");
        elEmail.setAttribute("data-parsley-type", "email");
        elEmail.setAttribute("data-parsley-email-message", "Type not same");
        elEmail.setAttribute("data-parsley-required", true);
        getDepartment();
        getDetail();
        $("#department").attr("data-parsley-required", true);
        $(".i-department").show();

        parent_url = "agent";
    } else {
        redirectError();
    }
} else if (roleID == 3) {
    if (label == "edit agent") {
        getDetail();
        parent_url = "agent";
        $(".i-access").remove();
    } else {
        redirectError();
    }
} else {
    redirectError();
}

const redirectError = () => {
    location.replace(`${window.base_url_live}/404`);
};

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

function getDetail() {
    settings.url = `${window.base_url_live}/api/agent/${id}`;
    settings.method = "GET";
    $.ajax(settings)
        .done(function (response) {
            if (response.data == null) {
                $(".page-loader").attr("style", "display:none");
                return Swal.fire({
                    title: "Oops",
                    text: "Data Not Found, please check your account or contact admin!",
                    icon: "error",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                }).then(function () {
                    redirectToList();
                });
            }

            $(".page-loader").attr("style", "display:none");
            $("#name").val(response.data.name);
            $("#email").val(response.data.email);
            $("#role").val(response.data.id_roles);
            $("#show_hide_password").val(response.data.password);
            $("#account_status").val(response.data.status);
            $("#department").val(response.data.id_department)
            // $("#status").prop("checked", false);
            // if (response.data.status == 1) {
            //     $("#status").prop("checked", true);
            // }
        })
        .fail(function (response) {
            $(".page-loader").attr("style", "display:none");
            Swal.fire({
                title: "Oops",
                text: "Data Not Found, please check your account or contact admin!",
                icon: "error",
                showCancelButton: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            }).then(function () {
                redirectToList();
            });
        });
}

/* selector department*/
var optDepartment = $(".list-department");
optDepartment.append(`
    <option value="" selected disabled>Choose Department</option>
`);

function getDepartment() {
    $(".list-department").empty();

    settings.method = "POST";
    if (roleID == 2) {
        settings.url = `${window.base_url_live}/api/agent/department/list`;
        delete settings.data;
    } else {
        const id_company = $("#company").val();
        settings.url = `${window.base_url_live}/api/agent/company/department/list`;
        settings.data = JSON.stringify({
            id_company,
        });
    }

    axios(settings)
        .then((response) => {
            const dataRes = response.data.data;

            if (dataRes.length < 1) {
                $("#department").append(`
                    <option value="" selected disabled>Choose Department</option>
                `);
                $(".list-department").selectpicker("refresh");
                $("#department").val(null);
                return false;
            }

            dataRes.forEach((valData) => {
                $("#department").append(`
                    <option value="${valData.id}">${valData.name}</option>
                `);
            });

            setTimeout(() => {
                $(".list-department").selectpicker("refresh");
            }, 3000);

            getDetail();
        })
        .catch((err) => {
            console.log(err);
        });
}

// function getCompany() {
//     settings.method = "GET";
//     settings.url = `${window.base_url_live}/api/agent/admin/list/company`;
//     delete settings.data;

//     $.ajax(settings).done(function (response) {
//         optCompany.empty();
//         $(".list-company").selectpicker("refresh");

//         if (response.data.length > 0) {
//             $("#company").append(`
//                 <option value="" selected disabled>Choose Company</option>
//             `);
//             response.data.forEach((el) => {
//                 if (el.status == 1) {
//                     $("#company").append(`
//                         <option value="${el.id}"> ${el.name} </option>
//                     `);
//                 }
//             });
//             $(".list-company").selectpicker("refresh");
//         } else {
//             $("#company").append(`
//                 <option value="" selected disabled>Choose Department</option>
//             `);
//             $(".list-company").selectpicker("refresh");
//             $("#company").val(null);
//         }
//     });
// }

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

function hideSendEmail() {
    if($("#account_status").val() == 1){
        $(".i-send").show();
    }else{
        $(".i-send").hide();
    }
}

/* function add */
$(function () {
    // $('#btn-save').parsley();
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;
            var result = this.validationResult;
            if (["name", "email", "show_hide_password", "role"].includes(elementID)) {
                if (result == true) {
                    $("#err_" + elementID).hide();
                } else {
                    result.forEach((element) => {
                        var condition = element.assert.name;
                        $("#err_" + elementID).show();
                        if (condition == "minlength") {
                            return $("#err_" + elementID).html(
                                element.assert.validator.messages.en +
                                    element.assert.requirements
                            );
                        } else if (condition == "type") {
                            return $("#err_" + elementID).html(
                                "Not valid type email"
                            );
                        } else {
                            return $("#err_" + elementID).html(
                                capitalize(elementID) + " is required"
                            );
                        }
                    });
                }
            }
        });
    $("#btn-save").submit(function (e) {
        e.preventDefault();
        var alertMultiple = [];

        $(".page-loader").removeAttr("style");
        settings.url = `${window.base_url_live}/api/agent`;
        settings.method = "PUT";
        settings.data = {
            id: id,
            name: $("#name").val(),
            email: $("#email").val(),
            password: $("#show_hide_password").val(),
            id_roles: $("#role").val(),
            status: $("#account_status").val(),
            id_department: $("#department").val(),
        };



        if (roleID == 2) {
            settings.data.email = $("#email").val();
            settings.data.id_roles= $("#role").val();
        }

        axios(settings)
            .then((response) => {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Congratulation",
                    text: `Edit ${parent_url} successfully!`,
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    // redirectToList();
                });
            })
            .catch((err) => {
                $(".page-loader").attr("style", "display:none");
                console.error("error save data:", err);
            });
    });
});

const redirectToList = () => {
    location.replace(
        parent_url == "staff"
            ? `${window.base_url_live}/staff`
            : `${window.base_url_live}/agents`
    );
};

// function generate password
function generatePassword() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*";
    let passwordLength = 16;
    let password = "";

    for(let i = 0; i < passwordLength; i++){
        let randomNumber = Math.floor(Math.random()*chars.length);

        password+= chars.substring(randomNumber, randomNumber+ 1);
    }

    document.getElementById('show_hide_password').value = password;
}

// function untuk show password
function showPassword() {
  let password = document.getElementById("show_hide_password");
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

/* off loader */
$(".page-loader").fadeOut(500);
