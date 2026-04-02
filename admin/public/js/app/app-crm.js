mainApp.controller('appCRM', ['$scope', 'httpHandler', '$filter', '$attrs', function ($scope, httpHandler, $filter, $attrs) {
    var role = localStorage.getItem("permission");
    $scope.crm_menu = JSON.parse(localStorage.getItem("crm_menu"));
    /* settings role */
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
}]);


$(document).ready(function () {
    $(".select2-multiple").select2({
        multiple: true,
    });
});


function capitalize(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

/* input type customize */
function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
        if (textbox != null) {
            textbox.addEventListener(event, function () {
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                } else {
                    this.value = "";
                }
            });
        }
    });
}

function formatNumbering(angka) {
    var number_string = angka.replace(/[^,\d]/g, '').toString(),
        split = number_string.split(','),
        sisa = split[0].length % 3,
        angka = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        separator = sisa ? '.' : '';
        angka += separator + ribuan.join('.');
    }
    return angka;
}
