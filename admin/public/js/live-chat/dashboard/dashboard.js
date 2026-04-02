$("#limenu_Home").addClass("mm-active");
$("#amenu_Home").addClass("active");

/* emoji */
const getCaretPosition = (editableDiv) => {
    var caretPos = 0,
        sel,
        range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv) {
                caretPos = range.endOffset;
            }
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        if (range.parentElement() == editableDiv) {
            var tempEl = document.createElement("span");
            editableDiv.insertBefore(tempEl, editableDiv.firstChild);
            var tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
        }
    }
    return caretPos;
};

const setCaret = (positionInt = 1) => {
    const elInputChatId = document.getElementById("input_chat");
    elInputChatId.focus();
    const selOffsets = elInputChatId.innerText.length;
    var textNode = elInputChatId.firstChild;
    var range = document.createRange();
    range.setStart(textNode, selOffsets);
    range.setEnd(textNode, selOffsets);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

String.prototype.insertString = function (index, string) {
    if (index > 0) {
        return this.substring(0, index) + string + this.substr(index);
    }

    return string + this;
};

String.prototype.insertHtmlAtCursor = (html) => {
    const elInputChatId = document.getElementById("input_chat");
    if (window.getSelection().baseNode.parentNode.id == "input_chat") {
        var range, node;
        if (window.getSelection && window.getSelection().getRangeAt) {
            range = window.getSelection().getRangeAt(0);
            node = range.createContextualFragment(html);
            range.insertNode(node);
        } else if (document.selection && document.selection.createRange) {
            document.selection.createRange().pasteHTML(html);
        }
    } else {
        elInputChatId.innerHTML = elInputChatId.innerHTML + html;
    }
};

const pushMessageEmoji = () => {
    let inputChat = document.querySelector("[contenteditable]");
    let msgContent = inputChat.innerHTML;

    if (!Boolean(msgContent)) {
        inputChat.innerHTML = emojiValue;
        const elInputChatId = document.getElementById("input_chat");
        const selOffsets = getCaretPosition(elInputChatId);

        setCaret();
    } else {
        /* add emoji in flexible position input chat */
        const elInputChatId = document.getElementById("input_chat");
        const selOffsets = getCaretPosition(elInputChatId);
        const lengthVal = elInputChatId.innerHTML.length;

        if (selOffsets < lengthVal) {
            msgContent.insertHtmlAtCursor(emojiValue, selOffsets);
        } else {
            let result = msgContent.insertString(selOffsets, emojiValue);
            inputChat.innerHTML = result;
            setCaret();
        }
    }
};

var adminObj = new Admin();

let extensionFileAllowed = [
    ".gif",
    ".ico",
    ".jpg",
    ".jpeg",
    ".png",
    ".svg",
    ".tif",
    ".tiff",
    ".webp",
    ".mp4",
    ".webm",
    ".avi",
    ".mpeg",
    ".pdf",
    ".zip",
    ".7z",
    ".rar",
    ".bz",
    ".bz2",
    ".gz",
    ".tar",
    ".doc",
    ".crt",
    ".csr",
    ".docx",
    ".txt",
    ".xls",
    ".xlsx",
];

/* fancybox v4 */
Fancybox.bind('[data-fancybox="gallery"]', {
    Toolbar: {
        display: [
            { id: "prev", position: "center" },
            { id: "counter", position: "center" },
            { id: "next", position: "center" },
            "zoom",
            "slideshow",
            "download",
            "close",
            "thumbs",
        ],
    },
    on: {
        initLayout: (fancybox) => {
            console.warn("result fancy response:", fancybox);
        },
    },
});

Fancybox.bind("[data-fancybox-video]", {
    Html: {
        video: {
            autoplay: false,
        },
        html5video: {
            tpl: `<video class="fancybox__html5video" playsinline controls controlsList="download" poster="{{poster}}">
                <source src="{{src}}" type="{{format}}" />
                Sorry, your browser doesn\'t support embedded videos, <a href="{{src}}">download</a> and watch with your favorite video player!
                </video>`,
            format: "",
        },
    },
});

var uppy = new Uppy.Core({
    restrictions: {
        maxNumberOfFiles: 1,
        minNumberOfFiles: 1,
        allowedFileTypes: extensionFileAllowed,
    },
    onBeforeFileAdded: (currentFile) => {
        if (!adminObj.dataDetail) {
            uppy.getPlugin("XHRUpload").setOptions({
                endpoint: `${window.base_url_live}/api/chat/agent/upload-file`,
            });
        } else {
            if (adminObj.dataDetail.id_channel != 1) {
                uppy.getPlugin("XHRUpload").setOptions({
                    endpoint: `${window.base_url_live}/api/chat/agent/upload-file/from-dashboard-to-socmed`,
                });
            } else {
                uppy.getPlugin("XHRUpload").setOptions({
                    endpoint: `${window.base_url_live}/api/chat/agent/upload-file`,
                });
            }
        }
        let extensionOrigin = currentFile.extension.toLowerCase();
        let sizeFileOrigin = currentFile.size;
        const exImages = [
            "gif",
            "ico",
            "jpg",
            "jpeg",
            "png",
            "svg",
            "tif",
            "tiff",
            "webp",
        ];

        const exVideos = ["mp4", "webm", "avi", "mpeg"];

        if (exImages.includes(extensionOrigin)) {
            if (sizeFileOrigin > 5242880) {
                uppy.reset();
                uppy.info(
                    {
                        message: "Oh no, something bad happened!",
                        details:
                            "File couldn’t be uploaded because image file max size 5mb",
                    },
                    "error",
                    10000
                );

                return false;
            }
        }

        if (exVideos.includes(extensionOrigin)) {
            if (sizeFileOrigin > 5242880) {
                uppy.reset();
                uppy.info(
                    {
                        message: "Oh no, something bad happened!",
                        details:
                            "File couldn’t be uploaded because video file max size 5mb",
                    },
                    "error",
                    10000
                );
                return false;
            }
        }

        const exArchived = [
            "arc",
            "bz",
            "bz2",
            "gz",
            "rar",
            "tar",
            "zip",
            "7z",
        ];
        if (exArchived.includes(extensionOrigin)) {
            if (sizeFileOrigin > 10485760) {
                uppy.reset();
                uppy.info(
                    {
                        message: "Oh no, something bad happened!",
                        details:
                            "File couldn’t be uploaded because archived file max size 10mb",
                    },
                    "error",
                    10000
                );

                return false;
            }
        }

        const exApplication = [
            "pdf",
            "crt",
            "csr",
            "doc",
            "docx",
            "txt",
            "xls",
            "xlsx",
        ];
        if (exApplication.includes(extensionOrigin)) {
            if (sizeFileOrigin > 5242880) {
                uppy.reset();
                uppy.info(
                    {
                        message: "Oh no, something bad happened!",
                        details:
                            "File couldn’t be uploaded because document file max size 5mb",
                    },
                    "error",
                    10000
                );

                return false;
            }
        }
    },
});

uppy.use(Uppy.Dashboard, {
    inline: false,
    trigger: ".UppyModalOpenerBtn",
    target: ".DashboardContainer",
    showProgressDetails: true,
    note: "Send File Per Detailed Chat, cant supported draft",
    theme: "dark",
    metaFields: [
        { id: "message", name: "Message", placeholder: "Message on file" },
    ],
    proudlyDisplayPoweredByUppy: false,
    onRequestCloseModal: () => {
        uppy.getPlugin("Dashboard").closeModal();
        uppy.reset();
    },
});

uppy.use(Uppy.DropTarget, {
    target: "#content-detail-chat",
});

uppy.use(Uppy.XHRUpload, {
    method: "POST",
    // endpoint: `${window.base_url_live}/api/chat/agent/upload-file`,
    formData: true,
    bundle: false,
    fieldName: "files",
    headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        Authorization: `Bearer ${window.tk}`,
        "X-Requested-With": "xmlhttprequest",
        mimeType: "multipart/form-data",
    },
});

