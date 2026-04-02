<!doctype html>
<html lang="en">

    <head>
        
        <meta charset="utf-8" />
        <title>Subscription | Qchat | Qwords Chatting Platform</title>
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
                                    <h4 class="mb-0">Subscription</h4>
                                </div>
                            </div>
                        </div>
                        <!-- end page title -->

                        <div class="row">
                            <div class="col-md-12">
                                <div class="text-center mb-5">
                                    <h3 class="mb-4">Select Your Tier</h3>
                                    <ul class="nav nav-pills pricing-nav-tabs">
                                        <li class="nav-item">
                                            <a class="nav-link active" href="#">Pay Monthly</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" href="#">Pay Annually <span class="badge badge-success p-2 ml-2">Save 17%</span></a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <!-- end row -->

                        <div class="row">
                            <div class="col-xl-3 col-sm-6">
                                <div class="card pricing-box">
                                    <div class="card-body p-4">
                                        <div class="text-center">
                                            <h3 class="font-weight-bold mt-4">Silver</h3>
                                            <p class="text-muted">For Power Users & Solopreneurs</p>
                                            <div class="font-size-14 mt-4 pt-2">
                                                <ul class="list-unstyled plan-features">
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Unlimited Cases</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Unlimited MAU</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>5 Agents</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>3 Channels</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>2 Topics</li>
                                                </ul>
                                            </div>

                                            <div class="mt-5">
                                                <h1 class="font-weight-bold mb-1"><sup class="mr-1"><small>Rp</small></sup>250.000</h1>
                                                <p class="text-muted">Per month</p>
                                                <p class="font-weight-bold mt-2">*Price not including LINE Push API</p>
                                            </div>
                                            <hr>
                                            <div class="mt-2">
                                                <div class="form-group">
                                                    <label>Additional item</label>
                                                    <h6><span class="ri-whatsapp-line text-success mr-2"></span>Whatsapp Price</h6>
                                                    <p>+ IDR 500.000/month</p>
                                                </div>
                                            </div>
                                            <div class="mt-5 mb-3">
                                                <a href="payment-method.html" class="btn btn-primary w-md">Start Free Trial 14 days</a>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div class="col-xl-3 col-sm-6">
                                <div class="card pricing-box">
                                    <div class="card-body p-4">
                                        <div class="text-center">
                                            <h3 class="font-weight-bold mt-4">Gold</h3>
                                            <p class="text-muted">For Startups & Growing Businesses</p>
                                            <div class="font-size-14 mt-4 pt-2">
                                                <ul class="list-unstyled plan-features">
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Unlimited Cases</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Unlimited MAU</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>7 Agents</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>8 Channels</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>5 Topics</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Auto Responder</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Office Hours</li>
                                                </ul>
                                            </div>

                                            <div class="mt-5">
                                                <h1 class="font-weight-bold mb-1"><sup class="mr-1"><small>Rp</small></sup>250.000</h1>
                                                <p class="text-muted">Per month</p>
                                                <p class="font-weight-bold mt-2">*Price not including LINE Push API</p>
                                            </div>
                                            <hr>
                                            <div class="mt-2">
                                                <div class="form-group">
                                                    <label>Additional item</label>
                                                    <h6><span class="ri-whatsapp-line text-success mr-2"></span>Whatsapp Price</h6>
                                                    <p>+ IDR 750.000/month</p>
                                                </div>
                                            </div>
                                            <div class="mt-5 mb-3">
                                                <a href="payment-method.html" class="btn btn-primary w-md">Start Free Trial 14 days</a>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div class="col-xl-3 col-sm-6">
                                <div class="card pricing-box">
                                    <div class="card-body p-4">
                                        <div class="text-center">
                                            <h3 class="font-weight-bold mt-4">Diamond</h3>
                                            <p class="text-muted">For Large Scale Businesses</p>
                                            <div class="font-size-14 mt-4 pt-2">
                                                <ul class="list-unstyled plan-features">
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Unlimited Cases</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Unlimited MAU</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>10 Agents</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>15 Channels</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>10 Topics</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Auto Responder</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Office Hours</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>White label</li>
                                                </ul>
                                            </div>

                                            <div class="mt-5">
                                                <h1 class="font-weight-bold mb-1"><sup class="mr-1"><small>Rp</small></sup>250.000</h1>
                                                <p class="text-muted">Per month</p>
                                                <p class="font-weight-bold mt-2">*Price not including LINE Push API</p>
                                            </div>
                                            <hr>
                                            <div class="mt-2">
                                                <div class="form-group">
                                                    <label>Additional item</label>
                                                    <h6><span class="ri-whatsapp-line text-success mr-2"></span>Whatsapp Price</h6>
                                                    <p>+ IDR 2.000.000/month</p>
                                                </div>
                                            </div>
                                            <div class="mt-5 mb-3">
                                                <a href="payment-method.html" class="btn btn-primary w-md">Start Free Trial 14 days</a>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div class="col-xl-3 col-sm-6">
                                <div class="card pricing-box">
                                    <div class="card-body p-4">
                                        <div class="text-center">
                                            <h3 class="font-weight-bold mt-4">Corporate</h3>
                                            <p class="text-muted">For More Usage and Features</p>
                                            <div class="font-size-14 mt-4 pt-2">
                                                <ul class="list-unstyled plan-features">
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Official WhatsApp Business API</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Dedicated Premuim Support and Account Manager</li>
                                                    <li><span class="ri-checkbox-circle-fill text-success mr-2"></span>Premium Features</li>
                                                </ul>
                                            </div>

                                            <div class="mt-5">
                                                <h1 class="font-weight-bold mb-1"><sup class="mr-1">Contact Us</h1>
                                            </div>
                                            <hr>
                                            <div class="mt-5 mb-3">
                                                <a href="payment-method.html" class="btn btn-primary w-md">sales@taptalk.io</a>
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
