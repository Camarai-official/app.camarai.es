"use client";

import * as React from "react";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HourRange {
  id: string;
  startDay: string;
  endDay: string;
  openTime: string;
  closeTime: string;
}

const DAYS = [
  { label: "Lunes", value: "L" },
  { label: "Martes", value: "M" },
  { label: "Miércoles", value: "X" },
  { label: "Jueves", value: "J" },
  { label: "Viernes", value: "V" },
  { label: "Sábado", value: "S" },
  { label: "Domingo", value: "D" },
];

interface OperatingHoursEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function OperatingHoursEditor({ value, onChange }: OperatingHoursEditorProps) {
  const [ranges, setRanges] = React.useState<HourRange[]>([]);

  // Parse string to ranges on mount or when value changes from outside
  React.useEffect(() => {
    if (!value) {
      setRanges([{ id: "1", startDay: "L", endDay: "V", openTime: "09:00", closeTime: "18:00" }]);
      return;
    }

    const normalizeTime = (time: string) => {
      if (!time) return "00:00";
      if (time.includes(":")) {
        const [h, m] = time.split(":");
        return `${h.padStart(2, '0')}:${(m || '00').padEnd(2, '0')}`;
      }
      return `${time.padStart(2, '0')}:00`;
    };

    try {
      // Very basic parser for "L-V: 12:00-23:00, S-D: 12:00-00:00"
      const parts = value.split(",").map((s) => s.trim());
      const parsedRanges: HourRange[] = parts.map((part, index) => {
        const [daysPart, timesPart] = part.split(":").map((s) => s.trim());
        const [startDay, endDay] = daysPart.split("-").map((s) => s.trim());
        const [openTimeRaw, closeTimeRaw] = timesPart.split("-").map((s) => s.trim());
        
        return {
          id: String(index + 1),
          startDay: startDay || "L",
          endDay: endDay || startDay || "D",
          openTime: normalizeTime(openTimeRaw),
          closeTime: normalizeTime(closeTimeRaw),
        };
      });
      setRanges(parsedRanges);
    } catch (e) {
      // If parsing fails, start fresh or keep empty
      console.error("Failed to parse hours", e);
    }
  }, [value]);

  const updateAndNotify = (newRanges: HourRange[]) => {
    setRanges(newRanges);
    const serialized = newRanges
      .map((r) => `${r.startDay}-${r.endDay}: ${r.openTime}-${r.closeTime}`)
      .join(", ");
    onChange(serialized);
  };

  const addRange = () => {
    const newRange: HourRange = {
      id: Math.random().toString(36).substr(2, 9),
      startDay: "L",
      endDay: "V",
      openTime: "12:00",
      closeTime: "22:00",
    };
    updateAndNotify([...ranges, newRange]);
  };

  const removeRange = (id: string) => {
    updateAndNotify(ranges.filter((r) => r.id !== id));
  };

  const updateRange = (id: string, updates: Partial<HourRange>) => {
    updateAndNotify(ranges.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  return (
    <div className="space-y-4">
      {ranges.map((range) => (
        <div key={range.id} className="flex flex-wrap items-center gap-3 p-4 border rounded-xl bg-muted/30 group animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 flex-grow min-w-[280px]">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={range.startDay} onValueChange={(v) => updateRange(range.id, { startDay: v })}>
              <SelectTrigger className="w-[120px] bg-background border-none shadow-sm">
                <SelectValue placeholder="Desde" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">a</span>
            <Select value={range.endDay} onValueChange={(v) => updateRange(range.id, { endDay: v })}>
              <SelectTrigger className="w-[120px] bg-background border-none shadow-sm">
                <SelectValue placeholder="Hasta" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-grow min-w-[220px]">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Input 
              type="time" 
              value={range.openTime} 
              onChange={(e) => updateRange(range.id, { openTime: e.target.value })}
              className="w-[100px] h-9 bg-background border-none shadow-sm"
            />
            <span className="text-muted-foreground">-</span>
            <Input 
              type="time" 
              value={range.closeTime} 
              onChange={(e) => updateRange(range.id, { closeTime: e.target.value })}
              className="w-[100px] h-9 bg-background border-none shadow-sm"
            />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => removeRange(range.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        className="w-full border-dashed py-6 hover:bg-primary/5 hover:border-primary/50 transition-all border-2" 
        onClick={addRange}
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir nuevo rango horario
      </Button>
    </div>
  );
}
