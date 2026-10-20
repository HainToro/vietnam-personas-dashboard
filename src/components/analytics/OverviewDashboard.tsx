"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnalyticsOverviewPayload } from "@/types/analytics";
import { KPICards } from "./KPICards";
import { DemographicsSection } from "./DemographicsSection";
import { EducationMaritalSection } from "./EducationMaritalSection";
import { GeographyOccupationSection } from "./GeographyOccupationSection";
import { ArrowUpRight, Sparkles, Filter, RefreshCw } from "lucide-react";

interface OverviewDashboardProps {
  initialData: AnalyticsOverviewPayload;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlRegion = searchParams.get("region") || null;
  const urlAge = searchParams.get("age") || null;

  const initialSegment = searchParams.get("segment");
  const [selectedSex, setSelectedSex] = useState<"male" | "female" | null>(
    (searchParams.get("sex") as "male" | "female" | null) ??
      (initialSegment === "male" || initialSegment === "female" ? initialSegment : null)
  );
  const [selectedZone, setSelectedZone] = useState<"urban" | "rural" | null>(
    (searchParams.get("zone") as "urban" | "rural" | null) ??
      (initialSegment === "urban" || initialSegment === "rural" ? initialSegment : null)
  );
  const [selectedRegion, setSelectedRegion] = useState<string | null>(urlRegion);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(urlAge);
  const [filteredData, setFilteredData] = useState<AnalyticsOverviewPayload | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  useEffect(() => {
    const segment = searchParams.get("segment");
    const sex = searchParams.get("sex");
    const zone = searchParams.get("zone");
    setSelectedSex(
      sex === "male" || sex === "female"
        ? sex
        : segment === "male" || segment === "female"
          ? segment
          : null
    );
    setSelectedZone(
      zone === "urban" || zone === "rural"
        ? zone
        : segment === "urban" || segment === "rural"
          ? segment
          : null
    );
    setSelectedRegion(searchParams.get("region"));
    setSelectedAgeGroup(searchParams.get("age"));
  }, [searchParams]);

