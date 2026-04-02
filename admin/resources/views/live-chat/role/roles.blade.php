@extends('layouts.app-chat.app')
@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Roles</h4>
                <div class="page-title-right">
                    <a href="/add-role" class="btn btn-success waves-effect waves-light font-weight-bold">
                        <i class="ri-add-line align-middle mr-2"></i> Add roles
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="example" class="table table-bordered dt-responsive nowrap"
                            style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                            <thead class="thead-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Name</th>
                                    <th>Permission</th>
                                    <th>Status</th>
                                    {{-- <th style="width: 15%;">Action</th> --}}
                                </tr>
                            </thead>

                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection


@section('footer')
@include('shared.footer')
@endsection
