import Socket from './Socket';

const socketConnect = async () => {
  await Socket.connect();
};

export default socketConnect;