// uppy.use(Uppy.XHRUpload, adminObj.configUploadFile);
uppy.on("upload-success", (file, response) => {
    const params = {
        file_id: response.body.data.id,
        message: file.meta.message,
    };
    adminObj.sendChatFile(params);
    uppy.getPlugin("Dashboard").closeModal();
    uppy.reset();
});

uppy.on("upload-error", (file, error, response) => {
    console.log("error with file:", file.id);
    console.log("error message:", error);
    console.log("error response:", response);
});

$("#content-detail-chat").on("dragover", function (e) {
    // uppy.getPlugin("Dashboard").openModal();
    if (adminObj.dataDetail) {
        uppy.getPlugin("Dashboard").openModal();
    }
});

const dateIsoToNormal = (date) => {
    return date.replace("T", " ").substring(0, 19);
};
/* display no chatting */
const getPending = () => {
    // displayNoChatting();
};

const getPendingTransfer = () => {
    // displayNoChatting();
};

const getOngoing = () => {
    // displayNoChatting();
    // adminObj.getListOnGoing();
};

const getHistory = async () => {
    await adminObj.getListHistory();
    // displayNoChatting();
};

const attachFileChat = () => {
    $(".UppyModalOpenerBtn").click();
};

const displayNoChatting = () => {
    localStorage.removeItem("chat_id");
    localStorage.removeItem("last_action");
    localStorage.removeItem("id_users_client");
    adminObj.clearLayoutChat();
    $(".onGoing").removeClass("active");
    $("#IC").append(`
        <li class="d-flex justify-content-center py-17">
            <div class="conversation-list">
                <div class="ctext-wrap">
                    <div class="ctext-wrap-content">
                        <p class="mb-0">
                            Hai! start answering your client's questions
                        </p>
                    </div>
                </div>
            </div>
        </li>
    `);
    adminObj.dataDetail = {};
};
displayNoChatting();

