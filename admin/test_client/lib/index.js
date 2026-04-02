class QwordsChat {
    constructor() {
        this.emojiValue = "";
        this.state_page = "icon";
        /* origin url */
        var originName = location.origin;
        let fileJs = "";

        /* condition url */
        // this.BASE_URL = null;
        this.BASE_URL = "http://localhost:8000";
        this.asset_base = `${location.origin}/`;
        this.base = "http://localhost:8000";
        // if (
        //     ["127.0.0.1", "127.0.0.0", "localhost", "local"].includes(
        //         location.hostname
        //     )
        // ) {
        //     this.BASE_URL = "http://localhost:8000";
        //     this.asset_base = `${location.origin}/`;
        //     this.base = "http://localhost:8000";
        // } else {
        //     this.BASE_URL = "https://chatvolution.my.id";
        //     this.asset_base = "http://127.0.0.1:8080/";
        //     this.base = "https://chatvolution.my.id";
        // }
        /* get origin url*/
        this.uri = location.origin;

        this.api_key = localStorage.getItem("api_key");
        this.idFile = null;
        this.uploadModal = false;
    }

    dateIsoToNormal = (date) => {
        return date.replace("T", " ").substring(0, 19);
    };

    parseDateChatt = (date) => {
        console.log(date);
    };

    async loadTemplate() {
        const reshtml = await fetch(
            this.asset_base + "lib/assets/chat.html"
        ).then((r) => r.text());
        const resstyle = await fetch(
            this.asset_base + "lib/assets/style.html"
        ).then((r) => r.text());
        document.head.insertAdjacentHTML("beforeend", resstyle);
        document.body.insertAdjacentHTML("beforeend", reshtml);
        QChat.render();
    }

    async mappingUI() {
        const topic = await this.getTopic();
        const department = await this.getDepartment();
        const getSosmed = await this.getUrlSosmed();

        let elTitleSocialMedia = document.querySelector(
            ".cevo-title-social-media"
        );

        let elBtnSocialMedia = document.querySelector(".cevo-btn-social-media");

        elTitleSocialMedia.innerHTML = "";
        elBtnSocialMedia.innerHTML = "";

        topic.data.forEach((el) => {
            const list = document.querySelector("#input_topic");
            list.insertAdjacentHTML(
                "beforeend",
                `<option value="${el.id}"> ${el.name} </option>`
            );
        });

        department.data.forEach((el) => {
            const list = document.querySelector("#input_department");
            list.insertAdjacentHTML(
                "beforeend",
                `<option value="${el.id}"> ${el.name} </option>`
            );
        });

        if (getSosmed.data.length > 0) {
            getSosmed.data.forEach(async (valData) => {
                let urlSosmed = "";
                if (valData.chat_channel_id == 2) {
                    urlSosmed = `https://api.whatsapp.com/send?phone=${valData.phone_number}&text=Halo!`;
                } else {
                    urlSosmed = `https://t.me/${valData.phone_number}`;
                }

                document.querySelector(".cevo-title-social-media").innerHTML = `
                    <span class="rate-header cmb-1">
                        Atau
                    </span>
                `;

                await document
                    .querySelector(".cevo-btn-social-media")
                    .insertAdjacentHTML(
                        "beforeend",
                        `
                        <a href="${urlSosmed}" target="_blank"
                            class="cevo-btn send cevo-btn-secondary cmr-1" style="width: auto">
                            <img src="http://127.0.0.1:8080/lib/assets/${valData.chat_channel_name.toLowerCase()}.svg" style="width: 18px" />
                        </a>
                    `
                    );
            });
        }

        console.log(getSosmed);
    }

    async getChannel() {
        var myHeaders = new Headers();
        myHeaders.append("X-Requested-With", "xmlhttprequest");

        var requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };

        const res = fetch(
            this.base + "/client_ui/channel",
            requestOptions
        ).then((response) => response.json());
        return res;
    }

    async getTopic() {
        var myHeaders = new Headers();
        myHeaders.append("X-Requested-With", "xmlhttprequest");

        var requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };

        const res = fetch(
            this.base + `/api/available-topics/list?api_key=${this.api_key}`,
            requestOptions
        ).then((response) => response.json());
        return res;
    }

    getUrlSosmed = () => {
        var myHeaders = new Headers();
        myHeaders.append("X-Requested-With", "xmlhttprequest");

        var requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };

        const res = fetch(
            this.base +
                `/api/available-channel-account/list?api_key=${this.api_key}`,
            requestOptions
        ).then((response) => response.json());

        return res;
    };

    async getDepartment() {
        var myHeaders = new Headers();
        myHeaders.append("X-Requested-With", "xmlhttprequest");

        var requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };

        const res = fetch(
            this.base +
                `/api/available-departments/list?api_key=${this.api_key}`,
            requestOptions
        ).then((response) => response.json());
        return res;
    }

    async getMyChat(chat_id) {
        var myHeaders = new Headers();
        myHeaders.append("X-Requested-With", "xmlhttprequest");
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                chat_id: chat_id,
            }),
        };

        const res = fetch(
            this.base + "/api/chat/history-detail?api_key=" + this.api_key,
            requestOptions
        ).then((response) => response.json());
        return res;
    }

    handleClickDirectChat() {
        if (this.state_page == "selection") {
            document.querySelector(".qchat-form").style.display = "block";
            document.querySelector(".qchat-selection").style.display = "none";

            this.state_page = "chat_form";
        }
    }

    handleClickIcon() {
        if (this.state_page == "icon") {
            document.querySelector(".qchat-main").style.display = "block";
            document.querySelector(".qchat-selection").style.display = "block";
            this.state_page = "selection";
        } else {
            document.querySelector(".qchat-main").style.display = "none";
            this.state_page = "icon";
        }
    }

    handleClickStartChat() {
        this.socket.connect();

        let name = document.getElementById("input_name").value;
        let email = document.getElementById("input_email").value;
        let message = document.getElementById("input_msg").value;

        if (!Boolean(name) || !Boolean(email) || !Boolean(message)) {
            snackBar("name, email, message is required!", "danger", 5000);
            return;
        }

        const data = {
            id_channel: 1,
            name,
            email,
            id_topic: document.getElementById("input_topic").value,
            id_department: document.getElementById("input_department").value,
            message,
            api_key: this.api_key,
        };

        var config = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Requested-With": "xmlhttprequest",
            },
            body: JSON.stringify(data),
        };

        fetch(`${this.base}/api/chat/new?api_key=${this.api_key}`, config)
            .then((r) => r.json())
            .then((r) => {
                let elDropdownChat = document.querySelector(".dropdownCht");
                elDropdownChat.innerHTML = "";
                elDropdownChat.innerHTML = `
                    <button onclick="toggleMenuChat()" class="dropbtnCht text-chat-dark text-bold toggleCevo">
                        <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                    </button>
                    <div id="myDropdown" class="dropdownCht-content">
                        <a href="javascript:QChat.solveChat()"
                            class="text-chat-danger solve-chat">
                            Solved Chat
                        </a>
                    </div>
                `;
                let dataRes = r.data;
                const dataRenderChat = {
                    message: dataRes.message,
                    idCardChat: dataRes.unique_id,
                    date: new Date(dataRes.formatted_date).toLocaleString(),
                    displayName: "Me",
                    file_type: dataRes.file_type,
                    file_url: dataRes.file_url,
                    file_name: dataRes.file_name,
                    file_path: dataRes.file_path,
                    classChat: Boolean(dataRes.id_agent) ? "other" : "me",
                };
                this.renderBubbleChat(dataRenderChat);

                this.socket.emit("new_chat", r.data);
                localStorage.setItem("chatID", r.data.chat_id);
                localStorage.setItem("userID", r.data.id_users);
                document.getElementById("cevo_reply_chat").style.display =
                    "block";
                document.getElementById("cevo_init_chat").style.display =
                    "none";
                document
                    .getElementById("circle")
                    .setAttribute("onclick", "QChat.hideDetailChat()");
                snackBar(
                    "Success start chat, please wait agent response your chat",
                    "success",
                    5000
                );
            });
    }

    handleClickSendChat() {
        if (!Boolean(this.from_who)) {
            snackBar("Chat is not handled by agent", "warning", 5000);
            return;
        }

        const content = document.querySelector("#qchat-input").value;
        const chatID = localStorage.getItem("chatID");
        const id_users = localStorage.getItem("userID");

        var agent_id = window.current_agent_id;
        if (!Boolean(agent_id)) {
            agent_id = localStorage.getItem("agent_id");
        }

        if (!content) {
            snackBar("message is required", "warning", 5000);
            return;
        }

        const data_post = {
            chat_id: chatID,
            id_users: id_users,
            id_agent: agent_id,
            message: content,
        };

        const config = {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(data_post),
            method: "POST",
        };

        fetch(this.base + `/api/chat/reply?api_key=${this.api_key}`, config)
            .then((response) => response.json())
            .then(async (r) => {
                console.log("response send chat:", r);
                document.querySelector("#qchat-input").value = "";
                const dataRes = r.data;
                const dataRenderChat = {
                    message: dataRes.message,
                    idCardChat: dataRes.unique_id,
                    date: new Date(dataRes.formatted_date).toLocaleString(),
                    displayName: "Me",
                    file_type: dataRes.file_type,
                    file_url: dataRes.file_url,
                    file_name: dataRes.file_name,
                    file_path: dataRes.file_path,
                    classChat: "me",
                };
                await this.renderBubbleChat(dataRenderChat);

                dataRes.agent_id = data_post.id_agent;
                this.socket.emit("private_chat", dataRes);
                setTimeout(() => {
                    var element = document.getElementById("chat-box-list");
                    element.scrollTop = element.scrollHeight;
                }, 1500);
            });
    }

    chooseFile = () => {
        const fileInput = document.getElementById("fileupload").files[0];
        const fileName = document.getElementById("filename");

        if (!fileInput) {
            fileName.value = "";
            fileName.placeholder = "no file uploaded";
            this.clearAlertMessageUploadFile();
        } else {
            let extensionFileAllowed = [
                "gif",
                "ico",
                "jpg",
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
                "pdf",
                "zip",
                "7z",
                "rar",
                "bz",
                "bz2",
                "gz",
                "tar",
                "doc",
                "crt",
                "csr",
                "docx",
                "txt",
                "xls",
                "xlsx",
            ];

            let fileExtension = fileInput.name.split(".");

            if (
                !extensionFileAllowed.includes(fileExtension[1].toLowerCase())
            ) {
                this.idFile = null;
                fileName.placeholder = "no file uploaded";
                fileName.value = null;
                this.clearAlertMessageUploadFile();

                return snackBar(
                    `File extension .${fileExtension[1]} is not supported!`,
                    "danger",
                    5000
                );
            }

            if (fileInput.size > 5242880) {
                this.idFile = null;
                fileName.placeholder = "no file uploaded";
                fileName.value = null;
                this.clearAlertMessageUploadFile();

                return snackBar(`File size max 5MB!`, "danger", 5000);
            }

            fileName.value = "wait upload file...";

            const formData = new FormData();
            formData.append("file", fileInput);

            const config = {
                method: "POST",
                headers: {
                    "X-Requested-With": "xmlhttprequest",
                },
                body: formData,
            };

            fetch(
                this.base + `/api/chat/upload-file?api_key=${this.api_key}`,
                config
            )
                .then((response) => response.json())
                .then(async (r) => {
                    const data = r.data;
                    fileName.value = data.name;
                    this.idFile = data.id;
                    this.clearAlertMessageUploadFile();
                    document.getElementById("alert-notready").style.display =
                        "none";
                    document.getElementById("alert-ready").style.display = null;
                });
        }
    };

    handleClickSendChatFile = () => {
        const message = !document.getElementById("messageUploadFIle").value
            ? ""
            : document.getElementById("messageUploadFIle").value;
        let agent_id = window.current_agent_id;

        if (!Boolean(agent_id)) {
            agent_id = localStorage.getItem("agent_id");
        }

        if (!Boolean(this.from_who)) {
            return snackBar("Chat is not handled by agent", "warning", 5000);
        }

        if (!this.idFile) {
            return snackBar("File is required!", "danger", 5000);
        }

        const chatID = localStorage.getItem("chatID");
        const id_users = localStorage.getItem("userID");

        const data_post = {
            chat_id: chatID,
            id_users,
            message,
            file_id: this.idFile,
        };

        const config = {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(data_post),
            method: "POST",
        };

        fetch(this.base + `/api/chat/reply?api_key=${this.api_key}`, config)
            .then((response) => response.json())
            .then(async (r) => {
                const dataRes = r.data;
                console.log(dataRes);
                this.idFile = null;
                this.closeUploadFile();

                const dataRenderChat = {
                    message: Boolean(dataRes.message) ? dataRes.message : "",
                    idCardChat: dataRes.unique_id,
                    date: new Date(dataRes.formatted_date).toLocaleString(),
                    displayName: "Me",
                    file_type: dataRes.file_type,
                    file_url: dataRes.file_url,
                    file_name: dataRes.file_name,
                    file_path: dataRes.file_path,
                    classChat: "me",
                };
                await this.renderBubbleChat(dataRenderChat);

                dataRes.agent_id = agent_id;

                this.socket.emit("private_chat_file", dataRes);

                setTimeout(() => {
                    var element = document.getElementById("chat-box-list");
                    element.scrollTop = element.scrollHeight;
                }, 1500);
            });
    };

    openNewChat() {
        var el = document.getElementById("cevo_init_chat");
        el.style.display = "block";

        const btnEl = document.getElementById("circle");
        btnEl.removeAttribute("onclick");
        btnEl.setAttribute("onclick", "QChat.closeChat()");
    }

    closeChat() {
        var el = document.getElementById("cevo_init_chat");
        el.style.display = "none";
        var el2 = document.getElementById("cevo_no_agent");
        el2.style.display = "none";
        var el3 = document.getElementById("cevo_reply_chat");
        el3.style.display = "none";

        const btnEl = document.getElementById("circle");
        btnEl.removeAttribute("onclick");
        btnEl.setAttribute("onclick", "QChat.openNewChat()");
    }

    /* new solve chat function */
    solveChat = async () => {
        let elBtnMsg = document.getElementById("btnMsg");

        let chat_id = localStorage.getItem("chatID");
        let agent_id = localStorage.getItem("agent_id");

        const dataEc = {
            api_key: this.api_key,
            chat_id,
            agent_id,
        };

        localStorage.setItem("data_ec", JSON.stringify(dataEc));

        await this.socket.emit("solve_chat", dataEc);
    };

    render() {
        var script = document.createElement("script");
        script.src = "https://cdn.socket.io/3.1.3/socket.io.min.js";

        document.head.appendChild(script);
        script.onload = this.onSocketLoaded.bind(this);
    }

    async handleRate(params) {
        var chatID = localStorage.getItem("chatID");
        var id_agent = localStorage.getItem("agent_id");

        const data_post = {
            chat_id: chatID,
            id_agent: id_agent,
            rating: params.value,
        };

        const config = {
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(data_post),
            method: "POST",
        };

        const response = await fetch(
            this.base + `/api/chat/submit-rating?api_key=${this.api_key}`,
            config
        ).then((response) => response.json());

        snackBar("You clear chatting with team support", "info", 5000);

        customClearLocalStorage();

        this.socket.disconnect();
        document
            .getElementById("circle")
            .setAttribute("onclick", "QChat.closeChat()");

        document.getElementById("chat-box-list").innerHTML = "";

        document.getElementById("input_name").value = null;
        document.getElementById("input_email").value = null;
        document.getElementById("input_msg").value = null;

        document.getElementById("cevo_reply_chat").style.display = "none";
        document.getElementById("cevo_init_chat").style.display = "block";
        {
            /* <button onclick="QChat.showEmoji()"  type="button" class="cevo-emoji send btn-emoji" style="width: auto">
                    <i class="fa fa-smile-o" aria-hidden="true"></i>
                </button> */
        }
        document.getElementById("btnMsg").innerHTML = `
            <div class="cevo-send">

                <input type="text" class="cevo-control chat-input" id="qchat-input"
                    placeholder="Enter Message..." style="width: 100%" />
                <button onclick="QChat.showUploadFile()" class="cevo-btn send cmr-1" style="width: auto">
                    <i class="fa fa-paperclip" aria-hidden="true"></i>
                </button>
                <button type="submit" class="cevo-btn send" onclick="QChat.handleClickSendChat()"
                    style="width: auto">
                    <img src="http://127.0.0.1:8080/lib/assets/send-plane-2-fill.png"
                        style="width: 14px" />
                </button>
            </div>
        `;
    }

    renderBubbleChat = async (data) => {
        const options = {
            target: "_blank",
            className: "__bubble-url-chat",
        };
        console.log(data);
        if (!data.file_path) {
            await document.querySelector("#chat-box-list").insertAdjacentHTML(
                "beforeend",
                `
                <div class="box-chat ${data.classChat}">
                    <div class="container">
                        <div class="name">${data.displayName}</div>
                        <div class="chat-body">
                            <div class="message msg-${data.idCardChat}">${data.message}</div>
                        </div>
                        <div class="time">${data.date}</div>
                    </div>
                </div>
            `
            );

            if (Boolean(data.message)) {
                linkifyElement(
                    document.querySelector(`.msg-${data.idCardChat}`),
                    options
                );
            }
        } else {
            if (!data.file_url) {
                await document
                    .querySelector("#chat-box-list")
                    .insertAdjacentHTML(
                        "beforeend",
                        `
                    <div class="box-chat ${data.classChat}">
                        <div class="container">
                            <div class="name">${data.displayName}</div>
                            <div class="chat-body">
                                <div style="object-fit: cover;width: 100%;height: 50%; margin-bottom:1rem">
                                    <img onmousedown="return false" id="preview-file" style="max-width:100%" src="${this.BASE_URL}/assets/images/small/img-4.jpg" />
                                </div>
                                <div class="message msg-${data.idCardChat}">${data.message}</div>
                            </div>
                            <div class="time">${data.date}</div>
                        </div>
                    </div>
                `
                    );
                if (Boolean(data.message)) {
                    linkifyElement(
                        document.querySelector(`.msg-${data.idCardChat}`),
                        options
                    );
                }
            } else {
                if (data.file_type == "image") {
                    await document
                        .querySelector("#chat-box-list")
                        .insertAdjacentHTML(
                            "beforeend",
                            `
                        <div class="box-chat ${data.classChat}">
                            <div class="container">
                                <div class="name">${data.displayName}</div>
                                <div class="chat-body">
                                    <div style="object-fit: cover;width: 100%;height: 50%; margin-bottom:1rem">
                                        <a href="${data.file_url}" target="_blank">
                                            <img onmousedown="return false" id="preview-file" style="max-width:100%" src="${data.file_url}" />
                                        </a>
                                    </div>
                                    <div class="message msg-${data.idCardChat}">${data.message}</div>
                                </div>
                                <div class="time">${data.date}</div>
                            </div>
                        </div>
                    `
                        );
                    if (Boolean(data.message)) {
                        linkifyElement(
                            document.querySelector(`.msg-${data.idCardChat}`),
                            options
                        );
                    }
                } else {
                    let extensionFile = data.file_name.split(".");
                    await document
                        .querySelector("#chat-box-list")
                        .insertAdjacentHTML(
                            "beforeend",
                            `
                        <div class="box-chat ${data.classChat}">
                            <div class="container">
                                <div class="name">${data.displayName}</div>
                                <div class="chat-body">
                                    <div class="condition-file">
                                        <a class="url-preview" href="${data.file_url}" target="_blank">
                                            <img class="ico-download" onmousedown="return false" id="preview-file" src="${this.BASE_URL}/assets/images/icon/download.png" />
                                            <span class="file-name cml-1">${data.file_name}</span>
                                        </a>
                                    </div>
                                    <hr class="text-chat-white"/>
                                    <div class="cmt-1 message msg-${data.idCardChat}">${data.message}</div>
                                </div>
                                <div class="time">${data.date}</div>
                            </div>
                        </div>
                    `
                        );
                    if (Boolean(data.message)) {
                        linkifyElement(
                            document.querySelector(`.msg-${data.idCardChat}`),
                            options
                        );
                    }
                }
            }
        }
    };

    renderBtnMsg = (msg = null, alert = null) => {
        customClearLocalStorage();
        document
            .getElementById("circle")
            .setAttribute("onclick", "QChat.closeChat()");

        document.getElementById("chat-box-list").innerHTML = "";

        document.getElementById("input_name").value = null;
        document.getElementById("input_email").value = null;
        document.getElementById("input_msg").value = null;

        document.getElementById("cevo_reply_chat").style.display = "none";
        document.getElementById("cevo_init_chat").style.display = "block";
        var elBtnMsg = document.getElementById("btnMsg");

        // <button onclick="QChat.showEmoji()"  type="button" class="cevo-emoji send btn-emoji" style="width: auto">
        //             <i class="fa fa-smile-o" aria-hidden="true"></i>
        //         </button>

        elBtnMsg.innerHTML = `
            <div class="cevo-send">

                <input type="text" class="cevo-control chat-input" id="qchat-input"
                    placeholder="Enter Message..." style="width: 100%" />
                <button onclick="QChat.showUploadFile()" class="cevo-btn send cmr-1" style="width: auto">
                    <i class="fa fa-paperclip" aria-hidden="true"></i>
                </button>
                <button type="submit" class="cevo-btn send" onclick="QChat.handleClickSendChat()"
                    style="width: auto">
                    <img src="http://127.0.0.1:8080/lib/assets/send-plane-2-fill.png"
                        style="width: 14px" />
                </button>
            </div>
        `;
        this.closeChat();
        snackBar(
            msg == null ? "Your solve chat" : msg,
            alert == null ? "success" : alert,
            5000
        );
    };

    getDetailChat = (chatID) => {
        this.getMyChat(chatID).then(async (response) => {
            const dataRes = response.data;

            let elDropdownChat = document.querySelector(".dropdownCht");
            var elBtnMsg = document.getElementById("btnMsg");

            await dataRes.forEach((valDt) => {
                const dataRenderChat = {
                    message: !valDt.message ? "" : valDt.message,
                    idCardChat: valDt.unique_id,
                    date: new Date(valDt.formatted_date).toLocaleString(),
                    displayName: Boolean(valDt.id_agent)
                        ? valDt.agent_name
                        : "Me",
                    file_type: valDt.file_type,
                    file_url: valDt.file_url,
                    file_name: valDt.file_name,
                    file_path: valDt.file_path,
                    classChat: Boolean(valDt.id_agent) ? "other" : "me",
                };

                this.renderBubbleChat(dataRenderChat);

                if (valDt.status == 1) {
                    this.from_who = "ada";
                }
            });
            setTimeout(() => {
                var element = document.getElementById("chat-box-list");
                element.scrollTop = element.scrollHeight;
            }, 1500);

            if (dataRes[0].status != 9) {
                // <button onclick="QChat.showEmoji()" type="button" class="cevo-emoji send btn-emoji"
                //             style="width: auto">
                //             <i class="fa fa-smile-o" aria-hidden="true"></i>
                //         </button>
                document.getElementById("btnMsg").innerHTML = `
                    <div class="cevo-send">

                        <input type="text" class="cevo-control chat-input" id="qchat-input"
                            placeholder="Enter Message..." style="width: 100%" />
                        <button onclick="QChat.showUploadFile()" class="cevo-btn send cmr-1" style="width: auto">
                            <i class="fa fa-paperclip" aria-hidden="true"></i>
                        </button>
                        <button type="submit" class="cevo-btn send" onclick="QChat.handleClickSendChat()"
                            style="width: auto">
                            <img src="http://127.0.0.1:8080/lib/assets/send-plane-2-fill.png"
                                style="width: 14px" />
                        </button>
                    </div>
                `;

                elDropdownChat.innerHTML = `
                    <button onclick="toggleMenuChat()" class="dropbtnCht text-chat-dark text-bold toggleCevo">
                        <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                    </button>
                    <div id="myDropdown" class="dropdownCht-content">
                        <a href="javascript:QChat.solveChat()"
                            class="text-chat-danger solve-chat">
                            Solved Chat
                        </a>
                    </div>
                `;

                snackBar("The chat has been taken by the agent", "success");
                document
                    .getElementById("circle")
                    .setAttribute("onclick", "QChat.hideDetailChat()");

                document.getElementById("cevo_reply_chat").style.display =
                    "block";
                document.getElementById("cevo_init_chat").style.display =
                    "none";
            } else {
                if (dataRes[0].day_difference > 0) {
                    return this.renderBtnMsg(
                        "Sorry your chat has been closed,start a new chat?",
                        "warning"
                    );
                }

                if (dataRes[0].first_response == null) {
                    return this.renderBtnMsg(
                        "Sorry your chat has been closed",
                        "warning"
                    );
                }

                if (dataRes[0].rating != null) {
                    return this.renderBtnMsg(
                        "Sorry your chat has been rated",
                        "warning"
                    );
                }

                elDropdownChat.innerHTML = ``;
                elBtnMsg.innerHTML = `
                <p class="rate-header">
                    Rating dari kamu, berarti buat aku
                </p>
                <div class="cevo-lrate">
                    <button class="cevo-btn-tangerin cmr-1" value="1" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        1
                    </button>
                    <button class="cevo-btn-tangerin cmr-1" value="2" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        2
                    </button>
                    <button class="cevo-btn-tangerin cmr-1" value="3" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        3
                    </button>
                    <button class="cevo-btn-tangerin cmr-1" value="4" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        4
                    </button>
                    <button class="cevo-btn-tangerin cmr-1" value="5" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        5
                    </button>
                </div>
            `;
                // elBtnMsg.innerHTML = `
                //     <p class="rate-header">
                //         Rating dari kamu, berarti buat aku
                //     </p>
                //     <div class="stars">
                //         <input type="radio" name="difficulty" id="difficulty-1" value="5" onclick="QChat.handleRate(this)" hidden>
                //         <label for="difficulty-1">
                //             <i class="fa fa-star"></i>
                //             <i class="fa fa-star-o"></i>
                //         </label>
                //         <input type="radio" name="difficulty" id="difficulty-2" value="4" onclick="QChat.handleRate(this)" hidden>
                //         <label for="difficulty-2">
                //             <i class="fa fa-star"></i>
                //             <i class="fa fa-star-o"></i>
                //         </label>
                //         <input type="radio" name="difficulty" id="difficulty-3" value="3" onclick="QChat.handleRate(this)" hidden>
                //         <label for="difficulty-3">
                //             <i class="fa fa-star"></i>
                //             <i class="fa fa-star-o"></i>
                //         </label>
                //         <input type="radio" name="difficulty" id="difficulty-4" value="2" onclick="QChat.handleRate(this)" hidden>
                //         <label for="difficulty-4">
                //             <i class="fa fa-star"></i>
                //             <i class="fa fa-star-o"></i>
                //         </label>
                //         <input type="radio" name="difficulty" id="difficulty-5" value="1" onclick="QChat.handleRate(this)" hidden>
                //         <label for="difficulty-5">
                //                 <i class="fa fa-star"></i>
                //                 <i class="fa fa-star-o"></i>
                //         </label>
                //     </div>
                // `;
                document
                    .getElementById("circle")
                    .setAttribute("onclick", "QChat.hideDetailChat()");

                document.getElementById("cevo_reply_chat").style.display =
                    "block";
                document.getElementById("cevo_init_chat").style.display =
                    "none";
            }
        });
    };

    showDetailChat = () => {
        document.getElementById("cevo_reply_chat").style.display = "block";
        document.getElementById("cevo_init_chat").style.display = "none";
        document
            .getElementById("circle")
            .setAttribute("onclick", "QChat.hideDetailChat()");
    };

    hideDetailChat = () => {
        document.getElementById("cevo_reply_chat").style.display = "none";
        document.getElementById("cevo_init_chat").style.display = "none";
        document
            .getElementById("circle")
            .setAttribute("onclick", "QChat.showDetailChat()");
    };

    /* modal */
    showUploadFile = () => {
        console.warn("open modal upload");
        document.querySelector("#my-modal-uploaded").style.display = "block";
        this.uploadModal = true;
    };

    closeUploadFile = () => {
        console.warn("close modal upload");
        this.idFile = null;
        this.uploadModal = false;
        document.querySelector("#my-modal-uploaded").style.display = "none";
        document.getElementById("fileupload").value = null;
        document.getElementById("messageUploadFIle").value = null;
        document.getElementById("filename").value = null;
        this.clearAlertMessageUploadFile();
    };

    clearAlertMessageUploadFile = () => {
        document.getElementById("alert-ready").style.display = null;
        document.getElementById("alert-ready").style.display = "none";
        document.getElementById("alert-notready").style.display = null;
        document.getElementById("alert-notready").style.display;
    };

    setCaretPosition(ctrl, pos) {
        // Modern browsers
        if (ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos, pos);

            // IE8 and below
        } else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd("character", pos);
            range.moveStart("character", pos);
            range.select();
        }
    }

    doGetCaretPosition(oField) {
        // Initialize
        var iCaretPos = 0;

        // IE Support
        if (document.selection) {
            // Set focus on the element
            oField.focus();

            // To get cursor position, get empty selection range
            var oSel = document.selection.createRange();

            // Move selection start to 0 position
            oSel.moveStart("character", -oField.value.length);

            // The caret position is selection length
            iCaretPos = oSel.text.length;
        }

        // Firefox support
        else if (oField.selectionStart || oField.selectionStart == "0")
            iCaretPos =
                oField.selectionDirection == "backward"
                    ? oField.selectionStart
                    : oField.selectionEnd;

        // Return results
        return iCaretPos;
    }

    showEmoji = () => {
        let elBtnShowEmoji = document.querySelector(".btn-emoji");
        window.picker.togglePicker(elBtnShowEmoji);
    };

    pushMessageEmoji = () => {
        let elInputChat = document.querySelector("#qchat-input");
        let msgContent = elInputChat.value;
        if (msgContent.length < 1) {
            elInputChat.value = this.emojiValue;
            let resultAppend = document.querySelector("#qchat-input");
            let lengthText = resultAppend.value.length;
            this.setCaretPosition(resultAppend, lengthText);
        } else {
            let getPosition = this.doGetCaretPosition(elInputChat);
            console.log(elInputChat.selectionStart, elInputChat.selectionEnd);
            let result = msgContent.insertString(getPosition, this.emojiValue);
            elInputChat.value = result;
            elInputChat.selectionStart = elInputChat.selectionStart;
            elInputChat.selectionEnd = elInputChat.selectionEnd;
            elInputChat.focus();
        }
    };

    onSocketLoaded() {
        window.picker.on("emoji", (selection) => {
            this.emojiValue = selection.emoji;
            this.pushMessageEmoji();
        });

        var BASE_SOCKET = "http://localhost:4000/clients";

        // if (
        //     !["127.0.1.1", "localhost", "127.0.0.1"].includes(location.hostname)
        // ) {
        //     // BASE_SOCKET = "https://node.chatvolution.my.id/clients";
        //     BASE_SOCKET = "node2.chatvolution.my.id/clients";
        // }
        const chatID = localStorage.getItem("chatID");
        const sessionID = localStorage.getItem("sessionID");

        var sock_config = {
            autoConnect: true,
            auth: {
                api_key: this.api_key,
            },
        };
        if (Boolean(chatID)) {
            sock_config.auth = {
                chatID,
                api_key: this.api_key,
            };

            // continue chat
            this.getDetailChat(chatID);
        }

        if (Boolean(sessionID)) {
            sock_config.auth.sessionID = sessionID;
        }

        const socket = io(BASE_SOCKET, sock_config);
        if (Boolean(chatID)) {
            socket.connect();
        }

        this.socket = socket;

        socket.on("client:reset_session", () => {
            customClearLocalStorage();
        });

        socket.on("receiverChatWithFile", async (dataRes) => {
            window.current_agent_id = dataRes.id_agent;
            localStorage.setItem("agent_id", dataRes.id_agent);
            const dataRenderChat = {
                message: !dataRes.message ? "" : dataRes.message,
                idCardChat: dataRes.unique_id,
                date: new Date().toLocaleString(),
                displayName: Boolean(dataRes.id_agent)
                    ? dataRes.agent_name
                    : "Me",
                file_type: dataRes.file_type,
                file_url: dataRes.file_url,
                file_name: dataRes.file_name,
                file_path: dataRes.file_path,
                classChat: Boolean(dataRes.id_agent) ? "other" : "me",
            };
            await this.renderBubbleChat(dataRenderChat);
            this.from_who = "ada";

            setTimeout(() => {
                var element = document.getElementById("chat-box-list");
                element.scrollTop = element.scrollHeight;
            }, 1500);
        });

        socket.on("private_chat", async (dataRes) => {
            window.current_agent_id = dataRes.id_agent;
            localStorage.setItem("agent_id", dataRes.id_agent);

            const dataRenderChat = {
                message: !dataRes.message ? "" : dataRes.message,
                idCardChat: dataRes.unique_id,
                date: new Date().toLocaleString(),
                displayName: Boolean(dataRes.id_agent)
                    ? dataRes.agent_name
                    : "Me",
                file_type: dataRes.file_type,
                file_url: dataRes.file_url,
                file_name: dataRes.file_name,
                file_path: dataRes.file_path,
                classChat: Boolean(dataRes.id_agent) ? "other" : "me",
            };
            await this.renderBubbleChat(dataRenderChat);
            this.from_who = "ada";

            setTimeout(() => {
                var element = document.getElementById("chat-box-list");
                element.scrollTop = element.scrollHeight;
            }, 1500);
        });

        socket.on("client:session", (params) => {
            document.getElementById("cevo_reply_chat").style.display = "block";
            document.getElementById("cevo_init_chat").style.display = "none";

            localStorage.setItem("sessionID", params.sessionID);
            localStorage.setItem("chatID", params.chat_id);
            localStorage.setItem("userID", params.id_users);
        });

        socket.on("client:closed", (data) => {
            var elBtnMsg = document.getElementById("btnMsg");

            let elDropdownChat = document.querySelector(".dropdownCht");
            elDropdownChat.innerHTML = "";

            localStorage.setItem("data_ec", JSON.stringify(data));
            elBtnMsg.innerHTML = `
                <p class="rate-header">
                    Rating dari kamu, berarti buat aku
                </p>
                <div class="cevo-lrate">
                    <button class="cevo-btn-tangerin cmr-1" value="1" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        1
                    </button>
                    <button class="cevo-btn-tangerin cmr-1" value="2" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        2
                    </button>
                    <button class="cevo-btn-tangerin cmr-1" value="3" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        3
                    </button>
                    <button class="cevo-btn-tangerin cmr-1" value="4" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        4
                    </button>
                    <button class="cevo-btn-tangerin cmr-1" value="5" style=" width: auto"
                        onclick="QChat.handleRate(this)">
                        5
                    </button>
                </div>
            `;
            // elBtnMsg.innerHTML = `
            //     <p class="rate-header">
            //         Rating dari kamu, berarti buat aku
            //     </p>
            //     <div class="stars">
            //         <input type="radio" name="difficulty" id="difficulty-1" value="5" onclick="QChat.handleRate(this)" hidden>
            //         <label for="difficulty-1">
            //             <i class="fa fa-star"></i>
            //             <i class="fa fa-star-o"></i>
            //         </label>
            //         <input type="radio" name="difficulty" id="difficulty-2" value="4" onclick="QChat.handleRate(this)" hidden>
            //         <label for="difficulty-2">
            //             <i class="fa fa-star"></i>
            //             <i class="fa fa-star-o"></i>
            //         </label>
            //         <input type="radio" name="difficulty" id="difficulty-3" value="3" onclick="QChat.handleRate(this)" hidden>
            //         <label for="difficulty-3">
            //             <i class="fa fa-star"></i>
            //             <i class="fa fa-star-o"></i>
            //         </label>
            //         <input type="radio" name="difficulty" id="difficulty-4" value="2" onclick="QChat.handleRate(this)" hidden>
            //         <label for="difficulty-4">
            //             <i class="fa fa-star"></i>
            //             <i class="fa fa-star-o"></i>
            //         </label>
            //         <input type="radio" name="difficulty" id="difficulty-5" value="1" onclick="QChat.handleRate(this)" hidden>
            //         <label for="difficulty-5">
            //                 <i class="fa fa-star"></i>
            //                 <i class="fa fa-star-o"></i>
            //         </label>
            //     </div>
            // `;
            document.querySelector("#chat-box-list").insertAdjacentHTML(
                "beforeend",
                `
                        <div class="box-chat other">
                            <div class="container">
                                <div class="name">${data.agent_name}</div>
                                <div class="chat-body">${data.message}</div>
                                <div class="time"><img src="${
                                    this.asset_base
                                }lib/assets/time-line.png"> ${new Date(
                    Date.now()
                ).toLocaleString()}</div>
                            </div>
                        </div>
                `
            );

            setTimeout(() => {
                var element = document.getElementById("chat-box-list");
                element.scrollTop = element.scrollHeight;
            }, 500);
            this.from_who = data.from;
        });

        socket.on("client:error", (data) => {
            alert(data.message);
        });

        socket.on("client:countAgents", (data) => {
            window.cevo_agent_count = data;
        });

        socket.on("client:solved_chat", () => {
            var chat_id = localStorage.getItem("chatID");

            this.getMyChat(chat_id).then(async (response) => {
                let elDropdownChat = document.querySelector(".dropdownCht");
                let elBtnMsg = document.getElementById("btnMsg");
                let availAgent = false;

                const dataRes = response.data;

                if (dataRes[0].first_response != null) {
                    availAgent = true;
                }
                console.log("availAgent:", availAgent);
                console.log("dataRes:", dataRes);

                if (availAgent) {
                    elDropdownChat.innerHTML = ``;
                    elBtnMsg.innerHTML = `
                    <p class="rate-header">
                        Rating dari kamu, berarti buat aku
                    </p>
                    <div class="cevo-lrate">
                        <button class="cevo-btn-tangerin cmr-1" value="1" style=" width: auto"
                            onclick="QChat.handleRate(this)">
                            1
                        </button>
                        <button class="cevo-btn-tangerin cmr-1" value="2" style=" width: auto"
                            onclick="QChat.handleRate(this)">
                            2
                        </button>
                        <button class="cevo-btn-tangerin cmr-1" value="3" style=" width: auto"
                            onclick="QChat.handleRate(this)">
                            3
                        </button>
                        <button class="cevo-btn-tangerin cmr-1" value="4" style=" width: auto"
                            onclick="QChat.handleRate(this)">
                            4
                        </button>
                        <button class="cevo-btn-tangerin cmr-1" value="5" style=" width: auto"
                            onclick="QChat.handleRate(this)">
                            5
                        </button>
                    </div>
                `;
                    // elBtnMsg.innerHTML = `
                    //     <p class="rate-header">
                    //         Rating dari kamu, berarti buat aku
                    //     </p>
                    //     <div class="stars">
                    //         <input type="radio" name="difficulty" id="difficulty-1" value="5" onclick="QChat.handleRate(this)" hidden>
                    //         <label for="difficulty-1">
                    //             <i class="fa fa-star"></i>
                    //             <i class="fa fa-star-o"></i>
                    //         </label>
                    //         <input type="radio" name="difficulty" id="difficulty-2" value="4" onclick="QChat.handleRate(this)" hidden>
                    //         <label for="difficulty-2">
                    //             <i class="fa fa-star"></i>
                    //             <i class="fa fa-star-o"></i>
                    //         </label>
                    //         <input type="radio" name="difficulty" id="difficulty-3" value="3" onclick="QChat.handleRate(this)" hidden>
                    //         <label for="difficulty-3">
                    //             <i class="fa fa-star"></i>
                    //             <i class="fa fa-star-o"></i>
                    //         </label>
                    //         <input type="radio" name="difficulty" id="difficulty-4" value="2" onclick="QChat.handleRate(this)" hidden>
                    //         <label for="difficulty-4">
                    //             <i class="fa fa-star"></i>
                    //             <i class="fa fa-star-o"></i>
                    //         </label>
                    //         <input type="radio" name="difficulty" id="difficulty-5" value="1" onclick="QChat.handleRate(this)" hidden>
                    //         <label for="difficulty-5">
                    //                 <i class="fa fa-star"></i>
                    //                 <i class="fa fa-star-o"></i>
                    //         </label>
                    //     </div>
                    // `;
                } else {
                    this.renderBtnMsg();
                }
            });
        });

        this.mappingUI();
    }
}

