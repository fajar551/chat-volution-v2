@extends('layouts.app-chat.app')
@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">FAQ (Frequently Asked Questions)</h4>
                <div class="page-title-right">
                    <a href="add-faq" class="btn btn-tangerin waves-effect waves-light font-weight-bold font-size-14">
                        <i class="fas fa-plus mr-2"></i> Add FAQ
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
                        <table id="faq_list" class="table table-bordered dt-responsive nowrap" style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                            <thead class="thead-dark">
                                <tr>
                                    <th>Pertanyaan</th>
                                    <th>Jawaban</th>
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