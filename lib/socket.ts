import { io } from 'socket.io-client';

const socket = io('https://apoema.grupoativa.net', {
  path: '/realtime',
  transports: ['websocket'],
});


export default socket;
