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
import { AgeDistributionItem, DistributionItem, MetricOverview } from "@/types/analytics";

interface DemographicsSectionProps {
  ageDistribution: AgeDistributionItem[];
  zoneDistribution: DistributionItem[];
  metrics: MetricOverview;
}

const GENDER_COLORS = ["#3b82f6", "#ec4899"];
const ZONE_COLORS = ["#10b981", "#f59e0b"];

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({
  ageDistribution,
  zoneDistribution,
  metrics,
}) => {
  const genderData = [
    { name: "Nam giới", count: metrics.male_count, percentage: metrics.male_percentage },
    { name: "Nữ giới", count: metrics.female_count, percentage: metrics.female_percentage },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột 1: Donut Chart Giới tính & Khu vực */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Dân số theo Giới tính
              </h3>
              <p className="text-xs text-slate-500">Cân bằng tự nhiên dân số học</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              sex
            </span>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {genderData.map((_, index) => (
                    <Cell
                      key={`gender-cell-${index}`}
                      fill={GENDER_COLORS[index % GENDER_COLORS.length]}
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
          <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
            <span className="text-slate-500 block">Nam giới</span>
            <span className="font-bold text-blue-600 text-sm">{metrics.male_percentage}%</span>
          </div>
          <div className="p-2 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
            <span className="text-slate-500 block">Nữ giới</span>
            <span className="font-bold text-pink-600 text-sm">{metrics.female_percentage}%</span>
          </div>
        </div>
      </div>

      {/* Cột 2 & 3: Bar Chart Phân bố Nhóm tuổi */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Phân bố theo Nhóm tuổi
              </h3>
              <p className="text-xs text-slate-500">
                Gom nhóm độ tuổi chuẩn hóa (&lt;18, 18-24, 25-34, 35-49, 50+)
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-semibold rounded-full border border-indigo-200 dark:border-indigo-900">
              Nhóm tuổi chiếm ưu thế: 35 - 49 và 50+
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="range"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
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
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span>Nhóm tuổi lao động chính (18-49 tuổi) chiếm <strong>{(100 - (ageDistribution[0]?.percentage || 0) - (ageDistribution[4]?.percentage || 0)).toFixed(1)}%</strong></span>
          <span className="text-indigo-600 font-semibold">Tập dữ liệu bao quát đầy đủ các thế hệ</span>
        </div>
      </div>
    </div>
  );
};
