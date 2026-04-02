/* sound configuration */
const button_setting = document.getElementById("soundSetting");
const urlAudio = `${base_url_live}/assets/sound/bell.mp3`;
const audio = new Audio(urlAudio);
audio.muted = true;
$("#soundSetting").empty();
$("#soundSetting").append(`
    <i class="fas fa-volume-up mr-2"></i> Turn On Sound
`);

localStorage.setItem("allowed_notif_internal_chat", 0);

const limitText = (text, count) => {
    if (text.length > count) {
        return `${text.slice(0, count)}....`;
    }

    return text.slice(0, count);
};

const checkSoundPermission = () => {
    const status_notify = localStorage.getItem("allowed_notif_internal_chat");
    if (status_notify == 0) {
        localStorage.setItem("allowed_notif_internal_chat", 1);
    } else {
        localStorage.setItem("allowed_notif_internal_chat", 0);
    }
    audio
        .play()
        .then(() => {
            const valSoundSetting = $("#soundSetting").val();
            $("#soundSetting").empty();
            if (valSoundSetting == "1") {
                audio.play().then(resetAudio);
                $("#soundSetting").append(`
                    <i class="fas fa-volume-mute mr-2"></i> Turn Off Sound
                `);
                $("#soundSetting").val("0");
            } else {
                audio.play().then(resetAudio);
                $("#soundSetting").append(`
                    <i class="fas fa-volume-up mr-2"></i> Turn On Sound
                `);
                $("#soundSetting").val("1");
            }
        })
        .catch(() => {
            $("#soundSetting").empty();
            $("#soundSetting").append(`
                <i class="fas fa-volume-up mr-2"></i> Turn On Sound
            `);
            resetAudio();
        });
};

function resetAudio() {
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
}

const notificationWithSound = () => {
    const notify_status = localStorage.getItem("allowed_notif_internal_chat");
    const urlAudio = `${base_url_live}/assets/sound/bell.mp3`;
    const audio = new Audio(urlAudio);
    if (parseInt(notify_status) == 1) {
        audio.play();
    }
};

// load notification activity group
const refreshNotification = function () {
    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url: `${window.base_url_live}/api/chat/agent/internal/get-notification`,
    };

    axios(config)
        .then(async (response) => {
            try {
                const result = response.data;
                const datas = response.data.data.list;

                if (result.data.unread_notif > 0) {
                    $(".noti-dot").show();
                } else {
                    $(".noti-dot").hide();
                }

                $("#notif-container").empty();
                datas.forEach((el) => {
                    $("#notif-container").append(`
                        <a href="" class="text-reset notification-item">
                            <div class="media">
                                <div class="avatar-xs mr-3 d-none">
                                    <span class="avatar-title bg-primary rounded-circle font-size-16">
                                        <i class="ri-shopping-cart-line"></i>
                                    </span>
                                </div>
                                <div class="media-body">
                                    <h6 class="mt-0 mb-1">${el.action}</h6>
                                    <div class="font-size-12 text-muted">
                                        <p class="mb-1">${el.description}</p>
                                        <p class="mb-0"><i class="mdi mdi-clock-outline"></i> ${parseDateChatt(
                                            el.updated_at,
                                            true
                                        )}</p>
                                    </div>
                                </div>
                            </div>
                        </a>`);
                });
            } catch (error) {
                console.warn(error);
            }
        })
        .catch((error) => {
            setTimeout(function () {
                console.warn(error);
            }, 1000);
        });
};

refreshNotification();

/* socket listener */
socket.on("refreshListPrivateChat", () => {
    // getContactChat();
    throttleGetContactChat();
});

socket.on("refreshListGroupChat", () => {
    // getGroupChat();
    throttleGetGrouptChat();
});

