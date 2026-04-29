import * as React from "react";
import { cn } from "@/lib/utils";

export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (value: string) => void; length?: number; }) {
  const inputs = Array.from({ length });

  return (
    <div className="flex gap-2">
      {inputs.map((_, index) => {
        const char = value[index] || "";
        return (
          <input
            key={index}
            value={char}
            onChange={(event) => {
              const next = value.split("");
              next[index] = event.target.value.slice(-1);
              onChange(next.join("").slice(0, length));
            }}
            className={cn(
              "h-12 w-12 rounded-xl border border-white/20 bg-white/5 text-center text-lg text-white",
            )}
            maxLength={1}
          />
        );
      })}
    </div>
  );
}
