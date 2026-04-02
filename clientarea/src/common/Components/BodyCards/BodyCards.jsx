import { Box } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';
import { messageSelector } from '../../../app/Message/MessageSlice';
import {
  selectSelector,
  updateNewMessage,
} from '../../../app/Select/SelectSlice';
import Chat from '../Chat/Chat';
import Form from '../Forms/Form';
import Home from '../Home/Home';

function BodyCards() {
  const { feature, bodyMaxH, bodyMinH } = useSelector(layoutSetupSelector);
  const { isOpenEmoji } = useSelector(messageSelector);
  const { OnloadImage, originCountImgData, newMessage } =
    useSelector(selectSelector);
  const dispatch = useDispatch();

  const scrollToBottom = () => {
    const el = document.getElementById('container-chat');
    if (Boolean(el)) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const scrollToTop = () => {
    const el = document.getElementById('container-chat');
    if (Boolean(el)) {
      el.scrollTop = 0;
    }
  };

  useEffect(() => {
    if (['chat', 'rate_form'].includes(feature)) {
      if (originCountImgData.length > 0) {
        if (OnloadImage.length === originCountImgData.length) {
          scrollToBottom();
        } else {
          if (newMessage) {
            scrollToBottom();
            dispatch(updateNewMessage(true));
          } else {
            scrollToTop();
          }
        }
      } else {
        scrollToBottom();
      }
    }
  }, [feature, originCountImgData, OnloadImage, newMessage]);

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 1000);
  }, [isOpenEmoji]);

  return (
    <Box
      id="container-chat"
      w="100%"
      boxSizing="border-box"
      bg="bgColor"
      flexGrow={12}
      maxHeight={bodyMaxH}
      minHeight={bodyMinH}
      overflowX="hidden"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '6px',
          cursor: 'pointer !important',
        },
        '&::-webkit-scrollbar-track': {
          width: '1px',
          cursor: 'pointer !important',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#ff8c00',
          borderRadius: '24px',
          cursor: 'pointer !important',
        },
      }}
    >
      {feature === 'home' && <Home />}
      {['chat', 'rate_form'].includes(feature) && <Chat />}
      {feature === 'form_message' && <Form />}
    </Box>
  );
}

export default BodyCards;
