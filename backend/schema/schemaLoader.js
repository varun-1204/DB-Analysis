import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dbRegistry from "../dbRegistry.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadSchema(dbName) {
  const entry = dbRegistry[dbName];
  if (!entry) {
    throw new Error(`❌ Schema not found for DB: ${dbName}`);
  }

  const schemaPath = path.join(__dirname, entry.schema);
  return JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
}
