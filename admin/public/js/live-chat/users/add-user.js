$("#err_email").hide();
$("#err_name").hide();
$("#err_company").hide();
$("#err_department").hide();
$(".i-send").hide();

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

var tk = localStorage.getItem("tk");
const menu = $("#title").val();
const label = $("#label").val();

$("#menu-label").html(menu);
let menuNameList = "";
if (label == "add staff") {
    menuNameList = "staff";
    $("#description-label").html("Add new staff by inputing");
} else if (label == "add agent") {
    menuNameList = "agents";
    $("#description-label").html("Add new agent by inputing");
} else {
    menuNameList = "company";
    $("#description-label").html("Add new company by inputing");
}

$("#backUrl").attr("href", `${menuNameList}`);
$("#backUrl").append(`
    <i class="ri-arrow-left-line mr-2"></i> Back to ${menuNameList}
`);

const settings = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

const roleID = localStorage.getItem("permission");
const UserID = localStorage.getItem("UserID");

var company = null;
var department = null;
var url = `${window.base_url_live}/api`;
var id_role_created = 4;
var url_menu = "dashboard";
var menu_name = "dashboard";

$("#department").removeAttr("data-parsley-required");
$(".i-department").hide();
$("#company").removeAttr("data-parsley-required");
$(".i-company").hide();

/* checked roles access menu */
if (roleID == 1) {
    url = `${window.base_url_live}/api/agent/admin`;
    if (label == "add staff") {
        id_role_created = 3;
        menu_name = "staff";
        url_menu = `staff`;
        getCompany();
        $("#company").attr("data-parsley-required", true);
        $(".i-company").show();
        $("#department").attr("data-parsley-required", true);
        $(".i-department").show();
        $(".i-access").remove();
    } else if (label == "add agent") {
        getCompany();
        $("#company").attr("data-parsley-required", true);
        $(".i-company").show();
        $("#department").attr("data-parsley-required", true);
        $(".i-department").show();
        id_role_created = 4;
        menu_name = "agent";
        url_menu = `agent`;
        $(".i-access").remove();
    } else if (label == "add company") {
        id_role_created = 2;
        menu_name = "company";
        url_menu = "company";
        $(".i-department").remove();
        $(".i-company").remove();
        $(".i-access").remove();
    } else {
        redirectError();
    }
} else if (roleID == 2) {
    url = `${window.base_url_live}/api/agent`;
    company = UserID;
    if (label == "add staff") {
        getDepartment();
        id_role_created = 3;
        menu_name = "staff";
        url_menu = `staff`;
        $("#department").attr("data-parsley-required", true);
        $(".i-department").show();
        $(".i-access").remove();
    } else if (label == "add agent") {
        getDepartment();
        url_menu = `agent`;
        menu_name = "agent";
        id_role_created = 4;
        $("#department").attr("data-parsley-required", true);
        $(".i-department").show();
        $("#access").attr("data-parsley-required", true);
    } else {
        redirectError();
    }
} else if (roleID == 3) {
    url = `${window.base_url_live}/api/agent`;
    if (label == "add agent") {
        menu_name = "agent";
        id_role_created = 4;
        url_menu = `agent`;
        $(".i-access").remove();
        getDetailStaff();
    } else {
        redirectError();
    }
} else {
    redirectError();
}

function hideSendEmail() {
    if($("#account_status").val() == 1){
        $(".i-send").show();
    }else{
        $(".i-send").hide();
    }
}


const redirectError = () => {
    location.replace(`${window.base_url_live}/404`);
};

/* selector company */
var optCompany = $(".list-company");
optCompany.append(`
    <option value="" selected disabled>Choose Company</option>
`);

function getCompany() {
    settings.method = "GET";
    settings.url = `${window.base_url_live}/api/agent/admin/list/company`;
    delete settings.data;

    $.ajax(settings).done(function (response) {
        optCompany.empty();
        $(".list-company").selectpicker("refresh");

        if (response.data.length > 0) {
            $("#company").append(`
                <option value="" selected disabled>Choose Company</option>
            `);
            response.data.forEach((el) => {
                if (el.status == 1) {
                    $("#company").append(`
                        <option value="${el.id}"> ${el.name} </option>
                    `);
                }
            });
            $(".list-company").selectpicker("refresh");
        } else {
            $("#company").append(`
                <option value="" selected disabled>Choose Department</option>
            `);
            $(".list-company").selectpicker("refresh");
            $("#company").val(null);
        }
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

            $("#department").val(null);
        })
        .catch((err) => {
            console.log(err);
        });
}

function getDetailStaff() {
    settings.method = "GET";
    settings.url = `${window.base_url_live}/api/agent/${UserID}`;
    delete settings.data;
    $.ajax(settings).done(function (response) {
        company = response.data.id_company;
        department = response.data.id_department;
    });
}

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

/* function add */
$(function () {
    // $('#btn-save').parsley();
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;
            var result = this.validationResult;
            if (
                ["name", "email", "show_hide_password", "company", "department", "account_status", "access",  "send_email"].includes(elementID)
            ) {
                if (result == true) {
                    $("#err_" + elementID).hide();
                } else {
                    result.forEach((element) => {
                        var condition = element.assert.name;
                        $("#err_" + elementID).show();
                        if (condition == "minlength") {
                            $("#err_" + elementID).html(
                                element.assert.validator.messages.en +
                                    element.assert.requirements
                            );
                        } else if (condition == "type") {
                            $("#err_" + elementID).html("Not valid type email");
                        } else {
                            $("#err_" + elementID).html(
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

        var arr_data = {};

        arr_data.name = $("#name").val();
        arr_data.email = $("#email").val();
        arr_data.password = $("#show_hide_password").val();
        arr_data.status = $("#account_status").val();
        arr_data.send_email = $("#send_email").val();
        arr_data.id_roles = id_role_created;
        arr_data.level = 1;

        if (menu_name == "agent" || menu_name == "staff") {
            if (roleID == 1) {
                arr_data.id_department = $("#department").val();
                arr_data.id_company = $("#company").val();
            } else {
                arr_data.id_department = $("#department").val();
                arr_data.id_company = company;

                if (roleID == 2) {
                    arr_data.full_access = !$("#access").val()
                        ? 0
                        : $("#access").val();
                }
            }
        }

        $(".page-loader").removeAttr("style");
        settings.url = `${window.base_url_live}/api/agent`;
        settings.method = "POST";
        settings.data = JSON.stringify(arr_data);
        $.ajax(settings)
            .done(function (response) {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Congratulation",
                    text: "Add " + url_menu + " successfuly!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace(
                        url_menu == "agent"
                            ? `${window.base_url_live}/agents`
                            : `${window.base_url_live}/` + url_menu
                    );
                });
            })
            .fail(function (response) {
                $(".page-loader").attr("style", "display:none");
                $.each(response.responseJSON.message, function (key, val) {
                    $("#" + key).addClass("parsley-error");
                    $("#err_" + key).html(val);
                    $("#err_" + key).show();
                });
            });
    });
});

/* select picker assets call library */
$(document).ready(function () {
    $(".selectpicker-search").selectpicker({
        liveSearch: true,
        liveSearchPlaceholder: "Search...",
    });

    $(".selectpicker").selectpicker({
        liveSearch: false,
    });
});

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
