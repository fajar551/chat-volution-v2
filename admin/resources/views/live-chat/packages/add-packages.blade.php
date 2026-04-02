@extends('layouts.app-chat.app')
@section('content')
<style>
    textarea {
        resize: none;
    }
    .input-info-wrapper {
        color: rgba(25, 25, 25, 0.8);
        line-height: 21px;
        width: 400px;
    }
</style>
<input type="hidden" id="type" value="{{ $type }}">

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0" id="headLable"></h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="javascript: void(0);"><i class="ri-arrow-left-line mr-2"></i> Back to user contacts</a></li>
                    </ol>
                </div>
            </div>
            <p id="txtLable"></p>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label for="shortcut">Shortcut <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <div class="input-group-text">/</div>
                                </div>
                                <input type="text" class="form-control" data-parsley-minlength="2" data-parsley-required id="shortcut" placeholder="Type Shortcut">
                            </div>
                            <p class="input-info-wrapper font-size-16 mt-1">This is the message that will appear after you select a specific shortcut.<b class="text-bold"> Only alphanumberic and underscore are allowed. </b><br>Example: "Domain3332", then it will be "/Domain3332" .</p>
                        </div>
                        <div class="form-group">
                            <label for="message">Message <span class="text-danger">*</span></label>
                            <textarea class="form-control" data-parsley-minlength="10" data-parsley-required name="message" rows="7" id="message" placeholder="Type Message"></textarea>
                            <p class="mt-1 input-info-wrapper font-size-16">This is the message that will appear after you select a specific shortcut. <b class="text-bold">No blank space are allowed at the beginning and end of a message.</b></p>
                        </div>
                        <button type="submit" class="btn btn-primary waves-effect waves-light">Save</butt>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- end row -->

</div> <!-- container-fluid -->

@endsection

@section('footer')
@include('shared.footer')
<script>

    var type = $("#type").val();
    $("#headLable").html(type== 1?"Add General Quick Reply":"Add Personal Quick Reply");
    $("#txtLable").html(type== 1?"Create a new General Quick Reply by inputting.":"Create a new Personal Quick Reply by inputting.");


    var tk = localStorage.getItem('tk')
    var settings = {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    $(function() {
        $('#btn-save').parsley();
        $('#btn-save').submit(function(e){
            var alertMultiple = [];
            e.preventDefault();

            $(".page-loader").removeAttr("style")
            settings.url = "/api/quick/reply"
            settings.data = JSON.stringify({
                type:type,
                message:$("#message").val(),
                shortcut:$("#shortcut").val(),
            });
            $.ajax(settings).done(function (response) {
                $(".page-loader").attr("style","display:none")
                Swal.fire({
                    title: 'Hmm',
                    text: type == 1 ? "Add general quick reply successfuly!":"Add personal quick reply successfuly!",
                    icon: 'success',
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton:false,
                    timer:2000,
                    timerProgressBar: true
                }).then(function() {
                    location.replace(type == 1 ? '/general-quick-replies':'/personal-quick-replies');
                });
            }).fail(function(response) {
                $(".page-loader").attr("style","display:none")
                $.each(response.responseJSON.error,function(key,val) {
                    alertMultiple.push({icon:'warning',title:"Warning",text:val})
                });
                swal.queue(alertMultiple);
            });
        })
    })

    /* validation input */
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

    setInputFilter(document.getElementById("shortcut"), function (value) {
        return /^[a-zA-z_-\d]*$/i.test(value);
    });
</script>
@endsection
