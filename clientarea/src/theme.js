import { extendTheme } from '@chakra-ui/react';
import '@fontsource/inter';

const theme = {
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  colors: {
    primary: '#ff8c00',
    primaryHover: '#e67e00',
    primaryLight: '#ffb84d',
    whitePrimary: '#FFFFFF',
    whitePrimaryHover: '#F5F5F5',
    bgColor: '#FFFFFF',
    darkPrimary: '#1a1a1a',
    darkSecondary: '#2d2d2d',
    darkThird: '#404040',
    normalGray: '#B7B7B7',
    lightGray: '#E5E5E5',
    darkGray: '#666666',
  },
  components: {
    Button: {
      variants: {
        'btn-bottom-cevo': {
          bg: 'whitePrimary',
          m: '1rem',
          p: '10px',
          right: '1%',
          borderRadius: '50%',
          pos: 'fixed',
          bottom: '10px',
          border: '2px solid',
          borderColor: 'primary',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(255, 140, 0, 0.3)',
          transition: 'all 0.3s ease',
          _hover: {
            bg: 'whitePrimaryHover',
            borderColor: 'primaryHover',
            boxShadow: '0 6px 20px rgba(255, 140, 0, 0.4)',
            transform: 'scale(1.1)',
          },
        },
        'btn-submit': {
          bg: 'primary',
          p: '12px',
          borderRadius: '12px',
          border: 'none',
          borderColor: 'primary',
          width: '100%',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '15px',
          color: 'whitePrimary',
          boxShadow: '0 4px 12px rgba(255, 140, 0, 0.3)',
          transition: 'all 0.3s ease',
          _hover: {
            bg: 'primaryHover',
            boxShadow: '0 6px 16px rgba(255, 140, 0, 0.4)',
            transform: 'translateY(-2px)',
            _disabled: {
              bg: 'primaryHover',
              opacity: '0.5',
              transform: 'none',
            },
          },
          _active: {
            transform: 'translateY(0px)',
          },
        },
        'btn-social-media': {
          bg: 'whitePrimary',
          borderRadius: '12px',
          border: '1.5px solid',
          borderColor: 'lightGray',
          width: '100%',
          textAlign: 'center',
          fontWeight: '500',
          fontSize: '14px',
          color: 'darkPrimary',
          transition: 'all 0.2s ease',
          _hover: {
            bg: 'whitePrimaryHover',
            borderColor: 'primary',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(255, 140, 0, 0.15)',
          },
        },
      },
    },
    Devider: {
      'line-cevo': {
        orientation: 'horizontal',
        color: 'lightGray',
        borderStyle: 'solid',
      },
    },
  },
  styles: {},
};

export default extendTheme(theme);
