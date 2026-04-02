<!doctype html>
<html lang="en">

    <head>
        
        <meta charset="utf-8" />
        <title>Inbox | Qchat | Qwords Chatting Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta content="Qwords Chatting Platform" name="description" />
        <meta content="Qwords Dev Team" name="author" />
        <!-- App favicon -->
        <link rel="shortcut icon" href="assets/images/favicon.ico">

        <!-- Bootstrap Css -->
        <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
        <!-- Icons Css -->
        <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
        <!-- App Css-->
        <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />

        <!-- twitter-bootstrap-wizard css -->
        <link rel="stylesheet" href="assets/libs/twitter-bootstrap-wizard/prettify.css">

        <!-- DataTables -->
        <link href="assets/libs/datatables.net-bs4/css/dataTables.bootstrap4.min.css" rel="stylesheet" type="text/css" />
        <link href="assets/libs/datatables.net-buttons-bs4/css/buttons.bootstrap4.min.css" rel="stylesheet" type="text/css" />
        <link href="assets/libs/datatables.net-select-bs4/css//select.bootstrap4.min.css" rel="stylesheet" type="text/css" />

        <!-- Responsive datatable examples -->
        <link href="assets/libs/datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css" rel="stylesheet" type="text/css" /> 

        <!-- Custom Css-->
        <link href="assets/css/custom.css" rel="stylesheet" type="text/css" />

    </head>

    <body data-sidebar="dark">

        <!-- Begin page -->
        <div id="layout-wrapper">

            <header id="page-topbar">
                <div class="navbar-header">
                    <div class="d-flex">
                        <!-- LOGO -->
                        <div class="navbar-brand-box">
                            <a href="index.html" class="logo logo-dark">
                                <span class="logo-sm">
                                    <img src="assets/images/logo-sm-dark.png" alt="" height="22">
                                </span>
                                <span class="logo-lg">
                                    <img src="assets/images/logo-dark.png" alt="" height="32">
                                </span>
                            </a>

                            <a href="index.html" class="logo logo-light">
                                <span class="logo-sm">
                                    <img src="assets/images/logo-sm-light.png" alt="" height="22">
                                </span>
                                <span class="logo-lg">
                                    <img src="assets/images/logo-light.png" alt="" height="32">
                                </span>
                            </a>
                        </div>

                        <button type="button" class="btn btn-sm px-3 font-size-24 header-item waves-effect" id="vertical-menu-btn">
                            <i class="ri-menu-2-line align-middle"></i>
                        </button>

                        <!-- App Search-->
                        <form class="app-search d-none d-lg-block">
                            <div class="position-relative">
                                <input type="text" class="form-control" placeholder="Search...">
                                <span class="ri-search-line"></span>
                            </div>
                        </form>

                    </div>

                    <div class="d-flex">

                        <div class="dropdown d-inline-block d-lg-none ml-2">
                            <button type="button" class="btn header-item noti-icon waves-effect" id="page-header-search-dropdown"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="ri-search-line"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right p-0"
                                aria-labelledby="page-header-search-dropdown">
                    
                                <form class="p-3">
                                    <div class="form-group m-0">
                                        <div class="input-group">
                                            <input type="text" class="form-control" placeholder="Search ...">
                                            <div class="input-group-append">
                                                <button class="btn btn-primary" type="submit"><i class="ri-search-line"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div class="dropdown d-inline-block">
                            <button type="button" class="btn header-item noti-icon waves-effect" id="page-header-notifications-dropdown"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="ri-notification-4-line"></i>
                                <span class="noti-dot"></span>
                            </button>
                            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right p-0"
                                aria-labelledby="page-header-notifications-dropdown">
                                <div class="p-3">
                                    <div class="row align-items-center">
                                        <div class="col">
                                            <h6 class="m-0"> Notifications </h6>
                                        </div>
                                        <div class="col-auto">
                                            <a href="#!" class="small"> View All</a>
                                        </div>
                                    </div>
                                </div>
                                <div data-simplebar style="max-height: 230px;">
                                    <a href="" class="text-reset notification-item">
                                        <div class="media">
                                            <div class="avatar-xs mr-3">
                                                <span class="avatar-title bg-primary rounded-circle font-size-16">
                                                    <i class="ri-shopping-cart-line"></i>
                                                </span>
                                            </div>
                                            <div class="media-body">
                                                <h6 class="mt-0 mb-1">Your order is placed</h6>
                                                <div class="font-size-12 text-muted">
                                                    <p class="mb-1">If several languages coalesce the grammar</p>
                                                    <p class="mb-0"><i class="mdi mdi-clock-outline"></i> 3 min ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                    <a href="" class="text-reset notification-item">
                                        <div class="media">
                                            <img src="assets/images/users/avatar-3.jpg"
                                                class="mr-3 rounded-circle avatar-xs" alt="user-pic">
                                            <div class="media-body">
                                                <h6 class="mt-0 mb-1">James Lemire</h6>
                                                <div class="font-size-12 text-muted">
                                                    <p class="mb-1">It will seem like simplified English.</p>
                                                    <p class="mb-0"><i class="mdi mdi-clock-outline"></i> 1 hours ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                    <a href="" class="text-reset notification-item">
                                        <div class="media">
                                            <div class="avatar-xs mr-3">
                                                <span class="avatar-title bg-success rounded-circle font-size-16">
                                                    <i class="ri-checkbox-circle-line"></i>
                                                </span>
                                            </div>
                                            <div class="media-body">
                                                <h6 class="mt-0 mb-1">Your item is shipped</h6>
                                                <div class="font-size-12 text-muted">
                                                    <p class="mb-1">If several languages coalesce the grammar</p>
                                                    <p class="mb-0"><i class="mdi mdi-clock-outline"></i> 3 min ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>

                                    <a href="" class="text-reset notification-item">
                                        <div class="media">
                                            <img src="assets/images/users/avatar-4.jpg"
                                                class="mr-3 rounded-circle avatar-xs" alt="user-pic">
                                            <div class="media-body">
                                                <h6 class="mt-0 mb-1">Salena Layfield</h6>
                                                <div class="font-size-12 text-muted">
                                                    <p class="mb-1">As a skeptical Cambridge friend of mine occidental.</p>
                                                    <p class="mb-0"><i class="mdi mdi-clock-outline"></i> 1 hours ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                                <div class="p-2 border-top">
                                    <a class="btn btn-sm btn-link font-size-14 btn-block text-center" href="javascript:void(0)">
                                        <i class="mdi mdi-arrow-right-circle mr-1"></i> View More..
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="dropdown d-inline-block user-dropdown">
                            <button type="button" class="btn header-item waves-effect" id="page-header-user-dropdown"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <img class="rounded-circle header-profile-user" src="assets/images/users/avatar-2.jpg"
                                    alt="Header Avatar">
                                <span class="d-none d-xl-inline-block ml-1">Oki T</span>
                                <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-right">
                                <!-- item-->
                                <a class="dropdown-item" href="#"><i class="ri-user-line align-middle mr-1"></i> Profile</a>
                                <a class="dropdown-item" href="#"><i class="ri-shield-line align-middle mr-1"></i> Security</a>
                                <a class="dropdown-item" href="#"><i class="ri-refresh-line align-middle mr-1"></i> Switch Organization</a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item text-danger" href="#"><i class="ri-shut-down-line align-middle mr-1 text-danger"></i> Logout</a>
                            </div>
                        </div>

                    </div>
                </div>
            </header>

            @include('shared.sidebar')

            <!-- ============================================================== -->
            <!-- Start right Content here -->
            <!-- ============================================================== -->
            <div class="main-content">

                <div class="page-content">
                    <div class="container-fluid">

                        <!-- start page title -->
                        <div class="row">
                            <div class="col-12">
                                <div class="page-title-box d-flex align-items-center justify-content-between">
                                    <h4 class="mb-0">Inbox</h4>

                                    <div class="page-title-right">
                                        <ol class="breadcrumb m-0">
                                            <li class="breadcrumb-item"><a href="javascript: void(0);"><span class="ri-arrow-left-line"></span> Back to chat channel</a></li>
                                        </ol>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <!-- end page title -->

                        <div class="d-lg-flex mb-4">
                            <div class="chat-leftsidebar">
                                <div class="p-3 border-bottom">
                                    <div class="media">
                                        <div class="align-self-center mr-3">
                                            <img src="assets/images/users/profile_default.jpg" class="avatar-xs rounded-circle" alt="">
                                        </div>
                                        <div class="media-body">
                                            <h5 class="font-size-15 mt-0 mb-1">Oki TW</h5>
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
                                            <ul class="list-unstyled chat-list" data-simplebar style="max-height: 345px;">
                                                <li class="active">
                                                    <a href="#">
                                                        <div class="media">
                                                            
                                                            <div class="user-img online align-self-center mr-3">
                                                                <img src="assets/images/users/avatar-2.jpg" class="rounded-circle avatar-xs" alt="">
                                                                <span class="user-status"></span>
                                                            </div>
                                                            
                                                            <div class="media-body overflow-hidden">
                                                                <h5 class="text-truncate font-size-14 mb-1">Agus Mardheka</h5>
                                                                <p class="text-truncate mb-0">General (#04971E1815)</p>
                                                                <p class="text-truncate mb-0">Halo, kapan webnya launchi...</p>
                                                            </div>
                                                            <div class="font-size-11">09:10</div>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#">
                                                        <div class="media">
                                                            <div class="user-img away align-self-center mr-3">
                                                                <img src="assets/images/users/avatar-3.jpg" class="rounded-circle avatar-xs" alt="">
                                                                <span class="user-status"></span>
                                                            </div>
                                                            <div class="media-body overflow-hidden">
                                                                <h5 class="text-truncate font-size-14 mb-1">Joko Santoso</h5>
                                                                <p class="text-truncate mb-0">General (#11171E1814)</p>
                                                                <p class="text-truncate mb-0">Oke, problem solved ya pak...</p>
                                                            </div>
                                                            <div class="font-size-11">09 min</div>
                                                        </div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#">
                                                        <div class="media">
                                                            <div class="user-img away align-self-center mr-3">
                                                                <img src="assets/images/users/avatar-3.jpg" class="rounded-circle avatar-xs" alt="">
                                                                <span class="user-status"></span>
                                                            </div>
                                                            <div class="media-body overflow-hidden">
                                                                <h5 class="text-truncate font-size-14 mb-1">Margareth Elsa</h5>
                                                                <p class="text-truncate mb-0">General (#12271E1800)</p>
                                                                <p class="text-truncate mb-0">Siap, sama sama mbak Marga...</p>
                                                            </div>
                                                            <div class="font-size-11">09 min</div>
                                                        </div>
                                                    </a>
                                                </li>
                                            </ul>
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
                                </div>
                            </div>

                            <div class="w-100 user-chat mt-4 mt-sm-0">
                                <div class="p-3 px-lg-4 user-chat-border">
                                    <div class="row">
                                        <div class="col-md-4 col-6">
                                            <h5 class="font-size-15 mb-1 text-truncate">Agus Mardheka</h5>
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
                                                        </div>
                                                    </div>
                                                </li>
                                                
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div class="px-lg-2">
                                    <div class="chat-conversation p-3">
                                        <ul class="list-unstyled mb-0 pr-3" data-simplebar style="max-height: 450px;">
                                            <li>
                                                <div class="conversation-list">
                                                    <div class="chat-avatar">
                                                        <img src="assets/images/users/avatar-2.jpg" alt="">
                                                    </div>
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Agus Mardheka</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Halo, kapan webnya launching ya
                                                            </p>
                                                        </div>
                                                        <p class="chat-time mb-0"><i class="mdi mdi-clock-outline align-middle mr-1"></i> 12:09</p>
                                                    </div>
                                                    
                                                </div>
                                            </li>

                                            <li class="right">
                                                <div class="conversation-list">
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Anda</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Kami sedang persiapkan kak
                                                            </p>
                                                        </div>
                                                        <div class="ctext-wrap-content mt-1">
                                                            <p class="mb-0">
                                                                Mohon ditunggu ya
                                                            </p>
                                                        </div>
                                                        <p class="chat-time mb-0"><i class="bx bx-time-five align-middle mr-1"></i> 13:02</p>
                                                    </div>
                                                </div>
                                            </li>

                                            <li>
                                                <div class="conversation-list">
                                                    <div class="chat-avatar">
                                                        <img src="assets/images/users/avatar-2.jpg" alt="">
                                                    </div>
                                                    <div class="ctext-wrap">
                                                        <div class="conversation-name">Agus Mardheka</div>
                                                        <div class="ctext-wrap-content">
                                                            <p class="mb-0">
                                                                Oke siap kakak
                                                            </p>
                                                        </div>
                                                        <p class="chat-time mb-0"><i class="mdi mdi-clock-outline align-middle mr-1"></i> 13:09</p>
                                                    </div>
                                                    
                                                </div>
                                            </li>

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
                            </div>
                        </div>
                        <!-- end row -->

                    </div> <!-- container-fluid -->
                </div>
                <!-- End Page-content -->

                <footer class="footer">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-sm-6">
                                <script>document.write(new Date().getFullYear())</script> © Qwords.com
                            </div>
                            <div class="col-sm-6">
                                <div class="text-sm-right d-none d-sm-block">
                                    Crafted with <i class="mdi mdi-heart text-danger"></i> by Qwords Dev Team
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            <!-- end main content-->

        </div>
        <!-- END layout-wrapper -->

        <!-- Right bar overlay-->
        <div class="rightbar-overlay"></div>

        <!-- Modal -->
        <div class="modal fade" id="add-channel" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Add channel</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Platform</label>
                            <select class="form-control">
                                <option>iOS</option>
                                <option>Android</option>
                                <option>Web</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Origin (for CORS) <span class="ri-question-line"></span></label>
                            <input type="text" name="origin" class="form-control" placeholder="Your origin">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary waves-effect waves-light">Create</button>
                        <button type="button" class="btn btn-light waves-effect" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="detail-live-chat" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Detail channel</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Package name</label>
                            <p>nanjak-android</p>
                        </div>
                        <div class="form-group">
                            <label>Platform</label>
                            <p>Android</p>
                        </div>
                        <div class="form-group">
                            <label>Secret key</label>
                            <p>13f1c5821c96179e4d7ecf68ed0bc67742fd38a6a12da8a70e9e3f2e060d32f8 <a href="" class="ri-file-copy-line ml-2"></a></p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger waves-effect waves-light">Delete</button>
                        <button type="button" class="btn btn-primary waves-effect" data-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- JAVASCRIPT -->
        <script src="assets/libs/jquery/jquery.min.js"></script>
        <script src="assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="assets/libs/metismenu/metisMenu.min.js"></script>
        <script src="assets/libs/simplebar/simplebar.min.js"></script>
        <script src="assets/libs/node-waves/waves.min.js"></script>

        <!-- Required datatable js -->
        <script src="assets/libs/datatables.net/js/jquery.dataTables.min.js"></script>
        <script src="assets/libs/datatables.net-bs4/js/dataTables.bootstrap4.min.js"></script>
        <!-- Buttons examples -->
        <script src="assets/libs/datatables.net-buttons/js/dataTables.buttons.min.js"></script>
        <script src="assets/libs/datatables.net-buttons-bs4/js/buttons.bootstrap4.min.js"></script>
        <script src="assets/libs/jszip/jszip.min.js"></script>
        <script src="assets/libs/pdfmake/build/pdfmake.min.js"></script>
        <script src="assets/libs/pdfmake/build/vfs_fonts.js"></script>
        <script src="assets/libs/datatables.net-buttons/js/buttons.html5.min.js"></script>
        <script src="assets/libs/datatables.net-buttons/js/buttons.print.min.js"></script>
        <script src="assets/libs/datatables.net-buttons/js/buttons.colVis.min.js"></script>

        <script src="assets/libs/datatables.net-keytable/js/dataTables.keyTable.min.js"></script>
        <script src="assets/libs/datatables.net-select/js/dataTables.select.min.js"></script>
        
        <!-- Responsive examples -->
        <script src="assets/libs/datatables.net-responsive/js/dataTables.responsive.min.js"></script>
        <script src="assets/libs/datatables.net-responsive-bs4/js/responsive.bootstrap4.min.js"></script>

        <!-- Datatable init js -->
        <script src="assets/js/pages/datatables.init.js"></script>

        <!-- twitter-bootstrap-wizard js -->
        <script src="assets/libs/twitter-bootstrap-wizard/jquery.bootstrap.wizard.min.js"></script>
        <script src="assets/libs/twitter-bootstrap-wizard/prettify.js"></script>

        <!-- form wizard init -->
        <script src="assets/js/pages/form-wizard.init.js"></script>

        <script src="assets/js/app.js"></script>

    </body>
</html>
