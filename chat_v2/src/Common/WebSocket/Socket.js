import { io } from 'socket.io-client';
import ClientListens from './Clients/ClientListens';

// Use the same backend URL as backend-integration.js
const socketUrl = 'https://cvbev2.genio.id';

const Socket = new io(socketUrl, {
  withCredentials: true,
  autoConnect: false,
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
});

ClientListens(Socket);

export default Socket;
