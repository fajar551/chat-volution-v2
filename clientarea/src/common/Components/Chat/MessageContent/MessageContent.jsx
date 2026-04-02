import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import Linkify from '../../Linkify/Linkify';
import styles from './MessageContent.module.css';

function MessageContent(props) {
  const { message, date, isSender } = props;
  return (
    <Box px="3" py="1">
      {Boolean(message) && (
        <Linkify
          tagName="p"
          content={message}
          className={styles['message-styled']}
        />
      )}
      <Text
        fontSize="xs"
        textAlign="right"
        color={isSender ? 'primaryLight' : 'normalGray'}
      >
        {!Boolean(date) ? '00:00' : date}
      </Text>
    </Box>
  );
}

export default MessageContent;
