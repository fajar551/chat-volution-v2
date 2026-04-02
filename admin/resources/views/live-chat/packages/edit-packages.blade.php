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

<input type="hidden" id="id" value="{{ $id }}">

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0" id="headLable"></h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="/packages"><i class="ri-arrow-left-line mr-2"></i> Back to package list</a></li>
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
                            <label for="shortcut">Name Package <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="text" data-parsley-minlength="2" data-parsley-required class="form-control" id="name">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="message">Description <span class="text-danger">*</span></label>
                            <textarea class="form-control" data-parsley-minlength="10" data-parsley-required name="description" rows="5" id="description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="message">List Package <span class="text-danger">*</span></label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="defaultCheck1">
                                <label class="form-check-label" for="defaultCheck1">
                                    Default checkbox
                                </label>
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary waves-effect waves-light">Save Changes</button>
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
    $("#headLable").html(type== 1?"Edit General Quick Reply":"Edit Personal Quick Reply");
    $("#txtLable").html(type== 1?"Changes general quick reply by inputting.":"Changes personal quick reply by inputting.");

    var id = $("#id").val();
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
            settings.method = "PUT"
            settings.data = JSON.stringify({
                id:id,
                message:$("#message").val(),
                shortcut:$("#shortcut").val(),
            });
            $.ajax(settings).done(function (response) {
                $(".page-loader").attr("style","display:none")
                Swal.fire({
                    title: 'Congratulation',
                    text: type == 1 ? "Edit general quick reply successfuly!":"Edit personal quick reply successfuly!",
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

    /* get detail */
    function getDetail() {
            settings.url = '/api/quick/reply/' + id
            settings.method = 'GET'
            $.ajax(settings).done(function (response) {
                if (response.data.type == type) {
                    $("#shortcut").val(response.data.shortcut);
                    $("#message").val(response.data.message);
                }else{
                    alert("There was an error in retrieving data");
                    location.replace(type == 1 ? '/general-quick-replies':'/personal-quick-replies');
                }
            });
    }
    getDetail();

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
