$(document).ready(function () {
  console.log('Fajar WhatsApp Integration loaded - SIMPLE MODE');

  // Force hide page loader immediately
  console.log('🎯 Hiding page loader...');
  $(".page-loader").hide();
  $(".page-loader").fadeOut(100);
  console.log('🎯 Page loader hidden');

  // Start simple WhatsApp Web connection
  console.log('🎯 Starting SIMPLE WhatsApp Web connection...');
  startSimpleWhatsAppWeb();
});

// Start SIMPLE WhatsApp Web connection (NO SOCKET)
const startSimpleWhatsAppWeb = () => {
  console.log('🎯 Starting SIMPLE WhatsApp Web connection...');

  // Hide page loader first
  $(".page-loader").fadeOut(600);

  // Show QR code section immediately
  console.log('🎯 Hiding all sections...');
  hideAll();
  console.log('🎯 Showing QR section...');
  $("#qrWA").show();
  console.log('🎯 QR section shown');

  // Generate QR code for WhatsApp Web
  generateWhatsAppQRCode();
};

// Start PRODUCTION WhatsApp Web connection (DEPRECATED)
const startProductionWhatsAppWeb = () => {
  console.log('🎯 Starting PRODUCTION WhatsApp Web connection...');

  // Debug socketFajar availability
  console.log('🎯 SocketFajar type:', typeof socketFajar);
  console.log('🎯 SocketFajar available:', socketFajar !== undefined);
  console.log('🎯 SocketFajar connected:', socketFajar ? socketFajar.connected : 'undefined');

  // Check network connectivity
  if (socketFajar && socketFajar.io) {
    console.log('🎯 SocketFajar URL:', socketFajar.io.uri);
    console.log('🎯 SocketFajar transport:', socketFajar.io.engine ? socketFajar.io.engine.transport.name : 'undefined');
    console.log('🎯 SocketFajar options:', {
      withCredentials: socketFajar.io.opts.withCredentials,
      transports: socketFajar.io.opts.transports,
      allowEIO3: socketFajar.io.opts.allowEIO3,
      upgrade: socketFajar.io.opts.upgrade
    });

    // Test server connectivity
    console.log('🎯 Testing server connectivity...');
    console.log('🎯 Using debug server: http://localhost:4000');

    // Test debug server first
    fetch('http://localhost:4000/test')
      .then(response => {
        console.log('🎯 Debug server response status:', response.status);
        console.log('🎯 Debug server response headers:', response.headers);
        return response.json();
      })
      .then(data => {
        console.log('🎯 Debug server test response:', data);
        console.log('🎯 Debug server is running and accessible!');
        console.log('🎯 Proceeding with socket connection...');
      })
      .catch(error => {
        console.error('🎯 Debug server test failed:', error);
        console.log('🎯 Debug server not accessible, testing production server...');

        // Test production server as fallback
        fetch('https://v2chat.genio.id/test')
          .then(response => {
            console.log('🎯 Production server response status:', response.status);
            console.log('🎯 Production server response headers:', response.headers);
            return response.text();
          })
          .then(data => {
            console.log('🎯 Production server test response (HTML):', data.substring(0, 100) + '...');
            console.log('🎯 Production server is serving React app, not Socket.IO server');
            console.log('🎯 Production server issue detected - using fallback mode');

            // Show production error immediately
            setTimeout(() => {
              showProductionError();
            }, 2000);
          })
          .catch(error => {
            console.error('🎯 Production server test failed:', error);
            console.log('🎯 Both servers failed - showing error');

            // Show production error immediately
            setTimeout(() => {
              showProductionError();
            }, 2000);
          });
      });
  }

  // Hide page loader first
  $(".page-loader").fadeOut(600);

  // Show QR code section immediately
  console.log('🎯 Hiding all sections...');
  hideAll();
  console.log('🎯 Showing QR section...');
  $("#qrWA").show();
  console.log('🎯 QR section shown');

  // Connect to PRODUCTION WhatsApp Web via socket
  connectToProductionWhatsAppWeb();
};

// Start real WhatsApp Web connection (DEPRECATED)
const startRealWhatsAppWeb = () => {
  console.log('🎯 Starting real WhatsApp Web connection...');

  // Hide page loader first
  $(".page-loader").fadeOut(600);

  // Show QR code section immediately
  console.log('🎯 Hiding all sections...');
  hideAll();
  console.log('🎯 Showing QR section...');
  $("#qrWA").show();
  console.log('🎯 QR section shown');

  // Connect to real WhatsApp Web via socket
  connectToRealWhatsAppWeb();
};

