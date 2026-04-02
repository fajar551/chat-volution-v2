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
                    <h4 class="mb-0">Integration Whatsapp For Agent Relabs</h4>
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
        // WhatsApp Socket Integration with HTTP API
        console.log('WhatsApp Socket Integration loaded with HTTP API integration');
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
            const loadingCard = document.getElementById('loadingCard');
            const disconnectedCard = document.getElementById('disconnectedCard');
            const connectedCard = document.getElementById('connectedCard');
            const qrCard = document.getElementById('qrCard');
            const qrCodeImage = document.getElementById('qrCodeImage');

            // Initialize WhatsApp integration with HTTP API
            console.log('🚀 WhatsApp Socket Integration initialized with HTTP API');

            // Initialize with status check
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

                // Initialize WhatsApp connection via HTTP request
                fetch('https://waserverlive.genio.id/wa3/init', {
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
                            // Show loading card while waiting for QR code
                            showCard('loading');
                            // Start polling for status and QR code
                            startStatusPolling();
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
                fetch('https://waserverlive.genio.id/wa3/logout', {
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

            // Socket.IO connection for real-time events (QR code and status)
            let socket;

            function startStatusPolling() {
                console.log('Connecting to WhatsApp Socket for real-time events...');
                socket = io('https://waserverlive.genio.id', {
                    path: '/wa3/socket.io/',
                    transports: ['polling'],
                    timeout: 30000,
                    forceNew: true,
                    reconnection: true,
                    reconnectionDelay: 3000,
                    reconnectionAttempts: 5
                });

                // Handle QR code from socket
                socket.on('qr', (data) => {
                    console.log('QR Code received via socket:', data);
                    qrCodeImage.src = data.image;
                    showCard('qr');
                });

                // Handle status updates from socket
                socket.on('status', (data) => {
                    console.log('Status update via socket:', data);
                    if (data.status === 'connected') {
                        showCard('connected');
                    } else if (data.status === 'disconnected') {
                        showCard('disconnected');
                    } else if (data.status === 'qr') {
                        showCard('qr');
                    }
                });

                // Handle connection events
                socket.on('connect', () => {
                    console.log('✅ Socket connected to WhatsApp server');
                    console.log('Socket ID:', socket.id);
                });

                socket.on('disconnect', (reason) => {
                    console.log('❌ Socket disconnected from WhatsApp server:', reason);
                });

                socket.on('connect_error', (error) => {
                    console.error('❌ Socket connection error:', error);
                    showCard('disconnected');
                });

                // Debug: Log all events
                socket.onAny((eventName, ...args) => {
                    console.log('🔍 Socket event received:', eventName, args);
                });

                // Fallback: Start polling if socket doesn't receive events within 10 seconds
                setTimeout(() => {
                    if (socket && socket.connected) {
                        console.log('🔄 Starting fallback polling for QR code...');
                        startFallbackPolling();
                    }
                }, 10000);
            }

            // Fallback polling mechanism
            let fallbackInterval;

            function startFallbackPolling() {
                fallbackInterval = setInterval(() => {
                    fetch('https://waserverlive.genio.id/wa3/status', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('Fallback status check:', data);
                            if (data.connected) {
                                showCard('connected');
                                clearInterval(fallbackInterval);
                            } else {
                                // Try to get QR code via HTTP if available
                                checkQRCodeFallback();
                            }
                        })
                        .catch(error => {
                            console.error('Fallback polling error:', error);
                        });
                }, 3000);
            }

            function checkQRCodeFallback() {
                // Try alternative QR code endpoint
                fetch('https://waserverlive.genio.id/wa3/qr', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            console.log('QR endpoint not available, continuing with socket...');
                            return null;
                        }
                    })
                    .then(data => {
                        if (data && data.success && data.qr) {
                            console.log('QR Code received via fallback HTTP');
                            qrCodeImage.src = data.qr;
                            showCard('qr');
                            clearInterval(fallbackInterval);
                        }
                    })
                    .catch(error => {
                        console.log('QR fallback not available:', error.message);
                    });
            }

            // Function to check WhatsApp status
            function checkWhatsAppStatus() {
                fetch('https://waserverlive.genio.id/wa3/status', {
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

            // Iframe loaded successfully
            if (whatsappIframe) {
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
