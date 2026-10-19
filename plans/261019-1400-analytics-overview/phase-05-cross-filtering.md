# Phase 05: Cross-Filtering & Interactivity

Status: ✅ Complete
Dependencies: Phase 01, Phase 02, Phase 03, Phase 04

## Objective
Xây dựng cơ chế lọc chéo động (Cross-filtering) liên thông giữa các biểu đồ, đồng bộ trạng thái qua URL query parameters, và triển khai trang Explorer (`/personas`) với deep linking sẵn sàng.

## Requirements
### Functional
- [x] Tích hợp URL query params sync (hỗ trợ `?segment=`, `?region=`, `?age=`)
- [x] Hỗ trợ click-to-filter trực tiếp trên các biểu đồ (Giới tính, Khu vực, Vùng miền, Nhóm tuổi)
- [x] Hiển thị thanh Active Filters Badge với nút xóa từng bộ lọc hoặc xóa tất cả (Reset all)
- [x] Xây dựng trang danh sách hồ sơ `src/app/personas/page.tsx` (Persona Explorer)
- [x] Kết nối nút "Khám phá danh sách personas" chuyển hướng trực tiếp sang `/personas` với filter đã chọn
- [x] Kiểm tra build (`npm run build`) thành công 100%

### Non-Functional
- Chuyển đổi bộ lọc tức thì (0ms latency nhờ dữ liệu pre-computed)
- URL có thể chia sẻ (Shareable URLs)
- Trải nghiệm mượt mà với animation và visual feedback

## Output
- Trang Explorer: `src/app/personas/page.tsx`
- Tương tác lọc chéo động trên toàn bộ dashboard
