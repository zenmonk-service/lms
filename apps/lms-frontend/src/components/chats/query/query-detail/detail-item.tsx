import React from "react";

/** One label/value pair in the collapsible query details. */
export function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
