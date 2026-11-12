import { ArrowLeft, Lock, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export type QueryUnavailableReason = "not-found" | "forbidden" | "removed";

const UNAVAILABLE_COPY: Record<
  QueryUnavailableReason,
  { title: string; body: string }
> = {
  "not-found": {
    title: "Query not found",
    body: "This link points to a query that doesn't exist or is no longer available.",
  },
  forbidden: {
    title: "You don't have access",
    body: "Only the person who raised this query and its members can open it. Ask a member to add you.",
  },
  removed: {
    title: "You were removed from this query",
    body: "You're no longer a member, so you can't see this conversation anymore.",
  },
};

/** Shown for `/chats/<query_uuid>` when that query can't be shown to the signed-in user. */
export function QueryUnavailable({
  reason,
  onBack,
}: {
  reason: QueryUnavailableReason;
  onBack: () => void;
}) {
  const copy = UNAVAILABLE_COPY[reason];
  const Icon = reason === "not-found" ? SearchX : Lock;

  return (
    <section className="flex h-full flex-col items-center justify-center rounded-none border-0 bg-card p-8 text-center sm:rounded-2xl sm:border sm:border-border">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        {copy.title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {copy.body}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-5 gap-1.5 rounded-full"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        All queries
      </Button>
    </section>
  );
}
