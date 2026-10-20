import json
import sys
import urllib.request
from pathlib import Path

import pyarrow.parquet as pq


ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
PARQUET_API = "https://huggingface.co/api/datasets/nvidia/Nemotron-Personas-Vietnam/parquet"
DATASET_API = "https://huggingface.co/api/datasets/nvidia/Nemotron-Personas-Vietnam"
EXPECTED_ROWS = 1_000_000


def download_file(url: str, destination: Path) -> None:
    partial_path = destination.with_suffix(destination.suffix + ".part")
    request = urllib.request.Request(url, headers={"User-Agent": "vietnam-personas-dashboard/1.0"})

    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            expected_size = response.headers.get("Content-Length")
            downloaded = 0

            with partial_path.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
                    downloaded += len(chunk)

            if expected_size and downloaded != int(expected_size):
                raise RuntimeError(
                    f"Downloaded size mismatch for {destination.name}: "
                    f"expected {expected_size}, got {downloaded}"
                )

        partial_path.replace(destination)
    except Exception:
        partial_path.unlink(missing_ok=True)
        raise


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    with urllib.request.urlopen(PARQUET_API, timeout=60) as response:
        parquet_manifest = json.load(response)
    with urllib.request.urlopen(DATASET_API, timeout=60) as response:
        dataset_metadata = json.load(response)

    parquet_urls = parquet_manifest["default"]["train"]
    expected_rows = dataset_metadata["cardData"]["dataset_info"]["splits"][0]["num_examples"]

    if expected_rows != EXPECTED_ROWS:
        raise RuntimeError(f"Expected {EXPECTED_ROWS:,} dataset rows, source reports {expected_rows:,}")

    row_count = 0
    for index, url in enumerate(parquet_urls):
        destination = RAW_DIR / f"train-{index:05d}-of-{len(parquet_urls):05d}.parquet"

        if destination.exists():
            try:
                rows = pq.ParquetFile(destination).metadata.num_rows
                print(f"[SKIP] {destination.name}: {rows:,} rows already downloaded")
            except Exception:
                print(f"[WARN] Removing invalid existing shard {destination.name}")
                destination.unlink()
                download_file(url, destination)
                rows = pq.ParquetFile(destination).metadata.num_rows
        else:
            print(f"[INFO] Downloading shard {index + 1}/{len(parquet_urls)}: {destination.name}")
            download_file(url, destination)
            rows = pq.ParquetFile(destination).metadata.num_rows
            print(f"[OK] {destination.name}: {rows:,} rows")

        row_count += rows

    if row_count != expected_rows:
        raise RuntimeError(f"Downloaded {row_count:,} rows; expected {expected_rows:,}")

    print(f"[SUCCESS] Verified {len(parquet_urls)} Parquet shards and {row_count:,} rows in {RAW_DIR}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"[ERROR] {error}", file=sys.stderr)
        sys.exit(1)
