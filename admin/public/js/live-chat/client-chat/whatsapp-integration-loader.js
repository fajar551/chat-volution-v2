// WhatsApp Socket V2 Integration Loader for Client Chat
(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    socketUrl: 'http://103.102.153.200:4005',
    apiUrl: 'http://103.102.153.200:4005',
    autoConnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  };

  // Global WhatsApp integration instance
  window.WhatsAppIntegration = null;

  // Initialize WhatsApp integration
  function initWhatsAppIntegration() {
    if (window.WhatsAppIntegration) {
      console.log('WhatsApp integration already initialized');
      return;
    }

    // Load required CSS
    loadCSS('/css/live-chat/client-chat/whatsapp-socket-v2-integration.css');

    // Load WhatsApp integration script
    loadScript('/js/live-chat/client-chat/whatsapp-socket-v2-integration.js', function () {
      console.log('WhatsApp Socket V2 Integration loaded');

      // Initialize the integration
      if (typeof WhatsAppSocketV2Integration !== 'undefined') {
        window.WhatsAppIntegration = new WhatsAppSocketV2Integration();
        console.log('WhatsApp Socket V2 Integration initialized');
      }
    });
  }

  // Load CSS dynamically
  function loadCSS(href) {
    if (document.querySelector(`link[href="${href}"]`)) {
      return; // Already loaded
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // Load JavaScript dynamically
  function loadScript(src, callback) {
    if (document.querySelector(`script[src="${src}"]`)) {
      if (callback) callback();
      return; // Already loaded
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = function () {
      console.error('Failed to load WhatsApp integration script:', src);
    };
    document.head.appendChild(script);
  }

  // Check if we're on the client chat page
  function isClientChatPage() {
    return window.location.pathname.includes('/chat-with-client') ||
      document.querySelector('.chat-container') ||
      document.querySelector('#chatMessages') ||
      document.querySelector('.chat-messages') ||
      document.querySelector('.messages-container');
  }

  // Add WhatsApp status indicator to the page
  function addStatusIndicator() {
    if (document.querySelector('.whatsapp-status')) {
      return; // Already added
    }

    const statusDiv = document.createElement('div');
    statusDiv.className = 'whatsapp-status';
    statusDiv.innerHTML = '<span class="badge badge-danger">WhatsApp Disconnected</span>';

    // Try to find a good place to insert the status indicator
    const header = document.querySelector('.page-header') ||
      document.querySelector('.header') ||
      document.querySelector('.navbar') ||
      document.querySelector('header');

    if (header) {
      header.appendChild(statusDiv);
    } else {
      document.body.insertBefore(statusDiv, document.body.firstChild);
    }
  }

  // Add WhatsApp integration panel to the page
  function addIntegrationPanel() {
    if (document.querySelector('.whatsapp-integration-panel')) {
      return; // Already added
    }

    const panel = document.createElement('div');
    panel.className = 'whatsapp-integration-panel';
    panel.innerHTML = `
            <h6><i class="fab fa-whatsapp"></i> WhatsApp Socket V2 Integration</h6>
            <div class="status-indicator status-disconnected"></div>
            <span class="connection-status">Disconnected</span>
            <div class="mt-2">
                <button id="whatsappConnectBtn" class="btn btn-sm btn-success">Connect</button>
                <button id="whatsappDisconnectBtn" class="btn btn-sm btn-danger" style="display: none;">Disconnect</button>
            </div>
        `;

    // Try to find a good place to insert the panel
    const sidebar = document.querySelector('.sidebar') ||
      document.querySelector('.chat-sidebar') ||
      document.querySelector('.left-panel');

    if (sidebar) {
      sidebar.insertBefore(panel, sidebar.firstChild);
    } else {
      const mainContent = document.querySelector('.main-content') ||
        document.querySelector('.content') ||
        document.querySelector('main');
      if (mainContent) {
        mainContent.insertBefore(panel, mainContent.firstChild);
      }
    }

    // Add event listeners for buttons
    const connectBtn = document.getElementById('whatsappConnectBtn');
    const disconnectBtn = document.getElementById('whatsappDisconnectBtn');

    if (connectBtn) {
      connectBtn.addEventListener('click', function () {
        if (window.WhatsAppIntegration) {
          window.WhatsAppIntegration.connectSocket();
        }
      });
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', function () {
        if (window.WhatsAppIntegration) {
          window.WhatsAppIntegration.socket.disconnect();
        }
      });
    }
  }

  // Update integration panel status
  function updateIntegrationPanelStatus(status, message) {
    const statusIndicator = document.querySelector('.status-indicator');
    const connectionStatus = document.querySelector('.connection-status');
    const connectBtn = document.getElementById('whatsappConnectBtn');
    const disconnectBtn = document.getElementById('whatsappDisconnectBtn');

    if (statusIndicator) {
      statusIndicator.className = `status-indicator status-${status}`;
    }

    if (connectionStatus) {
      connectionStatus.textContent = message;
    }

    if (status === 'connected') {
      if (connectBtn) connectBtn.style.display = 'none';
      if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
    } else {
      if (connectBtn) connectBtn.style.display = 'inline-block';
      if (disconnectBtn) disconnectBtn.style.display = 'none';
    }
  }

  // Monitor WhatsApp integration status
  function monitorIntegrationStatus() {
    if (!window.WhatsAppIntegration) return;

    const socket = window.WhatsAppIntegration.socket;
    if (socket) {
      if (socket.connected) {
        updateIntegrationPanelStatus('connected', 'Connected');
      } else {
        updateIntegrationPanelStatus('disconnected', 'Disconnected');
      }
    }
  }

  // Initialize when DOM is ready
  function initialize() {
    if (!isClientChatPage()) {
      console.log('Not on client chat page, skipping WhatsApp integration');
      return;
    }

    console.log('Initializing WhatsApp Socket V2 Integration for Client Chat');

    // Add status indicator
    addStatusIndicator();

    // Add integration panel
    addIntegrationPanel();

    // Initialize WhatsApp integration
    initWhatsAppIntegration();

    // Monitor status every 5 seconds
    setInterval(monitorIntegrationStatus, 5000);
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Expose global functions
  window.initWhatsAppIntegration = initWhatsAppIntegration;
  window.updateWhatsAppStatus = updateIntegrationPanelStatus;

})();
