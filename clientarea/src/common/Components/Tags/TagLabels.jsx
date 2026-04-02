import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Center, Link, Text } from '@chakra-ui/react';

function TagLabels() {
  return (
    <>
      <Box
        w="100%"
        bg="bgColor"
        p={3}
        boxSizing="border-box"
        borderRadius="0 0 15px 15px"
        borderTopStyle="solid"
        borderTopWidth="1px"
        boxShadow="lg"
        borderTopColor="lightGray"
      >
        <Center>
          <Text fontSize="sm" color="normalGray" m={0}>
            Powered By:{' '}
            <Link href="https://www.qwords.com/" isExternal color="primary">
              Qwords <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
        </Center>
      </Box>
    </>
  );
}

export default TagLabels;
