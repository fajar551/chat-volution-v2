/* off loader */
$(".page-loader").fadeOut(500);

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

let header = [];
header = [
        "Name",
        "Client_id",
        "Secret",
    ];
    $(".addUrl").attr("href", "add-key");
    $(".lbla-btn").html("Add Key");
    

/* render header table */
$(".header-tbl").append(`
    <th>No</th>
`);
header.forEach((el) => {
    $(".header-tbl").append(`
        <th>${el}</th>
    `);
});

$(".header-tbl").append(`
    <th>Action</th>
`);

const menu = $("#title").val();
$("#menu-header").html(menu);

var tk = localStorage.getItem("tk");
var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

settings.method = "GET";
settings.url = `${window.base_url_live}/api/agent/key/list`;
const dataTable = $("#example").DataTable({
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
            data: "client_id",
        },
        {
            data: "secret",
        },  
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data) {
                return (
                    `
                    <a class="text-danger text-center mr-3" title="Delete secret: ${data.name}" href="#" onclick="deleteSecretKey(${data.id})">
                        <i class="fas fa-trash fa-lg mt-2 position-relative"></i>
                    </a>
                    `
                );
            }
        },
    ],
});

function deleteSecretKey(id) {
    Swal.fire({
        title: "Delete?",
        text: "Are you sure delete secret key?",
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
            settings.url = `${window.base_url_live}/api/agent/key/${id}`;
            $.ajax(settings).done(function (response) {
                Toast.fire({
                    icon: "success",
                    title: "Delete secret key successfuly!",
                });
                dataTable.ajax.reload();
            });
        }
    });
}

