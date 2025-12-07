import Bytez from "bytez.js";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("❌ Missing API_KEY in .env");
}

const sdk = new Bytez(API_KEY);
const model = sdk.model("openai/gpt-4.1"); // Latest GPT-4.1

export default async function handler(req, res) {
  const { url, method } = req;

  // ---------------------- ROOT ----------------------
  if (url === "/" && method === "GET") {
    return res.status(200).send("Refiner AI Backup (Bytez) – LIVE");
  }

  // ---------------------- APP UPDATE ----------------------
  if (url.startsWith("/app-update") && method === "GET") {
    const current = req.query.version || "1.0.0";
    const LATEST = "1.5.0";
    const UPDATE_URL = "https://refine-board-landing-page.vercel.app";

    const isNewer = (a, b) => {
      const ap = a.split(".").map(Number);
      const bp = b.split(".").map(Number);
      for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
        const av = ap[i] || 0;
        const bv = bp[i] || 0;
        if (av > bv) return true;
        if (av < bv) return false;
      }
      return false;
    };

    return res.status(200).json({
      updateAvailable: isNewer(LATEST, current),
      latestVersion: LATEST,
      forceUpdate: false,
      updateUrl: UPDATE_URL,
      changelog: `🚀 New Features in v1.3.0:

• 🔢 DEDICATED NUMBER PAD
• 🎯 SMART KEYBOARD FLOW
• ⚡ ENHANCED SYMBOLS
• 🎨 IMPROVED UI
• 🛠️ PERFORMANCE
• 🐛 BUG FIXES

Previous:
• AI Commands • Smart Translation • Enhanced Refine • UI/UX Fixes`
    });
  }

  // ---------------------- REFINE ----------------------
  if (url === "/refine" && method === "POST") {
    const body = await getJson(req);
    const userText = body.text?.trim();
    if (!userText) return res.status(400).json({ error: "Missing 'text'" });

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
      console.error("REFINE ERROR:", err.message);
      return res.status(502).json({ error: "AI failed", details: err.message });
    }
  }

  // ---------------------- CHAT ----------------------
  if (url === "/chat" && method === "POST") {
    const body = await getJson(req);
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
      console.error("CHAT ERROR:", err.message);
      return res.status(502).json({ error: "AI failed", details: err.message });
    }
  }

  // ---------------------- NOT FOUND ----------------------
  return res.status(404).json({ error: "Route not found" });
}

// ---------------------- Helper: parse JSON ----------------------
async function getJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", err => reject(err));
  });
}
