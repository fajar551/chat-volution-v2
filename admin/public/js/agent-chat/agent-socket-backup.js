class AgentChat {
    constructor() {
        this.dataAuth = {
            userIdAgent: localStorage.getItem("UserID"),
            sessionID: localStorage.getItem("sessionID"),
            uuid: localStorage.getItem("uuid"),
            email: localStorage.getItem("email"),
            name: localStorage.getItem("name"),
            phone: localStorage.getItem("phone"),
            id_company: localStorage.getItem("id_company"),
            company_name: localStorage.getItem("company_name"),
            token: localStorage.getItem("tk"),
            permission_name: localStorage.getItem("permission_name"),
            permission_id: localStorage.getItem("permission"),
            avatar: localStorage.getItem("avatar"),
            id_department: localStorage.getItem("id_department"),
            department_name: localStorage.getItem("department_name"),
            module: "is_chatCompany ",
        };
        this.socket = io(BASE_SOCKET, {
            autoConnect: true,
            auth: this.dataAuth,
        });

        /* data clicked list contact and private chat with friend another agent */
        this.detailPrivateChat = {};
        this.allResultPrivateChat = {};

        this.detailGroupChat = {}; //use list chatting
        this.allResultGroupChat = {};
        this.dataDetailGroupChat2 = {}; //use header or detail menu

        this.dataDetail = {};
        this.isNextDetail = false;
        this.nextDataDetail = {};
        /* end data clicked list contact and private chat with friend another agent */

        /* full response varibale */
        this.fullResponsePrivateChat = {};
        this.fullResponseGroupChat = {};

        /* info group and profile*/
        this.dataInfoGroup = {};

        /* notification */
        this.isBodyNotify = true;

        /* dropdownmenu bubblechat */
        this.isDropdownMenuBubble = false;

        /* reply message */
        this.replyMessage = false;
        this.replyMessageId = false;

        /* search message */
        this.idSearchMessage = false;
        this.isSearchMessage = false;

        /* scrolling to top */
        this.isScrollingTop = false;
        this.countingMessageNoRead = 0;

        /* last bubble chat */
        this.lastBubbleId = false;
    }
}

const titleBrowser = Boolean(document.getElementById("title-browser-tag").value)
    ? `${
          document.getElementById("title-browser-tag").value
      } | Qwords Chatting Platform`
    : "Qwords Chatting Platform";

const options = { target: "_blank", className: "__bubble-url-chat" };

let emojiValue = "";

let dataTypingGroup = [];
let displaySize = screen.width;

const AgentChatClass = new AgentChat();
const dataAuth = AgentChatClass.dataAuth;
const socket = AgentChatClass.socket;

/* toast with sweetaler v2 */
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
            // console.warn(fancybox);
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

/* assets variable modal*/
let chooseContactGroups = [];
let listContactGroups = [];
let menuModal = "";
let file = null;
let listChoosedContactGroup = [];

/* assets variable menu active */
let is_menu = "";

/* rendering data chatting */
const renderingWithDeleteChat = async (data) => {
    $("#listChat").append(`
        <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right"></div>
                        <div class="text-msg mb-0 msg-${data.idCardChat}"><i class="fas fa-ban mr-1"></i> <i>Message has been deleted</i></div>
                    </div>
                    <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                </div>
            </div>
        </li>
    `);

    if (data.is_menu == "private") {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        let iconFoca = "";
        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }
};

const renderingWithFancy = async (data) => {
    if (data.file_type == "image") {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 25%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex justify-content-center" data-fancybox="gallery" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" class="w-50" src="${data.file_url}" />
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    } else if (data.file_type == "other") {
        let fileExtension = data.file_path.split(".");
        if (fileExtension[1].toLowerCase() == "pdf") {
            await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" data-fancybox data-type="pdf" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/pdf.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
        }
    } else {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat}" data-fancybox-video data-download-src="${data.file_url}" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <video onmousedown="return false" id="preview-file" playsinline="true"  controls muted  style="max-width:100%" src="${data.file_url}"></video>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingNoFancy = async (data) => {
    let fileExtension = data.file_path.split(".");
    let exDoc = ["doc", "docx"];
    let exExcel = ["xls", "xlsx"];
    let exArchives = ["arc", "bz", "bz2", "gz", "rar", "tar", "zip", "7z"];
    if (exDoc.includes(fileExtension[1].toLowerCase())) {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/doc.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    } else if (exExcel.includes(fileExtension[1].toLowerCase())) {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/sheets.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    } else if (exArchives.includes(fileExtension[1].toLowerCase())) {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/archive.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    } else {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/download-file.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingReplyMessageContentWithFancy = (data) => {
    if (data.file_type == "image") {
        return `
            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 25%;">
                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex justify-content-center" data-fancybox="gallery" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" class="w-50" src="${data.file_url}" />
                </a>
            </div>
            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
        `;
    } else if (data.file_type == "other") {
        let fileExtension = data.file_path.split(".");
        if (fileExtension[1].toLowerCase() == "pdf") {
            return `
                <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                    <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" data-fancybox data-type="pdf" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                        <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/pdf.png" />
                        <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                    </a>
                </div>
                <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
            `;
        }
    } else {
        return `
            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                <a id="overview-file" class="img-chat-${data.idCardChat}" data-fancybox-video data-download-src="${data.file_url}" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <video onmousedown="return false" id="preview-file" playsinline="true"  controls muted  style="max-width:100%" src="${data.file_url}"></video>
                </a>
            </div>
            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
        `;
    }
};

const renderingReplyMessageContentWithNoFancy = (data) => {
    let fileExtension = data.file_path.split(".");
    let exDoc = ["doc", "docx"];
    let exExcel = ["xls", "xlsx"];
    let exArchives = ["arc", "bz", "bz2", "gz", "rar", "tar", "zip", "7z"];
    let allowedExtension = [
        "arc",
        "bz",
        "bz2",
        "gz",
        "rar",
        "tar",
        "zip",
        "7z",
        "xls",
        "xlsx",
        "doc",
        "docx",
    ];

    if (exDoc.includes(fileExtension[1].toLowerCase())) {
        return `
            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/doc.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            </div>
            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
        `;
    }

    if (exExcel.includes(fileExtension[1].toLowerCase())) {
        return `
            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/sheets.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            </div>
            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
        `;
    }

    if (exArchives.includes(fileExtension[1].toLowerCase())) {
        return `
            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/archive.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            </div>
            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
        `;
    }

    if (!allowedExtension.includes(fileExtension[1].toLowerCase())) {
        return `
            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/download-file.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            </div>
            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
        `;
    }
};

const renderingReplyMessageContent = async (data) => {
    const elReplyMessageContent = $(
        `.reply-message-content-${data.idCardChat}`
    );

    if (Boolean(data.file_path) && Boolean(data.file_url)) {
        let fileExtension = data.file_path.split(".");
        const fancyEx = [
            "pdf",
            "jpg",
            "gif",
            "ico",
            "jpeg",
            "png",
            "svg",
            "tif",
            "tiff",
            "webp",
            "mp4",
            "webm",
            "avi",
            "mpeg",
        ];

        if (fancyEx.includes(fileExtension[1].toLowerCase())) {
            let childUiFancyContent =
                await renderingReplyMessageContentWithFancy(data);
            await elReplyMessageContent.html(childUiFancyContent);
        } else {
            let childUiNoFancyContent =
                await renderingReplyMessageContentWithNoFancy(data);
            await elReplyMessageContent.html(childUiNoFancyContent);
        }

        if (Boolean(data.message)) {
            $(`.msg-${data.idCardChat}`).append(`${data.message}`);
        }
        return false;
    }

    if (!Boolean(data.file_path)) {
        elReplyMessageContent.html(`
            <div class="text-msg mb-0 msg-${data.idCardChat}">${data.message}</div>
        `);
        return false;
    } else {
        if (!Boolean(data.file_url)) {
            elReplyMessageContent.html(`
                <div class="img-fluid mb-1 d-flex justify-content-center" style="object-fit: cover;width: 100%;height: 50%;">
                    <img onmousedown="return false" id="preview-file" class="w-100" src="${base_url_live}/assets/images/small/img-4.jpg" />
                </div>
                <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
            `);

            if (Boolean(data.message)) {
                $(`.msg-${data.idCardChat}`).append(`${data.message}`);
            }
            return false;
        }
    }
};

const mediaContentParentChat = (data, condition = false) => {
    let contentParentChat = $(`.media-content-${data.idCardChat}`);

    if (condition == "delete") {
        contentParentChat.html(`
            <div class="media-body">
                <h5 class="mt-0 font-size-14 text-white-mute">
                    <i class="fas fa-ban mr-1"></i> <i>Message has been deleted</i>
                </h5>
            </div>
        `);
    } else {
        let nameParent =
            dataAuth.name == data.parent_reply_from_agent_name
                ? "me"
                : data.parent_reply_from_agent_name;

        let parentMessage = Boolean(data.parent_reply_message)
            ? limitText(data.parent_reply_message, 20)
            : "";

        if (Boolean(data.parent_is_meeting)) {
            contentParentChat.html(`
                    <img class="avatar-xs mr-2 rounded" src="${base_url_live}/assets/images/icon/video-camera-white.png" alt="file-parent-reply">
                    <div class="media-body">
                        <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                        <p class="text-white text-wrap">${limitText(
                            data.parent_meeting_url,
                            20
                        )}</p>
                    </div>
                `);
            return false;
        } else {
            if (!Boolean(data.parent_reply_file_path)) {
                contentParentChat.html(`
                    <div class="media-body">
                        <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                        <p class="text-white text-wrap">${parentMessage}</p>
                    </div>
                `);
                return false;
            } else {
                if (!Boolean(data.parent_reply_file_url)) {
                    contentParentChat.html(`
                        <img class="avatar-xs mr-2 rounded" src="${base_url_live}/assets/images/small/img-4.jpg" alt="file-parent-reply">
                        <div class="media-body">
                            <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                            <p class="text-white text-wrap">${parentMessage}</p>
                        </div>
                    `);
                    return false;
                }

                let fileExtension = data.parent_reply_file_path.split(".");
                let exDoc = ["doc", "docx"];
                let exExcel = ["xls", "xlsx"];
                let exArchives = [
                    "arc",
                    "bz",
                    "bz2",
                    "gz",
                    "rar",
                    "tar",
                    "zip",
                    "7z",
                ];
                let exPdf = ["pdf"];

                if (exDoc.includes(fileExtension[1].toLowerCase())) {
                    contentParentChat.html(`
                        <img class="avatar-xs mr-2 rounded" src="${base_url_live}/assets/images/icon/doc.png" alt="file-parent-reply">
                        <div class="media-body">
                            <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                            <p class="text-white text-wrap">${parentMessage}</p>
                        </div>
                    `);
                    return false;
                } else if (exPdf.includes(fileExtension[1].toLowerCase())) {
                    contentParentChat.html(`
                        <img class="avatar-xs mr-2 rounded" src="${base_url_live}/assets/images/icon/pdf.png" alt="file-parent-reply">
                        <div class="media-body">
                            <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                            <p class="text-white text-wrap">${parentMessage}</p>
                        </div>
                    `);
                    return false;
                } else if (exExcel.includes(fileExtension[1].toLowerCase())) {
                    contentParentChat.html(`
                        <img class="avatar-xs mr-2 rounded" src="${base_url_live}/assets/images/icon/sheets.png" alt="file-parent-reply">
                        <div class="media-body">
                            <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                            <p class="text-white text-wrap">${parentMessage}</p>
                        </div>
                    `);
                    return false;
                } else if (
                    exArchives.includes(fileExtension[1].toLowerCase())
                ) {
                    contentParentChat.html(`
                        <img class="avatar-xs mr-2 rounded" src="${base_url_live}/assets/images/icon/archive.png" alt="file-parent-reply">
                        <div class="media-body">
                            <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                            <p class="text-white text-wrap">${parentMessage}</p>
                        </div>
                    `);
                    return false;
                } else {
                    if (data.parent_reply_file_type == "image") {
                        contentParentChat.html(`
                            <img class="avatar-xs mr-2 rounded" src="${data.parent_reply_file_url}" alt="file-parent-reply">
                            <div class="media-body">
                                <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                                <p class="text-white text-wrap">${parentMessage}</p>
                            </div>
                        `);
                        return false;
                    } else {
                        contentParentChat.html(`
                            <img class="avatar-xs mr-2 rounded" src="${base_url_live}/assets/images/icon/play-button-white.png" alt="file-parent-reply">
                            <div class="media-body">
                                <h5 class="mt-0 font-size-14 text-white-mute text-bold">${nameParent}</h5>
                                <p class="text-white text-wrap">${parentMessage}</p>
                            </div>
                        `);
                        return false;
                    }
                }
            }
        }
    }
};

const mediaContentDeleteParentChat = async (data) => {
    this.dataDetail.internal_chat_replies.data.forEach((valMessage) => {
        if (valMessage.parent == data.id) {
            let contentParentChat = $(`.media-content-${valMessage.id}`);

            contentParentChat.html(`
                <div class="media-body">
                    <h5 class="mt-0 font-size-14 text-white-mute">
                        <i class="fas fa-ban mr-1"></i> <i>Message has been deleted</i>
                    </h5>
                </div>
            `);
        }
    });
};

const renderingDataChattingWithDeleteReply = async (data) => {
    let bgMedia =
        data.classChat == "left" ? "bg-dark-secondary" : "bg-soft-tangerin-600";

    let generatePinnedElement = "";

    if (data.is_pinned) {
        generatePinnedElement = `<i class="fas fa-thumbtack mr-1"></i>`;
    }

    await $("#listChat").append(`
        <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                            <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </div>
                        <div class="media ${bgMedia} mb-2 p-3 pointer border rounded media-content-${data.idCardChat} media-content-parent-${data.parent}"></div>
                        <div class="reply-message-content-${data.idCardChat}"></div>
                    </div>
                    <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                </div>
            </div>
        </li>
    `);

    $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
    this.isDropdownMenuBubble = false;

    await mediaContentParentChat(data, "delete");
    await renderingReplyMessageContent(data);

    if (Boolean(data.message)) {
        let checkElement = document.querySelector(`.msg-${data.idCardChat}`);

        if (Boolean(checkElement)) {
            linkifyElement(
                document.querySelector(`.msg-${data.idCardChat}`),
                options
            );
        }
    }

    const elFoCa = document.getElementById(`foca-${data.idCardChat}`);

    if (data.is_menu == "private") {
        let iconFoca = "";

        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }
};

const renderingDataChattingWithReply = async (data) => {
    let bgMedia =
        data.classChat == "left" ? "bg-dark-secondary" : "bg-soft-tangerin-600";

    let generatePinnedElement = "";

    if (data.is_pinned) {
        generatePinnedElement = `<i class="fas fa-thumbtack mr-1"></i>`;
    }

    await $("#listChat").append(`
        <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                            <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </div>
                        <div class="media ${bgMedia} mb-2 p-3 pointer border rounded media-content-${data.idCardChat} media-content-parent-${data.parent}" onclick="showDetailReplyChat(this)" data-bubbleParentid="${data.idCardChat}"></div>
                        <div class="reply-message-content-${data.idCardChat}"></div>
                    </div>
                    <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                </div>
            </div>
        </li>
    `);

    $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
    this.isDropdownMenuBubble = false;

    await mediaContentParentChat(data);
    await renderingReplyMessageContent(data);
    if (Boolean(data.message)) {
        let checkElement = document.querySelector(`.msg-${data.idCardChat}`);
        if (Boolean(checkElement)) {
            linkifyElement(
                document.querySelector(`.msg-${data.idCardChat}`),
                options
            );
        }
    }
    const elFoCa = document.getElementById(`foca-${data.idCardChat}`);

    if (data.is_menu == "private") {
        let iconFoca = "";

        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }
};

const renderingDataChattingWithMeetingRoom = async (data) => {
    let generatePinnedElement = "";

    if (Boolean(data.is_pinned)) {
        generatePinnedElement = `<i class="fas fa-thumbtack mr-1"></i>`;
    }

    await $("#listChat").append(`
        <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                            <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </div>
                        <div class="text-msg mb-0 msg-${data.idCardChat}">
                            <i class="fas fa-video mr-2"></i> <span>${data.meeting_url}</span>
                        </div>
                    </div>
                    <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                </div>
            </div>
        </li>
    `);

    $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
    this.isDropdownMenuBubble = false;

    let checkElement = document.querySelector(`.msg-${data.idCardChat}`);

    if (Boolean(checkElement)) {
        linkifyElement(
            document.querySelector(`.msg-${data.idCardChat}`),
            options
        );
    }

    if (data.is_menu == "private") {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        let iconFoca = "";
        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }
};

const renderingDataChatting = async (data) => {
    if (data.is_deleted) {
        return renderingWithDeleteChat(data);
    }

    if (Boolean(data.parent)) {
        if (data.has_parent_reply) {
            return renderingDataChattingWithReply(data);
        } else {
            return renderingDataChattingWithDeleteReply(data);
        }
    }

    if (Boolean(data.is_meeting)) {
        return renderingDataChattingWithMeetingRoom(data);
    }

    let generatePinnedElement = "";

    if (data.is_pinned) {
        generatePinnedElement = `<i class="fas fa-thumbtack mr-1"></i>`;
    }

    if (data.file_path != null) {
        if (data.file_url != null) {
            let fileExtension = data.file_path.split(".");
            const fancyEx = [
                "pdf",
                "jpg",
                "gif",
                "ico",
                "jpeg",
                "png",
                "svg",
                "tif",
                "tiff",
                "webp",
                "mp4",
                "webm",
                "avi",
                "mpeg",
            ];
            if (fancyEx.includes(fileExtension[1].toLowerCase())) {
                await renderingWithFancy(data);

                $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
                this.isDropdownMenuBubble = false;

                if (Boolean(data.message)) {
                    $(`.msg-${data.idCardChat}`).append(`${data.message}`);

                    let checkElement = document.querySelector(
                        `.msg-${data.idCardChat}`
                    );

                    if (Boolean(checkElement)) {
                        linkifyElement(
                            document.querySelector(`.msg-${data.idCardChat}`),
                            options
                        );
                    }

                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.message
                    );
                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            } else {
                await renderingNoFancy(data);
                $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
                this.isDropdownMenuBubble = false;

                if (Boolean(data.message)) {
                    $(`.msg-${data.idCardChat}`).append(`${data.message}`);

                    let checkElement = document.querySelector(
                        `.msg-${data.idCardChat}`
                    );

                    if (Boolean(checkElement)) {
                        linkifyElement(
                            document.querySelector(`.msg-${data.idCardChat}`),
                            options
                        );
                    }

                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.message
                    );
                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            }
        } else {
            await $("#listChat").append(`
                <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                    <div class="conversation-list conversation-${data.idCardChat}">
                        <div class="ctext-wrap">
                            <div class="conversation-name text-left">${data.displayName}</div>
                            <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                                <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                    <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                        <i class="fas fa-chevron-down"></i>
                                    </a>
                                </div>
                                <div class="img-fluid mb-1 d-flex justify-content-center" style="object-fit: cover;width: 100%;height: 50%;">
                                    <img onmousedown="return false" id="preview-file" class="w-100" src="assets/images/small/img-4.jpg" />
                                </div>
                                <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                            </div>
                            <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                        </div>
                    </div>
                </li>
            `);

            $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
            this.isDropdownMenuBubble = false;

            if (Boolean(data.message)) {
                $(`.msg-${data.idCardChat}`).append(`${data.message}`);
                $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);

                let checkElement = document.querySelector(
                    `.msg-${data.idCardChat}`
                );

                if (Boolean(checkElement)) {
                    linkifyElement(
                        document.querySelector(`.msg-${data.idCardChat}`),
                        options
                    );
                }
            }
        }
    } else {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}">${data.message}</div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
        $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
        this.isDropdownMenuBubble = false;

        linkifyElement(
            document.querySelector(`.msg-${data.idCardChat}`),
            options
        );
    }

    if (data.is_menu == "private") {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        let iconFoca = "";

        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }

    let elPinnedStatus = document.querySelector(
        `.pinned-status-${data.idCardChat}`
    );

    elPinnedStatus.innerHTML = generatePinnedElement;
};