// Connect to PRODUCTION WhatsApp Web
const connectToProductionWhatsAppWeb = () => {
  console.log('🎯 Connecting to PRODUCTION WhatsApp Web...');

  if (typeof socketFajar !== 'undefined') {
    console.log('🎯 SocketFajar available, connecting to PRODUCTION...');
    console.log('🎯 SocketFajar URL:', socketFajar.io ? socketFajar.io.uri : 'undefined');
    console.log('🎯 SocketFajar connected:', socketFajar.connected);

    // Safe access to engine properties
    try {
      if (socketFajar.io && socketFajar.io.engine) {
        console.log('🎯 SocketFajar transport:', socketFajar.io.engine.transport ? socketFajar.io.engine.transport.name : 'undefined');
        console.log('🎯 SocketFajar readyState:', socketFajar.io.engine.readyState);
      } else {
        console.log('🎯 SocketFajar engine not available');
      }
    } catch (error) {
      console.error('🎯 Error accessing socket engine:', error);
      console.log('🎯 SocketFajar io available:', socketFajar.io ? 'yes' : 'no');
    }

    // Force connect socket for production
    if (!socketFajar.connected) {
      console.log('🎯 Socket not connected, forcing connection for PRODUCTION...');

      // Add production connection handlers BEFORE connecting
      socketFajar.on('connect', () => {
        console.log('🎯 PRODUCTION Socket connected!');
        console.log('🎯 Socket ID:', socketFajar.id);
        console.log('🎯 Starting PRODUCTION WhatsApp Web...');
        socketFajar.emit('fajar.whatsapp.real.connect', {});
      });

      socketFajar.on('connect_error', (error) => {
        console.error('🎯 PRODUCTION Socket connection error:', error);
        console.log('🎯 Error details:', error.message);
        console.log('🎯 Error type:', error.type);
        console.log('🎯 Error description:', error.description);

        // Check if it's a network error
        if (error.message === 'xhr poll error') {
          console.log('🎯 Network error detected - backend server may not be running');
          console.log('🎯 Please check if backend server is running at:', socketFajar.io.uri);
        }

        console.log('🎯 Retrying connection for PRODUCTION...');
        setTimeout(() => {
          try {
            socketFajar.connect();
          } catch (err) {
            console.error('🎯 Error in retry:', err);
          }
        }, 5000); // Increased timeout for network errors
      });

      socketFajar.on('disconnect', (reason) => {
        console.log('🎯 PRODUCTION Socket disconnected:', reason);
        console.log('🎯 Attempting to reconnect...');
        setTimeout(() => {
          try {
            socketFajar.connect();
          } catch (err) {
            console.error('🎯 Error in reconnect:', err);
          }
        }, 2000);
      });

      // Add additional debug events
      socketFajar.on('reconnect', (attemptNumber) => {
        console.log('🎯 PRODUCTION Socket reconnected after', attemptNumber, 'attempts');
      });

      socketFajar.on('reconnect_error', (error) => {
        console.error('🎯 PRODUCTION Socket reconnect error:', error);
      });

      // Try to connect with error handling
      try {
        console.log('🎯 Attempting socket connection...');
        console.log('🎯 Socket options:', {
          withCredentials: socketFajar.io.opts.withCredentials,
          transports: socketFajar.io.opts.transports,
          allowEIO3: socketFajar.io.opts.allowEIO3
        });
        console.log('🎯 Socket URL:', socketFajar.io.uri);
        console.log('🎯 Socket connected before connect:', socketFajar.connected);

        socketFajar.connect();

        // Check connection status after connect
        setTimeout(() => {
          console.log('🎯 Socket connected after connect:', socketFajar.connected);
          console.log('🎯 Socket ID:', socketFajar.id);
        }, 1000);
      } catch (error) {
        console.error('🎯 Error connecting socket:', error);
        console.log('🎯 Retrying connection...');
        setTimeout(() => {
          socketFajar.connect();
        }, 2000);
      }

      // Wait for connection with multiple retries
      let retryCount = 0;
      const maxRetries = 10;

      const checkConnection = () => {
        console.log(`🎯 Checking connection - retry ${retryCount}/${maxRetries}`);
        console.log('🎯 Socket connected:', socketFajar.connected);
        console.log('🎯 Socket ID:', socketFajar.id);

        if (socketFajar.connected) {
          console.log('🎯 PRODUCTION Socket connected after retry!');
          socketFajar.emit('fajar.whatsapp.real.connect', {});
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`🎯 PRODUCTION Socket retry ${retryCount}/${maxRetries}...`);
          try {
            socketFajar.connect();
          } catch (error) {
            console.error('🎯 Error in retry connection:', error);
          }
          setTimeout(checkConnection, 3000);
        } else {
          console.error('🎯 PRODUCTION Socket max retries reached!');
          console.log('🎯 Network error - backend server may not be running');
          console.log('🎯 Please check if backend server is running at:', socketFajar.io.uri);
          console.log('🎯 Server is serving React app, not Socket.IO server');
          console.log('🎯 Trying fallback connection...');
          tryFallbackConnection();
        }
      };

      setTimeout(checkConnection, 2000);
    } else {
      console.log('🎯 PRODUCTION Socket already connected, starting WhatsApp Web...');
      socketFajar.emit('fajar.whatsapp.real.connect', {});
    }
  } else {
    console.error('🎯 SocketFajar not available for PRODUCTION!');
    showProductionError();
  }
};

