@extends('layouts.app-chat.app')
@section('content')
    <input type="hidden" id="id" value="{{ $id }}">
    <input type="hidden" id="label" value="{{ $label }}">
    <input type="hidden" id="title" value="{{ $title }}">

    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="page-title-box d-flex align-items-center justify-content-between">
                    <h4 class="mb-0" id="menu-label"></h4>
                    <div class="page-title-right">
                        <ol class="breadcrumb m-0">
                            <li class="breadcrumb-item">
                                <a id="backUrl"></a>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <div class="row justify-content-center">
            <div class="col-xl-12 col-sm-12">
                <div class="card pricing-box">
                    <form id="btn-save" data-parsley-validate data-parsley-errors-messages-disabled>
                        <div class="card-body p-4">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" id="name" data-parsley-minlength="2" data-parsley-required
                                    class="form-control" placeholder="Type name">
                                <span class="text-danger" id="err_name"></span>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input readonly disabled style="cursor:no-drop" id="email" class="form-control">
                                <span class="text-danger" id="err_email"></span>
                            </div>
                            <div class="form-group i-department">
                                <label for="department">Department</label>
                                <select id="department" class="form-control selectpicker-search list-department"
                                    title="Choose Department">
                                </select>
                                <span class="text-danger" id="err_department"></span>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <div class="input-group" >
                                    <input class="form-control" id="show_hide_password" type="password">
                                    <div class="generate-password ml-3">
                                        <a onclick="generatePassword()" class="btn btn-primary text-white">Generate Password</a>
                                    </div>
                                </div>
                                <div class="form-check mb-3 mt-2">
                                    <input class="form-check-input" type="checkbox" onclick="showPassword()" id="defaultCheck1">
                                    <label class="form-check-label" for="defaultCheck1">
                                        Show Password
                                    </label>
                                </div>
                            </div>
                            <div class="form-group i-company">
                                <label for="company">Company</label>
                                <select id="company" title="Choose Company"
                                    class="form-control selectpicker-search list-company" onchange="getDepartment()">
                                </select>
                                <span class="text-danger" id="err_company"></span>
                            </div>
                            <div class="form-group i-department">
                                <label for="department">Department</label>
                                <select id="department" class="form-control selectpicker-search list-department" title="Choose Department">
                                </select>
                                <span class="text-danger" id="err_department"></span>
                            </div>
                            <div class="form-group i-role">
                                <label for="role">Role</label>
                                <select id="role" class="form-control list-role"
                                    title="Choose role">
                                    <option choosed>Choose Role</option>
                                    <option value="3">Staff</option>
                                    <option value="4">Agent</option>
                                </select>
                            </div>
                            <div class="form-group i-status">
                                <label for="status">Status</label>
                                <select class="form-control" id="account_status" onclick="hideSendEmail()" data-parsley-required>
                                    <option value="0">Inactive</option>
                                    <option value="1">Active</option>
                                    <option value="2">Pending</option>
                                </select>
                                <span class="text-danger" id="err_status"></span>
                            </div>
                            {{-- <div class="form-check mb-3 i-send">
                                <input class="form-check-input" type="checkbox" value="1" id="send_email">
                                <label class="form-check-label" for="send_email">
                                    Send Email
                                </label>
                            </div> --}}
                            {{-- <div class="form-group">
                                <label for="status">Status</label>
                                <div class="custom-control custom-switch custom-switch-md ">
                                    <input type="checkbox" checked class="custom-control-input" id="status">
                                    <label class="custom-control-label" for="status"></label>
                                </div>
                            </div>
                            <div class="form-group i-access">
                                <label for="access">Access</label>
                                <select id="access" class="form-control list-access"
                                    title="Choose Access">
                                    <option value="0" choosed>Limit</option>
                                    <option value="1">Full</option>
                                </select>
                            </div>
                            </div> --}}
                            <div class="form-group float-right mb-2">
                                <button type="submit" class="btn btn-tangerin waves-effect waves-light">Save</button>
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
