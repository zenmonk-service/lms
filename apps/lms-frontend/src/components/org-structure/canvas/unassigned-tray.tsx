"use client";

import { useMemo, useState } from "react";
import { GripVertical, Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/utils/get-initials";
import type { Person } from "./layout";

export const UNASSIGNED_DRAG_TYPE = "application/x-org-person";

/**
 * People not on the canvas (no manager and no reports, or in the Teams view, no
 * team); drag them onto a card, a team, or the canvas.
 */
export default function UnassignedTray({
  people,
  editable,
  onClose,
  onSelect,
  title = "Unassigned",
  hint = "Drag onto a manager, or onto the canvas.",
  readOnlyHint = "No manager and no reports.",
}: {
  people: Person[];
  editable: boolean;
  onClose: () => void;
  onSelect: (userId: string) => void;
  title?: string;
  hint?: string;
  readOnlyHint?: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? people.filter((p) => p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term))
      : people;
  }, [people, search]);

  return (
    <div className="flex max-h-full w-72 flex-col overflow-hidden rounded-xl border bg-background shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b p-3 pb-2">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{editable ? hint : readOnlyHint}</p>
        </div>
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose} aria-label="Close">
          <X className="size-4" />
        </Button>
      </div>
      <div className="relative p-2">
        <Search className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="h-8 pl-7 text-sm" />
      </div>
      <ul className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 && (
          <li className="py-6 text-center text-xs text-muted-foreground">
            {people.length ? "No match." : "Everyone is placed."}
          </li>
        )}
        {filtered.map((person) => (
          <li
            key={person.user_id}
            draggable={editable}
            onDragStart={(event) => {
              event.dataTransfer.setData(UNASSIGNED_DRAG_TYPE, person.user_id);
              event.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => onSelect(person.user_id)}
            className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-muted active:cursor-grabbing"
          >
            {editable && <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />}
            <Avatar className="size-7 rounded-md border">
              <AvatarImage src={person.image || ""} alt={person.name} />
              <AvatarFallback className="rounded-md text-[10px]">{getInitials(person.name)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{person.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{person.role?.name ?? person.email}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
