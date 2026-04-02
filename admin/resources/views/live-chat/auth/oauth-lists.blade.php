@extends('layouts.app-chat.app')
@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <div class="float-left">
                    <h4 class="mb-0" id="menu-label">Api Keys</h4>
                    <p id="description-label">
                        Create your own API Keys and gain access to Qchat APIs to send messages.
                    </p>
                </div>
                <div class="float-right">
                    <button class="btn btn-tangerin waves-effect waves-light" onclick="addToken()">
                        <i class="ri-add-line align-middle "></i> Add Token
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="example" class="table table-bordered dt-responsive">
                            <thead class="thead-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Domain</th>
                                    <th class="text-center">API Key</th>
                                    <th class="text-center">Action</th>
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
@include('live-chat.auth.oauth-copy')
@include('live-chat.auth.oauth-add')

@endsection

@section('footer')
@include('shared.footer')
@endsection