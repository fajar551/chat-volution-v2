@extends('layouts.app-chat.app')
@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0 font-size-18">My Profile</h4>
            </div>
        </div>
    </div>
    <div class="card ">
        <div class="card-body">
            <div class="p-lg-3">

                <div class="table-responsive">
                    <table class="table mb-0">
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td id="dname"></td>
                            </tr>

                            <tr>
                                <td>Email</td>
                                <td id="demail"></td>
                            </tr>

                            <tr>
                                <td>Phone</td>
                                <td id="dphone"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div> <!-- end padding-->
        </div> <!-- end card-body-->
    </div>
</div> <!-- container-fluid -->

@endsection

@section('footer')
@include('shared.footer')
<script>
    var tk = localStorage.getItem('tk')
    var settings = {
        "url": window.base_url_live + "/api/agent/profile/show",
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    $.ajax(settings).done(function(response) {
        var data = response.data
        $('#dname').text(data.name)
        $('#demail').text(data.email)
        $('#dphone').text(data.phone)
        $('.page-loader').hide()
    });
</script>
@endsection