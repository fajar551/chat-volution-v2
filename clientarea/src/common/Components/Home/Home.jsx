import { Box, Button, HStack, Image, Text } from '@chakra-ui/react';
import React from 'react';
import csIllustration from '../../../assets/images/illustration/customer-service.svg';
import { useDispatch } from 'react-redux';
import {
  updateFeatureActive,
  updateFeatureBefore,
} from '../../../app/Layouts/LayoutSlice';

function Home() {
  const dispatch = useDispatch();

  const handlerButtonUpdateFeature = () => {
    dispatch(updateFeatureBefore('home'));
    dispatch(updateFeatureActive('form_message'));
  };

  return (
    <>
      <Box
        m="3"
        bg="whitePrimary"
        flexGrow={12}
        minHeight="2em"
        borderRadius="16px"
        borderStyle="solid"
        borderWidth="1px"
        boxShadow="0 4px 12px rgba(255, 140, 0, 0.1)"
        borderColor="lightGray"
        padding={5}
        color="darkPrimary"
        transition="all 0.3s ease"
        _hover={{
          boxShadow: '0 6px 16px rgba(255, 140, 0, 0.15)',
        }}
      >
        <Text fontSize="lg" fontWeight="bold" textShadow="none" m={0} color="darkPrimary" mb={2}>
          Mulai chat di sini
        </Text>
        <HStack spacing="14px" mx="5" mt="3">
          <Box mr="1">
            <Image
              m={0}
              boxSize="100%"
              src={csIllustration}
              alt="thumbnail-logo"
              loading="lazy"
            />
          </Box>
          <Box>
            <Text m={0} fontSize="sm" fontWeight="normal" textShadow="none">
              Pesan Anda akan kami balas secepatnya!
            </Text>
          </Box>
        </HStack>
        <Button
          type="button"
          size="md"
          variant="btn-submit"
          mt="6"
          cursor="pointer"
          onClick={() => handlerButtonUpdateFeature()}
        >
          Hubungkan
        </Button>
      </Box>
    </>
  );
}

export default Home;
