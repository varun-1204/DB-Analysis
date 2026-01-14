import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_FILE = path.join(__dirname, "queryMemory.json");

// Ensure file exists
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify([]));
}

/**
 * Load memory
 */
function loadMemory() {
  return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
}

/**
 * Save memory
 */
function saveMemory(memory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

/**
 * Store successful query
 */
export function storeQueryMemory({
  question,
  role,
  database,
  sql
}) {
  const memory = loadMemory();

  memory.push({
    question,
    role,
    database,
    sql,
    timestamp: new Date().toISOString()
  });

  // Keep memory size reasonable
  if (memory.length > 200) {
    memory.shift();
  }

  saveMemory(memory);
}

/**
 * Retrieve relevant past queries
 */
export function getRelevantMemories(question, role, database) {
  const memory = loadMemory();
  const q = question.toLowerCase();

  return memory
    .filter(m =>
      m.database === database &&
      m.role === role &&
      q.split(" ").some(word =>
        m.question.toLowerCase().includes(word)
      )
    )
    .slice(-3); // last 3 relevant
}
