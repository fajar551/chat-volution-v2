import { Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';

/* router react */
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { authSelector } from '../../app/Auth/AuthSlice';
import socketConnect from '../../Common/WebSocket/SocketConnect';

/* css and framework css */
import Client from '../Client/Client';
import NotFound from '../NotFound/NotFound';
import Testing from '../Testing/Testing';
import Validator from '../Validator/Validator';

const Home = () => {
  socketConnect();
  const { isLogout } = useSelector(authSelector);

  useEffect(() => {
    if (isLogout) {
      const urlRedirect = `${process.env.REACT_APP_LIVE_ENDPOINT_V1}/login`;
      window.location.replace(urlRedirect);
    }
  }, [isLogout]);

  return (
    <Router>
      <Fragment>
        <Routes>
          <Route path="*" element={<NotFound title="404" />} />
          <Route path="/" element={<Validator title="Check Access" />} />
          <Route path="/testing" element={<Testing title="Check Access" />} />
          <Route path="/tes-coba" element={<Testing title="Tes Coba" />} />
          <Route
            path="/chat-with-client"
            element={<Client title="Chat With Client" />}
          >
            <Route
              path=":chatIdActive"
              element={<Client title="Chat With Client" />}
            />
          </Route>
        </Routes>
      </Fragment>
    </Router>
  );
};

export default Home;
