import useWebSocket from "@/hooks/use-websocket";
import { useAppSelector } from "@/store";
import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type ParsedNotification = {
  id: string;
  title: string;
  summary?: string;
  badge?: string;
  meta: Array<{ label: string; value: string }>;
  rawJson?: string;
};

const TITLE_KEYS = ["title", "subject", "event", "action", "type"];
const MESSAGE_KEYS = ["message", "text", "body", "description", "detail", "details"];

const clamp = (value: string, max = 180) =>
  value.length > max ? `${value.slice(0, max)}...` : value;

const pickFirstString = (
  data: Record<string, unknown>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

const formatValue = (value: unknown) => {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const parseNotification = (raw: string, idx: number): ParsedNotification => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      id: `${idx}-${raw}`,
      title: "Notification",
      summary: clamp(raw),
      meta: [],
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      id: `${idx}-${raw}`,
      title: "Notification",
      summary: clamp(formatValue(parsed)),
      meta: [],
    };
  }

  if (Array.isArray(parsed)) {
    return {
      id: `${idx}-${raw}`,
      title: "Notification Batch",
      summary: `Received ${parsed.length} items.`,
      meta: [],
      rawJson: JSON.stringify(parsed, null, 2),
    };
  }

  const data = parsed as Record<string, unknown>;
  const title = pickFirstString(data, TITLE_KEYS) || "Notification";
  const summary = pickFirstString(data, MESSAGE_KEYS);
  const badge = pickFirstString(data, ["severity", "level", "status", "type"]);

  const ignoredKeys = new Set([...TITLE_KEYS, ...MESSAGE_KEYS]);
  const meta: Array<{ label: string; value: string }> = [];

  Object.entries(data).forEach(([key, value]) => {
    if (ignoredKeys.has(key)) return;
    if (value === undefined) return;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      meta.push({ label: key, value: formatValue(value) });
    }
  });

  const rawJson =
    summary || meta.length > 0 ? undefined : JSON.stringify(data, null, 2);

  return {
    id: `${idx}-${title}`,
    title,
    summary: summary ? clamp(summary) : undefined,
    badge,
    meta,
    rawJson,
  };
};

export default function Notification() {
  const { messages, sendMessage, isConnected } = useWebSocket(
    "ws://localhost:8083",
  );
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isConnected || !currentOrganization?.uuid) return;

    sendMessage(
      JSON.stringify({
        action: "subscribe",
        organization: currentOrganization.uuid,
      }),
    );

    return () => {
      sendMessage(
        JSON.stringify({
          action: "unsubscribe",
          organization: currentOrganization.uuid,
        }),
      );
    };
  }, [isConnected, currentOrganization?.uuid, sendMessage]);

  const parsedMessages = useMemo(() => {
    return messages
      .map((message, idx) => parseNotification(message, idx))
      .slice()
      .reverse();
  }, [messages]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle notifications"
        >
          <Bell className="size-5" />
          {messages.length > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {messages.length > 99 ? "99+" : messages.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {isConnected ? "Live updates" : "Disconnected"}
            </p>
          </div>
          <Badge variant={isConnected ? "success" : "secondary"}>
            {isConnected ? "Online" : "Offline"}
          </Badge>
        </div>
        <div className="max-h-[360px] overflow-y-auto px-4 py-3">
          {parsedMessages.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {parsedMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-lg border bg-card p-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{message.title}</p>
                      {message.summary ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {message.summary}
                        </p>
                      ) : null}
                    </div>
                    {message.badge ? (
                      <Badge variant="secondary">{message.badge}</Badge>
                    ) : null}
                  </div>
                  {message.meta.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {message.meta.map((item) => (
                        <div key={`${message.id}-${item.label}`}>
                          <span className="font-medium text-foreground">
                            {item.label}:
                          </span>{" "}
                          {item.value}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {message.rawJson ? (
                    <pre className="mt-3 max-h-40 overflow-x-auto rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                      {message.rawJson}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
