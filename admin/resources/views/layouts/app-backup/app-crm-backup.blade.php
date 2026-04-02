<!doctype html>
<html lang="en">

    <head>

        <meta charset="utf-8" />
        <title> {{ !empty($title) ? $title . ' | ':'' }}  Qwords CRM Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta content="Qwords Chatting Platform" name="description" />
        <meta content="Qwords Dev Team" name="author" />
        <!-- App favicon -->
        <link rel="shortcut icon" href="/assets/images/favicon.ico">

        <!-- Bootstrap Css -->
        <link href="/assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
        <!-- Icons Css -->
        <link href="/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
        <!-- App Css-->
        <link href="/assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />

        <!-- twitter-bootstrap-wizard css -->
        <link rel="stylesheet" href="/assets/libs/twitter-bootstrap-wizard/prettify.css">

        <!-- Responsive datatable examples -->
        <link rel="stylesheet" href="https://cdn.datatables.net/1.11.3/css/dataTables.bootstrap4.min.css">

        {{-- select 2 --}}
        <link rel="stylesheet" href="/assets/libs/select2/css/select2.min.css">

        <!-- Custom Css-->
        <link href="/assets/css/custom.css" rel="stylesheet" type="text/css" />
        <link href="/assets/css/spinner.css" rel="stylesheet" type="text/css" />
        @if (!empty($css))
            @foreach ($css as $value)
                <link rel="stylesheet" type="text/css"  href="{{ asset($value) }}"/>
            @endforeach
        @endif

        <style>
            .page-loader {
                width:100%;
                height:100%;
                position:fixed;
                background:#252b3b;
                top: 0;
                left: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .custom-switch.custom-switch-md .custom-control-label {
                padding-left: 1rem;
                padding-top: 0.3rem;
            }

            .custom-switch.custom-switch-md .custom-control-label::before {
                height: 1.5rem;
                width: calc(2rem + 0.75rem);
                border-radius: 3rem;
                color: #fff;
                border-color: #252b3b;
                background-color: #252b3b;
            }

            .custom-switch.custom-switch-md .custom-control-label::after {
                width: calc(1.5rem - 4px);
                height: calc(1.5rem - 4px);
                border-radius: calc(2rem - (1.5rem / 2));
            }

            .custom-switch.custom-switch-md .custom-control-input:checked ~ .custom-control-label::after {
                transform: translateX(calc(1.5rem - 0.25rem));
            }

        </style>
        @isset($guest)
        <style>
            .main-content {
                margin-left: auto;
            }
        </style>
        @endisset
        <!-- Vue -->
        <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
        @yield('header')
    </head>

    <body data-sidebar="dark">

        <!-- Begin page -->
        <div id="layout-wrapper">
            @empty($guest)
            <header id="page-topbar">
                <div class="navbar-header">
                    <div class="d-flex">
                        <!-- LOGO -->
                        <div class="navbar-brand-box">
                            <a href="index.html" class="logo logo-dark">
                                <span class="logo-sm">
                                    <img src="/assets/images/logo-sm-dark.png" alt="" height="22">
                                </span>
                                <span class="logo-lg">
                                    <img src="/assets/images/logo-dark.png" alt="" height="32">
                                </span>
                            </a>

                            <a href="index.html" class="logo logo-light">
                                <span class="logo-sm">
                                    <img src="/assets/images/logo-sm-light.png" alt="" height="22">
                                </span>
                                <span class="logo-lg">
                                    <img src="/assets/images/logo-light.png" alt="" height="32">
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
                                            <img src="/assets/images/users/avatar-3.jpg"
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
                                            <img src="/assets/images/users/avatar-4.jpg"
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
                                <img class="rounded-circle header-profile-user" src="/assets/images/users/avatar-2.jpg"
                                    alt="Header Avatar">
                                <span class="d-none d-xl-inline-block ml-1" id="display_agent_name_header"></span>
                                <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-right">
                                <!-- item-->
                                <a class="dropdown-item" href="#"><i class="ri-user-line align-middle mr-1"></i> Profile</a>
                                <a class="dropdown-item" href="#"><i class="ri-shield-line align-middle mr-1"></i> Security</a>
                                <a class="dropdown-item" href="#"><i class="ri-refresh-line align-middle mr-1"></i> Switch Organization</a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="ri-shut-down-line align-middle mr-1 text-danger"></i> Logout</a>
                            </div>
                        </div>

                    </div>
                </div>
            </header>

            <!-- ========== Left Sidebar Start ========== -->
            <div class="vertical-menu">

                <div data-simplebar class="h-100">

                    <!--- Sidemenu -->
                    <div id="sidebar-menu">
                        <!-- Left Menu Start -->
                        <ul class="metismenu list-unstyled" id="side-menu">
                            <li class="menu-title">Menu</li>
                            <li>
                                <a href="/crm" class="waves-effect">
                                    <i class="fas fa-igloo"></i>
                                    <span>Home</span>
                                </a>
                            </li>
                            <li>
                                <a href="/crm-accounts" class="waves-effect">
                                    <i class="fas fa-city"></i>
                                    <span>Accounts</span>
                                </a>
                            </li>
                            <li>
                                <a href="/crm-contacts" class="waves-effect">
                                    <i class="fas fa-id-card"></i>
                                    <span>Contacts</span>
                                </a>
                            </li>
                            <li>
                                <a href="/crm-leads" class="waves-effect">
                                    <i class="fas fa-user-tie"></i>
                                    <span>Leads</span>
                                </a>
                            </li>
                            <li>
                                <a href="/crm-opportunities" class="waves-effect">
                                    <i class="fas fa-handshake"></i>
                                    <span>Opportunities</span>
                                </a>
                            </li>
                            <li>
                                <a href="javascript: void(0);" class="has-arrow waves-effect">
                                    <i class="fas fa-tools"></i>
                                    <span>Tools</span>
                                </a>
                                <ul class="sub-menu" aria-expanded="false">
                                    <li>
                                        <a href="/crm-tasks">
                                            <i class="fas fa-tasks"></i>
                                            Tasks
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/crm-calendar">
                                            <i class="fas fa-calendar-alt"></i>
                                            Calendar
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/crm-notes">
                                            <i class="fas fa-sticky-note"></i>
                                            Notes
                                        </a>
                                    </li>
                                    <li>
                                        <a href="live-chat.html">
                                            <i class="fas fa-bullhorn"></i>
                                            Reports
                                        </a>
                                    </li>
                                    <li>
                                        <a href="live-chat.html">
                                            <i class="fas fa-folder-open"></i>
                                            Files
                                        </a>
                                    </li>
                                    <li>
                                        <a href="live-chat.html">
                                            <i class="fas fa-mail-bulk"></i>
                                            List Emails
                                        </a>
                                    </li>
                                    <li>
                                        <a href="live-chat.html">
                                            <i class="fas fa-quote-right"></i>
                                            Quotes
                                        </a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <a href="javascript:void(0)" onclick="redirectLc()" class="waves-effect">
                                    <i class="fas fa-external-link-alt"></i>
                                    <span>Live Chat</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <!-- Sidebar -->
                </div>
            </div>
            <!-- Left Sidebar End -->
            @endempty
            <!-- ============================================================== -->
            <!-- Start right Content here -->
            <!-- ============================================================== -->
            <div class="main-content">

                <div class="page-content">
                    @yield('content')
                </div>
                <!-- End Page-content -->

                @empty($guest)
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
                @endempty
            </div>
            <!-- end main content-->

        </div>
        <!-- END layout-wrapper -->

        @empty($guest)
            <!-- Page loader -->
            <div class="page-loader">
                <div class="lds-dual-ring"></div>
            </div>
        @endempty

        <!-- JAVASCRIPT -->
        <script src="/assets/libs/jquery/jquery.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="/assets/libs/metismenu/metisMenu.min.js"></script>
        <script src="/assets/libs/simplebar/simplebar.min.js"></script>

        {{-- parsley validation --}}
        <script src="/assets/libs/parsleyjs/dist/parsley.min.js"></script>

        {{-- waves library --}}
        <script src="/assets/libs/node-waves/waves.min.js"></script>
        {{-- app template --}}
        <script src="/assets/js/app.js"></script>
        {{-- bootstrap --}}
        <script src="/assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>

        <!-- twitter-bootstrap-wizard js -->
        <script src="/assets/libs/twitter-bootstrap-wizard/jquery.bootstrap.wizard.min.js"></script>
        <script src="/assets/libs/twitter-bootstrap-wizard/prettify.js"></script>

        {{-- datatables --}}
        <script src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.min.js"></script>
        <script src="https://cdn.datatables.net/1.11.3/js/dataTables.bootstrap4.min.js"></script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
        <script src="https://cdn.socket.io/3.1.3/socket.io.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
        <script src="{{ asset('/assets/libs/select2/js/select2.full.min.js') }}"></script>
        {{-- form wizard init --}}
        <!-- <script src="/assets/js/pages/form-wizard.init.js"></script> -->

        <script>
            $(document).ready(function() {
                $(".select2-multiple").select2({
                    multiple: true,
                });
            });

            function redirectLc() {
                location.replace("/dashboard")
            }
        </script>

        @if (!empty($js))
            @foreach ($js as $value)
                <script src="{{ asset($value) }}"></script>
            @endforeach
        @endif

        @empty($guest)
        <script src="js/session.js"></script>
        @endempty

        @yield('footer')
    </body>
</html>
