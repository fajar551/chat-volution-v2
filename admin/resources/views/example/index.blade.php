<!doctype html>
<html lang="en">

    <head>
        
        <meta charset="utf-8" />
        <title>Dashboard | Qchat | Qwords Chatting Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta content="Qwords Chatting Platform" name="description" />
        <meta content="Qwords Dev Team" name="author" />
        <!-- App favicon -->
        <link rel="shortcut icon" href="assets/images/favicon.ico">

        <!-- jquery.vectormap css -->
        <link href="assets/libs/admin-resources/jquery.vectormap/jquery-jvectormap-1.2.2.css" rel="stylesheet" type="text/css" />

        <!-- DataTables -->
        <link href="assets/libs/datatables.net-bs4/css/dataTables.bootstrap4.min.css" rel="stylesheet" type="text/css" />

        <!-- Responsive datatable examples -->
        <link href="assets/libs/datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css" rel="stylesheet" type="text/css" />  

        <!-- Bootstrap Css -->
        <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
        <!-- Icons Css -->
        <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
        <!-- App Css-->
        <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
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
                                    <h4 class="mb-0">Beranda</h4>
                                </div>
                            </div>
                        </div>
                        <!-- end page title -->

                        <div class="row">
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-body">
                                        <div id="accordion" class="custom-accordion">
                                            <div class="card mb-1 shadow-none">
                                                <a href="#collapseOne" class="text-dark" data-toggle="collapse" aria-expanded="true" aria-controls="collapseOne">
                                                    <div class="card-header" id="headingOne">
                                                        <div class="row m-0">
                                                            <div class="col-md-1 mt-1">
                                                                <h5 class="text-warning">0/5</h5>
                                                            </div>
                                                            <div class="col-md-10 mt-1">
                                                                <h5>Hello, Oki T Wibowo! Lets get you started!</h5>
                                                            </div>
                                                            <div class="col-md-1 mt-1">
                                                                <i class="mdi mdi-minus float-right accor-plus-icon"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                                <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion" style="">
                                                    <div class="card-body">
                                                        <div class="row">
                                                            <div class="col-md-3">
                                                                <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                                                                    <a class="nav-link font-weight-bold mb-2 active" id="v-pills-home-tab" data-toggle="pill" href="#v-pills-home" role="tab" aria-controls="v-pills-home" aria-selected="true">1. Invite a member to your organization</a>
                                                                    <a class="nav-link font-weight-bold mb-2" id="v-pills-profile-tab" data-toggle="pill" href="#v-pills-profile" role="tab" aria-controls="v-pills-profile" aria-selected="false">2. Add topic</a>
                                                                    <a class="nav-link mb-2 font-weight-bold mb-2" id="v-pills-messages-tab" data-toggle="pill" href="#v-pills-messages" role="tab" aria-controls="v-pills-messages" aria-selected="false">3. Assign agent to topics</a>
                                                                    <a class="nav-link font-weight-bold mb-2" id="v-pills-settings-tab" data-toggle="pill" href="#v-pills-settings" role="tab" aria-controls="v-pills-settings" aria-selected="false">4. Integrate a channel</a>
                                                                    <a class="nav-link font-weight-bold mb-2" id="v-pills-wizard5-tab" data-toggle="pill" href="#v-pills-wizard5" role="tab" aria-controls="v-pills-wizard5" aria-selected="false">5. Reply to a message in your inbox</a>
                                                                </div>
                                                            </div>
                                                            <div class="col-md-9">
                                                                <div class="tab-content text-muted mt-4 mt-md-0" id="v-pills-tabContent">
                                                                    <div class="tab-pane fade active show" id="v-pills-home" role="tabpanel" aria-labelledby="v-pills-home-tab">
                                                                        <div class="pl-2 pr-2">
                                                                            <div class="alert alert-info alert-dismissible fade show mb-0" role="alert">
                                                                            <i class="mdi mdi-alert-circle-outline mr-2"></i>
                                                                            Follow the steps that are in the documentation page by clicking “Read Guide”. Once done, click on “Mark as Done”
                                                                            </div>
                                                                            <img src="assets/images/illustration/img_invite.svg">
                                                                            <p class="mt-2">Invite a team member to you organization to get started. Depending on your tier, you can have up to 10 members in one organization (Diamond tier) to help reply all incoming messages under a single company.</p>
                                                                            <button type="button" class="btn btn-warning waves-effect waves-light">
                                                                                <i class="ri-external-link-line align-middle mr-2"></i> Read guide
                                                                            </button>
                                                                            <button type="button" class="btn btn-success waves-effect waves-light">
                                                                                <i class="ri-check-line align-middle mr-2"></i> Mark as done
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab">
                                                                        <div class="pl-2 pr-2">
                                                                            <img src="assets/images/illustration/img_invite.svg">
                                                                            <p class="mt-2">Create topics to group all incoming messages so that you can assign appropriate agents.</p>
                                                                            <button type="button" class="btn btn-warning waves-effect waves-light">
                                                                                <i class="ri-external-link-line align-middle mr-2"></i> Read guide
                                                                            </button>
                                                                            <button type="button" class="btn btn-success waves-effect waves-light">
                                                                                <i class="ri-check-line align-middle mr-2"></i> Mark as done
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="v-pills-messages" role="tabpanel" aria-labelledby="v-pills-messages-tab">
                                                                        <div class="pl-2 pr-2">
                                                                            <img src="assets/images/illustration/img_invite.svg">
                                                                            <p class="mt-2">Assign specific agents to topics so that they can reply to incoming messages accordingly.</p>
                                                                            <button type="button" class="btn btn-warning waves-effect waves-light">
                                                                                <i class="ri-external-link-line align-middle mr-2"></i> Read guide
                                                                            </button>
                                                                            <button type="button" class="btn btn-success waves-effect waves-light">
                                                                                <i class="ri-check-line align-middle mr-2"></i> Mark as done
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="v-pills-settings" role="tabpanel" aria-labelledby="v-pills-settings-tab">
                                                                        <div class="pl-2 pr-2">
                                                                            <img src="assets/images/illustration/img_invite.svg">
                                                                            <p class="mt-2">Start by integrating at least one of the channels above. The one’s with the tag “Paid” requires a payment upfront whereas the one’s that has a “Free” tag is included with the OneTalk tier.</p>
                                                                            <button type="button" class="btn btn-warning waves-effect waves-light">
                                                                                <i class="ri-external-link-line align-middle mr-2"></i> Read guide
                                                                            </button>
                                                                            <button type="button" class="btn btn-success waves-effect waves-light">
                                                                                <i class="ri-check-line align-middle mr-2"></i> Mark as done
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div class="tab-pane fade" id="v-pills-wizard5" role="tabpanel" aria-labelledby="v-pills-wizard5-tab">
                                                                        <div class="pl-2 pr-2">
                                                                            <img src="assets/images/illustration/img_invite.svg">
                                                                            <p class="mt-2">You’re nearly there! One last thing to do is to reply to incoming messages from your inbox.<b>Try messaging to one of the channels you have successfully integrated and reply it from the inbox!</b></p>
                                                                            <button type="button" class="btn btn-warning waves-effect waves-light">
                                                                                <i class="ri-external-link-line align-middle mr-2"></i> Read guide
                                                                            </button>
                                                                            <button type="button" class="btn btn-success waves-effect waves-light">
                                                                                <i class="ri-check-line align-middle mr-2"></i> Mark as done
                                                                            </button>
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
                            </div>
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-body">
                                        <h4 class="card-title mb-4">Hello Oki T Wibowo, ready to serve your customers?</h4>
                                        <div class="row">
                                            <div class="col-md-4">
                                                <div class="media mb-4">
                                                    <img class="avatar-sm mr-3 rounded-circle" src="assets/images/users/avatar-6.jpg" alt="">
                                                    <div class="media-body">
                                                        <h5 class="mt-0 font-size-14">Organization</h5>
                                                        Nanjak ID
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="media mb-4">
                                                    <img class="avatar-sm mr-3 rounded-circle" src="assets/images/users/avatar-6.jpg" alt="">
                                                    <div class="media-body">
                                                        <h5 class="mt-0 font-size-14">Account</h5>
                                                        davinci.okitri@gmail.com
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="media mb-4">
                                                    <img class="avatar-sm mr-3 rounded-circle" src="assets/images/users/avatar-6.jpg" alt="">
                                                    <div class="media-body">
                                                        <h5 class="mt-0 font-size-14">Tier</h5>
                                                        Silver
                                                    </div>
                                                </div>
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

        <!-- Chatbox -->
        <button type="button" class="btn btn-primary btn-rounded waves-effect waves-light" id="chatbox" data-toggle="modal" data-target="#form-chatbox">
            <span class="h2 text-white ri-chat-1-fill"></span>
        </button>

        <!-- Modal chatbox-->
        <div class="chat-box modal fade" id="form-chatbox" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">New message</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Please fill out the form below before you leave a message</p>
                        <div class="form-group">
                            <input type="text" name="fullname" class="form-control" placeholder="Enter full name">
                        </div>
                        <div class="form-group">
                            <input type="email" name="email" class="form-control" placeholder="Enter email address">
                        </div>
                        <div class="form-group">
                            <select class="form-control">
                                <option>General</option>
                                <option>Customer service</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <textarea class="form-control" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <a href="#chatroom" class="btn btn-primary btn-block" data-toggle="modal" data-dismiss="modal">Send message</a>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <p>Powered by <b>Qwords</b></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal chatroom-->
        <div class="chat-box modal fade" id="chatroom" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel"><a href="#form-chatbox" class="btn mr-2" data-toggle="modal" data-dismiss="modal"><span class="ri-arrow-left-s-line"></span></a> General (#453SA)</h5>
                    </div>
                    <div class="modal-body">
                        <div class="chat-conversation p-3">
                            <ul class="list-unstyled mb-0 pr-3" data-simplebar style="max-height: 290px;">
                                <li class="right">
                                    <div class="conversation-list">
                                        <div class="ctext-wrap">
                                            <div class="conversation-name">Rudi Hamdani</div>
                                            <div class="ctext-wrap-content">
                                                <p class="mb-0">
                                                    Halo
                                                </p>
                                            </div>

                                            <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:07</p>
                                        </div>
                                    </div>
                                </li>
                                <li >
                                    <div class="conversation-list">
                                        <div class="ctext-wrap">
                                            <div class="conversation-name">Admin</div>
                                            <div class="ctext-wrap-content">
                                                <p class="mb-0">Selamat siang, ada yang bisa dibantu?</p>
                                            </div>
                                            <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:06</p>
                                        </div>

                                    </div>
                                </li>
                                <li class="right">
                                    <div class="conversation-list">
                                        <div class="ctext-wrap">
                                            <div class="conversation-name">Rudi Hamdani</div>
                                            <div class="ctext-wrap-content">
                                                <p class="mb-0">
                                                    Saya punya masalah sama hosting saya min...
                                                </p>
                                            </div>

                                            <p class="chat-time mb-0"><i class="mdi mdi-clock-outline mr-1"></i> 10:07</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="p-3 chat-input-section">
                            <div class="row">
                                <div class="col-10">
                                    <div class="position-relative">
                                        <input type="text" class="form-control chat-input" placeholder="Enter Message...">
                                    </div>
                                </div>
                                <div class="col-2">
                                    <button type="submit" class="btn btn-primary waves-effect waves-light"><i class="mdi mdi-send"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <p>Powered by <b>Qwords</b></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right bar overlay-->
        <div class="rightbar-overlay"></div>

        <!-- JAVASCRIPT -->
        <script src="assets/libs/jquery/jquery.min.js"></script>
        <script src="assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="assets/libs/metismenu/metisMenu.min.js"></script>
        <script src="assets/libs/simplebar/simplebar.min.js"></script>
        <script src="assets/libs/node-waves/waves.min.js"></script>

        <!-- apexcharts -->
        <script src="assets/libs/apexcharts/apexcharts.min.js"></script>

        <!-- jquery.vectormap map -->
        <script src="assets/libs/admin-resources/jquery.vectormap/jquery-jvectormap-1.2.2.min.js"></script>
        <script src="assets/libs/admin-resources/jquery.vectormap/maps/jquery-jvectormap-us-merc-en.js"></script>

        <!-- Required datatable js -->
        <script src="assets/libs/datatables.net/js/jquery.dataTables.min.js"></script>
        <script src="assets/libs/datatables.net-bs4/js/dataTables.bootstrap4.min.js"></script>
        
        <!-- Responsive examples -->
        <script src="assets/libs/datatables.net-responsive/js/dataTables.responsive.min.js"></script>
        <script src="assets/libs/datatables.net-responsive-bs4/js/responsive.bootstrap4.min.js"></script>

        <script src="assets/js/pages/dashboard.init.js"></script>

        <script src="assets/js/app.js"></script>

        <script type="text/javascript">
            var options = {
              series: [{
              name: 'domain',
              data: [31, 40, 28, 51, 42, 109, 100]
            }],
              chart: {
              height: 350,
              type: 'area'
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'smooth'
            },
            xaxis: {
              type: 'datetime',
              categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
            },
            tooltip: {
              x: {
                format: 'dd/MM/yy HH:mm'
              },
            },
            };

            var chart = new ApexCharts(document.querySelector("#domain-chart"), options);
            chart.render();
        </script>

    </body>
</html>
