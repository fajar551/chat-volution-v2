var tk = localStorage.getItem("tk");
var id = $("#id").val();
var status = 1;
var settings = {
    url: `${base_url_live}/api/agent/department/` + id,
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "Bearer " + tk,
    },
};

const getDetail = () => {
    axios(settings)
        .then((response) => {
            const result = response.data.data;
            $("#name").val(result.name);
            $("#description").val(result.description);
        })
        .catch((error) => {
            console.warn(error);
        });
};
getDetail();

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

    $("#btn-save").submit(function (e) {
        e.preventDefault();

        $(".page-loader").removeAttr("style");
        settings.method = "PUT";
        settings.url = `${base_url_live}/api/agent/department`;
        settings.data = JSON.stringify({
            id: id,
            name: $("#name").val(),
            description: $("#description").val(),
            status: status,
        });

        $.ajax(settings)
            .done(function (response) {
                $(".page-loader").attr("style", "display:none");
                Swal.fire({
                    title: "Congratulation",
                    text: "Edit department successfuly!",
                    icon: "success",
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    confirmButtonColor: "#1cbb8c",
                    confirmButtonText: "okey",
                }).then((result) => {
                    if (result.value) {
                        location.replace(`${base_url_live}/departments`);
                    }
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