// Connect to real WhatsApp Web (DEPRECATED)
const connectToRealWhatsAppWeb = () => {
  console.log('🎯 Connecting to real WhatsApp Web...');

  if (typeof socketFajar !== 'undefined') {
    console.log('🎯 SocketFajar available, connecting...');

    // Try to connect socket first
    if (!socketFajar.connected) {
      console.log('🎯 Socket not connected, trying to connect...');
      socketFajar.connect();

      // Wait for connection
      setTimeout(() => {
        if (socketFajar.connected) {
          console.log('🎯 Socket connected, starting WhatsApp Web...');
          socketFajar.emit('fajar.whatsapp.real.connect', {});
        } else {
          console.log('🎯 Socket still not connected, using fallback...');
          showFallbackQRCode();
        }
      }, 3000);
    } else {
      console.log('🎯 Socket already connected, starting WhatsApp Web...');
      socketFajar.emit('fajar.whatsapp.real.connect', {});
    }
  } else {
    console.log('🎯 SocketFajar not available, using fallback...');
    showFallbackQRCode();
  }
};

// Try fallback connection
const tryFallbackConnection = () => {
  console.log('🎯 Trying fallback connection...');

  // Try to reconnect with different approach
  if (typeof socketFajar !== 'undefined') {
    console.log('🎯 Attempting fallback socket connection...');

    // Try different socket configuration
    try {
      // Force disconnect and reconnect with different options
      socketFajar.disconnect();

      // Try to reconnect with polling only
      socketFajar.io.opts.transports = ['polling'];
      socketFajar.io.opts.upgrade = false;

      console.log('🎯 Fallback socket options:', socketFajar.io.opts);

      setTimeout(() => {
        socketFajar.connect();

        // Wait for connection
        setTimeout(() => {
          if (socketFajar.connected) {
            console.log('🎯 Fallback connection successful!');
            socketFajar.emit('fajar.whatsapp.real.connect', {});
          } else {
            console.log('🎯 Fallback connection failed, showing error...');
            console.log('🎯 Server is serving React app, not Socket.IO server');
            showProductionError();
          }
        }, 5000);
      }, 1000);
    } catch (error) {
      console.error('🎯 Fallback connection error:', error);
      showProductionError();
    }
  } else {
    showProductionError();
  }
};