socket.on("universalUpdateReadBubbleChat", async (data) => {
    if (!Boolean(this.dataDetail)) {
        return false;
    } else {
        if (this.dataDetail.chat_id != data.chat_id) {
            return false;
        }
    }

    if (data.is_menu == "private") {
        let getListDataPrivate = _.filter(
            this.dataDetail.internal_chat_replies.data,
            ["is_sender", true]
        );

        getListDataPrivate.forEach((valDataRes) => {
            valDataRes.has_read_by = data.has_read_by;
            valDataRes.has_read = data.has_read;

            let elFoCa = document.querySelector(`#foca-${valDataRes.id}`);
            let iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
            let date = parseDateChatt(valDataRes.formatted_date, true);

            elFoCa.innerHTML = `
                <div><span class="pinned-status-${valDataRes.id}"></span><span>${date}</span></div>
                ${iconFoca}
            `;
        });
    } else {
        await this.dataDetail.internal_chat_replies.data.forEach((valRes) => {
            if (valRes.id == data.id_chat) {
                valRes.has_read_by = data.has_read_by;
                valRes.has_read = data.has_read;
            }

            let elFoCa = document.querySelector(`#foca-${valRes.id}`);
            let date = parseDateChatt(valRes.formatted_date, true);
            let classChat = valRes.is_sender == true ? "right" : "left";

            elFoCa.innerHTML = `
                <div><span class="pinned-status-${valRes.id}"></span><span>${date}</span></div>
                <div class="d-flex mt-2 float-${classChat}">
                    <div class="media readed-user-${valRes.id}"></div>
                </div>
            `;
        });

        let lastBubbleChat = _.last(this.dataDetail.internal_chat_replies.data);
        if (lastBubbleChat.id == data.id_chat) {
            let elListRead = document.querySelector(
                `.readed-user-${data.id_chat}`
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
    }
});

socket.on("receiveAlertTypingPrivate", (data) => {
    if (!Boolean(this.dataDetail)) {
        return false;
    } else {
        if (this.dataDetail.chat_id != data.chat_id) {
            return false;
        }
    }

    let timeOutSuggestion;
    $(".alert-typing").show();
    $(".from-typing-name").text(data.name);
    clearTimeout(timeOutSuggestion);
    timeOutSuggestion = setTimeout(() => {
        $(".alert-typing").hide();
    }, 6000);
});

socket.on("statusReadedPrivateChat", (data) => {
    if (!Boolean(this.dataDetail)) {
        return false;
    } else {
        if (this.dataDetail.chat_id != data.chat_id) {
            return false;
        }
    }

    let getListDataPrivate = _.filter(
        this.dataDetail.internal_chat_replies.data,
        ["is_sender", true]
    );

    getListDataPrivate.forEach((valDataRes) => {
        valDataRes.has_read_by = data.has_read_by;
        valDataRes.has_read = data.has_read;

        let elFoCa = document.querySelector(`#foca-${valDataRes.id}`);
        let iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
        let date = parseDateChatt(valDataRes.formatted_date, true);

        let generatePinnedElement = valDataRes.is_pinned
            ? `<i class="fas fa-thumbtack mr-1"></i>`
            : "";

        elFoCa.innerHTML = `
            <div>
                <span class="pinned-status-${valDataRes.id}">${generatePinnedElement}</span><span>${date}</span>
            </div>
            ${iconFoca}
        `;
    });
});

socket.on("receive_message_private", async (data) => {
    const hasReadBy = [
        {
            avatar: dataAuth.avatar,
            name: dataAuth.name,
            email: dataAuth.email,
            id_agent: dataAuth.userIdAgent,
            has_read: true,
            read_date: createDate(),
        },
    ];

    const dataUpdateStatusBubble = {
        has_read_by: hasReadBy,
        is_menu,
        has_read: true,
        receiver_id: data.dataMessage.agent_id,
        chat_id: data.dataMessage.chat_id,
    };

    if (this.dataDetail != undefined) {
        if (this.dataDetail.chat_id == data.dataMessage.chat_id) {
            let valDateNow = createDate();
            let date = parseDateChatt(valDateNow, true);
            let dataRender = {
                classChat: "left",
                displayName: data.dataMessage.name,
                date,
                formatted_date: valDateNow,
                idCardChat: data.dataMessage.id,
                message: data.dataMessage.message,
                file_name: null,
                file_url: null,
                file_path: null,
                file_type: null,
                has_read: data.dataMessage.has_read,
                has_read_by: data.dataMessage.has_read_by,
                is_deleted: false,
                is_pinned: false,
            };

            readChat(data.dataMessage.chat_id);
            socket.emit("updateStatusReadPrivate", dataUpdateStatusBubble);

            await renderingDataChatting(dataRender);
            /* scroll to bottom */
            // setTimeout(() => {
            //     let arrKeyRequest =
            //         this.dataDetail.internal_chat_replies.data.length - 1;
            //     let el = document.getElementById(
            //         `cardchat-${this.dataDetail.internal_chat_replies.data[arrKeyRequest].id}`
            //     );
            //     if (Boolean(el)) {
            //         el.scrollIntoView();
            //     }
            // }, 1000);

            this.lastBubbleId = data.dataMessage.id;

            if (!Boolean(this.isScrollingTop)) {
                setTimeout(() => {
                    let elFoca = document.getElementById(
                        `foca-${data.dataMessage.id}`
                    );

                    if (Boolean(elFoca)) {
                        elFoca.scrollIntoView();
                    }
                }, 1000);
            } else {
                let countingReceiveMessage = isNaN(this.countingMessageNoRead)
                    ? 0
                    : this.countingMessageNoRead;
                this.countingMessageNoRead = countingReceiveMessage + 1;

                conditionButtonScrollToBottom();
            }

            let dataChatInternalReplies = {
                name: data.dataMessage.name,
                message: data.dataMessage.message,
                chat_id: data.dataMessage.chat_id,
                agent_email: data.dataMessage.agent_email,
                agent_id: data.dataMessage.agent_id,
                name: data.dataMessage.name,
                created_at: data.dataMessage.created_at,
                updated_at: data.dataMessage.updated_at,
                formatted_date: valDateNow,
                formatted_time: createDate("time_no_seconds"),
                id_chat: data.dataMessage.id_chat,
                form_agent_id: data.dataMessage.form_agent_id,
                is_sender: false,
                id: data.dataMessage.id,
                has_read: data.dataMessage.has_read,
                has_read_by: data.dataMessage.has_read_by,
            };
            this.dataDetail.internal_chat_replies.data.push(
                dataChatInternalReplies
            );
        }
    }
    notificationWithSound();
    // getContactChat();
    throttleGetContactChat();
});

socket.on("receive_message_private_file", async (data) => {
    let dateNow = createDate();
    let date = parseDateChatt(dateNow, true);

    const hasReadBy = [
        {
            avatar: dataAuth.avatar,
            name: dataAuth.name,
            email: dataAuth.email,
            id_agent: dataAuth.userIdAgent,
            has_read: true,
            read_date: dateNow,
        },
    ];

    const dataUpdateStatusBubble = {
        has_read_by: hasReadBy,
        is_menu,
        has_read: true,
        receiver_id: data.dataMessage.agent_id,
        chat_id: data.dataMessage.chat_id,
    };

    if (this.dataDetail != undefined) {
        if (this.dataDetail.chat_id == data.dataMessage.chat_id) {
            let dataRender = {
                classChat: "left",
                displayName: data.dataMessage.name,
                date,
                formatted_date: dateNow,
                idCardChat: data.dataMessage.id,
                message: data.dataMessage.message,
                file_path: data.dataMessage.file_path,
                file_url: data.dataMessage.file_url,
                file_type: data.dataMessage.file_type,
                file_id: data.dataMessage.file_id,
                file_name: data.dataMessage.file_name,
                has_read: data.dataMessage.has_read,
                has_read_by: data.dataMessage.has_read_by,
                is_deleted: false,
                is_pinned: false,
            };

            readChat(data.dataMessage.chat_id);
            socket.emit("updateStatusReadPrivate", dataUpdateStatusBubble);

            await renderingDataChatting(dataRender);

            /* scroll to bottom */
            // setTimeout(() => {
            //     let arrKeyRequest =
            //         this.dataDetail.internal_chat_replies.data.length - 1;
            //     let el = document.getElementById(
            //         `cardchat-${this.dataDetail.internal_chat_replies.data[arrKeyRequest].id}`
            //     );
            //     if (Boolean(el)) {
            //         el.scrollIntoView();
            //     }
            // }, 1000);

            this.lastBubbleId = data.dataMessage.id;

            if (!Boolean(this.isScrollingTop)) {
                setTimeout(() => {
                    let elFoca = document.getElementById(
                        `foca-${data.dataMessage.id}`
                    );

                    if (Boolean(elFoca)) {
                        elFoca.scrollIntoView();
                    }
                }, 1000);
            } else {
                let countingReceiveMessage = isNaN(this.countingMessageNoRead)
                    ? 0
                    : this.countingMessageNoRead;
                this.countingMessageNoRead = countingReceiveMessage + 1;

                conditionButtonScrollToBottom();
            }

            let dataChatInternalReplies = {
                name: data.dataMessage.name,
                message: data.dataMessage.message,
                chat_id: data.dataMessage.chat_id,
                agent_email: data.dataMessage.agent_email,
                agent_id: data.dataMessage.agent_id,
                name: data.dataMessage.name,
                created_at: data.dataMessage.created_at,
                updated_at: data.dataMessage.updated_at,
                formatted_date: dateNow,
                formatted_time: createDate("time_no_seconds"),
                id_chat: data.dataMessage.id_chat,
                form_agent_id: data.dataMessage.form_agent_id,
                is_sender: false,
                id: data.dataMessage.id,
                file_path: data.dataMessage.file_path,
                file_url: data.dataMessage.file_url,
                file_type: data.dataMessage.file_type,
                file_id: data.dataMessage.file_id,
                file_name: data.dataMessage.file_name,
            };
            this.dataDetail.internal_chat_replies.data.push(
                dataChatInternalReplies
            );
        }
    }
    notificationWithSound();
    // getContactChat();
    throttleGetContactChat();
});

socket.on("receiveAlertTypingGroup", async (data) => {
    if (!Boolean(this.dataDetail)) {
        return false;
    } else {
        if (this.dataDetail.chat_id != data.chat_id) {
            return false;
        }
    }

    let dtArray = {};
    let agentName = "";
    let timeOutSuggestion;

    let agentIdExist = dataTypingGroup.find(
        (item) => parseInt(item.agent_id) == parseInt(data.agent_id)
    );

    if (!Boolean(agentIdExist)) {
        dataTypingGroup.push(data);
    }

    if (dataTypingGroup.length < 3) {
        await dataTypingGroup.forEach((valTG) => {
            if (agentName == "") {
                agentName += splitName(valTG.name);
            } else {
                agentName += ` and ${splitName(valTG.name)}`;
            }
        });
    } else {
        agentName = "Many people";
    }

    if ($("#alert-detect").is(":visible")) {
        $(".alert-typing").show();
        $("#alert-detect").show();
        $(".from-typing-name").text(agentName);
    }

    setTimeout(() => {
        $(".alert-typing").hide();
        dataTypingGroup = [];
        $("#alert-detect").hide();
    }, 3000);
});

socket.on("statusReadedGroupChat", async (data) => {
    if (!Boolean(this.dataDetail)) {
        return false;
    }

    if (this.dataDetail.chat_id != data.chat_id) {
        return false;
    }

    await this.dataDetail.internal_chat_replies.data.forEach(
        (valBubbleChat) => {
            valBubbleChat.has_read = data.dataChat.has_read;
            valBubbleChat.has_read_by = data.dataChat.has_read_by;

            let generatePinnedElement = valBubbleChat.is_pinned
                ? `<i class="fas fa-thumbtack mr-1"></i>`
                : "";

            let elFoCa = document.querySelector(`#foca-${valBubbleChat.id}`);
            let date = parseDateChatt(valBubbleChat.formatted_date, true);
            let classChat = valBubbleChat.is_sender == true ? "right" : "left";

            elFoCa.innerHTML = `
                <div><span class="pinned-status-${valBubbleChat.id}">${generatePinnedElement}</span><span>${date}</span></div>
                <div class="d-flex mt-2 float-${classChat}">
                    <div class="media readed-user-${valBubbleChat.id}"></div>
                </div>
            `;
        }
    );

    let lastBubbleChat = _.last(this.dataDetail.internal_chat_replies.data);
    let elListReadLatest = document.querySelector(
        `.readed-user-${lastBubbleChat.id}`
    );

    let listUserReaded = "";
    await lastBubbleChat.has_read_by.forEach((value) => {
        if (parseInt(lastBubbleChat.agent_id) != value.id_agent) {
            listUserReaded += `
                <div class="user-img online align-self-center">
                    <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                </div>
            `;
        }
    });

    elListReadLatest.innerHTML = `${listUserReaded}`;
    this.lastBubbleId = lastBubbleChat.id;

    if (!Boolean(this.isScrollingTop)) {
        setTimeout(() => {
            if (Boolean(elListReadLatest)) {
                elListReadLatest.scrollIntoView();
            }
        }, 1000);
    }
});

socket.on("receive_message_group", async (data) => {
    let dateNow = createDate();
    let date = parseDateChatt(dateNow, true);

    if (this.dataDetail != undefined) {
        if (this.dataDetail.chat_id == data.chat_id) {
            let dataRender = {
                classChat: "left",
                displayName: data.agent_name,
                date,
                formatted_date: dateNow,
                idCardChat: data.id,
                message: data.message,
                id_sender: parseInt(data.agent_id),
                idCardChat: data.id,
                file_name: null,
                file_url: null,
                file_path: null,
                file_type: null,
                is_deleted: false,
                is_pinned: false,
            };

            let dataChatInternalReplies = {
                agent_name: data.agent_name,
                agent_email: data.agent_email,
                agent_id: data.agent_id,
                message: data.message,
                chat_id: data.chat_id,
                created_at: data.created_at,
                updated_at: data.updated_at,
                formatted_date: dateNow,
                formatted_time: createDate("time_no_seconds"),
                id_chat: data.id_chat,
                form_agent_id: data.form_agent_id,
                is_sender: false,
                id: data.id,
                id_chat: data.id_chat,
            };
            this.dataDetail.internal_chat_replies.data.push(
                dataChatInternalReplies
            );

            renderingDataChatting(dataRender);

            readChat(data.chat_id, true);

            this.lastBubbleId = data.id;

            if (!Boolean(this.isScrollingTop)) {
                setTimeout(() => {
                    let elFoca = document.getElementById(`foca-${data.id}`);

                    if (Boolean(elFoca)) {
                        elFoca.scrollIntoView();
                    }
                }, 1000);
            } else {
                let countingReceiveMessage = isNaN(this.countingMessageNoRead)
                    ? 0
                    : this.countingMessageNoRead;
                this.countingMessageNoRead = countingReceiveMessage + 1;

                conditionButtonScrollToBottom();
            }

            /* scroll to bottom */
            // setTimeout(() => {
            //     let arrKeyRequest =
            //         this.dataDetail.internal_chat_replies.data.length - 1;
            //     let el = document.getElementById(
            //         `cardchat-${this.dataDetail.internal_chat_replies.data[arrKeyRequest].id}`
            //     );
            //     if (Boolean(el)) {
            //         el.scrollIntoView();
            //     }
            // }, 1000);
        }
    }
    notificationWithSound();

    // getGroupChat();
    throttleGetGrouptChat();
});

socket.on("receive_message_group_file", async (data) => {
    let dateNow = createDate();
    let date = parseDateChatt(dateNow, true);

    if (this.dataDetail != undefined) {
        if (this.dataDetail.chat_id == data.chat_id) {
            let dataRender = {
                classChat: "left",
                displayName: data.agent_name,
                date,
                formatted_date: dateNow,
                id_sender: parseInt(data.agent_id),
                idCardChat: data.id,
                message: data.message,
                idCardChat: data.id,
                file_path: data.file_path,
                file_url: data.file_url,
                file_type: data.file_type,
                file_id: data.file_id,
                file_name: data.file_name,
                is_deleted: false,
                is_pinned: false,
            };

            let dataChatInternalReplies = {
                agent_name: data.agent_name,
                agent_email: data.agent_email,
                agent_id: data.agent_id,
                message: data.message,
                chat_id: data.chat_id,
                created_at: data.created_at,
                updated_at: data.updated_at,
                formatted_date: dateNow,
                formatted_time: createDate("time_no_seconds"),
                id_chat: data.id_chat,
                form_agent_id: data.form_agent_id,
                is_sender: false,
                id: data.id,
                id_chat: data.id_chat,
                file_path: data.file_path,
                file_url: data.file_url,
                file_type: data.file_type,
                file_id: data.file_id,
                file_name: data.file_name,
            };

            this.dataDetail.internal_chat_replies.data.push(
                dataChatInternalReplies
            );

            renderingDataChatting(dataRender);
            readChat(data.chat_id, true);

            this.lastBubbleId = data.id;

            if (!Boolean(this.isScrollingTop)) {
                setTimeout(() => {
                    let elFoca = document.getElementById(`foca-${data.id}`);

                    if (Boolean(elFoca)) {
                        elFoca.scrollIntoView();
                    }
                }, 1000);
            } else {
                let countingReceiveMessage = isNaN(this.countingMessageNoRead)
                    ? 0
                    : this.countingMessageNoRead;
                this.countingMessageNoRead = countingReceiveMessage + 1;

                conditionButtonScrollToBottom();
            }

            /* scroll to bottom */
            // setTimeout(() => {
            //     let arrKeyRequest =
            //         this.dataDetail.internal_chat_replies.data.length - 1;
            //     let el = document.getElementById(
            //         `cardchat-${this.dataDetail.internal_chat_replies.data[arrKeyRequest].id}`
            //     );
            //     if (Boolean(el)) {
            //         el.scrollIntoView();
            //     }
            // }, 1000);
        }
    }
    notificationWithSound();
    // getGroupChat();
    throttleGetGrouptChat();
});

socket.on("receive_message_with_reply", async (data) => {
    let dateNow = createDate();
    let date = parseDateChatt(dateNow, true);

    if (Boolean(this.dataDetail)) {
        if (data.chat_id == this.dataDetail.chat_id) {
            let dataRender = {
                classChat: "left",
                is_menu,
                id_sender: data.agent_id,
                idCardChat: data.id,
                displayName: data.name,
                message: data.message,
                date,
                formatted_date: dateNow,
                file_path: data.file_path,
                file_type: data.file_type,
                file_url: data.file_url,
                file_name: data.file_name,
                has_read: data.has_read,
                has_read_by: data.has_read_by,
                is_deleted: false,
                is_pinned: false,
                parent: data.parent,
                has_parent_reply: data.has_parent_reply,
                parent_reply_file_name: data.parent_reply_file_name,
                parent_reply_file_path: data.parent_reply_file_path,
                parent_reply_file_type: data.parent_reply_file_type,
                parent_reply_file_url: data.parent_reply_file_url,
                parent_reply_from_agent_id: data.parent_reply_from_agent_id,
                parent_reply_from_agent_name: data.parent_reply_from_agent_name,
                parent_reply_id: data.parent_reply_id,
                parent_reply_message: data.parent_reply_message,
                parent_is_meeting: data.parent_is_meeting,
                parent_meeting_url: data.parent_meeting_url,
                is_meeting: data.is_meeting,
                meeting_url: data.meeting_url,
            };

            readChat(data.chat_id, data.is_menu == "private" ? false : true);
            if (data.is_menu == "private") {
                const hasReadBy = [
                    {
                        avatar: dataAuth.avatar,
                        name: dataAuth.name,
                        email: dataAuth.email,
                        id_agent: dataAuth.userIdAgent,
                        has_read: true,
                        read_date: dateNow,
                    },
                ];

                const dataUpdateStatusBubble = {
                    has_read_by: hasReadBy,
                    is_menu,
                    has_read: true,
                    receiver_id: data.agent_id,
                    chat_id: data.chat_id,
                };
                socket.emit("updateStatusReadPrivate", dataUpdateStatusBubble);
            }

            let dataChatInternalReplies = {
                agent_name: data.agent_name,
                agent_email: data.agent_email,
                agent_id: data.agent_id,
                message: data.message,
                chat_id: data.chat_id,
                created_at: data.created_at,
                updated_at: data.updated_at,
                date,
                formatted_date: dateNow,
                formatted_time: createDate("time_no_seconds"),
                id_chat: data.id_chat,
                form_agent_id: data.form_agent_id,
                is_sender: false,
                id: data.id,
                id_chat: data.id_chat,
                is_deleted: false,
                is_pinned: false,
                parent: data.parent,
                has_parent_reply: data.has_parent_reply,
                parent_reply_file_name: data.parent_reply_file_name,
                parent_reply_file_path: data.parent_reply_file_path,
                parent_reply_file_type: data.parent_reply_file_type,
                parent_reply_file_url: data.parent_reply_file_url,
                parent_reply_from_agent_id: data.parent_reply_from_agent_id,
                parent_reply_from_agent_name: data.parent_reply_from_agent_name,
                parent_reply_id: data.parent_reply_id,
                parent_reply_message: data.parent_reply_message,
                parent_is_meeting: data.parent_is_meeting,
                parent_meeting_url: data.parent_meeting_url,
                is_meeting: data.is_meeting,
                meeting_url: data.meeting_url,
            };
            this.dataDetail.internal_chat_replies.data.push(
                dataChatInternalReplies
            );

            await renderingDataChatting(dataRender);

            this.lastBubbleId = data.id;

            if (!Boolean(this.isScrollingTop)) {
                setTimeout(() => {
                    let elFoca = document.getElementById(`foca-${data.id}`);

                    if (Boolean(elFoca)) {
                        elFoca.scrollIntoView();
                    }
                }, 1000);
            } else {
                let countingReceiveMessage = isNaN(this.countingMessageNoRead)
                    ? 0
                    : this.countingMessageNoRead;
                this.countingMessageNoRead = countingReceiveMessage + 1;

                conditionButtonScrollToBottom();
            }

            // setTimeout(() => {
            //     let arrKeyRequest =
            //         this.dataDetail.internal_chat_replies.data.length - 1;
            //     let el = document.getElementById(
            //         `cardchat-${this.dataDetail.internal_chat_replies.data[arrKeyRequest].id}`
            //     );
            //     if (Boolean(el)) {
            //         el.scrollIntoView();
            //     }
            // }, 1000);
        }
    }
});

socket.on("receive_message_with_file_and_reply", async (data) => {
    let dateNow = createDate();
    let date = parseDateChatt(dateNow, true);

    if (Boolean(this.dataDetail)) {
        if (data.chat_id == this.dataDetail.chat_id) {
            let dataRender = {
                classChat: "left",
                is_menu,
                id_sender: data.agent_id,
                idCardChat: data.id,
                displayName: data.name,
                message: data.message,
                date,
                formatted_date: dateNow,
                file_path: data.file_path,
                file_type: data.file_type,
                file_url: data.file_url,
                file_name: data.file_name,
                has_read: data.has_read,
                has_read_by: data.has_read_by,
                is_deleted: false,
                is_pinned: false,
                parent: data.parent,
                has_parent_reply: data.has_parent_reply,
                parent_reply_file_name: data.parent_reply_file_name,
                parent_reply_file_path: data.parent_reply_file_path,
                parent_reply_file_type: data.parent_reply_file_type,
                parent_reply_file_url: data.parent_reply_file_url,
                parent_reply_from_agent_id: data.parent_reply_from_agent_id,
                parent_reply_from_agent_name: data.parent_reply_from_agent_name,
                parent_reply_id: data.parent_reply_id,
                parent_reply_message: data.parent_reply_message,
                parent_is_meeting: data.parent_is_meeting,
                parent_meeting_url: data.parent_meeting_url,
                is_meeting: data.is_meeting,
                meeting_url: data.meeting_url,
            };

            readChat(data.chat_id, data.is_menu == "private" ? false : true);
            if (data.is_menu == "private") {
                const hasReadBy = [
                    {
                        avatar: dataAuth.avatar,
                        name: dataAuth.name,
                        email: dataAuth.email,
                        id_agent: dataAuth.userIdAgent,
                        has_read: true,
                        read_date: dateNow,
                    },
                ];

                const dataUpdateStatusBubble = {
                    has_read_by: hasReadBy,
                    is_menu,
                    has_read: true,
                    receiver_id: data.agent_id,
                    chat_id: data.chat_id,
                };
                socket.emit("updateStatusReadPrivate", dataUpdateStatusBubble);
            }

            let dataChatInternalReplies = {
                agent_name: data.agent_name,
                agent_email: data.agent_email,
                agent_id: data.agent_id,
                message: data.message,
                chat_id: data.chat_id,
                created_at: data.created_at,
                updated_at: data.updated_at,
                date,
                formatted_date: dateNow,
                formatted_time: createDate("time_no_seconds"),
                id_chat: data.id_chat,
                form_agent_id: data.form_agent_id,
                is_sender: false,
                id: data.id,
                id_chat: data.id_chat,
                is_deleted: false,
                is_pinned: false,
                parent: data.parent,
                has_parent_reply: data.has_parent_reply,
                parent_reply_file_name: data.parent_reply_file_name,
                parent_reply_file_path: data.parent_reply_file_path,
                parent_reply_file_type: data.parent_reply_file_type,
                parent_reply_file_url: data.parent_reply_file_url,
                parent_reply_from_agent_id: data.parent_reply_from_agent_id,
                parent_reply_from_agent_name: data.parent_reply_from_agent_name,
                parent_reply_id: data.parent_reply_id,
                parent_reply_message: data.parent_reply_message,
                parent_is_meeting: data.parent_is_meeting,
                parent_meeting_url: data.parent_meeting_url,
                is_meeting: data.is_meeting,
                meeting_url: data.meeting_url,
            };
            this.dataDetail.internal_chat_replies.data.push(
                dataChatInternalReplies
            );

            await renderingDataChatting(dataRender);

            this.lastBubbleId = data.id;

            if (!Boolean(this.isScrollingTop)) {
                setTimeout(() => {
                    let elFoca = document.getElementById(`foca-${data.id}`);

                    if (Boolean(elFoca)) {
                        elFoca.scrollIntoView();
                    }
                }, 1000);
            } else {
                let countingReceiveMessage = isNaN(this.countingMessageNoRead)
                    ? 0
                    : this.countingMessageNoRead;
                this.countingMessageNoRead = countingReceiveMessage + 1;

                conditionButtonScrollToBottom();
            }
            // setTimeout(() => {
            //     let arrKeyRequest =
            //         this.dataDetail.internal_chat_replies.data.length - 1;
            //     let el = document.getElementById(
            //         `cardchat-${this.dataDetail.internal_chat_replies.data[arrKeyRequest].id}`
            //     );
            //     if (Boolean(el)) {
            //         el.scrollIntoView();
            //     }
            // }, 1000);
        }
    }
});

socket.on("receive_message_with_meeting_room", async (data) => {
    let dateNow = createDate();
    let date = parseDateChatt(dateNow, true);

    if (Boolean(this.dataDetail)) {
        if (data.chat_id == this.dataDetail.chat_id) {
            let dataRender = {
                classChat: "left",
                is_menu,
                id_sender: data.agent_id,
                idCardChat: data.id,
                displayName: data.name,
                message: data.message,
                date,
                formatted_date: dateNow,
                file_path: data.file_path,
                file_type: data.file_type,
                file_url: data.file_url,
                file_name: data.file_name,
                has_read: data.has_read,
                has_read_by: data.has_read_by,
                is_deleted: false,
                is_pinned: false,
                parent: data.parent,
                has_parent_reply: data.has_parent_reply,
                parent_reply_file_name: data.parent_reply_file_name,
                parent_reply_file_path: data.parent_reply_file_path,
                parent_reply_file_type: data.parent_reply_file_type,
                parent_reply_file_url: data.parent_reply_file_url,
                parent_reply_from_agent_id: data.parent_reply_from_agent_id,
                parent_reply_from_agent_name: data.parent_reply_from_agent_name,
                parent_reply_id: data.parent_reply_id,
                parent_reply_message: data.parent_reply_message,
                parent_is_meeting: data.parent_is_meeting,
                parent_meeting_url: data.parent_meeting_url,
                is_meeting: data.is_meeting,
                meeting_url: data.meeting_url,
            };

            readChat(data.chat_id, data.is_menu == "private" ? false : true);
            if (data.is_menu == "private") {
                const hasReadBy = [
                    {
                        avatar: dataAuth.avatar,
                        name: dataAuth.name,
                        email: dataAuth.email,
                        id_agent: dataAuth.userIdAgent,
                        has_read: true,
                        read_date: dateNow,
                    },
                ];

                const dataUpdateStatusBubble = {
                    has_read_by: hasReadBy,
                    is_menu,
                    has_read: true,
                    receiver_id: data.agent_id,
                    chat_id: data.chat_id,
                };
                socket.emit("updateStatusReadPrivate", dataUpdateStatusBubble);
            }

            let dataChatInternalReplies = {
                agent_name: data.agent_name,
                agent_email: data.agent_email,
                agent_id: data.agent_id,
                message: data.message,
                chat_id: data.chat_id,
                created_at: data.created_at,
                updated_at: data.updated_at,
                date,
                formatted_date: dateNow,
                formatted_time: createDate("time_no_seconds"),
                id_chat: data.id_chat,
                form_agent_id: data.form_agent_id,
                is_sender: false,
                id: data.id,
                id_chat: data.id_chat,
                is_deleted: false,
                is_pinned: false,
                parent: data.parent,
                has_parent_reply: data.has_parent_reply,
                parent_reply_file_name: data.parent_reply_file_name,
                parent_reply_file_path: data.parent_reply_file_path,
                parent_reply_file_type: data.parent_reply_file_type,
                parent_reply_file_url: data.parent_reply_file_url,
                parent_reply_from_agent_id: data.parent_reply_from_agent_id,
                parent_reply_from_agent_name: data.parent_reply_from_agent_name,
                parent_reply_id: data.parent_reply_id,
                parent_reply_message: data.parent_reply_message,
                parent_is_meeting: data.parent_is_meeting,
                parent_meeting_url: data.parent_meeting_url,
                is_meeting: data.is_meeting,
                meeting_url: data.meeting_url,
            };
            this.dataDetail.internal_chat_replies.data.push(
                dataChatInternalReplies
            );

            await renderingDataChatting(dataRender);

            this.lastBubbleId = data.id;

            if (!Boolean(this.isScrollingTop)) {
                setTimeout(() => {
                    let elFoca = document.getElementById(`foca-${data.id}`);

                    if (Boolean(elFoca)) {
                        elFoca.scrollIntoView();
                    }
                }, 1000);
            } else {
                let countingReceiveMessage = isNaN(this.countingMessageNoRead)
                    ? 0
                    : this.countingMessageNoRead;
                this.countingMessageNoRead = countingReceiveMessage + 1;

                conditionButtonScrollToBottom();
            }
            // setTimeout(() => {
            //     let arrKeyRequest =
            //         this.dataDetail.internal_chat_replies.data.length - 1;
            //     let el = document.getElementById(
            //         `cardchat-${this.dataDetail.internal_chat_replies.data[arrKeyRequest].id}`
            //     );
            //     if (Boolean(el)) {
            //         el.scrollIntoView();
            //     }
            // }, 1000);
        }
    }
});

socket.on("leaveInfo", async (data) => {
    // getGroupChat();
    throttleGetGrouptChat();
    let modalDetailGroup = $("#modalDetailGroup").hasClass("show");
    let modalAddUser = $("#modalAddUserToGroup").hasClass("show");
    refreshNotification();
    if (this.dataDetail != undefined) {
        if (this.dataDetail.chat_id == data.chat_id) {
            if (modalDetailGroup || modalAddUser) {
                chooseContactGroups = [];
                renderChooseContact();
                infoGroup(data.chat_group_id);
                $("#keywordListGroupContact").val("");
                $("#modalAddUserToGroup").modal("hide");
            }

            const config = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${dataAuth.token}`,
                    "Content-Type": "application/json",
                    "X-Requested-With": "xmlhttprequest",
                },
                url: `${window.base_url_live}/api/agent/chat-group/${data.chat_group_id}`,
            };

            axios(config)
                .then(async (response) => {
                    this.dataDetailGroupChat2 = {};
                    this.dataDetailGroupChat2 = response.data.data;
                    $(`#groupDetailCounting-${data.chat_id}`).empty();
                    $(`#groupDetailCounting-${data.chat_id}`).append(
                        `${this.dataDetailGroupChat2.member_count} Members`
                    );
                })
                .catch((error) => {
                    setTimeout(function () {
                        contentNonChat(
                            error.response.data.message,
                            "/assets/images/illustration/il-warning.svg"
                        );
                        $("#keywordListContact").val("");
                        $("#modalContactFriend").modal("hide");
                    }, 1000);
                });
        }
    }
});

