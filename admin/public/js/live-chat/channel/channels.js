const roleID = localStorage.getItem('permission')
const UserID = localStorage.getItem("UserID")

if (roleID != 1) {
    location.replace('/404');
}

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

var tk = localStorage.getItem('tk')
var settings = {
    "headers": {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Authorization": "Bearer " + tk
    },
};

settings.url = "/api/chat/channel/list";
settings.method = "POST"
var dataTable = $('#example').DataTable({
    'ajax': settings,
    "columns": [{
            "data": null,
            "bSortable": false,
            'sClass': "text-left",
            "mRender": function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }
        },
        {
            "data": "name"
        },
        {
            "data": "description"
        },
        {
            "data": null,
            "bSortable": false,
            'sClass': "text-center",
            "mRender": function (data) {
                if (data.status == 1) {
                    return `<div class="custom-control custom-switch custom-switch-md ">
                    <input type="checkbox" checked class="custom-control-input" id="status_active` + data.id + `" onclick="changeStatus(` + data.id + `)">
                    <label class="custom-control-label" for="status_active` + data.id + `"></label>
                </div>`
                } else {
                    return `<div class="custom-control custom-switch custom-switch-md ">
                    <input type="checkbox" class="custom-control-input" id="status_active` + data.id + `" onclick="changeStatus(` + data.id + `)">
                    <label class="custom-control-label" for="status_active` + data.id + `"></label>
                </div>`
                }
            }
        },
        {
            "data": null,
            "bSortable": false,
            'sClass': "text-center",
            "mRender": function (data) {
                return `
                    <a title="Edit Channel: ${data.name}?" href="/edit-channel?id=${data.id}" class="text-primary mx-1"><i class="ri-edit-line font-size-18" style="position:relative; top: 4px;"></i></a>
                    <a href="#" title="Delete Channel: ${data.name}" onclick="deleteFunction(${data.id})" class="text-danger mx-1"><i class="ri-delete-bin-7-line font-size-18" style="position: relative;top: 4px;"></i></a>
                `;
            }
        }
    ],
});

function changeStatus(id) {
    settings.method = "PUT"
    settings.data = JSON.stringify({
        id: id,
        status: !$("#status_active" + id).prop("checked") ? 0 : 1
    })
    settings.url = "/api/chat/channel/status"
    $(".page-loader").removeAttr("style")
    $.ajax(settings).done(function (response) {
        dataTable.ajax.reload();
        $(".page-loader").attr("style", "display:none")
        Toast.fire({
            icon: "success",
            title: 'Change status active role successfuly!',
        });
    })
}


function deleteFunction(id) {
    Swal.fire({
        title: 'Delete?',
        text: 'Are you sure delete channel?',
        icon: 'info',
        showCancelButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        cancelButtonColor: '#74788d',
        confirmButtonColor: '#ff3d60',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.value) {
            settings.method = "DELETE"
            settings.data = JSON.stringify({
                id
            })
            settings.url = "/api/chat/channel"
            $.ajax(settings).done(function (response) {
                Toast.fire({
                    icon: "success",
                    title: 'Delete channel successfuly!',
                });
                dataTable.ajax.reload();
            })
        }
    });
}
/* off loader */
$('.page-loader').fadeOut(500);
