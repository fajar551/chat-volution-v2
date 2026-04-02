/* color assets */
const arr_color = [
    "#2c6af4",
    "#3a0ca3",
    "#03045e",
    "#f72585",
    "#a4133c",
    "#c9184a",
    "#7209b7",
    "#560bad",
    "#480ca8",
    "#ff7b00",
    "#f48c06",
    "#e85d04",
    "#007f5f",
    "#2b9348",
    "#1b4332",
    "#222b1f",
    "#6a040f",
    "#9d0208",
    "#d00000",
];
arr_color.forEach((el) => {
    $("#iColor").append(`
        <label class="colorinput">
            <input name="color" required data-parsley-required-message="Choose 1 color!" id="color" onchange="changeValColor('${el}')" type="radio" value="${el}" class="colorinput-input">
            <span class="colorinput-color" style="background-color:${el}"></span>
        </label>
    `);
});

var selectedColor = null;
var tk = localStorage.getItem("tk");
var settings = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

$(function () {
    $("#btn-save").parsley();
    $("#btn-save").submit(function (e) {
        var alertMultiple = [];
        e.preventDefault();

        $(".page-loader").removeAttr("style");
        settings.url = `${window.base_url_live}/api/agent/chat-label`;
        settings.data = JSON.stringify({
            name: $("#name").val(),
            description: $("#description").val(),
            color: selectedColor,
        });
        $.ajax(settings)
            .done(function (response) {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Congratulation",
                    text: "Add label successfuly!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace(`${base_url_live}/labels`);
                });
            })
            .fail(function (response) {
                $(".page-loader").attr("style", "display:none");
                $.each(response.responseJSON.error, function (key, val) {
                    alertMultiple.push({
                        icon: "warning",
                        title: "Warning",
                        text: val,
                    });
                });
                swal.queue(alertMultiple);
            });
    });
});

function changeValColor(color) {
    selectedColor = color;
}
/* off loader */
$(".page-loader").fadeOut(500);
