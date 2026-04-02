@extends('layouts.crm.app-crm')
@section('content')
    <div class="container-fluid">

        <!-- start page title -->
        <div class="row">
            <div class="col-12">
                <div class="page-title-box d-flex align-items-center justify-content-between">
                    <h4 class="mb-0">Inbox</h4>
                </div>
            </div>
        </div>
        <!-- end page title -->

        <div class="d-lg-flex mb-4">
            <div class="chat-leftsidebar">
                <div class="p-3 border-bottom">
                    <div class="media">
                        <div class="align-self-center mr-3">
                            <img src="/assets/images/users/profile_default.jpg" class="avatar-xs rounded-circle" alt="">
                        </div>
                        <div class="media-body">
                            <h5 class="font-size-15 mt-0 mb-1">Agent ID <span id="display_agent_name"> </span></h5>
                            <p class="text-muted mb-0"><i class="mdi mdi-circle text-success align-middle mr-1"></i> Online</p>
                        </div>

                        <div>
                            <div class="dropdown chat-noti-dropdown">
                                <button class="btn">
                                    <i class="ri-volume-down-line font-size-20 mr-2"></i>
                                </button>
                                <button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="mdi mdi-dots-horizontal font-size-20"></i>
                                </button>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" href="#"><i class="mdi mdi-circle text-success align-middle mr-1"></i> Online</a>
                                    <a class="dropdown-item" href="#"><i class="mdi mdi-circle text-warning align-middle mr-1"></i> Away</a>
                                    <a class="dropdown-item" href="#"><i class="mdi mdi-circle text-danger align-middle mr-1"></i> Offline</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body border-bottom py-2">
                    <div class="search-box chat-search-box">
                        <div class="position-relative">
                            <input type="text" class="form-control" placeholder="Search...">
                            <i class="ri-search-line search-icon"></i>
                        </div>
                    </div>
                </div>

                <div class="chat-leftsidebar-nav">
                    <ul class="nav nav-pills nav-justified">
                        <li class="nav-item">
                            <a href="#chat" data-toggle="tab" aria-expanded="true" class="nav-link active">
                                <i class="ri-user-line font-size-20"></i>
                                <span class="d-none d-sm-block">Me</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#group" data-toggle="tab" aria-expanded="false" class="nav-link">
                                <i class="ri-group-line font-size-20"></i>
                                <span class="d-none d-sm-block">Others</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#contact" data-toggle="tab" aria-expanded="false" class="nav-link">
                                <i class="ri-checkbox-circle-line font-size-20"></i>
                                <span class="d-none d-sm-block">Resolved</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#all-msg" data-toggle="tab" aria-expanded="false" class="nav-link">
                                <i class="ri-checkbox-circle-line font-size-20"></i>
                                <span class="d-none d-sm-block">All Message</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="tab-content py-4">
                    <div class="tab-pane show active" id="chat">
                        <div>
                            <div class="row pl-3 pr-3">
                                <div class="col-md-5">
                                    <div class="dropdown mt-2 mt-sm-0">
                                        <a href="#" class="btn btn-light btn-block dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Unassigned <span class="badge badge-danger ml-2 mr-2">1</span><i class="mdi mdi-chevron-down"></i>
                                        </a>

                                        <div class="dropdown-menu" style="">
                                            <a class="dropdown-item" href="#">Unassigned</a>
                                            <a class="dropdown-item" href="#">Mine</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <div class="dropdown mt-2 mt-sm-0">
                                        <a href="#" class="btn btn-light btn-block dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Sort bt created time <i class="mdi mdi-chevron-down"></i>
                                        </a>

                                        <div class="dropdown-menu" style="">
                                            <a class="dropdown-item" href="#">Created time</a>
                                            <a class="dropdown-item" href="#">Last message</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="form-group mt-2 mt-sm-0">
                                        <button type="button" class="btn btn-light btn-block waves-effect"><span class="ri-sound-module-line"></span></button>
                                    </div>
                                </div>
                            </div>
                            <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 345px;"><div class="simplebar-wrapper" style="margin: 0px;"><div class="simplebar-height-auto-observer-wrapper"><div class="simplebar-height-auto-observer"></div></div><div class="simplebar-mask"><div class="simplebar-offset" style="right: 0px; bottom: 0px;"><div class="simplebar-content-wrapper" style="height: auto; overflow: hidden;"><div class="simplebar-content" style="padding: 0px;" id="list_clients">

                            </div></div></div></div><div class="simplebar-placeholder" style="width: auto; height: 273px;"></div></div><div class="simplebar-track simplebar-horizontal" style="visibility: hidden;"><div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div></div><div class="simplebar-track simplebar-vertical" style="visibility: hidden;"><div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div></div></ul>
                        </div>
                    </div>

                    <div class="tab-pane" id="group">
                        <div class="text-center">
                            <div class="p-4">
                                <p>It seems like there aren't any other ongoing cases at this very moment.</p>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane" id="contact">
                        <div class="text-center">
                            <div class="p-4">
                                <p>It seems like there aren't any other ongoing cases at this very moment.</p>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane" id="all-msg">
                        <div>
                            <ul class="list-unstyled chat-list" data-simplebar style="max-height: 345px;">
                                <li>
                                    <a href="#">
                                        <div class="media">

                                            <div class="user-img online align-self-center mr-3">
                                                <img src="/assets/images/users/avatar-2.jpg" class="rounded-circle avatar-xs" alt="">
                                                <span class="user-status"></span>
                                            </div>

                                            <div class="media-body overflow-hidden">
                                                <h5 class="text-truncate font-size-14 mb-1"><span ></span> - Pending</h5>
                                                <p class="text-truncate mb-0">General (#04971E1815)</p>
                                                <p class="text-truncate mb-0"> dsadasdasdas </p>
                                                <button type="button" class="btn btn-warning waves-effect waves-light">
                                                    <i class="ri-external-link-line align-middle mr-2"></i> Assign Me
                                                </button>
                                            </div>
                                            <div class="font-size-11">09:10</div>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-100 user-chat mt-4 mt-sm-0" id="display_chat" style="display:none">
                <div class="p-3 px-lg-4 user-chat-border">
                    <div class="row">
                        <div class="col-md-4 col-6">
                            <h5 class="font-size-15 mb-1 text-truncate" id="current_client_name">Agus Mardheka</h5>
                            <p class="text-muted text-truncate mb-0" style="margin-bottom: 2px !important;">General (#04971E1815)</p>
                        </div>
                        <div class="col-md-8 col-6">
                            <ul class="list-inline user-chat-nav text-right mb-0">
                                <li class="list-inline-item d-inline-block d-sm-none">
                                    <div class="dropdown">
                                        <button class="btn nav-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i class="mdi mdi-magnify"></i>
                                        </button>
                                        <div class="dropdown-menu dropdown-menu-right dropdown-menu-md">
                                            <form class="p-2">
                                                <div class="search-box">
                                                    <div class="position-relative">
                                                        <input type="text" class="form-control rounded" placeholder="Search...">
                                                        <i class="mdi mdi-magnify search-icon"></i>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </li>
                                <li class="d-none d-sm-inline-block">
                                    <div class="search-box mr-2">
                                        <div class="position-relative">
                                            <input type="text" class="form-control" placeholder="Search...">
                                            <i class="mdi mdi-magnify search-icon"></i>
                                        </div>
                                    </div>
                                </li>
                                <li class="list-inline-item">
                                    <div class="dropdown">
                                        <button class="btn nav-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i class="mdi mdi-dots-horizontal"></i>
                                        </button>
                                        <div class="dropdown-menu dropdown-menu-right">
                                            <a class="dropdown-item" href="#">Profile</a>
                                            <a class="dropdown-item" href="#" onClick="closeChat()">Close Chat</a>
                                        </div>
                                    </div>
                                </li>

                            </ul>
                        </div>
                    </div>
                </div>

                <div class="px-lg-2">
                    <div class="chat-conversation p-3">
                        <ul class="list-unstyled mb-0 pr-3" data-simplebar="init" style="max-height: 450px;"><div class="simplebar-wrapper" style="margin: 0px -16px 0px 0px;"><div class="simplebar-height-auto-observer-wrapper"><div class="simplebar-height-auto-observer"></div></div><div class="simplebar-mask"><div class="simplebar-offset" style="right: 0px; bottom: 0px;"><div class="simplebar-content-wrapper" style="height: auto; overflow: hidden;"><div class="simplebar-content" style="padding: 0px 16px 0px 0px;min-height:300px;overflow-y:auto" id="private_chat">

                        </div></div></div></div><div class="simplebar-placeholder" style="width: auto; height: 222px;"></div></div><div class="simplebar-track simplebar-horizontal" style="visibility: hidden;"><div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div></div><div class="simplebar-track simplebar-vertical" style="visibility: hidden;"><div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div></div></ul>
                    </div>

                </div>
                <div class="px-lg-3">
                    <div class="p-3 chat-input-section">
                        <div class="row">
                            <div class="col">
                                <div class="position-relative">
                                    <input type="text" class="form-control chat-input" id="input_chat" placeholder="Enter Message...">

                                </div>
                            </div>
                            <div class="col-auto">
                                <button type="submit" onclick="sendChatButton()" class="btn btn-primary chat-send w-md waves-effect waves-light"><span class="d-none d-sm-inline-block mr-2">Send</span> <i class="mdi mdi-send"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- end row -->

        <div class="d-lg-flex mb-4">
            <div class="chat-leftsidebar p-3">
                <ul id ="list-online-agent">

                </ul>
            </div>
        </div>
    </div>


@endsection

@section('footer')
    @include('shared.footer')
    <script src="/js/dashboard.js"></script>
    <script>
        var vm = new Vue({
        data: {
            tabs_chats : {
                active_tabs: 0,
                me_chats : [],
                others_chat: [],
                resolved_chats: [],
                all_chats: [],
            }

        },
        watch: {
            'tabs_chats.active_tabs': function (val) {
                console.log('waa')
            },
            'tabs_chats.all_chats': function (val) {
                $('#all-msg .simplebar-content').empty()
                val.forEach(element => {

                    $('#all-msg .simplebar-content').append(`<li>
                                    <a href="#">
                                        <div class="media">

                                            <div class="user-img online align-self-center mr-3">
                                                <img src="/assets/images/users/avatar-2.jpg" class="rounded-circle avatar-xs" alt="">
                                                <span class="user-status"></span>
                                            </div>

                                            <div class="media-body overflow-hidden">
                                                <h5 class="text-truncate font-size-14 mb-1"><span></span> - Pending</h5>
                                                <p class="text-truncate mb-0">General (#04971E1815)</p>
                                                <p class="text-truncate mb-0"> dsadasdasdas </p>
                                                <button type="button" class="btn btn-warning waves-effect waves-light">
                                                    <i class="ri-external-link-line align-middle mr-2"></i> Assign Me
                                                </button>
                                            </div>
                                            <div class="font-size-11">09:10</div>
                                        </div>
                                    </a>
                                </li>`)
                });
                console.log('ada')
            }
        }
        })


    </script>
@endsection
