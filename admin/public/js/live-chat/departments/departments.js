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
var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};
//  /api/agent/chat-label/
settings.method = "POST";
settings.url = `${window.base_url_live}/api/agent/department/list`;
var dataTable = $("#example").DataTable({
    ajax: settings,
    columns: [
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            },
        },
        {
            data: "name",
        },
        {
            data: "description",
        },
        {
            data: "status",
        },
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data) {
                return `
                    <a class="text-danger text-center mr-3" title="Delete Department: ${data.name}"  href="#" onclick="deleteDepartment(${data.id})">
                        <i class="fas fa-trash fa-lg mt-2 position-relative"></i>
                    </a>
                    <a class="text-primary ml-1" title="Edit Department: ${data.name}" href="${base_url_live}/edit-department?id=${data.id}" >
                        <i class="fas fa-edit fa-lg position-relative mt-2"></i>
                    </a>
                `;
            },
        },
    ],
});

function deleteDepartment(id) {
    Swal.fire({
        title: "Delete?",
        text: "Are you sure delete departement?",
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
            // $(".page-loader").removeAttr("style")
            settings.method = "DELETE";
            settings.data = JSON.stringify({
                id,
            });
            settings.url = `${window.base_url_live}/api/agent/department`;
            $.ajax(settings).done(function (response) {
                // $(".page-loader").attr("style","display:none")
                Toast.fire({
                    icon: "success",
                    title: "Delete topic successfuly!",
                });
                dataTable.ajax.reload();
            });
        }
    });
}

/* off loader */
$(".page-loader").fadeOut(500);
