@extends('layouts.crm.app-crm')
@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Tasks</h4>
                <div class="page-title-right smhide-style">
                    <a href="javascript:void(0)" onclick="formAdd()"
                        class="btn btn-success waves-effect waves-light font-weight-bold smhide-style">
                        <i class="fas fa-pencil-alt"></i> New Task
                    </a>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="d-lg-flex mb-4 h-100">
        <div class="chat-leftsidebar">
            <div class="card-body border-bottom py-3">
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
                        <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 550px;">
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

        <div class="w-100 user-chat mt-4 mt-sm-0">
            <div class="p-3 px-lg-4 user-chat-border">
                <div class="row">
                    <div class="col-12 col-md-12 col-lg-8">
                        <h5 class="font-size-15 mb-1 text-truncate">Call</h5>
                        <p class="text-muted text-truncate mb-0">
                            <i class="fas fa-id-card text-dark"></i>
                            <a href="#" class="text-url-dark">Udin</a>
                        </p>
                        <p class="text-muted text-truncate mb-0">
                            <i class="fas fa-handshake text-dark"></i>
                            <a href="#" class="text-url-dark">Charoen Pockpand. Tbk</a>
                        </p>
                    </div>
                    <div class="col-12 col-md-12 col-lg-4">
                        <div class="btn-group btn-group-toggle mt-2 float-sm-right">
                            <a href="javascript:void(0);" onclick="formEdit()" class="btn btn-dark"
                                title="Edit">Edit</a>
                            <a href="javascript:void(0);" class="btn btn-dark" title="Delete">Delete</a>
                            <a href="javascript:void(0);" class="btn btn-dark" title="Comment">Comments</a>
                        </div>
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2 lghide-style">
                        <a href="javascript:void(0)" onclick="formAdd()"
                            class="btn btn-success waves-effect waves-light font-weight-bold btn-block lghide-style">
                            <i class="fas fa-pencil-alt"></i> New Task
                        </a>
                    </div>
                    <div class="col-12 col-md-12 col-lg-12 mt-2">
                        <button class="btn btn-primary btn-block">
                            <i class="fas fa-check"></i>
                            Mark Compelete
                        </button>
                    </div>
                </div>
            </div>

            <div class="px-lg-2">
                <div class="chat-conversation p-3">
                    <div class="list-unstyled mb-0 pe-3" data-simplebar="init" style="max-height:450px">
                        <div class="simplebar-wrapper" style="margin: 0px -16px 0px 0px;">
                            <div class="simplebar-height-auto-observer-wrapper">
                                <div class="simplebar-height-auto-observer"></div>
                            </div>
                            <div class="simplebar-mask">
                                <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                    <div class="simplebar-content-wrapper"
                                        style="height: auto; overflow: hidden scroll;">
                                        <div class="simplebar-content" style="padding: 0px 16px 0px 0px;">
                                            <div class="accordion" id="task#taskInformation">
                                                <div class="card">
                                                    <div class="card-header bg-dark" id="headingTwo">
                                                        <h2 class="mb-0">
                                                            <button class="btn btn-block text-left  text-white"
                                                                type="button" data-toggle="collapse"
                                                                data-target="#taskInformation" aria-expanded="false"
                                                                aria-controls="taskInformation">
                                                                Task Information
                                                            </button>
                                                        </h2>
                                                    </div>
                                                    <div id="taskInformation" class="collapse"
                                                        aria-labelledby="taskInformation"
                                                        data-parent="#taskInformation">
                                                        <div class="card-body">
                                                            <div class="row">
                                                                <div class="col-12 col-md-12 col-lg-12">
                                                                    <div class="col-12 col-md-12 col-lg-6 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Subject
                                                                        </h6>
                                                                        <span>Call</span>
                                                                    </div>
                                                                    <div class="col-12 col-md-12 col-lg-6 mb-2">
                                                                    </div>
                                                                </div>
                                                                <div class="col-12 col-md-6 col-lg-6">
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Assigned To
                                                                        </h6>
                                                                        <span>Faiz adie</span>
                                                                    </div>
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Name
                                                                        </h6>
                                                                        <span>Udin bahrudin</span>
                                                                    </div>
                                                                </div>
                                                                <div class="col-12 col-md-6 col-lg-6">
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Due Date
                                                                        </h6>
                                                                        <span>30 April 2001</span>
                                                                    </div>
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Related To
                                                                        </h6>
                                                                        <span>Chroen Pockpand. Tbk</span>
                                                                    </div>
                                                                </div>
                                                                <div class="col-12 col-md-12 col-lg-12">
                                                                    <div class="col-12 col-md-12 col-lg-12">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Comments
                                                                        </h6>
                                                                        <span>
                                                                            Lorem ipsum dolor sit amet consectetur
                                                                            adipisicing elit. Exercitationem perferendis
                                                                            cum
                                                                            sequi non! Doloremque velit, vero quidem
                                                                            odit
                                                                            reprehenderit repellat, mollitia aut quia
                                                                            exercitationem sed, unde reiciendis numquam
                                                                            modi
                                                                            nisi.
                                                                            Lorem ipsum dolor sit amet consectetur
                                                                            adipisicing elit. Exercitationem perferendis
                                                                            cum
                                                                            sequi non! Doloremque velit, vero quidem
                                                                            odit
                                                                            reprehenderit repellat, mollitia aut quia
                                                                            exercitationem sed, unde reiciendis numquam
                                                                            modi
                                                                            nisi.
                                                                            Lorem ipsum dolor sit amet consectetur
                                                                            adipisicing elit. Exercitationem perferendis
                                                                            cum
                                                                            sequi non! Doloremque velit, vero quidem
                                                                            odit
                                                                            reprehenderit repellat, mollitia aut quia
                                                                            exercitationem sed, unde reiciendis numquam
                                                                            modi
                                                                            nisi.
                                                                            Lorem ipsum dolor sit amet consectetur
                                                                            adipisicing elit. Exercitationem perferendis
                                                                            cum
                                                                            sequi non! Doloremque velit, vero quidem
                                                                            odit
                                                                            reprehenderit repellat, mollitia aut quia
                                                                            exercitationem sed, unde reiciendis numquam
                                                                            modi
                                                                            nisi.
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="accordion" id="task#additional-info">
                                                <div class="card">
                                                    <div class="card-header bg-dark" id="headingTwo">
                                                        <h2 class="mb-0">
                                                            <button class="btn btn-block text-left  text-white"
                                                                type="button" data-toggle="collapse"
                                                                data-target="#additional-info" aria-expanded="false"
                                                                aria-controls="additional-info">
                                                                Additional Information
                                                            </button>
                                                        </h2>
                                                    </div>
                                                    <div id="additional-info" class="collapse"
                                                        aria-labelledby="additional-info"
                                                        data-parent="#additional-info">
                                                        <div class="card-body">
                                                            <div class="row">
                                                                <div class="col-12 col-md-6 col-lg-6">
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Priority
                                                                        </h6>
                                                                        <span>Normal</span>
                                                                    </div>
                                                                </div>
                                                                <div class="col-12 col-md-6 col-lg-6">
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Status
                                                                        </h6>
                                                                        <span>Completed</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="accordion" id="task#other-information">
                                                <div class="card">
                                                    <div class="card-header bg-dark" id="headingTwo">
                                                        <h2 class="mb-0">
                                                            <button class="btn btn-block text-left  text-white"
                                                                type="button" data-toggle="collapse"
                                                                data-target="#other-information" aria-expanded="false"
                                                                aria-controls="other-information">
                                                                Other Information
                                                            </button>
                                                        </h2>
                                                    </div>
                                                    <div id="other-information" class="collapse"
                                                        aria-labelledby="other-information"
                                                        data-parent="#other-information">
                                                        <div class="card-body">
                                                            <div class="row">
                                                                <div class="col-12 col-md-6 col-lg-6">
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Reminder Set
                                                                        </h6>
                                                                        <span>27 November, 2021 at 11:55 pm</span>
                                                                    </div>
                                                                </div>
                                                                <div class="col-12 col-md-6 col-lg-6">
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Create
                                                                            Recurring Series of Tasks
                                                                        </h6>
                                                                        <span>No</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="accordion" id="task#system-information">
                                                <div class="card">
                                                    <div class="card-header bg-dark" id="headingTwo">
                                                        <h2 class="mb-0">
                                                            <button class="btn btn-block text-left  text-white"
                                                                type="button" data-toggle="collapse"
                                                                data-target="#system-information" aria-expanded="false"
                                                                aria-controls="system-information">
                                                                System Information
                                                            </button>
                                                        </h2>
                                                    </div>
                                                    <div id="system-information" class="collapse"
                                                        aria-labelledby="system-information"
                                                        data-parent="#system-information">
                                                        <div class="card-body">
                                                            <div class="row">
                                                                <div class="col-12 col-md-6 col-lg-6">
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Created By
                                                                        </h6>
                                                                        <span>
                                                                            <a class="text-url-dark">faiz
                                                                                adie</a>, 11/14/2021, 11:14 PM
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div class="col-12 col-md-6 col-lg-6">
                                                                    <div class="col-12 col-md-12 col-lg-12 mb-2">
                                                                        <h6 class="label label-inverse">
                                                                            <i class="fas fa-circle"></i> Last Modified
                                                                            By
                                                                        </h6>
                                                                        <span>
                                                                            <a class="text-url-dark">faiz
                                                                                adie</a>, 11/14/2021, 11:14 PM
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="simplebar-placeholder" style="width: auto; height: 877px;"></div>
                        </div>
                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                            <div class="simplebar-scrollbar"
                                style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                        </div>
                        <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                            <div class="simplebar-scrollbar"
                                style="height: 230px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('crm.tasks.add-task')

</div> <!-- container-fluid -->
@endsection


@section('footer')
@include('shared.footer')
@endsection
