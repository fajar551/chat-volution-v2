import { VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';
import { messageSelector } from '../../../app/Message/MessageSlice';
import { updateOriginImage } from '../../../app/Select/SelectSlice';
import { isEmptyObj } from '../../Utils/helpers';
import FormUpload from '../FormUpload/FormUpload';
import BubbleChat from './BubbleChat/BubbleChat';
import RatingChat from './RatingChat/RatingChat';

function Chat() {
  const { deviceVersion } = useSelector(layoutSetupSelector);
  const { listBubbleChat } = useSelector(messageSelector);
  const [objCustomize, setObjCustomize] = useState({});
  const dispatch = useDispatch();
  const RenderBubbleChat = () => {
    const isStat = isEmptyObj(listBubbleChat);

    if (Boolean(isStat)) {
      return <></>;
    }

    return listBubbleChat.map((value, key) => {
      if (value.is_netral) {
        return <RatingChat key={key} />;
      } else {
        if (Boolean(value.is_sender)) {
          return (
            <BubbleChat
              key={key}
              data={value}
              parentProps={{
                justifyContent: 'right',
                m: '0.5rem 1rem 0.5rem auto !important',
                ...objCustomize,
              }}
              childProps={{
                bg: 'primary',
                color: 'whitePrimary',
                w: '100%',
                minHeight: '2.5rem',
                borderRadius: '18px 4px 18px 18px',
                boxShadow: '0 2px 8px rgba(255, 140, 0, 0.2)',
              }}
              labelProps={{
                fontSize: 'sm',
                fontWeight: 'normal',
                textAlign: 'right',
                mb: '5px',
                color: 'darkGray',
              }}
            />
          );
        } else {
          return (
            <BubbleChat
              key={key}
              data={value}
              parentProps={{
                justifyContent: 'left',
                m: '0.5rem auto 0.5rem 1rem !important',
                ...objCustomize,
              }}
              childProps={{
                bg: 'whitePrimary',
                color: 'darkPrimary',
                border: '1.5px',
                borderColor: 'lightGray',
                borderStyle: 'solid',
                w: '100%',
                minHeight: '2.5rem',
                borderRadius: '4px 18px 18px 18px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              }}
              labelProps={{
                fontSize: 'sm',
                fontWeight: 'normal',
                mb: '5px',
                color: 'darkGray',
                noOfLines: 1,
              }}
            />
          );
        }
      }
    });
  };

  useEffect(() => {
    const dataChatImage = listBubbleChat.filter((params) => {
      return params.file_type === 'image';
    });
    dispatch(updateOriginImage(dataChatImage));
  }, [listBubbleChat]);

  useEffect(() => {
    if (['tablet'].includes(deviceVersion)) {
      setObjCustomize({
        maxW: '30%',
        minW: '15%',
      });
    } else if (['large_mobile', 'medium_mobile'].includes(deviceVersion)) {
      setObjCustomize({
        maxW: '50%',
        minW: '15%',
      });
    } else {
      setObjCustomize({
        maxW: '70%',
        minW: '15%',
      });
    }
  }, [deviceVersion]);

  return (
    <>
      <VStack justify="end">
        <VStack w="100%">
          <RenderBubbleChat />
          <FormUpload />
        </VStack>
      </VStack>
    </>
  );
}

export default Chat;
