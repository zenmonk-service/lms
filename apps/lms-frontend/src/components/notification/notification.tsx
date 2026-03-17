import useWebSocket from "@/hooks/use-websocket";
import { useAppSelector } from "@/store";
import { useEffect } from "react";

export default function Notification() {
  const { messages, sendMessage, isConnected } = useWebSocket(
    "ws://localhost:8083",
  );
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );

  useEffect(() => {
    if (!isConnected) return;

    sendMessage(
      JSON.stringify({
        action: "subscribe",
        organization: currentOrganization.uuid,
      }),
    );
  }, [isConnected, currentOrganization]);

  return (
    <>
      <div>hello</div>

      {messages.map((message, idx) => (
        <div key={idx}>
          <p>{idx}</p>
          <p>{message}</p>
        </div>
      ))}
    </>
  );
}
