@extends('layouts.crm.app-crm')

@section('content')
<input type="hidden" value="{{ $menu }}" id="type">
<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Accounts</h4>
                <div class="page-title-right">
                    <a href="javascript:void(0)" onclick="formAdd()" class="btn btn-success waves-effect waves-light font-weight-bold">
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
                        <table id="example" class="table table-bordered dt-responsive nowrap" style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                            <thead class="thead-dark">
                                <tr>
                                    <th>Account Name</th>
                                    <th>Phone</th>
                                    <th style="width: 15%;">Action</th>
                                </tr>
                            </thead>

                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div> <!-- end col -->
    </div> <!-- end row -->

    @include('crm.accounts.add-account')
    @include('crm.accounts.edit-account')

</div> <!-- container-fluid -->
@endsection


@section('footer')
@include('shared.footer')

@endsection

