@extends('layouts.app-chat.app')
@section('content')
    <div class="container-fluid">
        <input type="hidden" id="label" value="{{ $label }}">
        <input type="hidden" id="title" value="{{ $title }}">
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

        <div class="row" style="min-height:72vh">
            <div class="col-12">
                <div class="card">
                    <form id="btn-save" data-parsley-validate data-parsley-errors-messages-disabled>
                        <div class="card-body">
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" id="name" data-parsley-minlength="2" data-parsley-required
                                    class="form-control" placeholder="Masukkan nama">
                                <span class="text-danger" id="err_name"></span>
                            </div>
                            <div class="form-group float-right mb-2">
                                <button type="submit" class="btn btn-tangerin waves-effect waves-light">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('footer')
    @include('shared.footer')
@endsection

<script>
    var tk = localStorage.getItem("tk");
    var settings = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: "Bearer " + tk,
        },
    };
    
</script>