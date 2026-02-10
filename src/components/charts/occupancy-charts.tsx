
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type OccupancyData = {
  name: string;
  value: number;
  color: string;
  percentage: number;
};

type OccupancyChartProps = {
  data: OccupancyData[];
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (payload.percentage < 5) return null;

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">{data.name}</span>
                    <span className="text-sm" style={{ color: data.color }}>
                        Aforo: {data.value} ({data.percentage.toFixed(1)}%)
                    </span>
                </div>
            </div>
        );
    }
    return null;
};


const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
        <ul className="w-1/2 space-y-2">
            {payload.map((entry: any, index: number) => (
                 <li key={`item-${index}`} className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground truncate flex-1">{entry.value}</span>
                  <span className="font-semibold text-foreground ml-2">{entry.payload.payload.percentage.toFixed(1)}%</span>
                </li>
            ))}
        </ul>
    );
};


export function OccupancyChart({ data }: OccupancyChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center">No hay datos de aforo disponibles.</p>;
  }
  
  return (
    <div className="w-full h-[200px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius="100%"
            innerRadius="70%"
            fill="hsl(var(--primary))"
            dataKey="value"
            stroke="hsl(var(--card))"
            strokeWidth={4}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