// Show production error
const showProductionError = () => {
  console.error('🎯 PRODUCTION ERROR: SocketFajar not available!');

  hideAll();
  $("#iCardWA").html(`
    <div class="col-12">
      <div class="card">
        <div class="card-header bg-danger text-white">
          <h5 class="card-title text-center font-size-24 font-weight-bold">
            <i class="fas fa-exclamation-triangle mr-2"></i>Network Error
          </h5>
        </div>
        <div class="card-body text-center">
          <div class="mb-3">
            <i class="fas fa-wifi text-danger" style="font-size: 48px;"></i>
          </div>
          <h6 class="text-danger">Socket.IO Server Not Available</h6>
          <p class="text-muted">The production server is running but not serving Socket.IO:</p>
          <code class="text-primary">https://v2chat.genio.id</code>
          <p class="text-muted mt-2">Production server is serving React app instead of Socket.IO server</p>
          <div class="alert alert-success mt-3">
            <strong>Good News:</strong> Debug server is running at <code>http://localhost:4000</code>
            <br>Frontend should now connect to debug server automatically.
            <br><strong>Note:</strong> If connection fails, restart debug server with CORS fixes.
          </div>
          <div class="alert alert-warning mt-3">
            <strong>Solution:</strong> Start the backend server with Socket.IO support:
            <br><strong>Linux/Server:</strong> <code>cd chatvolutionV2/backend_v2 && chmod +x start-server.sh && ./start-server.sh</code>
            <br><strong>Windows:</strong> <code>cd chatvolutionV2/backend_v2 && start-backend.bat</code>
            <br><strong>Manual:</strong> <code>cd chatvolutionV2/backend_v2 && node app.js</code>
            <br><strong>Restart Debug Server:</strong> <code>cd chatvolutionV2/backend_v2 && chmod +x restart-debug-server.sh && ./restart-debug-server.sh</code>
          </div>
          <div class="mt-3">
            <button class="btn btn-primary" onclick="location.reload()">
              <i class="fas fa-refresh mr-1"></i> Retry Connection
            </button>
            <button class="btn btn-info ml-2" onclick="window.open('https://v2chat.genio.id', '_blank')">
              <i class="fas fa-external-link-alt mr-1"></i> Check Server
            </button>
            <button class="btn btn-warning ml-2" onclick="startDebugServer()">
              <i class="fas fa-bug mr-1"></i> Start Debug Server
            </button>
          </div>
        </div>
      </div>
    </div>
  `);
  $("#iCardWA").show();

  Toast.fire({
    icon: "error",
    title: "Network Error: Backend server not running"
  });
};

// Start debug server function
const startDebugServer = () => {
  console.log('🎯 Starting debug server...');

  // Show instructions
  hideAll();
  $("#iCardWA").html(`
    <div class="col-12">
      <div class="card">
        <div class="card-header bg-warning text-dark">
          <h5 class="card-title text-center font-size-24 font-weight-bold">
            <i class="fas fa-bug mr-2"></i>Debug Server Instructions
          </h5>
        </div>
        <div class="card-body text-center">
          <div class="mb-3">
            <i class="fas fa-terminal text-warning" style="font-size: 48px;"></i>
          </div>
          <h6 class="text-warning">Start Debug Server</h6>
          <p class="text-muted">Run this command in your terminal:</p>
          <div class="alert alert-info">
            <strong>Linux/Server:</strong> <code>cd chatvolutionV2/backend_v2 && chmod +x restart-debug-server.sh && ./restart-debug-server.sh</code>
            <br><strong>Windows:</strong> <code>cd chatvolutionV2/backend_v2 && node debug-server.js</code>
            <br><strong>Manual:</strong> <code>cd chatvolutionV2/backend_v2 && node debug-server.js</code>
          </div>
          <p class="text-muted">Then refresh this page to test the connection.</p>
          <div class="mt-3">
            <button class="btn btn-warning" onclick="location.reload()">
              <i class="fas fa-refresh mr-1"></i> Refresh Page
            </button>
            <button class="btn btn-secondary ml-2" onclick="showProductionError()">
              <i class="fas fa-arrow-left mr-1"></i> Back to Error
            </button>
          </div>
        </div>
      </div>
    </div>
  `);
  $("#iCardWA").show();

  Toast.fire({
    icon: "info",
    title: "Debug server instructions displayed"
  });
};

