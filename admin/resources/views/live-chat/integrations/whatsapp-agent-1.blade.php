@extends('layouts.app-chat.app')
@section('content')
    <style>
        /* Force hide page loader */
        .page-loader {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        .lds-dual-ring {
            display: none !important;
        }
    </style>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 mb-3">
                <div class="page-title-box d-flex align-items-center justify-content-between" style="padding-bottom: 5px;">
                    <h4 class="mb-0">Integration Whatsapp For Agent Qwords</h4>
                </div>
            </div>
        </div>

        <!-- WhatsApp Integration Card -->
        <div class="row justify-content-center">
            <div class="col-8 col-md-8 col-lg-8" id="iCardWA">
                <!-- WhatsApp Disconnected Card -->
                <div class="card" id="disconnectedCard" style="display: none;">
                    <div class="card-header bg-soft-tangerin-500">
                        <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                            Whatsapp Disconnected
                        </h2>
                    </div>
                    <div class="card-body border border-white">
                        <div class="text-center">
                            <img class="w-20 img-fluid" src="{{ asset('assets/images/illustration/il-canceled.svg') }}"
                                alt="Qchat Social Management">
                            <p class="mt-2 font-size-15 text-dark-soft">
                                Your Whatsapp account not connected with system <b>Chatvolution</b>
                            </p>
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        <button
                            class="btn btn-tangerin waves-effect waves-light btn-block w-50 font-weight-bold btn-connect"
                            onClick="showFormConnect()">
                            <i class="fas fa-link mr-1"></i> Connect
                        </button>
                    </div>
                </div>

                <!-- WhatsApp Connected Card -->
                <div class="card" id="connectedCard" style="display: none;">
                    <div class="card-header bg-soft-tangerin-500">
                        <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                            Whatsapp Connected
                        </h2>
                    </div>
                    <div class="card-body border border-white">
                        <div class="text-center">
                            <img class="w-20 img-fluid" src="{{ asset('assets/images/illustration/il-girlcer-dark.svg') }}"
                                alt="Qchat Social Management">
                            <p class="mt-2 font-size-15 text-dark-soft">
                                Your Whatsapp connected with system Chatvolution.
                            </p>
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        <button
                            class="btn btn-danger waves-effect waves-light btn-block w-50 font-weight-bold btn-disconnect"
                            onclick="disconectWa()">
                            <i class="fas fa-power-off mr-1"></i> Disconnect
                        </button>
                    </div>
                </div>

                <!-- QR Code Card -->
                <div class="card" id="qrCard" style="display: none;">
                    <div class="card-header bg-soft-tangerin-500">
                        <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                            Scan QR Code
                        </h2>
                    </div>
                    <div class="card-body border border-white">
                        <div class="text-center">
                            <div id="qrCodeContainer">
                                <img id="qrCodeImage" src="" alt="QR Code" style="max-width: 300px;">
                                <p class="mt-2 font-size-15 text-dark-soft">
                                    Use your WhatsApp mobile app to scan this QR code
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        <button class="btn btn-secondary waves-effect waves-light btn-block w-50 font-weight-bold"
                            onclick="backFirstStep()">
                            <i class="fas fa-arrow-left mr-1"></i> Back
                        </button>
                    </div>
                </div>

                <!-- Loading Card -->
                <div class="card" id="loadingCard">
                    <div class="card-header bg-soft-tangerin-500">
                        <h2 class="card-title text-center text-white font-size-24 font-weight-bold">
                            WhatsApp Interface
                        </h2>
                    </div>
                    <div class="card-body border border-white">
                        <div class="text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2 font-size-15 text-dark-soft">
                                Connecting to WhatsApp ...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <script>
        // WhatsApp Agent 1: Socket ke waserverlive (sama seperti scan.html), fallback polling
        console.log('WhatsApp Agent 1: Socket + polling fallback');
        console.log('BASE_URL:', window.base_url);

        // Hide page loader immediately with multiple approaches
        function hideLoader() {
            // Method 1: jQuery
            if (typeof $ !== 'undefined') {
                $(".page-loader").fadeOut(100);
            }

            // Method 2: Vanilla JS
            const loader = document.querySelector('.page-loader');
            if (loader) {
                loader.style.display = 'none';
            }

            // Method 3: Force hide with CSS
            const style = document.createElement('style');
            style.innerHTML = '.page-loader { display: none !important; }';
            document.head.appendChild(style);
        }

        // Try multiple times to ensure loader is hidden
        hideLoader();
        setTimeout(hideLoader, 100);
        setTimeout(hideLoader, 500);
        setTimeout(hideLoader, 1000);

        // Also try when DOM is ready
        document.addEventListener('DOMContentLoaded', hideLoader);

        // WhatsApp Socket Integration
        document.addEventListener('DOMContentLoaded', function() {
            const WA1_BASE = 'https://waserverlive.genio.id/wa1';
            const WA1_SOCKET_URL = 'https://waserverlive.genio.id';
            const loadingCard = document.getElementById('loadingCard');
            const disconnectedCard = document.getElementById('disconnectedCard');
            const connectedCard = document.getElementById('connectedCard');
            const qrCard = document.getElementById('qrCard');
            const qrCodeImage = document.getElementById('qrCodeImage');
            let qrPollingInterval;
            let statusPollingInterval;
            let wa1Socket = null;

            // Inisialisasi: cek status via REST
            console.log('WhatsApp Agent 1: checking status...');
            checkWhatsAppStatus();

            // Function to show specific card
            function showCard(cardType) {
                // Hide all cards
                loadingCard.style.display = 'none';
                disconnectedCard.style.display = 'none';
                connectedCard.style.display = 'none';
                qrCard.style.display = 'none';

                // Show specific card
                switch (cardType) {
                    case 'loading':
                        loadingCard.style.display = 'block';
                        break;
                    case 'disconnected':
                        disconnectedCard.style.display = 'block';
                        break;
                    case 'connected':
                        connectedCard.style.display = 'block';
                        break;
                    case 'qr':
                        qrCard.style.display = 'block';
                        break;
                }
            }

            // Function to show form connect (same as WhatsApp Relabs)
            window.showFormConnect = function() {
                console.log('Initiating WhatsApp connection...');
                // Show loading state
                const connectBtn = document.querySelector('.btn-connect');
                if (connectBtn) {
                    connectBtn.innerHTML =
                        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
                    connectBtn.disabled = true;
                }

                fetch(WA1_BASE + '/init', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('WhatsApp init response:', data);
                        if (data.success) {
                            console.log('WhatsApp initialization started');
                            showCard('loading');
                            connectWa1Socket();
                        } else {
                            console.error('Failed to initialize WhatsApp:', data.message);
                            showCard('disconnected');
                            // Reset button
                            if (connectBtn) {
                                connectBtn.innerHTML = '<i class="fas fa-link mr-1"></i> Connect';
                                connectBtn.disabled = false;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error initializing WhatsApp:', error);
                        showCard('disconnected');
                        // Reset button
                        if (connectBtn) {
                            connectBtn.innerHTML = '<i class="fas fa-link mr-1"></i> Connect';
                            connectBtn.disabled = false;
                        }
                    });
            };

            // Function to disconnect WhatsApp (same as WhatsApp Relabs)
            window.disconectWa = function() {
                console.log('Disconnecting WhatsApp...');
                // Show loading state
                const disconnectBtn = document.querySelector('.btn-disconnect');
                if (disconnectBtn) {
                    disconnectBtn.innerHTML =
                        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
                    disconnectBtn.disabled = true;
                }

                // Disconnect WhatsApp via HTTP request
                fetch(WA1_BASE + '/logout', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('WhatsApp disconnect response:', data);
                        if (data.success) {
                            console.log('WhatsApp disconnected successfully');
                            showCard('disconnected');
                            // Reset button
                            if (disconnectBtn) {
                                disconnectBtn.innerHTML =
                                    '<i class="fas fa-power-off mr-1"></i> Disconnect';
                                disconnectBtn.disabled = false;
                            }
                            // Show success toast
                            if (typeof Swal !== 'undefined') {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Disconnect Success',
                                    text: 'WhatsApp disconnected successfully',
                                    toast: true,
                                    position: 'top-end',
                                    showConfirmButton: false,
                                    timer: 3000
                                });
                            }
                        } else {
                            console.error('Failed to disconnect WhatsApp:', data.message);
                            showCard('connected');
                            // Reset button
                            if (disconnectBtn) {
                                disconnectBtn.innerHTML =
                                    '<i class="fas fa-power-off mr-1"></i> Disconnect';
                                disconnectBtn.disabled = false;
                            }
                            // Show error toast
                            if (typeof Swal !== 'undefined') {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Disconnect Error',
                                    text: 'Failed to disconnect WhatsApp',
                                    toast: true,
                                    position: 'top-end',
                                    showConfirmButton: false,
                                    timer: 3000
                                });
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error disconnecting WhatsApp:', error);
                        showCard('connected');
                        // Reset button
                        if (disconnectBtn) {
                            disconnectBtn.innerHTML = '<i class="fas fa-power-off mr-1"></i> Disconnect';
                            disconnectBtn.disabled = false;
                        }
                    });
            };

            // Function to go back to first step (same as WhatsApp Relabs)
            window.backFirstStep = function() {
                showCard('disconnected');
            };

            // Socket ke waserverlive (sama seperti scan.html), path /socket.io/
            function connectWa1Socket() {
                if (typeof io === 'undefined') {
                    startQRPolling();
                    startStatusPolling();
                    return;
                }
                if (wa1Socket && wa1Socket.connected) {
                    startQRPolling();
                    startStatusPolling();
                    return;
                }
                wa1Socket = io(WA1_SOCKET_URL, {
                    path: '/socket.io/',
                    transports: ['polling', 'websocket'],
                    timeout: 20000,
                    reconnection: true
                });
                wa1Socket.on('connect', function() {
                    console.log('WhatsApp Agent 1: Socket connected');
                    if (qrPollingInterval) { clearInterval(qrPollingInterval); qrPollingInterval = null; }
                    if (statusPollingInterval) { clearInterval(statusPollingInterval); statusPollingInterval = null; }
                });
                wa1Socket.on('qr', function(data) {
                    if (data && data.image) {
                        qrCodeImage.src = data.image;
                        showCard('qr');
                    }
                });
                wa1Socket.on('status', function(data) {
                    if (data && data.status === 'connected') {
                        showCard('connected');
                        if (qrPollingInterval) { clearInterval(qrPollingInterval); qrPollingInterval = null; }
                        if (statusPollingInterval) { clearInterval(statusPollingInterval); statusPollingInterval = null; }
                    } else if (data && data.status === 'disconnected') {
                        showCard('disconnected');
                    }
                });
                wa1Socket.on('disconnect', function(reason) {
                    if (reason !== 'io server disconnect' && reason !== 'io client disconnect') {
                        startQRPolling();
                        startStatusPolling();
                    }
                });
                wa1Socket.on('connect_error', function() {
                    console.log('WhatsApp Agent 1: Socket error, fallback polling');
                    startQRPolling();
                    startStatusPolling();
                });
                setTimeout(function() {
                    if (wa1Socket && !wa1Socket.connected && !qrPollingInterval) {
                        startQRPolling();
                        startStatusPolling();
                    }
                }, 5000);
            }

            // Fallback: QR dan status dari REST
            function startQRPolling() {
                if (qrPollingInterval) clearInterval(qrPollingInterval);
                qrPollingInterval = setInterval(function() {
                    fetch(WA1_BASE + '/qr', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
                        .then(function(r) { return r.json(); })
                        .then(function(data) {
                            if (data.success && data.qr) {
                                qrCodeImage.src = data.qr;
                                showCard('qr');
                            }
                        })
                        .catch(function() {});
                }, 2000);
                setTimeout(function() { if (qrPollingInterval) clearInterval(qrPollingInterval); }, 300000);
            }

            function startStatusPolling() {
                if (statusPollingInterval) clearInterval(statusPollingInterval);
                statusPollingInterval = setInterval(function() {
                    fetch(WA1_BASE + '/status', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
                        .then(function(r) { return r.json(); })
                        .then(function(data) {
                            if (data.connected) {
                                if (qrPollingInterval) { clearInterval(qrPollingInterval); qrPollingInterval = null; }
                                if (statusPollingInterval) { clearInterval(statusPollingInterval); statusPollingInterval = null; }
                                showCard('connected');
                            }
                        })
                        .catch(function() {});
                }, 3000);
            }

            function checkWhatsAppStatus() {
                fetch(WA1_BASE + '/status', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('WhatsApp status:', data);
                        if (data.success) {
                            if (data.status === 'connected') {
                                showCard('connected');
                            } else if (data.status === 'disconnected') {
                                showCard('disconnected');
                            } else if (data.status === 'qr') {
                                showCard('qr');
                            }
                        } else {
                            showCard('disconnected');
                        }
                    })
                    .catch(error => {
                        console.error('Error checking WhatsApp status:', error);
                        showCard('disconnected');
                    });
            }

            // Function to save WhatsApp account to database
            function saveWhatsAppAccount(data) {
                // Send account data to backend
                fetch('/api/whatsapp/connect', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute(
                                'content')
                        },
                        body: JSON.stringify({
                            phone_number: data.phone || 'unknown',
                            account_name: data.name || 'WhatsApp Account',
                            status: 1,
                            chat_channel_id: 2 // WhatsApp channel ID
                        })
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            console.log('WhatsApp account saved to database');
                        } else {
                            console.error('Error saving WhatsApp account:', result.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error saving WhatsApp account:', error);
                    });
            }

            if (typeof whatsappIframe !== 'undefined' && whatsappIframe) {
                whatsappIframe.addEventListener('load', function() {
                    console.log('WhatsApp Socket iframe loaded successfully');
                });

                whatsappIframe.addEventListener('error', function() {
                    console.error('WhatsApp Socket iframe failed to load');
                });
            }
        });
    </script>
@endsection
