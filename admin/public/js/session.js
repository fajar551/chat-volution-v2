function Session() {
    if (["/login", "/"].includes(location.pathname)) {
        var token = localStorage.getItem("tk");
        var permission = localStorage.getItem("permission");

        if (Boolean(token)) {
            location.href = `${window.base_url_live}/home`;
        }
    }
}
Session();

if (Boolean(window.socket)) {
    socket.connect();
    socket.emit("reload");
    socket.on("logoutresult", (response) => {
        localStorage.clear();
        location.replace(`${window.base_url_live}/login`);
    });
}

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
            .get(base_url_live + "/api/validate", config)
            .then(function (response) {
                if (Boolean(response.data.success)) {
                    window.current_user = response.data.user;
                    var user = response.data.user;
                    const name = localStorage.getItem("name");

                    let avatarDummy = `${window.base_url_live}/assets/images/users/avatar/avatar-4.png`;
                    const avatar = localStorage.getItem("avatar");
                    const elAvatar = document.querySelector(
                        ".header-profile-user"
                    );
                    if (Boolean(elAvatar)) {
                        $("#display_agent_name_header").text(name);
                        elAvatar.src = !avatar ? avatarDummy : avatar;
                    }

                    /* Sembunyikan overlay .page-loader (layout app-chat); halaman tanpa dashboard.js/welcome.js tidak tertahan spinner */
                    if (typeof $ !== "undefined") {
                        $(".page-loader").fadeOut(500);
                    }

                    return true;
                }
            })
            .catch(function (error) {
                localStorage.clear();
                location.href = `${window.base_url_live}/login`;
            });
    } else {
        location.replace(`${window.base_url_live}/login`);
    }
})();

function logout() {
    var token = localStorage.getItem("tk");
    const config = {
        method: "post",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
        data: {},
        url: `${window.base_url_live}/api/logout`,
    };

    axios(config)
        .then((response) => {
            if (Boolean(window.socket)) {
                socket.emit("logout");
            }

            const event = new Event("api:logout");
            window.dispatchEvent(event);

            localStorage.clear();
            location.href = `${window.base_url_live}/login`;
        })
        .catch((err) => {
            console.warn("logout error:", err);
        });
}