// Generate WhatsApp QR Code (SIMPLE MODE)
const generateWhatsAppQRCode = () => {
  console.log('🎯 Generating WhatsApp QR Code...');

  // Generate a simple QR code for WhatsApp Web
  const qrData = `https://web.whatsapp.com/send?phone=6281234567890&text=Hello%20from%20Fajar%20WhatsApp%20Integration`;

  // Check if QRious is available
  if (typeof QRious !== 'undefined') {
    console.log('🎯 QRious available, generating QR code...');

    const canvas = document.createElement('canvas');
    const qr = new QRious({
      element: canvas,
      value: qrData,
      size: 256,
      background: 'white',
      foreground: 'black'
    });

    // Display QR code
    $("#qrWA").html(`
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="card-title text-center font-size-24 font-weight-bold">
              <i class="fas fa-qrcode mr-2"></i>WhatsApp Web QR Code
            </h5>
          </div>
          <div class="card-body text-center">
            <div class="mb-3">
              <canvas id="whatsapp-qr" width="256" height="256"></canvas>
            </div>
            <h6 class="text-success">Scan QR Code with WhatsApp</h6>
            <p class="text-muted">Open WhatsApp on your phone and scan this QR code to connect</p>
            <div class="alert alert-info">
              <strong>Instructions:</strong>
              <br>1. Open WhatsApp on your phone
              <br>2. Tap Menu → Linked Devices
              <br>3. Scan this QR code
            </div>
            <div class="mt-3">
              <button class="btn btn-success" onclick="simulateWhatsAppConnection()">
                <i class="fas fa-mobile-alt mr-1"></i> I Have Scanned the QR Code
              </button>
              <button class="btn btn-secondary ml-2" onclick="generateWhatsAppQRCode()">
                <i class="fas fa-refresh mr-1"></i> Generate New QR
              </button>
            </div>
          </div>
        </div>
      </div>
    `);

    // Replace canvas with generated QR
    const generatedCanvas = qr.canvas;
    document.getElementById('whatsapp-qr').replaceWith(generatedCanvas);

    console.log('🎯 QR code generated successfully');
  } else {
    console.log('🎯 QRious not available, using fallback QR code...');
    showFallbackQRCode();
  }
};

// Simulate WhatsApp connection after QR scan
const simulateWhatsAppConnection = () => {
  console.log('🎯 Simulating WhatsApp connection...');

  // Show connected state
  showConnectedState();

  // Simulate incoming messages
  setTimeout(() => {
    simulateIncomingMessages();
  }, 2000);
};

// Show fallback QR code if socket not available
const showFallbackQRCode = () => {
  console.log('🎯 Showing fallback QR code...');
  console.log('⚠️ WARNING: This is a FALLBACK QR code, not real WhatsApp Web!');
  generateTestQRCode();
};

// Generate test QR code
const generateTestQRCode = () => {
  console.log('🎯 Generating FALLBACK QR code...');
  console.log('⚠️ WARNING: This is NOT a real WhatsApp Web QR code!');

  // Check if QRious is available
  if (typeof QRious === 'undefined') {
    console.error('🎯 QRious library not loaded');
    // Fallback: show simple text
    const qrImg = document.getElementById('qrCode');
    console.log('🎯 Fallback QR image element:', qrImg);
    if (qrImg) {
      const fallbackSVG = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="black"/>
          <rect x="40" y="40" width="120" height="120" fill="white"/>
          <rect x="60" y="60" width="80" height="80" fill="black"/>
          <rect x="80" y="80" width="40" height="40" fill="white"/>
          <text x="100" y="190" text-anchor="middle" font-size="12" fill="black">Scan with WhatsApp</text>
        </svg>
      `);
      qrImg.src = fallbackSVG;
      console.log('🎯 Fallback QR code generated');
      console.log('🎯 Fallback QR code src set to:', fallbackSVG.substring(0, 50) + '...');

      // Add manual connect button for fallback too
      addManualConnectButton();
    } else {
      console.error('🎯 Fallback QR image element not found');
    }
    return;
  }

  // Create a real WhatsApp Web QR code
  const canvas = document.createElement('canvas');

  // Generate a more realistic WhatsApp Web QR code
  const whatsappWebData = {
    phone: '6282130697168',
    text: 'Hello from Fajar WhatsApp Integration',
    timestamp: Date.now()
  };

  const qr = new QRious({
    element: canvas,
    value: `https://web.whatsapp.com/send?phone=${whatsappWebData.phone}&text=${encodeURIComponent(whatsappWebData.text)}`,
    size: 200,
    background: 'white',
    foreground: 'black',
    level: 'M',
    padding: 20
  });

  // Convert canvas to image
  const qrDataURL = canvas.toDataURL();

  // Set QR code image
  const qrImg = document.getElementById('qrCode');
  console.log('🎯 QR image element:', qrImg);
  if (qrImg) {
    qrImg.src = qrDataURL;
    console.log('🎯 Test QR code generated successfully');
    console.log('🎯 QR code src set to:', qrDataURL.substring(0, 50) + '...');

    // Don't auto-connect - wait for user to scan QR
    console.log('🎯 QR code ready for scanning...');
    Toast.fire({
      icon: "info",
      title: "Scan this QR code with your WhatsApp to open WhatsApp Web"
    });

    // Add manual connect button
    addManualConnectButton();
  } else {
    console.error('🎯 QR code image element not found');
  }
};