const assignChat = (chat_id) => {
    adminObj.allResultListPending.forEach((valRes) => {
        if (chat_id == valRes.chat_id) {
            adminObj.dataDetail = valRes;
        }
    });
    adminObj.setupUploadFile();
    adminObj.ambilChat();
};

function sendChatButton() {
    let inputChat = document.querySelector("[contenteditable]");
    let text = inputChat.textContent;
    adminObj.sendChat(text);
    inputChat.innerHTML = null;
}

function closeChat() {
    adminObj.closeChat();
}

// pasang di session.js validate
function initPage() {
    const params = {};

    /* get local storage data */
    params.agent_id = localStorage.getItem("UserID");
    params.sessionID = localStorage.getItem("sessionID");
    params.last_action = localStorage.getItem("last_action");
    params.email_agent = localStorage.getItem("email");
    params.name_agent = localStorage.getItem("name");
    params.phone_agent = localStorage.getItem("phone");
    params.department_name = localStorage.getItem("department_name");
    params.company_name = localStorage.getItem("company_name");
    params.avatar = localStorage.getItem("avatar");

    let positionUserProfile =
        params.department_name == null || params.department_name == "null"
            ? "Owner"
            : params.department_name;

    document.getElementById("thumb-profile").src = !Boolean(params.avatar)
        ? `${window.base_url}/assets/images/users/avatar/avatar-4.png`
        : params.avatar;
    $("#name-profile").html(params.name_agent);
    $("#position-profile").html(positionUserProfile);
}

function encodeHTML(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
}

const getHistoryAction = (chat_id) => {
    var config = {
        method: "post",
        url: `${base_url_live}/api/chat/agent/history-chat-action`,
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: "Bearer " + window.tk,
        },
        data: {
            chat_id,
        },
    };

    return axios(config).then(function (response) {
        return response.data;
    });
};

/* render page detail history */

(async function () {
    if (["/login", "/"].includes(location.pathname)) {
        return true;
    }

    var token = localStorage.getItem("tk");
    if (Boolean(token)) {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "xmlhttprequest",
            },
        };
        axios
            .get(`${base_url_live}/api/validate`, config)
            .then(function (response) {
                if (Boolean(response.data.success)) {
                    window.current_user = response.data.user;
                    var user = response.data.user;

                    $("#display_agent_name_header").text(user.name);

                    $(".page-loader").fadeOut(500);

                    const event = new Event("api:validate");
                    window.dispatchEvent(event);
                    return true;
                }
            })
            .catch(function (error) {
                localStorage.clear();
                location.href = "/login";
            });
    } else {
        location.replace("/login");
    }
})();

// wait valid user
window.addEventListener("api:validate", function (e) {
    initPage();
});

window.addEventListener(
    "api:logout",
    function (e) {
        adminObj.logout();
    },
    false
);

const button_setting = document.getElementById("soundSetting");
const urlAudio = `${base_url_live}/assets/sound/bell.mp3`;
const audio = new Audio(urlAudio);
audio.muted = true;
$("#soundSetting").empty();
$("#soundSetting").append(`
    <i class="fas fa-volume-mute font-size-20 mr-2"></i>
`);

localStorage.setItem("allowed_notif", 0);

const checkSoundPermission = () => {
    const status_notify = localStorage.getItem("allowed_notif");
    if (status_notify == 0) {
        localStorage.setItem("allowed_notif", 1);
    } else {
        localStorage.setItem("allowed_notif", 0);
    }
    audio
        .play()
        .then(() => {
            const valSoundSetting = $("#soundSetting").val();
            $("#soundSetting").empty();
            if (valSoundSetting == "1") {
                audio.play().then(resetAudio);
                $("#soundSetting").append(`
                <i class="fas fa-volume-up font-size-20 mr-2"></i>
            `);
                $("#soundSetting").val("0");
            } else {
                audio.play().then(resetAudio);
                $("#soundSetting").append(`
                <i class="fas fa-volume-mute font-size-20 mr-2"></i>
            `);
                $("#soundSetting").val("1");
            }
        })
        .catch(() => {
            $("#soundSetting").empty();
            $("#soundSetting").append(`
            <i class="fas fa-volume-mute font-size-20 mr-2"></i>
        `);
            resetAudio();
        });
};

