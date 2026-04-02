@extends('layouts.app-verify.app-verify')
@section('content')
<style>
    /* body {
        overflow: hidden;
    } */

    @media (max-width: 992px) {
        .sm-hide {
            display: none !important;
            visibility: hidden !important;
        }
    }

    @media (min-width: 992px) {
        .lg-hide {
            display: none !important;
            visibility: hidden !important;
        }
    }
</style>
<div class="container">
    <div class="row justify-content-center">
        <div class="col-12 col-md-12 col-lg-8">
            <div class="card">
                <div class="card-header bg-success">
                    <div class="text-center sm-hide">
                        <img class="w-25" src="{{ asset('assets/images/logo-light.png') }}" alt="Qchat Social Management">
                    </div>
                    <div class="text-center lg-hide">
                        <img class="w-35" src="{{ asset('assets/images/logo-light.png') }}" alt="Qchat Social Management">
                    </div>
                </div>
                <div class="card-body">
                    <h2 class="card-title text-success text-center font-size-24 font-weight-bold">
                        Verification Email Sender
                    </h2>
                    <div class="text-center">
                        <img class="w-35 img-fluid" src="{{ asset('assets/images/illustration/il-mailsent.svg') }}" alt="Qchat Social Management">
                        <p class="mt-2 font-size-15">
                            One step again to register and i send email verification to you
                            <b class="font-size-17 lbl-email">(example@qchat.com)</b>,
                            <b class="font-size-17">Please check</b> and <b class="font-size-17">Verify</b>.
                        </p>
                        <button onclick="redirectLogin()" class="btn btn-success w-75 font-size-17 sm-hide">Back to
                            Login</button>
                        <button onclick="redirectLogin()" class="btn btn-success btn-block font-size-17 lg-hide">Back to Login</button>
                        <p class="font-size-17 mt-3">
                            Did not receive email?
                            <br>
                            <span class="text-center">
                                <span id="waiting-text">Wait a: </span>
                                <span id="countdown" class="font-size-15 text-success font-weight-bold"></span>
                            </span>
                            <span class="spinner-grow text-success" role="status" id="processing-loader"></span>
                            <a id="send-again" class="text-center text-url-success font-size-17">
                                Resend email <i class="fas fa-redo"></i>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection