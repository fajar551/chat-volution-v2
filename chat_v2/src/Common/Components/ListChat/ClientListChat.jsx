import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  getChatDetailClient,
  getDetailHistoryChat,
  getHistoryChatAction,
  updateOpenChat,
  updateBeforeJoinRoom,
} from '../../../features/Client/DetailChat/DetailChatClientSlice';
import {
  capitalizeFirstMultiParagraph,
  parseDateNowVWa,
} from '../../utils/helpers';

/* image default */
import { Badge } from 'reactstrap';
import telegramLogo from '../../../assets/images/social-media/telegram.png';
import whatsappLogo from '../../../assets/images/social-media/wa.png';
import AvatarDefault from '../../../assets/images/users/avatar/avatar-4.png';
import { resetAllStateInputChat } from '../InputChat/InputChatSlice';

function ClientListChat(props) {
  const { data, index, isActive, chatIdActive, detailType } = props;
  let userName = '';
  
  // Untuk LiveChat, prioritaskan name (bukan email/nomor)
  if (detailType === 'LIVE') {
    if (Boolean(data.name)) {
      userName = capitalizeFirstMultiParagraph(data.name);
    } else if (Boolean(data.user_name)) {
      userName = capitalizeFirstMultiParagraph(data.user_name);
    }
  } else {
    // Untuk tab lain, gunakan user_name seperti biasa
    if (Boolean(data.user_name)) {
      userName = capitalizeFirstMultiParagraph(data.user_name);
    }
  }

  let avatar;

  if (data.channel_id === 2) {
    // For WhatsApp, use custom avatar if provided, otherwise use WhatsApp logo
    if (data.avatar && data.avatar.startsWith('http')) {
      avatar = data.avatar;
    } else {
      avatar = whatsappLogo;
    }
  } else if (data.channel_id === 3) {
    avatar = telegramLogo;
  } else if (data.avatar && data.avatar.startsWith('http')) {
    // Use custom avatar if provided
    avatar = data.avatar;
  } else {
    avatar = AvatarDefault;
  }

  const dateFormatted = parseDateNowVWa(data.formatted_date);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlerResetAllInputMessage = () => {
    const elmessagePreview = document.getElementById('messagePreview');
    const elmessageDetailChat = document.getElementById('input-message');
    if (elmessageDetailChat) {
      elmessageDetailChat.innerHTML = '';
    }

    if (elmessagePreview) {
      elmessagePreview.innerHTML = '';
    }
  };

  const eventChatDetail = (event, data, detailType) => {
    if (event.altKey) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (data.chat_id !== chatIdActive) {
      dispatch(updateOpenChat(data));

      navigate(`../chat-with-client/${data.chat_id}-${detailType}`);
      handlerResetAllInputMessage();
      dispatch(resetAllStateInputChat());

      if (detailType === 'CH') {
        dispatch(getDetailHistoryChat(data.chat_id));
        dispatch(getHistoryChatAction(data.chat_id));
      } else if (detailType === 'WA' || (data.type === 'whatsapp' && detailType === 'CH')) {
        // For WhatsApp chats (both from history and active), use getChatDetailClient
        dispatch(getChatDetailClient(data.chat_id));
      } else if (detailType === 'LIVE' || data.chat_id.startsWith('livechat-')) {
        // For LiveChat, set isOpen to 'open' so it renders properly
        // LiveChatDetail will handle fetching messages itself
        dispatch(updateBeforeJoinRoom({
          chat_detail: {
            chat_id: data.chat_id,
            chat_session_id: data.chat_session_id || data.chat_id.replace(/^livechat-/, '').replace(/-LIVE$/, ''),
            topic_name: data.user_name || data.client_name || 'Live Chat',
            user_name: data.user_name || data.client_name || 'Client',
            user_email: data.user_email || '-',
            agent_id: data.assigned_to || null,
            agent_name: null,
            agent_email: null,
            status: data.status || 1,
            channel_name: 'Live Chat',
            channel_id: data.channel_id || 1,
            department_id: null,
            department_name: null,
            chat_reply: [],
            chat_labels: [],
          }
        }));
      } else {
        dispatch(getChatDetailClient(data.chat_id));
      }
    }
  };

  return (
    <li
      id={`conversation-${data.chat_id}`}
      key={index}
      className={`${isActive}`}
      onClick={(event) => eventChatDetail(event, data, detailType)}
    >
      <Link to="#">
        <div className="d-flex">
          <div className="chat-user-img online2 align-self-center me-3 ms-0">
            <img
              src={avatar}
              className="rounded-circle avatar-xs"
              alt="chatvolution-avatar"
            />
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <h5 className="font-size-15 mb-1 d-flex align-items-center" style={{ minHeight: '20px' }}>
              <span className="text-truncate me-2">{userName}</span>
              {data.instance && data.channel_id === 2 && (() => {
                // Different colors for each instance (wa1-wa6)
                const instanceColors = {
                  'wa1': '#ff8c00', // Orange
                  'wa2': '#128C7E', // WhatsApp Green
                  'wa3': '#25D366', // Bright Green
                  'wa4': '#34B7F1', // Blue
                  'wa5': '#FF6B6B', // Red
                  'wa6': '#9B59B6'  // Purple
                };
                const instanceKey = (data.instance || '').toLowerCase();
                const badgeColor = instanceColors[instanceKey] || '#ff8c00'; // Default orange

                return (
                  <span
                    className="flex-shrink-0"
                    style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      backgroundColor: badgeColor,
                      color: '#fff',
                      fontWeight: 'bold',
                      lineHeight: '1.2',
                      border: 'none',
                      display: 'inline-block',
                      borderRadius: '10rem',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'baseline'
                    }}
                  >
                    {data.instanceBadge || data.instance.toUpperCase()}
                  </span>
                );
              })()}
            </h5>
            <p className="chat-user-message text-truncate mb-0">
              {data.message}
            </p>
            {[9, 10, 11].includes(data.status) && (
              <div className="small py-1">
                <span className="text-tangerin fa fa-star"></span>{' '}
                {!data.rating ? 'No Rating' : data.rating}
              </div>
            )}
          </div>
          <div className="d-flex flex-column">
            <div className="font-size-12 mb-2">{dateFormatted}</div>
            {data.unread_count_agent > 0 && (
              <div className="font-size-14 text-end">
                <Badge
                  color="tangerin"
                  pill
                  style={data.channel_id === 2 ? { backgroundColor: '#ff8c00' } : {}}
                >
                  {data.unread_count_agent}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

export default ClientListChat;