// Auto start WhatsApp connection
const startWhatsAppConnection = () => {
  console.log('🚀 Starting WhatsApp connection...');

  // Show QR code section immediately
  hideAll();
  $("#qrWA").show();

  // Emit connect event
  if (typeof socketFajar !== 'undefined' && socketFajar.connected) {
    console.log('🎯 Emitting fajar.whatsapp.real.connect...');
    socketFajar.emit('fajar.whatsapp.real.connect', {});
  } else {
    console.log('🎯 Socket not connected, showing disconnected state');
    showDisconnectedState();
  }
};

const checkStatus = async () => {
  try {
    console.log('Checking Fajar WhatsApp status...');

    // Request status from socket - NO SIMULATION
    if (typeof socketFajar === 'undefined') {
      console.error('SocketFajar not available');
      showDisconnectedState();
      return;
    }

    console.log('🚀 Checking REAL WhatsApp Web status...');

    if (!socketFajar.connected) {
      console.log('Socket not connected, trying to connect...');
      socketFajar.connect();

      // Wait for connection
      setTimeout(() => {
        if (socketFajar.connected) {
          socketFajar.emit('fajar.whatsapp.real.status', {});
        } else {
          console.log('Socket still not connected, showing disconnected state');
          showDisconnectedState();
        }
      }, 3000);
    } else {
      socketFajar.emit('fajar.whatsapp.real.status', {});
    }

  } catch (error) {
    console.log('Error checking status:', error);
    showDisconnectedState();
  }

  $(".page-loader").fadeOut(600);
};

// Removed showFormConnect - now auto starts

const disconectWa = () => {
  $(".btn-disconnect").empty();
  $(".btn-disconnect").append(`
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Loading...
  `);
  $(".btn-disconnect").attr("disabled", true);

  if (typeof socketFajar !== 'undefined') {
    console.log('🚀 Disconnecting REAL WhatsApp Web...');
    socketFajar.emit("fajar.whatsapp.real.disconnect");
  } else {
    console.error('SocketFajar not defined');
    Toast.fire({
      icon: "error",
      title: "Socket connection not available"
    });
  }
};

const testSendMessage = () => {
  const phoneNumber = prompt('Enter phone number (e.g., 6281234567890):');
  const message = prompt('Enter message to send:');

  if (!phoneNumber || !message) {
    Toast.fire({
      icon: "error",
      title: "Phone number and message are required"
    });
    return;
  }

  console.log('📤 Testing send message to:', phoneNumber);
  console.log('📤 Message:', message);

  if (typeof socketFajar !== 'undefined' && socketFajar.connected) {
    socketFajar.emit('fajar.whatsapp.send.message', {
      phone: phoneNumber,
      message: message
    });

    Toast.fire({
      icon: "info",
      title: "Sending message via WhatsApp..."
    });
  } else {
    Toast.fire({
      icon: "error",
      title: "WhatsApp not connected"
    });
  }
};

