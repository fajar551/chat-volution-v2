/* form */
const formEdit = (id) => {
    $("#editOpportunity").modal("show");
};

const closeFormEdit = () => {
    $("#editOpportunity").modal("hide");
};

const formAdd = () => {
    $("#addOpportunity").modal("show");
};

/* function datetime picker tempusdominus */
$(function () {
    $(".close_date").datetimepicker({
        format: "YYYY-MM-DD",
        minDate: Date.now(),
    });
});

const closeFormAdd = () => {
    $("#addOpportunity").modal("hide");
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

var tk = localStorage.getItem("tk");
var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

settings.method = "GET";
settings.url = "/api/dummy/opportunities";
var dataTable = $("#example").DataTable({
    ajax: settings,
    columns: [
        {
            data: "opportunity_name",
        },
        {
            data: "account_name",
        },
        {
            data: "stage",
        },
        {
            data: "closed_date",
        },
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data) {
                return (
                    '<a class="text-danger text-center mr-3" title="Delete opportunities: ' +
                    data.name +
                    '?" href="#" onclick="deleteopportunities(' +
                    data.id +
                    ')"/' +
                    ">" +
                    '<i class="ri-delete-bin-7-line font-size-18" style="position: relative;top: 4px;"></i>' +
                    "</a>" +
                    '<a title="Edit opportunities: ' +
                    data.name +
                    '?" href="javascript:void(0)" onclick="formEdit(' +
                    data.id +
                    ')" class="text-primary ml-1"><i class="ri-edit-line font-size-18" style="position:relative; top: 4px;"></i></a>'
                );
            },
        },
    ],
    // bFilter: false
});

function deleteLabel(id) {
    $(".page-loader").removeAttr("style");
    settings.method = "DELETE";
    settings.data = JSON.stringify({
        id,
    });
    settings.url = "/api/chat/label";
    $.ajax(settings).done(function (response) {
        $(".page-loader").attr("style", "display:none");
        Toast.fire({
            icon: "success",
            title: "Delete label successfuly!",
        });
        dataTable.ajax.reload();
    });
}

const pilihIni = () => {};
