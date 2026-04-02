@extends('layouts.app-chat.app')
@section('content')
    <div class="container">
        <div class="row justify-content-center mb-3">
            <div class="col-12 col-md-10 col-lg-8">
                <div class="row">
                    <div class="col-10 col-md-10 col-lg-10">
                        <h5 class="card-title font-size-20">Change Password</h5>
                        <p class="card-text text-muted font-size-18">
                            Choose a strong password and don't reuse it for other accounts.
                        </p>
                        <p>
                            <b>Password strength:</b>
                            Use at least 8 characters. Don’t use a password from another site, or something too obvious like
                            your pet’s name.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-12 col-md-10 col-lg-8">
                <form id="btn-save" data-parsley-validate data-parsley-errors-messages-disabled>
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12 col-sm-12 mb-3">
                                    <div class="form-group">
                                        <label for="old_password">Old Password<span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="password" id="old_password" class="form-control"
                                                data-parsley-required placeholder="Type your password">
                                            <div class="input-group-prepend">
                                                <button type="button"
                                                    class="btn btn-tangerin rounded-right btn-is-show-old_password"
                                                    data-show="false" data-fieldname="old_password"
                                                    onclick="showHidePassword(this)">
                                                    <i class="fas fa-eye-slash is-show-old_password"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <span class="text-danger mt-1" id="err_old_password"></span>
                                    </div>
                                    <div class="form-group">
                                        <label for="new_password">New Password<span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="password" id="new_password" class="form-control"
                                                data-parsley-minlength="8" data-parsley-uppercase="1"
                                                data-parsley-lowercase="1" data-parsley-number="1" data-parsley-special="1"
                                                data-parsley-required placeholder="Type your password">
                                            <div class="input-group-prepend">
                                                <button type="button"
                                                    class="btn btn-tangerin rounded-right btn-is-show-new_password"
                                                    data-show="false" data-fieldname="new_password"
                                                    onclick="showHidePassword(this)">
                                                    <i class="fas fa-eye-slash is-show-new_password"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <span class="text-danger" id="err_new_password"></span>
                                    </div>
                                    <div class="form-group">
                                        <label for="c_n_password">Confirm New Password<span
                                                class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="password" id="c_n_password" data-parsley-equalto="#new_password"
                                                class="form-control" data-parsley-required
                                                placeholder="Type your password">
                                            <div class="input-group-prepend">
                                                <button type="button"
                                                    class="btn btn-tangerin rounded-right btn-is-show-c_n_password"
                                                    data-show="false" data-fieldname="c_n_password"
                                                    onclick="showHidePassword(this)">
                                                    <i class="fas fa-eye-slash is-show-c_n_password"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <span class="text-danger mt-1" id="err_c_n_password"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <div class="float-right">
                                <button type="button" class="btn btn-secondary font-size-18 m-1 waves-effect"
                                    onclick="backProfile()">
                                    Cancel
                                </button>
                                <button type="submit" class="btn btn-tangerin font-size-18 m-1 waves-effect btn-submit">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    </div>
@endsection
