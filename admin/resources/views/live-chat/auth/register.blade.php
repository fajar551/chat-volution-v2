<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>Register | Dashboard | Qchat | Qwords Chatting Platform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="Qwords Chatting Platform" name="description" />
    <meta content="Qwords Dev Team" name="author" />
    {{-- <script src="{{asset('js/routing.js')}}"></script> --}}
    <script>
        window.base_url = '{{ env('BASE_URL') }}';
        window.base_url_live = '{{ env('BASE_URL_LIVE') }}';
        window.BASE_SOCKET = '{{ env('BASE_SOCKET') }}';
        window.BASE_SOCKET_V2 = '{{ env('BASE_SOCKET_V2') }}';
    </script>
    <script>
        function Session() {
            if (['/register'].includes(location.pathname)) {
                var token = localStorage.getItem('tk')
                if (token != null) {
                    location.href = '/dashboard'
                }
            }
        }
        Session();
    </script>
    <style>
        .card-title-desc {
            margin-bottom: 0 !important;
        }

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
    <link rel="shortcut icon" href="assets/images/favicon.ico">
    <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
    <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" href="{{ asset('/assets/libs/intl-tel-input/build/css/intlTelInput.min.css') }}">
    <link href="assets/css/custom.css" id="app-style" rel="stylesheet" type="text/css" />
</head>

<body class="body-dark-light">
    <input type="hidden" id="rsk" value="{{ $CAPTCHA_SITE_KEY }}">
    <input type="hidden" id="rseck" value="{{ $CAPTCHA_SECRET_KEY }}">

    <div class="py-5">
        <div class="container">
            <div class="row justify-content-center ">
                <div class="col-12 col-md-12 col-lg-8">
                    <div class="card">
                        <div class="card-header bg-soft-tangerin-700">
                            <div class="text-center mb-3">
                                <img class="w-25" src="{{ asset('assets/images/logo-light.png') }}"
                                    alt="Qchat Social Management">
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="text-left">
                                <h3 class="card-title-desc">Join</h3>
                                <span class="text-muted">
                                    Join now, and enjoy the convenience of doing promotions in 1 platform with us.
                                </span>
                            </div>

                            <div class="mt-3">
                                <hr>
                                <form class="form-horizontal" id="btn-save" data-parsley-validate
                                    data-parsley-errors-messages-disabled>
                                    <div class="form-group mt-1">
                                        <i class="far fa-id-card auti-custom-input-icon"></i>
                                        <label for="name">Name<span class="text-danger">*</span></label>
                                        <input type="text" data-parsley-required class="form-control" id="name"
                                            placeholder="Type your name">
                                        <span class="text-danger" id="err_name">Name is required!</span>
                                    </div>

                                    <div class="form-group mt-1">
                                        <i class="fas fa-envelope auti-custom-input-icon"></i>
                                        <label for="email">Email<span class="text-danger">*</span></label>
                                        <input type="email" data-parsley-required class="form-control" id="email"
                                            placeholder="Type your email">
                                        <span class="text-danger" id="err_email">Email is required!</span>
                                    </div>

                                    <div class="form-group mt-1">
                                        <i class="fas fa-mobile auti-custom-input-icon"></i>
                                        <label for="phone">Phone Number<span class="text-danger">*</span></label><br>
                                        <input type="tel" required id="phone" class="form-control"><br>
                                        <span class="text-danger" id="err_phone">Phone Number is required!
                                        </span>
                                        <!-- <input type="tel" required id="mobile_number" class="form-control">
                                        <span class="text-danger" id="err_mobile_number">Phone Number is required!
                                        </span> -->
                                    </div>
                                    <div class="form-group mt-1">
                                        <i class="far fa-id-card auti-custom-input-icon"></i>
                                        <label for="company_name">Nama Perusahaan<span
                                                class="text-danger">*</span></label>
                                        <input type="text" data-parsley-required class="form-control"
                                            id="company_name" placeholder="Type your company name">
                                        <span class="text-danger" id="err_company_name">Company name is
                                            required!</span>
                                    </div>

                                    <div class="form-group mt-1">
                                        <i class="fas fa-lock auti-custom-input-icon"></i>
                                        <label for="password">Kata Sandi<span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="password" data-parsley-minlength="8"
                                                data-parsley-uppercase="1" data-parsley-lowercase="1"
                                                data-parsley-number="1" data-parsley-special="1" data-parsley-required
                                                class="form-control" id="password" placeholder="Type your password">
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

                                    <div class="form-group mt-1">
                                        <i class="fas fa-lock auti-custom-input-icon"></i>
                                        <label for="confirm_password">Confirm Password <span
                                                class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="password" data-parsley-required
                                                data-parsley-equalto="#password" class="form-control"
                                                id="confirm_password" placeholder="Retype your password">
                                            <div class="input-group-prepend">
                                                <button type="button"
                                                    class="btn btn-tangerin rounded-right btn-is-show-confirm_password"
                                                    data-show="false" data-fieldname="confirm_password"
                                                    onclick="showHidePassword(this)">
                                                    <i class="fas fa-eye-slash is-show-confirm_password"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <span class="text-danger" id="err_confirm_password">Confirm password not same
                                            with password!</span>
                                    </div>

                                    <div class="form-group">
                                        <div id="reCAPTCHA"
                                            style="transform: scale(0.77) !important;
                                            transform-origin: 0 0 !important;"
                                            data-parsley-required></div>
                                    </div>
                                    <div class="text-danger" id="err_captcha">Check reCAPTCHA!
                                    </div>

                                    <div class="mt-3 text-center">
                                        <button
                                            class="btn btn-tangerin btn-block w-md waves-effect waves-light btn-submit"
                                            type="submit"> Join <i class="fas fa-sign-in-alt"></i></button>
                                    </div>
                                    <div class="mt-3 text-center">
                                        <p>
                                            You have account?
                                            <a href="/login" class="font-weight-medium text-tangerin">
                                                Come on login</a>
                                        </p>
                                    </div>
                                </form>
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
        </div>
    </div>


    <script src="assets/libs/jquery/jquery.min.js"></script>
    <script src="assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="assets/libs/metismenu/metisMenu.min.js"></script>
    <script src="assets/libs/simplebar/simplebar.min.js"></script>
    <script src="assets/libs/node-waves/waves.min.js"></script>
    <script src="{{ asset('/assets/libs/intl-tel-input/build/js/intlTelInput.min.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
    <script src="assets/js/app.js"></script>
    <script src="{{ asset('/assets/libs/parsleyjs/parsley.min.js') }}"></script>
    <script src="{{ asset('/assets/libs/sweetalert2/sweetalert2.min.js') }}"></script>
    <script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit" async defer></script>
    <script src="{{ asset('/js/register.js') }}"></script>

</body>

</html>
