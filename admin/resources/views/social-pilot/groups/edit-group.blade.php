@extends('layouts.app-social.app-social')
@section('content')
<input type="hidden" value="{{ $id }}">
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Edit Group</h4>
                <a href="#" class="text-url-dark" title="Read In User Guide?">
                    <i class="fas fa-question-circle"></i>
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body">
                        <div class="form-group">
                            <label for="group_name">Group Name<span class="text-danger">*</span></label>
                            <input type="text" name="group_name" required id="group_name" class="form-control"
                                placeholder="Type Group Name">
                        </div>
                        <div class="form-group">
                            <label for="group_description">Group Description</label>
                            <textarea class="form-control fixed-area" name="group_description"
                                placeholder="Type Description Your Group" id="group_description" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="select_account">Select Account<span class="text-danger">*</span></label>
                            <ul class="nav nav-tabs nav-tabs-custom nav-justified" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link active" data-toggle="tab" href="#instagram1" role="tab">
                                        <span class="d-block d-sm-none" title="instagram"><i
                                                class="ic-fas ic-instagram ic-2x"></i></span>
                                        <span class="d-none d-sm-block"><i class="ic-fas ic-instagram ic-2x"></i></span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-toggle="tab" href="#twitter1" role="tab">
                                        <span class="d-block d-sm-none" title="twitter"><i
                                                class="ic-fas ic-twitter ic-2x"></i></span>
                                        <span class="d-none d-sm-block"><i class="ic-fas ic-twitter ic-2x"></i></span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-toggle="tab" href="#facebook1" role="tab">
                                        <span class="d-block d-sm-none" title="facebook"><i
                                                class="ic-fas ic-facebook ic-2x"></i></span>
                                        <span class="d-none d-sm-block"><i class="ic-fas ic-facebook ic-2x"></i></span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-toggle="tab" href="#tiktok1" role="tab">
                                        <span class="d-block d-sm-none" title="tiktok"><i
                                                class="ic-fas ic-tiktok ic-2x"></i></span>
                                        <span class="d-none d-sm-block"><i class="ic-fas ic-tiktok ic-2x"></i></span>
                                    </a>
                                </li>
                            </ul>
                            <div class="tab-content p-3 text-muted">
                                <div class="tab-pane active" id="instagram1" role="tabpanel">
                                    <div class="form-row">
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane" id="twitter1" role="tabpanel">
                                    <div class="form-row">
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane" id="facebook1" role="tabpanel">
                                    <div class="form-row">
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane" id="tiktok1" role="tabpanel">
                                    <div class="form-row">
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group float-right">
                            <a href="/social-groups" title="Back To List" class="btn btn-secondary">
                                Cancel
                            </a>
                            <button type="submit" title="Save Group" class="btn btn-primary">
                                Save <i class="fas fa-save"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer')
@include('shared.footer')
@endsection

