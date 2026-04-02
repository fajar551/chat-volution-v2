let chat_id = document.querySelector(".chat_id").value;
const tk = localStorage.getItem("tk");
const sessionName = localStorage.getItem("name");

const allowList = [
    "department_name",
    "topic_name",
    "rating",
    "first_response_time",
    "first_response_wait_duration",
    "resolve_time",
    "case_duration",
    "status_name",
    "channel_name",
];

const renderingWithFancy = async (data) => {
    if (data.file_type == "image") {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 25%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex justify-content-center" data-fancybox="gallery" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" class="w-50" src="${data.file_url}" />
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (data.file_type == "application") {
        let fileExtension = data.file_path.split(".");
        if (fileExtension[1].toLowerCase() == "pdf") {
            await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" data-fancybox data-type="pdf" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/pdf.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
        }
    } else {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat}" data-fancybox-video data-download-src="${data.file_url}" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <video onmousedown="return false" id="preview-file" playsinline="true"  controls muted  style="max-width:100%" src="${data.file_url}"></video>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
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
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/doc.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (exExcel.includes(fileExtension[1].toLowerCase())) {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/sheets.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else if (exArchives.includes(fileExtension[1].toLowerCase())) {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/archive.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    } else {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                <a id="overview-file" class="img-chat-${data.idCardChat} d-flex" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/download-file.png" />
                                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                                </a>
                            </div>
                            <div class="space-${data.idCardChat}"></div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    }
};

const renderingDataChatting = async (data) => {
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
                if (Boolean(data.message)) {
                    $(`.msg-${data.idCardChat}`).append(`${data.message}`);
                    $(`.img-chat-${data.idCardChat}`).attr(
                        "data-caption",
                        data.message
                    );
                    $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
                }
            } else {
                renderingNoFancy(data);
                if (Boolean(data.message)) {
                    $(`.msg-${data.idCardChat}`).append(`${data.message}`);
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
                    <div class="conversation-list">
                        <div class="ctext-wrap">
                            <div class="conversation-name text-left">${data.displayName}</div>
                            <div class="ctext-wrap-content">
                                <div class="img-fluid mb-1 d-flex justify-content-center" style="object-fit: cover;width: 100%;height: 50%;">
                                    <img onmousedown="return false" id="preview-file" class="w-100" src="${base_url_live}/assets/images/small/img-4.jpg" />
                                </div>
                                <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                            </div>
                            <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
                        </div>
                    </div>
                </li>
            `);
            if (Boolean(data.message)) {
                $(`.msg-${data.idCardChat}`).append(`${data.message}`);
                $(`.space-${data.idCardChat}`).append(`
                        <hr class="bg-white">
                    `);
            }
        }
    } else {
        await $("#listChat").append(`
            <li class="${data.classChat}" id="cardchat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="text-msg mb-0 msg-${data.idCardChat}">${data.message}</div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0" id="tdtm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    }
};

const parseDateChatt = (valDate) => {
    moment.updateLocale("id", {
        months: [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ],
    });
    return moment(valDate).fromNow();
};

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

const headers = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    Authorization: "Bearer " + tk,
};

const getDetailChat = () => {
    const config = {
        headers,
        method: "post",
        url: `${base_url_live}/api/chat/agent/chat-info`,
        data: {
            chat_id,
        },
    };

    axios(config)
        .then((response) => {
            const dataRes = response.data.data;
            allowList.forEach((element) => {
                let elByVal = document.querySelector(`.${element}`);
                elByVal.innerHTML = !Boolean(dataRes[element])
                    ? "-"
                    : dataRes[element];
            });

            $(".page-loader").fadeOut(300);
        })
        .catch((err) => {
            console.warn(err);
        });
};

const getBubbleChat = () => {
    const config = {
        headers,
        method: "post",
        url: `${base_url_live}/api/chat/agent/chat-details`,
        data: {
            chat_id,
        },
    };

    axios(config)
        .then(async (response) => {
            const dataRes = response.data.data;

            if (dataRes.length > 0) {
                await dataRes.forEach((valRes) => {
                    let classChat = "left";
                    let displayName = "";

                    if (valRes.id_channel == 1) {
                        if (valRes.is_sender) {
                            classChat = "right";
                            displayName = valRes.agent_email;
                        } else {
                            displayName = !valRes.id_agent
                                ? valRes.user_email
                                : valRes.agent_email;
                        }
                    } else {
                        if (valRes.is_sender) {
                            classChat = "right";
                            displayName = valRes.agent_name;
                        } else {
                            displayName = !valRes.id_agent
                                ? valRes.user_name
                                : valRes.agent_name;
                        }
                    }

                    let dataRenderChat = {
                        classChat,
                        displayName,
                        message: valRes.message,
                        date: parseDateChatt(valRes.formatted_date),
                        file_path: valRes.file_path,
                        file_name: valRes.file_name,
                        file_url: valRes.file_url,
                        file_type: valRes.file_type,
                        idCardChat: valRes.unique_id,
                    };
                    renderingDataChatting(dataRenderChat);
                });
                setTimeout(() => {
                    let countDt = dataRes.length - 1;
                    let el = document.getElementById(
                        `cardchat-${dataRes[countDt].unique_id}`
                    );
                    el.scrollIntoView();
                }, 1350);
            }
        })
        .catch((err) => {
            console.warn(err);
        });
};

$(() => {
    getDetailChat();
    getBubbleChat();
});
