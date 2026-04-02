import { Text } from '@chakra-ui/react';
import React from 'react';
import { capitalizeFirstLetter } from '../../../Utils/helpers';

export default function LabelChat(props) {
  const { objAttr, nameLabel } = props;
  return <Text {...objAttr}>{capitalizeFirstLetter(nameLabel)}</Text>;
}
