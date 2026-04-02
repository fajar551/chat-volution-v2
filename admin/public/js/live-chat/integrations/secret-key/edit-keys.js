const roleID = localStorage.getItem("permission");
const UserID = localStorage.getItem("UserID");
const menu = $("#title").val();
const label = $("#label").val();
const id = $("#id").val();
var tk = localStorage.getItem("tk");
var parent_url = "";

const settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

$("#menu-label").html(menu);
let menuNameList = "";
if (label == "edit keys") {
    menuNameList = "keys";
}
$("#backUrl").attr("href", `/keys`);
$("#backUrl").append(`
    <i class="ri-arrow-left-line mr-2"></i> Back to ${menuNameList}
`);

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

const getDetail = () => {
    settings.url = `${window.base_url_live}/api/agent/key/${id}`;
    settings.method = "GET";
    axios(settings)
        .then(function (response) {
            const dataRes = response.data;
            $("#id").val(dataRes.data.id)
            $("#name").val(dataRes.data.name);
            $("#client_id").val(dataRes.data.client_id);
            $("#secret").val(dataRes.data.secret);
            console.log("response", dataRes.data.name);
        })
        .catch(function (error) {
            console.warn(error);
        });

};
getDetail();


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
    $("#btn-save").submit(function (e) {
        e.preventDefault();
        var alertMultiple = [];

        $(".page-loader").removeAttr("style");
        settings.url = `${window.base_url_live}/api/agent/key/${id}`;
        settings.method = "PUT";
        settings.data = {
            id: id,
            name: $("#name").val(),
            client_id: $("#client_id").val(),
            secret: $("#secret").val(),
            full_access: !$("#access").val() ? 0 : $("#access").val(),
        };

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
                    redirectToList();
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
        parent_url == "keys"
            ? `${window.base_url_live}/keys`
            : `${window.base_url_live}/keys`
    );
};

/* off loader */
$(".page-loader").fadeOut(500);