  useEffect(() => {
    if (!selectedSex && !selectedZone && !selectedRegion && !selectedAgeGroup) {
      setFilteredData(null);
      setFilterError(null);
      setFilterLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (selectedSex) params.set("sex", selectedSex);
    if (selectedZone) params.set("zone", selectedZone);
    if (selectedRegion) params.set("region", selectedRegion);
    if (selectedAgeGroup) params.set("age", selectedAgeGroup);

    const controller = new AbortController();
    setFilterLoading(true);
    setFilterError(null);

    fetch(`/api/v1/analytics/overview?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const error = (await response.json()) as { error?: string };
          throw new Error(error.error || "Không thể tải dữ liệu theo bộ lọc.");
        }
        return (await response.json()) as AnalyticsOverviewPayload;
      })
      .then(setFilteredData)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFilterError(error instanceof Error ? error.message : "Không thể tải dữ liệu theo bộ lọc.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setFilterLoading(false);
      });

    return () => controller.abort();
  }, [selectedSex, selectedZone, selectedRegion, selectedAgeGroup]);

  const updateUrlParams = (
    sex: "male" | "female" | null,
    zone: "urban" | "rural" | null,
    region: string | null,
    age: string | null
  ) => {
    const params = new URLSearchParams();
    if (sex) params.set("sex", sex);
    if (zone) params.set("zone", zone);
    if (region) params.set("region", region);
    if (age) params.set("age", age);

    const query = params.toString();
    router.replace(`/${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleSexChange = (sex: "male" | "female" | null) => {
    setSelectedSex(sex);
    updateUrlParams(sex, selectedZone, selectedRegion, selectedAgeGroup);
  };

  const handleZoneChange = (zone: "urban" | "rural" | null) => {
    setSelectedZone(zone);
    updateUrlParams(selectedSex, zone, selectedRegion, selectedAgeGroup);
  };

  const handleRegionSelect = (region: string) => {
    const nextRegion = selectedRegion === region ? null : region;
    setSelectedRegion(nextRegion);
    updateUrlParams(selectedSex, selectedZone, nextRegion, selectedAgeGroup);
  };

  const handleAgeSelect = (ageRange: string) => {
    const nextAge = selectedAgeGroup === ageRange ? null : ageRange;
    setSelectedAgeGroup(nextAge);
    updateUrlParams(selectedSex, selectedZone, selectedRegion, nextAge);
  };

  const handleGenderSelect = (gender: "male" | "female") => {
    handleSexChange(selectedSex === gender ? null : gender);
  };

  const handleResetFilters = () => {
    setSelectedSex(null);
    setSelectedZone(null);
    setSelectedRegion(null);
    setSelectedAgeGroup(null);
    router.replace("/", { scroll: false });
  };

  const handleGoToExplorer = () => {
    const params = new URLSearchParams();
    if (selectedSex) params.set("sex", selectedSex);
    if (selectedZone) params.set("zone", selectedZone);
    if (selectedRegion) params.set("region", selectedRegion);
    if (selectedAgeGroup) params.set("age", selectedAgeGroup);

    const query = params.toString();
    router.push(`/personas${query ? `?${query}` : ""}`);
  };

  const currentData = React.useMemo(() => {
    const data = filteredData ?? initialData;
    return {
      total: data.total_personas,
      metrics: data.metrics,
      charts: data.charts,
    };
  }, [filteredData, initialData]);

  const hasActiveFilters = selectedSex !== null || selectedZone !== null || selectedRegion !== null || selectedAgeGroup !== null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Filter Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {initialData.total_personas.toLocaleString()} persona tổng hợp
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {initialData.dataset_name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">
            Thống kê tổng quan Persona Việt Nam
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Persona tổng hợp (NVIDIA, FPT Smart Cloud, Quantum AI & Cyber Security Institute), không phải hồ sơ người thật ·{" "}
            <a
              href="https://huggingface.co/datasets/nvidia/Nemotron-Personas-Vietnam"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              NVIDIA Nemotron Personas Vietnam (CC BY 4.0)
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1">
            <span className="flex items-center gap-1 px-2 text-xs font-medium text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              Giới tính:
            </span>
            {[
              { key: null, label: "Tất cả" },
              { key: "male" as const, label: "Nam" },
              { key: "female" as const, label: "Nữ" },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => handleSexChange(option.key)}
                aria-pressed={selectedSex === option.key}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedSex === option.key
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="px-2 text-xs font-medium text-slate-400">Khu vực:</span>
            {[
              { key: null, label: "Tất cả" },
              { key: "urban" as const, label: "🏙️ Đô thị" },
              { key: "rural" as const, label: "🌾 Nông thôn" },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => handleZoneChange(option.key)}
                aria-pressed={selectedZone === option.key}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedZone === option.key
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Active Filters Breadcrumb Bar */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Bộ lọc đang áp dụng:
          </span>

          {selectedSex && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 shadow-xs">
              Giới tính: {selectedSex === "male" ? "Nam" : "Nữ"}
              <button
                onClick={() => handleSexChange(null)}
                className="ml-1 text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          )}

          {selectedZone && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 shadow-xs">
              Khu vực: {selectedZone === "urban" ? "Đô thị" : "Nông thôn"}
              <button
                onClick={() => handleZoneChange(null)}
                className="ml-1 text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          )}

          {filterLoading && (
            <p role="status" className="text-xs text-slate-500">
              Đang truy vấn dữ liệu theo bộ lọc...
            </p>
          )}
          {filterError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {filterError}
            </p>
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
        onSelectZone={(zone) => handleZoneChange(selectedZone === zone ? null : zone)}
        onSelectAgeGroup={handleAgeSelect}
        selectedAgeGroup={selectedAgeGroup}
        selectedZone={selectedZone}
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
