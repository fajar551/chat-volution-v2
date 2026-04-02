class Admin {
    constructor() {
        /* this list and detail data */
        this.allResultListPending = [];
        this.allResultListPendingTransfer = [];
        this.allResultListOnGoing = [];
        this.allResultListHistory = [];
        this.dataDetail = {};
        this.allResultList = {};
        this.dataBubbleChat = [];

        var agent_id = localStorage.getItem("UserID");
        var sessionID = localStorage.getItem("sessionID");
        var permission = localStorage.getItem("permission");
        var email = localStorage.getItem("email");
        var uuid = localStorage.getItem("uuid");
        var name = localStorage.getItem("name");
        var phone = localStorage.getItem("phone");
        var permission_name = localStorage.getItem("permission_name");
        var id_department = localStorage.getItem("id_department");
        var department_name = localStorage.getItem("department_name");
        var id_company = localStorage.getItem("id_company");
        var company_name = localStorage.getItem("company_name");
        var avatar = localStorage.getItem("avatar");

        this.Toast = Swal.mixin({
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

        window.tk = localStorage.getItem("tk");

        this.agent_id = agent_id;
        this.sessionID = sessionID;
        this.current_client = null;
        this.user_id = null;

        const dataAuth = {
            token: window.tk,
            agent_id: agent_id,
            roles_id: permission,
            email_agent: email,
            uuid: uuid,
            phone_agent: phone,
            name_agent: name,
            type_user: "agent",
            status: "online",
            last_action: null,
            permission_name,
            id_department,
            department_name,
            id_company,
            company_name,
            avatar,
            module: "is_dashboard",
        };

        this.socket = io(BASE_SOCKET, {
            autoConnect: true,
            auth: dataAuth,
        });

        this.socket.on("reset_session", () => {
            localStorage.removeItem("email");
            localStorage.removeItem("last_action");
            localStorage.removeItem("chat_id");
        });

        this.socket.on("admin:pending_chat", (data) => {
            this.getListPending();
        });

        /* Listen function nodejs list Department with available agent Online */
        this.socket.on("list_department", () => {
            const config = {
                method: "get",
                url: `${base_url_live}/api/chat/agent/available-departments-transfer`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    Authorization: "Bearer " + window.tk,
                },
            };

            axios(config)
                .then(function (response) {
                    $("#lDept").empty();
                    localStorage.removeItem("availDepartment");

                    if (response.data.data.length > 0) {
                        localStorage.setItem(
                            "availDepartment",
                            JSON.stringify(response.data.data)
                        );
                        response.data.data.forEach((element) => {
                            $("#lDept").append(`
                                <li class="pointer" onclick="adminObj.assignTo('department','${element.id}')">
                                    <a>
                                        <div class="media">
                                            <div class="media-body overflow-hidden">
                                                <h5 class="text-truncate font-size-14 mb-1">${element.name}</h5>
                                                <p class="text-truncate mb-0">${element.description}</p>
                                            </div>
                                            <div class="mb-0">
                                                <span class="badge badge-success badge-pill font-size-14 mt-1">
                                                    <b>${element.online_agents}</b>
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                            `);
                        });
                    } else {
                        $("#lDept").append(`
                            <li>
                                <div class="col-lg-12 col-md-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="text-center align-items-center">
                                                <img class="w-35 img-fluid"
                                                    src="${base_url}/assets/images/illustration/il-offline.svg"
                                                    alt="Qchat Social Management">
                                                    <p class="mt-2 font-size-15">
                                                        Agent in another department is offline!
                                                    </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        `);
                    }
                })
                .catch(function (error) {});
        });

        /* list online agent in transfer chat */
        this.socket.on("list_agents", () => {
            const config = {
                method: "get",
                url: `${base_url_live}/api/chat/agent/available-agents-transfer`,
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    Authorization: "Bearer " + window.tk,
                },
            };

            axios(config)
                .then(function (response) {
                    const dataRes = response.data.data;
                    $("#list-online-agent").empty();
                    $("#lAgents").empty();
                    localStorage.removeItem("availAgents");

                    if (dataRes.length < 1) {
                        return $("#lAgents").append(`
                            <li>
                                <div class="col-lg-12 col-md-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="text-center align-items-center">
                                                <img class="w-35 img-fluid"
                                                    src="${base_url}/assets/images/illustration/il-offline.svg"
                                                    alt="Qchat Social Management">
                                                    <p class="mt-2 font-size-15">
                                                        No Agents Online!
                                                    </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        `);
                    }

                    localStorage.setItem(
                        "availAgents",
                        JSON.stringify(dataRes)
                    );
                    dataRes.forEach((valRes) => {
                        let avatar = !Boolean(valRes.avatar)
                            ? base_url +
                              "/assets/images/users/avatar/avatar-4.png"
                            : valRes.avatar;
                        $("#list-online-agent").append(`
                            <li class="list-inline-item span mb-2">
                                <div class="media">
                                    <div class="user-img online align-self-center mr-3">
                                        <img src="${avatar}"
                                            class="rounded-circle avatar-sm pointer img-${valRes.id} img-object-fit-cover" alt="" data-toggle="tooltip"
                                            title="${valRes.name}" data-placement="right">
                                        <span class="user-status"></span>
                                    </div>
                                </div>
                            </li>
                        `);

                        $(`.img-${valRes.id}`)
                            .attr("data-original-title", valRes.name)
                            .tooltip();

                        $("#lAgents").append(`
                            <li class="pointer" onclick="adminObj.assignTo('agent','${valRes.uuid}')">
                                <a>
                                    <div class="media">
                                        <div class="user-img online align-svalResf-center mr-3">
                                            <img src="${avatar}" class="rounded-circle avatar-sm img-object-fit-cover" alt="photo-profile-user">
                                            <span class="user-status"></span>
                                        </div>
                                        <div class="media-body overflow-hidden">
                                            <h5 class="text-truncate font-size-14 mb-1">${valRes.name}</h5>
                                            <p class="text-truncate mb-0">${valRes.email}</p>
                                            <p class="text-truncate mb-0">${valRes.department_name}</p>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        `);
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        });

        /* listen function nodejs list chatting onGoing no refresh*/
        this.socket.on("list_onGoing", () => {
            this.getListOnGoing();
        });

        this.socket.on("list_pending_transfer", () => {
            this.getListPendingTransfer();
        });

        this.socket.on("list_history", () => {
            this.getListHistory();
        });

        /* notification transfer chat */
        this.socket.on("sendNotifTransferChat", (data) => {
            return this.Toast.fire({
                icon: "info",
                title:
                    data.type == "to_agents"
                        ? `You Have New Chat Transfer From ${data.from_agent_name}`
                        : `You Have New Chat Transfer From Other Department`,
            });
        });

        /* listen chatting solve chat */
        this.socket.on("solve_chat", () => {
            this.getListPending();
            this.getListOnGoing();
            this.getListPendingTransfer();
            this.getListHistory();
        });

        /* listen chatting start */
        this.socket.on("start_chat", async (data) => {
            this.user_id = data.socket_id;

            localStorage.setItem("chat_id", this.dataDetail.chat_id);
            localStorage.setItem("id_channel", this.dataDetail.id_channel);

            this.clearLayoutChat();
            await this.getDetailBubbleChat();
            this.getListOnGoing();

            let label_name = "";
            if (this.dataDetail.id_channel != 1) {
                label_name = this.dataDetail.user_name;
                $("#current_client_mail").hide();
            } else {
                label_name = this.dataDetail.user_email;
                $("#current_client_mail").text(this.dataDetail.user_email);
            }
            $("#current_client_name").text(label_name);

            this.menuRightDetailChat();
            this.menuLeftDetailChat();

            $(".header").addClass("user-chat-border");
            $(`.chat-${this.dataDetail.chat_id}`).addClass("active");
        });

        /* listen typing client */
        this.socket.on("private_chat", async (dataRes) => {
            const chat_id = !this.dataDetail ? null : this.dataDetail.chat_id;
            const dataresChatId = dataRes.chat_id;
            if (!this.dataDetail) {
                this.unread_chat(dataresChatId);
            } else {
                if (chat_id == dataresChatId) {
                    this.dataBubbleChat.push(dataRes);

                    let displayName = "";

                    if (dataRes.id_channel == 3) {
                        displayName = dataRes.user_name;
                    } else if (dataRes.id_channel == 2) {
                        displayName = !dataRes.user_name
                            ? dataRes.user_phone
                            : dataRes.user_name;
                    } else {
                        displayName = !dataRes.id_agent
                            ? dataRes.user_email
                            : dataRes.agent_email;
                    }

                    let dataRenderChat = {
                        classChat: "left",
                        displayName,
                        message: dataRes.message,
                        date: this.parseDateChatt(
                            moment().format("YYYY-MM-DD HH:mm:ss")
                        ),
                        file_path: dataRes.file_path,
                        file_name: dataRes.file_name,
                        file_url: dataRes.file_url,
                        file_type: dataRes.file_type,
                        idCardChat: dataRes.unique_id,
                    };
                    await this.renderingDataChatting(dataRenderChat);
                    setTimeout(() => {
                        let el = document.getElementById(
                            `cardChat-${dataRes.unique_id}`
                        );
                        el.scrollIntoView();
                    }, 1350);
                } else {
                    this.unread_chat(dataresChatId);
                }
            }
            this.getListOnGoing();
        });

        /** listen result of connect telegram */
        this.socket.on("connectTelegramResult", (data) => {
            console.warn("telegram connect!", data);
        });

        this.socket.on("duplicate_tab", (data) => {
            alert(
                "Duplicate tab detected. Close another tab and refresh this browser"
            );
            $(".page-content").hide();
        });

        this.socket.on("admin:solved_chat", (data) => {
            let clientName =
                this.dataDetail.id_channel == 1
                    ? this.dataDetail.user_email
                    : this.dataDetail.user_name;
            Toast.fire({
                icon: "info",
                title: `Chat with client ${clientName} closed, by client!`,
            });
            this.getListOnGoing();

            if (data.chat_id == this.dataDetail.chat_id) {
                displayNoChatting();
            }
            // $("#menu-ongoing").click();
        });
    }
    /* read chat */
    unread_chat = async (chat_id) => {
        const token = window.tk;

        const notify_status = localStorage.getItem("allowed_notif");
        const urlAudio = `${base_url_live}/assets/sound/bell.mp3`;
        const audio = new Audio(urlAudio);
        if (notify_status == 1) {
            audio.play();
        }

        const data = {
            chat_id: chat_id,
        };
        const config = {
            method: "post",
            url: `${base_url_live}/api/chat/agent/unread-counter`,
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "xmlhttprequest",
                "Content-Type": "application/json",
            },
            data,
        };

        await axios(config)
            .then((response) => {})
            .catch((error) => {
                console.log(error);
            });
    };

    /* render bubble chat */
    renderingWithFancy = async (data) => {
        let thumbnailBubble = "";
        if (data.file_type == "other") {
            thumbnailBubble = `
                <a id="overview-file" class="d-flex" data-fancybox data-type="pdf" href="${data.file_url}" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" class="w-15" src="${base_url_live}/assets/images/icon/pdf.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            `;
        } else if (data.file_type == "video") {
            thumbnailBubble = `
                <a id="overview-file" data-fancybox-video data-download-src="${data.file_url}" href="${data.file_url}">
                    <video onmousedown="return false" id="preview-file" playsinline="true"  controls muted class="w-100" src="${data.file_url}"></video>
                </a>
            `;
        } else {
            thumbnailBubble = `
                <a id="overview-file" data-fancybox="gallery" class="d-flex justify-content-center" href="${data.file_url}"  data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" class="w-50" src="${data.file_url}" />
                </a>
            `;
        }

        await $("#IC").append(`
            <li class="${data.classChat}" id="cardChat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                ${thumbnailBubble}
                            </div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0 ctm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    };

    renderingNoFancy = async (data) => {
        let fileExtension = data.file_path.split(".");
        let exDoc = ["doc", "docx"];
        let exExcel = ["xls", "xlsx"];
        let exArchives = ["arc", "bz", "bz2", "gz", "rar", "tar", "zip", "7z"];
        let thumbnailBubble = ``;
        if (exDoc.includes(fileExtension[1].toLowerCase())) {
            thumbnailBubble = `
                <a id="overview-file" class="d-flex" data-toggle="tooltip" data-placement="top" title="${data.file_name}" href="${data.file_url}">
                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/doc.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            `;
        } else if (exExcel.includes(fileExtension[1].toLowerCase())) {
            thumbnailBubble = `
                <a id="overview-file" href="${data.file_url}" class="d-flex" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/sheets.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            `;
        } else if (exArchives.includes(fileExtension[1].toLowerCase())) {
            thumbnailBubble = `
                <a id="overview-file"href="${data.file_url}" class="d-flex" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/archive.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            `;
        } else {
            thumbnailBubble = `
                <a id="overview-file" href="${data.file_url}" class="d-flex" data-toggle="tooltip" data-placement="top" title="${data.file_name}">
                    <img onmousedown="return false" id="preview-file" style="max-width:100%" class="w-15" src="${base_url_live}/assets/images/icon/download-file.png" />
                    <span class="ml-1 mt-3 font-size-14 text-truncate">${data.file_name}</span>
                </a>
            `;
        }

        await $("#IC").append(`
            <li class="${data.classChat}" id="cardChat-${data.idCardChat}">
                <div class="conversation-list">
                    <div class="ctext-wrap">
                        <div class="conversation-name text-left">${data.displayName}</div>
                        <div class="ctext-wrap-content">
                            <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                ${thumbnailBubble}
                            </div>
                            <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                        </div>
                        <p class="chat-time text-${data.classChat} mb-0 ctm-${data.idCardChat}">${data.date}</p>
                    </div>
                </div>
            </li>
        `);
    };

    renderingDataChatting = async (data) => {
        const options = {
            target: "_blank",
            className: "__bubble-url-chat",
        };

        if (!data.file_path) {
            await $("#IC").append(`
                <li class="${data.classChat}" id="cardChat-${data.idCardChat}">
                    <div class="conversation-list">
                        <div class="ctext-wrap">
                            <div class="conversation-name text-left">${data.displayName}</div>
                            <div class="ctext-wrap-content">
                                <div class="text-msg mb-0 msg-${data.idCardChat}">${data.message}</div>
                            </div>
                            <p class="chat-time text-${data.classChat} mb-0">${data.date}</p>

                        </div>
                    </div>
                </li>
            `);

            linkifyElement(
                document.querySelector(`.msg-${data.idCardChat}`),
                options
            );
        } else {
            if (!data.file_url) {
                await $("#IC").append(`
                    <li class="${data.classChat}" id="cardChat-${data.idCardChat}">
                        <div class="conversation-list">
                            <div class="ctext-wrap">
                                <div class="conversation-name text-left">${data.displayName}</div>
                                <div class="ctext-wrap-content">
                                    <div class="img-fluid mb-1" style="object-fit: cover;width: 100%;height: 50%;">
                                        <img onmousedown="return false" id="preview-file" style="max-width:100%" src="assets/images/small/img-4.jpg" />
                                    </div>
                                    <div class="text-msg mb-0 msg-${data.idCardChat}"></div>
                                </div>
                                <p class="chat-time text-${data.classChat} mb-0 ctm-${data.idCardChat}">${data.date}</p>
                            </div>
                        </div>
                    </li>
                `);

                linkifyElement(
                    document.querySelector(`.msg-${data.idCardChat}`),
                    options
                );
            } else {
                let fileExtension = data.file_path.split(".");

                const fancyEx = [
                    "gif",
                    "ico",
                    "jpg",
                    "jpeg",
                    "png",
                    "svg",
                    "tiff",
                    "tif",
                    "webp",
                    "mp4",
                    "webm",
                    "avi",
                    "mpeg",
                    "pdf",
                ];

                if (fancyEx.includes(fileExtension[1].toLowerCase())) {
                    await this.renderingWithFancy(data);
                } else {
                    await this.renderingNoFancy(data);
                }

                if (Boolean(data.message)) {
                    await $(`.msg-${data.idCardChat}`).append(data.message);
                    linkifyElement(
                        document.querySelector(`.msg-${data.idCardChat}`),
                        options
                    );
                }
            }
        }
    };

    /* get data bubble chatting from detail chat*/
    getDetailBubbleChat = async () => {
        let chat_id = this.dataDetail.chat_id;
        const token = localStorage.getItem("tk");

        const config = {
            method: "post",
            url: `${base_url_live}/api/chat/agent/chat-details`,
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "xmlhttprequest",
                "Content-Type": "application/json",
            },
            data: {
                chat_id,
            },
        };

        axios(config)
            .then(async (response) => {
                $("#IC").empty();
                const dataRes = response.data;
                if (dataRes.data.length > 0) {
                    await dataRes.data.forEach(async (valRes) => {
                        this.dataBubbleChat.push(valRes);
                        let classChat = "left";
                        let displayName = "";

                        if (this.dataDetail.id_channel == 1) {
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
                            date: this.parseDateChatt(valRes.formatted_date),
                            file_path: valRes.file_path,
                            file_name: valRes.file_name,
                            file_url: valRes.file_url,
                            file_type: valRes.file_type,
                            idCardChat: valRes.unique_id,
                        };

                        await this.renderingDataChatting(dataRenderChat);
                    });

                    if (
                        this.dataDetail.status_name.toLowerCase() != "resolved"
                    ) {
                        $("#sendMsg").show();
                    } else {
                        $("#btnMsg").append(`
                            <button class="btn btn-outline-light btn-block btn-lg text-tangerin font-weight-bold" onclick="viewHistorychat('${chat_id}')">
                                History Chat Action
                            </button>
                        `);
                    }

                    setTimeout(() => {
                        let countDt = dataRes.data.length - 1;
                        let el = document.getElementById(
                            `cardChat-${dataRes.data[countDt].unique_id}`
                        );
                        el.scrollIntoView();
                    }, 1350);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    /* render bubble chat v old */
    generateHTML() {
        const chat_agent = (
            txt,
            time = "00:00",
            from = "Anda"
        ) => `<li class="right">
        <div class="conversation-list">
            <div class="ctext-wrap">
                <div class="conversation-name">${from}</div>
                <div class="ctext-wrap-content">
                    <div class="text-msg mb-0">${txt}</div>
                </div>

                <p class="chat-time mb-0"><i class="bx bx-time-five align-middle mr-1"></i> ${time}</p>
            </div>
        </div>
    </li>`;

        const chat_client = (
            from,
            content,
            time = "00:00",
            avatar = "/assets/images/users/avatar-2.jpg"
        ) => `<li class="left">
          <div class="conversation-list">
              <div class="chat-avatar">
                  <img src="${avatar}" alt="">
              </div>
              <div class="ctext-wrap">
                  <div class="conversation-name">${from}</div>
                  <div class="ctext-wrap-content">
                      <div class="text-msg mb-0">${content}</div>
                  </div>
                  <p class="chat-time mb-0"><i class="mdi mdi-clock-outline align-middle mr-1"></i> ${time}</p>
              </div>

          </div>
      </li>`;

        return {
            chat_agent,
            chat_client,
        };
    }

    numeringCounter = (valNumber, DigistNumber) => {
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

    parseDateChatt = (valDate) => {
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

    /* config upload file dynamic condition */
    setupUploadFile = () => {
        if (this.dataDetail.id_channel == 1) {
            uppy.getPlugin("XHRUpload").setOptions({
                endpoint: `${window.base_url_live}/api/chat/agent/upload-file`,
                fieldName: "file",
            });
        } else {
            uppy.getPlugin("XHRUpload").setOptions({
                endpoint: `${window.base_url_live}/api/chat/agent/upload-file/from-dashboard-to-socmed`,
                fieldName: "files",
            });
        }
    };

    /* show detail OnGoing */
    getDetailOnGoingChat = async (chat_id) => {
        const tk = localStorage.getItem("tk");

        this.allResultListOnGoing.forEach((valRes) => {
            if (chat_id == valRes.chat_id) {
                this.dataDetail = valRes;
                this.setupUploadFile();
            }
            $(`.chat-${valRes.chat_id}`).removeClass("active");
        });

        this.clearLayoutChat();
        await this.getDetailBubbleChat();
        await this.getListOnGoing();

        $(".header").addClass("user-chat-border");
        $(`.chat-${chat_id}`).addClass("active");

        // if (this.dataDetail.unread_count > 0) {
        //     this.getListOnGoing();
        // }

        this.menuLeftDetailChat();
        this.menuRightDetailChat();
    };

    /* show detail pending transfer */
    getDetailPendingTransfer = async (chat_id) => {
        localStorage.removeItem("chat_id");
        localStorage.removeItem("last_action");
        localStorage.removeItem("id_channel");

        this.allResultListPendingTransfer.forEach((valRes) => {
            if (valRes.chat_id == chat_id) {
                this.dataDetail = valRes;
                this.setupUploadFile();
            }
            $(`.chat-${valRes.chat_id}`).removeClass("active");
        });

        localStorage.setItem("chat_id", chat_id);
        localStorage.setItem("last_action", "pendingTransferChatt");

        this.postAssignChat(chat_id)
            .then(async (response) => {
                localStorage.setItem(
                    "email_client",
                    this.dataDetail.user_email
                );
                localStorage.setItem("last_action", "ambil_chat");

                this.clearLayoutChat();
                await this.getDetailBubbleChat();

                $(".header").addClass("user-chat-border");
                $(`.chat-${chat_id}`).addClass("active");

                this.socket.emit("transferChattToDeparment");

                this.menuLeftDetailChat();
                this.menuRightDetailChat();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    /* show detail history */
    getDetailHistory = (chat_id) => {
        this.clearLayoutChat();

        this.allResultListHistory.forEach((valRes) => {
            $(`.chat-${valRes.chat_id}`).removeClass("active");
            if (chat_id == valRes.chat_id) {
                this.dataDetail = valRes;
            }
        });

        this.menuLeftDetailChat();
        this.menuRightDetailChat("history");

        $(".header").addClass("user-chat-border");

        this.getDetailBubbleChat();

        $(`.chat-${chat_id}`).addClass("active");
    };

    /* send chat */
    sendChat() {
        let inputChat = document.querySelector("[contenteditable]");
        let content = inputChat.innerHTML;
        content = content.replace(/^<br>+/g, "");
        content = content.replace(/<div>/gi, "").replace(/<\/div>/gi, "");

        if (Boolean(content)) {
            var regex = /<br\s*[\/]?>/gi;
            content = content.replace(regex, "\n");
            content = content.replace(/\&nbsp;/g, "");
        } else {
            inputChat.innerHTML = null;
            Toast.fire({
                icon: "error",
                title: "Please type your message or send file!",
            });
        }
        inputChat.innerHTML = null;

        const id_agent = localStorage.getItem("UserID");
        const token = window.tk;

        const params = {
            content,
            token,
            chat_id: this.dataDetail.chat_id,
            id_users: this.dataDetail.id_users,
            id_agent,
            message: content,
        };
        this.postReplyChat(params)
            .then(async (response) => {
                const data = response.data.data;
                this.dataBubbleChat.push(data);

                const dataRenderChat = {
                    classChat: "right",
                    displayName:
                        this.dataDetail.id_channel == 1
                            ? data.agent_email
                            : data.agent_name,
                    message: data.message,
                    date: this.parseDateChatt(
                        moment().format("YYYY-MM-DD HH:mm:ss")
                    ),
                    file_path: data.file_path,
                    file_name: data.file_name,
                    file_type: data.file_type,
                    file_url: data.file_url,
                    idCardChat: data.unique_id,
                };

                let replyToApps = "";
                params.data = data;

                if (
                    this.dataDetail.id_channel == 3 ||
                    this.dataDetail.id_channel == 2
                ) {
                    replyToApps =
                        this.dataDetail.id_channel == 2
                            ? "replyToClientWa"
                            : "replyToClientTeleg";
                    params.token = window.tk;
                } else {
                    replyToApps = "private_chat";
                }

                this.socket.emit(replyToApps, params);
                await this.renderingDataChatting(dataRenderChat);
                let el = document.getElementById(
                    `cardChat-${dataRenderChat.idCardChat}`
                );
                el.scrollIntoView();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    sendChatFile(params) {
        const agent_id = localStorage.getItem("UserID");
        const token = window.tk;

        const data = {
            message: params.message == undefined ? "" : params.message,
            chat_id: this.dataDetail.chat_id,
            id_users: this.dataDetail.id_users,
            id_agent: agent_id,
            file_id: params.file_id,
        };

        const config = {
            method: "post",
            url: `${base_url_live}/api/chat/agent/replytoclient`,
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "xmlhttprequest",
                "Content-Type": "application/json",
            },
            data,
        };

        axios(config)
            .then(async (response) => {
                const data = response.data.data;
                this.dataBubbleChat.push(data);
                let replyToApps = "";
                if (this.dataDetail.id_channel == 1) {
                    replyToApps = "sendChatWithFile";
                } else {
                    replyToApps =
                        this.dataDetail.id_channel == 2
                            ? "replyToClientWa"
                            : "replyToClientTeleg";
                    data.token = token;
                    data.file_id = params.file_id;
                }

                this.socket.emit(replyToApps, data);

                const dataRenderChat = {
                    classChat: "right",
                    displayName:
                        this.dataDetail.id_channel == 1
                            ? data.agent_email
                            : data.agent_name,
                    message: data.message,
                    date: this.parseDateChatt(
                        moment().format("YYYY-MM-DD HH:mm:ss")
                    ),
                    file_path: data.file_path,
                    file_name: data.file_name,
                    file_type: data.file_type,
                    file_url: data.file_url,
                    idCardChat: data.unique_id,
                };

                await this.renderingDataChatting(dataRenderChat);
                let el = document.getElementById(
                    `cardChat-${dataRenderChat.idCardChat}`
                );
                el.scrollIntoView();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    /* show popup transfer history chat */
    sendHistoryChat = (email = false) => {
        // console.log("emailClient:", email);
        closeSendHistory();
        const data = {
            email:
                this.dataDetail.id_channel == 1
                    ? this.dataDetail.user_email
                    : email,
            // email: "faiz.adi@konsep.digital",
            chat_id: this.dataDetail.chat_id,
        };

        var config = {
            method: "post",
            url: `${base_url_live}/api/chat/agent/send-chat-history`,
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: `Bearer ${window.tk}`,
            },
            data,
        };

        axios(config)
            .then((response) => {
                return this.Toast.fire({
                    icon: "success",
                    title: "Send history chat success!",
                });
            })
            .catch((err) => {});
    };

    showFormSendHistory = () => {
        // console.log("showFormSendHistory:", this.dataDetail);
        if (this.dataDetail.id_channel == 1) {
            this.sendHistoryChat();
        } else {
            this.showModalFormHistory();
        }
        // this.showModalFormHistory();
    };

    showModalFormHistory = () => {
        $("#formSendHistoryChat").modal("show");
    };

    /* show popup transfer chatt */
    formTransferChat = () => {
        $("#transferChatForm").modal("show");
    };

    /* transfer chat */
    assignTo = (type, id) => {
        const data = {
            chat_id: this.dataDetail.chat_id,
            status: 2,
            id_department: type == "department" ? parseInt(id) : null,
            to_agent: type == "agent" ? id : null,
        };

        var config = {
            method: "post",
            url: `${base_url_live}/api/chat/agent/transfer-chat`,
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: `Bearer ${window.tk}`,
            },
            data: data,
        };
        axios(config)
            .then((response) => {
                let dataRes = response.data.data;
                // dataRes.id_department =
                //     type == "department" ? parseInt(id) : null;

                this.socket.emit("transferChatt", dataRes);

                displayNoChatting();
                $("#transferChatForm").modal("hide");
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    /* condition message in list chatting */
    conditionMessageInList = (params) => {
        let message = "";
        let sender = "Client";
        let to = "you";
        const regex = /<br\s*[\/]?>/gi;
        params.message = !params.message
            ? ""
            : params.message.replace(regex, " ");

        if (params.is_sender) {
            sender = "You";
            to = "client";
        } else {
            if (!params.is_sender) {
                if (params.id_agent == this.agent_id) {
                    sender = "You";
                    to = "client";
                } else {
                    if (Boolean(params.id_agent)) {
                        sender = params.email_agent;
                        to = "client";
                    }
                }
            }
        }

        if (params.file_path == null) {
            if (Boolean(params.message)) {
                message = `<b class="font-weight-bold">${sender}: </b> ${params.message}`;
            }
        } else {
            let typeFile = params.file_type;
            if (!params.file_url) {
                message = `${sender} failed send a ${typeFile}`;
            } else {
                message = `${sender} send ${typeFile} to ${to}`;
            }
        }
        return message;
    };

    /* get list pending */
    renderListPending = (data) => {
        const chatCount = data.chat_count;
        this.allResultListPending = {};
        $("#counting-pending").removeClass(
            "badge rounded-pill badge-tangerin-500 font-size-12"
        );
        $("#counting-pending").empty();
        $("#dt_pending").empty();

        if (chatCount > 0) {
            this.allResultListPending = data.list;
            $("#counting-pending").addClass(
                "badge rounded-pill badge-tangerin-500 font-size-12"
            );
            $("#counting-pending").append(
                `${this.numeringCounter(chatCount, 1)}`
            );
            data.list.forEach((valRes) => {
                let coditionMsg = {
                    file_path: valRes.file_path,
                    file_type: valRes.file_type,
                    file_url: valRes.file_url,
                    message: valRes.message,
                    id_agent: !valRes.id_agent ? null : valRes.id_agent,
                    name_agent: !valRes.agent_name ? null : valRes.agent_name,
                    email_agent: !valRes.agent_email
                        ? null
                        : valRes.agent_email,
                    is_sender: false,
                    typeMenu: "pending",
                };
                let message = this.conditionMessageInList(coditionMsg);
                let date = this.parseDateChatt(valRes.formatted_date);
                switch (valRes.id_channel) {
                    case 3:
                        valRes.label_name = valRes.user_name;
                        valRes.label_topic = "-";
                        break;
                    case "3":
                        valRes.label_name = valRes.user_name;
                        valRes.label_topic = "-";
                        break;
                    case 2:
                        valRes.label_name = valRes.user_phone;
                        valRes.label_topic = "-";
                        break;
                    case "2":
                        valRes.label_name = valRes.user_phone;
                        valRes.label_topic = "-";
                        break;
                    default:
                        valRes.label_name = valRes.user_email;
                        valRes.label_topic = valRes.topic_name;
                        break;
                }
                // <li class="chat-${valRes.chat_id} pointer" onclick="assignChat('${valRes.user_email}', '${valRes.chat_id}', '${valRes.message}', '${valRes.user_name}','${valRes.id_users}','${valRes.id_channel}')">

                $("#dt_pending").append(`
                    <li class="chat-${valRes.chat_id} pointer" onclick="assignChat('${valRes.chat_id}')">
                        <a>
                            <div class="media">

                                <div class="user-img online align-self-center mr-3">
                                    <img src="${valRes.user_avatar}" class="rounded-circle avatar-xs header-profile-user img-object-fit-cover" alt="">
                                    <span class="user-status"></span>
                                </div>

                                <div class="media-body overflow-hidden">
                                    <h5 class="text-truncate font-size-14 mb-1">${valRes.label_name} - Pending</h5>
                                    <p class="text-truncate mb-0">${valRes.label_topic}</p>
                                    <p class="text-truncate mb-0">${message}</p>
                                </div>
                                <div class="font-size-11">${date}</div>
                            </div>
                        </a>
                    </li>
                `);
            });
        }
    };

    getListPending = () => {
        const config = {
            method: "POST",
            url: `${base_url_live}/api/chat/agent/list-chat/pending`,
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: "Bearer " + window.tk,
            },
        };
        axios(config)
            .then((response) => {
                const resData = response.data;
                this.renderListPending(resData.data);
            })
            .catch((err) => {
                console.log(err);
                // localStorage.clear();
                // location.href = "/login";
            });
    };

    /* get on Going list */
    renderListOnGoing = async (data) => {
        const unread_chat = data.unread_chat;
        const chat_count = data.chat_count;
        this.allResultListOnGoing = {};
        $("#counting-onGoing").removeClass(
            "badge rounded-pill badge-tangerin-500 font-size-12"
        );
        $("#counting-onGoing").empty();
        $("#dtOngoing").empty();

        if (unread_chat > 0) {
            $("#counting-onGoing").addClass(
                "badge rounded-pill badge-tangerin-500 font-size-12"
            );
            $("#counting-onGoing").append(
                `${this.numeringCounter(unread_chat, 1)}`
            );
        }

        if (chat_count > 0) {
            let chat_id = !this.dataDetail ? null : this.dataDetail.chat_id;
            this.allResultListOnGoing = data.list;
            window.dtOnGoing = data.list;

            await data.list.forEach((valRes) => {
                let coditionMsg = {
                    file_path: valRes.file_path,
                    file_type: valRes.file_type,
                    file_url: valRes.file_url,
                    message: valRes.message,
                    id_agent: !valRes.id_agent ? null : valRes.id_agent,
                    name_agent: !valRes.agent_name ? null : valRes.agent_name,
                    email_agent: !valRes.agent_email
                        ? null
                        : valRes.agent_email,
                    is_sender: valRes.is_sender,
                    typeMenu: "onGoing",
                };
                let message = this.conditionMessageInList(coditionMsg);
                let date = this.parseDateChatt(valRes.formatted_date);
                switch (valRes.id_channel) {
                    case 3:
                        valRes.label_name = valRes.user_name;
                        valRes.label_topic = "-";
                        break;
                    case "3":
                        valRes.label_name = valRes.user_name;
                        valRes.label_topic = "-";
                        break;
                    case 2:
                        valRes.label_name = valRes.user_phone;
                        valRes.label_topic = "-";
                        break;
                    case "2":
                        valRes.label_name = valRes.user_phone;
                        valRes.label_topic = "-";
                        break;
                    default:
                        valRes.label_name = valRes.user_email;
                        valRes.label_topic = valRes.topic_name;
                        break;
                }
                $("#dtOngoing").append(`
                    <li class="chat-${valRes.chat_id} pointer on-going-list" onclick="adminObj.getDetailOnGoingChat('${valRes.chat_id}')">
                        <a>
                            <div class="media">
                                <div class="user-img online align-self-center mr-3">
                                    <img src="${valRes.user_avatar}" class="rounded-circle avatar-xs header-profile-user" alt="thumbnail-chat">
                                    <span class="user-status"></span>
                                </div>

                                <div class="media-body overflow-hidden">
                                    <h5 class="text-truncate font-size-14 mb-1">${valRes.label_name}</h5>
                                    <p class="text-truncate mb-0">${valRes.label_topic}</p>
                                    <p class="text-truncate mb-0">${message}</p>
                                    <div id="label-${valRes.chat_id}"></div>
                                </div>
                                <div class="mb-0">
                                    <p id="date-${valRes.chat_id}">${date}</p>
                                    <p id="counting-${valRes.chat_id}"></p>
                                </div>
                            </div>
                        </a>
                    </li>
                `);

                if (valRes.chat_labels.length > 0) {
                    valRes.chat_labels.forEach((valLabel) => {
                        $(`#label-${valRes.chat_id}`).append(`
                            <span class="badge badge-secondary font-size-14 mt-1" style="background:${valLabel.label_color}">
                                <b>${valLabel.label_name}</b>
                            </span>
                        `);
                    });
                }

                if (valRes.unread_count > 0) {
                    let counting = this.numeringCounter(valRes.unread_count, 1);
                    $(`#date-${valRes.chat_id}`).attr(
                        "style",
                        "margin-bottom:5px"
                    );
                    $(`#counting-${valRes.chat_id}`).addClass(
                        "badge rounded-pill badge-tangerin-500 float-right font-size-12"
                    );
                    $(`#counting-${valRes.chat_id}`).append(counting);
                    $(`#counting-${valRes.chat_id}`).show();
                } else {
                    $(`#counting-${valRes.chat_id}`).remove();
                }

                if (chat_id == valRes.chat_id) {
                    $(`.chat-${chat_id}`).addClass("active");
                }
            });
        }
    };

    getListOnGoing = () => {
        const config = {
            method: "post",
            url: `${base_url_live}/api/chat/agent/list-chat/ongoing`,
            headers: {
                Authorization: `Bearer ${window.tk}`,
                "X-Requested-With": "xmlhttprequest",
                "Content-Type": "application/json",
            },
        };

        axios(config)
            .then((response) => {
                const resData = response.data;
                this.renderListOnGoing(resData.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    /* get pending transfer list */
    renderListPendingTransfer = (data) => {
        const chat_count = data.chat_count;
        this.allResultListPendingTransfer = {};

        $("#counting-pending-transfer").removeClass(
            "badge rounded-pill badge-tangerin-500 font-size-12"
        );
        $("#counting-pending-transfer").empty();
        $("#dt_pending_transfer").empty();

        if (chat_count > 0) {
            $("#counting-pending-transfer").addClass(
                "badge rounded-pill badge-tangerin-500 font-size-12"
            );
            $("#counting-pending-transfer").append(
                `${this.numeringCounter(chat_count, 1)}`
            );

            this.allResultListPendingTransfer = data.list;
            window.dtPendingTransfer = data.list;

            data.list.forEach((valRes) => {
                let coditionMsg = {
                    file_path: valRes.file_path,
                    file_type: valRes.file_type,
                    file_url: valRes.file_url,
                    message: valRes.message,
                    id_agent: !valRes.id_agent ? null : valRes.id_agent,
                    name_agent: !valRes.agent_name ? null : valRes.agent_name,
                    email_agent: !valRes.agent_email
                        ? null
                        : valRes.agent_email,
                    is_sender: valRes.is_sender,
                    typeMenu: "pendingTransfer",
                };
                let message = this.conditionMessageInList(coditionMsg);
                let date = this.parseDateChatt(valRes.formatted_date);
                switch (valRes.id_channel) {
                    case 3:
                        valRes.label_name = valRes.user_name;
                        valRes.label_topic = "-";
                        break;
                    case "3":
                        valRes.label_name = valRes.user_name;
                        valRes.label_topic = "-";
                        break;
                    case 2:
                        valRes.label_name = valRes.user_phone;
                        valRes.label_topic = "-";
                        break;
                    case "2":
                        valRes.label_name = valRes.user_phone;
                        valRes.label_topic = "-";
                        break;
                    default:
                        valRes.label_name = valRes.user_email;
                        valRes.label_topic = valRes.topic_name;
                        break;
                }
                $("#dt_pending_transfer").append(`
                    <li class="chat-${valRes.chat_id} pointer on-going-list" onclick="adminObj.getDetailPendingTransfer('${valRes.chat_id}')">
                        <a>
                            <div class="media">
                                <div class="user-img online align-self-center mr-3">
                                    <img src="${valRes.user_avatar}" class="rounded-circle avatar-xs header-profile-user img-object-fit-cover" alt="thumbnail-chat">
                                    <span class="user-status"></span>
                                </div>

                                <div class="media-body overflow-hidden">
                                    <h5 class="text-truncate font-size-14 mb-1">${valRes.label_name}</h5>
                                    <p class="text-truncate mb-0">${valRes.label_topic}</p>
                                    <p class="text-truncate mb-0">${message}</p>
                                    <div id="label-${valRes.chat_id}"></div>
                                </div>
                                <div class="mb-0">
                                    <p id="date-${valRes.chat_id}">${date}</p>
                                    <p id="counting-${valRes.chat_id}"></p>
                                </div>
                            </div>
                        </a>
                    </li>
                `);

                if (valRes.chat_labels.length > 0) {
                    valRes.chat_labels.forEach((valLabel) => {
                        $(`#label-${valRes.chat_id}`).append(`
                            <span class="badge badge-secondary font-size-14 mt-1" style="background:${valLabel.label_color}">
                                <b>${valLabel.label_name}</b>
                            </span>
                        `);
                    });
                }

                if (valRes.unread_count > 0) {
                    let counting = this.numeringCounter(valRes.unread_count, 1);
                    $(`#date-${valRes.chat_id}`).attr(
                        "style",
                        "margin-bottom:5px"
                    );
                    $(`#counting-${valRes.chat_id}`).addClass(
                        "badge rounded-pill badge-tangerin-500 float-right font-size-12"
                    );
                    $(`#counting-${valRes.chat_id}`).append(counting);
                    $(`#counting-${valRes.chat_id}`).show();
                } else {
                    $(`#counting-${valRes.chat_id}`).remove();
                }
            });
        }
    };

    getListPendingTransfer = () => {
        const config = {
            method: "post",
            url: `${base_url_live}/api/chat/agent/list-chat/pendingtransfer`,
            headers: {
                Authorization: `Bearer ${window.tk}`,
                "X-Requested-With": "xmlhttprequest",
                "Content-Type": "application/json",
            },
        };

        axios(config)
            .then((response) => {
                const resData = response.data;
                this.renderListPendingTransfer(resData.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    /* get history list */
    renderListHistory = (data) => {
        const chat_count = data.chat_count;
        this.allResultListHistory = {};
        let chat_id = !this.dataDetail ? null : this.dataDetail.chat_id;
        window.dataHistory = {};
        $("#dt_history").empty();
        if (chat_count > 0) {
            this.allResultListHistory = data.list;
            window.dataHistory = data.list;
            this.allResultListHistory.forEach((valRes) => {
                let coditionMsg = {
                    file_path: valRes.file_path,
                    file_type: valRes.file_type,
                    file_url: valRes.file_url,
                    message: valRes.message,
                    id_agent: !valRes.id_agent ? null : valRes.id_agent,
                    name_agent: !valRes.agent_name ? null : valRes.agent_name,
                    email_agent: !valRes.agent_email
                        ? null
                        : valRes.agent_email,
                    is_sender: valRes.is_sender,
                    typeMenu: "pendingTransfer",
                };

                let message = this.conditionMessageInList(coditionMsg);
                let date = this.parseDateChatt(valRes.formatted_date);
                $("#dt_history").append(`
                    <li class="chat-${valRes.chat_id} onGoing pointer" onclick="adminObj.getDetailHistory('${valRes.chat_id}')">
                        <a>
                            <div class="media">
                                <div class="user-img online align-self-center mr-3">
                                    <img src="${valRes.user_avatar}"
                                        class="rounded-circle avatar-xs header-profile-user img-object-fit-cover" alt="">
                                </div>

                                <div class="media-body overflow-hidden">
                                    <h5 class="text-truncate font-size-14 mb-1">${valRes.user_name}</h5>
                                    <p class="text-truncate mb-0">${message}</p>
                                    <div id="label-${valRes.chat_id}"></div>
                                    <div id="rate-${valRes.chat_id}"></div>
                                </div>
                                <div class="font-size-11">${date}</div>
                            </div>
                        </a>
                    </li>
                `);
                if (Boolean(valRes.rating)) {
                    let str = "";
                    for (let i = 0; i < 5; i++) {
                        if (i < valRes.rating) {
                            str += '<span class="fa fa-star checked"></span>';
                        } else {
                            str += '<span class="fa fa-star"></span>';
                        }
                    }

                    $(`#rate-${valRes.chat_id}`).append(str);
                } else {
                    $(`#rate-${valRes.chat_id}`).empty();
                }

                if (valRes.chat_labels.length > 0) {
                    valRes.chat_labels.forEach((valLabel) => {
                        $(`#label-${valRes.chat_id}`).append(`
                            <span class="badge badge-secondary font-size-14 mt-1" style="background:${valLabel.label_color}">
                                <b>${valLabel.label_name}</b>
                            </span>
                        `);
                    });
                }

                if (valRes.chat_id == chat_id) {
                    $(`#chat-${chat_id}`).addClass("active");
                }
            });
        }
    };

    getListHistory = (keyword) => {
        let e = this;
        const config = {
            method: "post",
            url: `${base_url_live}/api/chat/agent/list-chat/resolved`,
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: "Bearer " + window.tk,
            },
            data: {
                keyword: keyword == undefined || !keyword ? "" : keyword,
            },
        };

        axios(config)
            .then(function (response) {
                const resData = response.data;
                e.renderListHistory(resData.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    /* routing message welcome,close, and await */
    getMessage(meta, params = false) {
        var config = {
            method: "POST",
            url: `${base_url_live}/api/chat/agent/messages/default?meta=${meta}`,
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: "Bearer " + window.tk,
            },
        };

        if (Boolean(params)) {
            config.data = params;
        }

        return axios(config)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                return {
                    data: null,
                    message: "Message Empty!",
                };
            });
    }

    /* assign chat pending from agent */
    ambilChat = async () => {
        let token = localStorage.getItem("tk");
        let chat_id = this.dataDetail.chat_id;
        let agent_name = localStorage.getItem("name");
        let id_users_client = this.dataDetail.id_users;
        let id_channel = this.dataDetail.id_channel;

        let message = "Connected with agent";
        this.postAssignChat(chat_id).then(async (response) => {
            try {
                const dataMessage = await this.getMessage("welcome_message", {
                    chat_id,
                });
                if (dataMessage.data.status == 1) {
                    message = dataMessage.data.value;
                }
            } catch (error) {
                console.warn("welcome message is empty!");
            }

            let params = {
                content: message,
                token,
                chat_id,
                id_users: id_users_client,
                id_agent: this.agent_id,
                message,
                id_channel,
                agent_name,
            };
            this.postReplyChat(params);
            this.socket.emit("assign_client", params);

            if (id_channel == 3) {
                this.socket.emit("replyToClientTeleg", params);
            } else if (id_channel == 2) {
                this.socket.emit("replyToClientWa", params);
            }

            localStorage.setItem("email_client", this.dataDetail.user_email);
            localStorage.setItem("last_action", "ambil_chat");
        });
    };

    /* assign client chatting */
    postAssignChat = (chat_id) => {
        var config = {
            method: "POST",
            url: `${base_url_live}/api/chat/agent/status/update`,
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: "Bearer " + window.tk,
            },
            data: {
                chat_id: chat_id,
                status: 1,
            },
        };
        return axios(config);
    };

    postReplyChat = (params) => {
        var config = {
            method: "POST",
            url: `${base_url_live}/api/chat/agent/replytoclient`,
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: "Bearer " + window.tk,
            },
            data: {
                chat_id: params.chat_id,
                id_users: params.id_users,
                id_agent: params.id_agent,
                message: params.message,
            },
        };
        return axios(config);
    };

    /* close chat metode and function */
    postCloseChat = (chat_id) => {
        var config = {
            method: "POST",
            url: `${base_url_live}/api/chat/agent/status/update`,
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: "Bearer " + window.tk,
            },
            data: {
                chat_id: chat_id,
                status: 9,
            },
        };
        return axios(config);
    };

    closeChat = () => {
        let token = localStorage.getItem("tk");
        let chat_id = this.dataDetail.chat_id;
        let agent_name = localStorage.getItem("name");
        let id_users_client = this.dataDetail.id_users;
        let id_channel = this.dataDetail.id_channel;
        this.postCloseChat(chat_id).then(async () => {
            let message = "Thanks your ask to me";
            try {
                const dataMessage = await this.getMessage("closing_message", {
                    chat_id,
                });

                if (dataMessage.data != null && dataMessage.data.status != 0) {
                    message = dataMessage.data.value;
                }
            } catch (error) {
                console.warn(error);
            }

            const params = {
                content: message,
                token,
                chat_id,
                id_users: id_users_client,
                id_agent: this.agent_id,
                agent_id: this.agent_id,
                agent_name: agent_name,
                message,
                id_channel,
            };

            this.postReplyChat(params);

            this.socket.emit("close_chat", params);

            if (id_channel == 3) {
                this.socket.emit("replyToClientTeleg", params);
            }

            if (id_channel == 2) {
                this.socket.emit("replyToClientWa", params);
            }

            displayNoChatting();
            $("#display_chat").hide();
            $("#current_client_name").text("");
        });
    };

    logout = () => {
        this.socket.emit("logout", {
            agent_id: this.agent_id,
        });
    };

    clearLayoutChat = () => {
        $("#IC").empty();
        $("#current_client_name").empty();
        $("#current_client_mail").empty();
        $("#sendMsg").hide();
        $("#input_chat").val("");
        $("#btnMsg").empty();
        $(".header").removeClass("user-chat-border");
        $("#btnMsg").empty();
        $("#header-right-inside").empty();
        $(".on-going-list").removeClass("active");
    };

    /* right and left menu detail chat */
    menuRightDetailChat = (menu = false) => {
        if (!Boolean(menu)) {
            $("#header-right-inside").append(`
                <div class="dropdown chat-noti-dropdown">
                    <button class="btn dropdown-toggle mr-3" type="button" title="choose file" onclick="attachFileChat()">
                        <i class="fas fa-paperclip font-size-20"></i>
                    </button>
                    <button class="btn dropdown-toggle" type="button" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-ellipsis-v font-size-20"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a class="dropdown-item pointer" onclick="closeChat()">
                            <i class="fas fa-check  text-success mr-2"></i> Solved
                        </a>
                        <a class="dropdown-item pointer" onclick="adminObj.formTransferChat()">
                            <i class="fas fa-exchange-alt  text-warning mr-2"></i> Transfer
                        </a>
                        <a class="dropdown-item pointer" onclick="formLabels()">
                            <i class="fas fa-tags  text-soft-tangerin mr-2"></i> Labels
                        </a>
                    </div>
                </div>
            `);
        } else {
            $("#header-right-inside").append(`
                <div class="dropdown chat-noti-dropdown">
                    <button class="btn dropdown-toggle" type="button" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-ellipsis-v font-size-20"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a class="dropdown-item pointer" onclick="adminObj.showFormSendHistory()">
                            <i class="fas fa-paper-plane mr-2 text-tangerin"></i> Send History
                        </a>
                    </div>
                </div>
            `);
        }
    };

    menuLeftDetailChat = () => {
        let label_name = "";
        if (this.dataDetail.id_channel == 3) {
            label_name = this.dataDetail.user_name;
            $("#current_client_mail").hide();
        } else if (this.dataDetail.id_channel == 2) {
            label_name = !this.dataDetail.user_name
                ? this.dataDetail.user_phone
                : this.dataDetail.user_name;
            $("#current_client_mail").hide();
        } else {
            label_name = this.dataDetail.user_name;
            $("#current_client_mail").text(this.dataDetail.user_email);
        }
        $("#current_client_name").text(label_name);
    };

    configTelegram() {
        // set data
        var inputData = {
            inputPhone: "+62895360151371", // phone number for testing
            inputApiId: "",
            inputApiHash: "",
            token: window.tk,
        };
        this.socket.emit("inputDataTelegram", inputData);
    }

    sendCode() {
        // get data/code from user input
        let inputCode = $("#input-code").val();

        // emit the code to submitCodeTelegram
        this.socket.emit("submitCodeTelegram", inputCode);
    }

    devOauthClient() {
        let inputDomain = $("#input-domain").val();
        let inputData = {
            domain: inputDomain,
            action: "save", // save|remove
        };
        this.socket.emit("manageDomain", inputData);
    }
}
