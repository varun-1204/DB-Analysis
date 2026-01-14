export function validateSQL(sql) {
  const blocked = ["insert", "update", "delete", "drop", "alter", ";"];

  const lower = sql.toLowerCase();

  if (!lower.startsWith("select")) {
    throw new Error("Only SELECT queries are allowed");
  }

  for (const word of blocked) {
    if (lower.includes(word)) {
      throw new Error("Unsafe SQL detected");
    }
  }
}
