import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  layoutSetupSelector,
  updateFeatureActive,
  updateFeatureBefore,
} from '../../../app/Layouts/LayoutSlice';
import HeaderDetaiLChat from './HeaderDetaiLChat';
import HeaderIntro from './HeaderIntro';

function HeaderCards(props) {
  const { setIsOpenCard } = props;
  const dispatch = useDispatch();
  const { feature, deviceVersion } = useSelector(layoutSetupSelector);
  const [propsHeader, setPropsHeader] = useState({});

  const handlerCloseUpdateFeature = (feature) => {
    dispatch(updateFeatureActive('not_opened'));
    dispatch(updateFeatureBefore(feature));
    setIsOpenCard(false);
  };

  useEffect(() => {
    if (
      !['tablet', 'large_mobile', 'medium_mobile', 'small_mobile'].includes(
        deviceVersion
      )
    ) {
      setPropsHeader({
        borderRadius: '15px 15px 0 0',
      });
    } else {
      setPropsHeader({
        borderRadius: '0',
      });
    }
  }, [deviceVersion]);

  return (
    <>
      <Box
        w="100%"
        bgGradient="linear-gradient(135deg, #ff8c00 0%, #ffa64d 60%, #ffa64d 100%)"
        display="relative"
        css={{ padding: '20px 35px 20px 35px' }}
        boxSizing="border-box"
        maxHeight="130px"
        boxShadow="0 2px 8px rgba(255, 140, 0, 0.15)"
        {...propsHeader}
      >
        {['chat', 'rate_form'].includes(feature) && (
          <HeaderDetaiLChat
            closeFeature={(feature) => handlerCloseUpdateFeature(feature)}
          />
        )}

        {!['chat', 'rate_form'].includes(feature) && (
          <HeaderIntro
            closeFeature={(feature) => handlerCloseUpdateFeature(feature)}
          />
        )}
      </Box>
    </>
  );
}

export default HeaderCards;