socket.on("infoJoinedGroup", (data) => {
    // getGroupChat();
    throttleGetGrouptChat();
    let modalDetailGroup = $("#modalDetailGroup").hasClass("show");
    let modalAddUser = $("#modalAddUserToGroup").hasClass("show");
    refreshNotification();
    if (this.dataDetail != undefined) {
        if (this.dataDetail.chat_id == data.chat_id) {
            if (modalDetailGroup || modalAddUser) {
                chooseContactGroups = [];
                renderChooseContact();
                infoGroup(data.chat_group_id);
                $("#keywordListGroupContact").val("");
                $("#modalAddUserToGroup").modal("hide");
            }
            const dfreshIGroup = {
                chat_id: data.chat_id,
                id_group: data.chat_group_id,
            };
            infoGroupRefresh(dfreshIGroup);
        }
    }
});

socket.on("changeInfoGroup", (data) => {
    // getGroupChat();
    throttleGetGrouptChat();
    let modalDetailGroup = $("#modalDetailGroup").hasClass("show");
    let modalAddUser = $("#modalAddUserToGroup").hasClass("show");
    if (this.dataDetail != undefined) {
        if (this.dataDetail.chat_id == data.chat_id) {
            this.dataDetailGroupChat2.name = data.group_name;
            this.dataDetailGroupChat2.icon = data.icon;
            $("#header-left-content").empty();
            $("#header-left-content").append(`
                <span class="float-left font-size-16 text-dark font-weight-bold pointer mr-4 btn-head-back" title="Back" onclick="backFirstStep()"><i class="fas fa-arrow-left"></i></span>
                <h5 class="font-size-15 mb-1 text-truncate">${this.dataDetailGroupChat2.name}</h5>
                <p class="text-muted text-truncate mb-0" style="margin-bottom: 2px !important;" id="groupDetailCounting-${this.dataDetail.chat_id}">${this.dataDetailGroupChat2.member_count} Members</p>
            `);
            if (modalDetailGroup || modalAddUser) {
                chooseContactGroups = [];
                renderChooseContact();
                infoGroup(data.id_group);
                $("#keywordListGroupContact").val("");
                $("#modalAddUserToGroup").modal("hide");
            }
            const dfreshIGroup = {
                chat_id: data.chat_id,
                id_group: data.id_group,
            };
            infoGroupRefresh(dfreshIGroup);
        }
    }
});

socket.on("updateFromDeleteMessage", async (data) => {
    if (!Boolean(this.dataDetail)) {
        return false;
    }

    if (this.dataDetail.chat_id != data.chat_id) {
        return false;
    }

    const listBubbleChat = this.dataDetail.internal_chat_replies.data;
    const lengthArrayBubbleChat = listBubbleChat.length - 1;

    const findIndexMessage = _.findIndex(listBubbleChat, {
        id: data.id,
    });

    await mediaContentDeleteParentChat(data);

    let elWrapMessage = document.querySelector(`.wrap-message-${data.id}`);
    if (!Boolean(elWrapMessage)) {
        return false;
    }

    elWrapMessage.removeAttribute("onmousemove");
    elWrapMessage.removeAttribute("onmouseleave");
    elWrapMessage.removeAttribute("data-bubbleid");
    elWrapMessage.removeAttribute("data-formatteddate");
    elWrapMessage.removeAttribute("data-bubbleposition");
    elWrapMessage.removeAttribute("data-pinned");

    elWrapMessage.innerHTML = `
        <div class="dropdown-bubblechat-${data.id}"></div>
        <div class="text-msg mb-0 msg-${data.id}"><i class="fas fa-ban mr-1"></i> <i>Message has been deleted</i></div>
    `;

    listBubbleChat.forEach((valBubble) => {
        if (valBubble.id == data.id) {
            valBubble.deleted_at = data.deleted_at;
            valBubble.reply_is_deleted = data.reply_is_deleted;
            valBubble.message = "Message has been deleted";
        }
    });

    if (lengthArrayBubbleChat == findIndexMessage) {
        if (data.is_menu == "private") {
            // getContactChat();
            throttleGetContactChat();
        } else {
            // getGroupChat();
            throttleGetGrouptChat();
        }
    }
});

socket.on("updateFromPinUnpinMessage", (data) => {
    if (!Boolean(this.dataDetail)) {
        return false;
    }

    if (this.dataDetail.chat_id != data.chat_id) {
        return false;
    }

    const listBubbleChat = this.dataDetail.internal_chat_replies.data;

    let elWrapMessage = document.querySelector(`.wrap-message-${data.id}`);
    let elPinnedStatus = document.querySelector(`.pinned-status-${data.id}`);

    if (!Boolean(elWrapMessage)) {
        return false;
    }

    elWrapMessage.removeAttribute("data-pinned");
    elWrapMessage.setAttribute("data-pinned", data.is_pinned);

    listBubbleChat.forEach((valBubble) => {
        if (valBubble.id == data.id) {
            valBubble.is_pinned = data.is_pinned;
        }
    });

    if (data.is_pinned) {
        elPinnedStatus.innerHTML = `<i class="fas fa-thumbtack mr-1"></i>`;
    } else {
        elPinnedStatus.innerHTML = ``;
    }
});

const infoGroupRefresh = (params) => {
    const config = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url: `${window.base_url_live}/api/agent/chat-group/${params.id_group}`,
    };

    axios(config)
        .then(async (response) => {
            this.dataDetailGroupChat2 = {};
            this.dataDetailGroupChat2 = response.data.data;
            $(`#groupDetailCounting-${params.chat_id}`).empty();
            $(`#groupDetailCounting-${params.chat_id}`).append(
                `${this.dataDetailGroupChat2.member_count} Members`
            );
        })
        .catch((error) => {
            setTimeout(function () {
                contentNonChat(
                    error.response.data.message,
                    "/assets/images/illustration/il-warning.svg"
                );
                $("#keywordListContact").val("");
                $("#modalContactFriend").modal("hide");
            }, 1000);
        });
};

/* layouting not content chat */
const clearContentChat = () => {
    // $(".button-scrolling-bottom").hide();
    $("#content-user-list-sidebar").hide();
    $("#keywordListChat").val("");
    $("#content-info").hide();
    $("#content-detail-chat").hide();
    $(".alert-typing").hide();
    $("#alert-detect").hide();
    // $(".alert-typing").empty();
    $("#header-left-content").empty();
    $("#listChat").empty();
    $("#header-right-content").empty();
    $("#header-left-content").hide();
    $("#sendMsg").hide();
    $("#listChat").hide();
    $("#header-right-content").hide();
    $(".header-detail-chat-content").removeClass("user-chat-border");
    $("#keywordListChat").removeAttr("disabled");
    $(".chat").removeClass("active");
    $(".loader-content").hide();
    $(".loader-content-list-pinned").hide();
    $(".alert-new-message").hide();

    $(".search-chat").hide();
    $(".no-search").show();
};

const clearContentAnimation = () => {
    $("#content-waiting-chat").empty();
    $("#content-waiting-chat").hide();
};

const contentLoader = () => {
    clearContentChat();
    clearContentAnimation();
    $("#content-waiting-chat").show();

    $("#content-waiting-chat").append(`
        <div class="text-center">
            <p class="mt-2 font-size-18 text-dark-soft font-weight-bold">
                Is processing your request...
            </p>
        </div>
    `);
};

const contentNonChat = (message, image) => {
    clearContentChat();
    clearContentAnimation();
    $("#content-user-list-sidebar").show();

    $("#content-waiting-chat").show();

    $("#content-waiting-chat").append(`
        <div class="text-center">
            <p class="mt-2 font-size-18 text-dark-soft font-weight-bold">
                ${message}
            </p>
            <img class="w-35 img-fluid" src="${image}" alt="Qchat Social Management">
        </div>
    `);
};

contentNonChat(
    "Chat Friend or Group",
    "/assets/images/illustration/il-question-tangerin-soft.svg"
);

const clearSearchCondition = (type = false) => {
    $("#keywordListChat").val("");
    $("#listSuggestionMessage").val();
    $("#modalSearchMessage").modal("hide");

    if (!type) {
        getGroupChat();
        getContactChat();
    }
};

$("#keywordMessage").on(
    "input",
    delay(function (e) {
        if (Boolean(this.value)) {
            getDataSuggestionMessage(this.value);
        } else {
            getDataSuggestionMessage();
        }
    }, 500)
);

$("#modalSearchMessage").on("hide.bs.modal", function () {
    this.dataInfoGroup = {};
    $("#keywordMessage").val("");
    getDataSuggestionMessage();
});

const getDataSuggestionMessage = (keyword = false) => {
    $("#listSuggestionMessage").empty();
    if (!Boolean(keyword)) {
        return $("#listSuggestionMessage").append(`
            <li class="d-flex justify-content-center py-17">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="ctext-wrap-content">
                            <p class="mb-0">
                                No query search messages!
                            </p>
                        </div>
                    </div>
                </div>
            </li>
        `);
    }

    $("#listSuggestionMessage").append(`
        <li class="d-flex justify-content-center py-17">
            <div class="conversation-list">
                <div class="ctext-wrap">
                    <div class="ctext-wrap-content">
                        <div class="spinner-border text-secondary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `);

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            keyword,
        },
        url: `${window.base_url_live}/api/chat/agent/internal/search-message`,
    };

    axios(config)
        .then((response) => {
            $("#listSuggestionMessage").empty();
            let dataRes = response.data.data;
            if (dataRes.length < 1) {
                return $("#listSuggestionMessage").append(`
                    <li class="d-flex justify-content-center py-17">
                        <div class="conversation-list">
                            <div class="ctext-wrap">
                                <div class="ctext-wrap-content">
                                    <p class="mb-0">
                                        Message not found!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </li>
                `);
            } else {
                dataRes.forEach((valDataRes) => {
                    let date = parseDateChatt(valDataRes.formatted_date, true);
                    let message = "";

                    let name = splitName(valDataRes.display_chat_name);

                    if (valDataRes.is_sender) {
                        message = !Boolean(valDataRes.message)
                            ? "You:"
                            : `You: ${limitText(
                                  valDataRes.message
                                      .replace(/<div>/gi, "<br>")
                                      .replace(/<\/div>/gi, "")
                                      .replace(/^(<br>)+|(<br>)+$/g, "")
                                      .replace(/\s\s+/g, "")
                                      .replace(/&nbsp;/g, ""),
                                  150
                              )}`;

                        if (valDataRes.is_meeting) {
                            message = `You: ${valDataRes.meeting_url}`;
                        }
                    } else {
                        let senderType = "";
                        if (valDataRes.chat_type_name == "Group") {
                            senderType = `${valDataRes.from_agent_name}: `;
                        }

                        message = !Boolean(valDataRes.message)
                            ? `${senderType}`
                            : `${senderType}${limitText(
                                  valDataRes.message
                                      .replace(/<div>/gi, "<br>")
                                      .replace(/<\/div>/gi, "")
                                      .replace(/^(<br>)+|(<br>)+$/g, "")
                                      .replace(/\s\s+/g, "")
                                      .replace(/&nbsp;/g, ""),
                                  150
                              )}`;

                        if (valDataRes.is_meeting) {
                            message = `${senderType}${valDataRes.meeting_url}`;
                        }
                    }

                    const dataRender = {
                        id: valDataRes.id,
                        id_chat: valDataRes.id_chat,
                        id_chat_group: valDataRes.id_chat_group,
                        chat_id: valDataRes.chat_id,
                        chat_type: valDataRes.chat_type,
                        chat_type_name: valDataRes.chat_type_name,
                        date,
                        formatted_date: valDataRes.formatted_date,
                        display_name: name,
                        display_image: valDataRes.display_chat_image,
                        display_email: valDataRes.display_chat_email,
                        from_agent_id: valDataRes.from_agent_id,
                        from_agent_name: Boolean(valDataRes.is_sender)
                            ? "Me"
                            : valDataRes.from_agent_id,
                        file_path: valDataRes.file_path,
                        file_name: valDataRes.file_name,
                        file_type: valDataRes.file_type,
                        file_url: valDataRes.file_url,
                        message,
                    };
                    renderListSuggestionMessage(dataRender);
                });
            }
        })
        .catch((error) => {
            $("#listSuggestionMessage").empty();
            console.warn("suggestion error:", error);

            return $("#listSuggestionMessage").append(`
                <li class="d-flex justify-content-center py-17">
                    <div class="conversation-list">
                        <div class="ctext-wrap">
                            <div class="ctext-wrap-content">
                                <p class="mb-0 text-danger">
                                    <b>Upps error, please try again!</b>
                                </p>
                            </div>
                        </div>
                    </div>
                </li>
            `);
        });
};

