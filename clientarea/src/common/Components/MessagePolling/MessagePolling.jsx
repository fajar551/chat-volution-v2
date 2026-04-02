import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector } from '../../../app/Auth/AuthSlice';
import { messageSelector, updateListBubbleChat } from '../../../app/Message/MessageSlice';
import { store } from '../../../app/store';
import clientAPI from '../../API/ClientAPI';

// Set true hanya saat debug polling (supaya console tidak penuh tiap 3 detik)
const DEBUG_POLLING = false;

const MessagePolling = () => {
  const dispatch = useDispatch();
  const { chatId } = useSelector(messageSelector);
  const { clientSessions } = useSelector(authSelector) || {};
  const pollingStarted = useRef(false);
  const processedMessages = useRef(new Set());
  const retryCount = useRef(0);
  const maxRetries = 3;
  const pollingInterval = useRef(null);

  // Get current user email for better client detection
  const currentUserEmail = clientSessions?.email || clientSessions?.user_email || clientSessions?.emailClient || window.__currentUserEmail || null;

  // Stop polling function
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    pollingStarted.current = false;
    retryCount.current = 0;
    if (DEBUG_POLLING) console.log('⏹️ Stopping message polling');
  }, []);

  // Process new message with enhanced filtering
  const processNewMessage = useCallback((newMessage) => {
    if (DEBUG_POLLING) {
      console.log('📨 New message received via polling:', newMessage);
      console.log('📨 Message details:', { id: newMessage.id, message: newMessage.message, from: newMessage.from });
    }

    // Filter out system messages like 'newchat' and encrypted messages
    if (newMessage.action_name === 'newchat' ||
      newMessage.message?.includes('chatisencrypted:') ||
      newMessage.message?.includes('U2FsdGVkX1+') ||
      newMessage.message?.includes('encrypted') ||
      newMessage.message?.includes('system')) {
      if (DEBUG_POLLING) console.log('🚫 System message detected, skipping:', newMessage.action_name || 'encrypted message');
      return;
    }

    // Check if message has content (text or media/file)
    const hasTextContent = !!(newMessage.message || newMessage.body || newMessage.messsage);
    const hasMediaContent = !!(newMessage.mediaData || newMessage.media_data);

    if (!hasTextContent && !hasMediaContent) {
      if (DEBUG_POLLING) console.log('🚫 Message has no content, skipping');
      return;
    }

    if (DEBUG_POLLING) console.log('✅ Message passed filtering, processing...');

    // Normalize fields
    const normalizedText = newMessage.message || newMessage.body || newMessage.messsage || '';
    const normalizedFrom = newMessage.from || 'agent';

    const rawTimestamp = newMessage.timestamp || newMessage.created_at || newMessage.receivedAt;
    const messageTime = rawTimestamp ? new Date(rawTimestamp).getTime() : 0;

    // Skip echo of client's own last sent message (within 30s)
    try {
      const last = clientAPI.lastSent || { id: null, text: null, at: 0 };
      const withinWindow = Date.now() - (last.at || 0) <= 30000; // 30 seconds

      // Check if this is a client message (not from agent)
      const isClientMessage = normalizedFrom === 'client' ||
        (currentUserEmail && normalizedFrom === currentUserEmail) ||
        (normalizedFrom && normalizedFrom.includes('@') && normalizedFrom !== 'agent');

      const sameText = normalizedText && last.text && normalizedText.trim() === String(last.text).trim();
      const sameId = newMessage.id && last.id && String(newMessage.id) === String(last.id);

      // Also check if message is from current user email
      const isCurrentUser = currentUserEmail && normalizedFrom === currentUserEmail;

      if ((isClientMessage || isCurrentUser) && withinWindow && (sameText || sameId)) {
        if (DEBUG_POLLING) console.log('🚫 Skipping client echo message');
        return;
      }

      // Additional check: if message is from client and matches any recent sent message
      if (isClientMessage && normalizedText && last.text && normalizedText.trim() === last.text.trim()) {
        if (DEBUG_POLLING) console.log('🚫 Skipping client echo message (text match)');
        return;
      }
    } catch (_) { }

    // Skip client messages that are not from agent (they should only come from WebSocket, not polling)
    const isClientMessage = normalizedFrom === 'client' ||
      (currentUserEmail && normalizedFrom === currentUserEmail) ||
      (normalizedFrom && normalizedFrom.includes('@') && normalizedFrom !== 'agent');

    if (isClientMessage) {
      if (DEBUG_POLLING) console.log('🚫 Skipping client message from polling');
      return;
    }

    // Check for duplicate messages: pakai id/message_id supaya sama meski body API beda (penuh vs terpotong)
    const messageId = newMessage.id ?? newMessage.messageId ?? newMessage.message_id ?? newMessage.timestamp ?? normalizedText;
    const messageKey = (newMessage.id != null ? String(newMessage.id) : null)
      || (newMessage.messageId || newMessage.message_id || null)
      || `${String(normalizedText).slice(0, 80)}_${normalizedFrom}`;

    // Cek duplikat: skip jika id ATAU message_id sudah pernah diproses (API kadang beda shape)
    const numId = newMessage.id != null ? String(newMessage.id) : null;
    const strId = newMessage.messageId || newMessage.message_id || null;
    if (numId && processedMessages.current.has(numId)) {
      if (DEBUG_POLLING) console.log('🚫 Duplicate by id, skipping:', numId);
      return;
    }
    if (strId && processedMessages.current.has(strId)) {
      if (DEBUG_POLLING) console.log('🚫 Duplicate by message_id, skipping:', strId);
      return;
    }
    if (processedMessages.current.has(messageKey)) {
      if (DEBUG_POLLING) console.log('🚫 Duplicate message detected, skipping:', messageKey);
      return;
    }

    // Additional duplicate check: if message is from client and we just processed a similar one
    try {
      const last = clientAPI.lastSent || { id: null, text: null, at: 0 };
      const isClientMessage = normalizedFrom === 'client' ||
        (currentUserEmail && normalizedFrom === currentUserEmail) ||
        (normalizedFrom && normalizedFrom.includes('@') && normalizedFrom !== 'agent');

      if (isClientMessage && last.text && normalizedText.trim() === last.text.trim()) {
        if (DEBUG_POLLING) console.log('🚫 Duplicate client message detected, skipping');
        return;
      }
    } catch (_) { }

    // Check if message is too old (older than 2 minutes)
    const currentTime = Date.now();
    const timeDiff = messageTime > 0 ? currentTime - messageTime : 0;
    if (timeDiff > 120000) { // 2 minutes
      if (DEBUG_POLLING) console.log('🚫 Message too old, skipping:', timeDiff + 'ms old');
      return;
    }

    // Simpan semua identifier supaya poll berikutnya (bentuk API beda) tetap terdeteksi duplikat
    const keysToTrack = [messageKey];
    if (numId) keysToTrack.push(numId);
    if (strId) keysToTrack.push(strId);
    keysToTrack.forEach((k) => processedMessages.current.add(k));
    setTimeout(() => {
      keysToTrack.forEach((k) => processedMessages.current.delete(k));
    }, 300000); // 5 menit

    if (DEBUG_POLLING) console.log('📨 Processing new message:', { id: messageId, from: normalizedFrom });

    // Extract file data from mediaData (backend format) or direct file fields
    let fileData = null;
    if (newMessage.mediaData || newMessage.media_data) {
      const mediaData = newMessage.mediaData || newMessage.media_data;
      fileData = {
        file_id: mediaData.fileId || mediaData.file_id || null,
        file_name: mediaData.fileName || mediaData.file_name || null,
        file_path: mediaData.filePath || mediaData.file_path || null,
        file_url: mediaData.fileUrl || mediaData.file_url || null,
        file_type: mediaData.fileType || mediaData.file_type || null,
      };
    } else if (newMessage.file_id || newMessage.file_name || newMessage.file_url) {
      // Direct file fields (legacy format)
      fileData = {
        file_id: newMessage.file_id || null,
        file_name: newMessage.file_name || null,
        file_path: newMessage.file_path || null,
        file_url: newMessage.file_url || null,
        file_type: newMessage.file_type || null,
      };
    }

    // Transform message to match client area format (simpan messageId agar dedupe konsisten dengan Form.jsx / API)
    const transformedMessage = {
      id: newMessage.id ?? messageId,
      messageId: newMessage.messageId || newMessage.message_id || null,
      message: normalizedText,
      from: normalizedFrom,
      created_at: newMessage.created_at || newMessage.receivedAt || newMessage.timestamp || new Date().toISOString(),
      is_sender: normalizedFrom === 'client' || (currentUserEmail && normalizedFrom === currentUserEmail),
      is_netral: false,
      netral_type: null,
      agent_name: newMessage.agent_name || newMessage.name || 'Agent',
      agent_avatar: newMessage.agent_avatar || null,
      file_id: fileData?.file_id || null,
      file_name: fileData?.file_name || null,
      file_path: fileData?.file_path || null,
      file_url: fileData?.file_url || null,
      file_type: fileData?.file_type || null,
      success: true,
      updated_at: newMessage.updated_at || newMessage.receivedAt || new Date().toISOString(),
      user_email: newMessage.user_email || null,
      user_name: newMessage.user_name || null,
      user_phone: newMessage.user_phone || null,
      no_telegram: newMessage.no_telegram || null,
      no_whatsapp: newMessage.no_whatsapp || null,
      telegram_id: newMessage.telegram_id || null,
      formatted_date: newMessage.formatted_date || newMessage.receivedAt || new Date().toISOString()
    };

    // Helper: normalisasi timestamp untuk perbandingan (hindari beda format ISO)
    const normTime = (t) => {
      if (!t) return 0;
      const d = new Date(t);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    // Cegah duplikat: id, message_id, atau isi+from (dengan normalisasi teks)
    const currentList = store.getState()?.messageSetup?.listBubbleChat || [];
    const normText = (s) => String(s || '').trim().replace(/\s+/g, ' ');
    const msgText = normText(transformedMessage.message);
    const msgFrom = (transformedMessage.from || '').toLowerCase();
    const msgTime = normTime(transformedMessage.created_at);
    const msgId = transformedMessage.id;
    const msgMessageId = transformedMessage.messageId || transformedMessage.message_id;

    const alreadyInList = currentList.some((m) => {
      const sameId = msgId != null && m.id != null && String(m.id) === String(msgId);
      if (sameId) return true;
      const sameMessageId = msgMessageId && (m.messageId || m.message_id) && (m.messageId || m.message_id) === msgMessageId;
      if (sameMessageId) return true;

      const mText = normText(m.message);
      const mFrom = (m.from || '').toLowerCase();
      const mTime = normTime(m.created_at);

      const sameText = msgText && mText && msgText === mText;
      const sameFrom = msgFrom === mFrom;
      const timeWithin = Math.abs(msgTime - mTime) < 5000;
      if (sameText && sameFrom && timeWithin) return true;

      // Agent: duplikat jika dari agent dan isi sama, atau satu berisi yang lain (API kadang truncate)
      if (msgFrom === 'agent' && sameFrom) {
        if (sameText) return true;
        if (msgText && mText && (msgText.includes(mText) || mText.includes(msgText))) return true;
      }
      return false;
    });
    if (alreadyInList) {
      if (DEBUG_POLLING) console.log('🚫 Duplicate message already in list, skipping');
      return;
    }

    // Add message to chat
    dispatch(updateListBubbleChat(transformedMessage));
  }, [dispatch, currentUserEmail]);

  // Enhanced polling function with retry logic
  const startEnhancedPolling = useCallback((chatId) => {
    if (DEBUG_POLLING) console.log('🔄 Starting enhanced polling for chat:', chatId);

    // Clear any existing polling to prevent duplicates
    if (pollingInterval.current) {
      if (DEBUG_POLLING) console.log('⏹️ Clearing existing polling interval');
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    // Reset retry count
    retryCount.current = 0;

    // Start polling with error handling
    pollingInterval.current = setInterval(async () => {
      try {
        const result = await clientAPI.getMessages(chatId);
        if (result.success && result.messages.length > 0) {
          // Sort by timestamp/created_at to ensure correct order
          const sorted = [...result.messages].sort((a, b) => {
            const ta = new Date(a.created_at || a.timestamp || 0).getTime();
            const tb = new Date(b.created_at || b.timestamp || 0).getTime();
            return ta - tb;
          });
          if (DEBUG_POLLING) console.log('📨 Polling messages:', sorted.length);

          // Reset retry count on successful request
          retryCount.current = 0;

          // Process new messages
          sorted.forEach(newMessage => {
            processNewMessage(newMessage);
          });
        } else {
          if (DEBUG_POLLING) console.log('📨 No new messages found');
        }
      } catch (error) {
        console.error('❌ Error polling messages:', error);

        // Check if it's a 404 error (room not found yet)
        if (error.message && error.message.includes('404')) {
          if (DEBUG_POLLING) console.log('🔄 Room not found yet (404), will retry...');
          retryCount.current += 1;

          if (retryCount.current >= maxRetries) {
            console.error('❌ Max retry attempts reached for 404, stopping polling');
            stopPolling();
          } else {
            // Exponential backoff: 2s, 4s, 8s, 16s
            const retryDelay = Math.min(2000 * Math.pow(2, retryCount.current - 1), 16000);
            if (DEBUG_POLLING) console.log(`🔄 Retrying in ${retryDelay / 1000}s for 404... (${retryCount.current}/${maxRetries})`);

            // Clear current interval and restart with delay
            if (pollingInterval.current) {
              clearInterval(pollingInterval.current);
              pollingInterval.current = null;
            }

            setTimeout(() => {
              startEnhancedPolling(chatId);
            }, retryDelay);
          }
        } else {
          console.error('❌ Non-404 error, stopping polling');
          stopPolling();
        }
      }
    }, 3000); // Poll every 3 seconds
  }, [processNewMessage, stopPolling]);

  // Consolidated polling logic - single useEffect to prevent race conditions
  useEffect(() => {
    if (DEBUG_POLLING) {
      console.log('🔍 MessagePolling - chatId:', chatId, 'clientSessions.chatId:', clientSessions?.chatId);
    }

    // Determine which chatId to use (prioritize clientSessions.chatId)
    const activeChatId = clientSessions?.chatId || chatId;

    if (activeChatId && !pollingStarted.current) {
      if (DEBUG_POLLING) console.log('🔄 Starting message polling for chat:', activeChatId);
      pollingStarted.current = true;
      retryCount.current = 0;

      // Stop any existing polling first to prevent duplicates
      stopPolling();

      // Add initial delay to allow room key to be created in Redis
      setTimeout(() => {
        startEnhancedPolling(activeChatId);
      }, 3000);
    } else if (!activeChatId && pollingStarted.current) {
      if (DEBUG_POLLING) console.log('⏹️ No active chat, stopping polling');
      stopPolling();
    } else if (activeChatId && pollingStarted.current) {
      if (DEBUG_POLLING) console.log('🔄 Chat ID changed, restarting polling:', activeChatId);
      stopPolling();
      pollingStarted.current = false;
    } else if (activeChatId && pollingStarted.current && pollingInterval.current) {
      if (DEBUG_POLLING) console.log('🔄 Already polling for this chat, skipping');
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [chatId, clientSessions?.chatId, dispatch, startEnhancedPolling, stopPolling]);

  return null; // This component doesn't render anything
};

export default MessagePolling;
