@extends('layouts.app-chat.app')
@section('content')
<input type="hidden" id="id" value="{{ $id }}">
<input type="hidden" id="label" value="{{ $label }}">

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box  align-items-center justify-content-between">
                <h4 class="mb-0">Edit agent</h4>
                <p>Changes agent user by inputting.</p>
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
                            <input readonly disabled style="cursor:no-drop" id="email" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Department</label>
                            <select disabled style="cursor:no-drop" id="department" class="form-control">
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Roles</label>
                            <input type="text" class="form-control" style="cursor: no-drop" id="roles" disabled readonly>
                        </div>

                        <button type="submit" class="btn btn-primary waves-effect waves-light">Save changes</button>
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

    var tk = localStorage.getItem('tk')
    var id = $("#id").val()
    var label = $("#label").val()
    $("#roles").val(label);
    var status = 2

    var settings = {
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
            settings.method = 'PUT'
            settings.url = "/api/agent"
            settings.data = JSON.stringify({
                id: id,
                name: $('#name').val(),
                status: status
            });
            $.ajax(settings).done(function (response) {
                $(".page-loader").attr("style","display:none")
                Swal.fire({
                    title: 'Congratulation',
                    text:"Edit " + label + " successfuly!",
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
                    if (key == 'name') {
                        alertMultiple.push({icon:'warning',title:"Warning",text:val})
                    }
                });
                swal.queue(alertMultiple);
            });
        })
    })

    $(document).ready(function() {
        delete settings.data

        /* selector department */
        settings.method = 'POST'
        settings.url = '/api/agent/department/list'
        $.ajax(settings).done(function (response) {
            response.data.forEach(el => {
                $('#department').append(`
                    <option value="${el.id}"> ${el.name} </option>
                `)
            })
        });

        /* selector role */
        settings.url = '/api/agent/roles/list'
        $.ajax(settings).done(function (response) {
            response.data.forEach(el => {
                if (el.id == 3 || el.id == 4 ) {
                    $('#roles_select').append(`
                        <label class="selectgroup-item ml-1">
                            <input type="radio" disabled id="id_role_${el.id}" name="roles" value="${el.id}" class="selectgroup-input" />
                            <span class="selectgroup-button selectgroup-button-icon">${el.name}</span>
                        </label>
                    `)
                }
            })
        });


        /* detail agent */
        settings.url = '/api/agent/'+id
        settings.method = 'GET'

        $.ajax(settings).done(function (response) {
            id = response.data.id
            status = response.data.status;
            $("#name").val(response.data.name);
            $("#email").val(response.data.email);
            document.getElementById('department').value= response.data.id_department;
            $("#id_role_"+response.data.id_roles).prop("checked", true);
        });
    })

</script>
@endsection
