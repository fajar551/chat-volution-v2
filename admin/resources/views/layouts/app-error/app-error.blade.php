<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title> {{ !empty($title) ? $title . ' | ' : '' }} Qwords Chatting Platform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="Qwords Chatting Platform" name="description" />
    <meta content="Qwords Dev Team" name="author" />
    <link rel="shortcut icon" href="/assets/images/favicon.ico">
    <link href="/assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
    <link href="/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="/assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
    <style>
        .btn-dark {
            color: #ffffff;
            background-color: #3f3d56;
            border-color: #3f3d56;
        }

        .btn-dark:hover {
            color: #ffffff;
            background-color: #302e3f;
            border-color: #302e3f;
        }
    </style>
</head>

<body>
    <div class="my-5 pt-5">
        @yield('content')
    </div>


    <!-- JAVASCRIPT -->
    {{-- <script src="{{asset('js/routing.js')}}"></script> --}}
    <script>
        window.base_url = '{{ env('BASE_URL') }}';
        window.base_url_live = '{{ env('BASE_URL_LIVE') }}';
        window.BASE_SOCKET = '{{ env('BASE_SOCKET') }}';
        window.BASE_SOCKET_V2 = '{{ env('BASE_SOCKET_V2') }}';
    </script>
    <script src="/assets/libs/jquery/jquery.min.js"></script>
    <script src="/assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="/assets/libs/metismenu/metisMenu.min.js"></script>
    <script src="/assets/libs/simplebar/simplebar.min.js"></script>
    <script src="/js/error/error.js"></script>
</body>

</html>
