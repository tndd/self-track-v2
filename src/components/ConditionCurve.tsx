"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ConditionPoint {
  timestamp: string;
  condition: number;
}

interface ConditionCurveProps {
  points: ConditionPoint[];
}

export default function ConditionCurve({ points }: ConditionCurveProps) {
  if (points.length === 0) return null;

  let chartData = points.map((p) => {
    const date = new Date(p.timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return {
      time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
      timeValue: hours * 60 + minutes,
      condition: p.condition,
    };
  });

  // Recharts AreaChart requires at least 2 points to draw an area/line.
  if (chartData.length === 1) {
    const single = chartData[0];
    const prevTimeValue = Math.max(0, single.timeValue - 30);
    const nextTimeValue = Math.min(24 * 60, single.timeValue + 30);
    
    const formatTime = (val: number) => {
      const h = Math.floor(val / 60);
      const m = val % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    chartData = [
      { ...single, time: formatTime(prevTimeValue), timeValue: prevTimeValue },
      single,
      { ...single, time: formatTime(nextTimeValue), timeValue: nextTimeValue },
    ];
  }

  const gradientAreaId = "conditionAreaGradient";
  const gradientLineId = "conditionLineGradient";

  return (
    <div className="glass-panel rounded-3xl p-4 pb-2">
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            {/* Area Fill Gradient: Match Timeline Colors (5=Cyan, 4=Green, 3=Slate, 2=Orange, 1=Red) */}
            <linearGradient id={gradientAreaId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />   {/* 5: Cyan/Blue */}
              <stop offset="25%" stopColor="#10b981" stopOpacity={0.3} />   {/* 4: Green */}
              <stop offset="50%" stopColor="#64748b" stopOpacity={0.15} />  {/* 3: Slate */}
              <stop offset="75%" stopColor="#f97316" stopOpacity={0.3} />   {/* 2: Orange */}
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />  {/* 1: Red */}
            </linearGradient>
            
            {/* Stroke Line Gradient: Match Timeline Colors */}
            <linearGradient id={gradientLineId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />   {/* 5: Cyan/Blue */}
              <stop offset="25%" stopColor="#10b981" />   {/* 4: Green */}
              <stop offset="50%" stopColor="#64748b" />   {/* 3: Slate */}
              <stop offset="75%" stopColor="#f97316" />   {/* 2: Orange */}
              <stop offset="100%" stopColor="#ef4444" />  {/* 1: Red */}
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine
            y={3}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="condition"
            stroke={`url(#${gradientLineId})`}
            strokeWidth={3}
            fill={`url(#${gradientAreaId})`}
            isAnimationActive={true}
            dot={{
              r: 4,
              fill: "#0f172a",
              stroke: "#94a3b8",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "#f8fafc",
              stroke: "#64748b",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
