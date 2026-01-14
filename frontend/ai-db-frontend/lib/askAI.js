export async function askAI({ question, role }) {
  const res = await fetch("http://localhost:3001/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question, role })
  });

  if (!res.ok) {
    throw new Error("Backend error");
  }

  return res.json();
}
