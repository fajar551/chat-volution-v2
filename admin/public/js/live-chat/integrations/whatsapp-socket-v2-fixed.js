// WhatsApp Socket V2 Integration - Fixed Version
(function () {
  'use strict';

  const SOCKET_URL = 'http://103.102.153.200:4005';
  const API_URL = 'http://103.102.153.200:4005';
  const TIMEOUT = 8000; // 8 second timeout

  let socket = null;
  let isConnected = false;
  let isInitialized = false;

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing WhatsApp Socket V2 integration');

    if (isInitialized) {
      console.log('Already initialized, skipping');
      return;
    }

    isInitialized = true;

    // Set timeout to prevent infinite loading
    setTimeout(() => {
      if (document.getElementById('loadingCard') &&
        document.getElementById('loadingCard').style.display !== 'none') {
        console.log('Timeout reached, showing error');
        hideLoadingAndShowError('Connection timeout. WhatsApp Socket V2 may not be running.');
      }
    }, 15000); // 15 second total timeout

    // Try to initialize
    initializeIntegration();
  });

  function initializeIntegration() {
    console.log('Initializing WhatsApp Socket V2 integration...');

    // Try socket connection first
    try {
      initSocket();
    } catch (error) {
      console.error('Socket initialization failed:', error);
    }

    // Always check API status
    checkAPIStatus();
  }

  function initSocket() {
    try {
      socket = io(SOCKET_URL, {
        timeout: 5000,
        forceNew: true,
        autoConnect: false
      });

      setupSocketEvents();
      socket.connect();
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }

  function setupSocketEvents() {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Socket connected');
      updateStatus('Connected to WhatsApp Socket V2', 'success');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      updateStatus('Disconnected from WhatsApp Socket V2', 'danger');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      updateStatus('Socket connection error: ' + error.message, 'danger');
    });

    socket.on('qrCode', (data) => {
      console.log('QR Code received:', data);
      if (data.image) {
        showQRCode(data.image);
      }
    });

    socket.on('status', (data) => {
      console.log('Status update:', data);
      handleStatusUpdate(data);
    });

    socket.on('message', (data) => {
      console.log('New message received:', data);
      if (data.from && !data.from.includes('@newsletter')) {
        addMessageToList(data);
      }
    });
  }

  function checkAPIStatus() {
    console.log('Checking API status...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    fetch(`${API_URL}/status`, {
      method: 'GET',
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        console.log('API response received:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('API status:', data);
        hideLoadingCard();

        if (data.success && data.state === 'CONNECTED') {
          showConnectedState();
        } else {
          showDisconnectedState();
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error('API check failed:', error);
        hideLoadingAndShowError('Cannot connect to WhatsApp Socket V2. Please check if the service is running on port 4005.');
      });
  }

  function showConnectedState() {
    isConnected = true;
    document.getElementById('statusCard').style.display = 'none';
    document.getElementById('connectedCard').style.display = 'block';
    document.getElementById('messagesCard').style.display = 'block';
    loadMessages();
  }

  function showDisconnectedState() {
    isConnected = false;
    document.getElementById('statusCard').style.display = 'block';
    document.getElementById('connectedCard').style.display = 'none';
    document.getElementById('messagesCard').style.display = 'none';
    updateStatus('WhatsApp not connected', 'warning');
  }

  function showQRCode(qrImage) {
    document.getElementById('qrCodeImage').src = qrImage;
    document.getElementById('qrCard').style.display = 'block';
    document.getElementById('statusCard').style.display = 'none';
    document.getElementById('connectedCard').style.display = 'none';
  }

  function handleStatusUpdate(data) {
    if (data.status === 'connected') {
      showConnectedState();
    } else if (data.status === 'disconnected') {
      showDisconnectedState();
    }
  }

  function hideLoadingCard() {
    const loadingCard = document.getElementById('loadingCard');
    if (loadingCard) {
      loadingCard.style.display = 'none';
    }
  }

  function hideLoadingAndShowError(message) {
    hideLoadingCard();
    document.getElementById('statusCard').style.display = 'block';
    updateStatus(message, 'danger');
  }

  function updateStatus(message, type) {
    const statusEl = document.getElementById('connectionStatus');
    const messageEl = document.getElementById('statusMessage');

    if (statusEl && messageEl) {
      statusEl.innerHTML = `<span class="badge badge-${type}">${message}</span>`;
      messageEl.textContent = message;
    }
  }

  function loadMessages() {
    fetch(`${API_URL}/messages`)
      .then(response => response.json())
      .then(data => {
        console.log('Messages loaded:', data);
        const messagesList = document.getElementById('messagesList');
        if (messagesList) {
          messagesList.innerHTML = '';

          if (data.success && data.messages.length > 0) {
            const phoneGroups = {};
            data.messages.forEach(msg => {
              if (msg.from && !msg.from.includes('@newsletter')) {
                if (!phoneGroups[msg.from]) {
                  phoneGroups[msg.from] = [];
                }
                phoneGroups[msg.from].push(msg);
              }
            });

            Object.keys(phoneGroups).forEach(phone => {
              const group = phoneGroups[phone];
              const lastMessage = group[group.length - 1];

              const messageItem = document.createElement('div');
              messageItem.className = 'list-group-item list-group-item-action';
              messageItem.innerHTML = `
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1">${phone}</h6>
                                    <small>${new Date(lastMessage.receivedAt).toLocaleString()}</small>
                                </div>
                                <p class="mb-1">${lastMessage.body.substring(0, 100)}...</p>
                            `;
              messagesList.appendChild(messageItem);
            });
          } else {
            messagesList.innerHTML = '<div class="text-center text-muted">No messages yet</div>';
          }
        }
      })
      .catch(error => {
        console.error('Error loading messages:', error);
      });
  }

  function addMessageToList(message) {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;

    const existingItems = messagesList.querySelectorAll('.list-group-item');
    for (let item of existingItems) {
      if (item.querySelector('h6').textContent === message.from) {
        item.querySelector('p').textContent = message.body.substring(0, 100) + '...';
        item.querySelector('small').textContent = new Date(message.receivedAt).toLocaleString();
        return;
      }
    }

    const messageItem = document.createElement('div');
    messageItem.className = 'list-group-item list-group-item-action';
    messageItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${message.from}</h6>
                <small>${new Date(message.receivedAt).toLocaleString()}</small>
            </div>
            <p class="mb-1">${message.body.substring(0, 100)}...</p>
        `;
    messagesList.insertBefore(messageItem, messagesList.firstChild);
  }

  // Button event listeners
  function setupButtonListeners() {
    const initBtn = document.getElementById('initBtn');
    if (initBtn) {
      initBtn.addEventListener('click', () => {
        fetch(`${API_URL}/init`)
          .then(response => response.json())
          .then(data => {
            console.log('Init response:', data);
            updateStatus('Initializing WhatsApp...', 'info');
          })
          .catch(error => {
            console.error('Error initializing:', error);
            updateStatus('Error initializing WhatsApp', 'danger');
          });
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        fetch(`${API_URL}/logout`)
          .then(response => response.json())
          .then(data => {
            console.log('Logout response:', data);
            updateStatus('WhatsApp logged out', 'warning');
          })
          .catch(error => {
            console.error('Error logging out:', error);
          });
      });
    }

    const disconnectBtn = document.getElementById('disconnectBtn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        fetch(`${API_URL}/logout`)
          .then(response => response.json())
          .then(data => {
            console.log('Disconnect response:', data);
            updateStatus('WhatsApp disconnected', 'warning');
          })
          .catch(error => {
            console.error('Error disconnecting:', error);
          });
      });
    }

    const retryBtn = document.getElementById('retryConnectionBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        console.log('Retrying connection...');
        updateStatus('Retrying connection...', 'info');
        document.getElementById('loadingCard').style.display = 'block';
        document.getElementById('statusCard').style.display = 'none';
        setTimeout(() => {
          checkAPIStatus();
        }, 1000);
      });
    }
  }

  // Setup button listeners after DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(setupButtonListeners, 100);
  });

})();
