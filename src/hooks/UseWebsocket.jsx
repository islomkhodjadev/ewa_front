// hooks/UseWebsocket.js
import { useState, useEffect, useRef, useCallback } from "react";

const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef(null);
  const isManuallyDisconnected = useRef(false);

  const { maxReconnectAttempts = 3, reconnectDelay = 1000 } = options;

  const connect = useCallback(() => {
    try {
      console.log("WebSocket: Connecting to", url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError(event);
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code);
        setIsConnected(false);

        // Attempt to reconnect if not manually closed and within max attempts
        if (
          !isManuallyDisconnected.current &&
          reconnectCount.current < maxReconnectAttempts &&
          url // Only reconnect if we still have a URL
        ) {
          reconnectTimer.current = setTimeout(() => {
            reconnectCount.current += 1;
            connect();
          }, reconnectDelay);
        }
      };

      setSocket(ws);
    } catch (err) {
      setError(err);
    }
  }, [url, maxReconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    isManuallyDisconnected.current = true;
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }

    if (socket) {
      socket.close(1000, "Manual disconnect");
    }
  }, [socket]);

  const sendMessage = useCallback(
    (message) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
        return true;
      } else {
        console.error("WebSocket is not connected");
        return false;
      }
    },
    [socket]
  );

  // Connect when URL changes and is available
  useEffect(() => {
    if (url) {
      connect();
    } else {
      // If URL becomes null, disconnect
      disconnect();
      setIsConnected(false);
    }

    return () => {
      disconnect();
    };
  }, [url]); // Reconnect when URL changes

  return {
    socket,
    isConnected: url ? isConnected : false, // Show as disconnected if no URL
    lastMessage,
    error,
    sendMessage,
    disconnect,
    connect: () => {
      isManuallyDisconnected.current = false;
      connect();
    },
  };
};

export default useWebSocket;
