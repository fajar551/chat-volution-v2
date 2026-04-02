@extends('layouts.app-chat.app')
@section('content')
<input type="hidden" id="meta" value="{{ $meta }}">
<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12 ml-1">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0" id="headerLbl">Label Menu</h4>
            </div>
            <p id="descLbl">Description</p>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <div class="card-body">
                    <div class="form-group">
                        <label>Condition <span id="statusCondition"></span></label>
                        <div class="custom-control custom-switch custom-switch-md ">
                            <input type="checkbox" class="custom-control-input" id="customSwitch3" onchange="changeSwitch()">
                            <label class="custom-control-label" for="customSwitch3" id="swipeLbl"></label>
                        </div>
                    </div>
                    <div class="form-group float-right">
                        <button type="button" disabled style="cursor:no-drop" class="btn btn-primary waves-effect waves-light btn-save">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end row -->

</div> <!-- container-fluid -->

@endsection

@section('footer')
@include('shared.footer')
<script>
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

    /* assets switch function */
    $("#customSwitch3").prop('checked',false);
    var oldSwitch = 0;
    var meta = $("#meta").val();
    var menu = meta.replace("_"," ");

    $("#headerLbl").html("Inbox Setting");
    $("#descLbl").html("Show Others tab <br> Show list of cases that are being handled by other agent.");
    $("#descMsg").html("Automatic message, if you resolved their case.");
    $("#swipeLbl").html("Swipe To Right, Enable Inbox Setting");

    /* assets header api */
    var tk = localStorage.getItem('tk')
    var settings = {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    /* get detail */
    function getDetail() {
            settings.url = '/api/setting'
            settings.method = 'GET'
            settings.data = {
                meta:meta,
            }
            $.ajax(settings).done(function (response) {
                $("#customSwitch3").prop('checked',response.data == null ? 0 : response.data.status);
                oldSwitch = response.data != null ? response.data.status : 0;
                changeSwitch();
            });
    }
    getDetail();

    function changeSwitch() {
        if(oldSwitch && !$("#customSwitch3").prop('checked')){
            $(".btn-save").removeAttr("style");
            $(".btn-save").removeAttr("disabled");
            $("#message").attr("disabled",true);
            $("#message").attr("style","cursor:no-drop");
        }else if ($("#customSwitch3").prop('checked') &&(oldSwitch || !oldSwitch)) {
            $("#message").removeAttr("disabled");
            $("#message").removeAttr("style");
            $(".btn-save").removeAttr("disabled");
            $(".btn-save").removeAttr("style");
        }else{
            $("#message").attr("disabled",true);
            $(".btn-save").attr("disabled",true);
            $(".btn-save").attr("style","cursor:no-drop");
            $("#message").attr("style","cursor:no-drop");
        }

        $("#statusCondition").removeClass("text-danger");
        $("#statusCondition").removeClass("text-success");
        if (!oldSwitch) {
            $("#statusCondition").addClass("text-danger");
            $("#statusCondition").html('(Off)')
        }else{
            $("#statusCondition").addClass("text-success");
            $("#statusCondition").html('(Active)')
        }
    }

    $('.btn-save').click(function(e){
        e.preventDefault();
        if ($("#customSwitch3").prop('checked')||oldSwitch) {
            $(".page-loader").removeAttr("style")
                settings.url = "/api/setting"
                settings.method = "POST"
                settings.data = JSON.stringify({
                    meta:meta,
                    status:$("#customSwitch3").prop('checked'),
                });
                $.ajax(settings).done(function (response) {
                    $(".page-loader").attr("style","display:none")
                    Toast.fire({
                        icon: "success",
                        title: "Save "+menu+" successfuly!",
                    });
                    oldSwitch =$("#customSwitch3").prop('checked')
                    // getDetail();
                    changeSwitch()
                }).fail(function(response) {
                    $(".page-loader").attr("style","display:none")
                    Toast.fire({
                        icon: "warning",
                        title: 'Error code message: 500!',
                    });
                });
        }else{
            alert("Please swipe to enable "+menu+"!")
        }

    })
</script>
@endsection
