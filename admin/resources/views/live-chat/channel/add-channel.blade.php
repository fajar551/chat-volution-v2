@extends('layouts.app-chat.app')
@section('content')

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box align-items-center justify-content-between">
                <h4 class="mb-0">Add new channel</h4>
                <p>Add new channel by inputting</p>
            </div>
        </div>
    </div>

    <div class="row justify-content-center">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" data-parsley-required class="form-control" placeholder="Type name">
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea type="text" id="description" data-parsley-required class="form-control fixed-area" placeholder="Type description"></textarea>
                        </div>

                        <div class="form-group float-right">
                            <button type="submit" class="btn btn-tangerin waves-effect">Submit</button>
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