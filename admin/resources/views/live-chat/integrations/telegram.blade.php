@extends('layouts.app-chat.app')
@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12 mb-3">
            <div class="page-title-box d-flex align-items-center justify-content-between" style="padding-bottom: 5px;">
                <h4 class="mb-0">Integration Telegram</h4>
            </div>
            <span onclick="showDocumentation('read')" class="text-url-secondary">
                Read Documentation <i class="fas fa-question-circle"></i>
            </span>
        </div>
    </div>

    <div class="row justify-content-center" id="iCardTelegram"></div>

    <div class="row justify-content-center" id="formConnecting">
        <div class="col-12 col-md-8 col-lg-8">
            <div class="card">
                <div class="card-header bg-white">
                    <span class="float-left font-size-16 text-url-dark font-weight-bold pointer" onclick="backFirstStep()"><i class="fas fa-arrow-left"></i></span>
                    <h5 class="card-title text-center font-size-24 text-tangerin font-weight-bold">Form Integration</h2>
                </div>
                <form id="btn-save" data-parsley-validate data-parsley-errors-messages-disabled>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="telegram_api_username">Telegram Username<span class="text-danger">*</span></label>
                            <input data-parsley-required autocomplete="off" id="telegram_api_username" class="form-control input-apiUsername" placeholder="Example username: xyng.c0de">
                            <span class="text-danger" id="err_telegram_api_username">Telegram Username is required!</span>
                        </div>
                        <div class="form-group">
                            <label for="telegram_api_id">Telegram Api ID<span class="text-danger">*</span></label>
                            <input data-parsley-required autocomplete="off" id="telegram_api_id" class="form-control input-apiID" placeholder="Type Your Telegram API ID">
                            <span class="text-danger" id="err_telegram_api_id">Telegram API ID is required!</span>
                        </div>
                        <div class="form-group">
                            <label for="telegram_api_hash">Telegram API Hash<span class="text-danger">*</span></label>
                            <input type="text" required id="telegram_api_hash" class="form-control" placeholder="Type Telegram API Hash">
                            <span class="text-danger" id="err_telegram_api_hash">Telegram API HASH is required!</span>
                        </div>
                        <div class="form-group">
                            <p for="phone_number" class="mb-2 font-weight-bold">Phone Number<span class="text-danger">*</span></p>
                            <input type="tel" required id="mobile_number" class="form-control">
                            <span class="text-danger" id="err_mobile_number">Phone Number is required!
                            </span>
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        <button type="submit" class="btn btn-tangerin btn-block w-50 waves-effect waves-light font-weight-bold">
                            <i class="fas fa-link mr-1"></i> Connect
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="row justify-content-center" id="formOTP">
        <div class="col-12 col-md-8 col-lg-6">
            <div class="card">
                <div class="card-header bg-white">
                    <h5 class="card-title text-center font-size-24 text-tangerin font-weight-bold">Verify OTP</h2>
                </div>
                <form>
                    <div class="card-body">
                        <div class="text-center">
                            <img class="w-25 img-fluid" src="{{asset('assets/images/illustration/il-otp-tangerin.svg')}}" alt="Qchat OTP Illustration">
                            <p class="mt-2 font-size-14 text-muted">
                                Enter 5 digit code we sent to your Telegram.
                            </p>
                            <input class="otp" id="digit-1" type="text" oninput='digitValidate(this)' onkeyup='tabChange(1)' maxlength=1>
                            <input class="otp" id="digit-2" type="text" oninput='digitValidate(this)' onkeyup='tabChange(2)' maxlength=1>
                            <input class="otp" id="digit-3" type="text" oninput='digitValidate(this)' onkeyup='tabChange(3)' maxlength=1>
                            <input class="otp" id="digit-4" type="text" oninput='digitValidate(this)' onkeyup='tabChange(4)' maxlength=1>
                            <input class="otp" id="digit-5" type="text" oninput='digitValidate(this)' onkeyup='tabChange(5)' maxlength=1>
                            <p class="font-size-14 mt-3">
                                <span class="text-center">
                                    <!-- <span id="waiting-text">Resend code in: </span> -->
                                    <span id="waiting-text">Send code otp countdown: </span>
                                    <span id="countdown" class="font-size-14 text-tangerin font-weight-bold"></span>
                                </span>
                                <!-- <a id="send-again" onclick="sendAgain()" class="text-center text-url-dark text-tangerin font-size-14">
                                    Resend Code <i class="fas fa-redo ml-1"></i>
                                </a> -->
                            </p>
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        <button class="btn btn-tangerin btn-block w-50 font-weight-bold waves-effect waves-light" onclick="verifyAccount()">
                            <i class="fas fa-check mr-1"></i> Verify
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    @include('live-chat.integrations.DocIntegration')
</div>
@endsection

@section('footer')
@include('shared.footer')
@endsection
