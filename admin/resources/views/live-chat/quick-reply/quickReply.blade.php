@extends('layouts.app-chat.app')
@section('content')

<style>
    .more {
        background: lightblue;
        color: navy;
        font-size: 13px;
        padding: 3px;
        cursor: pointer;
    }
</style>
<input type="hidden" id="type" value="{{ $type }}">
<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <div class="page-title-left col-md-6">
                    <h4 class="mb-0" id="headLable"></h4>
                    <p>Speed up your workflow by adding quick replies for frequently sent messages. To send quick replies, simply type “/“ in inbox and select the shortcut from the list.</p>
                </div>
                <div class="page-title-right float-right mr-3">
                    <a id="redirectPage" class="btn btn-tangerin waves-effect waves-light font-weight-bold font-size-14">
                        <i class="fas fa-plus mr-2"></i> Add Quick Reply
                    </a>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->
    <div class="col-12 col-md-12 col-lg-12">
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table id="example" class="table table-bordered dt-responsive nowrap" style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                        <thead class="thead-dark">
                            <tr>
                                <th>Message</th>
                                <th>Shortcut</th>
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

</div> <!-- container-fluid -->
@endsection


@section('footer')
@include('shared.footer')
@endsection