# Specification: Vietnam Personas Analytics Dashboard

## 1. Executive Summary
Xây dựng trang Dashboard Thống kê Tổng quan (Analytics / Dataset Overview) cho tập dữ liệu Persona Việt Nam (`nvidia/Nemotron-Personas-Vietnam`). Trang cung cấp góc nhìn toàn cảnh về nhân khẩu học, trình độ học vấn, tình trạng hôn nhân, phân bố địa lý 6 vùng miền và các nhóm nghề nghiệp chủ đạo.

## 2. Nguồn dữ liệu
- Repository: `nvidia/Nemotron-Personas-Vietnam` (Hugging Face)
- Các trường trọng tâm: `sex`, `age`, `marital_status`, `education_level`, `occupation`, `zone`, `region`.

## 3. Kiến trúc hệ thống
```
[Hugging Face / Parquet] 
       ↓ (Python Preprocessing)
[public/data/analytics_overview.json]
       ↓ (In-Memory Cache / TTL 24h)
[Next.js API: GET /api/v1/analytics/overview]
       ↓ (Client State & Cross-filtering)
[OverviewDashboard.tsx (Recharts + Tailwind)]
```

## 4. Bố cục giao diện
1. **Header & 4 Quick KPIs**: Tổng Personas, Tuổi TB, Tỷ lệ Nam/Nữ, Tỷ lệ Đô thị/Nông thôn.
2. **Hàng 1 - Dân số học**: Donut chart Giới tính + Khu vực, Bar chart 5 nhóm tuổi (`<18`, `18-24`, `25-34`, `35-49`, `50+`).
3. **Hàng 2 - Học vấn & Xã hội**: Horizontal bar chart Trình độ học vấn, Pie/Donut chart Tình trạng hôn nhân.
4. **Hàng 3 - Địa lý & Nghề nghiệp**: Bar chart 6 Vùng miền, Danh sách Top 10-15 Nghề nghiệp phổ biến nhất.
5. **Footer & Action**: Shortcut "Khám phá danh sách Personas" liên kết sang `/personas?filter=...`.

## 5. Yêu cầu phi chức năng
- Response API: < 50ms.
- FCP (First Contentful Paint): < 500ms.
- Hoàn toàn responsive trên Mobile, Tablet, Desktop.
