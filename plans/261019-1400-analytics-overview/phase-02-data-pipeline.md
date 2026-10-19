# Phase 02: Data Ingestion & Pre-aggregation

Status: ✅ Complete
Dependencies: Phase 01

## Objective
Xây dựng data pipeline trích xuất từ tập dữ liệu `nvidia/Nemotron-Personas-Vietnam` trên Hugging Face, chuẩn hóa các trường nhân khẩu học, tính toán trước (pre-aggregation) toàn bộ các chỉ số tổng quan và phân đoạn (cross-filtering segments) lưu thành `public/data/analytics_overview.json`.

## Requirements
### Functional
- [x] Cài đặt `pyarrow` và `requests` cho môi trường Python
- [x] Tạo script `scripts/preprocess_vietnam_personas.py`
- [x] Kết nối trực tiếp Hugging Face Parquet API (`0.parquet` - 90,910 hồ sơ)
- [x] Chuẩn hóa các trường: `sex`, `age`, `marital_status`, `education_level`, `occupation`, `zone`, `region`
- [x] Gom nhóm tuổi (`<18`, `18-24`, `25-34`, `35-49`, `50+`)
- [x] Tính toán KPIs (Total, Avg Age, Median Age, Gender Ratio, Urban/Rural Ratio)
- [x] Tính toán phân đoạn lọc chéo (All, Urban, Rural, Male, Female)
- [x] Xuất payload `public/data/analytics_overview.json` thành công

### Non-Functional
- Performance: Xử lý hơn 90,000 dòng trong vòng < 15 giây
- Data Integrity: Dữ liệu JSON hợp lệ, tổng tỷ lệ phần trăm các nhóm đạt 100%

## Output
- File kết quả: `public/data/analytics_overview.json` (27.7 KB, 90,910 personas)
- Script tái hiện: `scripts/preprocess_vietnam_personas.py`
