export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ message: "Refiner AI POST /refine endpoint. Use POST with JSON." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Lazy import Bytez SDK
  let sdk, model;
  try {
    const Bytez = (await import("bytez.js")).default;
    sdk = new Bytez(process.env.API_KEY);
    model = sdk.model("openai/gpt-4.1");
  } catch (err) {
    console.error("SDK INIT ERROR:", err);
    return res.status(500).json({ error: "Failed to initialize SDK" });
  }

  // Parse JSON body
  let body = {};
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const userText = body.text?.trim();
  if (!userText) return res.status(400).json({ error: "Missing 'text'" });

  // System prompt
  const systemPrompt = `
You are a keyboard text-refinement AI.

• If native script → fix spelling only
• If roman script → decode abbreviations + fix grammar + preserve tone
• Return only improved text

User Input:
${userText}
  `.trim();

  try {
    const response = await model.run([
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ]);

    const refined = response.output?.content?.trim() || userText;
    return res.status(200).json({ refinedText: refined });
  } catch (err) {
    console.error("REFINE ERROR:", err.stack);
    return res.status(502).json({ error: "AI failed", details: err.message });
  }
}
