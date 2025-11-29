import express from "express";
import cors from "cors";
import Bytez from "bytez.js";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "f416c90e373d70cf2112b8ad52b6b556";
const sdk = new Bytez(API_KEY);
const model = sdk.model("openai/gpt-4.1"); // Fast and latest GPT-4.1  


// ----------- API Endpoint -----------
app.post("/api/ai", async (req, res) => {
    try {
        const { systemPrompt, userText } = req.body;

        const start = Date.now();

        // Call Bytez SDK
        const { error, output } = await model.run([
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
        ]);

        const elapsed = ((Date.now() - start) / 1000).toFixed(2);

        if (error) return res.json({ error: error.message, time: elapsed });

        res.json({ output: output?.content || "No response", time: elapsed });

    } catch (err) {
        res.json({ error: err.message, time: 0 });
    }
});

app.listen(5000, () => console.log("🔥 Server running on http://localhost:5000"));
