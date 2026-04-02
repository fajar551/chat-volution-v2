<!doctype html>
<html lang="en">

<head>

    <meta charset="utf-8" />
    <title> Qwords Chatting Platform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="Qwords Chatting Platform" name="description" />
    <meta content="Qwords Dev Team" name="author" />

    <link rel="shortcut icon" id="favicon" href="/assets/images/favicon.ico">

    <link href="/assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
    <link href="/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="https://releases.transloadit.com/uppy/v2.6.0/uppy.min.css" rel="stylesheet">
    <link href="/assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
    <link href="/assets/css/custom.css" rel="stylesheet" type="text/css" />
    <link href="/assets/css/spinner.css" rel="stylesheet" type="text/css" />
    <link href="/assets/libs/simplebar/src/simplebar.css" />

    @if (!empty($css))
        @foreach ($css as $value)
            <link rel="stylesheet" type="text/css" href="{{ asset($value) }}" />
        @endforeach
    @endif
    <script>
        window.base_url = '{{ env('BASE_URL') }}';
        window.base_url_live = '{{ env('BASE_URL_LIVE') }}';
        window.BASE_SOCKET = '{{ env('BASE_SOCKET') }}';
        window.BASE_SOCKET_V2 = '{{ env('BASE_SOCKET_V2') }}';
    </script>
    {{-- <script src="{{ asset('js/routing.js') }}"></script> --}}
    <script src="https://releases.transloadit.com/uppy/v2.6.0/uppy.min.js"></script>

    @yield('header')
</head>

<body>
    <input value="{{ $title }}" id="title-browser-tag" type="hidden">
    @yield('content')

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
    <script src="/assets/libs/metismenu/metisMenu.min.js"></script>
    <script src="/assets/libs/simplebar/dist/simplebar.js"></script>
    <!-- <script src="/assets/libs/simplebar/simplebar.min.js"></script> -->

    <script src="{{ url('assets/js/app2.js') }}"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
    {{-- <script src="https://cdn.socket.io/3.1.3/socket.io.min.js"></script> --}}
    {{-- <script src="{{ url('assets/libs/socket.io/client-dist/socket.io.min.js') }}"></script> --}}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    @if (!empty($js))
        @foreach ($js as $value)
            <script src="{{ asset($value) }}"></script>
        @endforeach
    @endif

    @include('layouts.firebase-setup.firebase-setup')

    <script type="module" defer>
        import {
            EmojiButton
        } from 'https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@4.6.0';


        const picker = new EmojiButton({
            autoHide: false,
            showVariants: true,
            showCategoryButtons: true,
            showRecents: true,
            showSearch: false,
            showPreview: false,
            position: "top-start",
            emojiSize: '18px',
            emojisPerRow: 8,
            rows: 6,
            showVariants: false,
            styleProperties: {
                "--category-button-active-color": "#ff9721"
            }
        });

        /* emoji */
        let elBtnShowEmoji = document.querySelector(".btn-emoji");
        elBtnShowEmoji.addEventListener("click", () => {
            picker.togglePicker(elBtnShowEmoji);
        });

        picker.on('emoji', selection => {
            emojiValue = selection.emoji;
            pushMessageEmoji()
        });
    </script>

    @empty($guest)
        <script src="{{ url('js/session.js') }}"></script>
    @endempty
</body>

</html>
