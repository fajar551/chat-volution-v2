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

var type = $("#type").val();
$("#headLable").html(
    type == 1 ? "General Quick Replies" : "Personal Quick Replies"
);

/* button url */
var btnAdd = document.getElementById("redirectPage");
btnAdd.href =
    type == 1
        ? `${base_url_live}/add-general-quick-replies`
        : `${base_url_live}/add-personal-quick-replies`;
var btnEdit =
    type == 1
        ? `${base_url_live}/edit-general-quick-replies`
        : `${base_url_live}/edit-personal-quick-replies`;

var tk = localStorage.getItem("tk");
var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

var limitText = 100;
settings.url = `${window.base_url_live}/api/quick/reply/list`;
settings.method = "POST";
settings.data = function (d) {
    d.type = type;
    return JSON.stringify(d);
};

var dataTable = $("#example").DataTable({
    ajax: settings,
    columns: [
        {
            data: null,
            mRender: function (data) {
                var message =
                    data.message.length > limitText
                        ? data.message.slice(0, limitText) + " ......."
                        : data.message;
                return message;
            },
        },
        {
            data: null,
            mRender: function (data) {
                return (
                    '<label class="badge badge-secondary font-size-14">/' +
                    data.shortcut +
                    "</label>"
                );
            },
        },
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data) {
                return `
                    <a class="text-danger text-center mr-3" title="Delete Quick Reply: ${data.name}" href="#" onclick="deleteQR(${data.id})">
                        <i class="fas fa-trash fa-lg mt-2 position-relative"></i>
                    </a>
                    <a class="text-danger text-center mr-3" title="Edit Quick Reply: ${data.name}" href="${btnEdit}?id=${data.id}">
                        <i class="fas fa-edit fa-lg position-relative mt-2"></i>
                    </a>
                `;
            },
        },
    ],
    // bFilter: false
});

function deleteQR(id) {
    Swal.fire({
        title: "Delete?",
        text: "Are you sure delete quick reply?",
        icon: "info",
        showCancelButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        cancelButtonColor: "#74788d",
        confirmButtonColor: "#ff3d60",
        confirmButtonText: "Yes!",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.value) {
            settings.method = "DELETE";
            settings.data = JSON.stringify({
                id,
            });
            settings.url = `${window.base_url_live}/api/quick/reply`;
            $.ajax(settings).done(function (response) {
                Toast.fire({
                    icon: "success",
                    title:
                        type == 1
                            ? "General quick reply has been deleted!"
                            : "Personal quick reply has been deleted!",
                });
                dataTable.ajax.reload();
            });
        }
    });
}
/* off loader */
$(".page-loader").fadeOut(500);
