@extends('layouts.app-social.app-social')
@section('content')
<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">
                    Manage Groups
                    <a href="#" class="text-url-dark ml-2" title="Read In User Guide?">
                        <i class="fas fa-question-circle"></i>
                    </a>
                </h4>
                <a href="/social-create-group" class="btn btn-success d-block d-sm-none">
                    <i class="ri-add-line align-middle"></i> New Account
                </a>
                <div class="page-title-right d-none d-sm-block">
                    <a href="/social-create-group" class="btn btn-success waves-effect waves-light font-weight-bold ">
                        <i class="ri-add-line align-middle mr-2"></i> New Account
                    </a>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="example" class="table table-bordered dt-responsive nowrap"
                            style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                            <thead class="thead-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Group Name</th>
                                    <th>Count Account</th>
                                    <th class="text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div> <!-- end col -->
    </div> <!-- end row -->

</div>
@endsection


@section('footer')
@include('shared.footer')
@endsection

