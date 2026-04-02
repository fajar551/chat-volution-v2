let start_date, end_date, id_agent, status_name;

let roleID = localStorage.getItem("permission");
const allowRole = [2, 3];

if (!allowRole.includes(parseInt(roleID))) {
    location.href = `${base_url_live}/404`;
}

let elStartDate = document.getElementById("startDate");
let elEndDate = document.getElementById("endDate");
let elStatus = document.getElementById("status_name");

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

const tk = localStorage.getItem("tk");

var optionAgentList = $(".list-agent");
const getAgent = () => {
    const config = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: "Bearer " + tk,
        },
        url: `${base_url_live}/api/chat/agent/agent-list`,
    };

    optionAgentList.empty();
    axios(config)
        .then((response) => {
            $(".list-agent").selectpicker("refresh");
            const dataRes = response.data.data;

            if (dataRes.length > 0) {
                $("#list-agents").append(
                    `<option value="" disbaled>Choose Agent...</option>`
                );
                dataRes.forEach((item) => {
                    $("#list-agents").append(
                        `<option value="${item.id}">${item.name}</option>`
                    );
                });

                $(".list-agent").selectpicker("refresh");
            }
        })
        .catch((err) => {
            console.warn(err);
        });
};

/* get data */
const settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

const getData = () => {
    axios(settings)
        .then((response) => {
            let data = response.data.data.list;
            let objectData = Object.assign({}, data);
            // console.warn(objectData);
            return objectData;
            // return data;
        })
        .catch((err) => {});
};

if (!Boolean(elStartDate.value) && !Boolean(elEndDate.value)) {
    elStartDate.value = moment().format("DD-MM-YYYY");
    elEndDate.value = moment().add(1, "days").format("DD-MM-YYYY");
} else {
    elStartDate = document.getElementById("startDate");
    elEndDate = document.getElementById("endDate");
}

settings.method = "POST";
settings.url = `${window.base_url_live}/api/chat/agent/chat-list-report`;
settings.data = {
    start_date: elStartDate.value,
    end_date: elEndDate.value,
    id_agent: !Boolean(id_agent) ? "" : id_agent,
    status_name: elStatus.value,
};

const getCountList = () => {
    let elListAgents = document.getElementById("list-agents");
    elStatus = document.getElementById("status_name");

    if (!Boolean(elStartDate.value) && !Boolean(elEndDate.value)) {
        elStartDate.value = moment().format("DD-MM-YYYY");
        elEndDate.value = moment().add(1, "days").format("DD-MM-YYYY");
    } else {
        elStartDate = document.getElementById("startDate");
        elEndDate = document.getElementById("endDate");
    }

    start_date = elStartDate.value;
    end_date = elEndDate.value;
    id_agent = elListAgents.value;
    status_name = elStatus.value;

    const config = {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: "Bearer " + tk,
        },
        method: "POST",
        url: `${window.base_url_live}/api/chat/agent/chat-list-report`,
        data: {
            start_date,
            end_date,
            id_agent: !Boolean(id_agent) ? "" : id_agent,
            status_name,
        },
    };

    axios(config)
        .then((response) => {
            let dataRes = response.data.data;

            let elTotalChat = document.querySelector(".total-chat");

            if (elTotalChat.length < 1) {
                elTotalChat.innerHTML = 0;
            }

            elTotalChat.innerHTML = new Intl.NumberFormat("en-ID").format(
                dataRes.length
            );
        })
        .catch((err) => {});
};

const refreshList = () => {
    getCountList();

    elStatus = document.getElementById("status_name");
    let elListAgents = document.getElementById("list-agents");

    if (!Boolean(elStartDate.value) && !Boolean(elEndDate.value)) {
        elStartDate.value = moment().format("DD-MM-YYYY");
        elEndDate.value = moment().add(1, "days").format("DD-MM-YYYY");
    } else {
        elStartDate = document.getElementById("startDate");
        elEndDate = document.getElementById("endDate");
    }

    start_date = elStartDate.value;
    end_date = elEndDate.value;
    id_agent = elListAgents.value;
    status_name = elStatus.value;

    const config = {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: "Bearer " + tk,
        },
        method: "POST",
        url: `${window.base_url_live}/api/chat/agent/chat-list-report`,
        data: {
            start_date,
            end_date,
            id_agent: !Boolean(id_agent) ? "" : id_agent,
            status_name,
        },
    };

    axios(config)
        .then((response) => {
            let dataRes = response.data.data;
            dataTable.clear();

            dataTable.rows.add(dataRes).draw();
            $(".page-loader").fadeOut(300);
        })
        .catch((err) => {});
};

