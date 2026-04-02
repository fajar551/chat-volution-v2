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

let typeMenu = $("#type").val();

const menu = $("#title").val();
$("#menu-header").html(menu);
const roleID = localStorage.getItem("permission");

var header = [];
if (menu == "Agents") {
    if (roleID == 1) {
        header = [
            "Name",
            "Email",
            "Phone Number",
            "Company",
            "Department",
            "Status",
        ];
        $(".addUrl").attr("href", "add-agent");
        $(".lbla-btn").html("Add Agent");
    } else if (roleID == 2 || roleID == 3) {
        header = [
            "Name",
            "Email",
            "Phone Number",
            "Department",
            "Access",
            "Status",
        ];
        $(".addUrl").attr("href", "add-agent");
        $(".lbla-btn").html("Add Agent");
    } else {
        location.href = `${base_url_live}/404`;
    }
} else if (menu == "Staff") {
    if (roleID == 1 || roleID == 2) {
        header = [
            "Name",
            "Email",
            "Company",
            "Phone Number",
            "Department",
            "Status",
        ];
        $(".addUrl").attr("href", "add-staff");
        $(".lbla-btn").html("Add Staff");
    } else {
        location.href = `${base_url_live}/404`;
    }
} else {
    if (roleID == 1) {
        header = ["Name", "Email", "Company Name", "Phone Number", "Status"];
        $(".addUrl").attr("href", "add-company");
        $(".lbla-btn").html("Add Company");
    } else {
        location.href = `${base_url_live}/404`;
    }
}

/* render header table */
$(".header-tbl").append(`
    <th>No</th>
`);
header.forEach((el) => {
    $(".header-tbl").append(`
        <th>${el}</th>
    `);
});
if (menu != "Company" && (roleID == 2 || roleID == 3)) {
    $(".header-tbl").append(`
        <th>Action</th>
    `);
}

var tk = localStorage.getItem("tk");
var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

if (roleID == 1) {
    settings.url = `${window.base_url_live}/api/agent/admin/list/${typeMenu}`;
} else {
    settings.url = `${window.base_url_live}/api/agent/list/${typeMenu}`;
}

