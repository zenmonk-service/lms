import { Progress } from "@/components/ui/progress";

interface Props {
  totalPresent: number;
  totalAbsent: number;
}

function getPercentage(partial: number, total: number) {
  if (total === 0) return 0;
  return (partial / total) * 100;
}

export function MonthlyStats({ totalPresent, totalAbsent }: Props) {
  const percentage = getPercentage(totalPresent, totalPresent + totalAbsent);

  return (
    <div className="flex-1 bg-card rounded-lg border border-border p-6 flex flex-col gap-2 mb-3">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Monthly Efficiency</h3>
          <span className="text-3xl font-bold">
            {percentage.toFixed(2)}
            <span className="text-sm ml-1">%</span>
          </span>
        </div>
        <Progress value={percentage} />
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold">Present</span>
          <span className="text-sm font-bold">{totalPresent} Days</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs font-semibold">Absent</span>
          <span className="text-sm font-bold text-muted-foreground">
            {totalAbsent} Days
          </span>
        </div>
      </div>
    </div>
  );
}
