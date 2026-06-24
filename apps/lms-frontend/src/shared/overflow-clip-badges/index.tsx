import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const VISIBLE_COUNT = 2;

interface IProps {
    labels: string[];
}

export const OverflowClipBadges = ({ labels }: IProps) => {
  const visible = labels.slice(0, VISIBLE_COUNT);
  const overflow = labels.slice(VISIBLE_COUNT);

  return (
    <div className="flex gap-1 flex-wrap">
      {visible.map((label, idx) => (
        <Badge key={`${label}-${idx}`} variant="outline" className="rounded-sm">
          {label}
        </Badge>
      ))}

      {overflow.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="cursor-pointer" variant="outline">
              + {overflow.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent align="start" className="max-w-80">
            <div className="flex flex-wrap gap-1">
              {overflow.map((label, idx) => (
                <span key={`${label}-${idx}`} className="text-xs">
                  {label}
                  {idx < overflow.length - 1 && ", "}
                </span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};