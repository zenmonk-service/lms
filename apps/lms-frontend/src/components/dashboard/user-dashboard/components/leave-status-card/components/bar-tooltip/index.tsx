interface BarTooltipDatum {
  status: string;
  total: number;
}

interface IProps {
  active?: boolean;
  payload?: { payload: BarTooltipDatum }[];
}

export function CustomBarTooltip({ active, payload }: IProps) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background p-2 text-xs font-medium shadow-md">
      <p>{`${data.status}: ${data.total} Request(s)`}</p>
    </div>
  );
}