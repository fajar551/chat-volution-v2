"use strict";
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

settings.method = "GET"
settings.url = "/api/dummy/groups-social"
var dataTable = $('#example').DataTable({
    'ajax': settings,
    "columns": [{
            "data": null,
            "bSortable": false,
            'sClass': "text-center",
            "mRender": function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }
        },
        {
            "data": "group_name"
        },
        {
            "data": null,
            "bSortable": false,
            'sClass': "text-left",
            "mRender": function (data) {
                return formatNumbering(data.count_account.toString());
            }
        },
        {
            "data": null,
            "bSortable": false,
            'sClass': "text-center",
            "mRender": function (data) {
                return '<a title="Edit Account: ' + data.group_name + '?" href="javascript:void(0)" onclick="formEdit(' + data.id + ')" class="text-primary mr-1 ml-1"><i class="ri-edit-line font-size-18" style="position:relative; top: 4px;"></i></a>' +
                    '<a class="text-danger text-center ml-1 mr-1" title="Delete Account: ' + data.group_name + '?" href="#" onclick="deleteAccount(' + data.id + ')"/' + '>' + '<i class="ri-delete-bin-7-line font-size-18" style="position: relative;top: 4px;"></i>' + '</a>';
            }
        }
    ],
    // bFilter: false
});

const formEdit = (id) => {
    location.replace('/social-edit-group?id=' + id);
}
