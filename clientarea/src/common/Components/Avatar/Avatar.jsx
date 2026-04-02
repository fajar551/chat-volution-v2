import { AvatarBadge } from '@chakra-ui/react';
import React from 'react';

function Avatar(props) {
  const { imgProps, useBadge, badgeProps } = props;
  return (
    <Avatar {...imgProps}>{useBadge && <AvatarBadge {...badgeProps} />}</Avatar>
  );
}

export default Avatar;
