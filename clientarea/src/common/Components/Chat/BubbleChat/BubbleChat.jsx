import { Box } from '@chakra-ui/react';
import React from 'react';
import { parseDateNowVWa } from '../../../Utils/helpers';
import FileContent from '../FileContent/FileContent';
import MessageContent from '../MessageContent/MessageContent';
import LabelChat from '../TextOnChat/LabelChat';

function BubbleChat(props) {
  const { data, parentProps, childProps, labelProps } = props;
  const formattedDate = parseDateNowVWa(data.formatted_date);
  const labelName = data.is_sender ? 'me' : data.agent_name;

  return (
    <Box {...parentProps}>
      <LabelChat {...parentProps} objAttr={labelProps} nameLabel={labelName} />
      <Box {...childProps}>
        {Boolean(data.file_id) && (
          <FileContent
            data={{
              fileId: data.file_id,
              fileName: data.file_name,
              filePath: data.file_path,
              fileUrl: data.file_url,
              fileType: data.file_type,
              isSender: data.is_sender,
              message: data.message,
            }}
          />
        )}
        <MessageContent
          isSender={data.is_sender}
          message={data.message}
          date={formattedDate}
        />
      </Box>
    </Box>
  );
}

export default BubbleChat;
