import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Button,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';

/* image default */
import { authSelector } from '../../../app/Auth/AuthSlice';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';
import AvatarDefault from '../../../assets/images/users/avatar/avatar-4.png';
import ModalMd from '../../../Common/Components/Modal/ModalMd';
import ModalSm from '../../../Common/Components/Modal/ModalSm';
import Category from '../../../Common/Components/Tab/TransferChatClient/Category';
import Content from '../../../Common/Components/Tab/TransferChatClient/Content';
import {
  capitalizeFirstMultiParagraph,
  notify,
} from '../../../Common/utils/helpers';
import { solveChat } from '../../../Common/WebSocket/Clients/ClientActions';
import whatsappIntegration from '../../../whatsapp-integration';
import { getListResolveChat } from '../Tabs/ChatWithClients/ListChat/ListChatClientSlice';
import { onlineUsersSelector } from '../Tabs/ChatWithClients/OnlineUsers/OnlineUsersSlice';
import { sendChatHistory } from './DetailChatClientAPI';
import {
  detailChatClientSelector,
  updateStatusRightBar,
} from './DetailChatClientSlice';

// Function to get instance display name
const getInstanceDisplayName = (instance) => {
  const instanceMap = {
    'wa1': 'From Qwords',
    'wa2': 'From GFN',
    'wa3': 'From Relabs',
    'wa4': 'From Aksara',
    'wa5': 'From Gudang SSL',
    'wa6': 'From Bikin Website'
  };
  return instanceMap[instance] || `From ${instance}`;
};

// Function to get API endpoint based on instance (by phone - faster)
const getClientApiEndpointByPhone = (instance) => {
  const endpointMap = {
    'wa1': '/external/clientqwordsbyphone',
    'wa2': '/external/clientgoldenfastbyphone',
    'wa3': '/external/clientrelabsbyphone',
    'wa4': null, // Aksara - belum ada endpoint
    'wa5': '/external/clientgudangsslbyphone',
    'wa6': '/external/clientbikinwebsitebyphone'
  };
  return endpointMap[instance] || null;
};

// Function to fetch client name from external API by phone (faster - single query)
// Returns: nama lengkap jika ditemukan, null jika tidak ditemukan
const fetchClientNameFromAPI = async (phoneNumber, instance) => {
  try {
    const endpoint = getClientApiEndpointByPhone(instance);
    if (!endpoint) {
      return null; // Endpoint tidak ada, return null untuk gunakan nomor telepon
    }

    // Skip if phone number is empty or invalid
    if (!phoneNumber || phoneNumber.trim() === '') {
      return null;
    }

    // Use by phone endpoint for faster query
    // Use AbortController to prevent console errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(`https://admin-chat.genio.id${endpoint}?phone=${encodeURIComponent(phoneNumber)}`, {
        signal: controller.signal,
        // Suppress default error logging by using mode
        mode: 'cors',
        credentials: 'omit'
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Handle abort and network errors silently
      if (fetchError.name === 'AbortError' || fetchError.name === 'TypeError') {
        return null;
      }
      // For other errors, use warn instead of error
      if (fetchError.message && !fetchError.message.includes('fetch')) {
        console.warn('⚠️ Warning fetching client name:', fetchError.message);
      }
      return null;
    }

    // Handle 400 (Bad Request) and 404 (Not Found) silently - these are expected cases
    if (response.status === 400 || response.status === 404) {
      // Silent return - no console log for expected 404/400
      return null; // Client not found or invalid request, return null silently
    }

    if (!response.ok) {
      // For other errors, use warn
      console.warn(`⚠️ API returned status ${response.status} for client name fetch`);
      return null; // Other response errors, return null untuk gunakan nomor telepon
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      return null; // Data tidak valid, return null untuk gunakan nomor telepon
    }

    // Client data is already returned (single client, not array)
    const client = data.data;

    if (client) {
      const firstName = client.firstname || '';
      const lastName = client.lastname || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || null; // Jika nama kosong, return null untuk gunakan nomor telepon
    }

    return null; // Client tidak ditemukan, return null untuk gunakan nomor telepon
  } catch (error) {
    // Silent error handling - don't log expected errors
    // Only use warn for unexpected errors
    if (error.name !== 'AbortError' && error.name !== 'TypeError' && error.message && !error.message.includes('fetch')) {
      console.warn('⚠️ Warning fetching client name:', error.message);
    }
    return null; // Error, return null untuk gunakan nomor telepon
  }
};

