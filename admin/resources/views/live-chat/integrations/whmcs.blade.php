@extends('layouts.app-chat.app')
@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12 mb-3">
            <div class="page-title-box d-flex align-items-center justify-content-between" style="padding-bottom: 5px;">
                <h4 class="mb-0">Integration WHMCS</h4>
            </div>
            <span onclick="showDocumentation('read')" class="text-url-secondary">
                Read Documentation <i class="fas fa-question-circle"></i>
            </span>
        </div>
    </div>

    <div class="row justify-content-center" id="iCardWHMCS"></div>

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
                            <label for="domain">Domain<span class="text-danger">*</span></label>
                            <input type="text" data-parsley-required autocomplete="off" id="domain" class="form-control input-apiID" placeholder="Type Your Domain">
                            <span class="text-danger" id="err_domain">Domain is required!</span>
                        </div>
                        <div class="form-group">
                            <label for="identifier">Identifier<span class="text-danger">*</span></label>
                            <input type="text" required id="identifier" class="form-control" placeholder="Type Identifier">
                            <span class="text-danger" id="err_identifier">Identifier is required!</span>
                        </div>
                        <div class="form-group">
                            <label for="secret">Secret<span class="text-danger">*</span></label>
                            <input type="text" required id="secret" class="form-control" placeholder="Type Secret">
                            <span class="text-danger" id="err_secret">Secret is required!</span>
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
    @include('live-chat.integrations.DocIntegration')
</div>
@endsection

@section('footer')
@include('shared.footer')
@endsection