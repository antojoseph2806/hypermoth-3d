import { useState, useEffect } from "react";

const StatusBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-16 py-3">
        <div className="flex items-center gap-4">
          <div className="w-16 h-px bg-primary" />
          <a href="#" className="font-body text-xs tracking-wider text-foreground hover:text-primary transition-colors">INDIA</a>
        </div>
        <span className="font-body text-xs tracking-[0.2em] text-muted-foreground">{formatted}</span>
      </div>
    </div>
  );
};

export default StatusBar;
