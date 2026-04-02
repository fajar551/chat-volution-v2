"use strict";

var listMonth = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

$("#reminder_set").prop("checked", true);

/* funtion datetime picker tempusdominus */
$(function () {
    $(".timepicker").datetimepicker({
        icons: {
            time: "fas fa-clock",
        },
        format: "hh:mm",
    });

    $(".datepicker").datetimepicker({
        format: "YYYY-MM-DD",
        minDate: Date.now(),
    });

    $(".start_date").datetimepicker({
        format: "YYYY-MM-DD",
        minDate: Date.now(),
    });

    $(".end_date").datetimepicker({
        format: "YYYY-MM-DD",
        minDate: Date.now(),
    });

    $(".datetimepicker").datetimepicker({
        icons: {
            time: "fas fa-clock",
        },
        format: "YYYY-MM-DD HH:mm",
        minDate: Date.now(),
    });
});

/* form popup */
const formAdd = () => {
    $("#addTask").modal("show");
};

const closeForm = () => {
    $("#addTask").modal("hide");
};
/* toast with sweetalert2 */
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

var tk = localStorage.getItem("tk");
var settings = {
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

const tabMenu = () => {
    /* ga ada yang active */
    if (!$("#reminder_set").prop("checked") && !$("#crsot").prop("checked")) {
        $(".dtt").hide();
        $(".rd").hide();
        $(".rt").hide();
        $("#dtt").val(null);
        $("#reminder_date").val(null);
        $("#remainder_time").val(null);
        $("#due_date").removeAttr("disabled");
        $("#due_date").addClass("datepicker");
    } else if (
    /* reminder ga active */
        !$("#reminder_set").prop("checked") &&
        $("#crsot").prop("checked")
    ) {
        $(".dtt").hide();
        $(".rd").hide();
        $(".rt").hide();
        $("#due_date").attr("disabled", true);
        $("#dtt").val(null);
        $("#reminder_date").val(null);
        $("#remainder_time").val(null);
        $("#due_date").removeClass("datepicker");
        $("#due_date").val(null);
    } else if (
    /*  reccuring series ga active */
        $("#reminder_set").prop("checked") &&
        !$("#crsot").prop("checked")
    ) {
        $(".dtt").show();
        $(".rd").hide();
        $(".rt").hide();
        $("#due_date").removeAttr("disabled");
        $("#due_date").addClass("datepicker");
    } else if (
    /* active semua */
        $("#reminder_set").prop("checked") &&
        $("#crsot").prop("checked")
    ) {
        $("#dtt").val(null);
        $(".dtt").hide();
        $(".rd").show();
        $(".rt").show();
        $("#due_date").attr("disabled", true);
        $("#due_date").removeClass("datepicker");
        $("#due_date").val(null);
    } else {
        $("#dtt").val(null);
        $("#reminder_date").val(null);
        $("#remainder_time").val(null);
        $(".dtt").hide();
        $(".rd").hide();
        $(".rt").hide();
        $("#due_date").removeAttr("disabled");
        $("#due_date").addClass("datepicker");
    }

    if (
        $("#crsot").prop("checked") &&
        ($("#reminder_set").prop("checked") ||
            !$("#reminder_set").prop("checked"))
    ) {
        $(".fq").show();
        $(".sd").show();
        $(".ed").show();
        onFrequence("daily");
    } else {
        $(".fq").hide();
        $(".sd").hide();
        $(".ed").hide();
        $(".repeat").hide();
        $(".every").hide();
        $(".ro").hide();
        $(".when").hide();
        $(".dm").hide();
        $(".rom").hide();
        $(".dayYear").hide();
        $(".RoYear").hide();
        $(".MoYear").hide();
    }
};
tabMenu();

const dtFrequence = () => {
    $(".iFq").append(`
        <label class="selectgroup-item">
            <input type="radio" name="frequency" id="frequency" onchange="onFrequence('daily')" value="daily" class="selectgroup-input">
            <span class="selectgroup-button">Daily</span>
        </label>
        <label class="selectgroup-item">
            <input type="radio" name="frequency" id="frequency" onchange="onFrequence('weekly')" value="weekly" class="selectgroup-input">
            <span class="selectgroup-button">Weekly</span>
        </label>
        <label class="selectgroup-item">
            <input type="radio" name="frequency" id="frequency" onchange="onFrequence('monthly')" value="monthly" class="selectgroup-input">
            <span class="selectgroup-button">Monthly</span>
        </label>
        <label class="selectgroup-item">
            <input type="radio" name="frequency" id="frequency" onchange="onFrequence('yearly')" value="yearly" class="selectgroup-input">
            <span class="selectgroup-button">Yearly</span>
        </label>
    `);
};

const onFrequence = (dtFreq) => {
    $(".iFq").empty();
    dtFrequence();
    $("input[name=frequency][value=" + dtFreq + "]").attr("checked", "checked");
    $("input[name=repeat]").removeAttr("checked", "checked");
    $("input[name=when]").removeAttr("checked");
    $("input[name=repeat_on]").removeAttr("checked");

    $("#every").val(null);
    $(".every").hide();
    $(".ro").hide();
    $(".when").hide();
    $(".dm").hide();
    $(".rom").hide();
    $(".repeatMonth").hide();
    $(".dayYear").hide();
    $(".RoYear").hide();
    $(".MoYear").hide();

    $(".irp").empty();
    $(".iRo").empty();
    $(".iwhen").empty();
    $(".iDayMonth").empty();
    $(".iMRO").empty();
    $(".iDayYear").empty();
    $(".iROY").empty();
    $(".iMoy").empty();

    var rType = null;
    var wType = null;

    if (dtFreq == "daily") {
        rType = "Day";
        $(".repeat").show();
        repeat(rType);
    } else if (dtFreq == "weekly") {
        rType = "Week";
        $(".repeat").show();
        repeat(rType);
        $(".ro").show();

        dtRO();
    } else if (dtFreq == "monthly") {
        rType = "Month";
        $(".repeat").show();
        repeat(rType);

        $(".when").show();
        wType = "Days";
        when(wType);
    } else if (dtFreq == "yearly") {
        $(".repeat").hide();

        $(".when").show();
        wType = "Date";
        when(wType);
    } else {
        $(".repeat").hide();
    }
};

const dtRO = () => {
    $(".iRo").append(`
        <label class="selectgroup-item">
            <input type="checkbox" name="repeat_on" id="repeat_on" value="sunday" class="selectgroup-input" checked="">
            <span class="selectgroup-button">Su</span>
        </label>
        <label class="selectgroup-item">
            <input type="checkbox" name="repeat_on" id="repeat_on" value="monday" class="selectgroup-input">
            <span class="selectgroup-button">Mo</span>
        </label>
        <label class="selectgroup-item">
            <input type="checkbox" name="repeat_on" id="repeat_on" value="tuesday" class="selectgroup-input">
            <span class="selectgroup-button">Tu</span>
        </label>
        <label class="selectgroup-item">
            <input type="checkbox" name="repeat_on" id="repeat_on" value="wednesday" class="selectgroup-input">
            <span class="selectgroup-button">We</span>
        </label>
        <label class="selectgroup-item">
            <input type="checkbox" name="repeat_on" id="repeat_on" value="thursday" class="selectgroup-input">
            <span class="selectgroup-button">Th</span>
        </label>
        <label class="selectgroup-item">
            <input type="checkbox" name="repeat_on" id="repeat_on" value="friday" class="selectgroup-input">
            <span class="selectgroup-button">Fr</span>
        </label>
        <label class="selectgroup-item">
            <input type="checkbox" name="repeat_on" id="repeat_on" value="saturday" class="selectgroup-input">
            <span class="selectgroup-button">Sa</span>
        </label>
    `);
};

const repeat = (rpt, repVal = false) => {
    $(".irp").append(`
        <label class="selectgroup-item">
            <input type="radio" name="repeat" id="repeat" onChange="onRepeat(1,'${rpt}')" value="1" class="selectgroup-input">
            <span class="selectgroup-button">Every ${rpt}</span>
        </label>
        <label class="selectgroup-item">
            <input type="radio" name="repeat" id="repeat" onChange="onRepeat(2,'${rpt}')" value="2" class="selectgroup-input">
            <span class="selectgroup-button">Every Other ${rpt}</span>
        </label>
        <label class="selectgroup-item">
            <input type="radio" name="repeat" id="repeat" onChange="onRepeat(3,'${rpt}')" value="3" class="selectgroup-input">
            <span class="selectgroup-button">Custom</span>
        </label>
    `);

    if (repVal) {
        $("input[name=repeat][value=" + repVal + "]").attr(
            "checked",
            "checked"
        );
    } else {
        $("input[name=repeat][value=1]").attr("checked", "checked");
    }
};

const onRepeat = (dtRep, dtTypeRepeat) => {
    $("input[name=repeat][value=" + dtRep + "]").attr("checked", "checked");
    $("#every").val(null);
    $(".every").hide();
    $(".repeatMonth").hide();
    $(".iDayYear").empty();
    $(".dayYear").hide();
    $(".iROY").empty();
    $(".iMoy").empty();
    $(".RoYear").hide();
    $(".MoYear").hide();

    if (dtRep == 3) {
        $(".every").show();
    } else {
        $(".every").hide();
    }

    $(".it-every").removeAttr("min");
    $(".it-every").removeAttr("max");
    $("#every").val(null);
    $(".lbl-every").html(null);
    if (dtTypeRepeat == "Day" || dtTypeRepeat == "Week") {
        $(".it-every").attr("min", 1);
        $(".it-every").attr("max", 30);
        $("#every").val(1);
        $(".lbl-every").html(dtTypeRepeat == "Day" ? "Days" : "Weeks");
    } else {
        $(".it-every").attr("min", 1);
        $(".it-every").attr("max", 12);
        $(".lbl-every").html("Months");
        $("#every").val(1);
    }
};

const when = (wType, wVal = false) => {
    $(".iDayMonth").empty();
    $(".dm").hide();
    $(".rom").hide();
    $(".repeatMonth").hide();
    $(".iDayYear").empty();
    $(".iMoy").empty();
    $(".dayYear").hide();
    $(".iROY").empty();
    $(".RoYear").hide();
    $(".MoYear").hide();

    if (wType == "Days") {
        $(".iwhen").append(`
            <label class="selectgroup-item">
                <input type="radio" name="when" id="when" onChange="onWhenMonth(1)" value="1" class="selectgroup-input">
                <span class="selectgroup-button">Specific ${wType}</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="when" id="when" onChange="onWhenMonth(2)" value="2" class="selectgroup-input">
                <span class="selectgroup-button">Relative ${wType}</span>
            </label>
        `);
    } else {
        $(".iwhen").append(`
            <label class="selectgroup-item">
                <input type="radio" name="when" id="when" onChange="onWhenYear(1)" value="1" class="selectgroup-input">
                <span class="selectgroup-button">Specific ${wType}</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="when" id="when" onChange="onWhenYear(2)" value="2" class="selectgroup-input">
                <span class="selectgroup-button">Relative ${wType}</span>
            </label>
        `);
    }

    if (wVal) {
        $("input[name=when][value=" + wVal + "]").attr("checked", "checked");
        if (wType == "Days") {
            onWhenMonth(wVal);
            $(".dm").show();
        } else {
            onWhenYear(wVal);
        }
    } else {
        $("input[name=when][value=1]").attr("checked", "checked");
        if (wType == "Days") {
            onWhenMonth(1);
            $(".dm").show();
        } else {
            onWhenYear(1);
        }
    }
};

const onWhenMonth = (dt) => {
    $(".iDayMonth").empty();
    $(".iMRO").empty();
    $(".iROY").empty();
    $(".iDayYear").empty();
    $(".iMoy").empty();

    $(".repeatMonth").hide();
    $(".dayYear").hide();
    $(".RoYear").hide();
    $(".MoYear").hide();

    if (dt == 1) {
        $(".iDayMonth").append(`
                <input type="number" min="1" max="31" id="day_month" class="form-control">
            `);
        $("#day_month").val(1);
    } else {
        $(".repeatMonth").show();

        $(".iDayMonth").append(`
            <label class="selectgroup-item">
                <input type="radio" name="day_month" id="day_month" value="first" class="selectgroup-input">
                <span class="selectgroup-button">First</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="day_month" id="day_month" value="second" class="selectgroup-input">
                <span class="selectgroup-button">Second</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="day_month" id="day_month" value="third" class="selectgroup-input">
                <span class="selectgroup-button">Third</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="day_month" id="day_month" value="fourth" class="selectgroup-input">
                <span class="selectgroup-button">Fourth</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="day_month" id="day_month" value="last" class="selectgroup-input">
                <span class="selectgroup-button">Last</span>
            </label>
        `);

        $("input[name=day_month][value=first]").attr("checked", "checked");

        $(".iMRO").append(`
            <label class="selectgroup-item">
                <input type="radio" name="repeat_on_month" id="repeat_on_month" value="sunday" class="selectgroup-input">
                <span class="selectgroup-button">Su</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="repeat_on_month" id="repeat_on_month" value="monday" class="selectgroup-input">
                <span class="selectgroup-button">Mo</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="repeat_on_month" id="repeat_on_month" value="tuesday" class="selectgroup-input">
                <span class="selectgroup-button">Tu</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="repeat_on_month" id="repeat_on_month" value="wednesday" class="selectgroup-input">
                <span class="selectgroup-button">We</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="repeat_on_month" id="repeat_on_month" value="thursday" class="selectgroup-input">
                <span class="selectgroup-button">Th</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="repeat_on_month" id="repeat_on_month" value="friday" class="selectgroup-input">
                <span class="selectgroup-button">Fr</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="repeat_on_month" id="repeat_on_month" value="saturday" class="selectgroup-input">
                <span class="selectgroup-button">Sa</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="repeat_on_month" id="repeat_on_month" value="Day" class="selectgroup-input">
                <span class="selectgroup-button">Day</span>
            </label>
        `);
        $("input[name=repeat_on_month][value=sunday]").attr(
            "checked",
            "checked"
        );
    }
};

const onWhenYear = (dt) => {
    $(".iDayMonth").empty();
    $(".iMRO").empty();
    $(".iDayYear").empty();
    $(".iROY").empty();
    $(".iMoy").empty();

    $(".MoYear").hide();
    $(".repeatMonth").hide();
    $(".dayYear").hide();
    $(".RoYear").hide();

    if (dt == 2) {
        $(".dayYear").show();
        $(".RoYear").show();
        $(".MoYear").show();

        $(".iDayYear").append(`
            <label class="selectgroup-item">
                <input type="radio" name="day_year" id="day_year" value="first" class="selectgroup-input">
                <span class="selectgroup-button">First</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="day_year" id="day_year" value="second" class="selectgroup-input">
                <span class="selectgroup-button">Second</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="day_year" id="day_year" value="third" class="selectgroup-input">
                <span class="selectgroup-button">Third</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="day_year" id="day_year" value="fourth" class="selectgroup-input">
                <span class="selectgroup-button">Fourth</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="day_year" id="day_year" value="last" class="selectgroup-input">
                <span class="selectgroup-button">Last</span>
            </label>
        `);
        $("input[name=day_year][value=first]").attr("checked", "checked");

        $(".iROY").append(`
            <label class="selectgroup-item">
                <input type="radio" name="ro_year" id="ro_year" value="sunday" class="selectgroup-input">
                <span class="selectgroup-button">Su</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="ro_year" id="ro_year" value="monday" class="selectgroup-input">
                <span class="selectgroup-button">Mo</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="ro_year" id="ro_year" value="tuesday" class="selectgroup-input">
                <span class="selectgroup-button">Tu</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="ro_year" id="ro_year" value="wednesday" class="selectgroup-input">
                <span class="selectgroup-button">We</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="ro_year" id="ro_year" value="thursday" class="selectgroup-input">
                <span class="selectgroup-button">Th</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="ro_year" id="ro_year" value="friday" class="selectgroup-input">
                <span class="selectgroup-button">Fr</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="ro_year" id="ro_year" value="saturday" class="selectgroup-input">
                <span class="selectgroup-button">Sa</span>
            </label>
            <label class="selectgroup-item">
                <input type="radio" name="ro_year" id="ro_year" value="Day" class="selectgroup-input">
                <span class="selectgroup-button">Day</span>
            </label>
        `);
        $("input[name=ro_year][value=sunday]").attr("checked", "checked");

        listMonth.forEach((el) => {
            $(".iMoy").append(`
                <option value="${el}">${el}</option>
            `);
        });

        $("#month_year").val("January");
    }
};
