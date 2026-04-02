@extends('layouts.app-chat.app')
@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Add new role</h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="/roles"><i class="ri-arrow-left-line mr-2"></i> Back to
                                list</a></li>
                    </ol>
                </div>
            </div>
            <p>Add role with manual inputing by admin.</p>
        </div>
    </div>

    <div class="row justify-content-center">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" data-parsley-required class="form-control"
                                placeholder="Type name">
                        </div>
                        <div class="form-group">
                            <label for="permission">Permission</label>
                            <input type="text" id="permission" data-parsley-required class="form-control"
                                placeholder="Type permission">
                        </div>

                        <div class="form-group float-right">
                            <button type="submit" class="btn btn-primary">Save</button>
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
