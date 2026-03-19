import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketResult {
  messages: string[];
  sendMessage: (message: string) => void;
  isConnected: boolean;
}

const HEARTBEAT_VALUE = 1;
const HEARTBEAT_TIMEOUT = 6000; // 5s + buffer

const useWebSocket = (url: string): UseWebSocketResult => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const pingTimeout = useRef<NodeJS.Timeout | null>(null);

  const resetHeartbeat = useCallback(() => {
    if (pingTimeout.current) {
      clearTimeout(pingTimeout.current);
    }

    pingTimeout.current = setTimeout(() => {
      console.log("❌ Heartbeat timeout → closing socket");
      ws.current?.close();
    }, HEARTBEAT_TIMEOUT);
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
      resetHeartbeat();
    };

    ws.current.onmessage = async (event: MessageEvent) => {
      const data = event.data;

      if (data instanceof Blob) {
        const buffer = await data.arrayBuffer();
        const view = new Uint8Array(buffer);

        if (view[0] === HEARTBEAT_VALUE) {
          ws.current?.send(view);

          resetHeartbeat();
          return;
        }
      }

      setMessages((prev) => [...prev, data]);
    };

    ws.current.onclose = () => {
      console.log("🔌 WebSocket closed");
      setIsConnected(false);

      if (pingTimeout.current) {
        clearTimeout(pingTimeout.current);
      }
    };

    ws.current.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    return () => {
      ws.current?.close();
      if (pingTimeout.current) {
        clearTimeout(pingTimeout.current);
      }
    };
  }, [url, resetHeartbeat]);

  const sendMessage = useCallback((message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  }, []);

  return { messages, sendMessage, isConnected };
};

export default useWebSocket;