@extends('layouts.app-chat.app')
@section('content')
<div class="container-fluid">
    <div class="row clearfix" id="app">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <passport-clients></passport-clients>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <passport-authorized-clients></passport-authorized-clients>
        </div>
        {{-- <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <passport-personal-access-tokens></passport-personal-access-tokens>
        </div> --}}
    </div>
</div>

<script src="{{ url('assets/js/client/app.js') }}"></script>
@endsection


@section('footer')
@include('shared.footer')
<script>
    var settings = {
        "url": "/api/register",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
    };

    $(document).ready(function(){

        $('#btn-save').click(function(e){
            e.preventDefault();
            settings.data =  JSON.stringify({
                name: $('#name').val(),
                email: $('#email').val(),
                password: $('#password').val(),
                confirm_password: $('#confirm_password').val()
            })

            $.ajax(settings).done(function (response) {
                if  (Boolean(response.success)){
                    location.href = '/login?message=success create data'
                } else {
                    alert(res.message)
                }
            });
        })

    })

</script>
@endsection
