@extends('layouts.app-chat.app')
@section('content')
<input type="hidden" id="meta" value="{{ $meta }}">
<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12 ml-1">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0" id="headerLbl">Label Menu</h4>
            </div>
            <p id="descLbl">Description</p>
        </div>
    </div>
    <!-- end page title -->

    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body p-4">
                        <div class="form-group float-right">
                            <div class="custom-control custom-switch custom-switch-md ">
                                <input type="checkbox" class="custom-control-input" id="customSwitch3" onchange="changeSwitch()">
                                <label class="custom-control-label" for="customSwitch3" id="swipeLbl"></label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label form="message">Message</label>
                            <textarea class="form-control msg" disabled style="cursor: no-drop" name="message" rows="7" id="message" placeholder="Type Automatic Message"></textarea>
                            <p class="mt-1 input-info-wrapper font-size-16" id="descMsg">Something desc</p>
                        </div>
                        <div class="form-group float-right mb-2">
                            <button type="submit" disabled style="cursor:no-drop" class="btn btn-tangerin waves-effect waves-light btn-save">Save</button>
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