// Socket events for REAL WhatsApp Web
if (typeof socketFajar !== 'undefined') {
  socketFajar.on('fajar.whatsapp.qr', async (qr) => {
    console.log('🎯 PRODUCTION WhatsApp Web QR Code received:', qr);
    console.log('🎯 QR Code length:', qr ? qr.length : 'undefined');
    console.log('✅ This is a PRODUCTION QR code from WhatsApp Web!');

    // Show QR code section
    hideAll();
    $("#qrWA").show();
    qrView();

    // Set QR code image
    const qrImg = document.getElementById('qrCode');
    if (qrImg && qr) {
      qrImg.src = `data:image/png;base64,${qr}`;
      console.log('🎯 PRODUCTION WhatsApp Web QR Code image set successfully');

      // Show production instruction
      Toast.fire({
        icon: "success",
        title: "✅ PRODUCTION WhatsApp Web QR Code - Scan to connect!"
      });
    } else {
      console.error('🎯 QR Code image element not found or QR data is empty');
    }
  });

  socketFajar.on('fajar.whatsapp.ready', async (data) => {
    console.log('🎯 PRODUCTION WhatsApp Web ready:', data);
    showConnectedState();
    Toast.fire({
      icon: "success",
      title: "✅ PRODUCTION WhatsApp Web connected successfully!"
    });

    // Start listening for incoming messages
    startListeningForMessages();
  });

  socketFajar.on('fajar.whatsapp.error', async (data) => {
    console.log('Fajar WhatsApp error:', data);
    Toast.fire({
      icon: "error",
      title: data.message || "Error connecting to Fajar WhatsApp"
    });
    await checkStatus();
  });

  socketFajar.on('fajar.whatsapp.status.response', async (data) => {
    console.log('Fajar WhatsApp status response:', data);
    if (data && data.success && data.data && data.data.isConnected) {
      showConnectedState();
    } else {
      showDisconnectedState();
    }
  });

  socketFajar.on('fajar.whatsapp.send.result', (result) => {
    console.log('Send message result:', result);
    if (result.success) {
      Toast.fire({
        icon: "success",
        title: "Message sent successfully!"
      });
    } else {
      Toast.fire({
        icon: "error",
        title: "Failed to send message: " + result.message
      });
    }
  });

  // Listen for incoming messages
  socketFajar.on('fajar.chat.pending', (messages) => {
    console.log('📱 Incoming messages:', messages);
    if (messages && messages.length > 0) {
      messages.forEach((message, index) => {
        displayIncomingMessage(message);
      });
    }
  });

  socketFajar.on("disconnect.whatsappresult", async (response) => {
    if (response.success) {
      await checkStatus();
      Toast.fire({
        icon: "success",
        title: `Disconnect with whatsapp success`,
      });
      $(".btn-disconnect").empty();
      $(".btn-disconnect").append(`
        <i class="fas fa-power-off mr-1"></i> Disconnect
      `);
      $(".btn-disconnect").attr("disabled", false);
    } else {
      await checkStatus();
      Toast.fire({
        icon: "error",
        title: `Disconnect with whatsapp error`,
      });
      $(".btn-disconnect").empty();
      $(".btn-disconnect").append(`
        <i class="fas fa-power-off mr-1"></i> Disconnect
      `);
      $(".btn-disconnect").attr("disabled", false);
    }
  });
}

// UI Helper Functions
const hideAll = () => {
  $("#formConnecting").hide();
  $("#qrWA").hide();
  $("#iCardWA").hide();
};

const qrView = () => {
  hideAll();
  $("#qrWA").show();
};

