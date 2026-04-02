import {
  Box,
  Flex,
  IconButton,
  Image,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaFileSignature,
  FaFileVideo,
  FaFileWord,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSelector,
  updateOnloadImage,
} from '../../../../app/Select/SelectSlice';
import {
  getExtensionFile,
  limitText,
  randomString,
} from '../../../Utils/helpers';
import FancyApp from '../../FancyApp/FancyApp';
import bgTransparent from '../../../../assets/images/background-transparent.png';
import fileSaver from 'file-saver';

const ImageRender = React.memo(
  function (props) {
    return <Image {...props} />;
  },
  (prevProps, nextProps) => {
    return prevProps.src === nextProps.src;
  }
);

function FileContent(props) {
  const { data } = props;
  const dispatch = useDispatch();

  const handlerDownloadFile = (file) => {
    const getExtFile = getExtensionFile(file);
    const generateNameFile = `${randomString(15)}.${getExtFile}`;
    fileSaver.saveAs(file, generateNameFile);
  };

  const configFancyApps = {
    Toolbar: {
      display: ['zoom', 'download', 'close'],
      items: {
        zoom: {
          type: 'button',
          class: 'fancybox__button--zoom',
          label: 'TOGGLE_ZOOM',
          html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><circle cx="10" cy="10" r="7"></circle><path d="M16 16 L21 21"></svg>',
          click: function (event) {
            event.preventDefault();
            const panzoom = this.fancybox.getSlide().Panzoom;

            if (panzoom) {
              panzoom.toggleZoom();
            }
          },
        },
        download: {
          type: 'link',
          label: 'Download',
          class: 'fancybox__button--download',
          html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.62 2.48A2 2 0 004.56 21h14.88a2 2 0 001.94-1.51L22 17"/></svg>',
          click: function (event) {
            const getExtFile = getExtensionFile(event.srcElement.download);
            const generateNameFile = `${randomString(10)}.${getExtFile}`;
            fileSaver.saveAs(event.srcElement.download, generateNameFile);
            event.preventDefault();
          },
        },
        close: {
          type: 'button',
          label: 'CLOSE',
          class: 'fancybox__button--close',
          html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"></path></svg>',
          tabindex: 1,
          click: function (event) {
            event.stopPropagation();
            event.preventDefault();

            this.fancybox.close();
          },
        },
      },
    },
    Image: {
      zoom: true,
    },
  };

  /* selector */
  const { OnloadImage } = useSelector(selectSelector);

  const detectOnLoad = (el) => {
    let value = el.target.id;
    if (OnloadImage.indexOf(value) === -1) {
      dispatch(updateOnloadImage(value));
    }
  };

  const exFile = getExtensionFile(data.fileName);
  if (data.fileType === 'image') {
    let propsImg = {};
    if (data.isSender) {
      propsImg = {
        borderRadius: '15px 0 0 0',
        borderStyle: 'solid',
        p: '0.5',
        objectFit: 'cover',
        borderColor: 'lightGray',
        alt: 'img-thumbnail',
        alignContent: 'center',
        align: 'center',
      };
    } else {
      propsImg = {
        border: '1px',
        borderColor: 'lightGray',
        borderStyle: 'solid',
        minHeight: '2.5rem',
        borderRadius: '0px 15px 0 0',
      };
    }

    return (
      <FancyApp options={configFancyApps}>
        <Box padding={2}>
          <Box bgImage={bgTransparent} borderRadius="10px">
            <Link
              data-fancybox={`image-chat-${data.fileId}`}
              data-type="image"
              data-preload="true"
              href={data.fileUrl}
              data-sizes="(max-width: 600px,min-width:500px) 500px, 500px"
              data-caption={
                !Boolean(data.message) ? '' : limitText(data.message, 0, 100)
              }
            >
              <ImageRender
                {...propsImg}
                onLoad={(params) => detectOnLoad(params)}
                src={data.fileUrl}
                id={data.fileId}
                w="100%"
                h="auto"
                border="none"
                maxH="200px"
                padding={0}
                margin={0}
              />
            </Link>
          </Box>
        </Box>
      </FancyApp>
    );
  }

  let icon = <FaFile />;

  if (data.fileType === 'other') {
    if (['pdf'].includes(exFile)) {
      icon = <FaFilePdf />;
    } else if (['crt', 'csr'].includes(exFile)) {
      icon = <FaFileSignature />;
    } else if (['txt'].includes(exFile)) {
      icon = <FaFileAlt />;
    } else if (['xlsx', 'xls'].includes(exFile)) {
      icon = <FaFileExcel />;
    } else if (['csv'].includes(exFile)) {
      icon = <FaFileCsv />;
    } else if (['doc', 'docx'].includes(exFile)) {
      icon = <FaFileWord />;
    }
  } else if (data.fileType === 'video') {
    icon = <FaFileVideo />;
  } else if (data.fileType === 'archived') {
    icon = <FaFileArchive />;
  }

  const propsIcon = {
    bg: data.isSender ? 'whitePrimary' : 'primary',
    color: data.isSender ? 'primary' : 'whitePrimary',
    'aria-label': data.fileType,
    size: 'md',
    fontSize: 'xl',
    borderRadius: '100%',
    borderColor: 'transparent',
    cursor: 'pointer',
    _hover: {
      bg: data.isSender ? 'whitePrimaryHover' : 'primaryHover',
    },
  };

  const propsTooltip = {
    placement: 'top-start',
    label: data.fileName,
    'aria-label': data.fileName,
    zIndex: 'inherit',
    hasArrow: true,
    bg: 'darkGray',
  };

  const propsFileLabel = {
    fontSize: 'sm',
    fontWeight: 'bold',
    color: data.isSender ? 'whitePrimary' : 'darkSecondary',
    noOfLines: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  };

  return (
    <Flex p="3">
      <div className="chakra-box"></div>
      <Box mr="3">
        <IconButton
          {...propsIcon}
          icon={icon}
          onClick={() => handlerDownloadFile(data.fileUrl)}
        />
      </Box>
      <Box maxW="75%">
        <Tooltip {...propsTooltip}>
          <Text
            {...propsFileLabel}
            _hover={{ cursor: 'pointer' }}
            margin={0}
            padding={0}
            onClick={() => handlerDownloadFile(data.fileUrl)}
          >
            {data.fileName}
          </Text>
        </Tooltip>

        <Text
          fontSize="xs"
          fontWeight="400"
          margin={0}
          padding={0}
          color={data.isSender ? 'whitePrimaryHover' : 'gray.400'}
        >
          {data.fileType}
        </Text>
      </Box>
    </Flex>
  );
}

export default FileContent;
