"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Filter,
  GraduationCap,
  Heart,
  MapPin,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";

interface PersonaRecord {
  id: string;
  summary: string;
  sex: string;
  age: number;
  marital_status: string;
  education_level: string;
  occupation: string;
  zone: string;
  region: string;
  cultural_background: string;
  skills_and_expertise: string;
  hobbies_and_interests: string;
  career_goals_and_ambitions: string;
  professional_persona: string;
  sports_persona: string;
  arts_persona: string;
  travel_persona: string;
  culinary_persona: string;
  skills_and_expertise_list: string;
  hobbies_and_interests_list: string;
  country: string;
}

interface PersonaResponse {
  personas: PersonaRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const REGIONS = [
  "Đồng bằng sông Hồng",
  "Đông Nam Bộ",
  "Bắc Trung Bộ và Duyên hải miền Trung",
  "Đồng bằng sông Cửu Long",
  "Trung du và miền núi phía Bắc",
  "Tây Nguyên",
];
const AGE_GROUPS = ["<18", "18-24", "25-34", "35-49", "50+"];

function PersonasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacySegment = searchParams.get("segment");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedSex, setSelectedSex] = useState<"male" | "female" | "">(
    searchParams.get("sex") === "male" || searchParams.get("sex") === "female"
      ? searchParams.get("sex") as "male" | "female"
      : legacySegment === "male" || legacySegment === "female" ? legacySegment : ""
  );
  const [selectedZone, setSelectedZone] = useState<"urban" | "rural" | "">(
    searchParams.get("zone") === "urban" || searchParams.get("zone") === "rural"
      ? searchParams.get("zone") as "urban" | "rural"
      : legacySegment === "urban" || legacySegment === "rural" ? legacySegment : ""
  );
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "");
  const [selectedAge, setSelectedAge] = useState(searchParams.get("age") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [result, setResult] = useState<PersonaResponse | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSex) params.set("sex", selectedSex);
    if (selectedZone) params.set("zone", selectedZone);
    if (selectedRegion) params.set("region", selectedRegion);
    if (selectedAge) params.set("age", selectedAge);
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (page > 1) params.set("page", String(page));
    router.replace(`/personas${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [router, selectedSex, selectedZone, selectedRegion, selectedAge, searchTerm, page]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "12",
      });
      if (selectedSex) params.set("sex", selectedSex);
      if (selectedZone) params.set("zone", selectedZone);
      if (selectedRegion) params.set("region", selectedRegion);
      if (selectedAge) params.set("age", selectedAge);
      if (searchTerm.trim()) params.set("q", searchTerm.trim());

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/personas?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error || "Không thể tải danh sách persona.");
        }
        setResult((await response.json()) as PersonaResponse);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(fetchError instanceof Error ? fetchError.message : "Không thể tải danh sách persona.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, searchTerm.trim() ? 350 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [selectedSex, selectedZone, selectedRegion, selectedAge, searchTerm, page]);

  useEffect(() => {
    if (!selectedPersona) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPersona(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPersona]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSex("");
    setSelectedZone("");
    setSelectedRegion("");
    setSelectedAge("");
    setPage(1);
  };

  const updateSex = (sex: "male" | "female" | "") => {
    setSelectedSex(sex);
    setPage(1);
  };

  const updateZone = (zone: "urban" | "rural" | "") => {
    setSelectedZone(zone);
    setPage(1);
  };

  const fallback = (value: string) => value?.trim() || "Chưa có thông tin";
  const detailSections: {
    title: string;
    fields: { key: keyof PersonaRecord; label: string }[];
  }[] = [
    {
      title: "Thông tin nhân khẩu học",
      fields: [
        { key: "id", label: "Mã định danh (UUID)" },
        { key: "sex", label: "Giới tính" },
        { key: "age", label: "Tuổi" },
        { key: "marital_status", label: "Tình trạng hôn nhân" },
        { key: "education_level", label: "Trình độ học vấn" },
        { key: "occupation", label: "Nghề nghiệp" },
        { key: "zone", label: "Khu vực" },
        { key: "region", label: "Vùng miền" },
        { key: "country", label: "Quốc gia" },
      ],
    },
    {
      title: "Chân dung và bối cảnh",
      fields: [
        { key: "summary", label: "Chân dung persona" },
        { key: "professional_persona", label: "Persona nghề nghiệp" },
        { key: "cultural_background", label: "Bối cảnh văn hóa" },
        { key: "career_goals_and_ambitions", label: "Mục tiêu và hoài bão nghề nghiệp" },
      ],
    },
    {
      title: "Sở thích và lĩnh vực quan tâm",
      fields: [
        { key: "sports_persona", label: "Thể thao" },
        { key: "arts_persona", label: "Nghệ thuật" },
        { key: "travel_persona", label: "Du lịch" },
        { key: "culinary_persona", label: "Ẩm thực" },
        { key: "hobbies_and_interests", label: "Sở thích và mối quan tâm" },
        { key: "hobbies_and_interests_list", label: "Danh sách sở thích" },
      ],
    },
    {
      title: "Kỹ năng và chuyên môn",
      fields: [
        { key: "skills_and_expertise", label: "Kỹ năng và chuyên môn" },
        { key: "skills_and_expertise_list", label: "Danh sách kỹ năng" },
      ],
    },
  ];

  const renderDetailValue = (value: string | number) => {
    if (typeof value === "string") {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return (
            <ul className="list-disc space-y-1 pl-5">
              {parsed.map((item, index) => (
                <li key={`${index}-${String(item)}`}>{String(item)}</li>
              ))}
            </ul>
          );
        }
      } catch {
        return value;
      }
    }
    return value;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Thống kê Tổng quan</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Persona Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Khám phá 1 triệu persona tổng hợp từ NVIDIA Nemotron Personas Vietnam (CC BY 4.0).
            Đây là dữ liệu tạo sinh, không phải hồ sơ người thật.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm nghề nghiệp, kỹ năng, nội dung..."
            aria-label="Tìm kiếm persona"
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-2 text-xs" aria-label="Bộ lọc persona">
        <span className="font-semibold text-slate-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Lọc nhanh:
        </span>
        <span className="px-2 text-slate-400">Giới tính:</span>
        {([
          { key: "", label: "Tất cả" },
          { key: "male", label: "👨 Nam" },
          { key: "female", label: "👩 Nữ" },
        ] as const).map((option) => (
          <button
            key={option.label}
            onClick={() => updateSex(option.key)}
            aria-pressed={selectedSex === option.key}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              selectedSex === option.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        ))}

        <span className="px-2 text-slate-400">Khu vực:</span>
        {([
          { key: "", label: "Tất cả" },
          { key: "urban", label: "🏙️ Đô thị" },
          { key: "rural", label: "🌾 Nông thôn" },
        ] as const).map((option) => (
          <button
            key={option.label}
            onClick={() => updateZone(option.key)}
            aria-pressed={selectedZone === option.key}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              selectedZone === option.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        ))}

        <select
          value={selectedRegion}
          onChange={(event) => {
            setSelectedRegion(event.target.value);
            setPage(1);
          }}
          aria-label="Lọc theo vùng miền"
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          <option value="">Tất cả vùng miền</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <select
          value={selectedAge}
          onChange={(event) => {
            setSelectedAge(event.target.value);
            setPage(1);
          }}
          aria-label="Lọc theo nhóm tuổi"
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          <option value="">Tất cả nhóm tuổi</option>
          {AGE_GROUPS.map((age) => (
            <option key={age} value={age}>{age} tuổi</option>
          ))}
        </select>

        <button
          onClick={clearFilters}
          className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-indigo-600"
        >
          Xóa bộ lọc
        </button>
        <span className="ml-auto text-slate-500">
          {loading ? "Đang truy vấn..." : `Tìm thấy ${(result?.total ?? 0).toLocaleString()} persona`}
        </span>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {!error && !loading && result?.personas.length === 0 && (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-500">
          Không tìm thấy persona phù hợp với bộ lọc.
        </p>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
        {result?.personas.map((persona) => (
          <article
            key={persona.id}
            role="button"
            tabIndex={0}
            aria-label={`Xem chi tiết persona: ${fallback(persona.occupation)}`}
            onClick={() => setSelectedPersona(persona)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedPersona(persona);
              }
            }}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                      {fallback(persona.occupation)}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <span>{fallback(persona.sex)}</span>
                      <span>•</span>
                      <span>{persona.age} tuổi</span>
                      <span>•</span>
                      <span>{fallback(persona.marital_status)}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {fallback(persona.zone)}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{fallback(persona.education_level)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{fallback(persona.region)}</span>
                </div>
              </div>

              <div className="pt-3 space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Chân dung persona
                  </span>
                  <p className="text-slate-500 leading-relaxed line-clamp-5">
                    {fallback(persona.summary)}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bối cảnh văn hóa
                  </span>
                  <p className="text-slate-500 leading-relaxed line-clamp-3">
                    {fallback(persona.cultural_background)}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Kỹ năng & chuyên môn
                  </span>
                  <p className="text-slate-500 leading-relaxed line-clamp-3">
                    {fallback(persona.skills_and_expertise)}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <Heart className="w-3.5 h-3.5 text-pink-500" />
                    Sở thích
                  </span>
                  <p className="text-slate-500 leading-relaxed line-clamp-2">
                    {fallback(persona.hobbies_and_interests)}
                  </p>
                </div>
                {persona.career_goals_and_ambitions && (
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                      Mục tiêu nghề nghiệp
                    </span>
                    <p className="text-slate-500 leading-relaxed line-clamp-2">
                      {persona.career_goals_and_ambitions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span className="truncate">UUID: {persona.id}</span>
                <span>Persona tổng hợp</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {selectedPersona && (
        <div
          className="fixed inset-0 !mt-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPersona(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="persona-detail-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Persona tổng hợp · NVIDIA Nemotron Personas Vietnam
                </p>
                <h2 id="persona-detail-title" className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  {selectedPersona.occupation || "Chi tiết persona"}
                </h2>
                <p className="mt-1 break-all text-xs text-slate-500">
                  UUID: {selectedPersona.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPersona(null)}
                aria-label="Đóng chi tiết persona"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="space-y-6">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                  Dữ liệu persona được tạo sinh bằng AI, không phải hồ sơ của người thật. Dataset không cung cấp tên cá nhân.
                </div>
                {detailSections.map((section) => (
                  <section key={section.title} className="space-y-3">
                    <h3 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                      {section.title}
                    </h3>
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {section.fields.map(({ key, label }) => {
                        const value = selectedPersona[key];
                        const isEmpty = value === null || value === undefined || value === "";

                        return (
                          <div
                            key={key}
                            className="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"
                          >
                            <dt className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {label}
                            </dt>
                            <dd className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                              {isEmpty ? "Chưa có thông tin" : renderDetailValue(value)}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </section>
                ))}
              </div>
            </div>

            <footer className="flex justify-end border-t border-slate-200 p-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPersona(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Đóng
              </button>
            </footer>
          </section>
        </div>
      )}

      {result && result.total_pages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Phân trang">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            Trang trước
          </button>
          <span className="text-sm text-slate-500">
            Trang {result.page.toLocaleString()} / {result.total_pages.toLocaleString()}
          </span>
          <button
            disabled={page >= result.total_pages || loading}
            onClick={() => setPage((current) => Math.min(result.total_pages, current + 1))}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            Trang sau
          </button>
        </nav>
      )}
    </div>
  );
}

export default function PersonasPage() {
  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Đang tải Persona Explorer...</div>}>
        <PersonasContent />
      </Suspense>
    </main>
  );
}