function Header(props) {
  const { detailClient, closeChat, onSearchMessage } = props;
  const avatar = AvatarDefault;
  const [userName, setUserName] = useState('');
  const [isLoadingClientName, setIsLoadingClientName] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  /* state */
  const [dropdownMenuHeader, setDropdownMenuHeader] = useState(false);
  const [transferChatModal, setTransferChatModal] = useState(false);
  const [isModalSendChat, setIsModalSendChat] = useState(false);
  const [transferTabActive, setTransferTabActive] = useState('agent-list');
  const [isConfirmSolve, setIsConfirmSolve] = useState(false);
  const [dataSolve, setDataSolve] = useState({});
  const [isConfirmAssign, setIsConfirmAssign] = useState(false);
  const [emailClient, setEmailClient] = useState('');
  const [searchMessageQuery, setSearchMessageQuery] = useState('');
  const { department_online, agent_online } = useSelector(onlineUsersSelector);
  const { user } = useSelector(authSelector);
  const [loaderSendHistoryChat, setLoaderSendHistoryChat] = useState(false);
  const [isChatClosed, setIsChatClosed] = useState(false);
  const [isAssignedToMe, setIsAssignedToMe] = useState(false);
  const [assignedAgentId, setAssignedAgentId] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isChatPending, setIsChatPending] = useState(false);
  const [isPendinging, setIsPendinging] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  // Mobile detection
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const { chatId, rightBarMenu } = useSelector(detailChatClientSelector);
  const { activeTab } = useSelector(layoutSetupSelector);
  const dispatch = useDispatch();

  // Check if this is WhatsApp chat - check both chatId from redux and detailClient.chat_id
  const isWhatsAppChat = (chatId && chatId.startsWith('whatsapp-')) ||
    (detailClient.chat_id && detailClient.chat_id.startsWith('whatsapp-'));
  
  // Check if this is LiveChat
  const isLiveChat = (chatId && chatId.startsWith('livechat-')) ||
    (detailClient.chat_id && detailClient.chat_id.startsWith('livechat-'));

  // Check if this is history view (closed chat from history tab)
  const isHistoryView = activeTab === 'Chat-w-history' || isChatClosed || [9, 10, 11].includes(detailClient.status);

  /* handler */
  const toggleHandlerHeaderMenu = () =>
    setDropdownMenuHeader(!dropdownMenuHeader);

  const toggleTransferChatModal = () =>
    setTransferChatModal(!transferChatModal);

  const toggleHandlerTabActiveTransfer = (val) => {
    setTransferTabActive(val);
  };

  const toggleHandlerDetailClientMenu = (originStatus) => {
    const status = !Boolean(originStatus) ? true : false;
    dispatch(updateStatusRightBar(status));
  };

  const handlerSolveChat = async () => {
    // Check if this is WhatsApp chat
    const chatIdToSolve = dataSolve.chat_id;
    console.log(chatIdToSolve);
    const isWhatsAppChatToSolve = chatIdToSolve && chatIdToSolve.startsWith('whatsapp-');
    const isLiveChatToSolve = (chatIdToSolve && chatIdToSolve.startsWith('livechat-')) || (chatId && chatId.startsWith('livechat-'));

    if (isWhatsAppChatToSolve) {
      // Extract phone number from chat_id (format: whatsapp-6281234567890)
      const phone = chatIdToSolve.replace('whatsapp-', '');

      // Get instance from phoneToInstance map, default to wa1
      const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';

      try {
        // Call endpoint to close WhatsApp chat
        const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/close-chat/${phone}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          // Mark as closed locally
          setIsChatClosed(true);

          // Close the chat and refresh the list
          closeChat();

          // Remove chat from whatsappIntegration.chats immediately
          const normalizedPhone = phone?.replace('@c.us', '') || phone;
          whatsappIntegration.chats = whatsappIntegration.chats.filter(chat => {
            const chatPhone = chat.phone?.replace('@c.us', '') || chat.phone;
            return chatPhone !== normalizedPhone;
          });

          // Refresh WhatsApp chat list by emitting event (local event)
          window.dispatchEvent(new CustomEvent('whatsapp:chatClosed', { detail: { phone } }));

          // Broadcast ke semua tab/browser melalui localStorage
          try {
            const eventData = {
              type: 'whatsapp:chatClosed',
              phone: phone,
              timestamp: Date.now()
            };
            localStorage.setItem('whatsapp:chatClosed', JSON.stringify(eventData));
            // Remove after a short delay to allow other tabs to read it
            setTimeout(() => {
              localStorage.removeItem('whatsapp:chatClosed');
            }, 100);
          } catch (e) {
            // localStorage might not be available
          }

          // Emit chatsUpdated to update UI immediately
          whatsappIntegration.emit('chatsUpdated', whatsappIntegration.chats);

          // Also call filterClosedChats to ensure consistency
          whatsappIntegration.filterClosedChats().then(() => {
            whatsappIntegration.emit('chatsUpdated', whatsappIntegration.chats);
          });

          // Show success notification
          notify('success', 3000, 'Chat WhatsApp berhasil di-solve dan dipindahkan ke chat history');
        } else {
          notify('error', 3000, 'Gagal menyelesaikan chat: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error closing WhatsApp chat:', error);
        notify('error', 3000, 'Gagal menyelesaikan chat WhatsApp');
      }
    } else if (isLiveChatToSolve) {
      // Live Chat - panggil API backend untuk end chat (chat_status = closed), lalu hilang dari list
      const rawId = chatIdToSolve || chatId || '';
      const chatSessionId = rawId.replace(/^livechat-/, '').replace(/-LIVE$/, '');
      try {
        const response = await fetch(`https://cvbev2.genio.id/api-socket/chats/${encodeURIComponent(chatSessionId)}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          closeChat();
          if (user?.uuid) dispatch(getListResolveChat(user.uuid));
          notify('success', 3000, 'Chat berhasil di-solve dan hilang dari list.');
        } else {
          notify('error', 3000, data.error || 'Gagal menyelesaikan chat');
        }
      } catch (err) {
        console.error('Error solving live chat:', err);
        notify('error', 3000, 'Gagal menyelesaikan chat');
      }
    } else {
      // Regular chat - use existing solveChat function
      solveChat(chatIdToSolve);
    }

    setIsConfirmSolve(false);
    setDataSolve({});
  };

  const showConfirmationSolveChat = (params) => {
    setIsConfirmSolve(true);
    setDataSolve(params);
  };

  const showConfirmationAssign = () => {
    setIsConfirmAssign(true);
  };

  const toggleConfirmationAssignModal = () => {
    setIsConfirmAssign(false);
  };

  const handlerAssignToMe = async () => {
    if (!isWhatsAppChat && !isLiveChat) return;

    setIsAssigning(true);
    setIsConfirmAssign(false);

    try {
      if (isWhatsAppChat) {
        const phone = (chatId || detailClient.chat_id || '').replace('whatsapp-', '').replace('-WA', '');
        if (!phone || !user.agent_id) {
          notify('error', 3000, 'Tidak dapat meng-assign chat');
          return;
        }

        const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';
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
          const newAssignedTo = data.assignedTo || String(user.agent_id);
          setAssignedAgentId(newAssignedTo);
          setIsAssignedToMe(true);
          notify('success', 3000, 'Chat berhasil di-assign ke Anda. AI response akan dinonaktifkan.');

          window.dispatchEvent(new CustomEvent('whatsapp:chatAssigned', {
            detail: { phone, agentId: user.agent_id, assignedTo: newAssignedTo }
          }));

          try {
            const eventData = {
              type: 'whatsapp:chatAssigned',
              phone,
              agentId: user.agent_id,
              assignedTo: newAssignedTo,
              timestamp: Date.now()
            };
            localStorage.setItem('whatsapp:chatAssigned', JSON.stringify(eventData));
            setTimeout(() => {
              localStorage.removeItem('whatsapp:chatAssigned');
            }, 100);
          } catch (e) {
            // localStorage might not be available
          }
        } else {
          notify('error', 3000, 'Gagal meng-assign chat: ' + (data.message || 'Unknown error'));
        }
      } else if (isLiveChat) {
        const chatSessionId = (chatId || detailClient.chat_id || detailClient.chat_session_id || '').replace('livechat-', '').replace(/-LIVE$/, '');
        if (!chatSessionId || !user.agent_id) {
          notify('error', 3000, 'Tidak dapat meng-assign chat');
          return;
        }

        // First, get from_number from the first message of the chat
        const messagesResponse = await fetch(`https://cvbev2.genio.id/api/messages?chat_session_id=${encodeURIComponent(chatSessionId)}&limit=1&offset=0`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!messagesResponse.ok) {
          notify('error', 3000, 'Gagal mengambil informasi chat');
          return;
        }

        const messagesData = await messagesResponse.json();
        const fromNumber = messagesData.messages?.[0]?.from_number;

        if (!fromNumber) {
          notify('error', 3000, 'Tidak dapat menemukan from_number dari chat');
          return;
        }

        // Then assign chat using from_number
        const response = await fetch(`https://cvbev2.genio.id/api/messages/assign-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from_number: fromNumber,
            agent_id: String(user.agent_id)
          })
        });

        const data = await response.json();

        if (response.ok && data.message) {
          const newAssignedTo = String(user.agent_id);
          setAssignedAgentId(newAssignedTo);
          setIsAssignedToMe(true);
          notify('success', 3000, 'Chat berhasil di-assign ke Anda.');

          window.dispatchEvent(new CustomEvent('livechat:chatAssigned', {
            detail: { chatSessionId, agentId: user.agent_id, assignedTo: newAssignedTo }
          }));
        } else {
          notify('error', 3000, 'Gagal meng-assign chat: ' + (data.error || data.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error assigning chat:', error);
      notify('error', 3000, 'Gagal meng-assign chat');
    } finally {
      setIsAssigning(false);
    }
  };

  const handlerPendingChat = async () => {
    if (!isWhatsAppChat) return;

    const phone = (chatId || detailClient.chat_id || '').replace('whatsapp-', '').replace('-WA', '');
    if (!phone) {
      notify('error', 3000, 'Tidak dapat meng-pending chat');
      return;
    }

    // Get instance from phoneToInstance map, default to wa1
    const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';

    setIsPendinging(true);

    try {
      const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/pending-chat/${phone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setIsChatPending(true);
        notify('success', 3000, 'Chat berhasil di-pending. AI response dan auto-close akan dinonaktifkan.');

        // Emit event untuk update UI (local event)
        window.dispatchEvent(new CustomEvent('whatsapp:chatPending', {
          detail: { phone }
        }));

        // Broadcast ke semua tab/browser melalui localStorage
        try {
          const eventData = {
            type: 'whatsapp:chatPending',
            phone,
            timestamp: Date.now()
          };
          localStorage.setItem('whatsapp:chatPending', JSON.stringify(eventData));
          // Remove after a short delay to allow other tabs to read it
          setTimeout(() => {
            localStorage.removeItem('whatsapp:chatPending');
          }, 100);
        } catch (e) {
          // localStorage might not be available
        }
      } else {
        notify('error', 3000, 'Gagal meng-pending chat: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error pending chat:', error);
      notify('error', 3000, 'Gagal meng-pending chat WhatsApp');
    } finally {
      setIsPendinging(false);
    }
  };

  const toggleConfirmationModal = () => {
    setIsConfirmSolve(false);
    setDataSolve({});
  };

  // Function to copy phone number
  const handleCopyPhone = () => {
    const phone = (chatId || detailClient.chat_id || '').replace('whatsapp-', '').replace('-WA', '');
    if (phone) {
      navigator.clipboard.writeText(phone).then(() => {
        notify('success', 2000, 'Nomor telepon berhasil di-copy');
      }).catch(() => {
        notify('error', 2000, 'Gagal copy nomor telepon');
      });
    }
  };

  const toggleHandlerModalHistoryChat = () => {
    if (loaderSendHistoryChat) {
      setIsModalSendChat(true);
    } else {
      const status = isModalSendChat ? false : true;
      setIsModalSendChat(status);
    }
  };

  const handlerChangeEmailClient = (event) => {
    setEmailClient(event.target.value);
  };

  const handlerSearchMessage = (event) => {
    const query = event.target.value;
    setSearchMessageQuery(query);
    if (onSearchMessage) {
      onSearchMessage(query);
    }
  };

  const handlerSendHistory = () => {
    if (!emailClient) {
      return notify('error', 3000, `Email client is required!`);
    }

    setLoaderSendHistoryChat(true);

    const data = {
      chat_id: detailClient.chat_id,
      email: emailClient,
    };

    sendChatHistory(data)
      .then((response) => {
        setLoaderSendHistoryChat(false);
        return notify('success', 3000, `Send history chat success!`);
      })
      .catch((err) => {
        setLoaderSendHistoryChat(false);
        return notify('error', 3000, `Send history failed, please try again!`);
      });
  };

  const ElMenuDekstop = (params) => {
    const { status } = params;
    if (![9, 10, 11].includes(status)) {
      if (parseInt(detailClient.agent_id) === parseInt(user.agent_id)) {
        return (
          <>
            {/* Commented out for WhatsApp chat */}
            {!isWhatsAppChat && (
              <li className="list-inline-item">
                <button
                  type="button"
                  id="forwardChat"
                  className="btn nav-btn"
                  onClick={toggleTransferChatModal}
                >
                  <i className="ri-chat-forward-fill"></i>
                </button>
                <UncontrolledTooltip target="forwardChat" placement="bottom">
                  Transfer Chat
                </UncontrolledTooltip>
              </li>
            )}
            {/* Solve chat button moved to left of search input for WhatsApp */}
          </>
        );
      } else {
        return <></>;
      }
    } else {
      return (
        <li className="list-inline-item">
          <button
            type="button"
            id="forwardChat"
            className="btn nav-btn"
            onClick={toggleHandlerModalHistoryChat}
          >
            <i className="ri-chat-forward-fill"></i>
          </button>
          <UncontrolledTooltip target="forwardChat" placement="bottom">
            Send History Chat
          </UncontrolledTooltip>
        </li>
      );
    }
  };

  useEffect(() => {
    if (detailClient.user_email) {
      setEmailClient(detailClient.user_email);
    }
  }, [detailClient]);

  // Fetch client name from API for WhatsApp chats
  useEffect(() => {
    const fetchClientName = async () => {
      if (isWhatsAppChat) {
        setIsLoadingClientName(true);
        try {
          // Extract phone number from chat_id
          const currentChatId = chatId || detailClient.chat_id || '';
          let phone = currentChatId.replace('whatsapp-', '').replace('-WA', '');

          // Remove instance suffix if present
          const instancePattern = /-(wa[1-6])$/i;
          if (instancePattern.test(phone)) {
            phone = phone.replace(instancePattern, '');
          }

          // Simpan nomor telepon untuk ditampilkan
          setPhoneNumber(phone);

          // Get instance from phoneToInstance map
          const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';

          // Fetch client name from API
          const clientName = await fetchClientNameFromAPI(phone, instance);

          // Jika ada nama dari fetch, gunakan nama. Jika tidak, gunakan instanceMap
          if (clientName) {
            setUserName(clientName);
          } else {
            // Jika tidak ada nama, gunakan instanceMap
            setUserName(getInstanceDisplayName(instance));
          }
        } catch (error) {
          console.error('Error fetching client name:', error);
          // Jika error, gunakan instanceMap
          const currentChatId = chatId || detailClient.chat_id || '';
          let phone = currentChatId.replace('whatsapp-', '').replace('-WA', '');
          const instancePattern = /-(wa[1-6])$/i;
          if (instancePattern.test(phone)) {
            phone = phone.replace(instancePattern, '');
          }
          setPhoneNumber(phone);
          const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';
          setUserName(getInstanceDisplayName(instance));
        } finally {
          setIsLoadingClientName(false);
        }
      } else {
        // For non-WhatsApp chats, use existing logic
        if (Boolean(detailClient.user_name)) {
          setUserName(capitalizeFirstMultiParagraph(detailClient.user_name));
        } else {
          setUserName('');
        }
        setPhoneNumber('');
      }
    };

    fetchClientName();
  }, [isWhatsAppChat, chatId, detailClient.chat_id, detailClient.user_name]);

  // Mobile view detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if WhatsApp chat is closed and assigned status
  useEffect(() => {
    const checkChatStatus = async () => {
      if (isLiveChat) {
        const chatSessionId = (chatId || detailClient.chat_id || detailClient.chat_session_id || '').replace('livechat-', '').replace(/-LIVE$/, '');
        
        // Check assigned_to from detailClient first (if available)
        if (detailClient.assigned_to) {
          const assignedTo = detailClient.assigned_to;
          setAssignedAgentId(assignedTo);
          const currentAgentId = String(user.agent_id || user.id || '');
          const assignedAgents = assignedTo ? assignedTo.split(',').map(a => a.trim()).filter(a => a) : [];
          const assignedToCurrentAgent = assignedAgents.includes(currentAgentId);
          setIsAssignedToMe(assignedToCurrentAgent);
        } else if (chatSessionId) {
          // If not in detailClient, fetch from API
          try {
            const response = await fetch(`https://cvbev2.genio.id/api-socket/chats/${encodeURIComponent(chatSessionId)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                const assignedTo = data.data.assigned_to || null;
                setAssignedAgentId(assignedTo);
                
                const currentAgentId = String(user.agent_id || user.id || '');
                const assignedAgents = assignedTo ? assignedTo.split(',').map(a => a.trim()).filter(a => a) : [];
                const assignedToCurrentAgent = assignedAgents.includes(currentAgentId);
                setIsAssignedToMe(assignedToCurrentAgent);
              }
            }
          } catch (error) {
            console.error('Error checking LiveChat status:', error);
          }
        }
        setIsChatClosed([9, 10, 11].includes(detailClient.status));
      } else if (isWhatsAppChat) {
        const phone = (chatId || detailClient.chat_id || '').replace('whatsapp-', '').replace('-WA', '');
        if (phone) {
          // Get instance from phoneToInstance map
          const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';

          // Check if chat status is closed (status 9, 10, or 11 means closed)
          if ([9, 10, 11].includes(detailClient.status)) {
            setIsChatClosed(true);
            return;
          }

          try {
            // If instance known, use it; otherwise try wa1 first, then wa2 (wa2 not activated yet)
            const instancesToCheck = instance ? [instance] : ['wa1', 'wa2'];

            let isClosed = false;
            let hasOpenMessages = false;

            // IMPORTANT: Check if chat has open messages first
            // If chat has open messages, it should NOT be considered closed
            for (const instanceName of instancesToCheck) {
              try {
                // Check if there are open messages for this phone
                const messagesResponse = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/messages/${phone}?includeClosed=false`);
                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json();
                  if (messagesData.success && messagesData.messages && messagesData.messages.length > 0) {
                    hasOpenMessages = true;
                    //console.log(`✅ Header: Found ${messagesData.messages.length} open message(s) for ${phone}, chat is NOT closed`);
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
                  const closedResponse = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/closed-chats`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });

                  const closedData = await closedResponse.json();
                  if (closedData.success && closedData.chats) {
                    // Check if this phone is in closed chats list
                    const foundClosed = closedData.chats.some(chat => chat.phone === phone || chat.chat_id === `whatsapp-${phone}`);
                    if (foundClosed) {
                      isClosed = true;
                      //console.log(`🔒 Header: Chat ${phone} is closed (no open messages)`);
                      break; // Found in this instance, no need to check others
                    }
                  }
                } catch (err) {
                  console.warn(`Failed to check closed status from ${instanceName}:`, err);
                }
              }
            } else {
              // Chat has open messages, so it's not closed
              isClosed = false;
              //console.log(`✅ Header: Chat ${phone} has open messages, chat is open`);
            }

            setIsChatClosed(isClosed);

            // Check pending status - check if the LATEST message has is_pending = true
            // Only the latest message matters - if latest is pending, skip AI and auto-close
            let isPending = false;
            for (const instanceName of instancesToCheck) {
              try {
                const messagesResponse = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/messages/${phone}`);
                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json();
                  if (messagesData.success && messagesData.messages && messagesData.messages.length > 0) {
                    // Sort messages by receivedAt descending to get the latest message
                    const sortedMessages = [...messagesData.messages].sort((a, b) => {
                      const timeA = new Date(a.receivedAt || 0).getTime();
                      const timeB = new Date(b.receivedAt || 0).getTime();
                      return timeB - timeA; // Descending order
                    });

                    // Check if the LATEST message has is_pending = true or 1
                    const latestMessage = sortedMessages[0];
                    //console.log('🔍 Header: Checking pending status for phone:', phone);
                    //console.log('🔍 Header: Latest message:', latestMessage);
                    //console.log('🔍 Header: is_pending value:', latestMessage?.is_pending, 'Type:', typeof latestMessage?.is_pending);
                    if (latestMessage && (latestMessage.is_pending === true || latestMessage.is_pending === 1)) {
                      //console.log('✅ Header: Chat is pending (is_pending =', latestMessage.is_pending, ')');
                      isPending = true;
                      break;
                    } else {
                      //console.log('❌ Header: Chat is NOT pending (is_pending =', latestMessage?.is_pending, ')');
                    }
                  }
                }
              } catch (err) {
                console.warn(`Failed to check pending status from ${instanceName}:`, err);
              }
            }
            //console.log('🔍 Header: Final isPending state:', isPending);
            setIsChatPending(isPending);

            // Check assigned status from the instance this phone belongs to
            const instanceToUse = instance || 'wa1';
            const assignedResponse = await fetch(`https://waserverlive.genio.id/${instanceToUse}/api/whatsapp/assigned-status/${phone}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            const assignedData = await assignedResponse.json();
            if (assignedData.success) {
              const assignedTo = assignedData.assignedTo || null;
              setAssignedAgentId(assignedTo);
              //console.log('🔄 Header: Loaded assigned status on mount/refresh:', assignedTo);

              // Check if current agent is in the assigned list (comma-separated)
              const currentAgentId = String(user.agent_id || user.id || '');
              const assignedAgents = assignedTo ? assignedTo.split(',').map(a => a.trim()).filter(a => a) : [];
              const assignedToCurrentAgent = assignedAgents.includes(currentAgentId);

              setIsAssignedToMe(assignedToCurrentAgent);
              //console.log('🔄 Header: isAssignedToMe:', assignedToCurrentAgent, '(current agent:', currentAgentId, ', assigned agents:', assignedAgents, ')');
            } else {
              console.warn('⚠️ Header: Failed to load assigned status:', assignedData);
            }
          } catch (error) {
            console.error('Error checking chat status:', error);
            setIsChatClosed(false);
          }
        }
      } else {
        // For regular chats, check status
        setIsChatClosed([9, 10, 11].includes(detailClient.status));
      }
    };

    checkChatStatus();

    // Listen for chat closed event
    const handleChatClosed = (event) => {
      const { phone } = event.detail;
      const currentPhone = (chatId || detailClient.chat_id || '').replace('whatsapp-', '').replace('-WA', '');
      if (phone === currentPhone || currentPhone === phone.replace('@c.us', '')) {
        setIsChatClosed(true);
      }
    };

    // Listen for chat assigned event
    const handleChatAssigned = (event) => {
      const { phone, agentId, assignedTo } = event.detail;
      const currentPhone = (chatId || detailClient.chat_id || '').replace('whatsapp-', '').replace('-WA', '');
      if (phone === currentPhone || currentPhone === phone.replace('@c.us', '')) {
        // assignedTo can be comma-separated, use it if provided (null means unassigned)
        // Filter out undefined and string 'undefined'
        let newAssignedTo = null;
        if (assignedTo !== null && assignedTo !== undefined && assignedTo !== 'undefined' && assignedTo !== 'null') {
          newAssignedTo = assignedTo;
        } else if (agentId !== null && agentId !== undefined && agentId !== 'undefined' && agentId !== 'null') {
          newAssignedTo = String(agentId);
        }
        setAssignedAgentId(newAssignedTo);
        //console.log('🔄 Header: Updated assignedAgentId from event:', newAssignedTo);

        // Check if current agent is in the assigned list
        const currentAgentId = String(user.agent_id || user.id || '');
        const assignedAgents = newAssignedTo ? newAssignedTo.split(',').map(a => a.trim()).filter(a => a && a !== 'undefined' && a !== 'null') : [];
        const assignedToCurrentAgent = assignedAgents.includes(currentAgentId);
        setIsAssignedToMe(assignedToCurrentAgent);
        //console.log('🔄 Header: Updated isAssignedToMe:', assignedToCurrentAgent, '(current agent:', currentAgentId, ', assigned agents:', assignedAgents, ')');
      }
    };

    const handleChatPending = (event) => {
      const { phone } = event.detail;
      const currentPhone = (chatId || detailClient.chat_id || '').replace('whatsapp-', '').replace('-WA', '');
      if (phone === currentPhone || currentPhone === phone.replace('@c.us', '')) {
        setIsChatPending(true);
      }
    };

    window.addEventListener('whatsapp:chatClosed', handleChatClosed);
    window.addEventListener('whatsapp:chatAssigned', handleChatAssigned);
    window.addEventListener('whatsapp:chatPending', handleChatPending);
    window.addEventListener('livechat:chatAssigned', handleChatAssigned);

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
      window.removeEventListener('livechat:chatAssigned', handleChatAssigned);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [chatId, detailClient, isWhatsAppChat, isLiveChat, user.agent_id]);

  return (
    <>
      <div className="p-3 p-lg-4 border-bottom">
        <Row className="align-items-center">
          <Col sm={rightBarMenu ? 3 : 7} xs={7} className="d-none d-md-block d-lg-block">
            <div className="d-flex align-items-center">
              {/* Tombol panah kiri untuk desktop/laptop */}
              <div className="me-2 ms-0">
                <button
                  className="btn-user-chat-remove text-muted font-size-16"
                  onClick={(event) => closeChat(event)}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
              </div>
              <div className="me-3 ms-0">
                <img
                  src={avatar}
                  className="rounded-circle avatar-xs"
                  alt="avatar"
                />
              </div>
              <div className="flex-grow">
                {/* Nama atau InstanceMap di atas untuk WhatsApp chat */}
                {isWhatsAppChat && (
                  <div className="font-size-14 mb-1" style={{ color: '#000', fontWeight: '500' }}>
                    {isLoadingClientName ? 'Client' : (userName || '-')}
                  </div>
                )}
                <div className="d-flex align-items-center gap-2">
                  <h5 className="font-size-14 mb-0 text-truncate flex-grow-1">
                    <Link
                      to="#"
                      className="text-reset user-profile-show"
                      onClick={() => toggleHandlerDetailClientMenu(rightBarMenu)}
                    >
                      {isWhatsAppChat ? (
                        // Untuk WhatsApp: tampilkan nomor telepon di bawah
                        phoneNumber || '-'
                      ) : (
                        // Untuk non-WhatsApp: tampilkan nama seperti biasa
                        isLoadingClientName ? 'Client' : (userName || '-')
                      )}
                    </Link>
                  </h5>
                  {/* Icon copy untuk WhatsApp chat */}
                  {isWhatsAppChat && (
                    <button
                      type="button"
                      className="btn btn-link text-muted p-0"
                      onClick={handleCopyPhone}
                      style={{ fontSize: '14px', padding: '4px', minWidth: 'auto' }}
                      title="Copy nomor telepon"
                    >
                      <i className="ri-file-copy-line"></i>
                    </button>
                  )}
                </div>
                {!isWhatsAppChat && (
                  <small className="text-truncate">
                    {Boolean(detailClient.user_email)
                      ? detailClient.user_email
                      : '-'}
                  </small>
                )}
              </div>
            </div>
          </Col>
          <Col xs={5} sm={rightBarMenu ? 9 : 5} className="d-none d-md-block d-lg-block">
            <div className="d-flex align-items-center justify-content-end flex-wrap" style={{ gap: '8px' }}>
              {(isWhatsAppChat || isLiveChat) && (
                <>
                  {/* Pending Chat, Assign to me and Solve Chat Buttons - Hide for history view */}
                  {!isHistoryView && (
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}>
                      {/* Assign to me button - show if not assigned to anyone (WhatsApp or LiveChat) */}
                      {!assignedAgentId && (
                        <div>
                          <button
                            type="button"
                            id="assignToMe"
                            className="btn"
                            onClick={showConfirmationAssign}
                            disabled={isAssigning || isChatPending}
                            style={{
                              backgroundColor: '#28a745',
                              color: '#fff',
                              border: 'none',
                              padding: '4px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              height: '28px',
                              opacity: (isAssigning || isChatPending) ? 0.6 : 1,
                              cursor: (isAssigning || isChatPending) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isAssigning ? (
                              <>
                                <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }}></span> Assigning...
                              </>
                            ) : (
                              <>
                                <i className="ri-user-add-line" style={{ verticalAlign: 'middle', marginTop: '1px' }}></i> Assign to me
                              </>
                            )}
                          </button>
                          <UncontrolledTooltip target="assignToMe" placement="bottom">
                            Assign Chat to Me (disable AI response)
                          </UncontrolledTooltip>
                        </div>
                      )}

                      {/* Pending Chat button - show if assigned (di kiri Solve Chat) */}
                      {assignedAgentId && isAssignedToMe && parseInt(detailClient.agent_id) === parseInt(user.agent_id) && (
                        <div>
                          {(() => {
                            //console.log('🔍 Header: Rendering Pending Chat button, isChatPending =', isChatPending);
                            return null;
                          })()}
                          {isChatPending ? (
                            <button
                              type="button"
                              id="pendingChat"
                              className="btn"
                              disabled
                              style={{
                                backgroundColor: '#ffc107',
                                color: '#fff',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                height: '28px',
                                opacity: 0.7,
                                cursor: 'not-allowed'
                              }}
                            >
                              Chat sudah pending
                            </button>
                          ) : (
                            <button
                              type="button"
                              id="pendingChat"
                              className="btn"
                              onClick={handlerPendingChat}
                              disabled={isPendinging}
                              style={{
                                backgroundColor: '#ffc107',
                                color: '#000',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                height: '28px',
                                opacity: isPendinging ? 0.6 : 1,
                                cursor: isPendinging ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {isPendinging ? (
                                <>
                                  <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }}></span> Pending...
                                </>
                              ) : (
                                <>
                                  <i className="ri-pause-circle-line" style={{ verticalAlign: 'middle', marginTop: '1px' }}></i> Pending Chat
                                </>
                              )}
                            </button>
                          )}
                          <UncontrolledTooltip target="pendingChat" placement="bottom">
                            {isChatPending ? 'Chat sudah di pending (AI response dan auto-close dinonaktifkan)' : 'Pending Chat (disable AI response and auto-close)'}
                          </UncontrolledTooltip>
                        </div>
                      )}

                      {/* Solve Chat button - only show if assigned to current agent */}
                      {isAssignedToMe && parseInt(detailClient.agent_id) === parseInt(user.agent_id) && (
                        <div>
                          <button
                            type="button"
                            id="solveChat"
                            className="btn"
                            onClick={() => showConfirmationSolveChat(detailClient)}
                            style={{
                              backgroundColor: '#ff8c00',
                              color: '#fff',
                              border: 'none',
                              padding: '4px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              height: '28px'
                            }}
                          >
                            <i className="ri-chat-check-fill" style={{ verticalAlign: 'middle', marginTop: '1px' }}></i> Solve Chat
                          </button>
                          <UncontrolledTooltip target="solveChat" placement="bottom">
                            Solve Chat
                          </UncontrolledTooltip>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{
                    maxWidth: rightBarMenu ? '150px' : '200px',
                    flex: '0 0 auto',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <InputGroup size="sm" style={{ height: '28px' }}>
                      <span className="input-group-text text-muted bg-light" style={{ padding: '4px 6px', height: '28px', display: 'flex', alignItems: 'center' }}>
                        <i className="ri-search-line" style={{ fontSize: '12px' }}></i>
                      </span>
                      <Input
                        type="search"
                        className="form-control bg-light"
                        placeholder={rightBarMenu ? "Search..." : "Search messages..."}
                        value={searchMessageQuery}
                        onChange={handlerSearchMessage}
                        style={{ fontSize: '11px', padding: '4px 6px', height: '28px' }}
                      />
                    </InputGroup>
                  </div>
                </>
              )}
              <ul className="list-inline user-chat-nav text-end mb-0">
                {/* Commented out Detail Client button for WhatsApp chat */}
                {!isWhatsAppChat && (
                  <li className="list-inline-item">
                    <button
                      type="button"
                      id="detailClient"
                      className="btn nav-btn"
                      onClick={() => toggleHandlerDetailClientMenu(rightBarMenu)}
                    >
                      <i className="ri-user-3-fill"></i>
                    </button>
                    <UncontrolledTooltip target="detailClient" placement="bottom">
                      Detail Client
                    </UncontrolledTooltip>
                  </li>
                )}
                <ElMenuDekstop status={detailClient.status} />
              </ul>
            </div>
          </Col>
          <Col sm={10} xs={10} className="d-block d-md-none d-lg-none">
            <div className="d-flex align-items-center">
              <div className="me-2 ms-0">
                <button
                  className="btn-user-chat-remove text-muted font-size-16"
                  onClick={(event) => closeChat(event)}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
              </div>
              <div className="me-3 ms-0">
                <img
                  src={avatar}
                  className="rounded-circle avatar-xs"
                  alt="avatar"
                />
              </div>
              <div className="flex-grow overflow-hidden">
                {/* Nama atau InstanceMap di atas untuk WhatsApp chat */}
                {isWhatsAppChat && (
                  <div className="font-size-14 mb-1" style={{ color: '#000', fontWeight: '500' }}>
                    {isLoadingClientName ? 'Client' : (userName || '-')}
                  </div>
                )}
                <div className="d-flex align-items-center gap-2">
                  <h5 className="font-size-16 mb-0 text-truncate flex-grow-1">
                    <Link to="#" className="text-reset user-profile-show">
                      {isWhatsAppChat ? (
                        // Untuk WhatsApp: tampilkan nomor telepon di bawah
                        phoneNumber || '-'
                      ) : (
                        // Untuk non-WhatsApp: tampilkan nama seperti biasa
                        isLoadingClientName ? 'Client' : (userName || '-')
                      )}
                    </Link>
                  </h5>
                  {/* Icon copy untuk WhatsApp chat */}
                  {isWhatsAppChat && (
                    <button
                      type="button"
                      className="btn btn-link text-muted p-0"
                      onClick={handleCopyPhone}
                      style={{ fontSize: '14px', padding: '4px', minWidth: 'auto' }}
                      title="Copy nomor telepon"
                    >
                      <i className="ri-file-copy-line"></i>
                    </button>
                  )}
                </div>
                {!isWhatsAppChat && (
                  <small className="text-truncate">
                    {Boolean(detailClient.user_email)
                      ? detailClient.user_email
                      : '-'}
                  </small>
                )}
              </div>
              {/* Icon untuk toggle detail client di mobile - hanya untuk non-WhatsApp chat */}
              {!isWhatsAppChat && (
                <div className="ms-2">
                  <button
                    type="button"
                    id="detailClientMobile"
                    className="btn nav-btn"
                    onClick={() => toggleHandlerDetailClientMenu(rightBarMenu)}
                  >
                    <i className="ri-user-3-fill"></i>
                  </button>
                  <UncontrolledTooltip target="detailClientMobile" placement="bottom">
                    Detail Client
                  </UncontrolledTooltip>
                </div>
              )}
            </div>
          </Col>
          <Col sm={2} xs={2} className="d-block d-md-none d-lg-none">
            <div className="d-flex align-items-center justify-content-end">
              {/* Untuk WhatsApp chat di mobile: search icon dan dropdown */}
              {isWhatsAppChat ? (
                <>
                  {/* Search icon button - di paling kanan sebelum dropdown */}
                  <button
                    type="button"
                    className="btn btn-link text-muted"
                    onClick={() => setShowSearchInput(!showSearchInput)}
                    style={{
                      padding: '8px',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '4px'
                    }}
                  >
                    <i className="ri-search-line"></i>
                  </button>
                  <Dropdown
                    isOpen={dropdownMenuHeader}
                    toggle={toggleHandlerHeaderMenu}
                  >
                    <DropdownToggle tag="a" className="ms-2">
                      <i className="fas fa-ellipsis-v"></i>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      {/* Detail Client sebagai item dropdown */}
                      <DropdownItem onClick={() => toggleHandlerDetailClientMenu(rightBarMenu)}>
                        Detail Client <i className="ri-user-3-line float-end text-muted"></i>
                      </DropdownItem>
                      {/* Garis pembatas */}
                      <DropdownItem divider />
                      {/* Assign to me button - hanya muncul jika belum di-assign dan bukan history view (WhatsApp or LiveChat) */}
                      {!isHistoryView && !assignedAgentId && (isWhatsAppChat || isLiveChat) && (
                        <DropdownItem
                          onClick={showConfirmationAssign}
                          disabled={isAssigning}
                          style={{
                            opacity: isAssigning ? 0.6 : 1,
                            cursor: isAssigning ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isAssigning ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" style={{ width: '10px', height: '10px' }}></span> Assigning...
                            </>
                          ) : (
                            <>
                              Assign to me <i className="ri-user-add-line float-end text-muted"></i>
                            </>
                          )}
                        </DropdownItem>
                      )}
                      {/* Solve Chat button - hanya muncul jika assigned to me dan bukan history view */}
                      {!isHistoryView && isAssignedToMe && parseInt(detailClient.agent_id) === parseInt(user.agent_id) && (
                        <DropdownItem onClick={() => showConfirmationSolveChat(detailClient)}>
                          Solve Chat <i className="ri-chat-check-line float-end text-muted"></i>
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </>
              ) : (
                <>
                  {/* Untuk non-WhatsApp chat: close button dan dropdown */}
                  <button
                    className="btn-user-chat-remove text-muted font-size-16 me-2"
                    onClick={(event) => closeChat(event)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <Dropdown
                    isOpen={dropdownMenuHeader}
                    toggle={toggleHandlerHeaderMenu}
                  >
                    <DropdownToggle tag="a" className="ms-3">
                      <i className="fas fa-ellipsis-v"></i>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem onClick={() => toggleHandlerDetailClientMenu(rightBarMenu)}>
                        Info <i className="ri-user-3-line float-end text-muted"></i>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>
      <ModalSm
        isOpen={isConfirmSolve}
        handlerFunc={toggleConfirmationModal}
        unmountOnClose={true}
        keyboard={true}
        centered={true}
        backdrop={true}
        headerModal={false}
      >
        <div className="mb-3">
          <h5>Solve Chat?</h5>
          <small>
            This message is from client{' '}
            <b>
              <i>{dataSolve.user_name}</i>
            </b>
            , if confirmed it will move to chat history.
          </small>
        </div>
        <div className="text-end mt-2">
          <Button
            color="secondary"
            size="sm"
            className="mx-2"
            outlineS
            onClick={() => toggleConfirmationModal()}
          >
            Cancel
          </Button>
          <Button
            color="tangerin"
            size="sm"
            outline
            onClick={() => handlerSolveChat()}
          >
            Solve
          </Button>
        </div>
      </ModalSm>
      {/* Modal konfirmasi Assign to me */}
      <ModalSm
        isOpen={isConfirmAssign}
        handlerFunc={toggleConfirmationAssignModal}
        unmountOnClose={true}
        keyboard={true}
        centered={true}
        backdrop={true}
        headerModal={false}
      >
        <div className="mb-3">
          <h5>Assign Chat to Me?</h5>
          <small>
            Apakah Anda yakin ingin meng-assign chat ini ke Anda? AI response akan dinonaktifkan setelah chat di-assign.
          </small>
        </div>
        <div className="text-end mt-2">
          <Button
            color="secondary"
            size="sm"
            className="mx-2"
            onClick={toggleConfirmationAssignModal}
          >
            Cancel
          </Button>
          <Button
            color="success"
            size="sm"
            onClick={handlerAssignToMe}
            disabled={isAssigning}
          >
            {isAssigning ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" style={{ width: '10px', height: '10px' }}></span>
                Assigning...
              </>
            ) : (
              'Assign'
            )}
          </Button>
        </div>
      </ModalSm>
      <ModalMd
        isOpen={transferChatModal}
        handlerFunc={toggleTransferChatModal}
        title="Transfer Chat"
        headerModal={true}
        unmountOnClose={true}
        keyboard={true}
        centered={true}
        backdrop="static"
      >
        <Category
          activeTab={transferTabActive}
          handlerClick={toggleHandlerTabActiveTransfer}
        />
        <Content
          sessionUser={user}
          activeTab={transferTabActive}
          dataAgent={agent_online}
          dataDepartment={department_online}
          chatIdActive={chatId}
        />
      </ModalMd>
      <ModalMd
        isOpen={isModalSendChat}
        handlerFunc={toggleHandlerModalHistoryChat}
        title="Send History Chat"
        headerModal={true}
        unmountOnClose={true}
        keyboard={true}
        centered={true}
        backdrop="static"
      >
        <Form as="div">
          <Form.Group className="mb-3" controlId="ChatIDForm">
            <Form.Label>Chat ID</Form.Label>
            <p>{detailClient.chat_id}</p>
          </Form.Group>

          <Form.Group className="mb-3" controlId="EmailForm">
            <Form.Label>
              Email Client <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              onChange={handlerChangeEmailClient}
              type="email"
              value={emailClient}
              placeholder="Type email client"
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-tangerin"
              onClick={handlerSendHistory}
              disabled={loaderSendHistoryChat ? true : false}
            >
              {loaderSendHistoryChat ? 'Loading...' : 'Send'}
            </button>
          </div>
        </Form>
      </ModalMd>
      {/* Search Modal untuk Mobile - hanya muncul di mobile view */}
      {isWhatsAppChat && isMobileView && (
        <>
          <ModalSm
            isOpen={showSearchInput}
            handlerFunc={() => setShowSearchInput(false)}
            unmountOnClose={true}
            keyboard={true}
            centered={false}
            backdrop={true}
            headerModal={false}
          >
            <div className="mb-3">
              <InputGroup size="md">
                <span className="input-group-text text-muted bg-light">
                  <i className="ri-search-line"></i>
                </span>
                <Input
                  type="search"
                  className="form-control"
                  placeholder="Search messages..."
                  value={searchMessageQuery}
                  onChange={handlerSearchMessage}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearchInput(false);
                    }
                  }}
                />
              </InputGroup>
            </div>
            <div className="text-end">
              <Button
                size="sm"
                onClick={() => setShowSearchInput(false)}
                style={{
                  backgroundColor: '#ff8c00',
                  borderColor: '#ff8c00',
                  color: '#fff'
                }}
              >
                Close
              </Button>
            </div>
          </ModalSm>
          <style>
            {`
              @media (max-width: 767px) {
                .modal.show .modal-dialog {
                  margin-top: 20px !important;
                  margin-bottom: auto !important;
                  margin-left: auto !important;
                  margin-right: auto !important;
                }
              }
            `}
          </style>
        </>
      )}
    </>
  );
}

export default Header;
