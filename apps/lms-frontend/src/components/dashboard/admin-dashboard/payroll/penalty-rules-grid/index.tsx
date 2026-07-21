import { Card } from "@/components/ui/card";
import React from "react";
import PenaltyCard from "./penalty-card";

const PenaltyRulesGrid = () => {
  return (
    <Card className="shadow-none rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PenaltyCard
          title="Absence Penalty Ratio"
          description="The ratio of absence penalty applied to the employee's salary based on the number of days absent."
          penalty="2 Days"
        />
        <PenaltyCard
          title="Late Penalty Ratio"
          description="The ratio of late penalty applied to the employee's salary based on the number of days late."
          penalty="0.25 Day"
        />
        <PenaltyCard
          title="Early Departure Penalty Ratio"
          description="The ratio of early departure penalty applied to the employee's salary based on the number of days early departure."
          penalty="0.25 Day"
        />
      </div>
    </Card>
  );
};

export default PenaltyRulesGrid;
