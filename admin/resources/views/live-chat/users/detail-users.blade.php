@extends('layouts.app-chat.app')
@section('content')
<input type="hidden" id="id" value="{{ $id }}">
<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Detail agent</h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="javascript: void(0);"><i class="ri-arrow-left-line mr-2"></i> Back to user contacts</a></li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-6 col-sm-6">
            <div class="card pricing-box">
                <div class="card-body p-4">
                    <div class="form-group">
                        <label>Name</label>
                        <input disabled type="text" id="name" class="form-control" placeholder="Type name">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input disabled id="email" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Department</label>
                        {{-- <select disabled id="department" class="form-control">
                        </select> --}}
                        <div id="department"></div>
                    </div>
                    <div class="form-group">
                        <label>Roles</label>
                        <div id="id_roles"></div>
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

    var tk = localStorage.getItem('tk')
    var id = $("#id").val()
    var status = 2
    var department = null;
    var id_roles = null;

    var settings = {
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    $(document).ready(function() {
        delete settings.data

        /* detail agent */
        settings.url = '/api/agent/'+id
        settings.method = 'GET'

        $.ajax(settings).done(function (response) {
            console.log(response);
            id = response.data.id
            status = response.data.status;
            $("#name").val(response.data.name);
            $("#email").val(response.data.email);
            department = response.data.id_department;
            id_roles = response.data.id_roles;
        });

        /* selector department */
        settings.method = 'POST'
        settings.url = '/api/agent/department/list'
        $.ajax(settings).done(function (response) {
            response.data.forEach(el => {
                if (el.id == department) {
                    $('#department').append(`
                        <input disabled value="${el.name}" class="form-control">
                    `)
                }
            })
        });

        /* selector role */
        settings.url = '/api/agent/roles/list'
        $.ajax(settings).done(function (response) {
            response.data.forEach(el => {
                if (el.id == id_roles) {
                    $('#id_roles').append(`
                        <input disabled value="${el.name}" class="form-control">
                    `)
                }
            })
        });
    })

</script>
@endsection
