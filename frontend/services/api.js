export async function askAI(question) {
  const res = await fetch("http://localhost:5000/api/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.details || "AI request failed");
  }

  return res.json();
}
