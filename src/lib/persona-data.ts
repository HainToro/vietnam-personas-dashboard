import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import { readdir } from "fs/promises";
import path from "path";

let instancePromise: Promise<DuckDBInstance> | null = null;

export async function withPersonaConnection<T>(
  callback: (connection: DuckDBConnection, parquetSource: string) => Promise<T>
): Promise<T> {
  const rawDirectory = path.join(process.cwd(), "data", "raw");
  const files = await readdir(rawDirectory);
  const shards = files.filter((file) => /^train-\d+-of-\d+\.parquet$/.test(file));

  if (shards.length !== 11) {
    throw new Error(`Cần đủ 11 shard Parquet; hiện có ${shards.length}. Hãy chạy \`npm run data:download\`.`);
  }

  instancePromise ??= DuckDBInstance.create(":memory:", { threads: "4" });
  const instance = await instancePromise;
  const connection = await instance.connect();
  const sourcePath = path.join(rawDirectory, "train-*-of-*.parquet").replace(/\\/g, "/");
  const parquetSource = `read_parquet('${sourcePath.replace(/'/g, "''")}')`;

  try {
    return await callback(connection, parquetSource);
  } finally {
    connection.closeSync();
  }
}
