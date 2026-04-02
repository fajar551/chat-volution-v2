import { Fragment, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, InputGroup, TabPane } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import { authSelector } from '../../../../../app/Auth/AuthSlice';
import ClientListChat from '../../../../../Common/Components/ListChat/ClientListChat';
import Skeletons from '../../../../../Common/Components/Skeletons';

function LiveChat(props) {
  const { chatIdActive } = props;
  const { SkeletonListChat } = Skeletons;
  const { user } = useSelector(authSelector);
  const [liveChats, setLiveChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssigned, setShowAssigned] = useState(true);
  const [showUnassigned, setShowUnassigned] = useState(true);
  const [showAssignToMe, setShowAssignToMe] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to fetch first message to get name
  const fetchFirstMessage = async (chatSessionId) => {
    try {
      const response = await fetch(
        `https://cvbev2.genio.id/api/messages?chat_session_id=${encodeURIComponent(chatSessionId)}&limit=1&offset=0`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          // Ambil name dari pesan pertama
          return data.messages[0].name || null;
        }
      }
    } catch (error) {
      console.error('Error fetching first message:', error);
    }
    return null;
  };

  // Function to load Live Chat data from backend (silent = true: refresh tanpa loading spinner)
  const loadLiveChats = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch('https://cvbev2.genio.id/api-socket/chats?status=open', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.chats) {
          // Fetch name dari pesan pertama untuk setiap chat
          const chatsWithNames = await Promise.all(
            data.data.chats.map(async (chat) => {
              const chatSessionId = chat.chat_session_id || chat.id;
              const firstName = await fetchFirstMessage(chatSessionId);
              return {
                ...chat,
                name: firstName || chat.name || chat.client_name || null,
              };
            })
          );
          setLiveChats(chatsWithNames);
        } else {
          setLiveChats([]);
        }
      } else {
        if (!silent) console.error('Error loading live chats:', response.statusText);
        setLiveChats([]);
      }
    } catch (error) {
      if (!silent) console.error('Error loading live chats:', error);
      setLiveChats([]);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveChats();
  }, [loadLiveChats]);

  // Polling: agar Assign To Me / Unassigned / Assigned ter-update real-time tanpa reload
  useEffect(() => {
    if (isLoading) return;
    const intervalMs = 3000;
    const intervalId = setInterval(() => loadLiveChats(true), intervalMs);
    return () => clearInterval(intervalId);
  }, [isLoading, loadLiveChats]);

  const handleChatClick = (chatSessionId) => {
    console.log('Live chat clicked:', chatSessionId);
    // Handle live chat click if needed
  };

  const Items = (params) => {
    const { isLoader, data } = params;

    if (isLoader) {
      return <SkeletonListChat />;
    }

    if (data.length < 1) {
      return (
        <li id="conversation-chat-empty" className="active">
          <div className="d-flex justify-content-center p-5">
            <h5 className="mb-2 font-size-14">
              No Live Chat found
            </h5>
          </div>
        </li>
      );
    }

    return data.map((chat, index) => {
      let isActive = '';
      if (chatIdActive === `livechat-${chat.chat_session_id || chat.id}`) {
        isActive = 'active';
      }

      // Format date
      let formattedDateValue = chat.created_at || chat.updated_at || new Date().toISOString();
      try {
        if (formattedDateValue) {
          if (typeof formattedDateValue === 'string') {
            const dateObj = new Date(formattedDateValue);
            if (!isNaN(dateObj.getTime())) {
              formattedDateValue = dateObj.toISOString();
            } else {
              formattedDateValue = new Date().toISOString();
            }
          } else if (formattedDateValue instanceof Date) {
            formattedDateValue = formattedDateValue.toISOString();
          } else {
            formattedDateValue = new Date().toISOString();
          }
        } else {
          formattedDateValue = new Date().toISOString();
        }
      } catch (error) {
        console.warn('Error formatting date in Live Chat:', error);
        formattedDateValue = new Date().toISOString();
      }

      const bodyText = (chat.body || chat.message || '').trim();
      const isFileMessage = (chat.message_type === 'image' || chat.message_type === 'document' || chat.media_data) && !bodyText;
      const lastMessageLabel = isFileMessage ? 'Mengirimkan file' : (bodyText || 'No message');

      const transformedData = {
        chat_id: `livechat-${chat.chat_session_id || chat.id}`,
        name: chat.name || chat.client_name || null, // Tambahkan field name untuk LiveChat
        user_name: chat.from_number || chat.to_number || 'Unknown',
        client_name: chat.from_number || chat.to_number || 'Unknown',
        last_message: lastMessageLabel,
        last_message_time: formattedDateValue,
        unread_count: chat.unread_count ?? 0,
        unread_count_agent: chat.unread_count_agent ?? chat.unread_count ?? 0,
        type: 'livechat',
        phone: chat.from_number || chat.to_number,
        message: lastMessageLabel,
        formatted_date: formattedDateValue,
        status: chat.chat_status || 1,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name || chat.client_name || chat.from_number || chat.to_number || 'Unknown')}&background=007bff&color=fff`,
        channel_id: 1, // Live Chat channel ID
        chat_session_id: chat.chat_session_id || chat.id
      };

      return (
        <ClientListChat
          key={`livechat-${chat.chat_session_id || chat.id}-${index}`}
          index={index}
          data={transformedData}
          isActive={`listChatClient ${isActive}`}
          chatIdActive={chatIdActive}
          detailType="LIVE"
          onClick={() => handleChatClick(chat.chat_session_id || chat.id)}
        />
      );
    });
  };

  // Filter chats based on search query
  const filterChats = (chats) => {
    if (!searchQuery.trim()) {
      return chats;
    }
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const fromNumber = String(chat.from_number || '').toLowerCase();
      const toNumber = String(chat.to_number || '').toLowerCase();
      const message = String(chat.body || chat.message || '').toLowerCase();
      return fromNumber.includes(query) || toNumber.includes(query) || message.includes(query);
    });
  };

  return (
    <Fragment>
      <TabPane tabId="chat-livechat">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 font-size-16">Live Chat</h5>
            </div>
            <div className="d-flex align-items-center gap-2">
              <InputGroup size="sm" style={{ maxWidth: '200px' }}>
                <span className="input-group-text text-muted bg-light" style={{ padding: '4px 8px' }}>
                  <i className="ri-search-line" style={{ fontSize: '14px' }}></i>
                </span>
                <Input
                  type="search"
                  className="form-control bg-light"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                />
              </InputGroup>
            </div>
          </div>
          <hr />
          <SimpleBar
            style={{ maxHeight: 'calc(100vh - 200px)' }}
            className="chat-message-list"
          >
            {(() => {
              if (isLoading) {
                return (
                  <ul className="list-unstyled chat-list chat-user-list" id="chat-list">
                    <Items isLoader={true} data={[]} />
                  </ul>
                );
              }

              const currentAgentId = String(user?.agent_id || user?.id || '');

              // Filter chats assigned to current user
              const assignToMe = filterChats(liveChats.filter((c) => {
                if (!c.assigned_to) {
                  return false;
                }
                const assignedAgents = String(c.assigned_to).split(',').map(a => a.trim()).filter(a => a);
                return assignedAgents.includes(currentAgentId);
              }));

              // Filter chats assigned to others (not current user)
              const assigned = filterChats(liveChats.filter((c) => {
                if (!c.assigned_to) {
                  return false;
                }
                const assignedAgents = String(c.assigned_to).split(',').map(a => a.trim()).filter(a => a);
                return !assignedAgents.includes(currentAgentId);
              }));

              const unassigned = filterChats(liveChats.filter((c) => {
                return !c.assigned_to || c.assigned_to === '' || c.assigned_to === null;
              }));

              return (
                <>
                  {/* Assign To Me section - show first */}
                  {assignToMe.length > 0 && (
                    <>
                      <div className="px-1 pt-2 text-muted small d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setShowAssignToMe(!showAssignToMe)}>
                        <i className="fas fa-chevron-down me-2" style={{ transform: showAssignToMe ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}></i>
                        <span className="fw-bold">Assign To Me</span>
                        <span className="badge bg-primary ms-2" style={{ fontSize: '10px' }}>{assignToMe.length}</span>
                      </div>
                      {showAssignToMe && (
                        <SimpleBar style={{ maxHeight: 'calc(50vh - 150px)', marginTop: '8px', minHeight: '100px' }}>
                          <ul className="list-unstyled chat-list chat-user-list" id="chat-list-assign-to-me">
                            <Items isLoader={false} data={assignToMe} />
                          </ul>
                        </SimpleBar>
                      )}
                    </>
                  )}

                  {/* Unassigned section */}
                  <div className="px-1 pt-3 text-muted small d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setShowUnassigned(!showUnassigned)}>
                    <i className="fas fa-chevron-down me-2" style={{ transform: showUnassigned ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}></i>
                    <span>Unassigned</span>
                  </div>
                  {showUnassigned && (
                    <SimpleBar style={{ maxHeight: 'calc(50vh - 150px)', marginTop: '8px', minHeight: '100px' }}>
                      <ul className="list-unstyled chat-list chat-user-list" id="chat-list-unassigned">
                        <Items isLoader={false} data={unassigned} />
                      </ul>
                    </SimpleBar>
                  )}

                  {/* Assigned section (to others) */}
                  <div className="px-1 pt-3 text-muted small d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setShowAssigned(!showAssigned)}>
                    <i className="fas fa-chevron-down me-2" style={{ transform: showAssigned ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}></i>
                    <span>Assigned</span>
                  </div>
                  {showAssigned && (
                    <SimpleBar style={{ maxHeight: 'calc(50vh - 150px)', marginTop: '8px', minHeight: '100px' }}>
                      <ul className="list-unstyled chat-list chat-user-list" id="chat-list-assigned">
                        <Items isLoader={false} data={assigned} />
                      </ul>
                    </SimpleBar>
                  )}
                </>
              );
            })()}
          </SimpleBar>
        </div>
      </TabPane>
    </Fragment>
  );
}

export default LiveChat;

