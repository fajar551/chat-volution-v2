@extends('layouts.app-agent-chat.app-agent-chatv2')
@section('content')
<div id="layout-wrapper">
    <div class="d-lg-flex">
        <div class="chat-leftsidebar">
            <div class="p-3 border-bottom">
                <div class="media">
                    <div class="align-self-center mr-3">
                        <img src="{{asset('assets/images/users/avatar/avatar-4.png')}}  " class="avatar-xs rounded-circle" alt="">
                    </div>
                    <div class="media-body">
                        <h5 class="font-size-15 mt-0 mb-1">Ricky Clark</h5>
                        <p class="text-muted mb-0"><i class="mdi mdi-circle text-success align-middle mr-1"></i> Active</p>
                    </div>

                    <div>
                        <div class="dropdown chat-noti-dropdown">
                            <button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="mdi mdi-dots-horizontal font-size-20"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-right" style="">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body border-bottom py-2">
                <div class="search-box chat-search-box">
                    <div class="position-relative">
                        <input type="search" class="form-control" placeholder="Search...">
                        <i class="ri-search-line search-icon"></i>
                    </div>
                </div>
            </div>

            <div class="chat-leftsidebar-nav">
                <ul class="nav nav-pills nav-justified">
                    <li class="nav-item">
                        <a href="#friend-chat" id="menu-fc" data-toggle="tab" style="min-height: 5px;" aria-expanded="true" class="nav-link pending active">
                            <i class="fas fa-address-book font-size-24" id="i-fc"></i>
                            <span id="counting-fc" class=""></span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#group-chat" id="menu-gc" data-toggle="tab" style="min-height: 5px;" aria-expanded="true" class="nav-link pendingTransfer">
                            <i class="fas fa-users font-size-24" id="i-gc"></i>
                            <span id="counting-gc"></span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="tab-content py-4">
                <div class="tab-pane active" id="friend-chat">
                    <div>
                        <h5 class="font-size-14 px-3 mb-3">Recent</h5>
                        <ul class="list-unstyled chat-list" data-simplebar="init">
                            <div class="simplebar-wrapper" style="margin: 0px;">
                                <div class="simplebar-height-auto-observer-wrapper">
                                    <div class="simplebar-height-auto-observer"></div>
                                </div>
                                <div class="simplebar-mask">
                                    <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                                        <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden;">
                                            <div class="simplebar-content" style="padding: 0px;">
                                                @for ($i = 1; $i < 101; $i++) <li>
                                                    <a href="#">
                                                        <div class="media">

                                                            <div class="user-img online align-self-center mr-3">
                                                                <img src="assets/images/users/avatar-2.jpg" class="rounded-circle avatar-xs" alt="">
                                                                <span class="user-status"></span>
                                                            </div>

                                                            <div class="media-body overflow-hidden">
                                                                <h5 class="text-truncate font-size-14 mb-1">{{$i}}</h5>
                                                                <p class="text-truncate mb-0">Hey! there I'm available</p>
                                                            </div>
                                                            <div class="font-size-11">04 min</div>
                                                        </div>
                                                    </a>
                                                    </li>
                                                    @endfor
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="simplebar-placeholder" style="width: 0px; height: 0px;"></div>
                            </div>
                            <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                            </div>
                            <div class="simplebar-track simplebar-vertical" style="visibility: hidden;">
                                <div class="simplebar-scrollbar" style="height: 238px; transform: translate3d(0px, 0px, 0px); display: none;"></div>
                            </div>
                        </ul>
                    </div>
                </div>

                <div class="tab-pane" id="group-chat">
                    <h5 class="font-size-14 px-3 mb-3">Group</h5>
                    <ul class="list-unstyled chat-list" data-simplebar="init">
                        <div class="simplebar-wrapper" style="margin: 0px;">
                            <div class="simplebar-height-auto-observer-wrapper">
                                <div class="simplebar-height-auto-observer"></div>
                            </div>
                            <div class="simplebar-mask">
                                <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                                    <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden;">
                                        <div class="simplebar-content" style="padding: 0px;">
                                            <li>
                                                <a href="#">
                                                    <div class="media align-items-center">
                                                        <div class="avatar-xs mr-3">
                                                            <span class="avatar-title rounded-circle bg-light text-body">
                                                                G
                                                            </span>
                                                        </div>

                                                        <div class="media-body">
                                                            <h5 class="font-size-14 mb-0">General</h5>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <div class="media align-items-center">
                                                        <div class="avatar-xs mr-3">
                                                            <span class="avatar-title rounded-circle bg-light text-body">
                                                                R
                                                            </span>
                                                        </div>

                                                        <div class="media-body">
                                                            <h5 class="font-size-14 mb-0">Reporting</h5>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <div class="media align-items-center">
                                                        <div class="avatar-xs mr-3">
                                                            <span class="avatar-title rounded-circle bg-light text-body">
                                                                M
                                                            </span>
                                                        </div>

                                                        <div class="media-body">
                                                            <h5 class="font-size-14 mb-0">Meeting</h5>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <div class="media align-items-center">
                                                        <div class="avatar-xs mr-3">
                                                            <span class="avatar-title rounded-circle bg-light text-body">
                                                                A
                                                            </span>
                                                        </div>

                                                        <div class="media-body">
                                                            <h5 class="font-size-14 mb-0">Project A</h5>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <div class="media align-items-center">
                                                        <div class="avatar-xs mr-3">
                                                            <span class="avatar-title rounded-circle bg-light text-body">
                                                                B
                                                            </span>
                                                        </div>

                                                        <div class="media-body">
                                                            <h5 class="font-size-14 mb-0">Project B</h5>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="simplebar-placeholder" style="width: 0px; height: 0px;"></div>
                        </div>
                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                            <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                        </div>
                        <div class="simplebar-track simplebar-vertical" style="visibility: hidden;">
                            <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>

        <div class="w-100 user-chat">
            <div class="p-3 px-lg-4 user-chat-border">
                <div class="row">
                    <div class="col-md-4 col-6">
                        <h5 class="font-size-15 mb-1 text-truncate">Frank Vickery</h5>
                        <p class="text-muted text-truncate mb-0"><i class="mdi mdi-circle text-success align-middle mr-1"></i> Active now</p>
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
                            <li class="list-inline-item m-0 d-none d-sm-inline-block">
                                <div class="dropdown">
                                    <button class="btn nav-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="mdi mdi-cog"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right" style="">
                                        <a class="dropdown-item" href="#">View Profile</a>
                                        <a class="dropdown-item" href="#">Clear chat</a>
                                        <a class="dropdown-item" href="#">Muted</a>
                                        <a class="dropdown-item" href="#">Delete</a>
                                    </div>
                                </div>
                            </li>

                            <li class="list-inline-item">
                                <div class="dropdown">
                                    <button class="btn nav-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="mdi mdi-dots-horizontal"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right" style="">
                                        <a class="dropdown-item" href="#">Action</a>
                                        <a class="dropdown-item" href="#">Another action</a>
                                        <a class="dropdown-item" href="#">Something else</a>
                                    </div>
                                </div>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>

            <div class="chat-conversation px-3">
                <ul class="list-unstyled mb-0 pr-3 py-5" data-simplebar="init">
                    <div class="simplebar-wrapper py-5" style="margin: -48px -16px -48px 0px;">
                        <div class="simplebar-height-auto-observer-wrapper">
                            <div class="simplebar-height-auto-observer"></div>
                        </div>
                        <div class="simplebar-mask">
                            <div class="simplebar-offset" style="right: -20px; bottom: 0px;">
                                <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden scroll; padding-right: 20px; padding-bottom: 0px;">
                                    <div class="simplebar-content" style="padding: 48px 16px 48px 0px;">
                                        <li>
                                            <div class="conversation-list">
                                                <div class="chat-avatar">
                                                    <img src="assets/images/users/avatar-2.jpg" alt="">
                                                </div>
                                                <div class="ctext-wrap">
                                                    <div class="conversation-name">Frank Vickery</div>
                                                    <div class="ctext-wrap-content">
                                                        <p class="mb-0">
                                                            Hey! I am available
                                                        </p>
                                                    </div>
                                                    <p class="chat-time mb-0"><i class="mdi mdi-clock-outline align-middle mr-1"></i> 12:09</p>
                                                </div>

                                            </div>
                                        </li>

                                        <li class="right">
                                            <div class="conversation-list">
                                                <div class="ctext-wrap">
                                                    <div class="conversation-name">Ricky Clark</div>
                                                    <div class="ctext-wrap-content">
                                                        <p class="mb-0">
                                                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae assumenda sunt quidem cupiditate reprehenderit? Aut dolore, fugiat similique quisquam maxime cumque ut esse consectetur repudiandae commodi! Praesentium earum ipsum harum?
                                                        </p>
                                                    </div>

                                                    <p class="chat-time mb-0"><i class="bx bx-time-five align-middle mr-1"></i> 10:02</p>
                                                </div>
                                            </div>
                                        </li>

                                        <li>
                                            <div class="chat-day-title">
                                                <span class="title">Today</span>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="conversation-list">
                                                <div class="chat-avatar">
                                                    <img src="assets/images/users/avatar-2.jpg" alt="">
                                                </div>
                                                <div class="ctext-wrap">
                                                    <div class="conversation-name">Frank Vickery</div>
                                                    <div class="ctext-wrap-content">
                                                        <p class="mb-0">
                                                            Hello!
                                                        </p>
                                                    </div>
                                                    <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:00</p>
                                                </div>

                                            </div>
                                        </li>

                                        <li class="right">
                                            <div class="conversation-list">
                                                <div class="ctext-wrap">
                                                    <div class="conversation-name">Ricky Clark</div>
                                                    <div class="ctext-wrap-content">
                                                        <p class="mb-0">
                                                            Hi, How are you? What about our next meeting?
                                                        </p>
                                                    </div>

                                                    <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:02</p>
                                                </div>
                                            </div>
                                        </li>

                                        <li>
                                            <div class="conversation-list">
                                                <div class="chat-avatar">
                                                    <img src="assets/images/users/avatar-2.jpg" alt="">
                                                </div>
                                                <div class="ctext-wrap">
                                                    <div class="conversation-name">Frank Vickery</div>
                                                    <div class="ctext-wrap-content">
                                                        <p class="mb-0">
                                                            Yeah everything is fine
                                                        </p>
                                                    </div>

                                                    <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:06</p>
                                                </div>

                                            </div>
                                        </li>

                                        <li>
                                            <div class="conversation-list">
                                                <div class="chat-avatar">
                                                    <img src="assets/images/users/avatar-2.jpg" alt="">
                                                </div>
                                                <div class="ctext-wrap">
                                                    <div class="conversation-name">Frank Vickery</div>
                                                    <div class="ctext-wrap-content">
                                                        <p class="mb-0">&amp; Next meeting tomorrow 10.00AM</p>
                                                    </div>
                                                    <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:06</p>
                                                </div>

                                            </div>
                                        </li>

                                        <li class="right">
                                            <div class="conversation-list">
                                                <div class="ctext-wrap">
                                                    <div class="conversation-name">Ricky Clark</div>
                                                    <div class="ctext-wrap-content">
                                                        <p class="mb-0">
                                                            Wow that's great
                                                        </p>
                                                    </div>

                                                    <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:07</p>
                                                </div>
                                            </div>
                                        </li>


                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="simplebar-placeholder" style="width: auto; height: 1020px;"></div>
                    </div>
                    <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                        <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none; width: 1805px;"></div>
                    </div>
                    <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                        <div class="simplebar-scrollbar" style="height: 460px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                    </div>
                </ul>
            </div>

            <div class="px-3 pb-2">
                <div class="chat-input-section">
                    <div class="row">
                        <div class="col">
                            <div class="position-relative">
                                <div contenteditable="true" class="type_msg chat-input" dir="auto" placeholder="Press enter for send message" id="input_chat"></div>
                            </div>
                        </div>
                        <div class="col-auto">
                            <button type="submit" class="btn btn-primary chat-send w-md waves-effect waves-light"><span class="d-none d-sm-inline-block mr-2">Send</span> <i class="mdi mdi-send"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div class="w-100 user-chat">
            <div class="p-3 px-lg-4 user-chat-border">
                <div class="row">
                    <div class="col-md-4 col-6">
                        <h5 class="font-size-15 mb-1 text-truncate">Frank Vickery</h5>
                        <p class="text-muted text-truncate mb-0"><i class="mdi mdi-circle text-success align-middle mr-1"></i> Active now</p>
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
                            <li class="list-inline-item m-0 d-none d-sm-inline-block">
                                <div class="dropdown">
                                    <button class="btn nav-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="mdi mdi-cog"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right" style="">
                                        <a class="dropdown-item" href="#">View Profile</a>
                                        <a class="dropdown-item" href="#">Clear chat</a>
                                        <a class="dropdown-item" href="#">Muted</a>
                                        <a class="dropdown-item" href="#">Delete</a>
                                    </div>
                                </div>
                            </li>

                            <li class="list-inline-item">
                                <div class="dropdown">
                                    <button class="btn nav-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="mdi mdi-dots-horizontal"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right" style="">
                                        <a class="dropdown-item" href="#">Action</a>
                                        <a class="dropdown-item" href="#">Another action</a>
                                        <a class="dropdown-item" href="#">Something else</a>
                                    </div>
                                </div>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>

            <div class="px-lg-2">
                <div class="chat-conversation p-3">
                    <ul class="list-unstyled mb-0 pr-3" data-simplebar="init">
                        <div class="simplebar-wrapper" style="margin: 0px -16px 0px 0px;">
                            <div class="simplebar-height-auto-observer-wrapper">
                                <div class="simplebar-height-auto-observer"></div>
                            </div>
                            <div class="simplebar-mask">
                                <div class="simplebar-offset" style="right: -16.8px; bottom: 0px;">
                                    <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden scroll;">
                                        <div class="simplebar-content" style="padding: 0px 16px 0px 0px;">
                                            <li>
                                                <div class="conversation-list">
                                                    <div class="chat-avatar">
                                                        <img src="assets/images/users/avatar-2.jpg" alt="">
                                                    </div>
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Frank Vickery</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Hey! I am available
                                                            </p>
                                                        </div>
                                                        <p class="chat-time mb-0"><i class="mdi mdi-clock-outline align-middle mr-1"></i> 12:09</p>
                                                    </div>

                                                </div>
                                            </li>

                                            <li class="right">
                                                <div class="conversation-list">
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Ricky Clark</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae assumenda sunt quidem cupiditate reprehenderit? Aut dolore, fugiat similique quisquam maxime cumque ut esse consectetur repudiandae commodi! Praesentium earum ipsum harum?
                                                            </p>
                                                        </div>

                                                        <p class="chat-time mb-0"><i class="bx bx-time-five align-middle mr-1"></i> 10:02</p>
                                                    </div>
                                                </div>
                                            </li>

                                            <li>
                                                <div class="chat-day-title">
                                                    <span class="title">Today</span>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="conversation-list">
                                                    <div class="chat-avatar">
                                                        <img src="assets/images/users/avatar-2.jpg" alt="">
                                                    </div>
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Frank Vickery</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Hello!
                                                            </p>
                                                        </div>
                                                        <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:00</p>
                                                    </div>

                                                </div>
                                            </li>

                                            <li class="right">
                                                <div class="conversation-list">
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Ricky Clark</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Hi, How are you? What about our next meeting?
                                                            </p>
                                                        </div>

                                                        <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:02</p>
                                                    </div>
                                                </div>
                                            </li>

                                            <li>
                                                <div class="conversation-list">
                                                    <div class="chat-avatar">
                                                        <img src="assets/images/users/avatar-2.jpg" alt="">
                                                    </div>
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Frank Vickery</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Yeah everything is fine
                                                            </p>
                                                        </div>

                                                        <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:06</p>
                                                    </div>

                                                </div>
                                            </li>

                                            <li>
                                                <div class="conversation-list">
                                                    <div class="chat-avatar">
                                                        <img src="assets/images/users/avatar-2.jpg" alt="">
                                                    </div>
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Frank Vickery</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">&amp; Next meeting tomorrow 10.00AM</p>
                                                        </div>
                                                        <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:06</p>
                                                    </div>

                                                </div>
                                            </li>

                                            <li class="right">
                                                <div class="conversation-list">
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Ricky Clark</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Wow that's great
                                                            </p>
                                                        </div>

                                                        <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:07</p>
                                                    </div>
                                                </div>
                                            </li>


                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="simplebar-placeholder" style="width: auto; height: 886px;"></div>
                        </div>
                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                            <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                        </div>
                        <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                            <div class="simplebar-scrollbar" style="height: 228px; transform: translate3d(0px, 221px, 0px); display: block;"></div>
                        </div>
                    </ul>
                </div>

            </div>
            <div class="px-lg-3">
                <div class="p-3 chat-input-section">
                    <div class="row">
                        <div class="col">
                            <div class="position-relative">
                                <input type="text" class="form-control chat-input" placeholder="Enter Message...">

                            </div>
                        </div>
                        <div class="col-auto">
                            <button type="submit" class="btn btn-primary chat-send w-md waves-effect waves-light"><span class="d-none d-sm-inline-block mr-2">Send</span> <i class="mdi mdi-send"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div> -->
    </div>
</div>
@endsection