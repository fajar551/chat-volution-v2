@extends('layouts.app-chat.app')
@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 mb-3">
                <div class="page-title-box d-flex align-items-center justify-content-between" style="padding-bottom: 5px;">
                    <h4 class="mb-0 mr-4 align-self-center">Secret Keys</h4>
                    <a href="/add-key" style="color:black;">+ Add Keys</a>
                </div>
            </div>
        </div>
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
@endsection

@section('footer')
    @include('shared.footer')
@endsection