function resetAudio() {
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
}

/* labels chatting */
const getListLabelByChatID = () => {
    $("#iLabel").empty();

    const data = {
        chat_id: adminObj.dataDetail.chat_id,
    };

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${window.tk}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url: `${base_url_live}/api/chat/agent/show-chat-label`,
        data,
    };

    axios(config)
        .then((response) => {
            const data = response.data.data;

            if (data.length > 0) {
                data.forEach((el) => {
                    $("#iLabel").append(`
                    <span id="label-${el.id_labels}" class="badge badge-secondary font-size-14 mt-1" style="background-color:${el.label_color}">
                        <b>${el.label_name}</b>
                        <button type="button" class="close-label ml-2" title="Remove label" onclick="removeLabel(${el.id_labels})"
                            data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </span>
                `);
                });
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

/* modal labels form */
const formLabels = () => {
    getLabel();
    getListLabelByChatID();
    $("#formLabels").modal("show");
};

const closeFormLabels = () => {
    $("#formLabels").modal("hide");
    $("#iLabel").empty();
    optLabel.empty();
    $(".list-label").selectpicker("refresh");
    $("#listLabels").val([]);
};

$("#myModal").on("hide.bs.modal", function () {
    closeFormLabels();
});

const addLabel = () => {
    const dtLabel = $("#listLabels").val();
    // const chat_id = localStorage.getItem("chat_id");
    if (dtLabel.length < 1) {
        return adminObj.Toast.fire({
            icon: "warning",
            title: "Choose label min 1",
        });
    }

    const data = {
        id_labels: dtLabel,
        chat_id: adminObj.dataDetail.chat_id,
    };

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${window.tk}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url: `${base_url_live}/api/chat/agent/chat-label/attach-to-chat`,
        data,
    };

    axios(config)
        .then((response) => {
            getListLabelByChatID();
            adminObj.getListOnGoing();
            adminObj.getListPendingTransfer();
            adminObj.getListPending();
            getLabel();
        })
        .catch((error) => {
            console.log(error);
        });
};

const removeLabel = (val) => {
    Swal.fire({
        title: "Remove?",
        text: "Are you sure remove label?",
        icon: "info",
        showCancelButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        cancelButtonColor: "#74788d",
        confirmButtonColor: "#ff3d60",
        confirmButtonText: "Remove!",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed) {
            const id_labels = [val];

            const data = {
                id_labels,
                chat_id: adminObj.dataDetail.chat_id,
            };

            const config = {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${window.tk}`,
                    "Content-Type": "application/json",
                    "X-Requested-With": "xmlhttprequest",
                },
                url: `${base_url_live}/api/chat/agent/chat-label/detach-to-chat`,
                data,
            };

            axios(config)
                .then((response) => {
                    $(`#label-${val}`).remove();
                    adminObj.getListOnGoing();
                    adminObj.getListPendingTransfer();
                    adminObj.getListPending();
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    });
};

var optLabel = $(".list-label");

function getLabel() {
    var config = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: "Bearer " + tk,
        },
        url: `${base_url_live}/api/chat/agent/chat-label/list`,
    };

    $.ajax(config).done(function (response) {
        optLabel.empty();
        $(".list-label").selectpicker("refresh");

        if (response.data.length > 0) {
            response.data.forEach((el) => {
                $("#listLabels").append(`
                    <option value="${el.id}" data-content='<span class="badge badge-secondary font-size-14 mt-1 pointer" style="background-color:${el.color}"><b>${el.name}</b></span>'>
                        ${el.name}
                    </option>
                `);
            });
            $(".list-label").selectpicker("refresh");
        }
    });
}

document.querySelector(".send-chat").addEventListener("click", () => {
    adminObj.sendChat();
});

$("#input_chat").keydown(function (e) {
    let inputChat = document.querySelector("[contenteditable]");
    let msgContent = inputChat.innerHTML;

    if (e.which === 32) {
        msgContent = msgContent.replace(/^\s+/, "");
        if (msgContent.length === 0) {
            e.preventDefault();
        }
    } else if (e.ctrlKey && e.keyCode == 13) {
        var position = this.selectionEnd;
        this.value =
            this.value.substring(0, position) +
            "\n" +
            this.value.substring(position);
        this.selectionEnd = position;
    } else if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault();
        adminObj.sendChat();
    }
});

