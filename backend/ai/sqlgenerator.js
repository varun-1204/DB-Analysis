
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { askOllama } from "./ollamaFetch.js";
import { validateJoins } from "./joinValidator.js";
import { getRelevantMemories } from "../rag/queryMemory.js";




/* ------------------------------------------------------------------
   ESM-safe __dirname
------------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registryPath = path.join(__dirname, "../dbRegistry.json");
const dbRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
/* ------------------------------------------------------------------
   Load schema dynamically by DB name
------------------------------------------------------------------- */
function loadSchema(dbName) {
  const entry = dbRegistry[dbName];
  if (!entry) {
    throw new Error(`❌ Unknown database: ${dbName}`);
  }

  const schemaPath = path.join(__dirname, "../schema", entry.schema);
  return JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
}
// 🔁 Retrieve relevant past queries (RAG)
const memories = getRelevantMemories(question, role, dbName);

let memoryPrompt = "";
if (memories.length > 0) {
  memoryPrompt = `
PREVIOUS SUCCESSFUL QUERIES (LEARN FROM THESE):
${memories.map(m => `
Question: ${m.question}
SQL: ${m.sql}
`).join("\n")}
`;
}


/* ------------------------------------------------------------------
   Convert ENTITY-based schema into prompt-friendly text
------------------------------------------------------------------- */
function schemaToPrompt(schema) {
  let prompt = "";

  for (const tableName in schema.tables) {
    const table = schema.tables[tableName];

    prompt += `Table: ${tableName}\n`;
    prompt += `Entity: ${table.entity}\n`;

    prompt += "Columns:\n";
    for (const col in table.columns) {
      prompt += `- ${col} (${table.columns[col]})\n`;
    }

    if (table.primaryKey?.column) {
      prompt += `Primary Key:\n- ${table.primaryKey.column}\n`;
    }

    const fks = table.foreignKeys || {};
    if (Object.keys(fks).length > 0) {
      prompt += "Foreign Keys:\n";
      for (const col in fks) {
        prompt += `- ${col} -> ${fks[col].referencesEntity}\n`;
      }
    }

    prompt += "\n";
  }

  return prompt;
}

/* ------------------------------------------------------------------
   Safe JSON extractor
------------------------------------------------------------------- */
function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function chooseDatabaseDeterministic(question) {
  const q = question.toLowerCase();

  // simple keyword-based routing (expand later)
  if (q.includes("coder") || q.includes("contest")) {
    return "coderv3_feb2025";
  }

  // default DB
  return "ai_models";
}



/* ------------------------------------------------------------------
   STEP 2: Generate SQL for selected DB
------------------------------------------------------------------- */
export async function generateSQL(question) {
  // 1️⃣ Choose DB
  const dbName = await chooseDatabaseDeterministic(question);

  // 2️⃣ Load schema
  const schema = loadSchema(dbName);

  // 3️⃣ Build prompt
  const prompt = `
You are a PROFESSIONAL MySQL SQL GENERATOR.

DATABASE: ${dbName}

STRICT RULES:
- Use ONLY the provided schema
- Generate SQL for THIS database ONLY
- ONLY SELECT queries allowed
- NEVER invent tables or columns
- NEVER join without defined relationships
- Output ONLY valid JSON

FORMAT:
{ "sql": "SELECT ..." }

DATABASE SCHEMA:
${schemaToPrompt(schema)}

USER QUESTION:
${question}
`;

  const response = await askOllama(prompt);
  const parsed = extractJSON(response);

  if (!parsed || !parsed.sql) {
    console.error("RAW LLM OUTPUT:\n", response);
    throw new Error("❌ Invalid SQL JSON from LLM");
  }

  const sql = parsed.sql.trim();
  // ✅ Validate joins AFTER SQL is generated
const validation = validateJoins(sql, schema);

if (!validation.valid) {
  throw new Error(
    "❌ Invalid JOIN detected: " +
    JSON.stringify(validation.invalidJoins)
  );
}


  // Extra safety
  if (/\b(insert|update|delete|drop|alter|truncate|create)\b/i.test(sql)) {
    throw new Error("❌ Unsafe SQL detected");
  }

  return {
    database: dbName,
    sql
  };
}
