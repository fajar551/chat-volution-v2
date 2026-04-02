@extends('layouts.app-verify.app-verify')
@section('content')
<input type="hidden" id="tk" value="{{ !empty($token )?$token :null}}">
<input type="hidden" id="lc" value="{{ !empty($live_chat)?$live_chat:null }}">
<input type="hidden" id="crm" value="{{ !empty($crm)?$crm:null }}">
<input type="hidden" id="smm" value="{{ !empty($social_pilot)?$social_pilot:null }}">
<input type="hidden" id="id" value="{{ !empty($id)?$id:null }}">
<input type="hidden" id="message" value="{{ !empty($message)?$message:null }}">
<input type="hidden" id="code" value="{{ !empty($code)?$code:null }}">
<input type="hidden" id="permission" value="{{ !empty($permission)?$permission:null }}">
<input type="hidden" id="permission_name" value="{{ !empty($permission_name)?$permission_name:null }}">
<input type="hidden" id="uuid" value="{{ !empty($uuid)?$uuid:null }}">
<input type="hidden" id="name" value="{{ !empty($name)?$name:null }}">
<input type="hidden" id="email" value="{{ !empty($email)?$email:null }}">
<input type="hidden" id="phone" value="{{ !empty($phone)?$phone:null }}">
<input type="hidden" id="id_department" value="{{ !empty($id_department)?$id_department:null }}">
<input type="hidden" id="department_name" value="{{ !empty($department_name)?$department_name:null }}">
<input type="hidden" id="id_company" value="{{ !empty($id_company)?$id_company:null }}">
<input type="hidden" id="company_name" value="{{ !empty($company_name)?$company_name:null }}">
<input type="hidden" id="avatar" value="{{ !empty($avatar)?$avatar:null }}">
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
                <div class="card-header cc-page">
                    <div class="text-center sm-hide">
                        <img class="w-25" src="{{ asset('assets/images/logo-light.png') }}" alt="Qchat Social Management">
                    </div>
                    <div class="text-center lg-hide">
                        <img class="w-35" src="{{ asset('assets/images/logo-light.png') }}" alt="Qchat Social Management">
                    </div>
                </div>
                <div class="card-body">
                    <h2 class="card-title text-center font-size-24 font-weight-bold header-page"></h2>
                    <div class="text-center">
                        <img class="w-35 img-fluid" id="illustration-page" alt="Qchat Social Management">
                        <p class="mt-2">
                            <span class="text-center">
                                <span id="waiting-text"></span>
                                <span id="countdown" class="font-size-15 font-weight-bold"></span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection