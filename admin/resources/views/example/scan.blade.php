@extends('layouts.app-chat.app')
@section('content')
    <div class="card">
        <div class="card-body">
            <canvas id="qrcode" style="display:none"></canvas>
            <div id="state"> connecting... </div>
        </div>
    </div>
@endsection

@section('footer')
    @include('shared.footer')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
    <script>
        (function() {
            var BASE_SOCKET = "localhost:4000/agents"

            if (location.host == 'chatvolution.my.id') {
                BASE_SOCKET = 'node.chatvolution.my.id/agents'
            }

            // Disable socket connection
            // const socket = io(BASE_SOCKET, {autoConnect: true});
            var qr = new QRious({
                size: 500,
                element: document.getElementById('qrcode')
            });

            socket.on("wa:qr", (data) => {
                document.getElementById('qrcode').style.display = 'block'
                qr.set({
                    value: data
                })
                console.log(data)
            });


            socket.on("wa:ready", (data) => {
                if (data !== 'SCAN-QR') {
                    document.getElementById('qrcode').style.display = 'none'
                }

                document.getElementById('state').innerText = data
            });
        })();
    </script>
@endsection
