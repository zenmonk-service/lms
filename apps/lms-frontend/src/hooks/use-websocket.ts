import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketResult {
  messages: string[];
  sendMessage: (message: string) => void;
  isConnected: boolean;
  receiveMessage: (
    type: string,
    callback: (message: any) => void,
  ) => () => void;
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

  const receiveMessage = useCallback(
    (type: string, callback: (message: any) => void) => {
      if (!ws.current) return () => {};

      const handler = async (event: MessageEvent) => {
        let payload: any;

        // Ignore heartbeat blobs
        if (event.data instanceof Blob) {
          if (event.data.size === 1) return;

          try {
            payload = JSON.parse(await event.data.text());
          } catch (err) {
            console.error("Invalid Blob JSON:", err);
            return;
          }
        } else {
          try {
            payload = JSON.parse(event.data);
          } catch (err) {
            console.error("Invalid JSON:", err);
            return;
          }
        }
        if (payload?.content?.type !== type) return;
        callback(payload);
      };

      ws.current.addEventListener("message", handler);

      return () => {
        ws.current?.removeEventListener("message", handler);
      };
    },
    [],
  );

  return { messages, sendMessage, isConnected, receiveMessage };
};

export default useWebSocket;
