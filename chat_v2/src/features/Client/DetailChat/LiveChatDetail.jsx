import classNames from 'classnames';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import { authSelector } from '../../../app/Auth/AuthSlice';
import BubbleChatClient from '../../../Common/Components/BubbleChat/BubbleChatClient';
import { resetAllStateInputChat } from '../../../Common/Components/InputChat/InputChatSlice';
import ProfileClientChat from '../../../Common/Components/UserProfileSidebar/ProfileClientChat';
import { capitalizeFirstMultiParagraph } from '../../../Common/utils/helpers';
// import openaiService from '../../../services/openai-service';
// import { getLastReplied, setLastReplied } from '../../../services/livechat-ai-reply-service';
import { closeChat, detailChatClientSelector, updateStatusRightBar } from './DetailChatClientSlice';
import Header from './Header';

function LiveChatDetail() {
  const dispatch = useDispatch();
  const { chatId, rightBarMenu } = useSelector(detailChatClientSelector);
  const { user } = useSelector(authSelector);
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchMessageQuery, setSearchMessageQuery] = useState('');
  const [firstIncomingName, setFirstIncomingName] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastRepliedIncomingIdByChatRef = useRef({});
  const processingAiReplyRef = useRef(false);
  const initialScrollDoneRef = useRef(false);
  const scrollAfterSendRef = useRef(false);

  const getChatSessionId = useCallback(() => {
    if (!chatId) return null;
    if (chatId.startsWith('livechat-')) {
      return chatId.replace(/^livechat-/, '').replace(/-LIVE$/, '');
    }
    return chatId;
  }, [chatId]);

  const fetchMessages = useCallback(async (silent = false) => {
    const chatSessionId = getChatSessionId();
    if (!chatSessionId) {
      console.log('❌ LiveChatDetail: No chatSessionId found');
      setIsLoading(false);
      return;
    }

    if (!silent) {
      console.log('🔄 LiveChatDetail: Fetching messages for chatSessionId:', chatSessionId);
      setIsLoading(true);
    }
    try {
      const response = await fetch(
        `https://cvbev2.genio.id/api/messages?chat_session_id=${encodeURIComponent(chatSessionId)}&limit=100&offset=0`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

        console.log('📡 LiveChatDetail: API Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ LiveChatDetail: Received data:', data);
        if (data.messages && Array.isArray(data.messages)) {
          console.log('📨 LiveChatDetail: Found', data.messages.length, 'messages');

          // Saat chat dibuka → tandai pesan masuk yang belum dibaca jadi is_read = 1
          const unreadIncomingIds = data.messages
            .filter((m) => {
              const isIncoming = m.direction === 'INCOMING' || m.direction === 'incoming';
              const unread = m.is_read === false || m.is_read === 0;
              return isIncoming && unread && m.id != null;
            })
            .map((m) => m.id);
          if (unreadIncomingIds.length > 0) {
            fetch('https://cvbev2.genio.id/api/messages/mark-read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message_ids: unreadIncomingIds }),
            }).catch((err) => console.warn('LiveChatDetail: mark-read failed', err?.message));
          }

          const transformedMessages = data.messages.map((msg) => {
            const receivedAt = msg.received_at || msg.createdAt || new Date().toISOString();
            const isIncoming = msg.direction === 'INCOMING';
            const isOutgoing = msg.direction === 'OUTGOING';
            const hasAgentId = msg.agent_id !== null && msg.agent_id !== undefined;
            const isFromClient = isIncoming || (!hasAgentId);
            const isFromAgent = isOutgoing || (hasAgentId && !isIncoming);

            let file_url = null;
            let file_name = msg.file_name || msg.filename || null;
            let file_type = msg.message_type === 'image' || msg.message_type === 'IMAGE' ? 'image' : (msg.file_type || null);
            let file_id = msg.id != null ? String(msg.id).replace(/[^a-zA-Z0-9_-]/g, '_') : null;

            const hasMedia = msg.media_data || msg.message_type === 'image' || msg.message_type === 'IMAGE' || msg.message_type === 'media';
            if (hasMedia && (msg.media_data || msg.mediaData)) {
              let mediaDataObj = null;
              const raw = msg.media_data || msg.mediaData;
              try {
                if (typeof raw === 'string') {
                  const trimmed = raw.trim();
                  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    mediaDataObj = JSON.parse(raw);
                  } else {
                    mediaDataObj = { url: raw, data: raw };
                  }
                } else if (typeof raw === 'object') {
                  mediaDataObj = raw;
                }
              } catch (e) {
                mediaDataObj = { url: raw, data: raw };
              }
              if (mediaDataObj) {
                const mimeType = mediaDataObj.mimetype || mediaDataObj.mimeType || (msg.message_type === 'image' ? 'image/jpeg' : '');
                if (mediaDataObj.fileUrl) {
                  file_url = mediaDataObj.fileUrl;
                } else if (mediaDataObj.data) {
                  file_url = `data:${mimeType || 'image/jpeg'};base64,${mediaDataObj.data}`;
                } else if (mediaDataObj.url) {
                  file_url = mediaDataObj.url;
                }
                if (!file_name) file_name = mediaDataObj.fileName || mediaDataObj.filename || `media_${msg.id}`;
                if (!file_type) file_type = mediaDataObj.fileType || (mimeType && mimeType.startsWith('image/') ? 'image' : null) || (msg.message_type === 'image' ? 'image' : null);
                if (mediaDataObj.fileId != null) file_id = String(mediaDataObj.fileId).replace(/[^a-zA-Z0-9_-]/g, '_');
              }
            }

            return {
              id: msg.id,
              message_id: msg.message_id,
              message: msg.body || msg.message || '',
              body: msg.body || msg.message || '',
              timestamp: msg.timestamp || new Date(receivedAt).getTime(),
              direction: msg.direction === 'INCOMING' ? 'incoming' : 'outgoing',
              message_type: msg.message_type || 'TEXT',
              from_number: msg.from_number,
              to_number: msg.to_number,
              name: msg.name,
              agent_id: msg.agent_id,
              status: msg.status,
              is_read: msg.is_read,
              received_at: receivedAt,
              formatted_date: receivedAt,
              chat_status: msg.chat_status,
              assigned_to: msg.assigned_to,
              agent_name: isFromAgent ? (msg.name || 'Agent') : undefined,
              user_name: isFromClient ? (msg.name || msg.from_number || 'Client') : undefined,
              avatar: undefined,
              media_data: msg.media_data,
              file_url: file_url || undefined,
              file_name: file_name || undefined,
              file_type: file_type || undefined,
              file_id: file_id || undefined,
            };
          });

          const firstIncomingMessage = transformedMessages.find(msg => {
            const isIncoming = msg.direction === 'incoming';
            const hasNoAgentId = msg.agent_id === null || msg.agent_id === undefined;
            return isIncoming || hasNoAgentId;
          });
          
          if (firstIncomingMessage) {
            const clientName = firstIncomingMessage.name || firstIncomingMessage.user_name || firstIncomingMessage.from_number;
            if (clientName) {
              setFirstIncomingName(capitalizeFirstMultiParagraph(clientName));
            }
          }

          setMessages(transformedMessages);

          if (transformedMessages.length > 0) {
            const firstMsg = transformedMessages[0];
            setChatInfo({
              chat_session_id: chatSessionId,
              from_number: firstMsg.from_number,
              to_number: firstMsg.to_number,
              name: firstMsg.name || firstMsg.from_number || 'Client',
              chat_status: firstMsg.chat_status || 1,
              assigned_to: firstMsg.assigned_to,
            });
          }
        } else {
          setMessages([]);
        }
      } else {
        if (!silent) console.error('Error fetching messages:', response.statusText);
        setMessages([]);
      }
    } catch (error) {
      if (!silent) console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [getChatSessionId]);

  const sendMessage = useCallback(async (messageText, options = {}) => {
    const chatSessionId = getChatSessionId();
    if (!chatSessionId || !messageText.trim()) return;

    const senderName = options.name != null ? options.name : (user?.name_agent || user?.name || 'Agent');

    try {
      const response = await fetch(`https://cvbev2.genio.id/api-socket/chats/${encodeURIComponent(chatSessionId)}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText.trim(),
          body: messageText.trim(),
          message_type: 'TEXT',
          agent_id: user?.agent_id || user?.id,
          name: senderName,
          from: 'agent',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          scrollAfterSendRef.current = true;
          await fetchMessages();
        }
      } else {
        console.error('Error sending message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [getChatSessionId, user, fetchMessages]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (chatId && chatId.startsWith('livechat-')) {
      const isDesktop = window.innerWidth > 768;
      if (isDesktop && !rightBarMenu) {
        dispatch(updateStatusRightBar(true));
      }
    }
  }, [chatId, rightBarMenu, dispatch]);

  useEffect(() => {
    setFirstIncomingName(null);
    initialScrollDoneRef.current = false;
  }, [chatId]);

  useEffect(() => {
    console.log('🔍 LiveChatDetail: useEffect triggered, chatId:', chatId);
    if (chatId) {
      fetchMessages();
    } else {
      console.log('⚠️ LiveChatDetail: No chatId provided');
    }
  }, [chatId, fetchMessages]);

  // Polling: agar pesan baru (dari client atau AI) otomatis muncul tanpa reload
  useEffect(() => {
    const chatSessionId = getChatSessionId();
    if (!chatSessionId || isLoading) return;

    const intervalMs = 3000;
    const poll = () => fetchMessages(true);
    const intervalId = setInterval(poll, intervalMs);
    return () => clearInterval(intervalId);
  }, [getChatSessionId, isLoading, fetchMessages]);

  // Auto-reply dengan AI ketika pesan terakhir dari client (incoming) dan belum dibalas — DINONAKTIFKAN di admin
  // useEffect(() => {
  //   const chatSessionId = getChatSessionId();
  //   if (!chatSessionId || !messages.length || isLoading || processingAiReplyRef.current) return;

  //   const lastMsg = messages[messages.length - 1];
  //   const isLastIncoming =
  //     lastMsg.direction === 'incoming' || lastMsg.direction === 'INCOMING' ||
  //     (lastMsg.agent_id == null);
  //   if (!isLastIncoming) return;

  //   const lastRepliedId =
  //     lastRepliedIncomingIdByChatRef.current[chatSessionId] ?? getLastReplied(chatSessionId);
  //   if (lastMsg.id && lastRepliedId === lastMsg.id) return;

  //   const text = (lastMsg.body || lastMsg.message || '').trim();
  //   if (!text) return;

  //   processingAiReplyRef.current = true;
  //   openaiService
  //     .generateResponse(chatSessionId, text)
  //     .then((result) => {
  //       if (result?.response) {
  //         lastRepliedIncomingIdByChatRef.current[chatSessionId] = lastMsg.id;
  //         setLastReplied(chatSessionId, lastMsg.id);
  //         sendMessage(result.response, { name: 'AI' });
  //       }
  //     })
  //     .catch((err) => {
  //       console.error('LiveChatDetail: AI reply error', err);
  //     })
  //     .finally(() => {
  //       processingAiReplyRef.current = false;
  //     });
  // }, [messages, isLoading, getChatSessionId, sendMessage]);

  // Scroll ke bawah hanya saat: load awal (pertama kali ada pesan) atau baru saja kirim pesan.
  // Polling yang hanya refresh daftar pesan tidak memaksa scroll, sehingga user bisa baca history.
  useEffect(() => {
    if (messages.length === 0) return;
    const shouldScroll =
      scrollAfterSendRef.current ||
      !initialScrollDoneRef.current;
    if (shouldScroll) {
      setTimeout(scrollToBottom, 100);
      scrollAfterSendRef.current = false;
      initialScrollDoneRef.current = true;
    }
  }, [messages, scrollToBottom]);

  const filteredMessages = messages.filter((msg) => {
    if (!searchMessageQuery.trim()) return true;
    const query = searchMessageQuery.toLowerCase();
    return msg.body?.toLowerCase().includes(query);
  });

  const getTextFromContentEditable = (element) => {
    if (!element) return '';
    return element.textContent || element.innerText || '';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const input = document.getElementById('livechat-input-message');
      const message = getTextFromContentEditable(input);
      if (message.trim()) {
        sendMessage(message);
        if (input) {
          input.textContent = '';
          input.innerHTML = '';
        }
      }
    }
  };

  useEffect(() => {
    console.log('🔍 LiveChatDetail render state:', {
      chatId,
      isLoading,
      messagesCount: messages.length,
      chatInfo,
    });
  }, [chatId, isLoading, messages.length, chatInfo]);

  return (
    <Fragment>
      <div className="d-flex detail-chat livechat-detail-container">
        <div
          className={classNames({
            'w-100': true,
            'content-chat-limited-size': Boolean(rightBarMenu),
          })}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          <div className="user-chat user-chat-show" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Header
              chatId={chatId}
              detailClient={{
                chat_id: chatId,
                chat_session_id: getChatSessionId(),
                user_name: chatInfo?.name || chatInfo?.from_number || 'Client',
                user_email: '-',
                status: chatInfo?.chat_status || 1,
                agent_id: user?.agent_id || user?.id || 0,
                assigned_to: chatInfo?.assigned_to,
              }}
              closeChat={() => dispatch(closeChat())}
              onSearchMessage={() => {}}
            />

        <div
          className={classNames("chat-conversation p-3 px-lg-4", {
            'content-chat-limited-size': Boolean(rightBarMenu)
          })}
          id="chat-conversation"
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 0',
            minHeight: 0,
          }}
        >
          <div
            ref={messagesContainerRef}
            className="chat-conversation-box"
            style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <SimpleBar style={{ flex: 1, minHeight: 0, height: '100%' }}>
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '120px' }}>
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2 small text-muted">Memuat pesan...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                  <div className="text-center text-muted">
                    <p>No messages found</p>
                  </div>
                </div>
              ) : (
                <ul className="list-unstyled mb-0">
                  {filteredMessages.map((message, index) => {
                    const isIncoming = message.direction === 'incoming' || message.direction === 'INCOMING';
                    const isOutgoing = message.direction === 'outgoing' || message.direction === 'OUTGOING';
                    const hasAgentId = message.agent_id !== null && message.agent_id !== undefined;
                    const isFromClient = isIncoming || (!hasAgentId);
                    const isFromAgent = isOutgoing || (hasAgentId && !isIncoming);
                    
                    const bubbleData = {
                      ...message,
                    };
                    
                    if (isFromClient) {
                      delete bubbleData.agent_name;
                      if (firstIncomingName) {
                        bubbleData.user_name = firstIncomingName;
                      } else {
                        const userName = message.name || message.user_name || message.from_number || 'Client';
                        bubbleData.user_name = capitalizeFirstMultiParagraph(userName);
                      }
                    } else if (isFromAgent) {
                      bubbleData.agent_name = message.name || message.agent_name || user?.name_agent || user?.name || 'Agent';
                      delete bubbleData.user_name;
                    }

                    return (
                      <BubbleChatClient
                        key={message.id || index}
                        data={bubbleData}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </ul>
              )}
            </SimpleBar>
          </div>

          <div className="chat-input-section p-3 px-lg-4 border-top" style={{ flexShrink: 0 }}>
            <Row className="g-2">
              <Col>
                <div className="form-control bg-light border-light"
                  contentEditable="true"
                  id="livechat-input-message"
                  style={{ minHeight: '32px', padding: '6px 12px' }}
                  placeholder="Type message..."
                  onKeyPress={handleKeyPress}
                />
              </Col>
              <Col className="d-none d-md-block d-lg-block" xs="auto">
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-tangerin"
                    type="button"
                    onClick={(e) => {
                      const input = document.getElementById('livechat-input-message');
                      const message = getTextFromContentEditable(input);
                      if (message.trim()) {
                        sendMessage(message);
                        if (input) {
                          input.textContent = '';
                          input.innerHTML = '';
                        }
                      }
                    }}
                    style={{ backgroundColor: '#ff8c00', borderColor: '#ff8c00' }}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </Col>
            </Row>
          </div>
        </div>
          </div>
        </div>
        {rightBarMenu && chatInfo && (
          <ProfileClientChat
            detailClient={{
              chat_id: chatId,
              chat_session_id: getChatSessionId(),
              user_name: chatInfo.name || chatInfo.from_number || 'Client',
              user_email: '-',
              status: chatInfo.chat_status || 1,
              agent_id: user?.agent_id || user?.id || 0,
              assigned_to: chatInfo.assigned_to,
            }}
            rightBarMenu={rightBarMenu}
            updateStatusRightBar={updateStatusRightBar}
          />
        )}
      </div>
    </Fragment>
  );
}

export default LiveChatDetail;
