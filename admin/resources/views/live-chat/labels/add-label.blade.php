@extends('layouts.app-chat.app')
@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Add new label</h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="/labels"><i class="ri-arrow-left-line mr-2"></i> Back to labels</a></li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label for="name">Name<span class="text-danger">*</span></label>
                            <input type="text" required id="name" class="form-control" placeholder="Type name">
                        </div>
                        <div class="form-group">
                            <label for="description">Description<span class="text-danger">*</span></label>
                            <input type="text" required id="description" class="form-control" placeholder="Type description">
                        </div>
                        <div class="form-group">
                            <label for="color">Label Color <span class="text-danger">*</span></label>
                            <div class="row gutters-xs">
                                <div class="col-auto">
                                    <div id="iColor"></div>
                                </div>
                            </div>
                            <div class="form-group float-right mb-2">
                                <button type="submit" class="btn btn-tangerin waves-effect waves-light">Save</button>
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