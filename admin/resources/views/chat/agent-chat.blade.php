@extends('layouts.app-agent-chat.app-agent-chat')
@section('content')
    <div class="d-lg-flex">
        <div class="chat-leftsidebar" id="content-user-list-sidebar">
            <div class="p-3 border-bottom">
                <div class="media">
                    <div class="align-self-center mr-3">
                        <img src="{{ asset('assets/images/users/avatar/avatar-4.png') }}"
                            class="avatar-sm rounded-circle header-profile-user img-object-fit-cover" id="thumb-profile"
                            alt="thumb-profile">
                    </div>
                    <div class="media-body">
                        {{-- <p id="test-url">Any links to github.com here? If not, contact @jajang</p> --}}
                        <h5 class="font-size-15 mt-0 mb-1" id="name-profile"></h5>
                        <p class="text-muted font-size-12 mb-0" id="position-profile"></p>
                        <p class="text-muted mb-0">
                            <i class="mdi mdi-circle text-success mr-1"></i> Online
                        </p>
                    </div>

                    <div class="dropdown btn-menu-head-sidebar">
                        <button class="btn dropdown-toggle noti-icon" type="button" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                            <i class="ri-notification-3-line font-size-20"></i>
                            <span class="noti-dot" style="top:14px"></span>
                        </button>
                        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right p-0"
                            aria-labelledby="page-header-notifications-dropdown">
                            <div class="p-3">
                                <div class="row align-items-center">
                                    <div class="col">
                                        <h6 class="m-0"> Notifications </h6>
                                    </div>
                                </div>
                            </div>
                            <div data-simplebar style="max-height: 450px;overflow: auto;" id="notif-container">

                            </div>
                        </div>
                    </div>
                    <div class="dropdown btn-menu-head-sidebar">
                        <button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true"
                            aria-expanded="false">
                            <i class="fas fa-ellipsis-v font-size-20"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-right">
                            <a class="dropdown-item pointer" onclick="backHome()">
                                <i class="fas fa-home text-dark mr-2"></i> Home
                            </a>
                            <a class="dropdown-item pointer" onclick="toProfile()">
                                <i class="fas fa-id-card-alt mr-2"></i> Profile
                            </a>
                            <button type="button" class="dropdown-item pointer sound-notification" id="soundSetting"
                                value="1" onclick="checkSoundPermission()">
                                <i class="fas fa-volume-up mr-2"></i> Turn On Sound
                            </button>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item pointer" onclick="logout()">
                                <i class="fas fa-sign-out-alt text-danger mr-2"></i> Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body border-bottom py-2">
                <div class="search-box chat-search-box">
                    <div class="position-relative">
                        <div class="row">
                            <div class="col-6 no-search">
                                <button type="button" class="btn btn-outline-light btn-block waves-effect text-secondary"
                                    onclick="showSearchChat()">
                                    Search Contact Or Group
                                </button>
                            </div>
                            <div class="col-6 no-search">
                                <button type="button" class="btn btn-outline-light btn-block waves-effect text-secondary"
                                    onclick="showSearchMessage()">
                                    Search Message
                                </button>
                            </div>
                            <div class="col-10 search-chat">
                                <input type="search" id="keywordListChat" class="form-control"
                                    placeholder="Search contacts or groups..." disabled>
                                <i class="ri-search-line search-icon"></i>
                            </div>
                            <div class="col-2 search-chat">
                                <button type="button" class="btn btn-outline-danger waves-effect"
                                    onclick="hideSearchChat()">
                                    Hide
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="chat-leftsidebar-nav">
                <ul class="nav nav-pills nav-justified">
                    <li class="nav-item">
                        <a href="#friend-chat" id="menu-fc" data-toggle="tab" style="min-height: 5px;" aria-expanded="true"
                            class="nav-link pending active">
                            <i class="fas fa-address-book font-size-24" id="i-fc"></i>
                            <span id="counting-fc" class=""></span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#group-chat" id="menu-gc" data-toggle="tab" style="min-height: 5px;" aria-expanded="true"
                            class="nav-link pendingTransfer">
                            <i class="fas fa-users font-size-24" id="i-gc"></i>
                            <span id="counting-gc"></span>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="tab-content py-2">
                <div class="tab-pane active" id="friend-chat">
                    <div class="my-2">
                        <span class="text-tangerin font-weight-bold font-size-18 pl-3">Contact Chat</span>
                        <span class="text-tangerin font-weight-bold font-size-18 pl-3 float-right mr-2 pointer" title="Chat"
                            onclick="getFriendContact()">
                            <span class="badge badge-tangerin-500">
                                <i class="ri-chat-new-fill font-size-20"></i>
                            </span>
                        </span>
                    </div>
                    <div>
                        <ul class="list-unstyled chat-list" data-simplebar>
                            <div class="simplebar-wrapper " style="margin: 0px;">
                                <div class="simplebar-height-auto-observer-wrapper">
                                    <div class="simplebar-height-auto-observer"></div>
                                </div>
                                <div class="simplebar-mask">
                                    <div class="simplebar-offset">
                                        <div class="simplebar-content-wrapper">
                                            <div class="simplebar-content" style="padding: 0px;" id="dt_contact_chat"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="simplebar-placeholder"></div>
                            </div>
                            <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                <div class="simplebar-scrollbar"
                                    style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                            </div>
                            <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                <div class="simplebar-scrollbar"
                                    style="height: 132px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                            </div>
                        </ul>
                    </div>
                </div>
                <div class="tab-pane" id="group-chat">
                    <div class="my-2">
                        <span class="text-tangerin font-weight-bold font-size-18 pl-3">Groups</span>
                        <span class="text-tangerin font-weight-bold font-size-18 pl-3 float-right mr-2 pointer"
                            title="New Group" onclick="formCreateGroup()">
                            <span class="badge badge-tangerin-500">
                                <i class="ri-chat-new-fill font-size-20"></i>
                            </span>
                        </span>
                    </div>
                    <div>
                        <ul class="list-unstyled chat-list" data-simplebar style="max-height: 400px;">
                            <div class="simplebar-wrapper" style="margin: 0px;">
                                <div class="simplebar-height-auto-observer-wrapper">
                                    <div class="simplebar-height-auto-observer"></div>
                                </div>
                                <div class="simplebar-mask">
                                    <div class="simplebar-offset">
                                        <div class="simplebar-content-wrapper">
                                            <div class="simplebar-content" style="padding: 0px;" id="dt_group_chat"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="simplebar-placeholder"></div>
                            </div>
                            <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                <div class="simplebar-scrollbar"
                                    style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                            </div>
                            <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                <div class="simplebar-scrollbar"
                                    style="height: 132px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-100 user-chat" id="content-detail-chat">
            {{-- <div class="p-3 header-detail-chat-content user-chat-border"> --}}
            <div class="px-3 py-3 header-detail-chat-content user-chat-border">
                <div class="row">
                    <div class="col-8 col-md-8 col-lg-8 header-content-chat" id="header-left-content"></div>
                    <div class="col-4 col-md-4 col-lg-4 text-right header-right-inside" id="header-right-content"></div>
                </div>
            </div>
            <div class="px-2 content-body-internal-chat">
                <div class="chat-conversation p-3">
                    <ul class="list-unstyled mb-0 pr-3 simplebar">
                        <div class="simplebar-wrapper chat-detail" style="margin: 0px -16px 0px 0px;">
                            <div class="simplebar-height-auto-observer-wrapper">
                                <div class="simplebar-height-auto-observer"></div>
                            </div>
                            <div class="simplebar-mask">
                                <div class="simplebar-offset">
                                    <div class="simplebar-content-wrapper list-detail-content-chat">
                                        <div class="d-flex justify-content-center loader-content">
                                            <div class="spinner-border text-secondary loader-content" role="status">
                                                <span class="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                        <div class="simplebar-content" id="listChat"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="simplebar-placeholder"></div>
                            <div class="float-right button-scrolling-bottom mr-2 d-flex">
                                <button class="btn btn-tangerin btn-circle btn-sm counter-button-scroll"
                                    onclick="scrollToBottom()">
                                    0
                                </button>
                                <button class="btn btn-tangerin btn-circle button-scrolling-bottom"
                                    onclick="scrollToBottom()">
                                    <i class="fas fa-angle-double-down"></i>
                                </button>
                            </div>
                        </div>
                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                            <div class="simplebar-scrollbar" style="transform: translate3d(0px, 0px, 0px); display: none;">
                            </div>
                        </div>
                        <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                            <div class="simplebar-scrollbar"
                                style="transform: translate3d(0px, 0px, 0px); display: block;">
                            </div>
                        </div>
                        <div id="alert-detect" class="d-flex ml-2 alert-typing">
                            <div class="alert-typing">
                                <svg class="loader-typing alert-typing" version="1.1" id="Layer_1"
                                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
                                    y="0px" width="24px" height="30px" viewBox="0 0 24 30"
                                    style="enable-background:new 0 0 50 50;" xml:space="preserve">
                                    <rect x="0" y="13" width="4" height="5" fill="#333">
                                        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0s"
                                            dur="0.6s" repeatCount="indefinite" />
                                        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0s"
                                            dur="0.6s" repeatCount="indefinite" />
                                    </rect>
                                    <rect x="10" y="13" width="4" height="5" fill="#333">
                                        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.15s"
                                            dur="0.6s" repeatCount="indefinite" />
                                        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.15s"
                                            dur="0.6s" repeatCount="indefinite" />
                                    </rect>
                                    <rect x="20" y="13" width="4" height="5" fill="#333">
                                        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.3s"
                                            dur="0.6s" repeatCount="indefinite" />
                                        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.3s"
                                            dur="0.6s" repeatCount="indefinite" />
                                    </rect>
                                </svg>
                            </div>
                            <div class="ml-2 mt-1 alert-typing"><span class="from-typing-name"></span> are typing</div>
                        </div>
                    </ul>
                </div>
            </div>
            <div class="px-3">
                <div class="p-3 chat-input-section">
                    <div class="row reply-chat"></div>
                    <div class="row">
                        <div class="col-auto">
                            <button type="button"
                                 class="btn btn-tangerin btn-circle waves-effect waves-light text-white btn-emoji"><i
                                    class="fas fa-smile font-size-14"></i></button>
                        </div>
                        <div class="col-auto">
                            <label for="file-upload" class="custom-file-upload">
                                <i class="fas fa-image btn btn-tangerin btn-circle font-size-14" style="line-height: 1.42857"></i>                                
                            </label>
                            <input id="file-upload" type="file" onchange="readURL(this)" accept="image/*" onclick="uploadFile()"/>
                        </div>
                        <div class="col">
                            <div class="position-relative">
                                <div contenteditable="true" class="chat-input type_msg" dir="auto"
                                    placeholder="Press enter for send message" id="input_chat"></div>
                            </div>
                        </div>
                        <div class="col-auto">
                            <button type="button"
                                class="btn btn-tangerin btn-circle waves-effect waves-light text-white send-chat"><i
                                    class="fas fa-paper-plane font-size-14"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-100 user-chat wait-chat" id="content-waiting-chat"></div>
        @include('chat.agent-chat-modal')
    </div>
    <div class="dropdown-menu action-list-private-chat"></div>
    <div class="dropdown-menu action-list-group-chat"></div>
@endsection
