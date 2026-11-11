import { MessageSquareText } from "lucide-react";

export function QueryEmptyState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageSquareText className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No query selected</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Pick a ticket from the list to view details, status, and conversation history.
      </p>
    </div>
  );
}
