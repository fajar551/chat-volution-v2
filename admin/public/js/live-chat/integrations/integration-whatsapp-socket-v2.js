// WhatsApp Socket V2 Integration JavaScript
const SOCKET_URL = 'http://103.102.153.200:4005';
const API_URL = 'http://103.102.153.200:4005';

// Initialize socket connection
const socket = io(SOCKET_URL);
let isConnected = false;
let processedMessageIds = new Set();

// Socket events
socket.on('connect', () => {
  console.log('Connected to WhatsApp Socket V2');
  updateConnectionStatus('Connected to server', 'success');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  updateConnectionStatus('Disconnected from server', 'danger');
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

  // Check for duplicate messages
  if (processedMessageIds.has(data.id)) {
    console.log('🚫 Duplicate message ignored:', data.id);
    return;
  }

  // Filter out newsletter messages
  if (data.from && data.from.includes('@newsletter')) {
    console.log('🚫 Newsletter message filtered out:', data.from);
    return;
  }

  // Mark message as processed
  processedMessageIds.add(data.id);

  // Add message to list
  addMessageToList(data);
});

// Helper functions
function updateConnectionStatus(message, type) {
  const statusEl = document.getElementById('connectionStatus');
  const messageEl = document.getElementById('statusMessage');

  if (statusEl && messageEl) {
    statusEl.innerHTML = `<span class="badge badge-${type}">${message}</span>`;
    messageEl.textContent = message;
  }
}

function showQRCode(qrImage) {
  const qrCard = document.getElementById('qrCard');
  const statusCard = document.getElementById('statusCard');
  const connectedCard = document.getElementById('connectedCard');

  if (qrCard) {
    document.getElementById('qrCodeImage').src = qrImage;
    qrCard.style.display = 'block';
    if (statusCard) statusCard.style.display = 'none';
    if (connectedCard) connectedCard.style.display = 'none';
  }
}

function handleStatusUpdate(data) {
  const qrCard = document.getElementById('qrCard');
  const statusCard = document.getElementById('statusCard');
  const connectedCard = document.getElementById('connectedCard');
  const messagesCard = document.getElementById('messagesCard');

  if (data.status === 'connected') {
    isConnected = true;
    if (qrCard) qrCard.style.display = 'none';
    if (statusCard) statusCard.style.display = 'none';
    if (connectedCard) connectedCard.style.display = 'block';
    if (messagesCard) messagesCard.style.display = 'block';
    loadMessages();
  } else if (data.status === 'disconnected') {
    isConnected = false;
    if (qrCard) qrCard.style.display = 'none';
    if (connectedCard) connectedCard.style.display = 'none';
    if (messagesCard) messagesCard.style.display = 'none';
    if (statusCard) statusCard.style.display = 'block';
    updateConnectionStatus('WhatsApp disconnected', 'danger');
  }
}

function loadMessages() {
  fetch(`${API_URL}/messages`)
    .then(response => response.json())
    .then(data => {
      console.log('Messages response:', data);
      const messagesList = document.getElementById('messagesList');

      if (messagesList) {
        messagesList.innerHTML = '';

        if (data.success && data.messages.length > 0) {
          // Group messages by phone number
          const phoneGroups = {};
          data.messages.forEach(msg => {
            if (msg.from && !msg.from.includes('@newsletter')) {
              if (!phoneGroups[msg.from]) {
                phoneGroups[msg.from] = [];
              }
              phoneGroups[msg.from].push(msg);
            }
          });

          // Display grouped messages
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

  // Check if message already exists
  const existingItems = messagesList.querySelectorAll('.list-group-item');
  for (let item of existingItems) {
    if (item.querySelector('h6').textContent === message.from) {
      // Update existing message
      item.querySelector('p').textContent = message.body.substring(0, 100) + '...';
      item.querySelector('small').textContent = new Date(message.receivedAt).toLocaleString();
      return;
    }
  }

  // Add new message
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
document.addEventListener('DOMContentLoaded', function () {
  // Initialize button
  const initBtn = document.getElementById('initBtn');
  if (initBtn) {
    initBtn.addEventListener('click', () => {
      fetch(`${API_URL}/init`)
        .then(response => response.json())
        .then(data => {
          console.log('Init response:', data);
          updateConnectionStatus('Initializing WhatsApp...', 'info');
        })
        .catch(error => {
          console.error('Error initializing:', error);
          updateConnectionStatus('Error initializing WhatsApp', 'danger');
        });
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch(`${API_URL}/logout`)
        .then(response => response.json())
        .then(data => {
          console.log('Logout response:', data);
          updateConnectionStatus('WhatsApp logged out', 'warning');
        })
        .catch(error => {
          console.error('Error logging out:', error);
        });
    });
  }

  // Disconnect button
  const disconnectBtn = document.getElementById('disconnectBtn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      fetch(`${API_URL}/logout`)
        .then(response => response.json())
        .then(data => {
          console.log('Disconnect response:', data);
          updateConnectionStatus('WhatsApp disconnected', 'warning');
        })
        .catch(error => {
          console.error('Error disconnecting:', error);
        });
    });
  }

  // Check initial status
  fetch(`${API_URL}/status`)
    .then(response => response.json())
    .then(data => {
      console.log('Initial status:', data);
      if (data.success && data.state === 'CONNECTED') {
        isConnected = true;
        const statusCard = document.getElementById('statusCard');
        const connectedCard = document.getElementById('connectedCard');
        const messagesCard = document.getElementById('messagesCard');

        if (statusCard) statusCard.style.display = 'none';
        if (connectedCard) connectedCard.style.display = 'block';
        if (messagesCard) messagesCard.style.display = 'block';
        loadMessages();
      } else {
        updateConnectionStatus('WhatsApp not connected', 'warning');
      }
    })
    .catch(error => {
      console.error('Error checking status:', error);
      updateConnectionStatus('Error checking status', 'danger');
    });
});
