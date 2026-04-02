import classNames from 'classnames';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import { authSelector } from '../../../app/Auth/AuthSlice';
import BubbleChatClient from '../../../Common/Components/BubbleChat/BubbleChatClient';
import { resetAllStateInputChat } from '../../../Common/Components/InputChat/InputChatSlice';
import ProfileClientChat from '../../../Common/Components/UserProfileSidebar/ProfileClientChat';
import whatsappIntegration from '../../../whatsapp-integration';
import { closeChat, detailChatClientSelector, updateStatusRightBar } from './DetailChatClientSlice';
import Header from './Header';

function WhatsAppDetail() {
  const dispatch = useDispatch();
  const { chatId, rightBarMenu } = useSelector(detailChatClientSelector);
  const { user } = useSelector(authSelector);
  const [messages, setMessages] = useState([]);
  const [phone, setPhone] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchMessageQuery, setSearchMessageQuery] = useState('');
  const [isChatClosed, setIsChatClosed] = useState(false);
  const [isChatPending, setIsChatPending] = useState(false);
  const [assignedAgentId, setAssignedAgentId] = useState(null);
  const [agentNames, setAgentNames] = useState({}); // Cache for agent names
  const [hasClosedChatHistory, setHasClosedChatHistory] = useState(false); // Apakah ada history chat closed
  const [showClosedHistory, setShowClosedHistory] = useState(false); // Apakah sedang menampilkan history closed
  const [closedHistoryMessages, setClosedHistoryMessages] = useState([]); // Messages dari closed history
  const [isLoadingClosedHistory, setIsLoadingClosedHistory] = useState(false); // Loading state untuk closed history
  const [quickReplies, setQuickReplies] = useState([]);
  const [quickReplySuggestions, setQuickReplySuggestions] = useState([]);
  const [showQuickReplySuggestions, setShowQuickReplySuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [currentInputText, setCurrentInputText] = useState('');
  const phoneRef = useRef(phone);
  const autoCloseTimerRef = useRef(null);
  const lastClientMessageTimeRef = useRef(null);
  const isAutoClosingRef = useRef(false);
  const quickReplyBlurTimeoutRef = useRef(null);

  // Cache untuk messages per phone number - untuk menghindari reload dari awal
  const messagesCacheRef = useRef(new Map()); // Map<phone, messages[]>
  const lastLoadTimeRef = useRef(new Map()); // Map<phone, timestamp>
  const isLoadingMessagesRef = useRef(new Map()); // Map<phone, boolean> - untuk prevent concurrent loads

  // Mobile detection
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Fetch quick replies from API
  const fetchQuickReplies = useCallback(async () => {
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

    if (!token) {
      console.warn('⚠️ No token available for quick replies');
      return;
    }

    try {
      const response = await fetch('https://admin-chat.genio.id/api/quick-replies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          setQuickReplies(data.data);
        } else {
          console.warn('⚠️ Quick replies API returned unexpected format:', data);
        }
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Failed to fetch quick replies:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching quick replies:', error);
    }
  }, [user]);

  // Fetch quick replies on mount and when user changes
  useEffect(() => {
    if (user?.token || localStorage.getItem('tk') || localStorage.getItem('token')) {
      fetchQuickReplies();
    } else {
      console.warn('⚠️ No token found, cannot fetch quick replies');
    }
  }, [user, fetchQuickReplies]);


  // Fetch agent name by agent_id
  const fetchAgentName = useCallback(async (agentId) => {
    if (!agentId) {
      return null;
    }

    const agentIdStr = String(agentId);

    // Skip if agentId is not a valid number (e.g., "ai-assistant", "me", etc.)
    if (isNaN(agentIdStr) || agentIdStr.includes('-') || agentIdStr.includes('_')) {
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

      // Get instance from phoneToInstance map, or default to wa1
      const instance = whatsappIntegration.phoneToInstance?.get(phoneRef.current) || 'wa1';

      // Fetch from wa-socket-v2 endpoint (queries database directly)
      const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/agent/${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Endpoint returns: { success: true, agentId: "...", agentName: "...", agentData: {...} }
        if (data.success && data.agentName) {
          const agentName = data.agentName;
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

  const loadWhatsAppMessages = useCallback(async (phoneNumber, forceReload = false) => {
    try {
      // OPTIMIZATION: Prevent concurrent loads untuk phone yang sama
      if (isLoadingMessagesRef.current.get(phoneNumber)) {
        return; // Skip jika sedang loading
      }
      isLoadingMessagesRef.current.set(phoneNumber, true);

      // OPTIMIZATION: Skip load jika cache masih fresh (< 5 detik) dan tidak force reload
      const cachedMessages = messagesCacheRef.current.get(phoneNumber) || [];
      const lastLoadTime = lastLoadTimeRef.current.get(phoneNumber) || 0;
      const timeSinceLastLoad = Date.now() - lastLoadTime;
      const CACHE_FRESH_THRESHOLD = 5000; // 5 detik

      if (!forceReload && cachedMessages.length > 0 && timeSinceLastLoad < CACHE_FRESH_THRESHOLD) {
        // Cache masih fresh, skip load dan langsung return
        isLoadingMessagesRef.current.set(phoneNumber, false);
        setMessages(cachedMessages);
        return;
      }

      // Check if this phone has ONLY closed messages (no open messages in database)
      // This determines if we're viewing a closed chat (history) vs active chat
      let isOnlyClosedChat = false;
      let hasOpenInDatabase = false;

      // OPTIMIZATION: Skip checking jika cache ada dan masih fresh
      if (!forceReload && cachedMessages.length > 0) {
        // Skip checking, langsung load messages
        hasOpenInDatabase = true; // Assume has open messages if cache exists
      } else {
        try {
          const instance = whatsappIntegration.phoneToInstance?.get(phoneNumber);
          // Support all instances (wa1-wa6)
          const instancesToCheck = instance ? [instance] : ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

          for (const instanceName of instancesToCheck) {
            try {
              // Check if phone has open messages in database
              const openResponse = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/messages/${phoneNumber}`);
              if (openResponse.ok) {
                const openData = await openResponse.json();
                if (openData.success && openData.messages && openData.messages.length > 0) {
                  const hasOpen = openData.messages.some(msg => msg.chat_status === 'open');
                  if (hasOpen) {
                    hasOpenInDatabase = true;
                    break;
                  }
                }
              }
            } catch (err) {
              // Continue checking other instances
            }
          }

          // If no open messages in database, check if it's in closed-chats
          if (!hasOpenInDatabase) {
            for (const instanceName of instancesToCheck) {
              try {
                const closedResponse = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/closed-chats`);
                if (closedResponse.ok) {
                  const closedData = await closedResponse.json();
                  if (closedData.success && closedData.chats) {
                    const isClosed = closedData.chats.some(chat =>
                      chat.phone === phoneNumber ||
                      chat.phone === phoneNumber.replace('@c.us', '') ||
                      chat.chat_id === `whatsapp-${phoneNumber}`
                    );
                    if (isClosed) {
                      isOnlyClosedChat = true;
                      break;
                    }
                  }
                }
              } catch (err) {
                // Continue checking
              }
            }
          }
        } catch (err) {
          console.warn('Error checking chat status for filtering:', err);
        }
      }

      // Try to get messages from selectChat, with fallback to direct API call
      let result = null;
      try {
        result = await whatsappIntegration.selectChat(phoneNumber);
      } catch (selectChatError) {
        console.warn('⚠️ selectChat failed, trying direct API call:', selectChatError);
        // Fallback: Direct API call to database
        try {
          const instance = whatsappIntegration.phoneToInstance?.get(phoneNumber) || 'wa1';
          const url = `https://waserverlive.genio.id/${instance}/api/whatsapp/messages/${phoneNumber}`;

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
              console.error('❌ Failed to parse JSON from direct API call:', parseError);
              console.error('❌ Response text:', responseText.substring(0, 200));
              throw new Error(`Invalid JSON: ${responseText.substring(0, 100)}`);
            }

            if (data.success && data.messages) {
              result = {
                success: true,
                messages: data.messages.map(msg => ({
                  ...msg,
                  instance: instance
                }))
              };
            } else {
              console.warn('⚠️ Direct API call returned success=false:', data.message || data.error);
              result = { success: true, messages: [] };
            }
          } else {
            const errorText = await response.text();
            console.error(`❌ Direct API call failed (${response.status}):`, errorText.substring(0, 200));
            result = { success: true, messages: [] };
          }
        } catch (fallbackError) {
          console.error('❌ Fallback API call also failed:', fallbackError);
          result = { success: true, messages: [] };
        }
      }

      if (result && result.success && result.messages) {
        const hasOpenMessages = result.messages.some(msg => msg.chat_status === 'open');
        const hasClosedMessages = result.messages.some(msg => msg.chat_status === 'closed');

        let openMessages;

        // WhatsAppDetail.jsx is ONLY for active/open chats
        // If this is a closed chat (history), don't show anything - this should be handled by WhatsAppDetailClose.jsx
        if (isOnlyClosedChat || (!hasOpenInDatabase && hasClosedMessages)) {
          // This is a closed chat - WhatsAppDetail should not display it
          // Clear cache dan set empty messages
          messagesCacheRef.current.delete(phoneNumber);
          setMessages([]);
          isLoadingMessagesRef.current.set(phoneNumber, false);
          return;
        }

        // Only show open messages for active chats
        if (hasOpenMessages) {
          // This is an active chat with open messages - show ONLY open messages
          // Filter out closed messages to prevent showing old closed chats when client chats again
          openMessages = result.messages.filter(msg => {
            // Exclude closed messages
            if (msg.chat_status === 'closed') {
              return false;
            }
            // Only include messages with chat_status='open' or undefined (legacy messages without status)
            // But prioritize 'open' status
            return msg.chat_status === 'open' || msg.chat_status === undefined;
          });

          // If no open messages found after filtering, show empty
          if (openMessages.length === 0) {
            // Clear cache jika tidak ada pesan
            messagesCacheRef.current.delete(phoneNumber);
            setMessages([]);
            isLoadingMessagesRef.current.set(phoneNumber, false);
            return;
          }
        } else {
          // No open messages found - this might be a new chat or all messages are closed
          // Clear cache dan show empty
          messagesCacheRef.current.delete(phoneNumber);
          setMessages([]);
          isLoadingMessagesRef.current.set(phoneNumber, false);
          return;
        }

        // Sort messages by timestamp to ensure correct order
        const sortedMessages = openMessages.sort((a, b) => {
          // Use timestamp if available (Unix timestamp in seconds), otherwise use receivedAt
          const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
          const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
          return timestampA - timestampB;
        });

        // OPTIMIZATION: Merge dengan cache yang sudah ada untuk menghindari reload dari awal
        const existingCachedMessages = messagesCacheRef.current.get(phoneNumber) || [];
        const cachedMessageIds = new Set(existingCachedMessages.map(msg => msg.id));

        // Filter pesan baru yang belum ada di cache
        const newMessagesFromAPI = sortedMessages.filter(msg => {
          // Cek apakah message sudah ada di cache berdasarkan ID
          return !cachedMessageIds.has(msg.id);
        });

        // OPTIMIZATION: Jika tidak ada pesan baru, skip update (hemat re-render)
        if (newMessagesFromAPI.length === 0 && existingCachedMessages.length > 0) {
          // Tidak ada pesan baru, cache sudah up-to-date
          // Hanya update lastLoadTime
          lastLoadTimeRef.current.set(phoneNumber, Date.now());
          isLoadingMessagesRef.current.set(phoneNumber, false);
          return; // Skip setMessages untuk menghindari re-render yang tidak perlu
        }

        // Merge: gabungkan cache dengan pesan baru, lalu sort ulang
        let mergedMessages = existingCachedMessages.length > 0 ? [...existingCachedMessages] : sortedMessages;

        if (newMessagesFromAPI.length > 0) {
          // Tambahkan pesan baru ke cache
          mergedMessages = [...existingCachedMessages, ...newMessagesFromAPI];

          // Sort ulang untuk memastikan urutan benar
          mergedMessages.sort((a, b) => {
            const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
            const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
            return timestampA - timestampB;
          });
        }

        // Update cache
        messagesCacheRef.current.set(phoneNumber, mergedMessages);
        lastLoadTimeRef.current.set(phoneNumber, Date.now());

        // Set messages state hanya jika ada perubahan
        setMessages(mergedMessages);

        // Extract agent IDs from messages and fetch agent names (hanya untuk pesan baru)
        const agentIds = new Set();
        // OPTIMIZATION: Hanya fetch agent names untuk pesan baru, bukan semua pesan
        const messagesToCheck = newMessagesFromAPI.length > 0 ? newMessagesFromAPI : sortedMessages;
        messagesToCheck.forEach(msg => {
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
          }
        }

        // Fetch agent names for all unique agent IDs (skip current user since we already have it)
        agentIds.forEach(agentId => {
          const agentIdStr = String(agentId);
          // Skip fetching if this is current user (we already have name_agent)
          if (agentIdStr === currentAgentIdStr && user?.name_agent) {
            return;
          }

          if (!agentNames[agentIdStr]) {
            fetchAgentName(agentIdStr).catch(err => {
              console.error(`❌ Failed to fetch agent name for ${agentIdStr}:`, err);
            });
          }
        });
      } else {
        // Clear cache jika tidak ada result
        messagesCacheRef.current.delete(phoneNumber);
        setMessages([]);
        isLoadingMessagesRef.current.set(phoneNumber, false);
      }
    } catch (error) {
      console.error('Error loading WhatsApp messages:', error);
      // Jangan clear cache jika error, biarkan cache tetap ada
      // setMessages([]); // Comment out untuk keep cache saat error
    } finally {
      // Always clear loading flag
      isLoadingMessagesRef.current.set(phoneNumber, false);
    }
  }, [agentNames, fetchAgentName]);

  useEffect(() => {
    if (chatId && chatId.startsWith('whatsapp-')) {
      // Extract phone number from chat_id
      // Format can be: whatsapp-{phone} or whatsapp-{phone}-{instance}
      // Remove whatsapp- prefix, then remove instance suffix if present (wa1, wa2, etc.)
      let phoneNumber = chatId.replace('whatsapp-', '').replace('-WA', '');

      // Remove instance suffix if present (e.g., -wa1, -wa2, etc.)
      const instancePattern = /-(wa[1-6])$/i;
      if (instancePattern.test(phoneNumber)) {
        phoneNumber = phoneNumber.replace(instancePattern, '');
      }

      setPhone(phoneNumber);
      phoneRef.current = phoneNumber;

      // Reset closed history state when phone changes
      setShowClosedHistory(false);
      setClosedHistoryMessages([]);
      setHasClosedChatHistory(false);
      setIsLoadingClosedHistory(false);

      // OPTIMIZATION: Load cached messages first (instant display), then load new messages
      const cachedMessages = messagesCacheRef.current.get(phoneNumber);
      if (cachedMessages && cachedMessages.length > 0) {
        // Tampilkan cache dulu untuk instant display
        setMessages(cachedMessages);
      }

      // Load messages (akan merge dengan cache di loadWhatsAppMessages)
      loadWhatsAppMessages(phoneNumber);

      // Mark chat as read when opened (only if not closed)
      whatsappIntegration.markChatAsRead(phoneNumber);

      // Check if chat is closed and assigned status
      const checkChatStatus = async () => {
        try {
          // Get instance from phoneToInstance map, default to wa1
          const instance = whatsappIntegration.phoneToInstance?.get(phoneNumber);
          // If instance known, use it; otherwise try all instances (wa1-wa6)
          const instancesToCheck = instance ? [instance] : ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

          let isClosed = false;
          let hasOpenMessages = false;

          // IMPORTANT: Check if chat has open messages first
          // If chat has open messages, it should NOT be considered closed
          for (const instanceName of instancesToCheck) {
            try {
              // Check if there are open messages for this phone
              const messagesResponse = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/messages/${phoneNumber}?includeClosed=false`);
              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json();
                if (messagesData.success && messagesData.messages && messagesData.messages.length > 0) {
                  hasOpenMessages = true;
                  break; // Found open messages, no need to check other instances
                }
              }
            } catch (err) {
              console.warn(`Failed to check open messages from ${instanceName}:`, err);
            }
          }

          // Only check closed status if there are NO open messages
          // If chat has open messages, it's not closed (even if it was closed before)
          if (!hasOpenMessages) {
            // Check closed status from all instances
            for (const instanceName of instancesToCheck) {
              try {
                const closedResponse = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/closed-chats`);
                if (closedResponse.ok) {
                  const closedData = await closedResponse.json();
                  if (closedData.success && closedData.chats) {
                    const foundClosed = closedData.chats.some(chat =>
                      chat.phone === phoneNumber ||
                      chat.chat_id === `whatsapp-${phoneNumber}` ||
                      chat.phone === phoneNumber.replace('@c.us', '')
                    );
                    if (foundClosed) {
                      isClosed = true;
                      break; // Found in this instance, no need to check others
                    }
                  }
                }
              } catch (err) {
                console.warn(`Failed to check closed status from ${instanceName}:`, err);
              }
            }
          } else {
            // Chat has open messages, so it's not closed
            isClosed = false;
          }

          setIsChatClosed(isClosed);

          // Check pending status - check if the LATEST message has is_pending = true
          // Only the latest message matters - if latest is pending, skip AI and auto-close
          let isPending = false;
          for (const instanceName of instancesToCheck) {
            try {
              const messagesResponse = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/messages/${phoneNumber}`);
              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json();
                if (messagesData.success && messagesData.messages && messagesData.messages.length > 0) {
                  // Sort messages by receivedAt descending to get the latest message
                  const sortedMessages = [...messagesData.messages].sort((a, b) => {
                    const timeA = new Date(a.receivedAt || 0).getTime();
                    const timeB = new Date(b.receivedAt || 0).getTime();
                    return timeB - timeA; // Descending order
                  });

                  // Check if the LATEST message has is_pending = true
                  const latestMessage = sortedMessages[0];
                  if (latestMessage && latestMessage.is_pending === true) {
                    isPending = true;
                    break;
                  }
                }
              }
            } catch (err) {
              console.warn(`Failed to check pending status from ${instanceName}:`, err);
            }
          }
          setIsChatPending(isPending);

          // Check assigned status from the instance this phone belongs to
          const instanceToUse = instance || 'wa1'; // Default to wa1 if instance not found
          const assignedResponse = await fetch(`https://waserverlive.genio.id/${instanceToUse}/api/whatsapp/assigned-status/${phoneNumber}`);
          if (assignedResponse.ok) {
            const assignedData = await assignedResponse.json();
            if (assignedData.success) {
              const assignedTo = assignedData.assignedTo || null;
              setAssignedAgentId(assignedTo);

              // Parse assigned agents (comma-separated)
              const currentAgentId = String(user?.agent_id || user?.id || '');
              const assignedAgents = assignedTo ? assignedTo.split(',').map(a => a.trim()).filter(a => a) : [];
              const isAssignedToMe = assignedAgents.includes(currentAgentId);

            }
          }
        } catch (error) {
          console.error('Error checking chat status:', error);
          setIsChatClosed(false);
        }
      };

      checkChatStatus();

      // Check if there's closed chat history
      checkClosedChatHistory();
    }

    // Listen for chat closed and assigned events
    const handleChatClosed = (event) => {
      const { phone } = event.detail;
      const currentPhone = phoneRef.current;
      if (phone === currentPhone || currentPhone === phone.replace('@c.us', '')) {
        setIsChatClosed(true);
        dispatch(closeChat());
      }
    };

    const handleChatAssigned = (event) => {
      const { phone, agentId, assignedTo } = event.detail;
      const currentPhone = phoneRef.current;
      if (phone === currentPhone || currentPhone === phone.replace('@c.us', '')) {
        // assignedTo can be comma-separated, use it if provided
        // Only update if assignedTo is not null/undefined, or if agentId is valid
        let newAssignedTo = null;
        if (assignedTo !== null && assignedTo !== undefined && assignedTo !== 'undefined') {
          newAssignedTo = assignedTo;
        } else if (agentId !== null && agentId !== undefined && agentId !== 'undefined') {
          newAssignedTo = String(agentId);
        }
        // Only update if we have a valid value, otherwise keep current state
        if (newAssignedTo !== null) {
          setAssignedAgentId(newAssignedTo);
        } else {
          // If assignedTo is null, set it to null (unassigned)
          setAssignedAgentId(null);
        }
      }
    };

    const handleChatPending = (event) => {
      const { phone } = event.detail;
      const currentPhone = phoneRef.current;
      if (phone === currentPhone || currentPhone === phone.replace('@c.us', '')) {
        setIsChatPending(true);
      }
    };

    window.addEventListener('whatsapp:chatClosed', handleChatClosed);
    window.addEventListener('whatsapp:chatAssigned', handleChatAssigned);
    window.addEventListener('whatsapp:chatPending', handleChatPending);

    // Also listen for localStorage events (sync antar tab/browser)
    const handleStorageChange = (e) => {
      if (e.key === 'whatsapp:chatPending' && e.newValue) {
        try {
          const eventData = JSON.parse(e.newValue);
          if (eventData.type === 'whatsapp:chatPending') {
            handleChatPending({
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
      window.removeEventListener('whatsapp:chatAssigned', handleChatAssigned);
      window.removeEventListener('whatsapp:chatPending', handleChatPending);
      window.removeEventListener('storage', handleStorageChange);

      // Cleanup: Clear cache untuk phone yang tidak aktif lagi (optional - bisa di-comment jika ingin keep cache)
      // Uncomment baris di bawah jika ingin clear cache saat chat ditutup
      // const currentPhone = phoneRef.current;
      // if (currentPhone) {
      //   messagesCacheRef.current.delete(currentPhone);
      // }
    };
  }, [chatId, loadWhatsAppMessages, dispatch, checkClosedChatHistory]);

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

  // Function to reset auto-close timer
  // NOTE: Timer tidak berjalan jika chat sudah di-assign atau pending
  // karena setelah di-assign, agent yang bertanggung jawab untuk merespon
  const resetAutoCloseTimer = useCallback(() => {
    // Clear existing timer
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }

    // Don't start timer if chat is closed, pending, assigned, or already auto-closing
    // NOTE: Timer tidak berjalan jika chat pending - pending chat tidak akan auto-close
    // NOTE: Timer tidak berjalan jika chat sudah di-assign - setelah di-assign, tidak ada auto-close
    if (isChatClosed || isChatPending || assignedAgentId || isAutoClosingRef.current) {
      return;
    }

    // Start new timer: 1 hour = 3600000 milliseconds
    // NOTE: Timer tidak akan berjalan jika chat pending atau sudah di-assign
    autoCloseTimerRef.current = setTimeout(async () => {
      if (isAutoClosingRef.current || isChatClosed || isChatPending || assignedAgentId) {
        return;
      }

      isAutoClosingRef.current = true;
      const currentPhone = phoneRef.current;

      try {
        // Send follow-up message
        // NOTE: Pesan follow-up dikirim setelah 20 menit tidak ada respon dari client
        const followUpMessage = 'Apakah masih ada yang ingin di tanyakan lagi ? kami akan dengan senang hati untuk menjawab';
        const agentId = user?.agent_id || user?.id || null;
        await whatsappIntegration.sendMessage(currentPhone, followUpMessage, agentId);
      } catch (error) {
        console.error('Error in follow-up message:', error);
        isAutoClosingRef.current = false;
      }
    }, 1200000); // 20 menit = 1200000 milliseconds
  }, [isChatClosed, isChatPending, assignedAgentId, user, dispatch]);

  // Function to check last client message time and reset timer
  // NOTE: Auto-close timer tidak berjalan jika chat sudah di-assign atau pending
  // karena setelah di-assign, agent yang bertanggung jawab untuk merespon
  // NOTE: Timer tidak berjalan jika chat pending - pending chat tidak akan auto-close
  const checkAndResetAutoCloseTimer = useCallback(() => {
    if (isChatClosed || isChatPending || assignedAgentId || isAutoClosingRef.current) {
      return;
    }

    // Find last message from client (not from 'me')
    const lastClientMessage = messages
      .filter(msg => msg.from !== 'me' && msg.type !== 'sent')
      .sort((a, b) => {
        const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
        const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
        return timestampB - timestampA;
      })[0];

    if (lastClientMessage) {
      const messageTime = lastClientMessage.timestamp
        ? lastClientMessage.timestamp * 1000
        : new Date(lastClientMessage.receivedAt || 0).getTime();
      const currentTime = Date.now();
      const timeSinceLastMessage = currentTime - messageTime;

      // If last client message was more than 1 hour ago, start timer
      // Otherwise, reset timer
      // NOTE: Timer tetap berjalan meskipun chat sudah di-assign
      if (timeSinceLastMessage >= 3600000) {
        // More than 1 hour has passed, trigger auto-close immediately
        resetAutoCloseTimer();
      } else {
        // Less than 1 hour, reset timer to wait for remaining time
        resetAutoCloseTimer();
      }
    } else {
      // No client messages yet, start timer
      resetAutoCloseTimer();
    }
  }, [messages, isChatClosed, isChatPending, assignedAgentId, resetAutoCloseTimer]);

  // Initialize auto-close timer when messages are loaded
  useEffect(() => {
    if (phone && messages.length > 0 && !isChatClosed) {
      // Start timer based on last client message
      checkAndResetAutoCloseTimer();
    }

    // Cleanup timer on unmount or when chat is closed
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [phone, messages, isChatClosed, checkAndResetAutoCloseTimer]);

  // Event listeners - register once and never re-register
  useEffect(() => {

    // Helper function to normalize phone numbers for comparison
    // Handles various formats: 6285156735501, 085156735501, 85156735501, 6285156735501@c.us, etc.
    const normalizePhoneForComparison = (phone) => {
      if (!phone) return '';

      // Convert to string and remove @c.us suffix
      let normalized = String(phone).replace('@c.us', '').trim();

      // Remove all non-digit characters
      normalized = normalized.replace(/[^\d]/g, '');

      // Normalize to 62 format (standard Indonesian phone format)
      if (normalized.startsWith('0')) {
        // 085156735501 -> 6285156735501
        normalized = '62' + normalized.substring(1);
      } else if (!normalized.startsWith('62') && normalized.length > 0) {
        // If doesn't start with 62 and not 0, assume it's missing country code
        if (normalized.startsWith('8')) {
          // 85156735501 -> 6285156735501
          normalized = '62' + normalized;
        } else if (normalized.length >= 10) {
          // If it's a valid length but doesn't start with 62 or 0, try adding 62
          normalized = '62' + normalized;
        }
      }

      return normalized;
    };

    const handleNewMessage = (message) => {
      // Get current phone from ref to avoid stale closure
      const currentPhone = phoneRef.current;
      if (!currentPhone) {
        return; // No current phone, ignore
      }

      const normalizedCurrentPhone = normalizePhoneForComparison(currentPhone);
      const normalizedFrom = normalizePhoneForComparison(message.from);
      const normalizedTo = normalizePhoneForComparison(message.to);

      // Process message if it's for the current chat (with robust phone comparison)
      // For outgoing messages (from 'me'), only show if it's TO the current phone
      // For incoming messages, show if it's FROM the current phone
      const isOutgoingMessage = message.from === 'me';
      const isForCurrentChat = normalizedCurrentPhone && (
        // Incoming message: from matches current phone
        (!isOutgoingMessage && normalizedFrom === normalizedCurrentPhone) ||
        // Outgoing message: to matches current phone (IMPORTANT: don't show AI responses to other chats!)
        (isOutgoingMessage && normalizedTo === normalizedCurrentPhone)
      );

      if (!isForCurrentChat) {
        // Not for current chat, filter out
        return;
      }

      // Process the message
      // If chat is not assigned and message is from 'me', it's likely an AI response
      // Check assignedAgentId state to determine if chat is assigned
      const isChatUnassigned = !assignedAgentId || assignedAgentId === null || assignedAgentId === '';
      const isOutgoingFromMe = message.from === 'me';

      // If chat is unassigned and message is from 'me' without agent_id, assume it's AI
      let messageAgentId = message.agent_id || message.agentId;
      if (isChatUnassigned && isOutgoingFromMe && !messageAgentId) {
        messageAgentId = 'ai-assistant';
      }

      const messageKey = `${message.id}_${message.body}_${message.from}`;
      if (window.__processedWhatsAppMessages && window.__processedWhatsAppMessages.has(messageKey)) {
        return;
      }

      if (!window.__processedWhatsAppMessages) {
        window.__processedWhatsAppMessages = new Set();
      }
      window.__processedWhatsAppMessages.add(messageKey);

      if (window.__processedWhatsAppMessages.size > 100) {
        const messagesArray = Array.from(window.__processedWhatsAppMessages);
        window.__processedWhatsAppMessages = new Set(messagesArray.slice(-50));
      }

      const newMessage = {
        id: message.id || Date.now(),
        body: message.body || (message.hasMedia ? '📎 Media file' : 'No content'),
        from: message.from === 'me' ? 'me' : message.from,
        receivedAt: message.receivedAt || new Date().toISOString(),
        timestamp: message.timestamp || Math.floor(Date.now() / 1000),
        type: message.type || (message.from === 'me' ? 'sent' : 'received'),
        to: message.to,
        instance: message.instance,
        hasMedia: message.hasMedia || false,
        media: message.media || null,
        media_data: message.media_data || null, // Include media_data from message
        message_type: message.message_type || null, // Include message_type from message
        mediaType: message.media?.mimetype || message.mediaType || null,
        filename: message.media?.filename || message.filename || null,
        // Use determined agent_id (important for AI detection)
        agent_id: messageAgentId || null,
        agentId: messageAgentId || null
      };

      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        // Sort messages by timestamp to maintain correct order
        return updatedMessages.sort((a, b) => {
          // Use timestamp if available (Unix timestamp in seconds), otherwise use receivedAt
          const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
          const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
          return timestampA - timestampB;
        });
      });

      // Reset auto-close timer when client sends a message
      if (message.from !== 'me' && message.type !== 'sent') {
        lastClientMessageTimeRef.current = Date.now();
        resetAutoCloseTimer();
      }
    };


    const handleAiResponse = (data) => {
      // Get current phone from both ref and state for maximum reliability
      const currentPhoneFromRef = phoneRef.current;
      const currentPhoneFromState = phone;
      const currentPhone = currentPhoneFromRef || currentPhoneFromState;

      if (!currentPhone) {
        // No current phone, ignore
        return;
      }

      // Normalize all phone numbers for comparison
      const normalizedCurrentPhone = normalizePhoneForComparison(currentPhone);
      const normalizedDataPhone = normalizePhoneForComparison(data.phone);

      // Also check message.to field for additional validation
      const normalizedMessageTo = normalizePhoneForComparison(data.message?.to);

      // Don't process AI response if chat is pending
      if (isChatPending) {
        return;
      }

      // Only process AI response if it's for the current chat (with robust phone comparison)
      // Check both data.phone and data.message.to to ensure it's for this chat
      // Must match exactly - if any phone number doesn't match, ignore
      const phoneMatches = normalizedCurrentPhone && (
        normalizedCurrentPhone === normalizedDataPhone ||
        normalizedCurrentPhone === normalizedMessageTo
      );

      const isForCurrentChat = phoneMatches;

      if (!isForCurrentChat) {
        // Not for current chat, ignore
        return;
      }

      // Process the AI response message
      const message = data.message;

      // Ensure agent_id is set to 'ai-assistant' for AI responses
      // Check if chat is unassigned - if so, definitely set to 'ai-assistant'
      const isChatUnassigned = !assignedAgentId || assignedAgentId === null || assignedAgentId === '';

      // If chat is unassigned, this is definitely an AI response
      // If chat is assigned but message doesn't have agent_id, also assume it's AI
      if (isChatUnassigned || (!message.agent_id && !message.agentId)) {
        message.agent_id = 'ai-assistant';
        message.agentId = 'ai-assistant';
      }

      const messageKey = `${message.id}_${message.body}_${message.from}`;

      if (window.__processedWhatsAppMessages && window.__processedWhatsAppMessages.has(messageKey)) {
        return;
      }

      if (!window.__processedWhatsAppMessages) {
        window.__processedWhatsAppMessages = new Set();
      }
      window.__processedWhatsAppMessages.add(messageKey);

      if (window.__processedWhatsAppMessages.size > 100) {
        const messagesArray = Array.from(window.__processedWhatsAppMessages);
        window.__processedWhatsAppMessages = new Set(messagesArray.slice(-50));
      }

      const newMessage = {
        id: message.id || Date.now(),
        body: message.body || (message.hasMedia ? '📎 Media file' : 'No content'),
        from: message.from === 'me' ? 'me' : message.from,
        receivedAt: message.receivedAt || new Date().toISOString(),
        timestamp: message.timestamp || Math.floor(Date.now() / 1000),
        type: message.type || (message.from === 'me' ? 'sent' : 'received'),
        to: message.to,
        instance: message.instance,
        hasMedia: message.hasMedia || false,
        media: message.media || null,
        media_data: message.media_data || null, // Include media_data from message
        message_type: message.message_type || null, // Include message_type from message
        mediaType: message.media?.mimetype || message.mediaType || null,
        filename: message.media?.filename || message.filename || null,
        // Ensure agent_id is set for AI responses
        agent_id: message.agent_id || message.agentId || 'ai-assistant',
        agentId: message.agent_id || message.agentId || 'ai-assistant'
      };

      setMessages(prev => {
        // Cek apakah message sudah ada (untuk menghindari duplikasi)
        const existingMessage = prev.find(msg => msg.id === newMessage.id);
        if (existingMessage) {
          return prev; // Skip jika sudah ada
        }

        const updatedMessages = [...prev, newMessage];
        // Sort messages by timestamp to maintain correct order
        const sortedMessages = updatedMessages.sort((a, b) => {
          // Use timestamp if available (Unix timestamp in seconds), otherwise use receivedAt
          const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
          const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
          return timestampA - timestampB;
        });

        // Update cache untuk real-time sync
        const currentPhone = phoneRef.current;
        if (currentPhone) {
          messagesCacheRef.current.set(currentPhone, sortedMessages);
        }

        return sortedMessages;
      });
    };

    const handleMessageSent = (data) => {
      if (data.phone === phone) {
        const messageId = data.messageId || Date.now();
        setMessages(prev => {
          const existingMessage = prev.find(msg => msg.id === messageId);
          if (existingMessage) {
            return prev;
          }

          const sentMessage = {
            id: messageId,
            body: data.message,
            from: 'me',
            receivedAt: new Date().toISOString(),
            type: 'sent',
            to: data.phone,
            instance: data.instance
          };

          const updatedMessages = [...prev, sentMessage];
          // Sort messages by timestamp to maintain correct order
          const sortedMessages = updatedMessages.sort((a, b) => {
            // Use timestamp if available (Unix timestamp in seconds), otherwise use receivedAt
            const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
            const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
            return timestampA - timestampB;
          });

          // Update cache untuk real-time sync
          const currentPhone = phoneRef.current;
          if (currentPhone) {
            messagesCacheRef.current.set(currentPhone, sortedMessages);
          }

          return sortedMessages;
        });

        // Reset auto-close timer when agent sends message
        resetAutoCloseTimer();

        // Refresh assigned status after sending message to ensure it's up-to-date
        setTimeout(async () => {
          try {
            // Get instance from phoneToInstance map, default to wa1
            const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1'; // Default to wa1 if instance not found
            const assignedResponse = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/assigned-status/${phone}`);
            if (assignedResponse.ok) {
              const assignedData = await assignedResponse.json();
              if (assignedData.success) {
                const assignedTo = assignedData.assignedTo || null;
                setAssignedAgentId(assignedTo);

                // Emit event to update Header.jsx
                window.dispatchEvent(new CustomEvent('whatsapp:chatAssigned', {
                  detail: { phone, assignedTo: assignedTo }
                }));
              }
            }
          } catch (error) {
            console.warn('Failed to refresh assigned status after send:', error);
          }
        }, 500); // Small delay to ensure database update is complete
      }
    };

    const handleFileSent = (data) => {
      if (data.phone === phone) {
        const sentFile = {
          id: data.messageId || Date.now(),
          body: `📎 ${data.filename}`,
          from: 'me',
          receivedAt: new Date().toISOString(),
          type: 'sent',
          to: data.phone,
          instance: data.instance,
          hasMedia: true
        };

        setMessages(prev => {
          const existingMessage = prev.find(msg => msg.id === sentFile.id);
          if (existingMessage) {
            return prev;
          }

          const updatedMessages = [...prev, sentFile];
          const sortedMessages = updatedMessages.sort((a, b) => {
            const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
            const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
            return timestampA - timestampB;
          });

          // Update cache untuk real-time sync
          const currentPhone = phoneRef.current;
          if (currentPhone) {
            messagesCacheRef.current.set(currentPhone, sortedMessages);
          }

          return sortedMessages;
        });

        // Reset auto-close timer when agent sends file
        resetAutoCloseTimer();

        // Refresh assigned status after sending file
        setTimeout(async () => {
          try {
            // Get instance from phoneToInstance map, default to wa1
            const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1'; // Default to wa1 if instance not found
            const assignedResponse = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/assigned-status/${phone}`);
            if (assignedResponse.ok) {
              const assignedData = await assignedResponse.json();
              if (assignedData.success) {
                const assignedTo = assignedData.assignedTo || null;
                setAssignedAgentId(assignedTo);

                window.dispatchEvent(new CustomEvent('whatsapp:chatAssigned', {
                  detail: { phone, assignedTo: assignedTo }
                }));
              }
            }
          } catch (error) {
            console.warn('Failed to refresh assigned status after send file:', error);
          }
        }, 500);
      }
    };

    whatsappIntegration.on('newMessage', handleNewMessage);
    whatsappIntegration.on('messageSent', handleMessageSent);
    whatsappIntegration.on('fileSent', handleFileSent);
    whatsappIntegration.on('aiResponse', handleAiResponse);

    return () => {
      whatsappIntegration.off('newMessage', handleNewMessage);
      whatsappIntegration.off('messageSent', handleMessageSent);
      whatsappIntegration.off('fileSent', handleFileSent);
      whatsappIntegration.off('aiResponse', handleAiResponse);
    };
  }, [phone, selectedFile, resetAutoCloseTimer, isChatPending, assignedAgentId]); // Include assignedAgentId to ensure handlers use latest value

  const sendMessage = async (messageText) => {
    // Trim only leading and trailing whitespace, preserve line breaks in the middle
    const trimmedMessage = messageText.replace(/^\s+|\s+$/g, '');
    if (!phone || !trimmedMessage) return;

    try {
      const agentId = user?.agent_id || user?.id || null;
      // Send message with line breaks preserved
      await whatsappIntegration.sendMessage(phone, messageText, agentId);
      // Reset auto-close timer when agent sends message
      resetAutoCloseTimer();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      const errorMessage = {
        id: 'send-error-' + Date.now(),
        body: `Failed to send message: ${error.message}`,
        from: 'system',
        receivedAt: new Date().toISOString(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported. Please select an image (JPEG, PNG, GIF) or PDF file.');
        return;
      }

      if (file.size > maxSize) {
        alert(`File size too large. Please select a file smaller than ${(maxSize / 1024 / 1024).toFixed(0)}MB. Current file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      const fileWithBase64 = {
        ...file,
        base64Data: null,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        fileWithBase64.base64Data = e.target.result.split(',')[1];
        setSelectedFile(fileWithBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle paste event untuk screenshot/gambar dari clipboard
  const handlePaste = useCallback(async (event) => {
    // Cek jika chat sudah closed, jangan proses paste
    if (isChatClosed) {
      return;
    }

    const items = event.clipboardData?.items;
    if (!items) {
      return;
    }

    // Cari item yang berupa gambar
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Cek jika item adalah gambar
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault(); // Prevent default paste behavior

        const file = item.getAsFile();
        if (!file) {
          continue;
        }

        // Validasi tipe file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          alert('Tipe file tidak didukung. Hanya gambar (JPEG, PNG, GIF) yang bisa di-paste.');
          return;
        }

        // Validasi ukuran file
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alert(`Ukuran file terlalu besar. Maksimal ${(maxSize / 1024 / 1024).toFixed(0)}MB. File saat ini: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
          return;
        }

        // Buat nama file dengan timestamp jika tidak ada nama
        const timestamp = new Date().getTime();
        const extension = file.type.split('/')[1] || 'png';
        const fileName = file.name || `screenshot_${timestamp}.${extension}`;

        const fileWithBase64 = {
          ...file,
          base64Data: null,
          name: fileName,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified || Date.now()
        };

        // Konversi ke base64
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithBase64.base64Data = e.target.result.split(',')[1];
          setSelectedFile(fileWithBase64);
        };
        reader.readAsDataURL(file);

        return; // Hanya proses gambar pertama yang ditemukan
      }
    }
  }, [isChatClosed]);

  // Load closed chat history
  const loadClosedChatHistory = useCallback(async () => {
    if (!phone || isLoadingClosedHistory) {
      return;
    }

    setIsLoadingClosedHistory(true);
    try {
      const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';
      const instancesToCheck = instance ? [instance] : ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

      let closedMessages = [];

      // Try to get closed messages from all instances
      for (const instanceName of instancesToCheck) {
        try {
          const response = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/messages/${phone}?includeClosed=true`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.messages && data.messages.length > 0) {
              // Filter hanya closed messages
              const closed = data.messages.filter(msg => msg.chat_status === 'closed');
              if (closed.length > 0) {
                closedMessages = [...closedMessages, ...closed];
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to load closed history from ${instanceName}:`, err);
        }
      }

      // Remove duplicates berdasarkan ID
      const uniqueMessages = closedMessages.reduce((acc, msg) => {
        if (!acc.find(m => m.id === msg.id)) {
          acc.push(msg);
        }
        return acc;
      }, []);

      // Sort by timestamp
      uniqueMessages.sort((a, b) => {
        const timestampA = a.timestamp ? a.timestamp * 1000 : new Date(a.receivedAt || 0).getTime();
        const timestampB = b.timestamp ? b.timestamp * 1000 : new Date(b.receivedAt || 0).getTime();
        return timestampA - timestampB;
      });

      setClosedHistoryMessages(uniqueMessages);
      setShowClosedHistory(true);
    } catch (error) {
      console.error('Error loading closed chat history:', error);
    } finally {
      setIsLoadingClosedHistory(false);
    }
  }, [phone, isLoadingClosedHistory]);

  // Check if there's closed chat history
  const checkClosedChatHistory = useCallback(async () => {
    if (!phone) {
      return;
    }

    try {
      const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';
      const instancesToCheck = instance ? [instance] : ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

      // Helper untuk normalisasi phone
      const normalize = (p) => (p || '').replace('@c.us', '').replace('+', '');
      const normalizedPhone = normalize(phone);
      const variants = new Set([
        normalizedPhone,
        phone,
        `whatsapp-${normalizedPhone}`,
        `whatsapp-${phone}`
      ]);

      for (const instanceName of instancesToCheck) {
        try {
          // Cek list closed-chats lebih cepat
          const closedResp = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/closed-chats`);
          if (closedResp.ok) {
            const closedData = await closedResp.json();
            if (closedData.success && Array.isArray(closedData.chats)) {
              const found = closedData.chats.some(chat => {
                const chatPhone = normalize(chat.phone);
                const chatId = chat.chat_id || '';
                return variants.has(chatPhone) || variants.has(chatId);
              });
              if (found) {
                setHasClosedChatHistory(true);
                return;
              }
            }
          }

          // Fallback cek messages dengan includeClosed=true
          const response = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/messages/${phone}?includeClosed=true`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.messages && data.messages.length > 0) {
              const hasClosed = data.messages.some(msg => msg.chat_status === 'closed');
              if (hasClosed) {
                setHasClosedChatHistory(true);
                return;
              }
            }
          }
        } catch (err) {
          // Continue checking other instances
        }
      }
      setHasClosedChatHistory(false);
    } catch (error) {
      console.error('Error checking closed chat history:', error);
    }
  }, [phone]);

  const sendFile = async () => {
    if (!phone || !selectedFile) {
      return;
    }

    setIsUploading(true);
    try {
      const mediaData = {
        data: selectedFile.base64Data,
        mimetype: selectedFile.type,
        filename: selectedFile.name
      };

      const agentId = user?.agent_id || user?.id || null;
      await whatsappIntegration.sendFile(phone, mediaData, agentId);

      setSelectedFile(null);

      const fileInput = document.getElementById('whatsapp-file-input');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error sending WhatsApp file:', error);
      const errorMessage = {
        id: 'send-error-' + Date.now(),
        body: `Failed to send file: ${error.message}`,
        from: 'system',
        receivedAt: new Date().toISOString(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsUploading(false);
    }
  };

  const cancelFileUpload = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('whatsapp-file-input');
    if (fileInput) fileInput.value = '';
  };

  const downloadMedia = async (message) => {
    try {
      let fileUrl = null;
      let filename = message.filename || `media_${message.id}`;
      let mediaDataObj = null; // Declare at function scope

      // Check if message has media data (base64) or URL
      if (message.media && message.media.data) {
        // Base64 data - use data URL
        fileUrl = `data:${message.mediaType};base64,${message.media.data}`;
      } else if (message.file_url) {
        // Use file_url from bubbleData
        fileUrl = message.file_url;
      } else {
        // Try to get from media_data
        if (message.media_data) {
          try {
            if (typeof message.media_data === 'string') {
              const trimmed = message.media_data.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                mediaDataObj = JSON.parse(message.media_data);
              }
            } else if (typeof message.media_data === 'object') {
              mediaDataObj = message.media_data;
            }
          } catch (e) {
            console.warn('Failed to parse media_data for download:', e);
          }
        }

        if (mediaDataObj) {
          if (mediaDataObj.data) {
            // Base64 data
            const mimeType = mediaDataObj.mimetype || mediaDataObj.mimeType || message.mediaType || 'application/octet-stream';
            fileUrl = `data:${mimeType};base64,${mediaDataObj.data}`;
          } else if (mediaDataObj.url) {
            // URL - convert relative to absolute if needed
            let url = mediaDataObj.url;
            if (url.startsWith('/')) {
              const instance = message.instance || whatsappIntegration.phoneToInstance?.get(phoneRef.current) || 'wa1';
              fileUrl = `https://waserverlive.genio.id/${instance}${url}`;
            } else if (url.startsWith('http://') || url.startsWith('https://')) {
              fileUrl = url;
            } else {
              const instance = message.instance || whatsappIntegration.phoneToInstance?.get(phoneRef.current) || 'wa1';
              fileUrl = `https://waserverlive.genio.id/${instance}/${url}`;
            }
          }
        }
      }

      if (!fileUrl) {
        console.error('No file URL available for download');
        return;
      }

      // Ensure filename has extension
      if (!filename.includes('.')) {
        const extension = message.mediaType?.split('/')[1] ||
          (mediaDataObj?.mimetype || mediaDataObj?.mimeType || '').split('/')[1] ||
          'bin';
        filename = `${filename}.${extension}`;
      }

      // If fileUrl is a data URL or absolute URL, download directly
      if (fileUrl.startsWith('data:') || fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        // For absolute URLs, fetch and download as blob
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
          try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch: ${response.status}`);
            }
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up blob URL
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(fileUrl, '_blank');
          }
        } else {
          // Data URL - download directly
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        console.error('Invalid file URL format:', fileUrl);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };


  const handleInputBlur = () => {
    // Close quick reply suggestions after a delay (to allow click events)
    if (quickReplyBlurTimeoutRef.current) {
      clearTimeout(quickReplyBlurTimeoutRef.current);
    }
    quickReplyBlurTimeoutRef.current = setTimeout(() => {
      setShowQuickReplySuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // Handle input change for quick reply detection
  const handleInputChange = useCallback((e) => {
    const input = e.target;
    const text = getTextFromContentEditable(input);
    setCurrentInputText(text);

    // Check if text starts with '/' (shortcut indicator)
    if (text.startsWith('/')) {
      const shortcut = text.substring(1).toLowerCase().trim();

      if (shortcut.length > 0) {
        // Filter quick replies that match the shortcut
        const filtered = quickReplies.filter(qr =>
          qr.shortcut && qr.shortcut.toLowerCase().startsWith(shortcut)
        );

        if (filtered.length > 0) {
          setQuickReplySuggestions(filtered);
          setShowQuickReplySuggestions(true);
          setSelectedSuggestionIndex(-1);
        } else {
          setShowQuickReplySuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
      } else {
        // Show all quick replies if only '/' is typed
        if (quickReplies.length > 0) {
          setQuickReplySuggestions(quickReplies);
          setShowQuickReplySuggestions(true);
          setSelectedSuggestionIndex(-1);
        }
      }
    } else {
      // Hide suggestions if not starting with '/'
      setShowQuickReplySuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [quickReplies]);

  // Helper function to get text from contentEditable while preserving line breaks
  const getTextFromContentEditable = useCallback((element) => {
    if (!element) return '';

    // Method 1: Walk through child nodes and convert <br> and <div> to \n
    let text = '';
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeName === 'BR') {
        text += '\n';
      } else if (node.nodeName === 'DIV' && node !== element) {
        // If it's a div (not the root element), treat as line break
        // Check if it's the first child or has previous sibling
        if (node.previousSibling || node.parentNode.firstChild === node) {
          text += '\n';
        }
      }
    }

    // Fallback: if walker didn't work, use simpler method
    if (!text) {
      // Clone and replace <br> with \n
      const clone = element.cloneNode(true);
      const brs = clone.querySelectorAll('br');
      brs.forEach(br => {
        const textNode = document.createTextNode('\n');
        br.parentNode.replaceChild(textNode, br);
      });
      text = clone.textContent || clone.innerText || '';
    }

    return text;
  }, []);

  // Replace shortcut with full message
  const replaceShortcutWithMessage = useCallback((quickReply) => {
    const input = document.getElementById('whatsapp-input-message');
    if (!input) return;

    // Get current text (for shortcut detection, we only need first line)
    const currentText = input.textContent || input.innerText || '';

    // Find the shortcut (text after '/') - only check first line
    const firstLine = currentText.split('\n')[0];
    const shortcutMatch = firstLine.match(/^\/(\S*)/);
    if (shortcutMatch) {
      // Replace the shortcut with the full message
      const newText = quickReply.message;

      // Clear input first
      input.textContent = '';
      input.innerHTML = '';

      // Handle line breaks: split by \n and create text nodes with <br> elements
      const lines = newText.split('\n');
      lines.forEach((line, index) => {
        // Add text node for the line
        if (line) {
          const textNode = document.createTextNode(line);
          input.appendChild(textNode);
        }

        // Add <br> element after each line except the last one
        if (index < lines.length - 1) {
          const br = document.createElement('br');
          input.appendChild(br);
        }
      });

      // Update state (use textContent for state, but keep HTML for display)
      setCurrentInputText(newText);
      setShowQuickReplySuggestions(false);
      setSelectedSuggestionIndex(-1);

      // Move cursor to end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(input);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      // Focus input
      input.focus();
    }
  }, []);

  // Handle keyboard navigation for quick reply suggestions
  const handleKeyDown = useCallback((e) => {
    if (!showQuickReplySuggestions || quickReplySuggestions.length === 0) {
      // If Enter is pressed without suggestions, send message
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const input = document.getElementById('whatsapp-input-message');
        const message = getTextFromContentEditable(input);
        if (message.trim()) {
          sendMessage(message);
          if (input) {
            input.textContent = '';
            input.innerHTML = '';
          }
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < quickReplySuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
      case 'Tab':
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < quickReplySuggestions.length) {
          e.preventDefault();
          replaceShortcutWithMessage(quickReplySuggestions[selectedSuggestionIndex]);
        } else if (selectedSuggestionIndex === -1 && quickReplySuggestions.length > 0) {
          // If no suggestion selected, select first one
          e.preventDefault();
          replaceShortcutWithMessage(quickReplySuggestions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowQuickReplySuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [showQuickReplySuggestions, quickReplySuggestions, selectedSuggestionIndex, replaceShortcutWithMessage, sendMessage]);

  useEffect(() => {
    return () => {
      if (quickReplyBlurTimeoutRef.current) {
        clearTimeout(quickReplyBlurTimeoutRef.current);
      }
    };
  }, []);

  // Fetch agent names when messages change (including closed history messages)
  useEffect(() => {
    const allMessages = showClosedHistory
      ? [...closedHistoryMessages, ...messages]
      : messages;

    if (allMessages.length > 0) {
      const agentIds = new Set();
      allMessages.forEach(msg => {
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
  }, [messages, closedHistoryMessages, showClosedHistory, fetchAgentName, agentNames]);

  // Fetch agent names for assigned agents when assignedAgentId changes
  useEffect(() => {
    if (assignedAgentId) {
      // Get assigned agent IDs (can be comma-separated)
      const assignedIdsStr = String(assignedAgentId);
      const assignedAgents = assignedIdsStr.split(',').map(a => a.trim()).filter(a => a && a !== 'undefined' && a !== 'null');

      // Fetch names for all assigned agent IDs that aren't in cache
      assignedAgents.forEach(agentIdStr => {
        // Only fetch if it's a valid numeric agent ID
        if (agentIdStr && !isNaN(agentIdStr) && !agentIdStr.includes('-') && !agentIdStr.includes('_')) {
          if (!agentNames[agentIdStr]) {
            fetchAgentName(agentIdStr).catch(err => {
              console.error(`❌ Failed to fetch assigned agent name for ${agentIdStr}:`, err);
            });
          }
        }
      });
    }
  }, [assignedAgentId, fetchAgentName, agentNames]);

  // SimpleBar ref dan auto-scroll agar menyerupai Opened.jsx
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
  }, [messages, agentNames, closedHistoryMessages, showClosedHistory]); // Add closedHistoryMessages and showClosedHistory to trigger re-render

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
    // BUT: Don't override if agent_id is already 'ai-assistant' (AI response)
    if (isFromAgent && !agentIdFromMessage && msg.agent_id !== 'ai-assistant' && msg.agentId !== 'ai-assistant') {
      agentIdFromMessage = user?.agent_id || user?.id;
    }

    // Get agent name from cache or use fallback
    const agentIdStr = agentIdFromMessage ? String(agentIdFromMessage) : null;
    let agentName = null;

    if (isFromAgent) {
      // Check if this is an AI response (agent_id is 'ai-assistant' or contains 'ai')
      const isAiResponse = agentIdStr && (
        agentIdStr === 'ai-assistant' ||
        agentIdStr.toLowerCase().includes('ai') ||
        agentIdStr.toLowerCase() === 'ai'
      );

      // If chat is NOT assigned and this is an AI response, show "AI"
      const isChatUnassigned = !assignedAgentId || assignedAgentId === null || assignedAgentId === '';

      if (isAiResponse && isChatUnassigned) {
        // Chat belum di-assign dan ini AI response, tampilkan "AI"
        agentName = 'AI';
      } else {
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
                // Force component re-render by updating state
                setAgentNames(prev => ({ ...prev, [agentIdStr]: fetchedName }));
              }
            }).catch(err => {
              console.error(`❌ Error fetching agent name in toBubbleData:`, err);
            });
          }
        } else if (isAiResponse) {
          // Special case for AI assistant (even if chat is assigned, if agent_id is explicitly 'ai-assistant')
          agentName = 'AI';
        } else {
          // No valid agent ID, use user name_agent or fallback
          agentName = user?.name_agent || user?.email || user?.name || 'Me';
        }
      }
    }

    const displayName = isFromAgent ? agentName : phone;
    // Warna teks avatar: hitam untuk mobile, putih untuk desktop
    // const avatarTextColor = isMobileView ? '000';
    const avatarTextColor = '000';

    const avatar = isFromAgent
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f5f7fb&color=${avatarTextColor}`
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
          console.warn('⚠️ [toBubbleData] Failed to parse media_data:', parseError);
          mediaDataObj = { url: msg.media_data, data: msg.media_data };
        }
        mimeType = msg.mediaType || (mediaDataObj && (mediaDataObj.mimetype || mediaDataObj.mimeType)) || '';
      }

      // If we have media data, extract file URL
      if (mediaDataObj) {
        // If media has data (base64), convert to data URL
        if (mediaDataObj.data) {
          mimeType = mimeType || mediaDataObj.mimetype || mediaDataObj.mimeType || 'application/octet-stream';
          fileUrl = `data:${mimeType};base64,${mediaDataObj.data}`;
        } else if (mediaDataObj.url) {
          // If media has URL, check if it's relative or absolute
          let url = mediaDataObj.url;
          // If URL is relative (starts with /), convert to absolute URL
          if (url.startsWith('/')) {
            // Get instance from message or default to wa1
            const instance = msg.instance || whatsappIntegration.phoneToInstance?.get(phoneRef.current) || 'wa1';
            // Convert relative URL to absolute URL
            fileUrl = `https://waserverlive.genio.id/${instance}${url}`;
          } else if (url.startsWith('http://') || url.startsWith('https://')) {
            // Already absolute URL, use as is
            fileUrl = url;
          } else {
            // Assume it's a relative path without leading slash
            const instance = msg.instance || whatsappIntegration.phoneToInstance?.get(phoneRef.current) || 'wa1';
            fileUrl = `https://waserverlive.genio.id/${instance}/${url}`;
          }
        } else {
          console.warn('⚠️ [toBubbleData] mediaDataObj exists but has no data or url:', mediaDataObj);
        }
      } else {
        console.warn('⚠️ [toBubbleData] hasMedia is true but no mediaDataObj found');
      }

      // Get mimeType from message_type if not found yet
      if (!mimeType && msg.message_type === 'image') {
        mimeType = 'image/jpeg'; // Default to JPEG for images
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
        }
        // For images, ensure we have fileUrl
        if (!fileUrl && mediaDataObj && mediaDataObj.data) {
          fileUrl = `data:${mimeType};base64,${mediaDataObj.data}`;
        }
      } else if (mimeType && mimeType.startsWith('video/')) {
        fileType = 'video';
        extension = mimeType.split('/')[1] || 'mp4';
        // Check if filename has a valid extension (ends with .ext)
        const hasValidExtension = /\.(mp4|webm|avi|mov|mkv|mpeg|mpg)$/i.test(fileName);
        if (!hasValidExtension) {
          fileName = `${fileName}.${extension}`;
        }
      } else if (mimeType === 'application/pdf') {
        fileType = 'other'; // PDF
        if (!fileName.toLowerCase().endsWith('.pdf')) {
          fileName = `${fileName}.pdf`;
        }
      } else if (mimeType && (mimeType.includes('excel') || mimeType.includes('spreadsheet') || fileName.match(/\.(xls|xlsx)$/i))) {
        fileType = 'other'; // Excel
        if (!fileName.match(/\.(xls|xlsx)$/i)) {
          fileName = `${fileName}.xlsx`;
        }
      } else if (mimeType && (mimeType.includes('word') || fileName.match(/\.(doc|docx)$/i))) {
        fileType = 'other'; // Word
        if (!fileName.match(/\.(doc|docx)$/i)) {
          fileName = `${fileName}.docx`;
        }
      } else if (msg.message_type === 'image') {
        // Fallback: if message_type is image but no mimeType, assume image
        fileType = 'image';
        const hasValidImageExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif)$/i.test(fileName);
        if (!hasValidImageExtension) {
          fileName = `${fileName}.jpg`;
        }
      } else {
        fileType = 'other'; // Other documents
        // Try to extract extension from mimeType or default to 'bin'
        if (mimeType && mimeType.includes('/')) {
          extension = mimeType.split('/')[1].split(';')[0]; // Remove charset if present
          const hasExtension = fileName.includes('.') && fileName.split('.').length > 1;
          if (!hasExtension) {
            fileName = `${fileName}.${extension}`;
          }
        } else {
          const hasExtension = fileName.includes('.') && fileName.split('.').length > 1;
          if (!hasExtension) {
            fileName = `${fileName}.bin`;
          }
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
      formatted_date: msg.receivedAt || new Date().toISOString(),
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_id: fileId,
    };

    return bubbleData;
  };

  const handleSearchMessage = (query) => {
    setSearchMessageQuery(query);
  };

  const handlerJoinChat = async () => {
    if (!phone || !user.agent_id) {
      return;
    }

    // Get instance from phoneToInstance map, default to wa1
    const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1'; // Default to wa1 if instance not found

    try {
      const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/assign-chat/${phone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId: String(user.agent_id)
        })
      });

      const data = await response.json();

      if (data.success) {
        // assignedTo can now be comma-separated (e.g., "18,19")
        const newAssignedTo = data.assignedTo || String(user.agent_id);
        setAssignedAgentId(newAssignedTo);

        // Emit event untuk update UI (local event)
        window.dispatchEvent(new CustomEvent('whatsapp:chatAssigned', {
          detail: { phone, agentId: user.agent_id, assignedTo: newAssignedTo }
        }));

        // Broadcast ke semua tab/browser melalui localStorage
        try {
          const eventData = {
            type: 'whatsapp:chatAssigned',
            phone,
            agentId: user.agent_id,
            assignedTo: newAssignedTo,
            timestamp: Date.now()
          };
          localStorage.setItem('whatsapp:chatAssigned', JSON.stringify(eventData));
          // Remove after a short delay to allow other tabs to read it
          setTimeout(() => {
            localStorage.removeItem('whatsapp:chatAssigned');
          }, 100);
        } catch (e) {
          // localStorage might not be available
        }
      }
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  return (
    <Fragment>
      <style>
        {`
          /* WhatsApp Web-like transition animation */
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .whatsapp-detail-container {
            animation: slideInFromRight 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
          }

          /* Preserve line breaks in message bubbles */
          .message-styled,
          .message-styled p,
          .ctext-wrap p,
          .ctext-wrap-content-responsived p,
          .ctext-wrap-content-responsived .message-styled,
          .ctext-wrap-content-responsived .message-styled p,
          .user-chat-content p,
          .user-chat-content .message-styled,
          .ctext-wrap-content-responsived > *,
          .ctext-wrap-content-responsived > * > p,
          .ctext-wrap-content-responsived > * > div,
          .ctext-wrap-content-responsived > * > div > p,
          .conversation-list .message-styled,
          .conversation-list .message-styled p,
          .conversation-list p,
          .ctext-wrap-content-responsived div,
          .ctext-wrap-content-responsived div p {
            white-space: pre-wrap !important;
            word-break: break-word !important;
          }

          @media (max-width: 767px) {
            #whatsapp-input-message {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              box-sizing: border-box !important;
              flex: 1 !important;
            }
            .detail-chat {
              display: flex !important;
              flex-direction: column !important;
              height: 100vh !important;
              overflow: visible !important;
            }
            .detail-chat > div {
              overflow: visible !important;
            }
            .chat-input {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 1000 !important;
              background-color: #fff !important;
              width: 100% !important;
            }
            .chat-input .border-top.mb-0 {
              padding-left: 20px !important;
              padding-right: 20px !important;
              padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important;
              background-color: #fff !important;
              box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
              position: relative !important;
            }
            .chat-conversation {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              padding-bottom: 120px !important;
            }
          }
        `}
      </style>
      <div className="d-flex detail-chat whatsapp-detail-container">
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
            return (
              <Header detailClient={detailClient} closeChat={onClose} onSearchMessage={handleSearchMessage} />
            );
          })()}

          {selectedFile && !isChatClosed && (
            <div className="d-flex justify-content-center align-items-center py-2 bg-info bg-opacity-10" style={{ border: '2px solid red', minHeight: '100px', marginBottom: '20px' }}>
              <div className="text-center">
                <div className="mb-2">
                  <i className="fas fa-file text-info me-2"></i>
                  <span className="fw-bold">{selectedFile.name}</span>
                </div>

                <div className="mb-2">
                  {selectedFile.type && selectedFile.type.startsWith('image/') ? (
                    <div>
                      <img
                        src={`data:${selectedFile.type};base64,${selectedFile.base64Data}`}
                        alt="Preview"
                        style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px' }}
                        className="img-fluid"
                      />
                      <div className="mt-1">
                        <small className="text-muted">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <i className="fas fa-file-pdf text-danger me-2" style={{ fontSize: '2rem' }}></i>
                      <div>
                        <small className="text-muted">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={sendFile}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-1"></i>
                        Send File
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={cancelFileUpload}
                    disabled={isUploading}
                  >
                    <i className="fas fa-times me-1"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reload Closed Chat History */}
          {hasClosedChatHistory && !showClosedHistory && !isChatClosed && (
            <div
              className="p-2 p-lg-2 border-top border-bottom bg-light text-center"
              style={{
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={loadClosedChatHistory}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            >
              <small className="text-muted">
                <i className="ri-history-line me-1"></i>
                Nomor ini sudah pernah chat sebelumnya. Klik untuk melihat history chat closed.
              </small>
            </div>
          )}

          {/* Loading indicator for closed history */}
          {isLoadingClosedHistory && (
            <div className="p-2 p-lg-2 border-top border-bottom bg-light text-center">
              <small className="text-muted">
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                Memuat history chat closed...
              </small>
            </div>
          )}

          <SimpleBar
            ref={scrollRef}
            className="chat-conversation p-3 p-lg-4"
            id="messages"
          >
            <ul className="list-unstyled mb-0">
              {/* Show closed history messages if loaded */}
              {showClosedHistory && closedHistoryMessages.length > 0 && (
                <>
                  <li className="mb-3">
                    <div className="text-center">
                      <div className="badge bg-secondary mb-2">
                        <i className="ri-history-line me-1"></i>
                        History Chat Closed
                      </div>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          setShowClosedHistory(false);
                          setClosedHistoryMessages([]);
                        }}
                      >
                        <i className="ri-close-line me-1"></i>
                        Tutup History
                      </button>
                    </div>
                  </li>
                  {closedHistoryMessages.map((m) => {
                    const bubbleData = toBubbleData(m);
                    const key = `${m.id}_${m.agent_id || ''}_${agentNames[m.agent_id || ''] || ''}_closed`;
                    return <BubbleChatClient key={key} data={bubbleData} />;
                  })}
                  <li className="mb-3 mt-3">
                    <div className="text-center">
                      <div className="badge bg-primary">
                        <i className="ri-arrow-up-line me-1"></i>
                        Chat Aktif (Di Bawah)
                      </div>
                    </div>
                  </li>
                </>
              )}

              {/* Show active/open messages */}
              {filterMessages(showClosedHistory ? messages : messages).length === 0 ? (
                <li>
                  <div className="d-flex justify-content-center align-items-center py-4">
                    <div className="text-center text-muted">
                      {searchMessageQuery.trim() ? 'No messages found matching your search' : 'Loading ...'}
                    </div>
                  </div>
                </li>
              ) : (
                filterMessages(messages).map((m, idx) => {
                  const bubbleData = toBubbleData(m);
                  // Force re-render when agentNames update
                  // Use stable key to prevent unnecessary re-renders
                  const key = `${m.id}_${m.agent_id || ''}_${agentNames[m.agent_id || ''] || ''}`;
                  return <BubbleChatClient key={key} data={bubbleData} />;
                })
              )}
            </ul>
          </SimpleBar>

          {isChatClosed && (
            <div className="p-2 p-lg-2 border-top bg-light text-center">
              <small className="text-muted">
                <i className="ri-chat-check-line me-1"></i>
                Chat ini sudah di-solve dan dipindahkan ke Chat History. Tidak dapat mengirim pesan lagi.
              </small>
            </div>
          )}

          {!isChatClosed && (
            <>
              {(() => {
                // Get current agent ID - prioritize agent_id over id
                const currentAgentId = user?.agent_id || user?.id;
                const currentAgentIdStr = currentAgentId ? String(currentAgentId) : '';

                // Get assigned agent IDs (can be comma-separated)
                // Filter out null, undefined, and string 'undefined'
                let assignedIdsStr = '';
                if (assignedAgentId !== null && assignedAgentId !== undefined && assignedAgentId !== 'undefined' && assignedAgentId !== 'null') {
                  assignedIdsStr = String(assignedAgentId);
                }
                const assignedAgents = assignedIdsStr ? assignedIdsStr.split(',').map(a => a.trim()).filter(a => a && a !== 'undefined' && a !== 'null') : [];

                // Check if current agent is in the assigned list
                const isCurrentAgentAssigned = assignedAgents.includes(currentAgentIdStr);

                // Show Join Chat if assigned to someone else but not current agent
                const isAssignedToOtherAgent = assignedIdsStr && assignedAgents.length > 0 && !isCurrentAgentAssigned && currentAgentIdStr !== '';

                // Get agent names for display
                const assignedAgentNames = assignedAgents.map(agentId => {
                  const agentName = agentNames[agentId];
                  if (agentName && agentName !== `Agent ${agentId}`) {
                    return agentName;
                  }
                  return null; // Will fallback to ID
                }).filter(name => name !== null);

                // Format display text: show names if available, otherwise show IDs
                let displayText = '';
                if (assignedAgentNames.length > 0) {
                  // Show names
                  if (assignedAgentNames.length === 1) {
                    displayText = `Chat ini sudah di-assign ke ${assignedAgentNames[0]}`;
                  } else {
                    displayText = `Chat ini sudah di-assign ke ${assignedAgentNames.join(', ')}`;
                  }
                } else {
                  // Fallback to IDs if names not yet loaded
                  if (assignedAgents.length === 1) {
                    displayText = `Chat ini sudah di-assign ke agent lain (ID: ${assignedAgents[0]})`;
                  } else {
                    displayText = `Chat ini sudah di-assign ke agent lain (ID: ${assignedAgents.join(', ')})`;
                  }
                }

                return isAssignedToOtherAgent ? (
                  <div
                    className="p-3 border-top bg-light text-center"
                    style={isMobileView ? {
                      position: 'sticky',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 999,
                      backgroundColor: '#f8f9fa',
                      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                      width: '100%'
                    } : {}}
                  >
                    <div className="mb-2">
                      <small className="text-muted d-block mb-2">
                        {displayText}
                      </small>
                      <button
                        className="btn btn-tangerin btn-sm"
                        onClick={handlerJoinChat}
                      >
                        <i className="ri-user-add-line me-1"></i>
                        Join Chat
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="chat-input" style={isMobileView ? {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    backgroundColor: '#fff',
                    width: '100%'
                  } : {}}>
                    <div className={`border-top mb-0 ${isMobileView ? 'py-2' : 'p-2 p-lg-2'}`} style={isMobileView ? {
                      paddingLeft: '20px',
                      paddingRight: '20px',
                      paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
                      backgroundColor: '#fff',
                      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      zIndex: 1000
                    } : {}}>
                      <Row className="g-0">
                        {/* Mobile version */}
                        {isMobileView ? (
                          <Col className="col-12" style={{ padding: '0' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              width: '100%',
                              maxWidth: '100%'
                            }}>
                              {/* Input message - diperkecil agar muat dengan tombol di kanan */}
                              <div style={{
                                flex: 1,
                                minWidth: 0,
                                padding: '0',
                                margin: '0',
                                boxSizing: 'border-box',
                                overflow: 'hidden'
                              }}>
                                <div style={{ position: 'relative', width: '100%' }}>
                                  <div className="form-control bg-light border-light"
                                    contentEditable="true"
                                    id="whatsapp-input-message"
                                    style={{
                                      minHeight: '36px',
                                      maxHeight: '80px',
                                      padding: '6px 10px',
                                      width: '100%',
                                      maxWidth: '100%',
                                      boxSizing: 'border-box',
                                      fontSize: '14px',
                                      minWidth: 0,
                                      overflowY: 'auto'
                                    }}
                                    placeholder="Type message..."
                                    onBlur={handleInputBlur}
                                    onInput={(e) => {
                                      handleInputChange(e);
                                    }}
                                    onPaste={handlePaste}
                                    onKeyDown={handleKeyDown}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey && !showQuickReplySuggestions) {
                                        e.preventDefault();
                                        const message = getTextFromContentEditable(e.target);
                                        if (message.trim()) {
                                          sendMessage(message);
                                          e.target.textContent = '';
                                          e.target.innerHTML = '';
                                        }
                                      }
                                    }}
                                  />
                                  {/* Quick Reply Suggestions */}
                                  {showQuickReplySuggestions && quickReplySuggestions.length > 0 && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '100%',
                                      left: 0,
                                      right: 0,
                                      backgroundColor: '#fff',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      maxHeight: '200px',
                                      overflowY: 'auto',
                                      zIndex: 9999,
                                      marginBottom: '4px',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}>
                                      <div style={{ padding: '4px 8px', fontSize: '11px', color: '#999', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
                                        Quick Replies ({quickReplySuggestions.length})
                                      </div>
                                      {quickReplySuggestions.map((qr, index) => (
                                        <div
                                          key={qr.id || index}
                                          onClick={() => {
                                            replaceShortcutWithMessage(qr);
                                          }}
                                          onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                          style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            backgroundColor: selectedSuggestionIndex === index ? '#f0f0f0' : '#fff',
                                            borderBottom: index < quickReplySuggestions.length - 1 ? '1px solid #eee' : 'none'
                                          }}
                                        >
                                          <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>
                                            /{qr.shortcut}
                                          </div>
                                          <div style={{ fontSize: '13px', color: '#333', marginTop: '2px' }}>
                                            {qr.message}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Emoji button */}
                              <button
                                className="btn btn-link text-muted"
                                type="button"
                                title="Emoji"
                                style={{
                                  padding: '8px',
                                  fontSize: '18px',
                                  minWidth: '36px',
                                  width: '36px',
                                  height: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <i className="far fa-smile"></i>
                              </button>
                              {/* Attach file button */}
                              <label
                                htmlFor="whatsapp-file-input-mobile"
                                className="btn btn-link text-muted"
                                title="Attach File"
                                style={{
                                  cursor: 'pointer',
                                  padding: '8px',
                                  fontSize: '18px',
                                  minWidth: '36px',
                                  width: '36px',
                                  height: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  margin: 0
                                }}
                              >
                                <i className="fas fa-paperclip"></i>
                                <input
                                  id="whatsapp-file-input-mobile"
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={handleFileSelect}
                                  style={{ display: 'none' }}
                                />
                              </label>
                              {/* Send button */}
                              <button
                                className="btn btn-tangerin"
                                type="button"
                                onClick={(e) => {
                                  const input = document.getElementById('whatsapp-input-message');
                                  const message = getTextFromContentEditable(input);
                                  if (message.trim()) {
                                    sendMessage(message);
                                    input.textContent = '';
                                    input.innerHTML = '';
                                  }
                                }}
                                style={{
                                  backgroundColor: '#ff8c00',
                                  borderColor: '#ff8c00',
                                  minWidth: '40px',
                                  width: '40px',
                                  height: '40px',
                                  padding: '0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <i className="fas fa-paper-plane"></i>
                              </button>
                            </div>
                          </Col>
                        ) : (
                          <>
                            {/* Desktop version */}
                            <Col>
                              <div style={{ position: 'relative' }}>
                                <div className="form-control bg-light border-light"
                                  contentEditable="true"
                                  id="whatsapp-input-message"
                                  style={{ minHeight: '32px', padding: '6px 12px' }}
                                  placeholder="Type message..."
                                  onBlur={handleInputBlur}
                                  onInput={(e) => {
                                    handleInputChange(e);
                                  }}
                                  onPaste={handlePaste}
                                  onKeyDown={handleKeyDown}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !showQuickReplySuggestions) {
                                      e.preventDefault();
                                      const message = getTextFromContentEditable(e.target);
                                      if (message.trim()) {
                                        sendMessage(message);
                                        e.target.textContent = '';
                                        e.target.innerHTML = '';
                                      }
                                    }
                                  }}
                                />
                                {/* Quick Reply Suggestions */}
                                {showQuickReplySuggestions && quickReplySuggestions.length > 0 && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    zIndex: 9999,
                                    marginBottom: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}>
                                    <div style={{ padding: '4px 8px', fontSize: '11px', color: '#999', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
                                      Quick Replies ({quickReplySuggestions.length})
                                    </div>
                                    {quickReplySuggestions.map((qr, index) => (
                                      <div
                                        key={qr.id || index}
                                        onClick={() => {
                                          replaceShortcutWithMessage(qr);
                                        }}
                                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                        style={{
                                          padding: '8px 12px',
                                          cursor: 'pointer',
                                          backgroundColor: selectedSuggestionIndex === index ? '#f0f0f0' : '#fff',
                                          borderBottom: index < quickReplySuggestions.length - 1 ? '1px solid #eee' : 'none'
                                        }}
                                      >
                                        <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>
                                          /{qr.shortcut}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#333', marginTop: '2px' }}>
                                          {qr.message}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Col>
                            <Col className="d-none d-md-block d-lg-block" xs="auto">
                              <div className="d-flex align-items-center">
                                <button
                                  className="btn btn-link text-muted"
                                  type="button"
                                  title="Emoji"
                                >
                                  <i className="far fa-smile"></i>
                                </button>
                                <label
                                  htmlFor="whatsapp-file-input"
                                  className="btn btn-link text-muted"
                                  title="Attach File"
                                  style={{ cursor: 'pointer' }}
                                >
                                  <i className="fas fa-paperclip"></i>
                                  <input
                                    id="whatsapp-file-input"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    onClick={(e) => { }}
                                  />
                                </label>
                                <button
                                  className="btn btn-tangerin"
                                  type="button"
                                  onClick={(e) => {
                                    const input = document.getElementById('whatsapp-input-message');
                                    const message = input.textContent || input.innerText;
                                    if (message.trim()) {
                                      sendMessage(message.trim());
                                      input.textContent = '';
                                      input.innerText = '';
                                    }
                                  }}
                                  style={{ backgroundColor: '#ff8c00', borderColor: '#ff8c00' }}
                                >
                                  <i className="fas fa-paper-plane"></i>
                                </button>
                              </div>
                            </Col>
                          </>
                        )}
                      </Row>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
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
    </Fragment >
  );
}

export default WhatsAppDetail;