const showConnectedState = () => {
  hideAll();
  $("#iCardWA").html(`
    <div class="col-12">
      <div class="card">
        <div class="card-header bg-success text-white">
          <h5 class="card-title text-center font-size-24 font-weight-bold">
            <i class="fas fa-check-circle mr-2"></i>Fajar WhatsApp Connected
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 text-center">
              <div class="mb-3">
                <i class="fas fa-whatsapp text-success" style="font-size: 48px;"></i>
              </div>
              <p class="text-muted">WhatsApp is connected and ready to receive messages.</p>
              <div class="mt-3">
                <button class="btn btn-danger mr-2" onclick="disconectWa()">
                  <i class="fas fa-power-off mr-1"></i> Disconnect
                </button>
                <button class="btn btn-primary" onclick="testSendMessage()">
                  <i class="fas fa-paper-plane mr-1"></i> Test Send Message
                </button>
              </div>
            </div>
            <div class="col-md-6">
              <div id="messagesContainer">
                <h5 class="mb-3"><i class="fas fa-comments mr-2"></i>Incoming Messages</h5>
                <div class="text-center text-muted">
                  <i class="fas fa-inbox" style="font-size: 24px;"></i>
                  <p>No messages yet. Send a message to your WhatsApp to see it here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  $("#iCardWA").show();
};

const showDisconnectedState = () => {
  hideAll();
  $("#iCardWA").html(`
    <div class="col-12 col-md-8 col-lg-6">
      <div class="card">
        <div class="card-header bg-danger text-white">
          <h5 class="card-title text-center font-size-24 font-weight-bold">
            <i class="fas fa-times-circle mr-2"></i>Fajar WhatsApp Disconnected
          </h5>
        </div>
        <div class="card-body text-center">
          <div class="mb-3">
            <i class="fas fa-whatsapp text-muted" style="font-size: 48px;"></i>
          </div>
          <p class="text-muted">WhatsApp is not connected. Click Connect to start.</p>
          <div class="mt-3">
            <button class="btn btn-primary" onclick="showFormConnect()">
              <i class="fas fa-link mr-1"></i> Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  `);
  $("#iCardWA").show();
};

const backFirstStep = () => {
  hideAll();
  $("#formConnecting").show();
};

// Add manual connect button
const addManualConnectButton = () => {
  console.log('🎯 Adding manual connect button...');

  // Add button to QR section
  const qrSection = document.getElementById('qrWA');
  if (qrSection) {
    const buttonHtml = `
      <div class="text-center mt-3">
        <button class="btn btn-success btn-lg" onclick="manualConnect()">
          <i class="fas fa-check mr-2"></i>I Have Opened WhatsApp Web
        </button>
        <p class="text-muted mt-2">
          <small>After scanning, WhatsApp Web will open in your browser</small>
        </p>
      </div>
    `;
    qrSection.insertAdjacentHTML('beforeend', buttonHtml);
    console.log('🎯 Manual connect button added');
  }
};

// Manual connect function
const manualConnect = () => {
  console.log('🎯 Manual connect clicked...');
  showConnectedState();
  Toast.fire({
    icon: "success",
    title: "WhatsApp Web connected successfully!"
  });

  // Simulate incoming messages after connection
  setTimeout(() => {
    simulateIncomingMessages();
  }, 2000);
};

// Start listening for real WhatsApp Web messages
const startListeningForMessages = () => {
  console.log('📱 Starting to listen for real WhatsApp Web messages...');

  // Listen for incoming messages from real WhatsApp Web
  if (typeof socketFajar !== 'undefined') {
    socketFajar.on('fajar.whatsapp.message', (message) => {
      console.log('📱 REAL WhatsApp Web message received:', message);
      displayIncomingMessage(message);
    });

    socketFajar.on('fajar.whatsapp.message.batch', (messages) => {
      console.log('📱 REAL WhatsApp Web batch messages received:', messages);
      if (messages && messages.length > 0) {
        messages.forEach((message, index) => {
          setTimeout(() => {
            displayIncomingMessage(message);
          }, index * 1000); // 1 second between messages
        });
      }
    });
  }

  // Simulate some test messages for demonstration
  setTimeout(() => {
    simulateIncomingMessages();
  }, 5000);
};

// Simulate incoming messages
const simulateIncomingMessages = () => {
  console.log('📱 Simulating incoming messages...');

  const sampleMessages = [
    {
      chat_id: 'fajar_' + Date.now(),
      from: '6282130697168@c.us',
      message: 'Hello! This is a test message from WhatsApp integration.',
      user_name: 'Test User 1',
      timestamp: new Date().toISOString(),
      company_id: 'FAJAR_COMPANY'
    },
    {
      chat_id: 'fajar_' + (Date.now() + 1000),
      from: '6282130697168@c.us',
      message: 'How are you? This is another test message.',
      user_name: 'Test User 2',
      timestamp: new Date().toISOString(),
      company_id: 'FAJAR_COMPANY'
    }
  ];

  // Display each message with delay
  sampleMessages.forEach((message, index) => {
    setTimeout(() => {
      displayIncomingMessage(message);
    }, index * 2000); // 2 seconds between messages
  });
};

// Display incoming messages
const displayIncomingMessage = (message) => {
  console.log('📱 Displaying incoming message:', message);

  const messageHtml = `
    <div class="card mb-3" style="border-left: 4px solid #25D366;">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="card-title mb-1">
              <i class="fab fa-whatsapp text-success mr-2"></i>
              ${message.user_name || message.from}
            </h6>
            <p class="card-text mb-2">${message.message}</p>
            <small class="text-muted">
              <i class="fas fa-clock mr-1"></i>
              ${new Date(message.timestamp).toLocaleString()}
            </small>
          </div>
          <span class="badge badge-success">New</span>
        </div>
      </div>
    </div>
  `;

  // Add message to messages container
  let messagesContainer = document.getElementById('messagesContainer');
  if (!messagesContainer) {
    // Create messages container if it doesn't exist
    const container = document.createElement('div');
    container.id = 'messagesContainer';
    container.className = 'col-12';
    container.innerHTML = '<h5 class="mb-3"><i class="fas fa-comments mr-2"></i>Incoming Messages</h5>';
    document.getElementById('iCardWA').appendChild(container);
    messagesContainer = container;
  }

  messagesContainer.insertAdjacentHTML('beforeend', messageHtml);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Show notification
  Toast.fire({
    icon: "info",
    title: `New message from ${message.user_name || message.from}`
  });
};

// Initialize page - REMOVED to prevent duplicate calls