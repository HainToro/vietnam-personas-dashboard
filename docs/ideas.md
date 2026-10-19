# Ý tưởng & Quy trình Xây dựng Dashboard

## 1. Mục tiêu
Xây dựng trang Dashboard Thống kê Tổng quan (Analytics / Dataset Overview) cho tập dữ liệu Persona Việt Nam (`nvidia/Nemotron-Personas-Vietnam`).

## 2. Quy trình 5 bước cốt lõi
1. **Bước 1: Chuẩn bị & Trích xuất dữ liệu (Data Ingestion & Aggregation)**
   - Tải dataset từ Hugging Face.
   - Làm sạch, chuẩn hóa các trường phân loại (`sex`, `marital_status`, `education_level`, `occupation`, `zone`, `region`).
   - Gom nhóm độ tuổi: `<18`, `18-24`, `25-34`, `35-49`, `50+`.
   - Tính toán sẵn các chỉ số tổng hợp (KPIs, tần suất, phần trăm) lưu ra JSON tĩnh/cache.

2. **Bước 2: Thiết kế Kiến trúc Data API (Backend)**
   - Endpoint: `GET /api/v1/analytics/overview`.
   - Caching: In-memory cache hoặc Redis đảm bảo response < 50ms.

3. **Bước 3: Thiết kế Bố cục Giao diện UI/UX (Layout Blueprint)**
   - Header & Quick KPIs: Tổng số Persona, Độ tuổi trung bình, Tỷ lệ Nam/Nữ, Tỷ lệ Đô thị/Nông thôn.
   - Hàng 1: Dân số học (Giới tính, Khu vực, Phân bố Nhóm tuổi).
   - Hàng 2: Trình độ học vấn & Tình trạng hôn nhân.
   - Hàng 3: Phân bố 6 Vùng miền & Top Nghề nghiệp phổ biến.

4. **Bước 4: Phát triển Frontend & Trực quan hóa**
   - Tech stack đề xuất: Next.js (React), Tailwind CSS, Shadcn UI, Recharts.

5. **Bước 5: Tối ưu hiệu năng & Tương tác (Interactive Overview)**
   - Cơ chế Cross-filtering (Lọc chéo theo Đô thị/Nông thôn, Giới tính, v.v.).
   - Shortcut deep linking "Khám phá danh sách" dẫn sang trang Explorer.
