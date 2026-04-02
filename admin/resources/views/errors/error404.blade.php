@extends('layouts.app-error.app-error')
@section('content')
<div class="container">
    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="text-center">
                <div class="text-center">
                    <img src="{{ asset('assets/images/illustration/404.svg') }}" alt="" class="error-img  w-50">
                    <h3 class="text-uppercase">Sorry, page not found</h3>
                    <div class="mt-3 text-center">
                        <a class="btn btn-dark waves-effect waves-light" href="javascript:void(0)"
                            onclick="redirect()">Go to Home</a>
                    </div>
                    <p class="mt-3">
                        <script>
                            document.write(new Date().getFullYear())

                        </script> © Qwords.com Crafted with <i class="mdi mdi-heart text-danger"></i> by Qwords Dev Team
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
