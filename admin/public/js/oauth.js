const permission = localStorage.getItem("permission");
const tk = localStorage.getItem("tk");
const uuid = localStorage.getItem("uuid");

socket.on("manage.domainresult", (response) => {
    console.warn(response);
});

if (tk == null || tk == undefined || !tk) {
    location.replace(`${base_url_live}/login`);
}

if ([1, 2].includes(permission)) {
    location.replace(`${base_url_live}/404`);
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

var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};
settings.method = "GET";
settings.url = `${base_url_live}/api/agent/oauth-client/list`;

var dataTable = $("#example").DataTable({
    ajax: settings,
    columns: [
        {
            data: "name",
        },
        {
            data: "domain",
        },
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data) {
                return `<a class="text-url-dark font-size-20 pointer" title="show me" onclick="showToken('${data.secret}')">
                    <i class="fas fa-eye"></i>
                </a>`;
            },
        },
        {
            data: null,
            bSortable: false,
            sClass: "text-center",
            mRender: function (data) {
                return `<button class="btn btn-danger btn-sm waves-effect" onclick="deleteToken(${data.id},'${data.domain}')"><i class="fas fa-trash"></i></button>`;
            },
        },
    ],
});

var tk_show = null;

const showToken = (val_tk) => {
    $("#copy-clypboard").modal("show");
    $("#tk-code").html(val_tk);
    tk_show = val_tk;
};

const copy = (menu = false) => {
    if (menu == "add") {
        selectText("tk-code-add");
    } else {
        selectText("tk-code");
    }
};

const selectText = (node) => {
    node = document.getElementById(node);
    /* use copy */
    // navigator.clipboard.writeText(node.textContent);
    $(".btn-copy")
        .attr(
            "data-original-title",
            "Please Click CTRL + C, for copy: " + node.textContent
        )
        .tooltip("show");
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
};

const outCursor = () => {
    if (window.getSelection) {
        if (window.getSelection().empty) {
            // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
            // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {
        // IE?
        document.selection.empty();
    }
    $(".btn-copy")
        .attr("data-original-title", "Copy To Clipboard")
        .tooltip("show");
};

const deleteToken = (id, domain) => {
    Swal.fire({
        title: "Delete?",
        text: "Are you sure remove token?",
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
            settings.url = `${base_url_live}/api/agent/oauth-client/${id}`;
            $.ajax(settings)
                .done(function (response) {
                    let dataOauth = {
                        domain: domain,
                        action: "remove",
                    };
                    socket.emit("manage.domain", dataOauth);
                    Toast.fire({
                        icon: "success",
                        title: response.message,
                    });
                    dataTable.ajax.reload();
                })
                .fail(function (response) {
                    Toast.fire({
                        icon: response.error.toLowerCase(),
                        title: response.message,
                    });
                    dataTable.ajax.reload();
                });
        }
    });
};

$("#page-copy").hide();

const addToken = () => {
    $("#addToken").modal("show");
};

/* custom message minlength */
window.Parsley.addValidator("minlength", {
    requirementType: "integer",
    validateString: function (value, requirement) {
        return value.length >= requirement;
    },
    messages: {
        en: "minimal length: ",
        id: "panjang minimal: ",
    },
});

/* generate token */
$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            let elementID = this.element.id;
            let resultValidator = this.validationResult[0];
            if (["name", "domain"].includes(elementID)) {
                if (resultValidator == true) {
                    $(`#err_${elementID}`).hide();
                } else {
                    $(`#err_${elementID}`).empty();
                    $(`#err_${elementID}`).hide();

                    if (resultValidator != undefined) {
                        if (resultValidator.assert.name == "required") {
                            $(`#err_${elementID}`).append(`
                                ${elementID} is required!
                            `);
                        } else {
                            $(`#err_${elementID}`).append(`
                                Minimal length ${elementID}: ${resultValidator.assert.requirements}
                            `);
                        }
                        $(`#err_${elementID}`).show();
                    }
                }
            }
        });
    $("#btn-save").submit(function (e) {
        e.preventDefault();
        let getUrl = psl.get($("#domain").val());
        if (!getUrl) {
            $("#err_domain").empty();
            $("#err_domain").append(
                "Format domain is not support, example: google.com"
            );
            $("#err_domain").show();
            return false;
        }
        $(".page-loader").removeAttr("style");
        settings.url = `${base_url_live}/api/agent/oauth-client`;
        settings.method = "POST";
        settings.data = {
            name: $("#name").val(),
            domain: $("#domain").val(),
            agent_uuid: uuid,
        };
        axios(settings)
            .then(async (response) => {
                const dataRes = response.data;
                let dataOauth = {
                    domain: $("#domain").val(),
                    action: "save",
                };
                socket.emit("manage.domain", dataOauth);
                await renderingAdd(dataRes.data);
                $(".page-loader").attr("style", "display:none");
                Toast.fire({
                    icon: "success",
                    title: "Api key is generated!",
                });
                dataTable.ajax.reload();
            })
            .catch((err) => {
                $(".page-loader").attr("style", "display:none");
            });
    });
});

const renderingAdd = (params) => {
    $(".btn-add").removeAttr("type");
    $(".btn-add").attr("type", "button");
    $(".btn-add").removeClass("btn-success");
    $(".btn-add").hide();
    $("#name").attr("readonly", true);
    $("#name").attr("disabled", true);
    $("#name").removeAttr("data-parsley-minlength");
    $("#name").removeAttr("data-parsley-required");
    $("#name").addClass("text");
    $("#domain").attr("readonly", true);
    $("#domain").attr("disabled", true);
    $("#domain").addClass("text");
    $("#domain").removeAttr("data-parsley-minlength");
    $("#domain").removeAttr("data-parsley-required");

    $("#page-copy").append(
        `
            <span class="copy">
                <p id="tk-code-add">${params.secret}</p>
            </span>
            <button type="button" class="btn-sm btn-secondary btn-copy" data-toggle="tooltip" data-placement="top"
                title="Drag All Api Key" onclick="copy('add')" onmouseout="outCursor()">
                <i class="fas fa-copy"></i>
            </button>
        `
    );
    $("#page-copy").show();
};

const closeAdd = () => {
    $("#page-copy").empty();
    $("#addToken").modal("hide");
    $(".btn-add").attr("type", "submit");
    $(".btn-add").addClass("btn-success");
    $(".btn-add").show();
    $("#name").removeAttr("readonly");
    $("#name").removeAttr("disabled");
    $("#name").attr("data-parsley-minlength", "2");
    $("#name").attr("data-parsley-required");
    $("#name").removeClass("text");
    $("#domain").removeAttr("readonly");
    $("#domain").removeAttr("disabled");
    $("#domain").removeClass("text");
    $("#domain").attr("data-parsley-required");
    $("#domain").attr("data-parsley-minlength", "1");
    $("#domain").val(null);
    $("#name").val(null);
    $(".tooltip").removeClass("show");
    $("#page-copy").hide();
};
/* off loader */
$(".page-loader").fadeOut(500);
