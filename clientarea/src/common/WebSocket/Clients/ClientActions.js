import clientAPI from '../../API/ClientAPI';
import Socket from '../Socket';

export const refreshAuth = async (data) => {
  // Use API instead of WebSocket for chat creation
  console.log('🔄 Refreshing auth via API...');
  const result = await clientAPI.createChat(data);
  if (result.success) {
    console.log('✅ Chat created successfully via API');

    // Enable reconnection and connect socket for active session
    try {
      Socket.io.opts.reconnection = true;
      if (!Socket.connected) {
        Socket.connect();
      }
    } catch (e) {
      console.warn('Socket connect error:', e);
    }

    // Join chat room for real-time communication
    const chatId = result.data?.data?.chatId;
    if (chatId) {
      // set global flag for active chat so listeners can emit chat.new
      window.__activeChatId = chatId;
      joinChatRoom(chatId);
    }
  } else {
    console.error('❌ Failed to create chat via API:', result.error);
  }
  return result;
};

export const joinChatRoom = (chatId) => {
  // Join chat room for real-time communication
  console.log('🔗 Joining chat room:', chatId);
  Socket.emit('join', { room: chatId });
};

export const sendMessage = async (chatId, message, file = {}) => {
  // Use API instead of WebSocket for sending messages
  console.log('📤 Sending message via API...');
  const result = await clientAPI.sendMessage(chatId, message, file);
  if (result.success) {
    console.log('✅ Message sent successfully via API');
  } else {
    console.error('❌ Failed to send message via API:', result.error);
  }
  return result;
};

// Function to clear connect.sid cookie
const clearConnectSidCookie = () => {
  // Get all cookies
  const cookies = document.cookie.split(';');

  // Find and remove connect.sid cookie
  cookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName === 'connect.sid') {
      // Remove cookie by setting it to expire in the past
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      console.log('✅ connect.sid cookie cleared');
    }
  });
};

export const resolveChat = async (chatId) => {
  // Use API instead of WebSocket for ending chat
  console.log('🔚 Ending chat via API...');
  const result = await clientAPI.endChat(chatId);
  if (result.success) {
    console.log('✅ Chat ended successfully via API');

    // Clear connect.sid cookie to disconnect session
    clearConnectSidCookie();

    // Disable reconnection and disconnect socket
    try {
      Socket.io.opts.reconnection = false;
      if (Socket.connected) {
        Socket.disconnect();
      }
    } catch (e) {
      console.warn('Socket disconnect error:', e);
    }

    // clear global active chat flag
    try { delete window.__activeChatId; } catch (e) {}

    // Clear chat session to allow new chat creation
    // This will be handled by the component that calls resolveChat
  } else {
    console.error('❌ Failed to end chat via API:', result.error);
  }
  return result;
};