const showDetailChatFromSearchMessage = async (event) => {
    let chat_id = event.dataset.chatid;
    let reply_id = parseInt(event.dataset.idbuble);
    let type_id = parseInt(event.dataset.typeid);
    let id_group = !Boolean(event.dataset.idgroup)
        ? null
        : parseInt(event.dataset.idgroup);

    this.idSearchMessage = false;
    this.isSearchMessage = false;
    this.isScrollingTop = false;
    this.countMessageNoRead = 0;

    await contentLoader();
    if (displaySize > 991) {
        $("#content-user-list-sidebar").show();
    }

    const config = {
        method: "post",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            chat_id,
            set_per_page: 10,
            reply_id,
        },
        url: `${window.base_url_live}/api/chat/agent/internal/chat-details`,
    };

    axios(config)
        .then((response) => {
            this.dataDetail = {};
            this.dataDetail = response.data.data;

            $("#modalSearchMessage").modal("hide");

            this.idSearchMessage = reply_id;
            this.isSearchMessage = true;
            this.isScrollingTop = true;

            if (type_id == 2) {
                getInfoGroupFromDetailChat(id_group, "search_message");
            } else {
                renderDetailChat(chat_id, id_group);
            }
        })
        .catch((error) => {
            setTimeout(function () {
                contentNonChat(
                    "get detail chat from search message invalid, please try again!!!",
                    "/assets/images/illustration/il-warning.svg"
                );
                $("#keywordListContact").val("");
                $("#modalContactFriend").modal("hide");
            }, 1000);
            console.warn("error:", error);
        });
};

const showSearchMessage = () => {
    clearSearchCondition("message");
    $(".no-search").show();
    $(".search-chat").hide();
    $("#modalSearchMessage").modal("show");
    getDataSuggestionMessage();
};

const showSearchChat = () => {
    clearSearchCondition();
    $(".no-search").hide();
    $(".search-chat").show();
};

const hideSearchChat = () => {
    clearSearchCondition();
    $(".no-search").show();
    $(".search-chat").hide();
};

/* end layouting non content chat */

/* over in & over out bubble chat */
const generateListActionBubbleChat = async (data) => {
    let elActionListBubbleChat = document.getElementById(
        "action-list-bubble-chat"
    );
    elActionListBubbleChat.innerHTML = data;
    $("#modalActionListBubbleChat").modal("show");
};

const showListActionBubbleChat = async (event) => {
    const dataEvent = {
        positionBubble: event.dataset.bubbleposition,
        formattedDate: event.dataset.formatteddate,
        bubbleId: parseInt(event.dataset.bubbleid),
        isPinned: event.dataset.pinned == "true" ? true : false,
    };

    let compareDate = dateDiff(dataEvent.formattedDate);

    return new Promise((resolve, reject) => {
        let listActionBubbleChat = "";

        listActionBubbleChat += `
            <button type="button" class="list-group-item list-group-item-action" onclick="replyMessage(${dataEvent.bubbleId})">
                <i class="fas fa-reply mr-2"></i> Reply Message
            </button>
        `;

        if (dataEvent.isPinned) {
            listActionBubbleChat += `
                <button type="button" class="list-group-item list-group-item-action"  onclick="pinUnpinMessage(${dataEvent.bubbleId},${dataEvent.isPinned})">
                    <span class="fa-stack small mr-1">
                        <i class="fas fa-thumbtack fa-stack-1x fa-2x"></i>
                        <i class="fas fa-slash fa-stack-2x"></i>
                    </span> Unpin Message
                </button>
            `;
        } else {
            listActionBubbleChat += `
                <button type="button" class="list-group-item list-group-item-action" onclick="pinUnpinMessage(${dataEvent.bubbleId},${dataEvent.isPinned})">
                    <i class="fas fa-thumbtack mr-2"></i> Pinned Message
                </button>
            `;
        }

        if (dataEvent.positionBubble == "right") {
            if (compareDate.daysDiff < 1) {
                listActionBubbleChat += `
                    <button type="button" class="list-group-item list-group-item-action text-danger" onclick="deleteMessage(${dataEvent.bubbleId})">
                        <i class="fas fa-trash mr-2"></i> Delete Message
                    </button>
                `;
            }
        }

        if (listActionBubbleChat != "") {
            resolve(generateListActionBubbleChat(listActionBubbleChat));
        }
    });
};

$("#modalActionListBubbleChat").on("hide.bs.modal", function () {
    let elActionListBubbleChat = document.getElementById(
        "action-list-bubble-chat"
    );

    elActionListBubbleChat.innerHTML = "";
});

const outhoverBubbleChat = (event) => {
    let idCardChat = event.dataset.bubbleid;
    this.isDropdownMenuBubble = false;
    $(`.dropdown-bubblechat-${idCardChat}`).hide();
};

const hoverBubbleChat = (event) => {
    let idCardChat = event.dataset.bubbleid;
    let bubbleposition = event.dataset.bubbleposition;
    let formatteddate = event.dataset.formatteddate;
    let isPinned = event.dataset.pinned;

    if (this.isDropdownMenuBubble) {
        return false;
    }

    this.isDropdownMenuBubble = true;

    $(`.dropdown-bubblechat-${idCardChat}`).show();
};
/* end over in & over out bubble chat */

if (!Boolean(dataAuth.token)) {
    localStorage.clear();
    location.replace("/login");
}

const leftProfileSidebar = () => {
    const thumbProfile = document.getElementById("thumb-profile");
    thumbProfile.src = dataAuth.avatar;
    $("#name-profile").append(dataAuth.name);

    if (dataAuth.permission_id != 2 || dataAuth.permission_id != "2") {
        $("#position-profile").append(
            `${
                dataAuth.department_name == "null" ||
                dataAuth.department_name == null ||
                dataAuth.department_name == undefined
                    ? "-"
                    : dataAuth.department_name
            }`
        );
    } else {
        $("#position-profile").append(`${dataAuth.company_name}`);
    }
};
leftProfileSidebar();

/* get and render list contact chat friend */
$(document).on("contextmenu", ".list-chat-private", function (event) {
    event.preventDefault();
    $(".action-list-private-chat").empty();
    let el = $(event.target).closest(".list-chat-private");
    let selectChatID = el.data("chatid");
    $(".action-list-private-chat").append(`
        <a class="dropdown-item font-weight-bold pointer" onclick="detailChat('${selectChatID}')">Detail Chat</a>
        <a class="dropdown-item text-danger font-weight-bold pointer" onclick="removeConverstationPrivate('${selectChatID}')">Delete Chat</a>
    `);
    $(".action-list-private-chat")
        .show(100)
        .css({
            top: event.pageY + "px",
            left: event.pageX + "px",
        });
});

$(document).on("mouseup", function () {
    $(".action-list-private-chat").hide(100);
});

const renderListContactChat = async (dataRes) => {
    this.allResultPrivateChat = {};
    this.allResultPrivateChat = dataRes.length > 0 ? dataRes : {};
    $("#dt_contact_chat").empty();
    if (dataRes.length > 0) {
        dataRes.forEach((valRes) => {
            let DCMsg = {
                file_path: valRes.file_path,
                file_type: valRes.file_type,
                file_url: valRes.file_url,
                message: valRes.message,
                is_sender: valRes.is_sender,
                typeMenu: "private",
                is_deleted: valRes.reply_is_deleted,
                is_meeting: valRes.is_meeting,
                meeting_url: valRes.meeting_url,
            };
            let message = conditionMessageInList(DCMsg);
            let date = parseDateChatt(valRes.formatted_date);
            let counting = numeringCounter(valRes.unread_count, 1);
            let statusUser =
                valRes.online == 0 ||
                valRes.online == "0" ||
                valRes.online != true
                    ? "offline"
                    : "online";
            let avatar =
                valRes.display_chat_image == null
                    ? `${window.base_url_live}/assets/images/users/avatar/avatar-4.png`
                    : valRes.display_chat_image;

            $("#dt_contact_chat").append(`
                    <li class="pointer list-chat-private chat chat-${valRes.chat_id}" data-chatid="${valRes.chat_id}" onclick="detailChat('${valRes.chat_id}','')">
                        <a>
                            <div class="media">
                                <div class="user-img ${statusUser} align-self-center mr-3">
                                    <img src="${avatar}" class="rounded-circle header-profile-user avatar-xs img-object-fit-cover" alt="">
                                    <span class="user-status"></span>
                                </div>

                                <div class="media-body overflow-hidden">
                                    <h5 class="text-truncate font-size-14 mb-1 text-${valRes.chat_id}">${valRes.display_chat_name}</h5>
                                    <p class="text-truncate mb-0 sugest-message-${valRes.chat_id}" id="list-message-${valRes.chat_id}"></p>
                                </div>
                                <div class="font-size-11 mr-2">
                                    <p id="date-${valRes.chat_id}">${date}</p>
                                    <p id="counting-${valRes.chat_id}"></p>
                                </div>
                            </div>
                        </a>
                    </li>
                `);

            if (valRes.unread_count > 0) {
                $(`.text-${valRes.chat_id}`).addClass("text-bolder");
                $(`.sugest-message-${valRes.chat_id}`).addClass("text-unread");
                $(`#date-${valRes.chat_id}`).attr("style", "margin-bottom:5px");
                $(`#counting-${valRes.chat_id}`).addClass(
                    "badge rounded-pill badge-tangerin-500 float-right font-size-12"
                );
                $(`#counting-${valRes.chat_id}`).append(counting);
                $(`#counting-${valRes.chat_id}`).show();
            } else {
                $(`#counting-${valRes.chat_id}`).remove();
            }

            if (message != null || message != "") {
                $(`#list-message-${valRes.chat_id}`).append(message);
            }
        });
        if (this.dataDetail != undefined) {
            $(`#counting-${this.dataDetail.chat_id}`).remove();
            $(`.chat-${this.dataDetail.chat_id}`).addClass("active");
        }
    } else {
        $("#dt_contact_chat").append(`
                <li class="d-flex justify-content-center py-17">
                    <div class="conversation-list">
                        <div class="ctext-wrap">
                            <div class="ctext-wrap-content">
                                <p class="mb-0">
                                    Result Not found
                                </p>
                            </div>
                        </div>
                    </div>
                </li>
            `);
    }
};

const getContactChat = async (keyword) => {
    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            keyword:
                keyword == undefined || keyword == "" || keyword == null
                    ? ""
                    : keyword,
        },
        url: `${window.base_url_live}/api/chat/agent/internal/list-private-chat`,
    };

    await axios(config)
        .then((response) => {
            const dataRes = response.data.data;
            this.fullResponsePrivateChat = dataRes;
            updateTitleApps();

            const unreadChat = dataRes.unread_chat;
            renderListContactChat(dataRes.list);

            $("#counting-fc").removeClass(
                "badge rounded-pill badge-tangerin-500 font-size-12"
            );

            $("#counting-fc").empty();

            if (unreadChat > 0) {
                $("#counting-fc").addClass(
                    "badge rounded-pill badge-tangerin-500 font-size-12"
                );
                $("#counting-fc").append(`${numeringCounter(unreadChat, 1)}`);
            }
        })
        .catch((error) => {
            console.warn(error);
        });
};

/* throttle list private chat */
const throttleGetContactChat = _.throttle(getContactChat, 60000);

getContactChat();

/* get and render list group chat */
$(document).on("contextmenu", ".list-chat-group", function (event) {
    event.preventDefault();
    $(".action-list-group-chat").empty();
    let el = $(event.target).closest(".list-chat-group");
    let selectChatID = el.data("chatid");
    let idchat = el.data("idchat");
    $(".action-list-group-chat").append(`
        <a class="dropdown-item font-weight-bold pointer" onclick="detailChat('${selectChatID}','${idchat}')">Detail Chat Group</a>
        <a class="dropdown-item text-danger font-weight-bold pointer" onclick="removeConverstationChatGroup('${selectChatID}')">Delete Chat Group</a>
        <a class="dropdown-item text-danger font-weight-bold pointer" onclick="leaveGroup(${idchat},${dataAuth.userIdAgent},'leave','${selectChatID}')">Leave Group</a>
    `);

    $(".action-list-group-chat")
        .show(100)
        .css({
            top: event.pageY + "px",
            left: event.pageX + "px",
        });
});

$(document).on("mouseup", function () {
    $(".action-list-group-chat").hide(100);
});

const renderListGroupChat = (dataRes) => {
    $("#dt_group_chat").empty();

    if (dataRes.length > 0) {
        this.allResultGroupChat = {};
        this.allResultGroupChat = dataRes;
        dataRes.forEach((valRes) => {
            let DCMsg = {
                file_path: valRes.file_path,
                file_type: valRes.file_type,
                file_url: valRes.file_url,
                message: valRes.message,
                is_sender: valRes.is_sender,
                typeMenu: "group",
                is_deleted: valRes.reply_is_deleted,
                is_meeting: valRes.is_meeting,
                meeting_url: valRes.meeting_url,
            };
            let message = conditionMessageInList(DCMsg);
            let date = parseDateChatt(valRes.formatted_date);
            let counting = numeringCounter(valRes.unread_count, 1);

            let avatar =
                valRes.display_chat_image == null
                    ? `${window.base_url_live}/assets/images/users/avatar/Group1.png`
                    : valRes.display_chat_image;
            $("#dt_group_chat").append(`
                <li class="pointer list-chat-group chat chat-${valRes.chat_id}" data-chatid="${valRes.chat_id}" data-idChat="${valRes.id}" onclick="detailChat('${valRes.chat_id}','${valRes.id}')">
                    <a>
                        <div class="media">
                            <div class="user-img online align-self-center mr-3">
                                <img src="${avatar}" class="rounded-circle avatar-xs header-profile-user img-object-fit-cover" alt="img">
                            </div>

                            <div class="media-body overflow-hidden">
                                <h5 class="text-truncate font-size-14 mb-1 text-${valRes.chat_id}">${valRes.display_chat_name}</h5>
                                <p class="text-truncate mb-0 sugest-message-${valRes.chat_id}">${message}</p>
                            </div>
                            <div class="font-size-11 mr-2">
                                <p id="date-${valRes.chat_id}">${date}</p>
                                <p id="counting-${valRes.chat_id}"></p>
                            </div>
                        </div>
                    </a>
                </li>
            `);

            if (valRes.unread_count > 0) {
                $(`.sugest-message-${valRes.chat_id}`).addClass("text-unread");
                $(`.text-${valRes.chat_id}`).addClass("text-bolder");
                $(`#date-${valRes.chat_id}`).attr("style", "margin-bottom:5px");
                $(`#counting-${valRes.chat_id}`).addClass(
                    "badge rounded-pill badge-tangerin-500 float-right font-size-12"
                );
                $(`#counting-${valRes.chat_id}`).append(counting);
                $(`#counting-${valRes.chat_id}`).show();
            } else {
                $(`#counting-${valRes.chat_id}`).remove();
            }
        });
        if (this.dataDetail != undefined) {
            $(`#counting-${this.dataDetail.chat_id}`).remove();
            $(`.chat-${this.dataDetail.chat_id}`).addClass("active");
        }
    } else {
        $("#dt_group_chat").append(`
            <li class="d-flex justify-content-center py-17">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="ctext-wrap-content">
                            <p class="mb-0">
                                Result Not found
                            </p>
                        </div>
                    </div>
                </div>
            </li>
        `);
    }
};

