const dataAuth = {
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

const dataAuthSocket = {
    agent_id: localStorage.getItem("UserID"),
    uuid: localStorage.getItem("uuid"),
    name_agent: localStorage.getItem("name"),
    email_agent: localStorage.getItem("email"),
    phone_agent: localStorage.getItem("phone"),
    avatar: localStorage.getItem("avatar"),
    id_department: localStorage.getItem("id_department"),
    department_name: localStorage.getItem("department_name"),
    company_name: localStorage.getItem("company_name"),
    company_id: localStorage.getItem("id_company"),
    roles_id: localStorage.getItem("permission"),
    permission_name: localStorage.getItem("permission_name"),
    token: localStorage.getItem("tk"),
    company_uuid: localStorage.getItem("company_uuid"),
    type_user: "agent",
    status: "online",
};

const config = {
    url: `${BASE_SOCKET_V2}/login`,
    method: "post",
    data: dataAuthSocket,
    withCredentials: true,
};

/* save session to v2 */
axios(config);

const renderWelcome = () => {
    $("#welcome-msg").append(`Welcome, ${dataAuth.name}!`);
    $("#welcome-desc").append(
        "Hai, you logged in system chat volution, for your contact details, as below: "
    );
    $("#welcome-email").append(`Your email: ${dataAuth.email}`);
    $("#welcome-contact").append(
        `Your phone: ${
            dataAuth.phone == undefined ||
            dataAuth.phone == null ||
            dataAuth.phone == "" ||
            dataAuth.phone == "null"
                ? "-"
                : dataAuth.phone
        }`
    );
    $("#welcome-roles").append(`Your roles: ${dataAuth.permission_name}`);
    $(".page-loader").fadeOut(600);
};

const SessionChecked = () => {
    if (["/login", "/"].includes(location.pathname)) {
        return true;
    }

    if (Boolean(dataAuth.token)) {
        const config = {
            headers: {
                Authorization: `Bearer ${dataAuth.token}`,
                "X-Requested-With": "xmlhttprequest",
            },
        };
        axios
            .get(base_url_live + "/api/validate", config)
            .then(function (response) {
                if (Boolean(response.data.success)) {
                    renderWelcome();
                }
            })
            .catch(function (error) {
                localStorage.clear();
                location.href = `${base_url_live}/login`;
            });
    } else {
        location.replace(`${base_url_live}/login`);
    }
};
SessionChecked();
