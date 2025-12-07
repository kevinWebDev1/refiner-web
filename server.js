// backup-server.js (Bytez Version)
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Bytez from "bytez.js";

dotenv.config();

const app = express();
// const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ---------------------- MODEL ----------------------
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("❌ Missing API_KEY in .env");
    process.exit(1);
}

const sdk = new Bytez(API_KEY);
const model = sdk.model("openai/gpt-4.1"); // FAST, latest GPT-4.1

app.get("/", (_, res) => res.send("Refiner AI Backup (Bytez) – LIVE"));

// ---------------------- APP UPDATE ----------------------
app.get("/app-update", (req, res) => {
    const current = req.query.version || "1.0.0";
    const LATEST = "1.5.0";
    const UPDATE_URL = "https://refine-board-landing-page.vercel.app";

    const isNewer = (a, b) => {
        const ap = a.split('.').map(Number);
        const bp = b.split('.').map(Number);
        for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
            const av = ap[i] || 0;
            const bv = bp[i] || 0;
            if (av > bv) return true;
            if (av < bv) return false;
        }
        return false;
    };

    res.json({
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
});

// ---------------------- REFINE ----------------------
app.post("/refine", async (req, res) => {
    const userText = req.body.text?.trim();
    if (!userText) return res.status(400).json({ error: "Missing 'text'" });

    const systemPrompt = `
You are a keyboard text-refinement tool.

Condition If(native script):
Correct spelling without changing script.

Condition elseif(roman script):
Decode & correct heavily abbreviated text.
Fix grammar, spelling, clarity.
Preserve tone.
Return only the improved text.

User Input:
${userText}
    `.trim();

    try {
        const response = await model.run([
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
        ]);

        const refined = response.output?.content?.trim() || userText;

        res.json({ refinedText: refined });
    } catch (err) {
        const msg = err.message || "AI error";
        console.error("REFINE ERROR:", msg);
        res.status(502).json({ error: "AI failed", details: msg });
    }
});

// ---------------------- CHAT ----------------------
app.post("/chat", async (req, res) => {
    const userText = req.body.text?.trim();
    if (!userText) return res.status(400).json({ error: "Missing 'text'" });

    const systemPrompt = "Short direct answer. No extra fluff.";

    try {
        const response = await model.run([
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
        ]);

        const chatText = response.output?.content?.trim() || "No response";
        res.json({ chatText });
    } catch (err) {
        const msg = err.message || "AI error";
        console.error("CHAT ERROR:", msg);
        res.status(502).json({ error: "AI failed", details: msg });
    }
});

// // ---------------------- START ----------------------
// app.listen(PORT, () => {
//     console.log(`🔥 Bytez Backup Server LIVE at http://localhost:${PORT}`);
//     console.log(`Update Check: http://localhost:${PORT}/app-update?version=1.5.0`);
// });
