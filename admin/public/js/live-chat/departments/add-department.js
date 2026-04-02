$("#err_name").hide();
$("#err_description").hide();

var tk = localStorage.getItem("tk");

var settings = {
    url: `${base_url_live}/api/agent/department`,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

/* save */
$(function () {
    $("#btn-save")
        .parsley()
        .on("field:validated", function () {
            let elementID = this.element.id;
            let resultValidator = this.validationResult[0];

            if (["name", "description"].includes(elementID)) {
                if (resultValidator == true) {
                    $(`#err_${elementID}`).hide();
                } else {
                    $(`#err_${elementID}`).empty();
                    $(`#err_${elementID}`).hide();

                    if (resultValidator != undefined) {
                        if (resultValidator.assert.name == "required") {
                            $(`#err_${elementID}`).append(`
                            ${elementID} is required!
                        `);
                        } else {
                            $(`#err_${elementID}`).append(`
                            Minimal length ${elementID}: ${resultValidator.assert.requirements}
                        `);
                        }
                        $(`#err_${elementID}`).show();
                    }
                }
            }
        });

    $(".page-loader").removeAttr("style");
    $("#btn-save").submit(function (e) {
        e.preventDefault();
        settings.data = JSON.stringify({
            name: $("#name").val(),
            description: $("#description").val(),
        });
        $.ajax(settings)
            .done(function (response) {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Congratulation",
                    text: "Add department successfuly!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(function () {
                    location.replace(`${base_url_live}/departments`);
                });
            })
            .fail(function (response) {
                $(".page-loader").attr("style", "display:none");
                $.each(response.responseJSON.error, function (key, val) {
                    $("#" + key).addClass("parsley-error");
                    $("#err_" + key).html(val);
                    $("#err_" + key).show();
                });
            });
    });
});

/* off loader */
$(".page-loader").fadeOut(500);
