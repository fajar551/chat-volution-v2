import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';
import { getCategoryFile, getExtensionFile } from '../../utils/helpers';
import Avatar from './Avatar';
import Message from './Message';
import MessageFile from './MessageFile';
import NameChat from './NameChat';
import Time from './Time';
function BubbleChatClient(props) {
  /* config */
  const { data } = props;
  const { layoutMode } = useSelector(layoutSetupSelector);
  const [classBubble, setClassBubble] = useState('');

  const Items = (params) => {
    const { data } = params;
    if (!Boolean(data.file_url)) {
      let className = '';
      if (Boolean(data.agent_name)) {
        className = `message-styled right ${layoutMode === 'light' ? 'dark' : 'light'
          }`;
      } else {
        className = `message-styled left ${layoutMode === 'light' ? 'dark' : 'light'
          }`;
      }

      return (
        <>
          <div className="ctext-wrap-content-responsived">
            <Message message={data.message} className={className} />
            <Time date={data.formatted_date} complete={true} />
          </div>
        </>
      );
    }

    const getExtFile = getExtensionFile(data.file_name);
    let categoryFile = getCategoryFile(getExtFile);

    // If categoryFile is null (unknown extension) OR if file_type is 'image' but categoryFile is not 'image',
    // use data.file_type as fallback
    if ((!categoryFile || (data.file_type === 'image' && categoryFile.name !== 'image')) && data.file_type) {
      // Map file_type to categoryFile format
      const typeToCategory = {
        'image': { name: 'image', size: 5242880, unit: '5MB' },
        'video': { name: 'video', size: 5242880, unit: '5MB' },
        'other': { name: 'other', size: 5242880, unit: '5MB' }
      };
      categoryFile = typeToCategory[data.file_type] || categoryFile;
    }

    // If categoryFile is still null, provide default
    const safeCategoryFile = categoryFile || { name: 'other', size: 5242880, unit: '5MB' };

    // If extension is missing but we have file_type, try to extract extension from file_type
    let safeExtensionFile = getExtFile;
    if (!safeExtensionFile && data.file_type === 'image') {
      // Try to extract extension from file_name or default to jpg
      const fileNameParts = data.file_name.split('.');
      if (fileNameParts.length > 1) {
        safeExtensionFile = fileNameParts[fileNameParts.length - 1].toLowerCase();
      } else {
        // Default to jpg for images
        safeExtensionFile = 'jpg';
      }
      //console.log('✅ [BubbleChatClient] Extracted extension for image:', safeExtensionFile);
    } else if (!safeExtensionFile) {
      safeExtensionFile = 'bin';
    }

    // Final check: if file_type is 'image', ensure categoryFile is 'image'
    if (data.file_type === 'image' && safeCategoryFile.name !== 'image') {
      console.warn('⚠️ [BubbleChatClient] Force setting categoryFile to image because file_type is image');
      safeCategoryFile.name = 'image';
    }

    return (
      <>
        <div className="ctext-wrap-content-responsived">
          <MessageFile
            data={data}
            extensionFile={safeExtensionFile}
            categoryFile={safeCategoryFile}
          />
          {Boolean(data.message) && <Message message={data.message} />}
          <Time date={data.formatted_date} complete={true} />
        </div>
      </>
    );
  };

  useEffect(() => {
    if (!data.agent_name) {
      setClassBubble('left');
    } else {
      setClassBubble('right');
    }
  }, [data]);

  return (
    <>
      <li className={classBubble}>
        <div className="conversation-list">
          <Avatar avatar={data.avatar} dtClass="chat-avatar" />
          <div className="user-chat-content">
            <NameChat
              name={!Boolean(data.user_name) ? data.agent_name : data.user_name}
              dtClass="conversation-name"
            />
            <div className="ctext-wrap">
              <Items data={data} />
            </div>
          </div>
        </div>
      </li>
    </>
  );
}

export default BubbleChatClient;
