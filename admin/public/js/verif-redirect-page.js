let menu = localStorage.getItem("menu");
let code = 200;
let message = "";
let data = false;
// const window.base_url_live = window.location.origin + "/";

if (Boolean(menu)) {
    code = localStorage.getItem("code");
    message = localStorage.getItem("message");
    data = JSON.parse(localStorage.getItem("data"));
} else {
    code = $("#code").val();
    message = $("#message").val();
}

/* page color rendering */
if (code != 200) {
    $(".cc-page").addClass("bg-warning");
    $(".header-page").html(message);
    $(".header-page").addClass("text-warning");
    document.getElementById(
        "illustration-page"
    ).src = `${window.base_url_live}assets/images/illustration/il-warning2.svg`;
    $("#countdown").addClass("text-warning");
} else {
    $(".cc-page").addClass("bg-success");
    $(".header-page").html(message);
    $(".header-page").addClass("text-success");
    document.getElementById(
        "illustration-page"
    ).src = `${window.base_url_live}assets/images/illustration/il-success2.svg`;
    $("#countdown").addClass("text-success");
}

let id = "";
let token = "";
let permission = "";
let permission_name = "";
let live_chat_menu = "";
let social_menu = "";
let crm_menu = "";
let uuid = "";
let name = "";
let email = "";
let phone = "";
let id_company = "";
let company_name = "";
let id_department = "";
let department_name = "";
let avatar = "";

if (!data) {
    token = $("#tk").val();
    id = $("#id").val();
    permission = $("#permission").val();
    live_chat_menu = !$("#lc").val() ? false : $("#lc").val();
    crm_menu = !$("#crm").val() ? false : JSON.stringify($("#crm").val());
    social_menu = !$("#smm").val() ? false : JSON.stringify($("#smm").val());
    uuid = $("#uuid").val();
    name = $("#name").val();
    email = $("#email").val();
    phone = $("#phone").val();
    id_company = $("#id_company").val();
    company_name = $("#company_name").val();
    id_department = $("#id_department").val();
    department_name = $("#department_name").val();
    avatar = $("#avatar").val();
    permission_name = $("#permission_name").val();
} else {
    id = data.id;
    token = data.token;
    permission = data.permission;
    permission_name = data.roles_name;
    live_chat_menu = !Boolean(data.live_chat)
        ? false
        : JSON.stringify(data.live_chat);
    crm_menu = !Boolean(data.crm) ? false : JSON.stringify(data.crm);
    social_menu = !Boolean(data.social_pilot)
        ? false
        : JSON.stringify(data.social_pilot);
    uuid = data.uuid;
    name = data.name;
    email = data.email;
    phone = data.phone;
    id_company = data.id_company;
    company_name = data.company_name;
    id_department = data.id_department;
    department_name = data.department_name;
    avatar = data.avatar;
}

/* set user */
localStorage.setItem("UserID", id);
localStorage.setItem("tk", token);
localStorage.setItem("permission", permission);
localStorage.setItem("permission_name", permission_name);
localStorage.setItem("live_chat_menu", live_chat_menu);
localStorage.setItem("crm_menu", crm_menu);
localStorage.setItem("social_menu", social_menu);
localStorage.setItem("uuid", uuid);
localStorage.setItem("name", name);
localStorage.setItem("email", email);
localStorage.setItem("phone", phone);
localStorage.setItem("id_company", id_company);
localStorage.setItem("company_name", company_name);
localStorage.setItem("id_department", id_department);
localStorage.setItem("department_name", department_name);
localStorage.setItem("avatar", avatar);

/* remove data local storage */
localStorage.removeItem("_grecaptcha");
localStorage.removeItem("userReg");
localStorage.removeItem("menu");
localStorage.removeItem("code");
localStorage.removeItem("message");
localStorage.removeItem("data");

var timeLeft = 10;
var timerId = setInterval(countdown, 1000);
var elCountdown = document.getElementById("countdown");
var timeLeftRedirect = 2;
var timerIdRedirect = null;

function countdown() {
    $("#countdown").show();
    if (menu == undefined || !menu) {
        $("#waiting-text").html("Waiting check verification:");
    } else {
        $("#waiting-text").html("Wait prefer setup menu");
    }
    $("#waiting-text").show();

    if (timeLeft == -1) {
        clearTimeout(timerId);
        $("#countdown").empty();
        if (code != 200) {
            $("#waiting-text").html(`
                <h5>
                    <span>Redirect To: </span>
                    <span class="loading loading03 text-warning">
                        <span>D</span>
                        <span>a</span>
                        <span>s</span>
                        <span>h</span>
                        <span>b</span>
                        <span>o</span>
                        <span>a</span>
                        <span>r</span>
                        <span>d</span>
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </h5>
            `);
        } else {
            $("#waiting-text").html(`
                <h5>
                    <span>Redirect To: </span>
                    <span class="loading loading03 text-success">
                        <span>D</span>
                        <span>a</span>
                        <span>s</span>
                        <span>h</span>
                        <span>b</span>
                        <span>o</span>
                        <span>a</span>
                        <span>r</span>
                        <span>d</span>
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </h5>
            `);
        }
        timerIdRedirect = setInterval(countdownRedirect, 1000);
    } else {
        elCountdown.innerHTML = timeLeft + " Second";
        timeLeft--;
    }
}

function countdownRedirect() {
    if (timeLeftRedirect == -1) {
        clearTimeout(timerIdRedirect);
        location.replace(`${window.base_url_live}/home`);
    } else {
        timeLeftRedirect--;
    }
}
/* off loader */
$(".page-loader").fadeOut(500);
