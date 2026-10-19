"use client";

import React, { useState } from "react";
import { AnalyticsOverviewPayload, FilterKey } from "@/types/analytics";
import { KPICards } from "./KPICards";
import { DemographicsSection } from "./DemographicsSection";
import { EducationMaritalSection } from "./EducationMaritalSection";
import { GeographyOccupationSection } from "./GeographyOccupationSection";
import { ArrowUpRight, Sparkles, Filter, X } from "lucide-react";

interface OverviewDashboardProps {
  initialData: AnalyticsOverviewPayload;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ initialData }) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showExplorerModal, setShowExplorerModal] = useState(false);

  // Chọn dữ liệu theo phân đoạn (segment)
  const currentData = React.useMemo(() => {
    if (activeFilter === "all" || !initialData.segments) {
      return {
        total: initialData.total_personas,
        metrics: initialData.metrics,
        charts: initialData.charts,
      };
    }

    const seg = initialData.segments[activeFilter];
    if (!seg) {
      return {
        total: initialData.total_personas,
        metrics: initialData.metrics,
        charts: initialData.charts,
      };
    }

    return {
      total: seg.total_personas,
      metrics: seg.metrics,
      charts: seg.charts,
    };
  }, [activeFilter, initialData]);

  const filterOptions: { key: FilterKey; label: string; icon: string }[] = [
    { key: "all", label: "Tất cả toàn quốc", icon: "🇻🇳" },
    { key: "urban", label: "Khu vực Đô thị", icon: "🏙️" },
    { key: "rural", label: "Khu vực Nông thôn", icon: "🌾" },
    { key: "male", label: "Nam giới", icon: "👨" },
    { key: "female", label: "Nữ giới", icon: "👩" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Filter Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Dataset
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {initialData.dataset_name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">
            Thống kê tổng quan Persona Việt Nam
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Phân tích nhân khẩu học, trình độ học vấn, 6 vùng kinh tế và nhóm nghề nghiệp chủ đạo
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 px-2 text-xs font-medium text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc:</span>
          </div>
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setActiveFilter(opt.key);
                setSelectedRegion(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === opt.key
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Thông báo nếu có lọc vùng miền từ chart */}
      {selectedRegion && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>
              Đang chọn vùng miền: <strong className="text-indigo-600">{selectedRegion}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedRegion(null)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header & Quick KPI Cards */}
      <KPICards total={currentData.total} metrics={currentData.metrics} />

      {/* 2. Hàng 1: Dân số học cơ bản */}
      <DemographicsSection
        ageDistribution={currentData.charts.age_distribution}
        zoneDistribution={currentData.charts.zone}
        metrics={currentData.metrics}
      />

      {/* 3. Hàng 2: Trình độ học vấn & Đời sống xã hội */}
      <EducationMaritalSection
        educationLevel={currentData.charts.education_level}
        maritalStatus={currentData.charts.marital_status}
      />

      {/* 4. Hàng 3: Phân bố Địa lý & Nghề nghiệp */}
      <GeographyOccupationSection
        regionDistribution={currentData.charts.region}
        topOccupations={currentData.charts.top_occupations}
        onSelectRegion={(region) => setSelectedRegion(region)}
      />

      {/* 5. Footer & Deep Linking Shortcut */}
      <footer className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Khám phá danh sách hồ sơ chi tiết (Persona Explorer)
          </h4>
          <p className="text-xs text-slate-500">
            Xem danh sách {currentData.total.toLocaleString()} personas với đầy đủ đặc tính cá nhân, sở thích và kỹ năng
          </p>
        </div>

        <button
          onClick={() => setShowExplorerModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <span>Khám phá danh sách ({currentData.total.toLocaleString()})</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Explorer Modal Demo */}
      {showExplorerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Chuyển tiếp sang Persona Explorer
              </h3>
              <button
                onClick={() => setShowExplorerModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Hệ thống sẽ chuyển hướng với bộ lọc hiện tại:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div>
                <strong>Bộ lọc phân đoạn:</strong>{" "}
                <span className="text-indigo-600 font-semibold uppercase">{activeFilter}</span>
              </div>
              {selectedRegion && (
                <div>
                  <strong>Vùng miền đã chọn:</strong>{" "}
                  <span className="text-emerald-600 font-semibold">{selectedRegion}</span>
                </div>
              )}
              <div>
                <strong>Số lượng hồ sơ phù hợp:</strong>{" "}
                <span className="font-bold">{currentData.total.toLocaleString()}</span> personas
              </div>
              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Deep link: /personas?segment={activeFilter}
                {selectedRegion ? `&region=${encodeURIComponent(selectedRegion)}` : ""}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExplorerModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  alert(
                    `Đã sẵn sàng điều hướng sang /personas?segment=${activeFilter}${
                      selectedRegion ? `&region=${selectedRegion}` : ""
                    }`
                  );
                  setShowExplorerModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Đi đến Explorer &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
