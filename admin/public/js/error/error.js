const roleID = !localStorage.getItem("permission")
    ? false
    : localStorage.getItem("permission");

function redirect() {
    if (!roleID) {
        location.href = "/";
    } else {
        location.href = "/home";
    }
}
