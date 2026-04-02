import { Button } from '@chakra-ui/react';
import React from 'react';
import styles from './BottomButton.module.css';

function BottomButton(props) {
  const { featureBefore, openFeature } = props;

  return (
    <>
      <Button
        type="button"
        variant="btn-bottom-cevo"
        zIndex="99999999999"
        cursor="pointer"
        w={{
          base: '50px',
          sm: '50px',
          md: '50px',
          lg: '60px',
          xl: '60px',
        }}
        h={{
          base: '50px',
          sm: '50px',
          md: '50px',
          lg: '60px',
          xl: '60px',
        }}
        onClick={() => openFeature(featureBefore)}
      >
        <div className={styles.icon}></div>
      </Button>
    </>
  );
}

export default BottomButton;
