"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnalyticsOverviewPayload, FilterKey } from "@/types/analytics";
import { KPICards } from "./KPICards";
import { DemographicsSection } from "./DemographicsSection";
import { EducationMaritalSection } from "./EducationMaritalSection";
import { GeographyOccupationSection } from "./GeographyOccupationSection";
import { ArrowUpRight, Sparkles, Filter, X, RefreshCw } from "lucide-react";

interface OverviewDashboardProps {
  initialData: AnalyticsOverviewPayload;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSegment = (searchParams.get("segment") as FilterKey) || "all";
  const urlRegion = searchParams.get("region") || null;
  const urlAge = searchParams.get("age") || null;

  const [activeFilter, setActiveFilter] = useState<FilterKey>(urlSegment);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(urlRegion);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(urlAge);

  // Đồng bộ URL params khi filter thay đổi
  const updateUrlParams = (filter: FilterKey, region: string | null, age: string | null) => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("segment", filter);
    if (region) params.set("region", region);
    if (age) params.set("age", age);

    const query = params.toString();
    router.replace(`/${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleFilterChange = (key: FilterKey) => {
    setActiveFilter(key);
    updateUrlParams(key, selectedRegion, selectedAgeGroup);
  };

  const handleRegionSelect = (region: string) => {
    const nextRegion = selectedRegion === region ? null : region;
    setSelectedRegion(nextRegion);
    updateUrlParams(activeFilter, nextRegion, selectedAgeGroup);
  };

  const handleAgeSelect = (ageRange: string) => {
    const nextAge = selectedAgeGroup === ageRange ? null : ageRange;
    setSelectedAgeGroup(nextAge);
    updateUrlParams(activeFilter, selectedRegion, nextAge);
  };

  const handleGenderSelect = (gender: "male" | "female") => {
    handleFilterChange(gender);
  };

  const handleResetFilters = () => {
    setActiveFilter("all");
    setSelectedRegion(null);
    setSelectedAgeGroup(null);
    router.replace("/", { scroll: false });
  };

  const handleGoToExplorer = () => {
    const params = new URLSearchParams();
    if (activeFilter !== "all") params.set("segment", activeFilter);
    if (selectedRegion) params.set("region", selectedRegion);
    if (selectedAgeGroup) params.set("age", selectedAgeGroup);

    const query = params.toString();
    router.push(`/personas${query ? `?${query}` : ""}`);
  };

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

  const hasActiveFilters = activeFilter !== "all" || selectedRegion !== null || selectedAgeGroup !== null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Filter Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Dataset 90,910 Personas
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {initialData.dataset_name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">
            Thống kê tổng quan Persona Việt Nam
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Dữ liệu nhân khẩu học, trình độ học vấn, 6 vùng kinh tế và nhóm nghề nghiệp chủ đạo
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
              onClick={() => handleFilterChange(opt.key)}
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

      {/* Active Filters Breadcrumb Bar */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Bộ lọc đang áp dụng:
          </span>

          {activeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 shadow-xs">
              Phân đoạn: {filterOptions.find((o) => o.key === activeFilter)?.label}
              <button
                onClick={() => handleFilterChange("all")}
                className="ml-1 text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          )}

          {selectedRegion && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 shadow-xs">
              Vùng miền: {selectedRegion}
              <button
                onClick={() => handleRegionSelect(selectedRegion)}
                className="ml-1 text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          )}

          {selectedAgeGroup && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 shadow-xs">
              Nhóm tuổi: {selectedAgeGroup}
              <button
                onClick={() => handleAgeSelect(selectedAgeGroup)}
                className="ml-1 text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="ml-auto flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Đặt lại tất cả</span>
          </button>
        </div>
      )}

      {/* 1. Header & Quick KPI Cards */}
      <KPICards total={currentData.total} metrics={currentData.metrics} />

      {/* 2. Hàng 1: Dân số học cơ bản (Click-to-filter Gender & Age Group) */}
      <DemographicsSection
        ageDistribution={currentData.charts.age_distribution}
        zoneDistribution={currentData.charts.zone}
        metrics={currentData.metrics}
        onSelectGender={handleGenderSelect}
        onSelectAgeGroup={handleAgeSelect}
        selectedAgeGroup={selectedAgeGroup}
      />

      {/* 3. Hàng 2: Trình độ học vấn & Đời sống xã hội */}
      <EducationMaritalSection
        educationLevel={currentData.charts.education_level}
        maritalStatus={currentData.charts.marital_status}
      />

      {/* 4. Hàng 3: Phân bố Địa lý & Nghề nghiệp (Click-to-filter Region) */}
      <GeographyOccupationSection
        regionDistribution={currentData.charts.region}
        topOccupations={currentData.charts.top_occupations}
        selectedRegion={selectedRegion}
        onSelectRegion={handleRegionSelect}
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
          onClick={handleGoToExplorer}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2 group"
        >
          <span>Khám phá danh sách ({currentData.total.toLocaleString()} personas)</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </footer>
    </div>
  );
};
