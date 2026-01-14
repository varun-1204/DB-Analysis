import { askOllama } from "./ollamaFetch.js";

/**
 * Explain DB query result in natural language or table format
 */
export async function explainResult(question, sql, rows) {

  // ✅ EMPTY RESULT HANDLING
  if (!rows || rows.length === 0) {
    return {
      type: "text",
      content: "No records were found that match your request."
    };
  }

  // Limit rows to avoid prompt overload
  const limitedRows = rows.slice(0, 20);

  const prompt = `
You are a helpful assistant.

User question:
"${question}"

Database result (JSON):
${JSON.stringify(limitedRows, null, 2)}

INSTRUCTIONS:
- Do NOT mention SQL or databases
- If there is only one record, explain in simple natural language
- If there are multiple records, format as a markdown table
- Return ONLY the answer
`;

  const response = await askOllama(prompt);

  // ✅ RETURN DATA (NOT res.json)
  return {
    type: response.includes("|") ? "table" : "text",
    content: response.trim()
  };
}
