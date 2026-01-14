import express from "express";
import { generateSQL } from "../ai/sqlgenerator.js";
import { executeQuery } from "../dbPoolManager.js";

const router = express.Router();

/**
 * POST /api/ask
 */
router.post("/ask", async (req, res) => {
  const { question, role } = req.body;

  if (!question) {
    return res.status(400).json({
      error: "Question is required"
    });
  }

  try {
    console.log("⏳ Generating SQL...");
    console.log("Role:", role);
    console.log("Question:", question);

    // ✅ NOW question & role exist
    const { database, sql } = await generateSQL(question, role);

    console.log("📦 Database:", database);
    console.log("✅ SQL:", sql);

    // Execute SQL on correct DB
    const data = await executeQuery(database, sql);

    res.json({
      sql,
      data,
      answer: {
        content: `Returned ${data.length} rows`
      }
    });

  } catch (err) {
    console.error("❌ BACKEND ERROR:", err.message);

    res.status(500).json({
      error: err.message
    });
  }
});

export default router;
