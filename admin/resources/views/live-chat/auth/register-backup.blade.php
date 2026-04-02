<!doctype html>
<html lang="en">

    <head>
        <meta charset="utf-8" />
        <title>Register | Dashboard | Qchat | Qwords Chatting Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta content="Qwords Chatting Platform" name="description" />
        <meta content="Qwords Dev Team" name="author" />
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
            .form-group {
                margin-bottom: 0 !important;
            }

        </style>
        <link rel="shortcut icon" href="assets/images/favicon.ico">
        <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
        <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
        <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
        <link href="assets/css/custom.css" id="app-style" rel="stylesheet" type="text/css" />
        <link rel="stylesheet" href="{{ asset('/assets/libs/sweetalert2/sweetalert2.min.css') }}">
    </head>

    <body class="auth-body-bg">
        <input type="hidden" id="rsk" value="{{ $CAPTCHA_SITE_KEY }}">
        <input type="hidden" id="rseck" value="{{ $CAPTCHA_SECRET_KEY }}">
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
                                                <p class="text-muted">Elegant, mudah dan cepat dalam membantu anda
                                                    mempromosikan produk maupun jasa
                                                </p>
                                            </div>

                                            <div class="">
                                                <form class="form-horizontal" id="btn-save" data-parsley-validate
                                                    data-parsley-errors-messages-disabled>
                                                    <div class="form-group auth-form-group-custom mt-1">
                                                        <i class="far fa-id-card auti-custom-input-icon"></i>
                                                        <label for="name">Nama<span class="text-danger">*</span></label>
                                                        <input type="text" data-parsley-required class="form-control"
                                                            id="name" placeholder="Masukan nama anda">
                                                    </div>
                                                    <span class="text-danger" id="err_name">Nama wajib diisi!</span>

                                                    <div class="form-group auth-form-group-custom mt-1">
                                                        <i class="fas fa-envelope auti-custom-input-icon"></i>
                                                        <label for="email">Email<span
                                                                class="text-danger">*</span></label>
                                                        <input type="email" data-parsley-required class="form-control"
                                                            id="email" placeholder="Masukan email anda">
                                                    </div>
                                                    <div class="text-danger" id="err_email">Email wajib
                                                        diisi!</div>

                                                    <div class="form-group auth-form-group-custom mt-1">
                                                        <i class="fas fa-mobile auti-custom-input-icon"></i>
                                                        <label for="phone">No Handphone<span
                                                                class="text-danger">*</span></label>
                                                        <input data-parsley-required class="form-control" id="phone"
                                                            placeholder="Contoh: 08xxxxxx">
                                                    </div>
                                                    <div class="text-danger" id="err_phone">No handphone wajib diisi!
                                                    </div>

                                                    <div class="form-group auth-form-group-custom mt-1">
                                                        <i class="far fa-id-card auti-custom-input-icon"></i>
                                                        <label for="company_name">Nama Perusahaan<span
                                                                class="text-danger">*</span></label>
                                                        <input type="text" data-parsley-required class="form-control"
                                                            id="company_name"
                                                            placeholder="Masukan nama perusahaan anda">
                                                    </div>
                                                    <div class="text-danger" id="err_companyName">Nama perusahaan wajib
                                                        diisi!</div>

                                                    <div class="form-group auth-form-group-custom mt-1">
                                                        <i class="fas fa-lock auti-custom-input-icon"></i>
                                                        <label for="password">Kata Sandi<span
                                                                class="text-danger">*</span></label>
                                                        <input type="password" data-parsley-minlength="8"
                                                            data-parsley-uppercase="1" data-parsley-lowercase="1"
                                                            data-parsley-number="1" data-parsley-special="1"
                                                            data-parsley-required class="form-control" id="password"
                                                            placeholder="Masukan kata sandi anda">
                                                    </div>
                                                    <div class="text-danger" id="err_password"></div>

                                                    <div class="form-group auth-form-group-custom mt-1">
                                                        <i class="fas fa-lock auti-custom-input-icon"></i>
                                                        <label for="confirm_password">Konfirmasi Kata Sandi <span
                                                                class="text-danger">*</span></label>
                                                        <input type="password" data-parsley-required
                                                            data-parsley-equalto="#password" class="form-control"
                                                            id="confirm_password" placeholder="Masukan kata sandi anda">
                                                    </div>
                                                    <div class="text-danger" id="err_cpassword">konfirmasi kata sandi
                                                        berbeda!</div>
                                                    <div class="mt-1" id="reCAPTCHA" data-parsley-required></div>
                                                    <div class="text-danger" id="err_captcha">mohon ceklis reCAPTCHA!
                                                    </div>
                                                    <div class="mt-3 text-center">
                                                        <button
                                                            class="btn btn-primary btn-block w-md waves-effect waves-light btn-submit"
                                                            type="submit"> Gabung <i
                                                                class="fas fa-sign-in-alt"></i></button>
                                                    </div>
                                                    <div class="mt-2 text-center">
                                                        <p>
                                                            Sudah memiliki akun?
                                                            <a href="/login" class="font-weight-medium text-primary">
                                                                Masuk yu</a>
                                                        </p>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-8 d-none d-md-block">
                        <div class="register-bg ">
                            <div class="bg-overlay">
                                <div class="mt-2 text-center">
                                    <span class="custom-text-secondary-active m-1">Bahasa Indonesia</span>
                                    <a href="#" class="text-url-secondary m-1">English(US)</a>
                                </div>
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
        <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
        <script src="assets/js/app.js"></script>
        <script src="{{ asset('/assets/libs/parsleyjs/parsley.min.js') }}"></script>
        <script src="{{ asset('/assets/libs/sweetalert2/sweetalert2.min.js') }}"></script>
        <script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit" async defer>
        </script>
        <script src="{{ asset('/js/register.js') }}"></script>

    </body>

</html>
