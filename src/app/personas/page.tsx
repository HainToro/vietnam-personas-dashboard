"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Filter, MapPin, Briefcase, GraduationCap, Heart, Sparkles, User } from "lucide-react";

interface PersonaCardData {
  id: string;
  name: string;
  sex: "Nam" | "Nữ";
  age: number;
  marital_status: string;
  education_level: string;
  occupation: string;
  zone: "Đô Thị" | "Nông Thôn";
  region: string;
  cultural_background: string;
  skills_and_expertise: string;
  hobbies_and_interests: string;
}

const SAMPLE_PERSONAS: PersonaCardData[] = [
  {
    id: "vn-001",
    name: "Nguyễn Văn Tuấn",
    sex: "Nam",
    age: 28,
    marital_status: "Độc thân",
    education_level: "Đại học",
    occupation: "Kỹ sư phần mềm (AI / Cloud)",
    zone: "Đô Thị",
    region: "Đông Nam Bộ",
    cultural_background: "Sinh ra và lớn lên tại TP. Hồ Chí Minh, hòa đồng, năng động, am hiểu công nghệ số và thích nghi nhanh với xu hướng toàn cầu.",
    skills_and_expertise: "TypeScript, Python, Machine Learning, Docker, Quản trị hệ thống đám mây",
    hobbies_and_interests: "Chạy bộ marathon cuối tuần, cà phê vợt Sài Gòn, nhiếp ảnh đường phố",
  },
  {
    id: "vn-002",
    name: "Trần Thị Mai Anh",
    sex: "Nữ",
    age: 34,
    marital_status: "Đã kết hôn",
    education_level: "Đại học",
    occupation: "Giáo viên Ngữ văn THPT",
    zone: "Đô Thị",
    region: "Đồng bằng sông Hồng",
    cultural_background: "Gia đình truyền thống tại Hà Nội, yêu thích văn học dân gian, gìn giữ nét văn hóa thanh lịch của người Tràng An.",
    skills_and_expertise: "Phương pháp giảng dạy hiện đại, biên soạn giáo án điện tử, kỹ năng thuyết trình truyền cảm",
    hobbies_and_interests: "Đọc sách văn học cổ điển, cắm hoa nghệ thuật, làm bánh truyền thống",
  },
  {
    id: "vn-003",
    name: "Lê Hoàng Phúc",
    sex: "Nam",
    age: 46,
    marital_status: "Đã kết hôn",
    education_level: "Trung cấp / Cao đẳng",
    occupation: "Tiểu thương phân phối nông sản",
    zone: "Nông Thôn",
    region: "Đồng bằng sông Cửu Long",
    cultural_background: "Người miền Tây chân chất, hào sảng tại Tiền Giang, gắn bó sâu sắc với miệt vườn sông nước Cửu Long.",
    skills_and_expertise: "Kỹ thuật canh tác lúa VietGAP, đàm phán thương mại nông nghiệp, quản lý logistics vận tải đường thủy",
    hobbies_and_interests: "Đờn ca tài tử, câu cá miệt vườn, họp mặt xóm giềng ngày hội",
  },
  {
    id: "vn-004",
    name: "Phạm Minh Tâm",
    sex: "Nam",
    age: 58,
    marital_status: "Đã kết hôn",
    education_level: "Đại học",
    occupation: "Nghỉ hưu, Cố vấn kỹ thuật nông nghiệp",
    zone: "Nông Thôn",
    region: "Tây Nguyên",
    cultural_background: "Cán bộ hưu trí tại Đắk Lắk, đam mê phát triển bền vững cà phê và hồ tiêu theo tiêu chuẩn hữu cơ.",
    skills_and_expertise: "Nông học cây công nghiệp lâu năm, quản lý dự án nông nghiệp, tập huấn nông dân",
    hobbies_and_interests: "Chăm sóc vườn lan rừng, uống cà phê Robusta tự rang, đọc báo nông nghiệp",
  },
  {
    id: "vn-005",
    name: "Võ Thị Bích Liên",
    sex: "Nữ",
    age: 26,
    marital_status: "Độc thân",
    education_level: "Đại học",
    occupation: "Chuyên viên Truyền thông & Marketing",
    zone: "Đô Thị",
    region: "Bắc Trung Bộ và Duyên hải miền Trung",
    cultural_background: "Sinh sống tại TP. Đà Nẵng, trẻ trung, tự tin, hòa nhập với không gian đô thị biển đáng sống nhất Việt Nam.",
    skills_and_expertise: "Sáng tạo nội dung số, Digital Ads, Brand Storytelling, Tiếng Anh giao tiếp lưu loát",
    hobbies_and_interests: "Lướt ván chèo SUP bán đảo Sơn Trà, du lịch phượt khám phá, vẽ tranh màu nước",
  },
  {
    id: "vn-006",
    name: "Đỗ Xuân Bách",
    sex: "Nam",
    age: 39,
    marital_status: "Đã kết hôn",
    education_level: "Trung học phổ thông",
    occupation: "Chủ cửa hàng tạp hóa & Dịch vụ số",
    zone: "Nông Thôn",
    region: "Trung du và miền núi phía Bắc",
    cultural_background: "Người dân bản địa tại Thái Nguyên, cần cù, nhanh nhạy ứng dụng chuyển đổi số và thanh toán QR code tại địa phương.",
    skills_and_expertise: "Quản lý tồn kho hàng tiêu dùng, kinh doanh bán lẻ, thanh toán điện tử",
    hobbies_and_interests: "Thưởng trà Tân Cương, nuôi chim cảnh, xem bóng đá cùng bạn bè",
  },
];

