import { Button, Divider, Flex, Img, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import icTele from '../../../assets/images/icons/ic-telegram.svg';
import icWa from '../../../assets/images/icons/ic-whatsapp.svg';

function ButtonSosmed(props) {
  const { data } = props;
  const handlerOpenSosmed = (url) => {
    window.open(url);
  };

  const CompButton = (params) => {
    const { icButton, buttonName, url } = params;
    return (
      <Button
        type="button"
        size="sm"
        variant="btn-social-media"
        cursor="pointer"
        onClick={() => handlerOpenSosmed(url)}
      >
        <Img src={icButton} mr="2" />
        {buttonName}
      </Button>
    );
  };

  if (data.length > 0) {
    return (
      <>
        <Flex mx="3" mt="1">
          <Divider orientation="horizontal" mt="3" borderColor="primary" />
          <Text fontSize="sm" mx="2" color="primary" my={0}>
            Atau
          </Text>
          <Divider orientation="horizontal" mt="3" borderColor="primary" />
        </Flex>
        <VStack as="form" mx="3" my="3">
          {data.map((val, key) => {
            if (val.chat_channel_id === 2) {
              const url = `https://api.whatsapp.com/send?phone=62817437111&text=Halo!`;
              return (
                <CompButton
                  icButton={icWa}
                  key={key}
                  url={url}
                  buttonName="Chat via Whatsapp"
                />
              );
            } else {
              const url = `https://t.me/${val.phone_number}`;
              return (
                <CompButton
                  icButton={icTele}
                  key={key}
                  url={url}
                  buttonName="Chat via Telegram"
                />
              );
            }
          })}
        </VStack>
      </>
    );
  }
}

export default ButtonSosmed;
