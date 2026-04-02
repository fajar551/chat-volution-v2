<!doctype html>
<html lang="en">

<head>

    <meta charset="utf-8" />
    <title>{{ __('auth.page_title.forgot_password') }} | Dashboard | Qchat | Qwords Chatting Platform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="Qwords Chatting Platform" name="description" />
    <meta content="Qwords Dev Team" name="author" />
    <link rel="shortcut icon" href="assets/images/favicon.ico">

    <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
    <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
    <link href="assets/css/custom.css" id="app-style" rel="stylesheet" type="text/css" />
    {{-- <script src="{{asset('js/routing.js')}}"></script> --}}
    <script>
        window.base_url = '{{ env('BASE_URL') }}';
        window.base_url_live = '{{ env('BASE_URL_LIVE') }}';
        window.BASE_SOCKET = '{{ env('BASE_SOCKET') }}';
        window.BASE_SOCKET_V2 = '{{ env('BASE_SOCKET_V2') }}';
    </script>
    <style>
        @media (max-width: 992px) {
            .sm-hide {
                display: none !important;
                visibility: hidden !important;
            }
        }

        @media (min-width: 992px) {
            .lg-hide {
                display: none !important;
                visibility: hidden !important;
            }
        }
    </style>
</head>

<body class="auth-body-bg">
    <div>
        <div class="container-fluid p-0">
            <div class="row no-gutters">
                <div class="col-lg-4">
                    <div class="authentication-page-content p-2 d-flex align-items-center min-vh-100">
                        <div class="w-100">
                            <div class="row justify-content-center">
                                <div class="col-lg-10">
                                    <div>
                                        <div class="text-center">
                                            <div>
                                                <img src="assets/images/logo-dark.png" height="38" alt="logo"
                                                    class="logo">
                                            </div>

                                            <h4 class="font-size-18 mt-2">{{ __('auth.label.forgot_password') }}</h4>

                                        </div>
                                        <div class="alert" role="alert"></div>

                                        <div class="form-forgot">
                                            <form class="form-horizontal form-input-forgot" id="btn-save"
                                                data-parsley-validate data-parsley-errors-messages-disabled></form>
                                        </div>
                                        <div class="notify-email text-center"></div>
                                    </div>
                                </div>
                                <div class="mt-3 text-center specialBottomForm"></div>
                            </div>
                            <!-- <div class="mt-2 text-center ">
                                <a href="#" class="custom-text-secondary-active m-1 ">Bahasa Indonesia</a>
                                <a href="#" class="text-url-secondary m-1">English(US)</a>
                            </div> -->
                            <div class="mt-5 text-center">
                                <p>© 2022 Qchat. Crafted with <i class="mdi mdi-heart text-danger"></i>
                                    by PT. Qwords Company International</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-8 d-none d-md-block">
                    <div class="authentication-bg">
                        <div class="bg-overlay"></div>
                    </div>
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
    <script src="assets/js/app.js"></script>
    <script src="{{ asset('/assets/libs/parsleyjs/parsley.min.js') }}"></script>
    <script src="{{ asset('/assets/libs/sweetalert2/sweetalert2.min.js') }}"></script>
    <script src="js/forgot-password.js"></script>

</body>

</html>
