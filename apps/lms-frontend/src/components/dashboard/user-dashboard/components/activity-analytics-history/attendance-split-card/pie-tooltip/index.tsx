interface PieTooltipDatum {
  name: string;
  value: number;
  color?: string;
}

interface IProps {
  active?: boolean;
  payload?: { payload: PieTooltipDatum }[];
  total?: number;
}

export function CustomPieTooltip({ active, payload, total = 0 }: IProps) {
  if (!active || !payload?.[0]) return null;

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
        <span className="text-muted-foreground">{data.value} days</span>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {percentage.toFixed(1)}% of total
      </p>
    </div>
  );
}