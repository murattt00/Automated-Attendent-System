import { io } from 'socket.io-client';

export const useSocket = () => {
  const config = useRuntimeConfig();
  const socket = ref(null);

  const connect = () => {
    if (!socket.value) {
      socket.value = io(config.public.socketUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socket.value.on('connect', () => {
        console.log('✅ Socket connected:', socket.value.id);
      });

      socket.value.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      socket.value.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return socket.value;
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  const emit = (event, data) => {
    if (socket.value) {
      socket.value.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket.value) {
      socket.value.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket.value) {
      socket.value.off(event, callback);
    }
  };

  return {
    socket,
    connect,
    disconnect,
    emit,
    on,
    off
  };
};
