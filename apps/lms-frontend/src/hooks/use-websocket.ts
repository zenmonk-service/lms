import { useEffect, useRef, useState } from "react";

interface UseWebSocketResult {
  messages: string[];
  sendMessage: (message: string) => void;
  isConnected: boolean;
}

const useWebSocket = (url: string): UseWebSocketResult => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.current.onmessage = (event: MessageEvent) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  return { messages, sendMessage, isConnected };
};

export default useWebSocket;