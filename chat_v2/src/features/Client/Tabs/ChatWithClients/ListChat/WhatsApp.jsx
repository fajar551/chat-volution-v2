import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, InputGroup, TabPane } from 'reactstrap';
import SimpleBar from 'simplebar-react';
// Removed backendIntegration import - WhatsApp component should only handle WhatsApp chats
import { authSelector } from '../../../../../app/Auth/AuthSlice';
import ClientListChat from '../../../../../Common/Components/ListChat/ClientListChat';
import Skeletons from '../../../../../Common/Components/Skeletons';
import whatsappIntegration from '../../../../../whatsapp-integration';
import notificationSound from '../../../../../livechat_triple.wav';

function WhatsApp(props) {
  const { chatIdActive } = props;
  const { SkeletonListChat } = Skeletons;
  const { user } = useSelector(authSelector);
  const [whatsappChats, setWhatsappChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showAssigned, setShowAssigned] = useState(true);
  const [showUnassigned, setShowUnassigned] = useState(true);
  const [showAssignToMe, setShowAssignToMe] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to play notification sound using WAV file
  const playNotificationSound = () => {
    try {
      //console.log('🔊 Playing WhatsApp notification sound from file...');

      // Create audio element and play the WAV file
      const audio = new Audio(notificationSound);

      // Set volume (0.0 to 1.0)
      audio.volume = 0.7;

      // Play the sound
      audio.play().catch(error => {
        // Handle autoplay restrictions
        console.warn('Could not play notification sound:', error);

        // Fallback: Try to play after user interaction
        // This will work if user has interacted with the page
        try {
          audio.play();
        } catch (fallbackError) {
          console.warn('Fallback play also failed:', fallbackError);
        }
      });

      // Clean up audio element after playback
      audio.addEventListener('ended', () => {
        audio.remove();
      });

    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };



  useEffect(() => {
    // Define event handlers
    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleChatsLoaded = async (chats) => {
      // After chats are loaded, filter closed chats to ensure consistency
      // This prevents closed chats from appearing in the list
      await whatsappIntegration.filterClosedChats().then(() => {
        setWhatsappChats([...whatsappIntegration.chats]);
        setIsLoading(false);
        whatsappIntegration.emit('chatsUpdated', whatsappIntegration.chats);
      }).catch(() => {
        // If filtering fails, still set the chats
        setWhatsappChats(chats);
        setIsLoading(false);
      });

      // Load assigned status for all chats once when chats are loaded (real-time initialization)
      // This ensures all agents see the correct assigned status from the start
      const currentChats = whatsappIntegration.chats || [];
      if (currentChats.length > 0) {
        // Fetch assigned status for all chats in parallel (one-time load)
        const statusPromises = currentChats.map(async (chat) => {
          try {
            const instance = chat.instance || whatsappIntegration.phoneToInstance?.get(chat.phone) || 'wa1';
            const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/assigned-status/${chat.phone}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                return {
                  phone: chat.phone,
                  assignedTo: data.assignedTo,
                  isAssigned: data.isAssigned
                };
              }
            }
          } catch (error) {
            // Silent fail for individual chat status
          }
          return null;
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap = new Map();
        statuses.forEach(status => {
          if (status) {
            statusMap.set(status.phone, status);
          }
        });

        // Update whatsappIntegration.chats with assigned status
        let hasChanges = false;
        whatsappIntegration.chats = currentChats.map(chat => {
          const status = statusMap.get(chat.phone);
          if (status) {
            const newIsAssigned = status.isAssigned;
            const newAssignedTo = status.assignedTo;

            // Check if there's a change
            if (chat.isAssigned !== newIsAssigned || chat.assignedTo !== newAssignedTo) {
              hasChanges = true;
              return {
                ...chat,
                isAssigned: newIsAssigned,
                assignedTo: newAssignedTo
              };
            }
          }
          return chat;
        });

        // Update state if there are changes
        if (hasChanges) {
          setWhatsappChats([...whatsappIntegration.chats]);
          whatsappIntegration.emit('chatsUpdated', whatsappIntegration.chats);
        }
      }
    };

    // WhatsApp tab listens for newMessage events to trigger chat list updates

    const handleChatsUpdated = (updatedChats) => {
      setWhatsappChats([...updatedChats]);
    };

    // Load unread counts from database on component mount
    // Fetch from all instances (wa1-wa6) and match with chat instance
    const loadUnreadCounts = async () => {
      try {
        const instances = ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];
        const instanceUnreadCounts = {}; // Store unread counts per instance

        // Fetch unread counts from all instances
        const promises = instances.map(async (instance) => {
          try {
            const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/unread-counts`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.unreadCounts) {
                instanceUnreadCounts[instance] = data.unreadCounts;
              }
            }
          } catch (error) {
            console.warn(`Error loading unread counts from ${instance}:`, error);
          }
        });

        await Promise.all(promises);

        // Update unread counts in existing chats based on their instance
        setWhatsappChats(prevChats =>
          prevChats.map(chat => {
            // Get instance from chat object (from database), default to wa1
            const chatInstance = chat.instance || 'wa1';
            // Get unread count from the instance that matches this chat's instance
            const unreadCount = instanceUnreadCounts[chatInstance]?.[chat.phone] || chat.unreadCount || 0;

            return {
              ...chat,
              unreadCount: unreadCount
            };
          })
        );
      } catch (error) {
        console.error('Error loading unread counts:', error);
      }
    };

    const handleNewMessage = (message) => {
      //console.log('🔔 handleNewMessage in WhatsApp.jsx:', message);

      // New message will trigger chatsUpdated via updateChatWithNewMessage
      // This ensures chat list is updated when new message arrives
      // Play notification sound for incoming messages
      if (message.from !== 'me' && message.from && message.from.includes('@c.us')) {
        //console.log('🔊 Playing notification sound for incoming message');
        playNotificationSound();
      }
    };

    const handleAiResponse = (data) => {
      // AI response will trigger chatsUpdated via updateChatWithNewMessage
      // This ensures chat list is updated when AI responds
    };

    const handleError = (error) => {
      console.error('WhatsApp error in tab:', error);
      setIsLoading(false);
    };

    const handleChatClosed = (event) => {
      const { phone } = event.detail;
      //console.log('🔒 Chat closed, removing from list:', phone);

      // Normalize phone number for comparison
      const normalizedPhone = phone?.replace('@c.us', '') || phone;

      // Remove chat from whatsappIntegration.chats
      whatsappIntegration.chats = whatsappIntegration.chats.filter(chat => {
        const chatPhone = chat.phone?.replace('@c.us', '') || chat.phone;
        return chatPhone !== normalizedPhone;
      });

      // Remove chat from local state
      setWhatsappChats(prevChats => prevChats.filter(chat => {
        const chatPhone = chat.phone?.replace('@c.us', '') || chat.phone;
        return chatPhone !== normalizedPhone;
      }));

      // Also call filterClosedChats to ensure consistency
      // This prevents the chat from reappearing if loadChats() is called later
      whatsappIntegration.filterClosedChats().then(() => {
        // Update state after filtering
        setWhatsappChats([...whatsappIntegration.chats]);
        whatsappIntegration.emit('chatsUpdated', whatsappIntegration.chats);
      }).catch(() => {
        // If filtering fails, still emit update
        whatsappIntegration.emit('chatsUpdated', whatsappIntegration.chats);
      });
    };

    const handleChatAssigned = async (event) => {
      const { phone, assignedTo } = event.detail;
      //console.log('👤 Chat assigned, updating list:', phone, assignedTo);

      // Immediately update the chat's assigned status in whatsappIntegration.chats
      whatsappIntegration.updateChatAssignedStatus(phone, assignedTo);

      // Immediately update the chat's assigned status in the list
      setWhatsappChats(prevChats => {
        return prevChats.map(chat => {
          // Normalize phone numbers for comparison
          const chatPhone = chat.phone?.replace('@c.us', '') || '';
          const eventPhone = phone?.replace('@c.us', '') || '';

          if (chatPhone === eventPhone) {
            // Update assigned status immediately
            const isAssigned = assignedTo !== null && assignedTo !== undefined && assignedTo !== 'undefined' && assignedTo !== '';
            return {
              ...chat,
              isAssigned: isAssigned,
              assignedTo: assignedTo || null
            };
          }
          return chat;
        });
      });

      // Fetch latest assigned status from API to ensure accuracy (real-time update)
      // This ensures all agents see the same status immediately
      try {
        const instance = whatsappIntegration.phoneToInstance?.get(phone) || 'wa1';
        const response = await fetch(`https://waserverlive.genio.id/${instance}/api/whatsapp/assigned-status/${phone}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const latestAssignedTo = data.assignedTo || null;
            const latestIsAssigned = data.isAssigned || false;

            // Update with latest data from API
            whatsappIntegration.updateChatAssignedStatus(phone, latestAssignedTo);

            setWhatsappChats(prevChats => {
              return prevChats.map(chat => {
                const chatPhone = chat.phone?.replace('@c.us', '') || '';
                const eventPhone = phone?.replace('@c.us', '') || '';
                if (chatPhone === eventPhone) {
                  return {
                    ...chat,
                    isAssigned: latestIsAssigned,
                    assignedTo: latestAssignedTo
                  };
                }
                return chat;
              });
            });

            // Emit update event for other components
            whatsappIntegration.emit('chatsUpdated', whatsappIntegration.chats);
          }
        }
      } catch (error) {
        // Silent fail - event already updated the UI
        console.warn('Failed to fetch latest assigned status:', error);
      }
    };

    // WhatsApp only - no backend integration handlers needed

    // Register event listeners
    whatsappIntegration.on('connected', handleConnected);
    whatsappIntegration.on('disconnected', handleDisconnected);
    whatsappIntegration.on('chatsLoaded', handleChatsLoaded);
    whatsappIntegration.on('newMessage', handleNewMessage);
    whatsappIntegration.on('chatsUpdated', handleChatsUpdated);
    whatsappIntegration.on('aiResponse', handleAiResponse);
    whatsappIntegration.on('error', handleError);

    // Listen for chat closed and assigned events
    window.addEventListener('whatsapp:chatClosed', handleChatClosed);
    window.addEventListener('whatsapp:chatAssigned', handleChatAssigned);

    // Listen for localStorage events (sync antar tab/browser)
    const handleStorageChange = (e) => {
      if (e.key === 'whatsapp:chatAssigned' && e.newValue) {
        try {
          const eventData = JSON.parse(e.newValue);
          if (eventData.type === 'whatsapp:chatAssigned') {
            // Trigger handleChatAssigned dengan data dari localStorage
            handleChatAssigned({
              detail: {
                phone: eventData.phone,
                agentId: eventData.agentId,
                assignedTo: eventData.assignedTo
              }
            });
          }
        } catch (error) {
          console.warn('Error parsing localStorage event:', error);
        }
      } else if (e.key === 'whatsapp:chatClosed' && e.newValue) {
        try {
          const eventData = JSON.parse(e.newValue);
          if (eventData.type === 'whatsapp:chatClosed') {
            // Trigger handleChatClosed dengan data dari localStorage
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

    // WhatsApp only - no backend integration needed

    // Load initial chats from WhatsApp only
    whatsappIntegration.loadChats();

    // Load unread counts from database
    loadUnreadCounts();

    // REAL-TIME UPDATE: No polling needed!
    // Assigned status updates are handled via events:
    // 1. 'whatsapp:chatAssigned' event (local + localStorage for cross-tab)
    // 2. 'chatsLoaded' event (initial load with assigned status)
    // 3. 'chatsUpdated' event (when chats are updated)
    // This ensures real-time updates without continuous API calls

    // Fallback: check connection status after 3 seconds
    const timeoutId = setTimeout(() => {
      if (whatsappIntegration.chats && whatsappIntegration.chats.length > 0) {
        setIsConnected(true);
      }
    }, 3000);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Remove all event listeners
      whatsappIntegration.off('connected', handleConnected);
      whatsappIntegration.off('disconnected', handleDisconnected);
      whatsappIntegration.off('chatsLoaded', handleChatsLoaded);
      whatsappIntegration.off('newMessage', handleNewMessage);
      whatsappIntegration.off('chatsUpdated', handleChatsUpdated);
      whatsappIntegration.off('aiResponse', handleAiResponse);
      whatsappIntegration.off('error', handleError);

      // Remove event listeners
      window.removeEventListener('whatsapp:chatClosed', handleChatClosed);
      window.removeEventListener('whatsapp:chatAssigned', handleChatAssigned);
      window.removeEventListener('storage', handleStorageChange);

      // WhatsApp only - no backend integration cleanup needed
    };
  }, []); // Empty dependency array - event listeners are set up once

  const handleChatClick = (phone) => {
    //console.log('🖱️ Chat clicked:', phone);
    // Mark chat as read when clicked
    whatsappIntegration.markChatAsRead(phone);
  };

  // Function to get instance label based on instance name
  const getInstanceLabel = (instance) => {
    const instanceMap = {
      'wa1': 'qwords',
      'wa2': 'gfn',
      'wa3': 'relabs',
      'wa4': 'aksara',
      'wa5': 'gssl',
      'wa6': 'bw'
    };

    return instanceMap[instance?.toLowerCase()] || instance?.toUpperCase() || 'WA';
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
              {isConnected ? 'No WhatsApp chats found' : 'WhatsApp not connected'}
            </h5>
          </div>
        </li>
      );
    }

    return data
      .filter((chat) => {
        // Filter out chats with phone number 0 or "0"
        if (chat.phone === '0' || chat.phone === 0) {
          return false;
        }
        // Filter out chats with "No message" as last message
        if (chat.lastMessage === 'No message' || chat.lastMessage === 'No message') {
          return false;
        }
        return true;
      })
      .map((chat, index) => {
        let isActive = '';
        if (chatIdActive === `whatsapp-${chat.phone}`) {
          isActive = 'active';
        }

        // Get instance from chat object (from database), default to wa1
        // Instance should come from the most recent message's instance field
        const instance = chat.instance || 'wa1';
        const instanceBadge = getInstanceLabel(instance);

        // Transform WhatsApp chat data to match ClientListChat format
        // Ensure lastMessageTime is in valid format
        let formattedDateValue = chat.lastMessageTime || new Date().toISOString();

        // Validate and convert to ISO string format
        try {
          if (formattedDateValue) {
            if (typeof formattedDateValue === 'string') {
              const dateObj = new Date(formattedDateValue);
              if (!isNaN(dateObj.getTime())) {
                formattedDateValue = dateObj.toISOString();
              } else {
                // Invalid date string, use current date
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
          console.warn('Error formatting date in WhatsApp.jsx:', error, formattedDateValue);
          formattedDateValue = new Date().toISOString();
        }

        const transformedData = {
          chat_id: `whatsapp-${chat.phone}`,
          user_name: `${chat.phone}`, // Will be displayed with badge in ClientListChat
          client_name: chat.phone,
          last_message: chat.lastMessage || 'No message',
          last_message_time: formattedDateValue,
          unread_count: chat.unreadCount || 0,
          unread_count_agent: chat.unreadCount || 0, // Add unread_count_agent for badge
          type: 'whatsapp',
          phone: chat.phone,
          message: chat.lastMessage || 'No message', // Add message field for display
          formatted_date: formattedDateValue, // Use validated date format
          status: 1, // Add status for display
          // Add more fields for better display
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.phone)}&background=ff8c00&color=fff`,
          channel_id: 2, // WhatsApp channel ID
          instance: instance, // Pass instance for badge display
          instanceBadge: instanceBadge // Badge text
        };

        return (
          <ClientListChat
            key={`whatsapp-${chat.phone}-${instance}`}
            index={index}
            data={transformedData}
            isActive={`listChatClient ${isActive}`}
            chatIdActive={chatIdActive}
            detailType="WA"
            onClick={() => handleChatClick(chat.phone)}
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
      const phone = String(chat.phone || '').toLowerCase();
      const lastMessage = String(chat.lastMessage || '').toLowerCase();
      return phone.includes(query) || lastMessage.includes(query);
    });
  };

  return (
    <Fragment>
      <TabPane tabId="chat-whatsapp">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 font-size-16">WhatsApp Chats</h5>
              {/* <div className="d-flex align-items-center ms-3">
                <div
                  className={`badge ${isConnected ? 'bg-success' : 'bg-danger'} me-2`}
                  style={{ fontSize: '10px' }}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div> */}
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
              const assignToMe = filterChats(whatsappChats.filter((c) => {
                if (!c.isAssigned || !c.assignedTo) {
                  return false;
                }
                // Check if assignedTo contains current agent ID (can be comma-separated)
                const assignedAgents = String(c.assignedTo).split(',').map(a => a.trim()).filter(a => a);
                return assignedAgents.includes(currentAgentId);
              }));

              // Filter chats assigned to others (not current user)
              const assigned = filterChats(whatsappChats.filter((c) => {
                // First check from chat object (loaded from database)
                if (c.isAssigned !== undefined) {
                  if (!c.isAssigned) return false;
                  // If assigned, check if it's not assigned to current user
                  if (c.assignedTo) {
                    const assignedAgents = String(c.assignedTo).split(',').map(a => a.trim()).filter(a => a);
                    return !assignedAgents.includes(currentAgentId);
                  }
                  return true;
                }
                // Fallback to whatsappIntegration.isChatAssigned
                return whatsappIntegration.isChatAssigned ? whatsappIntegration.isChatAssigned(c.phone) : false;
              }));

              const unassigned = filterChats(whatsappChats.filter((c) => {
                // First check from chat object (loaded from database)
                if (c.isAssigned !== undefined) {
                  return !c.isAssigned;
                }
                // Fallback to whatsappIntegration.isChatAssigned
                return !(whatsappIntegration.isChatAssigned ? whatsappIntegration.isChatAssigned(c.phone) : false);
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

export default WhatsApp;
