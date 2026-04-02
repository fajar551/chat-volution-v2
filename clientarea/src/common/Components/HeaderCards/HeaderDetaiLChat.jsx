import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import React from 'react';
import { FaCompressAlt, FaEllipsisH, FaPowerOff } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, clearAllSessionsFromResolveChat } from '../../../app/Auth/AuthSlice';
import { layoutSetupSelector, updateFeatureActive } from '../../../app/Layouts/LayoutSlice';
import { clearAllStateMessageSetup, messageSelector } from '../../../app/Message/MessageSlice';
import avatarDefault from '../../../assets/images/avatar/avatar-4.png';
import { resolveChat } from '../../WebSocket/Clients/ClientActions';
import Socket from '../../WebSocket/Socket';

const CompAvatar = React.memo(
  function CompAvatar({ avatar }) {
    const fixAvatar = avatar === undefined ? avatarDefault : avatar;

    return (
      <>
        <Box ml="-3" mr="3">
          <Avatar
            name="avatar-img"
            src={fixAvatar}
            loading="lazy"
            showBorder="true"
          >
            <AvatarBadge
              borderColor="green.500"
              bg="green.500"
              boxSize="0.5em"
              borderWidth="0.25em"
            />
          </Avatar>
        </Box>
      </>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.avatar === nextProps.avatar;
  }
);

const AvatarRender = (params) => {
  const { data } = params;

  if (Boolean(data.agentId) && !Boolean(data.isTransfered)) {
    return <CompAvatar avatar={data.agentAvatar} />;
  }
};

function HeaderDetaiLChat(props) {
  const { feature } = useSelector(layoutSetupSelector);
  const { agentSessions } = useSelector(authSelector) || {};
  const { chatId } = useSelector(messageSelector);
  const { closeFeature } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();

  /* handler */
  // Function to clear connect.sid cookie
  const clearConnectSidCookie = () => {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Find and remove connect.sid cookie
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName === 'connect.sid') {
        // Remove cookie by setting it to expire in the past
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        console.log('✅ connect.sid cookie cleared');
      }
    });
  };

  const handlerResolveChat = async () => {
    const result = await resolveChat(chatId);
    if (result.success) {
      // Disconnect WebSocket first
      Socket.disconnect();
      
      // Clear connect.sid cookie to disconnect session
      clearConnectSidCookie();
      
      // Clear ALL Redux state
      dispatch(clearAllSessionsFromResolveChat());
      dispatch(clearAllStateMessageSetup());

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Close modal first
      onClose(true);

      // Force redirect to home and reload page
      dispatch(updateFeatureActive('home'));
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname;
      }, 50);
    } else {
      onClose(true);
    }
  };

  /* component */
  const HeaderTitle = (params) => {
    const { data } = params;
    if (Boolean(data.agentId) && !data.isTransfered) {
      return (
        <>
          <Tooltip
            placement="top-start"
            label={data.agentName}
            aria-label={data.agentName}
            zIndex="inherit"
            hasArrow
            bg="darkGray"
          >
            <Text
              fontSize="md"
              fontWeight="bold"
              color="whitePrimary"
              noOfLines={1}
              m={0}
              _hover={{ cursor: 'pointer' }}
            >
              {data.agentName}
            </Text>
          </Tooltip>

          <Text fontSize="sm" fontWeight="400" m={0} color="whitePrimaryHover">
            Online
          </Text>
        </>
      );
    } else if (!Boolean(data.agentId) && !data.isTransfered) {
      return (
        <>
          <Text
            fontSize="md"
            fontWeight="bold"
            color="whitePrimary"
            noOfLines={1}
            my={2}
            _hover={{ cursor: 'text' }}
          >
            Menunggu pesan diambil...
          </Text>
        </>
      );
    } else {
      return (
        <>
          <Text
            fontSize="md"
            fontWeight="bold"
            color="whitePrimary"
            noOfLines={1}
            my={2}
            _hover={{ cursor: 'text' }}
          >
            Di arahkan ke agent lain...
          </Text>
        </>
      );
    }
  };

  return (
    <>
      <Flex>
        <AvatarRender data={agentSessions} />
        <Box mr="2" mt="1">
          <HeaderTitle data={agentSessions} />
        </Box>
        <Spacer />
        <Box mr="-5" mt="-3">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              color="whitePrimary"
              backgroundColor="transparent"
              border="none"
              cursor="pointer"
              icon={<FaEllipsisH />}
              _active={{ backgroundColor: 'bgColor', color: 'darkPrimary' }}
              _hover={{
                backgroundColor: 'bgColor',
                color: 'darkPrimary',
              }}
              variant="ghost"
            />
            <MenuList>
              <MenuItem
                backgroundColor="transparent"
                border="none"
                cursor="pointer"
                onClick={() => {
                  window.__userMinimizedChat = true;
                  closeFeature(feature);
                }}
                icon={<FaCompressAlt />}
              >
                Memperkecil chat
              </MenuItem>
              {feature !== 'rate_form' && (
                <MenuItem
                  backgroundColor="transparent"
                  border="none"
                  cursor="pointer"
                  color="red.500"
                  _hover={{ color: 'whitePrimary', backgroundColor: 'red.500' }}
                  icon={<FaPowerOff />}
                  onClick={onOpen}
                >
                  Selesaikan chat
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Box>
      </Flex>
      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Selesaikan Chat?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb='1rem'>
              Apakah anda ingin menyelesaikan chat dengan kami?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' colorScheme='blue' mr={3} onClick={onClose}>
              Tutup
            </Button>
            <Button colorScheme='red' onClick={() => handlerResolveChat()}>Selesaikan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default HeaderDetaiLChat;
