import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-card p-6 rounded-lg border border-border flex flex-col justify-center">
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
    </div>
  );
}
