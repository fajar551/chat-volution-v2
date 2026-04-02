import Socket from './Socket';

const socketConnect = async () => {
  return new Promise((resolve, reject) => {
    // If already connected, resolve immediately
    if (Socket.connected) {
      resolve();
      return;
    }

    // Set up one-time connect listener
    const onConnect = () => {
      Socket.off('connect', onConnect);
      Socket.off('connect_error', onError);
      resolve();
    };

    const onError = (error) => {
      Socket.off('connect', onConnect);
      Socket.off('connect_error', onError);
      reject(error);
    };

    Socket.once('connect', onConnect);
    Socket.once('connect_error', onError);

    // Start connection
    Socket.connect();

    // Timeout after 10 seconds
    setTimeout(() => {
      Socket.off('connect', onConnect);
      Socket.off('connect_error', onError);
      if (!Socket.connected) {
        reject(new Error('Socket connection timeout'));
      }
    }, 10000);
  });
};

export default socketConnect;
