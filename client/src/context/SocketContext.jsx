import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      setConnected(true);
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("[Socket] Disconnected");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
