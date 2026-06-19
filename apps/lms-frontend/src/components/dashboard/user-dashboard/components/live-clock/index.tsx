import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border border-border shadow-none pt-6">
      <CardContent>
        <p className="text-primary tracking-tight">
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-5xl text-primary tracking-tighter tabular-nums">
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </p>
      </CardContent>
    </Card>
  );
}
