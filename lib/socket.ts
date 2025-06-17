import { io } from 'socket.io-client';

const socket = io('https://172.30.20.246:3009', {
  path: '/realtime', // 👈 importante combinar com o backend
  transports: ['websocket'], // força WebSocket (evita polling)
});

export default socket;
