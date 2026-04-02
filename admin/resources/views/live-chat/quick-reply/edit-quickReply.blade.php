@extends('layouts.app-chat.app')
@section('content')
<style>
    textarea {
        resize: none;
    }

    .input-info-wrapper {
        color: rgba(25, 25, 25, 0.8);
        line-height: 21px;
        width: 400px;
    }
</style>
<input type="hidden" id="type" value="{{ $type }}">
<input type="hidden" id="id" value="{{ $id }}">

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0" id="headLable"></h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item">
                            <a id="url-back" href="javascript: void(0);">
                                <i class="ri-arrow-left-line mr-2"></i> <span id="text-back"></span>
                            </a>
                        </li>
                    </ol>
                </div>
            </div>
            <p id="txtLable"></p>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label for="shortcut">Shortcut <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <div class="input-group-text">/</div>
                                </div>
                                <input type="text" data-parsley-minlength="2" data-parsley-required class="form-control" id="shortcut" placeholder="Type Shortcut">
                            </div>
                            <p class="input-info-wrapper font-size-16 mt-1">This is the message that will appear after you select a specific shortcut.<b class="text-bold"> Only alphanumberic and underscore are allowed. </b><br>Example: "Domain3332", then it will be "/Domain3332" .</p>
                        </div>
                        <div class="form-group">
                            <label for="message">Message <span class="text-danger">*</span></label>
                            <textarea class="form-control" data-parsley-minlength="10" data-parsley-required name="message" rows="7" id="message" placeholder="Type Message"></textarea>
                            <p class="mt-1 input-info-wrapper font-size-16">This is the message that will appear after you select a specific shortcut. <b class="text-bold">No blank space are allowed at the beginning and end of a message.</b></p>
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