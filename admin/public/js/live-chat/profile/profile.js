let token = localStorage.getItem("tk");
let avatarGlobal = "";

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

const showProfile = async () => {
    const config = {
        method: "get",
        url: `${base_url_live}/api/agent/profile/show`,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
        },
    };

    axios(config)
        .then((response) => {
            let avatar = `${window.base_url_live}/assets/images/users/avatar/avatar-4.png`;

            const dataRes = response.data.data;
            avatarGlobal = dataRes.avatar;

            localStorage.setItem("email", dataRes.email);
            localStorage.setItem("name", dataRes.name);
            localStorage.setItem("uuid", dataRes.uuid);
            localStorage.setItem("phone", dataRes.phone);
            localStorage.setItem(
                "avatar",
                !dataRes.avatar ? avatar : dataRes.avatar
            );

            localStorage.setItem("id_department", dataRes.id_department);
            localStorage.setItem("department_name", dataRes.department_name);
            localStorage.setItem("permission", dataRes.id_roles);
            localStorage.setItem("permission_name", dataRes.id_roles);
            localStorage.setItem("id_company", dataRes.id_company);
            localStorage.setItem("company_name", dataRes.company_name);

            $(".dt-department_name").html(
                !dataRes.department_name ? "-" : dataRes.department_name
            );
            $(".dt-company_name").html(
                !dataRes.company_name ? "-" : dataRes.company_name
            );
            $(".dt-uuid").html(!dataRes.uuid ? "-" : dataRes.uuid);
            $(".dt-permission_name").html(
                !dataRes.roles_name ? "-" : dataRes.roles_name
            );
            $(".dt-email").html(!dataRes.email ? "-" : dataRes.email);
            $(".dt-name").html(!dataRes.name ? "-" : dataRes.name);
            $(".dt-phone").html(!dataRes.phone ? "-" : dataRes.phone);
            $(`.dt-avatar`).attr(
                "src",
                !dataRes.avatar ? avatar : dataRes.avatar
            );

            const elAvatar = document.querySelector(".header-profile-user");

            $("#display_agent_name_header").text(dataRes.name);
            elAvatar.src = !dataRes.avatar ? avatar : dataRes.avatar;
        })
        .catch((err) => {
            console.warn(err);
        });
};
showProfile();

const saveProfile = () => {
    let file = document.getElementById("avatar").files[0];

    let data = new FormData();

    data.append("avatar", file);

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            "X-Requested-With": "xmlhttprequest",
        },
        mimeType: "multipart/form-data",
        url: `${window.base_url_live}/api/agent/profile/update`,
        data,
    };

    axios(config)
        .then((response) => {
            const dataRes = response.data.data;
            showProfile();
            return Toast.fire({
                icon: "success",
                title: "Change avatar success!",
            });
        })
        .catch((error) => {
            console.warn(error);
        });
};

const chooseAvatar = () => {
    $("#avatar").click();
};

const uploadAvatar = () => {
    let file = document.getElementById("avatar").files[0];
    let preview = document.querySelector(".dt-avatar");

    if (!Boolean(file)) {
        return (preview.src = !Boolean(avatarGlobal)
            ? `${window.base_url_live}/assets/images/users/avatar/avatar-4.png`
            : avatarGlobal);
    }

    const allowedExtension = ["jpg", "jpeg", "png"];
    let extensionFile = file.type.split("/");
    if (!allowedExtension.includes(extensionFile[1].toLowerCase())) {
        return Toast.fire({
            icon: "error",
            title: "Avatar support: PNG, JPG, JPEG only!",
        });
    }

    saveProfile();
};

const updateProfile = () => {
    location.replace(`${window.base_url_live}/profile/update`);
};

const changePassword = () => {
    location.replace(`${window.base_url_live}/profile/change-password`);
};

$(".page-loader").fadeOut(500);
