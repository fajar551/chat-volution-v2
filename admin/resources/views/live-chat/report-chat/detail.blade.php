@extends('layouts.app-chat.app')

{{-- content --}}
@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="page-title-box d-flex align-items-center justify-content-between">
                    <input type="hidden" class="chat_id" value="{{ $chat_id }}">
                    <div class="page-title-left">
                        <ol class="breadcrumb m-0">
                            <li class="breadcrumb-item">
                                <a href="/chat/report"><i class="ri-arrow-left-line mr-2"></i> Back to List</a>
                            </li>
                        </ol>
                    </div>
                    <h5 class="mb-0 font-size-14" id="menu-label">Detail Report Chat</h5>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12 col-md-9 col-lg-9 mb-3">
                <div class="w-100 user-chat mt-4 mt-sm-0" id="content-detail-chat">
                    <div class="p-3 px-lg-4 header border-bottom border-soft-tangerin-500">
                        <div class="row">
                            <div class="col-12 col-md-12 col-lg-12">
                                <h5 class="font-size-15 mb-1 text-truncate" id="current_client_name">Chat ID
                                    {{ $chat_id }}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div class="px-lg-2">
                        <div class="chat-conversation p-3">
                            <ul class="list-unstyled mb-0 pr-3" data-simplebar="init" style="max-height: 400px;">
                                <div class="simplebar-wrapper" style="margin: 0px -16px 0px 0px;">
                                    <div class="simplebar-height-auto-observer-wrapper">
                                        <div class="simplebar-height-auto-observer"></div>
                                    </div>
                                    <div class="simplebar-mask">
                                        <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                                            <div class="simplebar-content-wrapper" style="height: 400px; overflow: hidden;">
                                                <div class="simplebar-content"
                                                    style="padding: 0px 16px 0px 0px;min-height:400px;overflow-y:auto"
                                                    id="listChat">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="simplebar-placeholder" style="width: auto; height: 222px;"></div>
                                </div>
                                <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                    <div class="simplebar-scrollbar"
                                        style="transform: translate3d(0px, 0px, 0px); display: none;">
                                    </div>
                                </div>
                                <div class="simplebar-track simplebar-vertical" style="visibility: hidden;">
                                    <div class="simplebar-scrollbar"
                                        style="transform: translate3d(0px, 0px, 0px); display: none;">
                                    </div>
                                </div>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-3 col-lg-3">
                <div class="card">
                    <div class="card-header bg-white border-bottom border-soft-tangerin-500">
                        <h5 class="font-size-15 mb-0">
                            Detail Chat
                        </h5>
                    </div>
                    <div class="card-body list-info-chat">
                        <ul class="list-group mb-0 pr-3" data-simplebar="init" style="max-height: 400px;">
                            <div class="simplebar-wrapper" style="margin: 0px -16px 0px 0px;">
                                <div class="simplebar-height-auto-observer-wrapper">
                                    <div class="simplebar-height-auto-observer"></div>
                                </div>
                                <div class="simplebar-mask">
                                    <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                                        <div class="simplebar-content-wrapper" style="height: 400px; overflow: hidden;">
                                            <div class="simplebar-content"
                                                style="padding: 0px 16px 0px 0px;min-height:400px;overflow-y:auto" id="IC">
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">Channel</h5>
                                                    </div>
                                                    <p class="mb-1 channel_name"></p>
                                                </li>
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">Department</h5>
                                                    </div>
                                                    <p class="mb-1 department_name"></p>
                                                </li>
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">Topic</h5>
                                                    </div>
                                                    <p class="mb-1 topic_name"></p>
                                                </li>
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">Rating</h5>
                                                    </div>
                                                    <p class="mb-1 rating"></p>
                                                </li>
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">First Response</h5>
                                                    </div>
                                                    <p class="mb-1 first_response_time"></p>
                                                </li>
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">First Response Duration</h5>
                                                    </div>
                                                    <p class="mb-1 first_response_wait_duration"></p>
                                                </li>
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">Resolve Time</h5>
                                                    </div>
                                                    <p class="mb-1 resolve_time"></p>
                                                </li>
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">Case Duration</h5>
                                                    </div>
                                                    <p class="mb-1 case_duration"></p>
                                                </li>
                                                <li
                                                    class="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div class="d-flex w-100 justify-content-between">
                                                        <h5 class="mb-1 font-size-16">Status Name</h5>
                                                    </div>
                                                    <p class="mb-1 status_name"></p>
                                                </li>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="simplebar-placeholder" style="width: auto; height: 222px;"></div>
                            </div>
                            <div class="simplebar-track simplebar-vertical" style="visibility: hidden;">
                                <div class="simplebar-scrollbar"
                                    style="transform: translate3d(0px, 0px, 0px); display: none;">
                                </div>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection


{{-- footer --}}
@section('footer')
    @include('shared.footer')
@endsection
