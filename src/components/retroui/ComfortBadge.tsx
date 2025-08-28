"use client";
import React from "react";
import { cn } from "@/lib/utils";

export interface ComfortBadgeProps {
  level: number; // 1-5
  label: string;
  explanation?: string;
  score: number;
  className?: string;
}

const palette: Record<number, string> = {
  1: "bg-destructive text-destructive-foreground border-destructive",
  2: "bg-accent text-accent-foreground border-black",
  3: "bg-muted text-muted-foreground border-black",
  4: "bg-primary text-primary-foreground border-black",
  5: "bg-primary text-black border-black animate-pulse",
};

export const ComfortBadge: React.FC<ComfortBadgeProps> = ({
  level,
  label,
  score,
  explanation,
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex flex-col gap-1 rounded-md border-2 shadow-md px-4 py-2 font-mono text-sm",
        palette[level] ?? palette[3],
        className
      )}
      title={explanation}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">Comfort {level}/5</span>
        <span className="text-xs opacity-80">score {score}</span>
      </div>
      <span className="text-xs tracking-wide uppercase">{label}</span>
    </div>
  );
};
