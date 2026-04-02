/* menu type */
const menuType = $("#type").val();

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

/* select picker assets call library */
$(document).ready(function () {
    $(".selectpicker-search").selectpicker({
        liveSearch: true,
        liveSearchPlaceholder: "Search...",
    });

    $(".selectpicker").selectpicker({
        liveSearch: false,
    });
});

/* assets integrate api headers */
var tk = localStorage.getItem("tk");
var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

if (menuType == "account") {
    /* get accounts */
    settings.method = "GET";
    settings.url = "/api/dummy/accounts";
    var dataTable = $("#example").DataTable({
        ajax: settings,
        columns: [
            {
                data: null,
                mRender: function (data) {
                    return (
                        '<a class="text-dark text-left" href="/crm-detail-account?id=' +
                        data.id +
                        '">' +
                        data.name +
                        "</a>"
                    );
                },
            },
            {
                data: "phone",
            },
            {
                data: null,
                bSortable: false,
                sClass: "text-center",
                mRender: function (data) {
                    return (
                        '<a class="text-danger text-center mr-3" title="Delete Label: ' +
                        data.name +
                        '?" href="#" onclick="deleteLabel(' +
                        data.id +
                        ')"/' +
                        ">" +
                        '<i class="ri-delete-bin-7-line font-size-18" style="position: relative;top: 4px;"></i>' +
                        "</a>" +
                        '<a title="Edit Account: ' +
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

    /* Type company selector */
    const dataSelector = [
        "analyst",
        "competitor",
        "customer",
        "integrator",
        "investor",
        "partner",
        "press",
        "prospect",
        "reseller",
        "other",
    ];

    $(".optionSelector").append(`
        <option value="" selected disabled>Choose Type Company</option>
    `);

    dataSelector.forEach((el) => {
        $(".optionSelector").append(`
            <option value="${capitalize(el)}">${capitalize(el)}</option>
        `);
    });

    /* select sectors or industries */
    settings.method = "GET";
    settings.url = "/api/industry";
    var optIndustry = $(".optionSectors");
    optIndustry.append(`
        <option value="" selected disabled>Choose Type Industry</option>
    `);

    $.ajax(settings).done(function (response) {
        response.data.forEach((el) => {
            optIndustry.append(`
                <option value="${capitalize(el.name)}">${capitalize(
                el.name
            )}</option>
            `);
        });
        $(".optionSectors").selectpicker("refresh");
    });

    var optCountry = $(".iLCountry");
    optCountry.append(`
        <option value="" selected disabled>Choose Country</option>
    `);

    $.getJSON(
        "/assets/libs/country-json/src/country-by-name.json",
        function (response) {
            response.forEach((el) => {
                optCountry.append(`
            <option value="${capitalize(el.country)}">${capitalize(
                    el.country
                )}</option>
        `);
            });
            $(".iLCountry").selectpicker("refresh");
        }
    );

    /* add account */
    $(function () {
        $("#btn-add-save").parsley();
        $("#btn-add-save").submit(function (e) {
            e.preventDefault();
        });
    });

    var company_size = document.getElementById("company_size");
    company_size.addEventListener("keyup", function (e) {
        company_size.value = formatNumbering(this.value);
    });
} else {
    var employee_number = "500000";
    $("#employee_number").html(
        formatNumbering(employee_number) + capitalize(" peoples")
    );

    /* settup chart */
    const sm = document.getElementById("smChart");
    const lg = document.getElementById("lgChart");

    function random(min, max) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const labels = [
        "januari",
        "februari",
        "maret",
        "april",
        "mei",
        "juni",
        "juli",
        "agustus",
        "september",
        "oktober",
        "november",
        "desember",
    ];
    const data = {
        labels: labels,
        datasets: [
            {
                label: "Closed Won",
                data: [
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                ],
                backgroundColor: "#4cc9f0",
            },
            {
                label: "Closed Lost",
                data: [
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                ],
                backgroundColor: "#9d0208",
            },
            {
                label: "Qualification",
                data: [
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                ],
                backgroundColor: "#52b788",
            },
            {
                label: "Need Analisys",
                data: [
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                ],
                backgroundColor: "#fb5607",
            },
            {
                label: "Proposal",
                data: [
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                ],
                backgroundColor: "#7209b7",
            },
            {
                label: "Negotiation",
                data: [
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                    random(50000, 1000000000),
                ],
                backgroundColor: "#ffbe0b",
            },
        ],
    };
    let delayed;
    const smChart = new Chart(sm, {
        type: "bar",
        data: data,
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (
                        context.type === "data" &&
                        context.mode === "default" &&
                        !delayed
                    ) {
                        delay =
                            context.dataIndex * 300 +
                            context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            responsive: true,
            tooltips: {
                callbacks: {
                    label: function (t, d) {
                        var xLabel = d.datasets[t.datasetIndex].label;
                        var yLabel =
                            t.yLabel >= 1000
                                ? "$" +
                                  t.yLabel
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                : "$" + t.yLabel;
                        return xLabel + ": " + yLabel;
                    },
                },
            },
            scales: {
                y: {
                    ticks: {
                        callback: function (value, index, values) {
                            return "Rp " + value;
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: "Opportunity Amount by Stage",
                },
            },
        },
    });

    const lgChart = new Chart(lg, {
        type: "bar",
        data: data,
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (
                        context.type === "data" &&
                        context.mode === "default" &&
                        !delayed
                    ) {
                        delay =
                            context.dataIndex * 300 +
                            context.datasetIndex * 100;
                    }
                    return delay;
                },
            },
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        callback: function (value, index, values) {
                            return "Rp " + value;
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: "Opportunity Amount by Stage",
                },
            },
        },
    });
}

/* form popup */
const formEdit = (id) => {
    $("#editAccounts").modal("show");
};

const closeFormEdit = () => {
    $("#editAccounts").modal("hide");
};

const formAdd = () => {
    $("#addAccounts").modal("show");
};

const closeForm = () => {
    $("#addAccounts").modal("hide");
};