settings.method = "GET";
if (menu == "Agents") {
    if (roleID == 1) {
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
                    data: "email",
                },
                {
                    data: "id_company",
                },
                {
                    data: null,
                    bSortable: false,
                    sClass: "text-center",
                    mRender: function (data) {
                        return "-";
                    },
                },
                {
                    data: "id_department",
                },
                {
                    data: null,
                    bSortable: false,
                    sClass: "text-center",
                    mRender: function (data) {
                        if (roleID == 1 || roleID == 2 || roleID == 3) {
                            switch (data.status) {
                                case 1:
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" checked class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                                case "1":
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" checked class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                                case 2:
                                    return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                    break;
                                case "2":
                                    return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                    break;
                                default:
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                            }
                        } else {
                            switch (data.status) {
                                case 1:
                                    return `<span class="text-success"><i class="fas fa-user-check"></i> Active</span>`;
                                    break;
                                case "1":
                                    return `<span class="text-success"><i class="fas fa-user-check"></i> Active</span>`;
                                    break;
                                case 2:
                                    return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                    break;
                                case "2":
                                    return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                    break;
                                default:
                                    return `<span class="text-danger"><i class="fas fa-user-times"></i> Unactive</span>`;
                                    break;
                            }
                        }
                    },
                },
            ],
        });
    } else {
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
                    data: "email",
                },
                {
                    data: "phone",
                },
                {
                    data: "department_name",
                },
                {
                    data: null,
                    bSortable: false,
                    sClass: "text-center",
                    mRender: function (data) {
                        switch (data.full_access) {
                            case 0:
                                return "Limit";
                            default:
                                return "Full";
                        }
                    },
                },
                {
                    data: null,
                    bSortable: false,
                    sClass: "text-center",
                    mRender: function (data) {
                        if (roleID == 1 || roleID == 2 || roleID == 3) {
                            switch (data.status) {
                                case 1:
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" checked class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                                case "1":
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" checked class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                                case 2:
                                    return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                    break;
                                case "2":
                                    return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                    break;
                                default:
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                            }
                        } else {
                            switch (data.status) {
                                case 1:
                                    return `<span class="text-success"><i class="fas fa-user-check"></i> Active</span>`;
                                    break;
                                case "1":
                                    return `<span class="text-success"><i class="fas fa-user-check"></i> Active</span>`;
                                    break;
                                case 2:
                                    return `<span class="text-tangerin"><i class="fas fa-user-lock"></i> Pending</span>`;
                                    break;
                                case "2":
                                    return `<span class="text-tangerin"><i class="fas fa-user-lock"></i> Pending</span>`;
                                    break;
                                default:
                                    return `<span class="text-danger"><i class="fas fa-user-times"></i> Unactive</span>`;
                                    break;
                            }
                        }
                    },
                },
                {
                    data: null,
                    bSortable: false,
                    sClass: "text-center",
                    mRender: function (data) {
                        switch (data.status) {
                            case 1:
                                return (
                                    '<a title="Edit Agent: ' +
                                    data.name +
                                    '?" href="' +
                                    base_url_live +
                                    "/edit-agent?id=" +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            case "1":
                                return (
                                    '<a title="Edit Agent: ' +
                                    data.name +
                                    '?" href="' +
                                    base_url_live +
                                    "/edit-agent?id=" +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            case 2:
                                return (
                                    '<a title="Edit Agent: ' +
                                    data.name +
                                    '?" href="/edit-agent?id=' +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            case "2":
                                return (
                                    '<a title="Edit Agent: ' +
                                    data.name +
                                    '?" href="/edit-agent?id=' +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            case 0:
                                return (
                                    '<a title="Edit Agent: ' +
                                    data.name +
                                    '?" href="' +
                                    base_url_live +
                                    "/edit-agent?id=" +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            case "0":
                                return (
                                    '<a title="Edit Agent: ' +
                                    data.name +
                                    '?" href="' +
                                    base_url_live +
                                    "/edit-agent?id=" +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            default:
                                return "";
                                break;
                        }
                    },
                },
            ],
        });
    }
} else if (menu == "Staff") {
    if (roleID == 1) {
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
                    data: "email",
                },
                {
                    data: "id_company",
                },
                {
                    data: "phone",
                },
                {
                    data: "id_department",
                },
                {
                    data: null,
                    bSortable: false,
                    sClass: "text-center",
                    mRender: function (data) {
                        if (roleID == 1 || roleID == 2 || roleID == 3) {
                            switch (data.status) {
                                case 1:
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" checked class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                                case 2:
                                    return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                    break;
                                default:
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                            }
                        } else {
                            switch (data.status) {
                                case 1:
                                    return `<span class="text-success"><i class="fas fa-user-check"></i> Active</span>`;
                                    break;
                                case "1":
                                    return `<span class="text-success"><i class="fas fa-user-check"></i> Active</span>`;
                                    break;
                                case 2:
                                    return `<span class="text-tangerin"><i class="fas fa-user-lock"></i> Pending</span>`;
                                    break;
                                case "2":
                                    return `<span class="text-tangerin"><i class="fas fa-user-lock"></i> Pending</span>`;
                                    break;
                                default:
                                    return `<span class="text-danger"><i class="fas fa-user-times"></i> Unactive</span>`;
                                    break;
                            }
                        }
                    },
                },
            ],
        });
    } else {
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
                    data: "email",
                },
                {
                    data: "company_name",
                },
                {
                    data: "phone",
                },
                {
                    data: "department_name",
                },
                {
                    data: null,
                    bSortable: false,
                    sClass: "text-center",
                    mRender: function (data) {
                        if (roleID == 1 || roleID == 2 || roleID == 3) {
                            switch (data.status) {
                                case 1:
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" checked class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                                case 2:
                                    return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                    break;
                                default:
                                    return (
                                        `<div class="custom-control custom-switch custom-switch-md ">
                                        <input type="checkbox" class="custom-control-input" id="status_active` +
                                        data.id +
                                        `" onclick="changeStatus(` +
                                        data.id +
                                        `)">
                                        <label class="custom-control-label" for="status_active` +
                                        data.id +
                                        `"></label>
                                    </div>`
                                    );
                                    break;
                            }
                        } else {
                            switch (data.status) {
                                case 1:
                                    return `<span class="text-success"><i class="fas fa-user-check"></i> Active</span>`;
                                    break;
                                case 2:
                                    return `<span class="text-tangerin"><i class="fas fa-user-lock"></i> Pending</span>`;
                                    break;
                                default:
                                    return `<span class="text-danger"><i class="fas fa-user-times"></i> Unactive</span>`;
                                    break;
                            }
                        }
                    },
                },
                {
                    data: null,
                    bSortable: false,
                    sClass: "text-center",
                    mRender: function (data) {
                        switch (data.status) {
                            case 1:
                                return (
                                    '<a title="Edit Staff: ' +
                                    data.name +
                                    '?" href="' +
                                    base_url_live +
                                    "/edit-staff?id=" +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            case "1":
                                return (
                                    '<a title="Edit Staff: ' +
                                    data.name +
                                    '?" href="' +
                                    base_url_live +
                                    "/edit-staff?id=" +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            case 2:
                            return (
                                '<a title="Edit Staff: ' +
                                data.name +
                                '?" href="/edit-staff?id=' +
                                data.id +
                                '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                            );
                            break;
                            case 0:
                                return (
                                    '<a title="Edit Staff: ' +
                                    data.name +
                                    '?" href="' +
                                    base_url_live +
                                    "/edit-staff?id=" +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            case "0":
                                return (
                                    '<a title="Edit Staff: ' +
                                    data.name +
                                    '?" href="' +
                                    base_url_live +
                                    "/edit-staff?id=" +
                                    data.id +
                                    '" class="text-primary ml-1"><i class="fas fa-edit fa-lg position-relative mt-2"></i></a>'
                                );
                                break;
                            default:
                                return "";
                                break;
                        }
                    },
                },
            ],
        });
    }
} else {
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
                data: "email",
            },
            {
                data: "id_company",
            },
            {
                data: "phone",
            },
            {
                data: null,
                bSortable: false,
                sClass: "text-center",
                mRender: function (data) {
                    if (roleID == 1) {
                        switch (data.status) {
                            case 1:
                                return (
                                    `<div class="custom-control custom-switch custom-switch-md ">
                                    <input type="checkbox" checked class="custom-control-input" id="status_active` +
                                    data.id +
                                    `" onclick="changeStatus(` +
                                    data.id +
                                    `)">
                                    <label class="custom-control-label" for="status_active` +
                                    data.id +
                                    `"></label>
                                </div>`
                                );
                                break;
                            case 2:
                                return `<span class="badge badge-tangerin">
                                    <i class="fas fa-user-lock"></i> Pending
                                    </span>  <div class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Mohon aktivasi email untuk akses agent">i</div>`;
                                break;
                            default:
                                return (
                                    `<div class="custom-control custom-switch custom-switch-md ">
                                    <input type="checkbox" class="custom-control-input" id="status_active` +
                                    data.id +
                                    `" onclick="changeStatus(` +
                                    data.id +
                                    `)">
                                    <label class="custom-control-label" for="status_active` +
                                    data.id +
                                    `"></label>
                                </div>`
                                );
                                break;
                        }
                    } else {
                        switch (data.status) {
                            case 1:
                                return `<span class="text-success"><i class="fas fa-user-check"></i> Active</span>`;
                                break;
                            case 2:
                                return `<span class="text-tangerin"><i class="fas fa-user-lock"></i> Pending</span>`;
                                break;
                            default:
                                return `<span class="text-danger"><i class="fas fa-user-times"></i> Unactive</span>`;
                                break;
                        }
                    }
                },
            },
        ],
    });
}

const changeStatus = (id) => {
    settings.method = "PUT";
    settings.data = JSON.stringify({
        id: id,
        status: !$("#status_active" + id).prop("checked") ? 0 : 1,
    });
    if (roleID == 1) {
        settings.url = `${base_url_live}/api/agent/admin`;
    } else {
        settings.url = `${base_url_live}/api/agent/status`;
    }
    $(".page-loader").removeAttr("style");
    $.ajax(settings).done(function (response) {
        dataTable.ajax.reload();
        $(".page-loader").attr("style", "display:none");
        Toast.fire({
            icon: "success",
            title: "Change status " + typeMenu + " successfuly!",
        });
    });
};

/* off loader */
$(".page-loader").fadeOut(500);
