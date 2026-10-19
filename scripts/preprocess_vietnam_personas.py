import sys
import json
import os
import pandas as pd

# Fix Windows console utf-8 encoding
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def categorize_age(age):
    try:
        if pd.isna(age):
            return "Không xác định"
        val = int(age)
        if val < 18:
            return "<18"
        elif 18 <= val <= 24:
            return "18-24"
        elif 25 <= val <= 34:
            return "25-34"
        elif 35 <= val <= 49:
            return "35-49"
        else:
            return "50+"
    except Exception:
        return "Không xác định"

def compute_metrics_and_charts(sub_df):
    total = len(sub_df)
    if total == 0:
        return {}

    avg_age = round(float(sub_df["age"].dropna().mean()), 1)
    median_age = round(float(sub_df["age"].dropna().median()), 1)

    male_count = int((sub_df["sex"].str.lower() == "nam").sum())
    female_count = int((sub_df["sex"].str.lower() == "nữ").sum())
    urban_count = int((sub_df["zone"].str.lower() == "đô thị").sum())
    rural_count = int((sub_df["zone"].str.lower() == "nông thôn").sum())

    male_pct = round((male_count / total) * 100, 2)
    female_pct = round((female_count / total) * 100, 2)
    urban_pct = round((urban_count / total) * 100, 2)
    rural_pct = round((rural_count / total) * 100, 2)

    # Age distribution ordered
    age_order = ["<18", "18-24", "25-34", "35-49", "50+"]
    age_counts = sub_df["age_group"].value_counts().to_dict()
    age_dist = [
        {
            "range": grp,
            "count": int(age_counts.get(grp, 0)),
            "percentage": round((age_counts.get(grp, 0) / total) * 100, 2)
        }
        for grp in age_order
    ]

    def get_dist(column, top_n=None):
        counts = sub_df[column].dropna().value_counts()
        if top_n:
            counts = counts.head(top_n)
        return [
            {
                "name": str(idx),
                "count": int(val),
                "percentage": round((val / total) * 100, 2)
            }
            for idx, val in counts.items()
        ]

    return {
        "total_personas": total,
        "metrics": {
            "avg_age": avg_age,
            "median_age": median_age,
            "male_count": male_count,
            "female_count": female_count,
            "male_percentage": male_pct,
            "female_percentage": female_pct,
            "urban_count": urban_count,
            "rural_count": rural_count,
            "urban_percentage": urban_pct,
            "rural_percentage": rural_pct
        },
        "charts": {
            "age_distribution": age_dist,
            "marital_status": get_dist("marital_status"),
            "education_level": get_dist("education_level"),
            "zone": get_dist("zone"),
            "region": get_dist("region"),
            "top_occupations": get_dist("occupation", top_n=15)
        }
    }

def main():
    print("[INFO] Đang tải và xử lý dữ liệu từ nvidia/Nemotron-Personas-Vietnam...")
    parquet_url = "https://huggingface.co/api/datasets/nvidia/Nemotron-Personas-Vietnam/parquet/default/train/0.parquet"
    
    cols = ["sex", "age", "marital_status", "education_level", "occupation", "zone", "region"]
    
    try:
        df = pd.read_parquet(parquet_url, columns=cols)
        print(f"[OK] Đã tải thành công {len(df):,} dòng từ file 0.parquet.")
    except Exception as e:
        print(f"[ERROR] Không thể đọc trực tiếp từ Hugging Face ({e}).")
        sys.exit(1)

    # Chuẩn hoá dữ liệu
    for col in ["sex", "marital_status", "education_level", "occupation", "zone", "region"]:
        df[col] = df[col].astype(str).str.strip()
    
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df["age_group"] = df["age"].apply(categorize_age)

    # 1. Toàn bộ dataset
    print("[INFO] Đang tính toán phân bố tổng thể (All)...")
    overview_all = compute_metrics_and_charts(df)

    # 2. Phân đoạn Cross-filtering
    print("[INFO] Đang tính toán các phân đoạn (Urban, Rural, Male, Female)...")
    segments = {
        "urban": compute_metrics_and_charts(df[df["zone"].str.lower() == "đô thị"]),
        "rural": compute_metrics_and_charts(df[df["zone"].str.lower() == "nông thôn"]),
        "male": compute_metrics_and_charts(df[df["sex"].str.lower() == "nam"]),
        "female": compute_metrics_and_charts(df[df["sex"].str.lower() == "nữ"])
    }

    payload = {
        "dataset_name": "nvidia/Nemotron-Personas-Vietnam",
        "total_personas": overview_all["total_personas"],
        "metrics": overview_all["metrics"],
        "charts": overview_all["charts"],
        "segments": segments
    }

    # Xuất ra public/data/analytics_overview.json
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "analytics_overview.json")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"[SUCCESS] Đã lưu dữ liệu phân tích tại: {output_file}")
    print(f"Tổng số personas xử lý: {overview_all['total_personas']:,}")
    print(f"Độ tuổi trung bình: {overview_all['metrics']['avg_age']} tuổi")
    print(f"Tỷ lệ Giới tính: {overview_all['metrics']['male_percentage']}% Nam / {overview_all['metrics']['female_percentage']}% Nữ")
    print(f"Tỷ lệ Khu vực: {overview_all['metrics']['urban_percentage']}% Đô thị / {overview_all['metrics']['rural_percentage']}% Nông thôn")

if __name__ == "__main__":
    main()
