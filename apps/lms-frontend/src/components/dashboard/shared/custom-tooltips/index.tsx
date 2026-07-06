interface CustomPieTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly payload: {
      readonly name: string;
      readonly value: number;
      readonly color?: string;
    };
  }>;
  readonly total?: number;
}

interface CustomTooltipLeavesRequestProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly payload: {
      readonly status: string;
      readonly value: number;
      readonly color?: string;
    };
  }>;
  readonly total?: number;
}

export function CustomBarTooltip(prop: any) {
  const { active, payload } = prop;
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-background p-2 text-xs font-medium shadow-md">
      <p>{` ${data.present_count} Present, ${data.on_leave_count} On Leave, ${data.late_count} Late`}</p>
    </div>
  );
}

export function CustomPieTooltip({
  active,
  payload,
  total = 0,
}: Readonly<CustomPieTooltipProps>) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;

  const percentage = total > 0 ? (data.value / total) * 100 : 0;
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-xs shadow-lg">
      <p className="mb-1 font-bold text-foreground">{data.name}</p>
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: data.color || "hsl(var(--foreground))" }}
        />
        <span className="text-muted-foreground">{data.value} employees</span>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {percentage.toFixed(1)}% of total
      </p>
    </div>
  );
}

export function CustomLeaveRequestPieTooltip({
  active,
  payload,
  total = 0,
}: Readonly<CustomTooltipLeavesRequestProps>) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;

  const percentage = total > 0 ? (data.value / total) * 100 : 0;
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-xs shadow-lg">
      <p className="mb-1 font-bold text-foreground">{data.status}</p>
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: data.color || "hsl(var(--foreground))" }}
        />
        <span className="text-muted-foreground">{data.value} requests</span>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {percentage.toFixed(1)}% of total
      </p>
    </div>
  );
}
