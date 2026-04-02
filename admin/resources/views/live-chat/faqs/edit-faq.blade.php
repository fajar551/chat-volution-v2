@extends('layouts.app-chat.app')
@section('content')
<input type="hidden" id="id" value="{{ $id }}">
<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Edit new FAQ</h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="/faq"><i class="ri-arrow-left-line mr-2"></i> Back to faqs</a></li>
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
                            <label for="question">Pertanyaan<span class="text-danger">*</span></label>
                            <input type="text" required id="question" class="form-control" placeholder="Masukkan Pertanyaan Anda">
                        </div>
                        <div class="form-group">
                            <label for="answer">Jawaban<span class="text-danger">*</span></label>
                            <input type="text" required id="answer" class="form-control" placeholder="Masukkan Jawaban Anda">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-tangerin waves-effect waves-light">Save</button>
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