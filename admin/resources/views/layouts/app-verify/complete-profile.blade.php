@extends('layouts.app-verify.app-verify')
@section('content')
<input type="hidden" id="token" value="{{ !empty($token )?$token :null}}">
<input type="hidden" id="email" value="{{ !empty($email)?$email:null }}">
<input type="hidden" id="name" value="{{ !empty($name)?$name:null }}">
<input type="hidden" id="message" value="{{ !empty($message)?$message:null }}">
<input type="hidden" id="id" value="{{ !empty($id)?$id:null }}">
<input type="hidden" id="code" value="{{ !empty($code)?$code:null }}">
<input type="hidden" id="id_roles" value="{{ !empty($id_roles)?$id_roles:null }}">

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

    .loading span {
        display: inline-block;
        margin: 0 -0.05em;
    }

    .loading03 span {
        margin: 0 -0.075em;
        animation: loading03 0.7s infinite alternate;
    }

    .loading03 span:nth-child(2) {
        animation-delay: 0.1s;
    }

    .loading03 span:nth-child(3) {
        animation-delay: 0.2s;
    }

    .loading03 span:nth-child(4) {
        animation-delay: 0.3s;
    }

    .loading03 span:nth-child(5) {
        animation-delay: 0.4s;
    }

    .loading03 span:nth-child(6) {
        animation-delay: 0.5s;
    }

    .loading03 span:nth-child(7) {
        animation-delay: 0.6s;
    }

    .loading03 span:nth-child(8) {
        animation-delay: 0.6s;
    }

    .loading03 span:nth-child(9) {
        animation-delay: 0.6s;
    }

    .loading03 span:nth-child(10) {
        animation-delay: 0.6s;
    }

    @keyframes loading03 {
        0% {
            transform: scale(1);
        }

        100% {
            transform: scale(0.8);
        }
    }

</style>
<div class="container">
    <div class="row justify-content-center">
        <div class="col-12 col-md-12 col-lg-8">
            <div class="card">
                <div class="card-header bg-soft-tangerin-700">
                    <div class="text-center">
                        <img class="w-25" src="{{ asset('assets/images/logo-light.png') }}"
                            alt="Qchat Social Management">
                    </div>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        <img class="w-35 img-fluid" id="illustration-page"
                            src="{{ asset('assets/images/illustration/il-confirm-step.svg') }}"
                            alt="Qchat Social Management">
                    </div>
                    <h2 class="card-title text-center font-size-24 font-weight-bold text-tangerin">Form Profile</h2>
                    <p class="mt-2 text-center desc"></p>
                    <form class="form-horizontal" id="btn-save" data-parsley-validate
                        data-parsley-errors-messages-disabled>
                        <div class="form-group mt-1">
                            <i class="fas fa-mobile auti-custom-input-icon"></i>
                            <label for="phone">Phone Number<span class="text-danger">*</span></label><br>
                            <input type="tel" required id="phone" class="form-control"><br>
                            <span class="text-danger" id="err_phone">Phone Number is required!
                            </span>
                        </div>
                        <div class="form-group mt-1 comp-field">
                            <i class="far fa-id-card auti-custom-input-icon"></i>
                            <label for="company_name">Company Name<span class="text-danger">*</span></label>
                            <input type="text" data-parsley-required class="form-control" id="company_name"
                                placeholder="Masukan nama perusahaan anda">
                            <span class="text-danger" id="err_company_name">Company name is required!</span>
                        </div>

                        <div class="form-group mt-1">
                            <i class="fas fa-lock auti-custom-input-icon"></i>
                            <label for="password">Password<span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" data-parsley-minlength="8" data-parsley-uppercase="1"
                                    data-parsley-lowercase="1" data-parsley-number="1" data-parsley-special="1"
                                    data-parsley-required class="form-control" id="password"
                                    placeholder="Type your password">
                                <div class="input-group-prepend">
                                    <button type="button" class="btn btn-tangerin rounded-right btn-is-show-password"
                                        data-show="false" data-fieldname="password" onclick="showHidePassword(this)">
                                        <i class="fas fa-eye-slash is-show-password"></i>
                                    </button>
                                </div>
                            </div>
                            <span class="text-danger" id="err_password"></span>
                        </div>

                        <div class="form-group mt-1">
                            <i class="fas fa-lock auti-custom-input-icon"></i>
                            <label for="confirm_password">Confirmation Password<span
                                    class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" data-parsley-required data-parsley-equalto="#password"
                                    class="form-control" id="confirm_password" placeholder="Retype your password">
                                <div class="input-group-prepend">
                                    <button type="button"
                                        class="btn btn-tangerin rounded-right btn-is-show-confirm_password"
                                        data-show="false" data-fieldname="confirm_password"
                                        onclick="showHidePassword(this)">
                                        <i class="fas fa-eye-slash is-show-confirm_password"></i>
                                    </button>
                                </div>
                            </div>

                            <span class="text-danger" id="err_confirm_password">Confirmation password not same!</span>
                        </div>
                        <div class="mt-3 text-center">
                            <button
                                class="w-50 btn btn-tangerin btn-lg btn-block waves-effect waves-light btn-submit sm-hide"
                                type="submit">
                                Complete & Continue
                            </button>
                            <button
                                class="btn btn-tangerin btn-lg btn-block waves-effect waves-light btn-submit lg-hide"
                                type="submit">
                                Complete & Continue
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
