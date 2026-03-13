import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node db/run-sql.js <schema|seed>");
  process.exit(1);
}

const fileName = fileArg.endsWith(".sql") ? fileArg : `${fileArg}.sql`;
const sqlPath = path.resolve(process.cwd(), "db", fileName);

const run = async () => {
  const sql = await fs.readFile(sqlPath, "utf8");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    await pool.query(sql);
    console.log(`Executed ${fileName} successfully.`);
  } finally {
    await pool.end();
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
