import { MessagesSquare } from "lucide-react";

export function QueryEmptyState() {
  return (
    <section className="flex h-full flex-col items-center justify-center rounded-none border-0 bg-card sm:rounded-2xl sm:border sm:border-border p-8 text-center">
      <div className="relative mb-5">
        <div
          className="absolute inset-0 scale-150 rounded-full bg-primary/5 blur-2xl"
          aria-hidden
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessagesSquare className="h-8 w-8" />
        </div>
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        Select a query
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Choose a ticket from the list to read the conversation, reply to the
        team and update its status.
      </p>
    </section>
  );
}

export { QueryUnavailable } from "./query-unavailable";
export type { QueryUnavailableReason } from "./query-unavailable";
