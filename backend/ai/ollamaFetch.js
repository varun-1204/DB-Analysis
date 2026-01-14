export async function askOllama(prompt) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek-coder:6.7b",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
        num_ctx: 8192,
        repeat_penalty: 1.1
      }
    })
  });

  if (!response.ok) {
    throw new Error("Ollama request failed");
  }

  const data = await response.json();
  return data.response.trim();
}
