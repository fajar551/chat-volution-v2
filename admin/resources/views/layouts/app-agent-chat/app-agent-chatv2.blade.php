<!doctype html>
<html lang="en">

<head>

    <meta charset="utf-8" />
    <title> {{ !empty($title) ? $title . ' | ' : '' }} Qwords Chatting Platform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="Chatvolution" name="description" />
    <meta content="Qwords" name="author" />
    <!-- App favicon -->
    <link rel="shortcut icon" href="/assets/images/favicon.ico">

    <link href="/assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
    <link href="/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="https://releases.transloadit.com/uppy/v2.6.0/uppy.min.css" rel="stylesheet">
    <link href="/assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
    <link href="/assets/css/custom.css" id="app-style" rel="stylesheet" type="text/css" />
    <link href="/assets/css/spinner.css" rel="stylesheet" type="text/css" />

    @if (!empty($css))
        @foreach ($css as $value)
            <link rel="stylesheet" type="text/css" href="{{ asset($value) }}" />
        @endforeach
    @endif

    {{-- <script src="{{asset('js/routing.js')}}"></script> --}}
    <script>
        window.base_url = '{{ env('BASE_URL') }}';
        window.base_url_live = '{{ env('BASE_URL_LIVE') }}';
        window.BASE_SOCKET = '{{ env('BASE_SOCKET') }}';
        window.BASE_SOCKET_V2 = '{{ env('BASE_SOCKET_V2') }}';
    </script>
    <script src="https://releases.transloadit.com/uppy/v2.6.0/uppy.min.js"></script>

    @yield('header')
</head>

<body>
    @yield('content')
    <!-- <div id="layout-wrapper">
    </div> -->

    @empty($guest)
        <div class="page-loader">
            <div class="lds-dual-ring"></div>
        </div>
    @endempty

    <script src="/assets/libs/jquery/jquery.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="/assets/libs/metismenu/metisMenu.min.js"></script>

    <script src="/assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>

    <script src="/assets/libs/node-waves/waves.min.js"></script>
    <script src="/assets/libs/simplebar/simplebar.min.js"></script>

    <script src="{{ url('assets/js/app.js') }}"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
    {{-- <script src="https://cdn.socket.io/3.1.3/socket.io.min.js"></script> --}}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>

    @if (!empty($js))
        @foreach ($js as $value)
            <script src="{{ asset($value) }}"></script>
        @endforeach
    @endif

    @empty($guest)
        <script src="{{ url('js/session.js') }}"></script>
    @endempty
</body>

</html>
