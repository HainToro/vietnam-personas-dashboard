import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DistributionItem } from "@/types/analytics";

interface GeographyOccupationSectionProps {
  regionDistribution: DistributionItem[];
  topOccupations: DistributionItem[];
  onSelectRegion?: (regionName: string) => void;
}

export const GeographyOccupationSection: React.FC<GeographyOccupationSectionProps> = ({
  regionDistribution,
  topOccupations,
  onSelectRegion,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cột 1: Phân bố Địa lý 6 Vùng miền */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Phân bố Địa lý 6 Vùng miền
            </h3>
            <p className="text-xs text-slate-500">6 vùng kinh tế - xã hội chính thức của Việt Nam</p>
          </div>
          <span className="text-xs font-mono text-slate-400">region</span>
        </div>

        <div className="h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={regionDistribution}
              margin={{ top: 10, right: 10, left: -10, bottom: 45 }}
            >
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                interval={0}
                angle={-25}
                textAnchor="end"
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                formatter={(val: any, _: any, item: any) => [
                  `${Number(val).toLocaleString()} personas (${item.payload.percentage}%)`,
                  "Số lượng",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar
                dataKey="count"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                onClick={(entry: any) => onSelectRegion && onSelectRegion(entry.name)}
                className="cursor-pointer hover:opacity-80 transition"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cột 2: Top Nghề nghiệp phổ biến */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Top Nghề nghiệp phổ biến nhất
              </h3>
              <p className="text-xs text-slate-500">Đặc trưng công việc và sinh kế cộng đồng</p>
            </div>
            <span className="text-xs font-mono text-slate-400">occupation</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {topOccupations.slice(0, 10).map((occ, i) => (
              <div
                key={occ.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                      i === 0
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        : i === 1
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        : i === 2
                        ? "bg-amber-700/10 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {occ.name}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {occ.count.toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-[11px] block">
                    ({occ.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span>Tổng hợp từ 15 nhóm ngành nghề có tỷ trọng cao nhất</span>
        </div>
      </div>
    </div>
  );
};
