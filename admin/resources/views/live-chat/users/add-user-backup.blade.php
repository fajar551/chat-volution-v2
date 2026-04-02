@extends('layouts.app-chat.app')
@section('content')
<input type="hidden" id="label" value="{{ $label }}">
<input type="hidden" id="title" value="{{ $title }}">

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box align-items-center justify-content-between">
                <h4 class="mb-0" id="menu-label"></h4>
            <p id="description-label"></p>

            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="name" data-parsley-minlength="2" data-parsley-required class="form-control" placeholder="Type name">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" data-parsley-type="email" data-parsley-required class="form-control" placeholder="Type email">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="password" data-parsley-minlength="8" data-parsley-required class="form-control" placeholder="Type password">
                        </div>
                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" id="c_password" class="form-control" data-parsley-minlength="6" data-parsley-equalto="#password" data-parsley-required placeholder="Re Type password">
                        </div>
                        <div class="form-group">
                            <label>Department</label>
                            <select id="department" data-parsley-required class="form-control">
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Roles</label>
                            <input type="text" class="form-control" style="cursor: no-drop" id="roles" disabled readonly>
                        </div>

                        <button class="btn btn-primary waves-effect waves-light">Save</button>
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
    var label = $("#label").val();
    $("#roles").val(label);
    $("#headLbl").html("ADD NEW "+label.toUpperCase())

    // var id_role = 1;
    var id_role = label == 'Staff' ? 3 : 4;

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
            e.preventDefault();
            var alertMultiple = [];

            $(".page-loader").removeAttr("style")
            settings.url = "/api/agent"
            settings.data = JSON.stringify({
                id_roles: id_role,
                id_department: $('#department').val(),
                name: $('#name').val(),
                email: $('#email').val(),
                password: $('#password').val(),
                confirm_password: $('#c_password').val()
            });
            $.ajax(settings).done(function (response) {
                $(".page-loader").attr("style","display:none")
                Swal.fire({
                    title: 'Congratulation',
                    text:"Add " + label + " successfuly!",
                    icon: 'success',
                    showCancelButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton:false,
                    timer:2000,
                    timerProgressBar: true
                }).then(function() {
                    location.replace(label == 'Staff'?"/staff":"/agents");
                });
            }).fail(function(response) {
                $(".page-loader").attr("style","display:none")
                $.each(response.responseJSON.error,function(key,val) {
                    if (key == 'id_department') {
                        alertMultiple.push({icon:'warning',title:"Warning",text:"Department is required"})
                    }else{
                        alertMultiple.push({icon:'warning',title:"Warning",text:val[0]})
                    }
                });
                swal.queue(alertMultiple);
            });
        })
    })

    $(document).ready(function() {
        settings.method = 'POST'
        settings.url = '/api/agent/department/list'
        delete settings.data

        /* selector department */
        $("#department").append(`
            <option disabled selected> Choose Department </option>
        `);
        $.ajax(settings).done(function (response) {
            response.data.forEach(el => {
                $('#department').append(`
                    <option value="${el.id}"> ${el.name} </option>
                `)
            })
        });
    })

</script>
@endsection
