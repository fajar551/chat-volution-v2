import { ChakraProvider } from '@chakra-ui/react';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store';
import reportWebVitals from './reportWebVitals';

/* theme ui */
import theme from './theme';

const windowUrl = window.location.search;
const { REACT_APP_DEV } = process.env;

const params = new URLSearchParams(windowUrl);
let apiKey = '';
if (REACT_APP_DEV) {
  apiKey = '$2y$10$a/Oib1anaqfDoqocd5TfaeMY2.Tlw4KZuwV47orgLyzGkWcarzb/.';
} else {
  apiKey = params.get('api_key');

  if (!Boolean(apiKey)) {
    const el = document.getElementById('qchat-client');
    if (el) {
      const src = el.getAttribute('src');
      if (src) {
        const url = new URL(src);
        apiKey = url.searchParams.get('api_key');
      }
    }
  }

  // Set default API key jika tidak ada
  if (!Boolean(apiKey)) {
    apiKey = '$2y$10$TOqIq4oC0JGJiGuhMRRs.eLLeX73f6Bqf/f12NmN4..Zhv/VypIwi';
  }

  // Selalu buat div container meskipun tidak ada API key
  const div = document.createElement('div');
  div.id = 'root-client-chatvolution';
  document.body.appendChild(div);
}

const container = document.getElementById('root-client-chatvolution');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme} cssVarsRoot="#root-client-chatvolution">
      <Provider store={store}>
        <App apiKey={apiKey} />
      </Provider>
    </ChakraProvider>
  </React.StrictMode>
);
reportWebVitals();
