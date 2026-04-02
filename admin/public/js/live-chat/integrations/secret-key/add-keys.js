$("#err_name").hide();
$("#err_client_id").hide();
$("#err_secret").hide();

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
if (label == "add keys") {
    menuNameList = "keys";
    $("#description-label").html("Add new keys by inputing");
} 

$("#backUrl").attr("href", `${menuNameList}`);
$("#backUrl").append(`
    <i class="ri-arrow-left-line mr-2"></i> Back to ${menuNameList}
`);

var settings = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

const roleID = localStorage.getItem("permission");

var url = `${window.SECRET_URL_API}/api-rest/generate-secret`;
var url_menu = "dashboard";
var menu_name = "dashboard";

/* checked roles access menu */
const redirectError = () => {
    location.replace(`${window.base_url_live}/404`);
};

if (roleID == 1) {
    url = `${window.SECRET_URL_API}/api-rest/generate-secret`;
    if (label == "add keys") {
        menu_name = "keys";
        url_menu = `keys`;
    }  else {
        redirectError();
    }
} else if (roleID == 2) {
    url = `${window.SECRET_URL_API}/api-rest/generate-secret`;
    if (label == "add keys") {
        menu_name = "keys";
        url_menu = `keys`;
    } else {
        redirectError();
    }
} else {
    redirectError();
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
                ["name", "client_id", "secret"].includes(elementID)
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
        arr_data.client_id = $("#client_id").val();
        arr_data.secret = $("#secret").val();

        $(".page-loader").removeAttr("style");
        settings.url = url;
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
                        url_menu == "keys"
                            ? `${window.base_url_live}/keys`
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

/* off loader */
$(".page-loader").fadeOut(500);
