<!doctype html>
<html lang="en">

<head>

    <meta charset="utf-8" />
    <title>Login | Dashboard | Qchat | Qwords Chatting Platform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="Qwords Chatting Platform" name="description" />
    <meta content="Qwords Dev Team" name="author" />
    <link rel="shortcut icon" href="assets/images/favicon.ico">

    <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
    <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
    <link href="assets/css/custom.css" id="app-style" rel="stylesheet" type="text/css" />
    <script>
        window.base_url = '{{ env('BASE_URL') }}';
        window.base_url_live = '{{ env('BASE_URL_LIVE') }}';
        window.BASE_SOCKET = '{{ env('BASE_SOCKET') }}';
        window.BASE_SOCKET_V2 = '{{ env('BASE_SOCKET_V2') }}';
    </script>
    <script src="js/session.js"></script>
</head>

<body class="auth-body-bg">
    <div>
        <div class="container-fluid p-0">
            <div class="row no-gutters">
                <div class="col-lg-4">
                    <div class="authentication-page-content p-4 d-flex align-items-center min-vh-100">
                        <div class="w-100">
                            <div class="row justify-content-center">
                                <div class="col-lg-11">
                                    <div>
                                        <div class="text-center">
                                            <div>
                                                <img src="assets/images/logo-dark.png" height="38" alt="logo"
                                                    class="logo">
                                            </div>

                                            <h4 class="font-size-18 mt-2">Selamat datang</h4>
                                        </div>
                                        <div class="p-2 mt-5">
                                            <div class="alert" role="alert"></div>
                                            <form class="form-horizontal" id="btn-save" data-parsley-validate
                                                data-parsley-errors-messages-disabled>
                                                <div class="form-group mb-4">
                                                    <i class="fas fa-envelope auti-custom-input-icon"></i>
                                                    <label for="input_email">Email</label>
                                                    <input type="email" data-parsley-required class="form-control"
                                                        id="input_email" placeholder="Type your email">
                                                    <span class="text-danger" id="err_email"></span>
                                                </div>
                                                <div class="form-group mb-4">
                                                    <i class="fas fa-lock auti-custom-input-icon"></i>
                                                    <label for="password">Password</label>
                                                    <div class="input-group">
                                                        <input type="password" data-parsley-required
                                                            class="form-control" id="password"
                                                            placeholder="Type your password">
                                                        <div class="input-group-prepend">
                                                            <button type="button"
                                                                class="btn btn-tangerin rounded-right btn-is-show-password"
                                                                data-show="false" data-fieldname="password"
                                                                onclick="showHidePassword(this)">
                                                                <i class="fas fa-eye-slash is-show-password"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span class="text-danger" id="err_password"></span>
                                                </div>
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input"
                                                        id="customControlInline">
                                                    <label class="custom-control-label"
                                                        for="customControlInline">Remember me</label>
                                                </div>
                                                <div class="mt-4 text-center">
                                                    <button type="submit"
                                                        class="btn btn-tangerin btn-block w-md waves-effect waves-light btn-submit">
                                                        Masuk <i class="fas fa-sign-in-alt"></i>
                                                    </button>
                                                </div>
                                                <div class="mt-4 text-center">
                                                    <a href="/forgot-password" class="text-muted text-tangerin"><i
                                                            class="mdi mdi-lock mr-1"></i> Forgot Password?</a>
                                                </div>
                                                <div class="mt-2 text-center">
                                                    <p>Or</p>
                                                    <p>
                                                        don't have an account yet? <a href="/register"
                                                            class="font-weight-medium text-tangerin">
                                                            Join</a>
                                                    </p>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- <div class="mt-2 text-center ">
                                <a href="#" class="custom-text-secondary-active m-1 ">Bahasa Indonesia</a>
                                <a href="#" class="text-url-secondary m-1">English(US)</a>
                            </div> -->
                            <div class="mt-1 text-center">
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
    <script src="js/login.js"></script>

</body>

</html>
