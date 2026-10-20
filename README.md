# Vietnam Personas Dashboard

Dashboard tiếng Việt để phân tích và khám phá bộ dữ liệu `nvidia/Nemotron-Personas-Vietnam`.

> Dataset gồm các persona **tổng hợp bằng AI**, được tạo theo những phân bố thực tế; đây không phải dữ liệu hồ sơ của người thật. Ghi công: NVIDIA, FPT Smart Cloud và Quantum AI & Cyber Security Institute (FPT Corporation), [nguồn dữ liệu trên Hugging Face](https://huggingface.co/datasets/nvidia/Nemotron-Personas-Vietnam), [giấy phép CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Dữ liệu

Nguồn Hugging Face có 1.000.000 persona trong 11 shard Parquet. Dung lượng tải hiện khoảng 2,25 GB; hãy đảm bảo máy còn đủ dung lượng trước khi tải. File nguồn được giữ local trong `data/raw/` và không đưa vào Git. Dashboard thống kê được xuất thành `public/data/analytics_overview.json`.

Thiết lập Python và tạo dữ liệu:

```powershell
python -m pip install pandas pyarrow
npm run data:download
npm run data:preprocess
```

Nếu cần chạy lại sau khi thay đổi pipeline, dùng `npm run data:preprocess`. Script tải có thể chạy lại an toàn: các shard Parquet hợp lệ đã có sẽ được giữ lại.

## Chạy ứng dụng

```powershell
npm install
npm run dev
```

Mở `http://localhost:3000`.

- `/`: KPI và biểu đồ tính từ toàn bộ dữ liệu; có thể kết hợp giới tính, khu vực cư trú, vùng miền và nhóm tuổi.
- `/personas`: tìm kiếm, lọc kết hợp theo giới tính, khu vực, vùng miền/tuổi và phân trang persona từ nguồn dữ liệu.
- `/api/v1/analytics/overview`: thống kê tổng quan theo bộ lọc.
- `/api/v1/personas`: danh sách persona có phân trang và tìm kiếm.

Hai API truy vấn Parquet local qua DuckDB. Vì vậy, trên môi trường triển khai cần cung cấp các file trong `data/raw/` (không được Git theo dõi) cùng với ứng dụng; nếu chưa tải dữ liệu, API sẽ báo rõ cần chạy lệnh tải.

## Công nghệ

- Next.js 14 App Router, React, TypeScript
- Tailwind CSS, Recharts, Lucide React
- DuckDB Node API truy vấn Parquet
- Python, pandas và PyArrow cho bước tổng hợp
