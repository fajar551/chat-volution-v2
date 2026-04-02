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
    },
};
//  /api/faq/list
settings.method = "POST";
settings.url = `${window.base_url_live}/api/faq/list`;
console.log(settings)
var dataTable = $("#faq_list").DataTable({
    ajax: settings,
    columns: [
        {
            data: null,
            mRender: function (data) {
                return (`
                    <p class="mb-0" style="word-wrap:break-word; white-space: normal;">
                        ${data.question}
                    </p>
                `);
            },
        },
        {
            data: null,
            mRender: function (data) {
                return (`
                    <p class="mb-0" style="max-width:700px; word-wrap:break-word; white-space: normal;">
                        ${data.answer}
                    </p>
                `);
            },
        },
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data) {
                return `
                    <a href="#" class="text-danger text-center mr-3" title="Delete FAQ: ${data.question}" onclick="deleteLabel(${data.id})">
                        <i class="fas fa-trash fa-lg mt-2 position-relative"></i>
                    </a>
                    <a href="${base_url_live}/edit-faq?id=${data.id}" class="text-primary text-center mr-3" title="Edit FAQ: ${data.question}">
                        <i class="fas fa-edit fa-lg position-relative mt-2"></i>
                    </a>
                `;
            },
        },
    ],
});

function deleteLabel(id) {
    settings.method = "DELETE";
    settings.data = JSON.stringify({
        id,
    });
    settings.url = `${window.base_url_live}/api/faq`;
    $.ajax(settings).done(function (response) {
        Toast.fire({
            icon: "success",
            title: "Delete label successfuly!",
        });
        dataTable.ajax.reload();
    });
}
/* off loader */
$(".page-loader").fadeOut(500);
