"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface HeartRateData {
  id: number;
  bpm: number;
  timestamp: string;
}

interface ChartProps {
  data: HeartRateData[];
  isLive?: boolean;
}

export default function HeartRateChart({ data, isLive }: ChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data.map((d, index) => ({
    index,
    bpm: d.bpm,
    time: new Date(d.timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }));

  // Tampilkan 60 data terakhir agar grafik tidak terlalu padat
  const displayData = isLive ? chartData.slice(-60) : chartData;

  if (!mounted) {
    return <div className="chart-container skeleton" style={{ height: 300 }}></div>;
  }

  if (displayData.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "2rem" }}>
        <div className="empty-state-icon">📡</div>
        <h3>Menunggu Data...</h3>
        <p>
          {isLive
            ? "Pastikan Arduino sudah terhubung dan mengirim data BPM."
            : "Tidak ada data BPM yang tersimpan pada sesi ini."}
        </p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={displayData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(51, 65, 85, 0.5)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={{ stroke: "#334155" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[40, 160]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={{ stroke: "#334155" }}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 10,
              color: "#f1f5f9",
              fontSize: 13,
            }}
            formatter={(value: any) => [`${value} BPM`, "Detak Jantung"]}
            labelFormatter={(label: any) => `Waktu: ${label}`}
          />
          {/* Reference lines for normal BPM range */}
          <ReferenceLine
            y={60}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={100}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="bpm"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#ef4444",
              stroke: "#1e293b",
              strokeWidth: 2,
            }}
            isAnimationActive={!isLive}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