const getGroupChat = (keyword) => {
    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            keyword:
                keyword == undefined || keyword == "" || keyword == null
                    ? ""
                    : keyword,
        },
        url: `${window.base_url_live}/api/chat/agent/internal/list-group-chat`,
    };

    axios(config)
        .then((response) => {
            const dataRes = response.data.data;
            this.fullResponseGroupChat = dataRes;
            updateTitleApps();

            const unreadCountChat = dataRes.unread_chat;
            renderListGroupChat(dataRes.list);
            $("#counting-gc").removeClass(
                "badge rounded-pill badge-tangerin-500 font-size-12"
            );
            $("#counting-gc").empty();
            if (unreadCountChat > 0) {
                $("#counting-gc").addClass(
                    "badge rounded-pill badge-tangerin-500 font-size-12"
                );
                $("#counting-gc").append(
                    `${numeringCounter(unreadCountChat, 1)}`
                );
            }
        })
        .catch((error) => {
            console.warn(error);
        });
};

/* throtle list group chat */
const throttleGetGrouptChat = _.throttle(getGroupChat, 60000);
getGroupChat();

/* list friends or contact list */
$("#keywordListContact").on(
    "input",
    delay(function (e) {
        getListContactChat(this.value);
    }, 500)
);

const searchListGroupContact = () => {
    setTimeout(function () {
        getListContactChat($("#keywordListGroupContacts").val());
    }, 500);
};

const getListContactChat = async (keyword = "") => {
    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            keyword,
        },
        url: `${window.base_url_live}/api/agent/agents-in-company`,
    };

    await axios(config)
        .then((response) => {
            const dataRes = response.data.data;
            $("#listContacts").empty();
            $("#listGroupContacts").empty();
            $("#listChooseContact").empty();
            if (dataRes.length > 0) {
                if (menuModal == "friend") {
                    dataRes.forEach((valRes) => {
                        let desc =
                            valRes.id_department != null
                                ? valRes.department_name
                                : valRes.company_name;
                        let avatar =
                            valRes.avatar == null
                                ? `${window.base_url_live}/assets/images/users/avatar/avatar-4.png`
                                : valRes.avatar;
                        let is_statusUser =
                            valRes.online == undefined ||
                            valRes.online == "null" ||
                            valRes.online == 0
                                ? "offline"
                                : "online";
                        $("#listContacts").append(`
                            <li class="pointer" onclick="chatConversation(${
                                valRes.id
                            })">
                                <a>
                                    <div class="media">
                                        <div class="user-img ${is_statusUser} align-self-center mr-3">
                                            <img src="${avatar}" class="rounded-circle avatar-xs img-object-fit-cover" alt="">
                                            <span class="user-status"></span>
                                        </div>

                                        <div class="media-body overflow-hidden">
                                            <h5 class="text-truncate font-size-14 mb-1">${
                                                valRes.name
                                            }</h5>
                                            <h5 class="text-truncate font-size-14 mb-1">${
                                                valRes.email
                                            }</h5>
                                            <h5 class="text-truncate font-size-14 mb-1">${
                                                desc == null || desc == "null"
                                                    ? "-"
                                                    : desc
                                            }</h5>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        `);
                    });
                } else {
                    listContactGroups = dataRes;
                    dataRes.forEach((valRes) => {
                        let avatar =
                            valRes.avatar == null
                                ? `${window.base_url_live}/assets/images/users/avatar/avatar-4.png`
                                : valRes.avatar;
                        $("#listGroupContacts").append(`
                            <li class="pointer contact-${valRes.uuid}" onclick="chooseContact('${valRes.uuid}','choose')">
                                <a>
                                    <div class="media">
                                        <div class="user-img align-self-center mr-3">
                                            <img src="${avatar}" class="rounded-circle avatar-xs img-object-fit-cover" alt="">
                                        </div>

                                        <div class="media-body overflow-hidden">
                                            <h5 class="text-truncate font-size-14 mb-1">${valRes.name}</h5>
                                            <h5 class="text-truncate font-size-14 mb-1">${valRes.email}</h5>
                                        </div>
                                        <div id="chooseStatus-${valRes.uuid}"></div>
                                    </div>
                                </a>
                            </li>
                        `);
                    });

                    renderChooseContact();
                }
            } else {
                if (menuModal == "friend") {
                    $("#listContacts").append(`
                        <li class="d-flex mt-3">
                            <div class="conversation-list">
                                <div class="ctext-wrap">
                                    <div class="ctext-wrap-content">
                                        <p class="mb-0 font-weight-bold">
                                            Result Not found
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `);
                } else {
                    $("#listGroupContacts").append(`
                        <li class="d-flex mt-3">
                            <div class="conversation-list">
                                <div class="ctext-wrap">
                                    <div class="ctext-wrap-content">
                                        <p class="mb-0 font-weight-bold">
                                            Result Not found
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `);
                }
            }
        })
        .catch((error) => {
            console.warn(error);
        });
};

/* detail chatting and new conversation*/
const getInfoGroupFromDetailChat = (id, from) => {
    const config = {
        method: "get",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url: `${window.base_url_live}/api/agent/chat-group/${id}`,
    };

    axios(config)
        .then(async (response) => {
            this.dataDetailGroupChat2 = {};
            this.dataDetailGroupChat2 = response.data.data;

            readChat(this.dataDetail.chat_id);
            // await getGroupChat();

            await throttleGetGrouptChat();
            renderDetailChat(this.dataDetail.chat_id, id);
        })
        .catch((error) => {
            console.warn(error);
        });
};

const detailChat = async (chat_id, id) => {
    this.lastBubbleId = false;
    this.isScrollingTop = false;
    this.idSearchMessage = false;
    this.isSearchMessage = false;
    this.countMessageNoRead = 0;

    await contentLoader();
    if (displaySize > 991) {
        $("#content-user-list-sidebar").show();
    }

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            chat_id,
            set_per_page: 10,
        },
        url: `${window.base_url_live}/api/chat/agent/internal/chat-details`,
    };

    axios(config)
        .then(async (response) => {
            this.dataDetail = {};
            this.dataDetail = response.data.data;

            if (this.dataDetail.chat_type_name.toLowerCase() == "group") {
                getInfoGroupFromDetailChat(id, "detail_chat");
            } else {
                // await getContactChat();
                await throttleGetContactChat();
                renderDetailChat(chat_id, id);
            }
        })
        .catch((error) => {
            setTimeout(function () {
                contentNonChat(
                    error.response.data.message,
                    "/assets/images/illustration/il-warning.svg"
                );
                $("#keywordListContact").val("");
                $("#modalContactFriend").modal("hide");
            }, 1000);
        });
};

const renderDetailChat = async (chat_id, id) => {
    clearContentChat();
    unRenderReplyMessage();
    $(`#counting-${chat_id}`).remove();
    if (displaySize > 991) {
        $("#content-user-list-sidebar").show();
    }
    let sortDataDetail = {};

    /* close modal form group */
    $("#modalFormGroup").modal("hide");
    $("#keywordListGroupContacts").val("");
    chooseContactGroups = [];
    listContactGroups = [];
    menuModal = "";
    $("#body-form-group").empty();
    $("#menu-name-group").empty();
    $("#listChooseContacts").empty();
    $("#listGroupContacts").empty();
    $("#btn-form-group").empty();

    $("#keywordListContact").val("");
    $("#modalContactFriend").modal("hide");
    if (this.dataDetail.chat_type_name.toLowerCase() == "group") {
        /* setup open menu */
        is_menu = "group";

        $("#header-left-content").append(`
            <span class="float-left font-size-16 text-dark font-weight-bold pointer mr-4 btn-head-back" title="Back" onclick="backFirstStep()"><i class="fas fa-arrow-left"></i></span>
            <h5 class="font-size-15 mb-1 text-truncate">${this.dataDetailGroupChat2.name}</h5>
            <p class="text-muted text-truncate mb-0" style="margin-bottom: 2px !important;" id="groupDetailCounting-${this.dataDetail.chat_id}">${this.dataDetailGroupChat2.member_count} Members</p>
        `);

        $("#header-right-content").append(`
            <button class="btn dropdown-toggle mr-2" type="button" onclick="attachFileChat()">
                <i class="fas fa-paperclip font-size-20"></i>
            </button>
            <div class="dropdown chat-noti-dropdown">
                <button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v font-size-20 mr-4"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item pointer" onclick="infoGroup('${this.dataDetailGroupChat2.id}')">
                        <span>Info Group</span>
                    </a>
                    <a class="dropdown-item pointer text-info" onclick="createMeetingRoom('${this.dataDetail.chat_id}',${this.dataDetailGroupChat2.id})">
                        <span>Create Meeting Room</span>
                    </a>
                    <a class="dropdown-item pointer" onclick="getListPinnedMessage('${chat_id}')">
                        <span>Pinned Message</span>
                    </a>
                    <a class="dropdown-item text-danger pointer" onclick="removeConverstationChatGroup('${this.dataDetail.chat_id}')">
                        <span>Delete Conversation</span>
                    </a>
                    <a class="dropdown-item text-danger pointer" onclick="leaveGroup(${this.dataDetailGroupChat2.id},${dataAuth.userIdAgent})">
                        <span>Leave Group</span>
                    </a>
                </div>
            </div>
        `);
    } else {
        /* setup open menu */
        is_menu = "private";
        console.log("dataDetail:", this.dataDetail);
        // this.allResultPrivateChat.forEach((element) => {
        //     if (element.chat_id == chat_id) {
        //         sortDataDetail = element;
        //     }
        // });

        $("#header-left-content").append(`
            <span class="float-left font-size-16 font-weight-bold pointer mr-4 btn-head-back" title="Back" onclick="backFirstStep()"><i class="fas fa-arrow-left"></i></span>
            <h5 class="font-size-15 mb-1 text-truncate">${this.dataDetail.display_chat_name}</h5>
            <p class="text-muted text-truncate mb-0" style="margin-bottom: 2px !important;">${this.dataDetail.display_chat_email}</p>
        `);

        $("#header-right-content").append(`
            <button class="btn dropdown-toggle mr-2" type="button" onclick="attachFileChat()">
                <i class="fas fa-paperclip font-size-20"></i>
            </button>
            <div class="dropdown chat-noti-dropdown">
                <button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v font-size-20 mr-4"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item pointer text-info" onclick="createMeetingRoom('${chat_id}')">
                        <span>Create Meeting Room</span>
                    </a>
                    <a class="dropdown-item pointer" onclick="getListPinnedMessage('${chat_id}')">
                        <span>Pinned Message</span>
                    </a>
                    <a class="dropdown-item text-danger pointer" onclick="removeConverstationPrivate('${chat_id}')">
                        <span>Delete Chat</span>
                    </a>
                </div>
            </div>
        `);
    }

    $(".header-detail-chat-content").addClass("user-chat-border");
    $("#header-left-content").show();
    $("#header-right-content").show();

    await clearContentAnimation();

    if (displaySize > 991) {
        $("#content-user-list-sidebar").show();
    }

    $(`.chat-${chat_id}`).addClass("active");
    $("#content-detail-chat").show();

    $("#listChat").show();
    $("#sendMsg").show();

    if (Boolean(this.dataDetail.internal_chat_replies.data)) {
        const dataUpdateStatusBubble = {
            has_read_by: {},
            is_menu,
            has_read: true,
        };

        // let lastBubbleChat = null;
        let lastBubbleChat = _.last(this.dataDetail.internal_chat_replies.data);
        console.log("lastBubbleChat:", lastBubbleChat);
        if (Boolean(lastBubbleChat)) {
            this.lastBubbleId = lastBubbleChat.id;
        } else {
            this.lastBubbleId = "";
        }
        dataUpdateStatusBubble.chat_id = this.dataDetail.chat_id;

        if (is_menu == "private") {
            dataUpdateStatusBubble.has_read_by = [
                {
                    avatar: dataAuth.avatar,
                    name: dataAuth.name,
                    email: dataAuth.email,
                    id_agent: dataAuth.userIdAgent,
                    has_read: true,
                    read_date: createDate(),
                },
            ];
            dataUpdateStatusBubble.receiver_id = this.dataDetail.receiver_id;
        } else {
            let receiverData = [];
            this.dataDetailGroupChat2.participants.forEach((valContact) => {
                if (valContact.agent_id != dataAuth.userIdAgent) {
                    receiverData.push(valContact.agent_id);
                }
            });

            dataUpdateStatusBubble.has_read_by = lastBubbleChat.has_read_by;
            dataUpdateStatusBubble.chat_id = lastBubbleChat.chat_id;
            dataUpdateStatusBubble.receiverData = receiverData;
            dataUpdateStatusBubble.id_chat = lastBubbleChat.id;
            dataUpdateStatusBubble.id_sender = lastBubbleChat.agent_id;
        }

        socket.emit("updateStatusReadBubble", dataUpdateStatusBubble);

        await this.dataDetail.internal_chat_replies.data.forEach(
            (elementChat) => {
                let classChat =
                    elementChat.is_sender == true ? "right" : "left";
                let displayName =
                    elementChat.agent_name == dataAuth.name
                        ? "Me"
                        : `${elementChat.agent_name}`;
                let date = parseDateChatt(elementChat.formatted_date, true);

                let dataRenderChat = {
                    is_menu,
                    id_sender: elementChat.agent_id,
                    idCardChat: elementChat.id,
                    displayName,
                    classChat,
                    message: elementChat.message,
                    date,
                    formatted_date: elementChat.formatted_date,
                    file_path: elementChat.file_path,
                    file_type: elementChat.file_type,
                    file_url: elementChat.file_url,
                    file_name: elementChat.file_name,
                    has_read: elementChat.has_read,
                    has_read_by: elementChat.has_read_by,
                    is_deleted: elementChat.reply_is_deleted,
                    is_pinned: elementChat.is_pinned,
                    parent: elementChat.parent,
                    has_parent_reply: elementChat.has_parent_reply,
                    parent_reply_file_name: elementChat.parent_reply_file_name,
                    parent_reply_file_path: elementChat.parent_reply_file_path,
                    parent_reply_file_type: elementChat.parent_reply_file_type,
                    parent_reply_file_url: elementChat.parent_reply_file_url,
                    parent_reply_from_agent_id:
                        elementChat.parent_reply_from_agent_id,
                    parent_reply_from_agent_name:
                        elementChat.parent_reply_from_agent_name,
                    parent_reply_id: elementChat.parent_reply_id,
                    parent_reply_message: elementChat.parent_reply_message,
                    parent_is_meeting: elementChat.parent_is_meeting,
                    parent_meeting_url: elementChat.parent_meeting_url,
                    is_meeting: elementChat.is_meeting,
                    meeting_url: elementChat.meeting_url,
                };

                if (!Boolean(lastBubbleChat)) {
                    dataRenderChat.status_last = false;
                } else {
                    dataRenderChat.status_last =
                        elementChat.id == lastBubbleChat.id ? true : false;
                }

                renderingDataChatting(dataRenderChat);
            }
        );

        setTimeout(() => {
            if (this.dataDetail.internal_chat_replies.data.length > 0) {
                if (this.isSearchMessage) {
                    let el = document.getElementById(
                        `cardchat-${this.idSearchMessage}`
                    );
                    if (Boolean(el)) {
                        el.scrollIntoView();
                        let classMessageFocus = "chat-focus-conversation";
                        let elConversation = document.querySelector(
                            `.conversation-${this.idSearchMessage}`
                        );
                        elConversation.classList.add(classMessageFocus);
                        setTimeout(() => {
                            elConversation.classList.remove(classMessageFocus);
                        }, 5000);
                    }
                } else {
                    let arrKeyRequest =
                        this.dataDetail.internal_chat_replies.data.length - 1;
                    let el = document.getElementById(
                        `cardchat-${this.dataDetail.internal_chat_replies.data[arrKeyRequest].id}`
                    );
                    if (Boolean(el)) {
                        el.scrollIntoView();
                    }
                }
            }
        }, 1600);
    }
};

