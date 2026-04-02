<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>{{ $title }} | Qchat | Qwords Chatting Platform</title>
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
            const url = location.pathname.split('/');
            if (['account'].includes(url[1])) {
                var token = localStorage.getItem('tk')
                if (Boolean(token)) {
                    location.href = '/home'
                }
            }

            if (['verify'].includes(url[1])) {
                var userReg = !localStorage.getItem("userReg") ? null : JSON.parse(localStorage.getItem("userReg"));
                var token = localStorage.getItem('tk')
                if (Boolean(token)) {
                    location.href = '/home'
                } else {
                    if (userReg == null) {
                        location.replace('/login')
                    }
                }
            } else if (['reset-password'].includes(url[1])) {
                var token = localStorage.getItem('tk')
                if (Boolean(token)) {
                    location.href = '/home'
                }
            }
        }
        Session();
    </script>
    <link rel="shortcut icon" href="{{ asset('assets/images/favicon.ico') }}">
    <link href="{{ asset('assets/css/bootstrap.min.css') }}" id="bootstrap-style" rel="stylesheet" type="text/css" />
    <link href="{{ asset('assets/css/icons.min.css') }}" rel="stylesheet" type="text/css" />
    <link href="{{ asset('assets/css/app.min.css') }}" id="app-style" rel="stylesheet" type="text/css" />
    <link href="{{ asset('assets/css/custom.css') }}" id="app-style" rel="stylesheet" type="text/css" />
    @if (!empty($css))
        @foreach ($css as $value)
            <link rel="stylesheet" type="text/css" href="{{ asset($value) }}" />
        @endforeach
    @endif
</head>

<body class="body-dark-light">
    <div class="py-5">
        @yield('content')
    </div>
    <script src="{{ asset('assets/libs/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('assets/libs/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('assets/libs/metismenu/metisMenu.min.js') }}"></script>
    <script src="{{ asset('assets/libs/node-waves/waves.min.js') }}"></script>
    <script src="{{ asset('assets/js/app.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
    @if (!empty($js))
        @foreach ($js as $value)
            <script src="{{ asset($value) }}"></script>
        @endforeach
    @endif

</body>

</html>
