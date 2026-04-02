import { useEffect, useState } from 'react';
import { TabPane } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import ClientListChat from '../../../../../Common/Components/ListChat/ClientListChat';
import Skeletons from '../../../../../Common/Components/Skeletons';
import backendIntegration from '../../../../../backend-integration';
import sessionHelper from '../../../../../utils/session-helper';

// Helper function to send message to clientarea
const sendMessageToClient = (chatId, message, from = 'agent') => {
  const success = backendIntegration.sendMessageToClient(chatId, message, from);
  if (!success) {
    console.error('Failed to send message to clientarea');
  }
  return success;
};

// Helper function to send agent message to clientarea
const sendAgentMessage = (chatId, message) => {
  const success = backendIntegration.sendAgentMessage(chatId, message);
  if (!success) {
    console.error('Failed to send agent message to clientarea');
  }
  return success;
};

function BackendV2(props) {
  const { chatIdActive } = props;
  const { SkeletonListChat } = Skeletons;
  const [backendChats, setBackendChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleBackendConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleBackendChatsLoaded = (chats) => {
      const uniqueChats = [];
      const seenIds = new Set();

      for (const chat of chats) {
        if (!seenIds.has(chat.chat_id)) {
          seenIds.add(chat.chat_id);
          uniqueChats.push(chat);
        }
      }

      setBackendChats(uniqueChats);
      setIsLoading(false);
      setError(null);
    };

    const handleBackendError = (error) => {
      console.error('Backend V2 error:', error);
      setError(error.message);
      setIsLoading(false);
      setIsConnected(false);
    };

    const handleSocketConnected = () => {
      setIsSocketConnected(true);
    };

    const handleSocketDisconnected = (reason) => {
      setIsSocketConnected(false);
    };

    const handleNewMessage = (data) => {
      // The chats will be updated automatically via chatsLoaded event
    };

    const handleAgentMessage = (data) => {
      // The chats will be updated automatically via chatsLoaded event
    };

    // Register event listeners
    backendIntegration.on('connected', handleBackendConnected);
    backendIntegration.on('chatsLoaded', handleBackendChatsLoaded);
    backendIntegration.on('error', handleBackendError);
    backendIntegration.on('socketConnected', handleSocketConnected);
    backendIntegration.on('socketDisconnected', handleSocketDisconnected);
    backendIntegration.on('newMessage', handleNewMessage);
    backendIntegration.on('agentMessage', handleAgentMessage);

    // Set session cookie for backend integration
    const sessionCookie = sessionHelper.getSessionCookie();
    backendIntegration.setSessionCookie(sessionCookie);

    // Fallback: check connection status after 5 seconds
    const timeoutId = setTimeout(() => {
      if (backendChats.length > 0) {
        setIsConnected(true);
      } else if (!isLoading) {
        setError('No chats found or connection failed');
      }
    }, 5000);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Stop API refresh
      backendIntegration.stopApiRefresh();
      // Remove all event listeners
      backendIntegration.off('connected', handleBackendConnected);
      backendIntegration.off('chatsLoaded', handleBackendChatsLoaded);
      backendIntegration.off('error', handleBackendError);
      backendIntegration.off('socketConnected', handleSocketConnected);
      backendIntegration.off('socketDisconnected', handleSocketDisconnected);
      backendIntegration.off('newMessage', handleNewMessage);
      backendIntegration.off('agentMessage', handleAgentMessage);
    };
  }, [backendChats.length, isLoading]);

  const Items = (params) => {
    const { isLoader, data } = params;

    if (isLoader) {
      return <SkeletonListChat />;
    }

    if (data.length < 1) {
      return (
        <li id="conversation-chat-empty" className="active">
          <div className="d-flex justify-content-center p-5">
            <div className="text-center">
              <h5 className="mb-2 font-size-14">
                {error ? `Error: ${error}` : 'No Backend V2 chats found'}
              </h5>
              {error && (
                <div className="mt-2">
                  <small className="text-muted">
                    Check browser console for more details
                  </small>
                </div>
              )}
            </div>
          </div>
        </li>
      );
    }

    return data.map((chat, index) => {
      let isActive = '';
      if (chatIdActive === `backend-${chat.chat_id}`) {
        isActive = 'active';
      }

      // Create a modified chat object with backend- prefix for navigation
      const modifiedChat = {
        ...chat,
        chat_id: `backend-${chat.chat_id}` // Add backend- prefix for navigation
      };

      return (
        <ClientListChat
          key={`backend-${chat.chat_id}-${index}`}
          index={index}
          data={modifiedChat}
          isActive={`listChatClient ${isActive}`}
          chatIdActive={chatIdActive}
          detailType="BE" // Backend V2
        />
      );
    });
  };

  return (
    <TabPane tabId="backend-v2">
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-2 font-size-16">Backend V2 Chats</h5>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={() => backendIntegration.refreshChats()}
              disabled={!isConnected}
            >
              🔄 Refresh
            </button>
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
        <hr />
        <SimpleBar
          style={{ maxHeight: '100%' }}
          className="chat-message-list"
        >
          <ul
            className="list-unstyled chat-list chat-user-list"
            id="chat-list"
          >
            <Items isLoader={isLoading} data={backendChats} />
          </ul>
        </SimpleBar>
      </div>
    </TabPane>
  );
}

export default BackendV2;
export { sendAgentMessage, sendMessageToClient };