/* next detail chatting from scroll  */
const getNextDetail = () => {
    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            chat_id: this.dataDetail.chat_id,
            set_per_page: 10,
        },
        url: this.dataDetail.internal_chat_replies.next_page_url,
    };

    axios(config)
        .then(async (response) => {
            const dataRes = response.data;

            this.nextDataDetail = dataRes.data.internal_chat_replies.data;

            this.dataDetail.internal_chat_replies.next_page_url =
                dataRes.data.internal_chat_replies.next_page_url;

            this.dataDetail.internal_chat_replies.current_page =
                dataRes.data.internal_chat_replies.current_page;

            renderNextDetailChat();
        })
        .catch((error) => {
            console.warn(error);
        });
};

const renderNextDetailChat = async () => {
    try {
        let dataDetail = this.nextDataDetail.reverse();
        await dataDetail.forEach(async (elementChat) => {
            this.dataDetail.internal_chat_replies.data.push(elementChat);
            let classChat = elementChat.is_sender == true ? "right" : "left";
            let displayName =
                elementChat.agent_name == dataAuth.name
                    ? "Me"
                    : `${elementChat.agent_name}`;
            let date = parseDateChatt(elementChat.formatted_date, true);
            let dataRenderChat = {
                is_menu,
                idCardChat: elementChat.id,
                displayName,
                classChat,
                message: elementChat.message,
                date,
                formatted_date: elementChat.formatted_date,
                file_path: elementChat.file_path,
                file_type: elementChat.file_type,
                file_url: elementChat.file_url,
                file_name: elementChat.file_name,
                has_read: elementChat.has_read,
                has_read_by: elementChat.has_read_by,
                is_deleted: elementChat.reply_is_deleted,
                is_pinned: elementChat.is_pinned,
                parent: elementChat.parent,
                has_parent_reply: elementChat.has_parent_reply,
                parent_reply_file_name: elementChat.parent_reply_file_name,
                parent_reply_file_path: elementChat.parent_reply_file_path,
                parent_reply_file_type: elementChat.parent_reply_file_type,
                parent_reply_file_url: elementChat.parent_reply_file_url,
                parent_reply_from_agent_id:
                    elementChat.parent_reply_from_agent_id,
                parent_reply_from_agent_name:
                    elementChat.parent_reply_from_agent_name,
                parent_reply_id: elementChat.parent_reply_id,
                parent_reply_message: elementChat.parent_reply_message,
                parent_is_meeting: elementChat.parent_is_meeting,
                parent_meeting_url: elementChat.parent_meeting_url,
                is_meeting: elementChat.is_meeting,
                meeting_url: elementChat.meeting_url,
            };
            await renderingOldDataChatting(dataRenderChat);
            let el = document.getElementById(`cardchat-${dataDetail[0].id}`);
            if (Boolean(el)) {
                el.scrollIntoView();
            }
            simpleBar.recalculate();
        });

        $(".loader-content").hide();
        this.isNextDetail = false;
    } catch (error) {}
};

const chatConversation = async (receiver) => {
    let config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {
            receiver,
        },
        url: `${window.base_url_live}/api/chat/agent/internal/new-private-chat`,
    };

    axios(config)
        .then((response1) => {
            let data1 = response1.data.data;
            config = {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${dataAuth.token}`,
                    "Content-Type": "application/json",
                    "X-Requested-With": "xmlhttprequest",
                },
                data: {
                    keyword: "",
                },
                url: `${window.base_url_live}/api/chat/agent/internal/list-private-chat`,
            };

            axios(config)
                .then((response2) => {
                    const dataRes = response2.data.data;
                    renderListContactChat(dataRes);
                    setTimeout(function () {
                        detailChat(data1.chat_id, receiver);
                    }, 1200);
                })
                .catch((error) => {
                    console.warn(error);
                });
        })
        .catch((error) => {
            console.warn(error);
        });
};

const removeConverstationPrivate = (chat_id) => {
    Swal.fire({
        title: "Delete",
        text: "Are your sure delete chat?",
        icon: "info",
        showCancelButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        cancelButtonColor: "#74788d",
        confirmButtonColor: "#ff3d60",
        confirmButtonText: "Delete!",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed) {
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
                url: `${window.base_url_live}/api/chat/agent/internal/delete-conversation`,
            };

            axios(config)
                .then((response) => {
                    this.dataDetail = {};
                    getContactChat();
                    // throttleGetContactChat();
                    contentNonChat(
                        "Chat Friend or Group",
                        "/assets/images/illustration/il-question-tangerin-soft.svg"
                    );
                    setTimeout(function () {
                        return Toast.fire({
                            icon: "success",
                            title: "Private chat is deleted",
                        });
                    }, 1100);
                })
                .catch((error) => {
                    // getContactChat();
                    throttleGetContactChat();
                    contentNonChat(
                        "Chat Friend or Group",
                        "/assets/images/illustration/il-question-tangerin-soft.svg"
                    );
                    setTimeout(function () {
                        return Toast.fire({
                            icon: "error",
                            title: error.response.message,
                        });
                    }, 1100);
                });
        }
    });
};

const removeConverstationChatGroup = (chat_id) => {
    Swal.fire({
        title: "Delete",
        text: "Are you sure delete chat group?",
        icon: "info",
        showCancelButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        cancelButtonColor: "#74788d",
        confirmButtonColor: "#ff3d60",
        confirmButtonText: "Delete!",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed) {
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
                url: `${window.base_url_live}/api/chat/agent/internal/delete-conversation`,
            };

            axios(config)
                .then((response) => {
                    this.dataDetail = {};
                    getGroupChat();
                    // throttleGetGrouptChat();
                    contentNonChat(
                        "Chat Friend or Group",
                        "/assets/images/illustration/il-question-tangerin-soft.svg"
                    );
                    setTimeout(function () {
                        return Toast.fire({
                            icon: "success",
                            title: "Group chat is deleted",
                        });
                    }, 1100);
                })
                .catch((error) => {
                    console.warn(error);
                });
        }
    });
};

const leaveGroup = (chat_group_id, user_id, menu) => {
    let receiverData = [];
    let participants = [];
    let chat_id = "";
    let id_chat = "";

    this.allResultGroupChat.forEach((valGroup) => {
        if (valGroup.id == chat_group_id) {
            participants = valGroup.participants;
            chat_id = valGroup.chat_id;
            id_chat = valGroup.id_chat;
        }
    });

    if (menu == "kick") {
        this.dataInfoGroup.participants.forEach((valUser) => {
            if (valUser.agent_id != dataAuth.userIdAgent) {
                receiverData.push(valUser.agent_id);
            }
        });
    } else {
        participants.forEach((valUser) => {
            if (valUser.agent_id != dataAuth.userIdAgent) {
                receiverData.push(valUser.agent_id);
            }
        });
    }

    let params = {
        menu: menu == undefined ? "leave" : menu,
        receiverData,
        chat_id: chat_id,
        chat_group_id: chat_group_id,
        id_chat: id_chat,
        agent_ids: [parseInt(user_id)],
    };
    Swal.fire({
        title: menu == undefined ? "Leave" : "Remove",
        text:
            menu == undefined
                ? "Are you sure leave group?"
                : "Are you sure remove user?",
        icon: "info",
        showCancelButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        cancelButtonColor: "#74788d",
        confirmButtonColor: "#ff3d60",
        confirmButtonText: "yes!",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed) {
            const config = {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${dataAuth.token}`,
                    "Content-Type": "application/json",
                    "X-Requested-With": "xmlhttprequest",
                },
                data: {
                    chat_group_id,
                    agent_ids: [parseInt(user_id)],
                },
                url: `${window.base_url_live}/api/agent/chat-group/detach-agent`,
            };

            axios(config)
                .then((response) => {
                    if (menu != "kick") {
                        this.dataDetail = {};
                        // getGroupChat();
                        throttleGetGrouptChat();
                        contentNonChat(
                            "Chat Friend or Group",
                            "/assets/images/illustration/il-question-tangerin-soft.svg"
                        );
                    } else {
                        infoGroup(chat_group_id);
                        // infoGroup(this.dataDetailGroupChat2.id);
                    }
                    refreshNotification();
                    socket.emit("leaveGroup", params);

                    setTimeout(function () {
                        return Toast.fire({
                            icon: "success",
                            title:
                                menu == undefined
                                    ? "Success leave group"
                                    : "Success remove user from group",
                        });
                    }, 1100);
                })
                .catch((error) => {
                    console.warn(error);
                });
        }
    });
};
/* end detail chat and new conversation*/

/* new contact group */
const chooseContact = async (uuid, feature) => {
    let chooseContact = [];
    if (feature != "remove") {
        await listContactGroups.forEach((valContacts) => {
            if (valContacts.uuid == uuid) {
                chooseContact = valContacts;
            }
        });
    }

    if ((await chooseContactGroups.length) < 1) {
        await chooseContactGroups.push(chooseContact);
    } else {
        let valCheck = [];
        chooseContactGroups.forEach((val, key) => {
            if (val.uuid == uuid) {
                valCheck = val;
            }
        });

        if ((await valCheck.length) < 1) {
            chooseContactGroups.push(chooseContact);
        } else {
            for (let i = 0; i < chooseContactGroups.length; i++) {
                const obj = chooseContactGroups[i];
                if (obj.uuid == uuid) {
                    chooseContactGroups.splice(i, 1);
                    i--;
                }
            }
        }
    }

    renderChooseContact();
};

const renderChooseContact = () => {
    listContactGroups.forEach((val) => {
        $(`#chooseStatus-${val.uuid}`).removeClass(
            "font-size-16 py-2 pr-2 text-tangerin"
        );
        $(`#chooseStatus-${val.uuid}`).empty();
    });
    chooseContactGroups.forEach((val) => {
        $(`#chooseStatus-${val.uuid}`).addClass(
            "font-size-16 py-2 pr-2 text-tangerin"
        );
        $(`#chooseStatus-${val.uuid}`).append(`
            <i class="fas fa-check-circle"></i>
        `);
    });
    $("#listChooseContacts").empty();
    chooseContactGroups.forEach((val) => {
        let avatar =
            val.avatar == null
                ? `${window.base_url_live}/assets/images/users/avatar/avatar-4.png`
                : val.avatar;
        let name = splitName(val.name);
        $("#listChooseContacts").append(`
            <li class="list-inline-item span mr-2">
                <div class="media">
                    <div>
                        <div class="user-img align-center mr-1">
                            <img src="${avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" alt="" data-toggle="tooltip" title="${val.name}" data-placement="right">
                            <button type="button" class="close" onclick="chooseContact('${val.uuid}','remove')">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <p class="mb-0 mt-1">${name}</p>
                    </div>
                </div>
            </li>
        `);
    });
};

const nextStepFormGroup = async () => {
    if ((await chooseContactGroups.length) < 1) {
        return Toast.fire({
            icon: "warning",
            title: "Member minimum 1",
        });
    }
    $("#btn-form-group").empty();
    $("#btn-form-group").append(`
        <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal"><i class="fas fa-times"></i></button>
        <button type="button" class="btn btn-light waves-effect" onclick="backStepFormGroup()"><i class="fas fa-arrow-left"></i></button>
        <button type="button" class="btn btn-tangerin waves-effect waves-light" onclick="saveGroup()"><i class="fas fa-save"></i></button>
    `);

    $("#menu-name-group").empty();
    $("#menu-name-group").append("Group Subject");

    $("#body-form-group").empty();
    $("#body-form-group").append(`
        <div class="media mb-2">
            <img class="d-flex mr-3 rounded-circle avatar-sm img-object-fit-cover" id="imageGroup" src="${base_url_live}/assets/images/users/avatar/Group1.png" alt="Generic placeholder image">
            <div class="p-image">
                <i class="fa fa-camera upload-button" onclick="uploadButtonImg()"></i>
                <input class="file-upload" id="file-uploaded" type="file" accept="image/*" onchange="thumbnailGroupUploaded()"/>
            </div>

            <div class="media-body">
                <div class="form-group">
                    <input type="text" class="form-control" id="group-subject" placeholder="Type subject group here...">
                    <small class="text-muted">Add subject group and icon group(optional)</small>
                </div>
            </div>
        </div>
        <div class="media">
            <h5 class="text-muted font-size-14 font-weight-light">Members:${chooseContactGroups.length}</h5>
        </div>
        <ul class="list-unstyled chat-list mt-1 pl-4" data-simplebar="init" style="max-height: 100px;">
            <div class="simplebar-wrapper" style="margin: 0px;">
                <div class="simplebar-height-auto-observer-wrapper">
                    <div class="simplebar-height-auto-observer"></div>
                </div>
                <div class="simplebar-mask">
                    <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                        <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden scroll;">
                            <div class="simplebar-content" style="padding: 0px;" id="fixChooseContacts"></div>
                        </div>
                    </div>
                </div>
                <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
            </div>
            <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
            </div>
            <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                <div class="simplebar-scrollbar" style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                </div>
            </div>
        </ul>
    `);

    chooseContactGroups.forEach((val) => {
        let avatar =
            val.avatar == null
                ? `${window.base_url_live}/assets/images/users/avatar/avatar-4.png`
                : val.avatar;
        let name = splitName(val.name);
        $("#fixChooseContacts").append(`
            <li class="list-inline-item span mr-2">
                <div class="text-center">
                    <img src="${avatar}" alt="image" class="rounded-circle avatar-sm mt-2 mb-2 group-chat img-object-fit-cover">
                    <div class="media-body">
                        <p class="text-muted">${name}</p>
                    </div>
                </div>
            </li>
        `);
    });
};

const backStepFormGroup = async () => {
    menuModal = "group";
    $("#btn-form-group").empty();
    $("#menu-name-group").empty();
    $("#body-form-group").empty();

    $("#body-form-group").append(`
        <div class="chat-list mb-2">
            <ul class="list-inline horizontal-slide pt-1 mb-2" id="listChooseContacts"></ul>
        </div>
        <div class="search-box chat-search-box">
            <div class="position-relative position-minus10-left">
                <input type="search" class="form-control" id="keywordListGroupContacts" oninput="searchListGroupContact()" placeholder="Search...">
                <i class="ri-search-line search-icon"></i>
            </div>
        </div>
        <ul class="list-unstyled chat-list mt-1" data-simplebar="init" style="max-height: 100px;">
            <div class="simplebar-wrapper" style="margin: 0px;">
                <div class="simplebar-height-auto-observer-wrapper">
                    <div class="simplebar-height-auto-observer"></div>
                </div>
                <div class="simplebar-mask">
                    <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                        <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden scroll;">
                            <div class="simplebar-content" style="padding: 0px;" id="listGroupContacts"></div>
                        </div>
                    </div>
                </div>
                <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
            </div>
            <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
            </div>
            <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                <div class="simplebar-scrollbar" style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                </div>
            </div>
        </ul>
    `);
    $("#btn-form-group").append(`
        <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal"><i class="fas fa-times"></i></button>
        <button type="button" class="btn btn-tangerin waves-effect waves-light" onclick="nextStepFormGroup()"><i class="fas fa-arrow-right"></i></button>
    `);
    $("#menu-name-group").append("Add new member");
    getListContactChat();
};

