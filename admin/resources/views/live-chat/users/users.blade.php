@extends('layouts.app-chat.app')
@section('content')
<input type="hidden" id="type" value="{{ $label }}">
<input type="hidden" id="title" value="{{ $title }}">
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0" id="menu-header"></h4>
                <div class="page-title-right">
                    <a class="btn btn-tangerin waves-effect waves-light font-weight-bold font-size-14 addUrl">
                        <i class="fas fa-plus mr-2"></i> <span class="lbla-btn"></span>
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
                                <tr class="header-tbl"></tr>
                            </thead>

                            <tbody>

                            </tbody>
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