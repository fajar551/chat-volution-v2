@extends('layouts.app-chat.app')
@section('content')
<div class="container-fluid">
    <input type="hidden" id="label" value="{{ $label }}">
    <input type="hidden" id="title" value="{{ $title }}">
    <input type="hidden" id="id" value="{{ $id }}">

    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0" id="menu-label"></h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item">
                            <a id="backUrl"></a>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <form id="btn-save">
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="name" class="form-control" name="name">
                        </div>
                        <div class="form-group">
                            <label>Client_id</label>
                            <input id="client_id" class="form-control" name="client_id">
                        </div>
                        <div class="form-group">
                            <label>Secret</label>
                            <input type="text" id="secret" class="form-control" name="secret">
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