const thumbnailGroupUploaded = () => {
    file = document.getElementById("file-uploaded").files[0];
    let preview = document.getElementById("imageGroup");

    if (!Boolean(file)) {
        preview.src = `${base_url_live}/assets/images/users/avatar/avatar-4.png`;
    } else {
        const allowedExtensionIcon = ["jpg", "jpeg", "png"];
        let extensionIcon = file.type.split("/");
        preview.src = `${base_url_live}/assets/images/users/avatar/avatar-4.png`;

        if (!allowedExtensionIcon.includes(extensionIcon[1].toLowerCase())) {
            return Toast.fire({
                icon: "error",
                title: "Supported format: PNG, JPG, JPEG only!",
            });
        }
        var oFReader = new FileReader();
        oFReader = new FileReader();
        oFReader.readAsDataURL(file);
        oFReader.onload = function (oFREvent) {
            preview.src = oFREvent.target.result;
        };
    }
};

const thumbnailGroupUploadedUpdate = () => {
    file = document.getElementById("file-uploaded2").files[0];
    let preview = document.getElementById("imageGroupUpdated");

    if (!Boolean(file)) {
        preview.src = this.dataDetailGroupChat2.icon;
    } else {
        const allowedExtensionIcon = ["jpg", "jpeg", "png"];
        let extensionIcon = file.type.split("/");

        if (!allowedExtensionIcon.includes(extensionIcon[1].toLowerCase())) {
            return Toast.fire({
                icon: "error",
                title: "Supported format: PNG, JPG, JPEG only!",
            });
        }
        saveUpdateGroup(true);
    }
};

const saveGroup = () => {
    let subjectGroup = $("#group-subject").val();
    if (!Boolean(subjectGroup)) {
        return Toast.fire({
            icon: "warning",
            title: "Subject Group is required!",
        });
    }

    if (subjectGroup.length > 100) {
        return Toast.fire({
            icon: "warning",
            title: "Subject Group max 100 character!",
        });
    }

    let agent_ids = [];

    chooseContactGroups.forEach((valAgent) => {
        agent_ids.push(valAgent.id);
    });

    let data = "";
    const image = document.querySelector("#file-uploaded").files[0];
    if (image == undefined) {
        data = {
            name: $("#group-subject").val(),
            description: "",
            icon: null,
        };
    } else {
        data = new FormData();
        data.append("name", $("#group-subject").val());
        data.append("description", "");
        data.append("icon", image);
    }

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type":
                image == undefined ? "application/json" : "multipart/form-data",
            "X-Requested-With": "xmlhttprequest",
        },
        mimeType: "multipart/form-data",
        url: `${window.base_url_live}/api/agent/chat-group`,
        data,
    };
    axios(config)
        .then((response) => {
            let chat_id = response.data.data.chat_details.chat_id;
            let group_id = response.data.data.group_details.id;
            config.url = `${window.base_url_live}/api/agent/chat-group/attach-agent`;
            config.headers = {
                Authorization: `Bearer ${dataAuth.token}`,
                "Content-Type": "application/json",
                "X-Requested-With": "xmlhttprequest",
            };
            config.data = {
                chat_group_id: group_id,
                agent_ids,
            };
            axios(config)
                .then(async (response) => {
                    socket.emit("addUserToGroup", { receiverData: agent_ids });
                    // await getGroupChat();
                    await throttleGetGrouptChat();
                    await detailChat(chat_id, group_id);

                    return Toast.fire({
                        icon: "success",
                        title: "Create Group Success",
                    });
                })
                .catch((error) => {
                    console.warn(error);
                });
        })
        .catch((error) => {
            console.warn(error);
        });
};

const saveUpdateGroup = (imgStatus = false) => {
    let subjectGroup = "";
    if (!imgStatus) {
        subjectGroup = $("#iu-sub-group").val();
        if (!Boolean(subjectGroup)) {
            return Toast.fire({
                icon: "warning",
                title: "Subject Group is required!",
            });
        }

        if (subjectGroup.length < 2) {
            return Toast.fire({
                icon: "warning",
                title: "Subject Group min 2 character!",
            });
        }

        if (subjectGroup.length > 100) {
            return Toast.fire({
                icon: "warning",
                title: "Subject Group max 100 character!",
            });
        }
    }

    let data = new FormData();
    const icon = document.querySelector("#file-uploaded2").files[0];

    data.append(
        "name",
        !subjectGroup ? this.dataDetailGroupChat2.name : subjectGroup
    );
    data.append("description", "");
    if (imgStatus) {
        data.append("icon", icon);
    }
    data.append("id", this.dataInfoGroup.id);
    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "multipart/form-data",
            "X-Requested-With": "xmlhttprequest",
        },
        mimeType: "multipart/form-data",
        url: `${window.base_url_live}/api/agent/chat-group/update`,
        data,
    };

    axios(config)
        .then((response) => {
            let receiver = [];
            const dataRes = response.data;
            this.dataDetailGroupChat2.name = dataRes.data.name;
            this.dataDetailGroupChat2.icon = dataRes.data.icon;
            this.dataDetailGroupChat2.participants.forEach((valRes) => {
                if (dataAuth.userIdAgent != valRes.agent_id) {
                    receiver.push(valRes.agent_id);
                }
            });
            const socketData = {
                chat_id: this.dataDetail.chat_id,
                id_group: this.dataInfoGroup.id,
                group_name: this.dataDetailGroupChat2.name,
                icon: this.dataDetailGroupChat2.icon,
                receiver,
            };
            socket.emit("changeInfoGroup", socketData);
            $("#header-left-content").empty();
            $("#header-left-content").append(`
                <span class="float-left font-size-16 text-dark font-weight-bold pointer mr-4 btn-head-back" title="Back" onclick="backFirstStep()"><i class="fas fa-arrow-left"></i></span>
                <h5 class="font-size-15 mb-1 text-truncate">${this.dataDetailGroupChat2.name}</h5>
                <p class="text-muted text-truncate mb-0" style="margin-bottom: 2px !important;" id="groupDetailCounting-${this.dataDetail.chat_id}">${this.dataDetailGroupChat2.member_count} Members</p>
            `);
            // getGroupChat();
            throttleGetGrouptChat();
            closeInfoGroup();
            return Toast.fire({
                icon: "success",
                title: !imgStatus
                    ? "Subject group updated!"
                    : "Icon group updated!",
            });
        })
        .catch((error) => {
            console.warn(error);
        });
};

const cancelUpdateSubject = () => {
    $("#nameGroup").empty();
    $("#nameGroup").hide();
    $("#formSubjectGroup").empty();
    $("#formSubjectGroup").hide();
    $("#nameGroup").append(
        `<div>
            <i class="fas fa-edit mr-2 pointer" onclick="showUpdateSubject()"></i>${this.dataInfoGroup.name}
        </div>`
    );
    $("#nameGroup").show();
};
/* end new contact group */

/* info group & profile contact */
$(document).on("contextmenu", ".detail-group", function (event) {
    event.preventDefault();
    $(".action-detail-group").empty();
    let el = $(event.target).closest(".detail-group");

    let idAgent = el.data("idagent");
    let idGroup = el.data("idgroup");

    if (idAgent != dataAuth.userIdAgent) {
        $(".action-detail-group").append(`
            <a class="dropdown-item font-weight-bold pointer text-danger" onclick="leaveGroup(${idGroup},${idAgent},'kick')">Remove user from group</a>
        `);

        $(".action-detail-group")
            .show(100)
            .css({
                top: event.pageY - 30 + "px",
                left: event.pageX - 30 + "px",
            });
    }
});

$(document).on("click", ".detail-group", function (event) {
    event.preventDefault();
    $(".action-detail-group").empty();
    let el = $(event.target).closest(".detail-group");

    let idAgent = el.data("idagent");
    let idGroup = el.data("idgroup");

    if (idAgent != dataAuth.userIdAgent) {
        $(".action-detail-group").append(`
            <a class="dropdown-item font-weight-bold pointer text-danger" onclick="leaveGroup(${idGroup},${idAgent},'kick')">Remove user from group</a>
        `);

        $(".action-detail-group")
            .show(100)
            .css({
                top: event.pageY - 30 + "px",
                left: event.pageX - 30 + "px",
            });
    }
});

$(document).on("mouseup", function () {
    $(".action-detail-group").hide(100);
});

$(".noti-icon").on("click", function () {
    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url: `${window.base_url_live}/api/chat/agent/internal/update-read-notification`,
    };

    if ($(".noti-dot").is(":visible")) {
        axios(config)
            .then(async (response) => {
                try {
                    if (response.data.code == 200) {
                        $(".noti-dot").hide();
                    }
                } catch (error) {
                    console.warn(error);
                }
            })
            .catch((error) => {
                setTimeout(function () {
                    console.warn(error);
                }, 1000);
            });
    }
});

const infoGroup = async (id) => {
    const config = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        url: `${window.base_url_live}/api/agent/chat-group/${id}`,
    };

    axios(config)
        .then((response) => {
            this.dataInfoGroup = response.data.data;
            this.dataDetailGroupChat2.member_count = dataInfoGroup.member_count;
            this.dataDetailGroupChat2.participants = dataInfoGroup.participants;

            let iconGroup =
                this.dataInfoGroup.icon == null ||
                this.dataInfoGroup.icon == undefined
                    ? `${base_url_live}/assets/images/users/avatar/Group1.png`
                    : this.dataInfoGroup.icon;

            $("#listMembersGroup").empty();
            $("#nameGroup").empty();
            $("#membersGroup").empty();
            $("#formSubjectGroup").empty();
            $("#formSubjectGroup").hide();
            $("#nameGroup").hide();
            $("#imageGroupUpdated").attr("src", iconGroup);

            $("#nameGroup").append(
                `<div>
                    <i class="fas fa-edit mr-2 pointer" onclick="showUpdateSubject()"></i>${this.dataInfoGroup.name}
                </div>`
            );
            $("#nameGroup").show();

            $("#membersGroup").append(
                `${numeringCounter(this.dataInfoGroup.member_count, 2)} Members`
            );
            $(`#groupDetailCounting-${this.dataDetail.chat_id}`).empty();
            $(`#groupDetailCounting-${this.dataDetail.chat_id}`).append(
                `${numeringCounter(this.dataInfoGroup.member_count, 2)} Members`
            );
            if (this.dataInfoGroup.participants.length > 0) {
                this.dataInfoGroup.participants.forEach((element) => {
                    let image =
                        element.agent_avatar == undefined
                            ? `${base_url_live}/assets/images/users/avatar/avatar-4.png`
                            : element.agent_avatar;
                    let nameAgent =
                        element.agent_id == dataAuth.userIdAgent
                            ? "You"
                            : element.agent_name;
                    $("#listMembersGroup").append(`
                        <li class="pointer mb-2 detail-group" data-idGroup="${this.dataInfoGroup.id}" data-idAgent="${element.agent_id}">
                            <a>
                                <div class="media">
                                    <div class="user-img align-self-center mr-3">
                                        <img src="${image}" class="rounded-circle avatar-xs img-object-fit-cover" alt="">
                                    </div>

                                    <div class="media-body overflow-hidden">
                                        <h5 class="text-truncate font-size-14 mb-1">${nameAgent}</h5>
                                        <p class="text-truncate mb-0">${element.agent_email}</p>
                                    </div>
                                </div>
                            </a>
                        </li>
                    `);
                });
            }

            $("#modalDetailGroup").modal("show");
        })
        .catch((error) => {
            setTimeout(function () {
                contentNonChat(
                    error.response.data.message,
                    "/assets/images/illustration/il-warning.svg"
                );
                $("#modalDetailGroup").modal("hide");
            }, 1000);
        });
};

const closeInfoGroup = () => {
    $("#listMembersGroup").empty();
    $("#nameGroup").empty();
    $("#membersGroup").empty();
    $("#modalDetailGroup").modal("hide");
};

$("#modalDetailGroup").on("hide.bs.modal", function () {
    this.dataInfoGroup = {};
    $("#listMembersGroup").empty();
    $("#nameGroup").empty();
    $("#membersGroup").empty();
});

const showUpdateSubject = () => {
    $("#nameGroup").empty();
    $("#nameGroup").hide();
    $("#formSubjectGroup").append(`
        <input type="text" class="form-control" id="iu-sub-group" placeholder="Type new subject group here...">
        <div class="mt-2 float-right">
            <button class="btn btn-sm btn-secondary" onclick="cancelUpdateSubject()">Cancel</button>
            <button class="btn btn-sm btn-tangerin" onclick="saveUpdateGroup()">Oke</button>
        </div>
    `);
    $("#formSubjectGroup").show();
};

const getChooseUser = () => {
    menuModal = "chooseContact";
    getListContactChat();
    closeInfoGroup();
    $("#modalAddUserToGroup").modal("show");
};

$("#modalAddUserToGroup").on("hide.bs.modal", () => {
    chooseContactGroups = [];
    $("#keywordListGroupContacts").val("");
    renderChooseContact();
    infoGroup(this.dataInfoGroup.id);
});

