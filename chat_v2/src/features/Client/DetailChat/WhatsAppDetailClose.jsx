import classNames from 'classnames';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import { authSelector } from '../../../app/Auth/AuthSlice';
import BubbleChatClient from '../../../Common/Components/BubbleChat/BubbleChatClient';
import { resetAllStateInputChat } from '../../../Common/Components/InputChat/InputChatSlice';
import ProfileClientChat from '../../../Common/Components/UserProfileSidebar/ProfileClientChat';
import whatsappIntegration from '../../../whatsapp-integration';
import { closeChat, detailChatClientSelector, updateStatusRightBar } from './DetailChatClientSlice';
import Header from './Header';
import HeaderLoader from './HeaderLoader';

function WhatsAppDetailClose() {
  const dispatch = useDispatch();
  const { chatId, rightBarMenu } = useSelector(detailChatClientSelector);
  const { user } = useSelector(authSelector);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [searchMessageQuery, setSearchMessageQuery] = useState('');
  const [agentNames, setAgentNames] = useState({}); // Cache for agent names
  const phoneRef = useRef(phone);

  // Helper function to format receivedAt as local time without timezone conversion
  // receivedAt from DB is in format '2025-11-20 10:08:41' (local time WIB, UTC+7)
  // Problem: Moment.js treats strings without timezone as UTC, so '10:08:41' becomes '17:08:41' (UTC+7)
  // Solution: Get browser timezone offset and adjust the string to include timezone info
  // so moment.js knows this is already local time and won't convert it
  const formatReceivedAtAsLocal = (receivedAt) => {
    if (!receivedAt) return new Date().toISOString();

    // If receivedAt is already in ISO format with timezone, use it as is
    if (receivedAt.includes('T') && (receivedAt.includes('Z') || receivedAt.includes('+'))) {
      return receivedAt;
    }

    // receivedAt is in format 'YYYY-MM-DD HH:mm:ss' (local time WIB from DB)
    // Get browser timezone offset in minutes
    const now = new Date();
    const timezoneOffset = -now.getTimezoneOffset(); // Offset in minutes (positive for UTC+)
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
    const offsetMinutes = Math.abs(timezoneOffset) % 60;
    const offsetSign = timezoneOffset >= 0 ? '+' : '-';
    const offsetStr = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

    // Convert to ISO format with browser's timezone offset
    // This tells moment.js that the time is already in the correct timezone
    const dateStr = receivedAt.replace(' ', 'T'); // '2025-11-20T10:08:41'
    return `${dateStr}${offsetStr}`;
  };

  // Fetch agent name by agent_id (same as WhatsAppDetail)
  const fetchAgentName = useCallback(async (agentId) => {
    if (!agentId) {
      return null;
    }

    const agentIdStr = String(agentId);

    // Skip if agentId is not a valid number (e.g., "ai-assistant", "me", etc.)
    if (isNaN(agentIdStr) || agentIdStr.includes('-') || agentIdStr.includes('_')) {
      // console.log(`⏭️ Skipping fetch for invalid agent ID: ${agentIdStr}`);
      return null;
    }

    // Return from cache if already fetched
    if (agentNames[agentIdStr]) {
      return agentNames[agentIdStr];
    }

    try {
      // Try to get token from multiple sources
      let token = user?.token;
      if (!token) {
        token = localStorage.getItem('tk') || localStorage.getItem('token');
      }

      // If still no token, try to get from user object in localStorage
      if (!token) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            token = parsedUser.token || parsedUser.tk || parsedUser.access_token;
          }
        } catch (e) {
          console.warn('Failed to parse user from localStorage:', e);
        }
      }

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // console.log(`🔑 Fetching agent ${agentId} from wa-socket-v2 API`);

      // Get instance from phoneToInstance map, or default to wa1
      const instance = whatsappIntegration.phoneToInstance?.get(phoneRef.current) || 'wa1';

      // Fetch from wa-socket-v2 endpoint (queries database directly)
      const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/agent/${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // console.log(`🔍 Agent ${agentId} response status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        // console.log(`📋 Agent ${agentId} API response:`, data);

        // Endpoint returns: { success: true, agentId: "...", agentName: "...", agentData: {...} }
        if (data.success && data.agentName) {
          const agentName = data.agentName;
          // console.log(`✅ Successfully got agent name for ID ${agentId}: "${agentName}"`);
          setAgentNames(prev => ({ ...prev, [agentIdStr]: agentName }));
          return agentName;
        } else {
          console.warn(`⚠️ API returned success but no agentName for ${agentId}:`, data);
        }
      } else {
        const errorText = await response.text();
        console.warn(`⚠️ Failed to fetch agent ${agentId} (${response.status}):`, errorText);
      }
    } catch (error) {
      console.error(`❌ Error fetching agent name for ID ${agentId}:`, error.message || error);
    }

    // Fallback: use agent ID temporarily
    const fallbackName = `Agent ${agentId}`;
    setAgentNames(prev => {
      // Only set fallback if not already set (to avoid overwriting if fetch succeeds later)
      if (!prev[agentIdStr] || prev[agentIdStr] === fallbackName) {
        return { ...prev, [agentIdStr]: fallbackName };
      }
      return prev;
    });

    return fallbackName;
  }, [agentNames, user?.token]);

  // Load WhatsApp messages - ONLY closed messages for history view
  const loadWhatsAppMessages = useCallback(async (phoneNumber) => {
    try {
      setIsLoading(true);

      // Get instance from phoneToInstance map (should be set when chat_id is parsed)
      // This ensures we only load messages from the correct instance
      const instance = whatsappIntegration.phoneToInstance?.get(phoneNumber);

      if (!instance) {
        console.warn('⚠️ [History] No instance found for phone number, cannot load messages');
        setMessages([]);
        setIsLoading(false);
        return;
      }

      // Try to get messages from selectChat, with fallback to direct API call
      let result = null;
      try {
        result = await whatsappIntegration.selectChat(phoneNumber);
      } catch (selectChatError) {
        console.warn('⚠️ [History] selectChat failed, trying direct API call:', selectChatError);
        // Fallback: Direct API call to database with includeClosed
        // ONLY try from the known instance (don't try all instances)
        const instancesToCheck = instance ? [instance] : [];

        // Only try from the specific instance (don't loop through all instances)
        if (instancesToCheck.length > 0) {
          const instanceName = instancesToCheck[0]; // Only use the first (and only) instance
          try {
            let url = `https://waserverlive.genio.id/${instanceName}/api/whatsapp/messages/${phoneNumber}`;
            url += '?includeClosed=true'; // Always include closed for history view
            //console.log(`🔄 [History] Fallback: Fetching directly from ${url} (instance: ${instanceName})`);

            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            if (response.ok) {
              const responseText = await response.text();
              let data;
              try {
                data = JSON.parse(responseText);
              } catch (parseError) {
                console.error('❌ [History] Failed to parse JSON from direct API call:', parseError);
                console.error('❌ [History] Response text:', responseText.substring(0, 200));
                result = { success: true, messages: [] };
              }

              if (data && data.success) {
                // Filter messages to only include those from the correct instance
                const filteredMessages = (data.messages || []).filter(msg => {
                  // Only include messages that match the instance
                  return msg.instance === instanceName || !msg.instance;
                }).map(msg => ({
                  ...msg,
                  instance: instanceName // Ensure instance is set
                }));

                result = {
                  success: true,
                  messages: filteredMessages
                };
                //console.log(`✅ [History] Fallback: Loaded ${filteredMessages.length} messages from direct API call (${instanceName})`);
              } else {
                result = { success: true, messages: [] };
              }
            } else {
              result = { success: true, messages: [] };
            }
          } catch (error) {
            console.warn(`⚠️ [History] Failed to fetch from ${instanceName}:`, error);
            result = { success: true, messages: [] };
          }
        } else {
          // No instance found, return empty result
          result = { success: true, messages: [] };
        }
      }

      if (result && result.success && result.messages) {
        //console.log(`📊 [History] Loaded ${result.messages.length} messages from selectChat for phone: ${phoneNumber}`);

        // Get the instance for this phone to filter messages
        const expectedInstance = whatsappIntegration.phoneToInstance?.get(phoneNumber);

        // ALWAYS filter only closed messages for history view AND filter by instance
        // This ensures history doesn't show new open messages and only shows messages from the correct instance
        // STRICT: Only show messages with chat_status='closed' AND matching instance
        const closedMessages = result.messages.filter(msg => {
          // Must be closed
          if (msg.chat_status !== 'closed') {
            return false;
          }
          // Must match the expected instance (if instance is set)
          if (expectedInstance && msg.instance && msg.instance !== expectedInstance) {
            return false;
          }
          return true;
        });

        // Check if there are any open messages
        // IMPORTANT: Even if there are open messages, we should still show closed messages in history view
        // This allows viewing closed chat history even when chat is reopened
        const hasOpenMessages = result.messages.some(msg => msg.chat_status === 'open');
        const hasClosedMessages = closedMessages.length > 0;

        // If there are closed messages, show them even if there are also open messages
        // This allows viewing closed chat history even when chat is reopened
        if (hasClosedMessages) {
          // Show closed messages - this is history view, so closed messages should be visible
          //console.log(`📊 [History] Showing ${closedMessages.length} closed messages (open messages may exist but showing closed for history)`);
        } else if (hasOpenMessages && !hasClosedMessages) {
          // Only open messages, no closed messages - this should be in WhatsAppDetail, not WhatsAppDetailClose
          console.warn('⚠️ [History] Chat has only open messages, no closed messages - this should be in WhatsAppDetail, not WhatsAppDetailClose');
          setMessages([]);
          setIsLoading(false);
          return;
        } else if (!hasClosedMessages) {
          // No closed messages found - show empty
          console.warn('⚠️ [History] No messages with chat_status="closed" found. Showing empty for closed chat view.');
          setMessages([]);
          setIsLoading(false);
          return;
        }

        //console.log(`📊 [History] Filtered to ${closedMessages.length} closed messages (history view only)`);
        setMessages(closedMessages);

        // Sort messages by timestamp to ensure correct order
        const sortedMessages = closedMessages;
        const finalMessages = sortedMessages.sort((a, b) => {
          // Use timestamp if available (Unix timestamp in seconds), otherwise use receivedAt
          const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
          const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
          return timestampA - timestampB;
        });

        // Debug: Log messages with media
        const messagesWithMedia = finalMessages.filter(msg => msg.hasMedia || msg.media || msg.media_data || msg.message_type === 'image' || msg.message_type === 'media');
        if (messagesWithMedia.length > 0) {
          //console.log('🖼️ [History][loadWhatsAppMessages] Found messages with media:', messagesWithMedia.length);
          messagesWithMedia.forEach((msg, idx) => {
            // console.log(`  ${idx + 1}. Message ${msg.id}:`, {
            //   hasMedia: msg.hasMedia,
            //   message_type: msg.message_type,
            //   hasMediaObj: !!msg.media,
            //   hasMediaData: !!msg.media_data,
            //   mediaKeys: msg.media ? Object.keys(msg.media) : null
            // });
          });
        }

        setMessages(finalMessages);

        // Extract agent IDs from messages and fetch agent names
        const agentIds = new Set();
        finalMessages.forEach(msg => {
          if (msg.from === 'me' || msg.direction === 'outgoing') {
            const agentId = msg.agent_id || msg.agentId;
            // Only add if it's a valid numeric agent ID
            if (agentId && !isNaN(String(agentId)) && !String(agentId).includes('-') && !String(agentId).includes('_')) {
              agentIds.add(String(agentId));
            }
          }
        });

        // Also add current user's agent_id if valid
        const currentAgentId = user?.agent_id || user?.id;
        const currentAgentIdStr = currentAgentId ? String(currentAgentId) : null;

        if (currentAgentIdStr && !isNaN(currentAgentIdStr) && !currentAgentIdStr.includes('-') && !currentAgentIdStr.includes('_')) {
          agentIds.add(currentAgentIdStr);
          // Pre-populate cache with current user's name_agent
          if (user?.name_agent && !agentNames[currentAgentIdStr]) {
            setAgentNames(prev => ({ ...prev, [currentAgentIdStr]: user.name_agent }));
            //console.log(`✅ Pre-populated current user's name: ${user.name_agent}`);
          }
        }

        //console.log('👥 Found agent IDs in messages:', Array.from(agentIds));

        // Fetch agent names for all unique agent IDs (skip current user since we already have it)
        agentIds.forEach(agentId => {
          const agentIdStr = String(agentId);
          // Skip fetching if this is current user (we already have name_agent)
          if (agentIdStr === currentAgentIdStr && user?.name_agent) {
            //console.log(`✅ Using current user's name_agent for ID ${agentIdStr}: ${user.name_agent}`);
            return;
          }

          if (!agentNames[agentIdStr]) {
            //console.log(`🔄 Fetching name for agent ID: ${agentIdStr}`);
            fetchAgentName(agentIdStr).catch(err => {
              console.error(`❌ Failed to fetch agent name for ${agentIdStr}:`, err);
            });
          } else {
            //console.log(`✅ Agent ID ${agentIdStr} already cached: ${agentNames[agentIdStr]}`);
          }
        });

        setIsLoading(false);
      } else {
        setMessages([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading WhatsApp messages (history):', error);
      setMessages([]);
      setIsLoading(false);
    }
  }, [agentNames, fetchAgentName, user]);

  useEffect(() => {
    if (chatId && chatId.startsWith('whatsapp-')) {
      // Extract phone number and instance from chat_id
      // Format can be: whatsapp-{phone} or whatsapp-{phone}-{instance}
      let phoneNumber = chatId.replace('whatsapp-', '').replace('-WA', '').replace('-CH', '');

      // Extract instance if present (e.g., -wa1, -wa2, etc.)
      const instancePattern = /-(wa[1-6])$/i;
      const instanceMatch = phoneNumber.match(instancePattern);
      let extractedInstance = null;

      if (instanceMatch) {
        extractedInstance = instanceMatch[1].toLowerCase();
        phoneNumber = phoneNumber.replace(instancePattern, '');
      }

      setPhone(phoneNumber);
      phoneRef.current = phoneNumber;

      // Set instance in phoneToInstance map if extracted
      if (extractedInstance) {
        whatsappIntegration.phoneToInstance.set(phoneNumber, extractedInstance);
      }

      loadWhatsAppMessages(phoneNumber);

      // Note: Assigned status is not needed for closed chat history view
    }
  }, [chatId, loadWhatsAppMessages]);

  // Listen for chat closed event to reload messages when chat is closed
  useEffect(() => {
    const handleChatClosed = (event) => {
      const { phone } = event.detail;
      const normalizedPhone = phone?.replace('@c.us', '') || phone;
      const currentPhone = phoneRef.current?.replace('@c.us', '') || phoneRef.current;

      // If this is the chat that was closed, reload messages to show all closed messages
      if (currentPhone && normalizedPhone === currentPhone) {
        console.log('🔄 [History] Chat closed, reloading messages to show all closed messages');
        // Reload messages after a short delay to ensure database is updated
        setTimeout(() => {
          loadWhatsAppMessages(currentPhone);
        }, 500);
      }
    };

    window.addEventListener('whatsapp:chatClosed', handleChatClosed);

    // Also listen for localStorage events (sync antar tab/browser)
    const handleStorageChange = (e) => {
      if (e.key === 'whatsapp:chatClosed' && e.newValue) {
        try {
          const eventData = JSON.parse(e.newValue);
          if (eventData.type === 'whatsapp:chatClosed') {
            handleChatClosed({
              detail: {
                phone: eventData.phone
              }
            });
          }
        } catch (error) {
          console.warn('Error parsing localStorage event:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('whatsapp:chatClosed', handleChatClosed);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadWhatsAppMessages]);

  // Open right bar menu by default for WhatsApp chats
  useEffect(() => {
    if (chatId && chatId.startsWith('whatsapp-')) {
      // Immediately open right bar menu
      dispatch(updateStatusRightBar(true));
    }
  }, [chatId, dispatch]);

  // Ensure rightBarMenu stays open after loading completes and whenever it gets closed
  // But don't auto-open on mobile devices
  useEffect(() => {
    if (chatId && chatId.startsWith('whatsapp-') && !rightBarMenu) {
      // Check if device is mobile (screen width < 768px)
      const isMobile = window.innerWidth < 768;
      // Only auto-open on desktop, not on mobile
      if (!isMobile) {
        // If it's a WhatsApp chat but rightBarMenu is closed, open it (desktop only)
        dispatch(updateStatusRightBar(true));
      }
    }
  }, [chatId, rightBarMenu, dispatch]);

  // NOTE: We do NOT listen to newMessage, messageSent, aiResponse events
  // because this is a history view - we only show closed messages
  // This prevents new open messages from appearing in history view

  // Fetch agent names when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const agentIds = new Set();
      messages.forEach(msg => {
        if (msg.from === 'me' || msg.direction === 'outgoing') {
          const agentId = msg.agent_id || msg.agentId;
          // Only add if it's a valid numeric agent ID
          if (agentId && !isNaN(String(agentId)) && !String(agentId).includes('-') && !String(agentId).includes('_')) {
            agentIds.add(String(agentId));
          }
        }
      });

      // Fetch names for all agent IDs that aren't in cache
      agentIds.forEach(agentId => {
        const agentIdStr = String(agentId);
        if (!agentNames[agentIdStr]) {
          fetchAgentName(agentIdStr).catch(err => {
            console.error(`❌ Failed to fetch agent name for ${agentIdStr}:`, err);
          });
        }
      });
    }
  }, [messages, fetchAgentName, agentNames]);

  // SimpleBar ref dan auto-scroll
  const scrollRef = useRef();
  useEffect(() => {
    const recalcAndScroll = async () => {
      if (scrollRef.current && scrollRef.current.recalculate) {
        await scrollRef.current.recalculate();
        if (scrollRef.current.el) {
          scrollRef.current.getScrollElement().scrollTop =
            scrollRef.current.getScrollElement().scrollHeight;
        }
      }
    };
    recalcAndScroll();
  }, [messages, agentNames]); // Add agentNames to trigger re-render

  // Filter messages based on search query
  const filterMessages = (msgs) => {
    if (!searchMessageQuery.trim()) {
      return msgs;
    }
    const query = searchMessageQuery.toLowerCase();
    return msgs.filter((msg) => {
      const body = String(msg.body || '').toLowerCase();
      const from = String(msg.from || '').toLowerCase();
      const phoneStr = String(phone || '').toLowerCase();
      return body.includes(query) || from.includes(query) || phoneStr.includes(query);
    });
  };

  const toBubbleData = (msg) => {
    const isFromAgent = msg.from === 'me';

    // Get agent_id from message if available (from database)
    let agentIdFromMessage = msg.agent_id || msg.agentId;

    // For outgoing messages, use current user's agent_id if not in message
    if (isFromAgent && !agentIdFromMessage) {
      agentIdFromMessage = user?.agent_id || user?.id;
    }

    // Get agent name from cache or use fallback
    const agentIdStr = agentIdFromMessage ? String(agentIdFromMessage) : null;
    let agentName = null;

    if (isFromAgent) {
      // Check if agentIdStr is a valid numeric ID
      const isValidAgentId = agentIdStr && !isNaN(agentIdStr) && !agentIdStr.includes('-') && !agentIdStr.includes('_');
      const currentAgentId = String(user?.agent_id || user?.id || '');

      if (isValidAgentId) {
        // If this is the current user, use user.name_agent directly
        if (agentIdStr === currentAgentId && user?.name_agent) {
          agentName = user.name_agent;
        }
        // Check cache for other agents
        else if (agentNames[agentIdStr] && agentNames[agentIdStr] !== `Agent ${agentIdStr}`) {
          // Use cached name (real name, not fallback)
          agentName = agentNames[agentIdStr];
        } else {
          // Use fallback temporarily and trigger fetch
          agentName = `Agent ${agentIdStr}`;
          // Fetch in background to update later - this will update agentNames state
          fetchAgentName(agentIdStr).then(fetchedName => {
            if (fetchedName && fetchedName !== `Agent ${agentIdStr}`) {
              //console.log(`✅ Agent name updated in UI for ${agentIdStr}: ${fetchedName}`);
              // Force component re-render by updating state
              setAgentNames(prev => ({ ...prev, [agentIdStr]: fetchedName }));
            }
          }).catch(err => {
            console.error(`❌ Error fetching agent name in toBubbleData:`, err);
          });
        }
      } else if (agentIdStr && (agentIdStr === 'ai-assistant' || agentIdStr.toLowerCase().includes('ai'))) {
        // Special case for AI assistant
        agentName = 'AI';
      } else {
        // No valid agent ID, use user name_agent or fallback
        agentName = user?.name_agent || user?.email || user?.name || 'Me';
      }
    }

    const displayName = isFromAgent ? agentName : phone;
    const avatar = isFromAgent
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f5f7fb&color=000`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(phone)}&background=ff8c00&color=fff`;

    // Handle media files - convert base64 to data URL and set file properties
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let fileId = null;

    // Check if message has media (multiple ways to detect)
    const hasMedia = msg.hasMedia ||
      msg.message_type === 'image' ||
      msg.message_type === 'media' ||
      !!msg.media ||
      !!msg.media_data;

    if (hasMedia) {
      let mimeType = '';
      let mediaDataObj = null;

      // Try to get media data from various sources
      if (msg.media && typeof msg.media === 'object') {
        // Media is already an object
        mediaDataObj = msg.media;
        mimeType = msg.mediaType || msg.media.mimetype || msg.media.mimeType || '';
        //console.log('✅ [History][toBubbleData] Using msg.media object:', {
        //   hasData: !!mediaDataObj.data,
        //   hasUrl: !!mediaDataObj.url,
        //   mimeType: mimeType
        // });
      } else if (msg.media_data) {
        // Media data is stored as JSON string or object
        try {
          if (typeof msg.media_data === 'string') {
            const trimmed = msg.media_data.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              mediaDataObj = JSON.parse(msg.media_data);
            } else {
              // If not JSON, treat as data URL or URL
              mediaDataObj = { url: msg.media_data, data: msg.media_data };
            }
          } else if (typeof msg.media_data === 'object') {
            mediaDataObj = msg.media_data;
          }
        } catch (parseError) {
          console.warn('⚠️ [History][toBubbleData] Failed to parse media_data:', parseError);
          mediaDataObj = { url: msg.media_data, data: msg.media_data };
        }
        mimeType = msg.mediaType || (mediaDataObj && (mediaDataObj.mimetype || mediaDataObj.mimeType)) || '';
        // console.log('✅ [History][toBubbleData] Using msg.media_data:', {
        //   hasData: !!mediaDataObj?.data,
        //   hasUrl: !!mediaDataObj?.url,
        //   mimeType: mimeType
        // });
      }

      // If we have media data, extract file URL
      if (mediaDataObj) {
        // If media has data (base64), convert to data URL
        if (mediaDataObj.data) {
          mimeType = mimeType || mediaDataObj.mimetype || mediaDataObj.mimeType || 'application/octet-stream';
          fileUrl = `data:${mimeType};base64,${mediaDataObj.data}`;
          //console.log('✅ [History][toBubbleData] Created data URL from base64, mimeType:', mimeType);
        } else if (mediaDataObj.url) {
          // If media has URL, use it directly
          fileUrl = mediaDataObj.url;
          //console.log('✅ [History][toBubbleData] Using media URL:', fileUrl.substring(0, 100));
        } else {
          console.warn('⚠️ [History][toBubbleData] mediaDataObj exists but has no data or url:', mediaDataObj);
        }
      } else {
        console.warn('⚠️ [History][toBubbleData] hasMedia is true but no mediaDataObj found');
      }

      // Get mimeType from message_type if not found yet
      if (!mimeType && msg.message_type === 'image') {
        mimeType = 'image/jpeg'; // Default to JPEG for images
        //console.log('✅ [History][toBubbleData] Using default image/jpeg for image message_type');
      }

      // Get filename and ensure it has a valid extension
      fileName = msg.filename ||
        (mediaDataObj && (mediaDataObj.filename || mediaDataObj.fileName)) ||
        `media_${msg.id}`;

      // Determine file type and ensure filename has extension
      let extension = '';

      if (mimeType && mimeType.startsWith('image/')) {
        fileType = 'image';
        extension = mimeType.split('/')[1] || 'jpg';
        // Check if filename has a valid extension (ends with .ext)
        const hasValidExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif)$/i.test(fileName);
        if (!hasValidExtension) {
          fileName = `${fileName}.${extension}`;
          //console.log('✅ [History][toBubbleData] Added extension to filename:', fileName);
        }
        // For images, ensure we have fileUrl
        if (!fileUrl && mediaDataObj && mediaDataObj.data) {
          fileUrl = `data:${mimeType};base64,${mediaDataObj.data}`;
          //console.log('✅ [History][toBubbleData] Created fileUrl for image from mediaDataObj.data');
        }
        //console.log('✅ [History][toBubbleData] Image file detected:', { fileType, fileUrl: fileUrl ? 'exists' : 'missing', fileName, mimeType });
      } else if (mimeType && mimeType.startsWith('video/')) {
        fileType = 'video';
        extension = mimeType.split('/')[1] || 'mp4';
        if (!fileName.includes('.')) {
          fileName = `${fileName}.${extension}`;
        }
      } else if (mimeType === 'application/pdf') {
        fileType = 'other'; // PDF
        if (!fileName.includes('.')) {
          fileName = `${fileName}.pdf`;
        }
      } else if (mimeType && (mimeType.includes('excel') || mimeType.includes('spreadsheet') || fileName.match(/\.(xls|xlsx)$/i))) {
        fileType = 'other'; // Excel
        if (!fileName.includes('.')) {
          fileName = `${fileName}.xlsx`;
        }
      } else if (mimeType && (mimeType.includes('word') || fileName.match(/\.(doc|docx)$/i))) {
        fileType = 'other'; // Word
        if (!fileName.includes('.')) {
          fileName = `${fileName}.docx`;
        }
      } else if (msg.message_type === 'image') {
        // Fallback: if message_type is image but no mimeType, assume image
        fileType = 'image';
        if (!fileName.includes('.')) {
          fileName = `${fileName}.jpg`;
        }
      } else {
        fileType = 'other'; // Other documents
        // Try to extract extension from mimeType or default to 'bin'
        if (mimeType && mimeType.includes('/')) {
          extension = mimeType.split('/')[1].split(';')[0]; // Remove charset if present
          if (!fileName.includes('.')) {
            fileName = `${fileName}.${extension}`;
          }
        } else if (!fileName.includes('.')) {
          fileName = `${fileName}.bin`;
        }
      }

      // Clean file_id to ensure it's safe (no special characters that could break CSS selectors)
      const rawFileId = msg.id || `file_${Date.now()}`;
      fileId = String(rawFileId).replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    const bubbleData = {
      agent_name: isFromAgent ? displayName : undefined,
      user_name: !isFromAgent ? displayName : undefined,
      avatar: avatar,
      message: msg.body || (hasMedia ? '' : ''), // Empty string for media, let MessageFile component handle display
      formatted_date: formatReceivedAtAsLocal(msg.receivedAt) || new Date().toISOString(),
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_id: fileId,
    };

    // Debug logging for final result
    if (hasMedia) {
      // console.log('📦 [History][toBubbleData] Final bubble data:', {
      //   hasFileUrl: !!bubbleData.file_url,
      //   fileType: bubbleData.file_type,
      //   fileName: bubbleData.file_name,
      //   fileId: bubbleData.file_id
      // });
    }

    return bubbleData;
  };

  const handleSearchMessage = (query) => {
    setSearchMessageQuery(query);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading WhatsApp chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="d-flex detail-chat">
        <div
          className={classNames({
            'w-100': true,
            'content-chat-limited-size': Boolean(rightBarMenu),
          })}
        >
          {(() => {
            const detailClient = {
              chat_id: `whatsapp-${phone}`,
              user_name: phone,
              user_email: '-',
              status: 1,
              agent_id: user?.agent_id || user?.id || 0
            };
            const onClose = (e) => {
              if (e && e.altKey) {
                e.preventDefault();
                e.stopPropagation();
              }
              dispatch(closeChat());
              dispatch(resetAllStateInputChat());
            };
            return isLoading ? (
              <HeaderLoader />
            ) : (
              <Header detailClient={detailClient} closeChat={onClose} onSearchMessage={handleSearchMessage} />
            );
          })()}

          <SimpleBar
            ref={scrollRef}
            className={`chat-conversation ${isLoading ? 'with-loader' : ''} p-3 p-lg-4`}
            id="messages"
          >
            <ul className="list-unstyled mb-0">
              {filterMessages(messages).length === 0 ? (
                <li>
                  <div className="d-flex justify-content-center align-items-center py-4">
                    <div className="text-center text-muted">
                      {searchMessageQuery.trim() ? 'No messages found matching your search' : 'No chat history found'}
                    </div>
                  </div>
                </li>
              ) : (
                filterMessages(messages).map((m, idx) => {
                  const bubbleData = toBubbleData(m);
                  // Force re-render when agentNames update
                  const key = `${m.id}_${m.agent_id || ''}_${agentNames[m.agent_id || ''] || ''}`;
                  return <BubbleChatClient key={key} data={bubbleData} />;
                })
              )}
            </ul>
          </SimpleBar>

          {/* Always show closed message for history view */}
          <div className="p-2 p-lg-2 border-top bg-light text-center">
            <small className="text-muted">
              <i className="ri-chat-check-line me-1"></i>
              Chat History - Chat ini sudah di-solve dan dipindahkan ke Chat History. Tidak dapat mengirim pesan lagi.
            </small>
          </div>
        </div>
        {rightBarMenu && (
          <ProfileClientChat
            detailClient={{
              chat_id: `whatsapp-${phone}`,
              user_name: phone,
              user_email: '-',
              status: 1,
              agent_id: user?.agent_id || user?.id || 0,
            }}
            rightBarMenu={rightBarMenu}
            updateStatusRightBar={updateStatusRightBar}
          />
        )}
      </div>
    </Fragment>
  );
}

export default WhatsAppDetailClose;

