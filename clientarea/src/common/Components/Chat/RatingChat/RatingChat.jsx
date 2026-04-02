import { Box, Divider, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import Rating from 'react-rating';
import { useSelector, useDispatch } from 'react-redux';
import { handlerCloseSendRate } from '../../../../app/Auth/AuthAPI';
import {
  clearAllSessionsFromResolveChat,
  updateStatusFromAction,
} from '../../../../app/Auth/AuthSlice';
import {
  updateFeatureActive,
  updateFeatureBefore,
} from '../../../../app/Layouts/LayoutSlice';
import {
  clearAllStateMessageSetup,
  messageSelector,
} from '../../../../app/Message/MessageSlice';
import { notify } from '../../../Utils/helpers';

function RatingChat() {
  const { chatId } = useSelector(messageSelector);
  const [valRating, setValRating] = useState();
  const dispatch = useDispatch();

  const handlerSendRate = (rate) => {
    const dataParams = { chatId: chatId, rating: rate };
    handlerCloseSendRate(dataParams)
      .then((response) => {
        dispatch(updateFeatureActive('home'));
        dispatch(updateFeatureBefore('not_opened'));
        dispatch(clearAllSessionsFromResolveChat());
        dispatch(clearAllStateMessageSetup());
        notify('success', 4000, 'Terimakasih telah menilai agent kami');
        setValRating(0);
      })
      .catch((err) => {
        notify(
          'error',
          4000,
          'Rate gagal, karna terjadi error, mohon coba lagi!'
        );

        dispatch(updateStatusFromAction('rate_failed'));
      });
  };

  const handlerRateChat = (value) => {
    setValRating(value);
    handlerSendRate(value);
  };

  return (
    <>
      <Box w="100%" py="1rem" px="4">
        <Divider orientation="horizontal" borderColor="lightGray" />
      </Box>
      <Box w="100%" px="4" pb="5" textAlign="center">
        <Text fontSize="md" pb="3" fontWeight="medium">
          Apakah sudah cukup membantu?
        </Text>
        <Rating
          start={0}
          stop={5}
          step={1}
          initialRating={valRating}
          onClick={(value) => handlerRateChat(value)}
          emptySymbol={
            <IconContext.Provider value={{ color: '#767676', size: '1.4em' }}>
              <FaRegStar />
            </IconContext.Provider>
          }
          fullSymbol={
            <IconContext.Provider
              value={{
                style: { borderColor: '#767676' },
                color: '#dd831d',
                size: '1.4em',
              }}
            >
              <FaStar />
            </IconContext.Provider>
          }
        />
      </Box>
    </>
  );
}

export default RatingChat;
