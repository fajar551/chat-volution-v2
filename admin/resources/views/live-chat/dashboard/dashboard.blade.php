@extends('layouts.app-chat.app')

@section('css')
    <link href="https://releases.transloadit.com/uppy/v2.6.0/uppy.min.css" rel="stylesheet">
@endsection

@section('js')
    <script src="https://releases.transloadit.com/uppy/v2.6.0/uppy.min.js"></script>
@endsection

@section('content')
    <div class="container-fluid">
        <div class="chat-list">
            <ul class="list-inline mb-2 horizontal-slide" id="list-online-agent">
            </ul>
        </div>
        <div class="d-lg-flex mb-4">
            <div class="chat-leftsidebar">
                <div class="p-3 border-bottom">
                    <div class="media">
                        <div class="align-self-center mr-3">
                            <img src="{{ asset('assets/images/small/img-2.jpg') }}"
                                class="avatar-sm rounded-circle header-profile-user img-object-fit-cover" id="thumb-profile"
                                alt="thumb-profile">
                        </div>
                        <div class="media-body">
                            <h5 class="font-size-15 mt-0 mb-1" id="name-profile"></h5>
                            <p class="text-muted font-size-12 mb-0" id="position-profile"></p>
                            <p class="text-muted mb-0">
                                <i class="mdi mdi-circle text-success align-middle mr-1"></i> Online
                            </p>
                        </div>
                        <div class="dropdown chat-noti-dropdown">
                            <button class="btn" id="soundSetting" value="1" onclick="checkSoundPermission()">
                                <i class="fas fa-volume-up font-size-20 mr-2"></i>
                            </button>
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
                        <li class="nav-item" onclick="getPending()">
                            <a href="#pending" id="menu-pending" data-toggle="tab" style="min-height: 5px;"
                                aria-expanded="true" class="nav-link pending active">
                                <i class="ri-pause-circle-line font-size-24" id="icon-pending-menu"></i>
                                <span id="counting-pending" class=""></span>
                            </a>
                        </li>
                        <li class="nav-item" onclick="getPendingTransfer()">
                            <a href="#pending-transfer" id="menu-pending-transfer" data-toggle="tab"
                                style="min-height: 5px;" aria-expanded="true" class="nav-link pendingTransfer">
                                <i class=" ri-arrow-left-right-line font-size-24" id="icon-pending-transfer-menu"></i>
                                <span id="counting-pending-transfer" class=""></span>
                            </a>
                        </li>
                        <li class="nav-item" onclick="getOngoing()">
                            <a href="#onGoing" id="menu-ongoing" data-toggle="tab" style="min-height: 5px;"
                                aria-expanded="true" class="nav-link ongoing">
                                <i class="ri-question-answer-line font-size-24" id="icon-ongoing-menu"></i>
                                <span id="counting-onGoing" class=""></span>
                            </a>
                        </li>
                        <li class="nav-item" onclick="getHistory()">
                            <a href="#history" id="menu-history" data-toggle="tab" style="min-height: 5px;"
                                aria-expanded="true" class="nav-link history">
                                <i class="ri-time-line font-size-24 " id="icon-history-menu"></i>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class=" tab-content py-2">
                    <div class="tab-pane show active" id="pending">
                        <div class="my-2">
                            <span class="text-tangerin font-weight-bold font-size-18 pl-3"
                                id="label-menu-pending">Pending</span>
                        </div>
                        <div>
                            <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 250px;">
                                <div class="simplebar-wrapper" style="margin: 0px;">
                                    <div class="simplebar-height-auto-observer-wrapper">
                                        <div class="simplebar-height-auto-observer"></div>
                                    </div>
                                    <div class="simplebar-mask">
                                        <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                            <div class="simplebar-content-wrapper"
                                                style="height: auto; overflow: hidden scroll;">
                                                <div class="simplebar-content" style="padding: 0px;" id="dt_pending"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                                </div>
                                <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                    <div class="simplebar-scrollbar"
                                        style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                                </div>
                                <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                    <div class="simplebar-scrollbar"
                                        style="height: 238px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                                </div>
                            </ul>
                        </div>
                    </div>
                    <div class="tab-pane show" id="pending-transfer">
                        <div class="my-2">
                            <span class="text-tangerin font-weight-bold font-size-18 pl-3"
                                id="label-menu-pending-transfer">Pending Transfer</span>
                        </div>
                        <div>
                            <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 250px;">
                                <div class="simplebar-wrapper" style="margin: 0px;">
                                    <div class="simplebar-height-auto-observer-wrapper">
                                        <div class="simplebar-height-auto-observer"></div>
                                    </div>
                                    <div class="simplebar-mask">
                                        <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                            <div class="simplebar-content-wrapper"
                                                style="height: auto; overflow: hidden scroll;">
                                                <div class="simplebar-content" style="padding: 0px;"
                                                    id="dt_pending_transfer"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                                </div>
                                <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                    <div class="simplebar-scrollbar"
                                        style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                                </div>
                                <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                    <div class="simplebar-scrollbar"
                                        style="height: 238px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                                </div>
                            </ul>
                        </div>
                    </div>
                    <div class="tab-pane" id="onGoing">
                        <div class="my-2">
                            <span class="text-tangerin font-weight-bold font-size-18 pl-3" id="label-menu-ongoing">On
                                Going</span>
                        </div>
                        <div>
                            <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 250px;">
                                <div class="simplebar-wrapper" style="margin: 0px;">
                                    <div class="simplebar-height-auto-observer-wrapper">
                                        <div class="simplebar-height-auto-observer"></div>
                                    </div>
                                    <div class="simplebar-mask">
                                        <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                            <div class="simplebar-content-wrapper"
                                                style="height: auto; overflow: hidden scroll;">
                                                <div class="simplebar-content" style="padding: 0px;" id="dtOngoing"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                                </div>
                                <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                    <div class="simplebar-scrollbar"
                                        style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                                </div>
                                <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                    <div class="simplebar-scrollbar"
                                        style="height: 238px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                                </div>
                            </ul>
                        </div>
                    </div>
                    <div class="tab-pane" id="history">
                        <div class="my-2">
                            <span class="text-tangerin font-weight-bold font-size-18 pl-3"
                                id="label-menu-history">History</span>
                        </div>
                        <div>
                            <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 250px;">
                                <div class="simplebar-wrapper" style="margin: 0px;">
                                    <div class="simplebar-height-auto-observer-wrapper">
                                        <div class="simplebar-height-auto-observer"></div>
                                    </div>
                                    <div class="simplebar-mask">
                                        <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                            <div class="simplebar-content-wrapper"
                                                style="height: auto; overflow: hidden scroll;">
                                                <div class="simplebar-content" style="padding: 0px;" id="dt_history"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                                </div>
                                <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                    <div class="simplebar-scrollbar"
                                        style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                                </div>
                                <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                    <div class="simplebar-scrollbar"
                                        style="height: 238px; transform: translate3d(0px, 0px, 0px); display: block;"></div>
                                </div>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-100 user-chat mt-4 mt-sm-0" id="content-detail-chat">
                <div class=" p-3 px-lg-4 header">
                    <div class="row">
                        <div class="col-8 col-md-8 col-lg-8">
                            <h5 class="font-size-15 mb-1 text-truncate" id="current_client_name"></h5>
                            <p class="text-muted text-truncate mb-0" style="margin-bottom: 2px !important;"
                                id="current_client_mail"></p>
                        </div>
                        <div class="col-4 col-md-4 col-lg-4 text-right" id="header-right-inside"></div>
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
                                                style="padding: 0px 16px 0px 0px;min-height:400px;overflow-y:auto" id="IC">
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
                <div class="px-lg-3" id="sendMsg">
                    <div id="tools-msg">
                        <div class="dropdown-menu scrollable-dropdown scrollable-dropdown-y show" x-placement="top-start">
                            <h6 class="dropdown-header scrollabel-dropdown-header" id="popup-msg-header"></h6>
                            <div id="popup-message"></div>
                        </div>
                    </div>
                    <div>
                        <div class="emoji-tools"></div>
                    </div>
                    <div class="p-3 chat-input-section">
                        <div class="row">
                            <div class="col-auto">
                                <button type="button"
                                    class="btn btn-tangerin btn-circle waves-effect waves-light text-white emoji-list"><i
                                        class="fas fa-smile font-size-14"></i></button>
                            </div>
                            <div class="col">
                                <div class="position-relative">
                                    <div contenteditable="true" class="chat-input type_msg" dir="auto"
                                        onkeyup="chekcMessage()" placeholder="Message" id="input_chat"></div>
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
                <div class="chat-input-section" id="btnMsg">
                </div>
            </div>
        </div>
        <button class="UppyModalOpenerBtn" style="display: none;"></button>
        <div class="DashboardContainer"></div>
        <div class="modal fade bs-example-modal-lg" id="transferChatForm" tabindex="-1" role="dialog"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="formAgent"><i
                                class="ri-arrow-left-right-line mr-2 font-size-14"></i> Transfer Chat
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="btn-save">
                        <div class="modal-body">
                            <ul class="nav nav-tabs nav-tabs-custom nav-justified" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link active" data-toggle="tab" href="#department-tab" role="tab">
                                        <span class="d-block d-sm-none" title="detail">
                                            <i class="fas fa-building font-size-18"></i>
                                        </span>
                                        <span class="d-none d-sm-block"><i class="fas fa-building font-size-18 mr-2"></i>
                                            Department</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-toggle="tab" href="#agent-tab" role="tab">
                                        <span class="d-block d-sm-none" title="agents">
                                            <i class="fas fa-users font-size-18"></i>
                                        </span>
                                        <span class="d-none d-sm-block">
                                            <i class="fas fa-users font-size-18 mr-2"></i> Agents
                                        </span>
                                    </a>
                                </li>
                            </ul>

                            <!-- Tab panes -->
                            <div class="tab-content p-3 text-muted">
                                <div class="tab-pane active" id="department-tab" role="tabpanel">
                                    <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 320px;">
                                        <div class="simplebar-wrapper" style="margin: 0px;">
                                            <div class="simplebar-height-auto-observer-wrapper">
                                                <div class="simplebar-height-auto-observer"></div>
                                            </div>
                                            <div class="simplebar-mask">
                                                <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                                    <div class="simplebar-content-wrapper"
                                                        style="height: auto; overflow: hidden scroll;">
                                                        <div class="simplebar-content" style="padding: 0px;" id="lDept">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                                        </div>
                                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                            <div class="simplebar-scrollbar"
                                                style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                                        </div>
                                        <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                            <div class="simplebar-scrollbar"
                                                style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                                            </div>
                                        </div>
                                    </ul>
                                </div>
                                <div class=" tab-pane" id="agent-tab" role="tabpanel">
                                    <ul class="list-unstyled chat-list" data-simplebar="init" style="max-height: 320px;">
                                        <div class="simplebar-wrapper" style="margin: 0px;">
                                            <div class="simplebar-height-auto-observer-wrapper">
                                                <div class="simplebar-height-auto-observer"></div>
                                            </div>
                                            <div class="simplebar-mask">
                                                <div class="simplebar-offset" style="right: -17px; bottom: 0px;">
                                                    <div class="simplebar-content-wrapper"
                                                        style="height: auto; overflow: hidden scroll;">
                                                        <div class="simplebar-content" style="padding: 0px;" id="lAgents">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="simplebar-placeholder" style="width: auto; height: 500px;"></div>
                                        </div>
                                        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                                            <div class="simplebar-scrollbar"
                                                style="transform: translate3d(0px, 0px, 0px); display: none;"></div>
                                        </div>
                                        <div class="simplebar-track simplebar-vertical" style="visibility: visible;">
                                            <div class="simplebar-scrollbar"
                                                style="height: 238px; transform: translate3d(0px, 107px, 0px); display: block;">
                                            </div>
                                        </div>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="modal fade bs-example-modal-sm" id="formLabels" tabindex="-1" role="dialog"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-tags mr-2 text-size-14"></i> Labels
                        </h5>
                        <button type="button" onclick="closeFormLabels()" class="close" data-dismiss="modal"
                            aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="col-12 col-md-12 col-lg-12" id="iLabel"></div>
                    </div>
                    <div class="card-footer">
                        <form class="form-inline">
                            <div class="form-group mx-sm-2 mb-2">
                                <select id="listLabels" class="form-control selectpicker-search list-label search-label"
                                    multiple>
                                </select>
                            </div>
                            <button type="button" onclick="addLabel()"
                                class="btn btn-tangerin waves-effect waves-light mb-2">
                                <i class="fas fa-save mr-1"></i> Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade bs-example-modal-sm" id="modal-detail-chat" tabindex="-1" role="dialog"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-tags mr-2 text-size-14"></i> Chat History Action
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="col-12 col-md-12 col-lg-12">
                            <div class="Stepwrapper">
                                <ul class="StepProgress">

                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">

                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="formSendHistoryChat" tabindex="-1" role="dialog" aria-labelledby="Send History"
            aria-hidden="true" data-backdrop="static" data-keyboard="false">
            <div class="modal-dialog modal-dialog-centered modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addToken">
                            <i class="fas fa-paper-plane"></i> Form Send History Chat
                        </h5>
                    </div>
                    <form id="btn-send-history" data-parsley-validate data-parsley-errors-messages-disabled>

                        <div class="modal-body">
                            <div class="form-group">
                                <input type="email" id="email_client_sender" data-parsley-type="email" data-parsley-required
                                    class="form-control" placeholder="Type Email Client">
                                <span class="text-danger" id="err_email_client_sender"></span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary font-weight-bold font-size-16 "
                                onclick="closeSendHistory()">Close</button>
                            <button type="submit" class="btn btn-tangerin font-weight-bold font-size-16">Send</button>
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