/* rendering old data chatting */
const renderingOldWithDeleteMessage = async (data) => {
    $("#listChat").prepend(`
        <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right"></div>
                        <div class="text-msg mb-0 msg-${data.idCardChat}"><i class="fas fa-ban mr-1"></i> <i>Message has been deleted</i></div>
                    </div>
                    <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                </div>
            </div>
        </li>
    `);

    if (data.is_menu == "private") {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        let iconFoca = "";
        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }
};

const renderingOldWithFancy = async (data) => {
    if (data.file_type == "image") {
        await $("#listChat").prepend(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 25%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex justify-content-center" data-fancybox="gallery" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" class="w-50" src="${data.file_url}" />
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    } else if (data.file_type == "other") {
        let fileExtension = data.file_path.split(".");
        if (fileExtension[1].toLowerCase() == "pdf") {
            await $("#listChat").prepend(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" data-fancybox data-type="pdf" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/pdf.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
        }
    } else {
        await $("#listChat").prepend(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat}" data-fancybox-video data-download-src="${data.file_url}" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <video onmousedown="return false" id="preview-file" playsinline="true"  controls muted  style="max-width:100%" src="${data.file_url}"></video>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingOldNoFancy = async (data) => {
    let fileExtension = data.file_path.split(".");
    let exDoc = ["doc", "docx"];
    let exExcel = ["xls", "xlsx"];
    let exArchives = ["arc", "bz", "bz2", "gz", "rar", "tar", "zip", "7z"];
    if (exDoc.includes(fileExtension[1].toLowerCase())) {
        await $("#listChat").prepend(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/doc.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    } else if (exExcel.includes(fileExtension[1].toLowerCase())) {
        await $("#listChat").prepend(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}"onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/sheets.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    } else if (exArchives.includes(fileExtension[1].toLowerCase())) {
        await $("#listChat").prepend(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/archive.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    } else {
        await $("#listChat").prepend(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/download-file.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingOldDataChattingWithReply = async (data) => {
    let bgMedia =
        data.classChat == "left" ? "bg-dark-secondary" : "bg-soft-tangerin-600";

    let generatePinnedElement = "";

    if (data.is_pinned) {
        generatePinnedElement = `<i class="fas fa-thumbtack mr-1"></i>`;
    }

    $("#listChat").prepend(`
        <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                            <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </div>
                        <div class="media ${bgMedia} mb-2 p-3 pointer border rounded media-content-${data.idCardChat} media-content-parent-${data.parent}" onclick="showDetailReplyChat(this)" data-bubbleParentid="${data.idCardChat}"></div>
                        <div class="reply-message-content-${data.idCardChat}"></div>
                    </div>
                    <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                </div>
            </div>
        </li>
    `);

    $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
    this.isDropdownMenuBubble = false;

    await mediaContentParentChat(data);
    await renderingReplyMessageContent(data);

    if (Boolean(data.message)) {
        let checkElement = document.querySelector(`.msg-${data.idCardChat}`);

        if (Boolean(checkElement)) {
            linkifyElement(
                document.querySelector(`.msg-${data.idCardChat}`),
                options
            );
        }
    }
    const elFoCa = document.getElementById(`foca-${data.idCardChat}`);

    if (data.is_menu == "private") {
        let iconFoca = "";

        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }
};

const renderingOldDataChattingWithDeleteReply = async (data) => {
    let bgMedia =
        data.classChat == "left" ? "bg-dark-secondary" : "bg-soft-tangerin-600";

    let generatePinnedElement = "";

    if (data.is_pinned) {
        generatePinnedElement = `<i class="fas fa-thumbtack mr-1"></i>`;
    }

    await $("#listChat").prepend(`
        <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                            <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </div>
                        <div class="media ${bgMedia} mb-2 p-3 pointer border rounded media-content-${data.idCardChat} media-content-parent-${data.parent}"></div>
                        <div class="reply-message-content-${data.idCardChat}"></div>
                    </div>
                    <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                </div>
            </div>
        </li>
    `);

    $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
    this.isDropdownMenuBubble = false;

    await mediaContentParentChat(data, "delete");
    await renderingReplyMessageContent(data);

    if (Boolean(data.message)) {
        let checkElement = document.querySelector(`.msg-${data.idCardChat}`);

        if (Boolean(checkElement)) {
            linkifyElement(
                document.querySelector(`.msg-${data.idCardChat}`),
                options
            );
        }
    }

    const elFoCa = document.getElementById(`foca-${data.idCardChat}`);

    if (data.is_menu == "private") {
        let iconFoca = "";

        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }

    let elPinnedStatus = document.querySelector(
        `.pinned-status-${data.idCardChat}`
    );

    elPinnedStatus.innerHTML = generatePinnedElement;
};

const renderingOldDataChattingWithMeetingRoom = async (data) => {
    let generatePinnedElement = "";

    if (data.is_pinned) {
        generatePinnedElement = `<i class="fas fa-thumbtack mr-1"></i>`;
    }
    await $("#listChat").prepend(`
        <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}" onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                            <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </div>
                        <div class="text-msg mb-0 msg-${data.idCardChat}">
                            <i class="fas fa-video mr-2"></i> <span>${data.meeting_url}</span>
                        </div>
                    </div>
                    <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                </div>
            </div>
        </li>
    `);

    $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
    this.isDropdownMenuBubble = false;

    let checkElement = document.querySelector(`.msg-${data.idCardChat}`);

    if (Boolean(checkElement)) {
        linkifyElement(
            document.querySelector(`.msg-${data.idCardChat}`),
            options
        );
    }

    if (data.is_menu == "private") {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        let iconFoca = "";
        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        elFoCa.innerHTML = await `
            <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            <div class="d-flex mt-2 float-${data.classChat}">
                <div class="media readed-user-${data.idCardChat}"></div>
            </div>
        `;
        if (!data.status_last) {
            return (elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
            `);
        } else {
            elFoCa.innerHTML = await `
                <div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>
                <div class="d-flex mt-2 float-${data.classChat}">
                    <div class="media readed-user-${data.idCardChat}"></div>
                </div>
            `;
        }

        let elListRead = document.querySelector(
            `.readed-user-${data.idCardChat}`
        );

        if (Boolean(data.has_read_by)) {
            let listUserReaded = "";
            await data.has_read_by.forEach((value) => {
                if (data.id_sender != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            elListRead.innerHTML = `${listUserReaded}`;
        } else {
            elListRead.innerHTML = "";
        }
    }
};

const renderingOldDataChatting = async (data) => {
    if (data.is_deleted) {
        return renderingOldWithDeleteMessage(data);
    }

    if (Boolean(data.parent)) {
        if (data.has_parent_reply) {
            return renderingOldDataChattingWithReply(data);
        } else {
            return renderingOldDataChattingWithDeleteReply(data);
        }
    }

    if (Boolean(data.is_meeting)) {
        return renderingOldDataChattingWithMeetingRoom(data);
    }

    let generatePinnedElement = "";

    if (data.is_pinned) {
        generatePinnedElement = `<i class="fas fa-thumbtack mr-1"></i>`;
    }

    if (data.file_path != null) {
        if (data.file_url != null) {
            let fileExtension = data.file_path.split(".");
            const fancyEx = [
                "pdf",
                "jpg",
                "gif",
                "ico",
                "jpeg",
                "png",
                "svg",
                "tif",
                "tiff",
                "webp",
                "mp4",
                "webm",
                "avi",
                "mpeg",
            ];
            if (fancyEx.includes(fileExtension[1].toLowerCase())) {
                await renderingOldWithFancy(data);

                $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
                this.isDropdownMenuBubble = false;

                if (Boolean(data.message)) {
                    $(`.msg-${data.idCardChat}`).append(`${data.message}`);

                    linkifyElement(
                        document.querySelector(`.msg-${data.idCardChat}`),
                        options
                    );

                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.message
                    );
                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            } else {
                await renderingOldNoFancy(data);

                $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
                this.isDropdownMenuBubble = false;

                if (Boolean(data.message)) {
                    $(`.msg-${data.idCardChat}`).append(`${data.message}`);

                    linkifyElement(
                        document.querySelector(`.msg-${data.idCardChat}`),
                        options
                    );

                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.message
                    );
                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            }
        } else {
            await $("#listChat").prepend(`
                <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                    <div class="conversation-list conversation-${data.idCardChat}">
                        <div class="ctext-wrap">
                            <div class="conversation-name text-left">${data.displayName}</div>
                            <div class="ctext-wrap-content wrap-message-${data.idCardChat}"onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                                <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                    <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                        <i class="fas fa-chevron-down"></i>
                                    </a>
                                </div>
                                <div class="img-fluid mb-1 d-flex justify-content-center" style="object-fit: cover;width: 100%;height: 50%;">
                                    <img onmousedown="return false" id="preview-file" class="w-100" src="assets/images/small/img-4.jpg" />
                                </div>
                                <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                            </div>
                            <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                        </div>
                    </div>
                </li>
            `);

            $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
            this.isDropdownMenuBubble = false;

            if (Boolean(data.message)) {
                $(`.msg-${data.idCardChat}`).append(`${data.message}`);
                $(`.space-${data.idCardChat}`).append(`
                    <hr class="bg-white">
                `);

                linkifyElement(
                    document.querySelector(`.msg-${data.idCardChat}`),
                    options
                );
            }
        }
    } else {
        await $("#listChat").prepend(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}"onmousemove="hoverBubbleChat(this)" onmouseleave="outhoverBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-formatteddate="${data.formatted_date}" data-bubbleposition="${data.classChat}" data-pinned="${data.is_pinned}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="text-msg mb-3 msg-${data.idCardChat}">${data.message}</div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="foca-${data.idCardChat}"></p>
                    </div>
                </div>
            </li>
        `);

        $(`.dropdown-bubblechat-${data.idCardChat}`).hide();
        this.isDropdownMenuBubble = false;

        linkifyElement(
            document.querySelector(`.msg-${data.idCardChat}`),
            options
        );
    }

    if (data.is_menu == "private") {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        let iconFoca = "";
        if (data.classChat == "left") {
            return (elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}">${generatePinnedElement}</span><span>${data.date}</span></div>`);
        }

        switch (data.has_read) {
            case true:
                iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                break;
            default:
                iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                break;
        }

        elFoCa.innerHTML = `
            <div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>
            ${iconFoca}
        `;
    } else {
        let elFoCa = document.querySelector(`#foca-${data.idCardChat}`);
        let iconFoca = "";
        elFoCa.innerHTML = `<div><span class="pinned-status-${data.idCardChat}"></span><span>${data.date}</span></div>`;
    }

    let elPinnedStatus = document.querySelector(
        `.pinned-status-${data.idCardChat}`
    );

    elPinnedStatus.innerHTML = generatePinnedElement;
};

/* rendering pinned message */
const renderingPinnedMessageNoFancy = async (data) => {
    let fileExtension = data.file_path.split(".");
    let exDoc = ["doc", "docx"];
    let exExcel = ["xls", "xlsx"];
    let exArchives = ["arc", "bz", "bz2", "gz", "rar", "tar", "zip", "7z"];
    if (exDoc.includes(fileExtension[1].toLowerCase())) {
        await $("#listMessagePinned").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" >
                            <div class="dropdown-bubblemessage-${data.idCardChat}"></div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/doc.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (exExcel.includes(fileExtension[1].toLowerCase())) {
        await $("#listMessagePinned").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" >
                            <div class="dropdown-bubblemessage-${data.idCardChat}"></div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/sheets.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (exArchives.includes(fileExtension[1].toLowerCase())) {
        await $("#listMessagePinned").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" >
                            <div class="dropdown-bubblemessage-${data.idCardChat}"></div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/archive.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else {
        await $("#listMessagePinned").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" >
                            <div class="dropdown-bubblemessage-${data.idCardChat}"></div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/download-file.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingListPinnedWithFancy = async (data) => {
    if (data.file_type == "image") {
        await $("#listMessagePinned").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 25%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex justify-content-center" data-fancybox="gallery" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" class="w-50" src="${data.file_url}" />
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (data.file_type == "other") {
        let fileExtension = data.file_path.split(".");
        if (fileExtension[1].toLowerCase() == "pdf") {
            await $("#listMessagePinned").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" data-fancybox data-type="pdf" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/pdf.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
        }
    } else {
        await $("#listMessagePinned").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}">
                            <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                                <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                    <i class="fas fa-chevron-down"></i>
                                </a>
                            </div>
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat}" data-fancybox-video data-download-src="${data.file_url}" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <video onmousedown="return false" id="preview-file" playsinline="true"  controls muted  style="max-width:100%" src="${data.file_url}"></video>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingListPinnedWithMeetingRoom = async (data) => {
    await $("#listMessagePinned").append(`
        <li class="left" id="cardmessage-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                            <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </div>
                        <div class="text-msg mb-0 msg-reply-${data.idCardChat} msg-reply-${data.idCardChat}">
                            <i class="fas fa-video mr-2"></i> <span>${data.meeting_url}</span>
                        </div>
                    </div>
                    <p class="chat-time text-left mb-0">${data.date}</p>
                </div>
            </div>
        </li>
    `);

    linkifyElement(
        document.querySelector(`.msg-reply-${data.idCardChat}`),
        options
    );
};

const renderListPinnedMessage = async (data) => {
    if (Boolean(data.is_meeting)) {
        return renderingListPinnedWithMeetingRoom(data);
    }

    if (data.file_path != null) {
        if (data.file_url != null) {
            let fileExtension = data.file_path.split(".");
            const fancyEx = [
                "pdf",
                "jpg",
                "gif",
                "ico",
                "jpeg",
                "png",
                "svg",
                "tif",
                "tiff",
                "webp",
                "mp4",
                "webm",
                "avi",
                "mpeg",
            ];
            if (fancyEx.includes(fileExtension[1].toLowerCase())) {
                await renderingListPinnedWithFancy(data);
                if (Boolean(data.message)) {
                    $(`.msg-pinned-${data.idCardChat}`).append(
                        `${data.message}`
                    );

                    linkifyElement(
                        document.querySelector(
                            `.msg-pinned-${data.idCardChat}`
                        ),
                        options
                    );

                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.message
                    );
                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            } else {
                renderingPinnedMessageNoFancy(data);
                if (Boolean(data.message)) {
                    $(`.msg-pinned-${data.idCardChat}`).append(
                        `${data.message}`
                    );

                    linkifyElement(
                        document.querySelector(
                            `.msg-pinned-${data.idCardChat}`
                        ),
                        options
                    );

                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.message
                    );
                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            }
        } else {
            await $("#listMessagePinned").append(`
                <li class="left" id="cardmessage-${data.idCardChat}">
                    <div class="conversation-list conversation-${data.idCardChat}">
                        <div class="ctext-wrap">
                            <div class="conversation-name text-left">${data.displayName}</div>
                            <div class="ctext-wrap-content">
                                <div class="dropdown-bubblemessage-${data.idCardChat}"></div>
                                <div class="img-fluid mb-1 d-flex justify-content-center" style="object-fit: cover;width: 100%;height: 50%;">
                                    <img onmousedown="return false" id="preview-file" class="w-100" src="assets/images/small/img-4.jpg" />
                                </div>
                                <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                            </div>
                            <p class="chat-time text-left mb-0">${data.date}</p>
                        </div>
                    </div>
                </li>
            `);
            if (Boolean(data.message)) {
                $(`.msg-pinned-${data.idCardChat}`).append(`${data.message}`);
                $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);

                linkifyElement(
                    document.querySelector(`.msg-pinned-${data.idCardChat}`),
                    options
                );
            }
        }
    } else {
        await $("#listMessagePinned").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="dropdown-bubblemessage-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}">${data.message}</div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
        linkifyElement(
            document.querySelector(`.msg-pinned-${data.idCardChat}`),
            options
        );
    }
};

/* rendering detail reply message */
const renderingDetailMessageReplyWithFancy = async (data) => {
    $("#detailReplyMessage").empty();

    if (data.parent_reply_file_type == "image") {
        await $("#detailReplyMessage").append(`
            <li class="left" >
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content >
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 25%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex justify-content-center" data-fancybox="gallery" href="${data.parent_reply_file_url}" data-toggle="tooltip" data-placement="top" title="${data.parent_reply_file_name}">
                                    <img onmousedown="return false" id="preview-file" class="w-50" src="${data.parent_reply_file_url}" />
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (data.parent_reply_file_type == "other") {
        let fileExtension = data.parent_reply_file_path.split(".");
        if (fileExtension[1].toLowerCase() == "pdf") {
            await $("#detailReplyMessage").append(`
            <li class="left">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" data-fancybox data-type="pdf" href="${data.parent_reply_file_url}" data-toggle="tooltip" data-placement="top" title="${data.parent_reply_file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/pdf.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.parent_reply_file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
        }
    } else {
        await $("#detailReplyMessage").append(`
            <li class="left">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat}" data-fancybox-video data-download-src="${data.parent_reply_file_url}" href="${data.parent_reply_file_url}" data-toggle="tooltip" data-placement="top" title="${data.parent_reply_file_name}">
                                    <video onmousedown="return false" id="preview-file" playsinline="true"  controls muted  style="max-width:100%" src="${data.parent_reply_file_url}"></video>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingDetailMessageReplyNoFancy = async (data) => {
    let fileExtension = data.parent_reply_file_path.split(".");
    let exDoc = ["doc", "docx"];
    let exExcel = ["xls", "xlsx"];
    let exArchives = ["arc", "bz", "bz2", "gz", "rar", "tar", "zip", "7z"];
    $("#detailReplyMessage").empty();
    if (exDoc.includes(fileExtension[1].toLowerCase())) {
        await $("#detailReplyMessage").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" >
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.parent_reply_file_url}" data-toggle="tooltip" data-placement="top" title="${data.parent_reply_file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/doc.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.parent_reply_file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (exExcel.includes(fileExtension[1].toLowerCase())) {
        await $("#detailReplyMessage").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" >
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.parent_reply_file_url}" data-toggle="tooltip" data-placement="top" title="${data.parent_reply_file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/sheets.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.parent_reply_file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (exArchives.includes(fileExtension[1].toLowerCase())) {
        await $("#detailReplyMessage").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" >
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.parent_reply_file_url}" data-toggle="tooltip" data-placement="top" title="${data.parent_reply_file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/archive.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.parent_reply_file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else {
        $("#detailReplyMessage").empty();
        await $("#detailReplyMessage").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content wrap-message-${data.idCardChat}" >
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.parent_reply_file_url}" data-toggle="tooltip" data-placement="top" title="${data.parent_reply_file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/download-file.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.parent_reply_file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingDetailMessageReplyWithMeetingRoom = async (data) => {
    $("#detailReplyMessage").empty();
    await $("#detailReplyMessage").append(`
        <li class="left" id="cardmessage-${data.idCardChat}">
            <div class="conversation-list conversation-${data.idCardChat}">
                <div class="ctext-wrap">
                    <div class="conversation-name text-left">${data.displayName}</div>
                    <div class="ctext-wrap-content wrap-message-${data.idCardChat}">
                        <div class="dropdown-bubblechat-${data.idCardChat} float-right">
                            <a class="pointer float-right ml-3 mb-2" onclick="showListActionBubbleChat(this)" data-bubbleid="${data.idCardChat}" data-bubbleposition="${data.classChat}" data-formatteddate="${data.formatted_date}" data-pinned="${data.is_pinned}">
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </div>
                        <div class="text-msg mb-0 msg-reply-${data.idCardChat} msg-reply-${data.idCardChat}">
                            <i class="fas fa-video mr-2"></i> <span>${data.parent_meeting_url}</span>
                        </div>
                    </div>
                    <p class="chat-time text-left mb-0">${data.date}</p>
                </div>
            </div>
        </li>
    `);
    linkifyElement(
        document.querySelector(`.msg-reply-${data.idCardChat}`),
        options
    );
};

const renderingDetailReplyMessage = async (data) => {
    if (Boolean(data.parent_is_meeting)) {
        return renderingDetailMessageReplyWithMeetingRoom(data);
    }

    if (data.parent_reply_file_path != null) {
        if (data.parent_reply_file_url != null) {
            let fileExtension = data.parent_reply_file_path.split(".");
            const fancyEx = [
                "pdf",
                "jpg",
                "gif",
                "ico",
                "jpeg",
                "png",
                "svg",
                "tif",
                "tiff",
                "webp",
                "mp4",
                "webm",
                "avi",
                "mpeg",
            ];
            if (fancyEx.includes(fileExtension[1].toLowerCase())) {
                await renderingDetailMessageReplyWithFancy(data);
                if (Boolean(data.parent_reply_message)) {
                    $(`.msg-pinned-${data.idCardChat}`).append(
                        `${data.parent_reply_message}`
                    );

                    linkifyElement(
                        document.querySelector(
                            `.msg-pinned-${data.idCardChat}`
                        ),
                        options
                    );

                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.parent_reply_message
                    );
                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            } else {
                renderingDetailMessageReplyNoFancy(data);
                if (Boolean(data.parent_reply_message)) {
                    $(`.msg-pinned-${data.idCardChat}`).append(
                        `${data.parent_reply_message}`
                    );

                    linkifyElement(
                        document.querySelector(
                            `.msg-pinned-${data.idCardChat}`
                        ),
                        options
                    );

                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.parent_reply_message
                    );

                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            }
        } else {
            $("#detailReplyMessage").empty();

            await $("#detailReplyMessage").append(`
                <li class="left" id="cardmessage-${data.idCardChat}">
                    <div class="conversation-list">
                        <div class="ctext-wrap">
                            <div class="conversation-name text-left">${data.displayName}</div>
                            <div class="ctext-wrap-content">
                                <div class="dropdown-bubblemessage-${data.idCardChat}"></div>
                                <div class="img-fluid mb-1 d-flex justify-content-center" style="object-fit: cover;width: 100%;height: 50%;">
                                    <img onmousedown="return false" id="preview-file" class="w-100" src="assets/images/small/img-4.jpg" />
                                </div>
                                <div class="text-msg mb-0 msg-pinned-${data.idCardChat}"></div>
                            </div>
                            <p class="chat-time text-left mb-0">${data.date}</p>
                        </div>
                    </div>
                </li>
            `);
            if (Boolean(data.message)) {
                $(`.msg-pinned-${data.idCardChat}`).append(
                    `${data.parent_reply_message}`
                );
                $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);

                linkifyElement(
                    document.querySelector(`.msg-pinned-${data.idCardChat}`),
                    options
                );
            }
        }
    } else {
        await $("#detailReplyMessage").append(`
            <li class="left" id="cardmessage-${data.idCardChat}">
                <div class="conversation-list conversation-${data.idCardChat}">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="dropdown-bubblemessage-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-pinned-${data.idCardChat}">${data.parent_reply_message}</div>
                        </div>
                        <p class="chat-time text-left mb-0">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
        linkifyElement(
            document.querySelector(`.msg-pinned-${data.idCardChat}`),
            options
        );
    }
};

const parseDateChatt = (valDate, parseCustom = false) => {
    if (!parseCustom) {
        return moment(valDate).fromNow();
    }

    const compareDate = dateDiff(valDate);

    if (compareDate.hoursDiff < 21) {
        if (compareDate.daysDiff > 0) {
            return changeFormatDate(valDate, "date_long_time");
        }

        if (compareDate.hoursDiff < 2) {
            return moment(valDate).fromNow();
        }

        return changeFormatDate(valDate, "time_no_seconds");
    }

    return changeFormatDate(valDate, "date_long_time");
};

const dateDiff = (param_start_date = false, param_end_date = false) => {
    let dateNow = createDate();

    let start_date = !Boolean(param_start_date)
        ? dateNow
        : moment(param_start_date).format("YYYY-MM-DD HH:mm:ss");

    let end_date = !Boolean(param_end_date)
        ? dateNow
        : moment(param_end_date).format("YYYY-MM-DD HH:mm:ss");

    let diffDate = moment.duration(moment().diff(start_date, end_date));

    return {
        yearsDiff: diffDate.years(),
        monthsDiff: diffDate.months(),
        weeksDiff: diffDate.weeks(),
        daysDiff: diffDate.days(),
        hoursDiff: diffDate.hours(),
        minutesDiff: diffDate.minutes(),
    };
};

const changeFormatDate = (valDate, request = false) => {
    let dateNow = "";
    switch (request) {
        case "time_no_seconds":
            dateNow = moment(valDate).format("HH:mm");
            break;
        case "full_time":
            dateNow = moment(valDate).format("HH:mm:ss");
            break;
        case "hours":
            dateNow = moment(valDate).format("HH");
            break;
        case "date_only":
            dateNow = moment(valDate).format("YYYY-MM-DD");
            break;
        case "year_only":
            dateNow = moment(valDate).format("YYYY");
            break;
        case "month_only":
            dateNow = moment(valDate).format("MM");
            break;
        case "day_only":
            dateNow = moment(valDate).format("DD");
            break;
        case "date_long_time":
            dateNow = moment(valDate).format("DD MMM YYYY LT");
            break;
        default:
            dateNow = moment(valDate).format("YYYY-MM-DD HH:mm:ss");
            break;
    }

    return dateNow;
};

const createDate = (request = false) => {
    let dateNow = "";
    switch (request) {
        case "time_no_seconds":
            dateNow = moment().format("HH:mm");
            break;
        case "full_time":
            dateNow = moment().format("HH:mm:ss");
            break;
        case "hours":
            dateNow = moment().format("HH");
            break;
        case "date_only":
            dateNow = moment().format("YYYY-MM-DD");
            break;
        case "year_only":
            dateNow = moment().format("YYYY");
            break;
        case "month_only":
            dateNow = moment().format("MM");
            break;
        case "day_only":
            dateNow = moment().format("DD");
            break;
        default:
            dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
            break;
    }

    return dateNow;
};

const numeringCounter = (valNumber, DigistNumber) => {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" },
    ];

    const regexVal = /\.0+$|(\.[0-9]*[1-9])0+$/;

    let item = lookup
        .slice()
        .reverse()
        .find(function (item) {
            return valNumber >= item.value;
        });

    return item
        ? (valNumber / item.value)
              .toFixed(DigistNumber)
              .replace(regexVal, "$1") + item.symbol
        : "0";
};

/* read chat */
const readChat = (chat_id, callbackFunct = false) => {
    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            chat_id,
        },
        url: `${window.base_url_live}/api/chat/agent/internal/reset-counter`,
    };
    axios(config)
        .then(async (response) => {
            const dataRes = response.data.data;
            if (Boolean(callbackFunct)) {
                let receiverData = [];

                await this.dataDetailGroupChat2.participants.forEach(
                    (valContact) => {
                        // if (valContact.agent_id != dataAuth.userIdAgent) {
                        receiverData.push(valContact.agent_id);
                        // }
                    }
                );

                const dataReadedStatus = {
                    chat_id: dataRes.chat_id,
                    receiverData,
                    dataChat: dataRes.internal_chat_replies[0],
                };

                socket.emit("updateStatusReadGroup", dataReadedStatus);
            }
        })
        .catch((error) => {
            console.warn(error);
        });
};

/* condition message in list */
const conditionMessageInList = (params) => {
    if (params.is_meeting) {
        return params.is_sender
            ? `<b class="font-weight-bold">You: Create meeting room</b>`
            : "Someone create meeting room";
    }
    let message = "";
    const regex = /<br\s*[\/]?>/gi;
    params.message = !params.message
        ? ""
        : params.message
              .replace(regex, " ")
              .replace(/^(<br>)+|(<br>)+$/g, "")
              .replace(/\s\s+/g, "")
              .replace(/&nbsp;/g, "");

    if (params.is_deleted) {
        return params.is_sender
            ? `<i class="fas fa-ban mr-1"></i> <i>You have deleted the message</i>`
            : `<i class="fas fa-ban mr-1"></i> <i>Someone delete the message</i>`;
    }

    if (params.typeMenu == "private") {
        if (params.file_path == null) {
            if (
                params.message == null ||
                params.message == "null" ||
                params.message == undefined
            ) {
                message = "";
            } else {
                message = params.is_sender
                    ? `<b class="font-weight-bold">You: </b> ${params.message}`
                    : params.message;
            }
        } else {
            let typeImg =
                params.file_type == "other" || !Boolean(params.file_type)
                    ? "file"
                    : params.file_type;
            if (params.file_url == null) {
                message = params.is_sender
                    ? `<b class="font-weight-bold">You:</b> Failed send a ${typeImg}`
                    : `Failed send a ${typeImg}`;
            } else {
                message = params.is_sender
                    ? `<b class="font-weight-bold">You:</b> Send an ${typeImg}`
                    : `send ${typeImg} to you`;
            }
        }
    } else {
        if (params.file_path == null) {
            if (
                params.message == null ||
                params.message == "null" ||
                params.message == undefined
            ) {
                message = "";
            } else {
                message = params.is_sender
                    ? `<b class="font-weight-bold">You: </b> ${params.message}`
                    : params.message;
            }
        } else {
            let typeImg =
                params.file_type == "other" || !Boolean(params.file_type)
                    ? "file"
                    : params.file_type;
            if (params.file_url == null) {
                message = params.is_sender
                    ? `<b class="font-weight-bold">You:</b> Failed send a ${typeImg}`
                    : `Someone failed send a ${typeImg}`;
            } else {
                message = params.is_sender
                    ? `<b class="font-weight-bold">You:</b> Send an ${typeImg}`
                    : `Someone send ${typeImg} to you`;
            }
        }
    }
    return message;
};

/* render suggestion list */
const renderListSuggestionMessage = (data) => {
    let id_group = !Boolean(data.id_chat_group) ? "" : data.id_chat_group;
    $("#listSuggestionMessage").append(`
        <li class="pointer contact-${data.id}" onclick="showDetailChatFromSearchMessage(this)" data-idbuble="${data.id}" data-chatid="${data.chat_id}" data-typeid="${data.chat_type}" data-idgroup="${id_group}">
            <a>
                <div class="media">
                    <div class="user-img offline align-self-center mr-3">
                        <img src="${data.display_image}" class="rounded-circle header-profile-user avatar-xs img-object-fit-cover" alt="img">
                        <span class="user-status"></span>
                    </div>
                    <div class="media-body overflow-hidden">
                        <h5 class="text-truncate font-size-14 mb-1">${data.display_name}</h5>
                        <p class="text-truncate font-size-14 mb-1">${data.message}</p>
                    </div>
                    <div class="font-size-11 mr-2">
                        <p id="date-${data.id}">${data.date}</p>
                    </div>
                </div>
            </a>
        </li>
    `);
};

/* send message */
const sendMessageWithReply = async () => {
    const inputChat = document.querySelector("[contenteditable]");

    let message = inputChat.innerHTML;
    message = message
        .replace(/^(<br>)+|(<br>)+$/g, "")
        .replace(/<div>/gi, "<br>")
        .replace(/<\/div>/gi, "");

    const dateNow = createDate();
    const parseDate = parseDateChatt(dateNow, true);

    const dataConfig = {
        message: !Boolean(message) ? "" : message,
        chat_id: this.dataDetail.chat_id,
        agent_email: dataAuth.email,
        agent_id: dataAuth.userIdAgent,
        agent_name: dataAuth.name,
        form_agent_id: dataAuth.userIdAgent,
        name: dataAuth.name,
        created_at: dateNow,
        updated_at: dateNow,
        formatted_date: dateNow,
        formatted_time: createDate("time_no_seconds"),
        is_sender: true,
        is_menu,
        id_chat: this.dataDetail.id,
        module: "is_chatCompany",
        parent: this.replyMessageId,
    };

    const dataRenderChat = {
        displayName: "Me",
        classChat: "right",
        message: message,
        date: parseDate,
        formatted_date: dateNow,
        file_name: null,
        file_url: null,
        file_type: null,
        file_path: null,
        is_pinned: false,
        is_deleted: false,
        is_menu,
        id_sender: dataAuth.userIdAgent,
        status_last: true,
    };

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
    };

    let receiverData = [];
    let profileSender = {};

    if (is_menu == "private") {
        await this.allResultPrivateChat.forEach((valContactsPrivate) => {
            if (valContactsPrivate.chat_id == this.dataDetail.chat_id) {
                dataConfig.receiver = valContactsPrivate.receiver_id;
            }
        });

        config.url = `${base_url_live}/api/chat/agent/internal/reply`;
    } else {
        await this.dataDetailGroupChat2.participants.forEach((valContact) => {
            if (valContact.agent_id != dataAuth.userIdAgent) {
                receiverData.push(valContact.agent_id);
            } else {
                profileSender = valContact;
            }
        });

        dataConfig.receiverData = receiverData;
        dataConfig.group_id = this.dataDetailGroupChat2.id;
        dataConfig.profileSender = profileSender;

        config.url = `${window.base_url_live}/api/chat/agent/internal/reply-group`;
    }

    config.data = dataConfig;
    axios(config)
        .then((response) => {
            const dataRes = response.data.data;

            this.lastBubbleId = dataRes.id;

            inputChat.innerHTML = null;
            unRenderReplyMessage();

            /* send data to another user*/
            dataConfig.id = dataRes.id;
            dataConfig.file_path = dataRes.file_path;
            dataConfig.file_type = dataRes.file_type;
            dataConfig.file_url = dataRes.file_url;
            dataConfig.file_name = dataRes.file_name;
            dataConfig.has_read = dataRes.has_read;
            dataConfig.has_read_by = dataRes.has_read_by;
            dataConfig.parent = dataRes.parent;
            dataConfig.has_parent_reply = dataRes.has_parent_reply;
            dataConfig.parent_reply_file_name = dataRes.parent_reply_file_name;
            dataConfig.parent_reply_file_path = dataRes.parent_reply_file_path;
            dataConfig.parent_reply_file_type = dataRes.parent_reply_file_type;
            dataConfig.parent_reply_file_url = dataRes.parent_reply_file_url;
            dataConfig.parent_reply_from_agent_id =
                dataRes.parent_reply_from_agent_id;
            dataConfig.parent_reply_from_agent_name =
                dataRes.parent_reply_from_agent_name;
            dataConfig.parent_reply_id = dataRes.parent_reply_id;
            dataConfig.parent_reply_message = dataRes.parent_reply_message;
            dataConfig.is_meeting = dataRes.is_meeting;
            dataConfig.meeting_url = dataRes.meeting_url;
            dataConfig.parent_is_meeting = dataRes.parent_is_meeting;
            dataConfig.parent_meeting_url = dataRes.parent_meeting_url;

            if (is_menu == "private") {
                this.dataDetail.internal_chat_replies.data.push(dataConfig);
                socket.emit("sendChatWithReply", dataConfig);

                throttleGetContactChat();
            } else {
                this.dataDetail.internal_chat_replies.data.push(dataConfig);
                dataConfig.profileSender = profileSender;
                dataConfig.receiverData = receiverData;
                socket.emit("sendChatWithReply", dataConfig);
                throttleGetGrouptChat();
            }

            /* render chat */
            dataRenderChat.file_name = dataRes.file_name;
            dataRenderChat.idCardChat = dataRes.id;
            dataRenderChat.file_path = dataRes.file_path;
            dataRenderChat.file_type = dataRes.file_type;
            dataRenderChat.id_sender = dataRes.agent_id;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.parent = dataRes.parent;
            dataRenderChat.has_parent_reply = dataRes.has_parent_reply;
            dataRenderChat.parent_reply_file_name =
                dataRes.parent_reply_file_name;
            dataRenderChat.parent_reply_file_path =
                dataRes.parent_reply_file_path;
            dataRenderChat.parent_reply_file_type =
                dataRes.parent_reply_file_type;
            dataRenderChat.parent_reply_file_url =
                dataRes.parent_reply_file_url;
            dataRenderChat.parent_reply_from_agent_id =
                dataRes.parent_reply_from_agent_id;
            dataRenderChat.parent_reply_from_agent_name =
                dataRes.parent_reply_from_agent_name;
            dataRenderChat.parent_reply_id = dataRes.parent_reply_id;
            dataRenderChat.parent_reply_message = dataRes.parent_reply_message;
            dataRenderChat.is_meeting = dataRes.is_meeting;
            dataRenderChat.meeting_url = dataRes.meeting_url;
            dataRenderChat.parent_is_meeting = dataRes.parent_is_meeting;
            dataRenderChat.parent_meeting_url = dataRes.parent_meeting_url;
            renderingDataChatting(dataRenderChat);

            setTimeout(() => {
                let el = document.getElementById(
                    `cardchat-${dataRenderChat.idCardChat}`
                );
                if (Boolean(el)) {
                    el.scrollIntoView();
                }
            }, 1000);
        })
        .catch((error) => {
            console.warn(error);
        });
};

const sendMessage = () => {
    if (!Boolean(this.replyMessage)) {
        let inputChat = document.querySelector("[contenteditable]");
        let message = inputChat.innerHTML;
        message = message
            .replace(/<div>/gi, "<br>")
            .replace(/<\/div>/gi, "")
            .replace(/^(<br>)+|(<br>)+$/g, "")
            .replace(/\s\s+/g, "")
            .replace(/&nbsp;/g, "");
        // message = message.replace(/<div>/gi, "<br>").replace(/<\/div>/gi, "");

        if (!Boolean(message)) {
            return Toast.fire({
                icon: "error",
                title: "Please type your message or send file!",
            });
        }

        const diso = new Date();
        let rdiso = diso.toISOString();
        let dateNow = createDate();
        let date = parseDateChatt(dateNow, true);
        const data = {};
        const dataRenderChat = {};
        const config = {};

        if (is_menu == "private") {
            data.message = message;
            data.name = dataAuth.name;
            data.chat_id = this.dataDetail.chat_id;
            data.receiver = this.dataDetail.receiver_id;
            // this.allResultPrivateChat.forEach((valContactsPrivate) => {
            //     if (valContactsPrivate.chat_id == this.dataDetail.chat_id) {
            //         data.receiver = valContactsPrivate.receiver_id;
            //     }
            // });

            dataRenderChat.displayName = "Me";
            dataRenderChat.classChat = "right";
            dataRenderChat.message = data.message;
            dataRenderChat.date = date;
            dataRenderChat.formatted_date = dateNow;
            dataRenderChat.file_name = null;
            dataRenderChat.file_url = null;
            dataRenderChat.file_type = null;
            dataRenderChat.file_path = null;

            config.method = "POST";
            config.headers = {
                Authorization: `Bearer ${dataAuth.token}`,
                "Content-Type": "application/json",
                "X-Requested-With": "xmlhttprequest",
            };
            config.url = `${window.base_url_live}/api/chat/agent/internal/reply`;
            config.data = data;

            axios(config)
                .then(async (response) => {
                    this.lastBubbleId = response.data.data.id;

                    inputChat.innerHTML = null;
                    unRenderReplyMessage();

                    data.module = "is_chatCompany";
                    data.agent_email = dataAuth.email;
                    data.agent_id = dataAuth.userIdAgent;
                    data.name = dataAuth.name;
                    data.created_at = rdiso;
                    data.updated_at = rdiso;
                    data.formatted_date = dateNow;
                    data.formatted_time = createDate("time_no_seconds");
                    data.id_chat = this.dataDetail.id;
                    data.form_agent_id = dataAuth.userIdAgent;
                    data.is_sender = true;
                    data.id = response.data.data.id;
                    data.has_read = response.data.data.has_read;
                    data.has_read_by = response.data.data.has_read_by;
                    this.dataDetail.internal_chat_replies.data.push(data);

                    // getContactChat();
                    throttleGetContactChat();

                    dataRenderChat.is_menu = is_menu;
                    dataRenderChat.idCardChat = response.data.data.id;
                    dataRenderChat.is_deleted = false;
                    dataRenderChat.is_pinned = false;
                    await renderingDataChatting(dataRenderChat);

                    socket.emit("sendChatPrivateToAgent", data);

                    /* scroll to bottom */
                    setTimeout(() => {
                        let el = document.getElementById(
                            `cardchat-${dataRenderChat.idCardChat}`
                        );
                        if (Boolean(el)) {
                            el.scrollIntoView();
                        }
                    }, 1000);
                })
                .catch((error) => {
                    console.warn(error);
                });
        } else {
            data.message = message;
            data.group_id = this.dataDetailGroupChat2.id;

            dataRenderChat.displayName = "Me";
            dataRenderChat.classChat = "right";
            dataRenderChat.message = message;
            dataRenderChat.date = date;
            dataRenderChat.formatted_date = dateNow;
            dataRenderChat.file_name = null;
            dataRenderChat.file_url = null;
            dataRenderChat.file_type = null;
            dataRenderChat.file_path = null;

            config.method = "POST";
            config.headers = {
                Authorization: `Bearer ${dataAuth.token}`,
                "Content-Type": "application/json",
                "X-Requested-With": "xmlhttprequest",
            };
            config.url = `${window.base_url_live}/api/chat/agent/internal/reply-group`;
            config.data = data;
            axios(config)
                .then(async (response) => {
                    this.lastBubbleId = response.data.data.id;

                    let receiverData = [];
                    let profileSender = {};
                    inputChat.innerHTML = null;
                    unRenderReplyMessage();
                    this.dataDetailGroupChat2.participants.forEach(
                        (valContact) => {
                            if (valContact.agent_id != dataAuth.userIdAgent) {
                                receiverData.push(valContact.agent_id);
                            } else {
                                profileSender = valContact;
                            }
                        }
                    );

                    data.chat_id = this.dataDetail.chat_id;
                    data.id = response.data.data.id;
                    data.has_read = response.data.data.has_read;
                    data.has_read_by = response.data.data.has_read_by;
                    data.module = "is_chatCompany";
                    data.created_at = rdiso;
                    data.updated_at = rdiso;
                    data.formatted_date = dateNow;
                    data.formatted_time = createDate("time_no_seconds");
                    data.is_sender = true;
                    data.id_chat = this.dataDetail.id;
                    data.form_agent_id = dataAuth.userIdAgent;
                    data.agent_email = dataAuth.email;
                    data.agent_id = dataAuth.userIdAgent;
                    data.agent_name = dataAuth.name;
                    this.dataDetail.internal_chat_replies.data.push(data);

                    this.lastBubbleId = response.data.data.id;

                    this.dataDetail.internal_chat_replies.data.forEach(
                        (valBubbleChat) => {
                            if (valBubbleChat.id != data.id) {
                                let classChat =
                                    valBubbleChat.is_sender == true
                                        ? "right"
                                        : "left";
                                let displayName =
                                    valBubbleChat.agent_name == dataAuth.name
                                        ? "Me"
                                        : `${valBubbleChat.agent_name}`;
                                let date = parseDateChatt(
                                    valBubbleChat.formatted_date,
                                    true
                                );
                                let elFoCa = document.querySelector(
                                    `#foca-${valBubbleChat.id}`
                                );
                                elFoCa.innerHTML = `
                                <div><span class="pinned-status-${valBubbleChat.id}"></span><span>${date}</span></div>
                                <div class="d-flex mt-2 float-${classChat}">
                                    <div class="media readed-user-${valBubbleChat.id}"></div>
                                </div>
                            `;
                            }
                        }
                    );

                    /* render chat */
                    dataRenderChat.idCardChat = response.data.data.id;
                    dataRenderChat.is_menu = is_menu;
                    dataRenderChat.has_read = response.data.data.has_read;
                    dataRenderChat.has_read_by = response.data.data.has_read_by;
                    dataRenderChat.status_last = true;
                    dataRenderChat.id_sender = data.agent_id;
                    dataRenderChat.is_deleted = false;
                    dataRenderChat.is_pinned = false;

                    renderingDataChatting(dataRenderChat);

                    // getGroupChat();
                    throttleGetGrouptChat();

                    data.profileSender = profileSender;
                    data.receiverData = receiverData;
                    socket.emit("sendChatToGroup", data);

                    setTimeout(() => {
                        let el = document.getElementById(
                            `cardchat-${dataRenderChat.idCardChat}`
                        );
                        if (Boolean(el)) {
                            el.scrollIntoView();
                        }
                    }, 1000);
                })
                .catch((error) => {
                    console.warn(error);
                });
        }
    } else {
        sendMessageWithReply();
    }
};

const sendMessageWithFileAndReply = async (message, file_id) => {
    const inputChat = document.querySelector("[contenteditable]");
    inputChat.innerHTML = null;

    const dateNow = createDate();
    const parseDate = parseDateChatt(dateNow, true);

    const dataConfig = {
        message,
        file_id,
        chat_id: this.dataDetail.chat_id,
        agent_email: dataAuth.email,
        agent_id: dataAuth.userIdAgent,
        agent_name: dataAuth.name,
        form_agent_id: dataAuth.userIdAgent,
        name: dataAuth.name,
        created_at: dateNow,
        updated_at: dateNow,
        formatted_date: dateNow,
        formatted_time: createDate("time_no_seconds"),
        is_sender: true,
        is_menu,
        id_chat: this.dataDetail.id,
        module: "is_chatCompany",
        parent: this.replyMessageId,
    };

    const dataRenderChat = {
        displayName: "Me",
        classChat: "right",
        message: message,
        date: parseDate,
        formatted_date: dateNow,
        is_pinned: false,
        is_deleted: false,
        is_menu,
        id_sender: dataAuth.userIdAgent,
        status_last: true,
    };

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
    };

    let receiverData = [];
    let profileSender = {};

    if (is_menu == "private") {
        await this.allResultPrivateChat.forEach((valContactsPrivate) => {
            if (valContactsPrivate.chat_id == this.dataDetail.chat_id) {
                dataConfig.receiver = valContactsPrivate.receiver_id;
            }
        });

        config.url = `${window.base_url_live}/api/chat/agent/internal/reply`;
    } else {
        await this.dataDetailGroupChat2.participants.forEach((valContact) => {
            if (valContact.agent_id != dataAuth.userIdAgent) {
                receiverData.push(valContact.agent_id);
            } else {
                profileSender = valContact;
            }
        });

        dataConfig.receiverData = receiverData;
        dataConfig.group_id = this.dataDetailGroupChat2.id;
        dataConfig.profileSender = profileSender;

        config.url = `${window.base_url_live}/api/chat/agent/internal/reply-group`;
    }

    config.data = dataConfig;

    axios(config)
        .then((response) => {
            const dataRes = response.data.data;

            this.lastBubbleId = dataRes.id;

            inputChat.innerHTML = null;
            unRenderReplyMessage();

            /* send data to another user*/
            dataConfig.id = dataRes.id;
            dataConfig.file_path = dataRes.file_path;
            dataConfig.file_type = dataRes.file_type;
            dataConfig.file_url = dataRes.file_url;
            dataConfig.file_name = dataRes.file_name;
            dataConfig.has_read = dataRes.has_read;
            dataConfig.has_read_by = dataRes.has_read_by;
            dataConfig.parent = dataRes.parent;
            dataConfig.has_parent_reply = dataRes.has_parent_reply;
            dataConfig.parent_reply_file_name = dataRes.parent_reply_file_name;
            dataConfig.parent_reply_file_path = dataRes.parent_reply_file_path;
            dataConfig.parent_reply_file_type = dataRes.parent_reply_file_type;
            dataConfig.parent_reply_file_url = dataRes.parent_reply_file_url;
            dataConfig.parent_reply_from_agent_id =
                dataRes.parent_reply_from_agent_id;
            dataConfig.parent_reply_from_agent_name =
                dataRes.parent_reply_from_agent_name;
            dataConfig.parent_reply_id = dataRes.parent_reply_id;
            dataConfig.parent_reply_message = dataRes.parent_reply_message;
            dataConfig.is_meeting = dataRes.is_meeting;
            dataConfig.meeting_url = dataRes.meeting_url;
            dataConfig.parent_is_meeting = dataRes.parent_is_meeting;
            dataConfig.parent_meeting_url = dataRes.parent_meeting_url;
            dataConfig.parent_is_meeting = dataRes.parent_is_meeting;
            dataConfig.parent_meeting_url = dataRes.parent_meeting_url;

            if (is_menu == "private") {
                this.dataDetail.internal_chat_replies.data.push(dataConfig);
                socket.emit("sendChatWithFileAndReply", dataConfig);

                throttleGetContactChat();
            } else {
                this.dataDetail.internal_chat_replies.data.push(dataConfig);
                dataConfig.profileSender = profileSender;
                dataConfig.receiverData = receiverData;
                socket.emit("sendChatWithFileAndReply", dataConfig);
                throttleGetGrouptChat();
            }

            /* render chat */
            dataRenderChat.file_name = dataRes.file_name;
            dataRenderChat.idCardChat = dataRes.id;
            dataRenderChat.file_path = dataRes.file_path;
            dataRenderChat.file_type = dataRes.file_type;
            dataRenderChat.id_sender = dataRes.agent_id;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.parent = dataRes.parent;
            dataRenderChat.has_parent_reply = dataRes.has_parent_reply;
            dataRenderChat.parent_reply_file_name =
                dataRes.parent_reply_file_name;
            dataRenderChat.parent_reply_file_path =
                dataRes.parent_reply_file_path;
            dataRenderChat.parent_reply_file_type =
                dataRes.parent_reply_file_type;
            dataRenderChat.parent_reply_file_url =
                dataRes.parent_reply_file_url;
            dataRenderChat.parent_reply_from_agent_id =
                dataRes.parent_reply_from_agent_id;
            dataRenderChat.parent_reply_from_agent_name =
                dataRes.parent_reply_from_agent_name;
            dataRenderChat.parent_reply_id = dataRes.parent_reply_id;
            dataRenderChat.parent_reply_message = dataRes.parent_reply_message;
            dataRenderChat.is_meeting = dataRes.is_meeting;
            dataRenderChat.meeting_url = dataRes.meeting_url;
            dataRenderChat.parent_is_meeting = dataRes.parent_is_meeting;
            dataRenderChat.parent_meeting_url = dataRes.parent_meeting_url;
            renderingDataChatting(dataRenderChat);

            setTimeout(() => {
                let el = document.getElementById(
                    `cardchat-${dataRenderChat.idCardChat}`
                );
                if (Boolean(el)) {
                    el.scrollIntoView();
                }
            }, 1000);
        })
        .catch((err) => {
            console.warn(err);
        });
};

const sendMessageWithFile = (message, file_id) => {
    if (!Boolean(this.replyMessage)) {
        const inputChat = document.querySelector("[contenteditable]");
        inputChat.innerHTML = null;

        const diso = new Date();
        let rdiso = diso.toISOString();
        let dateNow = createDate();
        let date = parseDateChatt(dateNow, true);
        const data = {};
        const dataRenderChat = {};
        const config = {};
        let receiverData = [];
        let profileSender = {};

        dataRenderChat.displayName = "Me";
        dataRenderChat.classChat = "right";
        if (message != undefined || message != null || message != "") {
            dataRenderChat.message = message;
        }
        dataRenderChat.date = date;
        dataRenderChat.formatted_date = dateNow;
        dataRenderChat.is_pinned = false;

        data.message =
            message == undefined || message == "" || message == null
                ? ""
                : message;
        data.file_id = file_id;
        data.chat_id = this.dataDetail.chat_id;

        if (is_menu == "private") {
            this.allResultPrivateChat.forEach((valContactsPrivate) => {
                if (valContactsPrivate.chat_id == this.dataDetail.chat_id) {
                    data.receiver = valContactsPrivate.receiver_id;
                }
            });
            config.url = `${window.base_url_live}/api/chat/agent/internal/reply`;
        } else {
            this.dataDetailGroupChat2.participants.forEach((valContact) => {
                if (valContact.agent_id != dataAuth.userIdAgent) {
                    receiverData.push(valContact.agent_id);
                } else {
                    profileSender = valContact;
                }
            });

            data.group_id = this.dataDetailGroupChat2.id;
            config.url = `${window.base_url_live}/api/chat/agent/internal/reply-group`;
        }

        config.method = "POST";
        config.headers = {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        };
        config.data = data;

        axios(config)
            .then(async (response) => {
                this.lastBubbleId = response.data.data.id;

                data.module = "is_chatCompany";
                data.agent_email = dataAuth.email;
                data.agent_id = dataAuth.userIdAgent;
                data.created_at = rdiso;
                data.updated_at = rdiso;
                data.formatted_date = dateNow;
                data.formatted_time = createDate("time_no_seconds");
                data.is_sender = true;
                data.id_chat = this.dataDetail.id;
                data.form_agent_id = dataAuth.userIdAgent;
                data.id = response.data.data.id;
                data.file_path = response.data.data.file_path;
                data.file_type = response.data.data.file_type;
                data.file_url = response.data.data.file_url;
                data.file_name = response.data.data.file_name;
                data.has_read = response.data.data.has_read;
                data.has_read_by = response.data.data.has_read_by;

                if (is_menu == "private") {
                    data.name = dataAuth.name;
                    this.dataDetail.internal_chat_replies.data.push(data);
                    socket.emit("sendChatFilePrivateToAgent", data);

                    // getContactChat();
                    throttleGetContactChat();
                } else {
                    this.dataDetail.internal_chat_replies.data.push(data);
                    data.agent_name = dataAuth.name;
                    data.profileSender = profileSender;
                    data.receiverData = receiverData;
                    socket.emit("sendChatFileToGroup", data);
                    // getGroupChat();
                    throttleGetGrouptChat();
                }

                dataRenderChat.file_name = response.data.data.file_name;
                dataRenderChat.idCardChat = response.data.data.id;
                dataRenderChat.file_path = response.data.data.file_path;
                dataRenderChat.file_type = response.data.data.file_type;
                dataRenderChat.id_sender = data.agent_id;
                dataRenderChat.is_menu = is_menu;
                dataRenderChat.file_url = response.data.data.file_url;
                dataRenderChat.is_deleted = false;
                renderingDataChatting(dataRenderChat);

                /* scroll to bottom */
                setTimeout(() => {
                    let el = document.getElementById(
                        `cardchat-${dataRenderChat.idCardChat}`
                    );
                    if (Boolean(el)) {
                        el.scrollIntoView();
                    }
                }, 1000);
            })
            .catch((error) => {
                console.warn(error);
            });
    } else {
        sendMessageWithFileAndReply(message, file_id);
    }
};

/* delete message */
const deleteMessage = (messageId) => {
    const listBubbleChat = this.dataDetail.internal_chat_replies.data;
    const lengthArrayBubbleChat = listBubbleChat.length - 1;

    /* declare variable is objected */
    let getDetailChat = {};
    let detailGroup = {};
    let receiverData = [];

    /* find chat */
    const findIndexMessage = _.findIndex(listBubbleChat, {
        id: messageId,
    });

    const getDetailMessage = _.find(listBubbleChat, { id: messageId });

    if (is_menu == "private") {
        getDetailChat = _.find(this.allResultPrivateChat, {
            chat_id: getDetailMessage.chat_id,
        });
    } else {
        detailGroup = this.dataDetailGroupChat2;
        detailGroup.participants.forEach((valContact) => {
            if (valContact.agent_id != dataAuth.userIdAgent) {
                receiverData.push(valContact.agent_id);
            }
        });
    }

    let elWrapMessage = document.querySelector(`.wrap-message-${messageId}`);

    const config = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            chat_id: getDetailMessage.chat_id,
            reply_id: messageId,
        },
        url: `${window.base_url_live}/api/chat/agent/internal/delete-chat-reply`,
    };

    axios(config)
        .then((response) => {
            $("#modalActionListBubbleChat").modal("hide");

            const dataRes = response.data.data;

            mediaContentDeleteParentChat(dataRes);

            elWrapMessage.removeAttribute("onmousemove");
            elWrapMessage.removeAttribute("onmouseleave");
            elWrapMessage.removeAttribute("data-bubbleid");
            elWrapMessage.removeAttribute("data-formatteddate");
            elWrapMessage.removeAttribute("data-bubbleposition");
            elWrapMessage.removeAttribute("data-pinned");

            elWrapMessage.innerHTML = `
                <div class="dropdown-bubblechat-${messageId}"></div>
                <div class="text-msg mb-0 msg-${messageId}"><i class="fas fa-ban mr-1"></i> <i>Message has been deleted</i></div>
            `;

            if (is_menu == "private") {
                dataRes.receiver_id = getDetailChat.receiver_id;
            } else {
                dataRes.receiverData = receiverData;
            }

            dataRes.is_menu = is_menu;

            socket.emit("deleteMessage", dataRes);

            listBubbleChat.forEach((valBubble) => {
                if (valBubble.id == dataRes.id) {
                    valBubble.deleted_at = dataRes.deleted_at;
                    valBubble.reply_is_deleted = dataRes.reply_is_deleted;
                    valBubble.message = "Message has been deleted";
                }
            });

            if (lengthArrayBubbleChat == findIndexMessage) {
                if (is_menu == "private") {
                    // getContactChat();
                    throttleGetContactChat();
                } else {
                    // getGroupChat();
                    throttleGetGrouptChat();
                }
            }
        })
        .catch((error) => {
            console.warn("error:", error);
        });
};

/* reply message*/
const unRenderReplyMessage = () => {
    let elContainerReplyChat = document.querySelector(".reply-chat");
    elContainerReplyChat.innerHTML = "";
    this.replyMessage = false;
    this.replyMessageId = false;
    return false;
};

const renderReplyMessage = (data) => {
    let elContainerReplyChat = document.querySelector(".reply-chat");

    this.replyMessage = true;
    this.replyMessageId = data.idCardChat;

    elContainerReplyChat.innerHTML = `
        <div class="col-12">
            <div class="media mb-1">
                <button type="button" class="close mr-2" aria-label="Close" onclick="unRenderReplyMessage()">
                    <span aria-hidden="true">&times;</span>
                </button>
                <div class="media-body overflow-hidden">
                    <h5 class="text-truncate font-size-14 mb-0">
                        ${data.displayName}
                    </h5>
                    <p class="text-truncate mb-0 message-reply-${data.idCardChat}"></p>
                </div>
                <div class="media-message-reply-${data.idCardChat}"></div>
            </div>
        </div>
    `;

    if (Boolean(data.is_meeting)) {
        let elMessageReply = document.querySelector(
            `.message-reply-${data.idCardChat}`
        );
        elMessageReply.innerHTML = data.meeting_url;

        return false;
    }

    if (!Boolean(data.file_path)) {
        let elMessageReply = document.querySelector(
            `.message-reply-${data.idCardChat}`
        );
        elMessageReply.innerHTML = data.message;

        return false;
    }

    let elMessageReply = document.querySelector(
        `.message-reply-${data.idCardChat}`
    );

    if (Boolean(data.message)) {
        elMessageReply.innerHTML = data.message;
    }

    let elMediaMessasgeReply = document.querySelector(
        `.media-message-reply-${data.idCardChat}`
    );

    if (!Boolean(data.file_url)) {
        elMediaMessasgeReply.innerHTML = `
            <a id="overview-file" class="img-chat-1054 d-flex justify-content-center" data-fancybox="gallery" href="javascript:void(0)" data-toggle="tooltip" data-placement="top" title="" data-original-title="FILE NOT FOUND!!!">
                <img class="d-flex mr-3 rounded avatar-xs header-profile-user border img-object-fit-cover bg-soft-tangerin-500"
                    onmousedown="return false" id="preview-file"
                    src="${base_url_live}/assets/images/small/img-4.jpg"
                    alt="image-reply">
            </a>
        `;
        return false;
    }

    let fileExtension = data.file_path.split(".");
    const fancyEx = [
        "pdf",
        "jpg",
        "gif",
        "ico",
        "jpeg",
        "png",
        "svg",
        "tif",
        "tiff",
        "webp",
        "mp4",
        "webm",
        "avi",
        "mpeg",
    ];

    if (fancyEx.includes(fileExtension[1].toLowerCase())) {
        if (data.file_type == "image") {
            return (elMediaMessasgeReply.innerHTML = `
                <a id="overview-file" class="img-chat-1054 d-flex justify-content-center" href="javascript:void(0)">
                    <img class="d-flex mr-3 rounded avatar-xs header-profile-user border img-object-fit-cover bg-soft-tangerin-500"
                        onmousedown="return false" id="preview-file"
                        src="${data.file_url}"
                        alt="image-reply" title="${data.file_name}">
                </a>
            `);
        }

        if (data.file_type == "other") {
            return (elMediaMessasgeReply.innerHTML = `
                <a id="overview-file" class="img-chat-1054 d-flex justify-content-center" href="javascript:void(0)">
                    <img class="d-flex mr-3 rounded avatar-xs header-profile-user border img-object-fit-cover bg-soft-tangerin-500"
                        onmousedown="return false" id="preview-file"
                        src="${base_url_live}/assets/images/icon/pdf.png"
                        alt="image-reply" title="${data.file_name}">
                </a>
            `);
        }

        if (!data.file_type.includes(["other", "image"])) {
            return (elMediaMessasgeReply.innerHTML = `
                <a id="overview-file" class="img-chat-1054 d-flex justify-content-center" href="javascript:void(0)">
                    <img class="d-flex mr-3 rounded avatar-xs header-profile-user border img-object-fit-cover bg-soft-tangerin-500"
                        onmousedown="return false" id="preview-file"
                        src="${base_url_live}/assets/images/icon/play-button-white.png"
                        alt="image-reply" title="${data.file_name}">
                </a>
            `);
        }
    } else {
        let exDoc = ["doc", "docx"];
        let exExcel = ["xls", "xlsx"];
        let exArchives = ["arc", "bz", "bz2", "gz", "rar", "tar", "zip", "7z"];
        let allFileNotAllowedExtension = [
            "doc",
            "docx",
            "xls",
            "xlsx",
            "arc",
            "bz",
            "bz2",
            "gz",
            "rar",
            "tar",
            "zip",
            "7z",
        ];

        if (exDoc.includes(fileExtension[1].toLowerCase())) {
            return (elMediaMessasgeReply.innerHTML = `
                <a id="overview-file" class="img-chat-1054 d-flex justify-content-center" href="javascript:void(0)">
                    <img class="d-flex mr-3 rounded avatar-xs header-profile-user border img-object-fit-cover bg-soft-tangerin-500"
                        onmousedown="return false" id="preview-file"
                        src="${base_url_live}/assets/images/icon/doc.png"
                        alt="image-reply" title="${data.file_name}">
                </a>
            `);
        }

        if (exExcel.includes(fileExtension[1].toLowerCase())) {
            return (elMediaMessasgeReply.innerHTML = `
                <a id="overview-file" class="img-chat-1054 d-flex justify-content-center" href="javascript:void(0)">
                    <img class="d-flex mr-3 rounded avatar-xs header-profile-user border img-object-fit-cover bg-soft-tangerin-500"
                        onmousedown="return false" id="preview-file"
                        src="${base_url_live}/assets/images/icon/sheets.png"
                        alt="image-reply" title="${data.file_name}">
                </a>
            `);
        }

        if (exArchives.includes(fileExtension[1].toLowerCase())) {
            return (elMediaMessasgeReply.innerHTML = `
                <a id="overview-file" class="img-chat-1054 d-flex justify-content-center" href="javascript:void(0)">
                    <img class="d-flex mr-3 rounded avatar-xs header-profile-user border img-object-fit-cover bg-soft-tangerin-500"
                        onmousedown="return false" id="preview-file"
                        src="${base_url_live}/assets/images/icon/archive.png"
                        alt="image-reply" title="${data.file_name}">
                </a>
            `);
        }

        if (
            !allFileNotAllowedExtension.includes(fileExtension[1].toLowerCase())
        ) {
            return (elMediaMessasgeReply.innerHTML = `
                <a id="overview-file" class="img-chat-1054 d-flex justify-content-center" href="javascript:void(0)">
                    <img class="d-flex mr-3 rounded avatar-xs header-profile-user border img-object-fit-cover bg-soft-tangerin-500"
                        onmousedown="return false" id="preview-file"
                        src="${base_url_live}/assets/images/icon/download-file.png"
                        alt="image-reply" title="${data.file_name}">
                </a>
            `);
        }
    }
};

const replyMessage = async (messageId) => {
    const listBubbleChat = this.dataDetail.internal_chat_replies.data;

    const getDetailMessage = await _.find(listBubbleChat, { id: messageId });
    let displayName = "";

    if (Boolean(getDetailMessage.agent_name)) {
        displayName =
            getDetailMessage.agent_name == dataAuth.name
                ? "Me"
                : `${getDetailMessage.agent_name}`;
    } else {
        displayName =
            getDetailMessage.name == dataAuth.name
                ? "Me"
                : `${getDetailMessage.name}`;
    }

    let dataRenderReplyChat = {
        is_menu,
        idCardChat: getDetailMessage.id,
        displayName,
        message: !Boolean(getDetailMessage.message)
            ? false
            : limitText(getDetailMessage.message, 20),
        file_path: !Boolean(getDetailMessage.file_path)
            ? false
            : getDetailMessage.file_path,
        file_type: !Boolean(getDetailMessage.file_type)
            ? false
            : getDetailMessage.file_type,
        file_url: !Boolean(getDetailMessage.file_url)
            ? false
            : getDetailMessage.file_url,
        file_name: !Boolean(getDetailMessage.file_name)
            ? false
            : getDetailMessage.file_name,
        is_meeting: getDetailMessage.is_meeting,
        meeting_url: !Boolean(getDetailMessage.meeting_url)
            ? false
            : limitText(getDetailMessage.meeting_url, 20),
    };

    await renderReplyMessage(dataRenderReplyChat);
    $("#modalActionListBubbleChat").modal("hide");
};

/* create meeting room */
const createMeetingRoom = (chat_id, group_id = false) => {
    let url = !group_id
        ? `${base_url_live}/api/chat/agent/internal/request-meeting`
        : `${base_url_live}/api/chat/agent/internal/request-meeting/group`;

    const dateNow = createDate();
    const parseDate = parseDateChatt(dateNow, true);
    let receiverData = [];
    let profileSender = {};

    const dataConfig = {
        message: null,
        chat_id: this.dataDetail.chat_id,
        agent_email: dataAuth.email,
        agent_id: dataAuth.userIdAgent,
        agent_name: dataAuth.name,
        form_agent_id: dataAuth.userIdAgent,
        name: dataAuth.name,
        created_at: dateNow,
        updated_at: dateNow,
        formatted_date: dateNow,
        formatted_time: createDate("time_no_seconds"),
        is_sender: true,
        is_menu,
        id_chat: this.dataDetail.id,
        module: "is_chatCompany",
        parent: this.replyMessageId,
    };

    const dataRenderChat = {
        displayName: "Me",
        classChat: "right",
        message: null,
        date: parseDate,
        formatted_date: dateNow,
        file_name: null,
        file_url: null,
        file_type: null,
        file_path: null,
        is_pinned: false,
        is_deleted: false,
        is_menu,
        id_sender: dataAuth.userIdAgent,
        status_last: true,
    };

    if (is_menu == "private") {
        this.allResultPrivateChat.forEach((valContactsPrivate) => {
            if (valContactsPrivate.chat_id == chat_id) {
                dataConfig.receiver = valContactsPrivate.receiver_id;
            }
        });

        dataConfig.chat_id = chat_id;
    } else {
        this.dataDetailGroupChat2.participants.forEach((valContact) => {
            if (valContact.agent_id != dataAuth.userIdAgent) {
                receiverData.push(valContact.agent_id);
            } else {
                profileSender = valContact;
            }
        });
        dataConfig.group_id = group_id;
    }

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url,
        data: dataConfig,
    };

    axios(config)
        .then((response) => {
            const dataRes = response.data.data;
            this.lastBubbleId = dataRes.id;

            unRenderReplyMessage();

            /* send data to another user*/
            dataConfig.id = dataRes.id;
            dataConfig.file_path = dataRes.file_path;
            dataConfig.file_type = dataRes.file_type;
            dataConfig.file_url = dataRes.file_url;
            dataConfig.file_name = dataRes.file_name;
            dataConfig.has_read = dataRes.has_read;
            dataConfig.has_read_by = dataRes.has_read_by;
            dataConfig.parent = dataRes.parent;
            dataConfig.has_parent_reply = dataRes.has_parent_reply;
            dataConfig.parent_reply_file_name = dataRes.parent_reply_file_name;
            dataConfig.parent_reply_file_path = dataRes.parent_reply_file_path;
            dataConfig.parent_reply_file_type = dataRes.parent_reply_file_type;
            dataConfig.parent_reply_file_url = dataRes.parent_reply_file_url;
            dataConfig.parent_reply_from_agent_id =
                dataRes.parent_reply_from_agent_id;
            dataConfig.parent_reply_from_agent_name =
                dataRes.parent_reply_from_agent_name;
            dataConfig.parent_reply_id = dataRes.parent_reply_id;
            dataConfig.parent_reply_message = dataRes.parent_reply_message;
            dataConfig.is_meeting = dataRes.is_meeting;
            dataConfig.meeting_url = dataRes.meeting_url;
            dataConfig.parent_is_meeting = dataRes.parent_is_meeting;
            dataConfig.parent_meeting_url = dataRes.parent_meeting_url;

            if (is_menu == "private") {
                this.dataDetail.internal_chat_replies.data.push(dataConfig);
                socket.emit("sendChatWithMeetingRoom", dataConfig);

                throttleGetContactChat();
            } else {
                this.dataDetail.internal_chat_replies.data.push(dataConfig);
                dataConfig.profileSender = profileSender;
                dataConfig.receiverData = receiverData;
                socket.emit("sendChatWithMeetingRoom", dataConfig);
                throttleGetGrouptChat();
            }

            /* render chat */
            dataRenderChat.file_name = dataRes.file_name;
            dataRenderChat.idCardChat = dataRes.id;
            dataRenderChat.file_path = dataRes.file_path;
            dataRenderChat.file_type = dataRes.file_type;
            dataRenderChat.id_sender = dataRes.agent_id;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.file_url = dataRes.file_url;
            dataRenderChat.parent = dataRes.parent;
            dataRenderChat.has_parent_reply = dataRes.has_parent_reply;
            dataRenderChat.parent_reply_file_name =
                dataRes.parent_reply_file_name;
            dataRenderChat.parent_reply_file_path =
                dataRes.parent_reply_file_path;
            dataRenderChat.parent_reply_file_type =
                dataRes.parent_reply_file_type;
            dataRenderChat.parent_reply_file_url =
                dataRes.parent_reply_file_url;
            dataRenderChat.parent_reply_from_agent_id =
                dataRes.parent_reply_from_agent_id;
            dataRenderChat.parent_reply_from_agent_name =
                dataRes.parent_reply_from_agent_name;
            dataRenderChat.parent_reply_id = dataRes.parent_reply_id;
            dataRenderChat.parent_reply_message = dataRes.parent_reply_message;
            dataRenderChat.is_meeting = dataRes.is_meeting;
            dataRenderChat.meeting_url = dataRes.meeting_url;
            dataRenderChat.parent_is_meeting = dataRes.parent_is_meeting;
            dataRenderChat.parent_meeting_url = dataRes.parent_meeting_url;
            renderingDataChatting(dataRenderChat);

            setTimeout(() => {
                let el = document.getElementById(
                    `cardchat-${dataRenderChat.idCardChat}`
                );
                if (Boolean(el)) {
                    el.scrollIntoView();
                }
            }, 1000);
        })
        .catch((err) => {
            console.warn(err);
        });
};

/* pin unpin message */
const pinUnpinMessage = (messageId, isPinned) => {
    const urlAction = isPinned
        ? `${base_url_live}/api/chat/agent/internal/unpin-message`
        : `${base_url_live}/api/chat/agent/internal/pin-message`;

    const listBubbleChat = this.dataDetail.internal_chat_replies.data;

    /* declare variable is objected */
    let getDetailChat = {};
    let detailGroup = {};
    let receiverData = [];

    const getDetailMessage = _.find(listBubbleChat, { id: messageId });

    if (is_menu == "private") {
        getDetailChat = _.find(this.allResultPrivateChat, {
            chat_id: getDetailMessage.chat_id,
        });
    } else {
        detailGroup = this.dataDetailGroupChat2;
        detailGroup.participants.forEach((valContact) => {
            if (valContact.agent_id != dataAuth.userIdAgent) {
                receiverData.push(valContact.agent_id);
            }
        });
    }

    let elWrapMessage = document.querySelector(`.wrap-message-${messageId}`);
    let elPinnedStatus = document.querySelector(`.pinned-status-${messageId}`);

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            chat_id: getDetailMessage.chat_id,
            reply_id: messageId,
        },
        url: urlAction,
    };

    axios(config)
        .then((response) => {
            const dataRes = response.data.data;

            $("#modalActionListBubbleChat").modal("hide");

            elWrapMessage.removeAttribute("data-pinned");
            elWrapMessage.setAttribute("data-pinned", dataRes.is_pinned);

            if (is_menu == "private") {
                dataRes.receiver_id = getDetailChat.receiver_id;
            } else {
                dataRes.receiverData = receiverData;
            }

            dataRes.is_menu = is_menu;

            socket.emit("pinUnpinMessage", dataRes);

            this.dataDetail.internal_chat_replies.data.forEach(
                (valBubbleChat) => {
                    if (valBubbleChat.id == messageId) {
                        valBubbleChat.is_pinned = dataRes.is_pinned;
                    }
                }
            );

            if (dataRes.is_pinned) {
                elPinnedStatus.innerHTML = `<i class="fas fa-thumbtack mr-1"></i>`;
            } else {
                elPinnedStatus.innerHTML = ``;
            }
        })
        .catch((err) => {
            console.warn("error:", err);
        });
};

const sendAlertTyping = () => {
    let inputChat = document.querySelector("[contenteditable]");
    let msgContent = inputChat.innerHTML;
    let receiver = [];
    let emitTo = "";

    if (!Boolean(msgContent)) {
        return false;
    }

    const dataSender = {
        idChat: this.dataDetail.id,
        chat_id: this.dataDetail.chat_id,
        email: dataAuth.email,
        agent_id: dataAuth.userIdAgent,
        name: dataAuth.name,
    };

    if (is_menu == "private") {
        this.allResultPrivateChat.forEach((valContactsPrivate) => {
            if (valContactsPrivate.chat_id == this.dataDetail.chat_id) {
                receiver = valContactsPrivate.receiver_id;
            }
        });
        emitTo = "alertTypingPrivate";
    } else {
        this.dataDetailGroupChat2.participants.forEach((valContact) => {
            if (valContact.agent_id != dataAuth.userIdAgent) {
                receiver.push(valContact.agent_id);
            }
        });
        emitTo = "alertTypingGroup";
    }

    dataSender.receiver = receiver;
    socket.emit(emitTo, dataSender);
};

/* check and set cursor position contenteditable only! */
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
    // const selOffsets = getCaretPosition(elInputChatId);
    const selOffsets = elInputChatId.innerText.length;
    var textNode = elInputChatId.firstChild;
    var range = document.createRange();
    range.setStart(textNode, selOffsets);
    range.setEnd(textNode, selOffsets);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

/* title tab application */
const updateTitleApps = () => {
    let unreadPrivateChat = !Boolean(this.fullResponsePrivateChat)
        ? 0
        : this.fullResponsePrivateChat.unread_chat;

    let unreadGroupChat = !Boolean(this.fullResponseGroupChat)
        ? 0
        : this.fullResponseGroupChat.unread_chat;

    let totalUnreadChat = unreadPrivateChat + unreadGroupChat;
    let numeringFormat = numeringCounter(totalUnreadChat, 1);

    document.title =
        numeringFormat < 1
            ? titleBrowser
            : `(${numeringFormat}) ${titleBrowser}`;
};

const conditionButtonScrollToBottom = async () => {
    await $(".counter-button-scroll").empty();
    $(".counter-button-scroll").append(this.countingMessageNoRead);
    $(".counter-button-scroll").show();
};
