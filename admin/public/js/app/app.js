String.prototype.replaceArray = function (find, replace) {
    var replaceString = this;
    for (var i = 0; i < find.length; i++) {
        if (replace == "" || replace == undefined || !replace) {
            replaceString = replaceString.replace(find[i], "");
        } else {
            replaceString = replaceString.replace(find[i], replace[i]);
        }
    }
    return replaceString;
};

mainApp.controller("appChat", [
    "$scope",
    "httpHandler",
    "$filter",
    "$attrs",
    function ($scope, httpHandler, $filter, $attrs) {
        let pathnameUrl = window.location.pathname;
        let splitPath = pathnameUrl.split("/");

        let role = localStorage.getItem("permission");
        $scope.live_chat_menu = JSON.parse(
            localStorage.getItem("live_chat_menu")
        );
        let token = localStorage.getItem("tk");

        /* Name sidebar menu by role*/
        if (role == 1) {
            $("#labelSideMenu").html("ADMIN MENU");
        } else if (role == 2) {
            $("#labelSideMenu").html("COMPANY MENU");
        } else if (role == 3) {
            $("#labelSideMenu").html("Staff Menu");
        } else if (role == 3) {
            $("#labelSideMenu").html("Agent Menu");
        } else {
            $("#labelSideMenu").html("Menu");
        }

        $scope.$on("renderingMenu", function (ngRepeatFinishedEvent) {
            angular.forEach($scope.live_chat_menu, function (value, key) {
                if (value.main_menu === "Client Chat") {
                    $("#amenu_Client_Chat").removeAttr("href");
                    $("#amenu_Client_Chat").attr(
                        "href",
                        `${value.link}?token=${token}`
                    );
                } else {
                    let url_main = !Boolean(value.link)
                        ? ""
                        : value.link.replace("/", "");
                    if (splitPath.length > 2) {
                        if (splitPath[2] == "client") {
                            $(`#limenu_Client_Chat`).addClass("mm-active");
                            $(`#amenu_Client_Chat`).addClass("active");
                        }

                        if (
                            splitPath[1] == "chat" &&
                            splitPath[2] == "report"
                        ) {
                            $("#amenu_Report_Chat").addClass("mm-active");
                            $("#amenu_Report_Chat").addClass("active");
                        }
                    }
                    if (
                        ![
                            "javascript:void(0)",
                            "javascript:void()",
                            "javascript:void(0);",
                        ].includes(url_main)
                    ) {
                        if (splitPath[1] == url_main) {
                            $(`#limenu_${value.main_menu}`).addClass(
                                "mm-active"
                            );
                            $(`#amenu_${value.main_menu}`).addClass("active");
                        }
                    }
                    angular.forEach(value.children, function (val, key_val) {
                        if (splitPath.length < 3) {
                            const arrFilter = [
                                "general-quick-replies",
                                "personal-quick-replies",
                                "edit-general-quick-replies",
                                "edit-personal-quick-replies",
                                "add-general-quick-replies",
                                "add-personal-quick-replies",
                                "tokens",
                                "welcome-message",
                                "away-message",
                                "closing-message",
                            ];
                            if (arrFilter.includes(splitPath[1])) {
                                let findArrRep = ["add-", "edit-"];
                                let url_child =
                                    splitPath[1].replaceArray(findArrRep);
                                let searchCMenu = val.link.search(url_child);
                                if (searchCMenu > 0) {
                                    $(
                                        `#limenu_${value.main_menu.replace(
                                            " ",
                                            "_"
                                        )}`
                                    ).addClass("mm-active");
                                    $(
                                        `#amenu_${value.main_menu.replace(
                                            " ",
                                            "_"
                                        )}`
                                    ).addClass("active");
                                    $(
                                        `#childmenu_${val.menu
                                            .split(" ")
                                            .join("_")}`
                                    ).addClass("active");
                                }
                            } else {
                                let url_child = splitPath[1].split("-");
                                if (url_child.length > 1) {
                                    if (["staff"].includes(url_child[1])) {
                                        url_child = url_child[1];
                                    } else {
                                        url_child = `${url_child[1]}s`;
                                    }
                                } else {
                                    url_child = splitPath[1];
                                }
                                let searchCMenu = val.link.search(url_child);
                                if (searchCMenu == 1) {
                                    $(
                                        `#limenu_${value.main_menu.replace(
                                            " ",
                                            "_"
                                        )}`
                                    ).addClass("mm-active");
                                    $(
                                        `#amenu_${value.main_menu.replace(
                                            " ",
                                            "_"
                                        )}`
                                    ).addClass("active");
                                    $(
                                        `#childmenu_${val.menu
                                            .split(" ")
                                            .join("_")}`
                                    ).addClass("active");
                                }
                            }
                        } else {
                            let childish_menu = capitalize(splitPath[2]);
                            if (childish_menu == val.menu) {
                                $(
                                    `#limenu_${value.main_menu.replace(
                                        " ",
                                        "_"
                                    )}`
                                ).addClass("mm-active");
                                $(
                                    `#amenu_${value.main_menu.replace(
                                        " ",
                                        "_"
                                    )}`
                                ).addClass("active");
                                $(
                                    `#childmenu_${val.menu
                                        .split(" ")
                                        .join("_")}`
                                ).addClass("active");
                            }
                        }
                    });

                    if (value.children != null) {
                        angular.forEach(
                            value.children,
                            function (val, key_val) {
                                if (splitPath.length < 3) {
                                    const arrFilter = [
                                        "general-quick-replies",
                                        "personal-quick-replies",
                                        "edit-general-quick-replies",
                                        "edit-personal-quick-replies",
                                        "add-general-quick-replies",
                                        "add-personal-quick-replies",
                                        "tokens",
                                        "welcome-message",
                                        "away-message",
                                        "closing-message",
                                    ];
                                    if (arrFilter.includes(splitPath[1])) {
                                        let findArrRep = ["add-", "edit-"];
                                        let url_child =
                                            splitPath[1].replaceArray(
                                                findArrRep
                                            );
                                        let searchCMenu =
                                            val.link.search(url_child);
                                        if (searchCMenu > 0) {
                                            $(
                                                `#limenu_${value.main_menu.replace(
                                                    " ",
                                                    "_"
                                                )}`
                                            ).addClass("mm-active");
                                            $(
                                                `#amenu_${value.main_menu.replace(
                                                    " ",
                                                    "_"
                                                )}`
                                            ).addClass("active");
                                            $(
                                                `#childmenu_${val.menu
                                                    .split(" ")
                                                    .join("_")}`
                                            ).addClass("active");
                                        }
                                    } else {
                                        let url_child = splitPath[1].split("-");
                                        if (url_child.length > 1) {
                                            if (
                                                ["staff"].includes(url_child[1])
                                            ) {
                                                url_child = url_child[1];
                                            } else {
                                                url_child = `${url_child[1]}s`;
                                            }
                                        } else {
                                            url_child = splitPath[1];
                                        }
                                        let searchCMenu =
                                            val.link.search(url_child);
                                        if (searchCMenu == 1) {
                                            $(
                                                `#limenu_${value.main_menu.replace(
                                                    " ",
                                                    "_"
                                                )}`
                                            ).addClass("mm-active");
                                            $(
                                                `#amenu_${value.main_menu.replace(
                                                    " ",
                                                    "_"
                                                )}`
                                            ).addClass("active");
                                            $(
                                                `#childmenu_${val.menu
                                                    .split(" ")
                                                    .join("_")}`
                                            ).addClass("active");
                                        }
                                    }
                                } else {
                                    let childish_menu = capitalize(
                                        splitPath[2]
                                    );
                                    if (childish_menu == val.menu) {
                                        $(
                                            `#limenu_${value.main_menu.replace(
                                                " ",
                                                "_"
                                            )}`
                                        ).addClass("mm-active");
                                        $(
                                            `#amenu_${value.main_menu.replace(
                                                " ",
                                                "_"
                                            )}`
                                        ).addClass("active");
                                        $(
                                            `#childmenu_${val.menu
                                                .split(" ")
                                                .join("_")}`
                                        ).addClass("active");
                                    }
                                }
                            }
                        );
                    }
                }
            });
        });
    },
]);

$(document).ready(function () {
    $(".select2-multiple").select2({
        multiple: true,
    });
});

function capitalize(str) {
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] =
            splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
}

/* input type customize */
function setInputFilter(textbox, inputFilter) {
    [
        "input",
        "keydown",
        "keyup",
        "mousedown",
        "mouseup",
        "select",
        "contextmenu",
        "drop",
    ].forEach(function (event) {
        if (textbox != null) {
            textbox.addEventListener(event, function () {
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(
                        this.oldSelectionStart,
                        this.oldSelectionEnd
                    );
                } else {
                    this.value = "";
                }
            });
        }
    });
}

function formatNumbering(angka) {
    var number_string = angka.replace(/[^,\d]/g, "").toString(),
        split = number_string.split(","),
        sisa = split[0].length % 3,
        angka = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        separator = sisa ? "." : "";
        angka += separator + ribuan.join(".");
    }
    return angka;
}
