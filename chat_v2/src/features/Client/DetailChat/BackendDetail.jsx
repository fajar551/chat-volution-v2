import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import backendIntegration from '../../../backend-integration';
import { detailChatClientSelector } from './DetailChatClientSlice';

function BackendDetail() {
  const { chatId } = useSelector(detailChatClientSelector);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatIdValue, setChatIdValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [activeTab] = useState('chat');
  const [chatInfo, setChatInfo] = useState(null);

  useEffect(() => {
    if (chatId && chatId.startsWith('backend-')) {
      const extractedChatId = chatId.replace('backend-', '');
      setChatIdValue(extractedChatId);

      if (backendIntegration.isConnectedToBackend()) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }

      loadBackendChat(extractedChatId);
    }
  }, [chatId]);

  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleSocketConnected = () => {
      setIsSocketConnected(true);
    };

    const handleSocketDisconnected = () => {
      setIsSocketConnected(false);
    };

    const handleNewMessage = (data) => {
      if (chatIdValue && data.chatId === chatIdValue) {
        const messageKey = `${data.message}_${data.timestamp}_${data.from}`;
        if (window.__processedMessages && window.__processedMessages.has(messageKey)) {
          return;
        }

        if (!window.__processedMessages) {
          window.__processedMessages = new Set();
        }
        window.__processedMessages.add(messageKey);

        if (window.__processedMessages.size > 100) {
          const messagesArray = Array.from(window.__processedMessages);
          window.__processedMessages = new Set(messagesArray.slice(-50));
        }

        const newMessage = {
          id: Date.now(),
          body: data.message,
          from: data.from === 'client' ? 'customer' : 'agent',
          receivedAt: data.timestamp || new Date().toISOString(),
          type: data.from === 'client' ? 'received' : 'sent',
          is_sender: data.from === 'client'
        };

        setMessages(prev => [...prev, newMessage]);
      }
    };

    const handleAgentMessage = (data) => {
      if (chatIdValue && data.chatId === chatIdValue) {
        const agentMessage = {
          id: Date.now(),
          body: data.message,
          from: 'agent',
          receivedAt: data.timestamp || new Date().toISOString(),
          type: 'sent'
        };
        setMessages(prev => [...prev, agentMessage]);
      }
    };

    const handleError = (error) => {
      console.error('Backend V2 error in detail:', error);
      setIsLoading(false);
    };

    backendIntegration.on('connected', handleConnected);
    backendIntegration.on('socketConnected', handleSocketConnected);
    backendIntegration.on('socketDisconnected', handleSocketDisconnected);
    backendIntegration.on('newMessage', handleNewMessage);
    backendIntegration.on('agentMessage', handleAgentMessage);
    backendIntegration.on('error', handleError);

    return () => {
      backendIntegration.off('connected', handleConnected);
      backendIntegration.off('socketConnected', handleSocketConnected);
      backendIntegration.off('socketDisconnected', handleSocketDisconnected);
      backendIntegration.off('newMessage', handleNewMessage);
      backendIntegration.off('agentMessage', handleAgentMessage);
      backendIntegration.off('error', handleError);
    };
  }, [chatIdValue]);

  const loadBackendChat = async (chatId) => {
    try {
      setIsLoading(true);

      const chats = backendIntegration.getChats();
      const chat = chats.find(c => c.chat_id === `backend-${chatId}`);

      if (chat) {
        setChatInfo(chat);
      }

      const loadedMessages = await backendIntegration.loadMessages(chatId);
      setMessages(loadedMessages);
      setIsLoading(false);

      setIsConnected(backendIntegration.isConnectedToBackend());
      setIsSocketConnected(backendIntegration.isSocketConnectedToBackend());

      if (chat) {
        setChatInfo(chat);
      }

    } catch (error) {
      console.error('Error loading Backend V2 chat:', error);
      setMessages([]);
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText) => {
    if (!chatIdValue || !messageText.trim()) return;

    try {
      const success = backendIntegration.sendMessageToClient(chatIdValue, messageText, 'agent');

      if (success) {
        const sentMessage = {
          id: Date.now(),
          body: messageText,
          from: 'agent',
          receivedAt: new Date().toISOString(),
          type: 'sent'
        };

        setMessages(prev => [...prev, sentMessage]);
      }

    } catch (error) {
      console.error('Error sending Backend V2 message:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading Backend V2 chat...</p>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="chat-header">
        <div className="d-flex align-items-center p-3 border-bottom">
          <div className="flex-grow-1">
            <h5 className="mb-1">
              {chatInfo?.user_name || chatInfo?.client_name || 'Unknown User'}
            </h5>
            <p className="mb-0 text-muted small">
              {chatInfo?.email || 'No email'}
            </p>
          </div>
          <div className="d-flex align-items-center">
            <div
              className={`badge ${isConnected ? 'bg-success' : 'bg-danger'} me-2`}
              style={{ fontSize: '10px' }}
            >
              {isConnected ? 'API Connected' : 'API Disconnected'}
            </div>
            <div
              className={`badge ${isSocketConnected ? 'bg-success' : 'bg-warning'} me-2`}
              style={{ fontSize: '10px' }}
            >
              {isSocketConnected ? 'Socket Connected' : 'Socket Disconnected'}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-body">
        <TabContent activeTab={activeTab}>
          <TabPane tabId="chat">
            <div className="chat-messages" style={{ height: '400px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center">
                    <i className="fas fa-comments text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-2 text-muted">No messages found</p>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  {messages.map((message, index) => (
                    <div key={index} className={`mb-3 ${message.from === 'agent' ? 'text-end' : 'text-start'}`}>
                      <div className={`d-inline-block p-2 rounded ${message.from === 'agent'
                        ? 'bg-primary text-white'
                        : message.type === 'error'
                          ? 'bg-danger text-white'
                          : 'bg-light text-dark'
                        }`} style={{ maxWidth: '70%' }}>
                        <p className="mb-1">{message.body}</p>
                        <small className={`${message.from === 'agent' ? 'text-white-50' : message.type === 'error' ? 'text-white-50' : 'text-muted'}`}>
                          {formatTime(message.receivedAt)}
                          {message.from !== 'agent' && message.type !== 'error' && (
                            <span className="ms-2 badge bg-secondary">From: {message.from}</span>
                          )}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="chat-input">
              <div className="p-3 p-lg-4 border-top mb-0">
                <Row className="g-0">
                  <Col>
                    <div className="form-control form-control-lg bg-light border-light"
                      contentEditable="true"
                      id="backend-input-message"
                      placeholder="Type message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          const message = e.target.textContent || e.target.innerText;
                          if (message.trim() && isSocketConnected) {
                            sendMessage(message.trim());
                            e.target.textContent = '';
                            e.target.innerText = '';
                          }
                        }
                      }}
                      style={{
                        minHeight: '40px',
                        padding: '8px 12px',
                        opacity: isSocketConnected ? 1 : 0.5,
                        cursor: isSocketConnected ? 'text' : 'not-allowed'
                      }}
                    />
                  </Col>
                  <Col className="d-none d-md-block d-lg-block" xs="auto">
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-link text-muted"
                        type="button"
                        title="Emoji"
                        disabled={!isSocketConnected}
                      >
                        <i className="far fa-smile"></i>
                      </button>
                      <button
                        className="btn btn-link text-muted"
                        type="button"
                        title="Attach File"
                        disabled={!isSocketConnected}
                      >
                        <i className="fas fa-paperclip"></i>
                      </button>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={(e) => {
                          const input = document.getElementById('backend-input-message');
                          const message = input.textContent || input.innerText;
                          if (message.trim() && isSocketConnected) {
                            sendMessage(message.trim());
                            input.textContent = '';
                            input.innerText = '';
                          }
                        }}
                        disabled={!isSocketConnected}
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </Col>
                </Row>
                {!isSocketConnected && (
                  <small className="text-warning">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    WebSocket disconnected - Cannot send messages
                  </small>
                )}
                {!isConnected && (
                  <small className="text-danger">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    API disconnected - Cannot load messages
                  </small>
                )}
              </div>
            </div>
          </TabPane>
        </TabContent>
      </div>
    </Fragment>
  );
}

export default BackendDetail;
