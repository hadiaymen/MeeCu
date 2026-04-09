import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

// In production (Netlify), VITE_SERVER_URL must be set to your Render server URL.
// In development, Vite's proxy handles /socket.io → localhost:5000, so leave it empty.
const SERVER_URL = import.meta.env.VITE_BACKEND_URL || '';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect_error', (err) => {
      console.error('[MeeCu] Socket connection failed:', err.message);
      if (!SERVER_URL) {
        console.error(
          '[MeeCu] VITE_BACKEND_URL is not set. ' +
          'Deploy your server and set VITE_BACKEND_URL in Netlify → Site Settings → Env vars.'
        );
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
