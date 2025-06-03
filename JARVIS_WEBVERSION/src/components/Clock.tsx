import { useState, useEffect } from "react";
import { format } from "date-fns";

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-center">
      <div className="text-4xl font-bold">{format(time, "HH:mm:ss")}</div>
      <div className="text-gray-400">{format(time, "EEEE, MMMM d, yyyy")}</div>
    </div>
  );
}