var dataTable = $("#example").DataTable({
    dom:
        "<'row'<'col-sm-12 col-md-9 col-lg-10'B><'col-sm-12 col-md-3 col-lg-2'l><'col-sm-4'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
    buttons: [
        {
            text: `<i class="fas fa-redo-alt mr-2"></i> Refresh Table`,
            className: "btn-refresh",
            action: refreshList,
        },
    ],
    ajax: settings,
    filter: false,
    info: false,
    columns: [
        {
            data: null,
            bSortable: true,
            sClass: "text-center",
            mRender: (data, type, row, meta) => {
                return meta.row + meta.settings._iDisplayStart + 1;
            },
        },
        {
            data: null,
            bSortable: true,
            sClass: "text-left",
            mRender: (data) => {
                const newDate = moment(data.created_at).format(
                    "HH:mm:ss DD-MM-YYYY"
                );
                return newDate;
            },
        },
        {
            data: null,
            bSortable: true,
            sClass: "text-left",
            mRender: (data) => {
                let agent_name = data.handled_by_agents;

                let agent_name_arr = "";
                agent_name.forEach((value) => {
                    agent_name_arr += ` <span class="badge badge-secondary font-size-14">${value}</span>`;
                });
                return agent_name_arr;
            },
        },
        {
            data: "first_message",
        },
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data) {
                return `
                    <a href="javascript:void(0)" class="btn btn-sm btn-info" onclick="detail('${data.chat_id}')">Detail</a>
                    <a href="javascript:void(0)" class="btn btn-sm btn-primary" onclick="actionHistory('${data.chat_id}')">Action History</a>
                `;
            },
        },
    ],
});

const getHistoryAction = (chat_id) => {
    var config = {
        method: "post",
        url: `${base_url_live}/api/chat/agent/history-chat-action`,
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: "Bearer " + tk,
        },
        data: {
            chat_id,
        },
    };

    return axios(config).then(function (response) {
        return response.data;
    });
};

const detail = (chat_id) => {
    location.replace(`${base_url_live}report/detail/${chat_id}`);
};

const actionHistory = async (chat_id) => {
    const res = await getHistoryAction(chat_id);
    $(".StepProgress").empty();
    res.data.forEach((v) => {
        $(".StepProgress").append(
            `<li class="StepProgress-item mb-2"><strong>${moment(
                v.formatted_date
            ).format("LT DD-MM-YYYY")}</strong> ${v.action_name}</li>`
        );
    });
    $("#modal-detail-chat").modal("show");
};

$(function () {
    $("#startDate").datepicker({
        format: "DD-MM-YYYY",
        language: "en-US",
        autoHide: true,
    });

    $("#endDate").datepicker({
        format: "DD-MM-YYYY",
        language: "en-US",
        autoHide: true,
    });

    $("#startDate").on("change", function () {
        var new_date = moment(
            $("#startDate").datepicker("getDate"),
            "DD-MM-YYYY"
        ).add(1, "days");
        $("#endDate").val(new_date.format("DD-MM-YYYY"));
        $("#endDate").datepicker("setStartDate", new_date.toDate());
        $("#endDate").datepicker("update", new_date.toDate());
        refreshList();
    });

    $("#endDate").on("change", function () {
        if (Boolean($("#startDate").val())) {
            refreshList();

            return false;
        }

        var new_date = moment(
            $("#endDate").datepicker("getDate"),
            "DD-MM-YYYY"
        ).subtract(1, "days");
        $("#startDate").val(new_date.format("DD-MM-YYYY"));
        $("#startDate").datepicker("update", new_date.toDate());
        refreshList();
    });

    $(".selectpicker-search").selectpicker({
        liveSearch: true,
        liveSearchPlaceholder: "Search...",
        noneSelectedText: "Choose Agent...",
    });

    getAgent();
    refreshList();

    setInterval(() => getCountList(), 60000);
});
