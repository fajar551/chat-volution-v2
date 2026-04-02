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
settings.url = `${window.base_url_live}api/dummy/billings`;
var dataTable = $("#example").DataTable({
    // "processing": true,
    // "serverSide": true,
    ajax: settings,
    columns: [
        {
            data: "description",
        },
        {
            data: null,
            mRender: function (data) {
                return "Rp " + formatNumbering(data.price.toString());
            },
        },
        {
            data: null,
            sClass: "text-center",
            mRender: function (data) {
                return data.paid_until == null || data.paid_until == ""
                    ? "-"
                    : data.paid_until;
            },
        },
        {
            data: null,
            sClass: "text-center",
            mRender: function (data) {
                if (data.status == "Success") {
                    return '<h5><span class="badge badge-success">Success</span></h5>';
                } else {
                    return '<h5><span class="badge badge-warning text-dark">Pending</span></h5>';
                }
            },
        },
    ],
    drawCallback: function (settings) {
        $("#summary").html("Rp " + 0);
        if (settings.json) {
            $("#summary").html(
                "Rp " + formatNumbering(settings.json.sum_price.toString())
            );
        }
    },
});
/* off loader */
$(".page-loader").fadeOut(500);