function encodeHTML(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
}

window.QChat = new QwordsChat();
QChat.loadTemplate();
/* myFunction toggles between adding and removing the show class, which is used to hide and show the dropdown content */
const toggleMenuChat = () => {
    document.getElementById("myDropdown").classList.toggle("show");
};

const customClearLocalStorage = () => {
    Object.keys(localStorage).forEach(function (key) {
        if (key != "api_key") {
            localStorage.removeItem(key);
        }
    });
};

const snackBar = (message, status = "info", timeout = 3000) => {
    console.warn("alert chatvolution execute");
    var elSnackBar = document.getElementById("snackbar");
    elSnackBar.className = `show ${status}`;
    elSnackBar.innerHTML = !message ? "Default message" : message;
    setTimeout(function () {
        elSnackBar.className = elSnackBar.className.replace("show", "");
    }, timeout);
};

document.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();

        if (QChat.uploadModal) {
            console.warn("not supported enter");
        } else {
            const reply_section = document.getElementById("cevo_reply_chat");
            if (reply_section.style.display == "block") {
                QChat.handleClickSendChat();
            }
        }
    }
});

window.addEventListener("click", outsideClick);
function outsideClick(e) {
    const modal = document.querySelector(".modal-qchat");
    if (e.target == modal) {
        QChat.closeUploadFile();
    }
}
