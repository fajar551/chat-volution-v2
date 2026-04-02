import React from 'react';
import { useSelector } from 'react-redux';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';
import InputMessage from '../InputMessage/InputMessage';
import TagLabels from '../Tags/TagLabels';

function Footers() {
  const { feature } = useSelector(layoutSetupSelector);

  return (
    <>
      {['chat'].includes(feature) && <InputMessage />}
      {!['chat'].includes(feature) && <TagLabels />}
    </>
  );
}

export default Footers;
