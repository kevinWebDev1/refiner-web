export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Lazy Bytez SDK import
  const Bytez = (await import("bytez.js")).default;
  const sdk = new Bytez(process.env.API_KEY);
  const model = sdk.model("openai/gpt-4.1");

  let body = {};
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const userText = body.text?.trim();
  if (!userText) return res.status(400).json({ error: "Missing 'text'" });

  const systemPrompt = "Short direct answer. No extra fluff.";

  try {
    const response = await model.run([
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ]);

    const chatText = response.output?.content?.trim() || "No response";
    return res.status(200).json({ chatText });
  } catch (err) {
    console.error("CHAT ERROR:", err.stack);
    return res.status(502).json({ error: "AI failed", details: err.message });
  }
}
