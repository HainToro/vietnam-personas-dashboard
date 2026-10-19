import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DistributionItem } from "@/types/analytics";

interface EducationMaritalSectionProps {
  educationLevel: DistributionItem[];
  maritalStatus: DistributionItem[];
}

const MARITAL_COLORS = ["#6366f1", "#f59e0b", "#94a3b8", "#ec4899"];

export const EducationMaritalSection: React.FC<EducationMaritalSectionProps> = ({
  educationLevel,
  maritalStatus,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cột 1: Horizontal Bar Chart - Trình độ học vấn */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Trình độ học vấn
            </h3>
            <p className="text-xs text-slate-500">Phân bố bằng cấp và trình độ chuyên môn</p>
          </div>
          <span className="text-xs font-mono text-slate-400">education_level</span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={educationLevel}
              margin={{ top: 5, right: 30, left: 35, bottom: 5 }}
            >
              <XAxis
                type="number"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                width={125}
                tickLine={false}
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
              <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cột 2: Donut Chart - Tình trạng hôn nhân */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Tình trạng hôn nhân
              </h3>
              <p className="text-xs text-slate-500">Cấu trúc gia đình và lối sống cá nhân</p>
            </div>
            <span className="text-xs font-mono text-slate-400">marital_status</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={maritalStatus}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {maritalStatus.map((_, index) => (
                    <Cell
                      key={`marital-cell-${index}`}
                      fill={MARITAL_COLORS[index % MARITAL_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${Number(value).toLocaleString()} personas (${item.payload.percentage}%)`,
                    name,
                  ]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
          {maritalStatus.slice(0, 4).map((m, i) => (
            <div key={m.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MARITAL_COLORS[i % MARITAL_COLORS.length] }}
                />
                <span className="truncate">{m.name}</span>
              </div>
              <strong className="text-slate-800 dark:text-slate-200 ml-1">{m.percentage}%</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
