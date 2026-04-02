import { Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { authSelector } from '../../../app/Auth/AuthSlice';

function FormButton() {
  const [isProps, setIsProps] = useState({});
  const { isLoaderButtonLogin } = useSelector(authSelector) || {};

  useEffect(() => {
    const data = {
      type: 'submit',
      size: 'md',
      variant: 'btn-submit',
      cursor: 'pointer',
    };

    if (isLoaderButtonLogin) {
      data.isLoading = true;
      data.loadingText = 'Sedang menghubungkan';
      data.cursor = 'no-drop';
    }

    setIsProps(data);
  }, [isLoaderButtonLogin]);

  return (
    <>
      <Button {...isProps} w="100%">Hubungkan</Button>
    </>
  );
}

export default FormButton;
