"use client";

import { QueryChatBoard } from "@/components/chats/query";

/**
 * The board lives in the layout so it stays mounted while the URL switches between
 * `/chats` (list) and `/chats/<query_uuid>` (an open query): no list refetch, and
 * filters, search and scroll position are kept. The pages only define the URLs.
 */
export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <QueryChatBoard />
      {children}
    </>
  );
}
