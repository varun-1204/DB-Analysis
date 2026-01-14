/**
 * Validates JOINs in a SQL query using relationshipIndex
 */

export function validateJoins(sql, schema) {
  const relationshipIndex = schema.relationshipIndex;

  if (!relationshipIndex) {
    throw new Error("❌ relationshipIndex missing in schema");
  }

  // Normalize SQL
  const normalizedSQL = sql
    .replace(/\s+/g, " ")
    .toLowerCase();

  /**
   * Regex to extract JOIN conditions like:
   * JOIN table2 ON table1.col = table2.col
   */
  const joinRegex =
    /join\s+(\w+)\s+on\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/g;

  let match;
  const invalidJoins = [];

  while ((match = joinRegex.exec(normalizedSQL)) !== null) {
    const left = `${match[2]}.${match[3]}`;
    const right = `${match[4]}.${match[5]}`;

    const forward = relationshipIndex[left];
    const reverse = relationshipIndex[right];

    const isValid =
      forward === right || reverse === left;

    if (!isValid) {
      invalidJoins.push({ left, right });
    }
  }

  if (invalidJoins.length > 0) {
    return {
      valid: false,
      invalidJoins
    };
  }

  return { valid: true };
}
