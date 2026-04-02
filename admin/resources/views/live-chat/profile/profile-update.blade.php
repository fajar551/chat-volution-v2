@extends('layouts.app-chat.app')
@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-10">
            <div class="card p-3">
                <div class="card-header bg-white border-bottom">
                    <div class="row">
                        <div class="col-12 mb-3">
                            <h5 class="card-title font-size-20">Update Info Profile & Contact</h5>
                            <p class="card-text text-muted font-size-18">Data containing your information and your contacts</p>
                        </div>
                    </div>
                </div>
                <form id="btn-save" data-parsley-validate data-parsley-errors-messages-disabled>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-12 col-sm-4 mb-3">
                                <h5 class="card-title">UUID:</h5>
                                <p class="card-text text-muted dt-uuid"></p>
                            </div>
                            <div class="col-12 col-sm-4 mb-3">
                                <div class="form-group">
                                    <label for="name">Name<span class="text-danger">*</span></label>
                                    <input type="text" id="name" class="form-control" data-parsley-minlength="2" data-parsley-required placeholder="Type name">
                                    <span class="text-danger" id="err_name"></span>
                                </div>
                            </div>
                            <div class="col-12 col-sm-4 mb-3">
                                <div class="form-group">
                                    <!-- <label for="email">Email<span class="text-danger">*</span></label> -->
                                    <!-- <input type="email" id="email" class="form-control" data-parsley-type="email" data-parsley-required="true" placeholder="Type Email">
                                    <span class="text-danger" id="err_email"></span> -->
                                    <h5 class="card-title">Email</h5>
                                    <p class="card-text text-muted dt-email"></p>
                                </div>
                            </div>
                            <div class="col-12 col-sm-4 mb-3">
                                <div class="form-group mt-1">
                                    <label for="phone">Phone Number<span class="text-danger">*</span></label>
                                    <input data-parsley-required class="form-control" id="phone" placeholder="example: 813xxxx">
                                    <span class="text-danger" id="err_phone"></span>
                                </div>
                            </div>
                            <div class="col-12 col-sm-4 mb-3">
                                <h5 class="card-title">Role</h5>
                                <p class="card-text text-muted dt-permission_name"></p>
                            </div>
                            <div class="col-12 col-sm-4 mb-3">
                                <h5 class="card-title">Company Name</h5>
                                <p class="card-text text-muted dt-company_name"></p>
                            </div>
                            <div class="col-12 col-sm-4 mb-3">
                                <h5 class="card-title">Department Name</h5>
                                <p class="card-text text-muted dt-department_name"></p>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="float-right">
                            <button type="button" class="btn btn-secondary font-size-18 m-1 waves-effect" onclick="backProfile()">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-tangerin font-size-18 m-1 waves-effect btn-submit">
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection