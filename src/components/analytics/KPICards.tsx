import React from "react";
import { Users, Calendar, Scale, MapPin } from "lucide-react";
import { MetricOverview } from "@/types/analytics";

interface KPICardsProps {
  total: number;
  metrics: MetricOverview;
}

export const KPICards: React.FC<KPICardsProps> = ({ total, metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tổng số personas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Tổng số Personas
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {total.toLocaleString()}
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <span className="text-emerald-600 font-semibold">100%</span> mẫu đại diện NVIDIA Nemotron
        </p>
      </div>

      {/* KPI 2: Độ tuổi trung bình */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Độ tuổi trung bình
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {metrics.avg_age} <span className="text-lg font-normal text-slate-400">tuổi</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Trung vị: <strong className="text-slate-700 dark:text-slate-300">{metrics.median_age} tuổi</strong> (Lao động & hưu trí)
        </p>
      </div>

      {/* KPI 3: Tỷ lệ Giới tính */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Tỷ lệ Giới tính
          </span>
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600">
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {metrics.male_percentage}% / {metrics.female_percentage}%
        </div>
        <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
          <span>Nam: <strong className="text-blue-600">{metrics.male_count.toLocaleString()}</strong></span>
          <span>Nữ: <strong className="text-pink-600">{metrics.female_count.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* KPI 4: Khu vực sống */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Khu vực sinh sống
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {metrics.urban_percentage}% Đô thị
        </div>
        <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
          <span>Đô thị: <strong className="text-emerald-600">{metrics.urban_count.toLocaleString()}</strong></span>
          <span>Nông thôn: <strong className="text-amber-600">{metrics.rural_count.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
};
