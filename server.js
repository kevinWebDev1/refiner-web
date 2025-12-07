import express from "express";
import cors from "cors";
import Bytez from "bytez.js";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("❌ Missing API_KEY");
    process.exit(1);
}

const sdk = new Bytez(API_KEY);
const model = sdk.model("openai/gpt-4.1");

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Bytez AI API is running",
        timestamp: Date.now()
    });
});

app.post("/api/ai", async (req, res) => {
    try {
        const { systemPrompt, userText } = req.body;

        if (!systemPrompt || !userText) {
            return res.json({ error: "systemPrompt and userText are required" });
        }

        const start = Date.now();

        const response = await model.run([
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
        ]);

        const elapsed = ((Date.now() - start) / 1000).toFixed(2);

        if (response.error) {
            return res.json({ error: response.error.message, time: elapsed });
        }

        res.json({
            output: response.output?.content || "No response",
            time: elapsed
        });

    } catch (err) {
        res.json({ error: err.message, time: 0 });
    }
});

app.listen(5000, () => console.log("🔥 Server running on http://localhost:5000"));
