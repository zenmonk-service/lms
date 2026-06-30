import { Card } from "@/components/ui/card";
import React from "react";

interface IProps {
    title: string;
    description: string;
    penalty: string;
}

const PenaltyCard = ({
    title,
    description,
    penalty,
}: IProps) => {
  return (
    <Card className="bg-background shadow-none rounded-sm p-4 gap-2">
      <p className="font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>

      <div className="border border-border bg-card rounded-md p-1">
        <p className="font-bold text-center">{penalty}</p>
      </div>
    </Card>
  );
};

export default PenaltyCard;
