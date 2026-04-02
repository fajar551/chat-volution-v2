class departmentClass {
    constructor() {
        this.listSelectedAgent = {};
    }
}

const id = $("#id").val();
const tk = localStorage.getItem("tk");
$("#agentId").val([]);

const settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
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

/* get agent list selector */
const getAgentList = () => {
    settings.url = `${window.base_url_live}/api/agent/topic/select`;
    settings.method = "POST";
    settings.data = JSON.stringify({
        id_topic: id,
    });

    axios(settings)
        .then(function (response) {
            const dataRes = response.data.data;
            if (Boolean(dataRes)) {
                dataRes.forEach((valRes) => {
                    $(".optionSelector").append(`
                        <option value="${valRes.id}">${valRes.name}</option>
                    `);
                });
            }
        })
        .catch(function (error) {
            console.warn(error);
        });
};

/* list agent has been selected*/
const agentSelected = () => {
    $("#datatable tbody").empty();
    $("#datatable tbody").append(`
        <tr class="loader" style="display: none">
            <td colspan="3" style="text-align:center;background:rgba(225,225,225,1)">
                <div class="spinner-border">
                    <span class="sr-only">Loading...</span>
                </div>
            </td>
        </tr>
    `);

    $(".loader").removeAttr("style");
    $(".showed-data").attr("style", "display:none");
    $(".not-found").attr("style", "display:none");

    settings.url = `${window.base_url_live}/api/agent/topic/${id}`;
    settings.method = "GET";
    delete settings["data"];
    axios(settings)
        .then(async (response) => {
            const dataRes = response.data.data;
            this.listSelectedAgent = dataRes.topic_agents;

            if (dataRes.topic_agents.length > 0) {
                await dataRes.topic_agents.forEach((valRes) => {
                    $("#datatable tbody").append(`
                    <tr class="showed-data" style="display:none">
                        <td>
                            <input type="checkbox" class="pointer" name="app-${valRes.id}" value="${valRes.id}" id="agentId-${valRes.id}" onclick="checkActiveContent(${valRes.id})" class="checkItem">
                        </td>
                        <td>${valRes.agent_name}</td>
                    </tr>`);
                });
                $(".showed-data").removeAttr("style");
            } else {
                $("#datatable tbody").append(`
                    <tr class="not-found" style="display: none">
                        <td colspan="3" style="text-align:center;background:rgba(225,225,225,1)">
                            Data Not Found!
                        </td>
                    </tr>
                `);
                $(".not-found").removeAttr("style");
            }

            $(".loader").attr("style", "display:none");
        })
        .catch((error) => {
            console.warn(error);
        });
};

const saveAgentToSelected = () => {
    settings.url = `${window.base_url_live}/api/agent/topic`;
    settings.method = "POST";
    let dataAgentSelected = $("#agentSelected").val();

    if (!Boolean(dataAgentSelected)) {
        return Toast.fire({
            icon: "error",
            title: "Failed save, because agent not selected!",
        });
    }

    $(".page-loader").removeAttr("style");
    $(".loader").removeAttr("style");
    $(".showed-data").attr("style", "display:none");
    $(".not-found").attr("style", "display:none");
    const id_agent = [];
    dataAgentSelected.forEach((valDAS) => {
        id_agent.push(parseInt(valDAS));
    });

    settings.data = { id_agent, id_topic: parseInt(id) };
    settings.method = "post";
    settings.url = `${window.base_url_live}/api/agent/topic`;

    axios(settings)
        .then((response) => {
            $(".page-loader").attr("style", "display:none");
            Toast.fire({
                icon: "success",
                title: "Add agent successfuly!",
            });
            closeForm();
        })
        .catch(function (error) {
            $(".page-loader").attr("style", "display:none");
            console.warn(error);
        });
};

const removeArr = async () => {
    let checkList = $("#appForm").serializeArray();

    if (checkList.length < 1) {
        return Toast.fire({
            icon: "error",
            title: "Remove agent failed, because not selected data!",
        });
    }

    $(".page-loader").removeAttr("style");
    $(".loader").removeAttr("style");
    $(".showed-data").attr("style", "display:none");
    $(".not-found").attr("style", "display:none");

    settings.url = `${window.base_url_live}/api/agent/topic`;
    settings.method = "DELETE";
    await checkList.forEach((valDRC) => {
        delete settings["data"];
        settings.data = {
            id: valDRC.value,
        };
        axios(settings).then((response) => {});
    });
    $(".page-loader").attr("style", "display:none");
    Toast.fire({
        icon: "success",
        title: "Remove agent successfuly!",
    });
    closeForm();
};

const getDetail = () => {
    settings.url = `${window.base_url_live}/api/agent/topic/${id}`;
    settings.method = "GET";
    axios(settings)
        .then(function (response) {
            const dataRes = response.data;
            $("#name").val(dataRes.data.name);
            $("#description").val(dataRes.data.description);
        })
        .catch(function (error) {
            console.warn(error);
            // localStorage.clear();
            // location.href = "/login";
        });
};
getDetail();

$(function () {
    $("#btn-save").parsley();

    $("#btn-save").submit(function (e) {
        e.preventDefault();
        settings.url = `${window.base_url_live}/api/chat/topic`;
        settings.method = "PUT";
        settings.dataSrc = "";
        settings.data = JSON.stringify({
            id: id,
            name: $("#name").val(),
            description: $("#description").val(),
            status: 1,
        });
        axios(settings)
            .then(function (response) {
                Swal.fire({
                    title: "Congratulation",
                    text: "Edit topic successfuly!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace(`${base_url_live}/topics`);
                });
            })
            .catch(function (error) {
                $(".page-loader").attr("style", "display:none");
                console.warn(error);
            });
    });
});

const checkActiveBoxAll = async () => {
    let statusCheckAll = $(`#checkAll`).prop("checked");

    if (statusCheckAll) {
        if (Boolean(this.listSelectedAgent)) {
            await this.listSelectedAgent.forEach((valSelect) => {
                $(`#agentId-${valSelect.id}`).prop("checked", true);
            });
        }
    } else {
        if (Boolean(this.listSelectedAgent)) {
            await this.listSelectedAgent.forEach((valSelect) => {
                $(`#agentId-${valSelect.id}`).prop("checked", false);
            });
        }
    }
};

const checkActiveContent = (id) => {
    // let el = $(`#agentId-${id}`).prop("checked");
    let checkList = $("#appForm").serializeArray();
    let agentList = this.listSelectedAgent;
    let arr1 = [];
    let arr2 = [];

    agentList.forEach((element) => {
        arr1.push(element.id);
    });

    checkList.forEach((element) => {
        arr2.push(element.value);
    });

    var difference = [];

    jQuery.grep(arr2, function (el) {
        if (jQuery.inArray(el, arr1) == -1) difference.push(el);
    });

    if (difference.length < arr1.length) {
        $(`#checkAll`).prop("checked", false);
    } else {
        $(`#checkAll`).prop("checked", true);
    }
};

/* global function load list */
const loadList = () => {
    getAgentList();
    agentSelected();
};

const closeForm = () => {
    $("#agentSelected").val([]).change();
    $("#formAgent").modal("hide");
    $(".select2-multiple").empty();
    $("#checkAll").prop("checked", false);
    checkActiveBoxAll();
    loadList();
};

closeForm();

$(".page-loader").fadeOut(500);
