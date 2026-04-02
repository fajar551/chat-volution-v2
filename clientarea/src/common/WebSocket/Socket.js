import { io } from 'socket.io-client';
import ClientListens from './Clients/ClientListens';
// const { REACT_APP_SERVICE_WEB_SOCKET } = process.env;
const socketUrl = 'https://cvbev2.genio.id';
console.log('Socket URL:', socketUrl);

const Socket = new io(socketUrl, {
  withCredentials: true,
  autoConnect: false, // do not connect until chat session starts
  allowEIO3: true,
  transports: ['polling'], // Start with polling only for better compatibility
  timeout: 30000,
  forceNew: true, // Force new connection to avoid conflicts
  reconnection: true, // Enable reconnection for better stability
  reconnectionAttempts: 5, // Increase attempts for better reliability
  reconnectionDelay: 2000, // Faster initial reconnection
  reconnectionDelayMax: 10000, // Max delay
  pingTimeout: 60000,
  pingInterval: 25000,
  upgrade: false, // Disable upgrade for now to avoid connection issues
  rememberUpgrade: false, // Don't remember upgrade preference
  multiplex: false, // Disable multiplexing to avoid conflicts
  // Force polling only
  forceBase64: false,
  // Disable websocket completely
  transports: ['polling'],
  // Prevent any websocket attempts
  upgrade: false,
  rememberUpgrade: false
});

ClientListens(Socket);

export default Socket;