/* quickReply */
const getQuickReply = () => {
    let inputChat = document.getElementById("input_chat").textContent;

    const icSplit = inputChat.split("");

    if (!Boolean(icSplit[0])) {
        return clearPopupQuickReplies();
    }

    if (icSplit[0] !== "/") {
        return clearPopupQuickReplies();
    }

    let valMsg = inputChat.substring(1);
    const url =
        valMsg == "" || valMsg == null
            ? `${base_url_live}/api/quick/reply/list?type=`
            : `${base_url_live}/api/quick/reply/list?type=&q=${valMsg}`;

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${window.tk}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url,
    };

    axios(config)
        .then((response) => {
            window.quickReplies = response.data.data;
            clearPopupQuickReplies();
            if (window.quickReplies.length > 0) {
                $("#popup-msg-header").append("Quick Replies");
                window.quickReplies.forEach((element) => {
                    $("#popup-message").append(`
                        <button type="button" class="dropdown-item item-scrollabel-dropdown" onclick="moveIC('qc','${element.id}')">
                            <span class="badge badge-secondary text-white font-weight-bold font-size-14 mr-1">/</span> ${element.shortcut}
                        </button>
                    `);
                });

                $("#tools-msg").addClass("dropup");
                $("#tools-msg").show();
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

const clearPopupQuickReplies = () => {
    $("#tools-msg").hide();
    $("#tools-msg").odd().removeClass(["dropup"]);
    $("#popup-message").empty();
    $("#popup-msg-header").empty();
};
clearPopupQuickReplies();

const showTools = _.debounce(getQuickReply, 250);

const chekcMessage = () => {
    showTools();
};

const moveIC = (type = false, val = false) => {
    let msg = "";
    if (type == "qc") {
        window.quickReplies.forEach((element) => {
            if (element.id == val) {
                msg = element.message;
            }
        });
    }

    document.getElementById("input_chat").textContent = msg;
    chekcMessage();
};

async function viewHistorychat(chatid) {
    const res = await getHistoryAction(chatid);
    $(".StepProgress").empty();
    res.data.forEach((v) => {
        $(".StepProgress").append(
            `<li class="StepProgress-item"><strong>${v.formatted_date}</strong>${v.action_name}</li>`
        );
    });
    $("#modal-detail-chat").modal("show");
}

/* paster clear format */
document
    .querySelector('div[contenteditable="true"]')
    .addEventListener("paste", function (e) {
        e.preventDefault();
        var text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
    });

/* select picker assets call library */
$(document).ready(function () {
    $(".selectpicker-search").selectpicker({
        liveSearch: true,
        liveSearchPlaceholder: "Search...",
        noneSelectedText: "Nothing Selected",
    });

    $(".selectpicker").selectpicker({
        liveSearch: false,
    });

    // cek apakah di pendingtransfer ada data
    setInterval(function () {
        if (localStorage.getItem("allowed_notif") == 1) {
            if ($("#dt_pending_transfer").children().length > 0) {
                audio.play();
            }

            if ($("#dt_pending").children().length > 0) {
                audio.play();
            }
        }
    }, 2000);
});

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

$("#submit-domain").click(function () {
    adminObj.devOauthClient();
});

const closeSendHistory = () => {
    $("#err_email_client_sender").hide();
    $("#formSendHistoryChat").modal("hide");
    $("#email_client_sender").val("");
    $("#err_email_client_sender").hide();
    $("#email_client_sender").removeClass("parsley-error");
    $("#err_email_client_sender").removeClass("parsley-error");
    $("#err_email_client_sender").empty();
};
closeSendHistory();

$(function () {
    $("#btn-send-history")
        .parsley()
        .on("field:validated", function () {
            var elementID = this.element.id;
            var result = this.validationResult;
            if (result == true) {
                $("#err_" + elementID).hide();
            } else {
                result.forEach((element) => {
                    var condition = element.assert.name;
                    $("#err_" + elementID).show();
                    if (condition == "minlength") {
                        $("#err_" + elementID).html(
                            element.assert.validator.messages.en +
                                element.assert.requirements
                        );
                    } else if (condition == "type") {
                        $("#err_" + elementID).html("Not valid type email");
                    } else {
                        $("#err_" + elementID).html("Email Client is required");
                    }
                });
            }
        });
    $("#btn-send-history").submit(function (e) {
        let email = $("#email_client_sender").val();
        adminObj.sendHistoryChat(email);
    });
});
