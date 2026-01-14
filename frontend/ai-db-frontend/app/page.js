"use client";

import { useState } from "react";
import { askAI } from "../lib/askAI";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [role, setRole] = useState("student"); // ✅ ROLE STATE
  const [answer, setAnswer] = useState("");
  const [data, setData] = useState([]);
  const [sql, setSql] = useState("");
  const [showSql, setShowSql] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setData([]);
    setSql("");
    setShowSql(false);
    setError("");

    try {
      // ✅ SEND ROLE + QUESTION
      const res = await askAI({
        question,
        role
      });

      // SQL
      setSql(res.sql || "");

      // Answer
      setAnswer(res.answer?.content || res.answer || "No answer generated");

      // Table data
      if (Array.isArray(res.data)) {
        setData(res.data);
      }
    } catch (err) {
      console.error("UI ERROR:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>AI Database Assistant</h1>

      {/* ROLE SELECTOR */}
      <label style={styles.label}>Select Role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={styles.select}
      >
        <option value="student">Student</option>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>

      <textarea
        placeholder="Ask a question about the database..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        style={styles.textarea}
      />

      <button onClick={handleAsk} disabled={loading} style={styles.button}>
        {loading ? "Thinking..." : "Ask"}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {answer && (
        <div style={styles.answerBox}>
          <h3>Answer</h3>
          <p>{answer}</p>
        </div>
      )}

      {sql && (
        <div style={styles.sqlBox}>
          <div style={styles.sqlHeader}>
            <h3>Generated SQL</h3>
            <button
              onClick={() => setShowSql(!showSql)}
              style={styles.toggleBtn}
            >
              {showSql ? "Hide SQL" : "Show SQL"}
            </button>
          </div>

          {showSql && <pre style={styles.sqlCode}>{sql}</pre>}
        </div>
      )}

      {data.length > 0 && (
        <div style={styles.tableBox}>
          <h3>Result</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} style={styles.th}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} style={styles.td}>{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

/* =======================
   STYLES
======================= */

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    background: "#0f172a",
    color: "#fff",
    borderRadius: "10px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "12px",
    fontSize: "15px",
    border: "none",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
  },
  button: {
    marginTop: "12px",
    padding: "10px 25px",
    fontSize: "16px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#000",
  },
  error: {
    marginTop: "15px",
    color: "#f87171",
  },
  answerBox: {
    marginTop: "30px",
    padding: "15px",
    background: "#020617",
    borderRadius: "8px",
  },
  sqlBox: {
    marginTop: "25px",
    padding: "15px",
    background: "#020617",
    borderRadius: "8px",
  },
  sqlHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: {
    background: "#38bdf8",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  sqlCode: {
    marginTop: "10px",
    padding: "12px",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#e5e7eb",
    fontSize: "14px",
    whiteSpace: "pre-wrap",
    overflowX: "auto",
  },
  tableBox: {
    marginTop: "25px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#020617",
  },
  th: {
    border: "1px solid #334155",
    padding: "8px",
    background: "#1e293b",
  },
  td: {
    border: "1px solid #334155",
    padding: "8px",
    textAlign: "center",
  },
};
