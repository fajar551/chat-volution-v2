@extends('layouts.app-chat.app')
@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 mb-3">
                <div class="page-title-box d-flex align-items-center justify-content-between" style="padding-bottom: 5px;">
                    <h4 class="mb-0">Integration Whatsapp</h4>
                </div>
                <!-- <span onclick="showDocumentation('read')" class="text-url-secondary">
                                                                Read Documentation <i class="fas fa-question-circle"></i>
                                                            </span> -->
            </div>
        </div>

        <div class="row justify-content-center" id="iCardWA"></div>

        <div class="row justify-content-center" id="formConnecting">
            <div class="col-12 col-md-8 col-lg-6">
                <div class="card">
                    <div class="card-header bg-white">
                        <span class="float-left font-size-16 text-url-dark font-weight-bold pointer back-first"
                            onclick="backFirstStep()"><i class="fas fa-arrow-left"></i></span>
                        <h5 class="card-title text-center font-size-24 text-tangerin font-weight-bold">Form Integration</h2>
                    </div>
                    <form id="btn-save" data-parsley-validate data-parsley-errors-messages-disabled>
                        <div class="card-body">
                            <div class="form-group">
                                <p for="phone" class="mb-2 font-weight-bold">Phone Number<span
                                        class="text-danger">*</span></p>
                                <input type="tel" required id="phone" class="form-control">
                                <span class="text-danger" id="err_phone">Phone Number is required!
                                </span>
                            </div>
                        </div>
                        <div class="card-footer text-center">
                            <button type="submit"
                                class="btn btn-tangerin btn-block w-50 waves-effect waves-light btn-connect">
                                <i class="fas fa-link mr-1"></i> Connect
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="row justify-content-center" id="qrWA">
            <div class="col-12 col-md-12 col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <div class="mt-3 row">
                            <div class="col-12 col-md-12 col-lg-7">
                                <h5 class="text-left text-dark-soft font-size-20">To use Whatsapp on ChatVolution:</h5>
                                <ol class="tutorial-list">
                                    <li class="font-size-16 text-left text-dark-soft">Open WhatsApp on your phone</li>
                                    <li class="font-size-16 text-left text-dark-soft">Tap <strong>Menu <span
                                                class="badge badge-secondary"><i
                                                    class="fas fa-ellipsis-v font-size-18 m-1"></i></span></strong> or
                                        <strong>Settings <span class="badge badge-secondary"><i
                                                    class="fas fa-cog my-2 mx-1"></i></span></strong> and select
                                        <strong>Linked Devices</strong>
                                    </li>
                                    <li class="font-size-16 text-left text-dark-soft">Point your phone to this screen to
                                        capture the code</li>
                                </ol>
                            </div>
                            <div class="col-12 col-md-12 col-lg-5 ">
                                {{-- <div id="qrcode" class="qrcode"></div> --}}
                                <img id="qrCode" src="" alt="QR Code">
                                <div id="btn-qrcode" class="btn-qrcode"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        @include('live-chat.integrations.DocIntegration')
    </div>
@endsection

@section('footer')
    @include('shared.footer')
@endsection