function PersonasContent() {
  const searchParams = useSearchParams();
  const initialSegment = searchParams.get("segment") || "all";
  const initialRegion = searchParams.get("region") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState(initialSegment);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState(initialRegion);

  const filteredList = SAMPLE_PERSONAS.filter((p) => {
    // Segment filter
    if (selectedSegment === "urban" && p.zone !== "Đô Thị") return false;
    if (selectedSegment === "rural" && p.zone !== "Nông Thôn") return false;
    if (selectedSegment === "male" && p.sex !== "Nam") return false;
    if (selectedSegment === "female" && p.sex !== "Nữ") return false;

    // Region filter
    if (selectedRegionFilter && p.region !== selectedRegionFilter) return false;

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.occupation.toLowerCase().includes(q) ||
        p.cultural_background.toLowerCase().includes(q) ||
        p.skills_and_expertise.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Thống kê Tổng quan (Overview Dashboard)</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Persona Explorer (Khám phá hồ sơ cá nhân)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem hồ sơ nhân khẩu học và chân dung tính cách chi tiết từ bộ dữ liệu NVIDIA Nemotron Vietnam
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, nghề nghiệp, kỹ năng..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        <span className="font-semibold text-slate-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Lọc nhanh:
        </span>
        {[
          { key: "all", label: "Tất cả" },
          { key: "urban", label: "🏙️ Đô thị" },
          { key: "rural", label: "🌾 Nông thôn" },
          { key: "male", label: "👨 Nam" },
          { key: "female", label: "👩 Nữ" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedSegment(opt.key)}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              selectedSegment === opt.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            {opt.label}
          </button>
        ))}

        {selectedRegionFilter && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200">
            📍 Vùng: {selectedRegionFilter}
            <button
              onClick={() => setSelectedRegionFilter("")}
              className="ml-1 hover:text-emerald-900"
            >
              ×
            </button>
          </span>
        )}

        <span className="ml-auto text-xs text-slate-500">
          Hiển thị <strong>{filteredList.length}</strong> hồ sơ đại diện
        </span>
      </div>

      {/* Personas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((persona) => (
          <div
            key={persona.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Avatar & Basic info */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      persona.sex === "Nam"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : "bg-pink-500/10 text-pink-600 border border-pink-500/20"
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {persona.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{persona.sex}</span>
                      <span>•</span>
                      <span>{persona.age} tuổi</span>
                      <span>•</span>
                      <span>{persona.marital_status}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    persona.zone === "Đô Thị"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}
                >
                  {persona.zone}
                </span>
              </div>

              {/* Tag metadata */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {persona.occupation}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{persona.education_level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{persona.region}</span>
                </div>
              </div>

              {/* Persona Narratives */}
              <div className="pt-3 space-y-2.5 text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Bối cảnh văn hóa & Đặc trưng:
                  </span>
                  <p className="text-slate-500 leading-relaxed italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    &ldquo;{persona.cultural_background}&rdquo;
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Kỹ năng & Chuyên môn:
                  </span>
                  <p className="text-slate-500 leading-relaxed">
                    {persona.skills_and_expertise}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-500" />
                    Sở thích & Đời sống:
                  </span>
                  <p className="text-slate-500 leading-relaxed">
                    {persona.hobbies_and_interests}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-mono">
              <span>Mã ID: {persona.id}</span>
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
                Xem chi tiết profile &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
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