const AddUserToGroup = () => {
    let receiverData = [];
    this.dataInfoGroup.participants.forEach((valParticipants) => {
        if (valParticipants.agent_id != dataAuth.userIdAgent) {
            receiverData.push(valParticipants.agent_id);
        }
    });

    let agent_ids = [];

    chooseContactGroups.forEach((valAgent) => {
        agent_ids.push(valAgent.id);
        receiverData.indexOf(valAgent.id) === -1
            ? receiverData.push(valAgent.id)
            : false;
    });

    let params = {
        menu: "oldGroup",
        receiverData,
        chat_id: dataDetail.chat_id,
        chat_group_id: this.dataInfoGroup.id,
        id_chat: this.dataInfoGroup.id,
        agent_ids,
    };

    const config = {
        url: `${window.base_url_live}/api/agent/chat-group/attach-agent`,
        headers: {
            Authorization: `Bearer ${dataAuth.token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        method: "POST",
        data: {
            chat_group_id: this.dataInfoGroup.id,
            agent_ids,
        },
    };
    axios(config)
        .then(async (response) => {
            chooseContactGroups = [];
            renderChooseContact();
            socket.emit("addUserToGroup", params);
            infoGroup(this.dataInfoGroup.id);
            $("#keywordListGroupContact").val("");
            $("#modalAddUserToGroup").modal("hide");
            refreshNotification();
            return Toast.fire({
                icon: "success",
                title: "Add user Success",
            });
        })
        .catch((error) => {
            console.warn(error);
        });
};

/* modalPinnedMessage */
const getListPinnedMessage = (chat_id) => {
    $("#modalPinnedMessage").modal("show");
    $(".loader-content-list-pinned").show();
    const elListMessagePin = document.getElementById("listMessagePinned");
    elListMessagePin.innerHTML = "";
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
        url: `${window.base_url_live}/api/chat/agent/internal/list-pinned-message`,
    };

    axios(config)
        .then((response) => {
            const dataRes = response.data.data;

            elListMessagePin.innerHTML = "";
            if (dataRes.length < 1) {
                $(".loader-content-list-pinned").hide();
                return (elListMessagePin.innerHTML = `
                    <li class="d-flex mt-3">
                        <div class="conversation-list">
                            <div class="ctext-wrap">
                                <div class="ctext-wrap-content">
                                    <p class="mb-0 font-weight-bold">
                                        Result Not found
                                    </p>
                                </div>
                            </div>
                        </div>
                    </li>
                `);
            }

            $(".loader-content-list-pinned").hide();

            dataRes.forEach((valBubbleMessage) => {
                let date = changeFormatDate(
                    valBubbleMessage.formatted_date,
                    "date_long_time"
                );
                let displayName =
                    valBubbleMessage.agent_name == dataAuth.name
                        ? "Me"
                        : `${valBubbleMessage.agent_name}`;

                let dataRenderChat = {
                    idCardChat: valBubbleMessage.id,
                    date,
                    displayName,
                    message: valBubbleMessage.message,
                    file_path: valBubbleMessage.file_path,
                    file_type: valBubbleMessage.file_type,
                    file_url: valBubbleMessage.file_url,
                    file_name: valBubbleMessage.file_name,
                    is_meeting: valBubbleMessage.is_meeting,
                    meeting_url: valBubbleMessage.meeting_url,
                };

                renderListPinnedMessage(dataRenderChat);
            });
        })
        .catch((err) => {
            console.warn(err);
        });
};
/* end modal Pinned Message */

/* modal detail reply message */
const showDetailReplyChat = (event) => {
    let idCardChat = event.dataset.bubbleparentid;

    if (!Boolean(this.dataDetail)) {
        return false;
    }

    if (!Boolean(this.dataDetail.internal_chat_replies.data)) {
        return false;
    }

    const listBubbleChat = this.dataDetail.internal_chat_replies.data;

    const getDetailMessage = _.find(listBubbleChat, {
        id: parseInt(idCardChat),
    });

    if (!Boolean(getDetailMessage)) {
        return false;
    }

    let el = document.getElementById(`cardchat-${getDetailMessage.parent}`);

    if (Boolean(el)) {
        let classMessageFocus = "chat-focus-conversation";

        let elConversation = document.querySelector(
            `.conversation-${getDetailMessage.parent}`
        );

        el.scrollIntoView();

        elConversation.classList.add(classMessageFocus);

        setTimeout(() => {
            elConversation.classList.remove(classMessageFocus);
        }, 5000);

        return false;
    } else {
        let date = changeFormatDate(
            getDetailMessage.formatted_date,
            "date_long_time"
        );

        let displayName =
            getDetailMessage.parent_reply_from_agent_name == dataAuth.name
                ? "me"
                : `${getDetailMessage.parent_reply_from_agent_name}`;

        let dataRenderChat = {
            idCardChat: getDetailMessage.parent,
            displayName,
            date,
            parent_is_meeting: getDetailMessage.parent_is_meeting,
            parent_meeting_url: getDetailMessage.parent_meeting_url,
            parent_reply_file_name: getDetailMessage.parent_reply_file_name,
            parent_reply_file_path: getDetailMessage.parent_reply_file_path,
            parent_reply_file_type: getDetailMessage.parent_reply_file_type,
            parent_reply_file_url: getDetailMessage.parent_reply_file_url,
            parent_reply_from_agent_id:
                getDetailMessage.parent_reply_from_agent_id,
            parent_reply_message: getDetailMessage.parent_reply_message,
            has_parent_reply: getDetailMessage.has_parent_reply,
        };

        renderingDetailReplyMessage(dataRenderChat);

        $("#modalDetailReplyMessage").modal("show");
    }
};

$("#modalDetailReplyMessage").on("hide.bs.modal", function () {
    $("#detailReplyMessage").empty();
});
/* end modal detail reply message */

/* universal function */
const uploadButtonImg = () => {
    $(".file-upload").click();
};

const uploadButtonImgDtGroup = () => {
    $(".file-upload2").click();
};

const attachFileChat = () => {
    // $("#attachFileChatting").click();
    $(".UppyModalOpenerBtn").click();
};

const splitName = (val) => {
    let name = val.split(" ");
    if (name.length < 3) {
        return val;
    } else {
        return name[0];
    }
};

$("#keywordListChat").on(
    "input",
    delay(async function (e) {
        await getGroupChat(this.value);
        await getContactChat(this.value);
    }, 500)
);

const backFirstStep = async () => {
    this.dataDetail = {};
    is_menu = "";
    await contentNonChat(
        "Chat Friend or Group",
        "/assets/images/illustration/il-question-tangerin-soft.svg"
    );
};

const backHome = () => {
    location.replace("/home");
};

const toProfile = () => {
    location.replace("/profile");
};

const formCreateGroup = () => {
    menuModal = "group";
    $("#body-form-group").append(`
        <div class="chat-list mb-2">
            <ul class="list-inline horizontal-slide pt-1 mb-2" id="listChooseContacts"></ul>
        </div>
        <div class="search-box chat-search-box">
            <div class="position-relative position-minus10-left">
                <input type="search" class="form-control" id="keywordListGroupContacts" oninput="searchListGroupContact()" placeholder="Search...">
                <i class="ri-search-line search-icon"></i>
            </div>
        </div>
        <ul class="list-unstyled chat-list mt-1" data-simplebar="init" style="max-height: 100px;">
            <div class="simplebar-wrapper" style="margin: 0px;">
                <div class="simplebar-height-auto-observer-wrapper">
                    <div class="simplebar-height-auto-observer"></div>
                </div>
                <div class="simplebar-mask">
                    <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                        <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden scroll;">
                            <div class="simplebar-content" style="padding: 0px;" id="listGroupContacts"></div>
                        </div>
                    </div>
                </div>
                <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
            </div>
            <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
            </div>
            <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                <div class="simplebar-scrollbar" style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                </div>
            </div>
        </ul>
    `);
    $("#btn-form-group").append(`
        <button type="button" class="btn btn-danger waves-effect" data-dismiss="modal"><i class="fas fa-times"></i></button>
        <button type="button" class="btn btn-tangerin waves-effect waves-light" onclick="nextStepFormGroup()"><i class="fas fa-arrow-right"></i></button>
    `);
    $("#menu-name-group").append("Add new member");
    getListContactChat();
    $("#modalFormGroup").modal("show");
};

$("#modalFormGroup").on("hide.bs.modal", function () {
    $("#keywordListGroupContacts").val("");
    chooseContactGroups = [];
    listContactGroups = [];
    menuModal = "";
    $("#body-form-group").empty();
    $("#menu-name-group").empty();
    $("#listChooseContacts").empty();
    $("#listGroupContacts").empty();
    $("#btn-form-group").empty();
});

const getFriendContact = () => {
    menuModal = "friend";
    getListContactChat();
    $("#modalContactFriend").modal("show");
};

$("#modalContactFriend").on("hide.bs.modal", function () {
    $("#keywordListContact").val("");
});

const displayChecked = () => {
    // Swal.fire({
    //     title: "Hmm",
    //     text: "there seems to be a change on your screen, please refresh the page to feel the responsive page!",
    //     icon: "info",
    //     showCancelButton: false,
    //     allowEscapeKey: false,
    //     allowOutsideClick: false,
    //     confirmButtonColor: "#ff9721",
    //     confirmButtonText: "Refresh",
    // }).then((result) => {
    //     location.reload();
    // });
};

function delay(callback, ms) {
    var timer = 0;
    return function () {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

String.prototype.insertString = function (index, string) {
    if (index > 0) {
        return this.substring(0, index) + string + this.substr(index);
    }

    return string + this;
};

String.prototype.insertHtmlAtCursor = (html) => {
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
        const elInputChatId = document.getElementById("input_chat");
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

/* throtle keyup */
const typingMessage = _.throttle(sendAlertTyping, 5000);

/* input message and button send message */
document.querySelector(".send-chat").addEventListener("click", () => {
    sendMessage();
});

$("#input_chat").keydown((e) => {
    let inputChat = document.querySelector("[contenteditable]");
    let msgContent = inputChat.innerHTML;

    if (e.which === 32) {
        msgContent = msgContent.replace(/^\s+/, "");
        if (msgContent.length === 0) {
            e.preventDefault();
        }
    } else if (e.ctrlKey && e.keyCode == 13) {
        typingMessage();
        var position = this.selectionEnd;
        this.value =
            this.value.substring(0, position) +
            "\n" +
            this.value.substring(position);
        this.selectionEnd = position;
    } else if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    } else {
        typingMessage();
    }
});

document
    .querySelector('div[contenteditable="true"]')
    .addEventListener("paste", function (e) {
        e.stopPropagation();
        e.preventDefault();
        // var text = e.clipboardData.getData("text");
        var text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
    });

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

var uppy = new Uppy.Core({
    restrictions: {
        maxNumberOfFiles: 1,
        minNumberOfFiles: 1,
        allowedFileTypes: extensionFileAllowed,
    },
    onBeforeFileAdded: (currentFile) => {
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
    endpoint: `${window.base_url_live}/api/chat/agent/internal/upload-file`,
    formData: true,
    bundle: false,
    fieldName: "files",
    headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        Authorization: `Bearer ${dataAuth.token}`,
        "X-Requested-With": "xmlhttprequest",
        mimeType: "multipart/form-data",
    },
});

uppy.on("upload-success", (file, response) => {
    const file_id = response.body.data.id;
    const message = file.meta.message;

    sendMessageWithFile(message, file_id);
    uppy.getPlugin("Dashboard").closeModal();
    uppy.reset();
});

uppy.on("upload-error", (file, error, response) => {
    console.warn("error send message file:", file.id);
    console.warn("error send message message:", error);
    console.warn("error send message response:", response);
});

$("#content-detail-chat").on("dragover", function (e) {
    uppy.getPlugin("Dashboard").openModal();
});

const SessionChecked = () => {
    if (["/login", "/"].includes(location.pathname)) {
        return true;
    }

    var token = dataAuth.token;
    if (Boolean(token)) {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "xmlhttprequest",
            },
        };
        axios
            .get(base_url_live + "/api/validate", config)
            .then(function (response) {
                if (Boolean(response.data.success)) {
                    $(".page-loader").fadeOut(500);
                }
            })
            .catch(function (error) {
                localStorage.clear();
                location.href = "/login";
            });
    } else {
        location.replace("/login");
    }
};
SessionChecked();

const updateTimeListPrivate = () => {
    try {
        if (!Boolean(this.allResultPrivateChat)) {
            return false;
        }

        if (this.allResultPrivateChat.length > 0) {
            this.allResultPrivateChat.forEach((valRes) => {
                let date_list_private = parseDateChatt(valRes.formatted_date);
                $(`#date-${valRes.chat_id}`).empty();
                $(`#date-${valRes.chat_id}`).append(date_list_private);
            });
        }
    } catch (error) {
        console.warn("updateTimeListTime: action is error!!!");
    }
};

const updateTimeListGroup = () => {
    try {
        if (!Boolean(this.allResultGroupChat)) {
            return false;
        }

        if (this.allResultGroupChat.length > 0) {
            this.allResultGroupChat.forEach((valRes) => {
                let date_list_private = parseDateChatt(valRes.formatted_date);
                $(`#date-${valRes.chat_id}`).empty();
                $(`#date-${valRes.chat_id}`).append(date_list_private);
            });
        }
    } catch (error) {
        console.warn("updateTimeListGroup: action is error!!!");
    }
};

const updateTimeDetailChat = async () => {
    try {
        if (!Boolean(this.dataDetail)) {
            return false;
        }

        if (!Boolean(this.dataDetail.internal_chat_replies.data)) {
            return false;
        }

        await this.dataDetail.internal_chat_replies.data.forEach((valRes) => {
            let dateDetail = parseDateChatt(valRes.formatted_date, true);

            let classChat = valRes.is_sender == true ? "right" : "left";
            let elFoCa = document.querySelector(`#foca-${valRes.id}`);

            let generatePinnedElement = "";
            if (valRes.reply_is_deleted) {
                generatePinnedElement = "";
            } else {
                generatePinnedElement = valRes.is_pinned
                    ? `<i class="fas fa-thumbtack mr-1"></i>`
                    : "";
            }

            if (is_menu == "private") {
                if (classChat == "left") {
                    if (Boolean(elFoCa)) {
                        return (elFoCa.innerHTML = `<div><span class="pinned-status-${valRes.id}">${generatePinnedElement}</span><span>${dateDetail}</span></div>`);
                    }
                }

                switch (valRes.has_read) {
                    case true:
                        iconFoca = `<span class="ml-2"><i class="fas fa-check-double text-tangerin"></i></span>`;
                        break;
                    default:
                        iconFoca = `<span class="ml-2"><i class="fas fa-check"></i></span>`;
                        break;
                }

                if (Boolean(elFoCa)) {
                    elFoCa.innerHTML = `
                        <div><span class="pinned-status-${valRes.id}">${generatePinnedElement}</span><span>${dateDetail}</span></div>
                        ${iconFoca}
                    `;
                }
            } else {
                if (Boolean(elFoCa)) {
                    elFoCa.innerHTML = `
                        <div><span class="pinned-status-${valRes.id}">${generatePinnedElement}</span><span>${dateDetail}</span></div>
                        <div class="d-flex mt-2 float-${classChat}">
                            <div class="media readed-user-${valRes.id}"></div>
                        </div>
                    `;
                }
            }
        });

        let lastBubbleChat = _.last(this.dataDetail.internal_chat_replies.data);

        let elListRead = document.querySelector(
            `.readed-user-${lastBubbleChat.id}`
        );

        if (Boolean(lastBubbleChat.has_read_by)) {
            var listUserReaded = "";
            await lastBubbleChat.has_read_by.forEach((value) => {
                if (lastBubbleChat.agent_id != value.id_agent) {
                    listUserReaded += `
                        <div class="user-img online align-self-center">
                            <img src="${value.avatar}" class="rounded-circle avatar-xs pointer img-object-fit-cover" data-toggle="tooltip" data-placement="top" title="${value.email}">
                        </div>
                    `;
                }
            });

            if (Boolean(listUserReaded)) {
                elListRead.innerHTML = `${listUserReaded}`;
            }
        } else {
            elListRead.innerHTML = "";
        }
    } catch (error) {
        console.warn("updateTimeDetailChat: ", error);
    }
};

const updateTimeAutomation = () => {
    updateTimeListPrivate();
    updateTimeListGroup();
    updateTimeDetailChat();
};
setInterval(updateTimeAutomation, 60000);

const simpleBar = new SimpleBar(document.querySelector(".simplebar"), {
    autoHide: true,
});

const scrollHandler = (event) => {
    let countMessageNoRead = isNaN(this.countingMessageNoRead)
        ? 0
        : this.countingMessageNoRead;
    const { scrollHeight, scrollTop, clientHeight } = event.target;

    /* counting true or false, used check position scrolling */
    const countingScroll = scrollHeight - Math.round(scrollTop);
    const isBottomReached =
        scrollHeight - Math.round(scrollTop) === clientHeight;
    console.log("isBottomReached:", isBottomReached);
    if (!Boolean(isBottomReached)) {
        this.isScrollingTop = true;
        $(".button-scrolling-bottom").show();
        const reduceHeightScroll = countingScroll - clientHeight;

        if (reduceHeightScroll == 1) {
            this.isScrollingTop = false;
            this.idSearchMessage = false;
            this.isSearchMessage = false;
            this.countingMessageNoRead = 0;

            $(".button-scrolling-bottom").hide();
            $(".counter-button-scroll").hide();
        }
    } else {
        this.isScrollingTop = false;
        this.idSearchMessage = false;
        this.isSearchMessage = false;
        this.countingMessageNoRead = 0;

        $(".button-scrolling-bottom").hide();
        $(".counter-button-scroll").hide();
    }

    if (scrollTop < 1) {
        if (this.dataDetail.internal_chat_replies.next_page_url) {
            if (!this.isNextDetail) {
                getNextDetail();
            }
            this.isNextDetail = true;
            $(".loader-content").show();
        }
    }
};

const scrollToBottom = () => {
    let elementEndBubbleChat = document.getElementById(
        `foca-${this.lastBubbleId}`
    );

    if (Boolean(elementEndBubbleChat)) {
        elementEndBubbleChat.scrollIntoView();
    }

    this.isScrollingTop = false;
    this.idSearchMessage = false;
    this.isSearchMessage = false;
    this.countingMessageNoRead = 0;

    $(".button-scrolling-bottom").hide();
    $(".counter-button-scroll").hide();
};

simpleBar
    .getScrollElement()
    .addEventListener("scroll", scrollHandler, { passive: true });
