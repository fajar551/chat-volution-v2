@extends('layouts.crm.app-crm')
@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Notes</h4>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="d-md-flex mb-4">
        <div class="chat-leftsidebar">
            <div class="card-body border-bottom py-3 bg-light">
                <div class="search-box chat-search-box">
                    <div class="position-relative">
                        <input type="search" class="form-control search" placeholder="Search...">
                        <i class="ri-search-line search-icon"></i>
                    </div>
                </div>
            </div>
            <div class="tab-content pb-4">
                <div class="tab-pane show active" id="chat">
                    <div>
                        <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 450px;">
                            <div class="simplebar-wrapper" style="margin: 0px;">
                                <div class="simplebar-height-auto-observer-wrapper">
                                    <div class="simplebar-height-auto-observer"></div>
                                </div>
                                <div class="simplebar-mask">
                                    <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                        <div class="simplebar-content-wrapper"
                                            style="height: auto; overflow: hidden scroll;">
                                            <div class="simplebar-content" style="padding: 0px;">
                                                @for ($i = 0; $i <= 20; $i++) <li class="">
                                                    <a href="#">
                                                        <div class="col-12 col-md-12 col-md-12">
                                                            <div class="float-right font-size-11">30 April 2021</div>
                                                            <div class="flex-1 overflow-hidden">
                                                                <h5 class="text-truncate font-size-14 mb-1">Call</h5>
                                                                <p class="text-truncate mb-0">
                                                                    Charoen Pockpand, Tbk.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </a>
                                                    </li>
                                                    @endfor
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="simplebar-placeholder" style="width: auto; height: 490px;"></div>
                            </div>
                            <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                <div class="simplebar-scrollbar"
                                    style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                            </div>
                            <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                <div class="simplebar-scrollbar"
                                    style="height: 242px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-100 user-chat mt-4 mt-sm-0 ">
            <div class="p-3 px-lg-4 user-chat-border bg-light">
                <div class="row bg-light">
                    <div class="col-12 col-md-12 col-lg-12">
                        <div class="float-right">
                            <a href="javascript:void(0)" class="btn btn-success btn-sm">
                                <i class="fas fa-edit"></i> New Note
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-lg-2">
                <div class="chat-conversation p-3">
                    <div class="list-unstyled mb-0 pe-3" data-simplebar="init" style="max-height:400px">
                        <div class="col-12 col-md-12 col-lg-12 mb-2">
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" placeholder="Type note name">
                                <div class="input-group-append">
                                    <label class="input-group-text" for="inputGroupSelect02">
                                        <i class="fas fa-eye-slash"></i> Private
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-12 col-lg-12">
                            <textarea class="notes" rows="8"
                                placeholder="Type note description">Uji Coba tinymce</textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-lg-3 bg-light mt-2">
                <div class="row bg-light">
                    <div class="col-6 col-md-6 col-lg-6">
                        <div class="float-left">
                            <button class="btn btn-outline-primary m-1" title="View Version History">
                                <i class="fas fa-history"></i>
                            </button>
                            <button class="btn btn-outline-danger m-1" title="Delete note?">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-6 col-md-6 col-lg-6">
                        <div class="float-right">
                            <button class="btn btn-outline-info m-1" title="Share">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <button class="btn btn-outline-secondary m-1" title="Add To Records by contact">
                                <i class="fas fa-user-tag"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div> <!-- container-fluid -->
@endsection


@section('footer')
@include('shared.footer')
<script>
    /* toast with sweetalert2 */
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showClass: {
            popup: "animated lightSpeedIn",
        },
        hideClass: {
            popup: "animated lightSpeedOut",
        },
        onOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
    });

    var tk = localStorage.getItem('tk')
    var settings = {
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    var tiny = tinymce.init({
        selector: 'textarea.notes',
        height: "335",
        resize: false
    });

</script>
@endsection
