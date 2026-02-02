'use client';

import * as React from 'react';

import { DateRange } from "react-day-picker";

export function CostBreakdownChart({ date }: { date?: DateRange }) {
  const dynamicData = React.useMemo(() => {
    const dateFactor = date?.from ? date.from.getTime() : 1;
    return [
      { name: 'Ingredientes', value: 40 + (dateFactor % 10), color: "hsl(var(--chart-1))" },
      { name: 'Personal', value: 20 + (dateFactor % 8), color: "hsl(var(--chart-2))" },
      { name: 'Alquiler', value: 15, color: "hsl(var(--chart-3))" },
      { name: 'Suministros', value: 8 + (dateFactor % 5), color: "hsl(var(--chart-4))" },
      { name: 'Marketing', value: 3 + (dateFactor % 4), color: "hsl(var(--chart-5))" },
    ];
  }, [date]);

  const max = Math.max(...dynamicData.map(d => d.value));

  return (
    // Container: justify-center as requested ("CENTRALA")
    <div className="w-full h-full min-h-[300px] p-6 pt-0 flex flex-col justify-center gap-6">
      {dynamicData.map((item) => (
        <div key={item.name} className="flex items-center gap-4 w-full">
          {/* Label Column: Fixed width, Left Aligned */}
          <div className="w-28 shrink-0 text-sm font-medium text-muted-foreground text-left">
            {item.name}
          </div>

          {/* Bar Column: Track + Filled Bar */}
          <div className="flex-1 h-8 bg-muted/20 rounded-md relative overflow-hidden">
            <div
              className="h-full rounded-r-md transition-all duration-500 ease-out"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color
              }}
            />
          </div>

          {/* Value Column: Fixed width, Right Aligned */}
          <div className="w-16 shrink-0 text-right font-bold text-foreground">
            {item.value}%
          </div>
        </div>
      ))}
    </div>
  );
}
