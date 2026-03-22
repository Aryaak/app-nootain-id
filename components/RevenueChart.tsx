"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  date: string;
  omset: number;
  bersih: number;
}

interface RevenueChartProps {
  data: ChartData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const formatCurrency = (value: any) => {
    const num = Number(value || 0);
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}jt`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}rb`;
    return num.toLocaleString("id-ID");
  };

  return (
    <div className="w-full h-64 md:h-80 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-l-4 border-l-primary border-y border-r border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-bold text-zinc-800 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-primary text-sm"></i>
          Statistik Penjualan
        </h2>
        <div className="flex gap-3 text-[10px] md:text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="text-zinc-500 font-medium">Omset</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-zinc-500 font-medium">Bersih</span>
          </div>
        </div>
      </div>
      
      <div className="w-full h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBersih" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: '600'
              }}
              formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString("id-ID")}`]}
            />
            <Area 
              type="monotone" 
              dataKey="omset" 
              name="Omset"
              stroke="var(--color-primary, #6366f1)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorOmset)" 
            />
            <Area 
              type="monotone" 
              dataKey="bersih" 
              name="Bersih"
              stroke="#22c55e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorBersih)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
