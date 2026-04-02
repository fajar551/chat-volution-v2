import { Box, CloseButton, Flex, Image, Spacer, Text } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';

import logoQw from '../../../assets/images/logo/qwords-logo.png';

function HeaderIntro(props) {
  const { feature } = useSelector(layoutSetupSelector);
  const { closeFeature } = props;

  return (
    <>
      <Flex>
        <Box ml="-3">
          <Image
            mb={3}
            objectFit="cover"
            src={logoQw}
            alt="thumbnail-logo"
            loading="lazy"
          />
        </Box>
        <Spacer />
        <Box mr="-5">
          <CloseButton
            size="md"
            color="whitePrimary"
            backgroundColor="transparent"
            border="none"
            onClick={() => closeFeature(feature)}
            cursor="pointer"
          />
        </Box>
      </Flex>
      <Box ml="-3" py={0}>
        <Text color="whitePrimary" fontWeight="bold" fontSize="md" mt={0}>
          {/* {feature === 'home' ? 'Ada Pertanyaan?' : 'Mau tanya apa?'} */}
          {feature === 'home'
            ? 'ada pertanyaan'
            : 'Ada yang bisa dibantu?, Silakan Chat dengan Qwords Advisor kami'}
        </Text>
      </Box>
    </>
  );
}

export default HeaderIntro;
