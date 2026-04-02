@extends('layouts.app-chat.app')
@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Add new department</h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="/departments"><i class="ri-arrow-left-line mr-2"></i> Back to departments</a></li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate data-parsley-errors-messages-disabled>
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label for="name">Name<span class="text-danger">*</span></label>
                            <input type="text" id="name" class="form-control" data-parsley-minlength="2" data-parsley-required placeholder="Type name">
                            <span class="text-danger" id="err_name"></span>
                        </div>
                        <div class="form-group">
                            <label for="description">Description<span class="text-danger">*</span></label>
                            <input type="text" id="description" class="form-control" data-parsley-minlength="6" data-parsley-required placeholder="Type description">
                            <span class="text-danger" id="err_description"></span>
                        </div>
                        <div class="form-group float-right mb-2">
                            <button type="submit" class="btn btn-tangerin waves-effect waves-light">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- end row -->

</div> <!-- container-fluid -->

@endsection

@section('footer')
@include('shared.footer')
@endsection